---
paths:
  - "src/main/jssp/**/*.html"
---

# Checkbox

## 基本信息

Checkbox 是从选项列表中选择项目时使用的组件。
与 Radio 不同，不是必选项。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-checkbox--documentation
- 基础类: imds-checkbox

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-checkbox | label 元素 | 复选框容器 | 必须 |
| is-x-small | imds-checkbox | 超小尺寸 | 可选 |
| is-small | imds-checkbox | 小尺寸 | 可选 |
| is-normal | imds-checkbox | 标准尺寸 | 可选 |
| is-medium | imds-checkbox | 中等尺寸 | 可选 |
| is-large | imds-checkbox | 大尺寸 | 可选 |

## HTML 代码片段

### 基本复选框

```html
<label class="imds-checkbox">
  <input type="checkbox" />
  <span>Label</span>
</label>
```

以下仅显示与基本复选框的差异部分。

## 变体

### disabled

在 `input` 上添加 `disabled` 属性。

```html
<input type="checkbox" disabled />
```

### checked（已选中状态）

在 `input` 上添加 `checked` 属性。

```html
<input type="checkbox" checked />
```

### size（尺寸）

在 `label.imds-checkbox` 上添加尺寸类。

```html
<label class="imds-checkbox is-x-small">  <!-- 超小 -->
<label class="imds-checkbox is-small">    <!-- 小 -->
<label class="imds-checkbox is-normal">   <!-- 标准 -->
<label class="imds-checkbox is-medium">   <!-- 中 -->
<label class="imds-checkbox is-large">    <!-- 大 -->
```

## 无障碍支持

- 通过用 `label` 元素包裹 `input` 来建立关联
- 标签文本应清晰传达选项内容

## 实现注意事项

- 复选框使用 `label.imds-checkbox > input[type="checkbox"] + span` 结构编写
- `disabled` 和 `checked` 可以组合使用（例如：已选中且禁用）
- 将多个复选框分组时，使用 `fieldset` 和 `legend`
- 通过 JavaScript 控制选中状态的变化
