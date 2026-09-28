---
paths:
  - "src/main/jssp/**/*.js"
---

# UserContext API 参考

## 概述

UserContext 是与 IM 共通主数据中登录用户信息相关的访问上下文。
可以获取用户所属组织、职位、个人资料等信息。

### 获取方法

```javascript
let userContext = Contexts.getUserContext();
```

## 属性列表

| 属性 | 类型 | 说明 |
|------|------|------|
| allDepartments | Array(Department) | 用户所属的所有组织 |
| allPosts | Array(DepartmentPost) | 用户所属的所有组织职位 |
| companyList | Array(Company) | 用户所属的所有公司 |
| currentDepartment | Department | 当前组织 |
| departmentByCompany | Object | 按公司分组的用户所属所有组织 |
| mainDepartment | Department | 用户的主所属组织 |
| mainPostList | Array(DepartmentPost) | 用户的主所属组织职位 |
| postByCompany | Object | 按公司分组的用户所属所有组织职位 |
| publicGroupList | Array(PublicGroup) | 用户所属的所有公共群组 |
| publicGroupRoleList | Array(PublicGroupRole) | 用户所属的所有公共群组角色 |
| userCategoryList | Array(UserCategory) | 用户所属的用户分类 |
| userProfile | UserProfile | 用户个人资料 |

## 关联对象

### UserProfile

保存用户的个人信息和联系信息。

| 属性 | 类型 | 说明 |
|------|------|------|
| userCd | String | 用户编码 |
| userName | String | 用户名 |
| userSearchName | String | 用户检索名 |
| sex | String | 性别 |
| emailAddress1 | String | 邮箱地址1 |
| emailAddress2 | String | 邮箱地址2 |
| mobileEmailAddress | String | 手机邮箱地址 |
| telephoneNumber | String | 电话号码 |
| mobileNumber | String | 手机号码 |
| extensionNumber | String | 分机号码 |
| faxNumber | String | 传真号码 |
| extensionFaxNumber | String | 分机传真号码 |
| zipCode | String | 邮政编码 |
| countryCd | String | 国家代码 |
| address1 | String | 地址1 |
| address2 | String | 地址2 |
| address3 | String | 地址3 |
| url | String | URL |
| notes | String | 备注 |

### Department

保存组织所属信息。与语言环境相关的数据按登录用户的语言环境、租户语言环境、系统语言环境的优先顺序存储。

| 属性 | 类型 | 说明 |
|------|------|------|
| companyCd | String | 公司代码 |
| departmentCd | String | 组织代码 |
| departmentName | String | 组织名称 |
| departmentFullName | String | 组织名全路径 |
| departmentShortName | String | 组织简称 |
| departmentSearchName | String | 组织检索名 |
| departmentSetCd | String | 组织集合代码 |

## 使用示例

### 获取用户个人资料

```javascript
function getUserProfile() {
  let userContext = Contexts.getUserContext();
  let profile = userContext.userProfile;

  return {
    userCd: profile.userCd,
    userName: profile.userName,
    email: profile.emailAddress1
  };
}
```

### 获取主所属组织

```javascript
function getMainDepartment() {
  let userContext = Contexts.getUserContext();
  let dept = userContext.mainDepartment;

  if (dept === null) {
    return null;
  }
  return {
    companyCd: dept.companyCd,
    departmentCd: dept.departmentCd,
    departmentName: dept.departmentName
  };
}
```

### 获取所有所属组织

```javascript
function getAllDepartments() {
  let userContext = Contexts.getUserContext();
  let departments = userContext.allDepartments;
  let result = [];

  for (let i = 0; i < departments.length; i++) {
    result.push({
      companyCd: departments[i].companyCd,
      departmentCd: departments[i].departmentCd,
      departmentName: departments[i].departmentName
    });
  }
  return result;
}
```
