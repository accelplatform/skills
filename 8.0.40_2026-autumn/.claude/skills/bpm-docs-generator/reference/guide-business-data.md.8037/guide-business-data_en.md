**Notes on Creating Business Data Definitions**
- **Keep the number of business data tables as small as possible.** Carefully select the necessary data items and take care not to let the number of tables and items grow too large.
- **Add the process instance ID and the task ID to the business data.**
  - This is because the process instance ID and the task ID are intended to be the join items with the IM-BPM history data.
  - The process instance ID is a mandatory column.
  - Since the task ID may be unnecessary depending on the business process, whether to add it is raised as an item to be discussed.
