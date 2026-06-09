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

## 参照

### 主要な規約ファイル

コーディングに関する規約は `instructions/` 配下に配置している。ファイル一覧と内容は `instructions/README.md` を参照すること。

### 主要なスキルセット

各種スキルセットは `skills/` 配下に配置している。スキル一覧と内容は `skills/README.md` を参照すること。

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

## Recent Context

<!-- BEGIN AUTO-CONTEXT: managed by copilot-mem. Edit outside this block. -->

*No recent activity*

<!-- END AUTO-CONTEXT -->
