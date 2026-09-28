---
paths:
  - "src/main/jssp/src/**/*.js"
---

# Access Control (ACIBuilder) Reference

A list of available access control builders for Contents registration and SSJS call patterns.
By passing to `StandardInputContent.addACIBuilder()`, the view access of Contents is controlled.

---

## Builder List

The package for all classes is `jp.co.intra_mart.foundation.contentssearch.authority.builder.impl`.

| No. | Access Target | Class Name |
|-----|---------|---------|
| 1 | Unauthenticated users (including guests) | `AnonymousACIBuilder` |
| 2 | Authenticated users (all logged-in users) | `EveryoneACIBuilder` |
| 3 | Specific user | `StandardUserACIBuilder` |
| 4 | Role | `StandardRoleACIBuilder` |
| 5 | Public group | `StandardPublicGroupACIBuilder` |
| 6 | Public group role | `StandardPublicGroupRoleACIBuilder` |
| 7 | Company | `StandardCompanyACIBuilder` |
| 8 | Department | `StandardDepartmentACIBuilder` |
| 9 | Post (job title) | `StandardPostACIBuilder` |

---

## Basic Usage

Because `addACIBuilder` is a varargs method, pass arguments as a JS array. To combine multiple access controls with an OR condition, call `addACIBuilder` multiple times.

```javascript
// Single builder
content.addACIBuilder([new EveryoneACIBuilder()]);

// Set multiple builders with OR condition (call addACIBuilder multiple times)
content.addACIBuilder([new StandardRoleACIBuilder('approver')]);
content.addACIBuilder([new StandardUserACIBuilder('user001')]);
```

---

## Builder Details

### 1. AnonymousACIBuilder — Unauthenticated users (all users, including guests)

Makes Contents accessible to all users, including those who are not logged in.

**Constructor:**
```java
AnonymousACIBuilder()
```

**SSJS:**
```javascript
let AnonymousACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.AnonymousACIBuilder;

content.addACIBuilder([new AnonymousACIBuilder()]);
```

---

### 2. EveryoneACIBuilder — Authenticated users (all logged-in users)

Makes Contents accessible to all logged-in users.

**Constructor:**
```java
EveryoneACIBuilder()
```

**SSJS:**
```javascript
let EveryoneACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.EveryoneACIBuilder;

content.addACIBuilder([new EveryoneACIBuilder()]);
```

---

### 3. StandardUserACIBuilder — Specific user

Makes Contents accessible only to users with the specified user code.

**Constructor:**
```java
StandardUserACIBuilder(String... userCds)
StandardUserACIBuilder(Collection<String> userCds)
```

**SSJS:**
```javascript
let StandardUserACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardUserACIBuilder;

// Single user
content.addACIBuilder([new StandardUserACIBuilder('user001')]);

// Multiple users (pass as a JS array for varargs)
content.addACIBuilder([new StandardUserACIBuilder(['user001', 'user002'])]);
```

---

### 4. StandardRoleACIBuilder — Role

Makes Contents accessible only to users with the specified Role ID.

**Constructor:**
```java
StandardRoleACIBuilder()
StandardRoleACIBuilder(String... roleIds)
StandardRoleACIBuilder(Collection<String> roleIds)
```

**SSJS:**
```javascript
let StandardRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardRoleACIBuilder;

// Single Role
content.addACIBuilder([new StandardRoleACIBuilder('approver')]);

// Multiple Roles (pass as a JS array for varargs)
content.addACIBuilder([new StandardRoleACIBuilder(['approver', 'manager'])]);
```

---

### 5. StandardPublicGroupACIBuilder — Public group

Makes Contents accessible only to users who belong to the specified Public group.

**Constructor:**
```java
StandardPublicGroupACIBuilder()
StandardPublicGroupACIBuilder(String publicGroupSetCd, String publicGroupCd)
```

**SSJS:**
```javascript
let StandardPublicGroupACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardPublicGroupACIBuilder;

// Specify by group set code + group code
content.addACIBuilder([new StandardPublicGroupACIBuilder('group_set_cd', 'group_cd')]);
```

---

### 6. StandardPublicGroupRoleACIBuilder — Public group role

Makes Contents accessible only to users who hold a specific role within the specified Public group.

**Constructor:**
```java
StandardPublicGroupRoleACIBuilder()
StandardPublicGroupRoleACIBuilder(String publicGroupSetCd, String publicGroupCd, String roleCd)
```

**SSJS:**
```javascript
let StandardPublicGroupRoleACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardPublicGroupRoleACIBuilder;

// Specify by group set code + group code + role code
content.addACIBuilder([new StandardPublicGroupRoleACIBuilder('group_set_cd', 'group_cd', 'role_cd')]);
```

---

### 7. StandardCompanyACIBuilder — Company

Makes Contents accessible only to users who belong to the specified company.

**Constructor:**
```java
StandardCompanyACIBuilder()
StandardCompanyACIBuilder(String... companyCds)
```

**SSJS:**
```javascript
let StandardCompanyACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardCompanyACIBuilder;

// Single company
content.addACIBuilder([new StandardCompanyACIBuilder('comp001')]);

// Multiple companies (pass as a JS array for varargs)
content.addACIBuilder([new StandardCompanyACIBuilder(['comp001', 'comp002'])]);
```

---

### 8. StandardDepartmentACIBuilder — Department

Makes Contents accessible only to users who belong to the specified department.

**Constructor:**
```java
StandardDepartmentACIBuilder()
StandardDepartmentACIBuilder(String companyCd, String departmentCd)
```

**SSJS:**
```javascript
let StandardDepartmentACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardDepartmentACIBuilder;

// Specify by company code + department code
content.addACIBuilder([new StandardDepartmentACIBuilder('comp001', 'dept001')]);
```

---

### 9. StandardPostACIBuilder — Post (job title)

Makes Contents accessible only to users who hold the specified post.

**Constructor:**
```java
StandardPostACIBuilder()
StandardPostACIBuilder(String companyCd, String departmentCd, String postCd)
```

**SSJS:**
```javascript
let StandardPostACIBuilder = Packages.jp.co.intra_mart.foundation.contentssearch.authority.builder.impl.StandardPostACIBuilder;

// Specify by company code + department code + post code
content.addACIBuilder([new StandardPostACIBuilder('comp001', 'dept001', 'post001')]);
```
