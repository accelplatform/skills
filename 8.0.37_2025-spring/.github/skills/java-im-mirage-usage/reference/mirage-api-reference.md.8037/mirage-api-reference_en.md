# im_mirage API Reference (Java Edition)

Based on the actual class definitions of the intra-mart Accel Platform core source (`im_mirage` module, `jp.co.intra_mart.mirage.*`). Do not supplement methods/attributes from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.mirage.annotation
├── Table       … Applied to entity classes, specifies the table name
├── Column      … Applied to fields/methods, specifies the column name
├── PrimaryKey  … Indicates that this is a primary key. Has GenerationType (enum)
├── Enumerated  … Mapping specification for enum-type properties
├── Transient   … Specifies a property to exclude from mapping
└── In / InOut / Out / ResultSet … Specifies parameter direction when calling stored procedures

jp.co.intra_mart.mirage
├── SqlManager (interface)              … Core API for SQL execution
├── SqlManagerImpl                      … Standard implementation of SqlManager (inherited by IntramartSqlManager)
└── IterationCallback<T, R>             … Callback for processing large volumes of data sequentially

jp.co.intra_mart.mirage.ext
└── IntramartSqlManager extends SqlManagerImpl … intra-mart extension (adds DB dialect resolution for SQL files)

jp.co.intra_mart.mirage.ext.dao
├── DAO<T> (interface)                  … Base interface for DAOs
├── BaseDAO<T> implements DAO<T>        … Holds the protected IntramartSqlManager sqlManager field
├── AbstractDAO<T> extends BaseDAO<T>   … Common implementation of insert/update/delete/find (automatic audit field setting)
└── DAOFactory                          … The sole entry point responsible for obtaining, caching, and auto-releasing DAO instances

jp.co.intra_mart.mirage.ext.session
├── SessionTemplate                     … Template that automates begin/commit/rollback/release
└── SessionCallback<T, E extends Exception> … Callback interface passed to SessionTemplate

jp.co.intra_mart.mirage.ext.util
└── EntityHelper                        … Automatic setting of audit fields (createUserCd/createDate/recordUserCd/recordDate)

jp.co.intra_mart.mirage.dialect / jp.co.intra_mart.mirage.ext.dialect
└── Dialect implementations (Oracle/PostgreSQL/SQLServer, etc.) … Used for DB dialect resolution of SQL files
```

## Entity Annotations

### `@Table`

```java
package jp.co.intra_mart.mirage.annotation;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Table {
    String name();   // The mapped table name (required)
}
```

If unspecified, it is automatically converted from the class name by `NameConverter`, but this project requires explicit specification (see `.github/instructions/java-entity.instructions.md`).

### `@Column`

```java
package jp.co.intra_mart.mirage.annotation;

@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Column {
    String name();   // The mapped column name (required)
}
```

### `@PrimaryKey`

```java
package jp.co.intra_mart.mirage.annotation;

@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface PrimaryKey {
    GenerationType generationType();   // Primary key generation strategy (required)
    String generator() default "";     // Generator identifier (used for anything other than APPLICATION)

    enum GenerationType {
        APPLICATION,   // ID generated on the application side (the only one used in this project)
        IDENTITY,      // Relies on the DB's IDENTITY/AUTO_INCREMENT
        SEQUENCE       // Relies on the DB's SEQUENCE
    }
}
```

Per `.github/instructions/java-entity.instructions.md`, this project prohibits using anything other than `GenerationType.APPLICATION`.

## DAO Layer

### `DAO<T>` / `BaseDAO<T>`

```java
package jp.co.intra_mart.mirage.ext.dao;

public interface DAO<T> {
}

public abstract class BaseDAO<T> implements DAO<T> {
    protected IntramartSqlManager sqlManager;   // Injected by DAOFactory via reflection
}
```

- The `sqlManager` field is set by `DAOFactory` via reflection. If a DAO is instantiated directly with `new`, it remains `null`, resulting in a `NullPointerException` when called

### `AbstractDAO<T>`

```java
package jp.co.intra_mart.mirage.ext.dao;

public abstract class AbstractDAO<T> extends BaseDAO<T> {

    public int insert(T entity);              // sqlManager.insertEntity after EntityHelper.setCreateFields
    public int insertBatch(T... entities);     // insert of multiple entries (internally calls insertEntity one at a time)
    public int delete(T entity);               // sqlManager.deleteEntity
    public int deleteBatch(T... entities);      // sqlManager.deleteBatch
    public int update(T entity);                // sqlManager.updateEntity after EntityHelper.setRecordFields
    public int updateBatch(T... entities);       // sqlManager.updateBatch
    public T find(Object... ids);                 // sqlManager.findEntity(entity type, ids)

    protected Class<T> getEntityType();            // Resolves the entity type from the generic type argument (internal use)
}
```

- To add a custom query, add a method that uses `protected sqlManager` to a concrete class that extends `AbstractDAO<EntityType>`

### `DAOFactory`

```java
package jp.co.intra_mart.mirage.ext.dao;

public final class DAOFactory {

    // Obtains a DAO instance for the tenant DB (cached in a thread-local)
    public static <T extends DAO<?>> T getTenantDatabaseDAO(Class<T> clazz);

    // Obtains a DAO instance for the shared DB (cached per connection ID)
    public static <T extends DAO<?>> T getSharedDatabaseDAO(Class<T> clazz, String connectId);
}
```

- In both cases, pass the `Class` object of a class implementing `DAO<?>` to obtain an instance
- The obtained instance is cached in a thread-local and is automatically released when the session (`Session`) is released. The caller does not need to be aware of cache management
- The constructor is `private`. Instances must always be obtained via this class's static methods

## `EntityHelper` (Automatic Audit Field Setting, Internal Use)

```java
package jp.co.intra_mart.mirage.ext.util;

public final class EntityHelper {
    public static final String CREATE_USER_CD_FIELD_NAME = "createUserCd";
    public static final String CREATE_DATE_FIELD_NAME = "createDate";
    public static final String RECORD_USER_CD_FIELD_NAME = "recordUserCd";
    public static final String RECORD_DATE_FIELD_NAME = "recordDate";

    public static <T> void setCreateFields(T... entities);   // Sets the two create-related fields only if they are null
    public static <T> void setRecordFields(T... entities);   // Always sets the two record-related fields
}
```

- Automatically invoked from `AbstractDAO#insert`/`update`. There is no need for the DAO caller to invoke it directly
- `setCreateFields` does not overwrite fields that already have a value set (sets them only if `null`). `setRecordFields` always sets them

## `SqlManager` (Core Interface for SQL Execution)

```java
package jp.co.intra_mart.mirage;

public interface SqlManager {

    // --- SQL file (2WaySQL) execution family ---
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

    // --- Entity CRUD ---
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

    // --- Stored procedure/function calls ---
    void call(String procedureName);
    void call(String procedureName, Object parameter);
    <T> T call(Class<T> resultClass, String functionName);
    <T> T call(Class<T> resultClass, String functionName, Object param);
    <T> List<T> callForList(Class<T> resultClass, String functionName);
    <T> List<T> callForList(Class<T> resultClass, String functionName, Object param);

    // --- Raw SQL string execution family (not 2WaySQL. Uses "?" placeholders) ---
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

- **Do not confuse the SQL file family (`sqlPath` argument) with the `xxxBySql` family (`sql` argument).** The former is a path to a 2WaySQL file on the classpath, while the latter is the SQL statement itself (placeholders are `?`; 2WaySQL comment syntax cannot be used)
- `param` can be given an entity, an arbitrary JavaBean, or a `Map<String, Object>`. The placeholder names in the SQL must match the property names/key names

## `IntramartSqlManager` (intra-mart Extension, Actually Used by DAOs)

```java
package jp.co.intra_mart.mirage.ext;

public class IntramartSqlManager extends SqlManagerImpl {
    // Overrides the SQL file family of methods in SqlManager, and executes
    // after resolving to the dialect-specific file via getSqlPathWithDialect(sqlPath)
}
```

### SQL File DB Dialect Resolution Logic

For a `sqlPath` (e.g. `jp/co/example/foo/dao/select_orders.sql`), a `<filename>_<dialect name>.<extension>` is built using the dialect name of the DB currently running; if this exists on the classpath it is used, and if not, it falls back to the original `sqlPath`.

| DB Product | Dialect Name (Filename Suffix) |
|------|------|
| Oracle | `oracle` |
| PostgreSQL | `postgre` |
| SQLServer | `sqlserver` |

Example: for `select_orders.sql`, if `select_orders_oracle.sql` exists, that one takes priority in an Oracle environment. For DB products with no differences, there is no need to create a file (it falls back to the base file).

## `SessionTemplate` / `SessionCallback` (Transaction Management)

```java
package jp.co.intra_mart.mirage.ext.session;

public class SessionTemplate {
    // Automatically executes begin → callback.execute(session) → commit (rollback on exception) → release
    public static <T, E extends Exception> T execute(SessionCallback<T, E> callback) throws E;
}

public interface SessionCallback<T, E extends Exception> {
    T execute(Session session) throws E;
}
```

- If already within a transaction (`IntramartSession#inTransaction()` is true), the inner `execute` does not perform commit/rollback and defers to the outer transaction (supports nested calls)
- If an exception occurs within the callback, it is automatically rolled back, and the exception propagates as-is to the caller
- `session.release()` is always called in a `finally` block (designed so that `SQLRuntimeException` is swallowed)

## `ServiceLoaderUtil` (Swapping Implementations in Repository/Service Factories)

Not part of the `im_mirage` API itself — a platform-common utility (`im_jdk_assist` module). Used in Repository/Service factory classes to allow the implementation registered under `META-INF/services` to be swapped out.

```java
package jp.co.intra_mart.common.aid.jdk.java.util;

public final class ServiceLoaderUtil {

    // Returns all registered implementations sorted in descending order of @Priority (unspecified sorts last). The result is cached
    public static <S> Collection<S> loadPriority(Class<S> service);
    public static <S> Collection<S> loadPriority(Class<S> service, ClassLoader classLoader);   // Not cached

    // Returns only the first (highest-priority) entry from the loadPriority result. Returns null if nothing is registered
    public static <S> S loadTopPriority(Class<S> service);
    public static <S> S loadTopPriority(Class<S> service, ClassLoader classLoader);

    // Calls the standard ServiceLoader#load as-is (no priority sorting, result not cached)
    public static <S> ServiceLoader<S> load(Class<S> service);
}
```

```java
package jp.co.intra_mart.common.annotation;

@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.TYPE })
public @interface Priority {
    int value();   // The larger the value, the higher the priority. Always takes precedence over an implementation with no value specified
}
```

- **Use `loadTopPriority` to obtain a single instance.** `loadPriority` is a method that returns all registered implementations as a `Collection`, and is for cases where you want to process multiple implementations in order (e.g. chaining extension points). For factories such as Repository/Service where you want to obtain "one implementation," `loadTopPriority` is more appropriate (it is equivalent to `loadPriority(...).iterator().next()`, but is more concise and includes an empty check)
- Listing the fully qualified name of an implementation class, one per line, in a `META-INF/services/<fully qualified name of the interface>` file makes it discoverable via the standard Java `ServiceLoader` mechanism
- Attach `@jp.co.intra_mart.common.annotation.Priority(value)` to an implementation class whose priority you want to specify. An implementation without `@Priority` always has a lower priority than one that specifies it
- The results of `loadTopPriority`/`loadPriority` (the overloads that do not take a `ClassLoader`) are cached. To clear the cache dynamically, use `ServiceLoaderUtil.clearCache()`

## 2WaySQL Syntax (im_mirage Edition)

| Syntax | Purpose | Difference from the JSSP side (`jssp-2way-sql.md`) |
|------|------|------|
| `/*IF condition*/.../*END*/` | Conditional branching | Same |
| `/*BEGIN*/.../*END*/` | Optional block | Same |
| `/*param*/'dummy'` | Bind placeholder | Same |
| `/*FOR item : list*/.../*END*/` | Loop (dynamic generation of IN clauses, etc.) | **Supported only by im_mirage. Not supported in JSSP (script development model)** |

- Within a `/*FOR*/` block, a variable with `_has_next` appended to the loop variable name (e.g. `orderId_has_next`) can be used to determine "whether there is a next element," which can be used for comma-separated dynamic generation
