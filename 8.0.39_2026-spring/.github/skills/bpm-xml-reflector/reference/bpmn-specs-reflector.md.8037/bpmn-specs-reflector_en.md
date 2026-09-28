# BPMN Specification Reflector

## Overview
Parses BPMN-format XML and reflects the content of specification documents into the BPMN.

## When to Use
When the user makes a request such as:
- "Please reflect the content of the specification document under `doc/<BPM process name>-prompt/` into the BPMN XML."
- "Please reflect the content of the specification document into the BPMN XML."

## Reflection Target
- Correct: `doc/<BPM process name>-prompt/<BPM process name>.bpmn` (the copy destination. This is the only place that may be modified.)
- Incorrect: `doc/<BPM process name>.bpmn` (the copy source. **Never modify this.**)

## Content Reflected into the BPMN XML
- This skill set performs the following:
  - Replacing the process definition key (iGrafx-produced BPMN only)
  - Replacing the callee process of a call activity
  - Adding role IDs
  - Setting the background color of tasks
  - Setting optional tasks
  - Adding process variable definitions
  - Adding a branch condition expression (conditionExpression)
  - Adding signal definitions
  - Adding message definitions
  - Reflecting correction proposals for errors detected by `.github/skills/bpm-docs-generator/scripts/validate-bpmn.js`

## Overall Structure (Three Phases)

The process of reflecting the content of the specification document into the BPMN is composed of three phases that **separate "judgment/confirmation" from "mechanical writing"**.

```
Phase 1: Creating spec-to-bpmn-fixes.json           ← bpm-docs-generator side (including human confirmation)
         ↓
Phase 2: Checking/reflecting diffs against the spec ← bpm-xml-reflector side (including human confirmation)
         ↓
Phase 3: Reflecting the JSON (reflectFixes())       ← bpm-xml-reflector side (the responsibility of this skill)
```

### Phase 1: Creating `spec-to-bpmn-fixes.json`
Convert the content described in the specification document (see the table below) into the machine-readable `operation` / `params` / `targets` format, and output it to `doc/<BPM process name>-prompt/spec-to-bpmn-fixes.json`. **All judgments about "what to reflect", such as checks and inquiries to the user, must be completed in this phase.** Items that are not yet finalized (e.g., the ID of a signal/message not yet defined in the specification document) must not be written out to this file (i.e., they are also skipped from reflection).

| Content reflected | Guide that defines the details |
|---|---|
| Correction proposals for `.github/skills/bpm-docs-generator/scripts/validate-bpmn.js` errors | `.github/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` |
| Replacement of the process definition key (process id) | `.github/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md` |
| Replacement of the callee process of a call activity | `.github/skills/bpm-docs-generator/reference/guide-specification.md` (Call Activity section) |
| Role ID / task color / optional / process variable / signal / message | `.github/skills/bpm-docs-generator/reference/guide-specification.md` |
| Entry structure of `spec-to-bpmn-fixes.json`, `fixId` naming convention, controlled vocabulary of `operation` | `.github/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` (the "Format of `spec-to-bpmn-fixes.json`" section) |

This phase is the responsibility of `.github/skills/bpm-docs-generator`. However, there are cases where `to-be-discussed.md` / `specification.md` / `supplement.md`, etc. are edited directly after this phase completes and are left unreflected in `spec-to-bpmn-fixes.json`, so always go through Phase 2 (the next section) before executing `reflectFixes()` (Phase 3).

### Phase 2: Checking/Reflecting Diffs Against the Specification Document

If a specification change occurs after `spec-to-bpmn-fixes.json` has been created (a direct addition of an answer to an item under consideration, an addition/correction of a business requirement, etc.), it is left behind unreflected in `spec-to-bpmn-fixes.json`, causing the problem that the latest specification is not reflected into the BPMN even when `reflectFixes()` is executed. To prevent this, **always perform this phase before executing `reflectFixes()` (Phase 3).**

**Check targets:**
- `doc/<BPM process name>-prompt/to-be-discussed.md` (in particular, the descriptions of the items under consideration in chapters 3–5, and the `reflectStatus` shown on the "correction proposal" line of each item)
- `doc/<BPM process name>-prompt/specification.md`
- `doc/<BPM process name>-prompt/supplement.md`
- The content of the above versus `doc/<BPM process name>-prompt/spec-to-bpmn-fixes.json`

**Diff detection patterns:**

| Pattern | Content detected | Action |
|---|---|---|
| ① `reflectStatus` mismatch | An answer or a finalized description was added to an item under consideration on the md side (e.g., a point that was `pending-confirmation` has been finalized), yet the `reflectStatus` of the corresponding `spec-to-bpmn-fixes.json` entry has not been updated | Update the entry's `reflectStatus` / `params` (e.g., raise it to `ready`) |
| ② Entry not created | A new item to be reflected from the business requirements (role ID, task color, process variable, signal, message, process id replacement, call activity callee replacement, etc.) was added on the md side, but no corresponding `spec-to-bpmn-fixes.json` entry exists | Add a new entry following the `fixId` naming convention and the controlled vocabulary of `operation` in `guide-bpmn-validation.md` |
| ③ Content divergence | The `params`, etc. of an existing entry disagree with the latest description on the md side (a changed or deleted value, etc.) | Update the entry's `params` to match the content of the md |

**Procedure:**
1. Cross-check each entry of `spec-to-bpmn-fixes.json` against the corresponding description in the md, and identify the diffs that fall under the patterns above.
2. If there is not a single diff, you may record that fact and proceed to Phase 3 (this phase can be skipped).
3. If there are diffs, for each diff **present the fixId and the content before/after the change (`reflectStatus`/`operation`/`params`) to the user and obtain confirmation on whether it may be reflected** (do not reflect automatically).
4. Reflect only the approved diffs into `spec-to-bpmn-fixes.json`. This reflection is limited to adding/updating the JSON file; **do not write anything at all into the BPMN itself** (writing into the BPMN is the responsibility of the next phase, Phase 3).
5. The `fixId` naming convention, the meaning of `reflectStatus`, the controlled vocabulary of `operation`, and the default value of `requiresApproval` all follow the "Format of `spec-to-bpmn-fixes.json`" section of `.github/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` (this phase does not newly define any format).

**Notes:**
- This phase is a "judgment/confirmation" phase and, as with Phase 1 (the `.github/skills/bpm-docs-generator` side), user confirmation is mandatory. This does not affect the principle on the `reflectFixes()` (Phase 3) side of "making no new judgments".
- Because this phase involves processing that mechanically converts the descriptions on the md side into structured data (natural language interpretation), it is performed by a manual read-through (by a human, or by the agent that invokes this skill); automatic diff detection by a dedicated script is not assumed.

### Phase 3: Reflecting the JSON (`reflectFixes()`)
Read `spec-to-bpmn-fixes.json` and mechanically reflect into the target BPMN only the entries whose `reflectStatus` is `"ready"` and whose `operation` is supported. **Focus solely on writing content that has already been judged and confirmed; do not make any new judgments (decisions about what to reflect).** However, the verification, retry, and token attachment for `replace-process-id` / `replace-callee-process` are mechanical consistency verifications of "whether the written content was reflected as instructed in the specification document", and are included in the responsibility of this phase.

The reflection logic is implemented in `.github/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js`. The following describes its overview and how to call it.

## How to Use `reflectFixes()`

Before calling `reflectFixes()`, always perform "Phase 2: Checking/Reflecting Diffs Against the Specification Document" and bring `spec-to-bpmn-fixes.json` up to date.

### Example Call

```javascript
var reflector = require('./.github/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js');
var bpmnPath = 'doc/sample-process-prompt/sample-process.bpmn';
var fixesPath = 'doc/sample-process-prompt/spec-to-bpmn-fixes.json';

var result = reflector.reflectFixes(bpmnPath, fixesPath, {
  // Approval callback per fix (can be omitted for entries with requiresApproval: false)
  onFixReflectionDetected: function (fix, onApprove, onReject) {
    // Present the fixId, operation, targets, and params to the user and obtain approval
    console.log('fixId=' + fix.fixId + ' operation=' + fix.operation);
    console.log('targets=' + JSON.stringify(fix.targets) + ' params=' + JSON.stringify(fix.params));
    // Implementation example: obtain confirmation via vscode_askQuestions
    onApprove(); // or onReject();
  }
});

console.log(result); // { applied: ['FIX-001', ...], skipped: [{ fixId, reason }, ...] }
```

- If `bpmnPath` is passed in a form other than `doc/*-prompt/*.bpmn`, an exception is thrown (by `isPromptCopyBpmnPath()`).
- After reflection, only `reflectedDate` is updated and `fixesPath` is overwritten and saved (`reflectStatus` is not changed, since it retains the basis for the judgment).
- The reasons accumulated in `skipped` are mainly the following four kinds:
  - `reflectStatus is not ready: ...` (`pending-confirmation` / `not-applicable`)
  - `unsupported operation (manual reflection required): ...` (`convert-event-type` / `delete-element` / `manual`)
  - `user rejected` / `approval required but no confirmation callback provided`
  - `apply failed: ...` (verification failure of `replace-process-id`, etc. Reflection of other fixes continues.)

### Vendor Detection

When `reflectFixes()` reads the BPMN, it uses `detectVendor(xml)` to automatically determine the authoring vendor from the namespace declarations, and passes the vendor type to each `applyXxx` family of functions via `applyFixToTarget()`. Depending on the determination result, the attribute names and element tag names to be applied are switched (for the concrete correspondence, the implementations of each `apply*` function and of `resolveVendorName()` are authoritative. See "Common Rules").

| Vendor | Determination condition |
|---------|---------|
| `im-bpm` (produced by IM-BPM) | Contains `xmlns:activiti="http://activiti.org/bpmn"` |
| `igrafx` (produced by iGrafx) | The namespace URI contains `www.igrafx.com` |
| `other` | Does not correspond to either of the above |

### Operation Correspondence Table

| operation | Content reflected | Main `params` | Special notes |
|---|---|---|---|
| `set-attribute` | Adds/updates an attribute on an existing element | `attrName`, `attrValue` | A general-purpose operation that supports arbitrary elements/attributes |
| `set-eventdef-ref` | Sets `messageRef`/`signalRef`/`errorRef` on an event definition | `refType`, `refId` | Skipped if the element is a self-closing tag |
| `set-service-task-field` | Sets an `activiti:field` value on a ServiceTask | `fieldName`, `fieldValue` (use `fields: [{name, value}]` to set multiple at once) | |
| `set-condition-expression` | Adds a branch condition expression (EL expression) to a `sequenceFlow` | `expression` | |
| `set-timer-definition` | Sets the cycle/date-time/duration of a `timerEventDefinition` | One of `timeCycle` / `timeDate` / `timeDuration`, `businessCalendarName` (optional) | Skipped if the target element is a self-closing tag, or if `timerEventDefinition` does not exist |
| `set-role-starter-groups` | Sets `candidateStarterGroups` on a `process` | `roleId` | The target is process |
| `set-lane-candidate-groups` | Sets `candidateGroups` on a `lane` | `roleId` | The target is lane |
| `set-usertask-candidate-groups` | Sets `candidateGroups` and `isOptional` on a `userTask` | `roleId`, `isOptional` (optional) | The target is userTask |
| `set-task-color` | Sets the background color of a task | `taskType` | The color code is automatically determined from `taskType` (see the color map below) |
| `add-data-object` | Adds a process variable (`dataObject`) to a `process` | `variables: [{ id, name, type }]` | The target is process. Existing ids are skipped (idempotent) |
| `add-signal` | Newly adds a `signal` element | `id`, `name` | If the ID is undefined in the specification document, it is not written out to this file (i.e., it is not reflected). Existing ids are skipped (idempotent) |
| `add-message` | Newly adds a `message` element | `id`, `name` | Same as above |
| `replace-process-id` | Replaces the process definition key (process id). Involves verification (up to 2 retries) and attaching a `PROCESS_KEY_META` token | `fromId` (for identifying the replacement target), `toId` (the replacement value), `allowFromIdExists` (optional) | A destructive operation. `requiresApproval: true` is mandatory, and approval is also required at the time of mechanical reflection (this phase) |
| `replace-callee-process` | Replaces the callee process (`calledElement`) of a callActivity. Involves attaching a `CALLEE_PROCESS_META` token | `fromId` (the value of `calledElement` before replacement), `toId` (the value after replacement) | The target is callActivity. A destructive operation. `requiresApproval: true` is mandatory |

`convert-event-type` / `delete-element` / `manual` (operations involving structural change, deletion, or synchronization of diagram information) are outside the scope of automatic reflection, and `reflectFixes()` skips them (leaving them to manual handling or a separate step. For details, see the "Design Constraints" section of `.github/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`).

### Rules for Specifying `targets`

- For operations that target an existing element (the `set-attribute` family, the `set-role-starter-groups` family, `replace-callee-process`, etc.), specify the actual ID of the target element with `targets: [{ elementId, elementType }]`.
- Since `replace-process-id` rewrites the `id` of the target process itself, `params.fromId` is used to identify the replacement target (`targets` may also be attached, but it is not referenced in the actual reflection process).
- For operations that issue a new ID, such as `add-signal` / `add-message`, since they do not reference an existing element, describe `targets: [{ elementId: <newly issued id>, elementType: 'bpmn:Signal' | 'bpmn:Message' }]` with the same value as `params.id` (for the sake of listability and traceability).
- **The `targets.elementId` of `add-data-object` refers to the `id` (processId) of the process itself.** If a `replace-process-id` entry targeting that process exists within the same `spec-to-bpmn-fixes.json`, specify **the value after replacement (`toId`)** for the `targets.elementId` of `add-data-object`. Since `reflectFixes()` applies the fixes array in order from the beginning, once `replace-process-id` has been reflected first and the process's `id` has been rewritten, if the value before replacement (`fromId`) is specified for `targets.elementId`, the target process will not be found and it will be skipped as `[SKIP] process not found: <fromId>` (note that this is not raised as an exception and is not counted in either `applied` or `skipped` — it is a silent skip). The same caution applies when adding, in the future, other operations that target the process itself.

  | Order within fixes.json | Value that should be specified for the `targets.elementId` of `add-data-object` |
  |---|---|
  | Does not include `replace-process-id` (no process id replacement occurs) | The current process id (unchanged) |
  | Includes `replace-process-id` at the same time | The value after replacement (`toId`). Specifying the value before replacement (`fromId`) results in a silent skip |

### Correspondence Between Task Type and Color Value

| taskType | color |
|----------|-------|
| `userTask` | `bbdefb` |
| `scriptTask` | `fff9c4` |
| `serviceTask` | `f9dcc0` |
| `mailTask` | `f7c9cf` |
| `manualTask` | `b2dfdb` |
| `receiveTask` | `e0caf7` |
| `callActivity` | `f9c0e4` |

### Common Rules

- If the attribute or element already exists, it is skipped (idempotent). For `replace-process-id` / `replace-callee-process` as well, the determination is made based on the presence or absence of an already embedded `PROCESS_KEY_META` / `CALLEE_PROCESS_META` token, so re-running the same fix does not result in duplicate reflection.
- Namespace prefixes such as `<bpmn:process>` are also supported.
- Since the determination of the vendor and the switching of attribute names/tag names are performed automatically inside `reflectFixes()`, the caller does not need to be aware of them. For exactly how the attribute names and tag names change per vendor, the implementations and JSDoc of each `apply*` function (`bpmn-specs-reflector.js`) and of `resolveVendorName()` / `detectVendor()` (`bpmn-reflector-utils.js`) are authoritative (this file does not maintain a duplicate).

## Main Functions Called from `applyFixToTarget()`

| Function | Role |
|------|------|
| `detectVendor(xml)` | Determines the authoring vendor (`'im-bpm'` / `'igrafx'` / `'other'`) from the namespace declarations |
| `applyProcessCandidateStarterGroups(xml, processId, roleId, vendor)` | The main body of the reflection for `set-role-starter-groups` |
| `applyLaneCandidateGroups(xml, laneId, roleId, vendor)` | The main body of the reflection for `set-lane-candidate-groups` |
| `applyUserTaskCandidateGroups(xml, taskId, roleId, vendor)` | The main body of the reflection for `set-usertask-candidate-groups` (the `candidateGroups` part) |
| `applyIsOptional(xml, taskId, vendor)` | The main body of the reflection for `set-usertask-candidate-groups` (only when `params.isOptional` is true) |
| `applyTaskColor(xml, taskId, taskType, vendor)` | The main body of the reflection for `set-task-color` |
| `applyAttribute(xml, elementId, attrName, attrValue)` | The main body of the reflection for `set-attribute`. Unlike the existing `apply*` family, it overwrites the value |
| `applyEventDefinitionRef(xml, elementId, refType, refId)` | The main body of the reflection for `set-eventdef-ref` |
| `applyServiceTaskField(xml, taskId, fieldName, fieldValue)` | The main body of the reflection for `set-service-task-field` |
| `applyTimerDefinition(xml, ownerId, params)` | The main body of the reflection for `set-timer-definition` |
| `applyDataObjects(xml, processId, variables, vendor)` | The main body of the reflection for `add-data-object` |
| `applyConditionExpression(xml, flowId, expression, vendor)` | The main body of the reflection for `set-condition-expression` |
| `applySignal(xml, signalId, signalName, vendor)` | The main body of the reflection for `add-signal` |
| `applyMessage(xml, messageId, messageName, vendor)` | The main body of the reflection for `add-message` |
| `applyCalleeProcessReplacement(xml, callActivityId, fromId, toId)` | The main body of the reflection for `replace-callee-process`. Overwrites the `calledElement` attribute and attaches the `CALLEE_PROCESS_META` token |
| `applyVerifiedProcessIdReplacements(xml, replacements)` | The main body of the reflection for `replace-process-id`. Performs the replacement, verification (up to 2 retries), and attaching the `PROCESS_KEY_META` token in memory (does not write to the file) |
| `applyFixToTarget(xml, fix, target, vendor)` | Dispatches to the above functions according to `fix.operation` (`replace-process-id` / `replace-callee-process` are handled separately within `reflectFixes()`) |
| `reflectFixes(bpmnPath, fixesPath, options)` | The main API of this file. Executes the above together |
| `replaceProcessId(xml, fromId, toId)` | Replaces the Process ID (replaces both `<process id>` and `<participant processRef>`) |
| `extractRepositoryObjectId(xml)` | Obtains the value of the `ixbpmn:repositoryObjectID` attribute held by `<bpmn:definitions>` (iGrafx-produced BPMN only. Returns `null` if it does not exist) |
| `applyProcessKeyMetaToken(xml, fromId, toId)` | Adds a `PROCESS_KEY_META` token as documentation to `<process id="toId">` |
| `verifyProcessIdReplacements(xml, replacements)` | Verifies that the process id replacement from-to matches the reflected BPMN (checks `process@id` and `participant@processRef`) |
| `checkProcessIdReplaced(bpmnPath, replacements)` | Determines whether the Process ID replacement has already been reflected (`replaced` / `not_replaced` / `partial`). Used for the check in Phase 1 (see `.github/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md`) |

## Format of the PROCESS_KEY_META / CALLEE_PROCESS_META Tokens

After the replacement of `process@id`, append a token in the following format to the process tag as documentation.

```
PROCESS_KEY_META:{REPOSITORY_OBJECT_ID=<value of repositoryObjectId>;ORIGINAL_PROCESS_KEY=<original process_id>;PROCESS_KEY=<process_id after numbering>};
```

- If a `<documentation>` (or `<bpmn:documentation>`) element already exists and the `PROCESS_KEY_META` token is not yet defined, append the token within that existing element (do not add a new element).
- If a documentation element does not exist, add a new element with a tag name corresponding to the vendor determination (`detectVendor()`): `<bpmn:documentation>` when produced by IM-BPM, and `<documentation>` for others (iGrafx-produced, other).
- If the `PROCESS_KEY_META` token already exists, it is skipped to avoid a duplicate addition.
- `REPOSITORY_OBJECT_ID` is not an attribute of the target process; it refers to **the value of the `ixbpmn:repositoryObjectID` attribute held by `<bpmn:definitions>` (the root element directly under the file)** (an attribute exclusive to iGrafx-produced BPMN).
- If `<bpmn:definitions>` does not have the `ixbpmn:repositoryObjectID` attribute, **the process is aborted as an error** (nothing at all is written to the target `.bpmn`). This abort is a failure condition independent of the verification retry, and no retry is performed.

After the replacement of the callee process of a call activity, append a token in the following format as documentation directly under the callActivity.

```
CALLEE_PROCESS_META:CALEE_PROCESS_REPLACED=true;ORIGINAL_CALLEE_PROCESS=<value of calledElement before replacement>;CALLEE_PROCESS=<value after replacement>;REPLACED_DATE=yyyy-MM-dd;
```

- If an existing documentation element exists, append within it; if not, add a new one (the same rule as `PROCESS_KEY_META`).
- If the token already exists, it is skipped to avoid a duplicate addition.

## Handling of Verification Failures (`replace-process-id` / `replace-callee-process`)

- If the verification of `replace-process-id` (equivalent to `verifyProcessIdReplacements()`) fails, it is automatically retried up to 2 times. If it still fails after retrying, only that fix is accumulated in `skipped`, and reflection of the other fixes continues.
- If `REPOSITORY_OBJECT_ID` cannot be obtained (e.g., an iGrafx-produced BPMN lacking the `ixbpmn:repositoryObjectID` attribute), it is immediately treated as an error, independent of the verification retry, and nothing is written to the target `.bpmn` at all.

## Exception: Prohibition of Re-replacement

For a process that has been determined to have already been replaced, new numbering must not be performed. The existing key must always be reused. This determination is made in Phase 1 (creating `spec-to-bpmn-fixes.json`) using `checkProcessIdReplaced()`, etc. (for details, see `.github/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md`).

- Where to obtain the existing key from:
  - Extract `PROCESS_KEY=<key>` from the documentation token
