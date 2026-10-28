---
paths:
  - "src/main/jssp/**/*.html"
---

# 不确定状态的复选框（common-parts）

## 基本信息

表示多个选项中部分被选中的状态（不确定状态）时使用的复合模式。
在组合使用「全选/全部取消」复选框与各个选项的场景中需要使用。可同时适用于表格的全行选择和复选框列表的全选。

- 来源: `uiux-share/common-parts/不確定状態のチェックボックス.md`
- 子复选框全部选中 → 父复选框为 `checked`
- 子复选框全部未选中 → 父复选框为 `unchecked`
- 子复选框部分选中 → 父复选框为 `indeterminate`（三态）

## 构成组件

| 使用的基础组件 | 对应 reference |
|---|---|
| Checkbox（`imds-checkbox`） | [imds-html-checkbox.md](imds-html-checkbox.md) |
| Divider（`imds-divider`） | [imds-html-divider.md](imds-html-divider.md) |

## HTML 代码片段

`data-type="overall"` 表示父复选框（全选），`data-type="ingredient"` 表示子复选框（各个选项）。
用 `imds-divider` 在视觉上分隔父复选框与子复选框。

```html
<label class="imds-checkbox">
  <input type="checkbox" data-type="overall" />
  <span>全部</span>
</label>
<hr class="imds-divider" />
<label class="imds-checkbox">
  <input type="checkbox" data-type="ingredient" />
  <span>[REPLACE: 选项1]</span>
</label>
<label class="imds-checkbox">
  <input type="checkbox" data-type="ingredient" />
  <span>[REPLACE: 选项2]</span>
</label>
<label class="imds-checkbox">
  <input type="checkbox" data-type="ingredient" />
  <span>[REPLACE: 选项3]</span>
</label>
```

## JS 控制

`indeterminate` 属性无法通过 HTML 属性设置，因此通过 JavaScript 控制。
同一画面中存在多个分组时，应将 `data-type` 的获取对象限定在相应的容器（父元素）内以缩小作用范围。

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

## 实现注意事项

- 应用于表格的表头复选框（全行选择）时，不要在 `label.imds-checkbox` 内添加多余的 `<span></span>`（在表格上下文中只使用 `input`，不附加 `span`。详细信息请参考 [imds-html-table.md](imds-html-table.md)）。本模式的 `<label class="imds-checkbox"><input/><span>...</span></label>` 是表格外（复选框列表等）的标准形式。
- 复选框分组不使用 `fieldset`/`legend`。imds 的实际模式仅由并列的 `label.imds-checkbox` 构成。
- `indeterminate` 是只能通过 JavaScript 设置的属性，即使以 HTML 属性形式写成 `<input indeterminate>` 也不会生效。
