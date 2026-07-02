# Required Verification Steps After Generation

After code generation is complete, automatically execute the following verification **before reporting to the user**.
Each step should be mechanically confirmed using the Grep tool or similar on the generated files.

## 1. SQL File Verification

### 1-1. Bind Placeholder Syntax

Confirm that the generated `.sql` files do not contain `/*$`.

- `/*param*/'dummy'` — Bind placeholder (PreparedStatement method). **Use this one**
- `/*$param*/dummy` — Direct embedding. **Only permitted** for places where bind variables cannot be used, such as ORDER BY column names (whitelist validation required)

**Verification method:** Grep the generated SQL files for `/*$` to confirm there are no unintended direct embeddings.

### 1-2. Correct Use of `/*BEGIN*/` Blocks

`/*BEGIN*/` should only be used when **all conditions** in the WHERE clause are enclosed in `/*IF*/~/*END*/`.
`/*BEGIN*/` must not be used when there are fixed conditions (such as `status = '1'` that are always evaluated).

```sql
-- NG: There is a fixed condition (r.status = '1') inside /*BEGIN*/ → SQL syntax error
WHERE
  /*BEGIN*/
  r.status = '1'
  /*IF roomId != null*/
  AND r.room_id = /*roomId*/'dummy'
  /*END*/
  /*END*/

-- OK: Place fixed conditions outside /*BEGIN*/ and write WHERE directly
WHERE
  r.status = '1'
  /*IF roomId != null*/
  AND r.room_id = /*roomId*/'dummy'
  /*END*/

-- OK: /*BEGIN*/ can be used when all conditions are enclosed in /*IF*/
/*BEGIN*/
WHERE
  /*IF userId != null*/
  user_id = /*userId*/'dummy'
  /*END*/
/*END*/
```

**Verification method:** Grep `/*BEGIN*/` in the generated `.sql` files and confirm there are no SQL condition lines directly below it that are not enclosed in `/*IF*/` (`validate-jssp-code.js` `JSSP-SQL-001` automatically detects this).

### 1-3. Dummy Value Syntax

Confirm that the dummy values for bind placeholders are syntactically correct SQL.

- String column: `/*param*/''` (enclosed in single quotes)
- Numeric column: `/*param*/0`

## 2. tsc Type Check

Execute TypeScript compiler type checking on the generated `.js` files.
Using the type information from APIs defined in `d.ts/`, **access to non-existent properties and type mismatches** can be statically detected.
Class mismatches that `validate-jssp-code.js` cannot detect (e.g., `result.data === 0` → correct is `result.countRow`) can also be caught here.

```bash
# Execute by functional unit (example: entire room function)
npm run check:types:room

# When targeting an arbitrary path
bash .agents/skills/jssp-page-generator/scripts/check-types.sh src/main/jssp/src/{function-name}/
```

**Fix until 0 issues.**

Suppressed errors (false positives): `TS2304` (classes undefined in d.ts), `TS2451/TS6200` (bind variable redeclarations), property errors on `type 'unknown'/'any'`.
All other errors are likely real bugs and must be fixed.

**Commonly detected patterns:**

| Error Example | Cause | Fix |
|---|---|---|
| No overlap between `data` and `number` (TS2367) | The `data` of `executeByTemplate` return value is an array, so it cannot be compared with `=== 0` | Change to `countRow === 0` |
| Property `xxx` does not exist on type `YYY` (TS2339) | Calling a method/property that doesn't exist in d.ts based on guesswork | Check d.ts and fix to the correct name |

## 3. Function Container Verification (DB Access)

### 2-1. DbParameter Wrapping

Confirm that parameters for **all DB access methods** are wrapped with `DbParameter.xxx()`.

| Method | Parameter Format | Example |
|---|---|---|
| `db.select(sql, params)` / `db.execute(sql, params)` | `DbParameter[]` (**array**) | `[DbParameter.string(userCd), DbParameter.string(fiscalYear)]` |
| `db.executeByTemplate(path, params)` / `db.fetchByTemplate(path, params)` | `{ key: DbParameter }` (**object**) | `{ userId: DbParameter.string(userId) }` |

**Verification method:** Search for calls to `db.select` / `db.execute` / `executeByTemplate` / `fetchByTemplate` in the generated `.js` files and confirm that all parameter values start with `DbParameter.string()`, `DbParameter.number()`, etc.
Passing raw strings or numbers directly will cause `ClassCastException`.

### 2-2. DbParameter Type Selection

Confirm that the column type in DDL matches the type method of `DbParameter`.

| DDL Column Type | DbParameter Method |
|---|---|
| `VARCHAR` / `CHAR` / `TEXT` | `DbParameter.string()` |
| `INTEGER` / `BIGINT` | `DbParameter.number()` |
| `DECIMAL` / `NUMERIC` | `DbParameter.number()` |
| `DATE` | `DbParameter.date()` |
| `TIMESTAMP` | `DbParameter.timestamp()` |

**Special attention:**
- Even if the value is numeric only, use `DbParameter.string()` if the DDL is `VARCHAR` (e.g., fiscal year `VARCHAR(4)`)
- The argument of `DbParameter.number()` **must be a Number type**. Since `userParam` (values passed from the screen form) are all string types, always convert with `Number()` before passing (e.g., `DbParameter.number(Number(userParam.quantity))`). Not converting will cause `IllegalArgumentException`

## 3. Function Container Verification (API Calls)

### 3-1. Cross-referencing with d.ts

For global classes and APIs used in the generated `.js` files, confirm the following in d.ts.

- **static vs instance**: Is there confusion between `new Xxx().method()` and `Xxx.method()`?
- **Method name**: Is the method name one that exists in d.ts (not written based on guesswork)?
- **Argument types and count**: Do they match the argument definitions in d.ts?

**Verification method:** Grep for `new ` in the generated `.js` files and confirm that instantiation of each class matches the definition in d.ts.
Pay particular attention to utility classes like `DateTimeFormatter` and `Format`, which often have many static methods.

**Classes that require special attention (APIs that are often erroneous in practice):**

| Class | NG Pattern | Correct Usage |
|---|---|---|
| `Identifier` | `new Identifier().getString()` | `Identifier.get()` (static method) |

### 3-2. Rhino Date String Parsing Restrictions

In Rhino, parsing `new Date('YYYY-MM-DD HH:mm:ss')` or `new Date('YYYY-MM-DDTHH:mm:ss')` is unstable and may result in `Invalid Date`.
`getMinutes()` etc. will return `NaN`, causing all subsequent comparison operations to malfunction.

**Verification method:** Grep for `new Date(` in the generated `.js` files. If the argument is a variable (string type request parameter or DB value), replace with the following `parseLocalDateTime` helper.

```javascript
// NG: May result in Invalid Date in Rhino
let startDate = new Date(startAt);                   // 'YYYY-MM-DD HH:mm:ss' format
let startDate = new Date(startAt.replace(' ', 'T')); // 'YYYY-MM-DDTHH:mm:ss' format is also NG

// OK: Multi-argument constructor always works reliably as local datetime
function parseLocalDateTime(str) {
  let parts = str.split(/[-: ]/);
  return new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10),
    parseInt(parts[3], 10),
    parseInt(parts[4], 10),
    parseInt(parts[5], 10)
  );
}
let startDate = parseLocalDateTime(startAt);
```

Define the `parseLocalDateTime` helper in all `.js` files that handle datetime strings in `"YYYY-MM-DD HH:mm:ss"` format, and use it instead of `new Date(variable)`.

### 3-3. DB Timestamp Normalization

When returning TIMESTAMP column values in JSON responses or form fields, the return type differs depending on the JDBC driver (string `"2026-04-21 10:00:00.0"` / Date object / ISO string, etc.), so always normalize with the following `formatTimestamp` helper.

Since `String(dateObject)` returns things like `"Tue Apr 21 2026 10:00:00 GMT+0900"`, Date objects must not be directly converted to strings.

```javascript
function formatTimestamp(value) {
  if (value instanceof Date) {
    let year    = value.getFullYear();
    let month   = ('0' + (value.getMonth() + 1)).slice(-2);
    let day     = ('0' + value.getDate()).slice(-2);
    let hours   = ('0' + value.getHours()).slice(-2);
    let minutes = ('0' + value.getMinutes()).slice(-2);
    let seconds = ('0' + value.getSeconds()).slice(-2);
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
  }
  let str = String(value).replace('T', ' ');
  if (str.length > 19) {
    str = str.substring(0, 19);
  }
  return str;
}

// Usage example
startAt: formatTimestamp(row.start_at),
endAt:   formatTimestamp(row.end_at),
```

**Verification method:** Grep for places in the generated `.js` files where TIMESTAMP columns (`_at`, `_date`, `start`, `end`, etc.) are included in JSON and confirm they are wrapped with `formatTimestamp()`.

### 3-4. Use `load()` for Loading Common Modules (`include()` is Misuse)

When using constants and functions defined in other files (under `common/`, etc.) from other `.js` files, **always use `load(path)`**. Using `include(path)` will execute the called script in **an isolated scope**, so variables and functions declared there cannot be referenced from the caller at all, resulting in `ReferenceError: "XXX" is not defined` at runtime.

| Function | Behavior | Purpose |
|---|---|---|
| `load('xxx/common/yyy')` | Brings variables and functions from the called file into the caller's scope | **Loading common modules** |
| `include('xxx/view/zzz')` | Executes the called file in an isolated scope and calls its `init()` | Page transition/screen forwarding |

```javascript
// OK: Load common modules with load()
load('room/common/rm_constants');
load('room/common/rm_datetime');

function init(request) {
  // Can reference top-level variables from rm_constants.js
  let errorCode = RM_ERROR_SYSTEM;
}

// NG: With include(), the variables and functions of the called file are not visible
include('room/common/rm_constants');  // RM_ERROR_SYSTEM remains undefined
```

Top-level constants in common modules **may be declared with `let`**. Since `load()` brings the functions and variables of the called file into the caller's scope, they can be referenced even with `let` (with `include()`, the scope is separated, making them inaccessible). The solution is to **use `load()`**, not to change the declaration keyword to `var`.

```javascript
// rm_constants.js (common module)
let RM_ERROR_SYSTEM = 'ROOM-E999';   // OK: Can be referenced from load() destination

// Calling side (view / api / job)
load('room/common/rm_constants');
// RM_ERROR_SYSTEM can be referenced from here on
```

**Verification method:** `validate-jssp-code.js` `JSSP-JS-024` automatically detects the `include('**/common/**')` pattern.

#### Do Not Include `.js` Extension in `load()` Arguments

`load()` **automatically appends `.js`** to the end of the path argument internally. Therefore, writing `load('/room/common/foo.js')` will try to resolve `/room/common/foo.js.js` and result in `FileNotFoundException: Function-Container not found: ..._foo_95_js_46_js </room/common/foo.js.js>`.

```javascript
// NG: Explicitly specifying extension → FileNotFoundException at runtime
load('/room/common/datetime_util.js');

// OK: No extension
load('/room/common/datetime_util');
```

- The path passed to `executeByTemplate` / `fetchByTemplate` in 2WaySQL follows the same rule of not including `.sql` (see `jssp-2way-sql.md`). Remember that **not including extensions is the principle** for intra-mart external resource reference path specifications
- Unify with absolute paths from the function folder root (with leading slash): `load('/room/common/xxx')`

**Verification method:** `validate-jssp-code.js` `JSSP-JS-025` automatically detects the `load('...*.js')` pattern.

### 3-7. Transaction.begin Return Value Check (Required)

`Transaction.begin(callback)` **does not re-throw exceptions and returns a `DatabaseResult`**.
Exceptions `throw`n inside the callback trigger automatic rollback, but do not propagate to the caller,
so ignoring the return value means failures go undetected, resulting in "HTTP 200 success but nothing was inserted into the DB".

#### Required Pattern

Receive the return value in a variable and determine failure with `isSuccess()`. Capture business exceptions inside the callback and re-throw, then rethrow outside the transaction.

```javascript
function executeCreate(data) {
  let reservationId = Identifier.get();
  let now = new Date();
  let businessError = null;

  let txResult = Transaction.begin(function() {
    try {
      let db = new TenantDatabase();
      ensureNoOverlap(db, data.roomId, data.startAt, data.endAt, null);
      insertReservation(db, reservationId, data, now);
    } catch (e) {
      businessError = e;   // Carry business exception to the outside
      throw e;             // Re-throw for rollback
    }
  });

  if (businessError) {
    throw businessError;                // Return business message to front
  }
  if (!txResult.isSuccess()) {
    throw new Error('DB error: ' + (txResult.errorMessage || ''));
  }

  return { reservationId: reservationId };
}
```

#### Anti-pattern

```javascript
// NG: Ignoring return value → Even on failure, no exception is raised, HTTP 200 is returned as success
Transaction.begin(function() {
  let db = new TenantDatabase();
  ensureNoOverlap(...);       // Even if throw happens here...
  insertReservation(...);
});
// Nothing is propagated to the caller
return { reservationId: reservationId };
```

**Verification method:** `validate-jssp-code.js` `JSSP-JS-026` automatically detects `Transaction.begin(...)` calls where the return value is not received.

### 3-8. Handling JDBC `java.sql.Timestamp` in Rhino

In the Rhino environment, TIMESTAMP columns (such as `row.xxx_at`) in results from `db.executeByTemplate` / `db.select` are returned as **`java.sql.Timestamp` objects**. This is a **Java class** and is different from JavaScript's `Date`.

#### Important Behavior

1. **`instanceof Date` returns false** — Cannot be used for JavaScript Date determination
2. **`String(timestamp)` is in `"2026-04-20 10:00:00.0"` format** — Milliseconds `.0` are appended at the end
3. JavaScript methods like `getFullYear()` / `getMonth()` / `getDate()` **do not exist**

#### Recommended Implementation

In utility functions that handle TIMESTAMP values, determine JavaScript Date with **`typeof value.getFullYear === 'function'`** instead of `instanceof Date`, and parse others via `String()` → regular expression.

```javascript
function parseLocalDateTime(value) {
  if (!value) return null;
  // Allow trailing ".N" (milliseconds)
  let pattern = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/;
  let matched = pattern.exec(value);
  if (!matched) return null;
  return new Date(
    parseInt(matched[1], 10),
    parseInt(matched[2], 10) - 1,
    parseInt(matched[3], 10),
    parseInt(matched[4], 10),
    parseInt(matched[5], 10),
    matched[6] ? parseInt(matched[6], 10) : 0,
    0
  );
}

function formatTimestamp(date) {
  if (!date) return '';
  let d = null;
  if (typeof date.getFullYear === 'function') {
    d = date;                               // JavaScript Date
  } else {
    d = parseLocalDateTime(String(date));   // java.sql.Timestamp → parse via string
  }
  if (!d) return '';
  // ... Build and return "YYYY-MM-DD HH:mm:ss"
}
```

**Anti-patterns (do not work in Rhino):**

```javascript
// NG: instanceof Date returns false for Java Timestamp
let d = (date instanceof Date) ? date : parseLocalDateTime(String(date));

// NG: parseLocalDateTime regex does not match strings with ".0"
let pattern = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;
```

**Verification method:** This problem is difficult to detect statically, so **always verify on the screen that actual data is being displayed** on the calendar and list screens. If `formatTimestamp()` returns an empty string to the front end, date matching on the calendar will fail and appear "empty".

### 3-9. PostgreSQL Type Strictness (Strict Type Selection for Bind Parameters)

PostgreSQL **does not perform implicit type conversion**, so the column type in DDL and the type of `DbParameter.xxx()` must match exactly. Since Oracle / SQLServer performs implicit conversion, this is often not noticed during development and only becomes apparent when moving to PostgreSQL.

#### Typical Error

```
ERROR: operator does not exist: timestamp without time zone >= character varying
  HINT: No operator matches the given name and argument types. You might need to add explicit type casts.
```

Cause: `DbParameter.string("2026-04-20 10:00:00")` was passed for a TIMESTAMP column, and the comparison operator `timestamp >= varchar` did not exist.

#### Required Correspondence Table

| DDL Column Type | Correct DbParameter | Common Mistake |
|---|---|---|
| `TIMESTAMP` | `DbParameter.timestamp(Date)` | `DbParameter.string("YYYY-MM-DD HH:mm:ss")` |
| `DATE` | `DbParameter.date(Date)` | `DbParameter.string("YYYY-MM-DD")` |
| `DECIMAL` / `NUMERIC` | `DbParameter.number(value)` | `DbParameter.string(String(value))` |
| `CHAR(1)` flag | `DbParameter.string('0' / '1')` | `DbParameter.boolean(bool)` |

#### Implementation Pattern

Datetime received as a string is converted to Date on the server side using `parseLocalDateTime()` before being passed to `DbParameter.timestamp()`.

```javascript
// OK: TIMESTAMP column → DbParameter.timestamp(Date)
let params = {
  rangeFrom: DbParameter.timestamp(parseLocalDateTime(request['rangeFrom'])),
  rangeTo:   DbParameter.timestamp(parseLocalDateTime(request['rangeTo']))
};

// NG: Type mismatch error in PostgreSQL
let params = {
  rangeFrom: DbParameter.string(request['rangeFrom']),
  rangeTo:   DbParameter.string(request['rangeTo'])
};
```

**Verification method:** `validate-jssp-code.js` `JSSP-JS-027` generates warnings for patterns like `DbParameter.string(startAt|endAt|rangeFrom|rangeTo|startDate|endDate|createdAt|updatedAt|...)` containing datetime-related variable names. Since this is heuristic detection based on variable names, it is also recommended to manually verify by cross-referencing with the DDL and SQL.

### 3-5. Prohibition on Referencing intra-mart Internal Tables

Confirm that the generated `.sql` files do not contain table names starting with `im` (such as `imm_`, `imw_`, `imr_`, `imjob_`, etc.).
Internal tables managed by intra-mart products are not public APIs and their schemas may change during version upgrades.
Only permitted when the user has explicitly instructed to reference these tables.

**Verification method:** Grep FROM / JOIN clauses in the generated SQL files for table names starting with `im`.

## 4. imACMSearch Integration Verification

If the screen uses `imACMSearch` to select and save users, confirm the following.

### 4-1. Username Resolution in Retrieval APIs

The `userId` selected with imACMSearch is saved to the DB, but `userName` does not exist in the DB (such as `reservation_participant`).
To display user names in participant tags etc. on the edit screen, the retrieval API side needs to call `IMMUserManager.getUser()` to resolve the user name and include `userName` in the response.

**Verification method:** For input items that use `imACMSearch` (participants, personnel, etc.) on the screen, confirm that both `userId` and `userName` are included in the return value of the corresponding retrieval API (GET type). If only `userId` is returned, add name resolution using `IMMUserManager.getUser()`.

```javascript
// NG: Only userId
participantList.push({ userId: participantResult.data[i].user_id });

// OK: Resolve user name with IMMUserManager and return
participantList.push({
  userId:   userId,
  userName: getUserName(userId, localeId, tenantLocale)
});

function getUserName(userId, localeId, tenantLocale) {
  let result = new IMMUserManager().getUser({ userCd: userId }, new Date());
  if (!result.error && result.data && result.data.locales) {
    let locales    = result.data.locales;
    let localeInfo = locales[localeId] || locales[tenantLocale] || locales[Object.keys(locales)[0]];
    if (localeInfo && localeInfo.userName) {
      return localeInfo.userName;
    }
  }
  return userId;
}
```

**Note on `getUser()` (singular) vs `getUsers()` (plural):**
- `IMMUserManager.getUsers()` is bulk retrieval, but depending on server environment and version, `data` may return an empty array or `error: true` (silent failure)
- When user names must be reliably resolved (e.g., participant lists), **call `getUser()` (singular) in a loop**
- Access with `result.data.locales[locale].userName` (the `displayName` property only exists on `UserListNodeInfo`, not on `UserInfo`. `JSSP-JS-019` automatically detects misuse)
- Always include null check for `locales` itself and locale fallback (see `jssp-function-container.md`)
- On retrieval failure, use `userId` as fallback (output `warn` log without swallowing the exception)

### 4-2. Screen-side Initialization Code

When initializing participant lists etc. from retrieval API responses, confirm that `userName` is being referenced.

```javascript
// NG: Fallback is fixed to userId
participants = list.map(function(p) { return { userId: p.userId, userName: p.userId }; });

// OK: Receive userName from API and use userId as fallback if absent
participants = list.map(function(p) { return { userId: p.userId, userName: p.userName || p.userId }; });
```

### 4-3. Bridge Between Global Callbacks and DOMContentLoaded Scope

imACMSearch callback functions need to be defined in the global scope, but functions defined inside `DOMContentLoaded` cannot be directly referenced from globals and will result in `ReferenceError`.
When calling functions inside `DOMContentLoaded` from a callback, use the bridge pattern of exposing them as `window._functionName`.

**Verification method:** On screens that use `imACMSearch`, confirm that global callback functions are not calling functions in the `DOMContentLoaded` scope directly without going through `window._`. `validate-jssp-code.js` `JSSP-HTML-017` automatically detects this.

```javascript
// NG: Global callback directly calls DOMContentLoaded scope function
function callbackUserSearch(result) {
  addSelectedUser(result[0].data.user_cd, result[0].data.user_name); // ReferenceError
}
window.callbackUserSearch = callbackUserSearch;

document.addEventListener('DOMContentLoaded', function() {
  function addSelectedUser(userId, userName) { /* ... */ }
  // ← Missing window._addSelectedUser bridge setup
});

// OK: Call through window._ bridge
function callbackUserSearch(result) {
  if (typeof window._addSelectedUser === 'function') {
    window._addSelectedUser(result[0].data.user_cd, result[0].data.user_name);
  }
}
window.callbackUserSearch = callbackUserSearch;

document.addEventListener('DOMContentLoaded', function() {
  function addSelectedUser(userId, userName) { /* ... */ }
  window._addSelectedUser = addSelectedUser; // ← Bridge setup
});
```

## 5. Screen (Presentation Page) Verification

### 5-1. Inline Definition of imdsConfirm

`imdsConfirm()` is not provided as a global function by the platform.
`.html` files that call `imdsConfirm(...)` must always include an inline definition of `function imdsConfirm(...)` within the page.

**Verification method:** Grep for `imdsConfirm(` in the generated `.html` files and confirm that `function imdsConfirm(` exists in the same file.
`validate-jssp-code.js` `JSSP-HTML-015` automatically detects this.

```javascript
// Include the following definition in each screen
function imdsConfirm(message, title, onOk, onCancel, options) {
  let modal = document.getElementById('confirmModal');
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmTitle').textContent   = title || 'Confirm';
  modal.style.display = 'flex';
  document.getElementById('confirmOk').onclick = function() {
    modal.style.display = 'none';
    if (typeof onOk === 'function') onOk();
  };
  document.getElementById('confirmCancel').onclick = function() {
    modal.style.display = 'none';
    if (typeof onCancel === 'function') onCancel();
  };
}
```

Also confirm that the confirmation modal HTML (a `<div>` with `id="confirmModal"`) referenced by `imdsConfirm` exists in the same file.

### 5-2. Implement Both Sending and Receiving Sides for Screen-to-Screen Parameter Passing

When implementing a link or button in screen A that passes URL parameters to screen B, **also implement the code on screen B side to receive and process those parameters in the same task**.
Implementing only the sending side and deferring the receiving side to another task creates a bug where nothing happens when the button is pressed (parameters are ignored).

**Rules:**
- If implementing a link with queries like `?roomId=xxx&startAt=yyy` in screen A, also implement in screen B's `DOMContentLoaded` (or `init()`) to read those parameters and perform processing such as pre-filling forms or opening dialogs
- If splitting the receiving side implementation to another task, always leave `// TODO: Implement code to receive roomId/startAt/endAt on screen B` in the sending side code

```javascript
// NG: Only URL with parameters set from screen A, receiving code not implemented on screen B
// calendar.html?roomId=R001&startAt=2026-05-01+09:00&endAt=2026-05-01+10:00
// → Dialog does not display even when calendar screen is opened (parameters are not read)

// OK: Implement screen A (room availability search) and screen B (calendar) in the same task
// Screen A side: Build URL and transition
const url = '/room/reservation/calendar?roomId=' + encodeURIComponent(roomId)
  + '&startAt=' + encodeURIComponent(startAt)
  + '&endAt='   + encodeURIComponent(endAt);
location.href = url;

// Screen B side: Receive parameters with DOMContentLoaded + setTimeout and open dialog
(function() {
  const params  = new URLSearchParams(location.search);
  const roomId  = params.get('roomId');
  const startAt = params.get('startAt');
  const endAt   = params.get('endAt');
  if (!roomId || !startAt || !endAt) { return; }
  // Open after all DOMContentLoaded handlers (room select initialization, etc.) complete
  setTimeout(function() {
    const startParts = startAt.split(' ');
    const endParts   = endAt.split(' ');
    openCreateDialog(
      startParts[0],
      startParts[1] ? startParts[1].substring(0, 5) : '09:00',
      { roomId: roomId, endDate: endParts[0], endTime: endParts[1] ? endParts[1].substring(0, 5) : '10:00' }
    );
  }, 0);
})();
```

**Verification method:** If the generated code contains screen transition code like `location.href = '...'` or `<a href="...?xxx=`, confirm that the destination `.html` file reads those query parameters with `URLSearchParams` / `request['xxx']`. If reading code does not exist, there is an implementation omission.

## 6. Screen Verification (IM-Workflow)

If IM-Workflow screens were generated, execute the following in order.

1. Run `validate-workflow-code.js` and confirm 0 errors
2. Execute all items in `.agents/skills/jssp-im-workflow-usage/reference/screen-generation-checklist.md`
