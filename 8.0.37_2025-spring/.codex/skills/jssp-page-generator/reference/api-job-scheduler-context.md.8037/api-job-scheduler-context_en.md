# JobSchedulerContext API Reference

## Overview

JobSchedulerContext is an access context available when a job is executed by the job scheduler.
It stores all information about jobnet execution.

### How to Retrieve

```javascript
let jobSchedulerContext = Contexts.getJobSchedulerContext();
```

## Property List

| Property | Type | Description |
|-----------|------|------|
| fireDate | Date | Execution date and time |
| jobDetail | JobDetail | Job information object |
| jobnet | Jobnet | Jobnet information object |
| mergedParameters | Object | Parameters merged from job, jobnet, trigger, and runtime parameters in priority order |
| monitorId | String | Monitor ID |
| nextFireDate | Date | Next execution date and time |
| parameters | Object | Parameters added during execution (does not include job settings values) |
| previousFireDate | Date | Previous execution date and time |
| taskId | String | Task ID |
| trigger | Trigger | Trigger information object |

## Method List

| Method | Return Value | Description |
|---------|--------|------|
| getMergedParameters() | Object | Retrieve all parameters merged in priority order |
| getParameter(key) | String | Retrieve a parameter for the specified key in priority order |
| putParameter(key, value) | void | Add to runtime parameters |
| putParameters(parameters) | void | Add multiple entries to runtime parameters at once |

### Parameter Priority

Parameters are resolved in the following priority order (highest at top):

1. Parameters added during execution
2. Trigger parameters
3. Jobnet parameters
4. Job parameters

## Method Details

### getParameter(key)

Retrieves the parameter for the specified key according to priority.

| Parameter | Type | Description |
|-----------|------|------|
| key | String | Parameter key |

**Return Value**: String - Parameter value

### putParameter(key, value)

Adds the specified parameter to runtime parameters. Added parameters are returned preferentially by `getParameter()`.

| Parameter | Type | Description |
|-----------|------|------|
| key | String | Parameter key |
| value | String | Parameter value |

### putParameters(parameters)

Adds multiple parameters to runtime parameters at once.

| Parameter | Type | Description |
|-----------|------|------|
| parameters | Object | Parameter object (keys and values must be strings) |

## Related Objects

### JobDetail

Stores detailed information about the job definition.

| Property | Type | Description |
|-----------|------|------|
| id | String | Job ID |
| categoryId | String | Job category ID |
| jobType | String | Job execution language (`JAVA` or `SCRIPT`) |
| localizes | Object | Internationalization information (name, description by locale) |
| parameters | Object | Job parameters |

### Jobnet

Stores jobnet information.

| Property | Type | Description |
|-----------|------|------|
| id | String | Jobnet ID |
| categoryId | String | Jobnet category ID |
| disallowConcurrent | Boolean | `true` if concurrent execution is not allowed |
| jobIds | Array(String) | Array of jobs to execute (in execution order) |
| useJobIds | Array(String) | Array of job IDs used in the jobnet |
| localizes | Object | Internationalization information (name, description by locale) |
| parameters | Object | Jobnet parameters |

### Trigger

Trigger information object. Divided into the following 3 types based on trigger type:

- **DatetimeTrigger** - Date/time specified trigger
- **RepeatTrigger** - Repeat specified trigger
- **BusinessDayTrigger** - Business day specified trigger

## Usage Examples

### Retrieving Parameters

```javascript
function init(request) {
  let context = Contexts.getJobSchedulerContext();

  // Retrieve parameter according to priority
  let value = context.getParameter('KEY');

  // Directly retrieve job setting parameters
  let jobParam = context.jobDetail.parameters.KEY;

  // Retrieve all merged parameters
  let allParams = context.getMergedParameters();
}
```

### Adding Runtime Parameters

```javascript
function init(request) {
  let context = Contexts.getJobSchedulerContext();

  // Add single parameter
  context.putParameter('resultKey', 'resultValue');

  // Add multiple parameters at once
  context.putParameters({
    'key1': 'value1',
    'key2': 'value2'
  });
}
```

### Retrieving Job Execution Information

```javascript
function init(request) {
  let context = Contexts.getJobSchedulerContext();

  let jobId = context.jobDetail.id;
  let jobnetId = context.jobnet.id;
  let monitorId = context.monitorId;
  let fireDate = context.fireDate;
  let nextFireDate = context.nextFireDate;
}
```