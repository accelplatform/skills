# im_oauth REST-API 全体像

intra-mart Accel Platform は、OAuth 2.0 プロバイダ機能（`im_oauth_provider`）を内蔵しており、外部クライアントアプリケーションに対して OAuth 認可付きの REST-API を公開できる。
JSSP（スクリプト開発モデル）ではファンクションコンテナを「リソースの実装」として登録し、`oauth-client-resources-config` でアクセス URL にマッピングする。

## 必要な資材（4 種類）

OAuth 経由で公開する REST-API を 1 つ追加するには、以下の 4 ファイルを揃える必要がある。

| # | 種別 | 配置先 | 役割 |
|---|------|--------|------|
| 1 | スコープ定義 XML | `src/main/conf/oauth-client-scopes-config/{任意のファイル名}.xml` | アクセス範囲（scope）を定義する |
| 2 | リソース URL 設定 XML | `src/main/conf/oauth-client-resources-config/{任意のファイル名}.xml` | URL ↔ JSSP リソース（または Java クラス）のマッピング・必要 scope の宣言 |
| 3 | クライアント詳細設定 XML | `src/main/conf/oauth-client-details-config/{任意のファイル名}.xml` | アクセスを許可するクライアントアプリケーション（client_id / client_secret / 認可種別 / 利用 scope） |
| 4 | リソース実装 .js | `src/main/jssp/src/{機能名}/oauth/{file}.js` | 実際の REST-API 処理（init 関数） |

> **注意:** `src/main/conf/` 配下に置いた設定ファイルは、ビルド・デプロイ後に WAR の `WEB-INF/conf/...` へ配置される想定。intra-mart 公式リファレンスの「`WEB-INF/conf/...`」の表記はデプロイ後のパス、本プロジェクト上のソースは `src/main/conf/...` を指す。

## 通常の JSSP REST-API（routing-jssp-config 経由）との違い

| 観点 | 通常の REST-API | OAuth REST-API |
|------|----------------|----------------|
| URL マッピング | `src/main/conf/routing-jssp-config/*.xml` の `<file-mapping>` | `oauth-client-resources-config` の `<client-resource path="..." target="..." />` |
| 認証 | テナントログインセッション（Cookie） | OAuth アクセストークン（`Authorization: Bearer ...`）。プラットフォームが検証 |
| 認可 | `<authz>` で URI/action 指定（任意） | `<authz>` で `welcome-all`（誰でも許可）または `uri/action`（認可リソースで制御）を選択。さらにアクセストークンの **scope** が `<client-resource>` の `<scope id>` と一致することが必須（AND 評価） |
| CSRF 対策（セキュアトークン） | 更新系で必須 | **不要**（OAuth トークンが認証として機能する。`X-Intramart-Secure-Token` 検証は付けないこと） |
| 認証ユーザ取得 | `Contexts.getAccountContext()` | 同じく `Contexts.getAccountContext()`。トークンの所有者ユーザのコンテキストが入る |
| `.html` ペアファイル | 画面なら必須 | **不要**（プレゼンテーションページではないため） |

## エンドポイント URL の形式

`oauth-client-resources-config` の `<client-resource path="...">` に書いた値が、そのまま公開 URL のパスとして使われる。
クライアントアプリケーションは下記のような形式でアクセスする:

```
GET {コンテキストパス}{path}
Authorization: Bearer <アクセストークン>
```

`{path}` の例:
- `<client-resource path="/oauth/jssp/sample" ... />` → `https://example.com/imart/oauth/jssp/sample`
- `<client-resource path="/oauth/sample_oauth/get_user" ... />` → `https://example.com/imart/oauth/sample_oauth/get_user`

> プロジェクト内では `/oauth/...` で始まる URL を使用するのが慣例（実 URL のプレフィックスは OAuth プロバイダ機能のディスパッチャ実装に依存するため、デプロイ後に必ず動作確認すること）。

## scope と authz の関係（重要）

OAuth REST-API へのアクセス制御は **2 段階** で行われる（AND 評価）。

1. **アクセストークンの scope チェック**: クライアントが認可コードフローで取得したアクセストークンには、ユーザが同意した scope のセットが紐づく。`<client-resource>` の `<scope id="...">` と完全一致が必要
2. **認可（authz）チェック**: `<client-resource>` の `<authz>` で指定する。書き方は 2 種類:
   - (A) `<authz>` を省略（トップの `<authz-default mapper="welcome-all" />` にフォールバック）… 認可判定を常にパス（scope のみで制御）。**追加成果物なしで動く**。明示的に `<authz mapper="welcome-all" />` と書くのは冗長なので避ける（routing-jssp-config と同じ規約）
   - (B) `<authz uri="service://..." action="execute" />` … 認可リソース URI/action でロール／ユーザ単位に制御。**認可リソースのインポート資材を別途用意する必要あり**（用意しないと常に 403）

両方を満たさない場合、プラットフォームがアプリケーションの `init` を呼ぶ前に 401 / 403 を返却する。
(A)(B) の選択基準は `oauth-resources-config.md` の「`<authz>` の書き方」を参照。

## 4 ステップの作業順序

1. **scope を決める** → `oauth-client-scopes-config` を書く
2. **リソース URL（path）と JSSP ファイルパス（target）を決める** → `oauth-client-resources-config` を書く（`<scope>` で 1 を参照）
3. **クライアント詳細を決める**（client_id / client_secret / 利用 scope）→ `oauth-client-details-config` を書く（`<scope>` で 1 を参照）
4. **JSSP（.js）を実装する** → 2 の `target` で指定したパスに配置する

## 関連リファレンス

- `oauth-scopes-config.md` - スコープ設定 XML の書き方
- `oauth-resources-config.md` - リソース URL 設定 XML の書き方
- `oauth-client-details-config.md` - クライアント詳細設定 XML の書き方
- `oauth-resource-implementation.md` - JSSP（.js）の実装ルール

## 一次情報

- intra-mart Accel Platform OAuth プログラミングガイド
  - 「intra-mart Accel Platform 上のリソースの提供方法（ スクリプト開発モデル ）」
    `https://document.intra-mart.jp/library/iap/public/im_oauth/im_oauth_programming_guide/texts/script/index.html`
- 設定ファイルリファレンス
  - `oauth-client-scopes-config`
    `https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_oauth/oauth-client-scopes-config/index.html`
  - `oauth-client-resources-config`
    `https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_oauth/oauth-client-resources-config/index.html`
  - `oauth-client-details-config`
    `https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_oauth/oauth-client-details-config/index.html`
