# 工作流 案件开始处理模板

## 概述

IM-Workflow 案件开始处理程序的模板。
无需画面，在案件开始时自动执行的批处理类处理。
函数 `execute(parameter)` 由工作流引擎调用。

**注意**：请勿在本程序中开启 DB 事务。

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  └── matter_start_process.js     # 案件开始处理
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
| parameter | String | 参数 |

## 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |

---

## 案件开始处理（matter_start_process.js）

```javascript
/**
 * 工作流 案件开始处理
 *
 * @file matter_start_process.js
 * @description 在工作流案件开始时执行的处理程序。
 *              请勿在本程序中开启 DB 事务。
 */

/**
 * 执行案件开始处理。
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

    logger.info('[matterStart] 案件开始处理开始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic(parameter);
        logger.info('[matterStart] 案件开始处理完成 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[matterStart] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
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
    // TODO: 请在此实现案件开始时的业务逻辑
    //
    // 可用的主要参数：
    //   parameter.systemMatterId  - 系统案件ID
    //   parameter.userDataId      - 用户数据ID
    //   parameter.applyBaseDate   - 申请基准日
    //   parameter.processDate     - 处理日
}
```

---

## 可用模板

- **案件开始处理**：[assets/simple-matter-start-process.md](assets/simple-matter-start-process.md)
  - 工作流案件开始时执行的处理
  - 实现 `execute(parameter)` 函数
  - 不得开启 DB 事务

### 生成时的指示示例

当用户请求"创建工作流案件开始处理"时，参考此 assets 中的代码，适当定制后生成。
