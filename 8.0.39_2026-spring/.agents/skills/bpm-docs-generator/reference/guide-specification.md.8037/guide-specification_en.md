# Structure of the Specifications

The generated specifications must have the following structure.

1. Overview
   - Concisely explain what the process does.
   - Explain the business from start to finish in one to several sentences.

2. Actors (roles)
   - Explain the participants and stakeholders of the process based on the pools, lanes, tasks, etc.
   - Propose role IDs from the names of the pools, lanes, and tasks
     - Role IDs must be in lower snake case and no more than 20 characters

3. Process details
   - Create a list of events and tasks for each process
     - In the list, describe the type of the event or task, the person in charge, the screen, an explanation of the execution conditions, and so on
     - In the screen column of the list, write the screen definition name if there is a screen (make it a link to the screen definition), or "-" if there is none
     - If there is a call activity, clearly state the name of the called process. If specifications for the called process exist, make the called process name a link to the specification directory.
   - Describe how the process is started
     - Without an explicit instruction, it is started from the IM-BPM standard process start list
   - Describe the exception handling of the process (explanation of error events and exception flows)
   - For independent tasks (no sequence flow, no boundary event), ask whether they should be optional tasks
     - Also describe this in the items to be discussed
   - Conditional branching: explanation of the gateway condition expressions and branching rules
     - When there is conditional branching, always propose a process variable that stores the value used for the decision.
     - The process variables for conditional branching are used in decision expressions written with EL expressions in the sequence flow conditions.
   - Propose process variables as necessary (used for carrying around the primary key information of the business data, etc.)
   - If the imported BPMN has features that are expected to involve external integration, describe them
   - For signal start events and signal catch events, clarify the sender of the signal and the conditions for sending it
     - If the signal sender or the conditions are not clear, raise it as an item to be discussed.
   - For message start events and message catch events, clarify the sender of the message and the conditions for sending it
     - If the message sender or the conditions are not clear, raise it as an item to be discussed.

## Mandatory When the Referenced BPMN Was Created with iGrafx
- If there is no lane inside a pool, recommend adding a lane.
- The following BPMN elements are defined in iGrafx but not in IM-BPM, so propose changing them to other elements in the process details list.
  - Vertical Pool → change to Pool
  - Collapsed Event Sub-Process → change to Event Sub-Process
  - Collapsed Sub-Process → change to Sub-Process
  - Message Send Event → change to a Task (because in IM-BPM, message sending is substituted with an IM-LogicDesigner task)
  - Escalation Catch Event → since IM-BPM has no escalation event at all, recommend substituting it with another task or event
  - Cancel Catch Event → since IM-BPM has no cancel event at all, recommend substituting it with another task or event
  - Compensation Catch Event → since IM-BPM has no compensation event at all, recommend substituting it with another task or event
  - Conditional Event → since IM-BPM has no conditional event, recommend substituting it with another task or event
  - Link Event - Incoming → since IM-BPM has no link event at all, recommend substituting it with another task or event
  - Multiple Throw Event → since IM-BPM has no multiple event at all, recommend substituting it with another task or event
  - Complex Gateway → recommend substituting it with another gateway
- The following tasks are not defined in IM-BPM, so recommend substituting them with other tasks
  - Send Task
  - Business Rule Task
  - Notification Task
  - Mapping Task
  - Reporting Task
  - Manual Service Task
  - Automated Service Task
  - Rule Flow Task
  - Rule Script Task
  - Decision Table Task
  - Rule Task
  - Ruleset Task
  - Flow Ruleset Task
- If there are multi-level nested lanes inside a pool, propose changing the lanes to a single level. (Because IM-BPM does not support multi-level nested lanes.)
- For call activities, clearly state the name of the called process. The identification method is as follows.
  - Script used: check the call target of each call activity from the return value of `.agents/skills/bpm-docs-generator/scripts/search-called-elements.js`.
  - Clearly state the result in the call activity item of the process details. (The process name, or "call target unknown".)
  - Also describe the result in "Chapter 3: Call Activity Called-Process Replacement History" of `to-be-discussed.md`.

**Notes on Process Variables**
 - For process variables, propose an ID, a name, and a type.
   - Make the ID and the name such that the value to be set can be inferred.
   - Choose the type from `string`, `boolean`, `datetime`, `int`, `long`, and `double` according to the intended use of the value.
 - The process instance ID can be obtained from the implicit object (`${execution.processInstanceId}`), so exclude it from the process variable candidates.
 - Exclude from the process variable candidates any element that can be substituted with an item of the business data.
