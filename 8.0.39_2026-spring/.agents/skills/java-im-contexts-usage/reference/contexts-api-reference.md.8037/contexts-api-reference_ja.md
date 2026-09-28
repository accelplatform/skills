# Contexts API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_core_base` / `im_user_context` / `im_job_scheduler_base` モジュール）
の実クラス定義に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.context（im_core_base）
├── Contexts                     … 公開 API。get(Class) が唯一のエントリーポイント
├── ContextStatus                … 認証・管理者判定のショートカット
├── ContextNotFoundException     … 非チェック例外（RuntimeException のサブクラス）
└── model
    ├── Context                  … 全 Context インタフェースの共通マーカーインタフェース
    ├── AccountContext           … アカウント・認証・ロケール情報
    ├── ClientContext            … クライアント種別
    ├── ExternalUserContext      … 外部ユーザー判定
    └── UserType                 … ユーザー種別を表す列挙型

jp.co.intra_mart.foundation.user_context.model（im_user_context）
├── UserContext                  … ユーザープロファイル・組織情報
├── UserProfile
├── Department / DepartmentPost
├── Company
├── PublicGroup / PublicGroupRole
└── UserCategory

jp.co.intra_mart.foundation.job_scheduler（im_job_scheduler_base）
├── JobSchedulerContext          … ジョブ実行コンテキスト
└── BaseJob                      … ジョブ実装の基底クラス（JobSchedulerContext 取得のユーティリティを提供）
```

## `Contexts` クラス

```java
package jp.co.intra_mart.foundation.context;

public final class Contexts {

    /**
     * アクセスコンテキスト取得。
     * 引数にマッチするアクセスコンテキストを、アクセスコンテキストストアから取得して返却します。
     * 利用可能なアクセスコンテキストの種類は、環境ごとに用意されます。
     * @param <T> コンテキスト種別を表すクラスを指定します。
     * @param type コンテキスト種別（アクセスコンテキストの種類を表すインタフェースの型）
     * @return 引数にマッチするアクセスコンテキストのインスタンス
     * @throws ContextNotFoundException システムで未定義のアクセスコンテキストを取得しようとした場合に発生します。
     */
    public static <T extends Context> T get(final Class<T> type);
}
```

- `private` コンストラクタのみのユーティリティクラス（インスタンス化不可）
- 内部では `ContextProducer`（`jp.co.intra_mart.system.context.ContextProducer`）にコンテキスト解決を委譲する
- **`ContextNotFoundException` は `RuntimeException` のサブクラスであり、非チェック例外。** メソッドシグネチャに `throws` は付与されていない（JavaDoc の `@throws` はドキュメント目的の記載であり、コンパイル上 `catch` や `throws` 宣言は強制されない）

## `ContextStatus` クラス

```java
package jp.co.intra_mart.foundation.context;

public final class ContextStatus {

    /** AccountContext のユーザ種別で判定します。 */
    public static boolean isAdministrator();

    /** AccountContext の認証状況で判定します。 */
    public static boolean isAuthenticated();

    /**
     * アカウントコンテキストのログイン署名の整合性をチェックします。
     * 未認証ユーザの場合、常に false となります。
     */
    public static boolean validate();
}
```

- 内部で `Contexts.get(AccountContext.class)` を呼ぶだけの薄いラッパー。`AccountContext` を他の情報でも使う場合は、`ContextStatus` 経由の呼び出しと `Contexts.get(AccountContext.class)` の直接呼び出しを混在させず、必要なら1回取得したインスタンスを使い回す（フィールド保持は禁止。メソッド内でのローカル変数としての使い回しは可）

## `AccountContext` インタフェース

パッケージ: `jp.co.intra_mart.foundation.context.model`（`im_core_base`）

> アクセスしたアカウントに関する情報を保持するアクセスコンテキスト。ユーザコードやロケールなどの
> アカウント情報、認証状況などを取得できる。**必須のアクセスコンテキストであり、運用中は常に取得可能。**
> 各設定値は、アカウント設定情報 → テナントのアカウント設定情報 → ブラウザ情報 →
> システムデフォルトのアカウント設定情報 → サーバ環境設定情報、の順序で解決される。

```java
public interface AccountContext extends Context {

    /** アプリケーションライセンス一覧を取得します。 */
    Set<String> getApplicationLicenses();

    /** カレンダーIDを取得します。 */
    String getCalendarId();

    /**
     * 日時表示形式一覧を取得します。内部APIで利用します。通常は直接利用する必要はありません。
     * @see jp.co.intra_mart.foundation.i18n.datetime.format.SystemDateTimeFormat#getFormats
     */
    Map<String, String> getDateTimeFormats();

    /** 数値形式のフォーマットIDを取得します。 @since 8.0.15 */
    String getDecimalFormatId();

    /** 文字エンコーディングを取得します。 */
    String getEncoding();

    /**
     * 週の開始曜日を取得します。取得できる値は java.util.Calendar#SUNDAY 〜 SATURDAY と同じ値。
     */
    int getFirstDayOfWeek();

    /** ホームURLを取得します。 */
    String getHomeUrl();

    /** ロケールを取得します。 */
    Locale getLocale();

    /**
     * ログイングループIDを取得します。テナントIDと同じ値。
     * @deprecated 互換のためのプロパティ。通常は利用しないこと。{@link #getTenantId()} を使う。
     */
    @Deprecated
    String getLoginGroupId();

    /** ログイン時刻を取得します。 */
    Date getLoginTime();

    /** ロールID一覧を取得します。サブロールも含んだ一覧が取得されます。 */
    Set<String> getRoleIds();

    /** ログイン署名を取得します。 */
    String getSignature();

    /**
     * テナントIDを取得します。アクセスしているユーザに応じたテナントIDが取得されます。
     * システム起動時などのユーザに依存しない処理の場合は null が取得されます。
     * @since 8.0.7
     */
    String getTenantId();

    /** テーマIDを取得します。 */
    String getThemeId();

    /** タイムゾーンを取得します。 */
    TimeZone getTimeZone();

    /**
     * ユーザコードを取得します。システム管理者の場合はシステム管理者のユーザコード、
     * 未認証ユーザの場合は未認証ユーザを表すユーザコードが取得されます。
     * このコードのみで処理を行わず、getUserType() / isAuthenticated() と合わせて利用すること。
     */
    String getUserCd();

    /** ユーザ種別を取得します。 */
    UserType getUserType();

    /** 認証状況を取得します。認証済みの場合 true。 */
    boolean isAuthenticated();
}
```

### `UserType` 列挙型

パッケージ: `jp.co.intra_mart.foundation.context.model`

```java
public enum UserType {
    ADMINISTRATOR("administrator"),  // システム管理者
    USER("user"),                    // 一般ユーザ
    PLATFORM("platform");            // プラットフォーム

    public static UserType value(final String value); // 文字列 → 列挙子（大文字化して valueOf）
    @Override
    public String toString(); // 上記の文字列表現（"administrator" 等）を返す
}
```

## `ClientContext` インタフェース

パッケージ: `jp.co.intra_mart.foundation.context.model`（`im_core_base`）

```java
public interface ClientContext extends Context {
    /** システムで定義されたクライアントタイプIdを取得します。 */
    String getClientTypeId();
}
```

## `ExternalUserContext` インタフェース

パッケージ: `jp.co.intra_mart.foundation.context.model`（`im_core_base`、`@since 8.0.13`）

```java
public interface ExternalUserContext extends Context {
    /** 外部ユーザかどうかを取得します。 */
    boolean isExternalUser();
}
```

## `UserContext` インタフェース

パッケージ: `jp.co.intra_mart.foundation.user_context.model`（`im_user_context`）

> `AccountContext.getUserCd()` に該当するユーザのユーザ情報を IM共通マスタから取得する。
> **組織所属に関する情報はデフォルト組織セットに限られる。デフォルト組織セット以外は取扱えない。**

```java
public interface UserContext extends Context {

    /** ユーザが所属する全ての組織を取得します。 */
    List<Department> getAllDepartments();

    /** ユーザが所属する全ての組織役職を取得します。 */
    List<DepartmentPost> getAllPosts();

    /** ユーザが所属する全ての会社を取得します。 */
    List<Company> getCompanyList();

    /** カレント組織を取得します。 */
    Department getCurrentDepartment();

    /** 会社別にユーザが所属する全ての組織を取得します。 */
    Map<String, List<Department>> getDepartmentByCompany();

    /** ユーザの主所属の組織を取得します。主所属を持たない場合、nullを返却します。 */
    Department getMainDepartment();

    /** ユーザの主所属の組織役職を取得します。 */
    List<DepartmentPost> getMainPostList();

    /** 会社別にユーザが所属する全ての組織役職を取得します。 */
    Map<String, List<DepartmentPost>> getPostByCompany();

    /** ユーザが所属する全てのパブリックグループを取得します。 */
    List<PublicGroup> getPublicGroupList();

    /** ユーザが所属する全てのパブリックグループ役割を取得します。 */
    List<PublicGroupRole> getPublicGroupRoleList();

    /** ユーザが所属するユーザ分類を取得します。 */
    List<UserCategory> getUserCategoryList();

    /** ユーザのプロファイルを取得します。 */
    UserProfile getUserProfile();
}
```

`Department` / `Company` / `DepartmentPost` / `PublicGroup` / `PublicGroupRole` / `UserCategory` はいずれも「ロケールに依存するデータは、ログインユーザのロケール → テナントロケール → システムロケール → 名称未定義、の順で解決する」という共通の仕様を持つ。

**`getUserProfile()` は `null` を返すことがある（プラットフォームの JavaDoc には明記されていない）。**
ジョブスケジューラ実行環境で `Contexts.get(UserContext.class)` は例外なく成功したが、`getUserProfile()` は `null` を返した事例がある。これは実行ユーザー（`AccountContext.getUserCd()`）が IM共通マスタに対応レコードを持たない技術アカウント（ジョブ実行用アカウント等）だったためと推定される。`UserContext` が取得できたからといって`getUserProfile()` の戻り値が非 `null` であるとは限らないため、呼び出し側で必ず `null` チェックを行うこと。

### `UserProfile`

```java
public interface UserProfile extends UserBizKeyConvertible, Serializable {
    String getAddress1();
    String getAddress2();
    String getAddress3();
    String getCountryCd();
    String getEmailAddress1();
    String getEmailAddress2();
    String getExtensionFaxNumber();
    String getExtensionNumber();
    String getFaxNumber();
    String getMobileEmailAddress();
    String getMobileNumber();
    String getNotes();
    String getSex();
    String getTelephoneNumber();
    String getUrl();
    String getUserCd();
    String getUserName();
    String getUserSearchName();
    String getZipCode();
}
```

### `Department`

```java
public interface Department extends DepartmentBizKeyConvertible, Serializable {
    String getCompanyCd();
    String getDepartmentCd();
    String getDepartmentFullName();
    String getDepartmentName();
    String getDepartmentSearchName();
    String getDepartmentSetCd();
    String getDepartmentShortName();
}
```

### `Company`

```java
public interface Company extends CompanyBizKeyConvertible, Serializable {
    String getCompanyCd();
    String getCompanyName();
    String getCompanySearchName();
    String getCompanyShortName();
}
```

### `DepartmentPost`（`Department` のプロパティ + 役職情報）

```java
public interface DepartmentPost extends DepartmentBizKeyConvertible, CompanyPostBizKeyConvertible, Serializable {
    String getCompanyCd();
    String getDepartmentCd();
    String getDepartmentFullName();
    String getDepartmentName();
    String getDepartmentSearchName();
    String getDepartmentSetCd();
    String getDepartmentShortName();
    String getPostCd();
    String getPostName();
    int getRank();
}
```

### `PublicGroup`

```java
public interface PublicGroup extends PublicGroupBizKeyConvertible, Serializable {
    String getPublicGroupCd();
    String getPublicGroupFullName();
    String getPublicGroupName();
    String getPublicGroupSearchName();
    String getPublicGroupSetCd();
    String getPublicGroupShortName();
}
```

### `PublicGroupRole`（`PublicGroup` のプロパティ + 役割情報）

```java
public interface PublicGroupRole extends PublicGroupBizKeyConvertible, PublicGroupRoleBizKeyConvertible, Serializable {
    String getPublicGroupCd();
    String getPublicGroupFullName();
    String getPublicGroupName();
    String getPublicGroupSearchName();
    String getPublicGroupSetCd();
    String getPublicGroupShortName();
    int getRank();
    String getRoleCd();
    String getRoleName();
}
```

### `UserCategory`

```java
public interface UserCategory extends UserCtgItmBizKeyConvertible, Serializable {
    String getCategoryCd();
    String getCategoryItemCd();
    String getCategoryItemName();
    String getCategoryName();
}
```

## `JobSchedulerContext` インタフェース

パッケージ: `jp.co.intra_mart.foundation.job_scheduler`（`im_job_scheduler_base`）

> ジョブスケジューラサービスからジョブの実行処理が呼び出される際にストアへ格納されるコンテキスト。
> 実行されたジョブネットに関する情報、モニタ/タスクを取得するためのID、ジョブネット内で共有される
> 実行中パラメータ等、ジョブネットの実行に関する情報を保持する。

```java
public interface JobSchedulerContext extends Context {

    /** ジョブネットを取得します。 */
    Jobnet getJobnet();

    /** ジョブ詳細を取得します。 */
    JobDetail getJobDetail();

    /** トリガを取得します。 */
    Trigger getTrigger();

    /** モニタIDを取得します。 */
    String getMonitorId();

    /** タスクIDを取得します。 */
    String getTaskId();

    /** 実行日時を取得します（現在日時ではなく、トリガーのスケジュール定義に従った実行されるべき日時）。 */
    Date getFireDate();

    /** 前回実行日時を取得します。初めて実行された場合は null。 */
    Date getPreviousFireDate();

    /** 次回実行日時を取得します。最後の実行契機の場合は null。 */
    Date getNextFireDate();

    /**
     * 実行中パラメータに追加されたパラメータを取得します。
     * putParameter(String, String) で追加されたパラメータのみを返却します。
     * ジョブ・ジョブネット・トリガに設定されているパラメータは含みません。
     */
    Map<String, String> getParameters();

    /**
     * 各パラメータから優先度に準じてマージされたパラメータマップを取得します。
     * ジョブ、ジョブネット、トリガ、実行中の順に上書きされたパラメータのマップ。
     */
    Map<String, String> getMergedParameters();

    /**
     * 指定されたキーのパラメータを優先度に準じて取得します。
     * 実行中 → トリガ → ジョブネット → ジョブ の順に指定されたキーのパラメータが
     * 存在した時点でその値を返却します（全てに存在しない場合 null）。
     */
    String getParameter(final String key);

    /** 実行中パラメータへ指定されたパラメータを追加します。getParameter() で優先的に返却されます。 */
    void putParameter(final String key, final String value);

    /** 実行中パラメータへ指定された全てのパラメータを追加します。 */
    void putParameters(final Map<String, String> map);
}
```

パラメータの優先度は「実行中パラメータ（`putParameter` で追加） > トリガ > ジョブネット > ジョブ」の順。
同一キーがジョブとジョブネットの両方に設定されている場合、ジョブネット側の値が優先される。

## `BaseJob` クラス（ジョブ実装の基底クラス）

パッケージ: `jp.co.intra_mart.foundation.job_scheduler`（`im_job_scheduler_base`）

```java
public abstract class BaseJob implements Job {

    @Override
    public abstract JobResult execute() throws JobExecuteException;

    /** ジョブコンテキストを取得します（Contexts.get(JobSchedulerContext.class) のラッパー）。 */
    protected JobSchedulerContext getJobContext();

    /**
     * 与えられたキーで JobSchedulerContext から取得したパラメータを返します。
     * @throws InvalidParameterException 取得したパラメータが null だった場合
     */
    protected String getParameter(final String key) throws InvalidParameterException;

    /**
     * 与えられたキーでパラメータを取得します。取得できなかった場合はデフォルト値を返します
     * （例外はスローされません）。
     */
    protected String getParameter(final String key, final String defaultValue);

    /**
     * 与えられたキーでパラメータを int に変換して取得します。
     * @throws InvalidParameterException パラメータが null もしくは int として不正な値だった場合
     */
    protected int getParameterAsInteger(final String key) throws InvalidParameterException;

    /** int変換版のデフォルト値付きオーバーロード（変換失敗時もデフォルト値、例外なし）。 */
    protected int getParameterAsInteger(final String key, final int defaultValue);
}
```

- ジョブ実装（`Job` インタフェースの実装クラス）はこの `BaseJob` を継承し、`execute()` を実装するのが標準パターン
- `JobSchedulerContext` を直接 `Contexts.get()` で取得するより、`BaseJob` の `protected` メソッド経由で
  パラメータ取得を行う方が、null 判定・型変換・デフォルト値処理を毎回書かずに済む

## `JobResult` クラス（`execute()` の戻り値）

パッケージ: `jp.co.intra_mart.foundation.job_scheduler`（`im_job_scheduler_base`）

```java
public class JobResult {

    /** 新しいジョブ実行結果を生成します。 */
    public JobResult(final Status status, final String message);

    /** ジョブ処理が正常に終了した事を示す実行結果を生成します。 */
    public static JobResult success(final String message);

    /**
     * ジョブ処理で警告（ジョブネットが継続可能なエラー）が発生した事を示す実行結果を生成します。
     * この実行結果が返却されるとジョブスケジューラサービスはジョブネットを継続します。
     */
    public static JobResult waring(final String message);

    /**
     * ジョブ処理でエラー（ジョブネットが継続不可能なエラー）が発生した事を示す実行結果を生成します。
     * この実行結果が返却されるとジョブスケジューラサービスはジョブネットを継続せずに終了します。
     */
    public static JobResult error(final String message);

    public Status getStatus();
    public String getMessage();
}
```

- **`JobResult.SUCCESS` のような定数は存在しない。** 必ず `success(String)` / `waring(String)` /
  `error(String)` のいずれかの静的ファクトリメソッドにメッセージを渡して生成すること
- **警告用メソッドの綴りは `waring`（"warning" ではない）。** プラットフォーム側の実装がこの綴りになっており、
  `warning(String)` は存在しないメソッド呼び出しとしてコンパイルエラーになる。呼び出し側で「正しい英単語」に修正しないよう注意する

## 参照ドキュメント

- Contexts Javadoc: `jp.co.intra_mart.foundation.context.Contexts`
- AccountContext Javadoc: `jp.co.intra_mart.foundation.context.model.AccountContext`
- UserContext Javadoc: `jp.co.intra_mart.foundation.user_context.model.UserContext`
- JobSchedulerContext Javadoc: `jp.co.intra_mart.foundation.job_scheduler.JobSchedulerContext`
