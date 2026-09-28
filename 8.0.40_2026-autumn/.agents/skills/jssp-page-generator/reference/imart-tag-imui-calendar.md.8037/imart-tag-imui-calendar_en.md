# IMART imuiCalendar Tag Reference

## Overview

`<imart type="imuiCalendar">` is a tag that provides a date selection calendar component.
It works with a text box, allowing users to select and enter dates from a calendar.

### Display Modes

| Mode | `floatable` | Behavior | Recommendation |
|------|------------|---------|----------------|
| **Floating mode** | `true` | Calendar is displayed when the text box is focused or the button is clicked | **Standard (always use this)** |
| Inline mode | `false` | Calendar is always displayed at the tag position | Only for special uses such as multi-day selection |

**Important: Always specify `floatable="true"` for date input forms.**
Omitting `floatable` results in inline display, and the standard UI of textbox + calendar icon will not appear.

## Attribute List

### Primary Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| floatable | Boolean | false | Display mode. `true` = floating, `false` = inline |
| altField | String | - | Selector of the text box element to link with |
| format | String | AccountContext input date format | Date format. `yyyy/MM/dd` etc. |
| id | String | Auto-generated | ID of the calendar element in inline mode |
| defaultDate | String/Date | Today on server | Initial display date |
| minDate | String/Number/Date | 1970/01/01 | Minimum selectable date |
| maxDate | String/Number/Date | 2999/12/31 | Maximum selectable date |

### Display Control Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| showOn | String | `both` | Calendar display trigger: `focus`, `button`, `both` |
| showButtonPanel | Boolean | false | Show button panel (Today / Close) |
| showAnim | String | `fadeIn` | Display animation: `show`, `slideDown`, `fadeIn`, `""` |
| buttonImage | String | `ui/images/calendar_btn.png` | Calendar button icon image path |
| buttonImageOnly | Boolean | true | Display only image (if false, display image inside button) |
| numberOfMonths | Number/Array | 1 | Number of months to display. Can specify `[rows, columns]` as array |
| changeMonth | Boolean | false | Allow month selection via dropdown |
| changeYear | Boolean | false | Allow year selection via dropdown |
| yearRange | String | `c-10:c+10` | Range of year dropdown. Relative: `c-10:c+10`, Absolute: `2010:2020` |
| firstDayOfWeek | Number | AccountContext value | First day of week. 0 (Sunday) to 6 (Saturday) |
| disabled | Boolean | false | Disable the calendar |

### Multi-day Selection Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| multiSelectable | Boolean | false | Multi-day selection mode (inline mode only) |
| validTerms | Array | undefined | Array of selectable periods. `[{start: "yyyy/MM/dd", end: "yyyy/MM/dd"}, ...]` |

### Event Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| onSelect | String(function) | Function name executed when a date is selected |
| onClose | String(function) | Function name executed when the calendar is closed |
| onChangeMonthYear | String(function) | Function name executed after year/month change |
| beforeShow | String(function) | Function name executed before displaying the calendar |
| beforeShowDay | String(function) | Function name executed before displaying each date cell |

### i18n Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| closeText | String | Text for the Close button |
| currentText | String | Text for the Today button |
| prevText | String | Tooltip for the previous month icon |
| nextText | String | Tooltip for the next month icon |
| appendText | String | Message displayed next to the text box |
| buttonText | String | Title for the calendar display button |
| dayNames | Array | Array of full day names (Sunday to Saturday) |
| dayNamesMin | Array | Array of shortest day names (for calendar header) |
| dayNamesShort | Array | Array of abbreviated day names |
| monthNames | Array | Array of full month names |
| monthNamesShort | Array | Array of abbreviated month names |

## Date Format

### Replacement Characters

| Character | Output | Example |
|-----------|--------|---------|
| `yyyy` | 4-digit year | 2012 |
| `yy` | Last 2 digits of year | 12 |
| `MM` | Zero-padded month | 08 |
| `M` | Month | 8 |
| `dd` | Zero-padded day | 09 |
| `d` | Day | 9 |
| `EEEE` | Full day name | Thursday |
| `E` | Abbreviated day name | Thu |

### Special Formats

| Pattern | Equivalent Format | Example |
|---------|-----------------|---------|
| `ISO_8601` | `yyyy-MM-dd` | 2012-08-09 |
| `ATOM` | `yyyy-MM-dd` | 2012-08-09 |

## Usage Examples

### Floating Mode (Basic)

```html
<input type="text" id=":registrationDate:" class="imds-textbox" style="max-width: 10em;" />
<imart type="imuiCalendar" floatable="true" altField="#\\:registrationDate\\:" format="yyyy/MM/dd" />
```

### Inline Mode

```html
<imart type="imuiCalendar" id="calendar" floatable="false" />
```

### Date Range Restriction

```html
<input type="text" id=":targetDate:" class="imds-textbox" />
<imart type="imuiCalendar" floatable="true" altField="#\\:targetDate\\:" format="yyyy/MM/dd" minDate="2010/01/01" maxDate="2025/12/31" />
```

### With Year/Month Dropdown

```html
<input type="text" id=":birthDate:" class="imds-textbox" />
<imart type="imuiCalendar" floatable="true" altField="#\\:birthDate\\:" format="yyyy/MM/dd" changeYear="true" changeMonth="true" yearRange="1950:2025" />
```

### Specifying Selectable Periods with Multi-selection (Function Container + HTML)

Function container:
```javascript
let validTerms = [
  { start: '2012/01/01', end: '2012/01/04' },
  { start: '2012/01/07', end: '2012/01/10' }
];
```

HTML:
```html
<imart type="imuiCalendar" validTerms=validTerms />
```

## CSJS Methods

In floating mode, use the text box of `altField` as the selector; in inline mode, use the ID of the calendar element.

| Method | Description | Syntax |
|--------|-------------|--------|
| `getDate` | Get selected date | `$(selector).imuiCalendar('getDate')` → `Date` |
| `setDate` | Set a date as selected | `$(selector).imuiCalendar('setDate', date)` |
| `getSelection` | Get multiple selected dates | `$(selector).imuiCalendar('getSelection')` → `Date[]` |
| `setSelection` | Set multiple dates as selected | `$(selector).imuiCalendar('setSelection', dates)` |
| `deleteSelection` | Deselect multiple dates | `$(selector).imuiCalendar('deleteSelection', dates)` |
| `show` | Show calendar | `$(selector).imuiCalendar('show')` |
| `hide` | Hide calendar | `$(selector).imuiCalendar('hide')` |
| `enable` | Enable calendar | `$(selector).imuiCalendar('enable')` |
| `disable` | Disable calendar | `$(selector).imuiCalendar('disable')` |
| `destroy` | Destroy calendar | `$(selector).imuiCalendar('destroy')` |
| `refresh` | Redraw calendar | `$(selector).imuiCalendar('refresh')` |
| `option` (get) | Get option value | `$(selector).imuiCalendar('option', name)` |
| `option` (set) | Set option value | `$(selector).imuiCalendar('option', name, value)` |

## Event Callbacks

### onSelect

```javascript
window.onDateSelect = function(dateText, inst) {
  // dateText: Formatted date string
  // inst: jQueryUI Widget instance
};
```

```html
<imart type="imuiCalendar" floatable="true" altField="#\\:date\\:" onSelect="onDateSelect" />
```

### onChangeMonthYear

```javascript
window.onMonthYearChange = function(year, month, inst) {
  // year: Year (Number), month: Month (Number), inst: jQueryObject
};
```

## Notes

- When specifying an ID in `:fieldName:` format for the `altField` selector, escaping is required (`#\\:fieldName\\:`)
- Only year (`y`), month (`M`), and day (`d`) can be used in `format`. Hours, minutes, and seconds are not supported
- `multiSelectable` only works in inline mode (`floatable="false"`)
- Calendar maintenance data is cached in the browser and not re-fetched for the same month
- Event attributes require specifying globally accessible (`window`) function names as strings
