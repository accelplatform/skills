# ConfigurationLoader API 基本使用模式（Java 版）

`ConfigurationLoader` 的签名・内部行为・文件放置规则请参考 `reference/configuration-loader-api-reference.md`。这里以外部 API 集成配置（端点 URL・超时时间・API 密钥）为例，展示配置类・XSD 模式・XML 配置文件・调用代码的完整一套。

## 1. 配置类（JAXB POJO）

使用 `@XmlAccessorType(XmlAccessType.FIELD)` 直接在字段上标注注解，与平台标准配置类（如 `ServerContextConfig`）结构相同，便于理解。**`@XmlType` 的 `factoryClass`/`factoryMethod` 不可省略**（需要引用后文的 `ObjectFactory`。省略会导致 `check-jaxb-format-plugin` 构建失败）。

```java
package jp.co.example.foo.configuration;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 * 表示外部连携 API 的连接设置。
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "endpointUrl",
    "timeoutMillis",
    "apiKey"
}, factoryClass = ObjectFactory.class, factoryMethod = "createExternalApiConfig")
@XmlRootElement(name = "external-api-config", namespace = "http://example.com/foo/configuration/external-api-config")
public class ExternalApiConfig {

    @XmlElement(name = "endpoint-url", namespace = "http://example.com/foo/configuration/external-api-config", required = true)
    protected String endpointUrl;

    @XmlElement(name = "timeout-millis", namespace = "http://example.com/foo/configuration/external-api-config", required = true)
    protected int timeoutMillis;

    @XmlElement(name = "api-key", namespace = "http://example.com/foo/configuration/external-api-config")
    protected String apiKey;

    public String getEndpointUrl() {
        return endpointUrl;
    }

    public void setEndpointUrl(final String endpointUrl) {
        this.endpointUrl = endpointUrl;
    }

    public int getTimeoutMillis() {
        return timeoutMillis;
    }

    public void setTimeoutMillis(final int timeoutMillis) {
        this.timeoutMillis = timeoutMillis;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(final String apiKey) {
        this.apiKey = apiKey;
    }
}
```

- `namespace` 可以是该配置类专属的任意 URI，但必须与 XSD 模式的 `targetNamespace` 完全一致
- 若标注了 `required = true` 的字段所对应的 XML 元素缺失，会导致模式校验错误（`ConfigurationException`）
- 不要在此处编写业务逻辑（仅保留 getter/setter）。使用配置值的处理写在调用方

## 2. `ObjectFactory`（`factoryClass`/`factoryMethod` 所引用的实体，不可省略）

放置在同一包内。工厂方法必须为 **`static`**，否则构建失败。

```java
package jp.co.example.foo.configuration;

import javax.xml.bind.annotation.XmlRegistry;

/**
 * 为该包内的配置类提供 JAXB 工厂。
 */
@XmlRegistry
public class ObjectFactory {

    /**
     * 生成 {@link ExternalApiConfig} 的新实例。
     * @return {@link ExternalApiConfig}
     */
    public static ExternalApiConfig createExternalApiConfig() {
        return new ExternalApiConfig();
    }
}
```

即使新增多个配置类，每个包只需一个 `ObjectFactory`，按配置类的数量追加 `createXxx()` 即可。

## 3. XSD 模式

直接平铺放置于 `src/main/schema/` 下，**不创建子目录**（例如 `src/main/schema/external-api-config.xsd`）。`src/main/schema/` 在构建时会按相同的相对结构原样复制到 `WEB-INF/schema/`，若在此处创建包层级会导致 `SchemaNotFoundException`。文件名遵循「文件路径推导规则」（`reference/configuration-loader-api-reference.md`）：`external-api-config.xsd`。`targetNamespace` 必须与配置类的 `namespace` 属性一致。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns="http://example.com/foo/configuration/external-api-config"
    targetNamespace="http://example.com/foo/configuration/external-api-config"
    elementFormDefault="qualified">

    <xs:element name="external-api-config">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="endpoint-url" type="xs:string" />
                <xs:element name="timeout-millis" type="xs:int" />
                <xs:element name="api-key" type="xs:string" minOccurs="0" />
            </xs:sequence>
        </xs:complexType>
    </xs:element>

</xs:schema>
```

- `xs:sequence` 中的元素顺序必须与配置类的 `@XmlType(propOrder = {...})` 一致
- 可选项（`required = false`）需加上 `minOccurs="0"`

## 4. XML 配置文件

部署时确定的配置放置于 `src/main/conf/external-api-config.xml`（不是 `src/main/webapp/WEB-INF/conf/`；会原样复制到 `WEB-INF/conf/` 下，文件名仅用基础文件名，不重建包层级）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<external-api-config xmlns="http://example.com/foo/configuration/external-api-config">
    <endpoint-url>https://api.example.com/v1</endpoint-url>
    <timeout-millis>5000</timeout-millis>
    <api-key>dummy-api-key</api-key>
</external-api-config>
```

根元素的命名空间声明（`xmlns="..."`）必须与 XSD 的 `targetNamespace` 一致。若要将包含 API 密钥等敏感信息的实际文件直接提交到仓库，应将值设为占位符，或安排在部署时另行替换为环境专属的值。

## 5. 通过 `ConfigurationLoader` 读取与保存

```java
package jp.co.example.foo.configuration;

import java.util.Collection;

import jp.co.intra_mart.foundation.config.ConfigurationException;
import jp.co.intra_mart.foundation.config.ConfigurationLoader;
import jp.co.intra_mart.foundation.config.Instance;

/**
 * 提供基于 {@link ConfigurationLoader} 的 {@link ExternalApiConfig} 读写。
 */
public class ExternalApiConfigService {

    /**
     * 带缓存地读取配置（Instance.SINGLETON，默认）。<br>
     * 用于获取部署时固定、运行期间不会改变的值。
     *
     * @return 配置
     * @throws ConfigurationException 读取配置失败时
     */
    public ExternalApiConfig load() throws ConfigurationException {
        return ConfigurationLoader.load(ExternalApiConfig.class);
    }

    /**
     * 每次调用都重新读取配置（Instance.PROTOTYPE）。<br>
     * 用于需要将通过管理画面等动态更新的配置，在每次变更后都反映出来的场景。
     *
     * @return 配置
     * @throws ConfigurationException 读取配置失败时
     */
    public ExternalApiConfig loadAlways() throws ConfigurationException {
        return ConfigurationLoader.load(ExternalApiConfig.class, Instance.PROTOTYPE);
    }

    /**
     * 读取拆分放置在 WEB-INF/conf/external-api-config/ 文件夹中的全部配置。
     *
     * @return 配置列表
     * @throws ConfigurationException 读取配置失败时
     */
    public Collection<ExternalApiConfig> loadAll() throws ConfigurationException {
        return ConfigurationLoader.loadAll(ExternalApiConfig.class);
    }

    /**
     * 持久化配置，并清除 Instance.SINGLETON 的缓存。<br>
     * 若不调用 clearCache()，已经通过 load() 读取的缓存不会反映此次变更。
     *
     * @param config 配置
     * @throws ConfigurationException 保存或清除缓存失败时
     */
    public void save(final ExternalApiConfig config) throws ConfigurationException {
        ConfigurationLoader.save(config);
        ConfigurationLoader.clearCache(ExternalApiConfig.class);
    }
}
```

- 调用 `load()` 的一方，每次都需要 `try-catch` `ConfigurationException`，或声明 `throws`
- 在高频调用的处理中使用 `Instance.PROTOTYPE`，会导致每次调用都重新读取 XML 并进行模式校验；若担心 I/O 成本，可考虑使用默认的 `Instance.SINGLETON`，并在更新时显式调用 `clearCache()`
- **使用 `save()` 的配置不要放置 `src/main/conf/{name}.xml`。** 当 `WEB-INF/conf/{name}.xml` 存在时，通过 `save()` 写入 SystemStorage 的新值，在 `clearCache()` 之后重新读取（即便以 `Instance.PROTOTYPE` 读取）也不会生效。应将部署时固定的配置（`WEB-INF/conf/`）与基于 `save()` 的动态更新配置实现为完全独立的配置类

## 反模式（应避免）

```java
// 错误：@XmlType 未指定 factoryClass/factoryMethod
@XmlType(name = "", propOrder = { "endpointUrl" })
// 会导致 check-jaxb-format-plugin 构建失败

// 错误：ObjectFactory 的工厂方法不是 static
public ExternalApiConfig createExternalApiConfig() { // 缺少 static 修饰符
    return new ExternalApiConfig();
}
// 会导致 check-jaxb-format-plugin 构建失败

// 错误：save() 之后不调用 clearCache()
ConfigurationLoader.save(config);
// 此后即使调用 ConfigurationLoader.load(ExternalApiConfig.class)，
// 由于 Instance.SINGLETON 的缓存仍然存在，返回的仍是保存前的内容

// 错误：XSD 的 targetNamespace 与配置类的 namespace 属性不一致
// 会导致模式校验错误（ConfigurationException）或元素无法被读取
```

错误：在 `src/main/schema/` 下创建包层级（例如 `src/main/schema/jp/co/example/foo/configuration/external-api-config.xsd`）。由于相对结构会原样复制到 `WEB-INF/schema/`，这会导致 `SchemaNotFoundException`。应直接平铺放置，不创建子目录。
