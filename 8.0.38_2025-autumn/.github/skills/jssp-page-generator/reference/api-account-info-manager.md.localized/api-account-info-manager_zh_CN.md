---
paths:
  - "src/main/jssp/**/*.js"
---

# AccountInfoManager API 参考手册

## 概述

AccountInfoManager 是用于管理账户信息的类。
提供用户账户的添加、获取、更新、删除以及角色管理、属性管理等API。

- 添加或更新密码时不进行密码字符校验（请使用 `PasswordHistoryManager`）
- 当使用基于哈希的密码存储时，`getAccountInfo` 的密码字段返回 `null`

## 构造函数

```javascript
let manager = new AccountInfoManager();
```

## 方法列表

### 账户信息

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `addAccountInfo(accountInfo)` | ResultObject | 新建账户 |
| `getAccountInfo(userCd)` | ResultObject | 通过用户编码获取账户 |
| `getAccountInfos()` | ResultObject | 获取所有账户 |
| `getAccountInfos(start, count)` | ResultObject | 分页获取账户 |
| `getAccountInfosByUserCds(userCds)` | ResultObject | 通过多个用户编码获取账户 |
| `updateAccountInfo(accountInfo)` | ResultObject | 更新账户信息 |
| `deleteAccountInfo(userCd)` | ResultObject | 删除账户 |
| `deleteAccountInfos()` | ResultObject | 删除所有账户 |
| `contains(userCd)` | ResultObject | 确认账户是否存在 |
| `getAccountInfoCount()` | ResultObject | 获取账户总数 |
| `searchAccountInfos(userCd)` | ResultObject | 通过用户编码模式搜索 |
| `searchAccountInfos(userCd, start, count)` | ResultObject | 带分页的模式搜索 |

### 角色管理

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `getAccountRoleIds(userCd)` | ResultObject | 获取已分配的角色ID |
| `getAccountRoleIds(userCd, date)` | ResultObject | 获取指定日期有效的角色ID |
| `getAccountRoleIdsRecursively(userCd, date)` | ResultObject | 获取包含子角色的有效角色ID |
| `getAccountRoleInfos(userCd)` | ResultObject | 获取角色信息 |
| `getAccountRoleInfos(userCd, date)` | ResultObject | 获取指定日期有效的角色信息 |
| `addAccountRoleInfo(userCd, roleInfo)` | ResultObject | 分配角色 |
| `updateAccountRoleInfo(userCd, roleInfo)` | ResultObject | 更新角色分配 |
| `deleteAccountRoleInfo(userCd, roleId)` | ResultObject | 删除角色 |
| `deleteAccountRoleInfos(userCd)` | ResultObject | 删除所有角色 |

### 用户编码获取

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `getUserCds()` | ResultObject | 获取所有用户编码 |
| `getUserCdsByRoleId(roleId, date)` | ResultObject | 获取在指定日期拥有有效角色的用户编码 |
| `getUserCdsByAccountRoleId(roleId)` | ResultObject | 获取直接拥有角色的用户编码 |
| `getUserCdsByAttribute(key, value)` | ResultObject | 通过属性获取用户编码 |

### 属性管理

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| `getAttribute(userCd, name)` | ResultObject | 获取属性值 |
| `getAttribute(userCd, name, def)` | ResultObject | 获取属性值（带默认值） |
| `getAttributeNames(userCd)` | ResultObject | 获取所有属性名 |
| `setAttribute(userCd, name, value)` | ResultObject | 设置或更新属性 |
| `deleteAttribute(userCd, name)` | ResultObject | 删除属性 |
| `deleteAttributes(userCd)` | ResultObject | 删除所有属性 |

## 账户信息操作

### addAccountInfo(accountInfo)

新建账户。

```javascript
let manager = new AccountInfoManager();
let accountInfo = new AccountInfo();
accountInfo.userCd = 'user001';
let result = manager.addAccountInfo(accountInfo);
```

### getAccountInfo(userCd)

通过用户编码获取账户信息。
使用基于哈希的密码存储时，密码字段返回 `null`。

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountInfo('user001');
if (result.isSuccessful()) {
    let account = result.data;
}
```

### getAccountInfos(start, count)

分页获取账户信息。

```javascript
let manager = new AccountInfoManager();

// 获取全部
let result = manager.getAccountInfos();

// 分页获取（从第0行获取20条）
let result = manager.getAccountInfos(0, 20);
```

### updateAccountInfo(accountInfo)

更新账户信息。如果密码字段为 `null`，则跳过密码更新。

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountInfo('user001');
let accountInfo = result.data;
accountInfo.displayName = '新显示名称';
manager.updateAccountInfo(accountInfo);
```

### searchAccountInfos(userCd)

通过用户编码模式搜索账户。
支持通配符 `*`（0个或多个字符）和 `?`（1个字符）。

```javascript
let manager = new AccountInfoManager();

// 模式搜索
let result = manager.searchAccountInfos('user*');

// 带分页的模式搜索（从第0行获取20条）
let result = manager.searchAccountInfos('user*', 0, 20);
```

## 角色操作

### getAccountRoleIds(userCd, date)

获取指定日期有效的角色ID。
有效条件：`role_start_date <= date < role_end_date`

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountRoleIds('user001', new Date());
let roleIds = result.data; // 角色ID数组
```

### getAccountRoleIdsRecursively(userCd, date)

获取包含子角色的、在指定日期有效的所有角色ID。

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountRoleIdsRecursively('user001', new Date());
let roleIds = result.data;
```

### getUserCdsByRoleId(roleId, date)

获取在指定日期拥有有效角色的所有用户编码。包含父角色层级。

```javascript
let manager = new AccountInfoManager();
let result = manager.getUserCdsByRoleId('ADMIN_ROLE', new Date());
let userCds = result.data;
```

## 属性操作

### setAttribute(userCd, name, value)

设置或更新属性。若不存在则新建。
`userCd`、`name`、`value` 均不能指定为 `null` 或空字符串。

```javascript
let manager = new AccountInfoManager();
manager.setAttribute('user001', 'department', 'sales');
```

### getAttribute(userCd, name)

获取属性值。

```javascript
let manager = new AccountInfoManager();
let result = manager.getAttribute('user001', 'department');
let value = result.data;
```

### getUserCdsByAttribute(key, value)

获取与指定属性条件匹配的用户编码。

```javascript
let manager = new AccountInfoManager();
let result = manager.getUserCdsByAttribute('department', 'sales');
let userCds = result.data;
```
