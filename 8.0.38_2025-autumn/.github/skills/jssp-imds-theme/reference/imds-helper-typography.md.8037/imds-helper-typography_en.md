---
paths:
  - "src/main/jssp/**/*.html"
---

# Typography（文字表現ユーティリティ）

## 基本情報

Typography は、フォントサイズ・太さ・スタイル等のプロパティに加え、`text-align` や `text-transform` によってテキストの見た目や配置を制御する imds ヘルパークラス群である。これらは imds のユーティリティクラスであり、`imds-textbox` や `imds-heading` 等のコンポーネント固有クラスと組み合わせて使う。単独のコンポーネントとして使うものではない。

- 抽出元: `uiux-share/helper/Typography.md`

## CSS Classes Reference

| クラス名 | 用途 | 値（Property: Value） |
|----------|------|----------------------|
| `is-capitalized` | 先頭文字のみを大文字に変換 | `text-transform: capitalize;` |
| `is-lowercase` | 小文字に変換 | `text-transform: lowercase;` |
| `is-uppercase` | 大文字に変換 | `text-transform: uppercase;` |
| `is-italic` | イタリック体にする | `font-style: italic;` |
| `is-underlined` | 下線を付ける | `text-decoration: underline;` |
| `has-text-weight-normal` | 標準の太さ | `font-weight: 400;` |
| `has-text-weight-bold` | 太字 | `font-weight: 700;` |
| `has-text-centered` | 中央揃え | `text-align: center;` |
| `has-text-justified` | 均等割り付け | `text-align: justify;` |
| `has-text-start` | 開始位置揃え | `text-align: start;` |
| `has-text-end` | 終了位置揃え | `text-align: end;` |

## 使用例

### 購入金額入力欄（右揃え）

Textbox に `has-text-end` を付与し、入力値を右揃えにする。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for=":r0:">購入金額</label></div>
  <div class="imds-field-control">
    <input
      type="text"
      id=":r0:"
      placeholder="0"
      class="imds-textbox has-text-end"
      value="" />
  </div>
</div>
```

### 太字での強調

```html
<span class="has-text-weight-bold">重要事項</span>
```

### 中央揃えの見出し

```html
<h2 class="imds-heading is-size-4 has-text-centered">セクション見出し</h2>
```

## 実装上の注意

- 同一要素に複数の Typography クラスを付与すると競合や予期せぬ表示になることがあるため、必要最小限に留める。
- `has-text-weight-*` はフォントによって見た目が変わるため、主要フォントでの表示確認を行う。
- `is-capitalized` / `is-lowercase` / `is-uppercase` はアルファベットにのみ有効であり、日本語テキストへの使用は避ける。
- `is-italic` はフォントによっては効果が現れず、イタリック字形を持たないフォント（メイリオ等）では効果が出ないため、主要フォントでの表示確認を行う。長文や日本語テキストでは可読性が下がるため、使用は最小限に留める。
