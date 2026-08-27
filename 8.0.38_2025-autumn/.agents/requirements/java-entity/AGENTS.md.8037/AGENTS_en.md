# Entity Class Conventions

> **Application Scope**: 🟡 **Contextual** — Applies when generating/editing Entity classes (under the `entity` package). No need to read this for domain models or other Java classes.

## Entity Class Design

- **Required** Use public fields for Mirage ORM compatibility (direct access rather than getter/setter)
  - Reason: Mirage ORM is designed to map values directly to public fields. Mapping does not work correctly with private + getter/setter
- **Required** Always provide a default (no-argument) constructor
  - Reason: The ORM generates entities via reflection using `Class.newInstance()`
- **Required** Use `GenerationType.APPLICATION`. Other GenerationTypes are prohibited
  - Reason: intra-mart Accel Platform manages ID generation on the application side rather than relying on DB-side auto-numbering (IDENTITY/SEQUENCE). This design enables DB independence and pre-acquisition of IDs
- **Required** Correctly annotate with `@Table`, `@Column`, `@PrimaryKey`

## Audit Trail Fields (Required)

The following 4 fields must be included in every entity. If missing, point out that they need to be added before implementation.

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

- `createUserCd`, `createDate`: Audit trail for record creation
- `recordUserCd`, `recordDate`: Audit trail for record updates
- When using AbstractDAO's basic methods (insert/update), these fields are set automatically. Manual setting is prohibited

## Field Types

- Strings: `String`
- Dates/timestamps: `java.sql.Timestamp` (do not use `java.util.Date` or `java.time.LocalDateTime` — not supported by Mirage ORM)
- Integers: `int` (small values), `long` (large values / IDs) — match the DDL type
- Decimals/amounts: `java.math.BigDecimal` (**Required** — `double`/`float` have rounding errors and must not be used for monetary or precision calculations)
- Flags: `String` (e.g. "0"/"1", matching the DB column. Do not map to Java `boolean`)
- Enumerated values: `String` (store the DB column value as-is. Conversion to a Java enum is done at the domain model layer)

### DB Type → Java Type Mapping

| DB Type | Java Type | Notes |
|---|---|---|
| VARCHAR / NVARCHAR | `String` | |
| TIMESTAMP / DATETIME | `java.sql.Timestamp` | |
| INTEGER / INT | `int` or `long` | |
| DECIMAL / NUMERIC | `java.math.BigDecimal` | double prohibited |
| CHAR(1) flag | `String` | "0"/"1" |

## Null Handling

- Entity public fields are nullable (corresponding to the DB's NULLABLE)
- Even for fields that correspond to NOT NULL columns, do not impose null constraints on the Java side (constraints are guaranteed at the DAO layer / DB side)

## Differences Between Entity and Domain Model

| Aspect | Entity | Domain Model |
|---|---|---|
| Layer | Infrastructure layer | Domain layer |
| Purpose | 1:1 mapping to a DB table | Represents business logic |
| Fields | Public fields (ORM requirement) | Private fields + getters |
| Mutability | Mutable (ORM sets values) | Immutable recommended |
| Validation | None (relies on DB constraints) | Implements business rules |
| Conversion | Converted to/from each other at the repository layer | Converted to/from each other at the repository layer |

An entity is a reflection of the DB structure and must not hold business logic. Business logic should be implemented in the domain model.
