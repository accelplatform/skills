---
paths:
  - "src/main/jssp/**/job/**/*.js"
---

# 作业调度器规约

## 概述

作业调度器是用于执行批处理和计划任务的功能。
在脚本开发模型中实现作业程序时，使用与画面处理不同的入口点（`execute` 函数）。

**特点**：
- 由于不涉及画面跳转，不需要表示层页面（.html）
- 入口点为 **`execute()`**，而非 `init()`
- 参数以字符串形式传递
- 执行结果以状态对象返回

## execute 函数的实现

### 基本结构

```javascript
/**
 * 作业执行的入口点
 *
 * @param {string} params - 作业参数（字符串格式）
 * @return {Object} 执行结果对象（JobResult 对象）
 */
function execute(params) {
  let logger = Logger.getLogger();
  let result = {
    status: 'success',
    message: ''
  };

  try {
    logger.info('作业开始：daily_report');

    let config = parseParams(params);
    let processResult = processBusinessLogic(config);

    result.message = '处理件数：' + processResult.count + '件';
    logger.info('作业正常结束：{}', result.message);

  } catch (e) {
    result.status = 'error';
    result.message = '作业执行错误：' + e.message;
    logger.error('作业异常结束：{}', e.message);
  }

  return result;
}

/**
 * 参数解析与验证
 */
function parseParams(params) {
  let logger = Logger.getLogger();

  if (!params || params === '') {
    return { targetDate: getCurrentDate() };
  }

  try {
    return JSON.parse(params);
  } catch (e) {
    logger.warn('参数解析失败，使用默认值');
    return { targetDate: getCurrentDate() };
  }
}
```

### 返回值规格

| 属性 | 类型 | 说明 |
|-----------|------|------|
| status | string | `"success"`、`"error"`、`"warning"` 之一 |
| message | string | 执行结果消息（显示在作业监控画面上） |

```javascript
// 正常结束
return { status: 'success', message: '已处理100件' };

// 警告结束
return { status: 'warning', message: '处理完成（无目标数据）' };

// 错误结束
return { status: 'error', message: '数据库连接错误' };
```

**注意**：
- 当 `status` 为 `"error"` 时，作业网络将被视为异常结束
- 由于 `message` 会记录在监控表中，**不得包含敏感信息**

## 参数设计

### JSON 格式（推荐）

```javascript
// 参数示例：{"targetDate":"2026-01-15","mode":"full","maxRecords":1000}

function execute(params) {
  let config = JSON.parse(params);
  let targetDate = config.targetDate;
  let mode = config.mode;
  let maxRecords = config.maxRecords;
}
```

### 指导原则

| 项目 | 推荐事项 |
|------|----------|
| 格式 | 多个参数时使用 JSON 格式 |
| 必填/可选 | 设置默认值，使作业在无参数时也能运行 |
| 敏感信息 | **不得**包含密码、令牌等 |
| 验证 | 实现解析失败时的回退处理 |

## 作业注册

从租户管理员画面注册：
1. 选择**作业调度器** → **作业**
2. 点击**新建**
3. 配置以下项目

| 项目 | 说明 | 示例 |
|------|------|-----|
| 作业ID | 作业标识符（任意） | `BATCH_DAILY_REPORT` |
| 作业名称 | 显示名称 | `日报生成` |
| 执行程序 | 从 `src/main/jssp/src/` 开始的相对路径（不含扩展名） | `sample/job/daily_report` |
| 参数 | 传递给作业的参数 | `{"mode":"full"}` |

## 作业网络的限制

- 标准功能仅支持**串行执行**（不支持分支和并行处理）
- 每个作业在独立的事务中执行
- 若前一个作业出现错误，后续作业将不会执行

## 从程序触发作业执行

```javascript
function triggerJob() {
  let logger = Logger.getLogger();
  let jobId = 'BATCH_DAILY_REPORT';
  let params = JSON.stringify({
    targetDate: formatDate(new Date()),
    triggeredBy: 'manual'
  });

  try {
    let result = JobSchedulerManager.execute(jobId, params);

    if (result.error) {
      logger.error('作业启动失败：{}', result.errorMessage);
      return false;
    }

    logger.info('作业启动成功：{}', jobId);
    return true;

  } catch (e) {
    logger.error('作业执行时发生错误：{}', e.message);
    return false;
  }
}
```
