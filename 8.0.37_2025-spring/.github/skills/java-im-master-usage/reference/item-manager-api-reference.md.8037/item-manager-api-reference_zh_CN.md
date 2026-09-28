# ItemManager API 参考手册（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.item.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

**与 `ItemCategoryManager`（品目分类，`jp.co.intra_mart.foundation.master.item_category`）为不同的类。** 品目本体的 CRUD 由本类负责，与品目分类的归属关系・分类层级由 `ItemCategoryManager` 负责。请参照 `reference/item-category-manager-api-reference.md`。

## 类概要

```java
package jp.co.intra_mart.foundation.master.item;

public final class ItemManager extends AbstractManager {
```

- 负责 IM-共通主数据（`im_master-main`）品目信息 CRUD・检索的管理器。继承 `AbstractManager`
- 通过扩展点（默认值 `jp.co.intra_mart.foundation.master.accessor.item`）将处理委托给插件实现（`ItemReader`/`ItemWriter`/`ItemListener`/`ItemImporter`/`ItemExporter`）
- **与 `CustomerManager` 设计相同。CRUD・检索系方法名为不含对象名称的通用名**（`get`/`set`/`remove`/`list`/`search`/`count`/`total`/`getTerm`/`moveTerm`/`separateTerm`/`mergeForwardTerm`/`mergeBackwardTerm`）。检索・列表・件数获取系以 `String companyCd` 为第一参数（品目是按公司限定范围的主数据）
- 不具备与品目分类的归属关系・层级（树）操作（该部分在 `ItemCategoryManager` 一侧实现）

## 构造函数

| 签名 | 概要 |
|---|---|
| `public ItemManager() throws BizApiException` | **推荐。** 更新者用户代码・默认区域设置使用「当前登录用户」的值 |
| `public ItemManager(String updateUserCd) throws BizApiException` | 显式指定更新者用户代码 |
| `public ItemManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 同时显式指定更新者用户代码・默认区域设置 |
| `public ItemManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（请使用 `ItemManager()`） |

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（受检异常）。构造函数・CRUD・检索系方法均一贯只声明此异常。

## 方法一览

```java
// 获取
public Item[] get(IItemBizKey bizKey) throws BizApiException; // 全部期间・全部区域设置
public Item[] get(IItemBizKey bizKey, boolean isDisable) throws BizApiException;
public Item get(IItemBizKey bizKey, Date termDate) throws BizApiException; // 指定基准日，单体。不存在时为 null
public Item[] get(IItemBizKey bizKey, Locale locale) throws BizApiException;
public Item get(IItemBizKey bizKey, Date termDate, Locale locale) throws BizApiException;

// 检索・列表・件数（均以 companyCd 为第一参数）
public ItemListNode[] search(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemListNode[] list(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException; // + isDisable
public int count(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int total(String companyCd, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 新建/更新（根据期间代码是否存在自动判定）
public ITerm[] set(Item item) throws BizApiException;

// 删除
public void remove(IItemBizKey bizKey) throws BizApiException;
public void remove(IItemBizKey bizKey, Locale locale) throws BizApiException;
public void remove(Locale locale) throws BizApiException; // 从所有品目中删除指定语言的数据

// 期间操作
public ITerm[] moveTerm(IItemBizKey bizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTerm(IItemBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTerm(IItemBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTerm(IItemBizKey bizKey, String mergeTermCd) throws BizApiException;
```

`condition` 中可指定的表为 `ImmItemColumn`（`imm_item`）。

## `Item` 模型类

```java
package jp.co.intra_mart.foundation.master.item.model;

public class Item implements IItemBizKey, ISortable, IDisable, IRecorder, IWithLocale<IItemElement>, ITerm, IItemElement {
```

| 字段 | 概要 |
|---|---|
| `companyCd` / `itemCd` | 业务键（`IItemBizKey`） |
| `defaultLocale` / `localeElementMap` | 多语言支持（`IWithLocale`） |
| `sortKey` | 排序键 |
| `startDate` / `endDate` / `termCd` | 期间信息（`ITerm`） |
| `recordDate` / `recordUserCd` | 更新日期・更新者用户代码 |

国际化信息（`IItemElement`）仅有 `itemName`（品目名称）、`itemSearchName`（品目检索名称）、`itemShortName`（品目简称）、`notes`（备注）4 项。与 `User`/`Corporation`/`Customer` 不同，本模型不含地址・电话号码等联系方式相关字段，是最小构成的模型。

## `IItemBizKey` 接口

```java
package jp.co.intra_mart.foundation.master.item.model;

public interface IItemBizKey {
    String getCompanyCd();
    String getItemCd();
    void setCompanyCd(String companyCd);
    void setItemCd(String itemCd);
}
```

业务键由 `companyCd`/`itemCd` 2 个要素构成。

## 导入・导出

```java
public Set<String> getImportCategories(); // 无异常
public Set<String> getExportCategories(); // 无异常
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
```
