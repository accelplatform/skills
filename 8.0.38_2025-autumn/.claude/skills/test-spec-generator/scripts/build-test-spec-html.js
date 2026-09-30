#!/usr/bin/env node
/**
 * spec.json から、officecli を使わずに試験観点一覧・試験項目書の HTML を生成する。
 * officecli が導入できない環境向けの代替出力。xlsx 版と同じ spec.json をそのまま使い回せる。
 *
 * Usage:
 *   node build-test-spec-html.js <spec.json> [--out <output.html>]
 *
 * spec.json のスキーマは ../reference/spec-schema.md を参照（xlsx版と共通）。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildPerspectiveTable,
  buildItemSheetRows,
  sheetDisplayTitle,
  itemSheetCountRow,
  buildSummaryTable,
  resolveOutputPath,
} = require('./lib/spec-tables');

function fail(msg) {
  console.error('[build-test-spec-html] ERROR: ' + msg);
  process.exit(1);
}

const args = process.argv.slice(2);
const specPath = args[0];
if (!specPath || specPath.startsWith('--')) {
  fail('spec.json のパスを指定してください。Usage: node build-test-spec-html.js <spec.json> [--out <output.html>]');
}
function getFlag(name) {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const outputFile = resolveOutputPath(spec, getFlag('--out'), 'html');

const HEADER_FILL = spec.style?.headerFill || '#D6DCE5';
const HEADER_FONT_COLOR = spec.style?.headerFontColor || '#000000';
const FONT_NAME = spec.style?.fontName || 'Yu Gothic';

function esc(v) {
  if (v === undefined || v === null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 前提条件シートは xlsx 側ではセル位置合わせの都合上「ラグ配列（行ごとに列数が
// 異なる二次元配列）」で表現しているが、HTML では表よりも ul/ol の方が自然に
// 読める。列位置（先頭からの空セル数 = インデント）を階層とみなし、ネストした
// リストへ変換する。
//
// 変換ルール:
//   - 全セル空の行            → 区切り（無視。リストの境界にのみ影響）
//   - インデント0（1列目に値） → 見出し行（例:「１．テスト概要」）。リストを閉じてH3を出す
//   - インデント1以上          → その深さのリスト項目。1行に複数の非空セルがあれば
//                                「ラベル: 値」（2個）または「/」区切り（3個以上）で結合
//   - 同じ深さの連続する項目が全て「1)」「2)」...のような番号接頭辞を持つ場合は
//     <ol> にし、接頭辞は <li> のマーカーと重複するため取り除く。番号でない場合は
//     <ul> にし、元テキストの先頭が「・」なら同様に取り除く（<li> のマーカーと
//     二重表示になるため）
//   - 見出しが一度も現れる前の行（表題ブロック: 製品名・Ver等）は docTitle と重複する
//     ため HTML では省略する（<h1>・目次側で既に表示されているため）
function isSectionHeading(cell) {
  return /^[０-９0-9]+[．.]/.test(String(cell || '').trim());
}

const NUMBERED_PREFIX = /^[0-9０-９]+[)）]\s*/;
const BULLET_PREFIX = /^[・･]\s*/;

// items: [{ indent, text }, ...]（同じ見出しブロック内の項目、フラット）から
// depth を階層とみなしてネストした <ol>/<ul> を構築する。
function buildNestedList(items, start, depth) {
  const rendered = [];
  let i = start;
  while (i < items.length && items[i].indent === depth) {
    const text = items[i].text;
    i++;
    let childHtml = '';
    if (i < items.length && items[i].indent > depth) {
      const child = buildNestedList(items, i, items[i].indent);
      childHtml = child.html;
      i = child.next;
    }
    rendered.push({ text, childHtml });
  }
  const isNumbered = rendered.length > 0 && rendered.every(it => NUMBERED_PREFIX.test(it.text));
  const tag = isNumbered ? 'ol' : 'ul';
  const li = rendered.map(it => {
    const stripped = isNumbered ? it.text.replace(NUMBERED_PREFIX, '') : it.text.replace(BULLET_PREFIX, '');
    return `<li>${esc(stripped)}${it.childHtml}</li>`;
  }).join('\n');
  return { html: `<${tag}>\n${li}\n</${tag}>\n`, next: i };
}

function renderPrerequisiteList(title, rows) {
  const startIdx = rows.findIndex(row => isSectionHeading(row[0]));
  const bodyRows = startIdx === -1 ? rows : rows.slice(startIdx);

  let html = '';
  let pendingItems = [];

  function flushItems() {
    if (pendingItems.length) {
      html += buildNestedList(pendingItems, 0, pendingItems[0].indent).html;
      pendingItems = [];
    }
  }

  bodyRows.forEach(row => {
    const nonEmpty = [];
    let indent = -1;
    row.forEach((cell, i) => {
      const v = String(cell ?? '').trim();
      if (v) {
        if (indent === -1) indent = i;
        nonEmpty.push(v);
      }
    });
    if (indent === -1) return; // 空行はスキップ（境界のみ）

    if (indent === 0) {
      // 見出し行: 直前までの項目リストを確定してから H3 を出す
      flushItems();
      html += `<h3>${esc(nonEmpty[0])}</h3>\n`;
      return;
    }

    const text = nonEmpty.length === 1 ? nonEmpty[0]
      : nonEmpty.length === 2 ? `${nonEmpty[0]}: ${nonEmpty[1]}`
        : nonEmpty.join(' / ');
    pendingItems.push({ indent, text });
  });
  flushItems();

  return `<section class="sheet">\n<h2>${esc(title)}</h2>\n${html}</section>`;
}

function renderHeaderedTable(title, header, rows, note) {
  const headHtml = `<tr>${header.map(h => `<th>${esc(h)}</th>`).join('')}</tr>`;
  const bodyHtml = rows.map(row => `<tr>${row.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('\n');
  const noteHtml = note ? `<p class="note">${esc(note)}</p>` : '';
  return `<section class="sheet">\n<h2>${esc(title)}</h2>${noteHtml}\n<div class="table-wrap"><table>\n<thead>${headHtml}</thead>\n<tbody>\n${bodyHtml}\n</tbody>\n</table></div>\n</section>`;
}

// 試験項目書シートの1列目（ITEM_HEADER[0] = "確認"）は、実施者が読みながら
// 確認状況を記録するための列。xlsx 側はデータ入力規則のドロップダウン（✓/空欄）で
// 代替するが、HTML はブラウザ機能をフルに使えるため <select> で「未確認(-)/OK/NG」の
// 3状態を選ばせる（チェックボックスだと「確認してOK」と「確認してNG」の区別が
// つかないため）。NG を選んだ行は赤くハイライトする。OK/NG を選ぶと「試験日」列
// （実施者が試験を行った日付を記録する列）に本日の日付を自動入力する。選択状態・
// 日付は localStorage に保存し、リロード後も保持される（サーバも officecli も
// 使わない自己完結HTMLのため、保存先はブラウザのみ）。
function renderItemSheetTable(sheetIndex, title, header, rows, note) {
  const headHtml = `<tr>${header.map(h => `<th>${esc(h)}</th>`).join('')}</tr>`;
  const dateColIndex = header.indexOf('試験日'); // header/row 内でのインデックス（先頭列を含む）
  const bodyHtml = rows.map((row, rowIndex) => {
    const key = `test-spec-check:${sheetIndex}:${rowIndex}`;
    const selectCell = `<td class="check-col"><select class="confirm-select" data-key="${esc(key)}">`
      + `<option value="">-</option><option value="ok">OK</option><option value="ng">NG</option>`
      + `</select></td>`;
    const restCells = row.slice(1).map((c, i) => {
      const isDateCol = (i + 1) === dateColIndex; // +1 は slice(1) で1つ前にずれた分の補正
      return isDateCol ? `<td class="test-date-col" data-key="${esc(key)}">${esc(c)}</td>` : `<td>${esc(c)}</td>`;
    }).join('');
    return `<tr>${selectCell}${restCells}</tr>`;
  }).join('\n');
  const noteHtml = note ? `<p class="note">${esc(note)}</p>` : '';
  return `<section class="sheet">\n<h2>${esc(title)}</h2>${noteHtml}\n<div class="table-wrap"><table>\n<thead>${headHtml}</thead>\n<tbody>\n${bodyHtml}\n</tbody>\n</table></div>\n</section>`;
}

const sections = [];
const toc = [];

// 1. 前提条件
if (Array.isArray(spec.prerequisiteRows) && spec.prerequisiteRows.length) {
  sections.push(renderPrerequisiteList('前提条件', spec.prerequisiteRows));
  toc.push('前提条件');
}

// 2. 試験観点一覧
let perspectiveCount = 0;
const perspectiveTable = buildPerspectiveTable(spec);
if (perspectiveTable) {
  perspectiveCount = perspectiveTable.rows.length;
  sections.push(renderHeaderedTable('試験観点一覧', perspectiveTable.columns, perspectiveTable.rows, spec.perspectives.note));
  toc.push('試験観点一覧');
}

// 3. 試験項目書（画面別）
const itemSheetCounts = [];
(spec.itemSheets || []).forEach((sheetSpec, sheetIndex) => {
  const rows = buildItemSheetRows(sheetSpec);
  const [header, ...dataRows] = rows;
  const title = sheetDisplayTitle(sheetSpec);
  sections.push(renderItemSheetTable(sheetIndex, title, header, dataRows));
  toc.push(title);
  itemSheetCounts.push(itemSheetCountRow(sheetSpec));
});

// 4. 集計（先頭に配置）
const summaryRows = buildSummaryTable(spec, perspectiveCount, itemSheetCounts);
const [summaryHeader, ...summaryDataRows] = summaryRows;
sections.unshift(renderHeaderedTable('集計', summaryHeader, summaryDataRows));
toc.unshift('集計');

const docTitle = spec.docTitle
  ? `${spec.docTitle.product || ''} ${spec.docTitle.scenarioName || ''}`.trim()
  : (spec.key ? `${spec.key} 試験項目書` : '試験項目書');

const tocHtml = toc.map((t, i) => `<li><a href="#sheet-${i}">${esc(t)}</a></li>`).join('\n');
// section に id を後付け
const sectionsWithId = sections.map((html, i) => html.replace('<section class="sheet">', `<section class="sheet" id="sheet-${i}">`));

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(docTitle)}</title>
<style>
  :root { color-scheme: light dark; }
  body {
    font-family: "${FONT_NAME}", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif;
    margin: 0; padding: 2rem; line-height: 1.6;
    background: #fff; color: #1a1a1a;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #1e1e1e; color: #e8e8e8; }
    table { border-color: #555 !important; }
    th { background: #3a4048 !important; color: #fff !important; }
    td { border-color: #555 !important; }
    a { color: #7ab7ff; }
  }
  h1 { font-size: 1.4rem; border-bottom: 2px solid ${HEADER_FILL}; padding-bottom: 0.5rem; }
  h2 { font-size: 1.1rem; margin-top: 2.5rem; }
  h3 { font-size: 1rem; margin: 1.4rem 0 0.4rem; color: #333; }
  @media (prefers-color-scheme: dark) { h3 { color: #ddd; } }
  nav.toc { background: rgba(0,0,0,0.03); border: 1px solid #ccc; border-radius: 6px; padding: 1rem 1.5rem; max-width: 480px; }
  nav.toc ol, nav.toc ul { margin: 0; padding-left: 1.2rem; }
  section.sheet ul { margin: 0.2rem 0 0.6rem; padding-left: 1.6rem; }
  section.sheet li { margin: 0.15rem 0; }
  .table-wrap { overflow-x: auto; max-width: 100%; }
  table { border-collapse: collapse; width: max-content; min-width: 100%; font-size: 0.85rem; }
  th, td {
    border: 1px solid #999; padding: 0.35em 0.6em; text-align: left; vertical-align: middle;
    white-space: pre-wrap; word-break: break-word;
  }
  th { background: ${HEADER_FILL}; color: ${HEADER_FONT_COLOR}; font-weight: bold; text-align: center; position: sticky; top: 0; }
  section.sheet { margin-bottom: 3rem; }
  p.note { color: #666; font-size: 0.85rem; margin: 0.2rem 0 0.8rem; }
  td.check-col { text-align: center; width: 6em; }
  select.confirm-select {
    width: 100%; font-size: 0.85rem; padding: 0.15em 0.3em; cursor: pointer;
    border: 1px solid #999; border-radius: 4px; background: #fff; color: inherit;
  }
  @media (prefers-color-scheme: dark) { select.confirm-select { background: #2a2a2a; border-color: #666; } }
  tr.confirm-ok { background: rgba(80, 160, 80, 0.12); }
  tr.confirm-ng { background: rgba(210, 70, 70, 0.18); }
  tr.confirm-ng td { color: #8a1f1f; }
  @media (prefers-color-scheme: dark) {
    tr.confirm-ok { background: rgba(80, 160, 80, 0.2); }
    tr.confirm-ng { background: rgba(210, 70, 70, 0.28); }
    tr.confirm-ng td { color: #ff9c9c; }
  }
  footer { margin-top: 3rem; font-size: 0.75rem; color: #888; }
</style>
</head>
<body>
<h1>${esc(docTitle)}</h1>
<nav class="toc"><strong>目次</strong>
<ol>
${tocHtml}
</ol>
</nav>
${sectionsWithId.join('\n')}
<footer>Generated by test-spec-generator (build-test-spec-html.js)</footer>
<script>
// 確認プルダウン（未確認(-)/OK/NG）の選択状態と試験日をブラウザの localStorage に
// 保存する。OK/NG を選ぶと試験日列に本日の日付を自動入力し、NG を選んだ行は赤く
// ハイライトする。サーバも officecli も使わない自己完結HTMLのため、保存先はこの
// ブラウザ内のみ（他のユーザ・他の端末とは共有されない。正式な確認記録は「確認者」
// 「確認日」欄、または試験管理台帳を使うこと）。
(function () {
  function todayStr() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function paintRow(el, dateText) {
    var tr = el.closest('tr');
    if (!tr) return;
    tr.classList.remove('confirm-ok', 'confirm-ng');
    if (el.value === 'ok') tr.classList.add('confirm-ok');
    else if (el.value === 'ng') tr.classList.add('confirm-ng');
    var dateCell = tr.querySelector('.test-date-col');
    if (dateCell) dateCell.textContent = dateText || '';
  }
  document.querySelectorAll('select.confirm-select').forEach(function (el) {
    var key = el.dataset.key;
    var dateKey = key + ':date';
    var savedValue = localStorage.getItem(key);
    if (savedValue === 'ok' || savedValue === 'ng') el.value = savedValue;
    paintRow(el, localStorage.getItem(dateKey) || '');
    el.addEventListener('change', function () {
      if (el.value === 'ok' || el.value === 'ng') {
        localStorage.setItem(key, el.value);
        var d = todayStr();
        localStorage.setItem(dateKey, d);
        paintRow(el, d);
      } else {
        localStorage.removeItem(key);
        localStorage.removeItem(dateKey);
        paintRow(el, '');
      }
    });
  });
})();
</script>
</body>
</html>
`;

const outAbs = path.resolve(process.cwd(), outputFile);
fs.mkdirSync(path.dirname(outAbs), { recursive: true });
fs.writeFileSync(outAbs, html, 'utf8');

console.log('[build-test-spec-html] done: ' + outAbs);
