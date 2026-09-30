---
paths:
  - "src/main/jssp/**/*.html"
---

# Textbox

## 基本信息

Textbox 是用户输入简短文字或单行信息时使用的组件。
需要多行输入时，请使用 Textarea。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-textbox--documentation
- 基础类: imds-textbox

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-textbox | input 元素 | 文本框 | 必须 |
| is-static | imds-textbox | 静态显示（无边框） | 可选 |
| is-x-small | imds-textbox | 超小尺寸 | 可选 |
| is-small | imds-textbox | 小尺寸 | 可选 |
| is-normal | imds-textbox | 标准尺寸 | 可选 |
| is-medium | imds-textbox | 中等尺寸 | 可选 |
| is-large | imds-textbox | 大尺寸 | 可选 |

## HTML 代码片段

### 基本文本框

```html
<input type="text" placeholder="" class="imds-textbox" value="text" />
```

以下各节仅展示与基本文本框的差异。

## 变体

### readonly（只读）

在 `input` 上添加 `readonly` 属性。

```html
<input type="text" placeholder="" class="imds-textbox" value="text" readonly />
```

### disabled（禁用）

在 `input` 上添加 `disabled` 属性。

```html
<input type="text" placeholder="" class="imds-textbox" value="text" disabled />
```

### static（静态显示）

在 `input` 上添加 `is-static` 类和 `readonly` 属性。边框将被隐藏。

```html
<input type="text" placeholder="" class="imds-textbox is-static" value="text" readonly />
```

### size（尺寸）

在 `input.imds-textbox` 上添加尺寸类。

```html
<input type="text" class="imds-textbox is-x-small" />  <!-- 超小 -->
<input type="text" class="imds-textbox is-small" />    <!-- 小 -->
<input type="text" class="imds-textbox is-normal" />   <!-- 标准 -->
<input type="text" class="imds-textbox is-medium" />   <!-- 中 -->
<input type="text" class="imds-textbox is-large" />    <!-- 大 -->
```

## 无障碍支持

### 占位符的使用目的

- 占位符作为帮助用户想象输入内容的提示非常有效
- 但错误使用反而可能导致用户混乱
- 使用占位符时，请注意以下几点

  **占位符不能替代标签**
  - 占位符在用户输入后会消失，用户无法再确认该字段的含义
  - 因此，需要适当区分使用标签（明确输入项含义）和占位符（提供输入提示）

  **仅限用作简洁提示**
  - 占位符用于简洁地展示输入格式或示例
  - 详细说明和输入注意事项通过 Field 的帮助文字提供，而非占位符

  **不用于需要记忆的信息**
  - 占位符在用户开始输入操作后将不可见
  - 因此，不用于重要信息或用户需要记住的信息

## 实现注意事项

- 文本框使用 `input[type="text"].imds-textbox` 编写
- `is-static` 与 `readonly` 组合使用（只读静态显示）
- `readonly` 与 `disabled` 互斥使用（不可同时添加）
- 在输入表单中使用时，用 Field（`imds-field`）进行包裹
