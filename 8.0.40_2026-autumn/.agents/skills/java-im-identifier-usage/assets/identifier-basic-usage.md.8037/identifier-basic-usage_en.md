# Identifier API Basic Usage Patterns (Java Version)

For the signature and internal behavior of `Identifier`, see `reference/identifier-api-reference.md`. This document shows the typical call patterns.

## Pattern 1: Numbering a Distributed-Environment-Unique ID (`get()`, for Business Data)

Use this for numbering business data — order numbers, application numbers, table primary keys, etc. — that must not collide with an ID generated on another application server. Wrap `IOException` into a business exception and propagate it to the caller.

```java
package jp.co.example.foo.service;

import java.io.IOException;

import jp.co.intra_mart.foundation.service.client.information.Identifier;

/**
 * Provides order number numbering.
 */
public class OrderNumberGenerator {

    /**
     * Newly numbers an order number.<br>
     * Guarantees no collision even in a distributed environment (multiple application servers).
     *
     * @return the numbered order number
     * @throws OrderNumberGenerationException if an error occurs during numbering
     */
    public String generate() throws OrderNumberGenerationException {
        final Identifier identifier = new Identifier();
        try {
            return identifier.get();
        } catch (final IOException e) {
            throw new OrderNumberGenerationException("受注番号の採番に失敗しました。", e);
        }
    }
}
```

- In cases where it is acceptable to propagate `IOException` as-is via `throws` (e.g., the caller already handles `IOException`), wrapping into a business exception may be omitted. Prefer a dedicated Java error-handling convention instead, if the project later adds one
- It is fine to call `new Identifier()` every time the method is called (since it holds no state, the instantiation cost is negligible)

## Pattern 2: Numbering an Application-Server-Local Unique ID (`make()`, for Process-Local Temporary Identifiers)

Use this for identifiers that only need to be unique within a process, such as a log trace ID or a correlation ID within a request scope. It is a static method, so no instantiation is needed and there is no checked exception.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.service.client.information.Identifier;

/**
 * Issues a correlation ID for processing traces.
 */
public class TraceIdIssuer {

    /**
     * Issues a correlation ID.<br>
     * Guarantees uniqueness only within the application server. Does not guarantee uniqueness across a distributed environment.
     *
     * @return the correlation ID
     */
    public String issue() {
        return Identifier.make();
    }
}
```

## Pattern 3: Numbering Multiple IDs in a Loop

Because `get()` communicates with the Server Manager on every call, processing that numbers a large batch of IDs at once can suffer a performance impact. When the count is large, proactively raise the performance concern with the user and, if necessary, present an alternative numbering approach (e.g., a DB sequence) as a candidate.

```java
package jp.co.example.foo.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.foundation.service.client.information.Identifier;

public class BulkOrderNumberGenerator {

    public List<String> generate(final int count) throws OrderNumberGenerationException {
        final Identifier identifier = new Identifier();
        final List<String> numbers = new ArrayList<String>(count);
        try {
            for (int i = 0; i < count; i++) {
                numbers.add(identifier.get());
            }
        } catch (final IOException e) {
            throw new OrderNumberGenerationException("受注番号の一括採番に失敗しました。", e);
        }
        return numbers;
    }
}
```

## Anti-Patterns (Avoid These)

```java
// NG: used as a security token (unsuitable because the value is guessable)
String resetToken = Identifier.make(); // do not use for password reset tokens

// NG: swallowing IOException
try {
    id = new Identifier().get();
} catch (IOException e) {
    // do nothing <- NG. Swallowing a numbering failure produces inconsistent data downstream
}

// NG: using make() when a distributed environment is a requirement
String orderNo = Identifier.make(); // may collide if numbered simultaneously on multiple servers
```
