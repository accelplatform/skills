---
paths:
  - "src/main/jssp/**/*.html"
---

# AccordionGroup

## 基本信息

AccordionGroup 是用于将多个 Accordion 组合在一起的组件。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-accordion-accordiongroup--documentation
- 基础类: imds-accordion-group
- 关于各个手风琴的详细信息，请参阅 [accordion](accordion.md)

## 整体结构

```
imds-accordion-group                      # 组容器（边框、位置、尺寸一次性应用于所有子项）
└── imds-accordion                        # 各手风琴（按需重复）
    ├── input[type=checkbox]              # 保存开闭状态（id 唯一，无需 JS）
    ├── label.imds-accordion-title (for=input 的 id)
    │   ├── imds-accordion-title-inner
    │   │   ├── span                      # 标题
    │   │   └── imds-accordion-caption    # 副标题（可选）
    │   └── imds-icon.imds-accordion-chevron # 雪佛龙图标（▼）
    └── imds-accordion-content            # 可折叠内容
        └── imds-px-4 imds-py-3           # 内侧边距包装器
            └── （任意内容 / nav.imds-menu 等）
```

在 `imds-accordion-group` 上设置的边框、雪佛龙位置、尺寸会一次性应用于下属所有手风琴。

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-accordion-group | 容器 div | 手风琴组容器 | 必须 |
| imds-accordion | 各项目 div | 各手风琴的容器 | 必须 |
| is-outlined | imds-accordion-group | 四边均有边框 | 可选 |
| is-borderless | imds-accordion-group | 不显示边框 | 可选 |
| is-left | imds-accordion-group | 折叠图标左对齐 | 可选 |
| is-right | imds-accordion-group | 折叠图标右对齐 | 可选 |
| is-x-small | imds-accordion-group | 超小尺寸 | 可选 |
| is-small | imds-accordion-group | 小尺寸 | 可选 |
| is-normal | imds-accordion-group | 标准尺寸 | 可选 |
| is-medium | imds-accordion-group | 中等尺寸 | 可选 |
| is-large | imds-accordion-group | 大尺寸 | 可选 |

※ 各手风琴内部的类（imds-accordion-title、imds-accordion-content 等）请参阅 [accordion](accordion.md)。

## HTML 代码片段

### 基本手风琴组

```html
<div class="imds-accordion-group">
  <div class="imds-accordion">
    <input type="checkbox" id="todo-replace-:r1:" />
    <label for="todo-replace-:r1:" class="imds-accordion-title">
      <span class="imds-accordion-title-inner">
        <span>Accordion Title</span>
        <span class="imds-accordion-caption">caption</span>
      </span>
      <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
    </label>
    <div class="imds-accordion-content"><div class="imds-px-4 imds-py-3">Content</div></div>
  </div>
  <!-- 根据需要重复 imds-accordion（id 必须唯一） -->
</div>
```

以下代码片段均仅显示与基本手风琴组的差异部分。

## 变体

边框、折叠图标位置和尺寸均通过在 `div.imds-accordion-group` 上添加类来统一应用于组内所有手风琴。

### accordionStyle（边框）

```html
<!-- 四边均有边框 -->
<div class="imds-accordion-group is-outlined">

<!-- 无边框 -->
<div class="imds-accordion-group is-borderless">
```

### chevronIconPosition（折叠图标位置）

默认为右对齐。

```html
<!-- 折叠图标左对齐 -->
<div class="imds-accordion-group is-left">
```

### size（尺寸）

```html
<div class="imds-accordion-group is-x-small">  <!-- 超小 -->
<div class="imds-accordion-group is-small">    <!-- 小 -->
<div class="imds-accordion-group is-normal">   <!-- 标准 -->
<div class="imds-accordion-group is-medium">   <!-- 中 -->
<div class="imds-accordion-group is-large">    <!-- 大 -->
```

## 组合示例

### 与 Menu 组合

在 `imds-accordion-content` 内放置 `nav.imds-menu` 的模式。
添加 `is-last-child-borderless` 可隐藏菜单末尾的边框。

```html
<div class="imds-accordion-content">
  <nav class="imds-menu is-last-child-borderless">
    <ul class="imds-menu-list">
      <li><a><span>Menu 1</span></a></li>
      <li><a><span>Menu 2</span></a></li>
      <li><a><span>Menu 3</span></a></li>
    </ul>
  </nav>
</div>
```

## 实现注意事项

- `id` 属性必须替换为唯一值（`todo-replace-:r1:` 等为占位符）
- 注意组内各手风琴的 `id` 不得重复
- 由于开关基于 checkbox，不需要 JavaScript；但若要以编程方式控制开关状态，请操作 `checked` 属性
- `imds-accordion-content` 内的内边距通过 `imds-px-4 imds-py-3` 调整，可根据内容进行修改
