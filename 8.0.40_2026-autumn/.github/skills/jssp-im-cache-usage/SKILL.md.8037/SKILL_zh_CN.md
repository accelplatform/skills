---
name: jssp-im-cache-usage
description: 用于在 JSSP（脚本开发模型）的函数容器中使用 intra-mart 提供的 SSJS `Cache` 类（`d.ts/platform/cache/im-ssjs-cache.d.ts`）的技能集。提供通过 `WEB-INF/conf/im-ehcache-config/{name}.xml` 进行缓存配置（TTL・最大元素数等）、`get`/`put`/`remove`/`removeAll` 的基本用法、缓存键设计，以及仅可缓存可序列化值这一限制。当提及想使用缓存、想实现缓存功能、想使用 Cache 类、想在 SSJS 中缓存数据、想通过缓存加速重复处理时使用。若要在 Java（JavaEE 开发模型）中实现同等处理，应改用 `java-im-cache-usage`。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart SSJS Cache API 使用支持技能

## 目的

用于在函数容器中实现服务端缓存的技能集，使用 intra-mart Accel Platform 为脚本开发模型（JSSP）提供的 SSJS `Cache` 类（自 8.0.37 (2025 Spring) 起可用）。

`Cache` 是从函数容器（`.js`）中使用的 API，通常不会在展示页面（`.html`）中直接使用。用于缓存可跨请求复用的数据（数据库查询结果、计算成本较高的处理结果等），以缩短处理时间。

## 应参考的规约

本技能生成的是函数容器（`.js`）内的缓存使用代码。整体规约请参考 `.github/instructions/README.md` 的"规约文件一览"。

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/jssp-function-container.instructions.md` | 🟢 **必读** — `init()` 结构・函数拆分方针 |
| `.github/instructions/jssp-naming.instructions.md` / `.github/instructions/jssp-code-style.instructions.md` / `.github/instructions/jssp-file-structure.instructions.md` | 🟢 必读 |
| `.github/instructions/jssp-error-handling.instructions.md` | 🟢 必读 — 获取缓存源数据处理（如 DB 访问）的错误处理 |
| `.github/instructions/jssp-2way-sql.instructions.md` | 🟡 仅在缓存对象数据从 DB 获取时参考 |
| `.github/instructions/jssp-presentation-page.instructions.md` | 🔴 **本技能单独使用时不需要** — `Cache` 不直接在展示页面中使用 |

## API 概述

`Cache` 类的完整类型定义请参考 `d.ts/platform/cache/im-ssjs-cache.d.ts`（不要凭记忆或推测编写）。要点如下。

- 通过 `new Cache(cacheName)` 创建实例。`cacheName` 须与后述缓存配置文件中定义的缓存名一致
- 仅具有 `get(key)` / `put(key, value)` / `remove(key)` / `removeAll()` 这4个方法
- `get(key)` 在缓存中未找到值时返回 `null`，不会抛出异常
- 传给 `put(key, value)` 的 `value` 必须是可序列化的对象。函数以及宿主对象（如 DB 连接对象）不能作为缓存对象
- `Cache` 内部是对 Java 侧 `CacheManagerFactory.getCacheManager()` 的桥接实现，与 Java（JavaEE 开发模型）的 `CacheManager`/`Cache` API 共享相同的缓存配置文件与缓存命名空间
- `Cache` 仅在存在租户上下文的执行环境（展示页面处理、函数容器处理、任务执行等）下工作。在不存在租户上下文的执行环境中实例化会发生 `IllegalStateException`

## 缓存配置文件（使用前的必要准备）

使用缓存前，必须在 `WEB-INF/conf/im-ehcache-config/{任意名称}.xml` 中定义缓存名。不要向 `new Cache(cacheName)` 传入未在配置文件中定义的缓存名。

```xml
<im-ehcache-config xmlns="http://www.intra-mart.jp/cache/ehcache/config">
  <cache name="itemMasterCache"
         enable="true"
         time-to-idle-seconds="600"
         time-to-live-seconds="3600"
         max-elements-on-memory="1000"
         max-elements-on-disk="0"
         max-bytes-memory="0"
         max-bytes-disk="0"
         overflow-to-disk="false" />
</im-ehcache-config>
```

| 属性 | 默认值 | 含义 |
|---|---|---|
| `name`（必须） | - | 缓存名。须与 `new Cache(cacheName)` 的参数一致。**不要使用以 `im_` 开头的名称，该前缀为系统保留字** |
| `enable` | `false` | 控制该缓存的启用/禁用。**默认值为 `false`**，须显式指定 `enable="true"` |
| `time-to-idle-seconds` | `0` | 自最后一次访问起的存活时间（秒） |
| `time-to-live-seconds` | `0` | 自注册起的绝对存活时间（秒） |
| `max-elements-on-memory` | `0` | 内存中的最大元素数 |
| `max-elements-on-disk` | `0` | 溢出到磁盘时的最大元素数 |
| `max-bytes-memory` / `max-bytes-disk` | `0` | 按字节数指定的上限。**若已设置对应的 `max-elements-on-memory`/`max-elements-on-disk`，则各自失效** |
| `overflow-to-disk` | `false` | 是否将超出内存的部分溢出到磁盘 |

省略属性时将回退到租户通用的默认设置。建议根据业务需求明确设置缓存的存活期限与容量上限（数值的确定方法参见下方「注意事项」）。

**`max-bytes-memory`/`max-bytes-disk` 需要对对象进行大小计算处理，因此缓存持有大量引用的大对象时可能成为性能下降的原因。** 此时应改用 `max-elements-on-memory`/`max-elements-on-disk`（按元素数指定上限）。

该配置文件也与 Java（JavaEE 开发模型）的 `CacheManager`/`Cache` API 共享。命名前请确认其他功能尚未使用相同的缓存名。**多租户运行时，缓存容量会按租户单独分配**，因此设计上限值时应按租户数量估算总消耗量（来源：[官方参考文档](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 函数容器内的缓存引用・注册・删除 | `assets/cache-basic-usage.md` | 基于 `get`/`put` 的基本模式、更新时的 `remove`、缓存键设计示例 |

## 使用时机

当用户提出以下类似需求时使用:
- "想通过缓存加速主数据查询处理"
- "想使用 Cache 类"
- "想缓存结果以避免重复相同的计算"
- "想创建缓存配置文件"

若明确提及"在 Java 中"、"在 JavaEE 开发模型中"，应改用 `java-im-cache-usage`。

## 实现步骤

1. 听取缓存对象数据与键设计的需求（缓存什么、使用什么键、缓存多长时间；若数据更新频率较高，应重新评估是否真的需要缓存）
2. 在 `WEB-INF/conf/im-ehcache-config/{name}.xml` 中定义缓存名・TTL・容量上限（参考上表）
3. 参考 `assets/cache-basic-usage.md` 在函数容器中实现
4. 确认是否符合 `.github/instructions/jssp-function-container.instructions.md` / `jssp-naming.instructions.md` / `jssp-code-style.instructions.md` / `jssp-error-handling.instructions.md`

## 注意事项

- **须预先在配置文件中定义缓存名。** `new Cache(cacheName)` 本身无论缓存名是否存在都可以调用，但为了确保应用预期的缓存设置（TTL・容量上限等），务必准备对应的 `<cache>` 定义
- **`time-to-idle-seconds`/`time-to-live-seconds` 的具体秒数不存在「推荐值」。** 应根据源数据的更新频率・可接受的数据新鲜度・访问模式（间歇性还是持续性），针对每种缓存数据分别判断。详细判断要点参见 `java-im-cache-usage` 技能中 `reference/cache-api-reference.md` 的「`time-to-idle-seconds`/`time-to-live-seconds` 的取值方法」
- **`max-bytes-memory`/`max-elements-on-memory`，平台本身公开了估算公式**——「单条目平均数据大小 × 预计最大条目数」（多租户运行时再乘以租户数）。全局导航菜单缓存・IM-Authz 授权缓存的配置指南即为实例。具体公式与计算示例参见 `java-im-cache-usage` 技能中 `reference/cache-api-reference.md` 的「`max-bytes-memory`/`max-elements-on-memory` 的估算公式」，自建缓存也可应用同样的思路。在 JSSP 侧估算「单条目平均数据大小」的实践方法（例如通过 `JSON.stringify()` 的字符串长度进行概算）参见 `assets/cache-basic-usage.md` 的「缓存大小的估算方法（实践）」
- **传给 `put()` 的值须限定为可序列化的对象。** 不得缓存函数、DB 连接对象、通过 `new Packages.***` 生成的 Java 对象等无法序列化的内容
- **务必对 `get()` 的返回值进行 `null` 检查。** 缓存未命中时返回的是 `null` 而非异常，因此须实现在结果为 `null` 时获取源数据并调用 `put()` 的回退处理
- **数据更新时须通过 `remove()` 删除对应的缓存条目。** 若更新处理时忘记删除缓存，旧数据会一直被引用直到 TTL 到期
- **注意缓存键的粒度。** 粒度过粗的键（例如忽略搜索条件的固定键）会导致不同结果被混淆，粒度过细的键（例如包含时间戳的唯一键）会使缓存命中率实质上降为零
- **与 Java（JavaEE 开发模型）的 `CacheManager`/`Cache` API 共享配置文件与缓存命名空间。** 不要在 JSSP 侧与 Java 侧将同一缓存名挪作不同用途
- **值的双向互用仅在 Java → JSSP 方向可行。** 无论值的类型如何，SSJS 版 `Cache#put()` 都会以 Rhino 的序列化形式（`ScriptBinaryObject`）包装后存入 Java 侧的 `Cache<K, V>`。Java 侧没有 Rhino 执行作用域，无法还原该值，因此以固定类型从 Java 侧的 `Cache<K, V>` 读取 JSSP 侧 `put()` 存入的值会抛出 `ClassCastException`（以 `Cache<K, Object>` 接收虽可避免异常，但取得的只是无法使用的 `ScriptBinaryObject`）。反之，Java 侧 `put()` 存入的普通值（如 `String`）可以从 JSSP 侧的 `Cache#get()` 正常读取。**若需要与 Java 侧共享值，应设计为仅由 Java 侧 `put()`、JSSP 侧读取**的单向流程（详见 `java-im-cache-usage` 技能中的 `reference/cache-api-reference.md`）

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **JSSP（脚本开发模型）中的缓存实现** | **本技能** |
| Java（JavaEE 开发模型）中的缓存实现（`CacheManager`/`Cache`） | `java-im-cache-usage` |
| DB 访问（获取缓存源数据） | `jssp-page-generator`（`jssp-2way-sql.instructions.md`） |
| 在批处理任务中使用缓存・清除缓存 | `jssp-im-job-generator`（+ 本技能） |
