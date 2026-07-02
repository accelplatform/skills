---
paths:
  - "src/main/jssp/**/*.html"
---

# Accessibility Guidelines (Screen Reader Support)

> **Application Scope**: 🟠 **Business-requirement-dependent** — Apply thickly only when the specification explicitly requires it. Otherwise stay minimal (use `imdsConfirm`, basic `aria-label` on `<button>`, `aria-hidden="true"` on decorative icons, etc.). Do not add elaborate accessibility wiring such as `aria-describedby`, dynamic `aria-invalid`, or `role="group"` + `aria-labelledby` unless the spec demands it.

Screens created in intra-mart Accel Platform script development must be operable with screen readers (NVDA / JAWS / VoiceOver / Narrator).
The target is WCAG 2.1 Level AA compliance.

## Basic Principles

1. **Use meaningful HTML** - Avoid overusing `div` / `span`; prioritize semantic elements such as `button`, `a`, `nav`, `main`, `header`, `table`, `label`, etc.
2. **All features must be operable by keyboard alone** - Do not build mouse-dependent UIs
3. **Focus must be visually apparent** - Do not remove `outline` with `none`
4. **Communicate dynamic changes** - Notify DOM rewrites and async operation results via live regions
5. **Do not convey information with images or icons alone** - Always include text or alternative text alongside

## Overall Page Structure

### Landmarks

The global header, global menu, and footer of intra-mart Accel Platform are **output by the platform (theme)**.
Therefore, **do not add** `<header>` / `<nav>` / `<footer>` to individual presentation pages (they would duplicate the platform-provided landmarks).

The root structure of each screen follows the conventions in `jssp-presentation-page.md` and places only `<main>`.

```html
<div id="container">
  <div class="imds-container">
    <main>
      <h1>Screen Title</h1>
      <!-- Main content -->
    </main>
  </div>
</div>
```

- `<main>` is an HTML5 semantic element and implicitly carries `role="main"`, so do not add `role="main"` alongside it
- There must be exactly one `<main>` per page
- When the screen has multiple regions requiring section divisions, use `<section aria-labelledby="...">` (do not use `<nav>`, etc.)

### Heading Hierarchy

- The page title is `h1`; headings below it follow the order `h2` → `h3` **without skipping levels**
- Do not choose a heading level for visual appearance (adjust size with CSS)
- There must be exactly one `h1` per page

### Language Attribute

```html
<html lang="ja">
```

When supporting multiple languages, switch `lang` on the server side.

## Forms

### Labels

Associate an **explicit `label`** with every input element.

As a JSSP convention, the `id` of an input element is enclosed in colons, like `:userName:`.

```html
<!-- OK: associated with for / id -->
<label for=":userName:">Username</label>
<input type="text" id=":userName:" name="userName">

<!-- NG: placeholder only -->
<input type="text" placeholder="Username">
```

- Even when visually hiding a label, keep it in the DOM and hide it with `class="visually-hidden"` or similar (`display:none` is NG)
- Icon-only buttons require `aria-label` or `title`

### Required Fields

```html
<label for=":email:">Email Address <span aria-hidden="true">*</span></label>
<input type="email" id=":email:" required aria-required="true">
```

`*` is decorative so use `aria-hidden="true"` on it; convey the required status via `aria-required` or `required`.

### Error Display

Follow the standard pattern from `jssp-presentation-page.md` (`.imds-field` + `.imds-validation-error` class, showing/hiding `.imds-error-text` with `style.display`), and add ARIA attributes.

```html
<div class="imds-field" for=":age:">
  <label for=":age:">Age</label>
  <input type="number" id=":age:"
         aria-describedby=":age:-error">
  <span class="imds-error-text" for=":age:" id=":age:-error" style="display:none;"></span>
</div>
```

```javascript
// When showing an error
function showValidationError(errors) {
  errors.forEach((error) => {
    const fieldElement = document.querySelector(`.imds-field[for=":${error.name}:"]`);
    if (fieldElement) {
      fieldElement.classList.add('imds-validation-error');
    }
    const errorElement = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
    if (errorElement) {
      errorElement.textContent = error.message;
      errorElement.style.display = '';
    }
    // Add aria-invalid to the input element
    const inputElement = document.getElementById(`:${error.name}:`);
    if (inputElement) {
      inputElement.setAttribute('aria-invalid', 'true');
    }
  });
}

// When clearing errors
function clearValidationError() {
  document.querySelectorAll('.imds-field.imds-validation-error').forEach((el) => {
    el.classList.remove('imds-validation-error');
  });
  document.querySelectorAll('.imds-error-text').forEach((el) => {
    el.style.display = 'none';
  });
  document.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
    el.removeAttribute('aria-invalid');
  });
}
```

- `aria-describedby` points to the `id` of the message element (associations are not broken even if the user manually changes the position in the HTML)
- Add `aria-invalid="true"` to inputs with errors and remove it when errors are cleared
- Maintain the existing pattern of hiding message elements with `style.display = 'none'` (elements with `display:none` are not read even when targeted by `aria-describedby`, but they will be read when shown, so this is not a problem)
- When an error occurs on submit, move focus to the first erroneous field

### Grouping

Wrap radio buttons and checkboxes in `fieldset` + `legend`.

```html
<fieldset>
  <legend>Gender</legend>
  <label><input type="radio" name="gender" value="m"> Male</label>
  <label><input type="radio" name="gender" value="f"> Female</label>
</fieldset>
```

#### When Using imds Components

`imds-radio-group` / `imds-checkbox-group` cannot use `fieldset` / `legend` structurally.
Instead, add `role="group"` and `aria-labelledby` to the `div` of `imds-radio-group` / `imds-checkbox-group`, referencing the `id` of the field label to achieve equivalent grouping.

```html
<div class="imds-field">
  <div class="imds-field-label">
    <span id=":gender:-label">Gender</span>
  </div>
  <div class="imds-field-control">
    <div class="imds-radio-group is-horizontal"
         role="group" aria-labelledby=":gender:-label">
      <label class="imds-radio">
        <input type="radio" name="gender" value="m" />
        <span>Male</span>
      </label>
      <label class="imds-radio">
        <input type="radio" name="gender" value="f" />
        <span>Female</span>
      </label>
    </div>
  </div>
</div>
```

- Use `<span id="...">` rather than `<label for="...">` for the group label (because `label`'s `for` only works for a single input)
- Match the `id` referenced by `aria-labelledby` with the `id` of the field label

## Buttons and Links

- **Use `button` or `a` for clickable elements**. `div onclick` is prohibited
- Use `a` for links (screen navigation) and `button` for in-page actions
- Icon-only buttons must always have `aria-label`

```html
<!-- NG -->
<div class="btn" onclick="save()">Save</div>

<!-- OK -->
<button type="button" onclick="save()">Save</button>

<!-- Icon only -->
<button type="button" aria-label="Delete">
  <span class="imds-icon imds-icon-trash" aria-hidden="true"></span>
</button>
```

## Tables

Data tables must always be given an **accessible name**. `<th>` must always have a `scope` attribute.

### How to Assign an Accessible Name

Give the `<table>` an accessible name using one of the following methods.

| Method | Usage |
|--------|-------|
| `aria-labelledby="..."` | **First choice** when a heading (e.g., `<h1>`) already exists on the screen. No need to manage the text in two places |
| `aria-label="..."` | When there is no corresponding heading on the screen |
| `<caption>` | When you want to display a caption visually as well |

**Note:**
- The imds theme does not have a utility class to visually hide `<caption>` (equivalent to `sr-only`).
- Using `<caption>` may break the layout, so in imds environments, use `aria-labelledby` or `aria-label` as a rule.

### Recommended Pattern: Reference `<h1>` with `aria-labelledby`

```html
<header class="imds-header">
  <div class="imds-header-title">
    <h1 id="page-title">User List</h1>
  </div>
</header>

...

<table aria-labelledby="page-title">
  <thead>
    <tr>
      <th scope="col">User ID</th>
      <th scope="col">Name</th>
      <th scope="col">Department</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">U001</th>
      <td>Taro Yamada</td>
      <td>Sales Department</td>
    </tr>
  </tbody>
</table>
```

### Other Rules

- Always add `scope="col"` or `scope="row"` to `<th>`
- Do not use tables for layout purposes (use CSS Grid / Flexbox)
- When there are multiple tables of the same type on one page, ensure that each `aria-labelledby` reference `id` points to a different heading

## Images and Icons

| Type | Handling |
|------|----------|
| Meaningful image | `<img alt="description">` |
| Decorative image | `<img alt="">` |
| Meaningful icon font | Add `aria-label` |
| Decorative icon font | Add `aria-hidden="true"` |
| Inline SVG (meaningful) | Add `aria-label` to `span.imds-icon` |
| Inline SVG (decorative) | `aria-hidden="true"` |

## Dialogs and Modals

Use **`imdsConfirm()` as the first choice** for confirmation dialogs (see `jssp-presentation-page.md`).
The standard dialogs provided by imds support ARIA attributes, focus control, and keyboard operation.

```javascript
imdsConfirm(
  'Are you sure you want to delete?',
  'Delete',
  async () => {
    await deleteItem(id);
  },
  null,
  {
    mode: 'danger',
    okButton: { text: 'Delete' }
  }
);
```

### When Implementing a Custom Dialog is Unavoidable

Only when creating a complex input dialog that cannot be achieved with `imdsConfirm`, the following requirements must be met.

- Add `role="dialog"` and `aria-modal="true"` to the dialog element
- Associate with the title element via `aria-labelledby` and the description element via `aria-describedby`
- Immediately upon opening, **move focus to the first focusable element within the dialog**
- Upon closing, **return focus to the original trigger element**
- The dialog must be closable with the `Escape` key
- Focus must be trapped within the dialog (focus must not move to elements behind it)

```html
<div role="dialog" aria-modal="true"
     aria-labelledby="dialog-title" aria-describedby="dialog-description">
  <h2 id="dialog-title">Delete Confirmation</h2>
  <p id="dialog-description">This operation cannot be undone. Do you want to continue?</p>
  <button type="button">Cancel</button>
  <button type="button">Delete</button>
</div>
```

## Dynamic Updates (Notifications)

**Updates that do not involve page navigation**, such as results of async operations and system messages, must be notified to screen readers.

### First Choice: Standard imui Message Functions

Following the conventions in `jssp-presentation-page.md`, use the following functions.
These cause the intra-mart theme to internally perform processing equivalent to live regions.

| Purpose | Function |
|---------|----------|
| Success notification | `imuiShowSuccessMessage(message)` |
| Warning (recoverable error) | `imuiShowWarningMessage(message)` |
| Error (unrecoverable) | `imuiShowErrorMessage(message)` |

```javascript
// Success
imuiShowSuccessMessage('User registration was successful.');

// Error (the API response errorMessage is already assembled in `[code] message` format)
imuiShowErrorMessage(result.errorMessage);
```

Do not create custom live regions for notifications that can be expressed with these imui functions.

### Custom Live Regions (Limited Use)

Only for inline updates that cannot be expressed with imui functions (e.g., displaying search result count in a header, displaying wizard step progress), place elements with `aria-live` manually.

```html
<!-- Display search result count -->
<div id="search-result-count" role="status" aria-live="polite" aria-atomic="true"></div>
```

```javascript
document.getElementById('search-result-count').textContent =
  result.countRow + ' results found';
```

- Live region elements must **exist in the DOM from the initial page render** (elements added later with `appendChild` will not be read)
- Use `aria-live="polite"` as the default. `assertive` is only for critical notifications that interrupt the user's operations
- Do not duplicate notifications that overlap in purpose with imui functions

## Keyboard Operation

- Focus must move in logical order with `Tab` (do not use positive values for `tabindex`)
- Add `tabindex="0"` to operable elements in custom UIs
- Use `tabindex="-1"` for non-focusable regions
- Do not remove the focus ring (`:focus` / `:focus-visible`) with CSS
- When implementing shortcut keys, choose combinations that do not conflict with other software's keys

## Color and Contrast

- Do not convey information **with color alone** (indicating required fields with red color alone is NG; include icons or text alongside)
- Text-to-background contrast ratio must be **4.5:1 or higher** (3:1 or higher for large text)
- Focus indicators must have a contrast ratio of 3:1 or higher against surroundings

## When Using imds Components

Each reference in the `jssp-imds-theme` skill has an "Accessibility Support" section.
When generating components, refer to the corresponding reference and ensure all required attributes (`scope`, `for`, `aria-label`, `aria-hidden`, etc.) are included without omission.

| Component | Reference |
|-----------|-----------|
| Table | `imds-html-table.md` |
| Text box | `imds-html-textbox.md` / `imds-html-textbox-control.md` |
| Select | `imds-html-select.md` |
| Radio | `imds-html-radio.md` / `imds-html-radio-group.md` |
| Checkbox | `imds-html-checkbox.md` / `imds-html-checkbox-group.md` |
| Toggle | `imds-html-toggle.md` |
| Menu | `imds-html-menu.md` |
| Accordion | `imds-html-accordion.md` |
| Confirmation dialog | `imds-csjs-confirm.md` |
| Images and icons | `imds-html-img.md` / `imds-html-icon-font.md` / `imds-html-inline-svg.md` |

## Checklist

### Page Structure

- [ ] The root has the structure `<div id="container"><div class="imds-container"><main>...</main></div></div>`
- [ ] There is exactly one `<main>` per page and `role="main"` is not added alongside it
- [ ] Headings follow the order `h1` → `h2` → `h3` without skipping levels

### Forms

- [ ] All input elements have an associated `label` (via `for` / `id`)
- [ ] Icon-only buttons have `aria-label` or `title`
- [ ] Required fields have `required` / `aria-required` specified
- [ ] `aria-invalid="true"` is added to inputs on error and removed when errors are cleared
- [ ] Error message elements (`.imds-error-text`) have an `id` and are associated with the input via `aria-describedby`
- [ ] Radio buttons and checkboxes are wrapped in `fieldset` + `legend` (or substituted with `role="group"` + `aria-labelledby` when using imds)

### Operations

- [ ] Clickable elements are implemented with `button` / `a` (`div onclick` is prohibited)
- [ ] All features are operable by keyboard alone
- [ ] The focus ring is not removed with CSS
- [ ] Positive values are not used for `tabindex`

### Tables

- [ ] `<table>` is given an accessible name via `aria-labelledby` (referencing an existing heading) / `aria-label` / `<caption>`
- [ ] In imds environments, `aria-labelledby` or `aria-label` is used instead of `<caption>`
- [ ] `th` elements have the `scope` attribute
- [ ] Tables are not used for layout purposes

### Images and Icons

- [ ] Meaningful images have the `alt` attribute
- [ ] Decorative images have `alt=""` or `aria-hidden="true"`

### Dialogs

- [ ] Confirmation dialogs use `imdsConfirm()`
- [ ] Custom dialogs have `role="dialog"` / `aria-modal="true"` / `aria-labelledby`
- [ ] Focus control (move, restore, trap) is implemented for opening and closing custom dialogs
- [ ] Custom dialogs can be closed with the `Escape` key

### Dynamic Updates

- [ ] System notifications use `imuiShowSuccessMessage` / `imuiShowWarningMessage` / `imuiShowErrorMessage`
- [ ] Only inline updates that cannot be expressed with imui (such as search result counts) use `role="status"` / `aria-live`
- [ ] Custom live region elements exist in the DOM from the initial render

### Color

- [ ] Information is not conveyed by color alone
- [ ] Contrast ratio is 4.5:1 or higher

## Related

- `.claude/rules/jssp-presentation-page.md` - Basic structure of presentation pages
- `.claude/skills/jssp-localize-support/` related - Multilingual support (spoken language)
- `.claude/skills/jssp-imds-theme/reference/` - Accessibility support per imds component
