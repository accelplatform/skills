# CustomerManager API Reference (Java)

Based on the actual class definitions in the `im_master-main` module (`jp.co.intra_mart.foundation.master.customer.*`). Do not supplement methods or attributes from memory or guesswork.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.customer;

public final class CustomerManager extends AbstractManager {
```

- A manager responsible for CRUD and search operations on customer information in the IM Common Master (`im_master-main`). Extends `AbstractManager`
- Delegates to plugin implementations (`CustomerReader`/`CustomerWriter`/`CustomerListener`/`CustomerImporter`/`CustomerExporter`) via an extension point (default: `jp.co.intra_mart.foundation.master.accessor.customer`)
- Has no classification, tree, or inclusion operations. A simple structure that handles only a single entity — the customer itself
- **Unlike other classes (`UserManager`/`CompanyManager`, etc.), the CRUD/search method names are generic and do not include the target's name** (`get`/`set`/`remove`/`list`/`search`/`count`/`total`/`getTerm`/`moveTerm`/`separateTerm`/`mergeForwardTerm`/`mergeBackwardTerm`). This design reflects the fact that `CustomerManager` handles only a single entity type, `Customer`, so there is no need to include the entity name in the method names
- **The search/list/count methods all take `String companyCd` (the target company code) as their first argument.** Customers are a master entity scoped per company

## Constructors

| Signature | Description |
|---|---|
| `public CustomerManager() throws BizApiException` | **Recommended.** Uses the "currently logged-in user" for the updater user code and default locale |
| `public CustomerManager(String updateUserCd) throws BizApiException` | Explicitly specify the updater user code |
| `public CustomerManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specify both the updater user code and default locale |
| `public CustomerManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `CustomerManager()`) |

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (a checked exception). Constructors and all CRUD/search methods consistently declare only this exception (except `getExportCategories()`/`getImportCategories()`, which declare none).

## Method List

For `get`, when the target does not exist, the date-scoped single-fetch overloads return `null`, and the overloads returning an array return an empty array.

```java
// Fetch
public Customer[] get(ICustomerBizKey bizKey) throws BizApiException; // All terms, all locales
public Customer[] get(ICustomerBizKey bizKey, boolean isDisable) throws BizApiException;
public Customer get(ICustomerBizKey bizKey, Date termDate) throws BizApiException; // Given date, single record. null if not found
public Customer get(ICustomerBizKey bizKey, Date termDate, boolean isDisable) throws BizApiException;
public Customer[] get(ICustomerBizKey bizKey, Locale locale) throws BizApiException; // Given locale, all terms
public Customer[] get(ICustomerBizKey bizKey, Locale locale, boolean isDisable) throws BizApiException;
public Customer get(ICustomerBizKey bizKey, Date termDate, Locale locale) throws BizApiException;
public Customer get(ICustomerBizKey bizKey, Date termDate, Locale locale, boolean isDisable) throws BizApiException;

// Retrieve term information
public ITerm getTerm(ICustomerBizKey bizKey, Date termDate) throws BizApiException;

// Search/list/count (all take companyCd as the first argument)
public CustomerListNode[] search(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CustomerListNode[] list(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException; // + isDisable
public int count(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int total(String companyCd, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// Create/update (auto-decided by whether the term code is set)
public ITerm[] set(Customer customer) throws BizApiException;

// Delete
public void remove(ICustomerBizKey bizKey) throws BizApiException; // Deletes all terms
public void remove(Locale locale) throws BizApiException; // Deletes the given locale's data across all customers. **`@Deprecated`**

// Term operations
public ITerm separateTerm(ICustomerBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTerm(ICustomerBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTerm(ICustomerBizKey bizKey, String mergeTermCd) throws BizApiException;
```

The table that can be specified in `condition` is `ImmCustomerColumn` (`imm_customer`).

## `Customer` Model Class

```java
package jp.co.intra_mart.foundation.master.customer.model;

public class Customer implements ICustomerBizKey, ISortable, IDisable, IWithLocale<ICustomerElement>, ITerm, ICustomerElement, IRecorder {
```

| Field | Description |
|---|---|
| `companyCd` / `customerCd` | Business key (`ICustomerBizKey`) |
| `defaultLocale` / `localeElementMap` | Multilingual support (`IWithLocale`) |
| `sortKey` | Sort key |
| `startDate` / `endDate` / `termCd` | Term information (`ITerm`) |
| `recordDate` / `recordUserCd` | Last-updated date/updater user code |

Localized information (`ICustomerElement`): `customerName` (customer name), `customerShortName` (customer short name), `customerSearchName` (customer search name), `corporateNumber` (customer's corporate number), `chargePersonName` (contact person name — **a field specific to `Customer`, not present on `Corporation`/`User`**), `countryCd`, `zipCode`, `address1`–`address3`, `telephoneNumber`/`extensionNumber`/`faxNumber`/`extensionFaxNumber`, `emailAddress1`/`emailAddress2`, `url`, `notes`.

## `ICustomerBizKey` Interface

```java
package jp.co.intra_mart.foundation.master.customer.model;

public interface ICustomerBizKey {
    String getCompanyCd();
    String getCustomerCd();
    void setCompanyCd(String companyCd);
    void setCustomerCd(String customerCd);
}
```

The business key has two components: `companyCd`/`customerCd`.

## Import / Export

```java
public Set<String> getImportCategories(); // No exception
public Set<String> getExportCategories(); // No exception
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
```
