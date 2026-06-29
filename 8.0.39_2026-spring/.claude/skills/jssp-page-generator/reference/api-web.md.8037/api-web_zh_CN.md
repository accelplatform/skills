---
paths:
  - "src/main/jssp/**/*.js"
---

# Web API 参考

## 概述

Web 是提供与 Web 服务器和 HTTP 请求/响应相关的工具的对象。
仅由静态方法构成，可以不实例化直接使用。

## 方法列表

### URL 和服务器信息

| 方法 | 返回值 | 说明 |
|------|--------|------|
| base() | String | 获取 `http://server:port/path` 格式的基础URL（`server-context-config.xml` 的设置值） |
| location() | String | 获取请求URL |
| host() | String | 获取 Web 服务器名 |
| port() | Number | 获取 HTTP 监听端口号 |
| protocol() | String | 获取 Web 服务器协议 |
| script() | String | 获取 Web 脚本文件名 |
| current() | String | 获取当前处理中的页面路径 |
| referer() | String | 获取请求来源的页面路径 |

### HTTP 请求信息

| 方法 | 返回值 | 说明 |
|------|--------|------|
| getScheme() | String | 获取请求协议方案（`http`、`https`、`ftp`） |
| getServerName() | String | 获取接收请求的服务器主机名 |
| getServerPort() | Number | 获取处理请求的端口号 |
| getRemoteAddr() | String | 获取客户端的IP地址 |
| getRemoteHost() | String | 获取客户端的FQDN或IP地址 |
| getProtocol() | String | 获取协议版本（例：`HTTP/1.1`） |
| getContextPath() | String | 获取URI的上下文路径部分 |
| isSecure() | Boolean | 判断是否为HTTPS或安全通道 |

### 请求和响应对象

| 方法 | 返回值 | 说明 |
|------|--------|------|
| getRequest() | Request | 获取请求对象 |
| getHTTPResponse() | HTTPResponse | 获取响应对象 |

### URL 编码

| 方法 | 返回值 | 说明 |
|------|--------|------|
| encodeURL(url) | String | 对URL进行编码以包含会话ID |
| encodeRedirectURL(url) | String | 对重定向用的URL进行编码 |

### HTTP 头部和环境变量

| 方法 | 返回值 | 说明 |
|------|--------|------|
| setHTTPResponseHeader(name, value) | void | 设置HTTP响应头 |
| getenv(ref_name) | String | 获取CGI环境变量。不存在时返回 `null` |

## 使用示例

### 获取上下文路径

```javascript
let contextPath = Web.getContextPath();
// 示例："/imart"
```

### 获取基础URL

```javascript
let baseUrl = Web.base();
// 示例："http://localhost/imart"
```

### 获取请求信息

```javascript
let scheme = Web.getScheme();       // "https"
let host = Web.getServerName();     // "example.com"
let port = Web.getServerPort();     // 443
let secure = Web.isSecure();        // true
let clientIp = Web.getRemoteAddr(); // "192.168.1.100"
```

### 设置HTTP响应头

```javascript
Web.setHTTPResponseHeader('Cache-Control', 'no-cache');
Web.setHTTPResponseHeader('X-Content-Type-Options', 'nosniff');
```

### 获取请求和响应对象

```javascript
let request = Web.getRequest();
let response = Web.getHTTPResponse();
```

### URL 编码

```javascript
let url = Web.encodeURL('/imart/next_page.jssp');
let redirectUrl = Web.encodeRedirectURL('/imart/login.jssp');
```
