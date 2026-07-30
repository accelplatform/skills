# BPMN Syntax and Reference Integrity Validation Guide

Defines the concrete procedure and description rules for the "BPMN syntax and reference integrity validation" performed immediately after reading the BPMN file.

## Purpose
To detect notation defects, broken references, and mismatches with the diagram information in the BPMN 2.0 XML at an early stage, and to judge whether it is acceptable to proceed to specification creation (step.3).

## Execution Procedure (Mandatory)

**Script used:** `.github/skills/bpm-docs-generator/scripts/validate-bpmn.js`

```sh
# Basic
{{RUNTIME}} .github/skills/bpm-docs-generator/scripts/validate-bpmn.js <diagram.bpmn>
# When specifying additional rules
{{RUNTIME}} .github/skills/bpm-docs-generator/scripts/validate-bpmn.js <diagram.bpmn> --rules <rules.json>
```

**Exit codes:** 0 = success (warnings only, or none) / 1 = failure (errors present)

**Execution order (must be performed immediately after reading the BPMN file):**
1. Run validate-bpmn.js.
   - Validation perspectives: namespace consistency (`xmlns:bpmn`, `xmlns:bpmndi`), connection source/destination consistency, consistency with the diagram layout, and the existence of startEvent/endEvent
2. Perform a detailed analysis of the validation results.
   - **Perform error classification**
     - Do not try to judge whether something is a "real problem" or a "false detection by the tool" merely by looking at each error.
     - Judge by checking the following information:
       - The implementation status of the relevant element in the BPMN XML (output example: whether `<bpmn:startEvent id="...">` exists)
   - **Perform severity assessment**
     - Simply classifying items as "error" or "warning" is not sufficient.
     - Check whether it actually affects the IM-BPM import or the process execution.
     - Even when there is no impact, re-evaluate the severity from the perspective of operability and maintainability.
   - **Dig deeper into the candidate causes**
     - Check the tool's output specification (in the case of iGrafx, the version and the export settings)
     - Compare with similar processes (whether the same error exists in other processes)
   - **Perform impact analysis**
     - Place emphasis on "whether it affects the creation of the specifications".
     - Also consider the possibility of impact in the implementation and testing phases.
     - Even when it is judged to be "ignorable", state the reason explicitly.
3. Reflect the validation results into to-be-discussed.md.
4. Judge whether it is acceptable to proceed to step.3.

**Notes**
- Perspectives not implemented in validate-bpmn.js must not be described in the BPMN syntax and reference integrity validation results.
- Do not perform new syntax checks, reference checks, standard-compliance checks, or the like that do not exist in validate-bpmn.js.
- Also, do not perform the detailed analysis of this guide on checks that do not exist in validate-bpmn.js.
- Do not merely transcribe the error log; write it so that the user understands what action to take next.

### Guidelines for the Detailed Analysis

#### Severity Assessment Criteria
Assign a severity (high/medium/low) to each error based on the following criteria.

| Severity | Assessment criteria | Assessment examples | Output policy |
|--------|---------|--------|----------|
| **High** | Directly and adversely affects process execution, has a high possibility of causing an IM-BPM import failure, or the business flow itself does not hold | Missing start/end events, invalid references, deadlock structures | **Raise as an individual entry** |
| **Medium** | The import succeeds but a warning/error occurs at process execution time, or additional work is required at implementation time | Non-standard notation, ambiguity of attribute values | **Raise as an individual entry** |
| **Low** | No direct impact on specification, implementation, or operation; improvement is recommended only from the perspective of future maintainability | False detections by the tool, unused resource definitions, unofficial associations | **Count in the summary only. Do not raise as an individual entry** |


#### Guidelines for Root Cause Analysis
For each error, infer the root cause from the following perspectives and present multiple candidates.

1. **Errors in the design phase**
   - Insufficient understanding of the BPMN specification
   - Misunderstanding of the requirements or the business flow
   - Mistakes in operating the tool

2. **Errors in the editing/reflection phase**
   - Omission of reference updates during partial modification
   - Omission of specifying the reference target after copy/paste
   - Omission of element correspondence during merging/refactoring

3. **Limitations of the tool's generation specification**
   - Limitations of the output specification of the BPMN editing tool (iGrafx, etc.)
   - Version-dependent notation differences
   - Non-standard output at export time

4. **Implementation limits of the parser/validation tool**
   - Lack of support for recognizing element types
   - Limitations in the scope of reference checks
   - Omissions in processing nested structures

#### Guidelines for Impact Analysis
For each error, analyze the impact from the following perspectives.

| Perspective | Analysis points |
|------|------------|
| **Flow execution** | Whether an error/warning occurs at process execution time, whether a deadlock occurs, whether the execution results are affected |
| **IM-BPM import** | Whether the import fails, whether it ends with only a warning, whether it can be ignored and the work continued |
| **Specification** | Whether it affects the creation of the specifications, whether the explanation becomes ambiguous, whether there is a possibility of misunderstanding |
| **Implementation** | Whether additional work is required when implementing the scripts, whether problems occur during testing |
| **Operation** | Whether maintenance during operation becomes difficult, whether user support becomes necessary |

#### Limits of the Detailed Analysis
- The detailed analysis is performed only to classify the output of validate-bpmn.js as either "a real problem in the BPMN" or "a false detection due to the implementation limits of the validation tool", and to supplement it with the severity, candidate causes, impact, and handling policy.

## Description Rules for the Validation Results

### BPMN Notation Errors
- **Definition:** Items that can be judged objectively by the BPMN specification and reference integrity, such as XML syntax defects, broken references, namespace inconsistencies, and diagram reference inconsistencies.
- **Conditions for assigning a VAL-series ID:** Assign one only to items that correspond one-to-one with an ERROR / WARN of validate-bpmn.js, or to an organized result that aggregates logs of the same kind with the same cause.
- **Further subdivision:**
  - **Real problems in the BPMN (action required)**: Problems that adversely affect process execution, or that have a high possibility of causing an error at IM-BPM import time.
    - Examples: missing start/end events, missing required attributes, invalid references, contradictions in the flow structure
  - **False detections due to the implementation limits of the validation tool (ignorable)**: Problems where the actual BPMN XML is correct but the validation tool cannot recognize the element.
    - Examples: reference check failures for element types not in the tool's known set, false detections due to parser limitations
- **Response policy:**
  - Real problems in the BPMN (severity "high" or "medium"): Clearly state the scope that can be corrected mechanically, and concretely describe the correction procedure or correction candidates.
  - Real problems in the BPMN (severity "low"): Do not raise individual entries; include them only in the summary counts.
  - False detections by the validation tool: Do not raise individual entries. Count them only in the "false detections due to the implementation limits of the tool" count in the summary.
- **Prohibited:** Do not raise the results of original checks that do not exist in validate-bpmn.js as VAL-ERR / VAL-WARN.


## Description Template for to-be-discussed.md

### Error IDs
 - Assign VAL-ERR-<sequential number> / VAL-WARN-<sequential number> to the ERROR / WARN entries directly output by validate-bpmn.js.

### Template Structure for "BPMN Syntax and Reference Integrity Validation"
```md
### <section name>

#### <error ID>. <type>: <target element name>

- **Target element**: <element name> (<element type> / <lane name> / <names of preceding and following elements, etc.>)
- **Severity**: High|Medium|Low
- **Problem**: <describe the error type of the validation result in plain wording>
- **Candidate causes**:
  1. There is a possibility of <candidate cause 1>.
  2. There is a possibility of <candidate cause 2>.
  3. There is a possibility of <candidate cause 3>.
- **Impact**: <describe the impact on specification, implementation, and operation, by perspective>
- **Handling policy**: <concrete correction procedure or improvement proposal>
```

#### About the Handling Policy
- The "handling policy" must ultimately resolve to one of the following:
  - ✅ **Can be corrected immediately**: State the correction procedure explicitly
  - ❓ **Requirement confirmation is required**: State the confirmation question explicitly
  - ⏭️ **To be handled after the import**: State the handling at import time explicitly and explain the reason for deferring it

### Output Destination of the Validation Results
Output the following into "1. BPMN syntax and reference integrity validation results" of `to-be-discussed.md`.

- **Validation result summary**
  ```
  ### Validation Result Summary

  Result of running `validate-bpmn.js` (exit code X).

  Y ERROR(s), Z WARN(s) → <PASS|FAIL>

  | Category | Count | Description |
  |------|------|------|
  | Real problems in the BPMN (action required) | n | Concrete details |
  | False detections due to the implementation limits of the tool | m | Concrete details |
  ```

- **BPMN notation errors**
  - Raise individual entries only for "real problems in the BPMN" with a severity of "high" or "medium"
  - Do not raise individual entries for items with a severity of "low" or for "false detections by the tool" (count them only in the summary counts)
  - The VAL-series items described here are limited to the direct output of validate-bpmn.js

**Rules for reflecting into `to-be-discussed.md`:**
- ERROR lines: Always reflect them into the items to be discussed. However, for severity "low" (including false detections by the tool), describe only the count in the summary and do not raise individual entries.
- WARN lines: Reflect into the items to be discussed only those with a severity of "high" or "medium". Do not raise individual entries for severity "low".
- Organize the output while preserving the [input] / [model] / [flow] / [io] context information.
