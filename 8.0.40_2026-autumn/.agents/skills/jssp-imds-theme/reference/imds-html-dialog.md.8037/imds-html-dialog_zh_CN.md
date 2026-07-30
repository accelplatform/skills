# Dialog

## 基本信息

Dialog 是为了在用户与系统之间交换特定信息而显示的小窗口。
它以弹出方式显示在原始页面上方。

- 来源URL: https://document.intra-mart.jp/design/?path=/story/components-dialog--default
- 基础类: imds-dialog

## 整体结构

```
imds-dialog-wrapper                       # 尺寸控制包装器（推荐 <dialog>，也可使用 <div>）
└── imds-dialog                           # 对话框本体
    ├── imds-dialog-header                # 头部
    │   ├── imds-dialog-title-wrapper
    │   │   ├── imds-dialog-title-bread-crumbs-warp  # 面包屑（可选）
    │   │   └── imds-dialog-title         # 标题（h1 + 可选副标题 <p>）
    │   └── button.imds-dialog-header-close # 关闭按钮（可选）
    └── imds-dialog-content (+ imds-scrollbar) # 内容区域
        └── imds-p-4                       # 内侧边距包装器（实质必需）
            └── （任意内容）
```

若对话框内包含输入表单，请参阅 [imds-html-dialog-form.md](imds-html-dialog-form.md)。

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-dialog-wrapper | 外层元素（`<dialog>` 或 `<div>`） | 对话框尺寸控制包装器 | 必须 |
| imds-dialog | 内层 div | 对话框主体 | 必须 |
| imds-dialog-header | div 元素 | 标题区域 | 必须 |
| imds-dialog-title-wrapper | div 元素 | 标题部分的包装器 | 必须 |
| imds-dialog-title | div 元素 | 标题显示区域 | 必须 |
| imds-dialog-title-bread-crumbs-warp | div 元素 | 面包屑显示区域 | 可选 |
| imds-dialog-header-close | button 元素 | 关闭按钮 | 可选 |
| imds-dialog-content | div 元素 | 内容区域 | 必须 |
| imds-scrollbar | imds-dialog-content | 滚动条样式 | 可选 |

## HTML 代码片段

### 基本对话框（`<dialog>` 根 / 推荐）

`imds-dialog-wrapper` 的基础模式是以 **HTML5 原生的 `<dialog>` 元素** 作为根元素来实现。
通过 `<dialog>` + `showModal()`，无需追加 JavaScript / CSS 即可自动获得以下功能：

- 半透明背景遮罩（`::backdrop`）
- 禁止背景元素操作（模态）
- 通过 `Escape` 键自动关闭
- 焦点陷阱（Tab 在 dialog 内循环）

```html
<dialog
  id="item-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="item-dialog-title"
  style="width: 500px; min-width: 150px; max-width: 1000px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="item-dialog-title" title="对话框标题">对话框标题</h1>
        </div>
      </div>
      <button
        type="button"
        class="imds-button is-ghost is-small imds-dialog-header-close"
        aria-label="关闭">
        <span class="imds-icon"><i class="fa-solid fa-times"></i></span>
      </button>
    </div>
    <div class="imds-dialog-content imds-scrollbar">
      <div class="imds-p-4">
        内容
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// 打开（模态显示）
document.getElementById('item-dialog').showModal();

// 关闭
document.getElementById('item-dialog').close();
```

#### 使用 `<dialog>` 根时的规则

- `<dialog>` 元素本身相当于 `role="dialog"`，因此不要附加 `role` / `aria-modal`（仅保留 `aria-labelledby`）
- 不要使用 `style="display:none"` 隐藏（`<dialog>` 元素默认处于关闭状态）
- 不得通过 `style.display = ''` 显示。**必须调用 `showModal()`**（只有此方法才能使背景不可操作）
- 不得自行实现 `<div>` + `position:fixed` + 背景 overlay
- `imds-dialog-content` **默认没有 padding**。必须使用 `<div class="imds-p-4">` 包裹内容（可使用 `imds-p-2` / `imds-p-6` 调整）。如果忽略，表单元素和按钮会紧贴对话框边缘显示

以下仅显示与基本对话框的差异部分。

## 变体

### 副标题

在 `imds-dialog-title` 内的 `h1` 后面添加 `<p>` 元素。

```html
<div class="imds-dialog-title">
  <h1 title="对话框标题">对话框标题</h1>
  <p>副标题</p>
</div>
```

### 面包屑

在 `imds-dialog-title-wrapper` 内的 `imds-dialog-title` 前面添加 `imds-dialog-title-bread-crumbs-warp`。

```html
<div class="imds-dialog-title-wrapper">
  <div class="imds-dialog-title-bread-crumbs-warp">
    <span title="面包屑 1">面包屑 1</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-angle-right"></i></span>
    <span title="面包屑 2">面包屑 2</span>
  </div>
  <div class="imds-dialog-title"><h1 title="对话框标题">对话框标题</h1></div>
</div>
```

### `<div>` 根（仅限非模态/特殊用途）

仅当**不需要**模态化（禁止背景操作），或在无法使用 `<dialog>` 元素的特殊环境时，使用 `<div>` 作为根元素。这不是基础模式，应作为**辅助选择**对待。

```html
<div
  class="imds-dialog-wrapper"
  style="height: 220px; width: 500px; min-height: 150px; min-width: 150px; max-height: 1000px; max-width: 1000px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title"><h1 title="对话框标题">对话框标题</h1></div>
      </div>
      <button
        type="button"
        class="imds-button is-ghost is-small imds-dialog-header-close">
        <span class="imds-icon"><i class="fa-solid fa-times"></i></span>
      </button>
    </div>
    <div class="imds-dialog-content imds-scrollbar"><div class="imds-p-4">内容</div></div>
  </div>
</div>
```

⚠️ 使用 `<div>` 根时，必须**自行实现**以下功能：
- 显示/隐藏控制（如 `style.display` 等）
- 半透明背景遮罩（必要时叠加另一个 `<div>`）
- 禁止背景元素操作
- 通过 ESC 键关闭
- 焦点陷阱

正确实现这些较为困难，遗漏会成为 bug 温床。**如无特殊理由，请务必采用 `<dialog>` 根**。

## 实现注意事项

- 通过 `imds-dialog-wrapper` 的 `style` 属性控制对话框的尺寸（height、width、min/max）
- 关闭按钮使用 `imds-button is-ghost is-small imds-dialog-header-close`
- 内容区域的内边距通过 `imds-p-4` 调整，可根据内容进行修改
- 添加 `imds-scrollbar` 可在内容溢出时显示滚动条
- 面包屑的类名为 `imds-dialog-title-bread-crumbs-warp`（这是官方类名，非拼写错误）
