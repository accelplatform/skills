# IM-Workflow Import Specification

Loads IM-Workflow import data (contents / route / flow / matter properties / rules) through `DataImportExecutor` during Sample Data Setup.

How to specify `workflowImport.files`, the processing flow of the generated JS, the loading order of `dataType`, XML splitting (`extractTopLevelSections`, which loads every block even when same-named tags such as `<rule>` are repeated), the handling of UTF-16, temporary files, transactions, and the required version (8.0.37 or later) are identical to Tenant Setup.
See `.claude/skills/jssp-tenant-setup-generator/reference/workflow-import.md`.

## Differences

| | Tenant Setup | **Sample Data Setup** |
|---|---|---|
| Copy destination of the import XML | `storage/system/products/import/basic/<key>/<version>/<file>.xml` | `storage/system/products/import/sample/<key>/<file>.xml` |
| Extended import JS | `jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` | `jssp/src/<key>/initialize/<key>_workflow_import.js` |
| Preventing re-loading | Splitting `configNumber` | **No means available** (it runs every time) |
| On error | The whole Importer stops immediately | **Subsequent processing continues** |

The copy source (`src/main/storage/public/im_workflow/`) is the same.

Add `workflowImport` **only when the user explicitly requests it** (see "Default Policy" in SKILL.md).

## Idempotency

The same WF XML is loaded every time. Tenant Setup can prevent re-execution by splitting `configNumber`, but **Sample Data Setup has no such means**. Whether a re-load is treated as an update or rejected depends on how the IDs and version numbers of the WF definition are managed.

| Approach | Description |
|---|---|
| Manage IDs / version numbers so that a re-load is treated as an update | Handle it in the design of the WF definition (recommended) |
| Accept the errors | Tolerate errors from the second run onward as an operational decision (always check the logs) |

**Check the logs for both the first run and the second run.**

## Error Detection

An exception is thrown when the result of `executor.importData` is `error` or `!success`, but **the subsequent setup processing continues**. The completion message alone does not tell you whether it succeeded, so check whether the `<key>.workflow_import` logger outputs `workflow import completed.`

## Updating Materials

1. Update the original XML under `storage/public/im_workflow/`
2. Re-run the build script with `--force` (overwrites the copy under `storage/system`)

Do not keep old version directories.

## Related References

- [extends-import.md](extends-import.md)
- [logic-import.md](logic-import.md)
- [imw-logic-plugin-import.md](imw-logic-plugin-import.md): execution order when registering an LD flow as a WF plugin
