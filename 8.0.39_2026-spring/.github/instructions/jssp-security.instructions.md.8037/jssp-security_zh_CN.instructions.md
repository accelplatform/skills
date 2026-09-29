---
applyTo: "src/main/jssp/**/*.js,src/main/jssp/**/*.html"
description: "セキュリティ規約（XSS対策、SQLインジェクション対策）"
---

# 安全规约

> **适用范围**: 🟢 **始终** — 适用于所有处理用户输入或对外公开的画面 / API。XSS / CSRF / 输入验证。

## 输入验证（必须）

### 基本原则

- **所有输入值必须在服务器端进行验证**
- 客户端验证仅作为辅助手段
- 优先采用允许列表（白名单）方式

### 实现示例

```javascript
/**
 * 输入值净化
 */
function sanitizeInput(input) {
  if (input === null || input === undefined) {
    return '';
  }
  let str = String(input);
  str = str.trim();
  str = str.replace(/[\x00-\x1F\x7F]/g, '');  // 移除控制字符
  return str;
}

/**
 * 数值参数验证
 */
function validateNumericParam(value, min, max) {
  if (!/^-?[0-9]+$/.test(value)) {
    return false;
  }
  let num = parseInt(value, 10);
  return num >= min && num <= max;
}
```

## SQL 注入对策（必须）

### 绝对禁止：通过字符串拼接构建 SQL

```javascript
// 绝对禁止！！！
let sql = "SELECT * FROM users WHERE user_id = '" + userId + "'";  // 危险
let sql = "SELECT * FROM users WHERE user_name LIKE '%" + keyword + "%'";  // 危险
```

### 必须：参数化查询

```javascript
// 正确实现
let sql = 'SELECT * FROM users WHERE user_id = ?';
let result = db.select(sql, [userId]);

// LIKE 搜索时
let sql = 'SELECT * FROM users WHERE user_name LIKE ?';
let result = db.select(sql, ['%' + keyword + '%']);

// 多个参数时
let sql = 'SELECT * FROM users WHERE status = ? AND department_cd = ?';
let result = db.select(sql, [status, departmentCd]);
```

## XSS（跨站脚本）对策

### IMART 标签中的转义属性

| 属性 | 用途 | 默认值 |
|------|------|--------|
| `escapeXml` | 将 `&`、`<`、`>`、`'`、`"` 转换为 XML 实体 | true |
| `escapeJs` | 转义反斜杠、引号、控制字符 | false |
| `escapeSpace` | 将半角空格转换为 `&nbsp;` | false |
| `nl2br` | 将换行符转换为 `<br>` 标签 | false |

```html
<!-- HTML 输出（默认 escapeXml="true"） -->
<imart type="string" value=$userName />

<!-- 包含 HTML 时（仅限可信数据） -->
<imart type="string" value=$safeHtmlContent escapeXml="false" />
```

### JavaScript 输出时的注意事项

```html
<script type="text/javascript">
// JSON 嵌入：escapeXml/escapeJs 均设为 false。$userData 不作为全局变量，而是作为 IIFE 的参数进行作用域隔离
(function($userData) {
  // ...
})(<imart type="string" value=$userData escapeXml="false" escapeJs="false" />);

// 字符串字面量：escapeXml=false, escapeJs=true
let value = '<imart type="string" value=$myValue escapeXml="false" escapeJs="true"></imart>';
</script>
```

**`<script>` 内 escape 属性的使用区分：**

| 用途 | `escapeXml` | `escapeJs` | 原因 |
|------|:-----------:|:----------:|------|
| JSON 嵌入（作为 IIFE 参数传递） | `false` | `false` | JSON 整体原样输出，两者均不需要 |
| JS 字符串字面量（`let x = '...'`） | `false` | **`true`** | 需要对引号等 JS 特殊字符进行转义 |

**注意**：指定 `escapeXml="false"` 或 `escapeJs="false"` 时，必须确认数据来自可信来源。

## 禁止事项

### 禁止使用 eval()

```javascript
// 绝对禁止！！！
let code = request['code'];
eval(code);  // 存在任意代码执行的危险

// 绝对禁止！！！
let func = new Function(request['funcBody']);  // 同样危险
```

### 禁止直接访问 Java 对象

```javascript
// 禁止（可能受到黑名单限制）
java.lang.Runtime.getRuntime().exec('command');

// 必要时使用产品提供的 API
```

## 会话管理

```javascript
/**
 * 考虑会话超时
 */
function checkSession() {
  let logger = Logger.getLogger();
  let accountContext = Contexts.getAccountContext();

  // 无法获取账户上下文，或认证标志为 false
  if (!accountContext || !accountContext.authenticated) {
    logger.warn('检测到未认证访问');
    PageManager.redirect('login');
    return false;
  }

  return true;
}
```

## CSRF 对策

提交表单时使用 CSRF 令牌。
使用 `<imart type="imSecureToken" />` 时，将输出为 `<input type="imSecureToken" name="im_secure_token" value="<TOKEN>"`。

```html
<form method="POST" action="sample/user/edit">
  <!-- CSRF 令牌（使用 imui 标签时自动附加） -->
  <imart type="imSecureToken" />

  <input type="text" name="userName" />
  <input type="submit" value="注册" />
</form>
```
