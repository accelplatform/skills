---
paths:
  - "src/main/jssp/**/*.js"
---

# AccountInfoManager API リファレンス

## 概要

AccountInfoManager は、アカウント情報の管理を行うクラスである。
ユーザアカウントの追加・取得・更新・削除、ロール管理、属性管理の API を提供する。

- パスワード追加・更新時にパスワード文字のバリデーションは行わない（`PasswordHistoryManager` を使用すること）
- ハッシュベースのパスワード保存を使用している場合、`getAccountInfo` のパスワードフィールドは `null` を返却する

## コンストラクタ

```javascript
let manager = new AccountInfoManager();
```

## メソッド一覧

### アカウント情報

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `addAccountInfo(accountInfo)` | ResultObject | アカウントを新規作成 |
| `getAccountInfo(userCd)` | ResultObject | ユーザコードでアカウントを取得 |
| `getAccountInfos()` | ResultObject | すべてのアカウントを取得 |
| `getAccountInfos(start, count)` | ResultObject | ページング付きでアカウントを取得 |
| `getAccountInfosByUserCds(userCds)` | ResultObject | 複数ユーザコードでアカウントを取得 |
| `updateAccountInfo(accountInfo)` | ResultObject | アカウント情報を更新 |
| `deleteAccountInfo(userCd)` | ResultObject | アカウントを削除 |
| `deleteAccountInfos()` | ResultObject | すべてのアカウントを削除 |
| `contains(userCd)` | ResultObject | アカウントの存在確認 |
| `getAccountInfoCount()` | ResultObject | アカウント総数を取得 |
| `searchAccountInfos(userCd)` | ResultObject | ユーザコードのパターンで検索 |
| `searchAccountInfos(userCd, start, count)` | ResultObject | ページング付きパターン検索 |

### ロール管理

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getAccountRoleIds(userCd)` | ResultObject | 割当済みロールID を取得 |
| `getAccountRoleIds(userCd, date)` | ResultObject | 指定日時点で有効なロールID を取得 |
| `getAccountRoleIdsRecursively(userCd, date)` | ResultObject | サブロールを含む有効なロールID を取得 |
| `getAccountRoleInfos(userCd)` | ResultObject | ロール情報を取得 |
| `getAccountRoleInfos(userCd, date)` | ResultObject | 指定日時点で有効なロール情報を取得 |
| `addAccountRoleInfo(userCd, roleInfo)` | ResultObject | ロールを割り当て |
| `updateAccountRoleInfo(userCd, roleInfo)` | ResultObject | ロール割り当てを更新 |
| `deleteAccountRoleInfo(userCd, roleId)` | ResultObject | ロールを削除 |
| `deleteAccountRoleInfos(userCd)` | ResultObject | すべてのロールを削除 |

### ユーザコード取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getUserCds()` | ResultObject | すべてのユーザコードを取得 |
| `getUserCdsByRoleId(roleId, date)` | ResultObject | 指定日に有効なロールを持つユーザコードを取得 |
| `getUserCdsByAccountRoleId(roleId)` | ResultObject | 直接ロールを持つユーザコードを取得 |
| `getUserCdsByAttribute(key, value)` | ResultObject | 属性でユーザコードを取得 |

### 属性管理

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getAttribute(userCd, name)` | ResultObject | 属性値を取得 |
| `getAttribute(userCd, name, def)` | ResultObject | 属性値を取得（デフォルト値付き） |
| `getAttributeNames(userCd)` | ResultObject | すべての属性名を取得 |
| `setAttribute(userCd, name, value)` | ResultObject | 属性を設定・更新 |
| `deleteAttribute(userCd, name)` | ResultObject | 属性を削除 |
| `deleteAttributes(userCd)` | ResultObject | すべての属性を削除 |

## アカウント情報の操作

### addAccountInfo(accountInfo)

アカウントを新規作成する。

```javascript
let manager = new AccountInfoManager();
let accountInfo = new AccountInfo();
accountInfo.userCd = 'user001';
let result = manager.addAccountInfo(accountInfo);
```

### getAccountInfo(userCd)

ユーザコードでアカウント情報を取得する。
ハッシュベースのパスワード保存時、パスワードフィールドは `null` を返却する。

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountInfo('user001');
if (result.isSuccessful()) {
    let account = result.data;
}
```

### getAccountInfos(start, count)

ページング付きでアカウント情報を取得する。

```javascript
let manager = new AccountInfoManager();

// すべて取得
let result = manager.getAccountInfos();

// ページング取得（0行目から20件）
let result = manager.getAccountInfos(0, 20);
```

### updateAccountInfo(accountInfo)

アカウント情報を更新する。パスワードフィールドが `null` の場合、パスワードの更新はスキップされる。

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountInfo('user001');
let accountInfo = result.data;
accountInfo.displayName = '新しい表示名';
manager.updateAccountInfo(accountInfo);
```

### searchAccountInfos(userCd)

ユーザコードのパターンでアカウントを検索する。
ワイルドカード `*`（0文字以上）、`?`（1文字）が使用可能。

```javascript
let manager = new AccountInfoManager();

// パターン検索
let result = manager.searchAccountInfos('user*');

// ページング付き検索（0行目から20件）
let result = manager.searchAccountInfos('user*', 0, 20);
```

## ロールの操作

### getAccountRoleIds(userCd, date)

指定日時点で有効なロールID を取得する。
有効条件: `role_start_date <= date < role_end_date`

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountRoleIds('user001', new Date());
let roleIds = result.data; // ロールID配列
```

### getAccountRoleIdsRecursively(userCd, date)

サブロールを含む、指定日時点で有効なすべてのロールID を取得する。

```javascript
let manager = new AccountInfoManager();
let result = manager.getAccountRoleIdsRecursively('user001', new Date());
let roleIds = result.data;
```

### getUserCdsByRoleId(roleId, date)

指定日に有効なロールを持つすべてのユーザコードを取得する。親ロール階層も含む。

```javascript
let manager = new AccountInfoManager();
let result = manager.getUserCdsByRoleId('ADMIN_ROLE', new Date());
let userCds = result.data;
```

## 属性の操作

### setAttribute(userCd, name, value)

属性を設定・更新する。存在しない場合は新規作成される。
`userCd`、`name`、`value` はいずれも `null` や空文字を指定できない。

```javascript
let manager = new AccountInfoManager();
manager.setAttribute('user001', 'department', 'sales');
```

### getAttribute(userCd, name)

属性値を取得する。

```javascript
let manager = new AccountInfoManager();
let result = manager.getAttribute('user001', 'department');
let value = result.data;
```

### getUserCdsByAttribute(key, value)

指定した属性条件に一致するユーザコードを取得する。

```javascript
let manager = new AccountInfoManager();
let result = manager.getUserCdsByAttribute('department', 'sales');
let userCds = result.data;
```
