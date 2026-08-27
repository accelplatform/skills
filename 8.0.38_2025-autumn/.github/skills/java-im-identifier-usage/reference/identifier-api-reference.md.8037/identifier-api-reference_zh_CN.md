# Identifier API 参考（Java 版）

基于 intra-mart Accel Platform 核心源代码（`im_core_base` / `im_core_impl` 模块）中的实际类定义。不要凭记忆或推测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.service.client.information
├── Identifier          … 公开 API。获取唯一 ID 的入口点
└── IdentifierSpi        … Identifier 的服务提供者接口（用于替换内部实现的抽象类）

jp.co.intra_mart.system.service.information
├── SystemIdProvider     … 提供系统整体唯一 ID（系统 ID）的接口
└── SystemIdProviderImpl … SystemIdProvider 的标准实现（im_core_impl 模块，与 Server Manager 通信）

jp.co.intra_mart.common.aid.jdk.util
└── UniqueIdGenerator    … IdentifierSpi 标准实现内部使用的工具类（基于时间 + 序列号生成 ID）
```

## `Identifier` 类

```java
package jp.co.intra_mart.foundation.service.client.information;

public final class Identifier {

    public Identifier();

    /**
     * 获取包括分布式环境在内、保证系统整体唯一的 ID。
     * 生成的字符串长度为 15 字节。
     * @return 唯一 ID
     * @throws IOException 与 Server Manager 通信错误
     */
    public String get() throws IOException;

    /**
     * 创建在应用服务器内唯一的 ID。
     * 除应用服务器内闭环处理外，请勿用于其他用途。
     * 通常，若需要获取唯一 ID，请使用 get()。
     * @return 唯一 ID
     */
    public static String make();
}
```

- `final` 类，不可继承
- 实例不持有状态（不含字段）。仅在调用 `get()` 时才需要实例化
- 在类初始化时（static 初始化块）中，通过 `ServiceLoader` 检测 `SystemIdProvider` 的实现，并通过 `ConfigurationLoader` 加载 `identifier-config.xml`（后述），从而决定 `IdentifierSpi` 的实现实例。**应用开发者不会直接处理该初始化过程**

### `get()` 的内部行为

```
get() {
    return make().concat(Identifier.provider.getSystemId());
}
```

将 `make()` 生成的 13 字节字符串，与 `SystemIdProvider#getSystemId()` 返回的 2 字节系统 ID 拼接，返回一个 15 字节的字符串。由于 `getSystemId()` 需要与 Server Manager 通信以获取系统整体唯一的 ID，因此在通信错误时会抛出 `IOException`。

### `make()` 的内部行为

```
make() {
    return identifierSpi.generate();
}
```

委托给 `IdentifierSpi#generate()`。默认实现（当 `identifier-config.xml` 中未指定 `generator-class` 时）在内部以匿名类的形式定义如下:

```java
private static IdentifierSpi newDefaultProviderInstance() {
    return new IdentifierSpi() {
        @Override
        String generate() {
            return UniqueIdGenerator.getUniqueId();
        }
    };
}
```

也就是说，在默认实现下，调用 `make()` 相当于调用 `UniqueIdGenerator.getUniqueId()`。

## `IdentifierSpi` 类（服务提供者接口）

```java
package jp.co.intra_mart.foundation.service.client.information;

public abstract class IdentifierSpi {

    public IdentifierSpi();

    /**
     * 提供 Identifier#get() 的实现。
     * 获取保证唯一性的 ID。生成的字符串长度为 13 字节。
     * @return 唯一 ID
     */
    abstract String generate();
}
```

- 通过实现包私有的抽象方法 `generate()`，可以替换 `make()` 的生成算法
- 由于 `generate()` 是包私有的，**应用侧事实上无法创建自己的 `IdentifierSpi` 实现**（只能在同一包内继承・实现）。自定义只能通过在 `identifier-config.xml` 的 `generator-class` 中指定平台内的其他实现类来完成（通常的应用开发中不需要）

## `SystemIdProvider` 接口

```java
package jp.co.intra_mart.system.service.information;

public interface SystemIdProvider {

    /**
     * 返回系统整体唯一的 ID。
     * @return 唯一 ID
     * @throws IOException 获取 ID 失败时抛出。
     */
    String getSystemId() throws IOException;
}
```

- 由 `Identifier` 类的 static 初始化块通过 `ServiceLoader.load(SystemIdProvider.class)` 检测到的 SPI 实现
- 标准实现是 `im_core_impl` 模块中的 `SystemIdProviderImpl`（通过与 Server Manager 通信获取系统整体唯一的 ID）
- 应用开发者通常不会直接实现或使用该接口

## `UniqueIdGenerator` 工具类

```java
package jp.co.intra_mart.common.aid.jdk.util;

public class UniqueIdGenerator {

    /**
     * 创建唯一 ID。
     * 生成一个对当前进程保证唯一性的 ID。
     * ID 由时间信息以及该类持有的序列号构成。
     * 因此，每次调用该方法都会生成不同的字符串并作为 ID 返回。
     * 生成的字符串长度为 13。
     * 为保证 ID 的唯一性，本方法为 synchronized 方法。
     * @return 唯一 ID
     */
    public static synchronized String getUniqueId();
}
```

- ID 的构成: 将 `yyyyMMddHHmmssSSS` 格式的当前时间转换为 36 进制后的字符串 + 36 进制 2 位序列号（`00`〜`zz`，每次调用递增，达到上限后循环回到 `00`）
- 由于是 `synchronized` 方法，同一 JVM 内的调用是线程安全的，但在高频连续调用时可能成为锁竞争的瓶颈
- **应用开发者无需直接调用该类。** 应通过 `Identifier.make()` 使用

## `identifier-config.xml`（平台配置）

```xml
<identifier-config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="http://intra-mart.co.jp/foundation/identifier/identifier-config"
    xsi:schemaLocation="http://intra-mart.co.jp/foundation/identifier/identifier-config ...">
    <!-- 指定 generator-class 可替换 make() 的算法（默认未指定） -->
</identifier-config>
```

- 在（可省略的）`generator-class` 元素中指定实现了 `IdentifierSpi` 的平台内类的完全限定名，即可替换 `make()` 的生成算法
- 若未指定，则使用 `newDefaultProviderInstance()`（调用 `UniqueIdGenerator.getUniqueId()` 的默认实现）
- 若类加载失败（`ClassNotFoundException` / `InstantiationException` / `IllegalAccessException`），会抛出 `ConfigurationRuntimeException`（运行时异常），导致 `Identifier` 类本身的初始化失败
- **通常的应用开发中不应编辑此配置文件。** 由于它涉及平台整体的 ID 生成算法，若确实需要变更，应在与用户确认意图后谨慎处理

## 实际平台代码中的使用示例（供参考）

`jp.co.intra_mart.system.workflow.engine.tool.EngineNumberingUtil#createNewNumber()`（`im_workflow_core` 模块，工作流案件编号的编号处理）:

```java
public static String createNewNumber() throws EngineException {

    String newNum = null;

    if (UnitModeUtil.getInstance().isUTMode()) {
        // 面向单元测试模式等无法连接 Server Manager 的执行环境的回退方案
        newNum = Identifier.make();
    } else {
        final Identifier id = new Identifier();
        try {
            newNum = id.get();
        } catch (final IOException e) {
            throw new EngineException("IMW.SRV.ERR.0664", e);
        }
    }

    return newNum != null ? newNum : "N/A";
}
```

如该示例所示，业务数据的编号（此处为案件编号）原则上应使用 `get()`，并以通常的应用执行环境（可与 Server Manager 通信的环境）为前提。回退到 `make()` 仅限于无法连接 Server Manager 的特殊执行环境（如单元测试等），不应作为普通业务逻辑的分支来效仿。

其他仅使用 `make()` 的实际平台代码示例:
- `jp.co.intra_mart.system.logic.log.LogContext#executionId`（`im_logic_impl`，IM-LogicDesigner 的流程执行 ID，用于进程内跟踪）
- `jp.co.intra_mart.imbox.internal.util.DefaultIdGenerator#generate()`（`imbox_core`，内部 ID 生成）
- `jp.co.intra_mart.system.javascript.imapi.IdentifierObject`（`im_jssp`，JSSP 的 SSJS 版 Identifier 对象的桥接实现。是 JSSP 侧获取相当于 `make()` 的 ID 时所使用的内部实现）

以上均属于"仅需在单一进程内闭环的标识符即可满足需求"的情形，这与需要在分布式环境下避免重复的业务数据主键・单据号等在性质上有所不同，需注意区分。
