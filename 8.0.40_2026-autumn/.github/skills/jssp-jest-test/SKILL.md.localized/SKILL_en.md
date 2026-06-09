---
name: jssp-jest-test
description: Supports creation of unit tests for function containers (.js) using jest-on-rhino. Provides test code creation, mocking, and guidance on handling Rhino constraints (ES5). Use when mentioning writing tests, creating tests, mock, jest, spyOn, unit tests, adding test cases, or improving coverage. Use this skill (not Playwright) for testing function containers.
---

# jest-on-rhino Test Development Guide

## Overview

A skill set for creating unit tests against intra-mart Accel Platform function containers (js) using Jest on Rhino.
Written with Jest-compatible API, runs on Rhino 1.7R4 (ES5 equivalent).

## When to Use

When the user makes requests such as:
- "Create a test for ○○"
- "Write tests for the function container"
- "Add unit tests"
- "Write tests with Jest"
- "Write tests using mocks"

## Test Generation Steps

1. Load the target function container (js)
2. Identify the functions and logic to test
3. Design test cases based on the test perspectives in `{{AGENT_RULES}}/jssp-testing.instructions.md`
4. Generate test code following the templates and mock patterns in this skill

## Scope Resolution Mechanism During Test Execution

### Per-Test-File Scope Isolation

Each test file runs in an independent Rhino scope (JavaScript execution context).
Global variables are not shared between test files.

### Execution Lifecycle (per test file)

```
1. Create a new scope (initialize JS standard objects: Object, Array, String, Math, JSON, etc.)
2. Load setupFiles (if configured)
3. Inject Jest global functions (describe, it, expect, jest, console, etc.)
4. Load setupFilesAfterEnv (if configured)
5. Load source files via sourcePathMapping (evaluated in the same scope)
6. Load and evaluate the test file (describe/it are registered)
7. Execute registered tests (beforeAll → beforeEach → test → afterEach → afterAll)
8. Discard scope
```

### sourcePathMapping Scope Resolution Rules

Identifies the corresponding source file from the test file path and loads it into the same scope:

```
Test: src/test/jssp/src/{category}/view/index.test.js
  → Remove prefix: {category}/view/index.test.js
  → Replace extension: {category}/view/index.js
  → Source path: src/main/jssp/src/{category}/view/index.js
```

The source file is evaluated in the **same scope** as the test file.
Functions and variables defined in the source are directly accessible from the test code.

### Available in Scope

| Category | Available Items |
|---------|---------------|
| JS Standard Objects | Object, Array, String, Number, Math, JSON, RegExp, Date, Error, etc. |
| Jest API | `describe`, `it`, `test`, `expect`, `jest`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll` |
| Aliases | `xdescribe`(skip), `fdescribe`(only), `xit`(skip), `fit`(only), `xtest`(skip) |
| console | `console.log`, `console.error`, `console.warn`, `console.info` |
| Source code | Functions and variables loaded via sourcePathMapping |
| Additional loads | Functions and variables from files explicitly loaded with `load()` |

### Impact on Test Code

- Source functions can be called directly without `load()`
- Global variables defined in the source can be referenced as-is
- Variables defined in other test files are not visible (scope isolation)
- **Platform APIs do not exist in scope and must be injected via mock**

## Rhino Constraints (Important: Must Be Followed)

This project runs on Rhino 1.7R4 (ES5 equivalent). Always adhere to the following constraints:

| Prohibited | Alternative |
|---------|---------|
| `() => {}` (arrow function) | Use `function() {}` |
| `async` / `await` | Synchronous tests or `done` callback |
| `Promise` / `.resolves` / `.rejects` | Use `done` callback |
| `require()` | Use `load()` |
| `Function.prototype.bind` | Use closures as alternative |
| Template literals `` `${}` `` | Concatenate with `"str" + variableName` |
| `class` syntax | Use `function` + `prototype` |
| Destructuring `{a, b} = obj` | Use `let a = obj.a;` |
| Spread `...args` | Enumerate arguments explicitly |
| `for...of` | Use `for (let i = 0; ...)` |
| `Object.assign` | Manual copy |

Note: Variable declarations must follow the main coding style rule (use `let`; `var` is discouraged).

### Using `var` in Fallback Functions When Source Loading Fails

When the source file cannot be loaded by Rhino (e.g., when it contains JSDoc type casts in the `/** @type {T} */ (expr)` form), a fallback function may be defined in the test file via bare global assignment:

```javascript
// Fallback definition inside the test file because the source cannot be loaded
processBusinessLogic = function(request) {
  var db = new TenantDatabase();  // ← Use var, not let
  // ...
};
```

Using `let` inside the body of this kind of function causes Rhino to raise a `"missing ) after condition"` parse error, so **use `var` only within the body of such fallback functions**.
Keep using `let` inside `describe/it` callbacks and regular scopes.

The root fix is to remove the Rhino-incompatible syntax from the source (in the example above, remove the JSDoc type cast). Fallbacks should be treated only as a temporary workaround.

## Basic Test Code Template

```javascript
describe('Module name', function() {
    // Initialize per test
    beforeEach(function() {
        jest.clearAllMocks();
    });

    describe('Function name', function() {
        it('Normal behavior', function() {
            let result = targetFunction('input');
            expect(result).toBe('expected');
        });

        it('Error behavior', function() {
            expect(function() {
                targetFunction(null);
            }).toThrow('error message');
        });
    });
});
```

## Mock Patterns

Basic usage of jest.fn() / jest.spyOn() is the same as the standard Jest API.
Only jest-on-rhino **specific** platform API mock patterns are described here.

### jest.mock() / jest.unmock() - Platform API Mocking

intra-mart global APIs are mocked using the following pattern:

```javascript
describe('Test for a function using global APIs', function() {
    afterEach(function() {
        jest.unmock('DatabaseManager');
    });

    it('Processes data retrieval results', function() {
        jest.mock('DatabaseManager', {
            select: jest.fn().mockReturnValue([
                { id: 1, name: 'Test' }
            ]),
            insert: jest.fn().mockReturnValue(1)
        });

        let result = targetFunction();
        expect(DatabaseManager.select).toHaveBeenCalled();
        expect(result).toEqual([{ id: 1, name: 'Test' }]);
    });
});
```

## Notes

Mock management with jest.fn() / jest.spyOn(), matchers, parameterized tests (it.each / describe.each), timer mocks, and other standard Jest APIs can be used as-is.
However, **code examples must always be written in ES5 syntax (Rhino constraints)**.

- Always follow the Rhino constraints (ES5 equivalent: arrow functions, let/const, template literals, etc. cannot be used)
- Platform APIs (DatabaseManager, PublicStorage, etc.) do not exist in scope and must be injected with `jest.mock()`
- Mocks injected with `jest.mock()` must always be restored with `jest.unmock()` in `afterEach`
- Test file names must end with `.test.js`
