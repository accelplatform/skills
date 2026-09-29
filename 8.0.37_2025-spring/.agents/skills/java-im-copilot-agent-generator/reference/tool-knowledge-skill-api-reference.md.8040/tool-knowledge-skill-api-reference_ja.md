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

```java
package jp.co.intra_mart.system.copilot.tool;

public final class JsonSchemaGenerator {
    public static Map<String, Object> generateSchema(Class<?> dtoClass);
}
```

`JsonSchemaGenerator.generateSchema(WeatherLookupInput.class)` のように呼び出すと、`SchemaProperties` アノテーションが付与されたフィールドから JSON Schema（`Map<String, Object>`）を生成する。`ToolDefinition.getParametersSchema()` にはこの戻り値をそのまま渡す。

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

基本の使い方は、ナレッジ管理（Agent Designer 等）に登録済みのナレッジを ID で参照する `RegisteredKnowledge` を使う。

```java
package jp.co.intra_mart.system.copilot.agent.knowledge;

public class RegisteredKnowledge implements Knowledge {
    public RegisteredKnowledge(String knowledgeId, KnowledgeSearchParams searchParams);
    // getId/getName/getDescription/getSearchParams/retrieve を実装
    // 参照先の存在は生成時に検証しない。存在しない場合、名称・説明はIDから組み立てた代替値になり、
    // retrieve() は KnowledgeException を送出する
}
```

`AgentBuilder.knowledge(knowledge)` で登録すると、実行時にフレームワークが `KnowledgeSearchTool` を自動生成し、LLM がツール経由でナレッジを検索できるようになる。**独自の検索処理（ナレッジ管理を経由しない検索）を行いたい場合のみ、`Knowledge` インタフェースを自前実装する。**

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

## スキル（`SkillEntry`/`SkillCatalogService`）

スキルは Markdown 形式で定義された知識資産（ツールの使い方・判断基準・手順）。ツールが具体的な操作を実行するのに対し、スキルはその使い方を LLM に伝える。

```java
package jp.co.intra_mart.foundation.copilot.agent.skill;

public interface SkillEntry {
    String getSkillId();
    String getName();        // SKILL.md フロントマターの name
    String getDescription();  // SKILL.md フロントマターの description（LLMの選定材料）
    Map<String, Object> getMetadata();
    String getBody();         // SKILL.md 本文（遅延取得の場合あり）
}
```

```java
package jp.co.intra_mart.system.copilot.agent.skill.service;

public final class SkillCatalogService {
    public static final String SKILLS_ROOT = "im_copilot/agent/skills"; // PublicStorage 上の置き場
    public Map<String, SkillEntry> entriesForRegistry(List<String> selectedIds);
}
```

スキルの置き場は `PublicStorage` の `im_copilot/agent/skills/<skillId>/SKILL.md`。`new SkillCatalogService().entriesForRegistry(skillIds)` で、指定した ID のスキルを `SkillEntry` として解決し（存在しない ID は結果に含まれない。例外にはならない）、`AgentBuilder.skills(entries.values())` で登録する。

## 実行フローへの介入（`AgentExecutionMiddleware`）

Chain of Responsibility パターン。`InvocationContext#getPhase()`（`AgentPhase` 列挙: `EXECUTION`/`ITERATION`/`LLM_CALL`/`TOOL_CALL`/`KNOWLEDGE_SEARCH`/`SKILL_ACCESS`/`QUERY_REWRITE`/`STRUCTURED_OUTPUT`/`COMPACTION`）でフェーズを識別する。

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

- **観測のみ（ログ・メトリクス。fail-open）**: `jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware` を継承し、`before(ctx)`/`after(ctx, scope, result)`/`onError(ctx, scope, error)` をオーバーライドする。観測処理中の例外は内部で握り潰されてログのみ出力され、本体実行（`chain.proceed`）の例外はそのまま再送出される
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
