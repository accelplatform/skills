---
name: java-im-configuration-generator
description: A skillset for using the intra-mart-specific configuration file management API (`jp.co.intra_mart.foundation.config.ConfigurationLoader`, `im_core_base` module) in Java (JavaEE development model) to newly create the three-piece set of a JAXB-based configuration class, an XSD schema, and an XML configuration file. Provides guidance on choosing between `ConfigurationLoader.load`/`loadAll`/`save`/`clearCache`, cache control via `Instance` (`SINGLETON`/`PROTOTYPE`), where configuration files are placed (SystemStorage's `conf/`, `WEB-INF/conf`, the classpath) and the class-name-to-file-name conversion rule, and the `ObjectFactory` (`factoryClass`/`factoryMethod`) implementation pattern required by `check-jaxb-format-plugin`. Use when the user mentions wanting to load a custom configuration file in Java, use `ConfigurationLoader`, set up an XML-based application configuration, or newly create a configuration file in the JavaEE development model.
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart ConfigurationLoader API Support Skill (Java Version)

## Purpose

A skillset for defining, loading, and saving application-specific XML configuration files in Java code, using the configuration file management API provided for the **JavaEE development model** by intra-mart Accel Platform (`jp.co.intra_mart.foundation.config.ConfigurationLoader`).

**This skill deals only with the three-piece set of a Java source file (`.java`), an XML schema (`.xsd`), and an XML configuration file (`.xml`).** Modifying the platform's own standard configuration files (e.g. `server-context-config.xml`) is out of scope (these are platform-wide settings not normally touched by application development).

## Core Concept (Most Important)

A custom configuration loaded via `ConfigurationLoader` is always made up of the following three pieces. **This skill generates all three together.**

```
(1) Configuration class (a JAXB-annotated Java POJO)  ... the type of the configuration as seen from Java code
(2) XSD schema (.xsd)                                  ... validates (2)/(3) and declares the mapping to (1)
(3) XML configuration file (.xml)                       ... the actual configuration values (placed at runtime)
```

`ConfigurationLoader` is a thin facade that maps these three pieces together when loading; the configuration class itself should carry no logic (a plain POJO with getters/setters only).

## Conventions to Consult

| Convention | Handling |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **Required reading** — class/method JavaDoc |

There is no dedicated convention under `.github/instructions` for the naming/structure of JAXB configuration classes or XSD schemas. Follow the pattern in `assets/configuration-basic-usage.md` for a configuration class's structure and naming.

`jssp-*` conventions are out of scope for this skill (they do not apply to Java files). No SSJS-version API equivalent to `ConfigurationLoader` is provided for JSSP (script development model).

## API Overview

The `ConfigurationLoader` class belongs to the `jp.co.intra_mart.foundation.config` package and is a `final` class (cannot be instantiated; every method is `static`).

| Method | Purpose |
|---------|------|
| `load(Class<T>)` / `load(Class<T>, Instance)` / `load(Class<T>, ClassLoader)` / `load(Class<T>, Instance, ClassLoader)` | Load a single configuration |
| `loadAll(Class<T>)` / `loadAll(Class<T>, Instance)` / `loadAll(Class<T>, ClassLoader)` / `loadAll(Class<T>, Instance, ClassLoader)` | Load every XML file that corresponds to the given configuration class |
| `save(T configuration)` | Persist a configuration instance as XML (writes only under SystemStorage's `conf/`) |
| `clearCache(Class<?>)` | Clear, cluster-wide, an instance cached under `Instance.SINGLETON` |
| `findSchema(Class<T>)` / `findSchema(Class<T>, ClassLoader)` | Retrieve the corresponding XSD schema (not normally called directly in application development) |

All of these throw the checked exception `ConfigurationException` (extends `Exception`). Always consult `reference/configuration-loader-api-reference.md` for the full method signatures, the `Instance` enum (`SINGLETON`/`PROTOTYPE`), the exception hierarchy, and the internal configuration-file search order (never write these from memory or guesswork).

## Configuration File Placement Rules (Most Important)

### File Name Derivation

The base file name for the XML/XSD is derived from the configuration class's simple name (PascalCase) by inserting a hyphen before each uppercase letter and lowercasing the whole thing.

Example: `ExternalApiConfig` -> `external-api-config` (`external-api-config.xml` / `external-api-config.xsd`)

### Placement Directories

XML configuration files are searched for, both during development and under standard platform operation, in the following priority order (highest first). **Application development commonly uses 2 and 4.**

| Priority | Search Location | Use |
|---------|---------|------|
| 1 | `conf/{name}.xml` under SystemStorage | The write target of `ConfigurationLoader.save()`. For configuration updated dynamically, e.g. from an admin screen |
| 2 | `WEB-INF/conf/{name}.xml` (under the project's `src/main/conf/` — **not** `src/main/webapp/WEB-INF/conf/`; placed directly, with no package hierarchy) | For environment-specific configuration fixed at deploy time. **The default placement this skill generates configuration for** |
| 3 | Multiple `.xml` files under a `WEB-INF/conf/{name}/` folder (child elements merged in ascending file-name order) | When splitting a single configuration across multiple files (e.g. plugin-driven additions) |
| 4 | `{directory formed from the configuration class's package, slash-separated}/{name}.xml` on the classpath (under `src/main/resources/`, or alongside the configuration class under `src/main/java/`) | For a default configuration bundled with a module, or a sample configuration for development |

**Do not use priority 1 (SystemStorage) and priority 2 (WEB-INF/conf) together for the same configuration.** When `WEB-INF/conf/{name}.xml` exists, writing a new value to SystemStorage's `conf/` via `ConfigurationLoader.save()` does not get picked up by a subsequent `load()` — even after calling `clearCache()`, and even when reading with `Instance.PROTOTYPE` — because the value from `WEB-INF/conf/` keeps being returned instead. Removing `WEB-INF/conf/{name}.xml` causes the SystemStorage value to be read correctly. In other words, **strictly separate configuration by use case: configuration fixed at deploy time uses only `WEB-INF/conf/{name}.xml`; configuration updated dynamically e.g. from an admin screen uses only `save()` (with no `WEB-INF/conf/{name}.xml` present)**.

The XSD schema is searched for in the following priority order.

| Priority | Search Location |
|---------|---------|
| 1 | `WEB-INF/schema/{name}.xsd` (under the project's `src/main/schema/`. **Placed directly, without recreating the package hierarchy.** The default placement this skill generates configuration for) |
| 2 | `{directory formed from the configuration class's package}/{name}.xsd` on the classpath (placed as a compiled resource, using the same package hierarchy as the configuration class) |

**`src/main/schema/` is copied to `WEB-INF/schema/` at build time preserving the same relative structure, so placing it under a recreated package hierarchy matches neither priority 1 nor 2 and results in a `SchemaNotFoundException`.** Always place it directly, with no subdirectories. Priority 2 (the classpath) is for cases where the schema ships as a compiled resource in the same Java package as the configuration class — as with the platform's own standard configuration (e.g. `ServerContextConfig`) — and is not used in ordinary application development (a webapp module).

**The XSD schema is mandatory.** If the corresponding `.xsd` is not found, a `SchemaNotFoundException` is thrown (this can happen for `load`, `loadAll`, and `save` alike).

### Switching Files via `SUFFIX_KEY`

Setting the system property `jp.co.intra_mart.foundation.config.ConfigurationLoader.suffix` causes `{name}-{suffix}.xml` to be searched for preferentially (e.g. `-Djp.co.intra_mart.foundation.config.ConfigurationLoader.suffix=dev` -> `external-api-config-dev.xml`). Use this when different configuration files need to be distributed per environment. Not normally something ordinary application development needs to think about.

## Generation Targets and Templates

| Generation Target | Template | Content |
|---------|------------|------|
| Configuration class (JAXB POJO) + `ObjectFactory` | `assets/configuration-basic-usage.md` | The pattern for attaching `@XmlRootElement`/`@XmlType`/`@XmlElement`, and the `factoryClass`/`factoryMethod` implementation required by `check-jaxb-format-plugin` |
| XSD schema | `assets/configuration-basic-usage.md` | `xs:element` definitions corresponding to the configuration class's fields |
| Sample XML configuration file | `assets/configuration-basic-usage.md` | An example placement under `WEB-INF/conf/` |
| `ConfigurationLoader` call-site code (load/save) | `assets/configuration-basic-usage.md` | Call patterns for `load()`/`loadAll()`/`save()`+`clearCache()` |

### Reference

- `reference/configuration-loader-api-reference.md` — Full method signatures for `ConfigurationLoader`/`Instance`/the exception class hierarchy, and details of the internal implementation behind the configuration-file/schema search order (based on the platform's actual class definitions; never write this from memory)

## When to Use

When the user makes a request such as:
- "Create Java code that loads a custom configuration file"
- "I want to use ConfigurationLoader in the JavaEE development model"
- "I want to manage application configuration in XML"
- "I want to externalize a plugin's behavior settings into a file"
- "I want to know the search order and placement locations for configuration files"

If it is not explicitly stated that this is "in Java" / "in the JavaEE development model", confirm with the user which development model the project's existing implementation uses. No SSJS-version API equivalent to `ConfigurationLoader` exists for JSSP (pro-code).

## Implementation Steps

1. Gather the user's requirements (the list of configuration items and their types, required/optional, update frequency — fixed at deploy time vs. updated dynamically e.g. from an admin screen — and whether values need to differ per environment)
2. Decide on the configuration class name (the `XxxConfig` naming convention is recommended, following `.github/instructions/java-naming.instructions.md`), and derive the file name (e.g. `external-api-config`) per "Configuration File Placement Rules"
3. Implement the configuration class, `ObjectFactory`, the XSD schema, and the XML sample by consulting `assets/configuration-basic-usage.md` (always consult `reference/configuration-loader-api-reference.md` for method signatures and annotation attributes; never write these from memory or guesswork)
4. For configuration that does not need dynamic updates, place it at `src/main/conf/{name}.xml` (not `src/main/webapp/WEB-INF/conf/`) using the file name derived in step 2. For configuration updated dynamically e.g. from an admin screen, implement code that uses `ConfigurationLoader.save()` (this writes under SystemStorage's `conf/`; it is not a file an operator edits directly). **Do not combine these two for the same configuration** (having `WEB-INF/conf/{name}.xml` present prevents `save()`'s content from being picked up — see "Placement Directories")
5. Place the XSD schema at `src/main/schema/{name}.xsd`, **directly, with no subdirectories** (it is copied to `WEB-INF/schema/` as-is)
6. Implement the call-site code (e.g. in a service class) that reads via `ConfigurationLoader.load()`. Decide between `Instance.SINGLETON` (default) and `Instance.PROTOTYPE` per the guidance in "Notes"
7. Confirm compliance with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **`ObjectFactory` and `factoryClass`/`factoryMethod` cannot be omitted.** intra-mart's build (`check-jaxb-format-plugin`) fails the build if a configuration class's `@XmlType` does not specify `factoryClass`/`factoryMethod`. It also fails the build if the factory method is not `static`. Every time a configuration class is added, add a corresponding `static` creation method to the `ObjectFactory` in the same package
- **The default for `load()` (`Instance.SINGLETON`) is cached within the process.** Unless `clearCache()` is called, the same instance is always returned within the same process. If configuration changes need to be reflected on every call, use `Instance.PROTOTYPE`, or explicitly call `clearCache()` after a change
- **`save()` writes only under `conf/`.** It does not write to `WEB-INF/conf/` or the classpath. If you need to re-read the configuration saved by `save()`, note that `save()` itself does not clear the cache — `clearCache()` must be called right after `save()`
- **If `WEB-INF/conf/{name}.xml` exists, a new value written via `save()` is not picked up even after calling `clearCache()`.** Do not place `WEB-INF/conf/{name}.xml` for a configuration that uses dynamic updates via `save()` (see "Placement Directories")
- **`clearCache()` propagates cluster-wide (across multiple application servers).** If, during unit testing or development, you only want to clear the in-memory cache on the local node, call it from a runtime environment where the system property `jp.co.intra_mart.foundation.config.ConfigurationLoader.local=true` is set
- **The behavior of split placement via a `WEB-INF/conf/{name}/` folder differs between `load()` and `loadAll()`.** `load()` (singular) merges the multiple `.xml` files in the folder, in ascending file-name order, into a single configuration before loading it (letting a single configuration be split across files by function). `loadAll()` returns each `.xml` in the folder as an independent configuration instance in an array (no merging). The same folder layout behaves differently depending on which method is called
- **The XSD schema's namespace must exactly match the `namespace` attribute on the configuration class's `@XmlRootElement`/`@XmlElement`.** A mismatch causes a schema validation error (`ConfigurationException`) or elements failing to be read
- **Do not recreate a package hierarchy under `src/main/schema/`.** Place the file directly, or you get a `SchemaNotFoundException` (with a message of `{name}.xsd`). The assumption that "placing it under the same package hierarchy as the configuration class should make it findable on the classpath" is wrong
- There is no need to call `findSchema()` directly in ordinary application development (it is used internally by `load()`/`save()` for schema validation)

## Post-Generation Checks

Not an automated validation script (unlike the JSSP-side `validate-jssp-code.js`) — check the following items manually.

1. Actually compile the configuration class and confirm no build errors from `check-jaxb-format-plugin` (missing `factoryClass`/`factoryMethod`, or a non-`static` factory method)
2. Confirm the XSD schema's `targetNamespace` matches the `namespace` attribute on the configuration class / `ObjectFactory`
3. Confirm the XML configuration file is valid against the XSD schema
4. If using `save()`, confirm `clearCache()` is called after saving
5. Confirm compliance with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
6. `jssp-code-review` / `jssp-security-check` are JSSP-only and do not apply to this skill's output. If the project has separate code-review/security-check skills for Java, use those instead

## Boundaries with Other Skills

| Responsibility | Owning Skill |
|------|-----------|
| **Creating, loading, and saving custom XML configuration files in Java (JavaEE development model)** | **This skill** |
| Modifying the platform's own standard configuration files (e.g. `server-context-config.xml`) | Out of scope. These are platform-wide settings; if a change is genuinely needed, confirm intent with the user first and proceed carefully |
| Localization via message property files (`.properties`) | `java-im-message-usage` |
| File operations in Java (`PublicStorage`/`SystemStorage`, etc.) | `java-im-storage-usage` |
| Configuration management in JSSP (script development model) | No SSJS-version API equivalent is provided (out of scope for this skill) |
