#!/usr/bin/env node
/*
 * validate-workflow.js — IM-Workflow インポート XML のバリデータ
 *
 * 使い方:
 *   node validate-workflow.js <import.xml>
 *
 * UTF-16（LE / BE、BOM 付き）を UTF-8 に変換してから XML 構造を検証する。
 * 依存: Node.js 標準ライブラリのみ。
 *
 * 検証項目:
 *   [enc]  BOM 付き UTF-16（LE / BE）であること
 *   [top]  XML 宣言 + <data> ルート
 *   [sec]  contents / route / flow セクションの存在
 *   [loc]  3 ロケール（en / ja / zh_CN）の展開
 *   [ver]  2 バージョン（blank + active）の存在
 *   [node] ルートノードの接続整合（prev/next 双方向）
 *   [plg]  プラグイン二重登録（ノード内 + ルートレベル）
 *   [flow] フロー定義ノードに Start/End が含まれていないこと
 *   [len]  フィールド長制限（ID 系フィールド 13 項目は 20 文字以内）
 *   [rule] 分岐ルールの参照整合（rule ↔ matter_property ↔ branch details）
 *   [id]   ID の相互参照整合（contents ↔ route ↔ flow）
 */

const fs = require('fs');
const { execFileSync } = require('child_process');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

class ValidationResult {
  constructor() { this.errors = []; this.warnings = []; }
  error(ctx, msg) { this.errors.push(`[${ctx}] ${msg}`); }
  warn(ctx, msg) { this.warnings.push(`[${ctx}] ${msg}`); }
  get ok() { return this.errors.length === 0; }
  dump() {
    for (const e of this.errors) console.error('ERROR:', e);
    for (const w of this.warnings) console.error('WARN:', w);
    if (this.ok) console.error(`PASS (${this.warnings.length} warning(s))`);
    else console.error(`FAIL (${this.errors.length} error(s), ${this.warnings.length} warning(s))`);
  }
}

// 簡易 XML パーサー（タグ名とテキスト内容を抽出）
function extractTags(xml, tagName) {
  const re = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'g');
  const results = [];
  let m;
  while ((m = re.exec(xml)) !== null) results.push(m[1]);
  return results;
}

function extractTagValue(xml, tagName) {
  const re = new RegExp(`<${tagName}[^>]*>([^<]*)<\\/${tagName}>`);
  const m = xml.match(re);
  return m ? m[1] : null;
}

function countTag(xml, tagName) {
  const re = new RegExp(`<${tagName}[\\s>]`, 'g');
  return (xml.match(re) || []).length;
}

function validate(xmlStr, r) {
  // [top] XML 宣言 + data ルート
  if (!xmlStr.includes('<?xml')) r.error('top', 'XML 宣言がない');
  if (!xmlStr.includes('<data>')) r.error('top', '<data> ルートがない');

  // [sec] セクション存在
  const hasContents = xmlStr.includes('<contents ');
  const hasRoute = xmlStr.includes('<route ');
  const hasFlow = xmlStr.includes('<flow ');
  if (!hasContents) r.error('sec', '<contents> セクションがない');
  if (!hasRoute) r.error('sec', '<route> セクションがない');
  if (!hasFlow) r.error('sec', '<flow> セクションがない');
  if (!hasContents || !hasRoute || !hasFlow) return;

  // [loc] 3 ロケール
  const locales = ['en', 'ja', 'zh_CN'];
  for (const loc of locales) {
    const count = countTag(xmlStr, `localeId[^>]*>${loc}<`);
    if (count === 0) {
      // より緩やかな検索
      if (!xmlStr.includes(`>${loc}<`)) r.error('loc', `ロケール "${loc}" が見つからない`);
    }
  }

  // [ver] 2 バージョン
  const vStatus9 = (xmlStr.match(/>9<\/versionStatus>/g) || []).length;
  const vStatus1 = (xmlStr.match(/>1<\/versionStatus>/g) || []).length;
  if (vStatus9 === 0) r.error('ver', 'blank バージョン（versionStatus=9）がない');
  if (vStatus1 === 0) r.error('ver', 'active バージョン（versionStatus=1）がない');
  // 各セクション × 3 ロケール = 最低 9 個ずつ
  if (vStatus9 < 9) r.warn('ver', `blank バージョン数 ${vStatus9} < 期待値 9（3セクション×3ロケール）`);
  if (vStatus1 < 9) r.warn('ver', `active バージョン数 ${vStatus1} < 期待値 9`);

  // [node] ルートノード接続整合
  const nodeIds = [];
  const nodeIdRe = /<nodeId type="string">([^<]+)<\/nodeId>/g;
  let nm;
  while ((nm = nodeIdRe.exec(xmlStr)) !== null) {
    if (!nodeIds.includes(nm[1])) nodeIds.push(nm[1]);
  }

  // previousNodeIds / nextNodeIds の値を抽出
  const prevRefs = new Set();
  const nextRefs = new Set();
  const prevBlocks = extractTags(xmlStr, 'previousNodeIds');
  const nextBlocks = extractTags(xmlStr, 'nextNodeIds');
  for (const b of prevBlocks) {
    const re = /<value type="string">([^<]+)<\/value>/g;
    let m2;
    while ((m2 = re.exec(b)) !== null) prevRefs.add(m2[1]);
  }
  for (const b of nextBlocks) {
    const re = /<value type="string">([^<]+)<\/value>/g;
    let m2;
    while ((m2 = re.exec(b)) !== null) nextRefs.add(m2[1]);
  }
  // 参照先が存在するか
  for (const [refs, label] of [[prevRefs, 'previousNodeIds'], [nextRefs, 'nextNodeIds']]) {
    for (const ref of refs) {
      if (!nodeIds.includes(ref)) r.error('node', `${label} に存在しないノード "${ref}" が参照されている`);
    }
  }

  // [plg] プラグイン二重登録: routePluginId がルートレベルにもノードレベルにもあるか
  const routePluginIds = [];
  const rpRe = /<routePluginId type="string">([^<]+)<\/routePluginId>/g;
  let rp;
  while ((rp = rpRe.exec(xmlStr)) !== null) {
    routePluginIds.push(rp[1]);
  }
  // 各 pluginId は最低 2 回出現するはず（ノード内 + ルートレベル）× ロケール数
  const rpCounts = {};
  for (const id of routePluginIds) rpCounts[id] = (rpCounts[id] || 0) + 1;
  for (const [id, count] of Object.entries(rpCounts)) {
    if (count < 6) r.warn('plg', `routePluginId "${id}" の出現回数 ${count} < 6（ノード+ルート × 3ロケール）`);
  }

  // [flow] フローノードに Start/End が含まれていないことを確認
  // flow セクション内の nodeType を確認
  const flowSection = xmlStr.substring(xmlStr.indexOf('<flow '));
  const flowNodeTypes = [];
  const fntRe = /<nodeType type="string">(\d+)<\/nodeType>/g;
  let fnt;
  while ((fnt = fntRe.exec(flowSection)) !== null) flowNodeTypes.push(fnt[1]);
  if (flowNodeTypes.includes('0')) r.warn('flow', 'フロー定義に Start ノード（nodeType=0）が含まれている');
  if (flowNodeTypes.includes('1')) r.warn('flow', 'フロー定義に End ノード（nodeType=1）が含まれている');

  // [flow] 確認ノード（nodeType=6）のフロー定義は lumpProcessFlag=0 であること（flow 定義実測）
  const flowNodeEntries = flowSection.split(/<value type="object">/);
  for (const entry of flowNodeEntries) {
    const ntMatch = entry.match(/<nodeType type="string">(\d+)<\/nodeType>/);
    if (!ntMatch || ntMatch[1] !== '6') continue;
    if (!/<lumpProcessFlag[^>]*>/.test(entry)) continue;  // フローノードブロックのみ対象
    const lp = entry.match(/<lumpProcessFlag type="string">([^<]*)<\/lumpProcessFlag>/);
    if (lp && lp[1] !== '0') {
      const nid = (entry.match(/<nodeId type="string">([^<]+)<\/nodeId>/) || [])[1] || '(unknown)';
      r.warn('flow', `確認ノード "${nid}" のフロー定義 lumpProcessFlag が ${lp[1]}（確認ノードは 0 が標準）`);
    }
  }

  // [confirm] 確認ノード（route 定義 nodeTyp_Confirm）の整合チェック
  //   ノード内に権限プラグイン（nodeType=6 を持つ入れ子 value object）があるため、
  //   <value type="object"> 単純分割では nodeType が上書きされる。よって
  //   nodeName → nodeType → traceId の構造で各ノード本体を直接抽出する。
  //   - 終端枝であること（nextNodeIds が空）
  //   - 接続元（previousNodeIds）が存在すること
  //   - 拡張ポイントが確認用（...node.confirm）であること
  const confirmRe = /<nodeId type="string">([^<]+)<\/nodeId>\s*<nodeName type="string">[^<]*<\/nodeName>\s*<nodeType type="string">nodeTyp_Confirm<\/nodeType>([\s\S]*?)<traceId/g;
  const seenConfirm = new Set();
  let cmf;
  while ((cmf = confirmRe.exec(xmlStr)) !== null) {
    const nid = cmf[1];
    if (seenConfirm.has(nid)) continue;  // ロケール重複は 1 回に集約
    seenConfirm.add(nid);
    const body = cmf[2];
    const nextBlock = body.match(/<nextNodeIds[^>]*?(?:\/>|>[\s\S]*?<\/nextNodeIds>)/);
    const nexts = nextBlock ? [...nextBlock[0].matchAll(/<value type="string">([^<]+)<\/value>/g)].map(x => x[1]) : [];
    if (nexts.length > 0) {
      r.error('confirm', `確認ノード "${nid}" は終端枝であるべきだが nextNodeIds が空でない（${nexts.join(', ')}）`);
    }
    const prevBlock = body.match(/<previousNodeIds[^>]*?(?:\/>|>[\s\S]*?<\/previousNodeIds>)/);
    const prevs = prevBlock ? [...prevBlock[0].matchAll(/<value type="string">([^<]+)<\/value>/g)].map(x => x[1]) : [];
    if (prevs.length === 0) {
      r.error('confirm', `確認ノード "${nid}" に接続元（previousNodeIds）がない。承認ノード等から紐付ける必要がある`);
    }
    const epm = body.match(/<extensionPointId type="string">([^<]+)<\/extensionPointId>/);
    if (epm && !epm[1].includes('.node.confirm')) {
      r.error('confirm', `確認ノード "${nid}" の拡張ポイントが確認用（...node.confirm）でない: "${epm[1]}"`);
    }
  }

  // [id] ID 相互参照
  const contentsIdMatch = xmlStr.match(/<contentsId type="string">([^<]+)<\/contentsId>/);
  const routeIdMatch = xmlStr.match(/<routeId type="string">([^<]+)<\/routeId>/);
  const flowIdMatch = xmlStr.match(/<flowId type="string">([^<]+)<\/flowId>/);
  if (contentsIdMatch && routeIdMatch && flowIdMatch) {
    // flow の contentsId がcontents の id と一致するか
    const flowContentsRef = extractTags(flowSection, 'contentsId').find(v => v.trim().length > 0);
    // 簡易チェック: flow 内に contents の ID が含まれるか
    if (contentsIdMatch[1] && !flowSection.includes(contentsIdMatch[1])) {
      r.error('id', 'flow セクションに contentsId の参照がない');
    }
  }

  // [len] フィールド長チェック（IM-Workflow DB は VARCHAR(20)）
  const LEN_MAX = 20;
  function checkLen(tag, re) {
    let m;
    while ((m = re.exec(xmlStr)) !== null) {
      if (m[1].length > LEN_MAX) r.error('len', `${tag} "${m[1]}" が ${LEN_MAX} 文字を超えています（${m[1].length} 文字）`);
    }
  }
  checkLen('contentsId',        /<contentsId type="string">([^<]+)<\/contentsId>/g);
  checkLen('contentsVersionId', /<contentsVersionId type="string">([^<]+)<\/contentsVersionId>/g);
  checkLen('contentsPluginId',  /<contentsPluginId type="string">([^<]+)<\/contentsPluginId>/g);
  checkLen('contentsRuleId',    /<contentsRuleId type="string">([^<]+)<\/contentsRuleId>/g);
  checkLen('routeId',           /<routeId type="string">([^<]+)<\/routeId>/g);
  checkLen('routeVersionId',    /<routeVersionId type="string">([^<]+)<\/routeVersionId>/g);
  checkLen('routePluginId',     /<routePluginId type="string">([^<]+)<\/routePluginId>/g);
  checkLen('flowId',            /<flowId type="string">([^<]+)<\/flowId>/g);
  checkLen('flowVersionId',     /<flowVersionId type="string">([^<]+)<\/flowVersionId>/g);
  checkLen('nodeId',            /<nodeId type="string">([^<]+)<\/nodeId>/g);
  checkLen('pagePathId',        /<pagePathId type="string">([^<]+)<\/pagePathId>/g);
  checkLen('ruleId',            /<ruleId type="string">([^<]+)<\/ruleId>/g);
  checkLen('cooperationId',     /<cooperationId type="string">([^<]+)<\/cooperationId>/g);

  // [rule] ルール参照整合
  const hasMatterProp = xmlStr.includes('<matter_property ');
  const hasRule = xmlStr.includes('<rule ');
  const hasBranchStart = xmlStr.includes('nodeTyp_Branch_Start');
  if (hasBranchStart && !hasRule) r.warn('rule', 'Branch_Start があるが rule セクションがない');
  if (hasRule && !hasMatterProp) r.warn('rule', 'rule があるが matter_property がない');

  // [rule] ruleDetailModel の no がロケール間で共有されているか検証
  if (hasRule) {
    const ruleBlocks = xmlStr.match(/<rule id="[^"]*">[\s\S]*?<\/rule>/g) || [];
    for (const block of ruleBlocks) {
      const ruleIdMatch = block.match(/<rule id="([^"]*)"/);
      const ruleLabel = ruleIdMatch ? ruleIdMatch[1] : '(unknown)';
      // ロケールごとの ruleDetailModel を取得
      const detailModels = block.match(/<ruleDetailModel[^>]*>[\s\S]*?<\/ruleDetailModel>/g) || [];
      if (detailModels.length > 0) {
        const noSets = detailModels.map(dm =>
          [...dm.matchAll(/<no type="string">(.*?)<\/no>/g)].map(m => m[1]).join(',')
        );
        const unique = new Set(noSets);
        if (unique.size > 1) {
          r.error('rule', `${ruleLabel}: ruleDetailModel の no がロケール間で異なっている（no 共有違反）`);
        }
      }
    }
  }

  // [page] 必須 pageType の存在チェック
  // - 0 (申請): 必須
  // - 4 (処理/承認): 必須
  // - その他 (1=一時保存, 2=申請タスク, 3=再申請, 5=確認, 6=処理詳細, 7=参照詳細) は
  //   spec.json で意図的に省略可能（screens.xxx: false）のため警告しない
  const pageTypes = new Set();
  const ptRe = /<pageType type="string">(\d)<\/pageType>/g;
  let pt;
  while ((pt = ptRe.exec(xmlStr)) !== null) pageTypes.add(pt[1]);
  const mandatoryPageTypes = [
    { type: '0', name: '申請' },
    { type: '4', name: '処理' },
  ];
  for (const mp of mandatoryPageTypes) {
    if (!pageTypes.has(mp.type)) {
      r.warn('page', `必須 pageType ${mp.type} (${mp.name}) が定義されていない`);
    }
  }

  // [param] 動的プラグインの parameter で会社コード・組織セットコードが二重になっていないか
  const pluginBlocks = xmlStr.match(/<pluginId type="string">[^<]*<\/pluginId>[\s\S]*?<parameter type="string">[^<]*<\/parameter>/g) || [];
  for (const block of pluginBlocks) {
    const pluginIdMatch = block.match(/<pluginId type="string">([^<]*)<\/pluginId>/);
    const paramMatch = block.match(/<parameter type="string">([^<]*)<\/parameter>/);
    if (!pluginIdMatch || !paramMatch) continue;
    const pluginId = pluginIdMatch[1];
    const param = paramMatch[1];
    // 動的プラグイン（apply_user_* / before_user_*）の _and_post / _and_role パターン
    const isDynamic = /\.(apply_user_|before_user_)/.test(pluginId);
    if (!isDynamic || !param.startsWith('|')) continue;
    // | の後ろの ^ 区切りセグメント数を数える（正常: company^orgSet^code = 3セグメント）
    const segments = param.substring(1).split('^');
    if (segments.length > 3) {
      r.error('param', `動的プラグインの parameter でコードが二重になっている可能性: pluginId="${pluginId}", parameter="${param}"（^ 区切り ${segments.length} セグメント、期待値は 3）`);
    }
  }

  // [ext] 拡張ポイントIDとノード種別の整合（approve vs approve.static）
  // routeXmlFile 内のノード定義ブロックを個別に抽出して検証する
  const routeXmlMatch = xmlStr.match(/<routeXmlFile[\s\S]*?<\/routeXmlFile>/);
  if (routeXmlMatch) {
    const routeXml = routeXmlMatch[0];
    // 各ノードブロック（<nodes> 内の <value type="object"> 単位）を抽出
    const nodesBlock = routeXml.match(/<nodes type="array">([\s\S]*?)<\/nodes>/);
    if (nodesBlock) {
      // nodeId → nodeType のマップ
      const nodeTypeMap = {};
      // nodeId → [nextNodeId] のマップ
      const nextNodeMap = {};
      // nodeId → extensionPointId のマップ（approve 系のみ）
      const nodeExtPointMap = {};

      // 各ノードブロックを <value type="object"> で分割
      const nodeEntries = nodesBlock[1].split(/<value type="object">/);
      for (const entry of nodeEntries) {
        if (!entry.trim()) continue;
        const nidMatch = entry.match(/<nodeId type="string">([^<]+)<\/nodeId>/);
        const ntMatch = entry.match(/<nodeType type="string">([^<]+)<\/nodeType>/);
        if (!nidMatch || !ntMatch) continue;
        const nid = nidMatch[1];
        nodeTypeMap[nid] = ntMatch[1];

        // nextNodeIds を抽出
        const nextBlock = entry.match(/<nextNodeIds[\s\S]*?<\/nextNodeIds>/);
        if (nextBlock) {
          const nextIds = [];
          const nvRe = /<value type="string">([^<]+)<\/value>/g;
          let nv;
          while ((nv = nvRe.exec(nextBlock[0])) !== null) nextIds.push(nv[1]);
          nextNodeMap[nid] = nextIds;
        }

        // ノード内 plugins の extensionPointId を抽出
        const pluginsBlock = entry.match(/<plugins type="array">([\s\S]*?)<\/plugins>/);
        if (pluginsBlock) {
          const epMatch = pluginsBlock[1].match(/<extensionPointId type="string">([^<]+)<\/extensionPointId>/);
          if (epMatch && epMatch[1].includes('.approve')) {
            nodeExtPointMap[nid] = epMatch[1];
          }
        }
      }

      // prevNodeMap を構築
      const prevNodeMap = {};
      for (const [fromId, nextIds] of Object.entries(nextNodeMap)) {
        for (const toId of nextIds) {
          if (!prevNodeMap[toId]) prevNodeMap[toId] = [];
          if (!prevNodeMap[toId].includes(fromId)) prevNodeMap[toId].push(fromId);
        }
      }

      const systemNodeTypes = new Set([
        'nodeTyp_Start', 'nodeTyp_End', 'nodeTyp_System',
        'nodeTyp_Branch_Start', 'nodeTyp_Branch_End',
        'nodeTyp_Sync_Start', 'nodeTyp_Sync_End'
      ]);

      for (const [nid, extPoint] of Object.entries(nodeExtPointMap)) {
        const isStatic = extPoint.includes('.approve.static');
        const prevNodes = prevNodeMap[nid] || [];
        for (const pn of prevNodes) {
          const pnType = nodeTypeMap[pn];
          if (!pnType) continue;
          const prevIsSystem = systemNodeTypes.has(pnType);
          if (prevIsSystem && !isStatic) {
            r.error('ext', `ノード "${nid}" の直前ノード "${pn}" はシステムノード（${pnType}）だが、拡張ポイントが approve（動的）になっている。approve.static を使用してください`);
          }
          if (!prevIsSystem && isStatic) {
            r.warn('ext', `ノード "${nid}" の直前ノード "${pn}" は人間ノード（${pnType}）だが、拡張ポイントが approve.static（静的）になっている。approve（動的）を推奨します`);
          }
        }
      }
    }
  }

  // [enc] nodeName が全ロケールで同一か
  const nodeNameRe = /<nodeName type="string">([^<]+)<\/nodeName>/g;
  const nodeNames = [];
  let nn;
  while ((nn = nodeNameRe.exec(xmlStr)) !== null) nodeNames.push(nn[1]);
  // 3ロケール分あるので、ユニーク数 × 3 = 全数 のはず
  const uniqueNames = [...new Set(nodeNames)];
  if (nodeNames.length !== uniqueNames.length * 3 && nodeNames.length > 0) {
    r.warn('enc', `nodeName がロケール間で不一致の可能性（total=${nodeNames.length}, unique=${uniqueNames.length}）`);
  }
}

function fromUtf16Buffer(buf, encoding) {
  const data = buf.slice(2); // BOM をスキップ
  if (encoding === 'UTF-16BE') {
    const le = Buffer.allocUnsafe(data.length);
    for (let i = 0; i < data.length; i += 2) {
      le[i] = data[i + 1];
      le[i + 1] = data[i];
    }
    return le.toString('utf16le');
  }
  return data.toString('utf16le');
}

// XSD 検証（xmllint-wasm）
async function validateXsd(xmlStr, filePath, r) {
  const XSD_PATH = path.resolve(__dirname, '..', 'reference', 'im_workflow-import.xsd');
  if (!fs.existsSync(XSD_PATH)) {
    r.warn('xsd', `XSD ファイルが見つからない: ${XSD_PATH}`);
    return;
  }
  // xmllint-wasm は ESM のため、子プロセスで .mjs スクリプトを実行
  const xmlUtf8 = xmlStr.replace(/^\uFEFF/, '').replace(/encoding="UTF-16"/i, 'encoding="UTF-8"');
  const xsd = fs.readFileSync(XSD_PATH, 'utf8');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'xsd-val-'));
  const tmpXml = path.join(tmp, 'input.xml');
  const tmpXsd = path.join(tmp, 'schema.xsd');
  const tmpScript = path.join(tmp, 'validate.mjs');
  fs.writeFileSync(tmpXml, xmlUtf8, 'utf8');
  fs.writeFileSync(tmpXsd, xsd, 'utf8');
  const xmllintUrl = pathToFileURL(require.resolve('xmllint-wasm/index-node.js')).href;
  fs.writeFileSync(tmpScript, `
import { readFileSync } from 'node:fs';
import { validateXML } from '${xmllintUrl}';
const xml = readFileSync("${tmpXml.replace(/\\/g, '/')}", 'utf8');
const xsd = readFileSync("${tmpXsd.replace(/\\/g, '/')}", 'utf8');
const result = await validateXML({ xml: [{ fileName: 'input.xml', contents: xml }], schema: [xsd] });
if (result.valid) { console.log('XSD_OK'); }
else { console.log('XSD_NG'); for (const e of (result.errors||[]).slice(0,10)) console.log('XSD_ERR:' + (e.message||e.rawMessage||e)); }
`, 'utf8');
  try {
    const output = execFileSync('node', [tmpScript], { encoding: 'utf8', timeout: 30000 });
    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.startsWith('XSD_ERR:')) r.error('xsd', line.substring(8));
    }
    if (!lines.some(l => l === 'XSD_OK') && !lines.some(l => l.startsWith('XSD_ERR:'))) {
      r.warn('xsd', `XSD 検証の出力が不正: ${output.trim().substring(0, 200)}`);
    }
  } catch (e) {
    r.warn('xsd', `XSD 検証をスキップ: ${e?.message?.substring(0, 200) || e}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: validate-workflow.js <import.xml>');
    process.exit(1);
  }

  const filePath = args[0];
  const r = new ValidationResult();
  let xmlStr = '';

  // [enc] BOM + UTF-16 チェック
  const raw = fs.readFileSync(filePath);
  let encoding = null;
  if (raw[0] === 0xFE && raw[1] === 0xFF) {
    encoding = 'UTF-16BE';
  } else if (raw[0] === 0xFF && raw[1] === 0xFE) {
    encoding = 'UTF-16LE';
  }
  if (encoding) {
    try {
      const converted = execFileSync('iconv', ['-f', encoding, '-t', 'UTF-8', filePath]);
      xmlStr = converted.toString('utf8');
    } catch (_) {
      xmlStr = fromUtf16Buffer(raw, encoding);
    }
    validate(xmlStr, r);
  } else {
    r.warn('enc', 'UTF-16 BOM が検出されない。UTF-8 として検証する');
    xmlStr = fs.readFileSync(filePath, 'utf8');
    validate(xmlStr, r);
  }

  // [xsd] XSD 検証
  if (xmlStr) await validateXsd(xmlStr, filePath, r);

  r.dump();
  process.exit(r.ok ? 0 : 1);
}

if (require.main === module) main();

module.exports = { validate, ValidationResult };
