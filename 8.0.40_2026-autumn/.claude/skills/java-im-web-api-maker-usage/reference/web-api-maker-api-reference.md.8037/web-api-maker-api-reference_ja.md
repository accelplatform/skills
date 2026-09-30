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
- 失敗時の挙動: 未認証 → `401`、認証済みだが権限なし → `403`。**ただし `@IMAuthentication`（セッション認証）と組み合わせた場合、未認証アクセスはこの判定に到達する前に `404` で止まり、`401` は実質発生しない。** 認証済みユーザに対する `403` はラップされたレスポンスで返る（「リクエスト/レスポンスの形式」参照）
- `uri` に指定するリソースは IM-Authz 側で事前登録が必要（`java-im-authz-usage` の `ResourceManager` 参照）。本アノテーションを付けるだけでは機能しない

## レスポンス制御系アノテーション

| アノテーション | 付与先 | 用途 |
|------|------|------|
| `@Response(code=...)` | 例外クラス | その例外がスローされた際の HTTP ステータスコードを指定 |
| `@ReturnValue` | 例外クラスのメソッド（getter） | 例外の付加情報をレスポンスボディへ含める |
| `@PreventWritingResponse` | メソッド | Web API Maker による自動レスポンス書き込みを抑制し、`HttpServletResponse` を引数で受け取って手動制御する。**メソッドの戻り値は常に無視される** |

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

各コードのレスポンスボディがラップ構造（`error`/`data`）になるかどうかは、コード値だけでは決まらない。「リクエスト/レスポンスの形式」の「ラップされる場合・されない場合」を参照すること。

## API 仕様の参照

作成した API の仕様は次の URL で JSON 形式（Swagger 互換）で取得できる。

```
http://<HOST>:<PORT>/<CONTEXT_PATH>/api-docs/${api-category}
```

`${api-category}` は `@Category`（未指定時のデフォルトの分類）に対応する。Swagger UI からも視覚的に確認・実行できる。

## リクエスト/レスポンスの形式

- リクエストは `Content-Type` ヘッダ（`application/json` または `application/xml`）で形式を指定する
- レスポンスは `Accept` ヘッダで指定された MIME タイプ（`application/json` または `application/xml`）で返却される
- レスポンスの `null` プロパティは出力されない

### レスポンスボディのラッパー構造

**Endpoint メソッドの戻り値はそのままレスポンスボディにはならず、必ず `error` / `data` を持つラッパーオブジェクトに包まれて返却される。** クライアント（画面・外部システム）側でこのラッパーを解かずに直接プロパティを参照すると、API 自体は正常に動作していても「データが受け取れない」状態になる。

成功時（`Accept: application/json`）:

```json
{
  "error": false,
  "data": {
    "id": 1,
    "name": "Dog",
    "sold": false,
    "attribute": {
      "breed": "golden"
    }
  }
}
```

例外発生時（Endpoint メソッドがスローした例外を Web API Maker が捕捉した場合）:

```json
{
  "error": true,
  "errorMessage": "[E.IWP.WEBAPIMAKER.CONVERTER.10001] JSON文字列からの変換に失敗しました。 json:434343"
}
```

例外クラスの getter に `@ReturnValue` を付与した場合、その戻り値は `data` 配下に格納される:

```json
{
  "error": true,
  "errorMessage": "例外が発生しました。",
  "data": {
    "optionalMessage": "入力された id に関する情報は存在しません。",
    "parameterValue": 111111
  }
}
```

| プロパティ | 型 | 内容 |
|------|------|------|
| `error` | boolean | 例外が発生したかどうか。成功時は `false`、例外発生時は `true` |
| `data` | object | 成功時は Endpoint メソッドの戻り値。例外発生時は `@ReturnValue` を付与した getter の値（`@ReturnValue` が無い場合は出力されない） |
| `errorMessage` | string | 例外発生時のみ出力される例外メッセージ。成功時は出力されない |

- 戻り値が `List`/配列の場合は `data` が JSON 配列になる。戻り値の型にかかわらず、外側のラッパー構造は変わらない
- **`@PreventWritingResponse` を付与したメソッドにはこのラッパーは付かない。** メソッドの戻り値は常に無視され、ボディは引数で受け取った `HttpServletResponse` へ実装者自身が書き込む（`sendRedirect()`／`getWriter()`／`getOutputStream()` 等）
- `@Response(code=...)` を付与した業務例外は、`200` 以外の HTTP ステータスコードであってもこのラッパー構造で返却される
- 実装後は Swagger UI（`/api-docs/${api-category}`）や `curl` で実レスポンスを確認し、クライアント側のパース処理と突き合わせること

### ラップされる場合・されない場合

ラップ構造（`error`/`data`）が付くかどうかは、HTTP ステータスコードの値でも `@Response` の有無でもなく、**Endpoint メソッドを通ったか（＝リフレクションによる `Method#invoke` を経由したか）どうか**で決まる。`Method#invoke` はスローされた例外を必ず `InvocationTargetException` でラップし、Web API Maker はこれを常にラップ済みレスポンスへ変換する。逆に、Endpoint メソッドに到達する前（認証チェック・各種 `ActionFilter` 等）で発生した応答・例外は、その箇所が明示的にラップ処理を呼んでいない限りラップされない。

**ラップされる**（`error`/`data` の JSON/XML）:

| ケース | 備考 |
|------|------|
| 成功時（`200`） | |
| Endpoint メソッド自身がスローした例外（`@Response` の有無を問わない） | `@Response(code=...)` を付けた業務例外だけでなく、**`@Response` の付いていない素の例外も含めて必ずラップされる**（`@Response` が無い場合はステータスコードが `500` になるだけ）。例: `{"error":true,"errorMessage":"..."}` |
| `@Required` 未指定（`400`） | 例: `{"error":true,"errorMessage":"Parameter 'name' is required."}` |
| `@Secured` のトークン未指定（`403`） | 例: `{"error":true,"errorMessage":"[E.IWP.WEBAPIMAKER.CORE.10011] アクセスが拒否されました。"}` |
| `@Authz` の認可拒否・認証済みユーザ（`403`） | 例: `{"error":true,"errorMessage":"[E.IWP.WEBAPIMAKER.CORE.10002] アクセスが拒否されました。"}` |
| `405`（メソッド不一致）／`415`（`Content-Type` 不正） | `400` と全く同じ `ClientErrorException` の階層・経路 |

**ラップされない**（HTML またはプレーンテキスト）:

| ケース | 備考 |
|------|------|
| 未認証アクセス（`@IMAuthentication` のみ、`@Authz` なし） | `404`・`Content-Type: text/html`、intra-mart 標準の汎用エラーページ。**`401` ではなく `404` になる**点に注意。認証チェック自体が Web API Maker のアクション・フィルタより手前で行われ、Endpoint メソッドに到達しない |
| 未認証アクセス（`@Authz` 付き） | 同じく `404`。`@Authz` の「未認証 → 401」という仕様は、`@IMAuthentication`（セッション認証）の場合は実質到達しない分岐である。到達前に `404` で止まるため |
| `ActionFilter` 内で発生し、そのフィルタ自身が明示的に捕捉していない例外（例: `@Authz` の認可判定時に IM-Authz 側がスローする `ResourceNotFoundException`。`WebApiAuthzActionFilter` は `AnnotationValueException` のみを捕捉するため素通りする） | `500`・`Content-Type: text/html`、intra-mart 標準の汎用エラーページ「HTTP 500: Servlet Exception」。Endpoint メソッドの外（`Method#invoke` を経由しない箇所）で発生した例外は、その箇所が明示的にラップ処理を呼ばない限りラップされない |
| URL 自体が未登録（パッケージ未登録・`@Path` 誤り等） | `404`・`Content-Type: text/html`。このアクション自体に到達しない |
| `Accept` ヘッダが不正・解決不能（`406`） | `RestResponseUtil.setErrorResponseByPlainText` により明示的にプレーンテキスト固定 |

**対象外**：`@BasicAuthentication`/`@OAuth` で認証に失敗した場合のレスポンス形式。`@IMAuthentication`（セッション認証）とは異なる認証方式・コードパスのため、上記がそのまま当てはまるとは限らない

### クライアント側の判定順序

1. HTTP ステータスコードを確認する
2. ボディのパースを試みる（`@Response(code=...)` を付けた業務例外は `200` 以外のステータスでもラップ構造で返るため、ステータスコードだけで打ち切らない）
3. パースできて `error` が `false` の場合のみ `data` を業務データとして利用する
4. `error` が `true` の場合は `errorMessage`（および `data` 内の `@ReturnValue` の値）をエラー情報として扱う
5. パースに失敗する、または `error` プロパティが存在しない場合（上表の「ラップが保証されないケース」を含む）は想定外のエラーとして扱う

クライアント側の実装例は `assets/web-api-maker-basic-usage.md`「パターン7: レスポンス制御」を参照。
