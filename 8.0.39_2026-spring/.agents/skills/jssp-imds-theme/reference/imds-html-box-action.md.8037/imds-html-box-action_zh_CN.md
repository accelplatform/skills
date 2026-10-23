# BoxAction

## 基本信息

BoxAction 是将说明文字及其对应的操作按钮汇总显示在一个框内的组件。
用于将“要做什么”的说明与执行按钮成对呈现的场景，例如应用设置变更。

**与 Button 的关系（DESIGN.md）**: BoxAction 在“操作”模式族中是以 `button` 为代表的同族组件，**直接沿用按钮的颜色和状态（颜色轴、variant、hover/active 等）**。BoxAction 本身没有独立的颜色定义。内部按钮通常使用 `imds-button is-outlined is-primary`。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-boxaction--documentation
- 基础类: imds-box-action

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-box-action | div 元素 | BoxAction 整体容器（可横向排列多个项目） | 必须 |
| is-flex-direction-column | imds-box-action 或内侧的 div | 将项目／说明和按钮纵向堆叠排列 | 可选 |

## HTML 代码片段

### 基本形式

```html
<div class="imds-box-action">
  <div>
    <div>
      <strong>应用定义</strong>
      <p>关于应用定义的说明</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        应用定义
      </button>
    </div>
  </div>
</div>
```

以下仅显示与基本形式的差异部分。

## 变体

### Vertical（纵向堆叠）

将说明和按钮纵向堆叠。在 `imds-box-action` 和内侧的项目 div 上同时添加 `is-flex-direction-column`。

```html
<div class="imds-box-action is-flex-direction-column">
  <div class="is-flex-direction-column">
    <div>
      <strong>应用定义</strong>
      <p>关于应用定义的说明</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        应用定义
      </button>
    </div>
  </div>
</div>
```

### Row（多个项目横向排列）

在 `imds-box-action` 正下方排列多个项目 div。各项目可以混用常规横向排列（无类）和 `is-flex-direction-column`（纵向堆叠）。

```html
<div class="imds-box-action">
  <div>
    <div>
      <strong>应用定义</strong>
      <p>关于应用定义的说明</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        应用定义
      </button>
    </div>
  </div>
  <div>
    <div>
      <strong>应用定义</strong>
      <p>关于应用定义的说明</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        应用定义
      </button>
    </div>
  </div>
  <div class="is-flex-direction-column">
    <div>
      <strong>应用定义</strong>
      <p>关于应用定义的说明</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        应用定义
      </button>
    </div>
  </div>
</div>
```

## 实现注意事项

- BoxAction 内的按钮**直接使用 Button（imds-html-button.md）的颜色和状态类**。BoxAction 本身不定义颜色，因此 `is-primary` / `is-danger` 等语义色以及 `is-outlined` / `is-ghost` 等 variant 应添加到按钮上。
- 标题使用 `strong` 元素、说明文字使用 `p` 元素进行结构化。
- 一个项目内以“说明的 div”＋“操作的 div”两个元素构成为基本形式。
- 多个项目横向排列时（Row 模式），在 `imds-box-action` 正下方排列多个项目 div。若要使个别项目纵向堆叠，只在该项目 div 上添加 `is-flex-direction-column`。
