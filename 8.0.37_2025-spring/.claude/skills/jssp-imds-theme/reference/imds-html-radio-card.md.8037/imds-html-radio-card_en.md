---
paths:
  - "src/main/jssp/**/*.html"
---

# RadioCard

## Overview

RadioCard, like Radio, is a component used to select one item from a list of choices.
Since it has a description area separate from the label, it can present more detailed information to users than Radio.
It also features a wide click area, making selection easy.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-radiocard--documentation
- Base class: imds-radiocard

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-radiocard | div element | Radio card container | Required |
| imds-radiocard-title | span element | Card title | Required |
| imds-radiocard-content | div element | Card description content | Optional |
| imds-radiocard-container | fieldset element | Group container for multiple cards | Optional |
| is-vertical | imds-radiocard-container | Vertical layout | Optional |

## HTML Snippets

### Basic radio card

```html
<div class="imds-radiocard">
  <input type="radio" name="todo-replace-:r1:" id="todo-replace-:r1:" />
  <label for="todo-replace-:r1:">
    <span class="imds-radiocard-title">Title</span>
    <div class="imds-radiocard-content">
      <p>Description text</p>
    </div>
  </label>
</div>
```

The following sections show only the differences from the basic radio card.

## Variations

### disabled

Add the `disabled` attribute to `input`.

```html
<input type="radio" name="todo-replace-:r1:" id="todo-replace-:r1:" disabled />
```

### checked

Add the `checked` attribute to `input`.

```html
<input type="radio" name="todo-replace-:r1:" id="todo-replace-:r1:" checked />
```

## Combination Examples

### Multiple choices

Group multiple radio cards with `fieldset.imds-radiocard-container`.
Adding `is-vertical` results in a vertical layout.

```html
<fieldset class="imds-radiocard-container is-vertical">
  <div class="imds-radiocard">
    <input
      type="radio"
      name="container"
      id=":r0:" />
    <label for=":r0:">
      <span class="imds-radiocard-title">Manual creation</span>
      <div class="imds-radiocard-content"><p>Enter data one by one manually.</p></div>
    </label>
  </div>
  <!-- Repeat the same imds-radiocard structure as needed (use the same name attribute) -->
</fieldset>
```

## Implementation Notes

- Radio cards in the same group must share the same `name` attribute (to allow only one selection)
- Replace the `id` of each card's `input` and the `for` of `label` with unique values (`todo-replace-:r1:` is a placeholder)
- Selection state style is automatically toggled via CSS linked to `input:checked` (no JavaScript required)
- `imds-radiocard-content` is optional (cards with title only can also be created)
