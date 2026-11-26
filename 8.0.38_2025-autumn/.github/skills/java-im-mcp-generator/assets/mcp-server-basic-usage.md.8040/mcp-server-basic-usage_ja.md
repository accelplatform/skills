# MCP サーバ実装パターン（Java 版）

`jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`/`Tool` を使った実装パターン集。プラットフォーム実クラス（`LogicMcpServer`/`WorkflowMcpServer`/`FrontendFixMcpServer`/`StagedLogsMcpServer`）の実装から抽出した、実際に稼働しているパターンに基づく。属性の正確なシグネチャは `reference/mcp-annotation-api-reference.md` を参照すること。

## クラス構成（推奨レイヤー構造）

プラットフォーム実クラスはいずれも、MCP サーバのエントリポイントクラス（`@MCPServer`）自体にはリクエストの受付・パラメータ変換・JSON 変換のみを持たせ、ビジネスロジックは別クラスに切り出している。

```
XxxMcpServer（@MCPServer。@Tool メソッドの窓口。パラメータを実装クラスへ委譲し、戻り値を変換するだけ）
    ↓
XxxMcpTool{ToolName}（ツール1つにつき1クラス。run(parameter) がビジネスロジック本体）
    ↓
（プラットフォーム API・自プロジェクトの Service/Repository 等）
```

- `.github/instructions/java-naming.instructions.md` に MCP 固有の命名規則はない。本スキルではプラットフォーム実クラスの命名に倣い、エントリポイントクラスに `Xxx` + `McpServer`、ツール実装クラスに `Xxx` + `McpTool` + `{ToolName（パスカルケース）}`、パラメータ DTO に同名 + `Parameter` を用いる
- 単純なツール（ロジックが数行で完結する）であれば、`XxxMcpServer` の `@Tool` メソッド内に直接実装してもよい（`StagedLogsMcpServer`/`FrontendFixMcpServer` のパターン）。ロジックが複雑な場合は実装クラスに分離する（`LogicMcpServer`/`WorkflowMcpServer` のパターン）

## パターン1: 最小構成（1ツール、パラメータ1個）

```java
package jp.co.example.foo.mcp;

import jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer;
import jp.co.intra_mart.foundation.copilot.mcp.annotation.Tool;

@MCPServer(name = "foo-mcp-server", path = "/development/foo", scope = "development")
public class FooMcpServer {

    @Tool(name = "get_foo", title = "Foo Detail", description = "Returns the detailed information of the foo matching the specified id.")
    public String getFoo(final GetFooParameter parameter) {
        return new FooMcpToolGetFoo().run(parameter);
    }
}
```

```java
package jp.co.example.foo.mcp;

import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.StringProperty;

public class GetFooParameter {

    @StringProperty(description = "Foo ID.", required = true)
    private String id;

    public GetFooParameter() {
        super();
    }

    public String getId() {
        return id;
    }

    public void setId(final String id) {
        this.id = id;
    }
}
```

```java
package jp.co.example.foo.mcp;

import com.fasterxml.jackson.databind.ObjectMapper;

public class FooMcpToolGetFoo {

    private static final ObjectMapper JSON = new ObjectMapper();

    public String run(final GetFooParameter parameter) {
        // ビジネスロジック本体（プラットフォーム API 呼び出し等）
        final Foo foo = FooRepository.findById(parameter.getId());
        try {
            return JSON.writeValueAsString(foo);
        } catch (final Exception e) {
            throw new RuntimeException("Failed to serialize response to JSON", e);
        }
    }
}
```

**`SchemaProperties` のアノテーションは Lombok `@Data` を使う場合と、明示的に getter/setter を書く場合の両方で成立する。** Lombok を使わない場合（intra-mart プロジェクトで Lombok 依存が無い場合）は上記のように明示的に getter/setter を書く。

## パターン2: 複数のプロパティ型（String / Integer / Boolean / Array）

```java
package jp.co.example.foo.mcp;

import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.ArrayProperty;
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.BooleanProperty;
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.IntegerProperty;
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.StringProperty;

public class SearchFooParameter {

    @StringProperty(description = "Search keyword.", required = true, enumValues = { "draft", "published" })
    private String status;

    @IntegerProperty(description = "Maximum number of results.", minimum = 1, maximum = 100)
    private int limit;

    @BooleanProperty(description = "Whether to include archived items.")
    private boolean includeArchived;

    @ArrayProperty(description = "Tags to exclude from the search.")
    private String[] excludeTags;

    // getter/setter は省略
}
```

- `enumValues` を指定すると MCP ツールの入力スキーマ上で選択肢が制限される（強制されるかは接続する AI サービス・モデルに依存する）
- `int`/`long` 等のプリミティブ型フィールドには `@IntegerProperty` を、`boolean` には `@BooleanProperty` を使う
- 配列（`String[]`/`List<String>` 等）には `@ArrayProperty` を使う。要素の型ごとの制約（文字列長・パターン等）が必要な場合は `stringItems`/`integerItems`/`numberItems` を指定する（`reference/mcp-annotation-api-reference.md` 参照）

## パターン3: プラットフォームコンテキストの利用（ロケール・ユーザ情報）

MCP ツールの実装からも、通常の Java 実装と同様にプラットフォーム API（`Contexts`/`MessageManager` 等）を呼び出せる。

```java
package jp.co.example.foo.mcp;

import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.AccountContext;
import jp.co.intra_mart.foundation.security.exception.AccessSecurityException;
import jp.co.intra_mart.foundation.security.message.MessageManager;

public class FooMcpToolGetFoo {

    public String run(final GetFooParameter parameter) {
        final AccountContext accountContext = Contexts.get(AccountContext.class);
        final String userCd = accountContext.getUserCd();

        try {
            // ユーザのロケールに応じたメッセージ取得（java-im-message-usage スキル参照）
            final String label = MessageManager.getInstance().getMessage("CAP.Z.APP.FOO.LABEL");
            return label + ": " + userCd;
        } catch (final AccessSecurityException e) {
            throw new IllegalStateException("Failed to resolve message.", e);
        }
    }
}
```

## パターン4: プラットフォームへの登録（`META-INF/im_services/annotation_classes`）

`@MCPServer` クラスは、`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`（ファイル名がアノテーションの完全修飾名そのもの）に完全修飾名が載っていると、プラットフォームに登録される。

このファイルは、ビルド時にアノテーションプロセッサ（`jp.co.intra_mart.tools:im_service_annotation_processor`）が自動生成するので、手で書く必要はない。プロセッサは `im_copilot_mcp` の依存関係（`im_core_base` 経由）でコンパイル時クラスパスに入る。ビルド後、`target/classes`（または jar）に生成され、次のように `@MCPServer` クラスの完全修飾名が載っていることを確かめる。

```
jp.co.example.foo.mcp.FooMcpServer
```

アノテーションプロセッサを止めている（`maven-compiler-plugin` の `<proc>none</proc>` 等）などで生成されない場合に限り、`src/main/resources/META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer` を手で作成し、`@MCPServer` クラスの完全修飾名を1行ずつ書く。この場合は `@MCPServer` クラスを追加するたびに追記が必要で、追記漏れはエンドポイントが 404 になる。

`jp.co.intra_mart.system.copilot.mcp.annotation.McpScanPackageFactory` は非公開 API なので使わない。

## 注意事項

- **登録は `META-INF/im_services/annotation_classes` の索引で行われる（パターン4）。** ビルド後に索引が生成されていることを確かめること
- **同一 `path` を持つ `@MCPServer` クラスを複数作らない。** 後から読み込まれた方が警告ログを出しつつ上書きされる
- **`@Tool` メソッドは引数を1個だけ受け取る。** 複数のパラメータが必要な場合は、それらをまとめた DTO クラス（`SchemaProperties` の各アノテーションをフィールドに付与）を1個受け取る形にする
- **DTO クラスに `SchemaProperties` を付与していないフィールドは、MCP ツールの入力スキーマに公開されない。** getter/setter があっても、対応するアノテーションが無ければ無視される
- `@Tool` メソッドの戻り値は `String`（プラットフォーム実クラスの実装パターンに倣う）。JSON 文字列として返す場合は Jackson `ObjectMapper` 等で明示的にシリアライズする（Web API Maker のような自動ラッピングは無い）
- `im_copilot_mcp` の Maven 依存はバージョンを明示指定すること（`reference/mcp-annotation-api-reference.md` の「依存関係」参照）
