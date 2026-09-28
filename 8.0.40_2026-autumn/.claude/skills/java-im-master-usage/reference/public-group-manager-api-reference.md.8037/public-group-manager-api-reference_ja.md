# PublicGroupManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.public_group.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.public_group;

/**
 * パブリックグループ情報の取得と管理を行うマネージャクラス
 * @since 7.2
 */
public class PublicGroupManager extends AbstractManager {
```

**パブリックグループ（PublicGroup）・パブリックグループセット（PublicGroupSet）・パブリックグループ分類/分類項目（PublicGroupCtg/PublicGroupCtgItm）・パブリックグループの役割（PublicGroupRole）のすべてを、この1クラスが扱う。**

内部構造は `CompanyManager`/`UserManager` と同様、拡張ポイント（既定値 `jp.co.intra_mart.foundation.master.accessor.public_group`）経由でプラグイン実装（`PublicGroupReader`/`PublicGroupWriter`/`PublicGroupListener`/`PublicGroupImporter`/`PublicGroupExporter`）に処理を委譲する。ただし `CompanyManager`/`UserManager` に存在する `changeExecutor(String)`（拡張ポイントの実行時切り替え）に相当する public メソッドは `PublicGroupManager` には存在しない（拡張ポイントのセットアップは内部専用の `setUpExecutor()` のみで行われ、コンストラクタから呼び出される）。

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public PublicGroupManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public PublicGroupManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定 |
| `public PublicGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public PublicGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`PublicGroupManager()` を使うこと） |

引数省略時は「現在ログイン中のユーザ」の値が採用される。

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（検査例外）。コンストラクタ・CRUD・検索系すべてが一貫してこの例外のみを宣言する（`getExportCategories()`/`getImportCategories()` のみ例外なし）。

## パブリックグループ（`PublicGroup`）関連メソッド

`getPublicGroup` 系は対象が存在しない場合、例外を送出せず `null` を返す。

```java
public PublicGroup getPublicGroup(IPublicGroupBizKey bizKey, Date date) throws BizApiException; // + Locale, isDisable の組合せオーバーロードあり（計4種）

public PublicGroupListNode[] listPublicGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public PublicGroupListNode[] searchPublicGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // listPublicGroup と同型の別系統

public int countPublicGroup(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable
public int totalPublicGroup(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable。ロケール指定なし

public ITerm[] setPublicGroup(PublicGroup publicGroup) throws BizApiException; // 新規登録／更新（期間コード有無で自動判定）

public void removePublicGroup(IPublicGroupBizKey bizKey) throws BizApiException; // 全言語・関連情報を削除
public void removePublicGroup(IPublicGroupBizKey bizKey, Locale locale) throws BizApiException; // 指定言語のみ
public void removePublicGroup(Locale locale) throws BizApiException; // 全パブリックグループから指定言語のデータを削除
```

`Company`/`Department` と異なり、`PublicGroup` は `setPublicGroup` によって新規登録も更新も行える（期間コード `termCd` の有無で自動判定するパターン）。

### パブリックグループ内包（親子関係）の操作

```java
public void setPublicGroupInclusion(IPublicGroupBizKey bizKey, String parentPublicGroupCd, String childPublicGroupCd) throws BizApiException;
public void removePublicGroupInclusion(IPublicGroupBizKey bizKey, String childPublicGroupCd) throws BizApiException;
```

### 期間操作

`mergeBackwardTermPublicGroup`/`mergeForwardTermPublicGroup`/`moveTermPublicGroup`/`separateTermPublicGroup` が存在する（`Department`/`CompanyPost` と同じ設計思想）。

## パブリックグループセット（`PublicGroupSet`）関連メソッド

`PublicGroupSet` は `publicGroupSetCd`/`recordDate`/`recordUserCd`/`sortKey` の4フィールドのみで、`Company`/`DepartmentSet` と同様に多言語名称フィールドを持たず `ITerm` も実装しない。**`setPublicGroupSet`（新規登録用メソッド）は存在せず、`updatePublicGroupSet` は既存レコードの更新専用である。**

```java
public PublicGroupSet getPublicGroupSet(IPublicGroupSetBizKey bizKey) throws BizApiException;
public PublicGroupSet[] getPublicGroupSetAll() throws BizApiException;

public void updatePublicGroupSet(PublicGroupSet publicGroupSet) throws BizApiException; // 既存の更新専用
public void removePublicGroupSet(IPublicGroupSetBizKey bizKey) throws BizApiException;

public void changePublicGroupSetState(IPublicGroupSetBizKey bizKey, String termCd, boolean disable) throws BizApiException; // 指定期間の削除フラグを更新
```

`mergeBackwardTermPublicGroupSet`/`mergeForwardTermPublicGroupSet`/`moveTermPublicGroupSet`/`separateTermPublicGroupSet` も存在する。これらは `PublicGroupSet` エンティティ自体の期間ではなく、その配下の**パブリックグループツリー（`getTree` が返す構造）の期間**を操作するものである。

## パブリックグループ分類（`PublicGroupCtg`）・分類項目（`PublicGroupCtgItm`）関連メソッド

`PublicGroupCtg`（分類コード `categoryCd` + 分類タイプ `categoryType` + 多言語名称 + 削除フラグ）と `PublicGroupCtgItm`（分類コード `categoryCd` + 分類項目コード `categoryItemCd` + 多言語名称 + 削除フラグ）を扱う。いずれも期間管理（`ITerm`）は持たない。

```java
// 分類（PublicGroupCtg）
public PublicGroupCtg getPublicGroupCategory(IPublicGroupCtgBizKey bizKey) throws BizApiException; // + Locale
public PublicGroupCtgListNode[] listPublicGroupCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public PublicGroupCtgListNode[] searchPublicGroupCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countPublicGroupCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int totalPublicGroupCategory(AppCmnSearchCondition condition) throws BizApiException;
public void setPublicGroupCategory(PublicGroupCtg publicGroupCtg) throws BizApiException; // 新規登録／更新
public void removePublicGroupCategory(IPublicGroupCtgBizKey bizKey) throws BizApiException; // + Locale オーバーロード、Locale のみの全件版

// 分類項目（PublicGroupCtgItm）
public PublicGroupCtgItm getPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey) throws BizApiException; // + Locale
public PublicGroupCtgItmListNode[] listPublicGroupCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException; // + start/count, isDisable
public PublicGroupCtgItmListNode[] searchPublicGroupCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countPublicGroupCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int totalPublicGroupCategoryItem(AppCmnSearchCondition condition) throws BizApiException;
public void setPublicGroupCategoryItem(PublicGroupCtgItm publicGroupCtgItm) throws BizApiException; // 新規登録／更新
public void removePublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey) throws BizApiException; // + Locale オーバーロード、Locale のみの全件版
```

### パブリックグループと分類項目の関連付け

```java
// 関連付け（付与）
public void setPublicGroupCategoryItemAttach(IPublicGroupBizKey publicGroupBizKey, IPublicGroupCtgItmBizKey categoryItemBizKey, ITerm term) throws BizApiException;
// 関連解除
public void removePublicGroupCategoryItemAttach(IPublicGroupBizKey publicGroupBizKey, IPublicGroupCtgItmBizKey categoryItemBizKey, String termCd) throws BizApiException;

// 分類項目に紐づくパブリックグループの検索
public PublicGroupListNode[] listPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public PublicGroupListNode[] searchPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalPublicGroupWithPublicGroupCategoryItem(IPublicGroupCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException;

// パブリックグループに紐づく分類項目の検索
public PublicGroupCtgItmListNode[] listPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public PublicGroupCtgItmListNode[] searchPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalPublicGroupCategoryItemWithPublicGroup(IPublicGroupBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException;
```

各系統とも `isDisable` 引数を追加したオーバーロードが存在する。

## パブリックグループの役割（`PublicGroupRole`）関連メソッド

`PublicGroupRole` は `publicGroupSetCd`/`roleCd` の複合キー＋期間管理（`termCd`/`startDate`/`endDate`）＋多言語名称＋`rank`（ランク）フィールドを持つ、`Department`/`CompanyPost` とほぼ同型のモデル。

```java
public PublicGroupRole getPublicGroupRole(IPublicGroupRoleBizKey bizKey, Date date) throws BizApiException; // + Locale, isDisable の組合せオーバーロードあり（計4種）

public PublicGroupRoleListNode[] listPublicGroupRole(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public PublicGroupRoleListNode[] searchPublicGroupRole(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countPublicGroupRole(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalPublicGroupRole(AppCmnSearchCondition condition, Date date) throws BizApiException;

public ITerm[] setPublicGroupRole(PublicGroupRole publicGroupRole) throws BizApiException; // 新規登録／更新（期間コード有無で自動判定）

public void removePublicGroupRole(IPublicGroupRoleBizKey bizKey) throws BizApiException; // + Locale オーバーロード、Locale のみの全件版
```

`mergeBackwardTermPublicGroupRole`/`mergeForwardTermPublicGroupRole`/`moveTermPublicGroupRole`/`separateTermPublicGroupRole` も存在する。

### ユーザへの役割付与（`PublicGroupRoleAttach`）

パブリックグループに所属するユーザに対して役割を付与する。専用のモデルクラスは無く、`setPublicGroupRoleAttach`/`removePublicGroupRoleAttach` で操作する。

```java
public ITerm[] setPublicGroupRoleAttach(IPublicGroupBizKey publicGroupBizKey, IUserBizKey userBizKey, IPublicGroupRoleBizKey roleBizKey, String termCd) throws BizApiException;
public void removePublicGroupRoleAttach(IPublicGroupBizKey publicGroupBizKey, IUserBizKey userBizKey, IPublicGroupRoleBizKey roleBizKey, String termCd) throws BizApiException;
```

### 役割を軸にしたユーザ・パブリックグループの検索

役割で絞り込んでユーザ／パブリックグループを検索する系統が多数存在する。

```java
// 特定パブリックグループ上で、指定ユーザが持つ役割の検索
public PublicGroupRoleListNode[] listPublicGroupRoleWithUserOnPublicGroup(IUserBizKey userBizKey, IPublicGroupBizKey publicGroupBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

// 特定の役割・パブリックグループを持つユーザの検索
public UserListNode[] listUserWithPublicGroupRoleOnPublicGroup(IPublicGroupRoleBizKey roleBizKey, IPublicGroupBizKey publicGroupBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
// 複数の役割・パブリックグループの組（List）を条件にした版
public UserListNode[] listUserWithPublicGroupRoleOnPublicGroup(List bizKeyList, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

// 特定の役割を持つユーザの検索（パブリックグループ非限定）
public UserListNode[] listUserWithPublicGroupRole(IPublicGroupRoleBizKey roleBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;

// ユーザが持つ役割付きパブリックグループ一覧
public AttachPublicGroupListNode[] listPublicGroupWithUserRole(IUserBizKey userBizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
```

`list*`/`search*`/`count*`/`total*` の4系統が、`WithUserOnPublicGroup`/`WithPublicGroupRoleOnPublicGroup`/`WithPublicGroupRole`（単一キー版・`List` キー配列版）それぞれに揃っている（計 82 個の `*PublicGroup*` 系メソッドの大半がこのパターンの組合せで占められる）。個別の全シグネチャは `PublicGroupManager.java` を参照すること。

## ツリー操作

`PublicGroupSet` を起点としたツリー（`PublicGroupTreeNode`）取得・操作系。

```java
public PublicGroupTreeNode getTree(IPublicGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // + isDisable。パブリックグループセット全体のツリー
public PublicGroupTreeNode getBranch(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 指定パブリックグループを起点とした下位ツリー（枝）
public PublicGroupTreeNode getUpBranch(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 上位方向の枝
public PublicGroupListNode[] getChildren(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 直下の子
public PublicGroupListNode[] getParent(IPublicGroupBizKey bizKey, Date date, Locale locale) throws BizApiException; // 親
public PublicGroupListNode[] getIsolation(IPublicGroupSetBizKey bizKey, Date date, Locale locale) throws BizApiException; // ツリー上に存在しない孤立ノード
public PublicGroupTreeNode[] listTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public PublicGroupTreeNode[] searchTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countTreeRoot(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int totalTreeRoot(AppCmnSearchCondition condition, Date date) throws BizApiException;
```

`getAbsoluteBranch`/`getAbsoluteUpBranch`/`getAbsoluteChildren`/`getAbsoluteParent`/`getAbsoluteIsolation`（論理削除・無効データも含めた絶対位置版）も存在する。

## モデルクラス

### `PublicGroup`

```java
package jp.co.intra_mart.foundation.master.public_group.model;

public class PublicGroup implements IPublicGroupElement, IPublicGroupBizKey, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupElement>, ITerm {
    private Locale defaultLocale;
    private boolean disable;
    private Date endDate;
    private final Map<Locale, IPublicGroupElement> localeElementMap; // 多言語名称
    private String publicGroupCd;
    private String publicGroupSetCd;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
    private Date startDate;
    private String termCd;
}
```

`Department` と同様、複合キー（`publicGroupCd`/`publicGroupSetCd`）＋期間管理（`ITerm`）＋多言語名称（`IWithLocale`）を持つ、階層構造（パブリックグループツリー）を構成する中心的なモデル。

### `PublicGroupSet`

```java
public class PublicGroupSet implements IPublicGroupSetBizKey, ISortable, IRecorder {
    private String publicGroupSetCd;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
}
```

### `PublicGroupCtg` / `PublicGroupCtgItm`

```java
public class PublicGroupCtg implements IPublicGroupCtgElement, IPublicGroupCtgBizKey, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupCtgElement> {
    private String categoryCd;
    private String categoryType;
    private Locale defaultLocale;
    private boolean disable;
    private final Map<Locale, IPublicGroupCtgElement> localeElementMap;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
}

public class PublicGroupCtgItm implements IPublicGroupCtgItmElement, IPublicGroupCtgItmBizKey, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupCtgItmElement> {
    private String categoryCd;
    private String categoryItemCd;
    private Locale defaultLocale;
    private boolean disable;
    private final Map<Locale, IPublicGroupCtgItmElement> localeElementMap;
    private Date recordDate;
    private String recordUserCd;
    private int sortKey;
}
```

いずれも期間管理（`ITerm`）は実装しない。

### `PublicGroupRole`

```java
public class PublicGroupRole implements IPublicGroupRoleBizKey, IPublicGroupRoleElement, ISortable, IDisable, IRecorder, IWithLocale<IPublicGroupRoleElement>, ITerm {
    private Locale defaultLocale;
    private boolean disable;
    private Date endDate;
    private final Map<Locale, IPublicGroupRoleElement> localeElementMap;
    private String publicGroupSetCd;
    private int rank;
    private Date recordDate;
    private String recordUserCd;
    private String roleCd;
    private int sortKey;
    private Date startDate;
    private String termCd;
}
```

### ビジネスキーインタフェース・実装クラス

```java
public interface IPublicGroupBizKey {
    String getPublicGroupCd();
    String getPublicGroupSetCd();
    void setPublicGroupCd(String publicGroupCd);
    void setPublicGroupSetCd(String publicGroupSetCd);
}

public class PublicGroupBizKey implements IPublicGroupBizKey {
    // no-arg constructor + setPublicGroupCd/setPublicGroupSetCd
}

public class PublicGroupRoleBizKey implements IPublicGroupRoleBizKey {
    private String publicGroupSetCd;
    private String roleCd;
    // no-arg constructor + setPublicGroupSetCd/setRoleCd
}
```

`IPublicGroupSetBizKey`（`publicGroupSetCd` のみ）、`IPublicGroupCtgBizKey`（`categoryCd`）、`IPublicGroupCtgItmBizKey`（`categoryCd`/`categoryItemCd`）も同様のパターンで存在する。

### `PublicGroupListNode` / `PublicGroupTreeNode`

```java
public class PublicGroupListNode implements ListNode, IPublicGroupBizKey {
    private String description = "";
    boolean disable;
    private String displayName = "";
    private String publicGroupCd;
    private String publicGroupSetCd;
    private String shortName = "";

    public String getDescription();
    public String getDisplayName();
    public String getPublicGroupCd();
    public String getPublicGroupSetCd();
    public boolean isDisable();
    public String getShortName();
}

public class PublicGroupTreeNode extends PublicGroupListNode implements TreeNode<PublicGroupTreeNode> {
    private List<PublicGroupTreeNode> childNodeList;

    public void addChild(PublicGroupTreeNode child);
    public PublicGroupTreeNode[] getChildren();
    public boolean hasChildren();
    public PublicGroupTreeNode removeChild(PublicGroupTreeNode child);
}
```

`PublicGroupRoleListNode`/`PublicGroupCtgListNode`/`PublicGroupCtgItmListNode`/`AttachPublicGroupListNode` も存在し、それぞれ対応するモデルのビジネスキー・表示用フィールド（`description`/`displayName`/`shortName` 等）を持つ。

## インポート・エクスポート

```java
public Set<String> getExportCategories(); // 例外なし
public Set<String> getImportCategories(); // 例外なし
public void exportData(String categoryName, InputStream inputStream) throws BizApiException; // 引数名はinputStreamだがエクスポート処理に使われる（設定ファイル入力ストリーム）
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```
