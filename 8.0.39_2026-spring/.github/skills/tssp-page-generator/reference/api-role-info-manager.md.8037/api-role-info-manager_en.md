---
paths:
  - "src/main/tssp/**/*.ts"
---

# RoleInfoManager API Reference

## Overview

RoleInfoManager is a class for managing role information.
It provides APIs for CRUD operations on roles, category management, and role hierarchy (parent-child relationship) management.

## Constructor

```typescript
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

```typescript
let manager = new RoleInfoManager();
let result = manager.getRoleInfo('ADMIN_ROLE');
if (!result.error) {
  let roleInfo = result.data;
}
```

### Searching for Roles

```typescript
let manager = new RoleInfoManager();

// Search by role ID pattern
let result = manager.searchRoleInfosByRoleId('ADMIN*');

// Search by category and role name (with paging and sorting)
let pagedResult = manager.searchRoleInfosByCategoryAndRoleName(
  'system',   // category
  'Admin*',   // roleName
  'en',       // locale
  20,         // limit
  0,          // offset
  'role_name', // sortIndex: category / role_name / display_name
  'ASC'       // sortOrder
);
```

## Role Hierarchy Operation Examples

### Adding and Retrieving Sub-Roles

```typescript
let manager = new RoleInfoManager();

// Add a sub-role relationship
manager.addSubRoleInfo('PARENT_ROLE', 'CHILD_ROLE');

// Retrieve immediate sub-roles
let subResult = manager.getSubRoleIds('PARENT_ROLE');
if (!subResult.error) {
  let subRoleIds = subResult.data;
}

// Retrieve all-level sub-roles
let allSubResult = manager.getAllSubRoleIds('PARENT_ROLE');
if (!allSubResult.error) {
  let allSubRoleIds = allSubResult.data;
}
```

### Retrieving Parent Roles

```typescript
let manager = new RoleInfoManager();

// Retrieve immediate parent roles
let parentResult = manager.getParentRoleIds('CHILD_ROLE');
if (!parentResult.error) {
  let parentRoleIds = parentResult.data;
}

// Retrieve all-level parent roles
let allParentResult = manager.getAllParentRoleIds('CHILD_ROLE');
if (!allParentResult.error) {
  let allParentRoleIds = allParentResult.data;
}
```

## Category Operation Examples

```typescript
let manager = new RoleInfoManager();

// Retrieve all categories
let categoryResult = manager.getCategories();
if (!categoryResult.error) {
  let categories = categoryResult.data;
}

// Retrieve roles in a category
let roleResult = manager.getRoleInfosByCategory('system');
if (!roleResult.error) {
  let roleInfos = roleResult.data;
}

// Rename a category
manager.moveCategory('old_category', 'new_category');
```
