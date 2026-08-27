---
name: java-im-mirage-usage
description: intra-mart 固有の DB アクセス基盤である im_mirage（`jp.co.intra_mart.mirage.*`、Mirage-SQL の intra-mart 内製版）を Java（JavaEE 開発モデル）で使用するためのスキルセット。エンティティクラス（`@Table`/`@Column`/`@PrimaryKey`）、DAOクラス（`AbstractDAO` 継承・`DAOFactory` によるインスタンス取得）、2WaySQL の SQLファイル（`/*IF*/`/`/*BEGIN*/`/`/*param*/`/`/*FOR*/`）、`SqlManager` によるクエリ実行（`getResultList`/`getSingleResult`/`executeUpdate`/エンティティCRUD）、`SessionTemplate`/`SessionCallback` によるトランザクション管理、DB方言別 SQL ファイル（`_oracle.sql`/`_sqlserver.sql` 等）の実装パターンを提供する。Java で im_mirage を使いたい、Java で AbstractDAO / DAOFactory / SqlManager を使いたい、JavaEE 開発モデルで DB アクセス処理を実装したい、Mirage の DAO・エンティティを作りたい、Java 側で 2WaySQL の SQL ファイルを書きたい、と言及されたときに使用。JSSP（スクリプト開発モデル）で DB アクセスを行う場合は `jssp-page-generator`（`TenantDatabase`/`SharedDatabase` API・`jssp-2way-sql.md` 規約）を使うこと。両者は開発モデルが異なり実装は完全に独立している。
---

# intra-mart im_mirage Usage Support Skill (Java Edition)

## Purpose

A skillset for implementing entity classes, DAO classes, and 2WaySQL SQL files using im_mirage (`jp.co.intra_mart.mirage.*`), the DB access foundation provided by intra-mart Accel Platform for the **JavaEE development model**.

## About im_mirage (Important Premise)

**"IM-Mirage" is not an official product name.** In reality, it is an in-house fork in which intra-mart pulled the OSS 2WaySQL O/R mapper Mirage-SQL into its own namespace (`jp.co.intra_mart.mirage.*`); the module name is `im_mirage`. This skill uses the notation "im_mirage" to match the project's common usage.

## Basic Architecture (Most Important)

```
Entity class (@Table/@Column/@PrimaryKey)
        ↓
DAO interface DAO<T>
        ↓
BaseDAO<T> implements DAO<T>        … holds a protected IntramartSqlManager sqlManager (provided by the platform, inherit only)
        ↓
AbstractDAO<T> extends BaseDAO<T>   … common implementation of insert/update/delete/find (auto-sets audit fields)
        ↓
Concrete DAO (e.g. XxxDAO extends AbstractDAO<XxxEntity>) … adds custom query methods
        ↑ obtained via
DAOFactory.getTenantDatabaseDAO(XxxDAO.class) / getSharedDatabaseDAO(XxxDAO.class, connectId)
        ↑ transaction boundary
SessionTemplate.execute(new SessionCallback<T, E>() { ... })
```

- **Entity classes follow the conventions in `.agents/requirements/java-entity/AGENTS.md`.** Public fields, a no-argument constructor, `GenerationType.APPLICATION`, and the like are rules this project defines in that convention document; this skill fulfills them as part of the im_mirage implementation
- **The correspondence between class names and table names is an aspirational goal, not an enforced rule.** As a baseline, take the table name (snake_case) and convert it straightforwardly to PascalCase, but for table names that include platform-side module prefixes or abbreviations (e.g. `b_m_account_b`), a freer, readability-first translation is acceptable. Even when translated freely, spell out the actual table name in both `@Table(name = "...")` and the class JavaDoc so the correspondence stays traceable (see Pattern 1 in `assets/mirage-basic-usage.md` for details)
- **Extending `AbstractDAO` causes the audit fields (`createUserCd`/`createDate`/`recordUserCd`/`recordDate`) to be set automatically on insert/update.** Setting them manually is unnecessary and discouraged (also stated explicitly in `.agents/requirements/java-entity/AGENTS.md`)
- **Never `new` a DAO instance directly — always obtain it via `DAOFactory`.** This is because instances are cached in a thread-local and automatically released when the session is freed
- **DAOs should further be wrapped in a Repository class (`Xxx` + `Repository`/`StandardXxxRepository`) and invoked from a Service class (`Xxx` + `Service`/`StandardXxxService`, the business logic layer).** When used from a REST API, the Endpoint class (the Web API Maker's entry point) never calls the Repository/DAO directly (the order is `Endpoint → Service → Repository → DAO`)
- **Both Repository and Service are structured as a set of three: an interface + a Standard implementation class + a factory class.** Callers do not instantiate directly with `new StandardXxx()`; they obtain the instance via `XxxFactory.getInstance()`. Internally, the factory class uses `ServiceLoaderUtil.loadTopPriority`, using a higher-priority implementation registered under `META-INF/services` if one exists, and falling back to the Standard implementation otherwise (see "Factory Classes for Repository/Service" for details)

### Division of Responsibility Among Repository / Service / Endpoint

| Layer | Calls | Transaction Boundary | Responsibility |
|---|---|---|---|
| Repository | DAO | Sets its own boundary with `SessionTemplate.execute` | Tightly coupled to the DAO. Write operations (insert/update/delete) are basically processed one record (one Entity) at a time. SELECT may return a list of all matching records |
| Service | Repository (may be multiple) | Sets its own boundary with `SessionTemplate.execute` **only when combining multiple Repository method calls into a single operation** | When it completes with a single Repository method call, it becomes a thin wrapper around that Repository (in this case `SessionTemplate` is unnecessary on the Service side — the boundary on the Repository side is sufficient) |
| Endpoint (Web API Maker) | Service | Has none (does not use `SessionTemplate` directly) | The first entry point when accessed by URL. See `java-im-web-api-maker-usage` for the implementation |

- **The Service should set its own transaction boundary with `SessionTemplate.execute` only when combining multiple Repository method calls into a single operation.** If it is merely a thin wrapper calling a single Repository method, the boundary on the Repository side is sufficient and there is no need to set one again on the Service side
- **When spanning multiple Repositories, `SessionTemplate` detects nested calls, so an inner (Repository) `execute` invoked inside a transaction already begun by the outer (Service) does not commit/rollback and defers to the outer one — meaning it is treated as a single transaction even when nested multiple levels deep**
- For concrete Service class implementation patterns (a registration process spanning multiple Repositories, a thin wrapper around a single Repository), see "Pattern 7: Service Layer" in `assets/mirage-basic-usage.md`

### Factory Classes for Repository/Service (`ServiceLoaderUtil`)

Repository and Service instances are not instantiated directly with `new StandardXxx()`; they are obtained via a factory class called `XxxFactory.getInstance()`. Internally, the factory class uses `jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil#loadTopPriority`, returning the higher-priority (`@Priority`) implementation registered under `META-INF/services/<FQN of the interface>` if one exists, and falling back to the default Standard implementation otherwise.

- **Use `loadTopPriority` to obtain a single instance.** `loadPriority` is a method that returns all registered implementations as a priority-ordered `Collection`; using it to resolve a single implementation forces the caller to pull out the first element every time, which is redundant (see `ServiceLoaderUtil` in `reference/mirage-api-reference.md`)
- With this structure, another module (such as a plugin) can simply register a higher-priority implementation under `META-INF/services` to swap the implementation without changing any caller code
- For concrete implementation patterns, see "Pattern 6: Transaction Management and the Repository Layer" and "Pattern 7: Service Layer" in `assets/mirage-basic-usage.md`

## Conventions to Reference

| Convention | Handling |
|------|---------|
| `.agents/requirements/java-entity/AGENTS.md` | 🟢 **Required reading** — entity class design conventions (public fields, audit fields, type mapping table) |
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **Required reading** — package, class, method, and variable naming |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **Required reading** — class/method JavaDoc |

`jssp-*` conventions are out of scope for this skill (do not apply to Java files).

## Boundaries with Other Skills (Important)

**This skill covers only "DB access in Java (JavaEE development model) using im_mirage."** This is fundamentally different in development model from JSSP (script development model) DB access — the API, how SQL is written, and how it is invoked are entirely different — so do not conflate the two implementations.

| What you want to build | Responsible skill |
|------|-----------|
| Implementation of entities, DAOs, and SQL files in Java (JavaEE development model) | **This skill** |
| The `TenantDatabase`/`SharedDatabase` API and 2WaySQL (`executeByTemplate`) in JSSP (script development model) | `jssp-page-generator` + `.agents/requirements/jssp-2way-sql/AGENTS.md` (out of scope for this skill) |
| Creating the DDL (`CREATE TABLE` statements) itself | Out of scope for this skill. DB-product-specific types and DDL syntax follow the existing DB design policy (this skill specializes in implementing entities, DAOs, and SQL files, and does not generate table definitions) |

When combining with other `java-im-*` skills (e.g. `java-im-web-api-maker-usage`) for something like "I want to operate the DB from a REST API," use this skill only for the DB access portion and delegate the API portion to the relevant skill.

## API Overview

For the classes, annotations, and signatures under the `jp.co.intra_mart.mirage.*` package, see `reference/mirage-api-reference.md` (do not write these from memory or guesswork).

Key points:
- **The SQL-file-based methods of `SqlManager` (`getResultList`/`getSingleResult`/`getCount`/`executeUpdate`/`iterate`) execute 2WaySQL templates.** By contrast, the `xxxBySql` family of methods (e.g. `getResultListBySql`) execute **plain SQL strings** with `?` placeholders — **not** 2WaySQL. Do not confuse the two
- **SQL files automatically resolve DB-dialect-specific files.** For `select_xxx.sql`, if `select_xxx_oracle.sql` (Oracle) / `select_xxx_postgre.sql` (PostgreSQL) / `select_xxx_sqlserver.sql` (SQLServer) exist, they take priority; otherwise it falls back to the original file. Add dialect-specific files only when there is an actual dialect difference (you do not need to prepare one for every dialect)
- **The `/*FOR item : list*/.../*END*/` loop syntax is usable in im_mirage.** It is not supported in JSSP (script development model) 2WaySQL, so be careful when reusing JSSP-side implementations

## Generation Targets and Templates

| Generation target | Template | Content |
|---------|------------|------|
| Entity class | `assets/mirage-basic-usage.md` | Implementation of `@Table`/`@Column`/`@PrimaryKey`, audit fields |
| DAO class (basic CRUD) | `assets/mirage-basic-usage.md` | Extending `AbstractDAO`, obtaining an instance via `DAOFactory` |
| DAO class (custom queries) | `assets/mirage-basic-usage.md` | SQL file path constants, calls to `sqlManager.getResultList`/`getSingleResult`, etc. |
| 2WaySQL SQL file | `assets/mirage-basic-usage.md` | `/*IF*/`/`/*BEGIN*/`/`/*param*/`/`/*FOR*/` syntax, dialect-specific files |
| Transaction management | `assets/mirage-basic-usage.md` | Implementation pattern for `SessionTemplate.execute(SessionCallback)` |
| Repository layer (recommended pattern) | `assets/mirage-basic-usage.md` | Encapsulating DAO calls behind a Repository interface + Standard implementation class, and a factory class via `ServiceLoaderUtil` |
| Service layer | `assets/mirage-basic-usage.md` | Unifying a registration process spanning multiple Repositories into a single transaction, a thin wrapper around a single Repository, and a factory class via `ServiceLoaderUtil` |

### References

- `reference/mirage-api-reference.md` — Full signatures and attributes for `SqlManager`/`AbstractDAO`/`DAOFactory`/entity annotations (`@Table`/`@Column`/`@PrimaryKey`), and the list of DB dialect names (based on the definitions in the actual platform source — do not write from memory)

## When to Use

When the user makes a request such as:
- "I want to build DB access processing in Java using im_mirage"
- "I want to use `AbstractDAO`/`DAOFactory`/`SqlManager` in the JavaEE development model"
- "I want to create Mirage entity classes and DAO classes"
- "I want to write 2WaySQL SQL files on the Java side"

If there is no explicit mention of "in Java" or "in the JavaEE development model," ask the user to confirm the project's development model (JSSP/Java).

If the user simply says "I want to build DB access processing" without specifying the development model, route to `jssp-page-generator` for JSSP (script development model) or to this skill for Java (JavaEE development model).

## Implementation Steps

1. Interview the user for requirements (target table/column composition, tenant DB vs. shared DB, the types of queries needed)
2. Design and implement the entity class following `.agents/requirements/java-entity/AGENTS.md` (`@Table`/`@Column`/`@PrimaryKey`, the 4 audit fields)
3. Refer to `assets/mirage-basic-usage.md` to implement the DAO class (extend `AbstractDAO<EntityType>`. If custom queries are needed, add SQL file path constants and calling methods. Always refer to `reference/mirage-api-reference.md` for method signatures — do not write them from memory or guesswork)
4. If there are custom queries, create the 2WaySQL SQL file (add dialect-specific files only when there is an actual DB dialect difference)
5. Implement the Repository as a set of three — interface + Standard implementation class + factory class (using `ServiceLoaderUtil.loadTopPriority`) — and wrap the DAO calls in a transaction boundary via `SessionTemplate.execute(SessionCallback)`
6. If there is processing that spans multiple Repositories, likewise create the Service as a set of three — interface + Standard implementation class + factory class — and, within the Service's own `SessionTemplate.execute` transaction boundary, call each Repository (obtained via `XxxRepositoryFactory.getInstance()`) (if it completes with a single Repository method call, `SessionTemplate` is unnecessary on the Service side — a thin wrapper relying on the Repository-side boundary is sufficient)
7. Confirm compliance with `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **Do not instantiate a DAO directly with `new`.** Use `DAOFactory.getTenantDatabaseDAO(...)`/`getSharedDatabaseDAO(...)`. Directly `new`-ing it leaves the `sqlManager` field unset, resulting in a `NullPointerException`
- **Do not manually set the audit fields (`createUserCd`/`createDate`/`recordUserCd`/`recordDate`).** `AbstractDAO#insert`/`update` sets them automatically, and manual setting can cause unintended overwrites
- **Do not confuse `SqlManager`'s SQL-file-based methods with the `xxxBySql` family of methods.** The former uses 2WaySQL templates (specified by file path), while the latter uses plain SQL strings (`?` placeholders) — parameter handling also differs
- **Execute DB update processing within the transaction boundary of `SessionTemplate.execute(SessionCallback)`.** Executing it outside the boundary may result in an auto-commit granularity that is not what was intended
- **The `/*FOR*/` syntax is exclusive to im_mirage.** JSSP-side 2WaySQL files cannot be reused as-is (see `jssp-2way-sql.md`)
- **Create dialect-specific SQL files only when there is an actual difference.** Mechanically duplicating files for every dialect reduces maintainability. If the base file can handle all dialects, leave it as is
- **Place SQL files under `src/main/resources`, not `src/main/java`, using the same package path as the DAO class.** Placing them in `src/main/java` excludes them from the runtime classpath, causing a `resource: xxx.sql is not found.` error. Note that in the platform's standard-feature source tree, `.java` and `.sql` files appearing to coexist in the same directory reflects the pre-build repository layout, which differs from the placement location under the Maven standard layout (an easy place to miss in implementation)

## Post-Generation Verification

A dedicated verification script equivalent to the JSSP edition (`validate-jssp-code.js`) is not yet in place at this time. Confirm the following manually.

1. Whether the entity class complies with `.agents/requirements/java-entity/AGENTS.md` (public fields, no-argument constructor, `GenerationType.APPLICATION`, the 4 audit fields)
2. Whether the DAO class extends `AbstractDAO<EntityType>`, and that it does not independently declare a `sqlManager` field (already provided on the `BaseDAO` side)
3. Whether the DAO is obtained via `DAOFactory.getTenantDatabaseDAO`/`getSharedDatabaseDAO` (and not via `new XxxDAO()`)
4. Whether the DAO is invoked via a Repository class (when used from a REST API, whether the Endpoint/Service class calls the DAO directly — the order should be `Endpoint → Service → Repository → DAO`)
5. Whether the audit fields are being manually set on the DAO-calling side
6. Whether the SQL-file-based methods (`getResultList`, etc.) and the `xxxBySql` family of methods are used appropriately
7. Whether update processing is within the transaction boundary of `SessionTemplate.execute(SessionCallback)`
8. Whether SQL files are placed under `src/main/resources` (using the same package path as the DAO class) (and not under `src/main/java`)
9. Whether processing spanning multiple Repositories is executed together within the Service's own `SessionTemplate.execute` transaction boundary (and not committed in separate transactions per Repository)
10. Whether a Service method that completes with a single Repository method call avoids an unnecessary redundant layering of `SessionTemplate.execute` (whether it passes through on the Service side when the Repository-side boundary is sufficient)
11. Whether the Endpoint (Web API Maker) class avoids calling `SessionTemplate`/`DAOFactory` directly and always goes through the Service
12. Whether the Repository and Service are structured as a set of three — interface + Standard implementation class + factory class — and whether callers obtain the instance via `XxxFactory.getInstance()` rather than instantiating directly with `new StandardXxx()`
13. Whether the factory class implementation uses `loadTopPriority` (which returns a single instance) rather than `ServiceLoaderUtil.loadPriority` (which returns a `Collection`)
14. Whether it complies with `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`
15. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project separately has a Java-oriented code review/security check skill, use that instead

## Boundaries with Other Skills

| Responsibility | Responsible skill |
|------|-----------|
| **Implementation of entities, DAOs, and SQL files via im_mirage in Java (JavaEE development model)** | **This skill** |
| The `TenantDatabase`/`SharedDatabase` API and 2WaySQL in JSSP (script development model) | `jssp-page-generator` + `.agents/requirements/jssp-2way-sql/AGENTS.md` |
| REST API implementation via Web API Maker in Java (JavaEE development model) | `java-im-web-api-maker-usage` |
| CRUD of authorization (IM-Authz) resources, subjects, and policies in Java | `java-im-authz-usage` |
| File operations (`PublicStorage`, etc.) in Java | `java-im-storage-usage` |
