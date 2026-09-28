# IM-Propagation API 参考手册（Java 版）

基于 intra-mart Accel Platform 核心源代码（`im_propagation` 模块）的实际类定义与 Javadoc。不要凭记忆或猜测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.propagation
├── PropagationManager          … 发送数据的入口点（接口）
├── PropagationManagerFactory   … 获取 PropagationManager 的工厂（抽象类）
├── Encoder<D, G>                … 数据模型 → GenericModel 的转换接口
├── Decoder<G, D>                … GenericModel → 数据模型的转换接口
└── Procedure<D, R>              … 接收数据的业务处理接口

jp.co.intra_mart.foundation.propagation.sender
└── AbstractEncoder<D, G extends Serializable>     … Encoder 的抽象实现（由发送方继承）

jp.co.intra_mart.foundation.propagation.receiver
├── AbstractDecoder<G extends Serializable, D>              … Decoder 的抽象实现（由接收方继承）
├── AbstractProcedure<D, R extends Serializable>            … Procedure 的抽象实现（搭载于数据库事务）
└── AbstractSessionableProcedure<D, R extends Serializable> … Procedure 的抽象实现（自定义生命周期控制）

jp.co.intra_mart.foundation.propagation.model
├── SendResult<R extends Serializable>     … send() 的返回值
├── ReceiveResult<R extends Serializable>  … onReceive() 的返回值
├── ReceiveParameter                        … 传给 onReceive() 的参数
├── InitializeParameter / InitializeResult  … onInitialize() 的参数/返回值
├── PrepareParameter / PrepareResult        … onPrepare() 的参数/返回值
├── DecideParameter / DecideResult          … onDecide() 的参数/返回值
├── AbortParameter / AbortResult            … onAbort() 的参数/返回值
├── EmptyObject                              … 不需要返回值时的占位符
└── generic
    ├── AbstractGeneric                      … GenericModel 的基类
    └── imbox
        ├── GenericSendNoticeThread / GenericSendNoticeMessage
        ├── GenericSendWatchThread / GenericSendWatchMessage
        ├── GenericWatch / GenericUnwatch     … IM-Box 标准的 GenericModel

jp.co.intra_mart.foundation.propagation.code
├── OperationType    … operationType 的标准常量
└── EventStatus      … 接收处理结果状态的枚举类型

jp.co.intra_mart.foundation.propagation.exception
└── （异常层次结构，详见下文）
```

## `PropagationManager` 接口

```java
package jp.co.intra_mart.foundation.propagation;

public interface PropagationManager {

    /** 开启会话。若执行上下文中没有数据库事务，则新建一个。 */
    void begin() throws BeginException;

    /**
     * 发送数据（根据实际数据自动判定发送源数据的类）。
     * @param operationType 操作类型
     * @param data 发送源数据
     * @param resultClass 接收方返回值的类（不需要时使用 EmptyObject.class）
     */
    <D, R extends Serializable> SendResult<R> send(String operationType, D data, Class<R> resultClass)
            throws SendException;

    /**
     * 发送数据（显式指定发送源数据的类）。
     * 当数据实现了某个接口/父类，且希望以与实际类不同的类型解析 source 时使用。
     */
    <D, R extends Serializable> SendResult<R> send(String operationType, Class<D> dataClass, D data,
            Class<R> resultClass) throws SendException;

    /** 确定（提交）会话。向接收方通知提交。若会话已结束，则为空操作。 */
    void decide() throws DecideException;

    /** 回滚会话。向接收方通知中止。若会话已结束，则为空操作。 */
    void abort();

    /**
     * 执行 Callable，自动完成 begin/decide/abort。
     * 若返回值为 null 或抛出异常则调用 abort，否则调用 decide。
     */
    <V> V execute(Callable<V> caller) throws Exception;

    /** 释放资源。多次调用也是安全的。 */
    void close();
}
```

- `send()` 的 `operationType` 应使用 `OperationType` 类的标准常量，或自定义字符串常量
- `dataClass`/`data`（或 `data.getClass()`）必须与发送配置文件（`propagation-senders-config`）中 `sender` 元素的 `source` 属性一致
- `resultClass` 必须实现 `java.io.Serializable`。不需要返回值时使用 `EmptyObject.class`

## `PropagationManagerFactory` 类

```java
package jp.co.intra_mart.foundation.propagation;

public abstract class PropagationManagerFactory {

    /** 获取工厂实例。 */
    public static PropagationManagerFactory getInstance();

    /** 获取 PropagationManager。 */
    public abstract PropagationManager getPropagationManager();
}
```

- 调用形式始终为 `PropagationManagerFactory.getInstance().getPropagationManager()`

## `Encoder<D, G>` / `AbstractEncoder<D, G>`

```java
package jp.co.intra_mart.foundation.propagation;

public interface Encoder<D, G> {
    G encode(D data) throws ConvertException;
    Class<G> getGenericDataClass();
    void setParamValuesMap(Map<String, List<String>> map);
}
```

```java
package jp.co.intra_mart.foundation.propagation.sender;

public abstract class AbstractEncoder<D, G extends Serializable> implements Encoder<D, G> {

    /** 将数据模型(D) 转换为 GenericModel(G)。转换失败时抛出 ConvertException。 */
    public abstract G encode(D data) throws ConvertException;

    /** 返回所生成 GenericModel 的 Class 对象。 */
    public abstract Class<G> getGenericDataClass();

    /** 由框架自动调用。应用代码无需调用。 */
    public void setParamValuesMap(Map<String, List<String>> map);

    /** 获取发送配置文件中 param 元素的 key 清单。 */
    protected Set<String> getParamKeys();

    /** 获取指定 key 的 param 值（第一条）。 */
    protected String getParamValue(String key);

    /** 获取指定 key 的 param 值（多条）。 */
    protected List<String> getParamValues(String key);
}
```

- 实现类必须重写 `encode`/`getGenericDataClass` 这两个方法
- `getParamKeys`/`getParamValue`/`getParamValues` 对应发送配置文件中的 `<encoder class="..."><params><param key="...">值</param></params></encoder>`

## `Decoder<G, D>` / `AbstractDecoder<G, D>`

```java
package jp.co.intra_mart.foundation.propagation;

public interface Decoder<G, D> {
    D decode(G generic) throws ConvertException;
    Class<G> getGenericDataClass();
    void setParamValuesMap(Map<String, List<String>> map);
}
```

```java
package jp.co.intra_mart.foundation.propagation.receiver;

public abstract class AbstractDecoder<G extends Serializable, D> implements Decoder<G, D> {

    /** 将 GenericModel(G) 转换为数据模型(D)。转换失败时抛出 ConvertException。 */
    public abstract D decode(G generic) throws ConvertException;

    /** 返回待接收 GenericModel 的 Class 对象。 */
    public abstract Class<G> getGenericDataClass();

    // setParamValuesMap / getParamKeys / getParamValue / getParamValues 与 AbstractEncoder 相同
}
```

## `Procedure<D, R>` / `AbstractProcedure<D, R>` / `AbstractSessionableProcedure<D, R>`

```java
package jp.co.intra_mart.foundation.propagation;

public interface Procedure<D, R> {
    ReceiveResult<R> onReceive(ReceiveParameter parameter, D data) throws ProcedureException, PropagationManagerException;
    InitializeResult onInitialize(InitializeParameter parameter);
    PrepareResult onPrepare(PrepareParameter parameter);
    DecideResult onDecide(DecideParameter parameter) throws ProcedureException;
    AbortResult onAbort(AbortParameter parameter);
    void setParamValuesMap(Map<String, List<String>> map);
}
```

```java
package jp.co.intra_mart.foundation.propagation.receiver;

// 面向搭载于数据库事务的常规接收处理
public abstract class AbstractProcedure<D, R extends Serializable> implements Procedure<D, R> {

    /** 处理接收数据。由于数据库事务由宿主（发送方）一侧控制，不应自行 begin/commit。 */
    public abstract ReceiveResult<R> onReceive(ReceiveParameter parameter, D data)
            throws ProcedureException, PropagationManagerException;

    // onInitialize/onPrepare/onDecide/onAbort 继承相当于"未实现"的默认实现（无需重写）
}

// 面向处理非数据库资源、需要自定义提交判断的接收处理
public abstract class AbstractSessionableProcedure<D, R extends Serializable> implements Procedure<D, R> {

    /** 事务开始时仅调用一次。 */
    public InitializeResult onInitialize(InitializeParameter parameter);

    /** 每次接收数据时调用。此时不确定处理。 */
    public abstract ReceiveResult<R> onReceive(ReceiveParameter parameter, D data)
            throws ProcedureException, PropagationManagerException;

    /** 提交前调用，用于判断是否可以确定。 */
    public PrepareResult onPrepare(PrepareParameter parameter);

    /** 提交时调用，执行实际的确定处理（副作用的执行）。 */
    public DecideResult onDecide(DecideParameter parameter) throws ProcedureException;

    /** 回滚时调用，执行善后处理。 */
    public AbortResult onAbort(AbortParameter parameter);

    /** 用于验证是否处于会话内的工具方法。 */
    protected void checkInSession(ReceiveParameter parameter) throws ProcedureException;

    // 同样提供 setParamValuesMap / getParamKeys / getParamValue / getParamValues
}
```

- **`AbstractProcedure` 仅需重写 `onReceive`。** 其他生命周期方法继承相当于"未实现"的默认实现
- **`AbstractSessionableProcedure` 只需重写所需的生命周期方法即可。** 例如若不需要初始化处理，则无需重写 `onInitialize`，保持继承而来的默认实现即可
- 两个类在运行时都通过类加载器实例化，因此**必须提供无参构造函数**（不要将构造函数设为 `private`）

## 参数・结果类（均属于 `jp.co.intra_mart.foundation.propagation.model` 包）

| 类 | 构造函数 | 主要方法 |
|---|---|---|
| `SendResult<R>` | `SendResult()` | `addProcedureStatus(ProcedureStatus)` / `addResponse(R)` / `List<ProcedureStatus> getProcedureStatus()` / `List<R> getResponses()` |
| `ReceiveResult<R>` | `ReceiveResult(EventStatus)` / `ReceiveResult(EventStatus, R)` / `ReceiveResult(EventStatus, R, String message)` | `getStatus()` / `getResponse()` / `getMessage()` |
| `ReceiveParameter` | `ReceiveParameter(String dataId, String operationType, String source, boolean inSession)` | `getDataId()` / `getOperationType()` / `getSource()` / `isInSession()` |
| `InitializeParameter` | `InitializeParameter()` | 无 |
| `InitializeResult` | `InitializeResult(EventStatus)` / `InitializeResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `PrepareParameter` | `PrepareParameter()` | 无 |
| `PrepareResult` | `PrepareResult(EventStatus)` / `PrepareResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `DecideParameter` | `DecideParameter()` | 无 |
| `DecideResult` | `DecideResult(EventStatus)` / `DecideResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `AbortParameter` | `AbortParameter()` | 无 |
| `AbortResult` | `AbortResult(EventStatus)` / `AbortResult(EventStatus, String message)` | `getStatus()` / `getMessage()` |
| `EmptyObject` | `EmptyObject()` | 无（`Serializable` 的占位符） |

- 以上均实现了 `java.io.Serializable`
- `Initialize`/`Prepare`/`Decide`/`Abort` 各 `Parameter` 类除无参构造函数外没有其他公开方法（仅供框架内部使用）

## `AbstractGeneric`（GenericModel 的基类）

```java
package jp.co.intra_mart.foundation.propagation.model.generic;

public abstract class AbstractGeneric implements Serializable {

    public String getExecuteTenantId();
    public void setExecuteTenantId(String executeTenantId);

    public String getExecuteUserCd();
    public void setExecuteUserCd(String executeUserCd);

    public String getOwnerTenantId();
    public void setOwnerTenantId(String ownerTenantId);

    public String getOwnerUserCd();
    public void setOwnerUserCd(String ownerUserCd);
}
```

- 自定义的 `GenericModel` 应继承此类，并添加要发送的字段（建议显式声明 `serialVersionUID`）
- `executeTenantId`/`executeUserCd`/`ownerTenantId`/`ownerUserCd` 可能会从执行上下文中自动补充（未显式设置时的行为取决于具体实现，如有需要应显式设置）

### GenericModel 的还原方式（最重要）

由于 `AbstractGeneric implements Serializable`，容易误以为 GenericModel 的传递使用的是 Java 标准序列化（`ObjectOutputStream`/`ObjectInputStream`），但**实际的内部实现是基于 JSON 的转换（JSONIC 库，`net.arnx.jsonic`）。** 接收方会先通过反射（`Class#getDeclaredConstructor()`，**无参数**）从 JSON 字符串实例化 `Decoder#getGenericDataClass()` 返回的类，然后再传给 `decode()`。

因此，**`Decoder<G, D>` 中指定为 `G`（GenericModel）的类，必须拥有 `public` 的无参构造函数。** 仅实现 `Serializable` 是不够的。

- 自行创建的 `GenericModel`（继承 `AbstractGeneric` 的类）若未定义显式构造函数，则可使用隐式的默认构造函数（无参数、`public`），通常不会有问题。**若添加了自定义构造函数，务必同时保留无参构造函数**
- **切勿将 intra-mart 标准发送源的数据模型（管理类 API 的领域模型类，如 `jp.co.intra_mart.foundation.admin.account.model.AccountInfo`）直接注册为接收方的 `G`。** 这些类未必是专为 propagation 设计的，有些并不具备无参构造函数。`AccountInfo`（仅有 `public AccountInfo(String userCd)` 这一个带参构造函数）不满足该条件
- 若将不具备无参构造函数的类注册为接收方的 `G`，**无论接收方实现（Decoder/Procedure）是否正确**，都会在 JSON 转换阶段产生 `NoSuchMethodException` → `JSONException` → `SendException`，**导致发送方自身的处理失败。** 若发送方是 intra-mart 标准功能，则会造成该标准功能整体（例如账户更新）不可用这一严重影响

### `jp.co.intra_mart.foundation.propagation.model.generic` 包（用于接收 intra-mart 标准数据的官方 GenericModel）

为解决上述问题（管理类 API 的领域模型类不满足 GenericModel 的要求），intra-mart 在 `jp.co.intra_mart.foundation.propagation.model.generic` 包中官方提供了约30个继承 `AbstractGeneric` 的通用模型类（`GenericAccount`/`GenericTenant`/`GenericRole`/`GenericAdministrator`/`GenericAuthzResource`/`GenericAuthzPolicy`/`GenericAuthzResourceGroup`/`GenericAuthzSubjectGroup`/`GenericMenuGroup`/`GenericMenuItem`/`GenericCalendar`/`GenericDay`/`GenericJobnet`/`GenericJobnetTrigger`/`GenericUpdatedTenant` 等）。

该包的 Javadoc 明确记载了存放传播数据的类应满足的要求：

1. 不使用总称型（泛型）
2. 是仅由简单 getter/setter 构成的可序列化类
3. 具有零参数的构造函数
4. 字段类型仅限于基本类型，或在传播功能内可与序列化数据相互转换的类・已实现相应接口的类（包括 `BigDecimal`/`BigInteger`/`Calendar`/`Collection`/`Date`/`List`/`Locale`/`Map`/`String`/`TimeZone`/`URI`/`URL`/`UUID` 及其包装类型、以及这些类型的数组）

`jp.co.intra_mart.foundation.propagation.model.generic` 包中的各个类均按满足上述4项要求进行设计。**接收 intra-mart 标准数据时，`source` 属性应保持为发送源数据（如 `AccountInfo`）的 FQCN 不变，而 `Decoder<G, D>` 的 `G` 应指定对应的 `Generic*` 类（如 `GenericAccount`），而非领域模型类本身。** 之所以能够如此组合，是因为 `source`（路由用标识符）与 `G`（实际从 JSON 还原的类）是相互独立的概念。`AccountInfo` → `GenericAccount` 的组合可以正常接收。详细的对应表请参见 `assets/standard-listener-usage.md`。

## `OperationType`（标准常量）

```java
package jp.co.intra_mart.foundation.propagation.code;

public final class OperationType {
    public static final String DATA_CREATED;
    public static final String DATA_UPDATED;
    public static final String DATA_DELETED;
    public static final String DATA_UN_DELETED;   // 8.0.9 及以后
    public static final String PROC_STARTED;
    public static final String PROC_SUSPENDED;
    public static final String PROC_RESUMED;
    public static final String PROC_ABORTED;
    public static final String PROC_COMPLETED;
    public static final String PROC_FAILED;
    public static final String REQUEST_SEND;
    public static final String REQUEST_COMMAND;
    public static final String REQUEST_NOTIFY;
    public static final String REQUEST_SEARCH;
}
```

- 数据的 CRUD 类事件使用 `DATA_*`，进程（批处理・作业等）的状态迁移使用 `PROC_*`，任意的请求类事件使用 `REQUEST_*`
- 仅当自定义业务事件没有对应的标准常量时，才定义自定义字符串常量

## `EventStatus`（接收结果状态）

```java
package jp.co.intra_mart.foundation.propagation.code;

public enum EventStatus {
    UNDEFINED,
    SUCCEEDED,
    NOT_AFFECTED,
    NOT_IMPLEMENTED,
    FAILED
}
```

| 值 | 含义 |
|---|---|
| `SUCCEEDED` | 处理成功 |
| `NOT_AFFECTED` | 处理对象不存在等，未产生影响 |
| `NOT_IMPLEMENTED` | 对应的生命周期处理未实现（`AbstractProcedure`/`AbstractSessionableProcedure` 默认实现返回的值） |
| `FAILED` | 处理失败 |
| `UNDEFINED` | 未定义 |

## 异常层次结构（`jp.co.intra_mart.foundation.propagation.exception`）

| 类 | 用途 |
|---|---|
| `PropagationException` | IM-Propagation 整体的基础异常 |
| `PropagationManagerException` | `PropagationManager` 内部错误。**不得从 Encoder/Decoder/Procedure 的实现中抛出** |
| `PropagationRuntimeException` | 不可恢复的运行时异常 |
| `BeginException` | `begin()` 失败 |
| `SendException` | `send()` 失败（包括死锁检测） |
| `DecideException` | `decide()` 失败 |
| `SessionException` | 会话相关的一般性失败 |
| `SessionRequiredException` | 在事务之外尝试进行数据处理 |
| `DatabaseException` | 数据库相关的失败 |
| `ConvertException` | `Encoder`/`Decoder` 转换失败时抛出（面向应用） |
| `ProcedureException` | `Procedure` 处理失败时抛出（面向应用） |

**实现指南：** `Encoder`/`Decoder` 应抛出 `ConvertException`（或其子类），`Procedure` 应抛出 `ProcedureException`（或其子类）。`PropagationManagerException` 系列仅供框架内部使用，不得从应用代码中抛出。

## 会话泄漏的故障排查

通过 `begin()` 开启的会话必须通过 `decide()`/`abort()`/`close()` 之一结束。若放任不结束，会导致数据库事务无法结束，或此后整个使用 IM-Propagation 的部分挂起等严重故障。

诊断步骤（源自附录）：

1. 在 `WEB-INF/conf/log/im_logger.xml` 中将相应日志记录器的级别设为 `trace`，重启并复现问题
2. 在日志中搜索消息 `"primary already used, use secondary"`
3. 追溯该消息前紧接输出的 `"use primary"` 堆栈跟踪，确定对应 `PropagationManagerFactoryImpl.getPropagationManager` 的调用方
4. 修改所确定的调用方，确保 `decide()`/`abort()`/`close()` 之一被确实调用
