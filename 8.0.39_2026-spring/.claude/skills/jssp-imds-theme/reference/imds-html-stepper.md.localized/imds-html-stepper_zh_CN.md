---
paths:
  - "src/main/jssp/**/*.html"
---

# Stepper

## 基本信息

Stepper 是供用户按顺序执行多步骤任务的组件。
通过可视化任务进度，明确到完成为止剩余的任务。
用于需要分多个阶段进行操作的向导式界面。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-stepper--documentation
- 基础类: imds-stepper

## 整体结构

```
imds-stepper                              # 步骤条容器
└── ul                                    # 步骤列表
    └── li.imds-stepper-step              # 各步骤
        │                                 #   状态类：is-completed（已完成）/ is-active（当前）/ 无（未到达）
        └── button                        # 步骤本体（可选 imds-icon + 标签）
```

步骤之间的连接线由 CSS 自动绘制，无需在 HTML 中编写。

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-stepper | div 元素 | 步进器容器 | 必须 |
| imds-stepper-step | li 元素 | 各步骤 | 必须 |
| is-completed | imds-stepper-step | 已完成步骤 | 可选 |
| is-active | imds-stepper-step | 进行中（当前）步骤 | 可选 |
| imds-line-clamp-1 | span 元素 | 文字1行省略 | 可选 |
| imds-line-clamp-2 | span 元素 | 文字2行省略 | 可选 |

## HTML 代码片段

### 基本步进器

```html
<div class="imds-stepper">
  <ul>
    <li class="imds-stepper-step is-completed">
      <button><span>Step.1</span></button>
    </li>
    <li class="imds-stepper-step is-active">
      <button><span>Step.2</span></button>
    </li>
    <li class="imds-stepper-step">
      <button><span>Step.3</span></button>
    </li>
  </ul>
</div>
```

以下各节仅展示与基本步进器的差异。

## 变体

### 步骤状态（is-completed、is-active）

在 `li.imds-stepper-step` 上添加状态类。
无类名表示未到达。

```html
<li class="imds-stepper-step is-completed">  <!-- 已完成 -->
<li class="imds-stepper-step is-active">      <!-- 进行中 -->
<li class="imds-stepper-step">                <!-- 未到达 -->
```

### disabled（禁用）

在各步骤的 `button` 上添加 `disabled` 属性。

```html
<button disabled><span>Step.1</span></button>
```

### lineClamp（文字省略）

对较长的标签进行省略显示。在 `span` 上添加 `imds-line-clamp-1`（1行）或 `imds-line-clamp-2`（2行），并在 `button` 的 `title` 中设置完整文字。

```html
<li class="imds-stepper-step">
  <button title="在此处填写较长步骤名的完整文字">
    <span class="imds-line-clamp-1">在此处填写较长步骤名的完整文字</span>
  </button>
</li>
```

## 组合示例

### 与 Icon 组合

在 `button` 内添加 `imds-icon`。
可放置在标签前后任意位置。

```html
<button>
  <span class="imds-icon is-small"><i class="fa-solid fa-user"></i></span>
  <span>Step.1</span>
</button>
```

## 实现注意事项

- 步骤使用 `ul > li` 的列表结构编写
- `is-completed` 添加到已完成步骤，`is-active` 添加到当前步骤，未到达步骤不添加类
- `is-active` 同时只添加到一个步骤上
- 步骤间的连接线由 CSS 自动绘制（无需在 HTML 中编写）
- 步骤点击时的跳转处理通过 JavaScript 控制
- 使用 `imds-line-clamp-*` 时，在 `button` 的 `title` 属性中设置完整文字，以便悬停时确认
- 步进器下方有内容（表单等）时，在步进器的父元素上设置下边距（如 `imds-pb-4`），确保与内容间有足够间距
- 步进器左右不加边距（步进器应全屏宽显示）
- 步进器正上方为标题（`imds-header`）时，上边距也不添加
