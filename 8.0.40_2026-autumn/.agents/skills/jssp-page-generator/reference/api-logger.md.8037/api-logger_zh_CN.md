# Logger API 参考手册

## 概述

Logger 是用于输出日志的对象。
提供5个日志级别（trace < debug < info < warn < error）。

### Logger的获取方法

```javascript
// 基于源文件路径自动命名（推荐）
let logger = Logger.getLogger();

// 指定名称获取
let logger = Logger.getLogger('jp.co.example.sample');
```

无参数调用 `getLogger()` 时，日志记录器名称会从源文件路径自动生成（将路径分隔符替换为点，不含扩展名）。

## 方法列表

### 日志输出方法

各级别（`trace`、`debug`、`info`、`warn`、`error`）具有相同的签名。

| 方法 | 说明 |
|---------|------|
| `void level(msg)` | 输出消息字符串 |
| `void level(format, arg)` | 在格式化字符串中嵌入1个参数后输出 |
| `void level(format, arg1, arg2)` | 在格式化字符串中嵌入2个参数后输出 |
| `void level(format, args)` | 在格式化字符串中嵌入数组参数后输出 |

※ `level` 为 `trace`、`debug`、`info`、`warn`、`error` 之一

格式化字符串中，`{}` 作为占位符。

### 日志级别判断方法

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| isTraceEnabled() | Boolean | trace级别是否启用 |
| isDebugEnabled() | Boolean | debug级别是否启用 |
| isInfoEnabled() | Boolean | info级别是否启用 |
| isWarnEnabled() | Boolean | warn级别是否启用 |
| isErrorEnabled() | Boolean | error级别是否启用 |

## 使用示例

### 基本日志输出

```javascript
let logger = Logger.getLogger();

logger.error('发生了错误');
logger.warn("参数：'{}'", 'value1');
logger.info("处理开始 userId='{}', action='{}'", 'user01', 'regist');
logger.debug("详细信息：'{}'", JSON.stringify(data));
logger.trace('追踪信息');
```

### 使用数组参数输出日志

```javascript
let logger = Logger.getLogger();
let args = ['param1', 123, new Date(), true];
logger.debug("参数：'{}' '{}' '{}' '{}'", args);
```

### 通过日志级别判断控制输出

```javascript
let logger = Logger.getLogger();

if (logger.isDebugEnabled()) {
  // 涉及繁重处理的日志输出应用级别判断包围
  logger.debug("详细数据：'{}'", JSON.stringify(largeObject));
}
```
