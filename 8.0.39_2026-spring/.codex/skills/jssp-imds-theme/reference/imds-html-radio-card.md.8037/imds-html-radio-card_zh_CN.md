# RadioCard

## 基本信息

RadioCard 与 Radio 一样，是从选项中选择一个项目时使用的组件。
由于除标签外还有说明栏，可以向用户呈现比 Radio 更详细的信息。
此外，由于点击区域较大，选择操作也更加方便。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-radiocard--documentation
- 基础类: imds-radiocard

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-radiocard | div 元素 | 单选卡片容器 | 必须 |
| imds-radiocard-title | span 元素 | 卡片标题 | 必须 |
| imds-radiocard-content | div 元素 | 卡片说明内容 | 可选 |
| imds-radiocard-container | fieldset 元素 | 多个卡片的分组容器 | 可选 |
| is-vertical | imds-radiocard-container | 纵向排列布局 | 可选 |

## HTML 代码片段

### 基本单选卡片

```html
<div class="imds-radiocard">
  <input type="radio" name="todo-replace-:r1:" id="todo-replace-:r1:" />
  <label for="todo-replace-:r1:">
    <span class="imds-radiocard-title">标题</span>
    <div class="imds-radiocard-content">
      <p>说明文字</p>
    </div>
  </label>
</div>
```

以下各节仅展示与基本单选卡片的差异。

## 变体

### disabled（禁用）

在 `input` 上添加 `disabled` 属性。

```html
<input type="radio" name="todo-replace-:r1:" id="todo-replace-:r1:" disabled />
```

### checked（已选中）

在 `input` 上添加 `checked` 属性。

```html
<input type="radio" name="todo-replace-:r1:" id="todo-replace-:r1:" checked />
```

## 组合示例

### 多个选项

用 `fieldset.imds-radiocard-container` 将多个单选卡片分组。
添加 `is-vertical` 可使用纵向排列布局。

```html
<fieldset class="imds-radiocard-container is-vertical">
  <div class="imds-radiocard">
    <input
      type="radio"
      name="container"
      id=":r0:" />
    <label for=":r0:">
      <span class="imds-radiocard-title">手动创建</span>
      <div class="imds-radiocard-content"><p>逐一手动输入数据。</p></div>
    </label>
  </div>
  <!-- 按需重复相同结构的 imds-radiocard（name 属性须保持一致） -->
</fieldset>
```

## 实现注意事项

- 同一组的单选卡片须使用相同的 `name` 属性（以实现单选）
- 每个卡片的 `input` 的 `id` 和 `label` 的 `for` 须替换为唯一值（`todo-replace-:r1:` 为占位符）
- 选中状态的样式通过与 `input:checked` 联动的 CSS 自动切换（无需 JavaScript）
- `imds-radiocard-content` 可省略（也可创建仅含标题的卡片）
