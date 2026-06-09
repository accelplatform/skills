# Common Test Patterns and Tips

## Overview

A collection of common patterns and frequently encountered notes when writing tests with jest-on-rhino.

## Basic Structure of beforeEach / afterEach

```javascript
describe('module name', function() {
    beforeEach(function() {
        jest.clearAllMocks();
    });

    afterEach(function() {
        // Restore all mocks injected via jest.mock()
        jest.unmock('DatabaseManager');
        jest.unmock('Logger');
        jest.unmock('Transfer');
    });

    // Test cases...
});
```

## Temporarily Replacing Source Functions

Because sourcePathMapping loads sources into the same scope, you can temporarily replace source functions within a test.
**Always restore the original function afterwards.**

```javascript
describe('main', function() {
    it('behavior when processBusinessLogic throws an exception', function() {
        // Save the original function
        let original = processBusinessLogic;

        // Replace with stub
        processBusinessLogic = function() {
            throw new Error('Test error');
        };

        let response = main({});
        expect(response.result).toBeNull();

        // Restore the original
        processBusinessLogic = original;
    });
});
```

## Loading External Files with load()

Files not automatically resolved by sourcePathMapping (such as common utilities)
must be explicitly loaded with `load()`.

```javascript
// Load common utilities at the top of the test file
load('src/main/jssp/src/common/util/string_util.js');

describe('formatCode', function() {
    it('should left-pad a code with zeros', function() {
        // Can call functions from string_util.js directly
        let result = formatCode('42', 5);
        expect(result).toBe('00042');
    });
});
```

## Parameterized Tests with it.each / describe.each

Use when running the same test structure across multiple patterns.

```javascript
describe('input validation', function() {
    it.each([
        ['null', null],
        ['undefined', undefined],
        ['empty string', ''],
        ['whitespace only', '   ']
    ])('should return false when input is %s', function(label, value) {
        let result = validateInput(value);
        expect(result).toBe(false);
    });

    it.each([
        ['ASCII letters', 'ABC', true],
        ['ASCII digits', '123', true],
        ['ASCII alphanumeric', 'ABC123', true],
        ['Japanese', 'テスト', false],
        ['contains symbol', 'ABC-123', false]
    ])('should return %s when input is %s', function(label, value, expected) {
        let result = isAlphanumeric(value);
        expect(result).toBe(expected);
    });
});
```

## Choosing the Right expect Matcher

### Value Equality

```javascript
// Strict equality (primitive values)
expect(result).toBe('expected');
expect(count).toBe(10);
expect(flag).toBe(true);

// Object/array equality (deep comparison)
expect(obj).toEqual({ key: 'value' });
expect(arr).toEqual([1, 2, 3]);

// Partial match (verify only some properties of an object)
expect(obj).toMatchObject({ key: 'value' });

// Array length
expect(list).toHaveLength(5);
```

### Property Existence

```javascript
// Property exists
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('nested.key');

// Also verify property value
expect(obj).toHaveProperty('key', 'value');
```

### Type Checking

```javascript
// Verify type with expect.any
expect(obj).toMatchObject({
    id: expect.any(String),
    count: expect.any(Number),
    items: expect.any(Array)
});
```

### Function Calls

```javascript
// Number of calls
expect(mockFn).toHaveBeenCalledTimes(1);

// Argument verification
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

// Partial match argument verification
expect(mockFn).toHaveBeenCalledWith(
    expect.stringContaining('error')
);
expect(mockFn).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'title' })
);

// Not called
expect(mockFn).not.toHaveBeenCalled();
```

### Exceptions

```javascript
// Should throw an exception
expect(function() {
    targetFunction(null);
}).toThrow();

// With message
expect(function() {
    targetFunction(null);
}).toThrow('invalid argument');
```

## Setting Return Values for jest.fn()

```javascript
// Return a fixed value
let mockFn = jest.fn().mockReturnValue('fixed value');

// Return different values on successive calls
let mockFn = jest.fn()
    .mockReturnValueOnce('1st call')
    .mockReturnValueOnce('2nd call')
    .mockReturnValue('3rd call onwards');

// Dynamically determine return value with a function
let mockFn = jest.fn(function(input) {
    return input + '_processed';
});
```

## How to Use jest.spyOn

Observe methods on objects in the same scope.

```javascript
describe('spyOn example', function() {
    it('can spy on JSON.parse calls', function() {
        let spy = jest.spyOn(JSON, 'parse');

        let result = JSON.parse('{"key": "value"}');

        expect(spy).toHaveBeenCalledWith('{"key": "value"}');
        expect(result).toEqual({ key: 'value' });

        spy.mockRestore();
    });
});
```
