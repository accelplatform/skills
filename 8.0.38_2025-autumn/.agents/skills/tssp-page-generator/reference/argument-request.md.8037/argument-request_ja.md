# Request オブジェクト リファレンス

## 概要

Request は、クライアントからのリクエスト情報を保持するオブジェクトである。
ブラウザからの要求があるたびに生成され、ファンクションコンテナの `init()` 関数やアクション用バインド関数の引数として渡される。

```typescript
export function init(request: Request): void {
  // URL引数はプロパティとして直接アクセス可能
  let name: string = request['name'];

  // または getParameterValue() で取得（該当なしは null）
  let nameValue: string | null = request.getParameterValue('name');
}
```

`Request` の型は `d.ts/platform/standard/im-ssjs-request.d.ts` で宣言されている。URL 引数を読むためのインデックスシグネチャ `[key: string]: Request.Attribute`（`Request.Attribute` は `any`）を持つので、プロパティで読んだ値は型を付けた変数で受ける。宣言に無いメソッド名を書いても型検査を通るため、メソッド名は下表か d.ts で確かめる。

## メソッド一覧

### パラメータ取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getParameterValue(key: string) | `string \| null` | 指定キーの最初のURL引数を返す。該当なしは `null` |
| getParameterValues(key: string) | `string[]` | 指定キーのすべてのURL引数を配列で返す。該当なしは空配列 |
| getParameterNames() | `string[]` | すべてのリクエストパラメータ名を返す |
| getParameter(name: string) | `RequestParameter` | 指定パラメータを RequestParameter で返す。存在しない場合は `null` |
| getParameters(name: string) | `RequestParameter[]` | 指定パラメータのすべての値を RequestParameter 配列で返す |

### ヘッダ取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getHeaderNames() | `string[]` | すべてのヘッダ名の配列を返す |
| getHeader(name: string) | `string` | 指定ヘッダの最初の値を返す。存在しない場合は `null` |
| getHeaders(name: string) | `string[]` | 指定ヘッダのすべての値を配列で返す。存在しない場合は空配列 |

### Cookie 取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getCookieNames() | `string[] \| null` | すべてのクッキー名の配列を返す。クッキーなしは `null` |
| getCookie(name: string) | `string \| null` | 指定名称のクッキー値を返す。存在しない場合は `null` |
| getCookies(name: string) | `string[]` | 指定名称のすべてのクッキー値を配列で返す |

### メッセージボディ取得

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getMessageBodyAsStream() | `string` | バイナリデータを文字コード変換なしで返す |
| getMessageBodyAsString() | `string` | メッセージボディを ServletRequest エンコーディングで Unicode に変換して返す |
| getMessageBody(encoding: string) | `string` | メッセージボディを指定エンコーディングで Unicode に変換して返す |
| openMessageBodyAsBinary(callback?: Function) | `ByteReader` | バイナリデータを ByteReader で返す |
| openMessageBodyAsText(callback?: Function, encoding?: string) | `TextReader` | テキストデータを TextReader で返す |

### リクエスト情報

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getMethod() | `string` | HTTPメソッド名（`GET`, `POST` 等）を返す |
| getContentLength() | `number` | メッセージボディのバイト長。不明な場合は `-1` |
| getContentType() | `string \| null` | リクエストのMIMEタイプ。不明な場合は `null` |
| getQueryString() | `string \| null` | URLのクエリ文字列。クエリなしは `null` |

### 属性操作

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getAttributeNames() | `string[]` | 利用可能な属性名の配列を返す |
| getAttribute(name: string) | `Request.Attribute \| null` | 指定属性値を返す。存在しない場合は `null` |
| setAttribute(name: string, object: Request.Attribute) | `void` | リクエストに属性をセット |
| removeAttribute(name: string) | `void` | リクエストから属性を削除 |

## 使用例

### パラメータの取得

```typescript
export function init(request: Request): void {
  // 単一値の取得（該当なしは null）
  let userId: string | null = request.getParameterValue('user_id');

  // プロパティとして直接アクセスも可能
  let userIdProperty: string = request['user_id'];

  // 複数値の取得（チェックボックス等）
  let selectedIds: string[] = request.getParameterValues('selected_ids');
}
```

### POSTリクエストのJSON本文を取得

```typescript
/** POST で受け取る JSON の形（項目は用途に合わせて定義する） */
interface RequestBody {
  userCode: string;             // ユーザコード
}

export function init(request: Request): void {
  if (request.getMethod() === 'POST') {
    let body: string = request.getMessageBodyAsString();
    // JSON.parse() の戻り値は any なので、型を付けた変数で受ける
    let data: RequestBody = JSON.parse(body);
  }
}
```

### ヘッダ・Cookie の取得

```typescript
export function init(request: Request): void {
  let contentType: string | null = request.getHeader('Content-Type');
  let sessionId: string | null = request.getCookie('JSESSIONID');
}
```

### 属性の受け渡し

```typescript
/** リクエスト属性で受け渡す処理結果 */
interface ProcessResult {
  status: string;               // 処理結果のステータス
}

export function init(request: Request): void {
  request.setAttribute('processResult', {status: 'success'});

  // getAttribute() の戻り値は Request.Attribute（any）なので、型を付けた変数で受ける
  let result: ProcessResult | null = request.getAttribute('processResult');
}
```

## RequestParameter オブジェクト

`request.getParameter(name)` / `request.getParameters(name)` で取得できるオブジェクト。
アップロードされたファイルやリクエストデータに関する情報を保持する。

### メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getName() | `string` | パラメータ名を取得 |
| getValue() | `string` | パラメータ値を取得（文字コード変換済み） |
| getLength() | `number` | データ長（バイト）を取得 |
| getFileName() | `string \| null` | アップロードファイルのファイル名。ファイル以外は `null` |
| getHeaderNames() | `string[] \| null` | ヘッダ名称一覧。ヘッダなしは `null` |
| getHeader(name: string) | `string` | 指定ヘッダ名の値を取得 |
| openValueAsBinary(callback?: Function) | `ByteReader` | パラメータ値をバイナリストリームで取得（文字コード変換なし） |
| openValueAsText(callback?: Function, charsetName?: string) | `TextReader` | パラメータ値をテキストストリームで取得（指定文字コードに変換） |

### ファイルアップロードの処理例

`ByteReader.read(buffer, ...)` を直接呼び出すと、JavaScript の空配列にバイトが格納されず
**0 バイト保存になる落とし穴**がある。
転送目的なら `ByteReader.transferTo(writer, chunkSize)` を使うこと。
詳細は `reference/api-binary-stream.md` を参照。

```typescript
export function init(request: Request): void {
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

ファイルアップロード/ダウンロード REST-API の完成形は `assets/file-upload-download-api.md` を参照。
