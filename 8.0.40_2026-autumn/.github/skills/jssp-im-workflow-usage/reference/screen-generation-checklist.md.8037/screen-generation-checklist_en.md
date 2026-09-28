# IM-Workflow Screen Generation Self-Checklist

After completing the generation of screen programs (.html / .js), perform self-verification using the following checklist.

**Note:** Items automatically detected by `validate-workflow-code.js` (incorrect imds class names, invalid pageType values, missing DbParameter type conversion, imart tag attributes, imuiCalendar hidden field misuse, missing imuiCalendar value setter override) are not included in this checklist. Only items that cannot be detected by the script are listed.

## Common (All Screens)

- [ ] File placement is under `src/main/jssp/src/{feature-name}/workflow/{subdirectory}/`
- [ ] Fixed value attributes of `<imart>` tags such as `type`, `escapeXml`, `escapeJs` are enclosed in double quotes
- [ ] `<imart>` tags do not use the `filter` attribute (the `filter` attribute does not exist; to display individual values in JSON such as user names and department names in HTML, place `<span id="..."></span>` and set them with `element.textContent = result.xxx` in JavaScript's `initializeView`)
- [ ] Entry point performs `$data.error.code` check
- [ ] Button events are registered with `addEventListener`, not `onclick` attribute
- [ ] When using IM-Common Master API (`IMMUserManager` / `IMMCompanyManager`), null check of `locales` + locale fallback (`locales[locale] || locales[tenantLocale] || locales[Object.keys(locales)[0]]`) is implemented
- [ ] When displaying server-retrieved values (user names, department names, etc.) in HTML, they are set with `textContent` inside JavaScript's `initializeView`, not with `<imart>` tags

### Icon Buttons

- [ ] For buttons combining icons and text, the text is enclosed in `<span class="imds-button-text">` (direct text nodes not allowed)
- [ ] Icon-only buttons (no text, e.g., delete trash icon) use normal size (do not use `is-small` / `is-x-small`)

## Application Screen (with input form)

### Validation Structure

- [ ] Validation function group conforming to `.github/instructions/jssp-presentation-page.instructions.md` (`clearValidationError`, `showValidationError`, `createRequest`, `getValidationErrors`, `resetValidationError`, `validateCurrentStep`) is defined in this order
- [ ] Real-time re-validation using `activeValidation` flag is implemented (text input uses `input` event, select/date uses `change` event)

### When Using imuiCalendar

- [ ] `floatable="true"` is specified (without it, inline display occurs and the standard UI of textbox + calendar icon is not shown)
- [ ] `altField` references a display textbox (`<input type="text">`) (must not specify a hidden input)
- [ ] HTML placement order is "display textbox → `<imart type="imuiCalendar">`" (reversing it causes the calendar icon to appear to the left of the textbox)
- [ ] `Object.defineProperty` is applied to the textbox referenced by `altField`, and a `change` event is dispatched in the value setter
- [ ] Date change event listener is registered on the textbox referenced by `altField`

### When Using IM-Common Master Search (imACMSearch)

- [ ] Re-validation function is exposed as `window._resetValidationError`
- [ ] `window._resetValidationError()` is called after setting values in the callback function

### HTML Structure

- [ ] Validation target `imds-field` tags have `for=":fieldName:"` attribute
- [ ] `<span class="imds-error-text" for=":fieldName:" style="display:none;"></span>` is placed under validation target `imds-field`
- [ ] `maxlength` attribute is not used (character count limits are communicated via validation error messages)
- [ ] Labels for **always required** fields have `imds-required-label-required` class + `data-required-label="Required"` added statically
  - When you need an `id` for accessibility (target of `aria-labelledby`), use the **`:fieldName:-label`** form (colon-wrapped). **No** `toggleRequiredMark()` call is required.
- [ ] Labels for **conditionally required** fields (where required/optional toggles based on specific input values) do NOT have `imds-required-label-required` added statically; instead, they are dynamically controlled using the following pattern:
  - Add `id="fieldName-label"` to the label span (**no colons**; no class)
  - Define a `toggleRequiredMark(id, condition)` function and call it at the same timing as the display control
  - Example: `toggleRequiredMark('period-end-label', periodType === 'temporary')`
  - For the full naming convention, see "Naming Convention for the `id` Attribute" in `.github/instructions/jssp-presentation-page.instructions.md`

### Input Field Width Control

- [ ] imuiCalendar textbox has `style="max-width: 10em;"` specified
- [ ] Select boxes have `max-width` specified with an appropriate width according to the number of characters in the options
- [ ] Dimensions (`max-width` / `min-width` / `width` / `height`, etc.) are specified via **inline `style="...: ...em;"`** (no custom `.max-width-NNem` / `.min-width-NNem` classes defined in the `<style>` block; they share specificity with imds defaults and end up requiring `!important`)

### Preventing Duplicate name Attributes

- [ ] Input fields (`select`, `input[type=text]`, `textarea`, etc.) inside the `workflowOpenPage` form do not have `name` attributes (if `name` duplicates with a hidden field, `userParam` becomes an array and causes an error in the action process)
- [ ] Radio button group `name` is different from the hidden field `name` (e.g., input use `name="urgencyTypeInput"` / hidden `name="urgencyType"`)
- [ ] Value passing is done by JS copying values to hidden fields when the apply button is pressed

### Matter Name, Re-application, and Buttons

- [ ] `<input type="hidden" id="imwMatterName" name="imwMatterName" value="" />` is placed inside the `workflowOpenPage` form
- [ ] The matter name is set in `imwMatterName` when the apply button is pressed, following the matter name rule of the flow definition
- [ ] pageType is switched based on the presence of `imwSystemMatterId` (empty=`'0'` new application, present=`'3'` re-application)
- [ ] Apply button label is changed to "Re-apply" in re-application mode
- [ ] `validateCurrentStep()` is called in the apply button, and `return` is executed when `false`

### Temporary Save

- [ ] When using temporary save (`workflowOpenPage('1')`) with the **workflowOpenPage approach**, the userDataId is **numbered on the application side** in `init`, e.g. `$imwUserDataId = request['imwUserDataId'] || Identifier.get();` (the user data ID is the key for the temporary save information, so numbering on the user content side is mandatory; without it, the key becomes empty on a new temporary save and the input is not restored on re-display)
- [ ] With the process-modal approach (`showTemporarySave`), numbering is performed automatically internally, so the explicit numbering above is unnecessary (pass the userDataId from the request as-is)

## Action Process (.js)

- [ ] All function signatures have **2 arguments** `(parameter, userParam)` (`parameter.userParameter` does not exist; form values are passed as the second argument `userParam`)
- [ ] Key names in the parameter object passed to `executeByTemplate` **exactly match** the bind variable names in the SQL template (`/*xxx*/`) (if SQL is snake_case `user_data_id`, JS side must also be `user_data_id`; camelCase `userDataId` must not be used)
- [ ] Matter number is generated via `WorkflowNumberingManager.getNumber()` in the `apply` function and set in `result.data` (default numbering is performed even if no format is specified in the specification)
- [ ] Matter number is not generated in the `reapply` function (matter number already exists at re-application)
- [ ] Correct methods of `UserActvMatterPropertyValue` are used for matter property operations (`createMatterProperty(Array)` / `updateMatterProperty(Array)` / `getMatterProperty(String, String)`; `setMatterProperty` does not exist)
- [ ] Matter property arguments are an **array** of objects (`[{ userDataId, key, value }]`)
- [ ] Method names and argument types have been confirmed in d.ts
- [ ] When INSERTing data in the `apply` function, existing data is checked (data already exists when `applyFromUnapply` is called after pull-back)

## Approval Screen (read-only)

- [ ] All fields are displayed with `<span>` elements (no input fields)
- [ ] Select box values are converted to labels for display
- [ ] There is **exactly one** processing button, calling `workflowOpenPage('4')` (do not use individual buttons for approval/send-back/denial/hold; the processing type is selected via the IM-Workflow standard dialog)
- [ ] No comment input field is placed on the screen (comments are entered in the IM-Workflow standard dialog)

## Detail Screen (read-only)

- [ ] All fields are displayed with `<span>` elements
- [ ] **"Back" button does not exist** (`imw-back-button` / `imw-back-form` / `workflowOpenPage` tag are all omitted)
- [ ] Processing button does not exist
- [ ] Matter property retrieval handles all 3 patterns: active, completed, and archive matters
  - If `imwArchiveMonth` exists → Use `UserArcMatterPropertyValue(archiveMonth)`
  - If `imwArchiveMonth` is empty and active API has data → Use `UserActvMatterPropertyValue`
  - If `imwArchiveMonth` is empty and active API data is empty → Fall back to `UserCplMatterPropertyValue`
  - Implementing with `UserActvMatterPropertyValue` alone will result in details not being displayed when opening completed or archive matters
