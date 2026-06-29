# 编码规范（仅适用于函数容器）

> **适用范围**: 🟢 **始终** — 生成或编辑 `.js` 文件（函数容器）时适用。

## 变量声明

### 规则：使用 `let`

正确示例：
```javascript
let userId = 'user001';
let userName = '张三';
let items = [];
```

错误示例：
```javascript
var userId = 'user001';     // 不使用 var，因为其作用域过宽
```

### 关于 `const`

`const` 在 Rhino 的作用域行为上存在问题，因此不建议积极使用。
仅限于在展示页面侧接收绑定变量等特定场合下使用。

```javascript
// 在展示页面侧使用是允许的
const $data = /* JSON 嵌入 */;
```

**原因**：
- `let` 具有块级作用域，变量的影响范围明确
- `var` 具有函数作用域，容易发生意外的变量提升
- `const` 在 Rhino 环境中作用域行为存在问题

### 关于 `Promise`

在服务器端运行的 Rhino 不支持异步处理，所有处理均为同步执行。
因此，**不得使用** `Promise`、`async`、`await`。

## 字符串字面量

### 规则：统一使用单引号（`'`）

正确示例：
```javascript
let message = '处理完成';
let sql = 'SELECT * FROM users WHERE user_id = ?';
let message = "处理 'test-case' 完成";  // 例外：仅在字符串包含单引号时才可使用双引号
```

错误示例：
```javascript
let message = '处理が完了しました';  // 不使用双引号
```

## 运算符与语法

### new 运算符不得省略括号

正确示例：
```javascript
let db = new TenantDatabase();
let client = new HttpClient();
let date = new Date();
```

错误示例：
```javascript
let db = new TenantDatabase;   // 避免省略括号
```

### 必须书写分号

正确示例：
```javascript
let userId = 'user001';
let result = processData(userId);
```

错误示例：
```javascript
let userId = 'user001'   // 避免省略分号
```

### 优先使用严格等于运算符

正确示例：
```javascript
if (status === 'active') {
  // 处理
}
if (count !== 0) {
  // 处理
}
```

错误示例：
```javascript
if (status == 'active') {   // 可能发生类型转换
  // 处理
}
if (count) {  // 非 boolean 类型的隐式 boolean 判断
  // 处理
}
```

## d.ts 常量与枚举值的引用

`d.ts` 中定义的常量对象（`NodeType`、`ProcessType`、`TaskStatus` 等）
仅用于 TypeScript 类型定义，在 `.js` 文件的 SSJS 运行时中不作为全局变量存在。

在 `.js` 文件中，请直接指定常量值（字符串字面量）。

正确示例：
```javascript
// 直接指定常量值，并通过注释补充说明含义
let NODE_TYPE_APPLY = '2';    // 申请节点（NodeType.nodeTyp_Apply）
let NODE_TYPE_APPROVE = '3';  // 审批节点（NodeType.nodeTyp_Approve）

if (node.nodeType === NODE_TYPE_APPLY) {
  // 处理
}
```

错误示例：
```javascript
// NG: d.ts 的常量对象无法从 .js 中引用
if (node.nodeType === NodeType.nodeTyp_Apply) {
  // 会发生 ReferenceError
}
```

**规则**：
- 在文件开头的常量区域集中定义常量值
- 通过变量名表明含义，并在注释中记录 `d.ts` 中对应的常量名
- 值必须与 `d.ts` 中的定义一致

## 缩进与格式

### 缩进

- 统一使用 2 个空格（若设计书或规格书中有明确指示，则以其为准）
- 注意避免嵌套层级过深（推荐最多 4 层）

### 每行长度

- 推荐不超过 120 个字符
- 超出时在适当位置换行

正确示例：
```javascript
let result = db.select(
  'SELECT user_id, user_name, department_cd FROM users WHERE status = ?',
  [status]
);
```

**注意：避免在 `&&` / `||` 之后换行**

Rhino 1.7R4 解析器在 `if` 等条件表达式中，遇到 `&&` / `||` 紧跟换行时可能会误判。在到达后续行之前，它认为条件式的闭合 `)` 缺失，并以 `missing ) after condition` 终止解析。

对于较长的条件表达式，**应提取为局部变量，或合并为一行**。

```javascript
// NG：行末 && 后换行（Rhino 可能解析失败）
if (result.data && result.data.length > 0 &&
    Number(result.data[0].count) > 0) {
  // 处理
}

// OK：提取为局部变量
let hasValidResult = result.data
  && result.data.length > 0
  && Number(result.data[0].count) > 0;
if (hasValidResult) {
  // 处理
}

// OK：合并为一行
if (result.data && result.data.length > 0 && Number(result.data[0].count) > 0) {
  // 处理
}
```

### 大括号风格

```javascript
// 使用 K&R 风格
function processData(input) {
  if (input === null) {
    return null;
  }

  for (let i = 0; i < input.length; i++) {
    // 处理
  }

  return result;
}
```

## 注释

### 函数注释（JSDoc 格式）

```javascript
/**
 * 获取用户信息
 *
 * @param {string} userId - 用户ID
 * @return {Object} 用户信息对象。不存在时返回 null
 */
function getUserInfo(userId) {
  // 处理
}
```

### 行内注释

```javascript
// 对复杂逻辑记录原因
let threshold = 30;  // 超过 30 天的数据为删除对象

// TODO: #12345 临时处理，计划在下一个版本中修正
```
