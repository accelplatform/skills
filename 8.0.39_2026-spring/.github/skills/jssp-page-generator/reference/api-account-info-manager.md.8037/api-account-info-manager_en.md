---
paths:
  - "src/main/jssp/**/*.js"
---

# AccountInfoManager API Reference

## Overview

AccountInfoManager is a class for managing account information.
It provides APIs for adding, retrieving, updating, and deleting user accounts, as well as role and attribute management.

- Password validation is not performed when adding or updating passwords (use `PasswordHistoryManager` instead)
- When hash-based password storage is in use, the password field of `getAccountInfo` returns `null`

## Constructor

```javascript
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

## Account Information Operations

### addAccountInfo(accountInfo)

Creates a new account.

```javascript
let manager = new AccountInfoManager();
let accountInfo = new AccountInfo();
accountInfo.userCd = 'user001';
let result = manager.addAccountInfo(accountInfo);
```

### getAccountInfo(userCd)

Retrieves account information by user code.
When hash-based password storage is in use, the password field returns `null`.

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountInfo('user001');
if (result.isSuccessful()) {
  let account = result.data;
}
```

### getAccountInfos(start, count)

Retrieves account information with paging.

```javascript
let manager = new AccountInfoManager();

// Retrieve all
let result = manager.getAccountInfos();

// Paged retrieval (20 records starting from row 0)
let result = manager.getAccountInfos(0, 20);
```

### updateAccountInfo(accountInfo)

Updates account information. If the password field is `null`, the password update is skipped.

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountInfo('user001');
let accountInfo = result.data;
accountInfo.displayName = 'New Display Name';
manager.updateAccountInfo(accountInfo);
```

### searchAccountInfos(userCd)

Searches for accounts by user code pattern.
Wildcards `*` (0 or more characters) and `?` (1 character) are supported.

```javascript
let manager = new AccountInfoManager();

// Pattern search
let result = manager.searchAccountInfos('user*');

// Pattern search with paging (20 records starting from row 0)
let result = manager.searchAccountInfos('user*', 0, 20);
```

## Role Operations

### getAccountRoleIds(userCd, date)

Retrieves valid role IDs as of a specified date.
Validity condition: `role_start_date <= date < role_end_date`

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountRoleIds('user001', new Date());
let roleIds = result.data; // Array of role IDs
```

### getAccountRoleIdsRecursively(userCd, date)

Retrieves all valid role IDs, including sub-roles, as of a specified date.

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountRoleIdsRecursively('user001', new Date());
let roleIds = result.data;
```

### getUserCdsByRoleId(roleId, date)

Retrieves all user codes that have a valid role on the specified date. Includes parent role hierarchy.

```javascript
let manager = new AccountInfoManager();
let result = manager.getUserCdsByRoleId('ADMIN_ROLE', new Date());
let userCds = result.data;
```

## Attribute Operations

### setAttribute(userCd, name, value)

Sets or updates an attribute. If it does not exist, it is newly created.
`userCd`, `name`, and `value` cannot be `null` or empty strings.

```javascript
let manager = new AccountInfoManager();
manager.setAttribute('user001', 'department', 'sales');
```

### getAttribute(userCd, name)

Retrieves an attribute value.

```javascript
let manager = new AccountInfoManager();
let result = manager.getAttribute('user001', 'department');
let value = result.data;
```

### getUserCdsByAttribute(key, value)

Retrieves user codes that match the specified attribute condition.

```javascript
let manager = new AccountInfoManager();
let result = manager.getUserCdsByAttribute('department', 'sales');
let userCds = result.data;
```
