---
paths:
  - "src/main/tssp/**/*.ts"
  - "src/main/jssp/**/*.sql"
---

# Database Operations API Reference

## Overview

This describes how to call APIs to directly access a database from a function container to retrieve, add, update, and delete data.

### Notes

- If a Java API is separately provided for database operations, prefer using the Java API
- Direct database access should be kept to a minimum

## Choosing the Database Class

| Class | Use Case | Scope |
|--------|------|----------|
| `TenantDatabase` | Access to tenant-specific data | Per tenant |
| `SharedDatabase` | External system integration, shared data | System-wide |

```typescript
// Tenant database (use this in most cases)
let tenantDb = new TenantDatabase();

// Shared database (for external system integration, specify connection ID)
let sharedDb = new SharedDatabase('dataSourceId');
```

## Main Method List

### SELECT Methods

| Method | Use Case | Return Value |
|---------|------|--------|
| `select(sql, params)` | Execute SELECT | Result set |
| `fetch(sql, start, length, params)` | SELECT with paging | Result set |
| `executeByTemplate(path, params)` | Execute 2WaySQL | Result set |
| `fetchByTemplate(path, start, length, params)` | 2WaySQL + paging | Result set |

**Arguments for fetch/fetchByTemplate:**
- `path/sql`: SQL template path or SQL string
- `start`: Starting row for retrieval (1-based)
- `length`: Number of records to retrieve (0 for all)
- `params`: Bind parameters (optional)

### Update Methods

| Method | Use Case | Return Value |
|---------|------|--------|
| `execute(sql, params)` | General SQL execution | DatabaseResult |
| `insert(tableName, dataObject)` | INSERT | DatabaseResult |
| `update(tableName, dataObject, condition, params)` | UPDATE | DatabaseResult |
| `remove(tableName, condition, params)` | DELETE | DatabaseResult |

## Using DbParameter (Recommended)

It is recommended to pass parameters using DbParameter objects.
They are bound as PreparedStatements, which prevents SQL injection.

### DbParameter Types

| Method | Use Case |
|---------|------|
| `DbParameter.string(value)` | String |
| `DbParameter.number(value)` | Number |
| `DbParameter.clob(textReader)` | CLOB (large text) |
| `DbParameter.binary(byteReader)` | BLOB (binary) |

### Usage Example

```typescript
// Recommended: Use DbParameter
let db = new TenantDatabase();
let sql = 'SELECT * FROM users WHERE user_id = ? AND status = ?';
let result = db.select(sql, [
  DbParameter.string(userId),
  DbParameter.string(status)
]);

// Paged retrieval (10 records starting from start=1)
let pagedResult = db.fetch(sql, 1, 10, [
  DbParameter.string(userId),
  DbParameter.string(status)
]);
```

**Notes:**
- Passing `undefined` is treated as `null`
- Array parameters (e.g., Oracle VARRAY) are not supported
- The argument types of `DbParameter.string()` / `DbParameter.number()` in the d.ts do not include `null`, so passing a value that can be `null` causes TS2345 in the type checking of `tssp build`. For a column that is always output in the SQL body and whose value can be `null`, pass `new DbParameter(value, DbParameter.TYPE_STRING)` (`DbParameter.TYPE_NUMBER` for numbers); for a parameter branched with `/*IF*/` in 2WaySQL, pass a plain `null` (see "How to Pass NULL Values in INSERT / UPDATE" in `.github/instructions/jssp-2way-sql.instructions.md`)

## Recommended: insert/update/remove Methods

Instead of writing SQL strings directly, it is recommended to use the `insert`/`update`/`remove` methods.

```typescript
// insert / update / remove are update operations, so run them inside Transaction.begin(), check the error of each result, and throw (rollback happens only when the callback exits with an exception)
let db = new TenantDatabase();
let txResult = Transaction.begin(function(): void {
  // Recommended: insert method
  let insertData = {
    user_id: 'U001',
    user_name: 'Yamada Taro',
    email: 'yamada@example.com',
    created_at: new Date()
  };
  let insertResult = db.insert('users', insertData);
  if (insertResult.error) {
    throw new Error(insertResult.errorMessage);
  }

  // Recommended: update method (using DbParameter)
  let updateData = {
    user_name: 'Yamada Jiro',
    updated_at: new Date()
  };
  let updateResult = db.update('users', updateData, 'user_id = ?', [DbParameter.string('U001')]);
  if (updateResult.error) {
    throw new Error(updateResult.errorMessage);
  }

  // Recommended: remove method (using DbParameter)
  let removeResult = db.remove('users', 'user_id = ?', [DbParameter.string('U001')]);
  if (removeResult.error) {
    throw new Error(removeResult.errorMessage);
  }
});
if (!txResult.isSuccess()) {
  throw new Error(txResult.errorMessage);
}
```

## 2WaySQL (executeByTemplate)

### Overview

A mechanism for externalizing SQL files and safely building dynamic SQL with conditional branching.

### SQL File Placement

SQL files **must be placed under `src/main/jssp/src/`** (they cannot be loaded from outside this directory).
Place them under `src/main/jssp/src/{feature-name}/sql/` by feature unit.

```
src/main/tssp/src/                # write .ts and .html
└── user/
    └── view/
        ├── user_list.ts
        └── user_list.html
src/main/jssp/src/                # output destination of tssp build
└── user/
    ├── view/                     # output by tssp build (do not edit by hand)
    │   ├── user_list.js
    │   └── user_list.html
    └── sql/                      # place .sql by hand (tssp build does not output it)
        ├── selectUser.sql
        └── searchUsers.sql
```
`src/main/jssp/src` is the output destination of `tssp build`, and the only files you place there by hand are files such as `.sql` that `tssp build` does not output (`tssp build` outputs only the `.js` converted from `.ts` (plus `.js.map` with `--dev`) and the copied `.html`, so a `.sql` placed in `src/main/tssp/src` is not output and cannot be loaded from `executeByTemplate`).

The path passed to `executeByTemplate` / `fetchByTemplate` should be:
- **An absolute path starting from `src/main/jssp/src/`** (with a leading slash)
- **Without the `.sql` extension** (including it will cause execution failure)

Example: `/user/sql/searchUsers`

### 2WaySQL Syntax

| Syntax | Use Case | Notes |
|------|------|------|
| `/*IF condition*/.../*END*/` | Conditional branching | |
| `/*BEGIN*/.../*END*/` | Optional block | |
| `/*param*/'dummy'` | Bind placeholder | PreparedStatement style |
| `/*$param*/dummy` | Direct embedding | Risk of SQL injection |

**Note:** The FOR syntax (`/*FOR item : list*/.../*END*/`) is available in LogicDesigner/im_mirage, but **is not supported in the script development model**.

### SQL File Example (searchUsers.sql)

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

**Note:** The `'dummy'` in `/*param*/'dummy'` is a dummy value for 2WaySQL execution verification. At runtime, it is replaced by the bind parameter.

### Call Example

```typescript
/** Search criteria (omit unspecified items) */
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

  // Execute src/main/jssp/src/user/sql/searchUsers.sql
  return db.executeByTemplate('/user/sql/searchUsers', params);
}

// Paged retrieval (20 records starting from start=1)
function searchUsersWithPaging(criteria: UserSearchCriteria, start: number, length: number): DatabaseResult {
  let db = new TenantDatabase();

  let params = {
    userId: criteria.userId ? DbParameter.string(criteria.userId) : null,
    status: criteria.status ? DbParameter.string(criteria.status) : null
  };

  return db.fetchByTemplate('/user/sql/searchUsers', start, length, params);
}
```

### Direct Embedding (/*$variable*/)

Used for locations where bind variables cannot be specified, such as ORDER BY clauses or column names.

**SQL File Example (dynamicSort.sql):**
```sql
SELECT user_id, user_name, email
FROM users
ORDER BY /*$sortColumn*/user_id /*$sortOrder*/ASC
```

**Call Example (must always validate with a whitelist):**
```typescript
function searchUsersWithSort(sortColumn: string, sortOrder: string): DatabaseResult {
  let db = new TenantDatabase();

  // Whitelist validation (required)
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

**Warning:** `/*$*/` embeds values directly into SQL, which poses a **risk of SQL injection**.
Never pass user input directly; always perform whitelist validation.

### SQL File Conventions

- Character encoding: **UTF-8** (required)
- Extension: `.sql`
- Placement: Under `src/main/jssp/src/{feature-name}/sql/` (`tssp build` does not output `.sql`, so place it by hand)

## Processing Result Sets

### Processing select/executeByTemplate Results

The return value of `select`/`executeByTemplate` is a `DatabaseResult` object.
Fetched data is stored in the `result.data` array, with each element being an object keyed by column name (lowercase).

```typescript
/** One entry of the user list */
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

### Main DatabaseResult Properties

| Property/Method | Type | Use Case |
|---------|------|------|
| `data` | Array | Array of retrieved data (accessed by column name) |
| `countRow` | Number | Number of retrieved or affected rows |
| `error` | Boolean | `true` when an error occurs |
| `errorMessage` | String | Error message |
| `isSuccess()` | Boolean | `true` when processing completes successfully |

## Important Notes

### SQL Injection Prevention

- Always use parameterized queries or 2WaySQL
- Building SQL by string concatenation is **absolutely prohibited**
- Use of DbParameter is recommended

```typescript
// Absolutely prohibited!!!
let badSql = "SELECT * FROM users WHERE user_id = '" + userId + "'";

// Correct implementation (using DbParameter)
let sql = 'SELECT * FROM users WHERE user_id = ?';
let result = db.select(sql, [DbParameter.string(userId)]);
```

### LIKE Search Wildcards

```typescript
// Good: Add wildcards on the calling side
let keyword = 'Yamada';
let sql = 'SELECT * FROM users WHERE user_name LIKE ?';
let result = db.select(sql, [DbParameter.string('%' + keyword + '%')]);

// In 2WaySQL
let params = { userName: DbParameter.string('%' + keyword + '%') };
db.executeByTemplate('/user/sql/searchUsers', params);
```

### Transaction Processing

```typescript
/** One row to insert into the orders table (keys are column names) */
interface OrderRow {
  order_id: string;
  customer_name: string;
}

/** One row to insert into the order_items table (keys are column names) */
interface OrderItemRow {
  order_id: string;
  item_id: string;
  quantity: number;
}

/** Order to insert */
interface OrderInsertData {
  order: OrderRow;
  items: OrderItemRow[];
}

function executeTransaction(data: OrderInsertData): boolean {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();

  try {
    // Transaction
    let txResult = Transaction.begin(function(): void {
      // Multiple DB operations
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
    logger.error('Transaction error: {}', (e as Error).message);
    throw e;
  }
}
```

## Handling Large Data Sets

### Efficient DB Connections

Connect to the database as few times as possible.
Repeatedly connecting to the database within a loop causes high overhead and impacts performance.

Good example:
```typescript
// Retrieve all at once using IN clause (selectUsersByIds.sql: SELECT * FROM users WHERE user_id IN /*userIds*/('dummy'))
let db = new TenantDatabase();
let params = {
  userIds: userIds.map(function(userId: string): DbParameter { return DbParameter.string(userId); })
};
let result = db.executeByTemplate('/user/sql/selectUsersByIds', params);
```

Building SQL by string concatenation causes `validate-jssp-code.js` to report a `JSSP-JS-004` error, so expand the IN clause with the parenthesized bind of 2WaySQL. For the guard for when `userIds` is `null` or an empty array, see "Dynamic Generation of IN Clauses" in `.github/instructions/jssp-2way-sql.instructions.md`.

Bad example:
```typescript
// Repeatedly connecting to the DB in a loop
for (let i = 0; i < userIds.length; i++) {
  let db = new TenantDatabase();  // New connection each time
  let result = db.select('SELECT * FROM users WHERE user_id = ?', [DbParameter.string(userIds[i])]);
}
```

### Implementing Paging

```typescript
function fetchDataWithPaging(pageSize: number, pageNo: number): DatabaseResult {
  let db = new TenantDatabase();
  let offset = (pageNo - 1) * pageSize;

  let sql = 'SELECT * FROM large_table ORDER BY id LIMIT ? OFFSET ?';
  return db.select(sql, [DbParameter.number(pageSize), DbParameter.number(offset)]);
}
```
