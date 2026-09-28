# PublicGroupManager API 参考（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.public_group.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## 类概述

```java
package jp.co.intra_mart.foundation.master.public_group;

/**
 * 用于获取和管理公共组信息的管理器类
 * @since 7.2
 */
public class PublicGroupManager extends AbstractManager {
```

**公共组（PublicGroup）・公共组集合（PublicGroupSet）・公共组分类/分类项目（PublicGroupCtg/PublicGroupCtgItm）・公共组角色（PublicGroupRole）全部由这一个类处理。**

内部结构与 `CompanyManager`/`UserManager` 相同，通过扩展点（默认值 `jp.co.intra_mart.foundation.master.accessor.public_group`）将处理委托给插件实现（`PublicGroupReader`/`PublicGroupWriter`/`PublicGroupListener`/`PublicGroupImporter`/`PublicGroupExporter`）。但是，`PublicGroupManager` 中不存在相当于 `CompanyManager`/`UserManager` 所具备的 `changeExecutor(String)`（运行时切换扩展点）的 public 方法。扩展点的初始化仅通过内部专用的 `setUpExecutor()` 完成，由构造函数调用。

## 构造函数

| 签名 | 概述 |
|---|---|
| `public PublicGroupManager() throws BizApiException` | **推荐。** 更新用户代码・默认语言环境使用"当前登录用户"的值 |
| `public PublicGroupManager(String updateUserCd) throws BizApiException` | 显式指定更新用户代码 |
| `public PublicGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 同时显式指定更新用户代码・默认语言环境 |
| `public PublicGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（请使用 `PublicGroupManager()`） |

省略参数时，采用"当前登录用户"的值。

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（检查异常）。构造函数・CRUD・搜索系方法均一致地仅声明此异常（仅 `getExportCategories()`/`getImportCategories()` 不声明异常）。

## 公共组（`PublicGroup`）相关方法

`getPublicGroup` 系方法在对象不存在时不抛出异常，而是返回 `null`。

```java
public PublicGroup getPublicGroup(IPublicGroupBizKey bizKey, Date date) throws BizApiException; // 存在 Locale、isDisable 组合的重载（共4种）

public PublicGroupListNode[] listPublicGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count、isDisable
public PublicGroupListNode[] searchPublicGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 与 listPublicGroup 同型的另一系统

public int countPublicGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalPublicGroup(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。不含 Locale 参数

public ITerm[] setPublicGroup(PublicGroup publicGroup) throws BizApiException; // 新建/更新（根据期间代码有无自动判定）

public void removePublicGroup(IPublicGroupBizKey bizKey) throws BizApiException; // 删除所有语言及关联信息
public void removePublicGroup(IPublicGroupBizKey bizKey, Locale locale) throws BizApiException; // 仅删除指定语言
public void removePublicGroup(Locale locale) throws BizApiException; // 从所有公共组中删除指定语言的数据
```

与 `Company`/`Department` 不同，`PublicGroup` 可以通过 `setPublicGroup` 同时进行新建和更新（根据期间代码 `termCd` 有无自动判定的模式）。

### 公共组内包（父子关系）操作

```java
public void setPublicGroupInclusion(IPublicGroupBizKey bizKey, String parentPublicGroupCd, String childPublicGroupCd) throws BizApiException;
public void removePublicGroupInclusion(IPublicGroupBizKey bizKey, String childPublicGroupCd) throws BizApiException;
```

### 期间操作

存在 `mergeBackwardTermPublicGroup`/`mergeForwardTermPublicGroup`/`moveTermPublicGroup`/`separateTermPublicGroup`（与 `Department`/`CompanyPost` 相同的设计思路）。

## 公共组集合（`PublicGroupSet`）相关方法

`PublicGroupSet` 仅有 `publicGroupSetCd`/`recordDate`/`recordUserCd`/`sortKey` 4个字段，与 `Company`/`DepartmentSet` 相同，不具备多语言名称字段，也不实现 `ITerm`。**不存在 `setPublicGroupSet`（新建用方法），`updatePublicGroupSet` 仅用于更新现有记录。**

```java
public PublicGroupSet getPublicGroupSet(IPublicGroupSetBizKey bizKey) throws BizApiException;
public PublicGroupSet[] getPublicGroupSetAll() throws BizApiException;

public void updatePublicGroupSet(PublicGroupSet publicGroupSet) throws BizApiException; // 仅用于更新现有记录
public void removePublicGroupSet(IPublicGroupSetBizKey bizKey) throws BizApiException;

public void changePublicGroupSetState(IPublicGroupSetBizKey bizKey, String termCd, boolean disable) throws BizApiException; // 更新指定期间的删除标志
```

也存在 `mergeBackwardTermPublicGroupSet`/`mergeForwardTermPublicGroupSet`/`moveTermPublicGroupSet`/`separateTermPublicGroupSet`。这些方法操作的不是 `PublicGroupSet` 实体自身的期间，而是其下属的**公共组树（`getTree` 返回的结构）的期间**。

## 公共组分类（`PublicGroupCtg`）・分类项目（`PublicGroupCtgItm`）相关方法

处理 `PublicGroupCtg`（分类代码 `categoryCd` + 分类类型 `categoryType` + 多语言名称 + 删除标志）与 `PublicGroupCtgItm`（分类代码 `categoryCd` + 分类项目代码 `categoryItemCd` + 多语言名称 + 删除标志）。两者均不具备期间管理（`ITerm`）。

```java
// 分类（PublicGroupCtg）
public PublicGroupCtg getPublicGroupCategory(IPublicGroupCtgBizKey bizKey) throws BizApiException; // + Locale
public PublicGroupCtgListNode[] listPublicGroupCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count、isDisable
public PublicGroupCtgListNode[] searchPublicGroupCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countPublicGroupCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int totalPublicGroupCategory(AppCmnSearchCondition condition) throws BizApiException;
public void setPublicGroupCategory(PublicGroupCtg publicGroupCtg) throws BizApiException; // 新建/更新
public void removePublicGroupCategory(IPublicGroupCtgBizKey bizKey) throws BizApiException; // + Locale 重载、仅 Locale 的全量删除版本

// 分类项目（PublicGroupCtgItm）
public PublicGroupCtgItm getPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey) throws BizApiException; // + Locale
public PublicGroupCtgItmListNode[] listPublicGroupCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count、isDisable
public PublicGroupCtgItmListNode[] searchPublicGroupCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countPublicGroupCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int totalPublicGroupCategoryItem(AppCmnSearchCondition condition) throws BizApiException;
public void setPublicGroupCategoryItem(PublicGroupCtgItm publicGroupCtgItm) throws BizApiException; // 新建/更新
public void removePublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey) throws BizApiException; // + Locale 重载、仅 Locale 的全量删除版本
```

### 公共组与分类项目的关联

```java
// 关联（附加）
public void setPublicGroupCategoryItemAttach(IPublicGroupBizKey publicGroupBizKey, IPublicGroupCtgItmBizKey categoryItemBizKey, ITerm term) throws BizApiException;
// 解除关联
public void removePublicGroupCategoryItemAttach(IPublicGroupBizKey publicGroupBizKey, IPublicGroupCtgItmBizKey categoryItemBizKey, String termCd) throws BizApiException;

// 搜索与分类项目关联的公共组
public PublicGroupListNode[] listPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public PublicGroupListNode[] searchPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException;

// 搜索与公共组关联的分类项目
public PublicGroupCtgItmListNode[] listPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public PublicGroupCtgItmListNode[] searchPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException;
```

各系统均存在追加 `isDisable` 参数的重载。

## 公共组角色（`PublicGroupRole`）相关方法

`PublicGroupRole` 具有 `publicGroupSetCd`/`roleCd` 复合主键 + 期间管理（`termCd`/`startDate`/`endDate`）+ 多语言名称 + `rank`（等级）字段，是与 `Department`/`CompanyPost` 几乎相同类型的模型。

```java
public PublicGroupRole getPublicGroupRole(IPublicGroupRoleBizKey bizKey, Date date) throws BizApiException; // 存在 Locale、isDisable 组合的重载（共4种）

public PublicGroupRoleListNode[] listPublicGroupRole(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count、isDisable
public PublicGroupRoleListNode[] searchPublicGroupRole(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countPublicGroupRole(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalPublicGroupRole(AppCmnSearchCondition condition, Date date) throws BizApiException;

public ITerm[] setPublicGroupRole(PublicGroupRole publicGroupRole) throws BizApiException; // 新建/更新（根据期间代码有无自动判定）

public void removePublicGroupRole(IPublicGroupRoleBizKey bizKey) throws BizApiException; // + Locale 重载、仅 Locale 的全量删除版本
```

也存在 `mergeBackwardTermPublicGroupRole`/`mergeForwardTermPublicGroupRole`/`moveTermPublicGroupRole`/`separateTermPublicGroupRole`。

### 为用户分配角色（`PublicGroupRoleAttach`）

为属于公共组的用户分配角色。没有专用的模型类，通过 `setPublicGroupRoleAttach`/`removePublicGroupRoleAttach` 进行操作。

```java
public ITerm[] setPublicGroupRoleAttach(IPublicGroupBizKey publicGroupBizKey, IUserBizKey userBizKey, IPublicGroupRoleBizKey roleBizKey, String termCd) throws BizApiException;
public void removePublicGroupRoleAttach(IPublicGroupBizKey publicGroupBizKey, IUserBizKey userBizKey, IPublicGroupRoleBizKey roleBizKey, String termCd) throws BizApiException;
```

### 以角色为轴的用户・公共组搜索

存在大量以角色为条件筛选用户/公共组的搜索方法系统。

```java
// 搜索指定用户在特定公共组上持有的角色
public PublicGroupRoleListNode[] listPublicGroupRoleWithUserOnPublicGroup(IUserBizKey userBizKey, IPublicGroupBizKey publicGroupBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

// 搜索在特定公共组上持有特定角色的用户
public UserListNode[] listUserWithPublicGroupRoleOnPublicGroup(IPublicGroupRoleBizKey roleBizKey, IPublicGroupBizKey publicGroupBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
// 以（角色、公共组）键组的 List 为条件的版本
public UserListNode[] listUserWithPublicGroupRoleOnPublicGroup(List bizKeyList, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

// 搜索持有特定角色的用户（不限定公共组）
public UserListNode[] listUserWithPublicGroupRole(IPublicGroupRoleBizKey roleBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

// 用户持有角色的公共组一览
public AttachPublicGroupListNode[] listPublicGroupWithUserRole(IUserBizKey userBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
```

`list*`/`search*`/`count*`/`total*` 这4个系统，分别对应 `WithUserOnPublicGroup`/`WithPublicGroupRoleOnPublicGroup`/`WithPublicGroupRole`（单键版本・`List` 键数组版本）齐备（共 82 个 `*PublicGroup*` 系方法中，大部分由此组合模式构成）。各个具体签名请参照 `PublicGroupManager.java`。

## 树操作

以 `PublicGroupSet` 为起点的树（`PublicGroupTreeNode`）获取・操作系统。

```java
public PublicGroupTreeNode getTree(IPublicGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。公共组集合整体的树
public PublicGroupTreeNode getBranch(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 以指定公共组为起点的下层树（分支）
public PublicGroupTreeNode getUpBranch(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 上层方向的分支
public PublicGroupListNode[] getChildren(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 直属子节点
public PublicGroupListNode[] getParent(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 父节点
public PublicGroupListNode[] getIsolation(IPublicGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // 不存在于树上的孤立节点
public PublicGroupTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count、isDisable
public PublicGroupTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException;
```

也存在 `getAbsoluteBranch`/`getAbsoluteUpBranch`/`getAbsoluteChildren`/`getAbsoluteParent`/`getAbsoluteIsolation`（包含逻辑删除・无效数据在内的绝对位置版本）。

## 模型类

### `PublicGroup`

```java
package jp.co.intra_mart.foundation.master.public_group.model;

public class PublicGroup implements IPublicGroupElement, IPublicGroupBizKey, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupElement>, ITerm {
    private Locale defaultLocale;
    private boolean disable;
    private Date endDate;
    private final Map<Locale, IPublicGroupElement> localeElementMap; // 多语言名称
    private String publicGroupCd;
    private String publicGroupSetCd;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
    private Date startDate;
    private String termCd;
}
```

与 `Department` 相同，是具有复合主键（`publicGroupCd`/`publicGroupSetCd`）+ 期间管理（`ITerm`）+ 多语言名称（`IWithLocale`）的核心模型，构成层级结构（公共组树）。

### `PublicGroupSet`

```java
public class PublicGroupSet implements IPublicGroupSetBizKey, ISortable, IRecorder {
    private String publicGroupSetCd;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
}
```

### `PublicGroupCtg` / `PublicGroupCtgItm`

```java
public class PublicGroupCtg implements IPublicGroupCtgElement, IPublicGroupCtgBizKey, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupCtgElement> {
    private String categoryCd;
    private String categoryType;
    private Locale defaultLocale;
    private boolean disable;
    private final Map<Locale, IPublicGroupCtgElement> localeElementMap;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
}

public class PublicGroupCtgItm implements IPublicGroupCtgItmElement, IPublicGroupCtgItmBizKey, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupCtgItmElement> {
    private String categoryCd;
    private String categoryItemCd;
    private Locale defaultLocale;
    private boolean disable;
    private final Map<Locale, IPublicGroupCtgItmElement> localeElementMap;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
}
```

两者均不实现期间管理（`ITerm`）。

### `PublicGroupRole`

```java
public class PublicGroupRole implements IPublicGroupRoleBizKey, IPublicGroupRoleElement, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupRoleElement>, ITerm {
    private Locale defaultLocale;
    private boolean disable;
    private Date endDate;
    private final Map<Locale, IPublicGroupRoleElement> localeElementMap;
    private String publicGroupSetCd;
    private int rank;
    private Date recordDate;
    private String recordUserCd;
    private String roleCd;
    private int sortKey;
    private Date startDate;
    private String termCd;
}
```

### 业务主键接口・实现类

```java
public interface IPublicGroupBizKey {
    String getPublicGroupCd();
    String getPublicGroupSetCd();
    void setPublicGroupCd(String publicGroupCd);
    void setPublicGroupSetCd(String publicGroupSetCd);
}

public class PublicGroupBizKey implements IPublicGroupBizKey {
    // 无参构造函数 + setPublicGroupCd/setPublicGroupSetCd
}

public class PublicGroupRoleBizKey implements IPublicGroupRoleBizKey {
    private String publicGroupSetCd;
    private String roleCd;
    // 无参构造函数 + setPublicGroupSetCd/setRoleCd
}
```

`IPublicGroupSetBizKey`（仅 `publicGroupSetCd`）、`IPublicGroupCtgBizKey`（`categoryCd`）、`IPublicGroupCtgItmBizKey`（`categoryCd`/`categoryItemCd`）也以相同模式存在。

### `PublicGroupListNode` / `PublicGroupTreeNode`

```java
public class PublicGroupListNode implements ListNode, IPublicGroupBizKey {
    private String description = "";
    boolean disable;
    private String displayName = "";
    private String publicGroupCd;
    private String publicGroupSetCd;
    private String shortName = "";

    public String getDescription();
    public String getDisplayName();
    public String getPublicGroupCd();
    public String getPublicGroupSetCd();
    public boolean isDisable();
    public String getShortName();
}

public class PublicGroupTreeNode extends PublicGroupListNode implements TreeNode<PublicGroupTreeNode> {
    private List<PublicGroupTreeNode> childNodeList;

    public void addChild(PublicGroupTreeNode child);
    public PublicGroupTreeNode[] getChildren();
    public boolean hasChildren();
    public PublicGroupTreeNode removeChild(PublicGroupTreeNode child);
}
```

`PublicGroupRoleListNode`/`PublicGroupCtgListNode`/`PublicGroupCtgItmListNode`/`AttachPublicGroupListNode` 也同样存在，各自具有对应模型的业务主键・显示用字段（`description`/`displayName`/`shortName` 等）。

## 导入・导出

```java
public Set<String> getExportCategories(); // 无异常
public Set<String> getImportCategories(); // 无异常
public void exportData(String categoryName, InputStream inputStream) throws BizApiException; // 参数名为 inputStream，但用于导出处理（配置文件输入流）
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
