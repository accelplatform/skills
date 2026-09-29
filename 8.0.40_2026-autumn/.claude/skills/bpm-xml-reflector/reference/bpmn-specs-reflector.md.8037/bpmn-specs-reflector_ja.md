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
  - プロセス定義キー置換（iGrafx製BPMN限定）
  - コールアクティビティの呼び出し先プロセス置換
  - ロールIDの追加
  - タスクの背景色設定
  - オプショナルタスク設定
  - プロセス変数定義追加
  - 分岐条件式（conditionExpression）の追加
  - シグナル定義追加
  - メッセージ定義追加
  - `.claude/skills/bpm-docs-generator/scripts/validate-bpmn.js` が検出したエラーの訂正案反映

## 全体構成（3段階）

仕様書の内容を BPMN へ反映する処理は、**「判断・確定」と「機械的な書き込み」を分離**した3段階で構成する。

```
フェーズ1: spec-to-bpmn-fixes.json 作成      ← bpm-docs-generator 側（人間確認を含む）
         ↓
フェーズ2: 仕様書との差分チェック・反映       ← bpm-xml-reflector 側（人間確認を含む）
         ↓
フェーズ3: JSON反映（reflectFixes()）        ← bpm-xml-reflector 側（本スキルの責務）
```

### フェーズ1: `spec-to-bpmn-fixes.json` 作成
仕様書に記載された内容（下表）を、機械可読な `operation` / `params` / `targets` 形式に変換し、`doc/<BPMプロセス名>-prompt/spec-to-bpmn-fixes.json` へ出力する。**チェック・ユーザーへの問い合わせなど「何を反映するか」の判断は、すべてこのフェーズで完了させる。** 未確定の項目（signal/message の ID が仕様書に未定義など）は本ファイルに書き出さない（＝反映もスキップされる）。

| 反映内容 | 詳細を規定するガイド |
|---|---|
| `.claude/skills/bpm-docs-generator/scripts/validate-bpmn.js` エラー訂正案 | `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` |
| プロセス定義キー（process id）置換 | `.claude/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md` |
| コールアクティビティの呼び出し先プロセス置換 | `.claude/skills/bpm-docs-generator/reference/guide-specification.md`（コールアクティビティ節） |
| ロールID・タスク色・オプショナル・プロセス変数・シグナル・メッセージ | `.claude/skills/bpm-docs-generator/reference/guide-specification.md` |
| `spec-to-bpmn-fixes.json` のエントリ構造・`fixId`命名規則・operation統制語彙 | `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`（「`spec-to-bpmn-fixes.json` の形式」節） |

このフェーズは `.claude/skills/bpm-docs-generator` 側の責務である。ただし、本フェーズ完了後に `to-be-discussed.md` / `specification.md` / `supplement.md` 等が直接編集され `spec-to-bpmn-fixes.json` に反映されないまま放置されるケースがあるため、`reflectFixes()`（フェーズ3）実行前に必ずフェーズ2（次節）を経由すること。

### フェーズ2: 仕様書との差分チェック・反映

`spec-to-bpmn-fixes.json` 作成後に仕様変更（要検討事項への回答の直接追記、業務要件の追加・修正等）が発生すると、`spec-to-bpmn-fixes.json` に反映されないまま取り残され、`reflectFixes()` を実行しても最新の仕様が BPMN に反映されない問題が起きる。これを防ぐため、**`reflectFixes()`（フェーズ3）実行前に必ず本フェーズを実施する。**

**チェック対象:**
- `doc/<BPMプロセス名>-prompt/to-be-discussed.md`（特に3〜5章の要検討事項の記述、および各項目の「訂正案」行の `reflectStatus` 表示）
- `doc/<BPMプロセス名>-prompt/specification.md`
- `doc/<BPMプロセス名>-prompt/supplement.md`
- 上記と `doc/<BPMプロセス名>-prompt/spec-to-bpmn-fixes.json` の内容

**差分の検出パターン:**

| パターン | 検出内容 | 対応 |
|---|---|---|
| ① reflectStatus 不一致 | md 側で要検討事項に回答・確定記述が追記された（例: `pending-confirmation` だった論点が確定した）のに、対応する `spec-to-bpmn-fixes.json` エントリの `reflectStatus` が未更新 | エントリの `reflectStatus` / `params` を更新（`ready` へ引き上げ等） |
| ② エントリ未作成 | md 側に新規の業務要件反映事項（ロールID・タスク色・プロセス変数・シグナル・メッセージ・process id 置換・コールアクティビティ呼び出し先置換等）が追記されたが、対応する `spec-to-bpmn-fixes.json` エントリが存在しない | `guide-bpmn-validation.md` の `fixId` 命名規則・`operation` 統制語彙に従って新規エントリを追加 |
| ③ 内容の乖離 | 既存エントリの `params` 等が、md 側の最新記述と食い違う（値の変更・削除等） | エントリの `params` を md の内容に合わせて更新 |

**手順:**
1. `spec-to-bpmn-fixes.json` の各エントリと、対応する md の記述を突き合わせ、上記パターンに該当する差分を洗い出す。
2. 差分が1件もない場合は、その旨を記録した上でフェーズ3へ進んでよい（本フェーズはスキップ可）。
3. 差分がある場合は、各差分について **fixId・変更前後の内容（`reflectStatus`/`operation`/`params`）をユーザに提示し、反映してよいか確認を取る**（自動反映しない）。
4. 承認された差分のみ `spec-to-bpmn-fixes.json` に反映する。この反映は JSON ファイルの追加・更新のみであり、**BPMN 本体には一切書き込まない**（BPMN への書き込みは次のフェーズ3の責務）。
5. `fixId` 命名規則・`reflectStatus` の意味・`operation` 統制語彙・`requiresApproval` の既定値は、いずれも `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md`「`spec-to-bpmn-fixes.json` の形式」節に従う（本フェーズはフォーマットの新規定義を行わない）。

**注意:**
- 本フェーズは「判断・確定」フェーズであり、フェーズ1（`.claude/skills/bpm-docs-generator` 側）と同様にユーザ確認を必須とする。`reflectFixes()`（フェーズ3）側の「新たな判断を行わない」という原則には影響しない。
- md 側の記述を機械的に構造化データへ変換する処理（自然言語解釈）を伴うため、本フェーズは人手（または本スキルを呼び出すエージェント）による読み合わせで行い、専用スクリプトによる自動差分検出は前提としない。

### フェーズ3: JSON反映（`reflectFixes()`）
`spec-to-bpmn-fixes.json` を読み込み、`reflectStatus: "ready"` かつ対応 `operation` のエントリのみを対象 BPMN へ機械的に反映する。**判断・確定済みの内容を書き込むことに専念し、新たな判断（何を反映するかの決定）は行わない。** ただし `replace-process-id` / `replace-callee-process` の検証・リトライ・トークン付与は「書き込み内容が仕様書の指示どおりに反映されたか」の機械的な整合性検証であり、本フェーズの責務に含まれる。

反映ロジックは `.claude/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js` に実装されている。以下はその概要と呼び出し方である。

## `reflectFixes()` の使い方

`reflectFixes()` を呼び出す前に、必ず「フェーズ2: 仕様書との差分チェック・反映」を実施し、`spec-to-bpmn-fixes.json` を最新化しておくこと。

### 呼び出し例

```javascript
var reflector = require('./.claude/skills/bpm-xml-reflector/scripts/bpmn-specs-reflector.js');
var bpmnPath = 'doc/sample-process-prompt/sample-process.bpmn';
var fixesPath = 'doc/sample-process-prompt/spec-to-bpmn-fixes.json';

var result = reflector.reflectFixes(bpmnPath, fixesPath, {
  // fix 単位の承認コールバック（requiresApproval: false のエントリは省略可）
  onFixReflectionDetected: function (fix, onApprove, onReject) {
    // fixId・operation・targets・params をユーザーに提示し、承認を取る
    console.log('fixId=' + fix.fixId + ' operation=' + fix.operation);
    console.log('targets=' + JSON.stringify(fix.targets) + ' params=' + JSON.stringify(fix.params));
    // 実装例：vscode_askQuestions で確認を取る
    onApprove(); // or onReject();
  }
});

console.log(result); // { applied: ['FIX-001', ...], skipped: [{ fixId, reason }, ...] }
```

- `bpmnPath` は `doc/*-prompt/*.bpmn` 形式以外を渡すと例外がスローされる（`isPromptCopyBpmnPath()` による）。
- 反映後、`reflectedDate` のみが更新され `fixesPath` が上書き保存される（`reflectStatus` は判定根拠を残すため変更しない）。
- `skipped` に積まれる理由は主に次の4種類：
  - `reflectStatus is not ready: ...`（`pending-confirmation` / `not-applicable`）
  - `unsupported operation (manual reflection required): ...`（`convert-event-type` / `delete-element` / `manual`）
  - `user rejected` / `approval required but no confirmation callback provided`
  - `apply failed: ...`（`replace-process-id` 等の検証失敗。他の fix の反映は継続される）

### 製造ベンダー判定

`reflectFixes()` は BPMN 読み込み時に `detectVendor(xml)` でネームスペース宣言から製造ベンダーを自動判定し、`applyFixToTarget()` 経由で各 `applyXxx` 系関数にベンダー種別を引き渡す。判定結果に応じて、付与する属性名・要素タグ名が切り替わる（具体的な対応は各 `apply*` 関数・`resolveVendorName()` の実装を正とする。「共通ルール」参照）。

| ベンダー | 判定条件 |
|---------|---------|
| `im-bpm`（IM-BPM 製） | `xmlns:activiti="http://activiti.org/bpmn"` を含む |
| `igrafx`（iGrafx 製） | ネームスペース URI に `www.igrafx.com` を含む |
| `other`（その他） | 上記いずれにも該当しない |

### operation 対応表

| operation | 反映内容 | 主な `params` | 特記事項 |
|---|---|---|---|
| `set-attribute` | 既存要素への属性追加・更新 | `attrName`, `attrValue` | 任意の要素・属性に対応する汎用 operation |
| `set-eventdef-ref` | イベント定義への `messageRef`/`signalRef`/`errorRef` 設定 | `refType`, `refId` | 要素が自己終了タグの場合はスキップ |
| `set-service-task-field` | ServiceTask の `activiti:field` 値設定 | `fieldName`, `fieldValue`（複数まとめる場合は `fields: [{name, value}]`） | |
| `set-condition-expression` | `sequenceFlow` への分岐条件式（EL式）追加 | `expression` | |
| `set-timer-definition` | `timerEventDefinition` の周期・日時・期間設定 | `timeCycle` / `timeDate` / `timeDuration`（いずれか）, `businessCalendarName`（任意） | 対象要素が自己終了タグ、または `timerEventDefinition` が存在しない場合はスキップ |
| `set-role-starter-groups` | `process` への `candidateStarterGroups` 設定 | `roleId` | target は process |
| `set-lane-candidate-groups` | `lane` への `candidateGroups` 設定 | `roleId` | target は lane |
| `set-usertask-candidate-groups` | `userTask` への `candidateGroups`・`isOptional` 設定 | `roleId`, `isOptional`（任意） | target は userTask |
| `set-task-color` | タスクへの背景色設定 | `taskType` | `taskType` からカラーコードを自動決定（下記カラーマップ参照） |
| `add-data-object` | `process` へのプロセス変数（`dataObject`）追加 | `variables: [{ id, name, type }]` | target は process。既存 id はスキップ（冪等） |
| `add-signal` | `signal` 要素の新規追加 | `id`, `name` | 仕様書で ID が未定義の場合は本ファイルに書き出さない（＝反映されない）。既存 id はスキップ（冪等） |
| `add-message` | `message` 要素の新規追加 | `id`, `name` | 同上 |
| `replace-process-id` | プロセス定義キー（process id）置換。検証（最大2回リトライ）・`PROCESS_KEY_META` トークン付与を伴う | `fromId`（置換対象特定用）, `toId`（置換値）, `allowFromIdExists`（任意） | 破壊的操作。`requiresApproval: true` を必須とし、機械反映時（本フェーズ）にも承認を求める |
| `replace-callee-process` | callActivity の呼び出し先プロセス（`calledElement`）置換。`CALLEE_PROCESS_META` トークン付与を伴う | `fromId`（置換前の `calledElement` 値）, `toId`（置換後の値） | target は callActivity。破壊的操作。`requiresApproval: true` を必須とする |

`convert-event-type` / `delete-element` / `manual`（構造変更・削除・図形情報同期を伴う操作）は自動反映の対象外であり、`reflectFixes()` はスキップする（人手対応・別ステップ対応に委ねる。詳細: `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` 「設計上の制約」節を参照）。

### `targets` の指定ルール

- 既存要素を対象とする operation（`set-attribute` 系、`set-role-starter-groups` 系、`replace-callee-process` 等）は `targets: [{ elementId, elementType }]` で対象要素の実 ID を指定する。
- `replace-process-id` は対象 process 自体の `id` を書き換えるため、置換対象の特定には `params.fromId` を用いる（`targets` を付与してもよいが、実際の反映処理では参照しない）。
- `add-signal` / `add-message` のように新規 ID を発行する operation は、既存要素を参照するものではないため、`targets: [{ elementId: <新規発行する id>, elementType: 'bpmn:Signal' | 'bpmn:Message' }]` として `params.id` と同値を記載する（一覧性・トレーサビリティのため）。
- **`add-data-object` の `targets.elementId` は process 自体の `id`（processId）を参照する。** 同じ `spec-to-bpmn-fixes.json` 内に、その process を対象とする `replace-process-id` エントリが存在する場合、`add-data-object` の `targets.elementId` には **置換後の値（`toId`）** を指定すること。`reflectFixes()` は fixes 配列を先頭から順に適用するため、`replace-process-id` が先に反映されて process の `id` が書き換わった後は、置換前の値（`fromId`）を `targets.elementId` に指定していると対象 process が見つからず `[SKIP] process not found: <fromId>` としてスキップされる（例外にはならず `applied` にも `skipped` にも計上されない、無言のスキップである点に注意）。同様の注意は今後 process 自体を target とする operation を追加する場合にも当てはまる。

  | fixes.json 内の並び順 | `add-data-object` の `targets.elementId` に指定すべき値 |
  |---|---|
  | `replace-process-id` を含まない（process id 置換が発生しない） | 現在の process id（変更なし） |
  | `replace-process-id` を同時に含む | 置換後の値（`toId`）。置換前の値（`fromId`）を指定すると無言でスキップされる |

### タスク種別と color 値の対応

| taskType | color |
|----------|-------|
| `userTask` | `bbdefb` |
| `scriptTask` | `fff9c4` |
| `serviceTask` | `f9dcc0` |
| `mailTask` | `f7c9cf` |
| `manualTask` | `b2dfdb` |
| `receiveTask` | `e0caf7` |
| `callActivity` | `f9c0e4` |

### 共通ルール

- 属性・要素が既に存在する場合はスキップする（べき等）。`replace-process-id` / `replace-callee-process` も、埋め込み済みの `PROCESS_KEY_META` / `CALLEE_PROCESS_META` トークンの有無で判定し、同一の fix を再実行しても二重に反映されない。
- `<bpmn:process>` 等の名前空間プレフィックスにも対応している。
- ベンダーの判定・属性名/タグ名の切り替えは `reflectFixes()` 内部で自動的に行われるため、呼び出し側で意識する必要はない。属性名・タグ名がベンダーごとに具体的にどう変わるかは各 `apply*` 関数（`bpmn-specs-reflector.js`）・`resolveVendorName()` / `detectVendor()`（`bpmn-reflector-utils.js`）の実装・JSDoc を正とする（本ファイルでは重複管理しない）。

## `applyFixToTarget()` から呼び出される主要関数

| 関数 | 役割 |
|------|------|
| `detectVendor(xml)` | ネームスペース宣言から製造ベンダー（`'im-bpm'` / `'igrafx'` / `'other'`）を判定する |
| `applyProcessCandidateStarterGroups(xml, processId, roleId, vendor)` | `set-role-starter-groups` の反映本体 |
| `applyLaneCandidateGroups(xml, laneId, roleId, vendor)` | `set-lane-candidate-groups` の反映本体 |
| `applyUserTaskCandidateGroups(xml, taskId, roleId, vendor)` | `set-usertask-candidate-groups` の反映本体（`candidateGroups` 部分） |
| `applyIsOptional(xml, taskId, vendor)` | `set-usertask-candidate-groups` の反映本体（`params.isOptional` が true の場合のみ） |
| `applyTaskColor(xml, taskId, taskType, vendor)` | `set-task-color` の反映本体 |
| `applyAttribute(xml, elementId, attrName, attrValue)` | `set-attribute` の反映本体。既存の `apply*` 系と異なり値を上書きする |
| `applyEventDefinitionRef(xml, elementId, refType, refId)` | `set-eventdef-ref` の反映本体 |
| `applyServiceTaskField(xml, taskId, fieldName, fieldValue)` | `set-service-task-field` の反映本体 |
| `applyTimerDefinition(xml, ownerId, params)` | `set-timer-definition` の反映本体 |
| `applyDataObjects(xml, processId, variables, vendor)` | `add-data-object` の反映本体 |
| `applyConditionExpression(xml, flowId, expression, vendor)` | `set-condition-expression` の反映本体 |
| `applySignal(xml, signalId, signalName, vendor)` | `add-signal` の反映本体 |
| `applyMessage(xml, messageId, messageName, vendor)` | `add-message` の反映本体 |
| `applyCalleeProcessReplacement(xml, callActivityId, fromId, toId)` | `replace-callee-process` の反映本体。`calledElement` 属性の上書きと `CALLEE_PROCESS_META` トークン付与を行う |
| `applyVerifiedProcessIdReplacements(xml, replacements)` | `replace-process-id` の反映本体。メモリ上で置換・検証（最大2回リトライ）・`PROCESS_KEY_META` トークン付与まで行う（ファイル書き込みは行わない） |
| `applyFixToTarget(xml, fix, target, vendor)` | `fix.operation` に応じて上記関数へ振り分ける（`replace-process-id` / `replace-callee-process` は `reflectFixes()` 内で別途処理） |
| `reflectFixes(bpmnPath, fixesPath, options)` | 本ファイルのメイン API。上記をまとめて実行する |
| `replaceProcessId(xml, fromId, toId)` | Process ID を置換する（`<process id>` と `<participant processRef>` の両方を置換） |
| `extractRepositoryObjectId(xml)` | `<bpmn:definitions>` が持つ `ixbpmn:repositoryObjectID` 属性値を取得する（iGrafx製BPMN限定。存在しない場合は `null`） |
| `applyProcessKeyMetaToken(xml, fromId, toId)` | `<process id="toId">` に `PROCESS_KEY_META` トークンを documentation として追加する |
| `verifyProcessIdReplacements(xml, replacements)` | process id 置換 from-to と反映後 BPMN の一致を検証する（`process@id` と `participant@processRef` を照合） |
| `checkProcessIdReplaced(bpmnPath, replacements)` | Process ID 置換が既に反映済みかを判定する（`replaced` / `not_replaced` / `partial`）。フェーズ1のチェックに使用（`.claude/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md` 参照） |

## PROCESS_KEY_META / CALLEE_PROCESS_META トークンの書式

`process@id` の置換後、processタグに下記フォーマットのトークンを documentation として追記する（既存記述は保持）。

```
PROCESS_KEY_META:{REPOSITORY_OBJECT_ID=<repositoryObjectIdの値>;ORIGINAL_PROCESS_KEY=<元のprocess_id>;PROCESS_KEY=<採番後process_id>};
```

- 既に `<documentation>`（または `<bpmn:documentation>`）要素が存在し、かつ `PROCESS_KEY_META` トークンが未定義の場合は、その既存要素内にトークンを追記する（新規要素は追加しない）。
- documentation 要素が存在しない場合は、ベンダー判定（`detectVendor()`）に応じたタグ名で新規要素を追加する: IM-BPM 製は `<bpmn:documentation>`、それ以外（iGrafx製・その他）は `<documentation>`。
- 既に `PROCESS_KEY_META` トークンが存在する場合は重複追加を避けるためスキップする。
- `REPOSITORY_OBJECT_ID` は対象 process の属性ではなく、**`<bpmn:definitions>`（ファイル直下のルート要素）が持つ `ixbpmn:repositoryObjectID` 属性値**を参照する（iGrafx製BPMN限定の属性）。
- `<bpmn:definitions>` に `ixbpmn:repositoryObjectID` 属性が存在しない場合は、**エラーとして処理を中断する**（対象 `.bpmn` へは一切書き込まない）。この中断は検証リトライとは独立した失敗条件であり、リトライは行わない。

callActivity の呼び出し先プロセス置換後は、以下のフォーマットのトークンを documentation として callActivity 直下に追記する。

```
CALLEE_PROCESS_META:CALEE_PROCESS_REPLACED=true;ORIGINAL_CALLEE_PROCESS=<calledElementの置換前の値>;CALLEE_PROCESS=<置換後の値>;REPLACED_DATE=yyyy-MM-dd;
```

- 既存の documentation 要素があればその中に追記し、無ければ新規追加する（`PROCESS_KEY_META` と同様のルール）。
- 既にトークンが存在する場合は重複追加を避けるためスキップする。

## 検証失敗時の扱い（`replace-process-id` / `replace-callee-process`）

- `replace-process-id` の検証（`verifyProcessIdReplacements()` 相当）に失敗した場合は最大2回まで自動で再試行する。再試行しても失敗する場合は当該 fix のみ `skipped` に積み、他の fix の反映は継続する。
- `REPOSITORY_OBJECT_ID` が取得できない場合（iGrafx製 BPMN で `ixbpmn:repositoryObjectID` 属性が無い等）は、検証リトライとは独立した失敗条件として即座にエラーとし、対象 `.bpmn` へは一切書き込まない。

## 例外: 再置換の禁止

置換済みと判定された process に対しては、新規採番を実施してはならない。必ず既存キーを再利用する。フェーズ1（`spec-to-bpmn-fixes.json` 作成）で `checkProcessIdReplaced()` 等を用いてこの判定を行う（詳細: `.claude/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md`）。

- 既存キーの取得先:
  - documentation トークンから `PROCESS_KEY=<key>` を抽出
