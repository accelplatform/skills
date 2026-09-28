# BPMN 構文・参照整合性検証ガイド

BPMNファイル読み込み直後に実施する「BPMN 構文・参照整合性検証」の具体手順と記載ルールを定義する。

## 目的
BPMN 2.0 XML の記法不備・参照切れ・図形情報との対応ずれを早期に検出し、仕様書作成（step.4）への進行可否を判断する。

## 実行手順（必須）

**使用スクリプト:** `.github/skills/bpm-docs-generator/scripts/validate-bpmn.js`

```sh
# 基本
{{ENSURE_CMD}} .github/skills/bpm-docs-generator/scripts/validate-bpmn.js <diagram.bpmn> --rules .github/skills/bpm-docs-generator/scripts/rules-validate-default.json
# 追加ルール指定時
{{ENSURE_CMD}} .github/skills/bpm-docs-generator/scripts/validate-bpmn.js <diagram.bpmn> --rules <rules.json>
```

**終了コード:** 0 = 成功（warning のみまたはなし）／ 1 = 失敗（error あり）

**`--rules <rules.json>` の使いどころ:**
- 標準の構文・参照整合性チェックに加え、`activiti:type` ごとに必須項目や書式が異なる `ServiceTask`（メールタスク・ワークフロー起動タスク等）のフィールド検証など、業務固有のルールを追加検証したい場合に指定する。
- `doc/rules-validate.json` が存在する場合は、それを優先して使用する。存在しない場合は `scripts/rules-validate-default.json` を使用する。新たな検証観点を追加する場合は、`.github/skills/bpm-docs-generator/reference/guide-bpmn-validation-rules.md` の仕様に厳密に従って `doc/rules-validate.json` を作成・更新すること。
- `rules.json` に基づく検証結果も validate-bpmn.js の直接出力であるため、本ガイドの ERROR/WARN 記載ルールと同様に扱う（`[input(<id>)]` の文脈情報を保持したまま整理する）。


**実行順序（BPMNファイル読み込み直後に必ず実施）:**
1. validate-bpmn.js を実行する。
   - 検証観点: 名前空間整合性（`xmlns:bpmn`, `xmlns:bpmndi`）・接続元/接続先整合性・図形配置との対応整合性・startEvent/endEvent の存在
2. 検証結果に対し詳細分析を行う。
   - **エラー分類の実施**
     - 各エラーを見ただけで「実問題」か「ツール誤検出」かを判定しようとしない。
     - 以下の情報を確認して判定する:
       - BPMN XML の該当要素の実装状況（出力例: `<bpmn:startEvent id="...">` が存在するか）
   - **重要度判定の実施**
     - 単に「エラー」「警告」の分類では不十分。
     - 実際にIM-BPMインポートやプロセス実行に影響するかを確認する。
     - 影響ない場合でも、運用・保守性の観点から重要度を再評価する。
   - **原因候補の深掘り**
     - ツール出力仕様の確認（iGrafx の場合、バージョン・エクスポート設定）
     - 類似プロセスとの比較（同じエラーが他プロセスに存在するか）
   - **影響分析の実施**
     - 「仕様書作成に影響するか」を重視する。
     - 実装やテストフェーズでの影響可能性も検討する。
     - 「無視できる」と判断した場合でも、理由を明記する。
3. 検証結果を to-be-discussed.md へ反映する。
4. step.4 への進行可否を判断する。

**注意事項**
- validate-bpmn.js に未実装の観点は、BPMN 構文・参照整合性検証結果には記載しない。
- validate-bpmn.js に存在しない新規の構文チェック、参照チェック、標準準拠チェックなどは実施しない。
- また、validate-bpmn.js に存在しないチェックに対して、本ガイドの詳細分析を実施しない。
- 単なるエラーログの転記にせず、利用者が次に実施すべき対応が分かる記述にする。

### 詳細分析の指針

#### 重要度判定基準
各エラーに対して、以下の基準に基づいて重要度（高/中/低）を付与する。

| 重要度 | 判定基準 | 判定例 | 出力方針 |
|--------|---------|--------|----------|
| **高** | プロセス実行に直接悪影響、IM-BPMインポート失敗の可能性が高い、業務フロー自体が成立しない | 開始/終了イベント不足、無効な参照、デッドロック構造 | **個別起票する** |
| **中** | インポートは成功するがプロセス実行時に警告/エラーになる、実装時に追加作業が必要 | 非標準記法、属性値の曖昧性 | **個別起票する** |
| **低** | 仕様化・実装・運用に直接影響がない、将来の保守性向上の観点でのみ改善推奨 | ツール誤検出、未使用リソース定義、非公式な関連付け | **サマリの件数のみ。個別起票しない** |


#### 根本原因分析の指針
各エラーに対して、以下の観点から根本原因を推測し、複数案を提示する。

1. **設計フェーズの誤り**
   - BPMN仕様の理解不足
   - 要件や業務フロー理解の間違い
   - ツール操作ミス

2. **編集・反映フェーズの誤り**
   - 部分修正時に参照の更新漏れ
   - コピー/貼り付け後の参照先指定漏れ
   - マージ/リファクタリング時の要素対応漏れ

3. **ツール生成仕様の制限**
   - BPMN編集ツール（iGrafx等）の出力仕様の制限
   - バージョン依存の記法違い
   - エクスポート時の非標準出力

4. **パーサー/検証ツールの実装限界**
   - 要素型認識の未対応
   - 参照チェック範囲の制限
   - ネストされた構造の処理漏れ

#### 影響分析の指針
各エラーに対して、以下の観点から影響を分析する。

| 観点 | 分析ポイント |
|------|------------|
| **フロー実行** | プロセス実行時にエラー/警告が発生するか、デッドロックするか、実行結果に影響するか |
| **IM-BPMインポート** | インポート失敗するか、警告で済むか、無視して進行可能か |
| **仕様化** | 仕様書作成に影響するか、説明が曖昧になるか、誤解の可能性があるか |
| **実装** | スクリプト実装時に追加作業が必要か、テスト時に問題が発生するか |
| **運用** | 運用時のメンテナンスが困難になるか、ユーザー対応が必要になるか |

#### 詳細分析の制限
- 詳細分析は、validate-bpmn.js の出力を「実BPMNの問題」か「検証ツール実装限界による誤検出」かに分類し、重要度・原因候補・影響・対応方針を補うためにのみ実施する。

## 検証結果の記載ルール

### BPMN記法エラー
- **定義:** XML構文不備、参照切れ、名前空間不整合、図形参照不整合など、BPMN仕様・参照整合性で客観判定できるもの。
- **VAL系IDの付与条件:** validate-bpmn.js の ERROR / WARN と1対1、または同一原因の同種ログを集約した整理結果にのみ付与する。
- **さらに細分化:**
  - **実BPMNの問題（要対応）**: プロセス実行に悪影響を与える、または IM-BPMインポート時にエラーになる可能性の高い問題。
    - 例: 開始/終了イベントの不足、必須属性の欠落、無効な参照、フロー構造の矛盾
  - **検証ツール実装限界による誤検出（無視可）**: 実BPMN XMLは正しいが、検証ツールが要素を認識できていない問題。
    - 例: ツールの既知セット（known set）にない要素型の参照チェック失敗、パーサーの制限による誤検出
- **レスポンス方針:**
  - 実BPMNの問題（重要度「高」または「中」）: 機械的に修正可能な範囲を明示し、修正手順または修正候補を具体的に記載する。
  - 実BPMNの問題（重要度「低」）: 個別起票せず、サマリの件数にのみ含める。
  - 検証ツール誤検出: 個別起票しない。サマリの「ツール実装限界による誤検出」件数にのみ計上する。
- **禁止事項:** validate-bpmn.js に存在しない独自チェック結果を、VAL-ERR / VAL-WARN  として起票しない。
  - ただし iGrafx固有要素の互換性チェック（`.github/skills/bpm-docs-generator/reference/guide-specification.md` 「参照BPMNがiGrafx製である場合に必須」参照）は validate-bpmn.js 由来ではないため、`IGX-<連番>` を付与し、VAL系IDとは独立した別カテゴリとして1章に記載してよい。


## to-be-discussed.md への記載テンプレート

### エラーID
 - validate-bpmn.js が直接出力した ERROR / WARN に対し、VAL-ERR-＜連番＞ / VAL-WARN-＜連番＞を付与する。

### 「BPMN 構文・参照整合性検証」用のテンプレート構成
```md
### <セクション名>

#### <エラーID>. <種別>: <対象要素名>

- **対象要素**: <要素名>（<要素種類> / <レーン名> / <前後要素名など>）
- **重要度**: 高|中|低
- **問題内容**: <検証結果のエラー種別を平易に記載>
- **原因候補**:
  1. <原因候補1>の可能性がある。
  2. <原因候補2>の可能性がある。
  3. <原因候補3>の可能性がある。
- **影響**: <仕様化・実装・運用への影響を観点別に記載>
- **対応方針**: <具体的な修正手順または改善案>
- **訂正案**: `spec-to-bpmn-fixes.json` 参照（reflectStatus: <ready|pending-confirmation|not-applicable>）
```

#### 対応方針について
- 「対応方針」は最終的に以下のいずれかに帰結すること:
  - ✅ **即座に修正可能**: 修正手順を明記
  - ❓ **要件確認が必要**: 確認質問を明記
  - ⏭️ **インポート後の対応**: インポート時点での対応を明記、保留理由を説明

#### 訂正案（機械可読）について
- 訂正案の機械可読データは `to-be-discussed.md` 本文には埋め込まず、同じ `<BPMプロセス名>-prompt/` 配下の **`spec-to-bpmn-fixes.json`** に出力すること。
  - `to-be-discussed.md` 本文には、上記テンプレートの「訂正案」行（`spec-to-bpmn-fixes.json` 参照 + 現在の `reflectStatus`）のみを記載する。
  - 個別起票するエラー（重要度「高」または「中」）には必ず対応するエントリを `spec-to-bpmn-fixes.json` に追加すること。重要度「低」・検証ツール誤検出には追加しない。
  - `to-be-discussed.md` と `spec-to-bpmn-fixes.json` は同じ生成タイミングで同時に出力し、`fixId` の対応漏れ・ズレが生じないようにする。
- `spec-to-bpmn-fixes.json` は `.github/skills/bpm-xml-reflector`のスクリプトが機械的に読み書きし、BPMN への反映可否・反映内容・反映結果を管理するためのファイルである。`to-be-discussed.md` 本文向けの「ID単独特定禁止」ルールはこのファイルには適用せず、`elementId`（BPMNの実ID）の記載を必須とする。
- **`spec-to-bpmn-fixes.json` は本節のエラー訂正案専用のファイルではない。** ロールID・タスク色・オプショナル・プロセス変数・シグナル・メッセージ・プロセス定義キー置換・コールアクティビティ呼び出し先置換など、仕様書に記載された業務要件反映も同じファイルに同じ形式で出力する（詳細: `.github/skills/bpm-docs-generator/reference/guide-specification.md`、`.github/skills/bpm-docs-generator/reference/guide-process-definition-key-replacement.md`）。BPMN への反映は本ファイルを唯一の入力として `.github/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` の `reflectFixes()` が機械的に行う。

##### `spec-to-bpmn-fixes.json` の形式

- 形式: JSON 配列。1反映単位（1エラーID、または1つの業務要件反映事項）につき1エントリとする。
- 出力先: `doc/<BPMプロセス名>-prompt/spec-to-bpmn-fixes.json`
- エントリ構造:
```json
[
  {
    "fixId": "<下記命名規則に従うID>",
    "reflectStatus": "ready | pending-confirmation | not-applicable",
    "operation": "<下表の統制語彙から選択。自動反映手段が無い場合は manual>",
    "targets": [
      { "elementId": "<対象要素の実ID>", "elementType": "<BPMN要素型（例: bpmn:ServiceTask）>" }
    ],
    "params": {},
    "requiresApproval": true,
    "reflectedDate": "未反映"
  }
]
```

- `fixId` の命名規則:
  - `validate-bpmn.js` のエラー訂正案: 検証ツールが出力するエラーID（連番）をそのまま使う。
  - 業務要件反映（validate-bpmn.js のエラーに紐づかないエントリ）: `<カテゴリ接頭辞>-<連番3桁以上>` とする。カテゴリ接頭辞は以下を用いる。

    | カテゴリ接頭辞 | 対象 operation |
    |---|---|
    | `ROLE-` | `set-role-starter-groups` / `set-lane-candidate-groups` / `set-usertask-candidate-groups` |
    | `COLOR-` | `set-task-color` |
    | `VAR-` | `add-data-object` |
    | `SIG-` | `add-signal` |
    | `MSG-` | `add-message` |
    | `PID-` | `replace-process-id` |
    | `CALLEE-` | `replace-callee-process` |

- `reflectStatus` は「対応方針」の区分と必ず対応させること。値の意味と反映可否は以下の通り。

  | 対応方針 | reflectStatus | 反映可否 |
  |---|---|---|
  | ✅ 即座に修正可能 | `ready` | 現時点で反映対象（破壊的操作は別途ユーザー承認必須） |
  | ❓ 要件確認が必要 | `pending-confirmation` | 反映不可。要件確認の回答が確定した時点で `ready` に更新する |
  | ⏭️ インポート後の対応 | `not-applicable` | 現時点では反映対象外（自動反映しない） |

  業務要件反映（ロールID・シグナル・メッセージ等）についても同様に対応させる。特に、シグナル・メッセージの ID が仕様書上未定義の場合はエントリ自体を作成しないこと（`pending-confirmation` として空の `params.id` を書き出すのではなく、確定してから追加する）。

- `operation` は以下の統制語彙から選択する。対応する反映処理が存在しない場合は必ず `manual` とし、`requiresApproval` は `true` のままとする（`params` は省略可）。

  | operation | 説明 | 主な `params` |
  |---|---|---|
  | `set-attribute` | 既存要素への属性追加・更新 | `attrName`, `attrValue` |
  | `set-eventdef-ref` | イベント定義への `messageRef`/`signalRef`/`errorRef` 設定 | `refType`, `refId` |
  | `set-service-task-field` | サービスタスクの `activiti:field` 値設定（`flowId`/`version`/`to`/`text` 等） | `fieldName`, `fieldValue` |
  | `set-timer-definition` | `timerEventDefinition` の周期・日時・期間（`timeCycle`/`timeDate`/`timeDuration`）および `activiti:businessCalendarName` の設定 | `timeCycle` / `timeDate` / `timeDuration`（いずれか）, `businessCalendarName`（任意） |
  | `set-condition-expression` | 分岐フローへの条件式追加 | `expression` |
  | `set-role-starter-groups` | プロセスへのロールID（`candidateStarterGroups`）設定 | `roleId` |
  | `set-lane-candidate-groups` | レーンへのロールID（`candidateGroups`）設定 | `roleId` |
  | `set-usertask-candidate-groups` | ユーザタスクへのロールID・オプショナル設定 | `roleId`, `isOptional`（任意） |
  | `set-task-color` | タスクへの背景色設定 | `taskType` |
  | `add-data-object` | プロセス変数（`dataObject`）の新規追加（`targets.elementId` は対象 process の id。同じファイル内に当該 process の `replace-process-id` がある場合は置換後の値 `toId` を指定すること。置換前の値を指定すると無言でスキップされる） | `variables: [{ id, name, type }]` |
  | `add-signal` | シグナル定義の新規追加（仕様書で ID 未定義の場合はエントリを作らない） | `id`, `name` |
  | `add-message` | メッセージ定義の新規追加（仕様書で ID 未定義の場合はエントリを作らない） | `id`, `name` |
  | `replace-process-id` | プロセス定義キー（process id）置換。`fromId` で対象を特定し `toId` を反映する | `fromId`, `toId`, `allowFromIdExists`（任意） |
  | `replace-callee-process` | コールアクティビティの呼び出し先プロセス置換 | `fromId`, `toId` |
  | `convert-event-type` | イベント種別変換（例: 中間キャッチイベント→開始イベント） | `fromTag`, `toTag` |
  | `delete-element` | 不要要素の削除（モデル要素と図形情報を同時に削除） | - |
  | `manual` | 自動反映手段が無い（人手対応が必要） | - |

- `requiresApproval` は既定値 `true` とする。`delete-element` / `convert-event-type` / `replace-process-id` / `replace-callee-process` など破壊的操作は常に `true` とし、`false` への変更は認めない。
- `reflectedDate` は反映実施日（`YYYY-MM-DD`）または `未反映` を記載し、`.github/skills/bpm-xml-reflector/SKILL.md` による反映後にのみ更新する。`reflectStatus` 自体は判定根拠を残すため反映後も変更しない。`to-be-discussed.md` 側の「訂正案」行の `reflectStatus` 表示も同時に同期する。

##### 設計上の制約（validate-bpmn.js の完全クリアは対象外）

`.github/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` の `reflectFixes()` が自動反映するのは、上表の統制語彙に対応する属性・フィールド値・要素の追加/更新に限られる。以下に該当するエラーは `reflectStatus: ready` を付与しても自動反映されない（`operation: manual` として人手対応・別ステップ対応に委ねる）。

| 該当エラー | 理由 |
|---|---|
| 開始/終了イベント欠落、重複ID、SequenceFlow の source/target 不正、サブプロセス境界超え、ゲートウェイの出力フロー欠如 | 要素の追加・削除・再結線が必要（`add-element`/`add-sequence-flow` 等の operation が未定義） |
| DI整合性エラー（不明な `bpmnElement` 参照、waypoint 不足） | 図形要素の追加・削除が必要（`delete-element` は operation 語彙にはあるが `reflectFixes()` は未実装） |
| Message/Signal 未解決参照のうち、参照先定義自体が仕様書上も未確定のケース | `add-signal`/`add-message` は ID 確定後にのみ `spec-to-bpmn-fixes.json` へ追加されるため、未確定の間は反映されない |

そのため、`spec-to-bpmn-fixes.json` の全エントリが `reflectStatus: ready` になったとしても、上記に該当するエラーが1件でも残っていれば `.github/skills/bpm-docs-generator/scripts/validate-bpmn.js` は FAIL のままとなる。これは意図した設計であり、機械的に安全反映できる範囲のみを自動化するという `reflectFixes()` の目的に沿ったものである。`.github/skills/bpm-docs-generator/scripts/validate-bpmn.js` を PASS させるには、上記該当エラーを人手で修正する必要がある。

#### 個別起票の並び順について
- 個別起票するエラー（重要度「高」または「中」）は、重要度「高」→「中」の順にまとめて記載する。同一重要度内では validate-bpmn.js の出力順（エラーID の連番順）を維持する。
- セクションを重要度で分割する場合は、見出しに重要度を明記する（例: `### 重要度: 高` / `### 重要度: 中`）。分割しない場合も、記載順序は重要度優先とする。

### 検証結果の出力先
検証結果は、`to-be-discussed.md` の 1. BPMN 構文・参照整合性検証結果 に下記を出力。

- **検証結果サマリ**
  ```
  ### 検証結果サマリ

  `validate-bpmn.js` を実行した結果（終了コード X）。

  ERROR Y件、WARN Z件 → <PASS|FAIL>

  | 区分 | 件数 | 説明 |
  |------|------|------|
  | 実BPMNの問題（要対応） | n件 | 具体的な内容 |
  | ツール実装限界による誤検出 | m件 | 具体的な内容 |
  ```

- **BPMN記法エラー**
  - 重要度「高」または「中」の「実BPMNの問題」のみ個別起票する
  - 重要度「低」の項目および「ツール誤検出」は個別起票しない（サマリ件数にのみ計上）
  - ここに記載する VAL 系項目は validate-bpmn.js の直接出力に限定する

- **iGrafx固有要素の互換性チェック**
  - 対象BPMNがiGrafx製である場合のみ記載する。iGrafx製でない場合は本サブセクションを「該当なし」とする。
  - `.github/skills/bpm-docs-generator/reference/guide-specification.md` 「参照BPMNがiGrafx製である場合に必須」のNG要素判定表に基づき、コピー元BPMN（変換前の元ファイル）を判定対象として検出する。
  - エラーIDは `IGX-<連番>` を用いる（VAL系とは独立した採番）。全件、重要度は「高」固定とする（IM-BPM非サポートによりインポート失敗の可能性が高いため）。
  - テンプレート（原因候補・訂正案は省略する。対応方針は固定文言、改善案はNG要素判定表の「対処案」列を記載する）:
    ```md
    #### <IGXエラーID>. <NG要素判定表の要素名>: <対象要素名>

    - **対象要素**: <要素名>（<要素種類> / <レーン名> / <前後要素名など>）
    - **重要度**: 高
    - **問題内容**: <NG要素判定表の判定条件を平易に記載>
    - **影響**: IM-BPMインポート時にサポートされない、またはプロセス実行に悪影響を与える可能性がある旨を記載
    - **対応方針**: ⏭️ iGrafx上でBPMNを修正のうえ再取り込み。
    - **改善案**: <NG要素判定表の対処案列を平易に記載>
    ```
  - `spec-to-bpmn-fixes.json` への出力は行わない（iGrafx側での修正・再取り込みを前提とするため、`.github/skills/bpm-xml-reflector/SKILL.md` による自動反映の対象外とする）。

**`to-be-discussed.md`への反映ルール:**
- ERROR 行: 必ず要検討事項へ反映。ただし重要度「低」（ツール誤検出を含む）は件数のみをサマリに記載し、個別起票しない。
- WARN 行: 重要度「高」または「中」のみ要検討事項へ反映。重要度「低」は個別起票しない。
- 出力の [input] / [model] / [flow] / [io] 文脈情報を保持したまま整理する。

