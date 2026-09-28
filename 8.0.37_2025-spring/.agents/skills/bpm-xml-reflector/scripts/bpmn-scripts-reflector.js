'use strict';

var fs   = require('fs');
var path = require('path');
var vendorUtils = require('./bpmn-reflector-utils');

var detectVendor          = vendorUtils.detectVendor;
var resolveVendorName     = vendorUtils.resolveVendorName;
var escapeRegExp          = vendorUtils.escapeRegExp;
var isPromptCopyBpmnPath  = vendorUtils.isPromptCopyBpmnPath;

// ----------------------------------------------------------------
// 製造ベンダー判定
// ----------------------------------------------------------------
// detectVendor / resolveVendorName は bpmn-reflector-utils.js に集約している（bpmn-specs-reflector.js と共通）。

// ----------------------------------------------------------------
// 1. routing-jssp-config から file-mapping の path を収集
// ----------------------------------------------------------------
/**
 * @param {string} configDir  src/main/conf/routing-jssp-config/
 * @returns {{ [xmlFileName: string]: string }}  { "xxx.xml": "/feature/path" }
 */
function collectRoutingPaths(configDir) {
  var result = {};
  fs.readdirSync(configDir).forEach(function(file) {
    if (path.extname(file) !== '.xml') return;
    var xml = fs.readFileSync(path.join(configDir, file), 'utf-8');
    var m = xml.match(/file-mapping[^>]+path="([^"]+)"/);
    if (m) result[file] = m[1];
  });
  return result;
}

// ----------------------------------------------------------------
// 2. 開始イベントへ formKey を付与
//    formKey="forward:<機能パス>"
// ----------------------------------------------------------------
/**
 * IM-BPM 製は activiti:formKey、iGrafx・その他は formKey を用いる。
 * @param {string} xml          BPMN XML 文字列
 * @param {string} eventId      開始イベントの id 属性値
 * @param {string} featurePath  routing-jssp-config の path 値
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applyStartEventFormKey(xml, eventId, featurePath, vendor) {
  var attrName = resolveVendorName(vendor, 'formKey');
  var pattern = new RegExp(
    '(<(?:bpmn:)?startEvent\\b[^>]*?id="' + escapeRegExp(eventId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function(match, open, close) {
    if (open.indexOf(attrName + '=') !== -1) return match;
    return open + ' ' + attrName + '="forward:' + featurePath + '"' + close;
  });
}

// ----------------------------------------------------------------
// 3. ユーザタスクへ formKey を付与
//    formKey="forward:<機能パス>?processInstanceId=...&<pk>=..."
// ----------------------------------------------------------------
/**
 * IM-BPM 製は activiti:formKey、iGrafx・その他は formKey を用いる。
 * @param {string} xml
 * @param {string} taskId
 * @param {string} featurePath
 * @param {{ param: string, varName: string } | null} pk  主キー情報（任意）
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applyUserTaskFormKey(xml, taskId, featurePath, pk, vendor) {
  var attrName = resolveVendorName(vendor, 'formKey');
  var formKey = 'forward:' + featurePath
    + '?processInstanceId=${execution.processInstanceId}';

  if (pk) {
    // XML属性値として埋め込むため & は &amp;、EL式内の " は &quot; にエスケープする
    formKey += '&amp;' + pk.param + '=${execution.getVariable(&quot;' + pk.varName + '&quot;)}';
  }

  var pattern = new RegExp(
    '(<(?:bpmn:)?userTask\\b[^>]*?id="' + escapeRegExp(taskId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function(match, open, close) {
    if (open.indexOf(attrName + '=') !== -1) return match;
    return open + ' ' + attrName + '="' + formKey + '"' + close;
  });
}

// ----------------------------------------------------------------
// 4. メイン反映処理
// ----------------------------------------------------------------
/**
 * @param {string} bpmnPath         対象 BPMN ファイルパス
 * @param {string} routingConfigDir routing-jssp-config ディレクトリパス
 * @param {ReflectMapping[]} mappings 反映定義リスト
 *
 * @typedef {Object} ReflectMapping
 * @property {'startEvent'|'userTask'} type
 * @property {string} elementId       BPMN 要素の id
 * @property {string} routingXml      routing-jssp-config の XML ファイル名
 * @property {{ param: string, varName: string } | null} [pk]  ユーザタスクのみ
 */
function reflect(bpmnPath, routingConfigDir, mappings) {
  if (!isPromptCopyBpmnPath(bpmnPath)) {
    throw new Error('reflect is allowed only for copied BPMN under doc/*-prompt/*.bpmn: ' + bpmnPath);
  }

  var paths = collectRoutingPaths(routingConfigDir);
  var xml   = fs.readFileSync(bpmnPath, 'utf-8');

  // ネームスペース宣言から製造ベンダーを判定し、以降の属性名分岐に用いる
  var vendor = detectVendor(xml);
  console.log('[VENDOR] detected: ' + vendor);

  mappings.forEach(function(m) {
    var featurePath = paths[m.routingXml];
    if (!featurePath) {
      console.warn('[SKIP] routing XML not found: ' + m.routingXml);
      return;
    }
    if (m.type === 'startEvent') {
      xml = applyStartEventFormKey(xml, m.elementId, featurePath, vendor);
    } else if (m.type === 'userTask') {
      xml = applyUserTaskFormKey(xml, m.elementId, featurePath, m.pk || null, vendor);
    }
  });

  fs.writeFileSync(bpmnPath, xml, 'utf-8');
  console.log('[DONE] ' + bpmnPath);
}

module.exports = { reflect, detectVendor, collectRoutingPaths, applyStartEventFormKey, applyUserTaskFormKey };
