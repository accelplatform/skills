# Horizontal Layout (Sequential) Route XML Template

## Overview

A horizontal layout route where multiple approvers process in **order** (one at a time sequentially).
Nodes are connected in a single horizontal row and are approved from top to bottom in placement order.
Uses the `nodeTyp_Horizontal` node, with the number of approvers set via `attributes` in the flow.
The number of approvers can be dynamically determined at flow configuration time.

## Route Diagram

```
[Start] → [Apply] → [Horizontal] → [End]
                      Approver 1 → Approver 2 → ... → Approver N (processed in order)
```

## Usage Examples

- "Expense application. Three people—section manager, department manager, and general manager—approve in order using a horizontal layout route."
- "Board resolution application. The number of approvers varies per case, so it should be possible to add approvers dynamically."

## Parameters

In addition to the parameters of template-straight.md:

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| horizontalName_ja | YES | Horizontal node name (Japanese) | `順次承認` |
| horizontalName_en | YES | Horizontal node name (English) | `Sequential approval` |

## contents Section

Same as the straight route. Refer to template-straight.md.

## route Section (Horizontal-specific Parts)

In a horizontal layout route, place 1 `nodeTyp_Horizontal` node between Apply and End.
Do not set plugins on the horizontal node; approver assignment is done on the flow side.

#### Node Definition

The overall XML structure follows `sample-complete-branch.md`.

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins | x | traceId |
|--------|----------|----------|-------------|------|------|---------|----|---------|
| `{{name}}_start` | Start | nodeTyp_Start | system | (none) | apply | empty | 50 | 0.0 |
| `{{name}}_apply` | Apply | nodeTyp_Apply | human | start | horizontal | Application authority | 160 | 0.1 |
| `{{name}}_horizontal` | {{horizontalNodeName}} | nodeTyp_Horizontal | human | apply | end | **empty** | 260 | 0.2-0.0 |
| `{{name}}_end` | End | nodeTyp_End | system | horizontal | (none) | empty | 360 | 0.0 |

- Horizontal node's plugins are an **empty array** (approver assignment is done on the flow side)
- All nodes y=50

Write only the Apply plugins in the route-level `plugins` (the Horizontal node does not need plugins).

### Coordinate Calculation (Horizontal Layout Route)

| Node | x coordinate | y coordinate |
|------|-------------|-------------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Horizontal | 260 | 50 |
| End | 360 | 50 |

For coordinate wrapping rules, refer to template-straight.md (Route Designer: 10000 x 5000 px, wrap when x > 9500).

## flow Section (Horizontal-specific Parts)

For the horizontal node's flow settings, set `nodeType` to `11` (Horizontal) and use `attributes` to configure the number of approvers.

| nodeId | nodeType | Flags | details | unions |
|--------|----------|-------|---------|--------|
| `{{name}}_horizontal` | `11` | All null | empty array | empty array |

#### attributes (1 entry only)

| Property | Value | Description |
|----------|-------|-------------|
| no | Random ID (15 chars, `[0-9A-Za-z]`) | Shared across locales |
| attributeType | `1` | Node attribute |
| attributeKey | `5` | Horizontal layout setting |
| value | `0` | Default (follows flow settings) |

Each attributes entry also includes `no`, `flowId`, `flowVersionId`, `contentsVersionId`, `routeVersionId`, `nodeId`, `localeId`.

For the no numbering rules and combination patterns with straight routes in attributes, refer to "Flow Node attributes" in `reference/node-types.md`.

## Generation Checklist

- [ ] All items in template-straight.md checklist
- [ ] Horizontal node's nodeType is `nodeTyp_Horizontal`
- [ ] Horizontal node's plugins is an empty array
- [ ] Horizontal node's nodeType is `11` within the flow's nodes
- [ ] attributes' no matches across locales
- [ ] attributes' attributeType / attributeKey / value are correct
