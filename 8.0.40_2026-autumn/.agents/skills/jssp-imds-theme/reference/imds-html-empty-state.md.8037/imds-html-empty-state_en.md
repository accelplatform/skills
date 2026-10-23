# EmptyState

## Overview

EmptyState is a component displayed when no content exists, such as when a user opens an application for the first time.
It presents a brief description of the current state and a message or button that prompts the next action.

**Design principle (DESIGN.md)**: EmptyState is a neutral placeholder and does not use severity colors (error/success/warning/info). Display the icon in the neutral `is-gray-light` tone.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-emptystate--documentation
- Base class: imds-empty-state

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-empty-state-container | div element | Container for the whole EmptyState | Required |
| imds-empty-state | div element | EmptyState body (apply size and alignment classes) | Required |
| imds-empty-state-message-wrapper | div element | Wrapper for icon + message | Required |
| imds-empty-state-icon | span element | Icon wrapper | Optional (can be omitted) |
| imds-empty-state-message | div element | Wrapper for message (title + details) | Required |
| imds-empty-state-message-title | p element | Brief description of the state (title) | Required |
| imds-empty-state-message-content | p element | Detail message prompting the next action | Optional (not available with is-x-small/is-small) |
| imds-empty-state-content | div element | Wrapper for action buttons | Optional (not available with is-x-small/is-small) |
| is-x-small | imds-empty-state | Extra-small size (for narrow areas such as Popover) | Optional |
| is-small | imds-empty-state | Small size (for narrow areas such as Table or right pane) | Optional |
| is-medium | imds-empty-state | Medium size (for relatively wide areas such as Dialog) | Optional |
| is-large | imds-empty-state | Large size (default; for a whole window or page) | Optional |
| is-vertical | imds-empty-state | Align elements vertically | Optional |
| is-horizontal | imds-empty-state | Align elements horizontally | Optional |

## HTML Snippets

### Basic Form (equivalent to is-large)

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state">
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message">
        <p class="imds-empty-state-message-title">No applications have been created</p>
        <p class="imds-empty-state-message-content">Create an application with the Create New button.</p>
      </div>
    </div>
    <div class="imds-empty-state-content imds-mt-7">
      <button type="button" class="imds-button is-large is-primary">
        Create New Application
      </button>
    </div>
  </div>
</div>
```

The following sections show only the differences from the basic form.

## Variations

### Icon

Basically, use the "info" icon (`fa-circle-info`) in the `is-gray-light` tone. For other available icons, refer to icon-font (imds-html-icon-font.md). Do not apply severity colors (`is-danger`, `is-warning`, `is-success`, etc.) to the icon.

### size (Size)

Apply a size class to `imds-empty-state`. Normally use `is-large` (default), and choose according to where it is used.

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state is-x-small">   <!-- Extra-small: narrow areas such as Popover -->
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message"><p class="imds-empty-state-message-title">No process is configured.</p></div>
    </div>
  </div>
</div>
```

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state is-small">     <!-- Small: narrow areas such as Table or right pane -->
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message"><p class="imds-empty-state-message-title">No entity items exist. Add them with the "Edit Entity Items" button.</p></div>
    </div>
  </div>
</div>
```

With `is-x-small` / `is-small`, `imds-empty-state-message-content` (detail message) and `imds-empty-state-content` (action buttons) are not available. Display only the title.

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state is-medium">    <!-- Medium: relatively wide areas such as Dialog -->
    <div class="imds-empty-state-message-wrapper">
      <span class="imds-empty-state-icon">
        <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
      </span>
      <div class="imds-empty-state-message">
        <p class="imds-empty-state-message-title">No entities reference this entity.</p>
      </div>
    </div>
  </div>
</div>
```

`is-medium` / `is-large` can display a message and action buttons as needed.

### Placing Inside a Table (is-small)

```html
<div class="imds-table is-bordered is-area-bordered">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th><span>Primary Key</span></th>
          <th><span>Required</span></th>
          <th><span>ID</span></th>
          <th><span>Entity Item</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="4">
            <div class="imds-empty-state-container">
              <div class="imds-empty-state is-small">
                <div class="imds-empty-state-message-wrapper">
                  <span class="imds-empty-state-icon">
                    <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
                  </span>
                  <div class="imds-empty-state-message"><p class="imds-empty-state-message-title">No entity items exist. Add them with the "Edit Entity Items" button.</p></div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### alignment (Alignment)

```html
<div class="imds-empty-state is-vertical">    <!-- Vertical alignment -->
<div class="imds-empty-state is-horizontal">  <!-- Horizontal alignment -->
```

### Without Icon

Omit `imds-empty-state-icon`.

```html
<div class="imds-empty-state-container">
  <div class="imds-empty-state">
    <div class="imds-empty-state-message-wrapper">
      <div class="imds-empty-state-message">
        <p class="imds-empty-state-message-title">No applications have been created</p>
        <p class="imds-empty-state-message-content">Create an application with the Create New button.</p>
      </div>
    </div>
    <div class="imds-empty-state-content imds-mt-7">
      <button type="button" class="imds-button is-large is-primary">
        Create New Application
      </button>
    </div>
  </div>
</div>
```

## Responsive Behavior

EmptyState automatically controls the icon position according to the width of its parent (container) element.

- `is-medium` / `is-large`: When the container width falls below 768px, elements are automatically aligned vertically.
- `is-x-small` / `is-small`: When the container width falls below 520px, elements are automatically aligned vertically. However, when placed inside a Table, the icon and title are always displayed side by side and left-aligned regardless of the container width.

## Implementation Notes

- **Do not use severity colors** (DESIGN.md "empty-state: neutral placeholder"). Always use the neutral `is-gray-light` tone for the icon, and do not apply status color classes such as `is-danger`. Even in contexts representing an empty state, keep to a neutral expression unrelated to error/warning.
- Basically, use the "info" icon (`fa-circle-info`).
- Describe the state briefly in the message (title), and prompt the next action with the detail message (`imds-empty-state-message-content`).
- When the user's next action is clear, place action buttons (`imds-button is-large is-primary`, etc.) inside `imds-empty-state-content`.
- With the `is-x-small` / `is-small` sizes, the detail message and action buttons are not available (title only).
- Normally use `is-large` (default), and choose from `is-x-small` to `is-large` according to the size of the area where it is used.
