# 工作流 到达处理模板

## 概述

IM-Workflow 到达处理程序的模板。
无需画面，在工作流的各节点案件到达时自动执行的批处理类处理。
函数 `execute(parameter)` 由工作流引擎调用。

**注意**：在本程序中进行数据库注册/更新/删除处理时，需要独立进行 DB 事务控制。

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  └── arrive/
      └── arrive_process.js     # 到达处理
```

---

## parameter（工作流参数）

| 属性 | 类型 | 说明 |
|-----------|------|------|
| loginGroupId | String | 登录组ID（已废弃，与租户ID相同） |
| localeId | String | 区域设置ID |
| targetLocales | String | 目标区域设置ID |
| contentsId | String | 内容ID |
| contentsVersionId | String | 内容版本ID |
| routeId | String | 路由ID |
| routeVersionId | String | 路由版本ID |
| flowId | String | 流程ID |
| flowVersionId | String | 流程版本ID |
| applyBaseDate | String | 申请基准日 |
| processDate | String | 处理日/到达日 |
| systemMatterId | String | 系统案件ID |
| userDataId | String | 用户数据ID |
| matterName | String | 案件名称 |
| matterNumber | String | 案件编号 |
| priorityLevel | String | 优先级 |
| parameter | String | 参数 |
| nodeId | String | 节点ID |
| actFlag | String | 代理标志 |
| preNodeId | String | 前节点ID |
| preNodeAuthUserCd | String | 前节点处理权限者代码 |
| preNodeExecUserCd | String | 前节点处理执行者代码 |
| preNodeResultStatus | String | 前节点处理结果状态 |
| preNodeAuthCompanyCode | String | 前节点权限公司代码 |
| preNodeAuthOrgzSetCode | String | 前节点权限组织集合代码 |
| preNodeAuthOrgzCode | String | 前节点权限组织代码 |
| preNodeProcessComment | String | 前节点处理注释 |
| mailIds | String | 邮件模板ID |
| replaceMap | Object | 邮件替换字符串信息 |

## 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |
| data | Boolean | 邮件发送许可（`true`：可发送 / `false`：不可发送） |

---

## 到达处理（arrive_process.js）

```javascript
/**
 * 工作流 到达处理
 *
 * @file arrive_process.js
 * @description 在工作流各节点案件到达时执行的处理程序。
 *              在本程序中进行数据库注册/更新/删除处理时，
 *              请独立进行 DB 事务控制。
 */

/**
 * 执行到达处理。
 *
 * @param {Object} parameter - 工作流参数
 * @return {Object} 处理结果
 */
function execute(parameter) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: true
    };

    logger.info('[arrive] 到达处理开始 systemMatterId={}, nodeId={}', parameter.systemMatterId, parameter.nodeId);
    try {
        processBusinessLogic(parameter);
        logger.info('[arrive] 到达处理完成 systemMatterId={}, nodeId={}', parameter.systemMatterId, parameter.nodeId);
    } catch (e) {
        logger.error('[arrive] 发生错误。systemMatterId={}, nodeId={}, error={}', parameter.systemMatterId, parameter.nodeId, e.message);
        result.resultFlag = false;
        result.message = e.message;
        result.data = false;
    }

    return result;
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 执行业务逻辑的主处理。
 *
 * @param {Object} parameter - 工作流参数
 */
function processBusinessLogic(parameter) {
    // TODO: 请在此实现到达时的业务逻辑
    //
    // 可用的主要参数：
    //   parameter.systemMatterId       - 系统案件ID
    //   parameter.userDataId           - 用户数据ID
    //   parameter.nodeId               - 到达节点ID
    //   parameter.preNodeId            - 前节点ID
    //   parameter.preNodeExecUserCd    - 前节点处理执行者代码
    //   parameter.preNodeResultStatus  - 前节点处理结果状态
    //   parameter.preNodeProcessComment- 前节点处理注释
    //   parameter.mailIds              - 邮件模板ID
    //   parameter.replaceMap           - 邮件替换字符串信息
}
```

---

## 邮件发送控制

### 概述

可通过到达处理的返回值 `data` 控制邮件的发送与否。
当路由定义中节点设置了邮件模板时，到达处理的 `data` 为 `true` 时发送邮件。

### 邮件替换字符串

使用 `parameter.replaceMap`，可以动态设置邮件模板内的替换字符串。

```javascript
function execute(parameter) {
    let result = {
        resultFlag: true,
        message: '',
        data: true
    };

    // 设置邮件替换字符串
    parameter.replaceMap.put('applicantName', getApplicantName(parameter));
    parameter.replaceMap.put('matterTitle', parameter.matterName);

    return result;
}
```

---

## 可用模板

- **到达处理**：[assets/simple-arrive.md](assets/simple-arrive.md)
  - 工作流各节点案件到达时执行的处理
  - 实现 `execute(parameter)` 函数
  - 需独立进行 DB 事务控制
  - 通过返回值 `data` 控制邮件发送许可

### 生成时的指示示例

当用户请求"创建工作流到达处理"时，参考此 assets 中的代码，适当定制后生成。
