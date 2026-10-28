---
paths:
  - "src/main/jssp/**/*.html"
---

# 固定页眉布局（common-parts）

## 基本信息

用于将整个画面构成为「页眉・页脚始终固定显示，仅内容区域纵向滚动」的根容器・`<main>`・滚动区域的 CSS 设计模式。
作为列表画面・表单画面・向导画面（导出/导入）等整页模板的基础使用。

> **本项目中的区分使用:** 列表画面模板（`assets/imds-list-page.md`）・表单画面模板（`assets/imds-form-page.md`）不使用本文件这种按功能划分的占位 prefix（`cc-app-*` 等），而是使用固定类名 `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-layout-footer`。由于 `height` 使用 `100%` 而非 `100vh`，必须在 `<imart type="head">` 中加载 `im_design_system/theme/css/theme-conditional-layout.css`（缺少时 `.imds-container` 的高度无法确定，内容区域会被压缩为高度 0）。新画面应遵循 `assets/imds-list-page.md` / `assets/imds-form-page.md` 的指示。本文件的 `cc-app-*` prefix 方式保留作为参考，用于制作这些模板未涵盖的特殊布局（需要应用本模式的独立画面）。

- 提取来源: `uiux-share` 各 `layout/*.md` 的 CSS 定义（`layout/フォーム画面.md`「CSS」等）
- 对应组件: `imds-container` / `imds-header` / `imds-scrollbar`

## 整体结构

```
div.imds-container                    # 根 div（会被放置在 intra-mart 主题的 imui-container 内部，因此不附加 id，也不夹带中间包装层）
├── header.imds-header                # 固定显示（grid 第1行）
└── main（纵向 flex 容器）
    ├── section（滚动区域。附加 imds-scrollbar，flex:1 0 0; overflow:auto）
    └── div（页脚。固定显示，flex:0 0 auto。位于滚动区域之外）
```

## 根 div 统一为一个（不要制造中间包装层）

根据 `.github/instructions/jssp-presentation-page.instructions.md` 的规约，展示页面的根标签不应附加 id（因为 intra-mart 的主题功能会自动用 `<div id="imui-container">` 包裹页面内容，若在画面侧再叠加一层 id，会形成多余的双重包装）。
另一方面，`imds-container` 是 imds 主题的 CSS 所依赖的类，同样应附加在相当于画面根节点的元素上。
**不增加中间包装层，直接在根 `<div>` 上附加 `class="imds-container ..."` 即可满足这两点要求。** 无需在 `<div>` 内部再嵌套一层 `<div class="imds-container">`。

```html
<!-- ✅ OK：直接在根 div 上附加 imds-container 类，不制造中间包装层 -->
<div class="imds-container cc-app-layout-container">
  <header class="imds-header">...</header>
  <main class="cc-app-layout-main">
    ...
  </main>
</div>

<!-- ❌ NG：将 imds-container 的 div 又嵌套了一层（多余的中间包装层） -->
<div>
  <div class="imds-container cc-app-layout-container">
    <header class="imds-header">...</header>
    <main class="cc-app-layout-main">...</main>
  </div>
</div>
```

`header` / `main` 并列放置在 `imds-container` 的**正下方**（不将 `header` 放在 `main` 内部这一既有规则不变）。

## CSS 设计

### 容器（2 行网格）

通过附加到 `imds-container` 的自定义类（示例中为 `cc-app-layout-container`。**类名按功能替换**，参见后述「占位 prefix」）定义 2 行网格。

```css
.cc-app-layout-container {
  height: 100vh;                              /* ★ 推荐使用 100vh 而非 100%（后述） */
  display: grid;
  grid-template-rows: 5rem minmax(0, 1fr);     /* 第1行: 页眉高度固定 / 第2行: 剩余全部 */
  grid-template-columns: 100%;
}
.cc-app-layout-container > .imds-header {
  grid-row: 1 / 2;
}
```

- 第 2 行应使用 **`minmax(0, 1fr)`** 而非 `1fr`。仅使用 `1fr` 时，内部滚动区域无法通过 `flex:1 0 0` 确定高度，网格行本身会随内容量伸长，最终导致整个画面滚动，页面内滚动失效
- `height` **推荐使用 `100vh` 而非 `100%`**。当平台侧主题（`<html>`/`<body>` 等本技能集无法控制的外层元素）不具备高度 100% 的链条时，`100%` 会回退为相当于 `auto`，导致后述滚动区域被压缩为高度 0 而不显示，实现时实际出现过该问题。`100vh` 以视口为基准，不依赖祖先元素的高度设置，能够可靠地解析

### main（纵向 flex 容器）

```css
.cc-app-layout-main {
  grid-row: 2 / 3;
  display: flex;
  flex-direction: column;
  height: 100%;    /* 父元素（网格第2行）已通过 minmax(0,1fr) 确定高度，因此此处使用 100% 没有问题 */
}
```

`<main>` 自身是放置在 `grid-template-rows` 第 2 行的网格项，父网格容器已拥有以 `height: 100vh` 为起点确定的高度，因此 `height: 100%` 能被正确解析。

### 滚动区域

将附加了 `imds-scrollbar`（使滚动条外观变细的工具类。详情见 `reference/imds-helper-scrollbar.md`）的元素作为实际的滚动区域。

```css
.cc-app-step-panel {
  flex: 1 0 0;
  overflow: auto;
}
```

```html
<section class="cc-app-step-panel imds-py-6 imds-px-8 imds-scrollbar">
  <!-- 需要滚动的内容 -->
</section>
```

⚠️ **反模式: 不要在 `main` 自身上附加 `overflow: auto`**。否则页脚会一起滚动，无法满足 L-5（页脚固定）。`overflow: auto` 只附加在需要滚动的子元素（附加了 `imds-scrollbar` 的元素）上。

⚠️ **反模式: 不要在滚动区域中混入 `flex: 1 0 0` 以外的写法**。即使想将 `flex-basis` 设为 `auto`，只要 `main` 和 `imds-container` 的高度已按上述方式确定，保持 `flex: 1 0 0`（`flex-basis: 0`）即可正常工作（`0` 仅在祖先高度未确定时才会成为问题）。

### 页脚（不参与滚动）

操作按钮组放置在滚动区域的**外侧**・`<main>` 的**正下方**，并通过 `flex: 0 0 auto` 设为固定尺寸。

```css
.cc-app-footer {
  flex: 0 0 auto;
}
```

```html
<main class="cc-app-layout-main">
  <section class="cc-app-step-panel imds-py-6 imds-px-8 imds-scrollbar">...</section>
  <div class="cc-app-footer imds-py-2 imds-px-8 imds-border-t-1">
    <button type="button" class="imds-button is-primary">注册</button>
  </div>
</main>
```

## 占位 prefix 的替换

本文件中的 CSS 类名（`cc-app-layout-container` / `cc-app-layout-main` / `cc-app-step-panel` / `cc-app-footer` 等）是示例用的占位符。**生成时应替换为与功能名相应的 prefix**（例: 商品管理画面则为 `product-layout-container` 等）。

| 类别 | 是否替换 |
|---|---|
| `cc-app-*` 这类占位 prefix 的自定义类 | ✅ 替换（改为各功能固有的 prefix） |
| 以 `imds-*` 开头的 imds 标准类（`imds-container` / `imds-header` / `imds-scrollbar` / `imds-py-*` / `imds-px-*` / `imds-border-t-1` 等） | ❌ 不替换。imds 的样式是针对这些类名定义的，改名后边框・间距・滚动条等样式将完全失效 |

```html
<!-- ✅ OK：只替换自定义类为按功能划分的 prefix，imds- 类保持不变 -->
<div class="imds-container product-layout-container">
  <main class="product-layout-main">
    <section class="product-step-panel imds-py-6 imds-px-8 imds-scrollbar">…</section>
  </main>
</div>

<!-- ❌ NG：替换过度，把 imds 标准类也一并改写了 -->
<div class="product-container product-layout-container">
  <main class="product-layout-main">
    <section class="product-step-panel product-py-6 product-scrollbar">…</section>
  </main>
</div>
```

最终确认生成物中没有原样残留 `cc-app-*` 或 `sample-*` 这类占位 prefix。

## 实现后的确认（在浏览器中目视确认）

不仅要实现 CSS・DOM，还应在浏览器中实际打开画面确认以下内容（自动检查无法保证）。

1. 纵向滚动画面时，页眉（以及有固定页脚时的页脚）不移动并始终显示
2. 仅内容区域滚动，浏览器窗口本身不滚动（没有出现双重滚动）
3. 内容区域的滚动条显示为细样式（`imds-scrollbar` 的 `scrollbar-width: thin` 生效）

尤其应在缩小窗口高度的状态下确认 1〜2（高度充裕时，固定/非固定的差异不会体现在外观上）。

## 实现注意事项

- 根 `<div class="imds-container ...">` 不附加 id，整合为一个元素，不要在内部再嵌套 `imds-container` 形成中间包装层
- `grid-template-rows` 的第 2 行必须使用 `minmax(0, 1fr)`（仅 `1fr` 无法确定滚动区域的高度）
- 在本文件的 `cc-app-*` 方式中，附加到 `imds-container` 的高度推荐使用 `height: 100vh`（`height: 100%` 依赖祖先元素的高度解析，在某些环境下实际出现过滚动区域被压缩为高度 0 的问题）。使用 `pgstyle-layout-*` 的模板通过组合 `height: 100%` 与加载 `theme-conditional-layout.css` 来确定高度
- `overflow: auto` 不附加在 `main` 自身上，只附加在附加了 `imds-scrollbar` 的滚动对象子元素上
- 页脚（操作按钮组）放置在 `<main>` 正下方・滚动区域之外，并通过 `flex: 0 0 auto` 固定
- 自定义类的占位 prefix（`cc-app-*` 等）按功能名替换，但以 `imds-` 开头的标准类保持名称不变直接使用
- 若布局简单（无需导航或滚动的极小画面等）导致本模式过度，可以不在 `imds-container` 上直接构建 `height: 100vh` 类网格，而将 `<main>` 以下设为普通的纵向堆叠（页面整体滚动）。但页脚固定・局部滚动属于需求的画面应使用本模式
