---
paths:
  - "src/main/jssp/**/*.html"
---

# Toggle

## 基本信息

Toggle 是用于切换开/关状态的组件。
仅在更改立即生效的情况下使用。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-toggle--documentation
- 基础类: imds-toggle-switch

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-toggle-switch | label 元素 | 切换开关容器 | 必须 |
| imds-toggle-switch-appearance | span 元素 | 开关外观 | 必须 |
| imds-toggle-switch-text | span 元素 | 标签文字 | 必须 |
| is-x-small | imds-toggle-switch | 超小尺寸 | 可选 |
| is-small | imds-toggle-switch | 小尺寸 | 可选 |
| is-normal | imds-toggle-switch | 标准尺寸 | 可选 |
| is-medium | imds-toggle-switch | 中等尺寸 | 可选 |
| is-large | imds-toggle-switch | 大尺寸 | 可选 |

## HTML 代码片段

### 基本切换开关

```html
<label class="imds-toggle-switch">
  <input type="checkbox" />
  <span class="imds-toggle-switch-appearance">
    <span class="imds-icon"><i class="fa-solid fa-check"></i></span>
  </span>
  <span class="imds-toggle-switch-text">Label</span>
</label>
```

以下各节仅展示与基本切换开关的差异。

## 变体

### size（尺寸）

在 `label.imds-toggle-switch` 上添加尺寸类。

```html
<label class="imds-toggle-switch is-x-small">  <!-- 超小 -->
<label class="imds-toggle-switch is-small">    <!-- 小 -->
<label class="imds-toggle-switch is-normal">   <!-- 标准 -->
<label class="imds-toggle-switch is-medium">   <!-- 中 -->
<label class="imds-toggle-switch is-large">    <!-- 大 -->
```

### disabled（禁用）

在 `input` 上添加 `disabled` 属性。

```html
<input type="checkbox" disabled />
```

### checked（开启状态）

在 `input` 上添加 `checked` 属性。

```html
<input type="checkbox" checked />
```

## 无障碍支持

### 标签

- 切换开关的标签应清楚说明开启时「什么」「会怎样」

  **好的模式**：启用两步验证
  **不好的模式**：两步验证

- 标签不随开关状态变化，始终显示相同内容。标签变化会让用户难以判断是表示状态还是表示操作

  **好的模式**：启用两步验证
  **不好的模式**：禁用两步验证

## 实现注意事项

- 切换开关使用 `label > input[type="checkbox"] + span.imds-toggle-switch-appearance + span.imds-toggle-switch-text` 的结构编写
- `imds-toggle-switch-appearance` 内包含勾选图标（`fa-solid fa-check`）
- 开/关状态通过 `input` 的 `checked` 属性控制
- `disabled` 与 `checked` 可以组合使用（如开启状态且禁用等）
- 标签文字不随开关状态变化
