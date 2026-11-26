# HttpClient API リファレンス

## 概要

HttpClient は、HTTPリクエストを送信するためのオブジェクトである。
GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS メソッドをサポートする。

## コンストラクタ

```typescript
// 基本
let client = new HttpClient();

// タイムアウト等を指定
let configuredClient = new HttpClient({
  'connection-request-timeout-millis': 30000,
  'connect-timeout-millis': 30000,
  'socket-timeout-millis': 30000,
  'redirects-enabled': true,
  'max-redirects': 10,
  'ignore-ssl-errors': true
});
```

| パラメータ | 説明 |
|-----------|------|
| connection-request-timeout-millis | 接続要求タイムアウト（ミリ秒） |
| connect-timeout-millis | コネクションタイムアウト（ミリ秒） |
| socket-timeout-millis | ソケットタイムアウト（ミリ秒） |
| redirects-enabled | リダイレクト有効化フラグ |
| max-redirects | リダイレクト最大数 |
| ignore-ssl-errors | SSL証明書エラー無視フラグ |

## プロパティ

| プロパティ | 型 | 説明 |
|-----------|------|------|
| cookieStore | Array(HttpClientCookie) | クッキーストア |

## メソッド一覧

### HTTPリクエスト

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| get(url, parameters?) | HttpClientResult | GET リクエスト送信 |
| post(url, parameters?) | HttpClientResult | POST リクエスト送信 |
| put(url, parameters?) | HttpClientResult | PUT リクエスト送信 |
| patch(url, parameters?) | HttpClientResult | PATCH リクエスト送信 |
| doDelete(url, parameters?) | HttpClientResult | DELETE リクエスト送信 |
| head(url, parameters?) | HttpClientResult | HEAD リクエスト送信 |
| options(url, parameters?) | HttpClientResult | OPTIONS リクエスト送信 |
| close() | Boolean | リソースを解放（リクエスト完了後に必ず呼び出す） |

### リクエストパラメータの形式

```typescript
let parameters: HttpClient.PostParameters = {
  headers: { /* ヘッダー */ },
  body: { /* リクエストボディ */ },
  'default-charset': 'UTF-8',
  multipart: true  // マルチパート送信時
};
```

引数の型は d.ts（`d.ts/platform/http/im-ssjs-http-client.d.ts`）の `HttpClient.GetParameters` / `HttpClient.PostParameters` 等。`body` に文字列を渡すときは `headers` に `'Content-Type'` を書く（書かないと `tssp build` の型検査が失敗する）。

## HttpClientResult

リクエストの戻り値。`ResultObject` 形式。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| error | Boolean | エラーの有無 |
| data | Object | レスポンスデータ（下記参照） |

### data のプロパティ・メソッド

| プロパティ/メソッド | 型 | 説明 |
|-------------------|------|------|
| status | Number | HTTPステータスコード |
| responseHeaders | Array | レスポンスヘッダ配列（各要素に `name`, `value`） |
| openAsText(callback, enc) | TextReader | テキストとしてボディを読み込む |
| openAsBinary(callback) | ByteReader | バイナリとしてボディを読み込む |
| close() | Boolean | レスポンスリソースを解放 |

d.ts は `openAsText` / `openAsBinary` の `callback` を `Function` 型で宣言しているため、コールバックの引数には型を書く（書かないと TS7006 で `tssp build` が失敗する）。第 1 引数は `TextReader`（`openAsBinary` では `ByteReader`）で、エラー時は `null`。第 2 引数はエラー時に `Error`、成功時は `null`。

## 使用例

### GET リクエスト

```typescript
let client = new HttpClient();

try {
  let response = client.get('https://api.example.com/users');

  if (!response.error) {
    response.data.openAsText(function(textReader: TextReader | null, error: Error | null): void {
      if (error === null && textReader !== null) {
        let body = '';
        let line: string | null;
        while ((line = textReader.readLine()) !== null) {
          body += line;
        }
        let data = JSON.parse(body);
      }
    }, 'UTF-8');
    response.data.close();
  }
} finally {
  client.close();
}
```

### POST リクエスト（JSON）

```typescript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/users', {
    headers: {'Content-Type': 'application/json; charset=UTF-8'},
    body: ImJson.toJSONString({'name': 'Tanaka', 'email': 'tanaka@example.com'})
  });

  if (!response.error) {
    // レスポンス処理
    response.data.close();
  }
} finally {
  client.close();
}
```

### POST リクエスト（フォーム）

```typescript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/search', {
    body: {
      'keyword': '検索ワード',
      'category': 'cat1'
    }
  });

  if (!response.error) {
    response.data.close();
  }
} finally {
  client.close();
}
```

d.ts の `HttpClient.BodyParameter` は値に文字列の配列を宣言していないため、同じ名前で複数の値を送る書き方（`'categories': ['cat1', 'cat2']`）は `tssp build` の型検査を通らない。同じ名前で複数の値を送るときは、`headers` に `'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'` を書き、`body` に `'categories=' + encodeURIComponent('cat1') + '&categories=' + encodeURIComponent('cat2')` のように組み立てた文字列を渡す。

### POST リクエスト（マルチパート / ファイルアップロード）

```typescript
let client = new HttpClient();

try {
  let response = client.post('https://api.example.com/upload', {
    body: {
      'description': 'アップロードファイル',
      'file': new PublicStorage('upload/data.csv')
    },
    multipart: true
  });

  if (!response.error) {
    response.data.close();
  }
} finally {
  client.close();
}
```

### Cookie によるセッション維持

```typescript
let client = new HttpClient();
client.cookieStore = [{
  name: 'JSESSIONID',
  value: 'abcdefghijklmnopqrstu',
  domain: '127.0.0.1',
  path: '/',
  version: 0
} as HttpClientCookie];

let response = client.get('http://127.0.0.1/app');
// client.cookieStore で更新後のクッキーを参照可能
```

d.ts の `HttpClientCookie` は、取得したクッキーが持つプロパティ（`comment`、`expiryDate`、`expired()` 等）をすべて必須で宣言している。設定に使うプロパティだけを書いたオブジェクトは `as HttpClientCookie` で型を合わせる（付けないと `tssp build` の型検査が失敗する）。

### Basic 認証

d.ts には Base64 エンコードの API が無いため、「ユーザ名:パスワード」を Base64 エンコードした値（例の `basicCredentials`）はエンコード済みの値として受け取り、`'Basic ' + basicCredentials` を `Authorization` ヘッダに付ける。

```typescript
let client = new HttpClient();

try {
  let response = client.get('https://api.example.com/users', {
    headers: {'Authorization': 'Basic ' + basicCredentials}
  });

  if (!response.error) {
    response.data.openAsText(function(textReader: TextReader | null, error: Error | null): void {
      if (error === null && textReader !== null) {
        let body = '';
        let line: string | null;
        while ((line = textReader.readLine()) !== null) {
          body += line;
        }
        let data = JSON.parse(body);
      }
    }, 'UTF-8');
    response.data.close();
  }
} finally {
  client.close();
}
```

### OAuth認証（Bearer Token）

`Authorization` ヘッダには、認可サーバから取得したアクセストークン（例の `accessToken`）を `'Bearer ' + accessToken` の形で付ける。

```typescript
let client = new HttpClient();

try {
  let response = client.get('https://api.example.com/users', {
    headers: {'Authorization': 'Bearer ' + accessToken}
  });

  if (!response.error) {
    response.data.openAsText(function(textReader: TextReader | null, error: Error | null): void {
      if (error === null && textReader !== null) {
        let body = '';
        let line: string | null;
        while ((line = textReader.readLine()) !== null) {
          body += line;
        }
        let data = JSON.parse(body);
      }
    }, 'UTF-8');
    response.data.close();
  }
} finally {
  client.close();
}
```

## エラーハンドリングとリトライ

リトライ処理で一定時間待機する場合は Client.sleep を使用するが、非推奨メソッドであるため、このような複雑な処理を行う場合は、Java での代替を推奨することを、コメントで明示すること。

```typescript
/**
 * リトライ機能付きAPI呼び出し
 */
function callApiWithRetry(url: string, maxRetries: number): unknown {
  let logger = Logger.getLogger();
  let retryCount = 0;

  while (retryCount < maxRetries) {
    let client = new HttpClient({
      'connect-timeout-millis': 30000,
      'socket-timeout-millis': 30000
    });

    try {
      let response = client.get(url, {
        headers: {'Content-Type': 'application/json'}
      });

      if (!response.error) {
        let statusCode = response.data.status;

        if (statusCode >= 200 && statusCode < 300) {
          let body = '';
          response.data.openAsText(function(textReader: TextReader | null, error: Error | null): void {
            if (error === null && textReader !== null) {
              let line: string | null;
              while ((line = textReader.readLine()) !== null) {
                body += line;
              }
            }
          }, 'UTF-8');
          response.data.close();
          return JSON.parse(body);
        }

        response.data.close();

        // 4xxエラーはリトライ不可
        if (statusCode >= 400 && statusCode < 500) {
          logger.error('クライアントエラー: statusCode={}', statusCode);
          return null;
        }

        logger.warn('サーバエラー、リトライします: statusCode={}', statusCode);
      } else {
        logger.warn('API呼び出しエラー、リトライします: {}', response.errorMessage);
      }

    } catch (e) {
      logger.warn('API呼び出し例外、リトライします: {}', (e as Error).message);
    } finally {
      client.close();
    }

    retryCount++;

    // 指数バックオフ
    if (retryCount < maxRetries) {
      let waitTime = Math.pow(2, retryCount) * 1000;
      Client.sleep(waitTime);  // 非推奨メソッド
    }
  }

  logger.error('API呼び出し失敗（リトライ上限）');
  return null;
}
```
