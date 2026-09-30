# PrivateGroupManager API Reference (Java)

Based on the actual class definitions in the `im_master-main` module (`jp.co.intra_mart.foundation.master.private_group.*`). Do not supplement methods/attributes from memory or guesswork.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.private_group;

/**
 * Manager class for retrieving and managing private group information
 * @since 7.2
 */
public class PrivateGroupManager extends AbstractManager {
```

- A manager responsible for CRUD and search on private group information in the IM Common Master (`im_master-main`). It extends `AbstractManager` (a common base class holding the updater user code, default locale, and login group ID)
- It has an internal extension point (`jp.co.intra_mart.foundation.master.accessor.private_group`) and delegates the actual read/write/notification/import/export work to plugin implementations (`PrivateGroupReader`/`PrivateGroupWriter`/`PrivateGroupListener`/`PrivateGroupImporter`/`PrivateGroupExporter`)
- Unlike the managers for users, companies, and corporation groups, it has no category, role, or tree features. It is a small-scale API specialized in managing groups per owner (`userCd`) and their members (`setUserAttach`/`removeUserAttach`/`*WithPrivateGroup` family)
- Unlike `User`/`Company`, it has no term (`ITerm`) management. `PrivateGroup` does not implement `ITerm`

## Constructors

| Signature | Overview |
|---|---|
| `public PrivateGroupManager() throws BizApiException` | **Recommended.** Uses the value of the "currently logged-in user" for the updater user code and default locale |
| `public PrivateGroupManager(String updateUserCd) throws BizApiException` | Explicitly specifies the updater user code. The default locale is the locale of the currently logged-in user |
| `public PrivateGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specifies both the updater user code and default locale |
| `public PrivateGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `PrivateGroupManager()` instead) |

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (a checked exception). Almost all constructors and public methods declare `throws BizApiException`.

## Method List

All methods take `IPrivateGroupBizKey` (an interface holding the combination of the private group code and the user code; also implemented by `PrivateGroup`) as the starting point for their arguments.

```java
// Count
public int countPrivateGroup(AppCmnSearchCondition condition) throws BizApiException;
public int countUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable overload
public int totalUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable overload. No locale argument (covers all languages)

// Single retrieval. If the target does not exist, no exception is thrown and null is returned
public PrivateGroup getPrivateGroup(IPrivateGroupBizKey bizKey) throws BizApiException;

// Listing/searching users belonging to a private group (3 variants: no extra args / with start・count / with isDisable, all of the same shape)
public UserListNode[] listUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public UserListNode[] listUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException;
public UserListNode[] listUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public UserListNode[] searchUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // a separate family with the same shape (+ start/count, isDisable overloads exist)

// Searching for private groups themselves
public PrivateGroupListNode[] searchPrivateGroup(AppCmnSearchCondition condition) throws BizApiException;
public PrivateGroupListNode[] searchPrivateGroup(AppCmnSearchCondition condition, int start, int count) throws BizApiException;

// Create/update
public void setPrivateGroup(PrivateGroup privateGroup) throws BizApiException;
public void setUserAttach(IPrivateGroupBizKey privateGroupBizKey, IUserBizKey userBizKey, int sortKey) throws BizApiException;

// Delete
public void removePrivateGroup(IPrivateGroupBizKey bizKey) throws BizApiException;
public void removeUserAttach(IPrivateGroupBizKey privateGroupBizKey, IUserBizKey userBizKey) throws BizApiException;
```

The table that can be specified in `condition` (`AppCmnSearchCondition`) is the `imm_private_grp` table for operations on the private group itself (`countPrivateGroup`/`searchPrivateGroup`), and the `imm_user` table for operations involving belonging users (`countUserWithPrivateGroup`/`listUserWithPrivateGroup`/`searchUserWithPrivateGroup`/`totalUserWithPrivateGroup`). For the `list`/`search` family, `start`/`count` start at 1, and setting `count` to 0 retrieves all records.

## Create/Update Determination for `setPrivateGroup` / `setUserAttach`

The determination method differs from `UserManager#setUser` (which decides based on the presence of `termCd`). Since `PrivateGroup` does not implement `ITerm` and has no `termCd`, **the create/update determination is made not by the manager itself but by the return value of `PrivateGroupWriter`/`IUserBizKey`**.

- `setPrivateGroup(PrivateGroup)`: if the return value (`PrivateGroup`) of `executor.getWriter().setPrivateGroup(...)` is non-`null`, it is a new registration (firing `PrivateGroupListener#createPrivateGroup`); if `null`, it is an update (firing `PrivateGroupListener#updatePrivateGroup`). Model-wide validation via `AppCmnValidationManager.validateModel` is performed before the call
- `setUserAttach(IPrivateGroupBizKey, IUserBizKey, int)`: if the return value (`IUserBizKey`) of `executor.getWriter().setUserAttach(...)` is non-`null`, it is a new addition (firing `PrivateGroupListener#createUserAttach`); if `null`, it is an update (firing `PrivateGroupListener#updateUserAttach`). Before the call, only `validateProperty` checks are performed for each of `privateGroupBizKey`/`userBizKey`; there is no explicit validation for `sortKey` within the method
- In both cases, whichever branch (create/update) is taken is decided by the reader/writer implementation (the extension point side) based on whether the target data exists; `PrivateGroupManager` itself does not decide based on a caller-supplied input value such as `termCd`

## Internal Logging of Delete/Registration Methods

The registration/update/delete methods (`setPrivateGroup`/`setUserAttach`/`removePrivateGroup`/`removeUserAttach`/`importData`) always log the processing result (success/failure) in a `finally` block, using `jp.co.intra_mart.system.log.masterlog.MasterLog`. The log message ID follows the naming convention `IM-MASTERLOG.IMMPrivateGroupManager.<method name>.<sequence number>`. The application side does not need to call logging explicitly.

## Model Classes

### `PrivateGroup`

```java
package jp.co.intra_mart.foundation.master.private_group.model;

public class PrivateGroup implements IPrivateGroupBizKey, ISortable, IRecorder {
```

| Field | Type | Overview |
|---|---|---|
| `privateGroupCd` | `String` | Private group code (`IPrivateGroupBizKey`, required) |
| `userCd` | `String` | **Owner code** (`IPrivateGroupBizKey`, required). Note that per the JavaDoc it is the "owner code," which has a different meaning from the general description on the `IPrivateGroupBizKey` side ("user code") |
| `privateGroupName` | `String` (default `""`) | Private group name (required) |
| `privateGroupSearchName` | `String` (default `""`) | Private group search name |
| `notes` | `String` (default `""`) | Notes |
| `sortKey` | `int` | Sort key (`ISortable`) |
| `recordDate` / `recordUserCd` | `Date` / `String` | Update date / updater user code (`IRecorder`) |

It implements neither term management (`ITerm`) nor internationalization information (`IWithLocale`). A single-language model with no per-locale multilingual data.

### `IPrivateGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.private_group.model;

public interface IPrivateGroupBizKey {
    String getPrivateGroupCd(); // @NotNullValidation @LengthValidation(min=1)
    void setPrivateGroupCd(String privateGroupCd);
    String getUserCd();         // @NotNullValidation @LengthValidation(min=1)
    void setUserCd(String userCd);
}
```

The business key is the combination of the private group code and the user code. Since `PrivateGroup` implements this interface, a `PrivateGroup` instance can be passed directly as an `IPrivateGroupBizKey` argument.

### `PrivateGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.private_group.model;

public class PrivateGroupBizKey implements IPrivateGroupBizKey {
```

A lightweight `IPrivateGroupBizKey` implementation class holding only `privateGroupCd`/`userCd`. Used when only the business key needs to be passed (when a full `PrivateGroup` need not be assembled).

## Import / Export

```java
public Set<String> getExportCategories(); // no exception
public Set<String> getImportCategories(); // no exception
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```

If `categoryName` is not included in the corresponding Categories, a `BizApiException` ("Export category not found: ..." / "Import category not found: ...") is thrown.
