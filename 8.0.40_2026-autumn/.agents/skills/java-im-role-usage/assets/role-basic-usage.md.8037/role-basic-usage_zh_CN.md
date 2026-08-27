# Role API 基本使用模式（Java 版）

`RoleInfoManager` 的签名与内部行为请参考 `reference/role-api-reference.md`。这里展示典型的调用模式。

## 模式1：新建角色

使用 `RoleInfo(roleId, roleName)` 构造函数明确指定角色ID・角色名，然后通过 `addRoleInfo()` 注册的基本形式。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;
import jp.co.intra_mart.foundation.admin.role.model.RoleInfo;

import jp.co.example.foo.exception.RoleRegistrationException;

/**
 * 提供角色注册处理。
 */
public class RoleRegistrationService {

    /**
     * 新建角色。
     * @param roleId 角色ID
     * @param roleName 角色名
     * @param category 分类
     * @throws RoleRegistrationException 注册失败时抛出
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

- `RoleInfo(roleId, roleName)` 不会抛出异常，因此可以在 `try` 外部创建
- `addRoleInfo()` 声明了 `AdminException`（受检异常），应将其包装为业务异常或通过 `throws` 向上传播
- 若希望角色ID通过 `Identifier` 自动编号，可使用 `RoleInfo()`（无参构造函数）。但它会抛出 `IOException`，需要额外的 `try`/`catch`（如模式5 中组合异常处理的方式）

## 模式2：获取・更新角色（含 null 检查）

由于 `getRoleInfo()` 在角色不存在时返回 `null` 而非抛出异常，更新前必须进行 null 检查。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;
import jp.co.intra_mart.foundation.admin.role.model.RoleInfo;

import jp.co.example.foo.exception.RoleNotFoundException;
import jp.co.example.foo.exception.RoleUpdateException;

/**
 * 提供角色更新处理。
 */
public class RoleUpdateService {

    /**
     * 更新角色的显示名。
     * @param roleId 角色ID
     * @param displayName 更新后的显示名
     * @param locale 设置显示名所使用的语言环境
     * @throws RoleNotFoundException 指定的角色不存在时抛出
     * @throws RoleUpdateException 更新处理失败时抛出
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

        // getRoleInfo() 在对应角色不存在时返回 null，而非抛出异常
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

- 若忘记 `getRoleInfo()` 可能返回 `null`，会导致 `NullPointerException`。调用方必须始终进行 null 检查
- 由于 `RoleInfo` 的 `displayName` 是 `Map<Locale, String>`，如果只需更新特定语言环境的显示名，可通过 `getDisplayName().put(locale, displayName)` 直接反映到该 `Map` 中

## 模式3：构建子角色层级并进行层级检索

使用 `addSubRoleInfo()` 构建父子关系，展示 `getAllSubRoleIds()`（全部层级）与 `getSubRoleIds()`（仅一层）的区别。

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;

import jp.co.example.foo.exception.RoleHierarchyException;

/**
 * 提供角色层级的构建与查询处理。
 */
public class RoleHierarchyService {

    /**
     * 为父角色添加子角色。
     * @param parentRoleId 父角色ID
     * @param subRoleId 子角色ID
     * @throws RoleHierarchyException 添加失败时抛出
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
     * 获取指定角色正下方（一层）的子角色ID列表。
     * @param roleId 角色ID
     * @return 一层下的子角色ID列表
     * @throws RoleHierarchyException 获取失败时抛出
     */
    public List<String> findDirectSubRoleIds(final String roleId) throws RoleHierarchyException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            // 仅一层下方，不包含嵌套的子角色（子角色的子角色）
            return roleInfoManager.getSubRoleIds(roleId);
        } catch (final AdminException e) {
            throw new RoleHierarchyException("サブロールIDの取得に失敗しました: roleId=" + roleId, e);
        }
    }

    /**
     * 获取指定角色下全部层级的子角色ID列表。
     * @param roleId 角色ID
     * @return 包含嵌套子角色在内的全部子角色ID列表
     * @throws RoleHierarchyException 获取失败时抛出
     */
    public List<String> findAllSubRoleIds(final String roleId) throws RoleHierarchyException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            // 包括嵌套的子角色（孙角色以下）在内全部获取
            return roleInfoManager.getAllSubRoleIds(roleId);
        } catch (final AdminException e) {
            throw new RoleHierarchyException("全サブロールIDの取得に失敗しました: roleId=" + roleId, e);
        }
    }
}
```

- `getSubRoleIds(roleId)` **仅返回一层下方**，相当于组织架构图中的「直属下级」
- `getAllSubRoleIds(roleId)` 递归获取**全部嵌套层级**，用于需要列出「所有下属」的场景
- `getParentRoleIds`（仅一层上方）与 `getAllParentRoleIds`（全部层级的父角色）之间也存在相同的关系

## 模式4：使用 `certify` 进行角色内含检查

判断某用户所持有的角色列表（已展开嵌套）是否内含特定角色群之一的业务逻辑示例。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;

import jp.co.example.foo.exception.RoleCertificationException;

/**
 * 提供角色持有检查处理。
 */
public class RoleCertificationService {

    /** 视为拥有审批权限的角色ID群 */
    private static final String[] APPROVAL_ROLE_IDS = { "role_manager", "role_director" };

    /**
     * 判断用户所持有的角色（已展开嵌套）是否内含任一审批权限角色。
     * @param userNestRoleIds 用户所持有的角色ID数组（已展开嵌套；应预先通过 getAllParentRoleIds 等方法解析好）
     * @return 若持有任一审批权限角色则返回 true
     * @throws RoleCertificationException 判定失败时抛出
     */
    public boolean hasApprovalRole(final String[] userNestRoleIds) throws RoleCertificationException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();
        try {
            // nestRoleIds（第一个参数）会连同嵌套的角色一起检查。
            // roleIds（第二个参数）仅按直接匹配检查，两者不对称。
            // 因此将「用户一侧」放在第一个参数，将「判定用的固定角色群」放在第二个参数
            return roleInfoManager.certify(userNestRoleIds, APPROVAL_ROLE_IDS);
        } catch (final AdminException e) {
            throw new RoleCertificationException("ロール内包チェックに失敗しました", e);
        }
    }
}
```

- 需要注意 `certify(nestRoleIds, roleIds)` 的第一个参数与第二个参数在「是否展开嵌套」上是**不对称**的。第一个参数会连同嵌套角色一起评估，第二个参数仅按直接匹配评估
- 若参数顺序颠倒会导致判定结果与预期不符，实现前应明确「可以展开嵌套的一侧」与「仅需直接匹配的一侧」分别对应哪个参数

## 模式5：按分类检索角色并分页

使用 `searchRoleInfosByCategoryAndRoleName()`，结合总件数获取（`getRoleInfoCountByCategoryAndRoleName`）与分页检索，适用于列表画面的示例。

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
 * 提供角色列表画面所需的检索处理。
 */
public class RoleSearchService {

    /** 每页显示件数 */
    private static final int PAGE_SIZE = 20;

    /**
     * 按分类・角色名条件对角色进行分页检索。
     * @param category 分类（检索条件，未指定时为 null 或空字符串）
     * @param roleName 角色名（检索条件，未指定时为 null 或空字符串）
     * @param pageNumber 页码（从1开始）
     * @param locale 解析显示名所使用的语言环境
     * @return 包含总件数与该页检索结果的检索结果
     * @throws RoleSearchException 检索失败时抛出
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

- **总件数（`getRoleInfoCountByCategoryAndRoleName`）与检索结果（`searchRoleInfosByCategoryAndRoleName`）必须使用完全相同的检索条件（category / roleName / locale）成对调用。** 若条件不一致，画面上显示的总件数会与实际显示件数不符
- `offset` 从0开始，需要通过 `(pageNumber - 1) * PAGE_SIZE` 的计算方式，将从1开始的页码转换为对应的偏移量
- `sortIndex` 仅 `category` / `role_name` / `display_name` 三者之一有效，传入其他值时行为不受保证，应从固定的许可列表中选择（不要将用户输入直接原样传入）

## 模式6：大量子角色注册时组合使用 `WithoutCreatingSummary` 系列方法与 `regenerateRoleSummary()`

批量注册大量子角色时，若每次都调用 `addSubRoleInfo()`，角色摘要的重新生成会成为性能瓶颈。可使用 `WithoutCreatingSummary` 系列方法抑制摘要重建，最后统一调用一次 `regenerateRoleSummary()`。

```java
package jp.co.example.foo.service;

import java.util.List;

import jp.co.intra_mart.foundation.admin.exception.AdminException;
import jp.co.intra_mart.foundation.admin.role.RoleInfoManager;

import jp.co.example.foo.exception.RoleBulkRegistrationException;
import jp.co.example.foo.model.SubRoleAssignment;

/**
 * 提供子角色的批量注册处理。
 */
public class RoleBulkRegistrationService {

    /**
     * 批量注册大量子角色分配。<br>
     * 通常应以 addSubRoleInfo（自动更新摘要的版本）为默认方式，但本方法用于
     * 大量数据批量更新出现性能问题的场景，因此使用 WithoutCreatingSummary 系列方法，
     * 并在最后统一重新生成一次角色摘要。
     * @param assignments 父角色ID与子角色ID的组合列表
     * @throws RoleBulkRegistrationException 注册失败时抛出
     */
    public void bulkAddSubRoles(final List<SubRoleAssignment> assignments) throws RoleBulkRegistrationException {
        final RoleInfoManager roleInfoManager = new RoleInfoManager();

        try {
            for (final SubRoleAssignment assignment : assignments) {
                // 不每次都重新生成角色摘要的轻量版本。
                // 此时角色摘要尚未更新，因此在处理过程中不要调用 getAllSubRoleIds 等依赖摘要的层级检索方法
                roleInfoManager.addSubRoleInfoWithoutCreatingSummary(assignment.getParentRoleId(), assignment.getSubRoleId());
            }
        } catch (final AdminException e) {
            throw new RoleBulkRegistrationException("サブロールの一括登録に失敗しました", e);
        } finally {
            try {
                // 使用 WithoutCreatingSummary 系列方法后，无论成功与否都必须重新生成角色摘要以保持一致性
                roleInfoManager.regenerateRoleSummary();
            } catch (final AdminException e) {
                throw new RoleBulkRegistrationException("ロールサマリの再作成に失敗しました", e);
            }
        }
    }
}
```

- `WithoutCreatingSummary` 系列方法（8.0.37 及以后）通过省略每次的角色摘要重建来加速大量数据的批量更新。**通常的子角色添加・删除应以 `addSubRoleInfo`/`deleteSubRoleInfo(s)`（自动更新摘要的版本）为默认方式**，仅在出现性能问题时才考虑本模式
- 调用 `WithoutCreatingSummary` 系列方法之后、调用 `regenerateRoleSummary()` 之前，角色摘要处于不一致状态。此期间不要调用 `getAllSubRoleIds`/`getAllParentRoleIds`/`certify` 等依赖摘要的检索方法
- `regenerateRoleSummary()` 会重新生成全部角色的摘要，是较重的处理，因此应在批量更新的**最后统一调用一次**，而非在循环内部调用

## 模式7：反模式集合（应避免的写法）

```java
// NG：忽略 getRoleInfo() 返回值的 null 检查
final RoleInfo roleInfo = roleInfoManager.getRoleInfo(roleId);
roleInfo.setCategory("new-category"); // 若 roleId 不存在则抛出 NullPointerException

// NG：忽视 RoleInfo() 的受检异常（IOException）
// 忘记只有 RoleInfo() 会抛出 IOException，像其他构造函数一样不做异常处理直接调用
final RoleInfo roleInfo = new RoleInfo(); // 编译错误，或缺少 throws 声明

// NG：使用 WithoutCreatingSummary 系列方法后忘记调用 regenerateRoleSummary()
roleInfoManager.addSubRoleInfoWithoutCreatingSummary(parentRoleId, subRoleId);
// 未调用 regenerateRoleSummary() 就结束处理，此后 getAllSubRoleIds 等方法会返回不一致的结果

// NG：吞掉 AdminException
try {
    roleInfoManager.addRoleInfo(roleInfo);
} catch (final AdminException e) {
    // 什么都不做（导致无法排查原因）
}

// NG：不考虑 certify() 参数（nestRoleIds / roleIds）的不对称性而颠倒顺序
// 第二个参数（roleIds）不会展开嵌套，因此可能导致判定遗漏
roleInfoManager.certify(APPROVAL_ROLE_IDS, userNestRoleIds); // 参数顺序颠倒

// NG：在新实现中继续使用已 @Deprecated 的 getCategoryCount()
final int count = roleInfoManager.getCategoryCount(category); // 应使用 getRoleInfoCountByCategory(String)

// NG：未意识到 moveCategory() 是破坏性操作而未经确认直接调用
// 该分类下所有角色的分类名会被一次性批量重写（若要恢复，需要再次反向调用 moveCategory）
roleInfoManager.moveCategory(oldCategory, newCategory);
```
