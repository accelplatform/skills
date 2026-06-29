# 2WaySQL Conventions

> **Application Scope**: 🟡 **Contextual** — **Applies only to DB operations** (when using `db.executeByTemplate` / `db.execute`). Skip for forms with no DB access, such as workflow screens.

A mechanism for safely building dynamic SQL containing conditional branches by externalizing SQL to files and executing them via `executeByTemplate` / `fetchByTemplate`.

## Application Policy

- Use 2WaySQL for **SELECT queries where WHERE clauses or conditions change dynamically**
- Simple fixed SQL or single-parameter one-shot execution can also use `select` / `execute` + `DbParameter`
- **String concatenation for SQL construction is strictly prohibited** (see jssp-security.md)

## SQL File Placement

SQL files **must be placed under `src/main/jssp/src/`** (files in external directories such as `resources/` cannot be loaded).
Place them under `src/main/jssp/src/{feature-name}/sql/` organized by feature unit.

```
src/main/jssp/src/
└── {feature-name}/
    ├── view/
    │   ├── xxx.js
    │   └── xxx.html
    └── sql/
        ├── selectXxx.sql
        └── searchXxx.sql
```

- File encoding: **UTF-8** (required)
- File extension: `.sql`

### Path passed to `executeByTemplate` / `fetchByTemplate`

- Specify as an **absolute path starting from `src/main/jssp/src/` (with leading slash)**
- **Do not include the `.sql` extension** (including it will cause execution to fail)

Example: To execute `src/main/jssp/src/content/sql/select_content.sql`

```javascript
let SQL_SELECT_CONTENT = '/content/sql/select_content';
db.executeByTemplate(SQL_SELECT_CONTENT, params);
```

## Syntax

| Syntax | Purpose | Notes |
|--------|---------|-------|
| `/*IF condition*/.../*END*/` | Conditional branching | |
| `/*BEGIN*/.../*END*/` | Optional block (WHERE etc. are automatically removed when all content inside is removed) | |
| `/*param*/'dummy'` | Bind placeholder (PreparedStatement style) | **Recommended** |
| `/*$param*/dummy` | Direct embedding | SQL injection risk; whitelist required |

### Prohibited Syntax

- **`/*FOR item : list*/.../*END*/`** can be used in LogicDesigner / im_mirage but is **not supported in the script development model**. Do not use it.

### Meaning of Dummy Values

The `'dummy'` in `/*param*/'dummy'` is a **dummy value for 2WaySQL execution verification** and is replaced by the bind parameter at runtime.
Write a syntactically valid value so the SQL can be executed standalone in a SQL client.

## SQL File Example

```sql
-- src/main/jssp/src/user/sql/searchUsers.sql
SELECT user_id, user_name, email
FROM users
/*BEGIN*/
WHERE
  /*IF userId != null*/
    user_id = /*userId*/'dummy'
  /*END*/
  /*IF userName != null*/
    AND user_name LIKE /*userName*/'%dummy%' ESCAPE '\'
  /*END*/
  /*IF status != null*/
    AND status = /*status*/'active'
  /*END*/
/*END*/
ORDER BY user_id
```

## LIKE Search Escaping (LIKE Pattern Injection Prevention)

Parameters passed to LIKE operators must always **escape LIKE special characters (`\`, `%`, `_`) contained in user input**.
Appending wildcards (`%`) without escaping causes the following issues:

- Input `%` → `%%%` hits all rows (unintended full retrieval)
- Input `_` → `%_%` matches any single character (unintended partial match)

### Required Rules

1. **Append wildcards (`%`) on the server side** — do not send `%keyword%` from the client (browser)
2. **Escape LIKE special characters before appending wildcards**
3. **Add `ESCAPE '\'` clause to the SQL**

### SQL Side

```sql
-- Always add ESCAPE clause
AND user_name LIKE /*userName*/'%dummy%' ESCAPE '\'
```

### Server Side (Function Container)

```javascript
/**
 * Generates a parameter for LIKE search.
 * Escapes LIKE special characters and appends wildcards on both sides.
 *
 * @param {String} value - Search keyword (raw input value)
 * @return {String} Escaped LIKE parameter
 */
function toLikeParam(value) {
  if (!value) {
    return '%';
  }
  let escaped = value
    .replace(/\\/g, '\\\\')   // \ → \\
    .replace(/%/g, '\\%')     // % → \%
    .replace(/_/g, '\\_');    // _ → \_
  return '%' + escaped + '%';
}

// Usage example
let params = {
  userName: criteria.userName ? DbParameter.string(toLikeParam(criteria.userName)) : null
};
```

### Client Side (Presentation Page)

```javascript
// OK: Send raw keyword as-is
body: JSON.stringify({ keyword: keyword })

// NG: Append wildcards on the client side before sending
body: JSON.stringify({ keyword: '%' + keyword + '%' })
```

## Invocation

### Choosing Between execute and executeByTemplate

| Method | 1st Argument | 2nd Argument | Purpose |
|--------|-------------|-------------|---------|
| `db.execute(sql, params)` | **SQL string** | `DbParameter[]` (**array**) | Execute inline SQL |
| `db.executeByTemplate(path, params)` | **Template path** | `{ key: DbParameter }` (**object**) | Execute 2WaySQL template |

**When SQL is externalized to a file, always use `executeByTemplate` / `fetchByTemplate`.**
Passing a template path to `execute` causes the path to be interpreted as a SQL statement and results in an error.
Also note that the parameter formats differ (`execute` takes an array; `executeByTemplate` takes an object) — do not mix them up.

```javascript
// OK: Template path → executeByTemplate + object-format parameters
let result = db.executeByTemplate('/user/sql/searchUsers', { userId: DbParameter.string(userId) });

// OK: Inline SQL → execute + array-format parameters
let result = db.execute('SELECT * FROM users WHERE user_id = ?', [DbParameter.string(userId)]);

// NG: Passing template path to execute → SQL parse error
let result = db.execute('/user/sql/searchUsers', { userId: DbParameter.string(userId) });
```

### executeByTemplate (Standard Execution)

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

### fetchByTemplate (With Paging)

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

- `start` is 1-based; `length` is the number of records to retrieve
- Return value is a `DatabaseResult` (`data`, `countRow`, `isSuccess()`, etc.)

## Passing Parameters

- Pass parameters in **object format** (key names must match parameter names in the SQL)
- Values must always be **wrapped with `DbParameter.string()` / `DbParameter.integer()`, etc.**
- For unspecified parameters, pass `null` and branch with `/*IF param != null*/`

### DbParameter Type Selection Rules

Select the `DbParameter` type method to **match the DDL column definition**.
Do not judge by guesswork or by the variable type in the program.

| DDL Column Type | DbParameter Method | Common Mistake |
|---|---|---|
| `VARCHAR` / `CHAR` / `TEXT` | `DbParameter.string()` | Using `DbParameter.number()` for fiscal year (`VARCHAR(4)`) → type mismatch error |
| `INTEGER` / `BIGINT` | `DbParameter.number()` | - |
| `DECIMAL` / `NUMERIC` | `DbParameter.number()` | - |
| `DATE` | `DbParameter.date()` | - |
| `TIMESTAMP` | `DbParameter.timestamp()` | - |
| `BOOLEAN` | `DbParameter.boolean()` | - |

**Procedure:**
1. Check the DDL (or data model definition) for the target table
2. Identify the column type
3. Select the `DbParameter` method according to the mapping table above

**Columns requiring special attention:**
- **When fiscal year / year-month / codes are defined as `VARCHAR`**: Use `DbParameter.string(String(value))` even if the value is numeric only
- **When amounts / quantities are defined as `DECIMAL`**: Use `DbParameter.number()` (not `DbParameter.string()`)
- **`DATE` / `TIMESTAMP` columns that may be NULL**: See "Passing NULL Values for INSERT / UPDATE" below

If the DDL has not yet been created, either create the DDL or finalize the type in the data model definition before selecting `DbParameter`.

### Passing NULL Values for INSERT / UPDATE

`executeByTemplate` requires that all values in the parameter object are `DbParameter` instances.
Passing a raw `null` directly results in a `The parameter must be instance of DbParameter` runtime error.

| DDL Column Type | With Value | Without Value (NULL) | When raw `null` is passed |
|---|---|---|---|
| `VARCHAR` / `CHAR` / `TEXT` | `DbParameter.string(value)` | `DbParameter.string(null)` | Runtime error |
| `INTEGER` / `BIGINT` / `DECIMAL` | `DbParameter.number(value)` | `DbParameter.number(null)` | Runtime error |
| `DATE` | `DbParameter.date(new Date(value))` | `new DbParameter(null, DbParameter.TYPE_DATE)` | Runtime error |
| `TIMESTAMP` | `DbParameter.timestamp(new Date(value))` | `new DbParameter(null, DbParameter.TYPE_TIMESTAMP)` | Runtime error |

**Why does `DATE` / `TIMESTAMP` require the constructor:**
Arguments to `string` / `number` are JavaScript primitives, so passing `null` to the Java side does not cause an error.
However, `DbParameter.date()` / `DbParameter.timestamp()` process the argument as a Java `Date` object, so passing `null` causes a NullPointerException.
**Factory methods that require an object-type argument cannot accept `null`.**

```javascript
// VARCHAR / numeric columns — null can be passed directly
remarks : DbParameter.string(remarks),   // remarks is null → NULL
quantity: DbParameter.number(quantity),  // quantity is null → NULL

// DATE / TIMESTAMP columns — use constructor when null
period_end_date: periodEndDate
  ? DbParameter.date(new Date(periodEndDate))
  : new DbParameter(null, DbParameter.TYPE_DATE)
```

> **Note:** `DbParameter.NULL` is a type constant (a value of type `number`), not a `DbParameter` instance. It is for stored procedures only. Do not use it for normal INSERT/UPDATE.

## Direct Embedding (`/*$param*/`) Usage Rules

Use only for **locations that cannot be specified with bind variables**, such as column names and sort direction in ORDER BY clauses.

```sql
-- src/main/jssp/src/user/sql/dynamicSort.sql
SELECT user_id, user_name, email
FROM users
ORDER BY /*$sortColumn*/user_id /*$sortOrder*/ASC
```

```javascript
function searchUsersWithSort(sortColumn, sortOrder) {
  let db = new TenantDatabase();

  // Whitelist validation (required)
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

### Required Rules for `/*$param*/`

- **Never pass user input directly**
- Always perform **whitelist validation** and throw an exception for any value not in the allowed list
- Usage without validation will be flagged as NG in code review

## Result Set Processing

```javascript
let result = db.executeByTemplate('/user/sql/searchUsers', params);

if (!result.isSuccess()) {
  Logger.getLogger().error('SQL execution failed: ' + result.errorMessage);
  throw new Error('Search failed');
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

- Return value is a `DatabaseResult` object
- `result.data` is an array; each element is an object with **column names (lowercase) as keys**
- Check execution success/failure with `isSuccess()`; error message is in `errorMessage`

## Transaction Processing

When executing **write SQL** such as INSERT / UPDATE / DELETE, always set a transaction boundary with `Transaction.begin()`.

### Required Rules

- **Write SQL (`execute` / `executeByTemplate` for INSERT/UPDATE/DELETE, `insert` / `update` / `delete`) must always be executed inside `Transaction.begin()`**
- Even a single SQL update must be executed within a transaction to ensure business consistency
- Updates to multiple tables, loop INSERT for multiple rows, etc. must be grouped **in the same transaction**
- If an exception occurs inside the `Transaction.begin()` callback, it **automatically rolls back**
- Do not swallow exceptions — log them and re-throw
- Transactions are not required for read-only processing (SELECT only)

### Implementation Example

```javascript
function registerOrder(data) {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();

  try {
    Transaction.begin(function() {
      // Register header
      db.executeByTemplate('/order/sql/insertOrder', {
        orderId:   DbParameter.string(data.orderId),
        customer:  DbParameter.string(data.customer)
      });

      // Register line items (loop is also within the same transaction)
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
    logger.error('Transaction error: {}', e.message);
    throw e;
  }
}
```

### Anti-Patterns

```javascript
// NG: Executing write SQL without a transaction
db.executeByTemplate('/order/sql/insertOrder', params);

// NG: Structure that commits each INSERT in the loop individually
for (let i = 0; i < items.length; i++) {
  Transaction.begin(function() {
    db.executeByTemplate('/order/sql/insertOrderItem', ...);
  });
}
```

## Checklist

- [ ] Are externalized SQL templates using `executeByTemplate` / `fetchByTemplate` (not passing a template path to `execute`)?
- [ ] Is SQL externalized under `src/main/jssp/src/{feature-name}/sql/`?
- [ ] Is the path passed to `executeByTemplate` / `fetchByTemplate` an absolute path starting from `src/main/jssp/src/` (with leading slash)?
- [ ] Is the file encoding UTF-8?
- [ ] Is the `.sql` extension removed from the path passed to `executeByTemplate` / `fetchByTemplate`?
- [ ] Are bind parameters using the `/*param*/'dummy'` format?
- [ ] Are locations using `/*$param*/` validated against a whitelist?
- [ ] Is the `/*FOR*/` syntax not being used?
- [ ] Are parameters wrapped with `DbParameter.xxx()`?
- [ ] Do `DbParameter` type methods match the DDL column types (e.g., `string()` for VARCHAR, `number()` for INTEGER/DECIMAL)?
- [ ] Is `DbParameter.string()` not being used for `DATE` / `TIMESTAMP` columns (causes a type mismatch error in PostgreSQL)?
- [ ] For NULL insertion into `DATE` / `TIMESTAMP` columns, is `new DbParameter(null, DbParameter.TYPE_DATE)` / `new DbParameter(null, DbParameter.TYPE_TIMESTAMP)` being used (`DbParameter.date(null)` fails; VARCHAR/numeric columns work with `DbParameter.string(null)` / `DbParameter.number(null)`; only factory methods that require object-type arguments cannot accept `null`)?
- [ ] Is execution success/failure checked with `result.isSuccess()`?
- [ ] Is SQL construction by string concatenation not being used?
- [ ] Are LIKE special characters (`\`, `%`, `_`) escaped in LIKE searches?
- [ ] Is the `ESCAPE '\'` clause added to the SQL for LIKE searches?
- [ ] Are wildcards (`%`) for LIKE searches appended on the server side (sending from client is prohibited)?
- [ ] Are write SQL statements (INSERT/UPDATE/DELETE) executed inside `Transaction.begin()`?
- [ ] Are updates to multiple tables and loop updates grouped in the same transaction?
- [ ] Are exceptions that occur inside transactions logged and re-thrown?

## Related

- `{{AGENT_RULES}}/jssp-security{{AGENT_RULE_FILE}}.md` - Overall SQL injection prevention policy
- `skills/jssp-page-generator/reference/api-database.md` - Database API reference
- `d.ts/platform/database/im-ssjs-tenant-database.d.ts` - TenantDatabase type definitions
- `d.ts/platform/database/im-ssjs-shared-database.d.ts` - SharedDatabase type definitions
