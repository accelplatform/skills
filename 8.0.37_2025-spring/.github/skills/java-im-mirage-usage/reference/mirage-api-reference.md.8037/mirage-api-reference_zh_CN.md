# im_mirage API 参考手册（Java 版）

基于 intra-mart Accel Platform 核心源码（`im_mirage` 模块，`jp.co.intra_mart.mirage.*`）的实际类定义编写。请勿凭记忆或推测补充方法・属性。

## 包结构

```
jp.co.intra_mart.mirage.annotation
├── Table       … 附加于实体类，用于指定表名
├── Column      … 附加于字段/方法，用于指定列名
├── PrimaryKey  … 表示该项为主键。持有 GenerationType（枚举）
├── Transient   … 指定不作为映射对象的属性
└── In / InOut / Out / ResultSet … 调用存储过程时的参数方向指定

jp.co.intra_mart.mirage
├── SqlManager (接口)                   … SQL 执行的核心 API
├── SqlManagerImpl                      … SqlManager 的标准实现（由 IntramartSqlManager 继承）
└── IterationCallback<T, R>             … 逐条处理大量数据时使用的回调

jp.co.intra_mart.mirage.ext
└── IntramartSqlManager extends SqlManagerImpl … 面向 intra-mart 的扩展（新增 SQL 文件的数据库方言解析）

jp.co.intra_mart.mirage.ext.dao
├── DAO<T> (接口)                       … DAO 的基础接口
├── BaseDAO<T> implements DAO<T>        … 持有 protected IntramartSqlManager sqlManager 字段
├── AbstractDAO<T> extends BaseDAO<T>   … insert/update/delete/find 的通用实现（自动设置审计项）
└── DAOFactory                          … 获取/缓存/自动释放 DAO 实例的唯一入口

jp.co.intra_mart.mirage.ext.session
├── SessionTemplate                     … 自动执行 begin/commit/rollback/release 的模板
└── SessionCallback<T, E extends Exception> … 传递给 SessionTemplate 的回调接口

jp.co.intra_mart.mirage.ext.util
└── EntityHelper                        … 自动设置审计项（createUserCd/createDate/recordUserCd/recordDate）

jp.co.intra_mart.mirage.dialect / jp.co.intra_mart.mirage.ext.dialect
└── Dialect 实现（Oracle/PostgreSQL/SQLServer 等）… 用于 SQL 文件的数据库方言解析
```

## 实体注解

### `@Table`

```java
package jp.co.intra_mart.mirage.annotation;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Table {
    String name();   // 映射目标的表名（必须）
}
```

未指定时会通过 `NameConverter` 从类名自动转换，但本项目要求必须显式指定（参见 `.github/instructions/java-entity.instructions.md`）。

### `@Column`

```java
package jp.co.intra_mart.mirage.annotation;

@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Column {
    String name();   // 映射目标的列名（必须）
}
```

### `@PrimaryKey`

```java
package jp.co.intra_mart.mirage.annotation;

@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface PrimaryKey {
    GenerationType generationType();   // 主键生成方式（必须）
    String generator() default "";     // 生成器的标识符（用于 APPLICATION 以外的场景）

    enum GenerationType {
        APPLICATION,   // 在应用程序侧生成 ID（本项目仅使用此方式）
        IDENTITY,      // 依赖数据库侧的 IDENTITY/AUTO_INCREMENT
        SEQUENCE       // 依赖数据库侧的 SEQUENCE
    }
}
```

根据 `.github/instructions/java-entity.instructions.md`，本项目禁止使用 `GenerationType.APPLICATION` 以外的方式。

## DAO 层

### `DAO<T>` / `BaseDAO<T>`

```java
package jp.co.intra_mart.mirage.ext.dao;

public interface DAO<T> {
}

public abstract class BaseDAO<T> implements DAO<T> {
    protected IntramartSqlManager sqlManager;   // 由 DAOFactory 通过反射注入
}
```

- `sqlManager` 字段由 `DAOFactory` 通过反射进行设置。若直接使用 `new` 生成 DAO，该字段将保持为 `null`，调用时会引发 `NullPointerException`

### `AbstractDAO<T>`

```java
package jp.co.intra_mart.mirage.ext.dao;

public abstract class AbstractDAO<T> extends BaseDAO<T> {

    public int insert(T entity);              // EntityHelper.setCreateFields 之后调用 sqlManager.insertEntity
    public int insertBatch(T... entities);     // 多条 insert（内部逐条调用 insertEntity）
    public int delete(T entity);               // sqlManager.deleteEntity
    public int deleteBatch(T... entities);      // sqlManager.deleteBatch
    public int update(T entity);                // EntityHelper.setRecordFields 之后调用 sqlManager.updateEntity
    public int updateBatch(T... entities);       // sqlManager.updateBatch
    public T find(Object... ids);                 // sqlManager.findEntity(实体类型, ids)

    protected Class<T> getEntityType();            // 从泛型的类型参数解析实体类型（内部使用）
}
```

- **`update`/`updateBatch` 并非部分更新，而是将主键以外的全部列都列入 SET 子句。** 未设置值的字段会被 `null` 覆盖。`update` 只设置 `recordUserCd`/`recordDate`，不会补充 `createUserCd`/`createDate`，因此若传入新组装的 Entity，记录创建时的审计追踪会丢失
- **更新时应通过 `find()` 获取既有 Entity，仅反映变更点后再传给 `update`。** 若仅更新部分列，应使用 SQL 文件＋`sqlManager.executeUpdate`
- 如需添加自定义查询，可在继承 `AbstractDAO<实体类型>` 的具体类中，添加使用 `protected sqlManager` 的方法

### `DAOFactory`

```java
package jp.co.intra_mart.mirage.ext.dao;

public final class DAOFactory {

    // 获取租户数据库用的 DAO 实例（缓存到线程局部变量中）
    public static <T extends DAO<?>> T getTenantDatabaseDAO(Class<T> clazz);

    // 获取共享数据库用的 DAO 实例（按连接 ID 分别缓存）
    public static <T extends DAO<?>> T getSharedDatabaseDAO(Class<T> clazz, String connectId);
}
```

- 两者均需传入实现了 `DAO<?>` 接口的类的 `Class` 对象，以获取实例
- 所获取的实例会被缓存到线程局部变量中，在会话（`Session`）释放时自动释放。调用方无需关注缓存管理
- 构造函数为 `private`。必须通过本类的 static 方法获取

## `EntityHelper`（审计项的自动设置，内部使用）

```java
package jp.co.intra_mart.mirage.ext.util;

public final class EntityHelper {
    public static final String CREATE_USER_CD_FIELD_NAME = "createUserCd";
    public static final String CREATE_DATE_FIELD_NAME = "createDate";
    public static final String RECORD_USER_CD_FIELD_NAME = "recordUserCd";
    public static final String RECORD_DATE_FIELD_NAME = "recordDate";

    public static <T> void setCreateFields(T... entities);   // 仅在为 null 时设置全部 4 个审计项
    public static <T> void setRecordFields(T... entities);   // 始终设置 record 系 2 项（覆盖既有值）
}
```

- 由 `AbstractDAO#insert`/`update` 自动调用。DAO 调用方无需直接调用
- `setCreateFields` 以全部 4 个审计项为对象，不会覆盖已设置值的字段（仅在为 `null` 时设置）。`setRecordFields` 仅以 record 系 2 项为对象，即使已有值也始终覆盖
- **将 4 个审计项字段中哪怕只缺少声明一个的实体传给 `AbstractDAO#insert`/`update`，都会引发 `NullPointerException`。** 这是因为 `EntityHelper` 对未声明的属性所返回的 `null` 未做 `null` 检查便直接使用。`insert`/`insertBatch` 必须具备全部 4 项，`update`/`updateBatch` 必须具备 record 系 2 项（`delete`/`deleteBatch` 不涉及审计项，因此不受影响）。`.github/instructions/java-entity.instructions.md` 的「审计追踪字段（必须）」不仅是规约上的要求，同时也是实现上的强制要求

## `SqlManager`（SQL 执行的核心接口）

```java
package jp.co.intra_mart.mirage;

public interface SqlManager {

    // --- SQL 文件（2WaySQL）执行系 ---
    int getCount(String sqlPath);
    int getCount(String sqlPath, Object param);
    <T> List<T> getResultList(Class<T> clazz, String sqlPath);
    <T> List<T> getResultList(Class<T> clazz, String sqlPath, Object param);
    <T> T getSingleResult(Class<T> clazz, String sqlPath);
    <T> T getSingleResult(Class<T> clazz, String sqlPath, Object param);
    <T, R> R iterate(Class<T> clazz, IterationCallback<T, R> callback, String sqlPath);
    <T, R> R iterate(Class<T> clazz, IterationCallback<T, R> callback, String sqlPath, Object param);
    int executeUpdate(String sqlPath);
    int executeUpdate(String sqlPath, Object param);

    // --- 实体 CRUD ---
    int insertEntity(Object entity);
    <T> int insertBatch(T... entities);
    <T> int insertBatch(List<T> entities);
    int updateEntity(Object entity);
    <T> int updateBatch(T... entities);
    <T> int updateBatch(List<T> entities);
    int deleteEntity(Object entity);
    <T> int deleteBatch(T... entities);
    <T> int deleteBatch(List<T> entities);
    <T> T findEntity(Class<T> clazz, Object... id);

    // --- 存储过程/函数调用 ---
    void call(String procedureName);
    void call(String procedureName, Object parameter);
    <T> T call(Class<T> resultClass, String functionName);
    <T> T call(Class<T> resultClass, String functionName, Object param);
    <T> List<T> callForList(Class<T> resultClass, String functionName);
    <T> List<T> callForList(Class<T> resultClass, String functionName, Object param);

    // --- 原生 SQL 字符串执行系（并非 2WaySQL。使用 "?" 占位符） ---
    <T> List<T> getResultListBySql(Class<T> clazz, String sql);
    <T> List<T> getResultListBySql(Class<T> clazz, String sql, Object... params);
    <T> T getSingleResultBySql(Class<T> clazz, String sql);
    <T> T getSingleResultBySql(Class<T> clazz, String sql, Object... params);
    <T, R> R iterateBySql(Class<T> clazz, IterationCallback<T, R> callback, String sql);
    <T, R> R iterateBySql(Class<T> clazz, IterationCallback<T, R> callback, String sql, Object... params);
    int executeUpdateBySql(String sql);
    int executeUpdateBySql(String sql, Object... params);
}
```

- **请勿混淆 SQL 文件系列方法（`sqlPath` 参数）与 `xxxBySql` 系列方法（`sql` 参数）。** 前者是类路径下 2WaySQL 文件的路径，后者是 SQL 语句本身（占位符使用 `?`，无法使用 2WaySQL 的注释语法）
- `param` 可传入实体、任意 JavaBean、`Map<String, Object>` 中的任意一种。需使 SQL 中的占位符名称与属性名/键名保持一致

### `getSingleResult`/`findEntity` 的返回值规格（与 JPA 不同）

返回单一结果的 API（`getSingleResult`/`getSingleResultBySql`/`findEntity`，以及 `AbstractDAO#find`）在内部全部汇聚到同一实现。其行为与 JPA 的 `getSingleResult` 不同。

| 情形 | 行为 |
|------|------|
| 0 件 | 不抛出异常，返回 `null` |
| 2 件以上 | 不抛出异常，返回 ResultSet 的首行（其余被丢弃） |

- 由于只调用一次 `ResultSet#next()`，**不保证件数的唯一性**。对于需要唯一性的查询，应通过主键／唯一约束来保证，或使用 `getResultList` 获取后验证件数
- 当没有 `ORDER BY` 的查询命中多件时，返回其中哪一件取决于数据库的返回顺序
- **返回值必须进行 `null` 检查**

### 传给 `getCount` 的 SQL 文件的约束

`getCount` 会通过 Dialect 的 `getCountSql`，将传入的 SQL 整体包裹为 `SELECT COUNT(*) FROM (<传入的 SQL>)` 这样的子查询。

- **不得书写 `SELECT COUNT(*)`。** 否则会变成 `SELECT COUNT(*) FROM (SELECT COUNT(*) ...)`，**不抛出异常而始终返回 `1`**。应传入与列表获取相同形式的 SELECT
- **不得书写 `ORDER BY`。** 由于它会进入子查询内部，在 SQLServer 中会导致语法错误

## `IntramartSqlManager`（面向 intra-mart 的扩展，DAO 实际使用的类）

```java
package jp.co.intra_mart.mirage.ext;

public class IntramartSqlManager extends SqlManagerImpl {
    // 覆写 SqlManager 的 SQL 文件系方法，
    // 通过 getSqlPathWithDialect(sqlPath) 解析为方言专用文件后再执行
}
```

### SQL 文件的数据库方言解析逻辑

针对 `sqlPath`（例如：`jp/co/example/foo/dao/select_orders.sql`），使用当前运行数据库的方言名，拼装出 `<文件名>_<方言名>.<扩展名>`，若该文件存在于类路径下则使用该文件，若不存在则回退至原始的 `sqlPath`。

| 数据库产品 | 方言名（文件名后缀） |
|------|------|
| Oracle | `oracle` |
| PostgreSQL | `postgre` |
| SQLServer | `sqlserver` |

例如：若针对 `select_orders.sql` 存在 `select_orders_oracle.sql`，则在 Oracle 环境下会优先使用后者。对于没有差异的数据库产品，无需创建对应文件（将回退至基础文件）。

## `SessionTemplate` / `SessionCallback`（事务管理）

```java
package jp.co.intra_mart.mirage.ext.session;

public class SessionTemplate {
    // 自动执行 begin → callback.execute(session) → commit（发生异常时 rollback）→ release
    public static <T, E extends Exception> T execute(SessionCallback<T, E> callback) throws E;
}

public interface SessionCallback<T, E extends Exception> {
    T execute(Session session) throws E;
}
```

- 若已处于事务中（`IntramartSession#inTransaction()` 为 true），内层的 `execute` 不会执行 commit/rollback，而是交由外层事务处理（支持嵌套调用）
- 回调内部发生异常时会自动回滚，异常将原样传播至调用方
- `finally` 中必定会调用 `session.release()`（`SQLRuntimeException` 会被吞掉，属设计如此）

## `ServiceLoaderUtil`（在 Repository/Service 工厂中替换实现）

并非 `im_mirage` 自身的 API，而是平台通用的工具类（`im_jdk_assist` 模块）。用于在 Repository/Service 的工厂类中，实现向 `META-INF/services` 中注册的实现进行替换。

```java
package jp.co.intra_mart.common.aid.jdk.java.util;

public final class ServiceLoaderUtil {

    // 按 @Priority 降序（未指定的排在最后）对已注册的全部实现进行排序后返回。结果会被缓存
    public static <S> Collection<S> loadPriority(Class<S> service);
    public static <S> Collection<S> loadPriority(Class<S> service, ClassLoader classLoader);   // 不会被缓存

    // 仅返回 loadPriority 结果中最前面（优先度最高）的一个。若无注册则返回 null
    public static <S> S loadTopPriority(Class<S> service);
    public static <S> S loadTopPriority(Class<S> service, ClassLoader classLoader);

    // 直接调用标准的 ServiceLoader#load（不进行优先度排序，结果不会被缓存）
    public static <S> ServiceLoader<S> load(Class<S> service);
}
```

```java
package jp.co.intra_mart.common.annotation;

@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.TYPE })
public @interface Priority {
    int value();   // 数值越大优先度越高。必定优先于未指定该注解的实现
}
```

- **获取单个实例时使用 `loadTopPriority`。** `loadPriority` 是以 `Collection` 形式返回全部已注册实现的方法，适用于需要依次处理多个实现的场景（如扩展点链式处理等）。对于 Repository/Service 这类「只想获取一个实现」的工厂，`loadTopPriority` 更为合适（虽然等价于 `loadPriority(...).iterator().next()`，但已内置空值判断，写法更简洁）
- 在 `META-INF/services/<接口的完全限定名>` 文件中以一行（实现类的完全限定名）记录实现类，即可通过 Java 标准的 `ServiceLoader` 机制被检测到
- 若希望为某实现类指定优先度，可为其附加 `@jp.co.intra_mart.common.annotation.Priority(值)` 注解。未附加 `@Priority` 的实现，其优先度必定低于已指定优先度的实现
- `loadTopPriority`/`loadPriority`（不传 `ClassLoader` 的重载）的结果会被缓存。若需要动态清除缓存，可使用 `ServiceLoaderUtil.clearCache()`

## 2WaySQL 语法（im_mirage 版）

| 语法 | 用途 | 与 JSSP 侧（`.github/instructions/jssp-2way-sql.instructions.md`）的差异 |
|------|------|------|
| `/*IF condition*/.../*END*/` | 条件分支 | 相同 |
| `/*BEGIN*/.../*END*/` | 可选块 | 相同 |
| `/*param*/'dummy'` | 绑定占位符 | 相同 |
| `IN /*param*/('dummy')` | 将 `List`/数组展开为 `(?, ?, ?)`（IN 子句的动态生成） | 相同 |
| `/*$param*/dummy` | 值的直接嵌入。不进行绑定 | 相同 |
| `/*FOR item in list*/.../*END*/` | 循环 | **可在 im_mirage 与 LogicDesigner 中使用。JSSP（脚本开发模型）不支持** |

- **`/*FOR*/` 的分隔符为前后各夹一个半角空格的 `in` 或 `IN`。** 分隔方式不一致时会引发 `TwoWaySQLException: For expression is invalid.`
- **`/*FOR*/` 块内可引用的只有绑定到循环变量名上的单个元素。** IN 子句的动态生成请使用 `IN /*param*/('dummy')`，而非 `/*FOR*/`
- **`IN /*param*/('dummy')` 无论为 `null` 还是空列表，绑定部分都会连同一起不被输出，`IN` 会裸露残留，导致 SQL 损坏。** 仅有 `/*IF list != null*/` 无法拦住空列表，因此需用 `/*IF list != null && list.size() > 0*/` 这样能同时拦住两者的守护条件包围（OGNL 对 `&&` 进行短路求值，因此即使为 `null`，`size()` 也不会被求值，不会引发 NPE）
- **`/*$param*/dummy` 不绑定值，而是将其原样拼接到 SQL 正文中。仅可用于动态的表名・列名・排序顺序，且值必须进行白名单验证**（与 `.github/instructions/jssp-2way-sql.instructions.md` 的处理相同）。解析器仅在值中包含 `;` 时才会拒绝，`OR 1=1 --` 或 `UNION SELECT ...` 会原样进入 SQL。将值作为参数传递时，应使用 `/*param*/'dummy'`
- **`/*$param*/` 追溯属性的点号仅限 1 层。** `/*$a.b.c*/` 只会求值到 `a.b`，忽略 `.c` 及其之后的部分，并原样嵌入 `a.b` 的字符串表示（不会抛出异常）
</content>
