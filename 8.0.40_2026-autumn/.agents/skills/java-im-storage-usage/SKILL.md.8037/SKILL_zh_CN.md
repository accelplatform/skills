---
name: java-im-storage-usage
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 专有文件操作 API（PublicStorage / SessionScopeStorage / SystemStorage）的技能集。提供文件读写、目录操作、临时文件管理、资源管理模式。当提及想在 Java 中保存文件、想在 Java 中使用 Storage API、在 JavaEE 开发模型中操作文件、想在 Java 中使用 PublicStorage、想用 SessionScopeStorage 处理临时文件时使用。若要在 JSSP（脚本开发模型）中实现同等处理，请使用 `jssp-page-generator` 的 `reference/api-storage.md`（SSJS 版 Storage API）。
---

# intra-mart Storage API（Java 版）使用支持技能

## 目的

本技能集用于使用 intra-mart Accel Platform 面向 **JavaEE 开发模型**提供的文件操作 API（`jp.co.intra_mart.foundation.service.client.file` 包下的 `PublicStorage` / `SessionScopeStorage` / `SystemStorage`），在 Java 代码中实现文件读写、目录操作、临时文件管理。

## 与 JSSP 版的区别（重要）

JSSP 版（SSJS 的 `PublicStorage` 等，定义于 `d.ts/platform/storage/*.d.ts`）与 Java 版虽然名称相同，但实际上是**不同包下的不同类**，API 形态也不同。若凭记忆或类推直接照搬 JSSP 版的回调模式，会导致错误，因此必须严格遵循本文档所述的类型与签名。

| 观点 | JSSP 版（SSJS） | Java 版 |
|------|-----------------|---------|
| 类的实体 | Rhino 上的全局类（定义于 `d.ts/platform/storage/*.d.ts`） | `jp.co.intra_mart.foundation.service.client.file.{PublicStorage, SessionScopeStorage, SystemStorage}` |
| 读写基本形式 | `openAsText(function(reader, error) {...})` 等**回调方式**（回调结束时自动关闭） | `open()` / `create()` / `append()` 返回原生的 `InputStream` / `OutputStream`，属于**普通的 Java I/O**。**调用方必须显式关闭**（使用 `try-with-resources`） |
| 简易读写 | `read()` / `createAsText()` 等 | 同样存在 `read()` / `write()` / `load()`（`byte[]`） / `save(byte[])`（类型为 Java 的字符串、字节数组） |
| 异常处理 | 通过回调参数中的 `error` 接收 | 全部 `throws IOException`。由调用方 `try-catch` 处理 |
| 用途 | 展示页面、函数容器（JSSP） | JavaEE 开发模型的 Servlet、EJB、批处理、工作流处理类等 Java 源码 |

**本技能仅处理 Java 源文件（`.java`）。** JSSP（`.js`）中的实现请使用 `jssp-page-generator`（`reference/api-storage.md`）。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必读** — 包名、类名、方法名、变量命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必读** — `final` 局部变量、`try-with-resources`、字符串字面量等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必读** — 类/方法 JavaDoc |
| `.agents/requirements/java-logging/AGENTS.md` | 🟡 实现日志时（`Logger.getLogger(XxxClass.class)`） |

`jssp-*` 规约不适用于本技能（不适用于 Java 文件）。

## 3 个类的使用区分

| 类 | FQCN | 用途 | 保存位置（默认根路径） | 生命周期 |
|--------|------|------|----------------------|----------------|
| `PublicStorage` | `jp.co.intra_mart.foundation.service.client.file.PublicStorage` | 共享文件、上传文件、附件等持久化数据 | `storage/public` | 持久（直到显式删除为止） |
| `SessionScopeStorage` | `jp.co.intra_mart.foundation.service.client.file.SessionScopeStorage` | 处理中的临时文件（上传临时保存、加工中的数据等） | 按会话 ID 划分的临时区域 | 由会话基础设施侧管理。**使用后必须显式删除**（实际平台代码中也有相同的运用注意事项） |
| `SystemStorage` | `jp.co.intra_mart.foundation.service.client.file.SystemStorage` | 系统内部资源、平台/应用内部处理用数据 | `storage/system` | 持久 |

3 个类均实现 `Storage<T>` 接口（`jp.co.intra_mart.foundation.service.client.file.Storage`），实际 I/O 方法通用。差异仅在于构造函数所解析出的根路径。详情参见 `reference/storage-api-reference.md`。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 基本文件读写（文本、二进制、`try-with-resources`） | `assets/basic-file-operations.md` | `read`/`write`/`open`/`create`/`copy`/`move`/`remove` |
| 目录操作、列表获取 | `assets/directory-operations.md` | `list`/`files`/`directories`/`makeDirectories`/过滤 |
| 临时文件管理（`SessionScopeStorage`） | `assets/temp-file-lifecycle.md` | 上传临时保存、处理后确保删除的模式 |

### 参考资料

- `reference/storage-api-reference.md` — `Storage<T>` 接口的全部方法列表、签名、JavaDoc 摘要，以及 3 个类的构造函数差异（基于平台 API 的实际类定义，不可凭记忆编写）

## 使用时机

当用户提出以下请求时:
- 「创建一个用 Java 保存文件的处理」
- 「想在 JavaEE 开发模型中使用 PublicStorage」
- 「想用 Java 把上传文件放到临时区域」
- 「用 Java 写一个通过 SystemStorage 读取配置文件的处理」
- 「想从批处理中删除 SessionScopeStorage 的临时文件」

若未明确提及「用 Java」「在 JavaEE 开发模型中」，而只是单纯要求「创建保存文件的处理」，则**默认使用 JSSP 版（`jssp-page-generator` 的 `reference/api-storage.md`）**。仅当项目现有实现以 Java 为主时，才向用户确认 Java 版是否合适。

## 实现步骤

1. 听取用户需求（持久化还是临时、文本还是二进制、读取/写入/删除等操作种类、放置的目标包）
2. 根据用途决定使用 `PublicStorage` / `SessionScopeStorage` / `SystemStorage` 中的哪一个（参见上表。**若用户有指定，则优先按其指定**）
3. 参考对应的 `assets/` 模板进行实现（方法签名必须参考 `reference/storage-api-reference.md`，不可凭记忆或推测编写）
4. 确认是否符合 `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **防止资源泄漏是最优先事项。** 与 JSSP 版不同，Java 版不存在通过回调自动关闭的机制。通过 `open()` / `create()` / `append()` 获取的流必须使用 `try-with-resources` 关闭。`read()` / `write()` / `load()` / `save()` 是内部已关闭流的简易方法，少量数据优先使用这些方法
- **大容量文件使用 `open()`/`create()` 的流式处理。** `read()`/`load()` 会将文件整体读入内存，大容量文件应避免使用
- **路径始终为相对路径。** 各构造函数的 `path` 是相对于根路径（如 `storage/public`）的相对路径，不能指定绝对路径
- **路径分隔符始终固定为 `/`。** 不使用依赖 OS 的 `File.separator`。路径拼接原则上交给构造函数（`new PublicStorage(parent, child)` 等）处理。详情参见 `reference/storage-api-reference.md` 中的「关于路径分隔符的注意事项」
- **防范路径穿越攻击。** 不要将用户输入直接用作文件名、路径。对包含 `..` 或 `/`、`\` 的输入进行清洗或拒绝（若项目另有 Java 专用安全规约则参考之；若没有，则将 `.agents/requirements/jssp-security/AGENTS.md` 的思路套用到 Java 的异常机制中）
- **`SessionScopeStorage` 使用后必须显式删除。** 实际平台代码（`WorkflowAttachFileUtil`）中也明确写有运用注意事项：「临时区域中的文件在机器停止之前会一直保留，因此使用后必须删除」。应通过 `finally` 块或处理完成后显式调用 `remove()` 来确保删除
- 异常可以直接以 `throws IOException` 向外传播，也可以用业务异常包装。错误消息应按照 `.agents/requirements/java-javadoc/AGENTS.md` 的规约用日文进行说明性描述

## 生成后的确认

目前尚未整备类似 JSSP 版的专用验证脚本（相当于 `validate-jssp-code.js`）。请手动确认以下事项。

1. 使用了 `open()`/`create()`/`append()` 的地方是否通过 `try-with-resources` 关闭
2. `PublicStorage` / `SessionScopeStorage` / `SystemStorage` 的选择是否符合用途（持久/临时、公开/内部）
3. 使用 `SessionScopeStorage` 的临时文件，是否在处理完成后或发生异常时确实被删除
4. 在将用户输入用于路径的地方是否有防范路径穿越攻击的措施
5. 是否符合 `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`
6. `jssp-code-review` / `jssp-security-check` 仅适用于 JSSP，不适用于本技能的生成物。若项目中另有面向 Java 的代码评审、安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| 在 SSJS（JSSP）中实现文件操作 | `jssp-page-generator`（`reference/api-storage.md`） |
| **在 Java（JavaEE 开发模型）中实现文件操作** | **本技能** |
| IM-Workflow 的附件文件操作（平台标准功能侧） | 平台标准功能（`WorkflowAttachFileUtil` 等）。业务侧通常不会新建此类实现 |
