#!/usr/bin/env node
/*
 * validate-bpmn.js - BPMN validator for import-time checks.
 *
 * Usage:
 *   {{RUNTIME}} <このスクリプトのパス> <diagram.bpmn>
 *   {{RUNTIME}} <このスクリプトのパス> <diagram.bpmn> --rules validate-bpmn.rules.json
 *
 * Checks:
 *   [input] Property input-rule checks (1-a)
 *           - required
 *           - conditional required
 *           - required group
 *           - format
 *           - max length
 *           - required prefix
 *           - invalid prefix
 *           - required without prefix
 *   [model] BPMN model validation (4)
 *           - BPMN XML parse and warning/error pickup
 *           - StartEvent / SubProcess / EventSubProcess rules
 *           - SequenceFlow source/target/scope rules
 *           - Gateway default flow consistency
 *           - DI / Message / Signal reference integrity
 *           - ServiceTask implementation attribute consistency
 */

const fs = require('fs');
const BpmnModdle = require('bpmn-moddle');

const CONSTRAINTS = {
  BPMN_MODEL_TARGET_NAMESPACE_MAX_LENGTH: 255,
  PROCESS_DEFINITION_ID_MAX_LENGTH: 255,
  PROCESS_DEFINITION_NAME_MAX_LENGTH: 255
};

const DEFAULT_INPUT_RULES = [
  {
    id: 'definitions.targetNamespace',
    selector: 'bpmn:Definitions',
    path: 'targetNamespace',
    label: 'targetNamespace',
    rule: {
      required: true,
      format: '^\\S+$',
      maxLength: CONSTRAINTS.BPMN_MODEL_TARGET_NAMESPACE_MAX_LENGTH,
      requiredPrefix: ['http://', 'https://'],
      invalidPrefix: ['urn:']
    }
  },
  {
    id: 'process.id',
    selector: 'bpmn:Process',
    path: 'id',
    label: 'process id',
    rule: {
      required: true,
      format: '^[A-Za-z_][A-Za-z0-9_\\-.]*$',
      maxLength: CONSTRAINTS.PROCESS_DEFINITION_ID_MAX_LENGTH,
      invalidPrefix: ['tmp_'],
      requiredWithoutPrefix: true
    }
  },
  {
    id: 'process.name.conditionalRequired',
    selector: 'bpmn:Process',
    path: 'name',
    label: 'process name',
    rule: {
      requiredIf: {
        path: 'isExecutable',
        equals: true
      },
      maxLength: CONSTRAINTS.PROCESS_DEFINITION_NAME_MAX_LENGTH
    }
  },
  {
    id: 'serviceTask.implementation.requiredGroup',
    selector: 'bpmn:ServiceTask',
    path: 'activiti:class',
    label: 'service task implementation',
    rule: {
      requiredGroup: [
        'activiti:class',
        'activiti:delegateExpression',
        'activiti:expression',
        'activiti:type'
      ]
    }
  },
  {
    id: 'serviceTask.delegateExpression.prefix',
    selector: 'bpmn:ServiceTask',
    path: 'activiti:delegateExpression',
    label: 'service task delegateExpression',
    rule: {
      requiredPrefix: ['${'],
      invalidPrefix: ['#{']
    }
  }
];

function nsType(element) {
  if (!element || !element.$type) return '';
  const i = element.$type.indexOf(':');
  return i >= 0 ? element.$type.slice(i + 1) : element.$type;
}

function parseBooleanAttr(value) {
  return value === true || value === 'true';
}

function getRefId(ref) {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;
  return ref.id || null;
}

function isEmptyValue(value) {
  return typeof value === 'undefined' || value === null || value === '';
}

function parseArgs(argv) {
  const args = {
    bpmnPath: null,
    rulesPath: null
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!args.bpmnPath && !a.startsWith('--')) {
      args.bpmnPath = a;
      continue;
    }

    if (a === '--rules') {
      if (i + 1 >= argv.length) throw new Error('Missing value for --rules');
      args.rulesPath = argv[++i];
      continue;
    }

    throw new Error(`Unknown argument: ${a}`);
  }

  /* ★★★★★★★★★★★★★★★★★★★★★★★★★ */
  if (!args.bpmnPath) {
    throw new Error('Usage: {{RUNTIME}} ' + require('path').basename(__filename) + ' <diagram.bpmn> [--rules rules.json]');
  }

  return args;
}

function readInputRules(filePath) {
  if (!filePath) return DEFAULT_INPUT_RULES;

  const text = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error('--rules JSON must be an array');
  }

  return parsed;
}

function normalizeRuleRegex(rule) {
  if (!rule || !rule.format || rule.format instanceof RegExp) return rule;
  return {
    ...rule,
    format: new RegExp(rule.format)
  };
}

function getAttrValue(element, path) {
  if (!element || !path) return undefined;

  const segments = String(path).split('.');
  let current = element;

  for (const segment of segments) {
    if (current == null) return undefined;

    if (Object.prototype.hasOwnProperty.call(current, segment)) {
      current = current[segment];
      continue;
    }

    if (current.$attrs && Object.prototype.hasOwnProperty.call(current.$attrs, segment)) {
      current = current.$attrs[segment];
      continue;
    }

    if (segment === 'text' && typeof current.body === 'string') {
      current = current.body;
      continue;
    }

    return undefined;
  }

  if (current && typeof current === 'object' && typeof current.id === 'string') return current.id;
  return current;
}

function shouldApplyConditionalRequired(rule, element) {
  if (!rule) return false;

  if (typeof rule.required === 'function') {
    return !!rule.required(element);
  }

  if (!rule.requiredIf) return false;

  const requiredIf = rule.requiredIf;
  if (typeof requiredIf === 'boolean') return requiredIf;
  if (typeof requiredIf !== 'object') return false;

  const target = getAttrValue(element, requiredIf.path);
  if (Object.prototype.hasOwnProperty.call(requiredIf, 'equals')) {
    const expected = requiredIf.equals;
    if (expected === true || expected === false) {
      return parseBooleanAttr(target) === expected;
    }
    return target === expected;
  }

  return !isEmptyValue(target);
}

function shouldApplyRequiredWithoutPrefix(rule, element) {
  if (!rule) return false;

  if (typeof rule.requiredWithoutPrefix === 'function') {
    return !!rule.requiredWithoutPrefix(element);
  }

  if (typeof rule.requiredWithoutPrefix === 'boolean') {
    return rule.requiredWithoutPrefix;
  }

  if (rule.requiredWithoutPrefixIf && typeof rule.requiredWithoutPrefixIf === 'object') {
    return shouldApplyConditionalRequired({ requiredIf: rule.requiredWithoutPrefixIf }, element);
  }

  return false;
}

function removePrefix(value) {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/^[^:]+:/, '');
}

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

    if (value && typeof value === 'object' && value.$type) {
      findElements(value, selector, out);
    }
  });
}

function validateInputRuleOnElement(element, entry, result) {
  const rule = normalizeRuleRegex(entry.rule || {});
  const label = entry.label || entry.path || 'value';
  const ctx = `input(${entry.id || label})`;
  const inputValue = getAttrValue(element, entry.path);

  /* 必須チェック */
  if (rule.required === true) {
    if (isEmptyValue(inputValue)) {
      result.error(ctx, `${label} is required`);
      return;
    }
  }

  /* 条件付き必須チェック */
  if (shouldApplyConditionalRequired(rule, element)) {
    if (isEmptyValue(inputValue)) {
      result.error(ctx, `${label} is conditionally required`);
      return;
    }
  }

  /* 相関必須チェック */
  if (Array.isArray(rule.requiredGroup) && rule.requiredGroup.length > 0) {
    let hasAny = false;
    for (const groupPath of rule.requiredGroup) {
      const groupValue = getAttrValue(element, groupPath);
      if (!isEmptyValue(groupValue)) {
        hasAny = true;
        break;
      }
    }

    if (!hasAny) {
      result.error(ctx, `at least one value is required in group: ${rule.requiredGroup.join(', ')}`);
      return;
    }
  }

  /* 形式チェック */
  if (rule.format) {
    const stringValue = String(inputValue);
    if (!rule.format.test(stringValue)) {
      result.error(ctx, `${label} violates format constraint`);
      return;
    }
  }

  /* 最大長チェック */
  if (rule.maxLength && rule.maxLength > 0) {
    let valueLength = 0;
    if (Array.isArray(inputValue)) {
      valueLength = inputValue.length;
    } else {
      valueLength = String(inputValue).length;
    }

    if (valueLength > rule.maxLength) {
      result.error(ctx, `${label} must be <= ${rule.maxLength} chars`);
      return;
    }
  }

  /* 接頭辞必須チェック */
  if (Array.isArray(rule.requiredPrefix) && rule.requiredPrefix.length > 0 && !isEmptyValue(inputValue)) {
    const stringValue = String(inputValue).trim();
    const matched = rule.requiredPrefix.some(prefix => stringValue.startsWith(prefix));
    if (!matched) {
      result.error(ctx, `${label} must start with one of: ${rule.requiredPrefix.join(', ')}`);
      return;
    }
  }

  /* 接頭辞禁止チェック */
  if (Array.isArray(rule.invalidPrefix) && rule.invalidPrefix.length > 0 && !isEmptyValue(inputValue)) {
    const stringValue = String(inputValue).trim();
    const blocked = rule.invalidPrefix.find(prefix => stringValue.startsWith(prefix));
    if (blocked) {
      result.error(ctx, `${label} must not start with: ${blocked}`);
      return;
    }
  }

  /* 接頭辞除去後の必須チェック */
  if (shouldApplyRequiredWithoutPrefix(rule, element)) {
    if (typeof inputValue === 'undefined' || inputValue === null || inputValue === '') {
      result.error(ctx, `${label} is required`);
      return;
    }

    const stripped = removePrefix(String(inputValue));
    if (stripped === '') {
      result.error(ctx, `${label} must not be empty after prefix removal`);
      return;
    }
  }
}

function validateInputRules(definitions, rules, result) {
  for (const entry of rules) {
    if (!entry || !entry.selector || !entry.path) continue;

    const targets = [];
    findElements(definitions, entry.selector, targets);
    if (targets.length === 0) continue;

    for (const element of targets) {
      validateInputRuleOnElement(element, entry, result);
    }
  }
}

function getRootElementsByType(definitions, type) {
  return (definitions.rootElements || []).filter(e => nsType(e) === type);
}

function collectProcessFlowElements(process) {
  return Array.isArray(process.flowElements) ? process.flowElements : [];
}

function collectFlowElementsWithScope(container, scopeId, out) {
  const flowElements = Array.isArray(container.flowElements) ? container.flowElements : [];
  for (const el of flowElements) {
    out.push({ element: el, scopeId: scopeId });
    const t = nsType(el);
    if (t === 'SubProcess' || t === 'EventSubProcess') {
      collectFlowElementsWithScope(el, el.id || scopeId, out);
    }
  }
}

function isEventSubProcess(subProcess) {
  return nsType(subProcess) === 'EventSubProcess' || subProcess.triggeredByEvent === true || subProcess.triggeredByEvent === 'true';
}

function getFirstEventDefinitionType(startEvent) {
  const defs = Array.isArray(startEvent.eventDefinitions) ? startEvent.eventDefinitions : [];
  if (defs.length === 0) return null;
  return nsType(defs[0]);
}

function validateServiceTaskImplementation(process, result, ctx) {
  /* ServiceTask 実装属性整合チェック（class/delegateExpression/expression/type） */
  const flowElements = collectProcessFlowElements(process);
  const serviceTasks = flowElements.filter(e => nsType(e) === 'ServiceTask');

  for (const task of serviceTasks) {
    const attrs = [
      getAttrValue(task, 'activiti:class'),
      getAttrValue(task, 'activiti:delegateExpression'),
      getAttrValue(task, 'activiti:expression'),
      getAttrValue(task, 'activiti:type')
    ].filter(v => !isEmptyValue(v));

    if (attrs.length === 0) {
      result.error(ctx, `serviceTask ${task.id || '?'} requires one implementation attribute (class/delegateExpression/expression/type)`);
    }

    if (attrs.length > 1) {
      result.error(ctx, `serviceTask ${task.id || '?'} has multiple implementation attributes`);
    }
  }
}

function collectEventDefinitions(flowElements) {
  const defs = [];
  for (const flowElement of flowElements) {
    if (!Array.isArray(flowElement.eventDefinitions)) continue;
    for (const eventDef of flowElement.eventDefinitions) {
      defs.push({ owner: flowElement, def: eventDef });
    }
  }
  return defs;
}

function validateEventReferenceIntegrity(process, result, ctx) {
  /* Message/Signal 参照整合チェック */
  const flowElements = collectProcessFlowElements(process);
  const definitions = collectEventDefinitions(flowElements);

  const messageRefs = new Set();
  const signalRefs = new Set();

  for (const def of definitions) {
    const t = nsType(def.def);
    if (t === 'MessageEventDefinition') {
      const ref = getRefId(def.def.messageRef);
      if (ref) messageRefs.add(ref);
    }
    if (t === 'SignalEventDefinition') {
      const ref = getRefId(def.def.signalRef);
      if (ref) signalRefs.add(ref);
    }
  }

  const root = process.$parent;
  const rootElements = root && Array.isArray(root.rootElements) ? root.rootElements : [];
  const messages = rootElements.filter(e => nsType(e) === 'Message').map(e => e.id);
  const signals = rootElements.filter(e => nsType(e) === 'Signal').map(e => e.id);

  for (const messageRef of messageRefs) {
    if (!messages.includes(messageRef)) {
      result.error(ctx, `messageRef is unresolved: ${messageRef}`);
    }
  }

  for (const signalRef of signalRefs) {
    if (!signals.includes(signalRef)) {
      result.error(ctx, `signalRef is unresolved: ${signalRef}`);
    }
  }
}

function validateProcessShape(process, result) {
  const ctx = `flow(${process.id || '?'})`;

  /* プロセス基本要素チェック（id/name/start/end） */
  if (!process.id) result.error(ctx, 'process id is missing');
  if (!process.name) result.warn(ctx, 'process name is empty');

  const flowElements = collectProcessFlowElements(process);
  const starts = flowElements.filter(e => nsType(e) === 'StartEvent');
  const ends = flowElements.filter(e => nsType(e) === 'EndEvent');

  if (starts.length === 0) result.error(ctx, 'startEvent does not exist');
  if (ends.length === 0) result.error(ctx, 'endEvent does not exist');

  /* StartEvent 定義チェック（許可イベント定義・none start 重複） */
  for (const start of starts) {
    const eventDefType = getFirstEventDefinitionType(start);
    if (!eventDefType) continue;
    if (!['MessageEventDefinition', 'TimerEventDefinition', 'SignalEventDefinition'].includes(eventDefType)) {
      result.error(ctx, `unsupported event definition on start event (${start.id || '?'}, ${eventDefType})`);
    }
  }

  const noneStarts = starts.filter(e => !Array.isArray(e.eventDefinitions) || e.eventDefinitions.length === 0);
  if (noneStarts.length > 1) {
    for (const start of noneStarts) {
      result.error(ctx, `multiple none start events are not supported (${start.id || '?'})`);
    }
  }

  /* SubProcess/EventSubProcess 開始イベント制約チェック */
  const subProcesses = flowElements.filter(e => nsType(e) === 'SubProcess' || nsType(e) === 'EventSubProcess');
  for (const subProcess of subProcesses) {
    const children = Array.isArray(subProcess.flowElements) ? subProcess.flowElements : [];
    const subStarts = children.filter(e => nsType(e) === 'StartEvent');

    if (!isEventSubProcess(subProcess) && subStarts.length > 1) {
      result.error(ctx, `multiple start events are not supported for subprocess (${subProcess.id || '?'})`);
    }

    for (const start of subStarts) {
      const defs = Array.isArray(start.eventDefinitions) ? start.eventDefinitions : [];
      if (!isEventSubProcess(subProcess) && defs.length > 0) {
        result.error(ctx, `event definitions are only allowed on start event if subprocess is an event subprocess (${start.id || '?'})`);
      }

      if (isEventSubProcess(subProcess) && defs.length > 0) {
        const eventDefType = getFirstEventDefinitionType(start);
        if (!['ErrorEventDefinition', 'MessageEventDefinition', 'SignalEventDefinition'].includes(eventDefType)) {
          result.error(ctx, `event-subprocess start event must be error/message/signal (${start.id || '?'}, ${eventDefType})`);
        }
      }
    }
  }

  /* SequenceFlow source/target/scope 妥当性チェック */
  const scopedElements = [];
  collectFlowElementsWithScope(process, process.id || '__process__', scopedElements);

  const byId = new Map();
  const scopeById = new Map();
  for (const row of scopedElements) {
    const el = row.element;
    if (!el.id) {
      result.error(ctx, `flow element without id: ${el.$type}`);
      continue;
    }

    if (byId.has(el.id)) {
      result.error(ctx, `duplicate flow element id: ${el.id}`);
      continue;
    }

    byId.set(el.id, el);
    scopeById.set(el.id, row.scopeId);
  }

  const sequenceFlows = scopedElements.map(row => row.element).filter(e => nsType(e) === 'SequenceFlow');
  for (const seq of sequenceFlows) {
    const srcId = getRefId(seq.sourceRef);
    const tgtId = getRefId(seq.targetRef);

    if (!srcId || !byId.has(srcId)) {
      result.error(ctx, `sequenceFlow ${seq.id || '?'} sourceRef is invalid`);
    }

    if (!tgtId || !byId.has(tgtId)) {
      result.error(ctx, `sequenceFlow ${seq.id || '?'} targetRef is invalid`);
    }

    if (srcId && tgtId && scopeById.has(srcId) && scopeById.has(tgtId) && scopeById.get(srcId) !== scopeById.get(tgtId)) {
      result.error(ctx, `sequenceFlow ${seq.id || '?'} crosses subprocess boundary`);
    }
  }

  /* Gateway default flow 整合チェック */
  for (const element of flowElements) {
    if (!/Gateway$/.test(nsType(element))) continue;

    const defaultFlow = element.default;
    if (!defaultFlow) continue;

    const defaultId = getRefId(defaultFlow);
    if (!defaultId || !byId.has(defaultId) || nsType(byId.get(defaultId)) !== 'SequenceFlow') {
      result.error(ctx, `gateway ${element.id || '?'} default flow is invalid`);
      continue;
    }

    const flow = byId.get(defaultId);
    const srcId = getRefId(flow.sourceRef);
    if (!srcId || srcId !== element.id) {
      result.error(ctx, `gateway ${element.id || '?'} default flow ${defaultId} is not outgoing from the gateway`);
    }
  }

  validateEventReferenceIntegrity(process, result, ctx);
  validateServiceTaskImplementation(process, result, ctx);
}

function validateDiReferences(definitions, result) {
  /* DI 参照整合チェック（BPMNPlane/BPMNShape/BPMNEdge） */
  const known = new Set();

  const allFlowElements = [];
  const processes = getRootElementsByType(definitions, 'Process');
  for (const process of processes) {
    collectFlowElementsWithScope(process, process.id || '__process__', allFlowElements);
    if (process.id) known.add(process.id);
  }

  for (const row of allFlowElements) {
    const element = row.element;
    if (element && element.id) known.add(element.id);
  }

  const diagrams = Array.isArray(definitions.diagrams) ? definitions.diagrams : [];
  for (const diagram of diagrams) {
    if (!diagram.plane) continue;

    const plane = diagram.plane;
    if (plane.bpmnElement) {
      const planeRef = getRefId(plane.bpmnElement);
      if (planeRef && !known.has(planeRef)) {
        result.error('model', `DI plane references unknown bpmnElement: ${planeRef}`);
      }
    }

    const planeElements = Array.isArray(plane.planeElement) ? plane.planeElement : [];
    for (const pe of planeElements) {
      const peType = nsType(pe);
      const ref = getRefId(pe.bpmnElement);
      if (ref && !known.has(ref)) {
        result.error('model', `DI ${peType || 'planeElement'} references unknown bpmnElement: ${ref}`);
      }

      if (peType === 'BPMNEdge') {
        const waypoints = Array.isArray(pe.waypoint) ? pe.waypoint : [];
        if (waypoints.length < 2) {
          result.error('model', `BPMNEdge ${pe.id || '?'} must have at least 2 waypoints`);
        }
      }
    }
  }
}

async function parseBpmn(xml, result) {
  /* BPMN XML 解析チェック（変換可否と警告取得） */
  const moddle = new BpmnModdle();
  try {
    const parsed = await new Promise((resolve, reject) => {
      let settled = false;

      const done = (err, definitions, context) => {
        if (settled) return;
        settled = true;
        if (err) return reject(err);
        resolve({
          rootElement: definitions,
          warnings: context && Array.isArray(context.warnings) ? context.warnings : []
        });
      };

      const maybePromise = moddle.fromXML(xml, done);
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise
          .then(parsedResult => {
            if (settled) return;
            settled = true;
            if (parsedResult && parsedResult.rootElement) {
              resolve({
                rootElement: parsedResult.rootElement,
                warnings: Array.isArray(parsedResult.warnings) ? parsedResult.warnings : []
              });
              return;
            }
            resolve({ rootElement: parsedResult, warnings: [] });
          })
          .catch(err => {
            if (settled) return;
            settled = true;
            reject(err);
          });
      }
    });

    const warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];
    for (const warning of warnings) {
      const msg = warning && warning.message ? warning.message : String(warning);
      result.warn('model', msg);
    }

    return parsed.rootElement;
  } catch (err) {
    result.error('model', `failed to parse BPMN XML: ${err.message}`);
    return null;
  }
}

class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  error(ctx, message) {
    this.errors.push(`[${ctx}] ${message}`);
  }

  warn(ctx, message) {
    this.warnings.push(`[${ctx}] ${message}`);
  }

  get ok() {
    return this.errors.length === 0;
  }

  dump() {
    for (const err of this.errors) console.error('ERROR:', err);
    for (const warning of this.warnings) console.error('WARN :', warning);

    if (this.ok) {
      console.error(`PASS (${this.warnings.length} warning(s))`);
    } else {
      console.error(`FAIL (${this.errors.length} error(s), ${this.warnings.length} warning(s))`);
    }
  }
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const result = new ValidationResult();

  let inputRules;
  try {
    inputRules = readInputRules(args.rulesPath);
  } catch (err) {
    result.error('arg', `failed to read --rules: ${err.message}`);
    result.dump();
    process.exit(1);
  }

  let xml;
  try {
    xml = fs.readFileSync(args.bpmnPath, 'utf8');
  } catch (err) {
    result.error('io', `failed to read file ${args.bpmnPath}: ${err.message}`);
    result.dump();
    process.exit(1);
  }

  const definitions = await parseBpmn(xml, result);
  if (!definitions) {
    result.dump();
    process.exit(1);
  }

  validateInputRules(definitions, inputRules, result);

  const processes = getRootElementsByType(definitions, 'Process');
  if (processes.length === 0) {
    result.error('flow', 'process element does not exist');
  }

  for (const process of processes) {
    validateProcessShape(process, result);
  }
  validateDiReferences(definitions, result);

  result.dump();
  process.exit(result.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  ValidationResult,
  parseArgs,
  readInputRules,
  validateInputRules,
  validateProcessShape,
  validateDiReferences
};
