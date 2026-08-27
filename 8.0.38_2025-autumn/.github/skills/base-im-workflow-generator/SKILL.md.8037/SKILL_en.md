---
name: base-im-workflow-generator
description: Generates new IM-Workflow import XML definition files. From prompt instructions (workflow name, route pattern, approval node configuration), generates import XML including contents/route/flow sections. Use when mentioned "generate workflow definition", "create WF import XML", or "workflow definition file". For workflow programs (action processing, screens), use jssp-im-workflow-usage for JSSP implementations, or java-im-workflow-usage for Java (JavaEE development model) implementations.
allowed-tools: Bash, Read, Write, Glob, mcp__im_workflow__list_authority_plugins
---

# IM-Workflow Import XML Generation Skill

## Purpose

A skill for generating IM-Workflow import XML definition files from scratch based on prompt instructions.
The generated XML can be imported via the IM-Workflow administration screen's import feature.

## Conventions to Reference

This skill generates **only XML definition files** (`.xml`); it does not implement `.js` / `.html` (that is the responsibility of `jssp-im-workflow-usage`). Therefore the set of conventions to reference is minimal. See `.github/instructions/README.md` for the full picture.

| Convention | Handling |
|------------|----------|
| `jssp-file-structure.md` | 🟢 Required — the XML output directory (`src/main/storage/public/im_workflow/`) |
| `jssp-naming.md` | 🟢 Required — naming such as workflowName / shortName |
| `jssp-function-container.md` / `jssp-presentation-page.md` / `jssp-code-style.md`, etc. | 🔴 **Not needed for this skill alone** (XML generation only; `.js` / `.html` implementation is the responsibility of `jssp-im-workflow-usage`) |
| `jssp-2way-sql.md` / `jssp-accessibility.md` / `jssp-logging.md`, etc. | 🔴 **Not needed for this skill alone** |

## Generation Targets

- **contents** (content definition) — Screen paths (apply/approve/confirm/detail, 8 types) + rule associations
- **route** (route definition) — Node configuration (Start/Apply/Approve/Branch/End, etc.) and connections
- **flow** (flow definition) — Association of contents and routes, flow settings
- **matter_property** (case properties) — Business data fields (amounts, etc., used for branching conditions)
- **rule** (branching rules) — Conditional judgment rules based on case properties

## Supported Route Patterns

| Pattern | Template | Description |
|---------|----------|-------------|
| Straight route | `assets/template-straight.md` | Start → Apply → Approve (N nodes) → End |
| Branch route | `assets/template-branch.md` | Conditional branching (Branch_Start / Branch_End) |
| Sync route | `assets/template-sync.md` | Parallel processing / wait for all paths (Sync_Start / Sync_End) |
| Horizontal route | `assets/template-parallel.md` | Sequential approval (nodeTyp_Horizontal) — one at a time in order |
| Vertical route | `assets/template-vertical.md` | Parallel approval (nodeTyp_Vertical) — all reached simultaneously, order-independent |

### Node Selection When Multiple Approvers Are Required in Any Order

When multiple approvers are needed in **any order** (either can go first) and **all must approve**, use **sync nodes (Sync_Start / Sync_End)** or **vertical nodes (nodeTyp_Vertical)**.
Do not use horizontal nodes (nodeTyp_Horizontal) as they process sequentially.

| Node Type | Usage | Approver Assignment |
|-----------|-------|---------------------|
| Sync node | Each approver placed in separate Approve nodes on parallel paths. Waits until all paths complete | Statically specified at route definition time (recommended) |
| Vertical node | Multiple approvers placed dynamically in one node. All reached simultaneously, approved in any order | Set number of approvers in flow settings |
| ~~Horizontal node~~ | ~~Sequential approval (one at a time in order)~~ | **Not appropriate for order-independent approval. Do not use** |

### Selecting the Pattern for Dynamic Approval Flows (Conditional Multi-Step Approval)

For multi-step approvals where the set of approvers changes based on case data, the default representation is **`matterProperties` + `rules` + a `branch_start` node (branch route)**. For the decision flow, a typical example (additional department-manager approval when purchase price ≥ ¥100,000), and the trade-offs versus alternative approaches (matter start process / custom plugins), see [reference/dynamic-approval-flow.md](reference/dynamic-approval-flow.md).

## File Structure

```
base-im-workflow-generator/
├── SKILL.md
├── scripts/
│   ├── build-workflow.js          # spec.json → import XML generator (UTF-16LE output)
│   ├── validate-workflow.js       # Validator for generated XML
│   ├── validate-xml-encoding.js   # UTF-16LE encoding verification / repair
│   └── validate-xsd.js            # XSD structure validation
├── reference/
│   ├── xml-structure.md        # Full XML structure, type attributes, version rules, locale
│   ├── node-types.md           # Node types, AttributeType, AttributeKey specifications
│   ├── authority-plugins.md    # Authority plugin specifications (suffixes, targetType)
│   ├── default-notification.md # Notification template specifications
│   ├── validate-xml-encoding.md # UTF-16LE encoding verification script
│   ├── validate-xsd.md         # XSD structure validation procedure
│   ├── import-xml-checklist.md # Self-check checklist
│   └── im_workflow-import.xsd  # XSD schema
├── mcp-spec/                   # MCP endpoint specifications
│   ├── endpoints.md            # MCP endpoint specifications (processing target person plugins)
│   └── schemas/
│       └── mcp__im_workflow__list_authority_plugins.response.json
├── examples/
│   ├── straight.spec.json    # Straight route spec sample
│   └── branch.spec.json      # Nested branch route spec sample
└── assets/
    ├── sample-complete-branch.md # Complete XML sample (for structural reference)
    ├── template-straight.md      # Straight route spec design reference
    ├── template-branch.md        # Branch route spec design reference
    ├── template-sync.md          # Sync route spec design reference
    ├── template-parallel.md      # Horizontal route spec design reference
    └── template-vertical.md      # Vertical route spec design reference
```

## When to Use

When the user makes requests such as:
- "Create a workflow definition"
- "Generate import data (XML) for a workflow"
- "Create a WF import file"
- "Define an apply→approve flow in XML"

## Generation Steps

### 1. Interviewing

Confirm the following information from the user:

| Item | Required | Example |
|------|----------|---------|
| Workflow name (English ID) | YES | `purchase`, `expense` |
| Flow name (Japanese) | YES | `購買申請`, `経費申請` |
| Flow name (English) | YES | `Purchase Request` |
| Route pattern | YES | Straight / Branch / Sync / Horizontal / Vertical |
| Approval node configuration | YES | Manager→Director / with conditional branching (see "Approver Interpretation Rules" below) |
| Screen path base | YES | `sample/purchase/workflow` |

### Approver Interpretation Rules (Authority Plugin Selection)

When a user specifies approvers, select the authority plugin based on the **specificity of the instruction**.
Refer to the "Default Interpretation Rules for Approver Instructions" section in `reference/authority-plugins.md` for details.

| User's Instruction Example | Interpretation | Suffix |
|---------------------------|---------------|--------|
| "Manager", "Director" (job title only) | Applicant's department + job title | `.apply_user_department_and_post` |
| "Sales Dept. Manager" (department + title) | Specific department + job title | `.department_and_post` |
| "Director of applicant's upper organization" | Applicant's upper org + job title | `.apply_user_one_step_upper_department_and_post` |
| "Director of the previous approver" | Previous processor's dept + job title | `.before_user_department_and_post` |
| "WF Administrator" (role name only) | Direct role specification (no org filter) | `.role` |
| "WF person in Sales Dept." (dept + role) | Specific department + role | `.department_and_role` |
| "Tanaka-san" (individual name) | Direct user specification | `.user` |
| "Accounting Dept." (dept name only) | Department specification | `.department` |
| "Retrieve via IM-LogicDesigner", "Dynamic determination by flow ID" | IM-LogicDesigner flow integration | `.logic_flow_user` |

**Important:**
- For **apply nodes** (application authority), use `.role` (e.g., `im_workflow_user`). Dynamic `apply_user_*` plugins cannot be used at the apply extension point.
- For job title-only instructions ("Manager", "Director"), do not use `.post` (direct specification). `.post` targets all persons with that title across all organizations, which may not match business intent. The default is **`.apply_user_department_and_post`** (applicant's department + job title).
- For role-only instructions ("WF Administrator"), use `.role` (direct specification). Roles have system/functional authority characteristics, and filtering by organization risks having no approver.
- The above are suffix selection rules. The extension point (`approve` vs `approve.static`) is determined separately based on the type of the preceding node. Preceding node is a human node → `approve.{suffix}`, preceding node is a system node → `approve.static.{suffix}`. Always apply both judgments.
- For instructions not matching any of the above (e.g., "Users hired after 2026/10/01" and other custom conditions), use `mcp__im_workflow__list_authority_plugins` for keyword search to find a custom plugin. See [mcp-spec/endpoints.md](mcp-spec/endpoints.md) for details.
- For **`.logic_flow_user`**, pass `targetCode` as a JSON object — `build-workflow.js` automatically converts it to a JSON string. Explicitly specifying `targetType` is also unnecessary (`logic_flow_user` is auto-inferred).
  ```jsonc
  // approve / confirm node with IM-LogicDesigner flow integration
  { "id": "01", "type": "approve", "name": "Approver",
    "plugin": { "suffix": "logic_flow_user",
                "targetCode": { "flowId": "my_authority_flow", "version": null, "versionDecide": false } } }
  ```

#### How to Obtain the Value Passed to `targetCode`

Values shown in the examples above such as `ps003` or `comp_sample_01^comp_sample_01^ps003` are values from the intra-mart standard sample tenant (`comp_sample_01`). **Real projects use different code schemes.** Obtain the real codes by checking the following sources, in this priority order:

1. **Project specification / design document** if it states the code explicitly → use that code (highest priority).
2. Use **`mcp__im_workflow__list_authority_plugins`** to identify the plugin, and refer to `parameterHint` to confirm the required code value with the user.
3. If neither is available → fill in a sample value as a placeholder and **explicitly ask the user to confirm the real code**. Do not ship with sample values still in place.

Lists of sample post codes / department codes / role IDs are in the "Sample Data" section of `reference/authority-plugins.md` (**for learning reference only**; do not copy them as real codes).

### 2. Assembling spec.json

Create spec.json from the interview results. The coding agent only writes this spec.
Samples: [examples/straight.spec.json](examples/straight.spec.json) (straight), [examples/branch.spec.json](examples/branch.spec.json) (nested branch)
The XML structure (3-locale expansion, 2 versions, double plugin registration, etc.) is auto-generated by `build-workflow.js`.

```jsonc
{
  "workflowName": "purchase_request",         // English ID (snake_case)
  "shortName": "pur_req",                     // Short name for plugin IDs
  "names": {
    "en": "Purchase Request",
    "ja": "購買申請",
    "zh_CN": "采购申请"
  },
  "screenBasePath": "purchase/workflow",       // Screen path base (for default path generation)
  "screens": {                                 // Individual screen path specification (auto-generated from screenBasePath if omitted)
    "apply": "purchase/workflow/apply/index",   //   Application screen (pageType=0)
    "tempSave": null,                          //   Temp save screen (pageType=1, null=shares apply screen)
    "applyTask": null,                         //   Application task screen (pageType=2)
    "reapply": "purchase/workflow/apply/index", //   Re-application screen (pageType=3, can share with apply)
    "process": "purchase/workflow/approve/index", // Processing screen (pageType=4)
    "confirm": null,                           //   Confirmation screen (pageType=5)
    "processDetail": "purchase/workflow/detail/index", // Processing detail screen (pageType=6)
    "referDetail": "purchase/workflow/detail/index"    // Reference detail screen (pageType=7, can share with processDetail)
  },
  "pattern": "straight",                       // straight / branch / sync / horizontal / vertical
  "generationDate": "2026/04/10",             // Version switch date

  "nodes": [
    { "id": "start",  "type": "start" },
    { "id": "apply",  "type": "apply",   "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps003" } },
    { "id": "01",     "type": "approve", "name": "Manager",  "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps002" } },
    { "id": "02",     "type": "approve", "name": "Director", "plugin": { "suffix": "role", "targetCode": "im_workflow_user" } },
    { "id": "end",    "type": "end" }
  ],

  // For straight, edges can be omitted (auto-connected in nodes order)
  // For branch/sync, specify explicitly:
  "edges": [
    { "from": "start", "to": "apply" },
    { "from": "apply", "to": "01" }
  ],

  // For branch patterns only:
  "matterProperties": [
    { "key": "unitPrice", "type": "numeric", "names": { "en": "Unit Price", "ja": "単価", "zh_CN": "单价" } }
  ],
  // Single condition (legacy format, backward compatible)
  "rules": [
    { "id": "01", "property": "unitPrice", "operator": "<", "value": "20000",
      "names": { "en": "UnitPrice less than 20000", "ja": "単価20000未満", "zh_CN": "单价不足20000" } }
  ]

  // Multiple conditions (new format): AND / OR can both be specified
  // "rules": [
  //   {
  //     "id": "02",
  //     "unionCondition": "and",   // "and" (default if omitted) or "or"
  //     "conditions": [
  //       { "property": "amount",     "operator": ">=", "value": "20000" },
  //       { "property": "item_total", "operator": ">=", "value": "100000" }
  //     ],
  //     "names": { "en": "...", "ja": "金額20000以上 かつ 合計金額100000以上", "zh_CN": "..." }
  //   }
  // ]
}
```

**Screen path (screens) specification rules:**
- Individually specified screen paths in `screens` take priority. Omitted keys are auto-generated from `screenBasePath`.
- **The standard naming for screen files is `{feature}/{screen-type}/index.js` + `index.html`**. Avoid redundant paths like `apply/apply`.
- To share the same screen for apply and re-apply, specify the same path for both (e.g., `"apply": "leave/apply/index", "reapply": "leave/apply/index"`).
- Processing detail and reference detail screens can similarly be shared.
- **Default paths when `screens` is omitted**: `{screenBasePath}/apply/index`, `{screenBasePath}/process/index`, etc.

**Node name (name) language:**
- `nodeName` cannot be localized. Use **the same English name for all locales**.
- Node names are visible to general users, so English is recommended regardless of prompt language.

**Node type list:**

| type | nodeType | Description |
|------|----------|-------------|
| `start` | nodeTyp_Start | Start |
| `end` | nodeTyp_End | End |
| `apply` | nodeTyp_Apply | Application |
| `approve` | nodeTyp_Approve | Approval |
| `confirm` | nodeTyp_Confirm | Confirmation (view only, no approval authority). **A terminal branch hanging off an approve node**, separate from the main flow. In a straight route, listing it in `nodes` auto-connects it to the next node, causing a validator error — **always specify `edges` explicitly, write only the incoming edge to the confirm node, and omit any outgoing edge from it.** |
| `branch_start` | nodeTyp_Branch_Start | Branch start |
| `branch_end` | nodeTyp_Branch_End | Branch end |
| `sync_start` | nodeTyp_Sync_Start | Sync start |
| `sync_end` | nodeTyp_Sync_End | Sync end |
| `horizontal` | nodeTyp_Horizontal | Horizontal (sequential approval) |
| `vertical` | nodeTyp_Vertical | Vertical (parallel approval) |

**Node action processing (actionProcess):**

Specify the action processing script path in the `actionProcess` field for apply/approve nodes.
**Nodes without `actionProcess` specified will not have action processing plugins registered.**

```jsonc
{
  "id": "apply", "type": "apply",
  "actionProcess": "leave/action/ActionProcess1"  // Action processing script path
},
{
  "id": "01", "type": "approve", "name": "Manager"
  // No actionProcess → no action processing (plugin not registered)
},
{
  "id": "02", "type": "approve", "name": "HR",
  "actionProcess": "leave/action/ActionProcess2"  // Deduct remaining days on approval completion
},
{
  "id": "03", "type": "approve", "name": "Director",
  "actionProcess": "jp.co.intra_mart.sample.leave.workflow.action.LeaveActionProcess",
  "actionProcessImpl": "java"  // Java class execution (JavaEE development model). Defaults to "jssp" (script execution) if omitted
}
```

Notes:
- Do not include `.js` extension in the path (IM-Workflow auto-appends it)
- Do not specify `actionProcess` for nodes that don't need action processing (specifying it would cause errors referencing non-existent files)
- When `actionProcessImpl: "java"` is specified, `actionProcess` must be the **fully qualified class name (FQCN)** of the implementation class, not a JSSP file path (implement it with the `java-im-workflow-usage` skill). The `pluginId` becomes `{exPointId}.pluginJavaExecutor` (see [reference/java-class-registration.md](reference/java-class-registration.md))

**Case end processing (matterEndProcess):**

Specify the case end processing script path in the `matterEndProcess` field at the top level of spec.
When specified, a case end processing plugin is automatically registered in the content definition's `plugins`.

```jsonc
{
  "workflowName": "leave_request",
  // ...
  "matterEndProcess": "leave/action/MatterEndProcess",  // Case end processing script path (no extension)
  "matterEndProcessNoTransaction": false,  // true to use no-transaction version (default: false)
  "matterEndProcessImpl": "jssp"  // "java" for Java class execution (JavaEE development model). Defaults to "jssp"
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `matterEndProcess` | No | none | JSSP: script path (no extension) / Java: FQCN of the implementation class. Plugin not registered if omitted |
| `matterEndProcessNoTransaction` | No | `false` | If `true`, uses the no-transaction extension point |
| `matterEndProcessImpl` | No | `"jssp"` | `"java"` for Java class execution (`pluginId` becomes `.pluginJavaExecutor`). Implement with the `java-im-workflow-usage` skill |

- With transaction: `jp.co.intra_mart.workflow.plugin.event.matter.end.process`
- Without transaction: `jp.co.intra_mart.workflow.plugin.event.matter.end_no_transaction.process`

**Other plugin fields (arrival process, matter start process, matter archive process, matter delete listeners):**

Following the same pattern as `actionProcess` / `matterEndProcess`, the arrival process (per-node `arriveProcess`), matter start process (`matterStartProcess`), matter archive process (`matterArchiveProcess`), and the active/completed/archived matter delete listeners (`activeMatterDeleteProcess`, etc.) can also be auto-registered in both JSSP and Java implementations. See [reference/lifecycle-plugin-fields.md](reference/lifecycle-plugin-fields.md) for the field list, `spec.json` syntax, and known gaps (user-program-style branch conditions, custom processing target user plugin implementations).

**Branch node (branch_start) additional fields:**

```jsonc
{
  "id": "brs1", "type": "branch_start", "name": "Start branch",
  "branchMethod": "rule",    // "rule" | "user_select" | "program"
  "paths": [
    { "condition": { "ruleId": "01", "property": "unitPrice", "operator": "<", "value": "20000" },
      "nodes": ["prs1"] },   // First node ID on this path
    { "condition": { "ruleId": "02", ... },
      "nodes": ["dir"] }
  ]
}
```

**Flow function settings (flowSettings):**

Control IM-Workflow flow definition function settings (bulk processing, file attachments, auto processing, auto reminders, etc.) with the `flowSettings` object in spec. Default values apply when omitted. See [reference/flow-settings.md](reference/flow-settings.md) for the field list, XML tag mapping, and items that require manual configuration in the admin screen.

### 3. Run build-workflow.js

```bash
node .github/skills/base-im-workflow-generator/scripts/build-workflow.js \
     /tmp/<workflowName>.spec.json
```

Output goes to `src/main/storage/public/im_workflow/im_workflow-<workflowName>-import.xml` when `--out` is omitted.

What build-workflow.js does automatically:
- Full expansion for 3 locales (en/ja/zh_CN) × 2 versions (blank + active)
- Multi-language page name generation for 8 page types
- Node ID construction (`<shortName>_<id>`)
- Node connection resolution (auto for straight, from edges for others)
- Automatic `extensionPointId` determination (switches between approve / approve.static based on preceding node type)
- Double plugin registration (within node + at route level)
- Coordinate calculation
- Generation of flowDetails / flowUnions / flowAttributes for branch nodes
- UTF-16LE (with BOM) conversion

### 4. Validate with validate-workflow.js

```bash
node .github/skills/base-im-workflow-generator/scripts/validate-workflow.js \
     <output .xml>
```

Validation items:
- BOM + UTF-16LE encoding
- XML declaration + `<data>` root
- Existence of contents / route / flow sections
- 3-locale expansion
- 2 versions (blank + active)
- Route node connection consistency (existence of prev/next references)
- Double plugin registration
- Flow definition nodes do not include Start/End
- Branch rule reference consistency
- Existence of page types 0-7
- nodeName is identical across all locales

### 5. XSD Validation (Optional)

Follow the procedure in `reference/validate-xsd.md` to validate structure using `reference/im_workflow-import.xsd`.

## Notes

- **Cautions and common mistakes are documented as a checklist in `reference/import-xml-checklist.md`.** Always verify all items after generating XML.
- **The output location must not be changed from `src/main/storage/public/im_workflow/`.** This directory is the fixed storage location for IM-Workflow import resources. If output is directed to another location (e.g., `spec/`) using `--out`, it will not be referenced or imported by the tenant environment setup (Importer / the integration processing of `jssp-tenant-setup-generator`).
- This skill is exclusively for generating workflow **definition files**. For workflow integration **programs** (action processing, application screens, approval screens), use `jssp-im-workflow-usage` for JSSP implementations, or `java-im-workflow-usage` for Java (JavaEE development model) implementations.
- **To register a Java class FQCN in `actionProcess` / `matterEndProcess`**, see [reference/java-class-registration.md](reference/java-class-registration.md). `build-workflow.js` now supports both (see the `actionProcessImpl` / `matterEndProcessImpl` fields).

## Boundary and Consistency Responsibilities With Other Skills

The `scriptPath` (screen path) referenced by the XML and the actual file placement generated by `jssp-im-workflow-usage` **must be kept consistent across both skills**. Responsibilities split as follows:

| Responsibility | Owning Skill |
|---|---|
| Decide the screen path for each pageType via `screens` in spec.json | **This skill (generator)** |
| Output `<scriptPath>` inside the XML | **This skill (generator)** |
| Place the actual `.js` / `.html` files that match those paths | `jssp-im-workflow-usage` |
| Verify path consistency (does the JS referenced by the XML exist?) | `WF-XML-001` in `jssp-im-workflow-usage/scripts/validate-workflow-code.js` |

### pageType ↔ usage Convention Directory Mapping

When `screens` is omitted in `spec.json`, the default behavior is aligned with both the convention directories of `jssp-im-workflow-usage` and the common business patterns of IM-Workflow. **For new projects, omitting `screens` is fine in principle.**

| pageType | Key | Default behavior | Purpose |
|---|---|---|---|
| 0 | `apply` | Generate `apply/index` | Application screen (**mandatory**) |
| 1 | `tempSave` | **Shares `apply`** (the same apply screen also serves temp save) | Temporary save screen. Specify a path only when a dedicated screen is needed. Can be omitted with `false` |
| 2 | `applyTask` | **Omitted by default** (not output to XML) | Application (issued case) screen. Used only for periodic application patterns (monthly reports, fiscal-year goal setting, etc.) where a job auto-issues the case. Output only when a path is explicitly specified (like `reapply`, to share the apply screen specify the same path as `apply`) |
| 3 | `reapply` | **Shared with `apply`** (same path) by default | Re-application screen. Required even without send-back operations, to support the applicant's "pull back" operation |
| 4 | `process` | Generate **`approve/index`** | **Processing screen (approve / send back / reject) (mandatory)** |
| 5 | `confirm` | Generate `confirm/index` | Confirmation screen. Can be omitted with `false` |
| 6 | `processDetail` | Generate `process_detail/index` | Process detail screen. Separate implementation from the process screen is safer (content and edit permissions may differ) |
| 7 | `referDetail` | **Shared with `processDetail`** (same path) by default | Reference detail screen. Specify a separate path only when the spec calls for significant differences |

**Note on `pageType=4` (processing screen):** The official IM-Workflow term is `process`, but this project's usage skill implements it as the "approval screen" (`approve/`). The default suffix is therefore set to `approve/index`.

### `screens` Field and Consistency Verification

`screens` in `spec.json` lets you control the output of each pageType in fine detail (string = path, `false` = exclude, omitted = default). For the detailed value semantics, typical omission / sharing patterns (A: minimal, B: standard, C: issued-case operations, D: distinct detail screen), and the consistency verification flow using `validate-workflow-code.js` (handling the `WF-XML-001` warning), see [reference/screens-and-script-paths.md](reference/screens-and-script-paths.md).

## Scope Differentiation

| Skill | Purpose |
|-------|---------|
| **base-im-workflow-generator** (this skill) | Generate WF definition XML (contents/route/flow). Supports both JSSP and Java execution methods (see [reference/java-class-registration.md](reference/java-class-registration.md) for Java) |
| jssp-im-workflow-usage | Generate WF integration programs (.js/.html, script development model) |
| java-im-workflow-usage | Generate WF integration programs (.java, JavaEE development model). Screens are out of scope |
| jssp-page-generator | Generate general screens and function containers |
