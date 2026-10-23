# 简单向导画面模板

## 概述

表现简单向导的画面构成的呈现页面（仅HTML部分）模板。
使用 imds 的步进器显示导入流程（选择文件 → 确认内容 → 导入结果），并显示步骤1（选择文件）的画面。选择文件后会显示已选文件列表，"前往确认内容"按钮变为可用。

### 与 imds 模板的对应关系

- 画面构成遵循 `jssp-imds-theme` 技能的导入画面模板 `assets/imds-import-screen.md` 的步骤1
- 步骤2（确认内容）・步骤3（导入结果）的构成请参考同一模板

## 模板

```html
<!-- 头部 -->
<imart type="head">
  <!-- 标题 -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- 控制因主题而异的内容显示区域高度和宽度的 CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  <!-- 呈现页面的自定义样式 -->
  <style>
    /* 布局控制用样式 */
    .pgstyle-layout-container {
      grid-template-rows: 5rem minmax(0, 1fr);
      grid-template-columns: 100%;
      height: 100%;
      display: grid;
    }
    .pgstyle-layout-container > .imds-header {
      grid-row: 1 / 2;
    }
    .pgstyle-layout-main {
      flex-direction: column;
      grid-row: 2 / 3;
      height: 100%;
      display: flex;
    }
    .pgstyle-layout-content {
      flex: 1 0 0;
      overflow: auto;
    }
  </style>
  <!-- 呈现页面的脚本 -->
  <script>
  (function() {
    document.addEventListener('DOMContentLoaded', () => {
      // 可导入文件的扩展名
      const ACCEPT_EXTENSION = '.zip';

      const dropArea = document.getElementById('file-drop-area');
      const fileInput = document.getElementById(':importFile:');
      const fileList = document.getElementById('uploaded-file-list');
      const fileListBody = document.getElementById('uploaded-file-list-body');
      const toConfirmButton = document.getElementById('to-confirm-button');

      // 将文件大小转换为显示用字符串
      function formatFileSize(size) {
        if (size >= 1024 * 1024) {
          return (size / (1024 * 1024)).toFixed(1) + 'MB';
        }
        return Math.max(1, Math.ceil(size / 1024)) + 'KB';
      }

      // 绘制已选文件列表，并切换"前往确认内容"按钮的可用状态
      function renderFileList() {
        const file = fileInput.files.length > 0 ? fileInput.files[0] : null;
        fileListBody.textContent = '';
        fileList.style.display = file ? '' : 'none';
        toConfirmButton.disabled = !file;
        if (!file) {
          return;
        }

        const tr = document.createElement('tr');

        const nameCell = document.createElement('td');
        const nameWrapper = document.createElement('span');
        nameWrapper.innerHTML = '<span class="imds-icon is-gray-light imds-file-upload-file-icon"><i class="fa-regular fa-file"></i></span>';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'imds-file-upload-name';
        nameSpan.textContent = file.name;
        nameWrapper.appendChild(nameSpan);
        nameCell.appendChild(nameWrapper);
        tr.appendChild(nameCell);

        const sizeCell = document.createElement('td');
        sizeCell.className = 'imds-file-upload-size';
        const sizeSpan = document.createElement('span');
        sizeSpan.textContent = formatFileSize(file.size);
        sizeCell.appendChild(sizeSpan);
        tr.appendChild(sizeCell);

        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'imds-button is-ghost';
        deleteButton.title = '删除';
        deleteButton.innerHTML = '<span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>';
        deleteButton.addEventListener('click', () => {
          fileInput.value = '';
          renderFileList();
        });
        deleteCell.appendChild(deleteButton);
        tr.appendChild(deleteCell);

        fileListBody.appendChild(tr);
      }

      // 验证扩展名并确定文件（accept 属性不适用于拖放，因此在此处验证）
      function selectFiles(files) {
        if (files.length > 0 && !files[0].name.toLowerCase().endsWith(ACCEPT_EXTENSION)) {
          fileInput.value = '';
          imuiShowErrorMessage('可导入的文件格式仅限 zip。');
        } else if (files !== fileInput.files) {
          fileInput.files = files;
        }
        renderFileList();
      }

      // 点击"选择文件"按钮时，打开隐藏的 input[type="file"]
      document.getElementById('file-select-button').addEventListener('click', () => {
        fileInput.click();
      });
      fileInput.addEventListener('change', () => {
        selectFiles(fileInput.files);
      });

      // 通过拖放接收文件
      dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
      });
      dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        selectFiles(event.dataTransfer.files);
      });

      // TODO: 请实现文件上传以及切换到步骤2（确认内容）的处理
      toConfirmButton.addEventListener('click', () => {
      });

      renderFileList();
    });
  })();
  </script>
</imart>

<!-- 整个页面的容器（配置在 intra-mart 主题的 imui-container 内部，因此不附加 id） -->
<div class="imds-container pgstyle-layout-container">
  <!-- 头部 -->
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-file-import"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>

  <!-- 主要内容 -->
  <main class="pgstyle-layout-main">
    <div class="imds-stepper">
      <ul>
        <li class="imds-stepper-step is-active">
          <button disabled><span>1.选择文件</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>2.确认内容</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>3.导入结果</span></button>
        </li>
      </ul>
    </div>
    <section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar">
      <div class="imds-message is-outlined is-info imds-mb-4">
        <div class="imds-message-title">
          <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
          <p>选择文件</p>
        </div>
        <div class="imds-message-content">
          <p>导入${示例}的导出数据。</p>
          <p>选择文件后，点击前往确认内容按钮。</p>
          <p>可导入的文件格式仅限 zip。</p>
        </div>
      </div>
      <div class="imds-file-upload">
        <div class="imds-file-upload-drop-area" id="file-drop-area">
          <input type="file" id=":importFile:" accept=".zip" />
          <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
          <p class="imds-file-upload-message">请将文件拖放至此处</p>
          <p class="imds-file-upload-text">或</p>
          <button type="button" id="file-select-button" class="imds-button is-outlined is-small is-primary">选择文件</button>
        </div>
      </div>
      <!-- 已选文件列表（选择文件时由 JavaScript 生成行） -->
      <div class="imds-file-upload-list" id="uploaded-file-list" style="display: none;">
        <table>
          <tbody id="uploaded-file-list-body"></tbody>
        </table>
      </div>
      <button type="button" id="to-confirm-button" class="imds-button is-primary imds-mt-7" style="min-width: 8em;" disabled>
        前往确认内容
      </button>
    </section>
  </main>
</div>
```

## 注意事项

- 请在函数容器中将 `$title`（例：`'${示例}导入'`）/ `$subTitle` 定义为绑定变量
- `${示例}` 是数据类型名称的占位符。可导入的文件格式（`accept` 属性・`ACCEPT_EXTENSION`・补充消息）也请根据实现对象进行修改
- 步进器的按钮为 `disabled`，因此不通过点击步进器切换步骤。文件上传以及点击"前往确认内容"按钮时的步骤切换（`is-active` / `is-completed` 的更替与显示内容的切换）需另行使用 JavaScript 实现
- "前往确认内容"按钮在文件选择完成之前保持 `disabled`，通过删除按钮使列表变为空时，再次恢复为 `disabled`
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` 是固定类名，并非按功能替换的占位符。由于以 `height: 100%` 为基础，请勿删除 `theme-conditional-layout.css` 的加载
