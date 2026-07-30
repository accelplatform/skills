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
| imds-header-icon | div 元素 | 图标区域 | 可选 |
| imds-header-title | div 元素 | 标题区域（h1 + p） | 必须 |
| imds-header-back-button | div 元素 | 返回按钮区域 | 可选 |
| imds-header-reload-button | div 元素 | 重新加载按钮区域 | 可选 |
| imds-header-nav | div 元素 | 带下拉菜单的导航 | 可选 |
| imds-header-additional | div 元素 | 装饰标签等附加信息区域 | 可选 |
| imds-header-actions | div 元素 | 操作按钮区域 | 可选 |
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
按推荐度从高到低排列，请从上往下考虑。后半部分的「不推荐」项是从基本结构中**省略**元素的模式，业务页面原则上不应采用。

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

在详情页/编辑页等需要返回列表引导的页面中，**代替** `imds-header-icon` 放置 `imds-header-back-button`（两者互斥，不能同时存在）。

```html
<div class="imds-header-back-button">
  <button type="button" class="imds-button is-ghost is-large">
    <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
  </button>
</div>
```

### reloadItemExists（重新加载按钮：仪表盘等）

在 `imds-header-title` **之后**放置 `imds-header-reload-button`（可与 `imds-header-icon` 同时使用）。

```html
<div class="imds-header-reload-button">
  <button type="button" class="imds-button is-ghost is-large">
    <span class="imds-icon is-small"><i class="fa-solid fa-rotate-right"></i></span>
  </button>
</div>
```

### 无副标题（不推荐：业务页面应避免使用）

⚠️ 一般业务页面不推荐使用。仅在设计有特殊要求时采用。

省略 `imds-header-title` 内的 `<p>`。没有副标题时 header 看起来空泛，不满足 imds 主题设计。
如果已定义 `$subTitle` 绑定，必须在 `<p>` 中输出。

```html
<div class="imds-header-title"><h1>页面名</h1></div>
```

### 省略图标（不推荐：业务页面应避免使用）

⚠️ 一般业务页面不推荐使用。`imds-header-icon` / `imds-header-back-button` / `imds-header-nav` 三者都不放置的构成，header 左端会留空，破坏 imds 的 header 设计。
仅限极其有限的特殊用途（外部嵌入/打印视图等）采用。

```html
<header class="imds-header">
  <div class="imds-header-title">
    <p>副标题</p>
    <h1>页面名</h1>
  </div>
</header>
```

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
      aria-controls="imds-popover-:r1:">
      <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
      <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
    </button>
    <div id="imds-popover-:r1:" role="menu" class="imds-popover-menu">
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

- **header 的首位元素必须放置 `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` 之一**。它们是互斥的，因此请根据页面情况必须附加其中一个：
  - 一般页面 → `imds-header-icon`（表示页面内容的 Font Awesome 图标）
  - 编辑页/详情页等需要返回引导 → `imds-header-back-button`
  - 需要相关页面切换菜单 → `imds-header-nav`（与 Popover 组合）

  如果一个都不放置，header 的标题部分将变为仅左对齐的文本，破坏 imds 的 header 设计（实际上仅实现 `imds-header-title` 的情况下「图标不显示」的故障频繁发生）。请根据页面内容从 Font Awesome 6 中选择图标种类（`fa-clipboard-list`、`fa-warehouse`、`fa-box`、`fa-location-dot`、`fa-chart-column`、`fa-gear` 等）。

- **`imds-header-title` 的内部必须采用「`<p>副标题</p>` + `<h1>标题</h1>`」的两段式结构**（仅在「无副标题」变体的情况下可省略 `<p>`）。仅在 `<h1>` 中直接写页面名的实现是错误的。请按照参考基础代码片段，在上段 `<p>` 放置应用名/模块名（例如「公司物品借用系统」「物品主数据」），在下段 `<h1>` 放置页面名（例如「保管位置管理」「审批列表」），两者均应通过函数容器的 `$subTitle` / `$title` 绑定，使用 `<imart type="string" value=$subTitle ...>` 输出（不直接在 HTML 中书写）。

- **`<header class="imds-header">` 必须放置在 `<main>` 的外部**。imds 主题的 CSS 以放置在 `<div class="imds-container">` 直接下方的 `<header>` 为前提应用样式（图标位置、边距等），放在 `<main>` 内部会导致布局错乱，发生 `imds-header-icon` 图标不显示等故障。
  ```html
  <!-- OK -->
  <div id="container">
    <div class="imds-container">
      <header class="imds-header">...</header>   <!-- 在 main 外部 -->
      <main>
        ...
      </main>
    </div>
  </div>
  ```
  ※ `jssp-accessibility.md` 中「不得在展示页面添加 `<header>`」的含义是避免与平台的全局 header 重复，imds 的 `<header class="imds-header">`（页内 header）不在此规则范围内。
- 不得使用 `imds-page-header` / `imds-page-header-title` / `imds-page-header-actions` 等类名来表示「页面 header」（这些是参考文件中不存在的虚构类。CSS 不会生效，会破坏布局）。正确的类名是 `imds-header` / `imds-header-title` / `imds-header-actions`。
- header 内的放置顺序：`imds-header-back-button` / `imds-header-icon` / `imds-header-nav` → `imds-header-title` → `imds-header-additional` → `imds-header-reload-button` → `imds-header-actions`
- `imds-header-icon`、`imds-header-back-button`、`imds-header-nav` 互斥使用（不可同时放置）
- 下拉菜单的 `id` / `aria-controls` 须替换为唯一值（`:r1:` 为占位符）
- 下拉菜单的开关需通过 JavaScript 控制
