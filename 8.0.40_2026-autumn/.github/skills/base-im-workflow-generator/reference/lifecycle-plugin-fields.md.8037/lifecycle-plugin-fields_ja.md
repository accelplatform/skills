# ライフサイクル系プラグインフィールド（到達処理・案件開始処理・案件退避処理・案件削除リスナー）

`actionProcess`（ノード単位）・`matterEndProcess`（spec レベル）と同じ命名パターンで、以下のプラグインも `spec.json` から自動登録できる。いずれも JSSP 実装（スクリプトパス）・Java 実装（FQCN、`*Impl: "java"`）の両方に対応する。`pluginId` は自動的に `{exPointId}.pluginScriptExecutor` または `{exPointId}.pluginJavaExecutor` になる。

## 到達処理（arriveProcess）— ノード単位

`apply` / `approve` / `confirm` 等、任意のノードに `arriveProcess` フィールドで指定する。

```jsonc
{
  "id": "01", "type": "approve", "name": "Manager",
  "arriveProcess": "leave/arrive/arrive_process",       // JSSP 実装（スクリプトパス、拡張子なし）
  "arriveProcessImpl": "jssp"                            // 省略可。省略時 "jssp"
},
{
  "id": "02", "type": "approve", "name": "Director",
  "arriveProcess": "jp.co.intra_mart.sample.leave.workflow.arrive.LeaveArriveProcess",
  "arriveProcessImpl": "java"                            // Java 実装（FQCN）
}
```

- exPointId: `jp.co.intra_mart.workflow.plugin.event.node.arrive.process`
- 実装は `jssp-im-workflow-usage`（`assets/simple-arrive-process.md`）または `java-im-workflow-usage`（`assets/arrive-process.md`）を使用

## 案件開始処理（matterStartProcess）— spec レベル

```jsonc
{
  "matterStartProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveMatterStartProcess",
  "matterStartProcessImpl": "java"    // "java" | "jssp"（省略時 "jssp"）
}
```

- exPointId: `jp.co.intra_mart.workflow.plugin.event.matter.start.process`
- 実装は `jssp-im-workflow-usage`（`assets/simple-matter-start-process.md`）または `java-im-workflow-usage`（`assets/matter-start-process.md`）を使用

## 案件退避処理（matterArchiveProcess）— spec レベル

```jsonc
{
  "matterArchiveProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveMatterArchiveListener",
  "matterArchiveProcessImpl": "java"
}
```

- exPointId: `jp.co.intra_mart.workflow.plugin.event.matter.archive.process`
- 実装は `jssp-im-workflow-usage`（`assets/simple-matter-archive-listener.md`）または `java-im-workflow-usage`（`assets/matter-archive-listener.md`）を使用

## 案件削除リスナー（未完了/完了/過去）— spec レベル

```jsonc
{
  "activeMatterDeleteProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveActiveMatterDeleteListener",
  "activeMatterDeleteProcessImpl": "java",
  "completedMatterDeleteProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveCompletedMatterDeleteListener",
  "completedMatterDeleteProcessImpl": "java",
  "archivedMatterDeleteProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveArchivedMatterDeleteListener",
  "archivedMatterDeleteProcessImpl": "java"
}
```

| フィールド | exPointId |
|-----------|-----------|
| `activeMatterDeleteProcess` | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process` |
| `completedMatterDeleteProcess` | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process` |
| `archivedMatterDeleteProcess` | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process` |

実装は `jssp-im-workflow-usage`（`assets/simple-actv-matter-delete-listener.md` 等）または `java-im-workflow-usage`（`assets/matter-delete-listener.md`）を使用。

## フィールド一覧

| フィールド | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `arriveProcess`（ノード） | No | なし | 到達処理のスクリプトパス（JSSP）または FQCN（Java）。省略時はプラグイン未登録 |
| `arriveProcessImpl`（ノード） | No | `"jssp"` | `"java"` で Java クラス実行 |
| `matterStartProcess` | No | なし | 案件開始処理のスクリプトパス（JSSP）または FQCN（Java）。省略時はプラグイン未登録 |
| `matterStartProcessImpl` | No | `"jssp"` | `"java"` で Java クラス実行 |
| `matterArchiveProcess` | No | なし | 案件退避処理のスクリプトパス（JSSP）または FQCN（Java）。省略時はプラグイン未登録 |
| `matterArchiveProcessImpl` | No | `"jssp"` | `"java"` で Java クラス実行 |
| `activeMatterDeleteProcess` | No | なし | 未完了案件削除リスナーのスクリプトパス（JSSP）または FQCN（Java）。省略時はプラグイン未登録 |
| `activeMatterDeleteProcessImpl` | No | `"jssp"` | `"java"` で Java クラス実行 |
| `completedMatterDeleteProcess` | No | なし | 完了案件削除リスナーのスクリプトパス（JSSP）または FQCN（Java）。省略時はプラグイン未登録 |
| `completedMatterDeleteProcessImpl` | No | `"jssp"` | `"java"` で Java クラス実行 |
| `archivedMatterDeleteProcess` | No | なし | 過去案件削除リスナーのスクリプトパス（JSSP）または FQCN（Java）。省略時はプラグイン未登録 |
| `archivedMatterDeleteProcessImpl` | No | `"jssp"` | `"java"` で Java クラス実行 |

## 未対応（既知のギャップ）

以下は現時点で `build-workflow.js` から自動生成できない。XML を手動編集する必要がある:

- **分岐条件・結合条件（ユーザプログラム方式）**: `branchMethod: "program"` のノード種別コードは出力されるが、対応するプラグイン（`jp.co.intra_mart.workflow.plugin.event.node.branch.rule` / `...union.rule`）自体の登録は未実装。`matterProperties` + `rules` を使う「ルール方式」の分岐（`branchMethod: "rule"`）は対応済み
- **処理対象者プラグイン（カスタム実装）**: 役職・組織・ロール等の標準プラグイン（`node.plugin.suffix` で指定するもの）は対応済みだが、SSJS/Javaでフルカスタム実装した処理対象者プラグインの登録経路は、本スキルが生成する route/flow インポート XML とは別体系である可能性が高く未検証（`.github/skills/jssp-im-workflow-usage/assets/simple-authority-exec-event-listener.md` 参照）
