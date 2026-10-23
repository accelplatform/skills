# ProgressCircular

## 基本信息

ProgressCircular 以圆形直观地显示正在执行的处理进度。
通过适当使用表示状态的颜色和图标，可以更直观地了解处理状态。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-progress-progresscircular--documentation
- 基础类: imds-progress-circular

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-progress-circular | div 元素 | 圆形进度容器 | 必须 |
| imds-progress-circular-track | circle 元素 | 轨道（背景圆） | 必须 |
| imds-progress-circular-fill | circle 元素 | 填充（进度显示部分） | 必须 |
| imds-progress-circular-text | div 元素 | 中央文字区域 | 可选 |
| is-primary | imds-progress-circular | 主色 | 可选 |
| is-warning | imds-progress-circular | 警告（黄色） | 可选 |
| is-danger | imds-progress-circular | 危险（红色） | 可选 |
| is-success | imds-progress-circular | 成功（绿色） | 可选 |
| is-info | imds-progress-circular | 信息（蓝色） | 可选 |
| is-error | imds-progress-circular | 错误（红色） | 可选 |
| is-blue | imds-progress-circular | 蓝色 | 可选 |
| is-green | imds-progress-circular | 绿色 | 可选 |
| is-red | imds-progress-circular | 红色 | 可选 |
| is-yellow | imds-progress-circular | 黄色 | 可选 |
| is-orange | imds-progress-circular | 橙色 | 可选 |
| is-cyan | imds-progress-circular | 青色 | 可选 |
| is-gray | imds-progress-circular | 灰色 | 可选 |
| is-white | imds-progress-circular | 白色 | 可选 |

## HTML 代码片段

### 基本圆形进度

```html
<div
  class="imds-progress-circular"
  style="width: 16rem; height: 16rem; font-size: 4rem;">
  <svg width="160" height="160" viewBox="0 0 160 160">
    <circle
      class="imds-progress-circular-track"
      r="74" cx="80" cy="80"
      fill="transparent" stroke-width="12"></circle>
    <circle
      class="imds-progress-circular-fill"
      r="74" cx="80" cy="80"
      fill="transparent" stroke-linecap="round" stroke-width="12"
      stroke-dasharray="464.96"
      stroke-dashoffset="185.98"></circle>
  </svg>
  <div class="imds-progress-circular-text"><span>60%</span></div>
</div>
```

以下各节仅展示与基本圆形进度的差异。

## 变体

### color（颜色）

在 `div.imds-progress-circular` 上添加颜色类。

```html
<div class="imds-progress-circular is-primary">  <!-- 主色 -->
<div class="imds-progress-circular is-warning">  <!-- 警告 -->
<div class="imds-progress-circular is-danger">   <!-- 危险 -->
<div class="imds-progress-circular is-success">  <!-- 成功 -->
<div class="imds-progress-circular is-info">     <!-- 信息 -->
<div class="imds-progress-circular is-error">    <!-- 错误 -->
<div class="imds-progress-circular is-blue">     <!-- 蓝色 -->
<div class="imds-progress-circular is-green">    <!-- 绿色 -->
<div class="imds-progress-circular is-red">      <!-- 红色 -->
<div class="imds-progress-circular is-yellow">   <!-- 黄色 -->
<div class="imds-progress-circular is-orange">   <!-- 橙色 -->
<div class="imds-progress-circular is-cyan">     <!-- 青色 -->
<div class="imds-progress-circular is-gray">     <!-- 灰色 -->
<div class="imds-progress-circular is-white">    <!-- 白色 -->
```

### showProgressWithIcon（用图标显示进度）

用图标代替文字显示进度状态。将 `imds-progress-circular-text` 内的 `<span>` 替换为 `imds-icon`。

```html
<div class="imds-progress-circular-text">
  <span
    class="imds-icon is-medium is-success"
    title="在 title 属性中输入图标所代表的含义">
    <i class="fa-solid fa-check"></i>
  </span>
</div>
```

#### 按状态的图标对应

图标种类与 `ProgressBar` 不同（圆形边缘已表示进度，因此使用更简洁的图标）。

| 状态 | 颜色类 | 图标 |
|-----------|-------------|---------|
| 成功 | is-success | fa-check |
| 警告 | is-warning | fa-triangle-exclamation |
| 危险 | is-danger | fa-triangle-exclamation |
| 错误 | is-error | fa-xmark |

```html
<span class="imds-icon is-medium is-warning" title="在 title 属性中输入图标所代表的含义">
  <i class="fa-solid fa-triangle-exclamation"></i>
</span>
<span class="imds-icon is-medium is-error" title="在 title 属性中输入图标所代表的含义">
  <i class="fa-solid fa-xmark"></i>
</span>
```

### 尺寸预设

圆的尺寸需联动指定 `width`/`height`（容器）、`font-size`（中央文字）、SVG 的 `width`/`height`/`viewBox`、`circle` 的 `r`（半径）・`stroke-width` 以及 `stroke-dasharray`（周长）。以下为代表性的尺寸预设。

| 尺寸 (px) | 容器 style | SVG width/height/viewBox | r | stroke-width | stroke-dasharray（周长） |
|------------|----------------|---------------------------|---|--------------|--------------------------|
| 40 | `width: 4rem; height: 4rem; font-size: 1rem` | `40` / `40` / `0 0 40 40` | 18.5 | 3 | 116.24 |
| 80 | `width: 8rem; height: 8rem; font-size: 2rem` | `80` / `80` / `0 0 80 80` | 37 | 6 | 232.48 |
| 120 | `width: 12rem; height: 12rem; font-size: 3rem` | `120` / `120` / `0 0 120 120` | 55.5 | 9 | 348.72 |
| 160 | `width: 16rem; height: 16rem; font-size: 4rem` | `160` / `160` / `0 0 160 160` | 74 | 12 | 464.96 |

`cx` / `cy` 均为 SVG `width`/`height` 的一半（例如：尺寸 160 时为 `cx="80" cy="80"`）。

## 实现注意事项

- 通过 `imds-progress-circular` 的 `style` 属性（`width`、`height`、`font-size`）控制尺寸
- 通过 `stroke-dashoffset` 控制进度百分比。计算公式：`周长 × (1 - 进度率)`（周长 = `2 × π × r`）
- `stroke-dasharray` 设置为周长值（`r="74"` 时：`2 × π × 74 ≈ 464.96`）
- 进度文字与图标互斥使用（不可同时放置）
- 使用图标时，通过 `title` 属性说明图标含义以确保无障碍性
- 图标颜色类（如 `is-success`）需同时添加到容器和图标上
- 根据用途调整 SVG 的 `width` / `height` / `viewBox` 和容器的 `style` 尺寸
