# IM-Workflow 节点类型·插件参考

## 节点类型列表

### nodeType（路由定义内）

| nodeType | 名称 | nodeVariety | 说明 |
|----------|------|-------------|------|
| nodeTyp_Start | 开始 | system | 路由开始节点 |
| nodeTyp_End | 结束 | system | 路由结束节点 |
| nodeTyp_Apply | 申请 | human | 申请节点 |
| nodeTyp_Approve | 审批 | human | 审批节点（静态·动态） |
| nodeTyp_Dynamic | 动态审批 | human | 动态决定审批者的节点 |
| nodeTyp_Confirm | 确认 | human | 确认节点（仅浏览，无审批权限） |
| nodeTyp_System | 系统 | system | 系统节点 |
| nodeTyp_Horizontal | 横向排列 | human | 横向排列审批节点（顺次处理——按排列顺序逐一处理） |
| nodeTyp_Vertical | 纵向排列 | human | 纵向排列审批节点（并行处理——同时到达所有人·顺序不限） |
| nodeTyp_Sync_Start | 同步开始 | system | 同步（并行处理）的开始节点 |
| nodeTyp_Sync_End | 同步结束 | system | 同步（并行处理）的结束节点。等待所有路径完成后合流 |
| nodeTyp_Branch_Start | 分支开始 | system | 分支开始节点 |
| nodeTyp_Branch_End | 分支结束 | system | 分支结束节点 |
| nodeTyp_Template | 模板置换 | human | 展开路由模板的节点 |
| nodeTyp_Template_Start | 模板开始 | system | 模板开始节点 |
| nodeTyp_Template_End | 模板结束 | system | 模板结束节点 |

### nodeType（数值代码）

在流程定义·插件内使用的数值代码。
定义来源：`d.ts/workflow/enum/im-ssjs-node-type.d.ts`

| 数值代码 | 对应 nodeType | 说明 |
|---------|-------------|------|
| 0 | nodeTyp_Start | 开始节点 |
| 1 | nodeTyp_End | 结束节点 |
| 2 | nodeTyp_Apply | 申请节点 |
| 3 | nodeTyp_Approve | 审批节点 |
| 4 | nodeTyp_Dynamic | 动态处理节点 |
| 5 | nodeTyp_System | 系统节点 |
| 6 | nodeTyp_Confirm | 确认节点 |
| 7 | nodeTyp_Sync_Start | 同步开始节点 |
| 8 | nodeTyp_Sync_End | 同步结束节点 |
| 9 | nodeTyp_Branch_Start | 分支开始节点 |
| 10 | nodeTyp_Branch_End | 分支结束节点 |
| 11 | nodeTyp_Horizontal | 横向排列节点 |
| 12 | nodeTyp_Vertical | 纵向排列节点 |
| 13 | nodeTyp_Template | 模板置换节点 |
| 14 | nodeTyp_Template_Start | 模板开始节点 |
| 15 | nodeTyp_Template_End | 模板结束节点 |

---

## 权限插件

权限插件的扩展点·后缀·targetType·parameter 格式·示例数据的详细信息，
请参阅 `reference/authority-plugins.md`。

### 常用模式

**申请节点（默认）：**
```
extensionPointId: ...node.apply
pluginId: ...apply.role
parameter: im_workflow_user
targetType: role
```

**审批节点（B-2：直前为人员节点）— 职位指定示例：**
```
extensionPointId: ...node.approve
pluginId: ...approve.post
parameter: comp_sample_01^comp_sample_01^ps003
targetType: post
```

**审批节点（B-1：直前为系统节点）— 职位指定示例：**
```
extensionPointId: ...node.approve.static
pluginId: ...approve.static.post
parameter: comp_sample_01^comp_sample_01^ps001
targetType: post
```

**审批节点（B-1）— 角色指定示例：**
```
extensionPointId: ...node.approve.static
pluginId: ...approve.static.role
parameter: tenant_manager
targetType: role
```

**审批节点（B-1）— 公共组群指定示例：**
```
extensionPointId: ...node.approve.static
pluginId: ...approve.static.public_group
parameter: sample_public^public_group_a
targetType: publicGroup
```

**确认节点（组织）：**
```
extensionPointId: ...node.confirm
pluginId: ...confirm.department
parameter: comp_sample_01^comp_sample_01^dept_sample_10
targetType: department
```

### 插件设置注意事项

1. **需要双重记录**：详情请参阅 `reference/xml-structure.md` 的 plugins 规格
2. **申请节点的默认**：无特殊指定时使用 `im_workflow_user` 角色
3. **后缀·targetType 的详情**：请参阅 `reference/authority-plugins.md`
4. **routePluginId 命名**：`plg_{缩略名}_{序号}` 格式（**最大 20 字节**）
5. **分支路由中的节点命名**：同一职位存在于多条路径时，附加路径标识符（例：`Manager(A)`、`Manager(B)`）
6. **节点名称（nodeName）在所有语言环境中使用相同的英文名称**（不做本地化）

---

## 节点连接模式

### 直线路由

```
Start → Apply → Approve1 → Approve2 → ... → End
```

- 每个节点的 `previousNodeIds` 和 `nextNodeIds` 各有 1 个元素
- Approve 节点数量任意

### 分支路由

```
Start → Apply → Branch_Start ─┬─ Approve_A(A) ──────────── Branch_End → End
                               ├─ Approve_A(B) → Approve_B ┘
                               └─ Approve_A(C) → Approve_B → Approve_C ┘
```

- 在 `Branch_Start` 的 `nextNodeIds` 中列举各分支路径的首节点
- 在 `Branch_End` 的 `previousNodeIds` 中列举各分支路径的末节点
- **仅当存在"无需审批立即结束"的路径时**才包含 `Branch_Start` → `Branch_End` 的直连路径（所有路径都需要审批时不包含）
- 同一职位存在于多条路径时，在节点名中附加路径标识符（例：`Manager(A)`、`Manager(B)`）

### 同步路由

```
Start → Apply → Sync_Start ─┬─ Approve_1 ─┬─ Sync_End → End
                             └─ Approve_2 ─┘
```

- 用 `nodeTyp_Sync_Start` / `nodeTyp_Sync_End` 节点包围并行区间
- 与分支路由的区别：**在 Sync_End 处等待所有路径处理完成**（分支仅执行满足条件的1条路径）
- 在每条路径中放置独立的审批节点
- Sync_Start / Sync_End 无插件（系统节点）
- traceId 遵循与分支路由相同的规则（配对节点使用相同值，路径内为 `{前缀}-{路径编号}.{节点编号}`）

### 横向排列路由（顺次审批）

```
Start → Apply → Horizontal → End
                 审批者1 → 审批者2 → ... → 审批者N
```

- 使用 `nodeTyp_Horizontal`（nodeType=11）节点
- 审批者**按排列顺序逐一**处理
- 横向排列节点内的审批者通过 flow 的 `attributes` 设置

### 纵向排列路由（并行审批）

```
Start → Apply → Vertical → End
                 ├─ 审批者1
                 ├─ 审批者2（同时到达所有人·顺序不限）
                 └─ 审批者N
```

- 使用 `nodeTyp_Vertical`（nodeType=12）节点
- 所有审批者**同时到达**，**顺序不限**地处理。等待所有审批者完成
- 纵向排列节点内的审批者通过 flow 的 `attributes` 设置
- **需要所有人顺序不限审批时**，使用同步节点（Sync）或本纵向排列节点

---

## traceId 的规则

traceId 的详细编号规则（包括嵌套分支）请参阅 `reference/xml-structure.md` 的"traceId 的规则"。

基本模式速查表：

| 模式 | 含义 | 示例 |
|------|------|------|
| `0.0` | Start / End | Start、End |
| `0.{N}` | 主线第 N 个节点 | Apply = `0.1` |
| `0.{N}-0.0` | 分支/横向排列/纵向排列节点 | Branch_Start/End、Horizontal、Vertical |
| `0.{N}-{M}.{K}` | 分支路径内节点 | M=路径编号(1起)，K=节点编号(1起) |

---

## Flow 节点的 attributes

分支路由内的审批节点，需要在 flow 定义的 `nodes` 中设置 `attributes`。

```xml
<attributes type="array">
  <value type="object">
    <no type="string">{{uniqueNo}}</no>
    <flowId type="string">{{flowId}}</flowId>
    <flowVersionId type="string">{{flowVersionId}}</flowVersionId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <routeVersionId type="string">{{routeVersionId}}</routeVersionId>
    <nodeId type="string">{{nodeId}}</nodeId>
    <localeId type="string">{{localeId}}</localeId>
    <attributeType type="string">1</attributeType>
    <attributeKey type="string">5</attributeKey>
    <value type="string">0</value>
  </value>
</attributes>
```

### `no` 字段的编号规则

`no` 是半角英数字（`[0-9A-Za-z]`）15位的唯一标识符（例：`5hx2qt35p8oslxo`）。
详情请参阅 `reference/xml-structure.md` 的"随机 ID 生成规则"。
在各语言环境间共享相同的 `no`。
同一节点内有多个 attributes 条目时，每个条目拥有不同的 `no`。

### AttributeType（属性类型）

官方参考：https://api.intra-mart.jp/im_workflow_v72/com/imwCodeList.html

| 值 | 代码名 | 说明 |
|----|--------|------|
| 0 | attrTyp_procTypName | 处理类型名 |
| 1 | attrTyp_procEnable | 处理禁止（代码名为"处理许可"，但实际是**禁止**指定的处理类型） |
| 2 | attrTyp_replaceRoute | 置换路由 |
| 3 | attrTyp_dispatchNodeMin | 可分配节点数（最小） |
| 4 | attrTyp_dispatchNodeMax | 可分配节点数（最大） |
| 5 | attrTyp_execUserSetNode | 可设置处理对象的节点 |
| 6 | attrTyp_cnfmUserSetNode | 可设置确认对象的节点 |
| 7 | attrTyp_branchCondition | 分支条件 |
| 8 | attrTyp_unionCondition | 结合条件 |
| 9 | attrTyp_sendbackTargetNode | 退回目标节点 |
| 10 | attrTyp_branchSettableNodeSingular | 可设置分支目标节点（单数） |
| 11 | attrTyp_branchSettableNodePlural | 可设置分支目标节点（复数） |
| 12 | attrTyp_dynamicNodeDeleteDisable | 动态审批节点删除禁止 |
| 13 | attrTyp_pluginParameterDisable | 插件设置（显示禁止） |

### AttributeKey（属性键）

attributeKey 的值因 attributeType 不同而异。
具体值请参阅官方参考及导出 XML。

无需指定时，设为 `NoSetting`。

| 值 | 代码名 | 说明 |
|----|--------|------|
| NoSetting | attrKey_NoSetting | 无设置（无需指定 attributeKey 时） |

`attributeType=0`（处理类型名）及 `attributeType=1`（处理禁止）时：
在 attributeKey 中指定 ProcessType 的代码值。

| 值 | 代码名 | 说明 |
|----|--------|------|
| 0 | procTyp_drf | 起草 |
| 1 | procTyp_apy | 申请 |
| 2 | procTyp_rapy | 重新申请 |
| 3 | procTyp_dct | 取消 |
| 4 | procTyp_apr | 审批 |
| 5 | procTyp_apre | 审批结束 |
| 6 | procTyp_deny | 否认 |
| 7 | procTyp_rsv | 保留 |
| 8 | procTyp_rsvc | 取消保留 |
| 9 | procTyp_pbk | 撤回 |
| 10 | procTyp_sbk | 退回 |
| 11 | procTyp_cnfm | 确认 |
| 12 | procTyp_trans | 转移 |

### 标准设置

- `attributeType=1`（处理禁止），`attributeKey=5`（审批结束），`value=0` 是审批节点（Approve/Horizontal/Vertical）的标准设置，意为禁止审批结束操作

### 横向排列·纵向排列节点的组合

横向排列·纵向排列节点也可以放置在直线路由的中间：

```
[Start] → [Apply] → [Approve1] → [Horizontal or Vertical] → [Approve3] → [End]
```

此时，将 Horizontal / Vertical 与普通审批节点相同地进行连接。
