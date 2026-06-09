---
paths:
  - "src/main/jssp/**/*.js"
---

# Request オブジェクト リファレンス

## 概要

Request は、クライアントからのリクエスト情報を保持するオブジェクトである。
ブラウザからの要求があるたびに生成され、ファンクションコンテナの `init()` 関数やアクション用バインド関数の引数として渡される。

```javascript
function init(request) {
  // URL引数はプロパティとして直接アクセス可能
  let name = request.name;

  // または getParameterValue() で取得
  let name = request.getParameterValue('name');
}
```

## メソッド一覧

### パラメータ取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getParameterValue(key) | String | 指定キーの最初のURL引数を返す。該当なしは `null` |
| getParameterValues(key) | Array(String) | 指定キーのすべてのURL引数を配列で返す。該当なしは空配列 |
| getParameterNames() | Array(String) | すべてのリクエストパラメータ名を返す |
| getParameter(name) | RequestParameter | 指定パラメータを RequestParameter で返す。存在しない場合は `null` |
| getParameters(name) | Array(RequestParameter) | 指定パラメータのすべての値を RequestParameter 配列で返す |

### ヘッダ取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getHeaderNames() | Array(String) | すべてのヘッダ名の配列を返す |
| getHeader(name) | String | 指定ヘッダの最初の値を返す。存在しない場合は `null` |
| getHeaders(name) | Array(String) | 指定ヘッダのすべての値を配列で返す。存在しない場合は空配列 |

### Cookie 取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getCookieNames() | Array(String) | すべてのクッキー名の配列を返す。クッキーなしは `null` |
| getCookie(name) | String | 指定名称のクッキー値を返す |
| getCookies(name) | Array(String) | 指定名称のすべてのクッキー値を配列で返す |

### メッセージボディ取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getMessageBodyAsStream() | String | バイナリデータを文字コード変換なしで返す |
| getMessageBodyAsString() | String | メッセージボディを ServletRequest エンコーディングで Unicode に変換して返す |
| getMessageBody(enc) | String | メッセージボディを指定エンコーディングで Unicode に変換して返す |
| openMessageBodyAsBinary(callback) | ByteReader | バイナリデータを ByteReader で返す |
| openMessageBodyAsText(callback, enc) | TextReader | テキストデータを TextReader で返す |

### リクエスト情報

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getMethod() | String | HTTPメソッド名（`GET`, `POST` 等）を返す |
| getContentLength() | Number | メッセージボディのバイト長。不明な場合は `-1` |
| getContentType() | String | リクエストのMIMEタイプ。不明な場合は `null` |
| getQueryString() | String | URLのクエリ文字列。クエリなしは `null` |

### 属性操作

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getAttributeNames() | Array(String) | 利用可能な属性名の配列を返す |
| getAttribute(name) | Object | 指定属性値を返す。存在しない場合は `null` |
| setAttribute(name, object) | void | リクエストに属性をセット |
| removeAttribute(name) | void | リクエストから属性を削除 |

## 使用例

### パラメータの取得

```javascript
function init(request) {
  // 単一値の取得
  let userId = request.getParameterValue('user_id');

  // プロパティとして直接アクセスも可能
  let userId = request.user_id;

  // 複数値の取得（チェックボックス等）
  let selectedIds = request.getParameterValues('selected_ids');
}
```

### POSTリクエストのJSON本文を取得

```javascript
function init(request) {
  if (request.getMethod() === 'POST') {
    let body = request.getMessageBodyAsString();
    let data = JSON.parse(body);
  }
}
```

### ヘッダ・Cookie の取得

```javascript
function init(request) {
  let contentType = request.getHeader('Content-Type');
  let sessionId = request.getCookie('JSESSIONID');
}
```

### 属性の受け渡し

```javascript
function init(request) {
  request.setAttribute('processResult', {status: 'success'});

  let result = request.getAttribute('processResult');
}
```

## RequestParameter オブジェクト

`request.getParameter(name)` / `request.getParameters(name)` で取得できるオブジェクト。
アップロードされたファイルやリクエストデータに関する情報を保持する。

### メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getName() | String | パラメータ名を取得 |
| getValue() | String | パラメータ値を取得（文字コード変換済み） |
| getLength() | Number | データ長（バイト）を取得 |
| getFileName() | String | アップロードファイルのファイル名。ファイル以外は `null` |
| getHeaderNames() | Array(String) | ヘッダ名称一覧。ヘッダなしは `null` |
| getHeader(name) | String | 指定ヘッダ名の値を取得 |
| openValueAsBinary(callback?) | ByteReader | パラメータ値をバイナリストリームで取得（文字コード変換なし） |
| openValueAsText(callback?, charsetName?) | TextReader | パラメータ値をテキストストリームで取得（指定文字コードに変換） |

### ファイルアップロードの処理例

`ByteReader.read(buffer, ...)` を直接呼び出すと、JavaScript の空配列にバイトが格納されず
**0 バイト保存になる落とし穴**がある。
転送目的なら `ByteReader.transferTo(writer, chunkSize)` を使うこと。
詳細は `reference/api-binary-stream.md` を参照。

```javascript
function init(request) {
  let uploadedFile = request.getParameter('upload_file');

  // ファイルとして送られていない場合は getFileName() が null を返す
  if (!uploadedFile || !uploadedFile.getFileName()) {
    return;
  }

  let fileName = uploadedFile.getFileName();
  let fileSize = uploadedFile.getLength();

  // バイナリストリームを transferTo で Storage へコピー
  let storage = new PublicStorage('upload/' + fileName);
  let reader = uploadedFile.openValueAsBinary();
  let writer = storage.createAsBinary();
  try {
    reader.transferTo(writer, 8192);
    writer.flush();
  } finally {
    try { writer.close(); } catch (ignored) {}
    try { reader.close(); } catch (ignored) {}
  }
}
```

ファイルアップロード/ダウンロード REST-API の完成形は
`assets/file-upload-download-api.md` を参照。
