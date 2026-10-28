---
paths:
  - "src/main/jssp/**/*.html"
---

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

已上传文件的列表显示在 `imds-file-upload` 外部，以 `imds-file-upload-list` 表格结构实现（详情请参阅后述的"上传后的文件列表"）。

## CSS 类参考

| 类名 | 应用于 | 用途 | 必须/可选 |
|----------|--------|------|----------------|
| imds-file-upload | 外层 div | 文件上传容器 | 必须 |
| imds-file-upload-drop-area | div 元素 | 拖放区域 | 必须 |
| imds-file-upload-message | p 元素 | 主消息 | 必须 |
| imds-file-upload-text | p 元素 | 补充文本（"或"等） | 可选 |
| is-small | imds-file-upload | 小尺寸显示 | 可选 |
| imds-file-upload-list | div 元素（包含 `table`） | 上传后的文件列表容器 | 显示文件列表时必须 |
| imds-file-upload-name | span 元素 | 文件名显示 | 显示文件列表时必须 |
| imds-file-upload-file-icon | span.imds-icon | 文件图标（上传前的列表・不可下载） | 视情况而定 |
| imds-file-upload-download-icon | span.imds-icon | 下载图标（查看时的文件链接） | 视情况而定 |
| imds-file-upload-date | td 元素 | 上传日期时间列 | 可选 |
| imds-file-upload-size | td 元素 | 文件大小列 | 可选 |

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
    <p class="imds-file-upload-message">拖放文件到此处</p>
    <p class="imds-file-upload-text">或</p>
    <button
      type="button"
      class="imds-button is-outlined is-x-small is-primary">
      选择文件
    </button>
  </div>
</div>
```

### 上传后的文件列表

显示已上传文件的列表表格。放置在 `imds-file-upload` 容器的外部（下方）。文件名・上传日期时间・大小仅为示例，并非必须项目，请根据需要选择显示。

#### 上传前（未确定）的文件列表

尚未在服务器上确定保存的已选文件列表。文件名不作为链接，图标为 `fa-regular fa-file`（`imds-file-upload-file-icon`）。

```html
<div class="imds-file-upload-list">
  <table>
    <tbody>
      <tr>
        <td>
          <span>
            <span class="imds-icon is-gray-light imds-file-upload-file-icon"><i class="fa-regular fa-file"></i></span>
            <span class="imds-file-upload-name">sample-file-1.xlsx</span>
          </span>
        </td>
        <td class="imds-file-upload-date"><span>2024/06/04 17:23:34</span></td>
        <td class="imds-file-upload-size"><span>100KB</span></td>
        <td>
          <button type="button" class="imds-button is-ghost" title="删除">
            <span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

#### 查看时（已上传）的文件列表

查看已保存在服务器上的附件时的列表。与上传前的区别在于文件名变为 `<a>` 链接，图标变为下载图标（`fa-solid fa-download`、`imds-file-upload-download-icon`）。

```html
<div class="imds-file-upload-list">
  <table>
    <tbody>
      <tr>
        <td>
          <a href="#" title="sample-file-1.xlsx">
            <span class="imds-icon is-gray-light imds-file-upload-download-icon"><i class="fa-solid fa-download"></i></span>
            <span class="imds-file-upload-name">sample-file-1.xlsx</span>
          </a>
        </td>
        <td class="imds-file-upload-date"><span>2024/06/04 17:23:34</span></td>
        <td class="imds-file-upload-size"><span>100KB</span></td>
        <td>
          <button type="button" class="imds-button is-ghost" title="删除">
            <span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## 实现注意事项

- 将 `input[type="file"]` 放置在拖放区域内，通过 CSS 隐藏，通过按钮点击或拖放操作
- 点击文件选择按钮时，需要通过 JavaScript 调用 `input[type="file"]` 的 `click()`
- 已上传文件的列表显示以 `imds-file-upload-list` > `table` > `tbody` > `tr` 的结构实现（通过 JavaScript 动态生成行时也遵循此结构）
- 上传前使用 `imds-file-upload-file-icon`（文件图标・非链接），查看已上传文件时使用 `imds-file-upload-download-icon`（下载图标・`<a>` 链接），区分使用
- 删除按钮使用 `imds-button is-ghost` + `title="删除"` + `fa-regular fa-circle-xmark`
- 使用 `is-small` 时，同时将按钮尺寸改为 `is-x-small`，并缩短消息文本
