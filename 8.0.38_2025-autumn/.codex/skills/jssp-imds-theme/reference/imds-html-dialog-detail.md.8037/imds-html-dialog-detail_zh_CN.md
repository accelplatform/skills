# Dialog + Detail（信息展示对话框）

## 基本信息

在 Dialog（弹出窗口）中用纵向表格展示 **只读信息** 的复合模式。
用于详情展示、浏览模式、不涉及输入的确认画面等。

- 各个组件的详细信息请参考：
  - 对话框本体：[imds-html-dialog.md](imds-html-dialog.md)
  - 表格：[imds-html-table.md](imds-html-table.md)
  - 按钮：[imds-html-button.md](imds-html-button.md)
- 基础类：`imds-dialog` + `imds-table`（纵向 th/td 布局）

涉及输入（新建、编辑）的对话框请使用 [imds-html-dialog-form.md](imds-html-dialog-form.md)。

## 整体结构

```
imds-dialog-wrapper                      # 尺寸控制包装器
└── imds-dialog                          # 对话框本体
    ├── imds-dialog-header               # 头部（标题 + 关闭按钮）
    ├── imds-dialog-content (+ scrollbar)# 内容区域
    │   └── imds-px-4 imds-py-3          # 内侧边距包装
    │       └── imds-table is-area-bordered is-bordered
    │           └── imds-table-inner
    │               └── table > tbody
    │                   └── 每行 tr：「th：项目名 / td：值」
    └── imds-dialog-footer               # 底部（仅关闭按钮）
        └── imds-p-4
            └── button（关闭）
```

## CSS Classes Reference（本模式特有）

| 类名 | 应用对象 | 用途 | 必填/可选 |
|----------|--------|------|----------------|
| imds-dialog-footer | div 元素（`imds-dialog` 末尾） | 底部区域（放置关闭按钮） | 必填 |
| imds-table | div 元素 | 值展示表格的外框 | 必填 |
| is-area-bordered | 与 imds-table 一起使用 | 表格外框线 | 推荐 |
| is-bordered | 与 imds-table 一起使用 | 所有单元格线（项目间分隔） | 推荐 |
| imds-table-inner | div 元素 | 表格内框（必需的双层结构） | 必填 |
| imds-px-4 imds-py-3 | 内容内侧包装 div | 横向/纵向内侧边距 | 实质上必填（也可使用 `imds-p-4`） |

其他类（`imds-dialog-*` / `imds-button` 等）请参考各个 reference 文件。

## HTML 代码片段

### 基本：详情对话框（`<dialog>` 根 / 推荐）

```html
<dialog
  id="category-detail-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="category-detail-dialog-title"
  style="height: 430px; width: 600px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="category-detail-dialog-title" title="类别详情">类别详情</h1>
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
        <div class="imds-table is-area-bordered is-bordered">
          <div class="imds-table-inner">
            <table>
              <tbody>
                <tr>
                  <th style="width:30%"><span>父类别</span></th>
                  <td><span>公开资料</span></td>
                </tr>
                <tr>
                  <th><span class="imds-required-label-required-asterisk">类别 ID</span></th>
                  <td><span>public_documents_1</span></td>
                </tr>
                <tr>
                  <th><span>类别名称</span></th>
                  <td><span>面向公司内部的公开资料</span></td>
                </tr>
                <tr>
                  <th><span class="imds-required-label-required-asterisk">排序号</span></th>
                  <td><span>10</span></td>
                </tr>
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
        <button type="button" class="imds-button" style="width: 8em">关闭</button>
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// 打开（模态）
document.getElementById('category-detail-dialog').showModal();

// 关闭
document.getElementById('category-detail-dialog').close();
```

以下仅展示与基本模式的差异。

## 行的变体

`tbody` 中排列的行模式。

### 1. 普通项目

```html
<tr>
  <th><span>类别名称</span></th>
  <td><span>面向公司内部的公开资料</span></td>
</tr>
```

### 2. 必填属性的标记展示

在详情展示中虽然不进行输入，但若想表明该项目"在登记时为必填"，可在 `th` 内的 `<span>` 加 `imds-required-label-required-asterisk`（注意加在 span 上，而不是 label 上）。

```html
<tr>
  <th><span class="imds-required-label-required-asterisk">类别 ID</span></th>
  <td><span>public_documents_1</span></td>
</tr>
```

### 3. 长文本 / 多行文本

长值可在 `<td>` 内换行。若要保留纯文本中的换行，请使用 CSS 的 `white-space: pre-wrap`。

```html
<tr>
  <th><span>说明</span></th>
  <td><span style="white-space: pre-wrap">多行的\n说明文本</span></td>
</tr>
```

### 4. 无值的项目

空值需以"（未设置）"等固定文本，或 `&mdash;` 等占位符明确表示（空 `<td>` 在屏幕阅读器中无法传达含义）。

```html
<tr>
  <th><span>备注</span></th>
  <td><span class="has-text-grey">（未设置）</span></td>
</tr>
```

### 5. 链接 / 标签等富内容值

`<td>` 内可放置任意 imds 组件。

```html
<tr>
  <th><span>状态</span></th>
  <td><span class="imds-tag is-success">发布中</span></td>
</tr>
```

## 变体

### 同时放置编辑按钮（详情 → 编辑的引导）

与"关闭"并列放置"编辑"按钮时，将主要操作（编辑）置于右端。

```html
<div class="imds-dialog-footer">
  <div
    class="imds-p-4"
    style="display:flex; gap:0 1em; justify-content: flex-end">
    <button type="button" class="imds-button" style="width: 8em">关闭</button>
    <button type="button" class="imds-button is-primary" style="width: 8em">编辑</button>
  </div>
</div>
```

### 返回 + 关闭（从列表跳转过来时）

只有"关闭"时操作单一，因此仅在存在返回引导的场景使用两按钮布局。

```html
<div class="imds-dialog-footer">
  <div
    class="imds-p-4"
    style="display:flex; gap:0 1em; justify-content: space-between">
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>
      <span class="imds-button-text">返回</span>
    </button>
    <button type="button" class="imds-button" style="width: 8em">关闭</button>
  </div>
</div>
```

### `<div>` 根（仅限非模态 / 特殊用途）

仅在不需要模态化时使用 `<div>` 根。原则上请使用 `<dialog>` 根。详情请参考 [imds-html-dialog.md](imds-html-dialog.md)。

```html
<div
  class="imds-dialog-wrapper"
  style="height: 430px; width: 600px;">
  <div class="imds-dialog">
    <!-- header / content / footer 相同 -->
  </div>
</div>
```

### 尺寸调整

通过 `imds-dialog-wrapper` 的 `style` 更改对话框尺寸。根据项目数调整高度，超出部分由 `imds-dialog-content imds-scrollbar` 进行纵向滚动。

```html
<!-- 小（项目较少） -->
<dialog class="imds-dialog-wrapper" style="height: 320px; width: 480px;">

<!-- 大（项目较多 / 含长文本值） -->
<dialog class="imds-dialog-wrapper" style="height: 600px; width: 720px;">
```

## 实现注意事项

- **本模式为只读**。不要放置输入元素（`<input>` / `<select>` / `<textarea>`）。若需要输入，请切换到 [imds-html-dialog-form.md](imds-html-dialog-form.md) 的模式
- **表格必须采用双层结构**。在 `<div class="imds-table">` 之下直接放 `<div class="imds-table-inner">`，再在其中放 `<table>`（[imds-html-table.md](imds-html-table.md)）。省略会导致边框样式异常
- **th 的宽度在首行 `<th>` 上以 `style="width:30%"` 等指定**。不必在所有行的 th 都写，列宽由第一个单元格确定，相当于 `<colgroup>` 的替代
- **值默认用 `<span>` 包装**。直接放在 `<td>` 下的文本节点不便于样式应用和脚本引用
- **空值用占位符明示**。空 `<td>` 在屏幕阅读器中只读作"空"，请放入"（未设置）"、"&mdash;"等
- **`imds-required-label-required-asterisk` 既可用于 label 也可用于 span**，但详情展示并非表单输入而是单纯的项目名，因此请加在 `<span>` 上（不要用 `<label for=...>`）
- **底部按钮布局**："仅关闭" → 右对齐；"关闭 + 编辑" → 右对齐且主要操作在最右；"返回 + 关闭" → `justify-content: space-between` 左右分布。通用规则是把主要操作放在最右
- **务必明确指定 `type="button"`**。关闭、编辑等均使用 `type="button"`（本模式不存在 `<form>`，但某些浏览器会把首个 button 视为 submit 而引发意外行为）
- **按下编辑按钮时的行为**：通常先 `close()` 详情对话框，再用 `showModal()` 打开编辑对话框（[imds-html-dialog-form.md](imds-html-dialog-form.md)）。注意不要在两个对话框中使用相同的 id
- **标题 `<h1>` 的 `title` 属性**：为应对标题文本过长时的省略显示，添加 `<h1 title="...">`（dialog 通用规则）
- **避免 id 冲突**：在同一画面并列"新建 / 编辑 / 详情"3 个对话框时，使用如 `id="category-create-dialog"` / `id="category-edit-dialog"` / `id="category-detail-dialog"` 的前缀来区分
