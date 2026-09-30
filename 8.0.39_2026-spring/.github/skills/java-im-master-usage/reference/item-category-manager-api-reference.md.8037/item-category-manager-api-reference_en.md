# ItemCategoryManager API Reference (Java)

Based on the actual class definitions in the `im_master-main` module (`jp.co.intra_mart.foundation.master.item_category.*`). Do not supplement methods or attributes from memory or guesswork.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.item_category;

/**
 * Item category manager class.
 * Handles item category information operations, item attachment operations, and inclusion operations.
 */
public class ItemCategoryManager extends AbstractManager {
```

- **This single class handles everything: the item category itself (`ItemCategory`), item category sets (`ItemCategorySet`), the hierarchy (tree), and the attachment relationship with items (`Item`).** A structure identical in shape to `CompanyManager`'s organization (`Department`/`DepartmentSet`) method group
- Delegates to plugin implementations (`ItemCategoryReader`/`ItemCategoryWriter`/`ItemCategoryListener`/`ItemCategoryImporter`/`ItemCategoryExporter`) via an extension point (default: `jp.co.intra_mart.foundation.master.accessor.item_category`)
- **Method names denote "item category" as `Category` (not `ItemCategory`).** For example: `getCategory`/`setCategory`/`removeCategory`/`moveTermCategory`/`getCategorySet`/`setCategoryInclusion`. Note that this differs from the class name `ItemCategoryManager` and the model class name `ItemCategory`

## Constructors

| Signature | Description |
|---|---|
| `public ItemCategoryManager() throws BizApiException` | **Recommended.** Uses the "currently logged-in user" for the updater user code and default locale |
| `public ItemCategoryManager(String updateUserCd) throws BizApiException` | Explicitly specify the updater user code |
| `public ItemCategoryManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specify both the updater user code and default locale |
| `public ItemCategoryManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `ItemCategoryManager()`) |

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (a checked exception). Constructors and all CRUD/search/tree/term methods consistently declare only this exception (except `getExportCategories()`/`getImportCategories()`, which declare none).

## Item Category (`ItemCategory`) Methods

```java
public ItemCategory getCategory(IItemCategoryBizKey bizKey, Date termDate) throws BizApiException; // + Locale, isDisable combination overloads exist

public ItemCategoryListNode[] listCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemCategoryListNode[] searchCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // A separate but identically-shaped family to listCategory

public int countCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCategory(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// Create/update (auto-decided by whether the term code is set — the same pattern as CompanyManager's Department)
public ITerm[] setCategory(ItemCategory category) throws BizApiException;

public void removeCategory(IItemCategoryBizKey bizKey) throws BizApiException; // Deletes all locales
public void removeCategory(IItemCategoryBizKey bizKey, Locale locale) throws BizApiException; // Only the given locale
public void removeCategory(Locale locale) throws BizApiException; // **`@Deprecated`** (use `removeCategory(IItemCategoryBizKey, Locale)`)
```

The table that can be specified in `condition` is `ImmItemCategoryColumn` (`imm_item_category`).

### Term Operations

```java
public ITerm[] moveTermCategory(IItemCategoryBizKey bizKey, ITerm moveTerm) throws BizApiException;
// separateTermCategory/mergeForwardTermCategory/mergeBackwardTermCategory also exist, in the same shape
```

### Item Category Inclusion (Parent-Child Relationship) Operations

```java
public void setCategoryInclusion(IItemCategoryBizKey bizKey, String parentCategoryCd, String termCd) throws BizApiException;
public void removeCategoryInclusion(IItemCategoryBizKey bizKey, String termCd) throws BizApiException;
```

## Item Category Set (`ItemCategorySet`) Methods

`ItemCategorySet`, like `Company`/`DepartmentSet`, has no multilingual name fields. Like `CorporationGroupSet`, it also has a company-scoped variant, `getCategorySetAll(String companyCd)`.

```java
public ItemCategorySet getCategorySet(IItemCategorySetBizKey bizKey) throws BizApiException;
public ItemCategorySet[] getCategorySetAll() throws BizApiException; // Retrieves all item category sets across all companies
public ItemCategorySet[] getCategorySetAll(String companyCd) throws BizApiException; // Retrieves only the sets belonging to the given company

public void updateCategorySet(ItemCategorySet categorySet) throws BizApiException; // Updates an existing set
public void removeCategorySet(IItemCategorySetBizKey bizKey) throws BizApiException;
```

## Tree Operations

A method group in the same shape as the tree operations for `Department`/`CorporationGroup` is provided.

```java
public ItemCategoryTreeNode getTree(IItemCategorySetBizKey bizKey, Date date, Locale locale) throws BizApiException; // Tree of the entire item category set
public ItemCategoryTreeNode getAbsoluteTree(IItemCategorySetBizKey bizKey, Date date, Locale locale) throws BizApiException; // Absolute-position variant, including logically deleted/disabled data

public ItemCategoryTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemCategoryTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException;

public ITerm getTreeTerm(IItemCategorySetBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getTreeTermList(IItemCategorySetBizKey bizKey) throws BizApiException; // + isDisable
```

`getBranch`/`getUpBranch`/`getChildren`/`getParent`/`getIsolation` (and their `getAbsoluteXxx` variants) also exist, in the same shape as `Department`/`CorporationGroup`.

## Attachment Relationship with Items (`Item`)

Manages the relationship between an item category and an item (`Item` in the `jp.co.intra_mart.foundation.master.item` package). **Rather than a term-based attachment like `Department`⇔`User`, this is centered on a group of cross-search methods scoped by category or by tree.**

```java
// Simple attachment cross-search (category ⇔ item, bidirectional)
public ItemListNode[] getItemWithCategory(IItemCategoryBizKey bizKey, ...) throws BizApiException;
public ItemCategoryListNode[] getCategoryWithItem(IItemBizKey bizKey, ...) throws BizApiException;

public ItemListNode[] listItemWithCategory(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemListNode[] searchItemWithCategory(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countItemWithCategory(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalItemWithCategory(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

public ItemCategoryListNode[] listCategoryWithItem(IItemBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemCategoryListNode[] searchCategoryWithItem(IItemBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCategoryWithItem(IItemBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCategoryWithItem(IItemBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// Cross-search scoped to the tree/up-tree (Tree/UpTree, each with 4 families: list/search/count/total)
public ItemListNode[] listItemWithCategoryTree(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public ItemListNode[] listItemWithCategoryUpTree(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
// searchItemWithCategoryTree/UpTree, countItemWithCategoryTree/UpTree, totalItemWithCategoryTree/UpTree also exist, in the same shape
```

Each family also has an overload adding an `isDisable` argument. Following the same design philosophy as `PublicGroupManager`'s role-based cross-search (`listUserWithPublicGroupRoleOnPublicGroup`, etc.), the `*WithCategory*`/`*WithItem*` methods make up the majority of `ItemCategoryManager` (the `ItemCategoryManager.java` file alone exceeds 4,800 lines). Refer to `ItemCategoryManager.java` for the individual full signatures.

## `ItemCategory` Model Class

```java
package jp.co.intra_mart.foundation.master.item_category.model;

public class ItemCategory implements ISortable, IDisable, IWithLocale<IItemCategoryElement>, ITerm, IItemCategoryElement, IItemCategoryBizKey, IRecorder {
```

| Field | Description |
|---|---|
| `companyCd` / `itemCategorySetCd` / `itemCategoryCd` | Business key (`IItemCategoryBizKey`. A 3-component composite key, in the same shape as `Department`) |
| `defaultLocale` / `localeElementMap` | Multilingual support |
| `sortKey` | Sort key |
| `startDate` / `endDate` / `termCd` | Term information (`ITerm`) |
| `recordDate` / `recordUserCd` | Last-updated date/updater user code |

Localized information (`IItemCategoryElement`): `itemCategoryName` (item category name), `itemCategorySearchName` (search name), `itemCategoryShortName` (short name), `notes`.

## `IItemCategoryBizKey` Interface

```java
package jp.co.intra_mart.foundation.master.item_category.model;

public interface IItemCategoryBizKey {
    String getCompanyCd();
    String getItemCategorySetCd();
    String getItemCategoryCd();
    void setCompanyCd(String companyCd);
    void setItemCategorySetCd(String itemCategorySetCd);
    void setItemCategoryCd(String itemCategoryCd);
}
```

`IItemCategorySetBizKey` (`companyCd`/`itemCategorySetCd`) follows the same pattern. `ItemCategoryBizKey`/`ItemCategorySetBizKey` are the standard implementation classes.

## Import / Export

```java
public Set<String> getExportCategories(); // No exception
public Set<String> getImportCategories(); // No exception
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
