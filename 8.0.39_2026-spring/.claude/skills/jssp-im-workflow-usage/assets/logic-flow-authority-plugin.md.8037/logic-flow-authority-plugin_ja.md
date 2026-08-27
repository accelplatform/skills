# IM-LogicDesigner を使った処理対象者プラグイン

## 概要

IM-Workflow の処理対象者を **IM-LogicDesigner のロジックフロー** で動的に決定する方式。
SSJS プラグイン（`authority_exec_event_listener.js`）の代替として、ローコードでロジックを実装できる。

### SSJS プラグイン vs IM-LogicDesigner の使い分け

| 比較軸 | SSJS プラグイン | IM-LogicDesigner |
|--------|---------------|-----------------|
| 実装方法 | JavaScript コード | ロジックフロー（GUI） |
| 複雑なビジネスロジック | ◎ 柔軟 | △ タスクの組み合わせで対応 |
| DB 参照・API 連携 | ◎ 直接実装 | ○ タスクで対応 |
| 保守・変更 | △ リリース必要 | ◎ 管理画面から変更可 |
| デバッグ | △ ログ確認 | ○ フローのデバッグ機能 |

---

## フロー定義の作成手順

### 1. spec.json の作成

以下のテンプレートを元に `spec.json` を作成する。
入力定義（imwMatterInfo / imwApplyAuthInfo / imwBeforeNodeAuthInfo）は必要なものだけ残してよい。

```json
{
  "featureName": "<機能名>",
  "flowCategories": [
    {
      "categoryId": "<カテゴリID>",
      "categoryName": "<カテゴリ名（英語）>",
      "sortNumber": 100,
      "localizes": {
        "ja":    { "locale": "ja",    "categoryName": "<カテゴリ名（日本語）>" },
        "en":    { "locale": "en",    "categoryName": "<カテゴリ名（英語）>" },
        "zh_CN": { "locale": "zh_CN", "categoryName": "<カテゴリ名（中国語）>" }
      },
      "parentId": null
    }
  ],
  "flows": [
    {
      "flowId": "<フローID>",
      "flowName": "<フロー名>",
      "categoryId": "<カテゴリID>",
      "version": 1,
      "transaction": false,
      "validateRepositoryData": false,
      "notes": "IM-Workflow 処理対象者プラグイン用ロジックフロー",
      "constants": [],
      "variablesDataDefinition": {
        "entrypoint": { "typeId": "root", "basic": false, "required": false, "listingType": "none" },
        "typeDefinitions": [{ "id": "root", "properties": [] }]
      },
      "inputDataDefinition": {
        "entrypoint": { "typeId": "root", "basic": false, "required": false, "listingType": "none" },
        "typeDefinitions": [
          {
            "id": "root",
            "properties": [
              { "typeId": "im_logic_object_imw_matter_info",          "name": "imwMatterInfo",         "description": "案件情報",             "listingType": "none", "required": false, "basic": false },
              { "typeId": "im_logic_object_imw_apply_auth_info",      "name": "imwApplyAuthInfo",      "description": "申請処理権限情報",     "listingType": "none", "required": false, "basic": false },
              { "typeId": "im_logic_object_imw_before_node_auth_info","name": "imwBeforeNodeAuthInfo", "description": "前ノード処理権限情報", "listingType": "none", "required": false, "basic": false }
            ]
          },
          {
            "id": "im_logic_object_imw_matter_info",
            "properties": [
              { "typeId": "string", "name": "applyBaseDate",     "description": "申請基準日",             "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "contentsId",        "description": "コンテンツID",           "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "contentsVersionId", "description": "コンテンツバージョンID", "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "flowId",            "description": "フローID",               "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "flowVersionId",     "description": "フローバージョンID",     "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "nodeId",            "description": "ノードID",               "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "routeId",           "description": "ルートID",               "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "routeVersionId",    "description": "ルートバージョンID",     "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "systemMatterId",    "description": "システム案件ID",         "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "userDataId",        "description": "ユーザデータID",         "listingType": "none", "required": false, "basic": true }
            ]
          },
          {
            "id": "im_logic_object_imw_apply_auth_info",
            "properties": [
              { "typeId": "string", "name": "userCd",          "description": "申請者ユーザコード",     "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "companyCd",       "description": "申請者会社コード",       "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentSetCd", "description": "申請者組織セットコード", "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentCd",    "description": "申請者組織コード",       "listingType": "none", "required": false, "basic": true }
            ]
          },
          {
            "id": "im_logic_object_imw_before_node_auth_info",
            "properties": [
              { "typeId": "string", "name": "userCd",          "description": "前処理者ユーザコード",     "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "companyCd",       "description": "前処理者会社コード",       "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentSetCd", "description": "前処理者組織セットコード", "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentCd",    "description": "前処理者組織コード",       "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "nodeId",          "description": "前ノードID",               "listingType": "none", "required": false, "basic": true }
            ]
          },
          { "id": "string", "properties": [] }
        ]
      },
      "outputDataDefinition": {
        "entrypoint": { "typeId": "root", "basic": false, "required": false, "listingType": "none" },
        "typeDefinitions": [
          {
            "id": "root",
            "properties": [
              {
                "typeId": "string",
                "name": "userCds",
                "description": "処理対象者ユーザコード配列。null を返すと権限者なし（展開しない）",
                "listingType": "array",
                "required": false,
                "basic": true
              }
            ]
          },
          { "id": "string", "properties": [] }
        ]
      },
      "tasks": [
        { "type": "im_start", "label": "開始" },
        { "type": "im_end",   "label": "終了" }
      ],
      "edges": [
        { "from": "im_start", "to": "im_end1" }
      ]
    }
  ]
}
```

### 2. フロー定義 ZIP の生成

```bash
node .claude/skills/jssp-im-logic-generator/scripts/build-flow.js <spec.json> --zip
```

生成先: `src/main/storage/public/im_logic/im-logicdesigner-data-<featureName>.zip`

### 3. フロー定義のバリデーション

```bash
node .claude/skills/jssp-im-logic-generator/scripts/validate-flow.js \
  src/main/storage/public/im_logic/im-logicdesigner-data-<featureName>.zip
```

`PASS (0 warning(s))` が出ることを確認する。

---

## IM-Workflow ルート定義 XML での指定

生成したフローの `flowId` を使って、IM-Workflow のルート定義 XML で権限プラグインを指定する。
`jssp-im-workflow-generator` スキルで XML を生成する場合は、`authority-plugins.md` の「ロジックフロー指定系」セクションの XML 例を参照して spec.json に記述する。

```xml
<!-- 承認ノードの権限設定例 -->
<extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve</extensionPointId>
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.logic_flow_user</pluginId>
<parameter type="string">{"flowId" : "<フローID>", "version" : null, "versionDecide" : false}</parameter>
<targetType type="string">logic_flow_user</targetType>
<targetCode type="string">{"flowId" : "<フローID>", "version" : null, "versionDecide" : false}</targetCode>
```

**使用可能な拡張ポイント（実機確認済み）**

| ノード種別 | 拡張ポイント |
|----------|------------|
| 承認ノード（直前が人間ノード） | `node.approve` |
| 確認ノード | `node.confirm` |
| 参照者設定 | `administrator.flow.handle` |

---

## テナント環境セットアップへの組み込み

IM-LogicDesigner フローの ZIP インポートだけでなく、IM-Workflow へのプラグイン登録も
テナント環境セットアップに組み込むことができる。

### ⚠️ 実行順序（必須）

`WorkflowLogicFlowManager.createLogicFlow`（プラグイン登録）は IM-LogicDesigner にフローが
存在している状態でないと失敗する。**必ず以下の順序で実行すること。**

```
1. <key>_logic_import.js    ← IM-LogicDesigner フロー ZIP をインポート（先にフローを作成）
2. <key>_workflow_import.js ← IM-Workflow 定義 XML をインポート（任意）
3. <key>_import.js          ← IM-Workflow ロジックフロープラグイン登録（最後に実行）
```

> ビルドスクリプトが生成する XML は `_import.js` → `_workflow_import.js` → `_logic_import.js` の順になるため、
> **生成後に `import-<artifactId>-config-<N>.xml` の `<extends-import>` セクションを手動で並べ替えること。**

```xml
<!-- 正しい順序 -->
<extends-import>
  <extends-import-class>sample/initialize/1.0.0/sample_logic_import.js</extends-import-class>
  <extends-import-class>sample/initialize/1.0.0/sample_workflow_import.js</extends-import-class>
  <extends-import-class>sample/initialize/1.0.0/sample_import.js</extends-import-class>
</extends-import>
```

### 各 JS の生成方法

| JS ファイル | 生成スキル | 説明 |
|-----------|----------|------|
| `<key>_logic_import.js` | `jssp-tenant-setup-generator`（`logicImport` セクション） | フロー ZIP を `LogicFlowImporter` でインポート |
| `<key>_workflow_import.js` | `jssp-tenant-setup-generator`（`workflowImport` セクション） | WF 定義 XML を `DataImportExecutor` でインポート |
| `<key>_import.js` | 手動作成（`reference/imw-logic-plugin-import.md` のテンプレートを使用） | `WorkflowLogicFlowManager` でプラグイン登録 |

プラグイン登録 JS のテンプレートと実装詳細は
`.claude/skills/jssp-tenant-setup-generator/reference/imw-logic-plugin-import.md` を参照。

---

## 注意事項

- **引戻し・差戻し・案件操作によるノード移動** で到達した場合、ロジックフローは実行されず、最後の処理者が権限者として採用される（2023 Autumn 以降の仕様）
- フローの出力 `userCds` に `null` を返すと権限者なし（展開しない）として扱われる
- `version: null` は常に最新公開バージョンを使用する。固定バージョンを使う場合は `version` に整数を指定し `versionDecide: true` にする
