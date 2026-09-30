# CurrencyManager API Reference (Java)

Based on the actual class definitions in the `im_master-main` module (`jp.co.intra_mart.foundation.master.currency.*`). Do not supplement methods or attributes from memory or guesswork.

## Class Overview

```java
package jp.co.intra_mart.foundation.master.currency;

public final class CurrencyManager extends AbstractManager {
```

**This single class handles four entity types: currency (`Currency`), currency conversion (`CurrencyConversion`), currency precision (`CurrencyPrecision`), and currency rate (`CurrencyRate`).** All four have a business key that includes `companyCd`, making them master entities scoped per company. Delegates to plugin implementations (`CurrencyReader`/`CurrencyWriter`/`CurrencyListener`/`CurrencyImporter`/`CurrencyExporter`) via an extension point (default: `jp.co.intra_mart.foundation.master.accessor.currency`).

- **`Currency`/`CurrencyConversion`/`CurrencyPrecision` do not have term management (`ITerm`).** Their `set*` methods return `void`, a simple upsert (a single method handles both create and update, but the return value carries no new-term information)
- **Only `CurrencyRate` (currency rate) has term management (`ITerm`).** Like `User`/`Department`, `setCurrencyRate` returns `ITerm[]` and auto-decides create vs. update based on whether `termCd` is set. This is because an exchange rate is time-series data — a value that is "valid from when to when"

## Constructors

| Signature | Description |
|---|---|
| `public CurrencyManager() throws BizApiException` | **Recommended.** Uses the "currently logged-in user" for the updater user code and default locale |
| `public CurrencyManager(String updateUserCd) throws BizApiException` | Explicitly specify the updater user code |
| `public CurrencyManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | Explicitly specify both the updater user code and default locale |
| `public CurrencyManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`** (use `CurrencyManager()`) |

## Exceptions

`jp.co.intra_mart.foundation.exception.BizApiException` (a checked exception). Constructors and all CRUD/search methods consistently declare only this exception (except `getExportCategories()`/`getImportCategories()`, which declare none).

## Currency (`Currency`) Methods

```java
public Currency getCurrency(ICurrencyBizKey bizKey) throws BizApiException; // + Locale, isDisable combination overloads exist (4 total)

public CurrencyListNode[] listCurrency(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public CurrencyListNode[] searchCurrency(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // A separate but identically-shaped family to listCurrency

public int countCurrency(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalCurrency(AppCmnSearchCondition condition) throws BizApiException; // + isDisable

public void setCurrency(Currency currency) throws BizApiException; // Create/update (no term management. Simple upsert)

public void removeCurrency(ICurrencyBizKey bizKey) throws BizApiException; // Deletes all locales
public void removeCurrency(ICurrencyBizKey bizKey, Locale locale) throws BizApiException; // Only the given locale
```

The table that can be specified in `condition` is `ImmCurrencyColumn` (`imm_currency`).

## Currency Conversion (`CurrencyConversion`) Methods

Same CRUD/search pattern as `Currency`. The currency conversion code (`currencyConversionCd`) functions as the identifier for a "conversion table" grouping multiple currency rates (`CurrencyRate`).

```java
public CurrencyConversion getCurrencyConversion(ICurrencyConversionBizKey bizKey) throws BizApiException; // + Locale, isDisable

public CurrencyConversionListNode[] listCurrencyConversion(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public CurrencyConversionListNode[] searchCurrencyConversion(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countCurrencyConversion(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalCurrencyConversion(AppCmnSearchCondition condition) throws BizApiException; // + isDisable

public void setCurrencyConversion(CurrencyConversion currencyConversion) throws BizApiException; // No term management. Simple upsert
public void removeCurrencyConversion(ICurrencyConversionBizKey bizKey) throws BizApiException; // + Locale overload
```

The table that can be specified in `condition` is `ImmCurrencyConversionColumn`.

## Currency Precision (`CurrencyPrecision`) Methods

Same CRUD/search pattern as `Currency`/`CurrencyConversion`. Handles precision information per currency, such as the number of decimal places and rounding rules.

```java
public CurrencyPrecision getCurrencyPrecision(ICurrencyPrecisionBizKey bizKey) throws BizApiException; // + Locale, isDisable

public CurrencyPrecisionListNode[] listCurrencyPrecision(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public CurrencyPrecisionListNode[] searchCurrencyPrecision(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countCurrencyPrecision(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalCurrencyPrecision(AppCmnSearchCondition condition) throws BizApiException; // + isDisable

public void setCurrencyPrecision(CurrencyPrecision currencyPrecision) throws BizApiException; // No term management. Simple upsert
public void removeCurrencyPrecision(ICurrencyPrecisionBizKey bizKey) throws BizApiException; // + Locale overload
```

The table that can be specified in `condition` is `ImmCurrencyPrecisionColumn`.

## Currency Rate (`CurrencyRate`) Methods

The business key for `CurrencyRate` has four components: `companyCd`/`currencyConversionCd`/`currencyCd`/`baseCurrencyCd` (the counterpart currency code). Together they uniquely identify "which currency to which currency" the rate applies to, within a given currency conversion code. **The only one of the four entity types that implements `ITerm` (term management).**

```java
public CurrencyRate getCurrencyRate(ICurrencyRateBizKey bizKey, Date date) throws BizApiException; // + isDisable. Returns null (does not throw) if not found
public CurrencyRate[] getCurrencyRateList(ICurrencyRateBizKey bizKey) throws BizApiException; // All terms. + isDisable

public ITerm getCurrencyRateTerm(ICurrencyRateBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCurrencyRateTermList(ICurrencyRateBizKey bizKey) throws BizApiException; // + isDisable

public CurrencyRateListNode[] listCurrencyRate(AppCmnSearchCondition condition, Date date, int start, int count) throws BizApiException; // + isDisable
// searchCurrencyRate/countCurrencyRate/totalCurrencyRate also exist, in the same shape

// Create/update (auto-decided by whether the term code is set — same pattern as User/Department)
public ITerm[] setCurrencyRate(CurrencyRate currencyRate) throws BizApiException;

public void removeCurrencyRate(ICurrencyRateBizKey bizKey) throws BizApiException;

// Term operations
public ITerm[] moveTermCurrencyRate(ICurrencyRateBizKey bizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTermCurrencyRate(ICurrencyRateBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTermCurrencyRate(ICurrencyRateBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTermCurrencyRate(ICurrencyRateBizKey bizKey, String mergeTermCd) throws BizApiException;
```

The table that can be specified in `condition` is `ImmCurrencyRateColumn` (`imm_currency_rate`).

### Composite Search `getCurrencyRates`

A `CurrencyRate`-specific composite search method that lets you specify conditions spanning all four tables — currency, counterpart currency, currency conversion, and currency rate — at once. The result is returned as a joined `CurrencyRatesListNode[]` (a class combining the display fields of all four tables into a single node).

```java
public CurrencyRatesListNode[] getCurrencyRates(
        AppCmnSearchCondition currencyCondition,
        AppCmnSearchCondition baseCurrencyCondition,
        AppCmnSearchCondition currencyConversionCondition,
        AppCmnSearchCondition currencyRateCondition,
        Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
```

A simplified overload that omits `start`/`count`/`isDisable` also exists.

## Model Class Business Keys

```java
package jp.co.intra_mart.foundation.master.currency.model;

public interface ICurrencyBizKey {
    String getCompanyCd();
    String getCurrencyCd();
    // setCompanyCd/setCurrencyCd
}

public interface ICurrencyConversionBizKey {
    String getCompanyCd();
    String getCurrencyConversionCd(); // Currency conversion code
    // setCompanyCd/setCurrencyConversionCd
}

public interface ICurrencyPrecisionBizKey {
    String getCompanyCd();
    String getCurrencyCd();
    String getCurrencyPrecisionType(); // Currency precision type
    // setCompanyCd/setCurrencyCd/setCurrencyPrecisionType
}

public interface ICurrencyRateBizKey {
    String getCompanyCd();
    String getCurrencyConversionCd();
    String getCurrencyCd();
    String getBaseCurrencyCd(); // Counterpart currency code
    // setCompanyCd/setCurrencyConversionCd/setCurrencyCd/setBaseCurrencyCd
}
```

`CurrencyBizKey`/`CurrencyConversionBizKey`/`CurrencyPrecisionBizKey`/`CurrencyRateBizKey` are the respective standard implementation classes.

## `Currency` Model Class

```java
package jp.co.intra_mart.foundation.master.currency.model;

public class Currency implements ICurrencyBizKey, ISortable, IDisable, IRecorder, IWithLocale<ICurrencyElement>, ICurrencyElement {
    private String companyCd;
    private String currencyCd;
    private Locale defaultLocale;
    private final Map<Locale, ICurrencyElement> localeElementMap;
    private String currencyIsoCd = "";  // Currency ISO code
    private String unitSign = "";       // Currency unit sign
    private boolean disable;
    private int sortKey;
    private String recordUserCd;
    private Date recordDate;
}
```

`Currency` does not implement `ITerm` (no term management). The localized information (`ICurrencyElement`) holds the currency name (`currencyName`).

`CurrencyConversion`/`CurrencyPrecision` are likewise models with a composite key including `companyCd` plus a multilingual name, and do not implement `ITerm`. Only `CurrencyRate` additionally has `startDate`/`endDate`/`termCd` (`ITerm`).

## Import / Export

```java
public Set<String> getExportCategories(); // No exception
public Set<String> getImportCategories(); // No exception
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
