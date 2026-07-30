# Extended Import (doImport) Specification

JSSP scripts referenced by `<extends-import-class>`. They are called one after another, in the order they are written in the `<extends-import>` section.

The specification of the `doImport(tenantId)` entry point, the available APIs, the transaction control patterns, and the sample implementation are identical to Tenant Setup.
See `.github/skills/jssp-tenant-setup-generator/reference/extends-import.md`.

## Differences

| | Tenant Setup | **Sample Data Setup** |
|---|---|---|
| Placement path | `jssp/src/<key>/initialize/<version>/<key>_import.js` | `jssp/src/<key>/initialize/<key>_import.js` (no `<version>`) |
| Re-execution | Already-completed setups are skipped | **Runs every time** -> must be idempotent |
| On exception | The whole Importer stops immediately | **Subsequent processing continues** -> logging is mandatory |
| Order control | Splitting by `configNumber`, or the order of entries | **Only the order of entries** |

```xml
<extends-import>
  <extends-import-class>any_app/initialize/any_app_import.js</extends-import-class>
</extends-import>
```

## Execution Order

```
database(DDL -> DML) -> tenant-master(role/authz/menu/job) -> extends-import(doImport)
```

`doImport` is called immediately after the tenant master data is loaded. Since only one config file can be created, order cannot be controlled by splitting configs.

| What you want to do | How |
|---|---|
| Control the order among multiple extended imports | The order of the `<extends-import-class>` entries |
| Load tenant master data after an extended import | **Not possible**. Do it on the Tenant Setup side (by splitting `configNumber`) |

Concrete examples: [imw-logic-plugin-import.md](imw-logic-plugin-import.md), [logic-import.md](logic-import.md#authz-policies-for-routing-cannot-be-loaded)

## Idempotency

Because it runs every time, implement it so that re-running produces the same result.

| Pattern | Implementation approach |
|---|---|
| Loading data | A full refresh (delete -> create) is the most reliable. Alternatively, INSERT after an existence check |
| Placing files | Check whether the file exists before writing, or always overwrite |
| Integrating with external systems | Confirm that running it twice has no side effects |

For a concrete full refresh example, see [imw-logic-plugin-import.md](imw-logic-plugin-import.md) (`deleteLogicFlow` -> `createLogicFlow`).

## Error Detection

Throwing an exception does not stop the whole Importer (the subsequent setup processing continues). **Start / completion / exception logging via `Logger` is mandatory.** Without logs, failures go unnoticed.

## Specification in spec.json

```json
"extendsImport": true
```

`true` generates an empty `doImport(tenantId)` skeleton and adds the `<extends-import-class>` line. Write the implementation after generation.
