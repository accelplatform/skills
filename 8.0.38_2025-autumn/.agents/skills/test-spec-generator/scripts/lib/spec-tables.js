/**
 * spec.json → 表形式データへの変換ロジック（xlsx版・HTML版で共有）。
 * officecli には依存しない純粋関数のみを置く。
 */
'use strict';

// 先頭列（確認）は「実施者が読みながらチェックを入れる」ための列。
// xlsx ではデータ入力規則（ドロップダウン: ✓ / 空欄）、HTML では「未確認/OK/NG」の
// <select> として描画する（それぞれのレンダラ側の責務）。ここでは空文字の
// プレースホルダを置くだけで、実際の見た目は build-test-spec.js / build-test-spec-html.js
// が付与する。
//
// 「結果」「確認者」「確認日」は、確認列（OK/NG）と試験日（OK/NG選択時に自動入力）に
// 役割が統合されたため廃止した（reference/spec-schema.md の変更履歴参照）。
const ITEM_HEADER = ['確認', 'カテゴリ', '画面', '表示領域', '画面項目', 'アクション', '想定する動作', '備考', '既存要件', '試験者', '試験日'];
const DEFAULT_PERSPECTIVE_COLUMNS = ['No.', '機能ID', '対象画面ID', '対象画面名', '試験観点カテゴリ', '試験観点', '関連要件ID', '優先度'];

function buildPerspectiveTable(spec) {
  if (!spec.perspectives || !Array.isArray(spec.perspectives.rows)) return null;
  const columns = spec.perspectives.columns || DEFAULT_PERSPECTIVE_COLUMNS;
  const rows = spec.perspectives.rows.map((r, i) => [i + 1, ...r]);
  return { columns, rows };
}

function buildItemSheetRows(sheetSpec) {
  const rows = [ITEM_HEADER];
  (sheetSpec.items || []).forEach((it, idx) => {
    rows.push([
      '',
      idx === 0 ? sheetSpec.category || '' : '',
      idx === 0 ? sheetSpec.screenName || '' : '',
      it.region || '',
      it.field || '',
      it.action || '',
      it.expected || '',
      it.note || '',
      '', '', '', // 既存要件・試験者・試験日（実施者が手動記入、または HTML の試験日は自動入力）
    ]);
  });
  return rows;
}

// sheetSpec.screenName は「貸出申請（SCR-004）」のように既に括弧を含む表示名の
// ことが多いため、単純に sheetName を括弧で囲むと二重括弧になる。ダッシュ区切りにする。
function sheetDisplayTitle(sheetSpec) {
  return sheetSpec.screenName ? `${sheetSpec.sheetName} — ${sheetSpec.screenName}` : sheetSpec.sheetName;
}

function itemSheetCountRow(sheetSpec) {
  return [
    sheetDisplayTitle(sheetSpec),
    (sheetSpec.items || []).length,
    sheetSpec.note || '',
  ];
}

function buildSummaryTable(spec, perspectiveCount, itemSheetCountRows) {
  const rows = [['シート', '項目数', '備考']];
  if (perspectiveCount) rows.push(['試験観点一覧', perspectiveCount, spec.perspectives.note || '']);
  itemSheetCountRows.forEach(row => rows.push(row));
  (spec.summaryExtra || []).forEach(row => rows.push(row));
  const total = rows.slice(1).reduce((sum, r) => sum + (typeof r[1] === 'number' ? r[1] : 0), 0);
  rows.push(['計', total, '']);
  return rows;
}

/**
 * 出力先パスの解決。
 * 優先順位: --out 等の明示引数 > spec.json の outputFile/outputFileHtml > 既定値。
 * 既定値は形式別ディレクトリ docs/test-specs/xlsx|html/ 配下（key が無ければ "test-spec"）。
 */
function resolveOutputPath(spec, explicitOut, kind) {
  if (explicitOut) return explicitOut;
  const specField = kind === 'html' ? 'outputFileHtml' : 'outputFile';
  if (spec[specField]) return spec[specField];
  const key = spec.key || 'test-spec';
  const dir = kind === 'html' ? 'html' : 'xlsx';
  const ext = kind === 'html' ? 'html' : 'xlsx';
  return `docs/test-specs/${dir}/${key}-test.${ext}`;
}

module.exports = {
  ITEM_HEADER,
  DEFAULT_PERSPECTIVE_COLUMNS,
  buildPerspectiveTable,
  buildItemSheetRows,
  sheetDisplayTitle,
  itemSheetCountRow,
  buildSummaryTable,
  resolveOutputPath,
};
