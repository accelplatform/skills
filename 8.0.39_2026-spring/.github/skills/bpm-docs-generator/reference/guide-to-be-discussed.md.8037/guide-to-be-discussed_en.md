# Explanation of the Items to Be Discussed

Write out in this file the items that require consideration after the specifications are generated, and use it as material for discussion with the user.

## Main Items to Describe
- Analyze the BPMN file and describe any unclear parts as items to be discussed.
- If the contents of the loaded BPMN file contain errors in the BPMN itself, describe them as points to be pointed out. Also, if there are improvement ideas for the BPMN, describe them as proposals.
- When a master is referenced, if its details are unclear (where the master is defined, who is responsible for data maintenance and on what cycle and by what method, etc.), describe it in the items to be discussed.
- If there is an independent task in the BPM (not connected to a sequence flow and with no boundary event placed), describe an inquiry in "3. Business Requirements and Operational Requirements" as to whether it should be treated as an optional task.

**Notes**
- **Check the memo descriptions in textAnnotation, association, documentation, and extensionElements within the BPMN, and always reflect content related to the requirements into the items to be discussed.**
- **Describe the problem in plain wording that non-developers can understand, and replace technical jargon (see "Prohibition and Replacement of Technical Jargon").**
- **Always state clearly "which element has what kind of problem".**
- **Identify elements by element name (identifying an element by ID alone is prohibited; when identification is difficult, supplement with the element type, lane name, and the names of the preceding and following elements).**
- **For discussion points originating from memos, describe the "referenced element name (supplemented with the ID as necessary)" so that the source can be traced.**
- **When the content of a memo is ambiguous, do not settle it by guessing; raise it as a discussion point marked "confirmation required".**
- Explain the missing points based on the input information (requirement memos, the target business, the context of the existing flow).
- Do not assert undetermined matters; leave the points to be confirmed in the form of questions.

## Structure of the Items to Be Discussed (to-be-discussed.md)
- Organize the chapters in the following order of priority.
  1. BPMN syntax and reference integrity validation results
  2. Process definition key replacement history
  3. Business requirements and operational requirements
  4. Data, notification, and audit
  5. Non-functional requirements and failure handling
  6. Improvement proposals for the BPMN
  7. Points to note

### Contents of Each Chapter
1. BPMN syntax and reference integrity validation results
 - See step.2 of SKILL.md
 - Describe it according to the procedure and description template in `guide-bpmn-validation.md`.

2. Process definition key replacement history
 - Describe whether the ID has already been replaced, the original key / post-replacement key, the reuse policy at regeneration time, and so on.
 - Describe it according to `guide-process-definition-key-replacement.md`.

3. Business requirements and operational requirements
 - Describe matters that require business decisions, such as insufficient definitions of branching conditions, ambiguity in the division of responsibilities, undefined exception paths and termination conditions, and unclear master reference destinations.
 - Also, if there are unclear points regarding approval conditions, SLAs, send-back operations, the start method, and so on, describe them in this chapter.
 - If there is a call activity, describe the "Call Activity Called-Process Replacement History".

4. Data, notification, and audit
 - If there are unclear points regarding retention periods, idempotency, audit trails, master data preparation, and so on, describe them in this chapter.

5. Non-functional requirements and failure handling
 - If there are unclear points regarding performance, availability, recovery procedures, permission control, testing perspectives, and so on, describe them in this chapter.

6. Improvement proposals for the BPMN
 - Propose improvements and corrections for chapters 3 through 5.
   - Chapter 1 is not included, because proposals are made within the BPMN syntax and reference integrity validation.
   - Chapter 2 is the presentation of ID replacement proposals, so no improvement proposals are needed.
   - Issues for which proposals are difficult may be skipped.
 - Present at most 3 improvement proposals, clearly stating the prerequisites and the basis for the judgment.

7. Points to note
 - Describe issues that do not fall into the chapter classifications of 1 and 3 through 5.
   - Chapter 2 is the presentation of ID replacement proposals, so nothing needs to be presented.
   - Chapter 6 consists of improvement proposals, so nothing needs to be presented.

### Template Structure for Chapters 3 to 5
```md
### <section name>

#### <type>: <target element name>

- **Target element**: <element name> (<element type> / <lane name> / <names of preceding and following elements>, etc.) If it is not tied to an element, it may be left blank or described as "the entire process"
- **Problem**: <describe the error type of the validation result in plain wording>
- **Impact**: <describe the impact on specification, implementation, and operation, by perspective>
- **Matters to consider**: <describe the discussion points needed for the decision>
- **Handling policy**: <requirement confirmation, or a pointer to the improvement proposals in chapter 6>
```

#### About the Handling Policy
- Because this content is difficult to judge mechanically, requirement confirmation is the default. However, for items where an improvement proposal can be presented, describe a pointer to chapter 6 (the improvement proposals are described in chapter 6).

#### Description Template for the Call Activity Called-Process Replacement History in Chapter 3

#### <call activity name> : Replacement History of the Called Process

| Item | Value |
|------|-----|
| Process to be called | <process name> or unknown |
| Original value (process definition key) | <value of the calledElement attribute of the callActivity tag> |
| Post-replacement value (process definition key of the called process) | <processDefinitionKey> or unknown |
| Proposal date | <YYYY-MM-DD> |
| Reflection date | <YYYY-MM-DD or Not reflected> |

### Template Structure for Chapter 6
```md
### Improvement Proposals for the BPMN

#### Improvement proposal: <target discussion point name>

- **Target discussion point**: <which item in chapters 3 to 5 this improvement proposal addresses> (e.g. "Approval conditions: the person in charge of send-back is unknown" in "3. Business Requirements and Operational Requirements")
- **Prerequisites**: <the prerequisites under which this improvement proposal holds>
- **Basis for the judgment**: <why this improvement proposal is considered appropriate>
- **Improvement proposals**:
  1. <proposal 1>
  2. <proposal 2> (only if applicable)
  3. <proposal 3> (only if applicable)
```

## Description Rules for the Items to Be Discussed

### Prohibition and Replacement of Technical Jargon (Mandatory)
- Do not use the following terms as-is in body text intended for non-developers.
  - `DI`, `BPMN DI`, `BPMNShape`, `BPMNEdge`, `bpmnElement`, `sourceRef`, `targetRef`, `known set`
- Recommended replacements:
  - `DI` / `BPMN DI` → "diagram information (placement and connection information on the screen)"
  - `BPMNShape` / `BPMNEdge` → "the elements and connecting lines shown in the diagram"
  - `bpmnElement` → "the referenced business flow element"
  - `sourceRef/targetRef` → "connection source / connection destination"

### Output Failure Gate (Mandatory)
- If any of the following remain in the body text, treat the output as a failure and re-output after correcting it.
  1. Identification by ID alone (`_xx`, `r_xx`, etc.)
  2. Verbatim transcription of raw logs (`unknown bpmnElement`, etc.)
  3. Unconverted technical jargon (`DI`, `BPMNShape`, `BPMNEdge`, `bpmnElement`, etc.)
  4. Individual entries with a severity of "low"
