# Flexbox & Grid（配置・グリッドユーティリティ）

## 基本情報

Flexbox & Grid は、Flex / Grid コンテナ内の要素の整列（Align self）と、CSS Grid による行・列レイアウト（Grid）を提供する imds ヘルパークラス群である。これらは imds のユーティリティクラスであり、`imds-field` / `imds-field-group` 等のコンポーネント固有クラスと組み合わせて使う。単独のコンポーネントとして使うものではない。

- 抽出元: `uiux-share/helper/Flexbox & Grid.md`（Align self）および `uiux-share/layout/Grid.md`（Grid）
- 補足: `uiux-share/helper/Flexbox & Grid.md` 自体には Grid（`imds-grid` 等）の記述が無く、Grid 相当のクラス定義は `uiux-share/layout/Grid.md` にのみ存在する。本ファイルはその両方を統合したものである。

## CSS Classes Reference

### Align self

| クラス名 | 付与先 | 用途 | 値（Property: Value） |
|----------|--------|------|----------------------|
| `is-align-self-start` | Flex/Grid コンテナの子要素 | 上揃え | `align-self: start;` |
| `is-align-self-center` | Flex/Grid コンテナの子要素 | 中央揃え | `align-self: center;` |
| `is-align-self-end` | Flex/Grid コンテナの子要素 | 下揃え | `align-self: end;` |

### Grid（基本構成）

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| `imds-grid` | グリッドコンテナとなる要素 | CSS Grid コンテナを有効化する | 必須 |
| `imds-grid-cell` | `imds-grid` の直下の子要素 | グリッドセルとして扱う | 必須 |

### Grid（共通の列数指定 — 全画面サイズ共通）

| クラス名 | 用途 | 値 |
|----------|------|----|
| `has-cols-1` 〜 `has-cols-12` | 全ての画面サイズで指定した列数を表示する | 列数: 1〜12（デフォルトは2列） |

### Grid（ブレイクポイント別の列数指定）

| クラス名 | 用途 | 値 |
|----------|------|----|
| `has-small-mobile-cols-N` | Small Mobile 以上のブレイクポイントで N 列にする（N=1〜12） | 列数: N |
| `has-mobile-cols-N` | Mobile 以上のブレイクポイントで N 列にする（N=1〜12） | 列数: N |
| `has-tablet-cols-N` | Tablet 以上のブレイクポイントで N 列にする（N=1〜12） | 列数: N |

### Grid（固定の列結合指定 — 全画面サイズ共通）

| クラス名 | 付与先 | 用途 | 値 |
|----------|--------|------|----|
| `is-col-span-N`（N=1〜12） | `imds-grid-cell` | 全ての画面サイズで、要素が N 列分にまたがるように結合する | 結合列数: N |

### Grid（ブレイクポイント別の列結合指定）

| クラス名 | 付与先 | 用途 | 値 |
|----------|--------|------|----|
| `is-small-mobile-col-span-N` | `imds-grid-cell` | Small Mobile 以上のブレイクポイントで N 列分にまたがる | 結合列数: N |
| `is-mobile-col-span-N` | `imds-grid-cell` | Mobile 以上のブレイクポイントで N 列分にまたがる | 結合列数: N |
| `is-tablet-col-span-N` | `imds-grid-cell` | Tablet 以上のブレイクポイントで N 列分にまたがる | 結合列数: N |

## 使用例

### Align self: Field の縦位置を揃える

適用前（上寄せのまま）

```html
<div class="imds-field-group">
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r0:">メモリ容量</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r0:" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-control">
        <select id=":r1:" class="imds-select">
          <option>GB</option>
          <option>TB</option>
        </select>
      </div>
    </div>
  </div>
</div>
```

適用後（`is-align-self-end` を付与し、ラベルの無いフィールドを他フィールドの入力欄と縦位置を揃える）

```html
<div class="imds-field-group">
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r3:">メモリ容量</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r3:" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field is-align-self-end">
      <div class="imds-field-control">
        <select id=":r4:" class="imds-select">
          <option>GB</option>
          <option>TB</option>
        </select>
      </div>
    </div>
  </div>
</div>
```

### Grid: 基本構成（デフォルト2列）

```html
<div class="imds-grid">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell">cell 2</div>
  <div class="imds-grid-cell">cell 3</div>
  <div class="imds-grid-cell">cell 4</div>
</div>
```

### Grid: 共通の列数指定（12列）

```html
<div class="imds-grid has-cols-12">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell">cell 2</div>
  <!-- ... cell 12 まで続く ... -->
</div>
```

### Grid: ブレイクポイント別の列数指定（基本3列、tablet 以上で6列）

```html
<div class="imds-grid has-cols-3 has-tablet-cols-6">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell">cell 2</div>
  <!-- ... -->
</div>
```

### Grid: 固定の列結合（12列グリッドで2列目を3列分結合）

```html
<div class="imds-grid has-cols-12">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell is-col-span-3">cell 2</div>
  <div class="imds-grid-cell">cell 3</div>
</div>
```

### Grid: ブレイクポイント別の列結合

```html
<div class="imds-grid has-cols-4">
  <div class="imds-grid-cell is-small-mobile-col-span-3 is-mobile-col-span-2 is-tablet-col-span-1">cell 1</div>
  <div class="imds-grid-cell is-small-mobile-col-span-3 is-mobile-col-span-2 is-tablet-col-span-1">cell 2</div>
</div>
```

### Grid: FieldGroup への適用（重要な注意点あり）

FieldGroup に Grid を使用する場合、適用可能な範囲は `.imds-field-group-control` に対してのみである。`.imds-field-group-control` に `.imds-grid` クラスを指定し、直下の要素を `.imds-grid-cell` として扱う。

**✅ OK例（`.imds-field-group-control` に `imds-grid` を付与）**

```html
<div class="imds-field-container has-accent-color">
  <div class="imds-field-group is-horizontal">
    <div class="imds-field-group-label"><span>購入情報</span></div>
    <div class="imds-field-group-control is-horizontal imds-grid has-cols-3">
      <div class="imds-field imds-grid-cell">
        <div class="imds-field-label"><label for=":rb:">購入日</label></div>
        <div class="imds-field-control">
          <input type="date" id=":rb:" class="imds-textbox" value="" />
        </div>
      </div>
      <div class="imds-field imds-grid-cell">
        <div class="imds-field-label"><label for=":rc:">購入金額</label></div>
        <div class="imds-field-control">
          <input type="text" id=":rc:" class="imds-textbox has-text-end" value="" />
        </div>
      </div>
      <div class="imds-field imds-grid-cell">
        <div class="imds-field-label"><label for=":rd:">決裁情報</label></div>
        <div class="imds-field-control">
          <input type="text" placeholder="決裁番号を選択" class="imds-textbox" readonly value="" />
        </div>
      </div>
    </div>
  </div>
</div>
```

**❌ NG例（`.imds-field-group` 自体に `imds-grid` を付与し、`imds-field-group-label` / `imds-field-group-control` をセル化している）**

```html
<div class="imds-field-container has-accent-color">
  <div class="imds-field-group is-horizontal imds-grid has-cols-3">
    <div class="imds-field-group-label imds-grid-cell"><span>購入情報</span></div>
    <div class="imds-field-group-control is-horizontal imds-grid-cell is-col-span-2">
      <div class="imds-field">
        <div class="imds-field-label"><label for=":re:">購入日</label></div>
        <div class="imds-field-control">
          <input type="date" id=":re:" class="imds-textbox" value="" />
        </div>
      </div>
    </div>
  </div>
</div>
```

## 実装上の注意

- **`is-col-span-N` は必ず `imds-field-group-control`（または `imds-field` 等、`imds-grid-cell` が付与された要素）にのみ付与し、`imds-field-group` 自体には付与しない。** `imds-field-group` は Label と Control のレイアウトを制御する仕組みを内部に持っており、`imds-field-group` 自体をグリッドコンテナ化して `imds-field-group-label` / `imds-field-group-control` をグリッドセルとして扱うと、レイアウトが崩れる。FieldGroup に Grid を指定する際は `.imds-field-group-control` にのみ `imds-grid` を指定すること。
- `is-align-self-*` は Flex または Grid コンテナの子要素にのみ有効であり、通常のブロック要素では期待した効果は得られない。基本は親要素の `align-items` で全体を揃え、個別要素の位置補正が必要な場合にのみ使用する。
- セルに列結合（`is-col-span-N` 等）を指定する場合、そのセルがまたがる列数が親グリッドで定義された列数（`has-cols-N`）を超えないように注意する。超えるとセルが意図せず次の行に折り返されたり、レイアウトが崩れる可能性がある。
- 列内の要素の垂直配置を変更したい場合は、`imds-grid-cell` に `is-align-self-start` / `is-align-self-center` / `is-align-self-end` を付与する。
