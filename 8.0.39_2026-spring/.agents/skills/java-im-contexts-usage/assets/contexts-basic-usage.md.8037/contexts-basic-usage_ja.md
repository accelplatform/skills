# Contexts API 基本利用パターン（Java 版）

`reference/contexts-api-reference.md` のメソッドシグネチャに基づく実装パターン集。
実際のメソッド名・戻り値型は必ずリファレンスを確認し、記憶や推測で書かないこと。

## パターン1: サービス層でのユーザー情報取得・認証チェック

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.AccountContext;

public class {ServiceName}Service {

    public void process() {
        // Contexts.get() は null を返さない（取得できない場合は ContextNotFoundException をスローする）ため、
        // account に対する null チェックは不要（AccountContext は必須コンテキストのため通常は例外も発生しない）
        final AccountContext account = Contexts.get(AccountContext.class);
        if (!account.isAuthenticated()) {
            throw new {ServiceName}ServiceException("認証されたユーザーが必要です");
        }
        final String userCd = account.getUserCd();
        final String tenantId = account.getTenantId();
        // userCd / tenantId を使った業務処理
    }
}
```

`ContextStatus` を使う場合はより簡潔に書ける（ただし `userCd` 等が別途必要なら結局 `AccountContext` を取得する）。

```java
import jp.co.intra_mart.foundation.context.ContextStatus;

if (!ContextStatus.isAuthenticated()) {
    throw new {ServiceName}ServiceException("認証されたユーザーが必要です");
}
```

## パターン2: ロケール・タイムゾーンを使った国際化対応

```java
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.TimeZone;
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.AccountContext;

final AccountContext account = Contexts.get(AccountContext.class);
final Locale locale = account.getLocale();
final TimeZone timeZone = account.getTimeZone();

final SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd", locale);
sdf.setTimeZone(timeZone);
```

## パターン3: ユーザー所属組織情報の取得

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.user_context.model.Department;
import jp.co.intra_mart.foundation.user_context.model.UserContext;

final UserContext userCtx = Contexts.get(UserContext.class);
final Department mainDept = userCtx.getMainDepartment();
if (mainDept != null) {
    final String deptCd = mainDept.getDepartmentCd();
    final String deptName = mainDept.getDepartmentName();
    final String companyCd = mainDept.getCompanyCd();
    // 主所属を持たないユーザーの場合 mainDept は null になるため、必ず null チェックする
}
```

## パターン4: ユーザープロファイル情報の取得

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.user_context.model.UserContext;
import jp.co.intra_mart.foundation.user_context.model.UserProfile;

final UserContext userCtx = Contexts.get(UserContext.class);
final UserProfile profile = userCtx.getUserProfile();
// getUserProfile() は UserContext が取得できていても null になることがある
// （実行ユーザーが IM共通マスタに対応レコードを持たない技術アカウントの場合等）
if (profile != null) {
    final String userName = profile.getUserName();
    final String email = profile.getEmailAddress1();
    // userName / email はログに出力しない（個人情報のため）
}
```

## パターン5: ジョブ内でのパラメータ取得（`BaseJob` 継承）

```java
import jp.co.intra_mart.foundation.job_scheduler.BaseJob;
import jp.co.intra_mart.foundation.job_scheduler.JobResult;
import jp.co.intra_mart.foundation.job_scheduler.exception.InvalidParameterException;
import jp.co.intra_mart.foundation.job_scheduler.exception.JobExecuteException;

public class {JobName}Job extends BaseJob {

    @Override
    public JobResult execute() throws JobExecuteException {
        try {
            // 必須パラメータ（存在しない場合 InvalidParameterException）
            final String targetCd = getParameter("targetCd");

            // 任意パラメータ（存在しない場合デフォルト値を返す。例外なし）
            final String mode = getParameter("mode", "default");
            final int retryCount = getParameterAsInteger("retryCount", 3);

            // 業務処理
            return JobResult.success("処理が完了しました");

        } catch (final InvalidParameterException e) {
            throw new JobExecuteException("必須パラメータが指定されていません: " + e.getMessage(), e);
        }
    }
}
```

`JobSchedulerContext` を直接 `Contexts.get(JobSchedulerContext.class)` で取得することも可能だが、`BaseJob` を継承している場合は `protected` の `getParameter()` / `getParameterAsInteger()` を優先して使う（null 判定・型変換・デフォルト値処理が既に実装されている）。

**`JobResult` に `SUCCESS` 等の定数は存在しない。** 静的ファクトリメソッド `success(String)` /
`waring(String)`（**"warning" ではなく綴りが `waring` になっている、プラットフォーム側の実装の綴り**。
呼び出し側で綴りを「修正」すると存在しないメソッド呼び出しになるため注意） / `error(String)` を使ってメッセージ付きで生成すること。詳細は `reference/contexts-api-reference.md` を参照。

## パターン6: クライアント種別・外部ユーザー判定

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.ClientContext;
import jp.co.intra_mart.foundation.context.model.ExternalUserContext;

final ClientContext clientCtx = Contexts.get(ClientContext.class);
final String clientTypeId = clientCtx.getClientTypeId();

final ExternalUserContext externalCtx = Contexts.get(ExternalUserContext.class);
if (externalCtx.isExternalUser()) {
    // 外部ユーザー向けの分岐処理
}
```

## アンチパターン

| パターン | 問題 | 対策 |
|---|---|---|
| `Contexts.get()` の戻り値を null チェックする | 到達しない死コード（`Contexts.get()` は null を返さず、取得できない場合は `ContextNotFoundException` をスローする） | null チェックではなく、取得できない可能性がある実行環境では `ContextNotFoundException` の catch を検討する |
| ネストした getter の戻り値（`getMainDepartment()` / `getUserProfile()` 等）の null チェック漏れ | `NullPointerException` | これらは `Contexts.get()` 自体とは別に、仕様として null を返し得るためチェックする（`getUserProfile()` がこの挙動を持つことはプラットフォームの JavaDoc に未記載） |
| 認証チェック漏れ | 未認証ユーザーで業務処理を実行してしまう | `isAuthenticated()` を確認する |
| コンテキストのフィールド保持・キャッシュ | リクエスト間でユーザー情報が混在する | メソッド内で都度取得する |
| ジョブで `UserContext` を取得 | 実行環境によって取得できない場合がある | `JobSchedulerContext`（`BaseJob` 経由）を使う |
| インフラ層（DAO/Repository）で `Contexts` を直接呼び出す | レイヤー依存性違反 | サービス層から引数で渡す |
| `UserProfile` の個人情報（氏名・メールアドレス等）をログ出力 | 個人情報漏洩リスク | ユーザーコードのみ出力する |
| `getLoginGroupId()` を新規実装で使用 | 非推奨（`@Deprecated`）プロパティへの依存 | `getTenantId()` を使う |
