---
name: bpm-scripts-generator
description: Generates the resources required to run BPM processes on IM-BPM for Accel Platform, based on the specifications created by bpm-docs-generator.
---

# BPMS Resource Generation Skill

## Purpose
A skill set for generating the resources required for BPMS enablement based on the specifications.
The resources are generated using the script development model (JSSP) of intra-mart Accel Platform.
It basically follows the guidelines of jssp-page-generator, but describes the elements specific to IM-BPM for integration with scratch-built screens.

## Referenced Skills

Generate the resources with reference to the following skill sets. For the implementation conditions for IM-BPM for Accel Platform, see "Notes on IM-BPM Resources" below.

| Skills | Handling |
|---------|------|
| `jssp-page-generator` + `jssp-imds-theme` | 🟢 **Required reading.** Corresponds to the screen definitions and logic definitions of the specifications |
| `jssp-localize-support` | Required reading when there is a request for multilingual support |
| `jssp-im-job-generator` | Required reading when the specifications involve the use of jobs |

## When to Use

When the user makes a request such as the following:
- "Create the required resources based on the BPM specifications"
- "Create the scripts based on the specifications"
- "Build a program from the specifications"

**Notes on IM-BPM Resources**
- **The process instance ID and the task ID are obtained from the parameters of the function container's init function.**
  ```
  function init(request) {
    // Request from a start event
    request.processDefinitionId;
    // Request to reference the history of a start event
    request.historicProcessInstanceId;
    // Request from a user task
    request.taskId;
    // Assumed to be added to the request parameters on a request from a user task
    request.processInstanceId;
    // Request to reference the history of a task
    request.historicTaskId;
    ‥‥‥
  }
  ```

**Relationship Between Business Data and Screens**
- Basic policy
  - When registering business data by invoking a business data registration screen from a start event or a user task, use insert as the default.
- Processes that use the same screen for the start task and multiple user tasks
  - If the business data definition has a task ID, follow the basic policy and insert the business data on the registration screens of the start event and each user task.
    - Add a record to the business data for each start event and user task.
    - If there is a request such as keeping down the number of business data records, a policy of inserting the business data on the first registration screen display and updating the business data on subsequent user tasks is also acceptable.
  - If the business data definition has no task ID, insert the business data on the first registration screen display and update the business data on subsequent user tasks.
    - Add a record to the business data at the first registration (the start event or the first user task), and in subsequent user tasks update that record with the data entered on the screen.
  - For screen displays other than the first registration, retrieve and display the business data entered at the immediately preceding start event or user task.
