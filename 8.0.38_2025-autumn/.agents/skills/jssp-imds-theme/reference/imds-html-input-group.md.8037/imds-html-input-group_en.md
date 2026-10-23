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

### Basic Input Group (Popover + Textbox + IconButton)

```html
<div class="imds-input-group">
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="sample-popover-1"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="sample-popover-1"
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

### Search Field (Textbox + Popover + IconButton)

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
      aria-controls="sample-popover-1"
      class="imds-button is-outlined">
      <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
      <span></span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="sample-popover-1"
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

### Search Field (Select + Textbox + IconButton)

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

## UI Patterns (Element Combinations)

InputGroup can form various layouts by changing the order of the elements placed in it. Representative combination patterns are shown below.

### Popover First (Popover + Textbox)

A pattern that places the Popover first so the user selects a search condition before entering a search term.

```html
<div class="imds-input-group">
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="sample-popover-0"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div id="sample-popover-0" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
  <input type="search" placeholder="Search" class="imds-textbox" value="" />
</div>
```

### Textbox First (Textbox + Popover)

A pattern that places the Textbox first so the user enters a search term and then specifies filter conditions in the Popover.

```html
<div class="imds-input-group">
  <input type="search" placeholder="Search" class="imds-textbox" value="" />
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="sample-popover-1"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div id="sample-popover-1" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
</div>
```

Both orders are valid patterns; choose according to the UI intent (whether the user should pick the condition first or enter the term first).

### Select + Textbox (Two Elements, No Button)

A simple two-element layout that only switches the search target and has no execute button (filters as the user types).

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>Select-1</option>
    <option>Select-2</option>
    <option>Select-3</option>
  </select>
  <input type="search" placeholder="Search" class="imds-textbox" value="" />
</div>
```

### Select + Textbox + Popover + Button (Four Elements)

The maximum layout combining a Select for the search target, a Textbox for the search term, a Popover for detailed conditions, and a Button to execute the search.

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>Select-1</option>
    <option>Select-2</option>
    <option>Select-3</option>
  </select>
  <input type="search" placeholder="Search" class="imds-textbox" value="" />
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="sample-popover-2"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div id="sample-popover-2" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
  <button type="button" class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

## Implementation Notes

- Elements inside `imds-input-group` are automatically placed side by side and joined
- Replace Popover `id` / `aria-controls` with unique values (`sample-popover-N` is a placeholder; use a unique name that fits the feature, without colons since it is not an input element)
- Popover open/close must be controlled with JavaScript
- Icon-only buttons should have a `title` attribute or `aria-label` for accessibility
- Changing the order of elements allows free layout configuration (e.g. Popover + Textbox, Textbox + Popover, Select + Textbox, Select + Textbox + Popover + Button)
