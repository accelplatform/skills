---
name: java-im-mcp-generator
description: intra-mart Accel Platform 上で動作する MCP（Model Context Protocol）サーバを Java（JavaEE 開発モデル）で新規実装する。`im_copilot_mcp` モジュールが提供する `jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`/`Tool` アノテーションによる Streamable HTTP MCP サーバの実装、`SchemaProperties` によるツールパラメータ定義、ビルド時に自動生成される `META-INF/im_services/annotation_classes` によるプラットフォームへの登録を提供する。Java で MCP サーバを作りたい、intra-mart で MCP サーバを実装したい、`@MCPServer`/`@Tool` を使いたい、JavaEE 開発モデルで AI エージェント向けツールを公開したい、と言及されたときに使用。
---

# intra-mart MCP サーバ実装支援スキル（Java 版）

## 目的

intra-mart Accel Platform の `im_copilot_mcp` モジュールが提供するアノテーション（`@MCPServer`/`@Tool`）を使い、Java クラスへのアノテーション付与のみで MCP（Model Context Protocol）サーバ（Streamable HTTP トランスポート）を実装するためのスキルセット。

**このスキルが扱うのは Java ソースファイル（`.java`）のみ。** プラットフォームへの登録に使う索引ファイル（`META-INF/im_services/annotation_classes/*`）はビルド時に自動生成される。

## MCP サーバの基本概念（最重要）

`@MCPServer` を付与した Java クラスは、そのクラス自体が1つの MCP サーバとして機能する。クラス内の `public` メソッドに `@Tool` を付与すると、そのメソッドが MCP ツールとして公開される。

```
@MCPServer クラス（1クラス = 1 MCP サーバ = 1 URL）
├── @Tool メソッド1（1メソッド = 1 MCP ツール）
├── @Tool メソッド2
└── ...
```

- URL は `<CONTEXT_PATH>/copilot/mcp<path>`（`path` は `@MCPServer.path()` の値）にマッピングされる
- ツールへの入力パラメータは、`SchemaProperties`（`StringProperty`/`IntegerProperty`/`BooleanProperty`/`NumberProperty`/`EnumProperty`/`ObjectProperty`/`ArrayProperty`）をフィールドに付与した DTO クラス1個で表す
- **`@MCPServer` クラスは、ビルド時に自動生成される索引（`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`）でプラットフォームに登録される。** 索引がビルド成果物に含まれていないと認識されない（詳細は「MCP サーバの登録」参照）

詳細な属性シグネチャ・登録方式は `reference/mcp-annotation-api-reference.md` を必ず参照すること（記憶や推測で書かない）。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.agents/requirements` 配下には MCP サーバ実装に関する専用規約は存在しない。クラス命名は `assets/mcp-server-basic-usage.md` の「クラス構成」に記載したプラットフォーム実装の命名慣習（`Xxx` + `McpServer`、`Xxx` + `McpTool` + `{ToolName}`）に従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API概要

`@MCPServer`/`@Tool` は `jp.co.intra_mart.foundation.copilot.mcp.annotation` パッケージ（`im_copilot_mcp` モジュール）に属する。パラメータ定義用の `SchemaProperties`/`SchemaArrayItemProperties` は `jp.co.intra_mart.foundation.copilot.tool.annotation` パッケージに属する。詳細な属性シグネチャは `reference/mcp-annotation-api-reference.md` を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| MCP サーバのエントリポイントクラス（`@MCPServer`） | `assets/mcp-server-basic-usage.md` パターン1 | 最小構成の実装例 |
| ツールパラメータ DTO（`SchemaProperties` 各種） | `assets/mcp-server-basic-usage.md` パターン2 | String/Integer/Boolean/Array 各プロパティ型の使用例 |
| プラットフォームコンテキストを使うツール実装 | `assets/mcp-server-basic-usage.md` パターン3 | `Contexts`/`MessageManager` 連携 |
| プラットフォームへの登録（`META-INF/im_services/annotation_classes`） | `assets/mcp-server-basic-usage.md` パターン4 | 自動生成された索引の確認、生成されない場合の手動作成 |

### リファレンス

- `reference/mcp-annotation-api-reference.md` — `@MCPServer`/`@Tool`/`SchemaProperties`/`SchemaArrayItemProperties` の全属性・シグネチャ、依存関係宣言、URL マッピング、登録方式（`im_copilot_mcp` モジュールの実クラス定義・バイトコードに基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java で MCP サーバを作りたい」
- 「intra-mart 上で動く MCP サーバを実装したい」
- 「`@MCPServer`/`@Tool` を使いたい」
- 「JavaEE 開発モデルで AI エージェント向けのツールを公開したい」

「MCP サーバで」「Java のアノテーションで」等の明示がなく、単に「REST API を作りたい」とだけ言われた場合は、MCP クライアント（AI エージェント）向けのツール公開なのか、通常の REST API なのかをユーザに確認する。通常の REST API（Web API Maker）は `java-im-web-api-maker-usage` を使う。

## 実装手順

1. ユーザの要件をヒアリング（MCP サーバの `path`（URL の一部になる）、公開するツールの一覧・各ツールの入力パラメータ・処理内容）
2. パッケージ・クラス名を設計（`.agents/requirements/java-naming/AGENTS.md` に準拠。エントリポイントクラスは `Xxx` + `McpServer`、ツール実装クラスは `Xxx` + `McpTool` + `{ToolName}` + 必要なら `Parameter`）
3. `pom.xml` に `im_copilot_mcp` への依存を追加する（バージョンを明示指定。`reference/mcp-annotation-api-reference.md` の「依存関係」参照）。プロジェクトに既存の依存があれば流用し、重複追加しない
4. `assets/mcp-server-basic-usage.md` を参照して `@MCPServer` クラス・ツール実装クラス・パラメータ DTO を実装する（属性のシグネチャは `reference/mcp-annotation-api-reference.md` を必ず参照し、記憶や推測で書かない）
5. **MCP サーバの登録を確認する（省略厳禁）。** ビルド後、`target/classes`（または jar）に `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer` があり、`@MCPServer` クラスの完全修飾名が載っていることを確かめる。無ければ `assets/mcp-server-basic-usage.md` パターン4に従い手で作成する
6. `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md` に準拠しているか確認する

## 注意事項

- **登録は `META-INF/im_services/annotation_classes` の索引で行われる。** 非公開 API の `jp.co.intra_mart.system.copilot.mcp.annotation.McpScanPackageFactory` は使わない。生成後の確認で索引の有無を必ずチェックする
- **同一 `path` を持つ `@MCPServer` クラスを複数作らない。** プロジェクト内で `path` が重複しないよう設計する
- **`@Tool` メソッドの引数は1個（パラメータ DTO）のみ。** 複数の入力値は DTO のフィールドにまとめる
- **DTO のフィールドに `SchemaProperties` のアノテーションを付与し忘れると、そのフィールドは MCP ツールの入力スキーマに公開されない。** getter/setter があるだけでは不十分
- `@Tool` メソッドの戻り値は `String`。JSON を返したい場合は Jackson 等で明示的にシリアライズする（Web API Maker のような自動レスポンスラッピングは存在しない）
- `im_copilot_mcp` の Maven 依存はバージョンを明示指定すること（親 POM の依存関係管理に含まれていない場合がある）

## 生成後の確認

自動検証スクリプトではなく、以下の項目を手動で確認する。

1. ビルド成果物に `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer` があり、`@MCPServer` クラスの完全修飾名が記載されているか
2. `path` がプロジェクト内の他の `@MCPServer` クラスと重複していないか
3. パラメータ DTO の全フィールドに、用途に対応する `SchemaProperties` アノテーション（`StringProperty`/`IntegerProperty`/`BooleanProperty`/`NumberProperty`/`EnumProperty`/`ObjectProperty`/`ArrayProperty`）が付与されているか
4. `required = true` にすべき必須パラメータに `required` が付いているか
5. `@Tool` の `description` が、LLM がツールの用途・使い所を判断できるだけの具体性を持っているか
6. `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md` に準拠しているか
7. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）での MCP サーバ実装（`@MCPServer`/`@Tool`）** | **本スキル** |
| Java（JavaEE 開発モデル）での通常の REST API（Web API Maker） | `java-im-web-api-maker-usage` |
| Java（JavaEE 開発モデル）での IM-LogicDesigner 拡張タスク実装（`ElementScanPackageFactory` と同種の登録パターン） | `java-im-logic-generator` |
