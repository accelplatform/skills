# 工作流 历史案件删除监听器模板

## 概述

IM-Workflow 历史案件删除处理监听器程序的模板。
无需画面，在历史案件删除时自动执行的批处理类处理。
函数 `execute(loginGroupId, localeId, systemMatterId, userDataId, archiveMonth)` 由工作流引擎调用。

与其他工作流处理程序不同，参数以单独的值传递，而非 `parameter` 对象。
与未完成案件、已完成案件的删除监听器的区别在于，还会额外传递 `archiveMonth`（归档年月）。

**注意**：请勿在本程序中开启 DB 事务。

## 文件结构

```
src/main/jssp/src/{功能名}/workflow/
  └── arc_matter_delete_listener.js    # 历史案件删除监听器
```

---

## 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| loginGroupId | String | 登录组ID（已废弃，与租户ID相同） |
| localeId | String | 区域设置ID |
| systemMatterId | String | 系统案件ID |
| userDataId | String | 用户数据ID |
| archiveMonth | String | 归档年月（yyyyMM 格式） |

## 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| resultFlag | Boolean | 结果标志（`true`：成功 / `false`：失败） |
| message | String | 结果消息（仅在失败时） |

---

## 历史案件删除监听器（arc_matter_delete_listener.js）

```javascript
/**
 * 工作流 历史案件删除监听器
 *
 * @file arc_matter_delete_listener.js
 * @description 在历史案件删除时执行的监听器程序。
 *              请勿在本程序中开启 DB 事务。
 */

/**
 * 执行历史案件删除处理。
 *
 * @param {String} loginGroupId - 登录组ID
 * @param {String} localeId - 区域设置ID
 * @param {String} systemMatterId - 系统案件ID
 * @param {String} userDataId - 用户数据ID
 * @param {String} archiveMonth - 归档年月（yyyyMM 格式）
 * @return {Object} 处理结果
 */
function execute(loginGroupId, localeId, systemMatterId, userDataId, archiveMonth) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic(systemMatterId, userDataId, archiveMonth);
    } catch (e) {
        logger.error('[arcMatterDelete] 发生错误。systemMatterId={}, archiveMonth={}, error={}', systemMatterId, archiveMonth, e.message);
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
 * @param {String} archiveMonth - 归档年月（yyyyMM 格式）
 */
function processBusinessLogic(systemMatterId, userDataId, archiveMonth) {
    // TODO: 请在此实现历史案件删除时的业务逻辑
    //
    // 主要用途：
    //   - 删除与案件关联的自定义表数据
    //   - 向外部系统发送删除通知
    //   - 清理附件等相关资源
    //
    // archiveMonth 为归档年月（yyyyMM 格式）
    //   - 可用于识别历史案件表的分区
}
```

---

## 可用模板

- **历史案件删除监听器**：[assets/simple-arc-matter-delete-listener.md](assets/simple-arc-matter-delete-listener.md)
  - 历史案件删除时执行的监听器处理
  - 参数以单独的值传递，而非 `parameter` 对象
  - 与其他删除监听器的区别在于还会额外传递 `archiveMonth`（归档年月）
  - 不得开启 DB 事务

### 生成时的指示示例

当用户请求"创建工作流历史案件删除监听器"时，参考此 assets 中的代码，适当定制后生成。
