# CSVParser API Reference

## Overview

CSVParser is an object that creates a two-dimensional array from a string written in CSV format.
It consists only of static methods and can be used directly without instantiation.

## Method List

| Method | Return Value | Description |
|---------|--------|------|
| parse(csvtext, delimita) | Array | Parse a CSV-format string and convert it to a two-dimensional array |

## Method Details

### parse(csvtext, delimita)

Parses a CSV-format string and converts it to a two-dimensional array.

| Parameter | Type | Description |
|-----------|------|------|
| csvtext | String | CSV-format string |
| delimita | String | Delimiter character (specify as a single character such as `,`, `\t`, ` `) |

**Return Value**: Array - Two-dimensional array of strings

## Usage Examples

### Parsing Comma-Delimited CSV

```javascript
let csv = 'name,age,email\nTanaka,30,tanaka@example.com\nSuzuki,25,suzuki@example.com';
let result = CSVParser.parse(csv, ',');
// result[0] => ["name", "age", "email"]
// result[1] => ["Tanaka", "30", "tanaka@example.com"]
// result[2] => ["Suzuki", "25", "suzuki@example.com"]
```

### Parsing Tab-Delimited TSV

```javascript
let tsv = 'col1\tcol2\tcol3\nval1\tval2\tval3';
let result = CSVParser.parse(tsv, '\t');
```
