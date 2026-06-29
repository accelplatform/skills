---
paths:
  - "src/main/jssp/**/*.html"
---

# Header

## Overview

Header is a component for displaying the area at the top of the page.
Users can navigate between screens, reference page information, and control the page through this area.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-header--documentation
- Base class: imds-header

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-header | header element | Header container | Required |
| imds-header-icon | div element | Icon area | Optional |
| imds-header-title | div element | Title area (h1 + p) | Required |
| imds-header-back-button | div element | Back button area | Optional |
| imds-header-reload-button | div element | Reload button area | Optional |
| imds-header-nav | div element | Navigation with dropdown menu | Optional |
| imds-header-additional | div element | Additional info area (decorative tags, etc.) | Optional |
| imds-header-actions | div element | Action button area | Optional |
| imds-icon-wrapper | span element | Outer wrapper for icons | Optional |

## HTML Snippets

### Basic Header

```html
<header class="imds-header">
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p>Subtitle</p>
    <h1>Screen Name</h1>
  </div>
</header>
```

All subsequent snippets show only the differences from the basic header.

## Variations

Variations are shown as differences from the "basic header (icon + subtitle + title)".
They are listed in order of recommendation, so consider them from the top. The "not recommended" items at the end are patterns where elements are **omitted** from the basic structure, and should generally not be adopted for business screens.

### icon (Change of Icon Type)

Change the icon class inside `imds-header-icon`. Font-Awesome 6 icons can also be used.
Select an icon that fits the screen content (List → `fa-clipboard-list`, Stocktake → `fa-warehouse`, Settings → `fa-gear`, etc.).

```html
<span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
<span class="imds-icon is-medium"><i class="imds-iconfont imds-app-accel-studio"></i></span>
<span class="imds-icon is-medium"><i class="imds-iconfont imds-app-logic-designer"></i></span>
<span class="imds-icon is-medium"><i class="fa-regular fa-file"></i></span>
```

### backItemExists (Back Button: Edit / Detail Screens)

On screens such as detail screens and edit screens that need a "return to list" navigation, place `imds-header-back-button` **instead of** `imds-header-icon` (the two are mutually exclusive and cannot coexist).

```html
<div class="imds-header-back-button">
  <button type="button" class="imds-button is-ghost is-large">
    <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
  </button>
</div>
```

### reloadItemExists (Reload Button: Dashboards etc.)

Place `imds-header-reload-button` **after** `imds-header-title` (can coexist with `imds-header-icon`).

```html
<div class="imds-header-reload-button">
  <button type="button" class="imds-button is-ghost is-large">
    <span class="imds-icon is-small"><i class="fa-solid fa-rotate-right"></i></span>
  </button>
</div>
```

### No Subtitle (Not Recommended: Avoid on Business Screens)

⚠️ Not recommended for general business screens. Only adopt when there is a specific design requirement.

Omit the `<p>` inside `imds-header-title`. Without a subtitle, the header looks stretched out and does not satisfy the imds theme design.
If `$subTitle` is bound, always output it inside `<p>`.

```html
<div class="imds-header-title"><h1>Screen Name</h1></div>
```

### Icon Omitted (Not Recommended: Avoid on Business Screens)

⚠️ Not recommended for general business screens. A configuration that places none of `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` leaves the left edge of the header empty, which breaks the imds header design.
Only adopt this for extremely limited special use cases (external embedding, print views, etc.).

```html
<header class="imds-header">
  <div class="imds-header-title">
    <p>Subtitle</p>
    <h1>Screen Name</h1>
  </div>
</header>
```

## Combination Examples

### Combination with Popover

Place `imds-popover` + `imds-header-nav` instead of `imds-header-icon`.

```html
<header class="imds-header">
  <div class="imds-popover is-left imds-header-nav">
    <button
      type="button"
      class="imds-button is-ghost is-large"
      aria-haspopup="true"
      aria-controls="imds-popover-:r1:">
      <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
      <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
    </button>
    <div id="imds-popover-:r1:" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a><span>Related Screen-1</span></a></li>
            <li><a><span>Related Screen-2</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="imds-header-title">
    <p>Subtitle</p>
    <h1>Screen Name</h1>
  </div>
</header>
```

### Combination with Tag

Place `imds-header-additional` after `imds-header-title`.

```html
<div class="imds-header-additional">
  <span class="imds-tag is-green"><span>Tag</span></span>
</div>
```

### Combination with Button

Place `imds-header-actions` after `imds-header-title`.
Multiple buttons can be aligned.

```html
<div class="imds-header-actions">
  <button class="imds-button is-primary" type="button">
    <span class="imds-icon"><i class="fa-solid fa-gear"></i></span>
    <span>Log Output Target Settings</span>
  </button>
  <button class="imds-button is-outlined" type="button">
    <span class="imds-icon"><i class="imds-iconfont imds-file-export"></i></span>
    <span class="imds-button-text">Export</span>
  </button>
</div>
```

⚠️ **Do not place data-action buttons such as "New", "Add", or "Register" in `imds-header-actions`** (UI team design rule).
What may be placed in the header is limited to **page-level meta operations that do not add or remove the list data itself, such as "Settings", "Export", or "Configure logging targets"**.
Actions that add, remove, or edit the list's business data — such as "New", "Add", or "Bulk Import" — must be placed **directly above the list table, right-aligned** (see `assets/imds-list-page.md` for examples).

## Implementation Notes

- **One of `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` must always be placed as the first element of the header.** They are mutually exclusive, so exactly one must be attached depending on the screen:
  - General page → `imds-header-icon` (Font Awesome icon representing the screen content)
  - Edit/detail screen requiring a "back" navigation → `imds-header-back-button`
  - Screen requiring a related-screen-switching menu → `imds-header-nav` (combined with Popover)

  If none of these is placed, the title part of the header becomes left-aligned text only, breaking the imds header design (the issue "the icon does not appear" frequently occurs in implementations with only `imds-header-title`). Choose an icon type that fits the screen content from Font Awesome 6 (`fa-clipboard-list`, `fa-warehouse`, `fa-box`, `fa-location-dot`, `fa-chart-column`, `fa-gear`, etc.).

- **The contents of `imds-header-title` must be a two-tier structure of "`<p>Subtitle</p>` + `<h1>Title</h1>`"** (only in the "No Subtitle" variation may `<p>` be omitted). Writing the screen name directly inside `<h1>` alone is incorrect. Following the basic reference snippet, place the application/module name in the upper `<p>` (e.g., "In-house Equipment Rental System", "Equipment Master") and the screen name in the lower `<h1>` (e.g., "Storage Location Management", "Approval List"). Both should be output from the `$subTitle` / `$title` bindings of the function container via `<imart type="string" value=$subTitle ...>` (do not write them directly in HTML).

- **Place `<header class="imds-header">` outside `<main>`.** The imds theme CSS assumes a `<header>` placed directly under `<div class="imds-container">` when applying styles (icon position, margins, etc.). Placing it inside `<main>` breaks the layout, causing issues such as the `imds-header-icon` icon not being displayed.
  ```html
  <!-- OK -->
  <div id="container">
    <div class="imds-container">
      <header class="imds-header">...</header>   <!-- Outside main -->
      <main>
        ...
      </main>
    </div>
  </div>
  ```
  ※ The rule "do not add `<header>` to presentation pages" in `jssp-accessibility.instructions.md` aims to avoid duplication with the platform's global header, and the imds `<header class="imds-header">` (in-page header) is exempt from this rule.
- Do not use class names like `imds-page-header` / `imds-page-header-title` / `imds-page-header-actions` to represent the "page header" (these are imaginary classes not in the reference. CSS will not apply, and the layout will break). The correct names are `imds-header` / `imds-header-title` / `imds-header-actions`.
- Order of placement inside the header: `imds-header-back-button` / `imds-header-icon` / `imds-header-nav` → `imds-header-title` → `imds-header-additional` → `imds-header-reload-button` → `imds-header-actions`
- `imds-header-icon`, `imds-header-back-button`, and `imds-header-nav` are used exclusively (do not place simultaneously)
- Replace the `id` / `aria-controls` of the dropdown menu with unique values (`:r1:` is a placeholder)
- Dropdown menu open/close must be controlled with JavaScript
