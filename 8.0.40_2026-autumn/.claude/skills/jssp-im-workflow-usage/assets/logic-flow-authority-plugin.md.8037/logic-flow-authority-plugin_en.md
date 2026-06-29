# Processing-Target Plugin Using IM-LogicDesigner

## Overview

An approach for dynamically determining IM-Workflow processing targets using an **IM-LogicDesigner logic flow**.
Serves as a low-code alternative to the SSJS plugin (`authority_exec_event_listener.js`).

### When to Use: SSJS Plugin vs. IM-LogicDesigner

| Criterion | SSJS Plugin | IM-LogicDesigner |
|-----------|-------------|-----------------|
| Implementation method | JavaScript code | Logic flow (GUI) |
| Complex business logic | ◎ Flexible | △ Handled via task combinations |
| DB reference / API integration | ◎ Direct implementation | ○ Handled via tasks |
| Maintenance / change | △ Release required | ◎ Changeable from admin screen |
| Debugging | △ Log inspection | ○ Flow debug feature |

---

## Steps to Create the Flow Definition

### 1. Create spec.json

Create a `spec.json` based on the template below.
You may keep only the input definitions (imwMatterInfo / imwApplyAuthInfo / imwBeforeNodeAuthInfo) that you actually need.

```json
{
  "featureName": "<feature name>",
  "flowCategories": [
    {
      "categoryId": "<category ID>",
      "categoryName": "<category name (English)>",
      "sortNumber": 100,
      "localizes": {
        "ja":    { "locale": "ja",    "categoryName": "<category name (Japanese)>" },
        "en":    { "locale": "en",    "categoryName": "<category name (English)>" },
        "zh_CN": { "locale": "zh_CN", "categoryName": "<category name (Chinese)>" }
      },
      "parentId": null
    }
  ],
  "flows": [
    {
      "flowId": "<flow ID>",
      "flowName": "<flow name>",
      "categoryId": "<category ID>",
      "version": 1,
      "transaction": false,
      "validateRepositoryData": false,
      "notes": "Logic flow for IM-Workflow processing-target plugin",
      "constants": [],
      "variablesDataDefinition": {
        "entrypoint": { "typeId": "root", "basic": false, "required": false, "listingType": "none" },
        "typeDefinitions": [{ "id": "root", "properties": [] }]
      },
      "inputDataDefinition": {
        "entrypoint": { "typeId": "root", "basic": false, "required": false, "listingType": "none" },
        "typeDefinitions": [
          {
            "id": "root",
            "properties": [
              { "typeId": "im_logic_object_imw_matter_info",          "name": "imwMatterInfo",         "description": "Case information",                   "listingType": "none", "required": false, "basic": false },
              { "typeId": "im_logic_object_imw_apply_auth_info",      "name": "imwApplyAuthInfo",      "description": "Application processing authority",   "listingType": "none", "required": false, "basic": false },
              { "typeId": "im_logic_object_imw_before_node_auth_info","name": "imwBeforeNodeAuthInfo", "description": "Previous node processing authority", "listingType": "none", "required": false, "basic": false }
            ]
          },
          {
            "id": "im_logic_object_imw_matter_info",
            "properties": [
              { "typeId": "string", "name": "applyBaseDate",     "description": "Application base date",      "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "contentsId",        "description": "Contents ID",                "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "contentsVersionId", "description": "Contents version ID",        "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "flowId",            "description": "Flow ID",                    "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "flowVersionId",     "description": "Flow version ID",            "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "nodeId",            "description": "Node ID",                    "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "routeId",           "description": "Route ID",                   "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "routeVersionId",    "description": "Route version ID",           "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "systemMatterId",    "description": "System case ID",             "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "userDataId",        "description": "User data ID",               "listingType": "none", "required": false, "basic": true }
            ]
          },
          {
            "id": "im_logic_object_imw_apply_auth_info",
            "properties": [
              { "typeId": "string", "name": "userCd",          "description": "Applicant user code",             "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "companyCd",       "description": "Applicant company code",          "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentSetCd", "description": "Applicant org-set code",          "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentCd",    "description": "Applicant department code",       "listingType": "none", "required": false, "basic": true }
            ]
          },
          {
            "id": "im_logic_object_imw_before_node_auth_info",
            "properties": [
              { "typeId": "string", "name": "userCd",          "description": "Previous processor user code",    "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "companyCd",       "description": "Previous processor company code", "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentSetCd", "description": "Previous processor org-set code", "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentCd",    "description": "Previous processor dept code",    "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "nodeId",          "description": "Previous node ID",                "listingType": "none", "required": false, "basic": true }
            ]
          },
          { "id": "string", "properties": [] }
        ]
      },
      "outputDataDefinition": {
        "entrypoint": { "typeId": "root", "basic": false, "required": false, "listingType": "none" },
        "typeDefinitions": [
          {
            "id": "root",
            "properties": [
              {
                "typeId": "string",
                "name": "userCds",
                "description": "Array of processing-target user codes. Returning null means no authority holder (flow not expanded).",
                "listingType": "array",
                "required": false,
                "basic": true
              }
            ]
          },
          { "id": "string", "properties": [] }
        ]
      },
      "tasks": [
        { "type": "im_start", "label": "Start" },
        { "type": "im_end",   "label": "End" }
      ],
      "edges": [
        { "from": "im_start", "to": "im_end1" }
      ]
    }
  ]
}
```

### 2. Generate the Flow Definition ZIP

```bash
node {{AGENT_ROOT}}/skills/jssp-im-logic-generator/scripts/build-flow.js <spec.json> --zip
```

Output location: `src/main/storage/public/im_logic/im-logicdesigner-data-<featureName>.zip`

### 3. Validate the Flow Definition

```bash
node {{AGENT_ROOT}}/skills/jssp-im-logic-generator/scripts/validate-flow.js \
  src/main/storage/public/im_logic/im-logicdesigner-data-<featureName>.zip
```

Confirm that `PASS (0 warning(s))` is output.

---

## Specifying in the IM-Workflow Route Definition XML

Use the `flowId` of the generated flow to specify the authority plugin in the IM-Workflow route definition XML.
When generating the XML with the `jssp-im-workflow-generator` skill, refer to the "Logic Flow Specification" section in `authority-plugins.md` and write the spec.json accordingly.

```xml
<!-- Example: authority configuration for an approval node -->
<extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve</extensionPointId>
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.logic_flow_user</pluginId>
<parameter type="string">{"flowId" : "<flow ID>", "version" : null, "versionDecide" : false}</parameter>
<targetType type="string">logic_flow_user</targetType>
<targetCode type="string">{"flowId" : "<flow ID>", "version" : null, "versionDecide" : false}</targetCode>
```

**Available extension points (verified on real systems)**

| Node type | Extension point |
|-----------|----------------|
| Approval node (preceding node is a human node) | `node.approve` |
| Confirmation node | `node.confirm` |
| Reference user setting | `administrator.flow.handle` |

---

## Integrating into Tenant Environment Setup

In addition to importing the IM-LogicDesigner flow ZIP, you can also incorporate IM-Workflow plugin registration into the tenant environment setup.

### ⚠️ Execution Order (Required)

`WorkflowLogicFlowManager.createLogicFlow` (plugin registration) will fail if the flow does not yet exist in IM-LogicDesigner. **Always execute in the following order.**

```
1. <key>_logic_import.js    ← Import the IM-LogicDesigner flow ZIP (create the flow first)
2. <key>_workflow_import.js ← Import the IM-Workflow definition XML (optional)
3. <key>_import.js          ← Register the IM-Workflow logic flow plugin (execute last)
```

> The XML generated by the build script is ordered `_import.js` → `_workflow_import.js` → `_logic_import.js`,
> so **manually reorder the `<extends-import>` section in `import-<artifactId>-config-<N>.xml` after generation.**

```xml
<!-- Correct order -->
<extends-import>
  <extends-import-class>sample/initialize/1.0.0/sample_logic_import.js</extends-import-class>
  <extends-import-class>sample/initialize/1.0.0/sample_workflow_import.js</extends-import-class>
  <extends-import-class>sample/initialize/1.0.0/sample_import.js</extends-import-class>
</extends-import>
```

### How to Generate Each JS File

| JS file | Generating skill | Description |
|---------|-----------------|-------------|
| `<key>_logic_import.js` | `jssp-tenant-setup-generator` (`logicImport` section) | Imports the flow ZIP via `LogicFlowImporter` |
| `<key>_workflow_import.js` | `jssp-tenant-setup-generator` (`workflowImport` section) | Imports the WF definition XML via `DataImportExecutor` |
| `<key>_import.js` | Create manually (use the template in `reference/imw-logic-plugin-import.md`) | Registers the plugin via `WorkflowLogicFlowManager` |

For the plugin registration JS template and implementation details, see
`jssp-tenant-setup-generator/reference/imw-logic-plugin-import.md`.

---

## Notes

- **When a node is reached via pullback, sendback, or case operation node movement**, the logic flow is not executed; instead, the last processor is adopted as the authority holder (behavior as of 2023 Autumn and later)
- Returning `null` from the flow output `userCds` is treated as "no authority holder" (the flow is not expanded)
- `version: null` always uses the latest published version. To pin to a specific version, set `version` to an integer and set `versionDecide: true`
