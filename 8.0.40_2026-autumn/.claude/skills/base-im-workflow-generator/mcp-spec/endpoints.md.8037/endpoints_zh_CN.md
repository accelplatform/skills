# MCP 服务器端点规格

为 IM-Workflow 提供处理对象人（权限插件）定义的 MCP 服务器端点。
标准插件已在技能集的 `reference/authority-plugins.md` 中定义。
用户扩展插件以及标准插件无法覆盖的复杂条件，通过 MCP 解决。

工具名格式为 `mcp__im_workflow__<操作名>`（snake_case）。

---

## 1. `mcp__im_workflow__list_authority_plugins`

返回可用权限插件的列表。
包含标准插件和用户扩展插件两类。

### 参数

| 名称 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `query` | string | No | 关键字搜索。对 `suffix` / `label` / `description` 进行部分匹配。省略时返回全部 |
| `category` | string | No | 按类别筛选（`direct` / `combination` / `dynamic` / `custom`） |

### 响应

参见 [mcp__im_workflow__list_authority_plugins.response.json](schemas/mcp__im_workflow__list_authority_plugins.response.json)。

### 调用示例

```jsonc
// 获取全部
{ "method": "mcp__im_workflow__list_authority_plugins", "params": {} }

// 关键字搜索
{ "method": "mcp__im_workflow__list_authority_plugins", "params": { "query": "入社日" } }

// 仅自定义插件
{ "method": "mcp__im_workflow__list_authority_plugins", "params": { "category": "custom" } }
```

### 备注

- 标准插件（`reference/authority-plugins.md` 中记载的约 37 种模式）也会被返回
- 用户扩展插件可通过 `category: "custom"` 区分
- `extensionPointId` 由前置节点的类型决定，因此不包含在响应中（由 `build-workflow.js` 自动判定）
- `description` 中也包含参数值的提示，不是确定值。实际代码值需从项目规格书或向用户确认后获取

---

## 使用流程

1. 在需求确认阶段接收处理对象人的指示
   - 符合标准模式 → 按 `reference/authority-plugins.md` 中的规则解决（无需 MCP）
   - 不符合标准模式 → 使用 `mcp__im_workflow__list_authority_plugins(query?)` 搜索自定义插件

2. 参考已解析插件的 `pluginId` 和 `description`，设置 spec.json 的 `plugin` 字段

```jsonc
// 标准插件（无需 MCP）
{ "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps003" } }

// 通过 MCP 确定的自定义插件
{ "plugin": {
    "suffix": "custom_hire_date_filter",
    "pluginId": "jp.co.example.workflow.plugin.authority.hire_date_filter",
    "parameter": "2026/10/01",
    "targetType": "",
    "targetCode": ""
  }
}
```

`build-workflow.js` 在 `plugin` 中明确指定了 `pluginId` / `extensionPointId` 时直接使用；否则按标准规则（suffix + 前置节点类型）自动判定。

## 错误时的行为

所有端点通用。

指定不存在的条件时，服务器**不返回结构化错误响应（JSON），而是在服务器端抛出异常，导致工具执行本身失败**。

服务器日志中将输出如下内容：

```
[ERROR] j.c.i.f.c.m.s.McpAsyncServer - [E.IWP.COPILOT.MCP.00058] ツールの実行に失敗しました。
java.lang.IllegalArgumentException: No matching authority plugin found for the given description
```

**注意（面向编码代理）：**

- 工具执行失败（异常）时，调用方（MCP 客户端）无法收到响应，**可能进入等待状态（挂起）**。
- 请先通过 `query` 参数缩小候选范围，确认插件存在后再使用。
