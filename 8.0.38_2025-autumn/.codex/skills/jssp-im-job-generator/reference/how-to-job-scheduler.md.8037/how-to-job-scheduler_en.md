# Job Scheduler Conventions

## Overview

The job scheduler is a feature for running batch processes and scheduled executions.
When implementing job programs in the script development model, a different entry point (`execute` function) is used compared to screen processing.

**Characteristics**:
- No presentation page (.html) is required since there is no screen navigation
- The entry point is **`execute()`**, not `init()` (**it takes no arguments**)
- Parameters are declared with the `@parameter` annotation at the top of the function and retrieved via `Contexts.getJobSchedulerContext().getParameter()`
- Execution results are returned as a status object

## Implementing the execute Function

### Basic Structure

`execute()` **takes no arguments**. Declare the parameters you want to receive with the `@parameter` annotation at the top of the function, and retrieve them via `Contexts.getJobSchedulerContext().getParameter('<name>')`.

```javascript
/**
 * Job execution entry point
 *
 * @parameter targetDate
 * @return {Object} Execution result object (JobResult object)
 */
function execute() {
  let logger = Logger.getLogger();
  let result = {
    status: 'success',
    message: ''
  };

  try {
    logger.info('Job started: daily_report');

    let context = Contexts.getJobSchedulerContext();
    let targetDate = context.getParameter('targetDate') || getCurrentDate();

    let processResult = processBusinessLogic(targetDate);

    result.message = 'Processed count: ' + processResult.count;
    logger.info('Job completed successfully: {}', result.message);

  } catch (e) {
    result.status = 'error';
    result.message = 'Job execution error: ' + e.message;
    logger.error('Job ended abnormally: {}', e.message);
  }

  return result;
}
```

> ⚠️ Implementing it as `function execute(params)` and calling `JSON.parse()` on a string argument is **incorrect**. The job scheduler calls `execute()` with no arguments, so parameters must always be retrieved with `getParameter()`.

### Return Value Specification

| Property | Type | Description |
|-----------|------|------|
| status | string | One of `"success"`, `"error"`, `"warning"` |
| message | string | Execution result message (displayed on the job monitoring screen) |

```javascript
// Normal completion
return { status: 'success', message: '100 records processed' };

// Warning completion
return { status: 'warning', message: 'Processing complete (no target data)' };

// Error completion
return { status: 'error', message: 'Database connection error' };
```

**Notes**:
- When `status` is `"error"`, the jobnet is treated as an abnormal termination
- Since `message` is recorded in the monitoring table, **do not include sensitive information**

## Parameter Design

### Declaration with the `@parameter` Annotation

Declare the parameters the job receives with `@parameter` in the JSDoc comment immediately before `execute()`. Each declared parameter is retrieved **individually as a string** via `getParameter('<name>')`.

```javascript
/**
 * @parameter targetDate 2026-01-15
 * @parameter mode full
 * @parameter maxRecords 1000
 */
function execute() {
  let context = Contexts.getJobSchedulerContext();
  let targetDate = context.getParameter('targetDate');
  let mode = context.getParameter('mode');
  let maxRecords = parseInt(context.getParameter('maxRecords'), 10);
}
```

- The format is `@parameter <name> <defaultValue>` (the default value is optional)
- A declared parameter's default value can be overridden by the administrator at job registration time
- `getParameter()` always returns a **string**. Convert explicitly (e.g. `parseInt`) when a number or boolean is needed
- ⚠️ **Do not write the literal string `@parameter` inside prose.** The parser detects `@parameter` even mid-line and mistakenly declares the following word as a parameter name (e.g. "declare with `@parameter`" creates a parameter named "with"). Reword such explanations using a term like "annotation"

### Guidelines

| Item | Recommendation |
|------|----------|
| Declaration | Explicitly declare received parameters with `@parameter` |
| Required/Optional | Set default values so the job can run even when unset (`null`) |
| Type Conversion | `getParameter()` returns a string, so convert numbers etc. explicitly |
| Sensitive Information | Do **not** include passwords, tokens, etc. |

## Job Registration

Register from the tenant administrator screen:
1. Select **Job Scheduler** → **Jobs**
2. Click **Create New**
3. Configure the following items

| Item | Description | Example |
|------|------|-----|
| Job ID | Job identifier (arbitrary) | `BATCH_DAILY_REPORT` |
| Job Name | Display name | `Daily Report Generation` |
| Execution Program | Relative path from `src/main/jssp/src/` (without extension) | `sample/job/daily_report` |
| Parameters | Set a value for each parameter declared with `@parameter` in the program (the `@parameter` default value is shown initially) | `mode` = `full` |

## Jobnet Constraints

- Only **sequential execution** is supported in standard features (branching and parallel processing are not available)
- Each job runs in an independent transaction
- If a preceding job fails with an error, subsequent jobs will not be executed

## Triggering a Job from a Program

```javascript
function triggerJob() {
  let logger = Logger.getLogger();
  let jobId = 'BATCH_DAILY_REPORT';
  let params = JSON.stringify({
    targetDate: formatDate(new Date()),
    triggeredBy: 'manual'
  });

  try {
    let result = JobSchedulerManager.execute(jobId, params);

    if (result.error) {
      logger.error('Job launch failed: {}', result.errorMessage);
      return false;
    }

    logger.info('Job launched successfully: {}', jobId);
    return true;

  } catch (e) {
    logger.error('Error occurred during job execution: {}', e.message);
    return false;
  }
}
```
