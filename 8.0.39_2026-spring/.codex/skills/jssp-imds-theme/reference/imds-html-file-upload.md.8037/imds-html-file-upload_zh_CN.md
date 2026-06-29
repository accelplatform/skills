# FileUpload

## 基本信息

FileUpload 是用于上传文件的组件。
文件可以通过拖放或使用"选择文件"按钮进行上传。
已上传的文件以列表形式显示在文件上传区域下方。

- 来源URL: https://document.intra-mart.jp/design/?path=/docs/components-fileupload--documentation
- 基础类: imds-file-upload

## 整体结构

```
imds-file-upload                          # 容器（is-small 调整尺寸）
└── imds-file-upload-drop-area            # 拖放区域
    ├── input[type=file]                  # 文件选择 input（通过 CSS 隐藏；可附加 multiple）
    ├── imds-icon                         # 上传图标
    ├── p.imds-file-upload-message        # 主消息
    ├── p.imds-file-upload-text           # 辅助文本（如"或"；可选）
    └── button.imds-button                # 文件选择按钮（is-outlined + is-small / is-x-small）
```

已上传文件的列表显示通过 JavaScript 在 `imds-file-upload` 外部构建。

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-file-upload | 外层 div | 文件上传容器 | 必须 |
| imds-file-upload-drop-area | div 元素 | 拖放区域 | 必须 |
| imds-file-upload-message | p 元素 | 主消息 | 必须 |
| imds-file-upload-text | p 元素 | 补充文本（"或"等） | 可选 |
| is-small | imds-file-upload | 小尺寸显示 | 可选 |

## HTML 代码片段

### 基本文件上传

```html
<div class="imds-file-upload">
  <div class="imds-file-upload-drop-area">
    <input type="file" />
    <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
    <p class="imds-file-upload-message">请将文件拖放到此处</p>
    <p class="imds-file-upload-text">或</p>
    <button
      type="button"
      class="imds-button is-outlined is-small is-primary">
      选择文件
    </button>
  </div>
</div>
```

以下仅显示与基本文件上传的差异部分。

## 变体

### multiple（多个文件）

在 `input[type="file"]` 上添加 `multiple` 属性。

```html
<input type="file" multiple />
```

### small（小尺寸）

在 `div.imds-file-upload` 上添加 `is-small`。
同时将按钮改为 `is-x-small`。

```html
<div class="imds-file-upload is-small">
  <div class="imds-file-upload-drop-area">
    <input type="file" />
    <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
    <p class="imds-file-upload-message">请将文件拖放到此处</p>
    <p class="imds-file-upload-text">或</p>
    <button
      type="button"
      class="imds-button is-outlined is-x-small is-primary">
      选择文件
    </button>
  </div>
</div>
```

## 实现注意事项

- 将 `input[type="file"]` 放置在拖放区域内，通过 CSS 隐藏，通过按钮点击或拖放操作
- 点击文件选择按钮时，需要通过 JavaScript 调用 `input[type="file"]` 的 `click()`
- 已上传文件的列表显示需另行用 JavaScript 实现
- 使用 `is-small` 时，同时将按钮尺寸改为 `is-x-small`，并缩短消息文本
