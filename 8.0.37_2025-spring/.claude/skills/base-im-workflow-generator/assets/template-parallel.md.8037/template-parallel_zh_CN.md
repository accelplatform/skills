# 横向排列（顺次）路由 XML 模板

## 概述

多个审批者**按顺序**（逐一依次）处理的横向排列路由。
节点横向排成一列，按排列顺序从上到下依次审批。
使用 `nodeTyp_Horizontal` 节点，通过 flow 的 `attributes` 设置审批者数量。
审批者数量可在流程配置时动态决定。

## 路由图

```
[Start] → [Apply] → [Horizontal] → [End]
                      审批者1 → 审批者2 → ... → 审批者N（按顺序处理）
```

## 使用示例

- "费用申请。课长、部长、本部长3人按顺序审批的横向排列路由。"
- "议案申请。审批者数量因案件不同而异，希望能动态添加审批者。"

## 参数

除 template-straight.md 的参数外，还需：

| 参数 | 必须 | 说明 | 示例 |
|------|------|------|------|
| horizontalName_ja | YES | 横向排列节点名称（日语） | `順次承認` |
| horizontalName_en | YES | 横向排列节点名称（英语） | `Sequential approval` |

## contents 节

与直线路由相同。请参阅 template-straight.md。

## route 节（横向排列特有部分）

横向排列路由中，在 Apply 和 End 之间放置 1 个 `nodeTyp_Horizontal` 节点。
横向排列节点不设置插件，审批者的分配在 flow 侧进行。

#### 节点定义

XML 整体结构遵循 `sample-complete-branch.md`。

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins | x | traceId |
|--------|----------|----------|-------------|------|------|---------|----|---------|
| `{{name}}_start` | Start | nodeTyp_Start | system | （无） | apply | 空 | 50 | 0.0 |
| `{{name}}_apply` | Apply | nodeTyp_Apply | human | start | horizontal | 申请权限 | 160 | 0.1 |
| `{{name}}_horizontal` | {{horizontalNodeName}} | nodeTyp_Horizontal | human | apply | end | **空** | 260 | 0.2-0.0 |
| `{{name}}_end` | End | nodeTyp_End | system | horizontal | （无） | 空 | 360 | 0.0 |

- Horizontal 节点的 plugins 为**空数组**（审批者的分配在 flow 侧进行）
- 所有节点 y=50

路由级别的 `plugins` 中只写 Apply 的插件（Horizontal 节点不需要插件）。

### 坐标计算公式（横向排列路由）

| 节点 | x 坐标 | y 坐标 |
|------|--------|--------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Horizontal | 260 | 50 |
| End | 360 | 50 |

坐标换行规则请参阅 template-straight.md（路由设计器：10000 x 5000 px，x > 9500 时换行）。

## flow 节（横向排列特有部分）

横向排列节点的 flow 设置中，将 `nodeType` 设为 `11`（Horizontal），并通过 `attributes` 设置审批者的配置数量。

| nodeId | nodeType | 标志类 | details | unions |
|--------|----------|--------|---------|--------|
| `{{name}}_horizontal` | `11` | 全部 null | 空数组 | 空数组 |

#### attributes（仅 1 条记录）

| 属性 | 值 | 说明 |
|------|-----|------|
| no | 随机ID（15位，`[0-9A-Za-z]`） | 在各语言环境间共享 |
| attributeType | `1` | 节点属性 |
| attributeKey | `5` | 横向排列的设置 |
| value | `0` | 默认（遵循 flow 设置） |

attributes 的各条记录还需包含 `no`、`flowId`、`flowVersionId`、`contentsVersionId`、`routeVersionId`、`nodeId`、`localeId`。

attributes 的 `no` 编号规则及与直线路由的组合模式，请参阅 `reference/node-types.md` 的"Flow 节点的 attributes"。

## 生成检查清单

- [ ] template-straight.md 检查清单中的所有项目
- [ ] Horizontal 节点的 nodeType 为 `nodeTyp_Horizontal`
- [ ] Horizontal 节点的 plugins 为空数组
- [ ] flow 的 nodes 内 Horizontal 节点的 nodeType 为 `11`
- [ ] attributes 的 no 在各语言环境间一致
- [ ] attributes 的 attributeType / attributeKey / value 正确
