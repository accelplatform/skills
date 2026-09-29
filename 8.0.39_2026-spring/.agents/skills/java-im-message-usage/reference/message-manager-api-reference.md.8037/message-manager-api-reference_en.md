# MessageManager API Reference (Java)

Based on the actual class definitions in the intra-mart Accel Platform core source (`im_core_base` module). Do not supplement methods from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.foundation.security.message
└── MessageManager                … Public API. Entry point for message retrieval (final class, singleton)

jp.co.intra_mart.foundation.security.exception
├── AccessSecurityException        … Base exception thrown by MessageManager (extends FoundationException)
└── IllegalArgumentException       … Thrown on invalid arguments (extends AccessSecurityException)
```

`IllegalArgumentException` here belongs to the `jp.co.intra_mart.foundation.security.exception` package and is a different class from `java.lang.IllegalArgumentException`. Do not mix them up when importing.

## The `MessageManager` Class

```java
package jp.co.intra_mart.foundation.security.message;

public final class MessageManager {

    /**
     * Retrieves the MessageManager instance.
     * @return the MessageManager instance
     */
    public static synchronized MessageManager getInstance();

    // ---- Methods that retrieve messages in the user's locale ----

    public String getMessage(String key) throws AccessSecurityException;
    public String getMessage(String key, String arg) throws AccessSecurityException;
    public String getMessage(String key, String arg1, String arg2) throws AccessSecurityException;
    public String getMessage(String key, String arg1, String arg2, String arg3) throws AccessSecurityException;
    public String getMessage(String key, String[] args) throws AccessSecurityException;

    // ---- Methods that retrieve messages in a specified locale ----

    public String getMessage(Locale locale, String key) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String arg) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String arg1, String arg2) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String arg1, String arg2, String arg3) throws AccessSecurityException;
    public String getMessage(Locale locale, String key, String[] args) throws AccessSecurityException;

    // ---- Method that retrieves messages in the tenant's locale ----

    /**
     * @since 8.0
     */
    public String getTenantMessage(String key, String... args) throws AccessSecurityException;

    // ---- Message existence checks ----

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

- A `final` class; cannot be extended. The constructor is `private`
- Obtain an instance via `getInstance()` (a lazily-initialized, `synchronized` singleton). `new MessageManager()` will not compile
- The only state involved is the message provider loaded during class initialization / `getInstance()`; no additional initialization is required on the caller side

### Handling Substitution Strings (`arg` / `args`)

Placeholders are substituted following `java.text.MessageFormat#format(String, Object[])`. Write the message body (the value in the properties file) as a `MessageFormat` pattern using `{0}`, `{1}`, ... placeholders.

- To output a literal `'` (single quote) in the substituted result, write `''` in the message
- To output a literal `{` in the substituted result, write `'{` in the message
- If an empty array is passed for `args`, the retrieved message is returned as-is without going through `MessageFormat#format` (placeholders such as `{0}` are not converted even if present)

### Exceptions

| Situation | Exception |
|-----------|-----------|
| `null` was passed for `key` / `locale` / `args` | `AccessSecurityException` (actually an `IllegalArgumentException` instance) |
| The message for the specified key does not exist in any locale | No exception is thrown. The undefined-message fallback string described below is returned instead |

**`getMessage` / `getTenantMessage` do not throw an exception even when the message key is undefined.** Use `hasMessage` / `hasTenantMessage` described below to check for existence.

## Message Retrieval Resolution Order

### Methods that retrieve messages in the user's locale (`getMessage(String, ...)`)

1. Retrieve the message in the user's locale (`AccountContext#getLocale()`)
2. If not found, retrieve it in the tenant's locale
3. If not found, retrieve it in the system's default locale
4. If not found, retrieve it from the message properties file with no locale specified
5. If still not found, return the string representing "undefined" in the user's locale (the message corresponding to the key `MessageCap.CAP_Z_IWP_MESSAGE_UNDEFINED`)
6. If even that "undefined" message does not exist, return the fixed string `"undefined"`

### Methods that retrieve messages in a specified locale (`getMessage(Locale, String, ...)`)

1. Retrieve the message in the specified locale
2. If not found, retrieve it from the message properties file with no locale specified
3. If still not found, return the fixed string `"undefined"` (this path does not resolve the "undefined" message itself across locales)

### Method that retrieves messages in the tenant's locale (`getTenantMessage`)

1. Retrieve the message in the tenant's locale
2. If not found, retrieve it in the system's default locale
3. If not found, retrieve it from the message properties file with no locale specified
4. If still not found, return the string representing "undefined" in the tenant's locale. If that does not exist either, return `"undefined"`

The Javadoc for `getTenantMessage` notes: "getTenantMessage is a method for retrieving messages used in intra-mart Accel Platform's internal logs and exceptions, and is not normally used in application development." In application development, use the `getMessage` family (user locale) or `getMessage(Locale, ...)` family (explicit locale) instead.

"The message properties file with no locale specified" refers to, for example, `foo.properties` (the file without a locale suffix) among the three files `foo_en.properties` / `foo_ja.properties` / `foo.properties` located under `<CONTEXT_PATH>/WEB-INF/conf/message`.

## Message Properties File Placement

Per the Javadoc, message properties files end up deployed under `<CONTEXT_PATH>/WEB-INF/conf/message`. In an intra-mart Maven project's source tree (`im_module` packaging), place them under `src/main/conf/message/` — **not** `src/main/webapp/WEB-INF/conf/message/` (`src/main/conf/` is copied to `WEB-INF/conf/` as-is at build time, preserving the same relative structure). For a generic Java web application project using the standard `maven-war-plugin`, this would correspond to `src/main/webapp/WEB-INF/conf/message/`, but intra-mart projects normally do not use that packaging.

## Usage Examples in Actual Platform Code (for reference)

`jp.co.intra_mart.system.box.message.BoxCap` (`im_box-main` module):

```java
return MessageManager.getInstance().getMessage(key, args);
// Locale-specified variant
return MessageManager.getInstance().getMessage(locale, key, args);
```

`jp.co.intra_mart.system.ui.page.Caption` (`im_ui-main` module) uses the same `MessageManager.getInstance().getMessage(...)` call pattern. In both cases, `getMessage` is called on an instance obtained via `getInstance()` each time, rather than caching the instance in a field (since `getInstance()` is itself a lightweight, `synchronized`, lazily-initialized singleton accessor, the per-call overhead is small).
