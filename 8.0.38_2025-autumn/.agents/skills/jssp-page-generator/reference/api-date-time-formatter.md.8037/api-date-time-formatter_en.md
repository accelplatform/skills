# DateTimeFormatter API Reference

## Overview

DateTimeFormatter is a static object for formatting and parsing date and time information.
It supports pattern notation compatible with Java's SimpleDateFormat.

Timezones are applied in the following priority order:

1. Timezone contained in the DateTime object
2. Timezone specified in method arguments
3. Timezone from the account context

## Constants

| Constant | Value | Description |
|------|-----|------|
| `STANDARD_DATE_FORMAT_PATTERN` | `"yyyy-MM-dd"` | System internal date format pattern |
| `STANDARD_DATE_TIME_FORMAT_PATTERN` | `"yyyy-MM-dd HH:mm:ss"` | System internal date-time format pattern |

## Method List

| Method | Return Value | Description |
|---------|--------|------|
| `format(pattern, date, [locale])` | String | Format a Date as a string |
| `format(pattern, date, zone, [locale])` | String | Format a Date as a string with specified timezone |
| `format(pattern, dateTime, [locale])` | String | Format a DateTime as a string |
| `parseToDateTime(pattern, text, [locale])` | DateTime | Parse a string and generate a DateTime |
| `parseToDateTime(pattern, text, zone, [locale])` | DateTime | Parse a string and convert to DateTime with specified timezone |
| `parseToDate(pattern, text, [locale])` | Date | Parse a string and generate a Date |
| `parseToDate(pattern, text, zone, [locale])` | Date | Parse a string and convert to Date with specified timezone |

## format

Formats a Date or DateTime as a string according to the specified pattern.

```javascript
// Format a Date
let str = DateTimeFormatter.format('yyyy/MM/dd', new Date());

// Format a DateTime
let dt = new DateTime();
let str = DateTimeFormatter.format('yyyy-MM-dd HH:mm:ss', dt);

// Specify timezone
let zone = TimeZone.getTimeZone('America/New_York').data;
let str = DateTimeFormatter.format('yyyy/MM/dd HH:mm:ss', new Date(), zone);

// Specify locale
let str = DateTimeFormatter.format('yyyy年MM月dd日(E)', new Date(), 'ja');
```

### Parameters

| Parameter | Type | Description |
|-----------|------|------|
| `pattern` | String | Date/time format pattern |
| `date` / `dateTime` | Date / DateTime | Target to format |
| `zone` | TimeZone | Timezone (optional) |
| `locale` | String | Locale (optional) |

## parseToDateTime

Parses a string and generates a DateTime object.

```javascript
// Generate DateTime from a string
let dt = DateTimeFormatter.parseToDateTime('yyyy/MM/dd', '2024/01/15');

// Specify timezone
let zone = TimeZone.getTimeZone('Asia/Tokyo').data;
let dt = DateTimeFormatter.parseToDateTime('yyyy-MM-dd HH:mm:ss', '2024-01-15 14:30:00', zone);
```

### Parameters

| Parameter | Type | Description |
|-----------|------|------|
| `pattern` | String | Date/time format pattern |
| `text` | String | String to parse |
| `zone` | TimeZone | Timezone (optional) |
| `locale` | String | Locale (optional) |

## parseToDate

Parses a string and generates a Date object.

```javascript
// Generate Date from a string
let date = DateTimeFormatter.parseToDate('yyyy/MM/dd', '2024/01/15');

// Specify timezone
let zone = TimeZone.getTimeZone('Asia/Tokyo').data;
let date = DateTimeFormatter.parseToDate('yyyy-MM-dd HH:mm:ss', '2024-01-15 14:30:00', zone);
```

### Parameters

| Parameter | Type | Description |
|-----------|------|------|
| `pattern` | String | Date/time format pattern |
| `text` | String | String to parse |
| `zone` | TimeZone | Timezone (optional) |
| `locale` | String | Locale (optional) |

## Format Pattern Characters

| Character | Description | Example |
|------|------|-----|
| `y` | Year | `yyyy` → 2024 |
| `M` | Month | `MM` → 01 |
| `d` | Day | `dd` → 15 |
| `H` | Hour (0-23) | `HH` → 14 |
| `h` | Hour (1-12) | `hh` → 02 |
| `m` | Minute | `mm` → 30 |
| `s` | Second | `ss` → 00 |
| `S` | Millisecond | `SSS` → 123 |
| `a` | AM/PM | `a` → AM |
| `E` | Day of week | `E` → Mon |
| `'` | Text escape | `'T'` → T |
