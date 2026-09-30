#!/usr/bin/env node
/**
 * im_mirage（Mirage-SQL）2WaySQL コメント検証スクリプト
 *
 * Mirage-SQL の2WaySQLパーサはコメントの中身を区別せず、ファイル全体を走査して
 * テンプレート構文（/*IF*\/ /*BEGIN*\/ /*param*\/ 等）や ? を検出する。そのため、
 * 説明用のコメントの中にバインド名（/*orderId*\/ 等）や記号 ? をそのまま書くと、
 * コメントであるにもかかわらず本物のテンプレート指示だと誤認識され、コメントの
 * 中身とは無関係に見える実行時エラーになる（詳細: assets/mirage-basic-usage.md
 * 「SQLファイルに -- コメントを書かない」、.claude/rules/jssp-2way-sql.md 参照）。
 *
 * このスクリプトは独立実装であり、jssp-page-generator/scripts/validate-jssp-code.js
 * とはロジックを共有しない。プロジェクトによって java-im-mirage-usage / jssp-page-generator
 * のどちらか一方しか導入されないケースがあるため（配置有無がプロジェクト依存）、
 * スキルをまたいだ相互参照はしない方針としている。
 *
 * 終了コード: 0=OK, 1=エラーあり
 *
 * 使い方:
 *   node validate-mirage-sql-comments.js <ディレクトリまたはファイル>
 *   node validate-mirage-sql-comments.js src/main/resources/jp/co/example/foo/dao/
 */
const fs = require('fs');
const path = require('path');

// ========================================
// SQL ファイルから -- 行コメント / /* */ ブロックコメントを抽出する
// 文字列リテラル（'...'、'' はエスケープ）の中身は走査対象から除外する。
// 戻り値の各要素: { type: 'line'|'block', line: 0-indexed 開始行, body: コメント本文 }
// ========================================
function scanSqlComments(content) {
  let comments = [];
  let inString = false;
  let line = 0;

  for (let i = 0; i < content.length; i++) {
    let c = content[i];
    let next = content[i + 1];

    if (c === '\n') { line++; continue; }

    if (inString) {
      if (c === "'") {
        if (next === "'") { i++; continue; } // '' は文字列内のエスケープ
        inString = false;
      }
      continue;
    }
    if (c === "'") { inString = true; continue; }

    // -- 行コメント
    if (c === '-' && next === '-') {
      let end = content.indexOf('\n', i);
      if (end === -1) end = content.length;
      comments.push({ type: 'line', line: line, body: content.substring(i + 2, end) });
      i = end - 1;
      continue;
    }

    // /* */ ブロックコメント
    if (c === '/' && next === '*') {
      let end = content.indexOf('*/', i + 2);
      let hasClose = end !== -1;
      let bodyEnd = hasClose ? end : content.length;
      comments.push({ type: 'block', line: line, body: content.substring(i + 2, bodyEnd) });
      let consumedEnd = hasClose ? end + 2 : content.length;
      line += (content.substring(i, consumedEnd).match(/\n/g) || []).length;
      i = consumedEnd - 1;
      continue;
    }
  }

  return comments;
}

// ========================================
// 検証ルール
// ========================================
const RULES = [
  {
    id: 'MIRAGE-SQL-001',
    description: '-- 行コメントの使用（Mirage-SQL の2WaySQLファイルでは全面禁止）',
    message: 'Mirage-SQL の2WaySQL ファイルには -- コメントを書かないでください。2WaySQL パーサはコメントの中身を区別せずファイル全体を走査してテンプレート構文（/*IF*/ 等）や ? を検出するため、説明用の -- コメントの中にバインド名（例: /*orderId*/）や記号 ? をそのまま書くと本物のテンプレート指示と誤認識され、コメントとは無関係に見える実行時エラーになります。ファイルの説明は DAO クラス側の JavaDoc に書いてください',
    check: function(content) {
      let findings = [];
      for (let comment of scanSqlComments(content)) {
        if (comment.type === 'line') findings.push({ line: comment.line });
      }
      return findings;
    }
  },
  {
    id: 'MIRAGE-SQL-002',
    description: 'ブロックコメント本文に /* または ? が含まれている（誤クローズ・誤認識のリスク）',
    message: '/* */ コメントの本文に /* や ? が含まれています。/*IF*/ /*BEGIN*/ /*paramName*/ /*FOR ... in ...*/ 等の正規のテンプレート構文はこのような文字を含まないため、コメントの入れ子（最初の */ で早期にコメントが閉じ、残りが SQL 本文やテンプレート構文として実行される）や ? のバインド誤認識を引き起こす可能性があります。説明文はコメントに書かず、DAO クラス側の JavaDoc に書いてください',
    check: function(content) {
      let findings = [];
      for (let comment of scanSqlComments(content)) {
        if (comment.type === 'block' && (comment.body.indexOf('/*') !== -1 || comment.body.indexOf('?') !== -1)) {
          findings.push({ line: comment.line });
        }
      }
      return findings;
    }
  }
];

// ========================================
// ファイル収集・実行
// ========================================
function collectSqlFiles(targetPath) {
  let files = [];
  let stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (targetPath.endsWith('.sql')) files.push(targetPath);
  } else if (stat.isDirectory()) {
    let entries = fs.readdirSync(targetPath, { recursive: true });
    for (let entry of entries) {
      let fullPath = path.join(targetPath, entry);
      if (fs.statSync(fullPath).isFile() && fullPath.endsWith('.sql')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function validateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let lines = content.split('\n');
  let findings = [];

  for (let rule of RULES) {
    for (let hit of rule.check(content)) {
      findings.push({
        file: filePath,
        line: hit.line + 1,
        severity: 'error',
        ruleId: rule.id,
        message: rule.message,
        matchedText: (lines[hit.line] || '').trim().substring(0, 80)
      });
    }
  }

  return findings;
}

function run(targetPath) {
  let files = collectSqlFiles(targetPath);

  if (files.length === 0) {
    console.log('No .sql files found in ' + targetPath);
    return { errors: 0, fileCount: 0 };
  }

  let allFindings = [];
  for (let file of files) {
    allFindings.push(...validateFile(file));
  }

  if (allFindings.length === 0) {
    console.log('PASS: ' + files.length + ' file(s) checked, 0 issue(s)');
  } else {
    for (let finding of allFindings) {
      console.log('ERROR [' + finding.ruleId + '] ' + finding.file + ':' + finding.line);
      console.log('       ' + finding.message);
      console.log('       > ' + finding.matchedText);
      console.log();
    }
    console.log('Result: ' + allFindings.length + ' error(s) in ' + files.length + ' file(s)');
  }

  return { errors: allFindings.length, fileCount: files.length };
}

// ========================================
// CLI 実行
// ========================================
if (require.main === module) {
  let targetPath = process.argv[2];
  if (!targetPath) {
    console.error('Usage: node validate-mirage-sql-comments.js <directory-or-file>');
    process.exit(2);
  }
  if (!fs.existsSync(targetPath)) {
    console.error('Path not found: ' + targetPath);
    process.exit(2);
  }

  let result = run(targetPath);
  process.exit(result.errors > 0 ? 1 : 0);
}

module.exports = { scanSqlComments, RULES, collectSqlFiles, validateFile, run };
