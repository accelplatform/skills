---
paths:
  - "src/main/tssp/**/*.ts"
---

# TenantInfoManager API 参考

## 概述

TenantInfoManager 是管理租户信息的类。
提供租户信息的获取、注册、更新、删除 API。

## 构造函数

```typescript
let manager = new TenantInfoManager();
```

## 方法列表

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `getTenantInfo()` | ResultObject | 获取租户信息 |
| `getTenantInfo(isFill)` | ResultObject | 获取租户信息（用默认值补全未设置项） |
| `getTenantInfo(tenantId)` | ResultObject | 获取指定租户ID的租户信息 |
| `getTenantInfo(tenantId, isFill)` | ResultObject | 获取指定租户ID的租户信息（带补全） |
| `getTenantIds()` | ResultObject | 获取所有租户ID |
| `getDefaultTenantId()` | ResultObject | 获取默认租户ID |
| `exists(tenantId)` | ResultObject | 确认租户是否存在 |
| `insertTenantInfo(tenantInfo)` | ResultObject | 新注册租户信息 |
| `updateTenantInfo(tenantInfo)` | ResultObject | 更新租户信息 |
| `deleteTenantInfo(tenantId)` | ResultObject | 删除租户信息 |

## getTenantInfo()

获取租户信息。未设置的项目返回 `null`。

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo();
if (!result.error) {
  let tenantInfo = result.data;
}
```

### getTenantInfo(isFill)

将 `isFill` 指定为 `true` 时，用系统默认值补全未设置的项目。

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo(true);
if (!result.error) {
  let tenantInfo = result.data;
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `isFill` | Boolean | `true` 时用默认值补全未设置项目 |

### getTenantInfo(tenantId)

获取指定租户ID的租户信息。

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo('tenant01');
if (!result.error) {
  let tenantInfo = result.data;
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `tenantId` | String | 租户ID |

### getTenantInfo(tenantId, isFill)

获取指定租户ID的租户信息（带补全）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `tenantId` | String | 租户ID |
| `isFill` | Boolean | `true` 时用默认值补全未设置项目 |

## getTenantIds()

获取所有租户ID。
`ResultObject.data` 中存储租户ID的字符串数组。

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantIds();
if (!result.error) {
  let tenantIds = result.data;
}
```

## getDefaultTenantId()

获取默认租户ID。

```typescript
let manager = new TenantInfoManager();
let result = manager.getDefaultTenantId();
if (!result.error) {
  let defaultId = result.data;
}
```

## exists(tenantId)

确认租户是否存在。
`ResultObject.data` 中存储 `true`（存在）或 `false`（不存在）。

```typescript
let manager = new TenantInfoManager();
let result = manager.exists('tenant01');
if (result.data) {
  // 租户存在
}
```

## insertTenantInfo(tenantInfo)

新注册租户信息。

d.ts 将 `TenantInfo` 声明为 `interface`，且没有声明构造函数，因此 `new TenantInfo()` 会在 `tssp build` 的类型检查中出现 TS2693。请传入具有 d.ts 中 `TenantInfo` 全部属性的对象。

```typescript
function insertTenant(tenantInfo: TenantInfo): boolean {
  let manager = new TenantInfoManager();
  let result = manager.insertTenantInfo(tenantInfo);
  return !result.error;
}
```

## updateTenantInfo(tenantInfo)

更新租户信息。

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo();
if (!result.error) {
  let tenantInfo = result.data;
  tenantInfo.emailAddress = 'admin@example.com';
  manager.updateTenantInfo(tenantInfo);
}
```

## deleteTenantInfo(tenantId)

删除租户信息。

```typescript
let manager = new TenantInfoManager();
manager.deleteTenantInfo('tenant01');
```
