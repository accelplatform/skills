# Authority Plugin Reference

## Overview

Authority plugins in IM-Workflow are a mechanism for specifying processing targets (applicants, approvers, reference viewers, etc.).
The pluginId is structured as `{extensionPointId}.{suffix}`, and the suffix switches the specification method.

## Extension Point List

The extensionPointId varies depending on the purpose. The suffix portion can be used in common.

| Purpose | extensionPointId |
|---------|-----------------|
| Application authority | `jp.co.intra_mart.workflow.plugin.authority.node.apply` |
| Approval authority (static) | `jp.co.intra_mart.workflow.plugin.authority.node.approve.static` |
| Approval authority (dynamic) | `jp.co.intra_mart.workflow.plugin.authority.node.approve` |
| Dynamic approval / Horizontal / Vertical | `jp.co.intra_mart.workflow.plugin.authority.node.dynamic` |
| Confirmation authority | `jp.co.intra_mart.workflow.plugin.authority.node.confirm` |
| Reference viewer | `jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle` |

### Choosing Between Static Approval (B-1) and Dynamic Approval (B-2)

Official documentation: https://document.intra-mart.jp/library/iap/public/im_workflow/im_workflow_specification/texts/detail_guide/process_target/process_auth/detail_guide_38.html#id8

The extension point to use is determined by **the type of the preceding node**.

**B-1: `approve.static` (static)** — when the preceding node is:
- System node, sync start/end node, branch start/end node
- Dynamic approval node, horizontal node, vertical node

**B-2: `approve` (dynamic)** — in all other cases (application node, approval node, etc.—human nodes)

| Extension Point | Pattern | Preceding Node |
|----------------|---------|----------------|
| `approve.static` | B-1 | Sync_Start/End, Branch_Start/End, etc. (system nodes) |
| `approve` | B-2 | Application node, approval node, etc. (human nodes) |

## Default Interpretation Rules for Approver Instructions

When a user specifies an approver ambiguously, select the plugin using the following rules.

### Decision Flowchart

```
User's approver instruction
  │
  ├─ Individual name / user code → `.user` (direct specification)
  │
  ├─ Organization name only (e.g., "Finance Dept") → `.department` (direct specification)
  │
  ├─ Position name only (e.g., "Section Manager", "Department Manager")
  │    │
  │    └─ No organization qualifier → `.apply_user_department_and_post` (applicant's org + position)
  │
  ├─ Role name only (e.g., "WF Admin", "WF User")
  │    │
  │    └─ No organization qualifier → `.role` (direct specification, not scoped by org)
  │
  ├─ Organization + position (e.g., "Section Manager in Sales Dept") → `.department_and_post`
  │
  ├─ Organization + role (e.g., "WF person in charge in Sales Dept") → `.department_and_role`
  │
  ├─ Modifier starting with "applicant's ~"
  │    ├─ "Department Manager of higher-level org" → `.apply_user_one_step_upper_department_and_post`
  │    ├─ "Department Manager of all higher-level orgs" → `.apply_user_all_step_upper_department_and_post`
  │    ├─ "Section Manager of lower-level org" → `.apply_user_one_step_lower_department_and_post`
  │    ├─ "WF person in charge of own org" → `.apply_user_department_and_role`
  │    └─ "WF Admin of higher-level org" → `.apply_user_one_step_upper_department_and_role`
  │
  ├─ Modifier starting with "previous approver's ~" / "previous processor's ~"
  │    ├─ "Section Manager of previous processor" → `.before_user_department_and_post`
  │    ├─ "Department Manager of previous processor's higher-level org" → `.before_user_one_step_upper_department_and_post`
  │    ├─ "Department Manager of all previous processor's higher-level orgs" → `.before_user_all_step_upper_department_and_post`
  │    └─ "WF person in charge of previous processor" → `.before_user_department_and_role`
  │
  └─ "The applicant themselves" → `.apply_user`
```

### Rationale for Default Selections

**Why use `.apply_user_department_and_post` (dynamic) instead of `.post` (direct) for position name only:**

- `.post` does not scope by organization, making **all holders of that position across all organizations** the approval target.
- A business instruction like "have the section manager approve" normally means "the section manager of my (the applicant's) own organization."
- `.apply_user_department_and_post` dynamically determines approvers based on the applicant's affiliation, making it universally applicable.

**Why use `.role` (direct) as-is for role name only:**

- Roles represent system management / functional permissions (e.g., `im_workflow_manager`) and tend not to be scoped to specific organizations.
- "Have the WF admin approve" means "someone who has that authority," and there is little intent to limit it to the applicant's organization.
- Scoping by organization risks no approvers being found if no one in the applicant's organization has that role.
- If they want to scope by organization + role, they should explicitly specify the organization (e.g., "WF person in charge in Sales Dept").

### Combination with Extension Points (Important)

The above flowchart only determines the **suffix portion**.
The actual pluginId is `{extensionPointId}.{suffix}`, and the extension point switches based on **the type of the preceding node** (see "Choosing Between Static Approval (B-1) and Dynamic Approval (B-2)" at the top of this file).

| Preceding Node | Extension Point | Example pluginId (for suffix `.apply_user_department_and_post`) |
|---------------|----------------|------|
| Application/approval (human node) | `approve` (dynamic) | `...node.approve.apply_user_department_and_post` |
| Branch start / sync start (system node) | `approve.static` (static) | `...node.approve.static.apply_user_department_and_post` |

**The choice of suffix (this section) and the choice of extension point (B-1/B-2) are independent judgments; always apply both.**

### XML Output Examples

```xml
<!-- "Section Manager" specified + preceding node is application node (human) → approve (dynamic) -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department_and_post</pluginId>
<parameter type="string">|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string" />
<targetCode type="string" />

<!-- "Section Manager" specified + preceding node is branch start node (system) → approve.static (static) -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static.apply_user_department_and_post</pluginId>
<parameter type="string">|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string" />
<targetCode type="string" />

<!-- "Section Manager in Sales Dept" specified + preceding node is application node → approve (dynamic) -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.department_and_post</pluginId>
<parameter type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string">departmentAndPost</targetType>
<targetCode type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</targetCode>
```

**Note:** Dynamic specifications (`apply_user_*`, `before_user_*`) have empty tags for `targetType` / `targetCode`.
The structure differs from direct/combination specifications; do not confuse them.

## Suffix List

### Direct Specification (set code values in parameter / targetCode)

| Suffix | targetType | parameter / targetCode format | Description |
|--------|-----------|------|------|
| `.user` | `user` | `{user code}` | Directly specify a user |
| `.department` | `department` | `{company code}^{org set code}^{org code}` | Specify an organization |
| `.post` | `post` | `{company code}^{org set code}^{position code}` | Specify a position |
| `.role` | `role` | `{role ID}` | Specify a role |
| `.public_group` | `publicGroup` | `{group set code}^{group code}` | Specify a public group |
| `.public_group_role` | `publicGroupRole` | `{group set code}^{role code}` | Specify a role in a public group |

**Note:** targetType is generally camelCase (`publicGroup`, `publicGroupRole`). `user`, `department`, `post`, `role` are all lowercase, but compound words are always camelCase.

### Combination Specification (verified with actual machine export data)

parameter and targetCode have the same value. Separator is pipe `|` (not caret `^`).

| Suffix | targetType | parameter / targetCode format | Description |
|--------|-----------|------|------|
| `.department_and_post` | `departmentAndPost` | `{company}^{org set}^{org}\|{company}^{org set}^{position}` | Organization + position |
| `.department_and_role` | `departmentAndRole` | `{company}^{org set}^{org}\|{role ID}` | Organization + role |
| `.public_group_and_public_group_role` | `publicGroupAndPublicGroupRole` | `{group set}^{group}\|{group set}^{role}` | Public group + role |
| `.public_group_and_role` | `publicGroupAndRole` | `{group set}^{group}\|{role ID}` | Public group + role |

**Note:** targetType is camelCase (`departmentAndPost`, `publicGroupAndRole`).

```xml
<!-- Example: Organization + position -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.department_and_post</pluginId>
<parameter type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string">departmentAndPost</targetType>
<targetCode type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</targetCode>

<!-- Example: Public group + role -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.public_group_and_role</pluginId>
<parameter type="string">sample_public^public_group_a|im_workflow_user</parameter>
<targetType type="string">publicGroupAndRole</targetType>
<targetCode type="string">sample_public^public_group_a|im_workflow_user</targetCode>
```

### Dynamic Specification (verified with actual machine export data, all 37 patterns)

Dynamically determines approvers based on the applicant's or previous processor's affiliated organization, etc.
Set `targetType` / `targetCode` to empty tags.

**Rules for parameter (determined by suffix ending):**

| Suffix ending | parameter | Format |
|--------------|-----------|--------|
| `_department` only | Empty tag | `<parameter type="string" />` |
| `_and_post` | `\|{company code}^{org set code}^{position code}` | Leading pipe `\|` + position code |
| `_and_role` | `\|{role ID}` | Leading pipe `\|` + role ID |
| `apply_user` (self) | Empty tag | `<parameter type="string" />` |

**XML examples:**

```xml
<!-- Organization only: parameter is empty tag -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department</pluginId>
<parameter type="string" />
<targetType type="string" />
<targetCode type="string" />

<!-- Organization + position: parameter is |{company code}^{org set code}^{position code} -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department_and_post</pluginId>
<parameter type="string">|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string" />
<targetCode type="string" />

<!-- Organization + role: parameter is |{role ID} -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department_and_role</pluginId>
<parameter type="string">|im_workflow_user</parameter>
<targetType type="string" />
<targetCode type="string" />
```

#### Applicant-based (apply_user_*)

| Suffix | Description | Example parameter |
|--------|-------------|------------------|
| `.apply_user` | Applicant themselves | Empty tag |
| `.apply_user_department` | Applicant's affiliated organization | Empty tag |
| `.apply_user_department_and_post` | Applicant's affiliated organization + position | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_department_and_role` | Applicant's affiliated organization + role | `\|im_workflow_user` |
| `.apply_user_one_step_upper_department` | Applicant's one-level-up organization | Empty tag |
| `.apply_user_one_step_upper_department_and_post` | Applicant's one-level-up organization + position | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_one_step_upper_department_and_role` | Applicant's one-level-up organization + role | `\|im_workflow_user` |
| `.apply_user_all_step_upper_department` | All of applicant's higher-level organizations | Empty tag |
| `.apply_user_all_step_upper_department_and_post` | All higher-level organizations + position | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_all_step_upper_department_and_role` | All higher-level organizations + role | `\|im_workflow_user` |
| `.apply_user_one_step_lower_department` | Applicant's one-level-down organization | Empty tag |
| `.apply_user_one_step_lower_department_and_post` | Applicant's one-level-down organization + position | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_one_step_lower_department_and_role` | Applicant's one-level-down organization + role | `\|im_workflow_user` |
| `.apply_user_all_step_lower_department` | All of applicant's lower-level organizations | Empty tag |
| `.apply_user_all_step_lower_department_and_post` | All lower-level organizations + position | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_all_step_lower_department_and_role` | All lower-level organizations + role | `\|im_workflow_user` |

#### Previous Processor-based (before_user_*)

| Suffix | Description | Example parameter |
|--------|-------------|------------------|
| `.before_user_department` | Previous processor's affiliated organization | Empty tag |
| `.before_user_department_and_post` | Previous processor's affiliated organization + position | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_department_and_role` | Previous processor's affiliated organization + role | `\|im_workflow_user` |
| `.before_user_one_step_upper_department` | Previous processor's one-level-up organization | Empty tag |
| `.before_user_one_step_upper_department_and_post` | Previous processor's one-level-up organization + position | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_one_step_upper_department_and_role` | Previous processor's one-level-up organization + role | `\|im_workflow_user` |
| `.before_user_all_step_upper_department` | All of previous processor's higher-level organizations | Empty tag |
| `.before_user_all_step_upper_department_and_post` | All higher-level organizations + position | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_all_step_upper_department_and_role` | All higher-level organizations + role | `\|im_workflow_user` |
| `.before_user_one_step_lower_department` | Previous processor's one-level-down organization | Empty tag |
| `.before_user_one_step_lower_department_and_post` | Previous processor's one-level-down organization + position | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_one_step_lower_department_and_role` | Previous processor's one-level-down organization + role | `\|im_workflow_user` |
| `.before_user_all_step_lower_department` | All of previous processor's lower-level organizations | Empty tag |
| `.before_user_all_step_lower_department_and_post` | All lower-level organizations + position | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_all_step_lower_department_and_role` | All lower-level organizations + role | `\|im_workflow_user` |

### Hierarchical Specification (expand upper/lower levels starting from an organization)

Hierarchical specifications differ from dynamic specifications in that `targetType` / `targetCode` have values.
`parameter` and `targetCode` have the same value.

| Suffix ending | targetType | parameter / targetCode format |
|--------------|-----------|------|
| `_department` only | `department` | `{company code}^{org set code}^{org code}` |
| `_and_post` | `departmentAndPost` | `{company}^{org set}^{org}\|{company}^{org set}^{position}` |
| `_and_role` | `departmentAndRole` | `{company}^{org set}^{org}\|{role ID}` |

**Note:** The separator for hierarchical specifications is pipe `|` (between org and position/role, not at the start).

| Suffix | Description | Example parameter | targetType |
|--------|-------------|-------------|-----------|
| `.department_all_step_upper_department` | Organization + all upper levels | `comp_sample_01^comp_sample_01^dept_sample_11` | `department` |
| `.department_all_step_upper_department_and_post` | Organization + all upper levels + position | `comp_sample_01^comp_sample_01^dept_sample_11\|comp_sample_01^comp_sample_01^ps003` | `departmentAndPost` |
| `.department_all_step_upper_department_and_role` | Organization + all upper levels + role | `comp_sample_01^comp_sample_01^dept_sample_11\|im_workflow_user` | `departmentAndRole` |
| `.department_all_step_lower_department` | Organization + all lower levels | `comp_sample_01^comp_sample_01^dept_sample_11` | `department` |
| `.department_all_step_lower_department_and_post` | Organization + all lower levels + position | `comp_sample_01^comp_sample_01^dept_sample_11\|comp_sample_01^comp_sample_01^ps003` | `departmentAndPost` |
| `.department_all_step_lower_department_and_role` | Organization + all lower levels + role | `comp_sample_01^comp_sample_01^dept_sample_11\|im_workflow_user` | `departmentAndRole` |

## Sample Data

> ⚠️ **All values below are data from the intra-mart standard sample tenant `comp_sample_01`**.
> Real projects use different code schemes (their own department codes, post codes, role naming, etc.), so you must not copy these as if they were real codes.
> When assembling spec.json, obtain real codes from one of the following sources:
>
> 1. **Project specification / design document** (highest priority)
> 2. **MCP `mcp__im_workflow__resolve_authority`** result (pass the natural-language description of the approver)
> 3. If you cannot obtain it → fill in a sample value as a placeholder and **explicitly ask the user to confirm the real code**.
>
> The tables below are only for **understanding the structure (separators, code length, formats) and learning purposes**.

### Users

| User code | Name |
|-----------|------|
| `ueda` | Tatsuo Ueda |
| `aoyagi` | Tatsumi Aoyagi |
| `hayashi` | Masayoshi Hayashi |
| `maruyama` | Masuo Maruyama |
| `sekine` | Chika Sekine |
| `terada` | Masahiko Terada |
| `yoshikawa` | Kazuya Yoshikawa |
| `ohiso` | Hirofumi Ohiso |
| `hagimoto` | Junko Hagimoto |
| `ikuta` | Kazuya Ikuta |
| `katayama` | Satoshi Katayama |
| `harada` | Koji Harada |

### Organizations

| parameter / targetCode | Description |
|----------------------|-------------|
| `comp_sample_01^comp_sample_01^comp_sample_01` | Sample Company (top) |
| `comp_sample_01^comp_sample_01^dept_sample_10` | Sample Department 10 |
| `comp_sample_01^comp_sample_01^dept_sample_11` | Sample Department 11 |
| `comp_sample_01^comp_sample_01^dept_sample_12` | Sample Department 12 |
| `comp_sample_01^comp_sample_01^dept_sample_20` | Sample Department 20 |
| `comp_sample_01^comp_sample_01^dept_sample_21` | Sample Department 21 |
| `comp_sample_01^comp_sample_01^dept_sample_22` | Sample Department 22 |
| `comp_other_01^comp_other_01^comp_other_01` | Other Company (top) |
| `comp_other_01^comp_other_01^dept_other_10` | Other Department 10 |
| `comp_other_01^comp_other_01^dept_other_11` | Other Department 11 |

### Positions

| parameter / targetCode | Description |
|----------------------|-------------|
| `comp_sample_01^comp_sample_01^ps001` | President |
| `comp_sample_01^comp_sample_01^ps002` | Department Manager |
| `comp_sample_01^comp_sample_01^ps003` | Section Manager |

### Roles

| Role ID | Description |
|---------|-------------|
| `accel_studio_manager` | Accel Studio Administrator |
| `account_manager` | Account Administrator |
| `authz_manager` | Authorization Administrator |
| `bis_auditor` | BIS Auditor |
| `bis_business_manager` | BIS Business Administrator |
| `bis_manager` | BIS Administrator |
| `bis_user` | BIS User |
| `bis_ws_imw_user` | IM-Workflow (IM-BIS) Web Service User |
| `calendar_manager` | Calendar Administrator |
| `file_exc_manager` | FileExchange Administrator |
| `forma_app_creator` | Forma App Creator |
| `forma_app_manager` | Forma App Manager |
| `forma_ws_imw_user` | IM-Workflow (Forma) Web Service User |
| `im_knowledge_manager` | Knowledge Group Administrator |
| `im_knowledge_user` | Knowledge Content User |
| `im_master_manager` | IM-Master Administrator (Master Data Administrator) |
| `im_master_operator` | IM-Master Operations Administrator |
| `im_workflow_auditor` | IM-Workflow Auditor |
| `im_workflow_manager` | IM-Workflow Administrator (Master Data Administrator) |
| `im_workflow_operator` | IM-Workflow Operations Administrator |
| `im_workflow_user` | IM-Workflow User |
| `imbm_manager` | IM-BloomMaker Administrator |
| `imld_manager` | LogicDesigner Administrator |
| `imprtl_manager` | Portal (Low-code) Portal Administrator |
| `imprtl_prlt_manager` | Portal (Low-code) Portlet Administrator |
| `imr_log_manager` | IM-Repository Log Administrator |
| `imr_manager` | IM-Repository Administrator |
| `job_sche_manager` | Job Scheduler Administrator |
| `menu_manager` | Menu Administrator |
| `menu_operator` | Menu Operations Administrator |
| `portal_manager` | Portal Administrator |
| `role_manager` | Role Administrator |
| `tablemainte_manager` | TableMaintenance Administrator |
| `tenant_manager` | Tenant Administrator |
| `ticket_manager` | Ticket Administrator |
| `viewcreator_manager` | ViewCreator Administrator |

### Public Groups

| parameter / targetCode | Description |
|----------------------|-------------|
| `sample_public^sample_public` | Sample Public Group (top) |
| `sample_public^public_group_a` | Public Group A |
| `sample_public^public_group_b` | Public Group B |
| `sample_public^public_group_c` | Public Group C |
| `sample_public^public_group_d` | Public Group D |
| `sample_public^public_team_a` | Team A |
| `sample_public^public_team_b` | Team B |

### Roles (Public Group Roles)

No sample data.

---

## Logic Flow Type (IM-LogicDesigner Integration) (Verified with real export data)

A method to dynamically determine processing target users by executing an IM-LogicDesigner logic flow.
Complex logic such as DB lookups or external API calls can be implemented inside the flow.

### Suffix

| Suffix | targetType | parameter / targetCode format | Description |
|--------|-----------|------|------|
| `.logic_flow_user` | `logic_flow_user` | `{"flowId" : "<flowId>", "version" : null, "versionDecide" : false}` | Determine processing target users via an IM-LogicDesigner flow |

- `parameter` and `targetCode` are always **the same JSON string**
- `version`: `null` = use the latest version. Specify an integer to pin a specific version
- `versionDecide`: `false` = auto-determine version (latest). `true` = use the value in `version`

### Supported Extension Points (Confirmed with real data)

| Extension Point | pluginId |
|----------------|---------|
| `node.approve` (approval authority, dynamic) | `...node.approve.logic_flow_user` |
| `node.confirm` (confirm authority) | `...node.confirm.logic_flow_user` |
| `administrator.flow.handle` (reference users) | `...administrator.flow.handle.logic_flow_user` |

> ⚠️ `.logic_flow_user` for `node.apply` (apply authority) and `node.approve.static` (static approval) is unconfirmed in real data.

### XML Example

```xml
<!-- Approval authority (dynamic): previous node is a human node such as Apply -->
<extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve</extensionPointId>
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.logic_flow_user</pluginId>
<parameter type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</parameter>
<targetType type="string">logic_flow_user</targetType>
<targetCode type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</targetCode>

<!-- Confirm authority -->
<extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.confirm</extensionPointId>
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.confirm.logic_flow_user</pluginId>
<parameter type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</parameter>
<targetType type="string">logic_flow_user</targetType>
<targetCode type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</targetCode>

<!-- Reference users -->
<extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle</extensionPointId>
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle.logic_flow_user</pluginId>
<parameter type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</parameter>
<targetType type="string">logic_flow_user</targetType>
<targetCode type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</targetCode>
```

### Creating the Flow Definition

The flow used as a processing target must satisfy the following input/output specification.
For the creation procedure and spec.json template, refer to `.agents/skills/jssp-im-workflow-usage/assets/logic-flow-authority-plugin.md`.

**Input (all optional)**

| Property | Type | Description |
|----------|------|------|
| `imwMatterInfo` | object | Matter information |
| `imwMatterInfo.applyBaseDate` | string | Application reference date |
| `imwMatterInfo.contentsId` | string | Contents ID |
| `imwMatterInfo.contentsVersionId` | string | Contents version ID |
| `imwMatterInfo.flowId` | string | Flow ID |
| `imwMatterInfo.flowVersionId` | string | Flow version ID |
| `imwMatterInfo.nodeId` | string | Node ID |
| `imwMatterInfo.routeId` | string | Route ID |
| `imwMatterInfo.routeVersionId` | string | Route version ID |
| `imwMatterInfo.systemMatterId` | string | System matter ID |
| `imwMatterInfo.userDataId` | string | User data ID |
| `imwApplyAuthInfo` | object | Apply processing authority info |
| `imwApplyAuthInfo.userCd` | string | Applicant user code |
| `imwApplyAuthInfo.companyCd` | string | Applicant company code |
| `imwApplyAuthInfo.departmentSetCd` | string | Applicant department set code |
| `imwApplyAuthInfo.departmentCd` | string | Applicant department code |
| `imwBeforeNodeAuthInfo` | object | Previous node authority info |
| `imwBeforeNodeAuthInfo.userCd` | string | Previous processor user code |
| `imwBeforeNodeAuthInfo.companyCd` | string | Previous processor company code |
| `imwBeforeNodeAuthInfo.departmentSetCd` | string | Previous processor department set code |
| `imwBeforeNodeAuthInfo.departmentCd` | string | Previous processor department code |
| `imwBeforeNodeAuthInfo.nodeId` | string | Previous node ID |

**Output (required)**

| Property | Type | Description |
|----------|------|------|
| `userCds` | string[] (array) | Array of processing target user codes. Return `null` to indicate no authority (do not expand) |

> Source: [IM-Workflow Administrator Guide - Implementing Processing Target Plugin with Logic Flow](https://document.intra-mart.jp/library/iap/public/im_workflow/im_workflow_administrator_guide/texts/basic_guide/logic_flow/authority_plugin.html)
