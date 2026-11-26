# Tool / Knowledge / Skill / Middleware API リファレンス（Java 版）

`im_copilot_agent`/`im_copilot_base` モジュールの実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

## ツール（`Tool`/`UserDefinedTool`）

型階層: `UserDefinedTool<I,O> extends BuiltinTool<I,O> extends Tool<I,O>`。アプリケーション開発で実装するのは `UserDefinedTool`。

```java
package jp.co.intra_mart.foundation.copilot.agent.tool;

public interface Tool<I, O> {
    ToolResult<O> execute(I input, ToolExecutionContext context) throws ToolExecutionException;
    ToolDefinition getDefinition();
}

public interface BuiltinTool<I, O> extends Tool<I, O> {
    ToolType getToolType();
    List<PropertyDefinition> getPropertyDefinitions();
}

public interface UserDefinedTool<I, O> extends BuiltinTool<I, O> {
    ToolType getToolType(); // ToolType.USER_DEFINED を返す
}
```

```java
public enum ToolType { BUILTIN, USER_DEFINED, LOGIC_FLOW, MCP }
```

### `ToolDefinition`/`AbstractToolDefinition`

```java
package jp.co.intra_mart.foundation.copilot.agent.tool;

public interface ToolDefinition extends java.io.Serializable {
    String getName();
    String getDescription();
    Map<String, Object> getParametersSchema(); // JSON Schema
    Class<?> getInputType();
    Class<?> getOutputType();
    ToolType getToolType();
    boolean isEnabled();
}

public abstract class AbstractToolDefinition implements ToolDefinition {
    protected AbstractToolDefinition(AbstractToolDefinitionBuilder<?, ?> builder);
    public AbstractToolDefinition(); // 引数なし
    public AbstractToolDefinition(String name, String description, Map<String, Object> parametersSchema,
            Class<?> inputType, Class<?> outputType, ToolType toolType);
    // getName/getDescription/getParametersSchema/getInputType/getOutputType/getToolType の実装を持つ
    // isEnabled() は実装しない（サブクラスで実装が必須）
}
```

**`AbstractToolDefinition` は `isEnabled()` を実装しないため、`UserDefinedTool.getDefinition()` の戻り値には、`isEnabled()` を実装した薄いサブクラスを自前で用意する必要がある**（常に有効なツールであれば `return true;` でよい）。コンストラクタは `(name, description, parametersSchema, inputType, outputType, toolType)` の6引数版を使う。

### ツール入力パラメータ DTO と `SchemaProperties`

入力型 `I` は、フィールドに `jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties` 配下のアノテーション（`StringProperty`/`IntegerProperty`/`NumberProperty`/`BooleanProperty`/`EnumProperty`/`ObjectProperty`/`ArrayProperty`）を付与した plain な DTO クラスとして定義する。**このアノテーションは MCP ツール（`java-im-mcp-generator`）と共通であり、属性の詳細は同スキルの `reference/mcp-annotation-api-reference.md` を参照できる。**

入力型から JSON Schema（`Map<String, Object>`）を生成するには、公開 API の `jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition`（`im_copilot_core`）を使う。`ToolDefinition.getParametersSchema()` にはこの戻り値をそのまま渡す。

```java
final Map<String, Object> schema = jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition.builder()
        .parametersFromClass(WeatherLookupInput.class) // CopilotServiceException（チェック例外）を送出する
        .build()
        .getParameters();
```

- `jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator` はプラットフォーム内部のクラスなので使わない。`parametersFromClass(Class)` は内部で同じ処理を呼んでおり、生成されるスキーマは同一である
- エージェント側の `ToolDefinition`（`jp.co.intra_mart.foundation.copilot.agent.tool`）と同じ単純名なので、片方は完全修飾名で書く

**入力型に `SchemaProperties` の注釈を1つでも付けたら、すべてのフィールドに付ける。** エージェントは LLM から受け取った引数を `ToolJsonHelper.deserialize(json, 入力型)` で入力型に変換する。注釈が1つでもある型では、注釈の付いたフィールドにだけ値をリフレクションで直接設定する（setter や `@JsonIgnoreProperties` などの Jackson の注釈は使われない）。注釈の無いフィールドは、LLM が値を渡しても捨てられ、エラーにもならない。

### `ToolExecutionContext`/`ToolResult`

```java
package jp.co.intra_mart.foundation.copilot.agent.tool;

public interface ToolExecutionContext {
    String getToolCallId();
    Map<String, Object> getMetadata();
    void setMetadata(String key, Object value);
}

public class ToolResult<O> {
    public static <O> ToolResult.ToolResultBuilder<O> builder();
    public boolean isError();
    public String getMessage();
    public O getContent();
    public Object getStructuredContent();
    public Map<String, Object> get_meta();
    public Throwable getCause();
}
```

`ToolResult.<O>builder().content(value).build()` が成功時の基本形。エラーを表現したい場合は `builder().isError(true).message("...").cause(e).build()` のように組み立てる（`ToolExecutionException` を送出する代わりに、エラー内容を `ToolResult` として返すことも可能）。

## 組み込みツールの登録（`@Tool`）

ツールのクラスに `@Tool`（`jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`。MCP の `@Tool` とは別のもの）を付けると、組み込みツールとして登録され、Accel Agent の「ツール管理」画面の「組み込み」タブにカテゴリ別に表示され、エージェントの編集画面で選択できる。ツール単位の認可は無く、Assistant（`assets/copilot-agent-basic-usage.md` パターン9）と違って IM-Authz の設定は無い。実装例は `assets/copilot-agent-basic-usage.md` パターン10。

- ツールに認可が無いため、そのツールを持たせたエージェントを実行できる人なら誰でも、LLM 経由でツールを動かせる
- ツールは、エージェントを実行したユーザのアクセスコンテキスト（ログインユーザ）で動く。ツールの処理は、ログインユーザの権限を確かめる API を使って作る。製品の組み込みツール（ワークフロー等）も、ログインユーザの権限を確かめる API を使って実装されている
- 権限の確認を通らない作り（SQL で直接データを読み書きする等）にしない

```java
package jp.co.intra_mart.foundation.copilot.agent.tool.annotation;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Tool {
    String name();
    String title() default "";
    String summary() default "";
    String description();
    Class<? extends ToolCategory> category();
    Class<? extends ToolCategory> subCategory() default ToolCategory.class; // 省略時はサブカテゴリなし
}
```

```java
package jp.co.intra_mart.foundation.copilot.agent.tool;

public interface ToolCategory {
    String getCategoryId();
    String getCategoryName();
    int getSortOrder();
}
```

- `@Tool` を付けたクラスの完全修飾名は、ビルド時に自動生成される索引 `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`（ファイル名がアノテーションの完全修飾名）に載り、プラットフォームはこの索引から組み込みツールを読み込む。`@MCPServer` と同じ仕組みで、索引はアノテーションプロセッサ `jp.co.intra_mart.tools:im_service_annotation_processor` が生成する（`im_copilot_base` が `@Tool` を索引の対象として登録している）
- `BuiltinToolScanPackageFactory` の実装と `META-INF/services` への登録は要らない
- `@Tool` を付けたクラスは `BuiltinTool` を実装する（`UserDefinedTool` は `BuiltinTool` を継承しているので、そのまま使える）。実装していないクラスは警告を出して登録されない
- `@Tool` の `name` とカテゴリの `getCategoryId()` は `^[A-Za-z0-9_-]+$` に一致し、64文字以内にする。外れると警告を出して登録されない
- ツールのクラスとカテゴリのクラスは public にし、引数なしの public コンストラクタを持たせる（プラットフォームが引数なしのコンストラクタでインスタンスを作る）
- `title`・`summary`、カテゴリ名（`getCategoryName()`）、入力パラメータの `summary` は、メッセージキーを指定するとロケールに応じたメッセージで表示される（キーでなければ書いた文字列のまま表示される）
- メッセージキーかどうかは `MessageManager.hasMessage(値)` で判定する。メッセージプロパティに定義されていればそのメッセージを、定義されていなければ書いた文字列をそのまま表示する（キーを書いてプロパティを定義し忘れると、キーの文字列がそのまま表示される）。メッセージプロパティの置き場所・書き方は `java-im-message-usage` を参照
- LLM に渡るツール名・説明・入力スキーマは `getDefinition()` の `getName()`・`getDescription()`・`getParametersSchema()` の値で、`@Tool` の `name`・`description` は使われない。`@Tool` の `name` は組み込みツールの識別子で、同じ `name` が既に登録されていると警告を出して登録されない。混乱を避けるため、`@Tool` の `name` と `getDefinition().getName()` は同じ値にそろえる
- `@Tool` の `description` はメッセージキーとして解決されない（管理画面で訳して表示されるのは `title`・`summary`・カテゴリ名・入力パラメータの `summary`）
- `getToolType()` の値は組み込みツールとしての登録に影響しない（`UserDefinedTool` の `ToolType.USER_DEFINED` のままでよい）
- エージェントをコードで組み立てる場合、組み込みツールとして登録したツールも `AgentBuilder.userDefinedTool(...)`・`builtinTool(...)` のどちらで渡してもよい。どちらで渡しても、ロジックフロー・MCP のツールとともに1つのリストにまとめて同じ方法で登録される

### 管理画面の入力パラメータの表

管理画面の入力パラメータの表は、入力型（`Tool<I, O>` の `I`）のフィールドから作られる。各行は、フィールドの名前・型と、`SchemaProperties` の注釈の `summary`（説明）・`required`（必須）からなる。

- `getDefinition()` の `parametersSchema` は表には使われない。`parametersSchema` を手書きしていても、表を出すには入力型のフィールドに注釈が必要
- 注釈の無いフィールドは表に出ない
- `ObjectProperty` を付けた独自のクラス型のフィールドは、そのクラスのフィールドが子の行として展開される
- `SchemaProperties` の `description` は LLM 向け（JSON Schema の `description` になる）、`summary` は管理画面向け（JSON Schema には含まれない）。表に説明を出すには `summary` を指定する

## ナレッジ（`Knowledge`）

```java
package jp.co.intra_mart.foundation.copilot.agent.knowledge;

public interface Knowledge {
    String getId();
    String getName();
    default String getDescription() { return getName() + "のナレッジベース"; }
    default KnowledgeSearchParams getSearchParams() { return KnowledgeSearchParams.defaults(); }
    default List<KnowledgeEntry> retrieve(String query) throws KnowledgeException;
    default List<KnowledgeEntry> retrieve(String query, int topK) throws KnowledgeException;
    List<KnowledgeEntry> retrieve(String query, int topK, MetadataFilterGroups metadataFilter) throws KnowledgeException;
}
```

ナレッジ管理（Agent Designer 等）に登録済みのナレッジを ID で参照する場合も、`Knowledge` を実装する（実装例は `assets/copilot-agent-basic-usage.md` パターン6）。ナレッジ情報の取得と検索には、次の公開 API を使う。非公開 API の `jp.co.intra_mart.system.copilot.agent.knowledge.RegisteredKnowledge` は使わない。

```java
// ナレッジ情報（名前・説明・埋め込みモデルの ID）。存在しない場合は null
KnowledgeServiceFactory.getInstance().getKnowledgeService().getKnowledge(String knowledgeId); // throws CopilotKnowledgeException

// 検索。aiModelId には KnowledgeInfo.getAiModelId() を渡す
KnowledgeSearchRepositoryFactory.getInstance().getKnowledgeSearchRepository()
    .search(String knowledgeId, String aiModelId, String query,
            KnowledgeSearchParams params, MetadataFilterGroups metadataFilter); // throws CopilotKnowledgeException
```

`AgentBuilder.knowledge(knowledge)` で登録すると、実行時にフレームワークが `KnowledgeSearchTool` を自動生成し、LLM がツール経由でナレッジを検索できるようになる。

```java
package jp.co.intra_mart.foundation.copilot.agent.knowledge.model;

public final class KnowledgeSearchParams implements java.io.Serializable {
    public static final int DEFAULT_TOP_K = 5;
    public KnowledgeSearchParams(int topK, Double similarityThreshold);
    public KnowledgeSearchParams(int topK, Double similarityThreshold, MetadataFilterGroups metadataFilter);
    public static KnowledgeSearchParams defaults();
    public int getTopK();
    public Double getSimilarityThreshold();
    public MetadataFilterGroups getMetadataFilter();
}
```

## スキル（`SkillEntry`）

スキルは Markdown 形式で定義された知識資産（ツールの使い方・判断基準・手順）。ツールが具体的な操作を実行するのに対し、スキルはその使い方を LLM に伝える。

```java
package jp.co.intra_mart.foundation.copilot.agent.skill;

public interface SkillEntry {
    String getSkillId();
    String getName();        // SKILL.md フロントマターの name
    String getDescription();  // SKILL.md フロントマターの description（LLMの選定材料）
    Map<String, Object> getMetadata();
    String getBody();         // SKILL.md 本文
}
```

スキル管理に登録済みのスキルを Java から取得する公開 API は無い。スキルを使わせる場合は、画面のエージェント定義でスキルを持たせ、そのエージェントを `AgentManagementService` で読み込んで動かす（`assets/copilot-agent-basic-usage.md` パターン7・パターン11）。

- `jp.co.intra_mart.foundation.copilot.agent.skill.endpoint.SkillEndpointFactory` は Web API Maker の REST エンドポイント用で、Java から使う API として公開されていないため使わない。`jp.co.intra_mart.system.copilot.agent.skill.service.SkillCatalogService` も非公開 API なので使わない
- フレームワークが `SkillEntry` から使うのは、LLM に渡すスキルの目録を作る `getSkillId()`・`getDescription()` である（`getName()` は使われない）。スキルを読むツールは、本文をスキル ID でストレージから直接読むため、`SkillEntry` を自分で実装しても登録されていないスキルは使えない

## 実行フローへの介入（`AgentExecutionMiddleware`）

Chain of Responsibility パターン。`InvocationContext#getPhase()`（`AgentPhase` 列挙: `EXECUTION`/`ITERATION`/`LLM_CALL`/`TOOL_CALL`/`KNOWLEDGE_SEARCH`/`SKILL_ACCESS`/`QUERY_REWRITE`/`STRUCTURED_OUTPUT`/`COMPACTION`/`GUARDRAIL`）でフェーズを識別する。

```java
package jp.co.intra_mart.foundation.copilot.agent.middleware;

public interface AgentExecutionMiddleware {
    default Object intercept(InvocationContext ctx, Chain chain) throws AgentException {
        return chain.proceed(ctx); // 既定は素通し
    }
}

@FunctionalInterface
public interface Chain {
    Object proceed(InvocationContext ctx) throws AgentException;
}
```

- **実行の記録**: `Agent.builder()` で組んだエージェントにも、プラットフォームが実行を記録する middleware を、登録した middleware より外側に自動で入れる。実行（実行時間・LLM 呼び出し回数等）はトレース一覧に表示されるため、記録のための middleware は書かない
- **観測系（fail-open）**: 実行の経過を自分の画面に出す等、トレースでは足りない目的がある場合に、`AgentExecutionMiddleware` を実装し、`chain.proceed(ctx)` の結果・例外をそのまま返す。観測処理の例外は自分で捕捉する（捕捉しないと本体の実行も失敗する）。`jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware` は非公開 API なので継承しない（実装例は `assets/copilot-agent-basic-usage.md` パターン5）
- **検証・ガードレール等、処理を止める可能性がある制御系（fail-closed）**: `AgentExecutionMiddleware` を直接実装し、`intercept` 内で例外をそのまま伝播させる
- `InvocationContext` は `withLLMMessages(List<Message>)`（`LLM_CALL` フェーズ専用）・`withToolArguments(String)`（`TOOL_CALL`/`KNOWLEDGE_SEARCH`/`SKILL_ACCESS` 専用）で、許可された軸のみ変更した新しいコンテキストを作れる。変更後のコンテキストは `chain.proceed(modifiedCtx)` に渡す
- 登録は `AgentBuilder.middleware(...)`/`middlewares(...)`

## Structured Output（型付き出力）

```java
package jp.co.intra_mart.foundation.copilot.agent.structured;

public interface Property extends java.lang.annotation.Annotation {
    String description();
    boolean required();
    String name();
}
```

出力型のフィールドに `@Property(description=..., required=...)` を付与し、`AgentBuilder.<出力型>structuredOutput(出力型.class)`（または `Agent.<出力型>builder()...structuredOutput(...)`）で有効化する。実行結果は `AgentResponse.getParsedData()` から取得する（Structured Output 未設定時は `null`）。
