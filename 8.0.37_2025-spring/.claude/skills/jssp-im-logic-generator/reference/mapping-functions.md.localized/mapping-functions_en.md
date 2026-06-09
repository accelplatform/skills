# Mapping Functions Reference

A list of functions available for variable-to-variable mapping in IM-LogicDesigner.
Used with `mappingRules.source.type = "function"`, specifying the function name in `source.name`.

The following are the basic functions (52 total).
Additional functions can be retrieved via MCP `listMappingFunctions` / `getMappingFunction`.

## Array Operations (9 functions)

| Function Name | Arguments | Description |
|---|---|---|
| `im_array_size` | (array) | Returns the number of elements in the array |
| `im_array_first` | (array) | Returns the first element of the array |
| `im_array_last` | (array) | Returns the last element of the array |
| `im_array_get` | (array, index) | Returns the element at the specified index |
| `im_array_push` | (array, value) | Returns the array with the element appended to the end |
| `im_array_unshift` | (array, array) | Returns the array with the given array prepended to the front |
| `im_array_insert` | (array, index, value) | Returns the array with the element inserted at the specified position |
| `im_array_remove` | (array, index) | Returns the array with the element at the specified position removed |
| `im_array_replace` | (array, index, value) | Returns the array with the element at the specified position replaced |

## String Operations (7 functions)

| Function Name | Arguments | Description |
|---|---|---|
| `im_string_concat` | (str1, str2) | Concatenates strings |
| `im_string_substring` | (str, start, end) | Gets a substring |
| `im_string_replace` | (str, search, replacement) | Replaces a string |
| `im_string_split` | (str, separator) | Splits a string and returns an array |
| `im_string_join` | (array, separator) | Joins an array and returns a string |
| `im_string_trim` | (str) | Removes leading and trailing whitespace |
| `im_string_el` | (expression) | Evaluates an EL expression and returns a string |

## Numeric Operations (12 functions)

| Function Name | Arguments | Description |
|---|---|---|
| `im_math_addition` | (a, b) | Addition (a + b) |
| `im_math_subtraction` | (a, b) | Subtraction (a - b) |
| `im_math_multiplication` | (a, b) | Multiplication (a * b) |
| `im_math_division` | (a, b, scale) | Division (a / b, scale is the number of decimal places) |
| `im_math_modulus` | (a, b) | Modulo (a % b) |
| `im_math_pow` | (base, exponent) | Exponentiation (base ^ exponent) |
| `im_math_abs` | (value) | Absolute value |
| `im_math_max` | (a, b) | Maximum value (supports numbers and dates) |
| `im_math_min` | (a, b) | Minimum value (supports numbers and dates) |
| `im_math_roundUp` | (value, scale) | Round up |
| `im_math_roundDown` | (value, scale) | Round down (truncate) |
| `im_math_roundHalfUp` | (value, scale) | Round half up |

## Number Formatting (2 functions)

| Function Name | Arguments | Description |
|---|---|---|
| `im_number_formatnumber` | (number, pattern) | Formats a number using a pattern string |
| `im_number_parsenumber` | (str, pattern) | Parses a number using a pattern string |

## Date Operations (10 functions)

| Function Name | Arguments | Description |
|---|---|---|
| `im_date_formatdate` | (date, pattern) | Formats a date using a pattern string (system timezone) |
| `im_date_parsedate` | (str, pattern) | Parses a date using a pattern string (system timezone) |
| `im_date_account_formatdate` | (date, pattern) | Formats a date in the account timezone |
| `im_date_account_parsedate` | (date, pattern) | Parses a date in the account timezone |
| `im_date_calculate` | (date, days) | Adds days to a date |
| `im_date_interval` | (date1, date2) | Returns the difference (in days) between two dates |
| `im_date_beginning_of_the_month` | (date) | Returns the first day of the month |
| `im_date_end_of_the_month` | (date) | Returns the last day of the month |
| `im_date_convertdate_in_account_tz` | (date) | Converts from system TZ to account TZ |
| `im_date_convertdate_in_system_tz` | (date) | Converts from account TZ to system TZ |

## Object Operations (6 functions)

| Function Name | Arguments | Description |
|---|---|---|
| `im_object_keys` | (object) | Returns the list of object keys as an array |
| `im_object_values` | (object) | Returns the list of object values as an array |
| `im_object_to_lower_camel_case` | (object) | Converts key names to lowerCamelCase |
| `im_object_to_upper_camel_case` | (object) | Converts key names to UpperCamelCase |
| `im_object_to_lower_snake_case` | (object) | Converts key names to lower_snake_case |
| `im_object_to_upper_snake_case` | (object) | Converts key names to UPPER_SNAKE_CASE |

## JSON Conversion (2 functions)

| Function Name | Arguments | Description |
|---|---|---|
| `im_parse_json` | (str) | Parses a JSON string into an object |
| `im_to_json` | (object) | Converts an object to a JSON string |

## Binary / Base64 (2 functions)

| Function Name | Arguments | Description |
|---|---|---|
| `im_binary_encode_base64` | (binary) | Encodes binary to a Base64 string |
| `im_base64_decode_binary` | (str) | Decodes a Base64 string to binary |

## ID Generation (2 functions)

| Function Name | Arguments | Description |
|---|---|---|
| `im_id_uuid` | (none) | Generates a UUID |
| `im_id_identifier` | (none) | Generates an intra-mart identifier |

## How to Use in spec

```jsonc
{
  "target": "$variable/itemCount",
  "source": {
    "type": "function",
    "name": "im_array_size",
    "path": null,
    "arguments": [
      { "type": "value", "name": null, "path": "im_repositorySearchEntityData1", "arguments": null }
    ]
  }
}
```

### Function Nesting (Passing Another Function as an Argument)

```jsonc
{
  "target": "$variable/result",
  "source": {
    "type": "function",
    "name": "im_string_concat",
    "path": null,
    "arguments": [
      { "type": "value", "name": null, "path": "$input/prefix", "arguments": null },
      {
        "type": "function",
        "name": "im_to_json",
        "path": null,
        "arguments": [
          { "type": "value", "name": null, "path": "$input/data", "arguments": null }
        ]
      }
    ]
  }
}
```

### Functions with No Arguments

`im_id_uuid` / `im_id_identifier` are called without arguments:

```jsonc
{
  "target": "$variable/newId",
  "source": {
    "type": "function",
    "name": "im_id_uuid",
    "path": null,
    "arguments": []
  }
}
```
