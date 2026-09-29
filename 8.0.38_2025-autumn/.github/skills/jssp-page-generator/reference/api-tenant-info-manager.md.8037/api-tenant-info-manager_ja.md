---
paths:
  - "src/main/jssp/**/*.js"
---

# TenantInfoManager API リファレンス

## 概要

TenantInfoManager は、テナント情報を管理するクラスである。
テナント情報の取得・登録・更新・削除の API を提供する。

## コンストラクタ

```javascript
let manager = new TenantInfoManager();
```

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getTenantInfo()` | ResultObject | テナント情報を取得 |
| `getTenantInfo(isFill)` | ResultObject | テナント情報を取得（未設定項目をデフォルト値で補完） |
| `getTenantInfo(tenantId)` | ResultObject | 指定テナントID のテナント情報を取得 |
| `getTenantInfo(tenantId, isFill)` | ResultObject | 指定テナントID のテナント情報を取得（補完付き） |
| `getTenantIds()` | ResultObject | すべてのテナントID を取得 |
| `getDefaultTenantId()` | ResultObject | デフォルトテナントID を取得 |
| `exists(tenantId)` | ResultObject | テナントの存在確認 |
| `insertTenantInfo(tenantInfo)` | ResultObject | テナント情報を新規登録 |
| `updateTenantInfo(tenantInfo)` | ResultObject | テナント情報を更新 |
| `deleteTenantInfo(tenantId)` | ResultObject | テナント情報を削除 |

## getTenantInfo()

テナント情報を取得する。未設定の項目は `null` を返却する。

```javascript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo();
let tenantInfo = result.data;
```

### getTenantInfo(isFill)

`isFill` に `true` を指定すると、未設定の項目をシステムデフォルト値で補完する。

```javascript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo(true);
let tenantInfo = result.data;
```

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `isFill` | Boolean | `true` で未設定項目をデフォルト値で補完 |

### getTenantInfo(tenantId)

指定テナントID のテナント情報を取得する。

```javascript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo('tenant01');
let tenantInfo = result.data;
```

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `tenantId` | String | テナントID |

### getTenantInfo(tenantId, isFill)

指定テナントID のテナント情報を取得する（補完付き）。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `tenantId` | String | テナントID |
| `isFill` | Boolean | `true` で未設定項目をデフォルト値で補完 |

## getTenantIds()

すべてのテナントID を取得する。
`ResultObject.data` にテナントID の文字列配列が格納される。

```javascript
let manager = new TenantInfoManager();
let result = manager.getTenantIds();
let tenantIds = result.data;
```

## getDefaultTenantId()

デフォルトテナントID を取得する。

```javascript
let manager = new TenantInfoManager();
let result = manager.getDefaultTenantId();
let defaultId = result.data;
```

## exists(tenantId)

テナントの存在を確認する。
`ResultObject.data` に `true`（存在する）または `false`（存在しない）が格納される。

```javascript
let manager = new TenantInfoManager();
let result = manager.exists('tenant01');
if (result.data) {
  // テナントが存在する
}
```

## insertTenantInfo(tenantInfo)

テナント情報を新規登録する。

```javascript
let manager = new TenantInfoManager();
let tenantInfo = new TenantInfo();
tenantInfo.tenantId = 'tenant01';
manager.insertTenantInfo(tenantInfo);
```

## updateTenantInfo(tenantInfo)

テナント情報を更新する。

```javascript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo();
let tenantInfo = result.data;
tenantInfo.displayName = '新しいテナント名';
manager.updateTenantInfo(tenantInfo);
```

## deleteTenantInfo(tenantId)

テナント情報を削除する。

```javascript
let manager = new TenantInfoManager();
manager.deleteTenantInfo('tenant01');
```
