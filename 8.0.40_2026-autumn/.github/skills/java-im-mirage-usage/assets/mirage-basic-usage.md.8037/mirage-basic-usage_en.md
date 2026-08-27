# im_mirage Basic Usage Patterns (Java Version)

For the attributes and signatures of each class/annotation, see `reference/mirage-api-reference.md`. This document shows typical implementation patterns.

## Architecture and Responsibility Split (Most Important)

The responsibilities and transaction boundaries of the Repository, Service, and Endpoint (Web API Maker, covered by `java-im-web-api-maker-usage`) layers are as follows.

| Layer | Calls | Transaction boundary | Responsibility |
|---|---|---|---|
| Repository | DAO | Establishes its own boundary via `SessionTemplate.execute` | Tightly coupled to the DAO. Write operations (insert/update/delete) are basically processed one unit (one Entity) at a time. For SELECT (retrieval) only, all matching records may be returned as a list |
| Service | Repository (may call multiple) | Establishes its own boundary via `SessionTemplate.execute` **only when combining multiple Repository method calls into a single operation** | When it only needs a single Repository method call to complete, it becomes a thin wrapper around that Repository (in this case `SessionTemplate` is not needed on the Service side) |
| Endpoint | Service | None (does not use `SessionTemplate` directly) | The first entry point on URL access. Performs only parameter conversion and does not handle `SessionTemplate`/`DAOFactory` directly |

- **The Service establishes its own transaction boundary with `SessionTemplate.execute` only when it combines multiple Repository method calls into a single operation.** If it is just a thin wrapper calling a single Repository method, the Repository's own `SessionTemplate.execute` is sufficient, and the Service does not need to establish an additional boundary on top of it
- **When crossing multiple Repositories, `SessionTemplate` is designed to detect nested calls: the inner (Repository) `execute` called from within a transaction already started by the outer (Service) does not commit/rollback and defers to the outer one. As a result, even when `SessionTemplate.execute` is layered multiple times across `Service → Repository → DAO`, it is treated as a single transaction** (see "Pattern 6: Transaction Management" for details)
- **When designing a Repository to return a "domain model" that does not map 1:1 to a single Entity, the Entity ⇔ model conversion is the Repository's responsibility.** The code examples on this page return the Entity as-is to the Service layer for simplicity, but you may add model conversion depending on requirements

## Pattern 1: Entity Class

Follow the conventions in `.github/instructions/java-entity.instructions.md` (public fields, no-argument constructor, the 4 audit fields).

```java
package jp.co.example.foo.entity;

import java.math.BigDecimal;
import java.sql.Timestamp;

import jp.co.intra_mart.mirage.annotation.Column;
import jp.co.intra_mart.mirage.annotation.PrimaryKey;
import jp.co.intra_mart.mirage.annotation.PrimaryKey.GenerationType;
import jp.co.intra_mart.mirage.annotation.Table;

/**
 * Order information entity.<br>
 * The {@code foo_} in the table name {@code foo_order} is a prefix derived from the placeholder
 * company name used throughout this document (the same as the {@code jp.co.example.foo} package),
 * not a word that carries domain meaning, so it is omitted from the class name (see "Correspondence
 * Between Class Names and Table Names" at the end of this pattern).
 */
@Table(name = "foo_order")
public class OrderEntity {

    @PrimaryKey(generationType = GenerationType.APPLICATION)
    @Column(name = "order_id")
    public String orderId;

    @Column(name = "customer_name")
    public String customerName;

    @Column(name = "amount")
    public BigDecimal amount;

    @Column(name = "status")
    public String status;

    @Column(name = "create_user_cd")
    public String createUserCd;

    @Column(name = "create_date")
    public Timestamp createDate;

    @Column(name = "record_user_cd")
    public String recordUserCd;

    @Column(name = "record_date")
    public Timestamp recordDate;
}
```

- This project uses only `GenerationType.APPLICATION` for the `generationType` of `@PrimaryKey` (see `.github/instructions/java-entity.instructions.md`)
- Always include the 4 audit fields. Since the DAO side (`AbstractDAO`) sets the values automatically, the entity side only needs to declare them

### Correspondence Between Class Names and Table Names (An Aspiration, Not a Mandatory Rule)

**For most tables, the basic approach is a straightforward PascalCase conversion of the table name (snake_case)** (e.g. `order_status_history` → `OrderStatusHistoryEntity`). **This is not a mandatory rule; it is an aspiration to keep in mind during implementation.** Mechanically enforcing the correspondence can, for table names that carry a module prefix or an abbreviation, let that prefix/abbreviation leak straight into the class name and end up hurting readability instead — only in that case is a readability-first meaning-based translation allowed.

- Example: `foo_order` → `OrderEntity` (`foo_` is the placeholder company-name prefix shared across this document and carries no domain meaning, so it is omitted; a real project's module prefixes such as `b_m_`/`b_t_` may be treated the same way)
- Example: `b_m_account_b` → `AccountBasicInfoEntity` (the abbreviation `b_m_account_b` is hard to read meaningfully under a literal conversion, so it is given a meaning-based English name instead)
- Even when a prefix has been removed or an abbreviation given a meaning-based translation, spell out the real table name in `@Table(name = "...")` and also record it in the class's JavaDoc, so the correspondence between the table name and the class name stays traceable (see the Pattern 1 example on this page, and the already-implemented `AccountBasicInfoEntity`)

## Pattern 2: DAO Class (Basic CRUD, Extending `AbstractDAO` Only)

When no custom query is needed, insert/update/delete/find are available simply by extending `AbstractDAO`.

```java
package jp.co.example.foo.dao;

import jp.co.intra_mart.mirage.ext.dao.AbstractDAO;
import jp.co.example.foo.entity.OrderEntity;

/**
 * DAO for operating on foo_order.
 */
public class OrderDAO extends AbstractDAO<OrderEntity> {
}
```

**Never use a DAO directly via `new`; always call it through `DAOFactory` and within a transaction boundary established by `SessionTemplate.execute(SessionCallback)`.** For the concrete implementation on the caller side (`OrderRepository`/`StandardOrderRepository`), see "Pattern 6: Transaction Management and the Repository Layer".

- Basic methods provided by `AbstractDAO`: `insert`/`insertBatch`/`update`/`updateBatch`/`delete`/`deleteBatch`/`find(Object... ids)`
- The arguments to `find` are the primary key values (for a composite primary key, specify multiple values in declaration order)

## Pattern 3: DAO Class (Custom Query Using a 2WaySQL SQL File)

For queries that basic CRUD cannot express, such as list searches and aggregations, implement them with a SQL file plus a `sqlManager` call.

```java
package jp.co.example.foo.dao;

import java.util.List;

import jp.co.intra_mart.mirage.ext.dao.AbstractDAO;
import jp.co.example.foo.entity.OrderEntity;

/**
 * DAO for operating on foo_order.
 */
public class OrderDAO extends AbstractDAO<OrderEntity> {

    /** SQL file path (relative to the classpath root) */
    private static final String SQL_PATH = "jp/co/example/foo/dao/";

    /** SQL for retrieving the order list by status */
    private static final String SELECT_ORDERS_BY_STATUS = "select_orders_by_status.sql";

    /** SQL for retrieving the order count */
    private static final String SELECT_ORDER_COUNT = "select_order_count.sql";

    /**
     * Retrieves the order list for the specified status.
     * @param status the status to search for (all records if null)
     * @return the order list
     */
    public List<OrderEntity> findByStatus(final String status) {
        final OrderEntity param = new OrderEntity();
        param.status = status;
        return super.sqlManager.getResultList(OrderEntity.class, SQL_PATH.concat(SELECT_ORDERS_BY_STATUS), param);
    }

    /**
     * Retrieves the order count for the given status.
     * @param status the status to search for
     * @return the count
     */
    public int countByStatus(final String status) {
        final OrderEntity param = new OrderEntity();
        param.status = status;
        return super.sqlManager.getCount(SQL_PATH.concat(SELECT_ORDER_COUNT), param);
    }
}
```

SQL file (place it under `src/main/resources`, using the same package path as the DAO class. In the example above: `src/main/resources/jp/co/example/foo/dao/select_orders_by_status.sql`):

```sql
SELECT
  order_id,
  customer_name,
  amount,
  status
FROM
  foo_order
/*BEGIN*/
WHERE
  /*IF status != null*/
  status = /*status*/'dummy'
  /*END*/
/*END*/
ORDER BY
  order_id
```

- **Place SQL files under `src/main/resources`, not `src/main/java`.** Reproduce the same package path as the DAO class (the relative path of the `sqlPath` constant) under `src/main/resources`. If it is placed only under `src/main/java`, it will not be included in the runtime classpath after the build, resulting in a `resource: xxx.sql is not found.` error (the source tree of the platform-standard feature, where `.java` and `.sql` appear to sit side by side in the same directory, is the pre-build repository layout, which is different from the Maven-standard `src/main/resources` layout)
- Parameters can be passed as an entity, or as any JavaBean or `Map<String, Object>`. Match the placeholder names in the SQL (such as `/*status*/`) with the property/key names
- The basic 2WaySQL syntax (`/*IF*/`/`/*BEGIN*/`/`/*param*/'dummy'`) is common with the JSSP side (`.github/instructions/jssp-2way-sql.instructions.md`). The role of dummy values and the escaping approach for LIKE searches follow the same thinking as well

## Pattern 4: `/*FOR*/` Loop Syntax (im_mirage-Specific)

Not supported in the JSSP script development model, but usable in im_mirage for dynamically generating IN clauses, etc.

```sql
SELECT
  order_id,
  customer_name
FROM
  foo_order
WHERE
  order_id IN (
    /*FOR orderId : orderIds*/
    /*orderId*/'dummy'
    /*IF orderId_has_next*/, /*END*/
    /*END*/
  )
```

```java
public List<OrderEntity> findByIds(final List<String> orderIds) {
    final java.util.Map<String, Object> param = new java.util.HashMap<String, Object>();
    param.put("orderIds", orderIds);
    return super.sqlManager.getResultList(OrderEntity.class, SQL_PATH.concat("select_orders_by_ids.sql"), param);
}
```

## Pattern 5: DB-Dialect-Specific SQL Files

Add dialect-specific files only when there is a syntax difference for a particular DB product (there is no need to mechanically duplicate the file for every dialect).

```
src/main/resources/jp/co/example/foo/dao/
├── select_orders_by_status.sql            … base file (used as-is for PostgreSQL etc., where there is no difference)
├── select_orders_by_status_oracle.sql     … added only when Oracle-specific syntax is needed
└── select_orders_by_status_sqlserver.sql  … added only when SQLServer-specific syntax is needed
```

- At runtime, `SqlManager` preferentially looks for `<base name>_<dialect name>.sql` according to the DB dialect in use, and falls back to the base file if none is found
- The dialect names are `oracle`/`postgre`/`sqlserver` (see `reference/mirage-api-reference.md`)

## Pattern 6: Transaction Management and the Repository Layer (`SessionTemplate`/`SessionCallback`, Recommended Pattern)

DB update processing must always run within a transaction boundary established by `SessionTemplate.execute(SessionCallback)`. Platform-standard features (such as IM-Wiki) encapsulate DAO calls with a "Repository interface + Standard implementation class", hiding the details of DB access from the domain layer by having the business logic (Service layer) go through the Repository instead of calling the DAO directly. **Do not create a DAO directly with `new`, and do not call a DAO obtained from `DAOFactory` without wrapping it in `SessionTemplate`.**

```java
package jp.co.example.foo.repository;

import java.util.List;

import jp.co.example.foo.entity.OrderEntity;

/**
 * Repository interface responsible for persisting order information.
 */
public interface OrderRepository {
    void register(OrderEntity order);
    List<OrderEntity> findByStatus(String status);
}
```

```java
package jp.co.example.foo.repository;

import java.util.List;

import jp.co.intra_mart.mirage.ext.dao.DAOFactory;
import jp.co.intra_mart.mirage.ext.session.SessionCallback;
import jp.co.intra_mart.mirage.ext.session.SessionTemplate;
import jp.co.intra_mart.mirage.session.Session;

import jp.co.example.foo.dao.OrderDAO;
import jp.co.example.foo.entity.OrderEntity;

/**
 * Standard implementation class of {@link OrderRepository}.
 */
public class StandardOrderRepository implements OrderRepository {

    @Override
    public void register(final OrderEntity order) {
        SessionTemplate.execute(new SessionCallback<Void, RuntimeException>() {
            @Override
            public Void execute(final Session session) {
                final OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class);
                dao.insert(order);   // createUserCd/createDate are set automatically
                return null;
            }
        });
    }

    @Override
    public List<OrderEntity> findByStatus(final String status) {
        return SessionTemplate.execute(new SessionCallback<List<OrderEntity>, RuntimeException>() {
            @Override
            public List<OrderEntity> execute(final Session session) {
                final OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class);
                return dao.findByStatus(status);
            }
        });
    }
}
```

- `SessionTemplate.execute(...)` automatically performs `begin`/`commit`/`rollback`/`release`. If an exception occurs inside the callback, it is automatically rolled back
- When already inside a transaction (a nested call), the inner `execute` does not commit/rollback and defers to the outer one (`SessionTemplate` determines this automatically)
- Wrapping even read-only processing with `SessionTemplate.execute` is the standard pattern (to unify connection acquisition/release)
- The Repository is meant to be called from a higher-level Service class (the business logic layer), with the DAO hidden as an internal implementation detail of the Repository. For a concrete Service class implementation, see "Pattern 7: Service Layer"

### Repository Factory Class (`ServiceLoaderUtil`, Recommended)

Rather than the caller instantiating `new StandardOrderRepository()` directly, obtain the instance through a factory class. Using `loadTopPriority` from `jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil`, simply registering the highest-priority implementation class under `META-INF/services/<interface FQN>` turns this into a swappable extension point (falling back to the default implementation when nothing is registered).

```java
package jp.co.example.foo.repository;

import jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil;

/**
 * Factory class for obtaining an instance of {@link OrderRepository}.
 */
public final class OrderRepositoryFactory {

    private static final class LazyHolder {
        private static final OrderRepository INSTANCE = createInstance();

        private static OrderRepository createInstance() {
            final OrderRepository topPriority = ServiceLoaderUtil.loadTopPriority(OrderRepository.class);
            return topPriority != null ? topPriority : new StandardOrderRepository();
        }
    }

    private OrderRepositoryFactory() {
    }

    /**
     * Obtains an instance of {@link OrderRepository}.
     * @return the Repository instance
     */
    public static OrderRepository getInstance() {
        return LazyHolder.INSTANCE;
    }
}
```

The caller (Service layer) uses `OrderRepositoryFactory.getInstance()` instead of `new StandardOrderRepository()`.

```java
private final OrderRepository orderRepository = OrderRepositoryFactory.getInstance();
```

- **`ServiceLoaderUtil.loadPriority(Class)` returns all registered implementations as a `Collection` ordered by priority (`@Priority`).** When you only want a single instance, use `loadTopPriority(Class)` (`jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil`; returns `null` when nothing is registered), which takes the first element for you. Using `loadPriority`, which returns a `Collection`, as-is to obtain a Repository would force every caller to repeat the logic of extracting the first element, which is redundant — `loadTopPriority` is the better fit for resolving a single implementation
- Writing the fully-qualified name of the implementation class on one line in the `META-INF/services/jp.co.example.foo.repository.OrderRepository` file makes it discoverable through the standard Java `ServiceLoader` mechanism. To specify priority explicitly, annotate the implementation class with `@jp.co.intra_mart.common.annotation.Priority(value)` (the higher the value, the higher the priority; an implementation without `@Priority` has lower priority than one that specifies it)
- If nothing is registered under `META-INF/services`, it falls back to `StandardOrderRepository`. Thanks to this mechanism, another module (such as a plugin) can register a higher-priority implementation to swap it in without changing any caller code
- Implement `OrderItemRepositoryFactory` following the same pattern (the code is omitted here since it mirrors Pattern 2)

## Pattern 7: Service Layer (Calling Multiple Repositories Within the Same Transaction)

The Service is the business logic layer that calls Repositories. **Only when you want to combine an operation that spans multiple Repositories (i.e. multiple tables) into a single transaction should the Service itself establish the boundary with `SessionTemplate.execute`.** When it only needs to call a single Repository method, the Repository's own boundary is sufficient, and there is no need to use `SessionTemplate` again on the Service side.

```java
package jp.co.example.foo.repository;

import jp.co.example.foo.entity.OrderItemEntity;

/**
 * Repository interface responsible for persisting order item information.
 */
public interface OrderItemRepository {
    void register(OrderItemEntity item);
}
```

```java
package jp.co.example.foo.repository;

import jp.co.intra_mart.mirage.ext.dao.DAOFactory;
import jp.co.intra_mart.mirage.ext.session.SessionCallback;
import jp.co.intra_mart.mirage.ext.session.SessionTemplate;
import jp.co.intra_mart.mirage.session.Session;

import jp.co.example.foo.dao.OrderItemDAO;
import jp.co.example.foo.entity.OrderItemEntity;

/**
 * Standard implementation class of {@link OrderItemRepository}.
 * The DAO implementation ({@code OrderItemDAO extends AbstractDAO<OrderItemEntity>}) is omitted since it is the same as Pattern 2.
 */
public class StandardOrderItemRepository implements OrderItemRepository {

    @Override
    public void register(final OrderItemEntity item) {
        SessionTemplate.execute(new SessionCallback<Void, RuntimeException>() {
            @Override
            public Void execute(final Session session) {
                final OrderItemDAO dao = DAOFactory.getTenantDatabaseDAO(OrderItemDAO.class);
                dao.insert(item);
                return null;
            }
        });
    }
}
```

**The Service is likewise split into "interface + Standard implementation class + factory class", just like the Repository.** The caller (Endpoint) depends only on the `OrderService` interface, and obtains the implementation via `OrderServiceFactory.getInstance()`.

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.example.foo.entity.OrderEntity;
import jp.co.example.foo.entity.OrderItemEntity;

/**
 * Service interface providing the business logic for order information.
 */
public interface OrderService {
    void register(OrderEntity order, List<OrderItemEntity> items);
    List<OrderEntity> findByStatus(String status);
}
```

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.intra_mart.mirage.ext.session.SessionCallback;
import jp.co.intra_mart.mirage.ext.session.SessionTemplate;
import jp.co.intra_mart.mirage.session.Session;

import jp.co.example.foo.entity.OrderEntity;
import jp.co.example.foo.entity.OrderItemEntity;
import jp.co.example.foo.repository.OrderItemRepository;
import jp.co.example.foo.repository.OrderItemRepositoryFactory;
import jp.co.example.foo.repository.OrderRepository;
import jp.co.example.foo.repository.OrderRepositoryFactory;

/**
 * Standard implementation class of {@link OrderService}.
 */
public class StandardOrderService implements OrderService {

    private final OrderRepository orderRepository = OrderRepositoryFactory.getInstance();
    private final OrderItemRepository orderItemRepository = OrderItemRepositoryFactory.getInstance();

    /**
     * Registers the order header and order items in the same transaction.<br>
     * Because this operation spans multiple Repositories — {@link OrderRepository} (the foo_order table)
     * and {@link OrderItemRepository} (the foo_order_item table) — the Service itself establishes
     * the transaction boundary with {@code SessionTemplate.execute}, and the Repository-side
     * {@code SessionTemplate.execute} calls (nested calls) join this boundary.
     *
     * @param order the order header
     * @param items the list of order items
     */
    @Override
    public void register(final OrderEntity order, final List<OrderItemEntity> items) {
        SessionTemplate.execute(new SessionCallback<Void, RuntimeException>() {
            @Override
            public Void execute(final Session session) {
                orderRepository.register(order);
                for (final OrderItemEntity item : items) {
                    orderItemRepository.register(item);
                }
                return null;
            }
        });
    }

    /**
     * When only calling a single Repository method, the Service becomes a thin wrapper.<br>
     * In this case, since the Repository side ({@code StandardOrderRepository#findByStatus})
     * has already established the boundary with {@code SessionTemplate.execute}, there is no
     * need for the Service side to establish an additional transaction boundary.
     *
     * @param status the status to search for
     * @return the order list
     */
    @Override
    public List<OrderEntity> findByStatus(final String status) {
        return orderRepository.findByStatus(status);
    }
}
```

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil;

/**
 * Factory class for obtaining an instance of {@link OrderService}.<br>
 * The implementation pattern is the same as {@code OrderRepositoryFactory} (see Pattern 6).
 */
public final class OrderServiceFactory {

    private static final class LazyHolder {
        private static final OrderService INSTANCE = createInstance();

        private static OrderService createInstance() {
            final OrderService topPriority = ServiceLoaderUtil.loadTopPriority(OrderService.class);
            return topPriority != null ? topPriority : new StandardOrderService();
        }
    }

    private OrderServiceFactory() {
    }

    /**
     * Obtains an instance of {@link OrderService}.
     * @return the Service instance
     */
    public static OrderService getInstance() {
        return LazyHolder.INSTANCE;
    }
}
```

- When a Service spans multiple Repositories, it calls each Repository's method within its own transaction boundary. The Repository-side `SessionTemplate.execute` calls are detected as nested calls and join the commit/rollback of the outer (Service) boundary
- **For a Service method that only calls a single Repository method (such as `findByStatus`), `SessionTemplate.execute` is unnecessary.** Since the Repository-side boundary alone is sufficient, adding another boundary on the Service side would be redundant. The Service uses `SessionTemplate` only when it wants to combine multiple Repository method calls into a single operation
- The Repository's write methods (equivalent to `insert`/`update`/`delete`) are basically implemented to handle one record (one Entity) at a time. When you need to handle multiple records together, either have the Service layer loop and call the Repository multiple times (see the `register` method in this pattern), or use a batch method such as `insertBatch`
- The Endpoint (Web API Maker) depends only on the `OrderService` interface, and obtains the instance via `OrderServiceFactory.getInstance()`. It does not handle `SessionTemplate`/`DAOFactory` directly (see `java-im-web-api-maker-usage`)

## Pattern 8: Anti-Patterns Collection (Things to Avoid)

```java
// NG: Creating a DAO directly with new
OrderDAO dao = new OrderDAO();  // The sqlManager field stays unset, resulting in a NullPointerException

// NG: Manually setting the audit fields
order.createUserCd = "system";  // Unnecessary and risks double-setting, since AbstractDAO#insert sets it automatically
order.createDate = new java.sql.Timestamp(System.currentTimeMillis());
dao.insert(order);

// NG: Confusing SqlManager's SQL-file-based methods with the xxxBySql methods
sqlManager.getResultList(OrderEntity.class, "SELECT * FROM foo_order", param);
// -> The second argument is interpreted as a SQL file path. Use getResultListBySql if you want to pass a SQL string directly

// NG: Executing write processing outside a transaction boundary
OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class);
dao.insert(order);  // Not wrapped by SessionTemplate.execute

// NG: Reusing a JSSP 2WaySQL file as-is on the Java side (besides the presence/absence of /*FOR*/,
// the way parameters are passed (object/Map/Bean) and the calling API differ, so it must be rewritten)

// NG: The Service does not establish a transaction boundary even though the processing spans multiple Repositories
// -> orderRepository.register and orderItemRepository.register each get committed in a separate
//    transaction, which can result in an inconsistency where only one of them succeeds
public void register(final OrderEntity order, final List<OrderItemEntity> items) {
    orderRepository.register(order);          // Committed independently inside the Repository
    for (final OrderItemEntity item : items) {
        orderItemRepository.register(item);   // Committed in a separate transaction
    }
}

// NG: The Endpoint (Web API Maker) handles SessionTemplate/DAOFactory directly
// -> The owner of the transaction boundary is no longer the Service layer, and the responsibility leaks into the Endpoint
@Path("/foo/orders/{orderId}")
@GET
public OrderEntity get(@Variable(name = "orderId") final String orderId) {
    return SessionTemplate.execute(new SessionCallback<OrderEntity, RuntimeException>() {
        public OrderEntity execute(final Session session) {
            return DAOFactory.getTenantDatabaseDAO(OrderDAO.class).find(orderId);
        }
    });
}

// NG: Instantiating a Repository/Service directly with new StandardXxx()
// -> Bypasses the factory class (the extension point provided by ServiceLoaderUtil.loadTopPriority),
//    so the caller ends up depending on the concrete class and cannot be swapped for a higher-priority implementation
private final OrderRepository orderRepository = new StandardOrderRepository();  // Use OrderRepositoryFactory.getInstance() instead

// NG: Using loadPriority (which returns a Collection) as-is to obtain a single implementation
// -> Forces every caller to duplicate the logic of extracting the first element. Use loadTopPriority when you want a single instance
final Collection<OrderRepository> repositories = ServiceLoaderUtil.loadPriority(OrderRepository.class);
final OrderRepository repository = repositories.isEmpty() ? new StandardOrderRepository() : repositories.iterator().next();
```
