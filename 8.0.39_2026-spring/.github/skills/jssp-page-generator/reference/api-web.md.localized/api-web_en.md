---
paths:
  - "src/main/jssp/**/*.js"
---

# Web API Reference

## Overview

Web is an object that provides utilities related to the web server and HTTP requests/responses.
It consists only of static methods and can be used directly without instantiation.

## Method List

### URL and Server Information

| Method | Return Value | Description |
|--------|-------------|-------------|
| base() | String | Get the base URL in `http://server:port/path` format (value from `server-context-config.xml`) |
| location() | String | Get the request URL |
| host() | String | Get the web server name |
| port() | Number | Get the HTTP listening port number |
| protocol() | String | Get the web server protocol |
| script() | String | Get the web script file name |
| current() | String | Get the currently processing page path |
| referer() | String | Get the requesting page path |

### HTTP Request Information

| Method | Return Value | Description |
|--------|-------------|-------------|
| getScheme() | String | Get the request scheme (`http`, `https`, `ftp`) |
| getServerName() | String | Get the hostname of the server that received the request |
| getServerPort() | Number | Get the port number processing the request |
| getRemoteAddr() | String | Get the client's IP address |
| getRemoteHost() | String | Get the client's FQDN or IP address |
| getProtocol() | String | Get the protocol version (e.g., `HTTP/1.1`) |
| getContextPath() | String | Get the context path portion of the URI |
| isSecure() | Boolean | Determine whether it is HTTPS or a secure channel |

### Request and Response Objects

| Method | Return Value | Description |
|--------|-------------|-------------|
| getRequest() | Request | Get the request object |
| getHTTPResponse() | HTTPResponse | Get the response object |

### URL Encoding

| Method | Return Value | Description |
|--------|-------------|-------------|
| encodeURL(url) | String | Encode the URL to include the session ID |
| encodeRedirectURL(url) | String | Encode the URL for redirect |

### HTTP Headers and Environment Variables

| Method | Return Value | Description |
|--------|-------------|-------------|
| setHTTPResponseHeader(name, value) | void | Set an HTTP response header |
| getenv(ref_name) | String | Get a CGI environment variable. Returns `null` if it does not exist |

## Usage Examples

### Getting the Context Path

```javascript
let contextPath = Web.getContextPath();
// Example: "/imart"
```

### Getting the Base URL

```javascript
let baseUrl = Web.base();
// Example: "http://127.0.0.1/imart"
```

### Getting Request Information

```javascript
let scheme = Web.getScheme();       // "https"
let host = Web.getServerName();     // "example.com"
let port = Web.getServerPort();     // 443
let secure = Web.isSecure();        // true
let clientIp = Web.getRemoteAddr(); // "192.168.1.100"
```

### Setting HTTP Response Headers

```javascript
Web.setHTTPResponseHeader('Cache-Control', 'no-cache');
Web.setHTTPResponseHeader('X-Content-Type-Options', 'nosniff');
```

### Getting Request and Response Objects

```javascript
let request = Web.getRequest();
let response = Web.getHTTPResponse();
```

### URL Encoding

```javascript
let url = Web.encodeURL('/imart/next_page.jssp');
let redirectUrl = Web.encodeRedirectURL('/imart/login.jssp');
```
