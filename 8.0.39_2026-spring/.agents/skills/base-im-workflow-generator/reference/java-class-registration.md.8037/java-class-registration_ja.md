# Java クラス実行（JavaEE 開発モデル）を登録する場合

## 概要

IM-Workflow の各種プラグイン拡張ポイント（アクション処理・到達処理・案件開始/終了処理・分岐/結合条件・各種リスナー等）は、`plugins[].parameter` に **実行対象のパスまたはクラス名** を設定することで、2種類の実行方式のどちらでも登録できる。

| 実行方式 | `parameter` の値 | `pluginId` サフィックス | 実装スキル |
|---------|------------------|----------------------|-----------|
| スクリプト実行（JSSP / スクリプト開発モデル） | JSSP ファイルパス（拡張子なし） | `.pluginScriptExecutor` | `jssp-im-workflow-usage` |
| **Java クラス実行（JavaEE 開発モデル）** | **実装クラスの完全修飾名（FQCN）** | **`.pluginJavaExecutor`** | `java-im-workflow-usage` |

`exPointId` 自体は実行方式によらず共通。`pluginId` は `{exPointId}.pluginScriptExecutor` / `{exPointId}.pluginJavaExecutor` の単純な組み合わせで、それ以外の構造上の差分はない（`build-workflow.js` はこの規則に従って両方を出力できる）。

この `.pluginJavaExecutor` 規則は、`im_workflow_core` の各拡張ポイントに対応する `Xxx**JavaExecutorEvent**` ブリッジクラス（例: `ActionProcessJavaExecutorEvent` / `ArriveProcessJavaExecutorEvent` / `MatterEndProcessJavaExecutorEvent` / `MatterStartProcessJavaExecutorEvent` / `MatterArchiveProcessJavaExecutorEvent` / `ActiveMatterDeleteProcessJavaExecutorEvent` 等 / `RuleConditionJavaExecutorEvent`）が、対応する `WorkflowXxxProcessEventListener` / `WorkflowRuleConditionEventListener` を継承する形でプラットフォーム本体に実装されていることから、下表の全拡張ポイントで共通の仕組みであることが裏付けられている。`exPointId` の値自体は `jp.co.intra_mart.system.workflow.engine.common.ExtensionPointConstants` に定数として定義されている。

**「処理対象者プラグイン」（申請/承認者を動的に決定するカスタムプラグイン）は対象外。** この規則が扱う拡張ポイント（`EVENT_*`）とは別の枠組み（`plugin.xml` によるプラグイン登録）を使う。詳細は本ファイル末尾の「処理対象者プラグイン（カスタム実装）の登録」を参照。

## `spec.json` での指定方法

`actionProcess` を使うノード、および `matterEndProcess` は、実装方式を選べる（`build-workflow.js` が対応済み）。

```jsonc
{
  "nodes": [
    {
      "id": "01", "type": "approve", "name": "Manager",
      "actionProcess": "jp.co.intra_mart.sample.leave.workflow.action.LeaveActionProcess",
      "actionProcessImpl": "java"   // "java" | "jssp"（省略時 "jssp"）
    }
  ],
  "matterEndProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveMatterEndProcess",
  "matterEndProcessImpl": "java"    // "java" | "jssp"（省略時 "jssp"）
}
```

- `actionProcessImpl` / `matterEndProcessImpl` が `"java"` の場合、対応する `actionProcess` / `matterEndProcess` の値には **JSSP ファイルパスではなく実装クラスの FQCN** を指定する（実装は `java-im-workflow-usage` スキルで生成する）
- 省略時（`"jssp"`）は従来どおりスクリプト実行として出力される
- 到達処理（`arriveProcess`）も同じパターンで自動生成できる。詳細は `reference/lifecycle-plugin-fields.md` を参照
- 分岐条件・結合条件（`branchMethod: "program"` のユーザプログラム方式）は、ノード種別コードは出力されるが、対応するプラグインの登録は `build-workflow.js` 未対応（下記「XML サンプル」を参考に手動で追記するか、IM-Workflow 管理画面のノード編集画面で Java クラス実行として登録する）

## `pluginId`（`.pluginJavaExecutor`）一覧

| 処理 | exPointId | pluginId | `java-im-workflow-usage` の実装先 |
|------|-----------|---------------------|----------------------------------|
| 案件開始拡張処理 | `jp.co.intra_mart.workflow.plugin.event.matter.start.process` | `jp.co.intra_mart.workflow.plugin.event.matter.start.process.pluginJavaExecutor` | `assets/matter-start-process.md` |
| 案件終了拡張処理（トランザクションあり） | `jp.co.intra_mart.workflow.plugin.event.matter.end.process` | `jp.co.intra_mart.workflow.plugin.event.matter.end.process.pluginJavaExecutor` | `assets/matter-end-process.md` |
| アクション処理 | `jp.co.intra_mart.workflow.plugin.event.node.action.process` | `jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginJavaExecutor` | `assets/action-process.md` |
| 到達処理 | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process` | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process.pluginJavaExecutor` | `assets/arrive-process.md` |
| 分岐条件 | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginJavaExecutor` | `assets/rule-condition.md` |
| 結合条件 | `jp.co.intra_mart.workflow.plugin.event.node.union.rule` | `jp.co.intra_mart.workflow.plugin.event.node.union.rule.pluginJavaExecutor` | `assets/rule-condition.md` |
| 未完了案件削除 | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 完了案件削除 | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 過去案件削除 | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 案件退避処理 | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process.pluginJavaExecutor` | `assets/matter-archive-listener.md` |

分岐条件・結合条件はいずれも `RuleConditionJavaExecutorEvent`（`WorkflowRuleConditionEventListener` 継承）が処理を仲介する共通の仕組みで、登録先の `exPointId`（`node.branch.rule` / `node.union.rule`）だけが異なる。`java-im-workflow-usage` 側の実装クラス（`RuleConditionEventListener` 継承）も両者で共通のものを使い、登録側でどちらの拡張ポイントに割り当てるかを切り替える。

**重要な副次的発見:** 案件終了拡張処理の `exPointId` に関する本スキルの過去の記載の誤り（`jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process` という存在しない ID を使用していた）を修正済み（正: `jp.co.intra_mart.workflow.plugin.event.matter.end.process`、トランザクションなし版は `jp.co.intra_mart.workflow.plugin.event.matter.end_no_transaction.process`）。`build-workflow.js` / `reference/xml-structure.md` / `reference/im_workflow-import.xsd` を含め修正済み。

## XML サンプル

```xml
<!-- JSSP 実行版 -->
<value type="object">
  <contentsPluginId type="string">{{contentsPluginId}}</contentsPluginId>
  <localeId type="string">{{localeId}}</localeId>
  <contentsId type="string">{{contentsId}}</contentsId>
  <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
  <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process</exPointId>
  <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginScriptExecutor</pluginId>
  <pluginName type="string">action_process</pluginName>
  <parameter type="string">sample/leave/workflow/action/action_process</parameter>
  <nodeType type="string">2</nodeType>
  <defaultFlag type="string">1</defaultFlag>
  <executeOrder type="string">0</executeOrder>
  <note type="string" />
</value>

<!-- Java クラス実行版（parameter が FQCN になる） -->
<value type="object">
  <contentsPluginId type="string">{{contentsPluginId}}</contentsPluginId>
  <localeId type="string">{{localeId}}</localeId>
  <contentsId type="string">{{contentsId}}</contentsId>
  <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
  <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process</exPointId>
  <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginJavaExecutor</pluginId>
  <pluginName type="string">action_process</pluginName>
  <parameter type="string">jp.co.intra_mart.sample.leave.workflow.action.LeaveActionProcess</parameter>
  <nodeType type="string">2</nodeType>
  <defaultFlag type="string">1</defaultFlag>
  <executeOrder type="string">0</executeOrder>
  <note type="string" />
</value>
```

分岐条件・結合条件・到達処理も `exPointId` / `pluginId` を上表の値に差し替えれば同じ構造で登録できる（`nodeType` はノード種別に応じた値を設定する）。

## 処理対象者プラグイン（カスタム実装）の登録

処理対象者プラグイン（申請者・承認者・確認者等を動的に決定するカスタムプラグイン。`java-im-workflow-usage/assets/authority-exec-listener.md` が実装を担当）は、本ファイルが扱う `EVENT_*` 系の拡張ポイント（ワークフロー定義インポート XML の `plugins[]` に `exPointId`/`pluginId`/`parameter` を直接書く方式）とは **別の枠組み** を使う。

IM-Workflow プログラミングガイド「9.2. 処理対象者プラグインの作成」によると、処理対象者プラグインは `plugin.xml`（`PluginManager` が管理する OSGi 的な拡張登録ファイル）で登録する。ワークフロー定義のインポート XML 側では、この `plugin.xml` で登録した拡張の **ID をサフィックスとして** 参照するのみで、`.pluginJavaExecutor` という共通サフィックスは使わない。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plugin>
    <extension point="jp.co.intra_mart.workflow.plugin.authority.node.approve">
        <authority
            id="jp.co.intra_mart.sample.workflow.purchase.plugin.authority.node.approve.item_total.javaee"
            name="%jp.co.intra_mart.sample.workflow.purchase.plugin.authority.node.approve.item_total.javaee"
            version="8.0.99"
            rank="920"
            enable="true">
            <configPage>
                <javaee applicationId="imw_sample_purchase" serviceId="authority_item_total">
                    <parameter key="pluginName" value="SAMPLE.IMW.CAP.031" />
                </javaee>
            </configPage>
            <extend>
                <java class="jp.co.intra_mart.sample.workflow.purchase.plugin.authority.item_total.WorkflowAuthorityExecEventListener" />
            </extend>
        </authority>
    </extension>
</plugin>
```

- `<extension point="...">` には登録先の拡張ポイント（`jp.co.intra_mart.workflow.plugin.authority.node.apply` / `.approve` / `.approve.static` / `.confirm` 等。`reference/authority-plugins.md` 冒頭の「拡張ポイント一覧」参照）を指定する
- `<authority id="...">` がこのプラグイン自体の一意な ID。ワークフロー定義側では、承認者指定の `pluginId` にこの ID の末尾（拡張ポイント ID を除いた部分）をサフィックスとして連結する（`reference/authority-plugins.md` のサフィックス方式と同じ考え方）
- `<extend><java class="FQCN" /></extend>` に `IWorkflowAuthorityExecEventListener` 実装クラスの FQCN を指定する（`extend/java/class` は `im_workflow_core` の `ExtensionPointConstants.XPATH_OF_JAVA_FILE` としてプラットフォーム側にも定義されている）
- `<configPage>` は、ルート定義画面の処理対象者一覧でこのプラグインを選択した際に呼び出される設定画面。JavaEE 版は `<javaee applicationId="..." serviceId="..." />`、スクリプト版は `<script pagePath="..." />` で指定する。**省略不可**（このプラグインをルート定義画面で選択するための入口になる）
- `configPage` の実装（サービス実装クラス、または JSSP ページ）は `java-im-workflow-usage` の対象範囲外（画面部分は現状 JSSP 側に倣う想定）

**インデントは半角スペース2個で統一する。** 上記のコード例は公式ガイドの記載をそのまま引用しているため4個になっているが、本プロジェクトで新規作成する `plugin.xml` は2スペースインデントで統一すること（`routing-jssp-config` 等、本プロジェクトの他の XML 設定ファイルと揃える）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plugin>
  <extension point="jp.co.intra_mart.workflow.plugin.authority.node.approve">
    <authority
      id="jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.authority.node.approve.verify.javaee"
      name="%jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.authority.node.approve.verify.javaee"
      version="0.1.0"
      rank="920"
      enable="true">
      <configPage>
        <script pagePath="sample/java_ext_verify/workflow/plugin/authority/verify/verifyConfig">
          <parameter key="pluginName" value="SAMPLE.JAVA_EXT_VERIFY.CAP.001" />
        </script>
      </configPage>
      <extend>
        <java class="jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.VerifyAuthorityExecListener" />
      </extend>
    </authority>
  </extension>
</plugin>
```

### plugin.xml の配置場所（重要）

`plugin.xml` は `PluginManager`（`im_plugin_base` モジュール）が `WEB-INF/plugin/` 配下を走査して読み込む。**`WEB-INF/plugin/` 直下に `plugin.xml` を直接置いても認識されない。** `PluginManager` は `WEB-INF/plugin/` 直下の**サブディレクトリを1つずつ列挙し、各サブディレクトリの直下**から `plugin.xml` を探す実装になっているため、必ずサブディレクトリの中に配置する。サブディレクトリ名は任意（プラグイン単位で自由に決めてよい）。

```
WEB-INF/plugin/<任意のディレクトリ名>/plugin.xml   ← 正しい（ソースは src/main/plugin/<任意のディレクトリ名>/plugin.xml）
WEB-INF/plugin/plugin.xml                          ← 誤り（サブディレクトリが無いため PluginManager のスキャン対象に入らない）
```

配置先ディレクトリ名は、プラグインの拡張ポイント ID や機能名を使うと分かりやすい（公式サンプルは拡張ポイント ID をそのままディレクトリ名にしている）。

`plugin.xml` の変更は、`PluginManager` がプラグイン構成をアプリケーション起動時に読み込むため、**反映にはサーバの再起動が必要**（JSSP のようなホットデプロイでは反映されない）。

### 表示名の多言語化（plugin.properties）

`<authority name="...">` に `%` で始まる値（例: `%jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.authority.node.approve.verify.javaee`）を指定した場合、それはプロパティファイルへの**リソースキー参照**であり、対応する `.properties` ファイルにキーと表示名のペアを定義しないと、`%` 付きの生の文字列がそのまま画面に表示される。

`plugin.xml` と**同じディレクトリ**に、以下のファイルを配置する（`PluginManager` の Javadoc に基づく）。

```
WEB-INF/plugin/<plugin.xml と同じディレクトリ>/plugin.properties       # デフォルト（ロケール未指定時のフォールバック）
WEB-INF/plugin/<plugin.xml と同じディレクトリ>/plugin_ja.properties    # 日本語
WEB-INF/plugin/<plugin.xml と同じディレクトリ>/plugin_en.properties    # 英語
WEB-INF/plugin/<plugin.xml と同じディレクトリ>/plugin_zh_CN.properties # 中国語簡体字
```

ファイル名は固定で `plugin`（`plugin.properties` の `EXT_PROPERTIES` 部分より前）から始まり、`_<ロケール>` を付与したものがロケール別ファイルとして認識される（`PluginManager` の `LOCALE_REGEXP` = `_(.*)\.properties` による判定）。中身は通常の Java プロパティファイル形式で、`<authority name="...">` に指定したキー（`%` を除いた部分）をキーとして表示名を値に設定する。

**`java.util.Properties` は ISO-8859-1 として読み込むため、日本語・中国語等の非 ASCII 文字を UTF-8 の生文字で書くと文字化けする。`\uXXXX` 形式の Unicode エスケープ（native2ascii 相当）で記述すること。**

```properties
# plugin_ja.properties（「検証用処理対象者プラグイン」を Unicode エスケープした例）
jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.authority.node.approve.verify.javaee=\u691c\u8a3c\u7528\u51e6\u7406\u5bfe\u8c61\u8005\u30d7\u30e9\u30b0\u30a4\u30f3
```

`plugin.xml` と同様、変更の反映にはサーバの再起動が必要。
