# Naming Conventions

> **Application Scope**: 🟢 **Always** — Applies to all file, function, and variable naming.

## Naming Convention Summary

| Target | Convention | Example |
|--------|------------|---------|
| File names | snake_case | `user_master.js` |
| Function names | camelCase | `getUserInfo`, `validateInput` |
| Variable names | camelCase | `userId`, `itemList` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| Bound variables | `$` + camelCase | `$data`, `$formData`, `$pageInfo` |

## Function Names

### Naming Patterns

| Prefix | Usage | Example |
|--------|-------|---------|
| `get` | Data retrieval | `getUserInfo`, `getItemList` |
| `set` | Data setting | `setUserStatus`, `setDefaultValue` |
| `is` / `has` | Returns boolean | `isValid`, `hasPermission` |
| `validate` | Validation processing | `validateInput`, `validateUserData` |
| `create` | New creation | `createUser`, `createOrder` |
| `update` | Update processing | `updateUser`, `updateStatus` |
| `delete` | Delete processing | `deleteUser`, `deleteItem` |
| `search` | Search processing | `searchUsers`, `searchItems` |
| `convert` | Conversion processing | `convertToJson`, `convertDateFormat` |
| `format` | Formatting processing | `formatDate`, `formatNumber` |

## Variable Names

Good examples:
```javascript
let userId = 'user001'; // Clear meaning
let userList = []; // Plural form to represent a list
let isActive = true; // Boolean with is/has prefix
let maxRetryCount = 3; // Meaningful name
let startDate = new Date(); // Clearly a date
```

Bad examples:
```javascript
let a = 'user001'; // Unclear meaning
let data = []; // Unclear what data
let flag = true; // Unclear what flag
let tmp = getUser(); // Abuse of temporary variable
let list1 = []; // Avoid sequential numbering
```

## Constants

```javascript
// Define at the top of the file
let MAX_RETRY_COUNT = 3;
let DEFAULT_TIMEOUT = 30000;
let STATUS_ACTIVE = 'active';
let STATUS_INACTIVE = 'inactive';
let ERROR_CODE_NOT_FOUND = 'E001';
let ERROR_CODE_INVALID_INPUT = 'E002';
```

## Bound Variables

Add the `$` prefix to variables passed to the presentation page.

### Defining Bound Variables (Function Container)

```javascript
// Bound variables (for presentation page linking)
let $title = 'Screen Title';        // Name of the screen itself
let $subTitle = 'Subtitle';         // Sub-name of the screen (name of the category the screen belongs to)
let $data = '{}';

function init(request) {
  let response = {
    result: {
      userCode: '',
      userFirstName: '',
      userLastName: '',
      age: '',
    },
    error: {
      code: '',
      message: '',
    },
  };
  // If </script> is included in the JSON, the script will be terminated,
  // so replace all '/' with '\/' in the response
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}
```

### Using Bound Variables (Presentation Page)

```html
<!-- Title display -->
<title>
  <imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> -
  <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart>
</title>

<script>
(function($data) {
  document.addEventListener('DOMContentLoaded', () => {
    // Define functions inside DOMContentLoaded to prevent direct external execution

    function initializeView(result) {
      // TODO: Add screen initialization processing here
    }

    // Error check
    if ($data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
    } else {
      initializeView($data.result);
    }
  });
// For bound variables only, do not write value="$data" but write value=$data without quotes
// For non-bound variables, do not write type='string' but always use double quotes: type="string"
// This is due to the unique specification of the imart tag
})(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
</script>
```

### Distinguishing Bound Variables from Regular Variables

```javascript
// Bound variables (passed to the presentation page)
let $title = 'Screen Title';        // Name of the screen itself
let $subTitle = 'Subtitle';         // Sub-name of the screen (name of the category the screen belongs to)
let $data = '{}';

// Local variables (used within functions)
let tempList = []; // No prefix
let processedData = {};
```

## Prohibition of Abbreviations

Variable names, function names, and parameter names should **in principle be written in full without abbreviations**.
Abbreviations can lead to misinterpretation and increased cognitive load during code reviews, so clarity is prioritized over brevity.

### Examples of Prohibited Abbreviations

| NG: Abbreviated | OK: Full Spelling |
|----------------|------------------|
| `btn` | `button` |
| `msg` | `message` |
| `err` / `e` (except catch argument) | `error` |
| `req` | `request` |
| `res` | `response` |
| `el` / `elem` | `element` |
| `idx` | `index` |
| `cnt` | `count` |
| `num` | `number` |
| `str` | `string` |
| `val` | `value` |
| `param` | `parameter` (plural: `parameters`) |
| `prop` | `property` |
| `arr` | `array` |
| `obj` | `object` |
| `func` / `fn` | `function` |
| `ctx` | `context` |
| `cfg` / `conf` | `config` / `configuration` |
| `tmp` | `temporary` or a name indicating the purpose |
| `dlg` | `dialog` |
| `ok` | (if a button, `okButton` etc., supplement meaning from context) |

### Permitted Exceptions

The following abbreviations are acceptable.

- **Widely established abbreviations**: `id`, `url`, `uri`, `html`, `css`, `json`, `xml`, `api`, `ui`, `db`, `i18n`, `a11y`
- **Loop counters `i` / `j` / `k`**: Index variables in short loops
- **`catch (e)`**: `e` as the argument name for exception objects
- **Official business abbreviations**: Abbreviations standardized in the business domain, such as `vat` (value-added tax)

### Good and Bad Examples

```javascript
// Bad examples:
const okBtn = dialog.querySelector('.ok');
const cancelBtn = dialog.querySelector('.cancel');
const msg = req.getParameter('msg');
const errMsg = e.message;
const userArr = [];

// Good examples:
const okButton = dialog.querySelector('.ok');
const cancelButton = dialog.querySelector('.cancel');
const message = request.getParameter('message');
const errorMessage = e.message;
const userList = [];
```

## Avoiding Conflicts with Reserved Words

Avoid using the following names:
- JavaScript reserved words: `class`, `function`, `return`, `var`, `if`, `else`, etc.
- intra-mart reserved words: `request`, `response`, `session`, `Contexts`, etc.
- Global objects: `Debug`, `Logger`, `Database`, etc.
