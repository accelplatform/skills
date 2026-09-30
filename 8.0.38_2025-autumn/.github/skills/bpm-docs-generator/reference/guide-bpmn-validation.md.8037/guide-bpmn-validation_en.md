# BPMN Syntax/Reference Integrity Validation Guide

Defines the concrete procedure and description rules for the "BPMN Syntax/Reference Integrity Validation" performed immediately after reading a BPMN file.

## Purpose
To detect, at an early stage, notation deficiencies, broken references, and mismatches with diagram (shape) information in BPMN 2.0 XML, and to determine whether it is possible to proceed to specification document creation (step.4).

## Execution Procedure (Required)

**Script used:** `.github/skills/bpm-docs-generator/scripts/validate-bpmn.js`

```sh
# Basic
{{ENSURE_CMD}} .github/skills/bpm-docs-generator/scripts/validate-bpmn.js <diagram.bpmn> --rules .github/skills/bpm-docs-generator/scripts/rules-validate-default.json
# When specifying additional rules
{{ENSURE_CMD}} .github/skills/bpm-docs-generator/scripts/validate-bpmn.js <diagram.bpmn> --rules <rules.json>
```

**Exit code:** 0 = success (warnings only or none) / 1 = failure (errors present)

**When to use `--rules <rules.json>`:**
- Specify this when you want to add business-specific validation, in addition to the standard syntax/reference integrity checks, such as field validation for `ServiceTask` (mail tasks, workflow-start tasks, etc.) whose required items and format differ depending on `activiti:type`.
- If `doc/rules-validate.json` exists, it is used in preference; otherwise `scripts/rules-validate-default.json` is used. When adding a new validation viewpoint, create/update `doc/rules-validate.json` strictly in accordance with the specification in `.github/skills/bpm-docs-generator/reference/guide-bpmn-validation-rules.md`.
- Validation results based on `rules.json` are also direct output from validate-bpmn.js, so treat them the same way as the ERROR/WARN description rules in this guide (organize them while preserving the `[input(<id>)]` context information).


**Execution order (must be performed immediately after reading the BPMN file):**
1. Run validate-bpmn.js.
   - Validation viewpoints: namespace consistency (`xmlns:bpmn`, `xmlns:bpmndi`), source/target consistency, consistency with diagram placement, presence of startEvent/endEvent
2. Perform a detailed analysis of the validation results.
   - **Perform error classification**
     - Do not try to judge whether each error is a "real problem" or a "tool false positive" just by looking at it.
     - Check the following information to make the judgment:
       - The implementation status of the corresponding element in the BPMN XML (output example: does `<bpmn:startEvent id="...">` exist?)
   - **Perform severity assessment**
     - Simply classifying as "error" / "warning" is not sufficient.
     - Check whether it actually affects IM-BPM import or process execution.
     - Even if there is no impact, re-evaluate the severity from an operations/maintainability perspective.
   - **Dig deeper into candidate causes**
     - Check the tool's output specification (for iGrafx, the version and export settings)
     - Compare with similar processes (does the same error exist in other processes?)
   - **Perform impact analysis**
     - Emphasize "whether it affects specification document creation."
     - Also consider the potential impact during implementation or the testing phase.
     - Even if judged as "can be ignored," clearly state the reason.
3. Reflect the validation results into to-be-discussed.md.
4. Determine whether it is possible to proceed to step.4.

**Notes**
- Do not record, in the BPMN syntax/reference integrity validation results, any viewpoint not implemented in validate-bpmn.js.
- Do not perform any new syntax check, reference check, standards-compliance check, etc. that does not exist in validate-bpmn.js.
- Also, do not perform the detailed analysis described in this guide for checks that do not exist in validate-bpmn.js.
- Do not simply transcribe the error log; write descriptions that let the user understand what action to take next.

### Guidelines for Detailed Analysis

#### Severity Assessment Criteria
Assign a severity (High/Medium/Low) to each error based on the following criteria.

| Severity | Judgment Criteria | Judgment Example | Output Policy |
|--------|---------|--------|----------|
| **High** | Directly and adversely affects process execution, high likelihood of IM-BPM import failure, the business flow itself does not hold together | Missing start/end event, invalid reference, deadlock structure | **File individually** |
| **Medium** | Import succeeds but results in a warning/error at process execution time, additional work is needed during implementation | Non-standard notation, ambiguous attribute value | **File individually** |
| **Low** | No direct impact on specification, implementation, or operation; improvement recommended only from a future maintainability standpoint | Tool false positive, unused resource definition, informal association | **Only the count in the summary. Do not file individually** |


#### Guidelines for Root Cause Analysis
For each error, infer the root cause from the following viewpoints and present multiple candidates.

1. **Design-phase error**
   - Insufficient understanding of the BPMN specification
   - Misunderstanding of requirements or the business flow
   - Tool operation mistake

2. **Editing/reflection-phase error**
   - Missed reference update during a partial fix
   - Missed target reference specification after copy/paste
   - Missed element correspondence during merge/refactoring

3. **Tool generation specification limitation**
   - Limitation of the output specification of the BPMN editing tool (iGrafx, etc.)
   - Version-dependent notation differences
   - Non-standard output at export time

4. **Parser/validation tool implementation limitation**
   - Unsupported element type recognition
   - Limited scope of reference checking
   - Missed handling of nested structures

#### Guidelines for Impact Analysis
For each error, analyze the impact from the following viewpoints.

| Viewpoint | Analysis Points |
|------|------------|
| **Flow execution** | Does an error/warning occur at process execution time, does it deadlock, does it affect the execution result? |
| **IM-BPM import** | Does import fail, is it just a warning, can it be ignored and progress made? |
| **Specification** | Does it affect specification document creation, does the explanation become ambiguous, is there a possibility of misunderstanding? |
| **Implementation** | Is additional work needed during script implementation, does a problem occur during testing? |
| **Operations** | Does it make maintenance difficult during operation, is user support required? |

#### Limits of Detailed Analysis
- Detailed analysis is performed only to classify the output of validate-bpmn.js as either "an actual BPMN problem" or "a false positive due to a validation tool implementation limitation," and to supplement the severity, candidate causes, impact, and response policy.

## Description Rules for Validation Results

### BPMN Notation Errors
- **Definition:** Items that can be objectively judged by BPMN specification/reference integrity, such as XML syntax deficiencies, broken references, namespace inconsistency, and diagram reference inconsistency.
- **Conditions for assigning a VAL-series ID:** Assign only to a 1-to-1 correspondence with an ERROR/WARN from validate-bpmn.js, or to an organized result that aggregates the same kind of log entries with the same cause.
- **Further subdivision:**
  - **Actual BPMN problem (requires action)**: A problem with a high likelihood of adversely affecting process execution or causing an error at IM-BPM import time.
    - Example: missing start/end event, missing required attribute, invalid reference, contradiction in flow structure
  - **False positive due to validation tool implementation limitation (can be ignored)**: The actual BPMN XML is correct, but the validation tool fails to recognize the element.
    - Example: reference check failure for an element type not in the tool's known set, false positive due to a parser limitation
- **Response policy:**
  - Actual BPMN problem (severity "High" or "Medium"): Clearly indicate the range that can be mechanically fixed, and describe concrete fix steps or fix candidates.
  - Actual BPMN problem (severity "Low"): Do not file individually; include only in the summary count.
  - Validation tool false positive: Do not file individually. Include only in the "false positive due to tool implementation limitation" count in the summary.
- **Prohibited:** Do not file, as VAL-ERR / VAL-WARN, the results of any custom check that does not exist in validate-bpmn.js.
  - However, the iGrafx-specific element compatibility check (see "Required when the referenced BPMN is produced by iGrafx" in `.github/skills/bpm-docs-generator/reference/guide-specification.md`) does not originate from validate-bpmn.js, so it may be assigned `IGX-<sequence number>` and recorded in Section 1 as a separate category independent of the VAL series.


## Description Template for to-be-discussed.md

### Error ID
 - For an ERROR/WARN output directly by validate-bpmn.js, assign VAL-ERR-<sequence number> / VAL-WARN-<sequence number>.

### Template Structure for "BPMN Syntax/Reference Integrity Validation"
```md
### <Section Name>

#### <Error ID>. <Type>: <Target Element Name>

- **Target element**: <element name> (<element type> / <lane name> / <preceding/following element names, etc.>)
- **Severity**: High|Medium|Low
- **Problem content**: <plain-language description of the validation error type>
- **Candidate causes**:
  1. There is a possibility that <candidate cause 1>.
  2. There is a possibility that <candidate cause 2>.
  3. There is a possibility that <candidate cause 3>.
- **Impact**: <describe the impact on specification, implementation, and operation by viewpoint>
- **Response policy**: <concrete fix steps or improvement proposal>
- **Correction proposal**: See `spec-to-bpmn-fixes.json` (reflectStatus: <ready|pending-confirmation|not-applicable>)
```

#### About the "Response Policy"
- The "response policy" must ultimately resolve to one of the following:
  - ✅ **Can be fixed immediately**: State the fix steps clearly
  - ❓ **Requirement confirmation needed**: State the confirmation question clearly
  - ⏭️ **Handle after import**: State the handling at import time, and explain the reason for deferral

#### About the Correction Proposal (Machine-Readable)
- The machine-readable data of the correction proposal must not be embedded in the body of `to-be-discussed.md`; output it to **`spec-to-bpmn-fixes.json`** under the same `<BPM process name>-prompt/` directory.
  - In the body of `to-be-discussed.md`, describe only the "correction proposal" line of the template above (a reference to `spec-to-bpmn-fixes.json` + the current `reflectStatus`).
  - For every error filed individually (severity "High" or "Medium"), always add a corresponding entry to `spec-to-bpmn-fixes.json`. Do not add one for severity "Low" or validation tool false positives.
  - Output `to-be-discussed.md` and `spec-to-bpmn-fixes.json` at the same generation timing, so that there is no discrepancy or omission in the correspondence of `fixId`.
- `spec-to-bpmn-fixes.json` is a file that the scripts of `.github/skills/bpm-xml-reflector` read and write mechanically to manage whether reflection into the BPMN is possible, what content to reflect, and the results of reflection. The "no identification by ID alone" rule for the body of `to-be-discussed.md` does not apply to this file; recording the `elementId` (the actual BPMN ID) is mandatory here.
- **`spec-to-bpmn-fixes.json` is not a file dedicated solely to error correction proposals in this section.** Business requirement reflections described in the specification document, such as role IDs, task colors, optionality, process variables, signals, messages, process definition key replacement, and call activity callee replacement, are also output to the same file in the same format (for details, see `.github/skills/bpm-docs-generator/reference/guide-specification.md` and `.github/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md`). Reflection into the BPMN is performed mechanically by `reflectFixes()` of `.github/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md`, using this file as the sole input.

##### Format of `spec-to-bpmn-fixes.json`

- Format: JSON array. One entry per unit of reflection (1 error ID, or 1 business requirement reflection item).
- Output location: `doc/<BPM process name>-prompt/spec-to-bpmn-fixes.json`
- Entry structure:
```json
[
  {
    "fixId": "<ID following the naming convention below>",
    "reflectStatus": "ready | pending-confirmation | not-applicable",
    "operation": "<selected from the controlled vocabulary in the table below. Use manual if no automatic reflection means exists>",
    "targets": [
      { "elementId": "<actual ID of the target element>", "elementType": "<BPMN element type (e.g., bpmn:ServiceTask)>" }
    ],
    "params": {},
    "requiresApproval": true,
    "reflectedDate": "未反映"
  }
]
```

- Naming convention for `fixId`:
  - Correction proposal for a `validate-bpmn.js` error: use the error ID (sequence number) output by the validation tool as-is.
  - Business requirement reflection (an entry not tied to a validate-bpmn.js error): use `<category prefix>-<sequence number, 3+ digits>`. The category prefixes are as follows.

    | Category Prefix | Target `operation` |
    |---|---|
    | `ROLE-` | `set-role-starter-groups` / `set-lane-candidate-groups` / `set-usertask-candidate-groups` |
    | `COLOR-` | `set-task-color` |
    | `VAR-` | `add-data-object` |
    | `SIG-` | `add-signal` |
    | `MSG-` | `add-message` |
    | `PID-` | `replace-process-id` |
    | `CALLEE-` | `replace-callee-process` |

- `reflectStatus` must always correspond with the "response policy" category. The meaning of each value and whether reflection is possible are as follows.

  | Response Policy | reflectStatus | Reflection Possibility |
  |---|---|---|
  | ✅ Can be fixed immediately | `ready` | Currently a target for reflection (destructive operations still require separate user approval) |
  | ❓ Requirement confirmation needed | `pending-confirmation` | Cannot be reflected. Update to `ready` once the requirement confirmation answer is finalized |
  | ⏭️ Handle after import | `not-applicable` | Not currently a target for reflection (not automatically reflected) |

  Business requirement reflections (role ID, signal, message, etc.) must be handled the same way. In particular, if the ID of a signal or message is not defined in the specification document, do not create the entry itself (do not write out an empty `params.id` as `pending-confirmation`; add the entry only after the ID is finalized).

- `operation` must be selected from the following controlled vocabulary. If no corresponding reflection process exists, always set it to `manual`, and keep `requiresApproval` as `true` (`params` may be omitted).

  | operation | Description | Main `params` |
  |---|---|---|
  | `set-attribute` | Add/update an attribute on an existing element | `attrName`, `attrValue` |
  | `set-eventdef-ref` | Set `messageRef`/`signalRef`/`errorRef` on an event definition | `refType`, `refId` |
  | `set-service-task-field` | Set an `activiti:field` value on a service task (`flowId`/`version`/`to`/`text`, etc.) | `fieldName`, `fieldValue` |
  | `set-timer-definition` | Set the cycle/date-time/duration (`timeCycle`/`timeDate`/`timeDuration`) of a `timerEventDefinition` and `activiti:businessCalendarName` | `timeCycle` / `timeDate` / `timeDuration` (either one), `businessCalendarName` (optional) |
  | `set-condition-expression` | Add a condition expression to a branching flow | `expression` |
  | `set-role-starter-groups` | Set the role ID (`candidateStarterGroups`) on the process | `roleId` |
  | `set-lane-candidate-groups` | Set the role ID (`candidateGroups`) on the lane | `roleId` |
  | `set-usertask-candidate-groups` | Set the role ID and optionality on a user task | `roleId`, `isOptional` (optional) |
  | `set-task-color` | Set the background color on a task | `taskType` |
  | `add-data-object` | Add a new process variable (`dataObject`) (`targets.elementId` is the id of the target process. If there is a `replace-process-id` for that process in the same file, specify the post-replacement value `toId`. Specifying the pre-replacement value results in a silent skip) | `variables: [{ id, name, type }]` |
  | `add-signal` | Add a new signal definition (do not create an entry if the ID is undefined in the specification document) | `id`, `name` |
  | `add-message` | Add a new message definition (do not create an entry if the ID is undefined in the specification document) | `id`, `name` |
  | `replace-process-id` | Replace the process definition key (process id). Identify the target with `fromId` and reflect `toId` | `fromId`, `toId`, `allowFromIdExists` (optional) |
  | `replace-callee-process` | Replace the callee process of a call activity | `fromId`, `toId` |
  | `convert-event-type` | Convert the event type (e.g., intermediate catch event → start event) | `fromTag`, `toTag` |
  | `delete-element` | Delete an unnecessary element (deletes the model element and its diagram information at the same time) | - |
  | `manual` | No automatic reflection means exists (manual handling required) | - |

- `requiresApproval` defaults to `true`. Destructive operations such as `delete-element` / `convert-event-type` / `replace-process-id` / `replace-callee-process` must always be `true`, and changing them to `false` is not permitted.
- `reflectedDate` should record the date the reflection was performed (`YYYY-MM-DD`) or the literal `未反映` (not yet reflected), and should only be updated after reflection by `.github/skills/bpm-xml-reflector/SKILL.md`. `reflectStatus` itself is not changed after reflection, since it retains the basis for the judgment. Also synchronize the `reflectStatus` display of the "correction proposal" line on the `to-be-discussed.md` side at the same time.

##### Design Constraints (Full Clearance of validate-bpmn.js Is Out of Scope)

`reflectFixes()` of `.github/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` automatically reflects only the addition/update of attributes, field values, and elements that correspond to the controlled vocabulary in the table above. Errors falling into the following categories will not be automatically reflected even if given `reflectStatus: ready` (they are left to `operation: manual` for manual handling or a separate step).

| Applicable Error | Reason |
|---|---|
| Missing start/end event, duplicate ID, invalid source/target of a SequenceFlow, crossing a subprocess boundary, gateway lacking an outgoing flow | Requires adding/removing elements or re-wiring connections (operations such as `add-element`/`add-sequence-flow` are not defined) |
| DI consistency error (unknown `bpmnElement` reference, missing waypoints) | Requires adding/removing diagram elements (`delete-element` exists in the operation vocabulary, but is not implemented in `reflectFixes()`) |
| Among unresolved Message/Signal references, cases where the referenced definition itself is also undetermined in the specification document | `add-signal`/`add-message` are added to `spec-to-bpmn-fixes.json` only after the ID is finalized, so they are not reflected while still undetermined |

Therefore, even if all entries in `spec-to-bpmn-fixes.json` reach `reflectStatus: ready`, `.github/skills/bpm-docs-generator/scripts/validate-bpmn.js` will remain FAIL as long as even one of the above errors remains. This is an intentional design, in line with the purpose of `reflectFixes()`, which is to automate only what can be safely and mechanically reflected. To make `.github/skills/bpm-docs-generator/scripts/validate-bpmn.js` PASS, the above applicable errors must be fixed manually.

#### About the Order of Individually Filed Items
- Errors filed individually (severity "High" or "Medium") should be grouped and listed in order of severity "High" → "Medium". Within the same severity, maintain the output order of validate-bpmn.js (order of error ID sequence numbers).
- When splitting sections by severity, state the severity clearly in the heading (e.g., `### Severity: High` / `### Severity: Medium`). Even when not split, the description order should still prioritize severity.

### Output Destination for Validation Results
Output the validation results to Section 1, "BPMN Syntax/Reference Integrity Validation Results," of `to-be-discussed.md`, as follows.

- **Validation Result Summary**
  ```
  ### Validation Result Summary

  Result of running `validate-bpmn.js` (exit code X).

  ERROR: Y, WARN: Z → <PASS|FAIL>

  | Category | Count | Description |
  |------|------|------|
  | Actual BPMN problem (requires action) | n | Specific content |
  | False positive due to tool implementation limitation | m | Specific content |
  ```

- **BPMN Notation Errors**
  - File individually only "actual BPMN problems" with severity "High" or "Medium"
  - Do not file individually items with severity "Low" or "tool false positives" (include only in the summary count)
  - VAL-series items described here must be limited to the direct output of validate-bpmn.js

- **iGrafx-Specific Element Compatibility Check**
  - Describe this only if the target BPMN is produced by iGrafx. If not produced by iGrafx, mark this subsection as "not applicable."
  - Based on the NG-element determination table in "Required when the referenced BPMN is produced by iGrafx" of `.github/skills/bpm-docs-generator/reference/guide-specification.md`, detect against the source BPMN (the original file before conversion) as the determination target.
  - Use `IGX-<sequence number>` for the error ID (a numbering independent of the VAL series). For all entries, fix the severity to "High" (since there is a high likelihood of import failure due to lack of IM-BPM support).
  - Template (omit candidate causes and correction proposal; the response policy is fixed wording, and the improvement proposal describes the "remediation" column of the NG-element determination table):
    ```md
    #### <IGX error ID>. <Element name from the NG-element determination table>: <Target Element Name>

    - **Target element**: <element name> (<element type> / <lane name> / <preceding/following element names, etc.>)
    - **Severity**: High
    - **Problem content**: <plain-language description of the determination condition from the NG-element determination table>
    - **Impact**: State that it is unsupported at IM-BPM import time, or that it may adversely affect process execution
    - **Response policy**: ⏭️ Fix the BPMN in iGrafx and re-import.
    - **Improvement proposal**: <plain-language description of the "remediation" column of the NG-element determination table>
    ```
  - Do not output to `spec-to-bpmn-fixes.json` (since it is premised on fixing and re-importing on the iGrafx side, it is out of scope for automatic reflection by `.github/skills/bpm-xml-reflector/SKILL.md`).

**Rules for Reflecting into `to-be-discussed.md`:**
- ERROR lines: Always reflect into the items to be discussed. However, for severity "Low" (including tool false positives), record only the count in the summary and do not file individually.
- WARN lines: Reflect into the items to be discussed only for severity "High" or "Medium." Do not file individually for severity "Low."
- Organize the output while preserving the [input] / [model] / [flow] / [io] context information.
