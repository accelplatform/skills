# ロジックの構成と説明

生成されるロジック定義は以下の構成を持つこと
**本稿は画面定義（guide-screen.md）に記載された画面と一対で作成すること。IM-LogicDesigner / IM-Workflow向けの規定ではない。**

1. ロジック一覧
  - タスクの実装に必要な処理内容を定義。ファンクションコンテナにて作成する前提
  - 一覧の項目は「ロジックID」「ロジック名」「対応する画面」「機能概要」 を記載。

2. ロジック詳細（ロジック別に作成）
  - ロジック別に以下の内容を記載する
    - 処理概要
    - 入出力値
    - 入力チェック
    - SQL文（必要があれば）
    - エラーハンドリング
    - 外部システムとの連携（必要があれば）

## 開始イベント・複数ユーザタスクで業務データを共有する場合の構成

業務データが `プロセスインスタンスID + タスクID` の複合主キーで「1タスク完了=1行」管理されている場合（[guide-business-data.md](.agents/skills/bpm-docs-generator/reference/guide-business-data.md) 参照）、後続タスクが前工程の入力データを表示・引き継ぐ処理は、以下のように**取得ロジック**と**登録ロジック**を分けて記載すること。

- 開始イベント自身が業務データの入出力に関わる場合（[guide-business-data.md](.agents/skills/bpm-docs-generator/reference/guide-business-data.md) 「開始イベントが業務データの入出力に関わる場合」参照）、開始処理（プロセスインスタンス開始ロジック）に登録処理を追加し、固定疑似タスクID（例: `'START'`）で新規レコードを登録する。後続タスクの取得ロジックは、この固定疑似タスクIDを検索条件として画面表示時に取得する。

1. 取得ロジック（画面表示時・SELECT）
  - `プロセスインスタンスID` と、前工程のタスクIDを保持するプロセス変数（[guide-specification.md](.agents/skills/bpm-docs-generator/reference/guide-specification.md) 参照）を検索条件として、前工程完了時のレコードを1件取得する。
  - 入力: `processInstanceId`、前工程タスクID用プロセス変数
  - 出力: 前工程で登録された業務データ項目一式
2. 登録ロジック（ボタン押下時・INSERT）
  - 取得ロジックで取得した業務データ項目と、今回の画面入力値をあわせて**新規レコードとして登録する**（前工程のレコードへの UPDATE は行わない）。
  - 新規レコードの `タスクID` には、当該ユーザタスク自身のタスクIDを設定する。
  - 入力: 取得ロジックの出力項目（画面から引き継いで送信）＋ 今回の画面入力値
  - 出力: 処理結果

> レコード件数を抑えたい等の理由で「1申請=1行」（Update方式）を採用する場合は、取得・登録ロジックを分けず、従来どおり単一ロジックで「取得→画面表示→入力値を反映してUPDATE」を記載してよい。

## 参考スキル
- `.agents/skills/jssp-page-generator/SKILL.md`: JSSP コード生成支援
- `.agents/skills/jssp-im-master-usage/SKILL.md`: ユーザ／組織検索ダイアログ
- `.agents/skills/jssp-security-check/SKILL.md`: SQL インジェクション・XSS 対策の検証

## 参考ルール
- `.agents/requirements/jssp-2way-sql/AGENTS.md`: SQL 外部化（`/*$*/` のホワイトリスト検証含む）

**注意事項**
* **冗長なSQLを作らない。**
  * **IF文にて使い分けができるSQLは統合する。**