---
paths:
  - "src/main/storage/system/products/import/basic/**/*.sql"
---

# 表定义（DDL）规约

> **适用范围**：🟢 **始终** — 新建或变更表的 DDL 时适用。表通过 `storage/system` 下的 DDL/Importer 机制创建，无论 JSSP（脚本开发模型）还是 Java（JavaEE 开发模型）使用该表，表定义本身都不依赖开发模型，遵循本规约。

## 概述

intra-mart Accel Platform 支持的各 DB 产品（Oracle / PostgreSQL / SQLServer）的推荐类型映射，以及表・列的命名规约。
生成 DDL 时请遵照本参考。

## 表・列命名规约

- 表名、列名**一律使用小写蛇形命名**（下划线分隔）
- **SQL 保留字一律使用大写**书写（`CREATE TABLE`、`NOT NULL`、`PRIMARY KEY` 等）
- 表名建议采用 `{域名缩写prefix}_{类型}_{实体名}` 的格式
  - 类型：`m`（主数据）、`t`（事务数据）
  - 例：`exm_m_user`（主数据）、`exm_t_order`（事务数据）
  - `{域名缩写prefix}` 的具体值，本规约不规定机械推导方法，**由用户指示或规格书决定**
- 表示外部引用的列名应采用 `{被引用实体名}_{cd 或 id}` 的格式
  - 例：`user_cd`、`order_id`
- 表名、列名须控制在 **63 个字符以内**
  - 在支持的 DB（Oracle 19c 以上・PostgreSQL 14 以上・SQL Server 2016 以上）中，标识符长度限制最严格的是 PostgreSQL 的 `NAMEDATALEN`（64，实际可用 63 字节），因此成为实质上限

## 主键设计

- 主键应尽量使用**单一列**（复合主键仅在中间表等确有必要时使用）
- 由应用层发号 ID 时，使用 `Identifier.get()`（SSJS：`.claude/skills/jssp-page-generator/reference/api-identifier.md`；Java：`jp.co.intra_mart.foundation.service.client.information.Identifier`），对应列须定义为 **`VARCHAR(15)`**（Oracle 为 `VARCHAR2(15)`，SQLServer 为 `NVARCHAR(15)`）
  - 因为 `Identifier` 返回 15 字节字符串

## DDL / 样例 DML 的文件命名规约

各 DB 方言文件的分隔符统一如下。

- DDL：`{功能名}-ddl_<dialect>.sql` — **`ddl` 前使用连字符（`-`），方言后缀（`_postgre`/`_oracle`/`_sqlserver`）前使用下划线（`_`）**
  - 例：`equip-ddl_postgre.sql`、`equip-ddl_oracle.sql`、`equip-ddl_sqlserver.sql`
  - `{功能名}_ddl_<dialect>.sql`（`ddl` 前也用下划线）是错误写法
  - 方言后缀固定为 `_postgre`（不是 `_postgres`）、`_oracle`、`_sqlserver` 三种。须与 intra-mart Importer 根据目标 DB 自动附加的后缀一致，不可更改拼写
- 样例 DML：`{功能名}_sample-dml.sql`（全 DB 通用，**推荐**）。仅在需要方言相关语法时才使用 `{功能名}_sample-dml_<dialect>.sql`（分隔符与 DDL 不同：`sample` 前是下划线，`dml` 前是连字符）

## 类型映射表

| 用途 | Oracle | PostgreSQL | SQLServer | 备注 |
|------|--------|------------|-----------|------|
| 字符串（不含多字节字符） | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | PostgreSQL 的大小指定为字符数，严格来说与其他DB的大小不同 |
| 字符串（含2字节及以上字符） | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | Oracle 使用 VARCHAR2（而非 NVARCHAR2）。所有DB通用：列大小确保为预期字符数的4倍 |
| 数值 | NUMBER(x, y) | DECIMAL(x, y) | DECIMAL(x, y) | Oracle 的 NUMBER 有 DECIMAL 别名，但明确使用 NUMBER |
| 日期 | DATE | DATE | DATETIME2 | SQLServer 使用 DATETIME2 |
| 时间 | DATE | TIME | DATETIME2 | SQLServer 使用 DATETIME2。PostgreSQL 不指定 with timezone |
| 日期时间 | TIMESTAMP | TIMESTAMP | DATETIME2 | PostgreSQL 不指定 with timezone |
| 布尔值（标志） | CHAR(1) | CHAR(1) | CHAR(1) | `'0'`=false，`'1'`=true。不使用DB特有的 BOOLEAN/BIT，统一使用 CHAR(1) |
| 长字符串 | CLOB | TEXT | NVARCHAR(max) | 禁止在 WHERE 等条件中使用（不支持、性能问题） |

## 与 DbParameter 的对应关系（JSSP）

适用于 JSSP（脚本开发模型）使用 `TenantDatabase`/`SharedDatabase` 的场景。Java（`im_mirage`）侧的类型对应请参考 `.claude/rules/java-entity.md`。

| DbParameter 方法 | DDL 用途 | Oracle | PostgreSQL | SQLServer | 备注 |
|-----------------|---------|--------|------------|-----------|------|
| `DbParameter.string()` | 字符串列 | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | - |
| `DbParameter.number()` | 数值列 | NUMBER(x, y) | DECIMAL(x, y) | DECIMAL(x, y) | - |
| `DbParameter.date()` | 日期列 | DATE | DATE | DATETIME2 | - |
| `DbParameter.timestamp()` | 日期时间列 | TIMESTAMP | TIMESTAMP | DATETIME2 | - |
| `DbParameter.string()` | 布尔值列（标志） | CHAR(1) | CHAR(1) | CHAR(1) | `'0'`=false，`'1'`=true |

## 审计追踪列（必须）

以下 4 个列须包含在所有表中。

| 列名 | 含义 | 类型（PostgreSQL） | 类型（Oracle） | 类型（SQLServer） |
|------|------|--------------------|-------------------|----------------------|
| `create_user_cd` | 创建者代码 | VARCHAR(100) NOT NULL | VARCHAR2(100) NOT NULL | NVARCHAR(100) NOT NULL |
| `create_date` | 创建时间 | TIMESTAMP NOT NULL | TIMESTAMP NOT NULL | DATETIME2 NOT NULL |
| `record_user_cd` | 最终更新者代码 | VARCHAR(100) NOT NULL | VARCHAR2(100) NOT NULL | NVARCHAR(100) NOT NULL |
| `record_date` | 最终更新时间 | TIMESTAMP NOT NULL | TIMESTAMP NOT NULL | DATETIME2 NOT NULL |

- `create_user_cd`/`create_date` 记录创建时的审计信息，`record_user_cd`/`record_date` 记录更新时的审计信息，应在应用层（功能容器的 INSERT/UPDATE 处理，或 Java 的 DAO/`AbstractDAO`）中设置（禁止通过 DDL 触发器等自动设置，理由见「DDL 中允许的语法」）
- 用户代码类列（`create_user_cd`/`record_user_cd` 以及业务列中的 `user_cd` 通用）无论预计字符数如何，一律**固定为 100 字节**（因其为以半角字母数字为主的代码值，不适用下方「列大小参考」中的4倍规则）
- 对于 Java（`im_mirage`）的 Entity 类，须与 `.claude/rules/java-entity.md` 中的审计追踪字段规约（`createUserCd`/`createDate`/`recordUserCd`/`recordDate`）保持一致。使用 `AbstractDAO` 的基本方法（insert/update）时会自动设置

## 列大小参考

| 用途 | 预计字符数 | 大小指定（4倍） | 示例 |
|------|----------|---------------|------|
| 代码类（ID、分类值） | ~64字符 | 256 | VARCHAR2(256) / VARCHAR(256) / NVARCHAR(256) |
| 名称（用户名、部门名等） | ~50字符 | 200 | VARCHAR2(200) / VARCHAR(200) / NVARCHAR(200) |
| 短描述（备注等） | ~500字符 | 2000 | VARCHAR2(2000) / VARCHAR(2000) / NVARCHAR(2000) |
| 日期字符串（yyyy/MM/dd） | 10字符 | 40 | VARCHAR2(40) / VARCHAR(40) / NVARCHAR(40) |

上表适用于可能包含日语等多字节字符的列。像 `user_cd` 这样的半角字母数字代码不适用4倍规则，与上述审计追踪列一样**固定为 100 字节**。

## 数值列位数参考

规格书中若明确指定位数，以规格书为准。规格书未规定时，总位数（精度）默认**不超过 15 位**，以保证不超出 Java `double` 能无误差表示的有效位数（52 位尾数 ≈ 十进制 15～16 位）。JSSP（Rhino/JavaScript）侧的数值同样以 IEEE754 双精度（与 `double` 表示方式相同）处理，理由相同。

| 用途 | 类型 | 备注 |
|---|---|---|
| 整数（显示顺序、件数等） | DECIMAL(10, 0) / NUMBER(10) | 一般整数值 10 位即可 |
| 金额 | DECIMAL(15, 2) | 整数部 13 位 + 小数部 2 位 = 15 位 |
| 通用小数 | DECIMAL(15, y) | `y` 根据所需精度调整，总位数不超过 15 位 |

- 金额计算本身按 `.claude/rules/java-entity.md` 的规约在 Java 侧使用 `java.math.BigDecimal`，但 DDL 列大小本身仍遵循上述默认值（即使使用 `BigDecimal`，也只能保存到 DB 列位数上限为止）

## 注意事项

- Oracle 的字符串类型使用 `VARCHAR2`（不使用 `VARCHAR` 或 `NVARCHAR2`）
- PostgreSQL 的 `VARCHAR(n)` 大小指定为字符数单位（非字节数）
- SQLServer 的字符串类型使用 `NVARCHAR`（支持 Unicode）
- PostgreSQL 的 `TIMESTAMP` / `TIME` 不指定 `with timezone`
- `CLOB` / `TEXT` / `NVARCHAR(max)` 禁止在 WHERE 条件中使用

## 索引命名规则

- 单列索引：`idx_{表名}_{列名}`（例：`idx_exm_t_order_user_cd`）
- 复合索引：`idx_{表名}_{列1}_{列2}`
- 唯一约束：`uq_{表名}_{列名}`
- 原则上应为高频检索列、外部引用列设置索引，不设置无使用计划的索引（会导致更新性能下降）

## DDL 中允许的语法

DDL 文件**只能**包含**表定义、主键、唯一约束、索引**。
包含函数和触发器会因 DB 产品、版本、数据类型的组合而频繁导致导入失败，因此禁止使用。

| 语法 | 可否 | 备注 |
|------|------|------|
| `CREATE TABLE` | OK | 仅列定义、PK、UNIQUE |
| `CONSTRAINT ... PRIMARY KEY` | OK | 表内 |
| `CONSTRAINT ... UNIQUE` | OK | 表内 |
| `CREATE INDEX` | OK | 用于扫描加速 |
| `CREATE FUNCTION` / `CREATE PROCEDURE` | **NG** | 导入失败的原因 |
| `CREATE TRIGGER` | **NG** | 导入失败的原因 |
| `CREATE VIEW` | **NG** | 不使用 |
| `CHECK` 约束 | **NG** | 值的验证在应用层进行 |
| `FOREIGN KEY` 约束 | **NG** | 引用完整性在应用层进行 |
| `EXCLUDE` 约束 | **NG** | 因产品/数据类型依赖而失败 |
| 用 `ALTER TABLE ... ADD CONSTRAINT` 添加上述禁止约束 | **NG** | 约束本身就是禁止的 |

### 需要 DB 级排他控制时

实现时间段重叠排他等业务规则（相当于 BR-001）的诱惑存在于 DDL 中，但在所有 DB 产品上都能运行的触发器/函数实现会因产品/版本差异频繁出问题。
请务必按照以下方针**在应用层保证**。

```javascript
// rm_reservation_service.js 等（JSSP 场景）
function createReservation(data) {
  Transaction.begin(function() {
    ensureNoOverlap(data.roomId, data.startAt, data.endAt, null);  // 用 SELECT 确认与已有预约的重叠
    db.executeByTemplate('/xxx/sql/insert_reservation', { ... }); // 没有问题则 INSERT
  });
}
```

**验证方法（JSSP）：** `.claude/skills/jssp-page-generator/scripts/validate-ddl.js` 自动检测 `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW` / `EXCLUDE` / `CHECK` / `FOREIGN KEY`。

## 样例 DML（`*-dml_<dialect>.sql`）中禁止的语法

样例 DML 以可在 PostgreSQL / Oracle / SQLServer 3种产品上通用执行的形式编写。
JDBC / ODBC 驱动依赖的转义语法（`{d}` `{t}` `{ts}` `{fn}` `{oj}` `{call}`）在 PostgreSQL 的原生解析器中无法解释，会产生 `ERROR: "{" 或其附近有语法错误`。

### 替代方法

| 用途 | NG（ODBC转义） | OK（标准SQL） |
|------|--------------|--------------|
| 日期字面量 | `{d '2026-01-01'}` | `'2026-01-01'`（隐式转换为 DATE / DATETIME2 列） |
| 时间字面量 | `{t '09:00:00'}` | `'09:00:00'`（隐式转换为 TIME / DATETIME2 列） |
| 时间戳 | `{ts '2026-01-01 09:00:00'}` | `'2026-01-01 09:00:00'`（隐式转换为 TIMESTAMP / DATETIME2 列） |
| 函数调用 | `{fn UCASE(col)}` | `UPPER(col)` 等各DB的标准函数 |
| 外连接 | `{oj LEFT OUTER JOIN ...}` | `LEFT OUTER JOIN ...` |
| 过程调用 | `{call proc(...)}` | 样例DML中不使用（在应用层实现） |

**验证方法（JSSP）：** `.claude/skills/jssp-page-generator/scripts/validate-ddl.js` 对 `*-dml_<dialect>.sql` 文件自动检测6种 ODBC 转义模式（带 [DML] 前缀输出为 ERROR）。

## 相关

- `.claude/rules/java-entity.md` - Java（Mirage ORM）Entity 类的审计追踪字段与类型对应
- `.claude/rules/jssp-2way-sql.md` - JSSP 侧 SQL 执行与 `DbParameter` 类型选择规约
- `.claude/skills/jssp-page-generator/reference/api-identifier.md` - Identifier API（SSJS）参考
