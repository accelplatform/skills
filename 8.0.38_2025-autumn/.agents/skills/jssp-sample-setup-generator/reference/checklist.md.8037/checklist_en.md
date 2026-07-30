# Post-Generation Self-Check Checklist for Sample Data Setup Materials

After running build-sample-setup-import.js, verify the following items.

For the Multilingual Files, Reference Integrity, Job Scheduler, and Menu Group sections, see
`.agents/skills/jssp-tenant-setup-generator/reference/checklist.md` (apply the substitutions listed under "Substitutions to apply when reading those references" in SKILL.md).

The items below are specific to Sample Data Setup.

## File Structure

- [ ] `src/main/conf/products/import/sample/import-<artifactId>-config.xml` has been output
  - **No short module ID directory in between** (directly under `conf/products/import/sample/`)
  - **No schema version in the file name** (`-config.xml`, not `-config-1.xml`)
- [ ] Each XML / SQL file is output under `src/main/storage/system/products/import/sample/<key>/`
  - **No `<version>` directory in between**
  - The short module ID directory (`<key>/`) **does exist** here (do not confuse it with the config file side)
- [ ] The extended import JS is directly under `src/main/jssp/src/<key>/initialize/` (**no `<version>` directory**)
- [ ] All XML files are encoded in UTF-8 (without BOM)

## Skill-Specific Checks (Most Important)

- [ ] **Neither `spec.version` nor `spec.configNumber` is specified** (the build script stops with an error if they are)
- [ ] **`ddl: true` is specified only for tables exclusive to Sample Data Setup**. Tables for the module itself are created on the Tenant Setup side
- [ ] **Idempotency has been verified** (every module runs on every execution)
  - [ ] The CREATE TABLE in the DDL does not fail when the table already exists (with an existence check)
  - [ ] The INSERT in the DML does not violate a unique constraint when loaded twice (`WHERE NOT EXISTS`, `DELETE` before `INSERT`, etc.)
  - [ ] The extended import `doImport()` produces the same result when re-run (a full refresh is recommended)
  - [ ] The `logicImport` JS uses `importData(inputStream, true)` (with overwrite)
- [ ] **Log output is in place** (processing continues even after an exception, so failures go unnoticed without logs)
- [ ] When the order of `<extends-import-class>` must be controlled, it is controlled **by the order of the entries within the same file** (configs cannot be split)
- [ ] No authz policy with `type="im-logic-rest"` is included (it cannot be loaded; the build script emits a warning)
- [ ] **Roles / authz resources / menu groups / jobs already defined on the Tenant Setup side are not redefined** (they would be loaded twice)
- [ ] IDs newly defined on the sample side do not collide with the Tenant Setup side (both setups load materials for the same `<key>`). Keep the `sort-key` of authz subject groups and the `sortNumber` of menu groups in a different value range from the tenant side as well
- [ ] Tables without `ddl` are already created by the Tenant Setup DDL

## XSD Structure

- [ ] Directly under `<import-data-config>`, the order is **`database` -> `tenant-master` -> `extends-import`** (the XSD sequence)
- [ ] Inside `<database>`, the order is **`create-file` -> `insert-file`**
- [ ] Inside `<tenant-master>`, entries follow dependency order (role -> authz resource group -> authz resource -> authz subject group -> menu group -> **authz policy** -> job scheduler)

## DDL (when `tables[].ddl: true` is specified)

- [ ] The actual table definitions have been added to the CREATE TABLE skeleton (nothing is created while only comments remain)
- [ ] **Comment lines have been removed** (comments inside SQL statements are not supported by specification)
- [ ] **All three dialects** (`_postgre` / `_oracle` / `_sqlserver`) are written with dialect-specific types and syntax
- [ ] **No `DROP` / `CREATE` without an existence check is placed at the top** (if the first statement fails, the entire rest of the same file is skipped and the run is treated as a "success" with the table never created -> [database-sql.md](database-sql.md#importer-sql-execution-behavior-important))
- [ ] **Re-running does not fail when the table already exists** ([database-sql.md](database-sql.md#re-import-when-the-table-already-exists))
  - [ ] PostgreSQL: `CREATE TABLE IF NOT EXISTS`
  - [ ] SQL Server: `IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = '<table>') CREATE TABLE ...`
  - [ ] Oracle 23ai or later: `CREATE TABLE IF NOT EXISTS`
  - [ ] **Below Oracle 23ai**: an existence check (PL/SQL) cannot be used because it breaks when the file is split. Use a plain `CREATE TABLE` only (without mixing in `DROP`), or create the table in an extended import ([database-sql.md](database-sql.md#existence-checks-cannot-be-written-below-oracle-23ai))
- [ ] When choosing the `DROP` -> `CREATE` approach, `DROP TABLE IF EXISTS` (PostgreSQL / SQL Server) is used, and you have confirmed that **losing the data created during trial use** is acceptable. **Do not use it below Oracle 23ai**

## DML

- [ ] The actual data has been added to the INSERT statement skeleton
- [ ] **Comment lines have been removed**
- [ ] Each SQL statement ends with a semicolon `;`
- [ ] It is **idempotent** (`WHERE NOT EXISTS`, `DELETE` before `INSERT`, etc.)
- [ ] No business transaction data is included (master data only)
- [ ] When `dmlPerDialect: false`, the INSERTs stay within the range of standard SQL

## Portlet Registration (when `portletImport` is specified)

- [ ] `<key>-dml.sql` contains DELETEs + INSERTs into `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info`
- [ ] **No comment lines are mixed into the portlet DML** (when `spec.database` is used together, delete the skeleton comments for your own tables. `SQLFileImporter` splits statements mechanically at `;`, so a `;` inside a comment or a trailing comment causes a runtime error)
- [ ] `portletCd` **does not duplicate a portlet already registered on the Tenant Setup side** (the full refresh would overwrite it)
- [ ] `path` points to an existing JSSP presentation page (a path relative to `src/main/jssp/src/`, without the extension)
- [ ] **No routing configuration or routing authorization has been created** for the portlet page (it is called directly by the portal, so they are unnecessary)
- [ ] The `editable` setting matches your intent (`false`: view only / `true`: view and edit), and the corresponding `im-portal-portlet` / `im-portal-portlet-editmode` policies are output to `<key>-authz-policy.xml`
- [ ] **You have confirmed that two consecutive runs do not fail** (the DELETE -> INSERT full refresh)
- [ ] You understand that placement on the portal (`b_m_portlet_layout`) is out of scope. For trial use, place it manually from the portal admin screen

## Extended Import JS

- [ ] The initialization process inside `doImport(tenantId)` is wrapped in a try/catch
- [ ] Start / completion / exception logs are emitted via Logger
- [ ] It complies with `.agents/requirements/jssp-code-style/AGENTS.md` (declare variables with `let`, do not use `var`, use single quotes for strings)
- [ ] If there is Tenant Database access, it is controlled with `Transaction.begin` and `isSuccess()` is checked
- [ ] It is **idempotent** (the full refresh approach is recommended)

## Job Scheduler

- [ ] When a trigger is attached, `enable: false` is set so that the sample job does not start on its own

## IM-Workflow Import (when `workflowImport` is specified)

- [ ] The user requested it **explicitly** (it was not added based on inference)
- [ ] **The behavior on the second run has been verified** (it runs every time — whether it is treated as an update, or whether errors are acceptable)
- [ ] The `<key>.workflow_import` logger outputs "workflow import completed."
- [ ] No temporary files such as `storage/public/tmp/<key>_*_*.xml` remain after execution
- [ ] See [workflow-import.md](workflow-import.md) for details

## IM-LogicDesigner Import (when `logicImport` is specified)

- [ ] The user requested it **explicitly** (it was not added based on inference)
- [ ] The generated JS uses `importer.importData(inputStream, true)` (**with overwrite**)
- [ ] When routing definitions (`flow_route.json`) are included, **the corresponding authz policies are not written on the Sample Data Setup side** (load them on the Tenant Setup side)
- [ ] The `<key>.logic_import` logger outputs "logic import completed."
- [ ] See [logic-import.md](logic-import.md) for details

## IMW Logic Flow Plugin Registration

- [ ] The `<extends-import-class>` entries are in the **following order** (the build script generates them in reverse order, so **reorder them manually after generation**. Order cannot be controlled by splitting configs):
  1. `<key>_logic_import.js`
  2. `<key>_workflow_import.js`
  3. `<key>_import.js`
- [ ] The full refresh approach (`deleteLogicFlow` -> `createLogicFlow`) is used
- [ ] The target flow appears in the IM-Workflow admin screen under "Logic Flow List"

## Operational Verification (in the tenant environment)

- [ ] Tenant Setup has been run first and completed normally (the tables and mandatory master data for the module itself are in place)
- [ ] Sample Data Setup has been run and confirmed to complete without errors
- [ ] The tables with `ddl: true` are created and the sample data is loaded
- [ ] The loaded sample data can be viewed from the screens
- [ ] **Two consecutive runs have been performed and the second one also completed without errors** (proof of idempotency — the most important item)
  - [ ] `CREATE TABLE` does not fail on the second run
  - [ ] The INSERTs do not violate a unique constraint on the second run
  - [ ] Unless the `DROP` -> `CREATE` approach is used, the data loaded on the first run still remains after the second run
- [ ] The setup log has been checked to confirm that no exception was swallowed (**processing continues even after an exception, so the completion message alone does not tell you whether it succeeded**)

## When Updating Materials

- [ ] Existing materials are updated by **overwriting with `--force`** (do not add version directories)
- [ ] The updated materials are consistent with the module's latest version (sample data is always kept up to date)
- [ ] When materials have been deleted, both the reference line in `import-<artifactId>-config.xml` and the actual file are removed (the build script does not delete obsolete files automatically)
