# UserActvMatterPropertyValue API 参考

## 概述

`UserActvMatterPropertyValue` 是用户数据案件属性信息管理器对象。
负责用户数据案件属性信息的新建注册、更新和删除。

本对象以**用户数据ID**为键进行搜索和更新处理。
搜索和更新处理的目标表为未完成案件相关表 `imw_t_user_data`。

- 操作已完成案件的用户数据属性信息时，使用 `UserCplMatterPropertyValue`
- 操作历史案件的用户数据属性信息时，使用 `UserArcMatterPropertyValue`
- 以系统案件ID为键从未完成案件获取用户数据案件属性信息时，使用 `ActvMatter`

## 构造函数

```javascript
let manager = new UserActvMatterPropertyValue();
```

无参数。

## 方法列表

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| createMatterProperty(Array) | WorkflowResultInfo\<null\> | 新建注册案件属性信息 |
| updateMatterProperty(Array) | WorkflowResultInfo\<null\> | 更新案件属性信息 |
| deleteMatterProperty(Array) | WorkflowResultInfo\<null\> | 删除案件属性信息 |
| getMatterPropertyList(String) | WorkflowResultInfo\<UserMatterPropertyInfo[]\> | 通过用户数据ID获取案件属性列表 |
| getMatterProperty(String, String) | WorkflowResultInfo\<UserMatterPropertyInfo\> | 通过用户数据ID和键获取案件属性 |
| getMatterPropertyListCount(String) | WorkflowResultInfo\<number\> | 通过用户数据ID获取案件属性件数 |

## 方法详细

### createMatterProperty

新建注册用户数据案件属性信息。

```javascript
WorkflowResultInfo<null> createMatterProperty(Array matterProperty)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| matterProperty | UserMatterPropertyInfo[] | 用户数据案件属性信息对象的数组 |

| 返回值 | 说明 |
|--------|------|
| WorkflowResultInfo\<null\> | 处理结果。`data` 属性设置为 `null` |

- 以 **insert** 方式注册到 `imw_t_user_data` 表
- 未设置数组时，返回包含错误信息的结果对象
- 注册目标数组的件数与实际成功注册件数不同时，也返回错误
- 已存在相同键时，会产生**唯一约束违反错误**（不进行覆盖）
- **内部不进行事务控制**。需要外部控制

### updateMatterProperty

更新用户数据案件属性信息。

```javascript
WorkflowResultInfo<null> updateMatterProperty(Array matterProperty)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| matterProperty | UserMatterPropertyInfo[] | 用户数据案件属性信息对象的数组 |

| 返回值 | 说明 |
|--------|------|
| WorkflowResultInfo\<null\> | 处理结果。`data` 属性设置为 `null` |

- 以"用户数据ID"和"案件属性键"为键，更新键以外的已设置值
- 未设置值的项目（`null` 的项目）**不作为更新对象**
- 未设置数组时，返回错误
- 更新的数据件数少于1件时，也返回错误
- **内部不进行事务控制**。需要外部控制

### deleteMatterProperty

删除用户数据案件属性信息。

```javascript
WorkflowResultInfo<null> deleteMatterProperty(Array matterProperty)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| matterProperty | UserMatterPropertyInfo[] | 用户数据案件属性信息对象的数组 |

| 返回值 | 说明 |
|--------|------|
| WorkflowResultInfo\<null\> | 处理结果 |

- **内部不进行事务控制**。需要外部控制

### getMatterPropertyList

获取与指定用户数据ID关联的案件属性信息列表。

```javascript
WorkflowResultInfo<UserMatterPropertyInfo[]> getMatterPropertyList(String userDataId)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| userDataId | String | 用户数据ID |

| 返回值 | 说明 |
|--------|------|
| WorkflowResultInfo\<UserMatterPropertyInfo[]\> | 在 `data` 中存储案件属性信息对象的数组 |

### getMatterProperty

获取与指定用户数据ID和案件属性键匹配的案件属性信息。

```javascript
WorkflowResultInfo<UserMatterPropertyInfo> getMatterProperty(String userDataId, String key)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| userDataId | String | 用户数据ID |
| key | String | 案件属性键 |

| 返回值 | 说明 |
|--------|------|
| WorkflowResultInfo\<UserMatterPropertyInfo\> | 在 `data` 中存储案件属性信息对象 |

### getMatterPropertyListCount

获取与指定用户数据ID关联的案件属性件数。

```javascript
WorkflowResultInfo<number> getMatterPropertyListCount(String userDataId)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| userDataId | String | 用户数据ID |

| 返回值 | 说明 |
|--------|------|
| WorkflowResultInfo\<number\> | 在 `data` 中存储案件属性的件数 |

## 案件属性信息对象的结构

`createMatterProperty` / `updateMatterProperty` / `deleteMatterProperty` 的参数数组的各元素，以及 `getMatterProperty` / `getMatterPropertyList` 的返回值 `data` 中使用的对象。

| 属性 | 类型 | 说明 |
|-----------|------|------|
| userDataId | String | 用户数据ID |
| matterPropertyKey | String | 案件属性键 |
| matterPropertyValue | String | 案件属性值 |

## 使用示例

### 案件属性的新建注册

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();
let properties = [
  { userDataId: 'UD001', matterPropertyKey: 'product_code', matterPropertyValue: 'A001' },
  { userDataId: 'UD001', matterPropertyKey: 'product_name', matterPropertyValue: '示例商品' }
];

let result = manager.createMatterProperty(properties);
if (!result.resultFlag) {
  logger.error('案件属性注册失败。{}', result.resultStatus.messageId);
}
```

### 案件属性的更新

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();
let properties = [
  { userDataId: 'UD001', matterPropertyKey: 'product_code', matterPropertyValue: 'A002' }
];

let result = manager.updateMatterProperty(properties);
if (!result.resultFlag) {
  logger.error('案件属性更新失败。{}', result.resultStatus.messageId);
}
```

### 案件属性的获取

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();

// 列表获取
let listResult = manager.getMatterPropertyList('UD001');
for (let i = 0; i < listResult.data.length; i++) {
  logger.info('{} = {}', listResult.data[i].matterPropertyKey, listResult.data[i].matterPropertyValue);
}

// 单个获取
let itemResult = manager.getMatterProperty('UD001', 'product_code');
logger.info('product_code = {}', itemResult.data.matterPropertyValue);

// 件数获取
let countResult = manager.getMatterPropertyListCount('UD001');
logger.info('属性件数：{}', countResult.data);
```

### 案件属性的注册/更新（带存在检查）

由于 `createMatterProperty` 已存在相同键时会产生唯一约束违反，需进行存在检查，根据情况切换注册或更新。

```javascript
let logger = Logger.getLogger();
let manager = new UserActvMatterPropertyValue();
let userDataId = 'UD001';
let propertyKey = 'product_code';
let propertyValue = 'A003';

let existing = manager.getMatterProperty(userDataId, propertyKey);
let properties = [
  { userDataId: userDataId, matterPropertyKey: propertyKey, matterPropertyValue: propertyValue }
];

let result;
if (existing.data) {
  result = manager.updateMatterProperty(properties);
} else {
  result = manager.createMatterProperty(properties);
}

if (!result.resultFlag) {
  logger.error('案件属性处理失败。{}', result.resultStatus.messageId);
}
```

## 注意事项

- 所有方法均**内部不进行事务控制**。根据需要在外部使用 `Transaction.begin` 等
- `createMatterProperty` 执行 insert，因此相同键已存在时会产生唯一约束违反错误。不确定是否已注册时，请使用 `getMatterProperty` 进行存在检查
- `updateMatterProperty` 将 `null` 字段排除在更新对象之外。以清除值为目的传递 `null` 也不会更新
- 案件属性定义事后添加时，添加前申请的案件中不存在该属性。审批时调用 `updateMatterProperty` 会报错，因此请用 `getMatterProperty` 确认是否存在，不存在时使用 `createMatterProperty` 注册
