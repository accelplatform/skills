# UserContext API Reference

## Overview

UserContext is an access context related to the logged-in user information within the IM Common Master.
You can retrieve information such as the user's organizational affiliations, posts, and profiles.

### How to Obtain

```typescript
let userContext = Contexts.getUserContext();
```

## Property List

| Property | Type | Description |
|----------|------|-------------|
| allDepartments | Array(Department) | All organizations the user belongs to |
| allPosts | Array(DepartmentPost) | All organizational posts the user belongs to |
| companyList | Array(Company) | All companies the user belongs to |
| currentDepartment | Department | Current organization |
| departmentByCompany | Object | All organizations the user belongs to, grouped by company |
| mainDepartment | Department | The user's primary organizational affiliation |
| mainPostList | Array(DepartmentPost) | The user's primary organizational posts |
| postByCompany | Object | All organizational posts the user belongs to, grouped by company |
| publicGroupList | Array(PublicGroup) | All public groups the user belongs to |
| publicGroupRoleList | Array(PublicGroupRole) | All public group roles the user belongs to |
| userCategoryList | Array(UserCategory) | User categories the user belongs to |
| userProfile | UserProfile | User profile |

## Related Objects

The type names in the d.ts are `UserContext.UserProfile` / `UserContext.Department`. Use these names in type annotations (`Department` alone causes TS2304).

### UserProfile

Holds the user's personal information and contact information.

| Property | Type | Description |
|----------|------|-------------|
| userCd | String | User code |
| userName | String | User name |
| userSearchName | String | User search name |
| sex | String | Gender |
| emailAddress1 | String | Email address 1 |
| emailAddress2 | String | Email address 2 |
| mobileEmailAddress | String | Mobile email address |
| telephoneNumber | String | Phone number |
| mobileNumber | String | Mobile phone number |
| extensionNumber | String | Extension number |
| faxNumber | String | Fax number |
| extensionFaxNumber | String | Extension fax number |
| zipCode | String | Zip code |
| countryCd | String | Country code |
| address1 | String | Address 1 |
| address2 | String | Address 2 |
| address3 | String | Address 3 |
| url | String | URL |
| notes | String | Notes |

### Department

Holds organizational affiliation information. Locale-dependent data is stored in priority order: logged-in user's locale, tenant locale, system locale.

| Property | Type | Description |
|----------|------|-------------|
| companyCd | String | Company code |
| departmentCd | String | Organization code |
| departmentName | String | Organization name |
| departmentFullName | String | Organization full path name |
| departmentShortName | String | Organization abbreviated name |
| departmentSearchName | String | Organization search name |
| departmentSetCd | String | Organization set code |

## Usage Examples

### Getting User Profile

```typescript
/** Excerpt of the user profile */
interface UserProfileSummary {
  userCd: string;
  userName: string;
  email: string;
}

function getUserProfile(): UserProfileSummary {
  let userContext = Contexts.getUserContext();
  let profile = userContext.userProfile;

  return {
    userCd: profile.userCd,
    userName: profile.userName,
    email: profile.emailAddress1
  };
}
```

### Getting Primary Organizational Affiliation

```typescript
/** Excerpt of organization information */
interface DepartmentSummary {
  companyCd: string;
  departmentCd: string;
  departmentName: string;
}

function getMainDepartment(): DepartmentSummary | null {
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

### Getting All Organizational Affiliations

```typescript
/** Excerpt of organization information */
interface DepartmentSummary {
  companyCd: string;
  departmentCd: string;
  departmentName: string;
}

function getAllDepartments(): DepartmentSummary[] {
  let userContext = Contexts.getUserContext();
  let departments = userContext.allDepartments;
  let result: DepartmentSummary[] = [];

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
