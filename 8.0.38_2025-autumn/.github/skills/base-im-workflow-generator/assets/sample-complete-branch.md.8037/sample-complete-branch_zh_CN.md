# 嵌套分支路由完整示例 XML

## 概述

IM-Workflow 导入用 XML 的**完整示例**。
以实际导入成功的嵌套分支路由定义（商品发注申请）为基础，展示其结构。

**新建 XML 时，必须严格遵循本示例的结构（标签名、嵌套、属性顺序）。**
禁止使用自定义标签名或属性名。

## 路由结构

```
Start -> Apply -> Dept.Approve(01) -> Manager(02) -> Branch1_Start（按单价分支）
  +- unitPrice<20000 -> Branch2_Start（按合计金额分支）
  |   +- totalAmount<100000 -> （直行）Branch2_End
  |   +- totalAmount>=100000 -> President -> Branch2_End
  | Branch2_End -> Branch1_End
  +- unitPrice>=20000 -> Director -> Branch3_Start（按合计金额分支）
      +- totalAmount<100000 -> （直行）Branch3_End
      +- totalAmount>=100000 -> President -> Branch3_End
    Branch3_End -> Branch1_End
Branch1_End -> End
```

## 节点列表

| nodeId | nodeName | nodeType | 说明 |
|--------|----------|----------|------|
| prd_ord_start | Start | nodeTyp_Start | 开始 |
| prd_ord_apply | Apply | nodeTyp_Apply | 申请 |
| prd_ord_01 | Dept. Approve | nodeTyp_Approve | 同部门审批 |
| prd_ord_02 | Manager | nodeTyp_Approve | 课长审批 |
| prd_ord_brs1 | Start branch | nodeTyp_Branch_Start | 分支1（单价） |
| prd_ord_brs2 | Start branch | nodeTyp_Branch_Start | 分支2（合计金额，unitPrice<20000时） |
| prd_ord_prs1 | President | nodeTyp_Approve | 社长（unitPrice<20000 且 totalAmount>=100000） |
| prd_ord_bre2 | End branch | nodeTyp_Branch_End | 分支2结束 |
| prd_ord_dir | Director | nodeTyp_Approve | 部长（unitPrice>=20000） |
| prd_ord_brs3 | Start branch | nodeTyp_Branch_Start | 分支3（合计金额，unitPrice>=20000时） |
| prd_ord_prs2 | President | nodeTyp_Approve | 社长（unitPrice>=20000 且 totalAmount>=100000） |
| prd_ord_bre3 | End branch | nodeTyp_Branch_End | 分支3结束 |
| prd_ord_bre1 | End branch | nodeTyp_Branch_End | 分支1结束 |
| prd_ord_end | End | nodeTyp_End | 结束 |

## 规则列表

| ruleId | 条件 | 使用位置 |
|--------|------|---------|
| rule_prd_ord_01 | unitPrice < 20000 | Branch1: 路径A |
| rule_prd_ord_02 | unitPrice >= 20000 | Branch1: 路径B |
| rule_prd_ord_03 | totalAmount < 100000 | Branch2/Branch3: 直行路径 |
| rule_prd_ord_04 | totalAmount >= 100000 | Branch2/Branch3: 社长路径 |

## 注意事项

- **节点名称（nodeName）不做多语言处理。** 所有语言环境使用相同的英文名称。
- 规则名称（ruleName）需做多语言处理。但英文名称中包含 `<` `>` 时，必须转义为 `&lt;` `&gt;`。
- 每条规则设为单一条件，通过嵌套分支结构来实现复合条件。
- 嵌套分支的 traceId 会层级递增（例：`0.4-1.1-0.0`，`0.4-1.1-2.1`）。

## XML 整体结构

由于 3 个语言环境（en、ja、zh_CN）的重复部分结构相同，以下仅列出 **en 语言环境的 1 条记录**。
ja / zh_CN 仅 `localeId` 和各名称不同，其余部分（ID、结构、插件设置、节点名）与 en 完全相同。

### 各语言环境名称对照表

生成时请参照以下对照表，为 ja / zh_CN 语言环境设置名称。

| 字段 | en | ja | zh_CN |
|------|----|----|-------|
| contentsName | Product Order | 商品発注 | 产品订单 |
| routeName | Product Order | 商品発注 | 产品订单 |
| flowName | Product Order | 商品発注 | 产品订单 |

| 字段（pageName） | en | ja | zh_CN |
|----------------|----|----|-------|
| pageType 0 | Apply | 申請 | 申请 |
| pageType 1 | Temporary save | 仮保存 | 临时保存 |
| pageType 2 | Apply (task) | 申請（タスク） | 申请（任务） |
| pageType 3 | Re-apply | 再申請 | 重新申请 |
| pageType 4 | Process | 処理 | 处理 |
| pageType 5 | Confirm | 確認 | 确认 |
| pageType 6 | Process details | 処理内容 | 处理内容 |
| pageType 7 | Refer details | 参照内容 | 参考内容 |

| 字段（matterPropertyName） | en | ja | zh_CN |
|--------------------------|----|----|-------|
| unitPrice | Unit Price | 単価 | 单价 |
| totalAmount | Total Amount | 合計金額 | 合计金额 |

| 字段（ruleName） | en | ja | zh_CN |
|----------------|----|----|-------|
| rule_prd_ord_01 | UnitPrice less than 20000 | 単価20000未満 | 单价不足20000 |
| rule_prd_ord_02 | UnitPrice 20000 or more | 単価20000以上 | 单价20000以上 |
| rule_prd_ord_03 | Total less than 100000 | 合計100000未満 | 合计不足100000 |
| rule_prd_ord_04 | Total 100000 or more | 合計100000以上 | 合计100000以上 |

```xml
<?xml version="1.0" encoding="UTF-16"?>
