# EL 表达式参考

在 IM-LogicDesigner 中，可以在部分字段中嵌入 EL（Expression Language）表达式。

## 可使用的位置

- `im_sequence` 的 `properties.condition`
- `im_errorEnd` 的 `properties.errorMessage`
- 其他包含 `${...}` 的字符串类型 properties

## 语法

```
${ <表达式> }
```

`${}` 外部作为字面字符串原样处理，内部作为表达式进行求值。
表达式和字符串可以混合使用。

## 表达式中可使用的内容

| 引用 | 说明 |
|---|---|
| `$input.foo.bar` | 输入数据 |
| `$output.data.xxx` | 输出数据 |
| `$variable.xxx` | 流变量 |
| `$const.NAME` | 常量 |
| `$session_properties.xxx` | 会话信息（详见后文） |
| `$account_context.xxx` | 账号上下文（详见后文） |
| `$user_context.xxx` | 用户上下文（详见后文） |
| `$task_result.xxx` | 处理结果信息（详见后文） |
| `$external_user_context.xxx` | 外部用户上下文（详见后文） |
| `<executeId>.<field>` | 前一任务的输出 |

**注意：** EL 表达式内使用 `.` 分隔，`source.path` 内使用 `/` 分隔。请勿混淆。

### $account_context

账号上下文。可以引用登录用户的会话信息。

| 属性 | 类型 | 说明 |
|-----------|------|------|
| `applicationLicenses` | string[] | 应用程序许可证列表 |
| `authenticated` | boolean | 是否已认证 |
| `calendarId` | string | 日历 ID |
| `dateTimeFormats` | object | 日期时间格式设置 |
| `dateTimeFormats.dateInput` | string | 日期输入格式 |
| `dateTimeFormats.dateSimple` | string | 日期简易格式 |
| `dateTimeFormats.dateStandard` | string | 日期标准格式 |
| `dateTimeFormats.timeInput` | string | 时间输入格式 |
| `dateTimeFormats.timeStandard` | string | 时间标准格式 |
| `dateTimeFormats.timeTimestamp` | string | 时间戳格式 |
| `encoding` | string | 字符编码 |
| `firstDayOfWeek` | integer | 一周的开始日（`0`: 周日 ~ `6`: 周六） |
| `homeUrl` | string | 主页 URL |
| `locale` | locale | 区域设置（"ja" / "en" / "zh_CN" 等） |
| `loginTime` | date | 登录日期时间 |
| `roleIds` | string[] | 拥有的角色 ID 列表 |
| `tenantId` | string | 租户 ID |
| `themeId` | string | 主题 ID |
| `timeZone` | timezone | 时区 |
| `userCd` | string | 用户代码 |
| `userType` | string | 用户类型（`"user"`: 普通用户, `"administrator"`: 系统管理员） |

### $user_context

用户上下文。可以引用登录用户的所属组织和个人资料信息。

#### currentDepartment（所属组织）

| 属性 | 类型 | 说明 |
|-----------|------|------|
| `currentDepartment.companyCd` | string | 公司代码 |
| `currentDepartment.departmentCd` | string | 组织代码 |
| `currentDepartment.departmentFullName` | string | 组织全称 |
| `currentDepartment.departmentName` | string | 组织名称 |
| `currentDepartment.departmentSearchName` | string | 组织搜索名 |
| `currentDepartment.departmentSetCd` | string | 组织集合代码 |
| `currentDepartment.departmentShortName` | string | 组织简称 |

#### userProfile（用户个人资料）

| 属性 | 类型 | 说明 |
|-----------|------|------|
| `userProfile.address1` | string | 地址 1 |
| `userProfile.address2` | string | 地址 2 |
| `userProfile.address3` | string | 地址 3 |
| `userProfile.countryCd` | string | 国家代码（自由输入，无代码体系规定） |
| `userProfile.emailAddress1` | string | 电子邮件地址 1 |
| `userProfile.emailAddress2` | string | 电子邮件地址 2 |
| `userProfile.extensionFaxNumber` | string | 传真分机号 |
| `userProfile.extensionNumber` | string | 分机号 |
| `userProfile.faxNumber` | string | 传真号码 |
| `userProfile.mobileEmailAddress` | string | 手机邮件地址 |
| `userProfile.mobileNumber` | string | 手机号码 |
| `userProfile.notes` | string | 备注 |
| `userProfile.sex` | string | 性别（`"0"`: 男性, `"1"`: 女性, `"9"`: 其他） |
| `userProfile.telephoneNumber` | string | 电话号码 |
| `userProfile.url` | string | URL |
| `userProfile.userCd` | string | 用户代码 |
| `userProfile.userName` | string | 用户名 |
| `userProfile.userSearchName` | string | 用户搜索名 |
| `userProfile.zipCode` | string | 邮政编码 |

### $session_properties

会话属性。可以引用流执行时的系统信息。

| 属性 | 类型 | 说明 |
|-----------|------|------|
| `baseUrl` | string | 基础 URL |
| `fileSeparator` | string | 文件分隔符 |
| `flowId` | string | 正在执行的流 ID |
| `lineSeparator` | string | 换行符 |
| `startTime` | date | 流开始日期时间 |
| `systemDate` | date | 系统日期 |
| `version` | integer | 流版本 |

### $task_result

处理结果信息。可以引用前一任务执行结果的错误信息。

| 属性 | 类型 | 说明 |
|-----------|------|------|
| `error` | boolean | 是否发生错误 |
| `errorMessage` | string | 错误消息 |
| `errorReport` | string | 错误报告 |
| `executeId` | string | 执行任务的 executeId |
| `stackTrace` | string | 堆栈跟踪 |

### $external_user_context

外部用户上下文。可以判断是否为外部用户。

| 属性 | 类型 | 说明 |
|-----------|------|------|
| `externalUser` | boolean | 是否为外部用户 |

## 运算符和函数

### 运算符

- 三元运算符：`cond ? a : b`
- 比较：`==`, `!=`, `<`, `>`, `<=`, `>=`
- 逻辑：`&&`, `||`, `!`

### 函数

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `isEmpty(x)` | 数组 / Map / 字符串 / null / 其他 | boolean | 判断是否为空。数组或 Map 元素数为 0 时返回 true，字符串为 null 或长度为 0 时返回 true，null 返回 true，其他返回 false |
| `sizeOf(x)` | 数组 / Map / 字符串 | integer | 返回元素数量或字符数 |
| `contains(collection, value)` | 第 1 参数：数组或 Map，第 2 参数：搜索值 | boolean | 数组中存在该元素或 Map 中存在该键时返回 true，其他返回 false |
| `indexOf(x, search)` | 第 1 参数：数组或字符串，第 2 参数：搜索值 | integer | 返回第一次找到的索引。未找到时返回 -1 |
| `lastIndexOf(x, search)` | 第 1 参数：数组或字符串，第 2 参数：搜索值 | integer | 返回最后一次找到的索引。未找到时返回 -1 |

## 示例

### gateway 条件分支

```jsonc
{
  "from": "im_gateway1",
  "to": "im_repositoryEntityDataUpdate1",
  "condition": "${!isEmpty(im_repositorySearchEntityData1)}"
}
```

### errorMessage 的多语言化

```jsonc
{
  "type": "im_errorEnd",
  "properties": {
    "errorMessage": "${$account_context.locale=='ja'?$const.ERROR_NO_ARTICLE_FOUND_JA:($account_context.locale=='zh_CN'?$const.ERROR_NO_ARTICLE_FOUND_ZH_CN:$const.ERROR_NO_ARTICLE_FOUND_EN)}"
  }
}
```
