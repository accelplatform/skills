# IMART imSecureToken 标签参考

## 概述

`<imart type="imSecureToken">` 是输出用于 CSRF（跨站请求伪造）防护的安全令牌的标签。
服务器对合法访问发出令牌并发送给客户端。接收请求时，通过比较保存在会话中的令牌和请求中发送的令牌进行验证。

## 属性列表

### 可选属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| mode | String | `"tag"` | 输出模式。`"tag"` / `"name"` / `"value"` 之一 |
| useOneTimeToken | Boolean | false | `true` 时，令牌在使用一次后失效 |
| *任意属性* | String | - | 包含在令牌生成种子中的键和值。验证时请求参数中需要相同的键和值 |

### mode 属性值

| 值 | 说明 |
|----|------|
| `"tag"` | 输出包含安全令牌的隐藏标签（默认） |
| `"name"` | 输出安全令牌的请求参数名 |
| `"value"` | 输出安全令牌的值本身 |

## 使用示例

### 表单提交（基本）

```html
<form action="sample/csrf_check" method="POST">
  <imart type="imSecureToken" />
  <input type="submit" value="提交" />
</form>
```

### 一次性令牌

```html
<form action="sample/csrf_check" method="POST">
  <imart type="imSecureToken" useOneTimeToken="true" />
  <input type="submit" value="提交" />
</form>
```

### 通过 Ajax 发送令牌

```html
<script>
  const params = new URLSearchParams();
  params.append('<imart type="imSecureToken" mode="name" />', '<imart type="imSecureToken" mode="value" />');

  fetch('sample/csrf_check', {
    method: 'POST',
    body: params
  });
</script>
```

## 注意事项

- 会话因超时等原因被销毁时，令牌将失效
- 函数容器侧的验证使用 `SecureTokenManager.verify()`
- `useOneTimeToken="true"` 对防止重复提交也有效
