---
paths:
  - "src/main/tssp/**/*.ts"
  - "src/main/jssp/**/*.sql"
---

# 数据库操作 API 参考手册

## 概述

在函数容器中直接访问数据库、获取/添加/更新/删除数据的API调用方法。

### 注意事项

- 如果另外提供了用于操作数据库的Java API，优先使用Java API
- 对数据库的直接访问应控制在最低限度

## 数据库类的使用区分

| 类 | 用途 | 范围 |
|--------|------|----------|
| `TenantDatabase` | 访问租户特有数据 | 每个租户 |
| `SharedDatabase` | 外部系统集成、共享数据 | 整个系统 |

```typescript
// 租户数据库（通常使用此项）
let tenantDb = new TenantDatabase();

// 共享数据库（外部系统集成时，指定连接ID）
let sharedDb = new SharedDatabase('dataSourceId');
```

## 主要方法列表

### SELECT类

| 方法 | 用途 | 返回值 |
|---------|------|--------|
| `select(sql, params)` | 执行SELECT | 结果集 |
| `fetch(sql, start, length, params)` | 带分页的SELECT | 结果集 |
| `executeByTemplate(path, params)` | 执行2WaySQL | 结果集 |
| `fetchByTemplate(path, start, length, params)` | 2WaySQL+分页 | 结果集 |

**fetch/fetchByTemplate的参数：**
- `path/sql`：SQL模板路径或SQL字符串
- `start`：获取起始行（从1开始）
- `length`：获取件数（0表示全部）
- `params`：绑定参数（可省略）

### 更新类

| 方法 | 用途 | 返回值 |
|---------|------|--------|
| `execute(sql, params)` | 通用SQL执行 | DatabaseResult |
| `insert(tableName, dataObject)` | INSERT | DatabaseResult |
| `update(tableName, dataObject, condition, params)` | UPDATE | DatabaseResult |
| `remove(tableName, condition, params)` | DELETE | DatabaseResult |

## 使用DbParameter（推荐）

推荐使用DbParameter对象传递参数。
作为PreparedStatement进行绑定，可以防止SQL注入。

### DbParameter的类型

| 方法 | 用途 |
|---------|------|
| `DbParameter.string(value)` | 字符串 |
| `DbParameter.number(value)` | 数值 |
| `DbParameter.clob(textReader)` | CLOB（大型文本） |
| `DbParameter.binary(byteReader)` | BLOB（二进制） |

### 使用示例

```typescript
// 推荐：使用DbParameter
let db = new TenantDatabase();
let sql = 'SELECT * FROM users WHERE user_id = ? AND status = ?';
let result = db.select(sql, [
  DbParameter.string(userId),
  DbParameter.string(status)
]);

// 分页获取（从start=1获取10件）
let pagedResult = db.fetch(sql, 1, 10, [
  DbParameter.string(userId),
  DbParameter.string(status)
]);
```

**注意：**
- 传入 `undefined` 时被视为 `null`
- 不支持数组参数（如Oracle VARRAY等）
- d.ts 中 `DbParameter.string()` / `DbParameter.number()` 的参数类型不包含 `null`，因此传入可能为 `null` 的值会在 `tssp build` 的类型检查中报 TS2345。对于始终输出到SQL正文中、且值可能为 `null` 的列，请使用 `new DbParameter(value, DbParameter.TYPE_STRING)`（数值使用 `DbParameter.TYPE_NUMBER`）传递；对于在2WaySQL中通过 `/*IF*/` 分支的参数，则直接传递 `null`（参见 `.github/instructions/jssp-2way-sql.instructions.md` 的“INSERT / UPDATE 中 NULL 值的传递方式”）

## 推荐使用insert/update/remove方法

建议使用 `insert`/`update`/`remove` 方法，而非直接编写SQL字符串。

```typescript
// insert / update / remove 属于更新类操作，因此在 Transaction.begin() 中执行，检查各结果的 error 并 throw（仅当回调因异常退出时才会回滚）
let db = new TenantDatabase();
let txResult = Transaction.begin(function(): void {
  // 推荐：insert方法
  let insertData = {
    user_id: 'U001',
    user_name: '山田太郎',
    email: 'yamada@example.com',
    created_at: new Date()
  };
  let insertResult = db.insert('users', insertData);
  if (insertResult.error) {
    throw new Error(insertResult.errorMessage);
  }

  // 推荐：update方法（使用DbParameter）
  let updateData = {
    user_name: '山田次郎',
    updated_at: new Date()
  };
  let updateResult = db.update('users', updateData, 'user_id = ?', [DbParameter.string('U001')]);
  if (updateResult.error) {
    throw new Error(updateResult.errorMessage);
  }

  // 推荐：remove方法（使用DbParameter）
  let removeResult = db.remove('users', 'user_id = ?', [DbParameter.string('U001')]);
  if (removeResult.error) {
    throw new Error(removeResult.errorMessage);
  }
});
if (!txResult.isSuccess()) {
  throw new Error(txResult.errorMessage);
}
```

## 2WaySQL（executeByTemplate）

### 概述

将SQL文件外部化，安全构建包含条件分支的动态SQL的机制。

### SQL文件的存放位置

SQL文件**必须放置在 `src/main/jssp/src/` 目录下**（无法从外部目录加载）。
按功能单元放置在 `src/main/jssp/src/{功能名}/sql/` 下。

```
src/main/tssp/src/                # 编写 .ts 和 .html
└── user/
    └── view/
        ├── user_list.ts
        └── user_list.html
src/main/jssp/src/                # tssp build 的输出目录
└── user/
    ├── view/                     # 由 tssp build 输出（不要手动编辑）
    │   ├── user_list.js
    │   └── user_list.html
    └── sql/                      # .sql 需手动放置（tssp build 不会输出）
        ├── selectUser.sql
        └── searchUsers.sql
```
`src/main/jssp/src` 是 `tssp build` 的输出目录，手动放置在此处的只有 `.sql` 这类 `tssp build` 不会输出的文件（`tssp build` 只会输出由 `.ts` 转换而来的 `.js`（使用 `--dev` 时还有 `.js.map`）以及复制过来的 `.html`，因此放在 `src/main/tssp/src` 中的 `.sql` 不会被输出，`executeByTemplate` 也无法加载）。

传递给 `executeByTemplate` / `fetchByTemplate` 的路径：
- **以 `src/main/jssp/src/` 为起点的绝对路径**（以斜杠开头）
- **不包含 `.sql` 扩展名**（包含扩展名会导致执行失败）

示例：`/user/sql/searchUsers`

### 2WaySQL语法

| 语法 | 用途 | 备注 |
|------|------|------|
| `/*IF condition*/.../*END*/` | 条件分支 | |
| `/*BEGIN*/.../*END*/` | 可选块 | |
| `/*param*/'dummy'` | 绑定占位符 | PreparedStatement方式 |
| `/*$param*/dummy` | 直接嵌入 | 注意SQL注入 |

**注意：** FOR语法（`/*FOR item : list*/.../*END*/`）在LogicDesigner/im_mirage中可用，但**脚本开发模型不支持**。

### SQL文件示例（searchUsers.sql）

```sql
SELECT user_id, user_name, email
FROM users
/*BEGIN*/
WHERE
  /*IF userId != null*/
    user_id = /*userId*/'dummy'
  /*END*/
  /*IF userName != null*/
    AND user_name LIKE /*userName*/'%dummy%'
  /*END*/
  /*IF status != null*/
    AND status = /*status*/'active'
  /*END*/
/*END*/
ORDER BY user_id
```

**注意：** `/*param*/'dummy'` 中的 `'dummy'` 是用于2WaySQL执行确认的虚拟值。执行时会被替换为绑定参数。

### 调用示例

```typescript
/** 检索条件（未指定的项目省略） */
interface UserSearchCriteria {
  userId?: string;
  userName?: string;
  status?: string;
}

function searchUsers(criteria: UserSearchCriteria): DatabaseResult {
  let db = new TenantDatabase();

  let params = {
    userId: criteria.userId ? DbParameter.string(criteria.userId) : null,
    userName: criteria.userName ? DbParameter.string('%' + criteria.userName + '%') : null,
    status: criteria.status ? DbParameter.string(criteria.status) : null
  };

  // 执行 src/main/jssp/src/user/sql/searchUsers.sql
  return db.executeByTemplate('/user/sql/searchUsers', params);
}

// 分页获取（从start=1获取20件）
function searchUsersWithPaging(criteria: UserSearchCriteria, start: number, length: number): DatabaseResult {
  let db = new TenantDatabase();

  let params = {
    userId: criteria.userId ? DbParameter.string(criteria.userId) : null,
    status: criteria.status ? DbParameter.string(criteria.status) : null
  };

  return db.fetchByTemplate('/user/sql/searchUsers', start, length, params);
}
```

### 直接嵌入（/*$变量名*/）

用于无法使用绑定变量的位置，如ORDER BY子句或列名等。

**SQL文件示例（dynamicSort.sql）：**
```sql
SELECT user_id, user_name, email
FROM users
ORDER BY /*$sortColumn*/user_id /*$sortOrder*/ASC
```

**调用示例（必须使用白名单进行验证）：**
```typescript
function searchUsersWithSort(sortColumn: string, sortOrder: string): DatabaseResult {
  let db = new TenantDatabase();

  // 白名单验证（必须）
  let allowedColumns = ['user_id', 'user_name', 'created_at'];
  let allowedOrders = ['ASC', 'DESC'];

  if (allowedColumns.indexOf(sortColumn) === -1) {
    throw new Error('Invalid column');
  }
  if (allowedOrders.indexOf(sortOrder) === -1) {
    throw new Error('Invalid order');
  }

  let params = {
    sortColumn: sortColumn,
    sortOrder: sortOrder
  };

  return db.executeByTemplate('/user/sql/dynamicSort', params);
}
```

**警告：** `/*$*/` 会将值直接嵌入SQL，存在 **SQL注入风险**。
不要直接传入用户输入，必须进行白名单验证。

### SQL文件规范

- 字符编码：**UTF-8**（必须）
- 扩展名：`.sql`
- 存放位置：`src/main/jssp/src/{功能名}/sql/` 目录下（`tssp build` 不会输出 `.sql`，因此需手动放置）

## 结果集的处理

### select/executeByTemplate的结果处理

`select`/`executeByTemplate` 的返回值是 `DatabaseResult` 对象。
获取的数据存储在 `result.data` 数组中，每个元素是以列名（小写）为键的对象。

```typescript
/** 用户列表中的一条记录 */
interface User {
  userId: string;
  userName: string;
  email: string;
}

function getUserList(): User[] {
  let db = new TenantDatabase();
  let sql = 'SELECT user_id, user_name, email FROM users';
  let result = db.select(sql, []);

  let users: User[] = [];
  for (let i = 0; i < result.data.length; i++) {
    let row = result.data[i];
    users.push({
      userId: row.user_id,
      userName: row.user_name,
      email: row.email
    });
  }

  return users;
}
```

### DatabaseResult的主要属性

| 属性/方法 | 类型 | 用途 |
|---------|------|------|
| `data` | Array | 获取数据的数组（通过列名访问） |
| `countRow` | Number | 获取或受影响的行数 |
| `error` | Boolean | 发生错误时为 `true` |
| `errorMessage` | String | 错误消息 |
| `isSuccess()` | Boolean | 处理正常完成时为 `true` |

## 注意事项

### SQL注入对策

- 必须使用参数化查询或2WaySQL
- **严禁**通过字符串拼接构建SQL
- 推荐使用DbParameter

```typescript
// 严禁！！！
let badSql = "SELECT * FROM users WHERE user_id = '" + userId + "'";

// 正确实现（使用DbParameter）
let sql = 'SELECT * FROM users WHERE user_id = ?';
let result = db.select(sql, [DbParameter.string(userId)]);
```

### LIKE搜索的通配符

```typescript
// 正确示例：在调用侧添加通配符
let keyword = '山田';
let sql = 'SELECT * FROM users WHERE user_name LIKE ?';
let result = db.select(sql, [DbParameter.string('%' + keyword + '%')]);

// 2WaySQL的情况
let params = { userName: DbParameter.string('%' + keyword + '%') };
db.executeByTemplate('/user/sql/searchUsers', params);
```

### 事务处理

```typescript
/** 要登记到 orders 表的一行（键为列名） */
interface OrderRow {
  order_id: string;
  customer_name: string;
}

/** 要登记到 order_items 表的一行（键为列名） */
interface OrderItemRow {
  order_id: string;
  item_id: string;
  quantity: number;
}

/** 要登记的订单 */
interface OrderInsertData {
  order: OrderRow;
  items: OrderItemRow[];
}

function executeTransaction(data: OrderInsertData): boolean {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();

  try {
    // 事务
    let txResult = Transaction.begin(function(): void {
      // 多个DB操作
      let orderResult = db.insert('orders', data.order);
      if (orderResult.error) {
        throw new Error(orderResult.errorMessage);
      }
      for (let i = 0; i < data.items.length; i++) {
        let itemResult = db.insert('order_items', data.items[i]);
        if (itemResult.error) {
          throw new Error(itemResult.errorMessage);
        }
      }
    });
    if (!txResult.isSuccess()) {
      throw new Error(txResult.errorMessage);
    }

    return true;

  } catch (e) {
    logger.error('事务错误：{}', (e as Error).message);
    throw e;
  }
}
```

## 大量数据的处理

### DB连接的高效化

数据库连接次数应尽量减少。
在循环中反复连接数据库会造成较大开销，影响运行性能。

正确示例：
```typescript
// 使用IN子句一次性获取（selectUsersByIds.sql: SELECT * FROM users WHERE user_id IN /*userIds*/('dummy')）
let db = new TenantDatabase();
let params = {
  userIds: userIds.map(function(userId: string): DbParameter { return DbParameter.string(userId); })
};
let result = db.executeByTemplate('/user/sql/selectUsersByIds', params);
```

通过字符串拼接构建SQL会导致 `validate-jssp-code.js` 报 `JSSP-JS-004` 错误，因此IN子句使用2WaySQL的带括号绑定来展开。`userIds` 为 `null` 或空数组时的防护，参见 `.github/instructions/jssp-2way-sql.instructions.md` 的“IN 子句的动态生成”。

错误示例：
```typescript
// 在循环中反复连接DB
for (let i = 0; i < userIds.length; i++) {
  let db = new TenantDatabase();  // 每次都重新连接
  let result = db.select('SELECT * FROM users WHERE user_id = ?', [DbParameter.string(userIds[i])]);
}
```

### 分页处理的实现

```typescript
function fetchDataWithPaging(pageSize: number, pageNo: number): DatabaseResult {
  let db = new TenantDatabase();
  let offset = (pageNo - 1) * pageSize;

  let sql = 'SELECT * FROM large_table ORDER BY id LIMIT ? OFFSET ?';
  return db.select(sql, [DbParameter.number(pageSize), DbParameter.number(offset)]);
}
```
