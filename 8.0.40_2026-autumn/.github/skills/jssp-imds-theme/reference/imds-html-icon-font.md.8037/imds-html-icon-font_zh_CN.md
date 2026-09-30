---
paths:
  - "src/main/jssp/**/*.html"
---

# IconFont

## 基本信息

IconFont 使用 `<i>` 标签显示图标。
使用主题时，可以使用 Font Awesome 和 `imds-iconfont` 的图标。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-icon-iconfont--documentation
- 基础类: imds-icon

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-icon | span 元素 | 图标包装器 | 必须 |
| is-primary | imds-icon | 主色 | 可选 |
| is-warning | imds-icon | 警告色 | 可选 |
| is-danger | imds-icon | 危险色 | 可选 |
| is-success | imds-icon | 成功色 | 可选 |
| is-info | imds-icon | 信息色 | 可选 |
| is-error | imds-icon | 错误色 | 可选 |
| is-blue | imds-icon | 蓝色 | 可选 |
| is-green | imds-icon | 绿色 | 可选 |
| is-red | imds-icon | 红色 | 可选 |
| is-yellow | imds-icon | 黄色 | 可选 |
| is-orange | imds-icon | 橙色 | 可选 |
| is-cyan | imds-icon | 青色 | 可选 |
| is-gray | imds-icon | 灰色 | 可选 |
| is-gray-light | imds-icon | 浅灰色 | 可选 |
| is-white | imds-icon | 白色 | 可选 |
| is-x-small | imds-icon | 超小尺寸 | 可选 |
| is-small | imds-icon | 小尺寸 | 可选 |
| is-normal | imds-icon | 标准尺寸 | 可选 |
| is-medium | imds-icon | 中等尺寸 | 可选 |
| is-large | imds-icon | 大尺寸 | 可选 |

## HTML 代码片段

### 基本图标

```html
<span class="imds-icon" title="信息图标">
  <i class="fa-solid fa-circle-info"></i>
</span>
```

以下仅显示与基本图标的差异部分。

## 变体

### iconName（图标类型）

更改 `<i>` 元素的类。可以使用 Font Awesome 6 和 `imds-iconfont`。

```html
<i class="fa-solid fa-circle-check"></i>
<i class="fa-solid fa-triangle-exclamation"></i>
<i class="fa-solid fa-circle-info"></i>
```

### color（颜色）

在 `span.imds-icon` 上添加颜色类。

```html
<span class="imds-icon is-primary">   <!-- 主色 -->
<span class="imds-icon is-success">   <!-- 成功 -->
<span class="imds-icon is-warning">   <!-- 警告 -->
<span class="imds-icon is-danger">    <!-- 危险 -->
<span class="imds-icon is-info">      <!-- 信息 -->
<span class="imds-icon is-error">     <!-- 错误 -->
```

其他：`is-blue`、`is-green`、`is-red`、`is-yellow`、`is-orange`、`is-cyan`、`is-gray`、`is-gray-light`、`is-white`

### size（尺寸）

在 `span.imds-icon` 上添加尺寸类。

```html
<span class="imds-icon is-x-small">  <!-- 超小 -->
<span class="imds-icon is-small">    <!-- 小 -->
<span class="imds-icon is-normal">   <!-- 标准 -->
<span class="imds-icon is-medium">   <!-- 中 -->
<span class="imds-icon is-large">    <!-- 大 -->
```

## 组合示例

### 与 Button 组合

```html
<!-- 带文本的按钮 -->
<button type="button" class="imds-button is-primary">
  <span class="imds-icon"><i class="fa-solid fa-add"></i></span>
  <span class="imds-button-text">新建</span>
</button>

<!-- 仅图标按钮 -->
<button type="button" class="imds-button is-outlined is-primary" aria-label="添加">
  <span class="imds-icon is-primary"><i class="fa-solid fa-add"></i></span>
</button>
```

### 与 Tag 组合

```html
<span class="imds-tag is-green is-light">
  <span class="imds-icon is-success"><i class="fa-solid fa-circle-check"></i></span>
  <span>Success</span>
</span>
```

## 实现注意事项

- 仅通过图标传达含义时，添加 `title` 属性或 `aria-label` 以确保无障碍性
- 装饰性图标添加 `aria-hidden="true"` 以对屏幕阅读器隐藏
- 仅图标按钮需在 `button` 元素上添加 `aria-label`
