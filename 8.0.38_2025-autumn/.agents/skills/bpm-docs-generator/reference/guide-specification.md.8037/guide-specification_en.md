# Structure of the Specification Document

The generated specification document must have the following structure.

1. Overview
   - Briefly describe what the process does.
   - Describe the business flow from start to finish in one to a few sentences.

2. Actors (Roles)
   - Describe the process participants/stakeholders based on pools, lanes, tasks, etc.
   - Propose a role ID based on the names of pools, lanes, and tasks.
     - The role ID must be lowercase snake_case and no longer than 20 characters.
   - Display a list in the following format.
      | Actor | Role ID | Role Name | Pool/Lane | Main Tasks/Events in Charge |
      |---|---|---|---|---|
      | <actor name> | <proposed role ID> | <proposed role name> | <pool/lane> | <main tasks in charge, etc. (optional)> |

3. Process Details
   - For each process, create a list in the following format to display events and tasks.
     | Event/Task Type | Owner | Screen | Description of Execution Condition |
     |---|---|---|---|
     | <event/task type> | <owner> | <link to screen definition, or -> | <description of execution condition> |
     - For the screen column in the list, write the screen definition name (as a link to the screen definition) if a screen exists, otherwise write "-".
     - If there is a call activity, state the name of the called process explicitly. If a specification document exists for the called process, make the called process name a link to that specification directory.
   - Describe how the process is started.
     - If there is no explicit instruction, start from the IM-BPM standard list of process start methods.
   - Describe the process's exception handling (explanation of error events and exception flows).
   - For independent tasks (no sequence flow, no boundary event), ask whether they should be treated as optional tasks.
     - Also record this in the to-be-discussed document.
   - Conditional branching: describe the gateway condition expressions and branching rules.
     - Whenever there is conditional branching, always propose a process variable to hold the judgment value.
     - The process variable for conditional branching is used in the judgment expression of the sequence flow condition via an EL expression.
   - Propose process variables as needed (e.g., for carrying forward the primary key information of business data).
   - If the imported BPMN has functionality that is expected to involve external integration, describe it.
   - For signal start events and signal catch events, clarify the sender of the signal and the condition for sending the signal.
     - If the signal sender or condition is not clear, raise it as an inquiry in the to-be-discussed document.
   - For message start events and message catch events, clarify the sender of the message and the condition for sending the message.
     - If the message sender or condition is not clear, raise it as an inquiry in the to-be-discussed document.

## Required When the Referenced BPMN Is Produced by iGrafx
- **Judgment target**: Make the determination by directly referencing, with the Read tool, the **original pre-conversion BPMN file** designated as the copy source in SKILL.md step 2 (do not create a duplicate; reference only, and do not modify that file). The converted `<BPM process name>-prompt/<BPM process name>.bpmn` cannot be used for this check, because the ixbpmn:/igx: elements and attributes have already been removed by the IM-BPM-oriented conversion performed by `bpmn-transform.js`.
- The criteria for determining whether a file is produced by iGrafx are the same as `detectVendor()` in `.agents/skills/bpm-docs-generator/scripts/bpmn-transform.js`. A file is judged to be produced by iGrafx if the original BPMN contains any of the following.
  - `exporter="iGrafx"`
  - Elements/attributes with the `ixbpmn:` prefix
  - An `xmlns:*` declaration whose namespace URI contains `igrafx.com`
- Elements and conditions judged as NG (not supported by IM-BPM)
  | Element Name | Judgment Condition | Suggested Action |
  | ---- | ---- | ---- |
  | Multi-level lanes | A `lane` has a `childLaneSet` tag as a child element | Propose changing the lanes to a single level |
  | Pool without lanes | A `process` tag has no `laneSet` as a child element | Recommend adding lanes |
  | Vertical pool | The `bpmndi:BPMNShape` tag associated with a `pool` or `lane` has the `isHorizontal="false"` attribute | Change to a pool |
  | Collapsed event sub-process | The `bpmndi:BPMNShape` tag associated with `subProcess (triggeredByEvent="true")` has the `isExpanded="false"` attribute | Propose changing to an event sub-process |
  | Collapsed sub-process | The `bpmndi:BPMNShape` tag associated with `subProcess (triggeredByEvent="false")` has the `isExpanded="false"` attribute | Propose changing to a sub-process |
  | Message send event | A `startEvent` tag has a `messageEventDefinition` tag as a child element | Recommend replacing with another event |
  | Escalation catch event | A `boundaryEvent` tag has an `escalationEventDefinition` tag as a child element | Recommend replacing with another event |
  | Cancel catch event | A `boundaryEvent` tag has a `cancelEventDefinition` tag as a child element | Recommend replacing with another event |
  | Compensation catch event | A `boundaryEvent` tag has a `compensateEventDefinition` tag as a child element | Recommend replacing with another event |
  | Conditional event | An `intermediateCatchEvent` tag has a `conditionalEventDefinition` tag as a child element | Recommend replacing with another event |
  | Link event receive | An `intermediateCatchEvent` tag has an `eventDefinitionRef` tag as a child element | Recommend replacing with another event |
  | Multiple throw events | An `endEvent` tag has multiple `messageEventDefinition` tags as child elements | Recommend replacing with another event |
  | Complex gateway | `complexGateway` tag | Recommend replacing with another gateway |
  | Send task | `sendTask` tag | Recommend replacing with another task |
  | Business rule task | `businessRuleTask` tag | Recommend replacing with another task |
  | Notification task | A `task` tag has the `ixbpmn:extendedTaskType="NOTIFICATION"` attribute | Recommend replacing with another task |
  | Mapping task | A `task` tag has the `ixbpmn:extendedTaskType="MAPPING"` attribute | Recommend replacing with another task |
  | Report task | A `task` tag has the `ixbpmn:extendedTaskType="REPORTING"` attribute | Recommend replacing with another task |
  | Manual service task | A `task` tag has the `ixbpmn:extendedTaskType="MANUAL_SERVICE"` attribute | Recommend replacing with another task |
  | Automated service task | A `task` tag has the `ixbpmn:extendedTaskType="AUTOMATED_SERVICE"` attribute | Recommend replacing with another task |
  | Rule flow task | A `task` tag has the `ixbpmn:extendedTaskType="RULE_FLOW"` attribute | Recommend replacing with another task |
  | Rule script task | A `task` tag has the `ixbpmn:extendedTaskType="RULE_SCRIPT"` attribute | Recommend replacing with another task |
  | Decision table task | A `task` tag has the `ixbpmn:extendedTaskType="DECISION_TABLE"` attribute | Recommend replacing with another task |
  | Rule task | A `task` tag has the `ixbpmn:extendedTaskType="RULE"` attribute | Recommend replacing with another task |
  | Rule set task | A `task` tag has the `ixbpmn:extendedTaskType="RULE_SET"` attribute | Recommend replacing with another task |
  | Flow rule set task | A `task` tag has the `ixbpmn:extendedTaskType="FLOW_RULE_SET"` attribute | Recommend replacing with another task |
- Output the judgment results for the above NG elements to `to-be-discussed.md` at the same time they are recorded in the process details of `specification.md`.
  - Verification results/suggested actions: record them in Chapter 1, "iGrafx-specific Element Compatibility Check," always with severity "High," including the suggested actions (see `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` for the recording rules).
  - Do not output these to `spec-to-bpmn-fixes.json` (since the operational practice is to fix the BPMN on the iGrafx side, these are out of scope for automatic reflection by `.agents/skills/bpm-xml-reflector/SKILL.md`).
- For call activities, state the name of the called process explicitly. Identify it as follows.
  - Script used: check the destination of each call activity from the return value of `.agents/skills/bpm-docs-generator/scripts/search-called-elements.js`.
    - Example invocation: `{{ENSURE_CMD}} .agents/skills/bpm-docs-generator/scripts/search-called-elements.js <diagram.bpmn>`
  - Record the result (the process name, or "destination unknown") in the call activity item of the process details.
  - Also record the result in "Chapter 3: Call Activity Callee Process Replacement History" of `to-be-discussed.md`.
  - Once the callee process is finalized, also output it to `spec-to-bpmn-fixes.json` with `operation: "replace-callee-process"` (for details, see "Output to `spec-to-bpmn-fixes.json`" at the end of this file). Do not output it if the destination is unknown.

**Notes on Process Variables**
 - Propose an ID, name, and type for each process variable.
   - Make the ID and name suggestive of the value being set.
   - Choose the type from `string`, `boolean`, `datetime`, `int`, `long`, `double` according to the intended use of the value.
 - Since the process instance ID can be obtained from the implicit object (`${execution.processInstanceId}`), exclude it from the process variable candidates.
 - Exclude elements from the process variable candidates if they can be substituted by an item of the business data.
 - **When a subsequent start event or user task needs to display/carry over business data that was entered in a preceding step** (a case where the business data is managed with a composite primary key of `process instance ID + task ID`, i.e., "one completed task = one row"; see [guide-business-data.md](.agents/skills/bpm-docs-generator/reference/guide-business-data.md)), propose a process variable that holds the task ID of the preceding step's own task, to be set upon its completion.
   - Naming example: `<feature name>TaskId` (e.g., `applyTaskId` for a "purchase application input" task). The type is `string`.
   - Purpose: used by the subsequent task's screen display processing to retrieve the record from the preceding step, using `process instance ID + this process variable` as the search condition. Note that its purpose differs from that of a process variable used for branch determination.
   - Timing of the setting: at the completion processing of the preceding step (a start event or user task), set its own `taskId` (or, in the case of a start event, the task ID issued at the start of the process instance, etc.) as-is.
 - When adopting the policy of registering the start event's input values directly into the business data at the moment the process starts (see "When the start event is involved in the input/output of business data" in [guide-business-data.md](.agents/skills/bpm-docs-generator/reference/guide-business-data.md)), exclude that item from the process variable candidates. Make clear that subsequent tasks retrieve it again from the business data (the row with the fixed pseudo task ID), rather than from a process variable.

## Output to `spec-to-bpmn-fixes.json`

The following items proposed and finalized by this guide are also output to `doc/<BPM process name>-prompt/spec-to-bpmn-fixes.json` at the same time they are recorded in `specification.md` (and, where applicable, in `to-be-discussed.md`). The entry structure, `fixId` naming conventions, and controlled `operation` vocabulary are authoritatively defined in "Format of `spec-to-bpmn-fixes.json`" in `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`; the actual reflection into the BPMN is performed by `reflectFixes()` of `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md`, using this file as its sole input.

| Proposed Item | `operation` | Target of `targets` | Main `params` |
|---|---|---|---|
| Role ID (pool/process starter) | `set-role-starter-groups` | process | `roleId` |
| Role ID (lane) | `set-lane-candidate-groups` | lane | `roleId` |
| Role ID (task)/optional task | `set-usertask-candidate-groups` | userTask | `roleId`, `isOptional` (when applicable) |
| Task background color | `set-task-color` | task | `taskType` |
| Process variable | `add-data-object` | process | `variables: [{ id, name, type }]` |
| Signal definition | `add-signal` | - | `id`, `name` |
| Message definition | `add-message` | - | `id`, `name` |
| Call activity callee process replacement | `replace-callee-process` | callActivity | `fromId`, `toId` |

**Notes on Output**
- For signals/messages, do not create an entry, even if `id`/`name` are known, while the sender or sending condition is unclear and is still being raised as an unresolved item in the to-be-discussed document. Add the entry only after the user's answer has been finalized.
- For the call activity callee replacement, do not create an entry if the result of `.agents/skills/bpm-docs-generator/scripts/search-called-elements.js` is "destination unknown." Once the callee process name is finalized, add it with `fixId: CALLEE-<sequence number>`.
- For the task background color (`set-task-color`), automatically create an entry (`requiresApproval: false`) even without explicit instructions in the specification, provided all of the following are satisfied.
  - The target BPMN is produced by iGrafx (BPMN produced by IM-BPM is out of scope, since `activiti:color` is managed separately in that case). Make this determination by referencing the source BPMN (the original pre-conversion file), the same way as in "Required When the Referenced BPMN Is Produced by iGrafx" at the beginning of this file.
  - The target task's type is subject to the color map of `bpmn-xml-reflector` (`userTask` / `scriptTask` / `serviceTask` / `mailTask` / `manualTask` / `receiveTask` / `callActivity`; for details, see "Correspondence Between Task Types and Color Values" in `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md`).
  - The target task has no `color` attribute set (if one is already set, respect the existing color scheme and do not create an entry).
- Items such as role ID, task color, and process variables, which do not require a business decision and are uniquely determined from the content of the specification, may be set to `requiresApproval: false` (however, `replace-callee-process` is always `true`, since it is a destructive operation).
- For the `fixId` naming conventions (prefixes such as `ROLE-`/`COLOR-`/`VAR-`/`SIG-`/`MSG-`/`CALLEE-`), see `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`.
- **For the process variable (`add-data-object`), `targets.elementId` must specify the target process's `id` (processId). If the same `spec-to-bpmn-fixes.json` contains a `replace-process-id` (process definition key replacement) entry targeting that process, specify the** ***post-replacement value (`toId`)*** **in `targets.elementId`, not the pre-replacement value (`fromId`).** Since `reflectFixes()` applies the fixes array in order from the top, specifying the pre-replacement value will cause the target process not to be found after the process id replacement has been reflected, and `add-data-object` will be silently skipped (for details, see "Rules for Specifying `targets`" in `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md`).
