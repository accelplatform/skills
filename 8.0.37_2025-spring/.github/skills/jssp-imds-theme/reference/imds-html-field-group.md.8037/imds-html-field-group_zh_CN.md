---
paths:
  - "src/main/jssp/**/*.html"
---

# FieldGroup

## 基本信息

FieldGroup 是将多个 Field 组合在一起的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-field-fieldgroup--documentation
- 基础类: imds-field-group
- 关于各个字段的详细信息，请参阅 [imds-html-field.md](imds-html-field.md)

## 整体结构

```
imds-field-group                          # 整个组（附加 is-vertical / is-horizontal + 标签宽度类）
├── imds-field-group-label                # 组标签区域
│   └── span                              # 标签文字（可附加必填/可选标记类）
├── imds-field-group-control              # 组内 Field 放置区域（is-vertical / is-horizontal）
│   ├── imds-field                        # 各 Field（出错时附加 imds-validation-error）
│   │   ├── imds-field-label
│   │   └── imds-field-control
│   ├── imds-field                        # 按需重复（id 必须唯一）
│   └── ...
├── imds-help-text                        # 帮助文本（可选，放置在末尾）
└── imds-error-text                       # 错误消息（可选，放置在末尾）
```

`imds-help-text` / `imds-error-text` 应 **放置于 `imds-field-group-control` 之后**（组的末尾）。`imds-validation-error` 应附加到具体的 `imds-field`，而非整个组。

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-field-group | 外层 div | 字段组容器 | 必须 |
| imds-field-group-label | div 元素 | 组标签区域 | 必须 |
| imds-field-group-control | div 元素 | 组控件区域（放置 Field） | 必须 |
| is-vertical | imds-field-group | 垂直布局（标签在上方） | 可选 |
| is-horizontal | imds-field-group | 水平布局（标签在左侧） | 可选 |
| is-vertical | imds-field-group-control | 组内 Field 纵向排列 | 可选 |
| is-horizontal | imds-field-group-control | 组内 Field 横向排列 | 可选 |
| imds-w-15 | imds-field-group | 标签宽度 15% | 可选 |
| imds-w-25 | imds-field-group | 标签宽度 25% | 可选 |
| imds-w-30 | imds-field-group | 标签宽度 30% | 可选 |
| imds-w-150px | imds-field-group | 标签宽度 150px | 可选 |
| imds-w-250px | imds-field-group | 标签宽度 250px | 可选 |
| imds-required-label-required-asterisk | span 元素 | 星号（*）必填标记 | 可选 |
| imds-required-label-required | span 元素 | "必填"文本标记 | 可选 |
| imds-required-label-optional | span 元素 | "可选"文本标记 | 可选 |
| imds-help-text | span 元素 | 帮助文本 | 可选 |
| imds-error-text | span 元素 | 错误消息 | 可选 |
| imds-validation-error | imds-field | 验证错误状态（应用于单个 Field） | 可选 |
| imds-field-container | 外层 div | 纵向排列 FieldGroup 的容器（第1层必须） | 必须（放置于第1层时） |

## HTML 代码片段

### 基本字段组

```html
<div class="imds-field-group">
  <div class="imds-field-group-label"><span>Group Label</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r1:">Label</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r1:" class="imds-textbox" value="" />
      </div>
    </div>
    <!-- 根据需要重复 imds-field（id 必须唯一） -->
  </div>
</div>
```

以下仅显示与基本字段组的差异部分。

## 变体

### alignment（整体组布局方向）

在 `div.imds-field-group` 上添加类。

```html
<div class="imds-field-group is-vertical">    <!-- 垂直（标签在上方） -->
<div class="imds-field-group is-horizontal">  <!-- 水平（标签在左侧） -->
```

### groupControlAlignment（组内 Field 的排列方向）

在 `div.imds-field-group-control` 上添加类。

```html
<div class="imds-field-group-control is-vertical">    <!-- Field 纵向排列 -->
<div class="imds-field-group-control is-horizontal">  <!-- Field 横向排列 -->
```

### labelWidth（标签宽度）

在 `div.imds-field-group` 上添加类。
水平布局时有效。

```html
<div class="imds-field-group imds-w-15">     <!-- 15% -->
<div class="imds-field-group imds-w-25">     <!-- 25% -->
<div class="imds-field-group imds-w-30">     <!-- 30% -->
<div class="imds-field-group imds-w-150px">  <!-- 150px -->
<div class="imds-field-group imds-w-250px">  <!-- 250px -->
```

### required（必填/可选标记）

在 `imds-field-group-label` 内的 `span` 元素上添加类和 `data-required-label` 属性。

```html
<!-- 星号（*） -->
<span class="imds-required-label-required-asterisk">Group Label</span>

<!-- "必填"标记 -->
<span class="imds-required-label-required" data-required-label="必填">Group Label</span>

<!-- "可选"标记 -->
<span class="imds-required-label-optional" data-required-label="可选">Group Label</span>
```

## 组合示例

### 帮助文本

在 `imds-field-group` 末尾（`imds-field-group-control` 之后）添加 `imds-help-text`。

```html
<div class="imds-field-group">
  <!-- 省略 imds-field-group-label、imds-field-group-control -->
  <span class="imds-help-text">最多可输入50个半角字母数字字符。</span>
</div>
```

### 验证错误

在单个 `div.imds-field` 上添加 `imds-validation-error`，并在 `imds-field-group` 末尾添加 `imds-error-text`。

```html
<div class="imds-field-group">
  <!-- 省略 imds-field-group-label -->
  <div class="imds-field-group-control">
    <div class="imds-field imds-validation-error">
      <!-- Field 的内容 -->
    </div>
  </div>
  <span class="imds-error-text">在此处显示错误消息。</span>
</div>
```

### 横向排列 Field 的宽度指定与错误显示

输入框的宽度原则上通过 `style="max-width: …"` 直接指定在 `input` / `select` 上。但仅在使用 `imds-field-group-control is-horizontal` 横向排列 Field 时，在各 `div.imds-field` 上指定宽度（指定在输入元素上会导致输入框之间出现不自然的间隙）。

`div.imds-field` 的宽度小于 10em 时，错误消息（`imds-error-text`）不按字段显示，而显示在 `imds-field-group-control` 之后（组的末尾）（宽度较窄时消息换行较多，难以阅读）。即使宽度在 10em 以上，消息较长难以阅读时也可以显示在组的末尾。并列显示多个字段的错误时，按字段逐个排列 `imds-error-text`。`imds-validation-error` 仍附加到单个 `imds-field` 上。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>数量</span></div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field" style="max-width: 8em;">
      <div class="imds-field-label"><label for=":r10:">单价</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r10:" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field imds-validation-error" style="max-width: 8em;">
      <div class="imds-field-label"><label for=":r11:">库存数</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r11:" class="imds-textbox" value="" />
      </div>
    </div>
  </div>
  <span class="imds-error-text">库存数请输入0以上的数值。</span>
</div>
```

### 使用 field-container 包裹

将 FieldGroup 放置在表单的第1层时，与 Field 相同，使用 `imds-field-container` 包裹。`imds-field-container` 的详细信息（`has-divider` / `has-accent-color` / 小于 768px 时自动纵向堆叠）请参阅 [imds-html-field.md](imds-html-field.md) 的「Field Container」节。

```html
<form class="imds-form">
  <div class="imds-field-container">
    <div class="imds-field-group is-horizontal imds-w-15">
      <div class="imds-field-group-label"><span>地址</span></div>
      <div class="imds-field-group-control">
        <div class="imds-field">
          <div class="imds-field-label">
            <label class="imds-required-label-required-asterisk" for=":r8:">省/直辖市</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id=":r8:" class="imds-textbox" value="" />
          </div>
        </div>
        <div class="imds-field">
          <div class="imds-field-label">
            <label class="imds-required-label-required-asterisk" for=":r9:">市/区/县</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id=":r9:" class="imds-textbox" value="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</form>
```

## 实现注意事项

- 为组内各个 Field 的 `id` 分配唯一值（`:r1:` 等为占位符）
- `imds-help-text` 和 `imds-error-text` 放置在 `imds-field-group-control` 之后
- `imds-validation-error` 应用于单个 `imds-field`，而非整个组
- 仅在使用 `imds-field-group-control is-horizontal` 横向排列 Field 时，将宽度指定在 `div.imds-field` 上而非输入元素上（参见「横向排列 Field 的宽度指定与错误显示」）
- 在 `imds-field-group-control is-horizontal` 内放置多个 `imds-field` 时，组内 `imds-field-label` 的有无需保持一致。有无混用会导致布局错乱
  - 所有字段都有标签时，在 `imds-field-group-label` 中设置整个组的标题
  - 统一不使用标签时，在 `imds-field-group-label` 中设置代表性的项目名称
- **仅容纳1个输入组件的原则**：FieldGroup 的内容由 Field 构成（每个 Field 仅容纳单个输入组件）。FieldGroup 本身不进行嵌套
- **field-container 必须原则**：在表单第1层放置 FieldGroup 时，与 Field 相同，必须使用 `imds-field-container` 包裹
- `imds-field-container` 正下方的 FieldGroup，在视口宽度 768px 以下时，即使指定了 `is-horizontal`，标签和控件也会自动纵向堆叠。第2层及以下或单独使用时不适用
- Field 的详细用法请参阅 [imds-html-field.md](imds-html-field.md)
