# Web API Maker 基本利用パターン（Java 版）

各アノテーションの属性・シグネチャは `reference/web-api-maker-api-reference.md` を参照。ここでは典型的な実装パターンを示す。

## クラス命名とアーキテクチャ（最重要）

Web API Maker が要求する `@Path`/HTTP メソッドアノテーションを持つクラスは、公式ドキュメント・javadoc 上「サービスクラス」と呼ばれるが、**本プロジェクトの命名規則（`.claude/rules/java-naming.md`）ではこの役割のクラスに `Endpoint` サフィックスを付与する。** 以下のパターンでは、この Web API Maker 用語との違いに注意しつつ全て `Xxx` + `Endpoint` / `Xxx` + `EndpointFactory` の命名で統一している。

Endpoint クラスは HTTP リクエストの受付・パラメータ変換・レスポンス変換のみを担当し、ビジネスロジックや DB アクセスを直接持たない。`Xxx` + `Service`（ビジネスロジック）フィールドを保持し、そこへ処理を委譲する。DB アクセス（Repository/DAO）の実装は `java-im-mirage-usage` スキルの対象。

**Service は Repository と同様に「インタフェース + Standard実装クラス + ファクトリクラス」の3点構成とする。** Endpoint クラスは `Xxx` + `Service`（インタフェース）にのみ依存し、`new StandardXxxService()` のように具象クラスを直接生成せず、`XxxServiceFactory.getInstance()` で取得する（`ServiceLoaderUtil.loadTopPriority` による差し替え可能な取得。詳細は `java-im-mirage-usage` スキルの「Repository/Service のファクトリクラス」参照）。

**Endpoint 自体も同じ考え方で「インタフェース + Standard実装クラス」に分割し、`ServiceLoaderUtil.loadTopPriority` による差し替え可能な取得にできる。** これは Web API Maker の実装上の性質に基づく: `@ProvideService` メソッドは**宣言上の戻り値型**を「APIクラス」として認識し、そのクラスの `Method`（`api.getMethods()`）を走査して `@Path` 等のアノテーションを読み取り、実行時にリフレクションで呼び出す（`Method#invoke(instance, args)`）。そのため戻り値型を `Xxx` + `Endpoint`（インタフェース）にして `@IMAuthentication`/`@Path`/`@GET`/`@Parameter` 等のアノテーションをそこに宣言しておけば、実装クラス（`StandardXxxEndpoint` や `META-INF/services` で差し替えた別実装）のインスタンスに対しても正しく動作する。

```
Endpoint（@Path/@GET 等。HTTP リクエストの受付・Service 呼び出しのみ）
    ↓
Service（ビジネスロジック本体）
    ↓
Repository（DB アクセスの抽象化。java-im-mirage-usage 参照）
    ↓
DAO（java-im-mirage-usage 参照）
```

## パターン1: 最小構成（ファクトリクラス + Endpointインタフェース + Standard実装クラス + Serviceクラス、`@IMAuthentication`）

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil;
import jp.co.intra_mart.foundation.web_api_maker.annotation.ProvideFactory;
import jp.co.intra_mart.foundation.web_api_maker.annotation.ProvideService;
import jp.co.intra_mart.foundation.web_api_maker.annotation.WebAPIMaker;

/**
 * 発注情報 Web API のファクトリクラス（Web API Maker 規約上必須の {@code @WebAPIMaker} クラス）。<br>
 * 本クラス自体は Web API Maker のフレームワークが要求する固定の窓口であり、{@code ServiceLoaderUtil} の
 * ファクトリクラス（{@code OrderServiceFactory} 等）とは無関係の別メカニズム（名前が似ているため注意）。<br>
 * {@link #getService()} の戻り値型は {@link OrderEndpoint}（インタフェース）であり、
 * {@code META-INF/services/jp.co.example.foo.webapi.OrderEndpoint} に実装クラスを登録すると
 * {@link ServiceLoaderUtil#loadTopPriority(Class)} により優先度の高い実装へ差し替えられる。
 * 登録が無い場合は {@link StandardOrderEndpoint} を既定実装として使用する。
 */
@WebAPIMaker
public class OrderEndpointFactory {

    private static final class LazyHolder {

        private static final OrderEndpoint INSTANCE = createInstance();

        private static OrderEndpoint createInstance() {
            final OrderEndpoint topPriority = ServiceLoaderUtil.loadTopPriority(OrderEndpoint.class);
            return topPriority != null ? topPriority : new StandardOrderEndpoint();
        }
    }

    /**
     * ファクトリのインスタンスを取得します。
     * @return ファクトリインスタンス
     */
    @ProvideFactory
    public static OrderEndpointFactory getFactory() {
        return new OrderEndpointFactory();
    }

    /**
     * Endpoint のインスタンスを取得します。
     * @return Endpointインスタンス
     */
    @ProvideService
    public OrderEndpoint getService() {
        return LazyHolder.INSTANCE;
    }
}
```

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.IMAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Required;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Variable;

/**
 * 発注情報を提供する Web API の Endpoint インタフェース。<br>
 * Cookie に紐づくセッション認証（ブラウザのログイン状態）でアクセスする。<br>
 * `@IMAuthentication` 等のクラスアノテーション・`@Path`/`@GET`/引数アノテーションは、
 * 実装クラスではなく本インタフェース側に宣言すること（Web API Maker が `Method` を読み取るのは
 * このインタフェースのクラスオブジェクトからであるため）。
 */
@IMAuthentication
public interface OrderEndpoint {

    /**
     * 発注IDを指定して発注情報を取得します。
     * @param orderId 発注ID
     * @return 発注情報
     */
    @Path("/foo/orders/{orderId}")
    @GET
    OrderEntity get(@Required @Variable(name = "orderId") String orderId);
}
```

```java
package jp.co.example.foo.webapi;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * {@link OrderEndpoint} の標準実装クラス。<br>
 * HTTP リクエストの受付・パラメータ変換のみを行い、ビジネスロジックは {@link OrderService} へ委譲する。<br>
 * `@Path` 等のアノテーションはインタフェース側（{@link OrderEndpoint}）に宣言済みのため、本クラスには付与しない。
 */
public class StandardOrderEndpoint implements OrderEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Override
    public OrderEntity get(final String orderId) {
        return orderService.findById(orderId);
    }
}
```

`OrderService` インタフェース・`StandardOrderService` 標準実装クラス・`OrderServiceFactory` ファクトリクラス（`ServiceLoaderUtil.loadTopPriority` による差し替え可能な取得）の実装パターンは `java-im-mirage-usage` スキルの `assets/mirage-basic-usage.md`「パターン7: Service層」を参照。Endpoint クラスは `OrderService` インタフェースにのみ依存し、`new StandardOrderService()` のように具象クラスを直接生成しない。

- ファクトリクラスは `@WebAPIMaker`/`@ProvideFactory`/`@ProvideService` の 3 点セットが必須。Endpointインタフェース・Standard実装クラス側にはこれらを付けない
- **Endpoint のインタフェース化は必須ではない。** Repository/Service と異なり、Endpoint の実装差し替えが実際に必要になる場面は限定的（テスト用モックの差し込み、環境別の挙動切り替え等）。差し替えの予定が無い単純な Endpoint では、パターン2以降のように `public class OrderXxxEndpoint` 1 クラスで完結させてよい。差し替え可能性がある場合のみ本パターンの3クラス構成を採用する
- `OrderEntity` はモデルクラス。`public`・引数なしコンストラクタ・getter/setter が揃っていること（`reference/web-api-maker-api-reference.md` の「引数・戻り値に指定可能な型」を参照）。Mirage エンティティ（public フィールド方式）と Web API Maker のレスポンスモデル（getter/setter 必須）は要件が異なるため、DB から取得したエンティティをそのまま返却する場合は変換の要否を確認する
- `OrderRepository`/`StandardOrderRepository`/`OrderRepositoryFactory`（DAOFactory・SessionTemplate によるトランザクション管理、`ServiceLoaderUtil` によるファクトリを含む）の実装は `java-im-mirage-usage` スキルの `assets/mirage-basic-usage.md` を参照
- このパターンだけでは動作しない。**「パターン8: パッケージの登録」を必ず併せて行うこと**

## パターン2: パラメータバインド（`@Variable`/`@Parameter`/`@Body`/`@Bean`）

Endpoint クラスは Service へ委譲するのみで、以降のパターンでは `orderService` フィールド（パターン1と同様に生成）への委譲部分を中心に示す。紙面の都合上、パターン2以降は差し替え不要な単純な Endpoint を想定し `public class` 1 クラスで簡略化して示す（パターン1末尾の注記を参照。差し替え可能性がある場合はパターン1と同様にインタフェース + Standard実装クラスへ分割する）。

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.Body;
import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.IMAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Parameter;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.PUT;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Required;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Variable;

import java.util.List;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

@IMAuthentication
public class OrderSearchEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    /**
     * ステータスで発注一覧を検索します（クエリパラメータの例）。
     * @param status 検索対象のステータス（任意指定）
     * @param limit 取得件数上限（未指定時は呼び出し側の型変換に依存するため、デフォルト値の扱いは実装で明示する）
     * @return 発注一覧
     */
    @Path("/foo/orders")
    @GET
    public List<OrderEntity> search(@Parameter(name = "status") final String status,
                               @Parameter(name = "limit") final int limit) {
        return orderService.search(status, limit);
    }

    /**
     * 発注情報を更新します（パスパラメータ + リクエストボディの例）。
     * @param orderId 発注ID
     * @param order リクエストボディから変換された発注情報
     */
    @Path("/foo/orders/{orderId}")
    @PUT
    public void update(@Required @Variable(name = "orderId") final String orderId, @Body final OrderEntity order) {
        orderService.update(orderId, order);
    }
}
```

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.Bean;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Body;
import jp.co.intra_mart.foundation.web_api_maker.annotation.PUT;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Required;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Variable;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * 複数のパラメータ取得元を 1 つの Bean へ集約する例。
 * パラメータ数が多いメソッドで引数リストが肥大化するのを防ぐ。
 */
public class OrderUpdateEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    public static class UpdateRequest {
        private String orderId;
        private OrderEntity order;

        @Required
        @Variable(name = "orderId")
        public void setOrderId(final String orderId) {
            this.orderId = orderId;
        }

        public String getOrderId() {
            return orderId;
        }

        @Required
        @Body
        public void setOrder(final OrderEntity order) {
            this.order = order;
        }

        public OrderEntity getOrder() {
            return order;
        }
    }

    @Path("/foo/orders/{orderId}")
    @PUT
    public void update(@Bean final UpdateRequest request) {
        orderService.update(request.getOrderId(), request.getOrder());
    }
}
```

- `@Variable` はパスパラメータ（`@Path` の `{xxx}` と `name` を一致させる）、`@Parameter` はクエリ/フォームパラメータ、`@Body` はリクエストボディ全体を 1 つのモデルへバインドする
- `@Required` を付けた引数が未指定の場合はリクエスト形式不正としてエラー応答になる（`reference/web-api-maker-api-reference.md` の HTTP ステータスコード対応表を参照）
- `@Bean` を使う場合、集約先クラスの setter に取得元アノテーション（`@Variable`/`@Parameter`/`@Body`/`@Header` 等）を付与する。getter/setter が揃っている必要がある点はモデルクラスと同様

## パターン3: Basic 認証 API

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.BasicAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * Basic 認証でアクセスする Web API の Endpoint クラス。
 * エンドポイントは "/basic" + {@code @Path} の値になる（例: /basic/foo/orders/summary）。
 */
@BasicAuthentication
public class OrderSummaryEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Path("/foo/orders/summary")
    @GET
    public OrderSummary summary() {
        return orderService.summarize();
    }
}
```

- クラスに付与できる認証アノテーションは 1 つのみ。`@IMAuthentication`/`@BasicAuthentication`/`@OAuth` を併用しない

## パターン4: OAuth 認証 API（別モジュール前提）

`@OAuth` は Web API Maker OAuth認証モジュールを追加導入していないと機能しない。導入済みであることを前提に、Endpointクラス側と設定ファイル側の両方を実装する。

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.OAuth;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * OAuth2 認証でアクセスする Web API の Endpoint クラス。
 * エンドポイントは pathPrefix（デフォルト "/oauth"）+ {@code @Path} の値になる。
 */
@OAuth(scope = "order-read")
public class OrderExternalEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Path("/foo/orders/{orderId}")
    @GET
    public OrderEntity get(final String orderId) {
        return orderService.findById(orderId);
    }
}
```

設定ファイルは `WEB-INF/conf/` 配下に 3 種類必要（いずれもテナント環境セットアップ資材として管理する）。

`oauth-client-scopes-config/order-scopes.xml`（スコープ定義）:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<oauth-client-scopes-config
    xmlns="http://intra-mart.co.jp/system/oauth/provider/client/scope/config/oauth-client-scopes-config">
  <scopes>
    <scope id="order-read">
      <default-subject>order-read scope</default-subject>
      <localizations>
        <localize locale="ja">
          <subject>発注情報の参照</subject>
          <text>発注情報を参照する権限を許可します。</text>
        </localize>
      </localizations>
    </scope>
  </scopes>
</oauth-client-scopes-config>
```

`oauth-client-resources-config/order-resources.xml`（リソース登録。`type="java"` で Web API Maker の Endpoint クラスを指定）:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<oauth-client-resources-config
    xmlns="http://intra-mart.co.jp/system/oauth/provider/client/resource/config/oauth-client-resources-config">
  <client-resources>
    <client-resource id="order-external-resource" path="/oauth/foo/orders" type="java"
                      target="jp.co.example.foo.webapi.OrderExternalEndpoint">
      <authz uri="service://foo/orders" action="execute"/>
      <scope id="order-read"/>
    </client-resource>
  </client-resources>
</oauth-client-resources-config>
```

- `oauth-client-details-config`（OAuth クライアントアプリケーション自体の登録）は環境・クライアントごとに内容が異なるため、本パターンでは割愛する。既存のテナント環境セットアップ資材の構成に従う
- `authz` 要素で指定した `uri`/`action` は、IM-Authz 側で事前にリソース登録・ポリシー設定が必要（「パターン5: IM-Authz 連携」を参照）

## パターン5: IM-Authz 連携（認可チェック）

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.authz.annotation.Authz;
import jp.co.intra_mart.foundation.web_api_maker.annotation.DELETE;
import jp.co.intra_mart.foundation.web_api_maker.annotation.IMAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Required;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Variable;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * 削除操作の前に IM-Authz による認可チェックを行う例。
 * uri="service://foo/orders" は事前に java-im-authz-usage 側で
 * ResourceManager#registerAsResource 等により登録されている必要がある。
 */
@IMAuthentication
@Authz(uri = "service://foo/orders", action = "delete")
public class OrderDeletionEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Path("/foo/orders/{orderId}")
    @DELETE
    public void delete(@Required @Variable(name = "orderId") final String orderId) {
        orderService.delete(orderId);
    }
}
```

- `@Authz` はクラス・メソッドどちらにも付与できる。クラスに付けると配下の全メソッドに一括適用される
- 未認証時は `401`、認証済みだが権限なしの場合は `403` が返却される（Web API Maker 側での分岐処理は不要）
- **`@Authz` を付けるだけでは機能しない。** `uri` に指定したリソースが IM-Authz 側で未登録の場合、常に認可失敗（`403` 等）になる。リソース登録・ポリシー設定は `java-im-authz-usage` の実装パターンを使う
- 動的にリソースを決定したい場合は `mapperClass`/`mapperParams` 属性（`AuthzMapper` の実装クラス）を使う。詳細シグネチャは `reference/web-api-maker-api-reference.md` を参照

## パターン6: セキュアトークン検証（`@Secured`）

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.Body;
import jp.co.intra_mart.foundation.web_api_maker.annotation.IMAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.POST;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Required;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Secured;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * ブラウザから呼ばれる状態変更系 API に CSRF 対策のセキュアトークン検証を追加する例。
 */
@IMAuthentication
public class OrderRegistrationEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Path("/foo/orders")
    @POST
    @Secured
    public void register(@Required @Body final OrderEntity order) {
        orderService.register(order);
    }
}
```

- `@Secured` は CSRF 対策のセキュアトークン検証。「誰としてアクセスするか」を決める認証アノテーション（`@IMAuthentication` 等）とは役割が異なり、両方必要な場面（ブラウザから呼ばれる状態変更系 API）では併用する
- `@BasicAuthentication`/`@OAuth`（外部システム・サーバ間連携が主目的）では `@Secured` を付けないのが一般的（ブラウザ経由のセッション窃取を前提とした CSRF 対策のため）

## パターン7: レスポンス制御

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.Response;
import jp.co.intra_mart.foundation.web_api_maker.annotation.ReturnValue;

/**
 * 発注情報が見つからない場合の例外。
 * Web API Maker が本例外をキャッチした際、HTTP 404 として応答する。
 */
@Response(code = 404)
public class OrderNotFoundException extends Exception {

    private final String orderId;

    public OrderNotFoundException(final String orderId) {
        super("発注情報が見つかりません: orderId=" + orderId);
        this.orderId = orderId;
    }

    /**
     * レスポンスボディへ含める補足情報。
     * @return 対象の発注ID
     */
    @ReturnValue
    public String getOrderId() {
        return orderId;
    }
}
```

```java
package jp.co.example.foo.webapi;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.IMAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.PreventWritingResponse;

/**
 * Web API Maker による自動レスポンス書き込みを抑制し、手動でリダイレクトする例。
 */
@IMAuthentication
public class OrderRedirectEndpoint {

    @Path("/foo/orders/legacy")
    @GET
    @PreventWritingResponse
    public void redirect(final HttpServletResponse response) throws IOException {
        response.sendRedirect("/foo/orders");
    }
}
```

- 例外クラスに `@Response(code=...)` を付けると、その例外がスローされた際のステータスコードを制御できる。`@ReturnValue` を付けたメソッドの戻り値はレスポンスボディへ含まれる
- `@PreventWritingResponse` を付けたメソッドは Web API Maker 側の自動レスポンス書き込みが行われないため、`HttpServletResponse` を引数で受け取り自前で応答する

## パターン8: パッケージの登録（実装漏れが最も多い）

`META-INF/im_web_api_maker/packages` に、Endpointクラス（ファクトリクラスではなく実装先パッケージ）のパッケージ名を1行ずつ記載する。

```
jp.co.example.foo.webapi
```

- この登録が無い場合、アノテーションを正しく付けていてもサービスとして認識されず、エンドポイントへのアクセスが `404` になる
- 複数パッケージにまたがって Endpointクラスを配置する場合は、対象パッケージを1行ずつ追記する

## パターン9: アンチパターン集（避けること）

```java
// NG: 認証アノテーションを複数付与する（排他選択のため、動作は不定）
@IMAuthentication
@BasicAuthentication
public class BadEndpoint { }

// NG: モデルクラスに引数なしコンストラクタが無い
public class OrderEntity {
    public OrderEntity(final String id) { this.id = id; } // このコンストラクタしかない → 変換に失敗する
    private String id;
}

// NG: @Variable の name と @Path の {xxx} が一致していない
@Path("/foo/orders/{orderId}")
@GET
public OrderEntity get(@Variable(name = "id") final String orderId) { // "orderId" ≠ "id"
    return orderService.findById(orderId);
}

// NG: @Authz だけ付けて、IM-Authz 側のリソース登録を行わない
// → uri="service://foo/orders" が未登録のため、常に認可失敗（403）になる
@Authz(uri = "service://foo/orders", action = "execute")
public class UnregisteredResourceEndpoint { }

// NG: @OAuth を使っているのに Web API Maker OAuth認証モジュールが未導入
// → アノテーション自体は付けられるが、実行時に想定通り動作しない
@OAuth(scope = "order-read")
public class MissingModuleEndpoint { }

// NG: META-INF/im_web_api_maker/packages への登録を忘れる
// → 上記すべてを正しく実装しても、エンドポイントが 404 になる

// NG: Endpoint クラスから DAOFactory/SqlManager を直接呼び出す
// → Service/Repository 層が形骸化し、ビジネスロジックの再利用性・テスト容易性が失われる
@IMAuthentication
public class BadDirectAccessEndpoint {
    @Path("/foo/orders/{orderId}")
    @GET
    public OrderEntity get(@Variable(name = "orderId") final String orderId) {
        final OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class); // Endpoint から DAO を直接呼ばない
        return dao.find(orderId);
    }
}

// NG: Endpoint をインタフェース化したのに、@ProvideService の戻り値型を実装クラスのままにする
// → Web API Maker は @ProvideService の「宣言上の戻り値型」を API クラスとして認識するため、
//    実装クラス（StandardOrderEndpoint）を返り値型にすると @Path 等のアノテーションが
//    インタフェース側にしか無く認識されず、エンドポイントが登録されない
@WebAPIMaker
public class BadEndpointFactory {
    @ProvideFactory
    public static BadEndpointFactory getFactory() {
        return new BadEndpointFactory();
    }

    @ProvideService
    public StandardOrderEndpoint getService() { // NG: OrderEndpoint（インタフェース）にすべき
        return new StandardOrderEndpoint();
    }
}
```
