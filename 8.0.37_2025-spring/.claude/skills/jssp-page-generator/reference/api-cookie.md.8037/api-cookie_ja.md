---
paths:
  - "src/main/jssp/**/*.js"
---

# Cookie API リファレンス

## 概要

Cookie は、クッキーを生成するための機能を提供するオブジェクトである。

## コンストラクタ

```javascript
let cookie = new Cookie(name, value);
```

| パラメータ | 型 | 説明 |
|-----------|------|------|
| name | String | クッキーの名前 |
| value | String | クッキーの値 |

## メソッド一覧

### ゲッター

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getComment() | String | コメント情報（未設定時は `null`） |
| getDomain() | String | ドメイン名 |
| getMaxAge() | Number | 有効期限（秒）。負数はブラウザ終了時に削除 |
| getName() | String | クッキー名 |
| getPath() | String | サーバ側のパス |
| getSecure() | Boolean | セキュアプロトコル限定か（`true` = HTTPS限定） |
| getValue() | String | クッキー値 |
| getVersion() | Number | プロトコルバージョン番号 |
| isHttpOnly() | Boolean | HTTP 通信限定か（`true` = JSからアクセス不可） |

### セッター

| メソッド | パラメータ | 説明 |
|---------|-----------|------|
| setComment(purpose) | purpose: String | コメントを設定 |
| setDomain(domain) | domain: String | 適用ドメインを指定 |
| setHttpOnly(isHttpOnly) | isHttpOnly: Boolean | HTTP 通信限定を設定（デフォルト `false`） |
| setMaxAge(expiry) | expiry: Number | 有効期間を秒で指定。`0` で削除、負数で保存なし |
| setPath(uri) | uri: String | クライアント返送対象パスを設定 |
| setSecure(isSecure) | isSecure: Boolean | セキュアプロトコルのみで送信するか設定 |
| setValue(newValue) | newValue: String | クッキー値を更新 |
| setVersion(version) | version: Number | プロトコルバージョンを指定 |

## 使用例

### クッキーの作成と設定

```javascript
let cookie = new Cookie('user_pref', 'dark_mode');
cookie.setMaxAge(60 * 60 * 24 * 30); // 30日間有効
cookie.setPath('/');
cookie.setHttpOnly(true);
cookie.setSecure(true);
```

### クッキーの削除

```javascript
let cookie = new Cookie('user_pref', '');
cookie.setMaxAge(0); // 即座に削除
cookie.setPath('/');
```
