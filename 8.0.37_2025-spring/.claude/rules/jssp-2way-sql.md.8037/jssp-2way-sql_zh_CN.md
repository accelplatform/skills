---
paths:
  - "src/main/jssp/**/*.sql"
---

# 2WaySQL 规范

> **适用范围**: 🟡 **上下文依赖** — **仅在 DB 操作时适用**（使用 `db.executeByTemplate` / `db.execute` 时）。无 DB 操作的表单（例如工作流画面）无需阅读。

通过将 SQL 外部化为文件，并使用 `executeByTemplate` / `fetchByTemplate` 执行，安全构建包含条件分支的动态 SQL 的机制。

## 适用方针

- **WHERE 子句或条件动态变化的 SELECT** 使用 2WaySQL
- 简单的固定 SQL 或单参数单次执行，也可使用 `select` / `execute` + `DbParameter`
- **绝对禁止通过字符串拼接构建 SQL**（参见 jssp-security.md）

## SQL 文件的存放位置

SQL 文件**必须存放在 `src/main/jssp/src/` 目录下**（`resources/` 等外部目录中的文件无法被加载）。
按功能单元存放在 `src/main/jssp/src/{功能名}/sql/` 目录下。

```
src/main/jssp/src/
└── {功能名}/
    ├── view/
    │   ├── xxx.js
    │   └── xxx.html
    └── sql/
        ├── selectXxx.sql
        └── searchXxx.sql
```

- 文件编码：**UTF-8**（必须）
- 文件扩展名：`.sql`

### 传递给 `executeByTemplate` / `fetchByTemplate` 的路径

- 以 **`src/main/jssp/src/` 为起点的绝对路径（以斜杠开头）** 指定
- **不包含 `.sql` 扩展名**（包含扩展名会导致执行失败）

示例：执行 `src/main/jssp/src/content/sql/select_content.sql` 时

```javascript
let SQL_SELECT_CONTENT = '/content/sql/select_content';
db.executeByTemplate(SQL_SELECT_CONTENT, params);
```

## 【重要】禁止在 SQL 文件中书写 `--` 注释

2WaySQL 的解析器不会区分 `--` 行注释的内容，而是**扫描整个文件来检测模板语法**。
因此，如果在用于说明的 `--` 注释中原样写入 `/*IF*/` 等语法标记、实际的绑定名（例如 `/*orderId*/`）或 `?`，即便它只是注释，也会被误认为是真正的模板指令，从而产生与注释内容看似无关的运行时错误（例如 `"IF" is not defined.`、`"$1" is not defined.`、`列索引超出范围` 等）。

基于上述原因，**SQL 文件中一律不得书写 `--` 注释。**
文件的用途、验证要点、参数说明应写在调用方函数容器一侧的 JSDoc（函数注释）中。
SQL 文件中只应存放实际执行的 SQL 正文。

```javascript
/**
 * 根据 status、category_cd 的任意条件搜索订单（未指定时取全部）。
 * SQL: /content/sql/search_orders
 *
 * @param {Object} criteria - 搜索条件
 * @return {Object} 搜索结果
 */
function searchOrders(criteria) {
  // ...
}
```

```sql
SELECT order_id, customer_name, status, category_cd
FROM foo_order
/*BEGIN*/
WHERE
  /*IF status != null*/
  status = /*status*/'dummy'
  /*END*/
/*END*/
ORDER BY order_id
```

Java 侧（`im_mirage`）也是同类实现，因此可能发生同样的问题（参见 `java-im-mirage-usage` 技能）。
以下示例代码中，为便于说明，部分位置附有文件路径或 NG/OK 说明性注释，但**实际的 SQL 文件中不得包含这些注释**。

## 语法

| 语法 | 用途 | 备注 |
|------|------|------|
| `/*IF condition*/.../*END*/` | 条件分支 | |
| `/*BEGIN*/.../*END*/` | 可选块（内部内容全部消失时，WHERE 等也会自动删除） | 能作为前置符自动删除的只有 `AND`/`OR`。不要用于期待自动删除 UPDATE 语句 SET 子句中 `,` 前置符的场景（参见「动态 SET 子句」） |
| `/*param*/'dummy'` | 绑定占位符（PreparedStatement 方式） | **推荐** |
| `/*param*/('dummy')` | IN 子句的带括号绑定（将数组动态展开为占位符列表） | 详情参见下方「IN 子句的动态生成」 |
| `/*$param*/dummy` | 直接嵌入 | 存在 SQL 注入风险，必须使用白名单 |

### 禁止使用的语法

- **`/*FOR item in list*/.../*END*/`** 在 LogicDesigner / im_mirage 中可以使用，但**脚本开发模型不支持**。请勿使用。

### 注意：不要在 `/*BEGIN*/` 块内嵌套 `/*IF*/`

解析器本身支持 `/*IF*/` 的嵌套，但在 `/*BEGIN*/` 块内部嵌套时，内侧 `/*IF*/` 开头的 `AND`/`OR` 会成为前置符去除的对象；当外侧 `/*IF*/` 是该块内最先成立的条件时，这个前置符会被错误地去除（因为要等内侧条件处理完毕后，整个块「已输出」的状态才会确定）。结果会变成 `WHERE a = ? b = ?` 这样不正确的 SQL。若先行的兄弟条件已经成立，则能正确输出，因此是否出错取决于参数的组合（已在实机确认：外侧 IF 是该块内最先成立的条件时会出现语法错误，而先行的兄弟条件先成立时则能正常工作）。

多个条件不要嵌套，应并列为兄弟关系，依赖关系用条件表达式来表示。

```sql
/*IF status != null*/
status = /*status*/'dummy'
/*END*/
/*IF status != null && categoryCd != null*/
AND category_cd = /*categoryCd*/'dummy'
/*END*/
```

（内侧块不以 `AND`/`OR`/`,` 开头的嵌套——例如用于切换运算符或值片段的用途——不受此问题影响，可以使用。）

### 虚拟值的含义

`/*param*/'dummy'` 中的 `'dummy'` 是**用于 2WaySQL 执行确认的虚拟值**，运行时会被绑定参数替换。
请填写语法正确的值，以便在 SQL 客户端中单独执行。

IN 子句带括号绑定（`/*param*/('dummy')`）的虚拟值，写成 `('dummy')` 这样的单一值即可（像 `('dummy1', 'dummy2')` 那样并列多个虚拟值，也已在实机确认可以正常工作）。

## IN 子句的动态生成（`/*param*/('dummy')`）

需要将数组动态展开为 `IN` 子句时，使用在 `/*param*/` 后紧跟 `('dummy')` 的带括号绑定。

```sql
SELECT user_id, user_name
FROM users
/*BEGIN*/
WHERE
  /*IF userIds != null && userIds.length > 0*/
  user_id IN /*userIds*/('dummy')
  /*END*/
/*END*/
```

```javascript
function searchByIds(userIds) {
  let db = new TenantDatabase();
  let params = {
    // 将空数组转换为 null（无论是 null 还是空数组，都在 SQL 侧用 /*IF*/ 进行守卫）。
    // 数组的每个元素也必须像其他绑定变量一样用 DbParameter 包装。
    // 直接传递普通字符串数组会导致 "The parameter must be instance of DbParameter."
    userIds: userIds.length > 0
      ? userIds.map(function(userId) { return DbParameter.string(userId); })
      : null
  };
  return db.executeByTemplate('/user/sql/searchByIds', params);
}
```

**必须用 `/*IF*/` 同时守卫 `null` 和空数组这两种情况**（若无守卫，`IN` 会以裸露状态残留，导致 SQL 损坏）。

### 【重要】该守卫可能使空数组的结果从「0 条」变为「全部记录」

如上所述，当 IN 子句守卫是 `/*BEGIN*/` 内唯一的条件时，若 `userIds` 为 `null` 或空数组，`/*IF*/` 内部的内容会消失，导致 `/*BEGIN*/` 块变空，从而**整个 `WHERE` 子句都会被删除**（这符合 `/*BEGIN*/` 的基本行为：内部内容全部消失时，`WHERE` 等也会自动删除）。
其结果是虽不会产生 SQL 错误，但返回的并非预期的「无匹配对象（0 条）」，而是**不加筛选的全部记录**（已在实机确认）。

若业务意图是「调用方传入空数组时，结果也应为空」，则**不能仅依赖 SQL 侧的守卫**，还应在调用方增加应用层守卫：判断 `null`／空数组后直接返回空数组，而不执行该 SQL。尤其是在授权／权限过滤场景（例如将可访问的 ID 列表传入 `IN` 子句）中使用该结构时，这是防止空数组意外导致全部数据泄露的必要对策。

## SQL 文件示例

```sql
SELECT user_id, user_name, email
FROM users
/*BEGIN*/
WHERE
  /*IF userId != null*/
    user_id = /*userId*/'dummy'
  /*END*/
  /*IF userName != null*/
    AND user_name LIKE /*userName*/'%dummy%' ESCAPE '@'
  /*END*/
  /*IF status != null*/
    AND status = /*status*/'active'
  /*END*/
/*END*/
ORDER BY user_id
```

## LIKE 搜索时的转义（LIKE 模式注入防护）

传递给 LIKE 运算符的参数，必须对用户输入中包含的 **LIKE 特殊字符（转义字符本身、`%`、`_`）进行转义**。
不转义直接附加通配符（`%`）会导致以下问题：

- 输入 `%` → `%%%` 命中所有行（意外获取全部数据）
- 输入 `_` → `%_%` 匹配任意单个字符（意外部分匹配）

### 【重要】转义字符不得使用反斜杠（`\`）

已在实机确认，`TenantDatabase#executeByTemplate` 的 2WaySQL 模板编译器**会去除 SQL 文件中的反斜杠字符，无论是注释还是 SQL 正文中都不例外**。
因此即便写了 `ESCAPE '\'`，运行时也会变成 `ESCAPE ''`（空字符串），**转义本身被无效化**。其结果是，对需要转义的关键字（包含 `%` 或 `_` 的关键字）进行搜索时会出现 0 命中这种难以察觉的问题。

一般的网络搜索或其他数据库产品的说明中，通常将 `ESCAPE '\'` 作为定式介绍，但**在脚本开发模型的 `TenantDatabase`/`SharedDatabase` 中这一定式并不适用**。intra-mart 历来有**使用 `@`（艾特符号）作为转义字符的惯例**，因此本规范也使用 `@`。
（Java 侧的 `im_mirage` 没有这个问题，已在实机确认使用 `\` 可以正常工作。这是 JSSP 侧 `TenantDatabase` 特有的限制。）

### 必须遵守的规则

1. **通配符（`%`）的附加在服务端执行** — 不得从客户端（浏览器）发送 `%keyword%`
2. **先转义 LIKE 特殊字符，再附加通配符**
3. **在 SQL 中添加 `ESCAPE '@'` 子句（不得使用 `ESCAPE '\'`）**

### SQL 端

```sql
AND user_name LIKE /*userName*/'%dummy%' ESCAPE '@'
```

### 服务端（函数容器）

```javascript
/**
 * 生成用于 LIKE 搜索的参数。
 * 转义 LIKE 特殊字符，并在前后附加通配符。
 * 转义字符使用 '@'（'\' 会被 TenantDatabase 去除，因此不可使用）。
 *
 * @param {String} value - 搜索关键字（原始输入值）
 * @return {String} 已转义的 LIKE 参数
 */
function toLikeParam(value) {
  if (!value) {
    return '%';
  }
  let escaped = value
    .replace(/@/g, '@@')   // @ → @@
    .replace(/%/g, '@%')   // % → @%
    .replace(/_/g, '@_');  // _ → @_
  return '%' + escaped + '%';
}

// 使用示例
let params = {
  userName: criteria.userName ? DbParameter.string(toLikeParam(criteria.userName)) : null
};
```

### 客户端（展示页面）

```javascript
// OK: 直接发送原始关键字
body: JSON.stringify({ keyword: keyword })

// NG: 在客户端附加通配符后发送
body: JSON.stringify({ keyword: '%' + keyword + '%' })
```

## 调用方法

### execute 与 executeByTemplate 的使用区别

| 方法 | 第1参数 | 第2参数 | 用途 |
|------|---------|---------|------|
| `db.execute(sql, params)` | **SQL 字符串** | `DbParameter[]`（**数组**） | 执行内联 SQL |
| `db.executeByTemplate(path, params)` | **模板路径** | `{ key: DbParameter }`（**对象**） | 执行 2WaySQL 模板 |

**SQL 外部化为文件时，必须使用 `executeByTemplate` / `fetchByTemplate`。**
将模板路径传递给 `execute` 会将路径解释为 SQL 语句，导致错误。
此外，参数格式也不同（`execute` 为数组，`executeByTemplate` 为对象），注意不要混淆。

```javascript
// OK: 模板路径 → executeByTemplate + 对象格式参数
let result = db.executeByTemplate('/user/sql/searchUsers', { userId: DbParameter.string(userId) });

// OK: 内联 SQL → execute + 数组格式参数
let result = db.execute('SELECT * FROM users WHERE user_id = ?', [DbParameter.string(userId)]);

// NG: 将模板路径传给 execute → SQL 解析错误
let result = db.execute('/user/sql/searchUsers', { userId: DbParameter.string(userId) });
```

### executeByTemplate（普通执行）

```javascript
function searchUsers(criteria) {
  let db = new TenantDatabase();

  let params = {
    userId:   criteria.userId   ? DbParameter.string(criteria.userId)                   : null,
    userName: criteria.userName ? DbParameter.string(toLikeParam(criteria.userName))     : null,
    status:   criteria.status   ? DbParameter.string(criteria.status)                   : null
  };

  return db.executeByTemplate('/user/sql/searchUsers', params);
}
```

### fetchByTemplate（带分页）

```javascript
function searchUsersWithPaging(criteria, start, length) {
  let db = new TenantDatabase();
  let params = {
    userId: criteria.userId ? DbParameter.string(criteria.userId) : null,
    status: criteria.status ? DbParameter.string(criteria.status) : null
  };
  return db.fetchByTemplate('/user/sql/searchUsers', start, length, params);
}
```

- `start` 从 1 开始，`length` 为获取件数
- 返回值为 `DatabaseResult`（`data`、`countRow`、`isSuccess()` 等）

## 参数传递

- 参数以**对象格式**传递（键名与 SQL 中的参数名一致）
- 值必须用 **`DbParameter.string()` / `DbParameter.integer()` 等包装**
- 未指定的参数传 `null`，并通过 `/*IF param != null*/` 进行分支

### DbParameter 类型选择规则

`DbParameter` 的类型方法应**与 DDL 的列定义对应选择**。
不得凭推测或程序内变量的类型来判断。

| DDL 列类型 | DbParameter 方法 | 常见错误 |
|---|---|---|
| `VARCHAR` / `CHAR` / `TEXT` | `DbParameter.string()` | 对年度（`VARCHAR(4)`）使用 `DbParameter.number()` → 类型不匹配错误 |
| `INTEGER` / `BIGINT` | `DbParameter.number()` | - |
| `DECIMAL` / `NUMERIC` | `DbParameter.number()` | - |
| `DATE` | `DbParameter.date()` | - |
| `TIMESTAMP` | `DbParameter.timestamp()` | - |
| `BOOLEAN` | `DbParameter.boolean()` | - |

**操作步骤：**
1. 确认目标表的 DDL（或数据模型定义）
2. 确定列的类型
3. 根据上述对应表选择 `DbParameter` 方法

**需要特别注意的列：**
- **年度、年月、代码类以 `VARCHAR` 定义时**：即使值仅为数字，也使用 `DbParameter.string(String(value))`
- **金额、数量以 `DECIMAL` 定义时**：使用 `DbParameter.number()`（不是 `DbParameter.string()`）
- **可能为 NULL 的 `DATE` / `TIMESTAMP` 列**：请参阅下方「INSERT / UPDATE 中 NULL 值的传递方式」

如果 DDL 尚未创建，请在实现前先创建 DDL 或在数据模型定义中确定类型，再选择 `DbParameter`。

### INSERT / UPDATE 中 NULL 值的传递方式

`executeByTemplate` 要求参数对象中的所有值都是 `DbParameter` 实例。
直接传递原始的 `null` 会导致 `The parameter must be instance of DbParameter` 运行时错误。

| DDL 列类型 | 有值时 | 无值（NULL）时 | 直接传递 `null` 时 |
|---|---|---|---|
| `VARCHAR` / `CHAR` / `TEXT` | `DbParameter.string(value)` | `DbParameter.string(null)` | 运行时错误 |
| `INTEGER` / `BIGINT` / `DECIMAL` | `DbParameter.number(value)` | `DbParameter.number(null)` | 运行时错误 |
| `DATE` | `DbParameter.date(new Date(value))` | `new DbParameter(null, DbParameter.TYPE_DATE)` | 运行时错误 |
| `TIMESTAMP` | `DbParameter.timestamp(new Date(value))` | `new DbParameter(null, DbParameter.TYPE_TIMESTAMP)` | 运行时错误 |

**为何 DATE / TIMESTAMP 需要使用构造函数：**
`string` / `number` 的参数是 JavaScript 基本类型，将 `null` 直接传递给 Java 侧不会出错。
而 `DbParameter.date()` / `DbParameter.timestamp()` 将参数作为 Java 的 `Date` 对象处理，传递 `null` 时会发生 NullPointerException。
**需要对象类型参数的工厂方法不能接受 `null`。**

```javascript
// VARCHAR / 数值列 — 可以直接传递 null
remarks : DbParameter.string(remarks),   // remarks 为 null → NULL
quantity: DbParameter.number(quantity),  // quantity 为 null → NULL

// DATE / TIMESTAMP 列 — 为 null 时使用构造函数
period_end_date: periodEndDate
  ? DbParameter.date(new Date(periodEndDate))
  : new DbParameter(null, DbParameter.TYPE_DATE)
```

**需要注意，本表仅适用于该列不通过 `/*IF*/` 分支、始终输出到 SQL 正文的场景**（例如 INSERT 语句中始终指定的列、UPDATE 语句中始终 SET 的列等）。

> **注意：** `DbParameter.NULL` 是类型常量（`number` 类型的值），而非 DbParameter 实例。仅用于存储过程。不得用于普通的 INSERT/UPDATE。

### 【重要】通过 `/*IF*/` 分支的 DATE / TIMESTAMP 参数应传递原始的 `null`

对于像检索条件（WHERE 子句）那样通过 `/*IF paramName != null*/` 来分支是否指定的 DATE / TIMESTAMP 参数，如果以与上表相同的思路传递 `new DbParameter(null, DbParameter.TYPE_DATE)`，已在实机确认会出现以下问题：**由于 `/*IF*/` 的条件表达式是针对 DbParameter 对象本身进行判定的，即便值为 null 也会被误判为"已指定"，从而在 SQL 中附加类似 `AND some_date >= NULL` 的恒假条件，结果导致检索结果为 0 件**。

```javascript
// NG: /*IF orderDateFrom != null*/ 恒被判定为 true，
//     附加 "AND order_date >= NULL" 导致无法命中任何记录
let params = {
  orderDateFrom: orderDateFrom
    ? DbParameter.date(parseLocalDate(orderDateFrom))
    : new DbParameter(null, DbParameter.TYPE_DATE)
};

// OK: 未指定时传递原始 null，让 /*IF*/ 一侧正确分支
let params = {
  orderDateFrom: orderDateFrom
    ? DbParameter.date(parseLocalDate(orderDateFrom))
    : null
};
```

总结：`new DbParameter(null, TYPE_DATE)` 仅用于该列**始终**输出到 SQL 正文的场景，通过 `/*IF*/` 分支的场景应使用**原始的 `null`**。

## 直接嵌入（`/*$param*/`）的使用规则

仅用于**无法使用绑定变量指定的位置**，例如 ORDER BY 子句中的列名和排序方向。

```sql
SELECT user_id, user_name, email
FROM users
ORDER BY /*$sortColumn*/user_id /*$sortOrder*/ASC
```

```javascript
function searchUsersWithSort(sortColumn, sortOrder) {
  let db = new TenantDatabase();

  // 白名单验证（必须）
  let allowedColumns = ['user_id', 'user_name', 'created_at'];
  let allowedOrders  = ['ASC', 'DESC'];

  if (allowedColumns.indexOf(sortColumn) === -1) {
    throw new Error('Invalid column');
  }
  if (allowedOrders.indexOf(sortOrder) === -1) {
    throw new Error('Invalid order');
  }

  return db.executeByTemplate('/user/sql/dynamicSort', {
    sortColumn: sortColumn,
    sortOrder:  sortOrder
  });
}
```

### `/*$param*/` 的必须规则

- **不得直接传递用户输入**
- 必须进行**白名单验证**，对不在允许列表中的值抛出异常
- 未经验证的使用将在代码审查中被标记为 NG

## 结果集处理

```javascript
let result = db.executeByTemplate('/user/sql/searchUsers', params);

if (!result.isSuccess()) {
  Logger.getLogger().error('SQL 执行失败: ' + result.errorMessage);
  throw new Error('搜索失败');
}

let users = [];
for (let i = 0; i < result.data.length; i++) {
  let row = result.data[i];
  users.push({
    userId:   row.user_id,
    userName: row.user_name,
    email:    row.email
  });
}
```

- 返回值为 `DatabaseResult` 对象
- `result.data` 为数组，每个元素是以**列名（小写）为键**的对象
- 通过 `isSuccess()` 判断执行成功与否，错误消息在 `errorMessage` 中

## 动态 SET 子句（UPDATE 语句）的构建

若试图用 `/*BEGIN*/` 包裹 UPDATE 语句的 SET 子句，期待其去除各项前置的逗号，其行为不稳定，因为**结果取决于逗号在文件中的位置**。

- 若将逗号放在与 `/*IF*/` 标记**同一行的行首**，解析器能正确将其识别为前置符并予以删除
- 若将逗号**换行后置于缩进的另一行**，解析器无法将其识别为前置符，导致开头残留裸露的逗号，形成不合法的 SQL 并引发语法错误（已在实机确认：`ERROR: syntax error at or near ","`）

此外，`/*BEGIN*/` 在其内部所有条件均为假时，会将整个 SET 子句（连同 `SET` 关键字）一并删除，因此在没有任何待更新列的情况下，也会产生不合法的 SQL（没有 `SET` 的 `UPDATE`）。

由于**逗号前置符的删除依赖格式、容易失效，且与 `/*BEGIN*/`「全部条件为假时整块消失」的特性也存在冲突**，因此不应采用依赖 `/*BEGIN*/` 去除 SET 子句逗号的写法。

会导致语法错误的示例（逗号换行置于缩进行）：

```sql
UPDATE users
/*BEGIN*/
SET
  /*IF status != null*/
  , status = /*status*/'active'
  /*END*/
  /*IF memo != null*/
  , memo = /*memo*/'memo'
  /*END*/
/*END*/
WHERE user_id = /*userId*/'dummy'
```

应始终在 SET 子句开头放置一个不改变对象的自我赋值（例如主键列 `= 自身`），之后的各项不使用 `/*BEGIN*/`，而是始终带逗号进行连接。
该方式不依赖逗号的位置，也不存在 SET 子句整体消失的风险。

```sql
UPDATE users
SET
  user_id = /*userId*/'dummy'
  /*IF status != null*/
  , status = /*status*/'active'
  /*END*/
  /*IF memo != null*/
  , memo = /*memo*/'memo'
  /*END*/
WHERE user_id = /*userId*/'dummy'
```

## 事务处理

执行 INSERT / UPDATE / DELETE 等**写入类 SQL** 时，必须通过 `Transaction.begin()` 设置事务边界。

### 必须遵守的规则

- **写入类 SQL（`execute` / `executeByTemplate` 的 INSERT/UPDATE/DELETE，以及 `insert` / `update` / `delete`）必须在 `Transaction.begin()` 内执行**
- 即使是单条 SQL 的更新，也应在事务内执行以保证业务一致性
- 多表更新、循环 INSERT 多行等，必须归并在**同一事务内**
- 如果在 `Transaction.begin()` 的回调内发生异常，将**自动回滚**
- 不得吞噬异常，应在记录日志后重新抛出
- 仅有 SELECT 的查询处理不需要事务

### 实现示例

```javascript
function registerOrder(data) {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();

  try {
    Transaction.begin(function() {
      // 注册头部记录
      db.executeByTemplate('/order/sql/insertOrder', {
        orderId:   DbParameter.string(data.orderId),
        customer:  DbParameter.string(data.customer)
      });

      // 注册明细记录（循环也在同一事务内）
      for (let i = 0; i < data.items.length; i++) {
        db.executeByTemplate('/order/sql/insertOrderItem', {
          orderId:  DbParameter.string(data.orderId),
          itemId:   DbParameter.string(data.items[i].itemId),
          quantity: DbParameter.integer(data.items[i].quantity)
        });
      }
    });
    return true;

  } catch (e) {
    logger.error('事务错误: {}', e.message);
    throw e;
  }
}
```

### 反模式

```javascript
// NG: 不使用事务直接执行写入类 SQL
db.executeByTemplate('/order/sql/insertOrder', params);

// NG: 在循环内对每条 INSERT 单独提交的结构
for (let i = 0; i < items.length; i++) {
  Transaction.begin(function() {
    db.executeByTemplate('/order/sql/insertOrderItem', ...);
  });
}
```

## 检查清单

- [ ] 外部化的 SQL 模板是否使用了 `executeByTemplate` / `fetchByTemplate`（未将模板路径传给 `execute`）？
- [ ] SQL 是否外部化到 `src/main/jssp/src/{功能名}/sql/` 目录下？
- [ ] 传递给 `executeByTemplate` / `fetchByTemplate` 的路径是否为以 `src/main/jssp/src/` 为起点的绝对路径（以斜杠开头）？
- [ ] 文件编码是否为 UTF-8？
- [ ] 传递给 `executeByTemplate` / `fetchByTemplate` 的路径是否已去掉 `.sql` 扩展名？
- [ ] **SQL 文件中是否未书写 `--` 注释**（用途、说明是否已写在调用方的 JSDoc 中）？
- [ ] 绑定参数是否使用了 `/*param*/'dummy'` 格式？
- [ ] 使用 `/*$param*/` 的地方是否经过白名单验证？
- [ ] 是否未使用 `/*FOR*/` 语法？是否未在 `/*BEGIN*/` 块内嵌套 `/*IF*/`（是否已并列为兄弟关系）？
- [ ] 参数是否用 `DbParameter.xxx()` 包装？
- [ ] `DbParameter` 的类型方法是否与 DDL 的列类型一致（VARCHAR 用 `string()`，INTEGER/DECIMAL 用 `number()` 等）？
- [ ] `DATE` / `TIMESTAMP` 列是否未使用 `DbParameter.string()`（在 PostgreSQL 中会导致类型不匹配错误）？
- [ ] 向 `DATE` / `TIMESTAMP` 列插入 NULL 时，是否仅在该列始终输出的场景下使用了 `new DbParameter(null, DbParameter.TYPE_DATE)` / `new DbParameter(null, DbParameter.TYPE_TIMESTAMP)`（通过 `/*IF*/` 分支的场景是否使用了原始的 `null`）？
- [ ] IN 子句带括号绑定（`/*param*/('dummy')`）中，数组的每个元素是否都用 `DbParameter` 包装？
- [ ] UPDATE 语句的 SET 子句是否未期待 `/*BEGIN*/` 去除逗号前置符（是否采用了自我赋值置于开头的方式）？
- [ ] 是否通过 `result.isSuccess()` 判断执行成功与否？
- [ ] 是否未通过字符串拼接构建 SQL？
- [ ] LIKE 搜索是否转义了 LIKE 特殊字符（转义字符本身、`%`、`_`）？
- [ ] LIKE 搜索的 SQL 中是否添加了 `ESCAPE '@'` 子句（是否未使用 `ESCAPE '\'`）？
- [ ] LIKE 搜索的通配符（`%`）是否在服务端附加（禁止从客户端发送）？
- [ ] 写入类 SQL（INSERT/UPDATE/DELETE）是否在 `Transaction.begin()` 内执行？
- [ ] 多表更新和循环更新是否归并在同一事务内？
- [ ] 事务内发生的异常是否在记录日志后重新抛出？

## 相关文件

- `.claude/rules/jssp-security.md` - SQL 注入防护的整体方针
- `.claude/skills/jssp-page-generator/reference/api-database.md` - Database API 参考
- `d.ts/platform/database/im-ssjs-tenant-database.d.ts` - TenantDatabase 类型定义
- `d.ts/platform/database/im-ssjs-shared-database.d.ts` - SharedDatabase 类型定义
