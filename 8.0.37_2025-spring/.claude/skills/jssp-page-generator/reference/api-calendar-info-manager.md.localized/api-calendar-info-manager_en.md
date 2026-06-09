---
paths:
  - "src/main/jssp/**/*.js"
---

# CalendarInfoManager API Reference

## Overview

CalendarInfoManager is a class for managing calendar information.
It provides management of calendar information, day info sets, day information, weekday information, and the ability to search for date information on a specific day.

- Can resolve date information for a specific day from multiple day info entries according to priority
- Multiple locale internationalization items can be specified in insert/update methods
- delete methods delete all internationalization items as well

## Constructor

```javascript
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

## Day Information Query Usage Examples

### Retrieve Day Information for a Specified Date

```javascript
let manager = new CalendarInfoManager();
let result = manager.getDayInfoSummary('calendar01', new Date());
let summary = result.data;
```

### Retrieve Day Information for One Month

Specifying `true` for `fill` will pad with information from adjacent months so that the first day is Sunday and the last day is Saturday.

```javascript
let manager = new CalendarInfoManager();
let result = manager.getDayInfoSummariesOnMonth('calendar01', new Date(), true);
let summaries = result.data;
```

### Retrieve Day Information for a Period

```javascript
let manager = new CalendarInfoManager();
let start = new DateTime(2024, DateTime.APRIL, 1, 0, 0, 0).getDate();
let end = new DateTime(2024, DateTime.APRIL, 30, 0, 0, 0).getDate();
let result = manager.getDayInfoSummariesOnTerm('calendar01', start, end);
let summaries = result.data;
```

### Holiday Check

```javascript
let manager = new CalendarInfoManager();
let result = manager.isHoliday('calendar01', new Date());
if (result.data) {
    // Holiday
}
```

## Calendar and Day Information Management Examples

### Creating a Calendar

```javascript
let manager = new CalendarInfoManager();
let info = new CalendarInfo();
info.calendarId = 'calendar01';
manager.insertCalendarInfo(info);
```

### Adding and Removing Day Info Sets

```javascript
let manager = new CalendarInfoManager();

// Add day info sets to the calendar
manager.includeDayInfoSet('calendar01', ['dayInfoSet01', 'dayInfoSet02']);

// Remove a day info set from the calendar
manager.excludeDayInfoSet('calendar01', ['dayInfoSet02']);
```
