# Java クラス実行（JavaEE 開発モデル）を登録する場合

## 概要

IM-Workflow の各種プラグイン拡張ポイント（アクション処理・到達処理・案件開始/終了処理・分岐/結合条件・各種リスナー等）は、`plugins[].parameter` に **実行対象のパスまたはクラス名** を設定することで、2種類の実行方式のどちらでも登録できる。

| 実行方式 | `parameter` の値 | `pluginId` サフィックス | 実装スキル |
|---------|------------------|----------------------|-----------|
| スクリプト実行（JSSP / スクリプト開発モデル） | JSSP ファイルパス（拡張子なし） | `.pluginScriptExecutor` | `jssp-im-workflow-usage` |
| **Java クラス実行（JavaEE 開発モデル）** | **実装クラスの完全修飾名（FQCN）** | **`.pluginJavaExecutor`** | `java-im-workflow-usage` |

`exPointId` 自体は実行方式によらず共通。`pluginId` は `{exPointId}.pluginScriptExecutor` / `{exPointId}.pluginJavaExecutor` の単純な組み合わせで、それ以外の構造上の差分はない（`build-workflow.js` はこの規則に従って両方を出力できる）。

**この `.pluginJavaExecutor` サフィックスは、IM-Workflow 管理画面で実際に Java クラス実行として登録・エクスポートした本番相当の XML で確認済み**（6種類の拡張ポイントで確認。詳細は下表）。

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

## 実機確認済みの `pluginId`（`.pluginJavaExecutor`）

以下は IM-Workflow 管理画面で Java クラス実行として実際に登録・エクスポートした XML（サンプルコンテンツ `contents_javaee`）から確認した値。`exPointId` に `.pluginJavaExecutor` を連結した単純な規則であることが実データで裏付けられている。

| 処理 | exPointId | pluginId（確認済み） | `java-im-workflow-usage` の実装先 |
|------|-----------|---------------------|----------------------------------|
| 案件開始拡張処理 | `jp.co.intra_mart.workflow.plugin.event.matter.start.process` | `jp.co.intra_mart.workflow.plugin.event.matter.start.process.pluginJavaExecutor` | `assets/matter-start-process.md` |
| 案件終了拡張処理（トランザクションあり） | `jp.co.intra_mart.workflow.plugin.event.matter.end.process` | `jp.co.intra_mart.workflow.plugin.event.matter.end.process.pluginJavaExecutor` | `assets/matter-end-process.md` |
| アクション処理 | `jp.co.intra_mart.workflow.plugin.event.node.action.process` | `jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginJavaExecutor` | `assets/action-process.md` |
| 分岐条件 | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginJavaExecutor` | `assets/rule-condition.md` |
| 未完了案件削除 | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 完了案件削除 | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 過去案件削除 | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 案件退避処理 | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process.pluginJavaExecutor` | `assets/matter-archive-listener.md` |

**重要な副次的発見:** 上記の実機確認の過程で、案件終了拡張処理の `exPointId` に関する本スキルの既存記載の誤り（`jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process` という存在しない ID を使用していた）が判明し、修正済み（正: `jp.co.intra_mart.workflow.plugin.event.matter.end.process`、トランザクションなし版は `jp.co.intra_mart.workflow.plugin.event.matter.end_no_transaction.process`）。`build-workflow.js` / `reference/xml-structure.md` / `reference/im_workflow-import.xsd` を含め修正済み。

## 未確認の拡張ポイント（推定・要検証）

以下は実機データでの確認が取れていないが、上記と同じ命名規則（`{exPointId}.pluginJavaExecutor`）が成立すると推定される（`im_workflow_core` に対応する `XxxJavaExecutorEvent` ブリッジクラスの存在をソースコード調査で確認済みのため）。**本番投入前に実機で1度確認すること。**

| 処理 | exPointId | 推定 pluginId |
|------|-----------|---------------|
| 到達処理 | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process` | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process.pluginJavaExecutor` |
| 結合条件 | `jp.co.intra_mart.workflow.plugin.event.node.union.rule` | `jp.co.intra_mart.workflow.plugin.event.node.union.rule.pluginJavaExecutor` |

処理対象者プラグイン（`java-im-workflow-usage/assets/authority-exec-listener.md`）は権限系拡張ポイント（`AUTHORITY_*`）配下であり、`reference/authority-plugins.md` が示すサフィックス方式（`.apply_user_department_and_post` 等）に準じる別体系のため、本ファイルの `.pluginJavaExecutor` 規則がそのまま当てはまるかは未検証。

## XML サンプル（実機エクスポートに基づく）

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

<!-- Java クラス実行版（実機エクスポートで確認済みの形。parameter が FQCN になる） -->
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

## 未確認の拡張ポイントを使う場合の暫定手順

上記「未確認の拡張ポイント」（到達処理・結合条件）または処理対象者プラグインを Java クラス実行で登録したい場合:

1. IM-Workflow 管理画面のノード編集画面で、対象ノードのプラグインを「Java クラス実行」として登録し、`java-im-workflow-usage` で生成したクラスの FQCN を設定する
2. 対象ワークフローをインポート用 XML としてエクスポートする
3. エクスポートされた XML の `plugins[]` 要素（`pluginId` の値）を確認し、上記表と一致するか検証する
4. 一致した場合は本ファイルの「未確認」表を「実機確認済み」表へ移動する
