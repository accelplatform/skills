# CorporationManager API Reference (Java)

Based on the actual class definitions in the `im_master-main` module (`jp.co.intra_mart.foundation.master.corporation.*`). Do not supplement methods or attributes from memory or guesswork.

**This is a different class from `CorporationGroupManager`** (corporation group, `jp.co.intra_mart.foundation.master.corporation_group`). Do not confuse them. `Corporation` is an independent master entity directly linked to customers (`Customer`); it is not a sub-entity of a corporation group.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.corporation;

public final class CorporationManager extends AbstractManager {
```

- A manager responsible for CRUD and search operations on corporation information in the IM Common Master (`im_master-main`). Extends `AbstractManager`
- Delegates to plugin implementations (`CorporationReader`/`CorporationWriter`/`CorporationListener`/`CorporationImporter`/`CorporationExporter`) via an extension point (default: `jp.co.intra_mart.foundation.master.accessor.corporation`)
- **Unlike `CorporationGroupManager`/`PublicGroupManager`, it has no tree operations, classification (category) operations, or inclusion (parent-child) operations.** It consists only of CRUD/search/term operations on the corporation itself and attachment operations with customers (`Customer`) — a simple structure

## Constructors

| Signature | Description |
|---|---|
| `public CorporationManager() throws BizApiException` | **Recommended.** Uses the "currently logged-in user" for the updater user code and default locale |
| `public CorporationManager(String updateUserCd) throws BizApiException` | Explicitly specify the updater user code |
| `public CorporationManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specify both the updater user code and default locale |
| `public CorporationManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `CorporationManager()`) |

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (a checked exception). Constructors and nearly all CRUD/search methods declare only this exception (except `getExportCategories()`/`getImportCategories()`, which declare none).

## Corporation (`Corporation`) Methods

`getCorporation` returns `null` (rather than throwing) when the target does not exist for the date-scoped single-fetch overload. The overloads that take only `ICorporationBizKey`/`isDisable` return an empty array instead.

```java
public Corporation[] getCorporation(ICorporationBizKey bizKey) throws BizApiException; // All terms, all locales
public Corporation[] getCorporation(ICorporationBizKey bizKey, boolean isDisable) throws BizApiException;
public Corporation getCorporation(ICorporationBizKey bizKey, Date termDate) throws BizApiException; // Single record for a given date
public Corporation[] getCorporation(ICorporationBizKey bizKey, Locale locale) throws BizApiException; // Given locale, all terms
public Corporation getCorporation(ICorporationBizKey bizKey, Date termDate, Locale locale) throws BizApiException;

public CorporationListNode[] listCorporation(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable overloads
public CorporationListNode[] searchCorporation(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // A separate but identically-shaped family to listCorporation

public int countCorporation(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporation(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable. No locale argument

// Create/update (auto-decided by whether the term code is set — same pattern as User/Department)
public ITerm[] setCorporation(Corporation corporation) throws BizApiException;

public void removeCorporation(ICorporationBizKey bizKey) throws BizApiException; // Deletes all locales
public void removeCorporation(ICorporationBizKey bizKey, Locale locale) throws BizApiException; // Only the given locale
public void removeCorporation(Locale locale) throws BizApiException; // Deletes the given locale's data across all corporations
```

The table that can be specified in `condition` is `ImmCorporationColumn` (`imm_corporation`).

### Term Operations

```java
public ITerm getCorporationTerm(ICorporationBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCorporationTermList(ICorporationBizKey bizKey) throws BizApiException; // + isDisable

public ITerm[] moveTermCorporation(ICorporationBizKey bizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTermCorporation(ICorporationBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTermCorporation(ICorporationBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTermCorporation(ICorporationBizKey bizKey, String mergeTermCd) throws BizApiException;
```

## Attachment with Customers (`Customer`)

Manages the many-to-many attachment relationship (with term management) between a corporation and a customer (`Customer` in the `jp.co.intra_mart.foundation.master.customer` package). There is no dedicated model class; the relationship is manipulated via `setCorporationAttach`/`removeCorporationAttach` and related methods.

```java
// Attach/update (new attachment when termCd is unset, update when termCd is set)
public ITerm[] setCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, ITerm term) throws BizApiException;

// Detach
public void removeCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey) throws BizApiException;

// Retrieve the attachment term
public ITerm getCorporationAttachTerm(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, Date date) throws BizApiException;
public ITerm[] getCorporationAttachTermList(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey) throws BizApiException; // + isDisable

// Term operations
public ITerm[] moveTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, String mergeTermCd) throws BizApiException;
```

### Cross-Search (Corporation ⇔ Customer)

```java
// Corporations a customer is attached to
public CorporationListNode[] getCorporationWithCustomer(ICustomerBizKey bizKey, Date termDate, Locale locale) throws BizApiException; // + isDisable
public CorporationListNode[] searchCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationListNode[] listCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public int countCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// Customers attached to a corporation
public CustomerListNode[] getCustomerWithCorporation(ICorporationBizKey bizKey, Date termDate, Locale locale) throws BizApiException; // + isDisable
public CustomerListNode[] searchCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CustomerListNode[] listCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public int countCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable
```

## `Corporation` Model Class

```java
package jp.co.intra_mart.foundation.master.corporation.model;

public class Corporation implements ICorporationBizKey, ISortable, IDisable, IRecorder, IWithLocale<ICorporationElement>, ITerm, ICorporationElement {
```

| Field | Description |
|---|---|
| `companyCd` / `corporationCd` | Business key (`ICorporationBizKey`) |
| `defaultLocale` / `localeElementMap` | Multilingual support (`IWithLocale`) |
| `disable` | Deletion flag |
| `sortKey` | Sort key |
| `startDate` / `endDate` / `termCd` | Term information (`ITerm`) |
| `recordDate` / `recordUserCd` | Last-updated date/updater user code (`IRecorder`) |

Localized information (`ICorporationElement`): `corporationName`, `corporationShortName`, `corporationSearchName`, `corporateNumber` (with `@CorporateNumberValidation`), `countryCd`, `zipCode`, `address1`–`address3`, `telephoneNumber`/`extensionNumber`/`faxNumber`/`extensionFaxNumber`, `emailAddress1`/`emailAddress2`, `url`, `notes`. Nearly identical in shape to `User`'s and `Customer`'s localized information.

The registration procedure using `createLocaleElement()`/`putLocaleElement(Locale, ICorporationElement)` is identical to `User`'s (see Pattern 3 in `assets/user-master-basic-usage.md`).

## `ICorporationBizKey` Interface

```java
package jp.co.intra_mart.foundation.master.corporation.model;

public interface ICorporationBizKey {
    String getCompanyCd();
    String getCorporationCd();
    void setCompanyCd(String companyCd);
    void setCorporationCd(String corporationCd);
}
```

The business key has two components: `companyCd`/`corporationCd`. `CorporationBizKey` is the standard implementation (a lightweight two-field implementation class).

## `CorporationListNode`

```java
package jp.co.intra_mart.foundation.master.corporation.model;

public class CorporationListNode implements ListNode, ICorporationBizKey {
    // Holds displayName / description / shortName / deleteFlag
    public String getDescription();
    public String getDisplayName();
    public String getShortName();
}
```

## Import / Export

```java
public Set<String> getExportCategories(); // No exception
public Set<String> getImportCategories(); // No exception
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
