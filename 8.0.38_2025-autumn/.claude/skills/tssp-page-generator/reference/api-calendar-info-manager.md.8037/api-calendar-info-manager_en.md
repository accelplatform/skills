---
paths:
  - "src/main/tssp/**/*.ts"
---

# CalendarInfoManager API Reference

## Overview

CalendarInfoManager is a class for managing calendar information.
It provides management of calendar information, day info sets, day information, weekday information, and the ability to search for date information on a specific day.

- Can resolve date information for a specific day from multiple day info entries according to priority
- Multiple locale internationalization items can be specified in insert/update methods
- delete methods delete all internationalization items as well

## Constructor

```typescript
let manager = new CalendarInfoManager();
```

## Method List

### Calendar Management

| Method | Return Value | Description |
|---------|--------|------|
| `getCalendarInfo(calendarId)` | ResultObject | Retrieve a calendar |
| `getCalendarInfos()` | ResultObject | Retrieve all calendars |
| `insertCalendarInfo(info)` | ResultObject | Create a calendar |
| `updateCalendarInfo(info)` | ResultObject | Update a calendar |
| `deleteCalendarInfo(info)` | ResultObject | Delete a calendar |
| `hasCalendarInfo(calendarId)` | ResultObject | Check if a calendar exists |

### Day Info Set Management

| Method | Return Value | Description |
|---------|--------|------|
| `getDayInfoSet(dayInfoSetId)` | ResultObject | Retrieve a day info set |
| `getDayInfoSets()` | ResultObject | Retrieve all day info sets |
| `getDayInfoSetsByCalendarId(calendarId)` | ResultObject | Retrieve day info sets registered to a calendar |
| `insertDayInfoSet(info)` | ResultObject | Create a day info set |
| `updateDayInfoSet(info)` | ResultObject | Update a day info set |
| `deleteDayInfoSet(info)` | ResultObject | Delete a day info set |
| `hasDayInfoSet(dayInfoSetId)` | ResultObject | Check if a day info set exists |
| `includeDayInfoSet(calendarId, dayInfoSetIds)` | ResultObject | Add day info sets to a calendar |
| `excludeDayInfoSet(calendarId, dayInfoSetIds)` | ResultObject | Remove day info sets from a calendar |

### Day Information Management

| Method | Return Value | Description |
|---------|--------|------|
| `getDayInfo(dayInfoSetId, dayInfoId)` | ResultObject | Retrieve day information |
| `getDayInfosByCalendarId(calendarId)` | ResultObject | Retrieve all day information for a calendar |
| `getDayInfosByDayInfoSetId(dayInfoSetId)` | ResultObject | Retrieve all day information for a set |
| `insertDayInfo(info)` | ResultObject | Create day information |
| `updateDayInfo(info)` | ResultObject | Update day information |
| `deleteDayInfo(info)` | ResultObject | Delete day information |
| `hasDayInfo(calendarId, date, dayInfo)` | ResultObject | Check if day information exists |

### Weekday Information Management

| Method | Return Value | Description |
|---------|--------|------|
| `getCalendarWeekDayInfos(calendarId)` | ResultObject | Retrieve weekday information (key is weekday number) |
| `insertCalendarWeekDayInfo(info)` | ResultObject | Create weekday information |
| `updateCalendarWeekDayInfo(info)` | ResultObject | Update weekday information |
| `deleteCalendarWeekDayInfo(info)` | ResultObject | Delete weekday information |

### Day Information Query

| Method | Return Value | Description |
|---------|--------|------|
| `getDayInfoSummary(calendarId, date)` | ResultObject | Retrieve day information for a specified date |
| `getDayInfoSummariesOnMonth(calendarId, date, fill)` | ResultObject | Retrieve day information for one month |
| `getDayInfoSummariesOnWeek(calendarId, date, shiftFirstDayOfWeek)` | ResultObject | Retrieve day information for one week |
| `getDayInfoSummariesOnTerm(calendarId, start, end)` | ResultObject | Retrieve day information for a period |
| `isHoliday(calendarId, date)` | ResultObject | Determine if a specified date is a holiday |

### Priority and Week Settings

| Method | Return Value | Description |
|---------|--------|------|
| `updateDayInfoSetSortKeyOnCalendar(calendarId, dayInfoSetIds)` | ResultObject | Change the priority of day info sets |
| `updateDayInfoSortKeyOnDayInfoSet(dayInfoSetId, dayInfoIds)` | ResultObject | Change the priority of day information |

The `ResultObject` return value is declared in the d.ts as a union type discriminated by `error`. Only after confirming that `result.error` is `false` does `result.data` take the type of each method (`DayInfoSummary[]`, `boolean`, etc.); reading it without checking yields `unknown`. The examples below check `result.error` before reading `result.data`.

## Day Information Query Usage Examples

### Retrieve Day Information for a Specified Date

```typescript
let manager = new CalendarInfoManager();
let result = manager.getDayInfoSummary('calendar01', new Date());
if (!result.error) {
  let summary = result.data;
}
```

### Retrieve Day Information for One Month

Specifying `true` for `fill` will pad with information from adjacent months so that the first day is Sunday and the last day is Saturday.

```typescript
let manager = new CalendarInfoManager();
let result = manager.getDayInfoSummariesOnMonth('calendar01', new Date(), true);
if (!result.error) {
  let summaries = result.data;
}
```

### Retrieve Day Information for a Period

```typescript
let manager = new CalendarInfoManager();
// DateTime#getDate() returns a ResultObject that stores a Date in data
let startResult = new DateTime(2024, DateTime.APRIL, 1, 0, 0, 0).getDate();
let endResult = new DateTime(2024, DateTime.APRIL, 30, 0, 0, 0).getDate();
if (!startResult.error && !endResult.error) {
  let result = manager.getDayInfoSummariesOnTerm('calendar01', startResult.data, endResult.data);
  if (!result.error) {
    let summaries = result.data;
  }
}
```

### Holiday Check

```typescript
let manager = new CalendarInfoManager();
let result = manager.isHoliday('calendar01', new Date());
if (!result.error && result.data) {
  // Holiday
}
```

## Calendar and Day Information Management Examples

### Creating a Calendar

Create calendar information with an object literal (the d.ts `CalendarInfo` is an `interface`, so `new CalendarInfo()` causes TS2693 in the `tssp build` type checking). The d.ts declares all four properties (`calendarId`, `calendarName`, `i18n`, `sortKey`) as required, so specify all of them.

```typescript
let manager = new CalendarInfoManager();
let info: CalendarInfo = {
  calendarId: 'calendar01',
  calendarName: 'Standard Calendar',
  i18n: { calendarName: { ja: '標準カレンダー', en: 'Standard Calendar', zh_CN: '标准日历' } },
  sortKey: 1
};
let result = manager.insertCalendarInfo(info);
if (result.error) {
  throw new Error(result.errorMessage);
}
```

### Adding and Removing Day Info Sets

```typescript
let manager = new CalendarInfoManager();

// Add day info sets to the calendar
manager.includeDayInfoSet('calendar01', ['dayInfoSet01', 'dayInfoSet02']);

// Remove a day info set from the calendar
manager.excludeDayInfoSet('calendar01', ['dayInfoSet02']);
```
