# Simple Wizard Screen Template

## Overview

A presentation page template (HTML part only) for a screen that represents a simple wizard.
The imds stepper shows the import process (Select File → Review Content → Import Result), and the screen for step 1 (Select File) is displayed. When a file is selected, the selected file list is displayed and the "Proceed to Review Content" button becomes enabled.

### Correspondence with imds Templates

- The screen structure conforms to step 1 of the import screen template `assets/imds-import-screen.md` in the `jssp-imds-theme` skill
- For the structure of step 2 (Review Content) and step 3 (Import Result), refer to the same template

## Template

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- CSS that controls the height and width of the content display area, which differ by theme -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  <!-- Custom styles for the presentation page -->
  <style>
    /* Layout control styles */
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
  <!-- Presentation page script -->
  <script>
  (function() {
    document.addEventListener('DOMContentLoaded', () => {
      // Extension of importable files
      const ACCEPT_EXTENSION = '.zip';

      const dropArea = document.getElementById('file-drop-area');
      const fileInput = document.getElementById(':importFile:');
      const fileList = document.getElementById('uploaded-file-list');
      const fileListBody = document.getElementById('uploaded-file-list-body');
      const toConfirmButton = document.getElementById('to-confirm-button');

      // Convert the file size into a display string
      function formatFileSize(size) {
        if (size >= 1024 * 1024) {
          return (size / (1024 * 1024)).toFixed(1) + 'MB';
        }
        return Math.max(1, Math.ceil(size / 1024)) + 'KB';
      }

      // Render the selected file list and toggle the enabled state of the "Proceed to Review Content" button
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
        deleteButton.title = 'Delete';
        deleteButton.innerHTML = '<span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>';
        deleteButton.addEventListener('click', () => {
          fileInput.value = '';
          renderFileList();
        });
        deleteCell.appendChild(deleteButton);
        tr.appendChild(deleteCell);

        fileListBody.appendChild(tr);
      }

      // Validate the extension and confirm the file (the accept attribute does not apply to drag and drop, so it is validated here)
      function selectFiles(files) {
        if (files.length > 0 && !files[0].name.toLowerCase().endsWith(ACCEPT_EXTENSION)) {
          fileInput.value = '';
          imuiShowErrorMessage('The only importable file format is zip.');
        } else if (files !== fileInput.files) {
          fileInput.files = files;
        }
        renderFileList();
      }

      // Open the hidden input[type="file"] when the "Select File" button is pressed
      document.getElementById('file-select-button').addEventListener('click', () => {
        fileInput.click();
      });
      fileInput.addEventListener('change', () => {
        selectFiles(fileInput.files);
      });

      // Accept files by drag and drop
      dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
      });
      dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        selectFiles(event.dataTransfer.files);
      });

      // TODO: Implement the file upload and the switch to step 2 (Review Content)
      toConfirmButton.addEventListener('click', () => {
      });

      renderFileList();
    });
  })();
  </script>
</imart>

<!-- Full-page container (no id is added, since it is placed inside the intra-mart theme's <div id="imui-container">) -->
<div class="imds-container pgstyle-layout-container">
  <!-- Header -->
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

  <!-- Main content -->
  <main class="pgstyle-layout-main">
    <div class="imds-stepper">
      <ul>
        <li class="imds-stepper-step is-active">
          <button disabled><span>1. Select File</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>2. Review Content</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>3. Import Result</span></button>
        </li>
      </ul>
    </div>
    <section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar">
      <div class="imds-message is-outlined is-info imds-mb-4">
        <div class="imds-message-title">
          <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
          <p>Select File</p>
        </div>
        <div class="imds-message-content">
          <p>Import the export data of ${Sample}.</p>
          <p>Select a file and click the Proceed to Review Content button.</p>
          <p>The only importable file format is zip.</p>
        </div>
      </div>
      <div class="imds-file-upload">
        <div class="imds-file-upload-drop-area" id="file-drop-area">
          <input type="file" id=":importFile:" accept=".zip" />
          <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
          <p class="imds-file-upload-message">Drag and drop a file here</p>
          <p class="imds-file-upload-text">or</p>
          <button type="button" id="file-select-button" class="imds-button is-outlined is-small is-primary">Select File</button>
        </div>
      </div>
      <!-- Selected file list (rows are generated by JavaScript when a file is selected) -->
      <div class="imds-file-upload-list" id="uploaded-file-list" style="display: none;">
        <table>
          <tbody id="uploaded-file-list-body"></tbody>
        </table>
      </div>
      <button type="button" id="to-confirm-button" class="imds-button is-primary imds-mt-7" style="min-width: 8em;" disabled>
        Proceed to Review Content
      </button>
    </section>
  </main>
</div>
```

## Notes

- Define `$title` (e.g. `'${Sample} Import'`) / `$subTitle` as bind variables in the function container
- `${Sample}` is a placeholder for the data type name. Also change the importable file format (the `accept` attribute, `ACCEPT_EXTENSION`, and the supplementary messages) to match the implementation target
- The stepper buttons are `disabled`, so steps are not switched by clicking the stepper. Implement the file upload and the step switch when the "Proceed to Review Content" button is pressed (moving `is-active` / `is-completed` and switching the displayed content) separately in JavaScript
- Keep the "Proceed to Review Content" button `disabled` until a file is selected, and set it back to `disabled` when the list becomes empty via the delete button
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` are fixed class names, not placeholders to be replaced per feature. Because the layout is based on `height: 100%`, do not remove the loading of `theme-conditional-layout.css`
