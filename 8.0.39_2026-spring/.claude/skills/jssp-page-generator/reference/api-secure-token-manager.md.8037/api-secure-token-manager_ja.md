---
paths:
  - "src/main/jssp/**/*.js"
---

# SecureTokenManager API リファレンス

## 概要

SecureTokenManager は、不正アクセスを防止するためのセキュアトークンを管理するオブジェクトである。
正規の手順を辿っているアクセスに対して実行を許可し、不正なアクセスをブロックする。

- Web 実行環境でのみ利用可能

## 定数

| 定数 | 値 | 説明 |
|------|-----|------|
| REQUEST_PARAMETER_NAME | `"im_secure_token"` | リクエストパラメータ名 |

## コンストラクタ

```javascript
let tokenManager = new SecureTokenManager();
```

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| createToken(useOneTimeToken, parameter?) | ResultObject | セキュアトークンを生成 |
| verify(token?, parameter?) | ResultObject | トークンの正当性を検証 |

## メソッド詳細

### createToken(useOneTimeToken, parameter?)

セキュアトークンを生成して返却する。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| useOneTimeToken | Boolean | ワンタイムトークンを使用するか |
| parameter | Object | トークン生成に使用するパラメータ（省略可） |

**戻り値**: ResultObject - `.data` にトークン文字列（String）

### verify(token?, parameter?)

トークンの正当性を検証する。トークンがリクエストパラメータに含まれていて、かつパラメータが改変されていない場合に `true` を返す。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| token | String | 検証するトークン文字列（省略時はリクエストパラメータから自動取得） |
| parameter | Object | トークン生成時に使用したパラメータ（省略可） |

**戻り値**: ResultObject - `.data` に検証結果（Boolean）

- `true`: トークンが有効
- `false`: トークンが無効、パラメータ改変、トークン無効化済み

## 使用例

### トークンの生成と検証

```javascript
// トークン生成（画面表示時）
function init(request) {
  let tokenManager = new SecureTokenManager();
  let result = tokenManager.createToken(true);
  let token = result.data;

  // HTML の hidden フィールドへセット
  request.setAttribute('secureToken', token);
}

// トークン検証（登録処理時）
function regist(request) {
  let tokenManager = new SecureTokenManager();
  let verifyResult = tokenManager.verify();

  if (!verifyResult.data) {
    // 不正アクセス
    return {error: true, message: '不正なリクエストです'};
  }

  // 正常処理
}
```
