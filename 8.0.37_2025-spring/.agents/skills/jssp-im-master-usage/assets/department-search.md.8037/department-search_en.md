# Department Search Dialog Implementation Example

An implementation example for calling the department (organization) search dialog using `imACMSearch` from IM-Common Master.
Demonstrates the pattern of opening a search dialog on textbox click and reflecting the selected result into the form.
Implemented with a two-tab layout consisting of a keyword search tab and a tree search tab.

## Components Used

| Component | reference | Purpose in this example |
|---------------|-----------|-------------|
| imACMSearch | [imart-tag-acm-search.md](../reference/imart-tag-acm-search.md) | Calls the IM-Common Master search dialog |
| Field | (imds-theme) | Department name input field |
| TextboxControl | (imds-theme) | Textbox with search icon |

## Overall Structure

```
<imart type="head">
├── <imart type="imACMSearch" />   ... Load tag for calling the search screen
└── <script>
    ├── addEventListener('click')  ... Open search dialog on textbox click
    ├── imACMSearch.open(parameter) ... Display search screen as popup
    ├── callbackFromImMaster()     ... Callback function to receive selected result
    └── window.callbackFromImMaster ... Register callback function globally

<div id="container">
└── imds-container
    └── main
        └── form.imds-form
            └── section
                └── imds-field-container
                    └── imds-field (department name)
                        ├── input[type="hidden"]    ... Company code (hidden field)
                        ├── input[type="hidden"]    ... Department set code (hidden field)
                        ├── input[type="hidden"]    ... Department code (hidden field)
                        └── imds-textbox-control    ... Department name (with search icon, readonly)
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
For department search, specify two tabs: keyword search and tree search.

```html
<script type="text/javascript">
  // Department name click event
  document.getElementById(':departmentName:').addEventListener('click', () => {
    const parameter = {
      tabs: [{
        id   : "jp.co.intra_mart.master.app.search.tabs.department.list",
        title: "Keyword"
      }, {
        id   : "jp.co.intra_mart.master.app.search.tabs.department.tree",
        title: "Tree"
      }],
      prop: {
        'jp.co.intra_mart.master.app.search.tabs.department.list' : ['company_cd', 'department_set_cd', 'department_cd', 'department_name'],
        'jp.co.intra_mart.master.app.search.tabs.department.tree' : ['company_cd', 'department_set_cd', 'department_cd', 'department_name']
      },
      callback_function : 'callbackFromImMaster',
      basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
      wnd_title         : "Department Search",
      message           : "Department Search",
      wnd_close         : true,
      type              : 'single',
      deleted_data      : false,
      target_locale     : 'ja'
    };

    // Open the search screen
    imACMSearch.open(parameter);
  });
</script>
```

**Key points:**
- Specify two department search plugin IDs in `tabs` to display both keyword search (`department.list`) and tree search (`department.tree`) tabs
- `prop` specifies the fields to retrieve for each tab. Even when retrieving the same fields for both tabs, each key must be specified separately
- `type: 'single'` enables single-selection mode; `'multiple'` enables multi-selection mode
- `wnd_close: true` automatically closes the dialog after selection
- If only the keyword search tab is sufficient, specify only `department.list` in `tabs`

### 1.3 Callback Function

Receive the selected department information from the search dialog and reflect it into the form fields.

```html
<script type="text/javascript">
  // Callback function
  function callbackFromImMaster(result) {
    const companyCd       = result[0].data.company_cd;
    const departmentSetCd = result[0].data.department_set_cd;
    const departmentCd    = result[0].data.department_cd;
    const departmentName  = result[0].data.department_name;
    document.getElementById(':companyCode:').value       = companyCd;
    document.getElementById(':departmentSetCode:').value = departmentSetCd;
    document.getElementById(':departmentCode:').value    = departmentCd;
    document.getElementById(':departmentName:').value    = departmentName;
  }
  // Place function in global scope
  window.callbackFromImMaster = callbackFromImMaster;
</script>
```

**Key points:**
- The callback function receives the selected results as an array of objects
- For single selection (`type: 'single'`), retrieve using `result[0]`
- The department search `data` includes `company_cd`, `department_set_cd`, `department_cd`, `department_name`, and `delete_flag`
- The callback function must be registered in the global scope using `window.functionName = functionName`

## 2. body Section (Form Elements)

Place hidden fields (to hold primary keys) and a readonly textbox with search icon (to display the name).
Since a department's primary key consists of three parts — company code, department set code, and department code — each is stored in a hidden field.

```html
<div class="imds-field is-horizontal imds-w-15 sample-department">
  <div class="imds-field-label"><label for=":departmentName:">Department Name</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="hidden" id=":companyCode:" value="">
      <input type="hidden" id=":departmentSetCode:" value="">
      <input type="hidden" id=":departmentCode:" value="">
      <input type="text" id=":departmentName:" placeholder="Select department name" class="imds-textbox" readonly value="">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
  </div>
</div>
```

**Key points:**
- Use `input[type="hidden"]` to hold the three primary keys — company code, department set code, and department code — for server submission
- Set the display textbox to `readonly` to allow selection only from the search dialog
- Place a magnifying glass icon (`fa-magnifying-glass`) inside `imds-textbox-control` to indicate searchability
- Use `is-horizontal imds-w-15` to place the label and field side by side with a uniform label width

## Full Code

```html
<imart type="head">
  <!-- Tag for calling IM-Common Master search screen -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // Department name click event
    document.getElementById(':departmentName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : "jp.co.intra_mart.master.app.search.tabs.department.list",
          title: "Keyword"
        }, {
          id   : "jp.co.intra_mart.master.app.search.tabs.department.tree",
          title: "Tree"
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.department.list' : ['company_cd', 'department_set_cd', 'department_cd', 'department_name'],
          'jp.co.intra_mart.master.app.search.tabs.department.tree' : ['company_cd', 'department_set_cd', 'department_cd', 'department_name']
        },
        callback_function : 'callbackFromImMaster',
        basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
        wnd_title         : "Department Search",
        message           : "Department Search",
        wnd_close         : true,
        type              : 'single',
        deleted_data      : false,
        target_locale     : 'ja'
      };

      // Open the search screen
      imACMSearch.open(parameter);
    });

    // Callback function
    function callbackFromImMaster(result) {
      const companyCd       = result[0].data.company_cd;
      const departmentSetCd = result[0].data.department_set_cd;
      const departmentCd    = result[0].data.department_cd;
      const departmentName  = result[0].data.department_name;
      document.getElementById(':companyCode:').value       = companyCd;
      document.getElementById(':departmentSetCode:').value = departmentSetCd;
      document.getElementById(':departmentCode:').value    = departmentCd;
      document.getElementById(':departmentName:').value    = departmentName;
    }
    // Place function in global scope
    window.callbackFromImMaster = callbackFromImMaster;
  </script>
</imart>

<!-- Page-wide container -->
<div id="container">
  <div class="imds-container">
    <header class="imds-header">
      <div class="imds-header-icon">
        <span class="imds-icon-wrapper is-large">
          <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
        </span>
      </div>
      <div class="imds-header-title">
        <p>IM-Common Master Sample</p>
        <h1>Department Search</h1>
      </div>
    </header>
    <main>
      <form class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <div class="imds-field-container has-accent-color">
            <div class="imds-field is-horizontal imds-w-15 sample-department">
              <div class="imds-field-label"><label for=":departmentName:">Department Name</label></div>
              <div class="imds-field-control">
                <div class="imds-textbox-control">
                  <input type="hidden" id=":companyCode:" value="">
                  <input type="hidden" id=":departmentSetCode:" value="">
                  <input type="hidden" id=":departmentCode:" value="">
                  <input type="text" id=":departmentName:" placeholder="Select department name" class="imds-textbox" readonly value="">
                  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </main>
  </div>
</div>
```

## Implementation Notes

- `<imart type="imACMSearch" />` must always be placed inside `<imart type="head">`
- The callback function must be registered in the global scope using `window.functionName = functionName`
- Explicitly specify the plugin ID in `tabs` and match it with the key in `prop`
- When using multiple tabs, specify the fields to retrieve for each tab's plugin ID in `prop`
- Set the display field to `readonly` to allow selection only from the search dialog
- `:companyCode:`, `:departmentSetCode:`, `:departmentCode:`, and `:departmentName:` are placeholders; replace them with unique IDs during implementation
- Classes prefixed with `sample-` are custom classes for layout adjustment and are not standard imds theme classes
- For multi-selection mode (`type: 'multiple'`), process `result` with a `for` loop inside the callback
- In multi-selection mode, store the callback `result` in a variable and pass it as the `default_selected` parameter when reopening the dialog to restore previously selected items. The implementation pattern is as follows:
  - Declare a holding variable: `let selectedDepartment = [];`
  - Save in the callback: `selectedDepartment = result;`
  - Pass when launching the dialog: `default_selected: selectedDepartment`
