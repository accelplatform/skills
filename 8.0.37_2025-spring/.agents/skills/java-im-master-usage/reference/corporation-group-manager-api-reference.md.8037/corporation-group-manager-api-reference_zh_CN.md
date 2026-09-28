# CorporationGroupManager API 参考手册（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.corporation_group.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## 类概要

```java
package jp.co.intra_mart.foundation.master.corporation_group;

/**
 * 负责获取与管理法人组信息的管理器类
 * @since 8.0
 */
public class CorporationGroupManager extends AbstractManager {
```

- 负责 IM-共通主数据（`im_master-main`）法人组信息的 CRUD・检索・树操作的管理器。继承 `AbstractManager`（持有更新者用户代码・默认区域设置・登录组 ID 的通用基类）
- 内部持有扩展点（`jp.co.intra_mart.foundation.master.accessor.corporation_group`），实际的读取/写入/通知/导入/导出委托给插件实现（`CorporationGroupReader`/`CorporationGroupWriter`/`CorporationGroupListener`/`CorporationGroupImporter`/`CorporationGroupExporter`）
- API 的整体结构（法人组本体・法人组集合・树・期间操作・与法人的关联）与 `CompanyManager` 的组织（`Department`）系方法组几乎相同结构。决定性的差异在于，法人组的业务键包含公司代码（`companyCd`）在内的 3 要素（`companyCd`/`corporationGroupSetCd`/`corporationGroupCd`）

## 构造函数

| 签名 | 概要 |
|---|---|
| `public CorporationGroupManager() throws BizApiException` | **推荐。** 更新者用户代码・默认区域设置使用「当前登录用户」的值 |
| `public CorporationGroupManager(String updateUserCd) throws BizApiException` | 显式指定更新者用户代码。默认区域设置为当前登录用户的区域设置 |
| `public CorporationGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 同时显式指定更新者用户代码・默认区域设置 |
| `public CorporationGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（请使用 `CorporationGroupManager()`） |

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（受检异常）。构造函数・CRUD・检索・树・期间操作系方法均一贯只声明此异常（仅 `getExportCategories()`/`getImportCategories()` 不声明异常）。

## 法人组（`CorporationGroup`）本体的方法

`getCorporationGroup` 在对象不存在时不抛出异常，而是返回 `null`。

```java
public CorporationGroup getCorporationGroup(ICorporationGroupBizKey bizKey, Date date) throws BizApiException; // + Locale、isDisable 的组合共4种重载
public CorporationGroup[] getCorporationGroupList(ICorporationGroupBizKey bizKey) throws BizApiException; // 获取目标法人组的全部期间。+ Locale、isDisable 的组合共4种重载

public CorporationGroupListNode[] listCorporationGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationGroupListNode[] searchCorporationGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 与 listCorporationGroup 结构相同的独立方法组

public int countCorporationGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationGroup(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。不指定 locale

// 新建/更新（根据期间代码是否存在自动判定。与 CompanyManager 的 Department 相同的模式）
// 新建时（未设置 termCd 时）startDate/endDate 为必须项（未设置将抛出 BizApiException）
// 内部经由 AppCmnValidationManager.validateModel 的模型验证与 convertTerm，
// 结果为空时调用 CorporationGroupListener#updateCorporationGroup，有结果时则组装新期间的 CorporationGroup 并返回
public ITerm[] setCorporationGroup(CorporationGroup corporationGroup) throws BizApiException;

public void removeCorporationGroup(ICorporationGroupBizKey bizKey) throws BizApiException; // 删除所有语言
public void removeCorporationGroup(ICorporationGroupBizKey bizKey, Locale locale) throws BizApiException; // 仅删除指定语言
```

### 期间获取

```java
public ITerm getCorporationGroupTerm(ICorporationGroupBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCorporationGroupTermList(ICorporationGroupBizKey bizKey) throws BizApiException; // + isDisable
```

## 法人组集合（`CorporationGroupSet`）相关方法

`CorporationGroupSet` 与 `Company`/`DepartmentSet` 相同，不含多语言名称字段，也未实现 `ITerm`。不存在与 `updateCorporationGroupSet` 相当的新建方法名，取而代之的是同时提供了 `changeCorporationGroupSetState`（更新法人组内包的删除标志）与 `updateCorporationGroupSet`（本体更新）。

```java
public CorporationGroupSet getCorporationGroupSet(ICorporationGroupSetBizKey bizKey) throws BizApiException;

// 2 种重载。根据参数有无，获取范围不同
public CorporationGroupSet[] getCorporationGroupSetAll() throws BizApiException; // 获取所有公司・所有法人组集合
public CorporationGroupSet[] getCorporationGroupSetAll(String companyCd) throws BizApiException; // 仅获取属于指定公司代码的法人组集合

public void updateCorporationGroupSet(CorporationGroupSet corporationGroupSet) throws BizApiException; // 更新既有的法人组集合
public void removeCorporationGroupSet(ICorporationGroupSetBizKey bizKey) throws BizApiException;

// 更新法人组内包（父子关系）的删除标志。调用 CorporationGroupListener#updateCorporationGroupSetTerm
public void changeCorporationGroupSetState(ICorporationGroupSetBizKey bizKey, String termCd, boolean disable) throws BizApiException;
```

### 法人组内包（父子关系）操作

```java
public void setCorporationGroupInclusion(ICorporationGroupBizKey bizKey, String parentCorporationGroupCd, String termCd) throws BizApiException;
public void removeCorporationGroupInclusion(ICorporationGroupBizKey bizKey, String termCd) throws BizApiException;
```

## 树操作相关

提供了与 `Department` 的树操作结构相同的方法组。

```java
public CorporationGroupTreeNode getTree(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。法人组集合整体的树
public CorporationGroupTreeNode getBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 以指定法人组为起点的下位树（分支）
public CorporationGroupTreeNode getUpBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 上位方向的分支

public CorporationGroupListNode[] getChildren(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 直属子法人组
public CorporationGroupListNode[] getParent(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 父法人组
public CorporationGroupListNode[] getIsolation(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // 不存在于法人组树上的孤立节点

public CorporationGroupTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationGroupTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 包含逻辑删除・无效数据的绝对位置版（存在 isDisable 重载）
public CorporationGroupTreeNode getAbsoluteBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupTreeNode getAbsoluteTree(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupTreeNode getAbsoluteUpBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupListNode[] getAbsoluteChildren(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupListNode[] getAbsoluteParent(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupListNode[] getAbsoluteIsolation(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException;

// 从列表节点数组组装完整路径（含祖先的列表节点序列）的工具方法
public CorporationGroupListNode[] getFullPathListNode(CorporationGroupListNode[] listNodes, Date date, Locale locale) throws BizApiException;
```

## 与法人（`Corporation`）的关联方法

管理法人组与法人（`jp.co.intra_mart.foundation.master.corporation` 包的 `Corporation`）之间多对多的归属关系（含期间管理）。没有专用的模型类，通过 `setCorporationAttach`/`removeCorporationAttach` 等方法进行操作。

```java
// 授予/更新归属
public ITerm[] setCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, ITerm term) throws BizApiException;

// 解除归属
public void removeCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey) throws BizApiException;

// 获取归属期间
public ITerm getCorporationAttachTerm(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, Date date) throws BizApiException;
public ITerm[] getCorporationAttachTermList(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey) throws BizApiException; // + isDisable
```

### 检索归属于法人组的法人

```java
public CorporationListNode[] listCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationListNode[] searchCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable
```

同时存在上位树・下位树版（`*WithCorporationGroupTree`/`*WithCorporationGroupUpTree`，各自的 list/search/count/total）也是相同结构。

### 检索法人组所属法人组集合下的法人

```java
public CorporationGroupListNode[] listCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationGroupListNode[] searchCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable
```

## 期间操作（`CorporationGroup`/`CorporationGroupSet`/法人关联 共通模式）

与 `CompanyManager` 的 `mergeBackwardTermDepartment`/`mergeForwardTermDepartment`/`moveTermDepartment`/`separateTermDepartment` 相同设计思路的期间操作方法，分别存在于 `CorporationGroup`・`CorporationGroupSet`・法人关联（`CorporationAttach`）。

```java
public void mergeBackwardTermCorporationGroup(ICorporationGroupBizKey bizKey, String termCd) throws BizApiException;
public void mergeForwardTermCorporationGroup(ICorporationGroupBizKey bizKey, String termCd) throws BizApiException;
public ITerm[] moveTermCorporationGroup(ICorporationGroupBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCorporationGroup(ICorporationGroupBizKey bizKey, String termCd, Date date) throws BizApiException;

public void mergeBackwardTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, String termCd) throws BizApiException;
public void mergeForwardTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, String termCd) throws BizApiException;
public ITerm[] moveTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, String termCd, Date date) throws BizApiException;

public void mergeBackwardTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, String termCd) throws BizApiException;
public void mergeForwardTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, String termCd) throws BizApiException;
public ITerm[] moveTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, ITerm term) throws BizApiException;
public ITerm separateTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, String termCd, Date date) throws BizApiException;
```

同时存在 `getTreeTerm`/`getTreeTermList`，但这些方法操作・获取的并非 `CorporationGroupSet` 实体自身的期间，而是**该法人组集合所拥有的法人组树（`getTree` 返回的结构）的期间**（注意 `CorporationGroupSet` 模型本身并未实现 `ITerm`）。

```java
public ITerm getTreeTerm(ICorporationGroupSetBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getTreeTermList(ICorporationGroupSetBizKey bizKey) throws BizApiException; // + isDisable
```

## 模型类

### `CorporationGroup`（相当于 `CompanyManager` 的 `Department`）

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

/**
 * 处理法人组信息的模型类
 * @since 8.0
 */
public class CorporationGroup implements ICorporationGroupBizKey, ISortable, IDisable, IRecorder,
        IWithLocale<ICorporationGroupElement>, ITerm, ICorporationGroupElement {
    private String companyCd;             // 公司代码（Department 中没有，法人组特有的字段）
    private String corporationGroupCd;    // 法人组代码
    private String corporationGroupSetCd; // 法人组集合代码
    private Locale defaultLocale;         // 默认区域设置
    private boolean disable;              // 删除标志
    private Date endDate;                 // 结束日期
    private final Map<Locale, ICorporationGroupElement> localeElementMap; // 国际化信息映射
    private Date recordDate;              // 更新日期
    private String recordUserCd;          // 更新用户代码
    private int sortKey;                  // 排序键
    private Date startDate;               // 开始日期
    private String termCd;                // 期间代码
}
```

与 `Department` 相同，实现 `ITerm`（期间管理）・`IWithLocale`（多语言支持，`ICorporationGroupElement` 持有法人组名称・法人组检索名称・法人组简称・备注）的复合键 + 期间管理模型，唯一的差异是持有 `companyCd`。`companyCd`/`corporationGroupCd`/`corporationGroupSetCd` 各 getter 均附加了 `@NotNullValidation`/`@LengthValidation`/`@CodeValidation`。

### `ICorporationGroupBizKey` / `CorporationGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

public interface ICorporationGroupBizKey {
    String getCompanyCd();             // 公司代码
    String getCorporationGroupCd();    // 法人组代码
    String getCorporationGroupSetCd(); // 法人组集合代码
    void setCompanyCd(String companyCd);
    void setCorporationGroupCd(String corporationGrpCd);
    void setCorporationGroupSetCd(String corporationGrpSetCd);
}
```

法人组的业务键由 `companyCd`/`corporationGroupSetCd`/`corporationGroupCd` 3 要素构成。与 `CompanyManager` 的 `IDepartmentBizKey`（`companyCd`/`departmentSetCd`/`departmentCd`）结构相同，但包・类名被单独划分为法人组专用。`CorporationGroupBizKey` 是 `ICorporationGroupBizKey` 的标准实现（仅有 3 个字段 + getter/setter）。

### `CorporationGroupListNode`

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

public class CorporationGroupListNode implements ListNode, ICorporationGroupBizKey {
    private String companyCd;             // 公司代码
    private String corporationGroupCd;    // 法人组代码
    private String corporationGroupSetCd; // 法人组集合代码
    private String description = "";      // 描述名称
    private boolean disable;              // 删除标志
    private String displayName = "";      // 显示名称
    private String shortName = "";        // 简称
}
```

拥有 `getCorporationGroupCd()`/`getCorporationGroupSetCd()`/`getCompanyCd()`/`getDescription()`/`getDisplayName()`/`getShortName()`/`isDisable()`。相当于在 `CompanyManager` 的 `DepartmentListNode` 基础上追加了 `companyCd` 的构成。

### `CorporationGroupSet`

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

public class CorporationGroupSet implements ICorporationGroupSetBizKey, ISortable, IRecorder {
    private String companyCd;             // 公司代码
    private String corporationGroupSetCd; // 法人组集合代码
    private Date recordDate;              // 更新日期
    private String recordUserCd;          // 更新用户代码
    private int sortKey;                  // 排序键
}
```

与 `Company`/`DepartmentSet` 相同，不含多语言名称字段，也未实现 `ITerm`。仅以 `companyCd`/`corporationGroupSetCd` 确定法人组集合。

## 导入・导出

```java
public Set<String> getExportCategories(); // 无异常
public Set<String> getImportCategories(); // 无异常
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
