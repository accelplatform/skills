---
paths:
  - "src/main/jssp/**/*.js"
---

# Debug API Reference

## Overview

Debug is an object used for debugging during development.
It provides functionality to output variable information to a browser, console, or file.
It consists only of static methods and can be used directly without instantiation.

## Method List

| Method | Description | Output Destination |
|---------|------|--------|
| browse(arg, args...) | Display variable information in the browser | Browser |
| console(arg, args...) | Display object contents in JSON format on the console | Console |
| print(msg) | Output a message to the console | Console |
| write(msg) | Output a message to a file | debug.txt |

## Method Details

### browse(arg, args...)

Displays variable information in the browser.

| Parameter | Type | Description |
|-----------|------|------|
| arg | Object | Variable to display |
| args... | Object | Additional variables (any number) |

- Any JavaScript variable type can be specified
- **After execution, subsequent program code will not run**
- Cannot be used in try...catch blocks

### console(arg, args...)

Displays object contents in JSON format on the console.

| Parameter | Type | Description |
|-----------|------|------|
| arg | Object | Variable to display |
| args... | Object | Additional variables (any number) |

- Output in JSON format, so you can copy the output to source and create an object
- Properties that are invalid as JSON will not be displayed

### print(msg)

Outputs a message to the console.

| Parameter | Type | Description |
|-----------|------|------|
| msg | String | Message to output |

### write(msg)

Outputs a message to a file. The output destination is `debug.txt` directly under the home directory (under `WEB-INF/debug.txt` in the default configuration). When called multiple times, it operates in append mode.

| Parameter | Type | Description |
|-----------|------|------|
| msg | String | Message to output |

## Usage Examples

### Debug Output to Console

```javascript
let sampleObject = {
  'property1': 'string value 1',
  'property2': new Date(),
  'property3': 256
};
Debug.console(sampleObject);

Debug.print('Processing started');
```

### Debug Output to File

```javascript
Debug.write('Variable value: ' + value);
```

### Display Variable in Browser

```javascript
// Note: subsequent program code will not run
Debug.browse(request, response);
```
