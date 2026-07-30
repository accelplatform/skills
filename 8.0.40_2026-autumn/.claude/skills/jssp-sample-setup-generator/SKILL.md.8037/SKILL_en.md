---
name: jssp-sample-setup-generator
description: Generates a full set of materials for intra-mart Accel Platform Sample Data Setup (Importer). Generates Importer-format config XML, roles, authz (policies / resources / resource groups / subject groups), menu groups, Job Scheduler, extends import JS, DDL/DML SQL skeletons, portlet registration DML (generates DML against the b_m_portlet_* tables to register a JSSP presentation page as a portal portlet), IM-Workflow import integration (copies WF definition XML from storage/public to storage/system and generates an extends import JS that loads it via DataImportExecutor), and IM-LogicDesigner import integration (copies logic flow ZIPs from storage/public to storage/system and generates an extends import JS that loads them via LogicFlowImporter), expanded to multiple locales (ja/en/zh_CN) in one shot from spec.json. Use when mentioning "create sample data setup materials", "create materials for loading sample data", "create sample data for a trial environment", "create import-%short module ID%-config.xml", "generate DML to register a sample portlet", "I want to load IM-Workflow via sample data setup", or "I want to load IM-LogicDesigner logic flows via sample data setup". For Tenant Setup (building the prerequisites that modules need to run), use jssp-tenant-setup-generator.
allowed-tools: Bash, Read, Write, Glob
---

# Sample Data Setup Material Generation Skill

## Purpose

A skill for generating the full set of files required for intra-mart Accel Platform **Sample Data Setup** (Importer) from scratch, driven by prompt instructions.
The generated materials can be loaded from Tenant Environment Management (Sample Data Setup).

Sample Data Setup is the process that **loads sample data so that each deployed module can be tried out**. It is not performed in production environments.

## Relationship to jssp-tenant-setup-generator

The schema (`import-data-config.xsd`) and the materials that can be loaded are identical to Tenant Setup. **Refer to `jssp-tenant-setup-generator` for the specification and implementation template of each XML.**

| Content | Reference |
|---|---|
| Role definition XML | `.claude/skills/jssp-tenant-setup-generator/reference/role.md` |
| Authz policy XML | `.claude/skills/jssp-tenant-setup-generator/reference/authz-policy.md` |
| Authz resource / resource group XML | `.claude/skills/jssp-tenant-setup-generator/reference/authz-resource.md` |
| Authz subject group XML | `.claude/skills/jssp-tenant-setup-generator/reference/authz-subject-group.md` |
| Menu group XML | `.claude/skills/jssp-tenant-setup-generator/reference/menu-group.md` |
| Job Scheduler XML | `.claude/skills/jssp-tenant-setup-generator/reference/job-scheduler.md` |
| DDL type mapping | `.claude/skills/jssp-tenant-setup-generator/reference/database-sql.md` |

**Substitutions to apply when reading those references:**

| Description on the tenant side | Substitution in this skill |
|---|---|
| `conf/products/import/basic/%short module ID%/` | `conf/products/import/sample/` (no short module ID directory) |
| `import-%short module ID%-config-%schema version%.xml` | `import-%short module ID%-config.xml` |
| `products/import/basic/<key>/<version>/` | `products/import/sample/<key>/` (no `<version>` directory) |
| `<key>/initialize/<version>/<key>_import.js` | `<key>/initialize/<key>_import.js` |
| `configNumber` / `-<N>` suffix / multiple config operations | Does not exist |
| `build-setup-import.js` | `build-sample-setup-import.js` |

## Main Differences from Tenant Setup

Every difference stems from two facts: setup runs every time, and there is only one config file. For the specification of each material, see `jssp-tenant-setup-generator` as listed above.

| Aspect | Sample Data Setup (this skill) |
|---|---|
| Schema version management / multiple configs (`configNumber`) | **Out of scope**. At most one config file per module (`spec.version` / `spec.configNumber` cannot be specified — the build script stops with an error) |
| Re-execution | **All modules run every time** -> DDL, DML, and extends import must be idempotent (a plain `CREATE TABLE` / `INSERT` fails on the second run. [reference/database-sql.md](reference/database-sql.md)) |
| When an exception occurs | **Subsequent processing continues** -> `Logger` output is mandatory. A completion message alone does not tell you whether it succeeded |
| Execution order control | Configs cannot be split. Only the order of the entries inside `<extends-import>` |
| DDL | **Only tables exclusive to Sample Data Setup** (`tables[].ddl: true`) |

## Generation Targets

| Category | Output File | Multilingual |
|---------|-------------|--------------|
| Import config | `import-<artifactId>-config.xml` | - |
| Database | `<key>-ddl.sql` / `<key>-dml.sql` | - |
| Portlet registration | `<key>-dml.sql` (real DELETEs + INSERTs into `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info`) | - |
| Role | `<key>-role.xml` | ja / en / zh_CN |
| Authz resource group | `<key>-authz-resource-group.xml` | ja / en / zh_CN |
| Authz resource | `<key>-authz-resource.xml` | ja / en / zh_CN |
| Authz subject group | `<key>-authz-subject-group.xml` | ja / en / zh_CN |
| Authz policy | `<key>-authz-policy.xml` | - |
| Menu group | `<key>-menu-group.xml` | ja / en / zh_CN |
| Job Scheduler | `<key>-job-scheduler.xml` | ja / en / zh_CN |
| Extends import JS | `<key>/initialize/<key>_import.js` | - |
| IM-Workflow import JS | `<key>/initialize/<key>_workflow_import.js` | - |
| IM-Workflow import XML | Copied under `storage/system` | - |
| IM-LogicDesigner import JS | `<key>/initialize/<key>_logic_import.js` | - |
| IM-LogicDesigner import ZIP | Copied under `storage/system` | - |
| IMW logic flow plugin registration JS | `<key>/initialize/<key>_import.js` (uses `WorkflowLogicFlowManager` in `doImport`) | - |

## File Layout

```
jssp-sample-setup-generator/
├── SKILL.md                        # This file
├── scripts/
│   └── build-sample-setup-import.js # spec.json -> generates each XML/JS/SQL in one shot
├── reference/
│   ├── import-config.md            # Structure of import-<artifactId>-config.xml
│   ├── database-sql.md             # DDL/DML skeleton spec, existence checks on re-import
│   ├── extends-import.md           # Extends import class (doImport) spec
│   ├── portlet-import.md           # Portlet registration (portletImport) spec
│   ├── workflow-import.md          # IM-Workflow import (workflowImport) spec
│   ├── logic-import.md             # IM-LogicDesigner import (logicImport) spec
│   ├── imw-logic-plugin-import.md  # IMW logic flow plugin registration spec
│   └── checklist.md                # Post-generation self-check list
└── examples/
    └── any_app.spec.json           # Sample spec representing a fictitious app "any_app"
```

## Output Locations

The build script splits its output across the following locations.

| Type | Output Location |
|------|--------|
| `import-<artifactId>-config.xml` | `src/main/conf/products/import/sample/` |
| Various XML / SQL | `src/main/storage/system/products/import/sample/<key>/` |
| Extends import JS | `src/main/jssp/src/<key>/initialize/<key>_import.js` |
| IM-Workflow import JS | `src/main/jssp/src/<key>/initialize/<key>_workflow_import.js` |
| IM-Workflow import XML (copied) | `src/main/storage/system/products/import/sample/<key>/<file>.xml` |
| IM-LogicDesigner import JS | `src/main/jssp/src/<key>/initialize/<key>_logic_import.js` |
| IM-LogicDesigner import ZIP (copied) | `src/main/storage/system/products/import/sample/<key>/<file>.zip` |

`<artifactId>` is used **only in the setup config file name** (never in the directory name). Resolution order:

1. The **`"artifactId"` field in spec.json**
2. The `<artifactId>` in **`pom.xml`** at the project root (the one inside `<parent>` is excluded)
3. The **last dot-separated segment of `<id>`** in **`module.xml`** (or `src/main/jssp/module.xml`) (e.g. `mypackage.hoge` -> `hoge`)
4. **spec.key (fallback)**

`<artifactId>` may differ from `<key>`. Reference paths under storage use `<key>`.

The `<role-file>`, `<authz-*-file>`, `<create-file>`, and `<insert-file>` entries in the config are written
as paths relative to `src/main/storage/system` (e.g. `products/import/sample/<key>/<key>-role.xml`).
`<extends-import-class>` is written as a path relative to `src/main/jssp/src` (e.g. `<key>/initialize/<key>_import.js`).

No `<version>` directory is used when placing materials. Sample data is always kept in sync with the module's latest version, so you update it by overwriting the existing files (`--force`).

### Division of Responsibility for DDL

DDL covers only **tables that are used by Sample Data Setup alone**. Only tables that specify `spec.database.tables[].ddl: true` are generated.

| Nature of the table | Where to create the DDL |
|---|---|
| Required for the module to run | Tenant Setup (`src/main/storage/system/products/import/basic/<key>/<version>/`) |
| Exclusive to Sample Data Setup | **Sample Data Setup (`src/main/storage/system/products/import/sample/<key>/`)** |

If you only INSERT into an existing table (already created by Tenant Setup), do not specify `ddl`. Such a table appears only in the DML skeleton.

### `storage/system` vs `storage/public`

| Location | Typical contents | Loading path |
|--------|----------|---------|
| `src/main/storage/system/products/import/sample/<key>/` | DDL / DML, role XML, authz XML, menu XML, job scheduler XML | **Loaded only by Sample Data Setup (Importer)**. Cannot be loaded individually from the import screen |
| `src/main/storage/public/im_workflow/` | IM-Workflow import XML | **Can be loaded manually by the user from the import screen** (when this skill is in use, the file is copied from here into storage/system and loaded automatically) |
| `src/main/storage/public/im_logic/` | IM-LogicDesigner import ZIP | Same as above |

## Default Policy: Extends Import (IM-Workflow / IM-LogicDesigner) is OFF

The `workflowImport` / `logicImport` sections in spec.json must be added **only when the user explicitly requests IM-Workflow / IM-LogicDesigner import in the prompt**.

- **Explicit request examples**: requests that contain any of the words IM-Workflow, IM-LogicDesigner, `workflowImport`, or `logicImport` — for example, "I want to load IM-Workflow via sample data setup", "I want to load the IM-LogicDesigner logic flow via sample data setup", or "Include `workflowImport`".
- **Do NOT add implicitly / by inference**: for generic requests like "Create sample data setup materials", **do not add `workflowImport` / `logicImport` to spec.json even if files exist under `storage/public/im_workflow/` or `storage/public/im_logic/`**.
- **Do not ask about it**: it is forbidden for the AI to proactively ask "Do you have workflow / LogicDesigner imports?" Confirm details only after the user mentions them first.

## When to Use

When the user makes requests such as:

- "Create sample data setup materials"
- "Generate a full set of materials for loading sample data"
- "Create sample data for a trial environment"
- "Create `import-%short module ID%-config.xml`"
- "I want to register a JSSP screen as a sample portlet" (when including `portletImport`)
- "I want to load an IM-Workflow import via sample data setup" (when WF definition XML exists under `storage/public/im_workflow/`) ★ only when explicitly requested
- "I want to load an IM-LogicDesigner import via sample data setup" (when logic flow ZIPs exist under `storage/public/im_logic/`) ★ only when explicitly requested

For Tenant Setup (building the prerequisites that modules need to run), use `jssp-tenant-setup-generator`.

## Generation Procedure

### 1. Requirements Gathering

Confirm the following information from the user.

| Item | Required | Example |
|------|------|-----|
| Application key (English ID) | YES | `any_app`, `expense_app` |
| artifactId (short module ID) | NO | When omitted, auto-resolved in the order `pom.xml` `<artifactId>` -> last dot-segment of `module.xml` `<id>` -> `<key>` |
| Short name (for plugin ID) | YES | `app`, `exp` |
| Display name (Japanese / English / Chinese) | YES | `Any App` / `Any App` / `Any App` |
| Role configuration | YES | `app_manager` (administrator), etc. |
| Authz resource configuration (service URI) | YES | `service://any_app/maintenance/content` etc. |
| Authz policy (who can access what) | YES | tenant_manager / app_manager / authenticated etc. |
| Job Scheduler (optional) | NO | If there are periodic batches |
| Menu group (optional) | NO | If there is menu registration |
| DML tables (optional) | NO | Tables to load sample data into |
| DDL tables (optional) | NO | If there are tables used by Sample Data Setup alone. Specify `tables[].ddl: true` |
| Portlet definition (optional) | NO | When registering a JSSP screen in the portal as a portlet for trial use (`portlet_cd`, the page path to display, titles in 3 locales) |
| Extends import processing (optional) | NO | If there is initialization processing in doImport(tenantId) |

> **Do not ask about `configNumber` / `version`**
> Sample Data Setup is out of scope for schema version management, and at most one config file is created per module. **Neither field can be specified in this skill** (the build script rejects them with an error).

### 2. Assemble spec.json

Assemble spec.json from the requirements gathering results. The coding agent only writes the spec; the build script automatically handles the 3-locale XML expansion and namespace assignment.

Sample: [examples/any_app.spec.json](examples/any_app.spec.json)

Every field in spec.json is identical to Tenant Setup. Use the mapping table above to find the corresponding reference. Only the following differences are specific to this skill.

```jsonc
{
  "key": "any_app",
  // "version" and "configNumber" cannot be specified (the build script stops with an error)
  "artifactId": "any-app",
  "shortName": "app",
  "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" },

  // roles / authzResourceGroups / authzResources / authzPolicies /
  // authzSubjectGroups / menuGroups / jobScheduler are identical to Tenant Setup

  "database": {
    "tables": [
      // ddl not specified = DML only (a table already created by Tenant Setup)
      { "name": "any_app_data", "comment": "サンプルデータ" },
      // ddl: true = table exclusive to Sample Data Setup. DDL is generated per dialect (3 files)
      { "name": "any_app_demo", "comment": "デモ用テーブル", "ddl": true }
    ],
    "dmlPerDialect": false                     // false (default): single DML / true: 3 dialect-specific
  },

  // Registers a JSSP screen in the portal as a portlet for trial use (optional).
  // Generates a DELETE -> INSERT full refresh into b_m_portlet_info /
  // b_m_portlet_mode / b_m_portlet_title_info, output to <key>-dml.sql.
  // This alone produces a DML file even without "database".
  // See reference/portlet-import.md for details
  "portletImport": {
    "portlets": [
      {
        "portletCd": "any_app_summary",
        "path": "any_app/portlet/summary_view/index",
        "editable": false,
        "titles": {
          "name": { "ja": "Any App サマリ", "en": "Any App Summary", "zh_CN": "Any App 摘要" },
          "application": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" },
          "description": { "ja": "Any App の概要を表示します。", "en": "Displays an overview of Any App.", "zh_CN": "显示 Any App 的概览。" }
        }
      }
    ]
  },

  "extendsImport": true,
  "workflowImport": { "files": ["im_workflow-simple_approval-import.xml"] },
  "logicImport": { "files": ["im-logicdesigner-data-sample-simple.zip"] }
}
```

| Reference file | Content |
|------------------|------|
| [reference/import-config.md](reference/import-config.md) | Structure and reference rules of `import-<artifactId>-config.xml` |
| [reference/database-sql.md](reference/database-sql.md) | DDL/DML skeleton format, **existence checks on re-import** |
| [reference/extends-import.md](reference/extends-import.md) | Implementation conventions for `doImport(tenantId)` |
| [reference/portlet-import.md](reference/portlet-import.md) | Portlet registration (`portletImport.portlets`, DML generation into `b_m_portlet_*`, idempotent full refresh, out-of-scope items) |
| [reference/workflow-import.md](reference/workflow-import.md) | IM-Workflow import mechanism |
| [reference/logic-import.md](reference/logic-import.md) | IM-LogicDesigner import mechanism |
| [reference/imw-logic-plugin-import.md](reference/imw-logic-plugin-import.md) | IMW logic flow plugin registration spec |
| [reference/checklist.md](reference/checklist.md) | Post-generation self-check |

### 3. Run build-sample-setup-import.js

```bash
node .claude/skills/jssp-sample-setup-generator/scripts/build-sample-setup-import.js \
     <path to spec.json>
```

When `--out` is omitted, the output destination is the default path documented in SKILL.md.

What build-sample-setup-import.js does automatically:

- Automatic expansion to 3 locales (en / ja / zh_CN) for each XML
- Automatic insertion of namespaces (`xmlns`)
- Reference integrity checks for role IDs / authz resource IDs (warns about IDs not referenced inside the spec)
- Stops with an error when it detects `spec.version` / `spec.configNumber`
- Warns when an authz policy with `type="im-logic-rest"` exists (see [reference/logic-import.md](reference/logic-import.md))
- Generation of DDL (only for `tables[].ddl: true`, per dialect) / DML skeleton SQL
- Generation of real DELETE + INSERT statements into `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info` from `portletImport.portlets` (not a comment-only skeleton — DML ready to load into Sample Data Setup as-is. To withstand running every time, it is output as a DELETE -> INSERT full refresh, with no SQL comments)
- Generation of an extends import JS skeleton (outputs `doImport(tenantId)` as an empty function)
- Copying IM-Workflow import XMLs (`storage/public/im_workflow/` -> `storage/system/products/import/sample/<key>/`) and generating a dedicated JS (`<key>_workflow_import.js`)
- Copying IM-LogicDesigner import ZIPs (`storage/public/im_logic/` -> `storage/system/products/import/sample/<key>/`) and generating a dedicated JS (`<key>_logic_import.js`) (via `Packages.jp.co.intra_mart.foundation.logic.LogicServiceProvider`)
- Automatic assembly of `import-<artifactId>-config.xml` (references only the actually existing output files; lists multiple `<extends-import-class>` entries inside `<extends-import>`)

The script stops with an error when an output file already exists. Specify `--force` to update the materials.

### 4. Self-Check

After generation, verify against the self-check list in [reference/checklist.md](reference/checklist.md).

## Notes

- This skill is **dedicated to generating a full set of sample data materials for new apps**. It is not suited for appending to existing materials (such as adding entries to authz-policy) — manual editing is recommended for that.
- **Do not redefine roles, authz, menus, jobs, or portlets that are already defined on the Tenant Setup side** (they would be loaded twice; for portlets, the full refresh overwrites what the tenant side registered).
- The `subject` expression in authz policies (e.g. `S(b_m_role:...)`) is **not content-validated by the build script**. Always check the format in `.claude/skills/jssp-tenant-setup-generator/reference/authz-policy.md`.
- The body of the extends import JS (`doImport(tenantId)`) is an empty skeleton. Users add the implementation contents individually. See [reference/extends-import.md](reference/extends-import.md) for the implementation conventions.

## Scope Boundaries

| Skill | Purpose |
|--------|------|
| **jssp-sample-setup-generator** (this skill) | Generates a full set of sample data setup materials (Importer format) |
| jssp-tenant-setup-generator | Generates a full set of tenant setup materials (builds the prerequisites that modules need to run) |
| jssp-im-workflow-generator | Generates IM-Workflow workflow definition XML |
| jssp-im-logic-generator | Generates IM-LogicDesigner flow definition JSON |
| jssp-page-generator | Generates screens and function containers |
| jssp-im-job-generator | Implements the body of job programs (batch processing) |

**Scope boundary for Job Scheduler:**
This skill only generates `<key>-job-scheduler.xml` (job / jobnet definition XML).
The **job implementation body** (Java classes under `jp.co...` or `.js` job programs) is the job of `jssp-im-job-generator`.
