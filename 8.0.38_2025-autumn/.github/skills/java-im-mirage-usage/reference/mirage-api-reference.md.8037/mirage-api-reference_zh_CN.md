# im_mirage API 参考手册（Java 版）

基于 intra-mart Accel Platform 核心源码（`im_mirage` 模块，`jp.co.intra_mart.mirage.*`）的实际类定义编写。请勿凭记忆或推测补充方法・属性。

## 包结构

```
jp.co.intra_mart.mirage.annotation
├── Table       … 附加于实体类，用于指定表名
├── Column      … 附加于字段/方法，用于指定列名
├── PrimaryKey  … 表示该项为主键。持有 GenerationType（枚举）
├── Enumerated  … 枚举类型属性的映射指定
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
    String name();   // マッピング先のテーブル名（必須）
}
```

未指定时会通过 `NameConverter` 从类名自动转换，但本项目要求必须显式指定（参见 `.github/instructions/java-entity.instructions.md`）。

### `@Column`

```java
package jp.co.intra_mart.mirage.annotation;

@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Column {
    String name();   // マッピング先のカラム名（必須）
}
```

### `@PrimaryKey`

```java
package jp.co.intra_mart.mirage.annotation;

@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface PrimaryKey {
    GenerationType generationType();   // 主キー生成方式（必須）
    String generator() default "";     // 生成器の識別子（APPLICATION以外で使用）

    enum GenerationType {
        APPLICATION,   // アプリケーション側でID生成（本プロジェクトで使用するのはこれのみ）
        IDENTITY,      // DB側のIDENTITY/AUTO_INCREMENTに依存
        SEQUENCE       // DB側のSEQUENCEに依存
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
    protected IntramartSqlManager sqlManager;   // DAOFactory がリフレクション経由で注入する
}
```

- `sqlManager` 字段由 `DAOFactory` 通过反射进行设置。若直接使用 `new` 生成 DAO，该字段将保持为 `null`，调用时会引发 `NullPointerException`

### `AbstractDAO<T>`

```java
package jp.co.intra_mart.mirage.ext.dao;

public abstract class AbstractDAO<T> extends BaseDAO<T> {

    public int insert(T entity);              // EntityHelper.setCreateFields 後に sqlManager.insertEntity
    public int insertBatch(T... entities);     // 複数件の insert（内部で1件ずつ insertEntity）
    public int delete(T entity);               // sqlManager.deleteEntity
    public int deleteBatch(T... entities);      // sqlManager.deleteBatch
    public int update(T entity);                // EntityHelper.setRecordFields 後に sqlManager.updateEntity
    public int updateBatch(T... entities);       // sqlManager.updateBatch
    public T find(Object... ids);                 // sqlManager.findEntity(エンティティ型, ids)

    protected Class<T> getEntityType();            // ジェネリクスの型引数からエンティティ型を解決（内部利用）
}
```

- 如需添加自定义查询，可在继承 `AbstractDAO<实体类型>` 的具体类中，添加使用 `protected sqlManager` 的方法

### `DAOFactory`

```java
package jp.co.intra_mart.mirage.ext.dao;

public final class DAOFactory {

    // テナントDB用のDAOインスタンスを取得する（スレッドローカルにキャッシュ）
    public static <T extends DAO<?>> T getTenantDatabaseDAO(Class<T> clazz);

    // シェアードDB用のDAOインスタンスを取得する（接続IDごとにキャッシュ）
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

    public static <T> void setCreateFields(T... entities);   // create系2項目が null の場合のみ設定
    public static <T> void setRecordFields(T... entities);   // record系2項目を設定
}
```

- 由 `AbstractDAO#insert`/`update` 自动调用。DAO 调用方无需直接调用
- `setCreateFields` 不会覆盖已设置值的字段（仅在为 `null` 时设置）。`setRecordFields` 则始终进行设置

## `SqlManager`（SQL 执行的核心接口）

```java
package jp.co.intra_mart.mirage;

public interface SqlManager {

    // --- SQLファイル（2WaySQL）実行系 ---
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

    // --- エンティティCRUD ---
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

    // --- ストアドプロシージャ/ファンクション呼び出し ---
    void call(String procedureName);
    void call(String procedureName, Object parameter);
    <T> T call(Class<T> resultClass, String functionName);
    <T> T call(Class<T> resultClass, String functionName, Object param);
    <T> List<T> callForList(Class<T> resultClass, String functionName);
    <T> List<T> callForList(Class<T> resultClass, String functionName, Object param);

    // --- 素のSQL文字列実行系（2WaySQLではない。"?" プレースホルダを使用） ---
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

## `IntramartSqlManager`（面向 intra-mart 的扩展，DAO 实际使用的类）

```java
package jp.co.intra_mart.mirage.ext;

public class IntramartSqlManager extends SqlManagerImpl {
    // SqlManager のSQLファイル系メソッドをオーバーライドし、
    // getSqlPathWithDialect(sqlPath) で方言別ファイルに解決してから実行する
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
    // begin → callback.execute(session) → commit（例外時 rollback）→ release を自動実行する
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

| 语法 | 用途 | 与 JSSP 侧（`jssp-2way-sql.md`）的差异 |
|------|------|------|
| `/*IF condition*/.../*END*/` | 条件分支 | 相同 |
| `/*BEGIN*/.../*END*/` | 可选块 | 相同 |
| `/*param*/'dummy'` | 绑定占位符 | 相同 |
| `/*FOR item : list*/.../*END*/` | 循环（用于动态生成 IN 子句等） | **仅 im_mirage 支持。JSSP（脚本开发模型）不支持** |

- 在 `/*FOR*/` 块内，可通过在循环变量名后附加 `_has_next`（例如：`orderId_has_next`）的变量来判断「是否存在下一个元素」，可用于生成以逗号分隔的动态内容
</content>
