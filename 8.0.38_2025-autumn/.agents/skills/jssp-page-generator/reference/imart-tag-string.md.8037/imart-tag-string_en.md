# IMART string Tag Reference

## Overview

`<imart type="string">` is a tag that inserts specified data as a string at the specified position.
The tag part is replaced with the specified string.

## Attribute List

### Required Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| value | String | Data to insert. Subject to escape processing |

### Optional Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| escapeXml | Boolean | Follows page settings | XML escape. Converts `&<>"'` to entity references |
| escapeJs | Boolean | Follows page settings | JavaScript escape. Converts control characters |
| escapeSpace | Boolean | false | Converts half-width spaces to `&nbsp;` |
| nl2br | Boolean | false | Converts newline characters to `<br>` tags |
| exclusionEscapeXml | String | - | String to exclude from XML escaping |
| exclusionEscapeJs | String | - | String to exclude from JavaScript escaping |
| delimiter4exclusionEscapeXml | String | `:` | Delimiter for XML escape exclusion strings |
| delimiter4exclusionEscapeJs | String | `:` | Delimiter for JavaScript escape exclusion strings |

## Characters Subject to Escaping

### XML Escaping (escapeXml="true")

| Original Character | Converted To |
|-------------------|-------------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `'` | `&#039;` |
| `"` | `&#034;` |

### JavaScript Escaping (escapeJs="true")

Escapes `\` `'` `"` and backspace, newline, tab, form feed, and carriage return.

Processing order: XML escape → JavaScript escape

## Usage Examples

### Displaying a String in HTML (with XSS protection)

```html
<span><imart type="string" value=$userName escapeXml="true" escapeJs="false"></imart></span>
```

### Embedding a String in JavaScript

```html
<script>
  const data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;
</script>
```

### Converting Newlines to br Tags for Display

```html
<p><imart type="string" value=$comment escapeXml="true" escapeJs="false" nl2br="true"></imart></p>
```

## Notes

- For XSS protection, set `escapeXml="true"` when displaying within HTML
- When embedding a JSON string in JavaScript, set both to `false` and pass values that are already escaped on the function container side
- Be cautious about increased security risks when using `exclusionEscapeXml` / `exclusionEscapeJs`
