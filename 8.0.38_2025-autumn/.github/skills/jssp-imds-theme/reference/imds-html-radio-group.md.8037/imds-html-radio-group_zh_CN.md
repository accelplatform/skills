---
paths:
  - "src/main/jssp/**/*.html"
---

# RadioGroup

## 基本信息

RadioGroup 是控制 Radio 排列方向的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-radiogroup--documentation
- 基础类: imds-radio-group

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-radio-group | div 元素 | 单选按钮组容器 | 必须 |
| is-vertical | imds-radio-group | 纵向排列 | 可选 |
| is-horizontal | imds-radio-group | 横向排列 | 可选 |

## HTML 代码片段

### 基本单选按钮组

```html
<div class="imds-radio-group">
  <label class="imds-radio">
    <input type="radio" name="todo-replace-:r1:" value="" />
    <span>Label-1</span>
  </label>
  <label class="imds-radio">
    <input type="radio" name="todo-replace-:r1:" value="" />
    <span>Label-2</span>
  </label>
  <!-- 按需重复相同的 label 结构 -->
</div>
```

以下各节仅展示与基本单选按钮组的差异。

## 变体

### alignment（排列方向）

在 `div.imds-radio-group` 上添加排列类。

```html
<div class="imds-radio-group is-vertical">    <!-- 纵向 -->
<div class="imds-radio-group is-horizontal">  <!-- 横向 -->
```

## 组合示例

### 与 Label 组合

在输入表单中使用时，用 Field 进行包裹。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-radio-group is-vertical">
      <label class="imds-radio">
        <input type="radio" name="todo-replace-:r1:" value="" />
        <span>Label-1</span>
      </label>
      <!-- 按需重复相同的 label 结构 -->
    </div>
  </div>
</div>
```

### 验证错误

在 `div.imds-field` 上添加 `imds-validation-error`，并在末尾追加错误消息。

```html
<div class="imds-field imds-validation-error">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-radio-group is-vertical">
      <label class="imds-radio">
        <input type="radio" name="todo-replace-:r1:" value="" />
        <span>Label-1</span>
      </label>
      <!-- 按需重复相同的 label 结构 -->
    </div>
  </div>
  <span class="imds-error-text">在此处显示错误消息。</span>
</div>
```

## 无障碍支持

- 同一组的单选按钮须使用相同的 `name` 属性，以实现互斥选择
- 选项较多时跨多行排列，请以等间距排列以提高可读性

## 实现注意事项

- 单选按钮组使用 `div.imds-radio-group > label.imds-radio` 的结构编写
- 每个单选按钮的结构遵循 Radio 组件规范
- 组内所有 `input` 须设置相同的 `name` 属性
- 在输入表单中使用时，用 Field（`imds-field`）进行包裹
- 验证错误时，在 `imds-field` 上添加 `imds-validation-error`，并用 `imds-error-text` 显示消息
