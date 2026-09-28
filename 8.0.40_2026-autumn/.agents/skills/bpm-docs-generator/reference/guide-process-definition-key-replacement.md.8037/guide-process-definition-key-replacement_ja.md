# プロセス定義キー（process id）置換ガイド

iGrafx 由来 BPMN の process id 重複を回避するため、IM-BPM 取り込み向けに process id を採番・管理する仕組みを定義する。

**基本方針**:
- 読み込みBPMNファイルがiGrafx製の場合のみ実施する。
- 仕様書作成段階（bpm-docs-generator）では、置換状態の判定と置換案の提示のみを行う。
  - BPMNのID置換は、仕様書内容をBPMNへ反映する依頼が行われた際に bpm-xml-reflector のスキルセットを利用して実施する。
  - 置換案（from-to）が確定したら、`to-be-discussed.md` への記載に加え、同じタイミングで `spec-to-bpmn-fixes.json` にも `operation: "replace-process-id"` のエントリとして出力すること（詳細は「`spec-to-bpmn-fixes.json` への出力」節を参照）。BPMN への実反映は `spec-to-bpmn-fixes.json` を唯一の入力として `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` の `reflectFixes()` が行う。
- 初回置換後は既存キーを再利用する。誤った新規採番を防ぐため、置換済み情報は 要検討事項とBPMN 内に永続的に保持する。

## 適用範囲
- BPMN ファイル生成時の process id（= IM-BPM のプロセス定義キー）
- 置換対象は **process id のみ** とし、フロー要素 ID・シーケンス ID・DI 要素 ID は変更しない。

## チェック実装
BPMNファイルのID値・置換状態チェックや取得の実装は、以下のスクリプトを利用する。

- `.agents/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js`
- 実行例: `{{ENSURE_CMD}} .agents/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <processNm-prompt/diagram.bpmn>`（結果は常に JSON 形式で返却される）

## 処理フロー

### Step 1: IDの取得

- 入力元BPMN（`doc/<BPMプロセス名>.bpmn`）
  - `{{ENSURE_CMD}} .agents/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <入力元BPMNファイル>`
- 要検討事項（`to-be-discussed.md`）
  - 2章 プロセス定義キー置換履歴 より プロセス毎の「元のプロセス定義キー」と 「置換後のプロセス定義キー」を取得。
- コピー先BPMN（`<BPMプロセス名>-prompt/<BPMプロセス名>.bpmn`）
  - `{{ENSURE_CMD}} .agents/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <コピー先BPMNファイル>`

- **入力元BPMNファイルとコピー先BPMNファイルは、各々validate-process-key-replacement.jsを実行してID値・置換状況を取得する**

- **コピー先BPMNには、`documentation`の`PROCESS_KEY_META`の値を参照する。**
  - `PROCESS_KEY_META`の書式・埋め込み処理の詳細は `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` を正とする。


### Step 2: 既存IDの確認
- Step 1 で取得した結果をプロセス毎に比較し、以降の処理を決定する。
  | 区分 | `入力元BPMN` | `要検討事項` | `コピー先BPMN` |
  |------|-----|-----|-----|
  | 置換前定義キー | processId | 元のプロセス定義キー | originalProcessKey |
  | 置換後定義キー | なし | 置換後のプロセス定義キー | processKey ( or processId )|

- IDの置換提案不要。処理フロー終了として良いケース。
  - `入力元BPMN`と`要検討事項`と`コピー先BPMN`の各プロセスの「置換前定義キー」が一致、かつ、`要検討事項`と`コピー先BPMN`の各プロセスの「置換後定義キー」が一致する場合。
  - `コピー先BPMN`の「置換後定義キー」が未定義、かつ、`入力元BPMN`と`要検討事項`の「置換前定義キー」が一致する場合。
- Step 3: 初回採番と判定するケース
  - `<BPMプロセス名>-prompt`ディレクトリがない場合
  - `要検討事項`のID置換案未記載、かつ、`コピー先BPMN`の「置換後定義キー」が未定義の場合。
- Step 4: 追加採番と判定するケース
  - `入力元BPMN`と`要検討事項`と`コピー先BPMN`の既存プロセスの各定義キーは一致するが、`入力元BPMN`に新しい「置換後定義キー」がある場合。
- Step 5: 要検討事項訂正と判定するケース
  - `要検討事項`と`コピー先BPMN`の「置換前定義キー」は一致するが、「置換後定義キー」が異なる場合。
- Step 6: 要確認と判定するケース
  - `入力元BPMN`、`要検討事項`、`コピー先BPMN`間で定義キーの不一致がある場合。Step3～Step5のケースは除く。

### Step 3: 初回採番
- **採番ルール**にてID置換案の提示し要検討事項へ記載する。同時に `spec-to-bpmn-fixes.json` にも出力する（「`spec-to-bpmn-fixes.json` への出力」参照）。記載後、この処理フローは終了。

### Step 4: 追加採番
- 追加分のIDに対し、**採番ルール**にてID置換案の提示し要検討事項へ追記する。同時に `spec-to-bpmn-fixes.json` にも追記する。記載後、この処理フローは終了。

### Step 5: 要検討事項訂正
- コピー先BPMNと要検討事項の置換後IDが異なることを報告。確認の上、コピー先BPMNの置換後IDにて要検討事項の記載を訂正する。`spec-to-bpmn-fixes.json` の該当エントリも同じ値に訂正する。訂正後、この処理フローは終了。
- ※プロセス定義キー（置換後ID）は、IM-BPM上のBPMを特定するユニークキーになるため、コピー先BPMN側を正と判断する。

### Step 6: 要確認
- IDに不一致がある旨を報告し、ID採番方針の対応の指示を仰ぐ。

**採番ルール**
- 置換後キーは「元となる BPMN ファイル・プロセスにちなむ ID」、かつ、44文字以内とする。
- キー形式は `<processSlug>_<serial>` を推奨する。
  - `processSlug`: プロセス名または元 process id を正規化した識別子（英数字・`_`・`-`・`.`のみ、先頭は英字または`_`）
  - `serial`: 4 桁以上の連番（例: `0001`、`0002`、...）
- 例: `vehicle_purchase_0001`, `daily_check_0001`, `expense_approval_0001`

## 要検討事項への記載

### 置換提案の要検討事項への記載
仕様書作成段階では **置換提案**として、`to-be-discussed.md` の「2. プロセス定義キー置換履歴」セクションに以下の情報を記載する。（書式はプロセス定義キー置換履歴の記載テンプレート参照）

- 対象プロセス
- 元の process id
- 置換候補の process id
- 提案日

### プロセス定義キー置換履歴の記載テンプレート

#### 置換提案（<対象プロセス名>）

| 項目 | 値 |
|------|-----|
| 対象プロセス | <プロセス名>（必要に応じて ID 補足） |
| 元のプロセス定義キー | <originalProcessDefinitionKey> |
| 置換後のプロセス定義キー | <processDefinitionKey> |
| 提案日 | <YYYY-MM-DD> |
| 反映日 | <YYYY-MM-DD または 未反映> |


**プロセス定義キー置換履歴記述時の注意事項**
- エンドユーザー向けに、`status` / `errors` / `none` などの内部判定値を記載しないこと。
- 仕様書作成段階では、「置換提案（候補）」として記載し実施済みと断定しないこと。
- 仕様書作成段階では、 `反映日` は `未反映` と記載すること。
- BPMN反映段階で置換を実施した場合は、`反映日` を実施日に更新すること。
- `反映日: YYYY-MM-DD` のような表外の単独テキストは記載しないこと（必ず表内の行として記載）。
- 各置換プロセスに対して、独立したサブセクションを作成すること。
- 複数のプロセスが置換対象の場合は、分割記載すること。
- 元キーと置換後キーは必ずセットで明記し、どちらか一方だけの記載は禁止すること。

### `spec-to-bpmn-fixes.json` への出力

Step 3〜Step 5 で確定した置換提案（from-to）は、`to-be-discussed.md` への記載と同じタイミングで `doc/<BPMプロセス名>-prompt/spec-to-bpmn-fixes.json` にも出力する。エントリ構造・命名規則・`operation` 統制語彙は `.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` の「`spec-to-bpmn-fixes.json` の形式」を正とし、本節では process id 置換に固有の指定内容のみ示す。

```json
{
  "fixId": "PID-001",
  "reflectStatus": "ready",
  "operation": "replace-process-id",
  "targets": [
    { "elementId": "<元のprocess id（fromId）>", "elementType": "bpmn:Process" }
  ],
  "params": {
    "fromId": "<元のprocess id>",
    "toId": "<置換後のprocess id>"
  },
  "requiresApproval": true,
  "reflectedDate": "未反映"
}
```

- `fixId` は `PID-<連番3桁以上>` とする（`.agents/skills/bpm-docs-generator/reference/guide-bpmn-validation.md` の命名規則を参照）。
- `params.fromId` が置換対象の特定に使われ、`params.toId` が反映される置換値になる。両者は必ずセットで指定すること。
- `fromId` が反映後に残ってよいケース（例: `<participant processRef>` を持たない構成等）のみ `params.allowFromIdExists: true` を付与する。
- `requiresApproval` は常に `true` とする（破壊的操作のため）。承認は BPMN 反映段階（`.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` の `reflectFixes()` 実行時）に行われる。
- Step 5（要検討事項訂正）で `to-be-discussed.md` の記載を訂正した場合は、対応する `spec-to-bpmn-fixes.json` エントリの `params.toId` も同じ値に訂正すること。
- `reflectedDate` は `未反映` のまま出力し、実際の反映日時は `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` の `reflectFixes()` が反映後に更新する（本ステップでは更新しない）。

**BPMNファイルへのID置換案反映について**
- 反映時の既存キー再利用・例外時の扱い・記録更新は `.agents/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` を正とする。
