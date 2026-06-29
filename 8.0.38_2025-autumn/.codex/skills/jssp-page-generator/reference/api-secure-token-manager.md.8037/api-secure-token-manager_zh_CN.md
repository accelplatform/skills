# SecureTokenManager API 参考

## 概述

SecureTokenManager 是用于管理安全令牌以防止未授权访问的对象。
它允许遵循合法程序的访问执行，并阻止未授权的访问。

- 仅在 Web 执行环境中可用

## 常量

| 常量 | 值 | 说明 |
|------|-----|------|
| REQUEST_PARAMETER_NAME | `"im_secure_token"` | 请求参数名 |

## 构造函数

```javascript
let tokenManager = new SecureTokenManager();
```

## 方法列表

| 方法 | 返回值 | 说明 |
|------|--------|------|
| createToken(useOneTimeToken, parameter?) | ResultObject | 生成安全令牌 |
| verify(token?, parameter?) | ResultObject | 验证令牌的有效性 |

## 方法详情

### createToken(useOneTimeToken, parameter?)

生成并返回安全令牌。

| 参数 | 类型 | 说明 |
|------|------|------|
| useOneTimeToken | Boolean | 是否使用一次性令牌 |
| parameter | Object | 用于令牌生成的参数（可省略） |

**返回值**: ResultObject - `.data` 中包含令牌字符串（String）

### verify(token?, parameter?)

验证令牌的有效性。如果令牌包含在请求参数中且参数未被篡改，则返回 `true`。

| 参数 | 类型 | 说明 |
|------|------|------|
| token | String | 要验证的令牌字符串（省略时自动从请求参数获取） |
| parameter | Object | 令牌生成时使用的参数（可省略） |

**返回值**: ResultObject - `.data` 中包含验证结果（Boolean）

- `true`：令牌有效
- `false`：令牌无效、参数被篡改或令牌已失效

## 使用示例

### 令牌的生成与验证

```javascript
// 令牌生成（显示页面时）
function init(request) {
  let tokenManager = new SecureTokenManager();
  let result = tokenManager.createToken(true);
  let token = result.data;

  // 设置到 HTML 的隐藏字段
  request.setAttribute('secureToken', token);
}

// 令牌验证（注册处理时）
function regist(request) {
  let tokenManager = new SecureTokenManager();
  let verifyResult = tokenManager.verify();

  if (!verifyResult.data) {
    // 未授权访问
    return {error: true, message: '无效的请求'};
  }

  // 正常处理
}
```
