# Message

## 基本信息

Message 是向用户展示希望阅读的信息的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-message-message--documentation
- 基础类: imds-message

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-message | div 元素 | 消息容器 | 必须 |
| imds-message-title | div 元素 | 标题区域（图标 + 文字） | 必须 |
| imds-message-content | div 元素 | 消息正文 | 可选 |
| is-outlined | imds-message | 轮廓样式 | 可选 |
| is-borderless | imds-message | 无边框样式 | 可选 |
| is-info | imds-message | 信息（蓝色） | 可选 |
| is-warning | imds-message | 警告（黄色） | 可选 |
| is-danger | imds-message | 危险（红色） | 可选 |
| is-success | imds-message | 成功（绿色） | 可选 |
| is-error | imds-message | 错误（红色） | 可选 |
| is-x-small | imds-message | 超小尺寸 | 可选 |
| is-small | imds-message | 小尺寸 | 可选 |
| is-normal | imds-message | 标准尺寸（默认） | 可选 |
| is-medium | imds-message | 中等尺寸 | 可选 |
| is-large | imds-message | 大尺寸 | 可选 |
| imds-message-content-only | imds-message | 仅显示详情（`imds-message-content`）。不使用 `imds-message-title`，直接放置图标和正文 | 可选 |

## HTML 代码片段

### 基本消息

```html
<div class="imds-message">
  <div class="imds-message-title">
    <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
    <p>关于缓存</p>
  </div>
  <div class="imds-message-content">
    <p>缓存了 IM-Repository 中使用的枚举类型、字典项目、实体等信息。</p>
  </div>
</div>
```

以下各节仅展示与基本消息的差异。

## 变体

### style（样式）

在 `div.imds-message` 上添加样式类。

```html
<div class="imds-message is-outlined">    <!-- 轮廓 -->
<div class="imds-message is-borderless">  <!-- 无边框 -->
```

### color（颜色）

在 `div.imds-message` 上添加颜色类。
根据颜色更换图标。

```html
<div class="imds-message is-info">     <!-- 信息: fa-circle-info -->
<div class="imds-message is-warning">  <!-- 警告: fa-triangle-exclamation -->
<div class="imds-message is-danger">   <!-- 危险: fa-triangle-exclamation -->
<div class="imds-message is-success">  <!-- 成功: fa-circle-check -->
<div class="imds-message is-error">    <!-- 错误: fa-circle-xmark -->
```

### 仅标题（无正文）

省略 `imds-message-content`。

```html
<div class="imds-message is-success">
  <div class="imds-message-title">
    <span class="imds-icon is-medium"><i class="fa-solid fa-circle-check"></i></span>
    <p>实体与表格信息一致。</p>
  </div>
</div>
```

### 无图标（No Icon）

省略 `imds-message-title` 内的 `span.imds-icon`。用于不需要图标或希望简化外观的场景。与 `imds-message-content-only` 组合时，连同容器正下方的图标一起省略。

```html
<div class="imds-message">
  <div class="imds-message-title"><p>关于缓存</p></div>
  <div class="imds-message-content">
    <p>缓存了 IM-Repository 中使用的枚举类型、字典项目、实体等信息。</p>
  </div>
</div>
```

仅标题且无图标时:

```html
<div class="imds-message">
  <div class="imds-message-title"><p>关于缓存</p></div>
</div>
```

### 仅详情（Content Only）

用于正文内容比标题更重要，或希望在长文本中节省空间的场景。在 `div.imds-message` 上添加 `imds-message-content-only`，不使用 `imds-message-title`，直接放置图标和 `imds-message-content`。

```html
<div class="imds-message imds-message-content-only">
  <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
  <div class="imds-message-content"><p>定义用于创建基于 IM-BloomMaker 的应用画面的信息。</p></div>
</div>
```

同时省略图标时:

```html
<div class="imds-message imds-message-content-only">
  <div class="imds-message-content">
    <p>缓存了 IM-Repository 中使用的枚举类型、字典项目、实体等信息。</p>
  </div>
</div>
```

### size（尺寸）

在 `div.imds-message` 上添加尺寸类。通常使用 `is-normal`（默认），按需选择。

```html
<div class="imds-message is-x-small">  <!-- 超小 -->
<div class="imds-message is-small">    <!-- 小 -->
<div class="imds-message is-normal">   <!-- 标准（默认） -->
<div class="imds-message is-medium">   <!-- 中 -->
<div class="imds-message is-large">    <!-- 大 -->
```

### 在正文中使用列表

在 `imds-message-content` 内放置 `<ul>`。

```html
<div class="imds-message-content">
  <ul>
    <li>注意事项1</li>
    <li>注意事项2</li>
  </ul>
</div>
```

## 实现注意事项

- 根据颜色类使用对应的图标（参见上方 color 部分）
- `imds-message-content` 可省略。仅标题即可传达信息时可省略正文
- `is-outlined` 与 `is-borderless` 互斥使用（不可同时添加）
- 正文内可自由组合 `<p>` 和 `<ul>`
- 使用 `imds-message-content-only` 时不使用 `imds-message-title`，将图标（`span.imds-icon`，可省略）和 `imds-message-content` 并列放置在 `imds-message` 正下方
