---
name: java-im-copilot-agent-generator
description: intra-mart IM-Copilot が提供する Agent フレームワーク（`jp.co.intra_mart.foundation.copilot.agent.*`、`im_copilot_agent` モジュール）を Java（JavaEE 開発モデル）で使用し、プロンプトを受けて処理して応答を返す AI エージェントを作成するためのスキルセット。`Agent`/`AgentBuilder` によるエージェントの構築、`UserDefinedTool` によるカスタムツールの実装、`Knowledge`（ナレッジ検索）の統合、Structured Output（型付き出力）、`AgentExecutionMiddleware` による実行フローへの介入、Assistant フレームワーク（`AbstractCopilotAssistant`/`@Assistant`）との連携によるチャットUI向けエージェントの実装パターンを提供する。Java でAIエージェントを作りたい、`Agent`/`AgentBuilder` を使いたい、エージェントにツール・ナレッジ・スキルを持たせたい、IM-Copilot のチャット機能と連携するエージェントを作りたい、と言及されたときに使用。MCP サーバの実装は `java-im-mcp-generator`、Web API Maker による通常の REST API は `java-im-web-api-maker-usage` を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart IM-Copilot Agent フレームワーク（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform の IM-Copilot が提供する **Agent フレームワーク**（`Agent`/`AgentBuilder`、`im_copilot_agent` モジュール）を使い、Java コードで「プロンプトを受けて処理し、応答を返す」AI エージェントを実装するためのスキルセット。

## クラス構成（最重要）

| 対象 | 型 | パッケージ |
|---|---|---|
| エージェント本体 | `Agent<T>`（インタフェース） | `jp.co.intra_mart.foundation.copilot.agent` |
| エージェントの構築 | `AgentBuilder<T>` | 同上（`Agent.builder()` から取得） |
| 会話履歴（ステートフル実行） | `Session`/`SessionContext` | 同上 |
| メッセージ | `Message`（`static` ファクトリ: `user`/`system`/`assistant`/`tool`） | 同上 |
| 実行結果 | `AgentResponse<T>` | 同上 |
| システムプロンプト | `Instruction`（`instruction(String)` で文字列を渡す。実行時の値は Java で埋め込んでから渡す） | `jp.co.intra_mart.foundation.copilot.agent.instruction` |
| カスタムツール | `Tool<I,O>` → `BuiltinTool<I,O>` → `UserDefinedTool<I,O>` | `jp.co.intra_mart.foundation.copilot.agent.tool` |
| ナレッジ（RAG） | `Knowledge`（登録済みナレッジの参照は公開 API で実装する） | `jp.co.intra_mart.foundation.copilot.agent.knowledge` |
| スキル（Markdown 知識資産） | `SkillEntry` | `jp.co.intra_mart.foundation.copilot.agent.skill` |
| Structured Output | `@Property` アノテーション + `AgentBuilder.structuredOutput(Class)` | `jp.co.intra_mart.foundation.copilot.agent.structured` |
| 実行フローへの介入 | `AgentExecutionMiddleware`（Chain of Responsibility） | `jp.co.intra_mart.foundation.copilot.agent.middleware` |
| チャットUI連携 | `AbstractCopilotAssistant<T>` + `@Assistant` | `jp.co.intra_mart.foundation.copilot.assistant` |
| 画面で定義したエージェントの読み込み | `AgentManagementService`（`AgentManagementServiceFactory.getInstance().getService()`） | `jp.co.intra_mart.foundation.copilot.agent.definition` |

**`Agent`/`AgentBuilder` は素の Java オブジェクトであり、`Agent.builder()...build()` して `run()`/`runStreaming()` を呼ぶだけで、Web API Maker のエンドポイントやジョブなど任意の Java コードから直接利用できる。** IM-Copilot のチャットUI（スレッド・メッセージ履歴の永続化・ストリーミング応答等）と連携させたい場合のみ、`AbstractCopilotAssistant` でラップする（後述）。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.claude/rules` 配下には Agent フレームワーク実装を定めた Java 向け専用規約は存在しない。カスタムツールの入力パラメータ DTO に付与する `SchemaProperties` アノテーションは `java-im-mcp-generator` の `reference/mcp-annotation-api-reference.md` が扱う MCP ツールのものと同一クラス（`jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties`）であり、記法もそちらを参照できる。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API概要

`Agent`/`AgentBuilder` は `im_copilot_agent` モジュール（`im_copilot_core`/`im_copilot_base` に依存）に属する。`Agent.builder()` で `AgentBuilder<?>` を取得し、`model`/`instruction`/各種ツール/`knowledge`/`skill`/`middleware` 等を設定して `build()` すると `Agent<T>` が得られる（Structured Output 未設定時は `T` が `?`）。エージェントの実行は `run(...)`（同期・戻り値取得）と `runStreaming(...)`（チャンク単位のコールバック）の2系統があり、それぞれステートレス実行（内部で一時セッション）とステートフル実行（`Session` を明示的に使い回し、会話履歴を保持）を持つ。詳細は `reference/agent-core-api-reference.md` を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| 最小構成のエージェントを作って直接呼び出す | `assets/copilot-agent-basic-usage.md` パターン1 | `Agent.builder()...build()`、`run(String)` |
| ステートフルな会話（履歴保持） | `assets/copilot-agent-basic-usage.md` パターン2 | `Session`、`run(Session, String)` |
| カスタムツールを持たせる | `assets/copilot-agent-basic-usage.md` パターン3 | `UserDefinedTool` 実装、`SchemaProperties` と `ToolDefinition.builder().parametersFromClass(...)`（`action.chat`）による入力スキーマ生成 |
| 型付き出力（Structured Output）を強制する | `assets/copilot-agent-basic-usage.md` パターン4 | `@Property` を付与した DTO、`AgentBuilder.structuredOutput(Class)` |
| 実行フローに介入する（ログ・監視・ガードレール） | `assets/copilot-agent-basic-usage.md` パターン5 | `AgentExecutionMiddleware` |
| 登録済みナレッジを参照させる | `assets/copilot-agent-basic-usage.md` パターン6 | `Knowledge` の実装、`AgentBuilder.knowledge(...)` |
| 登録済みのスキルを使わせる | `assets/copilot-agent-basic-usage.md` パターン7 | 画面のエージェント定義でスキルを持たせ、パターン11で呼ぶ |
| IM-Copilot のチャットUIと連携させる | `assets/copilot-agent-basic-usage.md` パターン8 | `@Assistant` + `AbstractCopilotAssistant` |
| Assistant をプラットフォームに認識させる（パターン8と対） | `assets/copilot-agent-basic-usage.md` パターン9 | ビルド時に自動生成される索引（`META-INF/im_services/annotation_classes`）の確認、IM-Authz の権限付与 |
| カスタムツールを組み込みツールとして登録する（管理画面から選べるようにする） | `assets/copilot-agent-basic-usage.md` パターン10 | `@Tool`（agent 用）、`ToolCategory`、ビルド時に自動生成される索引（`META-INF/im_services/annotation_classes`）の確認 |
| 画面（Accel Agent）で定義したエージェントを読み込んで動かす | `assets/copilot-agent-basic-usage.md` パターン11 | `AgentManagementService`、`resolvePublishedVersion` で公開中の版を決めて `getAgent(agentId, version)` |

### リファレンス

- `reference/agent-core-api-reference.md` — `Agent`/`AgentBuilder`/`Message`/`AgentResponse`/`Session`/`Instruction`/`RunContext`/`ModelConfig`/`AgentManagementService` の全メソッド・シグネチャ
- `reference/tool-knowledge-skill-api-reference.md` — `Tool`/`UserDefinedTool`/`ToolDefinition`/`AbstractToolDefinition`、`Knowledge`、`SkillEntry`、Structured Output（`@Property`）、`AgentExecutionMiddleware` の全メソッド・シグネチャ
- `reference/assistant-integration-api-reference.md` — `@Assistant`/`AbstractCopilotAssistant`/`AssistantMessage`/`AssistantResult`/`AssistantResponseWriter` の全メソッド・シグネチャ

いずれもプラットフォーム API の実クラス定義に基づく（記憶で書かない）。

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java でAIエージェントを作って」「プロンプトを受けて処理するエージェントを作りたい」
- 「`Agent`/`AgentBuilder` を使いたい」
- 「エージェントにカスタムツール（関数呼び出し）を持たせたい」
- 「エージェントの応答を型付き（JSON）で受け取りたい」
- 「エージェントの実行をログ・監視したい、ガードレールを入れたい」
- 「IM-Copilot のチャット画面と連携するエージェントを作りたい」
- 「画面（Accel Agent）で定義したエージェントを Web API・ジョブ・Assistant から呼びたい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。

依頼が以下に該当する場合は、本スキルの対象外である旨を伝える:
- MCP サーバの実装（`@MCPServer`/`@Tool`） → `java-im-mcp-generator`
- 認証方式付きの通常の REST API（Web API Maker） → `java-im-web-api-maker-usage`
- IM-LogicDesigner のロジックフロー要素 → `java-im-logic-generator`
- Agent Designer（ノーコードのエージェント定義UI）自体の実装・拡張 → 本スキルの対象外（画面で定義したエージェントを Java から呼ぶことはパターン11で扱う）
- `VectorStore`/`ActionFactory` を直接使った低レベルな RAG 実装（Agent フレームワークの `Knowledge` を使わないもの） → `java-im-copilot-rag-generator`
- `ChatAction`+`ToolConfig` を直接使った低レベルな Tool Calling 実装（Agent フレームワークの `UserDefinedTool`/Agent Loop を使わないもの） → `java-im-copilot-toolcalling-generator`

## 実装手順

1. ユーザの要件をヒアリング（どのように呼び出すか＝Java コードから直接か IM-Copilot チャットUI経由か、ツール・ナレッジ・スキルの要否、型付き出力の要否、ステートレスかステートフルか）
2. 対象に応じたメソッドを `reference/agent-core-api-reference.md`/`reference/tool-knowledge-skill-api-reference.md`/`reference/assistant-integration-api-reference.md` で正確に確認する（記憶や推測で書かない）
3. `assets/copilot-agent-basic-usage.md` を参照して実装する
4. カスタムツールを実装する場合、入力パラメータ DTO の**すべてのフィールド**に `SchemaProperties` アノテーションを付与し、公開 API の `ToolDefinition.builder().parametersFromClass(...)`（`jp.co.intra_mart.foundation.copilot.action.chat`）でスキーマを生成する。管理画面から選べる組み込みツールにする場合は、クラスに `@Tool` を付ける。ビルド後、`target/classes`（または jar）の `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool` に `@Tool` クラスの完全修飾名が載っていることを確かめる（パターン10）
5. IM-Copilot のチャットUIと連携させる場合、`@Assistant` を付与した `AbstractCopilotAssistant<T>` サブクラスを作成する（`doExecute` 内で `Agent` を構築・実行する）。**パラメータクラス `T` は `AssistantParameter`（`jp.co.intra_mart.foundation.copilot.assistant.model`）自身、またはそのサブクラスにする**（`reference/assistant-integration-api-reference.md`「`AssistantParameter`」参照。独自の POJO にするとチャットUIでプロンプトを入力できなくなる）
6. Assistant を作成した場合、**IM-Authz での権限付与を必ず行う**（権限が無いとアシスタント一覧に表示されない。`@Assistant` クラスはビルド時に自動生成される索引で認識されるので、`AssistantScanPackageFactory` の実装は要らない。`assets/copilot-agent-basic-usage.md` パターン9）
7. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **`Agent`/`AgentBuilder` は Assistant フレームワークに依存しない、独立した Java API である。** Web API Maker のエンドポイントやジョブから `Agent.builder()...build().run(...)` を直接呼び出せる。IM-Copilot のチャットUI（スレッド管理・ストリーミング応答・メッセージ永続化）と連携させたい場合にのみ `AbstractCopilotAssistant` でラップする
- **画面（Accel Agent）で定義したエージェントは、`AgentManagementService` の `resolvePublishedVersion(agentId, null)` で公開中の版を決めてから `getAgent(agentId, version)` で読み込む（パターン11）。** 版を指定しない `getAgent(agentId)` は公開状態を問わず最新の版を読むため、画面で編集中の版が動く。`AgentManagementService` は認可しないので、エージェントを実行してよいかは呼び出し元の画面・API で確かめる
- **`UserDefinedTool<I,O>` は `getDefinition()` で `ToolDefinition` を返す必要がある。** `AbstractToolDefinition` は `isEnabled()` を実装しないため、自前で `isEnabled()` を実装するサブクラスを用意するか、他の具象実装を利用する（`reference/tool-knowledge-skill-api-reference.md` 参照）
- **ツールの入力パラメータ DTO に付与する `SchemaProperties` は `java-im-mcp-generator` の MCP ツールと同一のアノテーションクラス。** 記法に迷ったら `java-im-mcp-generator` の `reference/mcp-annotation-api-reference.md` も参照できる
- **`AgentExecutionMiddleware` は `intercept(InvocationContext, Chain)` で実行フローに介入する Chain of Responsibility。** 実行の記録は、`Agent.builder()` で組んだエージェントにもプラットフォームが自動で入れ、トレース一覧に表示されるため、記録のための middleware は書かない。自前で書くのは、実行の経過を自分の画面に出す等、トレースでは足りない目的がある場合（観測系。観測処理の例外は自分で捕捉して fail-open にする）と、検証・ガードレール等で処理を止めたい場合（制御系。fail-closed）で、どちらも公開インタフェースの `AgentExecutionMiddleware` を実装する（非公開 API の `ObservabilityMiddleware` は継承しない）
- **ナレッジ管理に登録済みのナレッジは、`Knowledge` を実装して ID で参照する（パターン6）。** 検索は公開 API の `KnowledgeServiceFactory`・`KnowledgeSearchRepositoryFactory` で行い、非公開 API の `jp.co.intra_mart.system.copilot.agent.knowledge.RegisteredKnowledge` は使わない
- **スキル管理に登録済みのスキルを Java から取得する公開 API は無い。** スキルを使わせる場合は、画面のエージェント定義でスキルを持たせ、そのエージェントをパターン11の方法で呼ぶ（パターン7）。`SkillEndpointFactory` は Web API Maker の REST エンドポイント用で Java から使う API として公開されておらず、`jp.co.intra_mart.system.copilot.agent.skill.service.SkillCatalogService` は非公開 API なので、どちらも使わない。ツールが具体的な操作を実行するのに対し、スキルはツールの使い方・判断基準・手順を記述した知識資産である
- **Structured Output（`AgentBuilder.structuredOutput(Class)`）を使うと `Agent<T>` の型パラメータが変わる。** `Agent.<T>builder()` のように型を明示するか、`structuredOutput` の戻り値を新しい変数として受け取ること（同一ビルダー変数への再代入は型が合わない）
- **`@Assistant` クラスは、ビルド時に自動生成される索引（`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant`）でプラットフォームに認識される。** `AssistantScanPackageFactory` の実装と `META-INF/services` への登録は要らない。アシスタント一覧に表示するには、IM-Authz で、リソース `im-copilot-assistant://assistant/<アシスタントID>`（リソースタイプ `im-copilot-assistant`、アクション `execute`）に対する許可ポリシーを付与する（リソース自体はサーバ起動時に自動インポートされるが、許可ポリシーは自動付与されない）。詳細は `assets/copilot-agent-basic-usage.md` パターン9を参照
- **`AbstractCopilotAssistant<T>` の `T` は `AssistantParameter` 自身、またはそのサブクラスでなければならない。** 独自のフィールドだけを持つ非互換な POJO を指定すると、実行時にパラメータパーサが対応できず例外になるうえ、チャットUIが送信メッセージの入力欄を組み立てられずプロンプトを入力できなくなる（一覧には表示されるが選択後に入力できない状態になる）。ユーザの発話は継承した `getMessage().getContents()` から取得する。詳細は `reference/assistant-integration-api-reference.md`「`AssistantParameter`」・`assets/copilot-agent-basic-usage.md` パターン8を参照
- Knowledge のコンテンツソース取り込み・ベクトル化・検索や、MCPツールのOAuth連携の内部実装はプラットフォーム内部の実装であり、アプリ開発者が直接実装する対象ではない。アプリ開発者が扱う範囲は `Knowledge` 等の公開APIまでである
- **`AgentBuilder<T>` は継承できない。** コンストラクタ（`AgentBuilder()`）がパッケージプライベートであり、`jp.co.intra_mart.foundation.copilot.agent` パッケージの外から `extends` すると `super()` の呼び出しでコンパイルエラーになる。設定内容を条件分岐で切り替えたい場合は、継承ではなく `AgentBuilder<?>` 型の変数にビルダーを保持し、条件に応じてメソッドを呼び足してから `build()` する（`Agent.builder()` の戻り値をそのままメソッドチェーンせず、一旦変数で受ける）
- **`AgentBuilder.model(String)` は省略できる。** 省略した場合、内部で使われる `ChatOption.model` も `null` のままとなり、テナントのドライバ設定（`conf/im-copilot-driver-config.xml`）の既定モデルにフォールバックする。存在しないモデルIDを明示的に指定すると、AIサービス側の `invalid model ID` 等のエラーで実行時に失敗する
- **AIサービス呼び出し失敗時の例外メッセージは、原因を問わず汎用的な文言（例: 「OpenAIにてチャット実行に失敗しました」）に丸められることがある。** 実際の失敗理由（HTTPステータス・レスポンスボディ等）は例外の cause チェーンの奥に保持されているため、トラブルシュート時はトップレベルの `getMessage()` だけでなく `getCause()` を辿って確認する

## 生成後の確認

自動検証スクリプトではなく、以下の項目を手動で確認する。

1. `Agent`/`AgentBuilder` を直接呼び出す構成か、`AbstractCopilotAssistant` でラップする構成か、要件と一致しているか
2. カスタムツールの `getDefinition()` が `isEnabled()` を含め正しく実装されているか、入力DTOに `SchemaProperties` が付与されているか
3. Structured Output 使用時、`Agent<T>` の型パラメータが一貫しているか
4. Middleware が観測系（観測処理の例外を捕捉・fail-open）か制御系（例外を伝播・fail-closed）か、要件と一致しているか
5. `AgentException`/`CopilotAssistantException` 等の検査例外が握りつぶされていないか
6. Assistant を作成した場合、パラメータクラス `T` が `AssistantParameter` 自身またはそのサブクラスになっているか（独自 POJO のままだとチャットUIでプロンプトを入力できない）
7. Assistant を作成した場合、ビルド成果物の索引（`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant`）に `@Assistant` クラスの完全修飾名が載っているか、IM-Authz でリソース `im-copilot-assistant://assistant/<アシスタントID>` への許可ポリシーを付与したか（許可ポリシーが無いとアシスタント一覧に表示されない）
8. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
9. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）でのAIエージェントの実装（`Agent`/`AgentBuilder`、Assistant連携）** | **本スキル** |
| `VectorStore`/`ActionFactory` を直接使った低レベルな RAG 実装 | `java-im-copilot-rag-generator` |
| `ChatAction`+`ToolConfig` を直接使った低レベルな Tool Calling 実装 | `java-im-copilot-toolcalling-generator` |
| MCP サーバの実装（`@MCPServer`/`@Tool`） | `java-im-mcp-generator` |
| Web API Maker による通常の REST API | `java-im-web-api-maker-usage` |
| IM-LogicDesigner のロジックフロー要素 | `java-im-logic-generator` |
