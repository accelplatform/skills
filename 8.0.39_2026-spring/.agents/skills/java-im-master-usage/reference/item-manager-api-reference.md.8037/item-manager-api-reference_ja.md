# ItemManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.item.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

**`ItemCategoryManager`（品目カテゴリ、`jp.co.intra_mart.foundation.master.item_category`）とは別クラス。** 品目本体の CRUD は本クラス、品目カテゴリとの所属関係・カテゴリ階層は `ItemCategoryManager` が担う。`reference/item-category-manager-api-reference.md` を参照。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.item;

public final class ItemManager extends AbstractManager {
```

- IM-共通マスタ（`im_master-main`）の品目情報 CRUD・検索を担うマネージャ。`AbstractManager` を継承する
- 拡張ポイント（既定値 `jp.co.intra_mart.foundation.master.accessor.item`）経由でプラグイン実装（`ItemReader`/`ItemWriter`/`ItemListener`/`ItemImporter`/`ItemExporter`）に処理を委譲する
- **`CustomerManager` と同じ設計。CRUD・検索系メソッド名は対象名を含まない汎用名（`get`/`set`/`remove`/`list`/`search`/`count`/`total`/`getTerm`/`moveTerm`/`separateTerm`/`mergeForwardTerm`/`mergeBackwardTerm`）。** 検索・一覧・件数取得系は第一引数に `String companyCd` を取る（品目は会社ごとにスコープされたマスタ）
- 品目カテゴリとの所属関係・階層（ツリー）操作は持たない（`ItemCategoryManager` 側に実装されている）

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public ItemManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public ItemManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定 |
| `public ItemManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public ItemManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`ItemManager()` を使うこと） |

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（検査例外）。コンストラクタ・CRUD・検索系すべてが一貫してこの例外のみを宣言する。

## メソッド一覧

```java
// 取得
public Item[] get(IItemBizKey bizKey) throws BizApiException; // 全期間・全ロケール
public Item[] get(IItemBizKey bizKey, boolean isDisable) throws BizApiException;
public Item get(IItemBizKey bizKey, Date termDate) throws BizApiException; // 基準日指定、単体。存在しない場合 null
public Item[] get(IItemBizKey bizKey, Locale locale) throws BizApiException;
public Item get(IItemBizKey bizKey, Date termDate, Locale locale) throws BizApiException;

// 検索・一覧・件数（すべて companyCd が第一引数）
public ItemListNode[] search(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public ItemListNode[] list(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException; // + isDisable
public int count(String companyCd, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int total(String companyCd, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 新規登録／更新（期間コード有無で自動判定）
public ITerm[] set(Item item) throws BizApiException;

// 削除
public void remove(IItemBizKey bizKey) throws BizApiException;
public void remove(IItemBizKey bizKey, Locale locale) throws BizApiException;
public void remove(Locale locale) throws BizApiException; // 全品目から指定言語のデータを削除

// 期間操作
public ITerm[] moveTerm(IItemBizKey bizKey, ITerm moveTerm) throws BizApiException;
public ITerm separateTerm(IItemBizKey bizKey, String sepTermCd, Date sepTermDate) throws BizApiException;
public void mergeForwardTerm(IItemBizKey bizKey, String mergeTermCd) throws BizApiException;
public void mergeBackwardTerm(IItemBizKey bizKey, String mergeTermCd) throws BizApiException;
```

`condition` に指定できるテーブルは `ImmItemColumn`（`imm_item`）。

## `Item` モデルクラス

```java
package jp.co.intra_mart.foundation.master.item.model;

public class Item implements IItemBizKey, ISortable, IDisable, IRecorder, IWithLocale<IItemElement>, ITerm, IItemElement {
```

| フィールド | 概要 |
|---|---|
| `companyCd` / `itemCd` | ビジネスキー（`IItemBizKey`） |
| `defaultLocale` / `localeElementMap` | 多言語対応（`IWithLocale`） |
| `sortKey` | ソートキー |
| `startDate` / `endDate` / `termCd` | 期間情報（`ITerm`） |
| `recordDate` / `recordUserCd` | 更新日・更新者ユーザコード |

国際化情報（`IItemElement`）は `itemName`（品目名）、`itemSearchName`（品目検索名）、`itemShortName`（品目略称）、`notes`（備考）の4項目のみ。`User`/`Corporation`/`Customer` と異なり住所・電話番号等の連絡先系フィールドを持たない、最小構成のモデル。

## `IItemBizKey` インタフェース

```java
package jp.co.intra_mart.foundation.master.item.model;

public interface IItemBizKey {
    String getCompanyCd();
    String getItemCd();
    void setCompanyCd(String companyCd);
    void setItemCd(String itemCd);
}
```

ビジネスキーは `companyCd`/`itemCd` の2要素。

## インポート・エクスポート

```java
public Set<String> getImportCategories(); // 例外なし
public Set<String> getExportCategories(); // 例外なし
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
```
