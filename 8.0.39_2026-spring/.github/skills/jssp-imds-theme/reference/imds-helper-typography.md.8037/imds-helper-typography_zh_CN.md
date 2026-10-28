---
paths:
  - "src/main/jssp/**/*.html"
---

# Typography（文字表现工具类）

## 基本信息

Typography 是除字体大小、粗细、样式等属性外，还通过 `text-align` 或 `text-transform` 控制文本外观与位置的 imds 辅助类组。它们是 imds 的工具类，与 `imds-textbox` 或 `imds-heading` 等组件专用类组合使用。不作为独立组件使用。

- 提取来源: `uiux-share/helper/Typography.md`

## CSS Classes Reference

| 类名 | 用途 | 值（Property: Value） |
|----------|------|----------------------|
| `is-capitalized` | 仅将首字母转换为大写 | `text-transform: capitalize;` |
| `is-lowercase` | 转换为小写 | `text-transform: lowercase;` |
| `is-uppercase` | 转换为大写 | `text-transform: uppercase;` |
| `is-italic` | 设为斜体 | `font-style: italic;` |
| `is-underlined` | 添加下划线 | `text-decoration: underline;` |
| `has-text-weight-normal` | 标准粗细 | `font-weight: 400;` |
| `has-text-weight-bold` | 粗体 | `font-weight: 700;` |
| `has-text-centered` | 居中对齐 | `text-align: center;` |
| `has-text-justified` | 两端对齐 | `text-align: justify;` |
| `has-text-start` | 起始位置对齐 | `text-align: start;` |
| `has-text-end` | 结束位置对齐 | `text-align: end;` |

## 使用示例

### 购买金额输入框（右对齐）

为 Textbox 添加 `has-text-end`，使输入值右对齐。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for=":r0:">购买金额</label></div>
  <div class="imds-field-control">
    <input
      type="text"
      id=":r0:"
      placeholder="0"
      class="imds-textbox has-text-end"
      value="" />
  </div>
</div>
```

### 以粗体强调

```html
<span class="has-text-weight-bold">重要事项</span>
```

### 居中对齐的标题

```html
<h2 class="imds-heading is-size-4 has-text-centered">区块标题</h2>
```

## 实现注意事项

- 为同一元素添加多个 Typography 类可能导致冲突或意外显示，因此应控制在必要的最小限度。
- `has-text-weight-*` 的外观因字体而异，应确认在主要字体下的显示。
- `is-capitalized` / `is-lowercase` / `is-uppercase` 仅对字母有效，避免用于日文文本。
- `is-italic` 在某些字体下不生效，在不具备斜体字形的字体（Meiryo 等）中没有效果，因此应确认在主要字体下的显示。对于长文本或日文文本会降低可读性，因此应尽量少用。
