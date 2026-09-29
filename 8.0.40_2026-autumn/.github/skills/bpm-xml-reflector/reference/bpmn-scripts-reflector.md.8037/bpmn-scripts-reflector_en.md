# BPMN Script Reflector

## Overview
Parses BPMN-format XML and reflects the content of generated scripts into the BPMN.

## When to Use
When the user makes a request such as:
- "Please reflect the content of the generated scripts into the BPMN XML."

## Reflection Target
- Correct: `doc/<BPM process name>-prompt/<BPM process name>.bpmn` (the copy destination. This is the only place that may be modified.)
- Incorrect: `doc/<BPM process name>.bpmn` (the copy source. **Never modify this.**)

## Content Reflected into the BPMN XML
- This skill set performs the following:
  - Adds the path and parameters of the generated script to the BPMN's start event or user task

## Execution Procedure

### Step 0. Confirming the Target
- Confirm the configuration information of the generation script that is the reflection source, and the reflection destination file.
  - Present the path of the configuration information of the generation script that is the reflection source and the path of the reflection destination BPMN file, and confirm that there is no mistake.
- Whether to proceed with the reflection
  - Confirm whether to carry out the reflection process. If YES, execute Step 1 onward. If NO, abort the process.

### Step 1. Reflecting the Path of the Generated Script

The reflection logic is implemented in `.github/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector.js`. The following describes its overview and how to call it.

### Vendor Detection

When `reflect()` reads the BPMN, it uses `detectVendor(xml)` to automatically determine the authoring vendor from the namespace declarations, and passes the vendor type to the subsequent `applyXxxFormKey` calls. Depending on the determination result, the `formKey` attribute name to be applied is switched.

| Vendor | Determination condition |
|---------|---------|
| `im-bpm` (produced by IM-BPM) | Contains `xmlns:activiti="http://activiti.org/bpmn"` |
| `igrafx` (produced by iGrafx) | The namespace URI contains `www.igrafx.com` |
| `other` | Does not correspond to either of the above |

When calling `applyStartEventFormKey` / `applyUserTaskFormKey` individually, pass `vendor` as the trailing argument. If omitted, it is treated as `other` (no prefix, as before).

### Processing Overview

| Function | Role |
|------|------|
| `detectVendor(xml)` | Determines the authoring vendor (`'im-bpm'` / `'igrafx'` / `'other'`) from the namespace declarations |
| `collectRoutingPaths(configDir)` | Collects the `path` attribute of `file-mapping` from the XML files under routing-jssp-config |
| `applyStartEventFormKey(xml, eventId, featurePath, vendor)` | Applies `formKey="forward:<feature path>"` (`activiti:formKey` when produced by IM-BPM) to the start event |
| `applyUserTaskFormKey(xml, taskId, featurePath, pk, vendor)` | Applies `formKey="forward:<feature path>?processInstanceId=...&<pk>=..."` (`activiti:formKey` when produced by IM-BPM) to the user task |
| `reflect(bpmnPath, routingConfigDir, mappings)` | Executes the above together and overwrites and saves the BPMN file (internally runs `detectVendor()` and automatically passes the vendor type to each `applyXxxFormKey`) |

### Guard on the Reflection Destination Path

Before writing, `reflect()` validates `bpmnPath` with `isPromptCopyBpmnPath(bpmnPath)` (consolidated in `bpmn-reflector-utils.js`; shared with `reflectFixes()` in `bpmn-specs-reflector.js` and others). If the path is not in the `doc/<BPM process name>-prompt/<BPM process name>.bpmn` form (i.e. including the copy source `doc/<BPM process name>.bpmn`), it throws an exception and aborts the processing, writing nothing at all to the file. This guard enforces the rule from "Reflection Target" above — "Incorrect: never modify the copy source" — at the code level as well, regardless of any mistaken instruction from the caller.

**Attribute names by vendor:**

| Item | Produced by IM-BPM | iGrafx / other |
|------|-----------|----------------|
| `formKey` attribute | `activiti:formKey` | `formKey` |

### Example Call

```javascript
var reflector = require('./.github/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector.js');

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

### Notes on the `mappings` Definition

- `type`: Specify `'startEvent'` or `'userTask'`
- `routingXml`: The XML file name under `routing-jssp-config` (used to obtain the `path` of `file-mapping`)
- `pk` (user task only, optional): Specify this when passing the primary key of the business data from a process variable
  - The prerequisite is that the primary key item has been registered as a process variable and carried around within the process instance
  - `param`: The query parameter name (e.g., `orderCd`)
  - `varName`: The process variable name (e.g., `orderCd`)
- Elements for which `formKey` has already been set are not overwritten (when produced by IM-BPM, this is determined by the presence or absence of `activiti:formKey`)
- As long as it is called via `reflect()`, the determination of the authoring vendor and the switching of attribute names are performed automatically, so the caller does not need to be aware of them
