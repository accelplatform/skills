# BPMN Specification Reflector

## Overview
Parses BPMN-format XML and reflects the contents of the specifications into the BPMN.

## When to Use
When the user makes a request such as the following:
- "Reflect the contents of the specifications in `doc/<BPM process name>-prompt/` into the BPMN XML"
- "Reflect the contents of the specifications into the BPMN XML"

## Reflection Target
- Correct: `doc/<BPM process name>-prompt/<BPM process name>.bpmn` (the copy destination; this is the only file that may be modified)
- Incorrect: `doc/<BPM process name>.bpmn` (the copy source; **never rewrite this file**)

## What Is Reflected into the BPMN XML
- This skill set performs the following:
  - Process definition key replacement
  - Adding role IDs
  - Setting task background colors
  - Optional task settings
  - Adding process variable definitions
  - Adding signal definitions
  - Adding message definitions

## Procedure

### Step 0. Confirm the Targets
- Confirm the specifications to reflect from and the file to reflect into.
  - Present the path of the specifications to reflect from and the path of the BPMN file to reflect into, then confirm that they are correct.
- Confirm what will be reflected
  - Extract and present the items to be reflected from the specifications, and ask which items should be reflected.
- Confirm whether to perform the reflection
  - Confirm whether to perform the reflection process. If YES, execute Step 1 and onward. If NO, abort the process.

### Step 1. Process Definition Key Replacement (Fixed Order)

This flow must always be executed in this order.

#### 1-1. Already-Replaced Check (JS)

- Execute:
  - `{{RUNTIME}} .claude/skills/bpm-xml-reflector/scripts/check-process-id-replaced.js <doc/*-prompt/*.bpmn> <replacements.json>`
- Judgment:
  - `replaced`: Already replaced. Do not run the replacement process.
  - `not_replaced` / `partial`: Proceed to Step 2.

#### 1-2. User Confirmation (Whether to Perform the Replacement)

- Present the from-to proposals in the specification `to-be-discussed.md`.
- Ask the user whether it is acceptable to replace with these from-to pairs.
- Proceed to Step 3 only if OK.

#### 1-3. Replacement Process

**This step must always be executed via `reflector.reflect()` in `.claude/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js` (which internally calls `reflectProcessIdReplacements()`).
The replacement must not be reproduced by reading and writing `.bpmn` directly with the Read/Write/Edit tools.**
The target file path is specified only as the `bpmnPath` argument. By `isPromptCopyBpmnPath()`,
anything other than the `doc/<BPM process name>-prompt/<BPM process name>.bpmn` format (including the copy source `doc/<BPM process name>.bpmn`)
throws an exception and is not reflected.
The following 1-3-1 through 1-3-5 describe the internal behavior of `reflectProcessIdReplacements()`; they are not steps the agent reproduces individually.

##### 1-3-1. Execute from-to Replacement (In Memory)
- Generate the XML replaced with the from-to pairs proposed in the specifications in memory (do not write to disk).
- After replacing `process@id`, add a documentation tag to the process tag and append a token in the following format (existing descriptions are preserved).
```
PROCESS_KEY_META:PROCESS_KEY_REPLACED=true;ORIGINAL_PROCESS_KEY=<original process_id>;PROCESS_KEY=<newly assigned process_id>;REPLACED_DATE=<YYYY-MM-DD>;REPLACE_POLICY=initial-only
```

##### 1-3-2. Replacement Verification (JS)
- Internally performs verification equivalent to `verifyProcessIdReflections()`.
- Verification targets:
  - `participant@processRef`
  - `process@id`
- Example of running it standalone (from the `reference/` directory):
  - `{{RUNTIME}} .claude/skills/bpm-xml-reflector/scripts/verify-process-id-reflection.js <doc/*-prompt/*.bpmn> <replacements.json>`

##### 1-3-3. Retry on Verification Failure
- If verification fails, retry automatically up to 2 times.
- If it still fails after retrying, abort the process as an error and show the failure points to the user.

##### 1-3-4. After User Approval, Write Directly to the File
- Present the verified, replaced XML to the user through the `onProcessIdReplacementDetected` callback.
- Show "which from-to pairs will be reflected into which file (path)" and obtain approval.
- Only when approved, write the replaced XML directly to the target `.bpmn`.
- If rejected, do nothing (since the target `.bpmn` is not modified at all before approval, no restoration process is required).

##### 1-3-5. Completion Confirmation
- Show "which file (path) the replacement was completed for".
- Confirm with the user that the target is correct.

#### 1-4. Update the Specifications

- Update the process definition key replacement history in `to-be-discussed.md`.
  - Replacement status: Replaced
  - Basis for judgment: documentation token (after reflection)
  - Reflection date and time: YYYY-MM-DD
  - Reflection date of each replacement proposal table: YYYY-MM-DD

#### 1-5. Update the Change History

- Record the following in `interactive-log.md`.
  - Execution date and time
  - Target file path
  - List of from-to pairs
  - User confirmation results (1-2 / 1-3-4)
  - Verification results (1-3-2 / 1-3-3)

#### Exception: Re-replacement Is Prohibited

For a process determined to be already replaced, a new key must not be assigned. Always reuse the existing key.

- Where to obtain the existing key:
  - Extract `PROCESS_KEY=<key>` from the documentation token


### Step 2. Reflection of Role IDs, Task Background Colors, Optional Task Settings, Process Variables, Signal Definitions, and Message Definitions

The reflection logic is implemented in `.claude/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js`. The following is its overview and how to call it.

#### Processing Overview

| Function | Role |
|------|------|
| `applyProcessCandidateStarterGroups(xml, processId, roleId)` | Adds `candidateStarterGroups="<role ID>"` to the `<process>` tag |
| `applyLaneCandidateGroups(xml, laneId, roleId)` | Adds `candidateGroups="<role ID>"` to the `<lane>` tag |
| `applyUserTaskCandidateGroups(xml, taskId, roleId)` | Adds `candidateGroups="<role ID>"` to the `<userTask>` tag |
| `applyTaskColor(xml, taskId, taskType)` | Adds a `color` attribute according to the task type (see the color map below) |
| `applyIsOptional(xml, taskId)` | Adds `isOptional="true"` to the tag of an optional task |
| `applyDataObjects(xml, processId, variables)` | Inserts process variables as `<dataObject>` at the end of the `<process>` block |
| `applyConditionExpression(xml, flowId, expression)` | Inserts `<conditionExpression>` into `<sequenceFlow>` (self-closing tags are expanded automatically) |
| `applySignal(xml, signalId, signalName)` | Inserts a `<signal>` element immediately before `<process>` |
| `applyMessage(xml, messageId, messageName)` | Inserts a `<message>` element immediately before `<process>` |
| `replaceProcessId(xml, fromId, toId)` | Replaces the Process ID (replaces both `<process id>` and `<participant processRef>`) |
| `reflectProcessIdReplacements(bpmnPath, xml, replacements, options)` | Performs the Process ID replacement in memory and, after user confirmation, writes directly to the target `.bpmn` (no `.tmp` is created; specify the `onProcessIdReplacementDetected` callback in the options argument) |
| `verifyProcessIdReplacements(xml, replacements)` | Verifies that the process id replacement from-to pairs in the specifications match the reflected BPMN (checks `process@id` and `participant@processRef`) |
| `reflect(bpmnPath, specs, options)` | Executes the above collectively and overwrites the BPMN file (the behavior during process id replacement can be customized with the options argument) |

**Mapping of task type to color value:**

| taskType | color |
|----------|-------|
| `userTask` | `bbdefb` |
| `scriptTask` | `fff9c4` |
| `serviceTask` | `f9dcc0` |
| `mailTask` | `f7c9cf` |
| `manualTask` | `b2dfdb` |
| `receiveTask` | `e0caf7` |
| `callActivity` | `f9c0e4` |

**Common rules:**
- If the attribute or element already exists, it is skipped (idempotent)
- Namespace prefixes such as `<bpmn:process>` are also supported

### Step 3. Replace the Called Process of Call Activities

**Notes when replacing the called process**
- No checks are required against the called process.
  - Do not perform existence checks on the called process or content checks of the called process.

#### 3-1. Obtain the Post-Replacement Value (Process Definition Key)
- Obtain the post-replacement value (process definition key) from the call activity called-process replacement history in `to-be-discussed.md` and from the called BPMN.
  - Confirm that the call activity called-process replacement history matches the ID (process definition key) of the called BPMN.
  - If the post-replacement value cannot be determined — for example, the post-replacement value is undecided, the values in `to-be-discussed.md` and the called BPMN conflict, or the ID of the called BPMN has not been replaced — display "value unknown" in the "post-replacement value" column of the list in 3-3.

#### 3-2. Already-Replaced Check (JS)
- Check whether the value of the called process of the call activity in the BPMN to be updated has already been replaced.
  - If it has already been replaced and the post-replacement value matches the value obtained in 3-1, replacement is not required.

#### 3-3. User Confirmation (Whether to Perform the Replacement)
- Display the list of call activities obtained in 3-1 and 3-2, and confirm whether to perform the replacement. Also, for entries whose post-replacement value is undecided, confirm the ID (process definition key) and prompt for input.
  - The list shows the call activity name, the pre-replacement value, the post-replacement value (process definition key), and whether replacement is required.
  - For call activities determined in 3-2 as not requiring replacement, display "Already replaced" in the replacement-required column.
  - For call activities determined in 3-2 as not yet replaced, display "Awaiting replacement" in the replacement-required column.
  - For entries whose post-replacement value is unknown, display "Awaiting value decision" in the replacement-required column.
- If there are call activities whose post-replacement value cannot be decided, state that reflection into those call activities will be skipped.
  - Also notify the user that the call target of the call activity can be configured in Process Designer after uploading the BPMN to IM-BPM.

#### 3-4. Replacement Process
- Replace the values of the called processes of the call activities based on the list in 3-3.
  - Add a documentation tag under the callActivity tag. Enter the following.
    - CALLEE_PROCESS_META:CALEE_PROCESS_REPLACED=true;ORIGINAL_CALLEE_PROCESS=<pre-replacement value of calledElement>;CALLEE_PROCESS=<post-replacement value>;REPLACED_DATE=yyyy-MM-dd;
  - Overwrite `calledElement` of the callActivity tag with the post-replacement value.

#### 3-5. Update the Specifications

- Update the call activity called-process replacement history in `to-be-discussed.md`.
  - Reflection date: YYYY-MM-DD

#### 3-6. Update the Change History

- Record the following in `interactive-log.md`.
  - Execution date and time
  - Target file path
  - List of replaced call activities
  - User confirmation results (3-3)

### Call Example (Execute in the Order Step 1 → Step 2)

Step 1 (process definition key replacement) and Step 2 (role IDs, colors, variables, etc.) must always **call `reflect()` separately, and Step 2 must not begin until the completion of Step 1 has been confirmed**.
Do not pass both sets of fields to a single `reflect()` call.

```javascript
var reflector = require('.claude/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector');
var bpmnPath = 'doc/vehicle-management-prompt/vehicle-management.bpmn';

// ---- Step 1: Process definition key replacement (performed on its own) ----
// If processIdReplacements is not needed, Step 1 may be omitted and Step 2 performed directly.
reflector.reflect(
  bpmnPath,
  {
    // Cross-check of the process id replacement against the specifications (the from-to pairs in to-be-discussed.md)
    processIdReplacements: [
      { fromId: 'Process_1', toId: 'daily_check_0001' }
    ]
  },
  {
    // User confirmation callback (required only in Step 1)
    onProcessIdReplacementDetected: function(filePath, replacements, onApprove, onReject) {
      // Confirm with the user; call onApprove() if approved, or onReject() if rejected
      console.log('File to be replaced: ' + filePath);
      replacements.forEach(function(r) {
        console.log('  ' + r.fromId + ' → ' + r.toId);
      });
      // Implementation example: confirm with vscode_askQuestions
      onApprove(); // or onReject();
    }
  }
);

// ---- Step 2: Reflection of role IDs, task background colors, optional task settings,
//              process variables, signal definitions, and message definitions (performed after Step 1 completes) ----
reflector.reflect(
  bpmnPath,
  {
    // Role settings for processes and pools
    processes: [
      { id: 'r_1', roleId: 'quality_safety_mgr' }
    ],

    // Role settings for lanes
    lanes: [
      { id: '_4', roleId: 'quality_safety_mgr' }
    ],

    // Role settings for user tasks (isOptional is optional)
    userTasks: [
      { id: '_32', roleId: 'quality_safety_mgr' },
      { id: '_10', roleId: 'quality_safety_mgr', isOptional: true }
    ],

    // Process variables (type: string / int / long / double / datetime / boolean)
    dataObjects: [
      {
        processId: 'r_1',
        variables: [
          { id: 'vehicleId', name: 'vehicleId', type: 'string' }
        ]
      }
    ],

    // Branch conditions (EL expressions)
    conditions: [
      { flowId: '_50', expression: "${approved == 'true'}" },
      { flowId: '_51', expression: "${approved == 'false'}" }
    ],

    // Signal definitions
    signals: [
      { id: 'sig1', name: 'OrderCompleted' }
    ],

    // Message definitions
    messages: [
      { id: 'msg1', name: 'Notification' }
    ],

    // Coloring of tasks (see the color map above for taskType)
    colorize: [
      { taskId: '_32', taskType: 'userTask' },
      { taskId: '_10', taskType: 'userTask' }
    ]
    // Do not specify processIdReplacements here (it was already reflected in Step 1)
  }
);
```

### Notes on Each specs Field

- `processes` / `lanes` / `userTasks`: For the role ID (`roleId`), use the ID described in the actor definitions of the specifications
- `dataObjects`: Specify one of `string` / `int` / `long` / `double` / `datetime` / `boolean` for `type`
- `conditions`: Write `expression` as an EL expression (e.g. `${p1 > 999}`). `>` may be written as-is (the script treats it as a value)
- `colorize`: Color all user tasks. Specify the other task types just as thoroughly, without omissions
- `processIdReplacements`: Set the process id replacement proposals (from-to) described in the specifications. `toId` is required. It is verified that both `process@id` and `participant@processRef` have been replaced with `toId`. Add `allowFromIdExists: true` only for cases where `fromId` may remain after reflection. **Specify this only in the Step 1 call; do not include it in the Step 2 call**
- Fields that are not needed may be omitted (`reflect` fills in each field with `|| []`)
- When a Process ID replacement is involved, specify the `onProcessIdReplacementDetected` callback in the third argument `options` (for the user confirmation flow)

### Specifying options (the Third Argument)

**Required only in Step 1 (the call that passes `processIdReplacements`). Not required for the Step 2 call.**

```javascript
{
  onProcessIdReplacementDetected: function(filePath, replacements, onApprove, onReject) {
    // filePath: path of the file to be replaced
    // replacements: array of replacement contents [{ fromId: '...', toId: '...' }, ...]
    // onApprove: callback on approval (no arguments)
    // onReject: callback on rejection (no arguments)
    //
    // Implementation example:
    // - Show a confirmation dialog with vscode_askQuestions
    // - The user selects "OK" → execute onApprove()
    // - The user selects "Cancel" → execute onReject()
  }
}
```
