---
paths:
  - "src/main/jssp/**/*.html"
---

# LineClamp（行数省略工具类）

## 基本信息

LineClamp 是用于按指定行数对字符串进行省略显示（省略号）的 imds 辅助类组。它们是 imds 的工具类，与 `p` 元素等任意包含文本的元素组合使用。不作为独立组件使用。

- 提取来源: `uiux-share/helper/LineClamp.md`
- 命名规则: `imds-line-clamp-{行数}`（定义了 1〜5）

## CSS Classes Reference

| 类名 | 用途 | 值 |
|----------|------|----|
| `imds-line-clamp-1` | 以1行省略显示 | 显示行数: 1 |
| `imds-line-clamp-2` | 以2行省略显示 | 显示行数: 2 |
| `imds-line-clamp-3` | 以3行省略显示 | 显示行数: 3 |
| `imds-line-clamp-4` | 以4行省略显示 | 显示行数: 4 |
| `imds-line-clamp-5` | 以5行省略显示 | 显示行数: 5 |

## 使用示例

### 以2行省略显示的长文本

```html
<div class="sample-box-container imds-border-1">
  <p class="imds-line-clamp-2">
    The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs.
  </p>
</div>
```

## 实现注意事项

- 用于列表画面的单元格内文本或摘要显示等，需要在有限区域内省略显示长文本的情况。
- 为使用户能够确认被省略的全文，最好同时提供 `title` 属性、工具提示或进入详情显示的入口。
- 与 `imds-scrollbar`（`imds-helper-scrollbar.md`）用途不同。LineClamp 按行数截断并显示省略号，而 Scrollbar 用于调整可滚动区域的外观。
