---
paths:
  - "src/main/jssp/**/*.js"
  - "src/main/jssp/**/*.html"
---

# Secure Token Verification

## Overview

A series of patterns for intra-mart's CSRF countermeasures: obtaining a secure token on the presentation page, attaching it to the request header when making API calls, and verifying it on the server side.

## File Structure

```
Presentation page (.html)
  ├── <imart type="imSecureToken" />  ... Token generation
  ├── getSecureToken()                ... Token retrieval
  └── Attach to fetch() headers       ... Token transmission

API (.js)
  └── verifySecureToken()             ... Token verification
```

## Presentation Page Side

### Secure Token Generation

Place `<meta name="im_secure_token">` inside `<imart type="head">`, and output the token value into its `content` attribute with `<imart type="imSecureToken" mode="value" />`.
`mode="value"` outputs only the token value (when `mode` is omitted, an `<input type="hidden">` tag is output).

```html
<imart type="head">
  <!-- Secure token -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
</imart>
```

### Secure Token Retrieval

Retrieve the secure token from the `content` attribute of the `meta` tag.

```javascript
// Retrieve the secure token
const token = document.querySelector('meta[name=im_secure_token]').content;
```

### Attaching Headers When Making API Calls

Set the token in the `fetch` request header using the key `X-Intramart-Secure-Token`.

```javascript
const response = await fetch('sample/api/foo', {
  method: 'POST',
  headers: {
    'X-Intramart-Secure-Token': getSecureToken()
  }
});
```

## API Side (Server-side Verification)

### verifySecureToken Function

Call inside the API's `main()`, before validation.

```javascript
/**
 * Performs secure token verification.
 * Confirms that the request is legitimate.
 *
 * @param {Object} request - Request parameters
 */
function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throw new Error('Secure token verification failed.');
  } else if (!result.data) {
    throw new Error('Secure token is invalid.');
  }
}
```

### Call Position in the main Function

Execute secure token verification before validation and business logic.

```javascript
function main(request, httpResponse) {
  try {
    // Secure token check
    verifySecureToken(request);
  } catch (e) {
    // TODO: Add processing for secure token verification error here
  }

}
```

## Form Submission (Regular POST)

On screens that submit a `<form>` with a regular POST, send the token as a request parameter and verify it in the function container.

### Presentation Page Side

Place `<imart type="imSecureToken" />` inside the form. When `mode` is omitted, `<input type="hidden" name="im_secure_token" value="...">` is output, and the token is sent as the request parameter `im_secure_token` when the form is submitted.

```html
<form action="sample/form/submit" method="POST">
  <imart type="imSecureToken" />
  <!-- Input fields -->
  <button type="submit">Submit</button>
</form>
```

### Function Container Side

Call `verify()` with no arguments. When `token` is omitted, the token is taken from the request parameter `im_secure_token` and verified.

```javascript
function init(request) {
  let result = new SecureTokenManager().verify();
  if (result.error || !result.data) {
    // TODO: Add processing for secure token verification error here
    return;
  }
  // Registration processing
}
```
