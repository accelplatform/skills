# Structure of import-&lt;artifactId&gt;-config.xml

The entry-point configuration file for the Sample Data Setup Importer.
It enumerates the paths of the various XML/SQL/JS files that must be referenced during setup execution.

## Storage location

```
src/main/conf/products/import/sample/import-<artifactId>-config.xml
```

The referenced XML/SQL files (`<role-file>` etc.) are placed under `src/main/storage/system`,
and the extended import JS is placed under `src/main/jssp/src`. Note that only `import-<artifactId>-config.xml` itself is placed under `src/main/conf`.

| Part | Meaning | How it is determined |
|---|---|---|
| `<artifactId>` | Setup XML file name. **Per the Sample Data Setup specification, this must match the `<artifactId>` in `pom.xml`** | `"artifactId"` in spec.json -> `<artifactId>` in the project root `pom.xml` (excluding the one inside `<parent>`) -> the last dot-separated segment of `<id>` in `module.xml` (e.g., `mypackage.hoge` -> `hoge`) -> `spec.key` (fallback) |
| `<key>` | Application key (the identifier used for the directory name under storage, the reference path, and the resource file name) | `"key"` in spec.json (required) |

`<artifactId>` and `<key>` may have different values. For example, when `<key>="equip"` and `<artifactId>="equipment-lending-system"`, the file is placed at `src/main/conf/products/import/sample/import-equipment-lending-system-config.xml` (the file name uses `<artifactId>`). On the other hand, the paths referenced by `<role-file>` etc. are based on `<key>`, for example `products/import/sample/equip/equip-role.xml`.

> **Note**: The short module ID directory **does not exist on the config file side (`conf/`)**, but **does exist on the import file side (`storage/system`)** (`products/import/sample/%short module ID%/`).

## Only one config file

Since Sample Data Setup is out of scope for schema version management, **at most one config file is created for a given module**. There is no concept equivalent to the `configNumber` or the multiple config operations of Tenant Setup.

The build script stops with an error when it detects `spec.configNumber` / `spec.version`. Update materials by overwriting the existing files (`--force`).

**Implication**: execution order cannot be controlled by splitting configs. The only way to control order is the order of the entries inside `<extends-import>` ([extends-import.md](extends-import.md), [logic-import.md](logic-import.md#authz-policies-for-routing-cannot-be-loaded)).

## Namespace and schema

```xml
<import-data-config
   xmlns="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config import-data-config.xsd">
  ...
</import-data-config>
```

The format file (xsd) is `WEB-INF/schema/import-data-config.xsd`. It is identical to Tenant Setup.

## Child elements

Place the following sections directly under the top-level `<import-data-config>`. **Keep this order, because the XSD defines them as a `sequence`.**

| Order | Section | Content | When it is output |
|---|-----------|------|---------------|
| 1 | `<database>` | References to DDL / DML SQL | When `spec.database` is present |
| 2 | `<tenant-master>` | XML references for roles, authz, menus, and jobs | When the corresponding spec field is present |
| 3 | `<extends-import>` | References to extended import JS | When `spec.extendsImport === true`, etc. |

Each section is `minOccurs="0"` and can therefore be omitted. The build script does not output sections or elements that are not specified in the spec.

## `<database>`

**In the order `create-file` -> `insert-file`** (the XSD `sequence`).

```xml
<database>
  <create-file>products/import/sample/any_app/any_app-ddl.sql</create-file>
  <insert-file>products/import/sample/any_app/any_app-dml.sql</insert-file>
</database>
```

`<create-file>` is output only when there is a table with `spec.database.tables[].ddl: true`. The Importer appends the DB-Type suffix (`_postgre` / `_oracle` / `_sqlserver`) automatically, so write the entry in the config **without a suffix**. For details, see [database-sql.md](database-sql.md).

## Path base directories

| Element | Base directory |
|------|----------------|
| `<create-file>` / `<insert-file>` | Path relative to `src/main/storage/system` |
| `<role-file>` / `<authz-*-file>` / `<menu-group-file>` / `<job-scheduler-file>` | Path relative to `src/main/storage/system` |
| `<extends-import-class>` | Path relative to `src/main/jssp/src` |

Reference paths **do not include** a `<version>` directory (`products/import/sample/<key>/<key>-role.xml`, `<key>/initialize/<key>_import.js`).

## Ordering of localized files

Each element is arranged in the order: **base -> ja -> en -> zh_CN**. The base file (no locale suffix) describes the ID and resource definitions themselves, while `_ja.xml` / `_en.xml` / `_zh_CN.xml` describe only the differences in display names.

```xml
<role-file>products/import/sample/any_app/any_app-role.xml</role-file>
<role-file>products/import/sample/any_app/any_app-role_ja.xml</role-file>
<role-file>products/import/sample/any_app/any_app-role_en.xml</role-file>
<role-file>products/import/sample/any_app/any_app-role_zh_CN.xml</role-file>
```

## Sample (complete version)

See the output when [examples/any_app.spec.json](../examples/any_app.spec.json) is fed into `scripts/build-sample-setup-import.js`.

## Notes

- `<authz-policy-file>` **does not have a localized version** (since it consists only of subject expressions and resource IDs, with no display names).
- `<create-file>` / `<insert-file>` under `<database>` are order-dependent. Describe DDL (create-file) first, followed by DML (insert-file).
- For the extended import JS in `<extends-import>`, `doImport(tenantId)` is invoked **immediately after the tenant master data has been loaded**. For details, see [extends-import.md](extends-import.md).
