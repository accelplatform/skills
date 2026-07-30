# AccountContext API リファレンス

## 概要

AccountContext は、アクセスしたアカウントに関する情報を保持する必須のアクセスコンテキストである。
ユーザコードやロケールなどのアカウント情報、認証状況などを取得できる。

- 認証済みかどうかの判定
- 認証済みであれば、ログインしたユーザの情報（ユーザコード、保有ロールなど）

### 取得方法

```javascript
let accountContext = Contexts.getAccountContext();
```

## プロパティ一覧

| プロパティ | 型 | 説明 | 備考 |
|-----------|------|------|------|
| applicationLicenses | Array(String) | アプリケーションライセンスの一覧 | |
| authenticated | Boolean | 認証状況。ログイン済みの場合 `true` | |
| calendarId | String | カレンダーID | |
| dateTimeFormats | DateTimeFormats | 日時表示形式一覧 | SystemDateTimeFormat#getFormats 参照 |
| decimalFormatId | String | 数値形式のフォーマットID | 8.0.15 以降 |
| encoding | String | 文字エンコーディング | |
| firstDayOfWeek | Number | 週の開始曜日（0:日曜 〜 6:土曜） | |
| homeUrl | String | ホームURL | |
| locale | String | ロケール | |
| loginGroupId | String | ログイングループID（非推奨。テナントID と同一値） | 互換用API内部でのみ利用 |
| loginTime | Date | ログイン時間。未ログイン時は `null` | |
| roleIds | Array(String) | ロールIDの一覧（サブロール含む） | |
| signature | String | ログイン署名。未ログイン時は `null` | |
| tenantId | String | テナントID | 8.0.7 以降 |
| themeId | String | テーマID | |
| timeZone | TimeZone | タイムゾーン | |
| userCd | String | ユーザID | |
| userType | `"administrator"` または `"user"` | ユーザ種別 | |

## 設定値の解決順序

各設定値は以下の順序で参照される。

1. アカウント設定情報
2. テナントのアカウント設定情報
3. ブラウザ情報
4. システムデフォルトのアカウント設定情報
5. サーバ環境設定情報

## 使用例

### ログインユーザ情報の取得

```javascript
function getAccountContext() {
  let accountContext = Contexts.getAccountContext();

  return {
    authenticated: accountContext.authenticated,
    userCd: accountContext.userCd,
    locale: accountContext.locale,
    tenantId: accountContext.tenantId,
    timeZone: accountContext.timeZone,
    userType: accountContext.userType,
    roleIds: accountContext.roleIds
  };
}
```

### 認証済み判定

```javascript
function isAuthenticated() {
  let accountContext = Contexts.getAccountContext();
  return accountContext.authenticated;
}
```

### ロール判定

```javascript
function hasRole(targetRoleId) {
  let accountContext = Contexts.getAccountContext();
  let roleIds = accountContext.roleIds;

  for (let i = 0; i < roleIds.length; i++) {
    if (roleIds[i] === targetRoleId) {
      return true;
    }
  }
  return false;
}
```

### システム管理者判定

```javascript
function isAdministrator() {
  let accountContext = Contexts.getAccountContext();
  return accountContext.userType === 'administrator';
}
```
