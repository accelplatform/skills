'use strict';

var fs = require('fs');
var path = require('path');
var vendorUtils = require('./bpmn-reflector-utils');

var detectVendor = vendorUtils.detectVendor;
var resolveVendorName = vendorUtils.resolveVendorName;
var escapeRegExp = vendorUtils.escapeRegExp;
var isPromptCopyBpmnPath = vendorUtils.isPromptCopyBpmnPath;

// ----------------------------------------------------------------
// カラーマップ（タスク種別 → 16進カラーコード）
// ----------------------------------------------------------------
var TASK_COLORS = {
  userTask: 'bbdefb',
  scriptTask: 'fff9c4',
  serviceTask: 'f9dcc0',
  mailTask: 'f7c9cf',
  manualTask: 'b2dfdb',
  receiveTask: 'e0caf7',
  callActivity: 'f9c0e4'
};

// ----------------------------------------------------------------
// 製造ベンダー判定
// ----------------------------------------------------------------
// detectVendor / resolveVendorName は bpmn-reflector-utils.js に集約している（bpmn-scripts-reflector.js と共通）。

/**
 * タグの存在チェック等に使う正規表現断片を解決する。
 * @param {string} name  無印のタグ名（例: 'dataObject'）
 * @returns {string}  正規表現の一部として使える文字列
 */
function resolveTagNamePattern(name) {
  return '(?:bpmn:)?' + name;
}

/**
 * トップレベル要素（dataObject/signal/message）のタグ名をベンダーに応じて解決する。
 * これらは Activiti 拡張属性（candidateGroups 等）とは異なり BPMN2 標準要素であるため、
 * IM-BPM 製でも 'activiti:' ではなく 'bpmn:' プレフィックスを用いる。
 * IM-BPM 製は bpmn:xxx、iGrafx・その他はプレフィックス無しの xxx を用いる。
 * @param {BpmnVendor} vendor
 * @param {string} name  無印のタグ名（例: 'dataObject'）
 * @returns {string}
 */
function resolveElementTagName(vendor, name) {
  return vendor === 'im-bpm' ? 'bpmn:' + name : name;
}

// ----------------------------------------------------------------
// 属性追加系
// ----------------------------------------------------------------

/**
 * <process> タグに candidateStarterGroups 属性を付与する。
 * IM-BPM 製は activiti:candidateStarterGroups、iGrafx・その他は candidateStarterGroups を用いる。
 * @param {string} xml
 * @param {string} processId  process の id 属性値
 * @param {string} roleId
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applyProcessCandidateStarterGroups(xml, processId, roleId, vendor) {
  var attrName = resolveVendorName(vendor, 'candidateStarterGroups');
  var pattern = new RegExp(
    '(<(?:bpmn:)?process\\b[^>]*?id="' + escapeRegExp(processId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function (match, open, close) {
    if (open.indexOf(attrName + '=') !== -1) return match;
    return open + ' ' + attrName + '="' + roleId + '"' + close;
  });
}

/**
 * <lane> タグに candidateGroups 属性を付与する。
 * IM-BPM 製は activiti:candidateGroups、iGrafx・その他は candidateGroups を用いる。
 * @param {string} xml
 * @param {string} laneId  lane の id 属性値
 * @param {string} roleId
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applyLaneCandidateGroups(xml, laneId, roleId, vendor) {
  var attrName = resolveVendorName(vendor, 'candidateGroups');
  var pattern = new RegExp(
    '(<(?:bpmn:)?lane\\b[^>]*?id="' + escapeRegExp(laneId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function (match, open, close) {
    if (open.indexOf(attrName + '=') !== -1) return match;
    return open + ' ' + attrName + '="' + roleId + '"' + close;
  });
}

/**
 * <userTask> タグに candidateGroups 属性を付与する。
 * IM-BPM 製は activiti:candidateGroups、iGrafx・その他は candidateGroups を用いる。
 * @param {string} xml
 * @param {string} taskId
 * @param {string} roleId
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applyUserTaskCandidateGroups(xml, taskId, roleId, vendor) {
  var attrName = resolveVendorName(vendor, 'candidateGroups');
  var pattern = new RegExp(
    '(<(?:bpmn:)?userTask\\b[^>]*?id="' + escapeRegExp(taskId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function (match, open, close) {
    if (open.indexOf(attrName + '=') !== -1) return match;
    return open + ' ' + attrName + '="' + roleId + '"' + close;
  });
}

/**
 * タスクタグに color 属性を付与する。
 * タスク種別に応じてカラーコードを自動決定する。
 * IM-BPM 製は activiti:color、iGrafx・その他は color を用いる。
 * @param {string} xml
 * @param {string} taskId    対象タスクの id 属性値
 * @param {string} taskType  'userTask' | 'scriptTask' | 'serviceTask' |
 *                           'mailTask' | 'manualTask' | 'receiveTask' | 'callActivity'
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applyTaskColor(xml, taskId, taskType, vendor) {
  var color = TASK_COLORS[taskType];
  if (!color) {
    console.warn('[SKIP] unknown taskType: ' + taskType);
    return xml;
  }
  var attrName = resolveVendorName(vendor, 'color');
  // タスク種別を問わず id で特定する
  var pattern = new RegExp(
    '(<(?:bpmn:)?(?:userTask|scriptTask|serviceTask|manualTask|receiveTask|callActivity)\\b[^>]*?id="'
    + escapeRegExp(taskId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function (match, open, close) {
    if (open.indexOf(attrName + '=') !== -1) return match;
    return open + ' ' + attrName + '="' + color + '"' + close;
  });
}

/**
 * タスクタグに isOptional="true" 属性を付与する。
 * IM-BPM 製は activiti:isOptional、iGrafx・その他は isOptional を用いる。
 * @param {string} xml
 * @param {string} taskId  対象タスクの id 属性値
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applyIsOptional(xml, taskId, vendor) {
  var attrName = resolveVendorName(vendor, 'isOptional');
  var pattern = new RegExp(
    '(<(?:bpmn:)?(?:userTask|scriptTask|serviceTask|manualTask|receiveTask|callActivity)\\b[^>]*?id="'
    + escapeRegExp(taskId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function (match, open, close) {
    if (open.indexOf(attrName + '=') !== -1) return match;
    return open + ' ' + attrName + '="true"' + close;
  });
}

/**
 * 任意の要素（タグ種別を問わない）に属性を追加・更新する。
 * `spec-to-bpmn-fixes.json` の operation: "set-attribute" から呼び出される汎用関数。
 * 既存の apply* 系と異なり、属性が既に存在する場合は値を上書きする（追加専用・冪等ではない）。
 * @param {string} xml
 * @param {string} elementId  対象要素の id 属性値
 * @param {string} attrName   属性名（例: "activiti:initiator", "calledElement"）
 * @param {string} attrValue
 * @returns {string}
 */
function applyAttribute(xml, elementId, attrName, attrValue) {
  var pattern = new RegExp(
    '(<[\\w:]+\\b[^>]*?\\bid="' + escapeRegExp(elementId) + '"[^>]*?)(/>|>)'
  );
  if (!pattern.test(xml)) {
    console.warn('[SKIP] element not found: ' + elementId);
    return xml;
  }
  var attrPattern = new RegExp('\\b' + escapeRegExp(attrName) + '="[^"]*"');
  return xml.replace(pattern, function (match, open, close) {
    if (attrPattern.test(open)) {
      return open.replace(attrPattern, attrName + '="' + attrValue + '"') + close;
    }
    return open + ' ' + attrName + '="' + attrValue + '"' + close;
  });
}

// ----------------------------------------------------------------
// 子要素挿入系
// ----------------------------------------------------------------

// refType（イベント定義の参照属性名） → イベント定義タグ名の対応表
var EVENT_DEFINITION_TAGS = {
  messageRef: 'messageEventDefinition',
  signalRef: 'signalEventDefinition',
  errorRef: 'errorEventDefinition'
};

/**
 * イベント要素（startEvent/endEvent/boundaryEvent/intermediateCatchEvent/intermediateThrowEvent 等）が
 * 内包するイベント定義タグに、messageRef/signalRef/errorRef を追加・更新する。
 * `spec-to-bpmn-fixes.json` の operation: "set-eventdef-ref" から呼び出される。
 * 対象要素が自己終了タグ（イベント定義を内包できない）の場合は反映せずスキップする。
 * @param {string} xml
 * @param {string} elementId  対象イベント要素の id 属性値
 * @param {string} refType    'messageRef' | 'signalRef' | 'errorRef'
 * @param {string} refId      参照先定義（message/signal/error）の id
 * @returns {string}
 */
function applyEventDefinitionRef(xml, elementId, refType, refId) {
  var defTag = EVENT_DEFINITION_TAGS[refType];
  if (!defTag) {
    console.warn('[SKIP] unknown refType: ' + refType);
    return xml;
  }

  var openPattern = new RegExp(
    '<((?:bpmn:)?\\w*Event)\\b[^>]*?id="' + escapeRegExp(elementId) + '"[^>]*?>'
  );
  var openMatch = openPattern.exec(xml);
  if (!openMatch) {
    console.warn('[SKIP] event element not found (or is self-closing): ' + elementId);
    return xml;
  }

  var tagName = openMatch[1];
  var insertPos = openMatch.index + openMatch[0].length;
  var prefix = xml.slice(0, insertPos);
  var rest = xml.slice(insertPos);

  var closePattern = new RegExp('</' + escapeRegExp(tagName) + '>');
  var closeIdx = rest.search(closePattern);
  if (closeIdx === -1) {
    console.warn('[SKIP] closing tag not found for: ' + elementId);
    return xml;
  }

  var body = rest.slice(0, closeIdx);
  var suffix = rest.slice(closeIdx);

  var defPattern = new RegExp('(<(?:bpmn:)?' + defTag + '\\b[^>]*?)(/>|>)');
  var defMatch = defPattern.exec(body);
  if (!defMatch) {
    console.warn('[SKIP] ' + defTag + ' not found in element: ' + elementId);
    return xml;
  }

  var refPattern = new RegExp('\\b' + refType + '="[^"]*"');
  var newOpen = refPattern.test(defMatch[1])
    ? defMatch[1].replace(refPattern, refType + '="' + refId + '"')
    : defMatch[1] + ' ' + refType + '="' + refId + '"';

  body = body.slice(0, defMatch.index) + newOpen + defMatch[2] + body.slice(defMatch.index + defMatch[0].length);

  return prefix + body + suffix;
}

/**
 * サービスタスク（ServiceTask）の activiti:field 値を追加・更新する。
 * `spec-to-bpmn-fixes.json` の operation: "set-service-task-field" から呼び出される。
 * 対象の field が既存の extensionElements 内にあれば値を上書きし、無ければ field（および
 * 必要であれば extensionElements）を新規作成する。
 * @param {string} xml
 * @param {string} taskId     対象 ServiceTask の id 属性値
 * @param {string} fieldName  activiti:field の name 属性値（例: "flowId", "to", "text"）
 * @param {string} fieldValue
 * @returns {string}
 */
function applyServiceTaskField(xml, taskId, fieldName, fieldValue) {
  var openPattern = new RegExp(
    '<((?:bpmn:)?serviceTask)\\b[^>]*?id="' + escapeRegExp(taskId) + '"[^>]*?>'
  );
  var openMatch = openPattern.exec(xml);
  if (!openMatch) {
    console.warn('[SKIP] serviceTask not found (or is self-closing): ' + taskId);
    return xml;
  }

  var tagName = openMatch[1];
  var insertPos = openMatch.index + openMatch[0].length;
  var prefix = xml.slice(0, insertPos);
  var rest = xml.slice(insertPos);

  var closePattern = new RegExp('</' + escapeRegExp(tagName) + '>');
  var closeIdx = rest.search(closePattern);
  if (closeIdx === -1) {
    console.warn('[SKIP] closing tag not found for: ' + taskId);
    return xml;
  }

  var body = rest.slice(0, closeIdx);
  var suffix = rest.slice(closeIdx);

  var fieldPattern = new RegExp(
    '(<activiti:field\\b[^>]*?name="' + escapeRegExp(fieldName) + '"[^>]*?>)([\\s\\S]*?)(</activiti:field>)'
  );
  var fieldSelfPattern = new RegExp(
    '<activiti:field\\b[^>]*?name="' + escapeRegExp(fieldName) + '"[^>]*?/\\s*>'
  );
  var newFieldTag = '<activiti:field name="' + fieldName + '">'
    + '<activiti:string>' + fieldValue + '</activiti:string>'
    + '</activiti:field>';

  if (fieldPattern.test(body)) {
    body = body.replace(fieldPattern, newFieldTag);
  } else if (fieldSelfPattern.test(body)) {
    body = body.replace(fieldSelfPattern, newFieldTag);
  } else {
    var extPattern = /(<(?:bpmn:)?extensionElements\b[^>]*?>)([\s\S]*?)(<\/(?:bpmn:)?extensionElements>)/;
    var extMatch = extPattern.exec(body);
    if (extMatch) {
      body = body.slice(0, extMatch.index)
        + extMatch[1] + extMatch[2] + '\n      ' + newFieldTag + '\n    ' + extMatch[3]
        + body.slice(extMatch.index + extMatch[0].length);
    } else {
      body = '\n    <extensionElements>\n      ' + newFieldTag + '\n    </extensionElements>' + body;
    }
  }

  return prefix + body + suffix;
}

// timerEventDefinition の周期・日時・期間を表す子要素タグ名（いずれか1つが必須）
var TIMER_DEFINITION_CHILD_TAGS = ['timeCycle', 'timeDate', 'timeDuration'];

/**
 * イベント要素（startEvent/intermediateCatchEvent/boundaryEvent 等）が内包する
 * timerEventDefinition に、周期・日時・期間（timeCycle/timeDate/timeDuration）の子要素、
 * および IM-BPM 独自ミニ DSL 属性 activiti:businessCalendarName を追加・更新する。
 * `spec-to-bpmn-fixes.json` の operation: "set-timer-definition" から呼び出される。
 * 対象要素が自己終了タグ（イベント定義を内包できない）、または timerEventDefinition が
 * 存在しない場合は反映せずスキップする。
 * @param {string} xml
 * @param {string} ownerId  対象イベント要素の id 属性値
 * @param {Object} params
 * @param {string} [params.timeCycle]      周期（ISO 8601 repeating interval）
 * @param {string} [params.timeDate]       日時（ISO 8601 date）
 * @param {string} [params.timeDuration]   期間（ISO 8601 duration）
 * @param {string} [params.businessCalendarName]  IM-BPM ミニ DSL 文字列
 * @returns {string}
 */
function applyTimerDefinition(xml, ownerId, params) {
  params = params || {};

  var openPattern = new RegExp(
    '<((?:bpmn:)?\\w*Event)\\b[^>]*?id="' + escapeRegExp(ownerId) + '"[^>]*?>'
  );
  var openMatch = openPattern.exec(xml);
  if (!openMatch) {
    console.warn('[SKIP] event element not found (or is self-closing): ' + ownerId);
    return xml;
  }

  var ownerTag = openMatch[1];
  var insertPos = openMatch.index + openMatch[0].length;
  var prefix = xml.slice(0, insertPos);
  var rest = xml.slice(insertPos);

  var closePattern = new RegExp('</' + escapeRegExp(ownerTag) + '>');
  var closeIdx = rest.search(closePattern);
  if (closeIdx === -1) {
    console.warn('[SKIP] closing tag not found for: ' + ownerId);
    return xml;
  }

  var ownerBody = rest.slice(0, closeIdx);
  var suffix = rest.slice(closeIdx);

  // timerEventDefinition タグ（開きタグ+子要素、または自己終了タグ）を特定する
  var timerOpenPattern = /<((?:bpmn:)?timerEventDefinition)\b([^>]*?)>([\s\S]*?)<\/(?:bpmn:)?timerEventDefinition>/;
  var timerSelfPattern = /<((?:bpmn:)?timerEventDefinition)\b([^>]*?)\/\s*>/;

  var timerTagName;
  var timerAttrs;
  var timerBody;
  var timerMatch = timerOpenPattern.exec(ownerBody);
  if (timerMatch) {
    timerTagName = timerMatch[1];
    timerAttrs = timerMatch[2];
    timerBody = timerMatch[3];
  } else {
    timerMatch = timerSelfPattern.exec(ownerBody);
    if (!timerMatch) {
      console.warn('[SKIP] timerEventDefinition not found in element: ' + ownerId);
      return xml;
    }
    timerTagName = timerMatch[1];
    timerAttrs = timerMatch[2];
    timerBody = '';
  }

  // activiti:businessCalendarName 属性の追加・更新
  if (params.businessCalendarName !== undefined) {
    var calendarAttrPattern = /\bactiviti:businessCalendarName="[^"]*"/;
    timerAttrs = calendarAttrPattern.test(timerAttrs)
      ? timerAttrs.replace(calendarAttrPattern, 'activiti:businessCalendarName="' + params.businessCalendarName + '"')
      : timerAttrs + ' activiti:businessCalendarName="' + params.businessCalendarName + '"';
  }

  // timeCycle/timeDate/timeDuration の子要素追加・更新（指定されたもののみ）
  TIMER_DEFINITION_CHILD_TAGS.forEach(function (childName) {
    if (params[childName] === undefined) return;
    var childPattern = new RegExp('<(?:bpmn:)?' + childName + '\\b[^>]*?>[\\s\\S]*?</(?:bpmn:)?' + childName + '>');
    var childSelfPattern = new RegExp('<(?:bpmn:)?' + childName + '\\b[^>]*?/\\s*>');
    var newChildTag = '<' + childName + '>' + params[childName] + '</' + childName + '>';

    if (childPattern.test(timerBody)) {
      timerBody = timerBody.replace(childPattern, newChildTag);
    } else if (childSelfPattern.test(timerBody)) {
      timerBody = timerBody.replace(childSelfPattern, newChildTag);
    } else {
      timerBody = timerBody + newChildTag;
    }
  });

  var newTimerTag = '<' + timerTagName + timerAttrs + '>' + timerBody + '</' + timerTagName + '>';
  ownerBody = ownerBody.slice(0, timerMatch.index) + newTimerTag + ownerBody.slice(timerMatch.index + timerMatch[0].length);

  return prefix + ownerBody + suffix;
}

/**
 * <process> ブロック内にプロセス変数（<dataObject>）を追加する。
 * 同じ id の <dataObject>（IM-BPM 製は <bpmn:dataObject>）が既にある場合はスキップする。
 * IM-BPM 製は bpmn:dataObject、iGrafx・その他は dataObject を用いる。
 * @param {string} xml
 * @param {string} processId
 * @param {{ id: string, name: string, type: string }[]} variables
 *   type: 'string' | 'int' | 'long' | 'double' | 'datetime' | 'boolean'
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applyDataObjects(xml, processId, variables, vendor) {
  var tagName = resolveElementTagName(vendor, 'dataObject');
  var tagPattern = resolveTagNamePattern('dataObject');

  // まず対象 processId のブロック範囲を特定して操作する
  var openPattern = new RegExp(
    '<(?:bpmn:)?process\\b[^>]*?id="' + escapeRegExp(processId) + '"[^>]*?>'
  );
  var openMatch = openPattern.exec(xml);
  if (!openMatch) {
    console.warn('[SKIP] process not found: ' + processId);
    return xml;
  }

  var insertPos = openMatch.index + openMatch[0].length;
  var prefix = xml.slice(0, insertPos);
  var rest = xml.slice(insertPos);

  // 対応する </process> を探して分割
  var closePattern = /<\/(?:bpmn:)?process>/;
  var closeIdx = rest.search(closePattern);
  if (closeIdx === -1) {
    console.warn('[SKIP] closing </process> not found for: ' + processId);
    return xml;
  }

  var processBody = rest.slice(0, closeIdx);
  var suffix = rest.slice(closeIdx);

  // 挿入する dataObject タグを組み立てる（既存 id・呼び出し内での重複はスキップ）
  var newTags = '';
  var checkBody = processBody;
  variables.forEach(function (v) {
    var existsPattern = new RegExp('<' + tagPattern + '\\b[^>]*?id="' + escapeRegExp(v.id) + '"');
    if (existsPattern.test(checkBody)) {
      console.warn('[SKIP] dataObject already exists: ' + v.id);
      return;
    }
    var tag = '\n    <' + tagName + ' id="' + v.id
      + '" name="' + v.name
      + '" itemSubjectRef="xsd:' + v.type + '"/>';
    newTags += tag;
    checkBody += tag;
  });

  if (!newTags) {
    return prefix + processBody + suffix;
  }

  // レーン有無で挿入位置を切り替える
  //   レーン有: </laneSet>（IM-BPM 製は </bpmn:laneSet>）の直後に並列で追加
  //   レーン無: <process> 開始タグの直後（先頭の子要素）に追加
  var laneSetPattern = /<(?:bpmn:)?laneSet\b[^>]*?>[\s\S]*?<\/(?:bpmn:)?laneSet>/;
  var laneSetMatch = laneSetPattern.exec(processBody);

  var newProcessBody;
  if (laneSetMatch) {
    var laneSetEnd = laneSetMatch.index + laneSetMatch[0].length;
    newProcessBody = processBody.slice(0, laneSetEnd) + newTags + processBody.slice(laneSetEnd);
  } else {
    newProcessBody = newTags + processBody;
  }

  return prefix + newProcessBody + suffix;
}

/**
 * <sequenceFlow> に <conditionExpression> を追加する。
 * 自己終了タグの場合は展開して挿入する。
 * 既に <conditionExpression> がある場合はスキップする。
 * IM-BPM 製は <bpmn:conditionExpression>、iGrafx・その他は <conditionExpression>（プレフィックス無し）を用いる。
 * 閉じタグの sequenceFlow は、ベンダーに関わらず開始タグのプレフィックスと同じものにする。
 * @param {string} xml
 * @param {string} flowId    sequenceFlow の id 属性値
 * @param {string} expression  EL 式（例: "${approved == 'true'}"）
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applyConditionExpression(xml, flowId, expression, vendor) {
  var condTagName = vendor === 'im-bpm' ? 'bpmn:conditionExpression' : 'conditionExpression';

  // 自己終了タグ: <(bpmn:)?sequenceFlow ... id="xxx" ... />
  var selfPattern = new RegExp(
    '<((?:bpmn:)?)sequenceFlow\\b[^>]*?id="' + escapeRegExp(flowId) + '"[^>]*?/\\s*>'
  );
  // 開きタグ＋ボディ: <(bpmn:)?sequenceFlow ... id="xxx" ... >...</(bpmn:)?sequenceFlow>
  var openPattern = new RegExp(
    '(<((?:bpmn:)?)sequenceFlow\\b[^>]*?id="' + escapeRegExp(flowId) + '"[^>]*?>)'
    + '([\\s\\S]*?)'
    + '</(?:bpmn:)?sequenceFlow>'
  );

  var condTag = '\n      <' + condTagName + '>' + expression + '</' + condTagName + '>\n    ';

  // 自己終了タグのケース：開始タグと同じプレフィックスの閉じタグを付けて展開する
  var selfMatch = selfPattern.exec(xml);
  if (selfMatch) {
    var selfPrefix = selfMatch[1];
    var openTag = selfMatch[0].replace(/\/\s*>$/, '>');
    var expanded = openTag + condTag + '</' + selfPrefix + 'sequenceFlow>';
    return xml.slice(0, selfMatch.index) + expanded + xml.slice(selfMatch.index + selfMatch[0].length);
  }

  // 開きタグ＋ボディのケース：閉じタグは開始タグと同じプレフィックスにする
  var openMatch = openPattern.exec(xml);
  if (!openMatch) return xml;
  if (openMatch[3].indexOf('conditionExpression') !== -1) return xml;
  var openTagFull = openMatch[1];
  var openPrefix = openMatch[2];
  var body = openMatch[3];
  var newBlock = openTagFull + body + condTag + '</' + openPrefix + 'sequenceFlow>';
  return xml.slice(0, openMatch.index) + newBlock + xml.slice(openMatch.index + openMatch[0].length);
}

// ----------------------------------------------------------------
// トップレベル要素挿入系
// ----------------------------------------------------------------

/**
 * <signal> 要素を <process> の直前に挿入する。
 * 同じ id の <signal>（IM-BPM 製は <bpmn:signal>）が既にある場合はスキップする。
 * IM-BPM 製は bpmn:signal、iGrafx・その他は signal を用いる。
 * @param {string} xml
 * @param {string} signalId
 * @param {string} signalName
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applySignal(xml, signalId, signalName, vendor) {
  var tagName = resolveElementTagName(vendor, 'signal');
  var tagPattern = resolveTagNamePattern('signal');
  var existsPattern = new RegExp('<' + tagPattern + '\\b[^>]*?id="' + escapeRegExp(signalId) + '"');
  if (existsPattern.test(xml)) {
    console.warn('[SKIP] signal already exists: ' + signalId);
    return xml;
  }
  var tag = '<' + tagName + ' id="' + signalId + '" name="' + signalName + '"/>';
  return insertBeforeFirstProcess(xml, tag);
}

/**
 * <message> 要素を <process> の直前に挿入する。
 * 同じ id の <message>（IM-BPM 製は <activiti:message>）が既にある場合はスキップする。
 * IM-BPM 製は activiti:message、iGrafx・その他は message を用いる。
 * @param {string} xml
 * @param {string} messageId
 * @param {string} messageName
 * @param {BpmnVendor} [vendor]  製造ベンダー（省略時は 'other' 扱い）
 * @returns {string}
 */
function applyMessage(xml, messageId, messageName, vendor) {
  var tagName = resolveVendorName(vendor, 'message');
  var tagPattern = resolveTagNamePattern('message');
  var existsPattern = new RegExp('<' + tagPattern + '\\b[^>]*?id="' + escapeRegExp(messageId) + '"');
  if (existsPattern.test(xml)) {
    console.warn('[SKIP] message already exists: ' + messageId);
    return xml;
  }
  var tag = '<' + tagName + ' id="' + messageId + '" name="' + messageName + '"/>';
  return insertBeforeFirstProcess(xml, tag);
}

// ----------------------------------------------------------------
// メイン反映処理
// ----------------------------------------------------------------
//
// 仕様書の内容を BPMN XML へ反映する入口は `reflectFixes()` に一本化されている。
// 反映内容の判断（何を・どの要素へ反映するか、process id 置換や callActivity 呼び出し先置換の
// from-to 確定を含む）は `spec-to-bpmn-fixes.json` 作成段階（bpm-docs-generator 側）で完了させ、
// 本ファイルは JSON の内容を機械的に XML へ書き込むことに専念する。
// 各 `applyXxx` 系関数は `applyFixToTarget()` 経由（`spec-to-bpmn-fixes.json` の `operation` 起点）で
// 呼び出されるが、単体テスト等の目的で直接呼び出すことも可能（module.exports 参照）。

// ----------------------------------------------------------------
// spec-to-bpmn-fixes.json 反映処理
// ----------------------------------------------------------------

// reflectFixes が自動反映を担当できる operation（それ以外は manual として反映対象外）
//
// 属性・フィールド値レベルの追加・更新系（validate-bpmn.js のエラー訂正案向け）:
//   set-attribute / set-eventdef-ref / set-service-task-field /
//   set-condition-expression / set-timer-definition
// 業務要件反映系（仕様書のアクター定義・プロセス変数・シグナル・メッセージ等の記載内容向け）:
//   set-role-starter-groups / set-lane-candidate-groups / set-usertask-candidate-groups /
//   set-task-color / add-data-object / add-signal / add-message
// プロセス定義キー・コールアクティビティ呼び出し先の置換系（検証・リトライ・トークン付与を伴う）:
//   replace-process-id / replace-callee-process
var SUPPORTED_FIX_OPERATIONS = [
  'set-attribute',
  'set-eventdef-ref',
  'set-service-task-field',
  'set-condition-expression',
  'set-timer-definition',
  'set-role-starter-groups',
  'set-lane-candidate-groups',
  'set-usertask-candidate-groups',
  'set-task-color',
  'add-data-object',
  'add-signal',
  'add-message',
  'replace-process-id',
  'replace-callee-process'
];

// reflectFixes 内で「メモリ上の検証・リトライ・トークン付与」を伴う特別扱いが必要な operation。
// 通常の operation は applyFixToTarget() 経由（1 target = 1 回の単純な文字列操作）で反映するが、
// これらは reflectFixes() のループ内で専用ロジックを呼び出す。
var VERIFIED_FIX_OPERATIONS = ['replace-process-id', 'replace-callee-process'];

/**
 * YYYY-MM-DD 形式の日付文字列を返す。
 * @param {Date} date
 * @returns {string}
 */
function formatFixDate(date) {
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

/**
 * 1件の訂正案（fix）を、その operation に応じて BPMN XML へ適用する。
 * @param {string} xml
 * @param {Object} fix     spec-to-bpmn-fixes.json の1エントリ
 * @param {Object} target  fix.targets の1要素（{ elementId, elementType }）
 * @param {BpmnVendor} vendor
 * @returns {string}
 */
function applyFixToTarget(xml, fix, target, vendor) {
  var params = fix.params || {};
  switch (fix.operation) {
    case 'set-attribute':
      return applyAttribute(xml, target.elementId, params.attrName, params.attrValue);
    case 'set-eventdef-ref':
      return applyEventDefinitionRef(xml, target.elementId, params.refType, params.refId);
    case 'set-service-task-field':
      var fields = params.fields || [{ name: params.fieldName, value: params.fieldValue }];
      fields.forEach(function (f) {
        xml = applyServiceTaskField(xml, target.elementId, f.name, f.value, vendor);
      });
      return xml;
    case 'set-condition-expression':
      return applyConditionExpression(xml, target.elementId, params.expression, vendor);
    case 'set-timer-definition':
      return applyTimerDefinition(xml, target.elementId, params);
    case 'set-role-starter-groups':
      return applyProcessCandidateStarterGroups(xml, target.elementId, params.roleId, vendor);
    case 'set-lane-candidate-groups':
      return applyLaneCandidateGroups(xml, target.elementId, params.roleId, vendor);
    case 'set-usertask-candidate-groups':
      xml = applyUserTaskCandidateGroups(xml, target.elementId, params.roleId, vendor);
      if (params.isOptional) {
        xml = applyIsOptional(xml, target.elementId, vendor);
      }
      return xml;
    case 'set-task-color':
      return applyTaskColor(xml, target.elementId, params.taskType, vendor);
    case 'add-data-object':
      return applyDataObjects(xml, target.elementId, params.variables || [], vendor);
    case 'add-signal':
      return applySignal(xml, params.id, params.name, vendor);
    case 'add-message':
      return applyMessage(xml, params.id, params.name, vendor);
    default:
      console.warn('[SKIP] unsupported operation: ' + fix.operation);
      return xml;
  }
}

/**
 * `spec-to-bpmn-fixes.json` を読み込み、反映可能な訂正案を対象 BPMN へ反映する。
 *
 * `bpm-xml-reflector` が仕様書の内容を BPMN へ反映する唯一の入口であり、本関数は
 * `spec-to-bpmn-fixes.json`（判断・確定済みの反映内容）を機械的に XML へ書き込むことに専念する。
 * どの内容を反映するか（validate-bpmn.js エラー訂正案、ロール・色・変数等の業務要件、
 * process id 置換・コールアクティビティ呼び出し先置換の from-to 確定を含む）の判断は、
 * 本関数の対象外（`bpm-docs-generator` 側で `spec-to-bpmn-fixes.json` を作成する段階）で完了している前提。
 *
 * 反映対象は `reflectStatus: "ready"` かつ `operation` が {@link SUPPORTED_FIX_OPERATIONS} に
 * 含まれるエントリのみ。`pending-confirmation` / `not-applicable`、および
 * `convert-event-type` / `delete-element` / `manual`（構造変更・削除・図形情報同期を伴う操作）は
 * 自動反映の対象外としてスキップする。
 *
 * `operation: "replace-process-id"` / `"replace-callee-process"`（{@link VERIFIED_FIX_OPERATIONS}）は、
 * 検証・最大2回のリトライ・トークン付与（`PROCESS_KEY_META` / `CALLEE_PROCESS_META`）を伴う特別処理として扱う。
 * 検証に失敗した場合は該当 fix のみ `skipped` に積み、他の fix の反映は継続する。
 *
 * `requiresApproval` が true のエントリは `options.onFixReflectionDetected` による承認が必須。
 * コールバック未指定の場合は反映せずスキップする（`replace-process-id` 等、破壊的操作の承認は
 * 本関数の呼び出し時点＝機械反映時に行う。仕様書確認段階でのユーザー問い合わせとは別の確認である）。
 *
 * 反映後、`reflectedDate` のみを更新して `spec-to-bpmn-fixes.json` を上書き保存する
 * （`reflectStatus` は判定根拠を残すため変更しない）。
 *
 * @param {string} bpmnPath   対象 BPMN ファイルパス（doc/*-prompt/*.bpmn 形式のみ許可）
 * @param {string} fixesPath  対象 spec-to-bpmn-fixes.json ファイルパス
 * @param {Object} [options]
 * @param {Function} [options.onFixReflectionDetected]  反映前のユーザ確認コールバック
 *   @param {Object} fix       反映対象の fix エントリ
 *   @param {Function} onApprove  承認時のコールバック（パラメータなし）
 *   @param {Function} onReject   拒否時のコールバック（パラメータなし）
 * @returns {{ applied: string[], skipped: { fixId: string, reason: string }[] }}
 */
function reflectFixes(bpmnPath, fixesPath, options) {
  options = options || {};
  if (!isPromptCopyBpmnPath(bpmnPath)) {
    throw new Error('reflectFixes is allowed only for copied BPMN under doc/*-prompt/*.bpmn: ' + bpmnPath);
  }

  var xml = fs.readFileSync(bpmnPath, 'utf-8');
  var vendor = detectVendor(xml);
  var fixes = JSON.parse(fs.readFileSync(fixesPath, 'utf-8'));

  var applied = [];
  var skipped = [];

  fixes.forEach(function (fix) {
    if (fix.reflectStatus !== 'ready') {
      skipped.push({ fixId: fix.fixId, reason: 'reflectStatus is not ready: ' + fix.reflectStatus });
      return;
    }
    if (SUPPORTED_FIX_OPERATIONS.indexOf(fix.operation) === -1) {
      skipped.push({ fixId: fix.fixId, reason: 'unsupported operation (manual reflection required): ' + fix.operation });
      return;
    }

    var params = fix.params || {};
    var applyFix;

    if (fix.operation === 'replace-process-id') {
      // Process ID 置換: 検証（最大2回リトライ）・PROCESS_KEY_META 付与を伴う特別処理。
      // params.fromId で置換対象を特定し、params.toId を置換値として書き込む。
      applyFix = function () {
        var replacement = { fromId: params.fromId, toId: params.toId, allowFromIdExists: params.allowFromIdExists };
        xml = applyVerifiedProcessIdReplacements(xml, [replacement]);
        fix.reflectedDate = formatFixDate(new Date());
        applied.push(fix.fixId);
      };
    } else if (fix.operation === 'replace-callee-process') {
      // コールアクティビティの呼び出し先プロセス置換: CALLEE_PROCESS_META 付与を伴う特別処理。
      // targets で対象 callActivity（elementId）を特定し、params.fromId/toId で calledElement を置換する。
      applyFix = function () {
        (fix.targets || []).forEach(function (target) {
          xml = applyCalleeProcessReplacement(xml, target.elementId, params.fromId, params.toId);
        });
        fix.reflectedDate = formatFixDate(new Date());
        applied.push(fix.fixId);
      };
    } else {
      applyFix = function () {
        (fix.targets || []).forEach(function (target) {
          xml = applyFixToTarget(xml, fix, target, vendor);
        });
        fix.reflectedDate = formatFixDate(new Date());
        applied.push(fix.fixId);
      };
    }

    // VERIFIED_FIX_OPERATIONS は検証失敗時に例外を throw しうるため、
    // 該当 fix のみを skipped に積んで他の fix の反映を継続させる。
    var runApplyFix = function () {
      try {
        applyFix();
      } catch (e) {
        console.error('[ERROR] failed to apply fix ' + fix.fixId + ': ' + e.message);
        skipped.push({ fixId: fix.fixId, reason: 'apply failed: ' + e.message });
      }
    };

    if (options.onFixReflectionDetected) {
      options.onFixReflectionDetected(fix, runApplyFix, function () {
        skipped.push({ fixId: fix.fixId, reason: 'user rejected' });
      });
    } else if (fix.requiresApproval === false) {
      runApplyFix();
    } else {
      skipped.push({ fixId: fix.fixId, reason: 'approval required but no confirmation callback provided' });
    }
  });

  if (applied.length > 0) {
    fs.writeFileSync(bpmnPath, xml, 'utf-8');
    fs.writeFileSync(fixesPath, JSON.stringify(fixes, null, 2) + '\n', 'utf-8');
  }

  console.log('[DONE] applied=' + applied.length + ' skipped=' + skipped.length);
  return { applied: applied, skipped: skipped };
}

/**
 * Process ID 置換をメモリ上で実施し、検証（最大2回リトライ）・PROCESS_KEY_META トークン付与まで行う。
 * ファイルへの書き込みは行わない（`reflectFixes()` の `replace-process-id` ケース、および
 * `reflectProcessIdReplacements()` の双方から呼び出される共通ロジック）。
 *
 * @param {string} xml
 * @param {{ fromId: string, toId: string, allowFromIdExists?: boolean }[]} replacements  置換内容
 * @returns {string}  置換・トークン付与後の XML
 * @throws {Error}  検証に失敗した場合（最大2回リトライ後も失敗）、
 *                   または REPOSITORY_OBJECT_ID が取得できない場合（`applyProcessKeyMetaToken` 参照）
 */
function applyVerifiedProcessIdReplacements(xml, replacements) {
  var replacedXml = xml;
  var maxAttempts = 2;
  var attempt = 0;
  var verifyError = null;

  while (attempt < maxAttempts) {
    replacedXml = xml;
    replacements.forEach(function (r) {
      if (r.fromId && r.toId) {
        replacedXml = replaceProcessId(replacedXml, r.fromId, r.toId);
      }
    });

    try {
      verifyProcessIdReplacements(replacedXml, replacements);
      verifyError = null;
      break;
    } catch (e) {
      verifyError = e;
      attempt += 1;
      if (attempt >= maxAttempts) {
        break;
      }
      console.warn('[RETRY] Process ID replacement verification failed. retry=' + attempt);
    }
  }

  if (verifyError) {
    throw verifyError;
  }

  // id 置換の検証に成功した場合のみ、PROCESS_KEY_META トークンを documentation として埋め込む。
  // REPOSITORY_OBJECT_ID が取得できない場合はここで例外が throw される
  // （検証リトライとは独立した失敗条件のため、リトライは行わない）。
  replacements.forEach(function (r) {
    if (r.fromId && r.toId) {
      replacedXml = applyProcessKeyMetaToken(replacedXml, r.fromId, r.toId);
    }
  });

  return replacedXml;
}

// ----------------------------------------------------------------
// XML 要素探索系
// ----------------------------------------------------------------

/**
 * XML 断片（body）内を走査し、直接の子要素（孫要素以下は除く）の中から、
 * 指定したローカル名（名前空間プレフィックスを除いたタグ名）に一致する最初の要素を返す。
 *
 * `documentation` 要素は process/callActivity 自身だけでなく、配下の userTask 等の
 * 子孫要素にも存在しうる。単純な正規表現（`/<documentation>...<\/documentation>/`）で
 * body 全体を検索すると、階層を区別できずに子孫要素側の documentation を誤って
 * ヒットしてしまう（PROCESS_KEY_META / CALLEE_PROCESS_META の挿入位置がずれる原因）。
 * 本関数は兄弟要素を1つずつ読み進めることで、直接の子要素だけを対象にする。
 *
 * 同名タグのネスト（例: 子孫に同じローカル名の要素が入れ子になっているケース）は
 * 開始・終了タグの出現回数で深さを数えて対応する。コメント（<!-- -->）・CDATA は非対応
 * （本ファイルが扱う BPMN の範囲では未使用のため）。
 *
 * @param {string} body       走査対象の XML 断片（あるタグの開始タグ直後〜終了タグ直前の中身）
 * @param {string} localName  探したい直接の子要素のローカル名（例: 'documentation'）
 * @returns {{ index: number, length: number, tagName: string, openTag: string, content: string, closeTag: string } | null}
 *   見つかった場合は元の body 内の範囲（index〜index+length）と、正規化した開始/終了タグ・中身。
 *   自己終了タグ（<documentation/>）だった場合も openTag/closeTag は展開した形で返す。
 */
function findDirectChildElement(body, localName) {
  var pos = 0;
  var startPattern = /<([\w:-]+)\b/g;

  while (pos < body.length) {
    startPattern.lastIndex = pos;
    var startMatch = startPattern.exec(body);
    if (!startMatch) return null;

    var tagName = startMatch[1];
    var tagStartIdx = startMatch.index;
    var localTagName = tagName.replace(/^[^:]+:/, '');

    var openTagPattern = new RegExp('^<' + escapeRegExp(tagName) + '\\b([^>]*?)(/)?>');
    var openTagMatch = openTagPattern.exec(body.slice(tagStartIdx));
    if (!openTagMatch) {
      // 開始タグとして解釈できない場合は1文字進めて再走査する
      pos = tagStartIdx + 1;
      continue;
    }

    var attrs = openTagMatch[1];
    var isSelfClosing = !!openTagMatch[2];
    var openTagLength = openTagMatch[0].length;

    if (isSelfClosing) {
      if (localTagName === localName) {
        return {
          index: tagStartIdx,
          length: openTagLength,
          tagName: tagName,
          openTag: '<' + tagName + attrs + '>',
          content: '',
          closeTag: '</' + tagName + '>'
        };
      }
      pos = tagStartIdx + openTagLength;
      continue;
    }

    // 対応する終了タグを、同名タグのネストを考慮して探す
    var siblingPattern = new RegExp('<(/?)' + escapeRegExp(tagName) + '\\b[^>]*?(/?)>', 'g');
    siblingPattern.lastIndex = tagStartIdx + openTagLength;
    var depth = 1;
    var closeMatch = null;
    var m;
    while ((m = siblingPattern.exec(body)) !== null) {
      if (m[1] === '/') {
        depth -= 1;
        if (depth === 0) {
          closeMatch = m;
          break;
        }
      } else if (!m[2]) {
        // 同名タグの開始タグ（自己終了ではない）→ ネストが深くなる
        depth += 1;
      }
      // 同名タグの自己終了タグはネスト深度に影響しない
    }

    if (!closeMatch) {
      // 閉じタグが見つからない（不正な XML）場合はこれ以上探索できない
      return null;
    }

    var contentStart = tagStartIdx + openTagLength;
    var elementEnd = closeMatch.index + closeMatch[0].length;

    if (localTagName === localName) {
      return {
        index: tagStartIdx,
        length: elementEnd - tagStartIdx,
        tagName: tagName,
        openTag: body.slice(tagStartIdx, contentStart),
        content: body.slice(contentStart, closeMatch.index),
        closeTag: closeMatch[0]
      };
    }

    pos = elementEnd;
  }

  return null;
}

/**
 * callActivity の呼び出し先プロセス（calledElement）を置換し、CALLEE_PROCESS_META トークンを
 * documentation として callActivity 直下に追加する。
 * `spec-to-bpmn-fixes.json` の operation: "replace-callee-process" から呼び出される。
 * 既に CALLEE_PROCESS_META トークンが存在する場合は重複追加を避けるためスキップする。
 *
 * @param {string} xml
 * @param {string} callActivityId  対象 callActivity の id 属性値
 * @param {string} fromId  元の calledElement 値
 * @param {string} toId    置換後の calledElement 値
 * @returns {string}
 */
function applyCalleeProcessReplacement(xml, callActivityId, fromId, toId) {
  // 1. calledElement 属性を toId に上書きする
  xml = applyAttribute(xml, callActivityId, 'calledElement', toId);

  // 2. CALLEE_PROCESS_META トークンを documentation として callActivity 直下に追加する
  //    （自己終了タグの場合は開始・終了タグに展開してから追加する）
  var selfPattern = new RegExp(
    '<((?:bpmn:)?)callActivity\\b([^>]*?)id="' + escapeRegExp(callActivityId) + '"([^>]*?)/\\s*>'
  );
  var selfMatch = selfPattern.exec(xml);
  if (selfMatch) {
    var prefix = selfMatch[1];
    var openTag = '<' + prefix + 'callActivity' + selfMatch[2] + 'id="' + callActivityId + '"' + selfMatch[3] + '>';
    var expanded = openTag + '</' + prefix + 'callActivity>';
    xml = xml.slice(0, selfMatch.index) + expanded + xml.slice(selfMatch.index + selfMatch[0].length);
  }

  var openPattern = new RegExp(
    '<((?:bpmn:)?callActivity)\\b[^>]*?id="' + escapeRegExp(callActivityId) + '"[^>]*?>'
  );
  var openMatch = openPattern.exec(xml);
  if (!openMatch) {
    console.warn('[SKIP] callActivity not found: ' + callActivityId);
    return xml;
  }

  var tagName = openMatch[1];
  var insertPos = openMatch.index + openMatch[0].length;
  var headPart = xml.slice(0, insertPos);
  var rest = xml.slice(insertPos);

  var closePattern = new RegExp('</' + escapeRegExp(tagName) + '>');
  var closeIdx = rest.search(closePattern);
  if (closeIdx === -1) {
    console.warn('[SKIP] closing tag not found for: ' + callActivityId);
    return xml;
  }

  var body = rest.slice(0, closeIdx);
  var tailPart = rest.slice(closeIdx);

  if (/CALLEE_PROCESS_META:/.test(body)) {
    console.warn('[SKIP] CALLEE_PROCESS_META documentation already exists: ' + callActivityId);
    return xml;
  }

  var token = 'CALLEE_PROCESS_META:CALEE_PROCESS_REPLACED=true;ORIGINAL_CALLEE_PROCESS=' + fromId
    + ';CALLEE_PROCESS=' + toId
    + ';REPLACED_DATE=' + formatFixDate(new Date()) + ';';

  // body 全体ではなく、callActivity の「直接の子要素」だけを対象に documentation を探す
  // （dataInputAssociation 等の子孫要素が持つ documentation を誤って拾わないようにするため）。
  var docChild = findDirectChildElement(body, 'documentation');

  if (docChild) {
    var mergedDoc = docChild.openTag + docChild.content + token + docChild.closeTag;
    body = body.slice(0, docChild.index) + mergedDoc + body.slice(docChild.index + docChild.length);
  } else {
    var docTag = tagName.indexOf('bpmn:') === 0 ? 'bpmn:documentation' : 'documentation';
    body = '\n      <' + docTag + '>' + token + '</' + docTag + '>' + body;
  }

  return headPart + body + tailPart;
}

/**
 * Process ID 置換を実施する。
 * 置換前後の XML はメモリ上でのみ保持し、ユーザ承認後に対象ファイルへ直接書き込む。
 *
 * @param {string} bpmnPath  対象 BPMN ファイルパス
 * @param {string} xml       現在の XML 内容
 * @param {{ fromId: string, toId: string, allowFromIdExists?: boolean }[]} replacements  置換内容
 * @param {Object} [options]
 * @param {Function} [options.onProcessIdReplacementDetected]  ユーザ確認コールバック
 */
function reflectProcessIdReplacements(bpmnPath, xml, replacements, options) {
  options = options || {};
  if (!isPromptCopyBpmnPath(bpmnPath)) {
    throw new Error('Process ID replacement is allowed only for copied BPMN under doc/*-prompt/*.bpmn: ' + bpmnPath);
  }

  // XML に置換を適用（検証NG時は再試行）・PROCESS_KEY_META 付与まで実施。ディスクへの書き込みは行わない。
  var replacedXml = xml;
  var verifyError = null;
  try {
    replacedXml = applyVerifiedProcessIdReplacements(xml, replacements);
  } catch (e) {
    verifyError = e;
    replacedXml = xml;
  }

  // ユーザーに確認を取る
  if (options.onProcessIdReplacementDetected) {
    options.onProcessIdReplacementDetected(bpmnPath, replacements, function () {
      // OK: 置換を確定
      console.log('[CONFIRM] User approved process ID replacement');

      if (verifyError) {
        console.error('[ERROR] Process ID replacement verification failed: ' + verifyError.message);
        throw new Error('Process ID replacement verification failed. Please review the specification and try again.');
      }
      console.log('[CHECK] Process ID replacement verification passed');

      // 本ファイルへ直接書き込む（承認前は一切変更していない）
      fs.writeFileSync(bpmnPath, replacedXml, 'utf-8');
      console.log('[DONE] ' + bpmnPath);
    }, function () {
      // NG: 対象ファイルは承認前に一切変更していないため、復元処理は不要
      console.log('[CANCEL] User rejected process ID replacement');
    });
  } else {
    // コールバックがない場合は置換を確定（従来の動作）
    if (verifyError) {
      throw verifyError;
    }
    fs.writeFileSync(bpmnPath, replacedXml, 'utf-8');
    console.log('[DONE] ' + bpmnPath);
  }
}

/**
 * <bpmn:definitions> 要素（ファイル直下のルート要素）が持つ ixbpmn:repositoryObjectID 属性値を取得する。
 * iGrafx 製 BPMN のみが持つ属性であり、process 単位の属性ではない点に注意。
 * @param {string} xml
 * @returns {string|null}  属性が存在しない場合は null
 */
function extractRepositoryObjectId(xml) {
  var pattern = /<(?:bpmn:)?definitions\b[^>]*?\bixbpmn:repositoryObjectID="([^"]*)"/;
  var match = pattern.exec(xml);
  return match ? match[1] : null;
}

/**
 * process id 置換後の <process id="toId"> に PROCESS_KEY_META トークンを documentation として追加する。
 * 既存の documentation 記述は保持する。
 * - 既に <documentation>（または <bpmn:documentation>）要素が存在し、かつ PROCESS_KEY_META トークンが
 *   未定義の場合は、その要素内にトークンを追記する（新規要素は追加しない）。
 * - documentation 要素が存在しない場合は、ベンダーに応じたタグ名で新規要素を追加する
 *   （IM-BPM 製: <bpmn:documentation> / それ以外: <documentation>）。
 * 既に PROCESS_KEY_META トークンが存在する場合は重複追加を避けるためスキップする。
 *
 * REPOSITORY_OBJECT_ID は <bpmn:definitions> の ixbpmn:repositoryObjectID 属性値を参照する
 * （iGrafx 製 BPMN 限定の属性）。取得できない場合は例外を throw し、呼び出し元で処理を中断させる。
 *
 * @param {string} xml
 * @param {string} fromId  元の process id
 * @param {string} toId    採番後の process id
 * @returns {string}
 */
function applyProcessKeyMetaToken(xml, fromId, toId) {
  var repositoryObjectId = extractRepositoryObjectId(xml);
  if (!repositoryObjectId) {
    throw new Error(
      'ixbpmn:repositoryObjectID not found on <bpmn:definitions>. '
      + 'Process ID replacement requires this attribute (iGrafx BPMN only): ' + toId
    );
  }

  var vendor = detectVendor(xml);
  var docTag = vendor === 'im-bpm' ? 'bpmn:documentation' : 'documentation';

  var openPattern = new RegExp(
    '<(?:bpmn:)?process\\b[^>]*?id="' + escapeRegExp(toId) + '"[^>]*?>'
  );
  var openMatch = openPattern.exec(xml);
  if (!openMatch) {
    throw new Error('process not found for PROCESS_KEY_META insertion: ' + toId);
  }

  var insertPos = openMatch.index + openMatch[0].length;
  var prefix = xml.slice(0, insertPos);
  var rest = xml.slice(insertPos);

  var closePattern = /<\/(?:bpmn:)?process>/;
  var closeIdx = rest.search(closePattern);
  if (closeIdx === -1) {
    throw new Error('closing </process> not found for: ' + toId);
  }

  var processBody = rest.slice(0, closeIdx);
  var suffix = rest.slice(closeIdx);

  if (/PROCESS_KEY_META:/.test(processBody)) {
    console.warn('[SKIP] PROCESS_KEY_META documentation already exists: ' + toId);
    return xml;
  }

  var token = 'PROCESS_KEY_META:{REPOSITORY_OBJECT_ID=' + repositoryObjectId
    + ';ORIGINAL_PROCESS_KEY=' + fromId
    + ';PROCESS_KEY=' + toId + '};';

  // 既存の documentation 要素があればその中にトークンを追記し、無ければベンダー別タグ名で新規追加する。
  // processBody 全体（配下の userTask 等の子孫要素の中身も含む）ではなく、process の
  // 「直接の子要素」だけを対象に documentation を探す（子孫要素側の既存 documentation を
  // 誤って拾い、PROCESS_KEY_META の挿入位置がずれるのを防ぐため）。
  var docChild = findDirectChildElement(processBody, 'documentation');

  if (docChild) {
    var mergedDoc = docChild.openTag + docChild.content + token + docChild.closeTag;
    processBody = processBody.slice(0, docChild.index)
      + mergedDoc
      + processBody.slice(docChild.index + docChild.length);
  } else {
    processBody = '\n    <' + docTag + '>' + token + '</' + docTag + '>' + processBody;
  }

  return prefix + processBody + suffix;
}

/**
 * Process ID を置換する。
 * <process id="fromId"> を <process id="toId"> へ変更する。
 * また participant の processRef も同様に置換する。
 *
 * @param {string} xml
 * @param {string} fromId  元の process id
 * @param {string} toId    新しい process id
 * @returns {string}
 */
function replaceProcessId(xml, fromId, toId) {
  // process@id と participant@processRef を fromId から toId へ置換する。
  // <process id="fromId"> → <process id="toId">
  var processPattern = new RegExp(
    '(<(?:bpmn:)?process\\b[^>]*?id=")' + escapeRegExp(fromId) + '(")',
    'g'
  );
  xml = xml.replace(processPattern, '$1' + toId + '$2');

  // <participant ... processRef="fromId"> → <participant ... processRef="toId">
  var participantPattern = new RegExp(
    '(<(?:bpmn:)?participant\\b[^>]*?processRef=")' + escapeRegExp(fromId) + '(")',
    'g'
  );
  xml = xml.replace(participantPattern, '$1' + toId + '$2');

  console.log('[REPLACE] Process ID replaced: ' + fromId + ' → ' + toId);
  return xml;
}

/**
 * BPMN XML 内の process id 一覧を抽出する。
 * @param {string} xml
 * @returns {string[]}
 */
function listProcessIds(xml) {
  // BPMN XML から process@id の一覧を抽出する。
  var ids = [];
  var pattern = /<(?:bpmn:)?process\b[^>]*?\bid="([^"]+)"/g;
  var match;

  while ((match = pattern.exec(xml)) !== null) {
    ids.push(match[1]);
  }

  return ids;
}

/**
 * BPMN XML 内の participant processRef 一覧を抽出する。
 * @param {string} xml
 * @returns {string[]}
 */
function listParticipantProcessRefs(xml) {
  // BPMN XML から participant@processRef の一覧を抽出する。
  var refs = [];
  var pattern = /<(?:bpmn:)?participant\b[^>]*?\bprocessRef="([^"]+)"/g;
  var match;

  while ((match = pattern.exec(xml)) !== null) {
    refs.push(match[1]);
  }

  return refs;
}

/**
 * 仕様書で定義した process id 置換 from-to と BPMN の実体を照合する。
 * @param {string} xml
 * @param {{ fromId: string, toId: string, allowFromIdExists?: boolean, allowMissingParticipantRef?: boolean }[]} replacements
 */
function verifyProcessIdReplacements(xml, replacements) {
  // 仕様書内のプロセスID置換 from-to どおりに反映されたかを検証する。
  if (!replacements || replacements.length === 0) return;

  var ids = listProcessIds(xml);
  var processRefIds = listParticipantProcessRefs(xml);
  var idSet = {};
  var processRefSet = {};
  var hasParticipant = /<(?:bpmn:)?participant\b/.test(xml);
  var errors = [];

  ids.forEach(function (id) {
    idSet[id] = true;
  });

  processRefIds.forEach(function (processRefId) {
    processRefSet[processRefId] = true;
  });

  replacements.forEach(function (item, index) {
    if (!item || !item.toId) {
      errors.push('[NG] processIdReplacements[' + index + '] requires toId');
      return;
    }

    if (!idSet[item.toId]) {
      errors.push('[NG] replaced process id not found: ' + item.toId);
    }

    if (hasParticipant && !processRefSet[item.toId] && item.allowMissingParticipantRef !== true) {
      errors.push('[NG] replaced participant processRef not found: ' + item.toId);
    }

    if (item.fromId && item.allowFromIdExists !== true && idSet[item.fromId]) {
      errors.push('[NG] original process id still exists: ' + item.fromId);
    }

    if (hasParticipant && item.fromId && item.allowFromIdExists !== true && processRefSet[item.fromId]) {
      errors.push('[NG] original participant processRef still exists: ' + item.fromId);
    }
  });

  if (errors.length > 0) {
    throw new Error('Process ID replacement check failed\n' + errors.join('\n'));
  }

  console.log('[CHECK] process id replacements matched spec: ' + replacements.length + ' item(s)');
}

/**
 * Process ID 置換が既に反映済みかを判定する。
 * check-process-id-replaced.js の判定ロジックを移植したもの（reflector.reflect() 実行前の事前チェック用）。
 * @param {string} bpmnPath  対象 BPMN ファイルパス（doc/*-prompt/*.bpmn のみ許可）
 * @param {{ fromId: string, toId: string, allowFromIdExists?: boolean }[]} replacements
 * @returns {{ bpmnPath: string, status: 'replaced'|'not_replaced'|'partial',
 *             replacedCount: number, notReplacedCount: number,
 *             details: { fromId: string, toId: string, processReplaced: boolean, processRefReplaced: boolean, replaced: boolean }[] }}
 */
function checkProcessIdReplaced(bpmnPath, replacements) {
  if (!isPromptCopyBpmnPath(bpmnPath)) {
    throw new Error('Process ID replacement check is allowed only for copied BPMN under doc/*-prompt/*.bpmn: ' + bpmnPath);
  }

  var xml = fs.readFileSync(bpmnPath, 'utf-8');
  var processIdSet = {};
  var processRefIdSet = {};
  listProcessIds(xml).forEach(function (id) {
    processIdSet[id] = true;
  });
  listParticipantProcessRefs(xml).forEach(function (id) {
    processRefIdSet[id] = true;
  });

  var details = [];
  var replacedCount = 0;
  var notReplacedCount = 0;

  (replacements || []).forEach(function (item) {
    var fromId = item.fromId;
    var toId = item.toId;

    var processReplaced = !!processIdSet[toId] && !processIdSet[fromId];
    var processRefReplaced = true;
    if (processRefIdSet[fromId] || processRefIdSet[toId]) {
      processRefReplaced = !!processRefIdSet[toId] && !processRefIdSet[fromId];
    }

    var replaced = processReplaced && processRefReplaced;
    if (replaced) {
      replacedCount += 1;
    } else {
      notReplacedCount += 1;
    }

    details.push({
      fromId: fromId,
      toId: toId,
      processReplaced: processReplaced,
      processRefReplaced: processRefReplaced,
      replaced: replaced
    });
  });

  var status = notReplacedCount === 0 ? 'replaced' : (replacedCount === 0 ? 'not_replaced' : 'partial');

  return {
    bpmnPath: path.normalize(bpmnPath),
    status: status,
    replacedCount: replacedCount,
    notReplacedCount: notReplacedCount,
    details: details
  };
}

// ----------------------------------------------------------------
// ユーティリティ
// ----------------------------------------------------------------
// escapeRegExp は bpmn-reflector-utils.js に集約している（bpmn-scripts-reflector.js と共通）。

/**
 * 最初の <process> タグの直前にテキストを挿入する。
 * @param {string} xml
 * @param {string} tag  挿入するタグ文字列
 * @returns {string}
 */
function insertBeforeFirstProcess(xml, tag) {
  var pattern = /(<(?:bpmn:)?process\b)/;
  return xml.replace(pattern, function (match) {
    return tag + '\n  ' + match;
  });
}

// ----------------------------------------------------------------
// CLI 実行（processId 置換の単体検証用）
// ----------------------------------------------------------------
// verify-process-id-reflection.js から移植。
// `bun bpmn-specs-reflector.js <bpmnPath> <replacementsJsonPath>` として直接実行した場合のみ動作する。
// require() でライブラリとして読み込まれた場合はこのブロックは実行されない。

/**
 * processId 置換が仕様書の from-to どおりに BPMN へ反映されているかを、
 * ファイルパス指定で検証する（CLI 用）。
 */
function runVerifyProcessIdReflectionCli() {
  var bpmnPath = process.argv[2];
  var replacementsPath = process.argv[3];

  if (!bpmnPath || !replacementsPath) {
    console.error('Usage: bun bpmn-specs-reflector.js <bpmnPath> <replacementsJsonPath>');
    process.exit(2);
    return;
  }

  var xml = fs.readFileSync(bpmnPath, 'utf8');
  var replacements = JSON.parse(fs.readFileSync(replacementsPath, 'utf8'));

  var processIds = listProcessIds(xml);
  var processRefs = listParticipantProcessRefs(xml);
  var processIdSet = {};
  var processRefSet = {};
  var missing = [];

  processIds.forEach(function (id) {
    processIdSet[id] = true;
  });
  processRefs.forEach(function (id) {
    processRefSet[id] = true;
  });

  replacements.forEach(function (item) {
    var fromId = item.fromId;
    var toId = item.toId;

    if (!processIdSet[toId]) {
      missing.push('[process@id] missing toId: ' + toId + ' (from ' + fromId + ')');
    }
    if (processIdSet[fromId] && item.allowFromIdExists !== true) {
      missing.push('[process@id] fromId still exists: ' + fromId + ' -> ' + toId);
    }

    if (processRefSet[fromId] || processRefSet[toId]) {
      if (!processRefSet[toId] && item.allowMissingParticipantRef !== true) {
        missing.push('[participant@processRef] missing toId: ' + toId + ' (from ' + fromId + ')');
      }
      if (processRefSet[fromId] && item.allowFromIdExists !== true) {
        missing.push('[participant@processRef] fromId still exists: ' + fromId + ' -> ' + toId);
      }
    }
  });

  if (missing.length > 0) {
    console.error(JSON.stringify({
      ok: false,
      bpmnPath: path.normalize(bpmnPath),
      issues: missing
    }, null, 2));
    process.exit(1);
    return;
  }

  console.log(JSON.stringify({
    ok: true,
    bpmnPath: path.normalize(bpmnPath),
    checked: replacements.length
  }, null, 2));
  process.exit(0);
}

if (require.main === module) {
  runVerifyProcessIdReflectionCli();
}

module.exports = {
  detectVendor,
  applyProcessCandidateStarterGroups,
  applyLaneCandidateGroups,
  applyUserTaskCandidateGroups,
  applyTaskColor,
  applyIsOptional,
  applyAttribute,
  applyEventDefinitionRef,
  applyServiceTaskField,
  applyTimerDefinition,
  applyDataObjects,
  applyConditionExpression,
  applySignal,
  applyMessage,
  applyCalleeProcessReplacement,
  reflectFixes,
  listProcessIds,
  listParticipantProcessRefs,
  verifyProcessIdReplacements,
  applyVerifiedProcessIdReplacements,
  reflectProcessIdReplacements,
  replaceProcessId,
  checkProcessIdReplaced,
  extractRepositoryObjectId,
  applyProcessKeyMetaToken
};
