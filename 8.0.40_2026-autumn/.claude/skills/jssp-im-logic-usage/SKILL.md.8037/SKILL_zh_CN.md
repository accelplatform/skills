---
name: jssp-im-logic-usage
description: 生成从 JSSP 展示页面调用已存在的 IM-LogicDesigner 路由定义（逻辑流程API）的代码。获取并解析 swagger spec（`<BASE-URL>/logic/all-api-docs`），确定请求参数与响应结构后生成 `fetch` 调用代码。当提到调用 IM-LogicDesigner 流程、调用逻辑流程API、调用 logic/api、使用已有路由定义时使用。新建逻辑流程定义（flow_definition.json）或路由定义（flow_route.json）时，请使用 jssp-im-logic-generator。
---

# IM-LogicDesigner 路由调用代码生成技能

## 概述

生成从 JSSP 展示页面（浏览器端 JS）调用 IM-LogicDesigner 逻辑流程上**已配置的路由定义**（`<BASE-URL>/logic/api/<route>`）的代码。

本技能负责「调用方」。逻辑流程与路由定义的**新建**由 `jssp-im-logic-generator` 负责，不在本技能范围内。

## 适用方针

**JSSP 画面需要调用 IM-LogicDesigner 逻辑流程时，必须通过路由定义访问。** 没有直接执行逻辑流程的接口，只有已配置路由定义（`flow_route.json`）的流程才能通过 `<BASE-URL>/logic/api/<route>` 以 HTTP 方式执行。

若目标流程尚未配置路由定义，需先使用 `jssp-im-logic-generator` 创建路由定义（`routes` spec）。请与用户确认，若缺失应告知用户。

## 实施步骤

### 1. 确定调用目标

向用户确认以下内容（从需求描述中已明确的部分可省略）：
- 要调用的逻辑流程/功能（route 路径的一部分、tag 名称等）
- HTTP 方法（应注册为 GET/POST/PUT/DELETE 之一，需从下述 swagger spec 中确认）
- 画面侧所需的输入项、显示项

### 2. 获取 swagger spec

IM-LogicDesigner 会将租户中已注册的全部路由定义以 **Swagger 2.0** 格式在以下端点公开：

```
<BASE-URL>/logic/all-api-docs
```

例：`http://127.0.0.1/imart/logic/all-api-docs`

使用 `scripts/fetch-logic-swagger.js` 获取并提取（直接读取原始文档会消耗大量上下文，应按关键字过滤获取）。

```bash
# 全部 route 列表（path, method, summary, tags, operationId）
node scripts/fetch-logic-swagger.js --base-url http://127.0.0.1/imart --list

# 目标 route 的详情（已解析 $ref 的请求/响应 schema）
node scripts/fetch-logic-swagger.js --base-url http://127.0.0.1/imart --route <关键字>
```

**`<BASE-URL>` 的确定方法**：查看项目内的开发服务器 URL 设置（如 `.mcp.json`）。若无线索，默认使用 `http://127.0.0.1/imart` 并与用户确认。

#### 返回 401 / 403 时（必须处理）

该端点受认可设置保护。若获取失败并返回 HTTP 401 或 403，**不要凭猜测重试**，应将以下消息原样提示给用户。

> 请在认可设置画面的「画面・处理」中，为「IM-LogicDesigner」-「Swagger specification」授予「访客用户」权限。

`scripts/fetch-logic-swagger.js` 在 401/403 时会将该消息原样输出到标准错误（退出码 1）。可以将脚本输出直接转达给用户。

### 3. 确定请求/响应结构

从获取的 spec 中确认目标 route 的 `paths["<path>"][<method>]`。

| 项目 | 参照位置 |
|------|---------|
| HTTP 方法 | `paths["<path>"]` 的键（`get`/`post`/`put`/`delete`） |
| 请求参数 | `parameters[].schema.$ref` → `definitions[<ref>].properties` |
| 响应结构 | `responses.default.schema.$ref` → `definitions[<ref>].properties` |
| 功能标签 | `tags` |

使用 `--route` 选项执行时，`$ref` 已被内联展开，无需再单独查阅 `definitions`。

详细结构解读与类型对照表务必参照 `reference/swagger-routing-call.md`。

### 4. 生成调用代码

按照 `reference/swagger-routing-call.md` 中的 fetch 调用模式，在 JSSP 展示页面的 `<script>` 中实现代码。完整示例参见 `assets/sample-call.md`。

实现时的必须规则：
- 调用 URL 以 `logic/api/<route>` 的**相对路径**指定（遵循 `jssp-presentation-page.md` 的 URL 指定方针）
- 成功/失败判定使用 **HTTP 状态码（`response.ok`）**，而非 JSSP 自有的 `{error, errorMessage}` 格式——路由的响应就是流程的输出数据本身，不遵循 JSSP 的 API 响应规约
- 请求体的字段需严格对应 `definitions` 的 `properties`，不得凭猜测增减字段
- 若类型不明或 spec 信息不足，应在生成代码前与用户确认

## 应参照的规约

| 规约/技能 | 处理方式 |
|------|---------|
| `jssp-presentation-page.md` | 🟢 必读 — URL 指定方针・`fetch` 调用的基本形式 |
| `reference/swagger-routing-call.md`（本技能） | 🟢 必读 — swagger 结构解读・fetch 调用模式・已知注意事项 |
| `jssp-im-logic-generator` 的 `reference/route_definition.schema.json` / `routing-response.md` | 🟡 参考 — 路由定义侧的规格（`secured`、`responseType` 等），用于佐证 swagger 中不包含的信息 |
| `jssp-error-handling.md` | 🔴 本技能单独使用时不需要 — 逻辑流程 API 的响应不遵循 JSSP 的 API 响应规约 |
| `jssp-security.md` | 🟡 参考 — 仅在确认目标路由 `secured: true` 时才附加 CSRF 令牌（`X-Intramart-Secure-Token`）头 |

## 参照

- `reference/swagger-routing-call.md` - swagger spec 结构解读・fetch 调用代码模式・已知注意事项
- `scripts/fetch-logic-swagger.js` - swagger spec 获取/提取辅助脚本（Node.js，无依赖）
- `assets/sample-call.md` - 完整示例（调用 GET route 的 HTML + JS）

## 限制事项

- swagger spec 不包含 `secured`（是否需要安全令牌）、`authentication`（认证方式）、`authzUri`（认可 URI），这些是路由定义（`flow_route.json`）侧的设置信息，无法从 spec 判断。不明确时按不使用安全令牌实现，并请用户在实机环境验证。
- 目标流程尚未配置路由定义时不在本技能范围内（应先使用 `jssp-im-logic-generator` 新建路由定义）。
- 以 GET 方法注册的 route，`parameters[].in` 也可能被记述为 `body`（intra-mart 的 swagger 生成特性）。由于浏览器的 `fetch` 无法为 GET 请求携带 HTTP body，实现时务必确认 `reference/swagger-routing-call.md` 中「GET 方法下的 body 参数」章节。
