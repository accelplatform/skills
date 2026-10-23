---
paths:
  - "src/main/jssp/**/*.html"
---

# PaginationCompact

## 基本信息

PaginationCompact 是将 Pagination 的页码部分缩短的模式组件。
与 Pagination（imds-html-pagination.md）的区别在于，它不排列页码按钮，而是通过下拉选择框选择当前页。原则上使用 Pagination，仅在画面宽度较窄时切换为 PaginationCompact。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-pagination-paginationcompact--documentation
- 基础类: imds-pagination（与 Pagination 共用。紧凑结构通过内部 `imds-pagination-page-number` 的内容来表现）

## 与 Pagination 的区分使用标准（切换时机）

- **基本方针**: 原则上使用 Pagination。PaginationCompact 是 Pagination 的替代（紧凑显示），定位为面向狭窄区域的缩小版。
- **切换标准（基于 Pagination.md 记载的注意事项）**: 画面尺寸为平板宽度（769px 〜 不足 1023px）时，使用 PaginationCompact 而非 Pagination。画面尺寸的划分标准请参考 Breakpoint 页面。
- 桌面宽度（1024px 及以上）使用 Pagination，平板宽度（769px〜1023px）切换为 PaginationCompact，这是实际 DOM 文档的前提。移动端宽度（768px 及以下）的处理遵循各画面的布局规格。
- 响应式切换无法仅通过 CSS 实现，因此需要在 JavaScript 端根据断点切换所渲染的 HTML 结构本身（Pagination 或 PaginationCompact）。

## 整体结构

```
nav.imds-pagination                       # 分页整体（添加尺寸类）
├── imds-pagination-controls              # 操作区域
│   ├── button (首页)                     # imds-button is-ghost + fa-angles-left
│   ├── button (上一页)                   # imds-button is-ghost + fa-angle-left
│   ├── imds-pagination-page-number       # 以 select + "/" + 总页数 代替页码
│   │   ├── select.imds-select            # 选择当前页
│   │   ├── span "/"
│   │   └── span (总页数)
│   ├── button (下一页)                   # imds-button is-ghost + fa-angle-right
│   └── button (末页)                     # imds-button is-ghost + fa-angles-right
└── imds-pagination-options               # 选项区域（可选）
    ├── imds-pagination-records-per-page  # 每页条数选择（label + select.imds-select）
    └── span                              # 条数显示（例：“76 - 90 / 260”）
```

Pagination 的“首页/末页”按钮在 compact 中始终显示（Pagination 基本形式中没有，与 Pagination 的 compact 变体结构相同）。

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-pagination | nav 元素 | 分页容器 | 必须 |
| imds-pagination-controls | div 元素 | 页面操作区域（前后、首页/末页按钮 + 页面选择） | 必须 |
| imds-pagination-page-number | div 元素 | 当前页选择（select）+ 总页数显示 | 必须 |
| imds-pagination-options | div 元素 | 选项区域（每页条数 + 条数显示） | 可选 |
| imds-pagination-records-per-page | div 元素 | 每页条数选择区域 | 可选 |
| is-x-small | imds-pagination | 超小尺寸 | 可选 |
| is-small | imds-pagination | 小尺寸 | 可选 |
| is-normal | imds-pagination | 标准尺寸（默认） | 可选 |
| is-medium | imds-pagination | 中等尺寸 | 可选 |
| is-large | imds-pagination | 大尺寸 | 可选 |

## HTML 代码片段

### 基本形式

```html
<nav class="imds-pagination">
  <div class="imds-pagination-controls">
    <button type="button" class="imds-button is-ghost" title="首页">
      <span class="imds-icon"><i class="fa-solid fa-angles-left"></i></span>
    </button>
    <button type="button" class="imds-button is-ghost" title="上一页">
      <span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>
    </button>
    <div class="imds-pagination-page-number">
      <select class="imds-select">
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <!-- 按页数生成 option -->
      </select>
      <span>/</span>
      <span>18</span>
    </div>
    <button type="button" class="imds-button is-ghost" title="下一页">
      <span class="imds-icon"><i class="fa-solid fa-angle-right"></i></span>
    </button>
    <button type="button" class="imds-button is-ghost" title="末页">
      <span class="imds-icon"><i class="fa-solid fa-angles-right"></i></span>
    </button>
  </div>
  <div class="imds-pagination-options">
    <div class="imds-pagination-records-per-page">
      <label for="todo-replace-:r0:">每页条数</label>
      <select id="todo-replace-:r0:" class="imds-select">
        <option>15</option>
        <option>30</option>
        <option>50</option>
        <option>100</option>
      </select>
    </div>
    <span>76 - 90 / 260</span>
  </div>
</nav>
```

以下仅显示与基本形式的差异部分。

## 变体

### size（尺寸）

在 `nav.imds-pagination` 上添加尺寸类。通常使用 `is-normal`（默认）。

```html
<nav class="imds-pagination is-x-small">  <!-- 超小 -->
<nav class="imds-pagination is-small">    <!-- 小 -->
<nav class="imds-pagination is-normal">   <!-- 标准 -->
<nav class="imds-pagination is-medium">   <!-- 中 -->
<nav class="imds-pagination is-large">    <!-- 大 -->
```

### hideRecordsPerPage（隐藏每页条数选择）

省略 `imds-pagination-records-per-page`。

```html
<div class="imds-pagination-options"><span>76 - 90 / 260</span></div>
```

## 实现注意事项

- 当前页的选择通过 `select.imds-select` 进行（不使用 Pagination 那样的页码按钮组）。
- “首页”“末页”按钮在 PaginationCompact 中始终包含在结构中（`fa-angles-left` / `fa-angles-right`）。
- 为前后、首页/末页按钮添加 `title` 属性以确保无障碍。
- 在首页/末页时为前后按钮添加 `disabled` 属性（与 Pagination 相同）。
- 将 `select` 的 `id` 和 `label` 的 `for` 替换为唯一值（`todo-replace-:r0:` 为占位符）。
- 页面切换和每页条数变更需要通过 JavaScript 控制。
- **与 Pagination 的切换标准**: 画面宽度变为平板宽度（769px〜不足 1023px）时切换为 PaginationCompact。原则上使用 Pagination，PaginationCompact 作为窄画面宽度的替代使用（详细请参考本文件开头的“与 Pagination 的区分使用标准”）。
