---
applyTo: "src/main/tssp/**/*.ts"
description: "TypeScript（TSSP）での書き方"
---

# TypeScript Standards (TSSP)

> **Application Scope**: 🟢 **Always** — Applies when generating or editing `.ts` files (function containers and common processing) under `src/main/tssp/src`. Defines the points where the way of writing changes when the jssp rules are applied to TypeScript source.

## Relationship to the jssp Rules

- The jssp rules listed in the "Mapping to the jssp Rules" table at the end also apply to `.ts`. This rule defines only the points where the way of writing changes in TypeScript
- The substitutions in this rule do not apply to the following rules and sections: `.github/instructions/jssp-testing.instructions.md` / `.github/instructions/jssp-performance.instructions.md` / the `workflow/` and `test/` parts of "Directory Structure" in `.github/instructions/jssp-file-structure.instructions.md` / the IM-Workflow and IM-ContentsSearch rows of "Exception Rules for Screens Not Called Through the Routing Table" in the same file
- Where a sample in the jssp rules conflicts with this rule, follow this rule. For which section of this rule relates to each section of the jssp rules, see the "Mapping to the jssp Rules" table at the end
- For the build procedure, how to write `export` in common modules (`.ts` in `common/`) and `load()` / `import` on the calling side, and the lint rules for Rhino, see `.github/skills/tssp-usage/SKILL.md`

## Substitutions

| Description in the jssp rules | Handling in TSSP |
|---|---|
| `.js` of function containers and common processing (file name examples, `@file`, `view/{view}.js`, etc.) | Read as `.ts`. The naming rules (lowercase snake case) do not change |
| Placing source in `src/main/jssp/src` | Place `.ts` and `.html` in `src/main/tssp/src`. Place a paired `.ts` and `.html` in the same directory with the same name |
| `.js` / `.html` in `src/main/jssp/src` | Output of `tssp build` (with `--dev`, `.js.map` is also output). Do not create or edit them by hand, except for the files in the next row. For issues found in the output, fix the `src/main/tssp/src` side and rebuild |
| Files that `tssp build` does not output (`.sql` of 2WaySQL, the extended import `*_import.js` of tenant environment setup, `source-config.xml`) | Place them directly in `src/main/jssp/src`. The location of `.sql` is `src/main/jssp/src/{feature-name}/sql/` |
| Paths resolved at runtime (the routing `page`, arguments of `load()`, `executeByTemplate()`, etc.) | Write them as extensionless paths relative to the output destination `src/main/jssp/src`. Because `tssp build` outputs while preserving the directory structure, the `page` for `src/main/tssp/src/simple_form/view/index.ts` is `simple_form/view/index` |
| References to files of the `jssp-page-generator` skill (`assets/simple-form.md`, `assets/simple-portlet.md`, `reference/api-database.md`, `scripts/validate-jssp-code.js`) | Refer to the files of the same name in `.github/skills/tssp-page-generator/`. Run `validate-jssp-code.js` against the output after the build succeeds |

The way of writing presentation pages (`.html`) does not change.

## Basic Structure

The "Basic Structure" of `.github/instructions/jssp-function-container.instructions.md` takes the following form in `.ts`. The subsequent sections refer to this sample.

```typescript
/**
 * User inquiry screen
 *
 * @file index.ts
 * @description Displays user information.
 */

// ========================================
// Bound Variables (for presentation page linking)
// ========================================
export let $title = 'User Inquiry';
export let $data = '{}';

// ========================================
// Type Definitions
// ========================================
/** User information displayed on the screen */
interface UserForm {
  userCode: string;             // User code
}

/** Processing result passed to the presentation page */
interface ViewResponse {
  result: UserForm | null;
  error: {
    code: string;               // Error code
    message: string;            // Error message
  };
}

// ========================================
// Entry Point
// ========================================
/**
 * Entry point for screen display.
 *
 * @param request - Request object
 */
export function init(request: Request): void {
  let response = main(request);
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

/**
 * Executes main processing.
 *
 * @param request - Request parameters
 * @return Processing result
 */
function main(request: Request): ViewResponse {
  let logger = Logger.getLogger();
  let response: ViewResponse = {
    result: null,
    error: { code: '', message: '' }
  };

  try {
    let userCode: string = request['userCode'];
    response.result = { userCode: userCode };
  } catch (e) {
    logger.error('An error occurred while displaying the screen. {}', (e as Error).message);
    transferErrorPage('E002', 'An unexpected error has occurred.');
    return response;
  }

  return response;
}

/**
 * Displays the error message in full screen when an error occurs.
 *
 * @param code - Error code
 * @param message - Error message
 */
function transferErrorPage(code: string, message: string): void {
  let parameter: Transfer.TransferParam = {
    title: 'A system error has occurred',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(parameter);
}
```

For the complete implementation, see `.github/skills/tssp-page-generator/assets/simple-form.md`.

## Bound Variables and Entry Point

- Declare bound variables at the top level as `export let $data = ...`
- Write the entry point as `export function init(request: Request): void`. Write a job as `export function execute(): JobResult`. The `export` is removed in the output `.js`

## Argument and Return Types of Functions

- Write types for the arguments and return values of all functions. An untyped argument stops the build with TS7006
- Functions other than `init` also receive `request: Request`
- Make the return type of a function that always throws an exception `never`. With `void`, type narrowing does not take effect after the call (even if that function is called when `value === null`, the subsequent `value` remains `string | null`)

## Type Definitions (`interface`)

- Define the shapes of values received from the request, responses (the object put into `$data`, API responses), and DB records with `interface`, and attach them to variables, arguments, and return values
- Place `interface` declarations in the "Type Definitions" section. Its position is after the "Constant Definitions" and "Bound Variables" sections (those present in the file) and immediately before the "Entry Point" section
- Because each `.ts` is type-checked as an independent module, an `interface` of the same name may be defined in each file
- Write types shared by multiple files with `export interface` in a types-only `.ts`, and read them with `import type`. A types-only `.ts` is not a function container, so do not create a paired `.html` even when placing it in `view/`
- Attach type annotations to variables created with object literals or array literals. Without an annotation, `result: null` is inferred as the `null` type, and a later assignment becomes TS2322. With `let result = {};`, adding a property later becomes TS2339
- Variables whose type is determined from the right-hand side (`let logger = Logger.getLogger();`, `let statusCode = 200;`) do not need type annotations

## Using d.ts Types

- Use d.ts types (`Transfer.TransferParam`, `DatabaseResult`, `JobResult`, etc.) for variables passed to APIs and variables that receive API return values. Do not redefine types that exist in d.ts as your own `interface`
- Create objects passed to APIs in variables annotated with the d.ts type. For a type whose properties are all optional, such as `Transfer.TransferParam`, an object containing a wrong key (`mesage`, etc.) passes type checking when there is no type annotation. With a type annotation, the build stops with TS2561 (TS2353 for a key that has no similarly named property)
- For APIs that return `ResultObject` / `BizApiResultInfo`, confirm that `result.error` is `false` before reading `result.data`. `data` read without that confirmation becomes `unknown`, and the build stops (TS2571 when read directly from the return value, TS18046 when read after receiving it in a variable, TS2339 when confirmed only with `result.data &&`)
- Pass API arguments exactly as typed in d.ts. Among the samples in the jssp rules, the following ways of writing are stopped by type checking

| Way of writing in the jssp rule samples | Type error | Way of writing in TypeScript |
|---|---|---|
| `db.select(sql, [status])` | TS2322 | `db.select(sql, [DbParameter.string(status)])` |
| Passing a value that can be `null` to `DbParameter.string()` / `DbParameter.number()` | TS2345 | For a column always output in the SQL body, pass `new DbParameter(value, DbParameter.TYPE_STRING)` (`DbParameter.TYPE_NUMBER` for numbers). For a parameter that branches via `/*IF*/`, pass `null` without wrapping it in `DbParameter` only when the value is `null` |
| Passing the return value of a helper that returns `Date \| null` (`parseLocalDateTime()`, etc.) directly to `DbParameter.date()` / `DbParameter.timestamp()` | TS2345 | Receive it in a variable and separate out `null`. For a parameter that branches via `/*IF*/`, write `d !== null ? DbParameter.date(d) : null`; for a column always output in the SQL body, write `d !== null ? DbParameter.date(d) : new DbParameter(null, DbParameter.TYPE_DATE)` (for TIMESTAMP, `DbParameter.timestamp(d)` and `DbParameter.TYPE_TIMESTAMP`) |

## Receiving Request Values

- `Request` has an index signature (the value is `any`). Receive a value read with `request['xxx']` in a typed variable, as in `let userCode: string = request['userCode'];`. Receive the return value of `getParameterValue()` as `string | null`
- For a value evaluated as a number, evaluate the variable converted with `parseInt()`. Passing a `string` variable to `isNaN()` becomes TS2345, and comparing it in magnitude with a number becomes TS2365
- Confirm the method names of `request` in `d.ts/platform/standard/im-ssjs-request.d.ts`. Even a method name that is not in d.ts passes type checking

## `e` in `catch`

The `e` of `catch (e)` is `unknown`, and `e.message` becomes TS18046. Write `(e as Error).message`.

## Custom Exceptions for APIs

The cast with an inline `@type` annotation defined in "API Error Handling" of `.github/instructions/jssp-error-handling.instructions.md`, and its note to "declare an `interface` under `d.ts/`", do not apply to `.ts`. Define `interface ApiError extends Error` and cast with `as ApiError`.

- Inline JSDoc `@type` annotations are ignored in the type checking of `.ts`. `e` remains `unknown` and becomes TS18046, and `error.code = code` on a variable of type `Error` becomes TS2339
- Define `ApiError` in each API `.ts`. To share it, place it in a types-only `.ts` and read it with `import type { ApiError } from '../common/api_types';`

```typescript
/** Exception with an error code and HTTP status */
interface ApiError extends Error {
  code: string;
  httpStatus: number;
}

export function init(request: Request): void {
  let statusCode = 200;
  try {
    validateRequest(request);
  } catch (e) {
    let apiError = e as ApiError;
    statusCode = apiError.httpStatus || 500;
  }
  Web.getHTTPResponse().setStatus(statusCode);
}

function validateRequest(request: Request): void {
  let userCode: string = request['userCode'];
  if (!userCode) {
    throwApiError('E.IWP.FOO.BAR.00001', 400, 'userCode is required.');
  }
}

function throwApiError(code: string, httpStatus: number, message: string): never {
  let error = new Error(message) as ApiError;
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}
```

For the complete implementation, see `.github/skills/tssp-page-generator/assets/post-json-api.md`.

## JSDoc

- Do not omit JSDoc comments and section separator comments, the same as in the jssp rules
- Do not write type tags (`{Object}`, `{String}`, etc.). Write types in the function signature, and write JSDoc in the form `@param request - Request object`, `@return Processing result`
- Do not write `@return` for functions whose return type is `void` / `never`
- Attach a one-line `/** description */` to an `interface`, and describe its properties with end-of-line `//` comments

## d.ts Constants

For the constant objects in `d.ts/workflow/enum/` (`NodeType`, `ProcessType`, `TaskStatus`, etc.), write the value as a literal, and write the constant name only in the `typeof` type annotation and the comment.

```typescript
let NODE_TYPE_APPLY: typeof NodeType.nodeTyp_Apply = '2';  // Apply node (NodeType.nodeTyp_Apply)

export function isApplyNode(nodeType: string): boolean {
  return nodeType === NODE_TYPE_APPLY;
}
```

- With the type annotation, the build stops with TS2322 when the literal differs from the value in d.ts
- Do not reference `NodeType.nodeTyp_Apply` as a value within an expression. It passes the build, remains as is in the output `.js`, and becomes a ReferenceError at runtime

## Handling `const`

`const` may be used in `.ts`. `tssp build` converts it to `let`. "Regarding `const`" in `.github/instructions/jssp-code-style.instructions.md` (refrain from active use) does not apply to `.ts`. Do not use `var`.

## Prohibition of Bypassing Type Checking

Fix type errors by correcting the code to match the d.ts signatures. Type checking must not be bypassed with the following ways of writing. None of them is detected by `tssp build`.

- `any` (`: any`, `as any`, `any[]`, `Record<string, any>`, etc.). Receive a value whose type cannot be determined as `unknown`, and use it after narrowing with `typeof`, etc.
- The double cast `as unknown as X`. `e as Error`, `e as ApiError`, and `new Error(message) as ApiError` may be used. Do not use `as` to remove `null` from a type that includes `null` (`parseLocalDateTime(x) as Date`, etc.)
- `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`
- Your own `declare`, `declare global`, `/// <reference`, or your own `.d.ts` under `src/main/tssp`

Do not use APIs that are not in d.ts; report them to the user. `java.*` / `Packages.*` have no declarations in d.ts, and the build stops with TS2304.

## Mapping to the jssp Rules

| jssp rule | Section | Section of this rule |
|---|---|---|
| `.github/instructions/jssp-overview.instructions.md` | Scope of Application / Structure of the Script Development Model | Substitutions |
| `.github/instructions/jssp-file-structure.instructions.md` | Directory Structure / File Naming Rules / Exception Rules for Screens Not Called Through the Routing Table / Mandatory .html Files / How to Specify the page Attribute | Substitutions / Type Definitions (`interface`) |
| `.github/instructions/jssp-file-structure.instructions.md` | Basic Policy (consolidation of common processing) | Relationship to the jssp Rules |
| `.github/instructions/jssp-naming.instructions.md` | Naming Convention Summary / Defining Bound Variables (Function Container) | Substitutions / Bound Variables and Entry Point |
| `.github/instructions/jssp-naming.instructions.md` | Distinguishing Bound Variables from Regular Variables / Avoiding Conflicts with Reserved Words | Bound Variables and Entry Point / Type Definitions (`interface`) / Using d.ts Types |
| `.github/instructions/jssp-function-container.instructions.md` | Basic Structure | Basic Structure / Argument and Return Types of Functions / Type Definitions (`interface`) / JSDoc |
| `.github/instructions/jssp-function-container.instructions.md` | Notes on IM Common Master API (IMMUserManager / IMMCompanyManager, etc.) | Using d.ts Types |
| `.github/instructions/jssp-function-container.instructions.md` | Implementation Patterns for validateRequest Function / Handling the request Object | Receiving Request Values |
| `.github/instructions/jssp-code-style.instructions.md` | Rule: Use `let` / Line Length / Brace Style | Type Definitions (`interface`) / Using d.ts Types / Argument and Return Types of Functions |
| `.github/instructions/jssp-code-style.instructions.md` | Regarding `const` | Handling `const` |
| `.github/instructions/jssp-code-style.instructions.md` | Referencing d.ts Constants and Enumerated Values | d.ts Constants |
| `.github/instructions/jssp-code-style.instructions.md` | Function Comments (JSDoc Format) | JSDoc |
| `.github/instructions/jssp-error-handling.instructions.md` | Error Types and Handling Methods / Error Information Structure (Screen) / Validation Errors / Screen Error Handling | Basic Structure / Type Definitions (`interface`) / `e` in `catch` / Using d.ts Types |
| `.github/instructions/jssp-error-handling.instructions.md` | HTTP Status Codes / API Error Handling | Custom Exceptions for APIs |
| `.github/instructions/jssp-security.instructions.md` | Input Validation (Required) / Session Management | Argument and Return Types of Functions |
| `.github/instructions/jssp-security.instructions.md` | SQL Injection Countermeasures (Required) / Prohibition of Direct Access to Java Objects | Using d.ts Types / Prohibition of Bypassing Type Checking |
| `.github/instructions/jssp-logging.instructions.md` | Implementing Log Output / Handling Confidential Information / Log Format | Argument and Return Types of Functions / `e` in `catch` |
| `.github/instructions/jssp-2way-sql.instructions.md` | SQL File Placement / Related | Substitutions |
| `.github/instructions/jssp-2way-sql.instructions.md` | [Important] Do Not Write `--` Comments in SQL Files / Dynamic Generation of IN Clauses / LIKE Search Escaping / Invocation / Passing Parameters / Direct Embedding / Result Set Processing / Transaction Processing / Checklist | Argument and Return Types of Functions / Type Definitions (`interface`) / Using d.ts Types / `e` in `catch` / JSDoc |
| `.github/instructions/jssp-presentation-page.instructions.md` | Standard Implementation Policy for Presentation Pages / Scoping the Bind Variable `$data` (IIFE) / Naming Convention for the `id` Attribute / Implementation Pattern for the getValidationErrors Function / Validation Execution Timing (in each case, the places that refer to files of the `jssp-page-generator` skill) | Substitutions |
