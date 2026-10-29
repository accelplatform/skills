# Field

## 基本信息

Field 是用于用户输入或选择数据的组件。
作为表单的构成要素使用。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-field-field--documentation
- 基础类: imds-field

## Field 中可放置的内容

Field（`imds-field-control` 内）中**仅放置 1 个「单一输入组件」**。对象如下。

- Textbox
- Textarea
- Select
- Checkbox
- Popover
- CheckboxGroup（内含多个 Checkbox）
- RadioGroup（内含多个 Radio）
- InputGroup
- TextboxControl

作为例外，当输入组件与辅助其操作的组件（清除按钮、搜索辅助按钮等）并置时，将它们整体视为「单一输入组件」。

```html
<!-- TextboxControl + 清除按钮（作为例外视为单一输入组件） -->
<div class="imds-field is-horizontal">
  <div class="imds-field-label">
    <label class="imds-required-label-required-asterisk" for=":r2:">客户编号</label>
  </div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="text" placeholder="请选择客户编号" class="imds-textbox" readonly value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" class="imds-button is-ghost" title="清除">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

需要汇集多个输入组件时，并列多个 Field，或使用 FieldGroup（参阅 [imds-html-field-group.md](imds-html-field-group.md)）。不得嵌套 Field 本身。

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-field | 外层 div | 字段容器 | 必须 |
| imds-field-label | div 元素 | 标签区域 | 必须 |
| imds-field-control | div 元素 | 控件区域 | 必须 |
| is-vertical | imds-field | 垂直布局（标签在上方） | 可选 |
| is-horizontal | imds-field | 水平布局（标签在左侧） | 可选 |
| imds-w-15 | imds-field | 标签宽度 15% | 可选 |
| imds-w-25 | imds-field | 标签宽度 25% | 可选 |
| imds-w-30 | imds-field | 标签宽度 30% | 可选 |
| imds-w-150px | imds-field | 标签宽度 150px | 可选 |
| imds-w-250px | imds-field | 标签宽度 250px | 可选 |
| imds-required-label-required-asterisk | label 元素 | 星号（*）必填标记 | 可选 |
| imds-required-label-required | label 元素 | "必填"文本标记 | 可选 |
| imds-required-label-optional | label 元素 | "可选"文本标记 | 可选 |
| imds-validation-error | imds-field | 验证错误状态 | 可选 |
| imds-help-text | span 元素 | 帮助文本 | 可选 |
| imds-error-text | span 元素 | 错误消息 | 可选 |
| imds-field-container | 外层 div | 纵向排列 Field / FieldGroup 的容器（第 1 层必须） | 必须（放置多个 Field 时） |
| has-divider | imds-field-container | 显示每行的分隔线 | 可选 |
| has-accent-color | imds-field-container | 对标签应用强调色 | 可选 |

## HTML 代码片段

### 基本字段

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label
      data-required-label="default"
      for=":r1:">
      Label
    </label>
  </div>
  <div class="imds-field-control">
    <input
      type="text"
      id=":r1:"
      class="imds-textbox"
      value="" />
  </div>
</div>
```

以下仅显示与基本字段的差异部分。

## 变体

### alignment（布局方向）

在 `div.imds-field` 上添加类。

```html
<div class="imds-field is-vertical">    <!-- 垂直（标签在上方） -->
<div class="imds-field is-horizontal">  <!-- 水平（标签在左侧） -->
```

### labelWidth（标签宽度）

在 `div.imds-field` 上添加类。
水平布局时有效。

```html
<div class="imds-field imds-w-15">     <!-- 15% -->
<div class="imds-field imds-w-25">     <!-- 25% -->
<div class="imds-field imds-w-30">     <!-- 30% -->
<div class="imds-field imds-w-150px">  <!-- 150px -->
<div class="imds-field imds-w-250px">  <!-- 250px -->
```

### required（必填/可选标记）

在 `label` 元素上添加类和 `data-required-label` 属性。

```html
<!-- 星号（*） -->
<label class="imds-required-label-required-asterisk" for=":r1:">Label</label>

<!-- "必填"标记 -->
<label class="imds-required-label-required" for=":r1:" data-required-label="必填">Label</label>

<!-- "可选"标记 -->
<label class="imds-required-label-optional" for=":r1:" data-required-label="可选">Label</label>
```

## 组合示例

### 帮助文本

在 `imds-field` 末尾添加 `imds-help-text`。

```html
<div class="imds-field">
  <!-- 省略 imds-field-label、imds-field-control -->
  <span class="imds-help-text">最多可输入50个半角字母数字字符。</span>
</div>
```

### 验证错误

在 `div.imds-field` 上添加 `imds-validation-error`，并在末尾添加 `imds-error-text`。

```html
<div class="imds-field imds-validation-error">
  <!-- 省略 imds-field-label、imds-field-control -->
  <span class="imds-error-text">在此处显示错误消息。</span>
</div>
```

### 并列多个 Field（用 imds-field-container 包裹）

并列多个 Field / FieldGroup 时，必须用 `imds-field-container` 包裹。不得用通用的 `<div style="display: flex; ...">` 等包裹。

```html
<div class="imds-field-container">
  <div class="imds-field">
    <div class="imds-field-label">
      <label class="imds-required-label-required-asterisk" for=":r9:">Label</label>
    </div>
    <div class="imds-field-control">
      <input type="text" id=":r9:" class="imds-textbox" value="" />
    </div>
  </div>
  <div class="imds-field">
    <div class="imds-field-label"><label for=":ra:">Label</label></div>
    <div class="imds-field-control">
      <input type="text" id=":ra:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

`imds-field-container` 的详细内容（`has-divider` / `has-accent-color` 变体）请参阅下方「Field Container」一节。

## Field Container（imds-field-container）

`imds-field-container` 是用于以适当间距纵向排列多个 Field / FieldGroup 的容器元素。表单内放置在第 1 层的 Field / FieldGroup 组，必须用 `imds-field-container` 包裹。

```html
<div class="imds-field-container">
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r0:">Label 1</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r0:" class="imds-textbox" value="" />
    </div>
  </div>
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r1:">Label 2</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r1:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

### has-divider（行分隔线）

显示按行分隔表单部件的线，以及标签与表单部件之间的分隔线。用于管理员使用的输入项目较多的表单画面。

```html
<div class="imds-field-container has-divider">
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r2:">Label 1</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r2:" class="imds-textbox" value="" />
    </div>
  </div>
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r3:">Label 2</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r3:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

### has-accent-color（强调色）

以点缀色（强调色）显示表单标签的背景色和文字颜色。用于一般用户使用的输入项目较多的表单画面。

```html
<div class="imds-field-container has-accent-color">
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r4:">Label 1</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r4:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

### 响应式支持（小于 768px 时自动纵向堆叠）

放置在 `imds-field-container` 直接下方的 Field，在浏览器视口宽度为 768px 以下时，即使指定了 `is-horizontal`，标签和表单部件也会自动垂直排列。注意第二层及以下的元素，或单独（在 `imds-field-container` 之外）使用 Field 时，不在此自动响应式支持的范围内。

```html
<div class="imds-field-container">
  <div class="imds-field is-horizontal imds-validation-error">
    <div class="imds-field-label">
      <label class="imds-required-label-required-asterisk" for=":rb:">Label</label>
    </div>
    <div class="imds-field-control">
      <input type="text" id=":rb:" class="imds-textbox" value="" />
    </div>
    <span class="imds-help-text">最多可输入50个半角字母数字字符。</span>
    <span class="imds-error-text">在此处显示错误消息。</span>
  </div>
</div>
```

## 实现注意事项

- `label` 的 `for` 属性与 `input` 的 `id` 属性必须匹配（`:r1:` 为占位符）
- `data-required-label="default"` 为默认必填显示（无标记）
- `imds-help-text` 和 `imds-error-text` 放置在 `imds-field-control` 之后
- 添加 `imds-validation-error` 后，输入控件的边框也会变为红色
- **仅放置 1 个输入组件原则**：`imds-field-control` 中仅放置 1 个「单一输入组件」（详情请参阅本文件开头的「Field 中可放置的内容」）
- **field-container 必须原则**：在表单的第 1 层放置多个 Field / FieldGroup 时，必须用 `imds-field-container` 包裹。不要用通用的 `<div style="display: flex; ...">` 等代替
- `imds-field-container` 直接下方的 Field / FieldGroup 在小于 768px 时自动纵向堆叠（详情请参阅「Field Container」一节）
