# 不確定状態のチェックボックス（common-parts）

## 基本情報

複数の選択肢のうち一部が選択された状態（不確定状態）を表す際に使用する複合パターンである。
「全選択/全解除」チェックボックスと個別選択肢を組み合わせる場面で必要になる。テーブルの全行選択・チェックボックスリストの全選択どちらにも適用できる。

- 抽出元: `uiux-share/common-parts/不確定状態のチェックボックス.md`
- 子チェックボックスがすべて選択 → 親は `checked`
- 子チェックボックスがすべて未選択 → 親は `unchecked`
- 子チェックボックスが一部選択 → 親は `indeterminate`（三状態）

## 構成コンポーネント

| 使用する基本コンポーネント | 対応 reference |
|---|---|
| Checkbox（`imds-checkbox`） | [imds-html-checkbox.md](imds-html-checkbox.md) |
| Divider（`imds-divider`） | [imds-html-divider.md](imds-html-divider.md) |

## HTML スニペット

`data-type="overall"` が親（全選択）、`data-type="ingredient"` が子（個別選択肢）を表す。
`imds-divider` で親と子を視覚的に区切る。

```html
<label class="imds-checkbox">
  <input type="checkbox" data-type="overall" />
  <span>すべて</span>
</label>
<hr class="imds-divider" />
<label class="imds-checkbox">
  <input type="checkbox" data-type="ingredient" />
  <span>[REPLACE: 選択肢1]</span>
</label>
<label class="imds-checkbox">
  <input type="checkbox" data-type="ingredient" />
  <span>[REPLACE: 選択肢2]</span>
</label>
<label class="imds-checkbox">
  <input type="checkbox" data-type="ingredient" />
  <span>[REPLACE: 選択肢3]</span>
</label>
```

## JS 制御

`indeterminate` プロパティは HTML 属性では設定できないため、JavaScript で制御する。
複数のグループが同一画面に存在する場合は、`data-type` の取得対象を適切なコンテナ（親要素）に限定してスコープを絞ること。

```javascript
const initialize = () => {
  const overall = document.querySelector('input[data-type="overall"]');
  const ingredients = document.querySelectorAll('input[data-type="ingredient"]');

  const handleOverallClick = () => {
    const isChecked = overall.checked;
    ingredients.forEach((ingredient) => {
      ingredient.checked = isChecked;
    });
  };

  const handleIngredientClick = () => {
    const checkedCount = Array.from(ingredients).filter(
      (ingredient) => ingredient.checked
    ).length;
    overall.checked = checkedCount === ingredients.length;
    overall.indeterminate =
      checkedCount !== 0 && checkedCount !== ingredients.length;
  };

  if (overall && ingredients.length > 0) {
    overall.addEventListener('click', handleOverallClick);
    ingredients.forEach((ingredient) => {
      ingredient.addEventListener('click', handleIngredientClick);
    });
  }
};

document.addEventListener('DOMContentLoaded', initialize);
```

## 実装上の注意

- テーブルのヘッダチェックボックス（全行選択）に適用する場合、`label.imds-checkbox` 内に不要な `<span></span>` を追加しないこと（テーブル文脈では `input` のみで `span` を付けない。詳細は [imds-html-table.md](imds-html-table.md) を参照）。本パターンの `<label class="imds-checkbox"><input/><span>...</span></label>` はテーブル外（チェックボックスリスト等）での標準形である。
- チェックボックスのグルーピングに `fieldset`/`legend` は使わない。imds の実パターンは `label.imds-checkbox` の並びのみで構成する。
- `indeterminate` は JavaScript でのみ設定可能なプロパティであり、HTML 属性として `<input indeterminate>` と書いても効果がない点に注意する。
