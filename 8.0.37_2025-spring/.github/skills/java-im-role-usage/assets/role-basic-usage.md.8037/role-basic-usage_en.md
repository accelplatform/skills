# Role API Basic Usage Patterns (Java Version)

For the signature and internal behavior of `RoleInfoManager`, see `reference/role-api-reference.md`. This document shows the typical call patterns.

## Pattern 1: Registering a New Role

The basic form: explicitly specify the role ID and role name with the `RoleInfo(roleId, roleName)` constructor, then register with `addRoleInfo()`.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;
import jp.co.intra_mart.foundation.admin.role.model.RoleInfo;

import jp.co.example.foo.exception.RoleRegistrationException;

/**
 * Provides role registration processing.
 */
public class RoleRegistrationService {

    /**
     * Registers a new role.
     * @param roleId the role ID
     * @param roleName the role name
     * @param category the category
     * @throws RoleRegistrationException if registration fails
     */
    public void registerRole(final String roleId, final String roleName, final String category) throws RoleRegistrationException {
        final RoleInfo roleInfo = new RoleInfo(roleId, roleName);
        roleInfo.setCategory(category);

        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            roleInfoManager.addRoleInfo(roleInfo);
        } catch (final AdminException e) {
            throw new RoleRegistrationException("ロールの登録に失敗しました: roleId=" + roleId, e);
        }
    }
}
```

- `RoleInfo(roleId, roleName)` never throws, so it may be created outside the `try`
- `addRoleInfo()` declares `AdminException` (checked), so wrap it into a business exception or propagate it with `throws`
- If you want the role ID to be auto-numbered via `Identifier`, use `RoleInfo()` (no-argument). Note that it throws `IOException`, requiring an additional `try`/`catch` (as shown in the compound exception handling of Pattern 5)

## Pattern 2: Getting and Updating a Role (with a null Check)

Because `getRoleInfo()` returns `null`, not an exception, when the role does not exist, always perform a null check before updating.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;
import jp.co.intra_mart.foundation.admin.role.model.RoleInfo;

import jp.co.example.foo.exception.RoleNotFoundException;
import jp.co.example.foo.exception.RoleUpdateException;

/**
 * Provides role update processing.
 */
public class RoleUpdateService {

    /**
     * Updates a role's display name.
     * @param roleId the role ID
     * @param displayName the new display name
     * @param locale the locale to set the display name for
     * @throws RoleNotFoundException if the specified role does not exist
     * @throws RoleUpdateException if the update processing fails
     */
    public void updateDisplayName(final String roleId, final String displayName, final Locale locale)
            throws RoleNotFoundException, RoleUpdateException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();

        final RoleInfo roleInfo;
        try {
            roleInfo = roleInfoManager.getRoleInfo(roleId);
        } catch (final AdminException e) {
            throw new RoleUpdateException("ロールの取得に失敗しました: roleId=" + roleId, e);
        }

        // getRoleInfo() returns null, not an exception, if the role does not exist
        if (roleInfo == null) {
            throw new RoleNotFoundException("指定したロールが存在しません: roleId=" + roleId);
        }

        roleInfo.getDisplayName().put(locale, displayName);

        try {
            roleInfoManager.updateRoleInfo(roleInfo);
        } catch (final AdminException e) {
            throw new RoleUpdateException("ロールの更新に失敗しました: roleId=" + roleId, e);
        }
    }
}
```

- Forgetting that `getRoleInfo()` can return `null` invites a `NullPointerException`. The caller must always perform a null check
- Since `RoleInfo`'s `displayName` is a `Map<Locale, String>`, to update only the display name for a specific locale, reflect it directly into the `Map` with `getDisplayName().put(locale, displayName)`

## Pattern 3: Building and Querying a Sub-Role Hierarchy

Build a parent-child relationship with `addSubRoleInfo()`, then see the difference between `getAllSubRoleIds()` (all levels) and `getSubRoleIds()` (one level only).

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;

import jp.co.example.foo.exception.RoleHierarchyException;

/**
 * Provides role hierarchy building and query processing.
 */
public class RoleHierarchyService {

    /**
     * Adds a sub-role to a parent role.
     * @param parentRoleId the parent role ID
     * @param subRoleId the sub-role ID
     * @throws RoleHierarchyException if adding fails
     */
    public void addSubRole(final String parentRoleId, final String subRoleId) throws RoleHierarchyException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            roleInfoManager.addSubRoleInfo(parentRoleId, subRoleId);
        } catch (final AdminException e) {
            throw new RoleHierarchyException(
                    "サブロールの追加に失敗しました: parentRoleId=" + parentRoleId + ", subRoleId=" + subRoleId, e);
        }
    }

    /**
     * Gets the list of sub-role IDs directly under the specified role (one level down).
     * @param roleId the role ID
     * @return the list of sub-role IDs one level down
     * @throws RoleHierarchyException if the retrieval fails
     */
    public List<String> findDirectSubRoleIds(final String roleId) throws RoleHierarchyException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            // Only one level down; nested sub-roles (sub-roles of sub-roles) are not included
            return roleInfoManager.getSubRoleIds(roleId);
        } catch (final AdminException e) {
            throw new RoleHierarchyException("サブロールIDの取得に失敗しました: roleId=" + roleId, e);
        }
    }

    /**
     * Gets the list of sub-role IDs across all levels belonging to the specified role.
     * @param roleId the role ID
     * @return the list of all sub-role IDs, including nested ones
     * @throws RoleHierarchyException if the retrieval fails
     */
    public List<String> findAllSubRoleIds(final String roleId) throws RoleHierarchyException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            // Gets everything, including nested sub-roles (grandchildren and below)
            return roleInfoManager.getAllSubRoleIds(roleId);
        } catch (final AdminException e) {
            throw new RoleHierarchyException("全サブロールIDの取得に失敗しました: roleId=" + roleId, e);
        }
    }
}
```

- `getSubRoleIds(roleId)` returns **only one level down** — comparable to "direct reports" in an org chart
- `getAllSubRoleIds(roleId)` recursively retrieves **all nested levels** — use this when you need to enumerate "everyone below," at any depth
- The same relationship holds between `getParentRoleIds` (one level up only) and `getAllParentRoleIds` (all levels of parents)

## Pattern 4: Role-Containment Checks Using `certify`

An example of business logic that determines whether a user's held roles (with nesting expanded) contain any of a specific set of roles.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;

import jp.co.example.foo.exception.RoleCertificationException;

/**
 * Provides role-holding check processing.
 */
public class RoleCertificationService {

    /** The role IDs treated as holding approval authority */
    private static final String[] APPROVAL_ROLE_IDS = { "role_manager", "role_director" };

    /**
     * Determines whether the roles a user holds (with nesting expanded) contain any of the approval-authority roles.
     * @param userNestRoleIds the array of role IDs the user holds (nesting-expanded; resolve this beforehand,
     *        e.g., via getAllParentRoleIds)
     * @return true if the user holds any of the approval-authority roles
     * @throws RoleCertificationException if the determination fails
     */
    public boolean hasApprovalRole(final String[] userNestRoleIds) throws RoleCertificationException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            // nestRoleIds (the first argument) is checked including nested roles.
            // roleIds (the second argument) is checked by direct match only — an asymmetric API.
            // Place the "user side" as the first argument and the "fixed set of roles being checked for" as the second.
            return roleInfoManager.certify(userNestRoleIds, APPROVAL_ROLE_IDS);
        } catch (final AdminException e) {
            throw new RoleCertificationException("ロール内包チェックに失敗しました", e);
        }
    }
}
```

- Note that `certify(nestRoleIds, roleIds)` is **asymmetric** in whether nesting is expanded between the first and second arguments. The first argument is evaluated with nesting expanded; the second is evaluated by direct match only
- Swapping the argument order produces an unintended determination, so clarify beforehand which argument gets the side that may be nesting-expanded and which gets the side that should only be a direct match

## Pattern 5: Category-Based Role Search and Pagination

An example combining total-count retrieval (`getRoleInfoCountByCategoryAndRoleName`) with a paginated search (`searchRoleInfosByCategoryAndRoleName`), aimed at a listing screen.

```java
package jp.co.example.foo.service;

import java.util.List;
import java.util.Locale;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;
import jp.co.intra_mart.foundation.admin.role.model.RoleInfoListItem;

import jp.co.example.foo.exception.RoleSearchException;
import jp.co.example.foo.model.RoleSearchResult;

/**
 * Provides search processing for the role listing screen.
 */
public class RoleSearchService {

    /** The number of items displayed per page */
    private static final int PAGE_SIZE = 20;

    /**
     * Performs a paginated search of roles by category and role name.
     * @param category the category (search condition; null or empty when unspecified)
     * @param roleName the role name (search condition; null or empty when unspecified)
     * @param pageNumber the page number (1-based)
     * @param locale the locale to use to resolve the display name
     * @return the search result containing the total count and the results for the requested page
     * @throws RoleSearchException if the search fails
     */
    public RoleSearchResult searchRoles(final String category, final String roleName, final int pageNumber, final Locale locale)
            throws RoleSearchException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        final int offset = (pageNumber - 1) * PAGE_SIZE;

        try {
            final int totalCount = roleInfoManager.getRoleInfoCountByCategoryAndRoleName(category, roleName, locale);
            final List<RoleInfoListItem> items = roleInfoManager.searchRoleInfosByCategoryAndRoleName(
                    category, roleName, locale, PAGE_SIZE, offset, "role_name", "ASC");
            return new RoleSearchResult(totalCount, items);
        } catch (final AdminException e) {
            throw new RoleSearchException("ロールの検索に失敗しました: category=" + category + ", roleName=" + roleName, e);
        }
    }
}
```

- **Call the total-count method (`getRoleInfoCountByCategoryAndRoleName`) and the search method (`searchRoleInfosByCategoryAndRoleName`) as a pair, using exactly the same search condition** (category / roleName / locale). If the conditions diverge, the total count shown on screen will not match the actual number of results displayed
- Since `offset` is 0-based, convert from the 1-based page number using the formula `(pageNumber - 1) * PAGE_SIZE`
- `sortIndex` is only valid as one of `category` / `role_name` / `display_name`. Behavior for any other value is not guaranteed, so restrict the choice to a fixed allow-list (do not pass raw user input through)

## Pattern 6: `WithoutCreatingSummary` Methods + `regenerateRoleSummary()` for Bulk Sub-Role Registration

When registering a large number of sub-roles in bulk, calling `addSubRoleInfo()` repeatedly makes the role-summary regeneration a bottleneck. Suppress the summary regeneration with the `WithoutCreatingSummary` methods and call `regenerateRoleSummary()` exactly once at the end.

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;

import jp.co.example.foo.exception.RoleBulkRegistrationException;
import jp.co.example.foo.model.SubRoleAssignment;

/**
 * Provides bulk sub-role registration processing.
 */
public class RoleBulkRegistrationService {

    /**
     * Registers a large number of sub-role assignments in bulk.<br>
     * Normally, addSubRoleInfo (the summary-auto-updating version) is the default, but this method
     * — used where performance becomes an issue for large-scale bulk updates — uses the
     * WithoutCreatingSummary methods and regenerates the role summary exactly once at the end.
     * @param assignments the list of parent role ID / sub-role ID pairs
     * @throws RoleBulkRegistrationException if the registration fails
     */
    public void bulkAddSubRoles(final List<SubRoleAssignment> assignments) throws RoleBulkRegistrationException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();

        try {
            for (final SubRoleAssignment assignment : assignments) {
                // The lightweight version that does not regenerate the role summary each time.
                // The role summary is not yet updated at this point, so do not call hierarchy-query
                // methods such as getAllSubRoleIds partway through
                roleInfoManager.addSubRoleInfoWithoutCreatingSummary(assignment.getParentRoleId(), assignment.getSubRoleId());
            }
        } catch (final AdminException e) {
            throw new RoleBulkRegistrationException("サブロールの一括登録に失敗しました", e);
        } finally {
            try {
                // When using the WithoutCreatingSummary methods, always regenerate the role summary
                // to restore consistency, regardless of success or failure
                roleInfoManager.regenerateRoleSummary();
            } catch (final AdminException e) {
                throw new RoleBulkRegistrationException("ロールサマリの再作成に失敗しました", e);
            }
        }
    }
}
```

- The `WithoutCreatingSummary` methods (8.0.37 and later) speed up large-scale bulk updates by skipping the role-summary regeneration on every call. **Default to `addSubRoleInfo`/`deleteSubRoleInfo(s)` (the summary-auto-updating versions) for ordinary sub-role additions/deletions**, and consider this pattern only when performance becomes an issue
- After calling the `WithoutCreatingSummary` methods and before calling `regenerateRoleSummary()`, the role summary is in an inconsistent state. Do not call summary-dependent search methods such as `getAllSubRoleIds`/`getAllParentRoleIds`/`certify` during this window
- `regenerateRoleSummary()` regenerates the summary for every role and is a heavy operation, so call it exactly once **at the end** of a bulk update, not inside the loop

## Pattern 7: Anti-Patterns (Avoid These)

```java
// NG: skipping the null check on getRoleInfo()'s return value
final RoleInfo roleInfo = roleInfoManager.getRoleInfo(roleId);
roleInfo.setCategory("new-category"); // NullPointerException if roleId does not exist

// NG: ignoring RoleInfo()'s checked exception (IOException)
// Forgetting that only RoleInfo() throws IOException, and calling it without exception handling like the other constructors
final RoleInfo roleInfo = new RoleInfo(); // compile error, or a missing throws declaration

// NG: forgetting to call regenerateRoleSummary() after using the WithoutCreatingSummary methods
roleInfoManager.addSubRoleInfoWithoutCreatingSummary(parentRoleId, subRoleId);
// processing ends without calling regenerateRoleSummary(); getAllSubRoleIds and similar will subsequently return inconsistent results

// NG: swallowing AdminException
try {
    roleInfoManager.addRoleInfo(roleInfo);
} catch (final AdminException e) {
    // does nothing (makes root-cause investigation impossible)
}

// NG: swapping the certify() arguments (nestRoleIds / roleIds) without regard for their asymmetry
// The second argument (roleIds) is not nesting-expanded, so matches can be unintentionally missed
roleInfoManager.certify(APPROVAL_ROLE_IDS, userNestRoleIds); // arguments reversed

// NG: continuing to use getCategoryCount() (@Deprecated) in new implementations
final int count = roleInfoManager.getCategoryCount(category); // use getRoleInfoCountByCategory(String) instead

// NG: calling moveCategory() without confirmation, unaware that it is a destructive operation
// It bulk-rewrites the category name of every role belonging to the category (reverting requires calling moveCategory again in the opposite direction)
roleInfoManager.moveCategory(oldCategory, newCategory);
```
