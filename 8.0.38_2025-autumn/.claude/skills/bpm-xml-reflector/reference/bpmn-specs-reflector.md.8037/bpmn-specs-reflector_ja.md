# BPMN 仕様書リフレクター

## 概要
BPMN 形式の XML を解析し、仕様書の内容を BPMN に反映する。

## 使用タイミング
ユーザが以下のような依頼をした場合：
- 「`doc/<BPMプロセス名>-prompt/` の仕様書の内容を BPMN XML に反映してほしい」
- 「仕様書の内容を BPMN XML に反映してほしい」

## 反映先
- 正: `doc/<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn`（コピー先。反映してよいのはここだけ）
- 誤: `doc/<BPMプロセス名>.bpmn`（コピー元。**絶対に書き換えない**）

## BPMN XML に反映する内容
- 本スキルセットでは以下を行う。
  - プロセス定義キー置換
  - ロールIDの追加
  - タスクの背景色設定
  - オプショナルタスク設定
  - プロセス変数定義追加
  - シグナル定義追加
  - メッセージ定義追加

## 実施手順

### Step0.対象の確認
- 反映元になる仕様書と反映先ファイルの確認。
  - 反映元になる仕様書のパスと反映先BPMNファイルのパスを提示し、間違いは無いか確認を行う。
- 反映内容の確認
  - 仕様書より反映対象となる事項を抽出・提示し、反映したい事項を問い合わせる。
- 反映実施の実施可否
  - 反映処理を実施するか確認する。YESの場合、Step1以降を実行。NOの場合は処理中止。

### Step1.プロセス定義キー置換（固定順）

本フローは必ずこの順序で実行する。

#### 1-1. 置換済みチェック（JS）

- 実行:
  - `{{RUNTIME}} .claude/skills/bpm-xml-reflector/scripts/check-process-id-replaced.js <doc/*-prompt/*.bpmn> <replacements.json>`
- 判定:
  - `replaced`: 既に置換済み。置換処理は実行しない。
  - `not_replaced` / `partial`: Step2 へ進む。

#### 1-2. ユーザー確認（置換実施可否）

- 仕様書 `to-be-discussed.md` の from-to 提案を提示する。
- 「この from-to で置換してよいか」をユーザーに確認する。
- OK の場合のみ Step3 へ進む。

#### 1-3. 置換処理

**本ステップは必ず `.claude/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js` の `reflector.reflect()`（内部で `reflectProcessIdReplacements()` を呼ぶ）経由で実行すること。
Read/Write/Edit ツールで `.bpmn` を直接読み書きして置換を再現してはならない。**
対象ファイルパスは `bpmnPath` 引数としてのみ指定する。`isPromptCopyBpmnPath()` により
`doc/<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn` 形式以外（コピー元 `doc/<BPMプロセス名>.bpmn` を含む）は
例外がスローされ、反映されない。
以下の 1-3-1〜1-3-5 は `reflectProcessIdReplacements()` の内部動作の説明であり、エージェントが個別に手順を再現するものではない。

##### 1-3-1. from-to 置換実行（メモリ上）
- 仕様書で提案された from-to で置換した XML をメモリ上に生成する（ディスクへの書き込みは行わない）。
- `process@id` の置換後、processタグにdocumentationタグを追加し、下記フォーマットのトークンを追記する（既存記述は保持）
```
PROCESS_KEY_META:PROCESS_KEY_REPLACED=true;ORIGINAL_PROCESS_KEY=<元のprocess_id>;PROCESS_KEY=<採番後process_id>;REPLACED_DATE=<YYYY-MM-DD>;REPLACE_POLICY=initial-only
```

##### 1-3-2. 置換検証（JS）
- 内部で `verifyProcessIdReflections()` 相当の検証を行う。
- 検証対象:
  - `participant@processRef`
  - `process@id`
- 単体で確認したい場合の実行例（`reference/` ディレクトリから）:
  - `{{RUNTIME}} .claude/skills/bpm-xml-reflector/scripts/verify-process-id-reflection.js <doc/*-prompt/*.bpmn> <replacements.json>`

##### 1-3-3. 検証失敗時の再試行
- 検証に失敗した場合は最大2回まで自動で再試行する。
- 再試行しても失敗する場合はエラーとして処理を中断し、失敗箇所をユーザーに表示する。

##### 1-3-4. ユーザー承認後、本ファイルへ直接書き込み
- 検証に成功した置換後 XML を、`onProcessIdReplacementDetected` コールバックでユーザーに提示する。
- 「どのファイル（パス）に、どの from-to を反映するか」を表示し、承認を得る。
- 承認された場合のみ、対象 `.bpmn` に置換後 XML を直接書き込む。
- 拒否された場合は何もしない（対象 `.bpmn` は承認前に一切変更されないため、復元処理も不要）。

##### 1-3-5. 完了確認
- 「どのファイル（パス）の置換が完了したか」を表示する。
- 対象が正しいかユーザーに確認する。

#### 1-4. 仕様書更新

- `to-be-discussed.md` のプロセス定義キー置換履歴を更新する。
  - 置換状態: 置換済み
  - 判定根拠: documentationトークン（反映後）
  - 反映日時: YYYY-MM-DD
  - 各置換提案テーブルの反映日: YYYY-MM-DD

#### 1-5. 変更履歴更新

- `interactive-log.md` に以下を記録する。
  - 実行日時
  - 対象ファイルパス
  - from-to 一覧
  - ユーザー確認結果（1-2 / 1-3-4）
  - 検証結果（1-3-2 / 1-3-3）

#### 例外: 再置換の禁止

置換済みと判定された process に対しては、新規採番を実施してはならない。必ず既存キーを再利用する。

- 既存キーの取得先:
  - documentation トークンから `PROCESS_KEY=<key>` を抽出


### Step2.ロールID・タスクの背景色・オプショナルタスク設定・プロセス変数・シグナル定義・メッセージ定義の反映処理

反映ロジックは `.claude/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js` に実装されている。以下はその概要と呼び出し方である。

#### 処理概要

| 関数 | 役割 |
|------|------|
| `applyProcessCandidateStarterGroups(xml, processId, roleId)` | `<process>` タグに `candidateStarterGroups="<ロールID>"` を付与する |
| `applyLaneCandidateGroups(xml, laneId, roleId)` | `<lane>` タグに `candidateGroups="<ロールID>"` を付与する |
| `applyUserTaskCandidateGroups(xml, taskId, roleId)` | `<userTask>` タグに `candidateGroups="<ロールID>"` を付与する |
| `applyTaskColor(xml, taskId, taskType)` | タスク種別に応じた `color` 属性を付与する（カラーマップは下記参照） |
| `applyIsOptional(xml, taskId)` | オプショナルタスクのタグに `isOptional="true"` を付与する |
| `applyDataObjects(xml, processId, variables)` | プロセス変数を `<dataObject>` として `<process>` ブロック末尾に挿入する |
| `applyConditionExpression(xml, flowId, expression)` | `<sequenceFlow>` に `<conditionExpression>` を挿入する（自己終了タグは自動展開） |
| `applySignal(xml, signalId, signalName)` | `<signal>` 要素を `<process>` の直前に挿入する |
| `applyMessage(xml, messageId, messageName)` | `<message>` 要素を `<process>` の直前に挿入する |
| `replaceProcessId(xml, fromId, toId)` | Process ID を置換する（`<process id>` と `<participant processRef>` の両方を置換） |
| `reflectProcessIdReplacements(bpmnPath, xml, replacements, options)` | Process ID 置換をメモリ上で実施し、ユーザー確認後に対象 `.bpmn` へ直接書き込む（`.tmp` は作成しない。オプション引数で `onProcessIdReplacementDetected` コールバックを指定） |
| `verifyProcessIdReplacements(xml, replacements)` | 仕様書の process id 置換 from-to と反映後 BPMN の一致を検証する（`process@id` と `participant@processRef` を照合） |
| `reflect(bpmnPath, specs, options)` | 上記をまとめて実行し、BPMN ファイルを上書き保存する（オプション引数で process id 置換時の動作をカスタマイズ可） |

**タスク種別と color 値の対応:**

| taskType | color |
|----------|-------|
| `userTask` | `bbdefb` |
| `scriptTask` | `fff9c4` |
| `serviceTask` | `f9dcc0` |
| `mailTask` | `f7c9cf` |
| `manualTask` | `b2dfdb` |
| `receiveTask` | `e0caf7` |
| `callActivity` | `f9c0e4` |

**共通ルール:**
- 属性・要素が既に存在する場合はスキップする（べき等）
- `<bpmn:process>` 等の名前空間プレフィックスにも対応している

### Step3.コールアクティビティの呼び出し先プロセスを置換

**呼び出し先プロセスを置換時の注意事項**
- 呼び出し先プロセスに対してチェックは不要。
  - 呼び出し先プロセスの存在チェックや呼び出し先プロセスの内容チェックなどは行わない。

#### 3-1. 置換後の値（プロセス定義キー）の取得
- `to-be-discussed.md` の コールアクティビティの呼び出しプロセス置換履歴と呼び出し先BPMNより置換後の置換後の値（プロセス定義キー）の取得する。
  - コールアクティビティの呼び出しプロセス置換履歴と呼び出し先BPMNのID（プロセス定義キー）の一致を確認する。
  - 置換後の値が未定、`to-be-discussed.md`と呼び出し先BPMNの値が食い違う、呼び出し先BPMNのIDが未置換など、置換後の値が特定できない場合は、3-3.の一覧の「置換後の値」欄に、値不明を表示する。

#### 3-2. 置換済みチェック（JS）
- 更新対象BPMNのコールアクティビティの呼び出し先プロセスの値が置換済みか確認する。
  - 置換済み、かつ、置換後の値が3-1で取得した値と一致する場合は置換不要。

#### 3-3. ユーザー確認（置換実施可否）
- 3-1. 3-2. で取得したコールアクティビティの一覧を表示し置換実施の可否を確認する。また、置換後の値が未定なものはID（プロセス定義キー）を確認し入力を促す。
  - 一覧には、コールアクティビティ名、置換前の値、置換後の値（プロセス定義キー）、置換要否を表示する。
  - 3-2. にて置換不要と判定したコールアクティビティは置換要否欄に「置換済み」を表示する。
  - 3-2. にて未置換と判定したコールアクティビティは置換要否欄に「置換待ち」を表示する。
  - 置換後の値が不明なものは置換要否欄に「値の決定待ち」を表示する。
- 置換後の値が決めれられないコールアクティビティがあれば、そのコールアクティビティへの反映をスキップする旨を表示する。
  - BPMNをIM-BPMへアップロードした後、プロセスデザイナにてコールアクティビティの呼び出し対象を設定することも通知する。

#### 3-4. 置換処理
- 3-3. の一覧よりコールアクティビティの呼び出し対象プロセスの値を置換する。
  - callActivityタグ以下にdocumentationタグを追加。以下を入力する。
    - CALLEE_PROCESS_META:CALEE_PROCESS_REPLACED=true;ORIGINAL_CALLEE_PROCESS=<calledElementの置換前の値>;CALLEE_PROCESS=<置換後の値>;REPLACED_DATE=yyyy-MM-dd;
  - callActivityタグのcalledElementに置換後の値を上書きする。

#### 3-5. 仕様書更新

- `to-be-discussed.md` のコールアクティビティの呼び出しプロセス置換履歴を更新する。
  - 反映日: YYYY-MM-DD

#### 3-6. 変更履歴更新

- `interactive-log.md` に以下を記録する。
  - 実行日時
  - 対象ファイルパス
  - 置換したコールアクティビティの一覧
  - ユーザー確認結果（3-3）

### 呼び出し例（Step1 → Step2 の順で実行）

Step1（プロセス定義キー置換）と Step2（ロールID・色・変数等）は必ず**別々に `reflect()` を呼び出し、Step1 の完了を確認してから Step2 に進むこと**。
1回の `reflect()` に両方のフィールドをまとめて渡さない。

```javascript
var reflector = require('.claude/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector');
var bpmnPath = 'doc/vehicle-management-prompt/vehicle-management.bpmn';

// ---- Step1: プロセス定義キー置換（単独で実施） ----
// processIdReplacements が不要な場合、Step1 は省略して Step2 から直接実施してよい。
reflector.reflect(
  bpmnPath,
  {
    // process id 置換の仕様書照合（to-be-discussed.md の from-to）
    processIdReplacements: [
      { fromId: 'Process_1', toId: 'daily_check_0001' }
    ]
  },
  {
    // ユーザー確認コールバック（Step1 でのみ必要）
    onProcessIdReplacementDetected: function(filePath, replacements, onApprove, onReject) {
      // ユーザーに確認を取り、承認なら onApprove()、拒否なら onReject() を呼び出す
      console.log('File to be replaced: ' + filePath);
      replacements.forEach(function(r) {
        console.log('  ' + r.fromId + ' → ' + r.toId);
      });
      // 実装例：vscode_askQuestions で確認を取る
      onApprove(); // or onReject();
    }
  }
);

// ---- Step2: ロールID・タスクの背景色・オプショナルタスク設定・
//             プロセス変数・シグナル定義・メッセージ定義の反映（Step1 完了後に実施） ----
reflector.reflect(
  bpmnPath,
  {
    // プロセス・プールのロール設定
    processes: [
      { id: 'r_1', roleId: 'quality_safety_mgr' }
    ],

    // レーンのロール設定
    lanes: [
      { id: '_4', roleId: 'quality_safety_mgr' }
    ],

    // ユーザタスクのロール設定（isOptional は任意）
    userTasks: [
      { id: '_32', roleId: 'quality_safety_mgr' },
      { id: '_10', roleId: 'quality_safety_mgr', isOptional: true }
    ],

    // プロセス変数（type: string / int / long / double / datetime / boolean）
    dataObjects: [
      {
        processId: 'r_1',
        variables: [
          { id: 'vehicleId', name: 'vehicleId', type: 'string' }
        ]
      }
    ],

    // 分岐条件（EL式）
    conditions: [
      { flowId: '_50', expression: "${approved == 'true'}" },
      { flowId: '_51', expression: "${approved == 'false'}" }
    ],

    // シグナル定義
    signals: [
      { id: 'sig1', name: 'OrderCompleted' }
    ],

    // メッセージ定義
    messages: [
      { id: 'msg1', name: 'Notification' }
    ],

    // タスクへの配色（taskType は上記カラーマップを参照）
    colorize: [
      { taskId: '_32', taskType: 'userTask' },
      { taskId: '_10', taskType: 'userTask' }
    ]
    // processIdReplacements はここでは指定しない（Step1 で反映済みのため）
  }
);
```

### specs 各フィールドの注意事項

- `processes` / `lanes` / `userTasks`: ロールID（`roleId`）は仕様書のアクター定義に記載された ID を使用すること
- `dataObjects`: `type` には `string` / `int` / `long` / `double` / `datetime` / `boolean` のいずれかを指定する
- `conditions`: `expression` は EL 式で記述する（例: `${p1 > 999}`）。`>` をそのまま書いてよい（スクリプトが値として扱う）
- `colorize`: 全ユーザタスクに色を付けること。他のタスク種別も同様に漏れなく指定すること
- `processIdReplacements`: 仕様書に記載した process id 置換提案（from-to）を設定する。`toId` は必須。`process@id` と `participant@processRef` の双方で `toId` に置換されたことを検証する。`fromId` が反映後に残ってよいケースのみ `allowFromIdExists: true` を付与する。**Step1 の呼び出し時にのみ指定し、Step2 の呼び出しには含めないこと**
- フィールドが不要な場合は省略可（`reflect` は各フィールドを `|| []` で補完する）
- Process ID 置換が伴う場合、第 3 引数 `options` で `onProcessIdReplacementDetected` コールバックを指定する（ユーザー確認フロー用）

### options（第3引数）の指定

**Step1（`processIdReplacements` を渡す呼び出し）でのみ必要。Step2 の呼び出しでは指定不要。**

```javascript
{
  onProcessIdReplacementDetected: function(filePath, replacements, onApprove, onReject) {
    // filePath: 置換対象ファイルパス
    // replacements: 置換内容の配列 [{ fromId: '...', toId: '...' }, ...]
    // onApprove: 承認時のコールバック（引数なし）
    // onReject: 拒否時のコールバック（引数なし）
    //
    // 実装例：
    // - vscode_askQuestions で確認ダイアログを表示
    // - ユーザーが「OK」を選択 → onApprove() 実行
    // - ユーザーが「キャンセル」を選択 → onReject() 実行
  }
}
```
