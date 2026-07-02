# DDL 类型映射参考

## 概述

intra-mart Accel Platform 支持的各 DB 产品的推荐类型映射。
生成 DDL 时，请按照本参考选择类型。

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

## 与 DbParameter 的对应关系

| DbParameter 方法 | DDL 用途 | Oracle | PostgreSQL | SQLServer | 备注 |
|-----------------|---------|--------|------------|-----------|------|
| `DbParameter.string()` | 字符串列 | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | - |
| `DbParameter.number()` | 数值列 | NUMBER(x, y) | DECIMAL(x, y) | DECIMAL(x, y) | - |
| `DbParameter.date()` | 日期列 | DATE | DATE | DATETIME2 | - |
| `DbParameter.timestamp()` | 日期时间列 | TIMESTAMP | TIMESTAMP | DATETIME2 | - |
| `DbParameter.string()` | 布尔值列（标志） | CHAR(1) | CHAR(1) | CHAR(1) | `'0'`=false，`'1'`=true |

## 列大小参考

| 用途 | 预计字符数 | 大小指定（4倍） | 示例 |
|------|----------|---------------|------|
| 代码类（ID、分类值） | ~64字符 | 256 | VARCHAR2(256) / VARCHAR(256) / NVARCHAR(256) |
| 名称（用户名、部门名等） | ~50字符 | 200 | VARCHAR2(200) / VARCHAR(200) / NVARCHAR(200) |
| 短描述（备注等） | ~500字符 | 2000 | VARCHAR2(2000) / VARCHAR(2000) / NVARCHAR(2000) |
| 日期字符串（yyyy/MM/dd） | 10字符 | 40 | VARCHAR2(40) / VARCHAR(40) / NVARCHAR(40) |

## 注意事项

- Oracle 的字符串类型使用 `VARCHAR2`（不使用 `VARCHAR` 或 `NVARCHAR2`）
- PostgreSQL 的 `VARCHAR(n)` 大小指定为字符数单位（非字节数）
- SQLServer 的字符串类型使用 `NVARCHAR`（支持 Unicode）
- PostgreSQL 的 `TIMESTAMP` / `TIME` 不指定 `with timezone`
- `CLOB` / `TEXT` / `NVARCHAR(max)` 禁止在 WHERE 条件中使用

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

实现时间段重叠排他等业务规则（相当于 BR-001）的诱惑存在于 DDL 中，
但在所有 DB 产品上都能运行的触发器/函数实现会因产品/版本差异频繁出问题。
请务必按照以下方针**在应用层保证**。

```javascript
// rm_reservation_service.js 等
function createReservation(data) {
  Transaction.begin(function() {
    ensureNoOverlap(data.roomId, data.startAt, data.endAt, null);  // 用 SELECT 确认与已有预约的重叠
    db.executeByTemplate('/xxx/sql/insert_reservation', { ... }); // 没有问题则 INSERT
  });
}
```

**验证方法：** `validate-ddl.js` 自动检测 `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW` / `EXCLUDE` / `CHECK` / `FOREIGN KEY`。

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

**验证方法：** `validate-ddl.js` 对 `*-dml_<dialect>.sql` 文件自动检测6种 ODBC 转义模式（带 [DML] 前缀输出为 ERROR）。