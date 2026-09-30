# CurrencyManager API 参考手册（Java 版）

基于 `im_master-main` 模块（`jp.co.intra_mart.foundation.master.currency.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## 类概要

```java
package jp.co.intra_mart.foundation.master.currency;

public final class CurrencyManager extends AbstractManager {
```

**通货（`Currency`）・通货换算（`CurrencyConversion`）・通货精度（`CurrencyPrecision`）・通货汇率（`CurrencyRate`）这 4 种实体，均由此单一类处理。** 这 4 种均持有包含 `companyCd` 的业务键，是按公司限定范围的主数据。通过扩展点（默认值 `jp.co.intra_mart.foundation.master.accessor.currency`）将处理委托给插件实现（`CurrencyReader`/`CurrencyWriter`/`CurrencyListener`/`CurrencyImporter`/`CurrencyExporter`）。

- **`Currency`/`CurrencyConversion`/`CurrencyPrecision` 这 3 种不含期间管理（`ITerm`）。** `set*` 返回 `void`，是简单的 upsert（用一个方法同时完成新建与更新，但返回值不包含新期间信息）
- **仅 `CurrencyRate`（通货汇率）含期间管理（`ITerm`）。** `setCurrencyRate` 与 `User`/`Department` 相同，返回 `ITerm[]`，根据 `termCd` 是否存在自动判定新建/更新。这是因为汇率是「从何时到何时有效」的时间序列数据

## 构造函数

| 签名 | 概要 |
|---|---|
| `public CurrencyManager() throws BizApiException` | **推荐。** 更新者用户代码・默认区域设置使用「当前登录用户」的值 |
| `public CurrencyManager(String updateUserCd) throws BizApiException` | 显式指定更新者用户代码 |
| `public CurrencyManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 同时显式指定更新者用户代码・默认区域设置 |
| `public CurrencyManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（请使用 `CurrencyManager()`） |

## 异常

`jp.co.intra_mart.foundation.exception.BizApiException`（受检异常）。构造函数・CRUD・检索系方法均一贯只声明此异常（仅 `getExportCategories()`/`getImportCategories()` 不声明异常）。

## 通货（`Currency`）本体的方法

```java
public Currency getCurrency(ICurrencyBizKey bizKey) throws BizApiException; // + Locale、isDisable 的组合重载（共4种）

public CurrencyListNode[] listCurrency(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public CurrencyListNode[] searchCurrency(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // 与 listCurrency 结构相同的独立方法组

public int countCurrency(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalCurrency(AppCmnSearchCondition condition) throws BizApiException; // + isDisable

public void setCurrency(Currency currency) throws BizApiException; // 新建/更新（无期间管理。单纯的 upsert）

public void removeCurrency(ICurrencyBizKey bizKey) throws BizApiException; // 删除所有语言
public void removeCurrency(ICurrencyBizKey bizKey, Locale locale) throws BizApiException; // 仅删除指定语言
```

`condition` 中可指定的表为 `ImmCurrencyColumn`（`imm_currency`）。

## 通货换算（`CurrencyConversion`）相关方法

与 `Currency` 结构相同的 CRUD・检索模式。通货换算代码（`currencyConversionCd`）作为汇总多个通货汇率（`CurrencyRate`）的「换算表」标识符发挥作用。

```java
public CurrencyConversion getCurrencyConversion(ICurrencyConversionBizKey bizKey) throws BizApiException; // + Locale, isDisable

public CurrencyConversionListNode[] listCurrencyConversion(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public CurrencyConversionListNode[] searchCurrencyConversion(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countCurrencyConversion(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalCurrencyConversion(AppCmnSearchCondition condition) throws BizApiException; // + isDisable

public void setCurrencyConversion(CurrencyConversion currencyConversion) throws BizApiException; // 无期间管理。单纯的 upsert
public void removeCurrencyConversion(ICurrencyConversionBizKey bizKey) throws BizApiException; // + Locale 重载
```

`condition` 中可指定的表为 `ImmCurrencyConversionColumn`。

## 通货精度（`CurrencyPrecision`）相关方法

与 `Currency`/`CurrencyConversion` 结构相同的 CRUD・检索模式。处理每种通货的小数点位数・舍入规则等精度信息。

```java
public CurrencyPrecision getCurrencyPrecision(ICurrencyPrecisionBizKey bizKey) throws BizApiException; // + Locale, isDisable

public CurrencyPrecisionListNode[] listCurrencyPrecision(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public CurrencyPrecisionListNode[] searchCurrencyPrecision(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countCurrencyPrecision(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalCurrencyPrecision(AppCmnSearchCondition condition) throws BizApiException; // + isDisable

public void setCurrencyPrecision(CurrencyPrecision currencyPrecision) throws BizApiException; // 无期间管理。单纯的 upsert
public void removeCurrencyPrecision(ICurrencyPrecisionBizKey bizKey) throws BizApiException; // + Locale 重载
```

`condition` 中可指定的表为 `ImmCurrencyPrecisionColumn`。

## 通货汇率（`CurrencyRate`）相关方法

`CurrencyRate` 的业务键由 `companyCd`/`currencyConversionCd`/`currencyCd`/`baseCurrencyCd`（对方通货代码）4 个要素构成。在同一通货换算代码内，唯一确定「从哪种通货到哪种通货」的汇率。**是 4 种实体中唯一实现 `ITerm`（期间管理）的实体。**

```java
public CurrencyRate getCurrencyRate(ICurrencyRateBizKey bizKey, Date date) throws BizApiException; // + isDisable。不存在时不抛出异常，返回 null
public CurrencyRate[] getCurrencyRateList(ICurrencyRateBizKey bizKey) throws BizApiException; // 全部期间。+ isDisable

public ITerm getCurrencyRateTerm(ICurrencyRateBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCurrencyRateTermList(ICurrencyRateBizKey bizKey) throws BizApiException; // + isDisable

public CurrencyRateListNode[] listCurrencyRate(AppCmnSearchCondition condition, Date date, int start, int count) throws BizApiException; // + isDisable
// searchCurrencyRate/countCurrencyRate/totalCurrencyRate 也以相同结构存在

// 新建/更新（根据期间代码是否存在自动判定。与 User/Department 相同的模式）
public ITerm[] setCurrencyRate(CurrencyRate currencyRate) throws BizApiException;

public void removeCurrencyRate(ICurrencyRateBizKey bizKey) throws BizApiException;

// 期间操作
public ITerm[] moveTermCurrencyRate(ICurrencyRateBizKey bizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTermCurrencyRate(ICurrencyRateBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTermCurrencyRate(ICurrencyRateBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTermCurrencyRate(ICurrencyRateBizKey bizKey, String mergeTermCd) throws BizApiException;
```

`condition` 中可指定的表为 `ImmCurrencyRateColumn`（`imm_currency_rate`）。

### 复合检索 `getCurrencyRates`

可同时指定跨越通货・对方通货・通货换算・通货汇率 4 张表条件的、`CurrencyRate` 专用复合检索方法。结果以合并后的 `CurrencyRatesListNode[]`（将 4 张表的显示项汇总为一个节点的类）返回。

```java
public CurrencyRatesListNode[] getCurrencyRates(
        AppCmnSearchCondition currencyCondition,
        AppCmnSearchCondition baseCurrencyCondition,
        AppCmnSearchCondition currencyConversionCondition,
        AppCmnSearchCondition currencyRateCondition,
        Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
```

也存在省略 `start`/`count`/`isDisable` 的简化重载。

## 模型类的业务键

```java
package jp.co.intra_mart.foundation.master.currency.model;

public interface ICurrencyBizKey {
    String getCompanyCd();
    String getCurrencyCd();
    // setCompanyCd/setCurrencyCd
}

public interface ICurrencyConversionBizKey {
    String getCompanyCd();
    String getCurrencyConversionCd(); // 通货换算代码
    // setCompanyCd/setCurrencyConversionCd
}

public interface ICurrencyPrecisionBizKey {
    String getCompanyCd();
    String getCurrencyCd();
    String getCurrencyPrecisionType(); // 通货精度区分
    // setCompanyCd/setCurrencyCd/setCurrencyPrecisionType
}

public interface ICurrencyRateBizKey {
    String getCompanyCd();
    String getCurrencyConversionCd();
    String getCurrencyCd();
    String getBaseCurrencyCd(); // 对方通货代码
    // setCompanyCd/setCurrencyConversionCd/setCurrencyCd/setBaseCurrencyCd
}
```

`CurrencyBizKey`/`CurrencyConversionBizKey`/`CurrencyPrecisionBizKey`/`CurrencyRateBizKey` 分别为各自的标准实现类。

## `Currency` 模型类

```java
package jp.co.intra_mart.foundation.master.currency.model;

public class Currency implements ICurrencyBizKey, ISortable, IDisable, IRecorder, IWithLocale<ICurrencyElement>, ICurrencyElement {
    private String companyCd;
    private String currencyCd;
    private Locale defaultLocale;
    private final Map<Locale, ICurrencyElement> localeElementMap;
    private String currencyIsoCd = "";  // 通货 ISO 代码
    private String unitSign = "";       // 通货单位符号
    private boolean disable;
    private int sortKey;
    private String recordUserCd;
    private Date recordDate;
}
```

`Currency` 不实现 `ITerm`（不含期间管理）。国际化信息（`ICurrencyElement`）持有通货名称（`currencyName`）。

`CurrencyConversion`/`CurrencyPrecision` 同样是含 `companyCd` 的复合键 + 多语言名称的模型，不实现 `ITerm`。仅 `CurrencyRate` 额外持有 `startDate`/`endDate`/`termCd`（`ITerm`）。

## 导入・导出

```java
public Set<String> getExportCategories(); // 无异常
public Set<String> getImportCategories(); // 无异常
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
