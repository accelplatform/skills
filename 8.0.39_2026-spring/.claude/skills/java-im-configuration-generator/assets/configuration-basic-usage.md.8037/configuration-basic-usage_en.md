# ConfigurationLoader API Basic Usage Patterns (Java Version)

See `reference/configuration-loader-api-reference.md` for `ConfigurationLoader`'s signatures, internal behavior, and file placement rules. Here we walk through a complete set — configuration class, XSD schema, XML configuration file, and call-site code — using an external API integration setting (endpoint URL, timeout, API key) as an example.

## 1. The Configuration Class (JAXB POJO)

Annotating fields directly with `@XmlAccessorType(XmlAccessType.FIELD)` gives the same structure as the platform's standard configuration classes (e.g. `ServerContextConfig`) and is easy to follow. **`@XmlType`'s `factoryClass`/`factoryMethod` cannot be omitted** (they must reference the `ObjectFactory` shown below; omitting them fails the build under `check-jaxb-format-plugin`).

```java
package jp.co.example.foo.configuration;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 * Represents the connection settings for an external API integration.
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

- `namespace` can be any URI unique to this configuration class, but it must exactly match the XSD schema's `targetNamespace`
- If the XML element corresponding to a field marked `required = true` is missing, schema validation fails (`ConfigurationException`)
- Carry no logic here (getters/setters only). Put any processing that uses the configuration values in the caller

## 2. `ObjectFactory` (the entity referenced by `factoryClass`/`factoryMethod`, cannot be omitted)

Place it in the same package. The factory method must be **`static`**, or the build fails.

```java
package jp.co.example.foo.configuration;

import javax.xml.bind.annotation.XmlRegistry;

/**
 * Provides the JAXB factory for the configuration classes in this package.
 */
@XmlRegistry
public class ObjectFactory {

    /**
     * Creates a new instance of {@link ExternalApiConfig}.
     * @return {@link ExternalApiConfig}
     */
    public static ExternalApiConfig createExternalApiConfig() {
        return new ExternalApiConfig();
    }
}
```

Even with multiple configuration classes, one `ObjectFactory` per package is enough — just add one `createXxx()` per configuration class.

## 3. The XSD Schema

Place it directly under `src/main/schema/`, **with no subdirectories** (e.g. `src/main/schema/external-api-config.xsd`). `src/main/schema/` is copied to `WEB-INF/schema/` at build time preserving the same relative structure, so recreating a package hierarchy here results in a `SchemaNotFoundException`. The file name follows the "File Path Derivation Rule" (`reference/configuration-loader-api-reference.md`): `external-api-config.xsd`. `targetNamespace` must match the configuration class's `namespace` attribute.

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

- The element order in `xs:sequence` must match the configuration class's `@XmlType(propOrder = {...})`
- Optional items (`required = false`) get `minOccurs="0"`

## 4. The XML Configuration File

Configuration that is fixed at deploy time is placed at `src/main/conf/external-api-config.xml` (not `src/main/webapp/WEB-INF/conf/`; it is copied directly under `WEB-INF/conf/`, using only the base file name without recreating the package hierarchy).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<external-api-config xmlns="http://example.com/foo/configuration/external-api-config">
    <endpoint-url>https://api.example.com/v1</endpoint-url>
    <timeout-millis>5000</timeout-millis>
    <api-key>dummy-api-key</api-key>
</external-api-config>
```

The root element's namespace declaration (`xmlns="..."`) must match the XSD's `targetNamespace`. If a file with secret values (such as an API key) is committed directly to the repository, either use a dummy value or arrange to substitute the environment-specific value separately at deploy time.

## 5. Loading and Saving via `ConfigurationLoader`

```java
package jp.co.example.foo.configuration;

import java.util.Collection;

import jp.co.intra_mart.foundation.config.ConfigurationException;
import jp.co.intra_mart.foundation.config.ConfigurationLoader;
import jp.co.intra_mart.foundation.config.Instance;

/**
 * Provides reading and writing of {@link ExternalApiConfig} via {@link ConfigurationLoader}.
 */
public class ExternalApiConfigService {

    /**
     * Loads the configuration with caching (Instance.SINGLETON, the default).<br>
     * Use this to obtain values that are fixed at deploy time and do not change while running.
     *
     * @return the configuration
     * @throws ConfigurationException if loading the configuration fails
     */
    public ExternalApiConfig load() throws ConfigurationException {
        return ConfigurationLoader.load(ExternalApiConfig.class);
    }

    /**
     * Re-loads the configuration on every call (Instance.PROTOTYPE).<br>
     * Use this when configuration updated dynamically e.g. from an admin screen must be reflected on every change.
     *
     * @return the configuration
     * @throws ConfigurationException if loading the configuration fails
     */
    public ExternalApiConfig loadAlways() throws ConfigurationException {
        return ConfigurationLoader.load(ExternalApiConfig.class, Instance.PROTOTYPE);
    }

    /**
     * Loads every configuration split across the WEB-INF/conf/external-api-config/ folder.
     *
     * @return the list of configurations
     * @throws ConfigurationException if loading the configuration fails
     */
    public Collection<ExternalApiConfig> loadAll() throws ConfigurationException {
        return ConfigurationLoader.loadAll(ExternalApiConfig.class);
    }

    /**
     * Persists the configuration and clears the Instance.SINGLETON cache.<br>
     * Without calling clearCache(), an already-loaded cache will not reflect the change.
     *
     * @param config the configuration
     * @throws ConfigurationException if saving or clearing the cache fails
     */
    public void save(final ExternalApiConfig config) throws ConfigurationException {
        ConfigurationLoader.save(config);
        ConfigurationLoader.clearCache(ExternalApiConfig.class);
    }
}
```

- Callers of `load()` must either `try-catch` `ConfigurationException` every time, or declare `throws`
- Using `Instance.PROTOTYPE` in a frequently called code path re-reads and re-validates the XML on every call; if the I/O cost is a concern, consider the default `Instance.SINGLETON` plus an explicit `clearCache()` on update instead
- **Do not place `src/main/conf/{name}.xml` for a configuration that uses `save()`.** With `WEB-INF/conf/{name}.xml` present, a new value written to SystemStorage via `save()` is not picked up on re-load after `clearCache()` (even reading with `Instance.PROTOTYPE`). Implement deploy-time-fixed configuration (`WEB-INF/conf/`) and `save()`-based dynamically-updated configuration as entirely separate configuration classes

## Anti-Patterns (Avoid These)

```java
// BAD: @XmlType without factoryClass/factoryMethod
@XmlType(name = "", propOrder = { "endpointUrl" })
// Fails the build under check-jaxb-format-plugin

// BAD: ObjectFactory's factory method is not static
public ExternalApiConfig createExternalApiConfig() { // missing the static modifier
    return new ExternalApiConfig();
}
// Fails the build under check-jaxb-format-plugin

// BAD: not calling clearCache() after save()
ConfigurationLoader.save(config);
// Calling ConfigurationLoader.load(ExternalApiConfig.class) after this still returns
// the pre-save content, because the Instance.SINGLETON cache remains

// BAD: the XSD's targetNamespace doesn't match the configuration class's namespace attribute
// Causes a schema validation error (ConfigurationException) or elements failing to be read
```

BAD: recreating a package hierarchy under `src/main/schema/` (e.g. `src/main/schema/jp/co/example/foo/configuration/external-api-config.xsd`). Because the relative structure is copied as-is to `WEB-INF/schema/`, this results in a `SchemaNotFoundException`. Place the file directly, with no subdirectories.
