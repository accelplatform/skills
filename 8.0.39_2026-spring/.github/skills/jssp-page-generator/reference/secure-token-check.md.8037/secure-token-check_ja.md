---
paths:
  - "src/main/jssp/**/*.js"
  - "src/main/jssp/**/*.html"
---

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

`<imart type="head">` 内に `<meta name="im_secure_token">` を配置し、`content` 属性に `<imart type="imSecureToken" mode="value" />` でトークンの値を出力する。
`mode="value"` はトークンの値だけを出力する（`mode` を省略した場合は `<input type="hidden">` タグを出力する）。

```html
<imart type="head">
  <!-- セキュアトークン -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
</imart>
```

### セキュアトークンの取得

`meta` タグの `content` 属性から、セキュアトークンを取得する。

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

## フォーム送信（通常 POST）

`<form>` を通常の POST で送信する画面では、トークンをリクエストパラメータで送り、ファンクションコンテナで検証する。

### プレゼンテーションページ側

フォーム内に `<imart type="imSecureToken" />` を配置する。`mode` を省略すると `<input type="hidden" name="im_secure_token" value="...">` が出力され、フォーム送信時にリクエストパラメータ `im_secure_token` としてトークンが送られる。

```html
<form action="sample/form/submit" method="POST">
  <imart type="imSecureToken" />
  <!-- 入力項目 -->
  <button type="submit">送信</button>
</form>
```

### ファンクションコンテナ側

`verify()` を引数なしで呼ぶ。`token` を省略すると、リクエストパラメータ `im_secure_token` からトークンを取得して検証する。

```javascript
function init(request) {
  let result = new SecureTokenManager().verify();
  if (result.error || !result.data) {
    // TODO: ここにセキュアトークン検証エラー時の処理を追加
    return;
  }
  // 登録処理
}
```
