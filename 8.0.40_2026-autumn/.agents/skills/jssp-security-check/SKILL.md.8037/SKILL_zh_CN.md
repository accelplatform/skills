---
name: jssp-security-check
description: 专门检测 JSSP 代码安全漏洞的技能。使用 Grep 模式全面扫描 SQL 注入、XSS（escapeXml/escapeJs/绑定变量斜杠转义遗漏）、eval/new Function、直接访问 Java、敏感信息日志输出、硬编码凭据、缺少输入验证等问题。当提及安全检查、漏洞诊断、安全审查、安全性确认时使用。需要进行独立于代码审查的深度安全专项检查时使用。
---

# JSSP 安全检查技能

## 概述

检测使用 intra-mart Accel Platform 脚本开发模型（JSSP）编写的代码中的安全漏洞。

## 检测对象

### 1. SQL 注入（严重）

```javascript
// 检测模式
'SELECT * FROM ' + table
"WHERE user_id = '" + userId + "'"
sql = sql + ' AND '
```

**搜索命令示例**：
```
Grep: SELECT.*\+
Grep: WHERE.*\+.*['"]
```

### 2. 跨站脚本攻击（XSS）（严重）

```html
<!-- 检测模式：escapeXml/escapeJs 为 false 时 -->
escapeXml="false"
escapeJs="false"
```

```javascript
// 检测模式
document.write(
innerHTML =
```

### 3. 使用危险函数（严重）

```javascript
// 检测模式
eval(
new Function(
setTimeout(string
setInterval(string
```

**搜索命令示例**：
```
Grep: eval\s*\(
Grep: new\s+Function\s*\(
```

### 4. 直接访问 Java（严重）

```javascript
// 检测模式
java.lang.Runtime
java.io.File
java.net.URL
```

### 5. 敏感信息日志输出（高）

```javascript
// 检测模式
logger.*password
logger.*token
logger.*secret
Debug.console.*password
```

### 6. 硬编码凭据（高）

```javascript
// 检测模式
password = "
apiKey = "
secret = "
token = "
```

### 7. 绑定变量 JSON 赋值时缺少斜杠转义（严重）

JSON 中的 `</script>` 会导致展示页面上的脚本标签提前结束，从而可能造成 XSS。

```javascript
// 存在漏洞的代码（检测对象）
$data = JSON.stringify(response);

// 安全的代码
$data = JSON.stringify(response).replace(/\//g, '\\/');
```

**搜索命令示例**：
```
Grep: \$\w+\s*=\s*JSON\.stringify
```

### 8. 缺少输入验证（中）

```javascript
// 检查要点
// - 是否直接使用了 request["param"]？
// - parseInt/parseFloat 之前是否有验证？
// - 是否有长度限制检查？
```

## 检测步骤

### 步骤 1：检测高风险漏洞

```
# SQL 注入
Grep: (SELECT|INSERT|UPDATE|DELETE).*\+

# eval/Function
Grep: eval\s*\(|new\s+Function

# 直接访问 Java
Grep: java\.(lang|io|net)
```

### 步骤 1.5：确认绑定变量的斜杠转义

```
# 检测将 JSON.stringify 赋值给绑定变量的位置
Grep: \$\w+\s*=\s*JSON\.stringify

# 如果检测到的行中不包含 .replace(/\//g, "\\/")，则存在漏洞
```

### 步骤 2：检测中风险漏洞

```
# 敏感信息日志
Grep: Logger\.(info|debug|error|warn).*password

# 硬编码凭据
Grep: (password|apiKey|secret|token)\s*=\s*["']
```

### 步骤 3：确认输入验证

```
# 直接使用 request
Grep: request\[["'][^"']+["']\]

# 无 validate
# 确认各文件中是否存在 validate 函数
```

## 输出格式

```
## 安全检查结果

### 漏洞摘要

| 严重程度 | 数量 |
|---------|------|
| 严重    | 2    |
| 高      | 3    |
| 中      | 5    |

### 检测到的漏洞

#### 严重

| 文件 | 行 | 类型 | 内容 |
|------|-----|------|------|
| user_edit.js | 45 | SQL 注入 | SQL 字符串拼接 |

#### 高

| 文件 | 行 | 类型 | 内容 |
|------|-----|------|------|
| util.js | 23 | 敏感信息泄露 | 密码输出至日志 |

### 修复建议

1. **SQL 注入防护**
   - 使用参数化查询

2. **敏感信息保护**
   - 从日志输出中排除密码
```
