# Process Definition Key (process id) Replacement Guide

To avoid process id collisions in BPMN originating from iGrafx, this document defines a mechanism for numbering and managing process ids for IM-BPM import.

**Basic Policy**:
- Apply this only when the loaded BPMN file is produced by iGrafx.
- During the specification authoring stage (bpm-docs-generator), only determine the replacement status and present a replacement proposal.
  - The actual replacement of BPMN IDs is performed using the bpm-xml-reflector skillset when a request is made to reflect the specification content into the BPMN.
  - Once a replacement proposal (from-to) is finalized, in addition to recording it in `to-be-discussed.md`, output it at the same time as an entry with `operation: "replace-process-id"` in `spec-to-bpmn-fixes.json` (see the "Output to `spec-to-bpmn-fixes.json`" section for details). The actual reflection into the BPMN is performed by `reflectFixes()` of `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md`, using `spec-to-bpmn-fixes.json` as its sole input.
- After the first replacement, reuse the existing key. To prevent incorrect re-numbering, keep the replacement information permanently in both the "to-be-discussed" document and the BPMN.

## Scope
- The process id (= IM-BPM's process definition key) at the time the BPMN file is generated
- The replacement target is **the process id only**; flow element IDs, sequence IDs, and DI element IDs are not changed.

## Check Implementation
Use the following script for checking and retrieving BPMN file ID values and replacement status.

- `.claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js`
- Example invocation: `{{ENSURE_CMD}} .claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <processNm-prompt/diagram.bpmn>` (the result is always returned in JSON format)

## Processing Flow

### Step 1: Retrieve IDs

- Source BPMN (`doc/<BPM process name>.bpmn`)
  - `{{ENSURE_CMD}} .claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <source BPMN file>`
- To-be-discussed document (`to-be-discussed.md`)
  - Retrieve, per process, the "original process definition key" and "replaced process definition key" from Chapter 2, "Process Definition Key Replacement History."
- Destination BPMN (`<BPM process name>-prompt/<BPM process name>.bpmn`)
  - `{{ENSURE_CMD}} .claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <destination BPMN file>`

- **For both the source BPMN file and the destination BPMN file, run `validate-process-key-replacement.js` on each to obtain the ID values and replacement status.**

- **For the destination BPMN, reference the value of `PROCESS_KEY_META` within `documentation`.**
  - The format and embedding process of `PROCESS_KEY_META` are authoritatively defined in `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md`.


### Step 2: Verify Existing IDs
- Compare the results obtained in Step 1 for each process, and decide on the subsequent processing.
  | Category | `Source BPMN` | `To-be-discussed` | `Destination BPMN` |
  |------|-----|-----|-----|
  | Pre-replacement definition key | processId | Original process definition key | originalProcessKey |
  | Post-replacement definition key | None | Replaced process definition key | processKey (or processId) |

- Cases where no ID replacement proposal is needed, and the processing flow may end.
  - The "pre-replacement definition key" for each process matches across `source BPMN`, `to-be-discussed`, and `destination BPMN`, AND the "post-replacement definition key" matches between `to-be-discussed` and `destination BPMN`.
  - The "post-replacement definition key" in `destination BPMN` is undefined, AND the "pre-replacement definition key" matches between `source BPMN` and `to-be-discussed`.
- Step 3: Cases judged as an initial numbering
  - The `<BPM process name>-prompt` directory does not exist
  - No ID replacement proposal is recorded in `to-be-discussed`, AND the "post-replacement definition key" in `destination BPMN` is undefined.
- Step 4: Cases judged as an additional numbering
  - The definition keys of existing processes match across `source BPMN`, `to-be-discussed`, and `destination BPMN`, but `source BPMN` has a new "post-replacement definition key."
- Step 5: Cases judged as a correction of the to-be-discussed document
  - The "pre-replacement definition key" matches between `to-be-discussed` and `destination BPMN`, but the "post-replacement definition key" differs.
- Step 6: Cases judged as requiring confirmation
  - There is a mismatch of definition keys among `source BPMN`, `to-be-discussed`, and `destination BPMN`. This excludes the cases covered by Steps 3–5.

### Step 3: Initial Numbering
- Present an ID replacement proposal according to the **numbering rules** and record it in the to-be-discussed document. At the same time, output it to `spec-to-bpmn-fixes.json` as well (see "Output to `spec-to-bpmn-fixes.json`"). After recording, this processing flow ends.

### Step 4: Additional Numbering
- For the additional IDs, present an ID replacement proposal according to the **numbering rules** and append it to the to-be-discussed document. At the same time, append it to `spec-to-bpmn-fixes.json` as well. After recording, this processing flow ends.

### Step 5: Correction of the To-be-discussed Document
- Report that the post-replacement ID differs between the destination BPMN and the to-be-discussed document. After confirmation, correct the record in the to-be-discussed document to match the post-replacement ID in the destination BPMN. Also correct the corresponding entry in `spec-to-bpmn-fixes.json` to the same value. After correction, this processing flow ends.
- Note: Since the process definition key (post-replacement ID) is the unique key that identifies the BPM in IM-BPM, the destination BPMN side is treated as authoritative.

### Step 6: Confirmation Required
- Report that there is a mismatch in the IDs, and ask for instructions on how to handle the ID numbering policy.

**Numbering Rules**
- The post-replacement key must be "an ID reminiscent of the original BPMN file/process" and no longer than 44 characters.
- The recommended key format is `<processSlug>_<serial>`.
  - `processSlug`: An identifier normalized from the process name or the original process id (alphanumeric characters, `_`, `-`, `.` only; must start with a letter or `_`)
  - `serial`: A sequential number of 4 or more digits (e.g., `0001`, `0002`, ...)
- Examples: `vehicle_purchase_0001`, `daily_check_0001`, `expense_approval_0001`

## Recording in the To-be-discussed Document

### Recording a Replacement Proposal in the To-be-discussed Document
During the specification authoring stage, record the following information as a **replacement proposal** in the "2. Process Definition Key Replacement History" section of `to-be-discussed.md`. (For the format, see the "Process Definition Key Replacement History Template" below.)

- Target process
- Original process id
- Candidate replacement process id
- Proposal date

### Process Definition Key Replacement History Template

#### Replacement Proposal (<target process name>)

| Item | Value |
|------|-----|
| Target process | <process name> (with ID supplement if needed) |
| Original process definition key | <originalProcessDefinitionKey> |
| Replaced process definition key | <processDefinitionKey> |
| Proposal date | <YYYY-MM-DD> |
| Reflection date | <YYYY-MM-DD or 未反映> |


**Notes for Writing the Process Definition Key Replacement History**
- Do not write internal judgment values such as `status` / `errors` / `none` for the end user.
- During the specification authoring stage, record it as a "replacement proposal (candidate)" and do not assert that it has already been carried out.
- During the specification authoring stage, write the literal `未反映` (not yet reflected) for the `Reflection date`.
- If the replacement is carried out during the BPMN reflection stage, update the `Reflection date` to the actual date it was carried out.
- Do not write standalone text outside the table, such as `Reflection date: YYYY-MM-DD` (it must always be recorded as a row within the table).
- Create an independent subsection for each process being replaced.
- If multiple processes are subject to replacement, record them separately.
- The original key and the replaced key must always be documented as a set; recording only one of them is prohibited.

### Output to `spec-to-bpmn-fixes.json`

Replacement proposals (from-to) finalized in Steps 3–5 are also output to `doc/<BPM process name>-prompt/spec-to-bpmn-fixes.json` at the same time they are recorded in `to-be-discussed.md`. The entry structure, naming conventions, and controlled `operation` vocabulary are authoritatively defined in "Format of `spec-to-bpmn-fixes.json`" in `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`; this section shows only the content specific to process id replacement.

```json
{
  "fixId": "PID-001",
  "reflectStatus": "ready",
  "operation": "replace-process-id",
  "targets": [
    { "elementId": "<original process id (fromId)>", "elementType": "bpmn:Process" }
  ],
  "params": {
    "fromId": "<original process id>",
    "toId": "<replacement process id>"
  },
  "requiresApproval": true,
  "reflectedDate": "未反映"
}
```

- `fixId` must be `PID-<sequence number of 3 or more digits>` (see the naming conventions in `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`).
- `params.fromId` is used to identify the replacement target, and `params.toId` becomes the replacement value that is reflected. Both must always be specified as a set.
- Only add `params.allowFromIdExists: true` for cases where it is acceptable for `fromId` to remain after reflection (e.g., a configuration without a `<participant processRef>`).
- `requiresApproval` must always be `true` (since this is a destructive operation). Approval takes place during the BPMN reflection stage (when `reflectFixes()` of `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` is executed).
- If the record in `to-be-discussed.md` is corrected in Step 5 (correction of the to-be-discussed document), also correct `params.toId` in the corresponding `spec-to-bpmn-fixes.json` entry to the same value.
- Output `reflectedDate` as the literal `未反映` and leave it unchanged; the actual reflection date and time is updated by `reflectFixes()` of `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` after reflection (do not update it at this step).

**On Reflecting the ID Replacement Proposal into the BPMN File**
- The reuse of existing keys during reflection, handling of exceptions, and record updates are authoritatively defined in `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md`.
