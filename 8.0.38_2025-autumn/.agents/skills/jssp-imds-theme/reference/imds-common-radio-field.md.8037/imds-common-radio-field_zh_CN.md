# ラジオボタンとFieldの組み合わせ（common-parts）

## 基本情報

ラジオボタンの選択に応じて、常時表示されている子フィールドを `disabled`/`enabled` で制御する場合に使用する複合パターンである。
選択肢が存在しない（動的に取得できない）場合は `imds-inline-message is-warning` を表示する。

- 抽出元: `uiux-share/common-parts/ラジオボタンとFieldの組み合わせ.md`
- 設定画面・詳細設定フォームでラジオ選択により子設定項目を有効化する場合に用いる。

**既存パターン「ラジオ条件分岐＋子FieldGroup展開」との使い分け**:
- 子フィールドを「表示/非表示」で制御する場合（JS の `display` 切り替え）は別パターンを使う。
- 本パターンは、子フィールドを「有効/無効」で制御する（HTML の `disabled` 属性）。フィールドは常時見えており、非活性状態で提示する。

## 構成コンポーネント

| 使用する基本コンポーネント | 対応 reference |
|---|---|
| Radio（`imds-radio`） | [imds-html-radio.md](imds-html-radio.md) |
| Field（`imds-field`） | [imds-html-field.md](imds-html-field.md) |
| Select（`imds-select`） | [imds-html-select.md](imds-html-select.md) |
| Checkbox（`imds-checkbox`） | [imds-html-checkbox.md](imds-html-checkbox.md) |
| InlineMessage（`imds-inline-message`） | [imds-html-inline-message.md](imds-html-inline-message.md) |

## 重要な注意（`name` 属性）

ラジオボタンで排他選択を成立させるには、同一グループの `<input type="radio">` すべてに**同じ `name` 属性**を必ず付与すること。
`name` が無いと、それぞれが独立した選択肢として扱われ排他選択にならない。詳細は [imds-html-radio-group.md](imds-html-radio-group.md) を参照。
本パターンの HTML スニペットは全例で `name="[REPLACE: radio-name]"` を付与している。この命名を省略してはならない。

## HTML スニペット

### パターン 1: 選択肢がある場合（利用しないがデフォルト選択）

子フィールドは `disabled` で始まり、「利用する」を選択したときに JS で `disabled` を解除する。
子フィールドは親ラジオより字下げ（`padding-left: var(--space-6)` 相当）して従属関係を示す。`sample-*` クラスは使わず、インラインスタイルで代替する。

```html
<div class="imds-section">
  <h1 class="imds-heading is-bordered">[REPLACE: セクションタイトル]</h1>
  <p class="imds-help-text">[REPLACE: 説明文]</p>

  <!-- ラジオ + 子フィールドコンテナ -->
  <div style="display: flex; flex-direction: column; gap: var(--space-3);">

    <!-- 「利用しない」ラジオ -->
    <label class="imds-radio has-text-weight-bold">
      <input type="radio" name="[REPLACE: radio-name]" value="[REPLACE: off-value]" checked />
      <span>[REPLACE: 利用しないラベル]</span>
    </label>

    <!-- 「利用する」ラジオ + 子フィールド -->
    <div style="display: flex; flex-direction: column; gap: var(--space-2);">
      <label class="imds-radio has-text-weight-bold">
        <input type="radio" name="[REPLACE: radio-name]" value="[REPLACE: on-value]" />
        <span>[REPLACE: 利用するラベル]</span>
      </label>

      <!-- 子フィールド（字下げ: var(--space-6)）初期は disabled -->
      <div style="padding-left: var(--space-6); display: flex; flex-direction: column; gap: var(--space-2);">
        <div class="imds-field">
          <div class="imds-field-label">
            <label for="[REPLACE: select-id]">[REPLACE: フィールドラベル]</label>
          </div>
          <div class="imds-field-control">
            <select class="imds-select" id="[REPLACE: select-id]" disabled>
              <option value="">[REPLACE: 選択してください]</option>
              <option value="[REPLACE: value1]">[REPLACE: 選択肢1]</option>
            </select>
          </div>
        </div>
        <div class="imds-field">
          <div class="imds-field-control">
            <label class="imds-checkbox">
              <input type="checkbox" disabled />
              <span>[REPLACE: チェックボックスラベル]</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

> 上記の 2 つ目の `imds-field`（チェックボックス用）は `imds-field-label` を持たない。ラベルが不要な単一コントロールの Field は `imds-field-control` のみで構成してよい（詳細は [imds-html-field.md](imds-html-field.md) を参照）。

### パターン 2: 選択肢がない場合（「利用する」を disabled に）

「利用する」のラジオ自体を `disabled` にし、子フィールドの代わりに警告メッセージを表示する。

```html
<div style="display: flex; flex-direction: column; gap: var(--space-2);">
  <label class="imds-radio has-text-weight-bold">
    <input type="radio" name="[REPLACE: radio-name]" value="[REPLACE: on-value]" disabled />
    <span>[REPLACE: 利用するラベル]</span>
  </label>
  <div style="padding-left: var(--space-6);">
    <div class="imds-inline-message is-warning">
      <span class="imds-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
      <p>[REPLACE: 選択できる項目がありません等の警告文]</p>
    </div>
  </div>
</div>
```

## 実装上の注意

- 同一グループのラジオには必ず同じ `name` 属性を付与すること（上記「重要な注意」参照）。
- 子フィールドの字下げは `padding-left: var(--space-6)` をインラインスタイルで指定する。`sample-*` の説明用クラスは生成物に含めない。
- 「利用する」選択時に JS で子フィールド内のすべての `disabled` 属性を解除し、「利用しない」選択時に再度 `disabled` を付与する制御を実装すること。
- 選択肢が動的に取得できず 0 件の場合は、ラジオを無効化して `imds-inline-message is-warning` に差し替える（パターン2）。
