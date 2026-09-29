# 工作流 案件归档处理监听器模板

## 概述

IM-Workflow 案件归档处理监听器程序的模板。
无需画面，在将已完成案件归档（转移）到历史案件表时自动执行的批处理类处理。
函数 `execute(loginGroupId, localeId, systemMatterId, userDataId)` 由工作流引擎调用。

与其他工作流处理程序不同，参数以单独的值传递，而非 `parameter` 对象。

**注意**：请勿在本程序中开启 DB 事务。

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  └── matter_archive_listener.js       # 案件归档处理监听器
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

## 案件归档处理监听器（matter_archive_listener.js）

```javascript
/**
 * 工作流 案件归档处理监听器
 *
 * @file matter_archive_listener.js
 * @description 在将已完成案件归档（转移）到历史案件表时执行的监听器程序。
 *              请勿在本程序中开启 DB 事务。
 */

/**
 * 执行案件归档处理。
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

    try {
        processBusinessLogic(systemMatterId, userDataId);
    } catch (e) {
        logger.error('[matterArchive] 发生错误。systemMatterId={}, error={}', systemMatterId, e.message);
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
    // TODO: 请在此实现案件归档时的业务逻辑
    //
    // 主要用途：
    //   - 将自定义表的数据迁移到历史案件用表
    //   - 向外部系统发送归档通知
    //   - 归档附件等相关资源
}
```

---

## 可用模板

- **案件归档处理监听器**：[assets/simple-matter-archive-listener.md](assets/simple-matter-archive-listener.md)
  - 已完成案件转移到历史案件表时执行的监听器处理
  - 参数以单独的值传递，而非 `parameter` 对象
  - 不得开启 DB 事务

### 生成时的指示示例

当用户请求"创建工作流案件归档处理监听器"时，参考此 assets 中的代码，适当定制后生成。
