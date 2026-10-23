---
paths:
  - "src/main/jssp/**/*.html"
---

# BackgroundColor（背景色工具类）

## 基本信息

BackgroundColor 是用于为指定元素设置背景色的 imds 辅助类组。它们是 imds 的工具类，与 `imds-section` 等组件专用类组合使用。不作为独立组件使用。`has-background-color-gray` 与 Section 等组合，可提供视觉上易于区分的分区。

- 提取来源: `uiux-share/helper/BackgroundColor.md`

## CSS Classes Reference

| 类名 | 用途 | 值 |
|----------|------|----|
| `has-background-color-gray` | 将元素背景设为灰色 | 背景色: 灰色 |
| `has-background-color-white` | 将元素背景设为白色 | 背景色: 白色 |

## 使用示例

### 区块的视觉分隔

```html
<div>
  <section>
    <h2 class="imds-heading is-size-4">.has-background-color-gray</h2>
    <div class="imds-py-2 imds-px-4"><div class="has-background-color-gray"></div></div>
  </section>
  <section>
    <h2 class="imds-heading is-size-4">.has-background-color-white</h2>
    <div class="imds-py-2 imds-px-4"><div class="has-background-color-white"></div></div>
  </section>
</div>
```

## 实现注意事项

- 若不为带背景色的元素同时设置足够的间距（`imds-p-*` / `imds-py-*` / `imds-px-*` 等），会降低背景的辨识度。
- 注意与文字颜色的搭配，避免内容与背景的对比度降低。
