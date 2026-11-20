---
paths:
  - "src/main/tssp/**/*.ts"
---

# RoleInfoManager API リファレンス

## 概要

RoleInfoManager は、ロール情報を管理するクラスである。
ロールの CRUD 操作、カテゴリ管理、ロール階層（親子関係）管理の API を提供する。

## コンストラクタ

```typescript
let manager = new RoleInfoManager();
```

## メソッド一覧

### ロール情報管理

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `addRoleInfo(roleInfo)` | ResultObject | ロールを新規登録 |
| `updateRoleInfo(roleInfo)` | ResultObject | ロール情報を更新 |
| `deleteRoleInfo(roleId)` | ResultObject | ロールを削除 |
| `deleteRoleInfos()` | ResultObject | すべてのロールを削除 |
| `getRoleInfo(roleId)` | ResultObject | ロール情報を取得 |
| `getRoleInfos()` | ResultObject | すべてのロール情報を取得 |
| `getRoleInfosByRoleIds(roleIds)` | ResultObject | 複数ロールID でロール情報を取得 |
| `contains(roleId)` | ResultObject | ロールの存在確認 |
| `getRoleInfoCount()` | ResultObject | ロール総数を取得 |

### ロール検索

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `searchRoleInfosByRoleId(roleId)` | ResultObject | ロールID のパターンで検索 |
| `searchRoleInfosByRoleName(roleName)` | ResultObject | ロール名のパターンで検索 |
| `searchRoleInfosByCategoryAndRoleName(category, roleName, locale, limit, offset, sortIndex, sortOrder)` | ResultObject | カテゴリ・ロール名で検索（ページング・ソート付き） |
| `containsRoleName(roleName)` | ResultObject | ロール名の存在確認 |
| `containsRoleName(roleName, exceptRoleId)` | ResultObject | 指定ロールを除いてロール名の存在確認 |

ワイルドカード: `*`（0文字以上）、`?`（1文字）が使用可能。

### カテゴリ管理

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getCategories()` | ResultObject | すべてのカテゴリを取得 |
| `getRoleInfosByCategory(category)` | ResultObject | カテゴリ内のロールを取得 |
| `getRoleInfoCountByCategory(category)` | ResultObject | カテゴリ内のロール数を取得 |
| `getRoleInfoCountByCategoryAndRoleName(category, roleName, locale)` | ResultObject | カテゴリ・ロール名に一致するロール数を取得 |
| `containsCategory(category)` | ResultObject | カテゴリの存在確認 |
| `deleteCategory(category)` | ResultObject | カテゴリを削除 |
| `deleteCategories()` | ResultObject | すべてのカテゴリを削除 |
| `moveCategory(oldCategory, newCategory)` | ResultObject | カテゴリ名を変更 |

### ロール階層管理

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `addSubRoleInfo(roleId, subRoleId)` | ResultObject | サブロール関係を追加 |
| `deleteSubRoleInfo(roleId, subRoleId)` | ResultObject | サブロール関係を削除 |
| `deleteSubRoleInfos(roleId)` | ResultObject | すべてのサブロール関係を削除 |
| `getSubRoleIds(roleId)` | ResultObject | 直下のサブロールID を取得 |
| `getAllSubRoleIds(roleId)` | ResultObject | 全階層のサブロールID を取得 |
| `getParentRoleIds(roleId)` | ResultObject | 直上の親ロールID を取得 |
| `getAllParentRoleIds(roleId)` | ResultObject | 全階層の親ロールID を取得 |
| `certify(nestRoleIds, roleIds)` | ResultObject | ロール包含関係を検証 |

### その他

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `isUpdate(date)` | ResultObject | 指定日以降にロールが更新されたか判定 |

## ロール情報の操作例

### ロールの取得

```typescript
let manager = new RoleInfoManager();
let result = manager.getRoleInfo('ADMIN_ROLE');
if (!result.error) {
  let roleInfo = result.data;
}
```

### ロールの検索

```typescript
let manager = new RoleInfoManager();

// ロールIDのパターンで検索
let result = manager.searchRoleInfosByRoleId('ADMIN*');

// カテゴリ・ロール名で検索（ページング・ソート付き）
let pagedResult = manager.searchRoleInfosByCategoryAndRoleName(
  'system',   // category
  '管理*',    // roleName
  'ja',       // locale
  20,         // limit
  0,          // offset
  'role_name', // sortIndex: category / role_name / display_name
  'ASC'       // sortOrder
);
```

## ロール階層の操作例

### サブロールの追加・取得

```typescript
let manager = new RoleInfoManager();

// サブロール関係を追加
manager.addSubRoleInfo('PARENT_ROLE', 'CHILD_ROLE');

// 直下のサブロールを取得
let subResult = manager.getSubRoleIds('PARENT_ROLE');
if (!subResult.error) {
  let subRoleIds = subResult.data;
}

// 全階層のサブロールを取得
let allSubResult = manager.getAllSubRoleIds('PARENT_ROLE');
if (!allSubResult.error) {
  let allSubRoleIds = allSubResult.data;
}
```

### 親ロールの取得

```typescript
let manager = new RoleInfoManager();

// 直上の親ロールを取得
let parentResult = manager.getParentRoleIds('CHILD_ROLE');
if (!parentResult.error) {
  let parentRoleIds = parentResult.data;
}

// 全階層の親ロールを取得
let allParentResult = manager.getAllParentRoleIds('CHILD_ROLE');
if (!allParentResult.error) {
  let allParentRoleIds = allParentResult.data;
}
```

## カテゴリの操作例

```typescript
let manager = new RoleInfoManager();

// すべてのカテゴリを取得
let categoryResult = manager.getCategories();
if (!categoryResult.error) {
  let categories = categoryResult.data;
}

// カテゴリ内のロールを取得
let roleResult = manager.getRoleInfosByCategory('system');
if (!roleResult.error) {
  let roleInfos = roleResult.data;
}

// カテゴリ名を変更
manager.moveCategory('old_category', 'new_category');
```
