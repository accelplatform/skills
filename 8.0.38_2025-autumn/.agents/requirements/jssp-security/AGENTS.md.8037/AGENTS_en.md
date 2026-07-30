# Security Standards

> **Application Scope**: 🟢 **Always** — Applies to every screen / API that handles user input or is exposed externally. XSS / CSRF / input validation.

## Input Validation (Required)

### Basic Principles

- **Validate all input values on the server side**
- Treat client-side validation as supplementary
- Prefer allowlist (whitelist) approach

### Implementation Examples

```javascript
/**
 * Input value sanitization
 */
function sanitizeInput(input) {
  if (input === null || input === undefined) {
    return '';
  }
  let str = String(input);
  str = str.trim();
  str = str.replace(/[\x00-\x1F\x7F]/g, '');  // Remove control characters
  return str;
}

/**
 * Validation of numeric parameters
 */
function validateNumericParam(value, min, max) {
  if (!/^-?[0-9]+$/.test(value)) {
    return false;
  }
  let num = parseInt(value, 10);
  return num >= min && num <= max;
}
```

## SQL Injection Countermeasures (Required)

### Absolutely Prohibited: Building SQL with String Concatenation

```javascript
// Absolutely prohibited!!!
let sql = "SELECT * FROM users WHERE user_id = '" + userId + "'";  // Dangerous
let sql = "SELECT * FROM users WHERE user_name LIKE '%" + keyword + "%'";  // Dangerous
```

### Required: Parameterized Queries

```javascript
// Correct implementation
let sql = 'SELECT * FROM users WHERE user_id = ?';
let result = db.select(sql, [userId]);

// For LIKE searches
let sql = 'SELECT * FROM users WHERE user_name LIKE ?';
let result = db.select(sql, ['%' + keyword + '%']);

// For multiple parameters
let sql = 'SELECT * FROM users WHERE status = ? AND department_cd = ?';
let result = db.select(sql, [status, departmentCd]);
```

## XSS (Cross-Site Scripting) Countermeasures

### Escape Attributes in IMART Tags

| Attribute | Usage | Default |
|-----------|-------|---------|
| `escapeXml` | Converts `&`, `<`, `>`, `'`, `"` to XML entities | true |
| `escapeJs` | Escapes backslashes, quotes, control characters | false |
| `escapeSpace` | Converts half-width spaces to `&nbsp;` | false |
| `nl2br` | Converts newlines to `<br>` tags | false |

```html
<!-- HTML output (escapeXml="true" by default) -->
<imart type="string" value=$userName />

<!-- When HTML is included (trusted data only) -->
<imart type="string" value=$safeHtmlContent escapeXml="false" />
```

### Notes on JavaScript Output

```html
<script type="text/javascript">
// JSON embed: set both escapeXml/escapeJs to false. Scope $userData as an IIFE argument instead of a global variable
(function($userData) {
  // ...
})(<imart type="string" value=$userData escapeXml="false" escapeJs="false" />);

// String literal: escapeXml=false, escapeJs=true
let value = '<imart type="string" value=$myValue escapeXml="false" escapeJs="true"></imart>';
</script>
```

**How to use the escape attribute inside `<script>`:**

| Usage | `escapeXml` | `escapeJs` | Reason |
|-------|:-----------:|:----------:|--------|
| JSON embed (passed as an IIFE argument) | `false` | `false` | The entire JSON is output as-is, so neither is needed |
| JS string literal (`let x = '...'`) | `false` | **`true`** | Escaping of JS special characters such as quotes is required |

**Note**: When specifying `escapeXml="false"` or `escapeJs="false"`, always verify that the data comes from a trusted source.

## Prohibited Items

### Prohibition of eval()

```javascript
// Absolutely prohibited!!!
let code = request['code'];
eval(code);  // Risk of arbitrary code execution

// Absolutely prohibited!!!
let func = new Function(request['funcBody']);  // Similarly dangerous
```

### Prohibition of Direct Access to Java Objects

```javascript
// Prohibited (may be restricted by blacklist)
java.lang.Runtime.getRuntime().exec('command');

// If necessary, use the product-provided API
```

## Session Management

```javascript
/**
 * Consideration for session timeout
 */
function checkSession() {
  let logger = Logger.getLogger();
  let accountContext = Contexts.getAccountContext();

  // Account context cannot be retrieved, or authenticated flag is false
  if (!accountContext || !accountContext.authenticated) {
    logger.warn('Unauthenticated access detected');
    PageManager.redirect('login');
    return false;
  }

  return true;
}
```

## CSRF Countermeasures

Use CSRF tokens when submitting forms.
Using `<imart type="imSecureToken" />` outputs it as `<input type="imSecureToken" name="im_secure_token" value="<TOKEN>"`.

```html
<form method="POST" action="sample/user/edit">
  <!-- CSRF token (automatically added when using imui tags) -->
  <imart type="imSecureToken" />

  <input type="text" name="userName" />
  <input type="submit" value="Register" />
</form>
```
