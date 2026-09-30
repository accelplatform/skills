# Assistant フレームワーク連携 API リファレンス（Java 版）

`im_copilot_core` モジュール（`jp.co.intra_mart.foundation.copilot.assistant.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

`Agent`/`AgentBuilder` は素の Java API であり、単独でも Web API Maker のエンドポイントやジョブから直接利用できる（`reference/agent-core-api-reference.md` 参照）。**IM-Copilot のチャットUI（スレッド管理・メッセージ履歴の永続化・ストリーミング応答）と連携させたい場合にのみ**、本リファレンスの Assistant フレームワークでラップする。

## `@Assistant` アノテーション

```java
package jp.co.intra_mart.foundation.copilot.assistant.annotation;

public @interface Assistant {
    String id();     // 必須（既定値なし）
    String name();   // 必須（既定値なし）
    String description() default "";
    AssistantType type() default AssistantType.STANDARD;
    boolean listEnable() default false;
    boolean storeMessage() default false;
    Class<? extends MetadataFactory> metadataFactory() default StandardMetadataFactory.class;
}
```

```java
package jp.co.intra_mart.foundation.copilot.assistant;

public enum AssistantType { STANDARD, USER_DEFINITION }
```

- `id`/`name`: 必須（既定値なし）。`id` はアシスタントの一意識別子
- `type`: `STANDARD`（プラットフォーム標準アシスタント）/`USER_DEFINITION`（ユーザ定義）。省略時は `STANDARD`
- `listEnable`: アシスタント一覧UIへの表示可否。省略時は `false`
- `storeMessage`: メッセージ履歴を永続化するかどうか。省略時は `false`
- `metadataFactory`: 省略可（既定は `StandardMetadataFactory`）

## プラットフォームへの登録（`@Assistant` を付与しただけでは認識されない）

`@Assistant` を付与しただけではプラットフォームに認識されず、アシスタント一覧にも表示されない。以下の両方が必須である。

### 1. `AssistantScanPackageFactory`（クラスパススキャン対象の登録）

```java
package jp.co.intra_mart.foundation.copilot.assistant;

public interface AssistantScanPackageFactory {
    Collection<String> getTargetPackages();
}
```

プラットフォーム内部の `AssistantAnnotationLoader`（`jp.co.intra_mart.system.copilot.assistant.impl`）は、`ServiceLoaderUtil.loadPriority(AssistantScanPackageFactory.class)` で登録済みの全実装から対象パッケージを集約し、`WebAppClassScanner.findClassesWithAnnotation(Assistant.class, scanPackages)` で `@Assistant` クラスを探索する（MCP サーバの `McpScanPackageFactory` と同一の設計）。`@Assistant` クラスを含むパッケージを `getTargetPackages()` で返す実装クラスを作成し、`META-INF/services/jp.co.intra_mart.foundation.copilot.assistant.AssistantScanPackageFactory` に完全修飾名を1行で登録する。

**この結果は `StandardAssistantMetadataRepository`（`jp.co.intra_mart.system.copilot.assistant.metadata`）の `static` フィールドに、クラス初回ロード時（実質的にサーバ起動時）に一度だけキャッシュされる。** 登録後にアシスタントが反映されない場合、アプリケーションの再デプロイだけでなく、プラットフォームサーバの再起動が必要になることがある。

### 2. IM-Authz での権限付与（自動インポートされるのはリソースのみ）

`@Assistant` クラスがスキャンされると、`CopilotAssistantResourceInitializer`（`jp.co.intra_mart.system.copilot.assistant.auth.importer`、`ApplicationInitializer`）がサーバ起動時にテナントごと実行され、各アシスタントの認可リソースを**自動的にインポート**する。リソースURIの形式は以下の通り（`CopilotAssistantResourceType`）。

```
im-copilot-assistant://assistant/<アシスタントID>
```

リソースタイプID: `im-copilot-assistant`、アクション: `execute`。

**リソースのインポートと、そのリソースへの許可ポリシー付与は別物であり、後者は自動化されない。** アシスタント一覧の取得（`CopilotAssistantService#getMetadatas(true)`）は、`listEnable() == true` かつ `AuthorizationClient.authorize(resourceUri, "execute")` が許可（`Permit`）を返したものだけを返す。**IM-Authz の管理画面（または `java-im-authz-usage` スキルが扱う `PolicyManager`）で、対象ユーザ・ロールに対する許可ポリシーを明示的に設定しない限り、アシスタントはスキャンされていても一覧に表示されない。**

## `AbstractCopilotAssistant<T>`

```java
package jp.co.intra_mart.foundation.copilot.assistant;

public abstract class AbstractCopilotAssistant<T> implements CopilotAssistant<T> {
    public AssistantResult execute(T parameter) throws CopilotAssistantException; // 最終的に doExecute を呼ぶ
    protected abstract AssistantResult doExecute(T parameter) throws CopilotAssistantException; // サブクラスが実装

    public AssistantContext getAssistantContext();
    public void setAssistantContext(AssistantContext context);
    public boolean isAvailable(DriverInfo driverInfo);

    protected Collection<AssistantMessage> getMessageHistory() throws CopilotAssistantException;
    protected Collection<AssistantMessage> getMessageHistory(int limit) throws CopilotAssistantException;
    protected void preprocessing(T parameter) throws CopilotAssistantException; // 既定は何もしない
    protected void postprocessing(T parameter, AssistantResult result); // 既定は何もしない
}
```

`@Assistant` を付与したサブクラスで `doExecute(T parameter)` を実装する。`T` は `AssistantParameter` 自身、またはそのサブクラスでなければならない（詳細は次項）。

## `AssistantParameter`（パラメータクラス `T` の必須契約）

```java
package jp.co.intra_mart.foundation.copilot.assistant.model;

public class AssistantParameter {
    private AssistantMessage message; // required = true
    private String threadId;          // required = false
    // Lombok @Data により getter/setter が自動生成される
}
```

`AbstractCopilotAssistant<T>.preprocessing()` は最初に `AssistantParameterParser.get(parameter)` を呼び、登録済みの2種類のパーサ（`StandardAssistantParameterParser`: `parameter instanceof AssistantParameter`、`MapAssistantParameterParser`: `parameter instanceof Map`）のいずれかが対応できるかを判定する。**独自のフィールドだけを持つ非互換な POJO（`AssistantParameter` を継承しない、`Map` でもないクラス）を `T` に指定すると、どちらのパーサにも一致せず実行時に `IllegalStateException` になる。**

さらに、チャットUI側の入力欄は `StandardMetadataFactory` が `T` のBean プロパティをリフレクションで走査して構築するスキーマ（`AssistantMetadata.getParameter()`）を元に組み立てられる。`AssistantParameter`（またはそのサブクラス）が持つ `message`（`AssistantMessage` 型。ユーザの発話は `message.contents` に入る）というプロパティ名・構造は、チャットUIが送信メッセージの入力欄を対応付けるために必要な、プラットフォーム側で固定された契約である。**この契約に従わないパラメータクラスでは、アシスタント一覧には表示されてもプロンプトを入力できない状態になる。**

- 追加のパラメータが不要な場合は `AssistantParameter` をそのまま `T` として使ってよい
- 追加のパラメータが必要な場合は `AssistantParameter` を**継承**し、`@Property`（`jp.co.intra_mart.foundation.copilot.assistant.annotation.Property`）を付与した追加フィールドのみを持たせる。継承元の `message`/`threadId` は再定義しない
- ユーザの発話文字列は `parameter.getMessage().getContents()` から取得する（独自の `userMessage` 等のフィールドを追加しても、チャットUIはそこに書き込まない）

## `AssistantMessage`/`AssistantResult`

```java
package jp.co.intra_mart.foundation.copilot.assistant.message;

public class AssistantMessage implements java.io.Serializable {
    public AssistantMessage(String role, Object contents);
    public AssistantMessage(String role, Object contents, List<ToolCall> toolCalls, List<? extends Serializable> additional);
    public String getRole();
    public Object getContents();
    // 他 getter/setter
}
```

```java
package jp.co.intra_mart.foundation.copilot.assistant.model;

public class AssistantResult {
    public AssistantResult(String id, String finishReason, AssistantMessage message);
    public static AssistantResult.AssistantResultBuilder builder();
    public String getId();
    public String getFinishReason();
    public AssistantMessage getMessage();
}
```

`AssistantResult.builder().message(new AssistantMessage("assistant", content)).finishReason(finishReason).build()` が基本形。ビルダーの `message(String)` オーバーロードは `role` を `"assistant"` として `AssistantMessage` を組み立てる簡易版。

## `AssistantResponseWriter`（ストリーミング応答）

```java
package jp.co.intra_mart.foundation.copilot.assistant.response;

public interface AssistantResponseWriter extends AutoCloseable {
    <T extends java.io.Serializable> void writeObject(T object) throws CopilotAssistantException;
    void writeResponse(AssistantResult result) throws CopilotAssistantException;
    void close() throws java.io.IOException;
}
```

ストリーミング応答を返す場合、`getAssistantContext().getResponseWriter()` で取得した `AssistantResponseWriter` を `Agent.runStreaming(...)` の `StreamingResponseHandler` 実装に渡し、チャンクごとに `writeObject`/`writeResponse` で書き込む。`doExecute` はこの場合 `null` を返し、実際の結果は `AssistantResponseWriter` 経由でクライアントへ送信される。

## 実装パターンの選択

| 要件 | 実装方針 |
|---|---|
| コード側で固定的に組み立てたエージェント（モデル・インストラクション・ツールが実装時点で決まっている） | `doExecute` 内で毎回 `Agent.builder()...build()` し、`run(...)`（同期）を呼ぶ。`assets/copilot-agent-basic-usage.md` パターン8 |
| Agent Designer 等でユーザが定義したエージェント定義（JSON）を動的に読み込む | プラットフォーム標準の `AgentDefinitionConverter.fromDefinitionData(...)`（`jp.co.intra_mart.system.copilot.agent.definition.converter`）でエージェント定義データから `Agent` を構築する。この経路は Agent Designer の「試し実行」機能（`AgentTrialRunAssistant`）が使う特殊なパターンであり、通常のアプリケーション開発では前者（固定構成）で十分なことが多い |
| ストリーミング応答が必要 | `getAssistantContext().getResponseWriter()` を使い、`agent.runStreaming(session, message, runContext, handler)` を呼ぶ。`handler` は `StreamingResponseHandler` の実装で、`AssistantResponseWriter` へチャンクを書き込む |
