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
- 入口点为 **`execute()`**，而非 `init()`（**不接受参数**）
- 参数通过函数开头的 `@parameter` 注解声明，并通过 `Contexts.getJobSchedulerContext().getParameter()` 获取
- 执行结果以状态对象返回

## execute 函数的实现

### 基本结构

`execute()` **不接受参数**。要接收的参数通过函数开头的 `@parameter` 注解声明，并通过 `Contexts.getJobSchedulerContext().getParameter('<参数名>')` 获取。

```javascript
/**
 * 作业执行的入口点
 *
 * @parameter targetDate
 * @return {Object} 执行结果对象（JobResult 对象）
 */
function execute() {
  let logger = Logger.getLogger();
  let result = {
    status: 'success',
    message: ''
  };

  try {
    logger.info('作业开始：daily_report');

    let context = Contexts.getJobSchedulerContext();
    let targetDate = context.getParameter('targetDate') || getCurrentDate();

    let processResult = processBusinessLogic(targetDate);

    result.message = '处理件数：' + processResult.count + '件';
    logger.info('作业正常结束：{}', result.message);

  } catch (e) {
    result.status = 'error';
    result.message = '作业执行错误：' + e.message;
    logger.error('作业异常结束：{}', e.message);
  }

  return result;
}
```

> ⚠️ 像 `function execute(params)` 那样通过参数接收字符串并调用 `JSON.parse()` 的实现是**错误的**。作业调度器以无参数方式调用 `execute()`，因此参数必须通过 `getParameter()` 获取。

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

### 通过 `@parameter` 注解声明

作业接收的参数在 `execute()` 紧前的 JSDoc 注释中用 `@parameter` 声明。声明的各个参数通过 `getParameter('<参数名>')` **逐个以字符串形式**获取。

```javascript
/**
 * @parameter targetDate 2026-01-15
 * @parameter mode full
 * @parameter maxRecords 1000
 */
function execute() {
  let context = Contexts.getJobSchedulerContext();
  let targetDate = context.getParameter('targetDate');
  let mode = context.getParameter('mode');
  let maxRecords = parseInt(context.getParameter('maxRecords'), 10);
}
```

- 书式为 `@parameter <参数名> <默认值>`（默认值可省略）
- 声明的参数默认值可在作业注册时由管理员覆盖设置
- `getParameter()` 始终返回**字符串**。需要数值或布尔值时请显式转换（如 `parseInt`）
- ⚠️ **请勿在说明文字中书写 `@parameter` 这一字符串。** 解析器即使在行中也会检测到 `@parameter`，并错误地将其后的词声明为参数名（例如「用 `@parameter` 声明」会生成名为「声明」的参数）。需要说明时请改用「注解」等表述

### 指导原则

| 项目 | 推荐事项 |
|------|----------|
| 声明 | 用 `@parameter` 显式声明接收的参数 |
| 必填/可选 | 设置默认值，使作业在未设置（`null`）时也能运行 |
| 类型转换 | `getParameter()` 返回字符串，数值等需显式转换 |
| 敏感信息 | **不得**包含密码、令牌等 |

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
| 参数 | 为程序中用 `@parameter` 声明的各参数设置值（初始显示 `@parameter` 的默认值） | `mode` = `full` |

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
