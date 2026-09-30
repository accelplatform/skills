# Table Definition (DDL) Conventions

> **Scope**: 🟢 **Always** — applies whenever creating or changing DDL for a new table. Tables are created through the DDL/Importer mechanism under `storage/system`, so the table definition itself follows this convention regardless of which development model (JSSP script development model or Java JavaEE development model) consumes the table.

## Overview

Recommended type mappings for each DB product (Oracle / PostgreSQL / SQLServer) supported by intra-mart Accel Platform, and table/column naming conventions.
Follow this reference when generating DDL.

## Table and Column Naming Conventions

- Name tables and columns using **lowercase snake_case** (underscore-separated) only
- Write **SQL reserved words in uppercase** (`CREATE TABLE`, `NOT NULL`, `PRIMARY KEY`, etc.)
- Table names should follow the pattern `{domain prefix}_{type}_{entity name}`
  - Type: `m` (master), `t` (transaction)
  - Example: `exm_m_user` (master), `exm_t_order` (transaction)
  - This convention does not define a mechanical way to derive `{domain prefix}`. **Decide it from user instructions or the specification.**
- Columns representing foreign references should follow the pattern `{referenced entity name}_{cd or id}`
  - Example: `user_cd`, `order_id`
- Keep table and column names to **63 characters or fewer**
  - Of the supported DBs (Oracle 19c+, PostgreSQL 14+, SQL Server 2016+), PostgreSQL's `NAMEDATALEN` constraint (64, effectively 63 usable bytes) is the strictest identifier-length limit and therefore the practical upper bound

## Primary Key Design

- Prefer a **single-column primary key** wherever possible (use composite primary keys only where needed, such as junction tables)
- When the application issues IDs itself, use `Identifier.get()` (SSJS: `.agents/skills/jssp-page-generator/reference/api-identifier.md`; Java: `jp.co.intra_mart.foundation.service.client.information.Identifier`) and define the corresponding column as **`VARCHAR(15)`** (`VARCHAR2(15)` for Oracle, `NVARCHAR(15)` for SQLServer)
  - `Identifier` returns a 15-byte string

## DDL / Sample DML File Naming

Use the following separator convention consistently for per-dialect files.

- DDL: `{feature name}-ddl_<dialect>.sql` — **a hyphen (`-`) before `ddl`, an underscore (`_`) before the dialect suffix** (`_postgre`/`_oracle`/`_sqlserver`)
  - Example: `equip-ddl_postgre.sql`, `equip-ddl_oracle.sql`, `equip-ddl_sqlserver.sql`
  - `{feature name}_ddl_<dialect>.sql` (underscore before `ddl` too) is incorrect
  - The dialect suffix is one of `_postgre` (not `_postgres`), `_oracle`, `_sqlserver` — these must match the suffixes the intra-mart Importer auto-appends based on the target DB, so do not alter the spelling
- Sample DML: `{feature name}_sample-dml.sql` (common to all DBs, **recommended**). Only use `{feature name}_sample-dml_<dialect>.sql` when dialect-dependent syntax is required (note the separators differ from DDL: an underscore before `sample`, a hyphen before `dml`)

## Type Mapping Table

| Purpose | Oracle | PostgreSQL | SQLServer | Notes |
|---------|--------|------------|-----------|-------|
| String (not containing multi-byte characters) | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | PostgreSQL size specification is in characters, so strictly speaking sizes differ from other DBs |
| String (containing multi-byte characters) | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | Oracle uses VARCHAR2 (not NVARCHAR2). Common to all DBs: ensure column size is 4x the expected number of characters |
| Numeric | NUMBER(x, y) | DECIMAL(x, y) | DECIMAL(x, y) | Oracle has DECIMAL as an alias for NUMBER, but use NUMBER explicitly |
| Date | DATE | DATE | DATETIME2 | SQLServer uses DATETIME2 |
| Time | DATE | TIME | DATETIME2 | SQLServer uses DATETIME2. PostgreSQL does not specify with timezone |
| Datetime | TIMESTAMP | TIMESTAMP | DATETIME2 | PostgreSQL does not specify with timezone |
| Boolean (flag) | CHAR(1) | CHAR(1) | CHAR(1) | `'0'`=false, `'1'`=true. Unify with CHAR(1) instead of DB-specific BOOLEAN/BIT |
| Long string | CLOB | TEXT | NVARCHAR(max) | Use in WHERE conditions is prohibited (unsupported, performance issues) |

## Correspondence with DbParameter (JSSP)

For JSSP (script development model) when using `TenantDatabase`/`SharedDatabase`. For the Java (`im_mirage`) type mapping, see `.agents/requirements/java-entity/AGENTS.md`.

| DbParameter Method | DDL Usage | Oracle | PostgreSQL | SQLServer | Notes |
|-------------------|-----------|--------|------------|-----------|-------|
| `DbParameter.string()` | String column | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | - |
| `DbParameter.number()` | Numeric column | NUMBER(x, y) | DECIMAL(x, y) | DECIMAL(x, y) | - |
| `DbParameter.date()` | Date column | DATE | DATE | DATETIME2 | - |
| `DbParameter.timestamp()` | Datetime column | TIMESTAMP | TIMESTAMP | DATETIME2 | - |
| `DbParameter.string()` | Boolean column (flag) | CHAR(1) | CHAR(1) | CHAR(1) | `'0'`=false, `'1'`=true |

## Audit Trail Columns (Required)

Include the following 4 columns in every table.

| Column | Meaning | Type (PostgreSQL) | Type (Oracle) | Type (SQLServer) |
|--------|---------|--------------------|-----------------|---------------------|
| `create_user_cd` | Creator code | VARCHAR(100) NOT NULL | VARCHAR2(100) NOT NULL | NVARCHAR(100) NOT NULL |
| `create_date` | Creation timestamp | TIMESTAMP NOT NULL | TIMESTAMP NOT NULL | DATETIME2 NOT NULL |
| `record_user_cd` | Last updater code | VARCHAR(100) NOT NULL | VARCHAR2(100) NOT NULL | NVARCHAR(100) NOT NULL |
| `record_date` | Last update timestamp | TIMESTAMP NOT NULL | TIMESTAMP NOT NULL | DATETIME2 NOT NULL |

- `create_user_cd`/`create_date` record the audit trail at creation time, `record_user_cd`/`record_date` at update time; set these from the application layer (the function container's INSERT/UPDATE logic, or a Java DAO/`AbstractDAO`) — auto-setting via a DDL trigger is prohibited (see "Syntax Allowed in DDL")
- User-code columns (`create_user_cd`/`record_user_cd`, and `user_cd` columns in general) are fixed at **100 bytes** regardless of expected character count (they hold single-byte alphanumeric codes, so the 4x rule under "Column Size Guidelines" below does not apply)
- For Java (`im_mirage`) Entity classes, align these with the audit trail field convention in `.agents/requirements/java-entity/AGENTS.md` (`createUserCd`/`createDate`/`recordUserCd`/`recordDate`). They are set automatically when using `AbstractDAO`'s base insert/update methods

## Column Size Guidelines

| Purpose | Expected Character Count | Size Specification (4x) | Example |
|---------|--------------------------|------------------------|---------|
| Codes (IDs, classification values) | Up to 64 characters | 256 | VARCHAR2(256) / VARCHAR(256) / NVARCHAR(256) |
| Names (user names, department names, etc.) | Up to 50 characters | 200 | VARCHAR2(200) / VARCHAR(200) / NVARCHAR(200) |
| Short descriptions (notes, etc.) | Up to 500 characters | 2000 | VARCHAR2(2000) / VARCHAR(2000) / NVARCHAR(2000) |
| Date strings (yyyy/MM/dd) | 10 characters | 40 | VARCHAR2(40) / VARCHAR(40) / NVARCHAR(40) |

The table above applies to columns that may contain multi-byte characters such as Japanese. Single-byte alphanumeric codes like `user_cd` do not follow the 4x rule; fix them at **100 bytes**, the same as the audit trail columns above.

## Numeric Column Precision Guidelines

Prefer precision explicitly stated in the specification when available. When the specification does not state one, default the total precision to **15 digits or fewer**, so it stays within the significant digits a Java `double` can represent without loss (a 52-bit mantissa is roughly 15–16 decimal digits). JSSP (Rhino/JavaScript) numbers are also IEEE 754 double-precision (the same representation as `double`), so the same reasoning applies there.

| Purpose | Type | Notes |
|---------|------|-------|
| Integer (display order, counts, etc.) | DECIMAL(10, 0) / NUMBER(10) | 10 digits is enough for typical integer values |
| Monetary amount | DECIMAL(15, 2) | 13 integer digits + 2 fractional digits = 15 digits |
| General decimal | DECIMAL(15, y) | Adjust `y` to the required precision; keep the total at 15 digits or fewer |

- Monetary calculations themselves use `java.math.BigDecimal` on the Java side per `.agents/requirements/java-entity/AGENTS.md`, but the DDL column size itself still follows the default above (a `BigDecimal` can only hold as many digits as the DB column allows)

## Notes

- Use `VARCHAR2` for string types in Oracle (not `VARCHAR` or `NVARCHAR2`)
- Size specification for `VARCHAR(n)` in PostgreSQL is in character units (not bytes)
- Use `NVARCHAR` for string types in SQLServer (Unicode support)
- Do not specify `with timezone` for `TIMESTAMP` / `TIME` in PostgreSQL
- `CLOB` / `TEXT` / `NVARCHAR(max)` is prohibited for use in WHERE conditions

## Index Naming Conventions

- Single-column index: `idx_{table name}_{column name}` (e.g., `idx_exm_t_order_user_cd`)
- Composite index: `idx_{table name}_{column1}_{column2}`
- Unique constraint: `uq_{table name}_{column name}`
- Add indexes to frequently searched columns and foreign-reference columns as a rule, and do not create indexes that are not expected to be used (unused indexes degrade write performance)

## Syntax Allowed in DDL

DDL files should only contain **table definitions, primary keys, unique constraints, and indexes**.
Including functions and triggers is prohibited because it often causes import failures due to combinations of DB products, versions, and data types.

| Syntax | Allowed | Notes |
|--------|---------|-------|
| `CREATE TABLE` | OK | Column definitions, PK, UNIQUE only |
| `CONSTRAINT ... PRIMARY KEY` | OK | Within table |
| `CONSTRAINT ... UNIQUE` | OK | Within table |
| `CREATE INDEX` | OK | For scan optimization |
| `CREATE FUNCTION` / `CREATE PROCEDURE` | **NG** | Causes import failures |
| `CREATE TRIGGER` | **NG** | Causes import failures |
| `CREATE VIEW` | **NG** | Not used |
| `CHECK` constraint | **NG** | Value validation in application layer |
| `FOREIGN KEY` constraint | **NG** | Referential integrity in application layer |
| `EXCLUDE` constraint | **NG** | Fails due to product/data type dependencies |
| Adding above prohibited constraints with `ALTER TABLE ... ADD CONSTRAINT` | **NG** | The constraints themselves are prohibited |

### When DB-level Exclusive Control is Needed

The temptation to implement business rules (like time period overlap exclusion, equivalent to BR-001) in DDL exists, but trigger/function implementations that work across all DB products frequently cause issues due to product/version differences.
Always ensure this **in the application layer** using the following policy.

```javascript
// rm_reservation_service.js etc. (for JSSP)
function createReservation(data) {
  Transaction.begin(function() {
    ensureNoOverlap(data.roomId, data.startAt, data.endAt, null);  // Check for overlap with existing reservations using SELECT
    db.executeByTemplate('/xxx/sql/insert_reservation', { ... }); // INSERT if no problem
  });
}
```

**Verification method (JSSP):** `.agents/skills/jssp-page-generator/scripts/validate-ddl.js` automatically detects `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW` / `EXCLUDE` / `CHECK` / `FOREIGN KEY`.

## Syntax Prohibited in Sample DML (`*-dml_<dialect>.sql`)

Sample DML should be written in a form that can be executed commonly across all 3 products: PostgreSQL / Oracle / SQLServer.
JDBC / ODBC driver-dependent escape syntax (`{d}` `{t}` `{ts}` `{fn}` `{oj}` `{call}`) is not interpreted by PostgreSQL's native parser and will result in `ERROR: syntax error at or near "{"`.

### Alternatives

| Purpose | NG (ODBC escape) | OK (Standard SQL) |
|---------|-----------------|-------------------|
| Date literal | `{d '2026-01-01'}` | `'2026-01-01'` (implicit conversion to DATE / DATETIME2 column) |
| Time literal | `{t '09:00:00'}` | `'09:00:00'` (implicit conversion to TIME / DATETIME2 column) |
| Timestamp | `{ts '2026-01-01 09:00:00'}` | `'2026-01-01 09:00:00'` (implicit conversion to TIMESTAMP / DATETIME2 column) |
| Function call | `{fn UCASE(col)}` | `UPPER(col)` etc., standard functions for each DB |
| Outer join | `{oj LEFT OUTER JOIN ...}` | `LEFT OUTER JOIN ...` |
| Procedure call | `{call proc(...)}` | Not used in sample DML (implement on app side) |

**Verification method (JSSP):** `.agents/skills/jssp-page-generator/scripts/validate-ddl.js` automatically detects 6 types of ODBC escape patterns in `*-dml_<dialect>.sql` files (output with [DML] prefix as ERROR).

## Related

- `.agents/requirements/java-entity/AGENTS.md` - Audit trail fields and type mapping for Java (Mirage ORM) Entity classes
- `.agents/requirements/jssp-2way-sql/AGENTS.md` - JSSP-side SQL execution and `DbParameter` type selection conventions
- `.agents/skills/jssp-page-generator/reference/api-identifier.md` - Identifier API (SSJS) reference
