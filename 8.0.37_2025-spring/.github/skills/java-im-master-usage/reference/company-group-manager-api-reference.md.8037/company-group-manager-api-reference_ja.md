# CompanyGroupManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.company_group.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.company_group;

/**
 * 会社グループ情報の取得と管理を行うマネージャクラス
 * @since 7.2
 */
public class CompanyGroupManager extends AbstractManager {
```

- IM-共通マスタ（`im_master-main`）の会社グループ情報 CRUD・検索・階層（ツリー）操作を担うマネージャ。`AbstractManager`（更新者ユーザコード・デフォルトロケール・ログイングループID を保持する共通基底クラス）を継承する
- 内部に拡張ポイント（`jp.co.intra_mart.foundation.master.accessor.company_group`）を持ち、実際の読み取り/書き込み/通知/インポート/エクスポートはプラグイン実装（`CompanyGroupReader`/`CompanyGroupWriter`/`CompanyGroupListener`/`CompanyGroupImporter`/`CompanyGroupExporter`）に委譲する
- `Department`（`CompanyManager`）と同様の設計で、会社グループセット（`CompanyGroupSet`）配下に会社グループ（`CompanyGroup`）がツリー構造を構成し、期間管理（`termCd`/`startDate`/`endDate`）・多言語名称（`localeElementMap`）を持つ
- `Department` との違いは、ツリーのノードに紐づくのは組織ではなく「会社（`Company`）」である点。会社グループと会社の関連付けは `CompanyAttach`（専用モデルクラスなし、`setCompanyAttach`/`removeCompanyAttach` 系メソッドで操作）で管理する
- `changeExecutor` に相当する拡張ポイント切り替えメソッドは存在しない（`CompanyManager` にはあるが `CompanyGroupManager` にはない）

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public CompanyGroupManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public CompanyGroupManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定。デフォルトロケールは現在ログイン中のユーザのロケール |
| `public CompanyGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public CompanyGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`CompanyGroupManager()` を使うこと） |

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（検査例外）。コンストラクタ・public メソッドのほぼすべてが `throws BizApiException` を宣言する（`getExportCategories()`/`getImportCategories()` のみ例外なし）。

## 会社グループ（`CompanyGroup`）関連メソッド

`getCompanyGroup` は対象が存在しない場合、例外を送出せず `null` を返す。

```java
public CompanyGroup getCompanyGroup(ICompanyGroupBizKey bizKey, Date date) throws BizApiException; // + Locale, isDisable オーバーロード（4パターン）。存在しなければ null
public CompanyGroup[] getCompanyGroupList(ICompanyGroupBizKey bizKey) throws BizApiException; // 全期間分・全言語・有効データのみを取得（+ Locale, isDisable オーバーロード）

public CompanyGroupListNode[] listCompanyGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable オーバーロード
public CompanyGroupListNode[] searchCompanyGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // listCompanyGroup と同型の別系統

public int countCompanyGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalCompanyGroup(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。ロケール指定なし（全言語対象）

// 新規登録／更新（期間コード有無で自動判定。Department/CompanyPost と同じパターン）
public ITerm[] setCompanyGroup(CompanyGroup companyGroup) throws BizApiException;

public void removeCompanyGroup(ICompanyGroupBizKey bizKey) throws BizApiException; // 全言語削除
public void removeCompanyGroup(ICompanyGroupBizKey bizKey, Locale locale) throws BizApiException; // 指定言語のみ
public void removeCompanyGroup(Locale locale) throws BizApiException; // 全会社グループから指定言語のデータを削除
```

`setCompanyGroup` の JavaDoc:「引数として与えられた会社グループ情報について、期間コードが指定されていない場合は、会社グループ情報を新規登録します。期間コードが指定されている場合は、会社グループ情報を更新します。会社グループセットコードと会社グループコードが同一である場合は、会社グループセットと会社グループが作成されます。会社グループを追加する際にはセットを作成した上で、作成された会社グループセットにグループを追加します。このメソッドで期間は更新できません。」戻り値は登録された期間情報（`ITerm[]`）で、戻り値が空でない場合が新規登録（`CompanyGroupListener#createCompanyGroup` 発火）、空の場合が更新（`CompanyGroupListener#updateCompanyGroup` 発火）。

### 会社グループ内包（親子関係）の操作

```java
public void setCompanyGroupInclusion(ICompanyGroupBizKey bizKey, String parentCompanyGroupCd, String termCd) throws BizApiException; // 上位グループとの内包情報を作成
public void removeCompanyGroupInclusion(ICompanyGroupBizKey bizKey, String termCd) throws BizApiException;
```

### リストノードの整形

```java
public CompanyGroupListNode[] getFullPathListNode(CompanyGroupListNode[] listNodes, Date date, Locale locale) throws BizApiException;
```

会社グループリストノードの記述名を、会社グループツリーの階層を含めた名称に置き換える。引数のノードは変更せず、新しく作成されたインスタンスの配列を返す。

## 会社グループセット（`CompanyGroupSet`）関連メソッド

`CompanyGroupSet` は `ITerm` を実装しない（期間を持たない）。`getCompanyGroupSetAll`/`getCompanyGroupSet` に新規登録用メソッドはなく、`updateCompanyGroupSet` は既存レコードの更新用（`CompanyManager#updateDepartmentSet` と同様のパターン）。

```java
public CompanyGroupSet getCompanyGroupSet(ICompanyGroupSetBizKey bizKey) throws BizApiException;
public CompanyGroupSet[] getCompanyGroupSetAll() throws BizApiException;

public void updateCompanyGroupSet(CompanyGroupSet companyGroupSet) throws BizApiException;
public void removeCompanyGroupSet(ICompanyGroupSetBizKey bizKey) throws BizApiException;
```

`changeCompanyGroupSetState(ICompanyGroupSetBizKey bizKey, String termCd, boolean disable)` は会社グループセットではなく、そのセットが持つ会社グループツリーの内包（期間）データの削除フラグを更新するメソッド（`CompanyGroupListener#updateCompanyGroupSetTerm` を発火）。

## ツリー操作関連メソッド

```java
public CompanyGroupTreeNode getTree(ICompanyGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。会社グループセット全体のツリー
public CompanyGroupTreeNode getBranch(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。指定会社グループを起点とした下位ツリー（枝）
public CompanyGroupTreeNode getUpBranch(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。指定会社グループを起点とした上位方向の取得
public CompanyGroupListNode[] getChildren(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。直下の子会社グループ
public CompanyGroupListNode[] getParent(ICompanyGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。親会社グループ
public CompanyGroupListNode[] getIsolation(ICompanyGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。ツリー上に存在しない孤立ノード
public CompanyGroupTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable。ツリーのルート一覧
public CompanyGroupTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // listTreeRoot と同型の別系統

public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。ロケール指定なし
```

論理削除・無効データも含めた絶対位置版として `getAbsoluteChildren`/`getAbsoluteParent`/`getAbsoluteIsolation`/`getAbsoluteBranch`/`getAbsoluteUpBranch`/`getAbsoluteTree`（いずれも上記の対応メソッドと同じ引数パターン、`isDisable` オーバーロードあり）も存在する。`CompanyGroupTreeNode` は `CompanyGroupListNode` を継承し `addChild`/`getChildren`/`hasChildren`/`removeChild` を持つ。

## 会社（`Company`）との関連メソッド

会社グループと会社の関連付けは `CompanyAttach`（専用モデルクラスなし）で管理する。

```java
// 関連付け（期間管理あり）
public ITerm[] setCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, ITerm term) throws BizApiException;
public void removeCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey) throws BizApiException;

// 関連付け期間の取得
public ITerm getCompanyAttachTerm(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, Date date) throws BizApiException;
public ITerm[] getCompanyAttachTermList(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey) throws BizApiException; // + isDisable
```

会社グループに属する会社の一覧・検索（`listCompanyWithCompanyGroup`/`searchCompanyWithCompanyGroup`、ツリー配下版 `*WithCompanyGroupTree`、上位ツリー版 `*WithCompanyGroupUpTree`。いずれも `count*`/`total*` を含めた同型の系列）、逆方向（会社に属する会社グループの一覧・検索: `listCompanyGroupWithCompany`/`searchCompanyGroupWithCompany`/`countCompanyGroupWithCompany`/`totalCompanyGroupWithCompany`）も存在する。いずれも戻り値は `CompanyListNode[]` または `CompanyGroupListNode[]`（`CompanyGroupListNode` 自体のフィールド定義は本ファイル末尾を参照）。

## 期間操作

`Department`/`CompanyPost`/`UserAttach` と同じ設計思想の期間操作メソッドが、会社グループ本体・会社グループセットのツリー・会社の関連付け（`CompanyAttach`）それぞれに存在する。

```java
// 会社グループ本体
public ITerm getCompanyGroupTerm(ICompanyGroupBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getCompanyGroupTermList(ICompanyGroupBizKey bizKey) throws BizApiException; // + isDisable
public ITerm[] moveTermCompanyGroup(ICompanyGroupBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCompanyGroup(ICompanyGroupBizKey bizKey, String termCd, Date date) throws BizApiException;
public void mergeForwardTermCompanyGroup(ICompanyGroupBizKey bizKey, String termCd) throws BizApiException;
public void mergeBackwardTermCompanyGroup(ICompanyGroupBizKey bizKey, String termCd) throws BizApiException;

// 会社グループセットが持つツリーの期間（CompanyGroupSet モデル自体は ITerm 未実装）
public ITerm getTreeTerm(ICompanyGroupSetBizKey bizKey, Date date) throws BizApiException;
public ITerm[] getTreeTermList(ICompanyGroupSetBizKey bizKey) throws BizApiException; // + isDisable
public ITerm[] moveTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, ITerm term) throws BizApiException;
public ITerm separateTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, String termCd, Date date) throws BizApiException;
public void mergeForwardTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, String termCd) throws BizApiException;
public void mergeBackwardTermCompanyGroupSet(ICompanyGroupSetBizKey bizKey, String termCd) throws BizApiException;

// 会社との関連付け（CompanyAttach）
public ITerm[] moveTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, ITerm term) throws BizApiException;
public ITerm separateTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, String termCd, Date date) throws BizApiException;
public void mergeForwardTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, String termCd) throws BizApiException;
public void mergeBackwardTermCompanyAttach(ICompanyGroupBizKey companyGroupBizKey, ICompanyBizKey companyBizKey, String termCd) throws BizApiException;
```

## モデルクラス

### `CompanyGroup`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public class CompanyGroup implements ICompanyGroupBizKey, ISortable, IDisable, IRecorder,
        IWithLocale<ICompanyGroupElement>, ITerm, ICompanyGroupElement {
```

| フィールド | 型 | 概要 |
|---|---|---|
| `companyGroupCd` | `String` | 会社グループコード（`ICompanyGroupBizKey`、必須） |
| `companyGroupSetCd` | `String` | 会社グループセットコード（`ICompanyGroupBizKey`、必須） |
| `defaultLocale` | `Locale` | デフォルトロケール |
| `disable` | `boolean` | 削除フラグ（`IDisable`） |
| `startDate` / `endDate` / `termCd` | `Date` / `Date` / `String` | 期間（`ITerm`） |
| `localeElementMap` | `Map<Locale, ICompanyGroupElement>` | ロケールごとの国際化情報（`IWithLocale`）。`createLocaleElement()` で新規インスタンス（`CompanyGroupElement`）を生成する |
| `recordDate` / `recordUserCd` | `Date` / `String` | 更新日・更新者ユーザコード（`IRecorder`） |
| `sortKey` | `int` | ソートキー（`ISortable`） |

`Department` 同様、期間・多言語名称の両方を持つ中心的なモデル。

### `CompanyGroupSet`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public class CompanyGroupSet implements ICompanyGroupSetBizKey, ISortable, IRecorder {
```

`companyGroupSetCd`/`recordDate`/`recordUserCd`/`sortKey` のみを保持する軽量モデル。期間（`ITerm`）・多言語名称（`IWithLocale`）は実装しない。

### `CompanyGroupListNode` / `CompanyGroupTreeNode`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public class CompanyGroupListNode implements ListNode, ICompanyGroupBizKey {
```

| フィールド | 型 | 概要 |
|---|---|---|
| `companyGroupCd` | `String` | 会社グループコード |
| `companyGroupSetCd` | `String` | 会社グループセットコード |
| `description` | `String`（既定 `""`） | 記述名 |
| `disable` | `boolean` | 削除フラグ |
| `displayName` | `String`（既定 `""`） | 表示名 |
| `shortName` | `String`（既定 `""`） | 略称 |

`CompanyGroupTreeNode extends CompanyGroupListNode implements TreeNode<CompanyGroupTreeNode>` は上記フィールドに加え `childNodeList`（`List<CompanyGroupTreeNode>`）を持ち、`addChild`/`getChildren`/`hasChildren`/`removeChild` でツリー構造を操作する。

### `ICompanyGroupBizKey` / `CompanyGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.company_group.model;

public interface ICompanyGroupBizKey {
    String getCompanyGroupCd();    // @NotNullValidation @LengthValidation(min=1)
    void setCompanyGroupCd(String companyGrpCd);
    String getCompanyGroupSetCd(); // @NotNullValidation @LengthValidation(min=1)
    void setCompanyGroupSetCd(String companyGrpSetCd);
}
```

会社グループコードと会社グループセットコードの組をビジネスキーとする。`CompanyGroup`/`CompanyGroupListNode` はいずれもこのインタフェースを実装しているため、これらのインスタンスをそのまま `ICompanyGroupBizKey` 引数に渡せる。`CompanyGroupBizKey implements ICompanyGroupBizKey` はビジネスキーだけを保持する軽量な実装クラスで、`CompanyGroup` 全体を組み立てずに済ませたい場合に使用する。

## インポート・エクスポート

```java
public Set<String> getExportCategories(); // 例外なし
public Set<String> getImportCategories(); // 例外なし
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
