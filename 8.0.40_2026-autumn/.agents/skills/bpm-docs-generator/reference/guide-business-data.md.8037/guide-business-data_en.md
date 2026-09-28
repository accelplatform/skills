**Notes for Creating Business Data Definitions**
- **Keep the number of business data tables as small as possible.** Carefully select the necessary data items so that the number of tables and items does not grow excessively.
- **Add join key items (process instance ID, task ID) and audit items (creator, creation date, last updater, last update date) to the business data.**
  - **Process Instance ID / Task ID**
    - These are intended as join items with IM-BPM history data.
    - The process instance ID is a required column.
    - How the task ID is handled branches depending on whether **there are multiple** start events/user tasks involved in business data input/output.
      - **When there are multiple (default policy)**: The task ID is a required column, and the composite primary key is `process instance ID + task ID`. The basic approach is "one row per completed task," adding a new record for each start event / user task completion (for the corresponding implementation policy, see "Relationship Between Business Data and Screens" in `.agents/skills/bpm-scripts-generator`'s `SKILL.md`).
        - Even in this case, if a subsequent task registers data by carrying over the input data from the previous step (e.g., copying the previous step's content plus adding this time's input values), the specification must clearly state how to identify "the ID of the task that is the source of the data" (the standard pattern is to hold the previous step's task ID as a process variable; for details, see "Notes on Process Variables" in `.agents/skills/bpm-docs-generator/reference/guide-specification.md`).
        - Only when there is a clear requirement to reduce the number of records, an alternative approach of "one row per application" (inserting at the first task and updating that record in subsequent tasks; the task ID is a single column holding the currently processing task ID and is not included in the primary key) may be adopted. If adopted, the rationale for this decision must be recorded in `supplement.md`.
      - **When there is only one**: A composite primary key is not required. The task ID may be treated as an optional column (whether to retain it can be left as an item to be discussed).
  - **Creator / Creation Date / Last Updater / Last Update Date**
    | Logical Name | Physical Name | Type | Size | Required |
    |------|------|------|------|------|
    | Creator | create_user_cd | VARCHAR2 | 100 | Required |
    | Creation Date | create_date | TIMESTAMP | - | Required |
    | Last Updater | record_user_cd | VARCHAR2 | 100 | Required |
    | Last Update Date | record_date | TIMESTAMP | - | Required |
- **Handling when the start event is involved in business data input/output (e.g., when the start event's annotation suggests input items).**
  - Since a start event has no task ID, when adopting the composite primary key approach (`process instance ID + task ID`, the default policy), the default policy is to use a **fixed pseudo task ID** (e.g., `'START'`; the specification must clearly note that this is not an actual BPM task ID) to uniquely identify the row originating from the start event.
  - When to register the start event's input values into the business data should be compared and examined from the following viewpoints, and the decision along with its rationale must be recorded in `supplement.md`.
    1. **INSERT with the fixed pseudo task ID → INSERT a separate row when a subsequent task completes (default policy)**. This preserves the "one row per completed task" principle, but it must be clearly noted as a specification trade-off that the input values from the start event are also duplicated into the subsequent task's row.
    2. INSERT with the fixed pseudo task ID → UPDATE the same row when a subsequent task completes (note that this departs from the "one row per completed task, INSERT only" principle)
    3. Create a dedicated header table for the start event (built separately from the tables targeted by the composite primary key approach; the trade-off with the table-count reduction policy needs to be discussed)
  - For the row with the fixed pseudo task ID, any item whose value is not determined until a subsequent task completes must be defined as a nullable column in the DDL.
