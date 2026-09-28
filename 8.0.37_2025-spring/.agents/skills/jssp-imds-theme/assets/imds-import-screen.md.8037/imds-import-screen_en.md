# Import Screen Implementation Example

An implementation example of a business import screen that combines imds theme components.
Using the "Assistant Definition" screen as the subject, this shows the composition pattern for the header, stepper, file selection, content confirmation, and import result.

This page uses a fixed-header layout, in which the header stays fixed while only the content of each stepper step scrolls vertically. For the canonical CSS design and DOM structure pattern, see [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md).

## Components Used

| Component | reference | Usage in this example |
|---------------|-----------|-------------|
| Header | [header.md](../reference/header.md) | Page header with related-screen menu |
| Stepper | [stepper.md](../reference/stepper.md) | Progress display for the import process (3 steps) |
| Message | [message.md](../reference/message.md) | Supplementary explanation of import conditions |
| FileUpload | [file-upload.md](../reference/file-upload.md) | File upload area + post-upload file list |
| CollapseMessage | [collapse-message.md](../reference/collapse-message.md) | Collapsible display of status notes / caveats |
| Table | [table.md](../reference/table.md) | Import content confirmation table / result summary table |
| Checkbox | [checkbox.md](../reference/checkbox.md) | "Show failures only" filter |
| Button | [button.md](../reference/button.md) | Execute / back buttons for each step |

## Overall Structure

For details of the fixed-header layout (a 2-row grid on `imds-container`, a vertical flex on `<main>`, and `flex:1 0 0; overflow:auto` on the step content), see [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md).

```
div.imds-container                    ... root div (placed inside the intra-mart theme's imui-container, so no id is assigned and no intermediate wrapper is inserted)
├── header.imds-header               ... page header (related-screen menu, title; fixed)
└── main (vertical flex container)
    ├── div.imds-stepper              ... progress stepper (3 steps; fixed, flex:0 0 auto)
    └── section (switched per step; has imds-scrollbar, flex:1 0 0; overflow:auto)
        ├── Step 1: Select File
        │   ├── imds-message         ... supplementary message (supported formats, etc.)
        │   ├── imds-file-upload      ... file upload area
        │   ├── imds-file-upload-list ... list of uploaded files
        │   └── button                ... go to content confirmation
        ├── Step 2: Confirm Content
        │   ├── imds-collapse-message × N ... status notes / caveats
        │   ├── imds-table            ... import content list (with status column)
        │   └── footer (directly under main, outside the scroll area, flex:0 0 auto) ... back / run import
        └── Step 3: Import Result
            ├── sample-import-result-container ... result icon + message + action buttons
            └── imds-table            ... result summary table
```

```css
.assistant-import-layout-container {
  height: 100vh;
  display: grid;
  grid-template-rows: 5rem minmax(0, 1fr);
  grid-template-columns: 100%;
}
.assistant-import-layout-container > .imds-header {
  grid-row: 1 / 2;
}
.assistant-import-layout-main {
  grid-row: 2 / 3;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.assistant-import-step-panel {
  flex: 1 0 0;
  overflow: auto;
}
.assistant-import-footer {
  flex: 0 0 auto;
}
```

```html
<div class="imds-container assistant-import-layout-container">
  <header class="imds-header">…</header>
  <main class="assistant-import-layout-main">
    <div class="imds-stepper">…</div>
    <section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar">
      <!-- Content for each step (see 3–5 below) -->
    </section>
  </main>
</div>
```

## 1. Page Header

This is usually paired with an export screen, so it follows the same `imds-header-nav` (combined with Popover) pattern as its base.

```html
<header class="imds-header">
  <div class="imds-popover is-left imds-header-nav">
    <button
      type="button"
      class="imds-button is-ghost is-large"
      aria-haspopup="true"
      aria-controls="imds-popover-nav">
      <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
      <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
    </button>
    <div id="imds-popover-nav" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a href="#"><span>Assistant Definition List</span></a></li>
            <li><a href="#"><span>Assistant Definition Export</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
  </div>
</header>
```

**Points:**
- The header must always contain exactly one of `imds-header-icon` / `imds-header-back-button` / `imds-header-nav`.
- Do not place an import-execute button in `imds-header-actions` (the principle of not placing business action buttons in the header also applies to import screens).

## 2. Stepper

Structure the import screen as 3 steps: "Select File" → "Confirm Content" → "Import Result".

```html
<div class="imds-stepper">
  <ul>
    <li class="imds-stepper-step is-active">
      <button disabled><span>1. Select File</span></button>
    </li>
    <li class="imds-stepper-step">
      <button disabled><span>2. Confirm Content</span></button>
    </li>
    <li class="imds-stepper-step">
      <button disabled><span>3. Import Result</span></button>
    </li>
  </ul>
</div>
```

## 3. Step 1: Select File

Composed of a supplementary message + file upload area + post-upload file list.

```html
<section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar">
  <div class="imds-message is-outlined is-info imds-mb-5">
    <div class="imds-message-title">
      <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
      <p>Select File</p>
    </div>
    <div class="imds-message-content">
      <p>Import the exported data of the assistant definitions.</p>
      <p>Select a file and click the "Go to content confirmation" button.</p>
      <p>The only file format that can be imported is zip.</p>
    </div>
  </div>
  <div class="imds-file-upload">
    <div class="imds-file-upload-drop-area">
      <input type="file" accept=".zip">
      <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
      <p class="imds-file-upload-message">Drag and drop a file here</p>
      <p class="imds-file-upload-text">or</p>
      <button type="button" class="imds-button is-outlined is-small is-primary">Select File</button>
    </div>
  </div>
  <!-- File list inserted by JS after the upload completes -->
  <div class="imds-file-upload-list" id="uploaded-file-list">
    <table>
      <tbody>
        <tr>
          <td>
            <span>
              <span class="imds-icon is-gray-light imds-file-upload-file-icon"><i class="fa-regular fa-file"></i></span>
              <span class="imds-file-upload-name">assistant-definitions.zip</span>
            </span>
          </td>
          <td class="imds-file-upload-date"><span>2026/07/24 10:00</span></td>
          <td class="imds-file-upload-size"><span>1.2MB</span></td>
          <td>
            <button type="button" class="imds-button is-ghost" title="Delete">
              <span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <button type="button" id="to-confirm-button" class="imds-button is-primary imds-mt-7" style="min-width:8em;" disabled>
    Go to Content Confirmation
  </button>
</section>
```

**Points:**
- Keep the "Go to content confirmation" button `disabled` until the file upload completes.
- The file list (`imds-file-upload-list`) is inserted by JavaScript after the upload completes. Place a file icon, file name, upload date/time, size, and a delete button in each row.
- If a file is removed via the delete button and the list becomes empty, set the "Go to content confirmation" button back to `disabled`.

## 4. Step 2: Confirm Content

Display a list that lets the user check the content of the uploaded file by status (new / updated / deleted / unchanged).

```html
<section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar">
  <div class="imds-collapse-message is-outlined is-small is-info imds-mb-3">
    <input type="checkbox" id="status-note-toggle">
    <label for="status-note-toggle">
      <div class="imds-message-title">
        <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
        <p>Supplementary Notes on Status</p>
      </div>
      <span class="imds-icon imds-collapse-message-chevron"><i class="fa-solid fa-chevron-down"></i></span>
    </label>
    <div class="imds-message-content">
      <p>The statuses below correspond to special cases; please check the table for details.</p>
      <div class="imds-table is-bordered is-area-bordered is-narrow">
        <div class="imds-table-inner">
          <table>
            <thead>
              <tr>
                <th><span>Status</span></th>
                <th><span>Description</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="is-warning">
                  <span>Updated</span>
                  <span class="imds-icon imds-ml-2 is-warning"><i class="fa-solid fa-warning"></i></span>
                </td>
                <td><span>The existing data will be updated.</span></td>
              </tr>
              <tr>
                <td class="is-danger">
                  <span>Deleted</span>
                  <span class="imds-icon imds-ml-2 is-danger"><i class="fa-solid fa-triangle-exclamation"></i></span>
                </td>
                <td><span>The existing data will be deleted.</span></td>
              </tr>
              <tr>
                <td><span>Unchanged</span></td>
                <td><span>The existing data is identical to the import content. Only the update date/time will be updated.</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <div class="imds-table is-sticky" style="max-height: 400px;">
    <div class="imds-table-inner">
      <table>
        <thead>
          <tr>
            <th><span>Status</span></th>
            <th><span>Assistant Definition Name</span></th>
            <th><span>Category</span></th>
          </tr>
        </thead>
        <tbody id="import-preview-table-body"></tbody>
      </table>
    </div>
  </div>
</section>
<!-- Place the footer directly under main, outside the scrollable area (section), and fix it with flex:0 0 auto -->
<div class="assistant-import-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button type="button" id="back-to-file-select" class="imds-button is-outlined" style="min-width:8em;">Back</button>
  <button type="button" id="import-execute-button" class="imds-button is-primary" style="min-width:8em;">Import</button>
</div>
```

**Points:**
- Show status notes and caveats with `imds-collapse-message` (collapsible), and include it only when needed. When using a table inside the message, use a Table variant such as `is-bordered is-area-bordered is-narrow`.
- "Unchanged" data is also included in the import target; make it clear that only the updater and update date/time are updated.
- Clicking the back button returns to Step 1 (file selection).

## 5. Step 3: Import Result

Switch the summary display depending on the outcome of the import (success / warning / error).

### 5-A. Success

```html
<section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar sample-import-result-container">
  <div class="sample-import-result-icon">
    <span class="imds-icon is-success"><i class="fa-regular fa-circle-check"></i></span>
  </div>
  <div class="sample-import-result-content">
    <div class="sample-import-result-message">
      <p>The import of the assistant definitions is complete.</p>
      <p>Check the list for details.</p>
    </div>
    <div class="sample-import-result-button-group">
      <button type="button" class="imds-button is-primary">Open Assistant Definition List</button>
      <button type="button" class="imds-button">Back to Import Screen</button>
    </div>
  </div>
  <div class="imds-table is-bordered is-area-bordered sample-import-info-table">
    <div class="imds-table-inner">
      <table>
        <tbody>
          <tr>
            <th rowspan="2"><span>Number of Imported Items</span></th>
            <th><span>Category</span></th>
            <td><span>10 items</span></td>
          </tr>
          <tr>
            <th><span>Assistant Definition</span></th>
            <td><span>10 items</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>Import File</span></th>
            <td><span>assistant-definitions.zip</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>Completion Date/Time</span></th>
            <td><span>2026/07/24 10:05:00</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>Executed By</span></th>
            <td><span>Taro Tenant</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
```

### 5-B. Warning (Partial Failure)

```html
<section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar sample-import-result-container">
  <div class="sample-import-result-icon">
    <span class="imds-icon is-warning"><i class="imds-iconfont imds-warning"></i></span>
  </div>
  <div class="sample-import-result-content">
    <div class="sample-import-result-message">
      <p>The import of the assistant definitions was executed, but some items failed.</p>
      <p>Check the list for details.</p>
    </div>
    <div class="sample-import-result-button-group">
      <button type="button" class="imds-button is-primary">Open Assistant Definition List</button>
      <button type="button" class="imds-button">Back to Import Screen</button>
    </div>
  </div>
  <div class="imds-table is-bordered is-area-bordered sample-import-info-table">
    <div class="imds-table-inner">
      <table>
        <tbody>
          <tr>
            <th rowspan="2"><span>Number of Imported Items</span></th>
            <th><span>Category</span></th>
            <td><span>5/10 items</span></td>
          </tr>
          <tr>
            <th><span>Assistant Definition</span></th>
            <td><span>5/10 items</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>Import File</span></th>
            <td><span>assistant-definitions.zip</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>Completion Date/Time</span></th>
            <td><span>2026/07/24 10:05:00</span></td>
          </tr>
          <tr>
            <th colspan="2"><span>Executed By</span></th>
            <td><span>Taro Tenant</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <label class="imds-checkbox imds-mt-3">
    <input type="checkbox" id="show-failed-only" checked>
    <span>Show Failures Only</span>
  </label>
  <div class="imds-table is-bordered" id="import-result-detail-table">
    <!-- Detailed list of failed data (generated by JS) -->
  </div>
</section>
```

### 5-C. Error (All Failed)

```html
<section class="assistant-import-step-panel imds-py-6 imds-px-8 imds-scrollbar sample-import-result-container">
  <div class="sample-import-result-icon">
    <span class="imds-icon is-error"><i class="fa-regular fa-circle-xmark"></i></span>
  </div>
  <div class="sample-import-result-content">
    <div class="sample-import-result-message">
      <p>The import of the assistant definitions failed.</p>
      <p>Check the list for details.</p>
    </div>
    <div class="sample-import-result-button-group">
      <button type="button" class="imds-button is-primary">Open Assistant Definition List</button>
      <button type="button" class="imds-button">Back to Import Screen</button>
    </div>
  </div>
  <div class="imds-table is-bordered is-area-bordered sample-import-info-table">
    <div class="imds-table-inner">
      <table>
        <tbody>
          <tr>
            <th><span>Import File</span></th>
            <td><span>assistant-definitions.zip</span></td>
          </tr>
          <tr>
            <th><span>Date/Time</span></th>
            <td><span>2026/07/24 10:05:00</span></td>
          </tr>
          <tr>
            <th><span>Executed By</span></th>
            <td><span>Taro Tenant</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
```

**Points:**
- Distinguish the result icon by outcome: success `is-success` (`fa-circle-check`), warning `is-warning` (`imds-warning`), error `is-error` (`fa-circle-xmark`).
- On success and warning, in addition to "the name of the file used for the import", "completion date/time", and "executed by", show the number of imported items per type (in the `succeeded/total` format for warnings). On error (all failed), omit the count rows and show only the file name, date/time, and executed-by.
- Place the "Show failures only" checkbox only for the warning (partial failure) case. **The initial state must be checked** (showing only failed data); unchecking it shows all data.
- The "Open list" button navigates to the list screen; the "Back to import screen" button returns to Step 1.

## Implementation Notes

- Control the step transitions, file upload state, and the import result determination (success/warning/error) via JavaScript (and the server-side processing result).
- Replace occurrences corresponding to `${sample}` (the data type name) with the actual data type name of the target implementation.
- Make the acceptable file format explicit both in `<input type="file" accept="...">` and in the supplementary message.
- Because this is usually paired with an export screen, the `imds-header-nav` menu in the header often includes links to the export screen and the list screen.
- The confirmation table in Step 2 and the result table in Step 3 may be given a fixed header with `imds-table is-sticky` as needed (see the `isSticky` section of the list screen template).
- `sample-import-*` / `assistant-import-*` are placeholder prefixes. Replace them with a prefix matching the feature name at implementation time (do not change standard classes that start with `imds-`).
