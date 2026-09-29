# InlineMessage

## 基本信息

InlineMessage 是以内联方式展示您希望用户阅读的信息的组件。
关于 Message 的通用用法和注意事项，请参阅相关文档。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-message-inlinemessage--documentation
- 基础类: imds-inline-message

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-inline-message | div 元素 | 内联消息容器 | 必须 |
| is-outlined | imds-inline-message | 轮廓样式 | 可选 |
| is-borderless | imds-inline-message | 无边框样式 | 可选 |
| is-info | imds-inline-message | 信息（蓝色） | 可选 |
| is-warning | imds-inline-message | 警告（黄色） | 可选 |
| is-danger | imds-inline-message | 危险（红色） | 可选 |
| is-success | imds-inline-message | 成功（绿色） | 可选 |
| is-error | imds-inline-message | 错误（红色） | 可选 |
| is-x-small | imds-inline-message | 超小尺寸 | 可选 |
| is-small | imds-inline-message | 小尺寸 | 可选 |
| is-normal | imds-inline-message | 标准尺寸 | 可选 |
| is-medium | imds-inline-message | 中等尺寸 | 可选 |
| is-large | imds-inline-message | 大尺寸 | 可选 |

## HTML 代码片段

### 基本内联消息

```html
<div class="imds-inline-message">
  <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
  <p>通过拖放对日程显示集进行排序。</p>
</div>
```

以下仅显示与基本内联消息的差异部分。

## 变体

### color（颜色）

在 `div.imds-inline-message` 上添加颜色类。
根据颜色同步更改图标。

```html
<div class="imds-inline-message is-info">     <!-- 信息: fa-circle-info -->
<div class="imds-inline-message is-warning">  <!-- 警告: fa-triangle-exclamation -->
<div class="imds-inline-message is-danger">   <!-- 危险: fa-triangle-exclamation -->
<div class="imds-inline-message is-success">  <!-- 成功: fa-circle-check -->
<div class="imds-inline-message is-error">    <!-- 错误: fa-circle-xmark -->
```

### messageStyle（样式）

在 `div.imds-inline-message` 上添加样式类。

```html
<div class="imds-inline-message is-outlined">    <!-- 轮廓 -->
<div class="imds-inline-message is-borderless">  <!-- 无边框 -->
```

### size（尺寸）

在 `div.imds-inline-message` 上添加尺寸类。

```html
<div class="imds-inline-message is-x-small">  <!-- 超小 -->
<div class="imds-inline-message is-small">    <!-- 小 -->
<div class="imds-inline-message is-normal">   <!-- 标准 -->
<div class="imds-inline-message is-medium">   <!-- 中 -->
<div class="imds-inline-message is-large">    <!-- 大 -->
```

## 实现注意事项

- InlineMessage 是不使用 `imds-message-title` / `imds-message-content`，直接放置图标和文本的简单结构
- 根据颜色类使用适当的图标（参见上面的颜色部分）
- `is-outlined` 和 `is-borderless` 互斥使用（不同时添加）
- 适用于紧凑场景，例如在表单输入框正下方显示验证消息
