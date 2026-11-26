# MCP サーバ実装 API リファレンス（Java 版）

`im_copilot_mcp` モジュール（`jp.co.intra_mart.foundation.copilot.mcp.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

`im_copilot_mcp` は `im_copilot`（IM-Copilot）モジュールのサブモジュールで、Model Context Protocol（MCP）の Streamable HTTP サーバをアノテーションだけで実装するための機能を提供する。

## 依存関係

```xml
<dependency>
  <groupId>jp.co.intra_mart</groupId>
  <artifactId>im_copilot_mcp</artifactId>
  <version>8.0.5</version>
</dependency>
```

- `im_copilot_mcp` は `im_copilot_core` / `im_copilot_base` に依存する（Maven が自動解決する）
- プロジェクトの親 POM（`jp.co.intra_mart:parent`）のバージョンによっては `im_copilot_mcp` が依存関係管理（`dependencyManagement`）に含まれていない場合がある。その場合は `<version>` を明示指定すること（省略するとバージョン解決に失敗する）
- `im_copilot`（統合アーティファクト、`im_copilot_core`/`im_copilot_mcp`/`im_copilot_agent`/`im_copilot_ui` をまとめたもの）を依存に加えても `im_copilot_mcp` は得られる場合とそうでない場合がある（バージョンによりサブモジュール構成が異なる）。MCP サーバ実装にのみ用途を絞るなら `im_copilot_mcp` を直接依存に追加する方が確実

## URL マッピング

`@MCPServer` を付与したクラスは、以下の URL でアクセス可能になる（Streamable HTTP トランスポート）。

```
<CONTEXT_PATH>/copilot/mcp<path>
```

`<path>` は `@MCPServer.path()` の値そのもの。例えば `path = "/development/im_logic"` の場合、`http://<HOST>:<PORT>/<CONTEXT_PATH>/copilot/mcp/development/im_logic` でアクセスする。

## `@MCPServer`（クラスアノテーション）

```java
package jp.co.intra_mart.foundation.copilot.mcp.annotation;

public @interface MCPServer {
    String description() default ...;
    Icon[] icons() default ...;
    String instructions() default ...;
    String name();
    String path();
    String scope();
    String title() default ...;
    String version() default ...;
    String websiteUrl() default ...;
}
```

MCP サーバのエントリポイントとなるクラスに付与する。実プラットフォームコード（`LogicMcpServer`/`WorkflowMcpServer`/`FrontendFixMcpServer`/`StagedLogsMcpServer`）では `name`/`path`/`scope` の3属性のみを指定している。

- `name`: MCP サーバの識別名（例: `"im-logic-mcp-server"`）
- `path`: URL マッピングに使うパス（`/development/...` 形式。上記「URL マッピング」参照）
- `scope`: 実プラットフォームコードの実例はすべて `"development"` を指定している
- `description`/`title`/`instructions`/`version`/`websiteUrl`/`icons`: MCP サーバのメタデータ（クライアント側の表示・LLMへのシステム指示等に使われると推測されるが、実プラットフォームコードでの使用例は無い）

**同一 `path` を持つ複数の `@MCPServer` クラスが存在する場合、後から読み込まれた方は登録時に警告ログを出力し上書きされる。** `path` はプロジェクト内で重複しないよう設計すること。

## `@Tool`（メソッドアノテーション）

```java
package jp.co.intra_mart.foundation.copilot.mcp.annotation;

public @interface Tool {
    ToolMetadata[] _meta() default ...;
    String description() default ...;
    Icon[] icons() default ...;
    String name();
    Class<?> outputSchema() default ...;
    jp.co.intra_mart.foundation.copilot.mcp.model.task.TaskSupportMode taskSupport() default ...;
    String title() default ...;
}
```

`@MCPServer` クラスの `public` メソッドに付与する。1メソッド = 1 MCP ツール。

- `name`: ツール名（MCP クライアント・LLM から見えるツール識別子。実プラットフォームコードでは `snake_case` を使用: `get_mapping_function` 等）
- `title`: 人間向けの表示名
- `description`: ツールの説明（LLM がツール選択の判断に使う。詳細かつ具体的に書くこと。実プラットフォームコードでは英語で記述されている）
- `outputSchema`/`_meta`/`taskSupport`/`icons`: 実プラットフォームコードでの使用例は無い

### メソッドシグネチャ

```java
@Tool(name = "...", title = "...", description = "...")
public <戻り値型> <メソッド名>(final <パラメータDTO型> parameter) {
    ...
}
```

- 引数は 1 個。リクエストパラメータを表す DTO クラス（`SchemaProperties` の各アノテーションをフィールドに付与したクラス。後述）を受け取る
- 戻り値型は実プラットフォームコードではすべて `String` を返している。JSON 文字列（Jackson `ObjectMapper` で手動シリアライズ）を返す実装と、プレーンテキストをそのまま返す実装の両方が存在する（`assets/mcp-server-basic-usage.md` を参照）

## パラメータ DTO とプロパティアノテーション

リクエストパラメータ DTO クラスは、フィールドに `jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties` 配下のアノテーションを付与して定義する。DTO クラス自体には getter/setter（または Lombok `@Data`）が必要。

```java
package jp.co.intra_mart.foundation.copilot.tool.annotation;

public final class SchemaProperties {
    public @interface StringProperty {
        String description() default "";
        String[] enumValues() default {};
        String format() default "";
        int maxLength() default -1;
        int minLength() default -1;
        String name() default "";
        String pattern() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface IntegerProperty {
        String description() default "";
        int[] enumValues() default {};
        double exclusiveMaximum() default Double.POSITIVE_INFINITY;
        double exclusiveMinimum() default Double.NEGATIVE_INFINITY;
        double maximum() default Double.POSITIVE_INFINITY;
        double minimum() default Double.NEGATIVE_INFINITY;
        String name() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface NumberProperty {
        String description() default "";
        double[] enumValues() default {};
        double exclusiveMaximum() default Double.POSITIVE_INFINITY;
        double exclusiveMinimum() default Double.NEGATIVE_INFINITY;
        double maximum() default Double.POSITIVE_INFINITY;
        double minimum() default Double.NEGATIVE_INFINITY;
        String name() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface BooleanProperty {
        String description() default "";
        String name() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface EnumProperty {
        String description() default "";
        String name() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface ObjectProperty {
        String description() default "";
        String name() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface ArrayProperty {
        SchemaArrayItemProperties.ItemArrayProperty arrayItems() default ...;
        String description() default "";
        SchemaArrayItemProperties.ItemIntegerProperty integerItems() default ...;
        int maxItems() default -1;
        int minItems() default -1;
        String name() default "";
        SchemaArrayItemProperties.ItemNumberProperty numberItems() default ...;
        boolean required() default false;
        SchemaArrayItemProperties.ItemStringProperty stringItems() default ...;
        String summary() default "";
    }
}
```

- `name`: JSON/MCP 上のプロパティ名をフィールド名と変えたい場合に指定する（省略時はフィールド名をそのまま使用）
- `required`: MCP ツールの入力スキーマ上、必須項目として公開するかどうか
- `description`: LLM がパラメータの用途を理解するために使う。具体的に書くこと
- `summary`: Copilot エージェントの組み込みツールの管理画面で、入力パラメータの説明として表示される（MCP ツールの入力スキーマには含まれない）。メッセージキーを指定すると、ロケールに応じたメッセージで表示される（キーでなければ書いた文字列のまま表示される）
- 数値系（`IntegerProperty`/`NumberProperty`）は `minimum`/`maximum`（境界値を含む）と `exclusiveMinimum`/`exclusiveMaximum`（境界値を含まない）の両方を持つ
- `ArrayProperty` は配列要素の型ごとに `stringItems`/`integerItems`/`numberItems`/`arrayItems`（2次元配列）で制約を指定する。各 `Item*Property` は `SchemaArrayItemProperties` 配下（`name`/`description`/`required` を持たない。要素自体には名前や必須フラグの概念が無いため）

### `SchemaArrayItemProperties`（配列要素の制約）

```java
package jp.co.intra_mart.foundation.copilot.tool.annotation;

public final class SchemaArrayItemProperties {
    public @interface ItemStringProperty {
        String[] enumValues() default {};
        String format() default "";
        int maxLength() default -1;
        int minLength() default -1;
        String pattern() default "";
    }

    public @interface ItemIntegerProperty {
        int[] enumValues() default {};
        double exclusiveMaximum() default Double.POSITIVE_INFINITY;
        double exclusiveMinimum() default Double.NEGATIVE_INFINITY;
        double maximum() default Double.POSITIVE_INFINITY;
        double minimum() default Double.NEGATIVE_INFINITY;
    }

    public @interface ItemNumberProperty {
        double[] enumValues() default {};
        double exclusiveMaximum() default Double.POSITIVE_INFINITY;
        double exclusiveMinimum() default Double.NEGATIVE_INFINITY;
        double maximum() default Double.POSITIVE_INFINITY;
        double minimum() default Double.NEGATIVE_INFINITY;
    }

    public @interface ItemArrayProperty {
        ItemIntegerProperty integerItems() default ...;
        int maxItems() default -1;
        int minItems() default -1;
        ItemNumberProperty numberItems() default ...;
        ItemStringProperty stringItems() default ...;
    }
}
```

**注意（`SchemaProperties` javadoc より）**: 「アノテーションでは制約を指定できますが、制約の適用可否は AI サービス・モデルによって異なります。」— `minLength`/`pattern`/`enumValues` 等の制約は JSON スキーマとして MCP クライアントに公開されるが、実際に強制されるかどうかは接続する AI サービス・モデルの実装に依存する。

## MCP サーバの登録（プラットフォームへの認識）

`@MCPServer` クラスは、`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`（ファイル名自体がアノテーションの完全修飾名）に完全修飾名が載っていると、プラットフォームに登録される。載っていない `path` へのリクエストは 404 になる。

```
jp.co.intra_mart.sample.example.mcp.SampleMcpServer
```

- このファイルは、ビルド時にアノテーションプロセッサ `jp.co.intra_mart.tools:im_service_annotation_processor`（`javax.annotation.processing.Processor` SPI）が自動生成する。`im_copilot_mcp` が `META-INF/im_services/annotations` に `jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer` を登録しているため、`@MCPServer` を付けたクラスが索引に載る
- プロセッサは `im_core_base` の依存関係（compile スコープ）に含まれ、`im_copilot_mcp` だけに依存するプロジェクトでも推移的にコンパイル時クラスパスに入る（`im_copilot_mcp` → `im_copilot_core` → `im_master` → … → `im_core_base`）
- アノテーションプロセッサを止めている（`maven-compiler-plugin` の `<proc>none</proc>` 等）などで生成されない場合は、`src/main/resources` 配下に同じファイルを手で作成し、完全修飾名を1行ずつ書く。この場合は `@MCPServer` クラスを追加するたびに追記が必要
- 索引を読み込む仕組み（`WebAppClassScanner#findClassesWithAnnotation`）は `@MCPServer` 専用ではなく、他のアノテーションの走査でも共通で使われる
- `jp.co.intra_mart.system.copilot.mcp.annotation.McpScanPackageFactory`（`META-INF/services` で登録するパッケージ指定）は非公開 API なので使わない

## `@Resource` / `@Prompt` / `@Completion`（Tool 以外の MCP プリミティブ）

`@MCPServer` クラスのメソッドには `@Tool` 以外に `@Resource`（リソース定義）・`@Prompt`（プロンプトテンプレート定義）を付与でき、`@MCPServer` の初期化処理はメソッドごとに `@Prompt` → `@Resource` の順で判定した上で対応する MCP プリミティブとして登録する（`@Completion` は `@Resource`/`@Prompt` の補完候補提供に使う）。属性は以下のとおり。

```java
package jp.co.intra_mart.foundation.copilot.mcp.annotation;

public @interface Resource {
    Annotations[] annotations() default ...;
    String description() default "";
    Icon[] icons() default ...;
    String mimeType() default "";
    String name();
    long size() default ...;
    String title() default "";
    String uri();
}

public @interface Prompt {
    PromptArgument[] arguments() default ...;
    String description() default "";
    Icon[] icons() default ...;
    String name();
    String title() default "";
}

public @interface PromptArgument {
    String description() default "";
    String name();
    boolean required() default false;
    String title() default "";
}

public @interface Completion {
    String prompt() default "";
    String resource() default "";
}

public @interface Annotations {
    jp.co.intra_mart.foundation.copilot.mcp.model.Role[] audience() default ...;
    String lastModified() default "";
    double priority() default ...;
}

public @interface Icon {
    String mimeType() default "";
    String[] sizes() default {};
    String src();
}
```

実プラットフォームコード（`LogicMcpServer`/`WorkflowMcpServer`/`FrontendFixMcpServer`/`StagedLogsMcpServer`）はいずれも `@Tool` のみを使用しており、`@Resource`/`@Prompt`/`@Completion` の実装例は確認できていない。属性シグネチャは実クラス定義（バイトコード）に基づく確実な情報だが、具体的な実装パターンは `assets/mcp-server-basic-usage.md` の対象外とする。
