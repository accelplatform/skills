# 导出画面实现示例

结合 imds 主题组件的业务导出画面实现示例。
以「助手定义」画面为题材，展示页头・步进器・导出方式选择・对象选择（列表）・执行确认的构成模式。

本页面固定显示页头，仅让步进器各步骤内容纵向滚动。使用基于固定类名 `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-layout-footer` 的布局控制模式（由于以 `height: 100%` 为基础，必须在 `<imart type="head">` 中加载 `theme-conditional-layout.css`。详情请参阅「实现注意事项」）。按功能使用不同占位符 prefix 的旧方式的说明请参阅 [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md)。

## 使用组件列表

| 组件 | reference | 本例中的用途 |
|---------------|-----------|-------------|
| Header | [imds-html-header.md](../reference/imds-html-header.md) | 带相关页面菜单的页头 |
| Stepper | [imds-html-stepper.md](../reference/imds-html-stepper.md) | 显示导出流程的进度 |
| Message | [imds-html-message.md](../reference/imds-html-message.md) | 导出内容的补充说明 |
| Radio | [imds-html-radio.md](../reference/imds-html-radio.md) | 选择导出方式 |
| Button | [imds-html-button.md](../reference/imds-html-button.md) | 导出执行按钮・下一步按钮 |
| EmptyState | [imds-html-empty-state.md](../reference/imds-html-empty-state.md) | 对象选择区域为空时的显示 |
| Table | [imds-html-table.md](../reference/imds-html-table.md) | 导出对象列表表格 |
| Confirm | [imds-csjs-confirm.md](../reference/imds-csjs-confirm.md) | 执行导出前的确认对话框 |

## 整体结构

为 `imds-container` 附加 `pgstyle-layout-container`（2 行网格），为 `<main>` 附加 `pgstyle-layout-main`（纵向 flex），为步骤内容的滚动区域附加 `pgstyle-layout-content`（`flex:1 0 0; overflow:auto`），为固定页脚附加 `pgstyle-layout-footer`（`flex:0 0 auto`）。

```
div.imds-container.pgstyle-layout-container    ... 根 div（会被放置在 intra-mart 主题的 imui-container 内部，因此不附加 id，也不夹带中间包装层）
├── header.imds-header               ... 页头（相关页面菜单・标题。固定显示）
└── main.pgstyle-layout-main（纵向 flex 容器）
    ├── div.imds-stepper              ... 进度步进器（2 个步骤。固定显示，flex:0 0 auto）
    └── section.pgstyle-layout-content（按步骤切换。附加 imds-scrollbar，flex:1 0 0; overflow:auto）
        ├── 步骤1: 选择导出方式
        │   ├── imds-message         ... 补充消息（可选）
        │   ├── imds-radio × 2        ... 「全部」/「选择」的选项
        │   └── button                ... 执行导出 or 下一步
        └── 步骤2: 选择导出对象（遵循列表画面。section 上也附加 pgstyle-table-wrapper）
            ├── form > div.pgstyle-toolbar ... 搜索栏（服务器端搜索。type="submit" + preventDefault()）
            ├── imds-table            ... 对象列表（带复选框列）
            └── div.pgstyle-layout-footer（main 正下方・滚动区域之外，flex:0 0 auto） ... 返回・导出按钮
```

## 1. 页头

导出画面通常带有切换到其他相关画面（导入画面・列表画面等）的菜单，因此使用 `imds-header-nav`（配合 Popover）模式。如果是独立画面且不需要相关页面菜单，也可以与列表画面一样使用 `imds-header-icon` 模式。

```html
<header class="imds-header">
  <div class="imds-popover is-left imds-header-nav">
    <button
      type="button"
      class="imds-button is-ghost is-large"
      aria-haspopup="true"
      aria-controls="imds-popover-nav">
      <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
      <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
    </button>
    <div id="imds-popover-nav" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a href="#"><span>助手定义列表</span></a></li>
            <li><a href="#"><span>助手定义导入</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
  </div>
</header>
```

**要点：**
- 页头中必须放置 `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` 之一（遵循 SKILL.md 的必须规则）。需要跳转到相关页面时选择 `imds-header-nav`
- 不在 `imds-header-actions` 中放置导出执行按钮（业务操作按钮不放在页头的原则同样适用于导出画面）

## 2. 步进器

导出画面由「选择导出方式」→「选择导出对象」2 个步骤构成。

```html
<div class="imds-stepper">
  <ul>
    <li class="imds-stepper-step is-active">
      <button disabled><span>1.选择导出方式</span></button>
    </li>
    <li class="imds-stepper-step">
      <button disabled><span>2.选择导出对象</span></button>
    </li>
  </ul>
</div>
```

**要点：**
- 通过 JavaScript 切换 `is-active` 类，显示当前步骤
- 各 `<button>` 保持 `disabled`（步进器仅用于显示进度，不提供点击在步骤间跳转的功能）

## 3. 步骤1: 选择导出方式

由补充消息（可选）+ 单选按钮（全部 / 选择）+ 操作按钮构成。

```html
<section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar" data-mode="new">
  <div class="imds-message is-outlined is-info imds-mb-4">
    <div class="imds-message-title">
      <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
      <p>导出助手定义</p>
    </div>
    <div class="imds-message-content">
      <p>导出助手定义。</p>
      <p>请选择导出方式，然后点击导出按钮。</p>
    </div>
  </div>
  <h2 class="imds-heading is-size-4 has-text-weight-bold">导出方式</h2>
  <div>
    <div>
      <label class="imds-radio is-medium has-text-weight-bold">
        <input type="radio" name="export-method" value="all" checked="">
        <span>全部导出</span>
      </label>
      <span class="imds-help-text imds-ml-7">导出所有助手定义。</span>
    </div>
    <div>
      <label class="imds-radio is-medium has-text-weight-bold">
        <input type="radio" name="export-method" value="select">
        <span>选择任意助手定义并导出</span>
      </label>
      <span class="imds-help-text imds-ml-7">导出从列表中选择的助手定义。</span>
    </div>
  </div>
  <button type="button" id="export-action-button" class="imds-button is-normal is-primary imds-mt-7" style="min-width: 8em;">
    导出
  </button>
</section>
```

**要点：**
- 初始显示时选中「全部导出」
- 根据单选按钮的选择，切换下方按钮的标题和动作
  - 选择「全部导出」时：按钮标题为「导出」，按下后直接执行导出处理
  - 选择「选择任意项并导出」时：按钮标题为「下一步」，按下后跳转到步骤2（对象选择）
- 消息（`imds-message`）的显示并非必须，仅在需要补充说明时放置
- 步骤1内容量较少，因此按钮不做成固定页脚，而是放置在内容正下方（属于 [imds-html-stepper.md](../reference/imds-html-stepper.md)「实现注意事项」中的例外）。内容量较多的步骤2，将返回・执行按钮放置在固定页脚（`pgstyle-layout-footer`）中

## 4. 步骤2: 选择导出对象

**布局遵循列表画面（`imds-list-page.md`）。** 由搜索栏・带复选框列的表格・「仅显示已选择项」复选框构成。

```html
<section class="imds-py-4 imds-px-6 pgstyle-table-wrapper pgstyle-layout-content imds-scrollbar">
  <form id="search-form" class="imds-form">
    <div class="pgstyle-toolbar imds-mb-2">
      <div class="imds-input-group">
        <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="按助手定义名称搜索" aria-label="按助手定义名称搜索">
        <button type="submit" title="搜索" class="imds-button is-outlined">
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </button>
      </div>
    </div>
  </form>
  <label class="imds-checkbox imds-mb-2">
    <input type="checkbox" id="show-selected-only">
    <span>仅显示已选择项</span>
  </label>
  <div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" style="height: 100%">
    <div class="imds-table-inner">
      <table>
        <thead>
          <tr>
            <th class="has-content-only"><label class="imds-checkbox"><input type="checkbox" id="select-all"></label></th>
            <th><span>助手定义名称</span></th>
            <th><span>更新者</span></th>
            <th>
              <div class="imds-table-column-actions">
                <button type="button" class="imds-table-sorter" title="按更新日期时间排序">
                  <span class="imds-table-sort-label">更新日期时间</span>
                  <span class="imds-icon"><i class="fa-solid fa-sort-up"></i><i class="fa-solid fa-sort-down"></i></span>
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody id="export-target-table-body"></tbody>
      </table>
    </div>
  </div>
</section>
<!-- 页脚放在 main 正下方・滚动区域（section）之外，通过 pgstyle-layout-footer（flex:0 0 auto）固定 -->
<div class="pgstyle-layout-footer imds-py-2 imds-px-6 imds-border-t-1">
  <button type="button" id="back-button" class="imds-button is-outlined" style="min-width: 8em;">返回</button>
  <button type="button" id="export-execute-button" class="imds-button is-primary" style="min-width: 8em;" disabled>导出</button>
</div>
```

**要点：**
- 搜索栏・表格与列表画面相同，由 `pgstyle-toolbar` / `is-area-bordered is-sticky is-narrow is-hoverable` + `style="height: 100%"` 构成，并为 section 附加 `pgstyle-table-wrapper`，使表格占满整个滚动区域显示。搜索通过 `<form>` 的 submit 执行，在 `submit` 事件处理程序中必须调用 `event.preventDefault()`
- 复选框列的 `th` / `td` 附加 `has-content-only`（因为不含表头文本，所以不使用 `has-text-centered`）
- 页脚的横向内边距（`imds-px-6`）与区块的横向内边距保持一致
- 在树/列表侧和详细列表侧都放置搜索部件时，即使在分类之间移动也保留输入内容
- 关键词搜索的对象与详细搜索的项目联动时，在执行搜索时为详细搜索的 Popover 添加 `is-applied` 类
- 必须包含「更新者」「更新日期时间」列，且更新日期时间列可排序（实际 DOM 结构为 `th > div.imds-table-column-actions > button.imds-table-sorter[title] > span.imds-table-sort-label + span.imds-icon`。同时放置 `fa-sort-up` 和 `fa-sort-down` 2 个图标）
- 复选框列的表头放置「全选」复选框。表格内的复选框仅为 `label.imds-checkbox > input`，不附加多余的 `<span>`
- 数据获取负荷较高时，初始显示为树未选择・列表为空，仅在选择分类后获取列表。列表为空期间显示 `reference/imds-html-empty-state.md` 的 EmptyState（例：「请从树中选择分类。」）
- 页脚的「导出」按钮在未选择任何对象期间设为 `disabled`
- 按下「返回」按钮返回步骤1

## 5. 导出执行确认对话框

执行导出前，显示明示对象件数的确认对话框。确认对话框通过 `imdsConfirm` 函数显示（以下为生成的 HTML 结构）。

```html
<dialog class="imds-confirm-wrapper">
  <div class="imds-confirm is-info">
    <div class="imds-confirm-content-wrapper">
      <button type="button" class="imds-confirm-close imds-button is-ghost">
        <span class="imds-icon"><i class="fa-solid fa-xmark"></i></span>
      </button>
      <div class="imds-confirm-content">
        <div class="imds-confirm-message-wrapper">
          <div class="imds-confirm-icon">
            <span class="imds-icon is-x-small is-info"><i class="fa-solid fa-circle-question"></i></span>
          </div>
          <div class="imds-confirm-message">
            <p class="imds-confirm-message-title">是否导出助手定义？</p>
            <div class="imds-confirm-message-content">导出对象：10件</div>
          </div>
        </div>
      </div>
    </div>
    <div class="imds-confirm-footer">
      <div class="imds-confirm-footer-content">
        <button type="button" class="imds-button">取消</button>
        <button type="button" class="imds-button is-primary">导出</button>
      </div>
    </div>
  </div>
</dialog>
```

**要点：**
- 必须显示选择件数（例：「导出对象：10件」），以便用户事先确认是否已选择了预期的对象
- 确认对话框的根元素为 `<dialog class="imds-confirm-wrapper">`（由 `imdsConfirm` 函数生成。请参阅 `reference/imds-csjs-confirm.md`）。与通用对话框的 `imds-dialog-wrapper` 不同

## 完整代码（步骤1）

根 `<div>` 不附加 id，只附加 `class="imds-container ..."`，不制造中间包装层。在 `imds-container` 上应用 `pgstyle-layout-container`（2 行网格），在 `<main>` 上应用 `pgstyle-layout-main`（纵向 flex），在步骤内容（附加 `imds-scrollbar`）上应用 `pgstyle-layout-content`（`flex: 1 0 0; overflow: auto;`）（CSS 定义请参阅「实现注意事项」）。

```html
<div class="imds-container pgstyle-layout-container">
  <header class="imds-header">
    <div class="imds-popover is-left imds-header-nav">
      <button
        type="button"
        class="imds-button is-ghost is-large"
        aria-haspopup="true"
        aria-controls="imds-popover-nav">
        <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
        <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
      </button>
      <div id="imds-popover-nav" role="menu" class="imds-popover-menu">
        <div class="imds-popover-content">
          <nav class="imds-menu">
            <ul class="imds-menu-list">
              <li><a href="#"><span>助手定义列表</span></a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>
  <main class="pgstyle-layout-main">
    <div class="imds-stepper">
      <ul>
        <li class="imds-stepper-step is-active">
          <button disabled><span>1.选择导出方式</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>2.选择导出对象</span></button>
        </li>
      </ul>
    </div>
    <section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar" data-mode="new">
      <div class="imds-message is-outlined is-info imds-mb-4">
        <div class="imds-message-title">
          <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
          <p>导出助手定义</p>
        </div>
        <div class="imds-message-content">
          <p>导出助手定义。</p>
          <p>请选择导出方式，然后点击导出按钮。</p>
        </div>
      </div>
      <h2 class="imds-heading is-size-4 has-text-weight-bold">导出方式</h2>
      <div>
        <div>
          <label class="imds-radio is-medium has-text-weight-bold">
            <input type="radio" name="export-method" value="all" checked="">
            <span>全部导出</span>
          </label>
          <span class="imds-help-text imds-ml-7">导出所有助手定义。</span>
        </div>
        <div>
          <label class="imds-radio is-medium has-text-weight-bold">
            <input type="radio" name="export-method" value="select">
            <span>选择任意助手定义并导出</span>
          </label>
          <span class="imds-help-text imds-ml-7">导出从列表中选择的助手定义。</span>
        </div>
      </div>
      <button type="button" id="export-action-button" class="imds-button is-normal is-primary imds-mt-7" style="min-width: 8em;">
        导出
      </button>
    </section>
  </main>
</div>
```

## 实现注意事项

- 步骤的切换（`is-active` 的切换、显示区块的切换）通过 JavaScript 控制
- 相当于 `${示例}` 的部分（数据种类名称），应替换为实现对象的数据种类名称
- 步骤2 的表格・搜索・分页直接沿用 `imds-list-page.md` 的列表画面模式（为避免重复，详情请参阅列表画面模板）
- 导出对象的复选框列，在数据获取负荷较低时也放置在树侧并联动。负荷较高时仅放置在表格侧
- 由于与导入画面构成配对，页头的 `imds-header-nav` 菜单中通常包含到导入画面・列表画面的入口
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-layout-footer` / `pgstyle-table-wrapper` / `pgstyle-toolbar` **不是**按功能替换的占位符，而是固定类名。生成时也不要修改类名（以 `imds-` 开头的标准类同样不修改）
- 本模板仅包含 HTML 部分，因此请在 `<imart type="head">` 的 `<style>` 中定义以下布局控制用样式（仅列出本文件使用的类）

  ```css
  /* 布局控制用样式 */
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
  .pgstyle-toolbar > .imds-input-group {
    max-width: 30em;
    flex: 1 0 20em;
  }
  .pgstyle-layout-footer {
    flex: 0 0 auto;
    display: flex;
    justify-content: left;
    gap: 2em;
  }
  ```

- 此外，`<imart type="head">` 中还必须加载 `im_design_system/theme/css/theme-conditional-layout.css`（控制各主题不同的内容显示区域高度・宽度的 CSS）。缺少该文件时，`.imds-container` 的高度无法确定，`pgstyle-layout-content` 的 `flex: 1 0 0` 失去伸展目标，内容区域会被压缩为高度 0。

  ```html
  <!-- 控制各主题不同的内容显示区域高度・宽度的 CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  ```
