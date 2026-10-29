---
paths:
  - "src/main/jssp/**/*.html"
---

# 长文本的省略显示（common-parts）

## 基本信息

这是在表格单元格、详情表单、卡片等中将长文本初始省略为1行，并通过点击展开/折叠时使用的复合模式。
包含不妨碍文本范围选择（复制）操作的考量。

- 提取来源: `uiux-share/common-parts/長いテキストの省略表示.md`
- 用于表格的备注列、说明列需要展开/折叠的情况，在详情查看中省略显示字段内长文本的情况，以及在卡片、面板等中折叠长说明的情况。

**与现有模式「表格单元格的长文本省略（仅 LineClamp）」的区分使用**:
- 仅 LineClamp: 只添加 `imds-line-clamp-*` 类的静态省略。无交互。
- 本模式: 带有通过点击切换展开/折叠的交互。通过 caret 图标使状态可视化。

## 构成组件

| 使用的基本组件 | 对应 reference |
|---|---|
| IconFont（`imds-icon`） | [imds-html-icon-font.md](imds-html-icon-font.md) |

`imds-line-clamp-*` 是 helper 类的工具类（LineClamp）（详见 [imds-helper-line-clamp.md](imds-helper-line-clamp.md)）。本模式以将 `imds-line-clamp-1`（1行省略）添加到触发元素内 `<p>` 上的形式使用。

## HTML 代码片段

将 caret 图标与文本通过 flex 横向排列，使整个容器成为点击区域。
`[REPLACE: unique-id]` 中指定页面内唯一的 ID，并通过 JS 绑定。

```html
<div class="imds-line-clamp-trigger" id="[REPLACE: unique-id]" title="[REPLACE: 展开文本]"
     style="display: flex; align-items: flex-start; cursor: pointer; max-width: 100%;">
  <span class="imds-icon imds-mr-2">
    <i class="fa-solid fa-caret-right"></i>
  </span>
  <p class="imds-line-clamp-1">
    [REPLACE: 需要省略显示的长文本]
  </p>
</div>
```

## JS 控制

同一画面中存在多个展开块时，通过 `.imds-line-clamp-trigger` 类统一获取目标元素，并在各容器内通过后代查找确定 `p` / `i`。

```javascript
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".imds-line-clamp-trigger").forEach((container) => {
    const pElement = container.querySelector("p");
    const iconElement = container.querySelector("i");

    container.addEventListener("click", (event) => {
      event.stopPropagation();

      if (window.getSelection()?.toString()) {
        // 正在选择文本（复制操作）时不切换
        return;
      }

      pElement.classList.toggle("imds-line-clamp-1");

      if (iconElement.classList.contains("fa-caret-right")) {
        iconElement.classList.remove("fa-caret-right");
        iconElement.classList.add("fa-caret-down");
        container.setAttribute("title", "收起");
      } else {
        iconElement.classList.remove("fa-caret-down");
        iconElement.classList.add("fa-caret-right");
        container.setAttribute("title", "展开");
      }
    });
  });
});
```

## CSS 意图

触发容器的布局意图（相当于 `sample-explanation` 的说明用类不包含在生成物中，以内联 `style` 代替）:

- `display: flex; align-items: flex-start` → 图标与文本顶端对齐横向排列
- `cursor: pointer` → 表示可点击
- `max-width: 100%` → 限制在父容器宽度内

## 实现注意事项

- `window.getSelection().toString()` 不为空时（正在选择文本）不切换。这是为了不妨碍复制操作的必要考量。
- 每次点击时，须同步进行 `imds-line-clamp-1` 的添加/移除、`fa-caret-right` / `fa-caret-down` 的切换以及 `title` 属性的更新（「展开」⇔「收起」）。
- `sample-*` 的说明用类不包含在生成物中。布局以内联 `style` 代替。
