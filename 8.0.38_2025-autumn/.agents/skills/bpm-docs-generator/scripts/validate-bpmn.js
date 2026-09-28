#!/usr/bin/env node
/*
 * validate-bpmn.js - BPMN validator for import-time checks.
 *
 * Usage:
 *   {{RUNTIME}} <このスクリプトのパス> <diagram.bpmn>
 *   {{RUNTIME}} <このスクリプトのパス> <diagram.bpmn> --rules validate-bpmn.rules.json
 *
 * Checks:
 *   [input] --rules で定義したプロパティ入力ルールのチェック
 *           - required / conditional required / required group
 *           - format / max length / invalid values
 *           - required prefix / invalid prefix / required without prefix
 *           - when（activiti:type 等の属性値による対象要素の絞り込み）
 *           - forEach（activiti:field[name^=prefix] / activiti:in,out 等の繰り返し子要素）
 *           - field(name) / value パスセグメント（activiti:field 配下の値参照）
 *           - errorRef / messageRef / signalRef のように bpmn-moddle が参照解決に失敗する
 *             属性は、パース時の警告から生値を復元して required / format を評価する
 *   [model] BPMN モデル自体の構造・整合性チェック
 *           - BPMN XML parse and warning/error pickup
 *           - StartEvent / SubProcess / EventSubProcess rules
 *           - SequenceFlow source/target/scope rules
 *           - Gateway default flow consistency / 出力フロー存在チェック
 *           - DI / Message / Signal reference integrity
 *           - ServiceTask implementation attribute consistency
 *           - TimerEventDefinition の必須入力・businessCalendarName 整合チェック
 *           - 同一 extensionElements 内での activiti:field name 重複チェック
 */

const fs = require('fs');
const BpmnModdle = require('bpmn-moddle');
const { nsType, findElements } = require('./bpmn-doc-utils');

/**
 * 概要: BPMN モデルの制約定義
 */
const CONSTRAINTS = {
  BPMN_MODEL_TARGET_NAMESPACE_MAX_LENGTH: 255,
  PROCESS_DEFINITION_ID_MAX_LENGTH: 44,
  PROCESS_DEFINITION_NAME_MAX_LENGTH: 255
};

/**
 * 概要: デフォルトの入力ルール定義
 */
const DEFAULT_INPUT_RULES = [
  {
    id: 'definitions.targetNamespace',
    selector: 'bpmn:Definitions',
    path: 'targetNamespace',
    label: 'targetNamespace',
    rule: {
      required: true,
      format: '^\\S+$',
      maxLength: CONSTRAINTS.BPMN_MODEL_TARGET_NAMESPACE_MAX_LENGTH,
      requiredPrefix: ['http://', 'https://'],
      invalidPrefix: ['urn:']
    }
  },
  {
    id: 'process.id',
    selector: 'bpmn:Process',
    path: 'id',
    label: 'process id',
    rule: {
      required: true,
      format: '^[A-Za-z_][A-Za-z0-9_\\-.]*$',
      maxLength: CONSTRAINTS.PROCESS_DEFINITION_ID_MAX_LENGTH,
      invalidPrefix: ['tmp_'],
      requiredWithoutPrefix: true
    }
  },
  {
    id: 'process.name.conditionalRequired',
    selector: 'bpmn:Process',
    path: 'name',
    label: 'process name',
    rule: {
      requiredIf: {
        path: 'isExecutable',
        equals: true
      },
      maxLength: CONSTRAINTS.PROCESS_DEFINITION_NAME_MAX_LENGTH
    }
  },
  {
    id: 'serviceTask.implementation.requiredGroup',
    selector: 'bpmn:ServiceTask',
    path: 'activiti:class',
    label: 'service task implementation',
    rule: {
      requiredGroup: [
        'activiti:class',
        'activiti:delegateExpression',
        'activiti:expression',
        'activiti:type'
      ]
    }
  },
  {
    id: 'serviceTask.delegateExpression.prefix',
    selector: 'bpmn:ServiceTask',
    path: 'activiti:delegateExpression',
    label: 'service task delegateExpression',
    rule: {
      requiredPrefix: ['${'],
      invalidPrefix: ['#{']
    }
  }
];

// nsType / findElements は bpmn-doc-utils.js に集約している
// （search-called-elements.js / validate-process-key-replacement.js と共通）。

/**
 * 概要: 値を真偽値として解釈する
 * @param {*} value チェックする値
 * @returns {boolean} 真偽値
 */
function parseBooleanAttr(value) {
  return value === true || value === 'true';
}

/**
 * 概要: BPMN 要素の参照から ID を取得する
 * @param {*} ref BPMN 要素の参照
 * @returns {string|null} 参照の ID または null
 */
function getRefId(ref) {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;
  return ref.id || null;
}

/**
 * 概要: 値が空かどうかを判定する
 * @param {*} value チェックする値
 * @returns {boolean} 値が空かどうか
 */
function isEmptyValue(value) {
  return typeof value === 'undefined' || value === null || value === '';
}

/**
 * 概要: bpmn-moddle の参照解決に失敗した属性の生値を保持するインデックス
 *  - key: BPMN 要素インスタンス、value: Map<プロパティ名, 警告オブジェクト>
 *  - errorRef / messageRef / signalRef のように IDREF として解釈される属性は、参照先が
 *    解決できない場合に属性値自体が失われるため、moddle が出力する「unresolved reference」
 *    警告から生値を復元して入力ルール検証に利用する。
 */
let rawRefIndex = new Map();

/**
 * 概要: 未解決参照であっても警告対象としないプロパティ名の一覧
 *  - itemSubjectRef は xsd:string 等、BPMN 文書内で定義されない外部スキーマ型を正当に参照するために
 *    使われるため、bpmn-moddle が参照解決に失敗しても実害はなく、警告を出さない。
 */
const IGNORED_UNRESOLVED_REF_PROPERTIES = new Set(['itemSubjectRef']);

/**
 * 概要: moddle パース時に取得したモデル警告の一覧（未消費分のみ最終的に WARN として出力する）
 */
let pendingModelWarnings = [];

/**
 * 概要: 未解決参照の警告一覧からプロパティ生値の逆引きインデックスを構築する
 * @param {Array} warnings moddle パース時の警告配列
 * @returns {Map} 生値インデックス
 */
function buildRawRefIndex(warnings) {
  const index = new Map();
  for (const warning of warnings) {
    if (!warning || !warning.element || !warning.property) continue;
    if (!/^unresolved reference/.test(warning.message || '')) continue;

    const propName = String(warning.property).indexOf(':') >= 0
      ? warning.property.split(':').pop()
      : warning.property;

    if (IGNORED_UNRESOLVED_REF_PROPERTIES.has(propName)) {
      warning.consumed = true;
      continue;
    }

    if (!index.has(warning.element)) index.set(warning.element, new Map());
    index.get(warning.element).set(propName, warning);
  }
  return index;
}

/**
 * 概要: 未消費のモデル警告を ValidationResult へ反映する
 *  - 入力ルール検証で生値を参照済み（consumed）の警告は、個別の input チェック結果に
 *    置き換わっているため、ここでは出力しない。
 * @param {ValidationResult} result バリデーション結果を格納するオブジェクト
 */
function flushModelWarnings(result) {
  for (const warning of pendingModelWarnings) {
    if (warning.consumed) continue;
    const msg = warning && warning.message ? warning.message : String(warning);
    result.warn('model', msg);
  }
}

/**
 * 概要: BPMN 要素配下の extensionElements.values を取得する
 * @param {Object} element BPMN 要素
 * @returns {Array} extensionElements 配下の要素配列
 */
function getExtensionValues(element) {
  return element && element.extensionElements && Array.isArray(element.extensionElements.values)
    ? element.extensionElements.values
    : [];
}

/**
 * 概要: extensionElements 配下から activiti:field を name 属性で検索する
 * @param {Object} element BPMN 要素
 * @param {string} name activiti:field の name 属性値
 * @returns {Object|null} 見つかった activiti:field 要素、なければ null
 */
function findExtensionField(element, name) {
  return getExtensionValues(element).find(v => nsType(v) === 'field' && v.name === name) || null;
}

/**
 * 概要: extensionElements 配下から name 属性が指定の接頭辞で始まる activiti:field を検索する
 * @param {Object} element BPMN 要素
 * @param {string} prefix name 属性の接頭辞
 * @returns {Array} 見つかった activiti:field 要素の配列
 */
function findExtensionFieldsByPrefix(element, prefix) {
  return getExtensionValues(element).filter(
    v => nsType(v) === 'field' && typeof v.name === 'string' && v.name.indexOf(prefix) === 0
  );
}

/**
 * 概要: extensionElements 配下から指定タイプの要素を検索する（例: activiti:in / activiti:out）
 * @param {Object} element BPMN 要素
 * @param {string} type 検索対象のタイプ（'activiti:in' 等）
 * @returns {Array} 見つかった要素の配列
 */
function findExtensionElementsByType(element, type) {
  const target = type && type.indexOf(':') >= 0 ? type.split(':')[1] : type;
  return getExtensionValues(element).filter(v => nsType(v) === target);
}

/**
 * 概要: activiti:field / activiti:in 等の子要素からルール検証用のサブターゲット一覧を解決する
 * @param {Object} element BPMN 要素
 * @param {Object} forEach forEach 設定（extensionFieldPrefix または extensionType のいずれか）
 * @returns {Array} サブターゲット要素の配列
 */
function resolveForEachTargets(element, forEach) {
  if (!forEach) return null;
  if (forEach.extensionFieldPrefix) {
    return findExtensionFieldsByPrefix(element, forEach.extensionFieldPrefix);
  }
  if (forEach.extensionType) {
    return findExtensionElementsByType(element, forEach.extensionType);
  }
  return null;
}

/**
 * 概要: 要素自身、または直近の id を持つ祖先要素から表示用ラベルを生成する
 *  - 同一ルールに複数要素が一致した場合に、どのインスタンスのエラーかを判別するために使用する
 * @param {Object} element BPMN 要素
 * @returns {string} 表示用ラベル（例: 'ServiceTask#service-task_1'）
 */
function describeElement(element) {
  let node = element;
  while (node && isEmptyValue(node.id) && node.$parent) {
    node = node.$parent;
  }
  if (!node) return '';
  const type = nsType(node) || (element && nsType(element)) || '';
  return node.id ? `${type}#${node.id}` : type;
}

/**
 * 概要: 入力ルールの when 条件（属性値による絞り込み）を満たすか判定する
 * @param {Object} element BPMN 要素
 * @param {Object} when when 条件（{ path: expectedValue または expectedValue[] } 形式）
 * @returns {boolean} 条件を満たす場合は true（未指定時も true）
 */
function matchesWhen(element, when) {
  if (!when || typeof when !== 'object') return true;
  return Object.keys(when).every(path => {
    const expected = when[path];
    const actual = getAttrValue(element, path);
    if (Array.isArray(expected)) return expected.includes(actual);
    return actual === expected;
  });
}

/**
 * 概要: IM-BPM のタイマー用 businessCalendarName ミニ DSL をトークン分解する
 *  - 形式: "KEY1:VALUE1_###_#KEY2:VALUE2_###_#..."
 * @param {string} value activiti:businessCalendarName の属性値
 * @returns {Object} キー・値のマップ
 */
function parseBusinessCalendarTokens(value) {
  if (typeof value !== 'string' || !value) return {};
  const map = {};
  for (const token of value.split('_###_#')) {
    const idx = token.indexOf(':');
    if (idx < 0) continue;
    map[token.slice(0, idx)] = token.slice(idx + 1);
  }
  return map;
}

/**
 * 概要: コマンドライン引数をパースする
 * @param {Array} argv コマンドライン引数の配列
 * @returns {Object} パースされた引数オブジェクト
 */
function parseArgs(argv) {
  const args = {
    bpmnPath: null,
    rulesPath: null
  };
  const usage = 'Usage: {{RUNTIME}} ' + require('path').basename(__filename) + ' <diagram.bpmn> [--rules rules.json]';

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!args.bpmnPath && !a.startsWith('--')) {
      args.bpmnPath = a;
      continue;
    }

    if (a === '--rules') {
      if (i + 1 >= argv.length) throw new Error('No rules file has been specified.\r\n' + usage);
      args.rulesPath = argv[++i];
      continue;
    }

    throw new Error(`An unknown argument was specified.:${a}\r\n` + usage);
  }

  if (!args.bpmnPath) {
    throw new Error('No BPMN file has been specified.\r\n' + usage);
  }

  return args;
}

/**
 * 概要: 入力ルールを JSON ファイルから読み込む
 * @param {string} filePath 入力ルールのファイルパス
 * @returns {Array} 入力ルールの配列
 */
function readInputRules(filePath) {
  if (!filePath) return DEFAULT_INPUT_RULES;

  const text = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error('--rules JSON must be an array');
  }

  return parsed;
}

/**
 * 概要: 入力ルールの format を正規表現に変換する
 * @param {Object} rule 入力ルールのエントリ
 * @returns {Object} 正規表現に変換されたルールオブジェクト
 */
function normalizeRuleRegex(rule) {
  if (!rule || !rule.format || rule.format instanceof RegExp) return rule;
  return {
    ...rule,
    format: new RegExp(rule.format)
  };
}

/**
 * 概要: BPMN 要素から指定パスの属性値を取得する
 * @param {Object} element BPMN 要素
 * @param {string} path 属性のパス文字列
 * @returns {*} 属性の値
 */
function getAttrValue(element, path) {
  if (!element || !path) return undefined;
  const segments = String(path).split('.');
  let current = element;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (current == null) return undefined;

    /* activiti:field 参照（forEach 未使用の単一フィールド参照用） */
    const fieldMatch = /^field\(([^)]+)\)$/.exec(segment);
    if (fieldMatch) {
      current = findExtensionField(current, fieldMatch[1]);
      continue;
    }

    /* activiti:field / activiti:string,expression 等の子要素テキスト値 */
    if (segment === 'value' && current && Array.isArray(current.$children)) {
      current = current.$children.length > 0 ? current.$children[0].$body : undefined;
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(current, segment)) {
      current = current[segment];
      continue;
    }

    if (current.$attrs && Object.prototype.hasOwnProperty.call(current.$attrs, segment)) {
      current = current.$attrs[segment];
      continue;
    }

    if (segment === 'text' && typeof current.body === 'string') {
      current = current.body;
      continue;
    }

    // プロパティ自体が存在しない場合も、単一セグメントのパスであれば未解決参照の生値を確認する
    if (segments.length === 1) {
      const raw = getRawRefValue(element, segment);
      if (!isEmptyValue(raw)) return raw;
    }

    return undefined;
  }

  if (current && typeof current === 'object' && typeof current.id === 'string') return current.id;

  /* bpmn-moddle が参照解決に失敗した属性（errorRef 等）の生値を復元する */
  if (isEmptyValue(current) && segments.length === 1) {
    const raw = getRawRefValue(element, segments[0]);
    if (!isEmptyValue(raw)) return raw;
  }

  return current;
}

/**
 * 概要: 未解決参照の生値インデックスから、指定要素・プロパティの生値を取得する
 *  - 取得できた場合、該当の moddle 警告は「消費済み」として扱い、汎用モデル警告出力を抑制する
 * @param {Object} element BPMN 要素
 * @param {string} propName プロパティ名（ネームスペース接頭辞なし）
 * @returns {*} 生値。見つからない場合は undefined
 */
function getRawRefValue(element, propName) {
  const refs = rawRefIndex.get(element);
  const warning = refs && refs.get(propName);
  if (!warning) return undefined;
  warning.consumed = true;
  return warning.value;
}

/**
 * 概要: 条件付き必須を適用すべきか判定する
 * @param {Object} rule 入力ルールのエントリ
 * @param {Object} element BPMN 要素
 * @returns {boolean} 適用すべき場合は true を返す
 */
function shouldApplyConditionalRequired(rule, element) {
  if (!rule) return false;

  if (!rule.requiredIf) return false;

  const requiredIf = rule.requiredIf;
  if (typeof requiredIf === 'boolean') return requiredIf;
  if (typeof requiredIf !== 'object') return false;

  const target = getAttrValue(element, requiredIf.path);
  if (Object.prototype.hasOwnProperty.call(requiredIf, 'equals')) {
    const expected = requiredIf.equals;
    if (expected === true || expected === false) {
      return parseBooleanAttr(target) === expected;
    }
    return target === expected;
  }

  return !isEmptyValue(target);
}

/**
 * 概要: 接頭辞なしの必須条件を適用すべきか判定する
 * @param {Object} rule 入力ルールのエントリ
 * @param {Object} element BPMN 要素
 * @returns {boolean} 適用すべき場合は true を返す
 */
function shouldApplyRequiredWithoutPrefix(rule, element) {
  if (!rule) return false;

  if (typeof rule.requiredWithoutPrefix === 'function') {
    return !!rule.requiredWithoutPrefix(element);
  }

  if (typeof rule.requiredWithoutPrefix === 'boolean') {
    return rule.requiredWithoutPrefix;
  }

  if (rule.requiredWithoutPrefixIf && typeof rule.requiredWithoutPrefixIf === 'object') {
    return shouldApplyConditionalRequired({ requiredIf: rule.requiredWithoutPrefixIf }, element);
  }

  return false;
}

/**
 * 概要: 属性が XML 上に明示的に記載されているか（値の空/非空は問わない）を判定する
 *  - activiti:version のように moddle のスキーマに未登録な属性は、省略時は要素の own property にも
 *    $attrs にも現れないため、値が空かどうかの判定（isEmptyValue）だけでは「省略」と「空文字を明記」を
 *    区別できない。requiredIfPresent ルールはこの区別が必要なため専用の判定関数を用意する。
 * @param {Object} element BPMN 要素
 * @param {string} path 属性のパス文字列（単一セグメントのみ対応）
 * @returns {boolean} 属性が明示的に記載されている場合は true
 */
function isAttrExplicitlyPresent(element, path) {
  if (!element || !path) return false;
  const segments = String(path).split('.');
  if (segments.length > 1) return true;

  const segment = segments[0];
  const fieldMatch = /^field\(([^)]+)\)$/.exec(segment);
  if (fieldMatch) {
    return !!findExtensionField(element, fieldMatch[1]);
  }

  if (Object.prototype.hasOwnProperty.call(element, segment)) return true;
  if (element.$attrs && Object.prototype.hasOwnProperty.call(element.$attrs, segment)) return true;

  return false;
}

/**
 * 概要: 文字列から接頭辞を除去する
 * @param {string} value 接頭辞を含む文字列
 * @returns {string} 接頭辞を除去した文字列
 */
function removePrefix(value) {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/^[^:]+:/, '');
}

/**
 * 概要: 入力ルールを要素に対して検証する
 * @param {Object} element BPMN 要素
 * @param {Object} entry 入力ルールのエントリ
 * @param {Object} result 検証結果オブジェクト
 */
function validateInputRuleOnElement(element, entry, result) {
  const rule = normalizeRuleRegex(entry.rule || {});
  const baseLabel = entry.label || entry.path || 'value';
  const instanceDesc = describeElement(element);
  const label = instanceDesc ? `${baseLabel} (${instanceDesc})` : baseLabel;
  const ctx = `input(${entry.id || baseLabel})`;
  const inputValue = getAttrValue(element, entry.path);

  if (typeof rule.requiredIf === 'function') {
    result.error(ctx, `${label} requiredIf function is not supported; use boolean or object`);
    return;
  }

  /* 必須チェック */
  if (rule.required === true) {
    if (isEmptyValue(inputValue)) {
      result.error(ctx, `${label} is required`);
      return;
    }
  }

  /* 属性が明記されている場合のみ必須とするチェック（省略時はエラーにしない） */
  if (rule.requiredIfPresent === true) {
    if (isAttrExplicitlyPresent(element, entry.path) && isEmptyValue(inputValue)) {
      result.error(ctx, `${label} is required`);
      return;
    }
  }

  /* 条件付き必須チェック */
  if (shouldApplyConditionalRequired(rule, element)) {
    if (isEmptyValue(inputValue)) {
      result.error(ctx, `${label} is conditionally required`);
      return;
    }
  }

  /* 禁止値チェック（例: プレースホルダのみで実質未入力とみなす値） */
  if (Array.isArray(rule.invalidValues) && rule.invalidValues.length > 0 && !isEmptyValue(inputValue)) {
    const stringValue = String(inputValue).trim();
    if (rule.invalidValues.includes(stringValue)) {
      result.error(ctx, `${label} must not be one of: ${rule.invalidValues.join(', ')}`);
      return;
    }
  }

  /* 相関必須チェック */
  if (Array.isArray(rule.requiredGroup) && rule.requiredGroup.length > 0) {
    let hasAny = false;
    for (const groupPath of rule.requiredGroup) {
      const groupValue = getAttrValue(element, groupPath);
      if (!isEmptyValue(groupValue)) {
        hasAny = true;
        break;
      }
    }

    if (!hasAny) {
      result.error(ctx, `at least one value is required in group: ${rule.requiredGroup.join(', ')} (${instanceDesc})`);
      return;
    }
  }

  /* 形式チェック */
  if (rule.format && !isEmptyValue(inputValue)) {
    const stringValue = String(inputValue);

    // /g フラグ付き RegExp の副作用回避
    rule.format.lastIndex = 0;
    if (!rule.format.test(stringValue)) {
      result.error(ctx, `${label} violates format constraint`);
      return;
    }
  }

  /* 最大長チェック */
  if (rule.maxLength && rule.maxLength > 0 && !isEmptyValue(inputValue)) {
    const stringValue = String(inputValue);

    if (stringValue.length > rule.maxLength) {
      result.error(ctx, `${label} must be <= ${rule.maxLength} chars`);
      return;
    }
  }

  /* 接頭辞必須チェック */
  if (Array.isArray(rule.requiredPrefix) && rule.requiredPrefix.length > 0 && !isEmptyValue(inputValue)) {
    const stringValue = String(inputValue).trim();
    const matched = rule.requiredPrefix.some(prefix => stringValue.startsWith(prefix));
    if (!matched) {
      result.error(ctx, `${label} must start with one of: ${rule.requiredPrefix.join(', ')}`);
      return;
    }
  }

  /* 接頭辞禁止チェック */
  if (Array.isArray(rule.invalidPrefix) && rule.invalidPrefix.length > 0 && !isEmptyValue(inputValue)) {
    const stringValue = String(inputValue).trim();
    const blocked = rule.invalidPrefix.find(prefix => stringValue.startsWith(prefix));
    if (blocked) {
      result.error(ctx, `${label} must not start with: ${blocked}`);
      return;
    }
  }

  /* 接頭辞除去後の必須チェック */
  if (shouldApplyRequiredWithoutPrefix(rule, element)) {
    if (isEmptyValue(inputValue)) {
      result.error(ctx, `${label} is required`);
      return;
    }

    const stripped = removePrefix(String(inputValue));
    if (isEmptyValue(stripped)) {
      result.error(ctx, `${label} must not be empty after prefix removal`);
      return;
    }
  }
}

/**
 * 概要: 入力ルールを検証する
 * @param {Object} definitions BPMN 定義要素
 * @param {Array} rules 入力ルールの配列
 * @param {Object} result 検証結果オブジェクト
 */
function validateInputRules(definitions, rules, result) {
  for (const entry of rules) {
    if (!entry || !entry.selector || !entry.path) continue;

    const targets = [];
    findElements(definitions, entry.selector, targets);
    if (targets.length === 0) continue;

    for (const element of targets) {
      if (!matchesWhen(element, entry.when)) continue;

      if (entry.forEach) {
        const subTargets = resolveForEachTargets(element, entry.forEach) || [];
        for (const subTarget of subTargets) {
          validateInputRuleOnElement(subTarget, entry, result);
        }
        continue;
      }

      validateInputRuleOnElement(element, entry, result);
    }
  }
}

/**
 * 概要: 指定タイプのルート要素を取得する
 * @param {Object} definitions BPMN 定義要素
 * @param {string} type 取得対象のルート要素のタイプ
 * @returns {Array} 指定タイプのルート要素の配列
 */
function getRootElementsByType(definitions, type) {
  return (definitions.rootElements || []).filter(e => nsType(e) === type);
}

/**
 * 概要: プロセス要素のフロー要素を収集する
 * @param {Object} process BPMN Process 要素
 * @returns {Array} フロー要素の配列
 */
function collectProcessFlowElements(process) {
  const out = [];
  collectFlowElementsWithScope(process, process.id || '__process__', out);
  return out.map(row => row.element);
}

/**
 * 概要: プロセス要素のフロー要素を再帰的に収集する
 * @param {Object} container BPMN 要素（Process または SubProcess）
 * @param {string} scopeId 現在のスコープ ID（Process または SubProcess の ID）
 * @param {Array} out 収集結果を格納する配列（各要素は { element: FlowElement, scopeId: string } 形式）
 */
function collectFlowElementsWithScope(container, scopeId, out) {
  const flowElements = Array.isArray(container.flowElements) ? container.flowElements : [];
  for (const el of flowElements) {
    out.push({ element: el, scopeId: scopeId });
    const t = nsType(el);
    if (t === 'SubProcess' || t === 'EventSubProcess') {
      collectFlowElementsWithScope(el, el.id || scopeId, out);
    }
  }
}

/**
 * 概要: SubProcess が EventSubProcess であるかどうかを判定する
 * @param {Object} subProcess BPMN SubProcess 要素
 * @returns {boolean} EventSubProcess であるかどうか
 */
function isEventSubProcess(subProcess) {
  return nsType(subProcess) === 'EventSubProcess' || subProcess.triggeredByEvent === true || subProcess.triggeredByEvent === 'true';
}

/**
 * 概要: StartEvent の最初のイベント定義のタイプを取得する
 * @param {Object} startEvent BPMN StartEvent 要素
 * @returns {string|null} 最初のイベント定義のタイプ（存在しない場合は null）
 */
function getFirstEventDefinitionType(startEvent) {
  const defs = Array.isArray(startEvent.eventDefinitions) ? startEvent.eventDefinitions : [];
  if (defs.length === 0) return null;
  return nsType(defs[0]);
}

/**
 * 概要: ServiceTask 実装属性整合チェック（class/delegateExpression/expression/type）
 * @param {Object} process BPMN Process 要素
 * @param {ValidationResult} result バリデーション結果を格納するオブジェクト
 * @param {string} ctx コンテキスト情報
 */
function validateServiceTaskImplementation(process, result, ctx) {
  /* ServiceTask 実装属性整合チェック（class/delegateExpression/expression/type） */
  const flowElements = collectProcessFlowElements(process);
  const serviceTasks = flowElements.filter(e => nsType(e) === 'ServiceTask');

  for (const task of serviceTasks) {
    const attrs = [
      getAttrValue(task, 'activiti:class'),
      getAttrValue(task, 'activiti:delegateExpression'),
      getAttrValue(task, 'activiti:expression'),
      getAttrValue(task, 'activiti:type')
    ].filter(v => !isEmptyValue(v));

    if (attrs.length === 0) {
      result.error(ctx, `serviceTask ${task.id || '?'} requires one implementation attribute (class/delegateExpression/expression/type)`);
    }

    if (attrs.length > 1) {
      result.error(ctx, `serviceTask ${task.id || '?'} has multiple implementation attributes`);
    }
  }
}

/**
 * 概要: タイマーイベント定義（開始/キャッチ/境界）の必須入力・整合性チェック
 *  - bpmn:timeCycle / bpmn:timeDate / bpmn:timeDuration のいずれかに値が設定されているか
 *  - activiti:businessCalendarName の IM-BPM 独自ミニ DSL（LOGIC_TYPE に応じた付随情報）の整合性
 * @param {Object} process BPMN Process 要素
 * @param {ValidationResult} result バリデーション結果を格納するオブジェクト
 * @param {string} ctx コンテキスト情報
 */
function validateTimerEventDefinitions(process, result, ctx) {
  const flowElements = collectProcessFlowElements(process);
  const timerOwners = flowElements.filter(
    e => Array.isArray(e.eventDefinitions) && e.eventDefinitions.some(d => nsType(d) === 'TimerEventDefinition')
  );

  for (const owner of timerOwners) {
    const timerDef = owner.eventDefinitions.find(d => nsType(d) === 'TimerEventDefinition');
    const desc = describeElement(owner);

    /* timeCycle/timeDate/timeDuration のいずれかに値が設定されているか */
    const cycleText = getAttrValue(timerDef, 'timeCycle.text');
    const dateText = getAttrValue(timerDef, 'timeDate.text');
    const durationText = getAttrValue(timerDef, 'timeDuration.text');
    if (isEmptyValue(cycleText) && isEmptyValue(dateText) && isEmptyValue(durationText)) {
      result.error(ctx, `timerEventDefinition requires a value in one of timeCycle/timeDate/timeDuration (${desc})`);
    }

    /* activiti:businessCalendarName の IM-BPM ミニ DSL 整合チェック */
    const businessCalendarName = getAttrValue(timerDef, 'activiti:businessCalendarName');
    if (isEmptyValue(businessCalendarName)) continue;

    const tokens = parseBusinessCalendarTokens(businessCalendarName);
    const logicType = tokens.LOGIC_TYPE;

    if (logicType === 'class' && isEmptyValue(tokens.JAVA_CLASS)) {
      result.error(ctx, `timerEventDefinition businessCalendarName requires JAVA_CLASS when LOGIC_TYPE=class (${desc})`);
    }

    if (logicType === 'scriptFile' && isEmptyValue(tokens.SCRIPT_FILE_PATH)) {
      result.error(ctx, `timerEventDefinition businessCalendarName requires SCRIPT_FILE_PATH when LOGIC_TYPE=scriptFile (${desc})`);
    }

    if (logicType === 'logicdesigner') {
      if (isEmptyValue(tokens.LD_FLOW)) {
        result.error(ctx, `timerEventDefinition businessCalendarName requires LD_FLOW when LOGIC_TYPE=logicdesigner (${desc})`);
      }

      if (tokens.LD_USE_LATEST_VER === 'false') {
        if (isEmptyValue(tokens.LD_VER)) {
          result.error(ctx, `timerEventDefinition businessCalendarName requires LD_VER when LD_USE_LATEST_VER=false (${desc})`);
        } else if (!/^[0-9]+$/.test(tokens.LD_VER)) {
          result.error(ctx, `timerEventDefinition businessCalendarName LD_VER must be numeric (${desc}, value=${tokens.LD_VER})`);
        }
      }
    }
  }
}

/**
 * 概要: BPMN FlowElement から EventDefinition を収集する
 * @param {Array} flowElements BPMN FlowElement の配列
 * @returns {Array} イベント定義の配列（各要素は { owner: FlowElement, def: EventDefinition } 形式）
 */
function collectEventDefinitions(flowElements) {
  const defs = [];
  for (const flowElement of flowElements) {
    if (!Array.isArray(flowElement.eventDefinitions)) continue;
    for (const eventDef of flowElement.eventDefinitions) {
      defs.push({ owner: flowElement, def: eventDef });
    }
  }
  return defs;
}

/**
 * 概要: Message/Signal 参照整合チェック
 * @param {Object} process BPMN Process 要素
 * @param {ValidationResult} result バリデーション結果を格納するオブジェクト
 * @param {string} ctx コンテキスト情報
 */
function validateEventReferenceIntegrity(process, result, ctx) {
  /* Message/Signal 参照整合チェック */
  const flowElements = collectProcessFlowElements(process);
  const definitions = collectEventDefinitions(flowElements);

  const messageRefs = new Set();
  const signalRefs = new Set();

  for (const def of definitions) {
    const t = nsType(def.def);
    if (t === 'MessageEventDefinition') {
      const ref = getRefId(def.def.messageRef);
      if (ref) messageRefs.add(ref);
    }
    if (t === 'SignalEventDefinition') {
      const ref = getRefId(def.def.signalRef);
      if (ref) signalRefs.add(ref);
    }
  }

  const root = process.$parent;
  const rootElements = root && Array.isArray(root.rootElements) ? root.rootElements : [];
  const messages = rootElements.filter(e => nsType(e) === 'Message').map(e => e.id);
  const signals = rootElements.filter(e => nsType(e) === 'Signal').map(e => e.id);

  for (const messageRef of messageRefs) {
    if (!messages.includes(messageRef)) {
      result.error(ctx, `messageRef is unresolved: ${messageRef}`);
    }
  }

  for (const signalRef of signalRefs) {
    if (!signals.includes(signalRef)) {
      result.error(ctx, `signalRef is unresolved: ${signalRef}`);
    }
  }
}

/**
 * 概要: プロセス要素のバリデーションを行う
 * @param {Object} process BPMN Process 要素
 * @param {ValidationResult} result バリデーション結果を格納するオブジェクト
 */
function validateProcessShape(process, result) {
  const ctx = `flow(${process.id || '?'})`;

  /* プロセス基本要素チェック（id/name/start/end） */
  if (!process.id) result.error(ctx, 'process id is missing');
  if (!process.name) result.warn(ctx, 'process name is empty');

  const topLevelFlowElements = Array.isArray(process.flowElements) ? process.flowElements : [];
  const flowElements = collectProcessFlowElements(process);
  const starts = topLevelFlowElements.filter(e => nsType(e) === 'StartEvent');
  const ends = topLevelFlowElements.filter(e => nsType(e) === 'EndEvent');

  if (starts.length === 0) result.error(ctx, 'startEvent does not exist');
  if (ends.length === 0) result.error(ctx, 'endEvent does not exist');

  /* StartEvent 定義チェック（許可イベント定義・none start 重複） */
  for (const start of starts) {
    const eventDefType = getFirstEventDefinitionType(start);
    if (!eventDefType) continue;
    if (!['MessageEventDefinition', 'TimerEventDefinition', 'SignalEventDefinition'].includes(eventDefType)) {
      result.error(ctx, `unsupported event definition on start event (${start.id || '?'}, ${eventDefType})`);
    }
  }

  const noneStarts = starts.filter(e => !Array.isArray(e.eventDefinitions) || e.eventDefinitions.length === 0);
  if (noneStarts.length > 1) {
    for (const start of noneStarts) {
      result.error(ctx, `multiple none start events are not supported (${start.id || '?'})`);
    }
  }

  /* SubProcess/EventSubProcess 開始イベント制約チェック */
  const subProcesses = flowElements.filter(e => nsType(e) === 'SubProcess' || nsType(e) === 'EventSubProcess');
  for (const subProcess of subProcesses) {
    const children = Array.isArray(subProcess.flowElements) ? subProcess.flowElements : [];
    const subStarts = children.filter(e => nsType(e) === 'StartEvent');

    if (!isEventSubProcess(subProcess) && subStarts.length > 1) {
      result.error(ctx, `multiple start events are not supported for subprocess (${subProcess.id || '?'})`);
    }

    for (const start of subStarts) {
      const defs = Array.isArray(start.eventDefinitions) ? start.eventDefinitions : [];
      if (!isEventSubProcess(subProcess) && defs.length > 0) {
        result.error(ctx, `event definitions are only allowed on start event if subprocess is an event subprocess (${start.id || '?'})`);
      }

      if (isEventSubProcess(subProcess) && defs.length > 0) {
        const eventDefType = getFirstEventDefinitionType(start);
        if (!['ErrorEventDefinition', 'MessageEventDefinition', 'SignalEventDefinition'].includes(eventDefType)) {
          result.error(ctx, `event-subprocess start event must be error/message/signal (${start.id || '?'}, ${eventDefType})`);
        }
      }
    }
  }

  /* SequenceFlow source/target/scope 妥当性チェック */
  const scopedElements = [];
  collectFlowElementsWithScope(process, process.id || '__process__', scopedElements);

  const byId = new Map();
  const scopeById = new Map();
  for (const row of scopedElements) {
    const el = row.element;
    if (!el.id) {
      result.error(ctx, `flow element without id: ${el.$type}`);
      continue;
    }

    if (byId.has(el.id)) {
      result.error(ctx, `duplicate flow element id: ${el.id}`);
      continue;
    }

    byId.set(el.id, el);
    scopeById.set(el.id, row.scopeId);
  }

  const sequenceFlows = scopedElements.map(row => row.element).filter(e => nsType(e) === 'SequenceFlow');
  for (const seq of sequenceFlows) {
    const srcId = getRefId(seq.sourceRef);
    const tgtId = getRefId(seq.targetRef);

    if (!srcId || !byId.has(srcId)) {
      result.error(ctx, `sequenceFlow ${seq.id || '?'} sourceRef is invalid`);
    }

    if (!tgtId || !byId.has(tgtId)) {
      result.error(ctx, `sequenceFlow ${seq.id || '?'} targetRef is invalid`);
    }

    if (srcId && tgtId && scopeById.has(srcId) && scopeById.has(tgtId) && scopeById.get(srcId) !== scopeById.get(tgtId)) {
      result.error(ctx, `sequenceFlow ${seq.id || '?'} crosses subprocess boundary`);
    }
  }

  /* Gateway default flow 整合チェック */
  for (const element of flowElements) {
    if (!/Gateway$/.test(nsType(element))) continue;

    const defaultFlow = element.default;
    if (!defaultFlow) continue;

    const defaultId = getRefId(defaultFlow);
    if (!defaultId || !byId.has(defaultId) || nsType(byId.get(defaultId)) !== 'SequenceFlow') {
      result.error(ctx, `gateway ${element.id || '?'} default flow is invalid`);
      continue;
    }

    const flow = byId.get(defaultId);
    const srcId = getRefId(flow.sourceRef);
    if (!srcId || srcId !== element.id) {
      result.error(ctx, `gateway ${element.id || '?'} default flow ${defaultId} is not outgoing from the gateway`);
    }
  }

  /* ゲートウェイの出力フロー存在チェック（分岐先が1本も無い場合は構造として不正） */
  for (const element of flowElements) {
    if (!/Gateway$/.test(nsType(element))) continue;

    const hasOutgoing = sequenceFlows.some(seq => getRefId(seq.sourceRef) === element.id);
    if (!hasOutgoing) {
      result.error(ctx, `gateway ${element.id || '?'} has no outgoing sequenceFlow`);
    }
  }

  /*
   * 排他ゲートウェイの条件分岐チェック（出力フローが2本以上の分岐時のみ対象）
   *  - デフォルトフローに条件式が設定されている場合はエラー
   *  - デフォルトフロー以外（デフォルト未設定時は全フロー）に条件式が無いものがあればエラー
   */
  for (const element of flowElements) {
    if (nsType(element) !== 'ExclusiveGateway') continue;

    const outgoingFlows = sequenceFlows.filter(seq => getRefId(seq.sourceRef) === element.id);
    if (outgoingFlows.length <= 1) continue;

    const defaultId = getRefId(element.default);
    const defaultFlow = defaultId ? outgoingFlows.find(seq => seq.id === defaultId) : null;

    if (defaultFlow && !isEmptyValue(defaultFlow.conditionExpression)) {
      result.error(ctx, `exclusiveGateway ${element.id || '?'} default flow must not have a conditionExpression`);
    }

    const nonDefaultFlows = defaultId ? outgoingFlows.filter(seq => seq.id !== defaultId) : outgoingFlows;
    const hasMissingCondition = nonDefaultFlows.some(seq => isEmptyValue(seq.conditionExpression));
    if (hasMissingCondition) {
      result.error(ctx, `exclusiveGateway ${element.id || '?'} has a non-default outgoing sequenceFlow without a conditionExpression`);
    }
  }

  validateEventReferenceIntegrity(process, result, ctx);
  validateServiceTaskImplementation(process, result, ctx);
  validateTimerEventDefinitions(process, result, ctx);
}

/**
 * 概要: 同一 extensionElements 内での activiti:field name 重複チェック
 *  - activiti:field name は同一要素内で一意である前提のため、重複がある場合は入力ミスとして検出する
 * @param {Object} definitions BPMN 定義のルート要素
 * @param {ValidationResult} result バリデーション結果を格納するオブジェクト
 */
function validateDuplicateExtensionFields(definitions, result) {
  const extensionsContainers = [];
  findElements(definitions, 'bpmn:ExtensionElements', extensionsContainers);

  for (const container of extensionsContainers) {
    const fields = getExtensionValues(container.$parent).filter(v => nsType(v) === 'field');
    if (fields.length < 2) continue;

    const seen = new Set();
    for (const field of fields) {
      if (isEmptyValue(field.name)) continue;
      if (seen.has(field.name)) {
        result.error('model', `duplicate activiti:field name "${field.name}" in extensionElements (${describeElement(container.$parent)})`);
        continue;
      }
      seen.add(field.name);
    }
  }
}

/**
 * 概要: DI 参照整合チェック（BPMNPlane/BPMNShape/BPMNEdge）
 * @param {Object} definitions BPMN 定義のルート要素
 * @param {ValidationResult} result バリデーション結果を格納するオブジェクト
 */
function validateDiReferences(definitions, result) {
  /* DI 参照整合チェック（BPMNPlane/BPMNShape/BPMNEdge） */
  const known = new Set();

  const allFlowElements = [];
  const processes = getRootElementsByType(definitions, 'Process');
  for (const process of processes) {
    collectFlowElementsWithScope(process, process.id || '__process__', allFlowElements);
    if (process.id) known.add(process.id);
  }

  for (const row of allFlowElements) {
    const element = row.element;
    if (element && element.id) known.add(element.id);
  }

  const diagrams = Array.isArray(definitions.diagrams) ? definitions.diagrams : [];
  for (const diagram of diagrams) {
    if (!diagram.plane) continue;

    const plane = diagram.plane;
    if (plane.bpmnElement) {
      const planeRef = getRefId(plane.bpmnElement);
      if (planeRef && !known.has(planeRef)) {
        result.error('model', `DI plane references unknown bpmnElement: ${planeRef}`);
      }
    }

    const planeElements = Array.isArray(plane.planeElement) ? plane.planeElement : [];
    for (const pe of planeElements) {
      const peType = nsType(pe);
      const ref = getRefId(pe.bpmnElement);
      if (ref && !known.has(ref)) {
        result.error('model', `DI ${peType || 'planeElement'} references unknown bpmnElement: ${ref}`);
      }

      if (peType === 'BPMNEdge') {
        const waypoints = Array.isArray(pe.waypoint) ? pe.waypoint : [];
        if (waypoints.length < 2) {
          result.error('model', `BPMNEdge ${pe.id || '?'} must have at least 2 waypoints`);
        }
      }
    }
  }
}

/**
 * 概要: BPMN XML を解析し、BPMN 定義のルート要素を返す
 * @param {string} xml BPMN XML の文字列
 * @param {ValidationResult} result バリデーション結果を格納するオブジェクト
 * @returns {Promise<Object|null>} 解析された BPMN 定義のルート要素、解析に失敗した場合は null
 */
async function parseBpmn(xml, result) {
  /* BPMN XML 解析チェック（変換可否と警告取得） */
  const moddle = new BpmnModdle();
  try {
    // 解析結果を Promise でラップして非同期処理を行う
    const parsed = await new Promise((resolve, reject) => {
      let settled = false;

      // 解析完了時のコールバック関数
      const done = (err, definitions, context) => {
        if (settled) return;
        settled = true;
        if (err) return reject(err);
        resolve({
          rootElement: definitions,
          warnings: context && Array.isArray(context.warnings) ? context.warnings : []
        });
      };

      const maybePromise = moddle.fromXML(xml, done);
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise
          .then(parsedResult => {
            if (settled) return;
            settled = true;
            if (parsedResult && parsedResult.rootElement) {
              resolve({
                rootElement: parsedResult.rootElement,
                warnings: Array.isArray(parsedResult.warnings) ? parsedResult.warnings : []
              });
              return;
            }
            resolve({ rootElement: parsedResult, warnings: [] });
          })
          .catch(err => {
            if (settled) return;
            settled = true;
            reject(err);
          });
      }
    });

    const warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];
    rawRefIndex = buildRawRefIndex(warnings);
    pendingModelWarnings = warnings;

    return parsed.rootElement;
  } catch (err) {
    result.error('model', `failed to parse BPMN XML: ${err.message}`);
    return null;
  }
}

/**
 * 概要: バリデーション結果を管理するクラス
 *  - エラーと警告を収集し、最終的な結果を出力する
 *  - バリデーションの各ステップでエラーや警告を追加するために使用される
 *  - 最終的に ok プロパティでバリデーションの成否を判定できる
 *  - dump() メソッドで結果をコンソールに出力する
 */
class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  error(ctx, message) {
    this.errors.push(`[${ctx}] ${message}`);
  }

  warn(ctx, message) {
    this.warnings.push(`[${ctx}] ${message}`);
  }

  get ok() {
    return this.errors.length === 0;
  }

  dump() {
    for (const err of this.errors) console.error('ERROR:', err);
    for (const warning of this.warnings) console.error('WARN :', warning);

    if (this.ok) {
      console.error(`PASS (${this.warnings.length} warning(s))`);
    } else {
      console.error(`FAIL (${this.errors.length} error(s), ${this.warnings.length} warning(s))`);
    }
  }
}

/**
 * 概要: BPMN XML のバリデーションを行うメイン関数
 * 引数:
 *   process.argv[2]: BPMN XML ファイルパス
 *   process.argv[3]: --rules オプション（任意）
 * 戻り値:
 *   なし（終了コードで結果を返す）
 *   0: バリデーション成功（エラーなし）
 *   1: バリデーション失敗（エラーあり）
 */
async function main() {
  let args;
  // 引数解析
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  // バリデーション結果オブジェクトの作成
  const result = new ValidationResult();

  // 入力ルールの読み込み
  let inputRules;
  try {
    inputRules = readInputRules(args.rulesPath);
  } catch (err) {
    result.error('arg', `failed to read --rules: ${err.message}`);
    result.dump();
    process.exit(1);
  }

  // BPMN XML の読み込み
  let xml;
  try {
    xml = fs.readFileSync(args.bpmnPath, 'utf8');
  } catch (err) {
    result.error('io', `failed to read file ${args.bpmnPath}: ${err.message}`);
    result.dump();
    process.exit(1);
  }

  // BPMN XML の解析
  const definitions = await parseBpmn(xml, result);
  if (!definitions) {
    result.dump();
    process.exit(1);
  }

  // 入力ルールのバリデーション
  validateInputRules(definitions, inputRules, result);

  // 入力ルールで生値を消費しなかったモデル警告（未解決参照等）を出力する
  flushModelWarnings(result);

  // プロセス要素のバリデーション
  const processes = getRootElementsByType(definitions, 'Process');
  if (processes.length === 0) {
    result.error('flow', 'process element does not exist');
  }

  // DI 参照整合チェック
  for (const process of processes) {
    validateProcessShape(process, result);
  }
  validateDiReferences(definitions, result);
  validateDuplicateExtensionFields(definitions, result);

  // 結果の出力と終了コードの設定
  result.dump();
  process.exit(result.ok ? 0 : 1);
}

// エントリーポイント
if (require.main === module) {
  main().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = {
  ValidationResult,
  parseArgs,
  readInputRules,
  validateInputRules,
  validateProcessShape,
  validateDiReferences,
  validateDuplicateExtensionFields
};
