---
paths:
  - "src/main/jssp/**/*.html"
---

# AccordionGroup

## 基本情報

AccordionGroup は、複数の Accordion をグループ化するための部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-accordion-accordiongroup--documentation
- 基本クラス: imds-accordion-group
- 個別のアコーディオンの詳細は [accordion](accordion.md) を参照

## 全体構造

```
imds-accordion-group                      # グループコンテナ（枠線・配置・サイズを一括適用）
└── imds-accordion                        # 各アコーディオン（必要数だけ繰り返し）
    ├── input[type=checkbox]              # 開閉状態を保持（id は一意、JS 不要）
    ├── label.imds-accordion-title (for=input の id)
    │   ├── imds-accordion-title-inner
    │   │   ├── span                      # タイトル
    │   │   └── imds-accordion-caption    # キャプション（オプション）
    │   └── imds-icon.imds-accordion-chevron # シェブロン（▼）
    └── imds-accordion-content            # 折り畳まれるコンテンツ
        └── imds-px-4 imds-py-3           # 内側余白ラッパー
            └── （任意のコンテンツ / nav.imds-menu 等）
```

`imds-accordion-group` への枠線・シェブロン位置・サイズ指定で、配下の全アコーディオンに一括適用される。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-accordion-group | コンテナ div | アコーディオングループコンテナ | 必須 |
| imds-accordion | 各アイテム div | 各アコーディオンのコンテナ | 必須 |
| is-outlined | imds-accordion-group | 上下左右の全方向に枠線 | オプション |
| is-borderless | imds-accordion-group | 枠線を表示しない | オプション |
| is-left | imds-accordion-group | シェブロンアイコンを左配置 | オプション |
| is-right | imds-accordion-group | シェブロンアイコンを右配置 | オプション |
| is-x-small | imds-accordion-group | 極小サイズ | オプション |
| is-small | imds-accordion-group | 小サイズ | オプション |
| is-normal | imds-accordion-group | 標準サイズ | オプション |
| is-medium | imds-accordion-group | 中サイズ | オプション |
| is-large | imds-accordion-group | 大サイズ | オプション |

※ 各アコーディオン内部のクラス（imds-accordion-title, imds-accordion-content 等）は [accordion](accordion.md) を参照。

## HTML スニペット

### 基本アコーディオングループ

```html
<div class="imds-accordion-group">
  <div class="imds-accordion">
    <input type="checkbox" id="todo-replace-:r1:" />
    <label for="todo-replace-:r1:" class="imds-accordion-title">
      <span class="imds-accordion-title-inner">
        <span>Accordion Title</span>
        <span class="imds-accordion-caption">caption</span>
      </span>
      <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
    </label>
    <div class="imds-accordion-content"><div class="imds-px-4 imds-py-3">Content</div></div>
  </div>
  <!-- 必要な数だけ imds-accordion を繰り返す（id は一意にすること） -->
</div>
```

以降のスニペットはすべて基本アコーディオングループからの差分のみを示す。

## バリエーション

枠線・シェブロン配置・サイズはすべて `div.imds-accordion-group` にクラスを付与することで、グループ内の全アコーディオンに一括適用される。

### accordionStyle（枠線）

```html
<!-- 全方向に枠線 -->
<div class="imds-accordion-group is-outlined">

<!-- 枠線なし -->
<div class="imds-accordion-group is-borderless">
```

### chevronIconPosition（シェブロンアイコンの配置）

デフォルトは右配置。

```html
<!-- シェブロンを左配置 -->
<div class="imds-accordion-group is-left">
```

### size（サイズ）

```html
<div class="imds-accordion-group is-x-small">  <!-- 極小 -->
<div class="imds-accordion-group is-small">    <!-- 小 -->
<div class="imds-accordion-group is-normal">   <!-- 標準 -->
<div class="imds-accordion-group is-medium">   <!-- 中 -->
<div class="imds-accordion-group is-large">    <!-- 大 -->
```

## 組み合わせ例

### Menu との組み合わせ

`imds-accordion-content` 内に `nav.imds-menu` を配置するパターン。
`is-last-child-borderless` を付与することで、メニュー末尾の枠線を非表示にする。

```html
<div class="imds-accordion-content">
  <nav class="imds-menu is-last-child-borderless">
    <ul class="imds-menu-list">
      <li><a><span>Menu 1</span></a></li>
      <li><a><span>Menu 2</span></a></li>
      <li><a><span>Menu 3</span></a></li>
    </ul>
  </nav>
</div>
```

### `is-outlined` + `imui-table`（移行注記付き）

グループ内の各アコーディオンに詳細情報テーブルを持たせる場合、[accordion](imds-html-accordion.md) の「`is-outlined` + `imui-table`（詳細情報の表示・移行注記付き）」パターンをそのままグループの子要素として繰り返し配置する。`imui-table` は将来的に `imds-table` へ移行予定の暫定パターンである点に注意（詳細は accordion.md 側の注記を参照）。

```html
<div class="imds-accordion-group is-outlined">
  <div class="imds-accordion">
    <input type="checkbox" id="todo-replace-:r0:" />
    <label for="todo-replace-:r0:" class="imds-accordion-title">
      <span class="imds-accordion-title-inner">
        <span>ワークフロー名</span>
        <span class="imds-accordion-caption">workflow-id</span>
      </span>
      <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
    </label>
    <div class="imds-accordion-content">
      <div class="imds-px-4 imds-pt-3 imds-pb-1">
        <table class="imui-table">
          <tbody>
            <tr>
              <th colspan="2"><label>アプリケーション名</label></th>
              <td>AccelStudioアプリケーション名</td>
            </tr>
            <tr>
              <th rowspan="2" class="wd-15"><label>ワークフロー情報</label></th>
              <th class="wd-15"><label>定義名</label></th>
              <td>ワークフロー名 （ ID: workflow-id ）</td>
            </tr>
            <tr>
              <th><label>備考</label></th>
              <td>「ワークフロー名」のフロー定義です。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <!-- 必要な数だけ imds-accordion を繰り返す（id は一意にすること） -->
</div>
```

## 実装上の注意

- `id` 属性は必ず一意の値に置き換えること（`todo-replace-:r1:` 等はプレースホルダー）
- グループ内の各アコーディオンで `id` が重複しないよう注意する
- checkbox ベースの開閉のため JavaScript は不要だが、プログラムから開閉状態を制御する場合は `checked` 属性を操作する
- `imds-accordion-content` 内のパディングは `imds-px-4 imds-py-3` で調整している。コンテンツに応じて変更可能
