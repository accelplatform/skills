#!/usr/bin/env node
/*
 * validate-flow.js — flow_definition.json のドメイン固有バリデータ
 *
 * 使い方:
 *   node validate-flow.js <flow_definition.json>
 *   node validate-flow.js <file.zip>           # zip 内の flow_definition.json を検証
 *
 * 依存: Node.js 標準ライブラリのみ（npm install 不要）
 *
 * 検証項目:
 *   [top]  トップレベル構造（flowCategories / flowDefinitions）
 *   [flow] フロー定義の必須フィールド
 *   [elem] flowElements の整合性（start/end の存在、sequence の参照先）
 *   [sync] additional.ui と flowElements の同期
 *          - cells ↔ タスク要素の 1:1 対応
 *          - dataMap / optionMap のキー = cell UUID
 *          - cell の text.title = executeId
 *   [map]  mappingRules と connectors の同期
 *          - connector.id = mappingRule.id
 *          - connector 数 = mappingRule 数（value + function）
 *   [src]  mappingRules[].source.type が "value" または "function" のいずれか
 *          - value: path が必須
 *          - function: name が必須、arguments は再帰的に同じ検証
 *   [gw]   gateway の defaultRoot が実在する sequence を指しているか
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

// --- エラー収集 ---

class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }
  error(ctx, msg) { this.errors.push(`[${ctx}] ${msg}`); }
  warn(ctx, msg) { this.warnings.push(`[${ctx}] ${msg}`); }
  get ok() { return this.errors.length === 0; }
  dump() {
    for (const e of this.errors) console.error('ERROR:', e);
    for (const w of this.warnings) console.error('WARN:', w);
    if (this.ok) {
      console.error(`PASS (${this.warnings.length} warning(s))`);
    } else {
      console.error(`FAIL (${this.errors.length} error(s), ${this.warnings.length} warning(s))`);
    }
  }
}

// --- バリデーション ---

const VALID_SOURCE_TYPES = new Set(['value', 'function']);

// mappingRules[].source の再帰検証
// サーバ側の NodeType 列挙型は "value" / "function" の 2 種類のみを受け付ける。
// それ以外（例: "string"）を渡すと IllegalArgumentException が発生する。
function validateSource(source, taskExecId, ruleId, ctx, r, depth) {
  if (source === null || source === undefined) {
    return;
  }
  if (typeof source !== 'object') {
    r.error(ctx, `"${taskExecId}" rule "${ruleId}": source が object ではない`);
    return;
  }
  if (typeof source.type !== 'string') {
    r.error(ctx, `"${taskExecId}" rule "${ruleId}": source.type が文字列ではない`);
    return;
  }
  if (!VALID_SOURCE_TYPES.has(source.type)) {
    r.error(ctx, `"${taskExecId}" rule "${ruleId}": source.type "${source.type}" は無効（"value" または "function" のみ。固定文字列は constants で定義し $const/<NAME> で参照する）`);
    return;
  }
  if (source.type === 'value') {
    if (typeof source.path !== 'string' || source.path.length === 0) {
      r.error(ctx, `"${taskExecId}" rule "${ruleId}": source.type=value には path が必要`);
    }
  } else if (source.type === 'function') {
    if (typeof source.name !== 'string' || source.name.length === 0) {
      r.error(ctx, `"${taskExecId}" rule "${ruleId}": source.type=function には name が必要`);
    }
    if (source.arguments !== null && source.arguments !== undefined) {
      if (!Array.isArray(source.arguments)) {
        r.error(ctx, `"${taskExecId}" rule "${ruleId}": source.arguments は配列または null`);
      } else {
        for (let i = 0; i < source.arguments.length; i++) {
          validateSource(source.arguments[i], taskExecId, `${ruleId}/arg[${i}]`, ctx, r, depth + 1);
        }
      }
    }
  }
}

function validateTop(data, r) {
  if (!data || typeof data !== 'object') {
    r.error('top', 'ルートが object ではない');
    return false;
  }
  if (!Array.isArray(data.flowCategories)) {
    r.error('top', 'flowCategories が配列ではない');
  }
  if (!Array.isArray(data.flowDefinitions)) {
    r.error('top', 'flowDefinitions が配列ではない');
    return false;
  }
  if (data.flowDefinitions.length === 0) {
    r.error('top', 'flowDefinitions が空');
    return false;
  }
  for (let i = 0; i < data.flowDefinitions.length; i++) {
    if (typeof data.flowDefinitions[i] !== 'string') {
      r.error('top', `flowDefinitions[${i}] が文字列ではない`);
    }
  }
  return r.ok;
}

const FLOW_REQUIRED = [
  'flowId', 'version', 'categoryId', 'flowName', 'transaction',
  'constants', 'variablesDataDefinition', 'flowElements',
  'inputDataDefinition', 'outputDataDefinition', 'additional',
];

function validateFlowDef(flow, idx, r) {
  const ctx = `flow#${idx}(${flow.flowId || '?'})`;

  for (const key of FLOW_REQUIRED) {
    if (!(key in flow)) {
      r.error(ctx, `必須フィールド "${key}" がない`);
    }
  }

  if (!flow.additional || typeof flow.additional.ui !== 'string') {
    r.error(ctx, 'additional.ui が文字列ではない');
    return;
  }

  const elements = flow.flowElements || [];
  const tasks = elements.filter(e => e.key?.id !== 'im_sequence');
  const sequences = elements.filter(e => e.key?.id === 'im_sequence');
  const execIds = new Set(elements.map(e => e.executeId));
  const taskExecIds = new Set(tasks.map(e => e.executeId));

  // start / end の存在
  const hasStart = tasks.some(e => e.key?.id === 'im_start');
  const hasEnd = tasks.some(e => e.key?.id === 'im_end' || e.key?.id === 'im_errorEnd');
  if (!hasStart) r.error(ctx, 'im_start タスクがない');
  if (!hasEnd) r.error(ctx, 'im_end または im_errorEnd タスクがない');

  // ユーザ定義タスクの検証
  const userDefTasks = tasks.filter(e => e.key?.type === 'localUserDefinition');
  for (const t of userDefTasks) {
    // Database Fetch 終了要素（$xxx$）は definition 不要
    if (t.key.id.startsWith('$') && t.key.id.endsWith('$')) {
      if (!t.properties?.startPoint) {
        r.error(ctx, `DB Fetch 終了要素 "${t.executeId}" に startPoint がない`);
      } else if (!taskExecIds.has(t.properties.startPoint)) {
        r.error(ctx, `DB Fetch 終了要素 "${t.executeId}" の startPoint "${t.properties.startPoint}" が存在しない`);
      }
      continue;
    }
    // 通常のユーザ定義タスク
    const def = t.properties?.definition;
    if (!def) {
      r.error(ctx, `ユーザ定義タスク "${t.executeId}" に properties.definition がない`);
      continue;
    }
    if (!def.definitionId) r.error(ctx, `ユーザ定義タスク "${t.executeId}" に definitionId がない`);
    if (!def.definitionType) r.error(ctx, `ユーザ定義タスク "${t.executeId}" に definitionType がない`);
    if (!def.definitionData) r.error(ctx, `ユーザ定義タスク "${t.executeId}" に definitionData がない`);
    else if (!def.definitionData.elementId) r.error(ctx, `ユーザ定義タスク "${t.executeId}" に elementId がない`);
  }

  // Database Fetch のペアチェック
  const dbFetchStarts = userDefTasks.filter(t => t.properties?.definition?.definitionType === 'db_fetch');
  for (const start of dbFetchStarts) {
    const endId = `$${start.executeId}$`;
    if (!taskExecIds.has(endId)) {
      r.error(ctx, `DB Fetch 開始 "${start.executeId}" に対応する終了要素 "${endId}" がない`);
    }
  }

  // sequence の参照先チェック
  for (const seq of sequences) {
    const sp = seq.properties?.startPoint;
    const ep = seq.properties?.endPoint;
    if (!sp || !taskExecIds.has(sp)) {
      r.error(ctx, `sequence "${seq.executeId}" の startPoint "${sp}" が存在しない`);
    }
    if (!ep || !taskExecIds.has(ep)) {
      r.error(ctx, `sequence "${seq.executeId}" の endPoint "${ep}" が存在しない`);
    }
  }

  // gateway の defaultRoot チェック
  for (const t of tasks) {
    if (t.key?.id !== 'im_gateway') continue;
    const dr = t.properties?.defaultRoot;
    if (!dr) {
      r.warn(ctx, `gateway "${t.executeId}" に defaultRoot がない`);
      continue;
    }
    if (!execIds.has(dr)) {
      r.error(ctx, `gateway "${t.executeId}" の defaultRoot "${dr}" が flowElements に存在しない`);
    }
  }

  // --- additional.ui 同期チェック ---
  let ui;
  try {
    ui = JSON.parse(flow.additional.ui);
  } catch (e) {
    r.error(ctx, `additional.ui の JSON パースに失敗: ${e.message}`);
    return;
  }

  if (ui.version !== 2) {
    r.warn(ctx, `additional.ui.version が 2 ではない (${ui.version})`);
  }

  const cells = ui.graph?.cells || [];
  const taskCells = cells.filter(c => c.type !== 'link');
  const linkCells = cells.filter(c => c.type === 'link');

  // taskCells ↔ tasks の 1:1 対応
  if (taskCells.length !== tasks.length) {
    r.error(ctx, `タスクセル数 (${taskCells.length}) ≠ タスク要素数 (${tasks.length})`);
  }

  // cell の text.title = executeId（ユーザ定義では executeId 中のハイフンがアンダースコアになる場合がある）
  const cellIdToExecId = {};
  const normalizeId = (id) => id.replace(/-/g, '_');
  const execIdNormMap = {};
  for (const eid of taskExecIds) execIdNormMap[normalizeId(eid)] = eid;
  for (const cell of taskCells) {
    const title = cell.attrs?.['text.title']?.text;
    if (!title) {
      r.error(ctx, `セル "${cell.id}" に text.title がない`);
    } else {
      const matchedExecId = taskExecIds.has(title) ? title : execIdNormMap[normalizeId(title)];
      if (!matchedExecId) {
        r.error(ctx, `セル text.title "${title}" がタスク executeId に存在しない`);
      }
      cellIdToExecId[cell.id] = matchedExecId || title;
    }
  }

  // dataMap のキー = taskCell の UUID
  const dataMap = ui.dataMap || {};
  const optionMap = ui.optionMap || {};
  const taskCellIds = new Set(taskCells.map(c => c.id));

  for (const key of Object.keys(dataMap)) {
    if (!taskCellIds.has(key)) {
      r.error(ctx, `dataMap のキー "${key}" がタスクセルに存在しない`);
    }
  }
  for (const cellId of taskCellIds) {
    if (!(cellId in dataMap)) {
      r.error(ctx, `タスクセル "${cellId}" (${cellIdToExecId[cellId]}) の dataMap エントリがない`);
    }
  }

  // optionMap のキー = taskCell の UUID
  for (const key of Object.keys(optionMap)) {
    if (!taskCellIds.has(key)) {
      r.error(ctx, `optionMap のキー "${key}" がタスクセルに存在しない`);
    }
  }
  for (const cellId of taskCellIds) {
    if (!(cellId in optionMap)) {
      r.error(ctx, `タスクセル "${cellId}" (${cellIdToExecId[cellId]}) の optionMap エントリがない`);
    }
  }

  // linkCells ↔ sequences の数チェック
  if (linkCells.length !== sequences.length) {
    r.error(ctx, `link セル数 (${linkCells.length}) ≠ sequence 要素数 (${sequences.length})`);
  }

  // link の source.id / target.id がタスクセルを指しているか
  for (const link of linkCells) {
    if (!taskCellIds.has(link.source?.id)) {
      r.error(ctx, `link "${link.id}" の source.id "${link.source?.id}" がタスクセルに存在しない`);
    }
    if (!taskCellIds.has(link.target?.id)) {
      r.error(ctx, `link "${link.id}" の target.id "${link.target?.id}" がタスクセルに存在しない`);
    }
  }

  // --- mappingRules[].source の型チェック ---
  for (const task of tasks) {
    const rules = task.mappingDefinition?.mappingRules || [];
    for (const rule of rules) {
      validateSource(rule.source, task.executeId, rule.id || '?', ctx, r, 0);
    }
  }

  // --- mappingRules ↔ connectors 同期チェック ---
  for (const task of tasks) {
    const rules = task.mappingDefinition?.mappingRules || [];
    if (rules.length === 0) continue;

    const cellId = Object.keys(cellIdToExecId).find(k => cellIdToExecId[k] === task.executeId);
    if (!cellId) continue;

    const dm = dataMap[cellId];
    if (!dm) continue;

    const connectors = dm.mapping?.json?.connectors || [];

    // value + function の source のみ connector 対象
    const mappableRules = rules.filter(
      r => r.source && (r.source.type === 'value' || r.source.type === 'function')
    );

    // connector.id が rule.id と一致するか
    // ※ function source の場合、引数渡しの connector（target.type = 関数名）が追加で存在する。
    //    これは rule.id に対応しないため、関数引数 connector を除外して比較する。
    const ruleIds = new Set(mappableRules.map(rule => rule.id));
    const outputConnectors = connectors.filter(c => c.target?.type === '$output');
    const argConnectors = connectors.filter(c => c.target?.type !== '$output');

    if (outputConnectors.length !== mappableRules.length) {
      r.error(ctx, `"${task.executeId}": 出力 connector 数 (${outputConnectors.length}) ≠ マッピング対象 rule 数 (${mappableRules.length})`);
    }

    for (const conn of outputConnectors) {
      if (!ruleIds.has(conn.id)) {
        r.error(ctx, `"${task.executeId}": connector.id "${conn.id}" に対応する mappingRule がない`);
      }
    }

    // 関数引数 connector の target.type が実在する関数名を指しているか（簡易チェック）
    for (const conn of argConnectors) {
      const fnName = conn.target?.type;
      if (!fnName || fnName.startsWith('$')) {
        r.warn(ctx, `"${task.executeId}": 関数引数 connector の target.type が不正: "${fnName}"`);
      }
    }

    // connector の path が TAB 区切りか
    for (const conn of connectors) {
      if (conn.source?.path && conn.source.path.includes('/')) {
        r.error(ctx, `"${task.executeId}": connector source.path にスラッシュが含まれている（TAB 区切りが必要）: "${conn.source.path}"`);
      }
      if (conn.target?.path && conn.target.path.includes('/')) {
        r.error(ctx, `"${task.executeId}": connector target.path にスラッシュが含まれている（TAB 区切りが必要）: "${conn.target.path}"`);
      }
    }
  }

  // --- dataMap.common.executeId の一致チェック ---
  for (const [cellId, dm] of Object.entries(dataMap)) {
    const expectedExecId = cellIdToExecId[cellId];
    if (!expectedExecId) continue;
    if (dm.common?.executeId !== expectedExecId) {
      r.error(ctx, `dataMap "${cellId}" の common.executeId "${dm.common?.executeId}" ≠ セル text.title "${expectedExecId}"`);
    }
  }
}

// --- メイン ---

function loadInput(filePath) {
  if (filePath.endsWith('.zip')) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'imlogic-val-'));
    try {
      execFileSync('unzip', ['-o', '-q', filePath, '-d', tmp]);
      const jsonPath = path.join(tmp, 'flow_definition.json');
      if (!fs.existsSync(jsonPath)) {
        throw new Error('zip 内に flow_definition.json が見つからない');
      }
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: validate-flow.js <flow_definition.json|file.zip>');
    process.exit(1);
  }

  const data = loadInput(args[0]);
  const r = new ValidationResult();

  if (!validateTop(data, r)) {
    r.dump();
    process.exit(1);
  }

  for (let i = 0; i < data.flowDefinitions.length; i++) {
    let flow;
    try {
      flow = JSON.parse(data.flowDefinitions[i]);
    } catch (e) {
      r.error(`flow#${i}`, `JSON パースに失敗: ${e.message}`);
      continue;
    }
    validateFlowDef(flow, i, r);
  }

  r.dump();
  process.exit(r.ok ? 0 : 1);
}

if (require.main === module) main();

module.exports = { validateTop, validateFlowDef, ValidationResult };
