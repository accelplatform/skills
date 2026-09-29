---
paths:
  - "src/main/jssp/**/*.js"
---

# Cookie API 参考手册

## 概述

Cookie 是一个提供创建Cookie功能的对象。

## 构造函数

```javascript
let cookie = new Cookie(name, value);
```

| 参数 | 类型 | 说明 |
|-----------|------|------|
| name | String | Cookie名称 |
| value | String | Cookie的值 |

## 方法列表

### Getter方法

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| getComment() | String | 注释信息（未设置时返回 `null`） |
| getDomain() | String | 域名 |
| getMaxAge() | Number | 有效期（秒）。负数表示浏览器关闭时删除 |
| getName() | String | Cookie名称 |
| getPath() | String | 服务器端路径 |
| getSecure() | Boolean | 是否限定安全协议（`true` = 仅HTTPS） |
| getValue() | String | Cookie的值 |
| getVersion() | Number | 协议版本号 |
| isHttpOnly() | Boolean | 是否限定HTTP通信（`true` = JS不可访问） |

### Setter方法

| 方法 | 参数 | 说明 |
|---------|-----------|------|
| setComment(purpose) | purpose: String | 设置注释 |
| setDomain(domain) | domain: String | 指定适用域名 |
| setHttpOnly(isHttpOnly) | isHttpOnly: Boolean | 设置是否仅限HTTP通信（默认 `false`） |
| setMaxAge(expiry) | expiry: Number | 以秒为单位指定有效期。`0` 为删除，负数为不保存 |
| setPath(uri) | uri: String | 设置返回客户端的对象路径 |
| setSecure(isSecure) | isSecure: Boolean | 设置是否仅通过安全协议发送 |
| setValue(newValue) | newValue: String | 更新Cookie的值 |
| setVersion(version) | version: Number | 指定协议版本 |

## 使用示例

### 创建并设置Cookie

```javascript
let cookie = new Cookie('user_pref', 'dark_mode');
cookie.setMaxAge(60 * 60 * 24 * 30); // 有效期30天
cookie.setPath('/');
cookie.setHttpOnly(true);
cookie.setSecure(true);
```

### 删除Cookie

```javascript
let cookie = new Cookie('user_pref', '');
cookie.setMaxAge(0); // 立即删除
cookie.setPath('/');
```