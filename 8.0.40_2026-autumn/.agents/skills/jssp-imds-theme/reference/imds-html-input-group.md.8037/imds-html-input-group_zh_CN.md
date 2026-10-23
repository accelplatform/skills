# InputGroup

## 基本信息

InputGroup 是将多个输入元素和按钮横向排列并组合显示的容器。
可以组合 Textbox、Select、Popover、IconButton 等，构建搜索栏、排序栏等。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-inputgroup--documentation
- 基础类: imds-input-group

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-input-group | div 元素 | 输入组容器 | 必须 |

## HTML 代码片段

### 基本输入组（Popover + Textbox + IconButton）

```html
<div class="imds-input-group">
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="sample-popover-1"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="sample-popover-1"
      role="menu"
      class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
  <input
    type="search"
    placeholder="搜索"
    class="imds-textbox"
    value="" />
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

## 组合示例

### 搜索栏（Textbox + Popover + IconButton）

在 Popover 内放置菜单，切换搜索条件的示例。

```html
<div class="imds-input-group">
  <input
    type="search"
    placeholder="搜索"
    class="imds-textbox"
    value="" />
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="sample-popover-1"
      class="imds-button is-outlined">
      <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
      <span></span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="sample-popover-1"
      role="menu"
      class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a><span>Menu 1</span></a></li>
            <li><a><span>Menu 2</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

### 搜索栏（Select + Textbox + IconButton）

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>全部</option>
    <option>名称</option>
    <option>备注</option>
  </select>
  <input
    type="search"
    placeholder="搜索"
    class="imds-textbox"
    value="" />
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

### 排序（IconButton + Select）

```html
<div class="imds-input-group">
  <button
    type="button"
    class="imds-button"
    title="按降序排列">
    <span class="imds-icon is-small"><i class="fa-solid fa-arrow-down-short-wide"></i></span>
  </button>
  <select class="imds-select">
    <option>推荐排序</option>
    <option>价格排序</option>
    <option>销量排序</option>
  </select>
</div>
```

### Textbox + IconButton

```html
<div class="imds-input-group">
  <input
    type="search"
    placeholder="搜索"
    class="imds-textbox"
    value="" />
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

### Select + TextboxControl

使用 `imds-textbox-control` 在文本框内放置图标的示例。

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>Select-1</option>
    <option>Select-2</option>
  </select>
  <div class="imds-textbox-control is-left">
    <input
      type="search"
      placeholder="搜索"
      class="imds-textbox"
      value="" />
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </div>
</div>
```

## UI 模式（元素组合）

InputGroup 通过改变所放置元素的顺序，可以构建各种布局。以下列出代表性的组合模式。

### Popover 在前（Popover + Textbox）

将 Popover 放在前面，先选择搜索条件再输入搜索词的模式。

```html
<div class="imds-input-group">
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="sample-popover-0"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div id="sample-popover-0" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
  <input type="search" placeholder="搜索" class="imds-textbox" value="" />
</div>
```

### Textbox 在前（Textbox + Popover）

将 Textbox 放在前面，先输入搜索词再通过 Popover 指定筛选条件的模式。

```html
<div class="imds-input-group">
  <input type="search" placeholder="搜索" class="imds-textbox" value="" />
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="sample-popover-1"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div id="sample-popover-1" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
</div>
```

两种顺序都是正当的模式，根据 UI 上的含义（希望先选条件，还是先输入搜索词）区分使用。

### Select + Textbox（2 个元素，无按钮）

仅切换搜索对象、不带执行按钮（输入的同时进行筛选）的简单 2 元素构成。

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>Select-1</option>
    <option>Select-2</option>
    <option>Select-3</option>
  </select>
  <input type="search" placeholder="搜索" class="imds-textbox" value="" />
</div>
```

### Select + Textbox + Popover + Button（4 个元素）

组合搜索对象 Select、搜索词 Textbox、详细条件 Popover、执行搜索 Button 的最大构成。

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>Select-1</option>
    <option>Select-2</option>
    <option>Select-3</option>
  </select>
  <input type="search" placeholder="搜索" class="imds-textbox" value="" />
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="sample-popover-2"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div id="sample-popover-2" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
  <button type="button" class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

## 实现注意事项

- `imds-input-group` 内的元素会自动横向排列并合并
- 将 Popover 的 `id` / `aria-controls` 替换为唯一值（`sample-popover-N` 为占位符。根据功能取唯一的名称，因不是输入元素，不加冒号）
- Popover 的开关需通过 JavaScript 控制
- 仅含图标的按钮须添加 `title` 属性或 `aria-label` 以确保无障碍性
- 通过改变元素的顺序可以自由构建布局（例如：Popover + Textbox、Textbox + Popover、Select + Textbox、Select + Textbox + Popover + Button）
