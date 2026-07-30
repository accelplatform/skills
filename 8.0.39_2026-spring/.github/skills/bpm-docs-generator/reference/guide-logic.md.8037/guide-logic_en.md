# Structure and Explanation of the Logic

The generated logic definitions must have the following structure.

1. Logic list
  - Define the processing contents required to implement the tasks. It is assumed that they are created in function containers (paired with the screens described in the screen definitions).
  - Describe "logic ID", "logic name", "corresponding screen", and "feature overview" as the items in the list.

2. Logic details (created per logic)
  - For each logic, describe the following contents
    - Processing overview
    - Input and output values
    - Input validation
    - SQL statements (if necessary)
    - Error handling
    - Integration with external systems (if necessary)

## Reference Skills
- `jssp-page-generator`: JSSP code generation support
- `jssp-im-master-usage`: user / organization search dialogs
- `jssp-security-check`: validation of SQL injection and XSS countermeasures

## Reference Rules
- `.github/instructions/jssp-2way-sql.instructions.md`: SQL externalization (including whitelist validation of `/*$*/`)

**Notes**
* **Do not create redundant SQL.**
  * **Consolidate SQL statements that can be differentiated with an IF statement.**
