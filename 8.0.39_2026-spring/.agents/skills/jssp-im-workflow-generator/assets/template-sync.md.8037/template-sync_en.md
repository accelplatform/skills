# Sync Route XML Template

## Overview

A workflow definition that processes multiple approval paths **in parallel simultaneously**.
Surround the parallel section with `Sync_Start` / `Sync_End` nodes, and **wait at Sync_End until all paths are complete**.
Difference from branch routes: Branch executes only 1 path matching a condition, while Sync executes all paths in parallel.

## Route Diagram

```
[Start] → [Apply] → [Sync_Start] ─┬─ [Approve_1] ─┬─ [Sync_End] → [End]
                                   └─ [Approve_2] ─┘
```

Multiple nodes can also be placed within a path:

```
[Start] → [Apply] → [Sync_Start] ─┬─ [Approve_A1] → [Approve_A2] ─┬─ [Sync_End] → [End]
                                   └─ [Approve_B1] ────────────────┘
```

## Usage Examples

- "Purchase application. Both the Finance Department and Legal Department approval are required (order does not matter)."
- "Business trip application. Supervisor and General Affairs Department approve in parallel."

## Parameters

In addition to the parameters of template-straight.md:

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| syncPaths | YES | Array of sync path definitions | See below |

### syncPaths Definition

```
[
  {
    name: "path_a",
    nodes: [
      { name_ja: "経理部長", name_en: "Finance Manager", targetType: "post", targetCode: "comp_sample_01^comp_sample_01^ps002" }
    ]
  },
  {
    name: "path_b",
    nodes: [
      { name_ja: "法務部長", name_en: "Legal Manager", targetType: "post", targetCode: "comp_sample_01^comp_sample_01^ps002" }
    ]
  }
]
```

## contents Section

Same as the straight route. Refer to template-straight.md.
Rules (branch conditions) are not needed for sync routes.

## route Section (Sync-specific Parts)

### Node Composition

Based on the straight route's route template, replace the nodes between Apply and End with the following.

#### Node Definitions (Sync Section)

The overall XML structure follows `sample-complete-branch.md`. The following are sync-specific node specifications.

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins |
|--------|----------|----------|-------------|------|------|---------|
| `{{name}}_sync_s` | Sync Start | nodeTyp_Sync_Start | system | Apply | First node of all paths | empty |
| `{{name}}_{{path}}_{{N}}` | {{nodeName}} | nodeTyp_Approve | human | Previous node (first: Sync_Start) | Next node (last: Sync_End) | Approval authority |
| `{{name}}_sync_e` | Sync End | nodeTyp_Sync_End | system | Last node of all paths | End | empty |

- Change Apply's nextNodeIds to `{{name}}_sync_s`, and End's previousNodeIds to `{{name}}_sync_e`
- Sync_Start / Sync_End traceId: `{{SYNC_TRACE_PREFIX}}-0.0`
- Path node traceId: `{{SYNC_TRACE_PREFIX}}-{path number}.{node number}` (path number starts at 1, node number also starts at 1)
- All nodes share: `startNodeFlag=false`, `endNodeFlag=false`, `routeTemplateId=null`, `routeTemplateName=null`, `parentNode=null`

### Calculating SYNC_TRACE_PREFIX

Same rules as for branch routes. The next value after the sequential number of the traceId of the node immediately before Sync_Start.

| Pattern | traceId of preceding node | SYNC_TRACE_PREFIX |
|---------|---------------------------|-------------------|
| Apply(0.1) → Sync_Start | `0.1` | `0.2` |
| Approve(0.2) → Sync_Start | `0.2` | `0.3` |

### Coordinate Calculation (Sync Route)

| Node | x coordinate | y coordinate |
|------|-------------|-------------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Sync_Start | Previous node.x + 110 | 50 |
| Path A node | Sync_Start.x + 180 + (n-1)*130 | 50 |
| Path B node | Sync_Start.x + 180 + (n-1)*130 | 190 |
| Path C node | Sync_Start.x + 180 + (n-1)*130 | 330 |
| Sync_End | max(all path nodes.x) + 120 | 50 |
| End | Sync_End.x + 80 | 50 |

For additional paths, shift y by +140 each time (50, 190, 330, 470, ...).

For coordinate wrapping rules, refer to template-straight.md (Route Designer: 10000 x 5000 px, wrap when x > 9500).

### nextNodeIds / previousNodeIds Rules

Difference from branch routes: **No direct path from Sync_Start → Sync_End is needed.**
Since all paths are executed in sync routes, "skip" paths do not exist.

`Sync_Start`'s `nextNodeIds`:
1. First node of path A
2. First node of path B
3. ...

`Sync_End`'s `previousNodeIds`:
1. Last node of path A
2. Last node of path B
3. ...

## flow Section (Sync-specific Parts)

Based on the same structure as the straight route, **also include Sync_Start and Sync_End nodes in the flow's `nodes`**.
Unlike branch routes, Sync_Start does not need details (rule linkage) / unions (path linkage).

### Flow Settings for Sync_Start / Sync_End

| nodeId | nodeType | Flags | details | attributes | unions |
|--------|----------|-------|---------|------------|--------|
| `{{name}}_sync_s` | `7` | All null | empty array | empty array | empty array |
| `{{name}}_sync_e` | `8` | All null | empty array | empty array | empty array |

"Flags" = lumpProcessFlag, attachFileFlag, autoProcessFlag, autoProcessLimitDay, autoProcessLimitType, autoPressFlag, autoPressLimitDay (all `type="null"`)

### Flow nodes Order

```
1. Apply node (nodeType=2)
2. Sync_Start node (nodeType=7) — details/unions/attributes all empty arrays
3. Each approval node (nodeType=3) — listed in order: path A, path B, ...
4. Sync_End node (nodeType=8) — details/unions/attributes all empty arrays
```

## Comparison with Branch Routes

| Item | Branch Route | Sync Route |
|------|-------------|------------|
| Node type | Branch_Start / Branch_End | Sync_Start / Sync_End |
| Executed paths | Only 1 path matching condition | All paths in parallel |
| Need for rules | Required (branch conditions) | Not required |
| contents rules | Register ruleIds | Empty array |
| Flow details/unions | Set in Branch_Start | Empty arrays |
| Direct path | Depends on conditions | None |
| traceId rules | Same | Same |

## Generation Checklist

- [ ] All items in template-straight.md checklist
- [ ] Sync_Start's nextNodeIds includes the first node of all paths
- [ ] Sync_End's previousNodeIds includes the last node of all paths
- [ ] Node connections within paths are correct (serial within path)
- [ ] Each path has a different Y coordinate (no overlap)
- [ ] Sync_Start and Sync_End have the same traceId value (identifying the pair)
- [ ] Path numbers in traceIds are unique for each path
- [ ] Flow's nodes includes Sync_Start (nodeType=7) and Sync_End (nodeType=8)
- [ ] Sync_Start / Sync_End's details, unions, attributes are all empty arrays
- [ ] rules / contents rules are not needed (sync routes have no conditional branching)
