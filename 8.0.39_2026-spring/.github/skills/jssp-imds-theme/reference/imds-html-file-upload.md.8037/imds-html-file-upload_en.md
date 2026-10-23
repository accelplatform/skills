---
paths:
  - "src/main/jssp/**/*.html"
---

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

The list of uploaded files is implemented outside `imds-file-upload` as an `imds-file-upload-list` table structure (see "Uploaded File List" below for details).

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-file-upload | Outer div | File upload container | Required |
| imds-file-upload-drop-area | div element | Drag & drop area | Required |
| imds-file-upload-message | p element | Main message | Required |
| imds-file-upload-text | p element | Supplementary text ("or" etc.) | Optional |
| is-small | imds-file-upload | Small size display | Optional |
| imds-file-upload-list | div element (contains a `table`) | Container for the uploaded file list | Required when displaying a file list |
| imds-file-upload-name | span element | File name display | Required when displaying a file list |
| imds-file-upload-file-icon | span.imds-icon | File icon (list before upload; not downloadable) | Depending on the situation |
| imds-file-upload-download-icon | span.imds-icon | Download icon (file link when viewing) | Depending on the situation |
| imds-file-upload-date | td element | Upload date/time column | Optional |
| imds-file-upload-size | td element | File size column | Optional |

## HTML Snippets

### Basic File Upload

```html
<div class="imds-file-upload">
  <div class="imds-file-upload-drop-area">
    <input type="file" />
    <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
    <p class="imds-file-upload-message">Please drag & drop files here</p>
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

### Uploaded File List

A list table showing uploaded files. Place it outside (below) the `imds-file-upload` container. File name, upload date/time and size are samples, not required items; choose which to display as needed.

#### File List Before Upload (Uncommitted)

A list of selected files that are not saved on the server. File names are not links, and the icon is `fa-regular fa-file` (`imds-file-upload-file-icon`).

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
          <button type="button" class="imds-button is-ghost" title="Delete">
            <span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

#### File List When Viewing (Already Uploaded)

A list for viewing attachments already saved on the server. The differences from the pre-upload list are that the file name is an `<a>` link and the icon is the download icon (`fa-solid fa-download`, `imds-file-upload-download-icon`).

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
          <button type="button" class="imds-button is-ghost" title="Delete">
            <span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Implementation Notes

- Place `input[type="file"]` inside the drop area and hide it with CSS; operate via button click or drag-and-drop
- When the file selection button is clicked, call `click()` on `input[type="file"]` with JavaScript
- Implement the list of uploaded files with the structure `imds-file-upload-list` > `table` > `tbody` > `tr` (follow this structure also when generating rows dynamically with JavaScript)
- Use `imds-file-upload-file-icon` (file icon, not a link) before upload, and `imds-file-upload-download-icon` (download icon, `<a>` link) when viewing uploaded files
- For the delete button, use `imds-button is-ghost` + `title="Delete"` + `fa-regular fa-circle-xmark`
- When using `is-small`, also change the button size to `is-x-small` and shorten the message
