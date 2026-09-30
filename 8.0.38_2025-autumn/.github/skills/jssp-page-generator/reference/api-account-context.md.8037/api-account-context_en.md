---
paths:
  - "src/main/jssp/**/*.js"
---

# AccountContext API Reference

## Overview

AccountContext is a required access context that holds information about the accessing account.
It provides account information such as user code and locale, as well as authentication status.

- Determine whether the user is authenticated
- If authenticated, retrieve information about the logged-in user (user code, assigned roles, etc.)

### How to Retrieve

```javascript
let accountContext = Contexts.getAccountContext();
```

## Property List

| Property | Type | Description | Notes |
|-----------|------|------|------|
| applicationLicenses | Array(String) | List of application licenses | |
| authenticated | Boolean | Authentication status. `true` if logged in | |
| calendarId | String | Calendar ID | |
| dateTimeFormats | DateTimeFormats | List of date/time display formats | See SystemDateTimeFormat#getFormats |
| decimalFormatId | String | Format ID for numeric format | Since 8.0.15 |
| encoding | String | Character encoding | |
| firstDayOfWeek | Number | First day of week (0: Sunday - 6: Saturday) | |
| homeUrl | String | Home URL | |
| locale | String | Locale | |
| loginGroupId | String | Login group ID (deprecated; same value as tenant ID) | Used only inside compatibility API |
| loginTime | Date | Login time. `null` when not logged in | |
| roleIds | Array(String) | List of role IDs (including sub-roles) | |
| signature | String | Login signature. `null` when not logged in | |
| tenantId | String | Tenant ID | Since 8.0.7 |
| themeId | String | Theme ID | |
| timeZone | TimeZone | Time zone | |
| userCd | String | User ID | |
| userType | `"administrator"` or `"user"` | User type | |

## Settings Resolution Order

Each setting value is resolved in the following order:

1. Account setting information
2. Tenant account setting information
3. Browser information
4. System default account setting information
5. Server environment setting information

## Usage Examples

### Retrieving Logged-in User Information

```javascript
function getAccountContext() {
  let accountContext = Contexts.getAccountContext();

  return {
    authenticated: accountContext.authenticated,
    userCd: accountContext.userCd,
    locale: accountContext.locale,
    tenantId: accountContext.tenantId,
    timeZone: accountContext.timeZone,
    userType: accountContext.userType,
    roleIds: accountContext.roleIds
  };
}
```

### Checking Authentication Status

```javascript
function isAuthenticated() {
  let accountContext = Contexts.getAccountContext();
  return accountContext.authenticated;
}
```

### Checking Role Assignment

```javascript
function hasRole(targetRoleId) {
  let accountContext = Contexts.getAccountContext();
  let roleIds = accountContext.roleIds;

  for (let i = 0; i < roleIds.length; i++) {
    if (roleIds[i] === targetRoleId) {
      return true;
    }
  }
  return false;
}
```

### Checking Administrator Status

```javascript
function isAdministrator() {
  let accountContext = Contexts.getAccountContext();
  return accountContext.userType === 'administrator';
}
```
