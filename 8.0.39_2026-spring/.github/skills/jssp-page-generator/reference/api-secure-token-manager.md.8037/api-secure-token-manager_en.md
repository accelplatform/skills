---
paths:
  - "src/main/jssp/**/*.js"
---

# SecureTokenManager API Reference

## Overview

SecureTokenManager is an object that manages secure tokens to prevent unauthorized access.
It allows execution for accesses that follow legitimate procedures and blocks unauthorized accesses.

- Available only in the Web execution environment

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| REQUEST_PARAMETER_NAME | `"im_secure_token"` | Request parameter name |

## Constructor

```javascript
let tokenManager = new SecureTokenManager();
```

## Method List

| Method | Return Value | Description |
|--------|-------------|-------------|
| createToken(useOneTimeToken, parameter?) | ResultObject | Generate a secure token |
| verify(token?, parameter?) | ResultObject | Verify the validity of a token |

## Method Details

### createToken(useOneTimeToken, parameter?)

Generates and returns a secure token.

| Parameter | Type | Description |
|-----------|------|-------------|
| useOneTimeToken | Boolean | Whether to use a one-time token |
| parameter | Object | Parameters used for token generation (optional) |

**Return value**: ResultObject - `.data` contains the token string (String)

### verify(token?, parameter?)

Verifies the validity of a token. Returns `true` if the token is included in the request parameters and the parameters have not been tampered with.

| Parameter | Type | Description |
|-----------|------|-------------|
| token | String | Token string to verify (if omitted, automatically retrieved from request parameters) |
| parameter | Object | Parameters used during token generation (optional) |

**Return value**: ResultObject - `.data` contains the verification result (Boolean)

- `true`: Token is valid
- `false`: Token is invalid, parameters were tampered with, or token has been invalidated

## Usage Examples

### Token Generation and Verification

```javascript
// Token generation (when displaying the page)
function init(request) {
  let tokenManager = new SecureTokenManager();
  let result = tokenManager.createToken(true);
  let token = result.data;

  // Set to hidden field in HTML
  request.setAttribute('secureToken', token);
}

// Token verification (during registration processing)
function regist(request) {
  let tokenManager = new SecureTokenManager();
  let verifyResult = tokenManager.verify();

  if (!verifyResult.data) {
    // Unauthorized access
    return {error: true, message: 'Invalid request'};
  }

  // Normal processing
}
```