# IMART imSecureToken Tag Reference

## Overview

`<imart type="imSecureToken">` is a tag that outputs a secure token for CSRF (Cross-Site Request Forgery) protection.
The server issues a token for legitimate accesses and sends it to the client. Upon receiving a request, it verifies by comparing the token saved in the session with the token sent in the request.

## Attribute List

### Optional Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| mode | String | `"tag"` | Output mode. One of `"tag"` / `"name"` / `"value"` |
| useOneTimeToken | Boolean | false | If `true`, the token is invalidated after being used once |
| *arbitrary attributes* | String | - | Keys and values to include in the token generation seed. The same keys and values are required in the request parameters during verification |

### mode Attribute Values

| Value | Description |
|-------|-------------|
| `"tag"` | Output a hidden tag containing the secure token (default) |
| `"name"` | Output the request parameter name of the secure token |
| `"value"` | Output the secure token value itself |

## Usage Examples

### Form Submission (Basic)

```html
<form action="sample/csrf_check" method="POST">
  <imart type="imSecureToken" />
  <input type="submit" value="Submit" />
</form>
```

### One-time Token

```html
<form action="sample/csrf_check" method="POST">
  <imart type="imSecureToken" useOneTimeToken="true" />
  <input type="submit" value="Submit" />
</form>
```

### Sending Token via Ajax

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

## Notes

- If the session is destroyed due to a session timeout, the token will be invalidated
- Use `SecureTokenManager.verify()` for verification on the function container side
- `useOneTimeToken="true"` is also effective for preventing double submissions
