# 仕様書の構成

生成される仕様書は以下の構成を持つこと

1. 概要
   - 何を行うプロセスか簡潔に説明する。
   - 業務の開始から終了までを一文〜数文で説明。

2. アクター（ロール）
   - プール・レーン・タスク等からプロセスの関与者・関係者を説明
   - プール・レーン・タスクの名称からロールIDを提案する
     - ロールIDは、小文字スネークケース、かつ、20文字以内にすること
   - 以下の書式の一覧を表示すること
      | アクター | ロールID | ロール名 | プール／レーン | 主な担当タスク・イベント |
      |---|---|---|---|---|
      | <アクター名> | <ロールID案> | <ロール名案> | <プール/レーン> | <主な担当タスク等 （省略可）> |

3. プロセス詳細
   - プロセス毎に、以下の書式の一覧を作成し、イベント・タスクを表示すること
     | イベント・タスクの種類 | 担当者 | 画面 | 実行条件の説明 |
     |---|---|---|---|
     | <イベント・タスクの種類> | <担当者> | <画面定義へのリンク または -> | <実行条件の説明> |
     - 一覧の画面項目には、画面がある場合は画面定義名（画面定義へのリンクにする）、ない場合は"-"を記載する
     - コールアクティビティがあれば呼び出し先プロセス名を明記。呼び出し先プロセスの仕様書があれば、呼び出し先プロセス名は仕様書ディレクトリへのリンクとする。
   - プロセスの開始方法を記載する
     - 明確な指示がない場合、IM-BPM標準のプロセス開始一覧から開始
   - プロセスの例外処理（エラーイベントや例外フローの説明）を記載
   - 独立したタスク（シーケンスフローがない、境界イベントがない）は、オプショナルタスクとするか問い合わせる
     - 要検討事項にも記載する
   - 条件分岐：ゲートウェイの条件式や分岐のルールの説明
     - 条件分岐がある場合は必ず判定値を格納するプロセス変数を提案する。
     - 条件分岐用のプロセス変数は、シーケンスフローの条件にてEL式を使った判定式に利用する。
   - 必要に応じてプロセス変数を提案（業務データの主キー情報の持ち回りなどに利用）
   - 取り込んだBPMNに外部連携が想定される機能があれば記載
   - シグナル開始イベントやシグナルキャッチイベントは、シグナルの送信元やシグナル送信の条件を明確にする
     - シグナル送信元や条件が明確でない場合は要検討事項に問い合わせ。
   - メッセージ開始イベントやメッセージキャッチイベントは、メッセージの送信元やメッセージ送信の条件を明確にする
     - メッセージ送信元や条件が明確でない場合は要検討事項に問い合わせ。

## 参照BPMNがiGrafx製である場合に必須
- **判定対象**: SKILL.md step.2 でコピー元として指定した**変換前の元BPMNファイル**を Read ツールで直接参照して判定すること（複製は作成しない。参照のみで、当該ファイルの変更は禁止）。変換後の `<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn` は `bpmn-transform.js` による IM-BPM 向け変換で ixbpmn:/igx: 要素・属性が除去済みのため、本チェックには使用できない。
- iGrafx製かどうかの判定基準は `.claude/skills/bpm-docs-generator/scripts/bpmn-transform.js` の `detectVendor()` と同一とする。元BPMN内に以下のいずれかが含まれる場合、iGrafx製と判定する。
  - `exporter="iGrafx"`
  - `ixbpmn:` 接頭辞を持つ要素・属性
  - 名前空間URIに `igrafx.com` を含む `xmlns:*` 宣言
- NG（IM-BPMではサポートしていない）と判定する要素と条件
  | 要素名 | 判定条件 | 対処案 |
  | ---- | ---- | ---- |
  | 多階層レーン | `lane` の子要素に `childLaneSet`タグ がある | レーンを1階層にする変更を提案 |
  | レーンが無いプール| `process`タグの子要素に `laneSet` がない | レーンの追加を推奨 |
  | 垂直プール| `pool` または `lane` と関連する `bpmndi:BPMNShape`タグに `isHorizontal="false"` 属性がある | プールへの変更 |
  | 省略イベントサブプロセス| `subProcess（triggeredByEvent="true"）` と関連する `bpmndi:BPMNShape`タグに `isExpanded="false"` 属性がある| イベントサブプロセスへの変更を提案 |
  | 省略サブプロセス | `subProcess（triggeredByEvent="false"）` と関連する `bpmndi:BPMNShape`タグに `isExpanded="false"` 属性がある | サブプロセスへの変更を提案 |
  | メッセージ送信イベント | 子要素に `messageEventDefinition`タグ がある `startEvent`タグ  | 他イベントによる代替を推奨 |
  | エスカレーションキャッチイベント | 子要素に `escalationEventDefinition`タグ がある `boundaryEvent`タグ | 他イベントによる代替を推奨 |
  | キャンセルキャッチイベント | 子要素に `cancelEventDefinition`タグ がある `boundaryEvent`タグ | 他イベントによる代替を推奨 |
  | 補正キャッチイベント | 子要素に `compensateEventDefinition`タグ がある `boundaryEvent`タグ | 他イベントによる代替を推奨 |
  | 条件付きイベント | 子要素に `conditionalEventDefinition`タグ がある `intermediateCatchEvent`タグ | 他イベントによる代替を推奨 |
  | リンクイベント受信 | 子要素に `eventDefinitionRef`タグ がある `intermediateCatchEvent`タグ | 他イベントによる代替を推奨 |
  | 複数スローイベント | 子要素に複数の `messageEventDefinition`タグ がある `endEvent`タグ | 他イベントによる代替を推奨 |
  | 複合ゲートウェイ | `complexGateway`タグ | 他のゲートウェイによる代替を推奨 |
  | 送信タスク | `sendTask`タグ | 他のタスクによる代替を推奨 |
  | ビジネス規則タスク | `businessRuleTask`タグ | 他のタスクによる代替を推奨 |
  | 通知タスク | `ixbpmn:extendedTaskType="NOTIFICATION"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
  | マッピングタスク | `ixbpmn:extendedTaskType="MAPPING"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
  | レポートタスク | `ixbpmn:extendedTaskType="REPORTING"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
  | 手動サービスタスク | `ixbpmn:extendedTaskType="MANUAL_SERVICE"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
  | 自動サービスタスク | `ixbpmn:extendedTaskType="AUTOMATED_SERVICE"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
  | 規則フロータスク | `ixbpmn:extendedTaskType="RULE_FLOW"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
  | 規則スクリプトタスク | `ixbpmn:extendedTaskType="RULE_SCRIPT"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
  | 決定表タスク | `ixbpmn:extendedTaskType="DECISION_TABLE"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
  | 規則タスク | `ixbpmn:extendedTaskType="RULE"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
  | 規則セットタスク | `ixbpmn:extendedTaskType="RULE_SET"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
  | フロー規則セットタスク | `ixbpmn:extendedTaskType="FLOW_RULE_SET"` 属性がある `task`タグ | 他のタスクによる代替を推奨 |
- 上記NG要素の判定結果は、`specification.md` のプロセス詳細への記載と同じタイミングで、`to-be-discussed.md` にも出力する。
  - 検証結果・対処案: 1章「iGrafx固有要素の互換性チェック」に、重要度「高」固定で、対処案を含めて記載する（記載ルールは `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` 参照）。
  - `spec-to-bpmn-fixes.json` への出力は行わない（iGrafx側でBPMNを修正する運用のため、`.claude/skills/bpm-xml-reflector/SKILL.md` による自動反映の対象外とする）。
- コールアクティビティは呼び出し先のプロセス名を明記する。特定方法は以下。
  - 使用スクリプト: `.claude/skills/bpm-docs-generator/scripts/search-called-elements.js` の戻り値より、コールアクティビティ毎の呼び出し先を確認。
    - 実行例: `{{ENSURE_CMD}} .claude/skills/bpm-docs-generator/scripts/search-called-elements.js <diagram.bpmn>`
  - プロセス詳細のコールアクティビティの項目に、結果を明記する。（プロセス名、または呼び出し先不明）
  - `to-be-discussed.md`の「3章コールアクティビティの呼び出しプロセス置換履歴」にも結果を記載する。
  - 呼び出し先プロセスが確定した場合は、`spec-to-bpmn-fixes.json` にも `operation: "replace-callee-process"` として出力する（詳細は本ファイル末尾「`spec-to-bpmn-fixes.json` への出力」参照）。呼び出し先不明の場合は出力しない。

**プロセス変数の注意事項**
 - プロセス変数は、ID、名前、型を提案する。
   - IDと名前は設定する値が類推できるようなものにする。
   - 型は`string`、`boolean`、`datetime`、`int`、`long`、`double`から値の用途に合わせて選択する。
 - プロセスインスタンスIDは、暗黙オブジェクト（${execution.processInstanceId}）から取得できるため、プロセス変数の候補から外す。
 - 業務データの項目で代用できる要素はプロセス変数の候補から外す。
 - **後続の開始イベント・ユーザタスクが、前工程で入力された業務データを表示・引き継ぐ必要がある場合**（業務データが `プロセスインスタンスID + タスクID` の複合主キーで「1タスク完了=1行」管理されているケース。[guide-business-data.md](.claude/skills/bpm-docs-generator/reference/guide-business-data.md) 参照）、前工程の完了時に自身のタスクIDを保持するプロセス変数を提案すること。
   - 命名例: `<機能名>TaskId`（例: 「購入申請入力」タスクなら `applyTaskId`）。型は `string`。
   - 用途: 後続タスクの画面表示処理にて、`プロセスインスタンスID + 当該プロセス変数` を検索条件として前工程のレコードを取得するために使用する。分岐判定用のプロセス変数とは目的が異なる点を明記する。
   - 設定タイミング: 前工程（開始イベントまたはユーザタスク）の完了処理にて、自身の `taskId`（または開始イベントの場合はプロセスインスタンス開始時に払い出されたタスクID等）をそのまま設定する。
 - 開始イベントの入力値を、開始と同時に業務データへ直接登録する方針（[guide-business-data.md](.claude/skills/bpm-docs-generator/reference/guide-business-data.md) 「開始イベントが業務データの入出力に関わる場合」参照）を採用する場合、その項目はプロセス変数の候補から除外する。後続タスクはプロセス変数ではなく、業務データ（固定疑似タスクIDの行）から再取得して利用する旨を明記する。

## `spec-to-bpmn-fixes.json` への出力

本ガイドで提案・確定する以下の項目は、`specification.md`（および該当する場合は `to-be-discussed.md`）への記載と同じタイミングで `doc/<BPMプロセス名>-prompt/spec-to-bpmn-fixes.json` にも出力する。エントリ構造・`fixId` 命名規則・`operation` 統制語彙は `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` の「`spec-to-bpmn-fixes.json` の形式」を正とし、BPMN への実反映は `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` の `reflectFixes()` が本ファイルを唯一の入力として行う。

| 提案項目 | `operation` | `targets` の対象 | 主な `params` |
|---|---|---|---|
| ロールID（プール／プロセス開始者） | `set-role-starter-groups` | process | `roleId` |
| ロールID（レーン） | `set-lane-candidate-groups` | lane | `roleId` |
| ロールID（タスク）／オプショナルタスク | `set-usertask-candidate-groups` | userTask | `roleId`, `isOptional`（該当時） |
| タスクの背景色 | `set-task-color` | task | `taskType` |
| プロセス変数 | `add-data-object` | process | `variables: [{ id, name, type }]` |
| シグナル定義 | `add-signal` | - | `id`, `name` |
| メッセージ定義 | `add-message` | - | `id`, `name` |
| コールアクティビティの呼び出し先プロセス置換 | `replace-callee-process` | callActivity | `fromId`, `toId` |

**出力時の注意事項**
- シグナル・メッセージは、送信元や送信条件が明確でなく要検討事項として問い合わせ中（未確定）の場合、`id`/`name` が判明していてもエントリを作成しないこと。ユーザーからの回答が確定してから追加する。
- コールアクティビティの呼び出し先置換は、`.claude/skills/bpm-docs-generator/scripts/search-called-elements.js` の結果が「呼び出し先不明」の場合はエントリを作成しない。呼び出し先プロセス名が確定した時点で `fixId: CALLEE-<連番>` として追加する。
- タスクの背景色（`set-task-color`）は、以下をすべて満たす場合、仕様書に明示指示がなくても自動的にエントリを作成する（`requiresApproval: false`）。
  - 対象BPMNがiGrafx製である（IM-BPM製は `activiti:color` が別途運用されている前提のため対象外）。判定は本ファイル冒頭「参照BPMNがiGrafx製である場合に必須」と同じく、コピー元BPMN（変換前の元ファイル）を参照して行うこと。
  - 対象タスクの種別が `bpmn-xml-reflector` のカラーマップ対象である（`userTask` / `scriptTask` / `serviceTask` / `mailTask` / `manualTask` / `receiveTask` / `callActivity`。詳細は `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 「タスク種別と color 値の対応」参照）
  - 対象タスクに `color` 属性が未設定である（既に設定済みの場合は既存の配色を尊重し、エントリを作成しない）
- ロールID・タスク色・プロセス変数など、業務判断を要さず仕様書の記載内容から一意に決まる項目は `requiresApproval: false` としてよい（ただし `replace-callee-process` は破壊的操作のため常に `true`）。
- `fixId` の命名規則（`ROLE-`/`COLOR-`/`VAR-`/`SIG-`/`MSG-`/`CALLEE-` 等の接頭辞）は `.claude/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` を参照。
- **プロセス変数（`add-data-object`）の `targets.elementId` は対象 process の `id`（processId）を指定する。同じ `spec-to-bpmn-fixes.json` に、その process を対象とする `replace-process-id`（プロセス定義キー置換）のエントリが存在する場合は、`targets.elementId` に置換前の値（`fromId`）ではなく **置換後の値（`toId`）** を指定すること。** `reflectFixes()` は fixes 配列を先頭から順に適用するため、置換前の値を指定すると process id 置換の反映後に対象 process が見つからず、`add-data-object` が無言でスキップされる（詳細: `.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` 「`targets` の指定ルール」参照）。
