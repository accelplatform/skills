# BoxAction

## 基本情報

BoxAction は、説明文と、それに対応するアクションボタンを1つの枠内にまとめて表示する部品です。
設定変更の反映など、「何をするか」の説明と実行ボタンを対にして提示する場面で使用する。

**Button との関係性（DESIGN.md）**: BoxAction は「アクション」パターンファミリにおいて `button` を代表とする同ファミリのコンポーネントであり、**ボタンの色・状態（色軸・variant・hover/active 等）をそのまま踏襲する**。BoxAction 自体は独自の色定義を持たない。内包するボタンには通常 `imds-button is-outlined is-primary` を使用する。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-boxaction--documentation
- 基本クラス: imds-box-action

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-box-action | div 要素 | BoxAction 全体のコンテナ（複数アイテムを横並びに保持できる） | 必須 |
| is-flex-direction-column | imds-box-action または内側の div | アイテム／説明とボタンを縦積みに配置 | オプション |

## HTML スニペット

### 基本形

```html
<div class="imds-box-action">
  <div>
    <div>
      <strong>定義の反映</strong>
      <p>定義の反映についての説明</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        定義の反映
      </button>
    </div>
  </div>
</div>
```

以降は基本形からの差分のみを示す。

## バリエーション

### Vertical（縦積み）

説明とボタンを縦に積む。`imds-box-action` と内側のアイテム div の両方に `is-flex-direction-column` を付与する。

```html
<div class="imds-box-action is-flex-direction-column">
  <div class="is-flex-direction-column">
    <div>
      <strong>定義の反映</strong>
      <p>定義の反映についての説明</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        定義の反映
      </button>
    </div>
  </div>
</div>
```

### Row（複数アイテムの横並び）

`imds-box-action` 直下に複数のアイテム div を並べる。個々のアイテムには通常の横並び（クラス無し）と `is-flex-direction-column`（縦積み）を混在させられる。

```html
<div class="imds-box-action">
  <div>
    <div>
      <strong>定義の反映</strong>
      <p>定義の反映についての説明</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        定義の反映
      </button>
    </div>
  </div>
  <div>
    <div>
      <strong>定義の反映</strong>
      <p>定義の反映についての説明</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        定義の反映
      </button>
    </div>
  </div>
  <div class="is-flex-direction-column">
    <div>
      <strong>定義の反映</strong>
      <p>定義の反映についての説明</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        定義の反映
      </button>
    </div>
  </div>
</div>
```

## 実装上の注意

- BoxAction 内のボタンは **Button（imds-html-button.md）の色・状態クラスをそのまま使用する**。BoxAction 自体は色を定義しないため、`is-primary` / `is-danger` 等の意味色や `is-outlined` / `is-ghost` の variant はボタン側に付与する。
- タイトルは `strong` 要素、説明文は `p` 要素で構造化する。
- 1 アイテム内は「説明の div」＋「アクションの div」の2要素構成が基本形。
- 複数アイテムを横並びにする場合（Row パターン）は `imds-box-action` 直下にアイテム div を複数並べる。個別アイテムを縦積みにしたい場合はそのアイテム div にのみ `is-flex-direction-column` を付与する。
