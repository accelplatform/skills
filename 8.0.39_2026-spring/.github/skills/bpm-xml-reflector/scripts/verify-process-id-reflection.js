#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var reflector = require('./bpmn-specs-reflector');

function usage() {
  // 実行引数の不足時に使い方を表示する。
  console.error('Usage: {{RUNTIME}} verify-process-id-reflection.js <bpmnPath> <replacementsJsonPath>');
  process.exit(2);
}

if (process.argv.length < 4) {
  usage();
}

var bpmnPath = process.argv[2];
var replacementsPath = process.argv[3];
var xml = fs.readFileSync(bpmnPath, 'utf8');
var replacements = JSON.parse(fs.readFileSync(replacementsPath, 'utf8'));

var processIds = reflector.listProcessIds(xml);
var processRefs = reflector.listParticipantProcessRefs(xml);
var processIdSet = {};
var processRefSet = {};
var missing = [];

processIds.forEach(function(id) {
  processIdSet[id] = true;
});
processRefs.forEach(function(id) {
  processRefSet[id] = true;
});

replacements.forEach(function(item) {
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
}

console.log(JSON.stringify({
  ok: true,
  bpmnPath: path.normalize(bpmnPath),
  checked: replacements.length
}, null, 2));
process.exit(0);
