# MCP Server Endpoint Specifications

MCP server endpoints that provide processing target person (authority plugin) definitions for IM-Workflow.
Standard plugins are already defined in `reference/authority-plugins.md` in the skill set.
User-extended plugins and complex conditions that cannot be covered by standard plugins are resolved via MCP.

Tool names follow the `mcp__im_workflow__<operation>` format (snake_case).

---

## 1. `mcp__im_workflow__list_authority_plugins`

Returns a list of available authority plugins.
Includes both standard plugins and user-extended plugins.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Keyword search. Partial match against `suffix` / `label` / `description`. Returns all records if omitted |
| `category` | string | No | Filter by category (`direct` / `combination` / `dynamic` / `custom`) |

### Response

See [mcp__im_workflow__list_authority_plugins.response.json](schemas/mcp__im_workflow__list_authority_plugins.response.json).

### Call Examples

```jsonc
// Get all
{ "method": "mcp__im_workflow__list_authority_plugins", "params": {} }

// Keyword search
{ "method": "mcp__im_workflow__list_authority_plugins", "params": { "query": "hire date" } }

// Custom plugins only
{ "method": "mcp__im_workflow__list_authority_plugins", "params": { "category": "custom" } }
```

### Notes

- Standard plugins (approximately 37 patterns listed in `reference/authority-plugins.md`) are also returned
- User-extended plugins can be identified with `category: "custom"`
- `extensionPointId` is determined by the type of the preceding node, so it is not included in the response (`build-workflow.js` determines it automatically)
- `description` also includes a hint for the parameter value. It is not a definitive value — obtain the actual code value from the project specification or by confirming with the user

---

## Usage Flow

1. Receive processing target person instructions during the interview
   - Matches a standard pattern → resolve using the rules in `reference/authority-plugins.md` (MCP not required)
   - Does not match a standard pattern → search for a custom plugin with `mcp__im_workflow__list_authority_plugins(query?)`

2. Refer to the resolved plugin's `pluginId` and `description`, then set the `plugin` field in spec.json

```jsonc
// Standard plugin (no MCP required)
{ "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps003" } }

// Custom plugin identified via MCP
{ "plugin": {
    "suffix": "custom_hire_date_filter",
    "pluginId": "jp.co.example.workflow.plugin.authority.hire_date_filter",
    "parameter": "2026/10/01",
    "targetType": "",
    "targetCode": ""
  }
}
```

`build-workflow.js` uses `pluginId` / `extensionPointId` from `plugin` when explicitly provided; otherwise it auto-determines them using standard rules (suffix + preceding node type).

## Error Behavior

Common to all endpoints.

When a non-existent condition is specified, the server **does not return a structured error response (JSON) — it throws an exception server-side, causing the tool execution itself to fail**.

The server log outputs the following:

```
[ERROR] j.c.i.f.c.m.s.McpAsyncServer - [E.IWP.COPILOT.MCP.00058] Tool execution failed.
java.lang.IllegalArgumentException: No matching authority plugin found for the given description
```

**Note (for coding agents):**

- If tool execution fails (exception), the caller (MCP client) cannot receive a response and **may enter a waiting state (hang)**.
- First narrow down candidates with the `query` parameter to confirm the plugin exists before using it.
