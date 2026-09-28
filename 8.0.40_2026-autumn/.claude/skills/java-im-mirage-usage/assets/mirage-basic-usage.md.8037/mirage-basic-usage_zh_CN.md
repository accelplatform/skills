# im_mirage 基本使用模式（Java 版）

各类/注解的属性和签名请参考 `reference/mirage-api-reference.md`。本文展示典型的实现模式。

## 架构与职责划分（最重要）

Repository、Service、Endpoint（Web API Maker，`java-im-web-api-maker-usage` 的对象）的职责与事务边界如下所示。

| 层 | 调用对象 | 事务边界 | 职责 |
|---|---|---|---|
| Repository | DAO | 通过 `SessionTemplate.execute` 自行划定边界 | 与 DAO 紧密耦合。写入类操作（insert/update/delete）原则上以1条（1个 Entity）为单位处理。仅 SELECT（获取）操作可以将符合条件的全部记录以列表形式返回 |
| Service | Repository（可多个） | **仅当需要将多个 Repository 方法整合为一个操作时**，才通过 `SessionTemplate.execute` 自行划定边界 | 若仅调用单个 Repository 方法即可完成，则作为该 Repository 的一层薄包装（此时 Service 侧不需要 `SessionTemplate`） |
| Endpoint | Service | 不持有（不直接使用 `SessionTemplate`） | URL 访问时的最初入口点。仅进行参数转换，不直接操作 `SessionTemplate`/`DAOFactory` |

- **Service 通过 `SessionTemplate.execute` 自行划定事务边界，仅限于需要将多个 Repository 方法调用整合为一个操作的情况。** 如果只是调用单个 Repository 方法的薄包装，仅靠 Repository 侧的 `SessionTemplate.execute` 就已足够，Service 侧无需重复划定边界
- **当跨越多个 Repository 时，`SessionTemplate` 会检测嵌套调用，内侧（Repository）的 `execute`（在外侧即 Service 已开始的事务中被调用）不会执行 commit/rollback，而是交由外侧处理，因此即使 `Service → Repository → DAO` 多层重叠调用 `SessionTemplate.execute`，也会作为同一个事务处理**（详见"模式6：事务管理"）
- **当 Repository 设计为返回与单个 Entity 不是 1:1 对应的"领域模型"时，Entity ⇔ 模型的相互转换应作为 Repository 的职责。** 本页的代码示例为简化起见，直接将 Entity 返回给 Service 层，可根据需要追加模型转换

## 模式1：实体类

遵循 `.claude/rules/java-entity.md` 的规约（public 字段、无参构造函数、4个审计项目字段）。

```java
package jp.co.example.foo.entity;

import java.math.BigDecimal;
import java.sql.Timestamp;

import jp.co.intra_mart.mirage.annotation.Column;
import jp.co.intra_mart.mirage.annotation.PrimaryKey;
import jp.co.intra_mart.mirage.annotation.PrimaryKey.GenerationType;
import jp.co.intra_mart.mirage.annotation.Table;

/**
 * 订单信息实体类。<br>
 * 表名 {@code foo_order} 中的 {@code foo_} 是本文档通篇使用的占位企业名前缀
 * （与包名 {@code jp.co.example.foo} 相同），并非表示领域含义的词语，因此
 * 从类名中省略（参见本模式末尾的"类名与表名的对应关系"）。
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

- `@PrimaryKey` 的 `generationType` 在本项目中仅使用 `GenerationType.APPLICATION`（参见 `.claude/rules/java-entity.md`）
- 4个审计项目字段必须包含。值的设置由 DAO 侧（`AbstractDAO`）自动完成，实体侧只需声明即可

### 类名与表名的对应关系（努力目标，非强制规则）

**大多数表的基本原则是将表名（蛇形命名）直接转换为帕斯卡命名**（例如：`order_status_history` → `OrderStatusHistoryEntity`）。**这并非强制规则，而是希望在实现时留意的努力目标。** 如果机械式地强制对应关系，带有模块前缀或缩写的表名会原样混入类名，反而会损害可读性，仅在这种情况下才允许以可读性优先进行意译。

- 示例：`foo_order` → `OrderEntity`（`foo_` 是本文档通用的占位企业名前缀，并非表示领域含义的词语，因此予以省略。实际项目中的 `b_m_`/`b_t_` 等模块前缀也可按同样方式处理）
- 示例：`b_m_account_b` → `AccountBasicInfoEntity`（缩写 `b_m_account_b` 如果直接转换难以理解其含义，因此意译为含义清晰的英文名称）
- 即使进行了前缀省略或缩写意译，也应在 `@Table(name = "...")` 中明确写出实际表名，并在类的 JavaDoc 中同样记载表名，以便追踪表名到类名的对应关系（参见本页模式1的示例，以及已实现的 `AccountBasicInfoEntity`）

## 模式2：DAO类（基本 CRUD，仅继承 `AbstractDAO`）

如不需要自定义查询，只需继承 `AbstractDAO` 即可使用 insert/update/delete/find。

```java
package jp.co.example.foo.dao;

import jp.co.intra_mart.mirage.ext.dao.AbstractDAO;
import jp.co.example.foo.entity.OrderEntity;

/**
 * 操作 foo_order 的 DAO。
 */
public class OrderDAO extends AbstractDAO<OrderEntity> {
}
```

**DAO 不能直接用 `new` 创建，必须经由 `DAOFactory` 获取，并且必须在 `SessionTemplate.execute(SessionCallback)` 的事务边界内调用。** 调用侧的具体实现（`OrderRepository`/`StandardOrderRepository`）请参考"模式6：事务管理与 Repository 层"。

- `AbstractDAO` 提供的基本方法：`insert`/`insertBatch`/`update`/`updateBatch`/`delete`/`deleteBatch`/`find(Object... ids)`
- `find` 的参数为主键的值（复合主键时按声明顺序指定多个）

## 模式3：DAO类（自定义查询，使用 2WaySQL 的 SQL 文件）

列表检索、汇总等基本 CRUD 无法表达的查询，通过 SQL 文件 + `sqlManager` 调用来实现。

```java
package jp.co.example.foo.dao;

import java.util.List;

import jp.co.intra_mart.mirage.ext.dao.AbstractDAO;
import jp.co.example.foo.entity.OrderEntity;

/**
 * 操作 foo_order 的 DAO。
 */
public class OrderDAO extends AbstractDAO<OrderEntity> {

    /** SQL 文件路径（以类路径为起点） */
    private static final String SQL_PATH = "jp/co/example/foo/dao/";

    /** 按状态获取订单列表的 SQL */
    private static final String SELECT_ORDERS_BY_STATUS = "select_orders_by_status.sql";

    /** 按状态获取订单件数的 SQL（从列表获取 SQL 中去掉 ORDER BY 的同形 SELECT） */
    private static final String SELECT_ORDERS_BY_STATUS_COUNT = "select_orders_by_status_count.sql";

    /**
     * 按指定状态获取订单列表。
     * @param status 检索对象的状态（为 null 时检索全部）
     * @return 订单列表
     */
    public List<OrderEntity> findByStatus(final String status) {
        final OrderEntity param = new OrderEntity();
        param.status = status;
        return super.sqlManager.getResultList(OrderEntity.class, SQL_PATH.concat(SELECT_ORDERS_BY_STATUS), param);
    }

    /**
     * 按状态获取订单件数。
     * @param status 检索对象的状态
     * @return 件数
     */
    public int countByStatus(final String status) {
        final OrderEntity param = new OrderEntity();
        param.status = status;
        return super.sqlManager.getCount(SQL_PATH.concat(SELECT_ORDERS_BY_STATUS_COUNT), param);
    }
}
```

SQL 文件（放置在 `src/main/resources` 下，与 DAO 类相同的包路径。上述示例中为 `src/main/resources/jp/co/example/foo/dao/select_orders_by_status.sql`）：

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

用于获取件数的 `select_orders_by_status_count.sql`（仅有无 `ORDER BY` 的区别）：

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
```

- **传给 `getCount` 的 SQL 文件中不得书写 `SELECT COUNT(*)`。** `getCount` 会将传入的 SQL 整体包裹为 `SELECT COUNT(*) FROM (<传入的 SQL>)` 这样的子查询，因此若书写了 `SELECT COUNT(*)`，就会变成 `SELECT COUNT(*) FROM (SELECT COUNT(*) ...)`，**不抛出异常而始终返回 `1`**。应传入与列表获取相同形式的 SELECT
- **传给 `getCount` 的 SQL 文件中不得书写 `ORDER BY`。** 由于它会进入子查询内部，在 SQLServer 中会导致语法错误。应如上所示，拆分为列表获取用与件数获取用两个文件
- **不要在 SQL 文件中书写 `--` 注释。** 2WaySQL 的解析器不会区分 `--` 行注释的内容，而是扫描整个文件来检测模板语法。因此，如果在说明性注释中写入了 `/*IF*/` 等语法记号、实际的绑定名或 `?` 字面量，即使它只是注释，也会被误判为真正的模板指令，从而产生与注释内容看似无关的运行时错误（`UnsupportedOperationException: not supported`、"列索引超出范围"等）。SQL 文件的目的与验证要点应写在调用方（DAO 方法）的 JavaDoc 中，而不是写在 SQL 文件里；SQL 文件中只应放置实际执行的 SQL 正文（详细内容与具体示例参见 `.claude/rules/jssp-2way-sql.md`）
- **SQL 文件应放置在 `src/main/resources` 下，而不是 `src/main/java` 下。** 需要在 `src/main/resources` 下重现与 DAO 类相同的包路径（`sqlPath` 常量的相对路径）。如果只放在 `src/main/java` 下，构建后的运行时类路径不会包含该文件，会导致 `resource: xxx.sql is not found.` 错误（`.java` 与 `.sql` 看似同处于同一目录下的平台标准功能源代码树，是构建前的仓库结构，与 Maven 标准布局的 `src/main/resources` 是不同的东西）
- 参数可以传递实体，或任意的 JavaBean、`Map<String, Object>`。需要使 SQL 内的占位符名称（`/*status*/` 等）与属性名/键名一致
- 2WaySQL 的基本语法（`/*IF*/`/`/*BEGIN*/`/`/*param*/'dummy'`）与 JSSP 侧（`.claude/rules/jssp-2way-sql.md`）通用。哑值的作用、LIKE 检索时的转义方针也可以采用相同的思路
### 注意：不要在 `/*BEGIN*/` 块内嵌套 `/*IF*/`

解析器本身支持 `/*IF*/` 的嵌套，但在 `/*BEGIN*/` 块内部嵌套时，内侧 `/*IF*/` 开头的 `AND`/`OR` 会成为前置符去除的对象；当外侧 `/*IF*/` 是该块内最先成立的条件时，这个前置符会被错误地去除（因为 `IfNode` 要等处理完子节点后才会设置「已输出」标志）。结果会变成 `WHERE a = ? b = ?` 这样不正确的 SQL。若先行的兄弟条件已经成立，则能正确输出，因此是否出错取决于参数的组合。外侧 IF 是该块内最先成立的条件时会出现 `PSQLException`，而先行的兄弟条件先成立时则能正常工作。

多个条件不要嵌套，应并列为兄弟关系，依赖关系用条件表达式来表示。

```sql
/*IF status != null*/
status = /*status*/'dummy'
/*END*/
/*IF status != null && categoryCd != null*/
AND category_cd = /*categoryCd*/'dummy'
/*END*/
```

（内侧块不以 `AND`/`OR`/`,` 开头的嵌套——例如用于切换运算符或值片段的用途——不受此问题影响，可以使用。）

## 模式4：IN 子句的动态生成（`IN /*param*/('dummy')`）

将 `List` 或数组展开到 IN 子句时，使用在 `/*param*/` 之后紧跟 `('dummy')` 的**带括号的绑定**。运行时会按元素个数展开为 `(?, ?, ?)`。**不要用 `/*FOR*/` 拼装 IN 子句。**

```sql
SELECT
  order_id,
  customer_name
FROM
  foo_order
/*BEGIN*/
WHERE
  /*IF orderIds != null && orderIds.size() > 0*/
  AND order_id IN /*orderIds*/('dummy')
  /*END*/
/*END*/
```

```java
public List<OrderEntity> findByIds(final List<String> orderIds) {
    final OrderIdsCondition condition = new OrderIdsCondition(orderIds);
    return super.sqlManager.getResultList(OrderEntity.class, SQL_PATH.concat("select_orders_by_ids.sql"), condition);
}

/**
 * 用于 IN 句动态生成的检索条件（public 字段的 JavaBean）。
 */
public class OrderIdsCondition {
    public List<String> orderIds;
    public OrderIdsCondition(final List<String> orderIds) {
        this.orderIds = orderIds;
    }
}
```

- **必须同时守护 `null` 与空列表。** `IN /*param*/('dummy')` 无论为 `null` 还是空列表，绑定部分都会连同一起不被输出，因此没有守护时 `IN` 会裸露残留，导致 SQL 损坏。仅有 `/*IF orderIds != null*/` 会放过空列表，从而生成 `WHERE order_id IN ` 这样损坏的 SQL
- OGNL 对 `&&` 进行短路求值，因此即使 `orderIds` 为 `null`，`size()` 也不会被求值，不会引发 `NullPointerException`。`size() != 0` 与 `size() > 0` 使用哪种都可以
- 在 JSSP 侧，`/*IF*/` 的表达式为 JavaScript，因此应写作 `/*IF orderIds != null && orderIds.length > 0*/`

### 【重要】该守卫可能使空列表的结果从「0 条」变为「全部记录」

如上所述，当 IN 子句守卫是 `/*BEGIN*/` 内唯一的条件时，若 `orderIds` 为 `null` 或空列表，`/*IF*/` 内部的内容会消失，导致 `/*BEGIN*/` 块变空，从而**整个 `WHERE` 子句都会被删除**（这符合 `/*BEGIN*/` 的基本行为：内部内容全部消失时，`WHERE` 等也会自动删除）。
其结果是虽不会产生 SQL 错误，但返回的并非预期的「无匹配对象（0 条）」，而是**不加筛选的全部记录**。

若业务意图是「调用方传入空列表时，结果也应为空」，则**不能仅依赖 SQL 侧的守卫**，还应在调用方（Repository / Service 层）增加应用层守卫：判断 `null`／空列表后直接返回空列表，而不执行该 SQL。尤其是在授权／权限过滤场景（例如将可访问的 ID 列表传入 `IN` 子句）中使用该结构时，这是防止空列表意外导致全部数据泄露的必要对策。

### `/*FOR*/` 循环语法

在 im_mirage 与 LogicDesigner 中可用，JSSP（脚本开发模型）不支持。**分隔符为前后各夹一个半角空格的 `in` 或 `IN`。**

```sql
SELECT
  ticket_id
FROM
  foo_ticket
/*BEGIN*/
WHERE
/*FOR ticketId in ticketIdList*/
OR ticket_id = /*ticketId*/'dummy'
/*END*/
/*END*/
```

- **当主体以 `AND`/`OR`/`,` 开头时，需用 `/*BEGIN*/` 包围。** 开头的前置符仅在「所包围的块尚为空时」才会被去除，因此没有 `/*BEGIN*/` 时第 1 条的 `OR` 会残留，生成 `WHERE OR ticket_id = ?` 这样损坏的 SQL
- **块内可引用的只有绑定到循环变量名（`ticketId`）上的单个元素。** IN 子句的动态生成请使用本模式开头的 `IN /*param*/('dummy')`

### 【重要】不要期望 UPDATE 语句的 SET 子句中 `/*BEGIN*/` 会去除逗号

若试图用 `/*BEGIN*/` 包裹 UPDATE 语句的 SET 子句，期待其去除各项前置的逗号，其行为不稳定，因为**结果取决于逗号在文件中的位置**。

- 若将逗号放在与 `/*IF*/` 标记**同一行的行首**，解析器能正确将其识别为前置符并予以删除
- 若将逗号**换行后置于缩进的另一行**，解析器无法将其识别为前置符，导致开头残留裸露的逗号，形成不合法的 SQL 并引发语法错误（`PSQLException` 等，错误消息示例：`ERROR: syntax error at or near ","`）

此外，`/*BEGIN*/` 在其内部所有条件均为假时，会将整个 SET 子句（连同 `SET` 关键字）一并删除，因此在没有任何待更新列的情况下，也会产生不合法的 SQL（没有 `SET` 的 `UPDATE`）。

由于**逗号前置符的删除依赖格式、容易失效，且与 `/*BEGIN*/`「全部条件为假时整块消失」的特性也存在冲突**，因此不应采用依赖 `/*BEGIN*/` 去除 SET 子句逗号的写法。

导致语法错误的示例（逗号换行置于缩进行）：

```sql
UPDATE foo_order
/*BEGIN*/
SET
  /*IF status != null*/
  , status = /*status*/'dummy'
  /*END*/
  /*IF memo != null*/
  , memo = /*memo*/'dummy'
  /*END*/
/*END*/
WHERE order_id = /*orderId*/'dummy'
```

正确示例（在 SET 子句开头始终放置一个无害的自我赋值，不依赖 `/*BEGIN*/`，让后续项目始终带逗号连接。该方式不依赖逗号的位置，也不存在 SET 子句整体消失的风险）：

```sql
UPDATE foo_order
SET
  order_id = /*orderId*/'dummy'
  /*IF status != null*/
  , status = /*status*/'dummy'
  /*END*/
  /*IF memo != null*/
  , memo = /*memo*/'dummy'
  /*END*/
WHERE order_id = /*orderId*/'dummy'
```

## 模式5：按数据库方言区分的 SQL 文件

仅在不同数据库产品之间存在语法差异时，才追加方言专用文件（不需要机械式地为所有方言复制文件）。

```
src/main/resources/jp/co/example/foo/dao/
├── select_orders_by_status.sql            … 基础文件（PostgreSQL 等无差异时使用此文件）
├── select_orders_by_status_oracle.sql     … 仅在需要 Oracle 特有语法时追加
└── select_orders_by_status_sqlserver.sql  … 仅在需要 SQLServer 特有语法时追加
```

- 运行时，`SqlManager` 会根据当前运行的数据库方言优先查找 `<基础名>_<方言名>.sql`，若不存在则回退到基础文件
- 方言名为 `oracle`/`postgre`/`sqlserver`（参见 `reference/mirage-api-reference.md`）

## 模式6：事务管理与 Repository 层（`SessionTemplate`/`SessionCallback`，推荐模式）

数据库更新处理必须在 `SessionTemplate.execute(SessionCallback)` 的事务边界内执行。平台标准功能（IM-Wiki 等）通过"Repository 接口 + Standard 实现类"封装 DAO 调用，业务逻辑（Service 层）不直接调用 DAO，而是通过 Repository 进行调用，从而将数据库访问的细节从领域层隐藏起来。**不要直接用 `new` 创建 DAO，也不要在未经 `SessionTemplate` 包装的情况下调用从 `DAOFactory` 获取的 DAO。**

```java
package jp.co.example.foo.repository;

import java.util.List;

import jp.co.example.foo.entity.OrderEntity;

/**
 * 负责订单信息持久化的 Repository 接口。
 */
public interface OrderRepository {
    void register(OrderEntity order);
    void updateStatus(String orderId, String status);
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
 * {@link OrderRepository} 的标准实现类。
 */
public class StandardOrderRepository implements OrderRepository {

    @Override
    public void register(final OrderEntity order) {
        SessionTemplate.execute(new SessionCallback<Void, RuntimeException>() {
            @Override
            public Void execute(final Session session) {
                final OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class);
                dao.insert(order);   // createUserCd/createDate 会自动设置
                return null;
            }
        });
    }

    @Override
    public void updateStatus(final String orderId, final String status) {
        SessionTemplate.execute(new SessionCallback<Void, RuntimeException>() {
            @Override
            public Void execute(final Session session) {
                final OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class);

                // update 会更新主键以外的全部列，因此必须先用 find() 读取，再仅反映变更点
                final OrderEntity order = dao.find(orderId);
                if (order == null) {
                    return null;   // 也可根据需求抛出异常
                }
                order.status = status;
                dao.update(order);
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

- `SessionTemplate.execute(...)` 会自动执行 `begin`/`commit`/`rollback`/`release`。回调内发生异常时会自动回滚
- 如果已处于事务中（嵌套调用），内侧的 `execute` 不会执行 commit/rollback，而是交由外侧处理（由 `SessionTemplate` 自动判定）
- 即使是仅参照的处理，也应以 `SessionTemplate.execute` 包装作为标准模式（为了统一连接的获取与释放）
- Repository 预期由更上层的 Service 类（业务逻辑层）调用，DAO 作为 Repository 的内部实现细节被隐藏起来。具体 Service 类的实现请参考"模式7：Service 层"

### Repository 的工厂类（`ServiceLoaderUtil`，推荐）

调用侧不要直接 `new StandardOrderRepository()`，而应经由工厂类获取。使用 `jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil` 的 `loadTopPriority`，只需在 `META-INF/services/<接口的FQN>` 中注册优先级更高的实现类，即可成为可替换的扩展点（未注册时会回退到默认实现）。

```java
package jp.co.example.foo.repository;

import jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil;

/**
 * 获取 {@link OrderRepository} 实例的工厂类。
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
     * 获取 {@link OrderRepository} 的实例。
     * @return Repository 实例
     */
    public static OrderRepository getInstance() {
        return LazyHolder.INSTANCE;
    }
}
```

调用侧（Service 层）不使用 `new StandardOrderRepository()`，而是使用 `OrderRepositoryFactory.getInstance()`。

```java
private final OrderRepository orderRepository = OrderRepositoryFactory.getInstance();
```

- **`ServiceLoaderUtil.loadPriority(Class)` 会以优先级（`@Priority`）顺序的 `Collection` 形式返回所有已注册的实现。** 如果只需要单个实例，应使用取出首个元素的 `loadTopPriority(Class)`（`jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil`。未注册时返回 `null`）。如果直接使用返回 `Collection` 的 `loadPriority` 来获取 Repository，调用侧每次都需要额外编写取出首个元素的处理，显得冗余，因此解析单一实现时适合使用 `loadTopPriority`
- 在 `META-INF/services/jp.co.example.foo.repository.OrderRepository` 文件中写入一行实现类的完全限定名，即可被 Java 标准的 `ServiceLoader` 机制检测到。如需明确指定优先级，可在实现类上添加 `@jp.co.intra_mart.common.annotation.Priority(值)`（值越大优先级越高。未指定的实现优先级低于已指定 `@Priority` 的实现）
- 如果未在 `META-INF/services` 中注册，则会回退到 `StandardOrderRepository`。借助该机制，其他模块（插件等）只需注册优先级更高的实现，即可在不修改调用侧代码的情况下完成替换
- 以相同模式实现 `OrderItemRepositoryFactory`（代码与模式2相同，此处省略）

## 模式7：Service 层（多个 Repository 的调用与同一事务）

Service 是调用 Repository 的业务逻辑层。**仅当需要将跨越多个 Repository（即多个表）的操作整合为同一事务时，才由 Service 自身通过 `SessionTemplate.execute` 划定边界。** 如果只是调用单个 Repository 方法，仅靠 Repository 侧的边界就已足够，Service 侧无需重复使用 `SessionTemplate`。

```java
package jp.co.example.foo.repository;

import jp.co.example.foo.entity.OrderItemEntity;

/**
 * 负责订单明细信息持久化的 Repository 接口。
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
 * {@link OrderItemRepository} 的标准实现类。
 * DAO 实现（{@code OrderItemDAO extends AbstractDAO<OrderItemEntity>}）与模式2相同，此处省略。
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

**Service 也与 Repository 相同，应拆分为"接口 + Standard 实现类 + 工厂类"。** 调用侧（Endpoint）只依赖 `OrderService` 接口，通过 `OrderServiceFactory.getInstance()` 获取实现。

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.example.foo.entity.OrderEntity;
import jp.co.example.foo.entity.OrderItemEntity;

/**
 * 提供订单信息业务逻辑的 Service 接口。
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
 * {@link OrderService} 的标准实现类。
 */
public class StandardOrderService implements OrderService {

    private final OrderRepository orderRepository = OrderRepositoryFactory.getInstance();
    private final OrderItemRepository orderItemRepository = OrderItemRepositoryFactory.getInstance();

    /**
     * 将订单头信息与订单明细信息在同一事务中登记。<br>
     * 由于这是横跨 {@link OrderRepository}（foo_order 表）与 {@link OrderItemRepository}（foo_order_item 表）
     * 这两个 Repository 的操作，因此由 Service 自身通过 {@code SessionTemplate.execute}
     * 划定事务边界，Repository 侧的 {@code SessionTemplate.execute}（嵌套调用）会汇入
     * 该边界。
     *
     * @param order 订单头信息
     * @param items 订单明细列表
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
     * 仅调用单个 Repository 方法的情况下，Service 只是一层薄包装。<br>
     * 此时由于 Repository 侧（{@code StandardOrderRepository#findByStatus}）已经
     * 通过 {@code SessionTemplate.execute} 划定了边界，因此 Service 侧无需重复
     * 划定事务边界。
     *
     * @param status 检索对象的状态
     * @return 订单列表
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
 * 获取 {@link OrderService} 实例的工厂类。<br>
 * 实现模式与 {@code OrderRepositoryFactory}（参见模式6）相同。
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
     * 获取 {@link OrderService} 的实例。
     * @return Service 实例
     */
    public static OrderService getInstance() {
        return LazyHolder.INSTANCE;
    }
}
```

- 当 Service 跨越多个 Repository 时，在 Service 自身的事务边界内调用各 Repository 的方法。Repository 侧的 `SessionTemplate.execute` 会被检测为嵌套调用，汇入外侧（Service）的提交/回滚
- **对于仅调用单个 Repository 方法的 Service 方法（例如 `findByStatus`），不需要 `SessionTemplate.execute`。** 因为仅靠 Repository 侧的边界就已完成，Service 侧重复划定边界反而显得多余。Service 使用 `SessionTemplate` 的场景仅限于需要将多个 Repository 方法调用整合为一个操作的情况
- Repository 的写入类方法（相当于 `insert`/`update`/`delete`）原则上以1条（1个 Entity）为单位实现。如需批量处理多条记录，可在 Service 层通过循环多次调用 Repository（参见本模式的 `register` 方法），或使用 `insertBatch` 等批量方法
- Endpoint（Web API Maker）只依赖 `OrderService` 接口，通过 `OrderServiceFactory.getInstance()` 获取实例，不直接操作 `SessionTemplate`/`DAOFactory`（参见 `java-im-web-api-maker-usage`）

## 模式8：反面模式集（应避免的做法）

```java
// NG: 直接用 new 创建 DAO
OrderDAO dao = new OrderDAO();  // sqlManager 字段未设置，会导致 NullPointerException

// NG: 手动设置审计项目
order.createUserCd = "system";  // AbstractDAO#insert 会自动设置，因此不需要，且存在重复设置的风险
order.createDate = new java.sql.Timestamp(System.currentTimeMillis());
dao.insert(order);

// NG: 混淆 SqlManager 的 SQL 文件系方法与 xxxBySql 系方法
sqlManager.getResultList(OrderEntity.class, "SELECT * FROM foo_order", param);
// → 第二个参数会被解释为 SQL 文件路径。如果想直接传递 SQL 字符串，应使用 getResultListBySql

// NG: 在事务边界之外执行更新类处理
OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class);
dao.insert(order);  // 未被 SessionTemplate.execute 包装

// NG: 将 JSSP 的 2WaySQL 文件原样挪用到 Java 侧（除了 /*FOR*/ 的有无之外，
// 参数的传递方式（对象/Map/Bean）以及调用的 API 也不同，需要重新编写）

// NG: 明明是跨越多个 Repository 的处理，Service 却未划定事务边界
// → orderRepository.register 与 orderItemRepository.register 会分别在各自的事务中
//    提交，可能出现只有一方成功的不一致情况
public void register(final OrderEntity order, final List<OrderItemEntity> items) {
    orderRepository.register(order);          // 在 Repository 内独立提交
    for (final OrderItemEntity item : items) {
        orderItemRepository.register(item);   // 在另一个事务中提交
    }
}

// NG: Endpoint（Web API Maker）直接操作 SessionTemplate/DAOFactory
// → 事务边界的所有者不再是 Service 层，职责泄露到了 Endpoint
@Path("/foo/orders/{orderId}")
@GET
public OrderEntity get(@Variable(name = "orderId") final String orderId) {
    return SessionTemplate.execute(new SessionCallback<OrderEntity, RuntimeException>() {
        public OrderEntity execute(final Session session) {
            return DAOFactory.getTenantDatabaseDAO(OrderDAO.class).find(orderId);
        }
    });
}

// NG: 用 new StandardXxx() 直接创建 Repository/Service
// → 未经由工厂类（基于 ServiceLoaderUtil.loadTopPriority 的扩展点），
//    导致调用侧依赖于具体实现类，无法替换为优先级更高的实现
private final OrderRepository orderRepository = new StandardOrderRepository();  // 应使用 OrderRepositoryFactory.getInstance()

// NG: 获取单一实现时，直接使用返回 Collection 的 loadPriority
// → 每个调用侧都需要重复编写取出首个元素的处理。如需单个实例，应使用 loadTopPriority
final Collection<OrderRepository> repositories = ServiceLoaderUtil.loadPriority(OrderRepository.class);
final OrderRepository repository = repositories.isEmpty() ? new StandardOrderRepository() : repositories.iterator().next();
```
