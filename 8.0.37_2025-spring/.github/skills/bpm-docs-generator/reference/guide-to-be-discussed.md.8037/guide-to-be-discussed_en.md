# Explanation of To-be-discussed Items

After the specification document is generated, write out items that need further discussion into this file, and use it as material for discussing them with the user.

## Main Items to Record
- Analyze the BPMN file, and record any unclear points as to-be-discussed items.
  - Chapter 3 records unclear points detected directly from the BPMN structure (branch condition expressions, timers, loopbacks, start event types, etc.).
  - Note that Chapters 4 and 5 do not directly derive discussion points from the content of the BPMN; rather, they are chapters that raise standard discussion points requiring system-level confirmation, triggered by the presence of related elements (data objects, message events, lanes, error boundary events, etc.). If a related element does not exist, do not force the creation of a discussion point — it is fine to record "Not applicable."
- If the content of the loaded BPMN file contains errors in the BPMN itself, record them as pointed-out issues. Also, if there are suggestions for improving the BPMN, record them as proposals.
- When referencing a master, if its content is unclear (where the master is defined, who is responsible for data maintenance, the maintenance cycle, the method, etc.), record it as a to-be-discussed item.
- If there is a task in the BPM that is independent (not connected by a sequence flow, and with no boundary event attached), either treat it as an optional task or record an inquiry about it in "3. Business Requirements/Operational Requirements."

**Notes**
- **Check the notes written in textAnnotation, association, documentation, and extensionElements within the BPMN, and be sure to reflect any content relevant to the requirements into the to-be-discussed items.**
- **Describe the content of the issue in plain language understandable even to non-developers, and replace technical terms (see "Prohibition and Replacement of Technical Terms").**
- **Always state clearly "which element has what kind of problem."**
- **Identify elements by their element name (identifying an element by ID alone is prohibited; if identification is difficult, supplement with the element type, lane name, or the names of preceding/following elements).**
- **For discussion points originating from a note, record the "referenced element name (supplemented with the ID if necessary)" so that the source can be traced.**
- **If the content of a note is ambiguous, do not settle it by guessing — raise it as a discussion point marked "needs confirmation."**
- Explain the gaps based on the input information (requirement notes, target business, existing flow context) as grounds.
- Do not make definitive statements about undetermined matters; leave them as discussion points in the form of questions to be confirmed.

## Structure of the To-be-discussed Document (to-be-discussed.md)
- Organize the chapters in the following priority order.
  1. BPMN Syntax/Reference Integrity Validation Results
  2. Process Definition Key Replacement History
  3. Business Requirements/Operational Requirements
  4. Data, Notifications, and Auditing
  5. Non-functional Requirements/Failure Response
  6. BPMN Improvement Proposals
  7. Points to Note

### Content to Record in Each Chapter
1. BPMN Syntax/Reference Integrity Validation Results
 - See step 3 of SKILL.md.
 - Record according to the procedure and recording template of `.github/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`.
 - If the referenced BPMN is produced by iGrafx, record the NG element judgment results from "Required When the Referenced BPMN Is Produced by iGrafx" in `.github/skills/bpm-docs-generator/reference/guide-specification.md` as the "iGrafx-specific Element Compatibility Check" (see `.github/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` for the recording rules).

2. Process Definition Key Replacement History
 - Record whether the ID has already been replaced, the original/replaced keys, the reuse policy upon regeneration, and so on.
 - Record according to `.github/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md`.

3. Business Requirements/Operational Requirements
 - Record items that require a business decision, such as insufficient definition of branch conditions, ambiguity in the division of responsibilities, undefined exception handling or termination conditions, and unclear master reference destinations.
 - For approval conditions, SLA, rejection/return handling, and start methods, judge the unclear points based on the following clues from the BPMN structure.
   - Approval conditions: if the condition expression (conditionExpression) of a branching gateway is undefined/blank → needs confirmation
   - SLA: presence or absence of a timer boundary event/timer intermediate event → if configured, confirm the validity of the deadline value; if not, confirm whether an SLA is needed at all
   - Rejection/return handling: presence or absence of a sequence flow that returns to a preceding step (loopback) → if it exists, confirm the maximum number of returns and the rules for changing the person in charge
   - Start method: the type of the start event (none/message/timer/signal) → for a none-type start, confirm who/what serves as the trigger
 - If the referenced BPMN is an iGrafx-produced BPMN and there is a call activity, record the "Call Activity Callee Process Replacement History."

4. Data, Notifications, and Auditing
 - The discussion points in this chapter are not directly derived from the content of the BPMN; rather, they raise standard discussion points requiring system-level confirmation, triggered by the presence of the following BPMN elements.
   - If there is a data object/data store reference → confirm the retention period and who is responsible for/the cycle of master maintenance
   - If there is a message send task/message end event → confirm the notification content, recipient, whether resending is needed, and idempotency (whether duplicate sending is acceptable)
   - If there is a task involving a decision such as approval, rejection, or return → confirm whether an audit trail is needed and at what granularity
 - If none of the above trigger elements exist, this chapter may be recorded as "Not applicable."

5. Non-functional Requirements/Failure Response
 - This chapter is limited to discussion points for which clues can be obtained from the BPMN structure (access control, failure response).
 - Items to record:
   - Access control: lane names, the person in charge (extension elements such as potentialOwner) → confirm the validity of the assigned role and the scope of authority
   - Failure response (recovery procedure): presence or absence of an error boundary event/escalation event → if present, confirm the specifics of the recovery procedure; if absent, confirm the possibility that exception handling has not been considered
 - If none of the above triggers exist, this chapter may be recorded as "Not applicable."

6. BPMN Improvement Proposals
 - For chapters 3–5, propose improvement or correction ideas.
   - Item 1 (the validation results from validate-bpmn.js, and the iGrafx-specific element compatibility check) is not included here, since its proposals are already made within the BPMN Syntax/Reference Integrity Validation.
   - Item 2 is the presentation of an ID replacement proposal, so no improvement proposal is needed.
   - Issues that are difficult to propose improvements for may be skipped.
 - Present up to 3 improvement proposals, clearly stating the preconditions and the rationale for the judgment.

7. Points to Note
 - Record issues that do not fall under the chapter categories of 1 and 3–5.
   - Item 2 is not needed here, since it is the presentation of an ID replacement proposal.
   - Item 6 is not needed here, since it is about improvement proposals.

### Template Structure for Chapters 3–5
```md
### <Section Name>

#### <Type>: <Target Element Name>

- **Target Element**: <element name> (<element type> / <lane name> / <preceding/following element names>, etc.) Note: if it is not tied to a specific element, this may be left blank or written as "the entire process"
- **Problem Description**: <state the validation error type in plain language>
- **Impact**: <describe the impact on specification, implementation, and operations, organized by viewpoint>
- **Discussion Content**: <describe the points that need to be decided>
- **Response Policy**: <requirement confirmation, or guidance to the improvement proposal in Chapter 6>
```

#### About the Response Policy
- Since this content is difficult to judge mechanically, the default response policy is requirement confirmation. However, when an improvement proposal can be presented, note guidance to Chapter 6 (the improvement proposal itself is recorded in Chapter 6).

#### Template for the Call Activity Callee Process Replacement History in Chapter 3

#### <Call Activity Name>: Callee Process Replacement History

| Item | Value |
|------|-----|
| Called process | <process name> or unknown |
| Original value (process definition key) | <value of the `calledElement` attribute of the `callActivity` tag> |
| Replaced value (process definition key of the callee process) | <processDefinitionKey> or unknown |
| Proposal date | <YYYY-MM-DD> |
| Reflection date | <YYYY-MM-DD or 未反映> |

- Once the replaced value is finalized, also output it to `spec-to-bpmn-fixes.json` with `operation: "replace-callee-process"` at the same time it is recorded in this table (see `.github/skills/bpm-docs-generator/reference/guide-specification.md`). Do not output it while the replaced value remains unknown.
- Keep "Reflection date" synchronized with the `reflectedDate` of `spec-to-bpmn-fixes.json`, which is updated by `reflectFixes()` of `.github/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` after reflection.

### Template Structure for Chapter 6
```md
### BPMN Improvement Proposals

#### Improvement Proposal: <Target Discussion Point Name>

- **Target Discussion Point**: <which item in Chapters 3–5 this improvement proposal addresses> (e.g., "Approval condition: person in charge of return unknown" under "3. Business Requirements/Operational Requirements")
- **Preconditions**: <the preconditions under which this improvement proposal holds>
- **Rationale for Judgment**: <why this improvement proposal is considered appropriate>
- **Improvement Proposals**:
  1. <Proposal 1>
  2. <Proposal 2> (only if applicable)
  3. <Proposal 3> (only if applicable)
```

## Rules for Writing the To-be-discussed Items

### Prohibition and Replacement of Technical Terms (Required)
- Do not use the following terms as-is in the body text intended for non-developers.
  - `DI`, `BPMN DI`, `BPMNShape`, `BPMNEdge`, `bpmnElement`, `sourceRef`, `targetRef`, `known set`
- Recommended replacement terms:
  - `DI` / `BPMN DI` → "shape information (on-screen layout and connection information)"
  - `BPMNShape` / `BPMNEdge` → "element/connection line depicted in the diagram"
  - `bpmnElement` → "the reference target of a business flow element"
  - `sourceRef`/`targetRef` → "connection source/connection destination"

### Output Failure Gate (Required)
- If any of the following remain in the body text, treat the output as a failure and regenerate it after making corrections.
  1. Identifying an element by ID alone (e.g., `_xx`, `r_xx`)
  2. Transcribing raw log text (e.g., "unknown bpmnElement")
  3. Untranslated technical terms (e.g., `DI`, `BPMNShape`, `BPMNEdge`, `bpmnElement`)
  4. Individual entries created for "Low" severity items
