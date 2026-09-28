# CorporationManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.corporation.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

**`CorporationGroupManager`（法人グループ、`jp.co.intra_mart.foundation.master.corporation_group`）とは別クラス。** 混同しないこと。`Corporation`（法人）は取引先（`Customer`）と直接紐付く独立したマスタであり、法人グループの配下エンティティではない。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.corporation;

public final class CorporationManager extends AbstractManager {
```

- IM-共通マスタ（`im_master-main`）の法人情報 CRUD・検索を担うマネージャ。`AbstractManager` を継承する
- 拡張ポイント（既定値 `jp.co.intra_mart.foundation.master.accessor.corporation`）経由でプラグイン実装（`CorporationReader`/`CorporationWriter`/`CorporationListener`/`CorporationImporter`/`CorporationExporter`）に処理を委譲する
- **`CorporationGroupManager`・`PublicGroupManager`と異なり、ツリー操作・分類（カテゴリ）・内包（親子）操作を持たない。** 法人本体の CRUD・検索・期間操作と、取引先（`Customer`）との所属関係操作のみで構成される単純な構造

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public CorporationManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public CorporationManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定 |
| `public CorporationManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public CorporationManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`CorporationManager()` を使うこと） |

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（検査例外）。コンストラクタ・CRUD・検索系すべてが一貫してこの例外のみを宣言する（`getExportCategories()`/`getImportCategories()` のみ例外なし）。

## 法人（`Corporation`）本体のメソッド

`getCorporation` は対象が存在しない場合、例外を送出せず `null` を返す（`Date` 指定版）。`ICorporationBizKey`/`isDisable` のみ指定する版は空配列を返す。

```java
public Corporation[] getCorporation(ICorporationBizKey bizKey) throws BizApiException; // 全期間・全ロケール
public Corporation[] getCorporation(ICorporationBizKey bizKey, boolean isDisable) throws BizApiException;
public Corporation getCorporation(ICorporationBizKey bizKey, Date termDate) throws BizApiException; // 基準日指定、単体
public Corporation[] getCorporation(ICorporationBizKey bizKey, Locale locale) throws BizApiException; // ロケール指定、全期間
public Corporation getCorporation(ICorporationBizKey bizKey, Date termDate, Locale locale) throws BizApiException;

public CorporationListNode[] listCorporation(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationListNode[] searchCorporation(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // listCorporation と同型の別系統

public int countCorporation(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporation(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。ロケール指定なし

// 新規登録／更新（期間コード有無で自動判定。User/Department と同じパターン）
public ITerm[] setCorporation(Corporation corporation) throws BizApiException;

public void removeCorporation(ICorporationBizKey bizKey) throws BizApiException; // 全言語削除
public void removeCorporation(ICorporationBizKey bizKey, Locale locale) throws BizApiException; // 指定言語のみ
public void removeCorporation(Locale locale) throws BizApiException; // 全法人から指定言語のデータを削除
```

`condition` に指定できるテーブルは `ImmCorporationColumn`（`imm_corporation`）。

### 期間操作

```java
public ITerm getCorporationTerm(ICorporationBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCorporationTermList(ICorporationBizKey bizKey) throws BizApiException; // + isDisable

public ITerm[] moveTermCorporation(ICorporationBizKey bizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTermCorporation(ICorporationBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTermCorporation(ICorporationBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTermCorporation(ICorporationBizKey bizKey, String mergeTermCd) throws BizApiException;
```

## 取引先（`Customer`）との所属関係

法人と取引先（`jp.co.intra_mart.foundation.master.customer` パッケージの `Customer`）の多対多の所属関係（期間管理あり）を管理する。専用のモデルクラスは無く、`setCorporationAttach`/`removeCorporationAttach` 等のメソッドで操作する。

```java
// 所属付与／更新（新規所属時は termCd 未設定、更新時は termCd 設定）
public ITerm[] setCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, ITerm term) throws BizApiException;

// 所属解除
public void removeCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey) throws BizApiException;

// 所属期間の取得
public ITerm getCorporationAttachTerm(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, Date date) throws BizApiException;
public ITerm[] getCorporationAttachTermList(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey) throws BizApiException; // + isDisable

// 期間操作
public ITerm[] moveTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTermCorporationAttach(ICustomerBizKey customerBizKey, ICorporationBizKey corpBizKey, String mergeTermCd) throws BizApiException;
```

### 相互検索（法人⇔取引先）

```java
// 取引先が所属している法人の一覧
public CorporationListNode[] getCorporationWithCustomer(ICustomerBizKey bizKey, Date termDate, Locale locale) throws BizApiException; // + isDisable
public CorporationListNode[] searchCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationListNode[] listCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public int countCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationWithCustomer(ICustomerBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 法人に所属している取引先の一覧
public CustomerListNode[] getCustomerWithCorporation(ICorporationBizKey bizKey, Date termDate, Locale locale) throws BizApiException; // + isDisable
public CustomerListNode[] searchCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CustomerListNode[] listCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public int countCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCustomerWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable
```

## `Corporation` モデルクラス

```java
package jp.co.intra_mart.foundation.master.corporation.model;

public class Corporation implements ICorporationBizKey, ISortable, IDisable, IRecorder, IWithLocale<ICorporationElement>, ITerm, ICorporationElement {
```

| フィールド | 概要 |
|---|---|
| `companyCd` / `corporationCd` | ビジネスキー（`ICorporationBizKey`） |
| `defaultLocale` / `localeElementMap` | 多言語対応（`IWithLocale`） |
| `disable` | 削除フラグ |
| `sortKey` | ソートキー |
| `startDate` / `endDate` / `termCd` | 期間情報（`ITerm`） |
| `recordDate` / `recordUserCd` | 更新日・更新者ユーザコード（`IRecorder`） |

国際化情報（`ICorporationElement`）: `corporationName`（法人名）、`corporationShortName`（法人略称）、`corporationSearchName`（法人検索名）、`corporateNumber`（法人番号。`@CorporateNumberValidation`）、`countryCd`（国コード）、`zipCode`（郵便番号）、`address1`〜`address3`（住所）、`telephoneNumber`/`extensionNumber`/`faxNumber`/`extensionFaxNumber`（電話・FAX番号）、`emailAddress1`/`emailAddress2`（メールアドレス）、`url`、`notes`（備考）。`User`/`Customer` の国際化情報とほぼ同型。

`createLocaleElement()`/`putLocaleElement(Locale, ICorporationElement)` を使った登録手順は `User` と同一（`assets/user-master-basic-usage.md` パターン3を参照）。

## `ICorporationBizKey` インタフェース

```java
package jp.co.intra_mart.foundation.master.corporation.model;

public interface ICorporationBizKey {
    String getCompanyCd();
    String getCorporationCd();
    void setCompanyCd(String companyCd);
    void setCorporationCd(String corporationCd);
}
```

ビジネスキーは `companyCd`/`corporationCd` の2要素。`CorporationBizKey` が標準実装（軽量な2フィールドの実装クラス）。

## `CorporationListNode`

```java
package jp.co.intra_mart.foundation.master.corporation.model;

public class CorporationListNode implements ListNode, ICorporationBizKey {
    // displayName / description / shortName / deleteFlag を保持
    public String getDescription();
    public String getDisplayName();
    public String getShortName();
}
```

## インポート・エクスポート

```java
public Set<String> getExportCategories(); // 例外なし
public Set<String> getImportCategories(); // 例外なし
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
