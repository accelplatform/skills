# IMART workflowOpenPage Tag Reference

## Overview

`<imart type="workflowOpenPage">` is a tag that generates an HTML form tag for displaying screens that execute workflow processing.
It supports application, temporary save, re-application, processing, and confirmation screens.

Used in conjunction with the `<imart type="workflowOpenPageCsjs" />` tag, calling the client-side JavaScript function `workflowOpenPage(pageType, callback)` to display the screen.

## Screen Types (pageType)

| Value | Description |
|------|------|
| `"0"` | Application screen |
| `"1"` | Temporary save screen |
| `"2"` | Application (draft matter) screen |
| `"3"` | Re-application screen |
| `"4"` | Processing screen |
| `"5"` | Confirmation screen |

## Attribute List

### Required Attributes

| Attribute | Type | Description |
|------|------|------|
| imwApplyBaseDate | String | Application base date (`yyyy/MM/dd` format). Required for application and temporary save screens |
| imwFlowId | String | Flow ID. Required for application and temporary save screens |
| imwSystemMatterId | String | System matter ID. Required for draft matter, re-application, processing, and confirmation screens |
| method | String | FORM tag method attribute |

### Optional Attributes

| Attribute | Type | Default | Description |
|------|------|-----------|------|
| imwAuthUserCode | String | - | Authority user code (proxy source user code) |
| imwUserDataId | String | - | User data ID. Required for temporary save screen |
| imwNodeId | String | - | Node ID |
| imwCallOriginalParams | String | - | Caller parameters. Used as request parameters when "Back" button or transition after processing completion |
| imwNextScriptPath | String | - | Destination script path (for script development model) |
| imwNextApplicationId | String | - | Destination application ID (for JavaEE development model) |
| imwNextServiceId | String | - | Destination service ID (for JavaEE development model) |
| imwNextPagePath | String | - | Destination page path (for JSP/Servlet) |
| name | String | - | FORM tag name attribute |
| target | String | `_top` | FORM tag target attribute |
| useContextPath | String | `"true"` | Whether to include context path in URL generation |

### Required Attributes by Screen Type

| Attribute | Apply(0) | TempSave(1) | Draft(2) | ReApply(3) | Process(4) | Confirm(5) |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| imwApplyBaseDate | O | O | - | - | - | - |
| imwFlowId | O | O | - | - | - | - |
| imwSystemMatterId | - | - | O | O | O | O |
| imwUserDataId | - | O | - | - | - | - |

## Destination Parameters

Specify one of the following 3 patterns for the destination. If none are specified, the screen closes and ends after processing is complete.

| Development Model | Attribute to Use |
|-----------|-------------|
| Script development | `imwNextScriptPath` |
| JavaEE development | `imwNextApplicationId` + `imwNextServiceId` |
| JSP/Servlet | `imwNextPagePath` |

## Usage Examples

### Presentation Page

```html
<imart type="head">
  <!-- CSJS for workflow screen transition -->
  <imart type="workflowOpenPageCsjs" />
</imart>

<!-- Form for workflow screen call -->
<imart type="workflowOpenPage"
    name="workflowOpenPageForm"
    method="POST"
    target="_top"
    imwAuthUserCode=imwAuthUserCode
    imwSystemMatterId=imwSystemMatterId
    imwUserDataId=imwUserDataId
    imwNodeId=imwNodeId
    imwApplyBaseDate=imwApplyBaseDate
    imwFlowId=imwFlowId
    imwCallOriginalParams=imwCallOriginalParams
    imwNextScriptPath=imwNextScriptPath
    imwNextApplicationId=imwNextApplicationId
    imwNextServiceId=imwNextServiceId
    imwNextPagePath=imwNextPagePath>

  <!-- User data -->
  <input type="hidden" name="user_data_1" value="foo">
  <input type="hidden" name="user_data_2" value="bar">

  <!-- Processing buttons -->
  <input type="button" value="Apply" onclick="workflowOpenPage('0')" />
  <input type="button" value="Process" onclick="workflowOpenPage('4')" />
  <input type="button" value="Confirm" onclick="workflowOpenPage('5')" />
</imart>
```

### JavaScript Function Calls

```javascript
// Display application screen
workflowOpenPage('0');

// Display processing screen (with callback)
workflowOpenPage('4', 'onWorkflowClose');

// Callback function (called when the processing screen is closed)
function onWorkflowClose() {
  // Processing after screen closes
  location.reload();
}
```

## Notes

- Place the `<imart type="workflowOpenPageCsjs" />` tag within `<head>` (required for loading CSJS functions)
- The `callback` argument is optional. If the specified function does not exist, it will not be executed
- When `useContextPath="true"`, the URL is output in `/imart/aaa/bbb` format; when `"false"`, in `aaa/bbb` format
- When using `imwNextPagePath` / `imwNextApplicationId` + `imwNextServiceId`, registration with SafeUrlManager is required
