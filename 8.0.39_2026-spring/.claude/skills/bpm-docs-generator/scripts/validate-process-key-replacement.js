#!/usr/bin/env node
/*
 * validate-process-key-replacement.js
 *
 * BPMN 内の process id 置換メタ情報を機械判定で検証する。
 *
 * Usage:
 *   bun <このスクリプトのパス> <diagram.bpmn>
 *
 * Checks:
 *   [parseArgs]
 *            - CLI 引数（<diagram.bpmn>）を検証
 *   [extractProcessKeyTokens]
 *            - documentation から PROCESS_KEY_META:{...} トークンを抽出する（トークンの存在自体が置換済みを意味する）
 *   [validateProcess]
 *            - process 単位の整合性チェック
 *            - PROCESS_KEY / ORIGINAL_PROCESS_KEY  の必須項目チェック
 *            - process id と PROCESS_KEY の一致チェック
 *            - 戻り値に processId と PROCESS_KEY_META の processKey / originalProcessKey （未定義時は null）を含める
 *   [main]
 *            - BPMN 読込/解析、Process 要素存在チェック、集計、終了コード判定
 *            - 結果は JSON 形式で標準出力へ出力する
 *            - 同じ結果オブジェクト（JSON）を戻り値としても返す（fail() 経由の異常終了時も含む）
 *            - 終了コードは process.exitCode に設定し、戻り値が呼び出し元へ返るようにする
 */

const { nsType, readAndParseBpmnFile } = require('./bpmn-doc-utils');

/* nsType / BPMN ファイル読込・解析（readAndParseBpmnFile）は bpmn-doc-utils.js に集約している
 * （search-called-elements.js / validate-bpmn.js と共通）。 */

/* CLI 引数の妥当性をチェックし、実行オプションを確定する。 */
function parseArgs(argv) {
  if (argv.length !== 1) {
    throw new Error('Usage: bun ' + require('path').basename(__filename) + ' <diagram.bpmn>');
  }

  return { bpmnPath: argv[0] };
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

/* documentation から PROCESS_KEY_META トークンを抽出する（トークンの存在自体が置換済みを意味する）。 */
function extractProcessKeyTokens(docText) {
  const tokens = [];
  const regex = /PROCESS_KEY_META:\{([^{}\r\n]*)\}/g;
  let match;

  while ((match = regex.exec(docText)) !== null) {
    const tokenBody = match[1] || '';
    tokens.push(parseTokenPairs(tokenBody));
  }

  return tokens;
}

/* process 単位で必須項目・キー一致・ポリシーを検証し、errors を作成する。 */
function validateProcess(process) {
  const processId = process.id || '(missing process id)';
  const errors = [];

  const docText = collectDocumentationText(process);
  const docTokens = extractProcessKeyTokens(docText);
  const docToken = docTokens[docTokens.length - 1] || null;
  const status = docToken ? 'replaced' : 'none';

  if (docToken) {
    if (!docToken.PROCESS_KEY) {
      errors.push('documentation token is missing PROCESS_KEY');
    }
    if (!docToken.ORIGINAL_PROCESS_KEY) {
      errors.push('documentation token is missing ORIGINAL_PROCESS_KEY');
    }
    if (docToken.PROCESS_KEY && process.id && docToken.PROCESS_KEY !== process.id) {
      errors.push('documentation PROCESS_KEY does not match process id');
    }
    // PROCESS_KEY_METAには、REPOSITORY_OBJECT_IDもあるが、
    // プロセス定義キー置換には利用しないためチェック無。
  }

  return {
    processId: processId,
    status: status,
    processKey: docToken && docToken.PROCESS_KEY ? docToken.PROCESS_KEY : null,
    originalProcessKey: docToken && docToken.ORIGINAL_PROCESS_KEY ? docToken.ORIGINAL_PROCESS_KEY : null,
    errors: errors
  };
}

/* エラーメッセージを標準エラー出力へ出し、エラーレポート（JSON）を返す。終了コードは呼び出し元で設定する。 */
function fail(message) {
  console.error(message);
  return {
    ok: false,
    errorCount: 1,
    processes: [],
    errors: [message]
  };
}

/* 入力読込から検証実行、結果出力、終了コード決定までを統括する。 */
async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.exitCode = 1;
    return fail(err.message);
  }

  let definitions;
  try {
    definitions = await readAndParseBpmnFile(args.bpmnPath);
  } catch (err) {
    process.exitCode = 1;
    return fail('failed to read or parse BPMN file: ' + err.message);
  }

  const rootElements = definitions && Array.isArray(definitions.rootElements) ? definitions.rootElements : [];
  const processes = rootElements.filter(e => nsType(e) === 'Process');

  if (processes.length === 0) {
    const empty = {
      ok: false,
      errorCount: 1,
      processes: [],
      errors: ['process element does not exist']
    };

    console.log(JSON.stringify(empty, null, 2));
    process.exitCode = 1;
    return empty;
  }

  const results = processes.map(validateProcess);
  const errorCount = results.reduce((sum, row) => sum + row.errors.length, 0);

  const report = {
    ok: errorCount === 0,
    errorCount: errorCount,
    processes: results
  };

  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.ok ? 0 : 1;
  return report;
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  validateProcess,
  extractProcessKeyTokens
};
