# Straight Route XML Template

## Overview

The simplest workflow definition.
A straight-line composition of `Start → Apply → Approve (one or more) → End`.

## Route Diagram

```
[Start] → [Apply] → [Approve1] → [Approve2] → ... → [End]
```

## Usage Examples

"Create a workflow definition for a purchase application. Straight route: application → section manager approval → department manager approval → complete."

## Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| name | YES | Workflow name (used for ID generation. **Adjust so that the version ID stays within 20 characters.** For long names, shorten the prefix to `cnt_`/`rte_`/`flw_`. See ID naming conventions in `reference/xml-structure.md` for details.) | `purchase` |
| short | YES | Shortened name for plugin IDs (so that `plg_{short}_NN` stays within 20 characters) | `purch` |
| flowName_ja | YES | Flow name (Japanese) | `購買申請` |
| flowName_en | YES | Flow name (English) | `Purchase Request` |
| flowName_zh | YES | Flow name (Chinese) | `采购申请` |
| contentsName_ja | NO | Contents name (defaults to flow name if omitted) | - |
| routeName_ja | NO | Route name (defaults to flow name if omitted) | - |
| screenBasePath | YES | Base path for the screen JSSP files (relative to `src/main/jssp/src/`). Specify the actual file location, not the routing URL. | `wf_purchase` |
| approveNodes | YES | Array of approval node definitions | See below |

### approveNodes Definition

```
[
  { nodeName: "Manager", targetType: "role", targetCode: "im_workflow_user" },
  { nodeName: "Director", targetType: "role", targetCode: "im_workflow_user" }
]
```

**Note:** Use a common English name for `nodeName` across all locales (no localization).

## Template

Strictly follow the overall XML structure (tag names, nesting, property order) of `assets/sample-complete-branch.md`.
Only the node composition, connections, coordinates, and flow settings specific to the straight route are described below.

### contents Section

Same structure as the contents section of `sample-complete-branch.md`. Replace only the following:

| Item | Value |
|------|-------|
| contentsId | `contents_{{name}}` |
| contentsVersionId | `contents_{{name}}_0` (blank) / `contents_{{name}}_1` (active) |
| contentsName | Name according to locale |
| pagePathId | `{{name}}_page_0` to `{{name}}_page_7` |
| scriptPath | See scriptPath mapping below |
| plugins | Empty array (rules not used in straight route) |
| rules | Empty array |

#### scriptPath Mapping

| pageType | scriptPath |
|----------|-----------|
| 0–3 (application) | `{{screenBasePath}}/apply/index` |
| 4 (process) | `{{screenBasePath}}/approve/index` |
| 5 (confirm) | `{{screenBasePath}}/confirm/index` |
| 6–7 (details) | `{{screenBasePath}}/detail/index` |

#### pageName Locale Mapping

| pageType | ja | en | zh_CN |
|----------|-----|-----|-------|
| 0 | 申請 | Apply | 申请 |
| 1 | 一時保存 | Temporary save | 临时保存 |
| 2 | 申請（処理） | Apply (task) | 申请（处理） |
| 3 | 再申請 | Re-apply | 重新申请 |
| 4 | 処理 | Process | 处理 |
| 5 | 確認 | Confirm | 确认 |
| 6 | 処理詳細 | Process details | 处理详细 |
| 7 | 参照詳細 | Refer details | 参照详细 |

---

### route Section

#### Node Definitions

| nodeId | nodeName | nodeType | nodeVariety | prev → next | plugins |
|--------|----------|----------|-------------|-------------|---------|
| `{{name}}_start` | Start | nodeTyp_Start | system | (none) → apply | empty |
| `{{name}}_apply` | Apply | nodeTyp_Apply | human | start → approve_1 | Application authority `plg_{{short}}_01` |
| `{{name}}_approve_{{N}}` | {{approveNodeName}} | nodeTyp_Approve | human | previous → next | Approval authority `plg_{{short}}_{{NN}}` |
| `{{name}}_end` | End | nodeTyp_End | system | last approve → (none) | empty |

- `{{N}}` is sequential from 1. `{{NN}}` is sequential from 02 (01 is for Apply).
- Start's `startNodeFlag` = `true`, End's `endNodeFlag` = `true`, others are both `false`.
- Start/End `traceId` = `0.0`, Apply = `0.1`, Approve_N = `0.{{N+1}}`

#### Plugin Settings

**Apply node:**

| Property | Value |
|----------|-------|
| routePluginId | `plg_{{short}}_01` |
| nodeType | `2` |
| extensionPointId | `jp.co.intra_mart.workflow.plugin.authority.node.apply` |
| pluginId | `jp.co.intra_mart.workflow.plugin.authority.node.apply.role` |
| parameter / targetCode | `im_workflow_user` |
| targetType | `role` |

**Approve nodes:**
- extensionPointId: preceding node is human → `approve`; preceding node is system → `approve.static`
- pluginId / parameter / targetType / targetCode: follow the "Default interpretation rules for approver instructions" in `reference/authority-plugins.md`
- **Also include the same content in the route-level plugins**

#### Coordinate Calculation

| Node | x | y |
|------|---|---|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Approve_N | 160 + N * 110 | 50 |
| End | 160 + (number of approvals + 1) * 110 | 50 |

#### Coordinate Wrapping

The Route Designer canvas size is **10000 x 5000 px**.
Wrap when the x coordinate exceeds 9500.

```
[Node1] → [Node2] → ... → [NodeN] →
                                     ↓
[NodeN+3] ← [NodeN+2] ← [NodeN+1] ←
↓
[NodeN+4] → [NodeN+5] → ...
```

Wrapping rules:
- If x exceeds 9500, wrap the next node
- At wrap time, y = max y of all nodes placed on that row + 50
- At wrap time, x resets to 50
- Odd rows go left→right, even rows go right→left (snake layout)

---

### flow Section

Same structure as the flow section in `sample-complete-branch.md`. Differences specific to the straight route are as follows.

#### Flow Settings (active version)

- `contentsId`: `contents_{{name}}`
- `routeId`: `route_{{name}}`
- `handleUsers`: Reference viewer settings (see `reference/xml-structure.md`. Optional.)
- `nodes`: Apply + each Approve node (Start/End are not included)

#### Flow Node Definitions

| nodeId | nodeType | attachFileFlag | details | attributes | unions |
|--------|----------|---------------|---------|------------|--------|
| `{{name}}_apply` | `2` | `2` | empty array | empty array | empty array |
| `{{name}}_approve_{{N}}` | `3` | `0` | empty array | empty array | empty array |

Common to all flow nodes:
- `lumpProcessFlag`: `1`
- `autoProcessFlag`: `0` / `autoProcessLimitDay`: null / `autoProcessLimitType`: `0`
- `autoPressFlag`: `0` / `autoPressLimitDay`: null
- `routeNode`: null

**In straight routes, details / attributes / unions are all empty arrays.**
Difference from branch routes: In branches, the Branch_Start flow node has details (rule linkage) / unions (path definitions) / attributes (branch method).

---

## Generation Checklist

- [ ] Satisfies the common rules in `reference/xml-structure.md` (3 locales, 2 versions, double plugin writing, ID naming conventions)
- [ ] IDs for contents / route / flow are consistent
- [ ] Node previousNodeIds / nextNodeIds are bidirectionally consistent
- [ ] Flow's contentsId / routeId match their respective definitions
- [ ] Flow's nodes contain correct contentsVersionId / routeVersionId
- [ ] X coordinates are not duplicated
