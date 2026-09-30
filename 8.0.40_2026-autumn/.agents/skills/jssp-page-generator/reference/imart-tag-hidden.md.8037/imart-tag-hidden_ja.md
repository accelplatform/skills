# IMART hidden タグ リファレンス

## 概要

`<imart type="hidden">` は、フォーム送信時にリクエストパラメータとしてデータを渡すための隠しフィールドを生成するタグである。
タグの属性名がパラメータ名、属性値がパラメータ値となる。

## 属性一覧

### 必須属性

なし。任意の属性名でパラメータを定義する。

### パラメータ属性

| 属性 | 型 | 説明 |
|------|------|------|
| （任意の属性名） | String | 属性名がリクエストパラメータ名、属性値がパラメータ値となる。複数指定可 |

### オプション属性

| 属性 | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| escapeXml | Boolean | ページ設定に従う | XML エスケープ。`&<>"'` を実体参照に変換 |
| escapeJs | Boolean | ページ設定に従う | JavaScript エスケープ。制御文字を変換 |

## 使用例

### 基本的な使い方

```html
<form>
  <imart type="hidden" arg_a="A" arg_b="B" />
</form>
```

サーバサイドでの取得:
```javascript
let a = request['arg_a'];  // "A"
let b = request['arg_b'];  // "B"
```

### バインド変数を使用する場合

```html
<imart type="hidden" userCode=$userCode mode=$mode />
```

サーバサイドでの取得:
```javascript
let userCode = request['userCode'];
let mode = request['mode'];
```

## 注意事項

- 子タグは持たない（自己完結型タグ）
- `escapeXml` / `escapeJs` 以外の属性は全てリクエストパラメータとして送信される
- 機密性の高いデータ（パスワード等）をそのまま渡さないこと
