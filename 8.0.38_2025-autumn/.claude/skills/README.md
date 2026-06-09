
# JSSP/ローコード資材のスキルセット

## 概要

intra-mart Accel Platform の JSSP（スクリプト開発モデル）によるソースコード、および、ローコード資材を作成するためのスキルセットを収録したレポジトリ。

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

### IM-Workflow の資材を作りたい

- ワークフローのマスタ定義ファイルを作りたい
  - ⇒ `jssp-im-workflow-generator`
    - コンテンツ・ルート・フロー・案件プロパティ・分岐ルールを含むインポート用 XML を生成
    - 直線・分岐・同期・横配置・縦配置のルートパターンに対応
    - サンプルでインストールされるユーザ・会社・組織・役職・パブリックグループに対応 ※拡張は MCP を使用（予定）
    - 日本語（ja）・英語（en）・中国語簡体字（zh_CN）に対応
- ワークフローと連携する各種画面・処理を作りたい
  - ⇒ `jssp-im-workflow-usage`（+ `jssp-page-generator`）
    - 申請/承認/詳細/確認/参照画面（html + js）の生成
    - アクション処理・到達処理・案件開始/終了処理・分岐条件判定・各種リスナー（js）の生成

### IM-LogicDesigner の資材を作りたい

- ロジックフロー（ローコード）の定義ファイルを作りたい
  - ⇒ `jssp-im-logic-generator`
    - ロジックフロー（flow_definition.json）・ルーティング（flow_route.json）を含むインポート用 ZIP を生成
    - テナント管理機能が持つ標準タスク（認可・リポジトリ操作・メール送信等 125 種）に対応 ※拡張は MCP を使用（予定）
    - 標準マッピング関数（数値演算・文字列操作・配列操作・JSON・BASE64 等 52 種）に対応 ※拡張は MCP を使用（予定）
    - ユーザ定義タスク（JavaScript・REST・SQL・Database Fetch・テンプレート）に対応 ※拡張は MCP を使用（予定）

### 多言語化したい

- JSSP 業務画面において、ハードコードされた文字列を多言語対応したい
  - ⇒ `jssp-localize-support`（+ `jssp-page-generator`）
    - メッセージプロパティファイル（properties）の作成
    - `<imart type="message">` タグ・MessageManager API への書き換え
    - 日本語（ja）・英語（en）・中国語簡体字（zh_CN）に対応

### テスト・品質チェックをしたい

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

### 本番適用の準備をしたい

- テナント環境セットアップ資材を作成したい
  - ⇒ `jssp-tenant-setup-generator`
    - 成果物をもとに、必要なロール・認可・メニュー・ジョブ、および、セットアップ設定ファイルを用意
    - メニューは「サイトマップ（PC用）」のみ

## 制限事項

- imui テーマ、V72 互換の画面生成は不可。imds のみ対応。
- ルーティングテーブル: 認可リソースの逆引き指示は不可。`welcome-all` から適宜変更すること。
- ジョブ: ジョブ定義のインポートデータ生成は不可。
- 生成物の正確性チェックのため、Node.js のスクリプトを実行する。一時的に `/tmp` を使用。
- IM-Workflow: マスタ定義の JSSP-API は対象外。案件取得/操作系のみサポート。
- IM-Workflow: 申請・処理対象者として、IM-LogicDesigner プラグインの使用は対象外。
- IM-Workflow: 一覧表示パターン・フローグループ・メディア・メッセージは対象外。
- IM-LogicDesigner: JSSP 業務画面からの IM-LogicDesigner 呼び出しは、ルーティング経由限定。
- IM-LogicDesigner: ルーティングはデフォルトでは生成されない。必要であれば、具体的な指示が必要。
- IM-LogicDesigner: MCP でもサポートされていないユーザ定義は、JavaScript ユーザ定義で代用する。
- IM-LogicDesigner: トリガ・ロジックフローのプレビュー画像生成は対象外。
- IM-BloomMaker / ViewCreator / Accel Studio: 資材生成は対象外。
