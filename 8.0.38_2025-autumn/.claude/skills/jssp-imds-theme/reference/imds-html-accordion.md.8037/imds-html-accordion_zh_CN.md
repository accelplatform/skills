---
paths:
  - "src/main/jssp/**/*.html"
---

# Accordion

## 基本信息

Accordion 是在不需要始终显示的区域保持折叠状态时使用的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-accordion-accordion--documentation
- 基础类: imds-accordion

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-accordion | 容器 div | 手风琴容器 | 必须 |
| imds-accordion-title | label 元素 | 标题部分 | 必须 |
| imds-accordion-title-inner | span 元素 | 标题文本和说明的包装器 | 必须 |
| imds-accordion-caption | span 元素 | 标题下方的补充文本 | 可选 |
| imds-accordion-chevron | span 元素 | 开关折叠图标 | 必须 |
| imds-accordion-content | div 元素 | 内容面板 | 必须 |
| imds-icon | span 元素 | 图标通用类（用于折叠图标） | 必须 |
| is-small | imds-icon | 图标小尺寸 | 可选 |
| is-outlined | imds-accordion | 四边均有边框 | 可选 |
| is-borderless | imds-accordion | 不显示边框 | 可选 |
| is-left | imds-accordion | 折叠图标左对齐 | 可选 |
| is-right | imds-accordion | 折叠图标右对齐 | 可选 |
| is-primary | imds-icon | 将折叠图标更改为主色 | 可选 |
| is-x-small | imds-accordion | 超小尺寸 | 可选 |
| is-small | imds-accordion | 小尺寸 | 可选 |
| is-normal | imds-accordion | 标准尺寸 | 可选 |
| is-medium | imds-accordion | 中等尺寸 | 可选 |
| is-large | imds-accordion | 大尺寸 | 可选 |
| is-gray | imds-accordion-title | 将标题背景色改为灰色 | 可选 |
| is-light | imds-accordion-title | 浅灰色（与 is-gray 配合使用） | 可选 |
| has-text-weight-bold | imds-accordion-title | 标题加粗 | 可选 |
| has-text-weight-normal | imds-accordion-title | 标题为标准粗细 | 可选 |
| imds-tag | span 元素 | 标签元素（放置在 imds-accordion-title 内） | 可选 |

## HTML 代码片段

### 基本手风琴

```html
<div class="imds-accordion">
  <input
    type="checkbox"
    id="todo-replace-:r1:" />
  <label
    for="todo-replace-:r1:"
    class="imds-accordion-title">
    <span class="imds-accordion-title-inner">
      <span>Accordion Title</span>
      <span class="imds-accordion-caption">Caption (Sub Title)</span>
    </span>
    <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
  </label>
  <div class="imds-accordion-content"><div class="imds-px-4 imds-py-3">Content</div></div>
</div>
```

以下代码片段均仅显示与基本手风琴的差异部分。

## 变体

### accordionStyle（边框）

在 `div.imds-accordion` 上添加类。默认仅在上下方向显示简单边框。

```html
<!-- 四边均有边框 -->
<div class="imds-accordion is-outlined">

<!-- 无边框 -->
<div class="imds-accordion is-borderless">
```

### titleBackgroundColor（标题背景色）

在 `label.imds-accordion-title` 上添加类。

```html
<!-- 灰色背景 -->
<label class="imds-accordion-title is-gray">

<!-- 浅灰色背景 -->
<label class="imds-accordion-title is-gray is-light">
```

### titleFontWeight（标题字体粗细）

在 `label.imds-accordion-title` 上添加类。

```html
<!-- 加粗 -->
<label class="imds-accordion-title has-text-weight-bold">

<!-- 标准粗细 -->
<label class="imds-accordion-title has-text-weight-normal">
```

### isOpen（初始展开状态）

在 `input[type="checkbox"]` 上添加 `checked` 属性。

```html
<input type="checkbox" id="todo-replace-:r1:" checked />
```

### disabled（禁用状态）

在 `input[type="checkbox"]` 上添加 `disabled` 属性。

```html
<input type="checkbox" id="todo-replace-:r1:" disabled />
```

### chevronIconPosition（折叠图标位置）

在 `div.imds-accordion` 上添加类。默认为右对齐。

```html
<!-- 折叠图标左对齐 -->
<div class="imds-accordion is-left">
```

### chevronIconColor（折叠图标颜色）

在 `span.imds-icon` 上添加 `is-primary`。

```html
<span class="imds-icon is-small is-primary imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
```

### size（尺寸）

在 `div.imds-accordion` 上添加尺寸类。

```html
<div class="imds-accordion is-x-small">  <!-- 超小 -->
<div class="imds-accordion is-small">    <!-- 小 -->
<div class="imds-accordion is-normal">   <!-- 标准 -->
<div class="imds-accordion is-medium">   <!-- 中 -->
<div class="imds-accordion is-large">    <!-- 大 -->
```

### titleOnly（仅标题）

省略说明，直接在 `imds-accordion-title-inner` 中放置文本。

```html
<span class="imds-accordion-title-inner">Accordion Title</span>
```

## 组合示例

### 与 Tag 组合

在 `label.imds-accordion-title` 内折叠图标后面放置 `imds-tag` 元素。

```html
<label
  for="todo-replace-:r1:"
  class="imds-accordion-title">
  <span class="imds-accordion-title-inner">
    <span>Accordion Title</span>
    <span class="imds-accordion-caption">caption</span>
  </span>
  <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
  <span class="imds-tag is-yellow is-small"><span>warning</span></span>
</label>
```

### 与 Icon 组合

在标题开头（`imds-accordion-title-inner` 前面）放置 `imds-icon` 元素。

```html
<label
  for="todo-replace-:r1:"
  class="imds-accordion-title">
  <span class="imds-icon"><i class="fa-solid fa-circle-check"></i></span>
  <span class="imds-accordion-title-inner">
    <span>Accordion Title</span>
    <span class="imds-accordion-caption">caption</span>
  </span>
  <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
</label>
```

可用图标示例：
- `fa-solid fa-circle-check` - 完成・成功
- `fa-solid fa-triangle-exclamation` - 警告
- `fa-solid fa-circle-info` - 信息・补充

## 无障碍支持

- 使 `input[type="checkbox"]` 与 `label` 的 `id` / `for` 属性匹配，以便通过点击进行开关操作
- 确保同一页面内 `id` 不重复（放置多个手风琴时需为每个分配唯一的 `id`）
- 添加 `disabled` 属性后，屏幕阅读器也会告知用户该元素不可操作
- 注意内容区域（`imds-accordion-content`）内的文本和元素在手风琴关闭状态下也存在于 DOM 中，屏幕阅读器可能会读取它们

## 实现注意事项

- `id` 属性必须替换为唯一值（`todo-replace-:r1:` 为占位符）
- 由于开关基于 checkbox，不需要 JavaScript；但若要以编程方式控制开关状态，请操作 `checked` 属性
- `imds-accordion-content` 内的内边距通过 `imds-px-4 imds-py-3` 调整，可根据内容进行修改
- 若要将多个手风琴分组，请使用 [accordion-group](accordion-group.md)
