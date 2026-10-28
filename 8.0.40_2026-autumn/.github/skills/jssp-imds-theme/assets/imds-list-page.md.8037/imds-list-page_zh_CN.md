# 列表页面实现示例

结合 imds 主题组件的业务列表页面实现示例。
以"库存管理"页面为题材，展示标题、搜索栏、表格和分页的构成模式。

本页面的固定标题与滚动区域使用固定类名 `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` 的布局控制模式（基于 `height: 100%`，因此必须在 `<imart type="head">` 中加载 `theme-conditional-layout.css`，详见「实现注意事项」）。按功能使用不同占位符 prefix 的旧方式说明请参见 [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md)。搜索栏的实现遵循 [imds-common-search-layout.md](../reference/imds-common-search-layout.md) 的服务端搜索模式（`<form>` + `type="submit"` + `preventDefault()`）。

## 使用组件列表

| 组件 | reference | 本例中的用途 |
|---------------|-----------|-------------|
| Header | [imds-html-header.md](../reference/imds-html-header.md) | 带图标的页面标题 |
| InputGroup | [imds-html-input-group.md](../reference/imds-html-input-group.md) | 搜索关键词输入框 |
| Textbox | [imds-html-textbox.md](../reference/imds-html-textbox.md) | 搜索文本输入 |
| Button | [imds-html-button.md](../reference/imds-html-button.md) | 搜索按钮・新建按钮 |
| Table | [imds-html-table.md](../reference/imds-html-table.md) | 数据列表表格 |
| Pagination | [imds-html-pagination.md](../reference/imds-html-pagination.md) | 翻页导航 |
| IconFont | [imds-html-icon-font.md](../reference/imds-html-icon-font.md) | 搜索图标 |

## 整体结构

在 `imds-container` 上附加 `pgstyle-layout-container`（2 行网格），在 `<main>` 上附加 `pgstyle-layout-main`（纵向 flex），在需要滚动的内容区域上附加 `pgstyle-layout-content`（`flex:1 0 0; overflow:auto`）。不设置中间的 `<section>` 包装层，将表格相关元素统一放入 `<main>` 正下方的一层 div 中。

```
div.imds-container.pgstyle-layout-container    ... 根 div（会被放置在 intra-mart 主题的 imui-container 内部，因此不附加 id，也不夹带中间包装层）
├── header.imds-header                        ... 页面标题（图标・标题。固定显示）
└── main.pgstyle-layout-main（纵向 flex 容器）
    └── div.pgstyle-table-wrapper.pgstyle-layout-content（附加 imds-scrollbar。flex:1 0 0; overflow:auto）
        ├── form                    ... 搜索表单（服务端搜索。type="submit" + preventDefault()）
        │   └── div.pgstyle-toolbar ... 操作区域（搜索栏 + 新建按钮）
        │       ├── imds-input-group ... 搜索关键词输入组
        │       └── button           ... 新建按钮
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
`pgstyle-toolbar` 是自定义类，用于控制搜索栏和按钮的横向排列布局。

**此列表页面的搜索为服务端搜索**（按关键词请求服务端重新搜索的方式）。遵循 [imds-common-search-layout.md](../reference/imds-common-search-layout.md) 的标准模式，用 `<form>` 包裹搜索栏，将 Enter 的隐式 submit 与搜索按钮（`type="submit"`）的路径统一为一条（通过 `type="button"` 的点击处理程序执行搜索的实现属于误用）。

```html
<form id="search-form" class="imds-form">
  <div class="pgstyle-toolbar imds-mb-2">
    <div class="imds-input-group">
      <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="按商品编码・商品名称搜索" aria-label="按商品编码・商品名称搜索">
      <button type="submit" title="搜索" class="imds-button is-outlined">
        <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
      </button>
    </div>
    <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">新建</button>
  </div>
</form>
```

```javascript
document.getElementById('search-form').addEventListener('submit', function (event) {
  event.preventDefault();   // 必须。遗漏阻止会导致页面重新加载事故
  searchStockList();
});
```

**要点：**
- 在 `imds-input-group` 内组合放置 `imds-textbox`（`type="search"`）和搜索图标按钮
- 用 `<form>` 包裹搜索栏和搜索按钮，搜索按钮设为 `type="submit"`（按 Enter 键也通过同一路径执行搜索）
- 在 `submit` 事件处理程序中必须调用 `event.preventDefault()`，防止页面重新加载
- 「新建」按钮是与搜索无关的操作，因此保持 `type="button"`，避免被卷入 `<form>` 的 submit
- 搜索按钮添加 `title="搜索"` 以确保无障碍性
- 添加 `imds-mb-2` 与表格之间设置间距
- 搜索栏的宽度通过在 `<style>` 中定义 `.pgstyle-toolbar > .imds-input-group { max-width: 30em; flex: 1 0 20em; }` 来指定（参见「实现注意事项」的 CSS）。数值可根据占位符及预期搜索关键词的长度按页面调整。不新建类，而使用后代选择器指定（避免与 imds 默认的 `.imds-input-group` 优先级相同，因定义顺序而无法覆盖）
- 新建按钮以不带图标为基准（有必要时也可添加图标），通过 `style="min-width: 8em;"` 指定最小宽度

**搜索按钮的颜色不使用 `is-primary`（重要）：**
搜索按钮应使用 **无色（普通的 `imds-button`）或 `is-outlined`，不添加 `is-primary`**。
理由有以下 2 点。
- DESIGN.md 中有「主要操作（primary）每个页面只有 1 个」的原则，在此列表页面中由「新建」按钮承担 primary 的角色。若搜索按钮也设为 `is-primary`，则 1 个页面中会并列 2 个 primary，违反原则。
- 搜索是操作频率和重要性低于「新建」的辅助操作，应降低其视觉优先级。

**搜索输入的 `aria-label` 是必须的（重要）：**
搜索文本框虽有 `placeholder`，但没有可见的 `<label>`，屏幕阅读器用户无法判断输入框的用途。
**对没有可见标签的搜索输入必须添加 `aria-label`（例：`aria-label="按商品编码・商品名称搜索"`）。** `placeholder` 不能替代 `aria-label`（获得焦点时会消失，且辅助技术的处理不稳定）。

**搜索输入的 `placeholder` / `aria-label` 的写法：**
写成「按〈检索对象的项目名〉搜索」（例：「按品目名称搜索」「按商品编码・商品名称搜索」）。不要只写「搜索关键词」这类通用词或「品目名称」这类项目名（以便向用户说明可以按什么搜索，并统一各画面的写法）。`placeholder` 与 `aria-label` 使用相同的文字。

### 2-B. 无搜索栏（仅新建按钮）

如果只放置新建按钮，则在表格正上方**右对齐**放置。

```html
<div style="display:flex; justify-content:flex-end; margin-bottom: 0.75em;">
  <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">新建</button>
</div>
```

## 3. 数据列表表格

以 `imds-table` > `imds-table-inner` > `table` 的三层结构构成列表表格。
在 `thead` 中定义列标题，`tbody` 通过 JavaScript 动态生成行。

```html
<div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th><span>商品名称</span></th>
          <th><span>商品编码</span></th>
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
- 不设置「编辑」等操作专用列，将识别行的主要项目（本例中为商品名称）放在首列，通过单元格内链接（`<td><span><a href="...">商品名称</a></span></td>`）跳转到编辑/详情页面
- 链接文本通过 `textContent` 设置，`href` 通过 `setAttribute` 设置（若用 `innerHTML` 的字符串拼接组装属性值，会因跳出属性值而产生 XSS 风险）

```javascript
const link = document.createElement('a');
link.textContent = item.productName;
link.setAttribute('href', 'sample/stock/edit?productCode=' + encodeURIComponent(item.productCode));
const span = document.createElement('span');
span.appendChild(link);
const cell = document.createElement('td');
cell.appendChild(span);
```
- 添加 `is-area-bordered is-sticky is-narrow is-hoverable` 和 `style="height: 100%"`，使表格填满 `pgstyle-layout-content` 的滚动区域（`is-sticky` 同时支持表头固定与纵向滚动）
- `is-narrow` 并非必须，但列表表格默认添加（以增加一次显示的行数、提高信息密度）
- 如果存在使用 `has-text-right` 右对齐的数值列，还需在 `imds-table` 上添加 `is-bordered`
- 可根据需要在 `imds-table` 上添加 `is-stripe` 等

## 4. 分页

在表格下方放置翻页导航的区域。
指定 `id="pagination"`，通过 JavaScript 动态生成 `imds-pagination`。在生成的 `nav` 上添加 `imds-pagination is-small`，以小尺寸显示。

```html
<div class="imds-mt-2" id="pagination"></div>
```

**要点：**
- 添加 `imds-mt-2` 与表格之间设置上边距
- 分页 HTML 通过 JavaScript 动态生成（因为页数会根据搜索结果数量变化）
- 搜索结果为 0 条时，通过 `style.display = 'none'` 隐藏 `#pagination` 本身，有 1 条以上时恢复为 `style.display = ''`（仅清空内容会残留 `imds-mt-2` 的间距）

## 完整代码

根 `<div>` 不附加 id，只附加 `class="imds-container ..."`，不制造中间包装层。在 `imds-container` 上附加 `pgstyle-layout-container`（2 行网格），在 `<main>` 上附加 `pgstyle-layout-main`（纵向 flex），在需要滚动的内容区域（附加 `imds-scrollbar`）上附加 `pgstyle-table-wrapper pgstyle-layout-content`（`flex: 1 0 0; overflow: auto;`）。不设置中间的 `<section>` 包装层，将操作区域、表格、分页统一放入 `<main>` 正下方的一层 div 中。

```html
<div class="imds-container pgstyle-layout-container">
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
  <main class="pgstyle-layout-main">
    <div class="imds-px-3 imds-py-2 pgstyle-table-wrapper pgstyle-layout-content imds-scrollbar">
      <form id="search-form" class="imds-form">
        <div class="pgstyle-toolbar imds-mb-2">
          <div class="imds-input-group">
            <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="按商品编码・商品名称搜索" aria-label="按商品编码・商品名称搜索">
            <button type="submit" title="搜索" class="imds-button is-outlined">
              <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
            </button>
          </div>
          <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">新建</button>
        </div>
      </form>
      <div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
        <div class="imds-table-inner">
          <table>
            <thead>
              <tr>
                <th><span>商品名称</span></th>
                <th><span>商品编码</span></th>
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
      <div class="imds-mt-2" id="pagination"></div>
    </div>
  </main>
</div>
```

## 实现注意事项

- `pgstyle-toolbar` 不是 imds 主题的标准类，而是用于搜索栏和新建按钮横向排列布局的自定义类
- `:searchKeywords:` 为占位符，实现时请替换为唯一的 ID
- 表格的行数据和分页通过 JavaScript 动态生成和控制
- 单价、库存数量等数值列建议在 `td` 上添加 `has-text-right` 使其右对齐
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-table-wrapper` / `pgstyle-toolbar` 是**固定**类名，不是按功能替换的占位符——生成时也不要更改类名
- 本模板只包含 HTML 部分，因此需要在 `<imart type="head">` 的 `<style>` 中定义以下布局控制样式（仅列出本文件实际使用的类；本页面没有 footer，因此不包含 `pgstyle-layout-footer`）

  ```css
  /* 布局控制样式 */
  .pgstyle-layout-container {
    grid-template-rows: 5rem minmax(0, 1fr);
    grid-template-columns: 100%;
    height: 100%;
    display: grid;
  }
  .pgstyle-layout-container > .imds-header {
    grid-row: 1 / 2;
  }
  .pgstyle-layout-main {
    flex-direction: column;
    grid-row: 2 / 3;
    height: 100%;
    display: flex;
  }
  .pgstyle-layout-content {
    flex: 1 0 0;
    overflow: auto;
  }
  .pgstyle-table-wrapper {
    display: flex;
    flex-direction: column;
  }
  .pgstyle-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    gap: 0.5em 1em;
  }
  /* 搜索栏宽度（数值可按页面调整） */
  .pgstyle-toolbar > .imds-input-group {
    max-width: 30em;
    flex: 1 0 20em;
  }
  ```

- `<imart type="head">` 中还必须加载 `im_design_system/theme/css/theme-conditional-layout.css`（用于控制各主题不同的内容显示区域高度和宽度的 CSS）。如果缺少该文件，`.imds-container` 的高度将无法确定，导致 `pgstyle-layout-content` 的 `flex: 1 0 0` 没有可伸展的空间，内容区域会被压缩为高度 0。

  ```html
  <!-- 用于控制各主题不同的内容显示区域高度和宽度的 CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  ```

## 5. 2 列布局（带导航的列表）

列表页面有「1 列布局」（如本例仅包含搜索栏 + 表格）和「2 列布局」（在左侧放置导航）2 种模式。

- **1 列**：不需要导航、没有分类的简单列表（例：上述「库存管理」页面）
- **2 列**：列表数据具有层级结构或分类，希望在左列按类别/分类筛选时（使用树形或列表形式的导航）

选择 2 列布局的判断标准是「是否需要向用户提供列表数据的分类与筛选」。对于没有分类的简单 CRUD 主数据，保持 1 列即可。

### 整体结构（2 列）

整个页面的固定标题与滚动（在 `imds-container` 上附加 `pgstyle-layout-container`，在 `<main>` 上附加 `pgstyle-layout-main`，在 `flex:1 0 0; overflow:auto` 的滚动区域上附加 `pgstyle-layout-content`）与「完整代码」节相同。以下 `<div>` 用于**整体替换**该 `<main>` 内滚动区域（`pgstyle-layout-content`）的**内容**，下方 `nav` 内的 `overflow-y:auto` 是其更内侧的**组件级滚动**（仅导航的树/列表），与页面级的固定标题布局是不同的概念。

```
div.imds-container.pgstyle-layout-container（固定标题布局・不附加 id。详见「实现注意事项」）
├── header.imds-header
└── main.pgstyle-layout-main
    └── div.pgstyle-layout-content.imds-scrollbar（flex:1 0 0; overflow:auto。display:flex; 左右分割）
        ├── nav（左列／宽度固定 250px）
        │   ├── div.nav-search             ... 类别搜索栏
        │   └── div.nav-scroll-area         ... 树 or 列表（组件级滚动。仅此区域）
        └── div（右列／主要内容）
            ├── form                        ... 搜索表单（服务端搜索）
            │   └── div.pgstyle-toolbar     ... 搜索栏 + 新建按钮
            ├── div.imds-table               ... 数据列表表格
            └── div#pagination                ... 分页
```

### 实现示例

```html
<div class="imds-px-3 imds-py-2 pgstyle-layout-content imds-scrollbar" style="display:flex; gap:1.5em; align-items:flex-start;">
  <!-- 左列：导航（宽度固定 250px） -->
  <nav style="width:250px; flex:0 0 250px; display:flex; flex-direction:column;">
    <div class="imds-input-group imds-mb-2">
      <input type="search" class="imds-textbox" placeholder="按类别名称搜索" aria-label="按类别名称搜索">
      <button type="button" title="搜索" class="imds-button is-outlined is-small">
        <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
      </button>
    </div>
    <!--
      仅让导航部分滚动（搜索栏、操作按钮不滚动）。
      父元素（nav / section / main）没有明确高度时，若将 flex-basis 设为 0（flex: 1 0 0），
      由于没有可伸展的空间，高度会被压缩为 0 而不显示（实现时实际发生过的缺陷）。
      flex-basis 应设为 auto，以内容的自然高度为基准，通过 max-height 设置滚动上限。
    -->
    <div class="imds-scrollbar" style="overflow-y:auto; flex:0 1 auto; max-height: 480px;">
      <nav class="imds-menu">
        <ul class="imds-menu-list">
          <li><a href="#"><span>全部</span></a></li>
          <li><a href="#"><span>类别A</span></a></li>
          <li><a href="#"><span>类别B</span></a></li>
        </ul>
      </nav>
    </div>
  </nav>
  <!-- 右列：主要内容 -->
  <div style="flex:1 1 auto; min-width:0;">
    <form id="search-form" class="imds-form">
      <div class="pgstyle-toolbar imds-mb-2">
        <div class="imds-input-group">
          <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="按商品编码・商品名称搜索" aria-label="按商品编码・商品名称搜索">
          <button type="submit" title="搜索" class="imds-button is-outlined">
            <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
          </button>
        </div>
        <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">新建</button>
      </div>
    </form>
    <div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
      <div class="imds-table-inner">
        <table>
          <thead>
            <tr>
              <th><span>商品名称</span></th>
              <th><span>商品编码</span></th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
    <div class="imds-mt-2" id="pagination"></div>
  </div>
</div>
```

**要点：**
- 导航的宽度**固定为 250px**
- 仅让导航（树/列表部分）通过 `overflow-y:auto`（同时使用 `imds-scrollbar`）滚动，搜索栏和操作按钮保持始终显示、固定不动
- 树形用于具有层级结构的分类，列表形式用于没有层级的分类。准备「全部」节点用于显示全部数据
- **反模式：滚动区域不要使用 `flex: 1 0 0`（flex-basis: 0）**。在 `nav` / `section` / `main` 未设置明确高度的环境中（实现时实际发生过），由于没有可伸展的空间，高度会被压缩为 0 而不显示。应设为 `flex: 0 1 auto`（flex-basis: auto），以内容的自然高度为基准，通过 `max-height` 设置滚动上限

## 6. `isSticky`（固定表头）

列表数据较多、表格纵向较长时，固定表头（`thead`），仅让数据部分（`tbody`）纵向滚动，使列标题在滚动时也始终可见。

```html
<div class="imds-table is-sticky" style="max-height: 480px;">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th><span>商品名称</span></th>
          <th><span>商品编码</span></th>
        </tr>
      </thead>
      <tbody id="stock-table-body"></tbody>
    </table>
  </div>
</div>
```

**要点（实际 DOM 规格）：**
- 在 `imds-table` 上添加 `is-sticky` 以固定 `thead`。在 `div.imds-table` 上指定 `max-height` 以创建纵向滚动区域
- 实际滚动的只有数据区域（`tbody`），但根据 CSS 规格，表头部分也会显示滚动条（属于外观上的限制，没有实际影响）
- 希望在横向滚动时也固定特定列（识别行的列・主要链接列）时，在要固定的列的 `th`/`td` 上添加 **`is-sticky`**（`imds-table` 一侧不添加列固定专用的修饰符，而按 `th`/`td` 单位指定）。列固定原则上**仅限左侧**，对象为用于识别行的项目或主要使用的链接・按钮列
- 固定列后，固定列下方也会显示滚动条，但实际的横向滚动区域为固定列以外的部分

## 7. 分页的初始值与条数选择

- 列表为「表格」时原则上放置分页。在预期运营期间内数据量较少、获取不耗时的情况下可以省略（省略时也不放置搜索条件）
- 「显示条数选择」必须显示。**默认值为 100 条**，选项以 25 或 50 为步长准备 **5 档**
  - 例：`100, 125, 150, 175, 200`（初始显示 100）
  - 例：`50, 100, 150, 200, 250`（初始显示 100）
  - 卡片（1 行多张卡片）时，以 1 行张数的倍数准备选项（例：1 行 4 张卡片时为 `40, 80, 120, 160, 200`，初始显示 80）
- 页面宽度在平板及以下（769px〜小于 1023px）时，将 `imds-pagination` 切换为 `imds-html-pagination-compact.md` 的 PaginationCompact

```html
<div class="imds-pagination-options">
  <div class="imds-pagination-records-per-page">
    <label for="records-per-page">显示条数</label>
    <select id="records-per-page" class="imds-select">
      <option value="100" selected>100</option>
      <option value="125">125</option>
      <option value="150">150</option>
      <option value="175">175</option>
      <option value="200">200</option>
    </select>
  </div>
  <span>1 - 100 / 320</span>
</div>
```

## 8. 空状态 UI（数据 0 条）

列表中没有要显示的数据时，显示空状态 UI 以代替表格和分页。实现时使用 `reference/imds-html-empty-state.md` 的 EmptyState 组件。

列表页面中可能出现的空状态有 2 种模式，需区分显示内容。

| 模式 | 发生条件 | 显示内容 |
|---|---|---|
| **数据未登记** | 未指定搜索条件的状态下，根本没有登记任何数据 | 「尚未登记数据」等消息 + 「新建」按钮（提示下一步应采取的操作） |
| **搜索结果 0 条** | 没有与搜索条件・导航筛选条件匹配的数据 | 「未找到符合条件的数据」等消息（提示重新检查搜索条件。新建按钮可选） |

**要点：**
- 「搜索结果 0 条」时，在有表格的页面中保持显示表头（`thead`），在 `tbody` 部分显示空状态消息（不删除列标题本身）
- 无论哪种模式都不显示分页
- 「数据未登记」时，将包含搜索栏・新建按钮的操作区域、表格、分页全部隐藏，仅显示 EmptyState（不需要搜索栏，显示空表格的意义也不大）。将列表区域与空状态区域设为不同的块，根据有无数据切换显示
- 「数据未登记」的 EmptyState 使用不添加尺寸类的默认尺寸（相当于 `is-large`），在 `imds-empty-state-content` 内放置新建按钮（`is-small` / `is-x-small` 无法使用操作按钮）
- 具体的 `imds-empty-state` HTML 结构与变体请参阅 `reference/imds-html-empty-state.md`（本文件仅介绍概要）

## 9. 搜索条件保持规则（页面跳转・状态管理）

列表页面的搜索条件和页面状态，按以下规则保持或重置。

| 操作 | 搜索条件 | 页码 | 排序键/排列顺序 | 导航选择 | 显示条数 |
|---|---|---|---|---|---|
| 更改显示条数 | 保持 | - | 保持 | 保持 | 变更后的值保持**到页面重新加载为止** |
| 在导航中选择类别 | 保持 | **重置为 1** | 保持 | 选择状态保持**到页面重新加载为止** | 保持 |
| 执行排序 | 保持 | **重置为 1** | 保持变更后的值 | 保持 | 保持 |
| 更改搜索条件并执行搜索 | 保持变更后的值 | **重置为 1** | 保持 | 保持 | 保持 |
| 跳转到其他页面后，通过「返回」回到本页 | 保持 | 保持 | 保持 | 保持 | 保持 |

**要点：**
- 「更改搜索条件并执行搜索」「执行排序」都会将页码重置为 1，但保持另一方的状态（搜索条件 or 排序）（两者独立进行状态管理）
- 跳转到其他页面后通过「返回」回到本页时，导航选择・搜索条件・页码・显示条数・排序键与排列顺序**全部保持**
- 实现上，将搜索条件・页码・排序信息保存在 URL 查询参数或 `SessionScopeStorage` 中，在页面初始显示时恢复
