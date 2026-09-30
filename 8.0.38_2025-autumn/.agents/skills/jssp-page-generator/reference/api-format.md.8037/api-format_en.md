# Format API Reference

## Overview

Format is a static object for string conversion.
It provides format conversion APIs for numbers, dates, and strings.

## Method List

| Method | Return Value | Description |
|---------|--------|------|
| `get(format, arg, ...)` | String | Convert argument values to strings according to the format specification |
| `fromNumber(format, value)` | String | Convert a number to a string according to the format specification |
| `toMoney(value)` | String | Generate a number string with 3-digit comma grouping |

## get(format, arg, ...)

A general-purpose method that converts argument values to strings according to the format specification.
Up to 16 `arg` arguments can be specified.

### Format Specification Characters

| Character | Description | Example |
|----------|------|-----|
| `%s` | String conversion | `%3s` for 3 bytes |
| `%n` | Base-n conversion | `%4n` for base-4 |
| `%d` | Decimal conversion | `%8.3d` for 8 integer digits, 3 decimal digits |
| `%x` | Hexadecimal conversion | `%4x` for 4 digits, zero-padded |
| `%b` | Binary conversion | `%8b` for 8 digits, zero-padded |
| `%m` | 3-digit comma grouping | |
| `%t` | Date conversion | |
| `%%` | Display "%" character | |

### Usage Examples

```javascript
// String conversion
let result = Format.get('Name is "%4s".', 'intra-mart');

// Decimal conversion (7 integer digits, 3 decimal digits)
let result = Format.get('Amount: %7.3d yen', 1234567.89123);

// Hexadecimal conversion
let result = Format.get('Hex: %3x', 55);

// Binary conversion
let result = Format.get('Binary: %4b', 12);

// 3-digit comma grouping
let result = Format.get('Total: %m yen', 333444555666);

// Display % character
let result = Format.get('Achievement rate: 100%%');
```

## fromNumber(format, value)

Converts a number to a string according to the format specification.

### Format Characters

| Character | Description |
|------|------|
| `0` | Digit display (zero-padded) |
| `#` | Digit display (zero not shown) |
| `.` | Decimal point position |
| `,` | Group separator position |

### Usage Examples

```javascript
// Comma-separated
let result = Format.fromNumber('#,##0', 1234567);
// → "1,234,567"

// 2 decimal places
let result = Format.fromNumber('#,##0.00', 1234.5);
// → "1,234.50"
```

## toMoney(value)

Generates a number string with comma grouping every 3 digits. Decimal part is displayed up to 2 digits.

```javascript
let result = Format.toMoney(1234567);
// → "1,234,567"
```
