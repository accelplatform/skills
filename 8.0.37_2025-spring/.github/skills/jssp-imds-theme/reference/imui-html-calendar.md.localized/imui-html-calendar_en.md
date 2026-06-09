---
paths:
  - "src/main/jssp/**/*.html"
---

# imuiCalendar

## Overview

imuiCalendar is a calendar component for date selection.
The floating display (a popup linked to a textbox) is the standard usage.

**Important: Always specify `floatable="true"` for date input.**
Inline display (`floatable="false"`) is limited to special use cases such as multi-date selection, and should not be used for regular form input.

- Source URL: https://api.intra-mart.jp/iap/apilist-jssp-tagdoc/doc/pc/imuiCalendar/index.html
- Tag type: imart tag (`<imart type="imuiCalendar" />`)

The calendar component is a component defined in the imui theme rather than imds, but it can also be used with imds.

## Attribute Reference

| Attribute | Type | Description | Default | Required/Optional |
|------|-----|------|-----------|----------------|
| floatable | Boolean | Display mode (true: floating / false: inline) | - | Required |
| altField | String | CSS selector of the linked textbox for floating mode | - | Required for floating |
| id | String | Calendar element ID for inline display | Auto-generated | Optional |
| format | String | Date format (e.g. `yyyy/MM/dd`) | AccountContext setting | Optional |
| defaultDate | String/Date | Initial display date | Server date | Optional |
| minDate | String/Date | Minimum selectable date | 1970/01/01 | Optional |
| maxDate | String/Date | Maximum selectable date | 2999/12/31 | Optional |
| calendarId | String | Calendar ID to use | Default calendar | Optional |
| changeMonth | Boolean | Show month selection dropdown | false | Optional |
| changeYear | Boolean | Show year selection dropdown | false | Optional |
| firstDayOfWeek | Number | First day of the week (0=Sun to 6=Sat) | Account setting | Optional |
| multiSelectable | Boolean | Multi-date selection (inline display only) | false | Optional |
| showButtonPanel | Boolean | Show button panel | false | Optional |

## Date Format

Only year, month, and day can be used in the format string (time components are not supported).

| Format character | Description | Example |
|-----------------|------|-----|
| yyyy | 4-digit year | 2026 |
| MM | 2-digit month (zero-padded) | 03 |
| dd | 2-digit day (zero-padded) | 24 |
| M | Month (no zero-padding) | 3 |
| d | Day (no zero-padding) | 24 |

## HTML Snippets

### Floating display (linked to textbox)

The most common usage pattern. Combine a textbox with the calendar.

```html
<input type="text" id="sample-date" class="imds-textbox" style="max-width: 10em;" />
<imart type="imuiCalendar" floatable="true" altField="#sample-date" format="yyyy/MM/dd" />
```

### Inline display

Embed the calendar directly on the screen.

```html
<imart type="imuiCalendar" id="sample-calendar" floatable="false" />
```

### Format and range specification

```html
<input type="text" id="sample-date" class="imds-textbox" style="max-width: 10em;" />
<imart type="imuiCalendar" floatable="true" altField="#sample-date" format="yyyy/MM/dd" minDate="2020/01/01" maxDate="2030/12/31" />
```

### Wrapped in imds-field

```html
<div class="imds-field">
  <div class="imds-field-control">
    <input type="text" id="sample-date" class="imds-textbox" name="sampleDate" value="" style="max-width: 10em;" />
    <imart type="imuiCalendar" floatable="true" altField="#sample-date" format="yyyy/MM/dd" />
  </div>
  <span class="imds-error-text" for="sample-date">Error message is displayed here.</span>
</div>
```

## CSJS API (Client-side JavaScript)

The calendar can be operated using jQuery.
jQuery is already loaded by the theme library, so a separate `<script>` tag is not needed.

```javascript
// Get the currently selected date
$('#sample-calendar').imuiCalendar('getDate');

// Set a date
$('#sample-calendar').imuiCalendar('setDate', targetDate);

// Change an option (e.g. change the calendar ID)
$('#sample-calendar').imuiCalendar('option', 'calendarId', value);
```

## Implementation Notes

- **Use imuiCalendar instead of `<input type="date">` for date input**
  (Because it integrates with intra-mart's calendar settings and locale)
- In floating display, specify the CSS selector of the **display textbox** linked to `altField`. Do not specify a hidden field (because the calendar icon display position depends on the altField element)
- The HTML writing order should be "**display textbox → `<imart type="imuiCalendar">` → hidden field**". Reversing this causes the calendar icon to appear on the left side of the textbox
- If the `altField` selector contains special characters such as colons in the ID, escape them with `\\` (e.g. `altField="#\\:myDate\\:"`)
- The format must always include year, month, and day. If any is missing, textbox input will not be reflected in the calendar
- Multi-date selection (`multiSelectable`) can only be used with inline display
- Specify the textbox width with `max-width` according to the date format (approximately `10em` for `yyyy/MM/dd`)
- When used in an input form, wrap with Field (`imds-field`)
