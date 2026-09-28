# im_mirage API Reference (Java Edition)

Based on the actual class definitions of the intra-mart Accel Platform core source (`im_mirage` module, `jp.co.intra_mart.mirage.*`). Do not supplement methods/attributes from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.mirage.annotation
├── Table       … Applied to entity classes, specifies the table name
├── Column      … Applied to fields/methods, specifies the column name
├── PrimaryKey  … Indicates that this is a primary key. Has GenerationType (enum)
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

- **`update`/`updateBatch` are not partial updates — they list every column except the primary key in the SET clause.** Fields with no value set are overwritten with `null`. `update` sets only `recordUserCd`/`recordDate` and does not fill in `createUserCd`/`createDate`, so passing a newly assembled Entity erases the audit trail from record creation
- **On update, retrieve the existing Entity with `find()`, apply only the changes, and then pass it to `update`.** To update only some of the columns, use a SQL file together with `sqlManager.executeUpdate`
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

    public static <T> void setCreateFields(T... entities);   // Sets all 4 audit fields, only when they are null
    public static <T> void setRecordFields(T... entities);   // Always sets the two record-related fields (overwriting existing values)
}
```

- Automatically invoked from `AbstractDAO#insert`/`update`. There is no need for the DAO caller to invoke it directly
- `setCreateFields` targets all 4 audit fields and does not overwrite fields that already have a value set (it sets them only if `null`). `setRecordFields` targets only the two record-related fields and always overwrites them, even when they already have a value
- **Passing an entity that does not declare even one of the 4 audit fields to `AbstractDAO#insert`/`update` causes a `NullPointerException`.** This is because `EntityHelper` uses the return value for an undeclared property — which comes back as `null` — without a `null` check. `insert`/`insertBatch` require all 4 fields, and `update`/`updateBatch` require the two record-related fields (`delete`/`deleteBatch` do not touch the audit fields, so they are unaffected). "Audit trail fields (required)" in `.github/instructions/java-entity.instructions.md` is therefore not only a convention-level requirement but also a hard requirement of the implementation

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

### Return Value Specification of `getSingleResult`/`findEntity` (Differs from JPA)

The APIs that return a single result (`getSingleResult`/`getSingleResultBySql`/`findEntity`, as well as `AbstractDAO#find`) all converge internally on the same implementation. Their behavior differs from JPA's `getSingleResult`.

| Situation | Behavior |
|------|------|
| 0 rows | Returns `null` instead of throwing an exception |
| 2 or more rows | Returns the first row of the ResultSet instead of throwing an exception (the rest are discarded) |

- Because `ResultSet#next()` is called only once, **uniqueness of the row count is not guaranteed**. For queries that require uniqueness, guarantee it with a primary key / unique constraint, or retrieve with `getResultList` and verify the row count
- When a query without `ORDER BY` matches multiple rows, which single row is returned depends on the order in which the DB returns them
- **Always `null`-check the return value**

### Constraints on the SQL File Passed to `getCount`

`getCount` uses the Dialect's `getCountSql` to wrap the SQL it is given entirely in a subquery, as in `SELECT COUNT(*) FROM (<the SQL you passed>)`.

- **Never write `SELECT COUNT(*)`.** It becomes `SELECT COUNT(*) FROM (SELECT COUNT(*) ...)`, which **always returns `1` without throwing an exception**. Pass a SELECT of the same shape as the one used for list retrieval
- **Never write `ORDER BY`.** It ends up inside the subquery, which is a syntax error on SQLServer

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
| `IN /*param*/('dummy')` | Expands a `List`/array into `(?, ?, ?)` (dynamic generation of IN clauses) | Same |
| `/*$param*/dummy` | Direct embedding of a value. Not bound | Same |
| `/*FOR item in list*/.../*END*/` | Loop | **Usable in im_mirage and LogicDesigner. Not supported in JSSP (script development model)** |

- **The delimiter of `/*FOR*/` is `in` or `IN`, with a half-width space on each side.** If the delimiter does not match, you get `TwoWaySQLException: For expression is invalid.`
- **Within a `/*FOR*/` block, the only thing you can reference is the single element bound to the loop variable name.** To generate IN clauses dynamically, use `IN /*param*/('dummy')` rather than `/*FOR*/`
- **With `IN /*param*/('dummy')`, both `null` and an empty list cause the entire bind portion to be omitted from the output, leaving a bare `IN` that breaks the SQL.** `/*IF list != null*/` alone cannot stop an empty list, so enclose it in a guard that stops both, such as `/*IF list != null && list.size() > 0*/` (OGNL evaluates `&&` in a short-circuit manner, so `size()` is not evaluated even when the value is `null` and no NPE occurs)
- **`/*$param*/dummy` does not bind the value; it concatenates it directly into the SQL body. Use it only for dynamic table names, column names, and sort order, and always validate the value against a whitelist** (the same treatment as in `.github/instructions/jssp-2way-sql.instructions.md`). The parser rejects the value only when it contains `;` — `OR 1=1 --` and `UNION SELECT ...` go into the SQL as-is. To pass a value as a parameter, use `/*param*/'dummy'`
- **`/*$param*/` follows property dots only one level deep.** `/*$a.b.c*/` evaluates up to `a.b`, ignores everything from `.c` onward, and embeds the string representation of `a.b` as-is (no exception is thrown)
