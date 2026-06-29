---
paths:
  - "src/main/jssp/**/*.html"
---

# TextboxControl

## 基本信息

TextboxControl 是在文本框内放置图标时使用的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-textboxcontrol--documentation
- 基础类: imds-textbox-control

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-textbox-control | div 元素 | 文本框控件容器 | 必须 |
| is-left | imds-textbox-control | 图标放置在左侧 | 可选 |
| is-right | imds-textbox-control | 图标放置在右侧（默认） | 可选 |

## HTML 代码片段

### 基本文本框控件

```html
<div class="imds-textbox-control">
  <input type="text" class="imds-textbox" value="" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

以下各节仅展示与基本文本框控件的差异。

## 变体

### iconPosition（图标位置）

在 `div.imds-textbox-control` 上添加位置类。

```html
<div class="imds-textbox-control is-left">   <!-- 图标左 -->
<div class="imds-textbox-control is-right">  <!-- 图标右 -->
```

## 组合示例

### 简单搜索字段

```html
<div class="imds-textbox-control is-left">
  <input type="search" class="imds-textbox" value="" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

### 搜索图标 + 清除按钮

在 Field 内放置文本框控件和清除按钮。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">分类</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="text" placeholder="选择分类" class="imds-textbox" readonly value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

### 组合框（自由输入 + 选项显示）

与 Popover 组合实现下拉选择。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">分类</label></div>
  <div class="imds-field-control">
    <div class="imds-popover">
      <div class="imds-textbox-control">
        <input type="text" placeholder="选择分类" class="imds-textbox" readonly value="" />
        <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
      </div>
      <div id="imds-popover-todo-replace-:r1:" role="menu" class="imds-popover-menu">
        <div class="imds-popover-content">contents</div>
      </div>
    </div>
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

### 验证错误

在 `div.imds-field` 上添加 `imds-validation-error`，并在末尾追加错误消息。
适用于搜索图标型和组合框型。

```html
<div class="imds-field imds-validation-error">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="text" class="imds-textbox" readonly value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
  <span class="imds-error-text">在此处显示错误消息。</span>
</div>
```

## 无障碍支持

- 图标用于装饰目的，操作的含义通过标签或占位符传达

## 实现注意事项

- 文本框控件使用 `div.imds-textbox-control > input.imds-textbox + span.imds-icon` 的结构编写
- 图标位置默认为右侧（可省略 `is-right`）
- 清除按钮在 `imds-field-control` 内与 `imds-textbox-control` 并列放置
- 组合框是用 Popover（`imds-popover`）包裹 `imds-textbox-control`
- 验证错误时，在 `imds-field` 上添加 `imds-validation-error`，并用 `imds-error-text` 显示消息
