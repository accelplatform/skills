---
paths:
  - "src/main/jssp/src/**/*.js"
---

# 访问控制（ACIBuilder）参考资料

注册用内容的可用访问控制构建器列表及 SSJS 调用模式。
通过传递给 `StandardInputContent.addACIBuilder()`，对内容的查看权限进行控制。

---

## 构建器列表

所有类的包为 `jp.co.intra_mart.foundation.contentssearch.authority.builder.impl`。

| No. | 访问控制对象 | 类名 |
|-----|---------|---------|
| 1 | 未认证用户（含访客） | `AnonymousACIBuilder` |
| 2 | 已认证用户（全部已登录用户） | `EveryoneACIBuilder` |
| 3 | 指定用户 | `StandardUserACIBuilder` |
| 4 | 角色 | `StandardRoleACIBuilder` |
| 5 | 公共组别 | `StandardPublicGroupACIBuilder` |
| 6 | 公共组别角色 | `StandardPublicGroupRoleACIBuilder` |
| 7 | 公司 | `StandardCompanyACIBuilder` |
| 8 | 部门 | `StandardDepartmentACIBuilder` |
| 9 | 职位 | `StandardPostACIBuilder` |

---

## 基本调用方式

由于 `addACIBuilder` 是 varargs 方法，以 JS 数组传入参数。需要以 OR 条件组合多个访问控制时，多次调用 `addACIBuilder`。

```javascript
// 单个构建器
content.addACIBuilder([new EveryoneACIBuilder()]);

// 以 OR 条件设置多个构建器（多次调用 addACIBuilder）
content.addACIBuilder([new StandardRoleACIBuilder('approver')]);
content.addACIBuilder([new StandardUserACIBuilder('user001')]);
```

---

## 各构建器详情

### 1. AnonymousACIBuilder — 未认证用户（含访客的所有用户）

包括未登录用户在内的所有用户均可访问。

**构造函数：**
```java
AnonymousACIBuilder()
```

**SSJS：**
```javascript
let AnonymousACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.AnonymousACIBuilder;

content.addACIBuilder([new AnonymousACIBuilder()]);
```

---

### 2. EveryoneACIBuilder — 已认证用户（全部已登录用户）

所有已登录用户均可访问。

**构造函数：**
```java
EveryoneACIBuilder()
```

**SSJS：**
```javascript
let EveryoneACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.EveryoneACIBuilder;

content.addACIBuilder([new EveryoneACIBuilder()]);
```

---

### 3. StandardUserACIBuilder — 指定用户

仅指定用户代码的用户可访问。

**构造函数：**
```java
StandardUserACIBuilder(String... userCds)
StandardUserACIBuilder(Collection<String> userCds)
```

**SSJS：**
```javascript
let StandardUserACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardUserACIBuilder;

// 单个用户
content.addACIBuilder([new StandardUserACIBuilder('user001')]);

// 多个用户（以 JS 数组作为 varargs 传入）
content.addACIBuilder([new StandardUserACIBuilder(['user001', 'user002'])]);
```

---

### 4. StandardRoleACIBuilder — 角色

仅持有指定角色 ID 的用户可访问。

**构造函数：**
```java
StandardRoleACIBuilder()
StandardRoleACIBuilder(String... roleIds)
StandardRoleACIBuilder(Collection<String> roleIds)
```

**SSJS：**
```javascript
let StandardRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardRoleACIBuilder;

// 单个角色
content.addACIBuilder([new StandardRoleACIBuilder('approver')]);

// 多个角色（以 JS 数组作为 varargs 传入）
content.addACIBuilder([new StandardRoleACIBuilder(['approver', 'manager'])]);
```

---

### 5. StandardPublicGroupACIBuilder — 公共组别

仅属于指定公共组别的用户可访问。

**构造函数：**
```java
StandardPublicGroupACIBuilder()
StandardPublicGroupACIBuilder(String publicGroupSetCd, String publicGroupCd)
```

**SSJS：**
```javascript
let StandardPublicGroupACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardPublicGroupACIBuilder;

// 以组集代码 + 组代码指定
content.addACIBuilder([new StandardPublicGroupACIBuilder('group_set_cd', 'group_cd')]);
```

---

### 6. StandardPublicGroupRoleACIBuilder — 公共组别角色

仅在指定公共组别内持有特定角色的用户可访问。

**构造函数：**
```java
StandardPublicGroupRoleACIBuilder()
StandardPublicGroupRoleACIBuilder(String publicGroupSetCd, String publicGroupCd, String roleCd)
```

**SSJS：**
```javascript
let StandardPublicGroupRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardPublicGroupRoleACIBuilder;

// 以组集代码 + 组代码 + 角色代码指定
content.addACIBuilder([new StandardPublicGroupRoleACIBuilder('group_set_cd', 'group_cd', 'role_cd')]);
```

---

### 7. StandardCompanyACIBuilder — 公司

仅属于指定公司代码的用户可访问。

**构造函数：**
```java
StandardCompanyACIBuilder()
StandardCompanyACIBuilder(String... companyCds)
```

**SSJS：**
```javascript
let StandardCompanyACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardCompanyACIBuilder;

// 单个公司
content.addACIBuilder([new StandardCompanyACIBuilder('comp001')]);

// 多个公司（以 JS 数组作为 varargs 传入）
content.addACIBuilder([new StandardCompanyACIBuilder(['comp001', 'comp002'])]);
```

---

### 8. StandardDepartmentACIBuilder — 部门

仅属于指定部门的用户可访问。

**构造函数：**
```java
StandardDepartmentACIBuilder()
StandardDepartmentACIBuilder(String companyCd, String departmentCd)
```

**SSJS：**
```javascript
let StandardDepartmentACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardDepartmentACIBuilder;

// 以公司代码 + 部门代码指定
content.addACIBuilder([new StandardDepartmentACIBuilder('comp001', 'dept001')]);
```

---

### 9. StandardPostACIBuilder — 职位

仅持有指定职位的用户可访问。

**构造函数：**
```java
StandardPostACIBuilder()
StandardPostACIBuilder(String companyCd, String departmentCd, String postCd)
```

**SSJS：**
```javascript
let StandardPostACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardPostACIBuilder;

// 以公司代码 + 部门代码 + 职位代码指定
content.addACIBuilder([new StandardPostACIBuilder('comp001', 'dept001', 'post001')]);
```
