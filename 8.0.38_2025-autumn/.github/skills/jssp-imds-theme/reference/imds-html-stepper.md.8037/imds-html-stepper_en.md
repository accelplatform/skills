---
paths:
  - "src/main/jssp/**/*.html"
---

# Stepper

## Overview

Stepper is a component for users to execute tasks in sequence across multiple steps.
By visualizing task progress, it clarifies the remaining tasks until completion.
Used in wizard-style screens where work is done in multiple stages.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-stepper--documentation
- Base class: imds-stepper

## Overall Structure

```
imds-stepper                              # Stepper container
└── ul                                    # Step list
    └── li.imds-stepper-step              # Each step
        │                                 #   State classes: is-completed / is-active / none (unreached)
        └── button                        # Step body (optional imds-icon + label)
```

The connecting lines between steps are drawn automatically by CSS; no HTML markup is required.

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-stepper | div element | Stepper container | Required |
| imds-stepper-step | li element | Each step | Required |
| is-completed | imds-stepper-step | Completed step | Optional |
| is-active | imds-stepper-step | In-progress (current) step | Optional |
| imds-line-clamp-1 | span element | Truncate text to 1 line | Optional |
| imds-line-clamp-2 | span element | Truncate text to 2 lines | Optional |

## HTML Snippets

### Basic stepper

```html
<div class="imds-stepper">
  <ul>
    <li class="imds-stepper-step is-completed">
      <button><span>Step.1</span></button>
    </li>
    <li class="imds-stepper-step is-active">
      <button><span>Step.2</span></button>
    </li>
    <li class="imds-stepper-step">
      <button><span>Step.3</span></button>
    </li>
  </ul>
</div>
```

The following sections show only the differences from the basic stepper.

## Variations

### Step state (is-completed, is-active)

Add a state class to `li.imds-stepper-step`.
No class means not yet reached.

```html
<li class="imds-stepper-step is-completed">  <!-- Completed -->
<li class="imds-stepper-step is-active">      <!-- In progress -->
<li class="imds-stepper-step">                <!-- Not yet reached -->
```

### disabled

Add the `disabled` attribute to each step's `button`.

```html
<button disabled><span>Step.1</span></button>
```

### lineClamp (text truncation)

Truncate long labels. Add `imds-line-clamp-1` (1 line) or `imds-line-clamp-2` (2 lines) to `span`, and set the full text in the `button`'s `title`.

```html
<li class="imds-stepper-step">
  <button title="Enter the full text of the long step name here">
    <span class="imds-line-clamp-1">Enter the full text of the long step name here</span>
  </button>
</li>
```

## Combination Examples

### Combined with Icon

Add `imds-icon` inside `button`.
Can be placed before or after the label.

```html
<button>
  <span class="imds-icon is-small"><i class="fa-solid fa-user"></i></span>
  <span>Step.1</span>
</button>
```

## Implementation Notes

- Describe steps with the list structure `ul > li`
- Apply `is-completed` to completed steps, `is-active` to the current step, and no class to unreached steps
- Apply `is-active` to only one step at a time
- Connecting lines between steps are drawn automatically by CSS (no HTML markup required)
- Step click navigation is controlled with JavaScript
- When using `imds-line-clamp-*`, set the full text in the `button`'s `title` attribute so it can be checked on hover
- If content (forms, etc.) follows below the stepper, set bottom padding (e.g. `imds-pb-4`) on the stepper's parent element to ensure sufficient spacing
- Do not add left/right margins to the stepper (the stepper should be displayed at full screen width)
- If the stepper is directly below a header (`imds-header`), do not add top margin either
