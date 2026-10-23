# Stepper

## 基本信息

Stepper 是供用户按顺序执行多步骤任务的组件。
通过可视化任务进度，明确到完成为止剩余的任务。
用于需要分多个阶段进行操作的向导式界面。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-stepper--documentation
- 基础类: imds-stepper

## 整体结构

```
imds-stepper                              # 步骤条容器
└── ul                                    # 步骤列表
    └── li.imds-stepper-step              # 各步骤
        │                                 #   状态类：is-completed（已完成）/ is-active（当前）/ 无（未到达）
        └── button                        # 步骤本体（可选 imds-icon + 标签）
```

步骤之间的连接线由 CSS 自动绘制，无需在 HTML 中编写。

## CSS 类参考

| 类名 | 应用对象 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-stepper | div 元素 | 步进器容器 | 必须 |
| imds-stepper-step | li 元素 | 各步骤 | 必须 |
| is-completed | imds-stepper-step | 已完成步骤 | 可选 |
| is-active | imds-stepper-step | 进行中（当前）步骤 | 可选 |
| imds-line-clamp-1 | span 元素 | 文字1行省略 | 可选 |
| imds-line-clamp-2 | span 元素 | 文字2行省略 | 可选 |

## HTML 代码片段

### 基本步进器

```html
<div class="imds-stepper">
  <ul>
    <li class="imds-stepper-step is-completed">
      <button><span>Step.1</span></button>
    </li>
    <li class="imds-stepper-step is-active">
      <button><span>Step.2</span></button>
    </li>
    <li class="imds-stepper-step">
      <button><span>Step.3</span></button>
    </li>
  </ul>
</div>
```

以下各节仅展示与基本步进器的差异。

## 变体

### 步骤状态（is-completed、is-active）

在 `li.imds-stepper-step` 上添加状态类。
无类名表示未到达。

```html
<li class="imds-stepper-step is-completed">  <!-- 已完成 -->
<li class="imds-stepper-step is-active">      <!-- 进行中 -->
<li class="imds-stepper-step">                <!-- 未到达 -->
```

### disabled（禁用）

在各步骤的 `button` 上添加 `disabled` 属性。

```html
<button disabled><span>Step.1</span></button>
```

### lineClamp（文字省略）

对较长的标签进行省略显示。在 `span` 上添加 `imds-line-clamp-1`（1行）或 `imds-line-clamp-2`（2行），并在 `button` 的 `title` 中设置完整文字。

```html
<li class="imds-stepper-step">
  <button title="在此处填写较长步骤名的完整文字">
    <span class="imds-line-clamp-1">在此处填写较长步骤名的完整文字</span>
  </button>
</li>
```

## 组合示例

### 与 Icon 组合

在 `button` 内添加 `imds-icon`。
可放置在标签前后任意位置。

```html
<button>
  <span class="imds-icon is-small"><i class="fa-solid fa-user"></i></span>
  <span>Step.1</span>
</button>
```

## 实现注意事项

- 步骤使用 `ul > li` 的列表结构编写
- `is-completed` 添加到已完成步骤，`is-active` 添加到当前步骤，未到达步骤不添加类
- `is-active` 同时只添加到一个步骤上
- 步骤间的连接线由 CSS 自动绘制（无需在 HTML 中编写）
- 步骤点击时的跳转处理通过 JavaScript 控制
- 使用 `imds-line-clamp-*` 时，在 `button` 的 `title` 属性中设置完整文字，以便悬停时确认
- 在实际 DOM 示例（导入界面等）中，`imds-stepper` 直接放置在标题（`imds-header`）正下方、后续内容之前，`imds-stepper` 自身不添加间距工具类。间距由后续的 `section` 一侧（`imds-py-6 imds-px-8` 等）确保。不存在给步进器本身添加特定间距类（`imds-pb-4` 等）的固定规则，因此实现时应参照 uiux-share 的实例，在步进器外侧（后续区块等）调整间距
- 在使用步进器的向导式界面中，「上一步」「下一步」等步骤间导航按钮原则上放置在滚动区域外的固定页脚（`pgstyle-layout-footer`。参见 [imds-form-page.md](../assets/imds-form-page.md)「5. 底部（操作按钮）」）中（导航按钮位于固定位置更易于理解，放在内容中时可能需要滚动才能看到按钮）
  - 各步骤的按钮构成不同时，为每个步骤准备页脚，仅显示当前步骤的页脚
  - 页脚的水平内边距与后续区块的水平内边距保持一致（例：区块为 `imds-px-6` 时页脚也为 `imds-px-6`）。按钮左端与内容左端对齐
  - 页脚使用 `<div>` 而非 `<footer>` 元素实现（避免与平台提供的地标重复）
  - 例外：仅有文件上传的步骤等内容较少的情况，或完成步骤这类不属于向导内导航的按钮，可以不放在页脚中，而放在内容正下方
