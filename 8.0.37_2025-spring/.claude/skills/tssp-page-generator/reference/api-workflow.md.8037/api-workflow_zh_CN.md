---
paths:
  - "src/main/tssp/**/*.ts"
---

# 工作流联动规范

## ApplyManager API 的使用

### 申请处理的实现

```typescript
/** 申请数据 */
interface ApplyData {
  flowId: string;
  applyBaseDate: string;
  applyAuthUserCode: string;
  applyExecuteUserCode: string;
  matterName: string;
  userDataId?: string;
  processComment?: string;
  userParam?: ApplyManager.UserParam;
}

/** 申请处理的结果 */
interface ApplyWorkflowResult {
  success: boolean;
  messageId?: string | null;
  systemMatterId?: string;
  matterNumber?: string;
  userDataId?: string;
}

/**
 * 工作流申请处理
 */
function applyWorkflow(applyData: ApplyData): ApplyWorkflowResult {
  let logger = Logger.getLogger();

  try {
    // 生成 ApplyManager 的实例
    let manager = new ApplyManager();

    // 设置申请参数（ApplyParamInfo）
    let applyParam: ApplyParamInfo = {
      flowId: applyData.flowId,                              // 流程ID（必填）
      applyBaseDate: applyData.applyBaseDate,                // 申请基准日 "yyyy/MM/dd"（必填）
      applyAuthUserCode: applyData.applyAuthUserCode,        // 申请权限者代码（必填）
      applyExecuteUserCode: applyData.applyExecuteUserCode,  // 申请执行者代码（必填）
      matterName: applyData.matterName,                      // 案件名（必填）
      userDataId: applyData.userDataId,                      // 用户数据ID（可选）
      processComment: applyData.processComment               // 处理备注（可选）
    };

    // 用户数据保存信息对象
    let userParam: ApplyManager.UserParam = applyData.userParam || {};

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
    logger.error('工作流申请异常: {}', (e as Error).message);
    throw e;
  }
}
```

对于 `ApplyParamInfo` / `ApproveParamInfo` 的 `priorityLevel` 等字段，如果将 d.ts 的常量对象（`d.ts/workflow/enum/` 中的 `PriorityLevel`、`NodeType` 等）以 `PriorityLevel.pryLevel_N` 这样的表达式书写，虽然能通过类型检查、lint 和 `validate-jssp-code.js`，但会原样残留在输出的 `.js` 中，并在运行时引发 ReferenceError。请将值定义为字面量，在类型注解和注释中写明常量名，并以 `priorityLevel: PRIORITY_NORMAL` 的方式传递（参见 `jssp-code-style.md` 的“d.ts 常量、枚举值的引用”）。

```typescript
let PRIORITY_NORMAL: typeof PriorityLevel.pryLevel_N = '5';  // 普通（PriorityLevel.pryLevel_N）
```

## 批准和否决处理

```typescript
/** 批准、否决数据 */
interface ProcessData {
  systemMatterId: string;
  nodeId: string;
  executeUserCode: string;
  authUserCode: string;
  processComment?: string;
  userParam?: ProcessManager.UserParam;
}

/** 批准、否决处理的结果 */
interface ProcessWorkflowResult {
  success: boolean;
  messageId?: string | null;
}

/**
 * 批准处理
 */
function approveWorkflow(approveData: ProcessData): ProcessWorkflowResult {
  let logger = Logger.getLogger();

  try {
    // 生成 ProcessManager 的实例（系统案件ID、节点ID）
    let manager = new ProcessManager(approveData.systemMatterId, approveData.nodeId);

    // 设置批准参数（ApproveParamInfo）
    let approveParam: ApproveParamInfo = {
      executeUserCode: approveData.executeUserCode,    // 执行者代码（必填）
      authUserCode: approveData.authUserCode,          // 权限者代码（必填）
      processComment: approveData.processComment       // 处理备注（可选）
    };

    // 用户数据保存信息对象
    let userParam: ProcessManager.UserParam = approveData.userParam || {};

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
    logger.error('批准处理异常: {}', (e as Error).message);
    throw e;
  }
}

/**
 * 否决处理
 */
function denyWorkflow(denyData: ProcessData): ProcessWorkflowResult {
  let logger = Logger.getLogger();

  try {
    // 生成 ProcessManager 的实例（系统案件ID、节点ID）
    let manager = new ProcessManager(denyData.systemMatterId, denyData.nodeId);

    // 设置否决参数（DenyParamInfo）
    let denyParam: DenyParamInfo = {
      executeUserCode: denyData.executeUserCode,    // 执行者代码（必填）
      authUserCode: denyData.authUserCode,          // 权限者代码（必填）
      processComment: denyData.processComment       // 处理备注（可选）
    };

    // 用户数据保存信息对象
    let userParam: ProcessManager.UserParam = denyData.userParam || {};

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
    logger.error('否决处理异常: {}', (e as Error).message);
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
