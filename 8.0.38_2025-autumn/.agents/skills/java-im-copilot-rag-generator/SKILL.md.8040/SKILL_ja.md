---
name: java-im-copilot-rag-generator
description: intra-mart IM-Copilot が提供するベクトルストア API（`jp.co.intra_mart.foundation.copilot.vectorstore.*`）とチャット/埋め込みアクション API（`jp.co.intra_mart.foundation.copilot.action.*`）を Java（JavaEE 開発モデル）で使用し、RAG（検索拡張生成）を実装するためのスキルセット。文書のチャンク分割・ベクトル化・ベクトルストアへの登録（データ準備ジョブ）、ハイブリッド検索・類似検索・キーワード検索、検索結果を踏まえた回答生成（Assistant）の実装パターンを提供する。Java で RAG を実装したい、ベクトルストアにドキュメントを登録したい、`VectorStore`/`VectorStoreBuilder` を使いたい、ハイブリッド検索を実装したい、と言及されたときに使用。Tool Calling は `java-im-copilot-toolcalling-generator`、Agent フレームワーク経由の高レベルな RAG（`Knowledge`/`RegisteredKnowledge`）は `java-im-copilot-agent-generator` を使うこと。
---

# intra-mart IM-Copilot RAG（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform の IM-Copilot が提供する **ベクトルストア API**（`VectorStore`/`VectorStoreBuilder`）と **チャット/埋め込みアクション API**（`ChatAction`/`EmbeddingsAction`）を使い、Java コードで RAG（検索拡張生成）を実装するためのスキルセット。

## クラス構成（最重要）

| 対象 | 型 | パッケージ |
|---|---|---|
| ベクトルストアの構築 | `VectorStoreBuilder` | `jp.co.intra_mart.foundation.copilot.vectorstore.builder` |
| ベクトルストア本体 | `VectorStore`（登録・削除・各種検索） | `jp.co.intra_mart.foundation.copilot.vectorstore` |
| 文書情報 | `Document`（実装: `StandardRegistrationDocument`）/`ScoredDocument` | `jp.co.intra_mart.foundation.copilot.vectorstore.document` / `jp.co.intra_mart.system.copilot.vectorstore.document` |
| エンベディング生成 | `Embedder`（既定実装なし。`EmbeddingsAction` をラップして自前実装） | `jp.co.intra_mart.foundation.copilot.vectorstore.embedder` |
| 検索ランク融合 | `Reranker`（実装: `StandardRrfReranker`） | `jp.co.intra_mart.foundation.copilot.vectorstore.reranker` / `jp.co.intra_mart.system.copilot.vectorstore.reranker` |
| テキスト分割 | `TextSplitter`（実装: `RecursiveCharacterTextSplitter`） | `jp.co.intra_mart.foundation.copilot.assistant.splitter` |
| チャット呼び出し | `ActionFactory`/`ChatAction`/`ChatMessage`/`ChatOption` | `jp.co.intra_mart.foundation.copilot.action` / `.action.chat` |
| 埋め込み呼び出し | `EmbeddingsAction`/`EmbeddingsOption` | `jp.co.intra_mart.foundation.copilot.action.embeddings` |
| チャットUI連携 | `AbstractCopilotAssistant<T>` + `@Assistant` | `jp.co.intra_mart.foundation.copilot.assistant` |

**`VectorStore`/`ActionFactory` は `Agent`/`AgentBuilder`（`java-im-copilot-agent-generator` が扱う高レベル API）に依存しない、低レベルな Java API である。** 文書のベクトル化・検索・チャット呼び出しを自分で組み立てる場合に使う。Agent フレームワークの `Knowledge`/`RegisteredKnowledge` を使った、より抽象度の高い RAG 連携が必要な場合は `java-im-copilot-agent-generator` を使うこと（「他スキルとの境界」参照）。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API概要

RAG は「データ準備フェーズ」（文書を分割・ベクトル化してベクトルストアへ登録。ジョブスケジューラで実行）と「クエリ応答フェーズ」（ユーザの質問に対しベクトルストアを検索し、検索結果を踏まえて回答を生成。Assistant で実装）の2フェーズで構成される。`VectorStoreBuilder.builder().useDefault().category(...).embedder(...).build()` で `VectorStore` を取得し、`add`/`deleteAll`/`hybridSearch` 等で操作する。チャット・埋め込みの呼び出しは `ActionFactory.getFactory().getChatAction()`/`getEmbeddingsAction()` で取得した `ChatAction`/`EmbeddingsAction` を使う。詳細は `reference/vectorstore-api-reference.md`/`reference/chat-action-api-reference.md` を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| `Embedder` アダプタの実装 | `assets/rag-basic-usage.md` パターン1 | `EmbeddingsAction` をラップした `Embedder` 実装 |
| データ準備ジョブ（分割・ベクトル化・登録） | `assets/rag-basic-usage.md` パターン2 | `TextSplitter`、`VectorStoreBuilder`、`VectorStore.add`/`deleteAll` |
| クエリ応答 Assistant（ハイブリッド検索・ストリーミング回答） | `assets/rag-basic-usage.md` パターン3 | `VectorStore.hybridSearch`、`ChatAction` ストリーミング、`AssistantResponseWriter` |

### リファレンス

- `reference/vectorstore-api-reference.md` — `VectorStoreBuilder`/`VectorStore`/`Document`/`ScoredDocument`/`Embedder`/`Reranker`/`StandardRrfReranker`/`TextSplitter` の全メソッド・シグネチャ
- `reference/chat-action-api-reference.md` — `ActionFactory`/`ChatAction`/`ChatMessage`/`ChatOption`/`EmbeddingsAction`/`EmbeddingsOption`/`MessageTemplate`/`ChatMessageConverter` の全メソッド・シグネチャ

いずれもプラットフォーム API の実クラス定義に基づく（記憶で書かない）。

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java で RAG を実装したい」「検索拡張生成の仕組みを作りたい」
- 「ベクトルストアにドキュメントを登録したい」
- 「`VectorStore`/`VectorStoreBuilder` を使いたい」
- 「ハイブリッド検索・類似検索を実装したい」
- 「検索結果を踏まえて回答するアシスタントを作りたい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。

依頼が以下に該当する場合は、本スキルの対象外である旨を伝える:
- Tool Calling（関数呼び出し） → `java-im-copilot-toolcalling-generator`
- Agent フレームワーク（`Agent`/`AgentBuilder`）経由の `Knowledge`/`RegisteredKnowledge` を使った RAG → `java-im-copilot-agent-generator`
- MCP サーバの実装 → `java-im-mcp-generator`

## 実装手順

1. ユーザの要件をヒアリング（対象文書の種類・保存場所、検索方式（ハイブリッド/類似/キーワード）、チャットUI連携の要否）
2. 対象に応じたメソッドを `reference/vectorstore-api-reference.md`/`reference/chat-action-api-reference.md` で正確に確認する（記憶や推測で書かない）
3. `assets/rag-basic-usage.md` を参照して実装する。`Embedder` アダプタ（パターン1）→ データ準備ジョブ（パターン2）→ クエリ応答 Assistant（パターン3）の順に実装するとよい
4. IM-Copilot のチャットUIと連携させる場合、`@Assistant` を付与した `AbstractCopilotAssistant<T>` サブクラスを作成する。**パラメータクラス `T` は `AssistantParameter` 自身、またはそのサブクラスにする**（独自の POJO にするとチャットUIでプロンプトを入力できなくなる）
5. Assistant を作成した場合、**`AssistantScanPackageFactory` の実装・登録と、IM-Authz での権限付与の両方を必ず行う**（いずれか一方でも欠けるとアシスタント一覧に表示されない。詳細は `java-im-copilot-agent-generator` の `reference/assistant-integration-api-reference.md`「プラットフォームへの登録」を参照。登録の仕組み自体は Agent フレームワークの Assistant と共通）
6. データ準備ジョブは、ジョブスケジューラへの登録（`job-scheduler.xml` 等のテナント設定資材）が必要（`jssp-tenant-setup-generator` の対象）
7. `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md` に準拠しているか確認

## 注意事項

- **`Document` は自前実装しない。** プラットフォーム提供の標準実装 `jp.co.intra_mart.system.copilot.vectorstore.document.StandardRegistrationDocument` をそのまま使う
- **`TextSplitter` の分割メソッドは `splitText(String)`。** `split(String)` は存在しない
- **`VectorStoreBuilder.useDefault()` は `embedder(...)` より先に呼ぶこと。** `useDefault()` は内部で `embedder` フィールドをリセットするため、順序を誤ると `Embedder` の設定が失われる
- **`Embedder` の既定実装はプラットフォームに存在しない。** `EmbeddingsAction`（`ActionFactory.getFactory().getEmbeddingsAction()`）をラップした薄いアダプタを自前実装する必要がある
- **`AbstractCopilotAssistant<T>` の `T` は `AssistantParameter` 自身、またはそのサブクラスでなければならない。** 独自の POJO を指定すると、チャットUIが送信メッセージの入力欄を組み立てられずプロンプトを入力できなくなる
- **`@Assistant` を付与しただけではアシスタント一覧に表示されない。** `AssistantScanPackageFactory` の登録と IM-Authz の権限付与の両方が必要（`java-im-copilot-agent-generator` 参照）
- ファイルからのテキスト抽出（PDF・Word 等のパース）自体は、本スキルが扱うベクトルストア・チャットアクション API の範囲外。対象ファイル形式に応じてアプリ側で実装する
- ベクトルストアの実バックエンド（Solr・RDB等）はテナント環境設定に依存する。8.0.5 で追加された `list`/`count`/`scanAll` 等の一部メソッドはバックエンドによっては `UnsupportedOperationException` になりうる

## 生成後の確認

自動検証スクリプトではなく、以下の項目を手動で確認する。

1. `Document` を自前実装していないか（`StandardRegistrationDocument` を使っているか）
2. `TextSplitter` の呼び出しメソッド名が `splitText` になっているか
3. `VectorStoreBuilder` の呼び出し順序が `useDefault()` → `category(...)` → `embedder(...)` → `useScoreNormalize(...)` → `build()` になっているか
4. `Embedder` アダプタが `EmbeddingsAction` の例外（`CopilotServiceConfigurationException`/`CopilotServiceActionException`）を `EmbedderException` へ変換しているか
5. Assistant を作成した場合、パラメータクラス `T` が `AssistantParameter` 自身またはそのサブクラスになっているか
6. Assistant を作成した場合、`AssistantScanPackageFactory` を実装・登録したか、IM-Authz でリソース `im-copilot-assistant://assistant/<アシスタントID>` への許可ポリシーを付与したか
7. `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md` に準拠しているか
8. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）での RAG 実装（`VectorStore`/`ActionFactory` を直接使用）** | **本スキル** |
| Tool Calling（関数呼び出し。`ChatAction`+`ToolConfig`） | `java-im-copilot-toolcalling-generator` |
| Agent フレームワーク（`Agent`/`AgentBuilder`）、`Knowledge`/`RegisteredKnowledge` を使った高レベルな RAG 連携 | `java-im-copilot-agent-generator` |
| MCP サーバの実装（`@MCPServer`/`@Tool`） | `java-im-mcp-generator` |
