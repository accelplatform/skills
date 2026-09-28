# ItemCategoryManager API 参考手册（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.item_category.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## 类概要

```java
package jp.co.intra_mart.foundation.master.item_category;

/**
 * 品目分类管理器类。
 * 负责品目分类信息的操作、品目的归属操作、内包操作。
 */
public class ItemCategoryManager extends AbstractManager {
```

- **品目分类本体（`ItemCategory`）・品目分类集合（`ItemCategorySet`）・层级（树）・与品目（`Item`）的归属关系，均由此单一类处理。** 与 `CompanyManager` 的组织（`Department`/`DepartmentSet`）系方法组结构相同
- 通过扩展点（默认值 `jp.co.intra_mart.foundation.master.accessor.item_category`）将处理委托给插件实现（`ItemCategoryReader`/`ItemCategoryWriter`/`ItemCategoryListener`/`ItemCategoryImporter`/`ItemCategoryExporter`）
- **方法名中表示「品目分类」的部分记为 `Category`（而非 `ItemCategory`）。** 例如：`getCategory`/`setCategory`/`removeCategory`/`moveTermCategory`/`getCategorySet`/`setCategoryInclusion`。请注意这与类名 `ItemCategoryManager`・模型类名 `ItemCategory` 的表记方式不同

## 构造函数

| 签名 | 概要 |
|---|---|
| `public ItemCategoryManager() throws BizApiException` | **推荐。** 更新者用户代码・默认区域设置使用「当前登录用户」的值 |
| `public ItemCategoryManager(String updateUserCd) throws BizApiException` | 显式指定更新者用户代码 |
| `public ItemCategoryManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 同时显式指定更新者用户代码・默认区域设置 |
| `public ItemCategoryManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（请使用 `ItemCategoryManager()`） |

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（受检异常）。构造函数・CRUD・检索・树・期间操作系方法均一贯只声明此异常（仅 `getExportCategories()`/`getImportCategories()` 不声明异常）。

## 品目分类（`ItemCategory`）本体的方法

```java
public ItemCategory getCategory(IItemCategoryBizKey bizKey, Date termDate) throws BizApiException; // + Locale、isDisable 的组合重载

public ItemCategoryListNode[] listCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemCategoryListNode[] searchCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 与 listCategory 结构相同的独立方法组

public int countCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCategory(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 新建/更新（根据期间代码是否存在自动判定。与 CompanyManager 的 Department 相同的模式）
public ITerm[] setCategory(ItemCategory category) throws BizApiException;

public void removeCategory(IItemCategoryBizKey bizKey) throws BizApiException; // 删除所有语言
public void removeCategory(IItemCategoryBizKey bizKey, Locale locale) throws BizApiException; // 仅删除指定语言
public void removeCategory(Locale locale) throws BizApiException; // **`@Deprecated`**（请使用 `removeCategory(IItemCategoryBizKey, Locale)`）
```

`condition` 中可指定的表为 `ImmItemCategoryColumn`（`imm_item_category`）。

### 期间操作

```java
public ITerm[] moveTermCategory(IItemCategoryBizKey bizKey, ITerm moveTerm) throws BizApiException;
// separateTermCategory/mergeForwardTermCategory/mergeBackwardTermCategory 也以相同结构存在
```

### 品目分类内包（父子关系）操作

```java
public void setCategoryInclusion(IItemCategoryBizKey bizKey, String parentCategoryCd, String termCd) throws BizApiException;
public void removeCategoryInclusion(IItemCategoryBizKey bizKey, String termCd) throws BizApiException;
```

## 品目分类集合（`ItemCategorySet`）相关方法

`ItemCategorySet` 与 `Company`/`DepartmentSet` 相同，不含多语言名称字段。与 `CorporationGroupSet` 相同，也提供了限定公司的 `getCategorySetAll(String companyCd)`。

```java
public ItemCategorySet getCategorySet(IItemCategorySetBizKey bizKey) throws BizApiException;
public ItemCategorySet[] getCategorySetAll() throws BizApiException; // 获取所有公司・所有品目分类集合
public ItemCategorySet[] getCategorySetAll(String companyCd) throws BizApiException; // 仅获取属于指定公司的集合

public void updateCategorySet(ItemCategorySet categorySet) throws BizApiException; // 更新既有内容
public void removeCategorySet(IItemCategorySetBizKey bizKey) throws BizApiException;
```

## 树操作

提供了与 `Department`/`CorporationGroup` 的树操作结构相同的方法组。

```java
public ItemCategoryTreeNode getTree(IItemCategorySetBizKey bizKey, Date date, Locale locale) throws BizApiException; // 品目分类集合整体的树
public ItemCategoryTreeNode getAbsoluteTree(IItemCategorySetBizKey bizKey, Date date, Locale locale) throws BizApiException; // 包含逻辑删除・无效数据的绝对位置版

public ItemCategoryTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemCategoryTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException;

public ITerm getTreeTerm(IItemCategorySetBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getTreeTermList(IItemCategorySetBizKey bizKey) throws BizApiException; // + isDisable
```

`getBranch`/`getUpBranch`/`getChildren`/`getParent`/`getIsolation`（及各自的 `getAbsoluteXxx` 版）也以与 `Department`/`CorporationGroup` 相同的结构存在。

## 与品目（`Item`）的归属关系

管理品目分类与品目（`jp.co.intra_mart.foundation.master.item` 包的 `Item`）之间的关系。**并非如 `Department`⇔`User` 那样带期间管理的归属，而是以按分类单位・按树单位的交叉检索方法组为中心。**

```java
// 简单的归属交叉检索（分类⇔品目，双向）
public ItemListNode[] getItemWithCategory(IItemCategoryBizKey bizKey, ...) throws BizApiException;
public ItemCategoryListNode[] getCategoryWithItem(IItemBizKey bizKey, ...) throws BizApiException;

public ItemListNode[] listItemWithCategory(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemListNode[] searchItemWithCategory(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countItemWithCategory(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalItemWithCategory(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

public ItemCategoryListNode[] listCategoryWithItem(IItemBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemCategoryListNode[] searchCategoryWithItem(IItemBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCategoryWithItem(IItemBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCategoryWithItem(IItemBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 以树・上位树为对象范围的交叉检索（Tree/UpTree 各4个系列：list/search/count/total）
public ItemListNode[] listItemWithCategoryTree(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public ItemListNode[] listItemWithCategoryUpTree(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
// searchItemWithCategoryTree/UpTree、countItemWithCategoryTree/UpTree、totalItemWithCategoryTree/UpTree 也以相同结构存在
```

各系列均存在追加 `isDisable` 参数的重载。与 `PublicGroupManager` 的角色系交叉检索（`listUserWithPublicGroupRoleOnPublicGroup` 等）设计思路相同，`ItemCategoryManager` 中 `*WithCategory*`/`*WithItem*` 系方法占据了大半内容（`ItemCategoryManager.java` 单个文件超过 4,800 行）。各方法的完整签名请参照 `ItemCategoryManager.java`。

## `ItemCategory` 模型类

```java
package jp.co.intra_mart.foundation.master.item_category.model;

public class ItemCategory implements ISortable, IDisable, IWithLocale<IItemCategoryElement>, ITerm, IItemCategoryElement, IItemCategoryBizKey, IRecorder {
```

| 字段 | 概要 |
|---|---|
| `companyCd` / `itemCategorySetCd` / `itemCategoryCd` | 业务键（`IItemCategoryBizKey`。与 `Department` 相同结构的 3 要素复合键） |
| `defaultLocale` / `localeElementMap` | 多语言支持 |
| `sortKey` | 排序键 |
| `startDate` / `endDate` / `termCd` | 期间信息（`ITerm`） |
| `recordDate` / `recordUserCd` | 更新日期・更新者用户代码 |

国际化信息（`IItemCategoryElement`）：`itemCategoryName`（品目分类名称）、`itemCategorySearchName`（检索名称）、`itemCategoryShortName`（简称）、`notes`（备注）。

## `IItemCategoryBizKey` 接口

```java
package jp.co.intra_mart.foundation.master.item_category.model;

public interface IItemCategoryBizKey {
    String getCompanyCd();
    String getItemCategorySetCd();
    String getItemCategoryCd();
    void setCompanyCd(String companyCd);
    void setItemCategorySetCd(String itemCategorySetCd);
    void setItemCategoryCd(String itemCategoryCd);
}
```

`IItemCategorySetBizKey`（`companyCd`/`itemCategorySetCd`）也以相同模式存在。`ItemCategoryBizKey`/`ItemCategorySetBizKey` 为标准实现类。

## 导入・导出

```java
public Set<String> getExportCategories(); // 无异常
public Set<String> getImportCategories(); // 无异常
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
