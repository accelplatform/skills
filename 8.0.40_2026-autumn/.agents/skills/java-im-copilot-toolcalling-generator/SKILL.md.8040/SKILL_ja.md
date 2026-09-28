---
name: java-im-copilot-toolcalling-generator
description: intra-mart IM-Copilot が提供する、プロバイダ非依存の Tool Calling API（`jp.co.intra_mart.foundation.copilot.action.chat.ChatAction`+`ToolConfig`/`ToolDefinition`/`ToolChoice`/`ToolCall`）を Java（JavaEE 開発モデル）で使用し、AIアシスタントに関数呼び出し（Function Calling / Tool Use）を実装するためのスキルセット。OpenAI・Azure OpenAI Service・Amazon Bedrock のいずれのテナントドライバでも同一コードで動作する、非ストリーミング・ストリーミング両方の実装パターンを提供する。Java で Tool Calling / Function Calling を実装したい、AIアシスタントに外部関数を呼ばせたい、`ChatAction`+`ToolConfig` を使いたい、と言及されたときに使用。Agent フレームワーク経由の高レベルな Tool Calling（`UserDefinedTool`）は `java-im-copilot-agent-generator`、RAG（検索拡張生成）は `java-im-copilot-rag-generator` を使うこと。
---

# intra-mart IM-Copilot Tool Calling（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform の IM-Copilot が提供する **プロバイダ非依存の Tool Calling API**（`ChatAction`+`ToolConfig`）を使い、Java コードで AIアシスタントに関数呼び出し（Function Calling / Tool Use）を実装するためのスキルセット。

## クラス構成（最重要）

| 対象 | 型 | パッケージ |
|---|---|---|
| チャット呼び出し（Tool Calling対応） | `ChatAction`（`ActionFactory.getFactory().getChatAction()` で取得） | `jp.co.intra_mart.foundation.copilot.action.chat` |
| ツール設定 | `ToolConfig`（`ToolDefinition` 一覧 + `ToolChoice`） | 同上 |
| ツール定義 | `ToolDefinition`（`SchemaProperties` を付与したDTOから JSON Schema を自動生成） | 同上 |
| ツール選択方式 | `ToolChoice`（`auto`/`none`/`required`/`tool(名前指定)`） | 同上 |
| ツール呼び出し情報 | `ToolCall`（`id`/`name`/`arguments`） | 同上 |
| ツール引数の検証・変換 | `JsonSchemaValidator`/`ToolJsonHelper` | `jp.co.intra_mart.foundation.copilot.tool` |
| チャットUI連携 | `AbstractCopilotAssistant<T>` + `@Assistant` | `jp.co.intra_mart.foundation.copilot.assistant` |

**`ChatAction`+`ToolConfig` は、OpenAI・Azure OpenAI Service・Amazon Bedrock のいずれのテナントドライバでも同一コードで動作する、プロバイダ非依存の API である。** ドライバ種別ごとにリクエスト/レスポンスクラスを使い分ける必要はない（`ActionFactory` がテナント設定に応じた実装を自動的に解決する）。

**`Agent`/`AgentBuilder`（`java-im-copilot-agent-generator` が扱う高レベル API）の `UserDefinedTool` は、Agent Loop（ツール呼び出し〜結果反映の繰り返し）を内蔵した、さらに抽象度の高い Tool Calling である。** 本スキルの `ChatAction`+`ToolConfig` は、その Agent Loop を自分で組み立てる、より低レベルな API である。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。ツールの入力パラメータ DTO に付与する `SchemaProperties` アノテーションは `java-im-mcp-generator`/`java-im-copilot-agent-generator` の `UserDefinedTool` と同一クラス（`jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties`）である。

## API概要

`ChatAction.execute(messages, option, toolConfig)`（非ストリーミング）/`execute(messages, option, toolConfig, handler)`（ストリーミング）に、`ToolDefinition` のリストと `ToolChoice` を持つ `ToolConfig` を渡してチャットを実行する。応答にツール呼び出し（`ToolCall`）が含まれる場合はアプリ側でツールを実行し、結果を `tool` ロールのメッセージとして追加したうえで再度 `execute(...)` を呼ぶ、という往復（最低2回の呼び出し）で完結する。詳細は `reference/toolcalling-api-reference.md`（本スキル）・`reference/chat-action-api-reference.md`（`java-im-copilot-rag-generator`）を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| 非ストリーミングの Tool Calling | `assets/toolcalling-basic-usage.md` パターン1 | `ChatAction.execute(messages, option, toolConfig)`、`ToolCall` の検証・実行、結果メッセージの構築 |
| ストリーミングの Tool Calling | `assets/toolcalling-basic-usage.md` パターン2 | `ChatAction.execute(messages, option, toolConfig, handler)`、チャンクからの `ToolCall` 蓄積・マージ |

### リファレンス

- `reference/toolcalling-api-reference.md` — `ToolConfig`/`ToolDefinition`/`ToolChoice`/`ToolCall`/`JsonSchemaValidator`/`ToolJsonHelper` の全メソッド・シグネチャ、Amazon Bedrock ドライバ利用時の制約
- `java-im-copilot-rag-generator` の `reference/chat-action-api-reference.md` — `ActionFactory`/`ChatAction`/`ChatMessage`/`ChatOption` 等、Tool Calling の土台となる Action API 全般

いずれもプラットフォーム API の実クラス定義に基づく（記憶で書かない）。

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java で Tool Calling / Function Calling を実装したい」
- 「AIアシスタントに外部関数・APIを呼ばせたい」
- 「`ChatAction`+`ToolConfig` を使いたい」
- 「OpenAI/Azure OpenAI/Amazon Bedrock で関数呼び出しを実装したい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。

依頼が以下に該当する場合は、本スキルの対象外である旨を伝える:
- RAG（検索拡張生成） → `java-im-copilot-rag-generator`
- Agent フレームワーク（`Agent`/`AgentBuilder`）経由の `UserDefinedTool`（Agent Loop 内蔵の高レベル Tool Calling） → `java-im-copilot-agent-generator`
- MCP サーバの実装 → `java-im-mcp-generator`

## 実装手順

1. ユーザの要件をヒアリング（呼び出したいツールの内容・引数、ストリーミング応答の要否、対象ドライバ（OpenAI/Azure OpenAI/Amazon Bedrock）で差が出る機能の要否）
2. 対象に応じたメソッドを `reference/toolcalling-api-reference.md`・`java-im-copilot-rag-generator` の `reference/chat-action-api-reference.md` で正確に確認する（記憶や推測で書かない）
3. ツールの引数DTOに `SchemaProperties` アノテーションを付与し、`ToolDefinition.builder().parametersFromClass(...)` でスキーマを生成する
4. `assets/toolcalling-basic-usage.md` を参照して実装する。非ストリーミング（パターン1）から着手し、必要であればストリーミング（パターン2）へ拡張するとよい
5. IM-Copilot のチャットUIと連携させる場合、`@Assistant` を付与した `AbstractCopilotAssistant<T>` サブクラスを作成する。**パラメータクラス `T` は `AssistantParameter` 自身、またはそのサブクラスにする**（独自の POJO にするとチャットUIでプロンプトを入力できなくなる）
6. Assistant を作成した場合、**`AssistantScanPackageFactory` の実装・登録と、IM-Authz での権限付与の両方を必ず行う**（いずれか一方でも欠けるとアシスタント一覧に表示されない。詳細は `java-im-copilot-agent-generator` の `reference/assistant-integration-api-reference.md`「プラットフォームへの登録」を参照）
7. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **`ChatAction`+`ToolConfig` は OpenAI・Azure OpenAI Service・Amazon Bedrock のいずれのテナントドライバでも同一コードで動作する。** ドライバ固有のリクエスト/レスポンスクラスを直接使う必要はない
- **`CopilotServiceConfigurationException`/`CopilotServiceActionException` は `CopilotServiceException` のサブクラス。** これらを `multi-catch`（`catch (A | B e)`）でまとめようとするとコンパイルエラーになる。基底の `CopilotServiceException` 1つで catch する
- **ストリーミングでは応答メッセージ（`ChatMessage`）そのものが返らない。** ツール呼び出し情報（`ToolCall`）はチャンク（`ChunkChatMessageDelta.getToolCalls()`）から自前で蓄積・マージし、2回目の呼び出し用メッセージには `assistant` のツール呼び出し情報を明示的に追加する必要がある
- **Amazon Bedrock ドライバ利用時は制約がある**（`ToolDefinition.strict` 無視、`ToolChoice.none()` 不可、`addImageUrl` 不可、システムメッセージは最新1件のみ有効）。複数ドライバでの動作を想定する実装では、これらの制約に抵触しないようにする
- **ツール呼び出しの引数は必ずしもスキーマ通りとは限らない。** `JsonSchemaValidator.isValid(...)` で検証してから `ToolJsonHelper.deserialize(...)` でデシリアライズすることを推奨する
- **`AbstractCopilotAssistant<T>` の `T` は `AssistantParameter` 自身、またはそのサブクラスでなければならない。** 独自の POJO にするとチャットUIでプロンプトを入力できなくなる
- **`@Assistant` を付与しただけではアシスタント一覧に表示されない。** `AssistantScanPackageFactory` の登録と IM-Authz の権限付与の両方が必要（`java-im-copilot-agent-generator` 参照）

## 生成後の確認

自動検証スクリプトではなく、以下の項目を手動で確認する。

1. `ToolDefinition` の引数DTOに `SchemaProperties` アノテーションが正しく付与されているか
2. ツール呼び出しの有無判定（`toolCalls == null || toolCalls.isEmpty()`）と、ツール実行結果メッセージの構築（`addToolTextContent`/`addToolImageData`）が正しく実装されているか
3. ストリーミング実装の場合、チャンクからの `ToolCall` マージ（`id` の有無での分岐）と、2回目呼び出し用メッセージへの `assistant` ツール呼び出し情報の明示的な追加が行われているか
4. 例外の `catch` で `CopilotServiceException` の継承関係によるコンパイルエラーが発生していないか
5. Assistant を作成した場合、パラメータクラス `T` が `AssistantParameter` 自身またはそのサブクラスになっているか
6. Assistant を作成した場合、`AssistantScanPackageFactory` を実装・登録したか、IM-Authz でリソース `im-copilot-assistant://assistant/<アシスタントID>` への許可ポリシーを付与したか
7. `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
8. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）での Tool Calling 実装（`ChatAction`+`ToolConfig` を直接使用）** | **本スキル** |
| RAG（検索拡張生成。`VectorStore`/`ActionFactory` を直接使用） | `java-im-copilot-rag-generator` |
| Agent フレームワーク（`Agent`/`AgentBuilder`）、`UserDefinedTool` を使った高レベルな Tool Calling（Agent Loop 内蔵） | `java-im-copilot-agent-generator` |
| MCP サーバの実装（`@MCPServer`/`@Tool`） | `java-im-mcp-generator` |
