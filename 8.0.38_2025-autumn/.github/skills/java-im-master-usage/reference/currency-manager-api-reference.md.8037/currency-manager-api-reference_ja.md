# CurrencyManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.currency.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.currency;

public final class CurrencyManager extends AbstractManager {
```

**通貨（`Currency`）・通貨換算（`CurrencyConversion`）・通貨精度（`CurrencyPrecision`）・通貨レート（`CurrencyRate`）の4種のエンティティを、この1クラスが扱う。** 4種とも `companyCd` を含むビジネスキーを持ち、会社ごとにスコープされたマスタである。拡張ポイント（既定値 `jp.co.intra_mart.foundation.master.accessor.currency`）経由でプラグイン実装（`CurrencyReader`/`CurrencyWriter`/`CurrencyListener`/`CurrencyImporter`/`CurrencyExporter`）に処理を委譲する。

- **`Currency`/`CurrencyConversion`/`CurrencyPrecision` の3種は期間管理（`ITerm`）を持たない。** `set*` は `void` を返す単純な upsert（新規登録・更新の両方を1メソッドで行うが、戻り値に新規期間の情報は含まれない）
- **`CurrencyRate`（通貨レート）のみ期間管理（`ITerm`）を持つ。** `setCurrencyRate` は `User`/`Department` と同じく `ITerm[]` を返し、`termCd` の有無で新規登録／更新を自動判定する。為替レートは「いつからいつまで有効な値か」という時系列データであるため

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public CurrencyManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public CurrencyManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定 |
| `public CurrencyManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public CurrencyManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`CurrencyManager()` を使うこと） |

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（検査例外）。コンストラクタ・CRUD・検索系すべてが一貫してこの例外のみを宣言する（`getExportCategories()`/`getImportCategories()` のみ例外なし）。

## 通貨（`Currency`）本体のメソッド

```java
public Currency getCurrency(ICurrencyBizKey bizKey) throws BizApiException; // + Locale, isDisable の組合せオーバーロードあり（計4種）

public CurrencyListNode[] listCurrency(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public CurrencyListNode[] searchCurrency(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // listCurrency と同型の別系統

public int countCurrency(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalCurrency(AppCmnSearchCondition condition) throws BizApiException; // + isDisable

public void setCurrency(Currency currency) throws BizApiException; // 新規登録／更新（期間管理なし。単純 upsert）

public void removeCurrency(ICurrencyBizKey bizKey) throws BizApiException; // 全言語削除
public void removeCurrency(ICurrencyBizKey bizKey, Locale locale) throws BizApiException; // 指定言語のみ
```

`condition` に指定できるテーブルは `ImmCurrencyColumn`（`imm_currency`）。

## 通貨換算（`CurrencyConversion`）関連メソッド

`Currency` と同型の CRUD・検索パターン。通貨換算コード（`currencyConversionCd`）は、複数の通貨レート（`CurrencyRate`）をまとめる「換算テーブル」の識別子として機能する。

```java
public CurrencyConversion getCurrencyConversion(ICurrencyConversionBizKey bizKey) throws BizApiException; // + Locale, isDisable

public CurrencyConversionListNode[] listCurrencyConversion(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public CurrencyConversionListNode[] searchCurrencyConversion(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countCurrencyConversion(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalCurrencyConversion(AppCmnSearchCondition condition) throws BizApiException; // + isDisable

public void setCurrencyConversion(CurrencyConversion currencyConversion) throws BizApiException; // 期間管理なし。単純 upsert
public void removeCurrencyConversion(ICurrencyConversionBizKey bizKey) throws BizApiException; // + Locale オーバーロード
```

`condition` に指定できるテーブルは `ImmCurrencyConversionColumn`。

## 通貨精度（`CurrencyPrecision`）関連メソッド

`Currency`/`CurrencyConversion` と同型の CRUD・検索パターン。通貨ごとの小数点以下桁数・丸め規則等の精度情報を扱う。

```java
public CurrencyPrecision getCurrencyPrecision(ICurrencyPrecisionBizKey bizKey) throws BizApiException; // + Locale, isDisable

public CurrencyPrecisionListNode[] listCurrencyPrecision(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public CurrencyPrecisionListNode[] searchCurrencyPrecision(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countCurrencyPrecision(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalCurrencyPrecision(AppCmnSearchCondition condition) throws BizApiException; // + isDisable

public void setCurrencyPrecision(CurrencyPrecision currencyPrecision) throws BizApiException; // 期間管理なし。単純 upsert
public void removeCurrencyPrecision(ICurrencyPrecisionBizKey bizKey) throws BizApiException; // + Locale オーバーロード
```

`condition` に指定できるテーブルは `ImmCurrencyPrecisionColumn`。

## 通貨レート（`CurrencyRate`）関連メソッド

`CurrencyRate` のビジネスキーは `companyCd`/`currencyConversionCd`/`currencyCd`/`baseCurrencyCd`（相手先通貨コード）の4要素。同一の通貨換算コード内で「どの通貨からどの通貨への」レートかを一意に特定する。**4種の中で唯一 `ITerm`（期間管理）を実装する。**

```java
public CurrencyRate getCurrencyRate(ICurrencyRateBizKey bizKey, Date date) throws BizApiException; // + isDisable。存在しない場合は例外を送出せず null
public CurrencyRate[] getCurrencyRateList(ICurrencyRateBizKey bizKey) throws BizApiException; // 全期間分。+ isDisable

public ITerm getCurrencyRateTerm(ICurrencyRateBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCurrencyRateTermList(ICurrencyRateBizKey bizKey) throws BizApiException; // + isDisable

public CurrencyRateListNode[] listCurrencyRate(AppCmnSearchCondition condition, Date date, int start, int count) throws BizApiException; // + isDisable
// searchCurrencyRate/countCurrencyRate/totalCurrencyRate も同型で存在する

// 新規登録／更新（期間コード有無で自動判定。User/Department と同じパターン）
public ITerm[] setCurrencyRate(CurrencyRate currencyRate) throws BizApiException;

public void removeCurrencyRate(ICurrencyRateBizKey bizKey) throws BizApiException;

// 期間操作
public ITerm[] moveTermCurrencyRate(ICurrencyRateBizKey bizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTermCurrencyRate(ICurrencyRateBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTermCurrencyRate(ICurrencyRateBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTermCurrencyRate(ICurrencyRateBizKey bizKey, String mergeTermCd) throws BizApiException;
```

`condition` に指定できるテーブルは `ImmCurrencyRateColumn`（`imm_currency_rate`）。

### 複合検索 `getCurrencyRates`

通貨・相手先通貨・通貨換算・通貨レートの4テーブルにまたがる条件を同時に指定できる、`CurrencyRate` 固有の複合検索メソッド。結果は結合済みの `CurrencyRatesListNode[]`（4テーブルの表示項目を1ノードにまとめたクラス）で返る。

```java
public CurrencyRatesListNode[] getCurrencyRates(
        AppCmnSearchCondition currencyCondition,
        AppCmnSearchCondition baseCurrencyCondition,
        AppCmnSearchCondition currencyConversionCondition,
        AppCmnSearchCondition currencyRateCondition,
        Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
```

`start`/`count`/`isDisable` を省略した簡易オーバーロードも存在する。

## モデルクラスのビジネスキー

```java
package jp.co.intra_mart.foundation.master.currency.model;

public interface ICurrencyBizKey {
    String getCompanyCd();
    String getCurrencyCd();
    // setCompanyCd/setCurrencyCd
}

public interface ICurrencyConversionBizKey {
    String getCompanyCd();
    String getCurrencyConversionCd(); // 通貨換算コード
    // setCompanyCd/setCurrencyConversionCd
}

public interface ICurrencyPrecisionBizKey {
    String getCompanyCd();
    String getCurrencyCd();
    String getCurrencyPrecisionType(); // 通貨精度区分
    // setCompanyCd/setCurrencyCd/setCurrencyPrecisionType
}

public interface ICurrencyRateBizKey {
    String getCompanyCd();
    String getCurrencyConversionCd();
    String getCurrencyCd();
    String getBaseCurrencyCd(); // 相手先通貨コード
    // setCompanyCd/setCurrencyConversionCd/setCurrencyCd/setBaseCurrencyCd
}
```

`CurrencyBizKey`/`CurrencyConversionBizKey`/`CurrencyPrecisionBizKey`/`CurrencyRateBizKey` が、それぞれの標準実装クラス。

## `Currency` モデルクラス

```java
package jp.co.intra_mart.foundation.master.currency.model;

public class Currency implements ICurrencyBizKey, ISortable, IDisable, IRecorder, IWithLocale<ICurrencyElement>, ICurrencyElement {
    private String companyCd;
    private String currencyCd;
    private Locale defaultLocale;
    private final Map<Locale, ICurrencyElement> localeElementMap;
    private String currencyIsoCd = "";  // 通貨ISOコード
    private String unitSign = "";       // 通貨単位記号
    private boolean disable;
    private int sortKey;
    private String recordUserCd;
    private Date recordDate;
}
```

`Currency` は `ITerm` を実装しない（期間管理を持たない）。国際化情報（`ICurrencyElement`）は通貨名（`currencyName`）を保持する。

`CurrencyConversion`/`CurrencyPrecision` も同様に `ITerm` を実装しない、`companyCd` を含む複合キー＋多言語名称のモデルである。`CurrencyRate` のみ `startDate`/`endDate`/`termCd`（`ITerm`）を追加で持つ。

## インポート・エクスポート

```java
public Set<String> getExportCategories(); // 例外なし
public Set<String> getImportCategories(); // 例外なし
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
