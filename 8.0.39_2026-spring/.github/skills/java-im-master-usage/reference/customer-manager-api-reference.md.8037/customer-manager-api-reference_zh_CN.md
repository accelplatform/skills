# CustomerManager API 参考手册（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.customer.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## 类概要

```java
package jp.co.intra_mart.foundation.master.customer;

public final class CustomerManager extends AbstractManager {
```

- 负责 IM-共通主数据（`im_master-main`）取引方信息 CRUD・检索的管理器。继承 `AbstractManager`
- 通过扩展点（默认值 `jp.co.intra_mart.foundation.master.accessor.customer`）将处理委托给插件实现（`CustomerReader`/`CustomerWriter`/`CustomerListener`/`CustomerImporter`/`CustomerExporter`）
- 不具备分类・树・内包操作。仅处理取引方本体这一单一实体的简单结构
- **与其他类（`UserManager`/`CompanyManager` 等）不同，CRUD・检索系方法名为不含对象名称的通用名**（`get`/`set`/`remove`/`list`/`search`/`count`/`total`/`getTerm`/`moveTerm`/`separateTerm`/`mergeForwardTerm`/`mergeBackwardTerm`）。这是因为 `CustomerManager` 内处理的实体仅有 `Customer` 一种，无需在方法名中包含实体名称的设计
- **检索・列表・件数获取系方法，均以 `String companyCd`（检索对象公司代码）作为第一参数。** 取引方是按公司限定范围的主数据

## 构造函数

| 签名 | 概要 |
|---|---|
| `public CustomerManager() throws BizApiException` | **推荐。** 更新者用户代码・默认区域设置使用「当前登录用户」的值 |
| `public CustomerManager(String updateUserCd) throws BizApiException` | 显式指定更新者用户代码 |
| `public CustomerManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 同时显式指定更新者用户代码・默认区域设置 |
| `public CustomerManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（请使用 `CustomerManager()`） |

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（受检异常）。构造函数・CRUD・检索系方法均一贯只声明此异常（仅 `getExportCategories()`/`getImportCategories()` 不声明异常）。

## 方法一览

`get` 在对象不存在时，指定基准日的单体获取版返回 `null`，返回数组的版本则返回空数组。

```java
// 获取
public Customer[] get(ICustomerBizKey bizKey) throws BizApiException; // 全部期间・全部区域设置
public Customer[] get(ICustomerBizKey bizKey, boolean isDisable) throws BizApiException;
public Customer get(ICustomerBizKey bizKey, Date termDate) throws BizApiException; // 指定基准日，单体。不存在时为 null
public Customer get(ICustomerBizKey bizKey, Date termDate, boolean isDisable) throws BizApiException;
public Customer[] get(ICustomerBizKey bizKey, Locale locale) throws BizApiException; // 指定区域设置，全部期间
public Customer[] get(ICustomerBizKey bizKey, Locale locale, boolean isDisable) throws BizApiException;
public Customer get(ICustomerBizKey bizKey, Date termDate, Locale locale) throws BizApiException;
public Customer get(ICustomerBizKey bizKey, Date termDate, Locale locale, boolean isDisable) throws BizApiException;

// 获取期间信息
public ITerm getTerm(ICustomerBizKey bizKey, Date termDate) throws BizApiException;

// 检索・列表・件数（均以 companyCd 为第一参数）
public CustomerListNode[] search(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CustomerListNode[] list(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException; // + isDisable
public int count(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int total(String companyCd, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 新建/更新（根据期间代码是否存在自动判定）
public ITerm[] set(Customer customer) throws BizApiException;

// 删除
public void remove(ICustomerBizKey bizKey) throws BizApiException; // 删除全部期间
public void remove(Locale locale) throws BizApiException; // 从所有取引方中删除指定语言的数据。**`@Deprecated`**

// 期间操作
public ITerm separateTerm(ICustomerBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTerm(ICustomerBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTerm(ICustomerBizKey bizKey, String mergeTermCd) throws BizApiException;
```

`condition` 中可指定的表为 `ImmCustomerColumn`（`imm_customer`）。

## `Customer` 模型类

```java
package jp.co.intra_mart.foundation.master.customer.model;

public class Customer implements ICustomerBizKey, ISortable, IDisable, IWithLocale<ICustomerElement>, ITerm, ICustomerElement, IRecorder {
```

| 字段 | 概要 |
|---|---|
| `companyCd` / `customerCd` | 业务键（`ICustomerBizKey`） |
| `defaultLocale` / `localeElementMap` | 多语言支持（`IWithLocale`） |
| `sortKey` | 排序键 |
| `startDate` / `endDate` / `termCd` | 期间信息（`ITerm`） |
| `recordDate` / `recordUserCd` | 更新日期・更新者用户代码 |

国际化信息（`ICustomerElement`）：`customerName`（取引方名称）、`customerShortName`（取引方简称）、`customerSearchName`（取引方检索名称）、`corporateNumber`（取引方法人号码）、`chargePersonName`（负责人姓名。**`Corporation`/`User` 中没有的取引方特有字段**）、`countryCd`、`zipCode`、`address1`〜`address3`、`telephoneNumber`/`extensionNumber`/`faxNumber`/`extensionFaxNumber`、`emailAddress1`/`emailAddress2`、`url`、`notes`。

## `ICustomerBizKey` 接口

```java
package jp.co.intra_mart.foundation.master.customer.model;

public interface ICustomerBizKey {
    String getCompanyCd();
    String getCustomerCd();
    void setCompanyCd(String companyCd);
    void setCustomerCd(String customerCd);
}
```

业务键由 `companyCd`/`customerCd` 2 个要素构成。

## 导入・导出

```java
public Set<String> getImportCategories(); // 无异常
public Set<String> getExportCategories(); // 无异常
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
```
