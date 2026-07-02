# Web API リファレンス

## 概要

Web は、Webサーバおよび HTTP リクエスト/レスポンスに関するユーティリティを提供するオブジェクトである。
static メソッドのみで構成されており、インスタンス化せずに直接利用できる。

## メソッド一覧

### URL・サーバ情報

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| base() | String | `http://server:port/path` 形式のベースURLを取得（`server-context-config.xml` の設定値） |
| location() | String | リクエストURLを取得 |
| host() | String | Webサーバ名を取得 |
| port() | Number | HTTPリスニングポート番号を取得 |
| protocol() | String | Webサーバプロトコルを取得 |
| script() | String | Webスクリプトファイル名を取得 |
| current() | String | 現在処理中のページパスを取得 |
| referer() | String | リクエスト元のページパスを取得 |

### HTTPリクエスト情報

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getScheme() | String | リクエストスキーム（`http`, `https`, `ftp`）を取得 |
| getServerName() | String | リクエストを受信したサーバのホスト名を取得 |
| getServerPort() | Number | リクエストを処理しているポート番号を取得 |
| getRemoteAddr() | String | クライアントのIPアドレスを取得 |
| getRemoteHost() | String | クライアントのFQDNまたはIPアドレスを取得 |
| getProtocol() | String | プロトコルバージョン（例: `HTTP/1.1`）を取得 |
| getContextPath() | String | URIのコンテキストパス部分を取得 |
| isSecure() | Boolean | HTTPSまたはセキュアチャネルかどうかを判定 |

### リクエスト・レスポンスオブジェクト

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getRequest() | Request | リクエストオブジェクトを取得 |
| getHTTPResponse() | HTTPResponse | レスポンスオブジェクトを取得 |

### URLエンコード

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| encodeURL(url) | String | セッションIDを含むようにURLをエンコード |
| encodeRedirectURL(url) | String | リダイレクト用にURLをエンコード |

### HTTPヘッダ・環境変数

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| setHTTPResponseHeader(name, value) | void | HTTPレスポンスヘッダを設定 |
| getenv(ref_name) | String | CGI環境変数を取得。存在しない場合は `null` |

## 使用例

### コンテキストパスの取得

```javascript
let contextPath = Web.getContextPath();
// 例: "/imart"
```

### ベースURLの取得

```javascript
let baseUrl = Web.base();
// 例: "http://127.0.0.1/imart"
```

### リクエスト情報の取得

```javascript
let scheme = Web.getScheme();       // "https"
let host = Web.getServerName();     // "example.com"
let port = Web.getServerPort();     // 443
let secure = Web.isSecure();        // true
let clientIp = Web.getRemoteAddr(); // "192.168.1.100"
```

### HTTPレスポンスヘッダの設定

```javascript
Web.setHTTPResponseHeader('Cache-Control', 'no-cache');
Web.setHTTPResponseHeader('X-Content-Type-Options', 'nosniff');
```

### リクエスト・レスポンスオブジェクトの取得

```javascript
let request = Web.getRequest();
let response = Web.getHTTPResponse();
```

### URLエンコード

```javascript
let url = Web.encodeURL('/imart/next_page.jssp');
let redirectUrl = Web.encodeRedirectURL('/imart/login.jssp');
```
