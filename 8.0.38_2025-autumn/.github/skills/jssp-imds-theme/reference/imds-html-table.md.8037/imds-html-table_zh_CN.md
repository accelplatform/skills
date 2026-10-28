---
paths:
  - "src/main/jssp/**/*.html"
---

# Table

## 基本信息

以表格形式显示数据的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/story/components-table--default
- 基础类: imds-table

## 整体结构

```
imds-table                                # 表格容器（尺寸与滚动控制）
└── imds-table-inner                      # 内部包装器
    └── table                             # 原生 <table> 元素
        ├── thead
        │   └── tr
        │       └── th                    # 表头单元格（可附加 is-sticky / is-sortable 等）
        └── tbody
            └── tr                        # 各行（可附加 is-active / is-danger 等）
                └── td                    # 各单元格（可附加 is-sticky / has-content-only / has-text-right 等）
```

`div.imds-table > div.imds-table-inner > table` 的 **三层结构是必需的**，不可直接编写 `table`。

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-table | div 元素 | 表格容器 | 必须 |
| imds-table-inner | div 元素 | 表格内部包装器 | 必须 |
| is-sticky | imds-table | 固定表头行（纵向滚动时） | 可选 |
| is-hoverable | imds-table | 行悬停高亮 | 可选 |
| is-bordered | imds-table | 全部单元格边框 | 可选 |
| is-area-bordered | imds-table | 表格外框边框 | 可选 |
| is-narrow | imds-table / tr 元素 | 减少单元格内边距 | 可选 |
| is-stripe | imds-table | 偶数行背景色变化 | 可选 |
| is-sticky | th / td 元素 | 固定列（横向滚动时） | 可选 |
| is-border-right | th / td 元素 | 固定列右侧显示边界线 | 可选 |
| is-sortable | th 元素 | 可排序列 | 可选 |
| is-max-content | imds-table | 推荐横向滚动（列宽以内容宽度为基准） | 可选 |
| is-active | tr / td 元素 | 激活（已选中）高亮 | 可选 |
| has-content-only | th / td 元素 | 去除单元格内边距（用于按钮、复选框） | 可选 |
| has-text-right | td 元素 | 文字右对齐（用于数字列） | 可选 |
| is-danger | tr / td 元素 | 删除/过期（红色） | 可选 |
| is-error | tr / td 元素 | 处理失败/错误（红色） | 可选 |
| is-success | tr / td 元素 | 处理成功/正常（绿色） | 可选 |
| is-add | tr / td 元素 | 新增（绿色） | 可选 |
| is-warning | tr / td 元素 | 注意/警告（黄色） | 可选 |
| is-disabled | tr / td 元素 | 非活动状态（灰色） | 可选 |
| is-white | tr / td 元素 | 装饰色（白色） | 可选 |
| is-green | tr / td 元素 | 装饰色（绿色） | 可选 |
| is-red | tr / td 元素 | 装饰色（红色） | 可选 |
| is-yellow | tr / td 元素 | 装饰色（黄色） | 可选 |
| is-cyan | tr / td 元素 | 装饰色（青色） | 可选 |
| is-gray | tr / td 元素 | 装饰色（灰色） | 可选 |

## HTML 代码片段

### 基本表格

```html
<div
  class="imds-table"
  style="width: 100%; height: 100%; max-height: 250px;">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th>表头1</th>
          <th><span>表头2</span></th>
          <th><span>表头3</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span>值-1-1</span></td>
          <td><span>值-1-2</span></td>
          <td><span>值-1-3</span></td>
        </tr>
        <!-- 按需重复相同的 tr 结构 -->
      </tbody>
    </table>
  </div>
</div>
```

以下各节仅展示与基本表格的差异。

## 变体

### isSticky（固定表头）

在 `div.imds-table` 上添加 `is-sticky`。
纵向滚动时固定表头行。

```html
<div class="imds-table is-sticky" ...>
```

### isHoverable（行悬停）

在 `div.imds-table` 上添加 `is-hoverable`。

```html
<div class="imds-table is-hoverable" ...>
```

### isBordered（全部单元格边框）

在 `div.imds-table` 上添加 `is-bordered`。

```html
<div class="imds-table is-bordered" ...>
```

### isAreaBordered（外框边框）

在 `div.imds-table` 上添加 `is-area-bordered`。

```html
<div class="imds-table is-area-bordered" ...>
```

### isStripe（条纹）

在 `div.imds-table` 上添加 `is-stripe`。偶数行背景色发生变化。

```html
<div class="imds-table is-stripe" ...>
```

### isMaxContent（推荐横向滚动）

对于列数较多、各单元格字数较多等很可能产生横向滚动的表格，在 `div.imds-table` 上添加 `is-max-content`。
列宽以内容宽度为基准，可避免单元格内换行。

```html
<div class="imds-table is-hoverable is-sticky is-area-bordered is-max-content" ...>
```

反之，列数较少、希望不横向滚动而显示全部列时，不添加 `is-max-content`。此时较长的字符串会换行显示。

```html
<!-- 不横向滚动的情况（无 is-max-content） -->
<div class="imds-table is-hoverable is-sticky is-area-bordered" ...>
```

### isNarrow（紧凑）

应用于整个表格时在 `div.imds-table` 上添加，只应用于特定行时在 `tr` 上添加 `is-narrow`。行数较多的列表表格推荐应用于整个表格（附加标准请参阅「实现注意事项」）。

```html
<!-- 整个表格 -->
<div class="imds-table is-narrow" ...>

<!-- 仅特定行 -->
<tr class="is-narrow">
  <td colspan="3"><span>窄行示例</span></td>
</tr>
```

### isVerticalSticky（固定列）

横向滚动时固定特定列。
在 `th` / `td` 上添加 `is-sticky`，第2列以后用 `left` 指定位置。
在最后一个固定列上添加 `is-border-right` 以显示边界线。

```html
<thead>
  <tr>
    <th class="is-sticky"><span>固定列1</span></th>
    <th class="is-sticky" style="left: 70px;"><span>固定列2</span></th>
    <th class="is-sticky is-border-right" style="left: 140px;"><span>详情</span></th>
    <th>表头1</th>
    <!-- 普通列 -->
  </tr>
</thead>
<tbody>
  <tr>
    <td class="is-sticky is-cyan"><span>固定列1</span></td>
    <td class="is-sticky is-cyan" style="left: 70px;"><span>固定列2</span></td>
    <td class="is-sticky has-content-only is-border-right is-cyan" style="left: 140px;">
      <button type="button" class="imds-button is-ghost is-small">
        <span class="imds-icon"><i class="fa-regular fa-file-lines"></i></span>
      </button>
    </td>
    <td><span>值-1-1</span></td>
    <!-- 普通列 -->
  </tr>
</tbody>
```

### isSelectable（行选择）

添加复选框列。
在 `th` / `td` 上添加 `has-content-only` 以去除单元格内边距。
表格中的复选框在 `label.imds-checkbox` 内仅放置 `input`，不添加 `span`（注意与表单中单独使用的复选框不同）。

```html
<th class="has-content-only">
  <label class="imds-checkbox">
    <input type="checkbox" id="checkbox-all-xxxxx" />
  </label>
</th>
<!-- 在 tbody 各行中也添加相同结构的 td -->
<td class="has-content-only">
  <label class="imds-checkbox">
    <input type="checkbox" id="checkbox-child-0-xxxxx" />
  </label>
</td>
```

### isDetailsButton（详情按钮列）

添加详情按钮列。
`th` 仅包含表头文本，因此添加 `has-text-centered` 使其居中。`td` 仅包含按钮，因此添加 `has-content-only`。

```html
<th class="has-text-centered"><span>详情</span></th>
<!-- tbody 各行 -->
<td class="has-content-only">
  <button type="button" class="imds-button is-ghost is-small">
    <span class="imds-icon"><i class="fa-regular fa-file-lines"></i></span>
  </button>
</td>
```

### isSortable（可排序）

在排序目标的 `th` 上添加 `is-sortable`，并以 `imds-table-column-actions > button.imds-table-sorter > span.imds-table-sort-label + span.imds-icon` 的结构添加排序按钮。
`span.imds-icon` 中始终同时编写 `fa-sort-up`（升序图标）和 `fa-sort-down`（降序图标）两个 `<i>`，由 CSS 根据排序状态切换显示（并非动态替换为单个图标的实现）。
在 `button.imds-table-sorter` 上添加表示当前操作的 `title` 属性（例：`"按升序排序"` / `"按降序排序"` / `"取消排序"`）。

```html
<th class="is-sortable">
  <div class="imds-table-column-actions">
    <button class="imds-table-sorter" title="按升序排序">
      <span class="imds-table-sort-label">表头2</span>
      <span class="imds-icon">
        <i class="fa-solid fa-sort-up"></i>
        <i class="fa-solid fa-sort-down"></i>
      </span>
    </button>
  </div>
</th>
```

排序状态按「升序 → 降序 → 未应用」的顺序切换。`title` 设为表示此时下一次点击将发生的操作的文字。

### hasTextRight（文字右对齐）

在需要右对齐的 `td`（如数字列）上添加 `has-text-right`。

```html
<td class="has-text-right"><span>1,000</span></td>
```

### isActive（激活行 / 单元格）

高亮整行时在 `tr` 上添加，按单元格高亮时在 `td` 上添加 `is-active`。

```html
<!-- 整行 -->
<tr class="is-active">

<!-- 单元格级别 -->
<td class="is-active"><span>值</span></td>
```

### color（单元格背景色）

在 `tr` 或 `td` 上添加颜色类。可与 `is-active` 组合使用。

| 类 | 用途 |
|--------|------|
| （无） | 普通颜色 |
| is-danger | 删除/过期 |
| is-error | 处理失败/错误 |
| is-success | 处理成功/正常 |
| is-add | 新增 |
| is-warning | 注意/警告 |
| is-disabled | 非活动状态 |
| is-white / is-green / is-red / is-yellow / is-cyan / is-gray | 装饰色 |

```html
<tr class="is-danger">            <!-- 整行着色 -->
<td class="is-success">           <!-- 单个单元格着色 -->
<td class="is-warning is-active"> <!-- 颜色 + 激活的组合 -->
```

### 纵向布局（项目名与值横向并列显示）

在详情/查看界面或对话框中显示摘要信息时使用的、将项目名与值横向并列显示的表格。
在表格的行中放置标题时使用 `th`（不使用 `thead`，而是在 `tbody` 内交替排列 `th`/`td`）。

```html
<div class="imds-table is-bordered is-area-bordered">
  <div class="imds-table-inner">
    <table>
      <tbody>
        <tr>
          <th><span>应用程序名</span></th>
          <td><span>应用程序1</span></td>
          <th><span>应用程序ID</span></th>
          <td><span>sample_app_1</span></td>
        </tr>
        <tr>
          <th><span>类别名</span></th>
          <td><span>类别1</span></td>
          <th><span>类别ID</span></th>
          <td><span>ct_1</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

## 无障碍支持

### 表头标签

- 标签基本上左对齐
- 但以下情况使用居中对齐

  **居中对齐**：在 `th` 上指定 `has-text-centered` 类
  - 显示对表格进行操作的按钮时
  - 显示表示状态的图标时
  - 仅显示「编辑」「详情」等表头文本时（此时不使用 `has-content-only`。`has-content-only` 仅用于 th 本身不含表头文本、只包含复选框等组件的情况）

### tbody

- 数据项与列标题同样基本上左对齐
- 但以下情况使用居中/右对齐

  **居中对齐**：在 `td` 上指定 `has-text-centered` 类
  - 显示对表格进行操作的按钮时
  - 显示表示状态的图标时

  **右对齐**：在 `td` 上指定 `has-text-right` 类
  - 显示金额、数字等需要注意位数的数据时

  **仅组件**：在 `td` 上指定 `has-content-only` 类
  - 仅显示复选框、按钮、图标、标签等组件时

## 实现注意事项

- 表格使用 `div.imds-table > div.imds-table-inner > table` 的三层结构编写
- 通过 `imds-table` 的 `style` 控制尺寸（用 `max-height` 设置滚动区域）
- `is-sticky`（整个表格）与 `is-sticky`（th/td）用途不同：前者固定表头行，后者固定列
- 固定列的 `left` 值需根据前面固定列的宽度手动计算
- 固定列的 `td` 须添加背景色类（如 `is-cyan`），否则滚动时背景将变为透明
- 排序处理通过 JavaScript 实现（切换 `is-sortable` 状态类和数据排序）。表头内的排序图标始终同时编写 `fa-sort-up` / `fa-sort-down` 两个，由 CSS 侧的状态类切换显示
- 对于容易产生横向滚动（列数、字数较多）的表格添加 `is-max-content`。列数较少、不希望横向滚动时不添加
- 按钮、复选框等不需要单元格内边距时使用 `has-content-only`
- 若 `th` 中含有表头文本（如 `<span>编辑</span>`），请勿添加 `has-content-only`。需要居中时请使用 `has-text-centered`。`has-content-only` 仅限于 th 自身只包含复选框等组件、不含表头文本的情况
- 多个变体可以组合使用（例如：`is-sticky is-hoverable is-stripe`）
- 变体类的添加标准：
  - `is-area-bordered`（使表格区域更易辨识）和 `is-hoverable`（使行更易辨识。横向较宽的表格尤其推荐）原则上都要添加
  - 可能产生纵向滚动的表格添加 `is-sticky`（使各列标签始终显示）
  - 存在在 `td` 上指定 `has-text-right` 的右对齐列时，为使列的分隔更易辨识，推荐添加 `is-bordered`（与 `is-area-bordered` 作用不同，可同时使用）
  - 行数较多的列表表格，为增加一次显示的行数、提高信息密度，推荐添加 `is-narrow`（列表画面默认添加）。在 `td` 内放置文本框等输入组件的表格，也为抑制行高添加 `is-narrow`
- 列数和文本较少、以 100% 宽度铺满整个界面时不易阅读的表格，可考虑在 `div.imds-table` 的 `style` 中指定 `width: fit-content;`（非必须）。需要对齐表格右端右对齐显示合计值等时，用 `<div style="width: fit-content;">` 将表格与目标元素一起包裹（`has-text-end` 以元素自身宽度为基准右对齐）
- **行/单元格的背景色请勿使用自定义类**。imds 是在 `td` 上设置背景色的，若在 `tr` 上用自定义类指定 `background-color`，会被 `td` 的背景色覆盖而实际不显示（类已附加但外观未变化，是一种不易察觉的缺陷）。选中行的高亮请使用 `is-active`（参见 [isActive（激活行 / 单元格）](#isactive激活行--单元格)），按状态着色请使用 `is-danger` / `is-warning` / `is-success` 等颜色类（参见 [color（单元格背景色）](#color单元格背景色)）。`is-active` 可与颜色类组合使用
