---
applyTo: "src/main/jssp/**/*.js"
description: "エラー処理の方針"
---

# 错误处理规约

> **适用范围**: 🟢 **始终** — 适用于所有 JSSP 实现。try-catch、错误响应结构、错误代码命名等。

## 基本原则

1. 必须捕获错误并进行适当处理
2. 区分**可恢复错误**和**不可恢复错误**
3. 面向用户的消息应一般化处理
4. 将详细信息输出到日志
5. **日志中不得包含机密信息**

## 错误类型与处理方式

错误分为"可恢复"和"不可恢复"两类，分别采用不同方式处理。

### 可恢复错误（绑定变量方式）

用户可通过修改输入或重新操作来解决的错误。

**示例：**

- 输入值的验证错误（在函数容器内验证，跳转到错误页面）
- 调用 API 时的验证错误（在响应中包含错误信息）

**实现模式（画面）：**

```javascript
let $data = '{}';

function init(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',
      message: '',
    },
  };

  try {
    // 验证请求参数
    validateRequest(request);
    // 执行业务逻辑主处理
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('画面显示中发生错误。{}', e.message);
    transferErrorPage('E001', '发生了意外错误。');
  }

  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

function transferErrorPage(code, message) {
  let param = {
    title: '发生了系统错误',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

### 不可恢复错误（页面跳转方式）

因系统故障等用户操作无法解决的错误。

**示例：**

- 数据库连接错误
- 外部 API 连接错误
- 意外异常
- 会话过期

**实现模式：**

```javascript
function init(request) {
  let logger = Logger.getLogger();
  try {
    // 处理
  } catch (e) {
    logger.error('系统错误：{}', e.message);
    transferErrorPage('E001', '发生了意外错误。');
  }
}

function transferErrorPage(code, message) {
  let param = {
    title: '发生了系统错误',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

## 错误信息结构（画面）

存放在画面绑定变量 `$data` 中的响应具有以下结构。

```javascript
let response = {
  result: null,          // 正常时的处理结果
  error: {
    code: 'E001',        // 错误代码
    message: '错误消息',   // 面向用户的消息
  },
};
```

## API 响应结构（JSON）

REST-API 返回的 JSON 响应采用以下两种格式之一。

### 正常时

```json
{
  "error": false,
  "data": { ... }
}
```

### 错误时

```json
{
  "error": true,
  "errorMessage": "[E.IWP.FOO.BAR.00001] 错误消息"
}
```

- `error` 为布尔值。仅当为 `true` 时包含 `errorMessage`，仅当为 `false` 时包含 `data`（不得混用）。
- `errorMessage` 采用 `[错误代码] 消息` 的格式，将错误代码以方括号嵌入开头。不得将错误代码作为独立字段保留。

### 错误代码的命名规则

错误代码以 `E.<产品>.<模块>.<子模块>.<序号>` 的格式命名。

| 段 | 内容 | 示例 |
|----|------|------|
| `E` | 表示错误的固定值 | `E` |
| `<产品>` | 产品标识符（项目共通） | `IWP` |
| `<模块>` | 功能类别 | `EQUIP`, `WORKFLOW` |
| `<子模块>` | 功能内的分类 | `LENDING`, `MASTER` |
| `<序号>` | 5 位通号 | `00001` |

示例：`E.IWP.EQUIP.LENDING.00001`

### HTTP 状态码

对于返回 JSON 的 REST-API，根据错误内容返回以下状态码。
状态码通过 `httpResponse.setStatus(sc)` 设置。

| 状态码 | 用途 |
|--------|------|
| `200` | 正常结束 |
| `400` | 请求参数验证错误、安全令牌验证错误 |
| `405` | 不支持的 HTTP 方法 |
| `500` | 服务器内部错误（DB 错误、意外异常等） |

**补充：**
- `401` (Unauthorized) / `403` (Forbidden) 由 intra-mart 平台端判定，在到达 `init` 函数之前已返回，因此应用层无需实现。
- 推荐在抛出的 Error 对象上附加 `httpStatus` 属性，并在 catch 端取出后传递给 `setStatus()`（实现示例见后述"API 的错误处理"）。

### 安全令牌（CSRF 对策）

对于更新类 API（POST/PUT/DELETE），必须实施**安全令牌验证**作为 CSRF 对策。

- 客户端在请求头 `X-Intramart-Secure-Token` 中附加令牌发送（参见 `jssp-presentation-page.md`）
- 服务端使用 `SecureTokenManager.verify(token)` 进行验证，失败时以 **400** 返回 `{error: true, errorMessage}`
- 令牌未附加、验证失败、有效期过期均按 400 处理
- 参照类（GET）API 在返回机密数据时也应进行同样验证

## 展示页面中的错误显示

```html
<script>
(function($data) {
  document.addEventListener('DOMContentLoaded', function() {
    if ($data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
    } else {
      renderPage($data.result);
    }
  });

  function renderPage(result) {
    // 画面渲染处理
  }
})(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
</script>
```

## 错误消息指南

### 面向用户的消息

| 类型 | 消息示例 |
|------|---------|
| 输入错误 | 请输入用户ID。 |
| 搜索无结果 | 未找到匹配数据。 |
| 权限错误 | 您没有执行此操作的权限。 |
| 系统错误 | 发生了系统错误，请联系管理员。 |

### 面向日志的消息

```javascript
let logger = Logger.getLogger();

// 错误日志示例
logger.error('[E001] 用户获取错误：userId={}, message={}', userId, e.message);

// 同时输出堆栈跟踪
logger.error('[E001] 用户获取错误：{}', e.message);
if (e.stack) {
  logger.error('堆栈跟踪：{}', e.stack);
}
```

## 验证错误

```javascript
/**
 * 验证处理
 * 有错误时抛出异常
 */
function validateRequest(request) {
  // 用户代码：必填，最多 100 个字符
  let userCode = request['userCode'];
  if (!userCode || userCode.length === 0) {
    throw new Error('userCode 为必填项。');
  } else if (userCode.length > 100) {
    throw new Error('userCode 最多为 100 个字符。');
  }

  // 用户姓名（姓）：必填，最多 30 个字符
  let userLastName = request['userLastName'];
  if (!userLastName || userLastName.length === 0) {
    throw new Error('userLastName 为必填项。');
  } else if (userLastName.length > 30) {
    throw new Error('userLastName 最多为 30 个字符。');
  }

  // 用户姓名（名）：必填，最多 30 个字符
  let userFirstName = request['userFirstName'];
  if (!userFirstName || userFirstName.length === 0) {
    throw new Error('userFirstName 为必填项。');
  } else if (userFirstName.length > 30) {
    throw new Error('userFirstName 最多为 30 个字符。');
  }
}
```

## init 函数中错误处理的完整示例

### 画面的错误处理

```javascript
let $title = '画面标题';        // 画面本身的名称
let $subTitle = '副标题';       // 画面的副名称（画面所属类别的名称）
let $data = '{}';

function init(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',
      message: '',
    },
  };

  try {
    // 验证请求参数
    validateRequest(request);
    // 执行业务逻辑主处理
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('画面显示中发生错误。{}', e.message);
    transferErrorPage('E001', '发生了意外错误。');
  }

  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

function validateRequest(request) {
  // 验证处理
}

function processBusinessLogic(request) {
  // 业务逻辑主处理
  return {
    userCode: '',
    userFirstName: '',
    userLastName: '',
    age: '',
  };
}

function transferErrorPage(code, message) {
  let param = {
    title: '发生了系统错误',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

### API 的错误处理

API 按"API 响应结构（JSON）"的格式返回。
在抛出的 Error 对象上附加 `code` 与 `httpStatus`，并在 catch 端取出后用于组装 `errorMessage` 和调用 `setStatus()`。

由于标准 `Error` 类型不具备 `code` / `httpStatus` 属性，为使将来启用 TypeScript 类型检查时也能通过，将 `new Error()` 的返回值和 catch 的 `e` **使用内联 `@type` 注解进行类型转换**。

> **注意：** 不要按文件单位声明 `@typedef ApiError`。
> 当同一功能目录下并存多个 API 文件（如 `api/foo.js`、`api/bar.js`）时，对整个目录运行 `tsc` 必然会引发 `TS2300 Duplicate identifier 'ApiError'`。
> 如需共享类型别名，请在 `d.ts/` 目录下作为 `interface` 仅声明一次。

```javascript
let ERROR_CODE_INVALID_REQUEST = 'E.IWP.FOO.BAR.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.FOO.BAR.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.FOO.BAR.00003';
let ERROR_CODE_INTERNAL = 'E.IWP.FOO.BAR.99999';

let ALLOWED_METHODS = ['POST'];

function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    // HTTP 方法检查 (405)
    checkMethod(request);
    // 安全令牌验证 (400)
    verifySecureToken(request);
    // 请求参数验证 (400)
    validateRequest(request);
    // 执行业务逻辑主处理（异常时为 500）
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
      logger.error('API 处理中发生错误。code={} message={}', [code, message]);
    } else {
      logger.warn('API 请求不正确。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  // 以 JSON 格式返回
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}

/**
 * 检查 HTTP 方法是否被允许。
 *
 * @param {Object} request - 请求对象
 */
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      '方法 ' + method + ' 不被允许。');
  }
}

/**
 * 验证安全令牌（CSRF 对策）。
 * 使用 `SecureTokenManager.verify()` 验证 `X-Intramart-Secure-Token` 请求头，失败时抛出 400。
 *
 * @param {Object} request - 请求对象
 */
function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '未指定安全令牌。');
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '安全令牌验证失败。');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '安全令牌无效。');
  }
}

/**
 * 抛出验证错误（400）。
 *
 * @param {string} message - 错误消息
 */
function throwValidationError(message) {
  throwApiError(ERROR_CODE_INVALID_REQUEST, 400, message);
}

/**
 * 附加错误代码和 HTTP 状态码后抛出异常。
 *
 * @param {string} code - 错误代码
 * @param {number} httpStatus - HTTP 状态码
 * @param {string} message - 错误消息
 */
function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}
```
