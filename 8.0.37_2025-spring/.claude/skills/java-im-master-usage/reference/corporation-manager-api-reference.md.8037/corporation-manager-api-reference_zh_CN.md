# CorporationManager API 参考（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.corporation.*`）的实际类定义。不得凭记忆或推测补充方法・属性。

**与 `CorporationGroupManager`（法人分组，`jp.co.intra_mart.foundation.master.corporation_group`）是不同的类。** 请勿混淆。`Corporation`（法人）是与取引方（`Customer`）直接关联的独立主数据，并非法人分组下属的实体。

## 类概要

```java
package jp.co.intra_mart.foundation.master.corporation;

public final class CorporationManager extends AbstractManager {
```

- 负责 IM-通用主数据（`im_master-main`）中法人信息的 CRUD・检索的管理类。继承自 `AbstractManager`
- 通过扩展点（默认值 `jp.co.intra_mart.foundation.master.accessor.corporation`）将处理委托给插件实现（`CorporationReader`/`CorporationWriter`/`CorporationListener`/`CorporationImporter`/`CorporationExporter`）
- **与 `CorporationGroupManager`・`PublicGroupManager` 不同，不具备树操作・分类（类别）・内包（父子）操作。** 仅由法人本体的 CRUD・检索・期间操作，以及与取引方（`Customer`）的归属关系操作构成，结构简单

## 构造函数

| 签名 | 概要 |
|---|---|
| `public CorporationManager() throws BizApiException` | **推荐。** 更新者用户代码・默认区域设置使用「当前登录用户」的值 |
| `public CorporationManager(String updateUserCd) throws BizApiException` | 显式指定更新者用户代码 |
| `public CorporationManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 显式指定更新者用户代码・默认区域设置两者 |
| `public CorporationManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（应使用 `CorporationManager()`） |

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（受检异常）。构造函数・CRUD・检索系方法均一致仅声明该异常（仅 `getExportCategories()`/`getImportCategories()` 无异常声明）。

## 法人（`Corporation`）本体的方法

`getCorporation`（指定 `Date` 的版本）在目标不存在时不会抛出异常，而是返回 `null`。仅指定 `ICorporationBizKey`/`isDisable` 的版本则返回空数组。

```java
public Corporation[] getCorporation(ICorporationBizKey bizKey) throws BizApiException; // 全部期间・全部语言环境
public Corporation[] getCorporation(ICorporationBizKey bizKey, boolean isDisable) throws BizApiException;
public Corporation getCorporation(ICorporationBizKey bizKey, Date termDate) throws BizApiException; // 指定基准日，单条
public Corporation[] getCorporation(ICorporationBizKey bizKey, Locale locale) throws BizApiException; // 指定语言环境，全部期间
public Corporation getCorporation(ICorporationBizKey bizKey, Date termDate, Locale locale) throws BizApiException;

public CorporationListNode[] listCorporation(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationListNode[] searchCorporation(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 与 listCorporation 同型的另一系列

public int countCorporation(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporation(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。不含语言环境参数

// 新建／更新（根据期间代码是否存在自动判定。与 User/Department 相同的模式）
public ITerm[] setCorporation(Corporation corporation) throws BizApiException;

public void removeCorporation(ICorporationBizKey bizKey) throws BizApiException; // 删除全部语言
public void removeCorporation(ICorporationBizKey bizKey, Locale locale) throws BizApiException; // 仅删除指定语言
public void removeCorporation(Locale locale) throws BizApiException; // 从全部法人中删除指定语言的数据
```

`condition` 中可指定的表为 `ImmCorporationColumn`（`imm_corporation`）。

### 期间操作

```java
public ITerm getCorporationTerm(ICorporationBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCorporationTermList(ICorporationBizKey bizKey) throws BizApiException; // + isDisable

public ITerm[] moveTermCorporation(ICorporationBizKey bizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTermCorporation(ICorporationBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTermCorporation(ICorporationBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTermCorporation(ICorporationBizKey bizKey, String mergeTermCd) throws BizApiException;
```

## 与取引方（`Customer`）的归属关系

管理法人与取引方（`jp.co.intra_mart.foundation.master.customer` 包中的 `Customer`）之间带期间管理的多对多归属关系。没有专用的模型类，通过 `setCorporationAttach`/`removeCorporationAttach` 等方法操作。

```java
// 归属的赋予／更新（新建归属时不设置 termCd，更新时设置 termCd）
public ITerm[] setCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, ITerm term) throws BizApiException;

// 解除归属
public void removeCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey) throws BizApiException;

// 获取归属期间
public ITerm getCorporationAttachTerm(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, Date date) throws BizApiException;
public ITerm[] getCorporationAttachTermList(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey) throws BizApiException; // + isDisable

// 期间操作
public ITerm[] moveTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, String mergeTermCd) throws BizApiException;
```

### 相互检索（法人⇔取引方）

```java
// 该取引方所归属的法人一览
public CorporationListNode[] getCorporationWithCustomer(ICustomerBizKey bizKey, Date termDate, Locale locale) throws BizApiException; // + isDisable
public CorporationListNode[] searchCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationListNode[] listCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public int countCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 归属于该法人的取引方一览
public CustomerListNode[] getCustomerWithCorporation(ICorporationBizKey bizKey, Date termDate, Locale locale) throws BizApiException; // + isDisable
public CustomerListNode[] searchCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CustomerListNode[] listCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public int countCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable
```

## `Corporation` 模型类

```java
package jp.co.intra_mart.foundation.master.corporation.model;

public class Corporation implements ICorporationBizKey, ISortable, IDisable, IRecorder, IWithLocale<ICorporationElement>, ITerm, ICorporationElement {
```

| 字段 | 概要 |
|---|---|
| `companyCd` / `corporationCd` | 业务键（`ICorporationBizKey`） |
| `defaultLocale` / `localeElementMap` | 多语言支持（`IWithLocale`） |
| `disable` | 删除标志 |
| `sortKey` | 排序键 |
| `startDate` / `endDate` / `termCd` | 期间信息（`ITerm`） |
| `recordDate` / `recordUserCd` | 更新日期・更新者用户代码（`IRecorder`） |

国际化信息（`ICorporationElement`）：`corporationName`（法人名称）、`corporationShortName`（法人简称）、`corporationSearchName`（法人检索名称）、`corporateNumber`（法人番号，`@CorporateNumberValidation`）、`countryCd`（国家代码）、`zipCode`（邮政编码）、`address1`〜`address3`（地址）、`telephoneNumber`/`extensionNumber`/`faxNumber`/`extensionFaxNumber`（电话・传真号码）、`emailAddress1`/`emailAddress2`（邮箱地址）、`url`、`notes`（备注）。与 `User`/`Customer` 的国际化信息几乎同型。

使用 `createLocaleElement()`/`putLocaleElement(Locale, ICorporationElement)` 的注册步骤与 `User` 相同（参见 `assets/user-master-basic-usage.md` 模式 3）。

## `ICorporationBizKey` 接口

```java
package jp.co.intra_mart.foundation.master.corporation.model;

public interface ICorporationBizKey {
    String getCompanyCd();
    String getCorporationCd();
    void setCompanyCd(String companyCd);
    void setCorporationCd(String corporationCd);
}
```

业务键由 `companyCd`/`corporationCd` 两个要素构成。`CorporationBizKey` 为标准实现（轻量的双字段实现类）。

## `CorporationListNode`

```java
package jp.co.intra_mart.foundation.master.corporation.model;

public class CorporationListNode implements ListNode, ICorporationBizKey {
    // 持有 displayName / description / shortName / deleteFlag
    public String getDescription();
    public String getDisplayName();
    public String getShortName();
}
```

## 导入・导出

```java
public Set<String> getExportCategories(); // 无异常
public Set<String> getImportCategories(); // 无异常
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
