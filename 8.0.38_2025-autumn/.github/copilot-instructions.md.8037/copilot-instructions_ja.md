# intra-mart Accel Platform スクリプト開発プロジェクト

## 概要

本プロジェクトは intra-mart Accel Platform のスクリプト開発モデル（JSSP）を使用した開発プロジェクトである。

## 技術スタック

| 項目 | 技術 |
|------|------|
| サーバサイド | Rhino JavaScript (ES5 互換) |
| テンプレート | IMART タグ |
| データベース | TenantDatabase / SharedDatabase API |
| ファイル操作 | SystemSorage / PublicStorage / SessionScopeStorage API |
| ワークフロー | IM-Workflow / ApplyManager |
| ローコード   | IM-LogicDesigner |

## 必須ルール（省略禁止）

JSSP ファイル（`.js` / `.html`）を**新規生成・編集した場合**は、完了を報告する前に以下を**必ず実行**すること。
コンテキスト圧縮・セッション再開・作業量の多寡に関わらず、省略・先送りは禁止。

1. `jssp-page-verifier` スキルをサブエージェントで実行し、エラーが 0 件になるまで修正する
2. `jssp-code-review` スキルが利用可能であれば実行する
3. `jssp-security-check` スキルが利用可能であれば実行する

> スキルが存在しない場合のみスキップしてよい。「時間がかかる」「ファイル数が多い」等の理由でスキップしてはならない。

## サブエージェント分割方針

複数ファイルを生成する大規模実装では、メイン会話のコンテキスト肥大化を防ぐため、以下の方針でサブエージェントに委譲すること。

### 実行順序（依存関係があるため順序厳守）

```
① DDL / SQL エージェント        ← 必ず最初（画面・API・バッチの基盤となるため）
         ↓ 完了後
② 以下を並列実行可
   ├─ 画面エージェント           （view/*.js + view/*.html）
   ├─ API エージェント           （api/*.js）
   ├─ バッチエージェント         （job/*.js）
   └─ ワークフローエージェント   （workflow/ 配下、IM-Workflow を使う場合のみ）
         ↓ 完了後
③ ルーティング・テナント設定エージェント
   （routing-jssp-config/*.xml、ロール・認可・メニュー・ジョブ設定）
         ↓ 完了後
④ 検証エージェント              ← 必須・省略禁止
   （jssp-page-verifier → jssp-code-review → jssp-security-check）
```

### サブエージェントごとの担当スキル

| サブエージェント | 担当範囲 | 使用スキル |
|----------------|---------|-----------|
| DDL/SQL | DDL 3方言・SQL テンプレート・サンプル DML | `jssp-page-generator`（ステップ 6） |
| 画面 | `view/*.js` + `view/*.html` | `jssp-page-generator`（ステップ 1〜5） |
| API | `api/*.js` | `jssp-page-generator`（API 版） |
| バッチ | `job/*.js` | `jssp-im-job-generator` |
| ワークフロー | `workflow/` 配下 | `jssp-im-workflow-usage` |
| ルーティング・テナント設定 | `routing-jssp-config/*.xml`・テナント資材 | `jssp-tenant-setup-generator` |
| 検証 | 全成果物の検証・修正 | `jssp-page-verifier` / `jssp-code-review` / `jssp-security-check` |

### 注意事項

- 画面・API エージェントは、DDL/SQL エージェントが生成したテーブル名・カラム名・SQL テンプレートパスを参照して実装すること
- 各サブエージェントへの指示には、依存する成果物（DDL パス・SQL テンプレートパス等）を明示的に渡すこと
- 1 エージェントあたりの生成ファイル数が多い場合は、さらに機能単位（例: マスタ系・申請系）に分割してよい

## 参照

### 主要な規約ファイル

コーディングに関する規約は `.github/instructions/` 配下に配置している。ファイル一覧と内容は `.github/instructions/README.md` を参照すること。

### 主要なスキルセット

各種スキルセットは `.github/skills/` 配下に配置している。スキル一覧と内容は `.github/skills/README.md` を参照すること。

### API 型定義（d.ts）

ファンクションコンテナの実装時は、`d.ts/` 配下の TypeScript 型定義ファイルを参照すること。
SSJS で利用可能なグローバルクラス・関数・オブジェクトの API 仕様（引数・戻り値・型）が定義されている。

| ディレクトリ | 内容 |
|-------------|------|
| `d.ts/platform/` | プラットフォーム標準 API（Database, Storage, HTTP, Mail 等） |
| `d.ts/tenant/` | テナント管理 API（Account, Menu, Calendar, Password 等） |

**注意:**
- 記憶や推測で API を使用せず、必ず対応する d.ts ファイルの型情報を確認してから実装すること。
- d.ts ファイルはファンクションコンテナの実装でのみ使用し、プレゼンテーションページの実装では使用しないこと。
