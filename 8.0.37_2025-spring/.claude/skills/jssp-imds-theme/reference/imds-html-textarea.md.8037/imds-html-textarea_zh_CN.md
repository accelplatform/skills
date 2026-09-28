---
paths:
  - "src/main/jssp/**/*.html"
---

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

## 无障碍支持

- 使用 `placeholder` 显示输入示例时，不可将其作为标签的替代品，须单独设置标签

## 实现注意事项

- 文本区域使用 `textarea.imds-textarea` 编写
- `readonly` 与 `disabled` 互斥使用（不可同时添加）
- 在输入表单中使用时，用 Field（`imds-field`）进行包裹
- 根据需要通过 `rows` 属性控制显示行数
