# Role API Reference (Java Version)

Based on the actual class definitions in the intra-mart Accel Platform core source (`im_admin_base` module). Do not supplement methods from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.foundation.admin.role
└── RoleInfoManager             … Public API. Provides role creation, update, deletion, hierarchy management, category management, and search

jp.co.intra_mart.foundation.admin.role.model
├── RoleInfo                    … Role information model (Serializable)
└── RoleInfoListItem            … The return type of searchRoleInfosByCategoryAndRoleName (Serializable, since 8.0.37)

jp.co.intra_mart.foundation.admin.exception
└── AdminException              … The checked exception thrown by every RoleInfoManager method (a subclass of FoundationException)
```

## The `RoleInfoManager` Class

```java
package jp.co.intra_mart.foundation.admin.role;

public class RoleInfoManager {

    /**
     * Creates an instance.
     */
    public RoleInfoManager();

    /**
     * Registers a new role.
     * @param roleInfo the role information to register
     * @throws AdminException if registration fails
     */
    public void addRoleInfo(final RoleInfo roleInfo) throws AdminException;

    /**
     * Adds a sub-role to a role (regenerates the role summary).
     * @param roleId the parent role ID
     * @param subRoleId the sub-role ID to add
     * @throws AdminException if adding fails
     */
    public void addSubRoleInfo(final String roleId, final String subRoleId) throws AdminException;

    /**
     * Determines whether the held roles (with nesting expanded) contain any of the specified set of roles.
     * @param nestRoleIds the array of role IDs to check, including nested roles
     * @param roleIds the array of role IDs to check by direct match only
     * @return true if nestRoleIds contains any of roleIds
     * @throws AdminException if the determination fails
     */
    public boolean certify(final String[] nestRoleIds, final String[] roleIds) throws AdminException;

    /**
     * Determines whether the specified role ID exists.
     * @param roleId the role ID
     * @return true if it exists
     * @throws AdminException if the determination fails
     */
    public boolean contains(final String roleId) throws AdminException;

    /**
     * Determines whether the specified category exists.
     * @param category the category
     * @return true if it exists
     * @throws AdminException if the determination fails
     */
    public boolean containsCategory(final String category) throws AdminException;

    /**
     * Determines whether the specified role name exists among all roles.
     * @param roleName the role name
     * @return true if it exists
     * @throws AdminException if the determination fails
     */
    public boolean containsRoleName(final String roleName) throws AdminException;

    /**
     * Determines whether the specified role name exists, excluding the role specified by the second argument.
     * @param roleName the role name
     * @param exceptRoleId the role ID to exclude from the determination
     * @return true if it exists
     * @throws AdminException if the determination fails
     */
    public boolean containsRoleName(final String roleName, final String exceptRoleId) throws AdminException;

    /**
     * Deletes all categories.
     * @throws AdminException if deletion fails
     */
    public void deleteCategories() throws AdminException;

    /**
     * Deletes the specified category.
     * @param category the category
     * @throws AdminException if deletion fails
     */
    public void deleteCategory(final String category) throws AdminException;

    /**
     * Deletes the specified role.
     * @param roleId the role ID
     * @throws AdminException if deletion fails
     */
    public void deleteRoleInfo(final String roleId) throws AdminException;

    /**
     * Deletes all roles.
     * @throws AdminException if deletion fails
     */
    public void deleteRoleInfos() throws AdminException;

    /**
     * Deletes the specified sub-role from a role (regenerates the role summary).
     * @param roleId the parent role ID
     * @param subRoleId the sub-role ID to delete
     * @throws AdminException if deletion fails
     */
    public void deleteSubRoleInfo(final String roleId, final String subRoleId) throws AdminException;

    /**
     * Deletes all sub-roles belonging to a role (regenerates the role summary).
     * @param roleId the parent role ID
     * @throws AdminException if deletion fails
     */
    public void deleteSubRoleInfos(final String roleId) throws AdminException;

    /**
     * Gets all parent role IDs of the specified role, including nested parents.
     * @param roleId the role ID
     * @return the list of all parent role IDs
     * @throws AdminException if the retrieval fails
     */
    public List<String> getAllParentRoleIds(final String roleId) throws AdminException;

    /**
     * Gets all sub-role IDs of the specified role, including nested sub-roles.
     * @param roleId the role ID
     * @return the list of all sub-role IDs
     * @throws AdminException if the retrieval fails
     */
    public List<String> getAllSubRoleIds(final String roleId) throws AdminException;

    /**
     * Gets all categories, with duplicates removed.
     * @return the list of categories
     * @throws AdminException if the retrieval fails
     */
    public List<String> getCategories() throws AdminException;

    /**
     * Gets the number of roles belonging to the specified category.
     * @param category the category
     * @return the number of roles
     * @throws AdminException if the retrieval fails
     * @deprecated Use {@link #getRoleInfoCountByCategory(String)} instead.
     */
    @Deprecated
    public int getCategoryCount(final String category) throws AdminException;

    /**
     * Gets only the parent role IDs one level up (does not expand nesting).
     * @param roleId the role ID
     * @return the list of parent role IDs one level up
     * @throws AdminException if the retrieval fails
     */
    public List<String> getParentRoleIds(final String roleId) throws AdminException;

    /**
     * Gets all role IDs.
     * @return the list of role IDs
     * @throws AdminException if the retrieval fails
     */
    public List<String> getRoleIds() throws AdminException;

    /**
     * Gets the role information for the specified role ID.
     * @param roleId the role ID
     * @return the role information; null if the role does not exist (no exception is thrown)
     * @throws AdminException if the retrieval processing itself fails
     */
    public RoleInfo getRoleInfo(final String roleId) throws AdminException;

    /**
     * Gets the total number of roles.
     * @return the role count
     * @throws AdminException if the retrieval fails
     */
    public int getRoleInfoCount() throws AdminException;

    /**
     * Gets the number of roles belonging to the specified category.
     * @param category the category
     * @return the number of roles
     * @throws AdminException if the retrieval fails
     */
    public int getRoleInfoCountByCategory(final String category) throws AdminException;

    /**
     * Gets all role information.
     * @return the list of role information
     * @throws AdminException if the retrieval fails
     */
    public List<RoleInfo> getRoleInfos() throws AdminException;

    /**
     * Gets the role information belonging to the specified category.
     * @param category the category
     * @return the list of role information
     * @throws AdminException if the retrieval fails
     */
    public List<RoleInfo> getRoleInfosByCategory(final String category) throws AdminException;

    /**
     * Gets the role information for the specified set of role IDs.
     * @param roleIds the role IDs (varargs)
     * @return the list of role information
     * @throws AdminException if the retrieval fails
     */
    public List<RoleInfo> getRoleInfosByRoleIds(final String... roleIds) throws AdminException;

    /**
     * Gets only the sub-role IDs one level down (does not expand nesting).
     * @param roleId the role ID
     * @return the list of sub-role IDs one level down
     * @throws AdminException if the retrieval fails
     */
    public List<String> getSubRoleIds(final String roleId) throws AdminException;

    /**
     * Determines whether there has been an update since the specified date/time.
     * @param date the reference date/time for the determination
     * @return always true
     * @throws AdminException if the determination fails
     * @deprecated Always returns true, so it does not function as a meaningful means of determination.
     */
    @Deprecated
    public boolean isUpdate(final Date date) throws AdminException;

    /**
     * Bulk-updates the category name of every role belonging to the specified category (a destructive operation).
     * @param oldCategory the category name before the change
     * @param newCategory the category name after the change
     * @throws AdminException if the update fails
     */
    public void moveCategory(final String oldCategory, final String newCategory) throws AdminException;

    /**
     * Performs a wildcard search on role ID (* matches zero or more characters, ? matches one character).
     * @param roleId the search condition (wildcards allowed)
     * @return the list of matching role information
     * @throws AdminException if the search fails
     */
    public List<RoleInfo> searchRoleInfosByRoleId(final String roleId) throws AdminException;

    /**
     * Performs a wildcard search on role name (* matches zero or more characters, ? matches one character).
     * @param roleName the search condition (wildcards allowed)
     * @return the list of matching role information
     * @throws AdminException if the search fails
     */
    public List<RoleInfo> searchRoleInfosByRoleName(final String roleName) throws AdminException;

    /**
     * Updates role information.
     * @param roleInfo the role information to update
     * @throws AdminException if the update fails
     */
    public void updateRoleInfo(final RoleInfo roleInfo) throws AdminException;

    /**
     * Gets the number of roles matching the specified category and role name conditions.
     * @param category the category (search condition)
     * @param roleName the role name (search condition)
     * @param locale the locale used to resolve the display name
     * @return the number of matching roles
     * @throws AdminException if the retrieval fails
     * @since 8.0.37
     */
    public int getRoleInfoCountByCategoryAndRoleName(final String category, final String roleName, final Locale locale) throws AdminException;

    /**
     * Searches role information by the specified category and role name conditions, applying pagination and sorting.
     * @param category the category (search condition)
     * @param roleName the role name (search condition)
     * @param locale the locale used to resolve the display name
     * @param limit the maximum number of items to retrieve
     * @param offset the starting position of retrieval (0-based)
     * @param sortIndex the column to sort by (one of category / role_name / display_name)
     * @param sortOrder the sort order (ASC / DESC)
     * @return the list of matching role information list items
     * @throws AdminException if the search fails
     * @since 8.0.37
     */
    public List<RoleInfoListItem> searchRoleInfosByCategoryAndRoleName(final String category, final String roleName,
            final Locale locale, final int limit, final int offset, final String sortIndex, final String sortOrder) throws AdminException;

    /**
     * Adds a sub-role without regenerating the role summary (a lightweight version for performance optimization,
     * such as large-scale bulk updates). When using this method, the caller must separately call
     * {@link #regenerateRoleSummary()}.
     * @param roleId the parent role ID
     * @param subRoleId the sub-role ID to add
     * @throws AdminException if adding fails
     * @since 8.0.37
     */
    public void addSubRoleInfoWithoutCreatingSummary(final String roleId, final String subRoleId) throws AdminException;

    /**
     * Deletes a sub-role without regenerating the role summary. When using this method, the caller must separately
     * call {@link #regenerateRoleSummary()}.
     * @param roleId the parent role ID
     * @param subRoleId the sub-role ID to delete
     * @throws AdminException if deletion fails
     * @since 8.0.37
     */
    public void deleteSubRoleInfoWithoutCreatingSummary(final String roleId, final String subRoleId) throws AdminException;

    /**
     * Deletes all sub-roles belonging to a role without regenerating the role summary. When using this method,
     * the caller must separately call {@link #regenerateRoleSummary()}.
     * @param roleId the parent role ID
     * @throws AdminException if deletion fails
     * @since 8.0.37
     */
    public void deleteSubRoleInfosWithoutCreatingSummary(final String roleId) throws AdminException;

    /**
     * Regenerates the role summary for all roles.
     * After updating the hierarchy with the {@code WithoutCreatingSummary} methods, always call this once
     * to restore consistency in the role summary.
     * @throws AdminException if regeneration fails
     * @since 8.0.37
     */
    public void regenerateRoleSummary() throws AdminException;
}
```

- A regular, non-`final` class (can be extended)
- Every method declares `AdminException` (a checked exception). Either propagate it with `throws`, or `catch` it at the call site and wrap it into a business exception
- Note that only `getRoleInfo(roleId)` is designed to return **`null`, not an exception**, when the target does not exist (the other `get`/`search` methods return an empty list when there is no match)

## The `RoleInfo` Model

```java
package jp.co.intra_mart.foundation.admin.role.model;

import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class RoleInfo implements Serializable {

    /** The category */
    private String category;

    /** The display name (key: locale, value: display name) */
    private final Map<Locale, String> displayName = new HashMap<Locale, String>();

    /** Notes */
    private String notes;

    /** The role ID */
    private String roleId;

    /** The role name */
    private String roleName;

    /**
     * Creates an instance. The role ID is auto-numbered via Identifier.
     * @throws IOException if auto-numbering fails
     */
    public RoleInfo() throws IOException;

    /**
     * Creates an instance with the specified role ID. The role name will default to the same value as the role ID.
     * @param roleId the role ID
     */
    public RoleInfo(final String roleId);

    /**
     * Creates an instance with the specified role ID and role name.
     * @param roleId the role ID
     * @param roleName the role name
     */
    public RoleInfo(final String roleId, final String roleName);

    // Standard getters/setters for category / notes / roleId / roleName
    // displayName has a getter that returns the Map<Locale, String> directly, and a setter that sets it per locale

    /**
     * Determines equality by the match of the role ID.
     * @param object the object to compare against
     * @return true if the role IDs match
     */
    @Override
    public boolean equals(final Object object);
}
```

- How to choose among the three constructors:
  - `RoleInfo()`: use when you want the role ID auto-numbered via `Identifier`. This is the only constructor that **throws `IOException`** (a checked exception)
  - `RoleInfo(roleId)`: use when you want to explicitly specify the role ID. The role name is initialized to the same value as the role ID (it can be overwritten separately with `setRoleName()`)
  - `RoleInfo(roleId, roleName)`: use when you want to explicitly specify both the role ID and the role name
  - The two constructors that take arguments never throw
- Note that `displayName` is a `Map<Locale, String>`, not a single `String`. It can hold a different display name for each locale
- `equals()` is determined solely by the match of the role ID (no other field is included in the comparison)

## The `RoleInfoListItem` Model

The return type of `searchRoleInfosByCategoryAndRoleName`. Its field layout corresponds to the SSJS version's d.ts (`d.ts/tenant/object/im-ssjs-role-info-list-item.d.ts`).

```java
package jp.co.intra_mart.foundation.admin.role.model;

import java.io.Serializable;

public class RoleInfoListItem implements Serializable {

    /** The category */
    private String category;

    /** The display name (a single resolved string, for the locale specified when the search was called) */
    private String displayName;

    /** The role ID */
    private String roleId;

    /** The role name */
    private String roleName;

    // Standard getters/setters for category / displayName / roleId / roleName
}
```

- The key difference from `RoleInfo`'s `displayName` (a `Map<Locale, String>`) is that `RoleInfoListItem`'s `displayName` is a **single, already-resolved `String`**, resolved using the `Locale` specified when calling `searchRoleInfosByCategoryAndRoleName`. It represents data already formatted for listing display
- This is a read-only model dedicated to search/pagination; there is no update method on `RoleInfoManager` that takes this object directly (use `RoleInfo` for updates)

## `AdminException`

```java
package jp.co.intra_mart.foundation.admin.exception;

public class AdminException extends FoundationException {
    // The checked exception thrown by every RoleInfoManager method
}
```

- A checked exception that extends `jp.co.intra_mart.foundation.exception.FoundationException`
- Every method of `RoleInfoManager` (except its constructor) declares this exception
- The caller should either propagate it with `throws` or wrap it into a business exception and `catch` it. Swallowing it (an empty `catch` block) is prohibited (see the anti-patterns in `assets/role-basic-usage.md`)
