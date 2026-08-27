# Input Form Screen Implementation Example

An implementation example of a business input form screen combining imds theme components.
Using the "PC Terminal - New Registration" screen as a subject, this shows the composition pattern of header, sections, field groups, various input components, and footer buttons.

This page uses the fixed header layout, where the header and footer stay fixed while only the form area scrolls vertically. It uses a layout-control pattern with the fixed class names `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-footer` (this is `height: 100%`-based, so loading `theme-conditional-layout.css` in `<imart type="head">` is mandatory — see "Implementation Notes"). The legacy pattern that uses a per-feature placeholder prefix is documented in [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md).

## Components Used

| Component | reference | Usage in this example |
|---------------|-----------|-------------|
| Header | [header.md](../reference/header.md) | Page header with back button |
| Field | [field.md](../reference/field.md) | Each input item |
| FieldGroup | [field-group.md](../reference/field-group.md) | Grouping of input items |
| Textbox | [textbox.md](../reference/textbox.md) | Text input |
| TextboxControl | [textbox-control.md](../reference/textbox-control.md) | Text input with search icon |
| Select | [select.md](../reference/select.md) | Dropdown selection |
| Radio | [radio.md](../reference/radio.md) | Radio button |
| Checkbox | [checkbox.md](../reference/checkbox.md) | Checkbox |
| Button | [button.md](../reference/button.md) | Action button |
| IconButton | [icon-button.md](../reference/icon-button.md) | Clear button (x icon) |
| FileUpload | [file-upload.md](../reference/file-upload.md) | File upload |
| IconFont | [icon-font.md](../reference/icon-font.md) | Various icons |

## Overall Structure

Attach `pgstyle-layout-container` (2-row grid) to `imds-container`, `pgstyle-layout-main` (vertical flex) to `<main>`, and `pgstyle-layout-footer` (`flex:0 0 auto`) to the footer. The form area's (`<form>`) scroll control is handled with the fixed class name `pgstyle-layout-content` (`flex:1 0 0; overflow:auto`).

```
div.imds-container.pgstyle-layout-container    ... Root div (placed inside the intra-mart theme's imui-container, so no id is assigned; no intermediate wrapper is inserted either)
├── header.imds-header                        ... Page header (back button, icon, title. Fixed)
└── main.pgstyle-layout-main (vertical flex container)
    ├── form.imds-form               ... Form body (with imds-scrollbar. flex:1 0 0; overflow:auto)
    │   ├── section (Basic Information)  ... Section 1
    │   │   └── imds-field-container
    │   │       ├── field-group (Owning Company)
    │   │       ├── field-group (Usage Status)
    │   │       ├── field-group (PC Type)
    │   │       └── field (User)
    │   └── section (Details)       ... Section 2
    │       └── imds-field-container
    │           ├── field-group (Purchase Info)
    │           ├── field-group (Machine Info)
    │           ├── field-group (Specs)
    │           └── field-group (Storage Encryption)
    └── div.pgstyle-layout-footer (flex:0 0 auto, outside the scroll area)  ... Register / Save as Draft buttons
```

## 1. Page Header

Configuration of back button + icon + title (with subtitle).
Both `imds-header-back-button` and `imds-header-icon` are placed.

```html
<header class="imds-header">
  <div class="imds-header-back-button">
    <button
      type="button"
      class="imds-button is-ghost is-large">
      <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
    </button>
  </div>
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p>PC / Portable Media Management</p>
    <h1>PC Terminal - New Registration</h1>
  </div>
</header>
```

## 2. Form Body

Apply a gray background (`has-background-color-gray`) to `imds-form` and configure it as a scrollable area.
Divide the form logically with `imds-section` and add a heading with `imds-heading` for each section.

The `<form>` element itself doubles as the scroll area (`imds-scrollbar` applied, `flex: 1 0 0; overflow: auto;`) of the fixed header layout. Attach `pgstyle-layout-container` to the root `<div>`, `pgstyle-layout-main` to `<main>`, and `pgstyle-layout-content` to `<form>` itself (see "Implementation Notes" for the CSS definitions).

```html
<div class="imds-container pgstyle-layout-container">
  <header class="imds-header">
    <!-- See "1. Page Header" -->
  </header>
  <main class="pgstyle-layout-main">
    <form class="imds-form has-background-color-gray pgstyle-layout-content imds-scrollbar imds-py-4 imds-px-6">
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <h2 class="imds-heading is-bordered is-size-2 is-cyan">Basic Information</h2>
        <div class="imds-field-container has-accent-color">
          <!-- Field group collection -->
        </div>
      </section>
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <h2 class="imds-heading is-bordered is-size-2 is-cyan">Details</h2>
        <div class="imds-field-container has-accent-color">
          <!-- Field group collection -->
        </div>
      </section>
    </form>
    <!-- The footer (Register / Save as Draft buttons) is placed directly under main, outside the form. See "5. Footer (Action Buttons)" -->
  </main>
</div>
```

**Key points:**
- `imds-field-container has-accent-color` adds an accent color vertical line to the field group
- `imds-content-normal-width` restricts the content width to a standard width
- `imds-content-normal-width` is applied to each `<section>` rather than directly under `<form>`, and this is an intentional difference (the uiux-share example attaches it directly to `<form>`, but this asset attaches it per section so that the same maximum width can be reused at the section level). The effect is equivalent, so there is no need to move it to `<form>`
- The root `<div>` is not given an id; it only has `class="imds-container ..."`, and no intermediate wrapper is created
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` are **fixed** class names, not per-feature placeholders — do not rename them when generating a page (the same applies to standard classes starting with `imds-`)

## 3. Basic Information Section

### 3.1 Radio Button + Sub-field Combination (Owning Company)

Pattern for placing sub-fields (company name, department name) below radio button selection inside `imds-field-group`.
Add a required mark with `imds-required-label-required` to the group label.

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label">
    <span
      class="imds-required-label-required"
      data-required-label="Required">
      Owning Company
    </span>
  </div>
  <div class="imds-field-group-control">
    <div class="imds-radio-group is-horizontal sample-proprietor">
      <label class="imds-radio">
        <input
          type="radio"
          name="sample-proprietor"
          value="sample-proprietor-1"
          checked="" />
        <span>NTT DATA Intramart</span>
      </label>
      <label class="imds-radio">
        <input
          type="radio"
          name="sample-proprietor"
          value="sample-proprietor-2" />
        <span>Other</span>
      </label>
    </div>
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-company">
          <div class="imds-field-label"><label for=":r6b:">Company Name</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6b:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-department">
          <div class="imds-field-label"><label for=":r6c:">Department Name</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6c:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Key points:**
- Use `imds-radio-group is-horizontal` to arrange radio buttons horizontally
- Stack the radio group and sub-field group vertically inside `imds-field-group-control`
- Arrange sub-fields horizontally with a nested `imds-field-group`

### 3.2 Select + Search Text Side by Side (Usage Status)

Pattern for arranging a select box and a text box with search icon side by side using `imds-field-group-control is-horizontal`.

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>Usage Status</span></div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field sample-status">
      <div class="imds-field-label">
        <label
          class="imds-required-label-required"
          data-required-label="Required"
          for=":r6d:">
          Status
        </label>
      </div>
      <div class="imds-field-control">
        <select
          id=":r6d:"
          class="imds-select">
          <option>Please select</option>
          <option>Setup Complete</option>
          <option>In Use</option>
        </select>
      </div>
    </div>
    <div class="imds-field sample-location">
      <div class="imds-field-label"><label for=":r6e:">Usage Location</label></div>
      <div class="imds-field-control">
        <div class="imds-textbox-control">
          <input
            type="text"
            placeholder="Select usage location"
            class="imds-textbox"
            readonly
            value="" />
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
        <button
          type="button"
          class="imds-button is-ghost">
          <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
        </button>
      </div>
    </div>
  </div>
</div>
```

**Key points:**
- No required mark on the group label; add `imds-required-label-required` to individual field labels
- Use `imds-textbox-control` to achieve a read-only text box with a search icon
- Place the clear button (`fa-xmark-circle`) alongside inside `imds-field-control`

### 3.3 Vertical Radio Buttons (PC Type)

When there are many options, use `imds-radio-group` in its default (vertical) layout.

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label">
    <span
      class="imds-required-label-required"
      data-required-label="Required">
      PC Type
    </span>
  </div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-control">
        <div class="imds-radio-group">
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-1"
              checked="" />
            <span>Desktop</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-2" />
            <span>Laptop</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-3" />
            <span>Tablet</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-4" />
            <span>Smartphone</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-5" />
            <span>Small Portable Media (USB drive, etc.)</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 3.4 Search Text Single Field (User)

Pattern of a single field using `imds-field` directly instead of `imds-field-group`.
Align with group label width using `is-horizontal imds-w-15`.

```html
<div class="imds-field is-horizontal imds-w-15 sample-user">
  <div class="imds-field-label"><label for=":r6h:">User</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input
        type="text"
        placeholder="Select user"
        class="imds-textbox"
        readonly
        value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button
      type="button"
      class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

## 4. Details Section

### 4.1 Date / Amount / Search Side by Side (Purchase Info)

Pattern for placing different input types (date, text, search text) side by side.

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>Purchase Info</span></div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r6i:">Purchase Date</label></div>
      <div class="imds-field-control">
        <input
          type="date"
          id=":r6i:"
          class="imds-textbox"
          value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r6j:">Purchase Amount</label></div>
      <div class="imds-field-control">
        <input
          type="text"
          id=":r6j:"
          class="imds-textbox has-text-end"
          value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r6k:">Approval Info</label></div>
      <div class="imds-field-control">
        <div class="imds-textbox-control">
          <input
            type="text"
            placeholder="Select approval number"
            class="imds-textbox"
            readonly
            value="" />
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
        <button
          type="button"
          class="imds-button is-ghost">
          <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
        </button>
      </div>
    </div>
  </div>
</div>
```

**Key points:**
- Use the `imds-textbox` class even for `type="date"`
- Use `has-text-end` to right-align the amount field

### 4.2 Multi-row Field Group (Machine Info)

Pattern for placing multiple nested `imds-field-group` elements inside `imds-field-group-control`, with fields arranged horizontally per row.

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>Machine Info</span></div>
  <div class="imds-field-group-control">
    <!-- Row 1: Manufacturer name / Model name -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-manufacturer">
          <div class="imds-field-label"><label for=":r6l:">Manufacturer Name</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6l:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-model">
          <div class="imds-field-label"><label for=":r6m:">Model Name</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6m:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
    <!-- Row 2: Machine name / Serial number / MAC address -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-machine-name">
          <div class="imds-field-label"><label for=":r6n:">Machine Name</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6n:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-serial">
          <div class="imds-field-label"><label for=":r6o:">Serial Number</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6o:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-mac-address">
          <div class="imds-field-label"><label for=":r6p:">MAC Address</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6p:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
    <!-- Row 3: OS / Other -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-os">
          <div class="imds-field-label"><label for=":r6q:">OS</label></div>
          <div class="imds-field-control">
            <select
              id=":r6q:"
              class="imds-select">
              <option>Please select</option>
              <option>Windows10</option>
              <option>Windows10</option>
              <option>Mac</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div class="imds-field sample-model">
          <div class="imds-field-label"><label for=":r6r:">Other</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6r:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Key points:**
- The outer `imds-field-group-control` does not have `is-horizontal` and is arranged vertically (row by row)
- Arrange each row horizontally using a nested `imds-field-group` > `imds-field-group-control is-horizontal`
- The number of fields per row can differ (2 columns, 3 columns, 2 columns)

### 4.3 Connected Text + Select Field (Specs)

Pattern for connecting a text input and a unit select horizontally, as with memory capacity.

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>Specs</span></div>
  <div class="imds-field-group-control">
    <!-- Row 1: CPU generation / SSD capacity / HDD capacity -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-cpu">
          <div class="imds-field-label"><label for=":r6s:">CPU Generation</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6s:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-ssd">
          <div class="imds-field-label"><label for=":r6t:">SSD Capacity</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6t:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-hdd">
          <div class="imds-field-label"><label for=":r6u:">HDD Capacity</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6u:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
    <!-- Row 2: Memory capacity + unit select + memory info -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field-group sample-memory-group">
          <div class="imds-field-group-control is-horizontal">
            <div class="imds-field sample-memory-size">
              <div class="imds-field-label"><label for=":r6v:">Memory Capacity</label></div>
              <div class="imds-field-control">
                <input
                  type="text"
                  id=":r6v:"
                  class="imds-textbox"
                  value="" />
              </div>
            </div>
            <div class="imds-field sample-memory-size-unit">
              <div class="imds-field-control">
                <select
                  id=":r70:"
                  class="imds-select">
                  <option>GB</option>
                  <option>TB</option>
                </select>
              </div>
            </div>
            <div class="imds-field sample-memory">
              <div class="imds-field-label"><label for=":r71:">Memory Info</label></div>
              <div class="imds-field-control">
                <input
                  type="text"
                  id=":r71:"
                  class="imds-textbox"
                  value="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Key points:**
- Group the memory capacity and unit select further with `imds-field-group` to create a connected appearance
- The unit select (`sample-memory-size-unit`) omits `imds-field-label` and places only the control

### 4.4 Checkbox + File Upload (Storage Encryption)

Pattern for placing a checkbox and file upload vertically within the same group.

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>Storage Encryption</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field">
      <div class="imds-field-control">
        <label class="imds-checkbox">
          <input type="checkbox" />
          <span>Encrypted</span>
        </label>
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-control">
        <div class="imds-file-upload">
          <div class="imds-file-upload-drop-area">
            <input type="file" />
            <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
            <p class="imds-file-upload-message">Drag & drop files here</p>
            <p class="imds-file-upload-text">or</p>
            <button
              type="button"
              class="imds-button is-outlined is-small is-primary">
              Select File
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 5. Footer (Action Buttons)

The action button area fixed at the bottom of the form. Place it directly under `<main>`, **outside** the scroll area (`<form>`), and give it the fixed class name `pgstyle-layout-footer` (`flex: 0 0 auto`) so it keeps a fixed size. See "Implementation Notes" for the CSS definition.
Place a primary button (Register) and an outline button (Save as Draft) side by side.

```html
<div class="pgstyle-layout-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button
    type="button"
    class="imds-button is-primary"
    style="min-width: 8em;">
    Register
  </button>
  <button
    type="button"
    class="imds-button is-outlined is-primary"
    style="min-width: 8em;">
    Save as Draft
  </button>
</div>
```

**Key points:**
- Use `imds-border-t-1` to display a border line against the form area
- Use `is-primary` for the main action (Register) and `is-outlined is-primary` for the sub-action (Save as Draft)
- For width control, don't define a custom `min-width-8em`-style class; use the inline `style="min-width: 8em;"` instead (see the anti-pattern in `jssp-presentation-page.md`, "Controlling Input Field Width" — a custom class has the same specificity as imds standard classes and can be overridden by them)

## Implementation Notes

- Uniformly apply `is-horizontal imds-w-15` to all `imds-field-group` elements to align label widths
- Also apply the same `is-horizontal imds-w-15` to standalone `imds-field` elements to align with groups
- The `:r6b:` etc. in `for` / `id` attributes are placeholders; replace them with unique values during implementation
- Add `readonly` to text boxes with a search icon (`imds-textbox-control`) and place a clear button alongside
- Classes with the `sample-` prefix are custom classes for layout adjustment and are not standard imds theme classes. **When generating code, replace them with a prefix matching the feature name** (e.g. `product-*` for a product management screen). Keep standard classes that start with `imds-` unchanged
- `pgstyle-layout-footer` is a **fixed** class name, not a per-feature placeholder — do not rename it when generating a page
- This template only shows the HTML fragment for the footer, so define the following layout-control style in the `<style>` inside `<imart type="head">` (since only the footer exists here as an independent snippet, this file lists only the `pgstyle-layout-footer` definition. If you use the entire form — `imds-container` / `<main>` / the form body's scroll area — you also need the `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` definitions. See [imds-list-page.md](imds-list-page.md), "Implementation Notes" for the full catalog, which includes `pgstyle-layout-content`)

  ```css
  /* Layout control styles */
  .pgstyle-layout-footer {
    flex: 0 0 auto;
    display: flex;
    justify-content: left;
    gap: 2em;
  }
  ```

- `<imart type="head">` must also load `im_design_system/theme/css/theme-conditional-layout.css` (CSS that controls the height/width of the content area, which differs per theme). Without it, `.imds-container` has no fixed height, which can lead to the content area collapsing to zero height.

  ```html
  <!-- CSS that controls the height/width of the content area, which differs per theme -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  ```

## 6. Decision Criteria (Form Design Guidelines)

While "Implementation Notes" covers class-name- and structure-level conventions, this section summarizes the design decision criteria for "which option to choose in which case."

### 6.1 Choosing Among Required Marks

There are three variants of required marks. **Always standardize on a single variant within the same system and the same screen** (mixing styles across screens leads users to misread "a difference in notation" as "a difference in meaning").

| Class | Appearance | Suitable audience | Example use case |
|---|---|---|---|
| `imds-required-label-required` (+ `data-required-label="Required"`) | Displays a "Required" badge | End users / screens for users without high IT literacy | General-purpose application forms, general master registration screens |
| `imds-required-label-optional` (+ `data-required-label="Optional"`) | Displays an "Optional" badge | Screens where most fields are required and only a few are optional | Forms with mostly required fields, where only supplementary info is optional |
| `imds-required-label-required-asterisk` | Displays an asterisk `*` | Administration screens / business systems for users with high IT literacy | System administrator settings screens, developer admin consoles |

**Decision procedure:**
1. First check the user base. For admin screens, settings screens, and other screens aimed at "users experienced with business systems," `required-asterisk` (asterisk) is acceptable
2. For end-user-facing / general-user screens, prefer explicit "Required" notation (`required`)
3. When required fields make up most of the screen and optional fields are only a small portion, consider the opposite approach: attach only the "Optional" mark (`optional`) to the few optional fields and leave the rest unmarked (this minimizes the number of marks)
4. If the specification does not specify a required mark, use `imds-required-label-required` ("Required" notation) as the default

### 6.2 Ordering of Fields / Field Groups

- Arrange input items **from top-left to bottom-right, starting with the items of highest importance or the most natural input order**
- A typical priority guideline: "Identifying information (code, name, etc.)" → "Classification / status" → "Detailed / supplementary information" → "Optional items such as remarks / notes"
- Group related items (e.g. "Manufacturer Name" and "Model Name", "Purchase Date" and "Purchase Amount") into the same `imds-field-group` to reduce eye movement
- When an item's input depends on another item's content (e.g. selecting "Prefecture" changes the options for "City"), place the source item before the dependent item
- At the section (`imds-section`) level as well, the principle is to order sections as Basic Information → Details → Optional / supplementary information (see the order of "Basic Information" and "Details" in the form screen implementation example)

### 6.3 Preserving Input on Validation Errors

- Even when a validation error occurs, **do not clear the values the user has already entered; keep displaying them on screen as-is** (preserve all values, both the ones that failed validation and the ones that were valid)
- The same applies to server-side errors such as communication errors or save failures: keep the input values and display only the error message
- Implementation patterns:
  - For server-side validation, include the input values as-is in the error response, and re-display them on the function container side using `<imart type="string" value=$xxx>`
  - For client-side validation, simply stop form submission with `preventDefault()` etc., without modifying the input value DOM
  - For the error display itself, show `<span class="imds-error-text">` directly under the corresponding `imds-field`, and toggle the `imds-validation-error` class on the `imds-field` to visually emphasize it (see "Form Implementation Patterns" in SKILL.md for details)
- Ensure that input values are not lost across page transitions or temporary re-displays (e.g. opening and closing another dialog)
