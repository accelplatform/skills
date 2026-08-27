# Role API 参考（Java 版）

基于 intra-mart Accel Platform 核心源码（`im_admin_base` 模块）的实际类定义。请勿凭记忆或猜测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.admin.role
└── RoleInfoManager             … 公开 API。提供角色的注册・更新・删除・层级管理・分类管理・检索

jp.co.intra_mart.foundation.admin.role.model
├── RoleInfo                    … 角色信息模型（Serializable）
└── RoleInfoListItem            … searchRoleInfosByCategoryAndRoleName 的返回类型（Serializable，8.0.37 起）

jp.co.intra_mart.foundation.admin.exception
└── AdminException              … RoleInfoManager 所有方法都会抛出的受检异常（FoundationException 的子类）
```

## `RoleInfoManager` 类

```java
package jp.co.intra_mart.foundation.admin.role;

public class RoleInfoManager {

    /**
     * 创建实例。
     */
    public RoleInfoManager();

    /**
     * 新建角色信息。
     * @param roleInfo 要注册的角色信息
     * @throws AdminException 注册失败时抛出
     */
    public void addRoleInfo(final RoleInfo roleInfo) throws AdminException;

    /**
     * 为角色添加子角色（会重新生成角色摘要）。
     * @param roleId 父角色ID
     * @param subRoleId 要添加的子角色ID
     * @throws AdminException 添加失败时抛出
     */
    public void addSubRoleInfo(final String roleId, final String subRoleId) throws AdminException;

    /**
     * 判断所持有的角色（已展开嵌套）是否内含指定角色群中的任意一个。
     * @param nestRoleIds 连同嵌套角色一起检查的角色ID数组
     * @param roleIds 仅按直接匹配检查的角色ID数组
     * @return 若 nestRoleIds 中包含 roleIds 中的任意一个，则返回 true
     * @throws AdminException 判定失败时抛出
     */
    public boolean certify(final String[] nestRoleIds, final String[] roleIds) throws AdminException;

    /**
     * 判断指定的角色ID是否存在。
     * @param roleId 角色ID
     * @return 存在时返回 true
     * @throws AdminException 判定失败时抛出
     */
    public boolean contains(final String roleId) throws AdminException;

    /**
     * 判断指定的分类是否存在。
     * @param category 分类
     * @return 存在时返回 true
     * @throws AdminException 判定失败时抛出
     */
    public boolean containsCategory(final String category) throws AdminException;

    /**
     * 在全部角色中判断指定的角色名是否存在。
     * @param roleName 角色名
     * @return 存在时返回 true
     * @throws AdminException 判定失败时抛出
     */
    public boolean containsRoleName(final String roleName) throws AdminException;

    /**
     * 排除第二个参数指定的角色后，判断指定的角色名是否存在。
     * @param roleName 角色名
     * @param exceptRoleId 从判定对象中排除的角色ID
     * @return 存在时返回 true
     * @throws AdminException 判定失败时抛出
     */
    public boolean containsRoleName(final String roleName, final String exceptRoleId) throws AdminException;

    /**
     * 删除全部分类。
     * @throws AdminException 删除失败时抛出
     */
    public void deleteCategories() throws AdminException;

    /**
     * 删除指定的分类。
     * @param category 分类
     * @throws AdminException 删除失败时抛出
     */
    public void deleteCategory(final String category) throws AdminException;

    /**
     * 删除指定的角色。
     * @param roleId 角色ID
     * @throws AdminException 删除失败时抛出
     */
    public void deleteRoleInfo(final String roleId) throws AdminException;

    /**
     * 删除全部角色。
     * @throws AdminException 删除失败时抛出
     */
    public void deleteRoleInfos() throws AdminException;

    /**
     * 从角色中删除指定的子角色（会重新生成角色摘要）。
     * @param roleId 父角色ID
     * @param subRoleId 要删除的子角色ID
     * @throws AdminException 删除失败时抛出
     */
    public void deleteSubRoleInfo(final String roleId, final String subRoleId) throws AdminException;

    /**
     * 删除角色所属的全部子角色（会重新生成角色摘要）。
     * @param roleId 父角色ID
     * @throws AdminException 删除失败时抛出
     */
    public void deleteSubRoleInfos(final String roleId) throws AdminException;

    /**
     * 获取指定角色的全部父角色ID，包括嵌套的父角色。
     * @param roleId 角色ID
     * @return 全部父角色ID的列表
     * @throws AdminException 获取失败时抛出
     */
    public List<String> getAllParentRoleIds(final String roleId) throws AdminException;

    /**
     * 获取指定角色的全部子角色ID，包括嵌套的子角色。
     * @param roleId 角色ID
     * @return 全部子角色ID的列表
     * @throws AdminException 获取失败时抛出
     */
    public List<String> getAllSubRoleIds(final String roleId) throws AdminException;

    /**
     * 获取去重后的全部分类。
     * @return 分类列表
     * @throws AdminException 获取失败时抛出
     */
    public List<String> getCategories() throws AdminException;

    /**
     * 获取指定分类下的角色件数。
     * @param category 分类
     * @return 角色件数
     * @throws AdminException 获取失败时抛出
     * @deprecated 请使用 {@link #getRoleInfoCountByCategory(String)}。
     */
    @Deprecated
    public int getCategoryCount(final String category) throws AdminException;

    /**
     * 仅获取一层上方的父角色ID（不展开嵌套）。
     * @param roleId 角色ID
     * @return 一层上方的父角色ID列表
     * @throws AdminException 获取失败时抛出
     */
    public List<String> getParentRoleIds(final String roleId) throws AdminException;

    /**
     * 获取全部角色ID。
     * @return 角色ID列表
     * @throws AdminException 获取失败时抛出
     */
    public List<String> getRoleIds() throws AdminException;

    /**
     * 获取指定角色ID的角色信息。
     * @param roleId 角色ID
     * @return 角色信息；若角色不存在则返回 null（不会抛出异常）
     * @throws AdminException 获取处理本身失败时抛出
     */
    public RoleInfo getRoleInfo(final String roleId) throws AdminException;

    /**
     * 获取全部角色件数。
     * @return 角色件数
     * @throws AdminException 获取失败时抛出
     */
    public int getRoleInfoCount() throws AdminException;

    /**
     * 获取指定分类下的角色件数。
     * @param category 分类
     * @return 角色件数
     * @throws AdminException 获取失败时抛出
     */
    public int getRoleInfoCountByCategory(final String category) throws AdminException;

    /**
     * 获取全部角色信息。
     * @return 角色信息列表
     * @throws AdminException 获取失败时抛出
     */
    public List<RoleInfo> getRoleInfos() throws AdminException;

    /**
     * 获取指定分类下的角色信息。
     * @param category 分类
     * @return 角色信息列表
     * @throws AdminException 获取失败时抛出
     */
    public List<RoleInfo> getRoleInfosByCategory(final String category) throws AdminException;

    /**
     * 获取指定角色ID群对应的角色信息。
     * @param roleIds 角色ID（可变长参数）
     * @return 角色信息列表
     * @throws AdminException 获取失败时抛出
     */
    public List<RoleInfo> getRoleInfosByRoleIds(final String... roleIds) throws AdminException;

    /**
     * 仅获取一层下方的子角色ID（不展开嵌套）。
     * @param roleId 角色ID
     * @return 一层下方的子角色ID列表
     * @throws AdminException 获取失败时抛出
     */
    public List<String> getSubRoleIds(final String roleId) throws AdminException;

    /**
     * 判断指定日期时间以后是否有更新。
     * @param date 判定基准日期时间
     * @return 始终返回 true
     * @throws AdminException 判定失败时抛出
     * @deprecated 由于实现上始终返回 true，实际上无法作为判定手段使用。
     */
    @Deprecated
    public boolean isUpdate(final Date date) throws AdminException;

    /**
     * 批量更新指定分类下全部角色的分类名（破坏性操作）。
     * @param oldCategory 变更前的分类名
     * @param newCategory 变更后的分类名
     * @throws AdminException 更新失败时抛出
     */
    public void moveCategory(final String oldCategory, final String newCategory) throws AdminException;

    /**
     * 对角色ID进行通配符检索（* 匹配0个以上字符，? 匹配1个字符）。
     * @param roleId 检索条件（可使用通配符）
     * @return 符合条件的角色信息列表
     * @throws AdminException 检索失败时抛出
     */
    public List<RoleInfo> searchRoleInfosByRoleId(final String roleId) throws AdminException;

    /**
     * 对角色名进行通配符检索（* 匹配0个以上字符，? 匹配1个字符）。
     * @param roleName 检索条件（可使用通配符）
     * @return 符合条件的角色信息列表
     * @throws AdminException 检索失败时抛出
     */
    public List<RoleInfo> searchRoleInfosByRoleName(final String roleName) throws AdminException;

    /**
     * 更新角色信息。
     * @param roleInfo 要更新的角色信息
     * @throws AdminException 更新失败时抛出
     */
    public void updateRoleInfo(final RoleInfo roleInfo) throws AdminException;

    /**
     * 获取符合指定分类・角色名条件的角色件数。
     * @param category 分类（检索条件）
     * @param roleName 角色名（检索条件）
     * @param locale 用于解析显示名的语言环境
     * @return 符合条件的角色件数
     * @throws AdminException 获取失败时抛出
     * @since 8.0.37
     */
    public int getRoleInfoCountByCategoryAndRoleName(final String category, final String roleName, final Locale locale) throws AdminException;

    /**
     * 按指定的分类・角色名条件检索角色信息，并进行分页与排序。
     * @param category 分类（检索条件）
     * @param roleName 角色名（检索条件）
     * @param locale 用于解析显示名的语言环境
     * @param limit 获取件数上限
     * @param offset 获取起始位置（从0开始）
     * @param sortIndex 排序列（category / role_name / display_name 三者之一）
     * @param sortOrder 排序顺序（ASC / DESC）
     * @return 符合条件的角色信息列表项列表
     * @throws AdminException 检索失败时抛出
     * @since 8.0.37
     */
    public List<RoleInfoListItem> searchRoleInfosByCategoryAndRoleName(final String category, final String roleName,
            final Locale locale, final int limit, final int offset, final String sortIndex, final String sortOrder) throws AdminException;

    /**
     * 不重新生成角色摘要地添加子角色（用于大量数据批量更新等性能优化场景的轻量版）。
     * 使用本方法时，调用方必须另外调用 {@link #regenerateRoleSummary()}。
     * @param roleId 父角色ID
     * @param subRoleId 要添加的子角色ID
     * @throws AdminException 添加失败时抛出
     * @since 8.0.37
     */
    public void addSubRoleInfoWithoutCreatingSummary(final String roleId, final String subRoleId) throws AdminException;

    /**
     * 不重新生成角色摘要地删除子角色。使用本方法时，调用方必须另外调用 {@link #regenerateRoleSummary()}。
     * @param roleId 父角色ID
     * @param subRoleId 要删除的子角色ID
     * @throws AdminException 删除失败时抛出
     * @since 8.0.37
     */
    public void deleteSubRoleInfoWithoutCreatingSummary(final String roleId, final String subRoleId) throws AdminException;

    /**
     * 不重新生成角色摘要地删除角色所属的全部子角色。使用本方法时，调用方必须另外调用 {@link #regenerateRoleSummary()}。
     * @param roleId 父角色ID
     * @throws AdminException 删除失败时抛出
     * @since 8.0.37
     */
    public void deleteSubRoleInfosWithoutCreatingSummary(final String roleId) throws AdminException;

    /**
     * 重新生成全部角色的角色摘要。
     * 使用 {@code WithoutCreatingSummary} 系列方法更新层级后，必须调用一次本方法以保持角色摘要的一致性。
     * @throws AdminException 重新生成失败时抛出
     * @since 8.0.37
     */
    public void regenerateRoleSummary() throws AdminException;
}
```

- 是一个非 `final` 的普通类（可被继承）
- 所有方法都声明了 `AdminException`（受检异常）。应通过 `throws` 向上传播，或在调用处 `catch` 并包装为业务异常
- 需要注意的是，只有 `getRoleInfo(roleId)` 在对象不存在时被设计为返回 **`null`** 而非抛出异常（其他 `get`/`search` 系列方法在无匹配结果时会返回空列表）

## `RoleInfo` 模型

```java
package jp.co.intra_mart.foundation.admin.role.model;

import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class RoleInfo implements Serializable {

    /** 分类 */
    private String category;

    /** 显示名（key：语言环境，value：显示名） */
    private final Map<Locale, String> displayName = new HashMap<Locale, String>();

    /** 备注 */
    private String notes;

    /** 角色ID */
    private String roleId;

    /** 角色名 */
    private String roleName;

    /**
     * 创建实例。角色ID通过 Identifier 自动编号。
     * @throws IOException 自动编号失败时抛出
     */
    public RoleInfo() throws IOException;

    /**
     * 指定角色ID创建实例。角色名将与角色ID相同。
     * @param roleId 角色ID
     */
    public RoleInfo(final String roleId);

    /**
     * 指定角色ID・角色名创建实例。
     * @param roleId 角色ID
     * @param roleName 角色名
     */
    public RoleInfo(final String roleId, final String roleName);

    // category / notes / roleId / roleName 对应的标准 getter / setter
    // displayName 拥有直接返回 Map<Locale, String> 的 getter，以及按语言环境设置的 setter

    /**
     * 按角色ID是否一致判定相等性。
     * @param object 比较对象
     * @return 角色ID一致时返回 true
     */
    @Override
    public boolean equals(final Object object);
}
```

- 三种构造函数的使用区分：
  - `RoleInfo()`：希望角色ID通过 `Identifier` 自动编号时使用。是唯一会**抛出 `IOException`**（受检异常）的构造函数
  - `RoleInfo(roleId)`：希望明确指定角色ID时使用。角色名会以与角色ID相同的值初始化（可另行通过 `setRoleName()` 覆盖）
  - `RoleInfo(roleId, roleName)`：希望同时明确指定角色ID与角色名时使用
  - 带参数的两种构造函数均不会抛出异常
- 需要注意 `displayName` 是 `Map<Locale, String>`，而非单一 `String`，可按语言环境保存不同的显示名
- `equals()` 仅依据角色ID是否一致进行判定（其他字段不参与比较）

## `RoleInfoListItem` 模型

`searchRoleInfosByCategoryAndRoleName` 的返回类型。其字段构成与 SSJS 版 d.ts（`d.ts/tenant/object/im-ssjs-role-info-list-item.d.ts`）相对应。

```java
package jp.co.intra_mart.foundation.admin.role.model;

import java.io.Serializable;

public class RoleInfoListItem implements Serializable {

    /** 分类 */
    private String category;

    /** 显示名（已按调用时指定的语言环境解析完成的单一字符串） */
    private String displayName;

    /** 角色ID */
    private String roleId;

    /** 角色名 */
    private String roleName;

    // category / displayName / roleId / roleName 对应的标准 getter / setter
}
```

- 与 `RoleInfo` 的 `displayName`（`Map<Locale, String>`）不同，`RoleInfoListItem` 的 `displayName` 是调用 `searchRoleInfosByCategoryAndRoleName` 时按指定的 `Locale` **已解析完成的单一 `String`**，表示为列表显示准备好的格式化数据
- 这是专用于检索・分页的只读模型，`RoleInfoManager` 中不存在直接接收该对象进行更新的方法（需要更新时请使用 `RoleInfo`）

## `AdminException`

```java
package jp.co.intra_mart.foundation.admin.exception;

public class AdminException extends FoundationException {
    // RoleInfoManager 所有方法都会抛出的受检异常
}
```

- 继承自 `jp.co.intra_mart.foundation.exception.FoundationException` 的受检异常
- `RoleInfoManager` 的所有方法（构造函数除外）都声明了此异常
- 调用方应通过 `throws` 向上传播，或包装为业务异常后 `catch`。禁止吞掉异常（空的 `catch` 代码块）（参见 `assets/role-basic-usage.md` 中的反模式）
