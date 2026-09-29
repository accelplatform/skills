---
paths:
  - "src/main/jssp/**/*.html"
---

# FieldGroup

## 基本情報

FieldGroup は、複数の Field をグループ化するための部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-field-fieldgroup--documentation
- 基本クラス: imds-field-group
- 個別のフィールドの詳細は [imds-html-field.md](imds-html-field.md) を参照

## 全体構造

```
imds-field-group                          # グループ全体（is-vertical / is-horizontal + ラベル幅クラスを付与）
├── imds-field-group-label                # グループラベル領域
│   └── span                              # ラベル文字列（必須・任意マーククラスを付与可能）
├── imds-field-group-control              # グループ内 Field 配置領域（is-vertical / is-horizontal）
│   ├── imds-field                        # 個別 Field（バリデーション時は imds-validation-error を付与）
│   │   ├── imds-field-label
│   │   └── imds-field-control
│   ├── imds-field                        # 必要な数だけ繰り返し（id は一意にする）
│   └── ...
├── imds-help-text                        # ヘルプテキスト（オプション、末尾配置）
└── imds-error-text                       # エラーメッセージ（オプション、末尾配置）
```

`imds-help-text` / `imds-error-text` は **`imds-field-group-control` の後**（グループの末尾）に配置する。`imds-validation-error` はグループではなく個別の `imds-field` に付与する。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-field-group | 外側 div | フィールドグループコンテナ | 必須 |
| imds-field-group-label | div 要素 | グループラベル領域 | 必須 |
| imds-field-group-control | div 要素 | グループコントロール領域（Field を配置） | 必須 |
| is-vertical | imds-field-group | 垂直レイアウト（ラベルが上） | オプション |
| is-horizontal | imds-field-group | 水平レイアウト（ラベルが左） | オプション |
| is-vertical | imds-field-group-control | グループ内 Field を垂直配置 | オプション |
| is-horizontal | imds-field-group-control | グループ内 Field を水平配置 | オプション |
| imds-w-15 | imds-field-group | ラベル幅 15% | オプション |
| imds-w-25 | imds-field-group | ラベル幅 25% | オプション |
| imds-w-30 | imds-field-group | ラベル幅 30% | オプション |
| imds-w-150px | imds-field-group | ラベル幅 150px | オプション |
| imds-w-250px | imds-field-group | ラベル幅 250px | オプション |
| imds-required-label-required-asterisk | span 要素 | アスタリスク（*）必須マーク | オプション |
| imds-required-label-required | span 要素 | 「必須」テキストマーク | オプション |
| imds-required-label-optional | span 要素 | 「任意」テキストマーク | オプション |
| imds-help-text | span 要素 | ヘルプテキスト | オプション |
| imds-error-text | span 要素 | エラーメッセージ | オプション |
| imds-validation-error | imds-field | バリデーションエラー状態（個別 Field に付与） | オプション |
| imds-field-container | 外側 div | FieldGroup を縦に並べるコンテナ（第1階層は必須） | 必須（第1階層配置時） |

## HTML スニペット

### 基本フィールドグループ

```html
<div class="imds-field-group">
  <div class="imds-field-group-label"><span>Group Label</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r1:">Label</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r1:" class="imds-textbox" value="" />
      </div>
    </div>
    <!-- 必要な数だけ imds-field を繰り返す（id は一意にすること） -->
  </div>
</div>
```

以降は基本フィールドグループからの差分のみを示す。

## バリエーション

### alignment（グループ全体のレイアウト方向）

`div.imds-field-group` にクラスを付与する。

```html
<div class="imds-field-group is-vertical">    <!-- 垂直（ラベルが上） -->
<div class="imds-field-group is-horizontal">  <!-- 水平（ラベルが左） -->
```

### groupControlAlignment（グループ内 Field の配置方向）

`div.imds-field-group-control` にクラスを付与する。

```html
<div class="imds-field-group-control is-vertical">    <!-- Field を縦並び -->
<div class="imds-field-group-control is-horizontal">  <!-- Field を横並び -->
```

### labelWidth（ラベル幅）

`div.imds-field-group` にクラスを付与する。
水平レイアウト時に有効。

```html
<div class="imds-field-group imds-w-15">     <!-- 15% -->
<div class="imds-field-group imds-w-25">     <!-- 25% -->
<div class="imds-field-group imds-w-30">     <!-- 30% -->
<div class="imds-field-group imds-w-150px">  <!-- 150px -->
<div class="imds-field-group imds-w-250px">  <!-- 250px -->
```

### required（必須・任意マーク）

`imds-field-group-label` 内の `span` 要素にクラスと `data-required-label` 属性を付与する。

```html
<!-- アスタリスク（*） -->
<span class="imds-required-label-required-asterisk">Group Label</span>

<!-- 「必須」マーク -->
<span class="imds-required-label-required" data-required-label="必須">Group Label</span>

<!-- 「任意」マーク -->
<span class="imds-required-label-optional" data-required-label="任意">Group Label</span>
```

## 組み合わせ例

### ヘルプテキスト

`imds-field-group` 内の末尾（`imds-field-group-control` の後）に `imds-help-text` を追加する。

```html
<div class="imds-field-group">
  <!-- imds-field-group-label, imds-field-group-control は省略 -->
  <span class="imds-help-text">半角英数字で、50文字まで入力できます。</span>
</div>
```

### バリデーションエラー

個別の `div.imds-field` に `imds-validation-error` を付与し、`imds-field-group` 内の末尾に `imds-error-text` を追加する。

```html
<div class="imds-field-group">
  <!-- imds-field-group-label は省略 -->
  <div class="imds-field-group-control">
    <div class="imds-field imds-validation-error">
      <!-- Field の内容 -->
    </div>
  </div>
  <span class="imds-error-text">エラーメッセージをここに表示します。</span>
</div>
```

### field-container でラップする

FieldGroup をフォームの第1階層に配置する場合は、Field と同様に `imds-field-container` でラップする。`imds-field-container` の詳細（`has-divider` / `has-accent-color` / 768px 未満の自動縦積み）は [imds-html-field.md](imds-html-field.md) の「Field Container」節を参照。

```html
<form class="imds-form">
  <div class="imds-field-container">
    <div class="imds-field-group is-horizontal imds-w-15">
      <div class="imds-field-group-label"><span>住所</span></div>
      <div class="imds-field-group-control">
        <div class="imds-field">
          <div class="imds-field-label">
            <label class="imds-required-label-required-asterisk" for=":r8:">都道府県</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id=":r8:" class="imds-textbox" value="" />
          </div>
        </div>
        <div class="imds-field">
          <div class="imds-field-label">
            <label class="imds-required-label-required-asterisk" for=":r9:">市区町村</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id=":r9:" class="imds-textbox" value="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</form>
```

## 実装上の注意

- グループ内の各 Field で `id` が重複しないよう一意の値を付与すること（`:r1:` 等はプレースホルダー）
- `imds-help-text` と `imds-error-text` は `imds-field-group-control` の後に配置する
- `imds-validation-error` はグループではなく個別の `imds-field` に付与する
- `imds-field-group-control is-horizontal` 内に複数の `imds-field` を配置する場合、`imds-field-label` の有無はグループ内で統一すること。ラベルありとなしが混在するとレイアウトが崩れる
  - 全フィールドにラベルを付ける場合は、`imds-field-group-label` にはグループ全体の見出しを設定する
  - ラベルなしで統一する場合は、`imds-field-group-label` に代表的な項目名を設定する
- **1つの入力用コンポーネントのみを格納する原則**: FieldGroup の中身は Field（各 Field は単一の入力用コンポーネントのみを格納）で構成する。FieldGroup 自体を入れ子にはしない
- **field-container 必須原則**: フォームで第1階層に FieldGroup を配置する場合は、Field と同様に必ず `imds-field-container` でラップする
- `imds-field-container` 直下の FieldGroup は、ビューポート幅 768px 以下で `is-horizontal` の指定があってもラベルとコントロールが自動的に縦積みになる。第二階層以降や単体使用時は対象外
- Field の詳細な使い方は [imds-html-field.md](imds-html-field.md) を参照
