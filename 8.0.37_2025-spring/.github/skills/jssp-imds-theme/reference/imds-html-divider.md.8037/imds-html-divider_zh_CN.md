---
paths:
  - "src/main/jssp/**/*.html"
---

# Divider

## 基本信息

Divider 是通过水平或垂直方向分隔内容来进行视觉分组的组件。
当仅通过布局和间距调整不足以区分分组时使用。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-divider--documentation
- 基础类: imds-divider

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-divider | div 元素 | 分隔线 | 必须 |
| is-horizontal | imds-divider | 水平分隔线 | 可选 |
| is-vertical | imds-divider | 垂直分隔线 | 可选 |
| is-small | imds-divider | 小尺寸（间距较小） | 可选 |
| is-normal | imds-divider | 标准尺寸 | 可选 |
| is-large | imds-divider | 大尺寸（间距较大） | 可选 |

## HTML 代码片段

### 基本分隔线

```html
<div style="height: 4em; display: grid;"><div class="imds-divider is-vertical is-small"></div></div>
```

以下仅显示与基本分隔线的差异部分。

## 变体

### alignment（方向）

```html
<div class="imds-divider is-horizontal">   <!-- 水平 -->
<div class="imds-divider is-vertical">     <!-- 垂直 -->
```

### size（尺寸）

```html
<div class="imds-divider is-small">   <!-- 小 -->
<div class="imds-divider is-normal">  <!-- 标准 -->
<div class="imds-divider is-large">   <!-- 大 -->
```

## 实现注意事项

- 使用 `div` 元素（不使用 `hr`）
- 垂直方向时，父元素需要指定高度以及 `display: grid` 或 `display: flex`
