---
paths:
  - "src/main/jssp/**/*.js"
---

# Logging Standards

> **Application Scope**: 🟡 **Contextual** — Applies only when implementing logging. Skip for simple screens with no log output.

## Log Level Usage

| Level | Usage | Examples |
|-------|-------|---------|
| ERROR | System errors, exceptions, states requiring recovery | DB connection errors, external API call failures |
| WARN | Warnings, unexpected but processing can continue | Detection of data inconsistencies, use of deprecated features |
| INFO | Start/end of important processing, business events | User registration completed, batch processing start/end |
| DEBUG | Debug information during development, detailed traces | Variable values, tracking processing flow |

## Implementing Log Output

```javascript
/**
 * Log output utility
 */
let LogUtil = (function() {
  let logger = Logger.getLogger();

  return {
    /**
     * Processing start log
     */
    logStart: function(processName, params) {
      logger.info('[START] {} params={}', processName, JSON.stringify(params || {}));
    },

    /**
     * Processing end log
     */
    logEnd: function(processName, result) {
      logger.info('[END] {} result={}', processName, (result ? 'success' : 'failure'));
    },

    /**
     * Error log
     */
    logError: function(processName, error, additionalInfo) {
      if (additionalInfo) {
        logger.error('[ERROR] {} message={} info={}', [processName, error.message, JSON.stringify(additionalInfo)]);
      } else {
        logger.error('[ERROR] {} message={}', processName, error.message);
      }

      if (error.stack) {
        logger.error('[STACK] {}', error.stack);
      }
    }
  };
})();

// Usage example
function registUser(userData) {
  LogUtil.logStart('registUser', {userId: userData.userId});

  try {
    let result = executeRegist(userData);
    LogUtil.logEnd('registUser', true);
    return result;

  } catch (e) {
    LogUtil.logError('registUser', e, {userId: userData.userId});
    LogUtil.logEnd('registUser', false);
    throw e;
  }
}
```

## Handling Confidential Information

### Items Prohibited from Output

- Passwords
- Authentication tokens
- Credit card numbers
- Personal information (use masking if necessary)

### Implementing Masking

```javascript
/**
 * Masking of confidential information
 */
let MaskUtil = {
  /**
   * Email address masking
   * example@domain.com → e***@d***.com
   */
  maskEmail: function(email) {
    if (!email) return '';
    let parts = email.split('@');
    if (parts.length !== 2) return '***';
    let local = parts[0].charAt(0) + '***';
    let domain = parts[1].charAt(0) + '***.' + parts[1].split('.').pop();
    return local + '@' + domain;
  },

  /**
   * Phone number masking
   * 090-1234-5678 → 090-****-5678
   */
  maskPhone: function(phone) {
    if (!phone) return '';
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.length < 4) return '***';
    return digits.substring(0, 3) + '-****-' + digits.substring(digits.length - 4);
  },

  /**
   * User ID masking (show only first and last characters)
   */
  maskUserId: function(userId) {
    if (!userId || userId.length < 2) return '***';
    return userId.charAt(0) + '***' + userId.charAt(userId.length - 1);
  }
};

// Usage example
let logger = Logger.getLogger();
logger.info('User information: email={}', MaskUtil.maskEmail(userData.email));
```

## Log Format

```javascript
// Recommended format
// [Level] [Process name] Message key1=value1, key2=value2
let logger = Logger.getLogger();
logger.info('[registUser] User registration processing started userId={}', userId);
logger.info('[registUser] User registration processing completed userId={}, result=success', userId);
logger.error('[registUser] User registration processing error userId={}, error={}', userId, e.message);
// When there are 3 or more placeholders, pass them as an array
logger.error('[registUser] User registration processing error code={}, userId={}, error={}', [errorCode, userId, e.message]);
```

## How to Pass Placeholder Arguments

The way to pass arguments for Logger placeholders `{}` differs depending on the number of placeholders.

| Number of Placeholders | How to Call | Example |
|:---:|---|---|
| 1 | `logger.info('message {}', value)` | Pass value directly as the 2nd argument |
| 2 | `logger.info('message {} {}', value1, value2)` | Pass values directly as the 2nd and 3rd arguments |
| **3 or more** | `logger.info('message {} {} {}', [value1, value2, value3])` | **Pass as an array in the 2nd argument** |

**When there are 3 or more placeholders, always bundle them into an array and pass as the 2nd argument.**
If passed as individual arguments, the 3rd and subsequent values will not be output.

```javascript
// NG: Passing 3 or more as individual arguments (3rd and beyond will not be output)
logger.info('[{}] Completed count={}, elapsed={}ms', processName, count, elapsed);

// OK: Bundle into an array and pass
logger.info('[{}] Completed count={}, elapsed={}ms', [processName, count, elapsed]);
```
