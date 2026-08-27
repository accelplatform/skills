# Web API Maker API リファレンス（Java 版）

intra-mart Accel Platform 公式ドキュメント（Web API Maker プログラミングガイド）および javadoc（`jp.co.intra_mart.foundation.web_api_maker.annotation` パッケージ）の記述に基づく。記憶や推測でメソッド・属性を補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.web_api_maker.annotation
├── WebAPIMaker            … ファクトリクラスに付与するベースアノテーション
├── ProvideFactory          … ファクトリのインスタンス取得メソッドに付与
├── ProvideService           … サービスのインスタンス取得メソッドに付与
├── IMAuthentication         … セッション認証（Cookie）をサポート
├── BasicAuthentication      … Basic 認証をサポート
├── OAuth                    … OAuth2 認証をサポート（別モジュール前提）
├── Path                     … HTTP パスを表す
├── GET / POST / PUT / DELETE … HTTP メソッドを表す（HttpMethod を継承する形の各アノテーション）
├── Parameter                … クエリ/フォームパラメータから値取得
├── Header                   … リクエストヘッダから値取得
├── Variable                 … パスパラメータ（PathVariables）から値取得
├── Body                     … リクエストボディから値取得
├── Bean                     … 複数パラメータ取得元を1つのオブジェクトへ集約
├── Required                 … 引数が必須であることを表す
├── ArgumentSource            … パラメータの取得元を表す基底的な位置づけ
├── Secured                  … セキュアトークンチェックを実行
├── Administrator            … システム管理者によるセッション認証をサポート
├── Response                 … 例外発生時の HTTP レスポンスステータスコードを指定
├── ReturnValue               … 例外の情報をレスポンスデータとして返却可能にする
├── PreventWritingResponse    … Web API Maker によるレスポンス書き込みを抑制（手動制御）
├── Category                  … API 仕様上の Java-API カテゴリを表す
└── Tag                       … API 仕様上の Java-API タグを表す
```

```
jp.co.intra_mart.foundation.authz.annotation
└── Authz                    … IM-Authz 連携用の認可アノテーション（Web API Maker 専用ではなく IM-Authz 本体のもの）
```

## クラス登録系アノテーション

### `@WebAPIMaker` / `@ProvideFactory` / `@ProvideService`

ファクトリクラスに付与する3点セット。クラス名は本プロジェクトの命名規則（`.claude/rules/java-naming.md`）に従い `Xxx` + `EndpointFactory` / `Xxx` + `Endpoint` とする（`@ProvideService` というアノテーション名自体は Web API Maker 側の固定仕様であり変更しない。詳細は `SKILL.md` の「アーキテクチャとクラス命名」参照）。

```java
@WebAPIMaker
public class XxxEndpointFactory {

    @ProvideFactory
    public static XxxEndpointFactory getFactory() {
        return new XxxEndpointFactory();
    }

    @ProvideService
    public XxxEndpoint getService() {
        return new XxxEndpoint();
    }
}
```

- `@ProvideFactory` を付与するメソッドは `static` で、ファクトリクラス自身のインスタンスを返す
- `@ProvideService` を付与するメソッドは Endpoint クラス（Web API Maker 公式ドキュメント上の「サービスクラス」）のインスタンスを返す（インスタンスメソッド）
- Endpoint クラス側にはこれらのアノテーションを付与しない

## 認証系アノテーション（クラスに付与、排他選択）

| アノテーション | 用途 | エンドポイント | 備考 |
|------|------|------|------|
| `@IMAuthentication` | Cookie に紐づくセッションの認証状態でアクセス | `@Path` の値そのまま | 特別な認証処理を行わない |
| `@BasicAuthentication` | Basic 認証 | `/basic` + `@Path` の値（属性で接頭辞変更可） | |
| `@OAuth` | OAuth2 認証 | `pathPrefix`（デフォルト `/oauth`）+ `@Path` の値 + `pathSuffix`（デフォルト空文字） | 別途 Web API Maker OAuth認証モジュールの導入と `scope` 属性の指定が必要 |
| `@Administrator` | システム管理者によるセッション認証 | — | システム管理者向け API 専用 |

### `@OAuth` の属性

| 属性 | 意味 | デフォルト値 | 必須 |
|------|------|------|------|
| `scope` | このAPIが要求するスコープID（`oauth-client-scopes-config` で定義した `id` と対応） | なし | ○ |
| `pathPrefix` | エンドポイントの接頭辞 | `"/oauth"` | - |
| `pathSuffix` | エンドポイントの接尾辞 | `""` | - |

## ルーティング系アノテーション（メソッドに付与）

- `@Path("/foo/orders/{orderId}")` — URL パスを指定。`{xxx}` 形式でパス変数化できる
- `@GET` / `@POST` / `@PUT` / `@DELETE` — HTTP メソッドを指定。1メソッドにつき1つ

## パラメータ系アノテーション（引数またはBeanのsetterに付与）

| アノテーション | 取得元 | 主な属性 |
|------|------|------|
| `@Parameter` | クエリ/フォームパラメータ | `name`（パラメータ名） |
| `@Header` | リクエストヘッダ | `name`（ヘッダ名） |
| `@Variable` | パスパラメータ（`@Path` の `{xxx}` に対応） | `name`（`@Path` 内の変数名と一致させる） |
| `@Body` | リクエストボディ全体 | — |
| `@Bean` | 上記を集約した任意のクラス | — |
| `@Required` | 引数が必須であることを表す（他のアノテーションと併用） | — |

- `@Bean` を使う場合、集約先クラスの setter に個別の取得元アノテーション（`@Variable`/`@Parameter`/`@Body`/`@Header`）を付与する。集約先クラスにも getter/setter が揃っている必要がある
- `@Required` を付けた引数が未指定の場合、リクエスト形式不正としてエラー応答になる（HTTP ステータスコード対応表を参照）

## セキュリティ系アノテーション

- `@Secured` — メソッドに付与。セキュアトークンチェック（CSRF 対策）を実行する。ブラウザから呼ばれる状態変更系 API での使用を想定
- `@Authz`（`jp.co.intra_mart.foundation.authz.annotation.Authz`、Web API Maker 専用ではなく IM-Authz 本体のアノテーション） — クラスまたはメソッドに付与。Web API 実行前に IM-Authz によって認可判断を行う

### `@Authz` の属性

| 属性 | 意味 | デフォルト値 |
|------|------|------|
| `uri` | 認可対象リソースの URI | `""`（空文字） |
| `action` | アクション名 | `"execute"` |
| `mapperClass` | 認可マッパークラス（動的にリソースを決定したい場合） | `EmptyResourceMapper.class` |
| `mapperParams` | マッパークラスへ渡すパラメータ（`AuthzMapperParam[]`） | `{}`（空配列） |

- クラス・メソッドどちらにも付与可能。クラスに付けると配下の全メソッドに一括適用される
- 失敗時の挙動: 未認証 → `401`、認証済みだが権限なし → `403`
- `uri` に指定するリソースは IM-Authz 側で事前登録が必要（`java-im-authz-usage` の `ResourceManager` 参照）。本アノテーションを付けるだけでは機能しない

## レスポンス制御系アノテーション

| アノテーション | 付与先 | 用途 |
|------|------|------|
| `@Response(code=...)` | 例外クラス | その例外がスローされた際の HTTP ステータスコードを指定 |
| `@ReturnValue` | 例外クラスのメソッド（getter） | 例外の付加情報をレスポンスボディへ含める |
| `@PreventWritingResponse` | メソッド | Web API Maker による自動レスポンス書き込みを抑制し、`HttpServletResponse` を引数で受け取って手動制御する |

## 引数・戻り値に指定可能な型

- 基本型（`int`/`String`/`boolean` 等）
- 配列
- `List`/`Set`
- `byte[]`（バイナリデータ）
- `InputStream`
- 上記を組み合わせたモデルクラス（`public`、引数なしコンストラクタ必須、getter/setter が揃ったメンバのみ入出力対象）

XML 形式でのやり取りに対応させる場合は、モデルクラスに `@XmlRootElement` を付与する。

## セッション管理の挙動（認証方式別）

`keep`/`once`/`never` の3段階指定に対する挙動。

| 設定値 | `@IMAuthentication` | `@BasicAuthentication` / `@OAuth` |
|------|------|------|
| `keep` | セッション管理は行わない | 未認証時にログイン後、実行後もログイン状態を維持する |
| `once` | セッション管理は行わない | 実行前が未認証であった場合、実行後にログアウトする |
| `never` | 実行後にログイン状態であればログアウトする | 実行後にログイン状態であればログアウトする（`OAuth` は `keep` の挙動が未認証からの遷移に限定されない点で `BasicAuthentication` と異なる） |

## HTTP ステータスコード対応表

| コード | 意味 |
|------|------|
| `200` | 成功 |
| `400` | リクエスト形式が不正（`@Required` 引数の未指定等） |
| `401` | 未認証 |
| `403` | 認証済みだが権限なし（`@Authz` 判定失敗等） |
| `404` | URL 不一致（パッケージ未登録・`@Path` 誤り等）、または `@Response(code=404)` を付けた例外 |
| `405` | HTTP メソッド不一致 |
| `406` | `Accept` ヘッダと出力可能な形式の不一致 |
| `415` | `Content-Type` の不正 |
| `500` | サーバエラー |

## API 仕様の参照

作成した API の仕様は次の URL で JSON 形式（Swagger 互換）で取得できる。

```
http://<HOST>:<PORT>/<CONTEXT_PATH>/api-docs/${api-category}
```

`${api-category}` は `@Category`（未指定時のデフォルトの分類）に対応する。Swagger UI からも視覚的に確認・実行できる。

## リクエスト/レスポンスの形式

- リクエストは `Content-Type` ヘッダ（`application/json` または `application/xml`）で形式を指定する
- レスポンスは `Accept` ヘッダで指定された MIME タイプで返却される。成功時のみ形式が保証され、エラー時の形式は保証されない
- レスポンスの `null` プロパティは出力されない
