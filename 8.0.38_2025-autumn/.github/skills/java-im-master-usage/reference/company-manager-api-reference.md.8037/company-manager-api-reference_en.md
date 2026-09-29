# CompanyManager API Reference (Java)

Based on the actual class definitions in the `im_master-main` module (`jp.co.intra_mart.foundation.master.company.*`). Do not supplement methods/attributes from memory or guesswork.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.company;

/**
 * Manager class for retrieving and managing company information
 * @since 7.2
 */
public class CompanyManager extends AbstractManager {
```

**This single class handles companies (`Company`), organizations/organization sets (`Department`/`DepartmentSet`), posts (`CompanyPost`), and user-to-organization attachment (`UserAttach`) — all of it.** No separate class equivalent to `DepartmentManager`/`OrganizationManager` exists (a fact confirmed by exhaustively checking every `*Manager` class under `jp.co.intra_mart.foundation.master.*`).

The internal structure mirrors `UserManager`: processing is delegated to plugin implementations (`CompanyReader`/`CompanyWriter`/`CompanyListener`/`CompanyImporter`/`CompanyExporter`) via an extension point (default `jp.co.intra_mart.foundation.master.accessor.company`). The extension point can be switched with `changeExecutor(String extensionPoint)`.

## Constructors

| Signature | Overview |
|---|---|
| `public CompanyManager() throws BizApiException` | **Recommended.** Uses the value of the "currently logged-in user" for the updater user code and default locale |
| `public CompanyManager(String updateUserCd) throws BizApiException` | Explicitly specifies the updater user code |
| `public CompanyManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specifies both the updater user code and default locale |
| `public CompanyManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `CompanyManager()` instead) |

As with `UserManager`, omitted arguments fall back to the "currently logged-in user" value.

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (a checked exception). Constructors, CRUD, and search methods consistently declare only this exception (only `getExportCategories()`/`getImportCategories()` declare none).

## Company (`Company`) Related Methods

**`Company` has no method for creation; `updateCompany` is update-only against an existing record.** The standard implementation (`StandardCompanyAccessor#updateCompany`) issues only a SQL `UPDATE` keyed on `company_cd` — it never performs an `INSERT`. If the target company code is not already registered, `updateCompany` throws no exception and simply **completes successfully without updating anything** (updating zero rows is not treated as an error). **`CompanyManager` (the Java API) alone cannot create a new company.** New companies are expected to be provisioned via `importData` (the import mechanism) or tenant setup import materials (the kind of import material handled by `jssp-tenant-setup-generator`, etc.).

```java
public Company getCompany(ICompanyBizKey bizKey) throws BizApiException;
public Company[] getCompanyAll() throws BizApiException;

public CompanyListNode[] listCompany(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CompanyListNode[] searchCompany(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // A separate, identically-shaped family to listCompany

public int countCompany(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCompany(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable. No locale

public void updateCompany(Company company) throws BizApiException; // Update-only against an existing company; cannot create
public void removeCompany(ICompanyBizKey bizKey) throws BizApiException; // Deletes all languages and related information; internally also removes the authorization resource
```

## The `Company` Model Class (Important Constraint)

```java
package jp.co.intra_mart.foundation.master.company.model;

/**
 * Model class for company information
 * @since 7.2
 */
public class Company implements ISortable, IRecorder, ICompanyBizKey {
    private String companyCd;    // Company code
    private Date   recordDate;   // Update date
    private String recordUserCd; // Update user code
    private int    sortKey;      // Sort key
}
```

**`Company` has only the four fields `companyCd`/`recordDate`/`recordUserCd`/`sortKey`, with no field corresponding to a company name or multilingual label (`IWithLocale` is not implemented).** If a field equivalent to a company name is needed, either the design must manage the name on the organization (`Department`) side, or the project must extend the model separately (`Company` itself has no means of managing a multilingual name).

## Organization (`Department`) / Organization Set (`DepartmentSet`) Related Methods

`Department` is the central model that forms the hierarchical structure (the organization tree), with a composite key of company code + organization set code + organization code, term management (`termCd`/`startDate`/`endDate`), and a multilingual name (`localeElementMap`).

```java
public Department getDepartment(IDepartmentBizKey bizKey, Date date) throws BizApiException; // + Locale, isDisable
public Department[] getDepartments(IDepartmentBizKey[] bizKey, Date date) throws BizApiException; // + Locale, isDisable

public DepartmentListNode[] listDepartment(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentListNode[] searchDepartment(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

public int countDepartment(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalDepartment(AppCmnSearchCondition condition, Date date) throws BizApiException;

// Create/update (auto-decided by term-code presence, the same pattern as User)
// On creation (when termCd is unset), startDate/endDate are required (omitting them throws BizApiException)
public ITerm[] setDepartment(Department department) throws BizApiException;

public void removeDepartment(IDepartmentBizKey bizKey) throws BizApiException; // Deletes all languages
public void removeDepartment(IDepartmentBizKey bizKey, Locale locale) throws BizApiException; // Only the specified language
public void removeDepartment(Locale locale) throws BizApiException; // Deletes the specified language's data from all organizations
```

### Retrieving the Organization Hierarchy (Tree)

```java
public DepartmentTreeNode getTree(IDepartmentSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable. The whole tree for an organization set
public DepartmentTreeNode getBranch(IDepartmentBizKey bizKey, Date date, Locale locale) throws BizApiException; // The sub-tree (branch) rooted at the specified organization
public DepartmentListNode[] getChildren(IDepartmentBizKey bizKey, Date date, Locale locale) throws BizApiException; // Direct child organizations
public DepartmentListNode[] getParent(IDepartmentBizKey bizKey, Date date, Locale locale) throws BizApiException; // Parent organization
public DepartmentListNode[] getIsolation(IDepartmentSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // Isolated nodes not present in the organization tree
public DepartmentListNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // The list of tree roots
```

`getAbsoluteBranch`/`getAbsoluteChildren`/`getAbsoluteParent`/`getAbsoluteIsolation` (absolute-position variants that also include logically deleted/disabled data) and `getUpBranch`/`getAbsoluteUpBranch` (retrieval in the upward direction) also exist.

### Organization Inclusion (Parent-Child Relationship) Operations

```java
public void setDepartmentInclusion(...) throws BizApiException;
public void removeDepartmentInclusion(...) throws BizApiException;
```

### Organization Set (`DepartmentSet`)

`DepartmentSet` is a model holding only `companyCd`/`departmentSetCd`/`recordDate`/`recordUserCd`/`sortKey` — like `Company`, it has no multilingual name field and does not implement `ITerm`. **`DepartmentSet` shares the same constraint as `Company`: `updateDepartmentSet` is update-only against an existing record.** The standard implementation (`StandardCompanyAccessor#updateDepartmentSet`) also issues only a SQL `UPDATE` keyed on `company_cd`/`department_set_cd`, never an `INSERT`. If the target does not already exist, it throws no exception and simply updates nothing. **`CompanyManager` (the Java API) alone cannot create a new organization set.**

```java
public DepartmentSet getDepartmentSet(IDepartmentSetBizKey bizKey) throws BizApiException;
public DepartmentSet[] getDepartmentSetAll() throws BizApiException;
public DepartmentSet[] getDepartmentSetWithCompany(ICompanyBizKey bizKey) throws BizApiException;

public void updateDepartmentSet(DepartmentSet departmentSet) throws BizApiException; // Update-only against an existing organization set; cannot create
public void removeDepartmentSet(IDepartmentSetBizKey bizKey) throws BizApiException;
```

`mergeBackwardTermDepartmentSet`/`mergeForwardTermDepartmentSet`/`moveTermDepartmentSet`/`separateTermDepartmentSet`/`changeDepartmentSetState`/`getTreeTerm`/`getTreeTermList` also exist, but these operate on/retrieve the term of **the organization tree that the organization set holds (the structure returned by `getTree`)**, not the term of the `DepartmentSet` entity itself (note that the `DepartmentSet` model itself does not implement `ITerm`).

### Organization Categories and Category Items

Following the same pattern as `UserCtg`/`UserCtgItm`, a set of CRUD/search methods is provided for organization categories (`DepartmentCtg`) and category items (`DepartmentCtgItm`). **Unlike `UserCtg`/`PublicGroupCtg`, the business key of `DepartmentCtg`/`DepartmentCtgItm` includes `companyCd` (organization categories are scoped per company).**

```java
// Category
public DepartmentCtg getDepartmentCategory(IDepartmentCtgBizKey bizKey) throws BizApiException; // + Locale
public DepartmentCtgListNode[] listDepartmentCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentCtgListNode[] searchDepartmentCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countDepartmentCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalDepartmentCategory(AppCmnSearchCondition condition) throws BizApiException; // + isDisable
public void setDepartmentCategory(DepartmentCtg category) throws BizApiException; // Create/update
public void removeDepartmentCategory(IDepartmentCtgBizKey bizKey) throws BizApiException; // + Locale
public void removeDepartmentCategory(Locale locale) throws BizApiException; // **`@Deprecated`** (use `removeDepartmentCategory(IDepartmentCtgBizKey, Locale)`)

// Category item
public DepartmentCtgItm getDepartmentCategoryItem(IDepartmentCtgItmBizKey bizKey) throws BizApiException; // + Locale
public DepartmentCtgItmListNode[] listDepartmentCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentCtgItmListNode[] searchDepartmentCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countDepartmentCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalDepartmentCategoryItem(AppCmnSearchCondition condition) throws BizApiException; // + isDisable
public void setDepartmentCategoryItem(DepartmentCtgItm item) throws BizApiException;
public void removeDepartmentCategoryItem(IDepartmentCtgItmBizKey bizKey) throws BizApiException; // + Locale
public void removeDepartmentCategoryItem(Locale locale) throws BizApiException; // **`@Deprecated`**
```

### Organization ⇔ Category Item Association

```java
public void setDepartmentCategoryItemAttach(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey, ITerm term) throws BizApiException;
public void removeDepartmentCategoryItemAttach(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey, String termCd) throws BizApiException; // A companyCd mismatch between departmentBizKey and itemBizKey throws BizApiException
public ITerm getDepartmentCategoryItemAttachTerm(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey, Date date) throws BizApiException;
public ITerm[] getDepartmentCategoryItemAttachTermList(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey) throws BizApiException; // + isDisable

// Cross search
public DepartmentCtgItmListNode[] listDepartmentCategoryItemWithDepartment(IDepartmentBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentListNode[] listDepartmentWithDepartmentCategoryItem(IDepartmentCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
// search* / count* / total* also exist, in the same shape
```

The tables that can be specified in `condition` are `ImmDepartmentCtgColumn` (`imm_department_ctg`) / `ImmDepartmentCtgItmColumn` (`imm_department_ctg_itm`).

### `DepartmentCtg` / `DepartmentCtgItm` Model Classes

```java
package jp.co.intra_mart.foundation.master.company.model;

public class DepartmentCtg implements IDepartmentCtgBizKey, ISortable, IDisable, IRecorder, IWithLocale<IDepartmentCtgElement>, IDepartmentCtgElement {
    private String companyCd;       // Part of the business key (not present on UserCtg/PublicGroupCtg)
    private String categoryCd;      // Part of the business key
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
    private String categoryItemCd;  // Combined with companyCd/categoryCd to form the composite key
    private Locale defaultLocale;
    private final Map<Locale, IDepartmentCtgItmElement> localeElementMap; // categoryItemName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}
```

Neither implements term management (`ITerm`). `IDepartmentCtgBizKey` (`companyCd`/`categoryCd`) and `IDepartmentCtgItmBizKey` (`companyCd`/`categoryCd`/`categoryItemCd`) are the corresponding business key interfaces.

### Searching Users Belonging to an Organization

```java
public UserListNode[] listUserWithDepartment(...) throws BizApiException;
public UserListNode[] searchUserWithDepartment(...) throws BizApiException;
public int countUserWithDepartment(...) throws BizApiException;
public int totalUserWithDepartment(...) throws BizApiException;
```

Upward-tree and downward-tree variants (`*WithDepartmentTree`/`*WithDepartmentUpTree`) and a deduplicating variant (`listUserDedupeWithDepartmentTree`) also exist.

## Post (`CompanyPost`) Related Methods

A model nearly identical in shape to `Department` (a composite key of company code + organization set code + post code, term management, a multilingual name, and a `rank` field).

```java
public CompanyPost getCompanyPost(ICompanyPostBizKey bizKey, Date date) throws BizApiException; // + Locale, isDisable

public CompanyPostListNode[] listCompanyPost(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public CompanyPostListNode[] searchCompanyPost(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCompanyPost(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalCompanyPost(AppCmnSearchCondition condition, Date date) throws BizApiException;

// Create/update (auto-decided by term-code presence, the same pattern as Department)
// On creation (when termCd is unset), startDate/endDate are required (omitting them throws BizApiException)
public ITerm[] setCompanyPost(CompanyPost companyPost) throws BizApiException;

public void removeCompanyPost(ICompanyPostBizKey bizKey) throws BizApiException; // + Locale overload, a Locale-only all-records variant
```

Searching for posts tied to a user (`listCompanyPostWithUser`/`searchCompanyPostWithUser`/`countCompanyPostWithUser`/`totalCompanyPostWithUser`, and an organization-scoped variant `*WithUserOnDepartment`), granting posts (`setCompanyPostAttach`/`removeCompanyPostAttach`), and retrieving organization⇔post⇔user (`getDepartmentCompanyPostWithUser`) also exist.

## User-to-Organization Attachment (`UserAttach`) Related Methods

Manages the many-to-many attachment relationship (with a main-attachment flag) between users and organizations (`Department`). There is no dedicated model class; the relationship is operated on via methods such as `setUserAttach`/`removeUserAttach`.

```java
// Grant/update attachment
public ITerm[] setUserAttach(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey, ITerm term, boolean isDepartmentMain) throws BizApiException;

// Release attachment
public void removeUserAttach(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey) throws BizApiException;

// Retrieving the attachment term
public ITerm getUserAttachTerm(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey, Date date) throws BizApiException;
public ITerm[] getUserAttachTermList(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey) throws BizApiException;
```

**The `term` argument cannot be `null`.** `setUserAttach` always internally calls `AppCmnValidationManager.validateNonCodeTerm(term, ...)`, which checks that `term` itself is non-null, that `startDate`/`endDate` are non-null, and that `startDate < endDate` — there is no branch based on `termCd` presence; this is required for both new grants and updates. Construct an instance of `jp.co.intra_mart.foundation.master.common.model.Term` (the standard `ITerm` implementation, with a no-arg constructor plus `setStartDate`/`setEndDate`/`setTermCd`), set `startDate`/`endDate`, and pass that. For a new grant, leave `termCd` unset.

Specifying `isDepartmentMain = true` registers the attachment as the main one. Per the JavaDoc, switching the main attachment may internally auto-generate a term to release the previous main attachment (the `createUserAttach`/`updateUserAttach` listener may be invoked multiple times).

## Term Operations (Common Pattern for `Department`/`CompanyPost`/`UserAttach`)

Term operation methods sharing the same design as `UserManager`'s `mergeBackwardTermUser`/`mergeForwardTermUser`/`moveTermUser`/`separateTermUser` exist for each of `Department`, `CompanyPost`, and `UserAttach` (a naming correspondence with the target name substituted in, e.g. `separateTermDepartment`/`mergeForwardTermCompanyPost`/`moveTermUserAttach`).

## Import / Export

```java
public Set<String> getExportCategories(); // No exception
public Set<String> getImportCategories(); // No exception
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```

## Switching Extension Points

```java
public void changeExecutor(String extensionPoint) throws BizApiException;
```

Passing an empty string reverts to the default extension point (`jp.co.intra_mart.foundation.master.accessor.company`). Not used in ordinary application development.
