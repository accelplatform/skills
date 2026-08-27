---
paths:
  - "**/entity/*.java"
---

# Entity 类规约

> **适用范围**: 🟡 **上下文依赖** — 生成・编辑 Entity 类（`entity` 包下）时适用。领域模型及其他 Java 类无需参考本文件。

## 实体类设计

- **必须** 为兼容 Mirage ORM，使用 public 字段（直接访问，而非 getter/setter）
  - 理由：Mirage ORM 的设计是将值直接映射到 public 字段。使用 private + getter/setter 将无法正确映射
- **必须** 必须提供默认（无参）构造函数
  - 理由：ORM 通过反射使用 `Class.newInstance()` 生成实体
- **必须** 使用 `GenerationType.APPLICATION`，禁止使用其他 GenerationType
  - 理由：intra-mart Accel Platform 采用在应用层管理 ID 生成的设计方针，而非依赖 DB 侧的自动编号（IDENTITY/SEQUENCE）。这样可以实现数据库无关性，并支持预先获取 ID
- **必须** 正确附加 `@Table`、`@Column`、`@PrimaryKey` 注解

## 审计追踪字段（必须）

以下 4 个字段必须包含在所有实体中。若缺失，应在实现前指出需要补充。

```java
@Column(name = "create_user_cd")
public String createUserCd;

@Column(name = "create_date")
public Timestamp createDate;

@Column(name = "record_user_cd")
public String recordUserCd;

@Column(name = "record_date")
public Timestamp recordDate;
```

- `createUserCd`, `createDate`：记录创建时的审计追踪
- `recordUserCd`, `recordDate`：记录更新时的审计追踪
- 使用 AbstractDAO 的基本方法（insert/update）时，这些字段会自动设置。禁止手动设置

## 字段类型

- 字符串：`String`
- 日期/时间戳：`java.sql.Timestamp`（不使用 `java.util.Date` 或 `java.time.LocalDateTime` — Mirage ORM 不支持）
- 整数：`int`（较小的值）、`long`（较大的值・ID 类）— 与 DDL 的类型保持一致
- 小数/金额：`java.math.BigDecimal`（**必须** — `double`/`float` 存在舍入误差，禁止用于金额・精密计算）
- 标志位：`String`（如 "0"/"1"，与 DB 列保持一致，不映射为 Java 的 `boolean`）
- 枚举值：`String`（原样存储 DB 列的值，向 Java enum 的转换在领域模型层进行）

### DB 类型 → Java 类型 对照表

| DB 类型 | Java 类型 | 备注 |
|---|---|---|
| VARCHAR / NVARCHAR | `String` | |
| TIMESTAMP / DATETIME | `java.sql.Timestamp` | |
| INTEGER / INT | `int` 或 `long` | |
| DECIMAL / NUMERIC | `java.math.BigDecimal` | 禁止使用 double |
| CHAR(1) 标志位 | `String` | "0"/"1" |

## null 处理

- 实体的 public 字段允许 null（对应 DB 的 NULLABLE）
- 即使字段对应 NOT NULL 列，Java 侧也不设置 null 约束（约束由 DAO 层/DB 侧保证）

## 实体与领域模型的区别

| 观点 | 实体（Entity） | 领域模型（Domain Model） |
|---|---|---|
| 所属层 | 基础设施层 | 领域层 |
| 目的 | 与 DB 表 1:1 映射 | 表达业务逻辑 |
| 字段 | public 字段（ORM 要求） | private 字段 + getter |
| 可变性 | 可变（由 ORM 设置值） | 推荐不可变 |
| 校验 | 无（依赖 DB 约束） | 实现业务规则 |
| 转换 | 在仓储层相互转换 | 在仓储层相互转换 |

实体是 DB 结构的映射，不应承载业务逻辑。业务逻辑应在领域模型中实现。
