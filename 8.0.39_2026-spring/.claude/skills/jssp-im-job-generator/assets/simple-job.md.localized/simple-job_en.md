# Job Scheduler Job Program Template

## Overview

A template for job programs executed by the job scheduler.
This is a batch-style process that has no screen and is executed on a schedule or manually.
The `execute()` function is called by the job scheduler.

## File Structure

```
src/main/jssp/src/{feature-name}/job/
  └── sample_job.js               # Job program
```

---

## Parameter Retrieval

Job parameters are retrieved from `Contexts.getJobSchedulerContext()`.

```javascript
let context = Contexts.getJobSchedulerContext();
let paramValue = context.getParameter('param-name');
```

## Return Value

| Property | Type | Description |
|-----------|------|------|
| status | String | One of `"success"` / `"error"` / `"warning"` |
| message | String | Execution result message (displayed on the job monitoring screen) |

---

## Job Program (sample_job.js)

```javascript
/**
 * Job Scheduler Job Program
 *
 * @file sample_job.js
 * @description Batch processing program executed by the job scheduler.
 */

// ========================================
// Entry Point
// ========================================
/**
 * Entry point for job execution.
 * Called by the job scheduler.
 *
 * @return {Object} Execution result object (JobResult object)
 */
function execute() {
  let logger = Logger.getLogger();
  logger.info('[SampleJob] Starting job.');

  let txResult = Transaction.begin(function() {
    try {
      processBusinessLogic();
    } catch (e) {
      logger.error('[SampleJob] An error occurred. error={}', e.message);
      Transaction.rollback();
      return false;
    }
  });

  if (txResult.error) {
    logger.error('[SampleJob] A transaction error occurred. error={}', txResult.errorMessage);
    return {
      status: 'error',
      message: 'An error occurred during job execution.'
    };
  }

  logger.info('[SampleJob] Job completed successfully.');
  return {
    status: 'success',
    message: 'Job completed successfully.'
  };
}

// ========================================
// Business Logic
// ========================================
/**
 * Executes the main business logic processing.
 */
function processBusinessLogic() {
  // Retrieve parameters
  let context = Contexts.getJobSchedulerContext();
  let targetDate = context.getParameter('target-date');

  // TODO: Implement your business logic here
  //
  // Available key parameters:
  //   context.getParameter('param-name')   - Parameters configured for the job
  //   context.getJobDetail()               - Job detail information
  //   context.getJobnet()                  - Jobnet information
  //   context.getTrigger()                 - Trigger information
}
```

---

## Available Templates

- **Job Program**: [assets/simple-job.md](assets/simple-job.md)
  - Batch processing executed by the job scheduler
  - Transaction management pattern using `Transaction.begin`
  - Parameter retrieval using `Contexts.getJobSchedulerContext()`
  - On error, rolls back and returns `status: "error"`

### Example Generation Instructions

When the user requests "create a batch process" or "implement a job program", use this assets code as a reference to generate an appropriately customized version.
