---
paths:
  - "src/main/jssp/**/*.html"
---

# ProgressBar

## 基本信息

ProgressBar 是以条形直观地显示正在执行的处理进度的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-progress-progressbar--documentation
- 基础类: imds-progress-bar

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-progress-bar | div 元素 | 进度条容器 | 必须 |
| imds-progress-bar-track | div 元素 | 轨道（背景条） | 必须 |
| imds-progress-bar-fill | div 元素 | 填充（进度显示部分） | 必须 |
| imds-progress-bar-text | span 元素 | 进度文字（百分比显示） | 可选 |
| is-primary | imds-progress-bar | 主色 | 可选 |
| is-warning | imds-progress-bar | 警告（黄色） | 可选 |
| is-danger | imds-progress-bar | 危险（红色） | 可选 |
| is-success | imds-progress-bar | 成功（绿色） | 可选 |
| is-info | imds-progress-bar | 信息（蓝色） | 可选 |
| is-error | imds-progress-bar | 错误（红色） | 可选 |
| is-blue | imds-progress-bar | 蓝色 | 可选 |
| is-green | imds-progress-bar | 绿色 | 可选 |
| is-red | imds-progress-bar | 红色 | 可选 |
| is-yellow | imds-progress-bar | 黄色 | 可选 |
| is-orange | imds-progress-bar | 橙色 | 可选 |
| is-cyan | imds-progress-bar | 青色 | 可选 |
| is-gray | imds-progress-bar | 灰色 | 可选 |
| is-white | imds-progress-bar | 白色 | 可选 |
| is-x-small | imds-progress-bar | 超小尺寸 | 可选 |
| is-small | imds-progress-bar | 小尺寸 | 可选 |
| is-normal | imds-progress-bar | 标准尺寸 | 可选 |
| is-medium | imds-progress-bar | 中等尺寸 | 可选 |
| is-large | imds-progress-bar | 大尺寸 | 可选 |

## HTML 代码片段

### 基本进度条

```html
<div class="imds-progress-bar">
  <div class="imds-progress-bar-track">
    <div class="imds-progress-bar-fill" style="width: 60%;"></div>
  </div>
  <span class="imds-progress-bar-text">60%</span>
</div>
```

以下各节仅展示与基本进度条的差异。

## 变体

### color（颜色）

在 `div.imds-progress-bar` 上添加颜色类。

```html
<div class="imds-progress-bar is-primary">  <!-- 主色 -->
<div class="imds-progress-bar is-warning">  <!-- 警告 -->
<div class="imds-progress-bar is-danger">   <!-- 危险 -->
<div class="imds-progress-bar is-success">  <!-- 成功 -->
<div class="imds-progress-bar is-info">     <!-- 信息 -->
<div class="imds-progress-bar is-error">    <!-- 错误 -->
<div class="imds-progress-bar is-blue">     <!-- 蓝色 -->
<div class="imds-progress-bar is-green">    <!-- 绿色 -->
<div class="imds-progress-bar is-red">      <!-- 红色 -->
<div class="imds-progress-bar is-yellow">   <!-- 黄色 -->
<div class="imds-progress-bar is-orange">   <!-- 橙色 -->
<div class="imds-progress-bar is-cyan">     <!-- 青色 -->
<div class="imds-progress-bar is-gray">     <!-- 灰色 -->
<div class="imds-progress-bar is-white">    <!-- 白色 -->
```

### size（尺寸）

在 `div.imds-progress-bar` 上添加尺寸类。

```html
<div class="imds-progress-bar is-x-small">  <!-- 超小 -->
<div class="imds-progress-bar is-small">    <!-- 小 -->
<div class="imds-progress-bar is-normal">   <!-- 标准 -->
<div class="imds-progress-bar is-medium">   <!-- 中 -->
<div class="imds-progress-bar is-large">    <!-- 大 -->
```

### showProgressWithIcon（用图标显示进度）

用图标代替文字显示进度状态。
将 `imds-progress-bar-text` 替换为 `imds-icon`。

```html
<div class="imds-progress-bar is-success is-x-small">
  <div class="imds-progress-bar-track">
    <div class="imds-progress-bar-fill" style="width: 60%;"></div>
  </div>
  <span
    class="imds-icon is-success"
    title="在 title 属性中输入图标所代表的含义">
    <i class="fa-solid fa-circle-check"></i>
  </span>
</div>
```

## 实现注意事项

- 通过 `imds-progress-bar-fill` 的 `style="width: XX%;"` 控制进度百分比（0～100%）
- 进度文字与图标互斥使用（不可同时放置）
- 使用图标时，通过 `title` 属性说明图标含义以确保无障碍性
- 图标颜色类（如 `is-success`）需同时添加到容器和图标上
- 通过 JavaScript 同步更新 `imds-progress-bar-fill` 的 `width` 和显示文字
