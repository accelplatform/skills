# IM-Workflow Node Types / Plugin Reference

## Node Type List

### nodeType (in Route Definition)

| nodeType | Name | nodeVariety | Description |
|----------|------|-------------|-------------|
| nodeTyp_Start | Start | system | Route start node |
| nodeTyp_End | End | system | Route end node |
| nodeTyp_Apply | Apply | human | Application node |
| nodeTyp_Approve | Approve | human | Approval node (static / dynamic) |
| nodeTyp_Dynamic | Dynamic | human | Node where approver is determined dynamically |
| nodeTyp_Confirm | Confirm | human | Confirmation node (read-only, no approval authority) |
| nodeTyp_System | System | system | System node |
| nodeTyp_Horizontal | Horizontal | human | Horizontal layout approval node (sequential processing — 1 person at a time in placement order) |
| nodeTyp_Vertical | Vertical | human | Vertical layout approval node (parallel processing — all reached simultaneously, any order) |
| nodeTyp_Sync_Start | Sync Start | system | Start node for sync (parallel processing) |
| nodeTyp_Sync_End | Sync End | system | End node for sync (parallel processing). Waits for all paths to complete before merging. |
| nodeTyp_Branch_Start | Branch Start | system | Branch start node |
| nodeTyp_Branch_End | Branch End | system | Branch end node |
| nodeTyp_Template | Template Replace | human | Node that expands route templates |
| nodeTyp_Template_Start | Template Start | system | Template start node |
| nodeTyp_Template_End | Template End | system | Template end node |

### nodeType (Numeric Code)

Numeric codes used in flow definitions and plugins.
Source: `d.ts/workflow/enum/im-ssjs-node-type.d.ts`

| Numeric Code | Corresponding nodeType | Description |
|-------------|----------------------|-------------|
| 0 | nodeTyp_Start | Start node |
| 1 | nodeTyp_End | End node |
| 2 | nodeTyp_Apply | Application node |
| 3 | nodeTyp_Approve | Approval node |
| 4 | nodeTyp_Dynamic | Dynamic processing node |
| 5 | nodeTyp_System | System node |
| 6 | nodeTyp_Confirm | Confirmation node |
| 7 | nodeTyp_Sync_Start | Sync start node |
| 8 | nodeTyp_Sync_End | Sync end node |
| 9 | nodeTyp_Branch_Start | Branch start node |
| 10 | nodeTyp_Branch_End | Branch end node |
| 11 | nodeTyp_Horizontal | Horizontal layout node |
| 12 | nodeTyp_Vertical | Vertical layout node |
| 13 | nodeTyp_Template | Template replace node |
| 14 | nodeTyp_Template_Start | Template start node |
| 15 | nodeTyp_Template_End | Template end node |

---

## Authority Plugins

For details on authority plugin extension points, suffixes, targetType, parameter formats, and sample data,
refer to `reference/authority-plugins.md`.

### Common Patterns

**Application node (default):**
```
extensionPointId: ...node.apply
pluginId: ...apply.role
parameter: im_workflow_user
targetType: role
```

**Approval node (B-2: preceding is human node) — position specification example:**
```
extensionPointId: ...node.approve
pluginId: ...approve.post
parameter: comp_sample_01^comp_sample_01^ps003
targetType: post
```

**Approval node (B-1: preceding is system node) — position specification example:**
```
extensionPointId: ...node.approve.static
pluginId: ...approve.static.post
parameter: comp_sample_01^comp_sample_01^ps001
targetType: post
```

**Approval node (B-1) — role specification example:**
```
extensionPointId: ...node.approve.static
pluginId: ...approve.static.role
parameter: tenant_manager
targetType: role
```

**Approval node (B-1) — public group specification example:**
```
extensionPointId: ...node.approve.static
pluginId: ...approve.static.public_group
parameter: sample_public^public_group_a
targetType: publicGroup
```

**Confirmation node (organization):**
```
extensionPointId: ...node.confirm
pluginId: ...confirm.department
parameter: comp_sample_01^comp_sample_01^dept_sample_10
targetType: department
```

### Plugin Setting Notes

1. **Double writing required**: See the plugins specification in `reference/xml-structure.md` for details.
2. **Application node default**: Use the `im_workflow_user` role unless otherwise specified.
3. **Suffix / targetType details**: Refer to `reference/authority-plugins.md`.
4. **routePluginId naming**: `plg_{short name}_{sequential number}` format (**max 20 bytes**).
5. **Node naming in branch routes**: If the same position appears in multiple paths, append a path identifier (e.g., `Manager(A)`, `Manager(B)`).
6. **Node names (nodeName) use the same English name across all locales** (not localized).

---

## Node Connection Patterns

### Straight Route

```
Start → Apply → Approve1 → Approve2 → ... → End
```

- Each node's `previousNodeIds` and `nextNodeIds` have 1 element each.
- Number of Approve nodes is arbitrary.

### Branch Route

```
Start → Apply → Branch_Start ─┬─ Approve_A(A) ──────────── Branch_End → End
                               ├─ Approve_A(B) → Approve_B ┘
                               └─ Approve_A(C) → Approve_B → Approve_C ┘
```

- List first nodes of each branch path in `Branch_Start`'s `nextNodeIds`
- List last nodes of each branch path in `Branch_End`'s `previousNodeIds`
- Include the direct path from `Branch_Start` → `Branch_End` **only if there is a "no approval required, immediately end" path** (do not include when all paths require approval)
- If the same position appears in multiple paths, append a path identifier to the node name (e.g., `Manager(A)`, `Manager(B)`)

### Sync Route

```
Start → Apply → Sync_Start ─┬─ Approve_1 ─┬─ Sync_End → End
                             └─ Approve_2 ─┘
```

- Surround the parallel section with `nodeTyp_Sync_Start` / `nodeTyp_Sync_End` nodes
- Difference from branch routes: **Wait at Sync_End until all paths are complete** (branch executes only 1 path matching condition)
- Place independent approval nodes in each path
- Sync_Start / Sync_End have no plugins (system nodes)
- traceId follows the same rules as branch routes (same value for pairs, `{prefix}-{path number}.{node number}` within paths)

### Horizontal Layout Route (Sequential Approval)

```
Start → Apply → Horizontal → End
                 Approver 1 → Approver 2 → ... → Approver N
```

- Uses `nodeTyp_Horizontal` (nodeType=11) node
- Approvers process **1 at a time in placement order**
- Approvers inside horizontal node are configured via flow `attributes`

### Vertical Layout Route (Parallel Approval)

```
Start → Apply → Vertical → End
                 ├─ Approver 1
                 ├─ Approver 2 (all reached simultaneously, any order)
                 └─ Approver N
```

- Uses `nodeTyp_Vertical` (nodeType=12) node
- All approvers are **reached simultaneously** and process in **any order**. Wait until all approvers complete.
- Approvers inside vertical node are configured via flow `attributes`
- **When all-must-approve in any order**, use the sync node (Sync) or this vertical layout node.

---

## traceId Rules

For detailed numbering rules for traceId (including nested branches), refer to "traceId Rules" in `reference/xml-structure.md`.

Quick reference for basic patterns:

| Pattern | Meaning | Example |
|---------|---------|---------|
| `0.0` | Start / End | Start, End |
| `0.{N}` | Main line Nth node | Apply = `0.1` |
| `0.{N}-0.0` | Branch/Horizontal/Vertical node | Branch_Start/End, Horizontal, Vertical |
| `0.{N}-{M}.{K}` | Node inside branch path | M=path number(1+), K=node number(1+) |

---

## Flow Node attributes

Approval nodes inside branch routes need `attributes` set in the flow definition's `nodes`.

```xml
<attributes type="array">
  <value type="object">
    <no type="string">{{uniqueNo}}</no>
    <flowId type="string">{{flowId}}</flowId>
    <flowVersionId type="string">{{flowVersionId}}</flowVersionId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <routeVersionId type="string">{{routeVersionId}}</routeVersionId>
    <nodeId type="string">{{nodeId}}</nodeId>
    <localeId type="string">{{localeId}}</localeId>
    <attributeType type="string">1</attributeType>
    <attributeKey type="string">5</attributeKey>
    <value type="string">0</value>
  </value>
</attributes>
```

### `no` Field Numbering Rules

`no` is a unique identifier of 15 alphanumeric characters (`[0-9A-Za-z]`) (e.g., `5hx2qt35p8oslxo`).
For details, refer to "Random ID Generation Rules" in `reference/xml-structure.md`.
The same `no` is shared across locales.
If a node has multiple attributes entries, each entry has a different `no`.

### AttributeType (Attribute Types)

Official reference: https://api.intra-mart.jp/im_workflow_v72/com/imwCodeList.html

| Value | Code name | Description |
|-------|-----------|-------------|
| 0 | attrTyp_procTypName | Processing type name |
| 1 | attrTyp_procEnable | Processing prohibition (code name is "processing allow" but actually **prohibits** the specified processing type) |
| 2 | attrTyp_replaceRoute | Replace route |
| 3 | attrTyp_dispatchNodeMin | Assignable node count (minimum) |
| 4 | attrTyp_dispatchNodeMax | Assignable node count (maximum) |
| 5 | attrTyp_execUserSetNode | Processing target-configurable node |
| 6 | attrTyp_cnfmUserSetNode | Confirmation target-configurable node |
| 7 | attrTyp_branchCondition | Branch condition |
| 8 | attrTyp_unionCondition | Union condition |
| 9 | attrTyp_sendbackTargetNode | Return-to target node |
| 10 | attrTyp_branchSettableNodeSingular | Branch-settable node (singular) |
| 11 | attrTyp_branchSettableNodePlural | Branch-settable node (plural) |
| 12 | attrTyp_dynamicNodeDeleteDisable | Dynamic approval node deletion prohibition |
| 13 | attrTyp_pluginParameterDisable | Plugin setting (display prohibition) |

### AttributeKey (Attribute Keys)

The value of attributeKey varies depending on attributeType.
For specific values, refer to the official reference and exported XML.

When no specification is needed, set `NoSetting`.

| Value | Code name | Description |
|-------|-----------|-------------|
| NoSetting | attrKey_NoSetting | No setting (when attributeKey specification is not needed) |

For `attributeType=0` (processing type name) and `attributeType=1` (processing prohibition):
Specify the ProcessType code value for attributeKey.

| Value | Code name | Description |
|-------|-----------|-------------|
| 0 | procTyp_drf | Draft |
| 1 | procTyp_apy | Apply |
| 2 | procTyp_rapy | Re-apply |
| 3 | procTyp_dct | Cancel |
| 4 | procTyp_apr | Approve |
| 5 | procTyp_apre | Approval end |
| 6 | procTyp_deny | Deny |
| 7 | procTyp_rsv | Reserve (hold) |
| 8 | procTyp_rsvc | Cancel reserve |
| 9 | procTyp_pbk | Pull back |
| 10 | procTyp_sbk | Send back (return) |
| 11 | procTyp_cnfm | Confirm |
| 12 | procTyp_trans | Transfer |

### Standard Settings

- `attributeType=1` (processing prohibition), `attributeKey=5` (approval end), `value=0` is the standard setting for approval nodes (Approve/Horizontal/Vertical). It means prohibiting approval-end.

### Combining Horizontal / Vertical Nodes

Horizontal / Vertical nodes can also be placed in the middle of a straight route:

```
[Start] → [Apply] → [Approve1] → [Horizontal or Vertical] → [Approve3] → [End]
```

In this case, connect Horizontal / Vertical the same way as regular approval nodes.
