---
name: java-im-web-api-maker-usage
description: intra-mart 固有の Web API Maker（`jp.co.intra_mart.foundation.web_api_maker.*`、`im_web_api_maker` モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。アノテーション（`@WebAPIMaker`/`@ProvideFactory`/`@ProvideService`）によるファクトリ・サービスクラスの実装、`@Path` + HTTPメソッドアノテーションによるルーティング、`@Parameter`/`@Header`/`@Variable`/`@Body`/`@Bean` によるパラメータバインド、`@IMAuthentication`/`@BasicAuthentication`/`@OAuth` による認証方式の切替、`@Secured` によるセキュアトークン検証、`@Authz` による IM-Authz 連携、`@Response`/`@PreventWritingResponse`/`@ReturnValue` によるレスポンス制御の実装パターンを提供する。Java で Web API Maker を使いたい、Java で REST API を自動生成したい、JavaEE 開発モデルで @WebAPIMaker / @Path / @GET / @POST を使いたい、Web API Maker で OAuth 認証付き API を作りたい、と言及されたときに使用。認可リソース自体の登録・ポリシー設定は `java-im-authz-usage`、OAuth クライアントアプリケーション自体の登録・スコープの意味づけ設計は対象外（設定ファイルへの記述方法のみ扱う）。JSSP（スクリプト開発モデル）で REST API を作る場合は `jssp-page-generator`（通常 API）または `jssp-im-oauth-generator`（OAuth 付き API）を使うこと。
---

# intra-mart Web API Maker 利用支援スキル（Java 版）

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けの Web API Maker（`jp.co.intra_mart.foundation.web_api_maker.*`）を使い、Java クラスへのアノテーション付与のみで REST API（Web サービス）を実装するためのスキルセット。

## Web API Maker の基本概念（最重要）

Web API Maker は「Java クラス・メソッドへのアノテーション付与」だけで、そのクラスを Web サービスのプロバイダとして機能させる仕組み。実装には **2 つのクラス**が必要。

| クラス | 役割 | 必須アノテーション |
|------|------|------|
| ファクトリクラス | Endpoint インスタンスを生成する窓口 | `@WebAPIMaker`（クラス）/ `@ProvideFactory`（ファクトリ取得メソッド）/ `@ProvideService`（インスタンス生成メソッド） |
| **本ドキュメントでの「Endpoint クラス」**（Web API Maker 公式ドキュメント・javadoc 上は「サービスクラス」と呼ばれる） | `@Path`/HTTP メソッドアノテーションを持つ、HTTP リクエストの窓口。パラメータのバインドと Service 層への委譲のみを行う（ビジネスロジック本体は持たせない） | `@Path` + HTTP メソッドアノテーション（`@GET`/`@POST`/`@PUT`/`@DELETE`）を各メソッドに付与。クラスには認証方式アノテーションを付与 |

- エンドポイントは `@Path` で指定した URL（+ 認証方式ごとの接頭辞）にそのままマッピングされる。ルーティング設定ファイル（`routing-jssp-config` 等）は不要
- **認証方式は 3 種類**（`@IMAuthentication`/`@BasicAuthentication`/`@OAuth`）で、クラス単位の排他選択。詳細は「認証方式の選択」を参照
- **`META-INF/im_web_api_maker/packages` へのパッケージ登録を忘れると、アノテーションを付けてもサービスとして認識されない。** 最頻出の実装漏れなので、実装手順の最後に必ず確認する

## アーキテクチャとクラス命名（重要）

Web API Maker の公式ドキュメント・javadoc は `@Path`/HTTP メソッドアノテーションを持つクラスを慣習的に「サービスクラス」と呼ぶが、これは Web API Maker 自体の用語である。**本プロジェクトの命名規則（`.agents/requirements/java-naming/AGENTS.md` の「REST API エンドポイント → `Endpoint` サフィックス」）に従い、この役割の Java クラスには `Endpoint` サフィックスを付与する**（`OrderService` ではなく `OrderEndpoint`）。

Endpoint クラスにビジネスロジックや DB アクセスを直接書かず、以下の層構造に委譲すること。

```
Endpoint（@Path/@GET 等。HTTP リクエストの受付・パラメータ変換・Service 呼び出しのみ）
    ↓
Service（ビジネスロジック本体。`Xxx` + `Service` サフィックス）
    ↓
Repository（DB アクセスの抽象化。`Xxx` + `Repository`/`StandardXxxRepository`）
    ↓
DAO（`Xxx` + `DAO`）
```

- Repository・DAO 層の実装は `java-im-mirage-usage` スキルの対象（本スキルでは Endpoint → Service の委譲までを扱う）
- Endpoint クラスは Service のインスタンスをフィールドに保持し、メソッド呼び出しを委譲する（`assets/web-api-maker-basic-usage.md` パターン1を参照）
- Web API Maker のファクトリクラス名も役割に合わせる（`OrderServiceFactory` ではなく `OrderEndpointFactory`）。ただし `@ProvideService` アノテーション自体の名称は Web API Maker 側の固定仕様であり変更しない
- **紛らわしい同名の別クラスに注意。** `OrderEndpointFactory`（`webapi` パッケージ、`@WebAPIMaker` を付与し Endpoint インスタンスを生成する Web API Maker 専用のファクトリ）と、`OrderServiceFactory`（`service` パッケージ、`ServiceLoaderUtil.loadTopPriority` で `OrderService` の実装を解決する一般的なファクトリ。`java-im-mirage-usage` スキルの「Repository/Service のファクトリクラス」参照）は、名前は似ているが全く別の仕組み・パッケージのクラスである
- **Endpoint クラスは `SessionTemplate`/`DAOFactory`（`java-im-mirage-usage` が扱う API）を直接呼び出さない。** トランザクション境界は Service・Repository 側が自ら張るものであり、Endpoint はその境界を意識する必要がない（詳細は `java-im-mirage-usage` の SKILL.md「Repository / Service / Endpoint の責務分担」を参照）
- **Endpoint 自体も「インタフェース + Standard実装クラス」に分割し、`ServiceLoaderUtil.loadTopPriority` による差し替え可能な取得にできる（任意）。** Web API Maker は `@ProvideService` メソッドの**宣言上の戻り値型**を API クラスとして認識し、そのクラスの `Method` を走査して `@Path` 等のアノテーションを読み取り、実行時にリフレクションで呼び出す。そのため戻り値型を `Xxx` + `Endpoint`（インタフェース）にしても正しく動作する（`assets/web-api-maker-basic-usage.md` パターン1を参照）。ただし Repository/Service と異なり実装差し替えの必要性は限定的なため、**差し替え予定が無い単純な Endpoint では従来通り `public class` 1 クラスで完結させてよい**（インタフェース化は必須ではない）

## 他スキルとの境界（重要）

**このスキルが扱うのは「Web API Maker（Java アノテーションベースの REST API）」の実装のみである。** 類似の REST API 実装は開発モデル・認証方式によって担当スキルが異なる。

| 作りたいもの | 担当スキル |
|------|-----------|
| Java（JavaEE 開発モデル）で Web API Maker による REST API | **本スキル** |
| JSSP（スクリプト開発モデル）で CSRF セキュアトークン認証の通常 REST API | `jssp-page-generator` |
| JSSP（スクリプト開発モデル）で OAuth 認証付き REST API（im_oauth プロバイダ機能） | `jssp-im-oauth-generator` |
| 認可（IM-Authz）リソース・サブジェクト・ポリシーそのものの CRUD | `java-im-authz-usage`（本スキルの対象外。`@Authz` の `uri` に指定するリソースは事前にこちらで登録する） |
| OAuth クライアントアプリケーション自体の登録・スコープの業務的な意味づけ設計 | 本スキルの対象外。`oauth-client-details-config`/`oauth-client-scopes-config` への記述方法は扱うが、登録内容の設計自体はユーザ・関連ドキュメントの指示に従う |

「Web API Maker で」「Java のアノテーションで REST API を」等の明示がなく、単に「REST API を作りたい」とだけ言われた場合は、JSSP/Java のどちらの開発モデルか、認証方式（セッション/Basic/OAuth）は何かをユーザに確認する。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API 概要

`jp.co.intra_mart.foundation.web_api_maker.annotation` パッケージ配下のアノテーション一覧・属性・シグネチャは `reference/web-api-maker-api-reference.md` を参照すること（記憶や推測で書かない）。

主なポイント:
- **クラス・インタフェース・モデルは全て `public`、モデルは引数なしコンストラクタが必須。** getter/setter が揃ったメンバのみ入出力対象になる
- **戻り値・引数には基本型、配列、`List`/`Set`、`byte[]`（バイナリ）、`InputStream` 等が使える。** レスポンス形式は `Accept` ヘッダの MIME タイプ（JSON/XML）に応じて自動変換される。`null` プロパティは出力されない
- **エラー時のレスポンス形式は保証されない。** 成功時のみ `Accept` ヘッダに従った形式で返却される
- 作成した API の仕様は `http://<HOST>:<PORT>/<CONTEXT_PATH>/api-docs/${api-category}` で JSON 形式（Swagger 互換）で参照できる

## 認証方式の選択

| アノテーション | 用途 | エンドポイント接頭辞 | 追加で必要なもの |
|------|------|------|------|
| `@IMAuthentication` | Cookie に紐づくセッション認証（ブラウザからのログイン状態を利用） | なし（`@Path` の値そのまま） | なし |
| `@BasicAuthentication` | Basic 認証 | `/basic`（属性で変更可） | なし |
| `@OAuth` | OAuth2 認証 | `/oauth`（属性 `pathPrefix` で変更可、デフォルト `/oauth`） | **Web API Maker OAuth認証モジュールの追加導入**、`scope` 属性の指定、OAuth 側 3 種の設定ファイル（`oauth-client-scopes-config`/`oauth-client-resources-config`/`oauth-client-details-config`） |

セッション管理（`keep`/`once`/`never`）の挙動は認証方式ごとに異なる。詳細は `reference/web-api-maker-api-reference.md` を参照。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| ファクトリ・Endpointクラスの基本実装 | `assets/web-api-maker-basic-usage.md` | `@IMAuthentication` を使った最小構成、Service層への委譲、パッケージ登録 |
| パラメータバインド | `assets/web-api-maker-basic-usage.md` | `@Variable`（パス）/`@Parameter`（クエリ）/`@Body`（エンティティ）/`@Bean`（集約） |
| Basic 認証 API | `assets/web-api-maker-basic-usage.md` | `@BasicAuthentication` の実装パターン |
| OAuth 認証 API | `assets/web-api-maker-basic-usage.md` | `@OAuth(scope=...)` の実装、3 種の設定ファイル一式 |
| IM-Authz 連携（認可チェック） | `assets/web-api-maker-basic-usage.md` | `@Authz(uri=..., action=...)` の実装、`java-im-authz-usage` との連携ポイント |
| セキュアトークン検証 | `assets/web-api-maker-basic-usage.md` | `@Secured` の実装パターン |
| レスポンス制御 | `assets/web-api-maker-basic-usage.md` | 例外 → ステータスコード（`@Response`）、手動レスポンス（`@PreventWritingResponse`）、例外側の付加情報（`@ReturnValue`） |

### リファレンス

- `reference/web-api-maker-api-reference.md` — `jp.co.intra_mart.foundation.web_api_maker.annotation` 配下の全アノテーションの属性・シグネチャ、引数・戻り値に指定可能な型、セッション管理の挙動比較、HTTP ステータスコード対応表（公式ドキュメント・javadoc の記述に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java で Web API Maker を使って REST API を作りたい」
- 「JavaEE 開発モデルで `@WebAPIMaker`/`@Path`/`@GET` を使いたい」
- 「Web API Maker で OAuth 認証付きの API を作りたい」
- 「Java のアノテーションだけで Web サービスを実装したい」

「Web API Maker で」「Java のアノテーションで」等の明示がない場合は、プロジェクトの開発モデル（JSSP/Java）を確認する。

「REST API に認可（Authz）のリソース・ポリシーを新規登録したい」という依頼のうち、リソース・サブジェクト・ポリシーの CRUD 自体は `java-im-authz-usage` に誘導する（本スキルは `@Authz` アノテーションの付与までを扱う）。

## 実装手順

1. ユーザの要件をヒアリング（エンドポイントの URL・HTTP メソッド・認証方式・認可要否・入出力データ構造）
2. パッケージ・ファクトリクラス名・Endpointクラス名を設計（`.agents/requirements/java-naming/AGENTS.md` に準拠。Endpointクラスは `Xxx` + `Endpoint`、ファクトリクラスは `Xxx` + `EndpointFactory`）
3. `assets/web-api-maker-basic-usage.md` を参照してファクトリクラス・Endpointクラスを実装（メソッドのシグネチャ・属性は `reference/web-api-maker-api-reference.md` を必ず参照し、記憶や推測で書かない）。Endpointクラスにはビジネスロジックを書かず、Service（インタフェース）を `XxxServiceFactory.getInstance()` で取得してフィールドに保持し、そこへ委譲する（`new StandardXxxService()` で直接生成しない。`java-im-mirage-usage` の Repository/DAO を呼び出す Service の実装パターンを参照）。Endpoint 自体の実装差し替えが必要な場合のみ、Endpoint も「インタフェース + Standard実装クラス」に分割し、ファクトリクラスの `@ProvideService` メソッド内で `ServiceLoaderUtil.loadTopPriority` により解決する（パターン1参照。不要な場合は `public class` 1 クラスのままでよい）
4. `META-INF/im_web_api_maker/packages` に Endpointクラスのパッケージ名を登録する（**実装漏れが最も多い箇所**）
5. 認可チェックが必要な場合、`@Authz(uri=..., action=...)` を付与し、対応する認可リソースが IM-Authz 側に登録済みか確認する（未登録なら `java-im-authz-usage` で登録処理を実装するようユーザに確認）
6. OAuth 認証が必要な場合、Web API Maker OAuth認証モジュールが導入されているか確認したうえで `@OAuth(scope=...)` を付与し、`oauth-client-scopes-config`/`oauth-client-resources-config`/`oauth-client-details-config` の 3 点を整備する
7. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **`META-INF/im_web_api_maker/packages` への登録を忘れると、アノテーションを正しく付けていてもサービスとして認識されない。** 生成後の確認で必ずチェックする
- **クラス・インタフェース・モデルは全て `public`、モデルクラスは引数なしコンストラクタが必須。** どちらか欠けると変換に失敗する
- **Endpoint クラスに DB アクセス（`DAOFactory`/`SqlManager` 等）を直接書かない。** 必ず Service クラス経由で Repository/DAO（`java-im-mirage-usage` の責務）を呼び出す。Endpoint から Repository/DAO を直接呼ぶと Service 層が形骸化し、ビジネスロジックの再利用性・テスト容易性が失われる
- **`@OAuth` は基本モジュールだけでは動作しない。** Web API Maker OAuth認証モジュールの追加導入が前提条件であることをユーザに伝える
- **`@Authz` の `uri` に指定する認可リソースは、事前に IM-Authz 側で登録されている必要がある。** Web API Maker 側で `@Authz` を付けるだけでは機能せず、`java-im-authz-usage` による `ResourceManager`/`PolicyManager` 側の登録（またはテナントセットアップのインポート資材）とセットで初めて成立する
- **`@Secured` によるセキュアトークン検証と、認証アノテーション（`@IMAuthentication` 等）は別の関心事。** セキュアトークンは CSRF 対策、認証アノテーションは「誰としてアクセスするか」の判定であり、両方が必要な場面（例: ブラウザから呼ばれる状態変更系 API）を混同しない
- **エラー時のレスポンス形式（JSON/XML）は保証されない。** クライアント側の実装で、成功時と失敗時のレスポンスパース処理を分ける設計にする
- **`Effect`（IM-Authz）や認可判断の詳細な CRUD API は本スキルの対象外。** `@Authz` の使い方までが本スキルの範囲で、リソース登録・ポリシー設定の実装コードは書かない（`java-im-authz-usage` に誘導する）

## 生成後の確認

JSSP 版のような専用検証スクリプト（`validate-jssp-code.js` 相当）は現時点で未整備。以下を手動で確認する。

1. Endpoint クラスのパッケージ名が `META-INF/im_web_api_maker/packages` に登録されているか
2. Endpoint クラス・モデルクラス・関連インタフェースが全て `public` か、モデルクラスに引数なしコンストラクタがあるか
3. クラスに付与した認証アノテーション（`@IMAuthentication`/`@BasicAuthentication`/`@OAuth`）が要件と一致しているか、複数付与していないか
4. `@OAuth` を使用している場合、Web API Maker OAuth認証モジュールの導入前提と `scope` 属性の指定漏れがないか
5. `@Authz` を使用している場合、`uri`/`action` が IM-Authz 側の登録内容と一致しているか（`java-im-authz-usage` 側の実装と突き合わせる）
6. `@Path` の値・HTTP メソッドアノテーションがヒアリング内容と一致しているか、パスパラメータ（`{xxx}`）と `@Variable(name=...)` が一致しているか
7. 状態変更系（POST/PUT/DELETE）のエンドポイントに `@Secured` の要否を検討したか
8. **クラス名が `Endpoint`（Web API Maker のクラス）/`EndpointFactory`（ファクトリ）/`Service`（ビジネスロジック）/`Repository`（DBアクセス抽象化）の命名規則・層構造に沿っているか。** Endpoint クラスに DB アクセスやビジネスロジックが直接書かれていないか（`Endpoint → Service → Repository → DAO` の順で委譲されているか）
9. Endpoint クラスが `new StandardXxxService()` のように Service の具象クラスを直接生成せず、`XxxServiceFactory.getInstance()`（`ServiceLoaderUtil.loadTopPriority` によるファクトリ）で取得しているか
10. Endpoint をインタフェース化した場合、`@IMAuthentication` 等のクラスアノテーション・`@Path`/`@GET`/引数アノテーションが実装クラスではなくインタフェース側に宣言されているか、ファクトリクラスの `@ProvideService` メソッドの**戻り値型がインタフェース**になっているか（実装クラス型のままだとアノテーションが認識されずエンドポイントが登録されない）
11. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
12. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）での Web API Maker による REST API 実装** | **本スキル** |
| JSSP（スクリプト開発モデル）での通常 REST API（CSRF セキュアトークン認証） | `jssp-page-generator` |
| JSSP（スクリプト開発モデル）での OAuth 認証付き REST API（im_oauth プロバイダ機能） | `jssp-im-oauth-generator` |
| Java での認可（IM-Authz）リソース・サブジェクト・ポリシーの CRUD、権限確認 | `java-im-authz-usage` |
| Java でのロール定義・ユーザへのロール割当 | `java-im-role-usage` / `java-im-account-usage` |
| Java でのファイル操作（`PublicStorage` 等） | `java-im-storage-usage` |
