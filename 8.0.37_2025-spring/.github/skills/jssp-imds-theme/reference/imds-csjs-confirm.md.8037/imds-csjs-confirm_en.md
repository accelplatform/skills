---
paths:
  - "src/main/jssp/**/*.html"
---

# imdsConfirm (JavaScript API)

## Overview

Displays a confirmation dialog in the imds theme.
Compatible with the imuiConfirm API, so if imuiConfirm is already in use, it can be replaced with imdsConfirm.

## ⚠️ Important: The function definition must be included in every page

The `imdsConfirm` function **is not automatically provided by common processing (the theme or platform)**.
The full function definition shown in the "JavaScript Code" section below (`function imdsConfirm(...)` together with the trailing `imdsConfirm._active = false;`) must be copied into the `<script>` of **every presentation page** that calls `imdsConfirm`.

- Even if you find a custom `imdsConfirm` implementation in an existing page, **do not delete it** by concluding "this is duplicated" or "it must be shared somewhere". Deleting it will break the confirmation dialog on that page
- Even if you want to share it, do not extract it into a separate file; the premise is that each page keeps the same function definition
- The body of the function (HTML generation, events, Promise wrapping, etc.) must strictly match the code in this reference. Any difference will distort the appearance or behavior

## JavaScript Code

```javascript
/**
 * Displays a confirmation dialog and returns the user's selection result.
 *
 * @param {string} message - Body text
 * @param {string} [title='Confirm'] - Title
 * @param {Function} [onOk] - Callback when OK button is pressed
 * @param {Function} [onCancel] - Callback when Cancel button is pressed
 * @param {Object} [options]
 * @param {'info'|'danger'|'warning'} [options.mode='info'] - Dialog type
 * @param {{text?: string}} [options.okButton] - OK button options
 * @param {{text?: string}} [options.cancelButton] - Cancel button options
 * @returns {Promise<boolean>} true when OK button is pressed, false when Cancel is pressed
 */
function imdsConfirm(message, title, onOk, onCancel, options) {
  // If already displayed, return false immediately
  if (imdsConfirm._active) {
    return Promise.resolve(false);
  }
  imdsConfirm._active = true;

  const VALID_MODES = ['info', 'danger', 'warning'];
  let mode = (options && options.mode) || 'info';
  if (!VALID_MODES.includes(mode)) mode = 'info';

  const okText = (options && options.okButton && options.okButton.text) || 'Execute';
  const cancelText = (options && options.cancelButton && options.cancelButton.text) || 'Cancel';
  const dialogTitle = title || 'Confirm';

  // Mode-specific configuration
  const iconClass = mode === 'info' ? 'fa-circle-question' : 'fa-triangle-exclamation';
  const okButtonClass = mode === 'danger' ? 'imds-button is-danger' : 'imds-button is-primary';

  // Generate dialog element
  const dialog = document.createElement('dialog');
  dialog.className = 'imds-confirm-wrapper';

  dialog.innerHTML =
    '<div class="imds-confirm is-' + mode + '">' +
      '<div class="imds-confirm-content-wrapper">' +
        '<button class="imds-confirm-close imds-button is-ghost">' +
          '<span class="imds-icon"><i class="fa-solid fa-xmark"></i></span>' +
        '</button>' +
        '<div class="imds-confirm-content">' +
          '<div class="imds-confirm-message-wrapper">' +
            '<div class="imds-confirm-icon">' +
              '<span class="imds-icon is-x-small is-' + mode + '">' +
                '<i class="fa-solid ' + iconClass + '"></i>' +
              '</span>' +
            '</div>' +
            '<div class="imds-confirm-message">' +
              '<p class="imds-confirm-message-title"></p>' +
              '<div class="imds-confirm-message-content"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="imds-confirm-footer">' +
        '<div class="imds-confirm-footer-content">' +
          '<button type="button" class="imds-button imds-confirm-cancel-button"></button>' +
          '<button type="button" class="' + okButtonClass + ' imds-confirm-ok-button"></button>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Safely insert user input with textContent (XSS protection)
  dialog.querySelector('.imds-confirm-message-title').textContent = dialogTitle;
  dialog.querySelector('.imds-confirm-cancel-button').textContent = cancelText;
  dialog.querySelector('.imds-confirm-ok-button').textContent = okText;

  // Allow line breaks in message using newline characters
  const contentElement = dialog.querySelector('.imds-confirm-message-content');
  const lines = String(message).split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) contentElement.appendChild(document.createElement('br'));
    contentElement.appendChild(document.createTextNode(lines[i]));
  }

  document.body.appendChild(dialog);

  return new Promise(function(resolve) {
    let settled = false;

    function close(result) {
      if (settled) return;
      settled = true;
      imdsConfirm._active = false;
      dialog.close();
      document.body.removeChild(dialog);
      resolve(result);
    }

    // OK button
    dialog.querySelector('.imds-confirm-ok-button').addEventListener('click', function() {
      if (typeof onOk === 'function') onOk();
      close(true);
    });

    // Cancel button
    dialog.querySelector('.imds-confirm-cancel-button').addEventListener('click', function() {
      if (typeof onCancel === 'function') onCancel();
      close(false);
    });

    // X button (treated as cancel)
    dialog.querySelector('.imds-confirm-close').addEventListener('click', function() {
      if (typeof onCancel === 'function') onCancel();
      close(false);
    });

    // Close by Escape key (treated as cancel)
    dialog.addEventListener('cancel', function(e) {
      e.preventDefault();
      if (typeof onCancel === 'function') onCancel();
      close(false);
    });

    dialog.showModal();
  });
}

/** @type {boolean} Display flag (prevents double display) */
imdsConfirm._active = false;
```

## Usage Guidelines

When displaying a confirmation message, use this `imdsConfirm()` instead of `window.confirm()` or `imuiConfirm()`.

### How to use mode

| mode | Purpose | Example |
|------|------|----|
| `info` | Normal confirmation. Confirmation for operations that do not involve data changes, or for undoable operations | "Would you like to search with these parameters?" |
| `warning` | Confirmation for when actual data will be updated and cannot be undone | "This will change the status to Approved. This cannot be undone. Are you sure?" |
| `danger` | Confirmation for when actual data will be deleted | "This will delete the 3 selected records. This operation cannot be undone." |

### Usage Examples

```javascript
// Normal confirmation (defaults to info when mode is omitted)
imdsConfirm('Would you like to execute the process?').then(function(result) {
  if (result) {
    // Process on confirmation
  }
});

// Update confirmation (warning)
imdsConfirm(
  'This will change the status to Approved.\nThis operation cannot be undone. Are you sure?',
  'Update Confirmation',
  null,
  null,
  { mode: 'warning' }
).then(function(result) {
  if (result) {
    // Update process
  }
});

// Delete confirmation (danger)
imdsConfirm(
  'This will delete the selected data.\nThis operation cannot be undone.',
  'Delete Confirmation',
  null,
  null,
  { mode: 'danger', okButton: { text: 'Delete' } }
).then(function(result) {
  if (result) {
    // Delete process
  }
});
```

## Accessibility

- If the content of the action after pressing the OK button is clear, display the action concisely
  - Examples: "Create New", "Update", "Delete", "Search"
  - Default: "Execute"

## Implementation Notes

- Double display is not possible. If already displayed, the second call resolves immediately with `false`
- `\n` in `message` is displayed as a line break. HTML tags are not inserted (XSS protection)
- Both `onOk` / `onCancel` callbacks and Promise are available, but do not mix them; unify to Promise-based usage
