# CustomerManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.customer.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.customer;

public final class CustomerManager extends AbstractManager {
```

- IM-共通マスタ（`im_master-main`）の取引先情報 CRUD・検索を担うマネージャ。`AbstractManager` を継承する
- 拡張ポイント（既定値 `jp.co.intra_mart.foundation.master.accessor.customer`）経由でプラグイン実装（`CustomerReader`/`CustomerWriter`/`CustomerListener`/`CustomerImporter`/`CustomerExporter`）に処理を委譲する
- 分類・ツリー・内包操作を持たない。取引先本体1エンティティのみを扱う単純な構造
- **他クラス（`UserManager`/`CompanyManager` 等）と異なり、CRUD・検索系メソッド名が対象名を含まない汎用名（`get`/`set`/`remove`/`list`/`search`/`count`/`total`/`getTerm`/`moveTerm`/`separateTerm`/`mergeForwardTerm`/`mergeBackwardTerm`）である。** `CustomerManager` 内で扱うエンティティが `Customer` 1種類のみのため、メソッド名にエンティティ名を含める必要がないという設計
- **検索・一覧・件数取得系メソッドは、いずれも第一引数に `String companyCd`（検索対象会社コード）を取る。** 取引先は会社ごとにスコープされたマスタである

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public CustomerManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public CustomerManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定 |
| `public CustomerManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public CustomerManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`CustomerManager()` を使うこと） |

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（検査例外）。コンストラクタ・CRUD・検索系すべてが一貫してこの例外のみを宣言する（`getExportCategories()`/`getImportCategories()` のみ例外なし）。

## メソッド一覧

`get` は対象が存在しない場合、基準日指定の単体取得版は `null` を、配列を返す版は空配列を返す。

```java
// 取得
public Customer[] get(ICustomerBizKey bizKey) throws BizApiException; // 全期間・全ロケール
public Customer[] get(ICustomerBizKey bizKey, boolean isDisable) throws BizApiException;
public Customer get(ICustomerBizKey bizKey, Date termDate) throws BizApiException; // 基準日指定、単体。存在しない場合 null
public Customer get(ICustomerBizKey bizKey, Date termDate, boolean isDisable) throws BizApiException;
public Customer[] get(ICustomerBizKey bizKey, Locale locale) throws BizApiException; // ロケール指定、全期間
public Customer[] get(ICustomerBizKey bizKey, Locale locale, boolean isDisable) throws BizApiException;
public Customer get(ICustomerBizKey bizKey, Date termDate, Locale locale) throws BizApiException;
public Customer get(ICustomerBizKey bizKey, Date termDate, Locale locale, boolean isDisable) throws BizApiException;

// 期間情報の取得
public ITerm getTerm(ICustomerBizKey bizKey, Date termDate) throws BizApiException;

// 検索・一覧・件数（すべて companyCd が第一引数）
public CustomerListNode[] search(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CustomerListNode[] list(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException; // + isDisable
public int count(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int total(String companyCd, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 新規登録／更新（期間コード有無で自動判定）
public ITerm[] set(Customer customer) throws BizApiException;

// 削除
public void remove(ICustomerBizKey bizKey) throws BizApiException; // 全期間削除
public void remove(Locale locale) throws BizApiException; // 全取引先から指定言語のデータを削除。**`@Deprecated`**

// 期間操作
public ITerm separateTerm(ICustomerBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTerm(ICustomerBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTerm(ICustomerBizKey bizKey, String mergeTermCd) throws BizApiException;
```

`condition` に指定できるテーブルは `ImmCustomerColumn`（`imm_customer`）。

## `Customer` モデルクラス

```java
package jp.co.intra_mart.foundation.master.customer.model;

public class Customer implements ICustomerBizKey, ISortable, IDisable, IWithLocale<ICustomerElement>, ITerm, ICustomerElement, IRecorder {
```

| フィールド | 概要 |
|---|---|
| `companyCd` / `customerCd` | ビジネスキー（`ICustomerBizKey`） |
| `defaultLocale` / `localeElementMap` | 多言語対応（`IWithLocale`） |
| `sortKey` | ソートキー |
| `startDate` / `endDate` / `termCd` | 期間情報（`ITerm`） |
| `recordDate` / `recordUserCd` | 更新日・更新者ユーザコード |

国際化情報（`ICustomerElement`）: `customerName`（取引先名）、`customerShortName`（取引先略称）、`customerSearchName`（取引先検索名）、`corporateNumber`（取引先法人番号）、`chargePersonName`（担当者名。**`Corporation`/`User` には無い取引先固有のフィールド**）、`countryCd`、`zipCode`、`address1`〜`address3`、`telephoneNumber`/`extensionNumber`/`faxNumber`/`extensionFaxNumber`、`emailAddress1`/`emailAddress2`、`url`、`notes`。

## `ICustomerBizKey` インタフェース

```java
package jp.co.intra_mart.foundation.master.customer.model;

public interface ICustomerBizKey {
    String getCompanyCd();
    String getCustomerCd();
    void setCompanyCd(String companyCd);
    void setCustomerCd(String customerCd);
}
```

ビジネスキーは `companyCd`/`customerCd` の2要素。

## インポート・エクスポート

```java
public Set<String> getImportCategories(); // 例外なし
public Set<String> getExportCategories(); // 例外なし
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
```
