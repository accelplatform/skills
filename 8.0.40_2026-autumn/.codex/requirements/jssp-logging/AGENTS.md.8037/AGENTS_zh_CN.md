# 日志输出规约

> **适用范围**: 🟡 **上下文依赖** — 仅在实现日志时适用。无日志输出的简单画面无需阅读。

## 日志级别的使用区分

| 级别 | 用途 | 示例 |
|------|------|------|
| ERROR | 系统错误、异常、需要恢复的状态 | 数据库连接错误、外部 API 调用失败 |
| WARN | 警告，意外情况但处理可继续 | 检测到数据不一致、使用了已废弃的功能 |
| INFO | 重要处理的开始/结束、业务事件 | 用户注册完成、批处理开始/结束 |
| DEBUG | 开发时的调试信息、详细跟踪 | 变量值、处理流程跟踪 |

## 日志输出的实现

```javascript
/**
 * 日志输出工具
 */
let LogUtil = (function() {
  let logger = Logger.getLogger();

  return {
    /**
     * 处理开始日志
     */
    logStart: function(processName, params) {
      logger.info('[START] {} params={}', processName, JSON.stringify(params || {}));
    },

    /**
     * 处理结束日志
     */
    logEnd: function(processName, result) {
      logger.info('[END] {} result={}', processName, (result ? 'success' : 'failure'));
    },

    /**
     * 错误日志
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

// 使用示例
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

## 机密信息的处理

### 禁止输出的项目

- 密码
- 认证令牌
- 信用卡号
- 个人信息（必要时进行脱敏处理）

### 脱敏处理的实现

```javascript
/**
 * 机密信息的脱敏处理
 */
let MaskUtil = {
  /**
   * 邮箱地址脱敏
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
   * 电话号码脱敏
   * 090-1234-5678 → 090-****-5678
   */
  maskPhone: function(phone) {
    if (!phone) return '';
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.length < 4) return '***';
    return digits.substring(0, 3) + '-****-' + digits.substring(digits.length - 4);
  },

  /**
   * 用户 ID 脱敏（仅显示首尾字符）
   */
  maskUserId: function(userId) {
    if (!userId || userId.length < 2) return '***';
    return userId.charAt(0) + '***' + userId.charAt(userId.length - 1);
  }
};

// 使用示例
let logger = Logger.getLogger();
logger.info('用户信息：email={}', MaskUtil.maskEmail(userData.email));
```

## 日志格式

```javascript
// 推荐格式
// [级别] [处理名称] 消息 key1=value1, key2=value2
let logger = Logger.getLogger();
logger.info('[registUser] 用户注册处理开始 userId={}', userId);
logger.info('[registUser] 用户注册处理完成 userId={}, result=success', userId);
logger.error('[registUser] 用户注册处理错误 userId={}, error={}', userId, e.message);
// 3个以上占位符时，以数组形式传入
logger.error('[registUser] 用户注册处理错误 code={}, userId={}, error={}', [errorCode, userId, e.message]);
```

## 占位符参数的传递方式

Logger 占位符 `{}` 的传参方式根据占位符数量的不同而有所差异。

| 占位符数量 | 调用方式 | 示例 |
|:---:|---|---|
| 1 个 | `logger.info('message {}', value)` | 直接将值作为第 2 个参数传入 |
| 2 个 | `logger.info('message {} {}', value1, value2)` | 直接将值作为第 2、第 3 个参数传入 |
| **3 个以上** | `logger.info('message {} {} {}', [value1, value2, value3])` | **以数组形式作为第 2 个参数传入** |

**占位符为 3 个以上时，必须将所有值汇总为数组作为第 2 个参数传入。**
若以单独参数传入，第 3 个及之后的值将无法输出。

```javascript
// NG：3 个以上以单独参数传入（第 3 个及之后无法输出）
logger.info('[{}] 完成 count={}, elapsed={}ms', processName, count, elapsed);

// OK：汇总为数组传入
logger.info('[{}] 完成 count={}, elapsed={}ms', [processName, count, elapsed]);
```