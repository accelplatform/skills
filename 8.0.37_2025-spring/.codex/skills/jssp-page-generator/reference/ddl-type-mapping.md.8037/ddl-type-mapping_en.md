# DDL Type Mapping Reference

## Overview

Recommended type mappings for each DB product supported by intra-mart Accel Platform.
Select types according to this reference when generating DDL.

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

## Correspondence with DbParameter

| DbParameter Method | DDL Usage | Oracle | PostgreSQL | SQLServer | Notes |
|-------------------|-----------|--------|------------|-----------|-------|
| `DbParameter.string()` | String column | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | - |
| `DbParameter.number()` | Numeric column | NUMBER(x, y) | DECIMAL(x, y) | DECIMAL(x, y) | - |
| `DbParameter.date()` | Date column | DATE | DATE | DATETIME2 | - |
| `DbParameter.timestamp()` | Datetime column | TIMESTAMP | TIMESTAMP | DATETIME2 | - |
| `DbParameter.string()` | Boolean column (flag) | CHAR(1) | CHAR(1) | CHAR(1) | `'0'`=false, `'1'`=true |

## Column Size Guidelines

| Purpose | Expected Character Count | Size Specification (4x) | Example |
|---------|--------------------------|------------------------|---------|
| Codes (IDs, classification values) | Up to 64 characters | 256 | VARCHAR2(256) / VARCHAR(256) / NVARCHAR(256) |
| Names (user names, department names, etc.) | Up to 50 characters | 200 | VARCHAR2(200) / VARCHAR(200) / NVARCHAR(200) |
| Short descriptions (notes, etc.) | Up to 500 characters | 2000 | VARCHAR2(2000) / VARCHAR(2000) / NVARCHAR(2000) |
| Date strings (yyyy/MM/dd) | 10 characters | 40 | VARCHAR2(40) / VARCHAR(40) / NVARCHAR(40) |

## Notes

- Use `VARCHAR2` for string types in Oracle (not `VARCHAR` or `NVARCHAR2`)
- Size specification for `VARCHAR(n)` in PostgreSQL is in character units (not bytes)
- Use `NVARCHAR` for string types in SQLServer (Unicode support)
- Do not specify `with timezone` for `TIMESTAMP` / `TIME` in PostgreSQL
- `CLOB` / `TEXT` / `NVARCHAR(max)` is prohibited for use in WHERE conditions

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

The temptation to implement business rules (like time period overlap exclusion, equivalent to BR-001) in DDL exists,
but trigger/function implementations that work across all DB products frequently cause issues due to product/version differences.
Always ensure this **in the application layer** using the following policy.

```javascript
// rm_reservation_service.js etc.
function createReservation(data) {
  Transaction.begin(function() {
    ensureNoOverlap(data.roomId, data.startAt, data.endAt, null);  // Check for overlap with existing reservations using SELECT
    db.executeByTemplate('/xxx/sql/insert_reservation', { ... }); // INSERT if no problem
  });
}
```

**Verification method:** `validate-ddl.js` automatically detects `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW` / `EXCLUDE` / `CHECK` / `FOREIGN KEY`.

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

**Verification method:** `validate-ddl.js` automatically detects 6 types of ODBC escape patterns in `*-dml_<dialect>.sql` files (output with [DML] prefix as ERROR).
