# 直线路由 XML 模板

## 概述

最简单的工作流定义。
`Start → Apply → Approve（1个或多个）→ End` 的直线结构。

## 路由图

```
[Start] → [Apply] → [Approve1] → [Approve2] → ... → [End]
```

## 使用示例

"创建采购申请的工作流定义。申请→课长审批→部长审批→完成的直线路由。"

## 参数

| 参数 | 必须 | 说明 | 示例 |
|------|------|------|------|
| name | YES | 工作流名称（用于生成 ID。**调整使版本 ID 在 20 个字符以内。** 过长时将前缀缩短为 `cnt_`/`rte_`/`flw_`。详细请参阅 `reference/xml-structure.md` 的 ID 命名规则。） | `purchase` |
| short | YES | 用于插件 ID 的缩略名（使 `plg_{short}_NN` 在 20 字符以内） | `purch` |
| flowName_ja | YES | 流程名称（日语） | `購買申請` |
| flowName_en | YES | 流程名称（英语） | `Purchase Request` |
| flowName_zh | YES | 流程名称（中文） | `采购申请` |
| contentsName_ja | NO | 内容名称（省略时使用流程名称） | - |
| routeName_ja | NO | 路由名称（省略时使用流程名称） | - |
| screenBasePath | YES | 界面 JSSP 文件的基础路径（相对于 `src/main/jssp/src/` 的相对路径）。指定实际文件位置，而非路由 URL。 | `wf_purchase` |
| approveNodes | YES | 审批节点定义的数组 | 参见下方 |

### approveNodes 定义

```
[
  { nodeName: "Manager", targetType: "role", targetCode: "im_workflow_user" },
  { nodeName: "Director", targetType: "role", targetCode: "im_workflow_user" }
]
```

**注意：** `nodeName` 在所有语言环境中使用统一的英文名称（不做多语言处理）。

## 模板

XML 整体结构（标签名、嵌套、属性顺序）严格遵循 `assets/sample-complete-branch.md`。
以下仅描述直线路由特有的节点构成、连接、坐标和流程设置。

### contents 节

与 `sample-complete-branch.md` 的 contents 节结构相同。仅替换以下内容：

| 项目 | 值 |
|------|-----|
| contentsId | `contents_{{name}}` |
| contentsVersionId | `contents_{{name}}_0`（blank）/ `contents_{{name}}_1`（active） |
| contentsName | 根据语言环境的名称 |
| pagePathId | `{{name}}_page_0` 至 `{{name}}_page_7` |
| scriptPath | 参见下方 scriptPath 对应表 |
| plugins | 空数组（直线路由不使用 rule） |
| rules | 空数组 |

#### scriptPath 对应表

| pageType | scriptPath |
|----------|-----------|
| 0～3（申请类） | `{{screenBasePath}}/apply/index` |
| 4（处理） | `{{screenBasePath}}/approve/index` |
| 5（确认） | `{{screenBasePath}}/confirm/index` |
| 6～7（详细类） | `{{screenBasePath}}/detail/index` |

#### pageName 语言环境对应表

| pageType | ja | en | zh_CN |
|----------|-----|-----|-------|
| 0 | 申請 | Apply | 申请 |
| 1 | 一時保存 | Temporary save | 临时保存 |
| 2 | 申請（処理） | Apply (task) | 申请（处理） |
| 3 | 再申請 | Re-apply | 重新申请 |
| 4 | 処理 | Process | 处理 |
| 5 | 確認 | Confirm | 确认 |
| 6 | 処理詳細 | Process details | 处理详细 |
| 7 | 参照詳細 | Refer details | 参照详细 |

---

### route 节

#### 节点定义

| nodeId | nodeName | nodeType | nodeVariety | prev → next | plugins |
|--------|----------|----------|-------------|-------------|---------|
| `{{name}}_start` | Start | nodeTyp_Start | system | （无）→ apply | 空 |
| `{{name}}_apply` | Apply | nodeTyp_Apply | human | start → approve_1 | 申请权限 `plg_{{short}}_01` |
| `{{name}}_approve_{{N}}` | {{approveNodeName}} | nodeTyp_Approve | human | 前节点 → 后节点 | 审批权限 `plg_{{short}}_{{NN}}` |
| `{{name}}_end` | End | nodeTyp_End | system | 最后的 approve →（无） | 空 |

- `{{N}}` 从 1 开始递增。`{{NN}}` 从 02 开始递增（01 用于 Apply）。
- Start 的 `startNodeFlag` = `true`，End 的 `endNodeFlag` = `true`，其余两者均为 `false`。
- Start/End 的 `traceId` = `0.0`，Apply = `0.1`，Approve_N = `0.{{N+1}}`

#### 插件设置

**Apply 节点：**

| 属性 | 值 |
|------|-----|
| routePluginId | `plg_{{short}}_01` |
| nodeType | `2` |
| extensionPointId | `jp.co.intra_mart.workflow.plugin.authority.node.apply` |
| pluginId | `jp.co.intra_mart.workflow.plugin.authority.node.apply.role` |
| parameter / targetCode | `im_workflow_user` |
| targetType | `role` |

**Approve 节点：**
- extensionPointId：直前为人员节点 → `approve`；直前为系统节点 → `approve.static`
- pluginId / parameter / targetType / targetCode：遵循 `reference/authority-plugins.md`"审批者指示的默认解释规则"
- **在路由级别的 plugins 中也重复记录相同内容**

#### 坐标计算公式

| 节点 | x | y |
|------|---|---|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| Approve_N | 160 + N * 110 | 50 |
| End | 160 + (审批数 + 1) * 110 | 50 |

#### 坐标换行

路由设计器的尺寸为 **10000 x 5000 px**。
x 坐标超过 9500 时换行。

```
[Node1] → [Node2] → ... → [NodeN] →
                                     ↓
[NodeN+3] ← [NodeN+2] ← [NodeN+1] ←
↓
[NodeN+4] → [NodeN+5] → ...
```

换行规则：
- x 超过 9500 时，下一个节点换行
- 换行时的 y = 该行中所有节点的最大 y 值 + 50
- 换行时 x 重置为 50
- 奇数行从左到右，偶数行从右到左（蛇形排列）

---

### flow 节

与 `sample-complete-branch.md` 的 flow 节结构相同。直线路由特有的差异如下。

#### 流程设置（active 版本）

- `contentsId`：`contents_{{name}}`
- `routeId`：`route_{{name}}`
- `handleUsers`：参照者设置（参阅 `reference/xml-structure.md`。设置可选）
- `nodes`：Apply + 各 Approve 节点（不包含 Start/End）

#### 流程节点定义

| nodeId | nodeType | attachFileFlag | details | attributes | unions |
|--------|----------|---------------|---------|------------|--------|
| `{{name}}_apply` | `2` | `2` | 空数组 | 空数组 | 空数组 |
| `{{name}}_approve_{{N}}` | `3` | `0` | 空数组 | 空数组 | 空数组 |

所有流程节点共通：
- `lumpProcessFlag`：`1`
- `autoProcessFlag`：`0` / `autoProcessLimitDay`：null / `autoProcessLimitType`：`0`
- `autoPressFlag`：`0` / `autoPressLimitDay`：null
- `routeNode`：null

**直线路由中，details / attributes / unions 全部为空数组。**
与分支路由的区别：在分支中，Branch_Start 的流程节点具有 details（规则关联）/ unions（路径定义）/ attributes（分支方式）。

---

## 生成检查清单

- [ ] 满足 `reference/xml-structure.md` 的公共规则（3个语言环境、2个版本、插件双重记录、ID命名规则）
- [ ] contents / route / flow 的 ID 一致
- [ ] 节点的 previousNodeIds / nextNodeIds 双向一致
- [ ] flow 的 contentsId / routeId 与各自的定义一致
- [ ] flow 的 nodes 内 contentsVersionId / routeVersionId 正确
- [ ] X 坐标无重复
