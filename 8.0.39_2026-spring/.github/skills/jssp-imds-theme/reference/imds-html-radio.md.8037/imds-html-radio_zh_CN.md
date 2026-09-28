---
paths:
  - "src/main/jssp/**/*.html"
---

# Radio

## 基本信息

Radio 是从选项中选择一个项目时使用的组件。
与 Checkbox 不同，必须始终选择一个项目。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-radio--documentation
- 基础类: imds-radio

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-radio | label 元素 | 单选按钮容器 | 必须 |
| is-x-small | imds-radio | 超小尺寸 | 可选 |
| is-small | imds-radio | 小尺寸 | 可选 |
| is-normal | imds-radio | 标准尺寸 | 可选 |
| is-medium | imds-radio | 中等尺寸 | 可选 |
| is-large | imds-radio | 大尺寸 | 可选 |

## HTML 代码片段

### 基本单选按钮

```html
<label class="imds-radio">
  <input type="radio" value="" />
  <span>Label</span>
</label>
```

以下各节仅展示与基本单选按钮的差异。

## 变体

### disabled（禁用）

在 `input` 上添加 `disabled` 属性。

```html
<input type="radio" value="" disabled />
```

### checked（已选中）

在 `input` 上添加 `checked` 属性。

```html
<input type="radio" value="" checked />
```

### size（尺寸）

在 `label.imds-radio` 上添加尺寸类。

```html
<label class="imds-radio is-x-small">  <!-- 超小 -->
<label class="imds-radio is-small">    <!-- 小 -->
<label class="imds-radio is-normal">   <!-- 标准 -->
<label class="imds-radio is-medium">   <!-- 中 -->
<label class="imds-radio is-large">    <!-- 大 -->
```

## 无障碍支持

- 同一组的单选按钮须使用相同的 `name` 属性，以实现互斥选择
- 标签文字应清晰反映各选项的内容

## 实现注意事项

- 单选按钮使用 `label.imds-radio > input[type="radio"] + span` 的结构编写
- 同一组的单选按钮须设置相同的 `name` 属性
- `disabled` 与 `checked` 可以组合使用（如已选中且禁用等）
- 分组多个单选按钮时，使用 RadioGroup
