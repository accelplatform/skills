---
paths:
  - "src/main/jssp/**/*.html"
---

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

## 无障碍支持

- 当选项较多跨越多行时，请等间距排列以提高可读性

## 实现注意事项

- 复选框组使用 `div.imds-checkbox-group > label.imds-checkbox` 结构编写
- 各复选框的结构遵循 Checkbox 组件规范
- 在输入表单中使用时，需用 Field（`imds-field`）包裹
- 验证错误时，在 `imds-field` 上添加 `imds-validation-error`，并用 `imds-error-text` 显示错误消息
