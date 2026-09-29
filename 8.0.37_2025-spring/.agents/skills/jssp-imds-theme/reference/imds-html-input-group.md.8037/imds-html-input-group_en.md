# InputGroup

## Overview

InputGroup is a container that combines multiple input elements and buttons side by side.
You can combine Textbox, Select, Popover, IconButton, etc. to build search fields, sort fields, and more.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-inputgroup--documentation
- Base class: imds-input-group

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-input-group | div element | Input group container | Required |

## HTML Snippets

### Basic input group (Popover + Textbox + IconButton)

```html
<div class="imds-input-group">
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="imds-popover-:r1:"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="imds-popover-:r1:"
      role="menu"
      class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
  <input
    type="search"
    placeholder="Search"
    class="imds-textbox"
    value="" />
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

## Combination Examples

### Search field (Textbox + Popover + IconButton)

Example placing a menu inside the Popover to switch search conditions.

```html
<div class="imds-input-group">
  <input
    type="search"
    placeholder="Search"
    class="imds-textbox"
    value="" />
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="imds-popover-:r1:"
      class="imds-button is-outlined">
      <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
      <span></span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="imds-popover-:r1:"
      role="menu"
      class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a><span>Menu 1</span></a></li>
            <li><a><span>Menu 2</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

### Search field (Select + Textbox + IconButton)

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>All</option>
    <option>Name</option>
    <option>Remarks</option>
  </select>
  <input
    type="search"
    placeholder="Search"
    class="imds-textbox"
    value="" />
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

### Sort (IconButton + Select)

```html
<div class="imds-input-group">
  <button
    type="button"
    class="imds-button"
    title="Sort descending">
    <span class="imds-icon is-small"><i class="fa-solid fa-arrow-down-short-wide"></i></span>
  </button>
  <select class="imds-select">
    <option>Recommended</option>
    <option>By price</option>
    <option>By sales</option>
  </select>
</div>
```

### Textbox + IconButton

```html
<div class="imds-input-group">
  <input
    type="search"
    placeholder="Search"
    class="imds-textbox"
    value="" />
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

### Select + TextboxControl

Example placing an icon inside the textbox using `imds-textbox-control`.

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>Select-1</option>
    <option>Select-2</option>
  </select>
  <div class="imds-textbox-control is-left">
    <input
      type="search"
      placeholder="Search"
      class="imds-textbox"
      value="" />
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </div>
</div>
```

## Implementation Notes

- Elements inside `imds-input-group` are automatically placed side by side and joined
- Replace Popover `id` / `aria-controls` with unique values (`:r1:` is a placeholder)
- Popover open/close must be controlled with JavaScript
- Icon-only buttons should have a `title` attribute or `aria-label` for accessibility
- Changing the order of elements allows free layout configuration (e.g. Popover + Textbox, Textbox + Popover)
