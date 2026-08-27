# Account API Reference (Java Version)

Based on the actual class definitions in the intra-mart Accel Platform core source (`im_admin_base` module). Do not supplement methods from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.foundation.admin.account
└── AccountInfoManager             … Public API. final class

jp.co.intra_mart.foundation.admin.account.model
├── AccountInfo                    … Account information model (Serializable)
└── AccountRoleInfo                … Account role assignment model (Serializable)

jp.co.intra_mart.foundation.admin.account.password
└── AccountPasswordAdapter         … Password verification, encryption, and decryption

jp.co.intra_mart.foundation.admin.exception
├── AdminException                 … Checked exception thrown by all AccountInfoManager methods
└── PasswordException              … Checked exception thrown by all AccountPasswordAdapter methods (a separate hierarchy from AdminException)
```

## `AccountInfoManager` Class

```java
package jp.co.intra_mart.foundation.admin.account;

public final class AccountInfoManager {

    /** The attribute name (numeric format) stored as an account attribute. @since 8.0.15 */
    public static final String ATTR_DECIMAL_FORMAT = "im_i18n_decimal_format_id";

    public AccountInfoManager() {}

    /** Registers new account information. */
    public void addAccountInfo(final AccountInfo accountInfo) throws AdminException;

    /** Assigns a role to a user. */
    public void addAccountRoleInfo(final String userCd, final AccountRoleInfo accountRoleInfo) throws AdminException;

    /** Determines whether an account with the given user code exists. */
    public boolean contains(final String userCd) throws AdminException;

    /** Deletes account information. */
    public void deleteAccountInfo(final String userCd) throws AdminException;

    /** Deletes all account information. */
    public void deleteAccountInfos() throws AdminException;

    /** Removes the assignment of a specific role from a user. */
    public void deleteAccountRoleInfo(final String userCd, final String roleId) throws AdminException;

    /** Removes all role assignments from a user. */
    public void deleteAccountRoleInfos(final String userCd) throws AdminException;

    /** Deletes an account attribute. */
    public void deleteAttribute(final String userCd, final String name) throws AdminException;

    /** Deletes all attributes of an account. */
    public void deleteAttributes(final String userCd) throws AdminException;

    /**
     * Retrieves account information.<br>
     * When the password storage method is "hashing," the returned {@link AccountInfo}'s password is null.
     */
    public AccountInfo getAccountInfo(final String userCd) throws AdminException;

    /** Retrieves the count of account information records. */
    public int getAccountInfoCount() throws AdminException;

    /** Retrieves the list of all account information. Returns an empty list if there is no data. */
    public List<AccountInfo> getAccountInfos() throws AdminException;

    /** Retrieves a list of account information with a start position and count. */
    public List<AccountInfo> getAccountInfos(final int start, final int count) throws AdminException;

    /** Retrieves a list of account information for the given user codes. */
    public List<AccountInfo> getAccountInfosByUserCds(final String... userCds) throws AdminException;

    /**
     * Retrieves the list of role IDs directly assigned to a user.<br>
     * No valid-period filter is applied. Only direct assignments are covered; sub-roles (child roles) are not included.
     */
    public List<String> getAccountRoleIds(final String userCd) throws AdminException;

    /**
     * Retrieves the list of role IDs directly assigned to a user that are valid as of the given date.<br>
     * Validity is judged as "role valid start date &lt;= date &lt; role valid end date." Sub-roles (child roles) are not included.
     */
    public List<String> getAccountRoleIds(final String userCd, final Date date) throws AdminException;

    /**
     * Recursively retrieves the list of valid role IDs a user holds as of the given date, including sub-roles (child roles).<br>
     * Validity is judged the same way as {@link #getAccountRoleIds(String, Date)}.
     */
    public List<String> getAccountRoleIdsRecursively(final String userCd, final Date date) throws AdminException;

    /** Retrieves the list of role assignment info ({@link AccountRoleInfo}) directly assigned to a user. */
    public List<AccountRoleInfo> getAccountRoleInfos(final String userCd) throws AdminException;

    /** Retrieves the list of role assignment info ({@link AccountRoleInfo}) valid as of the given date. */
    public List<AccountRoleInfo> getAccountRoleInfos(final String userCd, final Date date) throws AdminException;

    /** Retrieves an account attribute. Returns null if the data does not exist. */
    public String getAttribute(final String userCd, final String name) throws AdminException;

    /** Retrieves an account attribute. Returns the default value (third argument) if the data does not exist. */
    public String getAttribute(final String userCd, final String name, final String def) throws AdminException;

    /** Retrieves the list of attribute names held by a user. */
    public List<String> getAttributeNames(final String userCd) throws AdminException;

    /** Retrieves the list of all user codes. */
    public List<String> getUserCds() throws AdminException;

    /**
     * Retrieves the list of user codes to which the given role ID is directly assigned.<br>
     * No role hierarchy check is performed (direct match only).
     */
    public List<String> getUserCdsByAccountRoleId(final String roleId) throws AdminException;

    /** Retrieves the list of user codes with the given attribute name/value combination. */
    public List<String> getUserCdsByAttribute(final String key, final String value) throws AdminException;

    /**
     * Retrieves the list of user codes holding an account-granted role that is valid as of the given date,
     * traversing up the parent role hierarchy.<br>
     * This behaves differently from {@link #getUserCdsByAccountRoleId(String)} (direct match only).
     */
    public List<String> getUserCdsByRoleId(final String roleId, final Date date) throws AdminException;

    /**
     * @deprecated Always returns true as of 8.0.4 and later. Effectively meaningless.
     */
    @Deprecated
    public boolean isUpdate(final Date date) throws AdminException;

    /**
     * Searches for account information using a wildcard search on the user code.<br>
     * Wildcards: {@code *} matches zero or more characters, {@code ?} matches one character. When the password
     * storage method is "hashing," the returned password is null.
     */
    public List<AccountInfo> searchAccountInfos(final String userCd) throws AdminException;

    /** Performs a wildcard search on the user code with a start position and count. */
    public List<AccountInfo> searchAccountInfos(final String userCd, final int start, final int count) throws AdminException;

    /**
     * Sets an account attribute. Updates it if it already exists, or creates it if it does not.<br>
     * None of userCd, name, or value may be null or an empty string.
     */
    public void setAttribute(final String userCd, final String name, final String value) throws AdminException;

    /**
     * Updates account information.<br>
     * When {@link AccountInfo#getPassword()} is null, only the fields other than the password are updated.
     */
    public void updateAccountInfo(final AccountInfo accountInfo) throws AdminException;

    /** Updates a user's already-assigned role information (valid period, etc.). */
    public void updateAccountRoleInfo(final String userCd, final AccountRoleInfo accountRoleInfo) throws AdminException;
}
```

## `AccountInfo` Model

```java
package jp.co.intra_mart.foundation.admin.account.model;

public class AccountInfo implements Serializable {

    private Map<String, String> dateTimeFormats; // List of date display formats
    private String encoding;
    private String calendarId;
    private int firstDayOfWeek = -1;              // First day of the week
    private Locale locale;                        // java.util.Locale type (not a String)
    private Date lockDate;                        // Account lock date. null when not locked
    private int loginFailureCount;
    private String notes;
    private String password;
    private Map<String, String> themeIds;          // Client type ID → theme ID
    private String timeZoneId;
    private String userCd;
    private Date validEndDate;
    private Date validStartDate;

    /**
     * Creates an instance.<br>
     * userCd is required. The valid start/end dates are automatically initialized to the system's minimum/maximum date.
     * @param userCd User code
     */
    public AccountInfo(final String userCd);

    public String getUserCd();
    public void setUserCd(final String userCd);

    public String getPassword();
    /**
     * Sets the password.<br>
     * Passing an instance with a null password to
     * {@link jp.co.intra_mart.foundation.admin.account.AccountInfoManager#updateAccountInfo(AccountInfo)} updates
     * only the fields other than the password.
     */
    public void setPassword(final String password);

    public Locale getLocale();
    /** Sets the locale. Handled as a java.util.Locale type, not a String. */
    public void setLocale(final Locale locale);

    public String getTimeZoneId();
    public void setTimeZoneId(final String timeZoneId);

    public String getCalendarId();
    public void setCalendarId(final String calendarId);

    public int getFirstDayOfWeek();
    public void setFirstDayOfWeek(final int firstDayOfWeek);

    public Map<String, String> getDateTimeFormats();
    public void setDateTimeFormats(final Map<String, String> dateTimeFormats);

    public Map<String, String> getThemeIds();
    public void setThemeIds(final Map<String, String> themeIds);

    public String getEncoding();
    public void setEncoding(final String encoding);

    public Date getLockDate();
    /**
     * Sets the lock date.<br>
     * A non-null value locks the account; null unlocks it.
     */
    public void setLockDate(final Date lockDate);

    public int getLoginFailureCount();
    public void setLoginFailureCount(final int loginFailureCount);

    public String getNotes();
    public void setNotes(final String notes);

    public Date getValidStartDate();
    public void setValidStartDate(final Date validStartDate);

    public Date getValidEndDate();
    public void setValidEndDate(final Date validEndDate);
}
```

- Standard getters/setters exist for each field listed above
- Locked status is determined via `getLockDate() != null` (assume there is no dedicated `isLocked()`-style helper method; do not call one unless its existence is confirmed)

## `AccountRoleInfo` Model

```java
package jp.co.intra_mart.foundation.admin.account.model;

public class AccountRoleInfo implements Serializable {

    private String roleId;
    private Date roleValidEndDate;
    private Date roleValidStartDate;

    /**
     * Creates an instance.<br>
     * roleId is required. The valid start date is automatically initialized to the system's minimum date, and
     * the valid end date to the system's maximum date.
     * @param roleId Role ID
     */
    public AccountRoleInfo(final String roleId);

    public String getRoleId();

    public Date getRoleValidStartDate();
    public void setRoleValidStartDate(final Date roleValidStartDate);

    public Date getRoleValidEndDate();
    /**
     * Sets the role's valid end date.<br>
     * Setting null resets it to the system's maximum date. Only the date portion is retained (time is 00:00:00),
     * and it is valid up through the day before the set date (evaluation formula: start date &lt;= evaluation date &lt; end date).
     */
    public void setRoleValidEndDate(final Date roleValidEndDate);
}
```

## `AccountPasswordAdapter` Class

```java
package jp.co.intra_mart.foundation.admin.account.password;

public class AccountPasswordAdapter {

    public AccountPasswordAdapter();

    /** Determines whether the password can be decrypted (i.e., the storage method is reversible encryption). */
    public boolean canDecrypt() throws PasswordException;

    /** Verifies whether the entered password matches the stored password for the given user. */
    public boolean collate(final String userCd, final String password) throws PasswordException;

    /**
     * Decrypts the password.<br>
     * Returns null when {@link #canDecrypt()} is false (irreversible, i.e., stored hashed).
     */
    public String decrypt(final String userCd, final String password) throws PasswordException;

    /** Encrypts (or hashes) the password according to the storage method. */
    public String encrypt(final String userCd, final String password) throws PasswordException;
}
```

## Exception Handling

```java
package jp.co.intra_mart.foundation.admin.exception;

/** The checked exception thrown by all methods of AccountInfoManager. */
public class AdminException extends FoundationException {
    public AdminException(final String message);
    public AdminException(final String message, final Throwable cause);
    public AdminException(final Throwable cause);
}

/**
 * The checked exception thrown by all methods of AccountPasswordAdapter.<br>
 * This is a separate exception hierarchy from AdminException, so code that handles both must use separate catch blocks.
 */
public class PasswordException extends Exception {
    public PasswordException(final String message);
    public PasswordException(final String message, final Throwable cause);
    public PasswordException(final Throwable cause);
}
```

- All methods of `AccountInfoManager` throw `AdminException` (a checked exception). Callers must either `try`/`catch` it or declare `throws` to propagate it to the caller
- All methods of `AccountPasswordAdapter` throw `PasswordException` (a checked exception). Since it is a separate exception hierarchy from `AdminException`, using both APIs within the same method requires either two separate `catch` blocks, or catching them together via their common parent class (`Exception`)
- Both classes have the standard constructors (message only / message + cause / cause only)
