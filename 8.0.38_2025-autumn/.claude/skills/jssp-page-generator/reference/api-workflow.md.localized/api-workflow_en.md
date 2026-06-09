---
paths:
  - "src/main/jssp/**/*.js"
---

# Workflow Integration Guidelines

## Using the ApplyManager API

### Implementing Application Processing

```javascript
/**
 * Workflow application processing
 */
function applyWorkflow(applyData) {
  let logger = Logger.getLogger();

  try {
    // Create an instance of ApplyManager
    let manager = new ApplyManager();

    // Set application parameters (ApplyParamInfo)
    let applyParam = {
      flowId: applyData.flowId,                              // Flow ID (required)
      applyBaseDate: applyData.applyBaseDate,                // Application base date "yyyy/MM/dd" (required)
      applyAuthUserCode: applyData.applyAuthUserCode,        // Application authority user code (required)
      applyExecuteUserCode: applyData.applyExecuteUserCode,  // Application executor user code (required)
      matterName: applyData.matterName,                      // Matter name (required)
      userDataId: applyData.userDataId,                      // User data ID (optional)
      processComment: applyData.processComment               // Process comment (optional)
    };

    // User data storage information object
    let userParam = applyData.userParam || {};

    // Execute application (return value: WorkflowResultInfo<ApplyResultInfo>)
    let result = manager.apply(applyParam, userParam);

    if (!result.resultFlag) {
      // On failure: get error information from resultStatus
      logger.error('Workflow application error: messageId={}', result.resultStatus.messageId);
      return {
        success: false,
        messageId: result.resultStatus.messageId
      };
    }

    // On success: data contains ApplyResultInfo
    logger.info('Workflow application completed: systemMatterId={}', result.data.systemMatterId);

    return {
      success: true,
      systemMatterId: result.data.systemMatterId,
      matterNumber: result.data.matterNumber,
      userDataId: result.data.userDataId
    };

  } catch (e) {
    logger.error('Workflow application exception: {}', e.message);
    throw e;
  }
}
```

## Approval and Denial Processing

```javascript
/**
 * Approval processing
 */
function approveWorkflow(approveData) {
  let logger = Logger.getLogger();

  try {
    // Create an instance of ProcessManager (system matter ID, node ID)
    let manager = new ProcessManager(approveData.systemMatterId, approveData.nodeId);

    // Set approval parameters (ApproveParamInfo)
    let approveParam = {
      executeUserCode: approveData.executeUserCode,    // Executor code (required)
      authUserCode: approveData.authUserCode,          // Authority user code (required)
      processComment: approveData.processComment       // Process comment (optional)
    };

    // User data storage information object
    let userParam = approveData.userParam || {};

    // Execute approval (return value: WorkflowResultInfo<null>)
    let result = manager.approve(approveParam, userParam);

    if (!result.resultFlag) {
      logger.error('Approval processing error: messageId={}', result.resultStatus.messageId);
      return {
        success: false,
        messageId: result.resultStatus.messageId
      };
    }

    logger.info('Approval processing completed: systemMatterId={}', approveData.systemMatterId);
    return { success: true };

  } catch (e) {
    logger.error('Approval processing exception: {}', e.message);
    throw e;
  }
}

/**
 * Denial processing
 */
function denyWorkflow(denyData) {
  let logger = Logger.getLogger();

  try {
    // Create an instance of ProcessManager (system matter ID, node ID)
    let manager = new ProcessManager(denyData.systemMatterId, denyData.nodeId);

    // Set denial parameters (DenyParamInfo)
    let denyParam = {
      executeUserCode: denyData.executeUserCode,    // Executor code (required)
      authUserCode: denyData.authUserCode,          // Authority user code (required)
      processComment: denyData.processComment       // Process comment (optional)
    };

    // User data storage information object
    let userParam = denyData.userParam || {};

    // Execute denial (return value: WorkflowResultInfo<null>)
    let result = manager.deny(denyParam, userParam);

    if (!result.resultFlag) {
      logger.error('Denial processing error: messageId={}', result.resultStatus.messageId);
      return {
        success: false,
        messageId: result.resultStatus.messageId
      };
    }

    logger.info('Denial processing completed: systemMatterId={}', denyData.systemMatterId);
    return { success: true };

  } catch (e) {
    logger.error('Denial processing exception: {}', e.message);
    throw e;
  }
}
```

## Notes

### User Switching (UserSwitcher)

- Unlike proxy processing, **executes processing as the user themselves**
- History records the user after switching

### Restrictions on Proxy Processing

- "Confirmation" processing cannot be performed by the proxy destination user
- **Proxy of proxy is not permitted**