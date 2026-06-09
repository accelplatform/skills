---
paths:
  - "src/main/jssp/**/*.js"
---

# RoleInfoManager API Reference

## Overview

RoleInfoManager is a class for managing role information.
It provides APIs for CRUD operations on roles, category management, and role hierarchy (parent-child relationship) management.

## Constructor

```javascript
let manager = new RoleInfoManager();
```

## Method List

### Role Information Management

| Method | Return Value | Description |
|---------|--------|------|
| `addRoleInfo(roleInfo)` | ResultObject | Register a new role |
| `updateRoleInfo(roleInfo)` | ResultObject | Update role information |
| `deleteRoleInfo(roleId)` | ResultObject | Delete a role |
| `deleteRoleInfos()` | ResultObject | Delete all roles |
| `getRoleInfo(roleId)` | ResultObject | Retrieve role information |
| `getRoleInfos()` | ResultObject | Retrieve all role information |
| `getRoleInfosByRoleIds(roleIds)` | ResultObject | Retrieve role information by multiple role IDs |
| `contains(roleId)` | ResultObject | Check if a role exists |
| `getRoleInfoCount()` | ResultObject | Retrieve the total number of roles |

### Role Search

| Method | Return Value | Description |
|---------|--------|------|
| `searchRoleInfosByRoleId(roleId)` | ResultObject | Search by role ID pattern |
| `searchRoleInfosByRoleName(roleName)` | ResultObject | Search by role name pattern |
| `searchRoleInfosByCategoryAndRoleName(category, roleName, locale, limit, offset, sortIndex, sortOrder)` | ResultObject | Search by category and role name (with paging and sorting) |
| `containsRoleName(roleName)` | ResultObject | Check if a role name exists |
| `containsRoleName(roleName, exceptRoleId)` | ResultObject | Check if a role name exists, excluding the specified role |

Wildcards: `*` (0 or more characters) and `?` (1 character) are supported.

### Category Management

| Method | Return Value | Description |
|---------|--------|------|
| `getCategories()` | ResultObject | Retrieve all categories |
| `getRoleInfosByCategory(category)` | ResultObject | Retrieve roles in a category |
| `getRoleInfoCountByCategory(category)` | ResultObject | Retrieve the number of roles in a category |
| `getRoleInfoCountByCategoryAndRoleName(category, roleName, locale)` | ResultObject | Retrieve the count of roles matching category and role name |
| `containsCategory(category)` | ResultObject | Check if a category exists |
| `deleteCategory(category)` | ResultObject | Delete a category |
| `deleteCategories()` | ResultObject | Delete all categories |
| `moveCategory(oldCategory, newCategory)` | ResultObject | Rename a category |

### Role Hierarchy Management

| Method | Return Value | Description |
|---------|--------|------|
| `addSubRoleInfo(roleId, subRoleId)` | ResultObject | Add a sub-role relationship |
| `deleteSubRoleInfo(roleId, subRoleId)` | ResultObject | Delete a sub-role relationship |
| `deleteSubRoleInfos(roleId)` | ResultObject | Delete all sub-role relationships |
| `getSubRoleIds(roleId)` | ResultObject | Retrieve immediate sub-role IDs |
| `getAllSubRoleIds(roleId)` | ResultObject | Retrieve all-level sub-role IDs |
| `getParentRoleIds(roleId)` | ResultObject | Retrieve immediate parent role IDs |
| `getAllParentRoleIds(roleId)` | ResultObject | Retrieve all-level parent role IDs |
| `certify(nestRoleIds, roleIds)` | ResultObject | Verify role inclusion relationships |

### Other

| Method | Return Value | Description |
|---------|--------|------|
| `isUpdate(date)` | ResultObject | Determine if roles have been updated since the specified date |

## Role Information Operation Examples

### Retrieving a Role

```javascript
let manager = new RoleInfoManager();
let result = manager.getRoleInfo('ADMIN_ROLE');
if (result.isSuccessful()) {
    let roleInfo = result.data;
}
```

### Searching for Roles

```javascript
let manager = new RoleInfoManager();

// Search by role ID pattern
let result = manager.searchRoleInfosByRoleId('ADMIN*');

// Search by category and role name (with paging and sorting)
let result = manager.searchRoleInfosByCategoryAndRoleName(
    'system',   // category
    'Admin*',   // roleName
    'en',       // locale
    20,         // limit
    0,          // offset
    'roleId',   // sortIndex
    'ASC'       // sortOrder
);
```

## Role Hierarchy Operation Examples

### Adding and Retrieving Sub-Roles

```javascript
let manager = new RoleInfoManager();

// Add a sub-role relationship
manager.addSubRoleInfo('PARENT_ROLE', 'CHILD_ROLE');

// Retrieve immediate sub-roles
let result = manager.getSubRoleIds('PARENT_ROLE');
let subRoleIds = result.data;

// Retrieve all-level sub-roles
let result = manager.getAllSubRoleIds('PARENT_ROLE');
let allSubRoleIds = result.data;
```

### Retrieving Parent Roles

```javascript
let manager = new RoleInfoManager();

// Retrieve immediate parent roles
let result = manager.getParentRoleIds('CHILD_ROLE');
let parentRoleIds = result.data;

// Retrieve all-level parent roles
let result = manager.getAllParentRoleIds('CHILD_ROLE');
let allParentRoleIds = result.data;
```

## Category Operation Examples

```javascript
let manager = new RoleInfoManager();

// Retrieve all categories
let result = manager.getCategories();
let categories = result.data;

// Retrieve roles in a category
let result = manager.getRoleInfosByCategory('system');
let roleInfos = result.data;

// Rename a category
manager.moveCategory('old_category', 'new_category');
```
