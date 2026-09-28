# Logging Conventions (Java)

> **Application Scope**: 🟡 **Contextual** — Applies only when implementing logging. No need to read this for classes that do not output logs.

intra-mart Accel Platform provides a logging infrastructure based on SLF4J + Logback. Use `jp.co.intra_mart.common.platform.log.Logger` to output logs.

## Log Level Usage

| Level | Usage | Language |
|--------|------|----------|
| ERROR | System errors, unexpected exceptions, failures requiring administrator notification | English |
| WARN | Business rule violations, recoverable errors, use of deprecated features | English |
| INFO | Start/end of business operations, major state changes, service calls | English |
| DEBUG | Detailed execution flow, parameter values | English |
| TRACE | Even more detailed debug information | English |

## Logger Implementation

### Basic Pattern

```java
import jp.co.intra_mart.common.platform.log.Logger;

public class UserService {

  private static final Logger LOGGER = Logger.getLogger(UserService.class);

  public void execute() {
    LOGGER.info("Started processing");
  }
}
```

- **Required** Define a `private static final` Logger field per class
- **Required** Pass **the `.class` of the class itself** that outputs the log (e.g. `UserService.class` inside the `UserService` class) as the argument to `Logger.getLogger()`
  - Reason: This correctly records the class (package hierarchy) that produced the log, so level control via the logger name (per package) in `conf/log/{module_id}.xml` works as intended
- Directly specifying a logger name, e.g. `Logger.getLogger("my.custom.logger.name")`, is also allowed, but only for special cases such as wanting to group loggers by feature

### Log Output Patterns

```java
private static final Logger LOGGER = Logger.getLogger(UserService.class);

// Error log with context
LOGGER.error("Failed to process registration for user: " + userId, e);

// Business warning
LOGGER.warn("Business rule violation: category is not editable. categoryId=" + categoryId);

// Informational log for an operation
LOGGER.info("Started registUser processing for user: " + userId + ", tenant: " + tenantId);

// Debug log for troubleshooting
LOGGER.debug("Processing registUser with parameters: " + parameters);
```

## Handling Sensitive Information

### Items Prohibited from Being Logged

- Passwords
- Authentication tokens
- Credit card numbers
- Personal information (mask it if it must be logged)

- **Prohibited** Do not output sensitive information (passwords, tokens, personal data) to logs

## Log Level Decisions by Exception Type

| Exception Type | Log Level | Reason |
|---|---|---|
| ValidationException (input validation) | Do not log | A user input error, not a system failure |
| AuthorizationException (authorization error) | Do not log | Handled by the authorization framework |
| NotFoundException (no search results) | Do not log | A normal business flow |
| BusinessException (business rule violation) | WARN | A recoverable business logic issue |
| RepositoryException (data access error) | ERROR | An infrastructure failure requiring investigation |
| RuntimeException (unexpected error) | ERROR | A programming error requiring immediate investigation |

### Basic Policy

- **Required** Only log errors that require administrator notification
- **Prohibited** Do not log input validation exceptions
- **Prohibited** Do not log authorization check exceptions
- **Recommended** Separate the error information returned to the client from what is logged

### Correct Pattern

```java
@Path("/users")
public class UserEndpoint {

  private static final Logger LOGGER = Logger.getLogger(UserEndpoint.class);

  @POST
  public Response createUser(UserRequest request) {
    try {
      List<String> errors = request.validate();
      if (!errors.isEmpty()) {
        // Do not log input validation errors
        return Response.badRequest(errors);
      }

      User user = userService.createUser(request);
      return Response.ok(user);

    } catch (AuthorizationException e) {
      // Do not log authorization check errors
      return Response.forbidden();

    } catch (BusinessException e) {
      // Business exceptions may optionally be logged at WARN level
      LOGGER.warn("Business error occurred. code: " + e.getBusinessCode(), e);
      return Response.conflict(e.getMessage());

    } catch (Exception e) {
      // Only log unexpected errors at ERROR level
      LOGGER.error("Unexpected error during createUser processing", e);
      return Response.internalServerError();
    }
  }
}
```

## Log Patterns by Layer

### Service Layer

```java
private static final Logger LOGGER = Logger.getLogger(StandardCategoryService.class);

// Start/completion of business operations (INFO)
LOGGER.info("Started processing category: categoryId=" + categoryId + ", userCd=" + userCd);

// Business rule violation (WARN)
LOGGER.warn("Business rule violation: category is not editable. categoryId="
    + categoryId + ", status=" + category.getStatus());

// When wrapping an infrastructure failure (ERROR)
LOGGER.error("Failed to save category: categoryId=" + category.getCategoryId(), e);
throw new CategoryServiceException("カテゴリの保存に失敗しました", e);
```

- INFO: Start/completion of business operations (include the user code, tenant ID, and target ID)
- WARN: Business rule violations (recoverable errors)
- ERROR: Only when catching an infrastructure failure

### Repository Layer

```java
private static final Logger LOGGER = Logger.getLogger(StandardCategoryRepository.class);

try {
  // DB operation
} catch (SQLRuntimeException e) {
  LOGGER.error("Failed to find category: categoryId=" + categoryId, e);
  throw new RepositoryException("カテゴリの検索に失敗しました: categoryId=" + categoryId, e);
}
```

- ERROR only: infrastructure failures (DB connection errors, SQL execution errors, etc.)
- A `find` returning null is normal behavior — do not log it
- Use DEBUG level for debugging purposes

### Job Layer

```java
private static final Logger LOGGER = Logger.getLogger(CategoryBatchJob.class);

@Override
public JobResult execute() throws JobExecuteException {
  LOGGER.info("Started category batch job");

  int processedCount = 0;
  int errorCount = 0;

  for (Category category : categories) {
    try {
      processCategory(category);
      processedCount++;

      // Progress log (every 100 records)
      if (processedCount % 100 == 0) {
        LOGGER.info("Progress: processed=" + processedCount + ", errors=" + errorCount);
      }
    } catch (Exception e) {
      errorCount++;
      LOGGER.error("Failed to process category: categoryId=" + category.getCategoryId(), e);
    }
  }

  LOGGER.info("Completed category batch job: processed=" + processedCount + ", errors=" + errorCount);

  if (errorCount > 0) {
    return JobResult.warning("処理完了（エラーあり）: 処理=" + processedCount + ", エラー=" + errorCount);
  }
  return JobResult.success("処理完了: " + processedCount + "件");
}
```

- INFO: start/completion/progress (include the processed count)
- ERROR: failure of an individual record
- Output progress logs every N records (in units of 100 or 1000)

## Performance Considerations (Guarding DEBUG Logs)

```java
// NG: string concatenation always executes
LOGGER.debug("Processing with parameters: " + buildExpensiveString(params));

// OK: string concatenation executes only when DEBUG is enabled
if (LOGGER.isDebugEnabled()) {
  LOGGER.debug("Processing with parameters: " + buildExpensiveString(params));
}
```

**When is a guard needed?**
- When the log involves a method call or complex string concatenation
- When there is a possibility of large-volume output inside a loop
- A guard is unnecessary for a simple string concatenation such as `"msg: " + id`

## Log Configuration File

### Placement

```
conf/
  └── log/
    └── {module_id}.xml
```

### Module-Specific Configuration Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<im-logger>
    <!-- Application-wide: INFO -->
    <logger name="{packageName}" level="INFO" />

    <!-- Infrastructure layer: WARN (suppresses routine DB operation logs) -->
    <logger name="{packageName}.infrastructure" level="WARN" />

    <!-- Enable only during development -->
    <!-- <logger name="{packageName}" level="DEBUG" /> -->
</im-logger>
```

## Anti-Patterns

### Excessive Logging in a REST API

```java
// NG: outputs an ERROR log for every exception type
@POST
public Response createUser(UserRequest request) {
  try {
    // processing
  } catch (ValidationException e) {
    LOGGER.error("Validation error", e);  // Unnecessary
    return Response.badRequest();
  } catch (AuthorizationException e) {
    LOGGER.error("Authorization error", e);  // Unnecessary
    return Response.forbidden();
  } catch (Exception e) {
    LOGGER.error("Unexpected error occurred", e);  // This is the only one needed
    return Response.internalServerError();
  }
}
```

### Other Prohibited Practices

- **Prohibited** Do not output a large volume of logs inside a loop (thin out progress logs to every N records)
