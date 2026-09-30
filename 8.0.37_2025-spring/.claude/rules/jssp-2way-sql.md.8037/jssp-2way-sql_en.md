---
paths:
  - "src/main/jssp/**/*.sql"
---

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

## [Important] Do Not Write `--` Comments in SQL Files

The 2WaySQL parser does not distinguish the content of `--` line comments — it **scans the entire file to detect template syntax**.
As a result, if syntax notation such as `/*IF*/`, an actual bind name (e.g. `/*orderId*/`), or a `?` is written literally inside a `--` comment meant only as an explanation, it is mistakenly recognized as a genuine template directive despite being a comment, causing a runtime error that appears unrelated to the comment's content (such as `"IF" is not defined.`, `"$1" is not defined.`, `Column index out of range`, etc.).

For the reasons above, **never write `--` comments in SQL files at all.**
Describe the file's purpose, verification viewpoints, and parameter explanations in the JSDoc (function comment) on the calling function container side instead.
SQL files should contain only the SQL body that gets executed.

```javascript
/**
 * Searches orders by optional conditions on status and category_cd (retrieves all records if unspecified).
 * SQL: /content/sql/search_orders
 *
 * @param {Object} criteria - Search criteria
 * @return {Object} Search result
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

The Java side (`im_mirage`) uses a similar implementation, so the same problem can occur there too (see the `java-im-mirage-usage` skill).
In the sample code that follows, some places carry explanatory file-path comments or NG/OK annotations for the purpose of this document, but **the actual SQL files must not include such comments**.

## Syntax

| Syntax | Purpose | Notes |
|--------|---------|-------|
| `/*IF condition*/.../*END*/` | Conditional branching | |
| `/*BEGIN*/.../*END*/` | Optional block (WHERE etc. are automatically removed when all content inside is removed) | The only prefixes that can be auto-removed are `AND`/`OR`. Do not use it to expect automatic removal of a `,` prefix in the SET clause of an UPDATE statement (see "Building a Dynamic SET Clause") |
| `/*param*/'dummy'` | Bind placeholder (PreparedStatement style) | **Recommended** |
| `/*param*/('dummy')` | Parenthesized bind for IN clauses (dynamically expands an array into a placeholder list) | See "Dynamic Generation of IN Clauses" below for details |
| `/*$param*/dummy` | Direct embedding | SQL injection risk; whitelist required |

### Prohibited Syntax

- **`/*FOR item in list*/.../*END*/`** can be used in LogicDesigner / im_mirage but is **not supported in the script development model**. Do not use it.

### Note: Do Not Nest `/*IF*/` Inside a `/*BEGIN*/` Block

The parser does support nesting `/*IF*/` itself, but nesting it inside a `/*BEGIN*/` block causes the leading `AND`/`OR` of the inner `/*IF*/` to become a target for prefix removal, and it gets stripped when the outer `/*IF*/` was the first condition to succeed in that block (because the block's overall "already output" state is not finalized until the inner condition finishes being processed). The result is malformed SQL such as `WHERE a = ? b = ?`. If a preceding sibling condition has already succeeded, it renders correctly — so whether this passes or fails depends on the combination of parameters (confirmed on a real environment: it produces a syntax error when the outer IF is the first condition to succeed in the block, and works correctly when a preceding sibling condition succeeds first).

Do not nest multiple conditions; place them as siblings instead, and express the dependency through the condition expression.

```sql
/*IF status != null*/
status = /*status*/'dummy'
/*END*/
/*IF status != null && categoryCd != null*/
AND category_cd = /*categoryCd*/'dummy'
/*END*/
```

(Nesting where the inner block does not start with `AND`/`OR`/`,` — such as switching an operator or a value fragment — is not affected by this issue and may be used.)

### Meaning of Dummy Values

The `'dummy'` in `/*param*/'dummy'` is a **dummy value for 2WaySQL execution verification** and is replaced by the bind parameter at runtime.
Write a syntactically valid value so the SQL can be executed standalone in a SQL client.

For the parenthesized bind used in IN clauses (`/*param*/('dummy')`), a single dummy value such as `('dummy')` is fine (listing multiple values, e.g. `('dummy1', 'dummy2')`, has also been confirmed to work correctly on a real environment).

## Dynamic Generation of IN Clauses (`/*param*/('dummy')`)

When dynamically expanding an array into an `IN` clause, use the parenthesized bind, placing `('dummy')` immediately after `/*param*/`.

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
    // Convert an empty array to null (guard against both null and an empty array with /*IF*/ on the SQL side).
    // Array elements must also be wrapped with DbParameter, just like any other bind variable.
    // Passing a plain string array results in "The parameter must be instance of DbParameter."
    userIds: userIds.length > 0
      ? userIds.map(function(userId) { return DbParameter.string(userId); })
      : null
  };
  return db.executeByTemplate('/user/sql/searchByIds', params);
}
```

**Guard against both `null` and an empty array with `/*IF*/`** (without a guard, a bare `IN` is left behind and the SQL breaks).

### [Important] The guard can turn an empty array into "all rows" instead of "zero rows"

As shown above, when the IN-clause guard is the only condition inside `/*BEGIN*/`, a `null` or empty `userIds` causes the contents of `/*IF*/` to vanish, leaving the `/*BEGIN*/` block empty, so **the entire `WHERE` clause is removed** (this follows `/*BEGIN*/`'s basic behavior: `WHERE` etc. are automatically removed once all the content inside is gone).
As a result, while no SQL error occurs, the query returns **all rows with no filtering** rather than the intended "no matches (zero rows)" — confirmed on a real environment.

If the intent is "when the caller passes an empty array, the result should also be empty," **do not rely on the SQL-side guard alone** — add an application-side guard where the caller checks for `null`/an empty array and returns an empty array without executing the SQL. This is a mandatory countermeasure especially when this pattern is used for authorization/permission filtering (e.g. passing a list of accessible IDs into an `IN` clause), to prevent an empty array from accidentally exposing all records.

## SQL File Example

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

## LIKE Search Escaping (LIKE Pattern Injection Prevention)

Parameters passed to LIKE operators must always **escape LIKE special characters contained in user input (the escape character itself, `%`, and `_`)**.
Appending wildcards (`%`) without escaping causes the following issues:

- Input `%` → `%%%` hits all rows (unintended full retrieval)
- Input `_` → `%_%` matches any single character (unintended partial match)

### [Important] Do Not Use a Backslash (`\`) as the Escape Character

It has been confirmed on a real environment that the 2WaySQL template compiler used by `TenantDatabase#executeByTemplate` **strips backslash characters from within SQL files, regardless of whether they are in comments or in the SQL body**.
As a result, even if you write `ESCAPE '\'`, it becomes `ESCAPE ''` (an empty string) at runtime, **disabling the escaping itself**. This results in the confusing bug of getting zero hits when searching for a keyword that requires escaping (a keyword containing `%` or `_`).

General web searches and documentation for other database products commonly recommend `ESCAPE '\'` as the standard practice, but **this standard practice does not work with `TenantDatabase`/`SharedDatabase` in the script development model**. intra-mart traditionally has a **convention of using `@` (at sign) as the escape character**, so this convention also uses `@`.
(The Java side (`im_mirage`) does not have this problem — it has been confirmed on a real environment to work correctly with `\`. This is a constraint specific to `TenantDatabase` on the JSSP side.)

### Required Rules

1. **Append wildcards (`%`) on the server side** — do not send `%keyword%` from the client (browser)
2. **Escape LIKE special characters before appending wildcards**
3. **Add an `ESCAPE '@'` clause to the SQL (do not use `ESCAPE '\'`)**

### SQL Side

```sql
AND user_name LIKE /*userName*/'%dummy%' ESCAPE '@'
```

### Server Side (Function Container)

```javascript
/**
 * Generates a parameter for LIKE search.
 * Escapes LIKE special characters and appends wildcards on both sides.
 * Uses '@' as the escape character ('\' cannot be used because TenantDatabase strips it).
 *
 * @param {String} value - Search keyword (raw input value)
 * @return {String} Escaped LIKE parameter
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

**Note that this table applies only when the column is always output to the SQL body without branching via `/*IF*/`** (a column that is always specified in an INSERT statement, or always SET in an UPDATE statement, etc.).

> **Note:** `DbParameter.NULL` is a type constant (a value of type `number`), not a `DbParameter` instance. It is for stored procedures only. Do not use it for normal INSERT/UPDATE.

### [Important] Pass a Raw `null` for DATE / TIMESTAMP Parameters that Branch via `/*IF*/`

For DATE / TIMESTAMP parameters whose presence is branched on with `/*IF paramName != null*/`, as in a search condition (WHERE clause), passing `new DbParameter(null, DbParameter.TYPE_DATE)` with the same mindset as the table above has been confirmed on a real environment to cause the following problem:
**the `/*IF*/` condition expression evaluates the `DbParameter` object itself, so even when the value is null it is misjudged as "specified," adding a condition such as `AND some_date >= NULL` to the SQL that is always false, and as a result yielding zero hits.**

```javascript
// NG: /*IF orderDateFrom != null*/ is always evaluated as true,
//     appending "AND order_date >= NULL" so nothing ever hits
let params = {
  orderDateFrom: orderDateFrom
    ? DbParameter.date(parseLocalDate(orderDateFrom))
    : new DbParameter(null, DbParameter.TYPE_DATE)
};

// OK: Pass a raw null when unspecified, so /*IF*/ branches correctly
let params = {
  orderDateFrom: orderDateFrom
    ? DbParameter.date(parseLocalDate(orderDateFrom))
    : null
};
```

In summary, use `new DbParameter(null, TYPE_DATE)` only when the column is **always** output to the SQL body, and use a **raw `null`** when branching with `/*IF*/`.

## Direct Embedding (`/*$param*/`) Usage Rules

Use only for **locations that cannot be specified with bind variables**, such as column names and sort direction in ORDER BY clauses.

```sql
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

## Building a Dynamic SET Clause (UPDATE Statement)

Wrapping the SET clause of an UPDATE statement with `/*BEGIN*/` so that it removes the leading comma of each item behaves inconsistently, because **the outcome depends on where the comma is placed in the file**.

- When the comma is placed at the **start of the same line** as the `/*IF*/` marker, the parser correctly recognizes it as a prefix and removes it
- When the comma is placed on a **separate, indented line after a line break**, the parser fails to recognize it as a prefix, leaving a bare leading comma behind and producing invalid SQL that causes a syntax error (confirmed on a real environment: `ERROR: syntax error at or near ","`)

In addition, `/*BEGIN*/` removes the entire SET clause (including the `SET` keyword itself) when every condition inside it evaluates to false, which produces invalid SQL (an `UPDATE` with no `SET`) when there are no columns to update.

Because **comma-prefix removal is fragile and format-dependent, and also conflicts with `/*BEGIN*/`'s "the whole block vanishes when every condition is false" behavior**, do not rely on `/*BEGIN*/` to remove the comma in a SET clause at all.

Example that causes a syntax error (comma placed on a separate, indented line):

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

Always place a self-assignment that does not change the target (e.g. the primary key column `= itself`) at the head of the SET clause, and always concatenate the remaining items with a leading comma, without using `/*BEGIN*/`.
This approach is independent of comma placement, and there is no risk of the SET clause vanishing entirely.

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
- [ ] **Are `--` comments absent from SQL files** (is the purpose/explanation written in the caller's JSDoc instead)?
- [ ] Are bind parameters using the `/*param*/'dummy'` format?
- [ ] Are locations using `/*$param*/` validated against a whitelist?
- [ ] Is the `/*FOR*/` syntax not being used? Is `/*IF*/` not nested inside a `/*BEGIN*/` block (placed as siblings instead)?
- [ ] Are parameters wrapped with `DbParameter.xxx()`?
- [ ] Do `DbParameter` type methods match the DDL column types (e.g., `string()` for VARCHAR, `number()` for INTEGER/DECIMAL)?
- [ ] Is `DbParameter.string()` not being used for `DATE` / `TIMESTAMP` columns (causes a type mismatch error in PostgreSQL)?
- [ ] For NULL insertion into `DATE` / `TIMESTAMP` columns, is `new DbParameter(null, DbParameter.TYPE_DATE)` / `new DbParameter(null, DbParameter.TYPE_TIMESTAMP)` being used only when the column is always output (and a raw `null` used when branching with `/*IF*/`)?
- [ ] For the parenthesized IN-clause bind (`/*param*/('dummy')`), is each array element wrapped with `DbParameter`?
- [ ] For the SET clause of UPDATE statements, is `/*BEGIN*/` not being expected to remove a leading comma (is the self-assignment-first approach used instead)?
- [ ] Is execution success/failure checked with `result.isSuccess()`?
- [ ] Is SQL construction by string concatenation not being used?
- [ ] Are LIKE special characters (the escape character itself, `%`, `_`) escaped in LIKE searches?
- [ ] Is the `ESCAPE '@'` clause added to the SQL for LIKE searches (and `ESCAPE '\'` not used)?
- [ ] Are wildcards (`%`) for LIKE searches appended on the server side (sending from client is prohibited)?
- [ ] Are write SQL statements (INSERT/UPDATE/DELETE) executed inside `Transaction.begin()`?
- [ ] Are updates to multiple tables and loop updates grouped in the same transaction?
- [ ] Are exceptions that occur inside transactions logged and re-thrown?

## Related

- `.claude/rules/jssp-security.md` - Overall SQL injection prevention policy
- `.claude/skills/jssp-page-generator/reference/api-database.md` - Database API reference
- `d.ts/platform/database/im-ssjs-tenant-database.d.ts` - TenantDatabase type definitions
- `d.ts/platform/database/im-ssjs-shared-database.d.ts` - SharedDatabase type definitions
