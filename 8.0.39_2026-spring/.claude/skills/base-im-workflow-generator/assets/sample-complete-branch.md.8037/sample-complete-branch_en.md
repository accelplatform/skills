# Nested Branch Route Complete Sample XML

## Overview

A **complete sample** of the import XML for IM-Workflow.
Based on a nested branch route definition (product order application) that was successfully imported, this document shows the structure.

**When generating new XML, strictly follow the structure (tag names, nesting, property order) of this sample.**
Do not use custom tag names or property names.

## Route Structure

```
Start -> Apply -> Dept.Approve(01) -> Manager(02) -> Branch1_Start (branch by unit price)
  +- unitPrice<20000 -> Branch2_Start (branch by total amount)
  |   +- totalAmount<100000 -> (direct) Branch2_End
  |   +- totalAmount>=100000 -> President -> Branch2_End
  | Branch2_End -> Branch1_End
  +- unitPrice>=20000 -> Director -> Branch3_Start (branch by total amount)
      +- totalAmount<100000 -> (direct) Branch3_End
      +- totalAmount>=100000 -> President -> Branch3_End
    Branch3_End -> Branch1_End
Branch1_End -> End
```

## Node List

| nodeId | nodeName | nodeType | Description |
|--------|----------|----------|-------------|
| prd_ord_start | Start | nodeTyp_Start | Start |
| prd_ord_apply | Apply | nodeTyp_Apply | Application |
| prd_ord_01 | Dept. Approve | nodeTyp_Approve | Same-department approval |
| prd_ord_02 | Manager | nodeTyp_Approve | Section manager approval |
| prd_ord_brs1 | Start branch | nodeTyp_Branch_Start | Branch 1 (unit price) |
| prd_ord_brs2 | Start branch | nodeTyp_Branch_Start | Branch 2 (total amount, when unitPrice<20000) |
| prd_ord_prs1 | President | nodeTyp_Approve | President (unitPrice<20000 and totalAmount>=100000) |
| prd_ord_bre2 | End branch | nodeTyp_Branch_End | Branch 2 end |
| prd_ord_dir | Director | nodeTyp_Approve | Director (unitPrice>=20000) |
| prd_ord_brs3 | Start branch | nodeTyp_Branch_Start | Branch 3 (total amount, when unitPrice>=20000) |
| prd_ord_prs2 | President | nodeTyp_Approve | President (unitPrice>=20000 and totalAmount>=100000) |
| prd_ord_bre3 | End branch | nodeTyp_Branch_End | Branch 3 end |
| prd_ord_bre1 | End branch | nodeTyp_Branch_End | Branch 1 end |
| prd_ord_end | End | nodeTyp_End | End |

## Rule List

| ruleId | Condition | Usage |
|--------|-----------|-------|
| rule_prd_ord_01 | unitPrice < 20000 | Branch1: Path A |
| rule_prd_ord_02 | unitPrice >= 20000 | Branch1: Path B |
| rule_prd_ord_03 | totalAmount < 100000 | Branch2/Branch3: Direct path |
| rule_prd_ord_04 | totalAmount >= 100000 | Branch2/Branch3: President path |

## Notes

- **Node names (nodeName) are not localized.** Use the same English name across all locales.
- Rule names (ruleName) are localized. However, if English names contain `<` or `>`, escape them as `&lt;` and `&gt;`.
- Keep each rule as a single condition; combine them using nested branches to achieve compound conditions.
- traceIds for nested branches grow hierarchically (e.g., `0.4-1.1-0.0`, `0.4-1.1-2.1`).

## Full XML Structure

Since the repetition across 3 locales (en, ja, zh_CN) has the same structure, only **1 entry for the en locale** is shown below.
For ja / zh_CN, only the `localeId` and each name differ; everything else (IDs, structure, plugin settings, node names) is identical to en.

### Locale-specific Name Mapping Table

When generating, refer to the table below to set names for the ja / zh_CN locales.

| Field | en | ja | zh_CN |
|-------|----|----|-------|
| contentsName | Product Order | 商品発注 | 产品订单 |
| routeName | Product Order | 商品発注 | 产品订单 |
| flowName | Product Order | 商品発注 | 产品订单 |

| Field (pageName) | en | ja | zh_CN |
|-----------------|----|----|-------|
| pageType 0 | Apply | 申請 | 申请 |
| pageType 1 | Temporary save | 仮保存 | 临时保存 |
| pageType 2 | Apply (task) | 申請（タスク） | 申请（任务） |
| pageType 3 | Re-apply | 再申請 | 重新申请 |
| pageType 4 | Process | 処理 | 处理 |
| pageType 5 | Confirm | 確認 | 确认 |
| pageType 6 | Process details | 処理内容 | 处理内容 |
| pageType 7 | Refer details | 参照内容 | 参考内容 |

| Field (matterPropertyName) | en | ja | zh_CN |
|---------------------------|----|----|-------|
| unitPrice | Unit Price | 単価 | 单价 |
| totalAmount | Total Amount | 合計金額 | 合计金额 |

| Field (ruleName) | en | ja | zh_CN |
|-----------------|----|----|-------|
| rule_prd_ord_01 | UnitPrice less than 20000 | 単価20000未満 | 单价不足20000 |
| rule_prd_ord_02 | UnitPrice 20000 or more | 単価20000以上 | 单价20000以上 |
| rule_prd_ord_03 | Total less than 100000 | 合計100000未満 | 合计不足100000 |
| rule_prd_ord_04 | Total 100000 or more | 合計100000以上 | 合计100000以上 |

```xml
<?xml version="1.0" encoding="UTF-16"?>
