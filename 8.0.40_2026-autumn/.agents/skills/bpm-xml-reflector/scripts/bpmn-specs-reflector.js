'use strict';

var fs   = require('fs');
var path = require('path');

// ----------------------------------------------------------------
// カラーマップ（タスク種別 → 16進カラーコード）
// ----------------------------------------------------------------
var TASK_COLORS = {
  userTask:       'bbdefb',
  scriptTask:     'fff9c4',
  serviceTask:    'f9dcc0',
  mailTask:       'f7c9cf',
  manualTask:     'b2dfdb',
  receiveTask:    'e0caf7',
  callActivity:   'f9c0e4'
};

// ----------------------------------------------------------------
// 属性追加系
// ----------------------------------------------------------------

/**
 * <process> タグに candidateStarterGroups 属性を付与する。
 * @param {string} xml
 * @param {string} processId  process の id 属性値
 * @param {string} roleId
 * @returns {string}
 */
function applyProcessCandidateStarterGroups(xml, processId, roleId) {
  var pattern = new RegExp(
    '(<(?:bpmn:)?process\\b[^>]*?id="' + escapeRegExp(processId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function(match, open, close) {
    if (open.indexOf('candidateStarterGroups') !== -1) return match;
    return open + ' candidateStarterGroups="' + roleId + '"' + close;
  });
}

/**
 * <lane> タグに candidateGroups 属性を付与する。
 * @param {string} xml
 * @param {string} laneId  lane の id 属性値
 * @param {string} roleId
 * @returns {string}
 */
function applyLaneCandidateGroups(xml, laneId, roleId) {
  var pattern = new RegExp(
    '(<(?:bpmn:)?lane\\b[^>]*?id="' + escapeRegExp(laneId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function(match, open, close) {
    if (open.indexOf('candidateGroups') !== -1) return match;
    return open + ' candidateGroups="' + roleId + '"' + close;
  });
}

/**
 * <userTask> タグに candidateGroups 属性を付与する。
 * @param {string} xml
 * @param {string} taskId
 * @param {string} roleId
 * @returns {string}
 */
function applyUserTaskCandidateGroups(xml, taskId, roleId) {
  var pattern = new RegExp(
    '(<(?:bpmn:)?userTask\\b[^>]*?id="' + escapeRegExp(taskId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function(match, open, close) {
    if (open.indexOf('candidateGroups') !== -1) return match;
    return open + ' candidateGroups="' + roleId + '"' + close;
  });
}

/**
 * タスクタグに color 属性を付与する。
 * タスク種別に応じてカラーコードを自動決定する。
 * @param {string} xml
 * @param {string} taskId    対象タスクの id 属性値
 * @param {string} taskType  'userTask' | 'scriptTask' | 'serviceTask' |
 *                           'mailTask' | 'manualTask' | 'receiveTask' | 'callActivity'
 * @returns {string}
 */
function applyTaskColor(xml, taskId, taskType) {
  var color = TASK_COLORS[taskType];
  if (!color) {
    console.warn('[SKIP] unknown taskType: ' + taskType);
    return xml;
  }
  // タスク種別を問わず id で特定する
  var pattern = new RegExp(
    '(<(?:bpmn:)?(?:userTask|scriptTask|serviceTask|manualTask|receiveTask|callActivity)\\b[^>]*?id="'
      + escapeRegExp(taskId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function(match, open, close) {
    if (open.indexOf('color=') !== -1) return match;
    return open + ' color="' + color + '"' + close;
  });
}

/**
 * タスクタグに isOptional="true" 属性を付与する。
 * @param {string} xml
 * @param {string} taskId  対象タスクの id 属性値
 * @returns {string}
 */
function applyIsOptional(xml, taskId) {
  var pattern = new RegExp(
    '(<(?:bpmn:)?(?:userTask|scriptTask|serviceTask|manualTask|receiveTask|callActivity)\\b[^>]*?id="'
      + escapeRegExp(taskId) + '"[^>]*?)(/>|>)'
  );
  return xml.replace(pattern, function(match, open, close) {
    if (open.indexOf('isOptional') !== -1) return match;
    return open + ' isOptional="true"' + close;
  });
}

// ----------------------------------------------------------------
// 子要素挿入系
// ----------------------------------------------------------------

/**
 * <process> ブロック内にプロセス変数（<dataObject>）を追加する。
 * 同じ id の <dataObject> が既にある場合はスキップする。
 * @param {string} xml
 * @param {string} processId
 * @param {{ id: string, name: string, type: string }[]} variables
 *   type: 'string' | 'int' | 'long' | 'double' | 'datetime' | 'boolean'
 * @returns {string}
 */
function applyDataObjects(xml, processId, variables) {
  // 対象 <process> の閉じタグ直前に挿入する
  var closeTag = new RegExp('(</(?:bpmn:)?process>)');

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
  var prefix    = xml.slice(0, insertPos);
  var rest      = xml.slice(insertPos);

  // 対応する </process> を探して分割
  var closePattern = /<\/(?:bpmn:)?process>/;
  var closeIdx = rest.search(closePattern);
  if (closeIdx === -1) {
    console.warn('[SKIP] closing </process> not found for: ' + processId);
    return xml;
  }

  var processBody = rest.slice(0, closeIdx);
  var suffix      = rest.slice(closeIdx);

  // 各変数を挿入（既存 id はスキップ）
  variables.forEach(function(v) {
    var existsPattern = new RegExp('<(?:bpmn:)?dataObject\\b[^>]*?id="' + escapeRegExp(v.id) + '"');
    if (existsPattern.test(processBody)) {
      console.warn('[SKIP] dataObject already exists: ' + v.id);
      return;
    }
    processBody += '\n    <dataObject id="' + v.id
      + '" name="' + v.name
      + '" itemSubjectRef="xsd:' + v.type + '"/>';
  });

  return prefix + processBody + suffix;
}

/**
 * <sequenceFlow> に <conditionExpression> を追加する。
 * 自己終了タグの場合は展開して挿入する。
 * 既に <conditionExpression> がある場合はスキップする。
 * @param {string} xml
 * @param {string} flowId    sequenceFlow の id 属性値
 * @param {string} expression  EL 式（例: "${approved == 'true'}"）
 * @returns {string}
 */
function applyConditionExpression(xml, flowId, expression) {
  // 自己終了タグ: <sequenceFlow ... id="xxx" ... />
  var selfPattern = new RegExp(
    '(<(?:bpmn:)?sequenceFlow\\b[^>]*?id="' + escapeRegExp(flowId) + '"[^>]*?)(/\\s*>)'
  );
  // 開きタグ: <sequenceFlow ... id="xxx" ... >
  var openPattern = new RegExp(
    '(<(?:bpmn:)?sequenceFlow\\b[^>]*?id="' + escapeRegExp(flowId) + '"[^>]*?>)'
    + '([\\s\\S]*?)'
    + '(</(?:bpmn:)?sequenceFlow>)'
  );

  // 既に conditionExpression がある場合は何もしない
  var checkPattern = new RegExp(
    '<(?:bpmn:)?sequenceFlow\\b[^>]*?id="' + escapeRegExp(flowId) + '"[\\s\\S]*?</(?:bpmn:)?sequenceFlow>'
  );
  var checkSelf = new RegExp(
    '<(?:bpmn:)?sequenceFlow\\b[^>]*?id="' + escapeRegExp(flowId) + '"[^>]*/\\s*>'
  );

  var condTag = '\n      <conditionExpression>' + expression + '</conditionExpression>\n    ';

  // 自己終了タグのケース
  if (selfPattern.test(xml)) {
    return xml.replace(selfPattern, function(match, open, close) {
      return open + '>' + condTag + '</sequenceFlow>';
    });
  }

  // 開きタグ＋ボディのケース
  return xml.replace(openPattern, function(match, open, body, close) {
    if (body.indexOf('conditionExpression') !== -1) return match;
    return open + body + condTag + close;
  });
}

// ----------------------------------------------------------------
// トップレベル要素挿入系
// ----------------------------------------------------------------

/**
 * <signal> 要素を <process> の直前に挿入する。
 * 同じ id の <signal> が既にある場合はスキップする。
 * @param {string} xml
 * @param {string} signalId
 * @param {string} signalName
 * @returns {string}
 */
function applySignal(xml, signalId, signalName) {
  var existsPattern = new RegExp('<(?:bpmn:)?signal\\b[^>]*?id="' + escapeRegExp(signalId) + '"');
  if (existsPattern.test(xml)) {
    console.warn('[SKIP] signal already exists: ' + signalId);
    return xml;
  }
  var tag = '<signal id="' + signalId + '" name="' + signalName + '"/>';
  return insertBeforeFirstProcess(xml, tag);
}

/**
 * <message> 要素を <process> の直前に挿入する。
 * 同じ id の <message> が既にある場合はスキップする。
 * @param {string} xml
 * @param {string} messageId
 * @param {string} messageName
 * @returns {string}
 */
function applyMessage(xml, messageId, messageName) {
  var existsPattern = new RegExp('<(?:bpmn:)?message\\b[^>]*?id="' + escapeRegExp(messageId) + '"');
  if (existsPattern.test(xml)) {
    console.warn('[SKIP] message already exists: ' + messageId);
    return xml;
  }
  var tag = '<message id="' + messageId + '" name="' + messageName + '"/>';
  return insertBeforeFirstProcess(xml, tag);
}

// ----------------------------------------------------------------
// メイン反映処理
// ----------------------------------------------------------------

/**
 * 仕様書の内容を BPMN XML ファイルに一括反映する。
 *
 * @param {string} bpmnPath  対象 BPMN ファイルパス
 * @param {ReflectSpecs} specs
 * @param {Object} [options]
 * @param {Function} [options.onProcessIdReplacementDetected]  processId置換検出時のユーザー確認コールバック
 *   @param {string} filePath  対象ファイルパス
 *   @param {{ fromId: string, toId: string, allowFromIdExists?: boolean }[]} replacements  置換内容
 *   @param {Function} onApprove  承認時のコールバック（パラメータなし）
 *   @param {Function} onReject   拒否時のコールバック（パラメータなし）
 *
 * @typedef {Object} ReflectSpecs
 * @property {{ id: string, roleId: string }[]} [processes]
 * @property {{ id: string, roleId: string }[]} [lanes]
 * @property {{ id: string, roleId: string, isOptional?: boolean }[]} [userTasks]
 * @property {{ processId: string, variables: { id: string, name: string, type: string }[] }[]} [dataObjects]
 * @property {{ flowId: string, expression: string }[]} [conditions]
 * @property {{ id: string, name: string }[]} [signals]
 * @property {{ id: string, name: string }[]} [messages]
 * @property {{ taskId: string, taskType: string }[]} [colorize]
 * @property {{ fromId: string, toId: string, allowFromIdExists?: boolean }[]} [processIdReplacements]
 */
function reflect(bpmnPath, specs, options) {
  options = options || {};
  var xml = fs.readFileSync(bpmnPath, 'utf-8');

  (specs.processes || []).forEach(function(p) {
    xml = applyProcessCandidateStarterGroups(xml, p.id, p.roleId);
  });

  (specs.lanes || []).forEach(function(l) {
    xml = applyLaneCandidateGroups(xml, l.id, l.roleId);
  });

  (specs.userTasks || []).forEach(function(t) {
    xml = applyUserTaskCandidateGroups(xml, t.id, t.roleId);
    if (t.isOptional) {
      xml = applyIsOptional(xml, t.id);
    }
  });

  (specs.dataObjects || []).forEach(function(d) {
    xml = applyDataObjects(xml, d.processId, d.variables);
  });

  (specs.conditions || []).forEach(function(c) {
    xml = applyConditionExpression(xml, c.flowId, c.expression);
  });

  (specs.signals || []).forEach(function(s) {
    xml = applySignal(xml, s.id, s.name);
  });

  (specs.messages || []).forEach(function(m) {
    xml = applyMessage(xml, m.id, m.name);
  });

  (specs.colorize || []).forEach(function(c) {
    xml = applyTaskColor(xml, c.taskId, c.taskType);
  });

  // processId 置換の実行
  var replacements = specs.processIdReplacements || [];
  if (replacements.length > 0) {
    // Tempファイルを作成して置換を実施する
    reflectProcessIdReplacements(bpmnPath, xml, replacements, options);
    return;
  }

  // 置換がない場合はそのままファイルに書き込む
  fs.writeFileSync(bpmnPath, xml, 'utf-8');
  console.log('[DONE] ' + bpmnPath);
}

/**
 * Process ID 置換を実施する。
 * 置換前後の XML はメモリ上でのみ保持し、ユーザー承認後に対象ファイルへ直接書き込む。
 *
 * @param {string} bpmnPath  対象 BPMN ファイルパス
 * @param {string} xml       現在の XML 内容
 * @param {{ fromId: string, toId: string, allowFromIdExists?: boolean }[]} replacements  置換内容
 * @param {Object} [options]
 * @param {Function} [options.onProcessIdReplacementDetected]  ユーザー確認コールバック
 */
function reflectProcessIdReplacements(bpmnPath, xml, replacements, options) {
  options = options || {};
  if (!isPromptCopyBpmnPath(bpmnPath)) {
    throw new Error('Process ID replacement is allowed only for copied BPMN under doc/*-prompt/*.bpmn: ' + bpmnPath);
  }

  // XML に置換を適用（検証NG時は再試行）。ディスクへの書き込みは行わない。
  var replacedXml = xml;
  var maxAttempts = 2;
  var attempt = 0;
  var verifyError = null;
  while (attempt < maxAttempts) {
    replacedXml = xml;
    replacements.forEach(function(r) {
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

  // ユーザーに確認を取る
  if (options.onProcessIdReplacementDetected) {
    options.onProcessIdReplacementDetected(bpmnPath, replacements, function() {
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
    }, function() {
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

  ids.forEach(function(id) {
    idSet[id] = true;
  });

  processRefIds.forEach(function(processRefId) {
    processRefSet[processRefId] = true;
  });

  replacements.forEach(function(item, index) {
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

// ----------------------------------------------------------------
// ユーティリティ
// ----------------------------------------------------------------

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 最初の <process> タグの直前にテキストを挿入する。
 * @param {string} xml
 * @param {string} tag  挿入するタグ文字列
 * @returns {string}
 */
function insertBeforeFirstProcess(xml, tag) {
  var pattern = /(<(?:bpmn:)?process\b)/;
  return xml.replace(pattern, function(match) {
    return tag + '\n  ' + match;
  });
}

/**
 * Process ID 置換の対象が仕様書ディレクトリ配下のコピーBPMNかを判定する。
 * 許可: doc/*-prompt/*.bpmn
 * 禁止: doc/*.bpmn（元ファイル）
 * @param {string} bpmnPath
 * @returns {boolean}
 */
function isPromptCopyBpmnPath(bpmnPath) {
  // 置換対象が doc/*-prompt/*.bpmn 形式かを判定する。
  if (!bpmnPath) return false;
  var normalized = String(bpmnPath).replace(/\\/g, '/');
  return /(?:^|\/)doc\/[^/]+-prompt\/[^/]+\.bpmn$/i.test(normalized);
}

module.exports = {
  reflect,
  applyProcessCandidateStarterGroups,
  applyLaneCandidateGroups,
  applyUserTaskCandidateGroups,
  applyTaskColor,
  applyIsOptional,
  applyDataObjects,
  applyConditionExpression,
  applySignal,
  applyMessage,
  listProcessIds,
  listParticipantProcessRefs,
  verifyProcessIdReplacements,
  reflectProcessIdReplacements,
  replaceProcessId
};
