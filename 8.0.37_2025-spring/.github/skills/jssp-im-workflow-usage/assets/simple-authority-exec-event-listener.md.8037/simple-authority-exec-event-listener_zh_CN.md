# 工作流 处理对象者插件模板

## 概述

IM-Workflow 处理对象者插件程序的模板。
无需画面，是在案件处理时动态决定节点处理对象者的插件。
需要实现3个函数。

| 函数名 | 用途 |
|--------|------|
| execute | 获取处理对象者（案件处理时调用） |
| getDisplayName | 获取插件配置信息的显示名称 |
| getTargetUserList | 获取对象者状态确认画面的用户列表 |

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  └── plugin/
      └── authority_exec_event_listener.js      # 处理对象者插件
```

---

## execute - 获取处理对象者

### workflowParam（工作流参数）

| 属性 | 类型 | 说明 |
|-----------|------|------|
| loginGroupId | String | 登录组ID（已废弃，与租户ID相同） |
| localeId | String | 区域设置ID |
| targetLocales | String | 目标区域设置ID |
| applyBaseDate | String | 申请基准日 |
| parameter | String | 参数 |
| targetCodes | Array | 目标代码数组（撤回、退回、案件操作导致节点移动时设置） |

### matterParam（案件参数）

| 属性 | 类型 | 说明 |
|-----------|------|------|
| contentsId | String | 内容ID |
| contentsVersionId | String | 内容版本ID |
| routeId | String | 路由ID |
| routeVersionId | String | 路由版本ID |
| flowId | String | 流程ID |
| flowVersionId | String | 流程版本ID |
| nodeId | String | 节点ID |
| systemMatterId | String | 系统案件ID |
| userDataId | String | 用户数据ID |

### 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |
| data | Array | 处理对象者信息的数组 |

### data 数组的元素

| 属性 | 类型 | 说明 |
|-----------|------|------|
| userCode | String | 处理对象者的用户代码 |
| userName | String | 处理对象者的用户名 |
| localeId | String | 处理对象者的区域设置ID |
| userOrgzModels | Array | 处理对象者所属列表数组（成为负责组织的选项） |

### userOrgzModels 数组的元素

| 属性 | 类型 | 说明 |
|-----------|------|------|
| companyName | String | 公司名称 |
| orgzName | String | 组织名称 |
| companyCode | String | 公司代码 |
| orgzSetCode | String | 组织集合代码 |
| orgzCode | String | 组织代码 |

---

## getDisplayName - 获取显示名称

### workflowParam（工作流参数）

与 `execute` 相同的项目（不含 `targetCodes`）。

### 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |
| data | Object | 以区域设置ID为键的显示名称对象 |

---

## getTargetUserList - 对象者状态确认

### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| workflowParam | Object | 工作流参数（与 `execute` 相同的项目，不含 `targetCodes`） |
| matterParam | Object | 案件参数（与 `execute` 相同的项目） |
| sort | Array | 排序条件数组 |

### 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |
| data | Object | 以区域设置ID为键的处理对象者数组 |

### data[localeId] 数组的元素

| 属性 | 类型 | 说明 |
|-----------|------|------|
| userCode | String | 处理对象者的用户代码 |
| userName | String | 处理对象者的显示名称 |
| localeId | String | 处理对象者的区域设置ID |

---

## 处理对象者插件（authority_exec_event_listener.js）

```javascript
/**
 * 工作流 处理对象者插件
 *
 * @file authority_exec_event_listener.js
 * @description 在案件处理时动态决定节点处理对象者的插件。
 */

// ========================================
// 获取处理对象者
// ========================================
/**
 * 获取处理对象者。
 * 在案件处理时执行。
 *
 * @param {Object} workflowParam - 工作流参数
 * @param {Object} matterParam - 案件参数
 * @return {Object} 处理结果
 */
function execute(workflowParam, matterParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: []
    };

    try {
        result.data = resolveTargetUsers(workflowParam, matterParam);
    } catch (e) {
        logger.error('[authorityPlugin] 发生错误。nodeId={}, error={}', matterParam.nodeId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 获取显示名称
// ========================================
/**
 * 获取插件的显示名称。
 * 需要针对每个区域设置进行设置。
 *
 * @param {Object} workflowParam - 工作流参数
 * @return {Object} 处理结果
 */
function getDisplayName(workflowParam) {
    let result = {
        resultFlag: true,
        message: '',
        data: {
            'ja': '処理対象者プラグイン',
            'en': 'Authority Plugin'
        }
    };

    return result;
}

// ========================================
// 对象者状态确认
// ========================================
/**
 * 获取在对象者状态确认画面显示的用户列表。
 * 在【案件操作】-【节点编辑】画面的"状态确认"按钮按下时调用。
 *
 * @param {Object} workflowParam - 工作流参数
 * @param {Object} matterParam - 案件参数
 * @param {Array} sort - 排序条件数组
 * @return {Object} 处理结果
 */
function getTargetUserList(workflowParam, matterParam, sort) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: {}
    };

    try {
        result.data = resolveTargetUserList(workflowParam, matterParam, sort);
    } catch (e) {
        logger.error('[authorityPlugin] 对象者列表获取错误。nodeId={}, error={}', matterParam.nodeId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 解决处理对象者。
 *
 * @param {Object} workflowParam - 工作流参数
 * @param {Object} matterParam - 案件参数
 * @return {Array} 处理对象者信息的数组
 */
function resolveTargetUsers(workflowParam, matterParam) {
    // TODO: 请在此实现决定处理对象者的业务逻辑
    //
    // 当 workflowParam.targetCodes 已设置时：
    //   通过撤回、退回、案件操作的节点移动到达
    //   返回前次处理者可实现再次处理等待状态
    //
    // 返回值示例：
    //   [{
    //       userCode: "aoyagi",
    //       userName: "青柳 辰巳",
    //       localeId: "ja",
    //       userOrgzModels: [{
    //           companyName: "サンプル会社",
    //           orgzName: "営業部",
    //           companyCode: "comp_sample_01",
    //           orgzSetCode: "comp_sample_01_set_01",
    //           orgzCode: "comp_sample_01_section_sales"
    //       }]
    //   }]

    return [];
}

/**
 * 解决在对象者状态确认画面显示的用户列表。
 *
 * @param {Object} workflowParam - 工作流参数
 * @param {Object} matterParam - 案件参数
 * @param {Array} sort - 排序条件数组
 * @return {Object} 以区域设置ID为键的处理对象者数组
 */
function resolveTargetUserList(workflowParam, matterParam, sort) {
    // TODO: 请在此实现返回对象者列表的业务逻辑

    return {};
}
```

---

## 关于 targetCodes

`workflowParam.targetCodes` 在以下情况以用户代码数组的形式传递：

- 撤回
- 退回
- 通过案件操作功能的节点移动（返回）

设置了上次处理此插件所配置节点的用户代码。
在返回值中采用通过 `targetCodes` 传递的用户，可以实现前次处理者的案件再次处理等待状态。

---

## 可用模板

- **处理对象者插件（SSJS 实现）**：[assets/simple-authority-exec-event-listener.md](assets/simple-authority-exec-event-listener.md)
  - 在案件处理时动态决定节点的处理对象者
  - 实现 `execute`、`getDisplayName`、`getTargetUserList` 3个函数
  - 可通过 `targetCodes` 实现再次处理等待状态

- **处理对象者插件（IM-LogicDesigner 集成）**：[assets/logic-flow-authority-plugin.md](assets/logic-flow-authority-plugin.md)
  - 通过逻辑流程决定处理对象者，无需编写 SSJS 代码
  - 在 IM-Workflow 路由定义中使用 `.logic_flow_user` 后缀
  - 支持审批节点、确认节点、参照者设置（已通过实机验证）

### 方式选择指南

**选择 SSJS 插件的情况：**
- 难以在 IM-LogicDesigner 中实现的复杂逻辑（多 API 集成、动态查询等）
- 需要与发布周期一致的变更管理

**选择 IM-LogicDesigner 集成的情况：**
- 希望从管理界面修改和发布流程的运营场景
- 可以用现有 IM-LogicDesigner 任务覆盖的逻辑（DB 搜索、条件分支等）

### 生成时的指示示例

当用户请求"创建工作流处理对象者插件"时，确认采用哪种方式后再开始实现。
- SSJS 实现 → 参考此 assets 中的代码，适当定制后生成。
- IM-LogicDesigner 集成 → 使用 `assets/logic-flow-authority-plugin.md` 中的 spec.json 模板生成流程定义。
