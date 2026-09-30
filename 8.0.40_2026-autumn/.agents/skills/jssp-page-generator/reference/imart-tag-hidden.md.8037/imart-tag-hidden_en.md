# IMART hidden Tag Reference

## Overview

`<imart type="hidden">` is a tag that generates hidden fields for passing data as request parameters when submitting forms.
The attribute names become parameter names, and the attribute values become parameter values.

## Attribute List

### Required Attributes

None. Define parameters with any attribute name.

### Parameter Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| (any attribute name) | String | The attribute name becomes the request parameter name, and the attribute value becomes the parameter value. Multiple attributes can be specified |

### Optional Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| escapeXml | Boolean | Follows page settings | XML escape. Converts `&<>"'` to entity references |
| escapeJs | Boolean | Follows page settings | JavaScript escape. Converts control characters |

## Usage Examples

### Basic Usage

```html
<form>
  <imart type="hidden" arg_a="A" arg_b="B" />
</form>
```

Retrieval on the server side:
```javascript
let a = request['arg_a'];  // "A"
let b = request['arg_b'];  // "B"
```

### Using Bind Variables

```html
<imart type="hidden" userCode=$userCode mode=$mode />
```

Retrieval on the server side:
```javascript
let userCode = request['userCode'];
let mode = request['mode'];
```

## Notes

- Does not have child tags (self-closing tag)
- All attributes other than `escapeXml` / `escapeJs` are sent as request parameters
- Do not pass highly confidential data (passwords, etc.) directly
