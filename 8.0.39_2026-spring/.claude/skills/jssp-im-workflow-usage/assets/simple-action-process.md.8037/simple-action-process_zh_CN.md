# 工作流 动作处理模板

## 概述

IM-Workflow 动作处理程序的模板。
无需画面，在工作流的各处理时机（申请、审批、否决、退回等）执行的批处理类处理。
各函数接收 `parameter`（工作流参数）和 `userParam`（用户数据），并返回处理结果。

**注意**：请勿在本程序中开启 DB 事务。

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  └── action/
      └── action_process.js     # 动作处理
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
| parameter | String | 执行程序路径 |
| actFlag | String | 代理标志 |
| nodeId | String | 节点ID |
| nextNodeIds | String | 目标节点ID（退回、撤回、案件操作时设置） |
| authUserCd | String | 处理权限者代码 |
| execUserCd | String | 处理执行者代码 |
| resultStatus | String | 处理结果状态 |
| authCompanyCode | String | 权限公司代码 |
| authOrgzSetCode | String | 权限组织集合代码 |
| authOrgzCode | String | 权限组织代码 |
| processComment | String | 处理注释 |
| lumpProcessFlag | String | 批量处理标志 |
| autoProcessFlag | String | 自动处理标志（自动审批或批次自动处理时设置） |
| DCNodeConfigModels | Object | 动态/确认节点配置信息（从申请/未申请状态进行申请/再申请/审批时设置） |
| HVNodeConfigModels | Object | 水平/垂直节点配置信息（从申请/未申请状态进行申请/再申请/审批时设置） |
| branchSelectModels | Object | 分支目标选择信息（从申请/未申请状态进行申请/再申请/审批时设置） |

## 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |
| data | String | 案件编号（最多20字节；仅申请/再申请类；非 `null` 时覆盖案件编号） |

## 函数列表

| 函数名 | 处理时机 | data 返回 |
|--------|--------------|-----------|
| apply | 申请 | 有（可覆盖案件编号） |
| reapply | 再申请 | 有 |
| applyFromTempSave | 申请（临时保存案件） | 有 |
| applyFromUnapply | 申请（未申请状态案件） | 有 |
| approve | 审批 | 无 |
| approveEnd | 审批结束 | 无 |
| deny | 否决 | 无 |
| sendBack | 退回 | 无 |
| pullBack | 撤回 | 无 |
| sendBackToPullBack | 退回后撤回 | 无 |
| discontinue | 中止 | 无 |
| reserve | 保留 | 无 |
| reserveCancel | 取消保留 | 无 |
| matterHandle | 案件操作 | 无 |
| tempSaveCreate | 临时保存（新建） | 无 |
| tempSaveUpdate | 临时保存（更新） | 无 |
| tempSaveDelete | 临时保存（删除） | 无 |

---

## 动作处理（action_process.js）

```javascript
/**
 * 工作流 动作处理
 *
 * @file action_process.js
 * @description 在工作流各处理时机执行的动作处理程序。
 *              请勿在本程序中开启 DB 事务。
 */

// ========================================
// 申请类
// ========================================
/**
 * 执行申请处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function apply(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[apply] 申请处理开始 systemMatterId={}', parameter.systemMatterId);
    try {
        result.data = createMatterNumber();
        processBusinessLogic('apply', parameter, userParam);
        logger.info('[apply] 申请处理完成 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[apply] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行再申请处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function reapply(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[reapply] 再申请处理开始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic('reapply', parameter, userParam);
        logger.info('[reapply] 再申请处理完成 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[reapply] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行申请（临时保存案件）处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function applyFromTempSave(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[applyFromTempSave] 申请（临时保存案件）处理开始 systemMatterId={}', parameter.systemMatterId);
    try {
        result.data = createMatterNumber();
        processBusinessLogic('applyFromTempSave', parameter, userParam);
        logger.info('[applyFromTempSave] 申请（临时保存案件）处理完成 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[applyFromTempSave] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行申请（未申请状态案件）处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function applyFromUnapply(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[applyFromUnapply] 申请（未申请状态案件）处理开始 systemMatterId={}', parameter.systemMatterId);
    try {
        result.data = createMatterNumber();
        processBusinessLogic('applyFromUnapply', parameter, userParam);
        logger.info('[applyFromUnapply] 申请（未申请状态案件）处理完成 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[applyFromUnapply] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 生成案件编号。
 *
 * @return {String} 案件编号
 */
function createMatterNumber() {
    let result = WorkflowNumberingManager.getNumber();
    if (!result.resultFlag) {
        throw new Error('案件编号生成失败。');
    }

    return result.data;
}

// ========================================
// 审批类
// ========================================
/**
 * 执行审批处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function approve(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('approve', parameter, userParam);
    } catch (e) {
        logger.error('[approve] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行审批结束处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function approveEnd(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('approveEnd', parameter, userParam);
    } catch (e) {
        logger.error('[approveEnd] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行否决处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function deny(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('deny', parameter, userParam);
    } catch (e) {
        logger.error('[deny] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行退回处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function sendBack(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('sendBack', parameter, userParam);
    } catch (e) {
        logger.error('[sendBack] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 撤回类
// ========================================
/**
 * 执行撤回处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function pullBack(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('pullBack', parameter, userParam);
    } catch (e) {
        logger.error('[pullBack] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行退回后撤回处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function sendBackToPullBack(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('sendBackToPullBack', parameter, userParam);
    } catch (e) {
        logger.error('[sendBackToPullBack] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 中止・保留类
// ========================================
/**
 * 执行中止处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function discontinue(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('discontinue', parameter, userParam);
    } catch (e) {
        logger.error('[discontinue] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行保留处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function reserve(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('reserve', parameter, userParam);
    } catch (e) {
        logger.error('[reserve] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行取消保留处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function reserveCancel(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('reserveCancel', parameter, userParam);
    } catch (e) {
        logger.error('[reserveCancel] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 案件操作
// ========================================
/**
 * 执行案件操作处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function matterHandle(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('matterHandle', parameter, userParam);
    } catch (e) {
        logger.error('[matterHandle] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 临时保存类
// ========================================
/**
 * 执行临时保存（新建）处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function tempSaveCreate(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };
    logger.info('[tempSaveCreate] 临时保存（新建）处理开始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic('tempSaveCreate', parameter, userParam);
        logger.info('[tempSaveCreate] 临时保存（新建）处理完成 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[tempSaveCreate] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行临时保存（更新）处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function tempSaveUpdate(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };
    logger.info('[tempSaveUpdate] 临时保存（更新）处理开始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic('tempSaveUpdate', parameter, userParam);
        logger.info('[tempSaveUpdate] 临时保存（更新）处理完成 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[tempSaveUpdate] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * 执行临时保存（删除）处理。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 * @return {Object} 处理结果
 */
function tempSaveDelete(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('tempSaveDelete', parameter, userParam);
    } catch (e) {
        logger.error('[tempSaveDelete] 发生错误。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
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
 * 从各动作函数调用。
 *
 * @param {String} actionType - 动作类型
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 */
function processBusinessLogic(actionType, parameter, userParam) {
    // TODO: 请在此根据 actionType 实现业务逻辑
    //
    // 可用的主要参数：
    //   parameter.systemMatterId  - 系统案件ID
    //   parameter.userDataId      - 用户数据ID
    //   parameter.authUserCd      - 处理权限者代码
    //   parameter.execUserCd      - 处理执行者代码
    //   parameter.processComment  - 处理注释

    // 将用户数据保存到案件属性
    saveToMatterProperty(parameter, userParam);
}

/**
 * 将用户数据保存到案件属性。
 *
 * @param {Object} parameter - 工作流参数
 * @param {Object} userParam - 用户数据
 */
function saveToMatterProperty(parameter, userParam) {
    let matterPropertyInfo = [{
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'partCode',
        matterPropertyValue: userParam.partCode
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'partName',
        matterPropertyValue: userParam.partName
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'unitPrice',
        matterPropertyValue: userParam.unitPrice
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'quantity',
        matterPropertyValue: userParam.quantity
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'totalAmount',
        matterPropertyValue: String(Number(userParam.unitPrice) * Number(userParam.quantity))
    }];

    let property = new UserActvMatterPropertyValue();
    let result = property.createMatterProperty(matterPropertyInfo);
    if (!result.resultFlag) {
        throw new Error('案件属性保存失败。');
    }
}
```

---

## 案件属性

### 概述

案件属性是与工作流案件关联的用户自定义键值对数据。
以 `userDataId`（用户数据ID）为键，保存在 IM-Workflow 管理的表 `imw_t_user_data` 中。

在动作处理（`apply` / `approve` 等）中使用 `UserActvMatterPropertyValue` API 进行注册/更新。

### 目的

案件属性的主要目的是**在工作流标准列表画面上显示项目**。

要在 IM-Workflow 的标准列表画面（未处理列表、已处理列表、案件列表等）中将申请数据内容（金额、主题、申请者部门等）显示为列，需要将其保存为案件属性。
保存为案件属性的值可以在管理画面的"案件属性定义"中设置为列表的显示列。

### 使用判断标准

满足以下条件时使用案件属性：
- 需要在路由的条件分支判断中使用时
  - 示例：合计金额超过5万日元时，需要额外的总经理审批
  - 示例：涉及住宿的出差费用申请时，需要额外的财务部门审批
- 需要在申请/审批列表画面的案件列表中显示值时

### 注意事项

案件属性值的最大字符数：
- `matter_property_value` 列为 **VARCHAR(2000)**（2000字符）
- 包含代理对字符时，UTF-8 编码最多约8000字节
- 在 PostgreSQL 环境中，案件完成时（迁移到 `imw_t_cpl_matter_user_data` 时）可能因索引大小限制而发生错误
- 将长文本保存到案件属性时，请注意字符数

### 不使用案件属性保存用户数据的方法

如果不需要案件属性，或因字符数限制无法使用案件属性，可在动作处理中直接保存到自定义表。
以 `parameter.systemMatterId` 或 `parameter.userDataId` 作为外键，可以在之后关联案件检索数据。

```javascript
function processBusinessLogic(actionType, parameter, userParam) {
  // 保存到自定义表的示例
  let db = new TenantDatabase();
  let sql = 'INSERT INTO my_order_data'
      + ' (system_matter_id, user_data_id, part_code, part_name, unit_price, quantity)'
      + ' VALUES (?, ?, ?, ?, ?, ?)';
  let params = [
    DbParameter.string(parameter.systemMatterId),
    DbParameter.string(parameter.userDataId),
    DbParameter.string(userParam.partCode),
    DbParameter.string(userParam.partName),
    DbParameter.number(Number(userParam.unitPrice)),
    DbParameter.number(Number(userParam.quantity))
  ];
  let result = db.execute(sql, params);
  if (result.error) {
    throw new Error('数据保存失败。');
  }
}
```

此方法下，列表显示需创建自定义画面，或在审批画面中以 `userDataId` 为键检索自定义表来显示数据。
使用案件属性和使用数据库保存用户数据可以并用。

---

## 可用模板

- **动作处理**：[assets/simple-action.md](assets/simple-action.md)
  - 在工作流各处理时机执行的批处理类处理
  - 涵盖申请、审批、否决、退回等全部17个函数
  - 不得开启 DB 事务

### 生成时的指示示例

当用户请求"创建工作流动作处理"时，参考此 assets 中的代码，适当定制后生成。

### 生成时的注意事项

#### 函数签名必须始终为2个参数 `(parameter, userParam)`

动作处理的所有函数必须以 **`(parameter, userParam)` 的2个参数**定义。
IM-Workflow 引擎将工作流参数作为第1个参数，表单输入值（hidden 字段的 name/value）作为第2个参数传递。

```javascript
// OK：接收2个参数
function apply(parameter, userParam) {
  let vendorId = userParam.vendorId;  // 表单中 hidden 字段的值
}

// NG：1个参数访问 parameter.userParameter → undefined
function apply(parameter) {
  let vendorId = parameter.userParameter.vendorId;  // 错误
}
```

#### `executeByTemplate` 的参数键名必须与 SQL 模板的绑定变量名一致

2WaySQL 模板的绑定变量名（`/*user_data_id*/`、`/*vendor_id*/` 等）与传递给 `executeByTemplate` 的参数对象键名必须**完全一致**。
如果 SQL 使用蛇形命名法（`user_data_id`），则 JS 端也必须使用蛇形命名法。

```javascript
// OK：与 SQL 的 /*user_data_id*/ 一致
db.executeByTemplate('/purchase/sql/select_request', {
  user_data_id: DbParameter.string(userDataId)
});

// NG：以驼峰命名法传递 → "user_data_id" is not defined 错误
db.executeByTemplate('/purchase/sql/select_request', {
  userDataId: DbParameter.string(userDataId)
});
```

#### 案件编号的生成是必须的

即使规格说明中未指定案件编号格式，也必须在 `apply` 函数中使用 `WorkflowNumberingManager.getNumber()` 生成案件编号，并设置到 `result.data`。
未生成案件编号时，在 IM-Workflow 的列表画面上将难以识别案件。

- `apply` — 新规申请时生成
- `applyFromTempSave` / `applyFromUnapply` — 委托给 `apply` 时自动生成
- `reapply` — 再申请时案件编号已存在，不生成（`data: null`）

```javascript
function apply(parameter, userParam) {
  let result = { resultFlag: true, message: '', data: null };
  try {
    result.data = createMatterNumber();  // 生成案件编号
    // ... 业务逻辑 ...
  } catch (e) { /* ... */ }
  return result;
}

function createMatterNumber() {
  let result = WorkflowNumberingManager.getNumber();
  if (!result.resultFlag) {
    throw new Error('案件编号生成失败。');
  }
  return result.data;
}
```

#### userParam 的值均为字符串类型

`userParam`（从画面表单传递的用户数据）的值**均为字符串类型**。
传递给 `DbParameter.number()` 时，必须先用 `Number()` 转换为数值。
不转换直接以字符串传递会导致 `IllegalArgumentException: Data must be Number or null in case TYPE_NUMBER specified.` 异常。

```javascript
// NG：userParam 的值为字符串，DbParameter.number() 会抛出异常
DbParameter.number(userParam.unitPrice)

// OK：用 Number() 转换后再传递
DbParameter.number(Number(userParam.unitPrice))
```

#### apply / applyFromUnapply 中的数据保存

在 `apply` 函数中对用户数据（业务表）执行 INSERT 时，注意**撤回后的再申请（`applyFromUnapply`）时数据已存在**。

- 撤回：申请者撤回申请 → 案件返回"未申请状态"
- 再申请：对未申请状态的案件再次申请 → **调用 `applyFromUnapply`**
- 若 `applyFromUnapply` 委托给 `apply`，`apply` 中的 INSERT 将导致唯一约束违反

**对策：** 在 `apply` 中 INSERT 数据前判断是否存在已有数据，根据情况切换 INSERT / UPDATE。

```javascript
function apply(parameter, userParam) {
  // ...
  saveLeaveRequest(parameter, userParam);  // INSERT 或 UPDATE
  // ...
}

function saveLeaveRequest(parameter, userParam) {
  let db = new TenantDatabase();
  let checkSql = 'SELECT COUNT(*) AS record_count FROM your_table WHERE user_data_id = ?';
  let checkResult = db.select(checkSql, [DbParameter.string(parameter.userDataId)]);
  let exists = checkResult.isSuccess() && checkResult.data.length > 0 &&
    (parseInt(checkResult.data[0].record_count, 10) || 0) > 0;

  if (exists) {
    updateRecord(parameter, userParam);
  } else {
    insertRecord(parameter, userParam);
  }
}
```
