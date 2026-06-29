---
name: jssp-imds-theme
description: 生成符合 intra-mart Design System（imds）规范的展示页面 HTML 组件。在使用表格、按钮、表单、对话框、复选框、单选按钮、下拉选择、文本框、标签页、手风琴、分页等 UI 部件时必须使用。不得凭记忆或推测书写 imds 的类名，必须参考本技能的 reference。当提及编写 HTML、创建界面外观、放置 UI 组件时使用。
---

# imds 规范 HTML 代码生成技能

## 概述

用于创建符合 intra-mart Design System 规范的展示页面 HTML 标签部分的技能集。

## 使用方法

生成 HTML 时，按以下步骤进行：

1. **先确认整页模板**（列表页面使用 `assets/imds-list-page.md`，表单页面使用 `assets/imds-form-page.md`）
   - `<header class="imds-header">` 的放置位置及其与 `<main>` 的关系仅在此处说明
2. 根据用户需求确定要使用的 UI 组件
3. 读取 `reference/` 目录下对应组件的参考文件
4. 以参考文件中的 HTML 代码片段为基础进行实现
5. 根据需要添加尺寸或样式类
6. 对生成的文件使用 `validate-imds.js` 执行结构验证（详见后述）
7. 若有错误则修正，反复执行直到 PASS

## HTML 生成时的重要注意事项

### 必须参考参考文件

生成任何 HTML 组件前，必须先读取对应的参考文件。
不得凭记忆或推测使用类名，须使用参考文件中记载的精确 HTML 代码片段。

### 以「整页模板」为起点（必须参考 assets）

`reference/` 目录下仅为单个组件的 HTML 代码片段，**没有记载整页的组装方法**。
特别是与页面结构相关的必备信息（如 `<header class="imds-header">` 的放置位置等），仅在 `assets/` 目录下的模板中存在。

| 用途 | 应参考的 assets |
|------|------------------|
| 列表页面（列表 + 操作按钮） | `assets/imds-list-page.md` |
| 输入表单页面（CRUD） | `assets/imds-form-page.md` |

新建页面时，请先阅读这两个文件之一，以页面骨架为基础后再参考各个组件的 reference。

### `<header class="imds-header">` 中的图标必填

`<header class="imds-header">` 中**不允许**仅放置 `imds-header-title`。
**必须在开头放置 `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` 中的一个**（参考文件中规定为互斥）。省略此项会导致 header 仅显示文本，与 imds 设计风格不符（页面显示效果会破坏）。

| 用途 | 放置的元素 | 图标示例 |
|------|------------|------------|
| 列表/登记/编辑等常规页面 | `imds-header-icon` + Font Awesome | 符合用途的图标（`fa-clipboard-list` / `fa-warehouse` / `fa-box` / `fa-location-dot` / `fa-chart-column` / `fa-gear` 等） |
| 详情/编辑等需要返回引导的页面 | `imds-header-back-button` | （作为图标替代） |
| 需要相关页面切换菜单的页面 | `imds-header-nav`（与 Popover 配合） | （作为图标替代） |

```html
<!-- 标准模式 -->
<header class="imds-header">
  <div class="imds-header-icon">                       <!-- ★ 必填 -->
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="fa-solid fa-XXX"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>     <!-- ★ 副标题（必填） -->
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>     <!-- ★ 标题（必填） -->
  </div>
</header>
```

### `imds-header-title` 的「标题 + 副标题」两段式结构是必须的

`imds-header-title` 内部必须采用**「`<p>副标题</p>` + `<h1>标题</h1>`」的两段式结构**。
不要仅用 `<h1>` 单独直接写页面名（这样不符合 imds 主题的 header 设计，视觉上会显得空泛）。

- 副标题：表示应用名/模块名等上位上下文的短字符串（例如「公司物品借用系统」「物品主数据」）
- 标题：页面名（例如「审批列表」「保管位置管理」）
- 两者均应在函数容器中使用 `let $title = '...'` / `let $subTitle = '...'` 绑定，在 HTML 中通过 `<imart type="string" value=$title escapeXml="true" escapeJs="false"></imart>` 输出（不要直接写死）
- 在详情页/编辑页等通过 `aria-labelledby="page-title"` 引用 `<h1>` 时，请保留 id，如 `<h1 id="page-title">`

### `<header class="imds-header">` 的放置位置（重要）

`<header class="imds-header">` 必须放置在 **`<main>` 外部**，并位于 `<div class="imds-container">` 的**直接下方**。imds 主题的 CSS 以此位置为前提应用样式，放在 `<main>` 内部会导致布局错乱（图标消失等）。

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

<!-- NG -->
<div id="container">
  <div class="imds-container">
    <main>
      <header class="imds-header">...</header> <!-- 在 main 内部时 CSS 不生效 -->
      ...
    </main>
  </div>
</div>
```

另外，`jssp-accessibility.instructions.md` 中所写「不得在展示页面添加 `<header>`」的含义是**避免与平台的全局 `<header>` 重复**，imds 的 `<header class="imds-header">`（页内 header）不在此规则范围内。

### 不要在 `imds-header-actions` 中放置业务数据的操作按钮

**禁止**在 `<header class="imds-header">` 右侧（`imds-header-actions`）**放置「新建」「添加」「登记」等数据操作按钮**（UI 团队的设计规则）。
页眉的主要目的是展示页面标题，并非排列业务操作的位置。数据操作按钮应**放置在列表表格的正上方并右对齐**。

```html
<!-- ❌ NG：将「新建」按钮放在页眉的 imds-header-actions 中 -->
<header class="imds-header">
  <div class="imds-header-icon">...</div>
  <div class="imds-header-title">...</div>
  <div class="imds-header-actions">
    <button type="button" class="imds-button is-primary" id="add-button">
      <span class="imds-button-text">新建</span>
    </button>
  </div>
</header>

<!-- ✅ OK：放在列表表格正上方的右侧 -->
<section class="imds-py-3 imds-px-4" aria-label="○○列表">
  <div style="display:flex; justify-content:flex-end; margin-bottom: 0.75em;">
    <button type="button" class="imds-button is-primary" id="add-button">
      <span class="imds-icon"><i class="fa-solid fa-plus"></i></span>
      <span class="imds-button-text">新建</span>
    </button>
  </div>
  <div class="imds-table ...">...</div>
</section>
```

| 允许放置在页眉右侧（`imds-header-actions`） | 放在列表表格正上方（不要放在页眉中） |
|---|---|
| 面向整个页面的元操作（例：「设置」「导出」「日志输出对象设置」等不会增减列表本身数据的操作） | 「新建」「添加」「批量导入」等增减、编辑列表业务数据的操作 |

如果同时配置搜索栏，请遵循 `assets/imds-list-page.md` 的「操作区域」模式（在 `button-area` 中将搜索栏 + 新建按钮横向排列）。

### 不要使用虚构类（特别是 `imds-page-header` 系列）

不得擅自书写参考文件中不存在的 `imds-*` 类名。CSS 不会生效，页面会破坏。
常见的错误模式：

| ❌ 虚构的类 | ✅ 正确的类（参考文件中记载） |
|---|---|
| `imds-page-header` | `imds-header` |
| `imds-page-header-title` | `imds-header-title` |
| `imds-page-header-actions` | `imds-header-actions` |
| `imds-section-title` | 替换为 `<h2>` 等普通元素 |
| `imds-dialog-body` | `imds-dialog-content` |
| `imds-dialog-overlay` | `imds-dialog-wrapper` |
| `imds-required-mark`（span） | 在 `<span>`/`<label>` 上添加 `imds-required-label-required` 类 |
| `imds-inline-message is-error`（用于字段错误显示） | `<span class="imds-error-text">` |

判断不清时请执行 `validate-imds.js`，确认是否出现 `IMDS-U-001` 警告（详见后述）。

### 表单实现模式（必须参考: `assets/simple-form.md`）

实现输入表单时，必须遵循 `skills/jssp-page-generator/assets/simple-form.md` 的标准模式。
单独并列裸 `imds-field` 是错误的。标准是嵌套结构：**`imds-field-container > imds-field-group > imds-field-group-label + imds-field-group-control > imds-field`**。

```html
<div class="imds-field-container has-accent-color">
  <!-- 1 个输入项 = 1 个 imds-field-group -->
  <div class="imds-field-group is-horizontal imds-w-15">
    <!-- 标签部分（必填/可选标记也在此处添加） -->
    <div class="imds-field-group-label">
      <span class="imds-required-label-required" data-required-label="必填">用户代码</span>
    </div>
    <!-- 输入部分 -->
    <div class="imds-field-group-control">
      <div class="imds-field" for=":userCode:">
        <div class="imds-field-control">
          <input type="text" id=":userCode:" class="imds-textbox" name="userCode" />
        </div>
        <!-- 错误消息放在 imds-field 的直接下方（imds-field-control 的外部） -->
        <span class="imds-error-text" for=":userCode:" id="error-userCode" style="display:none;"></span>
      </div>
    </div>
  </div>
</div>
```

要点：

| 项目 | 正确写法 |
|------|------------|
| 标签元素 | `imds-field-group-label > <span>`（不使用 label 元素。仅当将多个输入合并为一组时，才在内部的 `imds-field` 中放置 `imds-field-label > <label>`） |
| 必填标记 | `<span class="imds-required-label-required" data-required-label="必填">项目名</span>` |
| 可选标记 | `<span class="imds-required-label-optional" data-required-label="可选">项目名</span>` |
| 星号版 | `<span class="imds-required-label-required-asterisk">项目名</span>`（显示 * 而非文字） |
| 标签宽度 | 在 `imds-field-group` 本身添加 `is-horizontal imds-w-15` 等（`imds-w-N` 在参考文件中记载的值为 `15` / `25` / `30` / `150px` / `250px`） |
| 错误显示元素 | 在 `imds-field` 的直接下方放置 `<span class="imds-error-text" for=":xxx:" id="error-xxx" style="display:none;"></span>` |
| 错误显示控制 | 使用 JS 通过 `el.style.display = ''`/`'none'` 切换显示。在 `imds-field` 上添加/移除 `imds-validation-error` 类 |

⚠️ **反模式（不可执行）**：
- 在 `imds-field-label` 上添加宽度类，如 `<div class="imds-field-label imds-w-NN">`（宽度应添加到 `imds-field` 或 `imds-field-group`）
- 使用 `<span class="imds-required-mark">*</span>` 等裸 span 书写星号（CSS 不生效）
- 将 `<div class="imds-inline-message is-error" hidden>` 挪用为字段错误显示（`imds-inline-message` 用于 info 消息）

### 不要删除确认对话框（`imdsConfirm`）的函数定义

各展示页面 `<script>` 中所写的自定义 `function imdsConfirm(...) { ... }` 定义**并非由平台通用处理自动提供**，因此不得删除。重构时若判断「重复了可以删除」并将其删除，该页面的确认对话框将无法工作。

- 前提是每个使用页面都保留相同的函数定义
- 函数体的结构必须与 `reference/imds-csjs-confirm.md` 的代码严格一致

### 对话框的根元素为 `<dialog>`，`<div>` 为辅助选择

实现对话框时**以 HTML5 原生的 `<dialog class="imds-dialog-wrapper">` 为基础**。`<div>` 根作为变体使用（非模态/特殊用途）。原因：

- 通过 `<dialog>` + `showModal()` 可自动获得背景操作禁止 / `::backdrop` / ESC 关闭 / 焦点陷阱
- `<div>` 根需要自行实现这些功能，遗漏将成为 bug 温床
- 详见 `reference/imds-html-dialog.md`
- 在对话框中放置输入表单的复合模式（新建、编辑对话框等）请参考 `reference/imds-html-dialog-form.md`

### 对话框内内容的内边距

`<dialog class="imds-dialog-wrapper">` 中的 `imds-dialog-content` **默认没有 padding**。
直接放置内容（表单/按钮等）会紧贴边缘，影响美观。必须**在内部使用 `<div class="imds-p-4">` 包裹**。

```html
<div class="imds-dialog-content imds-scrollbar">
  <div class="imds-p-4">           <!-- 全方向 padding 1rem。没有这个内容会贴到边缘 -->
    <form>...</form>
    <div>... 按钮区 ...</div>
  </div>
</div>
```

padding 的调整：`imds-p-2`（窄） / `imds-p-4`（标准） / `imds-p-6`（宽）。

### imds-field 的使用

创建带标签的表单元素时，使用 `imds-field` 结构。

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label for="element-id">标签名</label>
  </div>
  <div class="imds-field-control">
    <!-- 在此放置输入元素 -->
  </div>
</div>
```

### 正确使用尺寸类

各组件拥有统一的尺寸类，需要指定尺寸时应积极使用尺寸类。
自定义 CSS 应作为最后手段。

### 理解状态类

各组件根据用途设有状态类，应根据执行的操作类型来使用状态类，而非出于颜色目的。
例如，不得为了使元素变红而使用 `is-danger`，也不应通过 CSS 设置颜色。

### 表格结构注意事项

表格必须使用 `imds-table` 和 `imds-table-inner` 的双层结构实现。

```html
<div class="imds-table" style="width: 100%; height: 100%; max-height: 250px;">
  <div class="imds-table-inner">
    <table>
      <!-- 表格内容 -->
    </table>
  </div>
</div>
```

## 生成后的结构验证（必须执行）

生成或编辑 HTML 后，必须使用以下命令执行 imds 结构验证。

```bash
node {{AGENT_ROOT}}/skills/jssp-imds-theme/scripts/validate-imds.js <目标文件或目录>
```

### 验证规则

`validate-imds.js` 对以下组件的父子关系进行验证。

| 组件 | 主要检查内容 |
|---|---|
| Table | 三层结构：`div.imds-table > div.imds-table-inner > table` |
| Field | 直接父子：`div.imds-field > div.imds-field-label` / `div.imds-field-control` |
| FieldGroup | 直接父子：`div.imds-field-group > div.imds-field-group-label` / `div.imds-field-group-control` |
| Dialog | 嵌套：`div.imds-dialog-wrapper > div.imds-dialog > div.imds-dialog-header` 等 |
| Header | 直接父子：`header.imds-header > div.imds-header-title` 等 |
| Button | `span.imds-button-text` 的父元素必须是 `button.imds-button`；`imds-button` 仅限 `button` 元素 |
| Tabs | `li.imds-tabs-tab` 必须是 `div.imds-tabs` 的后代；`imds-tabs-tab` 仅限 `li` 元素 |
| Pagination | 结构：`nav.imds-pagination > div.imds-pagination-controls > div.imds-pagination-page-number` |
| Accordion | 嵌套：`div.imds-accordion > label.imds-accordion-title > span.imds-accordion-title-inner` 等 |
| CheckboxGroup | 直接父子：`div.imds-checkbox-group > label.imds-checkbox`（仅限组内） |
| RadioGroup | 直接父子：`div.imds-radio-group > label.imds-radio`（仅限组内） |
| FileUpload | 结构：`div.imds-file-upload > div.imds-file-upload-drop-area > p.imds-file-upload-message` |
| Menu | `nav.imds-menu > ul.imds-menu-list`；`imds-menu` 仅限 `nav` 元素 |
| Popover | 三层结构：`div.imds-popover > div.imds-popover-menu > div.imds-popover-content` |
| ProgressBar | 三层结构：`div.imds-progress-bar > div.imds-progress-bar-track > div.imds-progress-bar-fill` |
| Stepper | 三层结构：`div.imds-stepper > ul > li.imds-stepper-step` |
| TextboxControl | 直接父子：`div.imds-textbox-control > input.imds-textbox`（仅限控件内） |
| Tag | `imds-tag` 仅限 `span` 元素 |
| Textarea | `imds-textarea` 仅限 `textarea` 元素（不要与 textbox 混淆） |
| 标签种类 | `imds-select`=`select`、`imds-textbox`=`input`、`imds-textarea`=`textarea`、`imds-checkbox`/`imds-radio`=`label` 等各组件基础类的标签种类 |
| 未定义类检测 | 带 `imds-*` 前缀但在 `reference/`、`{{AGENT_ROOT}}/{{AGENT_RULES}}/` 中均未记载的类，将作为 `IMDS-U-001`（warning）报告。可发现拼写错误/虚构类（例如 `imds-page-header`） |

### 验证结果的处理

- `PASS` → 直接完成
- `ERROR` → 修正指示行的 HTML 结构，反复验证直到 PASS
- `WARN [IMDS-U-001]` → 使用了参考文件中不存在的 `imds-*` 类。很可能是拼写错误或虚构类。请确认参考文件并修正为正确的类名。若有意自定义，请确认相应的 CSS 已生效，并考虑在规约文件中追记

## 实现工作流示例

### 创建登录表单

1. 读取 `textbox.md`，获取用户 ID 输入框的 HTML
2. 从 `textbox.md` 获取密码输入框的 HTML（改为 `type="password"`）
3. 读取 `button.md`，获取登录按钮（`is-primary`）
4. 使用 `imds-field` 为各元素添加适当标签并进行布局
5. 执行 `node {{AGENT_ROOT}}/skills/jssp-imds-theme/scripts/validate-imds.js <生成文件>`，确认 PASS

### 创建数据列表页面

1. 读取 `table.md`，获取基本表格结构
2. 读取 `button.md`，放置新建按钮（`is-primary`）和编辑按钮（`is-outlined`）
3. 根据需要读取 `imds-html-dialog.md`，实现确认对话框（如果是包含输入表单的对话框，请使用 `imds-html-dialog-form.md`）
4. 执行 `node {{AGENT_ROOT}}/skills/jssp-imds-theme/scripts/validate-imds.js <生成文件>`，确认 PASS

## 故障排除

### CSS 类未正常工作时

- 重新检查参考文件中的 CSS 类表格
- 检查是否有拼写错误（特别是 `imds-` 前缀）
- 确认是否正确使用了可组合的类

### 找不到 HTML 代码片段时

- 重新读取参考文件
- 从类似的代码片段进行适当自定义
- 结合多个参考文件进行实现
