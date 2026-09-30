# IM-Workflow Logic Flow Plugin Registration (Extended Import)

An extended import that registers an IM-LogicDesigner logic flow as an IM-Workflow processing-target plugin (`.logic_flow_user`) through `WorkflowLogicFlowManager`.

The implementation template (the `IMW_LOGIC_FLOW_PLUGINS` array + `doImport` + `registerLogicFlowPlugin`), the `WorkflowLogicFlowManager` API specification (`deleteLogicFlow` / `createLogicFlow`), the `resourceTypes` categories, and the full refresh approach are identical to Tenant Setup.
See `.claude/skills/jssp-tenant-setup-generator/reference/imw-logic-plugin-import.md`.

**The full refresh approach (`deleteLogicFlow` -> `createLogicFlow`) suits Sample Data Setup — which runs every time — as-is, and needs no changes.**

## Differences

| Tenant Setup | **Sample Data Setup** |
|---|---|
| `<key>/initialize/<version>/<key>_import.js` | `<key>/initialize/<key>_import.js` (no `<version>`) |
| `<key>/initialize/<version>/<key>_workflow_import.js` | `<key>/initialize/<key>_workflow_import.js` |
| `<key>/initialize/<version>/<key>_logic_import.js` | `<key>/initialize/<key>_logic_import.js` |
| Order control: splitting configs, or the order of entries | **Only the order of entries** (configs cannot be split) |
| On error: the whole Importer stops immediately | **Subsequent processing continues** |

## ⚠️ Execution Order (Required)

`WorkflowLogicFlowManager.createLogicFlow` references the registration state of LD flows, so **running it while no LD flow exists will fail**.

```
1. <key>_logic_import.js    ← Import the LD flow ZIP (creates the flows)
2. <key>_workflow_import.js ← Import the IM-Workflow definition XML
3. <key>_import.js          ← Plugin registration (last)
```

`build-sample-setup-import.js` generates them in the order `_import.js` -> `_workflow_import.js` -> `_logic_import.js`. **This is the reverse order, so reorder the XML manually after generation.**

```xml
<extends-import>
  <extends-import-class>any_app/initialize/any_app_logic_import.js</extends-import-class>
  <extends-import-class>any_app/initialize/any_app_workflow_import.js</extends-import-class>
  <extends-import-class>any_app/initialize/any_app_import.js</extends-import-class>
</extends-import>
```

Since only one config file can be created, order cannot be controlled by splitting configs. **This reordering is the only means available.**

## Error Detection

Subsequent setup processing continues even when an exception is thrown. Check the output of the `<key>.initialize` logger and the registration in the IM-Workflow admin screen under "Logic Flow List".

## Related References

- [extends-import.md](extends-import.md)
- [logic-import.md](logic-import.md): must run first
- [workflow-import.md](workflow-import.md)
