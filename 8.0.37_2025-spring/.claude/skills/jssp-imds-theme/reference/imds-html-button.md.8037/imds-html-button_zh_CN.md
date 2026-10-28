---
paths:
  - "src/main/jssp/**/*.html"
---

# Button

## 基本信息

Button 是用户点击后执行注册、搜索或跳转到其他页面等操作的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-button-button--documentation
- 基础类: imds-button

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-button | button 元素 | 按钮元素 | 必须 |
| imds-button-text | span 元素 | 按钮文本（与图标并用时） | 条件必须 |
| is-outlined | imds-button | 仅有边框的浅色显示样式 | 可选 |
| is-ghost | imds-button | 无边框的透明样式 | 可选 |
| is-primary | imds-button | 主要操作用的主色 | 可选 |
| is-danger | imds-button | 用于删除・警告等危险操作 | 可选 |
| is-dark | imds-button | 深色 | 可选 |
| is-x-small | imds-button | 超小尺寸 | 可选 |
| is-small | imds-button | 小尺寸 | 可选 |
| is-normal | imds-button | 标准尺寸 | 可选 |
| is-medium | imds-button | 中等尺寸 | 可选 |
| is-large | imds-button | 大尺寸 | 可选 |
| is-applied | imds-button | 显示已应用徽章（仅在存在图标时可用） | 可选 |

## HTML 代码片段

### 基本按钮

```html
<button
  type="button"
  class="imds-button">
  Button
</button>
```

以下仅显示与基本按钮的差异部分。所有变体均在 `button.imds-button` 上添加类或属性。

## 变体

### borderStyle（边框）

```html
<button type="button" class="imds-button is-outlined">Button</button>  <!-- 仅边框 -->
<button type="button" class="imds-button is-ghost">Button</button>     <!-- 无边框 -->
```

### color（颜色）

可与 `is-outlined` 或 `is-ghost` 组合使用。

```html
<button type="button" class="imds-button is-primary">Button</button>  <!-- 主色 -->
<button type="button" class="imds-button is-danger">Button</button>   <!-- 危险 -->
<button type="button" class="imds-button is-dark">Button</button>     <!-- 深色 -->
```

### size（尺寸）

```html
<button type="button" class="imds-button is-x-small">Button</button>  <!-- 超小 -->
<button type="button" class="imds-button is-small">Button</button>    <!-- 小 -->
<button type="button" class="imds-button is-normal">Button</button>   <!-- 标准 -->
<button type="button" class="imds-button is-medium">Button</button>   <!-- 中 -->
<button type="button" class="imds-button is-large">Button</button>    <!-- 大 -->
```

### disabled（禁用状态）

在 `button` 元素上添加 `disabled` 属性。不可点击，视觉上呈灰色。

```html
<button type="button" class="imds-button" disabled>Button</button>
```

### applied（已应用徽章）

在详细搜索区域等通过点击按钮切换显示/隐藏的区域中，用于表示已应用搜索条件等的徽章。仅在存在图标时可用。

```html
<button type="button" class="imds-button is-applied" title="">
  <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
  <span class="imds-button-text">Button</span>
</button>
```

## 组合示例

### 与 Icon 组合

带图标按钮的详细内容请参阅 [imds-html-icon-button.md](imds-html-icon-button.md)。
同时使用图标和文本时，文本必须用 `imds-button-text` 包裹。

```html
<button type="button" class="imds-button is-primary">
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  <span class="imds-button-text">搜索</span>
</button>
```

### 最小宽度（min-width）

当按钮内的标签较短（如「注册/更新」）时，为提高按钮的易点击性和可见性，使用内联 `style="min-width: 8em;"` 指定最小宽度（不定义 `min-width-8em` 等自定义类。请参阅 `jssp-presentation-page.md` 的「反模式：不定义自定义 `.max-width-NNem` / `.min-width-NNem` 类」）。

```html
<button type="button" class="imds-button is-primary" style="min-width: 8em;">注册</button>
```

### 针对页面整体的操作（固定页脚）

「注册」「更新」「删除」等页面底部针对页面整体的操作按钮，汇集到滚动区域之外的固定页脚（`pgstyle-layout-footer`。CSS 定义请参阅 `assets/imds-form-page.md` 的「实现注意事项」）中。`pgstyle-layout-footer` 在按钮之间留出 2em 的间隔。辅助操作（「复制新建」等）通过 `style="margin-left: 3em;"` 拉开与主要按钮组的间隔，以降低复杂性。

```html
<div class="pgstyle-layout-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button type="button" class="imds-button is-primary" style="min-width: 8em;">更新</button>
  <button type="button" class="imds-button is-outlined is-danger" style="min-width: 8em;">删除</button>
  <button type="button" class="imds-button is-outlined is-primary" style="min-width: 8em; margin-left: 3em;">复制新建</button>
</div>
```

### 工具栏

在工具栏中排列按钮时，按钮之间间隔 1em（例：在父元素上指定 `style="display: flex; gap: 1em;"`）。排列检索栏和新建按钮的列表画面操作区域，请使用 `assets/imds-list-page.md` 的 `pgstyle-toolbar`。

```html
<div style="display: flex; gap: 1em;">
  <button type="button" class="imds-button is-primary" style="min-width: 8em;">新建</button>
  <button type="button" class="imds-button is-outlined" style="min-width: 8em;">导出</button>
</div>
```

## 实现注意事项

- 同时使用图标和文本时，文本必须用 `<span class="imds-button-text">` 包裹，不得直接放置文本节点。详情请参阅 [imds-html-icon-button.md](imds-html-icon-button.md)
- `is-outlined` 和 `is-ghost` 互斥使用（不同时添加）
- 颜色类和样式类可以组合使用（例如：`is-outlined is-primary`、`is-ghost is-danger`）
- **每个画面仅一个主色按钮原则**：带颜色的标准按钮（`is-primary` / `is-danger` 的实心按钮）仅应用于画面或对话框内最重要的一个按钮。同一画面・对话框内不得放置多个带颜色的标准按钮（像门户这样存在多个独立内容区域时，每个区域内可各放置一个）。「临时保存」等辅助操作使用 `is-outlined is-primary`（带边框），不要与实心的 `is-primary` 并存
  - ✅ OK 示例：`is-primary`（注册） + `is-outlined is-primary`（临时保存）
  - ❌ NG 示例：`is-primary`（注册） + `is-primary`（临时保存）— 主要按钮变为 2 个
- 并排放置按钮时统一尺寸（不要将 `is-large` 等与其他尺寸混用）
