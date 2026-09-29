---
paths:
  - "src/main/jssp/**/*.html"
---

# BannerMessage

## 基本信息

BannerMessage 是在页面或特定区域顶部展示页面内容相关信息的组件。
关于 Message 的通用用法和注意事项，请参阅相关文档。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-message-bannermessage--documentation
- 基础类: imds-banner-message

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-banner-message | div 元素 | 横幅消息容器 | 必须 |
| imds-message-title | div 元素 | 标题区域（图标 + 文本） | 可选 |
| imds-message-content | div 元素 | 消息正文 | 可选 |
| imds-message-content-only | imds-banner-message | 仅显示内容（无标题） | 可选 |
| is-info | imds-banner-message | 信息（蓝色） | 可选 |
| is-warning | imds-banner-message | 警告（黄色） | 可选 |
| is-danger | imds-banner-message | 危险（红色） | 可选 |
| is-success | imds-banner-message | 成功（绿色） | 可选 |
| is-error | imds-banner-message | 错误（红色） | 可选 |

## HTML 代码片段

### 基本横幅消息

```html
<div class="imds-banner-message">
  <div class="imds-message-title">
    <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
    <p>新建应用程序</p>
  </div>
  <div class="imds-message-content">
    <p>将多个资产合并注册为一个应用程序。</p>
    <p>请输入要创建的应用程序信息。</p>
  </div>
</div>
```

以下仅显示与基本横幅消息的差异部分。

## 变体

### color（颜色）

在 `div.imds-banner-message` 上添加颜色类。
根据颜色同步更改图标。

```html
<div class="imds-banner-message is-info">     <!-- 信息: fa-circle-info -->
<div class="imds-banner-message is-warning">  <!-- 警告: fa-triangle-exclamation -->
<div class="imds-banner-message is-danger">   <!-- 危险: fa-triangle-exclamation -->
<div class="imds-banner-message is-success">  <!-- 成功: fa-circle-check -->
<div class="imds-banner-message is-error">    <!-- 错误: fa-circle-xmark -->
```

### pattern（显示模式）

#### title-only（仅标题）

省略 `imds-message-content`。

```html
<div class="imds-banner-message">
  <div class="imds-message-title">
    <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
    <p>新建应用程序</p>
  </div>
</div>
```

#### content-only（仅内容）

添加 `imds-message-content-only`，省略 `imds-message-title`。将图标直接放置在 `imds-message-content` 前面。

```html
<div class="imds-banner-message imds-message-content-only">
  <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
  <div class="imds-message-content">
    <p>将多个资产合并注册为一个应用程序。</p>
  </div>
</div>
```

## 组合示例

### 与 Header 的组合

在画面上部的 `header.imds-header` 之后紧接着放置 `imds-banner-message`，用于在页头正下方通知与整个画面相关的错误、警告等信息。

```html
<div>
  <header class="imds-header">
    <div class="imds-header-back-button">
      <button type="button" class="imds-button is-ghost is-large">
        <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
      </button>
    </div>
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-diagram-project"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p>应用程序管理</p>
      <h1>应用程序名称 - 资源关联图</h1>
    </div>
    <div class="imds-header-reload-button">
      <button type="button" class="imds-button is-ghost is-large" title="刷新页面">
        <span class="imds-icon is-small"><i class="fa-solid fa-rotate-right"></i></span>
      </button>
    </div>
  </header>
  <div class="imds-banner-message is-error">
    <div class="imds-message-title">
      <span class="imds-icon"><i class="fa-solid fa-circle-xmark"></i></span>
      <p>正在使用不存在的资源。</p>
    </div>
  </div>
</div>
```

## 实现注意事项

- 根据颜色类使用适当的图标（参见上面的颜色部分）
- `imds-message-title` 和 `imds-message-content` 的类名与 Message 组件共用
- `content-only` 模式结构不同（不使用 `imds-message-title`，直接放置图标）
- BannerMessage 适用于固定在页面顶部的场景。普通内联显示请使用 Message
