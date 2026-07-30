#!/usr/bin/env node
/*
 * validate-process-key-replacement.js
 *
 * BPMN 内の process id 置換メタ情報を機械判定で検証する。
 *
 * Usage:
 *   {{RUNTIME}} <このスクリプトのパス> <diagram.bpmn>
 *   {{RUNTIME}} <このスクリプトのパス> <diagram.bpmn> --json
 *
 * Checks:
 *   [parseArgs]
 *            - CLI 引数（<diagram.bpmn>, --json）を検証
 *   [extractProcessKeyTokens]
 *            - documentation から PROCESS_KEY_META:PROCESS_KEY_REPLACED=true トークンを抽出
 *   [classify]
 *            - 置換状態を分類（documentation-only / none）
 *   [validateProcess]
 *            - process 単位の整合性チェック
 *            - PROCESS_KEY / ORIGINAL_PROCESS_KEY の必須項目チェック
 *            - process id と PROCESS_KEY の一致チェック
 *            - replacePolicy=initial-only 推奨チェック（不一致は warning）
 *            - 戻り値に processId と PROCESS_KEY_META の processKey / originalProcessKey（未定義時は null）を含める
 *   [main]
 *            - BPMN 読込/解析、Process 要素存在チェック、集計、終了コード判定
 *   [printTextReport]
 *            - テキスト形式の結果出力（process ごとの status / error / warning）
 *            - JSON 形式は --json 指定時に main から出力
 */

const fs = require('fs');
const BpmnModdle = require('bpmn-moddle');

/* CLI 引数の妥当性をチェックし、実行オプションを確定する。 */
function parseArgs(argv) {
  const args = {
    bpmnPath: null,
    json: false
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!args.bpmnPath && !a.startsWith('--')) {
      args.bpmnPath = a;
      continue;
    }

    if (a === '--json') {
      args.json = true;
      continue;
    }

    throw new Error('Unknown argument: ' + a);
  }

  if (!args.bpmnPath) {
    throw new Error('Usage: {{RUNTIME}} ' + require('path').basename(__filename) + ' <diagram.bpmn> [--json]');
  }

  return args;
}

/* BPMN要素の型名から名前空間プレフィックスを除いた型名を取得する。 */
function nsType(element) {
  if (!element || !element.$type) return '';
  const index = element.$type.indexOf(':');
  return index >= 0 ? element.$type.slice(index + 1) : element.$type;
}

/* true/false を示す文字列表現を真偽値として解釈する。 */
function parseBoolean(value) {
  return value === true || value === 'true' || value === '1';
}

/* documentation 配下のテキストを連結し、トークン解析用の文字列を作る。 */
function collectDocumentationText(process) {
  const docs = Array.isArray(process.documentation) ? process.documentation : [];
  const lines = [];
  for (const doc of docs) {
    const text = doc && typeof doc.text === 'string' ? doc.text : (doc && typeof doc.body === 'string' ? doc.body : '');
    if (!text) continue;
    lines.push(text);
  }
  return lines.join('\n');
}

/* PROCESS_KEY_META トークンを key=value 形式で分解する。 */
function parseTokenPairs(tokenBody) {
  const parts = String(tokenBody).split(';');
  const data = {};

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex <= 0) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim();
    if (!key) continue;
    data[key] = value;
  }

  return data;
}

/* documentation から PROCESS_KEY_REPLACED=true の置換トークンのみ抽出する。 */
function extractProcessKeyTokens(docText) {
  const tokens = [];
  const regex = /PROCESS_KEY_META:([^\r\n]+)/g;
  let match;

  while ((match = regex.exec(docText)) !== null) {
    const tokenBody = match[1] || '';
    const data = parseTokenPairs(tokenBody);
    if (parseBoolean(data.PROCESS_KEY_REPLACED)) {
      tokens.push(data);
    }
  }

  return tokens;
}

/* documentation の検出有無から置換状態を分類する。 */
function classify(docReplaced) {
  if (docReplaced) return 'documentation-only';
  return 'none';
}

/* process 単位で必須項目・キー一致・ポリシーを検証し、errors/warnings を作成する。 */
function validateProcess(process) {
  const processId = process.id || '(missing process id)';
  const errors = [];
  const warnings = [];

  const docText = collectDocumentationText(process);
  const docTokens = extractProcessKeyTokens(docText);
  const docToken = docTokens.length > 0 ? docTokens[docTokens.length - 1] : null;
  const docReplaced = !!docToken;

  if (docTokens.length > 1) {
    warnings.push('documentation token exists multiple times; latest token is used for validation');
  }

  const status = classify(docReplaced);

  if (docReplaced) {
    if (!docToken.PROCESS_KEY) {
      errors.push('documentation token is missing PROCESS_KEY');
    }
    if (!docToken.ORIGINAL_PROCESS_KEY) {
      errors.push('documentation token is missing ORIGINAL_PROCESS_KEY');
    }
    if (docToken.PROCESS_KEY && process.id && docToken.PROCESS_KEY !== process.id) {
      errors.push('documentation PROCESS_KEY does not match process id');
    }
  }

  if (docReplaced && docToken.REPLACE_POLICY && docToken.REPLACE_POLICY !== 'initial-only') {
    warnings.push('documentation token REPLACE_POLICY is not initial-only');
  }

  return {
    processId: processId,
    status: status,
    processKey: docToken && docToken.PROCESS_KEY ? docToken.PROCESS_KEY : null,
    originalProcessKey: docToken && docToken.ORIGINAL_PROCESS_KEY ? docToken.ORIGINAL_PROCESS_KEY : null,
    detail: {
      documentationDetected: docReplaced,
      documentationToken: docToken
    },
    errors: errors,
    warnings: warnings
  };
}

/* BPMN XML をパースし、definitions(rootElement) を返す。 */
async function parseBpmn(xml) {
  const moddle = new BpmnModdle();
  const parsed = await moddle.fromXML(xml);
  return parsed && parsed.rootElement ? parsed.rootElement : parsed;
}

/* 人間向けのテキストレポートを整形出力する。 */
function printTextReport(report) {
  console.error('Process key replacement validation');
  console.error('--------------------------------');

  for (const item of report.processes) {
    console.error('Process:', item.processId);
    console.error('  status:', item.status);
    console.error('  processKey:', item.processKey || '(none)');
    console.error('  originalProcessKey:', item.originalProcessKey || '(none)');

    if (item.errors.length === 0 && item.warnings.length === 0) {
      console.error('  result: OK');
    }

    for (const warning of item.warnings) {
      console.error('  WARN :', warning);
    }

    for (const err of item.errors) {
      console.error('  ERROR:', err);
    }
  }

  console.error('--------------------------------');
  if (report.ok) {
    console.error('PASS (' + report.warningCount + ' warning(s))');
  } else {
    console.error('FAIL (' + report.errorCount + ' error(s), ' + report.warningCount + ' warning(s))');
  }
}

/* 入力読込から検証実行、結果出力、終了コード決定までを統括する。 */
async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
    return;
  }

  let xml;
  try {
    xml = fs.readFileSync(args.bpmnPath, 'utf8');
  } catch (err) {
    console.error('failed to read file:', err.message);
    process.exit(1);
    return;
  }

  let definitions;
  try {
    definitions = await parseBpmn(xml);
  } catch (err) {
    console.error('failed to parse BPMN XML:', err.message);
    process.exit(1);
    return;
  }

  const rootElements = definitions && Array.isArray(definitions.rootElements) ? definitions.rootElements : [];
  const processes = rootElements.filter(e => nsType(e) === 'Process');

  if (processes.length === 0) {
    const empty = {
      ok: false,
      errorCount: 1,
      warningCount: 0,
      processes: [],
      errors: ['process element does not exist']
    };

    if (args.json) {
      console.log(JSON.stringify(empty, null, 2));
    } else {
      console.error('ERROR: process element does not exist');
      console.error('FAIL (1 error(s), 0 warning(s))');
    }

    process.exit(1);
    return;
  }

  const results = processes.map(validateProcess);
  const errorCount = results.reduce((sum, row) => sum + row.errors.length, 0);
  const warningCount = results.reduce((sum, row) => sum + row.warnings.length, 0);

  const report = {
    ok: errorCount === 0,
    errorCount: errorCount,
    warningCount: warningCount,
    processes: results
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printTextReport(report);
  }

  process.exit(report.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  validateProcess,
  extractProcessKeyTokens,
  classify
};
