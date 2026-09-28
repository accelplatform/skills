# IMART imSecureToken タグ リファレンス

## 概要

`<imart type="imSecureToken">` は、CSRF（クロスサイトリクエストフォージェリ）対策用のセキュアトークンを出力するタグである。
サーバは正規のアクセスに対しトークンを発行し、クライアントに送信する。リクエスト受信時にセッションに保存したトークンとリクエストで送信されたトークンを比較して検証する。

## 属性一覧

### オプション属性

| 属性 | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| mode | String | `"tag"` | 出力モード。`"tag"` / `"name"` / `"value"` のいずれか |
| useOneTimeToken | Boolean | false | `true` の場合、トークンを1回使用した時点で無効化する |
| *任意属性* | String | - | トークン生成シードに含めるキーと値。ベリファイ時にリクエストパラメータに同じキーと値が必要 |

### mode 属性の値

| 値 | 説明 |
|------|------|
| `"tag"` | セキュアトークンを含む hidden タグを出力する（デフォルト） |
| `"name"` | セキュアトークンのリクエストパラメータ名を出力する |
| `"value"` | セキュアトークンの値そのものを出力する |

## 使用例

### フォーム送信（基本）

```html
<form action="sample/csrf_check" method="POST">
  <imart type="imSecureToken" />
  <input type="submit" value="送信" />
</form>
```

### ワンタイムトークン

```html
<form action="sample/csrf_check" method="POST">
  <imart type="imSecureToken" useOneTimeToken="true" />
  <input type="submit" value="送信" />
</form>
```

### Ajax でのトークン送信

```html
<script>
  const params = new URLSearchParams();
  params.append('<imart type="imSecureToken" mode="name" />', '<imart type="imSecureToken" mode="value" />');

  fetch('sample/csrf_check', {
    method: 'POST',
    body: params
  });
</script>
```

## 注意事項

- セッションタイムアウトなどでセッションが破棄されると、トークンが無効化される
- ファンクションコンテナ側での検証には `SecureTokenManager.verify()` を使用する
- `useOneTimeToken="true"` は二重送信防止にも有効
