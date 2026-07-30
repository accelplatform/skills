# DDL/DML SQL 骨架规范

示例数据设置时对数据库发布的 SQL 文件。

DB-Type 后缀的自动附加（`_postgre` / `_oracle` / `_sqlserver`）·文件解析的优先级·类型映射与租户环境设置相同。
请参见 `.github/skills/jssp-tenant-setup-generator/reference/database-sql.md`。

## 对象范围

| 资料 | 对象表 | spec |
|---|---|---|
| **DDL**（`<create-file>`） | **只在示例数据设置中使用的表** | `tables[].ddl: true` |
| **DML**（`<insert-file>`） | 投入示例数据的全部表 | `tables[]` 全部 |

模块本体的表由 `jssp-tenant-setup-generator` 生成到 `storage/system/products/import/basic/<key>/<version>/`。如果只是向既有表 INSERT，则不指定 `ddl`。

| 表的性质 | 创建 DDL 的位置 |
|---|---|
| 模块运行所必需 | 租户环境设置（`basic/`） |
| 示例数据设置专用 | **示例数据设置（`sample/`，本技能）** |

## 表已创建状态下的重新导入

**示例数据设置在每次执行设置时都会运行。** 由于会在表已创建的状态下重新执行，**单纯的 `CREATE TABLE` 从第 2 次开始必定报错。**

DDL 不受事务控制。而且即使发生异常，后续的设置处理也会继续执行，因此**出错也不会停止，不查看日志就无法察觉失败。**

### 方针的选择

| 方针 | 第 2 次以后的行为 | 既有数据 | 备注 |
|---|---|---|---|
| **带存在检查的 CREATE**（推荐） | 跳过 | 保留 | 需要各方言的语法（下表）。低于 Oracle 23ai 时不可用（参见后述注意） |
| 先 `DROP` 再 `CREATE` | 重新创建 | **被清除** | 希望每次都回到初始状态时使用。PostgreSQL / SQL Server 使用 `DROP TABLE IF EXISTS`。**低于 Oracle 23ai 时不可用**（参见后述注意） |
| 单纯的 `CREATE TABLE`（无存在检查） | 开头的 `CREATE` 会引发 ORA-00955 等，**其后的语句被跳过** | 保留 | 若首次已创建全部表则无实际危害，但日志中会持续出现错误 |

为了不破坏用户在试用中输入的数据，**默认推荐「带存在检查的 CREATE」**。

### Importer 的 SQL 执行行为（重要）

Importer 会**以分号 + 其后的空白（`;\s*\n?`）机械拆分** SQL 文件，逐条执行。该行为对 DDL 的写法构成很强的约束。

- **只要有一条语句失败，该文件剩余的全部内容都不会被执行**（异常会立即中止该文件的处理）。而且 DDL 的错误只会输出警告日志并转到下一个文件，**设置本身会被视为"成功"并继续**。
- 因此，**将没有存在检查的 `DROP` 或 `CREATE` 放在开头时，首次执行会在此失败，同一文件中剩余的全部 CREATE 都会被跳过**。在一张表也没有创建的情况下被视为"成功"，后续的 DML 会全部失效。
- 各条语句需写成能够单独成功的形式（`CREATE TABLE IF NOT EXISTS` / `DROP TABLE IF EXISTS` 等）。
- 拆分不识别注释。**注释中若含有 `;` 就会在此处切断，仅有注释的片段会作为 SQL 执行并出错**。在最后一个 `;` 之后残留注释时同理。**实现时务必删除注释行。**

### 各方言的存在检查语法

| DB | 语法 |
|---|---|
| **PostgreSQL** | `CREATE TABLE IF NOT EXISTS <table> ( ... );` |
| **SQL Server** | `IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = '<table>') CREATE TABLE <table> ( ... );` |
| **Oracle** | `CREATE TABLE IF NOT EXISTS` **仅 23ai 及以上可用**。此前的版本需要 PL/SQL 块（参见下面的注意） |

```sql
-- PostgreSQL
CREATE TABLE IF NOT EXISTS any_app_demo (
    data_id     VARCHAR(64)  NOT NULL,
    tenant_id   VARCHAR(64)  NOT NULL,
    data_name   VARCHAR(256),
    PRIMARY KEY (data_id)
);
```

```sql
-- SQL Server
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'any_app_demo')
CREATE TABLE any_app_demo (
    data_id     VARCHAR(64)  NOT NULL,
    tenant_id   VARCHAR(64)  NOT NULL,
    data_name   VARCHAR(256),
    PRIMARY KEY (data_id)
);
```

### 低于 Oracle 23ai 无法编写存在检查

**Oracle 23ai 及以上**可以使用 `CREATE TABLE IF NOT EXISTS`，因此与其他 DB 同样带存在检查地编写。

**低于 Oracle 23ai** 时无法使用 `CREATE TABLE IF NOT EXISTS`，存在检查需要 PL/SQL 匿名块（`BEGIN ～ END;`）。但如前所述，Importer 不会追踪 PL/SQL，而是以分号机械拆分，因此**块内部的分号处也会被拆分，片段作为独立 SQL 执行，在开头的 `DECLARE ...` 处就会引发 ORA-00900（invalid SQL statement）**。由于无法编写不含分号的 PL/SQL，**该方法在原理上无法成立**。

同样，将 `DROP` -> `CREATE` 放在同一文件中的方针在低于 Oracle 23ai 时也无法使用。`DROP TABLE IF EXISTS` 同样仅 23ai 及以上可用，而单纯的 `DROP` 会因首次执行时表不存在而以 ORA-00942 失败 -> 剩余全文被跳过 -> 表未被创建，**第 2 次以后也会持续同样的状态而永远无法恢复**（参见前述「Importer 的 SQL 执行行为」）。

**低于 Oracle 23ai 时的现实方针：**

| 方针 | 行为 |
|---|---|
| DDL 中**仅编写单纯的 `CREATE TABLE`，不混入 `DROP`** | 首次创建成功。第 2 次以后开头的 `CREATE` 会因 ORA-00955 停止且其后被跳过，但由于首次已创建全部表，因此无实际危害。日志中会持续出现错误 |
| 通过扩展导入（`doImport`）创建表 | 若在 JS 一侧进行存在检查后再通过 `TenantDatabase` 发布 `CREATE`，则不受 Importer 的 SQL 拆分约束（[extends-import.md](extends-import.md)） |

无论哪种情况，都要验证首次能确实创建表，以及第 2 次日志中的错误在预期之内。

## DML 的幂等性

与 DDL 同样，**单纯的 `INSERT INTO ... VALUES (...)` 在第 2 次会违反唯一约束。**

| 手法 | 说明 | 方言依赖 |
|---|---|---|
| **`INSERT ... WHERE NOT EXISTS`** | 仅在不存在时 INSERT（推荐） | 无 |
| **先 `DELETE` 再 `INSERT`** | 在同一 DML 文件内做全量刷新 | 无 |
| `MERGE` / `ON CONFLICT` / `IF NOT EXISTS` | 需要 `dmlPerDialect: true` | **有** |
| 通过扩展导入做全量刷新 | 不使用 DML，在 `doImport` 中实现（[extends-import.md](extends-import.md)） | 无 |

```sql
INSERT INTO any_app_data (data_id, tenant_id, data_type)
SELECT 'sample_001', 'default', 'SAMPLE'
WHERE NOT EXISTS (SELECT 1 FROM any_app_data WHERE data_id = 'sample_001');
```

## 文件结构

| 文件 | 内容 |
|---------|------|
| `<key>-ddl_postgre.sql` / `_oracle.sql` / `_sqlserver.sql` | CREATE TABLE 语句（始终按 3 个方言分开） |
| `<key>-dml.sql` | 示例数据的 INSERT 语句（全 DB 通用，`dmlPerDialect: false` 时） |
| `<key>-dml_postgre.sql` / `_oracle.sql` / `_sqlserver.sql` | 同上（`dmlPerDialect: true` 时） |

> **与租户环境设置一侧的 `<key>_sample-dml.sql` 是不同的东西**。那边是投入**实际运行用初始数据**的 DML，放置在 `basic/<key>/<version>/`（由 `jssp-tenant-setup-generator` 管辖）。

config 中的引用不带后缀。顺序为 DDL -> DML：

```xml
<database>
  <create-file>products/import/sample/<key>/<key>-ddl.sql</create-file>
  <insert-file>products/import/sample/<key>/<key>-dml.sql</insert-file>
</database>
```

## spec.json 中的描述

```json
"database": {
  "tables": [
    { "name": "any_app_data", "comment": "サンプルデータ" },
    { "name": "any_app_demo", "comment": "デモ用テーブル", "ddl": true }
  ],
  "dmlPerDialect": false
}
```

| 字段 | 必须 | 默认 | 内容 |
|-----------|------|---------|------|
| `tables[].name` | YES | - | 表名 |
| `tables[].comment` | NO | - | 表的说明（会展开为注释） |
| `tables[].ddl` | NO | `false` | 为 `true` 时生成 DDL（`CREATE TABLE`）的骨架。**仅对示例数据设置专用表指定** |
| `dmlPerDialect` | NO | `false` | 是否将 DML 按 3 个方言分文件输出 |

若没有任何 `ddl: true` 的表，则不会生成 DDL 文件，config 中也不会输出 `<create-file>`。

省略 `database` 时不会生成 SQL 文件，config 中也会省略 `<database>` 部分。

## 注意事项

- **不支持 SQL 语句中的注释**（规范如此）。build 脚本会输出包含注释行的骨架作为指引，因此**实现后需删除注释行**
- SQL 语句末尾需写上分号 `;`
- DML 仅限主数据类的初始数据。**不要放入业务事务数据**
- 未指定 `ddl` 的表必须已由租户环境设置的 DDL 创建
- 字符编码为 UTF-8（不带 BOM），换行推荐使用 LF
- **务必连续执行 2 次示例数据设置进行验证**（[checklist.md](checklist.md)）
