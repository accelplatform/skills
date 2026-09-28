# JSSP/Java/ローコード資材のスキルセット

## 概要

このレポジトリは、intra-mart Accel Platform における、以下の資材を作成するためのスキルセットを収録している。
* JSSP（スクリプト開発モデル）による画面、各種プラグインのソースコード
* Java（JavaEE 開発モデル）による各種プラグイン（画面を除く）のソースコード
* IM-LogicDesigner / IM-Workflow / IM-BPM の資材

コーディングエージェントのトークン消費削減のため、下記の「スキル逆引き」に従って、必要なスキルセットのみを取り出して使用することを推奨。

## スキル逆引き

### 画面を作りたい

- JSSP（プロコード）で業務画面を新規作成したい
  - ⇒ `jssp-page-generator` + `jssp-imds-theme`
    - ファンクションコンテナ（js）・プレゼンテーションページ（html）・ルーティングテーブル（xml）を一括生成
    - データベースアクセスが必要な場合、2WaySQL（sql）と API 呼び出しを実装
    - intra-mart Design System（imds）をベースとしたデザインを採用
- グラフ・チャートを業務画面に表示したい
  - ⇒ `jssp-highcharts-usage`
    - intra-mart 同梱の Highcharts ライブラリの組み込みと、ライブラリ使用したグラフを生成
- IM-共通マスタの検索ダイアログを業務画面に組み込みたい
  - ⇒ `jssp-im-master-usage`
    - ユーザ・会社・組織・役職・パブリックグループ・プライベートグループ・ロールの検索機能を組み込み

### サーバサイドキャッシュを使いたい

- JSSP（スクリプト開発モデル）のファンクションコンテナで、参照結果や計算コストの高い処理結果をキャッシュして高速化したい
  - ⇒ `jssp-im-cache-usage`
    - SSJS `Cache` クラス（`get`/`put`/`remove`/`removeAll`）の基本パターン、キャッシュ設定ファイル（`WEB-INF/conf/im-ehcache-config/*.xml`）の作成、キャッシュキー設計を提供
    - Java（JavaEE 開発モデル）で同等の処理を作る場合は `java-im-cache-usage` を使用

### 外部システム向けの REST-API を作りたい

- OAuth 認証付きの REST-API を新規公開したい
  - ⇒ `jssp-im-oauth-generator`
    - im_oauth プロバイダ機能を使用するスコープ定義（xml）・リソース URL 設定（xml）・クライアント詳細設定（xml）・JSSP リソース実装（js）を一括生成
    - CSRF セキュアトークン検証は付けず、OAuth アクセストークンで認証
    - ブラウザのテナントログインセッション経由で呼ばれる通常の REST-API は `jssp-page-generator` スキルで定義

### ジョブプログラムを作りたい

- JSSP（プロコード）でジョブスケジューラのバッチ処理を作りたい
  - ⇒ `jssp-im-job-generator`
    - 画面を持たない定期実行・一括処理用のジョブプログラムをファンクションコンテナ（js）で生成
- IM-ContentsSearch のクローラジョブを作りたい
  - ⇒ `jssp-im-contents-search-generator`
    - データを収集して IM-ContentsSearch へ全文検索データを登録するジョブプログラムを生成

### IM-Workflow の資材を作りたい

- ワークフローのマスタ定義ファイルを作りたい
  - ⇒ `base-im-workflow-generator`
    - コンテンツ・ルート・フロー・案件プロパティ・分岐ルールを含むインポート用 XML を生成
    - 直線・分岐・同期・横配置・縦配置のルートパターンに対応
    - サンプルでインストールされるユーザ・会社・組織・役職・パブリックグループに対応 ※拡張は MCP を使用（予定）
    - 日本語（ja）・英語（en）・中国語簡体字（zh_CN）に対応
- ワークフローと連携する各種画面・処理を JSSP（スクリプト開発モデル）で作りたい
  - ⇒ `jssp-im-workflow-usage`（+ `jssp-page-generator`）
    - 申請/承認/詳細/確認/参照画面（html + js）の生成
    - アクション処理・到達処理・案件開始/終了処理・分岐条件判定・各種リスナー（js）の生成
- ワークフローのアクション処理・到達処理・案件開始/終了処理・分岐条件判定・各種リスナーを Java（JavaEE 開発モデル）で作りたい
  - ⇒ `java-im-workflow-usage`
    - `ActionProcessEventListener` 等のプラットフォーム抽象クラス／リスナーインタフェースを継承・実装する Java クラスを生成
    - 画面（申請/承認/確認）は対象外。画面は現状 `jssp-im-workflow-usage` の JSSP 実装を使用

### IM-Propagation でモジュール間データ連携をしたい

- Java（JavaEE 開発モデル）で `PropagationManager` によるデータ送受信を実装したい
  - ⇒ `java-im-propagation-generator`
    - 送信側（データモデル・`GenericModel`・`Encoder`・送信設定ファイル）と受信側（`Decoder`・`Procedure`・受信設定ファイル）双方の実装パターンを提供
    - `AbstractProcedure`（DBトランザクション相乗り）と `AbstractSessionableProcedure`（独自の2相コミット的ライフサイクル）の使い分けを含む
    - intra-mart 標準の変更通知（テナント・アカウント・ロール・IM-Authz・メニュー・カレンダー・ジョブネット・Salesforce連携・Wiki等）を独自モジュールで受信するリスナー実装、および IM-Box（アプリ通知・ウォッチ）への送信パターンも提供
    - JSSP（スクリプト開発モデル）向けの同等 API は提供されていない

### IM-LogicDesigner の資材を作りたい

- ロジックフロー（ローコード）の定義ファイルを作りたい
  - ⇒ `jssp-im-logic-generator`
    - ロジックフロー（flow_definition.json）・ルーティング（flow_route.json）を含むインポート用 ZIP を生成
    - テナント管理機能が持つ標準タスク（認可・リポジトリ操作・メール送信等 125 種）に対応 ※拡張は MCP を使用（予定）
    - 標準マッピング関数（数値演算・文字列操作・配列操作・JSON・BASE64 等 52 種）に対応 ※拡張は MCP を使用（予定）
    - ユーザ定義タスク（JavaScript・REST・SQL・Database Fetch・テンプレート）に対応 ※拡張は MCP を使用（予定）
- JSSP 画面から既存のロジックフロー（ルーティング定義済み）を呼び出したい
  - ⇒ `jssp-im-logic-usage`（+ `jssp-page-generator`）
    - swagger spec（`<BASE-URL>/logic/all-api-docs`）を取得・解析し、リクエスト/レスポンス構造を特定した上で `fetch` 呼び出しコードを生成
    - 権限不足（401/403）の場合は認可設定の案内メッセージを提示
- 独自のタスク（フロー要素）を Java（JavaEE 開発モデル）で実装したい
  - ⇒ `java-im-logic-generator`
    - カテゴリクラス（`ElementCategory`）・フロー要素クラス（`Task` 継承 + `@LogicFlowElement`）・メタデータクラス（`FlowElementMetadata`）・拡張パッケージ登録（`ElementScanPackageFactory` + `META-INF/services`）の実装パターンを提供
    - マッピング関数・EL関数・フロートリガの実装は対象外

### IM-BPM の資材を作りたい

- BPMN(XML) から仕様書を作成したい
  - ⇒ `bpm-docs-generator`
    - BPMN のプロセス定義から、プロセス概要・フローの説明・タスク詳細・条件分岐ロジックを抽出し Markdown 形式の仕様書を生成
    - 生成した仕様書は JSSP 生成時の入力プロンプトとしても使用する
- 仕様書を intra-mart Knowledge にインポートできる形式にしたい
  - ⇒ `bpm-docs-generator`
    - 仕様書を Knowledge へインポート可能な zip ファイルに変換
- BPM 仕様書を元に IM-BPM for Accel Platform 上で動かす JSSP リソースを作りたい
  - ⇒ `bpm-scripts-generator`（+ `jssp-page-generator` / `jssp-imds-theme`）
    - `bpm-docs-generator` が作成した仕様書を元に、スクラッチ画面連携等 IM-BPM 独自要素を含む JSSP リソースを生成
- 仕様書・生成スクリプトの内容を BPMN-XML に反映したい
  - ⇒ `bpm-xml-reflector`
    - `bpm-docs-generator` で作成した仕様書、`bpm-scripts-generator` で生成したスクリプトの内容を BPMN-XML に反映

### 多言語化したい

- JSSP 業務画面において、ハードコードされた文字列を多言語対応したい
  - ⇒ `jssp-localize-support`（+ `jssp-page-generator`）
    - メッセージプロパティファイル（properties）の作成
    - `<imart type="message">` タグ・MessageManager API への書き換え
    - 日本語（ja）・英語（en）・中国語簡体字（zh_CN）に対応
- Java（JavaEE 開発モデル）で MessageManager を使ったメッセージプロパティの取得処理を作りたい
  - ⇒ `java-im-message-usage`
    - `jp.co.intra_mart.foundation.security.message.MessageManager` によるユーザ/テナント/システムロケールの解決順序、プレースホルダ置換、メッセージ存在確認（`hasMessage`）の実装パターンを提供
    - メッセージプロパティファイル（`.properties`）の配置・キー命名規約（JSSP 側 `jssp-localize-support` と共通）を含む
    - JSSP（スクリプト開発モデル）での同等実装は `jssp-localize-support` を使用

### テスト・品質チェックをしたい

- JSSP 画面生成後の検証・修正を実行したい（`jssp-page-generator` から自動委譲）
  - ⇒ `jssp-page-verifier`
    - 生成された JSSP ソースコードに関する機械的な検証をサブエージェントとして担当
- コードレビューをコーディングエージェントに実行させたい
  - ⇒ `jssp-code-review`
    - 一般的なコーディング規約・バインド変数等の使い方・命名規則・エラーハンドリング等の観点で総合レビュー
- セキュリティの脆弱性を検出したい
  - ⇒ `jssp-security-check`
    - SQL インジェクション・XSS・eval 使用・ハードコード資格情報等の危険性・脆弱性を検出
- ファンクションコンテナの単体テストを作りたい
  - ⇒ `jssp-jest-test`
    - Jest on Rhino を使用したファンクションコンテナ（js）の単体テストを生成（調整中）
- 業務画面の E2E テストを作りたい
  - ⇒ `jssp-playwright-test`
    - Playwright を使用した JSSP 画面（html + js のペア）の E2E テストを生成（調整中）
- 仕様書から試験観点一覧・試験項目書を作りたい（Excel または HTML）
  - ⇒ `test-spec-generator`
    - 仕様書ファイルから、xlsx（officecli 使用）または HTML の試験観点一覧・試験項目書を生成

### JavaEE 開発モデルで intra-mart 固有機能を使いたい

- Java（JavaEE 開発モデル）で PublicStorage / SessionScopeStorage / SystemStorage を使ったファイル操作処理を作りたい
  - ⇒ `java-im-storage-usage`
    - 永続ファイル（`PublicStorage`）・一時ファイル（`SessionScopeStorage`）・システム内部リソース（`SystemStorage`）の使い分けと、`try-with-resources` によるリソース管理パターンを提供
    - JSSP（プロコード）での同等実装は `jssp-page-generator` の `reference/api-storage.md`（SSJS 版 Storage API）を使用
- Java（JavaEE 開発モデル）で Identifier API を使った一意 ID 採番処理を作りたい
  - ⇒ `java-im-identifier-usage`
    - 分散環境でシステム全体の一意性を保証する `get()` と、アプリケーションサーバ内のみで一意な `make()` の使い分けを提供
    - 伝票番号・申請番号等の業務データ採番には `get()`、ログのトレース ID 等プロセス内で閉じた識別子には `make()` をデフォルトとして案内
- Java（JavaEE 開発モデル）で NewLock API を使った排他制御処理を作りたい
  - ⇒ `java-im-lock-usage`
    - `try`/`finally` で解放する通常ロック（`lock()`/`tryLock()`）と、リクエスト返却時に自動解放されるリクエストスコープロック（`lockRequestScope()`/`tryLockRequestScope()`）の使い分けを提供
    - 分散環境でのDBベース排他制御を、メソッド内で完結する処理には通常ロックをデフォルトとして案内
- Java（JavaEE 開発モデル）で CacheManager/Cache API を使ったテナント単位のキャッシュ処理を作りたい
  - ⇒ `java-im-cache-usage`
    - `CacheManagerFactory.getCacheManager()` によるキャッシュマネージャ取得、`Cache<K, V>` の CRUD（`get`/`put`/`remove`/`removeAll` 等）、キャッシュ設定ファイル（`WEB-INF/conf/im-ehcache-config/*.xml`）の作成を提供
    - キャッシュキー・値の `Serializable` 制約、キャッシュミス時の再読み込みパターンを含む
    - JSSP（スクリプト開発モデル）での同等実装は `jssp-im-cache-usage` を使用
- Java（JavaEE 開発モデル）で AccountInfoManager を使ったアカウント情報の取得・更新処理を作りたい
  - ⇒ `java-im-account-usage`
    - ログイン設定（ロケール・タイムゾーン・カレンダー・テーマ・週開始曜日・日時フォーマット）、アカウントロック・ログイン失敗回数、アカウント属性、パスワード照合（`AccountPasswordAdapter`）の実装パターンを提供
    - ユーザへのロール割当（`addAccountRoleInfo` 等）もこのスキルの対象。ロール定義自体（新規登録・階層・カテゴリ）は `java-im-role-usage` を使用
- Java（JavaEE 開発モデル）で UserProfileImageManager を使った IM-共通マスタのプロファイル画像操作を作りたい
  - ⇒ `java-im-profile-usage`
    - プロファイル画像の取得（Stream形式・URL形式、単数/複数）、削除、登録（データURL形式／`Storage` 経由）の実装パターンを提供
    - ユーザ基本情報（氏名・所属等）そのものの操作、IM-LogicDesigner のロジックフロー要素（`jp.co.intra_mart.foundation.logic.element.profile` 配下）は対象外
- Java（JavaEE 開発モデル）で RoleInfoManager を使ったロール定義の管理処理を作りたい
  - ⇒ `java-im-role-usage`
    - ロールの新規登録・更新・削除、サブロール階層（追加・削除・全親/全サブロール取得）、カテゴリ管理、ロールID/ロール名/カテゴリによる検索・ページネーションの実装パターンを提供
    - 特定ユーザへのロール割当は対象外。`java-im-account-usage` を使用
- Java（JavaEE 開発モデル）で認可（Authorization）リソース・サブジェクト・ポリシーの CRUD や権限確認処理を作りたい
  - ⇒ `java-im-authz-usage`
    - `ResourceManager`/`SubjectManager`/`PolicyManager` によるリソース・サブジェクト（Expression による条件式構成）・ポリシーの登録/更新/削除、`AuthorizationClient` による権限確認（authorize）の実装パターンを提供
    - ロール定義自体・ユーザへのロール割当は対象外。それぞれ `java-im-role-usage`/`java-im-account-usage` を使用
- Java（JavaEE 開発モデル）で Web API Maker を使った REST API を作りたい
  - ⇒ `java-im-web-api-maker-usage`
    - アノテーション（`@WebAPIMaker`/`@Path`/`@GET` 等）のみで REST API を実装するファクトリ・サービスクラスの生成パターンを提供
    - 認証方式（`@IMAuthentication`/`@BasicAuthentication`/`@OAuth`）、認可連携（`@Authz`）、セキュアトークン検証（`@Secured`）、レスポンス制御に対応
    - 認可リソース自体の登録は `java-im-authz-usage`、JSSP での REST API は `jssp-page-generator`/`jssp-im-oauth-generator` を使用
- Java（JavaEE 開発モデル）で SecureToken（CSRF 対策）の発行・検証を Web API Maker に頼らず実装したい
  - ⇒ `java-im-secure-token-usage`
    - `SecureTokenManager` による トークン発行（`createToken`）・検証（`verify`）、ワンタイムトークンと再利用可能トークンの使い分け、パラメータ連動トークンによる改ざん検知、`HTTPContextManager` による `HttpServletRequest` 取得パターンを提供
    - Web API Maker エンドポイントでの宣言的な検証（`@Secured`）は `java-im-web-api-maker-usage` を使用
- Java（JavaEE 開発モデル）で intra-mart 上に MCP（Model Context Protocol）サーバを作りたい
  - ⇒ `java-im-mcp-generator`
    - `im_copilot_mcp` モジュールの `@MCPServer`/`@Tool` アノテーションによる Streamable HTTP MCP サーバの実装パターンを提供
    - `SchemaProperties` によるツールパラメータ定義、`McpScanPackageFactory`（推奨）/`META-INF/im_services/annotation_classes` によるプラットフォームへの登録パターンを含む
    - 通常の REST API（AI エージェント向けでない）は `java-im-web-api-maker-usage` を使用
- Java（JavaEE 開発モデル）でプロンプトを受けて処理し応答を返す AI エージェントを作りたい
  - ⇒ `java-im-copilot-agent-generator`
    - `im_copilot_agent` モジュールの `Agent`/`AgentBuilder` によるエージェント構築、`UserDefinedTool` によるカスタムツール実装、`Knowledge`（ナレッジ検索）・`SkillEntry`（Markdownスキル）の統合、Structured Output（型付き出力）、`AgentExecutionMiddleware` による実行フロー介入の実装パターンを提供
    - IM-Copilot のチャットUIと連携させる場合の `AbstractCopilotAssistant`/`@Assistant` 連携パターンを含む（`Agent`/`AgentBuilder` 自体は Assistant フレームワークに依存しない独立した Java API）
    - MCP サーバの実装は `java-im-mcp-generator`、通常の REST API は `java-im-web-api-maker-usage` を使用
    - `VectorStore`/`ActionFactory` を直接使った低レベルな RAG は `java-im-copilot-rag-generator`、`ChatAction`+`ToolConfig` を直接使った低レベルな Tool Calling は `java-im-copilot-toolcalling-generator` を使用
- Java（JavaEE 開発モデル）で `VectorStore`/`ActionFactory` を直接使って RAG（検索拡張生成）を実装したい
  - ⇒ `java-im-copilot-rag-generator`
    - `VectorStoreBuilder`/`VectorStore` によるベクトルストアの構築・登録・ハイブリッド検索/類似検索/キーワード検索、`ActionFactory`/`ChatAction`/`EmbeddingsAction` によるチャット・埋め込み呼び出しの実装パターンを提供
    - 文書の標準実装 `StandardRegistrationDocument`、`TextSplitter`（`splitText` メソッド）によるチャンク分割を含む
    - Agent フレームワーク経由の高レベルな RAG（`Knowledge`/`RegisteredKnowledge`）は `java-im-copilot-agent-generator`、Tool Calling は `java-im-copilot-toolcalling-generator` を使用
- Java（JavaEE 開発モデル）で `ChatAction`+`ToolConfig` を直接使って Tool Calling（関数呼び出し）を実装したい
  - ⇒ `java-im-copilot-toolcalling-generator`
    - `ToolConfig`/`ToolDefinition`/`ToolChoice`/`ToolCall` によるプロバイダ非依存（OpenAI・Azure OpenAI Service・Amazon Bedrock 共通）の Tool Calling 実装パターンを提供（非ストリーミング・ストリーミング両対応）
    - `JsonSchemaValidator`/`ToolJsonHelper` によるツール引数の検証・デシリアライズを含む
    - Agent フレームワーク経由の高レベルな Tool Calling（`UserDefinedTool`）は `java-im-copilot-agent-generator`、RAG は `java-im-copilot-rag-generator` を使用
- Java（JavaEE 開発モデル）で UserManager/CompanyManager/PublicGroupManager/PrivateGroupManager/CompanyGroupManager/CorporationGroupManager/CorporationManager/CustomerManager/ItemCategoryManager/ItemManager/CurrencyManager を使った IM-共通マスタ（ユーザ・会社・組織・役職・パブリック/プライベート/会社/法人グループ・法人・取引先・品目カテゴリ・品目・通貨）の CRUD・検索処理を作りたい
  - ⇒ `java-im-master-usage`
    - ユーザ情報（`User`、`UserManager`）、会社（`Company`）・組織/組織セット（`Department`/`DepartmentSet`）・役職（`CompanyPost`）・ユーザの組織所属（`UserAttach`、いずれも `CompanyManager`）の取得・検索・新規登録・更新・削除、組織階層（ツリー）取得の実装パターンを提供
    - `Company` に新規登録専用メソッドが存在しない点、`set*` 系メソッドの期間コード（`termCd`）による新規/更新自動判定、多言語情報登録手順（`setDefaultLocale`/`createLocaleElement`/`putLocaleElement`）を含む
    - パブリックグループ・プライベートグループ・会社グループ・法人グループそれぞれ専用のマネージャクラスによる取得・検索・新規登録・更新・削除、パブリックグループの分類（カテゴリ）・ロール・階層（ツリー）取得の実装パターンも提供
    - グループ系4クラスの API 規模・機能範囲の違い（パブリックグループのみカテゴリ・ロール・ツリー機能を持つ、プライベートグループが最小構成、法人グループは会社コードを追加で保持する点等）を含む
    - 法人（`CorporationManager`。法人グループとは別クラス）・取引先（`CustomerManager`）・品目カテゴリ（`ItemCategoryManager`。階層ツリーあり）・品目（`ItemManager`）・通貨（`CurrencyManager`。`Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`）の取得・検索・新規登録・更新・削除の実装パターンも提供。`CustomerManager`/`ItemManager` はメソッド名がエンティティ名を含まない汎用名で第一引数が `companyCd` である点を含む
    - ユーザ分類・パブリックグループ分類・組織分類（`UserCtg`/`PublicGroupCtg`/`DepartmentCtg` 等、いずれも対応するマネージャクラスに内包される機能）の取得・検索・新規登録・更新・削除の実装パターンも提供
    - ユーザプロファイル画像は `java-im-profile-usage`、ロール定義・ロール割当は `java-im-role-usage`/`java-im-account-usage`、認可は `java-im-authz-usage` を使用
- Java（JavaEE 開発モデル）で im_mirage を使った DB アクセス処理を作りたい
  - ⇒ `java-im-mirage-usage`
    - エンティティクラス（`@Table`/`@Column`/`@PrimaryKey`）、DAOクラス（`AbstractDAO` 継承・`DAOFactory` 取得）、2WaySQL の SQLファイル、`SessionTemplate` によるトランザクション管理の実装パターンを提供
    - JSSP での DB アクセスは `jssp-page-generator`（`TenantDatabase`/`SharedDatabase` API）を使用。開発モデルが異なり実装は完全に独立
- Java（JavaEE 開発モデル）で Contexts.get() を使ってログインユーザーの情報（アカウント・組織・クライアント・ジョブ実行パラメータ）を取得したい
  - ⇒ `java-im-contexts-usage`
    - `AccountContext`（ユーザーコード・テナントID・ロケール・タイムゾーン・ロールID・認証状態）、`UserContext`（ユーザープロファイル・所属部門・会社・役職・パブリックグループ・ユーザー分類）、`ClientContext`（クライアント種別）、`ExternalUserContext`（外部ユーザー判定）、`JobSchedulerContext`（ジョブ実行パラメータ）の取得パターンと、`ContextStatus` による認証・管理者判定を提供
    - JSSP での同等実装は SSJS 版 Context オブジェクト（`d.ts/platform/object/`、`d.ts/platform/job-scheduler/`）を使用
- Java（JavaEE 開発モデル）で ConfigurationLoader を使った独自の XML 設定ファイル（JAXB 設定クラス・XSD スキーマ・XML 実体）の新規作成・読込・保存処理を作りたい
  - ⇒ `java-im-configuration-generator`
    - `ConfigurationLoader.load`/`loadAll`/`save`/`clearCache` の使い分け、`Instance`（`SINGLETON`/`PROTOTYPE`）によるキャッシュ制御、設定ファイルの配置場所（SystemStorage の `conf/`・`WEB-INF/conf`・クラスパス）とクラス名からファイル名への変換規則を提供
    - `check-jaxb-format-plugin` が要求する `ObjectFactory`（`factoryClass`/`factoryMethod`、`static` 必須）の実装パターンを含む
    - JSSP（スクリプト開発モデル）向けの同等 API は提供されていない

### Java（JavaEE 開発モデル）で設計規約に沿って実装したい

- Java 実装のレイヤー構造・依存関係・命名・例外階層・ファクトリパターンを確認したい
  - ⇒ `java-im-architecture`
    - Clean Architecture/DDD に基づくレイヤー構造（プレゼンテーション/アプリケーション/ドメイン/インフラ）の責務・依存関係ルールを提供
    - 頻出アンチパターン集、DDLからEndpointまでの全レイヤー縦断実装例を含む
    - 規約の要点は `.github/instructions/java-architecture.instructions.md` に常時参照可能な形でまとめている。本スキルはその詳細版（完全なコードテンプレート）
- サービス層（ビジネスロジック・トランザクション制御）の実装パターンを知りたい
  - ⇒ `java-im-service-layer`
    - サービスインターフェース・ファクトリパターン・`SessionTemplate` によるトランザクション境界・例外変換ルールを提供
    - 単一リポジトリ／複数リポジトリを1トランザクションで扱うテンプレートを含む
    - 規約の要点は `.github/instructions/java-service-layer.instructions.md` に常時参照可能な形でまとめている

> Java の一般規約（命名・コーディングスタイル・JavaDoc・ログ・Entity）は `.github/instructions/README.md` の一覧から該当ファイルを参照すること。上記2スキルは、規約に付随する完全なコードテンプレート・アンチパターン集を必要とする場合にのみ呼び出せば良い。

### セットアップ資材を作りたい

- テナント環境セットアップ資材を作成したい・本番適用の準備をしたい
  - ⇒ `jssp-tenant-setup-generator`
    - 成果物をもとに、必要なロール・認可・メニュー・ジョブ、および、セットアップ設定ファイルを用意
    - メニューは「サイトマップ（PC用）」のみ
- サンプルデータセットアップ資材を作成したい
  - ⇒ `jssp-sample-setup-generator`
    - モジュールを試用するためのサンプルデータ（DDL/DML）や、試用に必要なロール・認可・メニュー・ジョブ、および、セットアップ設定ファイルを用意
    - メニューは「サイトマップ（PC用）」のみ

## 制限事項

- imui テーマ、V72 互換の画面生成は不可。imds のみ対応。
- ルーティングテーブル: 認可リソースの逆引き指示は不可。
- 認可: `welcome-all` は原則使用しない。認可リソースはテナント環境セットアップ資材としてインポートし、ジョブ経由でのインポート資材は生成しない。
- ジョブ: ジョブ定義はテナント環境セットアップ資材としてインポートし、ジョブ経由でのインポート資材は生成しない。
- 生成物の正確性チェックのため、Node.js のスクリプトを実行する。一時的に `/tmp` を使用。
- IM-Workflow: マスタ定義の JSSP-API は対象外。案件取得/操作系のみサポート。
- IM-Workflow: 一覧表示パターン・フローグループ・メディア・メッセージは生成しない。
- IM-LogicDesigner: JSSP 業務画面からの IM-LogicDesigner 呼び出しは、ルーティング経由限定（呼び出し側の実装は `jssp-im-logic-usage` が担当）。
- IM-LogicDesigner: ルーティングはデフォルトでは生成されない。必要であれば、具体的な指示が必要。
- IM-LogicDesigner: MCP でもサポートされていないユーザ定義は、JavaScript ユーザ定義で代用する。
- IM-LogicDesigner: トリガ・ロジックフローのプレビュー画像生成は生成しない。
- IM-BloomMaker / ViewCreator / Accel Studio: これらのローコード資材は生成しない。
