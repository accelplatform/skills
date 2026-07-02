# UserContext API リファレンス

## 概要

UserContext は、IM-共通マスタ内のログインユーザ情報に関するアクセスコンテキストである。
ユーザの所属組織、役職、プロファイルなどの情報を取得できる。

### 取得方法

```javascript
let userContext = Contexts.getUserContext();
```

## プロパティ一覧

| プロパティ | 型 | 説明 |
|-----------|------|------|
| allDepartments | Array(Department) | ユーザが所属する全ての組織 |
| allPosts | Array(DepartmentPost) | ユーザが所属する全ての組織役職 |
| companyList | Array(Company) | ユーザが所属する全ての会社 |
| currentDepartment | Department | カレント組織 |
| departmentByCompany | Object | 会社別にユーザが所属する全ての組織 |
| mainDepartment | Department | ユーザの主所属の組織 |
| mainPostList | Array(DepartmentPost) | ユーザの主所属の組織役職 |
| postByCompany | Object | 会社別にユーザが所属する全ての組織役職 |
| publicGroupList | Array(PublicGroup) | ユーザが所属する全てのパブリックグループ |
| publicGroupRoleList | Array(PublicGroupRole) | ユーザが所属する全てのパブリックグループ役割 |
| userCategoryList | Array(UserCategory) | ユーザが所属するユーザ分類 |
| userProfile | UserProfile | ユーザプロファイル |

## 関連オブジェクト

### UserProfile

ユーザの個人情報・連絡先情報を保持する。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| userCd | String | ユーザコード |
| userName | String | ユーザ名 |
| userSearchName | String | ユーザ検索名 |
| sex | String | 性別 |
| emailAddress1 | String | メールアドレス1 |
| emailAddress2 | String | メールアドレス2 |
| mobileEmailAddress | String | 携帯メールアドレス |
| telephoneNumber | String | 電話番号 |
| mobileNumber | String | 携帯電話番号 |
| extensionNumber | String | 内線番号 |
| faxNumber | String | FAX番号 |
| extensionFaxNumber | String | 内線FAX番号 |
| zipCode | String | 郵便番号 |
| countryCd | String | 国コード |
| address1 | String | 住所1 |
| address2 | String | 住所2 |
| address3 | String | 住所3 |
| url | String | URL |
| notes | String | 備考 |

### Department

組織所属情報を保持する。ロケール依存のデータはログインユーザのロケール、テナントロケール、システムロケールの優先順位で格納される。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| companyCd | String | 会社コード |
| departmentCd | String | 組織コード |
| departmentName | String | 組織名 |
| departmentFullName | String | 組織名フルパス |
| departmentShortName | String | 組織略称 |
| departmentSearchName | String | 組織検索名 |
| departmentSetCd | String | 組織セットコード |

## 使用例

### ユーザプロファイルの取得

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

### 主所属組織の取得

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

### 全所属組織の取得

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
