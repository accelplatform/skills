# ItemManager API Reference (Java)

Based on the actual class definitions in the `im_master-main` module (`jp.co.intra_mart.foundation.master.item.*`). Do not supplement methods or attributes from memory or guesswork.

**This is a different class from `ItemCategoryManager`** (item category, `jp.co.intra_mart.foundation.master.item_category`). CRUD for the item itself is handled by this class, while the attachment relationship with item categories and the category hierarchy are handled by `ItemCategoryManager`. See `reference/item-category-manager-api-reference.md`.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.item;

public final class ItemManager extends AbstractManager {
```

- A manager responsible for CRUD and search operations on item information in the IM Common Master (`im_master-main`). Extends `AbstractManager`
- Delegates to plugin implementations (`ItemReader`/`ItemWriter`/`ItemListener`/`ItemImporter`/`ItemExporter`) via an extension point (default: `jp.co.intra_mart.foundation.master.accessor.item`)
- **Follows the same design as `CustomerManager`. The CRUD/search method names are generic and do not include the target's name** (`get`/`set`/`remove`/`list`/`search`/`count`/`total`/`getTerm`/`moveTerm`/`separateTerm`/`mergeForwardTerm`/`mergeBackwardTerm`). The search/list/count methods take `String companyCd` as their first argument (items are a master entity scoped per company)
- Has no attachment relationship or hierarchy (tree) operations with item categories (those are implemented on the `ItemCategoryManager` side)

## Constructors

| Signature | Description |
|---|---|
| `public ItemManager() throws BizApiException` | **Recommended.** Uses the "currently logged-in user" for the updater user code and default locale |
| `public ItemManager(String updateUserCd) throws BizApiException` | Explicitly specify the updater user code |
| `public ItemManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specify both the updater user code and default locale |
| `public ItemManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `ItemManager()`) |

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (a checked exception). Constructors and all CRUD/search methods consistently declare only this exception.

## Method List

```java
// Fetch
public Item[] get(IItemBizKey bizKey) throws BizApiException; // All terms, all locales
public Item[] get(IItemBizKey bizKey, boolean isDisable) throws BizApiException;
public Item get(IItemBizKey bizKey, Date termDate) throws BizApiException; // Given date, single record. null if not found
public Item[] get(IItemBizKey bizKey, Locale locale) throws BizApiException;
public Item get(IItemBizKey bizKey, Date termDate, Locale locale) throws BizApiException;

// Search/list/count (all take companyCd as the first argument)
public ItemListNode[] search(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemListNode[] list(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException; // + isDisable
public int count(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int total(String companyCd, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// Create/update (auto-decided by whether the term code is set)
public ITerm[] set(Item item) throws BizApiException;

// Delete
public void remove(IItemBizKey bizKey) throws BizApiException;
public void remove(IItemBizKey bizKey, Locale locale) throws BizApiException;
public void remove(Locale locale) throws BizApiException; // Deletes the given locale's data across all items

// Term operations
public ITerm[] moveTerm(IItemBizKey bizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTerm(IItemBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTerm(IItemBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTerm(IItemBizKey bizKey, String mergeTermCd) throws BizApiException;
```

The table that can be specified in `condition` is `ImmItemColumn` (`imm_item`).

## `Item` Model Class

```java
package jp.co.intra_mart.foundation.master.item.model;

public class Item implements IItemBizKey, ISortable, IDisable, IRecorder, IWithLocale<IItemElement>, ITerm, IItemElement {
```

| Field | Description |
|---|---|
| `companyCd` / `itemCd` | Business key (`IItemBizKey`) |
| `defaultLocale` / `localeElementMap` | Multilingual support (`IWithLocale`) |
| `sortKey` | Sort key |
| `startDate` / `endDate` / `termCd` | Term information (`ITerm`) |
| `recordDate` / `recordUserCd` | Last-updated date/updater user code |

The localized information (`IItemElement`) has only 4 items: `itemName` (item name), `itemSearchName` (item search name), `itemShortName` (item short name), `notes`. Unlike `User`/`Corporation`/`Customer`, this is a minimal model with no contact-related fields such as address or phone number.

## `IItemBizKey` Interface

```java
package jp.co.intra_mart.foundation.master.item.model;

public interface IItemBizKey {
    String getCompanyCd();
    String getItemCd();
    void setCompanyCd(String companyCd);
    void setItemCd(String itemCd);
}
```

The business key has two components: `companyCd`/`itemCd`.

## Import / Export

```java
public Set<String> getImportCategories(); // No exception
public Set<String> getExportCategories(); // No exception
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
```
