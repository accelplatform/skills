---
name: jssp-security-check
description: A dedicated skill for detecting security vulnerabilities in JSSP code. Comprehensively scans for SQL injection, XSS (escapeXml/escapeJs/bind variable slash-escape omissions), eval/new Function, direct Java access, sensitive data logging, hardcoded credentials, and missing input validation using Grep patterns. Use when mentioning security checks, vulnerability assessments, security reviews, or safety verification. Use this for deep security-focused inspection separate from code review.
---

# JSSP Security Check Skill

## Overview

Detects security vulnerabilities in code written with the intra-mart Accel Platform script development model (JSSP).

## Detection Targets

### 1. SQL Injection (Critical)

```javascript
// Detection patterns
'SELECT * FROM ' + table
"WHERE user_id = '" + userId + "'"
sql = sql + ' AND '
```

**Example search commands**:
```
Grep: SELECT.*\+
Grep: WHERE.*\+.*['"]
```

### 2. Cross-Site Scripting (XSS) (Critical)

```html
<!-- Detection pattern: when escapeXml/escapeJs is false -->
escapeXml="false"
escapeJs="false"
```

```javascript
// Detection patterns
document.write(
innerHTML =
```

### 3. Dangerous Function Usage (Critical)

```javascript
// Detection patterns
eval(
new Function(
setTimeout(string
setInterval(string
```

**Example search commands**:
```
Grep: eval\s*\(
Grep: new\s+Function\s*\(
```

### 4. Direct Java Access (Critical)

```javascript
// Detection patterns
java.lang.Runtime
java.io.File
java.net.URL
```

### 5. Sensitive Data Logging (High)

```javascript
// Detection patterns
logger.*password
logger.*token
logger.*secret
Debug.console.*password
```

### 6. Hardcoded Credentials (High)

```javascript
// Detection patterns
password = "
apiKey = "
secret = "
token = "
```

### 7. Missing Slash Escape for JSON in Bind Variables (Critical)

The `</script>` inside JSON causes script tags to terminate on the presentation page, enabling XSS.

```javascript
// Vulnerable code (detection target)
$data = JSON.stringify(response);

// Safe code
$data = JSON.stringify(response).replace(/\//g, '\\/');
```

**Example search command**:
```
Grep: \$\w+\s*=\s*JSON\.stringify
```

### 8. Missing Input Validation (Medium)

```javascript
// Checkpoints
// - Is request["param"] used directly?
// - Is there validation before parseInt/parseFloat?
// - Is there a length limit check?
```

## Detection Procedure

### Step 1: Detect High-Risk Vulnerabilities

```
# SQL Injection
Grep: (SELECT|INSERT|UPDATE|DELETE).*\+

# eval/Function
Grep: eval\s*\(|new\s+Function

# Direct Java access
Grep: java\.(lang|io|net)
```

### Step 1.5: Verify Slash Escaping in Bind Variables

```
# Detect locations where JSON.stringify is assigned to a bind variable
Grep: \$\w+\s*=\s*JSON\.stringify

# If the detected line does not include .replace(/\//g, "\\/"), it is a vulnerability
```

### Step 2: Detect Medium-Risk Vulnerabilities

```
# Sensitive data logging
Grep: Logger\.(info|debug|error|warn).*password

# Hardcoded credentials
Grep: (password|apiKey|secret|token)\s*=\s*["']
```

### Step 3: Verify Input Validation

```
# Direct use of request
Grep: request\[["'][^"']+["']\]

# Without validate
# Check for the existence of a validate function in each file
```

## Output Format

```
## Security Check Results

### Vulnerability Summary

| Severity | Count |
|----------|-------|
| Critical | 2     |
| High     | 3     |
| Medium   | 5     |

### Detected Vulnerabilities

#### Critical

| File | Line | Type | Description |
|------|------|------|-------------|
| user_edit.js | 45 | SQL Injection | SQL string concatenation |

#### High

| File | Line | Type | Description |
|------|------|------|-------------|
| util.js | 23 | Sensitive Data Leak | Password output in log |

### Remediation Recommendations

1. **SQL Injection Prevention**
   - Use parameterized queries

2. **Sensitive Data Protection**
   - Exclude passwords from log output
```
