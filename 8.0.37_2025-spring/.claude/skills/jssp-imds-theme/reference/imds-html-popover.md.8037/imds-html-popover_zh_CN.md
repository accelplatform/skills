---
paths:
  - "src/main/jssp/**/*.html"
---

# Popover

## 基本信息

Popover 是在页面内的面板上显示辅助性（非主要）信息或操作的组件。
点击或悬停时显示面板，显示在页面上所有其他元素的前面。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-popover--documentation
- 基础类: imds-popover

## 整体结构

```
imds-popover                              # 容器（附加 is-right / is-left / is-top / is-hoverable）
├── button.imds-button                    # 触发按钮（is-outlined）
│   │                                     #   属性：aria-haspopup="true" / aria-controls="<panel-id>"
│   ├── span                              # 标签
│   └── imds-icon (fa-chevron-down)       # 雪佛龙图标
└── imds-popover-menu (id=<panel-id>, role="menu") # 面板本体
    └── imds-popover-content              # 内容区域
        └── （任意内容 / 菜单项 / 操作等）
```

触发 `button` 的 `aria-controls` **必须与** `imds-popover-menu` 的 `id` **保持一致**。开闭由 JavaScript 控制（附加 `is-hoverable` 时仅靠 CSS 即可）。

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-popover | div 元素 | 弹出层容器 | 必须 |
| imds-popover-menu | div 元素 | 弹出层菜单（面板） | 必须 |
| imds-popover-content | div 元素 | 面板内的内容区域 | 必须 |
| is-right | imds-popover | 右对齐显示 | 可选 |
| is-left | imds-popover | 左对齐显示 | 可选 |
| is-top | imds-popover | 向上显示 | 可选 |
| is-hoverable | imds-popover | 悬停时开关 | 可选 |
| is-applied | 触发按钮 | 已应用样式 | 可选 |

## HTML 代码片段

### 基本弹出层

```html
<div class="imds-popover">
  <button
    aria-haspopup="true"
    aria-controls="imds-popover-:r1:"
    class="imds-button is-outlined">
    <span>Popover</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
  </button>
  <div
    id="imds-popover-:r1:"
    role="menu"
    class="imds-popover-menu">
    <div class="imds-popover-content"><div>Contents</div></div>
  </div>
</div>
```

以下各节仅展示与基本弹出层的差异。

## 变体

### isApplied（已应用状态）

在触发按钮上添加 `is-applied`。

```html
<button ... class="imds-button is-outlined is-applied">
```

### disabled（禁用状态）

在容器上添加 `aria-disabled="true"`，在按钮上添加 `disabled`。

```html
<div class="imds-popover" aria-disabled="true">
  <button ... class="imds-button is-outlined" disabled>
```

### position（内容显示位置）

在 `div.imds-popover` 上添加位置类。也可以组合使用。

```html
<div class="imds-popover is-right">       <!-- 右对齐 -->
<div class="imds-popover is-left">        <!-- 左对齐 -->
<div class="imds-popover is-top">         <!-- 向上 -->
<div class="imds-popover is-top is-left"> <!-- 向上 + 左对齐 -->
```

### hoverable（悬停时自动显示内容）

在 `div.imds-popover` 上添加 `is-hoverable`，悬停时显示内容。

```html
<div class="imds-popover is-hoverable">
```

## 实现注意事项

- 触发按钮的 `aria-controls` 与面板的 `id` 须保持一致（将 `:r1:` 替换为唯一值）
- 面板的开关控制需通过 JavaScript 实现（`is-hoverable` 时仅靠 CSS 即可运作）
- 触发按钮必须添加 `aria-haspopup="true"`
- 触发按钮使用 `imds-button is-outlined`，并包含人字形图标（`fa-chevron-down`）
- 禁用时，除按钮的 `disabled` 属性外，还需在容器上添加 `aria-disabled="true"`
