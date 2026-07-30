---
name: jssp-tenant-setup-generator
description: Generates a full set of materials for intra-mart Accel Platform Tenant Setup (Importer). Generates Importer-format config XML, roles, authz (policies / resources / resource groups / subject groups), menu groups, Job Scheduler, extends import JS, DDL/DML SQL skeletons, portlet registration DML (generates DML against the b_m_portlet_* tables to register a JSSP presentation page as a portal portlet), IM-Workflow import integration (copies WF definition XML from storage/public to storage/system and generates an extends import JS that loads it via DataImportExecutor), and IM-LogicDesigner import integration (copies logic flow ZIPs from storage/public to storage/system and generates an extends import JS that loads them via LogicFlowImporter), expanded to multiple locales (ja/en/zh_CN) in one shot from spec.json. Use when mentioning "create tenant initial setup materials", "create Importer import materials", "create XML for initial data import", "create setup XML", "generate DML to register a portlet", "include a portal portlet in tenant setup", "I want to load IM-Workflow via tenant setup", "integrate workflow definition import into setup", or "I want to load IM-LogicDesigner logic flows via tenant setup".
allowed-tools: Bash, Read, Write, Glob
---

# Tenant Setup Material Generation Skill

## Purpose

A skill for generating the full set of files required for an intra-mart Accel Platform **Importer** (tenant setup materials) from scratch, driven by prompt instructions.
The generated materials can be loaded from Tenant Environment Management (Tenant Setup).

## Generation Targets

| Category | Output File | Multilingual |
|---------|-------------|--------------|
| Import config | `import-<artifactId>-config-1.xml` | - |
| Database | `<key>-ddl.sql` / `<key>-dml.sql` | - |
| Portlet registration | `<key>_sample-dml.sql` (real INSERTs into `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info`) | - |
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
| IMW Logic Flow Plugin registration JS | `<key>/initialize/<key>_import.js` (uses `WorkflowLogicFlowManager` inside `doImport`) | - |

## File Layout

```
jssp-tenant-setup-generator/
├── SKILL.md                       # This file
├── scripts/
│   └── build-setup-import.js      # spec.json -> generates each XML/JS/SQL in one shot
├── reference/
│   ├── import-config.md           # Structure of import-<artifactId>-config-1.xml
│   ├── role.md                    # Role definition XML spec
│   ├── authz-policy.md            # Authz policy XML spec
│   ├── authz-resource.md          # Authz resource / resource group XML spec
│   ├── authz-subject-group.md     # Authz subject group XML spec
│   ├── menu-group.md              # Menu group XML spec
│   ├── job-scheduler.md           # Job Scheduler XML spec
│   ├── extends-import.md          # Extends import class (doImport) spec
│   ├── workflow-import.md         # IM-Workflow import (workflowImport) spec
│   ├── logic-import.md            # IM-LogicDesigner import (logicImport) spec
│   ├── imw-logic-plugin-import.md # IMW Logic Flow Plugin registration (doImport + WorkflowLogicFlowManager) spec
│   ├── multi-config.md            # Multiple config operations (version upgrade / same-version config addition)
│   ├── database-sql.md            # DDL/DML skeleton spec
│   └── checklist.md               # Post-generation self-check list
└── examples/
    └── any_app.spec.json          # Sample spec representing a fictitious app "any_app"
```

## Output Locations

The build script writes output to the following two locations.

| Type | Output Location |
|------|-----------------|
| `import-<artifactId>-config-<N>.xml` | `src/main/conf/products/import/basic/<artifactId>/` |
| Various XML / SQL | `src/main/storage/system/products/import/basic/<key>/<version>/` |
| Extends import JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_import.js` |
| IM-Workflow import JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_workflow_import.js` |
| IM-Workflow import XML (copied) | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.xml` |
| IM-LogicDesigner import JS | `src/main/jssp/src/<key>/initialize/<version>/<key>_logic_import.js` |
| IM-LogicDesigner import ZIP (copied) | `src/main/storage/system/products/import/basic/<key>/<version>/<file>.zip` |

`<version>` is determined in the following order of priority:

1. The **`"version"` field in spec.json** if specified
2. The `<version>` tag value from **`module.xml`** at the project root (or `src/main/jssp/module.xml`)
3. The `<version>` tag value from **`pom.xml`** at the project root (the version inside `<parent>` is excluded)
4. **`1.0.0`** if none of the above is found

`<N>` is specified by the `"configNumber"` field in spec.json. **The AI must always ask the user for `configNumber` during the requirements-gathering step** (do not auto-infer — see the note under "### 1. Requirements Gathering"). For operations involving multiple configs, see "Multiple Config Operations" below.

When `<N> >= 2`, a `-<N>` suffix is appended to the base file name of each XML / SQL / JS (e.g. `equip-authz-policy-2.xml`, `equip_import-2.js`). This is for avoiding collisions when multiple configs coexist under the same `<version>`, used in operations that control import order within the same version (e.g. controlling execution order between LogicDesigner routing and authz policies). For details on where the suffix is inserted and the use cases, see [reference/import-config.md](reference/import-config.md#file-name-suffix-when-confignumber--1) and [reference/logic-import.md](reference/logic-import.md#injection-order-of-authz-policies-for-routing).

`<artifactId>` is **both the directory name and the file name of the setup XML (`import-<artifactId>-config-<N>.xml`)**. By the intra-mart Tenant Setup specification, it must match the `<artifactId>` in the project's `pom.xml`. Resolution order:

1. The **`"artifactId"` field in spec.json** (explicit)
2. The `<artifactId>` in **`pom.xml`** at the project root (the one inside `<parent>` is excluded)
3. The **last dot-separated segment of `<id>`** in **`module.xml`** at the project root (or `src/main/jssp/module.xml`) (e.g. `mypackage.hoge` -> `hoge`)
4. **spec.key (fallback)** — used as a substitute if none of the above is found

`<artifactId>` may differ from `<key>` (e.g. `<key>="equip"`, `<artifactId>="equipment-lending-system"`). Internal reference paths (`<*-file>`) use `<key>`, and **only the Importer config XML directory name and file name (`import-<artifactId>-config-<N>.xml`)** use `<artifactId>`.

The `<role-file>`, `<authz-*-file>`, `<create-file>`, and `<insert-file>` entries in config-1.xml are written
as paths relative to `src/main/storage/system` (e.g. `products/import/basic/<key>/<version>/<key>-role.xml`).
`<extends-import-class>` is written as a path relative to `src/main/jssp/src` (e.g. `<key>/initialize/<version>/<key>_import.js`).

## Why DDL and Sample DML Belong Here

**SQL files that are loaded during tenant setup** — DDL such as `CREATE TABLE`, and **sample initial-data DML files (`<key>_sample-dml.sql`)** — must always be placed at the following path, regardless of whether you invoke this skill directly:

```
src/main/storage/system/products/import/basic/<key>/<version>/
```

**Why**: DDL and the sample initial DML are designed to be **bulk-loaded by the intra-mart tenant environment setup (Importer)**. End users cannot apply them one-by-one from the import screen, so they must live as tenant setup resources under `storage/system`. Other skills such as `jssp-page-generator` and `jssp-im-workflow-usage` that emit DDL or sample DML must also place them here.

### Out of Scope: Runtime SQL Called from Function Containers

Business SQL **executed at runtime** from function containers via `db.executeByTemplate` / `db.execute` (2WaySQL templates for SELECT / INSERT / UPDATE / DELETE, etc.) is out of scope of this section.
Those go under `src/main/jssp/src/{feature}/sql/` (see `.claude/rules/jssp-2way-sql.md`).

### `storage/system` vs `storage/public`

| Location | Typical contents | Loading path |
|---|---|---|
| `src/main/storage/system/products/import/basic/<key>/<version>/` | DDL / sample DML, role XML, authz XML, menu XML, job scheduler XML, extension import JS, etc. | **Loaded only by the tenant environment setup (Importer)**. Cannot be loaded individually from the import screen. |
| `src/main/storage/public/im_workflow/` | IM-Workflow import XML | **Can be loaded manually by the user from the import screen** (when this skill is in use, the file is copied from here into storage/system and loaded automatically). |
| `src/main/storage/public/im_logic/` | IM-LogicDesigner import ZIP | Same as above. |

In short: **resources the user can import manually live under `storage/public`**; **resources they cannot live under `storage/system`**. DDL and sample DML belong to the latter, so always place them under `storage/system`.

## Default Policy: Extension Import (IM-Workflow / IM-LogicDesigner) is OFF

The `workflowImport` / `logicImport` sections in spec.json must be added **only when the user explicitly requests IM-Workflow / IM-LogicDesigner import in the prompt**.

- **Explicit request examples**: requests that contain any of the words IM-Workflow, IM-LogicDesigner, `workflowImport`, or `logicImport` — for example, "I want to load IM-Workflow via tenant setup", "Include the workflow definition import in setup", "I want to load the IM-LogicDesigner logic flow via tenant setup", or "Include `workflowImport`".
- **Do NOT add implicitly / by inference**: for generic requests like "Create tenant initial setup materials" or "Create Importer materials", **do not add `workflowImport` / `logicImport` to spec.json even if files exist under `storage/public/im_workflow/` or `storage/public/im_logic/`**.
- **Do not ask about it**: it is forbidden for the AI to proactively ask "Do you have workflow / LogicDesigner imports?" Confirm details only after the user mentions them first.

## When to Use

When the user makes requests such as:

- "Create tenant initial setup materials"
- "Generate a full set of Importer import XMLs"
- "Create authz resource / role definitions for tenant setup"
- "Generate skeleton for initial data import"
- "I want to register a JSSP screen as a portlet in tenant setup" (when including `portletImport`)
- "I want to load IM-Workflow via tenant setup" (when WF definition XML exists under `storage/public/im_workflow/`) ★ only when explicitly requested
- "I want to load IM-LogicDesigner via tenant setup" (when logic flow ZIPs exist under `storage/public/im_logic/`) ★ only when explicitly requested
- "I want to register an IM-LogicDesigner flow as an IM-Workflow processing-target plugin" ★ only when explicitly requested
- "I want the LD flow auto-registered as a WF plugin" ★ only when explicitly requested

## Generation Procedure

### 1. Requirements Gathering

Confirm the following information from the user.

| Item | Required | Example |
|------|----------|---------|
| Application key (English ID) | YES | `any_app`, `expense_app` |
| Version number | NO | `1.0.0` (when omitted, auto-detected from `<version>` in `module.xml` / `pom.xml`; if none, `1.0.0`) |
| Config number (configNumber) | YES | `1` (initial setup) / `2`, `3`, ... (diff added to an already-imported tenant). **Always ask the user — never auto-infer** (the AI cannot tell from the project whether the artifacts are being re-applied to an existing tenant) |
| artifactId (directory name for setup XML) | NO | When omitted, auto-resolved in the order `pom.xml` `<artifactId>` -> last dot-segment of `module.xml` `<id>` -> `<key>` |
| Short name (for plugin ID) | YES | `app`, `exp` |
| Display name (Japanese / English / Chinese) | YES | `Any App` / `Any App` / `Any App` |
| Role configuration | YES | `app_manager` (administrator), etc. |
| Authz resource configuration (service URI) | YES | `service://any_app/maintenance/content` etc. |
| Authz policy (who can access what) | YES | tenant_manager / app_manager / authenticated etc. |
| Job Scheduler (optional) | NO | If there are periodic batches |
| Menu group (optional) | NO | If there is menu registration |
| DDL/DML tables (optional) | NO | If there are proprietary tables |
| Portlet definition (optional) | NO | When registering a JSSP screen as a portal portlet (`portlet_cd`, the page path to display, titles in 3 locales) |
| Extends import processing (optional) | NO | If there is initialization processing in doImport(tenantId) |

> **About asking for configNumber**
> `configNumber` is **not** auto-inferred from `<version>` changes in `module.xml` / `pom.xml` nor from the presence of existing files. Because choosing the right value is an operational decision — `1` for a brand-new app's initial setup, `2` or higher when adding a diff onto a tenant where the setup has already been imported — the AI must ask the user the following before assembling spec.json:
> - "Is this setup the initial release for a new app (configNumber=1), or a diff added on top of an already-imported tenant (configNumber=2 or higher)?"
> - When adding a diff, confirm the current maximum N and specify `N+1`.

### 2. Assemble spec.json

Assemble spec.json from the requirements gathering results. The coding agent only writes the spec; the build script automatically handles the 3-locale XML expansion and namespace assignment.

Sample: [examples/any_app.spec.json](examples/any_app.spec.json)

```jsonc
{
  "key": "any_app",
  "version": "1.0.0",                          // Version number. When omitted, auto-detected from <version> in module.xml / pom.xml; if none, "1.0.0"
  "configNumber": 1,                           // The N in import-<artifactId>-config-<N>.xml. Use 1 for an initial setup, 2/3/... when adding a diff to an already-imported tenant. The AI must confirm this with the user during requirements gathering — do not silently default to 1.
  "artifactId": "any-app",                     // Directory name for setup XML. When omitted, falls back in order: pom.xml <artifactId> -> last dot-segment of module.xml <id> -> "key"
  "shortName": "app",
  "displayNames": {
    "ja": "Any App",
    "en": "Any App",
    "zh_CN": "Any App"
  },

  // 1. Role definitions
  "roles": [
    {
      "id": "app_manager",                    // Role ID (short alphanumeric)
      "name": "any_app_manager",              // Role name (internal system name)
      "category": "any_app",                  // Role category
      "displayNames": {
        "ja": "Any App 管理者",
        "en": "Any App Manager",
        "zh_CN": "Any App 管理者"
      }
    }
  ],

  // 2. Authz resource groups
  "authzResourceGroups": [
    { "id": "any-app-content-root", "displayNames": { "ja": "...", "en": "...", "zh_CN": "..." } },
    { "id": "any-app-http-services", "parentGroup": "http-services",
      "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } }
  ],

  // 3. Authz resources
  "authzResources": [
    {
      "id": "any-app-content-maintenance",
      "uri": "service://any_app/maintenance/content",
      "parentGroup": "any-app-http-services",
      "displayNames": {
        "ja": "Any App コンテンツ管理",
        "en": "Any App Content Maintenance",
        "zh_CN": "Any App 内容管理"
      }
    }
  ],

  // 4. Authz policies (no multilingual needed)
  //    Note: tenant_manager is auto-granted on every service resource and every menu group, so it need not be listed.
  //          List only the other target roles/users (see "Default Policy" in reference/authz-policy.md).
  "authzPolicies": [
    { "resource": "any-app-content-maintenance", "type": "service", "action": "execute",
      "subject": "S(b_m_role:app_manager)", "effect": "PERMIT" }
  ],

  // 5. Authz subject groups
  "authzSubjectGroups": [
    {
      "sortKey": 900,
      "expression": "S(b_m_role:app_manager)",
      "displayNames": { "ja": "Any App 管理者", "en": "Any App Manager", "zh_CN": "Any App 管理者" }
    }
  ],

  // 6. Menu groups (optional) — menu-items can be written hierarchically as an items array
  "menuGroups": [
    {
      "id": "any_app_sm-pc",                  // Convention: <key>_sm-pc (sitemap PC)
      "sortNumber": 2000,                     // Display order of the top folder
      "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" },
      "items": [
        { "id": "any_app_home_sm-pc",  "sortNumber": 10, "url": "any_app/home",
          "displayNames": { "ja": "ホーム", "en": "Home", "zh_CN": "首页" } },
        { "id": "any_app_admin_sm-pc", "sortNumber": 100, "type": "folder",
          "displayNames": { "ja": "管理", "en": "Admin", "zh_CN": "管理" },
          "items": [
            { "id": "any_app_admin_users_sm-pc", "sortNumber": 10, "url": "any_app/admin/users",
              "displayNames": { "ja": "ユーザ管理", "en": "User Management", "zh_CN": "用户管理" } }
          ]
        }
      ]
    }
  ],

  // 7. Job Scheduler (optional)
  "jobScheduler": {
    "jobCategory":    { "id": "app-job-category",    "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } },
    "jobnetCategory": { "id": "app-jobnet-category", "displayNames": { "ja": "Any App", "en": "Any App", "zh_CN": "Any App" } },
    "jobs": [
      {
        "id": "app-job-sample-batch",
        "type": "JAVA",
        "path": "com.example.any_app.job.SampleBatchJob",
        "displayNames": { "ja": "サンプルバッチ", "en": "Sample Batch", "zh_CN": "示例批处理" }
      }
    ],
    "jobnets": [
      {
        "id": "app-jobnet-sample-batch",
        "disallowConcurrent": true,
        "jobs": ["app-job-sample-batch"],
        "displayNames": { "ja": "サンプルバッチ", "en": "Sample Batch", "zh_CN": "示例批处理" }
      }
    ]
  },

  // 8. Database (optional) — DDL is always per-dialect (3 files), DML is switched by dmlPerDialect
  "database": {
    "tables": [
      { "name": "any_app_data", "comment": "サンプルデータ" }
    ],
    "dmlPerDialect": false                     // false (default): single DML / true: 3 dialect-specific
  },

  // 9. Extends import (optional) — when true, generates a doImport(tenantId) skeleton JS
  "extendsImport": true,

  // 9.5. Portlet registration (optional) — registers a JSSP screen as a portal portlet by
  //      generating real INSERT statements into b_m_portlet_info / b_m_portlet_mode /
  //      b_m_portlet_title_info, output to <key>_sample-dml.sql (this alone produces a DML
  //      file even without "database"). See reference/portlet-import.md for details
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

  // 10. IM-Workflow import (optional) — copies the XMLs listed in files from storage/public/im_workflow/
  //     to storage/system, and generates <key>_workflow_import.js for loading them
  "workflowImport": {
    "files": [
      "im_workflow-simple_approval-import.xml"
    ]
  },

  // 11. IM-LogicDesigner import (optional) — copies the ZIPs listed in files from storage/public/im_logic/
  //     to storage/system, and generates <key>_logic_import.js that loads them via LogicFlowImporter
  "logicImport": {
    "files": [
      "im-logicdesigner-data-sample-simple.zip"
    ]
  }
}
```

See the files under `reference/` for details on each section.

| Reference file | Content |
|----------------|---------|
| [reference/import-config.md](reference/import-config.md) | Structure and reference rules of `import-<artifactId>-config-1.xml` |
| [reference/role.md](reference/role.md) | Role definition XML (base + per-language) |
| [reference/authz-policy.md](reference/authz-policy.md) | Authz policy XML (subject format / effect) |
| [reference/authz-resource.md](reference/authz-resource.md) | Authz resource / resource group XML (parent-group, uri) |
| [reference/authz-subject-group.md](reference/authz-subject-group.md) | Authz subject group XML (sort-key, expression) |
| [reference/menu-group.md](reference/menu-group.md) | Minimal structure of menu group XML |
| [reference/job-scheduler.md](reference/job-scheduler.md) | Job / jobnet definition XML |
| [reference/extends-import.md](reference/extends-import.md) | Implementation conventions for `doImport(tenantId)` |
| [reference/portlet-import.md](reference/portlet-import.md) | Portlet registration (`portletImport.portlets`, DML generation into `b_m_portlet_*`, out-of-scope items) |
| [reference/workflow-import.md](reference/workflow-import.md) | IM-Workflow import mechanism (`workflowImport.files`, structure of the generated JS, dependency order) |
| [reference/logic-import.md](reference/logic-import.md) | IM-LogicDesigner import mechanism (`logicImport.files`, direct Java access to `LogicFlowImporter`) |
| [reference/multi-config.md](reference/multi-config.md) | Multiple config operations (version upgrade / same-version config addition) — steps and samples |
| [reference/database-sql.md](reference/database-sql.md) | DDL/DML SQL skeleton format |
| [reference/checklist.md](reference/checklist.md) | Post-generation self-check |

### 3. Run build-setup-import.js

```bash
node .claude/skills/jssp-tenant-setup-generator/scripts/build-setup-import.js \
     <path to spec.json>
```

When `--out` is omitted, the output destination is the default path documented in SKILL.md.

What build-setup-import.js does automatically:

- Automatic expansion to 3 locales (en / ja / zh_CN) for each XML
- Automatic insertion of namespaces (`xmlns`)
- Reference integrity checks for role IDs / authz resource IDs (warns about IDs not referenced inside the spec)
- Generation of DDL/DML SQL skeletons (table names with comments only)
- Generation of real INSERT statements into `b_m_portlet_info` / `b_m_portlet_mode` / `b_m_portlet_title_info` from `portletImport.portlets` (not a comment-only skeleton — DML ready to load into tenant setup as-is)
- Generation of an extends import JS skeleton (outputs `doImport(tenantId)` as an empty function)
- Copying IM-Workflow import XMLs (`storage/public/im_workflow/` -> `storage/system/products/import/basic/<key>/<version>/`) and generating a dedicated JS (`<key>_workflow_import.js`)
- Copying IM-LogicDesigner import ZIPs (`storage/public/im_logic/` -> `storage/system/products/import/basic/<key>/<version>/`) and generating a dedicated JS (`<key>_logic_import.js`) (via `Packages.jp.co.intra_mart.foundation.logic.LogicServiceProvider`)
- Automatic assembly of `import-<artifactId>-config-1.xml` (references only the actually existing output files; lists multiple `<extends-import-class>` entries inside `<extends-import>`)

### 4. Self-Check

After generation, verify against the self-check list in [reference/checklist.md](reference/checklist.md).

## Multiple Config Operations

There are two patterns for splitting `import-<artifactId>-config-N.xml` into multiple files.

| Pattern | Use Case |
|---|---|
| **(I) Version upgrade** | Bump `spec.version` and add diffs to a new version directory |
| **(II) Adding configs within the same version** | Keep `spec.version`, increment only `configNumber`; a `-<N>` suffix is appended to file names |

In both cases, **never touch existing config-N.xml files** — always add a new config. For steps, examples, and a sample diff spec.json, see [reference/multi-config.md](reference/multi-config.md).

## Notes

- This skill is **dedicated to generating a full set of import materials for new apps**. It is not suited for appending to existing materials (such as adding entries to authz-policy) — manual editing is recommended for that.
- For details on menu group XML (menu item hierarchy, link types, etc.), refer to the intra-mart Accel Platform documentation. This skill only generates the minimal structural frame.
- The `subject` expression in authz policies (e.g. `S(b_m_role:...)`) is **not content-validated by the build script**. The string written in spec.json is output as-is. Always check the format in [reference/authz-policy.md](reference/authz-policy.md).
- The body of the extends import JS (`doImport(tenantId)`) is an empty skeleton. Users add the implementation contents individually. See [reference/extends-import.md](reference/extends-import.md) for the implementation conventions.

## Scope Boundaries

| Skill | Purpose |
|-------|---------|
| **jssp-tenant-setup-generator** (this skill) | Generates a full set of tenant setup materials (Importer format) |
| jssp-im-workflow-generator | Generates IM-Workflow workflow definition XML |
| jssp-im-logic-generator | Generates IM-LogicDesigner flow definition JSON |
| jssp-page-generator | Generates screens and function containers |
| jssp-im-job-generator | Implements the body of job programs (batch processing) |

**Scope boundary for Job Scheduler:**
This skill only generates `<key>-job-scheduler.xml` (job / jobnet definition XML).
The **job implementation body** (Java classes under `jp.co...` or `.js` job programs) is the job of `jssp-im-job-generator`.
