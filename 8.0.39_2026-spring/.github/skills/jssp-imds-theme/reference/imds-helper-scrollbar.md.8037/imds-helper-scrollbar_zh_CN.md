---
paths:
  - "src/main/jssp/**/*.html"
---

# Scrollbar（滚动条工具类）

## 基本信息

Scrollbar 是用于弱化滚动条的存在感、保持内容区域易读性的 imds 辅助类。它是 imds 的工具类，与指定了 `overflow: auto` / `overflow: scroll` 等的块级元素（Flexbox 或 Grid 的溢出区域等）组合使用。不作为独立组件使用。

- 提取来源: `uiux-share/helper/Scrollbar.md`

## CSS Classes Reference

| 类名 | 用途 | 值（Property: Value） |
|----------|------|----------------------|
| `imds-scrollbar` | 将滚动条设为纤细且辨识度高的设计 | `scrollbar-color: hsl(0deg, 0%, 69%) hsl(0deg, 0%, 100%); scrollbar-width: thin;` |

## 使用示例

### 包含文本的滚动区域

应用前（标准滚动条）

```html
<div class="sample-box">
  <div
    class="sample-box-container imds-border-1"
    style="overflow: scroll">
    <p>
      The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs.
    </p>
  </div>
</div>
```

应用后（添加 `imds-scrollbar`）

```html
<div class="sample-box">
  <div
    class="sample-box-container imds-border-1 imds-scrollbar"
    style="overflow: scroll">
    <p>
      The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs.
    </p>
  </div>
</div>
```

## 实现注意事项

- 应用 `imds-scrollbar` 时，为显示滚动条，目标容器需要 `overflow: auto` 或 `overflow: scroll` 等溢出指定。根据需要通过内联 `style` 或布局侧的样式指定。
- `imds-scrollbar` 本身仅更改滚动条的外观，不控制溢出行为本身。
