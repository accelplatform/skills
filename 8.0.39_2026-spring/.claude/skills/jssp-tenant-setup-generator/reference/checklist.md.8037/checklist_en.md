# Self-Check Checklist After Setup Asset Generation

After running build-setup-import.js, verify the following items.

## File Structure

- [ ] `src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-<N>.xml` has been output (the directory name and the file name both use the same `<artifactId>`. Resolution priority for `<artifactId>`: `"artifactId"` in spec.json → `<artifactId>` in pom.xml → the last dot-separated segment of `<id>` in module.xml → `<key>` fallback)
- [ ] Each XML / SQL file is output under `src/main/storage/system/products/import/basic/<key>/<version>/`
- [ ] When extended import is specified, `src/main/jssp/src/<key>/initialize/<version>/<key>_import.js` is generated
- [ ] When `workflowImport.files` is specified, the original XML is copied to `storage/system/products/import/basic/<key>/<version>/<file>.xml`
- [ ] When `workflowImport.files` is specified, `src/main/jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` is generated
- [ ] When `logicImport.files` is specified, the original ZIP is copied to `storage/system/products/import/basic/<key>/<version>/<file>.zip`
- [ ] When `logicImport.files` is specified, `src/main/jssp/src/<key>/initialize/<version>/<key>_logic_import.js` is generated
- [ ] `<version>` (asset version, e.g. `1.0.0`) matches the value specified in `spec.version` (defaults to `1.0.0` when omitted)
- [ ] `<N>` (config number, e.g. `2`) matches the value specified in `spec.configNumber` (defaults to `1` when omitted)
- [ ] When `<N> >= 2`, each file name has a `-<N>` suffix appended to the end of its base part (e.g. `<key>-authz-policy-2.xml`, `<key>-role-2_ja.xml`, `<key>-ddl-2_postgre.sql`, `<key>_import-2.js`). It must be inserted **immediately before** the locale / DB dialect suffix
- [ ] All XML files are encoded in UTF-8 (without BOM)

## Multilingual Files

- [ ] For each of role / authz-resource / authz-resource-group / authz-subject-group / menu-group / job-scheduler, all **4 files (base + 3 locales: ja / en / zh_CN)** are present
- [ ] The ID / URI / sort-key + expression of locale-specific files match the base (check for typos and case sensitivity)
- [ ] No display names contain empty strings or `null`

## Reference Integrity

- [ ] All files referenced by `<*-file>` elements in `import-<artifactId>-config-1.xml` exist (the path must include the version directory `<version>/`)
- [ ] The JS files referenced by `<extends-import-class>` exist (including the `.js` extension and the version directory)
- [ ] The `resource` attribute in `authz-policy.xml` is defined on the `authz-resource.xml` side (unless it is a hash value)
- [ ] The role IDs referenced in `subject` expressions of `authz-policy.xml` exist in `<key>-role.xml`
- [ ] The `<parent-group>` of `authz-resource.xml` exists in `authz-resource-group.xml` or in an intra-mart standard group
- [ ] The `<expression>` expressions in `authz-subject-group.xml` reference role IDs from `<key>-role.xml`
- [ ] Every URI specified via `<authz uri="service://..." action="execute" />` in routing (`file-mapping` of `routing-jssp-config`) or OAuth (`client-resource` of `oauth-client-resources-config`) is registered in the `uri` of `authz-resource.xml`. Since `welcome-all` is not used, every screen/API needs a corresponding authorization resource
- [ ] The tenant administrator (`tenant_manager`) is auto-granted PERMIT on every service resource and every menu group by `build-setup-import.js` (no need to list it in `authzPolicies`). **The other target roles/users** are listed in `authzPolicies` as instructed by the design document or prompt

## Job Scheduler

- [ ] The `<category-id>` of `<job-detail>` matches the ID of `<job-category>`
- [ ] The `<category-id>` of `<jobnet>` matches the ID of `<jobnet-category>`
- [ ] The `<job-id>` in `<serialize>` matches the ID of `<job-detail>`
- [ ] The Java class / JSSP specified by `<job-path>` exists (and is loadable at import time)

## Menu Group

- [ ] In `authz-policy.xml`, the `resource` attribute for `type="im-menu-group"` is set to a correct hash value (no `REPLACE_WITH_MENU_GROUP_HASH` placeholder remains)
  - The build script automatically computes `SHA-256("im-menu-group://menugroups/<id>")` from `spec.menuGroups[].id`
  - Verify any remaining placeholders in the generated XML with `grep "REPLACE_WITH" authz-policy.xml`
- [ ] When menu items are added, `<menu-items>` is manually appended inside `<menu-group>`

## DDL / DML

- [ ] The actual table definitions have been added to the CREATE TABLE skeleton (the comment-only skeleton will not work)
- [ ] Idempotency of DDL is considered (handling of double execution against the same tenant)
- [ ] No business data is included in DML (only master data)

## Extended Import JS

- [ ] The initialization process inside `doImport(tenantId)` is wrapped in a try/catch
- [ ] Start / completion / exception logs are emitted via Logger
- [ ] Only `var` is used (no `let` / `const` / arrow functions)
- [ ] If Tenant Database access is performed, exceptions are re-thrown so that the entire Importer fails on error

## IM-Workflow Import (when `workflowImport` is specified)

- [ ] The original WF XML is encoded in **UTF-16** (`<?xml version="1.0" encoding="UTF-16"?>`)
- [ ] The sections directly under `<data>` in the WF XML (`<contents>` / `<route>` / `<flow>` / `<matter_property>` / `<rule>`) are written with **2-space indentation** (a prerequisite of `extractTopLevelSections`). Even when a tag such as `<rule>` repeats multiple times, `extractTopLevelSections` returns every block as an array, so no special handling is needed
- [ ] `import-<artifactId>-config-<N>.xml` includes an `<extends-import-class>` line pointing to `<key>_workflow_import.js` inside `<extends-import>` (two parallel lines when combined with `extendsImport`)
- [ ] The target environment is **8.0.37 (2025 Spring) or later** (a requirement of `DataImportExecutor` / `SystemStorage` / `TenantInfoManager`)
- [ ] After running tenant environment setup, the `<key>.workflow_import` logger outputs "workflow import completed."
- [ ] No temporary files such as `storage/public/tmp/<key>_*_*.xml` remain after execution (they are deleted in `finally` by design, but may remain if the Importer terminates abnormally)
- [ ] See the checkpoints in [workflow-import.md](workflow-import.md) for details

## IM-LogicDesigner Import (when `logicImport` is specified)

- [ ] The original ZIP is in **IM-LogicDesigner export format** (same format exported from the admin screen)
- [ ] `import-<artifactId>-config-<N>.xml` includes an `<extends-import-class>` line pointing to `<key>_logic_import.js` inside `<extends-import>` (parallel to other extended imports)
- [ ] The target environment is **8.0.37 (2025 Spring) or later** (required by `SystemStorage.getCanonicalPath()`. `LogicFlowImporter` itself works on 8.0.0 or later)
- [ ] After running tenant environment setup, the `<key>.logic_import` logger outputs "logic import completed."
- [ ] You are aware that the extended import JS **uses direct Java access (`Packages.***`)** (allowed as an exception because IM-LogicDesigner has no general-purpose SSJS API)
- [ ] When routing definitions (`flow_route.json`) are included, the corresponding authorization policies are separated into a **different configNumber** (writing them with `authzPolicies` in the same config causes the policies to be applied while the resources are not yet registered, and they will be silently ignored)
- [ ] The `type` of routing policies is `im-logic-rest` (not `service`), and `resource` is the SHA-256 (lowercase hex) of the `authzUri` string
- [ ] See [logic-import.md](logic-import.md) for details

## IM-Workflow Logic Flow Plugin Registration (when `extendsImport` + WF/LD integration is combined)

- [ ] The `<extends-import-class>` entries in `<extends-import>` inside `import-<artifactId>-config-<N>.xml` are in the following **order** (the build script generates them in reverse order, so **manually reorder them after generation**):
  1. `<key>_logic_import.js` — Import the IM-LogicDesigner flow ZIP (first)
  2. `<key>_workflow_import.js` — Import the IM-Workflow definition XML (second)
  3. `<key>_import.js` — Register the LD flow as an IM-Workflow processing-target plugin (last)
- [ ] `<key>_import.js` contains a call to `WorkflowLogicFlowManager.createLogicFlow()`
- [ ] The `logicFlowId` in the `IMW_LOGIC_FLOW_PLUGINS` array matches the flow ID registered in IM-LogicDesigner
- [ ] The `resourceTypes` to be registered match the requirements (`authority_process` / `authority_confirm` / `authority_matter_handle`)
- [ ] After running tenant environment setup, the target flow appears in the IM-Workflow admin screen under "Logic Flow List"

## Operational Verification (in the tenant environment)

- [ ] Verify that `import-<artifactId>-config-<N>.xml` can be imported from tenant environment setup and completes without errors

## Additional Checks for Version Upgrades (when configNumber >= 2)

- [ ] **No changes have been made** to existing `import-<artifactId>-config-1.xml` through `config-(N-1).xml`
- [ ] **No changes have been made** to existing files (`<key>-*.xml` without the suffix, etc.)
- [ ] The new spec.json contains **only the differences** (do not include existing role / existing resource IDs etc.)
- [ ] All `<*-file>` references in the new config-N.xml point to the intended paths:
  - **When the version itself is bumped** (e.g. `1.1.0`, modifying `spec.version`): reference suffix-less files under the new version directory (e.g. `1.1.0/`)
  - **When only the config number is bumped within the same version** (`spec.version` kept): reference `-<N>` suffixed files under the same `<version>/`
- [ ] When ALTERing existing tables via DDL, write dialect-specific syntax in all three dialect-specific files (`_postgre` / `_oracle` / `_sqlserver`)
- [ ] Verify in the tenant environment that **re-running from `config-1.xml` in numerical order** completes without errors (intra-mart Importer executes all configs in numerical order)
