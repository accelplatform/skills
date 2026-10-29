# Spacing（间距工具类）

## 基本信息

Spacing 是用于指定 margin / padding 的 imds 辅助类组。它们是 imds 的工具类，与组件专用类（`imds-field` 或 `imds-button` 等）组合使用。不作为独立组件使用。

- 提取来源: `uiux-share/helper/Spacing.md`
- 命名规则: `imds-{缩写}-{值}`（例: `imds-p-2`, `imds-mt-4`, `imds-mx-auto`）

## CSS Classes Reference

| Property | Shortcut | `0` | `0.4rem (4px)` | `0.8rem (8px)` | `1.2rem (12px)` | `1.6rem (16px)` | `2rem (20px)` | `2.4rem (24px)` | `2.8rem (28px)` | `3.2rem (32px)` | `auto` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `margin` | `m` | `imds-m-0` | `imds-m-1` | `imds-m-2` | `imds-m-3` | `imds-m-4` | `imds-m-5` | `imds-m-6` | `imds-m-7` | `imds-m-8` | `imds-m-auto` |
| `margin-top` | `mt` | `imds-mt-0` | `imds-mt-1` | `imds-mt-2` | `imds-mt-3` | `imds-mt-4` | `imds-mt-5` | `imds-mt-6` | `imds-mt-7` | `imds-mt-8` | `imds-mt-auto` |
| `margin-right` | `mr` | `imds-mr-0` | `imds-mr-1` | `imds-mr-2` | `imds-mr-3` | `imds-mr-4` | `imds-mr-5` | `imds-mr-6` | `imds-mr-7` | `imds-mr-8` | `imds-mr-auto` |
| `margin-bottom` | `mb` | `imds-mb-0` | `imds-mb-1` | `imds-mb-2` | `imds-mb-3` | `imds-mb-4` | `imds-mb-5` | `imds-mb-6` | `imds-mb-7` | `imds-mb-8` | `imds-mb-auto` |
| `margin-left` | `ml` | `imds-ml-0` | `imds-ml-1` | `imds-ml-2` | `imds-ml-3` | `imds-ml-4` | `imds-ml-5` | `imds-ml-6` | `imds-ml-7` | `imds-ml-8` | `imds-ml-auto` |
| margin-left 和 margin-right | `mx` | `imds-mx-0` | `imds-mx-1` | `imds-mx-2` | `imds-mx-3` | `imds-mx-4` | `imds-mx-5` | `imds-mx-6` | `imds-mx-7` | `imds-mx-8` | `imds-mx-auto` |
| margin-top 和 margin-bottom | `my` | `imds-my-0` | `imds-my-1` | `imds-my-2` | `imds-my-3` | `imds-my-4` | `imds-my-5` | `imds-my-6` | `imds-my-7` | `imds-my-8` | `imds-my-auto` |
| `padding` | `p` | `imds-p-0` | `imds-p-1` | `imds-p-2` | `imds-p-3` | `imds-p-4` | `imds-p-5` | `imds-p-6` | `imds-p-7` | `imds-p-8` | `imds-p-auto` |
| `padding-top` | `pt` | `imds-pt-0` | `imds-pt-1` | `imds-pt-2` | `imds-pt-3` | `imds-pt-4` | `imds-pt-5` | `imds-pt-6` | `imds-pt-7` | `imds-pt-8` | `imds-pt-auto` |
| `padding-right` | `pr` | `imds-pr-0` | `imds-pr-1` | `imds-pr-2` | `imds-pr-3` | `imds-pr-4` | `imds-pr-5` | `imds-pr-6` | `imds-pr-7` | `imds-pr-8` | `imds-pr-auto` |
| `padding-bottom` | `pb` | `imds-pb-0` | `imds-pb-1` | `imds-pb-2` | `imds-pb-3` | `imds-pb-4` | `imds-pb-5` | `imds-pb-6` | `imds-pb-7` | `imds-pb-8` | `imds-pb-auto` |
| `padding-left` | `pl` | `imds-pl-0` | `imds-pl-1` | `imds-pl-2` | `imds-pl-3` | `imds-pl-4` | `imds-pl-5` | `imds-pl-6` | `imds-pl-7` | `imds-pl-8` | `imds-pl-auto` |
| padding-left 和 padding-right | `px` | `imds-px-0` | `imds-px-1` | `imds-px-2` | `imds-px-3` | `imds-px-4` | `imds-px-5` | `imds-px-6` | `imds-px-7` | `imds-px-8` | `imds-px-auto` |
| padding-top 和 padding-bottom | `py` | `imds-py-0` | `imds-py-1` | `imds-py-2` | `imds-py-3` | `imds-py-4` | `imds-py-5` | `imds-py-6` | `imds-py-7` | `imds-py-8` | `imds-py-auto` |

## 使用示例

### 为通用容器指定 padding

```html
<div class="imds-p-4">
  <p>内容</p>
</div>
```

### 使用 margin-top 和 margin-bottom（my）指定纵向间隔

```html
<div class="imds-my-3">
  <p>内容</p>
</div>
```

### 使用 auto 居中

```html
<div class="imds-mx-auto imds-content-normal-width">
  <p>居中放置的内容</p>
</div>
```

## 实现注意事项

- 值仅定义了 `0`〜`8` 的整数（以 0.4rem 为步长，`0`=0、`1`=4px 〜 `8`=32px）和 `auto`。不存在指定任意 px 值的类，因此需要其他间距时通过内联 style 等处理。
- `imds-p-auto` / `imds-m-auto` 等的 `auto` 主要用于 margin 的居中（`imds-mx-auto`）。注意为 padding 指定 `auto` 的用途很少见。
- 对同一属性同时添加单独指定（例: `imds-mt-2`）与复合指定（例: `imds-my-2`）时，可能因 CSS 的优先级、书写顺序而发生意外覆盖，因此只使用其中一种。
