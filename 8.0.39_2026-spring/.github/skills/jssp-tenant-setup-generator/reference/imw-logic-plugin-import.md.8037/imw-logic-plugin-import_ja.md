# IM-Workflow ロジックフロープラグイン登録（拡張インポート）

IM-LogicDesigner のロジックフローを IM-Workflow の処理対象者プラグイン（`.logic_flow_user`）として
登録する拡張インポート JS の仕様とテンプレート。

テナント環境セットアップ時に `WorkflowLogicFlowManager` を使って登録することで、
IM-Workflow 管理画面での手動登録を自動化できる。

## 使用場面

- IM-LogicDesigner で処理対象者プラグイン用フローを作成し、テナント環境セットアップで自動登録したい
- `.github/skills/jssp-im-workflow-usage/assets/logic-flow-authority-plugin.md` に従ってフロー定義を生成した後

---

## ⚠️ 実行順序（必須）

`WorkflowLogicFlowManager.createLogicFlow` は IM-LogicDesigner のフロー登録状態を参照するため、
**LD フローが存在していない状態でプラグイン登録を実行すると失敗する**。

```
[必須の実行順序]
1. <key>_logic_import.js    ← IM-LogicDesigner フロー ZIP をインポート（フローを作成）
2. <key>_workflow_import.js ← IM-Workflow 定義 XML をインポート（ルート・フロー定義を作成）
3. <key>_import.js          ← IM-Workflow ロジックフロープラグイン登録（この処理）
```

> ビルドスクリプト（`build-setup-import.js`）は `_import.js` → `_workflow_import.js` → `_logic_import.js`
> の順で XML を生成する。**この順序はプラグイン登録には逆順のため、生成後に XML を手動で並べ替えること。**

### import config XML での指定方法

`<extends-import>` 内の `<extends-import-class>` は **XML 記述順に実行される**。
以下の順序で並べること。

```xml
<extends-import>
  <!-- 1. IM-LogicDesigner フローを先にインポート -->
  <extends-import-class>sample/initialize/1.0.0/sample_logic_import.js</extends-import-class>
  <!-- 2. IM-Workflow 定義をインポート（任意。ルート定義が必要な場合のみ） -->
  <extends-import-class>sample/initialize/1.0.0/sample_workflow_import.js</extends-import-class>
  <!-- 3. LD フローを WF プラグインとして登録（最後に実行） -->
  <extends-import-class>sample/initialize/1.0.0/sample_import.js</extends-import-class>
</extends-import>
```

### configNumber を分割する場合

LD / WF インポートと プラグイン登録を別 config に分けることもできる。

```
config-1.xml: logicImport（LD フロー ZIP）+ workflowImport（WF 定義 XML）
config-2.xml: extendsImport（プラグイン登録）
```

この場合、config-2 の `sample_import-2.js` を生成し、config-2.xml の `<extends-import-class>` に追加する。
詳細は [import-config.md](import-config.md#configNumber--1-のファイル名サフィックス) 参照。

---

## 拡張インポート JS テンプレート

ファイルパス: `src/main/jssp/src/<key>/initialize/<version>/<key>_import.js`

```javascript
/**
 * IM-Workflow ロジックフロープラグイン登録
 *
 * @file <key>_import.js
 * @description テナント環境セットアップ時に IM-LogicDesigner フローを
 *              IM-Workflow 処理対象者プラグインとして登録する拡張インポート。
 *              WorkflowLogicFlowManager を使って洗い替え方式で登録するため、
 *              再実行してもべき等に動作する。
 *
 * 前提: IM-LogicDesigner フローの ZIP インポート（<key>_logic_import.js）が
 *       本 JS より先に実行されていること。
 */

/**
 * 登録するロジックフロープラグイン定義。
 * 複数のフローを登録する場合は配列に要素を追加する。各フローは独立したトランザクションで処理される。
 *
 * logicFlowId   : IM-LogicDesigner のフローID
 * resourceGroup : IM-Workflow でのリソースグループ（固定: 'authority_plugin'）
 * resourceTypes : 使用可能なリソース種別（IM-Workflow 管理画面の「使用区分」に対応）
 *   - 'authority_process'       処理権限者（承認ノード）
 *   - 'authority_confirm'       確認対象者（確認ノード）
 *   - 'authority_matter_handle' 案件操作権限者（参照者）
 */
let IMW_LOGIC_FLOW_PLUGINS = [
    {
        logicFlowId:   '<フローID>',
        resourceGroup: 'authority_plugin',
        resourceTypes: [
            'authority_process',
            'authority_confirm',
            'authority_matter_handle'
        ]
    }
    // 複数フローを登録する場合はここに追加する
    // ,{
    //     logicFlowId:   '<別のフローID>',
    //     resourceGroup: 'authority_plugin',
    //     resourceTypes: [
    //         'authority_process'
    //     ]
    // }
];

/**
 * 拡張インポートエントリーポイント。
 * Importer がこの config の tenant-master 投入直後に呼び出す。
 *
 * @param {string} tenantId セットアップ対象テナントID
 */
function doImport(tenantId) {
    let logger = Logger.getLogger('<key>.initialize');
    logger.info('[<key>] IMW LogicFlow plugin import start. tenantId=' + tenantId);

    for (let i = 0; i < IMW_LOGIC_FLOW_PLUGINS.length; i++) {
        registerLogicFlowPlugin(IMW_LOGIC_FLOW_PLUGINS[i], logger);
    }

    logger.info('[<key>] IMW LogicFlow plugin import completed. tenantId=' + tenantId);
}

/**
 * ロジックフロープラグインを IM-Workflow に登録する（洗い替え方式）。
 * 既存レコードを全削除してから新規作成するため、再実行しても同じ結果になる。
 *
 * @param {Object} config IMW_LOGIC_FLOW_PLUGINS の 1 要素
 * @param {Object} logger Logger インスタンス
 */
function registerLogicFlowPlugin(config, logger) {
    logger.info('[<key>] registerLogicFlowPlugin start. logicFlowId=' + config.logicFlowId);

    let manager = new WorkflowLogicFlowManager();

    // 登録モデルを構築（resourceType ごとに 1 レコード）
    let registerModelList = [];
    for (let i = 0; i < config.resourceTypes.length; i++) {
        registerModelList[registerModelList.length] = {
            logicFlowId:   config.logicFlowId,
            resourceGroup: config.resourceGroup,
            resourceType:  config.resourceTypes[i],
            updateCount:   '1'
        };
    }

    let businessError = null;
    let txResult = Transaction.begin(function() {
        try {
            // 既存レコードを全削除（logicFlowId 単位で洗い替え）
            let deleteResult = manager.deleteLogicFlow({ logicFlowId: config.logicFlowId });
            if (!deleteResult.resultFlag) {
                // "delete" で始まる文字列リテラルは JSSP-JS-004 誤検知を招くため先頭を変えている
                throw new Error('LogicFlow deletion failed. logicFlowId=' + config.logicFlowId);
            }

            if (registerModelList.length > 0) {
                let createResult = manager.createLogicFlow(registerModelList);
                if (!createResult.resultFlag) {
                    throw new Error('createLogicFlow failed. logicFlowId=' + config.logicFlowId);
                }
            }
        } catch (e) {
            businessError = e;
            throw e;  // Transaction をロールバックさせるために再スロー
        }
    });

    if (businessError) {
        logger.error('[<key>] registerLogicFlowPlugin failed. logicFlowId='
            + config.logicFlowId + ' error=' + businessError.message);
        throw businessError;
    }
    if (!txResult.isSuccess()) {
        let msg = '[<key>] registerLogicFlowPlugin transaction failed. logicFlowId=' + config.logicFlowId;
        logger.error(msg);
        throw new Error(msg);
    }

    logger.info('[<key>] registerLogicFlowPlugin completed. logicFlowId=' + config.logicFlowId);
}
```

---

## 使用する API

| API | 用途 | d.ts |
|-----|------|------|
| `WorkflowLogicFlowManager` | LD フローの WF への登録・削除 | なし（IM-Workflow 内部 API） |
| `WorkflowLogicFlowList` | 登録済み一覧の参照（排他確認用） | なし（UI 用。拡張インポートでは不使用） |

`WorkflowLogicFlowManager` は d.ts が存在しない内部 API だが、IM-Workflow がインストールされた環境のファンクションコンテナ相当のコンテキストで使用可能。

### deleteLogicFlow の引数・返却値

```javascript
manager.deleteLogicFlow({ logicFlowId: '<フローID>' })
// 返却値: { resultFlag: boolean }
// logicFlowId に対応するレコードが存在しない場合も resultFlag: true で正常終了
```

### createLogicFlow の引数・返却値

```javascript
manager.createLogicFlow([
  {
    logicFlowId:   '<フローID>',   // string
    resourceGroup: 'authority_plugin',  // string（固定値）
    resourceType:  '<リソース種別>', // string
    updateCount:   '1'              // string（初回は '1'）
  },
  ...
])
// 返却値: { resultFlag: boolean }
```

---

## 注意事項

- `deleteLogicFlow` + `createLogicFlow` の洗い替えパターンにより、再実行しても同じ状態になる（べき等）
- `WorkflowLogicFlowManager` は UI の楽観ロック（`updateCount` 照合）を行わない直接 API。排他制御は不要
- エラーが発生した場合、そのフローのトランザクションはロールバックされるが、**それより前に完了したフローの登録はロールバックされない**（各フローが独立したトランザクション）
- エラーは例外として再スローされるため、Importer 全体が失敗扱いになる
