#!/usr/bin/env node
/*
 * build-flow.js — IM-LogicDesigner フロー定義ジェネレータ
 *
 * 使い方:
 *   node build-flow.js <spec.json> [--out output.json] [--zip] [--zip-dir <dir>]
 *
 *   --zip            : zip出力を有効化。<workspace>/src/main/storage/public/im_logic/
 *                       配下に im-logicdesigner-data-<featureName>.zip を生成。
 *                       zip 内には flow_definition.json が 1 ファイル入る。
 *   --zip-dir <dir>  : zip 出力先ディレクトリを上書き（既定: 上記）。
 *   --out <file>     : 整形 JSON を別途ファイルに保存（任意）。
 *
 * spec.json の形式（最小例）:
 *   {
 *     "flowCategories": [ ... ],            // そのまま埋め込まれる
 *     "flows": [
 *       {
 *         "flowId": "imprtl_portlet_info_article_count",
 *         "flowName": "お知らせポートレット 記事件数取得",
 *         "categoryId": "imprtl_portlet_info",
 *         "version": 1,
 *         "transaction": true,
 *         "constants": [],
 *         "variablesDataDefinition": { ... },
 *         "inputDataDefinition": { ... },
 *         "outputDataDefinition": { ... },
 *         "tasks": [
 *           { "type": "im_start" },
 *           { "type": "im_repositorySearchEntityCount",
 *             "label": "件数取得",
 *             "properties": { "entityId": "..." } },
 *           { "type": "im_end",
 *             "mappingRules": [
 *               { "target": "$output/data/articleCount",
 *                 "source": { "type":"value", "path":"im_repositorySearchEntityCount1/count" } }
 *             ]
 *           }
 *         ],
 *         "edges": [
 *           { "from": "im_start", "to": "im_repositorySearchEntityCount1" },
 *           { "from": "im_repositorySearchEntityCount1", "to": "im_end1" }
 *         ]
 *       }
 *     ]
 *   }
 *
 * 出力:
 *   { "flowCategories": [...], "flowDefinitions": [ "<JSON文字列>", ... ] }
 *
 * 仕様:
 *  - executeId は <key.id> + 連番（同一フロー内で1から）。
 *    既に明示指定がある場合（例: "im_start"）はそれを優先。
 *  - sequence の executeId は "<startExecuteId>_<endExecuteId>"。
 *  - additional.ui のレイアウトは縦一列（x=10, y=10+i*120）の単純配置。
 *  - dataMap / optionMap は task-templates/<keyId>.json の metadata を流用。
 *  - cell の id は決定論的 UUID v5 風（spec内位置から生成）。
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const os = require('os');

const DEFAULT_ZIP_DIR = 'src/main/storage/public/im_logic';

const TEMPLATE_DIR = path.resolve(__dirname, '..', 'task-templates');

function loadTemplates() {
  const map = {};
  for (const f of fs.readdirSync(TEMPLATE_DIR)) {
    if (!f.endsWith('.json')) continue;
    const k = f.replace(/\.json$/, '');
    map[k] = JSON.parse(fs.readFileSync(path.join(TEMPLATE_DIR, f), 'utf8'));
  }
  return map;
}

// 決定論的UUID（spec位置から生成、見やすさのためv4形式に整形）
function detUuid(seed) {
  const h = crypto.createHash('sha1').update(seed).digest('hex');
  return [
    h.substr(0, 8),
    h.substr(8, 4),
    '4' + h.substr(13, 3),
    ((parseInt(h.substr(16, 2), 16) & 0x3f) | 0x80).toString(16) + h.substr(18, 2),
    h.substr(20, 12),
  ].join('-');
}

function rid(seed) {
  return detUuid(seed);
}

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

// path 区切り "/" を IM-LogicDesigner 内部表現の TAB ('\t') に変換
function toUiPath(p) { return p.replace(/\//g, '\t'); }

// マッピングパネルのサイズ（関数ノードの水平配置の基準）
const MAPPING_PANEL_WIDTH = 400;
const MAPPING_PANEL_HEIGHT = 500;
// 関数ノードを並べる縦位置（横一列に揃える）
const FUNCTION_NODE_Y = 40;

// 関数ツリーに含まれる関数ノードの総数（レイアウトの等間隔配置に使用）
function countFunctionNodes(node) {
  if (!node || node.type !== 'function') return 0;
  let n = 1;
  if (Array.isArray(node.arguments)) {
    for (const arg of node.arguments) n += countFunctionNodes(arg);
  }
  return n;
}

// 関数ノードとその引数 connector を再帰的に生成する。
// 戻り値はこの関数ノードのインスタンス UUID（nodeId）と関数名。
//
// IM-LogicDesigner の実エクスポート仕様（重要）:
//   - 1 つの関数インスタンスは 1 つの UUID（nodeId）を持つ。
//     その関数のすべてのポート（in1 / in2 / ... / out）は connector 上で
//     同一の id（= nodeId）を共有し、ポートの区別は `port` フィールドだけで行う。
//   - nodeId は mapping.json.attrs に { x, y }（描画位置）として登録される。
//     attrs に無い関数ノードはエディタが復元できず、同名関数が 1 ノードに統合され
//     自己ループになる。
//   - 値（value）側のポートは connector ごとに一意な UUID を振り、attrs には登録しない。
//
// レイアウト:
//   - 引数を先に処理してから自ノードのランクを採番する（post-order）。
//     これにより「引数側（深いノード）が左、ルートが右」のデータフロー順に並ぶ。
//   - x = パネル幅 × rank / (総数 + 1)。総数 1 で中央(50%)、2 で 33%/66%、3 で 25/50/75%。
//   - y は固定値で横一列に揃える。
//
// connectors にはこの関数の各引数への入力 connector が push される。
//   - 引数が value: source.type = "$input"（ポート方向固定）, source.path = TAB区切り
//   - 引数が function（ネスト）: 子関数を再帰生成し、子の out → この関数の inK を結線
function emitFunctionConnectors(node, base, nodeKey, connectors, attrs, ctx) {
  const fnName = node.name;
  const nodeId = rid(`${base}/fn/${nodeKey}`);
  const args = Array.isArray(node.arguments) ? node.arguments : [];
  args.forEach((arg, k) => {
    if (!arg || !arg.type) return;
    if (arg.type === 'value' && arg.path) {
      connectors.push({
        id: rid(`${base}/conn/${nodeKey}/arg${k}`),
        source: {
          id: rid(`${base}/val/${nodeKey}/arg${k}`),
          type: '$input',
          path: toUiPath(arg.path),
          port: 'out',
        },
        target: {
          id: nodeId,
          type: fnName,
          port: `in${k + 1}`,
        },
      });
    } else if (arg.type === 'function' && arg.name) {
      const child = emitFunctionConnectors(arg, base, `${nodeKey}_${k}`, connectors, attrs, ctx);
      connectors.push({
        id: rid(`${base}/conn/${nodeKey}/arg${k}`),
        source: {
          id: child.nodeId,
          type: child.fnName,
          port: 'out',
        },
        target: {
          id: nodeId,
          type: fnName,
          port: `in${k + 1}`,
        },
      });
    }
  });
  // post-order でランクを採番し、パネル幅に対して等間隔に配置する
  ctx.rank += 1;
  attrs[nodeId] = {
    x: Math.round(ctx.width * ctx.rank / (ctx.total + 1)),
    y: FUNCTION_NODE_Y,
  };
  return { nodeId, fnName };
}

// connectors[] と inputKeys を mappingRules から構築（dataMap[cellId].mapping.json 用）
function buildMappingJson(rules, flowId, executeId) {
  const connectors = [];
  const attrs = {};
  for (const r of rules) {
    if (!r.source) continue;
    if (r.source.type === 'value' && r.source.path) {
      // value source: source.type = "$input", source.path = TAB区切りパス
      connectors.push({
        id: r.id,
        source: {
          id: rid(`${flowId}/${executeId}/conn/${r.id}/src`),
          type: '$input',
          path: toUiPath(r.source.path),
          port: 'out',
        },
        target: {
          id: rid(`${flowId}/${executeId}/conn/${r.id}/tgt`),
          type: '$output',
          path: toUiPath(r.target),
          port: 'in',
        },
      });
    } else if (r.source.type === 'function' && r.source.name) {
      // function source: まず引数の connector と関数ノード（attrs）を再帰生成し、
      // 最後に「ルート関数の出力 → 出力先（$output 側）」の connector を push する。
      // この出力 connector の id は rule.id と一致させる（バリデータの同期チェック対象）。
      const base = `${flowId}/${executeId}/conn/${r.id}`;
      const ctx = { rank: 0, total: countFunctionNodes(r.source), width: MAPPING_PANEL_WIDTH };
      const root = emitFunctionConnectors(r.source, base, 'root', connectors, attrs, ctx);
      connectors.push({
        id: r.id,
        source: {
          id: root.nodeId,
          type: root.fnName,
          port: 'out',
        },
        target: {
          id: rid(`${base}/tgt`),
          type: '$output',
          path: toUiPath(r.target),
          port: 'in',
        },
      });
    }
  }
  return {
    version: 1,
    attrs,
    connectors,
    size: { width: MAPPING_PANEL_WIDTH, height: MAPPING_PANEL_HEIGHT },
  };
}

// source（value / function）を再帰的にたどり、参照しているパスの先頭キーを集める
function collectPathHeads(source, set) {
  if (!source || typeof source !== 'object') return;
  if (source.type === 'value' && typeof source.path === 'string') {
    const head = source.path.split('/')[0];
    if (head) set.add(head);
  } else if (source.type === 'function' && Array.isArray(source.arguments)) {
    for (const arg of source.arguments) collectPathHeads(arg, set);
  }
}

function deriveInputKeys(rules, baseKeys) {
  const set = new Set(baseKeys || ['$input', '$variable', '$const']);
  for (const r of rules) {
    collectPathHeads(r.source, set);
  }
  return [...set];
}

// localize に en/ja/zh_CN が不足していれば補完する
function completeLocalize(localize, fallbackName) {
  const result = { ...localize };
  const locales = ['en', 'ja', 'zh_CN'];
  for (const loc of locales) {
    if (!result[loc]) result[loc] = fallbackName;
  }
  return result;
}

// ユーザ定義テンプレートかどうかを判定
function isUserDefinitionTemplate(tpl) {
  return tpl && (tpl.kind === 'userDefinition' || tpl.kind === 'userDefinitionEnd');
}

// spec の userDefinition から flowElement の properties.definition を構築
function buildUserDefinitionProps(spec, tpl) {
  const ud = spec.userDefinition || {};
  const sampleDef = tpl.flowElementSample.properties?.definition || {};
  const sampleData = sampleDef.definitionData || {};
  const definitionId = ud.definitionId || spec.executeId || sampleDef.definitionId;
  const props = {
    definition: {
      definitionId: definitionId,
      version: ud.version ?? sampleDef.version ?? 1,
      categoryId: ud.categoryId ?? sampleDef.categoryId ?? '',
      definitionType: ud.definitionType || sampleDef.definitionType || tpl.definitionType,
      definitionName: ud.definitionName || sampleDef.definitionName || '',
      sortNumber: ud.sortNumber ?? sampleDef.sortNumber ?? 100,
      definitionData: {
        elementId: sampleData.elementId,
        iconId: ud.iconId ?? sampleData.iconId ?? null,
        elementProperties: { ...(sampleData.elementProperties || {}), ...(ud.elementProperties || {}) },
        inputDataDefinition: ud.inputDataDefinition || sampleData.inputDataDefinition || emptyDataDef(),
        outputDataDefinition: ud.outputDataDefinition || sampleData.outputDataDefinition || emptyDataDef(),
      },
      localize: completeLocalize(ud.localize || sampleDef.localize || {}, ud.definitionName || sampleDef.definitionName || ''),
    },
  };
  if (tpl.pairEndTemplate) {
    // ペア型（DB Fetch / CSV Fetch 等）の開始要素は終了要素への参照 endPoint を持つ
    props.endPoint = `$${definitionId}$`;
  } else {
    props.continueOnError = spec.properties?.continueOnError ?? false;
  }
  return props;
}

// Database Fetch 終了要素の properties を構築
function buildDbFetchEndProps(startExecuteId) {
  return { startPoint: startExecuteId };
}

function buildFlow(flowSpec, templates) {
  const tasks = flowSpec.tasks || [];
  const edges = flowSpec.edges || [];

  // executeId を決定
  const counters = {};
  const taskInfos = tasks.map((t, idx) => {
    const tpl = templates[t.type];
    if (!tpl) throw new Error(`Unknown task type: ${t.type}`);
    let executeId = t.executeId;
    if (!executeId) {
      if (t.type === 'im_start' || t.type === 'im_end') {
        counters[t.type] = (counters[t.type] || 0) + 1;
        executeId = counters[t.type] === 1 ? t.type : t.type + counters[t.type];
        if (t.type === 'im_end' && counters[t.type] === 1) executeId = 'im_end1';
        if (t.type === 'im_start' && counters[t.type] === 1) executeId = 'im_start';
      } else if (isUserDefinitionTemplate(tpl) && tpl.kind === 'userDefinition') {
        // ユーザ定義: executeId は definitionId を使用
        executeId = t.userDefinition?.definitionId || t.executeId || t.type;
      } else {
        counters[t.type] = (counters[t.type] || 0) + 1;
        executeId = t.type + counters[t.type];
      }
    }
    return { spec: t, executeId, idx };
  });

  const byExec = Object.fromEntries(taskInfos.map(ti => [ti.executeId, ti]));

  // flowElements: tasks
  const flowElements = [];
  for (const ti of taskInfos) {
    const tpl = templates[ti.spec.type];
    const sample = tpl.flowElementSample;

    let feProps;
    let feKey;
    if (isUserDefinitionTemplate(tpl)) {
      // ユーザ定義タスク
      if (tpl.kind === 'userDefinitionEnd') {
        // Database Fetch 終了要素
        const startId = ti.spec.startPoint || ti.spec.userDefinition?.startPoint;
        feProps = buildDbFetchEndProps(startId);
        feKey = { type: 'localUserDefinition', id: `$${startId}$`, version: null };
      } else {
        feProps = buildUserDefinitionProps(ti.spec, tpl);
        const defId = feProps.definition.definitionId;
        feKey = { type: 'localUserDefinition', id: defId, version: null };
      }
    } else {
      // 通常タスク
      feProps = { ...(sample.properties || {}), ...(ti.spec.properties || {}) };
      feKey = deepClone(sample.key);
    }

    const fe = {
      executeId: ti.executeId,
      alias: ti.spec.alias ?? null,
      key: feKey,
      label: ti.spec.label ?? sample.label ?? null,
      comment: ti.spec.comment ?? '',
      properties: feProps,
      mappingDefinition: { mappingRules: (ti.spec.mappingRules || []).map((r, i) => ({
        id: r.id || rid(`${flowSpec.flowId}/${ti.executeId}/map/${i}`),
        target: r.target,
        source: r.source,
      })) },
    };
    flowElements.push(fe);

  }

  // ペア型ユーザ定義（DB Fetch / CSV Fetch 等）: 終了要素を自動的に追加（spec に明示不要）
  const pairedStarts = taskInfos.filter(ti => {
    const tpl = templates[ti.spec.type];
    return tpl && tpl.kind === 'userDefinition' && tpl.pairEndTemplate;
  });
  for (const ti of pairedStarts) {
    const startTpl = templates[ti.spec.type];
    const endExecId = `$${ti.executeId}$`;
    if (byExec[endExecId]) continue; // 既に存在する場合はスキップ
    const endFe = {
      executeId: endExecId,
      alias: null,
      key: { type: 'localUserDefinition', id: endExecId, version: null },
      label: `[終了]${ti.spec.label || ti.executeId}`,
      comment: '',
      properties: { startPoint: ti.executeId },
      mappingDefinition: { mappingRules: [] },
    };
    flowElements.push(endFe);
    const endTi = { spec: { type: startTpl.pairEndTemplate }, executeId: endExecId, idx: -1 };
    taskInfos.push(endTi);
    byExec[endExecId] = endTi;
  }

  // flowElements: sequences (from edges)
  const sequences = edges.map((e, i) => {
    const startExec = e.from;
    const endExec = e.to;
    if (!byExec[startExec]) throw new Error(`edge.from not found: ${startExec}`);
    if (!byExec[endExec]) throw new Error(`edge.to not found: ${endExec}`);
    const seqId = `${startExec}_${endExec}`;
    const props = { startPoint: startExec, endPoint: endExec };
    if (e.condition) props.condition = e.condition;
    return {
      executeId: seqId,
      alias: null,
      key: { type: 'application', id: 'im_sequence', version: null },
      label: null,
      comment: null,
      properties: props,
      mappingDefinition: null,
    };
  });
  flowElements.push(...sequences);

  // gateway の defaultRoot を解決（spec.tasks[i].defaultRoot に from→to or sequence id を指定可）
  for (const ti of taskInfos) {
    if (ti.spec.type !== 'im_gateway') continue;
    const dr = ti.spec.defaultRoot;
    if (!dr) continue;
    // dr が "<from>->'<to>'" 形式ならseqIdに変換
    let seqId = dr;
    if (dr.includes('->')) {
      const [from, to] = dr.split('->').map(s => s.trim());
      seqId = `${from}_${to}`;
    }
    const fe = flowElements.find(e => e.executeId === ti.executeId);
    fe.properties.defaultRoot = seqId;
  }

  // additional.ui の構築
  const cells = [];
  const dataMap = {};
  const optionMap = {};
  const cellIdByExec = {};

  taskInfos.forEach((ti, i) => {
    const tpl = templates[ti.spec.type];
    if (!tpl || !tpl.cellSample) return; // 自動生成された終了要素はスキップ（後で処理）
    const cellSample = deepClone(tpl.cellSample);
    const cellId = rid(`${flowSpec.flowId}/cell/${ti.executeId}`);
    cellIdByExec[ti.executeId] = cellId;
    cellSample.id = cellId;
    cellSample.position = { x: 50, y: 50 + i * 120 };
    cellSample.z = i + 1;
    if (cellSample.attrs) {
      if (cellSample.attrs['text.title']) cellSample.attrs['text.title'].text = ti.executeId;
      if (cellSample.attrs['text.label']) {
        const fe = flowElements.find(e => e.executeId === ti.executeId);
        cellSample.attrs['text.label'].text = ti.spec.label ?? fe?.label ?? cellSample.attrs['text.label'].text;
      }
    }
    cells.push(cellSample);

    if (tpl.dataMapMetadata) {
      // 対応する flowElement を取得（rule.id 込みで参照）
      const fe = flowElements.find(e => e.executeId === ti.executeId);
      const rules = fe?.mappingDefinition?.mappingRules || [];
      const baseInputKeys = (tpl.dataMapMappingDefaults?.inputKeys) || ['$input', '$variable', '$const'];
      const mappingJson = buildMappingJson(rules, flowSpec.flowId, ti.executeId);
      const metadata = deepClone(tpl.dataMapMetadata);
      // metadata.key を実際の flowElement の key に同期
      if (fe?.key) {
        metadata.key = { type: fe.key.type, id: fe.key.id };
      }
      // ユーザ定義タスクの場合、metadata の入出力定義を definition 内のものに同期
      if (fe?.key?.type === 'localUserDefinition' && fe.properties?.definition?.definitionData) {
        const dd = fe.properties.definition.definitionData;
        if (dd.inputDataDefinition) metadata.inputDataDefinition = deepClone(dd.inputDataDefinition);
        if (dd.outputDataDefinition) metadata.outputDataDefinition = deepClone(dd.outputDataDefinition);
      }
      // DB Fetch ペア: pairElementKey を実際の executeId に同期
      if (metadata.pairElementKey && fe?.key?.type === 'localUserDefinition') {
        const feId = fe.key.id;
        if (feId.startsWith('$') && feId.endsWith('$')) {
          // 終了要素 → 開始要素を参照
          metadata.pairElementKey = { type: 'localUserDefinition', id: feId.slice(1, -1) };
        } else {
          // 開始要素 → 終了要素を参照
          metadata.pairElementKey = { type: 'localUserDefinition', id: `$${feId}$` };
        }
      }
      const dmEntry = {
        metadata,
        common: {
          executeId: ti.executeId,
          alias: ti.spec.alias ?? ti.executeId,
          label: ti.spec.label ?? fe?.label ?? (tpl.flowElementSample.label || ''),
          comment: ti.spec.comment ?? '',
          mapping: null,
        },
        typical: fe?.key?.type === 'localUserDefinition'
          ? deepClone(fe.properties)
          : (() => {
              const base = { ...(tpl.dataMapTypical || {}), ...(ti.spec.properties || {}) };
              // gateway: edges の condition を @then に動的セット
              if (ti.spec.type === 'im_gateway') {
                const thenEdge = edges.find(e => e.from === ti.executeId && e.condition);
                base['@then'] = thenEdge ? thenEdge.condition : '';
              }
              return base;
            })(),
        mapping: {
          inputKeys: deriveInputKeys(rules, baseInputKeys),
          additionalKeys: [],
          json: mappingJson,
        },
      };
      // ユーザ定義タスク: dataMap トップレベルに elementId を追加
      if (fe?.key?.type === 'localUserDefinition') {
        let elemId = fe.properties?.definition?.definitionData?.elementId
                  || tpl.flowElementSample?.properties?.definition?.definitionData?.elementId;
        // DB Fetch 終了要素: 開始要素から elementId を取得
        if (!elemId && fe.properties?.startPoint) {
          const startFe = flowElements.find(e => e.executeId === fe.properties.startPoint);
          elemId = startFe?.properties?.definition?.definitionData?.elementId
                || templates['user_db_fetch']?.flowElementSample?.properties?.definition?.definitionData?.elementId;
        }
        if (elemId) dmEntry.elementId = elemId;
      }
      dataMap[cellId] = dmEntry;
    }
    if (tpl.optionMap) {
      const om = deepClone(tpl.optionMap);
      om.title = ti.executeId;
      const fe = flowElements.find(e => e.executeId === ti.executeId);
      om.label = ti.spec.label ?? fe?.label ?? om.label;
      optionMap[cellId] = om;
    }
  });

  // セルが未生成のタスク（ペア型ユーザ定義の終了要素など）を補完
  for (const ti of taskInfos) {
    if (cellIdByExec[ti.executeId]) continue;
    const tpl = templates[ti.spec.type];
    // 終了要素用の ProcModel セルを生成（種別に応じた終了テンプレートを優先）
    const endTpl = templates[ti.spec.type] || templates['user_db_fetch_end'];
    const baseCellSample = (endTpl && endTpl.cellSample) ? deepClone(endTpl.cellSample) : {
      type: 'devs.ProcModel',
      size: { width: 280, height: 50 },
      inPorts: ['in'],
      outPorts: ['out'],
      attrs: { 'text.title': { text: '' }, 'text.label': { text: '' } },
    };
    const cellId = rid(`${flowSpec.flowId}/cell/${ti.executeId}`);
    cellIdByExec[ti.executeId] = cellId;
    baseCellSample.id = cellId;
    baseCellSample.position = { x: 50, y: 50 + cells.length * 120 };
    baseCellSample.z = cells.length + 1;
    if (baseCellSample.attrs) {
      if (baseCellSample.attrs['text.title']) baseCellSample.attrs['text.title'].text = ti.executeId;
      if (baseCellSample.attrs['text.label']) {
        const fe = flowElements.find(e => e.executeId === ti.executeId);
        baseCellSample.attrs['text.label'].text = fe?.label || ti.executeId;
      }
    }
    cells.push(baseCellSample);

    // dataMap / optionMap
    if (endTpl?.dataMapMetadata) {
      const fe = flowElements.find(e => e.executeId === ti.executeId);
      const rules = fe?.mappingDefinition?.mappingRules || [];
      const endMeta = deepClone(endTpl.dataMapMetadata);
      // metadata.key / pairElementKey を実際の executeId に同期
      if (fe?.key) endMeta.key = { type: fe.key.type, id: fe.key.id };
      if (endMeta.pairElementKey && fe?.key?.id) {
        const feId = fe.key.id;
        endMeta.pairElementKey = feId.startsWith('$') && feId.endsWith('$')
          ? { type: 'localUserDefinition', id: feId.slice(1, -1) }
          : { type: 'localUserDefinition', id: `$${feId}$` };
      }
      const endDmEntry = {
        metadata: endMeta,
        common: { executeId: ti.executeId, alias: ti.executeId, label: fe?.label || '', comment: '', mapping: null },
        typical: fe?.properties ? deepClone(fe.properties) : {},
        mapping: { inputKeys: deriveInputKeys(rules, ['$input', '$variable', '$const']), additionalKeys: [], json: buildMappingJson(rules, flowSpec.flowId, ti.executeId) },
      };
      // elementId をトップレベルに追加（DB Fetch 終了は開始と同じ elementId を使う）
      const startExecId = fe?.properties?.startPoint;
      const startFe = startExecId ? flowElements.find(e => e.executeId === startExecId) : null;
      const endElemId = startFe?.properties?.definition?.definitionData?.elementId
                     || templates['user_db_fetch']?.flowElementSample?.properties?.definition?.definitionData?.elementId;
      if (endElemId) endDmEntry.elementId = endElemId;
      dataMap[cellId] = endDmEntry;
    }
    if (endTpl?.optionMap) {
      const om = deepClone(endTpl.optionMap);
      om.title = ti.executeId;
      const fe = flowElements.find(e => e.executeId === ti.executeId);
      if (fe?.label) om.label = fe.label;
      optionMap[cellId] = om;
    }
  }

  // ペア型ユーザ定義（DB Fetch / CSV Fetch 等）: optionMap.pairElementId を
  // 相手側セルの実 ID に張り替える（テンプレートの固定 UUID は使わない）。
  // 開始要素は properties.endPoint、終了要素は properties.startPoint で相手を特定する。
  for (const fe of flowElements) {
    if (fe.key?.type !== 'localUserDefinition') continue;
    const cellId = cellIdByExec[fe.executeId];
    if (!cellId || !optionMap[cellId]) continue;
    const partnerExec = fe.properties?.endPoint || fe.properties?.startPoint;
    if (partnerExec && cellIdByExec[partnerExec]) {
      optionMap[cellId].pairElementId = cellIdByExec[partnerExec];
    }
  }

  // edges のルート順にセルの position を再割り当て（分岐対応）
  const taskCells = cells.filter(c => c.type !== 'link');
  if (edges.length > 0 && taskCells.length > 0) {
    const cellByTitle = {};
    for (const c of taskCells) {
      const title = c.attrs?.['text.title']?.text;
      if (title) cellByTitle[title] = c;
    }

    // 隣接リスト
    const adjacency = {};
    for (const e of edges) {
      if (!adjacency[e.from]) adjacency[e.from] = [];
      adjacency[e.from].push(e);
    }

    // gateway 判定
    const gatewayExecIds = new Set(
      taskInfos.filter(ti => ti.spec.type === 'im_gateway').map(ti => ti.executeId)
    );

    // gateway の then/else ターゲット
    const gwThen = {};
    const gwElse = {};
    for (const ti of taskInfos) {
      if (ti.spec.type !== 'im_gateway') continue;
      const fe = flowElements.find(el => el.executeId === ti.executeId);
      const defaultRoot = fe?.properties?.defaultRoot;
      if (!defaultRoot) continue;
      for (const e of (adjacency[ti.executeId] || [])) {
        const seqId = `${e.from}_${e.to}`;
        if (seqId === defaultRoot) {
          gwElse[ti.executeId] = e.to;
        } else {
          gwThen[ti.executeId] = e.to;
        }
      }
    }

    // マージポイント検索: then/else 両分岐から到達可能な最初の共通ノード
    function findMerge(gwId) {
      const t = gwThen[gwId], el = gwElse[gwId];
      if (!t || !el) return null;
      const elseReach = new Set();
      const q1 = [el];
      while (q1.length > 0) {
        const id = q1.shift();
        if (elseReach.has(id)) continue;
        elseReach.add(id);
        for (const edge of (adjacency[id] || [])) q1.push(edge.to);
      }
      const q2 = [t];
      const visited = new Set();
      while (q2.length > 0) {
        const id = q2.shift();
        if (visited.has(id)) continue;
        visited.add(id);
        if (elseReach.has(id)) return id;
        for (const edge of (adjacency[id] || [])) q2.push(edge.to);
      }
      return null;
    }

    // レイアウト定数
    const MARGIN_X = 50;
    const MARGIN_Y = 50;
    const STEP_Y = 120;          // タスク間の縦間隔
    const COL_WIDTH = 340;       // 列折り返し時の横間隔
    const BRANCH_OFFSET_X = 150; // 分岐の左右オフセット
    const MAX_Y = 2880;          // デザイナ縦最大
    const maxPerCol = Math.floor((MAX_Y - MARGIN_Y) / STEP_Y);

    const positions = {};
    const placed = new Set();

    // 分岐チェーン内のレイアウト（stopAt の手前まで配置）
    function layoutBranch(execId, baseX, startY, stopAt) {
      if (!execId || execId === stopAt || placed.has(execId)) return startY;
      if (gatewayExecIds.has(execId)) {
        const endY = layoutGateway(execId, baseX, startY);
        const nestedMerge = findMerge(execId);
        if (nestedMerge && nestedMerge !== stopAt && !placed.has(nestedMerge)) {
          return layoutBranch(nestedMerge, baseX, endY, stopAt);
        }
        return endY;
      }
      placed.add(execId);
      positions[execId] = { x: baseX, y: startY };
      const succs = (adjacency[execId] || []).map(e => e.to)
        .filter(id => id !== stopAt && !placed.has(id));
      if (succs.length > 0) {
        return layoutBranch(succs[0], baseX, startY + STEP_Y, stopAt);
      }
      return startY + STEP_Y;
    }

    // gateway のレイアウト（gateway + then/else を配置、merge は配置しない）
    function layoutGateway(gwId, baseX, startY) {
      placed.add(gwId);
      positions[gwId] = { x: baseX, y: startY };
      const branchY = startY + STEP_Y;
      const mergePoint = findMerge(gwId);
      const thenEndY = layoutBranch(gwThen[gwId], baseX - BRANCH_OFFSET_X, branchY, mergePoint);
      const elseEndY = layoutBranch(gwElse[gwId], baseX + BRANCH_OFFSET_X, branchY, mergePoint);
      return Math.max(thenEndY, elseEndY);
    }

    // メインフローのレイアウト
    function layout(execId, baseX, startY) {
      if (!execId || placed.has(execId)) return startY;
      if (gatewayExecIds.has(execId)) {
        const endY = layoutGateway(execId, baseX, startY);
        const mergePoint = findMerge(execId);
        if (mergePoint && !placed.has(mergePoint)) {
          return layout(mergePoint, baseX, endY);
        }
        return endY;
      }
      placed.add(execId);
      positions[execId] = { x: baseX, y: startY };
      const succs = (adjacency[execId] || []).map(e => e.to).filter(id => !placed.has(id));
      if (succs.length > 0) {
        return layout(succs[0], baseX, startY + STEP_Y);
      }
      return startY + STEP_Y;
    }

    layout('im_start', BRANCH_OFFSET_X, MARGIN_Y);

    // 未配置ノードを末尾に追加
    let fallbackY = Math.max(...Object.values(positions).map(p => p.y)) + STEP_Y;
    for (const c of taskCells) {
      const execId = c.attrs?.['text.title']?.text;
      if (execId && !placed.has(execId)) {
        positions[execId] = { x: BRANCH_OFFSET_X, y: fallbackY };
        fallbackY += STEP_Y;
      }
    }

    // 列折り返し: Y が MAX_Y を超える場合、列をずらす
    const uniqueYs = [...new Set(Object.values(positions).map(p => p.y))].sort((a, b) => a - b);
    if (uniqueYs.length > maxPerCol) {
      const yToRow = new Map();
      uniqueYs.forEach((y, i) => yToRow.set(y, i));
      const allXs = Object.values(positions).map(p => p.x);
      const layoutWidth = Math.max(...allXs) - Math.min(...allXs) + COL_WIDTH;
      for (const pos of Object.values(positions)) {
        const row = yToRow.get(pos.y);
        const col = Math.floor(row / maxPerCol);
        const localRow = row % maxPerCol;
        pos.x += col * layoutWidth;
        pos.y = MARGIN_Y + localRow * STEP_Y;
      }
    }

    // X 正規化: min_x を MARGIN_X に揃える
    const minX = Math.min(...Object.values(positions).map(p => p.x));
    const shiftX = MARGIN_X - minX;
    if (shiftX !== 0) {
      for (const pos of Object.values(positions)) pos.x += shiftX;
    }

    // セルに position を適用
    const execIds = Object.keys(positions);
    execIds.sort((a, b) => {
      const pa = positions[a], pb = positions[b];
      return pa.y !== pb.y ? pa.y - pb.y : pa.x - pb.x;
    });
    for (let i = 0; i < execIds.length; i++) {
      const c = cellByTitle[execIds[i]];
      if (c) {
        c.position = { ...positions[execIds[i]] };
        c.z = i + 1;
      }
    }
  }

  // link cells
  // gateway の defaultRoot から else エッジを判定するためのマップを構築
  const gatewayDefaultRoots = {};
  for (const ti of taskInfos) {
    if (ti.spec.type !== 'im_gateway') continue;
    const fe = flowElements.find(el => el.executeId === ti.executeId);
    if (fe?.properties?.defaultRoot) {
      gatewayDefaultRoots[ti.executeId] = fe.properties.defaultRoot;
    }
  }

  // セル位置マップ（列折り返しリンクの vertices 計算に使用）
  const cellPosMap = {};
  for (const c of cells.filter(c => c.type !== 'link')) {
    const execId = c.attrs?.['text.title']?.text;
    if (execId && c.position) {
      cellPosMap[execId] = {
        x: c.position.x,
        y: c.position.y,
        width: c.size?.width || 200,
        height: c.size?.height || 50,
      };
    }
  }

  let zCounter = cells.length + 1;
  edges.forEach((e, i) => {
    const seqId = `${e.from}_${e.to}`;
    // gateway からのエッジはポートを then/else に振り分ける
    let sourcePort = 'out';
    if (gatewayDefaultRoots[e.from]) {
      sourcePort = (gatewayDefaultRoots[e.from] === seqId) ? 'else' : 'then';
    }
    const link = {
      type: 'link',
      source: { id: cellIdByExec[e.from], port: sourcePort },
      target: { id: cellIdByExec[e.to], port: 'in' },
      id: rid(`${flowSpec.flowId}/link/${seqId}`),
      z: zCounter++,
      attrs: { '.link-tools>.link-tool>.tool-remove': { display: '' } },
    };
    // 列折り返しリンク: target が source より右列かつ上にある場合、中継点を追加
    const fromPos = cellPosMap[e.from];
    const toPos = cellPosMap[e.to];
    if (fromPos && toPos && toPos.x > fromPos.x && fromPos.y > toPos.y) {
      const midX = Math.round((fromPos.x + fromPos.width + toPos.x) / 2);
      const midY = Math.round(fromPos.y + fromPos.height / 2);
      link.vertices = [{ x: midX, y: midY }];
    }
    cells.push(link);
  });

  const ui = {
    version: 2,
    graph: { cells },
    dataMap,
    optionMap,
  };

  const flowDef = {
    flowId: flowSpec.flowId,
    version: flowSpec.version ?? 1,
    categoryId: flowSpec.categoryId,
    flowName: flowSpec.flowName,
    localizes: flowSpec.localizes ?? {},
    notes: flowSpec.notes ?? '',
    versionComment: flowSpec.versionComment ?? null,
    transaction: flowSpec.transaction ?? true,
    validateRepositoryData: flowSpec.validateRepositoryData ?? false,
    mappingOrder: flowSpec.mappingOrder ?? 'SOURCE_HIERARCHY',
    constants: flowSpec.constants ?? [],
    variablesDataDefinition: flowSpec.variablesDataDefinition ?? emptyDataDef(),
    flowElements,
    inputDataDefinition: flowSpec.inputDataDefinition ?? emptyDataDef(),
    outputDataDefinition: flowSpec.outputDataDefinition ?? emptyDataDef(),
    additional: { ui: JSON.stringify(ui) },
  };

  return flowDef;
}

function emptyDataDef() {
  return {
    entrypoint: { typeId: 'root', basic: false, required: false, listingType: 'none' },
    typeDefinitions: [{ id: 'root', properties: [] }],
  };
}

function findWorkspaceRoot(start) {
  // 上方向に .git を探す。見つからなければ start を返す。
  let dir = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

/**
 * routeSpec から flow_route.json 用のエントリを生成する。
 * 省略されたフィールドにはデフォルト値を補完する。
 */
function buildRouteEntry(r) {
  return {
    route: r.route,
    method: r.method || 'GET',
    flowId: r.flowId,
    version: r.version !== undefined ? r.version : -1,
    authentication: r.authentication || 'IMAuthentication',
    authenticationParam: r.authenticationParam !== undefined ? r.authenticationParam : null,
    authzUri: r.authzUri || ('im-logic-rest://' + r.flowId),
    secured: r.secured !== undefined ? r.secured : false,
    responseType: r.responseType || 'imJsonResponse',
    responseHeader: r.responseHeader || {},
  };
}

function writeZip(json, routeJson, featureName, zipDir) {
  if (!featureName) throw new Error('featureName is required for zip output (set spec.featureName)');
  fs.mkdirSync(zipDir, { recursive: true });
  const zipName = `im-logicdesigner-data-${featureName}.zip`;
  const zipPath = path.join(zipDir, zipName);

  // 一時ディレクトリに JSON ファイルを作って zip にまとめる
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'imlogic-'));
  try {
    const flowFile = path.join(tmp, 'flow_definition.json');
    fs.writeFileSync(flowFile, json);
    const zipFiles = [flowFile];
    if (routeJson) {
      const routeFile = path.join(tmp, 'flow_route.json');
      fs.writeFileSync(routeFile, routeJson);
      zipFiles.push(routeFile);
    }
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    execFileSync('zip', ['-j', '-q', zipPath].concat(zipFiles), { stdio: 'inherit' });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return zipPath;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: build-flow.js <spec.json> [--out output.json] [--zip] [--zip-dir <dir>]');
    process.exit(1);
  }
  const specPath = args[0];
  let outPath = null;
  let doZip = false;
  let zipDirArg = null;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--out') outPath = args[++i];
    else if (args[i] === '--zip') doZip = true;
    else if (args[i] === '--zip-dir') { zipDirArg = args[++i]; doZip = true; }
  }

  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const templates = loadTemplates();

  const flows = (spec.flows || []).map(f => buildFlow(f, templates));
  const out = {
    flowCategories: spec.flowCategories || [],
    flowDefinitions: flows.map(f => JSON.stringify(f)),
  };
  const json = JSON.stringify(out, null, 2);

  // ルーティング定義（spec.routes がある場合のみ生成）
  var routeJson = null;
  if (spec.routes && spec.routes.length > 0) {
    var routeEntries = spec.routes.map(function(r) { return buildRouteEntry(r); });
    routeJson = JSON.stringify(routeEntries, null, 2);
  }

  if (outPath) {
    fs.writeFileSync(outPath, json);
    console.error(`wrote ${outPath} (${flows.length} flow(s))`);
    if (routeJson) {
      var routeOutPath = outPath.replace(/\.json$/, '_route.json');
      fs.writeFileSync(routeOutPath, routeJson);
      console.error(`wrote ${routeOutPath} (${spec.routes.length} route(s))`);
    }
  }

  if (doZip) {
    // featureName: spec.featureName 優先、なければ最初の flowId を使う
    const featureName = spec.featureName || (flows[0] && flows[0].flowId);
    const zipDir = zipDirArg
      ? path.resolve(zipDirArg)
      : path.join(findWorkspaceRoot(process.cwd()), DEFAULT_ZIP_DIR);
    const zipPath = writeZip(json, routeJson, featureName, zipDir);
    console.error(`wrote ${zipPath}`);
    if (routeJson) {
      console.error(`  includes flow_route.json (${spec.routes.length} route(s))`);
    }
  }

  if (!outPath && !doZip) {
    process.stdout.write(json);
    if (routeJson) {
      console.error('--- flow_route.json ---');
      process.stdout.write('\n' + routeJson);
    }
  }
}

if (require.main === module) main();

module.exports = { buildFlow, loadTemplates };
