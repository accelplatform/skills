#!/usr/bin/env node
/*
 * build-workflow.js — IM-Workflow インポート XML ジェネレータ
 *
 * 使い方:
 *   node build-workflow.js <spec.json> [--out output.xml]
 *
 * spec.json から IM-Workflow のインポート用 XML を生成する。
 * 出力は UTF-16BE（BOM付き）。--out 省略時は
 * src/main/storage/public/im_workflow/im_workflow-{workflowName}-import.xml に出力。
 *
 * 対応パターン: straight / branch / sync / horizontal / vertical
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const os = require('os');

const DEFAULT_OUT_DIR = 'src/main/storage/public/im_workflow';

// --- ユーティリティ ---

function randomId(len) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let s = '';
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) s += chars[bytes[i] % chars.length];
  return s;
}

// contentsPluginId 等の ID フィールドは XSD で ScalarIdString（20文字以内）に制限されている。
// shortName が長いと "cp_{short}_{random}" 等の組み立てで20文字を超えるため、
// 固定部分の長さから逆算してランダム部分の長さを調整する。
const CONTENTS_PLUGIN_ID_MAX_LEN = 20;
const CONTENTS_PLUGIN_ID_MIN_RANDOM_LEN = 3;
const _usedContentsPluginIds = new Set();

function genContentsPluginId(parts) {
  // parts: 固定セグメントの配列。例: ['cp', short] / ['cp', short, 'mep']
  const base = parts.join('_') + '_';
  const randLen = CONTENTS_PLUGIN_ID_MAX_LEN - base.length;
  if (randLen < CONTENTS_PLUGIN_ID_MIN_RANDOM_LEN) {
    const short = parts[1];
    const otherFixedLen = base.length - short.length; // short 以外の固定部分の長さ（プレフィックス・区切りのアンダースコア込み）
    const maxShortLen = CONTENTS_PLUGIN_ID_MAX_LEN - otherFixedLen - CONTENTS_PLUGIN_ID_MIN_RANDOM_LEN;
    throw new Error(
      `shortName "${short}"（${short.length}文字）が長すぎるため contentsPluginId（20文字制限）を組み立てられません。` +
      `shortName は ${maxShortLen}文字以内にしてください。`
    );
  }
  // ランダム部分が短い場合の衝突を避けるため、同一ビルド内での重複が出ないまで再生成する
  let id;
  let guard = 0;
  do {
    id = base + randomId(randLen);
    guard += 1;
  } while (_usedContentsPluginIds.has(id) && guard < 100);
  _usedContentsPluginIds.add(id);
  return id;
}

function escXml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function dateBefore(dateStr) {
  // "YYYY/MM/DD" の前日を返す
  const [y, m, d] = dateStr.split('/').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}/${mm}/${dd}`;
}

// ページ名の定数定義
const PAGE_NAMES = {
  en: ['Apply', 'Temporary save', 'Apply (task)', 'Re-apply', 'Process', 'Confirm', 'Process details', 'Refer details'],
  ja: ['申請', '仮保存', '申請（タスク）', '再申請', '処理', '確認', '処理内容', '参照内容'],
  zh_CN: ['申请', '临时保存', '申请（任务）', '重新申请', '处理', '确认', '处理内容', '参考内容'],
};

// ノードタイプマッピング
const NODE_TYPE_STR = {
  start: 'nodeTyp_Start', end: 'nodeTyp_End', apply: 'nodeTyp_Apply', approve: 'nodeTyp_Approve',
  confirm: 'nodeTyp_Confirm',
  branch_start: 'nodeTyp_Branch_Start', branch_end: 'nodeTyp_Branch_End',
  sync_start: 'nodeTyp_Sync_Start', sync_end: 'nodeTyp_Sync_End',
  horizontal: 'nodeTyp_Horizontal', vertical: 'nodeTyp_Vertical',
};
const NODE_TYPE_NUM = {
  start: '0', end: '1', apply: '2', approve: '3',
  confirm: '6',
  branch_start: '9', branch_end: '10',
  sync_start: '7', sync_end: '8',
  horizontal: '11', vertical: '12',
};
const NODE_VARIETY = {
  start: 'system', end: 'system', apply: 'human', approve: 'human',
  confirm: 'human',
  branch_start: 'system', branch_end: 'system',
  sync_start: 'system', sync_end: 'system',
  horizontal: 'human', vertical: 'human',
};

// extensionPointId の判定
// confirm は human ノードだが、確認（閲覧のみ・承認権限なし）の特殊ノード。
// next を持たない終端枝として承認ノード等にぶら下げる（route 定義参照）。
const HUMAN_TYPES = new Set(['apply', 'approve', 'confirm', 'horizontal', 'vertical']);
function isHumanNode(type) { return HUMAN_TYPES.has(type); }

function getExtensionPointId(node, prevNode) {
  if (node.type === 'apply') return 'jp.co.intra_mart.workflow.plugin.authority.node.apply';
  if (node.type === 'confirm') return 'jp.co.intra_mart.workflow.plugin.authority.node.confirm';
  // approve 系: 直前ノードが human なら approve、system なら approve.static
  if (prevNode && isHumanNode(prevNode.type)) {
    return 'jp.co.intra_mart.workflow.plugin.authority.node.approve';
  }
  return 'jp.co.intra_mart.workflow.plugin.authority.node.approve.static';
}

function getPluginId(extensionPointId, suffix) {
  return `${extensionPointId}.${suffix}`;
}

// compareRuleId (演算子コード)
const OPERATOR_CODES = { '>=': '7', '<': '8', '=': '9', '>': '10', '<=': '11', '!=': '12' };

// --- XML ビルダー ---

class XmlBuilder {
  constructor() { this.lines = []; this.indent = 0; }
  raw(s) { this.lines.push('  '.repeat(this.indent) + s); }
  open(tag, attrs) {
    const a = attrs ? ' ' + Object.entries(attrs).map(([k, v]) => `${k}="${escXml(v)}"`).join(' ') : '';
    this.raw(`<${tag}${a}>`);
    this.indent++;
  }
  close(tag) { this.indent--; this.raw(`</${tag}>`); }
  tag(name, type, value) {
    if (value == null) { this.raw(`<${name} type="null" />`); return; }
    this.raw(`<${name} type="${type}">${escXml(value)}</${name}>`);
  }
  tagStr(name, value) { this.tag(name, 'string', value); }
  tagNum(name, value) { this.tag(name, 'number', value); }
  tagNull(name) { this.tag(name, null); }
  openArray(name) { this.open(name, { type: 'array' }); }
  closeArray(name) { this.close(name); }
  openObj() { this.open('value', { type: 'object' }); }
  closeObj() { this.close('value'); }
  emptyArray(name) { this.raw(`<${name} type="array" />`); }
  toString() { return this.lines.join('\n'); }
}

// --- セクション生成 ---

function buildSpec(spec) {
  const locales = ['en', 'ja', 'zh_CN'];
  const blankLimit = dateBefore(spec.generationDate);
  const short = spec.shortName;
  const contentsId = `cnt_${short}`;
  const routeId = `route_${short}`;
  const flowId = `flow_${short}`;

  // ルールIDにフルプレフィックスを付与
  if (spec.rules) {
    for (const rule of spec.rules) {
      rule.fullId = `rule_${short}_${rule.id}`;
      if (rule.fullId.length > 20) {
        console.error(`ERROR: ruleId "${rule.fullId}" が 20 文字を超えています（${rule.fullId.length} 文字）。shortName または rule.id を短くしてください。`);
        process.exit(1);
      }
    }
  }

  // ノード解決: spec.nodes からフルノードリストを構築
  const nodes = resolveNodes(spec);
  // ノード間接続を解決
  resolveConnections(nodes, spec);
  // 座標計算
  calculateCoordinates(nodes, spec.pattern);
  // traceId 計算
  calculateTraceIds(nodes, spec);
  // プラグイン解決
  resolvePlugins(nodes, spec);
  // 分岐ノードの flow データ解決
  resolveBranchFlowData(nodes, spec);
  // デフォルト属性の付与
  resolveDefaultFlowAttributes(nodes);

  const xml = new XmlBuilder();
  xml.raw('<?xml version="1.0" encoding="UTF-16"?>');
  xml.open('data');

  // contents
  buildContents(xml, { locales, spec, contentsId, blankLimit, nodes });
  // route
  buildRoute(xml, { locales, spec, routeId, blankLimit, nodes });
  // flow
  buildFlow(xml, { locales, spec, flowId, contentsId, routeId, blankLimit, nodes });
  // matter_property
  if (spec.matterProperties) {
    for (const mp of spec.matterProperties) {
      buildMatterProperty(xml, { locales, mp });
    }
  }
  // rule
  if (spec.rules) {
    for (const rule of spec.rules) {
      buildRule(xml, { locales, rule });
    }
  }

  xml.close('data');
  return xml.toString();
}

// --- ノード解決 ---

function resolveNodes(spec) {
  const nodes = [];
  for (const n of spec.nodes) {
    const fullId = `${spec.shortName}_${n.id}`;
    nodes.push({
      ...n,
      fullId,
      nodeTypeStr: NODE_TYPE_STR[n.type],
      nodeTypeNum: NODE_TYPE_NUM[n.type],
      nodeVariety: NODE_VARIETY[n.type],
      name: n.name || defaultNodeName(n.type),
      prev: [],
      next: [],
      plugins: [],
      flowDetails: [],
      flowUnions: [],
      flowAttributes: [],
      paths: n.paths || null,
      branchMethod: n.branchMethod || null,
      x: 0, y: 0,
      traceId: '0.0',
      startNodeFlag: n.type === 'start' ? 'true' : 'false',
      endNodeFlag: n.type === 'end' ? 'true' : 'false',
    });
  }
  return nodes;
}

function defaultNodeName(type) {
  const m = { start: 'Start', end: 'End', apply: 'Apply', approve: 'Approve', confirm: 'Confirm', branch_start: 'Start branch', branch_end: 'End branch', sync_start: 'Sync start', sync_end: 'Sync end' };
  return m[type] || '';
}

function resolveConnections(nodes, spec) {
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  // edges が spec に明示されていれば使用、なければ nodes の順序から推定
  if (spec.edges) {
    for (const e of spec.edges) {
      const from = byId[e.from], to = byId[e.to];
      if (from && to) {
        if (!from.next.includes(to.fullId)) from.next.push(to.fullId);
        if (!to.prev.includes(from.fullId)) to.prev.push(from.fullId);
      }
    }
  } else {
    // straight: 順序どおり接続
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].next.push(nodes[i + 1].fullId);
      nodes[i + 1].prev.push(nodes[i].fullId);
    }
  }
}

function calculateCoordinates(nodes, pattern) {
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const byFullId = Object.fromEntries(nodes.map(n => [n.fullId, n]));
  const BASE_STEP_X = 100;
  const STEP_Y = 70;
  const CHAR_WIDTH = 6;       // 半角1文字あたりのピクセル幅
  const BASE_NODE_WIDTH = 96; // 16文字 × 6px = 96px（ノードのデフォルト幅）
  const NODE_PADDING = 20;    // ノード間の最低余白

  // ノード名の幅からステップ幅（スロット幅）を計算（10px単位に丸める）
  function stepXForNode(n) {
    const nameLen = n.name ? n.name.length : 0;
    const nameWidth = nameLen * CHAR_WIDTH;
    const raw = Math.max(BASE_STEP_X, nameWidth + NODE_PADDING);
    return Math.round(raw / 10) * 10;
  }

  // スロット内でノード自身を右にずらすオフセット（余白の半分）
  // 例: stepX=152, BASE_STEP_X=100 → extra=52 → offset=26
  // → ノードは左境界から26px内側に配置、右にも同じ26pxの余白が生まれる
  function selfOffsetForNode(n) {
    const extra = Math.max(0, stepXForNode(n) - BASE_STEP_X);
    return Math.round(extra / 2 / 10) * 10;
  }

  // トポロジカル順に幅を計算する再帰関数
  // branch_start から branch_end までのサブツリーの「幅」（必要な X スロット数）を計算
  function calcWidth(nodeId, visited) {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);
    const n = byFullId[nodeId];
    if (!n) return 0;
    if (n.type === 'branch_end' || n.type === 'sync_end') return 1; // 終端

    if (n.type === 'branch_start' || n.type === 'sync_start') {
      // 各パスの幅を合算（最低 1）
      let maxPathWidth = 0;
      const pathNextIds = n.next.filter(nid => {
        const nn = byFullId[nid];
        return nn && nn.type !== 'branch_end' && nn.type !== 'sync_end';
      });
      const directEnd = n.next.find(nid => {
        const nn = byFullId[nid];
        return nn && (nn.type === 'branch_end' || nn.type === 'sync_end');
      });
      for (const nid of pathNextIds) {
        let w = calcPathWidth(nid, directEnd || '', new Set(visited));
        maxPathWidth = Math.max(maxPathWidth, w);
      }
      // branch_start(1) + max path width + branch_end(1)
      return 1 + maxPathWidth + 1;
    }
    // 通常ノード: 自分(1) + 次のノードの幅
    if (n.next.length > 0) return 1 + calcWidth(n.next[0], visited);
    return 1;
  }

  function calcPathWidth(startId, endId, visited) {
    let w = 0;
    let cur = startId;
    while (cur && cur !== endId) {
      if (visited.has(cur)) break;
      visited.add(cur);
      const n = byFullId[cur];
      if (!n) break;
      if (n.type === 'branch_start' || n.type === 'sync_start') {
        w += calcWidth(cur, new Set(visited));
        // branch_end の次へ進む
        const endNode = nodes.find(e =>
          (e.type === 'branch_end' || e.type === 'sync_end') && e.prev.some(p => {
            // この branch_start のサブツリーに含まれる
            return true; // 簡易: 直接 next で辿る
          })
        );
        break;
      }
      w += 1;
      cur = n.next[0] || null;
    }
    return Math.max(w, 1);
  }

  // シンプルなアプローチ: edges のトポロジカル順にレイアウト
  // メインライン（直行パス）を y=50 に配置
  // 分岐パスのノードを y=50+STEP_Y*depth に配置

  const placed = new Set();

  function layoutNode(nodeId, x, y, depth) {
    if (placed.has(nodeId)) return x;
    const n = byFullId[nodeId];
    if (!n) return x;
    placed.add(nodeId);
    n.x = x + selfOffsetForNode(n);
    n.y = y;

    if (n.type === 'branch_start' || n.type === 'sync_start') {
      // 対応する branch_end を探す（edges で直接つながっている or paths 経由）
      // branch_end は n.next に含まれる（直行パスの場合）か、パスノード経由で到達
      // まず全 next のうち branch_end/sync_end を探す
      let endFullId = n.next.find(nid => {
        const nn = byFullId[nid];
        return nn && (nn.type === 'branch_end' || nn.type === 'sync_end');
      });
      // 直行パスがない場合、パスを辿って branch_end を探す
      if (!endFullId) {
        for (const nid of n.next) {
          const found = findBranchEnd(nid, new Set([n.fullId]));
          if (found) { endFullId = found; break; }
        }
      }

      // 分岐パス（branch_end 以外の next）
      const pathStarts = n.next.filter(nid => nid !== endFullId);

      let maxX = x + stepXForNode(n);
      for (let pi = 0; pi < pathStarts.length; pi++) {
        const pathY = y + STEP_Y * (pi + 1);
        maxX = Math.max(maxX, layoutPath(pathStarts[pi], endFullId, x + stepXForNode(n), pathY, depth + 1));
      }

      // branch_end を配置（branch_start の y に戻す）
      if (endFullId && !placed.has(endFullId)) {
        const endN = byFullId[endFullId];
        placed.add(endFullId);
        endN.x = maxX + selfOffsetForNode(endN);
        endN.y = n.y; // branch_start (n) の y 座標に明示的に戻す
        maxX = maxX + stepXForNode(endN);
      }
      // branch_end の次のノードへ（メインラインに戻る）
      // ※ branch_end の next が別の branch_end の場合はスキップ（親が管理）
      if (endFullId) {
        const endN = byFullId[endFullId];
        for (const nid of endN.next) {
          if (placed.has(nid)) continue;
          const nn = byFullId[nid];
          if (nn && (nn.type === 'branch_end' || nn.type === 'sync_end')) continue;
          maxX = layoutNode(nid, maxX, n.y, depth);
        }
      }
      return maxX;
    }

    // branch_end / sync_end は next を追跡しない（親の branch_start が管理する）
    if (n.type === 'branch_end' || n.type === 'sync_end') {
      return x + stepXForNode(n);
    }

    // 通常ノード: 次のノードへ（branch_end/sync_end は親が管理するのでスキップ）
    // confirm は終端枝のため本線レイアウトでは辿らず、後段で親の真下に配置する
    let nextX = x + stepXForNode(n);
    for (const nid of n.next) {
      if (placed.has(nid)) continue;
      const nn = byFullId[nid];
      if (nn && (nn.type === 'branch_end' || nn.type === 'sync_end')) continue;
      if (nn && nn.type === 'confirm') continue;
      nextX = layoutNode(nid, nextX, y, depth);
    }
    return nextX;
  }

  function findBranchEnd(nodeId, visited) {
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);
    const n = byFullId[nodeId];
    if (!n) return null;
    if (n.type === 'branch_end' || n.type === 'sync_end') return n.fullId;
    for (const nid of n.next) {
      const found = findBranchEnd(nid, visited);
      if (found) return found;
    }
    return null;
  }

  function layoutPath(startId, endId, x, y, depth) {
    let cur = startId;
    let curX = x;
    while (cur && !placed.has(cur)) {
      const n = byFullId[cur];
      if (!n) break;
      // branch_end/sync_end に到達したら停止（親が配置する）
      if (n.type === 'branch_end' || n.type === 'sync_end') break;
      curX = layoutNode(cur, curX, y, depth);
      // layoutNode が branch_start の場合は内部で next を処理済み
      if (n.type === 'branch_start' || n.type === 'sync_start') break;
      // 次のノードへ（branch_end でないものを辿る）
      cur = n.next.find(nid => {
        if (placed.has(nid)) return false;
        const nn = byFullId[nid];
        return nn && nn.type !== 'branch_end' && nn.type !== 'sync_end';
      }) || null;
    }
    return curX;
  }

  // Start ノードから配置開始
  const startNode = nodes.find(n => n.type === 'start');
  if (startNode) {
    layoutNode(startNode.fullId, 50, 50, 0);
  }

  // confirm ノードは親（previousNodeId = 接続元ノード）の真下に配置（route 定義実測: y = 親 + 140）
  const CONFIRM_Y_OFFSET = 140;
  for (const n of nodes) {
    if (n.type !== 'confirm' || placed.has(n.fullId)) continue;
    const parent = nodes.find(p => p.next.includes(n.fullId));
    if (parent) {
      n.x = parent.x;
      n.y = parent.y + CONFIRM_Y_OFFSET;
      placed.add(n.fullId);
    }
  }

  // 未配置ノードがあれば末尾に配置
  let fallbackX = 50;
  for (const n of nodes) {
    if (!placed.has(n.fullId)) {
      n.x = fallbackX + selfOffsetForNode(n);
      n.y = 50;
      fallbackX += stepXForNode(n);
    }
  }
}

function calculateTraceIds(nodes, spec) {
  // straight: 0.0 for start, 0.N for others
  let idx = 0;
  for (const n of nodes) {
    if (n.type === 'start') { n.traceId = '0.0'; }
    else if (n.type === 'end') { n.traceId = '0.0'; }
    else if (n.type === 'confirm') { n.traceId = ''; }  // 確認ノードは traceId 空（route 定義実測）
    else { n.traceId = `0.${idx}`; }
    idx++;
  }
  // branch ペアの traceId は特殊処理
  for (const n of nodes) {
    if (n.type === 'branch_start' || n.type === 'sync_start') {
      const endNode = nodes.find(e =>
        (e.type === 'branch_end' || e.type === 'sync_end') && e.id === n.id.replace('brs', 'bre').replace('ss', 'se')
      );
      if (endNode) endNode.traceId = n.traceId.replace(/\.\d+$/, '') + '-0.0';
    }
  }
}

function resolvePlugins(nodes, spec) {
  const short = spec.shortName;
  let pluginIdx = 1;
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  for (const n of nodes) {
    if (!n.plugin) continue;
    const prevNode = nodes.find(p => p.next.includes(n.fullId));
    const extPointId = getExtensionPointId(n, prevNode);
    const pluginId = getPluginId(extPointId, n.plugin.suffix);
    const routePluginId = `plg_${short.replace(/_/g, '')}_${String(pluginIdx).padStart(2, '0')}`;
    pluginIdx++;

    const suffix = n.plugin.suffix;
    // apply ノードで動的プラグインは使用不可（apply 拡張ポイントは role/user/department 等のみ）
    if (n.type === 'apply' && (suffix.startsWith('apply_user_') || suffix.startsWith('before_user_'))) {
      console.error(`WARNING: apply ノード "${n.id}" に動的プラグイン "${suffix}" は使用できません。role を推奨します。`);
    }
    const isDynamic = suffix.startsWith('apply_user_') || suffix.startsWith('before_user_');
    let parameter = n.plugin.parameter || '';
    let targetType = n.plugin.targetType || inferTargetType(suffix);
    // logic_flow_user: targetCode をオブジェクトで渡された場合は JSON 文字列に変換する
    let rawTargetCode = n.plugin.targetCode || '';
    let targetCode = (suffix === 'logic_flow_user' && typeof rawTargetCode === 'object' && rawTargetCode !== null)
      ? JSON.stringify(rawTargetCode)
      : rawTargetCode;

    // 動的プラグイン: parameter は "|company^orgSet^code" 形式
    if (isDynamic && n.plugin.targetCode && !parameter) {
      const company = spec.company || 'comp_sample_01';
      const orgSet = spec.orgSet || company;
      parameter = `|${company}^${orgSet}^${n.plugin.targetCode}`;
      targetType = null;  // 動的プラグインは targetType/targetCode null
      targetCode = null;
    }
    // 静的プラグイン (role等): parameter = targetCode
    if (!isDynamic && !parameter) {
      parameter = targetCode;
    }

    n.plugins.push({
      routePluginId,
      extensionPointId: extPointId,
      pluginId,
      parameter,
      targetType,
      targetCode,
    });
  }
}

function resolveDefaultFlowAttributes(nodes) {
  for (const n of nodes) {
    // approve / apply ノード: attributeType=1, attributeKey=5, value=0
    if (n.type === 'approve' || n.type === 'apply') {
      n.flowAttributes.push({
        no: randomId(15), attributeType: '1', attributeKey: '5', value: '0',
      });
    }
    // branch_end ノード: attributeType=8, attributeKey=NoSetting, value=3
    if (n.type === 'branch_end') {
      n.flowAttributes.push({
        no: randomId(15), attributeType: '8', attributeKey: 'NoSetting', value: '3',
      });
    }
  }
}

function resolveBranchFlowData(nodes, spec) {
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const short = spec.shortName;

  for (const n of nodes) {
    if (n.type !== 'branch_start' || !n.paths) continue;

    // branchMethod: rule=1, user_select=0, program=2
    const methodValue = n.branchMethod === 'rule' ? '1' : (n.branchMethod === 'program' ? '2' : '0');
    n.flowAttributes.push({
      no: randomId(15), attributeType: '7', attributeKey: 'NoSetting', value: methodValue,
    });

    // details & unions for each path
    for (let pi = 0; pi < n.paths.length; pi++) {
      const p = n.paths[pi];
      const detailNo = randomId(15);

      if (n.branchMethod === 'rule' && p.condition) {
        n.flowDetails.push({
          no: detailNo,
          cooperationType: '19',
          cooperationClassify: '2',
          cooperationId: `rule_${short}_${p.condition.ruleId}`,
        });
      }

      // union: link detail to path head node (直行パスの場合は branch_end を指す)
      let countTargetNodeId;
      if (p.nodes && p.nodes.length > 0) {
        const headNode = byId[p.nodes[0]];
        countTargetNodeId = headNode ? headNode.fullId : `${short}_${p.nodes[0]}`;
      } else {
        // 直行パス: 対応する branch_end を探す
        const branchEnd = nodes.find(e => e.type === 'branch_end' && e.prev.includes(n.fullId));
        countTargetNodeId = branchEnd ? branchEnd.fullId : '';
      }
      n.flowUnions.push({
        branchUnionId: detailNo,
        branchUnionGroupId: randomId(15),
        countTargetNodeId,
      });
    }

    // user_select: add attributeType=11 for selectable nodes
    if (n.branchMethod === 'user_select') {
      for (const p of n.paths) {
        const headNodeId = p.nodes[0];
        const headNode = byId[headNodeId];
        if (headNode) {
          n.flowAttributes.push({
            no: randomId(15), attributeType: '11', attributeKey: '0', value: headNode.fullId,
          });
        }
      }
    }
  }
}

function inferTargetType(suffix) {
  const m = {
    role: 'role', user: 'user', post: 'post', department: 'department',
    department_and_post: 'departmentAndPost', department_and_role: 'departmentAndRole',
    public_group_and_role: 'publicGroupAndRole',
    logic_flow_user: 'logic_flow_user',
  };
  // dynamic types have empty targetType
  if (suffix.startsWith('apply_user_') || suffix.startsWith('before_user_')) return '';
  return m[suffix] || '';
}

// --- contents セクション ---

function buildContents(xml, ctx) {
  const { locales, spec, contentsId, blankLimit, nodes } = ctx;
  const short = spec.shortName;
  xml.open('contents', { id: contentsId });
  xml.openArray('value');

  for (const locale of locales) {
    xml.openObj();
    xml.tagStr('contentsId', contentsId);
    xml.tagStr('localeId', locale);
    xml.tagStr('contentsName', spec.names[locale]);
    xml.tagStr('contentsType', '0');
    xml.tagNull('note');
    xml.tagStr('updateCount', '1');

    xml.openArray('details');
    // blank version
    xml.openObj();
    xml.tagStr('contentsId', contentsId);
    xml.tagStr('contentsVersionId', `${contentsId}_0`);
    xml.tagStr('localeId', locale);
    xml.tagStr('startDate', '2000/01/01');
    xml.tagStr('limitDate', blankLimit);
    xml.tagStr('versionStatus', '9');
    xml.tagNull('note');
    xml.emptyArray('pages');
    xml.emptyArray('plugins');
    xml.emptyArray('mails');
    xml.emptyArray('rules');
    xml.emptyArray('imBoxs');
    xml.emptyArray('messages');
    xml.closeObj();

    // active version
    xml.openObj();
    xml.tagStr('contentsId', contentsId);
    xml.tagStr('contentsVersionId', `${contentsId}_1`);
    xml.tagStr('localeId', locale);
    xml.tagStr('startDate', spec.generationDate);
    xml.tagStr('limitDate', '2999/12/31');
    xml.tagStr('versionStatus', '1');
    xml.tagNull('note');

    // pages
    xml.openArray('pages');
    const basePath = spec.screenBasePath;
    const scr = spec.screens || {};
    // pageType と suffix の対応:
    //   - suffix は jssp-im-workflow-usage の慣例ディレクトリ名に揃えること
    //     （ユーザがプロジェクト規約を読まずに spec.json で screens を省略しても整合するため）
    //   - 特に pageType=4 は IM-Workflow 公式用語の "process" ではなく、
    //     業務慣例の "approve"（承認画面）を採用している
    //
    // 各エントリのフィールド:
    //   key          spec.json の screens 内のキー名
    //   suffix       basePath からの相対 suffix（デフォルトパスの生成に使用）
    //   sharedWith   省略時に共用する別 key（reapply は apply と、referDetail は processDetail と共用）
    //   defaultOmit  true の場合、spec.json で明示指定が無い限り XML から除外（applyTask 等）
    //   type         IM-Workflow の pageType 値
    //
    // spec.json の screens フィールドの解釈:
    //   - "path/to/index"  → そのパスを使用
    //   - false            → XML から除外（明示的に「不要」と宣言）
    //   - undefined / null → デフォルト挙動
    //                        ・defaultOmit:true → 除外
    //                        ・sharedWith あり → 別 key と共用（同じパス）
    //                        ・上記以外 → basePath + suffix
    const defaultPageMap = [
      { key: 'apply',         suffix: 'apply/index',          type: '0' },
      // 一時保存(1)は既定で申請画面を共用する（申請画面が showTemporarySave で一時保存も兼ねる設計が前提）。
      // 専用の一時保存画面が必要な場合のみ spec.json の screens.tempSave にパスを明示する。
      { key: 'tempSave',      suffix: 'tempsave/index',       type: '1', sharedWith: 'apply' },
      { key: 'applyTask',     suffix: 'apply_task/index',     type: '2', defaultOmit: true },
      { key: 'reapply',       suffix: 'apply/index',          type: '3', sharedWith: 'apply' },
      { key: 'process',       suffix: 'approve/index',        type: '4' },
      { key: 'confirm',       suffix: 'confirm/index',        type: '5' },
      { key: 'processDetail', suffix: 'process_detail/index', type: '6' },
      { key: 'referDetail',   suffix: 'process_detail/index', type: '7', sharedWith: 'processDetail' },
    ];

    // pageMap 構築（false 指定や defaultOmit は除外）
    const pageMap = [];
    for (let i = 0; i < defaultPageMap.length; i++) {
      const p = defaultPageMap[i];
      const specified = scr[p.key];

      // 明示的に false → 除外
      if (specified === false) continue;

      // 明示的に文字列 → そのパスを使用
      if (typeof specified === 'string' && specified) {
        pageMap.push({ type: p.type, path: specified });
        continue;
      }

      // 未指定（undefined/null）→ デフォルト挙動
      if (p.defaultOmit) continue;  // applyTask 等はデフォルト除外

      // sharedWith 指定があれば、共用先の指定パス（or デフォルト）を使う
      if (p.sharedWith) {
        const sharedSpec = scr[p.sharedWith];
        if (sharedSpec === false) continue;  // 共用先が除外されていれば自分も除外
        if (typeof sharedSpec === 'string' && sharedSpec) {
          pageMap.push({ type: p.type, path: sharedSpec });
          continue;
        }
        // 共用先も未指定 → 共用先のデフォルト suffix を使う
        const sharedEntry = defaultPageMap.find(e => e.key === p.sharedWith);
        pageMap.push({ type: p.type, path: `${basePath}/${sharedEntry.suffix}` });
        continue;
      }

      // 通常デフォルト
      pageMap.push({ type: p.type, path: `${basePath}/${p.suffix}` });
    }

    // pagePathId / pageName は pageType 番号でインデックスする（除外で i がズレるため）
    for (let i = 0; i < pageMap.length; i++) {
      const typeIdx = Number(pageMap[i].type);
      xml.openObj();
      xml.tagStr('pagePathId', `${short}_page_${typeIdx}`);
      xml.tagStr('localeId', locale);
      xml.tagStr('contentsId', contentsId);
      xml.tagStr('contentsVersionId', `${contentsId}_1`);
      xml.tagStr('pageName', PAGE_NAMES[locale][typeIdx]);
      xml.tagStr('pageType', pageMap[i].type);
      xml.tagNull('note');
      xml.tagStr('defaultFlag', '1');
      xml.tagStr('pathType', '0');
      xml.tagStr('scriptPath', pageMap[i].path);
      xml.tagNull('applicationId');
      xml.tagNull('serviceId');
      xml.tagNull('pagePath');
      xml.closeObj();
    }
    xml.closeArray('pages');

    // contents plugins (action process + matter end process)
    xml.openArray('plugins');
    const actionNodes = nodes.filter(n => (n.type === 'apply' || n.type === 'approve') && n.actionProcess);
    let cpOrder = 0;
    for (const an of actionNodes) {
      const actionPath = an.actionProcess;
      // "java" 指定時は Java クラス実行（JavaEE 開発モデル）、それ以外（省略時含む）は JSSP スクリプト実行
      const isJava = an.actionProcessImpl === 'java';
      const executorSuffix = isJava ? 'pluginJavaExecutor' : 'pluginScriptExecutor';
      // contentsPluginIds はロケール間で共有するため、初回のみ生成
      if (!ctx._contentsPluginIds) ctx._contentsPluginIds = {};
      if (!ctx._contentsPluginIds[an.fullId]) {
        ctx._contentsPluginIds[an.fullId] = genContentsPluginId(['cp', short]);
      }
      const cpId = ctx._contentsPluginIds[an.fullId];
      xml.openObj();
      xml.tagStr('contentsPluginId', cpId);
      xml.tagStr('localeId', locale);
      xml.tagStr('contentsId', contentsId);
      xml.tagStr('contentsVersionId', `${contentsId}_1`);
      xml.tagStr('exPointId', 'jp.co.intra_mart.workflow.plugin.event.node.action.process');
      xml.tagStr('pluginId', `jp.co.intra_mart.workflow.plugin.event.node.action.process.${executorSuffix}`);
      xml.tagStr('pluginName', an.name);
      xml.tagStr('parameter', actionPath);
      xml.tagStr('nodeType', an.nodeTypeNum);
      xml.tagStr('defaultFlag', '1');
      xml.tagStr('executeOrder', String(cpOrder++));
      xml.tagNull('note');
      xml.closeObj();
    }

    // matter end process plugin (spec.matterEndProcess)
    if (spec.matterEndProcess) {
      const mepPath = spec.matterEndProcess;
      const noTran = spec.matterEndProcessNoTransaction === true;
      // "java" 指定時は Java クラス実行（JavaEE 開発モデル）、それ以外（省略時含む）は JSSP スクリプト実行
      const isJava = spec.matterEndProcessImpl === 'java';
      const executorSuffix = isJava ? 'pluginJavaExecutor' : 'pluginScriptExecutor';
      const mepExPoint = noTran
        ? 'jp.co.intra_mart.workflow.plugin.event.matter.end_no_transaction.process'
        : 'jp.co.intra_mart.workflow.plugin.event.matter.end.process';
      const mepPluginId = `${mepExPoint}.${executorSuffix}`;
      if (!ctx._matterEndPluginId) {
        ctx._matterEndPluginId = genContentsPluginId(['cp', short, 'mep']);
      }
      xml.openObj();
      xml.tagStr('contentsPluginId', ctx._matterEndPluginId);
      xml.tagStr('localeId', locale);
      xml.tagStr('contentsId', contentsId);
      xml.tagStr('contentsVersionId', `${contentsId}_1`);
      xml.tagStr('exPointId', mepExPoint);
      xml.tagStr('pluginId', mepPluginId);
      xml.tagStr('pluginName', 'matter_end_process');
      xml.tagStr('parameter', mepPath);
      xml.tagStr('nodeType', '');
      xml.tagStr('defaultFlag', '1');
      xml.tagStr('executeOrder', String(cpOrder++));
      xml.tagNull('note');
      xml.closeObj();
    }

    // arrive process plugin（ノード単位、spec.nodes[].arriveProcess）
    const arriveNodes = nodes.filter(n => n.arriveProcess);
    for (const an of arriveNodes) {
      const arrivePath = an.arriveProcess;
      const isJava = an.arriveProcessImpl === 'java';
      const executorSuffix = isJava ? 'pluginJavaExecutor' : 'pluginScriptExecutor';
      if (!ctx._arrivePluginIds) ctx._arrivePluginIds = {};
      if (!ctx._arrivePluginIds[an.fullId]) {
        ctx._arrivePluginIds[an.fullId] = genContentsPluginId(['cp', short]);
      }
      const cpId = ctx._arrivePluginIds[an.fullId];
      xml.openObj();
      xml.tagStr('contentsPluginId', cpId);
      xml.tagStr('localeId', locale);
      xml.tagStr('contentsId', contentsId);
      xml.tagStr('contentsVersionId', `${contentsId}_1`);
      xml.tagStr('exPointId', 'jp.co.intra_mart.workflow.plugin.event.node.arrive.process');
      xml.tagStr('pluginId', `jp.co.intra_mart.workflow.plugin.event.node.arrive.process.${executorSuffix}`);
      xml.tagStr('pluginName', an.name);
      xml.tagStr('parameter', arrivePath);
      xml.tagStr('nodeType', an.nodeTypeNum);
      xml.tagStr('defaultFlag', '1');
      xml.tagStr('executeOrder', String(cpOrder++));
      xml.tagNull('note');
      xml.closeObj();
    }

    // matter start process plugin (spec.matterStartProcess)
    if (spec.matterStartProcess) {
      const mspPath = spec.matterStartProcess;
      const isJava = spec.matterStartProcessImpl === 'java';
      const executorSuffix = isJava ? 'pluginJavaExecutor' : 'pluginScriptExecutor';
      const mspExPoint = 'jp.co.intra_mart.workflow.plugin.event.matter.start.process';
      if (!ctx._matterStartPluginId) {
        ctx._matterStartPluginId = genContentsPluginId(['cp', short, 'mst']);
      }
      xml.openObj();
      xml.tagStr('contentsPluginId', ctx._matterStartPluginId);
      xml.tagStr('localeId', locale);
      xml.tagStr('contentsId', contentsId);
      xml.tagStr('contentsVersionId', `${contentsId}_1`);
      xml.tagStr('exPointId', mspExPoint);
      xml.tagStr('pluginId', `${mspExPoint}.${executorSuffix}`);
      xml.tagStr('pluginName', 'matter_start_process');
      xml.tagStr('parameter', mspPath);
      xml.tagStr('nodeType', '');
      xml.tagStr('defaultFlag', '1');
      xml.tagStr('executeOrder', String(cpOrder++));
      xml.tagNull('note');
      xml.closeObj();
    }

    // matter archive process plugin (spec.matterArchiveProcess)
    if (spec.matterArchiveProcess) {
      const macPath = spec.matterArchiveProcess;
      const isJava = spec.matterArchiveProcessImpl === 'java';
      const executorSuffix = isJava ? 'pluginJavaExecutor' : 'pluginScriptExecutor';
      const macExPoint = 'jp.co.intra_mart.workflow.plugin.event.matter.archive.process';
      if (!ctx._matterArchivePluginId) {
        ctx._matterArchivePluginId = genContentsPluginId(['cp', short, 'arc']);
      }
      xml.openObj();
      xml.tagStr('contentsPluginId', ctx._matterArchivePluginId);
      xml.tagStr('localeId', locale);
      xml.tagStr('contentsId', contentsId);
      xml.tagStr('contentsVersionId', `${contentsId}_1`);
      xml.tagStr('exPointId', macExPoint);
      xml.tagStr('pluginId', `${macExPoint}.${executorSuffix}`);
      xml.tagStr('pluginName', 'matter_archive_process');
      xml.tagStr('parameter', macPath);
      xml.tagStr('nodeType', '');
      xml.tagStr('defaultFlag', '1');
      xml.tagStr('executeOrder', String(cpOrder++));
      xml.tagNull('note');
      xml.closeObj();
    }

    // matter delete listener plugins（未完了/完了/過去。spec.activeMatterDeleteProcess 等）
    const MATTER_DELETE_KINDS = [
      { specKey: 'activeMatterDeleteProcess', implKey: 'activeMatterDeleteProcessImpl', idPart: 'adl',
        exPointId: 'jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process',
        pluginName: 'active_matter_delete_process', ctxKey: '_activeMatterDeletePluginId' },
      { specKey: 'completedMatterDeleteProcess', implKey: 'completedMatterDeleteProcessImpl', idPart: 'cdl',
        exPointId: 'jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process',
        pluginName: 'completed_matter_delete_process', ctxKey: '_completedMatterDeletePluginId' },
      { specKey: 'archivedMatterDeleteProcess', implKey: 'archivedMatterDeleteProcessImpl', idPart: 'xdl',
        exPointId: 'jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process',
        pluginName: 'archived_matter_delete_process', ctxKey: '_archivedMatterDeletePluginId' },
    ];
    for (const kind of MATTER_DELETE_KINDS) {
      const mdPath = spec[kind.specKey];
      if (!mdPath) continue;
      const isJava = spec[kind.implKey] === 'java';
      const executorSuffix = isJava ? 'pluginJavaExecutor' : 'pluginScriptExecutor';
      if (!ctx[kind.ctxKey]) {
        ctx[kind.ctxKey] = genContentsPluginId(['cp', short, kind.idPart]);
      }
      xml.openObj();
      xml.tagStr('contentsPluginId', ctx[kind.ctxKey]);
      xml.tagStr('localeId', locale);
      xml.tagStr('contentsId', contentsId);
      xml.tagStr('contentsVersionId', `${contentsId}_1`);
      xml.tagStr('exPointId', kind.exPointId);
      xml.tagStr('pluginId', `${kind.exPointId}.${executorSuffix}`);
      xml.tagStr('pluginName', kind.pluginName);
      xml.tagStr('parameter', mdPath);
      xml.tagStr('nodeType', '');
      xml.tagStr('defaultFlag', '1');
      xml.tagStr('executeOrder', String(cpOrder++));
      xml.tagNull('note');
      xml.closeObj();
    }

    xml.closeArray('plugins');

    xml.emptyArray('mails');

    // rules (if branch pattern)
    xml.openArray('rules');
    if (spec.rules) {
      for (const rule of spec.rules) {
        xml.openObj();
        xml.tagStr('contentsRuleId', `rule_${short}_${rule.id}`);
        xml.tagStr('contentsId', contentsId);
        xml.tagStr('contentsVersionId', `${contentsId}_1`);
        xml.tagNull('ruleData');
        xml.closeObj();
      }
    }
    xml.closeArray('rules');

    xml.emptyArray('imBoxs');
    xml.emptyArray('messages');
    xml.closeObj(); // active version
    xml.closeArray('details');
    xml.closeObj(); // locale
  }

  xml.closeArray('value');
  xml.close('contents');
}

// --- route セクション ---

function buildRoute(xml, ctx) {
  const { locales, spec, routeId, blankLimit, nodes } = ctx;
  xml.open('route', { id: routeId });
  xml.openArray('value');

  for (const locale of locales) {
    xml.openObj();
    xml.tagStr('routeId', routeId);
    xml.tagStr('localeId', locale);
    xml.tagStr('routeName', spec.names[locale]);
    xml.tagStr('routeType', '0');
    xml.tagNull('note');
    xml.tagStr('updateCount', '1');

    xml.openArray('details');
    // blank version
    xml.openObj();
    xml.tagStr('routeId', routeId);
    xml.tagStr('routeVersionId', `${routeId}_0`);
    xml.tagStr('localeId', locale);
    xml.tagStr('startDate', '2000/01/01');
    xml.tagStr('limitDate', blankLimit);
    xml.tagStr('versionStatus', '9');
    xml.tagNull('note');
    xml.tagNull('routeFilePath');
    xml.tagNull('routeXmlFile');
    xml.emptyArray('plugins');
    xml.closeObj();

    // active version
    xml.openObj();
    xml.tagStr('routeId', routeId);
    xml.tagStr('routeVersionId', `${routeId}_1`);
    xml.tagStr('localeId', locale);
    xml.tagStr('startDate', spec.generationDate);
    xml.tagStr('limitDate', '2999/12/31');
    xml.tagStr('versionStatus', '1');
    xml.tagNull('note');
    xml.tagStr('routeFilePath', `im_workflow/data/default/master/route/${routeId}/${routeId}_1/route.xml`);

    // routeXmlFile
    xml.open('routeXmlFile', { type: 'object' });
    xml.tagStr('routeId', routeId);
    xml.tagStr('routeVersionId', `${routeId}_1`);
    xml.tagStr('routeType', '0');

    // nodes
    xml.openArray('nodes');
    for (const n of nodes) {
      xml.openObj();
      xml.tagStr('nodeId', n.fullId);
      xml.tagStr('nodeName', n.name);
      xml.tagStr('nodeType', n.nodeTypeStr);
      xml.tagStr('nodeVariety', n.nodeVariety);

      xml.openArray('previousNodeIds');
      for (const p of n.prev) xml.raw(`<value type="string">${escXml(p)}</value>`);
      xml.closeArray('previousNodeIds');

      xml.openArray('nextNodeIds');
      for (const nx of n.next) xml.raw(`<value type="string">${escXml(nx)}</value>`);
      xml.closeArray('nextNodeIds');

      // node-level plugins
      xml.openArray('plugins');
      for (const pl of n.plugins) {
        buildRoutePlugin(xml, pl, routeId, `${routeId}_1`, n.fullId, n.nodeTypeNum);
      }
      xml.closeArray('plugins');

      xml.tagNum('x', n.x);
      xml.tagNum('y', n.y);
      xml.tagStr('startNodeFlag', n.startNodeFlag);
      xml.tagStr('endNodeFlag', n.endNodeFlag);
      xml.tagStr('traceId', n.traceId);
      xml.tagNull('routeTemplateId');
      xml.tagNull('routeTemplateName');
      xml.tagNull('parentNode');
      xml.closeObj();
    }
    xml.closeArray('nodes');

    xml.emptyArray('comments');
    xml.emptyArray('swimlanes');
    xml.close('routeXmlFile'); // routeXmlFile object

    // route-level plugins (duplicate of all node-level plugins)
    xml.openArray('plugins');
    for (const n of nodes) {
      for (const pl of n.plugins) {
        buildRoutePlugin(xml, pl, routeId, `${routeId}_1`, n.fullId, n.nodeTypeNum);
      }
    }
    xml.closeArray('plugins');

    xml.closeObj(); // active version
    xml.closeArray('details');
    xml.closeObj(); // locale
  }

  xml.closeArray('value');
  xml.close('route');
}

function buildRoutePlugin(xml, pl, routeId, routeVersionId, nodeId, nodeTypeNum) {
  xml.openObj();
  xml.tagStr('routePluginId', pl.routePluginId);
  xml.tagStr('routeId', routeId);
  xml.tagStr('routeVersionId', routeVersionId);
  xml.tagStr('nodeId', nodeId);
  xml.tagStr('nodeType', nodeTypeNum);
  xml.tagStr('extensionPointId', pl.extensionPointId);
  xml.tagStr('pluginId', pl.pluginId);
  xml.tagStr('parameter', pl.parameter);
  xml.tagStr('targetType', pl.targetType);
  xml.tagStr('targetCode', pl.targetCode);
  xml.closeObj();
}

// --- flow セクション ---

function buildFlow(xml, ctx) {
  const { locales, spec, flowId, contentsId, routeId, blankLimit, nodes } = ctx;
  xml.open('flow', { id: flowId });
  xml.openArray('value');

  for (const locale of locales) {
    xml.openObj();
    xml.tagStr('flowId', flowId);
    xml.tagStr('localeId', locale);
    xml.tagStr('flowName', spec.names[locale]);
    xml.tagNull('note');
    xml.tagStr('updateCount', '1');

    xml.openArray('details');
    // blank version
    xml.openObj();
    xml.tagStr('flowId', flowId);
    xml.tagStr('flowVersionId', `${flowId}_0`);
    xml.tagStr('localeId', locale);
    xml.tagStr('startDate', '2000/01/01');
    xml.tagStr('limitDate', blankLimit);
    xml.tagStr('versionStatus', '9');
    xml.tagNull('note');
    xml.tagNull('contentsId'); xml.tagNull('routeId');
    xml.tagNull('lumpProcessFlag'); xml.tagNull('lumpConfirmFlag');
    xml.tagNull('attachFileFlag'); xml.tagNull('confirmUserSetupFlag');
    xml.tagNull('completeMatterConfirmFlag');
    xml.tagNull('autoProcessFlag'); xml.tagNull('autoProcessLimitDay');
    xml.tagNull('autoProcessLimitType'); xml.tagNull('autoPressFlag');
    xml.tagNull('autoPressLimitDay'); xml.tagNull('asyncProcessFlag');
    xml.tagNull('sysDateTargetExpandFlag'); xml.tagNull('calendarId');
    xml.tagNull('enabledContentsId'); xml.tagNull('contentsVersionId');
    xml.tagNull('enabledRouteId'); xml.tagNull('routeVersionId');
    xml.emptyArray('handleUsers');
    xml.emptyArray('defaultOrgzs');
    xml.emptyArray('flows');
    xml.emptyArray('nodes');
    xml.closeObj();

    // active version
    xml.openObj();
    xml.tagStr('flowId', flowId);
    xml.tagStr('flowVersionId', `${flowId}_1`);
    xml.tagStr('localeId', locale);
    xml.tagStr('startDate', spec.generationDate);
    xml.tagStr('limitDate', '2999/12/31');
    xml.tagStr('versionStatus', '1');
    xml.tagNull('note');
    xml.tagStr('contentsId', contentsId);
    xml.tagStr('routeId', routeId);
    const fs = spec.flowSettings || {};
    xml.tagStr('lumpProcessFlag', fs.lumpProcess === false ? '0' : '1');
    xml.tagStr('lumpConfirmFlag', fs.lumpProcess === false ? '0' : '1');
    xml.tagStr('attachFileFlag', fs.attachFile === false ? '0' : '1');
    xml.tagStr('confirmUserSetupFlag', fs.confirmUserSetup ? '1' : '0');
    xml.tagStr('completeMatterConfirmFlag', fs.completedMatterConfirm ? '1' : '0');
    xml.tagStr('autoProcessFlag', fs.autoProcess ? '1' : '0');
    xml.tagStr('autoProcessLimitDay', fs.autoProcessLimitDay != null ? String(fs.autoProcessLimitDay) : null);
    xml.tagStr('autoProcessLimitType', fs.autoProcessLimitType != null ? String(fs.autoProcessLimitType) : (fs.autoProcess ? '0' : null));
    xml.tagStr('autoPressFlag', fs.autoPress ? '1' : '0');
    xml.tagStr('autoPressLimitDay', fs.autoPressLimitDay != null ? String(fs.autoPressLimitDay) : null);
    xml.tagStr('asyncProcessFlag', fs.asyncProcess ? '1' : '0');
    xml.tagStr('sysDateTargetExpandFlag', fs.sysDateTargetExpand ? '1' : '0');
    xml.tagStr('calendarId', fs.calendarId || null);
    xml.tagNull('enabledContentsId');
    xml.tagNull('contentsVersionId');
    xml.tagNull('enabledRouteId');
    xml.tagNull('routeVersionId');

    xml.emptyArray('handleUsers');
    xml.emptyArray('defaultOrgzs');
    xml.emptyArray('flows');

    // flow nodes (exclude start and end)
    xml.openArray('nodes');
    const flowNodes = nodes.filter(n => n.type !== 'start' && n.type !== 'end');
    for (const n of flowNodes) {
      xml.openObj();
      xml.tagStr('flowId', flowId);
      xml.tagStr('flowVersionId', `${flowId}_1`);
      xml.tagStr('contentsVersionId', `${contentsId}_1`);
      xml.tagStr('routeVersionId', `${routeId}_1`);
      xml.tagStr('nodeId', n.fullId);
      xml.tagStr('nodeType', n.nodeTypeNum);
      const isSystem = !isHumanNode(n.type);
      const isHuman = isHumanNode(n.type);
      // 確認ノードは human だが lumpProcessFlag=0 / attachFileFlag=0（flow 定義実測）
      const isConfirm = n.type === 'confirm';
      xml.tagStr('lumpProcessFlag', isConfirm ? '0' : (isHuman ? '1' : null));
      xml.tagStr('attachFileFlag', isConfirm ? '0' : (isHuman ? (n.type === 'apply' ? '2' : '1') : null));
      xml.tagStr('autoProcessFlag', isSystem ? null : '0');
      xml.tagNull('autoProcessLimitDay');
      xml.tagStr('autoProcessLimitType', isSystem ? null : '0');
      xml.tagStr('autoPressFlag', isSystem ? null : '0');
      xml.tagNull('autoPressLimitDay');
      xml.tagStr('localeId', locale);

      // details (for branch_start nodes)
      xml.openArray('details');
      for (const d of (n.flowDetails || [])) {
        xml.openObj();
        xml.tagStr('no', d.no);
        xml.tagStr('flowId', flowId);
        xml.tagStr('flowVersionId', `${flowId}_1`);
        xml.tagStr('contentsVersionId', `${contentsId}_1`);
        xml.tagStr('routeVersionId', `${routeId}_1`);
        xml.tagStr('nodeId', n.fullId);
        xml.tagStr('cooperationType', d.cooperationType);
        xml.tagStr('cooperationClassify', d.cooperationClassify);
        xml.tagStr('cooperationId', d.cooperationId);
        xml.tagStr('emptyFlag', '0');
        xml.closeObj();
      }
      xml.closeArray('details');

      // attributes
      xml.openArray('attributes');
      for (const a of (n.flowAttributes || [])) {
        xml.openObj();
        xml.tagStr('no', a.no);
        xml.tagStr('flowId', flowId);
        xml.tagStr('flowVersionId', `${flowId}_1`);
        xml.tagStr('contentsVersionId', `${contentsId}_1`);
        xml.tagStr('routeVersionId', `${routeId}_1`);
        xml.tagStr('nodeId', n.fullId);
        xml.tagStr('localeId', locale);
        xml.tagStr('attributeType', a.attributeType);
        xml.tagStr('attributeKey', a.attributeKey);
        xml.tag('value', 'string', a.value);
        xml.closeObj();
      }
      xml.closeArray('attributes');

      // unions (for branch_start nodes)
      xml.openArray('unions');
      for (const u of (n.flowUnions || [])) {
        xml.openObj();
        xml.tagStr('branchUnionId', u.branchUnionId);
        xml.tagStr('flowId', flowId);
        xml.tagStr('flowVersionId', `${flowId}_1`);
        xml.tagStr('contentsVersionId', `${contentsId}_1`);
        xml.tagStr('routeVersionId', `${routeId}_1`);
        xml.tagStr('nodeId', n.fullId);
        xml.tagStr('branchUnionGroupId', u.branchUnionGroupId);
        xml.tagStr('branchUnionGroupClassify', '0');
        xml.tagStr('countTrue', '1');
        xml.tagStr('countTargetNodeId', u.countTargetNodeId);
        xml.closeObj();
      }
      xml.closeArray('unions');

      xml.tagNull('routeNode');
      xml.closeObj();
    }
    xml.closeArray('nodes');

    xml.closeObj(); // active version
    xml.closeArray('details');
    xml.closeObj(); // locale
  }

  xml.closeArray('value');
  xml.close('flow');
}

// --- matter_property ---

function buildMatterProperty(xml, ctx) {
  const { locales, mp } = ctx;
  xml.open('matter_property', { id: mp.key });
  xml.openArray('value');

  for (const locale of locales) {
    xml.openObj();
    xml.tagStr('matterPropertyKey', mp.key);
    xml.tagStr('localeId', locale);
    xml.tagStr('matterPropertyName', mp.names[locale]);
    xml.tagStr('matterPropertyModelType', mp.type === 'numeric' ? '1' : '0');
    xml.tagStr('matterPropertyTypeListPattern', '1');
    xml.tagStr('matterPropertyTypeMailTemplate', '0');
    xml.tagStr('matterPropertyTypeImBoxTpl', '0');
    xml.tagStr('matterPropertyTypeRule', '1');
    xml.tagStr('alignType', '2');
    xml.tagStr('searchRangeType', '1');
    xml.tagStr('commaSeparatedFlag', '0');
    xml.tagStr('calendarFlag', '0');
    xml.tagNull('note');
    xml.tagStr('updateCount', '1');
    xml.closeObj();
  }

  xml.closeArray('value');
  xml.close('matter_property');
}

// --- rule ---

function buildRule(xml, ctx) {
  const { locales, rule } = ctx;
  const ruleId = rule.fullId || `rule_${rule.id}`;
  xml.open('rule', { id: ruleId });
  xml.openArray('value');

  // conditions 配列（新形式）と property/operator/value（旧形式）の両方に対応。
  // no は条件ごとに1つだけ生成し、全ロケールで共有する。
  const rawConditions = rule.conditions
    ? rule.conditions
    : [{ property: rule.property, operator: rule.operator, value: rule.value }];
  const detailEntries = rawConditions.map(c => ({
    no: randomId(15),
    ruleId,
    compareRuleId: OPERATOR_CODES[c.operator] || '9',
    compareVariable: c.property,
    conditionValue: c.value,
    conditionValueType: '0',
  }));

  // unionCondition: "and" → 0, "or" → 1, 省略時は 0
  const unionConditionValue = rule.unionCondition === 'or' ? '1' : '0';

  for (const locale of locales) {
    xml.openObj();
    xml.tagStr('ruleId', ruleId);
    xml.tagStr('localeId', locale);
    xml.tagStr('ruleName', rule.names[locale]);
    xml.tagNull('note');
    xml.tagStr('ruleUnionCondition', unionConditionValue);
    xml.tagStr('updateCount', '1');

    xml.openArray('ruleDetailModel');
    for (const entry of detailEntries) {
      xml.openObj();
      xml.tagStr('no', entry.no);
      xml.tagStr('ruleId', entry.ruleId);
      xml.tagStr('compareRuleId', entry.compareRuleId);
      xml.tagStr('compareVariable', entry.compareVariable);
      xml.tagStr('conditionValue', entry.conditionValue);
      xml.tagStr('conditionValueType', entry.conditionValueType);
      xml.closeObj();
    }
    xml.closeArray('ruleDetailModel');

    xml.closeObj();
  }

  xml.closeArray('value');
  xml.close('rule');
}

// --- 出力 ---

function findWorkspaceRoot(start) {
  let dir = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

function toUtf16BEBuffer(str) {
  const le = Buffer.from(str, 'utf16le');
  const be = Buffer.allocUnsafe(le.length);
  for (let i = 0; i < le.length; i += 2) {
    be[i] = le[i + 1];
    be[i + 1] = le[i];
  }
  return be;
}

function writeUtf16le(xmlStr, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  let converted;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'imwf-'));
  const tmpFile = path.join(tmp, 'temp.xml');
  fs.writeFileSync(tmpFile, xmlStr, 'utf8');
  try {
    try {
      converted = execFileSync('iconv', ['-f', 'UTF-8', '-t', 'UTF-16BE', tmpFile]);
    } catch (_) {
      converted = toUtf16BEBuffer(xmlStr);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  const bom = Buffer.from([0xFE, 0xFF]);
  fs.writeFileSync(outPath, Buffer.concat([bom, converted]));
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: build-workflow.js <spec.json> [--out output.xml]');
    process.exit(1);
  }
  const specPath = args[0];
  let outPath = null;
  const oi = args.indexOf('--out');
  if (oi >= 0) outPath = args[oi + 1];

  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

  if (!outPath) {
    const wsRoot = findWorkspaceRoot(process.cwd());
    outPath = path.join(wsRoot, DEFAULT_OUT_DIR, `im_workflow-${spec.workflowName}-import.xml`);
  }

  const xmlStr = buildSpec(spec);
  writeUtf16le(xmlStr, outPath);
  console.error(`wrote ${outPath}`);
}

if (require.main === module) main();

module.exports = { buildSpec };
