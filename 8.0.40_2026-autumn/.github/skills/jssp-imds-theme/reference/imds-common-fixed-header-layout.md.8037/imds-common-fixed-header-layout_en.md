---
paths:
  - "src/main/jssp/**/*.html"
---

# Fixed Header Layout (common-parts)

## Overview

A CSS design pattern for the root container, `<main>`, and scroll area that makes the whole screen "keep the header and footer always fixed, with only the content area scrolling vertically".
Use it as the foundation of whole-page templates such as list screens, form screens, and wizard screens (export/import).

> **Usage in this project:** The list screen template (`assets/imds-list-page.md`) and the form screen template (`assets/imds-form-page.md`) use the fixed class names `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-layout-footer` instead of per-feature placeholder prefixes (`cc-app-*`, etc.) as in this file. Because they use `100%` rather than `100vh` for `height`, loading `im_design_system/theme/css/theme-conditional-layout.css` in `<imart type="head">` is mandatory (without it, the height of `.imds-container` is not determined and the content area collapses to a height of 0). For new screens, follow the instructions in `assets/imds-list-page.md` / `assets/imds-form-page.md`. The `cc-app-*` prefix approach in this file is kept as a reference for building special layouts not covered by those templates (custom screens that require applying this pattern).

- Source: CSS definitions in each `layout/*.md` of `uiux-share` (e.g. "CSS" in `layout/フォーム画面.md`)
- Related components: `imds-container` / `imds-header` / `imds-scrollbar`

## Overall Structure

```
div.imds-container                    # Root div (placed inside the intra-mart theme's imui-container, so no id is assigned and no intermediate wrapper is inserted)
├── header.imds-header                # Fixed display (row 1 of the grid)
└── main (vertical flex container)
    ├── section (scroll area; imds-scrollbar applied, flex:1 0 0; overflow:auto)
    └── div (footer; fixed display, flex:0 0 auto; outside the scroll area)
```

## Use a Single Root div (No Intermediate Wrapper)

Under the `.github/instructions/jssp-presentation-page.instructions.md` convention, no id is assigned to the root tag of a presentation page (the intra-mart theme feature automatically wraps the screen content in `<div id="imui-container">`, so adding an id on the screen side creates a redundant double wrapper).
On the other hand, `imds-container` is a class that the imds theme CSS relies on, and it is applied to the element equivalent to the screen root.
**Satisfy both by applying `class="imds-container ..."` directly to the root `<div>` without adding an intermediate wrapper.** There is no need to nest another `<div class="imds-container">` inside the `<div>`.

```html
<!-- ✅ OK: apply the imds-container class directly to the root div without an intermediate wrapper -->
<div class="imds-container cc-app-layout-container">
  <header class="imds-header">...</header>
  <main class="cc-app-layout-main">
    ...
  </main>
</div>

<!-- ❌ NG: the imds-container div is nested further (intermediate wrapper) -->
<div>
  <div class="imds-container cc-app-layout-container">
    <header class="imds-header">...</header>
    <main class="cc-app-layout-main">...</main>
  </div>
</div>
```

Place `header` / `main` **directly under** `imds-container` (the existing rule of not placing `header` inside `main` still applies).

## CSS Design

### Container (2-Row Grid)

Define a 2-row grid with a custom class applied to `imds-container` (`cc-app-layout-container` in the example; **replace the class name per feature**, see "Placeholder prefix" below).

```css
.cc-app-layout-container {
  height: 100vh;                              /* ★ 100vh is recommended over 100% (see below) */
  display: grid;
  grid-template-rows: 5rem minmax(0, 1fr);     /* Row 1: fixed header height / Row 2: all the rest */
  grid-template-columns: 100%;
}
.cc-app-layout-container > .imds-header {
  grid-row: 1 / 2;
}
```

- Use **`minmax(0, 1fr)`** for row 2 instead of `1fr`. With `1fr` alone, the inner scroll area with `flex:1 0 0` cannot determine its height, so the grid row itself grows with the content; as a result the whole screen scrolls and in-page scrolling stops working
- **`100vh` is recommended over `100%`** for `height`. When the platform-side theme (outer elements such as `<html>`/`<body>` that this skill set cannot control) does not have a 100% height chain, `100%` falls back to the equivalent of `auto`, and the scroll area described below collapses to a height of 0 and disappears. `100vh` is based on the viewport, so it resolves reliably regardless of ancestor height settings

### main (Vertical Flex Container)

```css
.cc-app-layout-main {
  grid-row: 2 / 3;
  display: flex;
  flex-direction: column;
  height: 100%;    /* The parent (grid row 2) already has its height determined by minmax(0,1fr), so 100% is fine here */
}
```

`<main>` itself is a grid item placed in row 2 of `grid-template-rows`, and the parent grid container already has a height determined from `height: 100vh`, so `height: 100%` resolves correctly.

### Scroll Area

Treat the element with `imds-scrollbar` (a utility class that makes the scrollbar thinner; see `reference/imds-helper-scrollbar.md` for details) as the actual scroll area.

```css
.cc-app-step-panel {
  flex: 1 0 0;
  overflow: auto;
}
```

```html
<section class="cc-app-step-panel imds-py-6 imds-px-8 imds-scrollbar">
  <!-- Content to scroll -->
</section>
```

⚠️ **Anti-pattern: do not put `overflow: auto` on `main` itself**. The footer scrolls along with it, and L-5 (fixed footer) can no longer be satisfied. Apply `overflow: auto` only to the child element you want to scroll (the element with `imds-scrollbar`).

⚠️ **Anti-pattern: do not mix anything other than `flex: 1 0 0` into the scroll area**. Even if you want `flex-basis` to be `auto`, as long as the heights of `main` and `imds-container` are determined as described above, `flex: 1 0 0` (`flex-basis: 0`) works as is (`0` becomes a problem only when the ancestor height is not determined).

### Footer (Not Scrolled)

Place the action button group **outside** the scroll area and **directly under** `<main>`, with a fixed size via `flex: 0 0 auto`.

```css
.cc-app-footer {
  flex: 0 0 auto;
}
```

```html
<main class="cc-app-layout-main">
  <section class="cc-app-step-panel imds-py-6 imds-px-8 imds-scrollbar">...</section>
  <div class="cc-app-footer imds-py-2 imds-px-8 imds-border-t-1">
    <button type="button" class="imds-button is-primary">Register</button>
  </div>
</main>
```

## Replacing the Placeholder Prefix

The CSS class names in this file (`cc-app-layout-container` / `cc-app-layout-main` / `cc-app-step-panel` / `cc-app-footer`, etc.) are example placeholders. **When generating, replace them with a prefix that matches the feature name** (e.g. `product-layout-container` for a product management screen).

| Type | Replace? |
|---|---|
| Custom classes with a placeholder prefix such as `cc-app-*` | ✅ Replace (use a prefix unique to each feature) |
| imds standard classes starting with `imds-*` (`imds-container` / `imds-header` / `imds-scrollbar` / `imds-py-*` / `imds-px-*` / `imds-border-t-1`, etc.) | ❌ Do not replace. imds styles are defined against these class names, so renaming them means no borders, spacing, scrollbar, or other styles are applied at all |

```html
<!-- ✅ OK: only custom classes get the feature prefix; imds- classes are unchanged -->
<div class="imds-container product-layout-container">
  <main class="product-layout-main">
    <section class="product-step-panel imds-py-6 imds-px-8 imds-scrollbar">…</section>
  </main>
</div>

<!-- ❌ NG: over-replaced, rewriting even the imds standard classes -->
<div class="product-container product-layout-container">
  <main class="product-layout-main">
    <section class="product-step-panel product-py-6 product-scrollbar">…</section>
  </main>
</div>
```

As a final check, make sure no placeholder prefix such as `cc-app-*` or `sample-*` remains in the generated output.

## Post-Implementation Checks (Visual, in a Browser)

Beyond implementing the CSS and DOM, open the screen in a browser and check the following (automated checks cannot guarantee these).

1. When scrolling the screen vertically, the header (and the footer, if there is a fixed footer) does not move and is always visible
2. Only the content area scrolls; the browser window itself does not scroll (no double scrolling)
3. The scrollbar of the content area is displayed thin (`scrollbar-width: thin` of `imds-scrollbar` is in effect)

Check items 1-2 in particular with the window height reduced (with ample height, the difference between fixed and non-fixed is not visible).

## Implementation Notes

- Do not assign an id to the root `<div class="imds-container ...">`; consolidate it into one element, and do not create an intermediate wrapper by nesting another `imds-container` inside it
- Always use `minmax(0, 1fr)` for row 2 of `grid-template-rows` (`1fr` alone does not determine the height of the scroll area)
- In this file's `cc-app-*` approach, `height: 100vh` is recommended for the height applied to `imds-container` (`height: 100%` depends on how ancestor heights resolve, and in some environments the scroll area collapses to a height of 0). Templates that use `pgstyle-layout-*` fix the height by combining `height: 100%` with loading `theme-conditional-layout.css`
- Apply `overflow: auto` only to the child element to be scrolled that has `imds-scrollbar`, not to `main` itself
- Place the footer (action button group) directly under `<main>` and outside the scroll area, and fix it with `flex: 0 0 auto`
- Replace the placeholder prefix of custom classes (`cc-app-*`, etc.) according to the feature name, but use standard classes starting with `imds-` as is without renaming
- When this pattern is excessive for a simplified layout (e.g. very small screens that need no navigation or scrolling), you may lay out everything under `<main>` as normal vertical stacking (the whole page scrolls) instead of building a `height: 100vh` style grid directly on `imds-container`. However, use this pattern for screens that require a fixed footer and partial scrolling
