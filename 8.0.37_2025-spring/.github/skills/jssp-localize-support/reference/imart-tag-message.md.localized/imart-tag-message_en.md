---
paths:
  - "src/main/jssp/**/*.html"
---

# IMART message Tag Reference

## Overview

`<imart type="message">` is a tag that inserts the string specified by a message ID at the tag's location.
It displays messages defined in message property files in multiple languages according to the logged-in user's locale.

## Attribute List

### Required Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | String | Message ID. Specify the key from the property file. |

### Optional Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| args | Array/String | - | Replacement parameters for placeholders (`{0}`, `{1}`, ...) in the message |
| locale | String | Logged-in user's locale | Explicitly specify the locale of the message to retrieve |
| escapeXml | Boolean | Follows page settings | XML escaping. Converts `&<>"'` to entity references |
| escapeJs | Boolean | Follows page settings | JavaScript escaping. Converts control characters |
| nl2br | Boolean | false | Converts newline characters to `<br>` tags |

## Usage Examples

### Multilingual Display in HTML (with XSS protection)

```html
<h1><imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE" escapeXml="true" escapeJs="false" /></h1>
```

### Embedding Messages in JavaScript

```html
<script>
  imuiShowErrorMessage('<imart type="message" id="MSG.E.IWP.SKILLS.SIMPLE.FORM.SYSTEM.ERROR" escapeXml="false" escapeJs="true" />');
</script>
```

### Embedding in HTML Attributes

```html
<span class="imds-required-label-required" data-required-label="<imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.REQUIRED" escapeXml="true" escapeJs="false" />">
```

### Message with Placeholders

Property file:
```properties
MSG.E.IWP.SKILLS.SIMPLE.FORM.OVER.MAX.LENGTH={0}\u306f\u6700\u5927{1}\u6587\u5b57\u3067\u3059\u3002
```

HTML:
```html
<imart type="message" id="MSG.E.IWP.SKILLS.SIMPLE.FORM.OVER.MAX.LENGTH" args=$msgArgs escapeXml="true" escapeJs="false" />
```

### Locale Specification

```html
<imart type="message" id="CAP.Z.IWP.SKILLS.SIMPLE.FORM.TITLE" locale="en" escapeXml="true" escapeJs="false" />
```

## Escape Usage Guide

| Context | escapeXml | escapeJs | Reason |
|---------|-----------|----------|--------|
| HTML text | `true` | `false` | XSS protection |
| JavaScript string | `false` | `true` | Escape special characters inside JS string literals |
| HTML attribute value | `true` | `false` | XSS protection for attribute values |

## Notes

- Does not have child tags (self-closing tag).
- When displaying in HTML, set `escapeXml="true"` (XSS protection).
- When embedding in JavaScript, set `escapeJs="true"`.
- In function containers (server-side JS), use the `MessageManager.getMessage()` API instead (this tag cannot be used).
