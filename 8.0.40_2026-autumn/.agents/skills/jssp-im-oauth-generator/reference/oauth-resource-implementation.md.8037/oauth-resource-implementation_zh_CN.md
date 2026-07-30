# OAuth 资源的 JSSP 实现方针

作为 OAuth REST-API 被调用的 JSSP（`.js`）的实现规则。
基本结构与常规 REST-API（`jssp-page-generator` 的函数容器）相同，但 **不需要安全令牌验证**（因 OAuth 访问令牌作为认证起作用）这一点是重大差异。

> 顺便提一下，不需要 `.html` 配对文件这点 **常规 REST-API（`/api/` 下）与 OAuth REST-API（`/oauth/` 下）都通用**。`.html` 配对必需的只有画面（`view/` 下）。

## 存放位置

```
src/main/jssp/src/{功能名}/oauth/{file}.js
```

在功能目录正下方设置 `oauth/` 子目录，集中放置 OAuth 公开的 REST-API。
与 `{功能名}/view/`・`{功能名}/api/`（CSRF 安全令牌版 REST-API）・`{功能名}/job/`・`{功能名}/workflow/` 等并列存在的结构。

与 `oauth-client-resources-config` 的 `<client-resource target="..." />` 中指定的路径保持一致。

| `target` 值 | 实体文件 |
|-------------|--------------|
| `sample_oauth/oauth/get_user` | `src/main/jssp/src/sample_oauth/oauth/get_user.js` |
| `equipment_api/oauth/list` | `src/main/jssp/src/equipment_api/oauth/list.js` |

> **不得创建 `.html` 配对文件。** OAuth 资源不返回展示页面因此不需要，放置空的 `.html` 会成为混乱的根源。

## 必需事项

| 项目 | 常规 REST-API | OAuth REST-API |
|------|:-------------:|:--------------:|
| 实现 `init(request)` 作为入口 | ○ | ○ |
| HTTP 方法验证（405 拒绝） | ○ | ○ |
| 请求参数验证（400） | ○ | ○ |
| **安全令牌验证** | ○（更新类必需） | ×（因 OAuth 令牌认证而不需要） |
| 用 `Web.getHTTPResponse().setStatus()` 设置适当的 HTTP 状态 | ○ | ○ |
| 错误 JSON 为 `{ error: true, errorMessage: "[代码] 消息" }` 格式 | ○ | ○ |
| 正常 JSON 为 `{ error: false, data: {...} }` 格式 | ○ | ○ |
| 绑定变量 (`$data` 等) 的使用 | ○（在画面端引用） | ×（因不返回 HTML 而不需要） |

## 入口骨架

```javascript
/**
 * {API 名} REST-API（OAuth 公开）
 *
 * @file {file}.js
 * @description {API 的说明}
 */

// ========================================
// 常量定义
// ========================================
let ERROR_CODE_INVALID_REQUEST = 'E.{产品}.{功能}.{API 名}.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.{产品}.{功能}.{API 名}.00002';
let ERROR_CODE_INTERNAL = 'E.{产品}.{功能}.{API 名}.99999';

let ALLOWED_METHODS = ['GET'];   // 公开的 HTTP 方法

// ========================================
// 入口
// ========================================
/**
 * OAuth REST-API 的入口。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    // HTTP 方法检查 (405)
    checkMethod(request);
    // 请求参数验证 (400)
    validateRequest(request);
    // 业务逻辑
    response = {
      error: false,
      data: processBusinessLogic(request),
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || '发生了意外错误。';

    if (statusCode >= 500) {
      logger.error('[{API 名}] API 处理中发生错误。code={} message={}', [code, message]);
    } else {
      logger.warn('[{API 名}] 无法受理 API 请求。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  sendJsonResponse(response, statusCode);
}

// ========================================
// 方法・验证
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      '方法 ' + method + ' 不被允许。');
  }
}

function validateRequest(request) {
  // TODO: 参数验证
}

function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

// ========================================
// 业务逻辑
// ========================================
function processBusinessLogic(request) {
  // TODO: 业务处理
  return {};
}

// ========================================
// 响应发送
// ========================================
function sendJsonResponse(response, statusCode) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}
```

## 与常规 REST-API 的差分（代码上）

**删除** 安全令牌验证相关（`verifySecureToken` 函数、`SecureTokenManager` 的实例化、`ERROR_CODE_INVALID_TOKEN` 常量）。
原因是 OAuth 访问令牌作为认证起作用（详情见 `oauth-overview.md`）。
具体差分清单（CSRF 安全令牌版 → OAuth 版的重写示例）请参考 `assets/sample-oauth-get-user.md` 「与既有 `sample_api/api/get_user.js` 的差分」。

## 获取认证用户

可获取作为 OAuth 访问令牌持有者的「令牌发行用户」的上下文。

```javascript
let accountContext = Contexts.getAccountContext();
let userCd = accountContext.userCd;        // 用户代码
let locale = accountContext.locale;        // 语言区域
// ... AccountContext 的字段几乎与常规画面相同
```

> 详情请参考 `.agents/skills/jssp-page-generator/reference/api-account-context.md`。

## 获取请求参数

与常规 REST-API 相同，可通过 `request[键]` 或 `request.getParameter(键)` 获取。

| 获取方法 | 说明 |
|---------|------|
| `request['paramName']` | 查询字符串或 form 参数 |
| `request.getMethod()` | `GET` / `POST` / `PUT` / `DELETE` 等 |
| `request.getHeader('Header-Name')` | 请求头 |
| `request.getContentType()` | Content-Type |
| `request.getInputStream()` | 请求正文（二进制／JSON 等）。接收 `application/json` 时从流中读取 |

接收 `application/json` 正文的实现模式请参考 `.agents/skills/jssp-page-generator/assets/post-json-api.md`（OAuth 版的正文获取步骤也相同）。

## 响应与状态码

```javascript
let httpResponse = Web.getHTTPResponse();
httpResponse.setStatus(statusCode);
httpResponse.setContentType('application/json; charset=utf-8');
httpResponse.sendMessageBodyString(JSON.stringify(response));
```

| 状态 | 用途 |
|-----------|------|
| `200` | 正常响应 |
| `400` | 请求参数不正确 |
| `404` | 资源／用户未找到 |
| `405` | 未预期的 HTTP 方法 |
| `500` | 服务器内部错误 |

`401` / `403` 由 **平台的 OAuth 调度器端** 返回（令牌无效・过期・scope 不足）。不需要在资源实现内构造。

## 机密信息的处理

- 响应 JSON 中 **不得包含密码・认证令牌・个人信息（未脱敏的电话号码或邮件等）**
- 日志输出时同样（活用 `.agents/requirements/jssp-logging/AGENTS.md` 的 `MaskUtil`）
- 响应中的 `userCd`（用户代码）是常规 REST-API 也会返回的信息，无问题，但 **密码哈希・会话 ID 等严禁**

## 相关参考

- `oauth-overview.md` - 全体概述
- `oauth-resources-config.md` - URL 映射与 scope 的指定
- `.agents/skills/jssp-page-generator/reference/api-web.md` - `Web.getHTTPResponse()` 的详情
- `.agents/skills/jssp-page-generator/reference/api-account-context.md` - 认证用户上下文
- `.agents/skills/jssp-page-generator/reference/argument-request.md` - request 参数
- `.agents/requirements/jssp-error-handling/AGENTS.md` - 错误响应格式・HTTP 状态
- `.agents/requirements/jssp-security/AGENTS.md` - SQL 注入・XSS 对策（OAuth API 中同样适用）

## 检查清单

（上面「必需事项」表所涵盖的基本项目省略。仅列出实现〜评审时需追加确认的特有项目）

- [ ] 错误代码是否为 `E.{产品}.{功能}.{API 名}.{编号}` 格式（5xx 是否分配了 `ERROR_CODE_INTERNAL`）？
- [ ] 4xx 系是否用 `logger.warn`、5xx 系是否用 `logger.error` 输出日志？
- [ ] 响应中是否未包含机密信息（密码・令牌・未脱敏的个人信息等）？
- [ ] 涉及 SQL 访问时是否用 `DbParameter` 绑定（禁止字符串拼接，参考 `.agents/requirements/jssp-2way-sql/AGENTS.md`）？
- [ ] 用 `Contexts.getAccountContext()` 引用用户上下文时是否进行了 null 检查？
