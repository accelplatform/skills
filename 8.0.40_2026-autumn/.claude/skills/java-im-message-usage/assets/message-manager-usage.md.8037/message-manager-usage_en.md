# MessageManager Implementation Patterns (Java)

A collection of implementation patterns for retrieving messages using `jp.co.intra_mart.foundation.security.message.MessageManager`. Refer to `reference/message-manager-api-reference.md` for the exact method signatures and resolution order.

## Message Key Naming Convention

This skill adopts the same key naming convention as this project's JSSP-side skill (`jssp-localize-support`). Since the message properties file mechanism itself is shared between JSSP and Java, aligning the key scheme makes it easier to reuse and cross-check messages in projects where both models coexist.

| Category | Properties file | Purpose | Key format |
|----------|-----------------|---------|------------|
| Caption | `caption_<locale>.properties` | Short display strings such as titles and labels | `CAP.Z.APP.<product name>.<feature name>.<caption name>` |
| Message | `message_<locale>.properties` | Error, confirmation, success messages, etc. | `MSG.<error type>.APP.<product name>.<feature name>.<message name>` |
| Log message | `log-message_<locale>.properties` | Messages for log output | `<error type>.APP.<product name>.<feature name>.<sequence number>` |

**Error types:** `E` (error) / `W` (warning) / `I` (information) / `C` (confirmation)

**Key naming rules:**
- Use only the dot (`.`) as the separator
- Do not use underscores (`_`) or hyphens (`-`) in key names
- The second segment `APP` (vendor identifier) is a default value. If the project uses a different identifier, follow that instead (see "Confirming the Key Prefix (Vendor Identifier)" in `jssp-localize-support`)

## Properties File Format

Escape non-ASCII characters using `\uXXXX` format (native2ascii). English files consist only of ASCII, so no escaping is needed. Use LF line endings.

```properties
# message_ja.properties
MSG.E.APP.SAMPLE.USER.SYSTEM.ERROR=予期しないエラーが発生しました。{0}
```

```properties
# message_en.properties
MSG.E.APP.SAMPLE.USER.SYSTEM.ERROR=An unexpected error occurred. {0}
```

## Pattern 1: Basic Message Retrieval (User Locale)

Use this for titles, labels, and other strings that should vary according to the logged-in user's locale.

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

## Pattern 2: Placeholder Substitution

```properties
# message_ja.properties
MSG.E.APP.SAMPLE.USER.NOT.FOUND=ユーザコード {0} は存在しません。
```

```java
final MessageManager messageManager = MessageManager.getInstance();
final String message = messageManager.getMessage("MSG.E.APP.SAMPLE.USER.NOT.FOUND", userCode);
```

For 2 or 3 arguments, use `getMessage(key, arg1, arg2)` / `getMessage(key, arg1, arg2, arg3)`. For 4 or more arguments, use `getMessage(key, String[])`.

## Pattern 3: Retrieval with an Explicit Locale

Use this when the message should not depend on the logged-in user's locale, such as for log output.

```java
import java.util.Locale;

final MessageManager messageManager = MessageManager.getInstance();
final String message = messageManager.getMessage(Locale.JAPANESE, "MSG.E.APP.SAMPLE.USER.SYSTEM.ERROR", cause.getMessage());
```

## Pattern 4: Retrieving a Message on Exception and Wrapping It in a Business Exception

`getMessage` itself only throws an exception when an argument is `null`; otherwise it never fails (an undefined key falls back to the `"undefined"` string). Therefore, business logic generally does not need to branch on message-retrieval failure. `AccessSecurityException` indicates a caller-side programming mistake (a `null` argument), and is not normally something to catch and recover from — propagate it upward, or treat it as an unexpected internal error.

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
            // Normally unreachable except through a caller-side implementation mistake, e.g. a null userCode
            throw new IllegalStateException("Failed to build exception message.", e);
        }
    }
}
```

## Pattern 5: Checking Whether a Message Exists

Use this when the presence of a key itself should drive a business logic branch (e.g., displaying an optional item's label only if it is defined).

```java
final MessageManager messageManager = MessageManager.getInstance();
if (messageManager.hasMessage("CAP.Z.APP.SAMPLE.USER.OPTIONAL.LABEL")) {
    final String label = messageManager.getMessage("CAP.Z.APP.SAMPLE.USER.OPTIONAL.LABEL");
    // Process using the label
}
```

## Notes

- `MessageManager` is a singleton; there is no need to cache it in a field — simply call `MessageManager.getInstance()` wherever it's needed (`getInstance()` is a lightweight `synchronized` method)
- Be careful not to confuse `jp.co.intra_mart.foundation.security.exception.IllegalArgumentException` with `java.lang.IllegalArgumentException` on import. If the IDE's auto-import completion mistakenly imports the `java.lang` version, a compile error will occur at the `AccessSecurityException` catch clause
- `getTenantMessage` is intended for platform-internal log/exception message retrieval and is not normally used in application development. Use `getMessage` (user locale) or `getMessage(Locale, ...)` (explicit locale) on the application side instead
- When the message body (the value in the properties file) contains placeholders such as `{0}`, escape `'` (single quote) as `''` and `{` as `'{`, or the `MessageFormat` parsing will be thrown off
- How messages are displayed in the presentation layer (JSP, etc.) is out of scope for this skill. Follow the conventions for page implementation instead
