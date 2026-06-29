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

### isNarrow（紧凑）

应用于整个表格时在 `div.imds-table` 上添加，只应用于特定行时在 `tr` 上添加 `is-narrow`。

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

```html
<th class="has-content-only">
  <label class="imds-checkbox">
    <input type="checkbox" />
    <span></span>
  </label>
</th>
<!-- 在 tbody 各行中也添加相同结构的 td -->
<td class="has-content-only">
  <label class="imds-checkbox">
    <input type="checkbox" />
    <span></span>
  </label>
</td>
```

### isDetailsButton（详情按钮列）

添加详情按钮列。
在 `th` / `td` 上添加 `has-content-only`。

```html
<th class="has-content-only"><span>详情</span></th>
<!-- tbody 各行 -->
<td class="has-content-only">
  <button type="button" class="imds-button is-ghost is-small">
    <span class="imds-icon"><i class="fa-regular fa-file-lines"></i></span>
  </button>
</td>
```

### isSortable（可排序）

在排序目标的 `th` 上添加 `is-sortable` 并添加排序图标。

```html
<th class="is-sortable">
  <span>表头2</span>
  <span class="imds-icon"><i class="fa-solid fa-sort-up"></i></span>
</th>
```

根据排序方向切换图标：`fa-sort-up`（升序）/ `fa-sort-down`（降序）/ `fa-sort`（未排序）。

### hasTextRight（文字右对齐）

在需要右对齐的 `td`（如数字列）上添加 `has-text-right`。

```html
<td class="has-text-right"><span>1,000</span></td>
```

### isActive（激活行/单元格）

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

## 无障碍支持

### 表头标签

- 标签基本上左对齐
- 但以下情况使用居中对齐

  **居中对齐**：在 `th` 上指定 `has-text-right` 类
  - 显示对表格进行操作的按钮时
  - 显示表示状态的图标时

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
- 排序处理通过 JavaScript 实现（切换图标和数据排序）
- 按钮、复选框等不需要单元格内边距时使用 `has-content-only`
- 多个变体可以组合使用（例如：`is-sticky is-hoverable is-stripe`）
