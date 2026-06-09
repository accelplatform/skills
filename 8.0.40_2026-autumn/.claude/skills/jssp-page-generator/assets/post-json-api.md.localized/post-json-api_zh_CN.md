# 原始 JSON 接收 REST-API 模板

## 概述

通过 POST 方法在请求体中发送的原始 JSON（`application/json`），将其接收并以 JSON 形式返回解析结果摘要的回显型 API，以及用于验证其运行的画面的模板。

- 接收 API：`POST /sample_api/api/post_json`（必须设置 `Content-Type: application/json` 与 `X-Intramart-Secure-Token`）
- 测试画面：`/sample_api/view/post_json_test`

将本模板作为"通过 `request.getMessageBodyAsString()` 获取请求体的原始 JSON 并执行 `JSON.parse`"模式的**标准形式**使用。multipart/form-data 的文件接收请使用 `file-upload-download-api.md`。

## 在其他类别中使用时的替换要点

本资产以 `sample_api` 作为类别名编写。在用于其他功能名（如 `inventory_api`）时，需要一并替换以下所有内容。**遗漏替换虽然不会导致构建失败，但可能引发错误代码一致性破坏或 API URL 偏移等风险。**

| 种类 | 替换对象 | 替换示例 |
|------|----------|----------|
| 部署路径 | `src/main/jssp/src/sample_api/` | `src/main/jssp/src/{功能名}/` |
| API URL（路由 XML 的 `path`） | `/sample_api/api/post_json` | `/{功能名}/post_json` 等 |
| 路由 XML 的 `page` 属性 | `sample_api/api/post_json`、`sample_api/view/post_json_test` | `{功能名}/api/post_json` 等 |
| HTML 端的 `POST_JSON_API_PATH` | `'sample_api/api/post_json'` | `'{功能名}/post_json'` |
| 错误代码前缀 | `E.IWP.SAMPLE.POST_JSON.*` | `E.IWP.{功能名大写}.POST_JSON.*` 等 |
| `$subTitle` | `'sample_api'` | `'{功能名}'` |
| 日志标签 | `[post_json]` | （无需修改） |

类别名替换**需逐字逐句确认整个样本**后再进行。务必通过 `grep -n 'sample_api\|SAMPLE\.' {新类别的文件}` 验证是否有残留。

## 文件结构

```
src/main/jssp/src/sample_api/
  ├── api/
  │    └── post_json.js          # 原始 JSON 接收 API
  └── view/
       ├── post_json_test.js     # 测试画面 函数容器
       └── post_json_test.html   # 测试画面 展示页面

src/main/conf/routing-jssp-config/
  └── sample_api.xml             # 路由配置
```

## 设计要点

### 请求体的获取

要获取原始 JSON，使用 `request.getMessageBodyAsString()`。
内部会根据 ServletRequest 的编码设置将其转换为 Unicode 字符串，因此可通过 `Content-Type` 头的 `charset` 控制行为。客户端应使用 `Content-Type: application/json; charset=utf-8` 发送。

### Content-Type 的检验

获取 `request.getContentType()`，确认其以 `application/json` 开头。
忽视此项检查可能导致用 `application/x-www-form-urlencoded` 发送的值被尝试当作 JSON 解析，进而返回 500 类错误的事故。

### 请求体大小上限

务必**事先用 `request.getContentLength()` 拒绝超出上限的请求**（默认 1MB）。
可降低攻击者发送巨大 JSON 压迫内存的风险。

### 安全性

| 项目 | 对策 |
|------|------|
| CSRF | `X-Intramart-Secure-Token` 检验（POST 必须） |
| 不正确的 Content-Type | 严格检查 `application/json` 前缀 |
| 大小攻击 | 用 `getContentLength()` 事先检查上限（默认 1MB） |
| 非法 JSON | 将 `JSON.parse` 的异常作为 400 返回 |

### 错误响应

- 成功时：`application/json` 返回 `{error:false, data:{...}}`
- 失败时：`application/json` 返回 `{error:true, errorMessage:"[代码] 消息"}`，并附带 HTTP 4xx/5xx
- 错误代码命名遵循 `{{AGENT_RULES}}/jssp-error-handling.md`

### `ApiError` 类型的处理

**禁止按文件单位声明 `@typedef {Error & {code, httpStatus}} ApiError`**。
在同一功能目录下放置多个 API 文件时，`tsc` 会引发 `TS2300 Duplicate identifier`。**必须使用内联 `@type` 注解进行类型转换**（请参阅代码示例）。

---

## 原始 JSON 接收 API（sample_api/api/post_json.js）

```javascript
/**
 * 原始 JSON 接收 REST-API
 *
 * @file post_json.js
 * @description 接收通过 POST 方法在请求体中发送的原始 JSON，
 *              将解析结果的摘要（类型、键数、接收内容）以 JSON 形式返回的回显型 API。
 */

// ========================================
// 常量定义
// ========================================
let CONTENT_TYPE_JSON_PREFIX = 'application/json';
let MAX_BODY_LENGTH_BYTES = 1 * 1024 * 1024;

let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SAMPLE.POST_JSON.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SAMPLE.POST_JSON.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.SAMPLE.POST_JSON.00003';
let ERROR_CODE_INVALID_CONTENT_TYPE = 'E.IWP.SAMPLE.POST_JSON.00004';
let ERROR_CODE_BODY_TOO_LARGE = 'E.IWP.SAMPLE.POST_JSON.00005';
let ERROR_CODE_INVALID_JSON = 'E.IWP.SAMPLE.POST_JSON.00006';
let ERROR_CODE_INTERNAL = 'E.IWP.SAMPLE.POST_JSON.99999';

let ALLOWED_METHODS = ['POST'];

// ========================================
// 入口点
// ========================================
/**
 * REST-API 的入口点。
 * 接收请求体的原始 JSON，并以 JSON 形式返回摘要信息。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    checkMethod(request);
    verifySecureToken(request);
    checkContentType(request);
    let parsedBody = readJsonBody(request);
    response = {
      error: false,
      data: buildSummary(parsedBody, request),
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || '发生了意外错误。';

    if (statusCode >= 500) {
      logger.error('[post_json] API 处理中发生错误。code={} message={}', [code, message]);
    } else {
      logger.warn('[post_json] API 请求无法受理。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  sendJsonResponse(response, statusCode);
}

// ========================================
// 方法・安全令牌・内容类型检验
// ========================================
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
 * 进行安全令牌（CSRF 对策）的检验。
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
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '安全令牌校验失败。');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '安全令牌无效。');
  }
}

/**
 * 检查 Content-Type 是否为 application/json 系列。
 *
 * @param {Object} request - 请求对象
 */
function checkContentType(request) {
  let contentType = request.getContentType();
  if (!contentType) {
    throwApiError(ERROR_CODE_INVALID_CONTENT_TYPE, 400,
      '未指定 Content-Type。请使用 application/json 发送。');
  }
  let normalized = String(contentType).toLowerCase();
  if (normalized.indexOf(CONTENT_TYPE_JSON_PREFIX) !== 0) {
    throwApiError(ERROR_CODE_INVALID_CONTENT_TYPE, 400,
      'Content-Type 必须指定为 application/json。received=' + contentType);
  }
}

// ========================================
// 请求体获取・JSON 解析
// ========================================
/**
 * 获取请求体并将其解析为 JSON。
 *
 * @param {Object} request - 请求对象
 * @return {*} 解析结果（对象、数组、基本类型）
 */
function readJsonBody(request) {
  let contentLength = request.getContentLength();
  if (contentLength > MAX_BODY_LENGTH_BYTES) {
    throwApiError(ERROR_CODE_BODY_TOO_LARGE, 400,
      '请求体超过上限（' + MAX_BODY_LENGTH_BYTES + ' 字节）。');
  }

  let body = request.getMessageBodyAsString();
  if (!body || body.length === 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, '请求体为空。');
  }

  if (body.length > MAX_BODY_LENGTH_BYTES) {
    throwApiError(ERROR_CODE_BODY_TOO_LARGE, 400,
      '请求体超过上限（' + MAX_BODY_LENGTH_BYTES + ' 个字符）。');
  }

  try {
    return JSON.parse(body);
  } catch (e) {
    throwApiError(ERROR_CODE_INVALID_JSON, 400,
      'JSON 解析失败。message=' + e.message);
  }
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 根据已解析的请求体生成要包含在响应中的摘要信息。
 *
 * @param {*} parsedBody - 已解析的请求体
 * @param {Object} request - 请求对象
 * @return {Object} 响应数据
 */
function buildSummary(parsedBody, request) {
  let valueType = detectValueType(parsedBody);
  let summary = {
    receivedAt: formatDateTime(new Date()),
    contentType: request.getContentType(),
    contentLength: request.getContentLength(),
    valueType: valueType,
    received: parsedBody,
  };

  if (valueType === 'object') {
    let keys = Object.keys(parsedBody);
    summary.keyCount = keys.length;
    summary.keys = keys;
  } else if (valueType === 'array') {
    summary.itemCount = parsedBody.length;
  }

  return summary;
}

/**
 * 判定值的类型。
 *
 * @param {*} value - 判定对象的值
 * @return {string} 类型名称（object / array / string / number / boolean / null）
 */
function detectValueType(value) {
  if (value === null) {
    return 'null';
  }
  if (value instanceof Array) {
    return 'array';
  }
  return typeof value;
}

/**
 * 将 Date 格式化为 YYYY-MM-DD HH:mm:ss 字符串。
 *
 * @param {Date} value - 日期时间值
 * @return {string} 已格式化字符串
 */
function formatDateTime(value) {
  return value.getFullYear()
    + '-' + padZero(value.getMonth() + 1)
    + '-' + padZero(value.getDate())
    + ' ' + padZero(value.getHours())
    + ':' + padZero(value.getMinutes())
    + ':' + padZero(value.getSeconds());
}

/**
 * 将一位数字以 2 位表示进行零填充。
 *
 * @param {number} value - 数值
 * @return {string} 已零填充字符串
 */
function padZero(value) {
  return value < 10 ? '0' + value : String(value);
}

// ========================================
// 异常・响应发送
// ========================================
/**
 * 附加错误代码与 HTTP 状态后抛出异常。
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

/**
 * 发送 JSON 响应。发送后 JavaScript 的执行会停止。
 *
 * @param {Object} response - 要发送的响应对象
 * @param {number} statusCode - HTTP 状态码
 */
function sendJsonResponse(response, statusCode) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}
```

---

## 测试画面 函数容器（sample_api/view/post_json_test.js）

```javascript
/**
 * 原始 JSON 接收 REST-API 测试画面
 *
 * @file post_json_test.js
 * @description /sample_api/api/post_json 的运行验证画面。
 *              在文本区域中输入请求 JSON，将响应显示在画面上。
 */

// ========================================
// 绑定变量（用于展示页面联动）
// ========================================
let $title = '原始 JSON 接收 API 测试';
let $subTitle = 'sample_api';
let $data = '{}';

// ========================================
// 入口点
// ========================================
/**
 * 画面显示的入口点。
 *
 * @param {Object} request - 请求对象
 */
function init(request) {
  let response = {
    result: {},
    error: {
      code: '',
      message: '',
    },
  };
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}
```

---

## 测试画面 展示页面（sample_api/view/post_json_test.html）

并列布置请求体用文本区域和响应显示用文本区域的验证画面。
通过"加载样本"载入用于运行验证的 JSON，"发送"触发 `fetch`，显示 HTTP 状态、接收类型、摘要、响应体。

```html
<imart type="head">
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <style>
    .post-json-actions {
      display: flex;
      gap: 0.75em;
      align-items: center;
      margin-top: 0.5em;
    }
    .post-json-response {
      background-color: var(--imds-color-background-secondary, #f5f7fa);
      border: 1px solid var(--imds-color-border, #d0d7de);
      border-radius: 0.5em;
      padding: 1em 1.5em;
      margin-top: 1em;
    }
    .post-json-response-meta {
      display: flex;
      gap: 1.5em;
      flex-wrap: wrap;
      margin-bottom: 0.75em;
      font-size: 0.875em;
    }
    .post-json-response-meta dt {
      font-weight: bold;
      display: inline;
      margin-right: 0.5em;
    }
    .post-json-response-meta dd {
      display: inline;
      margin: 0;
    }
    .post-json-response-body {
      width: 100%;
      min-height: 12em;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875em;
    }
    .post-json-request-body {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875em;
    }
  </style>
  <script>
    const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

    document.addEventListener('DOMContentLoaded', () => {
      const POST_JSON_API_PATH = 'sample_api/api/post_json';
      const SAMPLE_REQUEST = {
        userId: 'user001',
        userName: '山田太郎',
        age: 30,
        roles: ['admin', 'user'],
        active: true
      };

      function getSecureToken() {
        return document.querySelector('meta[name=im_secure_token]').content;
      }

      function getElement(id) {
        return document.getElementById(id);
      }

      function clearResponse() {
        getElement('post-json-response').style.display = 'none';
        getElement(':responseStatus:').textContent = '';
        getElement(':responseValueType:').textContent = '';
        getElement(':responseSummary:').textContent = '';
        getElement(':responseBody:').value = '';
      }

      function showResponse(status, result) {
        getElement(':responseStatus:').textContent = String(status);

        if (result && result.error === false && result.data) {
          const data = result.data;
          getElement(':responseValueType:').textContent = data.valueType || '';
          let summaryParts = [];
          if (data.keyCount !== undefined) {
            summaryParts.push('keys=' + data.keyCount);
          }
          if (data.itemCount !== undefined) {
            summaryParts.push('items=' + data.itemCount);
          }
          if (data.contentLength !== undefined) {
            summaryParts.push('contentLength=' + data.contentLength);
          }
          getElement(':responseSummary:').textContent = summaryParts.join(' / ');
        } else {
          getElement(':responseValueType:').textContent = '';
          getElement(':responseSummary:').textContent = '';
        }

        getElement(':responseBody:').value = JSON.stringify(result, null, 2);
        getElement('post-json-response').style.display = '';
      }

      async function sendPostJson(rawBody) {
        const response = await fetch(POST_JSON_API_PATH, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Intramart-Secure-Token': getSecureToken()
          },
          body: rawBody
        });

        let result = null;
        try {
          result = await response.json();
        } catch (error) {
          result = null;
        }

        if (!result) {
          imuiShowErrorMessage('无法将响应解析为 JSON。');
          showResponse(response.status, { error: true, errorMessage: '(JSON parse failed)' });
          return false;
        }

        showResponse(response.status, result);

        if (result.error) {
          imuiShowErrorMessage(result.errorMessage);
          return false;
        }

        imuiShowSuccessMessage('请求已发送。');
        return true;
      }

      getElement('send-button').addEventListener('click', () => {
        const rawBody = getElement(':requestBody:').value;
        if (!rawBody || rawBody.trim().length === 0) {
          imuiShowWarningMessage('请输入请求体。');
          return;
        }
        clearResponse();
        sendPostJson(rawBody);
      });

      getElement('load-sample-button').addEventListener('click', () => {
        getElement(':requestBody:').value = JSON.stringify(SAMPLE_REQUEST, null, 2);
        clearResponse();
      });

      getElement('clear-button').addEventListener('click', () => {
        getElement(':requestBody:').value = '';
        clearResponse();
      });

      if ($data.error && $data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      }
    });
  </script>
</imart>

<div id="container">
  <div class="imds-container">
    <header class="imds-header">
      <div class="imds-header-icon">
        <span class="imds-icon-wrapper is-large">
          <span class="imds-icon is-medium"><i class="fa-solid fa-code"></i></span>
        </span>
      </div>
      <div class="imds-header-title">
        <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
        <h1 id="page-title"><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
      </div>
    </header>

    <main>
      <imart type="imSecureToken" />

      <section class="imds-py-3 imds-px-4" aria-labelledby="request-section-title">
        <h2 id="request-section-title" class="imds-mb-3">请求</h2>
        <div class="imds-field" for=":requestBody:">
          <div class="imds-field-label">
            <label for=":requestBody:" class="has-text-weight-bold">JSON 请求体</label>
          </div>
          <div class="imds-field-control">
            <textarea
              id=":requestBody:"
              name="requestBody"
              class="imds-textarea post-json-request-body"
              rows="10"
              placeholder='{ "key": "value" }'></textarea>
            <span class="imds-help-text">以 POST 方法、Content-Type: application/json 发送。</span>
          </div>
        </div>
        <div class="post-json-actions">
          <button type="button" class="imds-button is-primary" id="send-button">
            <span class="imds-icon"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></span>
            <span class="imds-button-text">发送</span>
          </button>
          <button type="button" class="imds-button is-outlined" id="load-sample-button">
            <span class="imds-button-text">加载样本</span>
          </button>
          <button type="button" class="imds-button is-ghost" id="clear-button">
            <span class="imds-button-text">清除</span>
          </button>
        </div>
      </section>

      <section class="imds-py-3 imds-px-4" aria-labelledby="response-section-title">
        <h2 id="response-section-title" class="imds-mb-3">响应</h2>
        <div id="post-json-response" class="post-json-response" style="display:none;" role="status" aria-live="polite">
          <dl class="post-json-response-meta">
            <div>
              <dt>HTTP 状态</dt>
              <dd id=":responseStatus:"></dd>
            </div>
            <div>
              <dt>接收类型</dt>
              <dd id=":responseValueType:"></dd>
            </div>
            <div>
              <dt>摘要</dt>
              <dd id=":responseSummary:"></dd>
            </div>
          </dl>
          <div class="imds-field" for=":responseBody:">
            <div class="imds-field-label">
              <label for=":responseBody:" class="has-text-weight-bold">响应体</label>
            </div>
            <div class="imds-field-control">
              <textarea
                id=":responseBody:"
                name="responseBody"
                class="imds-textarea post-json-response-body"
                rows="15"
                readonly></textarea>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</div>
```

---

## 路由配置（sample_api.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <authz-default mapper="welcome-all" />

  <file-mapping path="/sample_api/api/post_json" page="sample_api/api/post_json">
  </file-mapping>

  <file-mapping path="/sample_api/view/post_json_test" page="sample_api/view/post_json_test">
  </file-mapping>

</routing-jssp-config>
```

生产环境应使用恰当的授权设置替代 `welcome-all`。

---

## 实现要点

### `getMessageBodyAsString()` 仅用于 POST/PUT/PATCH

GET 请求按规范消息体为空。即使调用 `getMessageBodyAsString()` 也不会出错，但会返回空字符串。本模板限定 POST，但要扩展到 PUT/PATCH 时，只需像 `ALLOWED_METHODS = ['POST', 'PUT', 'PATCH']` 这样添加即可。

### 必须捕获 `JSON.parse` 的异常

来自客户端的非法 JSON 字符串**必须以 400 返回**。不用 `try` 包围而直接调用 `JSON.parse` 会作为 500 返回，与服务器故障无法区分。

### 大小检查应用 Content-Length 与字符串长度双重判断

`getContentLength()` 是来自 HTTP 头的声明值，存在恶意客户端伪造的可能。结合 `getMessageBodyAsString()` 取得的字符串长度同时检查可实现双重防御。

### Content-Type 检验的规范化

`Content-Type` 会如 `application/json; charset=utf-8` 带参数到达，因此应使用**前缀匹配**（`indexOf(...) === 0`）检查。等值比较（`===`）在指定 charset 时必然不匹配。

### 安全令牌

POST 视为更新操作，要求 `X-Intramart-Secure-Token`。
客户端从 `<meta name="im_secure_token">` 取出并附加到 `fetch` 的请求头（实现示例请参阅本文件"测试画面 展示页面"）。

### 不使用 `ApiError` typedef（再次提示）

按文件单位声明 `@typedef {Error & {code, httpStatus}} ApiError` 会引发 `tsc` 的 `TS2300 Duplicate identifier`。**用内联 `@type` 注解进行类型转换是本模板的标准形式**。详情参见 `{{AGENT_RULES}}/jssp-error-handling.md`。

## 相关

- `reference/argument-request.md` - `request.getMessageBodyAsString()` 的规格
- `reference/api-secure-token-manager.md` - CSRF 令牌的校验
- `reference/secure-token-check.md` - 客户端与服务端的一连串校验模式
- `{{AGENT_RULES}}/jssp-error-handling.md` - 错误代码命名规则与 API 错误响应格式
- `{{AGENT_RULES}}/jssp-security.md` - 输入验证的整体方针
- `assets/file-upload-download-api.md` - multipart/form-data（文件）的场合
