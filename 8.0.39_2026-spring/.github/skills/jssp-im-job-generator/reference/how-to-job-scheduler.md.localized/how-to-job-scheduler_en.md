---
paths:
  - "src/main/jssp/**/job/**/*.js"
---

# Job Scheduler Conventions

## Overview

The job scheduler is a feature for running batch processes and scheduled executions.
When implementing job programs in the script development model, a different entry point (`execute` function) is used compared to screen processing.

**Characteristics**:
- No presentation page (.html) is required since there is no screen navigation
- The entry point is **`execute()`**, not `init()`
- Parameters are passed as strings
- Execution results are returned as a status object

## Implementing the execute Function

### Basic Structure

```javascript
/**
 * Job execution entry point
 *
 * @param {string} params - Job parameters (string format)
 * @return {Object} Execution result object (JobResult object)
 */
function execute(params) {
  let logger = Logger.getLogger();
  let result = {
    status: 'success',
    message: ''
  };

  try {
    logger.info('Job started: daily_report');

    let config = parseParams(params);
    let processResult = processBusinessLogic(config);

    result.message = 'Processed count: ' + processResult.count;
    logger.info('Job completed successfully: {}', result.message);

  } catch (e) {
    result.status = 'error';
    result.message = 'Job execution error: ' + e.message;
    logger.error('Job ended abnormally: {}', e.message);
  }

  return result;
}

/**
 * Parameter parsing and validation
 */
function parseParams(params) {
  let logger = Logger.getLogger();

  if (!params || params === '') {
    return { targetDate: getCurrentDate() };
  }

  try {
    return JSON.parse(params);
  } catch (e) {
    logger.warn('Failed to parse parameters, using default values');
    return { targetDate: getCurrentDate() };
  }
}
```

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

### JSON Format (Recommended)

```javascript
// Parameter example: {"targetDate":"2026-01-15","mode":"full","maxRecords":1000}

function execute(params) {
  let config = JSON.parse(params);
  let targetDate = config.targetDate;
  let mode = config.mode;
  let maxRecords = config.maxRecords;
}
```

### Guidelines

| Item | Recommendation |
|------|----------|
| Format | Use JSON format for multiple parameters |
| Required/Optional | Set default values so the job can run without parameters |
| Sensitive Information | Do **not** include passwords, tokens, etc. |
| Validation | Implement fallback processing for parse failures |

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
| Parameters | Parameters passed to the job | `{"mode":"full"}` |

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
