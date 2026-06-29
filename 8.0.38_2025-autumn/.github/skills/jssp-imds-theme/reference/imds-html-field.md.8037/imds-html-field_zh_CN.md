---
paths:
  - "src/main/jssp/**/*.html"
---

# Field

## 基本信息

Field 是用于用户输入或选择数据的组件。
作为表单的构成要素使用。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-field-field--documentation
- 基础类: imds-field

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-field | 外层 div | 字段容器 | 必须 |
| imds-field-label | div 元素 | 标签区域 | 必须 |
| imds-field-control | div 元素 | 控件区域 | 必须 |
| is-vertical | imds-field | 垂直布局（标签在上方） | 可选 |
| is-horizontal | imds-field | 水平布局（标签在左侧） | 可选 |
| imds-w-15 | imds-field | 标签宽度 15% | 可选 |
| imds-w-25 | imds-field | 标签宽度 25% | 可选 |
| imds-w-30 | imds-field | 标签宽度 30% | 可选 |
| imds-w-150px | imds-field | 标签宽度 150px | 可选 |
| imds-w-250px | imds-field | 标签宽度 250px | 可选 |
| imds-required-label-required-asterisk | label 元素 | 星号（*）必填标记 | 可选 |
| imds-required-label-required | label 元素 | "必填"文本标记 | 可选 |
| imds-required-label-optional | label 元素 | "可选"文本标记 | 可选 |
| imds-validation-error | imds-field | 验证错误状态 | 可选 |
| imds-help-text | span 元素 | 帮助文本 | 可选 |
| imds-error-text | span 元素 | 错误消息 | 可选 |

## HTML 代码片段

### 基本字段

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label
      data-required-label="default"
      for=":r1:">
      Label
    </label>
  </div>
  <div class="imds-field-control">
    <input
      type="text"
      id=":r1:"
      class="imds-textbox"
      value="" />
  </div>
</div>
```

以下仅显示与基本字段的差异部分。

## 变体

### alignment（布局方向）

在 `div.imds-field` 上添加类。

```html
<div class="imds-field is-vertical">    <!-- 垂直（标签在上方） -->
<div class="imds-field is-horizontal">  <!-- 水平（标签在左侧） -->
```

### labelWidth（标签宽度）

在 `div.imds-field` 上添加类。
水平布局时有效。

```html
<div class="imds-field imds-w-15">     <!-- 15% -->
<div class="imds-field imds-w-25">     <!-- 25% -->
<div class="imds-field imds-w-30">     <!-- 30% -->
<div class="imds-field imds-w-150px">  <!-- 150px -->
<div class="imds-field imds-w-250px">  <!-- 250px -->
```

### required（必填/可选标记）

在 `label` 元素上添加类和 `data-required-label` 属性。

```html
<!-- 星号（*） -->
<label class="imds-required-label-required-asterisk" for=":r1:">Label</label>

<!-- "必填"标记 -->
<label class="imds-required-label-required" for=":r1:" data-required-label="必填">Label</label>

<!-- "可选"标记 -->
<label class="imds-required-label-optional" for=":r1:" data-required-label="可选">Label</label>
```

## 组合示例

### 帮助文本

在 `imds-field` 末尾添加 `imds-help-text`。

```html
<div class="imds-field">
  <!-- 省略 imds-field-label、imds-field-control -->
  <span class="imds-help-text">最多可输入50个半角字母数字字符。</span>
</div>
```

### 验证错误

在 `div.imds-field` 上添加 `imds-validation-error`，并在末尾添加 `imds-error-text`。

```html
<div class="imds-field imds-validation-error">
  <!-- 省略 imds-field-label、imds-field-control -->
  <span class="imds-error-text">在此处显示错误消息。</span>
</div>
```

## 实现注意事项

- `label` 的 `for` 属性与 `input` 的 `id` 属性必须匹配（`:r1:` 为占位符）
- `data-required-label="default"` 为默认必填显示（无标记）
- `imds-help-text` 和 `imds-error-text` 放置在 `imds-field-control` 之后
- 添加 `imds-validation-error` 后，输入控件的边框也会变为红色
