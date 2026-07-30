#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var reflector = require('./bpmn-specs-reflector');

function usage() {
  // 実行引数の不足時に使い方を表示する。
  console.error('Usage: {{RUNTIME}} check-process-id-replaced.js <bpmnPath> <replacementsJsonPath>');
  process.exit(2);
}

function isPromptCopyBpmnPath(bpmnPath) {
  // 置換対象が仕様書ディレクトリ配下のコピーBPMNかを判定する。
  var normalized = String(bpmnPath || '').replace(/\\/g, '/');
  return /(?:^|\/)doc\/[^/]+-prompt\/[^/]+\.bpmn$/i.test(normalized);
}

if (process.argv.length < 4) {
  usage();
}

var bpmnPath = process.argv[2];
var replacementsPath = process.argv[3];

if (!isPromptCopyBpmnPath(bpmnPath)) {
  console.error('[NG] replacement target is not allowed: ' + bpmnPath);
  console.error('[RULE] only doc/*-prompt/*.bpmn is allowed');
  process.exit(1);
}

var xml = fs.readFileSync(bpmnPath, 'utf8');
var replacements = JSON.parse(fs.readFileSync(replacementsPath, 'utf8'));

var processIds = reflector.listProcessIds(xml);
var processRefIds = reflector.listParticipantProcessRefs(xml);
var processIdSet = {};
var processRefIdSet = {};
var details = [];

processIds.forEach(function(id) {
  processIdSet[id] = true;
});
processRefIds.forEach(function(id) {
  processRefIdSet[id] = true;
});

var replacedCount = 0;
var notReplacedCount = 0;

replacements.forEach(function(item) {
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

var result = {
  bpmnPath: path.normalize(bpmnPath),
  status: status,
  replacedCount: replacedCount,
  notReplacedCount: notReplacedCount,
  details: details
};

console.log(JSON.stringify(result, null, 2));
process.exit(0);
