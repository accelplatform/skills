---
applyTo: "src/main/jssp/**/*.js"
description: "コーディングスタイル"
---

# Coding Standards (Function Containers Only)

> **Application Scope**: 🟢 **Always** — Applies whenever generating or editing `.js` files (function containers).

## Variable Declarations

### Rule: Use `let`

Good examples:
```javascript
let userId = 'user001';
let userName = 'John Doe';
let items = [];
```

Bad examples:
```javascript
var userId = 'user001';     // Do not use var as its scope is too broad
```

### Regarding `const`

`const` has issues with scope behavior in Rhino, so avoid using it actively.
Limit its use to specific situations such as receiving bound variables on the presentation page side.

```javascript
// Use on the presentation page side is acceptable
const $data = /* JSON embed */;
```

**Reasons**:
- `let` has block scope, making the variable's range of influence clear
- `var` has function scope and is prone to unintended variable hoisting
- `const` has issues with scope behavior in the Rhino environment

### Regarding `Promise`

Rhino, which runs on the server side, does not support asynchronous processing; all processing is synchronous.
Therefore, `Promise`, `async`, and `await` must not be used.

## String Literals

### Rule: Use single quotes (`'`) consistently

Good examples:
```javascript
let message = 'Processing complete';
let sql = 'SELECT * FROM users WHERE user_id = ?';
let message = "Processing 'test-case' complete";  // Exception: double quotes may be used only when the string contains single quotes
```

Bad examples:
```javascript
let message = '処理が完了しました';  // Do not use double quotes
```

## Operators and Syntax

### Do not omit parentheses with the new operator

Good examples:
```javascript
let db = new TenantDatabase();
let client = new HttpClient();
let date = new Date();
```

Bad examples:
```javascript
let db = new TenantDatabase;   // Avoid omitting parentheses
```

### Always include semicolons

Good examples:
```javascript
let userId = 'user001';
let result = processData(userId);
```

Bad examples:
```javascript
let userId = 'user001'   // Avoid omitting semicolons
```

### Prefer strict equality operators

Good examples:
```javascript
if (status === 'active') {
  // processing
}
if (count !== 0) {
  // processing
}
```

Bad examples:
```javascript
if (status == 'active') {   // Type conversion may occur
  // processing
}
if (count) {  // Implicit boolean conversion for non-boolean types
  // processing
}
```

## Referencing d.ts Constants and Enumerated Values

Constant objects defined in `d.ts` (`NodeType`, `ProcessType`, `TaskStatus`, etc.)
are TypeScript type-definition only and do not exist globally in the SSJS runtime in `.js` files.

In `.js` files, specify constant values (string literals) directly.

Good examples:
```javascript
// Specify constant values directly and add comments to clarify meaning
let NODE_TYPE_APPLY = '2';    // Apply node (NodeType.nodeTyp_Apply)
let NODE_TYPE_APPROVE = '3';  // Approval node (NodeType.nodeTyp_Approve)

if (node.nodeType === NODE_TYPE_APPLY) {
  // processing
}
```

Bad examples:
```javascript
// NG: d.ts constant objects cannot be referenced from .js
if (node.nodeType === NodeType.nodeTyp_Apply) {
  // Will result in ReferenceError
}
```

**Rules**:
- Define constant values together in a constants section at the top of the file
- Make the meaning clear from the variable name, and include a comment with the corresponding constant name from `d.ts`
- Values must match the definitions in `d.ts`

## Indentation and Formatting

### Indentation

- Use 2 spaces consistently (if instructions are specified in design documents or specifications, those take priority)
- Be careful not to nest too deeply (maximum 4 levels recommended)

### Line Length

- Recommended maximum of 120 characters
- Use line breaks at appropriate positions when lines become too long

Good examples:
```javascript
let result = db.select(
  'SELECT user_id, user_name, department_cd FROM users WHERE status = ?',
  [status]
);
```

**Note: Avoid line breaks after `&&` / `||`**

The Rhino 1.7R4 parser may misinterpret a line break immediately after `&&` / `||` inside an `if` (or similar) condition. Until it reaches the following line, it concludes that the condition's closing `)` is missing and aborts parsing with `missing ) after condition`.

For long conditions, **extract the expression into a local variable, or keep it on a single line**.

```javascript
// NG: line break after trailing && (Rhino may fail to parse)
if (result.data && result.data.length > 0 &&
    Number(result.data[0].count) > 0) {
  // processing
}

// OK: extract into a local variable
let hasValidResult = result.data
  && result.data.length > 0
  && Number(result.data[0].count) > 0;
if (hasValidResult) {
  // processing
}

// OK: keep it on a single line
if (result.data && result.data.length > 0 && Number(result.data[0].count) > 0) {
  // processing
}
```

### Brace Style

```javascript
// Use K&R style
function processData(input) {
  if (input === null) {
    return null;
  }

  for (let i = 0; i < input.length; i++) {
    // processing
  }

  return result;
}
```

## Comments

### Function Comments (JSDoc Format)

```javascript
/**
 * Retrieves user information
 *
 * @param {string} userId - User ID
 * @return {Object} User information object. Returns null if not found
 */
function getUserInfo(userId) {
  // processing
}
```

### Inline Comments

```javascript
// Describe the reason for complex logic
let threshold = 30;  // Data older than 30 days is targeted for deletion

// TODO: #12345 Temporary fix. Scheduled for correction in the next release
```
