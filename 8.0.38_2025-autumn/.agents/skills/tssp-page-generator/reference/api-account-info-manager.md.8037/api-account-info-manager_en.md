# AccountInfoManager API Reference

## Overview

AccountInfoManager is a class for managing account information.
It provides APIs for adding, retrieving, updating, and deleting user accounts, as well as role and attribute management.

- Password validation is not performed when adding or updating passwords (use `PasswordHistoryManager` instead)
- When hash-based password storage is in use, the password field of `getAccountInfo` returns `null`

## Constructor

```typescript
let manager = new AccountInfoManager();
```

## Method List

### Account Information

| Method | Return Value | Description |
|---------|--------|------|
| `addAccountInfo(accountInfo)` | ResultObject | Create a new account |
| `getAccountInfo(userCd)` | ResultObject | Retrieve an account by user code |
| `getAccountInfos()` | ResultObject | Retrieve all accounts |
| `getAccountInfos(start, count)` | ResultObject | Retrieve accounts with paging |
| `getAccountInfosByUserCds(userCds)` | ResultObject | Retrieve accounts by multiple user codes |
| `updateAccountInfo(accountInfo)` | ResultObject | Update account information |
| `deleteAccountInfo(userCd)` | ResultObject | Delete an account |
| `deleteAccountInfos()` | ResultObject | Delete all accounts |
| `contains(userCd)` | ResultObject | Check if an account exists |
| `getAccountInfoCount()` | ResultObject | Retrieve the total number of accounts |
| `searchAccountInfos(userCd)` | ResultObject | Search by user code pattern |
| `searchAccountInfos(userCd, start, count)` | ResultObject | Pattern search with paging |

### Role Management

| Method | Return Value | Description |
|---------|--------|------|
| `getAccountRoleIds(userCd)` | ResultObject | Retrieve assigned role IDs |
| `getAccountRoleIds(userCd, date)` | ResultObject | Retrieve valid role IDs as of a specified date |
| `getAccountRoleIdsRecursively(userCd, date)` | ResultObject | Retrieve valid role IDs including sub-roles |
| `getAccountRoleInfos(userCd)` | ResultObject | Retrieve role information |
| `getAccountRoleInfos(userCd, date)` | ResultObject | Retrieve valid role information as of a specified date |
| `addAccountRoleInfo(userCd, roleInfo)` | ResultObject | Assign a role |
| `updateAccountRoleInfo(userCd, roleInfo)` | ResultObject | Update a role assignment |
| `deleteAccountRoleInfo(userCd, roleId)` | ResultObject | Remove a role |
| `deleteAccountRoleInfos(userCd)` | ResultObject | Remove all roles |

### User Code Retrieval

| Method | Return Value | Description |
|---------|--------|------|
| `getUserCds()` | ResultObject | Retrieve all user codes |
| `getUserCdsByRoleId(roleId, date)` | ResultObject | Retrieve user codes that have a valid role on a specified date |
| `getUserCdsByAccountRoleId(roleId)` | ResultObject | Retrieve user codes that have a role directly assigned |
| `getUserCdsByAttribute(key, value)` | ResultObject | Retrieve user codes by attribute |

### Attribute Management

| Method | Return Value | Description |
|---------|--------|------|
| `getAttribute(userCd, name)` | ResultObject | Retrieve an attribute value |
| `getAttribute(userCd, name, def)` | ResultObject | Retrieve an attribute value with a default value |
| `getAttributeNames(userCd)` | ResultObject | Retrieve all attribute names |
| `setAttribute(userCd, name, value)` | ResultObject | Set or update an attribute |
| `deleteAttribute(userCd, name)` | ResultObject | Delete an attribute |
| `deleteAttributes(userCd)` | ResultObject | Delete all attributes |

The `ResultObject` return value is declared in the d.ts as a union type discriminated by `error`. Only after confirming that `result.error` is `false` does `result.data` take the type of each method (`AccountInfo`, `string[]`, etc.); reading it without checking yields `unknown`. The examples below check `result.error` before reading `result.data`.

## Account Information Operations

### addAccountInfo(accountInfo)

Creates a new account.
Create account information with an object literal (the d.ts `AccountInfo` consists only of type declarations (an `interface` and a types-only `namespace`) and has no value, so `new AccountInfo()` causes TS2708 in the `tssp build` type checking). The d.ts declares all 13 properties, including `password`, `dateTimeFormats`, `validStartDate`, and `lockDate`, as required. The example below uses `as AccountInfo` only to match an input with a narrowed set of properties to this d.ts declaration. Because `as` hides missing required properties from type checking, do not use it to suppress type errors in any API other than this one.

```typescript
let manager = new AccountInfoManager();
let accountInfo = { userCd: 'user001' } as AccountInfo;
let result = manager.addAccountInfo(accountInfo);
```

### getAccountInfo(userCd)

Retrieves account information by user code.
When hash-based password storage is in use, the password field returns `null`.

```typescript
let manager = new AccountInfoManager();
let result = manager.getAccountInfo('user001');
// Also check data in case the account does not exist
if (!result.error && result.data) {
  let account = result.data;
}
```

### getAccountInfos(start, count)

Retrieves account information with paging.

```typescript
let manager = new AccountInfoManager();

// Retrieve all
let result = manager.getAccountInfos();

// Paged retrieval (20 records starting from row 0)
let pagedResult = manager.getAccountInfos(0, 20);
```

### updateAccountInfo(accountInfo)

Updates account information. If the password field is `null`, the password update is skipped.

```typescript
let manager = new AccountInfoManager();
let result = manager.getAccountInfo('user001');
// Also check data in case the account does not exist
if (!result.error && result.data) {
  let accountInfo = result.data;
  accountInfo.locale = 'en';
  manager.updateAccountInfo(accountInfo);
}
```

### searchAccountInfos(userCd)

Searches for accounts by user code pattern.
Wildcards `*` (0 or more characters) and `?` (1 character) are supported.

```typescript
let manager = new AccountInfoManager();

// Pattern search
let result = manager.searchAccountInfos('user*');

// Pattern search with paging (20 records starting from row 0)
let pagedResult = manager.searchAccountInfos('user*', 0, 20);
```

## Role Operations

### getAccountRoleIds(userCd, date)

Retrieves valid role IDs as of a specified date.
Validity condition: `role_start_date <= date < role_end_date`

```typescript
let manager = new AccountInfoManager();
let result = manager.getAccountRoleIds('user001', new Date());
if (!result.error) {
  let roleIds = result.data; // Array of role IDs
}
```

### getAccountRoleIdsRecursively(userCd, date)

Retrieves all valid role IDs, including sub-roles, as of a specified date.

```typescript
let manager = new AccountInfoManager();
let result = manager.getAccountRoleIdsRecursively('user001', new Date());
if (!result.error) {
  let roleIds = result.data;
}
```

### getUserCdsByRoleId(roleId, date)

Retrieves all user codes that have a valid role on the specified date. Includes parent role hierarchy.

```typescript
let manager = new AccountInfoManager();
let result = manager.getUserCdsByRoleId('ADMIN_ROLE', new Date());
if (!result.error) {
  let userCds = result.data;
}
```

## Attribute Operations

### setAttribute(userCd, name, value)

Sets or updates an attribute. If it does not exist, it is newly created.
`userCd`, `name`, and `value` cannot be `null` or empty strings.

```typescript
let manager = new AccountInfoManager();
manager.setAttribute('user001', 'department', 'sales');
```

### getAttribute(userCd, name)

Retrieves an attribute value.

```typescript
let manager = new AccountInfoManager();
let result = manager.getAttribute('user001', 'department');
if (!result.error) {
  let value = result.data;
}
```

### getUserCdsByAttribute(key, value)

Retrieves user codes that match the specified attribute condition.

```typescript
let manager = new AccountInfoManager();
let result = manager.getUserCdsByAttribute('department', 'sales');
if (!result.error) {
  let userCds = result.data;
}
```
