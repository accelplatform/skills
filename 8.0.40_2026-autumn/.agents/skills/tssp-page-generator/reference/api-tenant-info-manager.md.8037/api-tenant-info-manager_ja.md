# TenantInfoManager API リファレンス

## 概要

TenantInfoManager は、テナント情報を管理するクラスである。
テナント情報の取得・登録・更新・削除の API を提供する。

## コンストラクタ

```typescript
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

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo();
if (!result.error) {
  let tenantInfo = result.data;
}
```

### getTenantInfo(isFill)

`isFill` に `true` を指定すると、未設定の項目をシステムデフォルト値で補完する。

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo(true);
if (!result.error) {
  let tenantInfo = result.data;
}
```

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `isFill` | Boolean | `true` で未設定項目をデフォルト値で補完 |

### getTenantInfo(tenantId)

指定テナントID のテナント情報を取得する。

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantInfo('tenant01');
if (!result.error) {
  let tenantInfo = result.data;
}
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

```typescript
let manager = new TenantInfoManager();
let result = manager.getTenantIds();
if (!result.error) {
  let tenantIds = result.data;
}
```

## getDefaultTenantId()

デフォルトテナントID を取得する。

```typescript
let manager = new TenantInfoManager();
let result = manager.getDefaultTenantId();
if (!result.error) {
  let defaultId = result.data;
}
```

## exists(tenantId)

テナントの存在を確認する。
`ResultObject.data` に `true`（存在する）または `false`（存在しない）が格納される。

```typescript
let manager = new TenantInfoManager();
let result = manager.exists('tenant01');
if (result.data) {
  // テナントが存在する
}
```

## insertTenantInfo(tenantInfo)

テナント情報を新規登録する。

`TenantInfo` は d.ts で `interface` として宣言されており、コンストラクタが宣言されていないため、`new TenantInfo()` は `tssp build` の型検査で TS2693 になる。d.ts の `TenantInfo` の全プロパティを持つオブジェクトを渡す。

```typescript
function insertTenant(tenantInfo: TenantInfo): boolean {
  let manager = new TenantInfoManager();
  let result = manager.insertTenantInfo(tenantInfo);
  return !result.error;
}
```

## updateTenantInfo(tenantInfo)

テナント情報を更新する。

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

テナント情報を削除する。

```typescript
let manager = new TenantInfoManager();
manager.deleteTenantInfo('tenant01');
```
