# TimeZone API 参考

## 概述

TimeZone 是处理时区信息的类。
提供与 Java 的 TimeZone 类相同的行为，还可以处理时区主数据中不存在的时区。

- 对于需要时区的 API，推荐使用从 `SystemTimeZone` 获取的时区信息
- 如果无法识别指定的ID，则返回 GMT 时区

## 获取实例

```javascript
let timeZone = TimeZone.getTimeZone('Asia/Tokyo').data;
```

## 属性列表（只读）

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | String | 时区ID |
| `rawOffset` | Number | 添加到 UTC 的毫秒时间量 |
| `useDaylightTime` | Boolean | 是否使用夏令时（true: 使用 / false: 不使用） |

## 方法列表

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `TimeZone.getTimeZone(id)` | ResultObject | 获取指定ID的时区（静态） |
| `getOffset(date)` | Number | 获取指定日期相对于 UTC 的偏移量（毫秒） |
| `inDaylightTime(date)` | Boolean | 判断指定日期是否处于夏令时期间 |

## TimeZone.getTimeZone(id)【静态】

获取指定ID的时区。
返回值的 `ResultObject.data` 中存储 TimeZone 对象。

```javascript
let timeZone = TimeZone.getTimeZone('Asia/Tokyo').data;
let id = timeZone.id;               // "Asia/Tokyo"
let offset = timeZone.rawOffset;     // 32400000（9小时 = 9 * 60 * 60 * 1000）
```

## getOffset(date)

获取指定日期相对于 UTC 的偏移量（毫秒）。
如果适用夏令时，则返回包含该部分的偏移量。

```javascript
let timeZone = TimeZone.getTimeZone('America/New_York').data;
let offset = timeZone.getOffset(new Date());
```

## inDaylightTime(date)

判断指定日期是否处于该时区的夏令时期间。

```javascript
let timeZone = TimeZone.getTimeZone('America/New_York').data;
let isDst = timeZone.inDaylightTime(new Date());
```
