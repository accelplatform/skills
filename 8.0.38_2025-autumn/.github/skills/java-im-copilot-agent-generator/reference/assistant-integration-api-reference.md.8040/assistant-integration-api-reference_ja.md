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

## プラットフォームへの登録

`@Assistant` クラスはビルド時に自動生成される索引で認識される。アシスタント一覧に表示するには、IM-Authz の許可ポリシーも要る。

### 1. 索引による認識（`AssistantScanPackageFactory` は要らない）

`@Assistant` クラスの完全修飾名は、ビルド時に自動生成される索引 `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant`（ファイル名がアノテーションの完全修飾名）に載り、プラットフォームはこの索引から `@Assistant` クラスを読み込む。`@MCPServer`・組み込みツールの `@Tool` と同じ仕組みで、索引はアノテーションプロセッサ `jp.co.intra_mart.tools:im_service_annotation_processor` が生成する（`im_copilot_core` が `@Assistant` を索引の対象として登録している）。`AssistantScanPackageFactory` の実装と `META-INF/services` への登録は要らない。

### 2. IM-Authz での権限付与（自動インポートされるのはリソースのみ）

`@Assistant` クラスが認識されると、サーバ起動時にテナントごとに、各アシスタントの認可リソースが**自動的にインポート**される。リソースURIの形式は以下の通り。

```
im-copilot-assistant://assistant/<アシスタントID>
```

リソースタイプID: `im-copilot-assistant`、アクション: `execute`。

**リソースのインポートと、そのリソースへの許可ポリシー付与は別物であり、後者は自動化されない。** アシスタント一覧の取得（`CopilotAssistantService#getMetadatas(true)`）は、`listEnable() == true` かつ `AuthorizationClient.authorize(resourceUri, "execute")` が許可（`Permit`）を返したものだけを返す。**IM-Authz の管理画面（または `java-im-authz-usage` スキルが扱う `PolicyManager`）で、対象ユーザ・ロールに対する許可ポリシーを明示的に設定しない限り、アシスタントは認識されていても一覧に表示されない。**

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
- ユーザの発話文字列は `parameter.getMessage().getContents()` から取得する。戻り値は `Object` 型で文字列以外が入る場合があるため、文字列であることを確かめてから使う（独自の `userMessage` 等のフィールドを追加しても、チャットUIはそこに書き込まない）

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
| 画面（Accel Agent）で定義したエージェントを動かす | `doExecute` 内で `AgentManagementService` から公開中の版の `Agent` を読み込み、`run(...)` を呼ぶ。`assets/copilot-agent-basic-usage.md` パターン11 |
| ストリーミング応答が必要 | `getAssistantContext().getResponseWriter()` を使い、`agent.runStreaming(session, message, runContext, handler)` を呼ぶ。`handler` は `StreamingResponseHandler` の実装で、`AssistantResponseWriter` へチャンクを書き込む |
