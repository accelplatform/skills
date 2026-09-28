# ConfigurationLoader API Reference (Java Version)

Based on the actual class definitions in the intra-mart Accel Platform core source (`im_core_base` / `im_core_impl` modules). Do not supplement methods from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.foundation.config
├── ConfigurationLoader             ... Public API. Entry point for loading/saving/clearing the cache of configuration
├── ConfigurationService            ... The service interface ConfigurationLoader delegates to (internal implementation use)
├── Instance                        ... Enum for instance management (SINGLETON/PROTOTYPE)
├── ConfigurationException          ... Base class for configuration-related checked exceptions
├── ConfigurationRuntimeException   ... Configuration-related runtime exception
├── SourceNotFoundException         ... Subclass of ConfigurationException. When the XML configuration file cannot be found
└── SchemaNotFoundException         ... Subclass of ConfigurationException. When the XSD schema cannot be found

jp.co.intra_mart.system.config (im_core_impl module, the standard implementation. Not normally referenced directly in application development)
└── XMLConfigurationService         ... The standard implementation of ConfigurationService (JAXB + XML)
```

## The `ConfigurationLoader` Class

```java
package jp.co.intra_mart.foundation.config;

public final class ConfigurationLoader {

    /** System property key used to specify a suffix when searching for a resource. */
    public static final String SUFFIX_KEY = ConfigurationLoader.class.getName() + ".suffix";
    // Actual value: "jp.co.intra_mart.foundation.config.ConfigurationLoader.suffix"

    private ConfigurationLoader() { } // Cannot be instantiated

    /**
     * Clears the internally held configuration.
     * When this method is called, the configuration held by every node in the cluster is cleared.
     */
    public static void clearCache(Class<?> configurationClass) throws ConfigurationException;

    /**
     * Retrieves the schema corresponding to the configuration class. Throws ConfigurationException (SchemaNotFoundException) if none exists.
     */
    public static <T> Schema findSchema(Class<T> configurationClass) throws ConfigurationException;
    public static <T> Schema findSchema(Class<T> configurationClass, ClassLoader classLoader) throws ConfigurationException;

    /**
     * Loads the configuration. With Instance.SINGLETON (the default), the same instance is returned unless clearCache() is called.
     */
    public static <T> T load(Class<T> configurationClass) throws ConfigurationException;
    public static <T> T load(Class<T> configurationClass, ClassLoader classLoader) throws ConfigurationException;
    public static <T> T load(Class<T> configurationClass, Instance instance) throws ConfigurationException;
    public static <T> T load(Class<T> configurationClass, Instance instance, ClassLoader classLoader) throws ConfigurationException;

    /**
     * Loads every XML file that corresponds to the given configuration class.
     */
    public static <T> Collection<T> loadAll(Class<T> configurationClass) throws ConfigurationException;
    public static <T> Collection<T> loadAll(Class<T> configurationClass, ClassLoader classLoader) throws ConfigurationException;
    public static <T> Collection<T> loadAll(Class<T> configurationClass, Instance instance) throws ConfigurationException;
    public static <T> Collection<T> loadAll(Class<T> configurationClass, Instance instance, ClassLoader classLoader) throws ConfigurationException;

    /**
     * Saves the configuration. Writes only to SystemStorage's "conf/{name}{suffix}.xml".
     * Does not clear the internally managed loaded cache (a separate clearCache() call is required).
     */
    public static <T> void save(T configuration) throws ConfigurationException;
}
```

- A `final` class with a `private` constructor. Cannot be extended or instantiated; every method is `static`
- `load()`/`loadAll()`/`save()`/`clearCache()`/`findSchema()` all throw the checked exception `ConfigurationException` (a `throws` declaration is required)
- Overloads that omit `classLoader` use `Thread.currentThread().getContextClassLoader()`
- Overloads that omit `instance` use `Instance.SINGLETON` (**cached by default**)

## The `Instance` Enum

```java
package jp.co.intra_mart.foundation.config;

public enum Instance {
    /** Created fresh every time it is called. */
    PROTOTYPE,
    /** Held from application start until application end. */
    SINGLETON
}
```

- `SINGLETON`: Caches the instance from the first load within the process and returns the same instance thereafter. File changes are not reflected until `clearCache(Class)` is called
- `PROTOTYPE`: Re-reads the XML file every time it is called. Use this when configuration changes need to be reflected on every call, but be mindful of I/O cost for frequently called code paths

## Exception Class Hierarchy

```
java.lang.Exception
└── ConfigurationException                ... Checked exception. Thrown by load/loadAll/save/clearCache/findSchema
    ├── SourceNotFoundException           ... When the corresponding .xml cannot be found
    └── SchemaNotFoundException           ... When the corresponding .xsd cannot be found

java.lang.RuntimeException
└── ConfigurationRuntimeException         ... Runtime exception. Thrown when the ConfigurationService implementation fails to load,
                                              or when writing to SystemStorage fails (e.g. directory creation failure)
```

All are standard exception classes with message- and cause- (`Throwable cause`) accepting constructors.

## Internal Behavior of the Standard Implementation (`XMLConfigurationService`)

`ConfigurationLoader` internally delegates to an implementation of the `ConfigurationService` interface (the default is `jp.co.intra_mart.system.config.XMLConfigurationService`, from the `im_core_impl` module). The implementation class can be swapped via the system property `jp.co.intra_mart.foundation.config.ConfigurationService` (the interface's fully qualified name), but **ordinary application development should simply use the default XML implementation as-is.**

### File Path Derivation Rule (`SourcePath`)

The base file name is derived from the configuration class's simple name using the following algorithm (insert a hyphen before each uppercase letter, then lowercase the whole thing).

```java
// Example: ExternalApiConfig -> external-api-config
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

The directory portion is the configuration class's package name converted to `/`-separated form (e.g. `jp.co.example.foo.config` -> `jp/co/example/foo/config`).

### XML Configuration File Search Order (common to the first half of `load()`/`loadAll()`)

1. **SystemStorage**: `conf/{name}{suffix}.xml`
2. **`WEB-INF/conf/{name}{suffix}.xml`** (an actual file in the servlet context)
3. **The `WEB-INF/conf/{name}{suffix}/` folder**, containing `*.xml` files (sorted in ascending file-name order)
   - `load()` (singular): merges the child elements of every file in the folder via XPath (`/*/*`) and reads them as **a single configuration**
   - `loadAll()` (plural): returns each file in the folder **without merging, as independent configuration instances in an array**
4. **Classpath**: searches `{directory}/{name}{suffix}.xml` in order across the given `ClassLoader`, then the configuration class's own `ClassLoader`, then `XMLConfigurationService`'s own `ClassLoader`

If not found in any of these locations, a `SourceNotFoundException` (a subclass of `ConfigurationException`) is thrown.

**Additional note**: the priority order above has 1 (SystemStorage) as the highest priority, but in the case where `WEB-INF/conf/{name}.xml` (2) is also present after writing to SystemStorage via `save()`, the value from 2 (`WEB-INF/conf/`) keeps being returned, whether or not `clearCache()` is called or the read uses `Instance.PROTOTYPE`. Removing `WEB-INF/conf/{name}.xml` causes 1 (SystemStorage) to be read correctly. See also "Where `save()` Writes."

### XSD Schema Search Order (common to `load()`/`loadAll()`/`save()`)

1. **`WEB-INF/schema/{name}.xsd`** (an actual file in the servlet context; placed directly, without recreating the package hierarchy)
2. **Classpath**: `{directory}/{name}.xsd` (using the same package hierarchy as the configuration class)

If not found, a `SchemaNotFoundException` is thrown. **The schema cannot be omitted** (the implementation sets the schema on the `Unmarshaller`/`Marshaller` and validates while reading/writing).

### Where `save()` Writes

`save(T configuration)` writes **only to `conf/{name}{suffix}.xml` under `SystemStorage`** (it does not write to `WEB-INF/conf/` or the classpath). It automatically creates any missing parent directory. On a write failure, a `ConfigurationRuntimeException` is thrown (caused by an `IOException`); on a marshalling failure, a `ConfigurationException` is thrown (caused by a `JAXBException`; the partially written file is deleted before the exception is thrown).

**`save()` does not clear the cache.** If the change needs to be reflected into an existing `Instance.SINGLETON` cache, you must explicitly call `ConfigurationLoader.clearCache(configurationClass)` after `save()`.

**Using `save()`+`clearCache()` while `WEB-INF/conf/{name}.xml` exists does not surface the new value.** `save()` writes only to SystemStorage's `conf/`, but if `WEB-INF/conf/{name}.xml` also exists for the same configuration, calling `load()` after `clearCache()` (even reading with `Instance.PROTOTYPE`) keeps returning the value from `WEB-INF/conf/` rather than the new SystemStorage value. With no `WEB-INF/conf/{name}.xml` present, the SystemStorage value is read correctly. The "Search Order Priority" table alone reads as if SystemStorage always wins, but the two behave differently once both exist for the same configuration, so **never use the deploy-time-fixed configuration (`WEB-INF/conf/`) and the `save()`-based dynamic-update configuration together for the same configuration.**

### `clearCache()` Behavior

- Default (production-equivalent behavior): distributes a `ClearCacheTask` to every node in the cluster via `ApplicationInitializerProxy`, clearing the cache on each node
- When the system property `jp.co.intra_mart.foundation.config.ConfigurationLoader.local=true` is set: clears only the local node's in-memory cache (no cluster-wide distribution). Intended for unit testing and single-process development environments

### File Name Changes via `SUFFIX_KEY`

Setting a non-empty string for the system property `ConfigurationLoader.SUFFIX_KEY` (actually `jp.co.intra_mart.foundation.config.ConfigurationLoader.suffix`) changes the file name searched for / written to, across `load()`/`loadAll()`/`save()` alike, to `{name}-{suffix}.xml` (the suffix is not appended to the schema file name `{name}.xsd`).

## Mandatory Structure for JAXB Configuration Classes (a `check-jaxb-format-plugin` Constraint)

intra-mart's Maven build (`jp.co.intra_mart.maven:check-jaxb-format-plugin`) statically validates the following for configuration classes loaded via `ConfigurationLoader`, and fails the build if they are not satisfied.

- The `@XmlType` annotation must specify both `factoryClass` and `factoryMethod`
- The method named by `factoryMethod` must exist on `factoryClass` and must be **`static`**

For this reason, whenever you add a configuration class you must always prepare an `ObjectFactory` class annotated with `@XmlRegistry` in the same package, and implement a `public static T createXxx()`-shaped static factory method (the platform's standard configuration classes, e.g. `ServerContextConfig`, follow the same structure).

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

See `assets/configuration-basic-usage.md` for a concrete implementation example.

## Usage Examples in the Platform Implementation (Behavior Reference)

`jp.co.intra_mart.system.platform.ServerContext` (`im_core_base` module):

```java
final ServerContextConfig config = ConfigurationLoader.load(ServerContextConfig.class);
```

`jp.co.intra_mart.system.core.colors.SystemColorPattern` (`im_tags` module) explicitly specifies `Instance.PROTOTYPE` for theme-related configuration that should always reflect the latest content:

```java
final SystemColorPatternConfig config = ConfigurationLoader.load(SystemColorPatternConfig.class, Instance.PROTOTYPE);
```

This illustrates the pattern seen in actual platform code: **the default `Instance.SINGLETON` is usually sufficient, but `Instance.PROTOTYPE` is used for configuration that must reflect updates made e.g. from an admin screen on every call.**
