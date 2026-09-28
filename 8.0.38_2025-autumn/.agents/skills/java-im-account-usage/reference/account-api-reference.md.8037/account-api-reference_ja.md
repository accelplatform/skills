# Account API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_admin_base` モジュール）の実クラス定義に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.admin.account
└── AccountInfoManager             … 公開 API。final class

jp.co.intra_mart.foundation.admin.account.model
├── AccountInfo                    … アカウント情報モデル（Serializable）
└── AccountRoleInfo                … アカウント割当ロール情報モデル（Serializable）

jp.co.intra_mart.foundation.admin.account.password
└── AccountPasswordAdapter         … パスワードの照合・暗号化・復号

jp.co.intra_mart.foundation.admin.exception
├── AdminException                 … チェック例外。AccountInfoManager の全メソッドがスロー
└── PasswordException              … チェック例外。AccountPasswordAdapter の全メソッドがスロー（AdminException とは別系統）
```

## `AccountInfoManager` クラス

```java
package jp.co.intra_mart.foundation.admin.account;

public final class AccountInfoManager {

    /** アカウント属性として格納される数値形式の属性名です。 @since 8.0.15 */
    public static final String ATTR_DECIMAL_FORMAT = "im_i18n_decimal_format_id";

    public AccountInfoManager() {}

    /** アカウント情報を新規登録します。 */
    public void addAccountInfo(final AccountInfo accountInfo) throws AdminException;

    /** ユーザにロールを割り当てます。 */
    public void addAccountRoleInfo(final String userCd, final AccountRoleInfo accountRoleInfo) throws AdminException;

    /** 指定したユーザコードのアカウントが存在するか判定します。 */
    public boolean contains(final String userCd) throws AdminException;

    /** アカウント情報を削除します。 */
    public void deleteAccountInfo(final String userCd) throws AdminException;

    /** 全てのアカウント情報を削除します。 */
    public void deleteAccountInfos() throws AdminException;

    /** ユーザに割り当てられた特定のロールの割当を解除します。 */
    public void deleteAccountRoleInfo(final String userCd, final String roleId) throws AdminException;

    /** ユーザに割り当てられた全てのロールの割当を解除します。 */
    public void deleteAccountRoleInfos(final String userCd) throws AdminException;

    /** アカウント属性を削除します。 */
    public void deleteAttribute(final String userCd, final String name) throws AdminException;

    /** アカウントの全属性を削除します。 */
    public void deleteAttributes(final String userCd) throws AdminException;

    /**
     * アカウント情報を取得します。<br>
     * パスワード保存方式に「ハッシュ化」を利用している場合、戻り値の {@link AccountInfo} のパスワードは null になります。
     */
    public AccountInfo getAccountInfo(final String userCd) throws AdminException;

    /** アカウント情報の件数を取得します。 */
    public int getAccountInfoCount() throws AdminException;

    /** 全アカウント情報の一覧を取得します。データが無い場合は空の一覧を返します。 */
    public List<AccountInfo> getAccountInfos() throws AdminException;

    /** アカウント情報の一覧を取得件数指定で取得します。 */
    public List<AccountInfo> getAccountInfos(final int start, final int count) throws AdminException;

    /** ユーザコードを指定してアカウント情報の一覧を取得します。 */
    public List<AccountInfo> getAccountInfosByUserCds(final String... userCds) throws AdminException;

    /**
     * ユーザに直接割り当てられたロールID一覧を取得します。<br>
     * 有効期間フィルタはありません。直接割当のみが対象で、サブロール（子ロール）は含みません。
     */
    public List<String> getAccountRoleIds(final String userCd) throws AdminException;

    /**
     * 指定日時点でユーザに直接割り当てられている、有効なロールID一覧を取得します。<br>
     * 有効判定は「ロール有効開始日 &lt;= date &lt; ロール有効終了日」です。サブロール（子ロール）は含みません。
     */
    public List<String> getAccountRoleIds(final String userCd, final Date date) throws AdminException;

    /**
     * 指定日時点でユーザが保有する有効なロールID一覧を、サブロール（子ロール）を含めて再帰的に取得します。<br>
     * 有効判定は {@link #getAccountRoleIds(String, Date)} と同様です。
     */
    public List<String> getAccountRoleIdsRecursively(final String userCd, final Date date) throws AdminException;

    /** ユーザに直接割り当てられたロール割当情報（{@link AccountRoleInfo}）の一覧を取得します。 */
    public List<AccountRoleInfo> getAccountRoleInfos(final String userCd) throws AdminException;

    /** 指定日時点で有効なロール割当情報（{@link AccountRoleInfo}）の一覧を取得します。 */
    public List<AccountRoleInfo> getAccountRoleInfos(final String userCd, final Date date) throws AdminException;

    /** アカウント属性を取得します。データが無い場合は null を返します。 */
    public String getAttribute(final String userCd, final String name) throws AdminException;

    /** アカウント属性を取得します。データが無い場合はデフォルト値（第3引数）を返します。 */
    public String getAttribute(final String userCd, final String name, final String def) throws AdminException;

    /** ユーザが保有する属性名の一覧を取得します。 */
    public List<String> getAttributeNames(final String userCd) throws AdminException;

    /** 全ユーザコードの一覧を取得します。 */
    public List<String> getUserCds() throws AdminException;

    /**
     * 指定したロールIDが直接割り当てられているユーザコード一覧を取得します。<br>
     * ロール階層チェックは行われません（直接一致のみ）。
     */
    public List<String> getUserCdsByAccountRoleId(final String roleId) throws AdminException;

    /** 指定した属性名・属性値の組み合わせを持つユーザコード一覧を取得します。 */
    public List<String> getUserCdsByAttribute(final String key, final String value) throws AdminException;

    /**
     * 親ロールの階層を辿った上で、指定日時点で有効なアカウント付与ロールを持つユーザコード一覧を取得します。<br>
     * {@link #getUserCdsByAccountRoleId(String)}（直接一致のみ）とは挙動が異なります。
     */
    public List<String> getUserCdsByRoleId(final String roleId, final Date date) throws AdminException;

    /**
     * @deprecated 8.0.4 以降は常に true を返します。実質的に意味を持ちません。
     */
    @Deprecated
    public boolean isUpdate(final Date date) throws AdminException;

    /**
     * ユーザコードのワイルドカード検索でアカウント情報を検索します。<br>
     * ワイルドカード: {@code *} は0文字以上、{@code ?} は1文字。パスワード保存方式が「ハッシュ化」の場合、
     * 戻り値のパスワードは null になります。
     */
    public List<AccountInfo> searchAccountInfos(final String userCd) throws AdminException;

    /** ユーザコードのワイルドカード検索を、取得件数指定で行います。 */
    public List<AccountInfo> searchAccountInfos(final String userCd, final int start, final int count) throws AdminException;

    /**
     * アカウント属性を設定します。既に存在すれば更新、存在しなければ新規作成します。<br>
     * userCd・name・value のいずれも null・空文字は許可されません。
     */
    public void setAttribute(final String userCd, final String name, final String value) throws AdminException;

    /**
     * アカウント情報を更新します。<br>
     * {@link AccountInfo#getPassword()} が null の場合、パスワード以外のフィールドのみが更新されます。
     */
    public void updateAccountInfo(final AccountInfo accountInfo) throws AdminException;

    /** ユーザに割り当て済みのロール情報（有効期間等）を更新します。 */
    public void updateAccountRoleInfo(final String userCd, final AccountRoleInfo accountRoleInfo) throws AdminException;
}
```

## `AccountInfo` モデル

```java
package jp.co.intra_mart.foundation.admin.account.model;

public class AccountInfo implements Serializable {

    private Map<String, String> dateTimeFormats; // 日付表示形式一覧
    private String encoding;
    private String calendarId;
    private int firstDayOfWeek = -1;              // 週の開始曜日
    private Locale locale;                        // java.util.Locale 型（文字列ではない）
    private Date lockDate;                        // アカウントロック日付。ロックされていなければ null
    private int loginFailureCount;
    private String notes;
    private String password;
    private Map<String, String> themeIds;          // クライアント種別ID → テーマID
    private String timeZoneId;
    private String userCd;
    private Date validEndDate;
    private Date validStartDate;

    /**
     * インスタンスを生成します。<br>
     * userCd は必須です。有効開始日・有効終了日はシステム最小日付・システム最大日付に自動初期化されます。
     * @param userCd ユーザコード
     */
    public AccountInfo(final String userCd);

    public String getUserCd();
    public void setUserCd(final String userCd);

    public String getPassword();
    /**
     * パスワードを設定します。<br>
     * null を設定した状態で {@link jp.co.intra_mart.foundation.admin.account.AccountInfoManager#updateAccountInfo(AccountInfo)}
     * に渡すと、パスワード以外のフィールドのみが更新されます。
     */
    public void setPassword(final String password);

    public Locale getLocale();
    /** ロケールを設定します。文字列ではなく java.util.Locale 型で扱います。 */
    public void setLocale(final Locale locale);

    public String getTimeZoneId();
    public void setTimeZoneId(final String timeZoneId);

    public String getCalendarId();
    public void setCalendarId(final String calendarId);

    public int getFirstDayOfWeek();
    public void setFirstDayOfWeek(final int firstDayOfWeek);

    public Map<String, String> getDateTimeFormats();
    public void setDateTimeFormats(final Map<String, String> dateTimeFormats);

    public Map<String, String> getThemeIds();
    public void setThemeIds(final Map<String, String> themeIds);

    public String getEncoding();
    public void setEncoding(final String encoding);

    public Date getLockDate();
    /**
     * ロック日付を設定します。<br>
     * 非 null 値を設定するとロック状態になり、null を設定するとロック解除状態になります。
     */
    public void setLockDate(final Date lockDate);

    public int getLoginFailureCount();
    public void setLoginFailureCount(final int loginFailureCount);

    public String getNotes();
    public void setNotes(final String notes);

    public Date getValidStartDate();
    public void setValidStartDate(final Date validStartDate);

    public Date getValidEndDate();
    public void setValidEndDate(final Date validEndDate);
}
```

- `getter`/`setter` は上記フィールドに対応する標準的なものが定義されている
- ロック状態の判定は `getLockDate() != null` で行う（専用の `isLocked()` 相当のヘルパーメソッドは無い前提で実装すること。存在が確認できない限り呼び出さない）

## `AccountRoleInfo` モデル

```java
package jp.co.intra_mart.foundation.admin.account.model;

public class AccountRoleInfo implements Serializable {

    private String roleId;
    private Date roleValidEndDate;
    private Date roleValidStartDate;

    /**
     * インスタンスを生成します。<br>
     * roleId は必須です。有効開始日はシステム最小日付、有効終了日はシステム最大日付に自動初期化されます。
     * @param roleId ロールID
     */
    public AccountRoleInfo(final String roleId);

    public String getRoleId();

    public Date getRoleValidStartDate();
    public void setRoleValidStartDate(final Date roleValidStartDate);

    public Date getRoleValidEndDate();
    /**
     * ロール有効終了日を設定します。<br>
     * null を設定するとシステム最大日付にリセットされます。日付のみ保持され（時刻は 00:00:00）、
     * 有効なのは設定日の前日までです（判定式: 開始日 &lt;= 判定日 &lt; 終了日）。
     */
    public void setRoleValidEndDate(final Date roleValidEndDate);
}
```

## `AccountPasswordAdapter` クラス

```java
package jp.co.intra_mart.foundation.admin.account.password;

public class AccountPasswordAdapter {

    public AccountPasswordAdapter();

    /** パスワードの復号が可能な保存方式（可逆暗号化）かどうかを判定します。 */
    public boolean canDecrypt() throws PasswordException;

    /** 入力されたパスワードが、指定ユーザの保存済みパスワードと一致するか照合します。 */
    public boolean collate(final String userCd, final String password) throws PasswordException;

    /**
     * パスワードを復号します。<br>
     * {@link #canDecrypt()} が false（不可逆＝ハッシュ化保存）の場合は null を返します。
     */
    public String decrypt(final String userCd, final String password) throws PasswordException;

    /** パスワードを保存方式に応じて暗号化（またはハッシュ化）します。 */
    public String encrypt(final String userCd, final String password) throws PasswordException;
}
```

## 例外の扱い

```java
package jp.co.intra_mart.foundation.admin.exception;

/** AccountInfoManager の全メソッドがスローするチェック例外です。 */
public class AdminException extends FoundationException {
    public AdminException(final String message);
    public AdminException(final String message, final Throwable cause);
    public AdminException(final Throwable cause);
}

/**
 * AccountPasswordAdapter の全メソッドがスローするチェック例外です。<br>
 * AdminException とは別系統の例外クラスであるため、両方を扱う処理では catch ブロックを分ける必要があります。
 */
public class PasswordException extends Exception {
    public PasswordException(final String message);
    public PasswordException(final String message, final Throwable cause);
    public PasswordException(final Throwable cause);
}
```

- `AccountInfoManager` の全メソッドは `AdminException`（チェック例外）をスローする。呼び出し側は必ず `try`/`catch` するか、`throws` 宣言で呼び出し元に伝播させること
- `AccountPasswordAdapter` の全メソッドは `PasswordException`（チェック例外）をスローする。`AdminException` とは継承階層が異なる別系統の例外のため、両方の API を同一メソッド内で使う場合は 2 種類の `catch` が必要になる、または共通の親クラス（`Exception`）でまとめて捕捉する
- いずれも標準コンストラクタ（メッセージのみ／メッセージ＋cause／cause のみ）を持つ
