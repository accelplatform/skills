# PrivateGroupManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.private_group.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.private_group;

/**
 * プライベートグループ情報の取得と管理を行うマネージャクラス
 * @since 7.2
 */
public class PrivateGroupManager extends AbstractManager {
```

- IM-共通マスタ（`im_master-main`）のプライベートグループ情報 CRUD・検索を担うマネージャ。`AbstractManager`（更新者ユーザコード・デフォルトロケール・ログイングループID を保持する共通基底クラス）を継承する
- 内部に拡張ポイント（`jp.co.intra_mart.foundation.master.accessor.private_group`）を持ち、実際の読み取り/書き込み/通知/インポート/エクスポートはプラグイン実装（`PrivateGroupReader`/`PrivateGroupWriter`/`PrivateGroupListener`/`PrivateGroupImporter`/`PrivateGroupExporter`）に委譲する
- ユーザ・会社・法人グループの各マネージャと異なり、カテゴリ・ロール・ツリー機能を持たない。所有者（`userCd`）ごとのグループとそのメンバー（`setUserAttach`/`removeUserAttach`/`*WithPrivateGroup` 系）の管理に特化した小規模な API
- `User`/`Company` と異なり期間（`ITerm`）管理を持たない。`PrivateGroup` は `ITerm` を実装しない

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public PrivateGroupManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public PrivateGroupManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定。デフォルトロケールは現在ログイン中のユーザのロケール |
| `public PrivateGroupManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public PrivateGroupManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`PrivateGroupManager()` を使うこと） |

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（検査例外）。コンストラクタ・public メソッドのほぼすべてが `throws BizApiException` を宣言する。

## メソッド一覧

すべて `IPrivateGroupBizKey`（プライベートグループコード・ユーザコードの組を保持するインタフェース。`PrivateGroup` も実装）を引数の起点とする。

```java
// カウント
public int countPrivateGroup(AppCmnSearchCondition condition) throws BizApiException;
public int countUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable オーバーロード
public int totalUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable オーバーロード。ロケール指定なし（全言語対象）

// 単体取得。対象が存在しない場合は例外を送出せず null を返す
public PrivateGroup getPrivateGroup(IPrivateGroupBizKey bizKey) throws BizApiException;

// プライベートグループに所属するユーザの一覧・検索（3パターン: 引数なし/start・count付き/isDisable付き、いずれも同型）
public UserListNode[] listUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public UserListNode[] listUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException;
public UserListNode[] listUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public UserListNode[] searchUserWithPrivateGroup(IPrivateGroupBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 同型の別系統（+ start/count, isDisable オーバーロードあり）

// プライベートグループ自体の検索
public PrivateGroupListNode[] searchPrivateGroup(AppCmnSearchCondition condition) throws BizApiException;
public PrivateGroupListNode[] searchPrivateGroup(AppCmnSearchCondition condition, int start, int count) throws BizApiException;

// 新規登録／更新
public void setPrivateGroup(PrivateGroup privateGroup) throws BizApiException;
public void setUserAttach(IPrivateGroupBizKey privateGroupBizKey, IUserBizKey userBizKey, int sortKey) throws BizApiException;

// 削除
public void removePrivateGroup(IPrivateGroupBizKey bizKey) throws BizApiException;
public void removeUserAttach(IPrivateGroupBizKey privateGroupBizKey, IUserBizKey userBizKey) throws BizApiException;
```

`condition`（`AppCmnSearchCondition`）に指定できるテーブルは、プライベートグループ自体の操作（`countPrivateGroup`/`searchPrivateGroup`）では `imm_private_grp` テーブル、所属ユーザ絡みの操作（`countUserWithPrivateGroup`/`listUserWithPrivateGroup`/`searchUserWithPrivateGroup`/`totalUserWithPrivateGroup`）では `imm_user` テーブル。`list`/`search` 系の `start`/`count` は 1 開始、`count` を 0 にすると全件取得。

## `setPrivateGroup` / `setUserAttach` の新規登録・更新判定

`UserManager#setUser`（`termCd` の有無で判定）とは判定方法が異なる。`PrivateGroup` は `ITerm` を実装せず `termCd` を持たないため、**新規/更新の判定はマネージャ側ではなく `PrivateGroupWriter`/`IUserBizKey` の戻り値で行われる**。

- `setPrivateGroup(PrivateGroup)`: `executor.getWriter().setPrivateGroup(...)` の戻り値（`PrivateGroup`）が非 `null` なら新規登録（`PrivateGroupListener#createPrivateGroup` を発火）、`null` なら更新（`PrivateGroupListener#updatePrivateGroup` を発火）。呼び出し前に `AppCmnValidationManager.validateModel` によるモデル全体のバリデーションが行われる
- `setUserAttach(IPrivateGroupBizKey, IUserBizKey, int)`: `executor.getWriter().setUserAttach(...)` の戻り値（`IUserBizKey`）が非 `null` なら新規追加（`PrivateGroupListener#createUserAttach`）、`null` なら更新（`PrivateGroupListener#updateUserAttach`）。呼び出し前に `privateGroupBizKey`/`userBizKey` それぞれの `validateProperty` チェックのみ行われ、`sortKey` に対する明示的なバリデーションはメソッド内に存在しない
- どちらも新規/更新いずれの分岐かはリーダ/ライタ実装（拡張ポイント側）が対象データの存在有無を見て判断しており、`PrivateGroupManager` 自身は `termCd` のような呼び出し側の入力値では判定しない

## 削除・登録メソッドの内部ログ

登録・更新・削除系メソッド（`setPrivateGroup`/`setUserAttach`/`removePrivateGroup`/`removeUserAttach`/`importData`）は `jp.co.intra_mart.system.log.masterlog.MasterLog` を使い、処理結果（成功/失敗）を `finally` ブロックで必ずログ出力する。ログメッセージIDは `IM-MASTERLOG.IMMPrivateGroupManager.<メソッド名>.<連番>` の命名規則。アプリケーション側で明示的にログを呼ぶ必要はない。

## モデルクラス

### `PrivateGroup`

```java
package jp.co.intra_mart.foundation.master.private_group.model;

public class PrivateGroup implements IPrivateGroupBizKey, ISortable, IRecorder {
```

| フィールド | 型 | 概要 |
|---|---|---|
| `privateGroupCd` | `String` | プライベートグループコード（`IPrivateGroupBizKey`、必須） |
| `userCd` | `String` | **所有者コード**（`IPrivateGroupBizKey`、必須）。JavaDoc 上「所有者コード」であり、`IPrivateGroupBizKey` 側の一般的な説明（ユーザコード）とは意味が異なる点に注意 |
| `privateGroupName` | `String`（既定 `""`） | プライベートグループ名（必須） |
| `privateGroupSearchName` | `String`（既定 `""`） | プライベートグループ検索名 |
| `notes` | `String`（既定 `""`） | 備考 |
| `sortKey` | `int` | ソートキー（`ISortable`） |
| `recordDate` / `recordUserCd` | `Date` / `String` | 更新日・更新者ユーザコード（`IRecorder`） |

期間（`ITerm`）・国際化情報（`IWithLocale`）は実装しない。ロケールごとの多言語データを持たない単一言語モデル。

### `IPrivateGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.private_group.model;

public interface IPrivateGroupBizKey {
    String getPrivateGroupCd(); // @NotNullValidation @LengthValidation(min=1)
    void setPrivateGroupCd(String privateGroupCd);
    String getUserCd();         // @NotNullValidation @LengthValidation(min=1)
    void setUserCd(String userCd);
}
```

プライベートグループコードとユーザコードの組をビジネスキーとする。`PrivateGroup` はこのインタフェースを実装しているため、`PrivateGroup` インスタンスをそのまま `IPrivateGroupBizKey` 引数に渡せる。

### `PrivateGroupBizKey`

```java
package jp.co.intra_mart.foundation.master.private_group.model;

public class PrivateGroupBizKey implements IPrivateGroupBizKey {
```

`privateGroupCd`/`userCd` のみを保持する軽量な `IPrivateGroupBizKey` 実装クラス。ビジネスキーだけを渡したい場合（`PrivateGroup` 全体を組み立てずに済ませたい場合）に使用する。

## インポート・エクスポート

```java
public Set<String> getExportCategories(); // 例外なし
public Set<String> getImportCategories(); // 例外なし
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```

`categoryName` が対応する Categories に含まれない場合、`BizApiException`（"Export category not found: ..." / "Import category not found: ..."）が送出される。
