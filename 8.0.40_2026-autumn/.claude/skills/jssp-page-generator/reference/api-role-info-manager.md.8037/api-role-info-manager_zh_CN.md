---
paths:
  - "src/main/jssp/**/*.js"
---

# RoleInfoManager API 参考手册

## 概述

RoleInfoManager 是用于管理角色信息的类。
提供角色的CRUD操作、分类管理以及角色层级（父子关系）管理的API。

## 构造函数

```javascript
let manager = new RoleInfoManager();
```

## 方法列表

### 角色信息管理

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `addRoleInfo(roleInfo)` | ResultObject | 新建角色 |
| `updateRoleInfo(roleInfo)` | ResultObject | 更新角色信息 |
| `deleteRoleInfo(roleId)` | ResultObject | 删除角色 |
| `deleteRoleInfos()` | ResultObject | 删除所有角色 |
| `getRoleInfo(roleId)` | ResultObject | 获取角色信息 |
| `getRoleInfos()` | ResultObject | 获取所有角色信息 |
| `getRoleInfosByRoleIds(roleIds)` | ResultObject | 通过多个角色ID获取角色信息 |
| `contains(roleId)` | ResultObject | 确认角色是否存在 |
| `getRoleInfoCount()` | ResultObject | 获取角色总数 |

### 角色搜索

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `searchRoleInfosByRoleId(roleId)` | ResultObject | 通过角色ID模式搜索 |
| `searchRoleInfosByRoleName(roleName)` | ResultObject | 通过角色名模式搜索 |
| `searchRoleInfosByCategoryAndRoleName(category, roleName, locale, limit, offset, sortIndex, sortOrder)` | ResultObject | 通过分类和角色名搜索（带分页和排序） |
| `containsRoleName(roleName)` | ResultObject | 确认角色名是否存在 |
| `containsRoleName(roleName, exceptRoleId)` | ResultObject | 排除指定角色确认角色名是否存在 |

通配符：支持 `*`（0个或多个字符）和 `?`（1个字符）。

### 分类管理

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `getCategories()` | ResultObject | 获取所有分类 |
| `getRoleInfosByCategory(category)` | ResultObject | 获取分类内的角色 |
| `getRoleInfoCountByCategory(category)` | ResultObject | 获取分类内的角色数量 |
| `getRoleInfoCountByCategoryAndRoleName(category, roleName, locale)` | ResultObject | 获取与分类和角色名匹配的角色数量 |
| `containsCategory(category)` | ResultObject | 确认分类是否存在 |
| `deleteCategory(category)` | ResultObject | 删除分类 |
| `deleteCategories()` | ResultObject | 删除所有分类 |
| `moveCategory(oldCategory, newCategory)` | ResultObject | 更改分类名称 |

### 角色层级管理

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `addSubRoleInfo(roleId, subRoleId)` | ResultObject | 添加子角色关系 |
| `deleteSubRoleInfo(roleId, subRoleId)` | ResultObject | 删除子角色关系 |
| `deleteSubRoleInfos(roleId)` | ResultObject | 删除所有子角色关系 |
| `getSubRoleIds(roleId)` | ResultObject | 获取直接子角色ID |
| `getAllSubRoleIds(roleId)` | ResultObject | 获取所有层级的子角色ID |
| `getParentRoleIds(roleId)` | ResultObject | 获取直接父角色ID |
| `getAllParentRoleIds(roleId)` | ResultObject | 获取所有层级的父角色ID |
| `certify(nestRoleIds, roleIds)` | ResultObject | 验证角色包含关系 |

### 其他

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `isUpdate(date)` | ResultObject | 判断指定日期后角色是否有更新 |

## 角色信息操作示例

### 获取角色

```javascript
let manager = new RoleInfoManager();
let result = manager.getRoleInfo('ADMIN_ROLE');
if (result.isSuccessful()) {
  let roleInfo = result.data;
}
```

### 搜索角色

```javascript
let manager = new RoleInfoManager();

// 通过角色ID模式搜索
let result = manager.searchRoleInfosByRoleId('ADMIN*');

// 通过分类和角色名搜索（带分页和排序）
let result = manager.searchRoleInfosByCategoryAndRoleName(
  'system',   // category
  '管理*',    // roleName
  'ja',       // locale
  20,         // limit
  0,          // offset
  'roleId',   // sortIndex
  'ASC'       // sortOrder
);
```

## 角色层级操作示例

### 添加和获取子角色

```javascript
let manager = new RoleInfoManager();

// 添加子角色关系
manager.addSubRoleInfo('PARENT_ROLE', 'CHILD_ROLE');

// 获取直接子角色
let result = manager.getSubRoleIds('PARENT_ROLE');
let subRoleIds = result.data;

// 获取所有层级的子角色
let result = manager.getAllSubRoleIds('PARENT_ROLE');
let allSubRoleIds = result.data;
```

### 获取父角色

```javascript
let manager = new RoleInfoManager();

// 获取直接父角色
let result = manager.getParentRoleIds('CHILD_ROLE');
let parentRoleIds = result.data;

// 获取所有层级的父角色
let result = manager.getAllParentRoleIds('CHILD_ROLE');
let allParentRoleIds = result.data;
```

## 分类操作示例

```javascript
let manager = new RoleInfoManager();

// 获取所有分类
let result = manager.getCategories();
let categories = result.data;

// 获取分类内的角色
let result = manager.getRoleInfosByCategory('system');
let roleInfos = result.data;

// 更改分类名称
manager.moveCategory('old_category', 'new_category');
```
