'use strict';

// ----------------------------------------------------------------
// search-called-elements.js / validate-bpmn.js / validate-process-key-replacement.js
// 共通ユーティリティ（bpmn-moddle ベースの型判定・XML解析・要素探索）
// ----------------------------------------------------------------

const fs = require('fs');
const BpmnModdle = require('bpmn-moddle');

/**
 * BPMN要素の $type からネームスペースプレフィックスを除いた型名を取得する。
 * 例: 'bpmn:StartEvent' -> 'StartEvent'
 * @param {Object} element
 * @returns {string}
 */
function nsType(element) {
  if (!element || !element.$type) return '';
  const i = element.$type.indexOf(':');
  return i >= 0 ? element.$type.slice(i + 1) : element.$type;
}

/**
 * BPMN XML 文字列を bpmn-moddle でパースし、definitions（rootElement）を返す。
 * 警告・パースコンテキストが不要な用途向けの簡易ラッパー。
 * @param {string} xml
 * @returns {Promise<Object>}
 */
async function parseBpmnXml(xml) {
  const moddle = new BpmnModdle();
  const parsed = await moddle.fromXML(xml);
  return parsed && parsed.rootElement ? parsed.rootElement : parsed;
}

/**
 * BPMN ファイルを読み込み、bpmn-moddle でパースして definitions（rootElement）を返す。
 * @param {string} filePath
 * @returns {Promise<Object>}
 */
async function readAndParseBpmnFile(filePath) {
  const xml = fs.readFileSync(filePath, 'utf8');
  return parseBpmnXml(xml);
}

/**
 * ルート要素以下を再帰的に探索し、selector に一致する要素を out に集める。
 * selector は単純な型名（例: 'CallActivity'）と 'ns:Type' 形式（例: 'bpmn:Process'）の両方を受け付ける。
 * @param {Object} root
 * @param {string} selector
 * @param {Object[]} out
 */
function findElements(root, selector, out) {
  if (!root || typeof root !== 'object') return;
  const targetType = selector && selector.indexOf(':') >= 0 ? selector.split(':')[1] : selector;

  if (root.$type) {
    const t = nsType(root);
    if (selector === root.$type || targetType === t) {
      out.push(root);
    }
  }

  Object.keys(root).forEach(key => {
    const value = root[key];
    if (!value) return;

    if (Array.isArray(value)) {
      for (const child of value) {
        if (child && typeof child === 'object') findElements(child, selector, out);
      }
      return;
    }

    if (typeof value === 'object' && value.$type) {
      findElements(value, selector, out);
    }
  });
}

module.exports = {
  nsType,
  parseBpmnXml,
  readAndParseBpmnFile,
  findElements
};
