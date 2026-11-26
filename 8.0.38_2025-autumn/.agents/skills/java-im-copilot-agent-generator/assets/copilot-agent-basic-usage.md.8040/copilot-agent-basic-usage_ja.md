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
import jp.co.intra_mart.foundation.copilot.exception.CopilotServiceException;

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
                createParametersSchema(),
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
     * 入力パラメータ DTO の SchemaProperties アノテーションから JSON Schema を生成する。
     */
    private static Map<String, Object> createParametersSchema() {
        try {
            return jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition.builder()
                    .parametersFromClass(WeatherLookupInput.class)
                    .build()
                    .getParameters();
        } catch (final CopilotServiceException e) {
            throw new IllegalStateException("Failed to generate the parameters schema of weather_lookup.", e);
        }
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
- JSON Schema は公開 API の `jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition.builder().parametersFromClass(DTOクラス.class).build().getParameters()` で生成し、`ToolDefinition.getParametersSchema()` に渡す（`jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator` は内部クラスなので使わない）
- **DTO に `SchemaProperties` の注釈を1つでも付けたら、すべてのフィールドに付ける。** 注釈の無いフィールドは、LLM が値を渡しても捨てられ、エラーにもならない（setter も使われない。詳細は `reference/tool-knowledge-skill-api-reference.md`）
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

実行の記録（実行時間・LLM 呼び出し回数等）は、`Agent.builder()` で組んだエージェントにもプラットフォームが自動で入れ、トレース一覧に表示される。記録のための middleware は書かない。自前で middleware を書くのは、実行の経過を自分の画面に出す等、トレースでは足りない目的がある場合である。

```java
import java.util.function.Consumer;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;
import jp.co.intra_mart.foundation.copilot.agent.middleware.AgentExecutionMiddleware;
import jp.co.intra_mart.foundation.copilot.agent.middleware.AgentPhase;
import jp.co.intra_mart.foundation.copilot.agent.middleware.Chain;
import jp.co.intra_mart.foundation.copilot.agent.middleware.InvocationContext;

public class ProgressMiddleware implements AgentExecutionMiddleware {

    private static final Logger LOGGER = Logger.getLogger(ProgressMiddleware.class);

    /** 経過を画面へ送る処理（送り先はアプリ側で用意する） */
    private final Consumer<AgentPhase> listener;

    public ProgressMiddleware(final Consumer<AgentPhase> listener) {
        this.listener = listener;
    }

    @Override
    public Object intercept(final InvocationContext ctx, final Chain chain) throws AgentException {
        notifyProgress(ctx.getPhase());
        // 本体の結果・例外はそのまま返す
        return chain.proceed(ctx);
    }

    // 通知の失敗で本体の実行を失敗させない（fail-open）
    private void notifyProgress(final AgentPhase phase) {
        try {
            listener.accept(phase);
        } catch (final RuntimeException e) {
            LOGGER.warn("Failed to notify progress: " + phase, e);
        }
    }
}
```

```java
final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .middleware(new ProgressMiddleware(phase -> {
            // 例: TOOL_CALL なら「ツールを実行しています」を画面へ送る
        }))
        .build();
```

- 経過を通知する観測系は、`chain.proceed(ctx)` の結果・例外をそのまま返す。通知処理で例外を出すと本体の実行も失敗するため、通知処理の例外は自分で捕捉する（fail-open）
- 入力検証・ガードレール等で処理そのものを止めたい場合は、`intercept(ctx, chain)` 内で `chain.proceed(ctx)` を呼ばずに独自の結果を返す、または例外をそのまま伝播させる（fail-closed）
- `jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware` は非公開 API なので継承しない

## パターン6: 登録済みナレッジの参照

```java
import java.util.List;

import jp.co.intra_mart.foundation.copilot.agent.exception.KnowledgeException;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.Knowledge;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.KnowledgeEntry;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.exception.CopilotKnowledgeException;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.model.KnowledgeInfo;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.model.KnowledgeSearchParams;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.model.MetadataFilterGroups;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.repository.KnowledgeSearchRepositoryFactory;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.service.KnowledgeServiceFactory;

/**
 * ナレッジ管理に登録済みのナレッジを ID で参照する {@link Knowledge}。
 */
public class ManagedKnowledge implements Knowledge {

    private final String knowledgeId;

    private final KnowledgeSearchParams searchParams;

    public ManagedKnowledge(final String knowledgeId, final KnowledgeSearchParams searchParams) {
        this.knowledgeId = knowledgeId;
        this.searchParams = searchParams == null ? KnowledgeSearchParams.defaults() : searchParams;
    }

    @Override
    public String getId() {
        return knowledgeId;
    }

    @Override
    public String getName() {
        final KnowledgeInfo info = findKnowledgeInfo();
        return info == null || isBlank(info.getKnowledgeName()) ? knowledgeId : info.getKnowledgeName();
    }

    @Override
    public String getDescription() {
        final KnowledgeInfo info = findKnowledgeInfo();
        return info == null || isBlank(info.getDescription()) ? Knowledge.super.getDescription() : info.getDescription();
    }

    @Override
    public KnowledgeSearchParams getSearchParams() {
        return searchParams;
    }

    @Override
    public List<KnowledgeEntry> retrieve(final String query, final int topK, final MetadataFilterGroups metadataFilter)
            throws KnowledgeException {
        final KnowledgeSearchParams params = topK == searchParams.getTopK()
                ? searchParams
                : new KnowledgeSearchParams(topK, searchParams.getSimilarityThreshold(), searchParams.getMetadataFilter());
        try {
            final KnowledgeInfo info = KnowledgeServiceFactory.getInstance().getKnowledgeService().getKnowledge(knowledgeId);
            if (info == null) {
                throw new KnowledgeException("ナレッジが見つかりません。knowledgeId=" + knowledgeId);
            }
            // 検索はナレッジに設定された埋め込みモデルで行う
            return KnowledgeSearchRepositoryFactory.getInstance().getKnowledgeSearchRepository()
                    .search(knowledgeId, info.getAiModelId(), query, params, metadataFilter);
        } catch (final CopilotKnowledgeException e) {
            throw new KnowledgeException("ナレッジの検索に失敗しました。knowledgeId=" + knowledgeId + " 原因: " + e.getMessage(), e);
        }
    }

    private KnowledgeInfo findKnowledgeInfo() {
        try {
            return KnowledgeServiceFactory.getInstance().getKnowledgeService().getKnowledge(knowledgeId);
        } catch (final CopilotKnowledgeException e) {
            return null;
        }
    }

    private static boolean isBlank(final String value) {
        return value == null || value.trim().isEmpty();
    }
}
```

```java
final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .instruction("提供された情報を基に回答してください。")
        .knowledge(new ManagedKnowledge("knowledge-00123", KnowledgeSearchParams.defaults()))
        .build();
```

- ナレッジ管理（Agent Designer 等）に登録済みのナレッジを ID で参照する。ナレッジ名・説明は参照の都度ナレッジ管理から取得する（`KnowledgeInfo.getKnowledgeName()`/`getDescription()`）
- 検索は `KnowledgeSearchRepository.search(ナレッジID, 埋め込みモデルのID, 検索文字列, 検索パラメータ, メタデータの絞り込み)` で行う。埋め込みモデルの ID には、ナレッジに設定された `KnowledgeInfo.getAiModelId()` を渡す
- 登録すると、実行時にフレームワークが検索ツールを自動生成し、LLM が必要と判断したタイミングでツール経由で検索する（`instruction` に検索方法を書く必要はない）
- 参照先が存在しない場合、生成時点では例外にならず、実際に検索が実行された時点で例外となる
- `jp.co.intra_mart.system.copilot.agent.knowledge.RegisteredKnowledge` は非公開 API なので使わない

## パターン7: 登録済みのスキルを使わせる

スキル管理に登録済みのスキルを Java から取得する公開 API は無い。スキルを使わせる場合は、Accel Agent のエージェント管理画面でエージェントにスキルを持たせ、そのエージェントをパターン11の方法で読み込んで動かす。読み込んだエージェントは、実行時にスキルの本文を読んで使う。

- `jp.co.intra_mart.foundation.copilot.agent.skill.endpoint.SkillEndpointFactory` は Web API Maker の REST エンドポイント用で、Java から使う API として公開されていないため使わない。`jp.co.intra_mart.system.copilot.agent.skill.service.SkillCatalogService` も非公開 API なので使わない
- `SkillEntry` を自分で実装しても、スキルを読むツールは本文をスキル ID でストレージから直接読むため、登録されていないスキルは使えない
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
            throw new CopilotAssistantException("text message is required");
        }

        try {
            final Agent<?> agent = Agent.builder()
                    .model("gpt-4")
                    .instruction("あなたは天気案内アシスタントです。")
                    .userDefinedTool(new WeatherLookupTool())
                    .build();

            // validate() で文字列であることを確かめている
            final String userMessage = (String) parameter.getMessage().getContents();
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
        if (getMessage() == null || !(getMessage().getContents() instanceof String)) {
            return false;
        }
        return !((String) getMessage().getContents()).trim().isEmpty();
    }
}
```

- `@Assistant` を付与した `AbstractCopilotAssistant<T>` サブクラスが、IM-Copilot のチャットUIからの呼び出しのエントリポイントになる
- `getMessage().getContents()` は `Object` 型で、文字列以外（`ToolContent` の Collection 等）が入る場合がある。`String.valueOf(...)` で文字列にすると、Collection のときは `[...]` という文字列がそのまま AI に渡るため、文字列であることを確かめてから取り出す
- `doExecute` の中で `Agent.builder()...build()` して `run(...)` を呼ぶだけでよい。コード側で固定的に組み立てるエージェントであれば、この程度の実装で十分である。画面で定義したエージェントを動かす場合は、`Agent.builder()` の代わりにパターン11の方法で `Agent` を読み込む
- **パラメータクラス `T` は `AssistantParameter` 自身、またはそのサブクラスでなければならない。** 独自のフィールドだけを持つ非互換な POJO にすると、`AssistantParameterParser.get(parameter)`（`preprocessing()` 内部で最初に呼ばれる）が対応するパーサを見つけられず実行時例外になるほか、チャットUI側もパラメータクラスのスキーマから送信メッセージ用の入力欄を組み立てられず、プロンプトを入力できなくなる。ユーザの発話は継承した `getMessage().getContents()` から取得する（`AssistantParameter` 自体は独自のフィールドを追加せずそのまま使ってもよい）。追加のパラメータ（`dbSource` 等）が必要な場合は `AssistantParameter` を継承し、`@Property` を付与したフィールドを追加するだけにとどめ、`message`/`threadId` は再定義しないこと
- ストリーミング応答・メッセージ履歴の活用（`getMessageHistory()`）等、より高度な連携は `reference/assistant-integration-api-reference.md` を参照すること

## パターン9: Assistant のプラットフォーム登録（パターン8と対で必須）

**`@Assistant` クラスはビルド時に自動生成される索引で認識されるが、アシスタント一覧に表示するには IM-Authz の許可ポリシーが要る。**

### 手順1: 索引の確認

`@Assistant` クラスの完全修飾名は、ビルド時にアノテーションプロセッサが自動生成する索引（`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant`）に載り、プラットフォームはこの索引から `@Assistant` クラスを読み込む。`AssistantScanPackageFactory` の実装と `META-INF/services` への登録は要らない。ビルド後、`target/classes`（または jar）にこのファイルがあり、次のように `@Assistant` クラスの完全修飾名が載っていることを確かめる。

```
jp.co.intra_mart.sample.copilotagent.WeatherAssistant
```

### 手順2: IM-Authz での権限付与

索引で認識された `@Assistant` クラスは、サーバ起動時に IM-Authz の認可リソースとして**自動的にインポートされる**（リソースURI: `im-copilot-assistant://assistant/<アシスタントID>`、リソースタイプ: `im-copilot-assistant`、アクション: `execute`）。**しかし、そのリソースへの許可ポリシー（誰に実行を許可するか）は自動付与されない。** IM-Authz の管理画面（または `java-im-authz-usage` スキルが扱う `PolicyManager` 等）で、対象ユーザ・ロールに対する許可ポリシーを明示的に設定する必要がある。この設定が無いと、アシスタント自体は正しく認識されていても、一覧取得API（`getMetadatas(true)`）の権限チェックで除外され、画面に表示されない。

- 許可ポリシーが無いと、索引で認識されていても一覧に表示されない（認可チェックで弾かれる）

## パターン10: カスタムツールを組み込みツールとして登録する（管理画面から選べるようにする）

パターン3のツールクラスに `@Tool`（`jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`。MCP の `@Tool` とは別のもの）を付けると、組み込みツールとして登録され、Accel Agent の「ツール管理」画面の「組み込み」タブにカテゴリ別に表示され、エージェントの編集画面で選択できる。ツール単位の認可は無く、パターン9 の Assistant と違って IM-Authz の設定は無い。

- ツールに認可が無いため、そのツールを持たせたエージェントを実行できる人なら誰でも、LLM 経由でツールを動かせる
- ツールは、エージェントを実行したユーザのアクセスコンテキスト（ログインユーザ）で動く。ツールの処理は、ログインユーザの権限を確かめる API を使って作る。製品の組み込みツール（ワークフロー等）も、ログインユーザの権限を確かめる API を使って実装されている
- 権限の確認を通らない作り（SQL で直接データを読み書きする等）にしない

```java
import jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool;

@Tool(name = "weather_lookup", title = "天気の取得", summary = "指定した都市の現在の天気を取得します。",
        description = "指定した都市の現在の天気を取得する。", category = WeatherToolCategory.class)
public class WeatherLookupTool implements UserDefinedTool<WeatherLookupInput, String> {
    // 実装はパターン3と同じ
}
```

```java
import jp.co.intra_mart.foundation.copilot.agent.tool.ToolCategory;

public class WeatherToolCategory implements ToolCategory {

    @Override
    public String getCategoryId() {
        return "example_weather";
    }

    @Override
    public String getCategoryName() {
        return "天気";
    }

    @Override
    public int getSortOrder() {
        return 100;
    }
}
```

`BuiltinToolScanPackageFactory` の実装と `META-INF/services` への登録は要らない。`@Tool` を付けたクラスの完全修飾名は、ビルド時にアノテーションプロセッサが自動生成する索引（`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`）に載り、プラットフォームはこの索引から組み込みツールを読み込む。ビルド後、`target/classes`（または jar）にこのファイルがあり、次のように `@Tool` クラスの完全修飾名が載っていることを確かめる。

```
jp.co.example.foo.agent.tool.WeatherLookupTool
```

- `@Tool` の `name`・`description`・`category` は必須。`name` とカテゴリの `getCategoryId()` は `^[A-Za-z0-9_-]+$` に一致し、64文字以内にする（外れると警告を出して登録されない）
- `@Tool` を付けたクラスは `BuiltinTool` を実装する（`UserDefinedTool` は `BuiltinTool` を継承しているのでそのまま使える）。ツールのクラスとカテゴリのクラスは public にし、引数なしの public コンストラクタを持たせる
- `title`・`summary`、カテゴリ名、入力パラメータの `summary` は、メッセージキーを指定するとロケールに応じたメッセージで表示される（キーでなければ書いた文字列のまま表示される）
- 管理画面の入力パラメータの表は、入力型のフィールドと `SchemaProperties` の注釈（`summary`・`required`）から作られる。`getDefinition()` の `parametersSchema` は使われず、注釈の無いフィールドは表に出ない（詳細は `reference/tool-knowledge-skill-api-reference.md`「組み込みツールの登録」）
- 管理画面の表に説明を出すには、入力パラメータ DTO の各フィールドに `summary` も指定する（例: `@SchemaProperties.StringProperty(description = "天気を調べたい都市名（例: 東京）", summary = "都市名", required = true)`）。`description` は LLM 向けで、表には使われない
- LLM に渡るツール名・説明は `getDefinition()` の値で、`@Tool` の `name`・`description` は使われない。`@Tool` の `name` は組み込みツールの識別子なので、`getDefinition().getName()` と同じ値にそろえる
- メッセージキーを使う場合は、メッセージプロパティにキーを定義する（定義し忘れるとキーの文字列がそのまま表示される）。置き場所・書き方は `java-im-message-usage` を参照
- エージェントをコードで組み立てる場合は、パターン3と同じく `userDefinedTool(...)` で渡してよい（`builtinTool(...)` で渡しても同じ扱い）

## パターン11: 画面で定義したエージェントを読み込んで動かす

Accel Agent のエージェント管理画面で定義したエージェントは、`AgentManagementService`（`jp.co.intra_mart.foundation.copilot.agent.definition`）で `Agent` として読み込み、コードで組み立てたエージェントと同じく `run(...)` で動かせる。Assistant（パターン8）の `doExecute` のほか、Web API Maker のエンドポイントやジョブからも同じ書き方で呼べる。

```java
package jp.co.intra_mart.sample.copilotagent;

import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;
import jp.co.intra_mart.foundation.copilot.agent.Message;
import jp.co.intra_mart.foundation.copilot.agent.definition.AgentManagementService;
import jp.co.intra_mart.foundation.copilot.agent.definition.AgentManagementServiceFactory;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;

public class DefinedAgentRunner {

    public String run(final String agentId, final String prompt) throws AgentException {
        final AgentManagementService service = AgentManagementServiceFactory.getInstance().getService();

        // 公開中の最新版を決める（公開中の版が無いと AgentVersionNotPublishedException）
        final int version = service.resolvePublishedVersion(agentId, null);
        final Agent<?> agent = service.getAgent(agentId, version);

        final AgentResponse<?> response = agent.run(prompt);
        final Message message = response.getMessage();
        return message == null ? "" : message.getContent();
    }
}
```

- `resolvePublishedVersion(agentId, null)` は、公開中の版のうち最新の版の番号を返す。公開中の版が無いと `AgentVersionNotPublishedException`（`AgentDefinitionPersistenceException` のサブクラスで、`AgentException` を継承する）を投げる
- 読み込んだ `Agent` は、その版の画面の定義（モデル・インストラクション等）で動く
- **版を指定しない `getAgent(agentId)` は本番の呼び出しでは使わない。** 公開状態を問わず最新の版を読む。新しい版は停止の状態で作られるため、画面で編集中（未公開）の版がそのまま動く
- `AgentManagementService` は、エージェントを実行してよいかを確かめない（認可しない）。実行してよいかは、呼び出し元の画面・API の認可で確かめる

画面の定義で入力パラメータを持つエージェントは、`RunContext.builder().inputParameters(...)` で値を作り、`run(Message, RunContext)` で渡す。指示文の `${...}` は、実行時の `RunContext` の入力パラメータで置き換わる。渡さないと、`${...}` は置き換わらないまま LLM に渡る。オブジェクトの入力パラメータは、`${user.name}` のように中の値を参照できる。

```java
final Map<String, Object> inputParameters = new HashMap<>();
inputParameters.put("topic", "交通費");                                   // 指示文の ${topic}
inputParameters.put("user", Collections.singletonMap("name", "山田"));    // 指示文の ${user.name}
final RunContext runContext = RunContext.builder().inputParameters(inputParameters).build();

final AgentResponse<?> response = agent.run(Message.user(prompt), runContext);
```

## 注意事項

- **`Agent`/`AgentBuilder` は Assistant フレームワークに依存しない独立した Java API である。** IM-Copilot のチャットUIと連携させる必要が無ければ、パターン8（Assistant）を使わず、パターン1〜7を直接 Web API Maker のエンドポイントやジョブから呼び出せばよい
- **`AbstractToolDefinition` は `isEnabled()` を実装しない。** `UserDefinedTool.getDefinition()` の実装では、`isEnabled()` を実装した薄いサブクラスを用意すること
- **`structuredOutput(...)` は型パラメータを変更した新しいビルダーを返す。** `Agent.<出力型>builder()` のように最初から型を明示すること
- **観測系（fail-open）と制御系（fail-closed）の Middleware は分けて実装する。** 処理を止めたい検査を、観測処理の例外を捕捉する `try`/`catch` の中に書かないこと（例外が捕捉され、意図通りに止まらない）
- **`@Assistant` を付与しただけではアシスタント一覧に表示されない。** パターン9（索引の確認 + IM-Authz の権限付与）を必ず行うこと。`AssistantScanPackageFactory` の実装は要らない
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
