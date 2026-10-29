---
paths:
  - "src/main/jssp/**/*.html"
---

# 检索布局（common-parts）

## 基本信息

附属于一览表、确认表格的检索部件／检索区域的既定模式集。
检索 UX 根据是「服务器端检索」还是「客户端筛选（实时筛选）」，以及检索条件的复杂程度和布局位置（上部／右侧）区分使用。

- 来源: `uiux-share/common-parts/検索レイアウト.md`
- **① 上部・检索部件（关键字＋详细检索 Popover）**: 以关键字检索为基础，通过 Popover 也可指定复合条件。通过检索按钮或 Enter 执行（面向服务器端检索）。
- **② 右侧・检索区域**: 始终显示检索栏，可一边查看结果一边指定复合条件。适用于列数较少、表格右侧有余地的情况。
- **③ 上部・筛选（实时筛选）**: 响应输入即时进行客户端筛选。无检索按钮。使用 `input[type=search]` 的清除按钮。最适合导入确认表格、小规模一览的筛选。
- 用于一览的检索（①详细检索 / ②右侧区域 / ③筛选）、导入确认表格的筛选（③筛选）、申请＋表格等带有一览检索的情况。

## 构成组件

| 使用的基础组件 | 对应 reference |
|---|---|
| TextboxControl（`imds-textbox-control`） | [imds-html-textbox-control.md](imds-html-textbox-control.md) |
| Textbox（`imds-textbox`） | [imds-html-textbox.md](imds-html-textbox.md) |
| InputGroup（`imds-input-group`） | [imds-html-input-group.md](imds-html-input-group.md) |
| Popover（`imds-popover`） | [imds-html-popover.md](imds-html-popover.md) |
| Button（`imds-button`） | [imds-html-button.md](imds-html-button.md) |
| Field / FieldContainer（`imds-field` / `imds-field-container`） | [imds-html-field.md](imds-html-field.md) |
| Checkbox（`imds-checkbox`） | [imds-html-checkbox.md](imds-html-checkbox.md) |

## 重要注意事项（检索按钮的颜色）

直接放在页面上的检索按钮**不要使用实心的 `is-primary`**。许多列表画面已经存在以 `is-primary` 显示的「新建」等主要操作，再加一个会违反 DESIGN.md 的「一个画面只有一个主要操作」原则。
检索按钮根据放置位置选择以下样式。

- 无色的 `imds-button`（如 ① 中放在 Popover 外的放大镜按钮这样不带装饰的情况）
- `imds-button is-outlined is-primary`（如 ② 检索区域内的 submit 按钮，在页面上想表示检索为主要操作时的次要表现）
- `imds-button is-primary`（实心。① 详细检索 Popover 内的检索按钮。遵循 imds 的 Storybook（Popover「列表中的检索筛选、显示项目设置」），作为 Popover 内的主要操作只放置一个）

## 重要注意事项（检索输入的 `aria-label`）

没有可见标签的检索输入（仅有 `placeholder` 的输入框）必须附加 `aria-label`。`placeholder` 不能替代标签。以下代码片段中 ①③ 均附加了 `aria-label`。

## HTML 代码片段

### ③ 上部・筛选（实时筛选）— 最常用・最小构成

放大镜图标显示在输入框内侧左边（`imds-textbox-control is-left`）。不使用虚构的 `imds-search` 类。

```html
<div class="imds-textbox-control is-left">
  <input type="search" class="imds-textbox" placeholder="按[REPLACE: 项目名]筛选" aria-label="按[REPLACE: 项目名]筛选" id="[REPLACE: filter-keyword]" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

- 没有可见标签时必须附加 `aria-label`（仅有 placeholder 不可）。
- `placeholder` / `aria-label` 写成「按〈对象项目名〉筛选」（通过检索按钮执行的①写成「按〈对象项目名〉搜索」）。
- 使用 `type="search"`，可清除输入值（×按钮）。
- 响应输入实时筛选（在输入停止时触发）。不放置检索按钮。
- 需要限定检索对象时，可在左侧并列放置类别选择（`imds-select` 等）。

### ① 上部・检索部件（关键字＋详细检索 Popover ＋检索按钮）

使用 `imds-input-group` 将关键字输入、详细检索 Popover 触发按钮、检索按钮横向排列。Popover 的内容遵循 imds 的 Storybook（Popover「列表中的检索筛选、显示项目设置」）的结构。

```html
<div class="imds-input-group">
  <input id=":searchKeywords:" type="search" class="imds-textbox" style="width: 20rem; max-width: 100%;" placeholder="按[REPLACE: 项目名]搜索" aria-label="按[REPLACE: 项目名]搜索" />
  <div class="imds-popover is-left">
    <button
      type="button"
      aria-haspopup="true"
      aria-controls="search-popover"
      aria-label="详细检索"
      class="imds-button is-outlined">
      <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
      <span></span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="search-popover"
      role="menu"
      class="imds-popover-menu">
      <div class="imds-popover-content">
        <div style="display: grid; grid-template-rows: 1fr auto; width: max-content;">
          <div
            class="imds-py-3 imds-px-4 imds-scrollbar"
            style="grid-row: 1 / 2; overflow: auto;">
            <form id="search-condition-form" class="imds-form">
              <div class="imds-field-container">
                <div class="imds-field imds-w-15">
                  <div class="imds-field-label"><label for=":matterNumber:">案件编号</label></div>
                  <div class="imds-field-control">
                    <input type="text" id=":matterNumber:" class="imds-textbox" value="" />
                  </div>
                </div>
                <div class="imds-field imds-w-15">
                  <div class="imds-field-label"><label for=":matterName:">案件名称</label></div>
                  <div class="imds-field-control">
                    <input type="text" id=":matterName:" class="imds-textbox" value="" />
                  </div>
                </div>
                <div class="imds-field imds-w-15">
                  <div class="imds-field-label"><label for=":status:">状态</label></div>
                  <div class="imds-field-control">
                    <select id=":status:" class="imds-select">
                      <option>全部</option>
                      <option>新建</option>
                      <option>执行中</option>
                      <option>已完成</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div
            class="imds-py-2 imds-px-4 imds-border-t-1"
            style="grid-row: 2 / 3;">
            <div style="display: flex; justify-content: flex-end; gap: 1em;">
              <button type="button" style="min-width: 8em;" class="imds-button is-normal">清除</button>
              <button type="submit" form="search-condition-form" style="min-width: 8em;" class="imds-button is-normal is-primary">搜索</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <button type="button" class="imds-button" aria-label="搜索">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

```javascript
// 执行详细检索（Popover 内的 Enter・检索按钮）
document.getElementById('search-condition-form').addEventListener('submit', function (event) {
  event.preventDefault();   // 必须。遗漏会导致页面重新加载
  searchList();             // 按关键字 + 详细条件检索（在页面侧实现）
  document.getElementById('search-popover').closest('.imds-popover').classList.remove('is-active');
});
```

- **用 `width: max-content` 的网格包裹 Popover 的内容**。不指定宽度时，面板会以触发按钮为基准收缩，横宽被压缩到标签和按钮文字逐字换行的程度
- 将条件输入区域（带 `imds-scrollbar`、`overflow: auto`）与按钮行（用 `imds-border-t-1` 分隔）分开，使条件较多时按钮行也始终可见
- 在 `imds-field` 上添加 `imds-w-15` 以对齐条件的标签宽度。条件项目根据画面进行替换
- 按钮行右对齐，左侧为清除（标准）、右侧为检索（实心 `is-primary`）。间隔使用 `gap: 1em`，各按钮添加 `style="min-width: 8em;"`（不定义自定义类）
- 检索按钮保持放在按钮行（`<form>` 之外），通过 `form` 属性关联到表单并设为 `type="submit"`。没有关联的 submit 按钮时，包含 2 个以上输入框的表单按 Enter 也不会提交
- 在 `submit` 事件处理程序中必须调用 `event.preventDefault()`，防止页面重新加载。清除按钮和触发按钮设为 `type="button"`（省略 `type` 的 `<button>` 在表单内会成为 submit 按钮）
- 由于 Popover 内包含 `<form>`，不要再用 `<form>` 包裹整个 `imds-input-group`（`<form>` 的嵌套在 HTML 中无效）。关键字栏的 Enter 检索通过 `keydown` 实现（参见 `.github/instructions/jssp-presentation-page.instructions.md` 的「Enter 键事件的实现」），并调用与放大镜按钮 `click` 相同的检索处理
- 触发按钮仅使用图标（`fa-sliders` + `fa-chevron-down`），图标之间的 `<span></span>` 保持为空（不放入「详细检索」等可见文本，以与 imds 的 Storybook 外观一致）。由于没有可见文本，需添加 `aria-label`（例：`aria-label="详细检索"`）
- 触发按钮的 `aria-controls` 与 `imds-popover-menu` 的 `id` 保持一致（参见 [imds-html-popover.md](imds-html-popover.md)）。id 根据功能取唯一的名称（不是输入元素，因此不加冒号）
- 详细检索的条件在关闭 Popover 后仍然保留。清除会清空所有条件，检索按钮执行检索并关闭 Popover
- 通过在触发按钮上添加 `is-applied` 表示详细检索条件正在应用中（参见下方 JS 控制）
- 放在 Popover 外的仅有放大镜图标的检索按钮没有可见文本，必须添加 `aria-label`

### ② 右侧・检索区域（始终显示・复合条件）

在表格右侧始终显示检索表单。栏宽通过内联 `style`（`width: 18rem; flex: 0 0 18rem;`）指定。

```html
<form class="imds-form imds-p-4" style="width: 18rem; flex: 0 0 18rem;">
  <div class="imds-field-container">
    <div class="imds-field">
      <div class="imds-field-label"><label for="[REPLACE: rc]">[REPLACE: 条件名1]</label></div>
      <div class="imds-field-control">
        <input type="text" id="[REPLACE: rc]" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-label"><label for="[REPLACE: rd]">[REPLACE: 条件名2]</label></div>
      <div class="imds-field-control">
        <div class="imds-checkbox-group">
          <label class="imds-checkbox">
            <input type="checkbox" id="[REPLACE: rd]" />
            <span>[REPLACE: 筛选选项]</span>
          </label>
        </div>
      </div>
    </div>
    <div class="imds-mt-4" style="display: flex; justify-content: flex-end; gap: 1em;">
      <button type="button" class="imds-button" style="min-width: 8em;">清除</button>
      <button type="submit" class="imds-button is-outlined is-primary" style="min-width: 8em;">搜索</button>
    </div>
  </div>
</form>
```

- 按钮布局为左侧清除（标准）・右侧检索（`is-outlined is-primary`）。右侧优先。
- 客户端筛选时仅放置清除按钮。
- 通过 `form` submit 实现 Enter 检索（在 `submit` 事件处理程序中必须调用 `event.preventDefault()`）。清除会清空所有条件，检索按钮执行检索（点击前不重新检索）。

## JS 控制

在详细检索（①）中，通过触发按钮的 `is-applied` 表示条件正在应用中。

```javascript
// 将 is-applied 反映到详细检索 Popover 的触发按钮
const updateAppliedState = (trigger, form) => {
  const hasValue = Array.from(form.querySelectorAll('input, select, textarea'))
    .some((element) => {
      if (element.type === 'checkbox' || element.type === 'radio') return element.checked;
      return element.value.trim() !== '';
    });
  trigger.classList.toggle('is-applied', hasValue);
};
```

实时筛选（③）通过 `input` 事件筛选目标表格行（推荐 debounce）。具体的筛选逻辑放在各画面的实现侧。

## CSS 意图

本模式不使用自定义类（原 `gx-search-*`）。宽度和间隔通过内联 `style` 指定，外边距通过 imds 的辅助类（`imds-mt-4` 等）指定。自定义类与 imds 默认样式的优先级相同，可能无法覆盖，而且若 `<style>` 中遗漏定义会导致显示错乱（如按钮间隔消失）（参见 `.github/instructions/jssp-presentation-page.instructions.md` 的「反模式：不定义自定义 `.max-width-NNem` / `.min-width-NNem` 类」）。

## 实现注意事项

- 放在页面上的检索按钮不使用实心的 `is-primary`（避免与「新建」等主要操作重复）。仅详细检索 Popover 内的检索按钮使用实心的 `is-primary`（参见「重要注意事项（检索按钮的颜色）」）。
- 没有可见标签的检索输入必须附加 `aria-label`（参见「重要注意事项（检索输入的 `aria-label`）」）。
- 模式③仅用于客户端筛选（不放置检索按钮），①② 设想为服务器端检索。
