# EmptyState

## 基本信息

EmptyState 是用户首次打开应用程序时，在不存在内容的情况下显示的组件。
放置对当前状态的简洁说明，以及促使用户采取下一步行动的消息或按钮。

**设计原则（DESIGN.md）**: EmptyState 是中立的占位内容，不使用 severity 颜色（error/success/warning/info）。图标以 `is-gray-light` 的中立色调显示。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-emptystate--documentation
- 基础类: imds-empty-state

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-empty-state-container | div 元素 | EmptyState 整体容器 | 必须 |
| imds-empty-state | div 元素 | EmptyState 本体（添加尺寸、对齐类） | 必须 |
| imds-empty-state-message-wrapper | div 元素 | 图标 + 消息的包装器 | 必须 |
| imds-empty-state-icon | span 元素 | 图标的包装器 | 可选（可省略） |
| imds-empty-state-message | div 元素 | 消息（标题 + 详细）的包装器 | 必须 |
| imds-empty-state-message-title | p 元素 | 状态的简洁说明（标题） | 必须 |
| imds-empty-state-message-content | p 元素 | 促使下一步行动的详细消息 | 可选（is-x-small/is-small 中不可使用） |
| imds-empty-state-content | div 元素 | 操作按钮的包装器 | 可选（is-x-small/is-small 中不可使用） |
| is-x-small | imds-empty-state | 超小尺寸（用于 Popover 等狭窄区域） | 可选 |
| is-small | imds-empty-state | 小尺寸（用于 Table 或右侧窗格等狭窄区域） | 可选 |
| is-medium | imds-empty-state | 中等尺寸（用于 Dialog 等较宽区域） | 可选 |
| is-large | imds-empty-state | 大尺寸（默认。用于整个窗口、页面） | 可选 |
| is-vertical | imds-empty-state | 元素垂直方向对齐 | 可选 |
| is-horizontal | imds-empty-state | 元素水平方向对齐 | 可选 |

## HTML 代码片段

### 基本形式（相当于 is-large）

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state">
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message">
        <p class="imds-empty-state-message-title">尚未创建应用程序</p>
        <p class="imds-empty-state-message-content">请通过新建按钮创建应用程序。</p>
      </div>
    </div>
    <div class="imds-empty-state-content imds-mt-7">
      <button type="button" class="imds-button is-large is-primary">
        新建应用程序
      </button>
    </div>
  </div>
</div>
```

以下仅显示与基本形式的差异部分。

## 变体

### 图标

原则上以 `is-gray-light` 色调使用“info”图标（`fa-circle-info`）。其他可用图标请参考 icon-font（imds-html-icon-font.md）。不要为图标添加 severity 颜色（`is-danger`、`is-warning`、`is-success` 等）。

### size（尺寸）

在 `imds-empty-state` 上添加尺寸类。通常使用 `is-large`（默认），并根据使用位置进行选择。

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state is-x-small">   <!-- 超小: Popover 等狭窄区域 -->
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message"><p class="imds-empty-state-message-title">未设置处理。</p></div>
    </div>
  </div>
</div>
```

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state is-small">     <!-- 小: Table 或右侧窗格等狭窄区域 -->
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message"><p class="imds-empty-state-message-title">不存在实体项目。请通过“编辑实体项目”按钮添加。</p></div>
    </div>
  </div>
</div>
```

`is-x-small` / `is-small` 中不可使用 `imds-empty-state-message-content`（详细消息）和 `imds-empty-state-content`（操作按钮）。仅显示标题。

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state is-medium">    <!-- 中: Dialog 等较宽区域 -->
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message">
        <p class="imds-empty-state-message-title">没有以此实体为引用目标的实体。</p>
      </div>
    </div>
  </div>
</div>
```

`is-medium` / `is-large` 可根据需要显示消息和操作按钮。

### 放置在 Table 内的情况（is-small）

```html
<div class="imds-table is-bordered is-area-bordered">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th><span>主键</span></th>
          <th><span>必须</span></th>
          <th><span>ID</span></th>
          <th><span>实体项目</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="4">
            <div class="imds-empty-state-container">
              <div class="imds-empty-state is-small">
                <div class="imds-empty-state-message-wrapper">
                  <span class="imds-empty-state-icon">
                    <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
                  </span>
                  <div class="imds-empty-state-message"><p class="imds-empty-state-message-title">不存在实体项目。请通过“编辑实体项目”按钮添加。</p></div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### alignment（对齐）

```html
<div class="imds-empty-state is-vertical">    <!-- 垂直对齐 -->
<div class="imds-empty-state is-horizontal">  <!-- 水平对齐 -->
```

### 无图标

省略 `imds-empty-state-icon`。

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state">
    <div class="imds-empty-state-message-wrapper">
      <div class="imds-empty-state-message">
        <p class="imds-empty-state-message-title">尚未创建应用程序</p>
        <p class="imds-empty-state-message-content">请通过新建按钮创建应用程序。</p>
      </div>
    </div>
    <div class="imds-empty-state-content imds-mt-7">
      <button type="button" class="imds-button is-large is-primary">
        新建应用程序
      </button>
    </div>
  </div>
</div>
```

## 响应式支持

EmptyState 会根据父元素（容器元素）的宽度自动控制图标的显示位置。

- `is-medium` / `is-large`: 容器宽度小于 768px 时自动垂直方向对齐。
- `is-x-small` / `is-small`: 容器宽度小于 520px 时自动垂直方向对齐。但放置在 Table 内时，无论容器宽度如何，图标和标题始终横向排列、左对齐显示。

## 实现注意事项

- **不使用 severity 颜色**（DESIGN.md“empty-state: 中立的占位内容”）。图标始终使用 `is-gray-light` 的中立色调，不得添加 `is-danger` 等状态颜色类。即使在表示空状态的上下文中，也应保持与 error/warning 无关的中立表现。
- 图标原则上使用“info”（`fa-circle-info`）。
- 消息（标题）简洁描述状态，并通过详细消息（`imds-empty-state-message-content`）促使用户采取下一步行动。
- 用户下一步应采取的行动明确时，在 `imds-empty-state-content` 内放置操作按钮（`imds-button is-large is-primary` 等）。
- `is-x-small` / `is-small` 尺寸中不可使用详细消息和操作按钮（仅标题）。
- 通常使用 `is-large`（默认），并根据使用位置的宽度在 `is-x-small`〜`is-large` 中选择。
