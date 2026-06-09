#!/usr/bin/env node
/**
 * i18n プロパティファイル バリデーションスクリプト
 *
 * メッセージプロパティファイルの正当性を検証します。
 *
 * 検証項目:
 *   1. 12ファイルが存在する（3カテゴリ × 4ロケール）
 *   2. デフォルトファイル（接尾辞なし）と _en ファイルが同一内容
 *   3. カテゴリ内でキーセットが全ロケール間で一致する
 *   4. キー命名規則（CAP.Z.IWP.* / MSG.[EWIC].IWP.* / [EWIC].IWP.*）
 *   5. 英語ファイル（default/_en）に非 ASCII 文字が含まれていない
 *   6. 日本語/中国語ファイルで非 ASCII 文字が \uXXXX 形式でエスケープされている
 *   7. ファイルの改行コードが LF である
 *   8. caption キーが `value=$title` / `value=$subTitle` バインド変数参照として
 *      ソースファイルに残存していないか（ソースディレクトリを追加指定した場合）
 *
 * Usage:
 *   node validate-i18n.js <messageDir>
 *   node validate-i18n.js <messageDir> --src <jssp_src_dir>
 *
 * Example:
 *   node validate-i18n.js src/main/conf/message/sample/expense_report
 *   node validate-i18n.js src/main/conf/message/sample/expense_report \
 *        --src src/main/jssp/src/sample/expense_report
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ============================================================
// CLI 引数解析
// ============================================================

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.log('Usage: node validate-i18n.js <messageDir> [--src <jssp_src_dir>]');
  process.exit(0);
}

const messageDir = path.resolve(args[0]);
const srcIndex   = args.indexOf('--src');
const srcDir     = srcIndex !== -1 ? path.resolve(args[srcIndex + 1]) : null;

const issues  = [];
const notices = [];

function error(msg)  { issues.push('ERROR: ' + msg); }
function warn(msg)   { issues.push('WARN:  ' + msg); }
function notice(msg) { notices.push('INFO:  ' + msg); }

// ============================================================
// ユーティリティ
// ============================================================

const CATEGORIES = ['caption', 'message', 'log-message'];
const SUFFIXES   = ['', '_en', '_ja', '_zh_CN'];

function filePath(category, suffix) {
  return path.join(messageDir, category + suffix + '.properties');
}

/**
 * プロパティファイルをパースして { key → value } マップを返す
 * コメント行・空行・継続行（\\で終わる行）は処理対象外
 */
function parseProperties(content) {
  var map  = {};
  var lines = content.split(/\n/);
  lines.forEach(function(line) {
    var trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) return;
    var eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    var key   = trimmed.slice(0, eqIndex).trim();
    var value = trimmed.slice(eqIndex + 1);
    map[key] = value;
  });
  return map;
}

/**
 * ファイルを UTF-8 で読み込む。存在しない場合は null を返す
 */
function readFile(fp) {
  if (!fs.existsSync(fp)) return null;
  return fs.readFileSync(fp, 'utf8');
}

/**
 * プロパティ値（エスケープ済み）から非 ASCII 文字（生）が含まれるか確認
 * \uXXXX は合法なのでチェック対象外
 */
function hasRawNonAscii(str) {
  // \uXXXX を除去してから非 ASCII を検索
  var withoutEscapes = str.replace(/\\u[0-9a-fA-F]{4}/g, '____');
  return /[^\x00-\x7F]/.test(withoutEscapes);
}

/**
 * プロパティ値に非 ASCII 文字が含まれるのに \uXXXX 形式でエスケープされていないか確認
 * （raw 非 ASCII が直接書かれている場合を検出）
 */
function hasUnescapedNonAscii(str) {
  // \uXXXX シーケンスを除去した後に非 ASCII があれば未エスケープ
  var withoutEscapes = str.replace(/\\u[0-9a-fA-F]{4}/g, '');
  return /[^\x00-\x7F]/.test(withoutEscapes);
}

// ============================================================
// Check 1: 12ファイルの存在確認
// ============================================================

function checkFileExistence() {
  var missing = 0;
  CATEGORIES.forEach(function(cat) {
    SUFFIXES.forEach(function(suffix) {
      var fp = filePath(cat, suffix);
      if (!fs.existsSync(fp)) {
        error('ファイルが見つかりません: ' + path.relative(process.cwd(), fp));
        missing++;
      }
    });
  });
  if (missing === 0) notice('12ファイルすべて存在します。');
  return missing === 0;
}

// ============================================================
// Check 2: デフォルトと _en が同一内容
// ============================================================

function checkDefaultEqualsEn() {
  CATEGORIES.forEach(function(cat) {
    var defaultContent = readFile(filePath(cat, ''));
    var enContent      = readFile(filePath(cat, '_en'));
    if (!defaultContent || !enContent) return; // Check 1 で検出済み

    // キー・値レベルで比較（コメント・空行は無視）
    var defaultMap = parseProperties(defaultContent);
    var enMap      = parseProperties(enContent);

    var defaultKeys = Object.keys(defaultMap).sort();
    var enKeys      = Object.keys(enMap).sort();

    if (JSON.stringify(defaultKeys) !== JSON.stringify(enKeys)) {
      error(cat + '.properties と ' + cat + '_en.properties のキーセットが異なります。');
      return;
    }
    var valueMismatch = defaultKeys.filter(function(k) { return defaultMap[k] !== enMap[k]; });
    if (valueMismatch.length > 0) {
      valueMismatch.forEach(function(k) {
        error(cat + '.properties と ' + cat + '_en.properties の値が一致しません: key=' + k);
      });
    } else {
      notice(cat + ': デフォルトと _en の内容が一致しています。');
    }
  });
}

// ============================================================
// Check 3: カテゴリ内でキーセットが全ロケール一致
// ============================================================

function checkKeyConsistency() {
  CATEGORIES.forEach(function(cat) {
    var maps = {};
    SUFFIXES.forEach(function(suffix) {
      var content = readFile(filePath(cat, suffix));
      if (content) maps[suffix] = parseProperties(content);
    });

    var suffixesWithContent = Object.keys(maps);
    if (suffixesWithContent.length < 2) return;

    var referenceKeys = Object.keys(maps[suffixesWithContent[0]]).sort().join(',');

    suffixesWithContent.slice(1).forEach(function(suffix) {
      var keys = Object.keys(maps[suffix]).sort().join(',');
      if (keys !== referenceKeys) {
        var refKeySet  = new Set(referenceKeys.split(','));
        var curKeySet  = new Set(keys.split(','));
        var onlyInRef  = [...refKeySet].filter(function(k) { return !curKeySet.has(k); });
        var onlyInCur  = [...curKeySet].filter(function(k) { return !refKeySet.has(k); });
        var localeLabel = suffix || '(default)';
        onlyInRef.forEach(function(k) {
          error(cat + suffix + '.properties にキーが不足しています: ' + k);
        });
        onlyInCur.forEach(function(k) {
          warn(cat + suffix + '.properties に余分なキーがあります: ' + k);
        });
      }
    });
    notice(cat + ': 全ロケールのキーセットが一致しています。');
  });
}

// ============================================================
// Check 4: キー命名規則
// ============================================================

var KEY_RULES = [
  {
    category: 'caption',
    pattern:  /^CAP\.[A-Z]\.[A-Z]+(\.[A-Z0-9]+)+$/,
    hint:     'CAP.Z.IWP.<製品名>.<機能名>.<キャプション名>'
  },
  {
    category: 'message',
    pattern:  /^MSG\.[EWIC]\.[A-Z]+(\.[A-Z0-9]+)+$/,
    hint:     'MSG.[E|W|I|C].IWP.<製品名>.<機能名>.<メッセージ名>'
  },
  {
    category: 'log-message',
    pattern:  /^[EWIC]\.[A-Z]+(\.[A-Z0-9]+)+\.\d{5}$/,
    hint:     '[E|W|I|C].IWP.<製品名>.<機能名>.<5桁連番>'
  }
];

function checkKeyNaming() {
  KEY_RULES.forEach(function(rule) {
    var content = readFile(filePath(rule.category, '_en')); // 代表ファイル
    if (!content) return;
    var map = parseProperties(content);
    Object.keys(map).forEach(function(key) {
      if (!rule.pattern.test(key)) {
        error(rule.category + '_en.properties の key=' + key + ' が命名規則に違反しています。'
              + ' 期待形式: ' + rule.hint);
      }
    });
  });
}

// ============================================================
// Check 5: 英語ファイルに非 ASCII が含まれていないか
// ============================================================

function checkEnglishAsciiOnly() {
  ['', '_en'].forEach(function(suffix) {
    CATEGORIES.forEach(function(cat) {
      var content = readFile(filePath(cat, suffix));
      if (!content) return;
      var map = parseProperties(content);
      Object.keys(map).forEach(function(key) {
        if (hasRawNonAscii(map[key])) {
          error(cat + suffix + '.properties key=' + key
                + ' の値に非 ASCII 文字が含まれています。英語ファイルは ASCII のみにしてください。');
        }
      });
    });
  });
}

// ============================================================
// Check 6: 日本語/中国語ファイルで非 ASCII が \uXXXX エスケープされているか
// ============================================================

function checkNonAsciiEscaping() {
  ['_ja', '_zh_CN'].forEach(function(suffix) {
    CATEGORIES.forEach(function(cat) {
      var content = readFile(filePath(cat, suffix));
      if (!content) return;
      var map = parseProperties(content);
      Object.keys(map).forEach(function(key) {
        if (hasUnescapedNonAscii(map[key])) {
          error(cat + suffix + '.properties key=' + key
                + ' の値に非 ASCII 文字が直接書かれています。\\uXXXX 形式でエスケープしてください。');
        }
      });
    });
  });
}

// ============================================================
// Check 7: 改行コードが LF か
// ============================================================

function checkLineEndings() {
  CATEGORIES.forEach(function(cat) {
    SUFFIXES.forEach(function(suffix) {
      var fp = filePath(cat, suffix);
      if (!fs.existsSync(fp)) return;
      var buf = fs.readFileSync(fp);
      var hasCr = false;
      for (var i = 0; i < buf.length; i++) {
        if (buf[i] === 0x0D) { hasCr = true; break; }
      }
      if (hasCr) {
        error(cat + suffix + '.properties の改行コードが CRLF です。LF に変換してください。');
      }
    });
  });
}

// ============================================================
// Check 8: ソースファイルにハードコード文字列が残存していないか（任意）
// ============================================================

function checkSourceFiles() {
  if (!srcDir || !fs.existsSync(srcDir)) return;

  // value=$title / value=$subTitle のバインド変数参照が残っていないか（.html）
  var htmlPattern = /value=\$(?:title|subTitle)\b/;
  // 文字列リテラルとして日本語が直接書かれていないか（.js の imart タグ以外の箇所）
  // ここでは単純に「日本語文字列リテラル」の存在チェックとして使う
  var jsHardcodePattern = /['"][\u3000-\u9fff\u30a0-\u30ff\uff00-\uffef]+['"]/;

  function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(function(name) {
      var fullPath = path.join(dir, name);
      var stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath, callback);
      } else {
        callback(fullPath);
      }
    });
  }

  walkDir(srcDir, function(fp) {
    var ext = path.extname(fp);
    var content = fs.readFileSync(fp, 'utf8');
    var rel = path.relative(process.cwd(), fp);

    if (ext === '.html') {
      if (htmlPattern.test(content)) {
        warn(rel + ': value=$title または value=$subTitle が残存しています。<imart type="message"> に置き換えてください。');
      }
    }

    if (ext === '.js') {
      // imart type="message" ではなく、ハードコードされた日本語文字列リテラルを検出
      var lines = content.split('\n');
      lines.forEach(function(line, idx) {
        // // コメント行はスキップ
        if (/^\s*\/\//.test(line)) return;
        // * コメント行はスキップ
        if (/^\s*\*/.test(line)) return;
        if (jsHardcodePattern.test(line)) {
          warn(rel + ':' + (idx + 1) + ': 日本語文字列リテラルが残存しています: ' + line.trim());
        }
      });
    }
  });
}

// ============================================================
// メイン
// ============================================================

if (!fs.existsSync(messageDir)) {
  console.error('ERROR: ディレクトリが見つかりません: ' + messageDir);
  process.exit(1);
}

console.log('validate-i18n: ' + path.relative(process.cwd(), messageDir));
if (srcDir) console.log('validate-i18n: src=' + path.relative(process.cwd(), srcDir));
console.log('');

checkFileExistence();
checkDefaultEqualsEn();
checkKeyConsistency();
checkKeyNaming();
checkEnglishAsciiOnly();
checkNonAsciiEscaping();
checkLineEndings();
checkSourceFiles();

console.log('');
notices.forEach(function(n) { console.log(n); });

if (issues.length === 0) {
  console.log('\nPASS: ' + CATEGORIES.length * SUFFIXES.length + ' file(s) checked, 0 issue(s)');
  process.exit(0);
} else {
  console.log('');
  issues.forEach(function(e) { console.error(e); });
  var errorCount = issues.filter(function(e) { return e.startsWith('ERROR'); }).length;
  var warnCount  = issues.filter(function(e) { return e.startsWith('WARN');  }).length;
  console.error('\nFAIL: ' + errorCount + ' error(s), ' + warnCount + ' warning(s)');
  process.exit(errorCount > 0 ? 1 : 0);
}
