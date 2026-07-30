#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * build-sample-setup-import.js
 *
 * spec.json を読み込み、intra-mart サンプルデータセットアップ Importer の
 * 各種 XML / SQL / JS を一括生成する。
 *
 * Usage:
 *   node build-sample-setup-import.js <spec.json> [--out <baseDir>] [--dry-run] [--force]
 *
 * 出力先（デフォルト）:
 *   <baseDir>/src/main/conf/products/import/sample/import-<artifactId>-config.xml
 *   <baseDir>/src/main/storage/system/products/import/sample/<key>/...
 *   <baseDir>/src/main/jssp/src/<key>/initialize/<key>_import.js
 *
 * <artifactId> はセットアップ XML の設定ファイル名。
 * サンプルデータセットアップの仕様で pom.xml の artifactId と一致させる必要がある。
 * 解決順序:
 *   1. spec.json の "artifactId" フィールド
 *   2. プロジェクトルートの pom.xml の <artifactId>（<parent> 内は除外）
 *   3. module.xml の <id> のドット区切り末尾セグメント（例: "mypackage.hoge" → "hoge"）
 *   4. spec.key（フォールバック）
 *
 * 既存ファイルへの上書き保護:
 *   出力先に既存ファイルがある場合はエラーで停止する。サンプルデータは常に最新状態を
 *   維持する運用のため、更新時は --force で意図的に上書きする。
 *
 * --out 未指定時は現在の作業ディレクトリを baseDir とみなす。
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// メニューグループ ID から intra-mart の認可リソース ID（SHA-256 ハッシュ）を計算する
// intra-mart は内部で base = "im-menu-group://menugroups/<id>" を SHA-256 ハッシュ化している
function computeMenuGroupHash(menuGroupId) {
  const base = 'im-menu-group://menugroups/' + menuGroupId;
  return crypto.createHash('sha256').update(base).digest('hex');
}

// ポートレット CD から、表示権限（type="im-portal-portlet"）の認可リソース ID を計算する
// intra-mart は内部で base = "im-portal-portlet://<portletCd>" を SHA-256 ハッシュ化している
function computePortletViewHash(portletCd) {
  return crypto.createHash('sha256').update('im-portal-portlet://' + portletCd).digest('hex');
}

// ポートレット CD から、編集権限（type="im-portal-portlet-editmode"）の認可リソース ID を計算する
// intra-mart は内部で base = "im-portal-portlet-editmode://<portletCd>" を SHA-256 ハッシュ化している
function computePortletEditHash(portletCd) {
  return crypto.createHash('sha256').update('im-portal-portlet-editmode://' + portletCd).digest('hex');
}

const LOCALES = ['ja', 'en', 'zh_CN'];

// 既存ファイルへの上書きを許可するか（--force で true にセットされる）
let FORCE = false;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { spec: null, out: process.cwd(), dryRun: false, force: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') {
      args.out = argv[++i];
    } else if (a === '--dry-run') {
      args.dryRun = true;
    } else if (a === '--force') {
      args.force = true;
    } else if (a === '-h' || a === '--help') {
      printHelp();
      process.exit(0);
    } else if (!args.spec) {
      args.spec = a;
    } else {
      console.error('Unknown argument: ' + a);
      process.exit(2);
    }
  }
  if (!args.spec) {
    printHelp();
    process.exit(2);
  }
  return args;
}

function printHelp() {
  console.log('Usage: node build-sample-setup-import.js <spec.json> [--out <baseDir>] [--dry-run] [--force]');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectProjectArtifactId(baseDir) {
  // 1. pom.xml の <artifactId>（<parent> 内は除外）
  const pomFile = path.join(baseDir, 'pom.xml');
  if (fs.existsSync(pomFile)) {
    const content = fs.readFileSync(pomFile, 'utf8');
    const target = content.replace(/<parent>[\s\S]*?<\/parent>/g, '');
    const m = target.match(/<artifactId>\s*([^<\s]+)\s*<\/artifactId>/);
    if (m) return { artifactId: m[1], source: 'pom.xml' };
  }
  // 2. module.xml の <id>（ドット区切りの末尾セグメントを採用）
  const moduleCandidates = [
    path.join(baseDir, 'module.xml'),
    path.join(baseDir, 'src/main/jssp/module.xml'),
  ];
  for (const file of moduleCandidates) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const m = content.match(/<id>\s*([^<\s]+)\s*<\/id>/);
      if (m) {
        const fullId = m[1];
        const lastSegment = fullId.split('.').pop();   // 'mypackage.hoge' → 'hoge'
        const relPath = path.relative(baseDir, file).replace(/\\/g, '/');
        return { artifactId: lastSegment, source: relPath + ' <id> last segment (' + fullId + ')' };
      }
    }
  }
  return null;
}

function loadSpec(specPath) {
  const raw = fs.readFileSync(specPath, 'utf8');
  let spec;
  try {
    spec = JSON.parse(raw);
  } catch (e) {
    throw new Error('Failed to parse spec.json: ' + e.message);
  }
  validateSpec(spec);
  return spec;
}

function validateSpec(spec) {
  const required = ['key', 'shortName', 'displayNames'];
  for (const k of required) {
    if (!spec[k]) throw new Error('spec.' + k + ' is required');
  }
  for (const loc of LOCALES) {
    if (!spec.displayNames[loc]) {
      throw new Error('spec.displayNames.' + loc + ' is required');
    }
  }

  // サンプルデータセットアップはスキーマバージョン管理の対象外で、設定ファイルは
  // 1 モジュールにつき最大 1 つしか作られない。テナント環境セットアップ用の
  // spec.json を誤って流用すると意図しない資材ができるため、明示的に弾く。
  if (spec.configNumber !== undefined) {
    throw new Error(
      'spec.configNumber はサンプルデータセットアップでは使用できません。\n'
      + '  設定ファイルは 1 モジュールにつき最大 1 つ（import-<artifactId>-config.xml）です。\n'
      + '  テナント環境セットアップ用の spec.json を流用していないか確認してください。'
    );
  }
  if (spec.version !== undefined) {
    throw new Error(
      'spec.version はサンプルデータセットアップでは使用できません。\n'
      + '  資材の配置にバージョンディレクトリを設けません（常に最新状態のみを管理します）。'
    );
  }

  // ロール ID は intra-mart の制約で 20 文字以内
  for (const role of spec.roles || []) {
    if (role.id && role.id.length > 20) {
      throw new Error('spec.roles["' + role.id + '"].id は 20 文字以内である必要があります（現在 ' + role.id.length + ' 文字）');
    }
  }

  const resGroups = new Set((spec.authzResourceGroups || []).map(g => g.id));
  for (const r of spec.authzResources || []) {
    if (r.parentGroup && !resGroups.has(r.parentGroup)
        && r.parentGroup !== 'http-services') {
      console.warn('[warn] authzResources["' + r.id + '"].parentGroup="' + r.parentGroup + '" not declared in authzResourceGroups');
    }
  }
  const resIds = new Set((spec.authzResources || []).map(r => r.id));
  for (const p of spec.authzPolicies || []) {
    if (p.type === 'service' && !resIds.has(p.resource)) {
      console.warn('[warn] authzPolicies.resource="' + p.resource + '" not declared in authzResources');
    }
    // IM-LogicDesigner ルーティング向けリソースは logicImport の拡張インポートが走った時点で
    // 初めて登録される。サンプルデータセットアップは設定ファイルを分割できないため、
    // <tenant-master> の認可ポリシーは必ず <extends-import> より先に処理される。
    if (p.type === 'im-logic-rest') {
      console.warn(
        '[warn] authzPolicies に type="im-logic-rest" が含まれています。\n'
        + '        サンプルデータセットアップは設定ファイルを分割できないため、認可ポリシーは\n'
        + '        リソース未登録のまま投入されエラーになります（後続処理は継続）。テナント環境セットアップ側\n'
        + '        （jssp-tenant-setup-generator の configNumber 分割）で投入してください。\n'
        + '        詳細は reference/logic-import.md を参照。'
      );
    }
  }
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// SQL 文字列リテラル用エスケープ（シングルクォートを二重化）
function escapeSql(s) {
  return String(s).replace(/'/g, "''");
}

// ポートレット関連テーブル（b_m_portlet_*）の rec_date に埋め込む値。
// rec_date は timestamp 型ではなく varchar 型で、"yyyy/MM/dd|HH:mm:ss" 固定フォーマット。
// ビルド実行時刻を使用する。
function formatDmlDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return date.getFullYear() + '/' + pad(date.getMonth() + 1) + '/' + pad(date.getDate())
    + '|' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
}

function writeFileSafe(dryRun, outPath, content) {
  if (dryRun) {
    const marker = fs.existsSync(outPath) ? ' [OVERWRITE]' : '';
    console.log('[dry-run] would write: ' + outPath + ' (' + content.length + ' chars)' + marker);
    return;
  }
  if (!FORCE && fs.existsSync(outPath)) {
    throw new Error(
      '既存ファイルが見つかりました: ' + outPath + '\n' +
      '  サンプルデータセットアップの資材は常に最新状態のみを管理します。\n' +
      '  既存資材を更新する場合は --force フラグを指定してください。'
    );
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
  console.log('  wrote: ' + outPath);
}

function copyFileSafe(dryRun, sourceAbs, destAbs) {
  if (!fs.existsSync(sourceAbs)) {
    throw new Error('コピー元ファイルが見つかりません: ' + sourceAbs);
  }
  if (dryRun) {
    const marker = fs.existsSync(destAbs) ? ' [OVERWRITE]' : '';
    console.log('[dry-run] would copy: ' + sourceAbs + ' -> ' + destAbs + marker);
    return;
  }
  if (!FORCE && fs.existsSync(destAbs)) {
    throw new Error(
      '既存ファイルが見つかりました: ' + destAbs + '\n' +
      '  サンプルデータセットアップの資材は常に最新状態のみを管理します。\n' +
      '  既存資材を更新する場合は --force フラグを指定してください。'
    );
  }
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  fs.copyFileSync(sourceAbs, destAbs);
  console.log('  copied: ' + destAbs);
}

// ---------------------------------------------------------------------------
// XML generators
// ---------------------------------------------------------------------------

function buildRoleBase(spec) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">',
  ];
  for (const role of spec.roles || []) {
    lines.push('  <role-data name="' + escapeXml(role.name) + '" id="' + escapeXml(role.id) + '">');
    if (role.category) {
      lines.push('    <category>' + escapeXml(role.category) + '</category>');
    }
    lines.push('  </role-data>');
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

function buildRoleLocale(spec, locale) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://intra-mart.co.jp/system/admin/role/role-data">',
  ];
  for (const role of spec.roles || []) {
    const dn = role.displayNames && role.displayNames[locale];
    if (!dn) continue;
    lines.push('  <role-data name="' + escapeXml(role.name) + '" id="' + escapeXml(role.id) + '">');
    lines.push('    <display-names>');
    lines.push('      <display-name locale="' + locale + '">' + escapeXml(dn) + '</display-name>');
    lines.push('    </display-names>');
    lines.push('  </role-data>');
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

function buildAuthzResourceGroupBase(spec) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://www.intra-mart.jp/authz/imex/resource-group">',
  ];
  const groups = spec.authzResourceGroups || [];
  for (let i = 0; i < groups.length; i++) {
    if (i > 0) lines.push('');
    const g = groups[i];
    lines.push('  <authz-resource-group id="' + escapeXml(g.id) + '">');
    if (g.parentGroup) {
      lines.push('    <parent-group id="' + escapeXml(g.parentGroup) + '" />');
    }
    lines.push('  </authz-resource-group>');
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

function buildAuthzResourceGroupLocale(spec, locale) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://www.intra-mart.jp/authz/imex/resource-group">',
  ];
  const groups = (spec.authzResourceGroups || []).filter(g => g.displayNames && g.displayNames[locale]);
  for (let i = 0; i < groups.length; i++) {
    if (i > 0) lines.push('');
    const g = groups[i];
    const dn = g.displayNames[locale];
    lines.push('  <authz-resource-group id="' + escapeXml(g.id) + '">');
    lines.push('    <display-name>');
    lines.push('      <name locale="' + locale + '">' + escapeXml(dn) + '</name>');
    lines.push('    </display-name>');
    lines.push('  </authz-resource-group>');
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

// ポートレット由来の authz-resource / authz-policy エントリに付与するコメント。
// view / editmode それぞれのエントリの直前に1行ずつ添える。
const PORTLET_AUTHZ_COMMENT = { view: 'ポートレット設定', editmode: 'ポートレット編集モード設定' };
const EDIT_MODE_SUFFIX = { ja: '（編集モード）', en: ' (Edit Mode)', zh_CN: '（编辑模式）' };

// spec.portletImport.portlets から、ポートレットの表示権限（および編集権限）に対応する
// 認可リソースの定義を組み立てる。authz-policy 側は id を持たない生のハッシュ値を resource
// 属性に直接書く仕様のため、ここで生成する authz-resource の id もポリシーと同じ手順
// （computePortletViewHash / computePortletEditHash）で計算したハッシュ値にする（人間可読な
// id にすると authz-policy の resource 属性と一致せず、管理画面上でリソースとポリシーが
// 紐付かない）。editmode 用のリソースも editable の値に関わらず常に生成する
// （認可ポリシー側と同じ方針。詳細は buildAuthzPolicy 内のコメントを参照）。
function getPortletAuthzResourceEntries(spec) {
  const entries = [];
  for (const p of (spec.portletImport || {}).portlets || []) {
    if (!p || !p.portletCd) continue;
    const baseDisplayNames = (p.titles && p.titles.application) || {};
    entries.push({
      kind: 'view',
      id: computePortletViewHash(p.portletCd),
      uri: 'im-portal-portlet://' + p.portletCd,
      parentGroup: 'im-portal-portlet',
      displayNames: baseDisplayNames,
    });
    const editDisplayNames = {};
    for (const loc of LOCALES) {
      if (baseDisplayNames[loc]) {
        editDisplayNames[loc] = baseDisplayNames[loc] + (EDIT_MODE_SUFFIX[loc] || '');
      }
    }
    entries.push({
      kind: 'editmode',
      id: computePortletEditHash(p.portletCd),
      uri: 'im-portal-portlet-editmode://' + p.portletCd,
      parentGroup: 'im-portal-portlet-editmode',
      displayNames: editDisplayNames,
    });
  }
  return entries;
}

function buildAuthzResourceBase(spec) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://www.intra-mart.jp/authz/imex/resource">',
  ];
  const resources = spec.authzResources || [];
  const portletResources = getPortletAuthzResourceEntries(spec);
  for (let i = 0; i < resources.length; i++) {
    if (i > 0) lines.push('');
    const r = resources[i];
    lines.push('  <authz-resource id="' + escapeXml(r.id) + '" uri="' + escapeXml(r.uri) + '">');
    if (r.parentGroup) {
      lines.push('    <parent-group id="' + escapeXml(r.parentGroup) + '" />');
    }
    lines.push('  </authz-resource>');
  }
  if (portletResources.length > 0) {
    if (resources.length > 0) lines.push('');
    for (let i = 0; i < portletResources.length; i++) {
      if (i > 0) lines.push('');
      const r = portletResources[i];
      lines.push('  <!-- ' + PORTLET_AUTHZ_COMMENT[r.kind] + ' -->');
      lines.push('  <authz-resource id="' + escapeXml(r.id) + '" uri="' + escapeXml(r.uri) + '">');
      lines.push('    <parent-group id="' + escapeXml(r.parentGroup) + '" />');
      lines.push('  </authz-resource>');
    }
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

function buildAuthzResourceLocale(spec, locale) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://www.intra-mart.jp/authz/imex/resource">',
  ];
  const resources = (spec.authzResources || []).filter(r => r.displayNames && r.displayNames[locale]);
  const portletResources = getPortletAuthzResourceEntries(spec).filter(r => r.displayNames && r.displayNames[locale]);
  for (let i = 0; i < resources.length; i++) {
    if (i > 0) lines.push('');
    const r = resources[i];
    const dn = r.displayNames[locale];
    lines.push('  <authz-resource uri="' + escapeXml(r.uri) + '">');
    lines.push('    <display-name>');
    lines.push('      <name locale="' + locale + '">' + escapeXml(dn) + '</name>');
    lines.push('    </display-name>');
    lines.push('  </authz-resource>');
  }
  if (portletResources.length > 0) {
    if (resources.length > 0) lines.push('');
    for (let i = 0; i < portletResources.length; i++) {
      if (i > 0) lines.push('');
      const r = portletResources[i];
      const dn = r.displayNames[locale];
      lines.push('  <authz-resource uri="' + escapeXml(r.uri) + '">');
      lines.push('    <display-name>');
      lines.push('      <name locale="' + locale + '">' + escapeXml(dn) + '</name>');
      lines.push('    </display-name>');
      lines.push('  </authz-resource>');
    }
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

function resolveMenuGroupHashResource(resource, type, spec) {
  if (type !== 'im-menu-group') return resource;
  // "REPLACE_WITH_MENU_GROUP_HASH"               → spec.menuGroups[0].id を使用
  // "REPLACE_WITH_MENU_GROUP_HASH:<menuGroupId>" → 明示指定の id を使用
  const prefix = 'REPLACE_WITH_MENU_GROUP_HASH';
  if (resource === prefix) {
    const menuGroups = spec.menuGroups || [];
    if (menuGroups.length === 0) {
      throw new Error('authz-policy で ' + prefix + ' が指定されていますが、spec.menuGroups が空です');
    }
    return computeMenuGroupHash(menuGroups[0].id);
  }
  if (resource.startsWith(prefix + ':')) {
    const targetId = resource.substring((prefix + ':').length);
    return computeMenuGroupHash(targetId);
  }
  return resource;
}

// テナント管理者は暗黙のデフォルトとして全 service リソースに許可する（プロジェクト規約）。
// 他のロール／ユーザは spec.authzPolicies に明示された場合のみ付与される。
const DEFAULT_TENANT_MANAGER_SUBJECT = 'S(b_m_role:tenant_manager)';

function buildAuthzPolicy(spec) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://www.intra-mart.jp/authz/imex/policy">',
  ];
  // (resource, type, subject) で重複を検出するためのキー集合
  const emitted = new Set();
  const keyOf = function (resource, type, subject) {
    return type + ' ' + resource + ' ' + subject;
  };
  for (const p of spec.authzPolicies || []) {
    const effect = p.effect || 'PERMIT';
    const resource = resolveMenuGroupHashResource(p.resource, p.type, spec);
    lines.push(
      '  <authz-policy resource="' + escapeXml(resource) + '"'
        + ' type="' + escapeXml(p.type) + '"'
        + ' action="' + escapeXml(p.action) + '"'
        + ' subject="' + escapeXml(p.subject) + '">'
        + escapeXml(effect)
        + '</authz-policy>'
    );
    emitted.add(keyOf(resource, p.type, p.subject));
  }
  // 既定ポリシー: テナント管理者を全 service リソース（authzResources）に PERMIT で自動付与。
  // 既に同一 (resource, service, tenant_manager) のポリシーが明示されている場合は二重出力しない。
  const defaultResources = [];
  for (const r of spec.authzResources || []) {
    if (!r || !r.id) continue;
    if (emitted.has(keyOf(r.id, 'service', DEFAULT_TENANT_MANAGER_SUBJECT))) continue;
    defaultResources.push(r.id);
    emitted.add(keyOf(r.id, 'service', DEFAULT_TENANT_MANAGER_SUBJECT));
  }
  if (defaultResources.length > 0) {
    lines.push('  <!-- 既定ポリシー: テナント管理者は全 service リソースに許可（自動付与） -->');
    for (const id of defaultResources) {
      lines.push(
        '  <authz-policy resource="' + escapeXml(id) + '"'
          + ' type="service" action="execute"'
          + ' subject="' + DEFAULT_TENANT_MANAGER_SUBJECT + '">PERMIT</authz-policy>'
      );
    }
  }
  // 既定ポリシー: テナント管理者を全メニューグループ（menuGroups）に PERMIT で自動付与。
  // resource はメニューグループ ID のハッシュ値、type は im-menu-group、action は read。
  // 既に同一 (hash, im-menu-group, tenant_manager) のポリシーが明示されている場合は二重出力しない。
  const defaultMenuHashes = [];
  for (const mg of spec.menuGroups || []) {
    if (!mg || !mg.id) continue;
    const hash = computeMenuGroupHash(mg.id);
    if (emitted.has(keyOf(hash, 'im-menu-group', DEFAULT_TENANT_MANAGER_SUBJECT))) continue;
    defaultMenuHashes.push(hash);
    emitted.add(keyOf(hash, 'im-menu-group', DEFAULT_TENANT_MANAGER_SUBJECT));
  }
  if (defaultMenuHashes.length > 0) {
    lines.push('  <!-- 既定ポリシー: テナント管理者は全メニューグループに許可（自動付与） -->');
    for (const hash of defaultMenuHashes) {
      lines.push(
        '  <authz-policy resource="' + escapeXml(hash) + '"'
          + ' type="im-menu-group" action="read"'
          + ' subject="' + DEFAULT_TENANT_MANAGER_SUBJECT + '">PERMIT</authz-policy>'
      );
    }
  }
  // 既定ポリシー: テナント管理者をポートレット（portletImport.portlets）の表示・編集権限に PERMIT で自動付与。
  // resource はポートレット CD のハッシュ値（im-portal-portlet / im-portal-portlet-editmode）。
  // editable は b_m_portlet_mode.user_flag（実際に編集操作自体が許可されるか）のみを左右し、
  // 認可ポリシー・認可リソースの生成有無には影響しない。im-portal-portlet-editmode は
  // editable の値に関わらず常に生成する（editable=false でも「権限としては持つが、
  // ポートレット自体が表示専用モードのため編集操作はブロックされる」状態にしておき、
  // 後から editable=true に切り替えても認可資材の再生成が不要になるようにするため）。
  // 既に同一 (hash, type, tenant_manager) のポリシーが明示されている場合は二重出力しない。
  const defaultPortletPolicies = [];
  for (const p of (spec.portletImport || {}).portlets || []) {
    if (!p || !p.portletCd) continue;
    const viewHash = computePortletViewHash(p.portletCd);
    if (!emitted.has(keyOf(viewHash, 'im-portal-portlet', DEFAULT_TENANT_MANAGER_SUBJECT))) {
      defaultPortletPolicies.push({ resource: viewHash, type: 'im-portal-portlet', kind: 'view' });
      emitted.add(keyOf(viewHash, 'im-portal-portlet', DEFAULT_TENANT_MANAGER_SUBJECT));
    }
    const editHash = computePortletEditHash(p.portletCd);
    if (!emitted.has(keyOf(editHash, 'im-portal-portlet-editmode', DEFAULT_TENANT_MANAGER_SUBJECT))) {
      defaultPortletPolicies.push({ resource: editHash, type: 'im-portal-portlet-editmode', kind: 'editmode' });
      emitted.add(keyOf(editHash, 'im-portal-portlet-editmode', DEFAULT_TENANT_MANAGER_SUBJECT));
    }
  }
  for (const pp of defaultPortletPolicies) {
    lines.push('  <!-- ' + PORTLET_AUTHZ_COMMENT[pp.kind] + ' -->');
    lines.push(
      '  <authz-policy resource="' + escapeXml(pp.resource) + '"'
        + ' type="' + pp.type + '" action="execute"'
        + ' subject="' + DEFAULT_TENANT_MANAGER_SUBJECT + '">PERMIT</authz-policy>'
    );
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

function buildAuthzSubjectGroupBase(spec) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<subject-groups xmlns="http://www.intra-mart.jp/authz/imex/subject-group">',
  ];
  const subjectGroups = spec.authzSubjectGroups || [];
  for (let i = 0; i < subjectGroups.length; i++) {
    if (i > 0) lines.push('');
    const g = subjectGroups[i];
    lines.push('  <authz-subject-group sort-key="' + String(g.sortKey) + '">');
    lines.push('    <expression>' + escapeXml(g.expression) + '</expression>');
    lines.push('  </authz-subject-group>');
  }
  lines.push('</subject-groups>', '');
  return lines.join('\n');
}

function buildAuthzSubjectGroupLocale(spec, locale) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<subject-groups xmlns="http://www.intra-mart.jp/authz/imex/subject-group">',
  ];
  const subjectGroups = (spec.authzSubjectGroups || []).filter(g => g.displayNames && g.displayNames[locale]);
  for (let i = 0; i < subjectGroups.length; i++) {
    if (i > 0) lines.push('');
    const g = subjectGroups[i];
    const dn = g.displayNames[locale];
    lines.push('  <authz-subject-group sort-key="' + String(g.sortKey) + '">');
    lines.push('    <display-name>');
    lines.push('      <name locale="' + locale + '">' + escapeXml(dn) + '</name>');
    lines.push('    </display-name>');
    lines.push('    <expression>' + escapeXml(g.expression) + '</expression>');
    lines.push('  </authz-subject-group>');
  }
  lines.push('</subject-groups>', '');
  return lines.join('\n');
}

function menuItemAttrs(item) {
  const sortNumber = item.sortNumber != null ? String(item.sortNumber) : '10';
  const type = item.type || ((item.items && item.items.length > 0) ? 'folder' : 'item');
  let attrs = 'menu-id="' + escapeXml(item.id) + '"'
    + ' sort-number="' + escapeXml(sortNumber) + '"'
    + ' type="' + escapeXml(type) + '"';
  if (type === 'item') attrs += ' url="' + escapeXml(item.url || '') + '"';
  attrs += ' image-path="' + escapeXml(item.imagePath || '') + '"';
  attrs += ' method="' + escapeXml(item.method || 'get') + '"';
  attrs += ' use-iframe="' + escapeXml(String(item.useIframe == null ? false : item.useIframe)) + '"';
  attrs += ' use-popup="' + escapeXml(String(item.usePopup == null ? false : item.usePopup)) + '"';
  return attrs;
}

function appendMenuItemBase(lines, item, indent) {
  const children = item.items || [];
  if (children.length === 0) {
    lines.push(indent + '<menu-item ' + menuItemAttrs(item) + '></menu-item>');
  } else {
    lines.push(indent + '<menu-item ' + menuItemAttrs(item) + '>');
    for (const child of children) {
      appendMenuItemBase(lines, child, indent + '  ');
    }
    lines.push(indent + '</menu-item>');
  }
}

function appendMenuItemLocale(lines, item, locale, indent) {
  const dn = item.displayNames && item.displayNames[locale];
  const children = item.items || [];
  if (children.length === 0) {
    if (dn) {
      lines.push(indent + '<menu-item ' + menuItemAttrs(item) + '>');
      lines.push(indent + '  <display-names>');
      lines.push(indent + '    <display-name locale="' + locale + '">' + escapeXml(dn) + '</display-name>');
      lines.push(indent + '  </display-names>');
      lines.push(indent + '</menu-item>');
    } else {
      lines.push(indent + '<menu-item ' + menuItemAttrs(item) + '></menu-item>');
    }
  } else {
    lines.push(indent + '<menu-item ' + menuItemAttrs(item) + '>');
    if (dn) {
      lines.push(indent + '  <display-names>');
      lines.push(indent + '    <display-name locale="' + locale + '">' + escapeXml(dn) + '</display-name>');
      lines.push(indent + '  </display-names>');
      lines.push('');
    }
    for (let i = 0; i < children.length; i++) {
      if (i > 0) lines.push('');
      appendMenuItemLocale(lines, children[i], locale, indent + '  ');
    }
    lines.push(indent + '</menu-item>');
  }
}

function buildMenuGroupBase(spec) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">',
  ];
  for (const m of spec.menuGroups || []) {
    const category = m.category || 'im_sitemap_pc';
    lines.push('  <menu-group-data id="' + escapeXml(m.id) + '">');
    lines.push('    <category id="' + escapeXml(category) + '"></category>');
    lines.push('');
    appendMenuItemBase(lines, m, '    ');
    lines.push('  </menu-group-data>');
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

function buildMenuGroupLocale(spec, locale) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://intra-mart.co.jp/im_menu/menu-group-data">',
  ];
  for (const m of spec.menuGroups || []) {
    const category = m.category || 'im_sitemap_pc';
    lines.push('  <menu-group-data id="' + escapeXml(m.id) + '">');
    lines.push('    <category id="' + escapeXml(category) + '"></category>');
    lines.push('');
    appendMenuItemLocale(lines, m, locale, '    ');
    lines.push('  </menu-group-data>');
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

function buildTriggerBlock(jobnetId, trigger, autoIndex) {
  const triggerId = trigger.id || (jobnetId + '_trigger_' + autoIndex);
  const block = [
    '  <im-job-scheduler-data>',
    '    <trigger id="' + escapeXml(triggerId) + '">',
    '      <jobnet-id>' + escapeXml(jobnetId) + '</jobnet-id>',
  ];
  // description はオプション。空/未指定なら出力しない（XSD バリデーション対策）
  if (trigger.description) {
    block.push('      <description>' + escapeXml(trigger.description) + '</description>');
  }
  block.push('      <enable>' + (trigger.enable ? 'true' : 'false') + '</enable>');
  if (!trigger.startDate) {
    throw new Error('trigger.startDate is required for jobnet "' + jobnetId + '"');
  }
  block.push('      <start-date>' + escapeXml(trigger.startDate) + '</start-date>');

  // 3 種類のトリガー種別（repeat / datetime / business-day）。いずれか 1 つを指定
  if (trigger.repeat) {
    block.push('      <repeat>');
    if (trigger.repeat.count != null) {
      block.push('        <count>' + String(trigger.repeat.count) + '</count>');
    }
    if (trigger.repeat.interval != null) {
      block.push('        <interval>' + String(trigger.repeat.interval) + '</interval>');
    }
    block.push('      </repeat>');
  } else if (trigger.datetime) {
    const dt = trigger.datetime;
    block.push('      <datetime>');
    if (dt.timeZone) block.push('        <time-zone>' + escapeXml(dt.timeZone) + '</time-zone>');
    for (const v of dt.months || []) block.push('        <months>' + String(v) + '</months>');
    for (const v of dt.daysOfMonth || []) block.push('        <days-of-month>' + String(v) + '</days-of-month>');
    for (const v of dt.daysOfWeek || []) block.push('        <days-of-week>' + String(v) + '</days-of-week>');
    for (const v of dt.hours || []) block.push('        <hours>' + String(v) + '</hours>');
    for (const v of dt.minutes || []) block.push('        <minutes>' + String(v) + '</minutes>');
    block.push('      </datetime>');
  } else if (trigger.businessDay) {
    const bd = trigger.businessDay;
    block.push('      <business-day>');
    if (bd.calendarId) block.push('        <calendar-id>' + escapeXml(bd.calendarId) + '</calendar-id>');
    if (bd.timeZone) block.push('        <time-zone>' + escapeXml(bd.timeZone) + '</time-zone>');
    for (const v of bd.hours || []) block.push('        <hours>' + String(v) + '</hours>');
    for (const v of bd.minutes || []) block.push('        <minutes>' + String(v) + '</minutes>');
    block.push('      </business-day>');
  }

  block.push('    </trigger>');
  block.push('  </im-job-scheduler-data>');
  return block;
}

function buildJobSchedulerBase(spec) {
  const js = spec.jobScheduler;
  if (!js) return null;
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://www.intra-mart.jp/job-scheduler/data">',
  ];
  const blocks = [];

  if (js.jobCategory) {
    blocks.push([
      '  <im-job-scheduler-data>',
      '    <job-category id="' + escapeXml(js.jobCategory.id) + '">',
      '    </job-category>',
      '  </im-job-scheduler-data>',
    ]);
  }
  for (const j of js.jobs || []) {
    const block = [
      '  <im-job-scheduler-data>',
      '    <job-detail id="' + escapeXml(j.id) + '">',
    ];
    if (js.jobCategory) {
      block.push('      <category-id>' + escapeXml(js.jobCategory.id) + '</category-id>');
    }
    block.push('      <job-type>' + escapeXml(j.type || 'JAVA') + '</job-type>');
    block.push('      <job-path>' + escapeXml(j.path) + '</job-path>');
    block.push('    </job-detail>');
    block.push('  </im-job-scheduler-data>');
    blocks.push(block);
  }
  if (js.jobnetCategory) {
    blocks.push([
      '  <im-job-scheduler-data>',
      '    <jobnet-category id="' + escapeXml(js.jobnetCategory.id) + '">',
      '    </jobnet-category>',
      '  </im-job-scheduler-data>',
    ]);
  }
  for (const n of js.jobnets || []) {
    const block = [
      '  <im-job-scheduler-data>',
      '    <jobnet id="' + escapeXml(n.id) + '">',
    ];
    if (js.jobnetCategory) {
      block.push('      <category-id>' + escapeXml(js.jobnetCategory.id) + '</category-id>');
    }
    if (n.disallowConcurrent) {
      block.push('      <disallowConcurrent>true</disallowConcurrent>');
    }
    if (n.jobs && n.jobs.length > 0) {
      block.push('      <serialize>');
      for (const jid of n.jobs) {
        block.push('        <job-id>' + escapeXml(jid) + '</job-id>');
      }
      block.push('      </serialize>');
    }
    block.push('    </jobnet>');
    block.push('  </im-job-scheduler-data>');
    blocks.push(block);

    // トリガー: 各 jobnet の直後に <im-job-scheduler-data><trigger>...</trigger></im-job-scheduler-data> として並べる
    let triggerIndex = 0;
    for (const trigger of n.triggers || []) {
      triggerIndex++;
      blocks.push(buildTriggerBlock(n.id, trigger, triggerIndex));
    }
  }

  for (let i = 0; i < blocks.length; i++) {
    if (i > 0) lines.push('');
    for (const ln of blocks[i]) lines.push(ln);
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

function buildJobSchedulerLocale(spec, locale) {
  const js = spec.jobScheduler;
  if (!js) return null;
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<root xmlns="http://www.intra-mart.jp/job-scheduler/data">',
  ];
  const blocks = [];

  function buildBlock(tagName, id, displayNames, descriptions) {
    const dn = displayNames && displayNames[locale];
    if (!dn) return null;
    const lines = [
      '  <im-job-scheduler-data>',
      '    <' + tagName + ' id="' + escapeXml(id) + '">',
      '      <localize locale="' + locale + '">',
      '        <name>' + escapeXml(dn) + '</name>',
    ];
    // description はオプション。指定された場合のみ <description> を出力する
    // （空の <description></description> は XSD バリデーションエラーになるため出さない）
    const desc = descriptions && descriptions[locale];
    if (desc) {
      lines.push('        <description>' + escapeXml(desc) + '</description>');
    }
    lines.push('      </localize>');
    lines.push('    </' + tagName + '>');
    lines.push('  </im-job-scheduler-data>');
    return lines;
  }
  function pushBlock(block) {
    if (block) blocks.push(block);
  }

  if (js.jobCategory) pushBlock(buildBlock('job-category', js.jobCategory.id, js.jobCategory.displayNames, js.jobCategory.descriptions));
  for (const j of js.jobs || []) pushBlock(buildBlock('job-detail', j.id, j.displayNames, j.descriptions));
  if (js.jobnetCategory) pushBlock(buildBlock('jobnet-category', js.jobnetCategory.id, js.jobnetCategory.displayNames, js.jobnetCategory.descriptions));
  for (const n of js.jobnets || []) pushBlock(buildBlock('jobnet', n.id, n.displayNames, n.descriptions));

  for (let i = 0; i < blocks.length; i++) {
    if (i > 0) lines.push('');
    for (const ln of blocks[i]) lines.push(ln);
  }
  lines.push('</root>', '');
  return lines.join('\n');
}

function buildExtendsImportJs(spec) {
  const lines = [
    '/**',
    ' * ' + spec.key + ' 拡張インポート処理',
    ' *',
    ' * テナントマスタ（database / authz / menu / job 等）が投入された直後に呼ばれる。',
    ' * サンプルデータセットアップは毎回実行されるため、再実行しても同じ結果になるよう実装すること。',
    ' * 実装内容は reference/extends-import.md を参照。',
    ' */',
    'function doImport(tenantId) {',
    '',
    '}',
    '',
  ];
  return lines.join('\n');
}

function buildWorkflowImportJs(spec, workflowFiles) {
  // workflowFiles: storage/system ルートからの相対パスの配列
  //   例: ['products/import/sample/<key>/<file>.xml', ...]
  const key = spec.key;
  const sourceFilesBlock = workflowFiles.map(function (p) {
    return '      \'' + p + '\',';
  }).join('\n');

  const lines = [
    '/**',
    ' * ' + key + ' IM-Workflow 拡張インポート処理',
    ' *',
    ' * サンプルデータセットアップ時に IM-Workflow のインポートデータ（コンテンツ / ルート /',
    ' * フロー / 案件プロパティ / ルール）を取り込む。元データはビルド時に',
    ' * storage/public/im_workflow/ から storage/system/products/import/sample/' + key + '/',
    ' * 配下にコピーされ、ここからは SystemStorage 経由で読み込む。',
    ' *',
    ' * 実装内容は reference/workflow-import.md を参照。',
    ' */',
    'function doImport(tenantId) {',
    '  let logger = Logger.getLogger(\'' + key + '.workflow_import\');',
    '  logger.info(\'[' + key + '] workflow import start. tenantId={}\', tenantId);',
    '',
    '  try {',
    '    let sourceFiles = [',
    sourceFilesBlock,
    '    ];',
    '    let localeId = resolveTenantLocaleId(tenantId, logger);',
    '    let executor = new DataImportExecutor();',
    '    ensureTemporaryDirectory();',
    '    for (let i = 0; i < sourceFiles.length; i++) {',
    '      importWorkflowFile(executor, sourceFiles[i], localeId, tenantId, logger);',
    '    }',
    '    logger.info(\'[' + key + '] workflow import completed.\');',
    '  } catch (e) {',
    '    logger.error(\'[' + key + '] workflow import failed. {}\', e.message);',
    '    throw e;',
    '  }',
    '}',
    '',
    'function resolveTenantLocaleId(tenantId, logger) {',
    '  let fallbackLocaleId = \'ja\';',
    '  let tenantInfoResult = new TenantInfoManager().getTenantInfo(tenantId);',
    '  if (tenantInfoResult.error) {',
    '    logger.warn(\'[' + key + '] getTenantInfo error: {} (fallback localeId={})\',',
    '      tenantInfoResult.errorMessage, fallbackLocaleId);',
    '    return fallbackLocaleId;',
    '  }',
    '  if (!tenantInfoResult.data || !tenantInfoResult.data.locale) {',
    '    logger.warn(\'[' + key + '] tenant info has no locale (fallback localeId={})\', fallbackLocaleId);',
    '    return fallbackLocaleId;',
    '  }',
    '  logger.info(\'[' + key + '] tenant default localeId={}\', tenantInfoResult.data.locale);',
    '  return tenantInfoResult.data.locale;',
    '}',
    '',
    'function importWorkflowFile(executor, sourcePath, localeId, tenantId, logger) {',
    '  logger.info(\'[' + key + '] import file: {}\', sourcePath);',
    '  let sourceStorage = new SystemStorage(sourcePath);',
    '  if (!sourceStorage.exists()) {',
    '    throw new Error(\'workflow xml not found: \' + sourcePath);',
    '  }',
    '  let xml = sourceStorage.read(\'UTF-16\');',
    '',
    '  // 依存関係の順序で取り込む（参照される側 → 参照する側）',
    '  //   案件プロパティ・ルール → コンテンツ → ルート → フロー',
    '  let sections = [\'matter_property\', \'rule\', \'contents\', \'route\', \'flow\'];',
    '  for (let i = 0; i < sections.length; i++) {',
    '    importSingleSection(executor, xml, sections[i], localeId, tenantId, logger);',
    '  }',
    '}',
    '',
    'function importSingleSection(executor, xml, dataType, localeId, tenantId, logger) {',
    '  // <data> 直下に同名タグ（例: <rule> ×複数）が並ぶケースがあるため、',
    '  // 全出現ブロックを配列で取得し、1 ブロックずつ importData する。',
    '  let bodies = extractTopLevelSections(xml, dataType);',
    '  if (bodies.length === 0) {',
    '    logger.info(\'[' + key + '] section not present, skipped: {}\', dataType);',
    '    return;',
    '  }',
    '',
    '  for (let i = 0; i < bodies.length; i++) {',
    '    importSectionBody(executor, bodies[i], dataType, i, localeId, tenantId, logger);',
    '  }',
    '}',
    '',
    'function importSectionBody(executor, body, dataType, index, localeId, tenantId, logger) {',
    '  let temporaryPath = \'tmp/' + key + '_\' + tenantId + \'_\' + dataType + \'_\' + index + \'.xml\';',
    '  let temporaryStorage = new PublicStorage(temporaryPath);',
    '  let content = \'<?xml version="1.0" encoding="UTF-16"?>\\n\' + body;',
    '  if (!temporaryStorage.write(content, \'UTF-16\')) {',
    '    throw new Error(\'failed to write temp xml: \' + temporaryPath);',
    '  }',
    '',
    '  try {',
    '    executeImport(executor, temporaryStorage, temporaryPath, dataType, localeId, logger);',
    '  } finally {',
    '    temporaryStorage.remove();',
    '  }',
    '}',
    '',
    'function executeImport(executor, temporaryStorage, temporaryPath, dataType, localeId, logger) {',
    '  let reader = temporaryStorage.openAsBinary();',
    '  try {',
    '    let importResult = executor.importData(',
    '      \'jp.co.intra_mart.system.workflow.util.WorkflowXmlImporter\',',
    '      reader,',
    '      {',
    '        dataType: dataType,',
    '        localeId: localeId,',
    '        fileName: temporaryPath',
    '      }',
    '    );',
    '    if (importResult.error) {',
    '      throw new Error(\'importData error: \' + dataType + \' / \' + importResult.errorMessage);',
    '    }',
    '    let resultData = importResult.data;',
    '    if (!resultData.success) {',
    '      throw new Error(\'workflow import failed: \' + dataType',
    '        + \' total=\' + resultData.totalCount + \' fault=\' + resultData.faultCount',
    '        + \' msg=\' + resultData.message);',
    '    }',
    '    logger.info(\'[' + key + '] {} imported. total={}\', dataType, resultData.totalCount);',
    '  } finally {',
    '    reader.close();',
    '  }',
    '}',
    '',
    '// 一時 XML を書き出すためのディレクトリ（PublicStorage の tmp/）を保証する。',
    '// 既に存在する場合は何もしない。',
    'function ensureTemporaryDirectory() {',
    '  let temporaryDir = new PublicStorage(\'tmp\');',
    '  if (temporaryDir.exists()) {',
    '    return;',
    '  }',
    '  if (!temporaryDir.makeDirectories()) {',
    '    throw new Error(\'failed to create temporary directory: tmp\');',
    '  }',
    '}',
    '',
    '// <data> 直下の <tag ...>...</tag> ブロックを全て抽出する。',
    '// 入力は <data> 直下にインデント2スペースで <contents>/<route>/<flow>/<rule> 等が並ぶ前提。',
    '// ネストされた同名タグに誤マッチしないよう、行頭2スペースのものだけを拾う。',
    '// <rule> のように同名タグが複数並ぶセクションでも取りこぼさないよう、',
    '// 1件見つけるごとに検索位置を進めながらループし、配列で返す。',
    'function extractTopLevelSections(xml, tag) {',
    '  let startMarker = \'\\n  <\' + tag;',
    '  let endMarker = \'\\n  </\' + tag + \'>\';',
    '  let bodies = [];',
    '  let searchFrom = 0;',
    '',
    '  while (true) {',
    '    let startIndex = xml.indexOf(startMarker, searchFrom);',
    '    if (startIndex < 0) {',
    '      break;',
    '    }',
    '    startIndex += 1;',
    '',
    '    let endIndex = xml.indexOf(endMarker, startIndex);',
    '    if (endIndex < 0) {',
    '      break;',
    '    }',
    '    endIndex += endMarker.length;',
    '',
    '    // 左端のインデント2スペースを取り除いてルート要素として整える',
    '    bodies.push(xml.substring(startIndex, endIndex).replace(/^  /gm, \'\'));',
    '    searchFrom = endIndex;',
    '  }',
    '',
    '  return bodies;',
    '}',
    '',
  ];
  return lines.join('\n');
}

function buildLogicImportJs(spec, logicFiles) {
  // logicFiles: storage/system ルートからの相対パスの配列
  //   例: ['products/import/sample/<key>/<file>.zip', ...]
  const key = spec.key;
  const sourceFilesBlock = logicFiles.map(function (p) {
    return '      \'' + p + '\',';
  }).join('\n');

  const lines = [
    '/**',
    ' * ' + key + ' IM-LogicDesigner 拡張インポート処理',
    ' *',
    ' * サンプルデータセットアップ時に IM-LogicDesigner のインポートデータ（ZIP）を取り込む。',
    ' * 元データはビルド時に storage/public/im_logic/ から',
    ' * storage/system/products/import/sample/' + key + '/ 配下にコピーされ、',
    ' * SystemStorage 経由で読み込んで Java の LogicFlowImporter に渡す。',
    ' *',
    ' * 実装内容は reference/logic-import.md を参照。',
    ' */',
    'function doImport(tenantId) {',
    '  let logger = Logger.getLogger(\'' + key + '.logic_import\');',
    '  logger.info(\'[' + key + '] logic import start. tenantId={}\', tenantId);',
    '',
    '  try {',
    '    let sourceFiles = [',
    sourceFilesBlock,
    '    ];',
    '    let importer = Packages.jp.co.intra_mart.foundation.logic.LogicServiceProvider',
    '      .getInstance()',
    '      .getLogicFlowImporter();',
    '    for (let i = 0; i < sourceFiles.length; i++) {',
    '      importLogicFile(importer, sourceFiles[i], logger);',
    '    }',
    '    logger.info(\'[' + key + '] logic import completed.\');',
    '  } catch (e) {',
    '    logger.error(\'[' + key + '] logic import failed. {}\', e.message);',
    '    throw e;',
    '  }',
    '}',
    '',
    'function importLogicFile(importer, sourcePath, logger) {',
    '  logger.info(\'[' + key + '] import file: {}\', sourcePath);',
    '  let sourceStorage = new SystemStorage(sourcePath);',
    '  if (!sourceStorage.exists()) {',
    '    throw new Error(\'logic data not found: \' + sourcePath);',
    '  }',
    '  // ストレージが別サーバの可能性があり物理パス経由ではアクセスできないため、',
    '  // SystemStorage からバイナリで全データを取得し、メモリ上で InputStream を組み立てる。',
    '  let byteArray = readAllBytes(sourceStorage);',
    '  let inputStream = new Packages.java.io.ByteArrayInputStream(byteArray);',
    '  try {',
    '    // 第 2 引数 true: 既存フローを上書きする。',
    '    importer.importData(inputStream, true);',
    '  } finally {',
    '    inputStream.close();',
    '  }',
    '}',
    '',
    '// SystemStorage の全バイトを読み出し、Java の byte[] にして返す。',
    '// ByteReader#eachBytes で chunk ごとに ByteArrayOutputStream へ追記する。',
    'function readAllBytes(sourceStorage) {',
    '  let output = new Packages.java.io.ByteArrayOutputStream();',
    '  let reader = sourceStorage.openAsBinary();',
    '  try {',
    '    reader.eachBytes(function (chunk, index, bytesRead) {',
    '      for (let i = 0; i < bytesRead; i++) {',
    '        output.write(chunk[i]);',
    '      }',
    '    }, 8192);',
    '  } finally {',
    '    reader.close();',
    '  }',
    '  return output.toByteArray();',
    '}',
    '',
  ];
  return lines.join('\n');
}

const DB_DIALECTS = ['postgre', 'oracle', 'sqlserver'];

// DDL 対象テーブル（spec.database.tables[].ddl === true）を抽出する。
// サンプルデータセットアップでしか使わないテーブルのみが対象。既存テーブル
// （テナント環境セットアップの DDL で作成済み）に INSERT するだけのテーブルは
// ddl を指定せず、DML のスケルトンにだけ現れる。
function ddlTables(spec) {
  if (!spec.database) return [];
  return (spec.database.tables || []).filter(t => t.ddl === true);
}

// 方言ごとの存在チェック構文のヒント。サンプルデータセットアップは毎回実行されるため、
// 素の CREATE TABLE は 2 回目以降エラーになる。詳細は reference/database-sql.md を参照。
const DDL_EXISTS_GUARD_HINT = {
  postgre: [
    '--   PostgreSQL は CREATE TABLE IF NOT EXISTS をサポートする。',
  ],
  sqlserver: [
    '--   SQL Server は IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = \'<table>\') で',
    '--   存在チェックできる。',
  ],
  oracle: [
    '--   Oracle の CREATE TABLE IF NOT EXISTS は 23ai 以降のみ。それ以前は PL/SQL ブロックが',
    '--   必要だが、Importer により SQL がセミコロンで分割されるため利用できない。',
    '--   また、分割された SQL の実行で失敗した場合は、後続の SQL は実行せずに次のファイル処理を開始する。',
    '--   そのため、DROP TABLE ...;CREATE TABLE ... のように DROP → CREATE を同一ファイル内に記述できない。',
    '--   23ai 未満は素の CREATE TABLE のみを書き（DROP を混ぜない）、または拡張インポートで作成する。',
    '--   詳細は reference/database-sql.md「Oracle 23ai 未満は存在チェックを書けない」を参照。',
  ],
};

function buildDdlSql(spec, dialect) {
  const tables = ddlTables(spec);
  if (tables.length === 0) return null;
  const lines = [
    '-- =============================================================================',
    '--   ' + spec.key + ' DDL (' + dialect + ')',
    '-- =============================================================================',
    '--   出力タイミング: サンプルデータセットアップ時（DML の前）',
    '--   ファイル名サフィックス _' + dialect + ' は intra-mart Importer の自動判定で',
    '--   接続先 DB 種別に合致した 1 ファイルだけが読み込まれる',
    '--',
    '--   ここで作成するのはサンプルデータセットアップでしか使わないテーブルのみ。',
    '--   モジュール本体のテーブルはテナント環境セットアップ側で作成すること。',
    '--',
    '--   サンプルデータセットアップは毎回実行されるため、素の CREATE TABLE は',
    '--   2 回目以降エラーになる。存在チェックを入れること。',
  ];
  for (const hint of DDL_EXISTS_GUARD_HINT[dialect] || []) {
    lines.push(hint);
  }
  lines.push('-- =============================================================================');
  lines.push('');
  for (const t of tables) {
    lines.push('-- ' + t.name + (t.comment ? ': ' + t.comment : ''));
    lines.push('-- CREATE TABLE ' + t.name + ' (');
    lines.push('--     -- カラム定義をここに記述');
    lines.push('-- );');
    lines.push('');
  }
  return lines.join('\n');
}

// ポートレット登録 DML（既存の intra-mart 標準テーブル b_m_portlet_* への実 INSERT 文）
// spec.portletImport.portlets の各要素から、ポートレット本体・編集モード・
// タイトル（name / application / description × ja / en / zh_CN）の INSERT 文を組み立てる。
//
// サンプルデータセットアップは毎回実行されるため、素の INSERT では 2 回目に
// 一意制約違反になる。そのため各 INSERT の前に同一 CD の行を DELETE する
// （DELETE → INSERT の洗い替え）。DELETE / INSERT はいずれも標準 SQL の範囲で、
// PostgreSQL / Oracle / SQL Server のいずれでもそのまま実行できる。
//
// SQL コメント（--）は一切出力しない。SQLFileImporter はファイル全体を
// data.split(";\s*\n?") で分割して 1 チャンクずつ executeUpdateBySql() に渡すため、
// コメント内に ; が含まれたり最後の ; より後ろにコメントが残ったりすると、
// コメントだけのチャンクが SQL として実行されて壊れる。
// 本 DML は生成されたまま投入できることを保証するため、コメントを持たせない。
//
// ポータルへの配置・表示設定（b_m_portlet_layout / b_m_portlet_display_set）は
// ポータル管理画面側の表示設定であり、対象外（本スキルはポートレット定義のみを担当）。
// 洗い替え対象にも含めない。
// intra-mart 標準テーブルの固定長カラム制限。
// b_m_portlet_info.portlet_cd / b_m_portlet_mode.portlet_mode_cd はいずれも VARCHAR(20) であり、
// これを超える値を INSERT すると "値は型character varying(20)としては長すぎます" で
// サンプルデータセットアップのインポートが失敗する（アプリケーション層のバリデーションが効かないため、
// build 時に検出して早期にエラーにする）。
const PORTLET_CD_MAX_LENGTH = 20;
const PORTLET_MODE_CD_MAX_LENGTH = 20;

function buildPortletDmlLines(spec) {
  const portlets = (spec.portletImport || {}).portlets || [];
  if (portlets.length === 0) return [];

  const recUserCd = 'system';
  const recDate = formatDmlDate(new Date());
  const lines = [];

  for (const p of portlets) {
    if (!p.portletCd) throw new Error('spec.portletImport.portlets[].portletCd is required');
    if (!p.path) throw new Error('spec.portletImport.portlets["' + p.portletCd + '"].path is required');
    const portletCd = p.portletCd;
    if (portletCd.length > PORTLET_CD_MAX_LENGTH) {
      throw new Error(
        'spec.portletImport.portlets["' + portletCd + '"].portletCd は ' + portletCd.length + ' 文字ですが、'
        + 'b_m_portlet_info.portlet_cd は VARCHAR(' + PORTLET_CD_MAX_LENGTH + ') のため '
        + PORTLET_CD_MAX_LENGTH + ' 文字以内にしてください（超過するとインポート時に '
        + '"値は型character varying(20)としては長すぎます" で失敗します）。'
      );
    }
    const portletModeCd = p.portletModeCd || (portletCd + '_mode');
    if (portletModeCd.length > PORTLET_MODE_CD_MAX_LENGTH) {
      throw new Error(
        'spec.portletImport.portlets["' + portletCd + '"] の portletModeCd ("' + portletModeCd + '") は '
        + portletModeCd.length + ' 文字ですが、b_m_portlet_mode.portlet_mode_cd は VARCHAR('
        + PORTLET_MODE_CD_MAX_LENGTH + ') のため ' + PORTLET_MODE_CD_MAX_LENGTH + ' 文字以内にしてください。'
        + '既定では portletCd + "_mode" になるため、portletCd を短くするか portletModeCd を明示的に短く指定してください。'
      );
    }
    const pageParam = p.pageParam || '';
    // editable: false（既定）は表示のみ（作成者以外は編集不可）、true は表示・編集の両方が可能。
    // 実際に「誰が」表示・編集できるかは authz-policy 側（im-portal-portlet / im-portal-portlet-editmode）で制御する。
    const userFlag = p.editable === true ? 1 : 0;
    const cd = escapeSql(portletCd);

    // 洗い替え（再実行時の一意制約違反を防ぐ）。子テーブル → 親テーブルの順で削除する。
    lines.push("DELETE FROM b_m_portlet_title_info WHERE title_type = 'portlet' AND identification_id = '" + cd + "';");
    lines.push("DELETE FROM b_m_portlet_mode WHERE portlet_cd = '" + cd + "';");
    lines.push("DELETE FROM b_m_portlet_info WHERE portlet_cd = '" + cd + "';");
    lines.push('');

    lines.push('INSERT INTO b_m_portlet_info (portlet_cd, portlet_name, producer_id, page_kind, menulinkset_cd, path, page_param, application_id, service_id, sso_flag, title_bar_flag, cache_config, entity_id_prefix, open_flag, user_portal_flag, group_portal_flag, portlet_height, rec_user_cd, rec_date, global_portal_flag)');
    lines.push("VALUES ('" + cd + "', 'imart.PresentationPagePortlet', '', 'pagebase', '', '"
      + escapeSql(p.path) + "', '" + escapeSql(pageParam) + "', '', '', 0, 1, 0, 'imart|PresentationPagePortlet', 1, 1, 1, -1, '"
      + recUserCd + "', '" + recDate + "', NULL);");
    lines.push('');

    // ポートレットモード（userFlag=1: 表示・編集可 / 0: 表示のみ）
    lines.push('INSERT INTO b_m_portlet_mode (portlet_mode_cd, portlet_cd, portlet_mode, user_flag, access_check_flag, rec_user_cd, rec_date)');
    lines.push("VALUES ('" + escapeSql(portletModeCd) + "', '" + cd + "', 'EDIT', " + userFlag + ", 0, '" + recUserCd + "', '" + recDate + "');");
    lines.push('');

    // ポートレットタイトル（name / application / description × ja / en / zh_CN）
    for (const itemType of ['name', 'application', 'description']) {
      const values = (p.titles && p.titles[itemType]) || {};
      for (const loc of LOCALES) {
        const value = values[loc] || '';
        lines.push('INSERT INTO b_m_portlet_title_info (title_type, identification_id, item_type, locale, value, rec_user_cd, rec_date)');
        lines.push("VALUES ('portlet', '" + cd + "', '" + itemType + "', '" + loc + "', '"
          + escapeSql(value) + "', '" + recUserCd + "', '" + recDate + "');");
        lines.push('');
      }
    }
  }
  return lines;
}

function buildDmlSql(spec, dialect) {
  if (!spec.database && !spec.portletImport) return null;
  // spec.database が無く portletImport だけの場合、ユーザが手を入れる箇所は無い。
  // ガイド用のコメントヘッダも付けず、そのまま投入できる純粋な SQL のみを出力する
  // （SQLFileImporter の ; 分割でコメントが事故の原因になるため。
  if (!spec.database) {
    return buildPortletDmlLines(spec).join('\n');
  }
  const isCommon = dialect === 'common';
  const lines = [
    '-- =============================================================================',
    '--   ' + spec.key + ' DML' + (isCommon ? ' (全 DB 共通)' : ' (' + dialect + ')'),
    '-- =============================================================================',
    '--   出力タイミング: サンプルデータセットアップ時（DDL の後）',
  ];
  if (isCommon) {
    lines.push('--   suffix なしのファイルは全 DB-Type で共通使用される（フォールバック）');
    lines.push('--   INSERT 文は標準 SQL の範囲で書くこと');
  } else {
    lines.push('--   ファイル名サフィックス _' + dialect + ' は intra-mart Importer の自動判定で');
    lines.push('--   接続先 DB 種別に合致した 1 ファイルだけが読み込まれる');
  }
  lines.push('--');
  lines.push('--   サンプルデータセットアップは毎回実行される。二重投入で一意制約違反に');
  lines.push('--   ならないよう、べき等な INSERT を記述すること。');
  lines.push('-- =============================================================================');
  lines.push('');
  for (const t of (spec.database || {}).tables || []) {
    lines.push('-- ' + t.name + ' への初期データがあればここに記述');
    lines.push('-- INSERT INTO ' + t.name + ' (...) VALUES (...);');
    lines.push('');
  }
  lines.push(...buildPortletDmlLines(spec));
  return lines.join('\n');
}

function buildImportConfig(spec, files) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<import-data-config',
    '   xmlns="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config"',
    '   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '   xsi:schemaLocation="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config import-data-config.xsd">',
    '',
  ];

  if (files.ddl || files.dml) {
    lines.push('  <database>');
    if (files.ddl) {
      lines.push('    <!-- DDL -->');
      lines.push('    <create-file>' + files.ddl + '</create-file>');
    }
    if (files.dml) {
      lines.push('    <!-- DML -->');
      lines.push('    <insert-file>' + files.dml + '</insert-file>');
    }
    lines.push('  </database>');
    lines.push('');
  }

  const tenantMasterHas =
    files.role || files.authzResourceGroup || files.authzResource
    || files.authzSubjectGroup || files.menuGroup || files.authzPolicy
    || files.jobScheduler;

  if (tenantMasterHas) {
    lines.push('  <tenant-master>');

    if (files.role) {
      lines.push('    <!-- ロール -->');
      pushLocaleFiles(lines, files.role, 'role-file');
    }
    if (files.authzResourceGroup) {
      lines.push('    <!-- 認可リソースグループ -->');
      pushLocaleFiles(lines, files.authzResourceGroup, 'authz-resource-group-file');
    }
    if (files.authzResource) {
      lines.push('    <!-- 認可リソース -->');
      pushLocaleFiles(lines, files.authzResource, 'authz-resource-file');
    }
    if (files.authzSubjectGroup) {
      lines.push('    <!-- 認可サブジェクトグループ -->');
      pushLocaleFiles(lines, files.authzSubjectGroup, 'authz-subject-group-file');
    }
    if (files.menuGroup) {
      lines.push('    <!-- メニューグループ -->');
      pushLocaleFiles(lines, files.menuGroup, 'menu-group-file');
    }
    if (files.authzPolicy) {
      lines.push('    <!-- 認可ポリシー -->');
      lines.push('    <authz-policy-file>' + files.authzPolicy + '</authz-policy-file>');
    }
    if (files.jobScheduler) {
      lines.push('    <!-- ジョブスケジューラー -->');
      pushLocaleFiles(lines, files.jobScheduler, 'job-scheduler-file');
    }

    lines.push('  </tenant-master>');
    lines.push('');
  }

  const extendsImportClasses = [];
  if (files.extendsImport) {
    extendsImportClasses.push(files.extendsImport);
  }
  if (files.workflowImportJs) {
    extendsImportClasses.push(files.workflowImportJs);
  }
  if (files.logicImportJs) {
    extendsImportClasses.push(files.logicImportJs);
  }
  if (extendsImportClasses.length > 0) {
    lines.push('  <extends-import>');
    lines.push('    <!-- 拡張インポート -->');
    for (const cls of extendsImportClasses) {
      lines.push('    <extends-import-class>' + cls + '</extends-import-class>');
    }
    lines.push('  </extends-import>');
    lines.push('');
  }

  lines.push('</import-data-config>', '');
  return lines.join('\n');
}

function pushLocaleFiles(lines, group, tagName) {
  // group: { base, ja, en, zh_CN }
  if (group.base) lines.push('    <' + tagName + '>' + group.base + '</' + tagName + '>');
  for (const loc of LOCALES) {
    if (group[loc]) lines.push('    <' + tagName + '>' + group[loc] + '</' + tagName + '>');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = parseArgs(process.argv);
  FORCE = args.force;
  const spec = loadSpec(args.spec);
  const key = spec.key;

  // artifactId 解決順序: spec.artifactId → pom.xml の <artifactId> → spec.key
  // import-<artifactId>-config.xml のファイル名は、
  // pom.xml の artifactId と一致させる必要がある（サンプルデータセットアップの仕様）。
  let artifactId = spec.artifactId;
  let artifactIdSource = 'spec.json';
  if (!artifactId) {
    const detected = detectProjectArtifactId(args.out);
    if (detected) {
      artifactId = detected.artifactId;
      artifactIdSource = detected.source;
    } else {
      artifactId = key;
      artifactIdSource = 'spec.key (fallback)';
    }
  }

  // サンプルデータセットアップはスキーマバージョン管理の対象外のため、
  // 資材の配置に <version> ディレクトリを設けず、ファイル名に -<N> サフィックスも付けない。
  const baseRel = 'products/import/sample/' + key + '/';
  const baseAbs = path.join(args.out, 'src/main/storage/system/products/import/sample', key);
  const importDirAbs = path.join(args.out, 'src/main/conf/products/import/sample');
  const jsspKeyDir = path.join(args.out, 'src/main/jssp/src/' + key + '/initialize');
  const jsspRelPrefix = key + '/initialize/';

  console.log('Generating sample data setup import materials for key="' + key + '"');
  console.log('  artifactId: "' + artifactId + '" (source: ' + artifactIdSource + ')');
  console.log('  output base: ' + args.out);
  if (FORCE) console.log('  --force enabled: existing files will be overwritten');
  console.log('');

  const files = {
    role: null,
    authzResourceGroup: null,
    authzResource: null,
    authzSubjectGroup: null,
    menuGroup: null,
    authzPolicy: null,
    jobScheduler: null,
    ddl: null,
    dml: null,
    extendsImport: null,
    workflowImportJs: null,
    logicImportJs: null,
  };

  // -- role --
  if ((spec.roles || []).length > 0) {
    const fname = key + '-role';
    writeFileSafe(args.dryRun, path.join(baseAbs, fname + '.xml'), buildRoleBase(spec));
    files.role = { base: baseRel + fname + '.xml' };
    for (const loc of LOCALES) {
      writeFileSafe(args.dryRun, path.join(baseAbs, fname + '_' + loc + '.xml'), buildRoleLocale(spec, loc));
      files.role[loc] = baseRel + fname + '_' + loc + '.xml';
    }
  }

  // -- authz-resource-group --
  if ((spec.authzResourceGroups || []).length > 0) {
    const fname = key + '-authz-resource-group';
    writeFileSafe(args.dryRun, path.join(baseAbs, fname + '.xml'), buildAuthzResourceGroupBase(spec));
    files.authzResourceGroup = { base: baseRel + fname + '.xml' };
    for (const loc of LOCALES) {
      writeFileSafe(args.dryRun, path.join(baseAbs, fname + '_' + loc + '.xml'), buildAuthzResourceGroupLocale(spec, loc));
      files.authzResourceGroup[loc] = baseRel + fname + '_' + loc + '.xml';
    }
  }

  // -- authz-resource --
  // spec.authzResources が空でも、portletImport.portlets があれば
  // ポートレットの表示・編集権限に対応する認可リソースを出力する。
  if ((spec.authzResources || []).length > 0 || getPortletAuthzResourceEntries(spec).length > 0) {
    const fname = key + '-authz-resource';
    writeFileSafe(args.dryRun, path.join(baseAbs, fname + '.xml'), buildAuthzResourceBase(spec));
    files.authzResource = { base: baseRel + fname + '.xml' };
    for (const loc of LOCALES) {
      writeFileSafe(args.dryRun, path.join(baseAbs, fname + '_' + loc + '.xml'), buildAuthzResourceLocale(spec, loc));
      files.authzResource[loc] = baseRel + fname + '_' + loc + '.xml';
    }
  }

  // -- authz-subject-group --
  if ((spec.authzSubjectGroups || []).length > 0) {
    const fname = key + '-authz-subject-group';
    writeFileSafe(args.dryRun, path.join(baseAbs, fname + '.xml'), buildAuthzSubjectGroupBase(spec));
    files.authzSubjectGroup = { base: baseRel + fname + '.xml' };
    for (const loc of LOCALES) {
      writeFileSafe(args.dryRun, path.join(baseAbs, fname + '_' + loc + '.xml'), buildAuthzSubjectGroupLocale(spec, loc));
      files.authzSubjectGroup[loc] = baseRel + fname + '_' + loc + '.xml';
    }
  }

  // -- menu-group --
  if ((spec.menuGroups || []).length > 0) {
    const fname = key + '-menu-group';
    writeFileSafe(args.dryRun, path.join(baseAbs, fname + '.xml'), buildMenuGroupBase(spec));
    files.menuGroup = { base: baseRel + fname + '.xml' };
    for (const loc of LOCALES) {
      writeFileSafe(args.dryRun, path.join(baseAbs, fname + '_' + loc + '.xml'), buildMenuGroupLocale(spec, loc));
      files.menuGroup[loc] = baseRel + fname + '_' + loc + '.xml';
    }
  }

  // -- authz-policy (no locale variants) --
  // authzPolicies が空でも、authzResources / menuGroups / portletImport があれば
  // tenant_manager の既定ポリシーが自動付与されるため、その場合もファイルを書き出す。
  if ((spec.authzPolicies || []).length > 0
      || (spec.authzResources || []).length > 0
      || (spec.menuGroups || []).length > 0
      || ((spec.portletImport || {}).portlets || []).length > 0) {
    const fname = key + '-authz-policy.xml';
    writeFileSafe(args.dryRun, path.join(baseAbs, fname), buildAuthzPolicy(spec));
    files.authzPolicy = baseRel + fname;
  }

  // -- job-scheduler --
  if (spec.jobScheduler) {
    const fname = key + '-job-scheduler';
    writeFileSafe(args.dryRun, path.join(baseAbs, fname + '.xml'), buildJobSchedulerBase(spec));
    files.jobScheduler = { base: baseRel + fname + '.xml' };
    for (const loc of LOCALES) {
      writeFileSafe(args.dryRun, path.join(baseAbs, fname + '_' + loc + '.xml'), buildJobSchedulerLocale(spec, loc));
      files.jobScheduler[loc] = baseRel + fname + '_' + loc + '.xml';
    }
  }

  // -- DDL / DML --
  // intra-mart Importer は config.xml の <create-file>/<insert-file> に対して
  // DB-Type ごとの suffix (_postgre / _oracle / _sqlserver) を自動付与する。
  // suffix 付きが無ければ suffix なしファイルがフォールバックとして使われる。
  //   - DDL は型・存在チェック構文が DB ごとに違うため、常に 3 方言別で出力。
  //     ただし対象は spec.database.tables[].ddl === true のテーブルのみ
  //     （モジュール本体のテーブルはテナント環境セットアップ側で作成する）
  //   - DML はデフォルト 1 ファイル一本化（INSERT は標準 SQL で全 DB 共通でよい）。
  //     spec.database.dmlPerDialect === true の場合のみ 3 方言別で出力
  if (ddlTables(spec).length > 0) {
    for (const dialect of DB_DIALECTS) {
      writeFileSafe(args.dryRun, path.join(baseAbs, key + '-ddl_' + dialect + '.sql'), buildDdlSql(spec, dialect));
    }
    files.ddl = baseRel + key + '-ddl.sql';
  }
  // DML は独自テーブル（spec.database）と portletImport のいずれかがあれば出力する。
  // portletImport は既存の intra-mart 標準テーブル（b_m_portlet_*）への DML のみで、
  // DDL（CREATE TABLE）は不要。
  if (spec.database || spec.portletImport) {
    if (spec.database && spec.database.dmlPerDialect === true) {
      for (const dialect of DB_DIALECTS) {
        writeFileSafe(args.dryRun, path.join(baseAbs, key + '-dml_' + dialect + '.sql'), buildDmlSql(spec, dialect));
      }
    } else {
      writeFileSafe(args.dryRun, path.join(baseAbs, key + '-dml.sql'), buildDmlSql(spec, 'common'));
    }
    files.dml = baseRel + key + '-dml.sql';
  }

  // -- extends-import JS --
  if (spec.extendsImport === true) {
    const jsName = key + '_import.js';
    const jsRel = jsspRelPrefix + jsName;
    writeFileSafe(args.dryRun, path.join(jsspKeyDir, jsName), buildExtendsImportJs(spec));
    files.extendsImport = jsRel;
  }

  // -- workflow import data + workflow extends-import JS --
  // spec.workflowImport.files に列挙された XML を storage/public/im_workflow/ から
  // storage/system/products/import/sample/<key>/ にコピーし、
  // それらを DataImportExecutor で取り込む拡張インポート JS を生成する。
  if (spec.workflowImport && Array.isArray(spec.workflowImport.files)
      && spec.workflowImport.files.length > 0) {
    const workflowSystemPaths = [];
    for (const fileName of spec.workflowImport.files) {
      const sourceAbs = path.join(args.out, 'src/main/storage/public/im_workflow/' + fileName);
      const destAbs = path.join(baseAbs, fileName);
      copyFileSafe(args.dryRun, sourceAbs, destAbs);
      workflowSystemPaths.push(baseRel + fileName);
    }
    const wfJsName = key + '_workflow_import.js';
    const wfJsRel = jsspRelPrefix + wfJsName;
    writeFileSafe(args.dryRun, path.join(jsspKeyDir, wfJsName),
      buildWorkflowImportJs(spec, workflowSystemPaths));
    files.workflowImportJs = wfJsRel;
  }

  // -- IM-LogicDesigner import data + logic extends-import JS --
  // spec.logicImport.files に列挙されたファイル（通常 .zip）を
  // storage/public/im_logic/ から storage/system/products/import/sample/<key>/
  // にコピーし、Java の LogicFlowImporter で取り込む拡張インポート JS を生成する。
  if (spec.logicImport && Array.isArray(spec.logicImport.files)
      && spec.logicImport.files.length > 0) {
    const logicSystemPaths = [];
    for (const fileName of spec.logicImport.files) {
      const sourceAbs = path.join(args.out, 'src/main/storage/public/im_logic/' + fileName);
      const destAbs = path.join(baseAbs, fileName);
      copyFileSafe(args.dryRun, sourceAbs, destAbs);
      logicSystemPaths.push(baseRel + fileName);
    }
    const logicJsName = key + '_logic_import.js';
    const logicJsRel = jsspRelPrefix + logicJsName;
    writeFileSafe(args.dryRun, path.join(jsspKeyDir, logicJsName),
      buildLogicImportJs(spec, logicSystemPaths));
    files.logicImportJs = logicJsRel;
  }

  // -- import-config (last, so it references existing files only) --
  const configPath = path.join(importDirAbs, 'import-' + artifactId + '-config.xml');
  writeFileSafe(args.dryRun, configPath, buildImportConfig(spec, files));

  console.log('');
  console.log('Done.');
  console.log('');
  console.log('Next steps:');
  let step = 0;
  console.log('  ' + (++step) + '. reference/checklist.md のセルフチェックを実施');
  if (files.ddl) {
    console.log('  ' + (++step) + '. DDL の CREATE TABLE を実装（毎回実行されるため存在チェックが必要。'
      + 'reference/database-sql.md 参照）');
  }
  if (spec.database) {
    console.log('  ' + (++step) + '. DML の INSERT を実装（べき等性に注意）');
  }
  if (spec.extendsImport === true) {
    console.log('  ' + (++step) + '. ' + path.relative(args.out, path.join(jsspKeyDir, key + '_import.js')) + ' に doImport の実装を追記');
  }
  if (files.workflowImportJs) {
    console.log('  ' + (++step) + '. ' + path.relative(args.out, path.join(jsspKeyDir, key + '_workflow_import.js')) + ' を確認（IM-Workflow インポート処理）');
  }
  if (files.logicImportJs) {
    console.log('  ' + (++step) + '. ' + path.relative(args.out, path.join(jsspKeyDir, key + '_logic_import.js')) + ' を確認（IM-LogicDesigner インポート処理）');
  }
  if (((spec.portletImport || {}).portlets || []).length > 0) {
    console.log('  ' + (++step) + '. ' + key + '-dml.sql のポートレット登録 DML を確認（DELETE → INSERT の洗い替え）');
  }
  if ((spec.menuGroups || []).length > 0) {
    console.log('  ' + (++step) + '. ' + key + '-menu-group.xml に <menu-items> を追記（必要なら）');
  }
}

try {
  main();
} catch (e) {
  console.error('Error: ' + e.message);
  if (process.env.DEBUG) console.error(e.stack);
  process.exit(1);
}
