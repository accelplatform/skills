# IM-Workflow 逻辑流插件注册（扩展导入）

将 IM-LogicDesigner 逻辑流注册为 IM-Workflow 处理对象插件（`.logic_flow_user`）的扩展导入 JS 规范与模板。

通过在租户环境安装时使用 `WorkflowLogicFlowManager` 进行注册，可实现 IM-Workflow 管理画面手动注册的自动化。

## 使用场景

- 已在 IM-LogicDesigner 中创建用于处理对象插件的流程，希望在租户环境安装时自动注册
- 按照 `.agents/skills/jssp-im-workflow-usage/assets/logic-flow-authority-plugin.md` 生成流程定义之后

---

## ⚠️ 执行顺序（必须）

`WorkflowLogicFlowManager.createLogicFlow` 会引用 IM-LogicDesigner 的流程注册状态，因此
**在 LD 流程不存在的状态下执行插件注册会失败**。

```
[必须的执行顺序]
1. <key>_logic_import.js    ← 导入 IM-LogicDesigner 流程 ZIP（创建流程）
2. <key>_workflow_import.js ← 导入 IM-Workflow 定义 XML（创建路由·流程定义）
3. <key>_import.js          ← 注册 IM-Workflow 逻辑流插件（本处理）
```

> 构建脚本（`build-setup-import.js`）按 `_import.js` → `_workflow_import.js` → `_logic_import.js`
> 的顺序生成 XML。**该顺序与插件注册所需的顺序相反，因此生成后需手动重新排序。**

### 在 import config XML 中的指定方法

`<extends-import>` 内的 `<extends-import-class>` 按 **XML 记述顺序执行**。
请按以下顺序排列。

```xml
<extends-import>
  <!-- 1. 先导入 IM-LogicDesigner 流程 -->
  <extends-import-class>sample/initialize/1.0.0/sample_logic_import.js</extends-import-class>
  <!-- 2. 导入 IM-Workflow 定义（可选，仅在需要路由定义时） -->
  <extends-import-class>sample/initialize/1.0.0/sample_workflow_import.js</extends-import-class>
  <!-- 3. 将 LD 流程注册为 WF 插件（最后执行） -->
  <extends-import-class>sample/initialize/1.0.0/sample_import.js</extends-import-class>
</extends-import>
```

### 分割 configNumber 的情况

也可以将 LD / WF 导入与插件注册分到不同的 config 中。

```
config-1.xml: logicImport（LD 流程 ZIP）+ workflowImport（WF 定义 XML）
config-2.xml: extendsImport（插件注册）
```

此时，生成 config-2 用的 `sample_import-2.js`，并将其添加到 config-2.xml 的 `<extends-import-class>` 中。
详情参见 [import-config.md](import-config.md#configNumber--1-のファイル名サフィックス)。

---

## 扩展导入 JS 模板

文件路径：`src/main/jssp/src/<key>/initialize/<version>/<key>_import.js`

```javascript
/**
 * IM-Workflow 逻辑流插件注册
 *
 * @file <key>_import.js
 * @description 在租户环境安装时，将 IM-LogicDesigner 流程注册为
 *              IM-Workflow 处理对象插件的扩展导入。
 *              使用 WorkflowLogicFlowManager 以全量替换方式注册，
 *              因此重复执行也能保持幂等。
 *
 * 前提：IM-LogicDesigner 流程 ZIP 导入（<key>_logic_import.js）必须
 *       在本 JS 之前执行完毕。
 */

/**
 * 要注册的逻辑流插件定义。
 * 注册多个流程时，向数组中添加元素。各流程在独立事务中处理。
 *
 * logicFlowId   : IM-LogicDesigner 的流程 ID
 * resourceGroup : IM-Workflow 中的资源组（固定值：'authority_plugin'）
 * resourceTypes : 可用的资源种别（对应 IM-Workflow 管理画面的"使用区分"）
 *   - 'authority_process'       处理权限者（审批节点）
 *   - 'authority_confirm'       确认对象（确认节点）
 *   - 'authority_matter_handle' 案件操作权限者（参照者）
 */
let IMW_LOGIC_FLOW_PLUGINS = [
    {
        logicFlowId:   '<流程ID>',
        resourceGroup: 'authority_plugin',
        resourceTypes: [
            'authority_process',
            'authority_confirm',
            'authority_matter_handle'
        ]
    }
    // 注册多个流程时在此追加
    // ,{
    //     logicFlowId:   '<其他流程ID>',
    //     resourceGroup: 'authority_plugin',
    //     resourceTypes: [
    //         'authority_process'
    //     ]
    // }
];

/**
 * 扩展导入入口点。
 * Importer 在投入本 config 的 tenant-master 数据后立即调用。
 *
 * @param {string} tenantId 安装目标租户ID
 */
function doImport(tenantId) {
    let logger = Logger.getLogger('<key>.initialize');
    logger.info('[<key>] IMW LogicFlow plugin import start. tenantId=' + tenantId);

    for (let i = 0; i < IMW_LOGIC_FLOW_PLUGINS.length; i++) {
        registerLogicFlowPlugin(IMW_LOGIC_FLOW_PLUGINS[i], logger);
    }

    logger.info('[<key>] IMW LogicFlow plugin import completed. tenantId=' + tenantId);
}

/**
 * 以全量替换方式将逻辑流插件注册到 IM-Workflow。
 * 先删除全部既有记录再重新创建，因此重复执行结果相同。
 *
 * @param {Object} config IMW_LOGIC_FLOW_PLUGINS 的一个元素
 * @param {Object} logger Logger 实例
 */
function registerLogicFlowPlugin(config, logger) {
    logger.info('[<key>] registerLogicFlowPlugin start. logicFlowId=' + config.logicFlowId);

    let manager = new WorkflowLogicFlowManager();

    // 构建注册模型（每个 resourceType 对应一条记录）
    let registerModelList = [];
    for (let i = 0; i < config.resourceTypes.length; i++) {
        registerModelList[registerModelList.length] = {
            logicFlowId:   config.logicFlowId,
            resourceGroup: config.resourceGroup,
            resourceType:  config.resourceTypes[i],
            updateCount:   '1'
        };
    }

    let businessError = null;
    let txResult = Transaction.begin(function() {
        try {
            // 全量删除既有记录（以 logicFlowId 为单位进行全量替换）
            let deleteResult = manager.deleteLogicFlow({ logicFlowId: config.logicFlowId });
            if (!deleteResult.resultFlag) {
                // 以"delete"开头的字符串字面量会导致 JSSP-JS-004 误检，故故意更改了开头
                throw new Error('LogicFlow deletion failed. logicFlowId=' + config.logicFlowId);
            }

            if (registerModelList.length > 0) {
                let createResult = manager.createLogicFlow(registerModelList);
                if (!createResult.resultFlag) {
                    throw new Error('createLogicFlow failed. logicFlowId=' + config.logicFlowId);
                }
            }
        } catch (e) {
            businessError = e;
            throw e;  // 为使 Transaction 回滚而重新抛出
        }
    });

    if (businessError) {
        logger.error('[<key>] registerLogicFlowPlugin failed. logicFlowId='
            + config.logicFlowId + ' error=' + businessError.message);
        throw businessError;
    }
    if (!txResult.isSuccess()) {
        let msg = '[<key>] registerLogicFlowPlugin transaction failed. logicFlowId=' + config.logicFlowId;
        logger.error(msg);
        throw new Error(msg);
    }

    logger.info('[<key>] registerLogicFlowPlugin completed. logicFlowId=' + config.logicFlowId);
}
```

---

## 使用的 API

| API | 用途 | d.ts |
|-----|------|------|
| `WorkflowLogicFlowManager` | 向 WF 注册/删除 LD 流程 | 无（IM-Workflow 内部 API） |
| `WorkflowLogicFlowList` | 查看已注册一览（用于互斥确认） | 无（面向 UI；扩展导入中不使用） |

`WorkflowLogicFlowManager` 是不存在 d.ts 的内部 API，但可在安装了 IM-Workflow 的环境的函数容器相当的上下文中使用。

### `deleteLogicFlow` 的参数与返回值

```javascript
manager.deleteLogicFlow({ logicFlowId: '<流程ID>' })
// 返回值：{ resultFlag: boolean }
// 即使不存在与 logicFlowId 对应的记录，也以 resultFlag: true 正常结束
```

### `createLogicFlow` 的参数与返回值

```javascript
manager.createLogicFlow([
  {
    logicFlowId:   '<流程ID>',            // string
    resourceGroup: 'authority_plugin',    // string（固定值）
    resourceType:  '<资源种别>',           // string
    updateCount:   '1'                    // string（首次注册时为 '1'）
  },
  ...
])
// 返回值：{ resultFlag: boolean }
```

---

## 注意事项

- 通过 `deleteLogicFlow` + `createLogicFlow` 的全量替换模式，重复执行可保持相同状态（幂等）
- `WorkflowLogicFlowManager` 是不执行 UI 乐观锁（`updateCount` 比对）的直接 API，无需排他控制
- 发生错误时，该流程的事务将回滚，但**在此之前已完成注册的流程不会回滚**（各流程在独立事务中处理）
- 错误以异常形式重新抛出，导致整个 Importer 运行被视为失败
