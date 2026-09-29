---
applyTo: "**/*.java"
description: "JavaDoc 記述規約（public クラス・メソッドへの記述必須範囲）"
---

# JavaDoc Conventions

> **Application Scope**: 🟢 **Always** — Applies whenever generating/editing any Java class.

## Scope

- **Required**: Write a class JavaDoc for every public class/interface
- **Required**: Write a method JavaDoc for every public method
- **Recommended**: Write method JavaDoc for protected methods as well
- **Out of scope**: JavaDoc is not required for private methods or test classes (though a comment stating the purpose is recommended for test methods)
- **Out of scope**: JavaDoc may be omitted for getter/setter-only methods whose meaning is self-evident

## Class/Interface JavaDoc

Describe the feature overview, author, version, etc.
`version` and `author` must conform to the project settings.
`@version` must always match the project's current version (`{version}`). It must not be set to any value other than the current version.
When modifying an existing class, if the `@version` value differs from the current project version and no `@since` tag exists:

1. Set `@since` to the previous `@version` value (recording the version at the class's initial creation)
2. Update `@version` to the current project version (`{version}`)

- `{author}`: The author name from the project settings
- `{version}`: The current project version
- `{initial_version}`: The version at which the class was first created (same value as `{version}` for newly created classes)

```java
/**
 * A job class that executes a RAG (Retrieval-Augmented Generation) processing pipeline.<br>
 * Reads documents, splits them, vectorizes them, and saves them to the store.
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
```

## Field Comments

Add comments that make the field's role clear.

## Method JavaDoc

Describe the arguments, return value, the possibility of returning null, and any exceptions thrown, in detail.

## Exception Messages and Log Messages

- **Exception messages**: Written in Japanese, descriptive, and include variables necessary for troubleshooting
- **Log messages**: Written in English, clearly indicating the context
- **Required**: Use `e.getMessage()`
- **Required**: Do not change the original logic

## Comments for Complex Processing

Add comments in Japanese that make the overview of any complex processing in the code clear.

## Explanation of External Parameters

If there is any loading of external parameters or system properties, describe it in the JavaDoc.
