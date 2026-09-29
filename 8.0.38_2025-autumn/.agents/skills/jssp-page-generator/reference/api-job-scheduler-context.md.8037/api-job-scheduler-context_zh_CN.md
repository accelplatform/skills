# JobSchedulerContext API 参考手册

## 概述

JobSchedulerContext 是作业调度器启动作业执行时可使用的访问上下文。
存储作业网络执行的所有信息。

### 获取方法

```javascript
let jobSchedulerContext = Contexts.getJobSchedulerContext();
```

## 属性列表

| 属性 | 类型 | 说明 |
|-----------|------|------|
| fireDate | Date | 执行日期时间 |
| jobDetail | JobDetail | 作业信息对象 |
| jobnet | Jobnet | 作业网络信息对象 |
| mergedParameters | Object | 按优先级顺序合并作业、作业网络、触发器和运行时参数的参数 |
| monitorId | String | 监控ID |
| nextFireDate | Date | 下次执行日期时间 |
| parameters | Object | 执行中添加的参数（不包含作业设置值） |
| previousFireDate | Date | 上次执行日期时间 |
| taskId | String | 任务ID |
| trigger | Trigger | 触发器信息对象 |

## 方法列表

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| getMergedParameters() | Object | 按优先级顺序合并获取各参数 |
| getParameter(key) | String | 按优先级顺序获取指定键的参数 |
| putParameter(key, value) | void | 向运行时参数添加 |
| putParameters(parameters) | void | 向运行时参数批量添加多个 |

### 参数优先级

参数按以下优先级解析（上方优先级更高）。

1. 执行中添加的参数
2. 触发器的参数
3. 作业网络的参数
4. 作业的参数

## 方法详情

### getParameter(key)

按优先级获取指定键的参数。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| key | String | 参数键 |

**返回值**：String - 参数值

### putParameter(key, value)

向运行时参数添加指定参数。添加的参数可通过 `getParameter()` 优先返回。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| key | String | 参数键 |
| value | String | 参数值 |

### putParameters(parameters)

向运行时参数批量添加多个参数。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| parameters | Object | 参数对象（键和值均以字符串指定） |

## 关联对象

### JobDetail

存储作业定义的详细信息。

| 属性 | 类型 | 说明 |
|-----------|------|------|
| id | String | 作业ID |
| categoryId | String | 作业分类ID |
| jobType | String | 作业执行语言（`JAVA` 或 `SCRIPT`） |
| localizes | Object | 国际化信息（各语言环境的name、description） |
| parameters | Object | 作业参数 |

### Jobnet

存储作业网络信息。

| 属性 | 类型 | 说明 |
|-----------|------|------|
| id | String | 作业网络ID |
| categoryId | String | 作业网络分类ID |
| disallowConcurrent | Boolean | 不允许并行执行时为 `true` |
| jobIds | Array(String) | 执行作业数组（按执行顺序） |
| useJobIds | Array(String) | 作业网络中使用的作业ID数组 |
| localizes | Object | 国际化信息（各语言环境的name、description） |
| parameters | Object | 作业网络参数 |

### Trigger

触发器信息对象。根据触发器类型分为以下3类：

- **DatetimeTrigger** - 日期时间指定触发器
- **RepeatTrigger** - 重复指定触发器
- **BusinessDayTrigger** - 营业日指定触发器

## 使用示例

### 获取参数

```javascript
function init(request) {
  let context = Contexts.getJobSchedulerContext();

  // 按优先级获取参数
  let value = context.getParameter('KEY');

  // 直接获取作业的设置参数
  let jobParam = context.jobDetail.parameters.KEY;

  // 获取合并后的所有参数
  let allParams = context.getMergedParameters();
}
```

### 添加运行时参数

```javascript
function init(request) {
  let context = Contexts.getJobSchedulerContext();

  // 添加单个参数
  context.putParameter('resultKey', 'resultValue');

  // 批量添加多个参数
  context.putParameters({
    'key1': 'value1',
    'key2': 'value2'
  });
}
```

### 获取作业执行信息

```javascript
function init(request) {
  let context = Contexts.getJobSchedulerContext();

  let jobId = context.jobDetail.id;
  let jobnetId = context.jobnet.id;
  let monitorId = context.monitorId;
  let fireDate = context.fireDate;
  let nextFireDate = context.nextFireDate;
}
```