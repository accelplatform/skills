---
paths:
  - "src/main/jssp/**/*.js"
---

# Cookie API Reference

## Overview

Cookie is an object that provides functionality for creating cookies.

## Constructor

```javascript
let cookie = new Cookie(name, value);
```

| Parameter | Type | Description |
|-----------|------|------|
| name | String | Cookie name |
| value | String | Cookie value |

## Method List

### Getters

| Method | Return Value | Description |
|---------|--------|------|
| getComment() | String | Comment information (`null` if not set) |
| getDomain() | String | Domain name |
| getMaxAge() | Number | Expiration time (seconds). Negative value means delete when browser closes |
| getName() | String | Cookie name |
| getPath() | String | Server-side path |
| getSecure() | Boolean | Whether limited to secure protocol (`true` = HTTPS only) |
| getValue() | String | Cookie value |
| getVersion() | Number | Protocol version number |
| isHttpOnly() | Boolean | Whether limited to HTTP communication (`true` = inaccessible from JS) |

### Setters

| Method | Parameters | Description |
|---------|-----------|------|
| setComment(purpose) | purpose: String | Set a comment |
| setDomain(domain) | domain: String | Specify the applicable domain |
| setHttpOnly(isHttpOnly) | isHttpOnly: Boolean | Set HTTP communication only (default `false`) |
| setMaxAge(expiry) | expiry: Number | Specify validity period in seconds. `0` to delete, negative to not save |
| setPath(uri) | uri: String | Set the path to return to client |
| setSecure(isSecure) | isSecure: Boolean | Set whether to send only via secure protocol |
| setValue(newValue) | newValue: String | Update the cookie value |
| setVersion(version) | version: Number | Specify the protocol version |

## Usage Examples

### Creating and Configuring a Cookie

```javascript
let cookie = new Cookie('user_pref', 'dark_mode');
cookie.setMaxAge(60 * 60 * 24 * 30); // Valid for 30 days
cookie.setPath('/');
cookie.setHttpOnly(true);
cookie.setSecure(true);
```

### Deleting a Cookie

```javascript
let cookie = new Cookie('user_pref', '');
cookie.setMaxAge(0); // Delete immediately
cookie.setPath('/');
```