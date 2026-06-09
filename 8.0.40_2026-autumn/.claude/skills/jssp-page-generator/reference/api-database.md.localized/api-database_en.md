---
paths:
  - "src/main/jssp/**/*.js"
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

```javascript
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

```javascript
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

## Recommended: insert/update/remove Methods

Instead of writing SQL strings directly, it is recommended to use the `insert`/`update`/`remove` methods.

```javascript
// Recommended: insert method
let db = new TenantDatabase();
let insertData = {
  user_id: 'U001',
  user_name: 'Yamada Taro',
  email: 'yamada@example.com',
  created_at: new Date()
};
db.insert('users', insertData);

// Recommended: update method (using DbParameter)
let updateData = {
  user_name: 'Yamada Jiro',
  updated_at: new Date()
};
db.update('users', updateData, 'user_id = ?', [DbParameter.string('U001')]);

// Recommended: remove method (using DbParameter)
db.remove('users', 'user_id = ?', [DbParameter.string('U001')]);
```

## 2WaySQL (executeByTemplate)

### Overview

A mechanism for externalizing SQL files and safely building dynamic SQL with conditional branching.

### SQL File Placement

SQL files **must be placed under `src/main/jssp/src/`** (they cannot be loaded from outside this directory).
Place them under `src/main/jssp/src/{feature-name}/sql/` by feature unit.

```
src/main/jssp/src/
└── user/
    ├── view/
    │   ├── user_list.js
    │   └── user_list.html
    └── sql/
        ├── selectUser.sql
        └── searchUsers.sql
```

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

```javascript
function searchUsers(criteria) {
  let db = new TenantDatabase();

  let params = {
    userId: criteria.userId ? DbParameter.string(criteria.userId) : null,
    userName: criteria.userName ? DbParameter.string('%' + criteria.userName + '%') : null,
    status: criteria.status ? DbParameter.string(criteria.status) : null
  };

  // Execute sql/sample/user/searchUsers.sql
  return db.executeByTemplate('/user/sql/searchUsers', params);
}

// Paged retrieval (20 records starting from start=1)
function searchUsersWithPaging(criteria, start, length) {
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
```javascript
function searchUsersWithSort(sortColumn, sortOrder) {
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
- Placement: Under `src/main/jssp/src/` (within the JSSP source directory)

## Processing Result Sets

### Processing select/executeByTemplate Results

The return value of `select`/`executeByTemplate` is a `DatabaseResult` object.
Fetched data is stored in the `result.data` array, with each element being an object keyed by column name (lowercase).

```javascript
function getUserList() {
  let db = new TenantDatabase();
  let sql = 'SELECT user_id, user_name, email FROM users';
  let result = db.select(sql, []);

  let users = [];
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

```javascript
// Absolutely prohibited!!!
let sql = "SELECT * FROM users WHERE user_id = '" + userId + "'";

// Correct implementation (using DbParameter)
let sql = 'SELECT * FROM users WHERE user_id = ?';
let result = db.select(sql, [DbParameter.string(userId)]);
```

### LIKE Search Wildcards

```javascript
// Good: Add wildcards on the calling side
let keyword = 'Yamada';
let sql = 'SELECT * FROM users WHERE user_name LIKE ?';
let result = db.select(sql, [DbParameter.string('%' + keyword + '%')]);

// In 2WaySQL
let params = { userName: DbParameter.string('%' + keyword + '%') };
db.executeByTemplate('/user/sql/searchUsers', params);
```

### Transaction Processing

```javascript
function executeTransaction(data) {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();

  try {
    // Transaction
    Transaction.begin(function() {
      // Multiple DB operations
      db.insert('orders', data.order);
      for (let i = 0; i < data.items.length; i++) {
        db.insert('order_items', data.items[i]);
      }
    });

    return true;

  } catch (e) {
    logger.error('Transaction error: {}', e.message);
    throw e;
  }
}
```

## Handling Large Data Sets

### Efficient DB Connections

Connect to the database as few times as possible.
Repeatedly connecting to the database within a loop causes high overhead and impacts performance.

Good example:
```javascript
// Retrieve all at once using IN clause
let db = new TenantDatabase();
let placeholders = userIds.map(function() { return '?'; }).join(',');
let sql = 'SELECT * FROM users WHERE user_id IN (' + placeholders + ')';
let result = db.select(sql, userIds);
```

Bad example:
```javascript
// Repeatedly connecting to the DB in a loop
for (let i = 0; i < userIds.length; i++) {
  let db = new TenantDatabase();  // New connection each time
  let result = db.select('SELECT * FROM users WHERE user_id = ?', [userIds[i]]);
}
```

### Implementing Paging

```javascript
function fetchDataWithPaging(pageSize, pageNo) {
  let db = new TenantDatabase();
  let offset = (pageNo - 1) * pageSize;

  let sql = 'SELECT * FROM large_table ORDER BY id LIMIT ? OFFSET ?';
  return db.select(sql, [pageSize, offset]);
}
```
