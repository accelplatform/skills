# 业务逻辑实现示例：经由 OAuth 的用户信息查询 API

接收用户代码（`userCd`），以 JSON 返回对象账户信息的 REST-API 的 **带业务逻辑的完整版**。
将 `src/main/jssp/src/sample_api/api/get_user.js`（CSRF 安全令牌版）重写为 OAuth 版的内容。

## 功能规格

| 项目 | 内容 |
|------|------|
| 功能名 | `sample_oauth` |
| API 名 | 用户信息查询 |
| 公开 URL | `/oauth/sample_oauth/get_user` |
| HTTP 方法 | `GET` |
| 查询参数 | `userCd`（必填、最大 100 字符、`[0-9A-Za-z_@.+!\-]+`） |
| 所需 scope | `sample_oauth_user_read` |
| 授权 | `welcome-all`（跳过授权判定，仅由 scope 控制） |
| 认证 | OAuth 访问令牌（`Authorization: Bearer ...`） |
| 响应 | `application/json` |

## 文件构成

| # | 文件 | 生成方法 |
|---|---------|---------|
| 1 | `src/main/conf/oauth-client-scopes-config/sample_oauth.xml` | 由 `scripts/build-oauth.js` 自动生成 |
| 2 | `src/main/conf/oauth-client-resources-config/sample_oauth.xml` | 同上 |
| 3 | `src/main/conf/oauth-client-details-config/sample_oauth.xml` | 同上 |
| 4 | `src/main/jssp/src/sample_oauth/oauth/get_user.js` | `build-oauth.js` 生成骨架，业务逻辑通过 **抄写本文件来手工补充** |

### 1〜3 的 XML 生成步骤

以 [examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json) 为输入运行 `build-oauth.js`，会一次性输出上述 4 个文件。

```bash
node {{AGENT_ROOT}}/skills/jssp-im-oauth-generator/scripts/build-oauth.js \
     {{AGENT_ROOT}}/skills/jssp-im-oauth-generator/examples/sample_oauth.spec.json
```

生成的实际 XML 内容请参考以下:
- `src/main/conf/oauth-client-scopes-config/sample_oauth.xml`
- `src/main/conf/oauth-client-resources-config/sample_oauth.xml`
- `src/main/conf/oauth-client-details-config/sample_oauth.xml`

> **注意:** `client-secret` 与 `redirect-uri` 为项目固有值。仓库管理时请以哑值书写，生产环境用值经由 Importer 的过滤器替换或在租户环境设置时进行替换。

---

## 4. 资源实现（.js）— 带业务逻辑的完整版

`src/main/jssp/src/sample_oauth/oauth/get_user.js`

`build-oauth.js` 自动生成 `init` / `checkMethod` / `validateRequest` / `throwApiError` / `sendJsonResponse` 的 **共通骨架** 部分。
`processBusinessLogic` 的内容按以下进行 **抄写** 并按功能改写。

```javascript
/**
 * 用户信息查询 REST-API（OAuth 公开版）
 *
 * @file get_user.js
 * @description 接收请求参数 userCd，以 JSON 返回对象用户的账户信息。
 *              需要 OAuth 访问令牌认证（scope: sample_oauth_user_read）。
 */

// ========================================
// 常量定义
// ========================================
let USER_CD_MAX_LENGTH = 100;
let USER_CD_PATTERN = /^[0-9A-Za-z_@.+!\-]+$/;

let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SAMPLE_OAUTH.GET_USER.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SAMPLE_OAUTH.GET_USER.00002';
let ERROR_CODE_USER_NOT_FOUND = 'E.IWP.SAMPLE_OAUTH.GET_USER.00004';
let ERROR_CODE_INTERNAL = 'E.IWP.SAMPLE_OAUTH.GET_USER.99999';

let ALLOWED_METHODS = ['GET'];

// ========================================
// 入口
// ========================================
/**
 * OAuth REST-API 的入口。
 * 接收 GET 参数 userCd，以 JSON 格式返回相应的账户信息。
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
    // 业务逻辑（用户不存在为 404，其他异常为 500）
    let userInfo = getUserInfo(request['userCd']);
    if (userInfo === null) {
      throwApiError(ERROR_CODE_USER_NOT_FOUND, 404, '指定的用户不存在。');
    }
    response = {
      error: false,
      data: userInfo,
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || '发生了意外错误。';

    if (statusCode >= 500) {
      logger.error('[sample_oauth/get_user] API 处理中发生错误。code={} message={}', [code, message]);
    } else {
      logger.warn('[sample_oauth/get_user] 无法受理 API 请求。code={} status={} message={}', [code, statusCode, message]);
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
 * 验证请求参数。
 *
 * @param {Object} request - 请求对象
 */
function validateRequest(request) {
  let userCd = request['userCd'];

  if (!userCd || userCd.length === 0) {
    throwValidationError('userCd 为必填项。');
  } else if (userCd.length > USER_CD_MAX_LENGTH) {
    throwValidationError('userCd 最长为 ' + USER_CD_MAX_LENGTH + ' 个字符。');
  } else if (!USER_CD_PATTERN.test(userCd)) {
    throwValidationError('userCd 的格式不正确。');
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
 * 抛出带错误代码・HTTP 状态码的异常。
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

// ========================================
// 业务逻辑
// ========================================
/**
 * 指定用户代码以查询账户信息。
 *
 * @param {string} userCd - 用户代码
 * @return {Object|null} JSON 输出用的用户信息。不存在时返回 null
 */
function getUserInfo(userCd) {
  let manager = new AccountInfoManager();
  let result = manager.getAccountInfo(userCd);

  if (result.error) {
    throwApiError(ERROR_CODE_INTERNAL, 500, result.errorMessage || '账户信息查询失败。');
  }

  let account = result.data;
  if (!account) {
    return null;
  }

  return convertAccountInfoToJson(account);
}

/**
 * 将 AccountInfo 转换为 JSON 输出用对象。
 * password 等机密项目不包含在响应中。
 *
 * @param {Object} account - AccountInfo
 * @return {Object} JSON 输出用对象
 */
function convertAccountInfoToJson(account) {
  return {
    userCd: account.userCd,
    locale: account.locale,
    timeZoneId: account.timeZoneId,
    encoding: account.encoding,
    calendarId: account.calendarId,
    firstDayOfWeek: account.firstDayOfWeek,
    validStartDate: formatDate(account.validStartDate),
    validEndDate: formatDate(account.validEndDate),
    lockDate: formatDate(account.lockDate),
    loginFailureCount: account.loginFailureCount
  };
}

/**
 * 将 Date 格式化为 YYYY-MM-DD 形式的字符串。
 *
 * @param {Date|null} value - 日期值
 * @return {string|null} 已格式化的字符串。null/不合法值时返回 null
 */
function formatDate(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (isNaN(value.getTime())) {
    return null;
  }
  return value.getFullYear() + '-' + padZero(value.getMonth() + 1) + '-' + padZero(value.getDate());
}

/**
 * 将 1 位数值零填充为 2 位表示。
 *
 * @param {number} number - 数值
 * @return {string} 已零填充的字符串
 */
function padZero(number) {
  return number < 10 ? '0' + number : String(number);
}

// ========================================
// 响应发送
// ========================================
/**
 * 发送 JSON 响应。发送后，JavaScript 的执行停止。
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

## 与既有 `sample_api/api/get_user.js` 的差分

OAuth 版中 **删除** 的要素:

| 删除位置 | 理由 |
|---------|------|
| `verifySecureToken()` 函数与调用 | 因 OAuth 访问令牌作为认证起作用，CSRF 安全令牌验证不需要 |
| `ERROR_CODE_INVALID_TOKEN` 常量 | 由于删除上述函数而变得未使用 |
| `SecureTokenManager` 的实例化 | 由于删除上述函数而不需要 |

其他逻辑（HTTP 方法验证・参数验证・业务逻辑・JSON 响应组装）无变更。

## 动作确认的流程

1. 构建・部署后，在租户管理 → OAuth 管理画面确认自动注册的 scope / client / resource
2. 从客户端应用程序通过授权码流程（Authorization Code + PKCE）获取访问令牌
3. 以以下 HTTP 请求调用 API:

   ```
   GET /imart/oauth/sample_oauth/get_user?userCd=aoyagi
   Authorization: Bearer {获取的访问令牌}
   ```

4. 成功时的响应示例:

   ```json
   {
     "error": false,
     "data": {
       "userCd": "aoyagi",
       "locale": "ja",
       "timeZoneId": "Asia/Tokyo",
       "encoding": "UTF-8",
       ...
     }
   }
   ```

5. 访问令牌无效／scope 不足时，平台端返回 `401 Unauthorized` / `403 Forbidden`（不调用 init 函数）
