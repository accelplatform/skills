# Menu

## 基本信息

Menu 是将功能选择和画面导航操作以列表形式组织成菜单的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/story/components-menu--default
- 基础类: imds-menu

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-menu | nav 元素 | 菜单容器 | 必须 |
| imds-menu-title | div 元素 | 菜单标题 | 可选 |
| imds-menu-list | ul 元素 | 菜单列表 | 必须 |
| imds-menu-list-item-additional | span 元素 | 菜单项的附加信息区域（标签等） | 可选 |
| is-borderless | imds-menu | 无分隔线 | 可选 |
| is-last-child-borderless | imds-menu | 最后一项无分隔线 | 可选 |
| is-small | imds-menu | 小尺寸 | 可选 |
| is-normal | imds-menu | 标准尺寸 | 可选 |
| is-medium | imds-menu | 中等尺寸 | 可选 |
| is-large | imds-menu | 大尺寸 | 可选 |
| is-disabled | li 元素 | 禁用项目 | 可选 |
| is-active | li 元素 | 显示项目为激活状态 | 可选 |
| has-text-right | imds-menu-list-item-additional | 附加信息右对齐 | 可选 |

## HTML 代码片段

### 基本菜单

```html
<nav class="imds-menu">
  <div class="imds-menu-title">Menu List</div>
  <ul class="imds-menu-list">
    <li><a><span>Menu 1</span></a></li>
    <li><a><span>Menu 2</span></a></li>
    <li><a><span>Menu 3</span></a></li>
  </ul>
</nav>
```

以下各节仅展示与基本菜单的差异。

## 变体

### lineStyle（分隔线样式）

在 `nav.imds-menu` 上添加类。

```html
<nav class="imds-menu is-borderless">            <!-- 无分隔线 -->
<nav class="imds-menu is-last-child-borderless">  <!-- 最后一项无分隔线 -->
```

### size（尺寸）

在 `nav.imds-menu` 上添加尺寸类。

```html
<nav class="imds-menu is-small">   <!-- 小 -->
<nav class="imds-menu is-normal">  <!-- 标准 -->
<nav class="imds-menu is-medium">  <!-- 中 -->
<nav class="imds-menu is-large">   <!-- 大 -->
```

### disabled（禁用状态）

在 `li` 元素上添加 `is-disabled`。

```html
<li class="is-disabled">
  <a><span>Menu 2</span></a>
</li>
```

### active（激活状态）

在 `li` 元素上添加 `is-active`。

```html
<li class="is-active">
  <a><span>Menu 2</span></a>
</li>
```

## 组合示例

### 与 Tag 组合

使用 `imds-menu-list-item-additional` 放置标签等附加信息。添加 `has-text-right` 可右对齐。

```html
<li>
  <a>
    <span>Menu 2</span>
    <span class="imds-menu-list-item-additional">
      <span class="imds-tag is-small is-green"><span>Tag</span></span>
    </span>
  </a>
</li>

<!-- 右对齐 -->
<li>
  <a>
    <span>Menu 2</span>
    <span class="imds-menu-list-item-additional has-text-right">
      <span class="imds-tag is-small is-green"><span>Tag</span></span>
    </span>
  </a>
</li>
```

### 与 Icon 组合

通过 `<a>` 内 `imds-icon` 的排列顺序控制图标的左右位置。

```html
<!-- 左侧 -->
<li>
  <a>
    <span class="imds-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
    <span>Menu 1</span>
  </a>
</li>

<!-- 右侧 -->
<li>
  <a>
    <span>Menu 1</span>
    <span class="imds-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
  </a>
</li>
```

### 与 Accordion 组合

将 `imds-menu` 放置在 `imds-accordion-content` 内。
用于侧边菜单等场景。添加 `is-last-child-borderless` 可去除最后一项的分隔线。

```html
<div class="imds-accordion-group">
  <div class="imds-accordion">
    <input
      type="checkbox"
      id="todo-replace-:r1:" />
    <label
      for="todo-replace-:r1:"
      class="imds-accordion-title">
      <span class="imds-accordion-title-inner">
        <span>Accordion Title 1</span>
        <span class="imds-accordion-caption">Caption</span>
      </span>
      <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
    </label>
    <div class="imds-accordion-content">
      <nav class="imds-menu is-last-child-borderless">
        <ul class="imds-menu-list">
          <li><a><span>Menu 1</span></a></li>
          <li><a><span>Menu 2</span></a></li>
          <li><a><span>Menu 3</span></a></li>
        </ul>
      </nav>
    </div>
  </div>
  <!-- 按需重复相同结构的折叠面板 -->
</div>
```

## 无障碍支持

### 子级菜单

- 子级菜单用于需要树状结构的目录和导航等
- 通过将 Menu 元素嵌套在列表内，可以创建层级菜单
- 但层级越深，用户操作性可能越低，请谨慎设计

### Popover 内的子级菜单

- 通常不建议在 Popover 中使用子级菜单
- Popover 的内容区域往往较小，且不是始终可见的区域，因此不适合放置子级菜单
- 建议使用 MenuTitle 对菜单进行分组

## 实现注意事项

- `imds-menu-title` 可省略。不需要标题时，仅放置 `imds-menu-list`
- 在 Popover 内使用时，放置在 `imds-popover-content` 内
- 链接目标通过 `<a>` 的 `href` 属性指定。使用 JavaScript 处理时，省略 `href` 并设置点击事件
