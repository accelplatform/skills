# 同步路由 XML 模板

## 概述

**同时并行处理**多个审批路径的工作流定义。
用 `Sync_Start` / `Sync_End` 节点包围并行区间，**在 Sync_End 处等待所有路径处理完成**。
与分支路由的区别：分支仅执行满足条件的 1 条路径，而同步会并行执行所有路径。

## 路由图

```
[Start] → [Apply] → [Sync_Start] ─┬─ [Approve_1] ─┬─ [Sync_End] → [End]
                                   └─ [Approve_2] ─┘
```

路径内也可放置多个节点：

```
[Start] → [Apply] → [Sync_Start] ─┬─ [Approve_A1] → [Approve_A2] ─┬─ [Sync_End] → [End]
                                   └─ [Approve_B1] ────────────────┘
```

## 使用示例

- "采购申请。财务部和法务部均需审批（顺序不限）。"
- "出差申请。上级和总务部并行审批。"

## 参数

除 template-straight.md 的参数外，还需：

| 参数 | 必须 | 说明 | 示例 |
|------|------|------|------|
| syncPaths | YES | 同步路径定义的数组 | 参见下方 |

### syncPaths 定义

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

## contents 节

与直线路由相同。请参阅 template-straight.md。
同步路由不需要 rule（分支条件）。

## route 节（同步特有部分）

### 节点构成

以直线路由的 route 模板为基础，将 Apply 和 End 之间的节点替换为以下内容。

#### 节点定义（同步区间）

XML 整体结构遵循 `sample-complete-branch.md`。以下为同步特有的节点规格。

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins |
|--------|----------|----------|-------------|------|------|---------|
| `{{name}}_sync_s` | 同步开始 | nodeTyp_Sync_Start | system | Apply | 所有路径首节点 | 空 |
| `{{name}}_{{path}}_{{N}}` | {{nodeName}} | nodeTyp_Approve | human | 前节点（首节点为 Sync_Start） | 后节点（末节点为 Sync_End） | 审批权限 |
| `{{name}}_sync_e` | 同步结束 | nodeTyp_Sync_End | system | 所有路径末节点 | End | 空 |

- 将 Apply 的 nextNodeIds 改为 `{{name}}_sync_s`，将 End 的 previousNodeIds 改为 `{{name}}_sync_e`
- Sync_Start / Sync_End 的 traceId：`{{SYNC_TRACE_PREFIX}}-0.0`
- 路径节点的 traceId：`{{SYNC_TRACE_PREFIX}}-{路径编号}.{节点编号}`（路径编号从 1 开始，节点编号也从 1 开始）
- 所有节点共通：`startNodeFlag=false`，`endNodeFlag=false`，`routeTemplateId=null`，`routeTemplateName=null`，`parentNode=null`

### SYNC_TRACE_PREFIX 的计算

规则与分支路由相同。为 Sync_Start 直前节点的 traceId 序号的下一个值。

| 模式 | 直前节点的 traceId | SYNC_TRACE_PREFIX |
|------|------------------|-------------------|
| Apply(0.1) → Sync_Start | `0.1` | `0.2` |
| Approve(0.2) → Sync_Start | `0.2` | `0.3` |

### 坐标计算公式（同步路由）

| 节点 | x 坐标 | y 坐标 |
|------|--------|--------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Sync_Start | 前节点.x + 110 | 50 |
| 路径A 节点 | Sync_Start.x + 180 + (n-1)*130 | 50 |
| 路径B 节点 | Sync_Start.x + 180 + (n-1)*130 | 190 |
| 路径C 节点 | Sync_Start.x + 180 + (n-1)*130 | 330 |
| Sync_End | max(所有路径节点.x) + 120 | 50 |
| End | Sync_End.x + 80 | 50 |

路径增加时，y 每次 +140（50、190、330、470、…）。

坐标换行规则请参阅 template-straight.md（路由设计器：10000 x 5000 px，x > 9500 时换行）。

### nextNodeIds / previousNodeIds 的规则

与分支路由的区别：**不需要 Sync_Start → Sync_End 的直连路径。**
同步路由中所有路径均会执行，因此不存在"跳过"路径。

`Sync_Start` 的 `nextNodeIds`：
1. 路径A 的首节点
2. 路径B 的首节点
3. ...

`Sync_End` 的 `previousNodeIds`：
1. 路径A 的末节点
2. 路径B 的末节点
3. ...

## flow 节（同步特有部分）

以与直线路由相同的结构为基础，**在 flow 的 `nodes` 中也包含 Sync_Start 节点和 Sync_End 节点**。
与分支路由不同，Sync_Start 不需要 details（规则关联）/ unions（路径关联）。

### Sync_Start / Sync_End 的 Flow 设置

| nodeId | nodeType | 标志类 | details | attributes | unions |
|--------|----------|--------|---------|------------|--------|
| `{{name}}_sync_s` | `7` | 全部 null | 空数组 | 空数组 | 空数组 |
| `{{name}}_sync_e` | `8` | 全部 null | 空数组 | 空数组 | 空数组 |

"标志类" = lumpProcessFlag, attachFileFlag, autoProcessFlag, autoProcessLimitDay, autoProcessLimitType, autoPressFlag, autoPressLimitDay（全部 `type="null"`）

### Flow nodes 的记述顺序

```
1. Apply 节点（nodeType=2）
2. Sync_Start 节点（nodeType=7）— details/unions/attributes 全部为空数组
3. 各审批节点（nodeType=3）— 按路径A、路径B…的顺序列举
4. Sync_End 节点（nodeType=8）— details/unions/attributes 全部为空数组
```

## 与分支路由的对比

| 项目 | 分支路由 | 同步路由 |
|------|---------|---------|
| 节点类型 | Branch_Start / Branch_End | Sync_Start / Sync_End |
| 执行路径 | 仅满足条件的 1 条路径 | 所有路径并行执行 |
| rule 的必要性 | 必要（分支条件） | 不需要 |
| contents 的 rules | 注册 ruleId | 空数组 |
| flow 的 details/unions | 在 Branch_Start 中设置 | 空数组 |
| 直连路径 | 视条件而定 | 无 |
| traceId 规则 | 相同 | 相同 |

## 生成检查清单

- [ ] template-straight.md 检查清单中的所有项目
- [ ] Sync_Start 的 nextNodeIds 包含所有路径的首节点
- [ ] Sync_End 的 previousNodeIds 包含所有路径的末节点
- [ ] 路径内节点的连接正确（路径内串联）
- [ ] 各路径的 Y 坐标不同（不重叠）
- [ ] Sync_Start 和 Sync_End 的 traceId 值相同（识别配对）
- [ ] traceId 的路径编号在各路径中唯一
- [ ] flow 的 nodes 包含 Sync_Start（nodeType=7）和 Sync_End（nodeType=8）
- [ ] Sync_Start / Sync_End 的 details、unions、attributes 全部为空数组
- [ ] rule / contents 的 rules 不需要（同步路由无条件分支）
