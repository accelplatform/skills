# 工作流联动规范

## ApplyManager API 的使用

### 申请处理的实现

```javascript
/**
 * 工作流申请处理
 */
function applyWorkflow(applyData) {
  let logger = Logger.getLogger();

  try {
    // 生成 ApplyManager 的实例
    let manager = new ApplyManager();

    // 设置申请参数（ApplyParamInfo）
    let applyParam = {
      flowId: applyData.flowId,                              // 流程ID（必填）
      applyBaseDate: applyData.applyBaseDate,                // 申请基准日 "yyyy/MM/dd"（必填）
      applyAuthUserCode: applyData.applyAuthUserCode,        // 申请权限者代码（必填）
      applyExecuteUserCode: applyData.applyExecuteUserCode,  // 申请执行者代码（必填）
      matterName: applyData.matterName,                      // 案件名（必填）
      userDataId: applyData.userDataId,                      // 用户数据ID（可选）
      processComment: applyData.processComment               // 处理备注（可选）
    };

    // 用户数据保存信息对象
    let userParam = applyData.userParam || {};

    // 执行申请（返回值：WorkflowResultInfo<ApplyResultInfo>）
    let result = manager.apply(applyParam, userParam);

    if (!result.resultFlag) {
      // 失败时：从 resultStatus 获取错误信息
      logger.error('工作流申请错误: messageId={}', result.resultStatus.messageId);
      return {
        success: false,
        messageId: result.resultStatus.messageId
      };
    }

    // 成功时：data 中存储 ApplyResultInfo
    logger.info('工作流申请完成: systemMatterId={}', result.data.systemMatterId);

    return {
      success: true,
      systemMatterId: result.data.systemMatterId,
      matterNumber: result.data.matterNumber,
      userDataId: result.data.userDataId
    };

  } catch (e) {
    logger.error('工作流申请异常: {}', e.message);
    throw e;
  }
}
```

## 批准和否决处理

```javascript
/**
 * 批准处理
 */
function approveWorkflow(approveData) {
  let logger = Logger.getLogger();

  try {
    // 生成 ProcessManager 的实例（系统案件ID、节点ID）
    let manager = new ProcessManager(approveData.systemMatterId, approveData.nodeId);

    // 设置批准参数（ApproveParamInfo）
    let approveParam = {
      executeUserCode: approveData.executeUserCode,    // 执行者代码（必填）
      authUserCode: approveData.authUserCode,          // 权限者代码（必填）
      processComment: approveData.processComment       // 处理备注（可选）
    };

    // 用户数据保存信息对象
    let userParam = approveData.userParam || {};

    // 执行批准（返回值：WorkflowResultInfo<null>）
    let result = manager.approve(approveParam, userParam);

    if (!result.resultFlag) {
      logger.error('批准处理错误: messageId={}', result.resultStatus.messageId);
      return {
        success: false,
        messageId: result.resultStatus.messageId
      };
    }

    logger.info('批准处理完成: systemMatterId={}', approveData.systemMatterId);
    return { success: true };

  } catch (e) {
    logger.error('批准处理异常: {}', e.message);
    throw e;
  }
}

/**
 * 否决处理
 */
function denyWorkflow(denyData) {
  let logger = Logger.getLogger();

  try {
    // 生成 ProcessManager 的实例（系统案件ID、节点ID）
    let manager = new ProcessManager(denyData.systemMatterId, denyData.nodeId);

    // 设置否决参数（DenyParamInfo）
    let denyParam = {
      executeUserCode: denyData.executeUserCode,    // 执行者代码（必填）
      authUserCode: denyData.authUserCode,          // 权限者代码（必填）
      processComment: denyData.processComment       // 处理备注（可选）
    };

    // 用户数据保存信息对象
    let userParam = denyData.userParam || {};

    // 执行否决（返回值：WorkflowResultInfo<null>）
    let result = manager.deny(denyParam, userParam);

    if (!result.resultFlag) {
      logger.error('否决处理错误: messageId={}', result.resultStatus.messageId);
      return {
        success: false,
        messageId: result.resultStatus.messageId
      };
    }

    logger.info('否决处理完成: systemMatterId={}', denyData.systemMatterId);
    return { success: true };

  } catch (e) {
    logger.error('否决处理异常: {}', e.message);
    throw e;
  }
}
```

## 注意事项

### 用户切换（UserSwitcher）

- 与代理处理不同，**以本人身份执行处理**
- 历史记录中记录切换后的用户

### 代理处理的限制

- "确认"处理无法由代理目标用户执行
- **不允许代理的代理**
