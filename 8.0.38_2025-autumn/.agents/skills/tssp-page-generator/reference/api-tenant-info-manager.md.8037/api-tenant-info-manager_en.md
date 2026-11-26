# TenantInfoManager API Reference

## Overview

TenantInfoManager is a class that manages tenant information.
It provides APIs for retrieving, registering, updating, and deleting tenant information.

## Constructor

```typescript
let manager = new TenantInfoManager();
```

## Method List

| Method | Return Value | Description |
|--------|-------------|-------------|
| `getTenantInfo()` | ResultObject | Get tenant information |
| `getTenantInfo(isFill)` | ResultObject | Get tenant information (supplement unset items with default values) |
| `getTenantInfo(tenantId)` | ResultObject | Get tenant information for the specified tenant ID |
| `getTenantInfo(tenantId, isFill)` | ResultObject | Get tenant information for the specified tenant ID (with supplementation) |
| `getTenantIds()` | ResultObject | Get all tenant IDs |
| `getDefaultTenantId()` | ResultObject | Get the default tenant ID |
| `exists(tenantId)` | ResultObject | Check if a tenant exists |
| `insertTenantInfo(tenantInfo)` | ResultObject | Register new tenant information |
| `updateTenantInfo(tenantInfo)` | ResultObject | Update tenant information |
| `deleteTenantInfo(tenantId)` | ResultObject | Delete tenant information |

## getTenantInfo()

Gets tenant information. Returns `null` for unset items.

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo();
if (!result.error) {
  let tenantInfo = result.data;
}
```

### getTenantInfo(isFill)

Specifying `true` for `isFill` supplements unset items with system default values.

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo(true);
if (!result.error) {
  let tenantInfo = result.data;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `isFill` | Boolean | `true` to supplement unset items with default values |

### getTenantInfo(tenantId)

Gets tenant information for the specified tenant ID.

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo('tenant01');
if (!result.error) {
  let tenantInfo = result.data;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tenantId` | String | Tenant ID |

### getTenantInfo(tenantId, isFill)

Gets tenant information for the specified tenant ID (with supplementation).

| Parameter | Type | Description |
|-----------|------|-------------|
| `tenantId` | String | Tenant ID |
| `isFill` | Boolean | `true` to supplement unset items with default values |

## getTenantIds()

Gets all tenant IDs.
`ResultObject.data` contains a string array of tenant IDs.

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantIds();
if (!result.error) {
  let tenantIds = result.data;
}
```

## getDefaultTenantId()

Gets the default tenant ID.

```typescript
let manager = new TenantInfoManager();
let result = manager.getDefaultTenantId();
if (!result.error) {
  let defaultId = result.data;
}
```

## exists(tenantId)

Checks if a tenant exists.
`ResultObject.data` contains `true` (exists) or `false` (does not exist).

```typescript
let manager = new TenantInfoManager();
let result = manager.exists('tenant01');
if (result.data) {
  // Tenant exists
}
```

## insertTenantInfo(tenantInfo)

Registers new tenant information.

The d.ts declares `TenantInfo` as an `interface` with no constructor declared, so `new TenantInfo()` causes TS2693 in the `tssp build` type checking. Pass an object that has all properties of the d.ts `TenantInfo`.

```typescript
function insertTenant(tenantInfo: TenantInfo): boolean {
  let manager = new TenantInfoManager();
  let result = manager.insertTenantInfo(tenantInfo);
  return !result.error;
}
```

## updateTenantInfo(tenantInfo)

Updates tenant information.

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

Deletes tenant information.

```typescript
let manager = new TenantInfoManager();
manager.deleteTenantInfo('tenant01');
```
