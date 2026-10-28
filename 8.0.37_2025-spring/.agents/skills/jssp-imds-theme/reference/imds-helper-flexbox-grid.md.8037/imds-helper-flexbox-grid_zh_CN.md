# Flexbox & Grid（对齐、网格工具类）

## 基本信息

Flexbox & Grid 是提供 Flex / Grid 容器内元素的对齐（Align self）以及基于 CSS Grid 的行、列布局（Grid）的 imds 辅助类组。它们是 imds 的工具类，与 `imds-field` / `imds-field-group` 等组件专用类组合使用。不作为独立组件使用。

- 提取来源: `uiux-share/helper/Flexbox & Grid.md`（Align self）以及 `uiux-share/layout/Grid.md`（Grid）
- 补充: `uiux-share/helper/Flexbox & Grid.md` 本身没有 Grid（`imds-grid` 等）的描述，相当于 Grid 的类定义仅存在于 `uiux-share/layout/Grid.md` 中。本文件整合了两者。

## CSS Classes Reference

### Align self

| 类名 | 应用于 | 用途 | 值（Property: Value） |
|----------|--------|------|----------------------|
| `is-align-self-start` | Flex/Grid 容器的子元素 | 顶端对齐 | `align-self: start;` |
| `is-align-self-center` | Flex/Grid 容器的子元素 | 居中对齐 | `align-self: center;` |
| `is-align-self-end` | Flex/Grid 容器的子元素 | 底端对齐 | `align-self: end;` |

### Grid（基本构成）

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| `imds-grid` | 作为网格容器的元素 | 启用 CSS Grid 容器 | 必须 |
| `imds-grid-cell` | `imds-grid` 的直接子元素 | 作为网格单元格处理 | 必须 |

### Grid（通用列数指定 — 所有画面尺寸通用）

| 类名 | 用途 | 值 |
|----------|------|----|
| `has-cols-1` 〜 `has-cols-12` | 在所有画面尺寸下显示指定的列数 | 列数: 1〜12（默认为2列） |

### Grid（按断点指定列数）

| 类名 | 用途 | 值 |
|----------|------|----|
| `has-small-mobile-cols-N` | 在 Small Mobile 及以上断点设为 N 列（N=1〜12） | 列数: N |
| `has-mobile-cols-N` | 在 Mobile 及以上断点设为 N 列（N=1〜12） | 列数: N |
| `has-tablet-cols-N` | 在 Tablet 及以上断点设为 N 列（N=1〜12） | 列数: N |

### Grid（固定列合并指定 — 所有画面尺寸通用）

| 类名 | 应用于 | 用途 | 值 |
|----------|--------|------|----|
| `is-col-span-N`（N=1〜12） | `imds-grid-cell` | 在所有画面尺寸下，合并使元素跨越 N 列 | 合并列数: N |

### Grid（按断点指定列合并）

| 类名 | 应用于 | 用途 | 值 |
|----------|--------|------|----|
| `is-small-mobile-col-span-N` | `imds-grid-cell` | 在 Small Mobile 及以上断点跨越 N 列 | 合并列数: N |
| `is-mobile-col-span-N` | `imds-grid-cell` | 在 Mobile 及以上断点跨越 N 列 | 合并列数: N |
| `is-tablet-col-span-N` | `imds-grid-cell` | 在 Tablet 及以上断点跨越 N 列 | 合并列数: N |

## 使用示例

### Align self: 对齐 Field 的纵向位置

应用前（保持顶端对齐）

```html
<div class="imds-field-group">
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r0:">内存容量</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r0:" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-control">
        <select id=":r1:" class="imds-select">
          <option>GB</option>
          <option>TB</option>
        </select>
      </div>
    </div>
  </div>
</div>
```

应用后（添加 `is-align-self-end`，使无标签的字段与其他字段的输入框纵向位置对齐）

```html
<div class="imds-field-group">
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r3:">内存容量</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r3:" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field is-align-self-end">
      <div class="imds-field-control">
        <select id=":r4:" class="imds-select">
          <option>GB</option>
          <option>TB</option>
        </select>
      </div>
    </div>
  </div>
</div>
```

### Grid: 基本构成（默认2列）

```html
<div class="imds-grid">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell">cell 2</div>
  <div class="imds-grid-cell">cell 3</div>
  <div class="imds-grid-cell">cell 4</div>
</div>
```

### Grid: 通用列数指定（12列）

```html
<div class="imds-grid has-cols-12">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell">cell 2</div>
  <!-- ... 持续到 cell 12 ... -->
</div>
```

### Grid: 按断点指定列数（基本3列，tablet 及以上6列）

```html
<div class="imds-grid has-cols-3 has-tablet-cols-6">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell">cell 2</div>
  <!-- ... -->
</div>
```

### Grid: 固定列合并（在12列网格中将第2列合并为3列）

```html
<div class="imds-grid has-cols-12">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell is-col-span-3">cell 2</div>
  <div class="imds-grid-cell">cell 3</div>
</div>
```

### Grid: 按断点指定列合并

```html
<div class="imds-grid has-cols-4">
  <div class="imds-grid-cell is-small-mobile-col-span-3 is-mobile-col-span-2 is-tablet-col-span-1">cell 1</div>
  <div class="imds-grid-cell is-small-mobile-col-span-3 is-mobile-col-span-2 is-tablet-col-span-1">cell 2</div>
</div>
```

### Grid: 应用于 FieldGroup（含重要注意事项）

在 FieldGroup 中使用 Grid 时，可应用的范围仅限于 `.imds-field-group-control`。为 `.imds-field-group-control` 指定 `.imds-grid` 类，并将其直接子元素作为 `.imds-grid-cell` 处理。

**✅ OK示例（为 `.imds-field-group-control` 添加 `imds-grid`）**

```html
<div class="imds-field-container has-accent-color">
  <div class="imds-field-group is-horizontal">
    <div class="imds-field-group-label"><span>购买信息</span></div>
    <div class="imds-field-group-control is-horizontal imds-grid has-cols-3">
      <div class="imds-field imds-grid-cell">
        <div class="imds-field-label"><label for=":rb:">购买日期</label></div>
        <div class="imds-field-control">
          <input type="date" id=":rb:" class="imds-textbox" value="" />
        </div>
      </div>
      <div class="imds-field imds-grid-cell">
        <div class="imds-field-label"><label for=":rc:">购买金额</label></div>
        <div class="imds-field-control">
          <input type="text" id=":rc:" class="imds-textbox has-text-end" value="" />
        </div>
      </div>
      <div class="imds-field imds-grid-cell">
        <div class="imds-field-label"><label for=":rd:">审批信息</label></div>
        <div class="imds-field-control">
          <input type="text" placeholder="选择审批编号" class="imds-textbox" readonly value="" />
        </div>
      </div>
    </div>
  </div>
</div>
```

**❌ NG示例（为 `.imds-field-group` 本身添加 `imds-grid`，将 `imds-field-group-label` / `imds-field-group-control` 作为单元格）**

```html
<div class="imds-field-container has-accent-color">
  <div class="imds-field-group is-horizontal imds-grid has-cols-3">
    <div class="imds-field-group-label imds-grid-cell"><span>购买信息</span></div>
    <div class="imds-field-group-control is-horizontal imds-grid-cell is-col-span-2">
      <div class="imds-field">
        <div class="imds-field-label"><label for=":re:">购买日期</label></div>
        <div class="imds-field-control">
          <input type="date" id=":re:" class="imds-textbox" value="" />
        </div>
      </div>
    </div>
  </div>
</div>
```

## 实现注意事项

- **`is-col-span-N` 必须仅添加到 `imds-field-group-control`（或 `imds-field` 等已添加 `imds-grid-cell` 的元素）上，不得添加到 `imds-field-group` 本身。** `imds-field-group` 内部具有控制 Label 与 Control 布局的机制，若将 `imds-field-group` 本身作为网格容器，并将 `imds-field-group-label` / `imds-field-group-control` 作为网格单元格处理，布局会错乱。为 FieldGroup 指定 Grid 时，须仅为 `.imds-field-group-control` 指定 `imds-grid`。
- `is-align-self-*` 仅对 Flex 或 Grid 容器的子元素有效，在普通块级元素上无法获得预期效果。基本上通过父元素的 `align-items` 统一对齐，仅在需要修正个别元素位置时使用。
- 为单元格指定列合并（`is-col-span-N` 等）时，注意该单元格跨越的列数不要超过父网格中定义的列数（`has-cols-N`）。超过时单元格可能意外换行到下一行，或导致布局错乱。
- 需要更改列内元素的垂直位置时，为 `imds-grid-cell` 添加 `is-align-self-start` / `is-align-self-center` / `is-align-self-end`。
