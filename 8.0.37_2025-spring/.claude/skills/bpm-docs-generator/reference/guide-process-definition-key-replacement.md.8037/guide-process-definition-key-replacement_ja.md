# プロセス定義キー（process id）置換ガイド

iGrafx 由来 BPMN の process id 重複を回避するため、IM-BPM 取り込み向けに process id を採番・管理する仕組みを定義する。

**基本方針**:
- 仕様書作成段階（bpm-docs-generator）では、置換状態の判定と置換案の提示のみを行う。
  - BPMNのID置換は、仕様書内容をBPMNへ反映する依頼が行われた際に bpm-xml-reflector のスキルセットを利用して実施する。
- 初回置換後は既存キーを再利用する。誤った新規採番を防ぐため、置換済み情報は 仕様書とBPMN 内に永続的に保持する。

## 適用範囲
- BPMN ファイル生成時の process id（= IM-BPM のプロセス定義キー）
- 置換対象は **process id のみ** とし、フロー要素 ID・シーケンス ID・DI 要素 ID は変更しない。

## チェック実装
BPMNファイルのID値・置換状態チェックや取得の実装は、以下のスクリプトを利用する。

- `.claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js`
- 実行例: `{{RUNTIME}} .claude/skills/bpm-docs-generator/scripts/validate-process-key-replacement.js <processNm-prompt/diagram.bpmn> --json`

以降の判定・整合性確認は、原則としてこのスクリプトの出力に基づいて行う。手動で同等ロジックを再実装して判定してはならない。


## 処理フロー

### Step 1: 既存IDの確認
- 入力元BPMNファイル（`doc/*.bpmn`）、仕様書（`to-be-discussed.md`）、コピー先BPMNファイル（`<BPMプロセス名>-prompt/*.bpmn`）のIDを比較し、以降の処理を決定する。
  - IDの置換提案不要。処理フロー終了として良いケース。
    - 入力元BPMN、仕様書、コピー先BPMNの各IDが一致する場合。
    - コピー先BPMNに置換ID未反映、かつ、入力元BPMN、仕様書の各IDが一致する場合。
  - Step 2: 初回採番と判定するケース
    - `<BPMプロセス名>-prompt`ディレクトリがない場合
    - 仕様書はあるがID置換案未記載、かつ、コピー先BPMNにID未反映の場合。
  - Step 3: 追加採番と判定するケース
    - 入力元BPMN、仕様書、コピー先BPMNの既存の各IDは一致するが、入力元BPMNに新しいIDがある場合。
  - Step 4: 仕様書訂正と判定するケース
    - 仕様書、コピー先BPMNの既存の各IDは一致するが、置換後IDが異なる場合。
  - Step 5: 要確認と判定するケース
    - 入力元BPMN、仕様書、コピー先BPMN間で各IDが不一致がある場合。Step2～Step4のケースは除く。

**入力元BPMNファイルとコピー先BPMNファイルは、各々validate-process-key-replacement.jsを実行してID値・置換状況を取得する**

**コピー先BPMNは、`documentation`の`PROCESS_KEY_META`に`ORIGINAL_PROCESS_KEY`の値を参照する。**

### Step 2: 初回採番
**採番ルール**にてID置換案の提示し仕様書へ記載する。記載後、この処理フローは終了。

### Step 3: 追加採番
追加分のIDに対し、**採番ルール**にてID置換案の提示し仕様書へ追記する。記載後、この処理フローは終了。

### Step 4: 仕様書訂正
コピー先BPMNと仕様書の置換後IDが異なることを報告。確認の上、コピー先BPMNの置換後IDにて仕様書の記載を訂正する。訂正後、この処理フローは終了。
※プロセス定義キー（置換後ID）は、IM-BPM上のBPMを特定するユニークキーになるため、コピー先BPMN側を正と判断する。

### Step 5: 要確認
IDに不一致がある旨を報告し、ID採番方針の対応の指示を仰ぐ。


**採番ルール**
- 置換後キーは「元となる BPMN ファイル・プロセスにちなむ ID」とする。
- キー形式は `<processSlug>_<serial>` を推奨する。
  - `processSlug`: プロセス名または元 process id を正規化した識別子（英数字・`_`・`-`・`.`のみ、先頭は英字または`_`）
  - `serial`: 4 桁以上の連番（例: `0001`、`0002`、...）
- 例: `vehicle_purchase_0001`, `daily_check_0001`, `expense_approval_0001`


## 仕様書への記載

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
- エンドユーザー向けに、`status` / `errors` / `warnings` / `none` などの内部判定値を記載しないこと。
- 仕様書作成段階では、「置換提案（候補）」として記載し実施済みと断定しないこと。
- 仕様書作成段階では、 `反映日` は `未反映` と記載すること。
- BPMN反映段階で置換を実施した場合は、`反映日` を実施日に更新すること。
- `反映日: YYYY-MM-DD` のような表外の単独テキストは記載しないこと（必ず表内の行として記載）。
- 各置換プロセスに対して、独立したサブセクションを作成すること。
- 複数のプロセスが置換対象の場合は、分割記載すること。
- 元キーと置換後キーは必ずセットで明記し、どちらか一方だけの記載は禁止すること。

**BPMNファイルへのID置換案反映について**
- 反映時の既存キー再利用・例外時の扱い・記録更新は bpm-xml-reflectorの`.claude/skills/bpm-xml-reflector/reference/bpmn-specs-reflector.md` を正とする。

