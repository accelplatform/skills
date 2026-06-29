# 安全令牌验证

## 概述

作为 intra-mart 的 CSRF 防护，在展示页面获取安全令牌，在 API 调用时附加到请求头，并在服务器侧进行验证的一系列模式。

## 文件构成

```
展示页面 (.html)
  ├── <imart type="imSecureToken" />  ... 令牌生成
  ├── getSecureToken()                ... 令牌获取
  └── 附加到 fetch() 的 headers       ... 令牌发送

API (.js)
  └── verifySecureToken()             ... 令牌验证
```

## 展示页面侧

### 安全令牌的生成

在 `<imart type="head">` 内放置 `<imart type="imSecureToken" />`。
这样会在 HTML 内生成 `<input type="hidden">` 标签。

```html
<imart type="head">
  <!-- 安全令牌 -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
</imart>
```

### 安全令牌的获取

从生成的 `<input>` 标签获取安全令牌。

```javascript
// 获取安全令牌
const token = document.querySelector('meta[name=im_secure_token]').content;
```

### API 调用时的头部附加

在 `fetch` 的请求头中以 `X-Intramart-Secure-Token` 键设置令牌。

```javascript
const response = await fetch('sample/api/foo', {
  method: 'POST',
  headers: {
    'X-Intramart-Secure-Token': getSecureToken()
  }
});
```

## API 侧（服务器侧验证）

### verifySecureToken 函数

在 API 的 `main()` 内，在验证之前调用。

```javascript
/**
 * 进行安全令牌的验证。
 * 确认请求是合法的。
 *
 * @param {Object} request - 请求参数
 */
function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throw new Error('安全令牌验证失败。');
  } else if (!result.data) {
    throw new Error('安全令牌无效。');
  }
}
```

### main 函数中的调用位置

安全令牌验证在验证和业务逻辑之前执行。

```javascript
function main(request, httpResponse) {
  try {
    // 安全令牌检查
    verifySecureToken(request);
  } catch (e) {
    // TODO: 在此处添加安全令牌验证错误时的处理
  }

}
```
