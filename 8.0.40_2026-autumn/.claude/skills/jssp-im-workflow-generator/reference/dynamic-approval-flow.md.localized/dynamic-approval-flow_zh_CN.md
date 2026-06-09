# 动态审批流（条件性多段审批）的选择指引

当**根据案件数据条件动态增减审批者的多段审批**时（例如「类别 A 仅需课长审批，B 需要课长+部长」「采购价格 10 万日元以上需追加部门经理审批」），**默认使用 `matterProperties` + `rules` + `branch_start` 节点**来表达（除非规格书另有明示）。

| 实现方式 | 用途 | 推荐度 |
|---|---|---|
| **`matterProperties` + `rules` + `branch_start`**（分支路线） | 按案件数据（金额・类别等）的条件切换审批路径 | **默认（无指示时采用）** |
| 在案件开始处理（`matter.start.process`）中动态切换审批者 | 难以用 matter_property 表达的复杂业务逻辑（如外部系统联动等） | 限定用途，仅当规格书明确指示时 |
| 自制审批者插件（MCP `resolveAuthority`） | 「2026/10/01 之后入职的用户」等无法以组织/职位/角色/公共组组合表达的自定义条件 | 限定用途 |

## 判断流程

1. 条件是否可用「案件输入数据（金额・类别・区分等）」表达？ → 是 → **采用分支路线（`matterProperties` + `rules`）**
2. 条件是否可用「组织・职位・角色・公共组」表达的审批者逻辑？ → 是 → 在常规审批节点上通过权限插件指定（无需分支）
3. 以上都不符合 → 案件开始处理或自定义插件

## 典型示例（采购价格 10 万日元以上时追加部门经理审批）

```jsonc
{
  "pattern": "branch",
  "nodes": [
    { "id": "start", "type": "start" },
    { "id": "apply", "type": "apply",
      "plugin": { "suffix": "role", "targetCode": "im_workflow_user" } },
    { "id": "01", "type": "approve", "name": "Manager",
      "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps002" } },
    { "id": "brs1", "type": "branch_start", "name": "BranchByAmount",
      "branchMethod": "rule",
      "paths": [
        { "condition": { "ruleId": "01" }, "nodes": ["02"] },   // 10 万以上：追加部门经理审批
        { "condition": { "ruleId": "02" }, "nodes": [] }        // 10 万以下：无追加审批
      ] },
    { "id": "02", "type": "approve", "name": "DepartmentManager",
      "plugin": { "suffix": "apply_user_one_step_upper_department_and_post", "targetCode": "ps002" } },
    { "id": "bre1", "type": "branch_end" },
    { "id": "end", "type": "end" }
  ],
  "matterProperties": [
    { "key": "purchasePrice", "type": "numeric",
      "names": { "en": "Purchase Price", "ja": "取得価格", "zh_CN": "采购价格" } }
  ],
  "rules": [
    { "id": "01", "property": "purchasePrice", "operator": ">=", "value": "100000",
      "names": { "en": "Price >= 100000", "ja": "取得価格10万円以上", "zh_CN": "采购价格不少于10万" } },
    { "id": "02", "property": "purchasePrice", "operator": "<",  "value": "100000",
      "names": { "en": "Price < 100000",  "ja": "取得価格10万円未満", "zh_CN": "采购价格不足10万" } }
  ]
}
```

示例参考：[examples/branch.spec.json](../examples/branch.spec.json)。
