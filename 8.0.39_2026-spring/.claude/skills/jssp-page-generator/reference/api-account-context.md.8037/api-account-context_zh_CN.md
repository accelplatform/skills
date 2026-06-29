---
paths:
  - "src/main/jssp/**/*.js"
---

# AccountContext API 参考手册

## 概述

AccountContext 是一个必要的访问上下文，用于保存已访问账户的相关信息。
可以获取用户编码、语言环境等账户信息以及认证状态。

- 判断是否已认证
- 若已认证，可获取已登录用户的信息（用户编码、所拥有的角色等）

### 获取方法

```javascript
let accountContext = Contexts.getAccountContext();
```

## 属性列表

| 属性 | 类型 | 说明 | 备注 |
|-----------|------|------|------|
| applicationLicenses | Array(String) | 应用程序许可证列表 | |
| authenticated | Boolean | 认证状态。已登录时为 `true` | |
| calendarId | String | 日历ID | |
| dateTimeFormats | DateTimeFormats | 日期时间显示格式列表 | 参见 SystemDateTimeFormat#getFormats |
| decimalFormatId | String | 数值格式的格式ID | 8.0.15 以上版本 |
| encoding | String | 字符编码 | |
| firstDayOfWeek | Number | 一周的第一天（0:周日 ～ 6:周六） | |
| homeUrl | String | 主页URL | |
| locale | String | 语言环境 | |
| loginGroupId | String | 登录组ID（已废弃，与租户ID相同） | 仅在兼容API内部使用 |
| loginTime | Date | 登录时间。未登录时为 `null` | |
| roleIds | Array(String) | 角色ID列表（含子角色） | |
| signature | String | 登录签名。未登录时为 `null` | |
| tenantId | String | 租户ID | 8.0.7 以上版本 |
| themeId | String | 主题ID | |
| timeZone | TimeZone | 时区 | |
| userCd | String | 用户ID | |
| userType | `"administrator"` 或 `"user"` | 用户类型 | |

## 设定值的解析顺序

各设定值按以下顺序进行参照。

1. 账户设置信息
2. 租户的账户设置信息
3. 浏览器信息
4. 系统默认账户设置信息
5. 服务器环境设置信息

## 使用示例

### 获取已登录用户信息

```javascript
function getAccountContext() {
  let accountContext = Contexts.getAccountContext();

  return {
    authenticated: accountContext.authenticated,
    userCd: accountContext.userCd,
    locale: accountContext.locale,
    tenantId: accountContext.tenantId,
    timeZone: accountContext.timeZone,
    userType: accountContext.userType,
    roleIds: accountContext.roleIds
  };
}
```

### 判断是否已认证

```javascript
function isAuthenticated() {
  let accountContext = Contexts.getAccountContext();
  return accountContext.authenticated;
}
```

### 判断角色

```javascript
function hasRole(targetRoleId) {
  let accountContext = Contexts.getAccountContext();
  let roleIds = accountContext.roleIds;

  for (let i = 0; i < roleIds.length; i++) {
    if (roleIds[i] === targetRoleId) {
      return true;
    }
  }
  return false;
}
```

### 判断是否为系统管理员

```javascript
function isAdministrator() {
  let accountContext = Contexts.getAccountContext();
  return accountContext.userType === 'administrator';
}
```
