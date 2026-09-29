---
paths:
  - "src/main/jssp/**/*.js"
---

# DateTime API Reference

## Overview

DateTime is an object for handling date and time with timezone awareness.
All methods guarantee immutability; the original instance is never modified (a new copy is returned).

- Month values are **0-based** (January=0, December=11)
- Year range is 1 to 9999
- When timezone is omitted, it is automatically resolved from the account context

## Constructor

```javascript
// Current date and time (timezone auto-resolved from account settings)
let dt = new DateTime();

// Current date and time with specified timezone
let dt = new DateTime(zone);

// Generate from a Date object
let dt = new DateTime(date, zone);

// Specify year, month, day, hour, minute, second (month is 0-based)
let dt = new DateTime(year, monthOfYear, dayOfMonth, hourOfDay, minuteOfHour, secondOfMinute, zone);
```

## Constants

| Constant | Value | Constant | Value |
|------|-----|------|-----|
| JANUARY | 0 | JULY | 6 |
| FEBRUARY | 1 | AUGUST | 7 |
| MARCH | 2 | SEPTEMBER | 8 |
| APRIL | 3 | OCTOBER | 9 |
| MAY | 4 | NOVEMBER | 10 |
| JUNE | 5 | DECEMBER | 11 |

Day-of-week constants: `SUNDAY`, `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`

## Property List (Read-Only)

| Property | Type | Description |
|-----------|------|------|
| year | Number | Year (1 to 9999) |
| monthOfYear | Number | Month (0 to 11) |
| dayOfMonth | Number | Day (1 to 31) |
| hourOfDay | Number | Hour (0 to 23) |
| minuteOfHour | Number | Minute (0 to 59) |
| secondOfMinute | Number | Second (0 to 59) |
| dayOfWeek | Number | Day of week value |
| lastDayOfMonth | Number | Last day of month (28 to 31) |
| firstDayOfWeek | Number | First day of week |
| timeZoneId | String | Timezone ID |

## Method List

### Addition Methods (Returns a new DateTime)

| Method | Description |
|---------|------|
| plusYears(years) | Add years |
| plusMonths(months) | Add months |
| plusDays(days) | Add days |
| plusHours(hours) | Add hours |
| plusMinutes(minutes) | Add minutes |
| plusSeconds(seconds) | Add seconds |

### Subtraction Methods (Returns a new DateTime)

| Method | Description |
|---------|------|
| minusYears(years) | Subtract years |
| minusMonths(months) | Subtract months |
| minusDays(days) | Subtract days |
| minusHours(hours) | Subtract hours |
| minusMinutes(minutes) | Subtract minutes |
| minusSeconds(seconds) | Subtract seconds |

### Value Modification Methods (Returns a new DateTime)

| Method | Description |
|---------|------|
| withYear(year) | Change year only |
| withMonthOfYear(month) | Change month only |
| withDayOfMonth(day) | Change day only |
| withHourOfDay(hour) | Change hour only |
| withMinuteOfHour(minute) | Change minute only |
| withSecondOfMinute(second) | Change second only |
| withMilliOfSecond(milli) | Change milliseconds only |
| withTimeZone(zone) | Convert timezone |

### Conversion and Retrieval Methods

| Method | Return Value | Description |
|---------|--------|------|
| getDate() | ResultObject | Returns a Date with epoch milliseconds |
| getTime() | ResultObject | Returns epoch milliseconds |
| getTimeZone() | ResultObject | Returns the timezone |
| getTimeZoneOffset() | ResultObject | Returns the timezone offset (milliseconds) |
| clone() | ResultObject | Creates a copy |
| toString() | String | Converts to RFC 822 format string |

* Methods other than `toString()` return a `ResultObject`, and the result is stored in `.data`.

## Usage Examples

### Getting the Current Date and Time

```javascript
let now = new DateTime();
let year = now.year;
let month = now.monthOfYear + 1; // Add 1 for display
let day = now.dayOfMonth;
```

### Date Arithmetic

```javascript
let now = new DateTime();

// 3 months later
let future = now.plusMonths(3).data;

// 7 days ago
let past = now.minusDays(7).data;

// Same date next year
let nextYear = now.plusYears(1).data;
```

### Creating a Specific Date and Time

```javascript
// January 15, 2024 at 14:30:00
let dt = new DateTime(2024, DateTime.JANUARY, 15, 14, 30, 0);
```

### Getting the Last Day of the Month

```javascript
let now = new DateTime();
let lastDay = now.lastDayOfMonth;
```
