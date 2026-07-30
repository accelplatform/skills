# Img

## 基本信息

Img 使用 `<img>` 标签显示图标。
需要使用 SVG 图像等自定义图标时使用。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-icon-img--documentation
- 基础类: imds-icon

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-icon | span 元素 | 图标包装器 | 必须 |
| is-x-small | imds-icon | 超小尺寸 | 可选 |
| is-small | imds-icon | 小尺寸 | 可选 |
| is-normal | imds-icon | 标准尺寸 | 可选 |
| is-medium | imds-icon | 中等尺寸 | 可选 |
| is-large | imds-icon | 大尺寸 | 可选 |

## HTML 代码片段

### 基本图像图标

```html
<span class="imds-icon">
  <img src="img/information.svg" alt="信息图标" />
</span>
```

以下仅显示与基本图像图标的差异部分。

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

## 组合示例

### 与 Button 组合

```html
<!-- 带文本的按钮 -->
<button type="button" class="imds-button is-outlined">
  <span class="imds-icon"><img src="img/screen_existing_additions.svg" /></span>
  <span class="imds-button-text">添加现有资源</span>
</button>

<!-- 仅图标按钮 -->
<button type="button" class="imds-button is-ghost">
  <span class="imds-icon"><img src="img/addition.svg" /></span>
</button>
```

### 与 Tag 组合

```html
<span class="imds-tag is-light is-blue">
  <span class="imds-icon is-small"><img src="img/category.svg" /></span>
  <span>分类</span>
</span>
```

## 实现注意事项

- 有意义的图标需在 `img` 元素上添加 `alt` 属性以确保无障碍性
- 装饰性图标指定 `alt=""` 以对屏幕阅读器隐藏
- 仅图标按钮需在 `button` 元素上添加 `aria-label`
- SVG 文件的路径需根据项目结构进行修改
