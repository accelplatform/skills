# Agent コア API リファレンス（Java 版）

`im_copilot_agent`/`im_copilot_base` モジュール（`jp.co.intra_mart.foundation.copilot.agent.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## `Agent<T>`（コアインタフェース）

```java
package jp.co.intra_mart.foundation.copilot.agent;

public interface Agent<T> {
    // ステートレス実行（一時セッションを内部生成）
    AgentResponse<T> run(Message message) throws AgentException;
    AgentResponse<T> run(String userMessage) throws AgentException;
    AgentResponse<T> run(Message message, RunContext runContext) throws AgentException;

    // ステートフル実行（Session の履歴に会話が蓄積される）
    AgentResponse<T> run(Session session, Message message) throws AgentException;
    AgentResponse<T> run(Session session, String userMessage) throws AgentException;
    AgentResponse<T> run(Session session, Message message, RunContext runContext) throws AgentException;

    // ストリーミング実行
    void runStreaming(Session session, Message message, StreamingResponseHandler handler) throws AgentException;
    void runStreaming(Session session, Message message, RunContext runContext, StreamingResponseHandler handler) throws AgentException;
    void runStreaming(Session session, String userMessage, StreamingResponseHandler handler) throws AgentException;

    Session createSession();
    AgentConfig getConfig();

    static AgentBuilder<?> builder() {
        return new AgentBuilder<>();
    }
}
```

- `run(Message/String)` はステートレス実行。呼び出しのたびに内部で一時セッションを生成するため、会話履歴は保持されない
- `run(Session, ...)` はステートフル実行。同一 `Session` を使い回すと、過去の発話・応答が `SessionContext` に蓄積され、LLM 呼び出しに含まれる
- `RunContext` は画面入力等の per-run データ（`Instruction` の `${...}` 変数展開に使う `inputParameters` 等）を渡すためのオブジェクト。省略可（`RunContext.empty()` 相当）
- 全メソッドが検査例外 `jp.co.intra_mart.foundation.copilot.agent.exception.AgentException` を送出する

## `AgentBuilder<T>`

`Agent.builder()` から取得する。主要な設定メソッド（Builder パターン、各メソッドが `this`/新ビルダーを返す）:

**`AgentBuilder<T>` はコンストラクタ（`AgentBuilder()`）がパッケージプライベートであり、`jp.co.intra_mart.foundation.copilot.agent` パッケージの外から `extends` することはできない**（サブクラスの暗黙の `super()` 呼び出しがコンパイルエラーになる）。設定を条件分岐で切り替えたい場合は、継承ではなく `AgentBuilder<?>` 型の変数にビルダーを保持し、条件に応じてメソッドを呼び足してから `build()` する。

```java
package jp.co.intra_mart.foundation.copilot.agent;

public class AgentBuilder<T> {
    // モデル・チューニングパラメータ
    public AgentBuilder<T> model(String model);
    public AgentBuilder<T> driver(String driver);
    public AgentBuilder<T> temperature(double temperature);
    public AgentBuilder<T> maxTokens(int maxTokens);
    public AgentBuilder<T> reasoningEffort(String reasoningEffort);
    public AgentBuilder<T> verbosity(String verbosity);
    public AgentBuilder<T> stops(List<String> stops);
    public AgentBuilder<T> modelConfig(ModelConfig modelConfig); // 上記チューニング項目をまとめて設定（未設定項目はnullへ戻る）

    // インストラクション（システムプロンプト）
    public AgentBuilder<T> instruction(String instructionText); // SimpleInstruction を生成
    public AgentBuilder<T> instruction(Instruction instruction);

    // ツール
    public AgentBuilder<T> userDefinedTool(UserDefinedTool<?, ?> userDefinedTool);
    public AgentBuilder<T> userDefinedTools(UserDefinedTool<?, ?>... userDefinedTools);
    public AgentBuilder<T> builtinTool(BuiltinTool<?, ?> builtinTool);
    public AgentBuilder<T> builtinTools(BuiltinTool<?, ?>... builtinTools);
    public AgentBuilder<T> logicFlowTool(Tool<?, ?> logicFlowTool); // IM-LogicDesigner フローツール
    public AgentBuilder<T> mcpTool(Tool<?, ?> mcpTool); // MCPサーバのツール（解決済みのものを渡す）
    public AgentBuilder<T> mcpTools(Collection<? extends Tool<?, ?>> mcpTools);

    // ナレッジ・スキル
    public AgentBuilder<T> knowledge(Knowledge knowledge);
    public AgentBuilder<T> skill(SkillEntry skill);
    public AgentBuilder<T> skills(Collection<? extends SkillEntry> skills);

    // Middleware
    public AgentBuilder<T> middleware(AgentExecutionMiddleware middleware);
    public AgentBuilder<T> middlewares(AgentExecutionMiddleware... middlewares);

    // Structured Output（型パラメータが変わる点に注意。各3オーバーロードはクラスベース/Mapベース/JSON文字列ベース）
    public <U> AgentBuilder<U> structuredOutput(Class<U> outputClass); // + maxRetries 指定版
    public <U> AgentBuilder<U> structuredOutput(Map<String, Object> schemaMap); // + targetClass, maxRetries 指定版
    public <U> AgentBuilder<U> structuredOutputSchema(String jsonSchema); // + targetClass, maxRetries 指定版

    // 実行制御
    public AgentBuilder<T> maxIterations(int maxIterations); // 未設定時の既定値: 20
    public AgentBuilder<T> timeoutMs(long timeoutMs); // 未設定時はタイムアウトなし
    public AgentBuilder<T> autoCompaction(Double triggerRatio); // 0超1以下。会話履歴の自動圧縮の発動割合
    public AgentBuilder<T> contextWindow(Long contextWindow); // 自動圧縮のしきい値算出に使うトークン数

    public Agent<T> build();
}
```

- **`structuredOutput`/`structuredOutputSchema` は型パラメータ `T` を変更した新しいビルダーを返す。** `AgentBuilder<T>` 型の変数へ再代入すると型が合わないため、`Agent.<出力型>builder()` のように最初から型を明示するか、`final AgentBuilder<出力型> typedBuilder = builder.structuredOutput(...)` のように新しい変数で受けること
- ツールは4系統（`userDefinedTool`/`builtinTool`/`logicFlowTool`/`mcpTool`）に分かれる。アプリケーション開発で実装するのは基本的に `userDefinedTool` のみ（詳細は `reference/tool-knowledge-skill-api-reference.md`）
- **`model(String)` は省略できる。** 内部では `AgentBuilder` が保持するモデル名がそのまま `ChatAction` の `ChatOption.model` に渡される。`model(...)` を一度も呼ばなければ `ChatOption.model` は `null` のままとなり、テナントのドライバ設定（`conf/im-copilot-driver-config.xml`）が定める既定モデルにフォールバックする。逆に、ドライバ側に存在しないモデルIDを明示的に指定すると、AIサービス側から `invalid model ID` 等のエラーが返り実行時に失敗する
- **AIサービス呼び出しに失敗すると、原因を問わず汎用的な文言（例: 「OpenAIにてチャット実行に失敗しました」）にまとめられた例外メッセージになることがある。** モデルIDの誤り・認証エラー・レート制限・モデレーション該当等、実際の失敗理由は例外の cause チェーンの奥（`CopilotServiceInvalidResponseException` 等が保持するHTTPレスポンス）にあるため、トラブルシュート時はトップレベルの `getMessage()` だけでなく `getCause()` を辿って確認すること

## `Message`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public class Message implements java.io.Serializable {
    public static Message system(String content);
    public static Message user(String content);
    public static Message assistant(String content);
    public static Message tool(String toolCallId, String toolName, String content);
    public static Message userWithImage(String content, String imageUrl);
    public static Message userWithImage(String content, String imageUrl, ImageDetail detail);

    public static Message.MessageBuilder builder();

    public String getRole();
    public String getContent();
    public List<MessageContent> getContents(); // マルチモーダル時の内容
    public List<ToolCall> getToolCalls();
    public String getToolCallId();
    public String getToolName();
    public Map<String, Object> getMetadata();
    public boolean hasMultimodalContent();
}
```

## `AgentResponse<T>`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public class AgentResponse<T> implements java.io.Serializable {
    private String id;
    private Message message;            // アシスタントメッセージ（LLMの応答）
    private String finishReason;        // stop / tool_calls / length / error / guardrail_violation
    private List<ToolCall> toolCalls;   // 空リストが既定値
    private Map<String, Object> usage;  // inputTokens/outputTokens 等
    private Map<String, Object> metadata;
    private T parsedData;               // Structured Output 設定時のみ非null（パース済みデータ）
    // 他に raw JSON 出力の項目あり（LangChain include_raw 準拠）

    // Lombok @Data により全フィールドに getter/setter が生成される
}
```

- `getMessage().getContent()` で応答テキストを取得する
- `getParsedData()` は Structured Output 未設定時は `null`
- `getFinishReason()` の判定は文字列比較（`"stop".equals(...)` 等）。定数として `AgentResponse.FinishReason.STOP`/`TOOL_CALLS` 等が用意されている（javadoc 記載。詳細は実クラスを参照）

## `Session`/`SessionContext`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public interface Session {
    SessionContext getContext();
    void clear(); // メッセージ履歴・メモリのクリア
    String getSessionId(); // 永続化されていない場合は null
}
```

`SessionContext` はメッセージ履歴を保持するコンテキスト。`session.getContext().addMessage(message)` で履歴に手動追加できる（`AgentTrialRunAssistant` が過去のチャット履歴を復元する際に使用するパターン）。通常のアプリケーションコードでは `agent.run(session, ...)` を呼ぶだけでよく、履歴の追加は `Agent` 側が自動的に行う。

## `Instruction`

```java
package jp.co.intra_mart.foundation.copilot.agent.instruction;

public interface Instruction {
    String getText() throws InstructionException;
    String getText(InstructionContext context) throws InstructionException;
}
```

主な実装（`jp.co.intra_mart.system.copilot.agent.instruction` パッケージ）:
- `SimpleInstruction(String text)` — 固定テキスト
- `TemplateInstruction(String template)` — `${var}` 形式の変数展開に対応。`InstructionContext`（実装: `StandardInstructionContext`）に `setVariable(name, value)` で値を設定し、`getText(context)` で展開する

**フレームワークがツール情報を自動的にシステムプロンプトへ注入する。** `instruction` にはビジネスロジック（エージェントの役割・応答スタイル）のみを記述し、「ツールを使ってください」のような指示は書く必要がない（自動生成される）。

## `RunContext`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public final class RunContext implements java.io.Serializable {
    public static RunContext empty();
    public static RunContext.Builder builder();

    public Map<String, Object> getInputParameters();
    public String getTraceId();
    public String getParentSpanId();
}
```

`RunContext.builder().inputParameters(Map)` または `.putInputParameter(name, value)` で、`Instruction`（`TemplateInstruction`）の `${...}` 展開に使う入力パラメータを渡せる。`run(message, runContext)` / `run(session, message, runContext)` の引数として使う。

## `ModelConfig`/`AgentConfig`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public class ModelConfig implements java.io.Serializable {
    private Double temperature;      // 未設定時: モデル既定値
    private Integer maxTokens;
    private String reasoningEffort;  // モデルにより指定可能な値が異なる
    private List<String> stops;
    private String verbosity;        // low/medium/high。OpenAI/AzureOpenAI のみ対応

    public static ModelConfig.ModelConfigBuilder builder();
    // Lombok @Data により全フィールドに getter/setter が生成される
}
```

`AgentConfig` は `Agent#getConfig()` で取得できる、構築済みエージェントの設定のスナップショット（`model`/`modelConfig`/`driver`/`timeoutMs`/`agentDefinitionId`/`agentType`/`additionalParams`/`autoCompactionTriggerRatio`/`contextWindow` 等を保持）。

## 例外

`jp.co.intra_mart.foundation.copilot.agent.exception.AgentException`（検査例外）。`Agent` インタフェースの実行系メソッドがすべて宣言する。
