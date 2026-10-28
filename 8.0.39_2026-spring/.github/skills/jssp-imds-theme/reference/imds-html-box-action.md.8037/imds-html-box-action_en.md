---
paths:
  - "src/main/jssp/**/*.html"
---

# BoxAction

## Overview

BoxAction is a component that displays a description and its corresponding action button together within a single frame.
Use it in situations such as applying setting changes, where a description of "what it does" is paired with an execute button.

**Relationship with Button (DESIGN.md)**: BoxAction is a component in the "action" pattern family represented by `button`, and **it follows the button's colors and states (color axis, variant, hover/active, etc.) as-is**. BoxAction itself has no color definitions of its own. The contained button normally uses `imds-button is-outlined is-primary`.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-boxaction--documentation
- Base class: imds-box-action

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-box-action | div element | Container for the whole BoxAction (can hold multiple items side by side) | Required |
| is-flex-direction-column | imds-box-action or inner div | Stacks items / description and button vertically | Optional |

## HTML Snippets

### Basic Form

```html
<div class="imds-box-action">
  <div>
    <div>
      <strong>Apply definition</strong>
      <p>Description of applying the definition</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        Apply definition
      </button>
    </div>
  </div>
</div>
```

Subsequent snippets show only the differences from the basic form.

## Variations

### Vertical (Stacked)

Stacks the description and button vertically. Add `is-flex-direction-column` to both `imds-box-action` and the inner item div.

```html
<div class="imds-box-action is-flex-direction-column">
  <div class="is-flex-direction-column">
    <div>
      <strong>Apply definition</strong>
      <p>Description of applying the definition</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        Apply definition
      </button>
    </div>
  </div>
</div>
```

### Row (Multiple Items Side by Side)

Place multiple item divs directly under `imds-box-action`. Individual items can mix the normal horizontal layout (no class) and `is-flex-direction-column` (stacked).

```html
<div class="imds-box-action">
  <div>
    <div>
      <strong>Apply definition</strong>
      <p>Description of applying the definition</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        Apply definition
      </button>
    </div>
  </div>
  <div>
    <div>
      <strong>Apply definition</strong>
      <p>Description of applying the definition</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        Apply definition
      </button>
    </div>
  </div>
  <div class="is-flex-direction-column">
    <div>
      <strong>Apply definition</strong>
      <p>Description of applying the definition</p>
    </div>
    <div>
      <button
        class="imds-button is-outlined is-primary"
        type="button">
        Apply definition
      </button>
    </div>
  </div>
</div>
```

## Implementation Notes

- Buttons inside BoxAction **use the color and state classes of Button (imds-html-button.md) as-is**. BoxAction itself defines no colors, so add semantic colors such as `is-primary` / `is-danger` and variants such as `is-outlined` / `is-ghost` to the button.
- Structure the title with a `strong` element and the description with a `p` element.
- The basic form of one item is a two-element structure: "description div" + "action div".
- To lay out multiple items side by side (Row pattern), place multiple item divs directly under `imds-box-action`. To stack an individual item vertically, add `is-flex-direction-column` only to that item div.
