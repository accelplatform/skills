# Logger API Reference

## Overview

Logger is an object for outputting log messages.
It provides 5 log levels (trace < debug < info < warn < error).

### How to Retrieve the Logger

```javascript
// Auto-naming based on source file path (recommended)
let logger = Logger.getLogger();

// Retrieve with specified name
let logger = Logger.getLogger('jp.co.example.sample');
```

When `getLogger()` is called without arguments, the logger name is automatically generated from the source file path (replacing path separators with dots, without extension).

## Method List

### Log Output Methods

Each level (`trace`, `debug`, `info`, `warn`, `error`) has the same signature.

| Method | Description |
|---------|------|
| `void level(msg)` | Output a message string |
| `void level(format, arg)` | Output a format string with one parameter embedded |
| `void level(format, arg1, arg2)` | Output a format string with two parameters embedded |
| `void level(format, args)` | Output a format string with an array of parameters embedded |

* `level` is one of `trace`, `debug`, `info`, `warn`, `error`

In the format string, `{}` serves as a placeholder.

### Log Level Check Methods

| Method | Return Value | Description |
|---------|--------|------|
| isTraceEnabled() | Boolean | Whether trace level is enabled |
| isDebugEnabled() | Boolean | Whether debug level is enabled |
| isInfoEnabled() | Boolean | Whether info level is enabled |
| isWarnEnabled() | Boolean | Whether warn level is enabled |
| isErrorEnabled() | Boolean | Whether error level is enabled |

## Usage Examples

### Basic Log Output

```javascript
let logger = Logger.getLogger();

logger.error('An error occurred');
logger.warn("Parameter: '{}'", 'value1');
logger.info("Processing started userId='{}', action='{}'", 'user01', 'regist');
logger.debug("Details: '{}'", JSON.stringify(data));
logger.trace('Trace information');
```

### Log Output with Array Parameters

```javascript
let logger = Logger.getLogger();
let args = ['param1', 123, new Date(), true];
logger.debug("Parameters: '{}' '{}' '{}' '{}'", args);
```

### Controlling Output with Log Level Check

```javascript
let logger = Logger.getLogger();

if (logger.isDebugEnabled()) {
  // Wrap log output involving heavy processing with a level check
  logger.debug("Detailed data: '{}'", JSON.stringify(largeObject));
}
```