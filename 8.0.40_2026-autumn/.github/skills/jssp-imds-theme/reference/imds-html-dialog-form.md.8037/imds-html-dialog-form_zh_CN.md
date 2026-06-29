---
paths:
  - "src/main/jssp/**/*.html"
---

# Dialog + Form（对话框内表单）

## 基本信息

将 Form（输入表单）组合到 Dialog（弹出窗口）中的复合模式。
用于新建、编辑、复制等模态输入。

- 各个组件的详细信息请参考：
  - 对话框本体：[imds-html-dialog.md](imds-html-dialog.md)
  - 表单元素：[imds-html-field.md](imds-html-field.md) / [imds-html-field-group.md](imds-html-field-group.md)
  - 输入部件：[imds-html-textbox.md](imds-html-textbox.md) / [imds-html-textbox-control.md](imds-html-textbox-control.md) / [imds-html-button.md](imds-html-button.md)
- 基础类：`imds-dialog` + `imds-form`

## 整体结构

```
imds-dialog-wrapper                      # 尺寸控制包装器
└── imds-dialog                          # 对话框本体
    ├── imds-dialog-header               # 头部（标题 + 关闭按钮）
    ├── imds-dialog-content (+ scrollbar)# 内容区域（纵向溢出时滚动）
    │   └── imds-px-4 imds-py-3          # 内侧边距包装（避免表单贴边）
    │       └── form.imds-form
    │           └── imds-field-container # 统一包装所有 field
    │               ├── imds-field        # 各输入项
    │               ├── imds-field-group  # 复合输入（如多语言输入）
    │               └── ...
    └── imds-dialog-footer               # 底部（操作按钮组）
        └── imds-p-4                     # 内侧边距包装
            ├── button（取消）
            └── button.is-primary（注册 / 更新等）
```

## CSS Classes Reference（本模式特有）

| 类名 | 应用对象 | 用途 | 必填/可选 |
|----------|--------|------|----------------|
| imds-dialog-footer | div 元素（`imds-dialog` 末尾） | 底部区域（放置操作按钮） | 必填（表单用途时推荐） |
| imds-form | form 元素 | 应用表单样式 | 必填 |
| imds-field-container | div 元素 | 多个 field 的集合 | 必填 |
| imds-px-4 imds-py-3 | 内容内侧包装 div | 横向/纵向内侧边距 | 实质上必填（也可使用 `imds-p-4`） |

其他类请参考各个 reference 文件。

## HTML 代码片段

### 基本：新建对话框（`<dialog>` 根 / 推荐）

```html
<dialog
  id="category-create-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="category-create-dialog-title"
  style="height: 450px; width: 600px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="category-create-dialog-title" title="新建类别">新建类别</h1>
        </div>
      </div>
      <button
        type="button"
        class="imds-button is-ghost is-small imds-dialog-header-close"
        aria-label="关闭">
        <span class="imds-icon"><i class="fa-solid fa-times"></i></span>
      </button>
    </div>
    <div class="imds-dialog-content imds-scrollbar">
      <div class="imds-px-4 imds-py-3">
        <form class="imds-form">
          <div class="imds-field-container">
            <!-- 在此处排列各个 imds-field / imds-field-group -->
          </div>
        </form>
      </div>
    </div>
    <div class="imds-dialog-footer">
      <div
        class="imds-p-4"
        style="display:flex; gap:0 1em; justify-content: flex-end">
        <button type="button" class="imds-button" style="width: 8em">取消</button>
        <button type="submit" class="imds-button is-primary" style="width: 8em">注册</button>
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// 打开
document.getElementById('category-create-dialog').showModal();

// 关闭
document.getElementById('category-create-dialog').close();
```

以下仅展示与基本模式的差异（字段差异、变体）。

## 字段排列模式

`imds-field-container` 中排列的输入项的不同形态。

### 1. 必填文本输入（星号显示）

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label
      for="categoryId"
      class="imds-required-label-required-asterisk has-text-weight-bold">
      类别 ID
    </label>
  </div>
  <div class="imds-field-control">
    <input type="text" id="categoryId" class="imds-textbox" />
  </div>
</div>
```

### 2. 多语言输入（field-group + 语言切换按钮）

「标准语言输入框 + 打开其他语言对话框的地球图标」的复合输入。
外层用带边框的装饰性 `<div>` 包裹，内部放入 `imds-field-group`。

```html
<div class="imds-field-group">
  <div class="imds-field-group-label">
    <label for="categoryNameStd" class="has-text-weight-bold">类别名称</label>
  </div>
  <div style="border:1px solid #d6d6d6; border-radius:4px; padding: 1em;">
    <div class="imds-field-group">
      <div class="imds-field-group-control">
        <div class="imds-field">
          <div class="imds-field-label">
            <label for="categoryNameStd" class="imds-required-label-required-asterisk">标准</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id="categoryNameStd" class="imds-textbox" value="" />
            <button type="button" class="imds-button" aria-label="打开多语言输入">
              <span class="imds-icon"><i class="fa-solid fa-globe"></i></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 3. 数值输入（min/max + 宽度限制）

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label
      for="sortNumber"
      class="imds-required-label-required-asterisk has-text-weight-bold">
      排序号
    </label>
  </div>
  <div class="imds-field-control">
    <input
      type="number"
      id="sortNumber"
      min="0"
      max="99999"
      class="imds-textbox"
      style="max-width: 10em" />
  </div>
</div>
```

### 4. 弹出选择（readonly 文本 + 搜索图标 + 清除按钮）

从另一个选择对话框设置值的项目。将 `input` 设为 `readonly` 以防止直接编辑，通过搜索图标调用弹窗，通过 `×` 按钮清除已选值。

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label class="has-text-weight-bold">父类别</label>
  </div>
  <div class="imds-field-control">
    <div class="imds-field">
      <div class="imds-field-control">
        <div class="imds-textbox-control">
          <input
            type="text"
            id="parentCategoryName"
            readonly="readonly"
            placeholder="请选择类别"
            class="imds-textbox" />
          <span class="imds-icon is-small">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
        </div>
        <button
          type="button"
          title="清除"
          class="imds-button is-ghost"
          aria-label="清除父类别">
          <span class="imds-icon">
            <i class="fa-regular fa-xmark-circle"></i>
          </span>
        </button>
      </div>
    </div>
  </div>
</div>
```

## 变体

### 编辑对话框

只需要变更标题与按钮文案，结构与新建对话框相同。

```html
<div class="imds-dialog-title">
  <h1 title="编辑类别">编辑类别</h1>
</div>
<!-- ... -->
<button type="submit" class="imds-button is-primary" style="width: 8em">更新</button>
```

### 与删除确认对话框的区别

- **伴随输入**（新建、编辑、复制等）→ 本模式（dialog + form）
- **仅确认**（删除、丢弃）→ 使用 [imds-csjs-confirm.md](imds-csjs-confirm.md) 中的 `imdsConfirm`

### 尺寸调整

通过 `imds-dialog-wrapper` 的 `style` 修改对话框尺寸。

```html
<!-- 较小 -->
<dialog class="imds-dialog-wrapper" style="height: 320px; width: 480px;">

<!-- 较大（许多输入项纵向排列） -->
<dialog class="imds-dialog-wrapper" style="height: 600px; width: 720px;">
```

即使输入项增多，也应将对话框本身保持固定尺寸，让 `imds-dialog-content imds-scrollbar` 一侧纵向滚动。

## 实现注意事项

- **根元素以 `<dialog>` 为基础**。`<div>` 根需要自行实现模态化、ESC 关闭、焦点陷阱，遗漏将成为 bug 温床（详见 [imds-html-dialog.md](imds-html-dialog.md)）
- **内容区域的内侧边距必填**。`imds-dialog-content` 本身没有 padding，因此必须将内部用 `imds-px-4 imds-py-3`（横向 1rem / 纵向 0.75rem）或 `imds-p-4`（四方均为 1rem）包裹。否则表单边缘会贴到对话框边缘
- **`imds-dialog-footer` 为固定布局**。即使 `imds-dialog-content` 滚动，底部按钮组也始终可见。请务必将操作按钮放在 footer 一侧，不要放在 content 内
- **按钮基本右对齐**。使用 `display:flex; gap:0 1em; justify-content: flex-end` 按「取消 → 主操作」的顺序排列
- **`<form>` 的 submit 处理**：注册按钮指定 `type="submit"`，取消、关闭按钮明确指定 `type="button"`。未指定 `type` 时浏览器可能将其视为 submit 而提交表单，因此必须指定
- **input id 必须唯一**。同一画面定义多个对话框时，`id="categoryId"` 这样的通用 id 会冲突。请使用对话框标识符作为前缀（例：`id="create-categoryId"` / `id="edit-categoryId"`）
- **校验**：各 `imds-field` 的错误显示请参考 [imds-html-field.md](imds-html-field.md) 的「校验错误」一节（`imds-validation-error` 类 + `imds-error-text` 元素）。在 submit 之前用 JS 验证值，并在对应 field 上添加或移除标记
- **多语言输入按钮（地球图标）**用于打开另一个对话框来输入其他语言的值。在不需要多语言的画面中请删除并改为简单的 textbox
- **弹出选择字段**调用 IM-共通主数据搜索对话框时，请参考 `jssp-im-master-usage` 技能的 reference（不要凭记忆书写 `imACMSearch` 标签参数）
