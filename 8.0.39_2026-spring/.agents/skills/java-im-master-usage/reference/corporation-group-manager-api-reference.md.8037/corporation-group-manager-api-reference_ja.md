# CorporationGroupManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.corporation_group.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.corporation_group;

/**
 * 法人グループ情報の取得と管理を行うマネージャクラス
 * @since 8.0
 */
public class CorporationGroupManager extends AbstractManager {
```

- IM-共通マスタ（`im_master-main`）の法人グループ情報 CRUD・検索・ツリー操作を担うマネージャ。`AbstractManager`（更新者ユーザコード・デフォルトロケール・ログイングループID を保持する共通基底クラス）を継承する
- 内部に拡張ポイント（`jp.co.intra_mart.foundation.master.accessor.corporation_group`）を持ち、実際の読み取り/書き込み/通知/インポート/エクスポートはプラグイン実装（`CorporationGroupReader`/`CorporationGroupWriter`/`CorporationGroupListener`/`CorporationGroupImporter`/`CorporationGroupExporter`）に委譲する
- API の全体構造（法人グループ本体・法人グループセット・ツリー・期間操作・法人との紐付け）は `CompanyManager` の組織（`Department`）系メソッド群とほぼ同型。決定的な差分は、法人グループのビジネスキーが会社コード（`companyCd`）を含む3要素（`companyCd`/`corporationGroupSetCd`/`corporationGroupCd`）である点

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public CorporationGroupManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public CorporationGroupManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定。デフォルトロケールは現在ログイン中のユーザのロケール |
| `public CorporationGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public CorporationGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`CorporationGroupManager()` を使うこと） |

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（検査例外）。コンストラクタ・CRUD・検索・ツリー・期間操作系すべてが一貫してこの例外のみを宣言する（`getExportCategories()`/`getImportCategories()` のみ例外なし）。

## 法人グループ（`CorporationGroup`）本体のメソッド

`getCorporationGroup` は対象が存在しない場合、例外を送出せず `null` を返す。

```java
public CorporationGroup getCorporationGroup(ICorporationGroupBizKey bizKey, Date date) throws BizApiException; // + Locale, isDisable の組み合わせで4オーバーロード
public CorporationGroup[] getCorporationGroupList(ICorporationGroupBizKey bizKey) throws BizApiException; // 対象法人グループの全期間分を取得。+ Locale, isDisable の組み合わせで4オーバーロード

public CorporationGroupListNode[] listCorporationGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationGroupListNode[] searchCorporationGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // listCorporationGroup と同型の別系統

public int countCorporationGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationGroup(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。ロケール指定なし

// 新規登録／更新（期間コード有無で自動判定。CompanyManager の Department と同じパターン）
// 新規登録時（termCd 未設定時）は startDate/endDate が必須（未設定だと BizApiException）
// 内部で AppCmnValidationManager.validateModel によるモデル検証と convertTerm を経由し、
// 結果が空なら CorporationGroupListener#updateCorporationGroup、結果ありなら新規期間分の CorporationGroup を組み立てて返す
public ITerm[] setCorporationGroup(CorporationGroup corporationGroup) throws BizApiException;

public void removeCorporationGroup(ICorporationGroupBizKey bizKey) throws BizApiException; // 全言語削除
public void removeCorporationGroup(ICorporationGroupBizKey bizKey, Locale locale) throws BizApiException; // 指定言語のみ
```

### 期間取得

```java
public ITerm getCorporationGroupTerm(ICorporationGroupBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCorporationGroupTermList(ICorporationGroupBizKey bizKey) throws BizApiException; // + isDisable
```

## 法人グループセット（`CorporationGroupSet`）関連メソッド

`CorporationGroupSet` は `Company`/`DepartmentSet` と同様、多言語名称フィールドを持たず `ITerm` も実装しない。`updateCorporationGroupSet` に相当するメソッド名は存在せず、代わりに `changeCorporationGroupSetState`（法人グループ内包の削除フラグ更新）と `updateCorporationGroupSet`（本体更新）の双方が用意されている。

```java
public CorporationGroupSet getCorporationGroupSet(ICorporationGroupSetBizKey bizKey) throws BizApiException;

// 2種類のオーバーロード。引数の有無で取得範囲が異なる
public CorporationGroupSet[] getCorporationGroupSetAll() throws BizApiException; // 全会社・全法人グループセットを取得
public CorporationGroupSet[] getCorporationGroupSetAll(String companyCd) throws BizApiException; // 指定した会社コードに属する法人グループセットのみを取得

public void updateCorporationGroupSet(CorporationGroupSet corporationGroupSet) throws BizApiException; // 既存の法人グループセットの更新
public void removeCorporationGroupSet(ICorporationGroupSetBizKey bizKey) throws BizApiException;

// 法人グループ内包（親子関係）の削除フラグ更新。CorporationGroupListener#updateCorporationGroupSetTerm を呼び出す
public void changeCorporationGroupSetState(ICorporationGroupSetBizKey bizKey, String termCd, boolean disable) throws BizApiException;
```

### 法人グループ内包（親子関係）の操作

```java
public void setCorporationGroupInclusion(ICorporationGroupBizKey bizKey, String parentCorporationGroupCd, String termCd) throws BizApiException;
public void removeCorporationGroupInclusion(ICorporationGroupBizKey bizKey, String termCd) throws BizApiException;
```

## ツリー操作関連

`Department` のツリー操作と同型のメソッド群が用意されている。

```java
public CorporationGroupTreeNode getTree(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。法人グループセット全体のツリー
public CorporationGroupTreeNode getBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 指定法人グループを起点とした下位ツリー（枝）
public CorporationGroupTreeNode getUpBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 上位方向の枝

public CorporationGroupListNode[] getChildren(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 直下の子法人グループ
public CorporationGroupListNode[] getParent(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 親法人グループ
public CorporationGroupListNode[] getIsolation(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // 法人グループツリー上に存在しない孤立ノード

public CorporationGroupTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationGroupTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable

// 論理削除・無効データも含めた絶対位置版（isDisable オーバーロードあり）
public CorporationGroupTreeNode getAbsoluteBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupTreeNode getAbsoluteTree(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupTreeNode getAbsoluteUpBranch(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupListNode[] getAbsoluteChildren(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupListNode[] getAbsoluteParent(ICorporationGroupBizKey bizKey, Date date, Locale locale) throws BizApiException;
public CorporationGroupListNode[] getAbsoluteIsolation(ICorporationGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException;

// リストノード配列から完全なパス（祖先を含むリストノード列）を組み立てるユーティリティ
public CorporationGroupListNode[] getFullPathListNode(CorporationGroupListNode[] listNodes, Date date, Locale locale) throws BizApiException;
```

## 法人（`Corporation`）との紐付けメソッド

法人グループと法人（`jp.co.intra_mart.foundation.master.corporation` パッケージの `Corporation`）の多対多の所属関係（期間管理あり）を管理する。専用のモデルクラスは無く、`setCorporationAttach`/`removeCorporationAttach` 等のメソッドで操作する。

```java
// 所属付与／更新
public ITerm[] setCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, ITerm term) throws BizApiException;

// 所属解除
public void removeCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey) throws BizApiException;

// 所属期間の取得
public ITerm getCorporationAttachTerm(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, Date date) throws BizApiException;
public ITerm[] getCorporationAttachTermList(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey) throws BizApiException; // + isDisable
```

### 法人グループに属する法人の検索

```java
public CorporationListNode[] listCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationListNode[] searchCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationWithCorporationGroup(ICorporationGroupBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable
```

上位ツリー・下位ツリー版（`*WithCorporationGroupTree`/`*WithCorporationGroupUpTree`、それぞれ list/search/count/total）も同型で存在する。

### 法人グループが所属する法人グループセットに属する法人の検索

```java
public CorporationGroupListNode[] listCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public CorporationGroupListNode[] searchCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCorporationGroupWithCorporation(ICorporationBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable
```

## 期間操作（`CorporationGroup`/`CorporationGroupSet`/法人紐付け 共通パターン）

`CompanyManager` の `mergeBackwardTermDepartment`/`mergeForwardTermDepartment`/`moveTermDepartment`/`separateTermDepartment` と同じ設計思想の期間操作メソッドが、`CorporationGroup`・`CorporationGroupSet`・法人紐付け（`CorporationAttach`）それぞれに存在する。

```java
public void mergeBackwardTermCorporationGroup(ICorporationGroupBizKey bizKey, String termCd) throws BizApiException;
public void mergeForwardTermCorporationGroup(ICorporationGroupBizKey bizKey, String termCd) throws BizApiException;
public ITerm[] moveTermCorporationGroup(ICorporationGroupBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCorporationGroup(ICorporationGroupBizKey bizKey, String termCd, Date date) throws BizApiException;

public void mergeBackwardTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, String termCd) throws BizApiException;
public void mergeForwardTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, String termCd) throws BizApiException;
public ITerm[] moveTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCorporationGroupSet(ICorporationGroupSetBizKey bizKey, String termCd, Date date) throws BizApiException;

public void mergeBackwardTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, String termCd) throws BizApiException;
public void mergeForwardTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, String termCd) throws BizApiException;
public ITerm[] moveTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, ITerm term) throws BizApiException;
public ITerm separateTermCorporationAttach(ICorporationGroupBizKey corporationGroupBizKey, ICorporationBizKey corporationBizKey, String termCd, Date date) throws BizApiException;
```

`getTreeTerm`/`getTreeTermList` も存在するが、これらは `CorporationGroupSet` エンティティ自体の期間ではなく、**その法人グループセットが持つ法人グループツリー（`getTree` が返す構造）の期間**を操作・取得するものである（`CorporationGroupSet` モデル自体は `ITerm` を実装していない点に注意）。

```java
public ITerm getTreeTerm(ICorporationGroupSetBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getTreeTermList(ICorporationGroupSetBizKey bizKey) throws BizApiException; // + isDisable
```

## モデルクラス

### `CorporationGroup`（`CompanyManager` の `Department` に相当）

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

/**
 * 法人グループ情報を扱うモデルクラス
 * @since 8.0
 */
public class CorporationGroup implements ICorporationGroupBizKey, ISortable, IDisable, IRecorder,
        IWithLocale<ICorporationGroupElement>, ITerm, ICorporationGroupElement {
    private String companyCd;             // 会社コード（Department には無い、法人グループ固有のフィールド）
    private String corporationGroupCd;    // 法人グループコード
    private String corporationGroupSetCd; // 法人グループセットコード
    private Locale defaultLocale;         // デフォルトロケール
    private boolean disable;              // 削除フラグ
    private Date endDate;                 // 終了日
    private final Map<Locale, ICorporationGroupElement> localeElementMap; // 国際化情報マップ
    private Date recordDate;              // 更新日
    private String recordUserCd;          // 更新ユーザコード
    private int sortKey;                  // ソートキー
    private Date startDate;               // 開始日
    private String termCd;                // 期間コード
}
```

`Department` と同様に `ITerm`（期間管理）・`IWithLocale`（多言語対応、`ICorporationGroupElement` が法人グループ名・法人グループ検索名・法人グループ略称・備考を保持）を実装する複合キー＋期間管理モデルであり、`companyCd` を保持する点のみが差分。`companyCd`/`corporationGroupCd`/`corporationGroupSetCd` の各 getter には `@NotNullValidation`/`@LengthValidation`/`@CodeValidation` が付与されている。

### `ICorporationGroupBizKey` / `CorporationGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

public interface ICorporationGroupBizKey {
    String getCompanyCd();             // 会社コード
    String getCorporationGroupCd();    // 法人グループコード
    String getCorporationGroupSetCd(); // 法人グループセットコード
    void setCompanyCd(String companyCd);
    void setCorporationGroupCd(String corporationGrpCd);
    void setCorporationGroupSetCd(String corporationGrpSetCd);
}
```

法人グループのビジネスキーは `companyCd`/`corporationGroupSetCd`/`corporationGroupCd` の3要素。`CompanyManager` の `IDepartmentBizKey`（`companyCd`/`departmentSetCd`/`departmentCd`）と同型だが、パッケージ・クラス名が法人グループ専用に分離されている。`CorporationGroupBizKey` は `ICorporationGroupBizKey` の標準実装（3フィールド＋getter/setterのみ）。

### `CorporationGroupListNode`

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

public class CorporationGroupListNode implements ListNode, ICorporationGroupBizKey {
    private String companyCd;             // 会社コード
    private String corporationGroupCd;    // 法人グループコード
    private String corporationGroupSetCd; // 法人グループセットコード
    private String description = "";      // 記述名
    private boolean disable;              // 削除フラグ
    private String displayName = "";      // 表示名
    private String shortName = "";        // 略称
}
```

`getCorporationGroupCd()`/`getCorporationGroupSetCd()`/`getCompanyCd()`/`getDescription()`/`getDisplayName()`/`getShortName()`/`isDisable()` を持つ。`CompanyManager` の `DepartmentListNode` に `companyCd` が加わった構成に相当する。

### `CorporationGroupSet`

```java
package jp.co.intra_mart.foundation.master.corporation_group.model;

public class CorporationGroupSet implements ICorporationGroupSetBizKey, ISortable, IRecorder {
    private String companyCd;             // 会社コード
    private String corporationGroupSetCd; // 法人グループセットコード
    private Date recordDate;              // 更新日
    private String recordUserCd;          // 更新ユーザコード
    private int sortKey;                  // ソートキー
}
```

`Company`/`DepartmentSet` と同様、多言語名称フィールドを持たず `ITerm` も実装しない。`companyCd`/`corporationGroupSetCd` のみで法人グループセットを特定する。

## インポート・エクスポート

```java
public Set<String> getExportCategories(); // 例外なし
public Set<String> getImportCategories(); // 例外なし
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
