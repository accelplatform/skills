# TimeZone API Reference

## Overview

TimeZone is a class that handles timezone information.
It provides the same behavior as Java's TimeZone class and can handle timezones that do not exist in the timezone master.

- For APIs that require a timezone, it is recommended to use timezone information obtained from `SystemTimeZone`
- If the specified ID cannot be recognized, returns the GMT timezone

## Obtaining an Instance

```javascript
let timeZone = TimeZone.getTimeZone('Asia/Tokyo').data;
```

## Property List (Read-only)

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Timezone ID |
| `rawOffset` | Number | Amount of time in milliseconds to add to UTC |
| `useDaylightTime` | Boolean | Whether daylight saving time is used (true: used / false: not used) |

## Method List

| Method | Return Value | Description |
|--------|-------------|-------------|
| `TimeZone.getTimeZone(id)` | ResultObject | Get the timezone for the specified ID (static) |
| `getOffset(date)` | Number | Get the offset from UTC in milliseconds for the specified date |
| `inDaylightTime(date)` | Boolean | Determine whether the specified date is within the daylight saving time period |

## TimeZone.getTimeZone(id) [static]

Gets the timezone for the specified ID.
The `ResultObject.data` of the return value contains the TimeZone object.

```javascript
let timeZone = TimeZone.getTimeZone('Asia/Tokyo').data;
let id = timeZone.id;               // "Asia/Tokyo"
let offset = timeZone.rawOffset;     // 32400000 (9 hours = 9 * 60 * 60 * 1000)
```

## getOffset(date)

Gets the offset from UTC in milliseconds for the specified date.
If daylight saving time applies, the offset including that amount is returned.

```javascript
let timeZone = TimeZone.getTimeZone('America/New_York').data;
let offset = timeZone.getOffset(new Date());
```

## inDaylightTime(date)

Determines whether the specified date is within the daylight saving time period for this timezone.

```javascript
let timeZone = TimeZone.getTimeZone('America/New_York').data;
let isDst = timeZone.inDaylightTime(new Date());
```
