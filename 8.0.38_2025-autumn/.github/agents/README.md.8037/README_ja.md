# エージェント定義

本ディレクトリにはコーディングエージェントが使用するサブエージェント定義ファイルを配置している。
VSCode のチャット欄からエージェントを呼び出す際、タスクに応じて適切なサブエージェントが自動的に選択される。

## 概要

各エージェントは `*.agent.md` 形式のファイルで定義され、コーディングエージェントが特定のタスクを実行する際にサブエージェントとして使用される。
大規模実装では、依存関係に従った実行順序で複数のエージェントが連携して動作する。

## エージェントの参照方針

各エージェントファイルには冒頭の frontmatter に **`description`** が明記されている。コーディングエージェントはこの記述をもとに、タスクに適したサブエージェントを自動的に選択する。

エージェントを明示的に指定する場合は、エージェント名（`name` フィールドの値）をプロンプトで言及すること。

## エージェント一覧

| ファイル | 役割 | 使用スキル |
|---------|------|-----------|
| `jssp-page-generator.agent.md` | JSSP 画面（.js/.html）・ルーティング設定（.xml）・DDL/SQL の新規生成 | `jssp-page-generator` |
| `jssp-im-job-generator.agent.md` | ジョブスケジューラで実行するバッチ処理プログラム（.js）の新規生成 | `jssp-im-job-generator` |
| `jssp-im-workflow-usage.agent.md` | IM-Workflow 連携プログラム（申請・承認・確認画面、アクション処理）の新規生成 | `jssp-im-workflow-usage` |
| `jssp-tenant-setup-generator.agent.md` | テナント環境セットアップ（Importer）資材の新規生成 | `jssp-tenant-setup-generator` |
| `jssp-page-verifier.agent.md` | 生成された JSSP ファイルのバリデーション実行と修正 | `jssp-page-verifier` |
| `jssp-code-review.agent.md` | JSSP コードの品質レビュー（規約・命名規則・エラーハンドリング等） | `jssp-code-review` |
| `jssp-security-check.agent.md` | JSSP コードのセキュリティ脆弱性検出（SQL インジェクション・XSS 等） | `jssp-security-check` |

## エージェントの実行順序

各エージェントは依存関係があるため、以下の順序で実行する。

```
① jssp-page-generator（DDL/SQL）← 必ず最初
         ↓ 完了後
② 以下を並列実行可
   ├─ jssp-page-generator（画面・API）
   ├─ jssp-im-job-generator（バッチ）
   └─ jssp-im-workflow-usage（ワークフロー）
         ↓ 完了後
③ jssp-tenant-setup-generator（ルーティング・テナント設定）
         ↓ 完了後
④ jssp-page-verifier → jssp-code-review → jssp-security-check（検証・必須）
```

## ローカライズ

各エージェントファイルにはローカライズ版（`*_ja.md`, `*_en.md`, `*_zh_CN.md`）が `*.agent.md.<version>/` 配下にある。
プロジェクトのロケール設定に応じて自動で切り替わる。
