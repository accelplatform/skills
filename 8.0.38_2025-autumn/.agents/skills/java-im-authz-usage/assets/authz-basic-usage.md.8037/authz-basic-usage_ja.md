# Authz API 基本利用パターン（Java 版）

`ResourceManager` / `SubjectManager` / `PolicyManager` / `AuthorizationClient` のシグネチャ・内部動作は `reference/authz-api-reference.md` を参照。ここでは典型的な呼び出しパターンを示す。

## パターン1: リソースの登録

`ResourceManager#registerAsResource(...)` でリソースURIを認可対象として登録し、対になる `ResourceGroup` を得る基本形。

```java
package jp.co.example.foo.service;

import java.util.Locale;

import jp.co.intra_mart.foundation.authz.model.I18nValue;
import jp.co.intra_mart.foundation.authz.model.resources.InvalidResourceUriException;
import jp.co.intra_mart.foundation.authz.model.resources.ResourceGroup;
import jp.co.intra_mart.foundation.authz.services.admin.ResourceManager;
import jp.co.intra_mart.foundation.authz.services.admin.ResourceManagerFactory;

import jp.co.example.foo.exception.ResourceRegistrationException;

/**
 * 認可リソースの登録処理を提供します。
 */
public class AuthzResourceRegistrationService {

    /** リソースURI のプレフィックス（先頭の "flat-crud" がリソースタイプID） */
    private static final String RESOURCE_URI_PREFIX = "flat-crud://myapp/orders/";

    /**
     * 発注データをリソースとして登録します。
     * @param orderId 発注ID
     * @param displayName リソースグループの表示名（日本語）
     * @throws ResourceRegistrationException 登録に失敗した場合
     */
    public void registerOrderResource(final String orderId, final String displayName) throws ResourceRegistrationException {
        final String resourceUri = RESOURCE_URI_PREFIX + orderId;   // 例: flat-crud://myapp/orders/ORD001
        final I18nValue<String> name = new I18nValue<String>(Locale.JAPANESE, displayName);

        // Manager インスタンスはテナントを跨いで使い回さず、都度 Factory から取得する
        final ResourceManager resourceManager = ResourceManagerFactory.getInstance().getResourceManager();
        try {
            final ResourceGroup resourceGroup = resourceManager.registerAsResource(resourceUri, name);
            // 必要であれば resourceGroup.getResourceGroupId() 等を呼び出し元へ返却する
        } catch (final InvalidResourceUriException e) {
            throw new ResourceRegistrationException("リソースURIの形式が不正です: resourceUri=" + resourceUri, e);
        }
    }
}
```

- リソースURIは `RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` 形式（使用できるリソースタイプは `reference/authz-api-reference.md`「標準リソースタイプとアクション」）。他アプリケーションと衝突しないよう、アプリケーション名・コンポーネント名による階層はリソースタイプIDより後ろのパス部分で表現する
- `I18nValue<String>` は `HashMap<Locale, String>` のサブクラス。複数ロケールの表示名を持たせたい場合は `put(locale, value)` を追加で呼ぶ
- `Manager` インスタンスはフィールドにキャッシュせず、呼び出しのたびに `Factory` から取得する（テナント切替時に使い回すと一部 API が失敗する設計のため）

## パターン2: サブジェクトグループの登録（`Expression` による条件式構成）

サブジェクトは単体では登録できず、`SubjectExpression.S(subject)` で式に変換したうえで `SubjectManager#registerSubjectGroup(Expression, ...)` に渡す。

```java
package jp.co.example.foo.service;

import java.util.Locale;

import jp.co.intra_mart.foundation.authz.model.I18nValue;
import jp.co.intra_mart.foundation.authz.model.subjects.Subject;
import jp.co.intra_mart.foundation.authz.model.subjects.SubjectGroup;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectExpression;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManager;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManagerFactory;
import jp.co.intra_mart.foundation.authz.util.expression.Expression;

/**
 * サブジェクトグループの登録処理を提供します。
 */
public class AuthzSubjectRegistrationService {

    /**
     * 単一のサブジェクト（例: 特定ロール）を表すサブジェクトグループを登録します。
     * @param subject 対象のサブジェクト（具体的な実装は拡張モジュール、例えば ImPublicGroupRoleSubject 等が提供する）
     * @param displayName サブジェクトグループの表示名
     * @return 登録されたサブジェクトグループ
     */
    public SubjectGroup registerSingleSubjectGroup(final Subject subject, final String displayName) {
        final Expression expression = SubjectExpression.S(subject);
        final I18nValue<String> name = new I18nValue<String>(Locale.JAPANESE, displayName);

        final SubjectManager subjectManager = SubjectManagerFactory.getInstance().getSubjectManager();
        return subjectManager.registerSubjectGroup(expression, name);
    }

    /**
     * 複数条件（AND/OR/NOT）を組み合わせたサブジェクトグループを登録します。
     * 例: subjectA に該当し、かつ subjectB には該当しないユーザ群。
     * @param subjectA AND 条件の対象サブジェクト
     * @param subjectB NOT 条件の対象サブジェクト
     * @param displayName サブジェクトグループの表示名
     * @return 登録されたサブジェクトグループ
     */
    public SubjectGroup registerCombinedSubjectGroup(final Subject subjectA, final Subject subjectB, final String displayName) {
        final Expression expression = Expression.AND(
                SubjectExpression.S(subjectA),
                Expression.NOT(SubjectExpression.S(subjectB)));
        final I18nValue<String> name = new I18nValue<String>(Locale.JAPANESE, displayName);

        final SubjectManager subjectManager = SubjectManagerFactory.getInstance().getSubjectManager();
        return subjectManager.registerSubjectGroup(expression, name);
    }
}
```

- `Subject` インスタンスは `SubjectManager#registerAsSubject(subjectTypeId, keys)` で採番する（次項参照）
- 「全ユーザ」「未認証ユーザ」に対するポリシーを設定したいだけの場合は、新規にサブジェクトグループを登録せず `SubjectManager#getAuthenticatedUsers()` / `getGuestSubjectGroup()` の組込みグループを使う（パターン3参照）

### ロール等をサブジェクトにする

`Subject` はサブジェクトタイプ ID とキー値から `registerAsSubject` で採番する。「ロールに所属するユーザに権限を与える」場合の実装。

```java
package jp.co.example.foo.service;

import java.util.Locale;

import jp.co.intra_mart.foundation.authz.model.I18nValue;
import jp.co.intra_mart.foundation.authz.model.subjects.Subject;
import jp.co.intra_mart.foundation.authz.model.subjects.SubjectGroup;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectExpression;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManager;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManagerFactory;
import jp.co.intra_mart.foundation.authz.subjecttype.im_master.ImRole;
import jp.co.intra_mart.foundation.authz.util.expression.Expression;

/**
 * ロールを条件とするサブジェクトグループの登録処理を提供します。
 */
public class RoleSubjectRegistrationService {

    /**
     * 指定したロールに所属するユーザ群を表すサブジェクトグループを登録します。
     * @param roleId ロールID
     * @param displayName サブジェクトグループの表示名
     * @return 登録されたサブジェクトグループ（既に存在する場合は既存のもの）
     */
    public SubjectGroup registerRoleSubjectGroup(final String roleId, final String displayName) {
        final SubjectManager subjectManager = SubjectManagerFactory.getInstance().getSubjectManager();

        // サブジェクトタイプIDとキー値（ロールはロールID 1 つ）からサブジェクトを採番する
        final Subject subject = subjectManager.registerAsSubject(ImRole.B_M_ROLE, roleId);

        // Subject 単体では登録できないため、Expression に変換してから SubjectGroup として登録する
        final Expression expression = SubjectExpression.S(subject);
        final I18nValue<String> name = new I18nValue<String>(Locale.JAPANESE, displayName);
        return subjectManager.registerSubjectGroup(expression, name);
    }
}
```

- キー値の個数・意味はサブジェクトタイプごとに異なる。ID 一覧は `reference/authz-api-reference.md`「標準サブジェクトタイプ」を参照
- `registerSubjectGroup` は既存があれば既存インスタンスを返すため、事前に `getSubjectGroupByExpression` で存在確認する必要はない

## パターン3: ポリシーの設定（許可・禁止の登録）

`PolicyManager#setPolicy(...)` でリソースグループ・サブジェクトグループ・アクション・エフェクトの組を登録する。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.authz.model.policies.Effect;
import jp.co.intra_mart.foundation.authz.model.policies.Policy;
import jp.co.intra_mart.foundation.authz.model.resources.ResourceGroup;
import jp.co.intra_mart.foundation.authz.model.subjects.SubjectGroup;
import jp.co.intra_mart.foundation.authz.services.admin.PolicyManager;
import jp.co.intra_mart.foundation.authz.services.admin.PolicyManagerFactory;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManager;
import jp.co.intra_mart.foundation.authz.services.admin.SubjectManagerFactory;

/**
 * ポリシーの設定処理を提供します。
 */
public class AuthzPolicyConfigurationService {

    /**
     * 認証済みユーザ全体に対して、指定したリソースグループ・アクションを許可します。
     * @param resourceGroup 対象のリソースグループ（ResourceManager#registerAsResource 等で取得済みのもの）
     * @param resourceTypeId リソースタイプID（例: "flat-crud"）
     * @param action アクション（リソースタイプが定義した値。flat-crud なら "c"/"r"/"u"/"d"）
     * @return 登録されたポリシー
     */
    public Policy permitForAllAuthenticatedUsers(final ResourceGroup resourceGroup, final String resourceTypeId, final String action) {
        final SubjectManager subjectManager = SubjectManagerFactory.getInstance().getSubjectManager();
        final SubjectGroup authenticatedUsers = subjectManager.getAuthenticatedUsers();

        final PolicyManager policyManager = PolicyManagerFactory.getInstance().getPolicyManager();
        // 文字列版の setPolicy は resourceGroupId / subjectGroupId / resourceTypeId / action / effect を直接指定する
        return policyManager.setPolicy(
                resourceGroup.getResourceGroupId(), authenticatedUsers.getSubjectGroupId(),
                resourceTypeId, action, Effect.PERMIT.toString());
    }
}
```

- `Effect` として登録できるのは基本的に `PERMIT` / `DENY`。`BLOCK` は認可判断の**結果**としてのみ現れる値であり、ポリシーとして直接登録すると `IllegalSerializationException` が発生する
- 同一の (リソースグループ, サブジェクトグループ, リソースタイプ, アクション) の組に対して再度 `setPolicy` を呼ぶと、既存のポリシーが上書きされる（新規登録・更新の両方を兼ねる API）

## パターン4: 権限確認（`AuthorizationClient`）

開発者が実際に「このユーザはこの操作をしてよいか」を判定する場合は `AuthorizationClient` を使う。`PolicyDecisionService`/`PolicyInformationService` を直接呼び出す必要は通常ない。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.authz.client.AuthorizationClient;
import jp.co.intra_mart.foundation.authz.client.AuthorizationClientFactory;
import jp.co.intra_mart.foundation.authz.client.AuthorizeResult;

import jp.co.example.foo.exception.ForbiddenOperationException;

/**
 * 発注データに対する権限確認処理を提供します。
 */
public class OrderAuthorizationService {

    /** リソースURI のプレフィックス（先頭の "flat-crud" がリソースタイプID）。登録処理と必ず同じ定数を使う */
    private static final String RESOURCE_URI_PREFIX = "flat-crud://myapp/orders/";

    /** 参照アクション（flat-crud の "r"） */
    public static final String ACTION_READ = "r";

    /** 更新アクション（flat-crud の "u"） */
    public static final String ACTION_UPDATE = "u";

    /**
     * アカウントコンテキストのユーザが、指定した発注データに対する操作を許可されているか確認します。
     * @param orderId 発注ID
     * @param action アクション（{@link #ACTION_READ} / {@link #ACTION_UPDATE}）
     * @throws ForbiddenOperationException 権限が許可されていない場合
     */
    public void assertPermitted(final String orderId, final String action) throws ForbiddenOperationException {
        final String resourceUri = buildResourceUri(orderId);

        final AuthorizationClient client = AuthorizationClientFactory.getInstance().getAuthorizationClient();
        final AuthorizeResult result = client.authorize(resourceUri, action);

        // 判定は必ず .equals() を使う（enum への将来の定数追加に対して安全なため）
        if (!AuthorizeResult.Permit.equals(result)) {
            throw new ForbiddenOperationException(
                    "この操作は許可されていません: resourceUri=" + resourceUri + ", action=" + action + ", result=" + result);
        }
    }

    /**
     * 指定したユーザコードを使用して権限確認を行います（アカウントコンテキストのユーザ以外を確認したい場合）。
     * @param userCd ユーザコード
     * @param orderId 発注ID
     * @param action アクション
     * @return 許可されている場合 true
     */
    public boolean isPermittedFor(final String userCd, final String orderId, final String action) {
        final AuthorizationClient client = AuthorizationClientFactory.getInstance().getAuthorizationClient();
        return AuthorizeResult.Permit.equals(client.authorize(buildResourceUri(orderId), action, userCd));
    }

    /** リソースURI を組み立てます（登録処理・確認処理で共通化する）。 */
    private static String buildResourceUri(final String orderId) {
        return RESOURCE_URI_PREFIX + orderId;
    }
}
```

- 引数を省略した場合はアカウントコンテキスト（現在ログイン中のユーザ）で自動判断される。バッチ処理等でユーザを明示したい場合は `userCd` を渡すオーバーロードを使う
- `resourceURI` はパターン1で登録した値と完全に一致させる必要がある。文字列を組み立てる箇所は登録処理・確認処理の両方で同一のロジックを使うこと（上記の `buildResourceUri` のように定数化・共通メソッド化する）

## パターン5: 実効ポリシーの参照と削除

`getDeclaredPolicy`（明示設定のみ）と `getActualPolicy`（継承補完済み）を使い分ける。管理画面で「現在この組み合わせにはどの権限が適用されているか」を表示する場合は `getActualPolicy` を使う。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.authz.model.policies.Policy;
import jp.co.intra_mart.foundation.authz.services.admin.PolicyManager;
import jp.co.intra_mart.foundation.authz.services.admin.PolicyManagerFactory;

/**
 * ポリシーの参照・解除処理を提供します。
 */
public class AuthzPolicyInspectionService {

    /**
     * 指定した組み合わせに実際に適用される実効ポリシー（継承補完済み）を取得します。
     * @param resourceGroupId リソースグループID
     * @param subjectGroupId サブジェクトグループID
     * @param resourceTypeId リソースタイプID
     * @param action アクション
     * @return 実効ポリシー
     */
    public Policy getEffectivePolicy(final String resourceGroupId, final String subjectGroupId, final String resourceTypeId, final String action) {
        final PolicyManager policyManager = PolicyManagerFactory.getInstance().getPolicyManager();
        return policyManager.getActualPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action);
    }

    /**
     * 明示的に登録されているポリシーのみを解除し、継承元の設定へフォールバックさせます。
     * @param resourceGroupId リソースグループID
     * @param subjectGroupId サブジェクトグループID
     * @param resourceTypeId リソースタイプID
     * @param action アクション
     */
    public void resetToInherited(final String resourceGroupId, final String subjectGroupId, final String resourceTypeId, final String action) {
        final PolicyManager policyManager = PolicyManagerFactory.getInstance().getPolicyManager();
        final Policy declared = policyManager.getDeclaredPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action);

        // 明示設定が存在しない場合（すでに継承元へフォールバック済み）は何もしない
        if (declared != null) {
            policyManager.removePolicy(declared);
        }
    }
}
```

- `getDeclaredPolicy(...)` は明示設定が無い場合 `null` を返す。呼び出し側で必ず null チェックを行う
- `removePolicy(...)` は明示設定を削除するのみで、継承元ポリシーへのフォールバックは残る点に注意（完全に「未設定」の状態にはならない）

## パターン6: アンチパターン集（避けること）

```java
// NG: AuthorizeResult を == や equals の引数逆順で比較する
// (result.equals(AuthorizeResult.Permit) 自体は動作するが、Javadoc の推奨は
//  AuthorizeResult.Permit.equals(result) 形式。null 安全性の観点からも定数側を起点にする)
if (result == AuthorizeResult.Permit) { // 将来 enum 定数が増えた場合の意図しない分岐リスク
    // ...
}

// NG: Subject を単体で登録しようとする（そのような API は存在しない）
// subjectManager.register(subject); // コンパイルエラー

// NG: Effect.BLOCK をポリシーとして直接登録する
// BLOCK は判断結果専用の値であり、ポリシー登録には PERMIT/DENY のみを使う
policyManager.setPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action, Effect.BLOCK.toString()); // IllegalSerializationException

// NG: Manager/Client インスタンスをテナントを跨いでフィールドにキャッシュする
public class BadService {
    // static フィールドにキャッシュすると、テナント切替時に一部 API が失敗する
    private static final ResourceManager RESOURCE_MANAGER = ResourceManagerFactory.getInstance().getResourceManager();
}

// NG: getDeclaredPolicy() の戻り値の null チェックを怠る
final Policy declared = policyManager.getDeclaredPolicy(resourceGroupId, subjectGroupId, resourceTypeId, action);
policyManager.removePolicy(declared); // declared が null の場合、実装依存の例外や無意味な呼び出しになる

// NG: リソースタイプIDとリソースURIを混同する
// 最初の ":" より前（= "service"）がリソースタイプIDとして解決される。
// service は URL 単位の認可専用でアクションは execute のみのため、view/approve 等は NoSuchActionException になる
private static final String RESOURCE_TYPE_ID = "service://myapp/orders";
final String resourceUri = RESOURCE_TYPE_ID + ":" + orderId;

// NG: リソースURIの組み立てロジックを登録処理と確認処理で重複させ、表記ゆれを生む
// 登録側: "flat-crud://myapp/orders/" + orderId
// 確認側: "flat-crud://myapp/orders:" + orderId  ← 区切り文字が違うため一致せず、権限が常に付与されない
```
