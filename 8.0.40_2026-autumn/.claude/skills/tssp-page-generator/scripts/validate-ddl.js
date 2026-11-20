#!/usr/bin/env node
/**
 * DDL 型マッピング検証スクリプト
 *
 * 生成した DDL ファイルが .claude/rules/database-ddl.md の推奨型に従っているかを検証する。
 * ファイル名のサフィックス（_postgre / _oracle / _sqlserver）で DB 製品を判定し、
 * CREATE TABLE 文内のカラム型が推奨型と一致しているかチェックする。
 *
 * 使い方:
 *   node validate-ddl.js <ディレクトリまたはファイル>
 *   node validate-ddl.js src/main/storage/system/products/import/basic/{機能名}/{version}/
 */
const fs = require('fs');
const path = require('path');

// ========================================
// DB 製品ごとの許可型リスト
// ========================================
const ALLOWED_TYPES = {
  postgre: {
    string: ['VARCHAR'],
    numeric: ['DECIMAL', 'INTEGER', 'BIGINT', 'SMALLINT', 'SERIAL', 'BIGSERIAL'],
    date: ['DATE'],
    time: ['TIME'],
    datetime: ['TIMESTAMP'],
    bool: ['BOOLEAN'],
    lob: ['TEXT'],
    // 禁止型
    forbidden: [
      { pattern: /\bNVARCHAR\b/i, message: 'PostgreSQL では NVARCHAR ではなく VARCHAR を使用してください' },
      { pattern: /\bNUMBER\b/i, message: 'PostgreSQL では NUMBER ではなく DECIMAL を使用してください' },
      { pattern: /\bTIMESTAMP\s+WITH\s+TIME\s*ZONE\b/i, message: 'PostgreSQL の TIMESTAMP には with timezone を指定しないでください' },
      { pattern: /\bTIME\s+WITH\s+TIME\s*ZONE\b/i, message: 'PostgreSQL の TIME には with timezone を指定しないでください' },
      { pattern: /\bDATETIME2?\b/i, message: 'PostgreSQL では DATETIME/DATETIME2 ではなく TIMESTAMP を使用してください' },
      { pattern: /\bCLOB\b/i, message: 'PostgreSQL では CLOB ではなく TEXT を使用してください' },
      { pattern: /\bVARCHAR2\b/i, message: 'PostgreSQL では VARCHAR2 ではなく VARCHAR を使用してください' },
      { pattern: /\bBOOLEAN\b/i, message: "真偽値には BOOLEAN ではなく CHAR(1) を使用してください（'0'=false, '1'=true）" },
      { pattern: /\bBIT\b/i, message: "真偽値には BIT ではなく CHAR(1) を使用してください（'0'=false, '1'=true）" }
    ]
  },
  oracle: {
    string: ['VARCHAR2'],
    numeric: ['NUMBER', 'INTEGER'],
    date: ['DATE'],
    time: ['DATE'],
    datetime: ['TIMESTAMP'],
    bool: ['NUMBER'],
    lob: ['CLOB'],
    forbidden: [
      { pattern: /\bVARCHAR\s*\(/i, message: 'Oracle では VARCHAR ではなく VARCHAR2 を使用してください', exclude: /VARCHAR2/ },
      { pattern: /\bNVARCHAR2\b/i, message: 'Oracle では NVARCHAR2 ではなく VARCHAR2 を使用してください' },
      { pattern: /\bDECIMAL\b/i, message: 'Oracle では DECIMAL ではなく NUMBER を使用してください' },
      { pattern: /\bDATETIME2?\b/i, message: 'Oracle では DATETIME/DATETIME2 ではなく DATE または TIMESTAMP を使用してください' },
      { pattern: /\bBOOLEAN\b/i, message: "真偽値には BOOLEAN ではなく CHAR(1) を使用してください（'0'=false, '1'=true）" },
      { pattern: /\bTEXT\b/i, message: 'Oracle では TEXT ではなく CLOB を使用してください' },
      { pattern: /\bNVARCHAR\s*\(/i, message: 'Oracle では NVARCHAR ではなく VARCHAR2 を使用してください' },
      { pattern: /\bBIT\b/i, message: "真偽値には BIT ではなく CHAR(1) を使用してください（'0'=false, '1'=true）" }
    ]
  },
  sqlserver: {
    string: ['NVARCHAR'],
    numeric: ['DECIMAL', 'INT', 'BIGINT', 'SMALLINT'],
    date: ['DATETIME2'],
    time: ['DATETIME2'],
    datetime: ['DATETIME2'],
    bool: ['BIT'],
    lob: ['NVARCHAR(MAX)'],
    forbidden: [
      { pattern: /\bVARCHAR\s*\(/i, message: 'SQLServer では VARCHAR ではなく NVARCHAR を使用してください', exclude: /NVARCHAR/ },
      { pattern: /\bVARCHAR2\b/i, message: 'SQLServer では VARCHAR2 ではなく NVARCHAR を使用してください' },
      { pattern: /\bNUMBER\b/i, message: 'SQLServer では NUMBER ではなく DECIMAL を使用してください' },
      { pattern: /\bTIMESTAMP\b/i, message: 'SQLServer では TIMESTAMP ではなく DATETIME2 を使用してください' },
      { pattern: /\b(?<!DATETIME)DATE\b/i, message: 'SQLServer では DATE ではなく DATETIME2 を使用してください' },
      { pattern: /\bBOOLEAN\b/i, message: "真偽値には BOOLEAN ではなく CHAR(1) を使用してください（'0'=false, '1'=true）" },
      { pattern: /\bBIT\b/i, message: "真偽値には BIT ではなく CHAR(1) を使用してください（'0'=false, '1'=true）" },
      { pattern: /\bCLOB\b/i, message: 'SQLServer では CLOB ではなく NVARCHAR(max) を使用してください' },
      { pattern: /\bTEXT\b/i, message: 'SQLServer では TEXT ではなく NVARCHAR(max) を使用してください' }
    ]
  }
};

// ========================================
// CONSTRAINT グローバルルール（DB 製品共通）
// CREATE TABLE 内およびその他の箇所で検出される制約のルール
// ========================================
const CONSTRAINT_RULES = [
  {
    pattern: /\bFOREIGN\s+KEY\b/i,
    message: 'FOREIGN KEY 制約は使用しないでください。参照整合性はアプリケーション側で担保してください'
  },
  {
    pattern: /\bCHECK\s*\(/i,
    message: 'CHECK 制約は使用しないでください。値の検証はアプリケーション側で担保してください'
  },
  {
    pattern: /\bEXCLUDE\s+(USING\s+\w+\s*)?\(/i,
    message: 'EXCLUDE 制約は使用しないでください（DB 製品・データ型の組み合わせでインポート失敗の原因になります）。排他制御はアプリケーション側のトランザクションで担保してください'
  }
];

// ========================================
// 禁止 DDL 文（ファイル全体を対象）
// DDL はテーブル・プライマリキー・一意制約・インデックスのみ許可し、
// 関数・トリガー・プロシージャ・EXCLUDE 制約の ALTER TABLE などは禁止する
// ========================================
const FORBIDDEN_STATEMENTS = [
  {
    pattern: /\bCREATE\s+(OR\s+REPLACE\s+)?FUNCTION\b/i,
    message: 'CREATE FUNCTION は使用しないでください。DDL はテーブル・PK・UK・インデックスのみ許可します（関数を使うとインポート失敗するケースがあります）'
  },
  {
    pattern: /\bCREATE\s+(OR\s+REPLACE\s+)?TRIGGER\b/i,
    message: 'CREATE TRIGGER は使用しないでください。DDL はテーブル・PK・UK・インデックスのみ許可します（トリガーを使うとインポート失敗するケースがあります）'
  },
  {
    pattern: /\bCREATE\s+(OR\s+REPLACE\s+)?PROCEDURE\b/i,
    message: 'CREATE PROCEDURE は使用しないでください。DDL はテーブル・PK・UK・インデックスのみ許可します'
  },
  {
    pattern: /\bCREATE\s+(OR\s+REPLACE\s+)?VIEW\b/i,
    message: 'CREATE VIEW は使用しないでください。DDL はテーブル・PK・UK・インデックスのみ許可します'
  },
  {
    pattern: /\bALTER\s+TABLE\b[\s\S]*?\bADD\s+CONSTRAINT\b[\s\S]*?\b(EXCLUDE|CHECK|FOREIGN\s+KEY)\b/i,
    multiline: true,
    message: 'ALTER TABLE で EXCLUDE / CHECK / FOREIGN KEY 制約を追加しないでください。これらの制約はそもそも使用禁止です'
  }
];

// ========================================
// DB 製品判定
// ========================================
function detectDbType(filePath) {
  let name = path.basename(filePath).toLowerCase();
  if (name.includes('_postgre')) return 'postgre';
  if (name.includes('_oracle')) return 'oracle';
  if (name.includes('_sqlserver')) return 'sqlserver';
  return null;
}

// ========================================
// DML ファイル判定（ファイル名に -dml_<dialect> または末尾 -dml が含まれる）
// ========================================
function isDmlFile(filePath) {
  let name = path.basename(filePath).toLowerCase();
  return /-dml(_(postgre|oracle|sqlserver))?\.sql$/i.test(name);
}

// ========================================
// DML 共通ルール（PostgreSQL / Oracle / SQLServer で共通して動作する構文のみ許可）
// ========================================
const DML_RULES = [
  {
    pattern: /\{\s*d\s+'[^']*'\s*\}/i,
    message: "ODBC 日付エスケープ {d 'YYYY-MM-DD'} は PostgreSQL で構文エラーになります。プレーン文字列 'YYYY-MM-DD' を使用してください（DATE カラムへ暗黙変換されます）"
  },
  {
    pattern: /\{\s*t\s+'[^']*'\s*\}/i,
    message: "ODBC 時刻エスケープ {t 'HH:MM:SS'} は使用しないでください。プレーン文字列 'HH:MM:SS' を使用してください"
  },
  {
    pattern: /\{\s*ts\s+'[^']*'\s*\}/i,
    message: "ODBC タイムスタンプエスケープ {ts 'YYYY-MM-DD HH:MM:SS'} は使用しないでください。プレーン文字列 'YYYY-MM-DD HH:MM:SS' を使用してください"
  },
  {
    pattern: /\{\s*fn\s+\w+\s*\(/i,
    message: 'ODBC 関数エスケープ {fn ...} は使用しないでください。各 DB 標準の関数構文を使用してください'
  },
  {
    pattern: /\{\s*oj\s+/i,
    message: 'ODBC 外部結合エスケープ {oj ...} は使用しないでください。LEFT/RIGHT/FULL OUTER JOIN を標準 SQL で記述してください'
  },
  {
    pattern: /\{\s*call\s+\w+/i,
    message: 'ODBC プロシージャコールエスケープ {call ...} は使用しないでください'
  }
];

// ========================================
// DML 検証
// ========================================
function validateDmlFile(filePath) {
  let findings = [];
  let content = fs.readFileSync(filePath, 'utf-8');
  let lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('--')) continue;

    for (let rule of DML_RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          file: filePath,
          line: i + 1,
          severity: 'error',
          message: '[DML] ' + rule.message,
          matchedText: trimmed.substring(0, 80)
        });
      }
    }
  }

  return findings;
}

// ========================================
// DDL 検証
// ========================================
function validateDdlFile(filePath) {
  let findings = [];
  let dbType = detectDbType(filePath);

  if (!dbType) {
    // DB 製品がファイル名から判定できない場合はスキップ
    return findings;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let lines = content.split('\n');
  let rules = ALLOWED_TYPES[dbType];

  // ========================================
  // 1. 禁止 DDL 文（ファイル全体を対象）
  // ========================================
  for (let rule of FORBIDDEN_STATEMENTS) {
    if (rule.multiline) {
      // ファイル全体に対してマルチライン検索
      let match = content.match(rule.pattern);
      if (match) {
        // マッチ開始位置の行番号を算出
        let beforeMatch = content.substring(0, content.indexOf(match[0]));
        let lineNumber = beforeMatch.split('\n').length;
        findings.push({
          file: filePath,
          line: lineNumber,
          severity: 'error',
          message: rule.message,
          matchedText: match[0].split('\n')[0].trim().substring(0, 80)
        });
      }
    } else {
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('--')) continue;
        if (rule.pattern.test(line)) {
          findings.push({
            file: filePath,
            line: i + 1,
            severity: 'error',
            message: rule.message,
            matchedText: trimmed.substring(0, 80)
          });
        }
      }
    }
  }

  // ========================================
  // 2. CREATE TABLE 文内のカラム型・制約チェック
  // ========================================
  let inCreateTable = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (/CREATE\s+TABLE/i.test(line)) {
      inCreateTable = true;
      continue;
    }
    if (inCreateTable && /^\s*\)/.test(line)) {
      inCreateTable = false;
      continue;
    }

    if (!inCreateTable) continue;

    // コメント行はスキップ
    let trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('--')) {
      continue;
    }

    // CONSTRAINT グローバルルールチェック（FOREIGN KEY / CHECK）
    for (let rule of CONSTRAINT_RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          file: filePath,
          line: i + 1,
          severity: 'error',
          message: rule.message,
          matchedText: trimmed.substring(0, 80)
        });
      }
    }

    // インデックス行・CONSTRAINT 行は型チェックをスキップ
    if (/^(CONSTRAINT|PRIMARY|UNIQUE|INDEX|FOREIGN)/i.test(trimmed)) {
      continue;
    }

    // 禁止型チェック
    for (let rule of rules.forbidden) {
      if (rule.pattern.test(line)) {
        // exclude パターンがある場合、それにもマッチしたら除外
        if (rule.exclude && rule.exclude.test(line)) continue;
        findings.push({
          file: filePath,
          line: i + 1,
          severity: 'error',
          message: '[' + dbType.toUpperCase() + '] ' + rule.message,
          matchedText: trimmed.substring(0, 80)
        });
      }
    }
  }

  return findings;
}

// ========================================
// コメント内セミコロン検証（DDL / DML 共通）
//
// Importer（SQLFileImporter）は SQL ファイルの中身を正規表現 ";\s*\n?" で機械的に
// 分割してから 1 文ずつ実行する。SQL 構文を解釈しないため、コメント内のセミコロンでも
// 文が分断され、断片やコメントだけの塊が単独の SQL として実行されて失敗する。
// しかも 1 文でも失敗すると、そのファイルの残り全文が実行されない。
// ========================================
function validateSqlComments(filePath) {
  let findings = [];
  let content = fs.readFileSync(filePath, 'utf-8');
  let message = 'SQL のコメント内にセミコロン（;）が含まれています。Importer はファイル全体を ";\\s*\\n?" で'
    + '機械的に分割して 1 文ずつ実行するため、コメント内のセミコロンでも文が分断され、断片が単独の SQL として'
    + '実行されてインポートに失敗します（1 文でも失敗するとそのファイルの残り全文が実行されません）。'
    + 'コメントからセミコロンを削除してください';
  let inString = false;
  let line = 1;

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
      let comment = content.substring(i, end);
      if (comment.indexOf(';') !== -1) {
        findings.push({
          file: filePath, line: line, severity: 'error',
          message: '[COMMENT] ' + message,
          matchedText: comment.trim().substring(0, 80)
        });
      }
      i = end - 1;
      continue;
    }

    // /* */ ブロックコメント
    if (c === '/' && next === '*') {
      let end = content.indexOf('*/', i + 2);
      let body = (end === -1) ? content.substring(i) : content.substring(i, end + 2);
      if (body.indexOf(';') !== -1) {
        findings.push({
          file: filePath, line: line, severity: 'error',
          message: '[COMMENT] ' + message,
          matchedText: body.split('\n')[0].trim().substring(0, 80)
        });
      }
      line += (body.match(/\n/g) || []).length;
      i += body.length - 1;
      continue;
    }
  }

  return findings;
}

// ========================================
// 文末セミコロン欠落検証（DDL / DML 共通）
//
// Importer の分割単位（チャンク）は 1 文としてそのまま実行されるため、文と文の間の
// セミコロンが抜けていると複数の文が 1 文として実行され構文エラーになる。
// （最後の文のセミコロン抜けはチャンクが分かれないだけで害は無いため検出しない）
// コメント内のセミコロンは分割位置を変えてしまうので、コメントを除去してから分割する。
// ========================================
const STATEMENT_HEAD_PATTERN = /^[ \t]*(CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|MERGE|TRUNCATE|GRANT|REVOKE|COMMENT)\b/gim;

// コメントを空白に置き換える（行番号を保つため改行はそのまま残す）
function stripSqlComments(content) {
  let out = '';
  let inString = false;
  for (let i = 0; i < content.length; i++) {
    let c = content[i];
    let next = content[i + 1];
    if (inString) {
      out += c;
      if (c === "'") {
        if (next === "'") { out += next; i++; continue; }
        inString = false;
      }
      continue;
    }
    if (c === "'") { inString = true; out += c; continue; }
    if ((c === '-' && next === '-') || (c === '/' && next === '*')) {
      let stop;
      if (c === '-') {
        stop = content.indexOf('\n', i);
        if (stop === -1) stop = content.length;
      } else {
        let end = content.indexOf('*/', i + 2);
        stop = (end === -1) ? content.length : end + 2;
      }
      for (let k = i; k < stop; k++) out += (content[k] === '\n') ? '\n' : ' ';
      i = stop - 1;
      continue;
    }
    out += c;
  }
  return out;
}

function validateStatementTerminators(filePath) {
  let findings = [];
  let content = fs.readFileSync(filePath, 'utf-8');
  let stripped = stripSqlComments(content);
  let lines = content.split('\n');

  // Importer と同じ分割
  let chunks = [];
  let re = /;\s*\n?/g;
  let last = 0;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    chunks.push({ text: stripped.substring(last, m.index), start: last });
    last = re.lastIndex;
  }
  chunks.push({ text: stripped.substring(last), start: last });

  for (let chunk of chunks) {
    let heads = [];
    let head;
    STATEMENT_HEAD_PATTERN.lastIndex = 0;
    while ((head = STATEMENT_HEAD_PATTERN.exec(chunk.text)) !== null) {
      heads.push(head.index);
    }
    // 1 チャンクに文頭が 2 個以上 = 直前の文の終端セミコロンが抜けている
    if (heads.length < 2) continue;
    let lineNumber = content.substring(0, chunk.start + heads[1]).split('\n').length;
    findings.push({
      file: filePath,
      line: lineNumber,
      severity: 'error',
      message: '[TERMINATOR] 直前の SQL 文の終端にセミコロン（;）が付いていない可能性があります。'
        + 'Importer はファイル全体を ";\\s*\\n?" で分割して 1 文ずつ実行するため、区切りが無いと複数の文が'
        + '1 文として実行され構文エラーになります（1 文でも失敗するとそのファイルの残り全文が実行されません）。'
        + '各 SQL 文の終端にセミコロンを付けてください',
      matchedText: (lines[lineNumber - 1] || '').trim().substring(0, 80)
    });
  }

  return findings;
}

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

function run(targetPath) {
  let files = collectSqlFiles(targetPath);
  let ddlFiles = files.filter(f => detectDbType(f) !== null);
  let dmlFiles = files.filter(f => isDmlFile(f));
  let totalCount = ddlFiles.length + dmlFiles.length;

  if (totalCount === 0) {
    console.log('No DDL/DML files (*-ddl_postgre.sql / *-ddl_oracle.sql / *-ddl_sqlserver.sql / *-dml_postgre.sql / *-dml_oracle.sql / *-dml_sqlserver.sql) found in ' + targetPath);
    return { errors: 0, warnings: 0, fileCount: 0 };
  }

  let allFindings = [];
  for (let file of ddlFiles) {
    allFindings.push(...validateDdlFile(file));
  }
  for (let file of dmlFiles) {
    allFindings.push(...validateDmlFile(file));
  }
  // コメント内セミコロンは DDL / DML 共通。両リストに含まれるファイル
  // （例: xxx-dml_postgre.sql）を二重に報告しないよう重複を除いて検査する。
  let commentTargets = ddlFiles.slice();
  for (let file of dmlFiles) {
    if (commentTargets.indexOf(file) === -1) commentTargets.push(file);
  }
  for (let file of commentTargets) {
    allFindings.push(...validateSqlComments(file));
    allFindings.push(...validateStatementTerminators(file));
  }

  let errors = allFindings.filter(f => f.severity === 'error');
  let warnings = allFindings.filter(f => f.severity === 'warning');

  if (allFindings.length === 0) {
    console.log('PASS: ' + ddlFiles.length + ' DDL / ' + dmlFiles.length + ' DML file(s) checked, 0 issue(s)');
  } else {
    for (let finding of allFindings) {
      let icon = finding.severity === 'error' ? 'ERROR' : 'WARN ';
      console.log(icon + ' ' + finding.file + ':' + finding.line);
      console.log('       ' + finding.message);
      console.log('       > ' + finding.matchedText);
      console.log();
    }
    console.log('Result: ' + errors.length + ' error(s), ' + warnings.length + ' warning(s) in ' + ddlFiles.length + ' DDL / ' + dmlFiles.length + ' DML file(s)');
  }

  return { errors: errors.length, warnings: warnings.length, fileCount: ddlFiles.length + dmlFiles.length };
}

// ========================================
// CLI 実行
// ========================================
let targetPath = process.argv[2];
if (!targetPath) {
  console.error('Usage: node validate-ddl.js <directory-or-file>');
  process.exit(2);
}
if (process.argv.length > 3) {
  let ignoredArgs = process.argv.slice(3);
  console.error('Error: このスクリプトは 1 個のパス（ディレクトリまたは単一ファイル）のみ受け付けます。');
  console.error('  渡されたパス: ' + targetPath);
  console.error('  無視される追加引数: ' + ignoredArgs.join(', '));
  console.error('');
  console.error('複数ファイルをまとめて検証する場合は、個々のファイルではなく共通の親ディレクトリを渡してください。');
  process.exit(2);
}
if (!fs.existsSync(targetPath)) {
  console.error('Path not found: ' + targetPath);
  process.exit(2);
}

let result = run(targetPath);
process.exit(result.errors > 0 ? 1 : 0);
