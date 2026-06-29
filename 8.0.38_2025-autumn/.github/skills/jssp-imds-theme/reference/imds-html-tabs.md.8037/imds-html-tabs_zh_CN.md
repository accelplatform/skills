---
paths:
  - "src/main/jssp/**/*.html"
---

# Tabs

## 基本信息

Tabs 是用于切换显示多个信息或内容的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/story/components-tabs--default
- 基础类: imds-tabs

## 整体结构

```
imds-tabs                                 # 选项卡容器（附加尺寸 / 对齐 / 样式类）
├── ul                                    # 选项卡列表
│   └── li.imds-tabs-tab                  # 各选项卡（附加 is-active / has-tab-close 等）
│       ├── button                        # 选项卡本体（label + 可选 imds-icon）
│       └── button.is-tab-close-button    # 关闭按钮（仅 has-tab-close 时）
└── imds-tabs-actions                     # 右侧操作区域（可选）
    ├── label.imds-checkbox / button 等   # 放置复选框、按钮等
    └── ...
```

通过选项卡切换的内容面板放置于 `imds-tabs` 外部，并通过 JavaScript 控制显示。

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-tabs | div 元素 | 选项卡容器 | 必须 |
| imds-tabs-tab | li 元素 | 各选项卡项目 | 必须 |
| imds-tabs-actions | div 元素 | 选项卡右侧操作区域 | 可选 |
| is-active | imds-tabs-tab | 激活（选中）选项卡 | 可选 |
| is-bordered | imds-tabs | 带边框样式 | 可选 |
| is-right | imds-tabs | 右对齐 | 可选 |
| is-centered | imds-tabs | 居中对齐 | 可选 |
| is-left | imds-tabs | 左对齐（默认） | 可选 |
| is-full-width | imds-tabs | 选项卡均等宽度全宽显示 | 可选 |
| is-x-small | imds-tabs | 超小尺寸 | 可选 |
| is-small | imds-tabs | 小尺寸 | 可选 |
| is-normal | imds-tabs | 标准尺寸 | 可选 |
| is-medium | imds-tabs | 中等尺寸 | 可选 |
| is-large | imds-tabs | 大尺寸 | 可选 |
| has-tab-close | imds-tabs-tab | 带关闭按钮的选项卡 | 可选 |
| is-tab-close-button | button 元素 | 选项卡关闭按钮 | 可选 |
| imds-line-clamp-1 | span 元素 | 文字1行省略 | 可选 |
| imds-line-clamp-2 | span 元素 | 文字2行省略 | 可选 |

## HTML 代码片段

### 基本选项卡

```html
<div class="imds-tabs">
  <ul>
    <li class="imds-tabs-tab is-active">
      <button><span>Tab1</span></button>
    </li>
    <li class="imds-tabs-tab">
      <button><span>Tab2</span></button>
    </li>
    <li class="imds-tabs-tab">
      <button><span>Tab3</span></button>
    </li>
  </ul>
</div>
```

以下各节仅展示与基本选项卡的差异。

## 变体

### tabsStyle（样式）

在 `div.imds-tabs` 上添加样式类。

```html
<div class="imds-tabs is-bordered">  <!-- 带边框 -->
```

### position（对齐）

在 `div.imds-tabs` 上添加对齐类。

```html
<div class="imds-tabs is-right">     <!-- 右对齐 -->
<div class="imds-tabs is-centered">  <!-- 居中对齐 -->
<div class="imds-tabs is-left">      <!-- 左对齐 -->
```

### fullWidth（均等宽度）

在 `div.imds-tabs` 上添加 `is-full-width`。
选项卡以均等宽度铺满全宽。

```html
<div class="imds-tabs is-full-width">
```

### size（尺寸）

在 `div.imds-tabs` 上添加尺寸类。

```html
<div class="imds-tabs is-x-small">  <!-- 超小 -->
<div class="imds-tabs is-small">    <!-- 小 -->
<div class="imds-tabs is-normal">   <!-- 标准 -->
<div class="imds-tabs is-medium">   <!-- 中 -->
<div class="imds-tabs is-large">    <!-- 大 -->
```

### disabled（禁用）

在选项卡的 `button` 上添加 `disabled` 属性。

```html
<button disabled><span>disabled</span></button>
```

### lineClamp（文字省略）

对较长的标签进行省略显示。
在 `span` 上添加 `imds-line-clamp-1`（1行）或 `imds-line-clamp-2`（2行），在 `button` 的 `title` 中设置完整文字，并通过 `span` 的 `style` 限制宽度。

```html
<button title="在此处填写较长的选项卡名完整文字">
  <span class="imds-line-clamp-1" style="width: 100px;">在此处填写较长的选项卡名完整文字</span>
</button>
```

### closeButton（关闭按钮）

在 `li` 上添加 `has-tab-close`，并在选项卡按钮后添加关闭按钮。

```html
<li class="imds-tabs-tab is-active has-tab-close">
  <button><span>Tab1</span></button>
  <button
    title="关闭"
    class="imds-button is-ghost is-tab-close-button">
    <span class="imds-icon is-x-small"><i class="fa-solid fa-xmark"></i></span>
  </button>
</li>
```

## 组合示例

### 与 Button 组合

在 `ul` 后添加 `imds-tabs-actions`。
可放置复选框、按钮等。

```html
<div class="imds-tabs">
  <ul>
    <!-- 选项卡项目 -->
  </ul>
  <div class="imds-tabs-actions">
    <label class="imds-checkbox">
      <input id="todo-replace-:r1:" type="checkbox" />
      <span>Checkbox</span>
    </label>
    <button type="button" class="imds-button is-primary">Button</button>
  </div>
</div>
```

### 与 Icon 组合

在 `button` 内添加 `imds-icon`。
可放置在标签前后任意位置。

```html
<!-- 图标左 -->
<button>
  <span class="imds-icon is-small"><i class="fa-solid fa-home"></i></span>
  <span>Tab1</span>
</button>

<!-- 图标右 -->
<button>
  <span>Tab1</span>
  <span class="imds-icon is-small"><i class="fa-solid fa-home"></i></span>
</button>
```

## 实现注意事项

- 选项卡使用 `ul > li` 的列表结构编写
- `is-active` 同时只添加到一个选项卡上
- 选项卡切换时的内容显示控制通过 JavaScript 实现
- 关闭按钮的点击事件通过 JavaScript 控制（选项卡删除处理）
- 使用 `imds-line-clamp-*` 时，在 `button` 的 `title` 属性中设置完整文字，以便悬停时确认
- `imds-tabs-actions` 与选项卡列表（`ul`）放置在同一层级
