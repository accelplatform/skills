# IM-LogicDesigner Import Specification

Loads IM-LogicDesigner import data (ZIP) through `LogicFlowImporter` during Sample Data Setup.

How to specify `logicImport.files`, the processing flow of the generated JS, why direct Java access (`Packages.***`) is required and on what grounds it is permitted, how to create the `InputStream`, transactions, and the required versions are identical to Tenant Setup.
See `.agents/skills/jssp-tenant-setup-generator/reference/logic-import.md`.

## Differences

| | Tenant Setup | **Sample Data Setup** |
|---|---|---|
| Copy destination of the import ZIP | `storage/system/products/import/basic/<key>/<version>/<file>.zip` | `storage/system/products/import/sample/<key>/<file>.zip` |
| Extended import JS | `jssp/src/<key>/initialize/<version>/<key>_logic_import.js` | `jssp/src/<key>/initialize/<key>_logic_import.js` |
| Signature of `importData` | `importData(inputStream)` (no overwrite) | **`importData(inputStream, true)` (with overwrite)** |
| Authz policies for routing | Can be loaded by splitting `configNumber` | **Cannot be loaded** |
| On error | The whole Importer stops immediately | **Subsequent processing continues** |

The copy source (`src/main/storage/public/im_logic/`) is the same.

Add `logicImport` **only when the user explicitly requests it** (see "Default Policy" in SKILL.md).

## Use the Overwrite Version of `importData`

It runs every time, and re-execution cannot be prevented by splitting configs, so the non-overwrite version always fails with a conflict error from the second run onward.

```javascript
// Second argument true: overwrite the existing flow
importer.importData(inputStream, true);
```

To avoid overwriting, rewrite the generated JS to `importer.importData(inputStream)` (which means accepting errors from the second run onward).

## Authz Policies for Routing Cannot Be Loaded

When the logic flow contains routing definitions, an authz resource for the `authzUri` in `flow_route.json` (e.g. `im-logic-rest://<flowId>`) is generated automatically at import time (with type `im-logic-rest`).

**An `authz-policy` that references this resource cannot be loaded by Sample Data Setup.**

Execution order:

```
database -> tenant-master(authz / menu / job) -> extends-import(doImport)
```

`<authz-policy-file>` sits under `<tenant-master>` and is processed **before** the LogicDesigner extended import. The policy is loaded while the resource is still unregistered, and **the Importer raises an error (subsequent processing continues)**. Tenant Setup can resolve this by splitting `configNumber`, but **Sample Data Setup can create only one config file, so it cannot be split.**

**Workaround**: load them on the Tenant Setup side (by splitting `configNumber` in `jssp-tenant-setup-generator`). For how to write the policy (`type` is `im-logic-rest`, not `service`, and `resource` is the SHA-256 of `authzUri`), see
"Order of Inserting Authz Policies for Routing" in `.agents/skills/jssp-tenant-setup-generator/reference/logic-import.md`.

The build script emits a warning when it detects `type="im-logic-rest"`.

## Error Detection

When a `LogicServiceException` is thrown, the `catch` picks it up and re-throws it, but **the subsequent setup processing continues**. Check whether the `<key>.logic_import` logger outputs `logic import completed.`

## Updating Materials

1. Update the original ZIP under `storage/public/im_logic/`
2. Re-run the build script with `--force` (overwrites the copy under `storage/system`)

Do not keep old version directories.

## Related References

- [extends-import.md](extends-import.md)
- [workflow-import.md](workflow-import.md)
- [imw-logic-plugin-import.md](imw-logic-plugin-import.md)
