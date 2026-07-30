#!/usr/bin/env node
/**
 * spec.json から、officecli 経由で試験観点一覧・試験項目書の xlsx を生成する。
 *
 * Usage:
 *   node build-test-spec.js <spec.json> [--out <output.xlsx>] [--keep-batch]
 *
 * spec.json のスキーマは ../reference/spec-schema.md を参照。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const {
  ITEM_HEADER,
  buildPerspectiveTable,
  buildItemSheetRows,
  itemSheetCountRow,
  buildSummaryTable,
  resolveOutputPath,
} = require('./lib/spec-tables');

function fail(msg) {
  console.error('[build-test-spec] ERROR: ' + msg);
  process.exit(1);
}

const args = process.argv.slice(2);
const specPath = args[0];
if (!specPath || specPath.startsWith('--')) {
  fail('spec.json のパスを指定してください。Usage: node build-test-spec.js <spec.json> [--out <output.xlsx>]');
}
function getFlag(name) {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
}
const keepBatch = args.includes('--keep-batch');

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
// 既定の出力先は docs/test-specs/xlsx/<spec.key>-test.xlsx（spec.json の outputFile / --out で上書き可）
const outputFile = resolveOutputPath(spec, getFlag('--out'), 'xlsx');

// ============================================================
// 色定義: officecli の `set` は fill/font.color に 6桁HEX必須。
// テーマ色+tint を含む色は reference/officecli-fill-color.md の
// 手順で事前に実HEXへ変換してから spec.json に書くこと。
// ============================================================
const DEFAULT_HEADER_FILL = spec.style?.headerFill || '#D6DCE5';
const DEFAULT_HEADER_FONT_COLOR = spec.style?.headerFontColor || '#000000';
const DEFAULT_FONT_NAME = spec.style?.fontName || 'Yu Gothic';
const DEFAULT_FONT_SIZE = spec.style?.fontSize || '9pt';

const cmds = [];

// ---------- helpers ----------
function csv(rows) {
  return rows.map(r => r.map(c => {
    c = (c === undefined || c === null) ? '' : String(c);
    if (c.includes(',') || c.includes('"') || c.includes('\n')) {
      c = '"' + c.replace(/"/g, '""') + '"';
    }
    return c;
  }).join(',')).join('\n');
}

function addSheet(name) {
  cmds.push({ command: 'add', parent: '/', type: 'sheet', props: { name, ifExists: 'use' } });
}

function importCsv(sheet, rows, startCell = 'A1') {
  cmds.push({ command: 'import', parent: '/' + sheet, props: { 'start-cell': startCell }, text: csv(rows) });
}

function setCells(sheet, cellRange, props) {
  cmds.push({ command: 'set', path: '/' + sheet + '/' + cellRange, props });
}

function colLetter(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

function headerFillProps() {
  return {
    fill: DEFAULT_HEADER_FILL,
    'font.color': DEFAULT_HEADER_FONT_COLOR,
    'font.bold': 'true',
    'font.size': DEFAULT_FONT_SIZE,
    'font.name': DEFAULT_FONT_NAME,
    'alignment.wrapText': 'true',
    'alignment.vertical': 'center',
    'alignment.horizontal': 'center',
    'border.top': 'thin',
    'border.bottom': 'thin',
    'border.left': 'thin',
    'border.right': 'thin',
  };
}
function cellBaseProps() {
  return {
    'font.size': DEFAULT_FONT_SIZE,
    'font.name': DEFAULT_FONT_NAME,
    'alignment.wrapText': 'true',
    'alignment.vertical': 'center',
    'border.top': 'thin',
    'border.bottom': 'thin',
    'border.left': 'thin',
    'border.right': 'thin',
  };
}

function styleHeaderRow(sheet, row, numCols) {
  for (let i = 1; i <= numCols; i++) setCells(sheet, colLetter(i) + row, headerFillProps());
}
function styleDataBlock(sheet, startRow, endRow, numCols) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = 1; c <= numCols; c++) setCells(sheet, colLetter(c) + r, cellBaseProps());
  }
}
function setColWidths(sheet, widths) {
  widths.forEach((w, idx) => {
    cmds.push({ command: 'set', path: '/' + sheet + '/col[' + (idx + 1) + ']', props: { width: String(w) } });
  });
}

// ============================================================
// 1. シート追加 + 既定シート(Sheet1)削除
// ============================================================
const sheetNames = ['前提条件', '集計', '試験観点一覧'];
(spec.itemSheets || []).forEach(s => sheetNames.push(s.sheetName));
sheetNames.forEach(addSheet);
cmds.push({ command: 'remove', path: '/Sheet1' }); // 失敗しても無害（既に無ければスキップされたことになる）

// ============================================================
// 2. 前提条件シート（spec.prerequisiteRows をそのままCSVインポート）
// ============================================================
if (Array.isArray(spec.prerequisiteRows) && spec.prerequisiteRows.length) {
  importCsv('前提条件', spec.prerequisiteRows);
  (spec.prerequisiteTitleStyle?.cells || ['A1']).forEach(cellRef => {
    setCells('前提条件', cellRef, spec.prerequisiteTitleStyle?.props || {
      'font.bold': 'true', 'font.size': '12pt', 'font.name': DEFAULT_FONT_NAME,
      'border.left': 'medium', 'border.top': 'medium', 'alignment.vertical': 'center',
    });
  });
  // 表題ブロックの情報欄（製品/Ver/シナリオNo./シナリオ名）。ヘッダ行は塗り+罫線、
  // 値行は罫線のみ。列を離して並べる（テーマ由来の遠い列に配置する）とExcel上で
  // 間延びして崩れて見えるため、隣接する狭い列にまとめること。
  (spec.prerequisiteInfoBoxHeaderCells || []).forEach(cellRef => {
    setCells('前提条件', cellRef, {
      fill: DEFAULT_HEADER_FILL, 'font.size': DEFAULT_FONT_SIZE, 'font.name': DEFAULT_FONT_NAME,
      'border.left': 'thin', 'border.right': 'thin', 'border.top': 'thin', 'border.bottom': 'thin',
    });
  });
  (spec.prerequisiteInfoBoxValueCells || []).forEach(cellRef => {
    setCells('前提条件', cellRef, {
      'font.size': DEFAULT_FONT_SIZE, 'font.name': DEFAULT_FONT_NAME,
      'border.left': 'thin', 'border.right': 'thin', 'border.top': 'thin', 'border.bottom': 'thin',
    });
  });
  (spec.prerequisiteSectionHeaderCells || []).forEach(cellRef => {
    setCells('前提条件', cellRef, { 'font.bold': 'true', 'font.size': '10pt', 'font.color': '#1F4E78' });
  });
  setColWidths('前提条件', spec.prerequisiteColWidths || [22, 55, 12, 12, 10, 10, 10, 10, 20]);
}

// ============================================================
// 3. 試験観点一覧シート
// ============================================================
let perspectiveCount = 0;
const perspectiveTable = buildPerspectiveTable(spec);
if (perspectiveTable) {
  const { columns, rows: dataRows } = perspectiveTable;
  perspectiveCount = dataRows.length;
  importCsv('試験観点一覧', [columns, ...dataRows]);
  styleHeaderRow('試験観点一覧', 1, columns.length);
  styleDataBlock('試験観点一覧', 2, dataRows.length + 1, columns.length);
  setColWidths('試験観点一覧', spec.perspectives.colWidths || columns.map(() => 15));
  cmds.push({ command: 'set', path: '/試験観点一覧', props: { freeze: 'A2' } });
}

// ============================================================
// 4. 試験項目書シート（コンテナ型: カテゴリ/画面はブロック先頭行のみ記載）
// ============================================================
const itemSheetCounts = [];

(spec.itemSheets || []).forEach(sheetSpec => {
  const rows = buildItemSheetRows(sheetSpec);
  importCsv(sheetSpec.sheetName, rows);
  styleHeaderRow(sheetSpec.sheetName, 1, ITEM_HEADER.length);
  styleDataBlock(sheetSpec.sheetName, 2, rows.length, ITEM_HEADER.length);
  setColWidths(sheetSpec.sheetName, sheetSpec.colWidths || [6, 14, 16, 16, 20, 18, 55, 30, 16, 10, 10]);
  // A列（確認）: Excel ネイティブのチェックボックス（フォームコントロール）は officecli 未対応のため、
  // データ入力規則（ドロップダウン: ✓ / 空欄）で代替する。セルをクリック→ドロップダウン矢印→✓を選ぶ運用。
  // HTML 版の <input type="checkbox"> と役割は同じ（実施者が読みながらチェックを入れる用途で、
  // 正式な確認記録は「確認者」「確認日」列を使う）。
  if (rows.length > 1) {
    cmds.push({
      command: 'add', parent: '/' + sheetSpec.sheetName, type: 'validation',
      props: { ref: `A2:A${rows.length}`, type: 'list', formula1: '"✓,"', allowBlank: 'true', inCellDropdown: 'true' },
    });
    for (let r = 2; r <= rows.length; r++) {
      setCells(sheetSpec.sheetName, 'A' + r, { 'alignment.horizontal': 'center' });
    }
  }
  cmds.push({ command: 'set', path: '/' + sheetSpec.sheetName, props: { freeze: 'B2' } });
  itemSheetCounts.push(itemSheetCountRow(sheetSpec));
});

// ============================================================
// 5. 集計シート（自動集計。spec.summaryExtra があれば追記）
// ============================================================
const summaryRows = buildSummaryTable(spec, perspectiveCount, itemSheetCounts);
importCsv('集計', summaryRows);
styleHeaderRow('集計', 1, 3);
styleDataBlock('集計', 2, summaryRows.length, 3);
setColWidths('集計', spec.summaryColWidths || [35, 12, 55]);

// ============================================================
// 実行: officecli create -> batch -> save
// ============================================================
const outAbs = path.resolve(process.cwd(), outputFile);
fs.mkdirSync(path.dirname(outAbs), { recursive: true });

const batchFile = path.join(os.tmpdir(), 'test-spec-batch-' + Date.now() + '.json');
fs.writeFileSync(batchFile, JSON.stringify(cmds));

function officecli(argv) {
  console.log('$ officecli ' + argv.join(' '));
  return execFileSync('officecli', argv, { encoding: 'utf8' });
}

if (!fs.existsSync(outAbs)) {
  officecli(['create', outAbs, '--json']);
}

let batchResultRaw;
try {
  batchResultRaw = officecli(['batch', outAbs, '--input', batchFile, '--json']);
} catch (e) {
  // officecli batch は失敗コマンドが含まれると非ゼロ終了するため、stdout を拾って続行する
  batchResultRaw = (e.stdout && e.stdout.toString()) || '';
}
officecli(['save', outAbs, '--json']);
officecli(['close', outAbs, '--json']);

if (!keepBatch) fs.unlinkSync(batchFile);
else console.log('batch script kept at: ' + batchFile);

let batchResult;
try { batchResult = JSON.parse(batchResultRaw); } catch (e) { batchResult = null; }
const summary = batchResult?.data?.summary;
if (summary) {
  console.log(`[build-test-spec] commands: total=${summary.total} succeeded=${summary.succeeded} failed=${summary.failed}`);
  if (summary.failed > 0) {
    const fails = batchResult.data.results.filter(r => !r.success);
    const realFails = fails.filter(f => !(f.item.command === 'remove' && f.item.path === '/Sheet1'));
    if (realFails.length) {
      console.error('[build-test-spec] 想定外の失敗コマンドがあります:');
      console.error(JSON.stringify(realFails, null, 2));
      process.exit(1);
    } else {
      console.log('[build-test-spec] 失敗は /Sheet1 の remove のみ（既に存在しない場合の無害なエラー）。');
    }
  }
}

console.log('[build-test-spec] done: ' + outAbs);
console.log('確認コマンド: officecli view ' + outputFile + ' text');
