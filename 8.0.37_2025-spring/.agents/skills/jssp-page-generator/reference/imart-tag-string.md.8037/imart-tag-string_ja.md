# IMART string タグ リファレンス

## 概要

`<imart type="string">` は、指定位置に指定データを文字列として挿入するタグである。
タグ部分が指定文字列で置換される。

## 属性一覧

### 必須属性

| 属性 | 型 | 説明 |
|------|------|------|
| value | String | 挿入するデータ。エスケープ対象属性 |

### オプション属性

| 属性 | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| escapeXml | Boolean | ページ設定に従う | XML エスケープ。`&<>"'` を実体参照に変換 |
| escapeJs | Boolean | ページ設定に従う | JavaScript エスケープ。制御文字を変換 |
| escapeSpace | Boolean | false | 半角スペースを `&nbsp;` に変換 |
| nl2br | Boolean | false | 改行文字を `<br>` タグに変換 |
| exclusionEscapeXml | String | - | XML エスケープ対象外とする文字列 |
| exclusionEscapeJs | String | - | JavaScript エスケープ対象外とする文字列 |
| delimiter4exclusionEscapeXml | String | `:` | XML エスケープ除外文字列の区切り文字 |
| delimiter4exclusionEscapeJs | String | `:` | JavaScript エスケープ除外文字列の区切り文字 |

## エスケープ対象文字

### XMLエスケープ（escapeXml="true"）

| 元の文字 | 変換後 |
|---------|--------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `'` | `&#039;` |
| `"` | `&#034;` |

### JavaScript エスケープ（escapeJs="true"）

`\` `'` `"` およびバックスペース、改行、タブ、改ページ、復帰をエスケープする。

処理順序: XML エスケープ → JavaScript エスケープ

## 使用例

### HTML 内での文字列表示（XSS対策あり）

```html
<span><imart type="string" value=$userName escapeXml="true" escapeJs="false"></imart></span>
```

### JavaScript 内での文字列埋め込み

```html
<script>
  const data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;
</script>
```

### 改行をbrタグに変換して表示

```html
<p><imart type="string" value=$comment escapeXml="true" escapeJs="false" nl2br="true"></imart></p>
```

## 注意事項

- XSS 対策として、HTML 内で表示する場合は `escapeXml="true"` を設定すること
- JavaScript 内に JSON 文字列を埋め込む場合は両方 `false` にしてファンクションコンテナ側でエスケープ済みの値を渡すこと
- `exclusionEscapeXml` / `exclusionEscapeJs` を使用する場合はセキュリティリスクが増加するため注意
