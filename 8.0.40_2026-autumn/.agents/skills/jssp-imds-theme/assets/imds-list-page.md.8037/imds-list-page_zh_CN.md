# 列表页面实现示例

结合 imds 主题组件的业务列表页面实现示例。
以"库存管理"页面为题材，展示标题、搜索栏、表格和分页的构成模式。

## 使用组件列表

| 组件 | reference | 本例中的用途 |
|---------------|-----------|-------------|
| Header | [header.md](../reference/header.md) | 带图标的页面标题 |
| InputGroup | [input-group.md](../reference/input-group.md) | 搜索关键词输入框 |
| Textbox | [textbox.md](../reference/textbox.md) | 搜索文本输入 |
| Button | [button.md](../reference/button.md) | 搜索按钮・新建按钮 |
| Table | [table.md](../reference/table.md) | 数据列表表格 |
| Pagination | [pagination.md](../reference/pagination.md) | 翻页导航 |
| IconFont | [icon-font.md](../reference/icon-font.md) | 搜索图标 |

## 整体结构

```
imds-container
├── header.imds-header              ... 页面标题（图标・标题）
└── main
    └── section.imds-section
        ├── div.button-area         ... 操作区域（搜索栏 + 新建按钮）
        │   ├── imds-input-group    ... 搜索关键词输入组
        │   └── button              ... 新建按钮
        ├── div.imds-table          ... 数据列表表格
        └── div#pagination          ... 分页
```

## 1. 页面标题

图标 + 标题（带副标题）的基本构成。
副标题和标题通过 `<imart>` 标签从服务端动态输出。

```html
<header class="imds-header">
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
  </div>
</header>
```

**要点：**
- 使用 `<imart type="string">` 输出从功能容器传递的值
- 使用 `escapeXml="true"` 进行 XSS 防护

## 2. 操作区域（搜索栏 + 新建按钮）

**「新建」「添加」等数据操作按钮必须放在列表表格的正上方，而不是放在页眉（`imds-header-actions`）中**（UI 团队的设计规则）。允许放在页眉中的仅限于「设置」「导出」等页面级元操作。

### 2-A. 带搜索栏

并排放置使用 `imds-input-group` 的搜索栏和 `imds-button is-primary` 的新建按钮。
`button-area` 是自定义类，用于控制搜索栏和按钮的横向排列布局。

```html
<div class="button-area imds-mb-3">
  <div class="imds-input-group">
    <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="搜索关键词">
    <button type="button" title="搜索" class="imds-button">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </button>
  </div>
  <button type="button" id="create-button" class="imds-button is-primary">新建</button>
</div>
```

**要点：**
- 在 `imds-input-group` 内组合放置 `imds-textbox`（`type="search"`）和搜索图标按钮
- 搜索按钮添加 `title="搜索"` 以确保无障碍性
- 添加 `imds-mb-3` 与表格之间设置间距

### 2-B. 无搜索栏（仅新建按钮）

如果只放置新建按钮，则在表格正上方**右对齐**放置。

```html
<div style="display:flex; justify-content:flex-end; margin-bottom: 0.75em;">
  <button type="button" id="create-button" class="imds-button is-primary">
    <span class="imds-icon"><i class="fa-solid fa-plus"></i></span>
    <span class="imds-button-text">新建</span>
  </button>
</div>
```

## 3. 数据列表表格

以 `imds-table` > `imds-table-inner` > `table` 的三层结构构成列表表格。
在 `thead` 中定义列标题，`tbody` 通过 JavaScript 动态生成行。

```html
<div class="imds-table" id="stock-table">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th class="col-edit has-text-centered"><span>编辑</span></th>
          <th><span>商品编码</span></th>
          <th><span>商品名称</span></th>
          <th><span>单价</span></th>
          <th><span>库存数量</span></th>
          <th><span>仓库编号</span></th>
          <th><span>备注</span></th>
        </tr>
      </thead>
      <tbody id="stock-table-body"></tbody>
    </table>
  </div>
</div>
```

**要点：**
- `tbody` 定义为空，指定 `id="stock-table-body"`，通过 JavaScript 动态插入行
- "编辑"列添加自定义类 `col-edit`，通过 CSS 控制列宽
- 可根据需要在 `imds-table` 上添加 `is-hoverable`、`is-stripe`、`is-sticky` 等

## 4. 分页

在表格下方放置翻页导航的区域。
指定 `id="pagination"`，通过 JavaScript 动态生成 `imds-pagination`。

```html
<div class="imds-py-3" id="pagination"></div>
```

**要点：**
- 添加 `imds-py-3` 与表格之间设置上下内边距
- 分页 HTML 通过 JavaScript 动态生成（因为页数会根据搜索结果数量变化）

## 完整代码

```html
<div id="container">
  <div class="imds-container">
    <header class="imds-header">
      <div class="imds-header-icon">
        <span class="imds-icon-wrapper is-large">
          <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
        </span>
      </div>
      <div class="imds-header-title">
        <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
        <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
      </div>
    </header>
    <main>
      <div class="imds-py-3">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4">
          <div class="button-area imds-mb-3">
            <div class="imds-input-group">
              <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="搜索关键词">
              <button type="button" title="搜索" class="imds-button">
                <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
              </button>
            </div>
            <button type="button" id="create-button" class="imds-button is-primary">新建</button>
          </div>
          <div class="imds-table" id="stock-table">
            <div class="imds-table-inner">
              <table>
                <thead>
                  <tr>
                    <th class="col-edit has-text-centered"><span>编辑</span></th>
                    <th><span>商品编码</span></th>
                    <th><span>商品名称</span></th>
                    <th><span>单价</span></th>
                    <th><span>库存数量</span></th>
                    <th><span>仓库编号</span></th>
                    <th><span>备注</span></th>
                  </tr>
                </thead>
                <tbody id="stock-table-body"></tbody>
              </table>
            </div>
          </div>
          <div class="imds-py-3" id="pagination"></div>
        </section>
      </div>
    </main>
  </div>
</div>
```

## 实现注意事项

- `button-area` 不是 imds 主题的标准类，而是用于搜索栏和新建按钮横向排列布局的自定义类
- `col-edit` 也是自定义类，用于调整编辑列的宽度
- `:searchKeywords:` 为占位符，实现时请替换为唯一的 ID
- 表格的行数据和分页通过 JavaScript 动态生成和控制
- 单价、库存数量等数值列建议在 `td` 上添加 `has-text-right` 使其右对齐
