# Account API Basic Usage Patterns (Java Version)

For the signatures and internal behavior of `AccountInfoManager` / `AccountInfo` / `AccountRoleInfo` / `AccountPasswordAdapter`, see
`reference/account-api-reference.md`. Here we show typical call patterns.

**Operating on role definitions themselves (new registration, hierarchy, categories) is out of scope for this skill.** The only thing covered here is "assigning a role to a user"; creating or changing role definitions should use `java-im-role-usage`.

## Pattern 1: Registering New Account Information

An example that also sets login settings (locale, time zone, calendar, first day of week).

```java
package jp.co.example.foo.service;

import java.util.Locale;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountRegistrationException;

/**
 * Provides account information registration processing.
 */
public class AccountRegistrationService {

    /**
     * Registers new account information.<br>
     * Also sets the login settings (locale, time zone, calendar, first day of week).
     *
     * @param userCd User code
     * @param password Password (if the storage method is hashing, it is hashed internally by the platform before storage)
     * @throws AccountRegistrationException If account information registration fails
     */
    public void registerAccount(final String userCd, final String password) throws AccountRegistrationException {
        final AccountInfo accountInfo = new AccountInfo(userCd);
        accountInfo.setPassword(password);
        accountInfo.setLocale(Locale.JAPAN);
        accountInfo.setTimeZoneId("Asia/Tokyo");
        accountInfo.setCalendarId("standard");
        accountInfo.setFirstDayOfWeek(1);

        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            accountInfoManager.addAccountInfo(accountInfo);
        } catch (final AdminException e) {
            throw new AccountRegistrationException("Failed to register account information: userCd=" + userCd, e);
        }
    }
}
```

- The `AccountInfo` constructor requires `userCd`. The valid start/end dates are automatically set to the system's minimum/maximum date, so there is no need to set them explicitly for an account that should be valid indefinitely
- Set `locale` as a `java.util.Locale`, not a `String`

## Pattern 2: Fetching and Updating Account Information (Excluding the Password From the Update)

Leverages the fact that `AccountInfo#getPassword()` returns `null` when the storage method is hashing, updating only the other fields without touching the password.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountUpdateException;

/**
 * Provides account information update processing.
 */
public class AccountProfileUpdateService {

    /**
     * Updates the account's notes field.<br>
     * By passing the {@link AccountInfo} fetched from {@link AccountInfoManager#getAccountInfo(String)} straight
     * into {@link AccountInfoManager#updateAccountInfo(AccountInfo)}, when the password storage method is hashing,
     * the password field remains null and only the fields other than the password are updated.
     *
     * @param userCd User code
     * @param notes Notes
     * @throws AccountUpdateException If fetching or updating the account information fails
     */
    public void updateNotes(final String userCd, final String notes) throws AccountUpdateException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
            if (accountInfo == null) {
                throw new AccountUpdateException("Account information does not exist: userCd=" + userCd);
            }

            // Leave password untouched (pass it to updateAccountInfo exactly as fetched) so it is excluded from the update
            accountInfo.setNotes(notes);
            accountInfoManager.updateAccountInfo(accountInfo);
        } catch (final AdminException e) {
            throw new AccountUpdateException("Failed to update account information: userCd=" + userCd, e);
        }
    }
}
```

- Always fetch the existing values with `getAccountInfo()` first before changing only the fields you need. Instantiating a fresh `new AccountInfo(userCd)` each time and passing it to `updateAccountInfo()` with unset fields left at their initial values will unintentionally overwrite the other fields (see the anti-patterns section for details)

## Pattern 3: Login Verification Using Password Matching

Never compare `AccountInfo#getPassword()` directly — always use `AccountPasswordAdapter#collate()`.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.account.password.AccountPasswordAdapter;
import jp.co.intra_mart.foundation.admin.exception.PasswordException;

import jp.co.example.foo.exception.AccountAuthenticationException;

/**
 * Provides account login authentication processing.
 */
public class AccountAuthenticationService {

    /**
     * Verifies whether the entered password matches the account's stored password.<br>
     * When the password storage method is hashing, the plaintext password cannot be fetched or compared directly,
     * so you must always use {@link AccountPasswordAdapter#collate(String, String)}.
     *
     * @param userCd User code
     * @param password The entered password (plaintext)
     * @return true if the password matches
     * @throws AccountAuthenticationException If password verification processing fails
     */
    public boolean authenticate(final String userCd, final String password) throws AccountAuthenticationException {
        final AccountPasswordAdapter accountPasswordAdapter = new AccountPasswordAdapter();
        try {
            return accountPasswordAdapter.collate(userCd, password);
        } catch (final PasswordException e) {
            throw new AccountAuthenticationException("Password verification processing failed: userCd=" + userCd, e);
        }
    }
}
```

- Note that `PasswordException` is a separate checked-exception hierarchy from `AdminException` (they have different class hierarchies, so `catch` blocks need to be separated)
- `AccountPasswordAdapter#decrypt()` returns null when `canDecrypt()` is false (irreversible, i.e., hashed). If your implementation assumes decryption is possible, check `canDecrypt()` beforehand

## Pattern 4: Account Locking / Unlocking

Setting a non-null value on `AccountInfo#setLockDate(Date)` locks the account; setting null unlocks it.

```java
package jp.co.example.foo.service;

import java.util.Date;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountLockException;

/**
 * Provides account lock control processing.
 */
public class AccountLockService {

    /**
     * Locks the account.<br>
     * Sets the current date/time on {@link AccountInfo#setLockDate(Date)} to put it into a locked state.
     *
     * @param userCd User code
     * @throws AccountLockException If locking the account fails
     */
    public void lock(final String userCd) throws AccountLockException {
        updateLockDate(userCd, new Date());
    }

    /**
     * Unlocks the account.<br>
     * Sets null on {@link AccountInfo#setLockDate(Date)} to put it into an unlocked state.
     *
     * @param userCd User code
     * @throws AccountLockException If unlocking the account fails
     */
    public void unlock(final String userCd) throws AccountLockException {
        updateLockDate(userCd, null);
    }

    private void updateLockDate(final String userCd, final Date lockDate) throws AccountLockException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
            if (accountInfo == null) {
                throw new AccountLockException("Account information does not exist: userCd=" + userCd);
            }

            accountInfo.setLockDate(lockDate);
            accountInfoManager.updateAccountInfo(accountInfo);
        } catch (final AdminException e) {
            throw new AccountLockException("Failed to change the account's lock state: userCd=" + userCd, e);
        }
    }
}
```

- Determine locked status via `getLockDate() != null`
- When implementing automatic locking based on the login failure count (`loginFailureCount`), follow the same flow: `getAccountInfo()` → change fields → `updateAccountInfo()`

## Pattern 5: Getting/Setting Account Attributes

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountAttributeException;

/**
 * Provides processing for getting and setting account attributes.
 */
public class AccountAttributeService {

    /** The account attribute name used to store the employee number. */
    private static final String ATTR_EMPLOYEE_NUMBER = "employeeNumber";

    /**
     * Retrieves the account's employee number attribute.
     *
     * @param userCd User code
     * @return The employee number. Null if the attribute does not exist
     * @throws AccountAttributeException If fetching the attribute fails
     */
    public String getEmployeeNumber(final String userCd) throws AccountAttributeException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            return accountInfoManager.getAttribute(userCd, ATTR_EMPLOYEE_NUMBER);
        } catch (final AdminException e) {
            throw new AccountAttributeException("Failed to fetch the account attribute: userCd=" + userCd, e);
        }
    }

    /**
     * Sets the account's employee number attribute.<br>
     * None of userCd, the attribute name, or the attribute value may be null or an empty string
     * (it is updated if it exists, or created if it does not).
     *
     * @param userCd User code
     * @param employeeNumber Employee number
     * @throws AccountAttributeException If setting the attribute fails
     */
    public void setEmployeeNumber(final String userCd, final String employeeNumber) throws AccountAttributeException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            accountInfoManager.setAttribute(userCd, ATTR_EMPLOYEE_NUMBER, employeeNumber);
        } catch (final AdminException e) {
            throw new AccountAttributeException("Failed to set the account attribute: userCd=" + userCd, e);
        }
    }
}
```

## Pattern 6: Assigning a Role to a User and Retrieving the List of Valid Roles

Covers only role "assignment" via `addAccountRoleInfo()`. Operating on role definitions themselves (new registration, hierarchy, categories) is out of scope (use `java-im-role-usage` instead).

```java
package jp.co.example.foo.service;

import java.util.Date;
import java.util.List;

import jp.co.intra_mart.foundation.admin.account.AccountInfoManager;
import jp.co.intra_mart.foundation.admin.account.model.AccountRoleInfo;
import jp.co.intra_mart.foundation.admin.exception.AdminException;

import jp.co.example.foo.exception.AccountRoleAssignmentException;

/**
 * Provides processing for assigning roles to users.<br>
 * Operating on role definitions themselves (new registration, hierarchy, categories) is out of scope.
 * Use a separate skill (java-im-role-usage) for operating on role definitions.
 */
public class AccountRoleAssignmentService {

    /**
     * Assigns a role to a user.<br>
     * The valid period is evaluated as "start date &lt;= evaluation date &lt; end date." Setting the end date
     * to null resets it to the system's maximum date.
     *
     * @param userCd User code
     * @param roleId Role ID (the role definition must already exist)
     * @param validStartDate The role's valid start date
     * @param validEndDate The role's valid end date (pass null to make it indefinite, which resets it to the system's maximum date)
     * @throws AccountRoleAssignmentException If assigning the role fails
     */
    public void assignRole(final String userCd, final String roleId, final Date validStartDate, final Date validEndDate)
            throws AccountRoleAssignmentException {
        final AccountRoleInfo accountRoleInfo = new AccountRoleInfo(roleId);
        accountRoleInfo.setRoleValidStartDate(validStartDate);
        accountRoleInfo.setRoleValidEndDate(validEndDate);

        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            accountInfoManager.addAccountRoleInfo(userCd, accountRoleInfo);
        } catch (final AdminException e) {
            throw new AccountRoleAssignmentException("Failed to assign the role: userCd=" + userCd + ", roleId=" + roleId, e);
        }
    }

    /**
     * Retrieves the list of valid role IDs directly assigned to a user.<br>
     * Sub-roles (child roles) are not included. Only direct assignments valid as of the given date are covered.
     *
     * @param userCd User code
     * @param date The evaluation date/time
     * @return The list of valid role IDs (direct assignments only)
     * @throws AccountRoleAssignmentException If fetching the role ID list fails
     */
    public List<String> getDirectRoleIds(final String userCd, final Date date) throws AccountRoleAssignmentException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            return accountInfoManager.getAccountRoleIds(userCd, date);
        } catch (final AdminException e) {
            throw new AccountRoleAssignmentException("Failed to fetch the role ID list: userCd=" + userCd, e);
        }
    }

    /**
     * Recursively retrieves the list of valid role IDs a user holds, including sub-roles (child roles).<br>
     * The difference from {@link #getDirectRoleIds(String, Date)} is that sub-roles beneath directly assigned
     * roles are also included in the result.
     *
     * @param userCd User code
     * @param date The evaluation date/time
     * @return The list of valid role IDs, including sub-roles
     * @throws AccountRoleAssignmentException If fetching the role ID list fails
     */
    public List<String> getAllRoleIdsRecursively(final String userCd, final Date date) throws AccountRoleAssignmentException {
        final AccountInfoManager accountInfoManager = new AccountInfoManager();
        try {
            return accountInfoManager.getAccountRoleIdsRecursively(userCd, date);
        } catch (final AdminException e) {
            throw new AccountRoleAssignmentException("Failed to fetch the role ID list: userCd=" + userCd, e);
        }
    }
}
```

- The difference between `getDirectRoleIds()` (internally calls `getAccountRoleIds(userCd, date)`) and `getAllRoleIdsRecursively()` (internally calls `getAccountRoleIdsRecursively(userCd, date)`) is whether sub-roles are included. Use the recursive version when you need to determine the user's effective set of held roles, such as for permission checks
- In the opposite direction — looking up assigned users from a role ID rather than roles from a user code — `getUserCdsByAccountRoleId()` (direct match only) and `getUserCdsByRoleId()` (accounts for hierarchy and valid period) behave differently. See the Notes section of `SKILL.md` for how to choose between them

## Anti-Patterns (Avoid These)

```java
// NG: Not accounting for password hashing, comparing AccountInfo#getPassword() directly for login checks
final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
if (password.equals(accountInfo.getPassword())) {
    // When the password storage method is hashing, getPassword() always returns null,
    // so this either throws a NullPointerException or is always judged as not matching
}

// NG: Instantiating new AccountInfo(userCd) each time instead of using getAccountInfo(), then passing it to updateAccountInfo()
final AccountInfo accountInfo = new AccountInfo(userCd);
accountInfo.setNotes(notes);
accountInfoManager.updateAccountInfo(accountInfo);
// Fields that were not fetched (locale, time zone, lock state, etc.) get unintentionally overwritten with initial values

// NG: Unintentionally overwriting the password via updateAccountInfo()
final AccountInfo accountInfo = accountInfoManager.getAccountInfo(userCd);
accountInfo.setPassword(""); // Setting an empty string (which is not null) causes the password to be updated to an empty string
accountInfo.setNotes(notes);
accountInfoManager.updateAccountInfo(accountInfo);

// NG: Swallowing AdminException / PasswordException
try {
    accountInfoManager.updateAccountInfo(accountInfo);
} catch (final AdminException e) {
    // Do nothing (processing continues with the cause unknown)
}

// NG: Manually computing a far-future date for the role's valid end date, intending it to mean "indefinite"
accountRoleInfo.setRoleValidEndDate(new Date(Long.MAX_VALUE));
// Setting null resets it to the system's maximum date automatically, so manual computation is unnecessary
// and may be treated as an invalid date

// NG: Confusing direct-match search with hierarchy-aware search
accountInfoManager.getUserCdsByAccountRoleId(parentRoleId);
// getUserCdsByAccountRoleId() is a direct match only and does not traverse the role hierarchy.
// Searching for holders of a child role by supplying a parent role ID may return an empty result.
// Use getUserCdsByRoleId(roleId, date) instead when hierarchy needs to be accounted for

// NG: Using the @Deprecated isUpdate(Date) to determine whether an update occurred
if (accountInfoManager.isUpdate(someDate)) {
    // As of 8.0.4 and later this always returns true, so it has no meaning as a check
}
```
