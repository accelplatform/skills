# DDL/DML SQL Skeleton Specification

SQL files to be issued against the database during tenant environment setup.

## How the DB-Type Suffix is Automatically Applied

For the file names written in `<create-file>` / `<insert-file>` of `import-<artifactId>-config-1.xml`, the intra-mart Importer **automatically appends** one of the following suffixes according to the connected DB, and loads the matching file.

| DB Type | Suffix |
|---------|------------|
| PostgreSQL | `_postgre` |
| Oracle Database | `_oracle` |
| Microsoft SQL Server | `_sqlserver` |

Example:

```xml
<create-file>products/import/basic/equip/1.0.0/equip-ddl.sql</create-file>
```

When written like this, `equip-ddl_postgre.sql` is loaded in a PostgreSQL environment, `equip-ddl_oracle.sql` in an Oracle environment, and `equip-ddl_sqlserver.sql` in a SQL Server environment.

### File Resolution Priority

When the connected DB is PostgreSQL, the Importer searches files in the following order:

1. `equip-ddl_postgre.sql` (with suffix, DB-specific)
2. `equip-ddl.sql` (**without suffix, common fallback for all DBs**)

In other words, **placing a file without a suffix makes it shared across all DB-Types**. When the SQL has no dialect-specific differences, it can be consolidated into a single file.

### When to Use DDL vs DML

| Type | Recommended Placement | Reason |
|------|----------------|------|
| **DDL** | Three dialect-specific files (`_postgre` / `_oracle` / `_sqlserver`) | CREATE TABLE has large differences in type names and constraint syntax across DBs (VARCHAR2 / DECIMAL / TIMESTAMP representations, etc.) |
| **DML** | **Consolidate into a single file** as a principle (`<key>_sample-dml.sql`) | INSERT statements can usually be written within standard SQL, and dialect differences rarely occur |

For DML, switch to three dialect-specific files only when dialect-dependent syntax (PostgreSQL `ON CONFLICT`, Oracle `MERGE`, SQL Server `IF NOT EXISTS BEGIN ... END`, etc.) is required.

## File Layout

### Recommended Pattern (DDL per dialect, DML consolidated)

| File | Content |
|---------|------|
| `<key>-ddl_postgre.sql` | CREATE TABLE statements (for PostgreSQL) |
| `<key>-ddl_oracle.sql` | CREATE TABLE statements (for Oracle) |
| `<key>-ddl_sqlserver.sql` | CREATE TABLE statements (for SQL Server) |
| `<key>_sample-dml.sql` | Initial data INSERT statements (**common to all DBs**) |

### When DML is also split per dialect (only when dialect-dependent syntax is needed)

| File | Content |
|---------|------|
| `<key>_sample-dml_postgre.sql` | Initial data INSERT statements (for PostgreSQL) |
| `<key>_sample-dml_oracle.sql` | Initial data INSERT statements (for Oracle) |
| `<key>_sample-dml_sqlserver.sql` | Initial data INSERT statements (for SQL Server) |

References in `import-<artifactId>-config-1.xml` are written without the suffix:

```xml
<database>
  <create-file>products/import/basic/<key>/<version>/<key>-ddl.sql</create-file>
  <insert-file>products/import/basic/<key>/<version>/<key>_sample-dml.sql</insert-file>
</database>
```

Order: DDL (create-file) first, then DML (insert-file).

## Skeleton Content

The build script looks at `database.tables[]` in the spec and generates a **comment-only skeleton** SQL for each of the three dialects.
The body of CREATE TABLE (column definitions and constraints) must be added manually by the user.

### Skeleton Example for `<key>-ddl_<dialect>.sql`

```sql
-- =============================================================================
--   im_bloommaker DDL (postgre)
-- =============================================================================
--   Output timing: at tenant environment setup
--   The file name suffix _postgre causes the intra-mart Importer to
--   automatically load only the single file that matches the connected DB type
-- =============================================================================

-- imbm_content: content
-- CREATE TABLE imbm_content (
--     content_id    VARCHAR(64)  NOT NULL,
--     tenant_id     VARCHAR(64)  NOT NULL,
--     ...
--     PRIMARY KEY (content_id)
-- );
```

Write the types and syntax appropriate for each DB dialect in the corresponding file. For type mapping, see `.claude/skills/jssp-page-generator/reference/ddl-type-mapping.md`.

### Skeleton Example for `<key>_sample-dml.sql` (consolidated, recommended)

```sql
-- =============================================================================
--   im_bloommaker DML (common to all DBs)
-- =============================================================================
--   Output timing: at tenant environment setup (after DDL)
--   Files without a suffix are shared across all DB-Types
-- =============================================================================

-- If there is initial data for imbm_content, write it here
-- INSERT INTO imbm_content (...) VALUES (...);
```

**Write INSERT statements within the range of standard SQL** as a principle, consolidated into a single file. Avoid dialect-specific literals for dates and timestamps (Oracle's `TO_DATE`, SQL Server's `CONVERT`, etc.) and rely on string literals such as `'2026-01-01'` with implicit conversion, or use common functions such as `CURRENT_TIMESTAMP`.

Only when dialect-dependent syntax is absolutely required, switch to the three-dialect file configuration `<key>_sample-dml_<dialect>.sql`.

## Specification in spec.json

```json
"database": {
  "tables": [
    { "name": "any_app_data",   "comment": "サンプルデータ" },
    { "name": "any_app_master", "comment": "マスタ" }
  ],
  "dmlPerDialect": false
}
```

| Field | Required | Default | Content |
|-----------|------|---------|------|
| `tables[].name` | YES | - | Table name |
| `tables[].comment` | NO | - | Description of the table (expanded into a comment) |
| `dmlPerDialect` | NO | `false` | Whether to output DML as three dialect-specific files |

### Behavior of `dmlPerDialect`

| Value | Output DML files |
|----|----------------------|
| `false` (default, **recommended**) | `<key>_sample-dml.sql` (single file, common to all DBs) |
| `true` | `<key>_sample-dml_postgre.sql` / `_oracle.sql` / `_sqlserver.sql` (three files) |

Because DDL has large dialect differences, it is always output as three dialect-specific files (`<key>-ddl_<dialect>.sql`) regardless of the value of `dmlPerDialect`.

When INSERT statements can be written within standard SQL, leave `dmlPerDialect: false` (the default). Set it to `true` only when dialect-dependent syntax such as PostgreSQL's `ON CONFLICT` or Oracle's `MERGE` is required.

If `database` is omitted, no SQL files are generated, and the `<database>` section is also omitted from `import-<artifactId>-config-1.xml`.

## Notes

- Keep DDL **idempotent** (running it twice on the same tenant will cause errors)
- Limit DML to initial data for master-type tables. **Do not include business transaction data**
- Character encoding is UTF-8 (without BOM)
- LF is recommended for line endings (CRLF also works, but git diffs become noisy)
- **Files without a suffix function as a "common fallback for all DBs"**. The Importer prioritizes files with a suffix and falls back to the suffix-less file otherwise. DDL per dialect and DML consolidated (without suffix) is the recommended pattern
- **When both suffixed and non-suffixed files exist for the same base name, the suffixed file takes precedence**. Be careful not to leave an old common file unintentionally
