# Structure and Description of Logic

The generated logic definition must have the following structure.
**This document must be created as a pair with the screen described in the screen definition (guide-screen.md). It is not a specification for IM-LogicDesigner / IM-Workflow.**

1. Logic List
  - Defines the processing content needed to implement the task. Assumes creation in a function container.
  - The list items are "Logic ID," "Logic Name," "Corresponding Screen," and "Function Overview."

2. Logic Details (created per logic item)
  - For each piece of logic, describe the following:
    - Processing overview
    - Input/output values
    - Input validation
    - SQL statements (if needed)
    - Error handling
    - Integration with external systems (if needed)

## Structure When Sharing Business Data Between the Start Event and Multiple User Tasks

When business data is managed with a composite primary key of `process instance ID + task ID` under the "one row per completed task" model (see [guide-business-data.md](.github/skills/bpm-docs-generator/reference/guide-business-data.md)), the processing where a subsequent task displays/carries over the input data from the previous step must be described by separating it into a **retrieval logic** and a **registration logic**, as follows.

- If the start event itself is involved in business data input/output (see "Handling when the start event is involved in business data input/output" in [guide-business-data.md](.github/skills/bpm-docs-generator/reference/guide-business-data.md)), add a registration process to the start processing (process instance start logic) to register a new record with a fixed pseudo task ID (e.g., `'START'`). The retrieval logic for the subsequent task retrieves this record using the fixed pseudo task ID as the search condition when the screen is displayed.

1. Retrieval Logic (on screen display, SELECT)
  - Retrieve one record from when the previous step was completed, using `process instance ID` and the process variable holding the previous step's task ID (see [guide-specification.md](.github/skills/bpm-docs-generator/reference/guide-specification.md)) as search conditions.
  - Input: `processInstanceId`, the process variable for the previous step's task ID
  - Output: The full set of business data items registered in the previous step
2. Registration Logic (on button press, INSERT)
  - **Register a new record** combining the business data items obtained from the retrieval logic with this screen's input values (do not UPDATE the previous step's record).
  - Set the `task ID` of the new record to the task ID of this user task itself.
  - Input: The output items from the retrieval logic (carried over and submitted from the screen) + this screen's input values
  - Output: Processing result

> When adopting the "one row per application" (Update-based) approach for reasons such as wanting to reduce the number of records, the retrieval and registration logic need not be separated; instead, describe it as a single logic of "retrieve → display on screen → reflect input values and UPDATE," as before.

## Reference Skills
- `.github/skills/jssp-page-generator/SKILL.md`: JSSP code generation support
- `.github/skills/jssp-im-master-usage/SKILL.md`: User/organization search dialogs
- `.github/skills/jssp-security-check/SKILL.md`: Verification of SQL injection / XSS countermeasures

## Reference Conventions
- `.github/instructions/jssp-2way-sql.instructions.md`: SQL externalization (including whitelist validation of `/*$*/`)

**Notes**
* **Do not create redundant SQL.**
  * **Consolidate SQL statements that can be handled with an IF statement.**
