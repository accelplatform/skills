# Branch Route XML Template

## Overview

A workflow definition where the approval path splits based on conditions.
Surround the branching section with `Branch_Start` / `Branch_End` nodes, and define multiple approval paths.
Common straight-line nodes can be placed before and after the branch. Nested branches (nesting) are also supported.

### Branch Evaluation Methods

There are 3 types of branch evaluation methods. Switch between them using the `attributes` (`attributeType=7`) of the Branch_Start node.

| Value of attributeType=7 | Branch Method | Description |
|--------------------------|---------------|-------------|
| `1` | **Automatic rule evaluation** | Automatically evaluates the matter property value using `rule` and proceeds to the matching path. Requires definitions for `matter_property` and `rule`. |
| `0` | **Processor selection** | The processor (applicant/approver) of the specified node selects the branch destination on screen during processing. `rule` / `matter_property` are not required. |
| `2` | **User program** | A server-side JS (branch condition program) returns `true`/`false` to determine the branch destination. Register the program in the `plugins` of contents and link it in the `details` of the flow. |

## Route Diagram

### Basic Form

```
                              ┌─ [Approve_A] ─────────────────┐
[Start] → [Apply] → [Branch_Start] ─ [Approve_B] → [Approve_C] → [Branch_End] → [End]
                              └─（Default: direct）──────────┘
```

### Common Node Before Branch

Common approvers across all paths can be placed before the branch.

```
[Start] → [Apply] → [Approve_Common] → [Branch_Start] ─┬─ ... ─ [Branch_End] → [End]
                                                        └─ ... ─┘
```

### Nested Branch

Further branches can be placed inside a branch path. Branch_Start / Branch_End must always be used in pairs.

```
[Start] → [Apply] → [Approve_A] → [Branch_Start_01] ─┬─(direct)─────────────────── [Branch_End_01] → [End]
                                                       └─ [Approve_B] → [Branch_Start_02] ─┬─(direct)── [Branch_End_02] ┘
                                                                                            └─ [Approve_C] ────────────┘
```

## Usage Examples

### Automatic Rule Evaluation

- "Expense application workflow. Under 100,000 yen requires section manager approval only; 100,000 yen or more requires section manager then department manager approval in order."
- "All cases go through section manager approval first; 500,000 yen or more also requires department manager approval; 1,000,000 yen or more requires department manager then general manager approval in order." (nested branch)

### Processor Selection

- "The applicant selects the branch destination."
- "During section manager approval, the section manager chooses the next path."
- "Allow branch selection at both application time and superior approval time."

### User Program

- "Determine the branch destination using a server-side program."
- "Control branching via a program based on database values."
- "Implement the branch condition in JS based on external system state."

## Achieving Compound Conditions (AND)

How to combine multiple conditions with AND depends on the **number of branch paths**.

### 2-way choice: 1 AND rule (no nested branch needed)

For **2-way choices** such as "additional approval if condition is met, skip otherwise," a single rule with `ruleUnionCondition=0` (AND combination) suffices. No nested branch is needed.

```
Branch_Start
  ├─ Condition A AND Condition B → Approver X → Branch_End
  └─ (direct: condition not met) → Branch_End
Branch_End → ...
```

Example: Add department manager approval only when `unitPrice > 20000 AND totalAmount > 100000`.

### 3 or more choices: Nested branch (separate a branch node per condition)

When conditions produce **3 or more different paths**, use nested branches.
Listing all pattern combinations as AND rules is poor maintainability; instead, make each branch node a single condition and combine them in a nested structure.

```
Branch1_Start (branch by condition A)
  ├─ conditionA=true → Branch2_Start (branch by condition B)
  │   ├─ conditionB=true → Approver X → Branch2_End
  │   └─ conditionB=false → (direct) → Branch2_End
  │ Branch2_End → Branch1_End
  └─ conditionA=false → (other process) → Branch1_End
Branch1_End → ...
```

- Keep each rule as a **single condition** (one comparison against one matter property)
- Express condition combinations using the nested branch structure
- Rules can be shared across multiple branch nodes (e.g., use the same `totalAmount >= 100000` rule in both Branch2 and Branch3)

For a complete sample, see `assets/sample-complete-branch.md`.

### Decision Criteria Summary

| Number of Branch Paths | Method | Rule Design |
|------------------------|--------|-------------|
| 2-way (match or skip) | Single branch | 1 AND rule |
| 3 or more (different processes for condition combinations) | Nested branch | Single-condition rule per branch |

## Parameters

In addition to the parameters of template-straight.md:

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| branches | YES | Array of branch path definitions | See below |

### branches Definition

```
[
  {
    name: "path_a",         // Path name (used for ID generation)
    nodes: [                // Array of approval nodes in the path
      { nodeName: "Manager", targetType: "role", targetCode: "im_workflow_user" }
    ]
  },
  {
    name: "path_b",
    nodes: [
      { nodeName: "Manager", targetType: "role", targetCode: "im_workflow_user" },
      { nodeName: "Director", targetType: "role", targetCode: "im_workflow_user" }
    ]
  }
]
```

**Note:** Use a common English name for `nodeName` across all locales (no localization).

## contents Section

Same as the straight route.
Refer to template-straight.md.

## route Section (Branch-specific Parts)

### Node Composition

Based on the straight route's route template, replace the nodes between Apply and End with the following.

#### Node Definitions (Branch Section)

The overall XML structure follows `sample-complete-branch.md`. The following are branch-specific node specifications.

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins |
|--------|----------|----------|-------------|------|------|---------|
| `{{name}}_branch_s` | Start branch | nodeTyp_Branch_Start | system | Apply | First node of each path | empty |
| `{{name}}_{{path}}_{{N}}` | {{nodeName}} | nodeTyp_Approve | human | Previous node (first: Branch_Start) | Next node (last: Branch_End) | Approval authority |
| `{{name}}_branch_e` | End branch | nodeTyp_Branch_End | system | Last node of each path | End | empty |

- Change Apply's nextNodeIds to `{{name}}_branch_s`, and End's previousNodeIds to `{{name}}_branch_e`
- Branch_Start / Branch_End traceId: `{{BRANCH_TRACE_PREFIX}}-0.0`
- Path node traceId: `{{BRANCH_TRACE_PREFIX}}-{path number}.{node number}` (path number starts at 1, node number also starts at 1)
- Path A y = 110, Path B y = 200
- All nodes share: `startNodeFlag=false`, `endNodeFlag=false`, `routeTemplateId=null`, `routeTemplateName=null`, `parentNode=null`

### Calculating BRANCH_TRACE_PREFIX

`BRANCH_TRACE_PREFIX` is the next value after the sequential number of the traceId of the node immediately before Branch_Start.

| Pattern | traceId of preceding node | BRANCH_TRACE_PREFIX |
|---------|---------------------------|---------------------|
| Apply → Branch_Start | `0.1` | `0.2` |
| Approve(0.2) → Branch_Start | `0.2` | `0.3` |
| Nested: outer path 2 node 1(0.3-2.1) → inner Branch_Start | `0.3-2.1` | `0.3-2.2` |

### Coordinate Calculation (Branch Route)

| Node | x coordinate | y coordinate |
|------|-------------|-------------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Common node before branch | 160 + N * 110 | 50 |
| Branch_Start | Previous node.x + 110 | 50 |
| Path A node | Branch_Start.x + 180 + (n-1)*130 | 110 |
| Path B node | Branch_Start.x + 110 + (n-1)*130 | 200 |
| Branch_End | max(all branch nodes.x) + 120 | 50 |
| End | Branch_End.x + 80 | 50 |

For coordinate wrapping rules, refer to template-straight.md (Route Designer: 10000 x 5000 px, wrap when x > 9500).

### nextNodeIds Order Rules

`Branch_Start`'s `nextNodeIds`:
1. First node of path A
2. First node of path B
3. ... (for additional paths)
4. Add `Branch_End` **only if there is a "no approval required, immediately end" path**

`Branch_End`'s `previousNodeIds`:
1. Last node of each branch path
2. Add `Branch_Start` **only if there is a "no approval required, immediately end" path**

**Decision criteria:** If every branch path has at least one approval node, a direct path from `Branch_Start` → `Branch_End` is not needed.
Only include the direct path when there is a path like "pass through without approval if condition is not met."

## flow Section (Branch-specific Parts)

Based on the same structure as the straight route, **also include Branch_Start and Branch_End nodes in the flow's `nodes`**.
Set `details` (rule linkage), `unions` (path linkage), and `attributes` in the Branch_Start node.

### Flow Settings for Branch_Start Node

```xml
<value type="object">
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <nodeType type="string">9</nodeType>
  <lumpProcessFlag type="null" />
  <attachFileFlag type="null" />
  <autoProcessFlag type="null" />
  <autoProcessLimitDay type="null" />
  <autoProcessLimitType type="null" />
  <autoPressFlag type="null" />
  <autoPressLimitDay type="null" />
  <localeId type="string">{{localeId}}</localeId>
  <!-- details: mapping of rules to branch paths (repeat for each branch path) -->
  <details type="array">
    {{BRANCH_DETAILS}}
  </details>
  <!-- attributes: branch node attributes -->
  <attributes type="array">
    <!-- attributeType=7: branch method (1=automatic rule / 0=processor selection) -->
    <value type="object">
      <no type="string">{{uniqueNo_attr}}</no>
      <flowId type="string">flow_{{name}}</flowId>
      <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
      <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
      <routeVersionId type="string">route_{{name}}_1</routeVersionId>
      <nodeId type="string">{{name}}_branch_s</nodeId>
      <localeId type="string">{{localeId}}</localeId>
      <attributeType type="string">7</attributeType>
      <attributeKey type="string">NoSetting</attributeKey>
      <value type="string">1</value>
    </value>
    <!-- Only for processor selection method: add attributeType=11 entries for each selectable node -->
    {{BRANCH_SELECT_NODE_ATTRIBUTES}}
  </attributes>
  <!-- unions: mapping of rules to branch destination nodes (repeat for each branch path) -->
  <unions type="array">
    {{BRANCH_UNIONS}}
  </unions>
  <routeNode type="null" />
</value>
```

### details Elements

Each details element defines "when which condition is satisfied."
The `cooperationType` and `cooperationId` differ depending on the branch method.

#### Automatic Rule Evaluation (cooperationType=19) — 1 per branch path

```xml
<value type="object">
  <no type="string">{{uniqueNo_detail}}</no>
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <cooperationType type="string">19</cooperationType>
  <cooperationClassify type="string">2</cooperationClassify>
  <cooperationId type="string">{{ruleId}}</cooperationId>
  <emptyFlag type="string">0</emptyFlag>
</value>
```

| Property | Value | Description |
|----------|-------|-------------|
| no | Random ID (15 chars, `[0-9A-Za-z]`) | Unique ID (corresponds to `branchUnionId` in unions) |
| cooperationType | `19` | Branch rule type (fixed value) |
| cooperationClassify | `2` | Rule classification (fixed value) |
| cooperationId | `rule_xxx` | **ruleId in the rule section to link** |
| emptyFlag | `0` | Empty flag (fixed value) |

#### User Program Method (cooperationType=4) — 1 per program

```xml
<value type="object">
  <no type="string">{{uniqueNo_detail}}</no>
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <cooperationType type="string">4</cooperationType>
  <cooperationClassify type="string">0</cooperationClassify>
  <cooperationId type="string">{{contentsPluginId}}</cooperationId>
  <emptyFlag type="string">0</emptyFlag>
</value>
```

| Property | Value | Description |
|----------|-------|-------------|
| no | Random ID (15 chars, `[0-9A-Za-z]`) | Unique ID (corresponds to `branchUnionId` in unions) |
| cooperationType | `4` | **User program type** |
| cooperationClassify | `0` | Program classification |
| cooperationId | `{{contentsPluginId}}` | **`contentsPluginId` of the branch condition plugin registered in contents plugins** |
| emptyFlag | `0` | Empty flag (fixed value) |

### unions Elements (1 per branch path)

Each unions element defines "which path to proceed to when a rule is satisfied."

```xml
<value type="object">
  <branchUnionId type="string">{{uniqueNo_detail}}</branchUnionId>
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <branchUnionGroupId type="string">{{uniqueNo_group}}</branchUnionGroupId>
  <branchUnionGroupClassify type="string">0</branchUnionGroupClassify>
  <countTrue type="string">1</countTrue>
  <countTargetNodeId type="string">{{pathFirstNodeId}}</countTargetNodeId>
</value>
```

| Property | Value | Description |
|----------|-------|-------------|
| branchUnionId | **Same value** as details' `no` | Key for linking to details |
| branchUnionGroupId | Random ID (15 chars, `[0-9A-Za-z]`) | Group ID (unique value differing per union) |
| branchUnionGroupClassify | `0` | Group classification (fixed value) |
| countTrue | `1` | Count condition (fixed value) |
| countTargetNodeId | e.g., `expense_a_01` | **First node ID of the branch destination path** |

### Linkage Between details and unions

```
details[0].no ─────────────── = unions[0].branchUnionId
details[0].cooperationId      = rule_01 (rule ID)
unions[0].countTargetNodeId   = expense_a_01 (first node of path A)

details[1].no ─────────────── = unions[1].branchUnionId
details[1].cooperationId      = rule_02 (rule ID)
unions[1].countTargetNodeId   = expense_b_01 (first node of path B)
```

**Important:** Setting `details[n].no` and `unions[n].branchUnionId` to the same value establishes the "rule → branch destination" mapping.

### attributes Specification

Set the following attributes in the Branch_Start node's attributes.

#### attributeType=7 (attrTyp_branchCondition: Branch Condition) — Required, 1 entry

| Property | Value | Description |
|----------|-------|-------------|
| attributeType | `7` | Branch condition |
| attributeKey | `NoSetting` | Fixed value |
| value | `1` = Automatic rule / `0` = Processor selection / `2` = User program | Branch evaluation method |

#### attributeType=11 (attrTyp_branchSettableNodePlural: Branch-Selectable Node) — Processor selection only

Added when using processor selection method (`attributeType=7` with `value=0`).
Repeat entries for each node where the branch destination should be selectable.

| Property | Value | Description |
|----------|-------|-------------|
| attributeType | `11` | Branch-selectable node (plural) |
| attributeKey | `NoSetting` | Fixed value |
| value | Node ID (e.g., `expense_apply`) | **nodeId of the node from which branch selection is allowed** |

For the full list of AttributeType / AttributeKey codes, see the "AttributeType (Attribute Types)" section of `reference/node-types.md`.

```xml
<!-- Example attributes for processor selection method -->
<attributes type="array">
  <!-- Branch method: processor selection -->
  <value type="object">
    <no type="string">{{uniqueNo_attr_1}}</no>
    ...（flowId/flowVersionId/contentsVersionId/routeVersionId/nodeId/localeId are common）
    <attributeType type="string">7</attributeType>
    <attributeKey type="string">NoSetting</attributeKey>
    <value type="string">0</value>
  </value>
  <!-- Selectable node 1: application node -->
  <value type="object">
    <no type="string">{{uniqueNo_attr_2}}</no>
    ...
    <attributeType type="string">11</attributeType>
    <attributeKey type="string">NoSetting</attributeKey>
    <value type="string">{{name}}_apply</value>
  </value>
  <!-- Selectable node 2: immediately preceding approval node -->
  <value type="object">
    <no type="string">{{uniqueNo_attr_3}}</no>
    ...
    <attributeType type="string">11</attributeType>
    <attributeKey type="string">NoSetting</attributeKey>
    <value type="string">{{name}}_approve_1</value>
  </value>
</attributes>
```

#### no Numbering Rules

`no` is a random ID (15 chars, `[0-9A-Za-z]`) shared across locales (a different value from the details/unions `no`).
The attributeType=7 entry and each attributeType=11 entry each have a different `no`.

### Flow Settings for Branch_End Node

Branch_End nodes are included in the flow's `nodes`, but details / unions / attributes are all empty arrays.

| nodeId | nodeType | Flags | details | attributes | unions |
|--------|----------|-------|---------|------------|--------|
| `{{name}}_branch_e` | `10` | All null | empty array | empty array | empty array |

"Flags" = lumpProcessFlag, attachFileFlag, autoProcessFlag, autoProcessLimitDay, autoProcessLimitType, autoPressFlag, autoPressLimitDay (all `type="null"`)

### Flow nodes Order

```
1. Apply node (nodeType=2)
2. Branch_Start node (nodeType=9) — with details/unions/attributes
3. Each approval node (nodeType=3) — listed in order: path A, path B, ...
4. Branch_End node (nodeType=10) — details/unions/attributes are empty
```

---

## Integration with matter_property / rule (Automatic Rule Evaluation Only)

In **automatic rule evaluation** (`attributeType=7` with `value=1`), which path to take is controlled by `rule` based on matter property values.
`matter_property` and `rule` are placed at the same level as contents / route / flow, directly under `<data>`.

In **processor selection** (`attributeType=7` with `value=0`), `matter_property` / `rule` / `details` / `unions` are not required.
However, `details` and `unions` should still contain entries for the number of branch paths rather than being empty arrays (the rule IDs can be arbitrary values).

### Example: Branching by Amount

Prompt: "Under 100,000 yen requires section manager approval only; 100,000 yen or more requires section manager then department manager approval."

Required definitions:
1. **matter_property**: `item_total` (total amount, numeric type)
2. **rule_01**: total amount < 100000 (path A: section manager only)
3. **rule_02**: total amount >= 100000 (path B: section manager → department manager)

For the XML structure of matter_property / rule, follow `sample-complete-branch.md`. Only the configuration values are shown below.

#### matter_property Definition

| matterPropertyKey | matterPropertyName (ja/en/zh_CN) | matterPropertyModelType | matterPropertyTypeRule |
|-------------------|----------------------------------|------------------------|----------------------|
| `item_total` | 合計金額 / Total amount / 合计金额 | `1` (numeric) | `1` (used in rule conditions) |

Other properties (matterPropertyTypeListPattern, etc.) use the same default values as the sample.

#### rule Definition

| ruleId | ruleName (ja) | compareRuleId | compareVariable | conditionValue |
|--------|--------------|---------------|-----------------|---------------|
| `rule_01` | 合計金額：100000未満 | `8` (less than) | `item_total` | `100000` |
| `rule_02` | 合計金額：100000以上 | `7` (greater or equal) | `item_total` | `100000` |

- `ruleUnionCondition`: `0` (AND combination)
- `conditionValueType`: `0` (fixed value)
- `ruleDetailModel.no`: `{ruleId}_1` format
- Localize `ruleName` for en / zh_CN as well

### Notes

- Unless `matter_property`'s `matterPropertyTypeRule` is set to `1`, it cannot be used as a condition variable in rules.
- `compareVariable` must match the `matterPropertyKey` of the `matter_property`.
- The linkage between rules and paths is done in the **Branch_Start node of the flow definition** (`details` + `unions`). This is self-contained in the XML import, so no manual configuration in the management console is needed.
- For numeric comparisons, set `matterPropertyModelType` to `1` (numeric).

---

## Additional Settings for User Program Method (attributeType=7 value=2)

In the **user program method**, a server-side JS (branch condition program) determines the branch destination.
For program implementation, refer to `simple-rule-condition.md` in `jssp-im-workflow-usage`.
The path where the program's `execute(parameter)` returns `data: true` is followed.

### 1. Register the Branch Condition Plugin in contents plugins

Add 1 entry per branch condition program to the `plugins` array of the **active version** of contents.

```xml
<plugins type="array">
  <!-- Existing action process plugins (if any) -->
  ...
  <!-- Branch condition program 1 -->
  <value type="object">
    <contentsPluginId type="string">{{contentsPluginId_rule1}}</contentsPluginId>
    <localeId type="string">{{localeId}}</localeId>
    <contentsId type="string">{{contentsId}}</contentsId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule</exPointId>
    <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor</pluginId>
    <pluginName type="string">{{pluginName}}</pluginName>
    <parameter type="string">{{ruleScriptPath}}</parameter>
    <nodeType type="string" />
    <defaultFlag type="string">0</defaultFlag>
    <executeOrder type="string">{{executeOrder}}</executeOrder>
    <note type="string" />
  </value>
  <!-- Branch condition program 2 (for multiple paths) -->
  ...
</plugins>
```

| Property | Value | Description |
|----------|-------|-------------|
| contentsPluginId | Random ID (15 chars, `[0-9A-Za-z]`) | Unique ID. Referenced as `cooperationId` in the flow's details. |
| exPointId | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` | **Extension point for branch condition plugin** |
| pluginId | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor` | **Script execution plugin** |
| pluginName | Any name | Plugin display name |
| parameter | JSSP file path (without extension) | Path to the branch condition program (e.g., `wf_expense/rule/rule01`) |
| nodeType | Empty string | Node type is not specified for branch condition plugins |
| defaultFlag | `0` | Default flag (fixed at `0`) |
| executeOrder | `0`, `1`, ... | Execution order (sequential from 0, per plugin) |

### 2. Link to flow details with cooperationType=4

Add a `cooperationType=4` entry per branch condition program to the `details` of the Branch_Start node.
Set `cooperationId` to the `contentsPluginId` from contents.

### 3. Link paths in flow unions

Specify the destination node when the program returns `true` using the unions entry corresponding to the `cooperationType=4` details entry.

### Linkage Between details and unions (User Program Method)

```
details[0].no ─────────────── = unions[0].branchUnionId
details[0].cooperationType    = 4 (user program)
details[0].cooperationId      = {{contentsPluginId_rule1}} (contents plugin ID)
unions[0].countTargetNodeId   = expense_president (first node of path A)

details[1].no ─────────────── = unions[1].branchUnionId
details[1].cooperationType    = 4 (user program)
details[1].cooperationId      = {{contentsPluginId_rule2}} (contents plugin ID)
unions[1].countTargetNodeId   = expense_branch_e (path B = direct connection without approval)
```

## Generation Checklist

### Common (Both Methods)

- [ ] All items in template-straight.md checklist
- [ ] Branch_Start's nextNodeIds includes the first node of all paths
- [ ] Branch_End's previousNodeIds includes the last node of all paths
- [ ] Node connections within branch paths are correct (serial within path)
- [ ] Each path has a different Y coordinate (no overlap)
- [ ] Path numbers in traceIds are unique per branch
- [ ] Branch_Start and Branch_End have the same traceId value (identifying the pair)
- [ ] For nested branches, the inner traceId prefix continues from the outer path's sequential number
- [ ] Flow's nodes includes Branch_Start (nodeType=9) and Branch_End (nodeType=10)
- [ ] Number of Branch_Start's details = number of unions = number of branch paths
- [ ] details' `no` and unions' `branchUnionId` correspond 1:1
- [ ] unions' `countTargetNodeId` references the first node ID of each path
- [ ] attributes has 1 entry with `attributeType=7`

### Automatic Rule Evaluation (attributeType=7 value=1) Additional Checks

- [ ] details' `cooperationId` references the correct ruleId
- [ ] matter_property's matterPropertyTypeRule is set to `1`
- [ ] rule's compareVariable matches the matter_property key
- [ ] rules are provided for all 3 locales
- [ ] All used ruleIds are registered in the contents rules array

### Processor Selection (attributeType=7 value=0) Additional Checks

- [ ] attributes has `attributeType=11` entries equal to the number of nodes where branch selection is allowed
- [ ] `attributeType=11`'s `value` references the correct node IDs (Apply/Approve)
- [ ] The specified nodes are positioned before Branch_Start

### User Program Method (attributeType=7 value=2) Additional Checks

- [ ] Branch condition programs are registered in contents plugins (`exPointId` = `jp.co.intra_mart.workflow.plugin.event.node.branch.rule`)
- [ ] plugins' `contentsPluginId` is shared across locales
- [ ] flow's details has `cooperationType=4` entries equal to the number of branch condition programs
- [ ] details' `cooperationId` matches the `contentsPluginId` of contents plugins
- [ ] unions' `countTargetNodeId` references the branch destination node ID corresponding to each program
- [ ] Branch condition program (.js) implementation conforms to `simple-rule-condition.md` in `jssp-im-workflow-usage`
