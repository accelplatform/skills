---
name: tssp-usage
description: A skill set for writing intra-mart SSJS in TypeScript and developing by converting it with the tssp CLI into JSSP for Rhino 1.7.15.1. Covers where to put `.ts` and `.html` (`src/main/tssp/src`) and the output destination (`src/main/jssp/src`), the processing order and exit codes of `tssp build`, writing conventions such as `export let $data` and `import type`, type checking with d.ts, what the 17 Rhino lint rules forbid and what to write instead, how to resolve conflicts using `.accel/tssp-generated.txt`, and debugging with source maps. Use when the user mentions wanting to write SSJS/JSSP in TypeScript, running tssp build, fixing tssp build errors or type errors, fixing Rhino lint violations, where to put .ts and .html, resolving .accel/tssp-generated.txt conflicts, or debugging with source maps. For generating screens and APIs themselves, use tssp-page-generator.
---

■■ Required Rules Checklist (Mandatory) ■■

Confirm the following before starting implementation. Do not proceed if any item is unchecked.

- [ ] [tssp-typescript](../../requirements/tssp-typescript/AGENTS.md) has been read and understood


# tssp Usage Support Skill

tssp is a CLI that converts intra-mart SSJS (server-side JavaScript) written in TypeScript into JSSP JavaScript that Rhino 1.7.15.1 (intra-mart's SSJS execution engine) can run. Work proceeds in the following order.

1. Read the d.ts (the API type definitions) of the APIs you use and note the signatures ("Type Checking")
2. Write `.ts` and `.html` under `src/main/tssp/src` ("Placement", "Writing Conventions", "Rhino Constraints")
3. Run the `tssp:dev` script in package.json and bring type errors and lint violations to 0 ("Build")

For the steps to generate screens and APIs, use tssp-page-generator; for verification after generation, use tssp-page-verifier.

## Placement

| What to place | Where |
|---|---|
| `.ts` (function container) and `.html` (presentation page) | Under `src/main/tssp/src`. Place a paired `.ts` and `.html` in the same directory with the same name |
| tssp output (`.js`, `.html`, and `.js.map` with `--dev`) | Under `src/main/jssp/src`. tssp writes it, so do not create or edit it by hand |

tssp preserves the directory structure in its output. `.ts` is converted to `.js`, and `.html` is copied as is.

| Input | Output |
|---|---|
| `src/main/tssp/src/sample/view/list.ts` | `src/main/jssp/src/sample/view/list.js` |
| `src/main/tssp/src/sample/view/list.html` | `src/main/jssp/src/sample/view/list.html` |

- Files other than `.ts` and `.html` (`.d.ts`, `.css`, `.js`, etc.) are not output
- 2WaySQL templates (`.sql`) are not output, so place them directly in `src/main/jssp/src/{feature-name}/sql/`, the same as in JSSP. The only files you place by hand in the output destination are those that `tssp build` does not output (these `.sql` files, the extended import `*_import.js` for tenant environment setup, and `source-config.xml`)
- `.html` is written the same way as in JSSP

## Build

tssp is included in the devDependencies of package.json (`@intra-mart/tssp`). Run the following scripts, defined under `scripts` in package.json, from the project root with the project's package manager (`bun run tssp:dev`, `npm run tssp:dev`, `pnpm run tssp:dev`, `yarn run tssp:dev`). For node, use the 20 series at 20.19 or later, or 22.12 or later.

| Script | Command executed | Output from `.ts` | Purpose |
|---|---|---|---|
| `tssp:dev` | `tssp build --dev` | `.js` (not minified) and `.js.map` | Checking during development, debugging |
| `tssp:build` | `tssp build` (same as `--production`) | Minified `.js`. No source map is output | Production |

- To add options, write them after the script name (`bun run tssp:build --locale ja`). Only npm requires `--` in between (`npm run tssp:build -- --locale ja`)
- Both copy `.html`. `--dev` and `--production` cannot be specified together
- Even when minified, top-level names (`init`, `$data`, etc.) and comments containing `@parameter` remain
- The language of messages follows the locale of the runtime environment; `--locale ja|en|zh_CN` selects it (unsupported languages fall back to en). tsc diagnostics and oxlint's own output, such as rule names and file positions, do not depend on `--locale`

Processing proceeds in the following order. If any step from type checking through conflict checking fails, it exits without writing anything.

1. Type checking. Reads the tsconfig and checks with `target` overridden to ES5
2. Lint. Checks for constructs Rhino does not accept
3. Conversion. Turns `.ts` into JavaScript and loads `.html`
4. Conflict checking
5. Writing

If `--tsconfig` is omitted, the first tsconfig found in the following order is used. If the file specified with `--tsconfig` does not exist, it exits with exit code 2 without looking for other candidates.

1. `tsconfig.json` at the project root
2. `src/main/tssp/tsconfig.json`
3. `tsconfig.default.json` bundled with tssp. It has `strict: true` and `lib: ["ES2015"]`, and its include is `src/main/tssp/src` and `d.ts/**/*.d.ts`

When you place a `tsconfig.json` at the root or `src/main/tssp/tsconfig.json`, write the same `lib: ["ES2015"]` as the bundled default. If you omit `lib`, DOM types are included and conflict with `Request`, `File`, `URL`, `Storage`, `Cache`, etc. in the d.ts, resulting in TS2300.

| Exit code | Meaning |
|---|---|
| 0 | Success |
| 1 | Type error, lint violation, conversion failure, conflict, I/O error |
| 2 | Invalid arguments, the `--src` directory or `--tsconfig` file does not exist, a `.ts` in `src/main/tssp/src` is not covered by the tsconfig |

## Writing Conventions

```typescript
// src/main/tssp/src/sample/view/model.ts. Only types are placed here
export interface Item {
  id: string;
  label: string;
}
```

```typescript
// src/main/tssp/src/sample/view/list.ts
import type { Item } from './model';

// Bind variables referenced from list.html
export let $title = '一覧';
export let $data = '{}';

export function init(request: Request): void {
  const keyword = request.getParameterValue('keyword') || '';
  const items: Item[] = [{ id: '1', label: keyword }];
  // Replace '/' with '\/' so that a </script> inside the JSON does not terminate the script
  $data = JSON.stringify({ list: items }).replace(/\//g, '\\/');
}
```

(The string `'一覧'` in the example means "List".)

- Write bind variables as `export let $data = ...` and the entry point as `export function init(request: Request): void`. `export` is removed in the output
- `const` may be used. tssp converts it to `let`
- `import` statements disappear from the output. Read types from other `.ts` files with `import type`
- To use functions and constants of a common module (a `.ts` under `common/`) at runtime, load it with `load('sample/common/util');` as in JSSP (the argument is a path without extension from `src/main/jssp/src`; the top-level names of the loaded file enter the caller's scope). For type checking, also write `import { helper } from '../common/util';` (it disappears from the output). In the common module, write the referenced names with `export function` / `export let`
- Even if you import values such as functions or constants, they do not reach runtime. Type checking and lint pass, but in the output `.js` that name is not defined
- `export default`, `export =`, `import =`, `import()`, and `import.meta` cause lint errors
- `?.`, `??`, and object spread and rest (`{ ...o }`, `const { a, ...rest } = o`) are rewritten by tssp for Rhino (helper functions that use `var` are inserted into the output `.js`), while arrow functions, template literals, and destructuring remain in the output as they are. Do not use any of them in server-side code; as in JSSP, write with `function`, string concatenation with `+`, and property access. This is because `validate-jssp-code.js`, run against the build output (used by `tssp-page-verifier`), reports them as JSSP-JS-002 (`var`) / 007 (arrow function) / 012 (template literal). Forms that match the "Rhino Constraints" table (array rest elements `[a, ...b]`, computed keys, destructuring defaults, default parameters, destructuring in `catch` and rest parameters, rest parameters in arrow functions, `async`) stop the build at type checking or lint
- A `.ts` containing only types (such as `model.ts` in the example) also produces a `.js` with no executable statements

## Type Checking

Type checking is performed against the declarations in the `d.ts/**/*.d.ts` that the tsconfig includes and the declarations of the tsconfig's `lib` (ES2015 in the bundled default). Using a global that is in neither, or a method not declared on a type, stops with a type error. The exceptions are values of type `any` and types with an index signature (`[key: string]: ...`), where reading a property whose name is not in the declaration passes type checking. Things that are in `lib` but not in Rhino (e.g. `Proxy`, `Reflect`) pass type checking and lint and cause a ReferenceError at runtime, so do not use them.

```
src/main/tssp/src/a.ts(1,21): error TS2551: Property 'getLoggr' does not exist on type 'typeof Logger'. Did you mean 'getLogger'?
type errors found; nothing was converted
```

Before implementing, do the following 3 steps.

1. List the APIs you use (classes, global functions, objects)
2. Read the relevant d.ts. If you do not know where it is, search for the declaration, for example `grep -rnwE "(class|interface|type|namespace|function|const) Logger" d.ts/`
3. Note the argument and return types before writing. For methods whose return value can be `null`, handle the `null` case

| Directory | Contents |
|---|---|
| `d.ts/platform/` | Platform standard APIs. `Request` is in `d.ts/platform/standard/im-ssjs-request.d.ts` |
| `d.ts/tenant/` | Tenant management APIs |
| `d.ts/master/` | IM-Common Master APIs |
| `d.ts/workflow/` | IM-Workflow APIs. Only for projects that include IM-Workflow |
| `d.ts/bpm/` | IM-BPM APIs. Only for projects that include IM-BPM |

- `Request` has `[key: string]: Request.Attribute` (`Request.Attribute` is `any`) so that URL arguments can be read as properties. `request.xxx` passes type checking even if the name is not in the d.ts, and even when called as a method, so confirm method names in the d.ts
- Do not bypass type checking with `any`, `as any`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, or your own `declare`. Do not use an API you cannot find in the d.ts; report it to the user
- tssp overrides the type-checking `types` to empty. Node.js names such as `process` and `require` cannot be used (TS2591)
- The type-checking `target` is ES5, so iterating a `Set` or `Map` with `for...of` causes TS2802. Iterate with `forEach`. Arrays can be iterated with `for...of`. With a tsconfig whose `lib` is only ES5, using `Set`, `Map`, `Promise`, or `Symbol` as a value causes TS2583 / TS2585

## Rhino Constraints

Lint has 17 rules and detects constructs that Rhino 1.7.15.1 does not accept, and constructs whose meaning changes without an error. Only `no-loop-closure-capture` is a warning; the rest are errors. tssp treats warnings as violations too, and a hit on any rule stops the build with exit code 1. The inside of `.d.ts` and `declare` is not checked.

```
src/main/tssp/src/a.ts:1:17: error rhino(no-default-param): Default parameters are a syntax error in Rhino 1.7.15.1
lint violations found; nothing was converted
```

| Rule | Forbidden construct | What to write instead |
|---|---|---|
| `no-array-rest-pattern` | Rest element in array destructuring (`const [a, ...b] = xs`) | `xs[0]` and `xs.slice(1)` |
| `no-arrow-rest` | Rest parameter in an arrow function (`(...xs) => xs`) | `function (...xs: number[]) { ... }` |
| `no-async` | `async` functions, arrow functions, and methods | Write synchronous functions |
| `no-catch-destructuring` | Destructuring in `catch` (`catch ({ message })`) | Receive with `catch (e)` and read `(e as Error).message` |
| `no-class` | `class`, access modifiers on constructor parameters (`private p`, etc.) | Describe the type with `interface` and create the object with a function that returns it |
| `no-computed-key` | Computed keys in object literals and destructuring (`{ [k]: v }`) | Create it with a type, as in `const o: Record<string, number> = {};`, then `o[k] = v`. To read, use `o[k]` |
| `no-default-param` | Default parameters (`function f(a = 1)`) | Make it `a?: number` and use `a === undefined ? 1 : a` in the body |
| `no-destructuring-default` | Default values in destructuring (`const { a = 1 } = o`) | `const a = o.a === undefined ? 1 : o.a;` |
| `no-generator-method` | Generator methods in objects (`{ *m() {} }`) | `m: function* () {}` or a `function*` declaration |
| `no-helper-name` | Declaring at top level a name identical to a helper function the conversion uses (`ownKeys`, `defineProperty`, `toPropertyKey`, `toPrimitive`, `typeof`, `objectSpread`, `objectWithoutProperties`, `objectWithoutPropertiesLoose`, `usingCtx`; including those with a leading `_` and a trailing digit) | Use a different name. Names declared inside a function are not covered |
| `no-loop-closure-capture` (warning) | Referencing, in a closure inside the loop, a variable declared with `let` / `const` in the head of `for` / `for...in` / `for...of`. In Rhino all iterations share the same variable | Redeclare it in the loop body as `const j = i;` and reference `j`. Callbacks passed directly to `forEach`, `map`, etc. are not covered |
| `no-module-runtime` | `export default`, `export =`, `import =`, `import()`, `import.meta` | Named `export` and `import type` |
| `no-namespace-value` | `export const` / `export let` / `export var` inside a `namespace` | Place values outside the `namespace`. `export function` and types inside a `namespace` can be used |
| `no-new-target` | `new.target` | Do not use it |
| `no-rest-destructuring` | Destructuring of a rest parameter (`function f(...[a, b])`) | Receive with `function f(...args: number[])` and read `args[0]`, `args[1]` in the body |
| `no-spread-call-array` | Spread in calls, `new`, and array literals (`f(...xs)`, `[...xs]`) | `f.apply(null, xs)` (for methods, `o.m.apply(o, xs)`), `xs.concat(ys)`, `xs.slice()` |
| `no-unsupported-regexp` | Named groups in regular expression literals (`(?<y>...)`, `\k<y>`), lookbehind (`(?<=...)`, `(?<!...)`), modifier groups (`(?i:...)`), flags other than `g` `i` `m` `s` `y` (`u`, `d`, `v`) | Match with numbered groups `(...)` including the surrounding characters, and extract with `m[1]` and so on. Use only the flags `g` `i` `m` in regular expression literals. `s` and `y` pass lint but type checking stops with TS1501, so write `new RegExp('a.b', 's')` |

`no-unsupported-regexp` checks only regular expression literals. Named groups, lookbehind, modifier groups, and the `u` `d` `v` flags pass the build when given to `new RegExp(...)`, but cause a SyntaxError at runtime. `s` and `y` pass type checking when given to `new RegExp(...)` and also work in Rhino. Regular expression literals with named groups or the `u` `d` `v` flags are stopped by type checking with TS1503 / TS1501, before lint. tssp overrides `target` to ES5, so raising `target` in the tsconfig does not fix it.

## Conflicts

tssp records the files it has written in `.accel/tssp-generated.txt`. This list is placed in the directory where the command was run (the project root), with one relative path from there per line.

If a file or directory not in the list already exists at a path it is about to write, that is a conflict. tssp prints the conflicting paths, exits with exit code 1, and writes nothing.

```
these output paths already exist and are not in the generated-file list (.accel/tssp-generated.txt); nothing was written:
  src/main/jssp/src/sample/view/list.js
```

Fix it in one of the following ways.

1. If the file is tssp output, delete it and rerun
2. If it is a handwritten file, rename the corresponding `.ts` or `.html`

- When there is no list, every existing file and directory at a path it is about to write is a conflict. Files that do not overlap with the planned paths do not conflict. When introducing tssp to an existing project, delete the tssp-generated files in the output destination before the first build
- For an output that is in the list, deleting the original `.ts` or `.html` causes it to be deleted in the next successful build. Files not in the list are not deleted
- If an I/O error occurs partway through writing or deleting, the writes and deletions done so far are not rolled back. Fix the cause and rerun the same command. If the list could not be saved, delete the tssp-generated files in the output destination and start over

## Debugging

1. Make sure the output destination path contains a directory named `jssp`. The default output destination `src/main/jssp/src` satisfies this. When changing the output destination with `--out`, also include `jssp` in the path. If you build with a changed `--out`, the previous output listed in `.accel/tssp-generated.txt` is deleted, including that in the default output destination. To restore, rebuild without `--out`
2. Convert with the `tssp:dev` script. A `.js.map` is output in the same directory as the `.js`
3. Set breakpoints in the original `.ts` in the debugger

When a build without `--dev` succeeds, the `.js.map` output by the previous `--dev` build is deleted.
