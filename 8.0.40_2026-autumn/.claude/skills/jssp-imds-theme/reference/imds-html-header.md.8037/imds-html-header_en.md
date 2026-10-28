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
| imds-header-back-button | div element | Back button area | Optional |
| imds-header-icon | div element | Icon area | Optional |
| imds-header-nav | div element | Navigation with dropdown menu | Optional |
| imds-header-title | div element | Title area (h1 + p) | Required |
| imds-header-additional | div element | Additional info area (decorative tags, etc.) | Optional |
| imds-header-actions | div element | Action button area | Optional |
| imds-header-reload-button | div element | Reload button area | Optional |
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
"No Subtitle" and "Icon Omitted (Title Only)" are official variations that exist in the actual uiux-share DOM (such as the `Title Only` story) and are not deprecated in themselves. However, this skill's `SKILL.md` has a separate operational rule that "one of `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` is required at the start of the header", and that rule takes precedence for business screens in JSSP projects (see the note on each variation for details).

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

On screens such as detail screens and edit screens that need a "return to list" navigation, place `imds-header-back-button`. `imds-header-back-button` **can be used together** with the icon area (`imds-header-icon` or `imds-header-nav`); do not remove the icon area because you placed the back-button (the two are not mutually exclusive; for the exception of screens that intentionally omit the icon, see the note on the "Title Only" variation).

```html
<header class="imds-header">
  <div class="imds-header-back-button">
    <button type="button" class="imds-button is-ghost is-large">
      <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
    </button>
  </div>
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title"><p>Feature (Product) Name</p><h1>Screen Name</h1></div>
</header>
```

### reloadItemExists (Reload Button: Dashboards etc.)

Place `imds-header-reload-button` **only on screens that require reloading the entire page**. If the purpose is only to re-fetch list data, place the button on the content side (around the list table), not in the header. A reload button in the header always reloads the entire page, so always use "Reload page" as its `title`. Place it **after** `imds-header-actions` (at the very end of the header).

```html
<div class="imds-header-reload-button">
  <button type="button" class="imds-button is-ghost is-large" title="Reload page">
    <span class="imds-icon is-small"><i class="fa-solid fa-rotate-right"></i></span>
  </button>
</div>
```

### No Subtitle

Omit the `<p>` inside `imds-header-title` and place only `<h1>`. This is a legitimate variation that also exists in uiux-share and is not deprecated in itself.
When a `$subTitle` binding is defined, the basic form outputs it as `<p>`, but this variation may be used on screens with no information corresponding to a subtitle.

```html
<div class="imds-header-title"><h1>Screen Name</h1></div>
```

### Title Only (Icon Omitted)

A simple configuration with only `imds-header-title`, placing none of `imds-header-icon` / `imds-header-back-button` / `imds-header-nav`. This is a legitimate variation that exists as the `Title Only` story in uiux-share.

```html
<header class="imds-header">
  <div class="imds-header-title">
    <p>Feature (Product) Name</p>
    <h1>Screen Name</h1>
  </div>
</header>
```

> **Note (consistency with SKILL.md)**: This skill's `SKILL.md` defines, as an operational rule for JSSP business screens, that "one of `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` is required at the start of the header" (outside the scope of this file; not to be changed here). A title-only configuration is valid for the component on its own, but when generating business screens for this project, follow the operational rule in `SKILL.md` and place one of the three above.

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
      aria-controls="sample-popover-1">
      <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
      <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
    </button>
    <div id="sample-popover-1" role="menu" class="imds-popover-menu">
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
What may be placed in the header is limited to **page-level meta operations that do not add or remove the list data itself, such as "Settings", "Export", or "Log Output Target Settings"**.
Actions that add, remove, or edit the list's business data — such as "New", "Add", or "Bulk Import" — must be placed **directly above the list table, right-aligned** (see `assets/imds-list-page.md` for examples).

## Implementation Notes

- **In this project (JSSP business screens), the basic rule is to place one of `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` as the first element of the header, following the operational rule in `SKILL.md`** (an existing rule on the `SKILL.md` side):
  - General page → `imds-header-icon` (Font Awesome icon representing the screen content)
  - Edit/detail screens and others requiring a "back" navigation → `imds-header-back-button` (can be used together with `imds-header-icon` / `imds-header-nav`; do not remove the icon area when placing the back-button; see the "backItemExists" variation)
  - Screen requiring a related-screen-switching menu → `imds-header-nav` (combined with Popover; mutually exclusive with `imds-header-icon`)

  For the component on its own, a "Title Only" configuration with only `imds-header-title` and none of these also exists as a legitimate pattern in uiux-share (see the "Title Only (Icon Omitted)" variation for details). Choose an icon type that fits the screen content from Font Awesome 6 (`fa-clipboard-list`, `fa-warehouse`, `fa-box`, `fa-location-dot`, `fa-chart-column`, `fa-gear`, etc.).

- **The basic form of the contents of `imds-header-title` is a two-tier structure of "`<p>Subtitle</p>` + `<h1>Title</h1>`"** (omit `<p>` in the "No Subtitle" variation). Following the basic reference snippet, place the application/module name in the upper `<p>` (e.g., "In-house Equipment Rental System", "Equipment Master") and the screen name in the lower `<h1>` (e.g., "Storage Location Management", "Approval List"). Output both from the `$subTitle` / `$title` bindings of the function container via `<imart type="string" value=$subTitle ...>` (do not write them directly in HTML).

- **Place `<header class="imds-header">` outside `<main>`.** The imds theme CSS assumes a `<header>` placed directly under `<div class="imds-container">` when applying styles (icon position, margins, etc.). Placing it inside `<main>` breaks the layout, causing issues such as the `imds-header-icon` icon not being displayed. **Consolidate the root into a single `<div>` and do not nest another `imds-container` `<div>` inside it as an intermediate wrapper** (per the `jssp-presentation-page.md` convention, intra-mart's theme feature automatically wraps the screen content in `<div id="imui-container">`, so do not give the root tag an id; attach only the `imds-container` class).
  ```html
  <!-- OK -->
  <div class="imds-container">
    <header class="imds-header">...</header>   <!-- Outside main -->
    <main>
      ...
    </main>
  </div>

  <!-- NG (intermediate wrapper: nests an imds-container div) -->
  <div>
    <div class="imds-container">
      <header class="imds-header">...</header>
      <main>...</main>
    </div>
  </div>
  ```
  ※ The rule "do not add `<header>` to presentation pages" in `jssp-accessibility.md` aims to avoid duplication with the platform's global header, and the imds `<header class="imds-header">` (in-page header) is exempt from this rule.
- Do not use class names like `imds-page-header` / `imds-page-header-title` / `imds-page-header-actions` to represent the "page header" (these are imaginary classes not in the reference. CSS will not apply, and the layout will break). The correct names are `imds-header` / `imds-header-title` / `imds-header-actions`.
- Order of placement inside the header: `imds-header-back-button` → `imds-header-icon` / `imds-header-nav` → `imds-header-title` → `imds-header-additional` → `imds-header-actions` → `imds-header-reload-button` (**`imds-header-actions` comes before `imds-header-reload-button`**)
- Exclusivity among the icon-area elements depends on the combination. Do not treat all three as mutually exclusive.
  - `imds-header-icon` and `imds-header-nav` are mutually exclusive (do not place both; the icon area is one or the other)
  - `imds-header-back-button` **can be used together** with `imds-header-icon` / `imds-header-nav` (do not remove the icon area when placing the back-button; see the "backItemExists" variation for details)
  - This reference does not cover combining `imds-header-back-button` and `imds-header-nav`. Treat them as mutually exclusive as before
- Replace the `id` / `aria-controls` of the dropdown menu with unique values (`sample-popover-N` is a placeholder; use a unique name that fits the feature, without colons since it is not an input element)
- Dropdown menu open/close must be controlled with JavaScript
