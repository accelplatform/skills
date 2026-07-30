# IM-Workflow ロジックフロープラグイン登録（拡張インポート）

IM-LogicDesigner のロジックフローを IM-Workflow の処理対象者プラグイン（`.logic_flow_user`）として、`WorkflowLogicFlowManager` で登録する拡張インポート。

実装テンプレート（`IMW_LOGIC_FLOW_PLUGINS` 配列 + `doImport` + `registerLogicFlowPlugin`）・`WorkflowLogicFlowManager` の API 仕様（`deleteLogicFlow` / `createLogicFlow`）・`resourceTypes` の種別・洗い替え方式はテナント環境セットアップと同一。
`.claude/skills/jssp-tenant-setup-generator/reference/imw-logic-plugin-import.md` を参照。

**洗い替え方式（`deleteLogicFlow` → `createLogicFlow`）は毎回実行されるサンプルデータセットアップにそのまま適しており、変更不要。**

## 差分

| テナント環境セットアップ | **サンプルデータセットアップ** |
|---|---|
| `<key>/initialize/<version>/<key>_import.js` | `<key>/initialize/<key>_import.js`（`<version>` なし） |
| `<key>/initialize/<version>/<key>_workflow_import.js` | `<key>/initialize/<key>_workflow_import.js` |
| `<key>/initialize/<version>/<key>_logic_import.js` | `<key>/initialize/<key>_logic_import.js` |
| 順序制御: config 分割 または 記述順 | **記述順のみ**（config 分割不可） |
| エラー時: Importer 全体が即時停止 | **後続処理は継続実行される** |

## ⚠️ 実行順序（必須）

`WorkflowLogicFlowManager.createLogicFlow` は LD のフロー登録状態を参照するため、**LD フローが無い状態で実行すると失敗する**。

```
1. <key>_logic_import.js    ← LD フロー ZIP のインポート（フローを作成）
2. <key>_workflow_import.js ← IM-Workflow 定義 XML のインポート
3. <key>_import.js          ← プラグイン登録（最後）
```

`build-sample-setup-import.js` は `_import.js` → `_workflow_import.js` → `_logic_import.js` の順で生成する。**逆順のため、生成後に XML を手動で並べ替えること。**

```xml
<extends-import>
  <extends-import-class>any_app/initialize/any_app_logic_import.js</extends-import-class>
  <extends-import-class>any_app/initialize/any_app_workflow_import.js</extends-import-class>
  <extends-import-class>any_app/initialize/any_app_import.js</extends-import-class>
</extends-import>
```

設定ファイルは 1 つしか作れないため、config 分割による順序制御はできない。**この並べ替えが唯一の手段。**

## エラー検知

例外を投げても後続のセットアップ処理は継続実行される。`<key>.initialize` ロガーの出力と、IM-Workflow 管理画面「ロジックフロー一覧」への登録を確認する。

## 関連 reference

- [extends-import.md](extends-import.md)
- [logic-import.md](logic-import.md): 先に実行される必要がある
- [workflow-import.md](workflow-import.md)
