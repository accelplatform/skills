# Vertical Layout (Parallel) Route XML Template

## Overview

A vertical layout route where multiple approvers process **simultaneously** (in parallel, in any order).
Nodes branch vertically and all approvals must be completed before proceeding.
Uses the `nodeTyp_Vertical` node, with the number of approvers set via `attributes` in the flow.
The number of approvers can be dynamically determined at flow configuration time.

For differences from horizontal layout (Horizontal) and node selection guide for unordered multi-approver scenarios, refer to the "Node Selection for Multiple Unordered Approvers" section in `SKILL.md`.

## Route Diagram

```
[Start] → [Apply] → [Vertical] → [End]
                      ├─ Approver 1 (parallel, unordered processing)
                      ├─ Approver 2
                      └─ Approver N
```

## Usage Examples

- "Purchase application. Three approvers approve in parallel using a vertical layout route."
- "Business trip application. All approvers approve in any order. The number of approvers varies per case."

## Parameters

In addition to the parameters of template-straight.md:

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| verticalName_ja | YES | Vertical node name (Japanese) | `並列承認` |
| verticalName_en | YES | Vertical node name (English) | `Parallel approval` |

## contents Section

Same as the straight route. Refer to template-straight.md.

## route Section (Vertical-specific Parts)

In a vertical layout route, place 1 `nodeTyp_Vertical` node between Apply and End.
Do not set plugins on the vertical node; approver assignment is done on the flow side.

#### Node Definition

The overall XML structure follows `sample-complete-branch.md`.

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins | x | traceId |
|--------|----------|----------|-------------|------|------|---------|----|---------|
| `{{name}}_start` | Start | nodeTyp_Start | system | (none) | apply | empty | 50 | 0.0 |
| `{{name}}_apply` | Apply | nodeTyp_Apply | human | start | vertical | Application authority | 160 | 0.1 |
| `{{name}}_vertical` | {{verticalNodeName}} | nodeTyp_Vertical | human | apply | end | **empty** | 260 | 0.2-0.0 |
| `{{name}}_end` | End | nodeTyp_End | system | vertical | (none) | empty | 360 | 0.0 |

- Vertical node's plugins are an **empty array** (approver assignment is done on the flow side)
- All nodes y=50

Write only the Apply plugins in the route-level `plugins` (the Vertical node does not need plugins).

### Coordinate Calculation (Vertical Layout Route)

| Node | x coordinate | y coordinate |
|------|-------------|-------------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Vertical | 260 | 50 |
| End | 360 | 50 |

For coordinate wrapping rules, refer to template-straight.md (Route Designer: 10000 x 5000 px, wrap when x > 9500).

## flow Section (Vertical-specific Parts)

For the vertical node's flow settings, set `nodeType` to `12` (Vertical) and use `attributes` to configure the number of approvers.

| nodeId | nodeType | Flags | details | unions |
|--------|----------|-------|---------|--------|
| `{{name}}_vertical` | `12` | All null | empty array | empty array |

#### attributes (1 entry only)

| Property | Value | Description |
|----------|-------|-------------|
| no | Random ID (15 chars, `[0-9A-Za-z]`) | Shared across locales |
| attributeType | `1` | Node attribute |
| attributeKey | `5` | Vertical layout approver count setting |
| value | `0` | Default (follows flow settings) |

Each attributes entry also includes `no`, `flowId`, `flowVersionId`, `contentsVersionId`, `routeVersionId`, `nodeId`, `localeId`.

For the no numbering rules and combination patterns with straight routes in attributes, refer to "Flow Node attributes" in `reference/node-types.md`.

## Generation Checklist

- [ ] All items in template-straight.md checklist
- [ ] Vertical node's nodeType is `nodeTyp_Vertical`
- [ ] Vertical node's plugins is an empty array
- [ ] Vertical node's nodeType is `12` within the flow's nodes
- [ ] attributes' no matches across locales
- [ ] attributes' attributeType / attributeKey / value are correct
