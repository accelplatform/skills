# CollapseMessage

## 基本信息

CollapseMessage 是始终显示标题、同时将详细信息折叠起来的组件，适用于您希望用户阅读的信息。
关于 Message 的通用用法和注意事项，请参阅相关文档。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-message-collapsemessage--documentation
- 基础类: imds-collapse-message

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-collapse-message | div 元素 | 折叠消息容器 | 必须 |
| imds-message-title | div 元素 | 标题区域（图标 + 文本） | 必须 |
| imds-message-content | div 元素 | 折叠内容 | 必须 |
| imds-collapse-message-chevron | span 元素 | 开关折叠图标 | 必须 |
| is-outlined | imds-collapse-message | 轮廓样式 | 可选 |
| is-borderless | imds-collapse-message | 无边框样式 | 可选 |
| is-info | imds-collapse-message | 信息（蓝色） | 可选 |
| is-warning | imds-collapse-message | 警告（黄色） | 可选 |
| is-danger | imds-collapse-message | 危险（红色） | 可选 |
| is-success | imds-collapse-message | 成功（绿色） | 可选 |
| is-error | imds-collapse-message | 错误（红色） | 可选 |
| is-x-small | imds-collapse-message | 超小尺寸 | 可选 |
| is-small | imds-collapse-message | 小尺寸 | 可选 |
| is-normal | imds-collapse-message | 标准尺寸 | 可选 |
| is-medium | imds-collapse-message | 中等尺寸 | 可选 |
| is-large | imds-collapse-message | 大尺寸 | 可选 |

## HTML 代码片段

### 基本折叠消息

```html
<div class="imds-collapse-message">
  <input
    type="checkbox"
    id="todo-replace-:r1:" />
  <label for="todo-replace-:r1:">
    <div class="imds-message-title">
      <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
      <p>配置通知功能和方法。</p>
    </div>
    <span class="imds-icon imds-collapse-message-chevron"><i class="fa-solid fa-chevron-down"></i></span>
  </label>
  <div class="imds-message-content">
    <ul>
      <li>在消息通知设置中，为各功能配置接收通知的媒介。</li>
      <li>在常规通知设置中，配置接收常规通知的电子邮件地址。</li>
    </ul>
  </div>
</div>
```

以下仅显示与基本折叠消息的差异部分。

## 变体

### color（颜色）

在 `div.imds-collapse-message` 上添加颜色类。
根据颜色同步更改图标。

```html
<div class="imds-collapse-message is-info">     <!-- 信息: fa-circle-info -->
<div class="imds-collapse-message is-warning">  <!-- 警告: fa-triangle-exclamation -->
<div class="imds-collapse-message is-danger">   <!-- 危险: fa-triangle-exclamation -->
<div class="imds-collapse-message is-success">  <!-- 成功: fa-circle-check -->
<div class="imds-collapse-message is-error">    <!-- 错误: fa-circle-xmark -->
```

### messageStyle（样式）

在 `div.imds-collapse-message` 上添加样式类。

```html
<div class="imds-collapse-message is-outlined">    <!-- 轮廓 -->
<div class="imds-collapse-message is-borderless">  <!-- 无边框 -->
```

### size（尺寸）

在 `div.imds-collapse-message` 上添加尺寸类。

```html
<div class="imds-collapse-message is-x-small">  <!-- 超小 -->
<div class="imds-collapse-message is-small">    <!-- 小 -->
<div class="imds-collapse-message is-normal">   <!-- 标准 -->
<div class="imds-collapse-message is-medium">   <!-- 中 -->
<div class="imds-collapse-message is-large">    <!-- 大 -->
```

## 实现注意事项

- 开关通过 `input[type="checkbox"]` 与 `label` 的配合仅用 CSS 控制（不需要 JavaScript）
- 将 `input` 的 `id` 和 `label` 的 `for` 替换为唯一值（`todo-replace-:r1:` 为占位符）
- 根据颜色类使用适当的图标（参见上面的颜色部分）
- `is-outlined` 和 `is-borderless` 互斥使用（不同时添加）
- `imds-message-title` 和 `imds-message-content` 的类名与 Message / BannerMessage 组件共用
