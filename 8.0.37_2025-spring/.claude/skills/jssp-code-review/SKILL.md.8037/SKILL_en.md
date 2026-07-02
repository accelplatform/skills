---
name: jssp-code-review
description: Quality review for intra-mart JSSP code. Comprehensively checks coding conventions (var prohibition, naming conventions, bind variables), security (SQL injection, XSS), error handling (forward, recovery), and structure (init function, responsibility separation). Use when mentioning code review, quality check, PR review, check code, or verify compliance with conventions.
allowed-tools: Bash, Read, Glob
---

# JSSP Code Review Skill

## Overview

Reviews code written in the intra-mart Accel Platform script development model (JSSP) and checks from the perspectives of quality, convention compliance, and security.

## Review Procedure

### Step 1: Run the Auto Validation Script

Run the following command to first identify problems that can be detected by the script.

```bash
node .claude/skills/jssp-page-generator/scripts/validate-jssp-code.js <output path>
```

If errors or warnings are output, record them as-is and report along with the Step 2 review results.

---

### Step 2: LLM Review of Items That Cannot Be Detected by Script

Read the code to verify the following items.

#### 2-1. Naming Conventions

- [ ] Are file names in snake_case? (`user_master.js`)
- [ ] Are function names and variable names in camelCase? (`getUserInfo`)
- [ ] Are constants in UPPER_SNAKE_CASE? (`MAX_RETRY_COUNT`)
- [ ] Are abbreviations avoided? (`btn` → `button`, `msg` → `message`, etc.)
- [ ] Do bind variables have the `$` prefix? (`$data`, `$title`, etc.)

#### 2-2. Bind Variables

- [ ] Are bind variables stringified with `JSON.stringify()`?
- [ ] After `JSON.stringify()`, is `.replace(/\//g, '\\/') ` used for escaping?
- [ ] In the presentation page, is the format `const $data = <imart ...>` used to receive them?

#### 2-3. Error Handling

- [ ] Are errors caught with `try-catch`?
- [ ] For non-recoverable errors, is `Transfer.toErrorPage()` used to navigate to an error screen?
- [ ] For recoverable errors, are they stored in the `error` property of bind variables?
- [ ] Are error details output to logs (`Logger.getLogger().error()`)?
- [ ] Are user-facing messages generalized (not containing internal information)?

#### 2-4. Structure and Design

- [ ] Is the `init()` function properly implemented (as the entry point)?
- [ ] Does each function have a single responsibility (not mixing multiple processes)?
- [ ] Is each function within 50 lines (splitting is needed if exceeded)?
- [ ] Is nesting within 4 levels?
- [ ] Is data passed to the presentation page via `$data`?

#### 2-5. Performance and Other

- [ ] Is `new Packages.***` (direct instantiation of Java classes) being used?
- [ ] Are there unnecessary loops or duplicate queries?
- [ ] Is the API being called as defined in d.ts (not used by guesswork)?

#### 2-6. Job Scripts (job directory only)

Check only when .js files under the job directory are included in the targets.

- [ ] Is the `execute()` function implemented as the entry point (not `init()`)?
- [ ] Is the return value in `{ status: 'success' | 'error' | 'warning', message: '...' }` format?
- [ ] Does `message` not contain confidential information (since it is recorded in the monitoring table)?
- [ ] Are job start and end logged?
- [ ] Is `status: 'error'` returned on error (do not use `Transfer.toErrorPage()`)?

#### 2-7. Workflow Out-of-Screen Processing

Check only when `.js` files under `workflow/` with **no matching `.html` file** and **outside `workflow/rule/`** are included in the targets (screen files and rule definitions are excluded).

- [ ] Are the start and end of processing logged?

---

## Output Format

```
## Review Results: {target path}

### Step 1: Auto Validation Script Results

{Script output as-is}

### Step 2: LLM Review Results

| Type | File | Line | Content | Severity |
|------|---------|-----|------|--------|
| Naming convention | user_edit.js | 12 | Using abbreviated variable name `btn` | Medium |
| Error handling | user_edit.js | 78 | Transfer.toErrorPage() not used | High |
| Structure | user_list.js | - | init() exceeds 80 lines | Medium |

### Improvement Suggestions

1. ...
2. ...
```

If no problems are found, report "No problems detected."
