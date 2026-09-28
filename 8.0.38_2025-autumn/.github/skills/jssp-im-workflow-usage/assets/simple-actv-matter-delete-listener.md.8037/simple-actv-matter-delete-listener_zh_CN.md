# 工作流 未完成案件删除监听器模板

## 概述

IM-Workflow 未完成案件删除处理监听器程序的模板。
无需画面，在未完成案件删除时自动执行的批处理类处理。
函数 `execute(loginGroupId, localeId, systemMatterId, userDataId)` 由工作流引擎调用。

与其他工作流处理程序不同，参数以单独的值传递，而非 `parameter` 对象。

**注意**：请勿在本程序中开启 DB 事务。

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  └── actv_matter_delete_listener.js   # 未完成案件删除监听器
```

---

## 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| loginGroupId | String | 登录组ID（已废弃，与租户ID相同） |
| localeId | String | 区域设置ID |
| systemMatterId | String | 系统案件ID |
| userDataId | String | 用户数据ID |

## 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |

---

## 未完成案件删除监听器（actv_matter_delete_listener.js）

```javascript
/**
 * 工作流 未完成案件删除监听器
 *
 * @file actv_matter_delete_listener.js
 * @description 在未完成案件删除时执行的监听器程序。
 *              请勿在本程序中开启 DB 事务。
 */

/**
 * 执行未完成案件删除处理。
 *
 * @param {String} loginGroupId - 登录组ID
 * @param {String} localeId - 区域设置ID
 * @param {String} systemMatterId - 系统案件ID
 * @param {String} userDataId - 用户数据ID
 * @return {Object} 处理结果
 */
function execute(loginGroupId, localeId, systemMatterId, userDataId) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    logger.info('[actvMatterDelete] 未完成案件删除处理开始 systemMatterId={}', systemMatterId);
    try {
        processBusinessLogic(systemMatterId, userDataId);
        logger.info('[actvMatterDelete] 未完成案件删除处理完成 systemMatterId={}', systemMatterId);
    } catch (e) {
        logger.error('[actvMatterDelete] 发生错误。systemMatterId={}, error={}', systemMatterId, e.message);
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
 * @param {String} systemMatterId - 系统案件ID
 * @param {String} userDataId - 用户数据ID
 */
function processBusinessLogic(systemMatterId, userDataId) {
    // TODO: 请在此实现未完成案件删除时的业务逻辑
    //
    // 主要用途：
    //   - 删除与案件关联的自定义表数据
    //   - 向外部系统发送删除通知
    //   - 清理附件等相关资源
}
```

---

## 可用模板

- **未完成案件删除监听器**：[assets/simple-actv-matter-delete-listener.md](assets/simple-actv-matter-delete-listener.md)
  - 未完成案件删除时执行的监听器处理
  - 参数以单独的值传递，而非 `parameter` 对象
  - 不得开启 DB 事务

### 生成时的指示示例

当用户请求"创建工作流未完成案件删除监听器"时，参考此 assets 中的代码，适当定制后生成。
