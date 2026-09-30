'use strict';

// ----------------------------------------------------------------
// bpmn-specs-reflector.js / bpmn-scripts-reflector.js 共通ユーティリティ
// ----------------------------------------------------------------

/** @typedef {'im-bpm'|'igrafx'|'other'} BpmnVendor */

/**
 * BPMN XML のネームスペース宣言から製造ベンダーを判定する。
 * - xmlns:activiti="http://activiti.org/bpmn" を含む → IM-BPM 製（'im-bpm'）
 * - ネームスペース URI に "www.igrafx.com" を含む → iGrafx 製（'igrafx'）
 * - 上記いずれにも該当しない → その他（'other'）
 * @param {string} xml
 * @returns {BpmnVendor}
 */
function detectVendor(xml) {
  if (/xmlns:activiti\s*=\s*"http:\/\/activiti\.org\/bpmn"/.test(xml)) {
    return 'im-bpm';
  }
  if (/xmlns:[^=\s]+\s*=\s*"[^"]*www\.igrafx\.com[^"]*"/i.test(xml)) {
    return 'igrafx';
  }
  return 'other';
}

/**
 * ベンダーに応じた属性名・タグ名を解決する。
 * IM-BPM 製のみ 'activiti:' プレフィックスを付与し、iGrafx・その他はプレフィックス無しとする。
 * @param {BpmnVendor} vendor
 * @param {string} name  無印の属性名・タグ名（例: 'candidateStarterGroups'）
 * @returns {string}
 */
function resolveVendorName(vendor, name) {
  return vendor === 'im-bpm' ? 'activiti:' + name : name;
}

/**
 * 正規表現の特殊文字をエスケープする。
 * @param {string} s
 * @returns {string}
 */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * BPMN ファイルパスが仕様書ディレクトリ配下のコピー BPMN（反映を許可する対象）かを判定する。
 * 許可: doc/*-prompt/*.bpmn（反映先。コピー先）
 * 禁止: doc/*.bpmn（反映元。コピー元。絶対に書き換えない）
 * bpmn-specs-reflector.js（reflectFixes 等）と bpmn-scripts-reflector.js（reflect）の
 * 両方から、BPMN への書き込み前の共通ガードとして呼び出す。
 * @param {string} bpmnPath
 * @returns {boolean}
 */
function isPromptCopyBpmnPath(bpmnPath) {
  if (!bpmnPath) return false;
  var normalized = String(bpmnPath).replace(/\\/g, '/');
  return /(?:^|\/)doc\/[^/]+-prompt\/[^/]+\.bpmn$/i.test(normalized);
}

module.exports = {
  detectVendor,
  resolveVendorName,
  escapeRegExp,
  isPromptCopyBpmnPath
};
