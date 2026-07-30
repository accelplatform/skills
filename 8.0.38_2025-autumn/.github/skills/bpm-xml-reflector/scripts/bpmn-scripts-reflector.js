'use strict';

var fs   = require('fs');
var path = require('path');

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
 * @param {string} xml          BPMN XML 文字列
 * @param {string} eventId      開始イベントの id 属性値
 * @param {string} featurePath  routing-jssp-config の path 値
 * @returns {string}
 */
function applyStartEventFormKey(xml, eventId, featurePath) {
  var pattern = new RegExp(
    '(<startEvent\\b[^>]*?id="' + escapeRegExp(eventId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function(match, open, close) {
    if (open.indexOf('formKey') !== -1) return match;
    return open + ' formKey="forward:' + featurePath + '"' + close;
  });
}

// ----------------------------------------------------------------
// 3. ユーザタスクへ formKey を付与
//    formKey="forward:<機能パス>?processInstanceId=...&<pk>=..."
// ----------------------------------------------------------------
/**
 * @param {string} xml
 * @param {string} taskId
 * @param {string} featurePath
 * @param {{ param: string, varName: string } | null} pk  主キー情報（任意）
 * @returns {string}
 */
function applyUserTaskFormKey(xml, taskId, featurePath, pk) {
  var formKey = 'forward:' + featurePath
    + '?processInstanceId=${execution.processInstanceId}';

  if (pk) {
    formKey += '&' + pk.param + '=${execution.getVariable("' + pk.varName + '")}';
  }

  var pattern = new RegExp(
    '(<userTask\\b[^>]*?id="' + escapeRegExp(taskId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function(match, open, close) {
    if (open.indexOf('formKey') !== -1) return match;
    return open + ' formKey="' + formKey + '"' + close;
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
  var paths = collectRoutingPaths(routingConfigDir);
  var xml   = fs.readFileSync(bpmnPath, 'utf-8');

  mappings.forEach(function(m) {
    var featurePath = paths[m.routingXml];
    if (!featurePath) {
      console.warn('[SKIP] routing XML not found: ' + m.routingXml);
      return;
    }
    if (m.type === 'startEvent') {
      xml = applyStartEventFormKey(xml, m.elementId, featurePath);
    } else if (m.type === 'userTask') {
      xml = applyUserTaskFormKey(xml, m.elementId, featurePath, m.pk || null);
    }
  });

  fs.writeFileSync(bpmnPath, xml, 'utf-8');
  console.log('[DONE] ' + bpmnPath);
}

// ----------------------------------------------------------------
// ユーティリティ
// ----------------------------------------------------------------
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { reflect, collectRoutingPaths, applyStartEventFormKey, applyUserTaskFormKey };
