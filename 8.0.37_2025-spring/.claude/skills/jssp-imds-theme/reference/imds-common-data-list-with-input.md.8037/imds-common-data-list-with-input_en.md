---
paths:
  - "src/main/jssp/**/*.html"
---

# データリストと入力要素の組み合わせ（common-parts）

## 基本情報

入力欄に候補リストを表示し、選択または自由入力の両方を許容したい場合に使用する複合パターンである。
`<input list="...">` と `<datalist>` を組み合わせ、ネイティブブラウザのオートコンプリート UI を利用する。

- 選択肢が少なく（〜20件程度）かつ自由入力も認めたい場面に適する。
- 選択肢が多い場合や、自由入力を許さず必須選択とする場合は `<select>` + `imds-select`（[imds-html-select.md](imds-html-select.md)）を使うこと。本パターンは使わない。
- 抽出元: `uiux-share/common-parts/データリストと入力要素の組み合わせ.md`

## 構成コンポーネント

| 使用する基本コンポーネント | 対応 reference |
|---|---|
| Textbox（`imds-textbox`） | [imds-html-textbox.md](imds-html-textbox.md) |
| Field（`imds-field`） | [imds-html-field.md](imds-html-field.md) |

`<datalist>` 自体は imds 独自のクラスを持たない標準 HTML 要素であり、imds のコンポーネント体系には含まれない。

## HTML スニペット

### 単体（Field なし）

```html
<div>
  <input
    type="text"
    id="[REPLACE: input-id]"
    placeholder="入力または選択してください"
    class="imds-textbox"
    list="[REPLACE: datalist-id]"
    value="" />
  <datalist id="[REPLACE: datalist-id]">
    <option value="[REPLACE: 選択肢1]"></option>
    <option value="[REPLACE: 選択肢2]"></option>
    <option value="[REPLACE: 選択肢3]"></option>
  </datalist>
</div>
```

### Field と組み合わせる場合

`<input>` と `<datalist>` は `imds-field-control` 内に配置する。Field 自体の構造は [imds-html-field.md](imds-html-field.md) を参照すること。

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label for="[REPLACE: input-id]">[REPLACE: ラベル]</label>
  </div>
  <div class="imds-field-control">
    <input
      type="text"
      id="[REPLACE: input-id]"
      placeholder="入力または選択してください"
      class="imds-textbox"
      list="[REPLACE: datalist-id]" />
    <datalist id="[REPLACE: datalist-id]">
      <option value="[REPLACE: 選択肢1]"></option>
      <option value="[REPLACE: 選択肢2]"></option>
    </datalist>
  </div>
</div>
```

## 実装上の注意

- `<input>` の `list` 属性と `<datalist>` の `id` を必ず一致させること。
- `id`（`input-id` / `datalist-id`）は画面内で一意になるよう置換すること。
- `<input>` のクラスは通常の `imds-textbox` と同一であり、データリスト専用のクラスは存在しない。
- ブラウザネイティブのオートコンプリート UI を使うため、候補の見た目（フォント・配色）は imds でカスタマイズできない点に留意する。
