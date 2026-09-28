# UserManager API Reference (Java)

Based on the actual class definitions in the `im_master-main` module (`jp.co.intra_mart.foundation.master.user.*`). Do not supplement methods/attributes from memory or guesswork.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.user;

/**
 * Manager class for retrieving and managing user information
 * @since 7.2
 */
public class UserManager extends AbstractManager {
```

- The manager responsible for CRUD and search operations on IM Common Master (`im_master-main`) user information. Extends `AbstractManager` (a common base class holding the updater user code, default locale, and login group ID)
- Holds an internal extension point (`jp.co.intra_mart.foundation.master.accessor.user`) and delegates the actual read/write/notification/import/export operations to plugin implementations (`UserReader`/`UserWriter`/`UserListener`/`UserImporter`/`UserExporter`)

## Constructors

| Signature | Overview |
|---|---|
| `public UserManager() throws BizApiException` | **Recommended.** Uses the value of the "currently logged-in user" for the updater user code and default locale |
| `public UserManager(String updateUserCd) throws BizApiException` | Explicitly specifies the updater user code. The default locale is that of the currently logged-in user |
| `public UserManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specifies both the updater user code and default locale |
| `public UserManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `UserManager()` instead) |

The class JavaDoc explicitly states that omitted arguments fall back to the "currently logged-in user" value (`updateUserCd`/`defaultLocale` can each be omitted independently).

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (a **checked exception** extending `FoundationException` → `Exception`). Nearly all constructors and public methods declare `throws BizApiException`.

## Method List (the `User` entity itself)

All take `IUserBizKey` (an interface holding a user code; `User` also implements it) as the starting point of the argument. Omitting/passing `null` for `locale` retrieves internationalized information for all languages. `date` is the reference date (for term management).

```java
// Single retrieval (4 overloads: with/without locale / isDisable)
public User getUser(IUserBizKey bizKey, Date date) throws BizApiException;
public User getUser(IUserBizKey bizKey, Date date, boolean isDisable) throws BizApiException;
public User getUser(IUserBizKey bizKey, Date date, Locale locale) throws BizApiException;
public User getUser(IUserBizKey bizKey, Date date, Locale locale, boolean isDisable) throws BizApiException;

// Retrieve all terms for the specified user
public User[] getUserList(IUserBizKey bizKey) throws BizApiException; // Locale / isDisable overloads also exist

// Bulk retrieval of multiple users
public User[] getUsers(IUserBizKey[] bizKey, Date date) throws BizApiException; // Locale / isDisable overloads also exist

// Conditional search / listing (list* and search* share the same signature set. 3 patterns: no extra args / with start・count / with isDisable)
public UserListNode[] listUser(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public UserListNode[] listUser(AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException;
public UserListNode[] listUser(AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public UserListNode[] searchUser(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // A separate, identically-shaped family

// Count retrieval
public int countUser(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable overload. locale required
public int totalUser(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable overload. No locale (covers all languages)

// Create/update (auto-decided by term-code presence. This method cannot change the term itself)
public ITerm[] setUser(User user) throws BizApiException;

// Deletion (3 overloads)
public void removeUser(IUserBizKey bizKey) throws BizApiException; // Deletes all languages (and related information)
public void removeUser(IUserBizKey bizKey, Locale locale) throws BizApiException; // Deletes only the specified language
public void removeUser(Locale locale) throws BizApiException; // Deletes the specified language's data from all users

// Term operations
public void mergeBackwardTermUser(IUserBizKey bizKey, String termCd) throws BizApiException; // Merges with the preceding term
public void mergeForwardTermUser(IUserBizKey bizKey, String termCd) throws BizApiException; // Merges with the following term
public ITerm[] moveTermUser(IUserBizKey bizKey, ITerm term) throws BizApiException; // Changes the term
public ITerm separateTermUser(IUserBizKey bizKey, String termCd, Date date) throws BizApiException; // Splits the term at the specified date
```

### How `setUser` decides between create and update

JavaDoc: "For the given user information, if no term code is specified, the user information is newly registered. If a term code is specified, the user information is updated. This method cannot change the term."

- `User.termCd` (from the `ITerm` interface) is `null`/unset → creation (the return value contains the newly created `ITerm[]`)
- `termCd` is set → update (the return value is an empty array)
- **On creation (when `termCd` is unset), both `startDate` and `endDate` are required.** `AppCmnValidationManager.validateModel` checks that `startDate`/`endDate` are non-null and that `startDate < endDate` whenever `termCd == null`; calling `setUser` without them throws `BizApiException` ("開始日にnullが設定されています" — "startDate is set to null" — or similar). Set a date within the system start date (fixed at `1900/01/01`) through the system end date (default `3000/01/01`, configurable via the `jp.co.intra_mart.master.config.system_end_date` extension point)
- To change the term itself, use `moveTermUser`/`separateTermUser`/`mergeForwardTermUser`/`mergeBackwardTermUser`

## Method List (user categories and category items)

The same CRUD/search pattern as `User` is provided for user categories (`UserCtg`) and category items (`UserCtgItm`).

```java
public UserCtg getUserCategory(IUserCtgBizKey bizKey) throws BizApiException; // + Locale overload
public UserCtgItm getUserCategoryItem(IUserCtgItmBizKey bizKey) throws BizApiException; // + Locale overload

public UserCtgListNode[] listUserCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public UserCtgItmListNode[] listUserCategoryItem(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable

public int countUserCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countUserCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;

public void setUserCategory(UserCtg userCategory) throws BizApiException; // Upsert
public void setUserCategoryItem(UserCtgItm userCategoryItem) throws BizApiException; // Upsert

public void removeUserCategory(IUserCtgBizKey bizKey) throws BizApiException; // + Locale overload, a Locale-only all-records variant
public void removeUserCategoryItem(IUserCtgItmBizKey bizKey) throws BizApiException; // + Locale overload, a Locale-only all-records variant
```

### User ⇔ category item membership

```java
// Grant membership (associates a category item with a user, with a term)
public void setUserCategoryItemAttach(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey, ITerm term) throws BizApiException;
public void removeUserCategoryItemAttach(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey, String termCd) throws BizApiException;
public ITerm getUserCategoryItemAttachTerm(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey, Date date) throws BizApiException;
public ITerm[] getUserCategoryItemAttachTermList(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey) throws BizApiException; // + isDisable

// Cross search (category items tied to a specific user / users granted a specific category item)
public UserCtgItmListNode[] listUserCategoryItemWithUser(IUserBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public UserListNode[] listUserWithUserCategoryItem(IUserCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public int countUserCategoryItemWithUser(IUserBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countUserWithUserCategoryItem(IUserCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
```

## `UserCtg` / `UserCtgItm` Model Classes

```java
package jp.co.intra_mart.foundation.master.user.model;

public class UserCtg implements IUserCtgBizKey, ISortable, IDisable, IRecorder, IWithLocale<IUserCtgElement>, IUserCtgElement {
    private String categoryCd;      // Business key
    private String categoryType;    // Category type (an accompanying field not part of IUserCtgBizKey)
    private Locale defaultLocale;
    private final Map<Locale, IUserCtgElement> localeElementMap; // categoryName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}

public class UserCtgItm implements IUserCtgItmBizKey, ISortable, IDisable, IRecorder, IWithLocale<IUserCtgItmElement> {
    private String categoryCd;
    private String categoryItemCd;  // Business key (combined with categoryCd)
    private Locale defaultLocale;
    private final Map<Locale, IUserCtgItmElement> localeElementMap; // categoryItemName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}
```

Neither implements term management (`ITerm`). `IUserCtgBizKey` (`categoryCd`) and `IUserCtgItmBizKey` (`categoryCd`/`categoryItemCd`) are the corresponding business key interfaces. Nearly identical in shape to `PublicGroupCtg`/`PublicGroupCtgItm` (see `reference/public-group-manager-api-reference.md`).

**`categoryType` is a single-character (`varchar(1)`) column.** It carries `@NotNullValidation` but no `@LengthValidation`, so Java-side validation cannot catch an over-length value — setting 2 or more characters only fails at SQL execution time, as a `BizApiException` wrapping a `PSQLException` about the value being too long.

**`IUserCtgElement#getNotes()`/`IUserCtgItmElement#getNotes()` carry `@LengthValidation` only, with no `@NotNullValidation` (i.e. the field is optional), yet calling `setUserCategory`/`setUserCategoryItem` while it is left unset (null) throws a `NullPointerException`.** This happens because the platform's validation implementation (`LengthPropertyValidityChecker`) calls `toString()` on the value without a null check. Explicitly set `notes` to an empty string even when you don't use it.

## Import / Export

```java
public Set<String> getExportCategories(); // No exception
public Set<String> getImportCategories(); // No exception
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```

If `categoryName` is not among the supported categories, a `BizApiException` ("Export category not found: ..." / "Import category not found: ...") is thrown.

## The `User` Model Class

```java
package jp.co.intra_mart.foundation.master.user.model;

public class User implements IUserBizKey, ISortable, IDisable, IRecorder, IWithLocale<IUserElement>, ITerm, IUserElement {
```

| Field | Type | Overview |
|---|---|---|
| `userCd` | `String` | User code (`IUserBizKey`) |
| `defaultLocale` | `Locale` | Default locale |
| `localeElementMap` | `Map<Locale, IUserElement>` | Per-locale internationalized information (`IWithLocale`) |
| `disable` | `boolean` | Logical-deletion flag |
| `startDate` / `endDate` / `termCd` | `Date` / `Date` / `String` | Term information (`ITerm`) |
| `recordDate` / `recordUserCd` | `Date` / `String` | Update date / updater user code (`IRecorder`) |
| `sex` | `String` (default `""`) | Sex. JavaDoc: `0: male, 1: female, 2: other, 9: prefer not to say` |
| `sortKey` | `int` | Sort key (`ISortable`) |

Internationalized information (`IUserElement`, accessible via delegation to the default locale): `userName`, `userSearchName` (name for search), `address1`–`address3`, `zipCode`, `countryCd`, `telephoneNumber`, `extensionNumber`, `faxNumber`, `extensionFaxNumber`, `mobileNumber`, `emailAddress1`/`emailAddress2`, `mobileEmailAddress`, `url`, `notes`.

```java
// Example of a delegating accessor to the default locale's internationalized information
@Override
public IUserElement getDefaultLocaleElement() {
    return localeElementMap.get(defaultLocale);
}

@Override
public String getAddress1() {
    return getDefaultLocaleElement().getAddress1();
}

@Override
public void putLocaleElement(Locale locale, IUserElement element) {
    localeElementMap.put(locale, element);
}
```

`createLocaleElement()` is a factory method that creates a new `IUserElement` implementation (`UserElement`) instance. When registering per-locale name/address/etc. information, create the element with `putLocaleElement(locale, user.createLocaleElement())` first, then call each setter.

## The `IUserBizKey` Interface

```java
package jp.co.intra_mart.foundation.master.user.model;

public interface IUserBizKey {
    String getUserCd();
    void setUserCd(String userCd);
}
```

A business key holding only the user code. Since `User` implements this interface, a `User` instance can be passed directly as an `IUserBizKey` argument. To pass just a user code, either create a lightweight `IUserBizKey` implementation, or create a `User` and call only `setUserCd`.

## Validation Infrastructure (Supplementary)

Each method performs argument validation via the following utilities before the main processing. On a validation error, a `BizApiException`-family exception is thrown.

- `jp.co.intra_mart.foundation.validation.ModelValidationManager` — `validateNotNull` (null check), `validateProperty` (property validation for `IUserBizKey`, etc.)
- `jp.co.intra_mart.system.master.validation.AppCmnValidationManager` — `validateDateRange` (checks the reference date falls within the system's start-to-end date range), `validateModel` (whole-model validation), `validateTerm`/`convertTerm` (term information validation/normalization)

## Master Update Log

Creation/update/deletion methods use `jp.co.intra_mart.system.log.masterlog.MasterLog` to always log the processing result (success/failure) in a `finally` block. Log message IDs follow the naming convention `IM-MASTERLOG.IMMUserManager.<method name>.<sequence number>`. The application side does not need to call logging explicitly (it is done automatically inside `UserManager`).
