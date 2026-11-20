# 安全令牌验证

## 概述

作为 intra-mart 的 CSRF 防护，在展示页面获取安全令牌，在 API 调用时附加到请求头，并在服务器侧进行验证的一系列模式。

## 文件构成

```
展示页面 (.html)
  ├── <imart type="imSecureToken" />  ... 令牌生成
  ├── getSecureToken()                ... 令牌获取
  └── 附加到 fetch() 的 headers       ... 令牌发送

API (.ts)
  └── verifySecureToken()             ... 令牌验证
```

## 展示页面侧

### 安全令牌的生成

在 `<imart type="head">` 内放置 `<meta name="im_secure_token">`，并通过 `<imart type="imSecureToken" mode="value" />` 将令牌值输出到其 `content` 属性中。
`mode="value"` 仅输出令牌值（省略 `mode` 时输出 `<input type="hidden">` 标签）。

```html
<imart type="head">
  <!-- 安全令牌 -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
</imart>
```

### 安全令牌的获取

从 `meta` 标签的 `content` 属性获取安全令牌。

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

```typescript
/**
 * 进行安全令牌的验证。
 * 确认请求是合法的。
 *
 * @param request - 请求参数
 */
function verifySecureToken(request: Request): void {
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

```typescript
function main(request: Request, httpResponse: HTTPResponse): void {
  try {
    // 安全令牌检查
    verifySecureToken(request);
  } catch (e) {
    // TODO: 在此处添加安全令牌验证错误时的处理
  }

}
```

## 表单提交（普通 POST）

对于以普通 POST 提交 `<form>` 的画面，通过请求参数发送令牌，并在函数容器中进行验证。

### 展示页面侧

在表单内放置 `<imart type="imSecureToken" />`。省略 `mode` 时会输出 `<input type="hidden" name="im_secure_token" value="...">`，提交表单时令牌将作为请求参数 `im_secure_token` 发送。

```html
<form action="sample/form/submit" method="POST">
  <imart type="imSecureToken" />
  <!-- 输入项目 -->
  <button type="submit">提交</button>
</form>
```

### 函数容器侧

不带参数调用 `verify()`。省略 `token` 时，会从请求参数 `im_secure_token` 获取令牌并进行验证。

```typescript
export function init(request: Request): void {
  let result = new SecureTokenManager().verify();
  if (result.error || !result.data) {
    // TODO: 在此处添加安全令牌验证错误时的处理
    return;
  }
  // 注册处理
}
```
