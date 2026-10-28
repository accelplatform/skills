# CheckboxGroup

## 基本信息

CheckboxGroup 是控制 Checkbox 排列方向的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-checkboxgroup--documentation
- 基础类: imds-checkbox-group

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-checkbox-group | div 元素 | 复选框组容器 | 必须 |
| is-vertical | imds-checkbox-group | 纵向排列 | 可选 |
| is-horizontal | imds-checkbox-group | 横向排列 | 可选 |

## HTML 代码片段

### 基本复选框组

```html
<div class="imds-checkbox-group">
  <label class="imds-checkbox">
    <input type="checkbox" />
    <span>Label-1</span>
  </label>
  <label class="imds-checkbox">
    <input type="checkbox" />
    <span>Label-2</span>
  </label>
  <!-- 根据需要重复相同结构的 label -->
</div>
```

以下仅显示与基本复选框组的差异部分。

## 变体

### alignment（排列方向）

在 `div.imds-checkbox-group` 上添加排列类。

```html
<div class="imds-checkbox-group is-vertical">    <!-- 纵向排列 -->
<div class="imds-checkbox-group is-horizontal">  <!-- 横向排列 -->
```

## 组合示例

### 与标签组合

在输入表单中使用时，用 Field 包裹。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-checkbox-group is-vertical">
      <label class="imds-checkbox">
        <input type="checkbox" />
        <span>Label-1</span>
      </label>
      <!-- 根据需要重复相同结构的 label -->
    </div>
  </div>
</div>
```

### 验证错误

在 `div.imds-field` 上添加 `imds-validation-error`，并在末尾添加错误消息。

```html
<div class="imds-field imds-validation-error">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-checkbox-group is-vertical">
      <label class="imds-checkbox">
        <input type="checkbox" />
        <span>Label-1</span>
      </label>
      <!-- 根据需要重复相同结构的 label -->
    </div>
  </div>
  <span class="imds-error-text">在此处显示错误消息。</span>
</div>
```

### 等间距排列（imds-w-33）

选项较多跨越多行时，为提高可读性，在 `div.imds-checkbox-group` 上添加 `imds-w-33`，将各选项等间距（三等分）排列。即使标签字数参差不齐，列也不会错位。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:ra:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-checkbox-group is-horizontal imds-w-33">
      <label class="imds-checkbox">
        <input type="checkbox" />
        <span>xxxxxxxxxx</span>
      </label>
      <label class="imds-checkbox">
        <input type="checkbox" />
        <span>xxx</span>
      </label>
      <label class="imds-checkbox">
        <input type="checkbox" />
        <span>xxxxx</span>
      </label>
      <!-- 根据需要重复相同结构的 label -->
    </div>
  </div>
</div>
```

不添加 `imds-w-33` 时，下一选项的起始位置会因选项字数不同而参差不齐，降低可读性（NG 示例），因此选项较多时必须添加。

## 无障碍支持

- 选项较多跨越多行时，为提高可读性，使用 `imds-w-33` 等间距排列

## 实现注意事项

- 复选框组使用 `div.imds-checkbox-group > label.imds-checkbox` 结构编写
- 各复选框的结构遵循 Checkbox 组件规范
- 在输入表单中使用时，需用 Field（`imds-field`）包裹
- 验证错误时，在 `imds-field` 上添加 `imds-validation-error`，并用 `imds-error-text` 显示错误消息
- 不使用 `fieldset`/`legend`。分组使用 `imds-field` + `imds-checkbox-group` + `label` 的组合（实际 DOM 中不存在使用 `fieldset`/`legend` 的示例）
- 选项较多跨越多行时，添加 `imds-w-33` 进行等间距排列
