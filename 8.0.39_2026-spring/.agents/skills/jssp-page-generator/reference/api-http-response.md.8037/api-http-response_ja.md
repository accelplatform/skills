# HTTPResponse API リファレンス

## 概要

HTTPResponse は、クライアントへ応答を送信する際の処理を支援するオブジェクトである。
`Web.getHTTPResponse()` メソッドを通じて取得する。

### 取得方法

```javascript
let response = Web.getHTTPResponse();
```

## メソッド一覧

### レスポンス設定

| メソッド | 説明 |
|---------|------|
| setContentType(type) | Content-Type を設定 |
| setContentLength(len) | Content-Length を設定 |
| setStatus(sc) | ステータスコードを設定 |

### ヘッダ操作

| メソッド | 説明 |
|---------|------|
| setHeader(name, value) | レスポンスヘッダを設定（既存は上書き） |
| addHeader(name, value) | レスポンスヘッダを追加 |
| setDateHeader(name, date) | 日付ヘッダを設定（Date または ミリ秒） |
| addDateHeader(name, date) | 日付ヘッダを追加（Date または ミリ秒） |

### Cookie

| メソッド | 説明 |
|---------|------|
| addCookie(cookie) | Cookie オブジェクトをレスポンスに設定 |

### データ送信

| メソッド | 説明 |
|---------|------|
| sendMessageBody(strm) | データを送信 |
| sendMessageBodyString(str) | 文字コード自動変換でデータを送信 |
| sendMessageBodyFile(file, isDelete?) | ファイルを送信（isDelete: 送信後に削除するか。デフォルト `false`） |
| sendMessageBodyAsBinary(source) | Storage のデータをバイナリ形式で送信 |
| sendMessageBodyAsText(source, charsetName) | Storage のデータをテキスト形式で送信 |
| sendError(sc, msg?) | エラーレスポンスを送信。失敗時 `false` を返却 |

**注意**: `sendMessageBody*` メソッドは実行後 JavaScript の処理が中断される。try...catch 構文では使用不可。

## 使用例

### JSON レスポンスの返却

```javascript
let response = Web.getHTTPResponse();
response.setContentType('application/json; charset=utf-8');

let data = JSON.stringify({status: 'success', message: '登録完了'});
response.sendMessageBodyString(data);
```

### CSV ファイルのダウンロード

```javascript
let response = Web.getHTTPResponse();
response.setContentType('text/csv; charset=Shift_JIS');
response.setHeader('Content-Disposition', 'attachment; filename="data.csv"');

let csvData = '名前,年齢\nTanaka,30\nSuzuki,25';
response.sendMessageBodyString(csvData);
```

### ファイルのダウンロード

```javascript
let file = new File('path/to/file.pdf');
let response = Web.getHTTPResponse();
response.setContentType('application/pdf');
response.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
response.sendMessageBodyFile(file);
```

### Storage からのバイナリ送信

```javascript
let storage = new PublicStorage('path/to/file.xlsx');
let response = Web.getHTTPResponse();
response.setContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
response.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');
response.sendMessageBodyAsBinary(storage);
```

### エラーレスポンスの送信

```javascript
let response = Web.getHTTPResponse();
response.sendError(404, '指定されたリソースが見つかりません');
```

### Cookie の設定

```javascript
let response = Web.getHTTPResponse();
let cookie = new Cookie('session_key', 'abc123');
cookie.setMaxAge(60 * 60); // 1時間
cookie.setPath('/');
cookie.setHttpOnly(true);
response.addCookie(cookie);
```
