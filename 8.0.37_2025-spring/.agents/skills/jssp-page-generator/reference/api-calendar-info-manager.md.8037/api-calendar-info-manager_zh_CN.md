# CalendarInfoManager API 参考手册

## 概述

CalendarInfoManager 是用于管理日历信息的类。
提供日历信息、日期信息集、日期信息、星期信息的管理以及特定日期的日期信息检索功能。

- 可以根据优先级从多个日期信息中解析对应日的信息
- insert / update 方法可以指定多个语言环境的国际化项目
- delete 方法会删除所有国际化项目

## 构造函数

```javascript
let manager = new CalendarInfoManager();
```

## 方法列表

### 日历管理

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `getCalendarInfo(calendarId)` | ResultObject | 获取日历 |
| `getCalendarInfos()` | ResultObject | 获取所有日历 |
| `insertCalendarInfo(info)` | ResultObject | 创建日历 |
| `updateCalendarInfo(info)` | ResultObject | 更新日历 |
| `deleteCalendarInfo(info)` | ResultObject | 删除日历 |
| `hasCalendarInfo(calendarId)` | ResultObject | 确认日历是否存在 |

### 日期信息集管理

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `getDayInfoSet(dayInfoSetId)` | ResultObject | 获取日期信息集 |
| `getDayInfoSets()` | ResultObject | 获取所有日期信息集 |
| `getDayInfoSetsByCalendarId(calendarId)` | ResultObject | 获取日历中已注册的日期信息集 |
| `insertDayInfoSet(info)` | ResultObject | 创建日期信息集 |
| `updateDayInfoSet(info)` | ResultObject | 更新日期信息集 |
| `deleteDayInfoSet(info)` | ResultObject | 删除日期信息集 |
| `hasDayInfoSet(dayInfoSetId)` | ResultObject | 确认日期信息集是否存在 |
| `includeDayInfoSet(calendarId, dayInfoSetIds)` | ResultObject | 将日期信息集添加到日历 |
| `excludeDayInfoSet(calendarId, dayInfoSetIds)` | ResultObject | 从日历中移除日期信息集 |

### 日期信息管理

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `getDayInfo(dayInfoSetId, dayInfoId)` | ResultObject | 获取日期信息 |
| `getDayInfosByCalendarId(calendarId)` | ResultObject | 获取日历的所有日期信息 |
| `getDayInfosByDayInfoSetId(dayInfoSetId)` | ResultObject | 获取集合的所有日期信息 |
| `insertDayInfo(info)` | ResultObject | 创建日期信息 |
| `updateDayInfo(info)` | ResultObject | 更新日期信息 |
| `deleteDayInfo(info)` | ResultObject | 删除日期信息 |
| `hasDayInfo(calendarId, date, dayInfo)` | ResultObject | 确认日期信息是否存在 |

### 星期信息管理

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `getCalendarWeekDayInfos(calendarId)` | ResultObject | 获取星期信息（键为星期编号） |
| `insertCalendarWeekDayInfo(info)` | ResultObject | 创建星期信息 |
| `updateCalendarWeekDayInfo(info)` | ResultObject | 更新星期信息 |
| `deleteCalendarWeekDayInfo(info)` | ResultObject | 删除星期信息 |

### 日期信息查询

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `getDayInfoSummary(calendarId, date)` | ResultObject | 获取指定日的日期信息 |
| `getDayInfoSummariesOnMonth(calendarId, date, fill)` | ResultObject | 获取1个月的日期信息 |
| `getDayInfoSummariesOnWeek(calendarId, date, shiftFirstDayOfWeek)` | ResultObject | 获取1周的日期信息 |
| `getDayInfoSummariesOnTerm(calendarId, start, end)` | ResultObject | 获取期间的日期信息 |
| `isHoliday(calendarId, date)` | ResultObject | 判断指定日是否为假日 |

### 优先级与周设置

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `updateDayInfoSetSortKeyOnCalendar(calendarId, dayInfoSetIds)` | ResultObject | 更改日期信息集的优先级 |
| `updateDayInfoSortKeyOnDayInfoSet(dayInfoSetId, dayInfoIds)` | ResultObject | 更改日期信息的优先级 |

## 日期信息查询使用示例

### 获取指定日的日期信息

```javascript
let manager = new CalendarInfoManager();
let result = manager.getDayInfoSummary('calendar01', new Date());
let summary = result.data;
```

### 获取1个月的日期信息

`fill` 指定为 `true` 时，用前后月份的信息填充，使第一天为周日、最后一天为周六。

```javascript
let manager = new CalendarInfoManager();
let result = manager.getDayInfoSummariesOnMonth('calendar01', new Date(), true);
let summaries = result.data;
```

### 获取期间的日期信息

```javascript
let manager = new CalendarInfoManager();
let start = new DateTime(2024, DateTime.APRIL, 1, 0, 0, 0).getDate();
let end = new DateTime(2024, DateTime.APRIL, 30, 0, 0, 0).getDate();
let result = manager.getDayInfoSummariesOnTerm('calendar01', start, end);
let summaries = result.data;
```

### 假日判断

```javascript
let manager = new CalendarInfoManager();
let result = manager.isHoliday('calendar01', new Date());
if (result.data) {
  // 假日
}
```

## 日历与日期信息管理示例

### 创建日历

```javascript
let manager = new CalendarInfoManager();
let info = new CalendarInfo();
info.calendarId = 'calendar01';
manager.insertCalendarInfo(info);
```

### 添加或移除日期信息集

```javascript
let manager = new CalendarInfoManager();

// 将日期信息集添加到日历
manager.includeDayInfoSet('calendar01', ['dayInfoSet01', 'dayInfoSet02']);

// 从日历中移除日期信息集
manager.excludeDayInfoSet('calendar01', ['dayInfoSet02']);
```
