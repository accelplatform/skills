---
name: tssp-code-review
description: Quality review for intra-mart TSSP code (.ts / .html in src/main/tssp/src). In addition to the results of tssp build --dev (type checking and Rhino lint), a grep for bypassing type checking (any / as any / @ts-ignore, etc.), and validate-jssp-code.js (run against the build output), comprehensively checks coding conventions (var prohibition, naming conventions, bind variables), types (interface, consistency with d.ts), security (SQL injection, XSS), error handling (forward, recovery), and structure (init function, responsibility separation). Use when mentioning code review, quality check, PR review, check code, or verify compliance with conventions.
---

■■ Required Rules Checklist (Mandatory) ■■

Confirm the following before starting implementation. Do not proceed if any item is unchecked.

- [ ] [tssp-typescript](../../requirements/tssp-typescript/AGENTS.md) has been read and understood


# TSSP Code Review Skill

## Overview

Reviews code written in the intra-mart Accel Platform script development model (TSSP) and checks from the perspectives of quality, convention compliance, and security.

The review covers the following two locations. The `.js` / `.html` files in `src/main/jssp/src` are the output of `tssp build`, so report findings with the file and line on the `src/main/tssp/src` side.

| Path | Content |
|---|---|
| `src/main/tssp/src/{feature name}/` | Source under review (`.ts` / `.html`) |
| `src/main/jssp/src/{feature name}/` | Output of `tssp build` (`.js` / `.html` / `.js.map`) and 2WaySQL `.sql` files (placed here because `tssp build` does not output `.sql`; report findings on `.sql` against this file). `validate-jssp-code.js` in Step 1 validates this directory |

## Review Procedure

### Step 1: Run the Auto Validation

Run the following at the project root to first identify problems that can be detected by tools. First run the two greps for bypassing type checking (the `.ts` files of the target feature, and `declare global` across all of `src/main/tssp/src`), the search for `.d.ts` files under `src/main/tssp`, and `tssp build` (type checking and Rhino lint). Because `tssp build` is placed last, the exit code of this block is the exit code of `tssp build`.

`tssp build --dev` is run through the `tssp:dev` script in package.json. Replace `{package-manager}` with the project's package manager (`bun` / `npm` / `pnpm` / `yarn`).

```bash
grep -rnE "\bany\b|@ts-(ignore|expect-error|nocheck)|^[[:space:]]*(export[[:space:]]+)?declare[[:space:]]|^[[:space:]]*///[[:space:]]*<reference" src/main/tssp/src/{機能名}/ --include='*.ts'
grep -rlE "^[[:space:]]*(declare[[:space:]]+global|///[[:space:]]*<reference)" src/main/tssp/src --include='*.ts'
find src/main/tssp -name '*.d.ts'
{package-manager} run tssp:dev
```

Run `validate-jssp-code.js` against the output only if the build succeeded (exit code 0). This script reads only `.js` / `.html` / `.sql` and cannot validate `.ts`.

```bash
node .agents/skills/tssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{機能名}/
```

If the build failed (non-zero exit code), the output does not reflect the current `.ts` files (nothing is written when type checking, lint, conversion, or conflict checking fails). In that case, do not run `validate-jssp-code.js` (it would validate the output of the previous build) and record "Not run because the build failed". If the build failure is caused by `.ts` files outside the target feature, record that as well.

If errors or warnings are output, record them as-is and report along with the Step 2 review results. This skill does not modify code.

- If `find` outputs any `.d.ts` files, check their contents. Record any global `declare`, or any `interface` added to a d.ts type (a way of adding methods that do not exist in the d.ts, such as `interface Logger { fakeMethod(): void }`; the grep does not catch this) as a finding of bypassing type checking, even if it is outside the feature directory. Platform d.ts files are in `d.ts/` (directly under the project) and are not placed under `src/main/tssp`. If a `.d.ts` other than `d.ts/` is added to `include` in `tsconfig.json` at the root or in `src/main/tssp/`, it does not appear in `find`, but record it as the same kind of bypass
- Record grep hits as findings even if `tssp build` succeeded (if there are no hits, nothing is output and the exit code is 1). Exclude matches in non-code places, such as the English word "any" in comments or string literals
- A `/// <reference` found by the first grep also brings `.d.ts` files outside `src/main/tssp` (places that `find` does not cover) into type checking, so record it as bypassing type checking. The second grep searches all of `src/main/tssp/src` for `declare global`. `declare global` also affects type checking of `.ts` files outside the file that declares it, so record it as bypassing type checking even in files outside the target feature
- The `file:line` in `validate-jssp-code.js` findings is a position in the output `.js` and its lines are offset from the `.ts`. Search the `.ts` files in `src/main/tssp/src` by the code fragment in the finding (function name, variable name) and record the `.ts` file and line. `tssp build` copies `.html` as-is, so record the same path and line under `src/main/tssp/src`
- Findings for code that is not written in the `.ts` are caused by how the `.ts` is written. Findings for `var` (`JSSP-JS-002`) occur not only for what is written in the `.ts`, but also for temporary variables and helper functions that tssp inserts into the output when converting `?.` / `??` (when the left side is not a variable) and object spread / rest. Findings for `includes()` (`JSSP-JS-009`) also occur in the helper function inserted when converting object rest (see 2-6)

---

### Step 2: LLM Review of Items That Cannot Be Detected by Script

Read the code to verify the following items.

#### 2-1. Naming Conventions

- [ ] Are file names in snake_case? (`user_master.ts`)
- [ ] Are function names and variable names in camelCase? (`getUserInfo`)
- [ ] Are constants in UPPER_SNAKE_CASE? (`MAX_RETRY_COUNT`)
- [ ] Are abbreviations avoided? (`btn` → `button`, `msg` → `message`, etc.)
- [ ] Do bind variables have the `$` prefix? (`$data`, `$title`, etc.)

#### 2-2. Bind Variables

- [ ] Are bind variables declared with a top-level `export let`, as in `export let $data = ...`?
- [ ] Are bind variables stringified with `JSON.stringify()`?
- [ ] After `JSON.stringify()`, is `.replace(/\//g, '\\/') ` used for escaping?
- [ ] Is the object put into a variable before being passed to `JSON.stringify()`, and is `$data = JSON.stringify(<variable>).replace(/\//g, '\\/');` written on a single line? (If an object literal is passed directly and it has two or more properties (including the inner part of nesting, as in `{ list: [{ a: 1, b: 2 }] }`), it is formatted across multiple lines in the output and results in `JSSP-JS-020`)
- [ ] In the presentation page, are they received using the IIFE form `(function($data) { ... })(<imart ...>);`, avoiding `$data` as a global variable?

#### 2-3. Error Handling

- [ ] Are errors caught with `try-catch`?
- [ ] For non-recoverable errors, is `Transfer.toErrorPage()` used to navigate to an error screen?
- [ ] For recoverable errors, are they stored in the `error` property of bind variables?
- [ ] Are error details output to logs (`Logger.getLogger().error()`)?
- [ ] Are user-facing messages generalized (not containing internal information)?

#### 2-4. Structure and Design

- [ ] Is the `init()` function implemented as the entry point in the form `export function init(request: Request): void`?
- [ ] Does each function have a single responsibility (not mixing multiple processes)?
- [ ] Is each function within 50 lines (splitting is needed if exceeded)?
- [ ] Is nesting within 4 levels?
- [ ] Is data passed to the presentation page via `$data`?
- [ ] Are `.ts` and `.html` files placed in `src/main/tssp/src`, with each paired `.ts` and `.html` in the same directory under the same name? Are hand-written `.js` / `.html` files not placed in `src/main/jssp/src` (the output destination of `tssp build`)? (Only 2WaySQL `.sql` files are placed in `src/main/jssp/src/{feature name}/sql/`.) A `.js` / `.html` file not listed in `.accel/tssp-generated.txt` (the list of files written by tssp) is a hand-written file

#### 2-5. Performance and Other

- [ ] Is `new Packages.***` (direct instantiation of Java classes) being used?
- [ ] Are there unnecessary loops or duplicate queries?

#### 2-6. TypeScript (Types, Declarations, import)

- [ ] Is `var` not used? (Use `let`. `const` may be used because tssp converts it to `let`)
- [ ] Is type checking not bypassed with `any` / `as any` / `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` / a custom `declare`? (`e` in `catch (e)` is `unknown`, so write `(e as Error).message`) Are values that do not match the d.ts types not passed through by a double cast `as unknown as X`, which the Step 1 grep does not catch?
- [ ] Are the shapes of values received from the request, responses (objects put in `$data`, API responses), and DB records defined with an `interface`, and is that type attached to variables, parameters, and return values? (Example: `UserForm`, `ViewResponse { result: UserForm | null; error: { code: string; message: string } }`)
- [ ] Are types written for function parameters and return values? (Functions other than `init` also receive `request: Request` and declare a return type, as in `function main(request: Request): ViewResponse`. A function that only throws uses `: never`)
- [ ] Is the API being called as defined in d.ts (not used by guesswork)? Read the d.ts of the APIs being used and check against the signatures. For variables that handle API parameters and return values, are the d.ts types (`JobResult`, `Transfer.TransferParam`, `DatabaseResult`, etc.) used, rather than redefining types that exist in the d.ts with a custom `interface`?
- [ ] Are the method names of `request` checked against the d.ts (`d.ts/platform/standard/im-ssjs-request.d.ts`)? `Request` has an index signature (`[key: string]: Request.Attribute`; `Request.Attribute` is `any`), so even a method name not in the d.ts, such as `request.getParamterValue()`, passes type checking. Is a URL parameter read with `request.xxx` (`any`) put into a typed `interface` or a `string` variable before use?
- [ ] Are constant objects declared with `declare const` in `d.ts/workflow/enum/` (`NodeType`, `ProcessType`, `TaskStatus`, `MatterStatus`, etc.) not referenced as values in expressions (such as `node.nodeType === NodeType.nodeTyp_Apply`)? This passes type checking, Rhino lint, and `validate-jssp-code.js` and remains as-is in the output `.js`, but the SSJS runtime does not have these objects, so a ReferenceError occurs at runtime. Write the constant value (a string literal) directly, and write names such as `NodeType` only inside type annotations (`typeof NodeType.nodeTyp_Apply`)
- [ ] Are things that exist in the types of the tsconfig `lib` (ES2015 by default) but are not used in SSJS, such as `Proxy` and `Reflect` (not available in Rhino, causing a ReferenceError at runtime) and `Promise` (server-side processing is synchronous only, so do not use it), not used? (All of them pass type checking, Rhino lint, and `validate-jssp-code.js`)
- [ ] When functions or constants of a common module are `import`ed, is the same module also loaded with `load('...')`? (`import` is removed from the output, so without `load()` the type checking and lint pass, but the name is not defined in the output `.js`.) Is an `import` that reads only types written as `import type`?
- [ ] Are arrow functions, template literals, destructuring, object spread / rest, and `?.` / `??` not used? (Write with `function`, concatenation with `+`, explicit `null` comparisons, and property assignment. tssp accepts these, but depending on how they are written, helper functions or `var` are inserted into the output, or they are output as-is, resulting in `validate-jssp-code.js` findings in Step 1 (`JSSP-JS-002` / `007` / `009` / `012` / `013`, etc.))

#### 2-7. Job Scripts (job directory only)

Check only when .ts files under the job directory are included in the targets.

- [ ] Is the `execute()` function implemented as the entry point in the form `export function execute()` (not `init()`)?
- [ ] Is the type of the return value the d.ts `JobResult` (`status: 'success' | 'warning' | 'error'`, `message: string`)? (Not a custom type or `Object`)
- [ ] Does `message` not contain confidential information (since it is recorded in the monitoring table)?
- [ ] Are job start and end logged?
- [ ] Is `status: 'error'` returned on error (do not use `Transfer.toErrorPage()`)?

#### 2-8. Workflow Out-of-Screen Processing

Check only when `.ts` files under `workflow/` with **no matching `.html` file** and **outside `workflow/rule/`** are included in the targets (screen files and rule definitions are excluded).

- [ ] Are the start and end of processing logged?

---

## Output Format

```
## Review Results: {target path}

### Step 1: Auto Validation Results

- tssp build: {Success / Failure (on failure, record the output as-is)}
- grep for bypassing type checking and search for `.d.ts`: {Hits and output as-is / No hits}
- validate-jssp-code.js: {Output as-is / Not run because the build failed}

### Step 2: LLM Review Results

| Type | File | Line | Content | Severity |
|------|---------|-----|------|--------|
| Naming convention | user_edit.ts | 12 | Using abbreviated variable name `btn` | Medium |
| Error handling | user_edit.ts | 78 | Transfer.toErrorPage() not used | High |
| Structure | user_list.ts | - | init() exceeds 80 lines | Medium |
| Type | user_edit.ts | 34 | A value that does not match the d.ts type is passed through with `as unknown as UserForm` | High |

### Improvement Suggestions

1. ...
2. ...
```

If no problems are found, report "No problems detected."
