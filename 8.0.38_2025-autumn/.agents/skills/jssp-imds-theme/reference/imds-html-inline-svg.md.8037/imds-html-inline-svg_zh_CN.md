# InlineSvg

## 基本信息

InlineSvg 使用内联 SVG 显示图标。
通过将 SVG 直接嵌入 HTML，可以通过 CSS 控制颜色和大小。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-icon-inlinesvg--documentation
- 基础类: imds-icon

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-icon | span 元素 | 图标包装器 | 必须 |
| is-x-small | imds-icon | 超小尺寸 | 可选 |
| is-small | imds-icon | 小尺寸 | 可选 |
| is-normal | imds-icon | 标准尺寸 | 可选 |
| is-medium | imds-icon | 中等尺寸 | 可选 |
| is-large | imds-icon | 大尺寸 | 可选 |
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

## HTML 代码片段

### 基本内联 SVG 图标

```html
<span class="imds-icon">
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
    <path
      fill="hsl(0, 0%, 43%)"
      d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path>
  </svg>
</span>
```

以下各节仅展示与基本图标的差异。

## 变体

### size（尺寸）

在 `span.imds-icon` 上添加尺寸类。

```html
<span class="imds-icon is-x-small">  <!-- 超小 -->
<span class="imds-icon is-small">    <!-- 小 -->
<span class="imds-icon is-normal">   <!-- 标准 -->
<span class="imds-icon is-medium">   <!-- 中 -->
<span class="imds-icon is-large">    <!-- 大 -->
```

### color（颜色）

在 `span.imds-icon` 上添加颜色类。对于单色 SVG，使用 `fill="currentColor"` 可使颜色类（如 `is-primary`）生效。

```html
<span class="imds-icon is-primary">   <!-- 主色 -->
<span class="imds-icon is-success">   <!-- 成功 -->
<span class="imds-icon is-warning">   <!-- 警告 -->
<span class="imds-icon is-danger">    <!-- 危险 -->
```

其他: `is-blue`, `is-green`, `is-red`, `is-yellow`, `is-orange`, `is-cyan`, `is-gray`, `is-gray-light`, `is-white`

## 组合示例

### 与 Button 组合

```html
<button type="button" class="imds-button is-outlined">
  <span class="imds-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- SVG 路径数据 -->
    </svg>
  </span>
  <span class="imds-button-text">按钮文字</span>
</button>
```

### 与 Tag 组合

```html
<span class="imds-tag is-light is-blue">
  <span class="imds-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- SVG 路径数据 -->
    </svg>
  </span>
  <span>分类</span>
</span>
```

## 实现注意事项

- 在 SVG 中指定 `fill="currentColor"` 后，颜色类（如 `is-primary`）的颜色将被应用
- 多色 SVG 通过 `fill` 属性直接指定颜色，因此颜色类无效
- 无障碍：对于有意义的图标，在 `span.imds-icon` 上添加 `aria-label`；对于装饰性图标，添加 `aria-hidden="true"`
- SVG 的 `width` / `height` 属性会被尺寸类覆盖，但必须始终指定 `viewBox`
