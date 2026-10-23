---
paths:
  - "src/main/jssp/**/*.html"
---

# Border（边框工具类）

## 基本信息

Border 是用于为指定元素添加或去除边框的 imds 辅助类组。也可以调整边框粗细。它们是 imds 的工具类，与任意组件专用类组合使用。不作为独立组件使用。

- 提取来源: `uiux-share/helper/Border.md`
- 命名规则: `imds-border{-方向}-{粗细}`（省略方向时为全部边，`0` 为无边框，`1`/`2` 为粗细等级）

## CSS Classes Reference

| 类名 | 应用的边 | 粗细 |
|----------|-----------|------|
| `imds-border-0` | 全部边 | 无（0） |
| `imds-border-1` | 全部边 | 细（第1级） |
| `imds-border-2` | 全部边 | 粗（第2级） |
| `imds-border-t-0` | 上边 | 无（0） |
| `imds-border-t-1` | 上边 | 细（第1级） |
| `imds-border-t-2` | 上边 | 粗（第2级） |
| `imds-border-r-0` | 右边 | 无（0） |
| `imds-border-r-1` | 右边 | 细（第1级） |
| `imds-border-r-2` | 右边 | 粗（第2级） |
| `imds-border-b-0` | 下边 | 无（0） |
| `imds-border-b-1` | 下边 | 细（第1级） |
| `imds-border-b-2` | 下边 | 粗（第2级） |
| `imds-border-l-0` | 左边 | 无（0） |
| `imds-border-l-1` | 左边 | 细（第1级） |
| `imds-border-l-2` | 左边 | 粗（第2级） |
| `imds-border-x-0` | 左右边 | 无（0） |
| `imds-border-x-1` | 左右边 | 细（第1级） |
| `imds-border-x-2` | 左右边 | 粗（第2级） |
| `imds-border-y-0` | 上下边 | 无（0） |
| `imds-border-y-1` | 上下边 | 细（第1级） |
| `imds-border-y-2` | 上下边 | 粗（第2级） |

## 使用示例

### 为全部边添加边框

```html
<div class="sample-box-container imds-border-1"></div>
```

### 仅为上边添加粗边框

```html
<div class="sample-box-container imds-border-t-2"></div>
```

### 仅为左右添加边框

```html
<div class="sample-box-container imds-border-x-1"></div>
```

## 实现注意事项

- 同时使用不指定方向（`imds-border-*`）与指定单独方向（`imds-border-t-*` 等）时，可能因 CSS 的书写顺序或优先级而发生意外覆盖，因此应以其中一种为基础使用。
- 常与 `imds-line-clamp-*` 或 `imds-scrollbar` 一起使用，以提高内容区域的辨识度（参阅 `imds-helper-line-clamp.md` / `imds-helper-scrollbar.md`）。
