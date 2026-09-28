---
paths:
  - "src/main/jssp/**/*.html"
---

# IconButton

## 基本信息

IconButton 是带图标的按钮组件。
由于图标比纯文本更能引导视线，在想要更加突出显示的位置使用。
关于 Button 的通用用法和注意事项，请参阅 Button 文档。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-button-iconbutton--documentation
- 基础类: imds-button
- 关于基本按钮的详细信息，请参阅 [button](button.md)

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-button | button 元素 | 按钮元素 | 必须 |
| imds-button-text | span 元素 | 按钮文本的包装器 | 必须 |
| imds-icon | span 元素 | 图标的包装器 | 必须 |
| is-x-small | imds-icon | 图标超小尺寸（用于右侧折叠图标） | 可选 |
| is-outlined | imds-button | 仅有边框的浅色显示样式 | 可选 |
| is-ghost | imds-button | 无边框的透明样式 | 可选 |
| is-primary | imds-button | 主色 | 可选 |
| is-danger | imds-button | 危险操作用颜色 | 可选 |
| is-dark | imds-button | 深色 | 可选 |
| is-x-small | imds-button | 超小尺寸 | 可选 |
| is-small | imds-button | 小尺寸 | 可选 |
| is-normal | imds-button | 标准尺寸 | 可选 |
| is-medium | imds-button | 中等尺寸 | 可选 |
| is-large | imds-button | 大尺寸 | 可选 |
| is-applied | imds-button | 已应用状态的样式 | 可选 |

## HTML 代码片段

### 基本图标按钮

```html
<button
  type="button"
  class="imds-button">
  <span class="imds-icon"><i class="fa-solid fa-circle-check"></i></span>
  <span class="imds-button-text">Button</span>
  <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
</button>
```

左侧图标和右侧图标均可省略。以下仅显示与基本图标按钮的差异部分。

## 变体

### title（工具提示）

在 `button` 元素上添加 `title` 属性。

```html
<button type="button" class="imds-button" title="description">
```

### buttonStyle（边框）

```html
<button type="button" class="imds-button is-outlined">  <!-- 仅边框 -->
<button type="button" class="imds-button is-ghost">     <!-- 无边框 -->
```

### color（颜色）

可与 `is-outlined` 或 `is-ghost` 组合使用。

```html
<button type="button" class="imds-button is-primary">  <!-- 主色 -->
<button type="button" class="imds-button is-danger">   <!-- 危险 -->
<button type="button" class="imds-button is-dark">     <!-- 深色 -->
```

### size（尺寸）

```html
<button type="button" class="imds-button is-x-small">  <!-- 超小 -->
<button type="button" class="imds-button is-small">    <!-- 小 -->
<button type="button" class="imds-button is-normal">   <!-- 标准 -->
<button type="button" class="imds-button is-medium">   <!-- 中 -->
<button type="button" class="imds-button is-large">    <!-- 大 -->
```

### isApplied（已应用状态）

表示过滤器等设置已被应用的样式。
左侧图标的右上角显示一个小徽章。

```html
<button type="button" class="imds-button is-applied">
```

### disabled（禁用状态）

在 `button` 元素上添加 `disabled` 属性。不可点击，视觉上呈灰色。

```html
<button type="button" class="imds-button" disabled>
```
