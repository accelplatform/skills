# Header

## 基本信息

Header 是用于显示页面上部区域的部件。
用户可以通过此区域进行页面跳转、参考页面信息、对页面进行控制。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-header--documentation
- 基础类: imds-header

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-header | header 元素 | header 容器 | 必须 |
| imds-header-back-button | div 元素 | 返回按钮区域 | 可选 |
| imds-header-icon | div 元素 | 图标区域 | 可选 |
| imds-header-nav | div 元素 | 带下拉菜单的导航 | 可选 |
| imds-header-title | div 元素 | 标题区域（h1 + p） | 必须 |
| imds-header-additional | div 元素 | 装饰标签等附加信息区域 | 可选 |
| imds-header-actions | div 元素 | 操作按钮区域 | 可选 |
| imds-header-reload-button | div 元素 | 重新加载按钮区域 | 可选 |
| imds-icon-wrapper | span 元素 | 图标的外层包装器 | 可选 |

## HTML 代码片段

### 基本 header

```html
<header class="imds-header">
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p>副标题</p>
    <h1>页面名</h1>
  </div>
</header>
```

以下仅显示与基本 header 的差异部分。

## 变体

变体显示与「基本 header（图标 + 副标题 + 标题）」的差异。
「无副标题」「省略图标（仅标题）」是 uiux-share 实际 DOM（`Title Only` 故事等）中存在的正式变体，其本身并非不推荐。但本技能的 `SKILL.md` 另有「header 首位必须放置 `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` 之一」的运用规则，JSSP 项目的业务页面以该规则为准（详情请参阅各变体的注释）。

### icon（图标种类的变更）

变更 `imds-header-icon` 中的图标类。也可以使用 Font-Awesome 6 的图标。
请选择符合页面内容的图标（列表 → `fa-clipboard-list`、盘点 → `fa-warehouse`、设置 → `fa-gear` 等）。

```html
<span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
<span class="imds-icon is-medium"><i class="imds-iconfont imds-app-accel-studio"></i></span>
<span class="imds-icon is-medium"><i class="imds-iconfont imds-app-logic-designer"></i></span>
<span class="imds-icon is-medium"><i class="fa-regular fa-file"></i></span>
```

### backItemExists（返回按钮：编辑/详情页等）

在详情页/编辑页等需要返回列表引导的页面中，放置 `imds-header-back-button`。`imds-header-back-button` **可与**图标区域（`imds-header-icon` 或 `imds-header-nav`）**同时使用**，不得因放置了 back-button 而删除图标区域（两者并非互斥。有意省略图标的页面的例外，请参阅「仅标题」变体的注释）。

```html
<header class="imds-header">
  <div class="imds-header-back-button">
    <button type="button" class="imds-button is-ghost is-large">
      <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
    </button>
  </div>
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title"><p>功能（产品）名</p><h1>页面名</h1></div>
</header>
```

### reloadItemExists（重新加载按钮：仪表盘等）

`imds-header-reload-button` **仅在需要重新加载整个页面的页面中**放置。如果目的仅是重新获取列表数据，请将按钮放在内容侧（列表表格周边），而不是 header 中。放在 header 中的重新加载按钮确定是重新加载整个页面，因此 `title` 必须使用「重新加载页面」。放置位置在 `imds-header-actions` **之后**（header 的最末尾）。

```html
<div class="imds-header-reload-button">
  <button type="button" class="imds-button is-ghost is-large" title="重新加载页面">
    <span class="imds-icon is-small"><i class="fa-solid fa-rotate-right"></i></span>
  </button>
</div>
```

### 无副标题

省略 `imds-header-title` 内的 `<p>`，仅放置 `<h1>`。这是 uiux-share 中也存在的正规变体，其本身并非不推荐。
如果已定义 `$subTitle` 绑定，基本形式是将其作为 `<p>` 输出，但在没有相当于副标题信息的页面中可以使用此变体。

```html
<div class="imds-header-title"><h1>页面名</h1></div>
```

### 仅标题（Title Only / 省略图标）

`imds-header-icon` / `imds-header-back-button` / `imds-header-nav` 均不放置，仅有 `imds-header-title` 的简洁构成。这是 uiux-share 的 `Title Only` 故事中存在的正规变体。

```html
<header class="imds-header">
  <div class="imds-header-title">
    <p>功能（产品）名</p>
    <h1>页面名</h1>
  </div>
</header>
```

> **注释（与 SKILL.md 的一致性）**: 本技能的 `SKILL.md` 作为面向 JSSP 业务页面的运用规则，规定「header 首位必须放置 `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` 之一」（不属于本文件的负责范围・不可变更）。作为组件单体，仅标题的构成也是正当的，但在生成本项目的业务页面时，请遵循 `SKILL.md` 的运用规则，放置上述 3 者之一。

## 组合示例

### 与 Popover 组合

代替 `imds-header-icon` 放置 `imds-popover` + `imds-header-nav`。

```html
<header class="imds-header">
  <div class="imds-popover is-left imds-header-nav">
    <button
      type="button"
      class="imds-button is-ghost is-large"
      aria-haspopup="true"
      aria-controls="sample-popover-1">
      <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
      <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
    </button>
    <div id="sample-popover-1" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a><span>相关页面-1</span></a></li>
            <li><a><span>相关页面-2</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="imds-header-title">
    <p>副标题</p>
    <h1>页面名</h1>
  </div>
</header>
```

### 与 Tag 组合

在 `imds-header-title` 之后放置 `imds-header-additional`。

```html
<div class="imds-header-additional">
  <span class="imds-tag is-green"><span>Tag</span></span>
</div>
```

### 与 Button 组合

在 `imds-header-title` 之后放置 `imds-header-actions`。
可并列多个按钮。

```html
<div class="imds-header-actions">
  <button class="imds-button is-primary" type="button">
    <span class="imds-icon"><i class="fa-solid fa-gear"></i></span>
    <span>日志输出目标设置</span>
  </button>
  <button class="imds-button is-outlined" type="button">
    <span class="imds-icon"><i class="imds-iconfont imds-file-export"></i></span>
    <span class="imds-button-text">导出</span>
  </button>
</div>
```

⚠️ **不要在 `imds-header-actions` 中放置「新建」「添加」「登记」等数据操作按钮**（UI 团队的设计规则）。
允许放在页眉中的仅限于**「设置」「导出」「日志输出目标设置」等不会增减列表数据本身的页面级元操作**。
「新建」「添加」「批量导入」等会增减、编辑列表业务数据的操作，必须**放在列表表格的正上方并右对齐**（示例请参考 `assets/imds-list-page.md`）。

## 实现注意事项

- **在本项目（JSSP 业务页面）中，基本做法是遵循 `SKILL.md` 的运用规则，在 header 的首位元素放置 `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` 之一**（`SKILL.md` 侧的既有规则）：
  - 一般页面 → `imds-header-icon`（表示页面内容的 Font Awesome 图标）
  - 编辑页/详情页等需要返回引导 → `imds-header-back-button`（可与 `imds-header-icon` / `imds-header-nav` 同时使用。即使放置了 back-button 也不删除图标区域。请参阅「backItemExists」变体）
  - 需要相关页面切换菜单 → `imds-header-nav`（与 Popover 组合。与 `imds-header-icon` 互斥）

  另外，作为组件单体，三者都不放置、仅有 `imds-header-title` 的「仅标题」构成也作为 uiux-share 上的正规模式存在（详情请参阅「仅标题（Title Only / 省略图标）」变体）。请根据页面内容从 Font Awesome 6 中选择图标种类（`fa-clipboard-list`、`fa-warehouse`、`fa-box`、`fa-location-dot`、`fa-chart-column`、`fa-gear` 等）。

- **`imds-header-title` 的内部基本形式为「`<p>副标题</p>` + `<h1>标题</h1>`」的两段式结构**（「无副标题」变体的情况下省略 `<p>`）。请按照参考基础代码片段，在上段 `<p>` 放置应用名/模块名（例如「公司物品借用系统」「物品主数据」），在下段 `<h1>` 放置页面名（例如「保管位置管理」「审批列表」）。两者均应通过函数容器的 `$subTitle` / `$title` 绑定，使用 `<imart type="string" value=$subTitle ...>` 输出（不直接在 HTML 中书写）。

- **`<header class="imds-header">` 必须放置在 `<main>` 的外部**。imds 主题的 CSS 以放置在 `<div class="imds-container">` 直接下方的 `<header>` 为前提应用样式（图标位置、边距等），放在 `<main>` 内部会导致布局错乱，发生 `imds-header-icon` 图标不显示等故障。**根 `<div>` 必须整合为一个，不要在内部再嵌套一层 `imds-container` 的 `<div>` 作为中间包装层**（根据 `.agents/requirements/jssp-presentation-page/AGENTS.md` 的规约，intra-mart 的主题功能会自动用 `<div id="imui-container">` 包裹页面内容，因此根标签不附加 id，只附加 `imds-container` 类）。
  ```html
  <!-- OK -->
  <div class="imds-container">
    <header class="imds-header">...</header>   <!-- 在 main 外部 -->
    <main>
      ...
    </main>
  </div>

  <!-- NG（中间包装层：将 imds-container 的 div 又嵌套了一层） -->
  <div>
    <div class="imds-container">
      <header class="imds-header">...</header>
      <main>...</main>
    </div>
  </div>
  ```
  ※ `.agents/requirements/jssp-accessibility/AGENTS.md` 中「不得在展示页面添加 `<header>`」的含义是避免与平台的全局 header 重复，imds 的 `<header class="imds-header">`（页内 header）不在此规则范围内。
- 不得使用 `imds-page-header` / `imds-page-header-title` / `imds-page-header-actions` 等类名来表示「页面 header」（这些是参考文件中不存在的虚构类。CSS 不会生效，会破坏布局）。正确的类名是 `imds-header` / `imds-header-title` / `imds-header-actions`。
- header 内的放置顺序：`imds-header-back-button` → `imds-header-icon` / `imds-header-nav` → `imds-header-title` → `imds-header-additional` → `imds-header-actions` → `imds-header-reload-button`（**`imds-header-actions` 在 `imds-header-reload-button` 之前**）
- 图标区域的互斥关系因元素组合而异。不要笼统地视为「三者均互斥」。
  - `imds-header-icon` 与 `imds-header-nav` 互斥（不同时放置。图标区域二选一）
  - `imds-header-back-button` **可与** `imds-header-icon` / `imds-header-nav` **同时使用**（即使放置了 back-button 也不删除图标区域。详情请参阅「backItemExists」变体）
  - 本参考不涉及 `imds-header-back-button` 与 `imds-header-nav` 同时使用的模式。按以往做法视为互斥
- 下拉菜单的 `id` / `aria-controls` 须替换为唯一值（`sample-popover-N` 为占位符。根据功能取唯一的名称，因不是输入元素，不加冒号）
- 下拉菜单的开关需通过 JavaScript 控制
