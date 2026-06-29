---
paths:
  - "src/main/jssp/**/*.html"
---

# Pagination

## 基本信息

Pagination 是以页为单位显示列表数据的导航组件。
在显示大量内容时，用户无需滚动即可查找内容，更容易找到所需信息。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-pagination-pagination--documentation
- 基础类: imds-pagination

## 整体结构

```
nav.imds-pagination                       # 整个分页（附加尺寸类）
├── imds-pagination-controls              # 控制区域（前后按钮 + 页码）
│   ├── button（上一页 / 首页）           # imds-button is-ghost + 箭头图标
│   ├── imds-pagination-page-number       # 页码按钮组
│   │   ├── button.is-primary             # 当前页（is-primary）
│   │   ├── button.is-ghost               # 其他页（is-ghost）
│   │   ├── imds-pagination-page-ellipsis # 省略号「…」（可选）
│   │   └── ...                           # compact 模式时由 select 替代
│   └── button（下一页 / 末页）
└── imds-pagination-options               # 选项区域（可选）
    ├── imds-pagination-records-per-page  # 每页条数选择（label + select.imds-select）
    └── span                              # 条数显示（例如：「501 - 600 / 2000」）
```

在首页/末页时，应在对应的前后按钮上附加 `disabled`。页面切换与每页条数变更通过 JavaScript 控制。

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-pagination | nav 元素 | 分页容器 | 必须 |
| imds-pagination-controls | div 元素 | 页面操作区域（前后按钮 + 页码） | 必须 |
| imds-pagination-page-number | div 元素 | 页码按钮组 | 必须 |
| imds-pagination-page-ellipsis | div 元素 | 省略符号（…） | 可选 |
| imds-pagination-options | div 元素 | 选项区域（每页条数 + 数量显示） | 可选 |
| imds-pagination-records-per-page | div 元素 | 每页条数选择区域 | 可选 |
| is-x-small | imds-pagination | 超小尺寸 | 可选 |
| is-small | imds-pagination | 小尺寸 | 可选 |
| is-normal | imds-pagination | 标准尺寸 | 可选 |
| is-medium | imds-pagination | 中等尺寸 | 可选 |
| is-large | imds-pagination | 大尺寸 | 可选 |

## HTML 代码片段

### 基本分页

```html
<nav class="imds-pagination">
  <div class="imds-pagination-controls">
    <button type="button" class="imds-button is-ghost" title="上一页">
      <span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>
    </button>
    <div class="imds-pagination-page-number">
      <button type="button" class="imds-button is-ghost">1</button>
      <button type="button" class="imds-button is-ghost">2</button>
      <button type="button" class="imds-button is-primary">3</button>
      <button type="button" class="imds-button is-ghost">4</button>
      <button type="button" class="imds-button is-ghost">5</button>
      <div class="imds-pagination-page-ellipsis"><span>…</span></div>
      <button type="button" class="imds-button is-ghost">20</button>
    </div>
    <button type="button" class="imds-button is-ghost" title="下一页">
      <span class="imds-icon"><i class="fa-solid fa-angle-right"></i></span>
    </button>
  </div>
  <div class="imds-pagination-options">
    <div class="imds-pagination-records-per-page">
      <label for="todo-replace-:r1:">每页条数</label>
      <select id="todo-replace-:r1:" class="imds-select">
        <option value="100">100</option>
        <option value="200">200</option>
        <option value="300">300</option>
      </select>
    </div>
    <span>501 - 600 / 2000</span>
  </div>
</nav>
```

以下各节仅展示与基本分页的差异。

## 变体

### size（尺寸）

在 `nav.imds-pagination` 上添加尺寸类。

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
<div class="imds-pagination-options">
  <span>501 - 600 / 2000</span>
</div>
```

### compact（紧凑型）

用选择框代替页码按钮来选择当前页面。
同时增加跳转到首页/末页的按钮。

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
      <label for="todo-replace-:r1:">每页条数</label>
      <select id="todo-replace-:r1:" class="imds-select">
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

## 实现注意事项

- 当前页按钮使用 `is-primary`，其他页码按钮使用 `is-ghost`
- 页数较多时，使用 `imds-pagination-page-ellipsis`（…）进行省略
- 前后按钮须添加 `title` 属性以确保无障碍性
- 在首页/末页时，为前后按钮添加 `disabled` 属性
- 将 `select` 的 `id` 和 `label` 的 `for` 替换为唯一值（`todo-replace-:r1:` 为占位符）
- 页面切换和每页条数变更需通过 JavaScript 控制
