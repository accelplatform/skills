#!/usr/bin/env node
/**
 * IM-Workflow 生成コード検証スクリプト
 *
 * JSSP 共通ルール（validate-jssp-code.js）+ IM-Workflow 固有ルールで検証する。
 * 終了コード: 0=OK, 1=エラーあり
 *
 * 使い方:
 *   node validate-workflow-code.js <ディレクトリまたはファイル>
 *   node validate-workflow-code.js src/main/jssp/src/leave/
 */
const fs = require('fs');
const path = require('path');

// 共通検証モジュールを読み込み
const common = require(path.resolve(__dirname, '../../jssp-page-generator/scripts/validate-jssp-code.js'));

// ========================================
// IM-Workflow 固有ルール
// ========================================
const WF_RULES = {
  js: [
    {
      id: 'WF-JS-001',
      description: 'workflowOpenPage に無効な pageType',
      pattern: /workflowOpenPage\(\s*["'](?![0-5]["'\s,)])[\w]+["']\s*[,)]/g,
      message: "workflowOpenPage の pageType は '0'～'5' のみ有効です（0=申請, 1=一時保存, 2=起票案件, 3=再申請, 4=処理, 5=確認）",
      severity: 'error'
    }
  ],
  html: [
    {
      id: 'WF-HTML-001',
      description: 'workflowOpenPage に無効な pageType（HTML内 JS）',
      pattern: /workflowOpenPage\(\s*["'](?![0-5]["'\s,)])[\w]+["']\s*[,)]/g,
      message: "workflowOpenPage の pageType は '0'～'5' のみ有効です",
      severity: 'error'
    },
    {
      id: 'WF-HTML-002',
      description: '承認画面に承認/差戻し/否認の個別ボタン',
      pattern: /id\s*=\s*["'](approve-button|sendback-button|deny-button|reserve-button)["']/g,
      message: "承認画面には「処理」ボタン（workflowOpenPage('4')）のみを配置してください。承認/差戻し/否認は IM-Workflow 標準ダイアログで選択します",
      severity: 'warning'
    }
  ]
};

const WF_FUNCTION_RULES = {
  js: [
    {
      id: 'WF-JS-002',
      description: 'アクション処理の関数シグネチャが1引数（parameter のみ）',
      message: 'アクション処理の関数は (parameter, userParam) の2引数で定義してください。フォームの値は第2引数 userParam で渡されます（parameter.userParameter は存在しません）',
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        // アクション処理ファイルか判定（apply + approve 等が定義されている）
        let hasApplyFunc = /^function\s+apply\s*\(/m.test(content);
        let hasApproveOrEnd = /^function\s+(approve|approveEnd|deny|sendBack)\s*\(/m.test(content);
        if (!hasApplyFunc && !hasApproveOrEnd) return findings;
        // 各関数のシグネチャをチェック
        let actionFuncs = ['apply', 'reapply', 'applyFromUnapply', 'applyFromTempSave',
          'approve', 'approveEnd', 'deny', 'sendBack', 'pullBack', 'sendBackToPullBack',
          'discontinue', 'reserve', 'reserveCancel', 'matterHandle',
          'tempSaveCreate', 'tempSaveUpdate', 'tempSaveDelete'];
        for (let i = 0; i < lines.length; i++) {
          for (let j = 0; j < actionFuncs.length; j++) {
            let pat = new RegExp('^function\\s+' + actionFuncs[j] + '\\s*\\(\\s*parameter\\s*\\)');
            if (pat.test(lines[i])) {
              findings.push({ line: i });
            }
          }
        }
        return findings;
      }
    },
    {
      id: 'WF-JS-003',
      description: '到達処理で DB 操作があるがトランザクション制御がない',
      message: '到達処理内で DB の INSERT/UPDATE/DELETE を行う場合は、Transaction.begin(function() { ... }) でトランザクション制御を行ってください（推奨）。個別制御が必要な場合は Transaction.commit() / Transaction.rollback() を使用してください。IM-Workflow エンジンはトランザクションを制御しません',
      severity: 'error',
      check: function (content, lines, filePath) {
        // 到達処理ファイル（パスに /arrive/ を含む）のみ対象
        if (!filePath || filePath.indexOf('/arrive/') === -1) return [];
        let hasDbWrite = /\bdb\.(insert|update|remove)\s*\(/.test(content);
        if (!hasDbWrite) return [];
        // Transaction API（推奨）または非推奨の db.beginTransaction/commit/rollback があればトランザクション制御あり
        let hasTx = /\bTransaction\.(begin|commit|rollback)\s*\(/.test(content)
                 || /\bdb\.(beginTransaction|commit|rollback)\s*\(/.test(content);
        if (hasTx) return [];
        // db.insert/update/remove の最初の行を報告
        for (let i = 0; i < lines.length; i++) {
          if (/\bdb\.(insert|update|remove)\s*\(/.test(lines[i])) {
            return [{ line: i }];
          }
        }
        return [];
      }
    },
    {
      id: 'WF-JS-004',
      description: 'アクション処理・案件処理・分岐条件処理でのトランザクション使用禁止',
      message: 'このプログラム（アクション処理・案件開始/終了処理・分岐条件処理）では Transaction.begin() / Transaction.commit() / Transaction.rollback() でトランザクションを張らないでください。トランザクションは IM-Workflow エンジンが制御します（非推奨の db.beginTransaction/db.commit/db.rollback も同様に使用禁止）',
      severity: 'error',
      check: function (content, lines, filePath) {
        // 到達処理（/arrive/）は対象外
        if (filePath && filePath.indexOf('/arrive/') !== -1) return [];
        // アクション処理・案件処理・分岐条件処理のファイルのみ対象（パスで判定）
        let isWfProcess = filePath && (
          filePath.indexOf('/action/') !== -1 ||
          filePath.indexOf('/rule/') !== -1 ||
          filePath.indexOf('matter_start') !== -1 ||
          filePath.indexOf('matter_end') !== -1
        );
        // パスで判定できない場合はコンテンツで判定（WF 処理の関数シグネチャ）
        if (!isWfProcess) {
          let hasWfFunc = /^function\s+(apply|approve|approveEnd|deny|sendBack|matterStart|matterEnd|execute)\s*\(/m.test(content);
          if (!hasWfFunc) return [];
        }
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          if (/\bTransaction\.(begin|commit|rollback)\s*\(/.test(lines[i])
           || /\bdb\.(beginTransaction|commit|rollback)\s*\(/.test(lines[i])) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    },
    {
      id: 'WF-JS-005',
      description: 'executeByTemplate パラメータキーがキャメルケース（SQL テンプレートのスネークケースと不一致の可能性）',
      message: 'executeByTemplate のパラメータキーは SQL テンプレートのバインド変数名（/*xxx*/）と完全一致させてください。SQL がスネークケース（user_data_id）なら JS 側もスネークケースにしてください',
      severity: 'warning',
      check: function (content, lines) {
        let findings = [];
        // executeByTemplate 呼び出しの次の行以降でキャメルケースのキーを探す
        let inParamBlock = false;
        let braceDepth = 0;
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (/executeByTemplate\s*\(/.test(line)) {
            inParamBlock = true;
            braceDepth = 0;
          }
          if (inParamBlock) {
            for (let c = 0; c < line.length; c++) {
              if (line[c] === '{') braceDepth++;
              if (line[c] === '}') braceDepth--;
            }
            // パラメータオブジェクト内のキーをチェック（userDataId, vendorId 等のキャメルケース）
            let keyMatch = line.match(/^\s+([a-z][a-zA-Z]+[A-Z][a-zA-Z]*)\s*:/);
            if (keyMatch && braceDepth > 0) {
              // DB 関連のキャメルケースキーのみ警告（一般的なキー名を除外）
              let key = keyMatch[1];
              if (/Id$|Date$|Name$|Type$|Amount$|Price$|Number$|Order$|Count$/.test(key)) {
                findings.push({ line: i });
              }
            }
            if (braceDepth <= 0 && inParamBlock && i > 0) {
              inParamBlock = false;
            }
          }
        }
        return findings;
      }
    },
    {
      id: 'WF-JS-006',
      description: '詳細画面（参照・処理詳細）で UserActvMatterPropertyValue のみ使用（完了・過去案件に未対応）',
      message: '詳細画面は未完了・完了・過去案件の3パターンに対応してください。UserActvMatterPropertyValue のみでは完了案件・過去案件を開いたとき詳細が表示されません。' +
        '実装例: imwArchiveMonth が存在 → UserArcMatterPropertyValue(archiveMonth)、' +
        'なし かつ actv にデータあり → UserActvMatterPropertyValue、' +
        'なし かつ actv にデータなし → UserCplMatterPropertyValue にフォールバック',
      severity: 'error',
      check: function (content, lines, filePath) {
        // 詳細画面（参照・処理詳細）のパスパターンのみ対象
        // apply / approve 画面はアクティブ案件専用のため対象外
        let normalized = (filePath || '').replace(/\\/g, '/');
        let isDetailScreen = /\/(refer|detail|process_detail|refer_detail|processDetail|referDetail)(\/|\.js$)/.test(normalized);
        if (!isDetailScreen) return [];

        // アクション処理ファイルは対象外（apply + approve/deny/sendBack を持つ）
        let hasApplyFunc    = /^function\s+apply\s*\(/m.test(content);
        let hasApproveFunc  = /^function\s+(approve|deny|sendBack)\s*\(/m.test(content);
        if (hasApplyFunc && hasApproveFunc) return [];

        // UserActvMatterPropertyValue で getMatterPropertyList を呼んでいるか
        let usesActv = /UserActvMatterPropertyValue/.test(content)
                    && /getMatterPropertyList/.test(content);
        if (!usesActv) return [];

        // UserCplMatterPropertyValue または UserArcMatterPropertyValue も使っていれば OK
        let usesCpl = /UserCplMatterPropertyValue/.test(content);
        let usesArc = /UserArcMatterPropertyValue/.test(content);
        if (usesCpl && usesArc) return [];

        // 未対応の行として UserActvMatterPropertyValue の最初の行を報告
        for (let i = 0; i < lines.length; i++) {
          if (/UserActvMatterPropertyValue/.test(lines[i])) {
            return [{ line: i }];
          }
        }
        return [];
      }
    },
    {
      id: 'WF-JS-007',
      description: 'アクション処理の apply 関数で案件番号が採番されていない',
      message: 'apply 関数内で案件番号を採番してください（result.data = createMatterNumber(); / WorkflowNumberingManager.getNumber()）',
      severity: 'warning',
      check: function (content, lines) {
        let findings = [];
        // apply 関数が存在するか
        let hasApplyFunc = /^function\s+apply\s*\(/m.test(content);
        if (!hasApplyFunc) return findings;
        // アクション処理ファイルか判定（approve/deny/sendBack 等も定義されている）
        let hasApproveFunc = /^function\s+approve\s*\(/m.test(content);
        if (!hasApproveFunc) return findings;
        // createMatterNumber or WorkflowNumberingManager が使われているか
        let hasMatterNumber = /createMatterNumber|WorkflowNumberingManager/.test(content);
        if (!hasMatterNumber) {
          // apply 関数の行番号を探す
          for (let i = 0; i < lines.length; i++) {
            if (/^function\s+apply\s*\(/.test(lines[i])) {
              findings.push({ line: i });
              break;
            }
          }
        }
        return findings;
      }
    }
  ],
  html: [
    {
      id: 'WF-HTML-003',
      description: 'workflowOpenPage を id で参照しようとしている（id 属性付与 / getElementById 使用）',
      message: "workflowOpenPage は id 属性をサポートしません。フォームを参照するには document.forms['formName'] を使用してください",
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (/type\s*=\s*["']workflowOpenPage["'][^>]*\bid\s*=/.test(line)) {
            findings.push({ line: i, overrideMessage: "<imart type=\"workflowOpenPage\"> に id 属性を付与しています。id 属性はサポートされません。フォームを JS から参照するには document.forms['formName'] を使用してください" });
          } else if (/document\.getElementById\s*\(\s*['"]workflowOpenPageForm['"]\s*\)/.test(line)) {
            findings.push({ line: i, overrideMessage: "workflowOpenPage は id 属性を出力しません。document.forms['workflowOpenPageForm'] を使用してください" });
          }
        }
        return findings;
      }
    },
    {
      id: 'WF-HTML-004',
      description: 'workflowOpenPage フォーム内で入力フィールドと hidden フィールドの name 属性が重複',
      message: 'workflowOpenPage フォーム内の入力フィールド（select, input[type!=hidden], textarea, input[type=radio]）に name 属性を付けないでください。hidden フィールドと name が重複すると userParam の値が配列になり、アクション処理でエラーが発生します',
      severity: 'error',
      check: function (content, lines) {
        let findings = [];
        // workflowOpenPage フォームの範囲を特定
        let formStartPattern = /type\s*=\s*["']workflowOpenPage["']/;
        let formStart = -1;
        let formEnd = -1;
        for (let i = 0; i < lines.length; i++) {
          if (formStartPattern.test(lines[i])) {
            formStart = i;
          }
          // workflowOpenPage の閉じタグ（</imart> か </iamrt>）
          if (formStart >= 0 && formEnd < 0 && i > formStart) {
            if (/^<\/imart>/.test(lines[i].trim()) || /^<\/iamrt>/.test(lines[i].trim())) {
              formEnd = i;
              break;
            }
          }
        }
        if (formStart < 0 || formEnd < 0) return findings;

        // hidden フィールドの name 一覧を収集
        let hiddenNames = {};
        let namePattern = /name\s*=\s*["']([^"']+)["']/;
        for (let i = formStart; i <= formEnd; i++) {
          if (/type\s*=\s*["']hidden["']/.test(lines[i])) {
            let m = lines[i].match(namePattern);
            if (m) hiddenNames[m[1]] = true;
          }
        }

        // 入力フィールド（select, input[type!=hidden], textarea）に同名の name があるか
        for (let i = formStart; i <= formEnd; i++) {
          let line = lines[i];
          // hidden input はスキップ
          if (/type\s*=\s*["']hidden["']/.test(line)) continue;
          // select, textarea, input（text/number/radio/checkbox 等）の name を検出
          let isInputField = /<select\b/.test(line) || /<textarea\b/.test(line) ||
            (/<input\b/.test(line) && /type\s*=\s*["'](text|number|radio|checkbox|date|email|tel)["']/.test(line));
          if (!isInputField) continue;
          let m = line.match(namePattern);
          if (m && hiddenNames[m[1]]) {
            findings.push({ line: i });
          }
        }
        return findings;
      }
    }
  ]
};

// ========================================
// 共通 + WF 固有ルールをマージ
// ========================================
let mergedPatternRules = common.mergeRules(common.COMMON_RULES, WF_RULES);
let mergedFunctionRules = common.mergeRules(common.COMMON_FUNCTION_RULES, WF_FUNCTION_RULES);

// ========================================
// ワークフロー資材配置パスチェック（ディレクトリレベル）
// ========================================
/**
 * IM-Workflow 連携ファイルが {機能名}/workflow/ 配下に配置されているかチェックする。
 *
 * 判定根拠: 以下のいずれかを含むファイルは IM-Workflow 専用ファイルとみなす。
 *   - ImwContentsApplication（申請画面 JS）
 *   - ImwContentsProcess（処理・詳細画面 JS）
 *   - type="workflowOpenPage"（申請・処理画面 HTML）
 *   - UserActvMatterPropertyValue（アクション処理 JS）
 *
 * エラー: 上記を含むファイルのパスに /workflow/ セグメントが存在しない場合。
 */
function checkWorkflowFileLocation(targetPath) {
  let findings = [];

  let stat;
  try { stat = fs.statSync(targetPath); } catch (e) { return findings; }
  if (!stat.isDirectory()) return findings;

  let files = common.collectFiles(targetPath);
  let jsHtmlFiles = files.filter(function (f) { return /\.(js|html)$/.test(f); });

  // IM-Workflow 固有 API のパターン（これを含むファイルは workflow/ 配下が必須）
  let WF_API_PATTERN = /ImwContentsApplication|ImwContentsProcess|type\s*=\s*["']workflowOpenPage["']|UserActvMatterPropertyValue/;

  for (let i = 0; i < jsHtmlFiles.length; i++) {
    let filePath = jsHtmlFiles[i];
    let normalized = filePath.replace(/\\/g, '/');

    // すでに /workflow/ 配下にあれば OK
    if (/\/workflow\//.test(normalized)) continue;

    // IM-Workflow 固有 API を使っているか確認
    let content;
    try { content = fs.readFileSync(filePath, 'utf-8'); } catch (e) { continue; }
    if (!WF_API_PATTERN.test(content)) continue;

    // jssp/src からの相対パスを計算してメッセージに使用
    let jsspSrcMatch = normalized.match(/\/jssp\/src\/(.+)$/);
    let relativePath = jsspSrcMatch ? jsspSrcMatch[1] : path.basename(filePath);
    let featureMatch = relativePath.match(/^([^/]+)\//);
    let featureName = featureMatch ? featureMatch[1] : '<機能名>';

    findings.push({
      file: filePath, line: 1,
      ruleId: 'WF-JS-008', severity: 'warning',
      message: 'IM-Workflow 連携ファイルは通常 {機能名}/workflow/{画面種別}/ 配下に配置します。' +
        'プロンプトで配置先を明示的に指定した場合はその指示を優先してください。' +
        'デフォルトの配置例: ' + featureName + '/workflow/apply/index.js',
      matchedText: relativePath
    });
  }

  return findings;
}

// ========================================
// ヘルパー: IM-Workflow XML ファイル検索・読み込み
// ========================================
function findWorkflowXmlFiles(resolvedTargetPath) {
  let normalized = resolvedTargetPath.replace(/\\/g, '/');
  let match = normalized.match(/^(.+)\/src\/main\/jssp\/src/);
  if (!match) return [];
  let xmlDir = path.join(match[1], 'src', 'main', 'storage', 'public', 'im_workflow');
  try {
    return fs.readdirSync(xmlDir)
      .filter(function (f) { return f.endsWith('.xml') && f.indexOf('im_workflow-') === 0; })
      .map(function (f) { return path.join(xmlDir, f); });
  } catch (e) { return []; }
}

function readXmlFileContent(xmlFilePath) {
  try {
    let raw = fs.readFileSync(xmlFilePath);
    if (raw[0] === 0xFF && raw[1] === 0xFE) {
      return raw.slice(2).toString('utf16le');
    } else if (raw[0] === 0xFE && raw[1] === 0xFF) {
      let swapped = Buffer.alloc(raw.length - 2);
      for (let k = 2; k < raw.length - 1; k += 2) {
        swapped[k - 2] = raw[k + 1];
        swapped[k - 1] = raw[k];
      }
      return swapped.toString('utf16le');
    }
    return raw.toString('utf-8');
  } catch (e) { return null; }
}

function findJsspSrcRoot(resolvedTargetPath) {
  let normalized = resolvedTargetPath.replace(/\\/g, '/');
  let match = normalized.match(/^(.+\/src\/main\/jssp\/src)/);
  return match ? match[1] : null;
}

function getWfProcessType(normalizedPath) {
  if (/\/action\//.test(normalizedPath)) return 'action';
  if (/\/arrive\//.test(normalizedPath)) return 'arrive';
  if (/\/rule\//.test(normalizedPath)) return 'rule';
  if (/\/plugin\//.test(normalizedPath)) return 'plugin';
  return 'matter';
}

function getUnregisteredMessage(type, scriptPath) {
  if (type === 'action') {
    return 'アクション処理が IM-Workflow XML（コンテンツ定義）に未登録です。' +
      'spec.json の apply/approve ノードに "actionProcess": "' + scriptPath + '" を追加して XML を再生成してください';
  }
  if (type === 'arrive') {
    return '到達処理が IM-Workflow XML（コンテンツ定義）に未登録です。' +
      'コンテンツ定義の到達処理プラグインにスクリプトパス「' + scriptPath + '」を登録してください';
  }
  if (type === 'rule') {
    return '分岐条件処理が IM-Workflow XML（ルート定義）に未登録です。' +
      'ルート定義の分岐ノードにスクリプトパス「' + scriptPath + '」を登録してください';
  }
  if (type === 'plugin') {
    return '権限プラグインが IM-Workflow XML（コンテンツ/ルート定義）に未登録です。' +
      'スクリプトパス「' + scriptPath + '」の登録状況を確認してください';
  }
  return '案件開始/終了処理またはリスナーが IM-Workflow XML（コンテンツ定義）に未登録です。' +
    'コンテンツ定義の処理プラグインにスクリプトパス「' + scriptPath + '」を登録してください';
}

// ========================================
// A. ワークフロー処理ファイルの XML 登録チェック（ディレクトリレベル）
// ========================================
/**
 * workflow/action/, workflow/arrive/, workflow/rule/, workflow/plugin/ 配下の JS ファイル、
 * および workflow/ ルート直下の処理ファイル（同名 .html がないもの）が
 * IM-Workflow XML に scriptPath として登録されているかチェックする。
 *
 * エラー: 登録されていない場合。
 * Warning: XML ファイル自体が見つからない場合（まだ生成されていない可能性）。
 */
function checkWorkflowProcessRegistration(targetPath) {
  let findings = [];

  let stat;
  try { stat = fs.statSync(targetPath); } catch (e) { return findings; }
  if (!stat.isDirectory()) return findings;

  let files = common.collectFiles(targetPath);
  let resolvedTarget = path.resolve(targetPath);
  let jsspSrcRoot = findJsspSrcRoot(resolvedTarget);
  if (!jsspSrcRoot) return findings;

  let xmlFiles = findWorkflowXmlFiles(resolvedTarget);

  // ワークフロー処理ファイルを特定
  let processingFiles = [];
  for (let i = 0; i < files.length; i++) {
    let f = files[i];
    if (!f.endsWith('.js')) continue;
    let norm = f.replace(/\\/g, '/');

    // action / arrive / rule / plugin 配下はすべて処理ファイル
    if (/\/workflow\/(action|arrive|rule|plugin)\//.test(norm)) {
      processingFiles.push({ file: f, type: getWfProcessType(norm) });
      continue;
    }

    // workflow ルート直下: 同名 .html がなければ処理ファイル（画面ではない）
    if (/\/workflow\/[^/]+\.js$/.test(norm)) {
      let htmlCounterpart = f.replace(/\.js$/, '.html').replace(/\\/g, '/');
      let hasHtml = files.some(function (x) { return x.replace(/\\/g, '/') === htmlCounterpart; });
      if (!hasHtml) processingFiles.push({ file: f, type: 'matter' });
    }
  }

  for (let i = 0; i < processingFiles.length; i++) {
    let pf = processingFiles[i];
    let scriptPath = pf.file.replace(/\\/g, '/').slice(jsspSrcRoot.length + 1).replace(/\.js$/, '');

    if (xmlFiles.length === 0) {
      findings.push({
        file: pf.file, line: 1,
        ruleId: 'WF-JS-009', severity: 'warning',
        message: 'IM-Workflow XML が見つかりません。スクリプトパス「' + scriptPath + '」の登録状況を手動で確認してください',
        matchedText: path.basename(pf.file)
      });
      continue;
    }

    let isRegistered = false;
    for (let j = 0; j < xmlFiles.length; j++) {
      let xmlContent = readXmlFileContent(xmlFiles[j]);
      if (xmlContent && xmlContent.indexOf(scriptPath) !== -1) { isRegistered = true; break; }
    }

    if (!isRegistered) {
      findings.push({
        file: pf.file, line: 1,
        ruleId: 'WF-JS-009', severity: 'error',
        message: getUnregisteredMessage(pf.type, scriptPath),
        matchedText: path.basename(pf.file)
      });
    }
  }

  return findings;
}

// 後方互換エイリアス
var checkActionProcessRegistration = checkWorkflowProcessRegistration;

// ========================================
// B. XML 登録スクリプトパスの JSSP ファイル存在チェック（ディレクトリレベル）
// ========================================
/**
 * IM-Workflow XML 内の全 <scriptPath> に対応する JS ファイルが
 * src/main/jssp/src/ 配下に存在するかチェックする。
 *
 * Warning 扱い: 他プロジェクト（JavaEE 等）の資材を参照している可能性があるため。
 */
function checkXmlScriptPathExists(targetPath) {
  let findings = [];

  let stat;
  try { stat = fs.statSync(targetPath); } catch (e) { return findings; }
  if (!stat.isDirectory()) return findings;

  let resolvedTarget = path.resolve(targetPath);
  let jsspSrcRoot = findJsspSrcRoot(resolvedTarget);
  if (!jsspSrcRoot) return findings;

  let xmlFiles = findWorkflowXmlFiles(resolvedTarget);
  if (xmlFiles.length === 0) return findings;

  for (let j = 0; j < xmlFiles.length; j++) {
    let xmlContent = readXmlFileContent(xmlFiles[j]);
    if (!xmlContent) continue;

    let pattern = /<scriptPath[^>]*>([^<]+)<\/scriptPath>/g;
    let match;
    let checked = {};
    while ((match = pattern.exec(xmlContent)) !== null) {
      let scriptPath = match[1].trim();
      if (!scriptPath || checked[scriptPath]) continue;
      checked[scriptPath] = true;

      let jsFile = path.join(jsspSrcRoot, scriptPath + '.js');
      if (!fs.existsSync(jsFile)) {
        findings.push({
          file: xmlFiles[j], line: 1,
          ruleId: 'WF-XML-001', severity: 'warning',
          message: 'XML に登録されたスクリプトパス「' + scriptPath + '」に対応する JS ファイルが見つかりません。' +
            '対処方針: ' +
            '(1) 画面ファイルを `jssp-im-workflow-usage` で生成する、または ' +
            '(2) 意図的に画面を省略する場合は `spec.json` の screens で該当キーに `false` を指定して再ビルド（推奨。警告ノイズを根絶できる）、または ' +
            '(3) 他プロジェクト（JavaEE 等）の資材を参照している場合はこの警告を無視。' +
            '期待されるパス: src/main/jssp/src/' + scriptPath + '.js',
          matchedText: scriptPath
        });
      }
    }
  }

  return findings;
}

// ========================================
// CLI 実行（直接実行された場合のみ）
// ========================================
if (require.main === module) {
  let targetPath = process.argv[2];
  if (!targetPath) {
    console.error('Usage: node validate-workflow-code.js <directory-or-file>');
    process.exit(2);
  }
  if (!fs.existsSync(targetPath)) {
    console.error('Path not found: ' + targetPath);
    process.exit(2);
  }

  // ファイル収集
  let files = common.collectFiles(targetPath);
  let jsHtmlFiles = files.filter(function (f) { return /\.(js|html)$/.test(f); });

  if (jsHtmlFiles.length === 0) {
    console.log('No .js/.html files found in ' + targetPath);
    process.exit(0);
  }

  // ファイルレベルのバリデーション
  let allFindings = [];
  for (let i = 0; i < jsHtmlFiles.length; i++) {
    let found = common.validateFile(jsHtmlFiles[i], mergedPatternRules, mergedFunctionRules);
    allFindings.push.apply(allFindings, found);
  }

  // ディレクトリレベルのチェック（DDL 存在確認 + 配置パス確認 + WF 処理登録確認 + XML パス存在確認）
  let jsFiles = jsHtmlFiles.filter(function (f) { return f.endsWith('.js'); });
  allFindings.push.apply(allFindings, common.checkDdlExists(targetPath, jsFiles));
  allFindings.push.apply(allFindings, checkWorkflowFileLocation(targetPath));
  allFindings.push.apply(allFindings, checkWorkflowProcessRegistration(targetPath));
  allFindings.push.apply(allFindings, checkXmlScriptPathExists(targetPath));

  // 結果出力
  if (allFindings.length === 0) {
    console.log('PASS: ' + jsHtmlFiles.length + ' file(s) checked, 0 issue(s)');
  } else {
    for (let i = 0; i < allFindings.length; i++) {
      let finding = allFindings[i];
      let icon = finding.severity === 'error' ? 'ERROR' : 'WARN ';
      console.log(icon + ' [' + finding.ruleId + '] ' + finding.file + ':' + finding.line);
      console.log('       ' + finding.message);
      console.log('       > ' + finding.matchedText);
      console.log();
    }
    let errors = allFindings.filter(function (f) { return f.severity === 'error'; }).length;
    let warnings = allFindings.filter(function (f) { return f.severity === 'warning'; }).length;
    console.log('Result: ' + errors + ' error(s), ' + warnings + ' warning(s) in ' + jsHtmlFiles.length + ' file(s)');
  }

  let errorCount = allFindings.filter(function (f) { return f.severity === 'error'; }).length;
  process.exit(errorCount > 0 ? 1 : 0);
}

// ========================================
// モジュールエクスポート（テスト用）
// ========================================
module.exports = { WF_RULES, WF_FUNCTION_RULES, checkWorkflowFileLocation, checkWorkflowProcessRegistration, checkActionProcessRegistration, checkXmlScriptPathExists };
