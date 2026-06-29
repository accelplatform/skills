---
paths:
  - "src/main/jssp/**/*.html"
---

# Select

## 基本信息

Select 是从选项中选择一个项目时使用的组件。
选项较少或空间充足时，请使用可以一览所有项目的 Radio。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-select--documentation
- 基础类: imds-select

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-select | select 元素 | 下拉选择框 | 必须 |
| is-x-small | imds-select | 超小尺寸 | 可选 |
| is-small | imds-select | 小尺寸 | 可选 |
| is-normal | imds-select | 标准尺寸 | 可选 |
| is-medium | imds-select | 中等尺寸 | 可选 |
| is-large | imds-select | 大尺寸 | 可选 |

## HTML 代码片段

### 基本下拉选择框

```html
<select class="imds-select">
  <option>Select-1</option>
  <option>Select-2</option>
  <option>Select-3</option>
</select>
```

以下各节仅展示与基本下拉选择框的差异。

## 变体

### disabled（禁用）

在 `select` 上添加 `disabled` 属性。

```html
<select class="imds-select" disabled>
```

### size（尺寸）

在 `select.imds-select` 上添加尺寸类。

```html
<select class="imds-select is-x-small">  <!-- 超小 -->
<select class="imds-select is-small">    <!-- 小 -->
<select class="imds-select is-normal">   <!-- 标准 -->
<select class="imds-select is-medium">   <!-- 中 -->
<select class="imds-select is-large">    <!-- 大 -->
```

### multiple（多选）

在 `select` 上添加 `multiple` 属性。

```html
<select class="imds-select" multiple>
```

## 无障碍支持

- 初始值在用户未进行更改时使用，因此请指定最常被选择的项目或推荐项目

## 实现注意事项

- 下拉选择框使用 `select.imds-select > option` 的结构编写
- `disabled` 添加到 `select` 元素上（也可添加到单个 `option` 元素上）
- 使用 `multiple` 时将显示为列表，可选择多个项目
- 在输入表单中使用时，用 Field（`imds-field`）进行包裹
