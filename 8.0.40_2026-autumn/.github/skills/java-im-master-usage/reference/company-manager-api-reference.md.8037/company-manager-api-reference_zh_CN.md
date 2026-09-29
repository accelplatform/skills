# CompanyManager API 参考手册（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.company.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## 类概要

```java
package jp.co.intra_mart.foundation.master.company;

/**
 * 负责获取与管理公司信息的管理器类
 * @since 7.2
 */
public class CompanyManager extends AbstractManager {
```

**公司（Company）・组织/组织集合（Department/DepartmentSet）・职位（CompanyPost）・用户的组织归属（UserAttach）——全部由这一个类处理。** 不存在与 `DepartmentManager`/`OrganizationManager` 相当的独立类（通过对 `jp.co.intra_mart.foundation.master.*` 下所有 `*Manager` 类进行全数确认后得出的事实）。

内部结构与 `UserManager` 相同，通过扩展点（默认值 `jp.co.intra_mart.foundation.master.accessor.company`）将处理委托给插件实现（`CompanyReader`/`CompanyWriter`/`CompanyListener`/`CompanyImporter`/`CompanyExporter`）。可通过 `changeExecutor(String extensionPoint)` 切换扩展点。

## 构造函数

| 签名 | 概要 |
|---|---|
| `public CompanyManager() throws BizApiException` | **推荐。** 更新者用户代码・默认区域设置使用「当前登录用户」的值 |
| `public CompanyManager(String updateUserCd) throws BizApiException` | 显式指定更新者用户代码 |
| `public CompanyManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 同时显式指定更新者用户代码・默认区域设置 |
| `public CompanyManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（请使用 `CompanyManager()`） |

与 `UserManager` 相同，省略参数时采用「当前登录用户」的值。

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（受检异常）。构造函数・CRUD・检索系方法均一贯只声明此异常（仅 `getExportCategories()`/`getImportCategories()` 不声明异常）。

## 公司（`Company`）相关方法

**`Company` 不存在新建方法，`updateCompany` 仅是针对既有记录的更新专用方法。** 标准实现（`StandardCompanyAccessor#updateCompany`）仅发出以 `company_cd` 为条件的 SQL `UPDATE` 语句，不会执行 `INSERT`。若目标公司代码尚未注册，`updateCompany` **不会抛出异常，而是在未更新任何内容的情况下正常结束**（更新 0 条记录不被视为错误）。**仅凭 `CompanyManager`（Java API）无法新建公司。** 新公司的创建应通过 `importData`（导入功能）或租户环境搭建资材（`jssp-tenant-setup-generator` 等处理的导入资材）来完成。

```java
public Company getCompany(ICompanyBizKey bizKey) throws BizApiException;
public Company[] getCompanyAll() throws BizApiException;

public CompanyListNode[] listCompany(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CompanyListNode[] searchCompany(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 与 listCompany 结构相同的独立方法组

public int countCompany(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCompany(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。不指定 locale

public void updateCompany(Company company) throws BizApiException; // 仅为既有公司的更新专用，无法新建
public void removeCompany(ICompanyBizKey bizKey) throws BizApiException; // 删除所有语言及关联信息，内部同时删除认可资源
```

## `Company` 模型类（重要限制）

```java
package jp.co.intra_mart.foundation.master.company.model;

/**
 * 处理公司信息的模型类
 * @since 7.2
 */
public class Company implements ISortable, IRecorder, ICompanyBizKey {
    private String companyCd;    // 公司代码
    private Date   recordDate;   // 更新日期
    private String recordUserCd; // 更新用户代码
    private int    sortKey;      // 排序键
}
```

**`Company` 仅有 `companyCd`/`recordDate`/`recordUserCd`/`sortKey` 4 个字段，不含与公司名称・多语言标签相当的字段（未实现 `IWithLocale`）。** 若需持有与公司名称相当的信息，须在组织（`Department`）侧设计名称管理机制，或由项目侧另行扩展（`Company` 本身没有管理多语言名称的手段）。

## 组织（`Department`）・组织集合（`DepartmentSet`）相关方法

`Department` 是构成层级结构（组织树）的核心模型，拥有公司代码・组织集合代码・组织代码的复合键 + 期间管理（`termCd`/`startDate`/`endDate`）+ 多语言名称（`localeElementMap`）。

```java
public Department getDepartment(IDepartmentBizKey bizKey, Date date) throws BizApiException; // + Locale, isDisable
public Department[] getDepartments(IDepartmentBizKey[] bizKey, Date date) throws BizApiException; // + Locale, isDisable

public DepartmentListNode[] listDepartment(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentListNode[] searchDepartment(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

public int countDepartment(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalDepartment(AppCmnSearchCondition condition, Date date) throws BizApiException;

// 新建/更新（根据期间代码是否存在自动判定，与 User 相同的模式）
// 新建时（未设置 termCd 时）startDate/endDate 为必须项（未设置将抛出 BizApiException）
public ITerm[] setDepartment(Department department) throws BizApiException;

public void removeDepartment(IDepartmentBizKey bizKey) throws BizApiException; // 删除所有语言
public void removeDepartment(IDepartmentBizKey bizKey, Locale locale) throws BizApiException; // 仅删除指定语言
public void removeDepartment(Locale locale) throws BizApiException; // 从所有组织中删除指定语言的数据
```

### 组织层级结构（树）的获取

```java
public DepartmentTreeNode getTree(IDepartmentSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。组织集合整体的树
public DepartmentTreeNode getBranch(IDepartmentBizKey bizKey, Date date, Locale locale) throws BizApiException; // 以指定组织为起点的下位树（分支）
public DepartmentListNode[] getChildren(IDepartmentBizKey bizKey, Date date, Locale locale) throws BizApiException; // 直属下级组织
public DepartmentListNode[] getParent(IDepartmentBizKey bizKey, Date date, Locale locale) throws BizApiException; // 上级组织
public DepartmentListNode[] getIsolation(IDepartmentSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // 不存在于组织树上的孤立节点
public DepartmentListNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 树的根节点一览
```

同时存在 `getAbsoluteBranch`/`getAbsoluteChildren`/`getAbsoluteParent`/`getAbsoluteIsolation`（包含逻辑删除・无效数据的绝对位置版）、`getUpBranch`/`getAbsoluteUpBranch`（向上方向获取）。

### 组织内包（父子关系）操作

```java
public void setDepartmentInclusion(...) throws BizApiException;
public void removeDepartmentInclusion(...) throws BizApiException;
```

### 组织集合（`DepartmentSet`）

`DepartmentSet` 是仅持有 `companyCd`/`departmentSetCd`/`recordDate`/`recordUserCd`/`sortKey` 的模型，与 `Company` 相同，不含多语言名称字段，也未实现 `ITerm`。**`DepartmentSet` 与 `Company` 具有相同的限制：`updateDepartmentSet` 仅是针对既有记录的更新专用方法。** 标准实现（`StandardCompanyAccessor#updateDepartmentSet`）同样仅发出以 `company_cd`/`department_set_cd` 为条件的 SQL `UPDATE` 语句，不会执行 `INSERT`。若目标尚不存在，不会抛出异常，只是未更新任何内容。**仅凭 `CompanyManager`（Java API）无法新建组织集合。**

```java
public DepartmentSet getDepartmentSet(IDepartmentSetBizKey bizKey) throws BizApiException;
public DepartmentSet[] getDepartmentSetAll() throws BizApiException;
public DepartmentSet[] getDepartmentSetWithCompany(ICompanyBizKey bizKey) throws BizApiException;

public void updateDepartmentSet(DepartmentSet departmentSet) throws BizApiException; // 仅为既有组织集合的更新专用，无法新建
public void removeDepartmentSet(IDepartmentSetBizKey bizKey) throws BizApiException;
```

同时存在 `mergeBackwardTermDepartmentSet`/`mergeForwardTermDepartmentSet`/`moveTermDepartmentSet`/`separateTermDepartmentSet`/`changeDepartmentSetState`/`getTreeTerm`/`getTreeTermList`，但这些方法操作・获取的并非 `DepartmentSet` 实体自身的期间，而是**该组织集合所拥有的组织树（`getTree` 返回的结构）的期间**（注意 `DepartmentSet` 模型本身并未实现 `ITerm`）。

### 组织分类・分类项目

与 `UserCtg`/`UserCtgItm` 相同的模式，也为组织分类（`DepartmentCtg`）・分类项目（`DepartmentCtgItm`）提供了一整套 CRUD・检索方法。**与 `UserCtg`/`PublicGroupCtg` 不同，`DepartmentCtg`/`DepartmentCtgItm` 的业务键包含 `companyCd`（组织分类按公司限定范围）。**

```java
// 分类
public DepartmentCtg getDepartmentCategory(IDepartmentCtgBizKey bizKey) throws BizApiException; // + Locale
public DepartmentCtgListNode[] listDepartmentCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentCtgListNode[] searchDepartmentCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countDepartmentCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalDepartmentCategory(AppCmnSearchCondition condition) throws BizApiException; // + isDisable
public void setDepartmentCategory(DepartmentCtg category) throws BizApiException; // 新建/更新
public void removeDepartmentCategory(IDepartmentCtgBizKey bizKey) throws BizApiException; // + Locale
public void removeDepartmentCategory(Locale locale) throws BizApiException; // **`@Deprecated`**（请使用 `removeDepartmentCategory(IDepartmentCtgBizKey, Locale)`）

// 分类项目
public DepartmentCtgItm getDepartmentCategoryItem(IDepartmentCtgItmBizKey bizKey) throws BizApiException; // + Locale
public DepartmentCtgItmListNode[] listDepartmentCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentCtgItmListNode[] searchDepartmentCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countDepartmentCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalDepartmentCategoryItem(AppCmnSearchCondition condition) throws BizApiException; // + isDisable
public void setDepartmentCategoryItem(DepartmentCtgItm item) throws BizApiException;
public void removeDepartmentCategoryItem(IDepartmentCtgItmBizKey bizKey) throws BizApiException; // + Locale
public void removeDepartmentCategoryItem(Locale locale) throws BizApiException; // **`@Deprecated`**
```

### 组织⇔分类项目的关联

```java
public void setDepartmentCategoryItemAttach(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey, ITerm term) throws BizApiException;
public void removeDepartmentCategoryItemAttach(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey, String termCd) throws BizApiException; // departmentBizKey 与 itemBizKey 的 companyCd 不一致时抛出 BizApiException
public ITerm getDepartmentCategoryItemAttachTerm(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey, Date date) throws BizApiException;
public ITerm[] getDepartmentCategoryItemAttachTermList(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey) throws BizApiException; // + isDisable

// 交叉检索
public DepartmentCtgItmListNode[] listDepartmentCategoryItemWithDepartment(IDepartmentBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentListNode[] listDepartmentWithDepartmentCategoryItem(IDepartmentCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
// search* / count* / total* 也以相同结构存在
```

`condition` 中可指定的表为 `ImmDepartmentCtgColumn`（`imm_department_ctg`）/`ImmDepartmentCtgItmColumn`（`imm_department_ctg_itm`）。

### `DepartmentCtg` / `DepartmentCtgItm` 模型类

```java
package jp.co.intra_mart.foundation.master.company.model;

public class DepartmentCtg implements IDepartmentCtgBizKey, ISortable, IDisable, IRecorder, IWithLocale<IDepartmentCtgElement>, IDepartmentCtgElement {
    private String companyCd;       // 业务键的一部分（UserCtg/PublicGroupCtg 中没有）
    private String categoryCd;      // 业务键的一部分
    private String categoryType;
    private Locale defaultLocale;
    private final Map<Locale, IDepartmentCtgElement> localeElementMap; // categoryName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}

public class DepartmentCtgItm implements IDepartmentCtgItmBizKey, ISortable, IDisable, IRecorder, IWithLocale<IDepartmentCtgItmElement> {
    private String companyCd;
    private String categoryCd;
    private String categoryItemCd;  // 与 companyCd/categoryCd 共同构成复合键
    private Locale defaultLocale;
    private final Map<Locale, IDepartmentCtgItmElement> localeElementMap; // categoryItemName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}
```

两者均不实现期间管理（`ITerm`）。`IDepartmentCtgBizKey`（`companyCd`/`categoryCd`）・`IDepartmentCtgItmBizKey`（`companyCd`/`categoryCd`/`categoryItemCd`）为对应的业务键接口。

### 检索归属于组织的用户

```java
public UserListNode[] listUserWithDepartment(...) throws BizApiException;
public UserListNode[] searchUserWithDepartment(...) throws BizApiException;
public int countUserWithDepartment(...) throws BizApiException;
public int totalUserWithDepartment(...) throws BizApiException;
```

同时存在上位树・下位树版（`*WithDepartmentTree`/`*WithDepartmentUpTree`）、去重版（`listUserDedupeWithDepartmentTree`）。

## 职位（`CompanyPost`）相关方法

与 `Department` 结构几乎相同的模型（公司代码・组织集合代码・职位代码的复合键 + 期间管理 + 多语言名称 + `rank`（等级）字段）。

```java
public CompanyPost getCompanyPost(ICompanyPostBizKey bizKey, Date date) throws BizApiException; // + Locale, isDisable

public CompanyPostListNode[] listCompanyPost(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public CompanyPostListNode[] searchCompanyPost(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCompanyPost(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalCompanyPost(AppCmnSearchCondition condition, Date date) throws BizApiException;

// 新建/更新（根据期间代码是否存在自动判定，与 Department 相同的模式）
// 新建时（未设置 termCd 时）startDate/endDate 为必须项（未设置将抛出 BizApiException）
public ITerm[] setCompanyPost(CompanyPost companyPost) throws BizApiException;

public void removeCompanyPost(ICompanyPostBizKey bizKey) throws BizApiException; // + Locale 重载、仅 Locale 的全件版
```

同时存在与用户关联的职位检索（`listCompanyPostWithUser`/`searchCompanyPostWithUser`/`countCompanyPostWithUser`/`totalCompanyPostWithUser`，以及限定组织版 `*WithUserOnDepartment`）、职位授予（`setCompanyPostAttach`/`removeCompanyPostAttach`）、组织⇔职位⇔用户的获取（`getDepartmentCompanyPostWithUser`）。

## 用户的组织归属（`UserAttach`）相关方法

管理用户与组织（`Department`）之间多对多的归属关系（含主归属标志）。没有专用的模型类，通过 `setUserAttach`/`removeUserAttach` 等方法进行操作。

```java
// 授予/更新归属
public ITerm[] setUserAttach(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey, ITerm term, boolean isDepartmentMain) throws BizApiException;

// 解除归属
public void removeUserAttach(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey) throws BizApiException;

// 获取归属期间
public ITerm getUserAttachTerm(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey, Date date) throws BizApiException;
public ITerm[] getUserAttachTermList(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey) throws BizApiException;
```

**`term` 参数不可传入 `null`。** `setUserAttach` 内部始终会调用 `AppCmnValidationManager.validateNonCodeTerm(term, ...)`，检查 `term` 本身非 null、`startDate`/`endDate` 非 null、以及 `startDate < endDate`——不存在根据 `termCd` 是否存在而分支的逻辑，无论新建归属还是更新均为必须项。应生成 `jp.co.intra_mart.foundation.master.common.model.Term`（`ITerm` 的标准实现，具有无参构造函数及 `setStartDate`/`setEndDate`/`setTermCd`）实例，设置 `startDate`/`endDate` 后传递。新建归属时 `termCd` 保持不设置。

指定 `isDepartmentMain = true` 时，将作为主归属进行注册。根据 JavaDoc，切换主归属时，系统内部可能会自动生成用于解除旧主归属的期间（监听器 `createUserAttach`/`updateUserAttach` 可能被多次调用）。

## 期间操作（`Department`/`CompanyPost`/`UserAttach` 的通用模式）

与 `UserManager` 的 `mergeBackwardTermUser`/`mergeForwardTermUser`/`moveTermUser`/`separateTermUser` 设计思路相同的期间操作方法，分别存在于 `Department`・`CompanyPost`・`UserAttach`（例如 `separateTermDepartment`/`mergeForwardTermCompanyPost`/`moveTermUserAttach` 等，将对象名替换后的对应关系）。

## 导入・导出

```java
public Set<String> getExportCategories(); // 无异常
public Set<String> getImportCategories(); // 无异常
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```

## 扩展点的切换

```java
public void changeExecutor(String extensionPoint) throws BizApiException;
```

指定空字符串时将恢复为默认扩展点（`jp.co.intra_mart.foundation.master.accessor.company`）。通常的应用开发中不使用此方法。
