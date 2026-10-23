# Textarea

## 基本信息

Textbox 是用户输入简短文字或单行信息时使用的组件。
需要多行输入时，请使用 Textarea。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-textarea--documentation
- 基础类: imds-textarea

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-textarea | textarea 元素 | 文本区域 | 必须 |
| is-static | imds-textarea | 仅供查看的静态显示状态（与 `readonly` 并用） | 可选 |
| is-x-small | imds-textarea | 超小尺寸 | 可选 |
| is-small | imds-textarea | 小尺寸 | 可选 |
| is-normal | imds-textarea | 标准尺寸 | 可选 |
| is-medium | imds-textarea | 中等尺寸 | 可选 |
| is-large | imds-textarea | 大尺寸 | 可选 |

## HTML 代码片段

### 基本文本区域

```html
<textarea class="imds-textarea">text</textarea>
```

以下各节仅展示与基本文本区域的差异。

## 变体

### readonly（只读）

在 `textarea` 上添加 `readonly` 属性。

```html
<textarea class="imds-textarea" readonly>text</textarea>
```

### disabled（禁用）

在 `textarea` 上添加 `disabled` 属性。

```html
<textarea class="imds-textarea" disabled>text</textarea>
```

### is-static（仅供查看的静态显示）

不可编辑值，但可以选择和复制值的仅供查看状态。与 `readonly` 属性并用。外观与普通的 `readonly`（参见变体）不同，更强调「仅供查看」的显示。

```html
<textarea class="imds-textarea is-static" readonly>text</textarea>
```

### size（尺寸）

在 `textarea.imds-textarea` 上添加尺寸类。

```html
<textarea class="imds-textarea is-x-small">text</textarea>  <!-- 超小 -->
<textarea class="imds-textarea is-small">text</textarea>    <!-- 小 -->
<textarea class="imds-textarea is-normal">text</textarea>   <!-- 标准 -->
<textarea class="imds-textarea is-medium">text</textarea>   <!-- 中 -->
<textarea class="imds-textarea is-large">text</textarea>    <!-- 大 -->
```

## 无障碍支持

- 使用 `placeholder` 显示输入示例时，不可将其作为标签的替代品，须单独设置标签

## 实现注意事项

- 文本区域使用 `textarea.imds-textarea` 编写
- `readonly` 与 `disabled` 互斥使用（不可同时添加）
- `is-static` 须与 `readonly` 一起使用（与仅使用 `readonly` 时的显示不同）
- 在输入表单中使用时，用 Field（`imds-field`）进行包裹
- 根据需要通过 `rows` 属性控制显示行数
