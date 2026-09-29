# CompanyGroupManager API Reference (Java)

Based on the actual class definitions in the `im_master-main` module (`jp.co.intra_mart.foundation.master.company_group.*`). Do not supplement methods/attributes from memory or guesswork.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.company_group;

/**
 * Manager class for retrieving and managing company group information
 * @since 7.2
 */
public class CompanyGroupManager extends AbstractManager {
```

- A manager responsible for CRUD, search, and hierarchy (tree) operations on company group information in the IM Common Master (`im_master-main`). It extends `AbstractManager` (a common base class holding the updater user code, default locale, and login group ID)
- It has an internal extension point (`jp.co.intra_mart.foundation.master.accessor.company_group`) and delegates the actual read/write/notification/import/export work to plugin implementations (`CompanyGroupReader`/`CompanyGroupWriter`/`CompanyGroupListener`/`CompanyGroupImporter`/`CompanyGroupExporter`)
- Following the same design as `Department` (`CompanyManager`), company groups (`CompanyGroup`) form a tree structure under a company group set (`CompanyGroupSet`), with term management (`termCd`/`startDate`/`endDate`) and a multilingual name (`localeElementMap`)
- The difference from `Department` is that the tree nodes are tied not to organizations but to "companies" (`Company`). The association between a company group and a company is managed via `CompanyAttach` (no dedicated model class; operated on via `setCompanyAttach`/`removeCompanyAttach` methods)
- There is no extension-point switching method equivalent to `changeExecutor` (`CompanyManager` has one, but `CompanyGroupManager` does not)

## Constructors

| Signature | Overview |
|---|---|
| `public CompanyGroupManager() throws BizApiException` | **Recommended.** Uses the value of the "currently logged-in user" for the updater user code and default locale |
| `public CompanyGroupManager(String updateUserCd) throws BizApiException` | Explicitly specifies the updater user code. The default locale is the locale of the currently logged-in user |
| `public CompanyGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specifies both the updater user code and default locale |
| `public CompanyGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `CompanyGroupManager()` instead) |

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (a checked exception). Almost all constructors and public methods declare `throws BizApiException` (only `getExportCategories()`/`getImportCategories()` declare no exception).

## Company Group (`CompanyGroup`) Related Methods

For the `getCompanyGroup` family, if the target does not exist, no exception is thrown and `null` is returned.

```java
public CompanyGroup getCompanyGroup(ICompanyGroupBizKey bizKey, Date date) throws BizApiException; // overloads with Locale/isDisable combinations exist (4 variants total). null if not found
public CompanyGroup[] getCompanyGroupList(ICompanyGroupBizKey bizKey) throws BizApiException; // retrieves only enabled data across all terms and all languages (+ Locale, isDisable overloads)

public CompanyGroupListNode[] listCompanyGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable overloads
public CompanyGroupListNode[] searchCompanyGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // a separate family with the same shape as listCompanyGroup

public int countCompanyGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCompanyGroup(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable. No locale argument (covers all languages)

// Create/update (auto-determined by presence of the term code. The same pattern as Department/CompanyPost)
public ITerm[] setCompanyGroup(CompanyGroup companyGroup) throws BizApiException;

public void removeCompanyGroup(ICompanyGroupBizKey bizKey) throws BizApiException; // deletes all languages
public void removeCompanyGroup(ICompanyGroupBizKey bizKey, Locale locale) throws BizApiException; // a specific language only
public void removeCompanyGroup(Locale locale) throws BizApiException; // deletes data for the specified language from all company groups
```

JavaDoc for `setCompanyGroup`: "For the given company group information, if no term code is specified, the company group information is newly registered. If a term code is specified, the company group information is updated. If the company group set code and company group code are identical, the company group set and the company group are created together. When adding a company group, create the set first, then add the group to the created company group set. This method cannot update the term." The return value is the registered term information (`ITerm[]`); a non-empty return value means a new registration (firing `CompanyGroupListener#createCompanyGroup`), while an empty return value means an update (firing `CompanyGroupListener#updateCompanyGroup`).

### Company Group Inclusion (Parent-Child Relationship) Operations

```java
public void setCompanyGroupInclusion(ICompanyGroupBizKey bizKey, String parentCompanyGroupCd, String termCd) throws BizApiException; // creates inclusion information with the parent group
public void removeCompanyGroupInclusion(ICompanyGroupBizKey bizKey, String termCd) throws BizApiException;
```

### Formatting List Nodes

```java
public CompanyGroupListNode[] getFullPathListNode(CompanyGroupListNode[] listNodes, Date date, Locale locale) throws BizApiException;
```

Replaces the description name of company group list nodes with a name that includes the company group tree's hierarchy. The argument nodes are not modified; an array of newly created instances is returned.

## Company Group Set (`CompanyGroupSet`) Related Methods

`CompanyGroupSet` does not implement `ITerm` (it has no term). There is no creation method alongside `getCompanyGroupSetAll`/`getCompanyGroupSet`; `updateCompanyGroupSet` is for updating existing records (the same pattern as `CompanyManager#updateDepartmentSet`).

```java
public CompanyGroupSet getCompanyGroupSet(ICompanyGroupSetBizKey bizKey) throws BizApiException;
public CompanyGroupSet[] getCompanyGroupSetAll() throws BizApiException;

public void updateCompanyGroupSet(CompanyGroupSet companyGroupSet) throws BizApiException;
public void removeCompanyGroupSet(ICompanyGroupSetBizKey bizKey) throws BizApiException;
```

`changeCompanyGroupSetState(ICompanyGroupSetBizKey bizKey, String termCd, boolean disable)` is not a method for the company group set itself, but one that updates the disable flag of the inclusion (term) data of the company group tree held by that set (firing `CompanyGroupListener#updateCompanyGroupSetTerm`).

## Tree Operation Related Methods

```java
public CompanyGroupTreeNode getTree(ICompanyGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable. The entire tree for the company group set
public CompanyGroupTreeNode getBranch(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable. The lower sub-tree (branch) rooted at the specified company group
public CompanyGroupTreeNode getUpBranch(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable. Retrieval in the upward direction rooted at the specified company group
public CompanyGroupListNode[] getChildren(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable. Direct child company groups
public CompanyGroupListNode[] getParent(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable. The parent company group
public CompanyGroupListNode[] getIsolation(ICompanyGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable. Isolated nodes not present in the tree
public CompanyGroupTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable. The list of tree roots
public CompanyGroupTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // a separate family with the same shape as listTreeRoot

public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable. No locale argument
```

`getAbsoluteChildren`/`getAbsoluteParent`/`getAbsoluteIsolation`/`getAbsoluteBranch`/`getAbsoluteUpBranch`/`getAbsoluteTree` (absolute-position variants that also include logically deleted/disabled data; each with the same argument pattern as its corresponding method above, and `isDisable` overloads) also exist. `CompanyGroupTreeNode` extends `CompanyGroupListNode` and has `addChild`/`getChildren`/`hasChildren`/`removeChild`.

## Methods Related to `Company`

The association between a company group and a company is managed via `CompanyAttach` (no dedicated model class).

```java
// Association (with term management)
public ITerm[] setCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, ITerm term) throws BizApiException;
public void removeCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey) throws BizApiException;

// Retrieving the association term
public ITerm getCompanyAttachTerm(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, Date date) throws BizApiException;
public ITerm[] getCompanyAttachTermList(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey) throws BizApiException; // + isDisable
```

Listing/searching companies belonging to a company group (`listCompanyWithCompanyGroup`/`searchCompanyWithCompanyGroup`, the tree-descendant variant `*WithCompanyGroupTree`, and the upward-tree variant `*WithCompanyGroupUpTree` — each including `count*`/`total*` families of the same shape), and the reverse direction (listing/searching company groups a company belongs to: `listCompanyGroupWithCompany`/`searchCompanyGroupWithCompany`/`countCompanyGroupWithCompany`/`totalCompanyGroupWithCompany`) also exist. In every case the return value is `CompanyListNode[]` or `CompanyGroupListNode[]` (see the end of this file for the field definitions of `CompanyGroupListNode` itself).

## Term Operations

Term operation methods sharing the same design philosophy as `Department`/`CompanyPost`/`UserAttach` exist for each of the company group itself, the company group set's tree, and the company association (`CompanyAttach`).

```java
// The company group itself
public ITerm getCompanyGroupTerm(ICompanyGroupBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCompanyGroupTermList(ICompanyGroupBizKey bizKey) throws BizApiException; // + isDisable
public ITerm[] moveTermCompanyGroup(ICompanyGroupBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCompanyGroup(ICompanyGroupBizKey bizKey, String termCd, Date date) throws BizApiException;
public void mergeForwardTermCompanyGroup(ICompanyGroupBizKey bizKey, String termCd) throws BizApiException;
public void mergeBackwardTermCompanyGroup(ICompanyGroupBizKey bizKey, String termCd) throws BizApiException;

// The term of the tree held by the company group set (the CompanyGroupSet model itself does not implement ITerm)
public ITerm getTreeTerm(ICompanyGroupSetBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getTreeTermList(ICompanyGroupSetBizKey bizKey) throws BizApiException; // + isDisable
public ITerm[] moveTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, String termCd, Date date) throws BizApiException;
public void mergeForwardTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, String termCd) throws BizApiException;
public void mergeBackwardTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, String termCd) throws BizApiException;

// Association with a company (CompanyAttach)
public ITerm[] moveTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, ITerm term) throws BizApiException;
public ITerm separateTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, String termCd, Date date) throws BizApiException;
public void mergeForwardTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, String termCd) throws BizApiException;
public void mergeBackwardTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, String termCd) throws BizApiException;
```

## Model Classes

### `CompanyGroup`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public class CompanyGroup implements ICompanyGroupBizKey, ISortable, IDisable, IRecorder,
        IWithLocale<ICompanyGroupElement>, ITerm, ICompanyGroupElement {
```

| Field | Type | Overview |
|---|---|---|
| `companyGroupCd` | `String` | Company group code (`ICompanyGroupBizKey`, required) |
| `companyGroupSetCd` | `String` | Company group set code (`ICompanyGroupBizKey`, required) |
| `defaultLocale` | `Locale` | Default locale |
| `disable` | `boolean` | Delete flag (`IDisable`) |
| `startDate` / `endDate` / `termCd` | `Date` / `Date` / `String` | Term (`ITerm`) |
| `localeElementMap` | `Map<Locale, ICompanyGroupElement>` | Per-locale internationalization information (`IWithLocale`). A new instance (`CompanyGroupElement`) is created via `createLocaleElement()` |
| `recordDate` / `recordUserCd` | `Date` / `String` | Update date / updater user code (`IRecorder`) |
| `sortKey` | `int` | Sort key (`ISortable`) |

Like `Department`, this is the central model that has both a term and a multilingual name.

### `CompanyGroupSet`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public class CompanyGroupSet implements ICompanyGroupSetBizKey, ISortable, IRecorder {
```

A lightweight model holding only `companyGroupSetCd`/`recordDate`/`recordUserCd`/`sortKey`. It does not implement term management (`ITerm`) or a multilingual name (`IWithLocale`).

### `CompanyGroupListNode` / `CompanyGroupTreeNode`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public class CompanyGroupListNode implements ListNode, ICompanyGroupBizKey {
```

| Field | Type | Overview |
|---|---|---|
| `companyGroupCd` | `String` | Company group code |
| `companyGroupSetCd` | `String` | Company group set code |
| `description` | `String` (default `""`) | Description name |
| `disable` | `boolean` | Delete flag |
| `displayName` | `String` (default `""`) | Display name |
| `shortName` | `String` (default `""`) | Short name |

`CompanyGroupTreeNode extends CompanyGroupListNode implements TreeNode<CompanyGroupTreeNode>` has, in addition to the fields above, `childNodeList` (`List<CompanyGroupTreeNode>`), and operates on the tree structure via `addChild`/`getChildren`/`hasChildren`/`removeChild`.

### `ICompanyGroupBizKey` / `CompanyGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public interface ICompanyGroupBizKey {
    String getCompanyGroupCd();    // @NotNullValidation @LengthValidation(min=1)
    void setCompanyGroupCd(String companyGrpCd);
    String getCompanyGroupSetCd(); // @NotNullValidation @LengthValidation(min=1)
    void setCompanyGroupSetCd(String companyGrpSetCd);
}
```

The business key is the combination of the company group code and the company group set code. Since `CompanyGroup`/`CompanyGroupListNode` both implement this interface, instances of either can be passed directly as an `ICompanyGroupBizKey` argument. `CompanyGroupBizKey implements ICompanyGroupBizKey` is a lightweight implementation class holding only the business key, for use when a full `CompanyGroup` need not be assembled.

## Import / Export

```java
public Set<String> getExportCategories(); // no exception
public Set<String> getImportCategories(); // no exception
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
