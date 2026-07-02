# Input Form Screen Implementation Example

An implementation example of a business input form screen combining imds theme components.
Using the "PC Terminal - New Registration" screen as a subject, this shows the composition pattern of header, sections, field groups, various input components, and footer buttons.

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

```
imds-container
├── header.imds-header           ... Page header (back button + icon + title)
└── main
    ├── form.imds-form           ... Form body (scrollable area)
    │   ├── section (Basic Info)  ... Section 1
    │   │   └── imds-field-container
    │   │       ├── field-group (Owning Company)
    │   │       ├── field-group (Usage Status)
    │   │       ├── field-group (PC Type)
    │   │       └── field (User)
    │   └── section (Details)    ... Section 2
    │       └── imds-field-container
    │           ├── field-group (Purchase Info)
    │           ├── field-group (Machine Info)
    │           ├── field-group (Specs)
    │           └── field-group (Storage Encryption)
    └── div (Footer)             ... Register / Save as Draft buttons
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

Apply gray background (`has-background-color-gray`) to `imds-form` and configure it as a scrollable area.
Divide the form logically with `imds-section` and add headings with `imds-heading` for each section.

```html
<form class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
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
```

**Key points:**
- `imds-field-container has-accent-color` adds an accent color vertical line to the field group
- `imds-content-normal-width` restricts the content width to standard width

## 3. Basic Information Section

### 3.1 Radio Button + Sub-field Combination (Owning Company)

Pattern for placing sub-fields (company name, department name) below radio button selection inside `imds-field-group`.
Add required mark with `imds-required-label-required` to the group label.

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
- Stack radio group and sub-field group vertically inside `imds-field-group-control`
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
- Use `imds-textbox-control` to achieve a read-only text box with search icon
- Place the clear button (`fa-xmark-circle`) alongside inside `imds-field-control`

### 3.3 Vertical Radio Buttons (PC Type)

When there are many options, use `imds-radio-group` in default (vertical) layout.

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
- The outer `imds-field-group-control` does not have `is-horizontal` (vertical per row)
- Arrange each row horizontally using nested `imds-field-group` > `imds-field-group-control is-horizontal`
- The number of fields per row can differ (2 columns, 3 columns, 2 columns)

### 4.3 Connected Text + Select Field (Specs)

Pattern for connecting a text input and a unit select horizontally, like memory capacity.

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
- Group memory capacity and unit select further with `imds-field-group` to create a connected appearance
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

The action button area fixed at the bottom of the form.
Place a primary button (Register) and an outline button (Save as Draft) side by side.

```html
<div class="sample-layout-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button
    type="button"
    class="imds-button sample-import-button-min-width-8em is-primary">
    Register
  </button>
  <button
    type="button"
    class="imds-button sample-import-button-min-width-8em is-outlined is-primary">
    Save as Draft
  </button>
</div>
```

**Key points:**
- Use `imds-border-t-1` to display a border line with the form area
- Use `is-primary` for main action (Register) and `is-outlined is-primary` for sub-action (Save as Draft)

## Implementation Notes

- Uniformly apply `is-horizontal imds-w-15` to all `imds-field-group` elements to align label widths
- Also apply the same `is-horizontal imds-w-15` to standalone `imds-field` elements to align with groups
- The `:r6b:` etc. in `for` / `id` attributes are placeholders; replace with unique values during implementation
- Add `readonly` to text boxes with search icon (`imds-textbox-control`) and place a clear button alongside
- Classes with the `sample-` prefix are custom classes for layout adjustment and are not standard imds theme classes
