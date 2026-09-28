---
paths:
  - "src/main/jssp/**/*.html"
---

# Button

## 基本信息

Button 是用户点击后执行注册、搜索或跳转到其他页面等操作的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-button-button--documentation
- 基础类: imds-button

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-button | button 元素 | 按钮元素 | 必须 |
| imds-button-text | span 元素 | 按钮文本（与图标并用时） | 条件必须 |
| is-outlined | imds-button | 仅有边框的浅色显示样式 | 可选 |
| is-ghost | imds-button | 无边框的透明样式 | 可选 |
| is-primary | imds-button | 主要操作用的主色 | 可选 |
| is-danger | imds-button | 用于删除・警告等危险操作 | 可选 |
| is-dark | imds-button | 深色 | 可选 |
| is-x-small | imds-button | 超小尺寸 | 可选 |
| is-small | imds-button | 小尺寸 | 可选 |
| is-normal | imds-button | 标准尺寸 | 可选 |
| is-medium | imds-button | 中等尺寸 | 可选 |
| is-large | imds-button | 大尺寸 | 可选 |

## HTML 代码片段

### 基本按钮

```html
<button
  type="button"
  class="imds-button">
  Button
</button>
```

以下仅显示与基本按钮的差异部分。所有变体均在 `button.imds-button` 上添加类或属性。

## 变体

### borderStyle（边框）

```html
<button type="button" class="imds-button is-outlined">Button</button>  <!-- 仅边框 -->
<button type="button" class="imds-button is-ghost">Button</button>     <!-- 无边框 -->
```

### color（颜色）

可与 `is-outlined` 或 `is-ghost` 组合使用。

```html
<button type="button" class="imds-button is-primary">Button</button>  <!-- 主色 -->
<button type="button" class="imds-button is-danger">Button</button>   <!-- 危险 -->
<button type="button" class="imds-button is-dark">Button</button>     <!-- 深色 -->
```

### size（尺寸）

```html
<button type="button" class="imds-button is-x-small">Button</button>  <!-- 超小 -->
<button type="button" class="imds-button is-small">Button</button>    <!-- 小 -->
<button type="button" class="imds-button is-normal">Button</button>   <!-- 标准 -->
<button type="button" class="imds-button is-medium">Button</button>   <!-- 中 -->
<button type="button" class="imds-button is-large">Button</button>    <!-- 大 -->
```

### disabled（禁用状态）

在 `button` 元素上添加 `disabled` 属性。不可点击，视觉上呈灰色。

```html
<button type="button" class="imds-button" disabled>Button</button>
```

## 组合示例

### 与 Icon 组合

带图标按钮的详细内容请参阅 [icon-button.md](icon-button.md)。
同时使用图标和文本时，文本必须用 `imds-button-text` 包裹。

```html
<button type="button" class="imds-button is-primary">
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  <span class="imds-button-text">搜索</span>
</button>
```

## 实现注意事项

- 同时使用图标和文本时，文本必须用 `<span class="imds-button-text">` 包裹，不得直接放置文本节点。详情请参阅 [icon-button.md](icon-button.md)
- `is-outlined` 和 `is-ghost` 互斥使用（不同时添加）
- 颜色类和样式类可以组合使用（例如：`is-outlined is-primary`、`is-ghost is-danger`）
