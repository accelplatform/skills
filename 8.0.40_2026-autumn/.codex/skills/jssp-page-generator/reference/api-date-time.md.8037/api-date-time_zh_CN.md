# DateTime API 参考手册

## 概述

DateTime 是一个处理时区感知日期时间的对象。
所有方法保证不可变性，原始实例不会被修改（返回新的副本）。

- 月份值从**0开始**（1月=0，12月=11）
- 年份范围为1～9999
- 省略时区时，自动从账户上下文中解析

## 构造函数

```javascript
// 当前日期时间（时区从账户设置自动解析）
let dt = new DateTime();

// 指定时区的当前日期时间
let dt = new DateTime(zone);

// 从Date对象生成
let dt = new DateTime(date, zone);

// 指定年月日时分秒（月从0开始）
let dt = new DateTime(year, monthOfYear, dayOfMonth, hourOfDay, minuteOfHour, secondOfMinute, zone);
```

## 常量

| 常量 | 值 | 常量 | 值 |
|------|-----|------|-----|
| JANUARY | 0 | JULY | 6 |
| FEBRUARY | 1 | AUGUST | 7 |
| MARCH | 2 | SEPTEMBER | 8 |
| APRIL | 3 | OCTOBER | 9 |
| MAY | 4 | NOVEMBER | 10 |
| JUNE | 5 | DECEMBER | 11 |

星期常量：`SUNDAY`, `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`

## 属性列表（只读）

| 属性 | 类型 | 说明 |
|-----------|------|------|
| year | Number | 年（1～9999） |
| monthOfYear | Number | 月（0～11） |
| dayOfMonth | Number | 日（1～31） |
| hourOfDay | Number | 时（0～23） |
| minuteOfHour | Number | 分（0～59） |
| secondOfMinute | Number | 秒（0～59） |
| dayOfWeek | Number | 星期值 |
| lastDayOfMonth | Number | 月末日（28～31） |
| firstDayOfWeek | Number | 周起始日 |
| timeZoneId | String | 时区ID |

## 方法列表

### 加法方法（返回新的DateTime）

| 方法 | 说明 |
|---------|------|
| plusYears(years) | 加年 |
| plusMonths(months) | 加月 |
| plusDays(days) | 加日 |
| plusHours(hours) | 加小时 |
| plusMinutes(minutes) | 加分钟 |
| plusSeconds(seconds) | 加秒 |

### 减法方法（返回新的DateTime）

| 方法 | 说明 |
|---------|------|
| minusYears(years) | 减年 |
| minusMonths(months) | 减月 |
| minusDays(days) | 减日 |
| minusHours(hours) | 减小时 |
| minusMinutes(minutes) | 减分钟 |
| minusSeconds(seconds) | 减秒 |

### 值变更方法（返回新的DateTime）

| 方法 | 说明 |
|---------|------|
| withYear(year) | 仅变更年 |
| withMonthOfYear(month) | 仅变更月 |
| withDayOfMonth(day) | 仅变更日 |
| withHourOfDay(hour) | 仅变更时 |
| withMinuteOfHour(minute) | 仅变更分 |
| withSecondOfMinute(second) | 仅变更秒 |
| withMilliOfSecond(milli) | 仅变更毫秒 |
| withTimeZone(zone) | 转换时区 |

### 转换与获取方法

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| getDate() | ResultObject | 返回含纪元毫秒的Date |
| getTime() | ResultObject | 返回纪元毫秒 |
| getTimeZone() | ResultObject | 返回时区 |
| getTimeZoneOffset() | ResultObject | 返回时区偏移量（毫秒） |
| clone() | ResultObject | 创建副本 |
| toString() | String | 转换为RFC 822格式字符串 |

※ 除 `toString()` 以外的方法返回 `ResultObject`，结果存储在 `.data` 中。

## 使用示例

### 获取当前日期时间

```javascript
let now = new DateTime();
let year = now.year;
let month = now.monthOfYear + 1; // 显示用加1
let day = now.dayOfMonth;
```

### 日期加减运算

```javascript
let now = new DateTime();

// 3个月后
let future = now.plusMonths(3).data;

// 7天前
let past = now.minusDays(7).data;

// 明年的同一天
let nextYear = now.plusYears(1).data;
```

### 生成特定日期时间

```javascript
// 2024年1月15日 14:30:00
let dt = new DateTime(2024, DateTime.JANUARY, 15, 14, 30, 0);
```

### 获取月末日

```javascript
let now = new DateTime();
let lastDay = now.lastDayOfMonth;
```