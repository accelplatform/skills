# Selecting the Pattern for Dynamic Approval Flows (Conditional Multi-Step Approval)

For multi-step approvals where the **set of approvers changes based on case data**, e.g., "Category A requires only the section chief; B requires section chief + director", or "Items priced ≥ ¥100,000 require an additional department manager approval", the **default representation is `matterProperties` + `rules` + a `branch_start` node** (use this unless the spec explicitly states otherwise).

| Approach | Use case | Recommendation |
|---|---|---|
| **`matterProperties` + `rules` + `branch_start`** (branch route) | Switch approval paths based on case data (amount, category, etc.) | **Default — pick this if not instructed otherwise** |
| Switch approvers dynamically in the matter start process (`matter.start.process`) | Complex business logic that is hard to express via matter_property (e.g., external system integration) | Restricted use, only when the spec explicitly instructs |
| Author a custom approver plugin (MCP `resolveAuthority`) | Custom conditions that cannot be expressed by organization / post / role / public group, e.g., "users hired after 2026/10/01" | Restricted use |

## Decision flow

1. Can the condition be expressed by "case input data" (amount, category, classification, etc.)? → Yes → **Use the branch route (`matterProperties` + `rules`)**
2. Can the condition be expressed by approver logic on organization / post / role / public group? → Yes → Specify it directly via the authority plugin on a regular approve node (no branch needed)
3. Neither → matter start process or a custom plugin

## Typical example (additional department manager approval when purchase price ≥ ¥100,000)

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
        { "condition": { "ruleId": "01" }, "nodes": ["02"] },   // ≥ 100,000: extra approval by department manager
        { "condition": { "ruleId": "02" }, "nodes": [] }        // < 100,000: no extra approval
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

See also: [examples/branch.spec.json](../examples/branch.spec.json).
