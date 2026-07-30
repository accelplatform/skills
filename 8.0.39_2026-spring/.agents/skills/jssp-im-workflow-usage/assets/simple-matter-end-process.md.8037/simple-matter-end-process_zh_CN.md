# 工作流 案件结束处理模板

## 概述

IM-Workflow 案件结束处理程序的模板。
无需画面，在案件结束时自动执行的批处理类处理。
函数 `execute(parameter)` 由工作流引擎调用。

案件结束处理分为**有事务**和**无事务**两种。

| 类型 | 文件名 | DB 事务 | 邮件发送控制 |
|------|-----------|-------------------|--------------|
| 有事务 | matter_end_process.js | 由 IM-Workflow 控制（不得独立开启） | 有（通过 `data` 控制） |
| 无事务 | matter_end_process_no_tran.js | 需独立进行事务控制 | 无 |

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  ├── matter_end_process.js           # 案件结束处理（有事务）
  └── matter_end_process_no_tran.js   # 案件结束处理（无事务）
```

---

## 有事务

### 概述

在 IM-Workflow 的事务内执行的案件结束处理。
可通过返回值 `data` 控制邮件的发送与否。

**注意**：请勿在本程序中开启 DB 事务。

### parameter（工作流参数）

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
| parameter | String | 参数 |
| actFlag | String | 代理标志 |
| lastProcessNodeId | String | （最终）处理节点ID |
| lastAuthUserCd | String | （最终）处理权限者代码 |
| lastExecUserCd | String | （最终）处理执行者代码 |
| lastResultStatus | String | （最终）处理结果状态 |
| mailIds | String | 邮件模板ID |
| replaceMap | Object | 邮件替换字符串信息 |

### 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |
| data | Boolean | 邮件发送许可（`true`：可发送 / `false`：不可发送） |

### 案件结束处理（matter_end_process.js）

```javascript
/**
 * 工作流 案件结束处理（有事务）
 *
 * @file matter_end_process.js
 * @description 在工作流案件结束时执行的处理程序。
 *              在 IM-Workflow 的事务内执行，因此
 *              请勿在本程序中开启 DB 事务。
 */

/**
 * 执行案件结束处理。
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

    logger.info('[matterEnd] 案件结束处理开始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic(parameter);
        logger.info('[matterEnd] 案件结束处理完成 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[matterEnd] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
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
    // TODO: 请在此实现案件结束时的业务逻辑
    //
    // 可用的主要参数：
    //   parameter.systemMatterId      - 系统案件ID
    //   parameter.userDataId          - 用户数据ID
    //   parameter.lastProcessNodeId   - （最终）处理节点ID
    //   parameter.lastAuthUserCd      - （最终）处理权限者代码
    //   parameter.lastExecUserCd      - （最终）处理执行者代码
    //   parameter.lastResultStatus    - （最终）处理结果状态
    //   parameter.mailIds             - 邮件模板ID
    //   parameter.replaceMap          - 邮件替换字符串信息
}
```

---

## 无事务

### 概述

在 IM-Workflow 的事务外执行的案件结束处理。
进行数据库注册/更新/删除处理时，需独立进行 DB 事务控制。
无法使用邮件发送控制（`data`、`mailIds`、`replaceMap`）。

### parameter（工作流参数）

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
| parameter | String | 参数 |
| actFlag | String | 代理标志 |
| lastProcessNodeId | String | （最终）处理节点ID |
| lastAuthUserCd | String | （最终）处理权限者代码 |
| lastExecUserCd | String | （最终）处理执行者代码 |
| lastResultStatus | String | （最终）处理结果状态 |

### 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |

### 案件结束处理（matter_end_process_no_tran.js）

```javascript
/**
 * 工作流 案件结束处理（无事务）
 *
 * @file matter_end_process_no_tran.js
 * @description 在工作流案件结束时执行的处理程序。
 *              在本程序中进行数据库注册/更新/删除处理时，
 *              请独立进行 DB 事务控制。
 */

/**
 * 执行案件结束处理。
 *
 * @param {Object} parameter - 工作流参数
 * @return {Object} 处理结果
 */
function execute(parameter) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    logger.info('[matterEndNoTran] 案件结束处理开始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic(parameter);
        logger.info('[matterEndNoTran] 案件结束处理完成 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[matterEndNoTran] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
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
    // TODO: 请在此实现案件结束时的业务逻辑
    //
    // 可用的主要参数：
    //   parameter.systemMatterId      - 系统案件ID
    //   parameter.userDataId          - 用户数据ID
    //   parameter.lastProcessNodeId   - （最终）处理节点ID
    //   parameter.lastAuthUserCd      - （最终）处理权限者代码
    //   parameter.lastExecUserCd      - （最终）处理执行者代码
    //   parameter.lastResultStatus    - （最终）处理结果状态
}
```

---

## 有事务/无事务的使用区别

| 观点 | 有事务 | 无事务 |
|------|--------------------|--------------------|
| DB 事务 | 由 IM-Workflow 管理 | 需独立控制 |
| 处理失败时 | IM-Workflow 侧也会回滚 | 对 IM-Workflow 侧无影响 |
| 邮件发送控制 | 可通过 `data` 控制 | 不可 |
| 邮件替换字符串 | 可通过 `replaceMap` 设置 | 不可 |
| 用途 | 需要与工作流整体保持一致性的处理 | 外部联动或日志记录等不希望影响工作流成败的处理 |

---

## 可用模板

- **案件结束处理（有事务）**：[assets/simple-matter-end-process.md](assets/simple-matter-end-process.md)
  - 在 IM-Workflow 的事务内执行
  - 不得开启 DB 事务
  - 通过返回值 `data` 控制邮件发送许可
- **案件结束处理（无事务）**：[assets/simple-matter-end-process.md](assets/simple-matter-end-process.md)
  - 在 IM-Workflow 的事务外执行
  - 进行 DB 处理时需独立进行事务控制

### 生成时的指示示例

当用户请求"创建工作流案件结束处理"时，参考此 assets 中的代码，适当定制后生成。
请确认事务的需求，选择合适的类型。
