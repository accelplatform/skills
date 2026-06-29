# セキュアトークン検証

## 概要

intra-mart の CSRF 対策として、プレゼンテーションページでセキュアトークンを取得し、API 呼び出し時にリクエストヘッダへ付与、サーバ側で検証する一連のパターン。

## ファイル構成

```
プレゼンテーションページ (.html)
  ├── <imart type="imSecureToken" />  ... トークン生成
  ├── getSecureToken()                ... トークン取得
  └── fetch() の headers に付与       ... トークン送信

API (.js)
  └── verifySecureToken()             ... トークン検証
```

## プレゼンテーションページ側

### セキュアトークンの生成

`<imart type="head">` 内に `<imart type="imSecureToken" />` を配置する。
これにより、HTML 内に `<input type="hidden">` タグが生成される。

```html
<imart type="head">
  <!-- セキュアトークン -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
</imart>
```

### セキュアトークンの取得

生成された `<input>` タグから、セキュアトークンを取得する。

```javascript
// セキュアトークンを取得する
const token = document.querySelector('meta[name=im_secure_token]').content;
```

### API 呼び出し時のヘッダ付与

`fetch` のリクエストヘッダに `X-Intramart-Secure-Token` キーでトークンを設定する。

```javascript
const response = await fetch('sample/api/foo', {
  method: 'POST',
  headers: {
    'X-Intramart-Secure-Token': getSecureToken()
  }
});
```

## API 側（サーバ側検証）

### verifySecureToken 関数

API の `main()` 内で、バリデーションより前に呼び出す。

```javascript
/**
 * セキュアトークンの検証を行います。
 * リクエストが正当なものであることを確認します。
 *
 * @param {Object} request - リクエストパラメータ
 */
function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throw new Error('セキュアトークンの検証に失敗しました。');
  } else if (!result.data) {
    throw new Error('セキュアトークンが不正です。');
  }
}
```

### main 関数での呼び出し位置

セキュアトークン検証は、バリデーション・ビジネスロジックより先に実行する。

```javascript
function main(request, httpResponse) {
  try {
    // セキュアトークンのチェック
    verifySecureToken(request);
  } catch (e) {
    // TODO: ここにセキュアトークン検証エラー時の処理を追加
  }

}
```
