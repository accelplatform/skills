#!/usr/bin/env node
/*
 * build-oauth.js — im_oauth リソース一括ジェネレータ
 *
 * 使い方:
 *   node build-oauth.js <spec.json>
 *
 * spec.json から以下 4 種類のファイルを一括生成する:
 *   1. src/main/conf/oauth-client-scopes-config/{feature}.xml
 *   2. src/main/conf/oauth-client-resources-config/{feature}.xml
 *   3. src/main/conf/oauth-client-details-config/{feature}.xml
 *   4. src/main/jssp/src/{feature}/oauth/{file}.js   ← resources の各 file ごとに 1 つ
 *
 * 出力はすべて UTF-8、既存ファイルは上書きされる。
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CONF_DIR = 'src/main/conf';
const JSSP_SRC_DIR = 'src/main/jssp/src';

const LOCALES = ['ja', 'en', 'zh_CN'];

// ============================================================
// エントリーポイント
// ============================================================
function main() {
  const args = process.argv.slice(2);
  const flags = { xmlOnly: false };
  const positional = [];
  for (const arg of args) {
    if (arg === '--xml-only') flags.xmlOnly = true;
    else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    } else if (arg.startsWith('--')) {
      console.error('Unknown option: ' + arg);
      printHelp();
      process.exit(1);
    } else {
      positional.push(arg);
    }
  }
  if (positional.length < 1) {
    printHelp();
    process.exit(1);
  }
  const specPath = path.resolve(positional[0]);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

  validateSpec(spec);

  const outputs = [];
  outputs.push(writeFile(scopesXmlPath(spec), buildScopesXml(spec)));
  outputs.push(writeFile(resourcesXmlPath(spec), buildResourcesXml(spec)));
  outputs.push(writeFile(detailsXmlPath(spec), buildDetailsXml(spec)));

  const skipped = [];
  for (const resource of spec.resources) {
    if (resource.type !== 'jssp') continue;
    const jsspFile = jsspPath(spec, resource);
    if (flags.xmlOnly) {
      skipped.push(jsspFile);
      continue;
    }
    if (fs.existsSync(jsspFile)) {
      // 既存ファイルは上書きせず警告（業務ロジックの誤消失を防ぐ）
      console.warn(`[skip] ${jsspFile} は既に存在するため上書きしません（業務ロジック保護）。`);
      console.warn('       骨格を再生成したい場合は対象ファイルを削除してから再実行してください。');
      skipped.push(jsspFile);
      continue;
    }
    outputs.push(writeFile(jsspFile, buildJsspSkeleton(spec, resource)));
  }

  console.log('');
  console.log('Generated:');
  for (const p of outputs) console.log('  - ' + p);
  if (skipped.length > 0) {
    console.log('');
    console.log('Skipped (already exists or --xml-only):');
    for (const p of skipped) console.log('  - ' + p);
  }
}

function printHelp() {
  console.error('Usage: node build-oauth.js <spec.json> [--xml-only]');
  console.error('');
  console.error('  spec.json から OAuth リソース一式を生成する。');
  console.error('  デフォルトでは XML 3 ファイル + JSSP 骨格 (.js) を出力する。');
  console.error('  ただし既存の JSSP ファイルは上書きせずスキップする（業務ロジック保護）。');
  console.error('');
  console.error('Options:');
  console.error('  --xml-only   XML 3 ファイルのみ更新し JSSP は一切触らない。');
  console.error('               spec 更新後に XML だけ再生成したいときに使う。');
}

// ============================================================
// spec 検証
// ============================================================
function validateSpec(spec) {
  const errors = [];
  if (!spec.feature) errors.push('spec.feature is required');
  if (!/^[a-z][a-z0-9_]*$/.test(spec.feature || '')) {
    errors.push('spec.feature must be lowercase snake_case');
  }
  if (!spec.errorCodeProduct) errors.push('spec.errorCodeProduct is required');
  if (!Array.isArray(spec.scopes) || spec.scopes.length === 0) {
    errors.push('spec.scopes must be a non-empty array');
  }
  if (!Array.isArray(spec.resources) || spec.resources.length === 0) {
    errors.push('spec.resources must be a non-empty array');
  }
  if (!Array.isArray(spec.clients) || spec.clients.length === 0) {
    errors.push('spec.clients must be a non-empty array');
  }

  // scope ID の重複チェックと整合性
  const scopeIds = new Set();
  for (const scope of spec.scopes || []) {
    if (!scope.id) errors.push('scope.id is required');
    if (scopeIds.has(scope.id)) errors.push(`scope.id "${scope.id}" is duplicated`);
    scopeIds.add(scope.id);
    if (!scope.defaultSubject) errors.push(`scope "${scope.id}": defaultSubject is required`);
  }

  // resource が参照する scope の存在チェック
  for (const resource of spec.resources || []) {
    if (!resource.id) errors.push('resource.id is required');
    if (!resource.path) errors.push(`resource "${resource.id}": path is required`);
    if (!resource.type) errors.push(`resource "${resource.id}": type is required`);
    if (resource.type === 'jssp' && !resource.file) {
      errors.push(`resource "${resource.id}": file is required when type=jssp`);
    }
    if (resource.type === 'java' && !resource.target) {
      errors.push(`resource "${resource.id}": target is required when type=java`);
    }
    if (!Array.isArray(resource.scopes) || resource.scopes.length === 0) {
      errors.push(`resource "${resource.id}": scopes must be a non-empty array`);
    }
    for (const scopeId of resource.scopes || []) {
      if (!scopeIds.has(scopeId)) {
        errors.push(`resource "${resource.id}": scope "${scopeId}" is not defined in spec.scopes`);
      }
    }
  }

  // client が参照する scope の存在チェック
  for (const client of spec.clients || []) {
    if (!client.clientId) errors.push('client.clientId is required');
    if (!client.grantType) errors.push(`client "${client.clientId}": grantType is required`);
    if (client.grantType === 'authorization_code' && !client.clientSecret) {
      errors.push(`client "${client.clientId}": clientSecret is required when grantType=authorization_code`);
    }
    if (!client.defaultName) errors.push(`client "${client.clientId}": defaultName is required`);
    if (!Array.isArray(client.scopes) || client.scopes.length === 0) {
      errors.push(`client "${client.clientId}": scopes must be a non-empty array`);
    }
    for (const scopeId of client.scopes || []) {
      if (!scopeIds.has(scopeId)) {
        errors.push(`client "${client.clientId}": scope "${scopeId}" is not defined in spec.scopes`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('spec.json validation failed:');
    for (const error of errors) console.error('  - ' + error);
    process.exit(1);
  }
}

// ============================================================
// パス組み立て
// ============================================================
function scopesXmlPath(spec) {
  return path.join(CONF_DIR, 'oauth-client-scopes-config', spec.feature + '.xml');
}

function resourcesXmlPath(spec) {
  return path.join(CONF_DIR, 'oauth-client-resources-config', spec.feature + '.xml');
}

function detailsXmlPath(spec) {
  return path.join(CONF_DIR, 'oauth-client-details-config', spec.feature + '.xml');
}

function jsspPath(spec, resource) {
  return path.join(JSSP_SRC_DIR, spec.feature, 'oauth', resource.file + '.js');
}

function resourceTarget(spec, resource) {
  if (resource.type === 'java') return resource.target;
  return spec.feature + '/oauth/' + resource.file;
}

// ============================================================
// XML エスケープ
// ============================================================
function escXml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// XML コメント内に埋め込めない文字列をサニタイズする。
// 改行は空白へ畳み込み、`--` 連続と末尾 `-` も除去する（XML 仕様上コメントに含められないため）。
function escXmlComment(s) {
  if (s == null) return '';
  return String(s)
    .replace(/\r?\n+/g, ' ')
    .replace(/-{2,}/g, '-')
    .replace(/-$/, '')
    .trim();
}

// ============================================================
// コメント生成（ja localize 値からの自動取得）
// ============================================================
function scopeComment(scope) {
  const ja = scope.localizations && scope.localizations.ja;
  if (ja && ja.subject) return ja.subject;
  return scope.defaultSubject || scope.id || '';
}

function resourceComment(resource) {
  const api = resource.api || {};
  return api.title || resource.id || '';
}

function clientComment(client) {
  const ja = client.localizations && client.localizations.ja;
  if (ja && ja.clientName) return ja.clientName;
  return client.defaultName || client.clientId || '';
}

function renderLocalizations(parentIndent, locMap, childRenderer) {
  if (!locMap) return '';
  const indent = ' '.repeat(parentIndent);
  const innerIndent = ' '.repeat(parentIndent + 2);
  const lines = [];
  lines.push(indent + '<localizations>');
  for (const locale of LOCALES) {
    if (!locMap[locale]) continue;
    lines.push(innerIndent + `<localize locale="${escXml(locale)}">`);
    for (const line of childRenderer(locMap[locale], parentIndent + 4)) {
      lines.push(line);
    }
    lines.push(innerIndent + '</localize>');
  }
  lines.push(indent + '</localizations>');
  return lines.join('\n');
}

// ============================================================
// 1. scopes-config XML
// ============================================================
function buildScopesXml(spec) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<oauth-client-scopes-config');
  lines.push('    xmlns="http://intra-mart.co.jp/system/oauth/provider/client/scope/config/oauth-client-scopes-config"');
  lines.push('    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
  lines.push('    xsi:schemaLocation="http://intra-mart.co.jp/system/oauth/provider/client/scope/config/oauth-client-scopes-config oauth-client-scopes-config.xsd">');
  lines.push('');
  lines.push('  <scopes>');
  for (let i = 0; i < spec.scopes.length; i++) {
    const scope = spec.scopes[i];
    const comment = scopeComment(scope);
    if (comment) lines.push(`    <!-- ${escXmlComment(comment)} -->`);
    lines.push(`    <scope id="${escXml(scope.id)}">`);
    lines.push(`      <default-subject>${escXml(scope.defaultSubject)}</default-subject>`);
    if (scope.localizations) {
      lines.push('');
      lines.push(renderLocalizations(6, scope.localizations, (loc, indent) => {
        const sp = ' '.repeat(indent);
        return [
          sp + `<subject>${escXml(loc.subject)}</subject>`,
          sp + `<text>${escXml(loc.text)}</text>`,
        ];
      }));
    }
    lines.push('    </scope>');
    if (i < spec.scopes.length - 1) lines.push('');
  }
  lines.push('  </scopes>');
  lines.push('</oauth-client-scopes-config>');
  lines.push('');
  return lines.join('\n');
}

// ============================================================
// 2. resources-config XML
// ============================================================
function buildResourcesXml(spec) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<oauth-client-resources-config');
  lines.push('    xmlns="http://intra-mart.co.jp/system/oauth/provider/client/resource/config/oauth-client-resources-config"');
  lines.push('    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
  lines.push('    xsi:schemaLocation="http://intra-mart.co.jp/system/oauth/provider/client/resource/config/oauth-client-resources-config oauth-client-resources-config.xsd">');
  lines.push('');
  lines.push('  <!-- 認可設定のデフォルト値 -->');
  lines.push('  <authz-default mapper="welcome-all" />');
  lines.push('');
  lines.push('  <client-resources>');
  for (let i = 0; i < spec.resources.length; i++) {
    const resource = spec.resources[i];
    const comment = resourceComment(resource);
    if (comment) lines.push(`    <!-- ${escXmlComment(comment)} -->`);
    lines.push(`    <client-resource id="${escXml(resource.id)}"`);
    lines.push(`        path="${escXml(resource.path)}"`);
    lines.push(`        type="${escXml(resource.type)}"`);
    lines.push(`        target="${escXml(resourceTarget(spec, resource))}">`);
    lines.push('');
    // <authz-default mapper="welcome-all"> と同じになるケースは <authz> を省略する
    const authzLine = renderAuthz(resource.authz);
    if (authzLine !== null) {
      lines.push('      ' + authzLine);
    }
    for (const scopeId of resource.scopes) {
      lines.push(`      <scope id="${escXml(scopeId)}" />`);
    }
    lines.push('    </client-resource>');
    if (i < spec.resources.length - 1) lines.push('');
  }
  lines.push('  </client-resources>');
  lines.push('</oauth-client-resources-config>');
  lines.push('');
  return lines.join('\n');
}

// <authz-default mapper="welcome-all"> がトップに常時出力されるため、
// 同じ内容の <authz> は省略する。省略する場合は null を返す。
function renderAuthz(authz) {
  // 文字列指定 → mapper として扱う
  if (typeof authz === 'string') {
    if (authz === 'welcome-all') return null;
    return `<authz mapper="${escXml(authz)}" />`;
  }
  // オブジェクト指定: { uri, action } または { mapper }
  if (authz && typeof authz === 'object') {
    if (authz.mapper) {
      if (authz.mapper === 'welcome-all') return null;
      return `<authz mapper="${escXml(authz.mapper)}" />`;
    }
    if (authz.uri && authz.action) {
      return `<authz uri="${escXml(authz.uri)}" action="${escXml(authz.action)}" />`;
    }
  }
  // 未指定はデフォルト welcome-all 扱い → authz-default に委ねるため省略
  return null;
}

// ============================================================
// 3. client-details-config XML
// ============================================================
function buildDetailsXml(spec) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<oauth-client-details-config');
  lines.push('    xmlns="http://intra-mart.co.jp/system/oauth/provider/client/config/oauth-client-details-config"');
  lines.push('    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
  lines.push('    xsi:schemaLocation="http://intra-mart.co.jp/system/oauth/provider/client/config/oauth-client-details-config oauth-client-details-config.xsd">');
  lines.push('');
  lines.push('  <client-details>');
  for (let i = 0; i < spec.clients.length; i++) {
    const client = spec.clients[i];
    const comment = clientComment(client);
    if (comment) lines.push(`    <!-- ${escXmlComment(comment)} -->`);
    lines.push(`    <client-detail client-id="${escXml(client.clientId)}"`);
    lines.push(`        authorized-grant-type="${escXml(client.grantType)}"`);
    if (client.clientSecret !== undefined && client.clientSecret !== null) {
      lines.push(`        client-secret="${escXml(client.clientSecret)}"`);
    }
    if (client.redirectUri) {
      lines.push(`        redirect-uri="${escXml(client.redirectUri)}"`);
    }
    if (client.accessTokenValiditySeconds !== undefined && client.accessTokenValiditySeconds !== null) {
      lines.push(`        access-token-validity-seconds="${escXml(client.accessTokenValiditySeconds)}"`);
    }
    if (client.iconPath) {
      lines.push(`        icon-path="${escXml(client.iconPath)}"`);
    }
    if (client.codeChallenge) {
      lines.push(`        code-challenge="${escXml(client.codeChallenge)}">`);
    } else {
      // 最後の属性がない場合は、直前の行を `>` で閉じる必要がある
      // 上記の出力は最後の属性まで含めて " のあと改行になっているので、ここで >  だけ追加するわけにはいかない
      // → 簡略化: codeChallenge を最終属性として扱い、なければ別属性の行末を補正
      // 実装簡略化のため、codeChallenge を最終属性として必ず出力する設計にする
      // 上記分岐で codeChallenge があれば閉じタグ ">" が付くため、ここに来た時点で直近の行末は `"`
      // 直近行を取り出して ">" を追加
      lines[lines.length - 1] = lines[lines.length - 1] + '>';
    }
    lines.push('');
    lines.push(`      <default-name>${escXml(client.defaultName)}</default-name>`);

    if (client.localizations) {
      lines.push('');
      lines.push(renderLocalizations(6, client.localizations, (loc, indent) => {
        const sp = ' '.repeat(indent);
        return [
          sp + `<client-name>${escXml(loc.clientName)}</client-name>`,
          sp + `<description>${escXml(loc.description)}</description>`,
        ];
      }));
    }

    lines.push('');
    lines.push('      <scopes>');
    for (const scopeId of client.scopes) {
      lines.push(`        <scope id="${escXml(scopeId)}" />`);
    }
    lines.push('      </scopes>');
    lines.push('    </client-detail>');
    if (i < spec.clients.length - 1) lines.push('');
  }
  lines.push('  </client-details>');
  lines.push('</oauth-client-details-config>');
  lines.push('');
  return lines.join('\n');
}

// ============================================================
// 4. JSSP 骨格 .js
// ============================================================
function buildJsspSkeleton(spec, resource) {
  const api = resource.api || {};
  const featureUpper = spec.feature.toUpperCase();
  const fileUpper = resource.file.toUpperCase();
  const errCodePrefix = `E.${spec.errorCodeProduct}.${featureUpper}.${fileUpper}`;
  const logPrefix = api.logPrefix || (spec.feature + '/' + resource.file);
  const allowedMethods = api.allowedMethods || ['GET'];
  const parameters = api.parameters || [];
  const extraErrorCodes = api.extraErrorCodes || [];

  const lines = [];

  // ファイルヘッダ
  const title = api.title || `${resource.file} REST-API（OAuth 公開）`;
  lines.push('/**');
  lines.push(` * ${title}`);
  lines.push(' *');
  lines.push(` * @file ${resource.file}.js`);
  if (api.description) {
    // 複数行 description は JSDoc の継続行に揃える
    const descLines = String(api.description).split(/\r?\n/);
    lines.push(` * @description ${descLines[0]}`);
    for (let i = 1; i < descLines.length; i++) {
      lines.push(` *              ${descLines[i].replace(/^\s+/, '')}`);
    }
  }
  lines.push(' */');
  lines.push('');

  // 定数定義
  lines.push('// ========================================');
  lines.push('// 定数定義');
  lines.push('// ========================================');

  // パラメータ用定数
  for (const param of parameters) {
    const upper = camelToUpper(param.name);
    if (param.maxLength != null) {
      lines.push(`let ${upper}_MAX_LENGTH = ${param.maxLength};`);
    }
    if (param.minLength != null) {
      lines.push(`let ${upper}_MIN_LENGTH = ${param.minLength};`);
    }
    if (param.pattern) {
      lines.push(`let ${upper}_PATTERN = ${toJsRegexLiteral(param.pattern)};`);
    }
  }
  if (parameters.some(p => p.maxLength || p.minLength || p.pattern)) lines.push('');

  // エラーコード
  lines.push(`let ERROR_CODE_INVALID_REQUEST = '${errCodePrefix}.00001';`);
  lines.push(`let ERROR_CODE_METHOD_NOT_ALLOWED = '${errCodePrefix}.00002';`);
  for (const extra of extraErrorCodes) {
    lines.push(`let ERROR_CODE_${extra.name} = '${errCodePrefix}.${extra.code}';`);
  }
  lines.push(`let ERROR_CODE_INTERNAL = '${errCodePrefix}.99999';`);
  lines.push('');

  // ALLOWED_METHODS
  const allowedMethodsLiteral = allowedMethods.map(m => `'${m}'`).join(', ');
  lines.push(`let ALLOWED_METHODS = [${allowedMethodsLiteral}];`);
  lines.push('');

  // エントリーポイント
  lines.push('// ========================================');
  lines.push('// エントリーポイント');
  lines.push('// ========================================');
  lines.push('/**');
  lines.push(' * OAuth REST-API のエントリーポイント。');
  lines.push(' *');
  lines.push(' * @param {Object} request - リクエストオブジェクト');
  lines.push(' */');
  lines.push('function init(request) {');
  lines.push('  let logger = Logger.getLogger();');
  lines.push('  let response;');
  lines.push('  let statusCode = 200;');
  lines.push('');
  lines.push('  try {');
  lines.push('    // HTTP メソッドのチェック (405)');
  lines.push('    checkMethod(request);');
  lines.push('    // リクエストパラメータのバリデーション (400)');
  lines.push('    validateRequest(request);');
  lines.push('    // ビジネスロジック');
  lines.push('    response = {');
  lines.push('      error: false,');
  lines.push('      data: processBusinessLogic(request),');
  lines.push('    };');
  lines.push('  } catch (e) {');
  lines.push('    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);');
  lines.push('    statusCode = apiError.httpStatus || 500;');
  lines.push('    let code = apiError.code || ERROR_CODE_INTERNAL;');
  lines.push("    let message = apiError.message || '予期しないエラーが発生しました。';");
  lines.push('');
  lines.push('    if (statusCode >= 500) {');
  lines.push(`      logger.error('[${logPrefix}] API 処理中にエラーが発生しました。code={} message={}', [code, message]);`);
  lines.push('    } else {');
  lines.push(`      logger.warn('[${logPrefix}] API リクエストが受理できませんでした。code={} status={} message={}', [code, statusCode, message]);`);
  lines.push('    }');
  lines.push('');
  lines.push('    response = {');
  lines.push('      error: true,');
  lines.push("      errorMessage: '[' + code + '] ' + message,");
  lines.push('    };');
  lines.push('  }');
  lines.push('');
  lines.push('  sendJsonResponse(response, statusCode);');
  lines.push('}');
  lines.push('');

  // メソッド・バリデーション
  lines.push('// ========================================');
  lines.push('// メソッド・バリデーション');
  lines.push('// ========================================');
  lines.push('/**');
  lines.push(' * HTTP メソッドが許可されているかチェックします。');
  lines.push(' *');
  lines.push(' * @param {Object} request - リクエストオブジェクト');
  lines.push(' */');
  lines.push('function checkMethod(request) {');
  lines.push('  let method = request.getMethod();');
  lines.push('  if (ALLOWED_METHODS.indexOf(method) === -1) {');
  lines.push('    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,');
  lines.push("      'メソッド ' + method + ' は許可されていません。');");
  lines.push('  }');
  lines.push('}');
  lines.push('');
  lines.push('/**');
  lines.push(' * リクエストパラメータの検証を行います。');
  lines.push(' *');
  lines.push(' * @param {Object} request - リクエストオブジェクト');
  lines.push(' */');
  lines.push('function validateRequest(request) {');
  if (parameters.length === 0) {
    lines.push('  // TODO: パラメータバリデーション');
  } else {
    for (const param of parameters) {
      lines.push(...renderParamValidation(param));
    }
  }
  lines.push('}');
  lines.push('');
  lines.push('/**');
  lines.push(' * バリデーションエラー（400）をスローします。');
  lines.push(' *');
  lines.push(' * @param {string} message - エラーメッセージ');
  lines.push(' */');
  lines.push('function throwValidationError(message) {');
  lines.push('  throwApiError(ERROR_CODE_INVALID_REQUEST, 400, message);');
  lines.push('}');
  lines.push('');
  lines.push('/**');
  lines.push(' * エラーコード・HTTP ステータス付きで例外をスローします。');
  lines.push(' *');
  lines.push(' * @param {string} code - エラーコード');
  lines.push(' * @param {number} httpStatus - HTTP ステータスコード');
  lines.push(' * @param {string} message - エラーメッセージ');
  lines.push(' */');
  lines.push('function throwApiError(code, httpStatus, message) {');
  lines.push('  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));');
  lines.push('  error.code = code;');
  lines.push('  error.httpStatus = httpStatus;');
  lines.push('  throw error;');
  lines.push('}');
  lines.push('');

  // ビジネスロジック
  lines.push('// ========================================');
  lines.push('// ビジネスロジック');
  lines.push('// ========================================');
  lines.push('/**');
  lines.push(' * ビジネスロジックを実行します。');
  lines.push(' *');
  lines.push(' * @param {Object} request - リクエストオブジェクト');
  lines.push(' * @return {Object} JSON 出力用のデータ');
  lines.push(' */');
  lines.push('function processBusinessLogic(request) {');
  lines.push('  // TODO: ここに業務処理を実装してください。');
  lines.push('  //       例: AccountInfoManager 等の API でデータ取得し、JSON 用オブジェクトを返す。');
  lines.push('  //       未存在の場合は throwApiError(ERROR_CODE_*, 404, ...) でスローする。');
  lines.push('  return {};');
  lines.push('}');
  lines.push('');

  // レスポンス送信
  lines.push('// ========================================');
  lines.push('// レスポンス送信');
  lines.push('// ========================================');
  lines.push('/**');
  lines.push(' * JSON レスポンスを送信します。送信後、JavaScript の実行は停止します。');
  lines.push(' *');
  lines.push(' * @param {Object} response - 送信するレスポンスオブジェクト');
  lines.push(' * @param {number} statusCode - HTTP ステータスコード');
  lines.push(' */');
  lines.push('function sendJsonResponse(response, statusCode) {');
  lines.push('  let httpResponse = Web.getHTTPResponse();');
  lines.push('  httpResponse.setStatus(statusCode);');
  lines.push("  httpResponse.setContentType('application/json; charset=utf-8');");
  lines.push('  httpResponse.sendMessageBodyString(JSON.stringify(response));');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

function renderParamValidation(param) {
  const lines = [];
  const name = param.name;
  const upper = camelToUpper(name);
  lines.push(`  let ${name} = request['${name}'];`);
  lines.push('');
  if (param.required) {
    // クローズタグ + else if を 1 行で繋ぐ形式
    const branches = [];
    branches.push({
      condition: `!${name} || ${name}.length === 0`,
      body: `throwValidationError('${name} は必須です。');`,
    });
    if (param.maxLength != null) {
      branches.push({
        condition: `${name}.length > ${upper}_MAX_LENGTH`,
        body: `throwValidationError('${name} は最大' + ${upper}_MAX_LENGTH + '文字です。');`,
      });
    }
    if (param.minLength != null) {
      branches.push({
        condition: `${name}.length < ${upper}_MIN_LENGTH`,
        body: `throwValidationError('${name} は最低' + ${upper}_MIN_LENGTH + '文字必要です。');`,
      });
    }
    if (param.pattern) {
      const msg = param.patternMessage || `${name} の形式が正しくありません。`;
      branches.push({
        condition: `!${upper}_PATTERN.test(${name})`,
        body: `throwValidationError('${escJsString(msg)}');`,
      });
    }
    for (let i = 0; i < branches.length; i++) {
      const prefix = i === 0 ? '  if' : '  } else if';
      lines.push(`${prefix} (${branches[i].condition}) {`);
      lines.push(`    ${branches[i].body}`);
    }
    lines.push('  }');
  } else {
    // 任意項目（値が存在する場合のみ検証）
    lines.push(`  if (${name} !== undefined && ${name} !== null && ${name} !== '') {`);
    if (param.maxLength != null) {
      lines.push(`    if (${name}.length > ${upper}_MAX_LENGTH) {`);
      lines.push(`      throwValidationError('${name} は最大' + ${upper}_MAX_LENGTH + '文字です。');`);
      lines.push('    }');
    }
    if (param.pattern) {
      const msg = param.patternMessage || `${name} の形式が正しくありません。`;
      lines.push(`    if (!${upper}_PATTERN.test(${name})) {`);
      lines.push(`      throwValidationError('${escJsString(msg)}');`);
      lines.push('    }');
    }
    lines.push('  }');
  }
  return lines;
}

// camelCase → UPPER_SNAKE_CASE
function camelToUpper(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
}

function escJsString(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function toJsRegexLiteral(pattern) {
  // spec 内では JSON 文字列として書かれているため、JS の正規表現リテラル化
  // パターン文字列内のスラッシュをエスケープ
  const escaped = pattern.replace(/\//g, '\\/');
  return `/${escaped}/`;
}

// ============================================================
// ファイル書き出し（親ディレクトリの自動作成 + UTF-8）
// ============================================================
function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

main();
