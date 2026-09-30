# BPMN スクリプトリフレクター

## 概要
BPMN 形式の XML を解析し、生成したスクリプトの内容を BPMN に反映する。

## 使用タイミング
ユーザが以下のような依頼をした場合：
- 「生成スクリプトの内容を BPMN XML に反映してほしい」

## 反映先
- 正: `doc/<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn`（コピー先。反映してよいのはここだけ）
- 誤: `doc/<BPMプロセス名>.bpmn`（コピー元。**絶対に書き換えない**）

## BPMN XML に反映する内容
- 本スキルセットでは以下を行う。
  - 生成したスクリプトのパスやパラメタを、BPMの開始イベントまたはユーザタスクに追加する

## 実施手順

### Step0.対象の確認
- 反映元になる生成スクリプトの設定情報と反映先ファイルの確認。
  - 反映元になる生成スクリプトの設定情報のパスと反映先BPMNファイルのパスを提示し、間違いは無いか確認を行う。
- 反映実施の実施可否
  - 反映処理を実施するか確認する。YESの場合、Step1以降を実行。NOの場合は処理中止。

### Step1.生成スクリプトのパス反映

反映ロジックは `.claude/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector.js` に実装されている。以下はその概要と呼び出し方である。

### 製造ベンダー判定

`reflect()` は BPMN 読み込み時に `detectVendor(xml)` でネームスペース宣言から製造ベンダーを自動判定し、以降の `applyXxxFormKey` 呼び出しにベンダー種別を引き渡す。判定結果に応じて、付与する `formKey` 属性名が切り替わる。

| ベンダー | 判定条件 |
|---------|---------|
| `im-bpm`（IM-BPM 製） | `xmlns:activiti="http://activiti.org/bpmn"` を含む |
| `igrafx`（iGrafx 製） | ネームスペース URI に `www.igrafx.com` を含む |
| `other`（その他） | 上記いずれにも該当しない |

`applyStartEventFormKey` / `applyUserTaskFormKey` を単体で呼び出す場合は、末尾の引数に `vendor` を渡す。省略時は `other` 扱い（従来どおりプレフィックス無し）となる。

### 処理概要

| 関数 | 役割 |
|------|------|
| `detectVendor(xml)` | ネームスペース宣言から製造ベンダー（`'im-bpm'` / `'igrafx'` / `'other'`）を判定する |
| `collectRoutingPaths(configDir)` | routing-jssp-config 配下の XML から `file-mapping` の `path` 属性を収集する |
| `applyStartEventFormKey(xml, eventId, featurePath, vendor)` | 開始イベントに `formKey="forward:<機能パス>"`（IM-BPM 製は `activiti:formKey`）を付与する |
| `applyUserTaskFormKey(xml, taskId, featurePath, pk, vendor)` | ユーザタスクに `formKey="forward:<機能パス>?processInstanceId=...&<pk>=..."`（IM-BPM 製は `activiti:formKey`）を付与する |
| `reflect(bpmnPath, routingConfigDir, mappings)` | 上記をまとめて実行し、BPMN ファイルを上書き保存する（内部で `detectVendor()` を実行し、ベンダー種別を自動的に各 `applyXxxFormKey` へ引き渡す） |

### 反映先パスのガード

`reflect()` は書き込み前に `isPromptCopyBpmnPath(bpmnPath)`（`bpmn-reflector-utils.js` に集約。`bpmn-specs-reflector.js` の `reflectFixes()` 等と共通）で `bpmnPath` を検証する。`doc/<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn` 形式でない場合（＝コピー元 `doc/<BPMプロセス名>.bpmn` を含む）は例外を投げて処理を中断し、ファイルへは一切書き込まない。上記「反映先」の「誤: コピー元には絶対に書き換えない」という規約を、呼び出し側の指示ミスに関わらずコードレベルでも強制するためのガードである。

**ベンダー別の属性名:**

| 項目 | IM-BPM 製 | iGrafx・その他 |
|------|-----------|----------------|
| `formKey` 属性 | `activiti:formKey` | `formKey` |

### 呼び出し例

```javascript
var reflector = require('./.claude/skills/bpm-xml-reflector/scripts/bpmn-scripts-reflector.js');

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
- `formKey` が既に設定されている要素は上書きしない（IM-BPM 製は `activiti:formKey` の有無で判定する）
- `reflect()` 経由で呼び出す限り、製造ベンダーの判定・属性名の切り替えは自動で行われるため、呼び出し側で意識する必要はない
