---
paths:
  - "src/main/jssp/**/*.html"
---

# ContentWidth（内容宽度工具类）

## 基本信息

ContentWidth 是用于指定容器元素横向宽度的 imds 辅助类组。它们是 imds 的工具类，与 `imds-section` 等组件专用类组合使用。不作为独立组件使用。

- 提取来源: `uiux-share/helper/ContentWidth.md`

## CSS Classes Reference

| 类名 | 用途 | 值 |
|----------|------|----|
| `imds-content-normal-width` | 指定带最大宽度的容器宽度 | 最大宽度 1200px。在最大值以下时随画面宽度伸缩 |
| `imds-content-full-width` | 指定占满画面宽度的容器宽度 | 宽度 100%。随画面宽度伸缩 |

## 使用示例

### 最大宽度 1200px 的容器

```html
<section class="imds-section">
  <h2 class="imds-heading is-size-4">.imds-content-normal-width</h2>
  <p class="imds-help-text">横向宽度指定了最大值 1200px。在最大值以下时，横向宽度随画面宽度伸缩。</p>
  <div class="imds-content-normal-width imds-border-2"></div>
</section>
```

### 占满画面宽度的容器

```html
<section class="imds-section">
  <h2 class="imds-heading is-size-4">.imds-content-full-width</h2>
  <p class="imds-help-text">横向宽度指定为 100%，随画面宽度伸缩。</p>
  <div class="imds-content-full-width imds-border-2"></div>
</section>
```

## 实现注意事项

- 一般业务画面的主内容区域使用 `imds-content-normal-width`，为确保可读性，避免过度横向拉长。
- 仅在仪表板或列表画面等需要最大限度利用画面宽度的情况下，才考虑使用 `imds-content-full-width`。
