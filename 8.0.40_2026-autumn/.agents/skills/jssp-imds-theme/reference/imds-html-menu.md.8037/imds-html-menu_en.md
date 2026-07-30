# Menu

## Overview

Menu is a component that organizes feature selections and screen navigation actions in a list-style menu.

- Source URL: https://document.intra-mart.jp/design/?path=/story/components-menu--default
- Base class: imds-menu

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-menu | nav element | Menu container | Required |
| imds-menu-title | div element | Menu title | Optional |
| imds-menu-list | ul element | Menu list | Required |
| imds-menu-list-item-additional | span element | Additional info area for menu items (tags, etc.) | Optional |
| is-borderless | imds-menu | No dividers | Optional |
| is-last-child-borderless | imds-menu | No divider on last item | Optional |
| is-small | imds-menu | Small size | Optional |
| is-normal | imds-menu | Normal size | Optional |
| is-medium | imds-menu | Medium size | Optional |
| is-large | imds-menu | Large size | Optional |
| is-disabled | li element | Disable item | Optional |
| is-active | li element | Show item as active | Optional |
| has-text-right | imds-menu-list-item-additional | Right-align additional info | Optional |

## HTML Snippets

### Basic menu

```html
<nav class="imds-menu">
  <div class="imds-menu-title">Menu List</div>
  <ul class="imds-menu-list">
    <li><a><span>Menu 1</span></a></li>
    <li><a><span>Menu 2</span></a></li>
    <li><a><span>Menu 3</span></a></li>
  </ul>
</nav>
```

The following sections show only the differences from the basic menu.

## Variations

### lineStyle (divider style)

Add a class to `nav.imds-menu`.

```html
<nav class="imds-menu is-borderless">            <!-- No dividers -->
<nav class="imds-menu is-last-child-borderless">  <!-- No divider on last item -->
```

### size

Add a size class to `nav.imds-menu`.

```html
<nav class="imds-menu is-small">   <!-- Small -->
<nav class="imds-menu is-normal">  <!-- Normal -->
<nav class="imds-menu is-medium">  <!-- Medium -->
<nav class="imds-menu is-large">   <!-- Large -->
```

### disabled

Add `is-disabled` to the `li` element.

```html
<li class="is-disabled">
  <a><span>Menu 2</span></a>
</li>
```

### active

Add `is-active` to the `li` element.

```html
<li class="is-active">
  <a><span>Menu 2</span></a>
</li>
```

## Combination Examples

### Combined with Tag

Use `imds-menu-list-item-additional` to place additional information such as tags. Add `has-text-right` to right-align.

```html
<li>
  <a>
    <span>Menu 2</span>
    <span class="imds-menu-list-item-additional">
      <span class="imds-tag is-small is-green"><span>Tag</span></span>
    </span>
  </a>
</li>

<!-- Right-aligned -->
<li>
  <a>
    <span>Menu 2</span>
    <span class="imds-menu-list-item-additional has-text-right">
      <span class="imds-tag is-small is-green"><span>Tag</span></span>
    </span>
  </a>
</li>
```

### Combined with Icon

Control icon left/right position by the order of `imds-icon` inside `<a>`.

```html
<!-- Left side -->
<li>
  <a>
    <span class="imds-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
    <span>Menu 1</span>
  </a>
</li>

<!-- Right side -->
<li>
  <a>
    <span>Menu 1</span>
    <span class="imds-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
  </a>
</li>
```

### Combined with Accordion

Place `imds-menu` inside `imds-accordion-content`.
Used for side menus, etc. Adding `is-last-child-borderless` removes the divider of the last item.

```html
<div class="imds-accordion-group">
  <div class="imds-accordion">
    <input
      type="checkbox"
      id="todo-replace-:r1:" />
    <label
      for="todo-replace-:r1:"
      class="imds-accordion-title">
      <span class="imds-accordion-title-inner">
        <span>Accordion Title 1</span>
        <span class="imds-accordion-caption">Caption</span>
      </span>
      <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
    </label>
    <div class="imds-accordion-content">
      <nav class="imds-menu is-last-child-borderless">
        <ul class="imds-menu-list">
          <li><a><span>Menu 1</span></a></li>
          <li><a><span>Menu 2</span></a></li>
          <li><a><span>Menu 3</span></a></li>
        </ul>
      </nav>
    </div>
  </div>
  <!-- Repeat the same accordion structure as needed -->
</div>
```

## Accessibility

### Child-level menu

- Child-level menus are used for hierarchical tables of contents and navigation
- Nesting Menu elements within list items creates a hierarchical menu
- However, deeper hierarchies may reduce usability, so design with care

### Child-level menu inside Popover

- Generally, avoid using child-level menus inside Popovers
- Popover content often has limited display area and is not always visible, making child-level menus unsuitable
- Use MenuTitle to group menu items instead

## Implementation Notes

- `imds-menu-title` is optional. If no title is needed, place only `imds-menu-list`
- When used inside a Popover, place inside `imds-popover-content`
- Specify link targets via the `href` attribute of `<a>`. When handling with JavaScript, omit `href` and add click events
