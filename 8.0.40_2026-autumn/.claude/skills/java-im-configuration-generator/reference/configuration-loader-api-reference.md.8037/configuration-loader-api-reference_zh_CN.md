# ConfigurationLoader API 参考（Java 版）

基于 intra-mart Accel Platform 核心源码（`im_core_base` / `im_core_impl` 模块）中的实际类定义。不要凭记忆或推测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.config
├── ConfigurationLoader             … 公开 API。配置的读取/保存/清除缓存的入口
├── ConfigurationService            … ConfigurationLoader 委托的服务接口（内部实现用）
├── Instance                        … 实例管理枚举（SINGLETON/PROTOTYPE）
├── ConfigurationException          … 配置相关受检异常的基类
├── ConfigurationRuntimeException   … 配置相关的运行时异常
├── SourceNotFoundException         … ConfigurationException 的子类。找不到 XML 配置文件时
└── SchemaNotFoundException         … ConfigurationException 的子类。找不到 XSD 模式时

jp.co.intra_mart.system.config（im_core_impl 模块，标准实现。通常的应用开发中不直接引用）
└── XMLConfigurationService         … ConfigurationService 的标准实现（JAXB + XML）
```

## `ConfigurationLoader` 类

```java
package jp.co.intra_mart.foundation.config;

public final class ConfigurationLoader {

    /** 用于在搜索资源时指定 suffix 的系统属性键. */
    public static final String SUFFIX_KEY = ConfigurationLoader.class.getName() + ".suffix";
    // 实际值："jp.co.intra_mart.foundation.config.ConfigurationLoader.suffix"

    private ConfigurationLoader() { } // 不可实例化

    /**
     * 清除内部持有的配置。
     * 调用此方法时，会清除集群内所有节点持有的配置。
     */
    public static void clearCache(Class<?> configurationClass) throws ConfigurationException;

    /**
     * 获取与配置类对应的模式。若不存在，则抛出 ConfigurationException（SchemaNotFoundException）。
     */
    public static <T> Schema findSchema(Class<T> configurationClass) throws ConfigurationException;
    public static <T> Schema findSchema(Class<T> configurationClass, ClassLoader classLoader) throws ConfigurationException;

    /**
     * 读取配置。使用 Instance.SINGLETON（默认）时，除非调用 clearCache()，否则返回同一实例。
     */
    public static <T> T load(Class<T> configurationClass) throws ConfigurationException;
    public static <T> T load(Class<T> configurationClass, ClassLoader classLoader) throws ConfigurationException;
    public static <T> T load(Class<T> configurationClass, Instance instance) throws ConfigurationException;
    public static <T> T load(Class<T> configurationClass, Instance instance, ClassLoader classLoader) throws ConfigurationException;

    /**
     * 读取与同一配置类对应的全部 XML 文件。
     */
    public static <T> Collection<T> loadAll(Class<T> configurationClass) throws ConfigurationException;
    public static <T> Collection<T> loadAll(Class<T> configurationClass, ClassLoader classLoader) throws ConfigurationException;
    public static <T> Collection<T> loadAll(Class<T> configurationClass, Instance instance) throws ConfigurationException;
    public static <T> Collection<T> loadAll(Class<T> configurationClass, Instance instance, ClassLoader classLoader) throws ConfigurationException;

    /**
     * 保存配置。仅写入 SystemStorage 的 "conf/{name}{suffix}.xml"。
     * 不会清除内部管理的已读取缓存（需要另行调用 clearCache()）。
     */
    public static <T> void save(T configuration) throws ConfigurationException;
}
```

- `final` 类，且构造函数为 `private`。不可继承・不可实例化，全部方法均为 `static`
- `load()`/`loadAll()`/`save()`/`clearCache()`/`findSchema()` 均会抛出受检异常 `ConfigurationException`（必须声明 `throws`）
- 省略 `classLoader` 的重载方法使用 `Thread.currentThread().getContextClassLoader()`
- 省略 `instance` 的重载方法使用 `Instance.SINGLETON`（**默认会被缓存**）

## `Instance` 枚举

```java
package jp.co.intra_mart.foundation.config;

public enum Instance {
    /** 每次调用都会重新生成. */
    PROTOTYPE,
    /** 从应用启动到结束期间一直保持. */
    SINGLETON
}
```

- `SINGLETON`：将首次读取时的实例缓存在进程内，之后始终返回同一实例。文件的变更在调用 `clearCache(Class)` 之前不会被反映
- `PROTOTYPE`：每次调用都重新读取 XML 文件。适用于需要每次都反映配置变更的场景，但在高频调用的处理中需注意 I/O 成本

## 异常类层次结构

```
java.lang.Exception
└── ConfigurationException                … 受检异常。load/loadAll/save/clearCache/findSchema 均可能抛出
    ├── SourceNotFoundException           … 找不到对应的 .xml 时
    └── SchemaNotFoundException           … 找不到对应的 .xsd 时

java.lang.RuntimeException
└── ConfigurationRuntimeException         … 运行时异常。在 ConfigurationService 实现加载失败、
                                              写入 SystemStorage 失败（如目录创建失败）时抛出
```

均为带有消息构造函数与原因异常（`Throwable cause`）构造函数的标准异常类。

## 标准实现（`XMLConfigurationService`）的内部行为

`ConfigurationLoader` 内部会委托给 `ConfigurationService` 接口的实现（默认是 `jp.co.intra_mart.system.config.XMLConfigurationService`，位于 `im_core_impl` 模块）。可通过系统属性 `jp.co.intra_mart.foundation.config.ConfigurationService`（接口的完全限定名）替换实现类，但**通常的应用开发直接使用默认的 XML 实现即可。**

### 文件路径推导规则（`SourcePath`）

按以下算法从配置类的简单名推导基础文件名（在每个大写字母前插入连字符，并将整体转为小写）。

```java
// 示例：ExternalApiConfig → external-api-config
final StringBuilder name = new StringBuilder();
for (final char c : clazz.getSimpleName().toCharArray()) {
    if (Character.isUpperCase(c)) {
        if (name.length() != 0) name.append('-');
        name.append(Character.toLowerCase(c));
    } else {
        name.append(c);
    }
}
```

目录部分是将配置类的包名转换为 `/` 分隔形式（例如 `jp.co.example.foo.config` → `jp/co/example/foo/config`）。

### XML 配置文件的搜索顺序（`load()`/`loadAll()` 共通的前半部分）

1. **SystemStorage**：`conf/{name}{suffix}.xml`
2. **`WEB-INF/conf/{name}{suffix}.xml`**（servlet 上下文中的实际文件）
3. **`WEB-INF/conf/{name}{suffix}/` 文件夹**下的 `*.xml`（按文件名升序排序）
   - `load()`（单数）：通过 XPath（`/*/*`）将文件夹内所有文件的子元素合并，作为**一份配置**读取
   - `loadAll()`（复数）：将文件夹内的每个文件**不合并**，作为独立的配置实例以数组形式返回
4. **类路径**：依次搜索指定的 `ClassLoader` → 配置类自身的 `ClassLoader` → `XMLConfigurationService` 自身的 `ClassLoader`，查找 `{directory}/{name}{suffix}.xml`

若以上任何位置均未找到，则抛出 `SourceNotFoundException`（`ConfigurationException` 的子类）。

**补充信息**：上述优先级中 1（SystemStorage）最高，但在通过 `save()` 写入 SystemStorage 后、同时存在 `WEB-INF/conf/{name}.xml`（2）的情况下，无论是否调用 `clearCache()`、是否以 `Instance.PROTOTYPE` 读取，都会持续返回 2（`WEB-INF/conf/`）一侧的值。移除 `WEB-INF/conf/{name}.xml` 后，1（SystemStorage）一侧会被正确读取。另请参见「`save()` 的写入位置」一节。

### XSD 模式的搜索顺序（`load()`/`loadAll()`/`save()` 共通）

1. **`WEB-INF/schema/{name}.xsd`**（servlet 上下文中的实际文件，不创建包层级，文件直接平铺）
2. **类路径**：`{directory}/{name}.xsd`（与配置类相同的包层级）

若未找到，则抛出 `SchemaNotFoundException`。**模式不可省略**（实现会在 `Unmarshaller`/`Marshaller` 上设置模式，并在读写时进行校验）。

### `save()` 的写入位置

`save(T configuration)` **仅**写入 **SystemStorage** 的 `conf/{name}{suffix}.xml`（不会写入 `WEB-INF/conf/` 或类路径）。若父目录不存在，会自动创建。写入失败时抛出 `ConfigurationRuntimeException`（由 `IOException` 引起）；编组（marshalling）失败时抛出 `ConfigurationException`（由 `JAXBException` 引起，抛出异常前会删除写入中断的文件）。

**`save()` 不会清除缓存。** 若需要将变更反映到已通过 `Instance.SINGLETON` 读取的现有缓存中，必须在 `save()` 之后显式调用 `ConfigurationLoader.clearCache(configurationClass)`。

**当 `WEB-INF/conf/{name}.xml` 存在时，`save()`+`clearCache()` 无法使新值生效。** `save()` 仅写入 SystemStorage 的 `conf/`，但若同一配置同时存在 `WEB-INF/conf/{name}.xml`，则在 `clearCache()` 之后调用 `load()`（即便以 `Instance.PROTOTYPE` 读取）仍会持续返回 `WEB-INF/conf/` 一侧的值，而非 SystemStorage 中的新值。不放置 `WEB-INF/conf/{name}.xml` 时，SystemStorage 中的值会被正确读取。仅看「搜索顺序优先级」表格会以为 SystemStorage 始终优先，但两者同时存在于同一配置时行为不同，因此**部署时固定的配置（`WEB-INF/conf/`）与基于 `save()` 的动态更新配置，绝不要用于同一配置。**

### `clearCache()` 的行为

- 默认（相当于生产环境的行为）：通过 `ApplicationInitializerProxy` 将 `ClearCacheTask` 分发到集群中的所有节点，清除各节点的缓存
- 设置了系统属性 `jp.co.intra_mart.foundation.config.ConfigurationLoader.local=true` 时：仅清除本节点内存中的缓存（不进行集群分发）。适用于单元测试和单进程开发环境

### 通过 `SUFFIX_KEY` 改变文件名

在系统属性 `ConfigurationLoader.SUFFIX_KEY`（实际为 `jp.co.intra_mart.foundation.config.ConfigurationLoader.suffix`）中设置非空字符串后，`load()`/`loadAll()`/`save()` 中搜索/写入的目标文件名均会变为 `{name}-{suffix}.xml`（模式文件名 `{name}.xsd` 不附加 suffix）。

## JAXB 配置类的必需结构（`check-jaxb-format-plugin` 的约束）

intra-mart 的 Maven 构建（`jp.co.intra_mart.maven:check-jaxb-format-plugin`）会对通过 `ConfigurationLoader` 读取的配置类进行以下静态校验，不满足时判定为构建错误。

- `@XmlType` 注解必须同时指定 `factoryClass` 和 `factoryMethod`
- `factoryMethod` 指定名称的方法必须存在于 `factoryClass` 中，且必须为 **`static`**

因此，新增配置类时，必须在同一包内准备一个标注了 `@XmlRegistry` 的 `ObjectFactory` 类，并实现形如 `public static T createXxx()` 的静态工厂方法（平台标准配置类，如 `ServerContextConfig`，也采用相同结构）。

```java
@XmlType(name = "", propOrder = { ... }, factoryClass = ObjectFactory.class, factoryMethod = "createExternalApiConfig")
@XmlRootElement(name = "external-api-config", namespace = "...")
public class ExternalApiConfig { ... }

@XmlRegistry
public class ObjectFactory {
    public static ExternalApiConfig createExternalApiConfig() {
        return new ExternalApiConfig();
    }
}
```

具体实现示例请参考 `assets/configuration-basic-usage.md`。

## 平台实现中的使用示例（行为参考）

`jp.co.intra_mart.system.platform.ServerContext`（`im_core_base` 模块）：

```java
final ServerContextConfig config = ConfigurationLoader.load(ServerContextConfig.class);
```

`jp.co.intra_mart.system.core.colors.SystemColorPattern`（`im_tags` 模块）对于需要每次都反映最新内容的主题相关配置，显式指定了 `Instance.PROTOTYPE`：

```java
final SystemColorPatternConfig config = ConfigurationLoader.load(SystemColorPatternConfig.class, Instance.PROTOTYPE);
```

由此可见平台实际代码中的模式：**通常默认的 `Instance.SINGLETON` 已足够，但对于需要每次调用都反映如管理画面等所做变更的配置，会使用 `Instance.PROTOTYPE`。**
