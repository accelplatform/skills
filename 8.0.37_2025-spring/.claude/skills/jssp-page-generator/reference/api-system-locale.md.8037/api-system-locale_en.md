---
paths:
  - "src/main/jssp/**/*.js"
---

# SystemLocale API Reference

## Overview

SystemLocale is a static object that handles locale information available in the system.

## Method List

| Method | Return Value | Description |
|--------|-------------|-------------|
| `getDefaultLocaleInfo()` | ResultObject | Get the system default locale information |
| `getLocaleInfo(id)` | ResultObject | Get locale information for the specified locale ID |
| `getLocaleInfos()` | ResultObject | Get all available locale information |
| `isAvailableLocale(id)` | ResultObject | Determine whether a locale ID is available |

## getDefaultLocaleInfo()

Gets the system default locale information.
`ResultObject.data` contains the LocaleInfo.

```javascript
let result = SystemLocale.getDefaultLocaleInfo();
let localeInfo = result.data;
```

## getLocaleInfo(id)

Gets locale information for the specified locale ID.
Returns `null` if a locale ID that is not available in the system is specified.

```javascript
let result = SystemLocale.getLocaleInfo('ja');
let localeInfo = result.data;
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Locale ID |

## getLocaleInfos()

Gets all locale information available in the system.
`ResultObject.data` contains an array of LocaleInfo.

```javascript
let result = SystemLocale.getLocaleInfos();
let localeInfos = result.data;

for (let i = 0; i < localeInfos.length; i++) {
  Debug.print(localeInfos[i].id);
}
```

## isAvailableLocale(id)

Determines whether the specified locale ID is available in the system.
`ResultObject.data` contains `true` (available) or `false` (unavailable).

```javascript
let result = SystemLocale.isAvailableLocale('ja');
if (result.data) {
  // Available
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Locale ID |
