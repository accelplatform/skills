# IM-Copilot Agent フレームワーク実装パターン（Java 版）

`Agent`/`AgentBuilder` を使った実装パターン集。メソッドの正確なシグネチャは `reference/agent-core-api-reference.md`/`reference/tool-knowledge-skill-api-reference.md`/`reference/assistant-integration-api-reference.md` を参照すること。

## パターン1: 最小構成のエージェントを作って直接呼び出す

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;
import jp.co.intra_mart.foundation.copilot.agent.Message;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;

public class SimpleAgentService {

    public String ask(final String userMessage) throws AgentException {
        final Agent<?> agent = Agent.builder()
                .model("gpt-4")
                .instruction("あなたは親切なアシスタントです。")
                .build();

        final AgentResponse<?> response = agent.run(userMessage);
        final Message message = response.getMessage();
        return message == null ? "" : message.getContent();
    }
}
```

- `Agent`/`AgentBuilder` は Assistant フレームワークに依存しない Java オブジェクトであり、Web API Maker のエンドポイントやジョブなど任意の Java コードから直接呼び出せる
- `run(String)` はステートレス実行。呼び出しごとに内部で一時セッションが作られ、会話履歴は保持されない
- `instruction` にはビジネスロジック（役割・応答スタイル）のみを書く。ツールの使用指示は自動的にシステムプロンプトへ注入されるため書く必要がない

## パターン2: ステートフルな会話（履歴保持）

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;
import jp.co.intra_mart.foundation.copilot.agent.Session;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;

public class StatefulAgentService {

    public String converse(final Agent<?> agent, final Session session, final String userMessage) throws AgentException {
        final AgentResponse<?> response = agent.run(session, userMessage);
        return response.getMessage() == null ? "" : response.getMessage().getContent();
    }

    public Session createSession(final Agent<?> agent) {
        return agent.createSession();
    }
}
```

- `Session` は `Agent.createSession()` で作成し、同一インスタンスを使い回すことで会話履歴が `SessionContext` に蓄積される
- `Session` を呼び出しの都度作り直すと、パターン1のステートレス実行と同じ挙動になる（履歴が保持されない）

## パターン3: カスタムツール（`UserDefinedTool`）

```java
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties;

public class WeatherLookupInput {

    @SchemaProperties.StringProperty(description = "天気を調べたい都市名（例: 東京）", required = true)
    private String city;

    public String getCity() {
        return city;
    }

    public void setCity(final String city) {
        this.city = city;
    }
}
```

```java
import java.util.List;
import java.util.Map;

import jp.co.intra_mart.foundation.copilot.agent.exception.ToolExecutionException;
import jp.co.intra_mart.foundation.copilot.agent.tool.AbstractToolDefinition;
import jp.co.intra_mart.foundation.copilot.agent.tool.PropertyDefinition;
import jp.co.intra_mart.foundation.copilot.agent.tool.ToolDefinition;
import jp.co.intra_mart.foundation.copilot.agent.tool.ToolExecutionContext;
import jp.co.intra_mart.foundation.copilot.agent.tool.ToolResult;
import jp.co.intra_mart.foundation.copilot.agent.tool.ToolType;
import jp.co.intra_mart.foundation.copilot.agent.tool.UserDefinedTool;
import jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator;

public class WeatherLookupTool implements UserDefinedTool<WeatherLookupInput, String> {

    @Override
    public ToolResult<String> execute(final WeatherLookupInput input, final ToolExecutionContext context) throws ToolExecutionException {
        if (input == null || input.getCity() == null || input.getCity().trim().isEmpty()) {
            throw new ToolExecutionException("city is required");
        }
        final String weather = input.getCity() + "の天気: 晴れ、気温 22℃";
        return ToolResult.<String>builder().content(weather).build();
    }

    @Override
    public ToolDefinition getDefinition() {
        return EnabledToolDefinition.of(
                "weather_lookup",
                "指定した都市の現在の天気を取得する。",
                JsonSchemaGenerator.generateSchema(WeatherLookupInput.class),
                WeatherLookupInput.class,
                String.class,
                ToolType.USER_DEFINED);
    }

    @Override
    public ToolType getToolType() {
        return ToolType.USER_DEFINED;
    }

    @Override
    public List<PropertyDefinition> getPropertyDefinitions() {
        return java.util.Collections.emptyList();
    }

    /**
     * {@link AbstractToolDefinition} は isEnabled() を実装しないため、常に有効を返す薄いサブクラスを用意する。
     */
    private static final class EnabledToolDefinition extends AbstractToolDefinition {

        private static final long serialVersionUID = 1L;

        private EnabledToolDefinition(final String name, final String description,
                final Map<String, Object> parametersSchema, final Class<?> inputType,
                final Class<?> outputType, final ToolType toolType) {
            super(name, description, parametersSchema, inputType, outputType, toolType);
        }

        static ToolDefinition of(final String name, final String description,
                final Map<String, Object> parametersSchema, final Class<?> inputType,
                final Class<?> outputType, final ToolType toolType) {
            return new EnabledToolDefinition(name, description, parametersSchema, inputType, outputType, toolType);
        }

        @Override
        public boolean isEnabled() {
            return true;
        }
    }
}
```

```java
final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .instruction("あなたは天気案内アシスタントです。")
        .userDefinedTool(new WeatherLookupTool())
        .build();
```

- 入力パラメータ DTO のフィールドには `SchemaProperties`（`java-im-mcp-generator` の MCP ツールと共通のアノテーション）を付与する
- `JsonSchemaGenerator.generateSchema(DTOクラス.class)` で JSON Schema を自動生成し、`ToolDefinition.getParametersSchema()` に渡す
- ツール単体を LLM を介さず直接呼び出す場合（単体テスト等）は、`ToolExecutionContext` の最小実装（`getToolCallId`/`getMetadata`/`setMetadata` のみ）を渡せばよい

## パターン4: Structured Output（型付き出力）

```java
import jp.co.intra_mart.foundation.copilot.agent.structured.Property;

public class WeatherReport {

    @Property(description = "都市名", required = true)
    private String city;

    @Property(description = "天気の概況（晴れ・雨等）", required = true)
    private String condition;

    @Property(description = "気温（摂氏）", required = true)
    private int temperatureCelsius;

    // getter/setter は省略
}
```

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;

final Agent<WeatherReport> agent = Agent.<WeatherReport>builder()
        .model("gpt-4")
        .instruction("東京の天気を報告してください。")
        .structuredOutput(WeatherReport.class)
        .build();

final AgentResponse<WeatherReport> response = agent.run("東京の天気を教えて");
final WeatherReport report = response.getParsedData();
```

- `Agent.<出力型>builder()` のように型パラメータを明示してから `structuredOutput(...)` を呼ぶと、以降のメソッドチェーンの型が一貫する
- 実行結果は `AgentResponse.getParsedData()` から取得する

## パターン5: 実行フローへの介入（Middleware）

```java
import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.copilot.agent.middleware.InvocationContext;
import jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware;

public class LoggingObservabilityMiddleware extends ObservabilityMiddleware {

    private static final Logger LOGGER = Logger.getLogger(LoggingObservabilityMiddleware.class);

    @Override
    protected Object before(final InvocationContext ctx) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("phase started: {}", ctx.getPhase());
        }
        return System.currentTimeMillis();
    }

    @Override
    protected void after(final InvocationContext ctx, final Object scope, final Object result) {
        if (LOGGER.isDebugEnabled()) {
            final long elapsedMs = System.currentTimeMillis() - (Long) scope;
            LOGGER.debug("phase completed: {} ({} ms)", ctx.getPhase(), elapsedMs);
        }
    }
}
```

```java
final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .middleware(new LoggingObservabilityMiddleware())
        .build();
```

- ログ・監視のみを行う観測系は `ObservabilityMiddleware` を継承する（`before`/`after`/`onError` の例外は自動的に握り潰され、本体実行には影響しない＝fail-open）
- 入力検証・ガードレール等で処理そのものを止めたい場合は、`AgentExecutionMiddleware` を直接実装し、`intercept(ctx, chain)` 内で `chain.proceed(ctx)` を呼ばずに独自の結果を返す、または例外をそのまま伝播させる（fail-closed）

## パターン6: 登録済みナレッジの参照

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.Knowledge;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.model.KnowledgeSearchParams;
import jp.co.intra_mart.system.copilot.agent.knowledge.RegisteredKnowledge;

final Knowledge knowledge = new RegisteredKnowledge("knowledge-00123", KnowledgeSearchParams.defaults());

final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .instruction("提供された情報を基に回答してください。")
        .knowledge(knowledge)
        .build();
```

- `RegisteredKnowledge` はナレッジ管理（Agent Designer 等）に登録済みのナレッジを ID で参照する。ナレッジ名・説明は参照の都度ナレッジ管理から解決される
- 登録すると、実行時にフレームワークが検索ツールを自動生成し、LLM が必要と判断したタイミングでツール経由で検索する（`instruction` に検索方法を書く必要はない）
- 参照先が存在しない場合、生成時点では例外にならず、実際に検索が実行された時点で例外となる

## パターン7: Markdown スキルの参照

```java
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.skill.SkillEntry;
import jp.co.intra_mart.system.copilot.agent.skill.service.SkillCatalogService;

final List<String> skillIds = Arrays.asList("expense-report-guideline");
final Map<String, SkillEntry> entries = new SkillCatalogService().entriesForRegistry(skillIds);

final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .skills(entries.values())
        .build();
```

- スキルは `PublicStorage` の `im_copilot/agent/skills/<skillId>/SKILL.md` に配置された Markdown ファイルとして管理する
- `entriesForRegistry` は存在しない ID を渡しても例外にならず、結果から除外される（戻り値の `Map` のサイズで解決件数を確認できる）
- スキルはツールの使い方・判断基準・手順を記述する知識資産であり、具体的な操作の実行はツール（パターン3）が担う

## パターン8: IM-Copilot チャットUIとの連携（Assistant フレームワーク）

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;
import jp.co.intra_mart.foundation.copilot.agent.Message;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;
import jp.co.intra_mart.foundation.copilot.assistant.AbstractCopilotAssistant;
import jp.co.intra_mart.foundation.copilot.assistant.AssistantType;
import jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant;
import jp.co.intra_mart.foundation.copilot.assistant.exception.CopilotAssistantException;
import jp.co.intra_mart.foundation.copilot.assistant.message.AssistantMessage;
import jp.co.intra_mart.foundation.copilot.assistant.model.AssistantResult;

@Assistant(id = "weather_assistant", name = "Weather Assistant",
        type = AssistantType.STANDARD, listEnable = true, storeMessage = false)
public class WeatherAssistant extends AbstractCopilotAssistant<WeatherAssistantParameter> {

    @Override
    protected AssistantResult doExecute(final WeatherAssistantParameter parameter) throws CopilotAssistantException {
        if (!parameter.validate()) {
            throw new CopilotAssistantException("message is required");
        }

        try {
            final Agent<?> agent = Agent.builder()
                    .model("gpt-4")
                    .instruction("あなたは天気案内アシスタントです。")
                    .userDefinedTool(new WeatherLookupTool())
                    .build();

            final String userMessage = String.valueOf(parameter.getMessage().getContents());
            final AgentResponse<?> response = agent.run(userMessage);
            final Message assistantMessage = response.getMessage();
            final String content = assistantMessage == null ? "" : assistantMessage.getContent();

            return AssistantResult.builder()
                    .message(new AssistantMessage("assistant", content))
                    .finishReason(response.getFinishReason())
                    .build();
        } catch (final AgentException e) {
            throw new CopilotAssistantException("Agent execution failed: " + e.getMessage(), e);
        }
    }
}
```

```java
import jp.co.intra_mart.foundation.copilot.assistant.model.AssistantParameter;

public class WeatherAssistantParameter extends AssistantParameter {

    public boolean validate() {
        return getMessage() != null
                && getMessage().getContents() != null
                && !String.valueOf(getMessage().getContents()).trim().isEmpty();
    }
}
```

- `@Assistant` を付与した `AbstractCopilotAssistant<T>` サブクラスが、IM-Copilot のチャットUIからの呼び出しのエントリポイントになる
- `doExecute` の中で `Agent.builder()...build()` して `run(...)` を呼ぶだけでよい。Agent Designer が管理する動的なエージェント定義（JSON）を読み込む必要が無い、コード側で固定的に組み立てるエージェントであれば、この程度の実装で十分である
- **パラメータクラス `T` は `AssistantParameter` 自身、またはそのサブクラスでなければならない。** 独自のフィールドだけを持つ非互換な POJO にすると、`AssistantParameterParser.get(parameter)`（`preprocessing()` 内部で最初に呼ばれる）が対応するパーサを見つけられず実行時例外になるほか、チャットUI側もパラメータクラスのスキーマから送信メッセージ用の入力欄を組み立てられず、プロンプトを入力できなくなる。ユーザの発話は継承した `getMessage().getContents()` から取得する（`AssistantParameter` 自体は独自のフィールドを追加せずそのまま使ってもよい）。追加のパラメータ（`dbSource` 等）が必要な場合は `AssistantParameter` を継承し、`@Property` を付与したフィールドを追加するだけにとどめ、`message`/`threadId` は再定義しないこと
- ストリーミング応答・メッセージ履歴の活用（`getMessageHistory()`）等、より高度な連携は `reference/assistant-integration-api-reference.md` を参照すること

## パターン9: Assistant のプラットフォーム登録（パターン8と対で必須）

**`@Assistant` を付与しただけではプラットフォームに認識されず、アシスタント一覧にも表示されない。** 以下の**両方**の対応が必要である。

### 手順1: `AssistantScanPackageFactory` の実装・登録

`@Assistant` クラスを含むパッケージをスキャン対象に加えるため、`AssistantScanPackageFactory` を実装し、`ServiceLoader` 経由で登録する。

```java
package jp.co.intra_mart.sample.copilotagent;

import java.util.Collection;
import java.util.Collections;

import jp.co.intra_mart.foundation.copilot.assistant.AssistantScanPackageFactory;

public class WeatherAssistantScanPackageFactory implements AssistantScanPackageFactory {

    @Override
    public Collection<String> getTargetPackages() {
        return Collections.singletonList("jp.co.intra_mart.sample.copilotagent");
    }
}
```

`src/main/resources/META-INF/services/jp.co.intra_mart.foundation.copilot.assistant.AssistantScanPackageFactory` というファイル名で、実装クラスの完全修飾名を1行で記述する。

```
jp.co.intra_mart.sample.copilotagent.WeatherAssistantScanPackageFactory
```

### 手順2: IM-Authz での権限付与

`@Assistant` クラスのスキャン結果は、サーバ起動時に IM-Authz の認可リソースとして**自動的にインポートされる**（リソースURI: `im-copilot-assistant://assistant/<アシスタントID>`、リソースタイプ: `im-copilot-assistant`、アクション: `execute`）。**しかし、そのリソースへの許可ポリシー（誰に実行を許可するか）は自動付与されない。** IM-Authz の管理画面（または `java-im-authz-usage` スキルが扱う `PolicyManager` 等）で、対象ユーザ・ロールに対する許可ポリシーを明示的に設定する必要がある。この設定が無いと、アシスタント自体は正しくスキャンされていても、一覧取得API（`getMetadatas(true)`）の権限チェックで除外され、画面に表示されない。

- 手順1のみでは一覧に表示されない（認可チェックで弾かれる）
- 手順2のみでは対象にならない（そもそもスキャンされずリソースが存在しない）
- **両方を行って初めてアシスタント一覧に表示される**

## 注意事項

- **`Agent`/`AgentBuilder` は Assistant フレームワークに依存しない独立した Java API である。** IM-Copilot のチャットUIと連携させる必要が無ければ、パターン8（Assistant）を使わず、パターン1〜7を直接 Web API Maker のエンドポイントやジョブから呼び出せばよい
- **`AbstractToolDefinition` は `isEnabled()` を実装しない。** `UserDefinedTool.getDefinition()` の実装では、`isEnabled()` を実装した薄いサブクラスを用意すること
- **`structuredOutput(...)` は型パラメータを変更した新しいビルダーを返す。** `Agent.<出力型>builder()` のように最初から型を明示すること
- **`ObservabilityMiddleware`（観測系・fail-open）と `AgentExecutionMiddleware` 直接実装（制御系・fail-closed）は用途が異なる。** 処理を止める可能性がある実装を `ObservabilityMiddleware` で書かないこと（例外が握り潰され、意図通りに止まらない）
- **`@Assistant` を付与しただけではアシスタント一覧に表示されない。** パターン9（`AssistantScanPackageFactory` の登録 + IM-Authz の権限付与）を必ず行うこと。どちらか一方だけでは表示されない
- **`AbstractCopilotAssistant<T>` の `T` は `AssistantParameter` 自身、またはそのサブクラスでなければならない。** 独自の POJO にすると、パラメータパーサがパラメータ型を解決できず実行時エラーになるほか、チャットUIが送信メッセージ用の入力欄を組み立てられずプロンプトを入力できなくなる（アシスタント一覧には表示されるが選択後に入力できない状態になる）。詳細はパターン8を参照
- Knowledge のコンテンツソース取り込み・ベクトル化・検索の内部実装、および MCPツールのOAuth連携部分はプラットフォーム内部の実装であり、アプリ開発者が直接実装する対象ではない
- **`AgentBuilder<T>` は継承できない**（コンストラクタがパッケージプライベート）。条件分岐で設定を切り替えたい場合は、`AgentBuilder<?>` 型の変数にビルダーを保持し、条件に応じてメソッドを呼び足してから `build()` する
  ```java
  final AgentBuilder<?> builder = Agent.builder().instruction("あなたは天気案内アシスタントです。");
  if (withTool) {
      builder.userDefinedTool(new WeatherLookupTool());
  }
  final Agent<?> agent = builder.build();
  ```
- **`model(String)` は省略できる。** 省略時は `ChatOption.model` が `null` のままとなり、テナントのドライバ設定の既定モデルにフォールバックする。存在しないモデルIDを明示指定すると `invalid model ID` 等のエラーで実行時に失敗する
- **AIサービス呼び出し失敗時の例外メッセージは、原因を問わず汎用的な文言に丸められることがある。** 実際の失敗理由（HTTPレスポンス等）は例外の cause チェーンの奥にあるため、トラブルシュート時は `getCause()` を辿って確認すること（詳細は `reference/agent-core-api-reference.md`）
