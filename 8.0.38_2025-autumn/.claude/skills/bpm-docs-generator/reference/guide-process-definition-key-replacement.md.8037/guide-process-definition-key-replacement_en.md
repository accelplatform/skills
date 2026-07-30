# Process Definition Key (process id) Replacement Guide

To avoid duplication of process ids in BPMN originating from iGrafx, this defines a mechanism for assigning and managing process ids for import into IM-BPM.

**Basic policy**:
- At the specification creation stage (bpm-docs-generator), only the determination of the replacement status and the presentation of replacement proposals are performed.
  - The ID replacement in the BPMN is performed using the bpm-xml-reflector skill set when a request is made to reflect the specification contents into the BPMN.
- After the first replacement, the existing key is reused. To prevent incorrect new assignment, the already-replaced information is persistently retained in the specifications and in the BPMN.

## Scope
- The process id at BPMN file generation time (= the process definition key of IM-BPM)
- The replacement target is **the process id only**; flow element IDs, sequence IDs, and DI element IDs are not changed.

## Check Implementation
Use the following script for the implementation of checking and obtaining the ID values and replacement status of a BPMN file.

- `.claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js`
- Execution example: `{{RUNTIME}} .claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <processNm-prompt/diagram.bpmn> --json`

The subsequent determinations and consistency checks are, as a rule, based on the output of this script. Equivalent logic must not be reimplemented manually to make the determination.


## Processing Flow

### Step 1: Check Existing IDs
- Compare the IDs of the source BPMN file (`doc/*.bpmn`), the specifications (`to-be-discussed.md`), and the copy-destination BPMN file (`<BPM process name>-prompt/*.bpmn`), and decide the subsequent processing.
  - Cases where no ID replacement proposal is needed and the processing flow may be terminated.
    - When the IDs of the source BPMN, the specifications, and the copy-destination BPMN all match.
    - When the replaced ID has not been reflected into the copy-destination BPMN, and the IDs of the source BPMN and the specifications match.
  - Cases determined as Step 2: initial assignment
    - When the `<BPM process name>-prompt` directory does not exist
    - When the specifications exist but no ID replacement proposal is described, and the ID has not been reflected into the copy-destination BPMN.
  - Cases determined as Step 3: additional assignment
    - When the existing IDs of the source BPMN, the specifications, and the copy-destination BPMN match, but there is a new ID in the source BPMN.
  - Cases determined as Step 4: specification correction
    - When the existing IDs of the specifications and the copy-destination BPMN match, but the post-replacement IDs differ.
  - Cases determined as Step 5: confirmation required
    - When there is a mismatch among the IDs of the source BPMN, the specifications, and the copy-destination BPMN. The cases of Step 2 through Step 4 are excluded.

**Run validate-process-key-replacement.js separately on the source BPMN file and the copy-destination BPMN file to obtain the ID values and replacement status**

**For the copy-destination BPMN, refer to the value of `ORIGINAL_PROCESS_KEY` in `PROCESS_KEY_META` of the `documentation`.**

### Step 2: Initial Assignment
Present the ID replacement proposal according to the **assignment rules** and describe it in the specifications. After describing it, this processing flow ends.

### Step 3: Additional Assignment
For the additional IDs, present the ID replacement proposal according to the **assignment rules** and append it to the specifications. After describing it, this processing flow ends.

### Step 4: Specification Correction
Report that the post-replacement IDs of the copy-destination BPMN and the specifications differ. After confirmation, correct the description in the specifications with the post-replacement ID of the copy-destination BPMN. After the correction, this processing flow ends.
* Since the process definition key (the post-replacement ID) is the unique key that identifies the BPM on IM-BPM, the copy-destination BPMN is treated as authoritative.

### Step 5: Confirmation Required
Report that there is a mismatch among the IDs, and ask for instructions on how to handle the ID assignment policy.


**Assignment Rules**
- The post-replacement key must be "an ID associated with the source BPMN file or process".
- The recommended key format is `<processSlug>_<serial>`.
  - `processSlug`: an identifier normalized from the process name or the original process id (alphanumerics, `_`, `-`, and `.` only; the first character must be a letter or `_`)
  - `serial`: a sequential number of at least 4 digits (e.g. `0001`, `0002`, ...)
- Examples: `vehicle_purchase_0001`, `daily_check_0001`, `expense_approval_0001`


## Description in the Specifications

### Describing the Replacement Proposal in the Items to Be Discussed
At the specification creation stage, describe the following information as a **replacement proposal** in the "2. Process Definition Key Replacement History" section of `to-be-discussed.md`. (For the format, see the description template for the process definition key replacement history.)

- Target process
- Original process id
- Candidate process id for replacement
- Proposal date

### Description Template for the Process Definition Key Replacement History

#### Replacement Proposal (<target process name>)

| Item | Value |
|------|-----|
| Target process | <process name> (supplement with the ID as necessary) |
| Original process definition key | <originalProcessDefinitionKey> |
| Post-replacement process definition key | <processDefinitionKey> |
| Proposal date | <YYYY-MM-DD> |
| Reflection date | <YYYY-MM-DD or Not reflected> |


**Notes When Describing the Process Definition Key Replacement History**
- Do not describe internal determination values such as `status` / `errors` / `warnings` / `none` for end users.
- At the specification creation stage, describe it as a "replacement proposal (candidate)" and do not assert that it has already been performed.
- At the specification creation stage, describe the `Reflection date` as `Not reflected`.
- If the replacement is performed at the BPMN reflection stage, update the `Reflection date` to the date it was performed.
- Do not write standalone text outside the table such as `Reflection date: YYYY-MM-DD` (always write it as a row within the table).
- Create an independent subsection for each process to be replaced.
- When multiple processes are subject to replacement, describe them separately.
- Always state the original key and the post-replacement key as a pair; describing only one of them is prohibited.

**About Reflecting the ID Replacement Proposal into the BPMN File**
- `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` of bpm-xml-reflector is authoritative for the reuse of existing keys at reflection time, the handling of exceptions, and the updating of records.
