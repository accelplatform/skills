# 工作流 分支条件/分支合并处理模板

## 概述

IM-Workflow 分支条件处理、分支合并处理程序的模板。
无需画面，在路由上的分支/合并节点案件到达时自动执行的批处理类处理。
函数 `execute(parameter)` 由工作流引擎调用。

- **分支条件**：返回值 `data` 为 `true` 时，转移到该路由
- **分支合并**：返回值 `data` 为 `true` 时，进行合并

**注意**：
- 请勿在本程序中开启 DB 事务
- 分支条件程序为函数容器，请遵守 `{{AGENT_RULES}}/` 配下的编码规范（使用 `let`、命名规则等）

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  └── rule/
      └── rule_condition.js     # 分支条件/分支合并处理
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
| nodeId | String | 节点ID |

## 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |
| data | Boolean | 分支：`true` 时转移 / 合并：`true` 时合并 |

---

## 分支条件/分支合并处理（rule_condition.js）

```javascript
/**
 * 工作流 分支条件/分支合并处理
 *
 * @file rule_condition.js
 * @description 在路由上的分支/合并节点案件到达时执行的处理程序。
 *              请勿在本程序中开启 DB 事务。
 */

// ========================================
// 入口点
// ========================================
/**
 * 执行分支条件/分支合并处理。
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

    try {
        result.data = evaluateCondition(parameter);
    } catch (e) {
        logger.error('[RuleCondition] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 条件判断
// ========================================
/**
 * 进行分支条件的判断。
 *
 * @param {Object} parameter - 工作流参数
 * @return {Boolean} true：转移（合并） / false：不转移（不合并）
 */
function evaluateCondition(parameter) {
    // TODO: 请在此实现分支条件的业务逻辑
    //
    // 可用的主要参数：
    //   parameter.systemMatterId  - 系统案件ID
    //   parameter.userDataId      - 用户数据ID
    //   parameter.nodeId          - 节点ID

    return true;
}
```

---

## 可用模板

- **分支条件/分支合并处理**：[assets/simple-rule-condition.md](assets/simple-rule-condition.md)
  - 路由上的分支/合并节点自动执行的批处理类处理
  - 通过 `data` 的 `true`/`false` 控制路由转移/合并
  - 不得开启 DB 事务

### 生成时的指示示例

当用户请求"创建工作流分支条件处理"时，参考此 assets 中的代码，适当定制后生成。
