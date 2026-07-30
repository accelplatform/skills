# BPMN スクリプトリフレクター

## 概要
BPMN 形式の XML を解析し、生成したスクリプトの内容を BPMN に反映する。

## 使用タイミング
ユーザが以下のような依頼をした場合：
- 「生成スクリプトの内容を BPMN XML に反映してほしい」

## 反映先
- 正: `doc/<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn`（コピー先。反映してよいのはここだけ）
- 誤: `doc/<BPMプロセス名>.bpmn`（コピー元。**絶対に書き換えない**）

## BPMN XML へに反映する内容
- 本スキルセットでは以下を行う。
  - 生成したスクリプトのパスやパラメタを、BPMの開始イベントまたはユーザタスクに追加する

## 実施手順

### Step0.対象の確認
- 反映元になる生成スクリプトの設定情報と反映先ファイルの確認。
  - 反映元になる生成スクリプトの設定情報のパスと反映先BPMNファイルのパスを提示し、間違いは無いか確認を行う。
- 反映実施の実施可否
  - 反映処理を実施するか確認する。YESの場合、Step1以降を実行。NOの場合は処理中止。

### Step1.生成スクリプトのパス反映

反映ロジックは `.github/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector.js` に実装されている。以下はその概要と呼び出し方である。

### 処理概要

| 関数 | 役割 |
|------|------|
| `collectRoutingPaths(configDir)` | routing-jssp-config 配下の XML から `file-mapping` の `path` 属性を収集する |
| `applyStartEventFormKey(xml, eventId, featurePath)` | 開始イベントに `formKey="forward:<機能パス>"` を付与する |
| `applyUserTaskFormKey(xml, taskId, featurePath, pk)` | ユーザタスクに `formKey="forward:<機能パス>?processInstanceId=...&<pk>=..."` を付与する |
| `reflect(bpmnPath, routingConfigDir, mappings)` | 上記をまとめて実行し、BPMN ファイルを上書き保存する |

### 呼び出し例

```javascript
var reflector = require('.github/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector');

reflector.reflect(
  'doc/purchase-order-prompt/purchase-order.bpmn',
  'src/main/conf/routing-jssp-config',
  [
    // 開始イベント：formKey = "forward:/purchase/apply"
    {
      type: 'startEvent',
      elementId: 'startEvent1',
      routingXml: 'purchase_apply.xml'
    },
    // ユーザタスク：formKey = "forward:/purchase/approve?processInstanceId=...&orderCd=..."
    {
      type: 'userTask',
      elementId: 'approveTask',
      routingXml: 'purchase_approve.xml',
      pk: { param: 'orderCd', varName: 'orderCd' }
    }
  ]
);
```

### mappings 定義の注意事項

- `type`: `'startEvent'` または `'userTask'` を指定する
- `routingXml`: `routing-jssp-config` 配下の XML ファイル名（`file-mapping` の `path` 取得に使用）
- `pk`（ユーザタスクのみ・任意）: 業務データの主キーをプロセス変数から渡す場合に指定する
  - 前提として、主キー項目をプロセス変数に登録しプロセスインスタンス内で持ちまわっていること
  - `param`: クエリパラメータ名（例: `orderCd`）
  - `varName`: プロセス変数名（例: `orderCd`）
- `formKey` が既に設定されている要素は上書きしない
