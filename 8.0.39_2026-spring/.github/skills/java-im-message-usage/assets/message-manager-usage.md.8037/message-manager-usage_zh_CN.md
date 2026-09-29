# MessageManager 实现模式（Java 版）

使用 `jp.co.intra_mart.foundation.security.message.MessageManager` 获取消息的实现模式集合。方法的准确签名、解析顺序请参照 `reference/message-manager-api-reference.md`。

## 消息键命名规约

本技能采用与本项目 JSSP 侧技能（`jssp-localize-support`）相同的键命名规约。由于消息属性文件的机制本身在 JSSP 与 Java 之间是共通的，统一键体系有助于在两种开发模型混合的项目中复用和核对消息。

| 类别 | 属性文件 | 用途 | 键格式 |
|---------|-----------------|------|---------|
| 标题（Caption） | `caption_<locale>.properties` | 标题、标签等简短的显示字符串 | `CAP.Z.APP.<产品名>.<功能名>.<标题名>` |
| 消息（Message） | `message_<locale>.properties` | 错误消息、确认消息、成功消息等 | `MSG.<错误类型>.APP.<产品名>.<功能名>.<消息名>` |
| 日志消息（Log message） | `log-message_<locale>.properties` | 日志输出用消息 | `<错误类型>.APP.<产品名>.<功能名>.<序号>` |

**错误类型：** `E`（错误）/ `W`（警告）/ `I`（信息）/ `C`（确认）

**键命名规则：**
- 分隔符仅使用点号（`.`）
- 键名中禁止使用下划线（`_`）、连字符（`-`）
- 键第二段 `APP`（供应商标识符）为默认值。若项目使用其他标识符，请遵循该标识符（参见 `jssp-localize-support` 中的「键前缀（供应商标识符）的确认」）

## 属性文件格式

非 ASCII 字符须以 `\uXXXX` 格式（native2ascii）转义。英文文件仅含 ASCII 字符，无需转义。换行符使用 LF。

```properties
# message_ja.properties
MSG.E.APP.SAMPLE.USER.SYSTEM.ERROR=予期しないエラーが発生しました。{0}
```

```properties
# message_en.properties
MSG.E.APP.SAMPLE.USER.SYSTEM.ERROR=An unexpected error occurred. {0}
```

## 模式 1：基本消息获取（用户区域设置）

用于标题、标签等应根据登录用户的区域设置区分显示的字符串。

```java
import jp.co.intra_mart.foundation.security.exception.AccessSecurityException;
import jp.co.intra_mart.foundation.security.message.MessageManager;

public class UserService {

    public String getScreenTitle() throws AccessSecurityException {
        final MessageManager messageManager = MessageManager.getInstance();
        return messageManager.getMessage("CAP.Z.APP.SAMPLE.USER.LIST.TITLE");
    }
}
```

## 模式 2：占位符替换

```properties
# message_ja.properties
MSG.E.APP.SAMPLE.USER.NOT.FOUND=ユーザコード {0} は存在しません。
```

```java
final MessageManager messageManager = MessageManager.getInstance();
final String message = messageManager.getMessage("MSG.E.APP.SAMPLE.USER.NOT.FOUND", userCode);
```

当参数为 2 个或 3 个时，使用 `getMessage(key, arg1, arg2)` / `getMessage(key, arg1, arg2, arg3)`。参数为 4 个以上时，使用 `getMessage(key, String[])`。

## 模式 3：显式指定区域设置获取

用于日志输出等不希望依赖登录用户区域设置的场景。

```java
import java.util.Locale;

final MessageManager messageManager = MessageManager.getInstance();
final String message = messageManager.getMessage(Locale.JAPANESE, "MSG.E.APP.SAMPLE.USER.SYSTEM.ERROR", cause.getMessage());
```

## 模式 4：异常处理时的消息获取与包装为业务异常

`getMessage` 本身除「参数为 `null`」外不会抛出异常（未定义的键会回退为 `"undefined"` 字符串）。因此业务逻辑中基本无需针对消息获取失败进行分支处理。`AccessSecurityException` 表示调用方的编程错误（`null` 参数），通常不是应捕获并恢复的对象，应直接向上层传播，或作为原因不明的内部错误处理。

```java
import jp.co.intra_mart.foundation.security.exception.AccessSecurityException;
import jp.co.intra_mart.foundation.security.message.MessageManager;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(final String userCode) {
        super(buildMessage(userCode));
    }

    private static String buildMessage(final String userCode) {
        try {
            return MessageManager.getInstance().getMessage("MSG.E.APP.SAMPLE.USER.NOT.FOUND", userCode);
        } catch (final AccessSecurityException e) {
            // 通常只有在 userCode 为 null 等调用方实现错误的情况下才会到达此处
            throw new IllegalStateException("Failed to build exception message.", e);
        }
    }
}
```

## 模式 5：消息存在性判断

用于需要以键是否存在本身作为业务逻辑分支条件的场景（例如：仅在定义了可选项标签时才显示该标签）。

```java
final MessageManager messageManager = MessageManager.getInstance();
if (messageManager.hasMessage("CAP.Z.APP.SAMPLE.USER.OPTIONAL.LABEL")) {
    final String label = messageManager.getMessage("CAP.Z.APP.SAMPLE.USER.OPTIONAL.LABEL");
    // 使用该标签的处理
}
```

## 注意事项

- `MessageManager` 是单例，无需缓存到字段中，在需要的地方直接调用 `MessageManager.getInstance()` 即可（`getInstance()` 是轻量级的 `synchronized` 方法）
- 导入时注意不要将 `jp.co.intra_mart.foundation.security.exception.IllegalArgumentException` 与 `java.lang.IllegalArgumentException` 混淆。若 IDE 自动 import 补全时误导入了 `java.lang` 版本，会在 `AccessSecurityException` 的 catch 语句处产生编译错误
- `getTenantMessage` 用于获取平台内部的日志、异常消息，通常不在应用开发中使用。应用侧应使用 `getMessage`（用户区域设置）或 `getMessage(Locale, ...)`（显式指定区域设置）
- 当消息正文（属性文件中的值）包含 `{0}` 等占位符时，须将 `'`（单引号）转义为 `''`，将 `{` 转义为 `'{`，否则会导致 `MessageFormat` 解析出现偏差
- 表现层（JSP 等）中消息的显示方式不在本技能的范围内，请遵循页面实现的相关规约
