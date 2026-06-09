---
paths:
  - "src/main/jssp/**/*.js"
---

# TenantInfoManager API Reference

## Overview

TenantInfoManager is a class that manages tenant information.
It provides APIs for retrieving, registering, updating, and deleting tenant information.

## Constructor

```javascript
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

```javascript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo();
let tenantInfo = result.data;
```

### getTenantInfo(isFill)

Specifying `true` for `isFill` supplements unset items with system default values.

```javascript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo(true);
let tenantInfo = result.data;
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `isFill` | Boolean | `true` to supplement unset items with default values |

### getTenantInfo(tenantId)

Gets tenant information for the specified tenant ID.

```javascript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo('tenant01');
let tenantInfo = result.data;
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

```javascript
let manager = new TenantInfoManager();
let result = manager.getTenantIds();
let tenantIds = result.data;
```

## getDefaultTenantId()

Gets the default tenant ID.

```javascript
let manager = new TenantInfoManager();
let result = manager.getDefaultTenantId();
let defaultId = result.data;
```

## exists(tenantId)

Checks if a tenant exists.
`ResultObject.data` contains `true` (exists) or `false` (does not exist).

```javascript
let manager = new TenantInfoManager();
let result = manager.exists('tenant01');
if (result.data) {
    // Tenant exists
}
```

## insertTenantInfo(tenantInfo)

Registers new tenant information.

```javascript
let manager = new TenantInfoManager();
let tenantInfo = new TenantInfo();
tenantInfo.tenantId = 'tenant01';
manager.insertTenantInfo(tenantInfo);
```

## updateTenantInfo(tenantInfo)

Updates tenant information.

```javascript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo();
let tenantInfo = result.data;
tenantInfo.displayName = 'New Tenant Name';
manager.updateTenantInfo(tenantInfo);
```

## deleteTenantInfo(tenantId)

Deletes tenant information.

```javascript
let manager = new TenantInfoManager();
manager.deleteTenantInfo('tenant01');
```
