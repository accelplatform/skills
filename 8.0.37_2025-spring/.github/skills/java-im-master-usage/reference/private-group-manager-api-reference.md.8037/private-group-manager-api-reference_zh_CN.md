# PrivateGroupManager API 参考手册（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.private_group.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## 类概要

```java
package jp.co.intra_mart.foundation.master.private_group;

/**
 * 负责获取与管理私有组信息的管理器类
 * @since 7.2
 */
public class PrivateGroupManager extends AbstractManager {
```

- 负责 IM-共通主数据（`im_master-main`）中私有组信息的 CRUD・检索的管理器。继承 `AbstractManager`（保存更新者用户代码・默认区域设置・登录组 ID 的公共基类）
- 内部持有扩展点（`jp.co.intra_mart.foundation.master.accessor.private_group`），将实际的读取/写入/通知/导入/导出委托给插件实现（`PrivateGroupReader`/`PrivateGroupWriter`/`PrivateGroupListener`/`PrivateGroupImporter`/`PrivateGroupExporter`）
- 与用户・公司・法人组的各管理器不同，不具有分类・角色・树功能。是专注于管理按所有者（`userCd`）划分的组及其成员（`setUserAttach`/`removeUserAttach`/`*WithPrivateGroup` 系）的小规模 API
- 与 `User`/`Company` 不同，不具有期间（`ITerm`）管理。`PrivateGroup` 未实现 `ITerm`

## 构造函数

| 签名 | 概要 |
|---|---|
| `public PrivateGroupManager() throws BizApiException` | **推荐。** 更新者用户代码・默认区域设置使用「当前登录用户」的值 |
| `public PrivateGroupManager(String updateUserCd) throws BizApiException` | 显式指定更新者用户代码。默认区域设置为当前登录用户的区域设置 |
| `public PrivateGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 同时显式指定更新者用户代码・默认区域设置 |
| `public PrivateGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（请使用 `PrivateGroupManager()`） |

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（受检异常）。构造函数・public 方法几乎全部声明 `throws BizApiException`。

## 方法一览

所有方法均以 `IPrivateGroupBizKey`（持有私有组代码・用户代码组合的接口，`PrivateGroup` 也实现了该接口）作为参数的起点。

```java
// 计数
public int countPrivateGroup(AppCmnSearchCondition condition) throws BizApiException;
public int countUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable 重载
public int totalUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable 重载。不指定 locale（覆盖所有语言）

// 单体获取。目标不存在时不抛出异常而是返回 null
public PrivateGroup getPrivateGroup(IPrivateGroupBizKey bizKey) throws BizApiException;

// 归属于私有组的用户的一览・检索（3 种模式：无额外参数/含 start・count/含 isDisable，结构均相同）
public UserListNode[] listUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public UserListNode[] listUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException;
public UserListNode[] listUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public UserListNode[] searchUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 结构相同的独立方法组（+ start/count, isDisable 重载）

// 私有组本身的检索
public PrivateGroupListNode[] searchPrivateGroup(AppCmnSearchCondition condition) throws BizApiException;
public PrivateGroupListNode[] searchPrivateGroup(AppCmnSearchCondition condition, int start, int count) throws BizApiException;

// 新建/更新
public void setPrivateGroup(PrivateGroup privateGroup) throws BizApiException;
public void setUserAttach(IPrivateGroupBizKey privateGroupBizKey, IUserBizKey userBizKey, int sortKey) throws BizApiException;

// 删除
public void removePrivateGroup(IPrivateGroupBizKey bizKey) throws BizApiException;
public void removeUserAttach(IPrivateGroupBizKey privateGroupBizKey, IUserBizKey userBizKey) throws BizApiException;
```

`condition`（`AppCmnSearchCondition`）中可指定的表，在私有组本身的操作（`countPrivateGroup`/`searchPrivateGroup`）中为 `imm_private_grp` 表，在涉及归属用户的操作（`countUserWithPrivateGroup`/`listUserWithPrivateGroup`/`searchUserWithPrivateGroup`/`totalUserWithPrivateGroup`）中为 `imm_user` 表。`list`/`search` 系的 `start`/`count` 从 1 开始，`count` 设为 0 时获取全部记录。

## `setPrivateGroup` / `setUserAttach` 的新建・更新判定

其判定方法与 `UserManager#setUser`（根据 `termCd` 是否存在判定）不同。由于 `PrivateGroup` 未实现 `ITerm` 也不具有 `termCd`，**新建/更新的判定并非由管理器一侧进行，而是根据 `PrivateGroupWriter`/`IUserBizKey` 的返回值进行**。

- `setPrivateGroup(PrivateGroup)`：若 `executor.getWriter().setPrivateGroup(...)` 的返回值（`PrivateGroup`）非 `null`，则为新建注册（触发 `PrivateGroupListener#createPrivateGroup`）；若为 `null`，则为更新（触发 `PrivateGroupListener#updatePrivateGroup`）。调用前会通过 `AppCmnValidationManager.validateModel` 进行模型整体的校验
- `setUserAttach(IPrivateGroupBizKey, IUserBizKey, int)`：若 `executor.getWriter().setUserAttach(...)` 的返回值（`IUserBizKey`）非 `null`，则为新建追加（触发 `PrivateGroupListener#createUserAttach`）；若为 `null`，则为更新（触发 `PrivateGroupListener#updateUserAttach`）。调用前仅会对 `privateGroupBizKey`/`userBizKey` 分别进行 `validateProperty` 检查，方法内部不存在针对 `sortKey` 的显式校验
- 无论哪种情况，新建/更新的分支判断均由读取器/写入器实现（扩展点一侧）根据目标数据是否存在来决定，`PrivateGroupManager` 本身不会根据调用方输入值（如 `termCd`）进行判定

## 删除・注册方法的内部日志

注册・更新・删除系方法（`setPrivateGroup`/`setUserAttach`/`removePrivateGroup`/`removeUserAttach`/`importData`）使用 `jp.co.intra_mart.system.log.masterlog.MasterLog`，在 `finally` 块中必定输出处理结果（成功/失败）的日志。日志消息 ID 遵循 `IM-MASTERLOG.IMMPrivateGroupManager.<方法名>.<序号>` 的命名规则。应用程序一侧无需显式调用日志。

## 模型类

### `PrivateGroup`

```java
package jp.co.intra_mart.foundation.master.private_group.model;

public class PrivateGroup implements IPrivateGroupBizKey, ISortable, IRecorder {
```

| 字段 | 类型 | 概要 |
|---|---|---|
| `privateGroupCd` | `String` | 私有组代码（`IPrivateGroupBizKey`，必须） |
| `userCd` | `String` | **所有者代码**（`IPrivateGroupBizKey`，必须）。根据 JavaDoc 为「所有者代码」，与 `IPrivateGroupBizKey` 一侧的一般性描述（用户代码）含义不同，需注意 |
| `privateGroupName` | `String`（默认 `""`） | 私有组名称（必须） |
| `privateGroupSearchName` | `String`（默认 `""`） | 私有组检索名 |
| `notes` | `String`（默认 `""`） | 备注 |
| `sortKey` | `int` | 排序键（`ISortable`） |
| `recordDate` / `recordUserCd` | `Date` / `String` | 更新日期・更新者用户代码（`IRecorder`） |

未实现期间（`ITerm`）・国际化信息（`IWithLocale`）。是不具有按区域设置划分的多语言数据的单一语言模型。

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

以私有组代码与用户代码的组合作为业务键。由于 `PrivateGroup` 实现了该接口，因此可以将 `PrivateGroup` 实例直接作为 `IPrivateGroupBizKey` 参数传递。

### `PrivateGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.private_group.model;

public class PrivateGroupBizKey implements IPrivateGroupBizKey {
```

仅持有 `privateGroupCd`/`userCd` 的轻量级 `IPrivateGroupBizKey` 实现类。用于只需传递业务键的场景（不需要组装完整 `PrivateGroup` 的场景）。

## 导入・导出

```java
public Set<String> getExportCategories(); // 无异常
public Set<String> getImportCategories(); // 无异常
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```

当 `categoryName` 不包含在对应的 Categories 中时，将抛出 `BizApiException`（"Export category not found: ..." / "Import category not found: ..."）。
