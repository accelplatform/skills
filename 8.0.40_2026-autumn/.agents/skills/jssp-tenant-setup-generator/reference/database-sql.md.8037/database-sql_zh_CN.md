# DDL/DML SQL 骨架规范

租户环境安装时对数据库发布的 SQL 文件。

## 基于 DB-Type 的后缀自动附加机制

对于 `import-<artifactId>-config-1.xml` 的 `<create-file>` / `<insert-file>` 中所写的文件名，intra-mart Importer 会根据连接的 DB **自动附加** 以下后缀，并读取对应的文件。

| DB 种类 | 后缀 |
|---------|------------|
| PostgreSQL | `_postgre` |
| Oracle Database | `_oracle` |
| Microsoft SQL Server | `_sqlserver` |

示例：

```xml
<create-file>products/import/basic/equip/1.0.0/equip-ddl.sql</create-file>
```

按此编写时，在 PostgreSQL 环境下会读取 `equip-ddl_postgre.sql`，在 Oracle 环境下会读取 `equip-ddl_oracle.sql`，在 SQL Server 环境下会读取 `equip-ddl_sqlserver.sql`。

### 文件解析的优先级

当连接的 DB 为 PostgreSQL 时，Importer 按以下顺序搜索文件：

1. `equip-ddl_postgre.sql`（带后缀，DB 特定）
2. `equip-ddl.sql`（**不带后缀，全 DB 通用兜底**）

也就是说，**放置不带后缀的文件后，它会被所有 DB-Type 共用**。当 SQL 没有 DB 方言差异时，可以合并为一个文件。

### DDL 与 DML 的区别使用

| 种类 | 推荐的放置方式 | 理由 |
|------|----------------|------|
| **DDL** | 分 3 种方言（`_postgre` / `_oracle` / `_sqlserver`） | CREATE TABLE 的类型名与约束语法在各 DB 之间差异巨大（VARCHAR2 / DECIMAL / TIMESTAMP 的表示等） |
| **DML** | 原则上**合并为单个文件**（`<key>_sample-dml.sql`） | INSERT 语句多可用标准 SQL 范围内编写，DB 方言差异较小 |

DML 也仅在使用方言依赖语法（PostgreSQL 的 `ON CONFLICT`、Oracle 的 `MERGE`、SQL Server 的 `IF NOT EXISTS BEGIN ... END` 等）时才分为 3 个方言文件。

## 文件结构

### 推荐模式（DDL 按方言、DML 合并）

| 文件 | 内容 |
|---------|------|
| `<key>-ddl_postgre.sql` | CREATE TABLE 语句（PostgreSQL 用） |
| `<key>-ddl_oracle.sql` | CREATE TABLE 语句（Oracle 用） |
| `<key>-ddl_sqlserver.sql` | CREATE TABLE 语句（SQL Server 用） |
| `<key>_sample-dml.sql` | 初始数据 INSERT 语句（**全 DB 通用**） |

### 将 DML 也按方言分开的情况（仅在使用方言依赖语法时）

| 文件 | 内容 |
|---------|------|
| `<key>_sample-dml_postgre.sql` | 初始数据 INSERT 语句（PostgreSQL 用） |
| `<key>_sample-dml_oracle.sql` | 初始数据 INSERT 语句（Oracle 用） |
| `<key>_sample-dml_sqlserver.sql` | 初始数据 INSERT 语句（SQL Server 用） |

`import-<artifactId>-config-1.xml` 中的引用以不带后缀的形式编写：

```xml
<database>
  <create-file>products/import/basic/<key>/<version>/<key>-ddl.sql</create-file>
  <insert-file>products/import/basic/<key>/<version>/<key>_sample-dml.sql</insert-file>
</database>
```

顺序：先 DDL（create-file），再 DML（insert-file）。

## 骨架的内容

build 脚本依据 spec 的 `database.tables[]`，针对 3 种方言分别生成**仅包含注释的骨架** SQL。
CREATE TABLE 的主体（列定义、约束）需要由用户手动追加。

### `<key>-ddl_<dialect>.sql` 的骨架示例

```sql
-- =============================================================================
--   im_bloommaker DDL (postgre)
-- =============================================================================
--   输出时机：租户环境安装时
--   文件名后缀 _postgre 会被 intra-mart Importer 自动判定，
--   只读取与连接 DB 种类匹配的单个文件
-- =============================================================================

-- imbm_content: 内容
-- CREATE TABLE imbm_content (
--     content_id    VARCHAR(64)  NOT NULL,
--     tenant_id     VARCHAR(64)  NOT NULL,
--     ...
--     PRIMARY KEY (content_id)
-- );
```

针对各 DB 方言的类型与语法分别写入对应的文件。类型映射请参考 `.agents/skills/jssp-page-generator/reference/ddl-type-mapping.md`。

### `<key>_sample-dml.sql` 的骨架示例（合并，推荐）

```sql
-- =============================================================================
--   im_bloommaker DML (全 DB 通用)
-- =============================================================================
--   输出时机：租户环境安装时（DDL 之后）
--   不带后缀的文件会被所有 DB-Type 共用
-- =============================================================================

-- 如有 imbm_content 的初始数据请写在这里
-- INSERT INTO imbm_content (...) VALUES (...);
```

原则上**在标准 SQL 范围内编写 INSERT 语句**，合并为单个文件。请避免日期、时间戳等方言特定字面量（Oracle 的 `TO_DATE`、SQL Server 的 `CONVERT` 等），改用如 `'2026-01-01'` 的字符串字面量配合隐式转换，或使用 `CURRENT_TIMESTAMP` 等通用函数。

仅在确实需要方言依赖语法时，才使用 `<key>_sample-dml_<dialect>.sql` 的 3 个方言文件构成。

## spec.json 中的描述

```json
"database": {
  "tables": [
    { "name": "any_app_data",   "comment": "サンプルデータ" },
    { "name": "any_app_master", "comment": "マスタ" }
  ],
  "dmlPerDialect": false
}
```

| 字段 | 必需 | 默认 | 内容 |
|-----------|------|---------|------|
| `tables[].name` | YES | - | 表名 |
| `tables[].comment` | NO | - | 表的说明（展开到注释中） |
| `dmlPerDialect` | NO | `false` | 是否将 DML 按 3 种方言分别输出 |

### `dmlPerDialect` 的行为

| 值 | 输出的 DML 文件 |
|----|----------------------|
| `false`（默认，**推荐**） | `<key>_sample-dml.sql`（1 个文件，全 DB 通用） |
| `true` | `<key>_sample-dml_postgre.sql` / `_oracle.sql` / `_sqlserver.sql`（3 个文件） |

由于 DDL 的方言差异较大，无论 `dmlPerDialect` 的值如何，DDL 始终按 3 种方言（`<key>-ddl_<dialect>.sql`）输出。

当 INSERT 语句可在标准 SQL 范围内编写时，保持 `dmlPerDialect: false`（默认）即可。仅当需要 PostgreSQL 的 `ON CONFLICT`、Oracle 的 `MERGE` 等方言依赖语法时，才设为 `true`。

省略 `database` 时，不生成 SQL 文件，并且 `import-<artifactId>-config-1.xml` 中也会省略 `<database>` 节。

## 注意事项

- DDL 需注意**幂等性**（对同一租户执行两次会出错）
- DML 限定为主数据类的初始数据。**不要放入业务事务数据**
- 字符编码为 UTF-8（不带 BOM）
- 换行推荐 LF（CRLF 也可工作，但会使 git 差异变乱）
- **不带后缀的文件作为"全 DB 通用兜底"发挥作用**。Importer 优先读取带后缀的文件，没有时才读取不带后缀的。DDL 按方言、DML 合并（不带后缀）是推荐的模式
- **在同一基础名下同时存在带后缀和不带后缀的文件时，带后缀的文件优先**。注意避免不经意地遗留旧的通用文件
