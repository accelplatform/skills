---
paths:
  - "src/main/jssp/**/*.html"
---

# Dialog

## Overview

Dialog is a small window displayed for exchanging specific information between the user and the system.
It appears as a popup on top of the original screen.

- Source URL: https://document.intra-mart.jp/design/?path=/story/components-dialog--default
- Base class: imds-dialog

## Overall Structure

```
imds-dialog-wrapper                       # Size-control wrapper (<dialog> recommended; <div> also possible)
└── imds-dialog                           # Dialog body
    ├── imds-dialog-header                # Header
    │   ├── imds-dialog-title-wrapper
    │   │   ├── imds-dialog-title-bread-crumbs-warp  # Breadcrumbs (optional)
    │   │   └── imds-dialog-title         # Title (h1 + optional subtitle <p>)
    │   └── button.imds-dialog-header-close # Close button (optional)
    └── imds-dialog-content (+ imds-scrollbar) # Content area
        └── imds-p-4                       # Inner padding wrapper (effectively required)
            └── (arbitrary content)
```

When the dialog contains an input form, see [imds-html-dialog-form.md](imds-html-dialog-form.md).

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-dialog-wrapper | Outer element (`<dialog>` or `<div>`) | Size control wrapper for the dialog | Required |
| imds-dialog | Inner div | Dialog body | Required |
| imds-dialog-header | div element | Header area | Required |
| imds-dialog-title-wrapper | div element | Wrapper for the title section | Required |
| imds-dialog-title | div element | Title display area | Required |
| imds-dialog-title-bread-crumbs-warp | div element | Breadcrumb display area | Optional |
| imds-dialog-header-close | button element | Close button | Optional |
| imds-dialog-content | div element | Content area | Required |
| imds-scrollbar | imds-dialog-content | Scrollbar style | Optional |

## HTML Snippets

### Basic Dialog (`<dialog>` root / recommended)

The base pattern for `imds-dialog-wrapper` is to use the **HTML5 native `<dialog>` element** as the root.
With `<dialog>` + `showModal()`, the following are automatically obtained with no extra JavaScript / CSS:

- Semi-transparent background overlay (`::backdrop`)
- Background elements become non-interactive (modal)
- Automatic close on `Escape` key
- Focus trap (Tab cycles within the dialog)

```html
<dialog
  id="item-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="item-dialog-title"
  style="width: 500px; min-width: 150px; max-width: 1000px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="item-dialog-title" title="Dialog Title">Dialog Title</h1>
        </div>
      </div>
      <button
        type="button"
        class="imds-button is-ghost is-small imds-dialog-header-close"
        aria-label="Close">
        <span class="imds-icon"><i class="fa-solid fa-times"></i></span>
      </button>
    </div>
    <div class="imds-dialog-content imds-scrollbar">
      <div class="imds-p-4">
        Content
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// Open (modal display)
document.getElementById('item-dialog').showModal();

// Close
document.getElementById('item-dialog').close();
```

#### Rules When Using `<dialog>` Root

- The `<dialog>` element itself is equivalent to `role="dialog"`, so do not add `role` / `aria-modal` (keep only `aria-labelledby`)
- Do not hide with `style="display:none"` (the `<dialog>` element is closed by default)
- Do not display via `style.display = ''`. **Always call `showModal()`** (only this method makes the background non-interactive)
- Do not implement your own `<div>` + `position:fixed` + background overlay
- `imds-dialog-content` has **no padding by default**. Always wrap the content with `<div class="imds-p-4">` (adjust with `imds-p-2` / `imds-p-6`). Without this, form elements and buttons will appear stuck to the edge of the dialog

All subsequent sections show only the differences from the basic dialog.

## Variations

### Subtitle

Add a `<p>` element after the `h1` inside `imds-dialog-title`.

```html
<div class="imds-dialog-title">
  <h1 title="Dialog Title">Dialog Title</h1>
  <p>Subtitle</p>
</div>
```

### Breadcrumbs

Add `imds-dialog-title-bread-crumbs-warp` before `imds-dialog-title` inside `imds-dialog-title-wrapper`.

```html
<div class="imds-dialog-title-wrapper">
  <div class="imds-dialog-title-bread-crumbs-warp">
    <span title="Breadcrumb 1">Breadcrumb 1</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-angle-right"></i></span>
    <span title="Breadcrumb 2">Breadcrumb 2</span>
  </div>
  <div class="imds-dialog-title"><h1 title="Dialog Title">Dialog Title</h1></div>
</div>
```

### `<div>` Root (Non-Modal / Special Use Only)

Use `<div>` as the root **only** when modalization (blocking background interaction) is **not needed**, or in special environments where the `<dialog>` element cannot be used. Treat it as a **sub-option**, not the basic pattern.

```html
<div
  class="imds-dialog-wrapper"
  style="height: 220px; width: 500px; min-height: 150px; min-width: 150px; max-height: 1000px; max-width: 1000px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title"><h1 title="Dialog Title">Dialog Title</h1></div>
      </div>
      <button
        type="button"
        class="imds-button is-ghost is-small imds-dialog-header-close">
        <span class="imds-icon"><i class="fa-solid fa-times"></i></span>
      </button>
    </div>
    <div class="imds-dialog-content imds-scrollbar"><div class="imds-p-4">Content</div></div>
  </div>
</div>
```

⚠️ With a `<div>` root, the following must be **implemented manually**:
- Show/hide control (e.g., `style.display`)
- Semi-transparent background overlay (stack another `<div>` if needed)
- Blocking interaction with background elements
- Close via ESC key
- Focus trap

Implementing these correctly is difficult, and missing pieces become bug sources. **Always use the `<dialog>` root unless there is a special reason not to.**

## Implementation Notes

- Control dialog size (height, width, min/max) with the `style` attribute of `imds-dialog-wrapper`
- Use `imds-button is-ghost is-small imds-dialog-header-close` for the close button
- Padding in the content area is adjusted with `imds-p-4`. Can be changed to fit the content
- Adding `imds-scrollbar` displays a scrollbar when content overflows
- The breadcrumb class name is `imds-dialog-title-bread-crumbs-warp` (this is the official class name, not a typo)
