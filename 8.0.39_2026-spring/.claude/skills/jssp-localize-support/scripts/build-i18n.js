#!/usr/bin/env node
/**
 * i18n プロパティファイル生成スクリプト
 *
 * spec JSON からメッセージプロパティファイルを自動生成します。
 * 3カテゴリ（caption / message / log-message）× 4ロケール（デフォルト/en/ja/zh_CN）= 12ファイルを出力します。
 *
 * Usage:
 *   node build-i18n.js <spec.json>
 *   node build-i18n.js <spec.json> --out src/main/conf/message/sample/my_feature
 *
 * spec.json フォーマット:
 * {
 *   "outputDir": "src/main/conf/message/sample/expense_report",
 *   "captions": [
 *     { "key": "CAP.Z.IWP.SAMPLE.EXPENSE.REPORT.APPLY.TITLE",
 *       "en": "Expense Report", "ja": "経費精算申請", "zh_CN": "费用报销申请" }
 *   ],
 *   "messages": [
 *     { "key": "MSG.E.IWP.SAMPLE.EXPENSE.REPORT.REQUIRED.PURPOSE",
 *       "en": "Purpose is required.", "ja": "使用目的は必須です。", "zh_CN": "使用目的为必填项。" }
 *   ],
 *   "logMessages": [
 *     { "key": "E.IWP.SAMPLE.EXPENSE.REPORT.00001",
 *       "en": "An error occurred.", "ja": "エラーが発生しました。", "zh_CN": "发生错误。" }
 *   ]
 * }
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ============================================================
// CLI 引数解析
// ============================================================

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.log('Usage: node build-i18n.js <spec.json> [--out <outputDir>]');
  process.exit(0);
}

const specPath = path.resolve(args[0]);
if (!fs.existsSync(specPath)) {
  console.error('ERROR: spec file not found: ' + specPath);
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

// --out で spec.outputDir を上書き可能
const outIndex = args.indexOf('--out');
const outputDir = path.resolve(outIndex !== -1 ? args[outIndex + 1] : spec.outputDir);

// ============================================================
// ユーティリティ
// ============================================================

/**
 * 非 ASCII 文字を \uXXXX 形式に変換する（native2ascii）
 */
function native2ascii(str) {
  return str.split('').map(function(c) {
    var code = c.charCodeAt(0);
    if (code > 127) {
      return '\\u' + code.toString(16).padStart(4, '0');
    }
    return c;
  }).join('');
}

/**
 * プロパティファイルの内容を組み立てる
 * @param {string} comment  - ファイル先頭コメント（英語のみ。非 ASCII コメントは書かない）
 * @param {Array}  entries  - { key, value } の配列
 * @param {string} locale   - "en" | "ja" | "zh_CN" （en はエスケープ不要）
 */
function buildProperties(comment, entries, locale) {
  var lines = [];
  if (comment) {
    lines.push('# ' + comment);
    lines.push('');
  }
  entries.forEach(function(entry) {
    var value = locale === 'en' ? entry.value : native2ascii(entry.value);
    lines.push(entry.key + '=' + value);
  });
  // LF 改行
  return lines.join('\n') + '\n';
}

/**
 * ファイルを書き込む（ディレクトリが存在しない場合は作成）
 */
function writeFile(filePath, content) {
  var dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  console.log('  wrote: ' + filePath);
}

// ============================================================
// 各カテゴリのエントリ変換
// ============================================================

function toEntries(items, locale) {
  return (items || []).map(function(item) {
    return { key: item.key, value: item[locale] || item['en'] || '' };
  });
}

// ============================================================
// バリデーション（生成前チェック）
// ============================================================

function validate(spec) {
  var errors = [];

  if (!spec.outputDir && process.argv.indexOf('--out') === -1) {
    errors.push('spec.outputDir が指定されていません。--out オプションか spec.outputDir で指定してください。');
  }

  var allLocales = ['en', 'ja', 'zh_CN'];

  function checkCategory(items, category) {
    (items || []).forEach(function(item, idx) {
      if (!item.key) {
        errors.push(category + '[' + idx + '] key が未定義です。');
      }
      allLocales.forEach(function(locale) {
        if (!item[locale]) {
          errors.push(category + ' key=' + item.key + ' の ' + locale + ' 翻訳が未定義です。');
        }
      });
    });
  }

  checkCategory(spec.captions,    'captions');
  checkCategory(spec.messages,    'messages');
  checkCategory(spec.logMessages, 'logMessages');

  // キー命名規則チェック
  (spec.captions || []).forEach(function(item) {
    if (item.key && !/^CAP\./.test(item.key)) {
      errors.push('captions key=' + item.key + ' は CAP. で始まる必要があります。');
    }
    if (item.key && /[_\-]/.test(item.key.replace(/^[A-Z]+\./, ''))) {
      errors.push('captions key=' + item.key + ' にアンダースコアまたはハイフンが含まれています。ドットで区切ってください。');
    }
  });
  (spec.messages || []).forEach(function(item) {
    if (item.key && !/^MSG\.[EWIC]\./.test(item.key)) {
      errors.push('messages key=' + item.key + ' は MSG.[E|W|I|C]. で始まる必要があります。');
    }
  });
  (spec.logMessages || []).forEach(function(item) {
    if (item.key && !/^[EWIC]\./.test(item.key)) {
      errors.push('logMessages key=' + item.key + ' は [E|W|I|C]. で始まる必要があります。');
    }
    if (item.key && !/\.\d{5}$/.test(item.key)) {
      errors.push('logMessages key=' + item.key + ' は 5桁の連番（例: .00001）で終わる必要があります。');
    }
  });

  return errors;
}

// ============================================================
// メイン処理
// ============================================================

console.log('build-i18n: spec=' + specPath);
console.log('build-i18n: outputDir=' + outputDir);

var validationErrors = validate(spec);
if (validationErrors.length > 0) {
  console.error('\nERROR: spec バリデーションエラー:');
  validationErrors.forEach(function(e) { console.error('  - ' + e); });
  process.exit(1);
}

var categories = [
  { name: 'caption',     items: spec.captions    },
  { name: 'message',     items: spec.messages     },
  { name: 'log-message', items: spec.logMessages  },
];

var locales = [
  { suffix: '',       locale: 'en'    },  // デフォルト（英語と同一）
  { suffix: '_en',    locale: 'en'    },
  { suffix: '_ja',    locale: 'ja'    },
  { suffix: '_zh_CN', locale: 'zh_CN' },
];

console.log('');
categories.forEach(function(cat) {
  locales.forEach(function(loc) {
    var fileName = cat.name + loc.suffix + '.properties';
    var filePath = path.join(outputDir, fileName);

    var localeLabel = loc.suffix === '' ? 'en (default)' : loc.locale;
    var comment = cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
                + ' Properties (' + localeLabel + ')';

    var entries = toEntries(cat.items, loc.locale);
    var content = buildProperties(comment, entries, loc.locale);
    writeFile(filePath, content);
  });
});

console.log('\nbuild-i18n: DONE — ' + (categories.length * locales.length) + ' files written to ' + outputDir);
