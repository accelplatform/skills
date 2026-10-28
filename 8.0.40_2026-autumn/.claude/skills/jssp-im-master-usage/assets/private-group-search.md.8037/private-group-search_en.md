# Private Group Search Dialog Implementation Example

An implementation example for calling the private group search dialog using `imACMSearch` from IM-Common Master.
Demonstrates the pattern of opening a search dialog on textbox click and reflecting the selected result into the form.
The page skeleton follows `assets/imds-form-page.md` in `jssp-imds-theme` (the `pgstyle-layout-*` layout that keeps the header fixed and scrolls only the form area), and the pair of function container (`index.js`) and presentation page (`index.html`) works as a screen as-is.

## Components Used

| Component | reference | Purpose in this example |
|---------------|-----------|-------------|
| imACMSearch | [imart-tag-acm-search.md](../reference/imart-tag-acm-search.md) | Calls the IM-Common Master search dialog |
| Header | `imds-html-header.md` in `jssp-imds-theme` | Page header (icon and title) |
| Field | `imds-html-field.md` in `jssp-imds-theme` | Private group name input field |
| TextboxControl | `imds-html-textbox-control.md` in `jssp-imds-theme` | Textbox with search icon |
| IconButton | `imds-html-icon-button.md` in `jssp-imds-theme` | Clear button (× icon) |

## Overall Structure

```
index.js (function container)
├── $title / $subTitle            ... Screen name output to the page header and <title>
└── $targetLocale                 ... Display locale of the search dialog (logged-in user's locale)

<imart type="head">
├── <title> / <meta>              ... Title and secure token
├── <link> / <style>              ... Load theme-conditional-layout.css and define pgstyle-layout-*
├── <imart type="imACMSearch" />  ... Load tag for calling the search screen
└── <script>
    ├── callbackFromImMaster()      ... Callback function to receive the selected result (global scope)
    ├── window.callbackFromImMaster ... Register callback function globally
    └── DOMContentLoaded
        ├── setSelectedPrivateGroup()   ... Reflect the selected result into the form (exposed as window._setSelectedPrivateGroup)
        ├── addEventListener('click') ... Open search dialog on textbox click (imACMSearch.open)
        └── addEventListener('click') ... Clear the selected result with the clear button

div.imds-container.pgstyle-layout-container
├── header.imds-header            ... Page header (icon and title)
└── main.pgstyle-layout-main
    └── form.imds-form.pgstyle-layout-content
        └── section
            └── imds-field-container
                └── imds-field (private group name)
                    └── imds-field-control
                        ├── input[type="hidden"]    ... Private group code (hidden field)
                        ├── imds-textbox-control    ... Private group name (with search icon, readonly)
                        └── button.imds-button      ... Clear button (× icon)
```

## 1. head Section (Search Dialog Configuration)

### 1.1 Loading the imACMSearch Tag

Place `<imart type="imACMSearch" />` inside `<imart type="head">` to generate the object for calling the search screen.

```html
<imart type="head">
  <!-- Tag for calling IM-Common Master search screen -->
  <imart type="imACMSearch" />
</imart>
```

**Key points:**
- `<imart type="imACMSearch" />` must always be placed inside `<imart type="head">`
- This generates the `imACMSearch` object globally

### 1.2 Launching the Search Dialog

Call `imACMSearch.open(parameter)` on the textbox click event to display the search dialog as a popup.

```html
<script type="text/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Private group name click event
    document.getElementById(':privateGroupName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : "jp.co.intra_mart.master.app.search.tabs.private_group.list",
          title: "Keyword"
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.private_group.list' : ['private_group_cd', 'private_group_name']
        },
        callback_function : 'callbackFromImMaster',
        basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
        wnd_title         : "Private Group Search",
        message           : "Private Group Search",
        wnd_close         : true,
        type              : 'single',
        deleted_data      : false,
        target_locale     : '<imart type="string" value=$targetLocale escapeXml="false" escapeJs="true"></imart>'
      };

      // Open the search screen
      imACMSearch.open(parameter);
    });
  });
</script>
```

**Key points:**
- Specify the private group search plugin ID `jp.co.intra_mart.master.app.search.tabs.private_group.list` in `tabs`
- Private group search has only a keyword search tab (no tree search tab)
- Use `prop` to specify the fields passed to the callback function (`private_group_cd`, `private_group_name`)
- `type: 'single'` enables single-selection mode; `'multiple'` enables multi-selection mode
- `wnd_close: true` automatically closes the dialog after selection
- Because elements are referenced, register the event inside `DOMContentLoaded` (scripts inside `<imart type="head">` run before the body elements exist)
- `target_locale` outputs `$targetLocale` bound in the function container (the logged-in user's locale, `Contexts.getAccountContext().locale`) so that the search dialog is displayed in the logged-in user's locale. Because it is a string literal inside `<script>`, specify `escapeXml="false" escapeJs="true"` (see "When Used as a JavaScript String Literal" in `jssp-presentation-page.md`)

### 1.3 Callback Function

Receive the selected private group information from the search dialog and reflect it into the form fields by calling the function in 1.4.

```html
<script type="text/javascript">
  // Callback function (defined in the global scope because imACMSearch calls it by name)
  function callbackFromImMaster(result) {
    // Do nothing when nothing is selected (keep the current value)
    if (!result || result.length === 0) {
      return;
    }
    if (typeof window._setSelectedPrivateGroup === 'function') {
      window._setSelectedPrivateGroup(result[0].data.private_group_cd, result[0].data.private_group_name);
    }
  }
  // Place function in global scope
  window.callbackFromImMaster = callbackFromImMaster;
</script>
```

**Key points:**
- The callback function receives the selected results as an array of objects
- For single selection (`type: 'single'`), retrieve using `result[0]`
- When the result is empty (nothing selected), do nothing and keep the current value. Clear the selection with the clear button
- A private group's primary key consists of a single `private_grp_cd`
- The private group search `data` includes `private_group_cd`, `user_cd`, and `private_group_name`
- The callback function must be registered in the global scope using `window.functionName = functionName`
- Because the callback function cannot directly reference functions inside `DOMContentLoaded`, it reflects the values into the form via the function exposed as `window._setSelectedPrivateGroup` (see "Global Scope Callback Functions (imACMSearch, etc.)" in `jssp-presentation-page.md`)

### 1.4 Reflecting and Clearing the Selection

Inside `DOMContentLoaded`, define the function that reflects the selected result into the form and expose it as `window._setSelectedPrivateGroup` for the callback function. The clear button passes empty strings to the same function to clear the selection.

```html
<script type="text/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // Reflect the selected result into the form (pass empty strings to clear)
    function setSelectedPrivateGroup(privateGroupCode, privateGroupName) {
      document.getElementById(':privateGroupCode:').value = privateGroupCode;
      document.getElementById(':privateGroupName:').value = privateGroupName;
    }
    // Expose it so that the global-scope callback function can call it
    window._setSelectedPrivateGroup = setSelectedPrivateGroup;

    // Clear button click event
    document.getElementById('private-group-clear-button').addEventListener('click', () => {
      setSelectedPrivateGroup('', '');
    });
  });
</script>
```

**Key points:**
- Update the hidden field (code value) and the display textbox (name) in the same function so that they never get out of sync
- Because the display textbox is `readonly`, the selection is cleared with the clear button

## 2. body Section (Form Elements)

Place a hidden field (to hold the code value) and a readonly textbox with search icon (to display the name).
Next to the name display field, place a clear button that clears the selection ("Search Icon + Clear Button" in `imds-html-textbox-control.md` of `jssp-imds-theme`).

```html
<div class="imds-field is-horizontal imds-w-15 sample-private-group">
  <div class="imds-field-label"><label for=":privateGroupName:">Private Group Name</label></div>
  <div class="imds-field-control">
    <input type="hidden" id=":privateGroupCode:" value="">
    <div class="imds-textbox-control">
      <input type="text" id=":privateGroupName:" placeholder="Select private group name" class="imds-textbox" readonly value="">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" id="private-group-clear-button" class="imds-button is-ghost" title="Clear">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

**Key points:**
- Use `input[type="hidden"]` to hold the private group code for server submission
- Set the display textbox to `readonly` to allow selection only from the search dialog
- Place a magnifying glass icon (`fa-magnifying-glass`) inside `imds-textbox-control` to indicate searchability
- Place `input[type="hidden"]` outside `imds-textbox-control` (directly under `imds-field-control`); `imds-textbox-control` contains only `input.imds-textbox` and `span.imds-icon`
- Because the clear button is icon-only, indicate its action with the `title` attribute (`imds-html-icon-button.md`)
- Use `is-horizontal imds-w-15` to place the label and field side by side with a uniform label width

## Full Code

### Function Container (index.js)

```javascript
/**
 * Private Group Search screen
 *
 * @file index.js
 * @description Constructs a screen that displays the value selected in the IM-Common Master search dialog in the form.
 */

// ========================================
// Bind variables (for presentation page integration)
// ========================================
let $title = 'Private Group Search';
let $subTitle = 'IM-Common Master Sample';
let $targetLocale = '';    // Display locale of the search dialog (logged-in user's locale)

// ========================================
// Entry point
// ========================================
/**
 * Entry point for screen display.
 * Executed first when the screen URL is accessed.
 * Sets the logged-in user's locale to the bind variable as the display locale of the search dialog.
 *
 * @param {Object} request - Request object
 */
function init(request) {
  // Use the logged-in user's locale as the display locale of the search dialog
  $targetLocale = Contexts.getAccountContext().locale;
}
```

### Presentation Page (index.html)

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- Secure token -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- CSS that controls the height/width of the content area, which differs per theme -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  <!-- Presentation page custom styles -->
  <style>
    /* Layout control styles */
    .pgstyle-layout-container {
      grid-template-rows: 5rem minmax(0, 1fr);
      grid-template-columns: 100%;
      height: 100%;
      display: grid;
    }
    .pgstyle-layout-container > .imds-header {
      grid-row: 1 / 2;
    }
    .pgstyle-layout-main {
      flex-direction: column;
      grid-row: 2 / 3;
      height: 100%;
      display: flex;
    }
    .pgstyle-layout-content {
      flex: 1 0 0;
      overflow: auto;
    }
  </style>
  <!-- Tag for calling IM-Common Master search screen -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // Callback function (defined in the global scope because imACMSearch calls it by name)
    function callbackFromImMaster(result) {
      // Do nothing when nothing is selected (keep the current value)
      if (!result || result.length === 0) {
        return;
      }
      if (typeof window._setSelectedPrivateGroup === 'function') {
        window._setSelectedPrivateGroup(result[0].data.private_group_cd, result[0].data.private_group_name);
      }
    }
    // Place function in global scope
    window.callbackFromImMaster = callbackFromImMaster;

    document.addEventListener('DOMContentLoaded', () => {
      // Reflect the selected result into the form (pass empty strings to clear)
      function setSelectedPrivateGroup(privateGroupCode, privateGroupName) {
        document.getElementById(':privateGroupCode:').value = privateGroupCode;
        document.getElementById(':privateGroupName:').value = privateGroupName;
      }
      // Expose it so that the global-scope callback function can call it
      window._setSelectedPrivateGroup = setSelectedPrivateGroup;

      // Private group name click event
      document.getElementById(':privateGroupName:').addEventListener('click', () => {
        const parameter = {
          tabs: [{
            id   : "jp.co.intra_mart.master.app.search.tabs.private_group.list",
            title: "Keyword"
          }],
          prop: {
            'jp.co.intra_mart.master.app.search.tabs.private_group.list' : ['private_group_cd', 'private_group_name']
          },
          callback_function : 'callbackFromImMaster',
          basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
          wnd_title         : "Private Group Search",
          message           : "Private Group Search",
          wnd_close         : true,
          type              : 'single',
          deleted_data      : false,
          target_locale     : '<imart type="string" value=$targetLocale escapeXml="false" escapeJs="true"></imart>'
        };

        // Open the search screen
        imACMSearch.open(parameter);
      });

      // Clear button click event
      document.getElementById('private-group-clear-button').addEventListener('click', () => {
        setSelectedPrivateGroup('', '');
      });
    });
  </script>
</imart>

<!-- Page-wide container (not given an id, since it is placed inside the intra-mart theme's imui-container) -->
<div class="imds-container pgstyle-layout-container">
  <!-- Header -->
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-user-group"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>

  <!-- Main content -->
  <main class="pgstyle-layout-main">
    <form class="imds-form has-background-color-gray pgstyle-layout-content imds-scrollbar imds-py-4 imds-px-6">
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <div class="imds-field-container has-accent-color">
          <div class="imds-field is-horizontal imds-w-15 sample-private-group">
            <div class="imds-field-label"><label for=":privateGroupName:">Private Group Name</label></div>
            <div class="imds-field-control">
              <input type="hidden" id=":privateGroupCode:" value="">
              <div class="imds-textbox-control">
                <input type="text" id=":privateGroupName:" placeholder="Select private group name" class="imds-textbox" readonly value="">
                <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
              </div>
              <button type="button" id="private-group-clear-button" class="imds-button is-ghost" title="Clear">
                <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </form>
  </main>
</div>
```

## Implementation Notes

- `<imart type="imACMSearch" />` must always be placed inside `<imart type="head">`
- The callback function must be registered in the global scope using `window.functionName = functionName`
- Explicitly specify the plugin ID in `tabs` and match it with the key in `prop`
- Set the display field to `readonly` to allow selection only from the search dialog
- `:privateGroupCode:` and `:privateGroupName:` are input element ids that follow "Naming Convention for the `id` Attribute" in `jssp-presentation-page.md`. When placing the same search field more than once on a screen, rename these ids, the clear button id, and the reflect function name so that they do not collide
- Classes prefixed with `sample-` are custom classes for layout adjustment and are not standard imds theme classes
- Do not hard-code the header title and subtitle; output `$title` / `$subTitle` bound in the function container
- Do not hard-code `target_locale` (e.g. `'ja'`); output `$targetLocale` (the logged-in user's locale) bound in the function container with `escapeXml="false" escapeJs="true"`
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` are fixed class names that must not be renamed. Load `theme-conditional-layout.css` in `<imart type="head">` and define the layout control styles in `<style>` (`assets/imds-form-page.md` in `jssp-imds-theme`)
- When the callback `result` is empty (nothing selected), do nothing and do not clear the current value
- For multi-selection mode (`type: 'multiple'`), process `result` with a `for` loop inside the callback
- In multi-selection mode, store the callback `result` in a variable and pass it as the `default_selected` parameter when reopening the dialog to restore previously selected items. The implementation pattern is as follows:
  - Declare a holding variable: `let selectedPrivateGroup = [];`
  - Save in the callback (skip when `result` is empty to keep the selected items): `selectedPrivateGroup = result;`
  - Pass when launching the dialog: `default_selected: selectedPrivateGroup`
  - Empty it when clearing: `selectedPrivateGroup = [];`
- Private groups display only the groups belonging to the currently logged-in user
