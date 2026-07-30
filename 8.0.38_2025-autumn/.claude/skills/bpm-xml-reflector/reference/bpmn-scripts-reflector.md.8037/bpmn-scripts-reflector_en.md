# BPMN Scripts Reflector

## Overview
Parses BPMN-format XML and reflects the contents of the generated scripts into the BPMN.

## When to Use
When the user makes a request such as the following:
- "Reflect the contents of the generated scripts into the BPMN XML"

## Reflection Target
- Correct: `doc/<BPM process name>-prompt/<BPM process name>.bpmn` (the copy destination; this is the only file that may be modified)
- Incorrect: `doc/<BPM process name>.bpmn` (the copy source; **never rewrite this file**)

## What Is Reflected into the BPMN XML
- This skill set performs the following:
  - Adds the paths and parameters of the generated scripts to the start event or user tasks of the BPM.

## Procedure

### Step 0. Confirm the Targets
- Confirm the configuration information of the generated scripts to reflect from, and the file to reflect into.
  - Present the path of the configuration information of the generated scripts to reflect from and the path of the BPMN file to reflect into, then confirm that they are correct.
- Confirm whether to perform the reflection
  - Confirm whether to perform the reflection process. If YES, execute Step 1 and onward. If NO, abort the process.

### Step 1. Reflect the Generated Script Paths

The reflection logic is implemented in `.claude/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector.js`. The following is its overview and how to call it.

### Processing Overview

| Function | Role |
|------|------|
| `collectRoutingPaths(configDir)` | Collects the `path` attribute of `file-mapping` from the XML files under routing-jssp-config |
| `applyStartEventFormKey(xml, eventId, featurePath)` | Adds `formKey="forward:<feature path>"` to the start event |
| `applyUserTaskFormKey(xml, taskId, featurePath, pk)` | Adds `formKey="forward:<feature path>?processInstanceId=...&<pk>=..."` to the user task |
| `reflect(bpmnPath, routingConfigDir, mappings)` | Executes the above collectively and overwrites the BPMN file |

### Call Example

```javascript
var reflector = require('.claude/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector');

reflector.reflect(
  'doc/purchase-order-prompt/purchase-order.bpmn',
  'src/main/conf/routing-jssp-config',
  [
    // Start event: formKey = "forward:/purchase/apply"
    {
      type: 'startEvent',
      elementId: 'startEvent1',
      routingXml: 'purchase_apply.xml'
    },
    // User task: formKey = "forward:/purchase/approve?processInstanceId=...&orderCd=..."
    {
      type: 'userTask',
      elementId: 'approveTask',
      routingXml: 'purchase_approve.xml',
      pk: { param: 'orderCd', varName: 'orderCd' }
    }
  ]
);
```

### Notes on the mappings Definition

- `type`: Specify either `'startEvent'` or `'userTask'`
- `routingXml`: The XML file name under `routing-jssp-config` (used to obtain the `path` of `file-mapping`)
- `pk` (user tasks only, optional): Specify when passing the primary key of the business data from a process variable
  - As a prerequisite, the primary key item must be registered as a process variable and carried through within the process instance
  - `param`: The query parameter name (e.g. `orderCd`)
  - `varName`: The process variable name (e.g. `orderCd`)
- Elements that already have `formKey` set are not overwritten
