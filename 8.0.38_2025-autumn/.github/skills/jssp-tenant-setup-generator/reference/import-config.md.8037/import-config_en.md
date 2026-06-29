# Structure of import-<artifactId>-config-1.xml

The entry-point configuration file for the tenant environment setup Importer.
It enumerates the paths of the various XML/SQL/JS files that must be referenced during setup execution.

## Storage location

```
src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-<N>.xml
```

The referenced XML/SQL files (`<role-file>` etc.) are placed under `src/main/storage/system`,
and the extended import JS files are placed under `src/main/jssp/src`. Note that only `import-<artifactId>-config-<N>.xml` itself is placed under `src/main/conf`.

| Part | Meaning | How it is determined |
|---|---|---|
| `<artifactId>` | Setup XML storage directory name and file name. **Per the intra-mart tenant environment setup specification, this must match the `<artifactId>` in `pom.xml`** (both the directory name and file name use the same `<artifactId>`) | `"artifactId"` in spec.json -> `<artifactId>` in the project root `pom.xml` (excluding the one inside `<parent>`) -> the last dot-separated segment of `<id>` in `module.xml` (e.g., `mypackage.hoge` -> `hoge`) -> `spec.key` (fallback) |
| `<key>` | Application key (the identifier used for the directory name under storage, the reference path, and the resource file name) | `"key"` in spec.json (required) |
| `<N>` | Config number. The initial version is `1`, and it is incremented to `2`, `3`, ... with each version upgrade | `"configNumber"` in spec.json (defaults to `1` when omitted) |

`<artifactId>` and `<key>` may have different values. For example, when `<key>="equip"` and `<artifactId>="equipment-lending-system"`, the file is placed at `src/main/conf/products/import/basic/equipment-lending-system/import-equipment-lending-system-config-1.xml` (both the directory name and file name use `<artifactId>`). On the other hand, the paths referenced by `<role-file>` etc. are based on `<key>`, for example `products/import/basic/equip/1.0.0/equip-role.xml`.

## Operation during version upgrades

The intra-mart Importer is specified to execute **all** `import-<artifactId>-config-1.xml` -> `import-<artifactId>-config-2.xml` -> ... files **in numerical order**. Therefore:

- **Do not touch existing config-N.xml files** (modifying them would require re-injection into existing tenants)
- **Add a new config-(N+1).xml for the new version**
- **Describe only the differences in the new config** (to prevent duplicate injection, do not include existing role IDs etc.)
- **Place assets in a separate `basic/<key>/<version>/` directory** (keep old versions for historical reference)

The build script prohibits overwriting existing files (allow with `--force`), so a differential config can be safely added simply by changing `spec.configNumber` and `spec.version`. For details, see "Multiple config operation" in SKILL.md.

## Namespace and schema

```xml
<import-data-config
   xmlns="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config import-data-config.xsd">
  ...
</import-data-config>
```

## Child elements

The following sections are placed directly under the top-level `<import-data-config>`.

| Section | Content | Output timing |
|-----------|------|---------------|
| `<database>` | References to DDL / DML SQL | When `spec.database` is present |
| `<tenant-master>` | References to XML for role, authorization, menu, and job | When the corresponding spec field is present |
| `<extends-import>` | References to extended import JS | When `spec.extendsImport === true` |

The build script does not output sections / elements that are not specified in the spec (not even as empty tags).

## Automatic DB-Type suffix addition under `<database>`

For the file names (immediately before the extension) written in `<create-file>` / `<insert-file>`, the intra-mart Importer **automatically appends** the suffix `_postgre` / `_oracle` / `_sqlserver` according to the connection destination DB.

```xml
<create-file>products/import/basic/equip/1.0.0/equip-ddl.sql</create-file>
```

-> PostgreSQL environment: reads `equip-ddl_postgre.sql` / Oracle: `equip-ddl_oracle.sql` / SQL Server: `equip-ddl_sqlserver.sql`

References inside config-1.xml are written **without the suffix**. The actual file placement is resolved with the following priority:

1. **Suffixed file** (`_postgre` / `_oracle` / `_sqlserver`) -- DB-specific, preferred
2. **Non-suffixed file** -- common fallback for all DBs

For this reason:

- **DDL is split into the 3 dialects** (since type and constraint syntax differ per DB)
- **DML is consolidated into a single file** (since INSERT statements can easily be unified with standard SQL)

are the recommended patterns. For details, see [database-sql.md](database-sql.md).

## Path base directories

```xml
<role-file>products/import/basic/any_app/1.0.0/any_app-role.xml</role-file>
```

| Element | Base directory |
|------|----------------|
| `<create-file>` / `<insert-file>` | Path relative to `src/main/storage/system` |
| `<role-file>` / `<authz-*-file>` / `<menu-group-file>` / `<job-scheduler-file>` | Path relative to `src/main/storage/system` |
| `<extends-import-class>` | Path relative to `src/main/jssp/src` |

Reference paths include the `<key>/<version>/` directory structure (e.g., `products/import/basic/<key>/<version>/<key>-role.xml`, `<key>/initialize/<version>/<key>_import.js`). The priority for determining `<version>` is: `"version"` in spec.json -> `<version>` in the project root `module.xml` or `pom.xml` -> `1.0.0`. During version upgrades, the operation is to newly generate assets in a separate version directory and rewrite the reference lines in this file to switch over.

### File name suffix when configNumber > 1

When `spec.configNumber >= 2`, the build script appends the suffix `-<N>` to the end of the base part of each file name. The output directories (`<version>/` and `<version>/initialize/`) remain unchanged; only the file name is differentiated.

| Type | configNumber: 1 | configNumber: 4 |
|---|---|---|
| Base XML | `equip-authz-policy.xml` | `equip-authz-policy-4.xml` |
| Localized XML | `equip-role_ja.xml` | `equip-role-4_ja.xml` |
| DB dialect SQL | `equip-ddl_postgre.sql` | `equip-ddl-4_postgre.sql` |
| Extended import JS | `equip_import.js` | `equip_import-4.js` |
| Workflow import JS | `equip_workflow_import.js` | `equip_workflow_import-4.js` |
| Logic import JS | `equip_logic_import.js` | `equip_logic_import-4.js` |

The `-<N>` is inserted **immediately before** locale (`_ja` / `_en` / `_zh_CN`) or DB dialect (`_postgre` / `_oracle` / `_sqlserver`) suffixes, so it does not interfere with these naming conventions.

Example reference paths inside `import-<artifactId>-config-<N>.xml`:

```xml
<!-- configNumber: 1 -->
<role-file>products/import/basic/equip/1.0.0/equip-role.xml</role-file>

<!-- configNumber: 4 -->
<authz-policy-file>products/import/basic/equip/1.0.0/equip-authz-policy-4.xml</authz-policy-file>
```

Suffix separation is not used for version-upgrade operations, but for **cases where you want to control the import order within the same version** (for example, when applying a policy belatedly to a resource generated by LogicDesigner routing). For details, see [logic-import.md](logic-import.md).

## Ordering of localized files

Each element is arranged in the order: **base -> ja -> en -> zh_CN**. The base file (no locale suffix) describes the ID and resource definitions themselves, while `_ja.xml` / `_en.xml` / `_zh_CN.xml` describe only the differences in display names.

```xml
<role-file>products/import/basic/any_app/1.0.0/any_app-role.xml</role-file>
<role-file>products/import/basic/any_app/1.0.0/any_app-role_ja.xml</role-file>
<role-file>products/import/basic/any_app/1.0.0/any_app-role_en.xml</role-file>
<role-file>products/import/basic/any_app/1.0.0/any_app-role_zh_CN.xml</role-file>
```

## Sample (complete version)

See the output when [examples/any_app.spec.json](../examples/any_app.spec.json) is fed into `scripts/build-setup-import.js`.

## Notes

- `<authz-policy-file>` **does not have a localized version** (since it consists only of subject expressions and resource IDs, with no display names).
- `<create-file>` / `<insert-file>` under `<database>` are order-dependent. Describe DDL (create-file) first, followed by DML (insert-file).
- For the extended import JS in `<extends-import>`, `doImport(tenantId)` is invoked **immediately after the tenant master within this config has been injected** (the database / authz / menu / job within the same config are already loaded). When there are multiple configs, the same flow is repeated in numerical order, so masters injected by later configs do not yet exist at the time of the earlier config's `doImport`. For details, see [extends-import.md](extends-import.md).
