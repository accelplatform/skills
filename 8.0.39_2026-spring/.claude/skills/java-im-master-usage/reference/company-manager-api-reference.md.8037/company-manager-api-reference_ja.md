# CompanyManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.company.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.company;

/**
 * 会社情報の取得と管理を行うマネージャクラス
 * @since 7.2
 */
public class CompanyManager extends AbstractManager {
```

**会社（Company）・組織/組織セット（Department/DepartmentSet）・役職（CompanyPost）・ユーザの組織所属（UserAttach）のすべてを、この1クラスが扱う。** `DepartmentManager`/`OrganizationManager` に相当する別クラスは存在しない（`jp.co.intra_mart.foundation.master.*` 配下の `*Manager` を全数確認して判明した事実）。

内部構造は `UserManager` と同様、拡張ポイント（既定値 `jp.co.intra_mart.foundation.master.accessor.company`）経由でプラグイン実装（`CompanyReader`/`CompanyWriter`/`CompanyListener`/`CompanyImporter`/`CompanyExporter`）に処理を委譲する。`changeExecutor(String extensionPoint)` で拡張ポイントを切り替えられる。

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public CompanyManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public CompanyManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定 |
| `public CompanyManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public CompanyManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`CompanyManager()` を使うこと） |

`UserManager` と同様、引数省略時は「現在ログイン中のユーザ」の値が採用される。

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（検査例外）。コンストラクタ・CRUD・検索系すべてが一貫してこの例外のみを宣言する（`getExportCategories()`/`getImportCategories()` のみ例外なし）。

## 会社（`Company`）関連メソッド

**`Company` には新規登録用メソッドが存在せず、`updateCompany` は既存レコードの更新専用である。** 標準実装（`StandardCompanyAccessor#updateCompany`）は `company_cd` を条件とした SQL の `UPDATE` 文のみを発行し、`INSERT`（新規作成）は行わない。対象の会社コードが未登録の場合、`updateCompany` は例外を送出せず**何も更新せずに正常終了する**（0件更新でもエラーにならない）。**`CompanyManager`（Java API）だけでは新規の会社を作成できない。** 新規の会社は、`importData`（インポート機能）またはテナントセットアップ資材（`jssp-tenant-setup-generator` 等が扱うインポート資材）経由で投入する運用を前提とする。

```java
public Company getCompany(ICompanyBizKey bizKey) throws BizApiException;
public Company[] getCompanyAll() throws BizApiException;

public CompanyListNode[] listCompany(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CompanyListNode[] searchCompany(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // listCompany と同型の別系統

public int countCompany(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCompany(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。ロケール指定なし

public void updateCompany(Company company) throws BizApiException; // 既存の会社の更新専用。新規作成はできない
public void removeCompany(ICompanyBizKey bizKey) throws BizApiException; // 全言語・関連情報を削除。内部で認可リソースも削除される
```

## `Company` モデルクラス（重要な制約）

```java
package jp.co.intra_mart.foundation.master.company.model;

/**
 * 会社情報を扱うモデルクラス
 * @since 7.2
 */
public class Company implements ISortable, IRecorder, ICompanyBizKey {
    private String companyCd;    // 会社コード
    private Date   recordDate;   // 更新日
    private String recordUserCd; // 更新ユーザコード
    private int    sortKey;      // ソートキー
}
```

**`Company` は `companyCd`/`recordDate`/`recordUserCd`/`sortKey` の4フィールドのみで、会社名・多言語ラベルに相当するフィールドを一切持たない（`IWithLocale` 未実装）。** 会社名に相当する情報を持たせたい場合は、組織（`Department`）側で名称を管理する設計になっているか、プロジェクト側で別途拡張する必要がある（`Company` 自体には多言語名称の管理手段がない）。

## 組織（`Department`）・組織セット（`DepartmentSet`）関連メソッド

`Department` は会社コード・組織セットコード・組織コードの複合キー＋期間管理（`termCd`/`startDate`/`endDate`）＋多言語名称（`localeElementMap`）を持つ、階層構造（組織ツリー）を構成する中心的なモデル。

```java
public Department getDepartment(IDepartmentBizKey bizKey, Date date) throws BizApiException; // + Locale, isDisable
public Department[] getDepartments(IDepartmentBizKey[] bizKey, Date date) throws BizApiException; // + Locale, isDisable

public DepartmentListNode[] listDepartment(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentListNode[] searchDepartment(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

public int countDepartment(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalDepartment(AppCmnSearchCondition condition, Date date) throws BizApiException;

// 新規登録／更新（期間コード有無で自動判定。User と同じパターン）
// 新規登録時（termCd 未設定時）は startDate/endDate が必須（未設定だと BizApiException）
public ITerm[] setDepartment(Department department) throws BizApiException;

public void removeDepartment(IDepartmentBizKey bizKey) throws BizApiException; // 全言語削除
public void removeDepartment(IDepartmentBizKey bizKey, Locale locale) throws BizApiException; // 指定言語のみ
public void removeDepartment(Locale locale) throws BizApiException; // 全組織から指定言語のデータを削除
```

### 組織階層（ツリー）の取得

```java
public DepartmentTreeNode getTree(IDepartmentSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。組織セット全体のツリー
public DepartmentTreeNode getBranch(IDepartmentBizKey bizKey, Date date, Locale locale) throws BizApiException; // 指定組織を起点とした下位ツリー（枝）
public DepartmentListNode[] getChildren(IDepartmentBizKey bizKey, Date date, Locale locale) throws BizApiException; // 直下の子組織
public DepartmentListNode[] getParent(IDepartmentBizKey bizKey, Date date, Locale locale) throws BizApiException; // 親組織
public DepartmentListNode[] getIsolation(IDepartmentSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // 組織ツリー上に存在しない孤立ノード
public DepartmentListNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // ツリーのルート一覧
```

`getAbsoluteBranch`/`getAbsoluteChildren`/`getAbsoluteParent`/`getAbsoluteIsolation`（論理削除・無効データも含めた絶対位置版）、`getUpBranch`/`getAbsoluteUpBranch`（上位方向の取得）も存在する。

### 組織内包（親子関係）の操作

```java
public void setDepartmentInclusion(...) throws BizApiException;
public void removeDepartmentInclusion(...) throws BizApiException;
```

### 組織セット（`DepartmentSet`）

`DepartmentSet` は `companyCd`/`departmentSetCd`/`recordDate`/`recordUserCd`/`sortKey` のみを持つモデルであり、`Company` と同様に多言語名称フィールドを持たず `ITerm` も実装しない。**`DepartmentSet` も `Company` と同じ制約を持ち、`updateDepartmentSet` は既存レコードの更新専用である。** 標準実装（`StandardCompanyAccessor#updateDepartmentSet`）も `company_cd`/`department_set_cd` を条件とした SQL の `UPDATE` 文のみを発行し、`INSERT` は行わない。対象が未登録の場合は例外を送出せず何も更新せずに終了する。**`CompanyManager`（Java API）だけでは新規の組織セットを作成できない。**

```java
public DepartmentSet getDepartmentSet(IDepartmentSetBizKey bizKey) throws BizApiException;
public DepartmentSet[] getDepartmentSetAll() throws BizApiException;
public DepartmentSet[] getDepartmentSetWithCompany(ICompanyBizKey bizKey) throws BizApiException;

public void updateDepartmentSet(DepartmentSet departmentSet) throws BizApiException; // 既存の組織セットの更新専用。新規作成はできない
public void removeDepartmentSet(IDepartmentSetBizKey bizKey) throws BizApiException;
```

`mergeBackwardTermDepartmentSet`/`mergeForwardTermDepartmentSet`/`moveTermDepartmentSet`/`separateTermDepartmentSet`/`changeDepartmentSetState`/`getTreeTerm`/`getTreeTermList` も存在するが、これらは `DepartmentSet` エンティティ自体の期間ではなく、**その組織セットが持つ組織ツリー（`getTree` が返す構造）の期間**を操作・取得するものである（`DepartmentSet` モデル自体は `ITerm` を実装していない点に注意）。

### 組織カテゴリ・カテゴリ項目

`UserCtg`/`UserCtgItm` と同様のパターンで、組織カテゴリ（`DepartmentCtg`）・カテゴリ項目（`DepartmentCtgItm`）の CRUD・検索メソッド群が用意されている。**`UserCtg`/`PublicGroupCtg` と異なり、`DepartmentCtg`/`DepartmentCtgItm` のビジネスキーは `companyCd` を含む（組織カテゴリは会社単位でスコープされる）。**

```java
// カテゴリ
public DepartmentCtg getDepartmentCategory(IDepartmentCtgBizKey bizKey) throws BizApiException; // + Locale
public DepartmentCtgListNode[] listDepartmentCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentCtgListNode[] searchDepartmentCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countDepartmentCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalDepartmentCategory(AppCmnSearchCondition condition) throws BizApiException; // + isDisable
public void setDepartmentCategory(DepartmentCtg category) throws BizApiException; // 新規登録／更新
public void removeDepartmentCategory(IDepartmentCtgBizKey bizKey) throws BizApiException; // + Locale
public void removeDepartmentCategory(Locale locale) throws BizApiException; // **`@Deprecated`**（`removeDepartmentCategory(IDepartmentCtgBizKey, Locale)` を使うこと）

// カテゴリ項目
public DepartmentCtgItm getDepartmentCategoryItem(IDepartmentCtgItmBizKey bizKey) throws BizApiException; // + Locale
public DepartmentCtgItmListNode[] listDepartmentCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentCtgItmListNode[] searchDepartmentCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countDepartmentCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + isDisable
public int totalDepartmentCategoryItem(AppCmnSearchCondition condition) throws BizApiException; // + isDisable
public void setDepartmentCategoryItem(DepartmentCtgItm item) throws BizApiException;
public void removeDepartmentCategoryItem(IDepartmentCtgItmBizKey bizKey) throws BizApiException; // + Locale
public void removeDepartmentCategoryItem(Locale locale) throws BizApiException; // **`@Deprecated`**
```

### 組織⇔カテゴリ項目の関連付け

```java
public void setDepartmentCategoryItemAttach(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey, ITerm term) throws BizApiException;
public void removeDepartmentCategoryItemAttach(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey, String termCd) throws BizApiException; // departmentBizKey と itemBizKey の companyCd 不一致は BizApiException
public ITerm getDepartmentCategoryItemAttachTerm(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey, Date date) throws BizApiException;
public ITerm[] getDepartmentCategoryItemAttachTermList(IDepartmentBizKey departmentBizKey, IDepartmentCtgItmBizKey itemBizKey) throws BizApiException; // + isDisable

// クロス検索
public DepartmentCtgItmListNode[] listDepartmentCategoryItemWithDepartment(IDepartmentBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public DepartmentListNode[] listDepartmentWithDepartmentCategoryItem(IDepartmentCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
// search* / count* / total* も同型で存在する
```

`condition` に指定できるテーブルは `ImmDepartmentCtgColumn`（`imm_department_ctg`）/`ImmDepartmentCtgItmColumn`（`imm_department_ctg_itm`）。

### `DepartmentCtg` / `DepartmentCtgItm` モデルクラス

```java
package jp.co.intra_mart.foundation.master.company.model;

public class DepartmentCtg implements IDepartmentCtgBizKey, ISortable, IDisable, IRecorder, IWithLocale<IDepartmentCtgElement>, IDepartmentCtgElement {
    private String companyCd;       // ビジネスキーの一部（UserCtg/PublicGroupCtg には無い）
    private String categoryCd;      // ビジネスキーの一部
    private String categoryType;
    private Locale defaultLocale;
    private final Map<Locale, IDepartmentCtgElement> localeElementMap; // categoryName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}

public class DepartmentCtgItm implements IDepartmentCtgItmBizKey, ISortable, IDisable, IRecorder, IWithLocale<IDepartmentCtgItmElement> {
    private String companyCd;
    private String categoryCd;
    private String categoryItemCd;  // companyCd/categoryCd と合わせて複合キー
    private Locale defaultLocale;
    private final Map<Locale, IDepartmentCtgItmElement> localeElementMap; // categoryItemName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}
```

いずれも期間管理（`ITerm`）は実装しない。`IDepartmentCtgBizKey`（`companyCd`/`categoryCd`）・`IDepartmentCtgItmBizKey`（`companyCd`/`categoryCd`/`categoryItemCd`）が対応するビジネスキーインタフェース。

### 組織に所属するユーザの検索

```java
public UserListNode[] listUserWithDepartment(...) throws BizApiException;
public UserListNode[] searchUserWithDepartment(...) throws BizApiException;
public int countUserWithDepartment(...) throws BizApiException;
public int totalUserWithDepartment(...) throws BizApiException;
```

上位ツリー・下位ツリー版（`*WithDepartmentTree`/`*WithDepartmentUpTree`）、重複排除版（`listUserDedupeWithDepartmentTree`）も存在する。

## 役職（`CompanyPost`）関連メソッド

`Department` とほぼ同型のモデル（会社コード・組織セットコード・役職コードの複合キー＋期間管理＋多言語名称＋`rank`（ランク）フィールド）。

```java
public CompanyPost getCompanyPost(ICompanyPostBizKey bizKey, Date date) throws BizApiException; // + Locale, isDisable

public CompanyPostListNode[] listCompanyPost(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public CompanyPostListNode[] searchCompanyPost(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCompanyPost(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalCompanyPost(AppCmnSearchCondition condition, Date date) throws BizApiException;

// 新規登録／更新（期間コード有無で自動判定。Department と同じパターン）
// 新規登録時（termCd 未設定時）は startDate/endDate が必須（未設定だと BizApiException）
public ITerm[] setCompanyPost(CompanyPost companyPost) throws BizApiException;

public void removeCompanyPost(ICompanyPostBizKey bizKey) throws BizApiException; // + Locale オーバーロード、Locale のみの全件版
```

ユーザに紐づく役職の検索（`listCompanyPostWithUser`/`searchCompanyPostWithUser`/`countCompanyPostWithUser`/`totalCompanyPostWithUser`、組織限定版 `*WithUserOnDepartment`）、役職付与（`setCompanyPostAttach`/`removeCompanyPostAttach`）、組織⇔役職⇔ユーザの取得（`getDepartmentCompanyPostWithUser`）も存在する。

## ユーザの組織所属（`UserAttach`）関連メソッド

ユーザと組織（`Department`）の多対多の所属関係（主所属フラグ付き）を管理する。専用のモデルクラスは無く、`setUserAttach`/`removeUserAttach` 等のメソッドで操作する。

```java
// 所属付与／更新
public ITerm[] setUserAttach(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey, ITerm term, boolean isDepartmentMain) throws BizApiException;

// 所属解除
public void removeUserAttach(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey) throws BizApiException;

// 所属期間の取得
public ITerm getUserAttachTerm(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey, Date date) throws BizApiException;
public ITerm[] getUserAttachTermList(IDepartmentBizKey departmentBizKey, IUserBizKey userBizKey) throws BizApiException;
```

**`term` 引数に `null` は渡せない。** `setUserAttach` は内部で常に `AppCmnValidationManager.validateNonCodeTerm(term, ...)` を呼び出し、`term` 自体の非 null チェック・`startDate`/`endDate` の非 null チェック・`startDate < endDate` のチェックを行う（`termCd` の有無による分岐はなく、新規付与・更新のいずれでも必須）。`jp.co.intra_mart.foundation.master.common.model.Term`（`ITerm` の標準実装、引数なしコンストラクタ + `setStartDate`/`setEndDate`/`setTermCd`）のインスタンスを生成し、`startDate`/`endDate` を設定した上で渡すこと。新規付与時は `termCd` を未設定のままにする。

`isDepartmentMain = true` を指定すると、主所属として登録される。JavaDoc上、主所属を切り替えた場合は旧主所属を解除するための期間も内部で自動生成されうる（リスナ `createUserAttach`/`updateUserAttach` が複数回呼ばれる可能性がある）。

## 期間操作（`Department`/`CompanyPost`/`UserAttach` 共通パターン）

`UserManager` の `mergeBackwardTermUser`/`mergeForwardTermUser`/`moveTermUser`/`separateTermUser` と同じ設計思想の期間操作メソッドが、`Department`・`CompanyPost`・`UserAttach` それぞれに存在する（`separateTermDepartment`/`mergeForwardTermCompanyPost`/`moveTermUserAttach` 等、対象名を変えた対応関係）。

## インポート・エクスポート

```java
public Set<String> getExportCategories(); // 例外なし
public Set<String> getImportCategories(); // 例外なし
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```

## 拡張ポイントの切り替え

```java
public void changeExecutor(String extensionPoint) throws BizApiException;
```

空文字を指定すると既定の拡張ポイント（`jp.co.intra_mart.foundation.master.accessor.company`）に戻る。通常のアプリケーション開発では使用しない。
