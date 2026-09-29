# Tag

## 基本信息

Tag 是用于简洁直观地表示画面和处理等元信息、状态的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-tag--documentation
- 基础类: imds-tag

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-tag | span 元素 | 标签容器 | 必须 |
| is-rounded | imds-tag | 圆角样式 | 可选 |
| is-blue | imds-tag | 蓝色 | 可选 |
| is-green | imds-tag | 绿色 | 可选 |
| is-red | imds-tag | 红色 | 可选 |
| is-yellow | imds-tag | 黄色 | 可选 |
| is-orange | imds-tag | 橙色 | 可选 |
| is-cyan | imds-tag | 青色 | 可选 |
| is-gray | imds-tag | 灰色 | 可选 |
| is-gray-light | imds-tag | 浅灰色 | 可选 |
| is-light | imds-tag | 明亮色调 | 可选 |
| is-dark | imds-tag | 深色色调 | 可选 |
| is-x-small | imds-tag | 超小尺寸 | 可选 |
| is-small | imds-tag | 小尺寸 | 可选 |
| is-normal | imds-tag | 标准尺寸 | 可选 |
| is-medium | imds-tag | 中等尺寸 | 可选 |
| is-large | imds-tag | 大尺寸 | 可选 |

## HTML 代码片段

### 基本标签

```html
<span class="imds-tag"><span>text</span></span>
```

以下各节仅展示与基本标签的差异。

## 变体

### tagStyle（样式）

在 `span.imds-tag` 上添加 `is-rounded`。

```html
<span class="imds-tag is-rounded"><span>text</span></span>
```

### color（颜色）

在 `span.imds-tag` 上添加颜色类。

```html
<span class="imds-tag is-blue">        <!-- 蓝色 -->
<span class="imds-tag is-green">       <!-- 绿色 -->
<span class="imds-tag is-red">         <!-- 红色 -->
<span class="imds-tag is-yellow">      <!-- 黄色 -->
<span class="imds-tag is-orange">      <!-- 橙色 -->
<span class="imds-tag is-cyan">        <!-- 青色 -->
<span class="imds-tag is-gray">        <!-- 灰色 -->
<span class="imds-tag is-gray-light">  <!-- 浅灰色 -->
```

### tone（色调）

在 `span.imds-tag` 上添加色调类。与颜色类组合使用。

```html
<span class="imds-tag is-blue is-light">  <!-- 明亮色调 -->
<span class="imds-tag is-blue is-dark">   <!-- 深色色调 -->
```

### size（尺寸）

在 `span.imds-tag` 上添加尺寸类。

```html
<span class="imds-tag is-x-small">  <!-- 超小 -->
<span class="imds-tag is-small">    <!-- 小 -->
<span class="imds-tag is-normal">   <!-- 标准 -->
<span class="imds-tag is-medium">   <!-- 中 -->
<span class="imds-tag is-large">    <!-- 大 -->
```

### closeIconExists（带删除按钮）

在文字后添加删除按钮。

```html
<span class="imds-tag">
  <span>text</span>
  <button title="删除">
    <span class="imds-icon"><i class="fa-solid fa-xmark"></i></span>
  </button>
</span>
```

## 组合示例

### 与 Icon 组合

在文字前添加 `imds-icon`。

```html
<span class="imds-tag">
  <span class="imds-icon"><i class="fa-solid fa-circle-check"></i></span>
  <span>text</span>
</span>
```

## 实现注意事项

- 标签使用 `span.imds-tag > span` 的嵌套结构编写
- 颜色、色调、尺寸可以组合使用（例如：`is-blue is-light is-small`）
- `is-light` 与 `is-dark` 互斥使用（不可同时添加）
- 删除按钮的点击事件通过 JavaScript 控制
- 图标与文字可同时使用，图标放置在文字前
