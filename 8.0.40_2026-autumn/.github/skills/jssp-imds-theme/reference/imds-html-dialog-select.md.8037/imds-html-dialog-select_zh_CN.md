---
paths:
  - "src/main/jssp/**/*.html"
---

# Dialog + Select（数据选择对话框）

## 基本信息

在 Dialog（弹出窗口）中组合 **搜索框 + 列表表格**，让用户从列表中选取 1 条（或多条）并返回给父画面的复合模式。
用于查找、主数据选择、参照选择等。

- 各个组件的详细信息请参考：
  - 对话框本体：[imds-html-dialog.md](imds-html-dialog.md)
  - 表格：[imds-html-table.md](imds-html-table.md)（`is-sticky` / `is-hoverable` / `is-sortable`）
  - 搜索框：[imds-html-textbox-control.md](imds-html-textbox-control.md)（用 `is-left` 将图标置于左侧）
  - 按钮：[imds-html-button.md](imds-html-button.md)
- 基础类：`imds-dialog` + `imds-table is-sticky is-hoverable`

需要调用 IM-公共主数据（用户 / 组织 / 公司 / 角色等）的检索对话框时，请使用 `jssp-im-master-usage` 技能（`imACMSearch`），而不是自行实现。本模式仅用于 **自定义表格中的列表选择**。

## 整体结构

```
imds-dialog-wrapper                      # 尺寸控制包装器（默认横向）
└── imds-dialog                          # 对话框本体
    ├── imds-dialog-header               # 头部（标题 + 关闭按钮）
    ├── imds-dialog-content (+ scrollbar)# 内容区域
    │   └── imds-px-4 imds-py-3          # 内侧边距包装
    │       ├── imds-textbox-control is-left   # 搜索框（图标在左）
    │       └── imds-table is-area-bordered is-sticky is-hoverable imds-mt-4
    │           └── imds-table-inner
    │               └── table
    │                   ├── thead > tr > th（用 is-sortable 标记可排序）
    │                   └── tbody > tr > td（点击行进行选择）
    └── imds-dialog-footer               # 底部（取消 / 选择）
        └── imds-p-4
            ├── button（取消）
            └── button.is-primary（选择）
```

## CSS Classes Reference（本模式特有）

| 类名 | 应用对象 | 用途 | 必填/可选 |
|----------|--------|------|----------------|
| imds-dialog-footer | div 元素（`imds-dialog` 末尾） | 底部区域 | 必填 |
| imds-textbox-control + is-left | 搜索框外框 | 图标置于左侧的搜索字段 | 推荐 |
| imds-table + is-sticky | 表格外框 | 表头行固定（纵向滚动时表头可见） | 推荐 |
| imds-table + is-hoverable | 表格外框 | 行悬停强调（提示行可点击） | 推荐 |
| imds-table + is-area-bordered | 表格外框 | 表格外框线 | 推荐 |
| th.is-sortable | th 元素 | 可排序列标记 | 可选 |
| imds-mt-4 | 表格外框 | 搜索框与表格的纵向间距 | 推荐 |

其他类（`imds-dialog-*` / `imds-button` 等）请参考各个 reference 文件。

## HTML 代码片段

### 基本：数据选择对话框（`<dialog>` 根 / 推荐）

```html
<dialog
  id="route-select-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="route-select-dialog-title"
  style="width: 800px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="route-select-dialog-title" title="选择路由">选择路由</h1>
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
      <div class="imds-px-4 imds-py-3">
        <div
          class="imds-textbox-control is-left"
          style="width:200px">
          <input
            type="search"
            class="imds-textbox"
            aria-label="筛选搜索"
            value="" />
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
        <div
          class="imds-table is-area-bordered is-sticky is-hoverable imds-mt-4"
          style="height: 100%; width: 100%; max-height: 220px;">
          <div class="imds-table-inner">
            <table>
              <thead>
                <tr>
                  <th>表头1</th>
                  <th class="is-sortable">
                    <span>表头2</span>
                    <span class="imds-icon"><i class="fa-solid fa-sort-up"></i></span>
                  </th>
                  <th class="is-sortable">
                    <span>表头3</span>
                    <span class="imds-icon"><i class="fa-solid fa-sort-up"></i></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span>值-1-1</span></td>
                  <td><span>值-1-2</span></td>
                  <td><span>值-1-3</span></td>
                </tr>
                <!-- 其余行省略 -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="imds-dialog-footer">
      <div
        class="imds-p-4"
        style="display:flex; gap:0 1em; justify-content: flex-end">
        <button type="button" class="imds-button" style="width: 8em">取消</button>
        <button type="button" class="imds-button is-primary" style="width: 8em">选择</button>
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// 打开（模态）
document.getElementById('route-select-dialog').showModal();

// 关闭
document.getElementById('route-select-dialog').close();
```

以下仅展示与基本模式的差异。

## 行选择的实现模式

`is-hoverable` 仅提供悬停强调，**选中状态需要自行实现**（仅靠 CSS 无法区分选中行）。

### 1. 单选（点击行高亮）

常用做法是给当前选中行加 `is-selected`（自定义类）。

```html
<tbody>
  <tr data-value="route-1"><td><span>值-1-1</span></td>...</tr>
  <tr class="is-selected" data-value="route-2"><td><span>值-2-1</span></td>...</tr>
  <tr data-value="route-3"><td><span>值-3-1</span></td>...</tr>
</tbody>
```

```css
/* 在展示页一侧定义（不是 imds 的标准类） */
.imds-table tbody tr.is-selected { background-color: #e6f0ff; }
```

```javascript
// 点击行切换选中
document.querySelectorAll('#route-select-dialog tbody tr').forEach(function (tr) {
  tr.addEventListener('click', function () {
    document.querySelectorAll('#route-select-dialog tbody tr.is-selected')
      .forEach(function (e) { e.classList.remove('is-selected'); });
    tr.classList.add('is-selected');
  });
});
// 若希望双击立即确认，可同时监听 dblclick
```

### 2. 用单选按钮单选（显式）

希望显式呈现选择 UI 时，在首列放置单选按钮。

```html
<thead>
  <tr>
    <th style="width: 3em"></th>
    <th>ID</th>
    <th>名称</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><label class="imds-radio"><input type="radio" name="route" value="route-1" /></label></td>
    <td><span>route-1</span></td>
    <td><span>申请路由 A</span></td>
  </tr>
</tbody>
```

单选按钮详情请参考 [imds-html-radio.md](imds-html-radio.md)。

### 3. 用复选框多选

选择行可能为多条时，在首列放置复选框。如能在 `thead` 也放一个"全选"复选框更佳。

```html
<thead>
  <tr>
    <th style="width: 3em">
      <label class="imds-checkbox"><input type="checkbox" aria-label="全选" /></label>
    </th>
    <th>ID</th>
    <th>名称</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><label class="imds-checkbox"><input type="checkbox" value="route-1" /></label></td>
    <td><span>route-1</span></td>
    <td><span>申请路由 A</span></td>
  </tr>
</tbody>
```

复选框详情请参考 [imds-html-checkbox.md](imds-html-checkbox.md)。

## 变体

### 排序列状态展示

在带 `is-sortable` 的 `th` 内通过图标表示当前排序状态。

| 状态 | 图标 |
|------|----------|
| 非排序对象 | `fa-sort` |
| 升序 | `fa-sort-up` |
| 降序 | `fa-sort-down` |

```html
<th class="is-sortable">
  <span>登记日期</span>
  <span class="imds-icon"><i class="fa-solid fa-sort"></i></span>
</th>
```

排序逻辑本身由 JS 实现（点击时切换 `data-order` 等并重新渲染）。

### 搜索框的行为

使用 `type="search"` 时，某些浏览器会在右端自动显示"×"清空按钮。搜索触发方式：

- **增量搜索**：对 `input` 事件做去抖后执行过滤
- **显式搜索**：点击搜索图标或按 Enter 执行

```javascript
// 增量示例（在客户端对 <tbody> 的 <tr> 进行过滤）
var input = document.querySelector('#route-select-dialog input[type=search]');
input.addEventListener('input', function () {
  var q = input.value.toLowerCase();
  document.querySelectorAll('#route-select-dialog tbody tr').forEach(function (tr) {
    tr.style.display = tr.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none';
  });
});
```

### 0 件展示

搜索结果为 0 件时，在 `<tbody>` 内显示 1 行"无数据"。不要让 `<tbody>` 为空。

```html
<tbody>
  <tr>
    <td colspan="3" class="has-text-centered has-text-grey">无匹配数据</td>
  </tr>
</tbody>
```

### 同时放置分页

条数较多时，在表格下方放置分页。

```html
<div class="imds-table is-area-bordered is-sticky is-hoverable imds-mt-4" ...>
  <!-- ... -->
</div>
<nav class="imds-pagination imds-mt-4">
  <!-- 详情参见 imds-html-pagination.md -->
</nav>
```

详情请参考 [imds-html-pagination.md](imds-html-pagination.md)。

### `<div>` 根（仅限非模态 / 特殊用途）

仅在不需要模态化时使用 `<div>` 根。原则上请使用 `<dialog>` 根。详情请参考 [imds-html-dialog.md](imds-html-dialog.md)。

```html
<div
  class="imds-dialog-wrapper"
  style="width: 800px;">
  <div class="imds-dialog">
    <!-- header / content / footer 相同 -->
  </div>
</div>
```

### 尺寸调整

`imds-dialog-wrapper` 以 **宽度优先**（约 800px）为基本。高度通过 `imds-table` 的 `max-height` 控制内侧滚动量（对话框整体的纵向尺寸随内容自动）。

```html
<!-- 横向布局，在 220px 表格区域内滚动 -->
<dialog class="imds-dialog-wrapper" style="width: 800px;">
  ...
  <div class="imds-table ..." style="height:100%; width:100%; max-height: 220px;">
```

若要给对话框固定 `height`，应保证搜索框 + 表格 + 底部能容纳。

## 实现注意事项

- **表格必须采用双层结构**。在 `<div class="imds-table">` 之下直接放 `<div class="imds-table-inner">`，再在其中放 `<table>`（[imds-html-table.md](imds-html-table.md)）
- **`is-sticky` 加在表格外框时固定表头行，加在 `th` / `td` 时固定列**。**两者概念不同**，请勿混淆（[imds-html-table.md](imds-html-table.md) Reference 第 37 / 43 行）
- **将 `max-height` 加在 `imds-table` 外框** 以确定表格内侧滚动区域。否则 `is-sticky` 效果会减弱
- **搜索 input 的 `aria-label`**：不显示 `<label>` 的搜索框务必加 `aria-label="筛选搜索"` 等（屏幕阅读器支持）
- **务必明确指定 `type="button"`**。取消、选择均使用 `type="button"`。本模式不存在 `<form>`，但未指定会被视为 submit
- **按下"选择"按钮时**：从选中行取值，返回给父画面后 `close()`。当无选中行时把按钮设为 `disabled`，可使 UX 更稳定

  ```javascript
  var primary = document.querySelector('#route-select-dialog .imds-button.is-primary');
  primary.disabled = !document.querySelector('#route-select-dialog tbody tr.is-selected');
  ```

- **点击行选择需自行定义 `is-selected`**。`is-selected` 不是 imds 的标准类，需要在页面侧 CSS 给出 `background-color`。若与复选框、单选按钮组合，也可用 `:checked` + `:has()` 选择器无需自定义 CSS 来强调
- **双击立即确认** 是较强的 UX，但存在误操作风险。仅在"看到行就能直接选"的场景（如主数据选择）采用；对需要确认的选择（如权限变更），仍采用点击选择 + 按下"选择"按钮确认的两步流程
- **大量数据对策**：仅在客户端把数千行塞进 `<tbody>` 会导致渲染变慢。切换到服务端过滤 + 分页（[imds-html-pagination.md](imds-html-pagination.md)）
- **IM-公共主数据的选择** 不要用本模式自行构建，请使用 `jssp-im-master-usage` 技能的 `imACMSearch` 标签（参数与回调详情参见该技能 reference）
- **避免 id 冲突**：同一画面并列多个选择对话框时，使用如 `id="route-select-dialog"` / `id="user-select-dialog"` 的标识进行区分
