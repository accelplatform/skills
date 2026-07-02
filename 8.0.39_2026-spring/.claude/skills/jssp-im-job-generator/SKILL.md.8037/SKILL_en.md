---
name: jssp-im-job-generator
description: Generates new job programs (batch processing) for the intra-mart job scheduler. Provides implementation patterns for the execute() entry point, parameter retrieval, transaction management, and JobResult return values. Use when mentioned creating batch processing, making a job, scheduled execution, nightly batch, or schedule execution. Use this skill for server-side periodic or bulk processing without screens. Use jssp-im-workflow-usage for workflow action processing and case processing. Use jssp-page-generator for server-side processing with screens (init function).
allowed-tools: Bash, Read, Write, Glob
---

# Job Scheduler Job Program Generation Skill

## Purpose

A skill set for generating new job programs to be executed by the intra-mart Accel Platform job scheduler.
Explains the procedures for creating and structuring batch processing programs according to templates and conventions.

## Conventions to Reference

This skill generates batch processing (`.js` only; no screen). See `.claude/rules/README.md` for the full picture.

| Convention | Handling |
|------------|----------|
| `jssp-function-container.md` | 🟢 **Required** — structure of the `execute()` entry point |
| `jssp-error-handling.md` / `jssp-logging.md` | 🟢 **Required** — batches typically need detailed logging and error handling |
| `jssp-naming.md` / `jssp-code-style.md` / `jssp-file-structure.md` | 🟢 Required |
| `jssp-2way-sql.md` | 🟡 **Only when the batch performs DB operations** (very common in batches) |
| `jssp-security.md` | 🟡 Only when handling external input such as job parameters |
| `jssp-presentation-page.md` / `jssp-accessibility.md` | 🔴 **Not needed; no screen is involved** |

## Generation Targets

- **Job program** (.js) — Batch processing executed by schedule or manually. No screen.

## Template References

- `assets/simple-job.md` — Job program implementation example (transaction management and parameter retrieval patterns)
- `reference/how-to-job-scheduler.md` — Job scheduler conventions, parameter design, registration procedures, and how to execute from a program

## When to Use

When the user makes requests such as:
- "Create batch processing"
- "Implement a job program"
- "Add periodic execution processing"
- "Create a job for the job scheduler"
- "Create a nightly batch"

## Implementation Steps

1. Gather requirements from the user (processing content, parameters, execution timing)
2. Refer to `assets/simple-job.md` to generate the job program
3. Confirm file placement location (under `src/main/jssp/src/{feature-name}/job/`)
4. Guide the user through job registration procedures in `reference/how-to-job-scheduler.md` if needed

## Basic Job Program Rules

### Entry Point

- The entry point for a job is the **`execute()`** function (not `init()` which is used for screen processing)
- Presentation page (.html) is **not needed**

### Parameter Retrieval

Job parameters are declared with the **`@parameter` JSDoc annotation** at the top of the function, and retrieved **individually by key** via `Contexts.getJobSchedulerContext().getParameter()`. `execute()` **takes no arguments**.

```javascript
/**
 * @parameter message world!
 */
function execute() {
  let context = Contexts.getJobSchedulerContext();
  let message = context.getParameter('message');
  // ...
}
```

- Declare each parameter the job receives in the form `@parameter <name> <defaultValue>`
- Retrieve the declared value **as a string** with `getParameter('<name>')` (`null` when not set)
- For multiple parameters, write multiple `@parameter` lines and retrieve each with `getParameter()`
- ⚠️ Receiving via an argument like `function execute(params)` and calling `JSON.parse()` is **incorrect**. Do not use it
- ⚠️ **Do not write the literal string `@parameter` inside the prose of a JSDoc comment.** The job scheduler's parser detects `@parameter` even mid-line and mistakenly declares the word that follows as a parameter name (e.g. writing "declare with `@parameter`" creates a parameter literally named "with"). Reword such explanations using a term like "annotation" instead

### Return Value

`execute()` returns an object (`JobResult` type) in the following format:

| Property | Type | Description |
|----------|------|-------------|
| status | String | One of `'success'` / `'error'` / `'warning'` |
| message | String | Execution result message (displayed on the job monitoring screen) |

- If `status` is `'error'`, the job net is treated as abnormally terminated
- `message` must **not contain confidential information** (since it is recorded in the monitoring table)

### Transaction Management

- Job programs **perform transaction management using `Transaction.begin()`**
- On error, roll back with `Transaction.rollback()`
- Unlike workflow action processing, DB transactions can be used

## Notes

- Refer to the reference directory under jssp-page-generator for details on coding conventions
- Customize templates as needed
- If `TODO` is written in a reference, implement according to those instructions
- Job nets support **only sequential execution** as standard (branching and parallel processing are not possible)
- Jobs are not executed via HTTP, so `Web.getRequest` and `HTTPResponse` cannot be used

## Post-Generation Mandatory Verification (Auto-Execute)

**After code generation is complete, before reporting to the user**, execute the following verifications in order.
Perform this verification automatically without asking for user confirmation, and fix any issues before reporting.

### Step 1: Auto Validation Script

Run `validate-jssp-code.js` against the generated files. **Repeat fixes until the error count reaches 0.**

```bash
node .claude/skills/jssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{feature-name}/
```

### Step 2: Manual Check

Execute steps 1–3 in `.claude/skills/jssp-page-generator/reference/post-generation-verification.md` (step 4 screen verification is not needed for jobs).

### Step 3: Code Review and Security Check (Auto-Execute)

After Steps 1–2 are complete, execute the following 2 skills **only if available**, in order.
Skip if a skill does not exist. Complete before reporting to the user.

1. Run `jssp-code-review` skill if available
2. Run `jssp-security-check` skill if available

#### Handling JSSP-JS-022 Warnings

If the auto validation script (Step 1) produces a warning like:

```
WARN [JSSP-JS-022] xxx.js:NN  possibility of passing null
```

**Open the corresponding SQL file and confirm whether the parameter is wrapped in `/*IF param != null*/.../*END*/`.**

- Wrapped → No problem (false positive). Note "SQL-side /*IF*/ guard confirmed" in the review report.
- Not wrapped → Fix to an empty string fallback such as `DbParameter.string(x || '')`.
