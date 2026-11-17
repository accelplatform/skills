---
paths:
  - "src/main/tssp/**/*.ts"
---

# AccountInfoManager API 参考手册

## 概述

AccountInfoManager 是用于管理账户信息的类。
提供用户账户的添加、获取、更新、删除以及角色管理、属性管理等API。

- 添加或更新密码时不进行密码字符校验（请使用 `PasswordHistoryManager`）
- 当使用基于哈希的密码存储时，`getAccountInfo` 的密码字段返回 `null`

## 构造函数

```typescript
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

返回值 `ResultObject` 在 d.ts 中被声明为以 `error` 为判别属性的联合类型。只有确认 `result.error` 为 `false` 之后，`result.data` 才会成为各方法对应的类型（`AccountInfo`、`string[]` 等）；不确认就读取则为 `unknown`。以下示例均先确认 `result.error`，再读取 `result.data`。

## 账户信息操作

### addAccountInfo(accountInfo)

新建账户。
账户信息使用对象字面量创建（d.ts 中的 `AccountInfo` 只有类型声明（`interface` 和仅含类型的 `namespace`），没有值，因此 `new AccountInfo()` 会在 `tssp build` 的类型检查中出现 TS2708）。d.ts 将 `password`、`dateTimeFormats`、`validStartDate`、`lockDate` 等 13 个属性全部声明为必填。以下示例使用 `as AccountInfo`，只是为了让指定了部分属性的输入符合这个 d.ts 的声明。`as` 会向类型检查隐瞒必填属性的缺失，因此除此处以外的 API 不得为消除类型错误而使用它。

```typescript
let manager = new AccountInfoManager();
let accountInfo = { userCd: 'user001' } as AccountInfo;
let result = manager.addAccountInfo(accountInfo);
```

### getAccountInfo(userCd)

通过用户编码获取账户信息。
使用基于哈希的密码存储时，密码字段返回 `null`。

```typescript
let manager = new AccountInfoManager();
let result = manager.getAccountInfo('user001');
// 为应对账户不存在的情况，同时检查 data
if (!result.error && result.data) {
  let account = result.data;
}
```

### getAccountInfos(start, count)

分页获取账户信息。

```typescript
let manager = new AccountInfoManager();

// 获取全部
let result = manager.getAccountInfos();

// 分页获取（从第0行获取20条）
let pagedResult = manager.getAccountInfos(0, 20);
```

### updateAccountInfo(accountInfo)

更新账户信息。如果密码字段为 `null`，则跳过密码更新。

```typescript
let manager = new AccountInfoManager();
let result = manager.getAccountInfo('user001');
// 为应对账户不存在的情况，同时检查 data
if (!result.error && result.data) {
  let accountInfo = result.data;
  accountInfo.locale = 'en';
  manager.updateAccountInfo(accountInfo);
}
```

### searchAccountInfos(userCd)

通过用户编码模式搜索账户。
支持通配符 `*`（0个或多个字符）和 `?`（1个字符）。

```typescript
let manager = new AccountInfoManager();

// 模式搜索
let result = manager.searchAccountInfos('user*');

// 带分页的模式搜索（从第0行获取20条）
let pagedResult = manager.searchAccountInfos('user*', 0, 20);
```

## 角色操作

### getAccountRoleIds(userCd, date)

获取指定日期有效的角色ID。
有效条件：`role_start_date <= date < role_end_date`

```typescript
let manager = new AccountInfoManager();
let result = manager.getAccountRoleIds('user001', new Date());
if (!result.error) {
  let roleIds = result.data; // 角色ID数组
}
```

### getAccountRoleIdsRecursively(userCd, date)

获取包含子角色的、在指定日期有效的所有角色ID。

```typescript
let manager = new AccountInfoManager();
let result = manager.getAccountRoleIdsRecursively('user001', new Date());
if (!result.error) {
  let roleIds = result.data;
}
```

### getUserCdsByRoleId(roleId, date)

获取在指定日期拥有有效角色的所有用户编码。包含父角色层级。

```typescript
let manager = new AccountInfoManager();
let result = manager.getUserCdsByRoleId('ADMIN_ROLE', new Date());
if (!result.error) {
  let userCds = result.data;
}
```

## 属性操作

### setAttribute(userCd, name, value)

设置或更新属性。若不存在则新建。
`userCd`、`name`、`value` 均不能指定为 `null` 或空字符串。

```typescript
let manager = new AccountInfoManager();
manager.setAttribute('user001', 'department', 'sales');
```

### getAttribute(userCd, name)

获取属性值。

```typescript
let manager = new AccountInfoManager();
let result = manager.getAttribute('user001', 'department');
if (!result.error) {
  let value = result.data;
}
```

### getUserCdsByAttribute(key, value)

获取与指定属性条件匹配的用户编码。

```typescript
let manager = new AccountInfoManager();
let result = manager.getUserCdsByAttribute('department', 'sales');
if (!result.error) {
  let userCds = result.data;
}
```
