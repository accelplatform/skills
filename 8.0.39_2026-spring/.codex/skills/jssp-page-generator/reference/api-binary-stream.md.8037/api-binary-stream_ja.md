# バイナリストリーム（ByteReader / ByteWriter / RequestParameter）

ファイルアップロード受信や PublicStorage への書き込みなど、バイナリデータを扱う場合のリファレンス。

## 関連クラス

| クラス | 用途 |
|--------|------|
| `RequestParameter` | `request.getParameter('file')` で取得。multipart/form-data でアップロードされたファイル等を表す |
| `ByteReader` | バイナリストリームの読み取り。`request.openMessageBodyAsBinary()` / `requestParameter.openValueAsBinary()` / `storage.openAsBinary()` で取得 |
| `ByteWriter` | バイナリストリームの書き込み。`storage.createAsBinary()` / `storage.appendAsBinary()` で取得 |

## アップロードファイルの受け取りと保存

### 推奨パターン: `transferTo` でストリーム転送する

ByteReader → ByteWriter のコピーは **`reader.transferTo(writer, chunkSize)` を使用する**こと。
チャンクサイズ指定でメモリ消費を抑えつつ全データを転送できる。

```javascript
/**
 * アップロードファイルを PublicStorage に保存する。
 *
 * @param {Object} uploadedFile - request.getParameter('file') で取得した RequestParameter
 * @param {string} fileKey - 保存先パス（uploads/xxx/yyy.ext 等）
 * @return {number} 書き込んだバイト数
 */
function saveUpload(uploadedFile, fileKey) {
  let TRANSFER_CHUNK_SIZE = 8192;
  let storage = new PublicStorage(fileKey);

  // 親ディレクトリを作成（存在しない場合）
  let parent = storage.getParentStorage();
  if (!parent.exists()) {
    parent.makeDirectories();
  }

  let reader = uploadedFile.openValueAsBinary();
  let writer = storage.createAsBinary();
  try {
    if (!reader.transferTo(writer, TRANSFER_CHUNK_SIZE)) {
      throw new Error('ファイル書き込みに失敗しました。');
    }
    writer.flush();
  } finally {
    try { writer.close(); } catch (ignored) {}
    try { reader.close(); } catch (ignored) {}
  }
  return uploadedFile.getLength();
}
```

### 禁止パターン: `ByteReader.read(buffer, offset, length)` を直接呼び出す

`ByteReader.read()` は Java の `InputStream.read(byte[], int, int)` 相当であり、
**呼び出し側が事前に容量を確保した配列を渡す前提**になっている。
JavaScript の空配列 `[]` を渡しても要素は書き込まれず、結果として **常に 0 件読み取り** となり、
出力先のファイルが **0 バイト** になる症状が発生する。

```javascript
// NG: 0 バイト保存になる落とし穴
let reader = uploadedFile.openValueAsBinary();
let writer = storage.createAsBinary();
let buffer = [];   // ← 空配列のままなので、read() はバイトを書き込めない
while (true) {
  let bytesRead = reader.read(buffer, 0, 8192);  // 常に 0 を返す
  if (bytesRead <= 0) break;
  writer.write(buffer, 0, bytesRead);            // 何も書き込まれない
}
```

`reader.read()` を使う場面はほとんど無い。**転送目的なら必ず `transferTo` を使うこと。**

### コールバック版

`openValueAsBinary` / `createAsBinary` にコールバックを渡すと、終了時に自動で `close` される。
ネストが深くなりがちな反面、明示的な close 漏れを防げる。

```javascript
function saveUploadWithCallback(uploadedFile, fileKey) {
  let TRANSFER_CHUNK_SIZE = 8192;
  let storage = new PublicStorage(fileKey);
  let parent = storage.getParentStorage();
  if (!parent.exists()) {
    parent.makeDirectories();
  }

  uploadedFile.openValueAsBinary(function(reader, readerError) {
    if (readerError) throw readerError;
    storage.createAsBinary(function(writer, writerError) {
      if (writerError) throw writerError;
      reader.transferTo(writer, TRANSFER_CHUNK_SIZE);
      writer.flush();
    });
  });
  return uploadedFile.getLength();
}
```

## アップロード受け取りのガード

`RequestParameter` がファイルとして送られて来ているかを確認する。

```javascript
let uploadedFile = request.getParameter('file');
if (!uploadedFile || !uploadedFile.getFileName()) {
  // ファイル添付なし（テキストパラメータと同名のフィールドだった等）
  throw new Error('アップロードファイルが指定されていません。');
}

let length = uploadedFile.getLength();
if (length <= 0) {
  throw new Error('アップロードファイルが空です。');
}
if (length > MAX_FILE_SIZE_BYTES) {
  throw new Error('ファイルサイズが上限を超えています。');
}
```

- `getFileName()` は **ファイルアップロード以外のリクエストでは `null`** を返す。テキストパラメータと区別するために使う
- `getLength()` は Content-Length 由来。**事前のサイズ上限チェックに使える**

## ダウンロード（PublicStorage → HTTP レスポンス）

ストレージのバイナリをそのままレスポンスに流すには `HTTPResponse.sendMessageBodyAsBinary(storage)` を使う。

```javascript
function sendFile(storage, downloadFileName) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(200);
  httpResponse.setContentType('application/octet-stream');
  httpResponse.setHeader('Content-Disposition',
    'attachment; filename="' + downloadFileName + '"');
  let length = storage.length();
  if (length > 0) {
    httpResponse.setContentLength(length);
  }
  httpResponse.sendMessageBodyAsBinary(storage);
}
```

- 送信メソッド（`sendMessageBodyAsBinary` / `sendMessageBodyString` 等）の実行後、**JavaScript の実行は停止**する
- そのため、エラー時は **送信より前** に分岐させる必要がある（一度送ったら後から JSON エラーには差し替えられない）

## ファイル名の安全化（パストラバーサル対策）

ユーザから送られたファイル名をそのままパスに組み込まない。
basename を取って許可文字以外を置換する。

```javascript
function toSafeFileName(originalFileName) {
  let baseName = String(originalFileName);
  let slashIndex = baseName.lastIndexOf('/');
  if (slashIndex >= 0) {
    baseName = baseName.substring(slashIndex + 1);
  }
  let backslashIndex = baseName.lastIndexOf('\\');
  if (backslashIndex >= 0) {
    baseName = baseName.substring(backslashIndex + 1);
  }
  baseName = baseName.replace(/[^0-9A-Za-z_\-\.]/g, '_');
  baseName = baseName.replace(/^\.+/, '');
  return baseName || 'unnamed';
}
```

## 受信したキー（fileKey）の検証

ダウンロード API のように、クライアントから受け取ったパスでストレージを開く場合は
**ホワイトリスト検証**を必ず行う。

```javascript
let FILE_KEY_PREFIX = 'uploads/';
let FILE_KEY_PATTERN = /^[0-9A-Za-z_\-\.\/]+$/;
let FILE_KEY_MAX_LENGTH = 256;

function validateFileKey(fileKey) {
  if (!fileKey || fileKey.length === 0) {
    throw new Error('fileKey は必須です。');
  }
  if (fileKey.length > FILE_KEY_MAX_LENGTH) {
    throw new Error('fileKey が長すぎます。');
  }
  if (!FILE_KEY_PATTERN.test(fileKey)) {
    throw new Error('fileKey に使用できない文字が含まれています。');
  }
  if (fileKey.indexOf('..') >= 0) {
    throw new Error('fileKey にパス操作文字が含まれています。');
  }
  if (fileKey.indexOf(FILE_KEY_PREFIX) !== 0) {
    throw new Error('fileKey は ' + FILE_KEY_PREFIX + ' 配下を指定してください。');
  }
  return fileKey;
}
```

検証項目:

| チェック | 目的 |
|---------|------|
| 必須・最大長 | 異常値の早期排除 |
| 文字種ホワイトリスト | 制御文字・空白・記号の混入禁止 |
| `..` を含まない | パストラバーサル防止 |
| `uploads/` で始まる | 公開ディレクトリ以外への到達禁止 |

## チェックリスト

- [ ] アップロード受信〜書き込みのコピーは `reader.transferTo(writer, chunkSize)` を使っているか
- [ ] `ByteReader.read(buffer, ...)` を空配列で呼び出していないか（0 バイト保存の原因）
- [ ] アップロードファイルの存在確認に `getFileName()` の null チェックを入れているか
- [ ] サイズ上限を `getLength()` で事前チェックしているか
- [ ] 保存先のパスを `toSafeFileName()` 相当でサニタイズしているか
- [ ] クライアントから受け取った fileKey をホワイトリスト検証しているか（先頭プレフィックス・文字種・`..` 禁止）
- [ ] エラー時は送信開始（`sendMessageBody*`）の前に JSON エラー応答に切り替えているか

## 関連

- `reference/argument-request.md` - Request / RequestParameter のメソッド一覧
- `reference/api-storage.md` - PublicStorage / SessionScopeStorage / SystemStorage の操作
- `reference/api-http-response.md` - HTTPResponse の使い方
- `reference/api-secure-token-manager.md` - セキュアトークン（CSRF 対策）
- `assets/file-upload-download-api.md` - REST-API + テスト画面のリファレンス実装
