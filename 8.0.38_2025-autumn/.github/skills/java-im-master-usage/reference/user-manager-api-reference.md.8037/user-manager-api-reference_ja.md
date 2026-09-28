# UserManager API リファレンス（Java 版）

`im_master-main` モジュール（`jp.co.intra_mart.foundation.master.user.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## クラス概要

```java
package jp.co.intra_mart.foundation.master.user;

/**
 * ユーザ情報の取得と管理を行うマネージャクラス
 * @since 7.2
 */
public class UserManager extends AbstractManager {
```

- IM-共通マスタ（`im_master-main`）のユーザ情報 CRUD・検索を担うマネージャ。`AbstractManager`（更新者ユーザコード・デフォルトロケール・ログイングループID を保持する共通基底クラス）を継承する
- 内部に拡張ポイント（`jp.co.intra_mart.foundation.master.accessor.user`）を持ち、実際の読み取り/書き込み/通知/インポート/エクスポートはプラグイン実装（`UserReader`/`UserWriter`/`UserListener`/`UserImporter`/`UserExporter`）に委譲する

## コンストラクタ

| シグネチャ | 概要 |
|---|---|
| `public UserManager() throws BizApiException` | **推奨。** 更新者ユーザコード・デフォルトロケールに「現在ログイン中のユーザ」の値を使用する |
| `public UserManager(String updateUserCd) throws BizApiException` | 更新者ユーザコードを明示指定。デフォルトロケールは現在ログイン中のユーザのロケール |
| `public UserManager(String updateUserCd, Locale defaultLocale) throws BizApiException` | 更新者ユーザコード・デフォルトロケールを両方明示指定 |
| `public UserManager(String updateUserCd, Locale defaultLocale, String loginGroupId) throws BizApiException` | **`@Deprecated`**（`UserManager()` を使うこと） |

引数省略時に「現在ログイン中のユーザ」の値が採用される旨はクラス JavaDoc に明記されている（`updateUserCd`/`defaultLocale` それぞれ独立して省略可）。

## 例外

`jp.co.intra_mart.foundation.exception.BizApiException`（`FoundationException` → `Exception` を継承する**検査例外**）。コンストラクタ・public メソッドのほぼすべてが `throws BizApiException` を宣言している。

## メソッド一覧（ユーザ本体・`User`）

すべて `IUserBizKey`（ユーザコードを保持するインタフェース。`User` も実装）を引数の起点とする。`locale` を省略/`null` にすると全言語の国際化情報を取得する。`date` は基準日（期間管理のため）。

```java
// 単体取得（4オーバーロード: locale / isDisable の有無）
public User getUser(IUserBizKey bizKey, Date date) throws BizApiException;
public User getUser(IUserBizKey bizKey, Date date, boolean isDisable) throws BizApiException;
public User getUser(IUserBizKey bizKey, Date date, Locale locale) throws BizApiException;
public User getUser(IUserBizKey bizKey, Date date, Locale locale, boolean isDisable) throws BizApiException;

// 指定ユーザの全期間分を取得
public User[] getUserList(IUserBizKey bizKey) throws BizApiException; // + Locale / isDisable のオーバーロードあり

// 複数ユーザの一括取得
public User[] getUsers(IUserBizKey[] bizKey, Date date) throws BizApiException; // + Locale / isDisable のオーバーロードあり

// 条件検索・一覧（list系・search系は同一シグネチャ構成。3パターン: 引数なし/start・count付き/isDisable付き）
public UserListNode[] listUser(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public UserListNode[] listUser(AppCmnSearchCondition condition, Date date, Locale locale, int start, int count) throws BizApiException;
public UserListNode[] listUser(AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public UserListNode[] searchUser(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // 同型の別系統

// 件数取得
public int countUser(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + isDisable オーバーロード。locale 必須
public int totalUser(AppCmnSearchCondition condition, Date date) throws BizApiException; // + isDisable オーバーロード。ロケール指定なし（全言語対象）

// 新規登録／更新（期間コード有無で自動判定。このメソッドで期間の変更はできない）
public ITerm[] setUser(User user) throws BizApiException;

// 削除（3オーバーロード）
public void removeUser(IUserBizKey bizKey) throws BizApiException; // 全言語削除（関連情報も削除）
public void removeUser(IUserBizKey bizKey, Locale locale) throws BizApiException; // 指定言語のみ削除
public void removeUser(Locale locale) throws BizApiException; // 全ユーザから指定言語のデータを削除

// 期間操作
public void mergeBackwardTermUser(IUserBizKey bizKey, String termCd) throws BizApiException; // 直前の期間と結合
public void mergeForwardTermUser(IUserBizKey bizKey, String termCd) throws BizApiException; // 直後の期間と結合
public ITerm[] moveTermUser(IUserBizKey bizKey, ITerm term) throws BizApiException; // 期間を変更
public ITerm separateTermUser(IUserBizKey bizKey, String termCd, Date date) throws BizApiException; // 指定日で期間分割
```

### `setUser` の新規登録/更新の判定

JavaDoc: 「引数として与えられたユーザ情報について、期間コードが指定されていない場合は、ユーザ情報を新規登録します。期間コードが指定されている場合は、ユーザ情報を更新します。このメソッドで期間は変更できません。」

- `User` の `termCd`（`ITerm` インタフェース由来）が `null`/未設定 → 新規登録（戻り値に新規作成された `ITerm[]` が入る）
- `termCd` が設定済み → 更新（戻り値は空配列）
- **新規登録時（`termCd` 未設定時）は `startDate`/`endDate` の両方が必須。** `AppCmnValidationManager.validateModel` が `termCd == null` の場合に `startDate`/`endDate` の非 null チェックと `startDate < endDate` のチェックを行うため、未設定のまま `setUser` を呼ぶと `BizApiException`（「開始日にnullが設定されています」等）が送出される。システム開始日（固定値 `1900/01/01`）〜システム終了日（既定値 `3000/01/01`。拡張ポイント `jp.co.intra_mart.master.config.system_end_date` で変更可）の範囲内の日付を設定すること
- 期間そのものを変更したい場合は `moveTermUser`/`separateTermUser`/`mergeForwardTermUser`/`mergeBackwardTermUser` を使う

## メソッド一覧（ユーザ分類区分・分類区分項目）

`User` と同型の CRUD・検索パターンが、分類区分（`UserCtg`）・分類区分項目（`UserCtgItm`）にも用意されている。

```java
public UserCtg getUserCategory(IUserCtgBizKey bizKey) throws BizApiException; // + Locale オーバーロード
public UserCtgItm getUserCategoryItem(IUserCtgItmBizKey bizKey) throws BizApiException; // + Locale オーバーロード

public UserCtgListNode[] listUserCategory(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable
public UserCtgItmListNode[] listUserCategoryItem(AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException; // + start/count, isDisable

public int countUserCategory(AppCmnSearchCondition condition, Locale locale) throws BizApiException;
public int countUserCategoryItem(AppCmnSearchCondition condition, Locale locale) throws BizApiException;

public void setUserCategory(UserCtg userCategory) throws BizApiException; // Upsert
public void setUserCategoryItem(UserCtgItm userCategoryItem) throws BizApiException; // Upsert

public void removeUserCategory(IUserCtgBizKey bizKey) throws BizApiException; // + Locale オーバーロード、Locale のみの全件版
public void removeUserCategoryItem(IUserCtgItmBizKey bizKey) throws BizApiException; // + Locale オーバーロード、Locale のみの全件版
```

### ユーザ⇔分類区分項目の所属関係

```java
// 所属付与（ユーザに分類区分項目を紐付ける。期間付き）
public void setUserCategoryItemAttach(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey, ITerm term) throws BizApiException;
public void removeUserCategoryItemAttach(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey, String termCd) throws BizApiException;
public ITerm getUserCategoryItemAttachTerm(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey, Date date) throws BizApiException;
public ITerm[] getUserCategoryItemAttachTermList(IUserBizKey userBizKey, IUserCtgItmBizKey itemBizKey) throws BizApiException; // + isDisable

// クロス検索（特定ユーザに紐づく分類区分項目 / 特定分類区分項目が付与されたユーザ）
public UserCtgItmListNode[] listUserCategoryItemWithUser(IUserBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public UserListNode[] listUserWithUserCategoryItem(IUserCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale, int start, int count, boolean isDisable) throws BizApiException;
public int countUserCategoryItemWithUser(IUserBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
public int countUserWithUserCategoryItem(IUserCtgItmBizKey bizKey, AppCmnSearchCondition condition, Date date, Locale locale) throws BizApiException;
```

## `UserCtg` / `UserCtgItm` モデルクラス

```java
package jp.co.intra_mart.foundation.master.user.model;

public class UserCtg implements IUserCtgBizKey, ISortable, IDisable, IRecorder, IWithLocale<IUserCtgElement>, IUserCtgElement {
    private String categoryCd;      // ビジネスキー
    private String categoryType;    // 分類タイプ（IUserCtgBizKey には含まれない付随フィールド）
    private Locale defaultLocale;
    private final Map<Locale, IUserCtgElement> localeElementMap; // categoryName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}

public class UserCtgItm implements IUserCtgItmBizKey, ISortable, IDisable, IRecorder, IWithLocale<IUserCtgItmElement> {
    private String categoryCd;
    private String categoryItemCd;  // ビジネスキー（categoryCd と合わせて複合キー）
    private Locale defaultLocale;
    private final Map<Locale, IUserCtgItmElement> localeElementMap; // categoryItemName / notes
    private boolean disable;
    private int sortKey;
    private Date recordDate;
    private String recordUserCd;
}
```

いずれも期間管理（`ITerm`）は実装しない。`IUserCtgBizKey`（`categoryCd`）・`IUserCtgItmBizKey`（`categoryCd`/`categoryItemCd`）が対応するビジネスキーインタフェース。`PublicGroupCtg`/`PublicGroupCtgItm`（`reference/public-group-manager-api-reference.md`）とほぼ同型。

**`categoryType` は `varchar(1)` の1文字カラムである。** `@NotNullValidation` は付与されているが `@LengthValidation` が無いため、Java側のバリデーションでは文字数超過を検知できず、2文字以上を設定すると SQL 実行時に初めて `PSQLException`（値が長すぎる旨のエラー）を伴う `BizApiException` が送出される。

**`IUserCtgElement#getNotes()`/`IUserCtgItmElement#getNotes()` は `@LengthValidation` のみで `@NotNullValidation` が無い（任意項目）が、未設定（null）のまま `setUserCategory`/`setUserCategoryItem` を呼ぶと `NullPointerException` が送出される。** プラットフォーム側のバリデーション実装（`LengthPropertyValidityChecker`）が値の null チェックをせずに `toString()` を呼び出しているためである。`notes` を使わない場合でも空文字を明示的に設定すること。

## インポート・エクスポート

```java
public Set<String> getExportCategories(); // 例外なし
public Set<String> getImportCategories(); // 例外なし
public void exportData(String categoryName, InputStream inputStream) throws BizApiException;
public void importData(String categoryName, InputStream inputStream) throws BizApiException;
```

`categoryName` が対応する Categories に含まれない場合、`BizApiException`（"Export category not found: ..." / "Import category not found: ..."）が送出される。

## `User` モデルクラス

```java
package jp.co.intra_mart.foundation.master.user.model;

public class User implements IUserBizKey, ISortable, IDisable, IRecorder, IWithLocale<IUserElement>, ITerm, IUserElement {
```

| フィールド | 型 | 概要 |
|---|---|---|
| `userCd` | `String` | ユーザコード（`IUserBizKey`） |
| `defaultLocale` | `Locale` | デフォルトロケール |
| `localeElementMap` | `Map<Locale, IUserElement>` | ロケール別の国際化情報（`IWithLocale`） |
| `disable` | `boolean` | 論理削除フラグ |
| `startDate` / `endDate` / `termCd` | `Date` / `Date` / `String` | 期間情報（`ITerm`） |
| `recordDate` / `recordUserCd` | `Date` / `String` | 更新日・更新者ユーザコード（`IRecorder`） |
| `sex` | `String`（既定 `""`） | 性別。JavaDoc: `0:男性 1:女性 2:その他 9:回答しない` |
| `sortKey` | `int` | ソートキー（`ISortable`） |

国際化情報（`IUserElement`、デフォルトロケールへの委譲経由でアクセス可能）: `userName`（氏名）、`userSearchName`（検索用氏名）、`address1`〜`address3`（住所）、`zipCode`（郵便番号）、`countryCd`（国コード）、`telephoneNumber`（電話番号）、`extensionNumber`（内線番号）、`faxNumber`（FAX番号）、`extensionFaxNumber`（内線FAX番号）、`mobileNumber`（携帯電話番号）、`emailAddress1`/`emailAddress2`（メールアドレス）、`mobileEmailAddress`（モバイルメールアドレス）、`url`（URL）、`notes`（備考）。

```java
// デフォルトロケールの国際化情報への委譲アクセサの例
@Override
public IUserElement getDefaultLocaleElement() {
    return localeElementMap.get(defaultLocale);
}

@Override
public String getAddress1() {
    return getDefaultLocaleElement().getAddress1();
}

@Override
public void putLocaleElement(Locale locale, IUserElement element) {
    localeElementMap.put(locale, element);
}
```

`createLocaleElement()` は新しい `IUserElement` 実装（`UserElement`）インスタンスを生成するファクトリメソッド。ロケール別に氏名・住所等を登録する際は、`putLocaleElement(locale, user.createLocaleElement())` で要素を作成してから各セッタを呼ぶ。

## `IUserBizKey` インタフェース

```java
package jp.co.intra_mart.foundation.master.user.model;

public interface IUserBizKey {
    String getUserCd();
    void setUserCd(String userCd);
}
```

ユーザコードのみを保持するビジネスキー。`User` はこのインタフェースを実装しているため、`User` インスタンスをそのまま `IUserBizKey` 引数に渡せる。単にユーザコードだけを渡したい場合は `IUserBizKey` の軽量な実装クラスを作成するか、`User` を生成して `setUserCd` のみ呼ぶ。

## バリデーション基盤（補足）

各メソッドは処理本体の前段で以下のユーティリティによる引数検証を行う。検証エラー時は `BizApiException` 系がスローされる。

- `jp.co.intra_mart.foundation.validation.ModelValidationManager` — `validateNotNull`（null チェック）、`validateProperty`（`IUserBizKey` 等のプロパティ検証）
- `jp.co.intra_mart.system.master.validation.AppCmnValidationManager` — `validateDateRange`（基準日がシステム開始日〜終了日の範囲内かチェック）、`validateModel`（モデル全体のバリデーション）、`validateTerm`/`convertTerm`（期間情報の検証・正規化）

## マスタ更新ログ

登録・更新・削除系メソッドは `jp.co.intra_mart.system.log.masterlog.MasterLog` を使い、処理結果（成功/失敗）を `finally` ブロックで必ずログ出力する。ログメッセージIDは `IM-MASTERLOG.IMMUserManager.<メソッド名>.<連番>` の命名規則。アプリケーション側で明示的にログを呼ぶ必要はない（`UserManager` 内部で自動的に行われる）。
