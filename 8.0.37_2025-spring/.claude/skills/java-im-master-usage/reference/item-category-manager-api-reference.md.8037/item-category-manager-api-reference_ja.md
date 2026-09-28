# ItemCategoryManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.item_category.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.item_category;

/**
 * 品目カテゴリマネージャクラス。
 * 品目カテゴリ情報の操作と品目の所属操作、内包操作を行います。
 */
public class ItemCategoryManager extends AbstractManager {
```

- **品目カテゴリ本体（`ItemCategory`）・品目カテゴリセット（`ItemCategorySet`）・階層（ツリー）・品目（`Item`）との所属関係のすべてを、この1クラスが扱う。** `CompanyManager` の組織（`Department`/`DepartmentSet`）系メソッド群と同型の構造
- 拡張ポイント（既定値 `jp.co.intra_mart.foundation.master.accessor.item_category`）経由でプラグイン実装（`ItemCategoryReader`/`ItemCategoryWriter`/`ItemCategoryListener`/`ItemCategoryImporter`/`ItemCategoryExporter`）に処理を委譲する
- **メソッド名は「品目カテゴリ」を意味する箇所を `Category`（`ItemCategory` ではなく）と表記する。** 例: `getCategory`/`setCategory`/`removeCategory`/`moveTermCategory`/`getCategorySet`/`setCategoryInclusion`。`ItemCategoryManager` というクラス名・`ItemCategory` というモデルクラス名とは表記が異なる点に注意

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public ItemCategoryManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public ItemCategoryManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定 |
| `public ItemCategoryManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public ItemCategoryManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`ItemCategoryManager()` を使うこと） |

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（検査例外）。コンストラクタ・CRUD・検索・ツリー・期間操作系すべてが一貫してこの例外のみを宣言する（`getExportCategories()`/`getImportCategories()` のみ例外なし）。

## 品目カテゴリ（`ItemCategory`）本体のメソッド

```java
public ItemCategory getCategory(IItemCategoryBizKey bizKey, Date termDate) throws BizApiException; // + Locale, isDisable の組合せオーバーロードあり

public ItemCategoryListNode[] listCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemCategoryListNode[] searchCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // listCategory と同型の別系統

public int countCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCategory(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 新規登録／更新（期間コード有無で自動判定。CompanyManager の Department と同じパターン）
public ITerm[] setCategory(ItemCategory category) throws BizApiException;

public void removeCategory(IItemCategoryBizKey bizKey) throws BizApiException; // 全言語削除
public void removeCategory(IItemCategoryBizKey bizKey, Locale locale) throws BizApiException; // 指定言語のみ
public void removeCategory(Locale locale) throws BizApiException; // **`@Deprecated`**（`removeCategory(IItemCategoryBizKey, Locale)` を使うこと）
```

`condition` に指定できるテーブルは `ImmItemCategoryColumn`（`imm_item_category`）。

### 期間操作

```java
public ITerm[] moveTermCategory(IItemCategoryBizKey bizKey, ITerm moveTerm) throws BizApiException;
// separateTermCategory/mergeForwardTermCategory/mergeBackwardTermCategory も同型で存在する
```

### 品目カテゴリ内包（親子関係）の操作

```java
public void setCategoryInclusion(IItemCategoryBizKey bizKey, String parentCategoryCd, String termCd) throws BizApiException;
public void removeCategoryInclusion(IItemCategoryBizKey bizKey, String termCd) throws BizApiException;
```

## 品目カテゴリセット（`ItemCategorySet`）関連メソッド

`ItemCategorySet` は `Company`/`DepartmentSet` と同様、多言語名称フィールドを持たない。`CorporationGroupSet` と同様に、会社限定版の `getCategorySetAll(String companyCd)` を持つ。

```java
public ItemCategorySet getCategorySet(IItemCategorySetBizKey bizKey) throws BizApiException;
public ItemCategorySet[] getCategorySetAll() throws BizApiException; // 全会社・全品目カテゴリセットを取得
public ItemCategorySet[] getCategorySetAll(String companyCd) throws BizApiException; // 指定会社に属するセットのみを取得

public void updateCategorySet(ItemCategorySet categorySet) throws BizApiException; // 既存の更新
public void removeCategorySet(IItemCategorySetBizKey bizKey) throws BizApiException;
```

## ツリー操作

`Department`/`CorporationGroup` のツリー操作と同型のメソッド群が用意されている。

```java
public ItemCategoryTreeNode getTree(IItemCategorySetBizKey bizKey, Date date, Locale locale) throws BizApiException; // 品目カテゴリセット全体のツリー
public ItemCategoryTreeNode getAbsoluteTree(IItemCategorySetBizKey bizKey, Date date, Locale locale) throws BizApiException; // 論理削除・無効データも含めた絶対位置版

public ItemCategoryTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemCategoryTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException;

public ITerm getTreeTerm(IItemCategorySetBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getTreeTermList(IItemCategorySetBizKey bizKey) throws BizApiException; // + isDisable
```

`getBranch`/`getUpBranch`/`getChildren`/`getParent`/`getIsolation`（および `getAbsoluteXxx` 版）も `Department`/`CorporationGroup` と同型で存在する。

## 品目（`Item`）との所属関係

品目カテゴリと品目（`jp.co.intra_mart.foundation.master.item` パッケージの `Item`）の関係を管理する。**`Department`⇔`User` のような期間付き所属ではなく、カテゴリ単位・ツリー単位でのクロス検索群が中心。**

```java
// 単純な所属クロス検索（カテゴリ⇔品目、双方向）
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

// ツリー・上位ツリーを対象範囲としたクロス検索（Tree/UpTree 各4系統: list/search/count/total）
public ItemListNode[] listItemWithCategoryTree(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public ItemListNode[] listItemWithCategoryUpTree(IItemCategoryBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
// searchItemWithCategoryTree/UpTree、countItemWithCategoryTree/UpTree、totalItemWithCategoryTree/UpTree も同型で存在する
```

各系統とも `isDisable` 引数を追加したオーバーロードが存在する。`PublicGroupManager` の役割系クロス検索（`listUserWithPublicGroupRoleOnPublicGroup` 等）と同じ設計思想で、`ItemCategoryManager` 内の `*WithCategory*`/`*WithItem*` 系メソッドが大半を占める（`ItemCategoryManager.java` 単体で 4,800 行超）。個別の全シグネチャは `ItemCategoryManager.java` を参照すること。

## `ItemCategory` モデルクラス

```java
package jp.co.intra_mart.foundation.master.item_category.model;

public class ItemCategory implements ISortable, IDisable, IWithLocale<IItemCategoryElement>, ITerm, IItemCategoryElement, IItemCategoryBizKey, IRecorder {
```

| フィールド | 概要 |
|---|---|
| `companyCd` / `itemCategorySetCd` / `itemCategoryCd` | ビジネスキー（`IItemCategoryBizKey`。`Department` と同型の3要素複合キー） |
| `defaultLocale` / `localeElementMap` | 多言語対応 |
| `sortKey` | ソートキー |
| `startDate` / `endDate` / `termCd` | 期間情報（`ITerm`） |
| `recordDate` / `recordUserCd` | 更新日・更新者ユーザコード |

国際化情報（`IItemCategoryElement`）: `itemCategoryName`（品目カテゴリ名）、`itemCategorySearchName`（検索名）、`itemCategoryShortName`（略称）、`notes`（備考）。

## `IItemCategoryBizKey` インタフェース

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

`IItemCategorySetBizKey`（`companyCd`/`itemCategorySetCd`）も同様のパターンで存在する。`ItemCategoryBizKey`/`ItemCategorySetBizKey` が標準実装クラス。

## インポート・エクスポート

```java
public Set<String> getExportCategories(); // 例外なし
public Set<String> getImportCategories(); // 例外なし
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
