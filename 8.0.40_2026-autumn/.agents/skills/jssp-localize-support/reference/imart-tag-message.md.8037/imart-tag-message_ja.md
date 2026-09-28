# IMART message タグ リファレンス

## 概要

`<imart type="message">` は、メッセージ ID で指定された文字列を、タグの位置に挿入するタグである。
メッセージプロパティファイルに定義されたメッセージを、ログインユーザのロケールに応じて多言語表示する。

## 属性一覧

### 必須属性

| 属性 | 型 | 説明 |
|------|------|------|
| id | String | メッセージ ID。プロパティファイルのキーを指定する |

### オプション属性

| 属性 | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| args | Array/String | - | メッセージ内のプレースホルダ（`{0}`, `{1}`, ...）に対する置換パラメータ |
| locale | String | ログインユーザのロケール | 取得するメッセージのロケールを明示的に指定する |
| escapeXml | Boolean | ページ設定に従う | XML エスケープ。`&<>"'` を実体参照に変換 |
| escapeJs | Boolean | ページ設定に従う | JavaScript エスケープ。制御文字を変換 |
| nl2br | Boolean | false | 改行文字を `<br>` タグに変換 |

## 使用例

### HTML 内での多言語表示（XSS対策あり）

```html
<h1><imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
```

### JavaScript 内でのメッセージ埋め込み

```html
<script>
  imuiShowErrorMessage('<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR" escapeXml="false" escapeJs="true" />');
</script>
```

### HTML 属性内での埋め込み

```html
<span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />">
```

### プレースホルダ付きメッセージ

プロパティファイル:
```properties
MSG.E.APP.SKILLS.SIMPLE.FORM.OVER.MAX.LENGTH={0}\u306f\u6700\u5927{1}\u6587\u5b57\u3067\u3059\u3002
```

HTML:
```html
<imart type="message" id="MSG.E.APP.SKILLS.SIMPLE.FORM.OVER.MAX.LENGTH" args=$msgArgs escapeXml="true" escapeJs="false" />
```

### ロケール指定

```html
<imart type="message" id="CAP.Z.APP.SKILLS.SIMPLE.FORM.TITLE" locale="en" escapeXml="true" escapeJs="false" />
```

## エスケープの使い分け

| コンテキスト | escapeXml | escapeJs | 理由 |
|------------|-----------|----------|------|
| HTML テキスト | `true` | `false` | XSS 対策 |
| JavaScript 文字列 | `false` | `true` | JS 文字列リテラル内の特殊文字をエスケープ |
| HTML 属性値 | `true` | `false` | 属性値の XSS 対策 |

## 注意事項

- 子タグは持たない（自己完結型タグ）
- HTML 内で表示する場合は `escapeXml="true"` を設定すること（XSS 対策）
- JavaScript 内に埋め込む場合は `escapeJs="true"` を設定すること
- ファンクションコンテナ（サーバサイド JS）では `MessageManager.getMessage()` API を使用すること（このタグは使用不可）
