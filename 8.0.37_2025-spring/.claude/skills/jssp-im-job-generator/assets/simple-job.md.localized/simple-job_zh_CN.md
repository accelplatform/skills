# 作业调度器 作业程序模板

## 概述

作业调度器执行的作业程序模板。
该处理为无界面的批处理，通过调度或手动执行。
函数 `execute()` 由作业调度器调用。

## 文件结构

```
src/main/jssp/src/{功能名}/job/
  └── sample_job.js               # 作业程序
```

---

## 参数获取

作业参数通过 `Contexts.getJobSchedulerContext()` 获取。

```javascript
let context = Contexts.getJobSchedulerContext();
let paramValue = context.getParameter('param-name');
```

## 返回值

| 属性 | 类型 | 说明 |
|-----------|------|------|
| status | String | `"success"` / `"error"` / `"warning"` 之一 |
| message | String | 执行结果消息（显示在作业监控画面上） |

---

## 作业程序（sample_job.js）

```javascript
/**
 * 作业调度器 作业程序
 *
 * @file sample_job.js
 * @description 由作业调度器执行的批处理程序。
 */

// ========================================
// 入口点
// ========================================
/**
 * 作业执行的入口点。
 * 由作业调度器调用。
 *
 * @return {Object} 执行结果对象（JobResult 对象）
 */
function execute() {
  let logger = Logger.getLogger();
  logger.info('[SampleJob] 开始执行作业。');

  let txResult = Transaction.begin(function() {
    try {
      processBusinessLogic();
    } catch (e) {
      logger.error('[SampleJob] 发生错误。error={}', e.message);
      Transaction.rollback();
      return false;
    }
  });

  if (txResult.error) {
    logger.error('[SampleJob] 发生事务错误。error={}', txResult.errorMessage);
    return {
      status: 'error',
      message: '作业执行过程中发生错误。'
    };
  }

  logger.info('[SampleJob] 作业正常结束。');
  return {
    status: 'success',
    message: '作业已成功完成。'
  };
}

// ========================================
// 业务逻辑
// ========================================
/**
 * 执行业务逻辑的主要处理。
 */
function processBusinessLogic() {
  // 获取参数
  let context = Contexts.getJobSchedulerContext();
  let targetDate = context.getParameter('target-date');

  // TODO: 请在此处实现业务逻辑
  //
  // 可用的主要参数：
  //   context.getParameter('param-name')   - 作业中设置的参数
  //   context.getJobDetail()               - 作业详细信息
  //   context.getJobnet()                  - 作业网络信息
  //   context.getTrigger()                 - 触发器信息
}
```

---

## 可用模板

- **作业程序**: [assets/simple-job.md](assets/simple-job.md)
  - 由作业调度器执行的批处理
  - 使用 `Transaction.begin` 的事务管理模式
  - 使用 `Contexts.getJobSchedulerContext()` 获取参数
  - 出错时回滚并返回 `status: "error"`

### 生成时的指示示例

当用户请求"创建批处理"或"实现作业程序"时，参考此 assets 中的代码，生成适当的自定义版本。
