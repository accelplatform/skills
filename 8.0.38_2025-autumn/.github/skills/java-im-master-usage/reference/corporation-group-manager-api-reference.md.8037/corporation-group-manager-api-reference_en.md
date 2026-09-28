# CorporationGroupManager API Reference (Java)

Based on the actual class definitions of the `im_master-main` module (`jp.co.intra_mart.foundation.master.corporation_group.*`). Do not add methods or attributes from memory or guesswork.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.corporation_group;

/**
 * Manager class that retrieves and manages corporation group information
 * @since 8.0
 */
public class CorporationGroupManager extends AbstractManager {
```

- A manager responsible for CRUD, search, and tree operations on corporation group data in IM Common Master (`im_master-main`). It extends `AbstractManager` (a common base class holding the update user code, default locale, and login group ID).
- Internally it has an extension point (`jp.co.intra_mart.foundation.master.accessor.corporation_group`) and delegates actual read/write/notification/import/export to plugin implementations (`CorporationGroupReader`/`CorporationGroupWriter`/`CorporationGroupListener`/`CorporationGroupImporter`/`CorporationGroupExporter`).
- The overall API shape (corporation group body, corporation group set, tree, term operations, association with corporations) is nearly identical to the `Department`-related methods of `CompanyManager`. The decisive difference is that the corporation group business key includes a company code (`companyCd`), forming a three-part key (`companyCd`/`corporationGroupSetCd`/`corporationGroupCd`).

## Constructors

| Signature | Overview |
|---|---|
| `public CorporationGroupManager() throws BizApiException` | **Recommended.** Uses the "currently logged-in user" values for the update user code and default locale. |
| `public CorporationGroupManager(String updateUserCd) throws BizApiException` | Explicitly specifies the update user code. The default locale is the locale of the currently logged-in user. |
| `public CorporationGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specifies both the update user code and the default locale. |
| `public CorporationGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `CorporationGroupManager()` instead). |

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (checked exception). Constructors, and nearly all CRUD, search, tree, and term-operation methods consistently declare only this exception (only `getExportCategories()`/`getImportCategories()` declare no exception).

## Corporation Group (`CorporationGroup`) Body Methods

`getCorporationGroup` returns `null` without throwing when the target does not exist.

```java
public CorporationGroup getCorporationGroup(ICorporationGroupBizKey bizKey, Date date) throws BizApiException; // 4 overloads combining Locale and isDisable
public CorporationGroup[] getCorporationGroupList(ICorporationGroupBizKey bizKey) throws BizApiException; // Retrieves all terms of the target corporation group. 4 overloads combining Locale and isDisable

public CorporationGroupListNode[] listCorporationGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationGroupListNode[] searchCorporationGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // A separate lineage of the same shape as listCorporationGroup

public int countCorporationGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationGroup(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable; no locale argument

// Create/update (auto-detected by presence of the term code, same pattern as Department in CompanyManager)
// On creation (when termCd is unset), startDate/endDate are required (BizApiException if unset)
// Internally goes through model validation via AppCmnValidationManager.validateModel and convertTerm;
// if the result is empty it invokes CorporationGroupListener#updateCorporationGroup, otherwise it assembles and returns the newly created CorporationGroup terms
public ITerm[] setCorporationGroup(CorporationGroup corporationGroup) throws BizApiException;

public void removeCorporationGroup(ICorporationGroupBizKey bizKey) throws BizApiException; // Deletes all locales
public void removeCorporationGroup(ICorporationGroupBizKey bizKey, Locale locale) throws BizApiException; // Deletes only the specified locale
```

### Term Retrieval

```java
public ITerm getCorporationGroupTerm(ICorporationGroupBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCorporationGroupTermList(ICorporationGroupBizKey bizKey) throws BizApiException; // + isDisable
```

## Corporation Group Set (`CorporationGroupSet`) Related Methods

Like `Company`/`DepartmentSet`, `CorporationGroupSet` has no multilingual name fields and does not implement `ITerm`. There is no method literally named `updateCorporationGroupSet`'s counterpart for inclusion state; instead both `changeCorporationGroupSetState` (updates the disable flag of a corporation group inclusion) and `updateCorporationGroupSet` (updates the entity itself) are provided.

```java
public CorporationGroupSet getCorporationGroupSet(ICorporationGroupSetBizKey bizKey) throws BizApiException;

// Two overloads. The scope retrieved differs depending on whether the argument is given
public CorporationGroupSet[] getCorporationGroupSetAll() throws BizApiException; // Retrieves corporation group sets across all companies
public CorporationGroupSet[] getCorporationGroupSetAll(String companyCd) throws BizApiException; // Retrieves only the corporation group sets belonging to the specified company code

public void updateCorporationGroupSet(CorporationGroupSet corporationGroupSet) throws BizApiException; // Updates an existing corporation group set
public void removeCorporationGroupSet(ICorporationGroupSetBizKey bizKey) throws BizApiException;

// Updates the disable flag of a corporation group inclusion (parent-child relationship). Invokes CorporationGroupListener#updateCorporationGroupSetTerm
public void changeCorporationGroupSetState(ICorporationGroupSetBizKey bizKey, String termCd, boolean disable) throws BizApiException;
```

### Corporation Group Inclusion (Parent-Child Relationship) Operations

```java
public void setCorporationGroupInclusion(ICorporationGroupBizKey bizKey, String parentCorporationGroupCd, String termCd) throws BizApiException;
public void removeCorporationGroupInclusion(ICorporationGroupBizKey bizKey, String termCd) throws BizApiException;
```

## Tree Operations

A set of methods identical in shape to the `Department` tree operations is provided.

```java
public CorporationGroupTreeNode getTree(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable. The entire tree of a corporation group set
public CorporationGroupTreeNode getBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // The subtree (branch) rooted at the specified corporation group
public CorporationGroupTreeNode getUpBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // The branch in the upward direction

public CorporationGroupListNode[] getChildren(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // Direct child corporation groups
public CorporationGroupListNode[] getParent(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // The parent corporation group
public CorporationGroupListNode[] getIsolation(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // Isolated nodes not present on the corporation group tree

public CorporationGroupTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationGroupTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// Absolute-position variants that also include logically deleted / disabled data (with isDisable overloads)
public CorporationGroupTreeNode getAbsoluteBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupTreeNode getAbsoluteTree(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupTreeNode getAbsoluteUpBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupListNode[] getAbsoluteChildren(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupListNode[] getAbsoluteParent(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupListNode[] getAbsoluteIsolation(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException;

// A utility that assembles a full path (a sequence of list nodes including ancestors) from an array of list nodes
public CorporationGroupListNode[] getFullPathListNode(CorporationGroupListNode[] listNodes, Date date, Locale locale) throws BizApiException;
```

## Association Methods with Corporations (`Corporation`)

Manages the many-to-many association (with term management) between a corporation group and a corporation (`Corporation` in the `jp.co.intra_mart.foundation.master.corporation` package). There is no dedicated model class; it is operated through methods such as `setCorporationAttach`/`removeCorporationAttach`.

```java
// Attach/update an association
public ITerm[] setCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, ITerm term) throws BizApiException;

// Detach an association
public void removeCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey) throws BizApiException;

// Retrieve association terms
public ITerm getCorporationAttachTerm(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, Date date) throws BizApiException;
public ITerm[] getCorporationAttachTermList(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey) throws BizApiException; // + isDisable
```

### Searching Corporations Belonging to a Corporation Group

```java
public CorporationListNode[] listCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationListNode[] searchCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable
```

Upward-tree and downward-tree variants (`*WithCorporationGroupTree`/`*WithCorporationGroupUpTree`, each with list/search/count/total) also exist with the same shape.

### Searching Corporations Belonging to the Corporation Group Set that a Corporation Group Belongs To

```java
public CorporationGroupListNode[] listCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationGroupListNode[] searchCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable
```

## Term Operations (Common Pattern for `CorporationGroup`/`CorporationGroupSet`/Corporation Association)

Term-operation methods following the same design as `mergeBackwardTermDepartment`/`mergeForwardTermDepartment`/`moveTermDepartment`/`separateTermDepartment` in `CompanyManager` exist for `CorporationGroup`, `CorporationGroupSet`, and the corporation association (`CorporationAttach`) respectively.

```java
public void mergeBackwardTermCorporationGroup(ICorporationGroupBizKey bizKey, String termCd) throws BizApiException;
public void mergeForwardTermCorporationGroup(ICorporationGroupBizKey bizKey, String termCd) throws BizApiException;
public ITerm[] moveTermCorporationGroup(ICorporationGroupBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCorporationGroup(ICorporationGroupBizKey bizKey, String termCd, Date date) throws BizApiException;

public void mergeBackwardTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, String termCd) throws BizApiException;
public void mergeForwardTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, String termCd) throws BizApiException;
public ITerm[] moveTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, String termCd, Date date) throws BizApiException;

public void mergeBackwardTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, String termCd) throws BizApiException;
public void mergeForwardTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, String termCd) throws BizApiException;
public ITerm[] moveTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, ITerm term) throws BizApiException;
public ITerm separateTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, String termCd, Date date) throws BizApiException;
```

`getTreeTerm`/`getTreeTermList` also exist, but these operate on and retrieve **the term of the corporation group tree structure returned by `getTree`**, not the term of the `CorporationGroupSet` entity itself (note that the `CorporationGroupSet` model itself does not implement `ITerm`).

```java
public ITerm getTreeTerm(ICorporationGroupSetBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getTreeTermList(ICorporationGroupSetBizKey bizKey) throws BizApiException; // + isDisable
```

## Model Classes

### `CorporationGroup` (corresponds to `Department` in `CompanyManager`)

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

/**
 * Model class that handles corporation group information
 * @since 8.0
 */
public class CorporationGroup implements ICorporationGroupBizKey, ISortable, IDisable, IRecorder,
        IWithLocale<ICorporationGroupElement>, ITerm, ICorporationGroupElement {
    private String companyCd;             // Company code (not present on Department; a field unique to corporation groups)
    private String corporationGroupCd;    // Corporation group code
    private String corporationGroupSetCd; // Corporation group set code
    private Locale defaultLocale;         // Default locale
    private boolean disable;              // Disable flag
    private Date endDate;                 // End date
    private final Map<Locale, ICorporationGroupElement> localeElementMap; // Localization map
    private Date recordDate;              // Record (update) date
    private String recordUserCd;          // Record (update) user code
    private int sortKey;                  // Sort key
    private Date startDate;               // Start date
    private String termCd;                // Term code
}
```

Like `Department`, this is a composite-key, term-managed model implementing `ITerm` (term management) and `IWithLocale` (multilingual support, where `ICorporationGroupElement` holds the corporation group name, corporation group search name, corporation group short name, and notes). The only difference is that it additionally holds `companyCd`. The `companyCd`/`corporationGroupCd`/`corporationGroupSetCd` getters carry `@NotNullValidation`/`@LengthValidation`/`@CodeValidation` annotations.

### `ICorporationGroupBizKey` / `CorporationGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

public interface ICorporationGroupBizKey {
    String getCompanyCd();             // Company code
    String getCorporationGroupCd();    // Corporation group code
    String getCorporationGroupSetCd(); // Corporation group set code
    void setCompanyCd(String companyCd);
    void setCorporationGroupCd(String corporationGrpCd);
    void setCorporationGroupSetCd(String corporationGrpSetCd);
}
```

The corporation group business key consists of three elements: `companyCd`/`corporationGroupSetCd`/`corporationGroupCd`. This is the same shape as `IDepartmentBizKey` (`companyCd`/`departmentSetCd`/`departmentCd`) in `CompanyManager`, but is defined in a separate package/class dedicated to corporation groups. `CorporationGroupBizKey` is the standard implementation of `ICorporationGroupBizKey` (three fields plus getters/setters only).

### `CorporationGroupListNode`

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

public class CorporationGroupListNode implements ListNode, ICorporationGroupBizKey {
    private String companyCd;             // Company code
    private String corporationGroupCd;    // Corporation group code
    private String corporationGroupSetCd; // Corporation group set code
    private String description = "";      // Description
    private boolean disable;              // Disable flag
    private String displayName = "";      // Display name
    private String shortName = "";        // Short name
}
```

Has `getCorporationGroupCd()`/`getCorporationGroupSetCd()`/`getCompanyCd()`/`getDescription()`/`getDisplayName()`/`getShortName()`/`isDisable()`. This corresponds to `CompanyManager`'s `DepartmentListNode` with `companyCd` added.

### `CorporationGroupSet`

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

public class CorporationGroupSet implements ICorporationGroupSetBizKey, ISortable, IRecorder {
    private String companyCd;             // Company code
    private String corporationGroupSetCd; // Corporation group set code
    private Date recordDate;              // Record (update) date
    private String recordUserCd;          // Record (update) user code
    private int sortKey;                  // Sort key
}
```

Like `Company`/`DepartmentSet`, it has no multilingual name fields and does not implement `ITerm`. A corporation group set is identified solely by `companyCd`/`corporationGroupSetCd`.

## Import / Export

```java
public Set<String> getExportCategories(); // No exception
public Set<String> getImportCategories(); // No exception
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
