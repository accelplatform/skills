# MessageManager API 参考（Java 版）

基于 intra-mart Accel Platform 核心源码（`im_core_base` 模块）的实际类定义。不要凭记忆或推测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.security.message
└── MessageManager                … 公开 API。消息获取的入口点（final 类，单例）

jp.co.intra_mart.foundation.security.exception
├── AccessSecurityException        … MessageManager 抛出异常的基类（继承 FoundationException）
└── IllegalArgumentException       … 参数不正确时抛出的异常（继承 AccessSecurityException）
```

此处的 `IllegalArgumentException` 属于 `jp.co.intra_mart.foundation.security.exception` 包，与 `java.lang.IllegalArgumentException` 是不同的类。导入时请勿混淆。

## `MessageManager` 类

```java
package jp.co.intra_mart.foundation.security.message;

public final class MessageManager {

    /**
     * 获取消息管理器实例。
     * @return 消息管理器实例
     */
    public static synchronized MessageManager getInstance();

    // ---- 以用户区域设置获取消息的方法 ----

    public String getMessage(String key) throws AccessSecurityException;
    public String getMessage(String key, String arg) throws AccessSecurityException;
    public String getMessage(String key, String arg1, String arg2) throws AccessSecurityException;
    public String getMessage(String key, String arg1, String arg2, String arg3) throws AccessSecurityException;
    public String getMessage(String key, String[] args) throws AccessSecurityException;

    // ---- 以指定区域设置获取消息的方法 ----

    public String getMessage(Locale locale, String key) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String arg) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String arg1, String arg2) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String arg1, String arg2, String arg3) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String[] args) throws AccessSecurityException;

    // ---- 以租户区域设置获取消息的方法 ----

    /**
     * @since 8.0
     */
    public String getTenantMessage(String key, String... args) throws AccessSecurityException;

    // ---- 消息存在性判断 ----

    /**
     * @since 8.0
     */
    public boolean hasMessage(String key) throws AccessSecurityException;

    /**
     * @since 8.0
     */
    public boolean hasMessage(Locale locale, String key) throws AccessSecurityException;

    /**
     * @since 8.0
     */
    public boolean hasTenantMessage(String key) throws AccessSecurityException;
}
```

- `final` 类，不可继承。构造函数为 `private`
- 实例通过 `getInstance()`（惰性初始化的 `synchronized` 单例）获取。`new MessageManager()` 无法通过编译
- 唯一涉及的状态是类初始化 / `getInstance()` 时加载的消息提供者，调用方无需进行额外初始化

### 替换字符串（`arg` / `args`）的处理

占位符替换遵循 `java.text.MessageFormat#format(String, Object[])`。消息正文（属性文件中的值）须按照 `MessageFormat` 的模式格式，使用 `{0}`、`{1}` 等占位符书写。

- 若替换结果中需要输出 `'`（单引号），请在消息中写作 `''`
- 若替换结果中需要输出 `{`，请在消息中写作 `'{`
- 若 `args` 传入空数组，则不经过 `MessageFormat#format`，直接原样返回获取到的消息（即使消息中含有 `{0}` 等占位符也不会被转换）

### 异常

| 情况 | 异常 |
|------|------|
| `key` / `locale` / `args` 传入了 `null` | `AccessSecurityException`（实际为 `IllegalArgumentException` 实例） |
| 指定键对应的消息在任何区域设置下都不存在 | 不抛出异常，而是返回下述的未定义回退字符串 |

**即使消息键未定义，`getMessage` / `getTenantMessage` 也不会抛出异常。** 需要判断键是否存在时，请使用下述的 `hasMessage` / `hasTenantMessage`。

## 消息获取的解析顺序

### 以用户区域设置获取消息的方法（`getMessage(String, ...)`）

1. 以用户的区域设置（`AccountContext#getLocale()`）获取消息
2. 若不存在，则以租户的区域设置获取
3. 若不存在，则以系统默认区域设置获取
4. 若不存在，则从未指定区域设置的消息属性文件中获取
5. 若仍不存在，则以用户的区域设置返回表示「未定义」的字符串（对应键 `MessageCap.CAP_Z_IWP_MESSAGE_UNDEFINED` 的消息）
6. 若该「未定义」消息本身也不存在，则返回固定字符串 `"undefined"`

### 以指定区域设置获取消息的方法（`getMessage(Locale, String, ...)`）

1. 以指定的区域设置获取消息
2. 若不存在，则从未指定区域设置的消息属性文件中获取
3. 若仍不存在，则返回固定字符串 `"undefined"`（此路径不对「未定义」消息本身进行多语言解析）

### 以租户区域设置获取消息的方法（`getTenantMessage`）

1. 以租户的区域设置获取消息
2. 若不存在，则以系统默认区域设置获取
3. 若不存在，则从未指定区域设置的消息属性文件中获取
4. 若仍不存在，则以租户的区域设置返回表示「未定义」的字符串。若该消息也不存在，则返回 `"undefined"`

`getTenantMessage` 的 Javadoc 中注明：「getTenantMessage 是用于获取 intra-mart Accel Platform 内部日志、异常所使用的消息的方法，通常不在应用开发中使用。」应用开发中应使用 `getMessage` 系列方法（用户区域设置）或 `getMessage(Locale, ...)` 系列方法（显式指定区域设置）。

「未指定区域设置的消息属性文件」是指，例如在 `<CONTEXT_PATH>/WEB-INF/conf/message` 下存在 `foo_en.properties` / `foo_ja.properties` / `foo.properties` 三个文件时，其中没有区域设置后缀的 `foo.properties`。

## 消息属性文件的配置位置

根据 Javadoc，消息属性文件部署后位于 `<CONTEXT_PATH>/WEB-INF/conf/message` 下。在 intra-mart 的 Maven 项目（`im_module` 打包方式）的源代码树中，应放置于 `src/main/conf/message/` 下（**不是** `src/main/webapp/WEB-INF/conf/message/`；`src/main/conf/` 在构建时会按相同的相对结构原样复制到 `WEB-INF/conf/`）。对于使用标准 `maven-war-plugin` 的一般 Java Web 应用项目，这会对应于 `src/main/webapp/WEB-INF/conf/message/`，但 intra-mart 项目通常不使用该打包方式。

## 实际平台代码中的使用示例（供参考）

`jp.co.intra_mart.system.box.message.BoxCap`（`im_box-main` 模块）：

```java
return MessageManager.getInstance().getMessage(key, args);
// 指定区域设置版本
return MessageManager.getInstance().getMessage(locale, key, args);
```

`jp.co.intra_mart.system.ui.page.Caption`（`im_ui-main` 模块）中也使用了相同的 `MessageManager.getInstance().getMessage(...)` 调用模式。两者均是每次调用时通过 `getInstance()` 获取实例后再调用 `getMessage`，并未将实例缓存到字段中（由于 `getInstance()` 本身是轻量级的、惰性初始化的 `synchronized` 单例访问方法，因此每次调用的开销较小）。
