# Popover

## 基本信息

Popover 是在页面内的面板上显示辅助性（非主要）信息或操作的组件。
点击或悬停时显示面板，显示在页面上所有其他元素的前面。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-popover--documentation
- 基础类: imds-popover

## 整体结构

```
imds-popover                              # 容器（附加 is-right / is-left / is-top / is-hoverable / is-active）
├── button.imds-button                    # 触发按钮（is-outlined / is-ghost 等，有多种正当变体）
│   │                                     #   属性：aria-haspopup="true" / aria-controls="<panel-id>"
│   ├── span                              # 标签（仅图标的触发按钮可省略）
│   └── imds-icon (fa-chevron-down 等)    # 开关指示图标（可省略）
└── imds-popover-menu (id=<panel-id>, role="menu") # 面板本体
    └── imds-popover-content              # 内容区域
        └── （任意内容 / 菜单项 / 操作等）
```

`button` 的 `aria-controls` **必须与** `imds-popover-menu` 的 `id` **保持一致**。开闭由 JavaScript 控制（附加 `is-hoverable` 时仅靠 CSS 即可）。打开状态通过在 `div.imds-popover` 上附加 `is-active` 类表示（在实际 DOM 中，标准模式是通过 JavaScript 执行 `classList.toggle('is-active')`）。

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
| is-active | imds-popover | 表示开关状态（已打开） | 可选（开关时由 JS 添加/移除） |
| is-applied | 触发按钮 | 已应用样式 | 可选 |
| is-ghost | 触发按钮（`imds-button`） | 无边框触发按钮（仅图标等） | 可选 |
| role="menu" | imds-popover-menu | 面板的角色 | 必须 |

## HTML 代码片段

### 基本弹出层

```html
<div class="imds-popover">
  <button
    aria-haspopup="true"
    aria-controls="sample-popover-1"
    class="imds-button is-outlined">
    <span>Popover</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
  </button>
  <div
    id="sample-popover-1"
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

### 触发按钮的变体

触发按钮并不固定为 `imds-button is-outlined` + `fa-chevron-down`。根据用途有多种正当模式。

```html
<!-- 标签 + 人字形图标（标准） -->
<button aria-haspopup="true" aria-controls="sample-popover-1" class="imds-button is-outlined">
  <span>Popover</span>
  <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
</button>

<!-- 仅图标・is-ghost（常用于页头导航等） -->
<button type="button" class="imds-button is-ghost is-large" aria-haspopup="true" aria-controls="sample-popover-6">
  <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
  <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
</button>

<!-- 省略菜单（ellipsis）・仅图标，无开关指示 -->
<button class="imds-button is-ghost" title="其他操作" aria-haspopup="true" aria-controls="sample-popover-8">
  <span class="imds-icon is-small is-gray"><i class="fa-solid fa-ellipsis"></i></span>
</button>

<!-- 已应用（Applied）: 图标 + 标签 + is-applied，打开期间为 is-active -->
<div class="imds-popover is-active">
  <button aria-haspopup="true" aria-controls="sample-popover-0" class="imds-button is-outlined is-applied">
    <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
    <span>Popover</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
  </button>
  ...
</div>
```

- 带标签的触发按钮可使用 `fa-chevron-down` 或 `fa-caret-down`，两者均有使用实例
- 仅图标的触发按钮（`is-ghost`）可省略开关指示图标。此时通过 `title` 属性补充按钮的含义

### 嵌套菜单（子级）

在 Popover 内容中放置 `nav.imds-menu`，并在 `li` 内嵌套 `ul.imds-menu-list`，即可创建层级菜单。层级越深操作性越低，仅在必要时使用。

```html
<div class="imds-popover-content">
  <nav class="imds-menu is-borderless">
    <div class="imds-menu-title">Menu Title</div>
    <ul class="imds-menu-list">
      <li>
        <a><span>Menu 1</span></a>
        <ul class="imds-menu-list">
          <li>
            <a><span>Menu 1-1</span></a>
            <ul class="imds-menu-list"></ul>
          </li>
        </ul>
      </li>
      <li>
        <a><span>Menu 2</span></a>
        <ul class="imds-menu-list"></ul>
      </li>
    </ul>
  </nav>
</div>
```

## 实现注意事项

- 触发按钮的 `aria-controls` 与面板的 `id` 须保持一致（`sample-popover-N` 为占位符。根据功能取唯一的名称，因不是输入元素，不加冒号）
- 面板的开关控制需通过 JavaScript 实现（`is-hoverable` 时仅靠 CSS 即可运作）。标准实现是通过在 `div.imds-popover` 上添加/移除 `is-active` 类来表示开关，并在点击文档外部时移除 `is-active`
- 触发按钮必须添加 `aria-haspopup="true"`。面板本体必须添加 `role="menu"`
- 触发按钮的外观不限于 `imds-button is-outlined` + `fa-chevron-down`。使用 `is-ghost`（仅图标）或 `fa-caret-down` 的示例也是实际 DOM 中存在的正当变体。根据用途（有无标签、放置位置）选择
- 禁用时，除按钮的 `disabled` 属性外，还需在容器上添加 `aria-disabled="true"`
- 菜单项较多时使用 `nav.imds-menu` + `ul.imds-menu-list`，必要时可在 `li` 内嵌套 `ul.imds-menu-list` 构成层级菜单
