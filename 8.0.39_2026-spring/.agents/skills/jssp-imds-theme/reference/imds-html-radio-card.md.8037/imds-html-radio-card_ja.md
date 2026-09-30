# RadioCard

## 基本情報

Radiocard は、Radioと同様、選択肢から 1 つの項目を選択する際に使用する部品です。
ラベルとは別に説明欄があるため、 Radio よりも詳細な情報をユーザに提示できます。
また、クリック領域が広いため、選択操作がしやすいのも特徴です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-radiocard--documentation
- 基本クラス: imds-radiocard

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-radiocard | div 要素 | ラジオカードコンテナ | 必須 |
| imds-radiocard-title | span 要素 | カードタイトル | 必須 |
| imds-radiocard-content | div 要素 | カード説明コンテンツ | オプション |
| imds-radiocard-container | fieldset 要素 | 複数カードのグループコンテナ | オプション |
| is-vertical | imds-radiocard-container | 縦並びレイアウト | オプション |

## HTML スニペット

### 基本ラジオカード

```html
<div class="imds-radiocard">
  <input type="radio" name="todo-replace-:r1:" id="todo-replace-:r1:" />
  <label for="todo-replace-:r1:">
    <span class="imds-radiocard-title">タイトル</span>
    <div class="imds-radiocard-content">
      <p>説明テキスト</p>
    </div>
  </label>
</div>
```

以降は基本ラジオカードからの差分のみを示す。

## バリエーション

### disabled

`input` に `disabled` 属性を付与する。

```html
<input type="radio" name="todo-replace-:r1:" id="todo-replace-:r1:" disabled />
```

### checked

`input` に `checked` 属性を付与する。

```html
<input type="radio" name="todo-replace-:r1:" id="todo-replace-:r1:" checked />
```

## 組み合わせ例

### 複数の選択項目

`fieldset.imds-radiocard-container` で複数のラジオカードをグループ化する。
`is-vertical` で縦並びレイアウトになる。

```html
<fieldset class="imds-radiocard-container is-vertical">
  <div class="imds-radiocard">
    <input
      type="radio"
      name="container"
      id=":r0:" />
    <label for=":r0:">
      <span class="imds-radiocard-title">手動作成</span>
      <div class="imds-radiocard-content"><p>データを一つずつ手動で入力します。</p></div>
    </label>
  </div>
  <!-- 同構造の imds-radiocard を必要数繰り返す（name 属性は共通にする） -->
</fieldset>
```

## 実装上の注意

- 同一グループのラジオカードは `name` 属性を同じ値にする（1つだけ選択可能にするため）
- 各カードの `input` の `id` と `label` の `for` は一意の値に置き換えること（`todo-replace-:r1:` はプレースホルダー）
- 選択状態のスタイルは `input:checked` に連動して CSS で自動的に切り替わる（JavaScript 不要）
- `imds-radiocard-content` は省略可能（タイトルのみのカードも作成できる）
