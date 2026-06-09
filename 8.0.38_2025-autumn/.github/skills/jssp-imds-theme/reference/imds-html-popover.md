---
paths:
  - "src/main/jssp/**/*.html"
---

# Popover

## 基本情報

Popover は、ページ内での補助的な（主要ではない）情報やアクションを、パネル上に表示する際に使用する部品です。
クリックまたはホバーすることでパネルが表示され、ページ上の他のすべての要素よりも前面に表示されます。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-popover--documentation
- 基本クラス: imds-popover

## 全体構造

```
imds-popover                              # コンテナ（is-right / is-left / is-top / is-hoverable を付与）
├── button.imds-button                    # トリガーボタン（is-outlined）
│   │                                     #   属性: aria-haspopup="true" / aria-controls="<panel-id>"
│   ├── span                              # ラベル
│   └── imds-icon (fa-chevron-down)       # シェブロンアイコン
└── imds-popover-menu (id=<panel-id>, role="menu") # パネル本体
    └── imds-popover-content              # コンテンツ領域
        └── （任意のコンテンツ / メニュー項目 / アクション等）
```

`button` の `aria-controls` と `imds-popover-menu` の `id` を **必ず一致** させる。開閉制御は JavaScript（`is-hoverable` 時は CSS のみで動作）。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-popover | div 要素 | ポップオーバーコンテナ | 必須 |
| imds-popover-menu | div 要素 | ポップオーバーメニュー（パネル） | 必須 |
| imds-popover-content | div 要素 | パネル内のコンテンツ領域 | 必須 |
| is-right | imds-popover | 右寄せ表示 | オプション |
| is-left | imds-popover | 左寄せ表示 | オプション |
| is-top | imds-popover | 上方向表示 | オプション |
| is-hoverable | imds-popover | ホバーで開閉 | オプション |
| is-applied | トリガーボタン | 適用済みスタイル | オプション |

## HTML スニペット

### 基本ポップオーバー

```html
<div class="imds-popover">
  <button
    aria-haspopup="true"
    aria-controls="imds-popover-:r1:"
    class="imds-button is-outlined">
    <span>Popover</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
  </button>
  <div
    id="imds-popover-:r1:"
    role="menu"
    class="imds-popover-menu">
    <div class="imds-popover-content"><div>Contents</div></div>
  </div>
</div>
```

以降は基本ポップオーバーからの差分のみを示す。

## バリエーション

### isApplied（適用済み状態）

トリガーボタンに `is-applied` を追加する。

```html
<button ... class="imds-button is-outlined is-applied">
```

### disabled（無効化状態）

コンテナに `aria-disabled="true"`、ボタンに `disabled` を付与する。

```html
<div class="imds-popover" aria-disabled="true">
  <button ... class="imds-button is-outlined" disabled>
```

### position（コンテンツの表示位置）

`div.imds-popover` に位置クラスを付与する。組み合わせも可能。

```html
<div class="imds-popover is-right">       <!-- 右寄せ -->
<div class="imds-popover is-left">        <!-- 左寄せ -->
<div class="imds-popover is-top">         <!-- 上方向 -->
<div class="imds-popover is-top is-left"> <!-- 上方向 + 左寄せ -->
```

### hoverable（ホバー時、コンテンツ自動表示）

`div.imds-popover` に `is-hoverable` を付与すると、ホバー操作でコンテンツが表示される。

```html
<div class="imds-popover is-hoverable">
```

## 実装上の注意

- トリガーボタンの `aria-controls` とパネルの `id` を一致させること（`:r1:` は一意の値に置き換える）
- パネルの開閉制御は JavaScript で実装する必要がある（`is-hoverable` の場合は CSS のみで動作）
- `aria-haspopup="true"` をトリガーボタンに必ず付与する
- トリガーボタンには `imds-button is-outlined` を使用し、シェブロンアイコン（`fa-chevron-down`）を含める
- disabled 時はボタンの `disabled` 属性に加え、コンテナに `aria-disabled="true"` も付与する
