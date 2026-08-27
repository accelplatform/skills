---
name: java-im-mirage-usage
description: intra-mart 固有の DB アクセス基盤である im_mirage（`jp.co.intra_mart.mirage.*`、Mirage-SQL の intra-mart 内製版）を Java（JavaEE 開発モデル）で使用するためのスキルセット。エンティティクラス（`@Table`/`@Column`/`@PrimaryKey`）、DAOクラス（`AbstractDAO` 継承・`DAOFactory` によるインスタンス取得）、2WaySQL の SQLファイル（`/*IF*/`/`/*BEGIN*/`/`/*param*/`/`/*FOR*/`）、`SqlManager` によるクエリ実行（`getResultList`/`getSingleResult`/`executeUpdate`/エンティティCRUD）、`SessionTemplate`/`SessionCallback` によるトランザクション管理、DB方言別 SQL ファイル（`_oracle.sql`/`_sqlserver.sql` 等）の実装パターンを提供する。Java で im_mirage を使いたい、Java で AbstractDAO / DAOFactory / SqlManager を使いたい、JavaEE 開発モデルで DB アクセス処理を実装したい、Mirage の DAO・エンティティを作りたい、Java 側で 2WaySQL の SQL ファイルを書きたい、と言及されたときに使用。JSSP（スクリプト開発モデル）で DB アクセスを行う場合は `jssp-page-generator`（`TenantDatabase`/`SharedDatabase` API・`jssp-2way-sql.md` 規約）を使うこと。両者は開発モデルが異なり実装は完全に独立している。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart im_mirage 使用支援技能（Java 版）

## 目的

使用 intra-mart Accel Platform 提供的面向 **JavaEE 开发模型** 的数据库访问基础设施 im_mirage（`jp.co.intra_mart.mirage.*`），用于实现实体类、DAO 类、2WaySQL 的 SQL 文件的技能集。

## 关于 im_mirage（重要前提）

**「IM-Mirage」并非官方产品名称。** 其实体是将 OSS 的 2WaySQL O/R 映射框架 Mirage-SQL 纳入 intra-mart 自身命名空间（`jp.co.intra_mart.mirage.*`）后形成的内部分支，模块名为 `im_mirage`。本技能按照项目内的通称，统一记作「im_mirage」。

## 基本架构（最重要）

```
实体类（@Table/@Column/@PrimaryKey）
        ↓
DAO 接口 DAO<T>
        ↓
BaseDAO<T> implements DAO<T>        … 持有 protected IntramartSqlManager sqlManager（平台提供，仅供继承）
        ↓
AbstractDAO<T> extends BaseDAO<T>   … insert/update/delete/find 的通用实现（自动设置审计字段）
        ↓
具体 DAO（例: XxxDAO extends AbstractDAO<XxxEntity>）… 添加自定义查询方法
        ↑ 获取
DAOFactory.getTenantDatabaseDAO(XxxDAO.class) / getSharedDatabaseDAO(XxxDAO.class, connectId)
        ↑ 事务边界
SessionTemplate.execute(new SessionCallback<T, E>() { ... })
```

- **实体类应遵循 `.github/instructions/java-entity.instructions.md` 的规约。** public 字段、无参构造函数、`GenerationType.APPLICATION` 等是该规约为本项目制定的规则，本技能只是在 im_mirage 的实现层面加以满足
- **类名与表名的对应关系是尽力而为的目标（并非强制规则）。** 以将表名（蛇形命名）直接转换为帕斯卡命名的名称作为基本原则，但对于包含平台侧模块前缀・缩写的表名（例如：`b_m_account_b`），可以优先考虑可读性进行意译。即使采用了意译，也应在 `@Table(name = "...")` 和类 JavaDoc 中明确记载实际表名，以确保对应关系可追溯（详见 `assets/mirage-basic-usage.md` 的「模式1」）
- **继承 `AbstractDAO` 后，insert/update 时会自动设置审计字段（`createUserCd`/`createDate`/`recordUserCd`/`recordDate`）。** 无需手动设置，且不推荐手动设置（`.github/instructions/java-entity.instructions.md` 中也有明确说明）
- **DAO 实例不要 `new`，必须通过 `DAOFactory` 获取。** 因为其设计为在线程本地缓存，并在会话释放时自动释放
- **DAO 应进一步用 Repository 类（`Xxx` + `Repository`/`StandardXxxRepository`）封装，由 Service 类（`Xxx` + `Service`/`StandardXxxService`，业务逻辑层）调用。** 从 REST API 使用时，Endpoint 类（Web API Maker 的入口）不会直接调用 Repository/DAO（遵循 `Endpoint → Service → Repository → DAO` 的顺序）
- **Repository・Service 均采用「接口 + Standard 实现类 + 工厂类」的三件套结构。** 调用方不通过 `new StandardXxx()` 直接生成，而是通过 `XxxFactory.getInstance()` 获取。工厂类内部使用 `ServiceLoaderUtil.loadTopPriority`，若 `META-INF/services` 中注册了优先级更高的实现则使用该实现，若无则回退到 Standard 实现（详见「Repository/Service 的工厂类」）

### Repository / Service / Endpoint 的职责划分

| 层 | 调用对象 | 事务边界 | 职责 |
|---|---|---|---|
| Repository | DAO | 通过 `SessionTemplate.execute` 自行划定边界 | 与 DAO 紧密耦合。写入类处理（insert/update/delete）基本以单条（单个 Entity）为单位处理。仅 SELECT 时可以列表形式返回所有符合条件的记录 |
| Service | Repository（可多个） | **仅当需要将多个 Repository 方法整合为一个操作时** 才通过 `SessionTemplate.execute` 自行划定边界 | 若仅调用单个 Repository 方法即可完成，则作为该 Repository 的薄封装（此时 Service 侧无需 `SessionTemplate`，仅靠 Repository 侧的边界即可） |
| Endpoint（Web API Maker） | Service | 不持有（不直接使用 `SessionTemplate`） | URL 访问时的最初入口点。具体实现参见 `java-im-web-api-maker-usage` |

- **Service 通过 `SessionTemplate.execute` 自行划定事务边界，仅限于需要将多个 Repository 方法调用整合为一个操作的场景。** 若只是调用单个 Repository 方法的薄封装，Repository 侧的边界已足够，Service 侧无需重复划定
- **在跨多个 Repository 的场景下，`SessionTemplate` 会检测嵌套调用：在外层（Service）已开始的事务中被调用的内层（Repository）的 `execute` 不会执行 commit/rollback，而是委托给外层处理，因此即使多层嵌套也会被当作一个事务处理**
- 具体的 Service 类实现模式（跨多个 Repository 的登记处理、单个 Repository 的薄封装）请参见 `assets/mirage-basic-usage.md` 的「模式7: Service 层」

### Repository/Service 的工厂类（`ServiceLoaderUtil`）

Repository・Service 的实例不通过 `new StandardXxx()` 直接生成，而是通过名为 `XxxFactory.getInstance()` 的工厂类获取。工厂类内部使用 `jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil#loadTopPriority`，若 `META-INF/services/<接口的FQN>` 中注册了优先级（`@Priority`）更高的实现则返回该实现，若无则回退到默认的 Standard 实现并返回。

- **获取单一实例时使用 `loadTopPriority`。** `loadPriority` 是返回按优先级排序的全部已注册实现的 `Collection` 的方法，若用于解析单一实现，调用方每次都需要取出首个元素，较为冗余（参见 `reference/mirage-api-reference.md` 中的 `ServiceLoaderUtil`）
- 通过这种结构，其他模块（插件等）只需在 `META-INF/services` 中注册优先级更高的实现，即可在不修改调用方代码的情况下替换实现
- 具体的实现模式请参见 `assets/mirage-basic-usage.md` 的「模式6: 事务管理与 Repository 层」「模式7: Service 层」

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/java-entity.instructions.md` | 🟢 **必读** — 实体类的设计规约（public 字段・审计字段・类型对应表） |
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 JavaDoc |

`jssp-*` 系列规约不在本技能的适用范围内（不适用于 Java 文件）。

## 与其他技能的边界（重要）

**本技能仅涉及「在 Java（JavaEE 开发模型）中使用 im_mirage 进行数据库访问」。** 这与 JSSP（脚本开发模型）的数据库访问在开发模型上根本不同，API、SQL 写法、调用方式完全不同，切勿混淆实现。

| 想要制作的内容 | 负责技能 |
|------|-----------|
| 在 Java（JavaEE 开发模型）中实现实体・DAO・SQL 文件 | **本技能** |
| 在 JSSP（脚本开发模型）中使用 `TenantDatabase`/`SharedDatabase` API・2WaySQL（`executeByTemplate`） | `jssp-page-generator` + `.github/instructions/jssp-2way-sql.instructions.md`（不在本技能范围内） |
| 新建 DDL（`CREATE TABLE` 语句）本身 | 不在本技能范围内。各数据库产品的类型・DDL 语法遵循既有的数据库设计方针（本技能专注于实体・DAO・SQL 文件的实现，不生成表定义） |

若需与其他 `java-im-*` 技能（如 `java-im-web-api-maker-usage`）组合使用（例如「想从 REST API 操作数据库」），数据库访问部分使用本技能，API 部分则交给对应技能负责。

## API 概要

`jp.co.intra_mart.mirage.*` 包下的类・注解・签名请参考 `reference/mirage-api-reference.md`（不要凭记忆或推测编写）。

主要要点：
- **`SqlManager` 的 SQL 文件系方法（`getResultList`/`getSingleResult`/`getCount`/`executeUpdate`/`iterate`）用于执行 2WaySQL 模板。** 另一方面，`xxxBySql` 系方法（`getResultListBySql` 等）执行的是**非 2WaySQL** 的原生 SQL 字符串 + `?` 占位符。两者不可混淆
- **SQL 文件会自动解析各数据库方言对应的文件。** 对于 `select_xxx.sql`，若存在 `select_xxx_oracle.sql`（Oracle）/`select_xxx_postgre.sql`（PostgreSQL）/`select_xxx_sqlserver.sql`（SQLServer），则优先使用对应文件，不存在时回退到原始文件。仅在存在方言差异时才需要添加方言专用文件（无需为所有方言都准备文件）
- **`/*FOR item : list*/.../*END*/` 循环语法在 im_mirage 中可用。** JSSP（脚本开发模型）的 2WaySQL 不支持此语法，复用 JSSP 侧实现时需注意

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 实体类 | `assets/mirage-basic-usage.md` | `@Table`/`@Column`/`@PrimaryKey` 的实现、审计字段 |
| DAO 类（基本 CRUD） | `assets/mirage-basic-usage.md` | 继承 `AbstractDAO`、通过 `DAOFactory` 获取实例 |
| DAO 类（自定义查询） | `assets/mirage-basic-usage.md` | SQL 文件路径常量、调用 `sqlManager.getResultList`/`getSingleResult` 等 |
| 2WaySQL 的 SQL 文件 | `assets/mirage-basic-usage.md` | `/*IF*/`/`/*BEGIN*/`/`/*param*/`/`/*FOR*/` 语法、方言专用文件 |
| 事务管理 | `assets/mirage-basic-usage.md` | `SessionTemplate.execute(SessionCallback)` 的实现模式 |
| Repository 层（推荐模式） | `assets/mirage-basic-usage.md` | 通过 Repository 接口 + Standard 实现类封装 DAO 调用、通过 `ServiceLoaderUtil` 实现工厂类 |
| Service 层 | `assets/mirage-basic-usage.md` | 跨多个 Repository 的登记处理的同一事务化、单个 Repository 的薄封装、通过 `ServiceLoaderUtil` 实现工厂类 |

### 参考资料

- `reference/mirage-api-reference.md` — `SqlManager`/`AbstractDAO`/`DAOFactory`/实体注解（`@Table`/`@Column`/`@PrimaryKey`）的完整签名・属性、数据库方言名称一览（基于平台实际源码的定义，不可凭记忆编写）

## 使用时机

用户提出以下类型请求时：
- 「想在 Java 中使用 im_mirage 制作数据库访问处理」
- 「想在 JavaEE 开发模型中使用 `AbstractDAO`/`DAOFactory`/`SqlManager`」
- 「想制作 Mirage 的实体类・DAO 类」
- 「想在 Java 侧编写 2WaySQL 的 SQL 文件」

若未明确「用 Java」「在 JavaEE 开发模型中」等，需向用户确认项目的开发模型（JSSP/Java）。

若仅被告知「想制作数据库访问处理」而开发模型不明，JSSP（脚本开发模型）时分配给 `jssp-page-generator`，Java（JavaEE 开发模型）时分配给本技能。

## 实现步骤

1. 听取用户需求（目标表・列构成、租户数据库/共享数据库、所需查询种类）
2. 按照 `.github/instructions/java-entity.instructions.md` 设计并实现实体类（`@Table`/`@Column`/`@PrimaryKey`、4 个审计字段）
3. 参考 `assets/mirage-basic-usage.md` 实现 DAO 类（继承 `AbstractDAO<实体类型>`。需要自定义查询时添加 SQL 文件路径常量与调用方法。方法签名务必参考 `reference/mirage-api-reference.md`，不可凭记忆或推测编写）
4. 若存在自定义查询，创建 2WaySQL 的 SQL 文件（仅在存在数据库方言差异时才添加方言专用文件）
5. 将 Repository 以「接口 + Standard 实现类 + 工厂类（使用 `ServiceLoaderUtil.loadTopPriority`）」的三件套结构实现，并通过 `SessionTemplate.execute(SessionCallback)` 的事务边界包装 DAO 调用
6. 若存在跨多个 Repository 的处理，同样以「接口 + Standard 实现类 + 工厂类」的三件套结构创建 Service，在 Service 自身的 `SessionTemplate.execute` 事务边界内调用各 Repository（通过 `XxxRepositoryFactory.getInstance()` 获取）（若仅调用单个 Repository 方法即可完成，则 Service 侧无需 `SessionTemplate`，作为仅靠 Repository 侧边界即可的薄封装）
7. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **不要用 `new` 直接生成 DAO 实例。** 应使用 `DAOFactory.getTenantDatabaseDAO(...)`/`getSharedDatabaseDAO(...)`。直接 `new` 会导致 `sqlManager` 字段未设置，从而引发 `NullPointerException`
- **不要手动设置审计字段（`createUserCd`/`createDate`/`recordUserCd`/`recordDate`）。** 因为 `AbstractDAO#insert`/`update` 会自动设置，手动设置可能导致意外覆盖
- **不要混淆 `SqlManager` 的 SQL 文件系方法与 `xxxBySql` 系方法。** 前者是 2WaySQL 模板（指定文件路径），后者是原生 SQL 字符串（`?` 占位符），参数处理方式也不同
- **数据库更新处理应在 `SessionTemplate.execute(SessionCallback)` 的事务边界内执行。** 若在边界外执行，自动提交的单位可能无法达到预期的粒度
- **`/*FOR*/` 语法为 im_mirage 专用。** 不能直接沿用 JSSP 侧的 2WaySQL 文件（参见 `jssp-2way-sql.md`）
- **数据库方言专用 SQL 文件仅在存在差异时才创建。** 机械地为所有方言复制文件会降低可维护性。若基础文件即可覆盖所有方言，保持原样即可
- **SQL 文件应配置在 `src/main/resources` 下，而非 `src/main/java`，且与 DAO 类使用相同的包路径。** 放在 `src/main/java` 下不会包含在运行时类路径中，会导致 `resource: xxx.sql is not found.` 错误。平台标准功能的源码树中 `.java` 与 `.sql` 看似位于同一目录下，那是构建前的仓库结构，与 Maven 标准布局的部署位置不同，需注意这一点（容易出现遗漏实现的地方）

## 生成后的确认

尚未整备类似 JSSP 版的专用验证脚本（相当于 `validate-jssp-code.js`）。请手动确认以下事项。

1. 实体类是否符合 `.github/instructions/java-entity.instructions.md`（public 字段・无参构造函数・`GenerationType.APPLICATION`・4 个审计字段）
2. DAO 类是否继承了 `AbstractDAO<实体类型>`，是否未自行重复声明 `sqlManager` 字段（`BaseDAO` 侧已提供）
3. DAO 的获取是否通过 `DAOFactory.getTenantDatabaseDAO`/`getSharedDatabaseDAO`（而非 `new XxxDAO()`）
4. DAO 是否经由 Repository 类调用（从 REST API 使用时，Endpoint/Service 类是否未直接调用 DAO。是否遵循 `Endpoint → Service → Repository → DAO` 的顺序）
5. 调用 DAO 一侧是否未手动设置审计字段
6. SQL 文件系方法（`getResultList` 等）与 `xxxBySql` 系方法的使用区分是否恰当
7. 更新类处理是否位于 `SessionTemplate.execute(SessionCallback)` 的事务边界内
8. SQL 文件是否配置在 `src/main/resources` 下（与 DAO 类相同的包路径）（是否未放置在 `src/main/java` 下）
9. 跨多个 Repository 的处理是否统一在 Service 自身的 `SessionTemplate.execute` 事务边界内执行（是否未按 Repository 分别提交事务）
10. 对于仅调用单个 Repository 方法即可完成的 Service 方法，是否存在不必要的重复 `SessionTemplate.execute` 封装（若 Repository 侧边界已足够，Service 侧应直接透传）
11. Endpoint（Web API Maker）类是否未直接调用 `SessionTemplate`/`DAOFactory`，而是必定经由 Service
12. Repository・Service 是否采用「接口 + Standard 实现类 + 工厂类」的三件套结构，调用方是否未通过 `new StandardXxx()` 直接生成，而是使用 `XxxFactory.getInstance()`
13. 工厂类的实现是否使用了返回单一实例的 `loadTopPriority`，而非返回 `Collection` 的 `ServiceLoaderUtil.loadPriority`
14. 是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
15. `jssp-code-review` / `jssp-security-check` 是 JSSP 专用技能，不适用于本技能的生成物。若项目中另有针对 Java 的代码审查・安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **在 Java（JavaEE 开发模型）中通过 im_mirage 实现实体・DAO・SQL 文件** | **本技能** |
| 在 JSSP（脚本开发模型）中使用 `TenantDatabase`/`SharedDatabase` API・2WaySQL | `jssp-page-generator` + `.github/instructions/jssp-2way-sql.instructions.md` |
| 在 Java（JavaEE 开发模型）中通过 Web API Maker 实现 REST API | `java-im-web-api-maker-usage` |
| 在 Java 中进行认可（IM-Authz）资源・主体・策略的 CRUD | `java-im-authz-usage` |
| 在 Java 中进行文件操作（`PublicStorage` 等） | `java-im-storage-usage` |
</content>
