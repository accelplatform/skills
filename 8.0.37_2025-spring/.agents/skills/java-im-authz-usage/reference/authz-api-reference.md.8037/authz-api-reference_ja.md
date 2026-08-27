# Authz API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_authz_base` モジュール = 公開 API）の実インタフェース定義に基づく。記憶や推測でメソッドを補わないこと。

`im_authz_base` は**インタフェースのみ**を公開しており、実装クラス（`im_authz_impl` モジュールの `InHouse*` 系）は直接参照しない。全てのマネージャ／サービスは対応する `*Factory` クラス経由で取得する。

各インタフェースは検索・カウント系のオーバーロードを多数持つ大規模なものが多い（`ResourceManager` は約60メソッド、`SubjectManager` は約30メソッド）。本リファレンスは CRUD・権限確認の中核パターンに絞って掲載する。網羅的な検索条件が必要な場合は元インタフェース（コアソース）を直接確認すること。

## パッケージ構成

```
jp.co.intra_mart.foundation.authz.model
├── I18nValue<V>                        … ロケール別値（HashMap<Locale, V> のサブクラス）
├── resources.Resource                  … リソースモデル（Serializable インタフェース）
├── resources.ResourceGroup             … リソースグループモデル（リソースの名称・説明・階層を保持）
├── resources.ResourceType<T>           … リソースタイプ（アクション候補の決定要素）
├── subjects.Subject                    … サブジェクトモデル
├── subjects.SubjectGroup               … サブジェクトグループモデル（Expression から生成）
├── subjects.SubjectType<T>             … サブジェクトタイプ
├── actions.Action                      … アクションモデル
└── policies.{Policy, Effect}           … ポリシーモデル・エフェクト enum（PERMIT/DENY/BLOCK/NOT_APPLICABLE）

jp.co.intra_mart.foundation.authz.util.expression
└── Expression                          … サブジェクト式（AND/OR/NOT の論理演算）
    └── (services.admin.)SubjectExpression.S(subject) … Subject 単体を Expression に変換する起点

jp.co.intra_mart.foundation.authz.services.admin
├── ResourceManager (+ ResourceManagerFactory)          … リソース／リソースグループの CRUD
├── SubjectManager (+ SubjectManagerFactory)            … サブジェクトグループの CRUD
├── PolicyManager (+ PolicyManagerFactory)              … ポリシーの CRUD
├── ResourceAttributeManager (+ ...Factory)             … リソース属性の管理
├── PolicyAdminInformation (+ ...Factory)               … 管理画面向け補助情報
└── block.{ResourceBlocker, CachedResourceBlocker} (+ ...Factory)  … リソースの閉塞（BLOCK）制御

jp.co.intra_mart.foundation.authz.services.decision
└── PolicyDecisionService (+ PolicyDecisionServiceFactory)   … PDP（内部利用が中心）

jp.co.intra_mart.foundation.authz.client
├── AuthorizationClient (+ AuthorizationClientFactory)  … 権限確認の推奨エントリポイント
└── PolicyInformationService (+ PolicyInformationServicetFactory)  … PIP（内部利用が中心。Factory 名の綴りは原文どおり `Servicet`）
```

## モデルインタフェース

### `Resource`

```java
package jp.co.intra_mart.foundation.authz.model.resources;

public interface Resource extends Serializable {
    /** リソースID（システム内部用。通常は使用しない） */
    String getResourceId();
    /** リソースタイプ */
    ResourceType<?> getType();
    /** リソースURI（RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT 形式。例: service://authz/settings/basic） */
    String getUri();
}
```

- リソースのキーは **リソースURI**。名称・説明は持たず、対になる `ResourceGroup` が保持する
- `ResourceManager` でリソースを登録すると、対になる `ResourceGroup` が1つ作成される

### `Subject`

```java
package jp.co.intra_mart.foundation.authz.model.subjects;

public interface Subject extends Serializable {
    /** サブジェクトID（システム内部用。通常は使用しない） */
    String getSubjectId();
    /** サブジェクトタイプ */
    SubjectType<?> getType();
}
```

- `Subject` は単体では登録できない。`SubjectExpression.S(subject)` で `Expression` に変換し、`SubjectManager#registerSubjectGroup(Expression, ...)` で `SubjectGroup` として登録する
- 具体的な `Subject` 実装（組織・パブリックグループ・ロール等）は `im_master_subjecttypes` モジュール（例: `ImDepartmentSubject`、`ImPublicGroupRoleSubject`）等の拡張モジュールが提供する

### `Policy`

```java
package jp.co.intra_mart.foundation.authz.model.policies;

public interface Policy extends Serializable {
    /** ポリシーID（システム内部用） */
    String getPolicyId();
    /** リソース（何を）を示すリソースグループID */
    String getResourceGroupId();
    /** リソースタイプID（アクションの候補を決定する要素。アクションとセットで扱う） */
    String getResourceTypeId();
    /** サブジェクト（誰が）を示すサブジェクトグループID */
    String getSubjectGroupId();
    /** アクション（どうする） */
    String getAction();
    void setAction(Action action);
    void setAction(String action);
    /** エフェクト（許可・禁止） */
    Effect getEffect();
    /** 継承元のポリシー。明示登録されている場合は null */
    Policy getDeclaredPolicy();
    /** 明示的に登録されているポリシーかどうか */
    boolean isDeclared();
}
```

### `Effect`（enum）

```java
package jp.co.intra_mart.foundation.authz.model.policies;

public enum Effect {
    /** 許可 */
    PERMIT,
    /** 拒否 */
    DENY,
    /** 閉塞（認可の判断結果でのみ使用可能。ポリシーとして PERMIT/DENY 以外の enum 定数を登録すると IllegalSerializationException） */
    BLOCK,
    /** 判断不可 */
    NOT_APPLICABLE
}
```

- `PolicyManager#setPolicy(...)` で登録可能なのは基本的に `PERMIT` / `DENY`。`BLOCK` は認可判断の**結果**としてのみ現れる値であり、ポリシーとして直接登録すると例外が発生する

### `AuthorizeResult`（enum、`client` パッケージ）

```java
package jp.co.intra_mart.foundation.authz.client;

public enum AuthorizeResult {
    /** 許可 */
    Permit,
    /** 禁止 */
    Deny,
    /** 閉塞 */
    Block
}
```

- 判定は必ず `AuthorizeResult.Permit.equals(result)` の形で行う（`result == AuthorizeResult.Permit` ではなく `.equals()` を使う）。将来 enum 定数が追加された場合でも安全に判定できるようにするための Javadoc 上の明示的な推奨事項

## `ResourceManager`（リソース CRUD）

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public interface ResourceManager {

    /**
     * リソースURIをリソースとして登録し、対になるリソースグループを作成します。
     * @param resourceURI リソースURI
     * @param displayName リソースグループの表示名
     * @throws InvalidResourceUriException リソースURIの形式が不正な場合
     */
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description, ResourceGroup parent) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description, String newGroupId) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, I18nValue<String> description, String newGroupId, ResourceGroup parent) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, ResourceGroup parent) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, String newGroupId) throws InvalidResourceUriException;
    ResourceGroup registerAsResource(String resourceURI, I18nValue<String> displayName, String newGroupId, ResourceGroup parent) throws InvalidResourceUriException;

    /** リソースを持たない、分類目的のみのリソースグループを登録します。 */
    ResourceGroup registerResourceGroup(String newGroupId, I18nValue<String> displayName);
    ResourceGroup registerResourceGroup(String newGroupId, I18nValue<String> displayName, I18nValue<String> description);

    /** 指定した親の配下にサブグループを登録します。 */
    ResourceGroup registerSubGroup(String newGroupId, ResourceGroup parent, I18nValue<String> displayName);
    ResourceGroup registerSubGroup(String newGroupId, ResourceGroup parent, I18nValue<String> displayName, I18nValue<String> description);

    /** リソースグループを削除します（配下のリソース・ポリシーも含めて削除される破壊的操作）。 */
    void removeResourceGroup(ResourceGroup resourceGroup);
    void removeResourceGroup(String resourceGroupId);

    /** リソースグループの親子関係（階層への包含）を解除します。 */
    void removeResourceGroupInclusion(ResourceGroup sub);

    /** リソースグループの内容を更新します（表示名・説明等、ResourceGroup が保持するフィールド全体）。 */
    void setResourceGroup(ResourceGroup resourceGroup);
    /** リソースグループの説明のみを更新します。 */
    void setResourceGroupDescriptions(String resourceGroupId, I18nValue<String> description);
    /** リソースグループの親子関係（階層への包含）を設定します。 */
    void setResourceGroupInclusion(ResourceGroup sub, ResourceGroup parent);
    /** リソースグループの表示名のみを更新します。 */
    void setResourceGroupNames(String resourceGroupId, I18nValue<String> displayName);
    /** サブグループの表示順を設定します。 */
    void setSubGroupOrder(String parentResourceGroupId, List<String> childResourceGroupIds);

    /** リソースIDからリソースを取得します。 */
    Resource getResource(String resourceId);

    // 他に countActionsForAllGroups(Tree)、countActionsForGroupByName、
    // getResourceGroup(By...)、getResourceGroups(...) 等の検索・カウント系メソッドが多数存在する。
}
```

- `registerAsResource(...)` の各オーバーロードは `newGroupId`（対になるリソースグループIDの明示指定。省略時は自動採番）と `parent`（親グループへの直接配置）の有無で使い分ける
- `removeResourceGroup(...)` は配下のリソース・ポリシー設定を含めて削除する**破壊的操作**

## `SubjectManager`（サブジェクト CRUD）

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public interface SubjectManager {

    /** Expression（サブジェクト式）からサブジェクトグループを登録します。 */
    SubjectGroup registerSubjectGroup(Expression e, I18nValue<String> displayName);
    SubjectGroup registerSubjectGroup(Expression e, I18nValue<String> displayName, I18nValue<String> description);

    /** サブジェクトを削除します（サブジェクトグループの式から当該サブジェクトを除去）。 */
    void removeSubject(Subject subject) throws SubjectManagingException;
    /** サブジェクトグループを削除します（破壊的操作。関連するポリシーの参照も外れる）。 */
    void removeSubjectGroup(SubjectGroup subjectGroup) throws SubjectManagingException;

    /** サブジェクトグループIDから取得します。 */
    SubjectGroup getSubjectGroup(String subjectGroupId);
    /** Expression（正規化済みの式）から一致するサブジェクトグループを取得します。 */
    SubjectGroup getSubjectGroupByExpression(Expression e);
    /** 認証済みユーザ全体を表す組込みのサブジェクトグループを取得します。 */
    SubjectGroup getAuthenticatedUsers();
    /** 未認証ユーザ（ゲスト）を表す組込みのサブジェクトグループを取得します。 */
    SubjectGroup getGuestSubjectGroup();

    /** サブジェクトタイプIDからサブジェクトタイプを取得します（SubjectExpression の内部解決等で使用）。 */
    SubjectType<?> getSubjectType(String subjectTypeId);

    // 他に countSubjectGroupsByName(AndTypeIds/AndTypes)、countRegisteredSubjectGroups 等の
    // 検索・カウント系メソッドが多数存在する。
}
```

- サブジェクト**単体**の登録 API は存在しない。必ず `Expression`（後述）で組んだ条件式を `SubjectGroup` として登録する
- `getAuthenticatedUsers()` / `getGuestSubjectGroup()` は「全ユーザ」「未認証ユーザ」に対するポリシーを設定する際によく使う組込みグループ

## `Expression` / `SubjectExpression`（サブジェクト式）

```java
package jp.co.intra_mart.foundation.authz.util.expression;

public abstract class Expression implements Comparable<Expression>, Serializable {
    public static Expression AND(Expression... exps);
    public static Expression AND(List<Expression> exps);
    public static Expression OR(Expression... exps);
    public static Expression OR(List<Expression> exps);
    public static Expression NOT(Expression e);
    public abstract Expression normalize();
}
```

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public class SubjectExpression extends Expression {
    /** Subject インスタンスをサブジェクト式に変換します。 */
    public static Expression S(Subject subject);
}
```

- `SubjectExpression.S(subject)` が個々の `Subject` を式に変換する起点。複数条件は `Expression.AND(...)` / `Expression.OR(...)` / `Expression.NOT(...)` で組み合わせる
- 例: 「部署Aに所属 **かつ** ロールBを持たない」ユーザ群 → `Expression.AND(SubjectExpression.S(departmentASubject), Expression.NOT(SubjectExpression.S(roleBSubject)))`

## `PolicyManager`（ポリシー CRUD）

```java
package jp.co.intra_mart.foundation.authz.services.admin;

public interface PolicyManager {

    /** ポリシーを設定します（新規登録・上書きの両方を兼ねる）。 */
    void setPolicy(Policy policy);
    Policy setPolicy(ResourceGroup resourceGroup, Action action, SubjectGroup subjectGroup, Effect effect);
    Policy setPolicy(String resourceGroupId, String subjectGroupId, String resourceTypeId, String action, String effect);

    /** 明示的に登録されているポリシーのみを削除します（未設定の状態に戻す。継承元へフォールバックするようになる）。 */
    void removePolicy(Policy policy);
    void removePolicy(String policyId);
    /** 指定したリソースグループに設定されている全ポリシーを削除します（破壊的操作）。 */
    void removePoliciesForResourceGroup(String resourceGroupId);
    /** 指定したサブジェクトグループに設定されている全ポリシーを削除します（破壊的操作）。 */
    void removePoliciesForSubjectGroup(String subjectGroupId);
    /** 全ポリシーを削除します（システム全体に影響する破壊的操作）。 */
    void removeAllPolicies();

    /** 明示的に登録されているポリシーのみを取得します（未設定の場合は null）。 */
    Policy getDeclaredPolicy(ResourceGroup resourceGroup, SubjectGroup subjectGroup, Action action);
    Policy getDeclaredPolicy(String policyId);
    Policy getDeclaredPolicy(String resourceGroupId, String subjectGroupId, String resourceTypeId, String action);

    /** 継承を補完した実効ポリシーを取得します（明示未設定でも継承元から解決した結果を返す）。 */
    Policy getActualPolicy(String resourceGroupId, String subjectGroupId, String resourceTypeId, String action);
    List<Policy> getActualPolicies(String resourceGroupId, Set<String> subjectGroupIds, String resourceTypeId, String action);

    List<Policy> getAllPolicies();
    List<Policy> getAllPolicies(int offset, int length);
    List<Policy> getDeclaredPoliciesFor(Resource resource);
    List<Policy> getDeclaredPoliciesFor(Resource resource, Action action);

    // 他に countAllPolicies、countDeclaredPoliciesFor(ResourceGroup)、
    // countDeclaredPoliciesForResourceGroup/SubjectGroup 等のカウント系メソッドが存在する。
}
```

- **`getDeclaredPolicy(...)`（明示設定のみ）と `getActualPolicy(...)`（継承補完済み）の違いが重要。** 「このリソース・サブジェクトに実際に適用される権限」を知りたい場合は `getActualPolicy`/`getActualPolicies` を使う。「明示的に設定を変更/削除してよいか」を判定する場合（例: 管理画面での編集対象確認）は `getDeclaredPolicy` を使う
- `removePolicy(...)` は明示設定を削除するだけで、継承元ポリシーへのフォールバックは残る。`removePoliciesForResourceGroup`/`removePoliciesForSubjectGroup`/`removeAllPolicies` はいずれも一括削除の破壊的操作

## `AuthorizationClient`（権限確認・推奨エントリポイント）

```java
package jp.co.intra_mart.foundation.authz.client;

public interface AuthorizationClient {

    /** アカウントコンテキストのユーザコードを使用して認可を判断します。 */
    AuthorizeResult authorize(Resource resource, Action action);
    AuthorizeResult authorize(String resourceURI, String action);

    /** 指定したサブジェクトグループを使用して認可を判断します。 */
    AuthorizeResult authorize(Resource resource, Action action, Set<SubjectGroup> subjectGroups);
    AuthorizeResult authorize(String resourceURI, String action, Set<String> subjectGroupsIds);

    /** 指定したユーザコードを使用して認可を判断します。 */
    AuthorizeResult authorize(Resource resource, Action action, String userCd);
    AuthorizeResult authorize(String resourceURI, String action, String userCd);

    /** リソースをモデルクラスで指定して認可を判断します（認可機構が解釈可能なモデル型が必要）。 */
    <T> AuthorizeResult authorize(T resourceModel, String action) throws UnexpectedResourceModelReceivedException;
    <T> AuthorizeResult authorize(T resourceModel, String action, Set<String> subjectGroupsIds) throws UnexpectedResourceModelReceivedException;
    <T> AuthorizeResult authorize(T resourceModel, String action, String userCd) throws UnexpectedResourceModelReceivedException;
}
```

```java
package jp.co.intra_mart.foundation.authz.client;

public abstract class AuthorizationClientFactory {
    public static AuthorizationClientFactory getInstance();
    public abstract AuthorizationClient getAuthorizationClient();
}
```

- 開発者が権限確認を行う際の**推奨エントリポイント**。`resourceURI`（String）は `RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` 形式で、`ResourceManager#registerAsResource` で事前登録した値と一致させる
- サブジェクトを省略した場合、アカウントコンテキスト（現在ログイン中のユーザ）で自動判断される
- 戻り値の判定は必ず `AuthorizeResult.Permit.equals(result)` の形で行う

## `PolicyDecisionService` / `PolicyInformationService`（内部利用が中心）

Javadoc 上「通常このクラスを直接扱う必要はありません。認可判断を行いたい場合は `AuthorizationClient` を使用してください」と明記されている。`AuthorizationClient` では表現できない特殊なケース（サブジェクトグループの解決結果を判断とは別に取得したい等）でのみ検討する。

```java
package jp.co.intra_mart.foundation.authz.services.decision;

public interface PolicyDecisionService {
    Effect authorize(Set<String> userSubjectGroup, String resourceURI, String action);
    Effect authorize(Set<SubjectGroup> userSubjectGroup, Resource resource, Action action);
    Effect authorize(String userCd, Resource resource, Action action);
    Effect authorize(String userCd, String resourceURI, String action);
}
```

```java
package jp.co.intra_mart.foundation.authz.client;

public interface PolicyInformationService {
    /** リソースに依存しないサブジェクトグループIDのみを解決します（OnDemandSubjectResolver は使用しない）。 */
    Set<String> resolveDeclaredSubjectGroupIds(String userCd);
    /** リソース依存のサブジェクトも含めて解決します（OnDemandSubjectResolver も使用する。通常はこちらを使う）。 */
    Set<String> resolveSubjectGroupIds(String userCd, String resourceURI, String action);
    /** リソースのモデルからリソースURIへ変換します。 */
    <T> String resolveResourceUri(T model) throws UnexpectedResourceModelReceivedException;
}
```

## テナントを跨いだインスタンスの使い回し禁止（重要）

`ResourceManager` の Javadoc に明記されている注意事項で、他のマネージャ／サービスにも共通して当てはまる設計上の制約:

> `ResourceManager` のインスタンスは、複数のテナントで共有しないでください。同じスレッド上でテナントを切り替えた場合は、インスタンスを使いまわさずに `ResourceManagerFactory` クラスから取得しなおしてください。インスタンスを使いまわした場合、一部の API の実行に失敗することがあります。

- マネージャ／クライアント／サービスのインスタンスは**フィールドに保持してキャッシュせず、メソッド呼び出しのたびに Factory から取得する**のが安全な実装パターン
- バッチ処理やジョブでテナントを切り替えながら処理する場合、特に注意が必要
