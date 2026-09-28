---
name: java-im-cache-usage
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 专有的缓存 API（`jp.co.intra_mart.foundation.cache.CacheManager` / `Cache`，`im_cache_base` 模块）的技能集。提供通过 `CacheManagerFactory.getCacheManager()` 获取以租户为单位的缓存管理器、`Cache<K, V>` 的 CRUD 操作（get/put/remove/removeAll 等）、创建缓存配置文件（`WEB-INF/conf/im-ehcache-config/*.xml`）、缓存键与值的 `Serializable` 约束。当提及想在 Java 中使用缓存、想在 Java 中使用 `CacheManager`/`Cache`、想在 JavaEE 开发模型中缓存检索结果或主数据、想创建 `im-ehcache-config` 配置文件时使用。若要在 JSSP（脚本开发模型）中实现同等处理，应改用 SSJS 版的 `Cache` API（`d.ts/platform/cache/im-ssjs-cache.d.ts`）。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Cache API（Java 版）使用支持技能

## 目的

用于在 Java 代码中实现以租户为单位的缓存（检索结果、主数据等可复用数据）的技能集，使用 intra-mart Accel Platform 为 **JavaEE 开发模型** 提供的缓存 API（`jp.co.intra_mart.foundation.cache.CacheManager` / `Cache`）。

## 使用缓存的基本方针（最重要）

- 获取缓存管理器**只使用 `CacheManagerFactory.getCacheManager()`（无参静态方法）**。租户ID在方法内部通过执行上下文的 `AccountContext` 自动解析，应用代码无需感知租户ID
- `getCacheManager()` 只能在**存在租户上下文的执行环境**（通常的请求处理、任务执行等）中调用。在无法从 `AccountContext` 解析出租户ID的执行环境中调用会抛出 `IllegalStateException`
- 通过 `CacheManager#getCache(String cacheName)` 获取的 `Cache<K, V>` 的**键(K)・值(V)必须实现 `java.io.Serializable`**。传入未实现该接口的类型会导致缓存实现（默认为 Ehcache）序列化失败
- **在使用缓存之前，必须先在缓存配置文件（`WEB-INF/conf/im-ehcache-config/*.xml`）中定义缓存名。** 若配置文件不存在，或不存在对应的 `cache name` 定义，则行为不被保证
- `Cache#get()` 在缓存未命中时返回 `null`（不抛出异常）。调用方必须进行 `null` 检查，并实现缓存未命中时的重新加载处理（包括重新注册到缓存）
- 生命周期管理（如 `CacheLifecycle#start()`）由 `CacheManagerFactory` 内部自动完成。应用侧无需关注生命周期

**本技能仅处理 Java 源文件（`.java`）与缓存配置文件（`.xml`）。** 若在 JSSP（`.js`）中实现，应改用对应的 SSJS 版 `Cache` API（`d.ts/platform/cache/im-ssjs-cache.d.ts`）——该版本内部同样通过相同的 `CacheManagerFactory`/`CacheManager` 实现桥接，并与 Java 版共享缓存配置文件与缓存命名空间。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.github/instructions` 下目前不存在规定异常处理方针的 Java 专用规约。`CacheManagerFactory.getCacheManager()` 抛出的 `IllegalStateException` 的处理应遵循 `assets/cache-basic-usage.md` 中的模式。

`jssp-*` 规约不适用于本技能（不适用于 Java 文件）。

## API 概述

`CacheManager` 属于 `jp.co.intra_mart.foundation.cache` 包，通过 `CacheManagerFactory.getCacheManager()` 可获取以租户为单位的实例。通过 `CacheManager#getCache(cacheName)` 获取的 `Cache<K, V>` 实现了 `Iterable<Cache.Entry<K, V>>`，提供 `get`/`put`/`remove`/`removeAll` 等 CRUD 方法。标准实现（`im_cache_impl` 模块）以 Ehcache 2.x 为后端。详细的签名・内部结构・缓存配置文件的 XSD 定义请参考 `reference/cache-api-reference.md`（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 缓存的获取与读写（调用 `CacheManagerFactory`/`Cache`） | `assets/cache-basic-usage.md` | `getCache()`/`get()`/`put()`/`remove()`/`removeAll()` 的调用示例、缓存未命中时的重新加载模式 |
| 新建缓存配置文件 | `assets/cache-basic-usage.md` | `WEB-INF/conf/im-ehcache-config/*.xml` 的示例及各属性的含义 |

### 参考资料

- `reference/cache-api-reference.md` — `CacheManager` / `CacheManagerFactory` / `Cache` / `Cache.Entry` 的全部方法・签名，以及缓存配置文件的 XSD 属性定义（基于平台 API 的实际类定义，不要凭记忆编写）

## 使用时机

当用户提出以下类似需求时:
- "创建一个在 Java 中使用缓存的处理"
- "想在 JavaEE 开发模型中使用 `CacheManager`/`Cache` API 缓存主数据"
- "想缓存检索结果以便复用"
- "想新建一个 `im-ehcache-config` 配置文件"
- "想减少频繁访问数据的数据库查询次数"

若未明确说明"在 Java 中"、"在 JavaEE 开发模型中"等，应向用户确认项目现有实现使用的是哪种开发模型。若是在 JSSP（专业代码）画面或函数容器内使用缓存，应改用 SSJS 版 `Cache` API（`d.ts/platform/cache/im-ssjs-cache.d.ts`）。

此外，**当缓存对象是仅在单次请求或会话内闭环的临时数据时**，`Cache` API 作为跨整个租户共享的持久化缓存机制可能显得过重。若用途仅为请求作用域内的临时保存，应向用户说明使用普通变量或会话作用域机制可能更为合适。

## 实现步骤

1. 听取用户需求（缓存对象数据的种类・更新频率、缓存键的设计、是否需要有效期（TTL）、缓存失效时的重新加载方针）
2. 确定缓存名，并在 `WEB-INF/conf/im-ehcache-config/` 下新建配置文件（参考 `reference/cache-api-reference.md` 中的 XSD 属性定义。`name` 属性应与传给 `CacheManager#getCache(cacheName)` 的值一致）
3. 参考 `assets/cache-basic-usage.md` 实现（方法签名务必参考 `reference/cache-api-reference.md`，不要凭记忆或推测编写）
4. 确认缓存键・值的类是否实现了 `java.io.Serializable`
5. 实现 `Cache#get()` 返回值为 `null` 时的重新加载处理（从数据源获取 → 通过 `put()` 注册到缓存）
6. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **`CacheManagerFactory.getCacheManager()` 只能在存在租户上下文的执行环境中调用。** 在无法从 `AccountContext` 获取租户ID的执行环境（如不隶属于任何租户的系统处理）中调用会抛出 `IllegalStateException`。应确认调用方的执行上下文
- **缓存键・值必须实现 `java.io.Serializable`。** 传入未实现该接口的类型会在标准实现（Ehcache）的序列化处理中出错
- **应先在缓存配置文件中定义缓存名，再调用 `getCache()`。** 指定未定义的缓存名，行为不被保证
- `Cache#get()` 在缓存未命中时返回 `null`，不抛出异常。**调用方必须始终进行 `null` 检查**
- **`enable` 属性的默认值为 `false`。** 除非在缓存配置文件中显式指定 `enable="true"`，否则该缓存不会被启用（[官方参考文档](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)）
- **缓存名（`name` 属性）不要使用以 `im_` 开头的名称。** 该前缀为系统保留字
- 缓存配置文件中的 `time-to-idle-seconds`（空闲失效）与 `time-to-live-seconds`（绝对存活时间）含义不同。对更新频率较低的主数据可将 `time-to-live-seconds` 设置得较长，对希望根据访问频率失效的数据可使用 `time-to-idle-seconds`，应根据需求区分使用。具体秒数・上限数量的确定方法参见 `reference/cache-api-reference.md` 中的「`time-to-idle-seconds`/`time-to-live-seconds` 的取值方法」
- 若已设置 `max-elements-on-memory`，则 `max-bytes-memory` 会失效（`max-elements-on-disk`/`max-bytes-disk` 之间也是同样的关系）。应仅指定其中一个
- **`max-bytes-memory`/`max-bytes-disk` 需要对对象进行大小计算处理，因此缓存持有大量引用的大对象时可能成为性能下降的原因。** 此时应改用 `max-elements-on-memory`/`max-elements-on-disk`（按元素数指定上限）
- **多租户运行时，缓存容量会按租户单独分配。** 设计 `max-bytes-memory` 等上限值时，应按租户数量估算总消耗量
- 缓存在多个请求・多个用户之间共享。**若要在缓存中存储用户专属的敏感信息（个人信息、认证信息等），应在设计阶段确认不会在租户间・用户间被意外访问**
- `Cache` 是以租户为单位的缓存机制，`removeAll()` 会删除属于该缓存名的全部条目（不影响其他缓存名）
- **本技能的 `Cache` 与 JSSP 侧的 SSJS `Cache` 共享配置文件与缓存命名空间，但值的双向互用仅在 Java → JSSP 方向可行。** JSSP 侧 `put()` 存入的值会以 Rhino 的序列化形式（`ScriptBinaryObject`）包装后存储，若在 Java 侧以固定类型取值会抛出 `ClassCastException`。具体原因与规避方法参见 `reference/cache-api-reference.md` 中的「与 JSSP（脚本开发模型）的关系」

## 生成后的确认

并非通过自动验证脚本，而是手动确认以下事项。

1. 缓存配置文件（`WEB-INF/conf/im-ehcache-config/*.xml`）的 `name` 属性与 Java 代码中 `getCache(cacheName)` 的参数是否一致
2. 缓存键・值的类是否实现了 `java.io.Serializable`
3. 是否实现了对 `Cache#get()` 返回值的 `null` 检查，以及缓存未命中时的重新加载・重新注册处理
4. 调用 `CacheManagerFactory.getCacheManager()` 的执行环境是否存在租户上下文（是否在任务调度器等不隶属于租户的执行环境中调用）
5. 若在缓存中存储敏感信息，设计上是否避免了租户间・用户间的意外访问
6. 是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
7. `jssp-code-review` / `jssp-security-check` 仅适用于 JSSP，不适用于本技能的生成物。若项目中另有针对 Java 的代码评审・安全检查技能，应使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| SSJS（JSSP）中的缓存实现 | `jssp-im-cache-usage`（SSJS 版 `Cache` API，`d.ts/platform/cache/im-ssjs-cache.d.ts`） |
| **Java（JavaEE 开发模型）中的缓存实现** | **本技能** |
| Java 中的文件操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java 中的应用锁（`NewLock`） | `java-im-lock-usage` |
| Java 中的唯一 ID 生成（`Identifier`） | `java-im-identifier-usage` |
| 仅限于单个 JVM 内的内存缓存（无需跨租户共享时） | 不在本技能范围内（应单独使用标准 `java.util.concurrent` 类等实现） |
