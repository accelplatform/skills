# CompanyGroupManager API 参考手册（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.company_group.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## 类概要

```java
package jp.co.intra_mart.foundation.master.company_group;

/**
 * 负责获取与管理公司组信息的管理器类
 * @since 7.2
 */
public class CompanyGroupManager extends AbstractManager {
```

- 负责 IM-共通主数据（`im_master-main`）中公司组信息的 CRUD・检索・层级（树）操作的管理器。继承 `AbstractManager`（保存更新者用户代码・默认区域设置・登录组 ID 的公共基类）
- 内部持有扩展点（`jp.co.intra_mart.foundation.master.accessor.company_group`），将实际的读取/写入/通知/导入/导出委托给插件实现（`CompanyGroupReader`/`CompanyGroupWriter`/`CompanyGroupListener`/`CompanyGroupImporter`/`CompanyGroupExporter`）
- 与 `Department`（`CompanyManager`）设计相同，公司组（`CompanyGroup`）在公司组集合（`CompanyGroupSet`）之下构成树结构，具有期间管理（`termCd`/`startDate`/`endDate`）・多语言名称（`localeElementMap`）
- 与 `Department` 的不同之处在于，树节点关联的不是组织而是「公司（`Company`）」。公司组与公司的关联通过 `CompanyAttach`（无专用模型类，通过 `setCompanyAttach`/`removeCompanyAttach` 系方法操作）来管理
- 不存在与 `changeExecutor` 相当的扩展点切换方法（`CompanyManager` 有，但 `CompanyGroupManager` 没有）

## 构造函数

| 签名 | 概要 |
|---|---|
| `public CompanyGroupManager() throws BizApiException` | **推荐。** 更新者用户代码・默认区域设置使用「当前登录用户」的值 |
| `public CompanyGroupManager(String updateUserCd) throws BizApiException` | 显式指定更新者用户代码。默认区域设置为当前登录用户的区域设置 |
| `public CompanyGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 同时显式指定更新者用户代码・默认区域设置 |
| `public CompanyGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（请使用 `CompanyGroupManager()`） |

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（受检异常）。构造函数・public 方法几乎全部声明 `throws BizApiException`（仅 `getExportCategories()`/`getImportCategories()` 不声明异常）。

## 公司组（`CompanyGroup`）相关方法

`getCompanyGroup` 系方法在目标不存在时，不抛出异常而是返回 `null`。

```java
public CompanyGroup getCompanyGroup(ICompanyGroupBizKey bizKey, Date date) throws BizApiException; // 存在 Locale, isDisable 重载组合（共 4 种）。不存在时返回 null
public CompanyGroup[] getCompanyGroupList(ICompanyGroupBizKey bizKey) throws BizApiException; // 获取全部期间・全部语言中仅有效的数据（+ Locale, isDisable 重载）

public CompanyGroupListNode[] listCompanyGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable 重载
public CompanyGroupListNode[] searchCompanyGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 与 listCompanyGroup 结构相同的独立方法组

public int countCompanyGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCompanyGroup(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。不指定 locale（覆盖所有语言）

// 新建/更新（根据期间代码是否存在自动判定。与 Department/CompanyPost 相同的模式）
public ITerm[] setCompanyGroup(CompanyGroup companyGroup) throws BizApiException;

public void removeCompanyGroup(ICompanyGroupBizKey bizKey) throws BizApiException; // 删除所有语言
public void removeCompanyGroup(ICompanyGroupBizKey bizKey, Locale locale) throws BizApiException; // 仅指定语言
public void removeCompanyGroup(Locale locale) throws BizApiException; // 从所有公司组中删除指定语言的数据
```

`setCompanyGroup` 的 JavaDoc：「针对作为参数给出的公司组信息，若未指定期间代码，则新建注册公司组信息；若指定了期间代码，则更新公司组信息。若公司组集合代码与公司组代码相同，则会同时创建公司组集合与公司组。添加公司组时，需先创建集合，再向创建好的公司组集合中添加组。此方法无法更新期间。」返回值为已注册的期间信息（`ITerm[]`），返回值非空时为新建注册（触发 `CompanyGroupListener#createCompanyGroup`），为空时为更新（触发 `CompanyGroupListener#updateCompanyGroup`）。

### 公司组内包（父子关系）操作

```java
public void setCompanyGroupInclusion(ICompanyGroupBizKey bizKey, String parentCompanyGroupCd, String termCd) throws BizApiException; // 创建与上级组的内包信息
public void removeCompanyGroupInclusion(ICompanyGroupBizKey bizKey, String termCd) throws BizApiException;
```

### 列表节点的整形

```java
public CompanyGroupListNode[] getFullPathListNode(CompanyGroupListNode[] listNodes, Date date, Locale locale) throws BizApiException;
```

将公司组列表节点的描述名替换为包含公司组树层级结构的名称。不会修改参数中的节点，而是返回新创建的实例数组。

## 公司组集合（`CompanyGroupSet`）相关方法

`CompanyGroupSet` 未实现 `ITerm`（不具有期间）。`getCompanyGroupSetAll`/`getCompanyGroupSet` 没有对应的新建方法，`updateCompanyGroupSet` 是针对既有记录的更新用方法（与 `CompanyManager#updateDepartmentSet` 相同的模式）。

```java
public CompanyGroupSet getCompanyGroupSet(ICompanyGroupSetBizKey bizKey) throws BizApiException;
public CompanyGroupSet[] getCompanyGroupSetAll() throws BizApiException;

public void updateCompanyGroupSet(CompanyGroupSet companyGroupSet) throws BizApiException;
public void removeCompanyGroupSet(ICompanyGroupSetBizKey bizKey) throws BizApiException;
```

`changeCompanyGroupSetState(ICompanyGroupSetBizKey bizKey, String termCd, boolean disable)` 并非针对公司组集合本身的方法，而是更新该集合所持有的公司组树的内包（期间）数据的删除标志的方法（触发 `CompanyGroupListener#updateCompanyGroupSetTerm`）。

## 树操作相关方法

```java
public CompanyGroupTreeNode getTree(ICompanyGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。公司组集合整体的树
public CompanyGroupTreeNode getBranch(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。以指定公司组为起点的下位树（分支）
public CompanyGroupTreeNode getUpBranch(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。以指定公司组为起点向上方向的获取
public CompanyGroupListNode[] getChildren(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。直属下级公司组
public CompanyGroupListNode[] getParent(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。上级公司组
public CompanyGroupListNode[] getIsolation(ICompanyGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。不存在于树上的孤立节点
public CompanyGroupTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable。树的根节点一览
public CompanyGroupTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 与 listTreeRoot 结构相同的独立方法组

public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。不指定 locale
```

同时存在包含逻辑删除・无效数据的绝对位置版 `getAbsoluteChildren`/`getAbsoluteParent`/`getAbsoluteIsolation`/`getAbsoluteBranch`/`getAbsoluteUpBranch`/`getAbsoluteTree`（均与上述对应方法的参数模式相同，且存在 `isDisable` 重载）。`CompanyGroupTreeNode` 继承 `CompanyGroupListNode`，具有 `addChild`/`getChildren`/`hasChildren`/`removeChild`。

## 与公司（`Company`）关联的方法

公司组与公司的关联通过 `CompanyAttach`（无专用模型类）来管理。

```java
// 关联（含期间管理）
public ITerm[] setCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, ITerm term) throws BizApiException;
public void removeCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey) throws BizApiException;

// 获取关联期间
public ITerm getCompanyAttachTerm(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, Date date) throws BizApiException;
public ITerm[] getCompanyAttachTermList(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey) throws BizApiException; // + isDisable
```

同时存在归属于公司组的公司的一览・检索（`listCompanyWithCompanyGroup`/`searchCompanyWithCompanyGroup`、树下位版 `*WithCompanyGroupTree`、上位树版 `*WithCompanyGroupUpTree`，均含 `count*`/`total*` 结构相同的系列），以及反方向（归属于公司的公司组的一览・检索：`listCompanyGroupWithCompany`/`searchCompanyGroupWithCompany`/`countCompanyGroupWithCompany`/`totalCompanyGroupWithCompany`）。返回值均为 `CompanyListNode[]` 或 `CompanyGroupListNode[]`（`CompanyGroupListNode` 自身的字段定义请参见本文件末尾）。

## 期间操作

与 `Department`/`CompanyPost`/`UserAttach` 相同设计思路的期间操作方法，分别存在于公司组本体・公司组集合的树・与公司的关联（`CompanyAttach`）中。

```java
// 公司组本体
public ITerm getCompanyGroupTerm(ICompanyGroupBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCompanyGroupTermList(ICompanyGroupBizKey bizKey) throws BizApiException; // + isDisable
public ITerm[] moveTermCompanyGroup(ICompanyGroupBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCompanyGroup(ICompanyGroupBizKey bizKey, String termCd, Date date) throws BizApiException;
public void mergeForwardTermCompanyGroup(ICompanyGroupBizKey bizKey, String termCd) throws BizApiException;
public void mergeBackwardTermCompanyGroup(ICompanyGroupBizKey bizKey, String termCd) throws BizApiException;

// 公司组集合所持有的树的期间（CompanyGroupSet 模型本身未实现 ITerm）
public ITerm getTreeTerm(ICompanyGroupSetBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getTreeTermList(ICompanyGroupSetBizKey bizKey) throws BizApiException; // + isDisable
public ITerm[] moveTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, String termCd, Date date) throws BizApiException;
public void mergeForwardTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, String termCd) throws BizApiException;
public void mergeBackwardTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, String termCd) throws BizApiException;

// 与公司的关联（CompanyAttach）
public ITerm[] moveTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, ITerm term) throws BizApiException;
public ITerm separateTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, String termCd, Date date) throws BizApiException;
public void mergeForwardTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, String termCd) throws BizApiException;
public void mergeBackwardTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, String termCd) throws BizApiException;
```

## 模型类

### `CompanyGroup`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public class CompanyGroup implements ICompanyGroupBizKey, ISortable, IDisable, IRecorder,
        IWithLocale<ICompanyGroupElement>, ITerm, ICompanyGroupElement {
```

| 字段 | 类型 | 概要 |
|---|---|---|
| `companyGroupCd` | `String` | 公司组代码（`ICompanyGroupBizKey`，必须） |
| `companyGroupSetCd` | `String` | 公司组集合代码（`ICompanyGroupBizKey`，必须） |
| `defaultLocale` | `Locale` | 默认区域设置 |
| `disable` | `boolean` | 删除标志（`IDisable`） |
| `startDate` / `endDate` / `termCd` | `Date` / `Date` / `String` | 期间（`ITerm`） |
| `localeElementMap` | `Map<Locale, ICompanyGroupElement>` | 按区域设置划分的国际化信息（`IWithLocale`）。通过 `createLocaleElement()` 生成新实例（`CompanyGroupElement`） |
| `recordDate` / `recordUserCd` | `Date` / `String` | 更新日期・更新者用户代码（`IRecorder`） |
| `sortKey` | `int` | 排序键（`ISortable`） |

与 `Department` 相同，是同时持有期间・多语言名称的核心模型。

### `CompanyGroupSet`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public class CompanyGroupSet implements ICompanyGroupSetBizKey, ISortable, IRecorder {
```

仅持有 `companyGroupSetCd`/`recordDate`/`recordUserCd`/`sortKey` 的轻量模型。未实现期间（`ITerm`）・多语言名称（`IWithLocale`）。

### `CompanyGroupListNode` / `CompanyGroupTreeNode`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public class CompanyGroupListNode implements ListNode, ICompanyGroupBizKey {
```

| 字段 | 类型 | 概要 |
|---|---|---|
| `companyGroupCd` | `String` | 公司组代码 |
| `companyGroupSetCd` | `String` | 公司组集合代码 |
| `description` | `String`（默认 `""`） | 描述名 |
| `disable` | `boolean` | 删除标志 |
| `displayName` | `String`（默认 `""`） | 显示名 |
| `shortName` | `String`（默认 `""`） | 简称 |

`CompanyGroupTreeNode extends CompanyGroupListNode implements TreeNode<CompanyGroupTreeNode>` 在上述字段基础上还持有 `childNodeList`（`List<CompanyGroupTreeNode>`），通过 `addChild`/`getChildren`/`hasChildren`/`removeChild` 操作树结构。

### `ICompanyGroupBizKey` / `CompanyGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public interface ICompanyGroupBizKey {
    String getCompanyGroupCd();    // @NotNullValidation @LengthValidation(min=1)
    void setCompanyGroupCd(String companyGrpCd);
    String getCompanyGroupSetCd(); // @NotNullValidation @LengthValidation(min=1)
    void setCompanyGroupSetCd(String companyGrpSetCd);
}
```

以公司组代码与公司组集合代码的组合作为业务键。由于 `CompanyGroup`/`CompanyGroupListNode` 均实现了该接口，因此可以将这些实例直接作为 `ICompanyGroupBizKey` 参数传递。`CompanyGroupBizKey implements ICompanyGroupBizKey` 是仅持有业务键的轻量实现类，用于不需要组装完整 `CompanyGroup` 的场景。

## 导入・导出

```java
public Set<String> getExportCategories(); // 无异常
public Set<String> getImportCategories(); // 无异常
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
