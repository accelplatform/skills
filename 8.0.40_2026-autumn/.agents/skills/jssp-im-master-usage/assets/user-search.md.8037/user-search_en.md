# User Search Dialog Implementation Example

An implementation example for calling the user search dialog using `imACMSearch` from IM-Common Master.
Demonstrates the pattern of opening a search dialog on textbox click and reflecting the selected result into the form.

## Components Used

| Component | reference | Purpose in this example |
|---------------|-----------|-------------|
| imACMSearch | [imart-tag-acm-search.md](../reference/imart-tag-acm-search.md) | Calls the IM-Common Master search dialog |
| Field | (imds-theme) | User name input field |
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
                    └── imds-field (user name)
                        ├── input[type="hidden"]    ... User code (hidden field)
                        └── imds-textbox-control    ... User name (with search icon, readonly)
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
  // User name click event
  document.getElementById(':userName:').addEventListener('click', () => {
    const parameter = {
      tabs: [{
        id   : "jp.co.intra_mart.master.app.search.tabs.user.list_user",
        title: "Keyword"
      }],
      prop: {
        'jp.co.intra_mart.master.app.search.tabs.user.list_user' : ['user_cd', 'user_name']
      },
      callback_function           : 'callbackFromImMaster',
      basic_area                  : 'jp.co.intra_mart.master.app.search.headers.readonly',
      wnd_title                   : "User Search",
      message                     : "User Search",
      wnd_close                   : true,
      type                        : 'single',
      deleted_data                : false,
      target_locale               : 'ja',
      additional_disp             : true,
      additional_user_search_name : true,
      additional_dept             : true
    };

    // Open the search screen
    imACMSearch.open(parameter);
  });
</script>
```

**Key points:**
- Explicitly specify the plugin ID in `tabs` to show only the required tabs
- Use `prop` to specify the fields passed to the callback function (`user_cd`, `user_name`)
- `type: 'single'` enables single-selection mode; `'multiple'` enables multi-selection mode
- `wnd_close: true` automatically closes the dialog after selection
- `additional_disp`, `additional_user_search_name`, and `additional_dept` are user search-specific options that display supplementary information, search name, and affiliation

### 1.3 Callback Function

Receive the selected user information from the search dialog and reflect it into the form fields.

```html
<script type="text/javascript">
  // Callback function
  function callbackFromImMaster(result) {
    const userCode = result[0].data.user_cd;
    const userName = result[0].data.user_name;
    document.getElementById(':userCode:').value = userCode;
    document.getElementById(':userName:').value = userName;
  }
  // Place function in global scope
  window.callbackFromImMaster = callbackFromImMaster;
</script>
```

**Key points:**
- The callback function receives the selected results as an array of objects
- For single selection (`type: 'single'`), retrieve using `result[0]`
- Field names inside `result[i].data` correspond to the keys specified in `prop`
- The callback function must be registered in the global scope using `window.functionName = functionName`

## 2. body Section (Form Elements)

Place a hidden field (to hold the code value) and a readonly textbox with search icon (to display the name).

```html
<div class="imds-field is-horizontal imds-w-15 sample-user">
  <div class="imds-field-label"><label for=":userName:">User Name</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="hidden" id=":userCode:" value="">
      <input type="text" id=":userName:" placeholder="Select user name" class="imds-textbox" readonly value="">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
  </div>
</div>
```

**Key points:**
- Use `input[type="hidden"]` to hold the user code for server submission
- Set the display textbox to `readonly` to allow selection only from the search dialog
- Place a magnifying glass icon (`fa-magnifying-glass`) inside `imds-textbox-control` to indicate searchability
- Use `is-horizontal imds-w-15` to place the label and field side by side with a uniform label width

## Full Code

```html
<imart type="head">
  <!-- Tag for calling IM-Common Master search screen -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // User name click event
    document.getElementById(':userName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : "jp.co.intra_mart.master.app.search.tabs.user.list_user",
          title: "Keyword"
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.user.list_user' : ['user_cd', 'user_name']
        },
        callback_function           : 'callbackFromImMaster',
        basic_area                  : 'jp.co.intra_mart.master.app.search.headers.readonly',
        wnd_title                   : "User Search",
        message                     : "User Search",
        wnd_close                   : true,
        type                        : 'single',
        deleted_data                : false,
        target_locale               : 'ja',
        additional_disp             : true,
        additional_user_search_name : true,
        additional_dept             : true
      };

      // Open the search screen
      imACMSearch.open(parameter);
    });

    // Callback function
    function callbackFromImMaster(result) {
      const userCode = result[0].data.user_cd;
      const userName = result[0].data.user_name;
      document.getElementById(':userCode:').value = userCode;
      document.getElementById(':userName:').value = userName;
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
        <h1>User Search</h1>
      </div>
    </header>
    <main>
      <form class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <div class="imds-field-container has-accent-color">
            <div class="imds-field is-horizontal imds-w-15 sample-user">
              <div class="imds-field-label"><label for=":userName:">User Name</label></div>
              <div class="imds-field-control">
                <div class="imds-textbox-control">
                  <input type="hidden" id=":userCode:" value="">
                  <input type="text" id=":userName:" placeholder="Select user name" class="imds-textbox" readonly value="">
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
- Set the display field to `readonly` to allow selection only from the search dialog
- `:userCode:` and `:userName:` are placeholders; replace them with unique IDs during implementation
- Classes prefixed with `sample-` are custom classes for layout adjustment and are not standard imds theme classes
- For multi-selection mode (`type: 'multiple'`), process `result` with a `for` loop inside the callback
- In multi-selection mode, store the callback `result` in a variable and pass it as the `default_selected` parameter when reopening the dialog to restore previously selected items. The implementation pattern is as follows:
  - Declare a holding variable: `let selectedUser = [];`
  - Save in the callback: `selectedUser = result;`
  - Pass when launching the dialog: `default_selected: selectedUser`
