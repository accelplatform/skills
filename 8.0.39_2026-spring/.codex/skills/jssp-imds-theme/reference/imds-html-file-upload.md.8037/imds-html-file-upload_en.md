# FileUpload

## Overview

FileUpload is a component for uploading files.
Files can be uploaded via drag-and-drop or using the "Select File" button.
Uploaded files are displayed in a list below the file upload area.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-fileupload--documentation
- Base class: imds-file-upload

## Overall Structure

```
imds-file-upload                          # Container (is-small adjusts size)
└── imds-file-upload-drop-area            # Drag & drop area
    ├── input[type=file]                  # File-select input (hidden via CSS; multiple allowed)
    ├── imds-icon                         # Upload icon
    ├── p.imds-file-upload-message        # Main message
    ├── p.imds-file-upload-text           # Supplementary text (e.g., "or"; optional)
    └── button.imds-button                # File-select button (is-outlined + is-small / is-x-small)
```

The list of uploaded files is built outside `imds-file-upload` via JavaScript.

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-file-upload | Outer div | File upload container | Required |
| imds-file-upload-drop-area | div element | Drag & drop area | Required |
| imds-file-upload-message | p element | Main message | Required |
| imds-file-upload-text | p element | Supplementary text ("or" etc.) | Optional |
| is-small | imds-file-upload | Small size display | Optional |

## HTML Snippets

### Basic File Upload

```html
<div class="imds-file-upload">
  <div class="imds-file-upload-drop-area">
    <input type="file" />
    <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
    <p class="imds-file-upload-message">Drag & drop files here</p>
    <p class="imds-file-upload-text">or</p>
    <button
      type="button"
      class="imds-button is-outlined is-small is-primary">
      Select File
    </button>
  </div>
</div>
```

All subsequent snippets show only the differences from the basic file upload.

## Variations

### multiple (Multiple Files)

Add the `multiple` attribute to `input[type="file"]`.

```html
<input type="file" multiple />
```

### small (Small Size)

Add `is-small` to `div.imds-file-upload`.
Also change the button to `is-x-small`.

```html
<div class="imds-file-upload is-small">
  <div class="imds-file-upload-drop-area">
    <input type="file" />
    <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
    <p class="imds-file-upload-message">Drag & drop files here</p>
    <p class="imds-file-upload-text">or</p>
    <button
      type="button"
      class="imds-button is-outlined is-x-small is-primary">
      Select File
    </button>
  </div>
</div>
```

## Implementation Notes

- Place `input[type="file"]` inside the drop area and hide it with CSS; operate via button click or drag-and-drop
- When the file selection button is clicked, call `click()` on `input[type="file"]` with JavaScript
- Implement the list display of uploaded files separately with JavaScript
- When using `is-small`, also change the button size to `is-x-small` and shorten the message
