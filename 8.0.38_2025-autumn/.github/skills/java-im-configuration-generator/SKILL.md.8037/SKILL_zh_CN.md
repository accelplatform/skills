---
name: java-im-configuration-generator
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 专有的配置文件管理 API（`jp.co.intra_mart.foundation.config.ConfigurationLoader`，`im_core_base` 模块），新建“配置类（JAXB）+ XSD 模式 + XML 配置文件”三件套的技能集。提供 `ConfigurationLoader.load`/`loadAll`/`save`/`clearCache` 的选用方法、通过 `Instance`（`SINGLETON`/`PROTOTYPE`）进行的缓存控制、配置文件的放置位置（SystemStorage 的 `conf/`、`WEB-INF/conf`、类路径）与类名到文件名的转换规则，以及 `check-jaxb-format-plugin` 所要求的 `ObjectFactory`（`factoryClass`/`factoryMethod`）实现模式。当用户提到想在 Java 中读取自定义配置文件、想使用 `ConfigurationLoader`、想准备基于 XML 的应用配置、想在 JavaEE 开发模型中新建配置文件时使用。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart ConfigurationLoader API 实现支持技能（Java 版）

## 目的

使用 intra-mart Accel Platform 为 **JavaEE 开发模型**提供的配置文件管理 API（`jp.co.intra_mart.foundation.config.ConfigurationLoader`），支持在 Java 代码中新建、读取、保存应用专属 XML 配置文件的实现工作的技能集。

**本技能仅处理 Java 源文件（`.java`）、XML 模式（`.xsd`）、XML 配置文件（`.xml`）这三件套。** 平台标准配置文件本身（如 `server-context-config.xml`）的修改不在范围内（属于平台整体配置，通常的应用开发不涉及）。

## 基本概念（最重要）

通过 `ConfigurationLoader` 读取的自定义配置，始终由以下三件套构成。**本技能会一并生成这三件套。**

```
① 配置类（带 JAXB 注解的 Java POJO）  … 从 Java 代码角度看到的配置类型
② XSD 模式（.xsd）                    … 对②③的合法性校验，以及与①对应关系的声明
③ XML 配置文件（.xml）                … 实际的配置值（运行时放置）
```

`ConfigurationLoader` 是将这三者对应起来进行读取的一个薄门面（facade），配置类本身不应承载业务逻辑（仅包含 getter/setter 的 POJO）。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.github/instructions` 下不存在专门针对 JAXB 配置类・XSD 模式命名/结构的专用规约。配置类的结构・命名遵循 `assets/configuration-basic-usage.md` 中的模式。

`jssp-*` 系列规约不适用于本技能（不适用于 Java 文件）。JSSP（脚本开发模型）尚未提供与 `ConfigurationLoader` 对应的 SSJS 版 API。

## API 概览

`ConfigurationLoader` 类属于 `jp.co.intra_mart.foundation.config` 包，是一个 `final` 类（不可实例化，全部方法均为 `static`）。

| 方法 | 用途 |
|---------|------|
| `load(Class<T>)` / `load(Class<T>, Instance)` / `load(Class<T>, ClassLoader)` / `load(Class<T>, Instance, ClassLoader)` | 读取一份配置 |
| `loadAll(Class<T>)` / `loadAll(Class<T>, Instance)` / `loadAll(Class<T>, ClassLoader)` / `loadAll(Class<T>, Instance, ClassLoader)` | 读取与同一配置类对应的全部 XML 文件 |
| `save(T configuration)` | 将配置实例持久化为 XML（仅写入 SystemStorage 的 `conf/` 下） |
| `clearCache(Class<?>)` | 在整个集群范围内清除以 `Instance.SINGLETON` 缓存的已读取实例 |
| `findSchema(Class<T>)` / `findSchema(Class<T>, ClassLoader)` | 获取对应的 XSD 模式（通常的应用开发中无需直接调用） |

上述方法均会抛出受检异常 `ConfigurationException`（继承自 `Exception`）。所有方法签名、`Instance` 枚举（`SINGLETON`/`PROTOTYPE`）、异常层次结构、内部配置文件搜索顺序，务必参考 `reference/configuration-loader-api-reference.md`（不要凭记忆或推测编写）。

## 配置文件的放置规则（最重要）

### 文件名的确定规则

由配置类的简单名（PascalCase）推导出 XML/XSD 的基础文件名：在每个大写字母前插入连字符，并将整体转为小写。

示例：`ExternalApiConfig` → `external-api-config`（`external-api-config.xml` / `external-api-config.xsd`）

### 放置目录

无论是开发时还是平台标准运行时，XML 配置文件都按以下优先级顺序被搜索（上面优先级更高）。**应用开发中常用的是 2 和 4。**

| 优先级 | 搜索位置 | 用途 |
|---------|---------|------|
| 1 | SystemStorage 的 `conf/{name}.xml` | `ConfigurationLoader.save()` 的写入目标。适用于通过管理画面等动态更新的配置 |
| 2 | `WEB-INF/conf/{name}.xml`（项目 `src/main/conf/` 下，**不是** `src/main/webapp/WEB-INF/conf/`；不创建包层级，文件直接平铺） | 适用于部署时确定的环境相关配置。**本技能生成的配置的默认放置位置** |
| 3 | `WEB-INF/conf/{name}/` 文件夹下的多个 `.xml`（按文件名升序合并 XML 子元素） | 需要将一份配置拆分为多个文件放置时（如插件追加内容） |
| 4 | 类路径上的 `{将配置类所在包用 / 分隔的目录}/{name}.xml`（位于 `src/main/resources/` 下，或与配置类相同的 `src/main/java/` 下） | 适用于模块自带的默认配置、开发时的示例配置 |

**不要对同一配置同时使用优先级1（SystemStorage）和优先级2（WEB-INF/conf）。** 当 `WEB-INF/conf/{name}.xml` 存在时，即使通过 `ConfigurationLoader.save()` 向 SystemStorage 的 `conf/` 写入了新值，之后的 `load()`——即便调用了 `clearCache()`，即便以 `Instance.PROTOTYPE` 读取——仍会持续返回 `WEB-INF/conf/` 一侧的值，`save()` 的内容不会被反映。移除 `WEB-INF/conf/{name}.xml` 后，SystemStorage 一侧的值会被正确读取。也就是说，**必须按用途严格区分：部署时固定的配置只使用 `WEB-INF/conf/{name}.xml`，通过管理画面等动态更新的配置只使用 `save()`（不放置 `WEB-INF/conf/{name}.xml`）**。

XSD 模式按以下优先级顺序被搜索。

| 优先级 | 搜索位置 |
|---------|---------|
| 1 | `WEB-INF/schema/{name}.xsd`（项目 `src/main/schema/` 下。**不创建包层级，文件直接平铺**。本技能生成的配置的默认放置位置） |
| 2 | 类路径上的 `{将配置类所在包用 / 分隔的目录}/{name}.xsd`（作为已编译资源，放置在与配置类相同的包层级） |

**`src/main/schema/` 在构建时会按相同的相对结构原样复制到 `WEB-INF/schema/`，因此若按包层级放置，既不匹配优先级1也不匹配优先级2，会导致 `SchemaNotFoundException`。** 务必直接平铺放置，不要创建子目录。优先级2（类路径）适用于模式作为已编译资源、与配置类位于同一 Java 包中同时分发的场景（如平台标准配置 `ServerContextConfig` 等），通常的应用开发（webapp 模块）不会用到。

**XSD 模式为必需项。** 若找不到对应的 `.xsd`，会抛出 `SchemaNotFoundException`（`load`/`loadAll`/`save` 均可能发生）。

### 通过 `SUFFIX_KEY` 区分不同文件

设置系统属性 `jp.co.intra_mart.foundation.config.ConfigurationLoader.suffix` 后，会优先搜索 `{name}-{suffix}.xml`（例如 `-Djp.co.intra_mart.foundation.config.ConfigurationLoader.suffix=dev` → `external-api-config-dev.xml`）。适用于按环境分发不同配置文件的场景。通常的应用开发中无需关注。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 配置类（JAXB POJO）+ `ObjectFactory` | `assets/configuration-basic-usage.md` | `@XmlRootElement`/`@XmlType`/`@XmlElement` 的标注模式，以及 `check-jaxb-format-plugin` 要求的 `factoryClass`/`factoryMethod` 实现 |
| XSD 模式 | `assets/configuration-basic-usage.md` | 与配置类字段对应的 `xs:element` 定义 |
| XML 配置文件示例 | `assets/configuration-basic-usage.md` | 放置于 `WEB-INF/conf/` 下的示例 |
| `ConfigurationLoader` 调用代码（读取・保存） | `assets/configuration-basic-usage.md` | `load()`/`loadAll()`/`save()`+`clearCache()` 的调用模式 |

### 参考资料

- `reference/configuration-loader-api-reference.md` — `ConfigurationLoader`/`Instance`/异常类层次结构的全部方法签名，以及基于内部实现的配置文件・模式搜索顺序详情（基于平台实际类定义。不要凭记忆编写）

## 使用时机

当用户提出如下需求时：
- 「用 Java 编写读取自定义配置文件的处理」
- 「想在 JavaEE 开发模型中使用 ConfigurationLoader」
- 「想用 XML 管理应用配置」
- 「想把插件的行为设置外部化为文件」
- 「想了解配置文件的搜索顺序・放置位置」

若未明确说明「用 Java」「在 JavaEE 开发模型中」，需向用户确认项目现有实现属于哪种开发模型。JSSP（无代码/低代码）方向不存在与 `ConfigurationLoader` 对应的 SSJS 版 API。

## 实现步骤

1. 收集用户需求（配置项清单及类型、必需/可选、更新频率——部署时固定还是通过管理画面等动态更新、是否需要按环境区分值）
2. 确定配置类名（推荐 `XxxConfig` 命名，遵循 `.github/instructions/java-naming.instructions.md`），并按照「配置文件的放置规则」推导文件名（如 `external-api-config`）
3. 参考 `assets/configuration-basic-usage.md` 实现配置类、`ObjectFactory`、XSD 模式、XML 示例（方法签名・注解属性务必参考 `reference/configuration-loader-api-reference.md`，不要凭记忆或推测编写）
4. 不需要动态更新的配置，按步骤2推导出的文件名放置于 `src/main/conf/{name}.xml`（不是 `src/main/webapp/WEB-INF/conf/`）。需要通过管理画面等动态更新的配置，实现使用 `ConfigurationLoader.save()` 的代码（会写入 SystemStorage 的 `conf/` 下，不是运维人员直接编辑的文件）。**这两者不要用于同一配置**（同时放置 `WEB-INF/conf/{name}.xml` 会导致 `save()` 的内容不被反映，参见「放置目录」）
5. 将 XSD 模式**直接平铺**（不创建子目录）放置于 `src/main/schema/{name}.xsd`（会原样复制到 `WEB-INF/schema/`）
6. 在调用方（如服务类）中实现通过 `ConfigurationLoader.load()` 读取的代码。`Instance.SINGLETON`（默认）与 `Instance.PROTOTYPE` 的选择参考「注意事项」判断
7. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `.github/instructions/java-code-style.instructions.md` / `.github/instructions/java-javadoc.instructions.md`

## 注意事项

- **`ObjectFactory` 与 `factoryClass`/`factoryMethod` 不可省略。** intra-mart 的构建（`check-jaxb-format-plugin`）会在配置类的 `@XmlType` 未指定 `factoryClass`/`factoryMethod` 时判定为构建错误。此外，工厂方法若不是 `static` 也会导致构建错误。每新增一个配置类，都要在同一包的 `ObjectFactory` 中添加对应的 `static` 生成方法
- **`load()` 的默认值（`Instance.SINGLETON`）会在进程内被缓存。** 除非调用 `clearCache()`，否则同一进程内始终返回同一实例。若需要每次都反映配置变更，可使用 `Instance.PROTOTYPE`，或在变更后显式调用 `clearCache()`
- **`save()` 仅写入 `conf/` 下。** 不会写入 `WEB-INF/conf/` 或类路径。若需要重新读取通过 `save()` 保存的配置，注意 `save()` 本身不会清除缓存，需要在 `save()` 之后显式调用 `clearCache()`
- **若 `WEB-INF/conf/{name}.xml` 存在，即使调用 `clearCache()`，通过 `save()` 写入的新值也不会被反映。** 使用 `save()` 动态更新的配置不要放置 `WEB-INF/conf/{name}.xml`（参见「放置目录」）
- **`clearCache()` 会传播到整个集群（多台应用服务器）。** 若在单元测试或开发时只想清除本地内存中的缓存，需在设置了系统属性 `jp.co.intra_mart.foundation.config.ConfigurationLoader.local=true` 的运行环境中调用
- **通过 `WEB-INF/conf/{name}/` 文件夹进行拆分放置时，`load()` 与 `loadAll()` 的行为不同。** `load()`（单数）会将文件夹内的多个 `.xml` 按文件名升序合并为一份配置后再读取（可将一份配置按功能拆分放置）。`loadAll()` 会将文件夹内的每个 `.xml` 作为独立的配置实例以数组形式返回（不合并）。相同的文件夹结构，因调用方法不同而行为不同
- **XSD 模式的 namespace 必须与配置类的 `@XmlRootElement`/`@XmlElement` 的 `namespace` 属性完全一致。** 不一致会导致模式校验错误（`ConfigurationException`）或元素读取遗漏
- **不要在 `src/main/schema/` 下创建包层级。** 必须直接平铺放置，否则会导致 `SchemaNotFoundException`（消息为 `{name}.xsd`）。「按配置类相同的包层级放置应该能在类路径上被找到」这一类推是错误的
- 通常的应用开发中无需直接调用 `findSchema()`（它在 `load()`/`save()` 内部用于模式校验）

## 生成后的确认

并非自动校验脚本（不同于 JSSP 版的 `validate-jssp-code.js`），需手动确认以下事项。

1. 实际编译配置类，确认不会出现 `check-jaxb-format-plugin` 导致的构建错误（未指定 `factoryClass`/`factoryMethod`・工厂方法非 `static`）
2. 确认 XSD 模式的 `targetNamespace` 与配置类・`ObjectFactory` 的 `namespace` 属性一致
3. 确认 XML 配置文件相对于 XSD 模式是合法的
4. 使用 `save()` 时，确认保存后调用了 `clearCache()`
5. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `.github/instructions/java-code-style.instructions.md` / `.github/instructions/java-javadoc.instructions.md`
6. `jssp-code-review` / `jssp-security-check` 为 JSSP 专用，不适用于本技能的产出物。若项目另有面向 Java 的代码评审・安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **在 Java（JavaEE 开发模型）中新建、读取、保存自定义 XML 配置文件** | **本技能** |
| 平台标准配置文件本身（如 `server-context-config.xml`）的修改 | 不在范围内。属于平台整体配置，如确实需要变更，应先与用户确认意图后再谨慎处理 |
| 通过消息属性文件（`.properties`）实现多语言化 | `java-im-message-usage` |
| Java 中的文件操作（`PublicStorage`/`SystemStorage` 等） | `java-im-storage-usage` |
| JSSP（脚本开发模型）中的配置管理 | 尚未提供对应的 SSJS 版 API（不在本技能范围内） |
