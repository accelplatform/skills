# JSSP/Java/ローコード資材のスキルセット

## 概要

このレポジトリは、intra-mart Accel Platform における、以下の資材を作成するためのスキルセットを収録している。
* JSSP（スクリプト開発モデル）による画面、各種プラグインのソースコード
* Java（JavaEE 開発モデル）による各種プラグイン（画面を除く）のソースコード
* IM-LogicDesigner / IM-Workflow の資材

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

### 多言語化したい

- JSSP 業務画面において、ハードコードされた文字列を多言語対応したい
  - ⇒ `jssp-localize-support`（+ `jssp-page-generator`）
    - メッセージプロパティファイル（properties）の作成
    - `<imart type="message">` タグ・MessageManager API への書き換え
    - 日本語（ja）・英語（en）・中国語簡体字（zh_CN）に対応

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
- Java（JavaEE 開発モデル）で im_mirage を使った DB アクセス処理を作りたい
  - ⇒ `java-im-mirage-usage`
    - エンティティクラス（`@Table`/`@Column`/`@PrimaryKey`）、DAOクラス（`AbstractDAO` 継承・`DAOFactory` 取得）、2WaySQL の SQLファイル、`SessionTemplate` によるトランザクション管理の実装パターンを提供
    - JSSP での DB アクセスは `jssp-page-generator`（`TenantDatabase`/`SharedDatabase` API）を使用。開発モデルが異なり実装は完全に独立

### Java（JavaEE 開発モデル）で設計規約に沿って実装したい

- Java 実装のレイヤー構造・依存関係・命名・例外階層・ファクトリパターンを確認したい
  - ⇒ `java-im-architecture`
    - Clean Architecture/DDD に基づくレイヤー構造（プレゼンテーション/アプリケーション/ドメイン/インフラ）の責務・依存関係ルールを提供
    - 頻出アンチパターン集、DDLからEndpointまでの全レイヤー縦断実装例を含む
    - 規約の要点は `.claude/rules/java-architecture.md` に常時参照可能な形でまとめている。本スキルはその詳細版（完全なコードテンプレート）
- サービス層（ビジネスロジック・トランザクション制御）の実装パターンを知りたい
  - ⇒ `java-im-service-layer`
    - サービスインターフェース・ファクトリパターン・`SessionTemplate` によるトランザクション境界・例外変換ルールを提供
    - 単一リポジトリ／複数リポジトリを1トランザクションで扱うテンプレートを含む
    - 規約の要点は `.claude/rules/java-service-layer.md` に常時参照可能な形でまとめている

> Java の一般規約（命名・コーディングスタイル・JavaDoc・ログ・Entity）は `.claude/rules/README.md` の一覧から該当ファイルを参照すること。上記2スキルは、規約に付随する完全なコードテンプレート・アンチパターン集を必要とする場合にのみ呼び出せば良い。

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
