#!/usr/bin/env node
/*
 * search-called-elements.js - callActivity の呼び出し先プロセスをプロジェクト内 BPMN から探索する。
 *
 * Usage:
 *   {{RUNTIME}} <このスクリプトのパス> <diagram.bpmn>
 *   {{RUNTIME}} <このスクリプトのパス> <diagram.bpmn> --project-root <dir>
 *   {{RUNTIME}} <このスクリプトのパス> <diagram.bpmn> --json
 *
 * 処理内容（reference/guide-specification.md の「コールアクティビティ」節に対応）:
 *   [1] 読込中の BPMN から bpmn:CallActivity を探索する。0 件なら何もせず終了する。
 *   [2] callActivity の calledElement 属性値が `repos:Object-<数字>` 形式なら <数字> を取得する。
 *   [3] プロジェクト内の *.bpmn を探索し、definitions の ixbpmn:repositoryObjectID 属性値が
 *       <数字> と一致するものを探す。
 *         該当なし -> "not exists"
 *         該当あり -> プロセス名（bpmn:Process の name、無ければ bpmn:collaboration の name）
 */

const fs = require('fs');
const path = require('path');
const BpmnModdle = require('bpmn-moddle');

const EXCLUDED_DIR_NAMES = new Set(['node_modules', '.git']);
const CALLED_ELEMENT_PATTERN = /^repos:Object-(\d+)$/;

function nsType(element) {
  if (!element || !element.$type) return '';
  const i = element.$type.indexOf(':');
  return i >= 0 ? element.$type.slice(i + 1) : element.$type;
}

function getAttrValue(element, name) {
  if (!element) return undefined;
  if (Object.prototype.hasOwnProperty.call(element, name)) return element[name];
  if (element.$attrs && Object.prototype.hasOwnProperty.call(element.$attrs, name)) return element.$attrs[name];
  return undefined;
}

function findElementsByType(root, typeName, out) {
  if (!root || typeof root !== 'object') return;

  if (root.$type && nsType(root) === typeName) {
    out.push(root);
  }

  Object.keys(root).forEach(key => {
    const value = root[key];
    if (!value) return;

    if (Array.isArray(value)) {
      for (const child of value) {
        if (child && typeof child === 'object') findElementsByType(child, typeName, out);
      }
      return;
    }

    if (typeof value === 'object' && value.$type) {
      findElementsByType(value, typeName, out);
    }
  });
}

function parseArgs(argv) {
  const args = {
    bpmnPath: null,
    projectRoot: null,
    json: false
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!args.bpmnPath && !a.startsWith('--')) {
      args.bpmnPath = a;
      continue;
    }

    if (a === '--project-root') {
      if (i + 1 >= argv.length) throw new Error('Missing value for --project-root');
      args.projectRoot = argv[++i];
      continue;
    }

    if (a === '--json') {
      args.json = true;
      continue;
    }

    throw new Error('Unknown argument: ' + a);
  }

  if (!args.bpmnPath) {
    throw new Error('Usage: {{RUNTIME}} ' + path.basename(__filename) + ' <diagram.bpmn> [--project-root <dir>] [--json]');
  }

  if (!args.projectRoot) {
    // __dirname = .claude/skills/bpm-docs-generator/scripts
    // ../../../../ = プロジェクトルート
    args.projectRoot = path.join(__dirname, '..', '..', '..', '..');
  }

  return args;
}

async function parseBpmnFile(filePath) {
  const xml = fs.readFileSync(filePath, 'utf8');
  const moddle = new BpmnModdle();
  const parsed = await moddle.fromXML(xml);
  return parsed && parsed.rootElement ? parsed.rootElement : parsed;
}

function collectBpmnFiles(rootDir) {
  const results = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
      continue;
    }

    for (const entry of entries) {
      if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }

      if (entry.isFile() && /\.bpmn$/i.test(entry.name)) {
        results.push(full);
      }
    }
  }

  return results;
}

function extractCalledObjectId(callActivity) {
  const calledElement = getAttrValue(callActivity, 'calledElement');
  if (typeof calledElement !== 'string') return null;

  const match = CALLED_ELEMENT_PATTERN.exec(calledElement.trim());
  return match ? match[1] : null;
}

function resolveProcessName(definitions) {
  const rootElements = Array.isArray(definitions.rootElements) ? definitions.rootElements : [];

  const process = rootElements.find(e => nsType(e) === 'Process' && !!e.name);
  if (process) return process.name;

  const collaboration = rootElements.find(e => nsType(e) === 'Collaboration' && !!e.name);
  if (collaboration) return collaboration.name;

  return null;
}

async function findCalleeByObjectId(objectId, bpmnFiles) {
  for (const filePath of bpmnFiles) {
    let definitions;
    try {
      definitions = await parseBpmnFile(filePath);
    } catch (err) {
      continue;
    }

    if (!definitions) continue;

    const repositoryObjectId = getAttrValue(definitions, 'ixbpmn:repositoryObjectID');
    if (repositoryObjectId == null || String(repositoryObjectId) !== objectId) continue;

    return {
      filePath: filePath,
      processName: resolveProcessName(definitions)
    };
  }

  return null;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
    return;
  }

  let definitions;
  try {
    const xml = fs.readFileSync(args.bpmnPath, 'utf8');
    const moddle = new BpmnModdle();
    const parsed = await moddle.fromXML(xml);
    definitions = parsed && parsed.rootElement ? parsed.rootElement : parsed;
  } catch (err) {
    console.error('failed to read/parse BPMN XML:', err.message);
    process.exit(1);
    return;
  }

  const callActivities = [];
  findElementsByType(definitions, 'CallActivity', callActivities);

  if (callActivities.length === 0) {
    if (args.json) {
      console.log(JSON.stringify({ callActivities: [] }, null, 2));
    } else {
      console.error('callActivity was not found. nothing to do.');
    }
    return;
  }

  const bpmnFiles = collectBpmnFiles(path.resolve(args.projectRoot));
  const results = [];

  for (const callActivity of callActivities) {
    const calledElement = getAttrValue(callActivity, 'calledElement') || null;
    const objectId = extractCalledObjectId(callActivity);

    let status;
    let processName = null;
    let calleeFilePath = null;

    if (!objectId) {
      status = 'not exists';
    } else {
      const found = await findCalleeByObjectId(objectId, bpmnFiles);
      if (!found) {
        status = 'not exists';
      } else {
        status = found.processName || 'not exists';
        processName = found.processName;
        calleeFilePath = found.filePath;
      }
    }

    results.push({
      callActivityId: callActivity.id || null,
      callActivityName: callActivity.name || null,
      calledElement: calledElement,
      objectId: objectId,
      result: status,
      processName: processName,
      calleeFilePath: calleeFilePath
    });
  }

  if (args.json) {
    console.log(JSON.stringify({ callActivities: results }, null, 2));
    return;
  }

  for (const row of results) {
    console.log(
      `callActivity[${row.callActivityId || '?'}] calledElement=${row.calledElement || '(none)'} -> ${row.result}` +
      (row.calleeFilePath ? ` (${row.calleeFilePath})` : '')
    );
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  findElementsByType,
  extractCalledObjectId,
  resolveProcessName,
  collectBpmnFiles,
  findCalleeByObjectId
};
