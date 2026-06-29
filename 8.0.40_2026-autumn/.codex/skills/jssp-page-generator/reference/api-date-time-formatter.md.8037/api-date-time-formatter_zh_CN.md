# DateTimeFormatter API 参考手册

## 概述

DateTimeFormatter 是用于格式化和解析日期及时间信息的静态对象。
支持与Java SimpleDateFormat兼容的模式记法。

时区按以下优先顺序应用：

1. DateTime对象中包含的时区
2. 方法参数中指定的时区
3. 账户上下文的时区

## 常量

| 常量 | 值 | 说明 |
|------|-----|------|
| `STANDARD_DATE_FORMAT_PATTERN` | `"yyyy-MM-dd"` | 系统内部日期格式模式 |
| `STANDARD_DATE_TIME_FORMAT_PATTERN` | `"yyyy-MM-dd HH:mm:ss"` | 系统内部日期时间格式模式 |

## 方法列表

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `format(pattern, date, [locale])` | String | 将Date格式化为字符串 |
| `format(pattern, date, zone, [locale])` | String | 指定时区将Date格式化为字符串 |
| `format(pattern, dateTime, [locale])` | String | 将DateTime格式化为字符串 |
| `parseToDateTime(pattern, text, [locale])` | DateTime | 解析字符串并生成DateTime |
| `parseToDateTime(pattern, text, zone, [locale])` | DateTime | 指定时区将字符串转换为DateTime |
| `parseToDate(pattern, text, [locale])` | Date | 解析字符串并生成Date |
| `parseToDate(pattern, text, zone, [locale])` | Date | 指定时区将字符串转换为Date |

## format

将Date或DateTime按照指定模式格式化为字符串。

```javascript
// 格式化Date
let str = DateTimeFormatter.format('yyyy/MM/dd', new Date());

// 格式化DateTime
let dt = new DateTime();
let str = DateTimeFormatter.format('yyyy-MM-dd HH:mm:ss', dt);

// 指定时区
let zone = TimeZone.getTimeZone('America/New_York').data;
let str = DateTimeFormatter.format('yyyy/MM/dd HH:mm:ss', new Date(), zone);

// 指定语言环境
let str = DateTimeFormatter.format('yyyy年MM月dd日(E)', new Date(), 'ja');
```

### 参数

| 参数 | 类型 | 说明 |
|-----------|------|------|
| `pattern` | String | 日期时间格式模式 |
| `date` / `dateTime` | Date / DateTime | 格式化对象 |
| `zone` | TimeZone | 时区（可省略） |
| `locale` | String | 语言环境（可省略） |

## parseToDateTime

解析字符串并生成DateTime对象。

```javascript
// 从字符串生成DateTime
let dt = DateTimeFormatter.parseToDateTime('yyyy/MM/dd', '2024/01/15');

// 指定时区
let zone = TimeZone.getTimeZone('Asia/Tokyo').data;
let dt = DateTimeFormatter.parseToDateTime('yyyy-MM-dd HH:mm:ss', '2024-01-15 14:30:00', zone);
```

### 参数

| 参数 | 类型 | 说明 |
|-----------|------|------|
| `pattern` | String | 日期时间格式模式 |
| `text` | String | 解析对象的字符串 |
| `zone` | TimeZone | 时区（可省略） |
| `locale` | String | 语言环境（可省略） |

## parseToDate

解析字符串并生成Date对象。

```javascript
// 从字符串生成Date
let date = DateTimeFormatter.parseToDate('yyyy/MM/dd', '2024/01/15');

// 指定时区
let zone = TimeZone.getTimeZone('Asia/Tokyo').data;
let date = DateTimeFormatter.parseToDate('yyyy-MM-dd HH:mm:ss', '2024-01-15 14:30:00', zone);
```

### 参数

| 参数 | 类型 | 说明 |
|-----------|------|------|
| `pattern` | String | 日期时间格式模式 |
| `text` | String | 解析对象的字符串 |
| `zone` | TimeZone | 时区（可省略） |
| `locale` | String | 语言环境（可省略） |

## 格式模式字符

| 字符 | 说明 | 示例 |
|------|------|-----|
| `y` | 年 | `yyyy` → 2024 |
| `M` | 月 | `MM` → 01 |
| `d` | 日 | `dd` → 15 |
| `H` | 时（0-23） | `HH` → 14 |
| `h` | 时（1-12） | `hh` → 02 |
| `m` | 分 | `mm` → 30 |
| `s` | 秒 | `ss` → 00 |
| `S` | 毫秒 | `SSS` → 123 |
| `a` | 上午/下午 | `a` → AM |
| `E` | 星期 | `E` → 一 |
| `'` | 文字转义 | `'T'` → T |
