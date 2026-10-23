---
paths:
  - "src/main/jssp/**/*.html"
---

# 数据列表与输入元素的组合（common-parts）

## 基本信息

在输入框中显示候选列表，同时允许选择和自由输入时使用的复合模式。
组合使用 `<input list="...">` 与 `<datalist>`，利用浏览器原生的自动补全 UI。

- 适用于选项较少（约 20 项以内）且允许自由输入的场景。
- 选项较多，或不允许自由输入而要求必须选择时，应使用 `<select>` + `imds-select`（[imds-html-select.md](imds-html-select.md)）。不使用本模式。
- 来源: `uiux-share/common-parts/データリストと入力要素の組み合わせ.md`

## 构成组件

| 使用的基础组件 | 对应 reference |
|---|---|
| Textbox（`imds-textbox`） | [imds-html-textbox.md](imds-html-textbox.md) |
| Field（`imds-field`） | [imds-html-field.md](imds-html-field.md) |

`<datalist>` 本身是不带 imds 专有类的标准 HTML 元素，不属于 imds 的组件体系。

## HTML 代码片段

### 单独使用（无 Field）

```html
<div>
  <input
    type="text"
    id="[REPLACE: input-id]"
    placeholder="请输入或选择"
    class="imds-textbox"
    list="[REPLACE: datalist-id]"
    value="" />
  <datalist id="[REPLACE: datalist-id]">
    <option value="[REPLACE: 选项1]"></option>
    <option value="[REPLACE: 选项2]"></option>
    <option value="[REPLACE: 选项3]"></option>
  </datalist>
</div>
```

### 与 Field 组合使用

将 `<input>` 和 `<datalist>` 放置在 `imds-field-control` 内。Field 本身的结构请参考 [imds-html-field.md](imds-html-field.md)。

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label for="[REPLACE: input-id]">[REPLACE: 标签]</label>
  </div>
  <div class="imds-field-control">
    <input
      type="text"
      id="[REPLACE: input-id]"
      placeholder="请输入或选择"
      class="imds-textbox"
      list="[REPLACE: datalist-id]" />
    <datalist id="[REPLACE: datalist-id]">
      <option value="[REPLACE: 选项1]"></option>
      <option value="[REPLACE: 选项2]"></option>
    </datalist>
  </div>
</div>
```

## 实现注意事项

- `<input>` 的 `list` 属性必须与 `<datalist>` 的 `id` 一致。
- 替换 `id`（`input-id` / `datalist-id`）时，应确保其在画面内唯一。
- `<input>` 的类与普通 `imds-textbox` 相同，不存在数据列表专用的类。
- 由于使用浏览器原生的自动补全 UI，候选项的外观（字体、配色）无法通过 imds 自定义。
