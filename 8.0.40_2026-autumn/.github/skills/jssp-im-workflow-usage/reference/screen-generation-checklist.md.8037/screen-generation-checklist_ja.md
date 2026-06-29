# IM-Workflow 画面生成セルフチェックリスト

画面プログラム（.html / .js）の生成完了後、以下のチェックリストで自己検証すること。

**注意:** `validate-workflow-code.js` が自動検出する項目（imds クラス名誤り、pageType 不正値、DbParameter 型変換漏れ、imart タグ属性、imuiCalendar hidden 誤用、imuiCalendar の value セッターオーバーライド漏れ）は本チェックリストに含めない。スクリプトで検出できない項目のみ記載する。

## 共通（全画面）

- [ ] ファイル配置先が `src/main/jssp/src/{機能名}/workflow/{サブディレクトリ}/` になっている
- [ ] `<imart>` タグの `type`, `escapeXml`, `escapeJs` 等の固定値属性はダブルクォートで囲まれている
- [ ] `<imart>` タグに `filter` 属性を使用していない（`filter` 属性は存在しない。JSON 内の値を表示するには JavaScript で `textContent` にセットすること）
- [ ] エントリーポイントで `$data.error.code` の判定を行っている
- [ ] ボタンのイベントは `onclick` 属性ではなく `addEventListener` で登録している
- [ ] IM-共通マスタ API（`IMMUserManager` / `IMMCompanyManager`）使用時に、`locales` の null チェック + ロケールフォールバック（`locales[locale] || locales[tenantLocale] || locales[Object.keys(locales)[0]]`）を実装している
- [ ] サーバから取得した値（ユーザ名・部署名等）を HTML に表示する場合、`<imart>` タグではなく JavaScript の `initializeView` 内で `textContent` にセットしている

### アイコンボタン

- [ ] アイコンとテキストを併用するボタンで、テキストが `<span class="imds-button-text">` で囲まれている（直接テキストノード不可）
- [ ] アイコン単品のボタン（テキストなし）は通常サイズを使用している（`is-small` / `is-x-small` にしない）

## 申請画面（入力フォームあり）

### バリデーション構造

- [ ] `{{AGENT_RULES}}/jssp-presentation-page{{AGENT_RULE_FILE}}.md` 準拠のバリデーション関数群（`clearValidationError`, `showValidationError`, `createRequest`, `getValidationErrors`, `resetValidationError`, `validateCurrentStep`）がこの順序で定義されている
- [ ] `activeValidation` フラグによるリアルタイム再バリデーションが実装されている（テキスト入力は `input` イベント、セレクト・日付は `change` イベント）

### imuiCalendar を使用している場合

- [ ] `floatable="true"` が指定されている（未指定だとインライン表示になり、テキストボックス＋カレンダーアイコンの標準 UI にならない）
- [ ] `altField` が表示用テキストボックス（`<input type="text">`）を参照している（hidden input を指定してはならない）
- [ ] HTML の配置順が「表示用テキストボックス → `<imart type="imuiCalendar">` 」の順になっている（逆にするとカレンダーアイコンがテキストボックスの左側に表示される）
- [ ] `Object.defineProperty` を altField の参照先テキストボックスに適用し、value セッターで `change` イベントを発行している
- [ ] 日付変更時のイベントリスナーが altField の参照先テキストボックスに登録されている

### IM-共通マスタ検索（imACMSearch）を使用している場合

- [ ] `window._resetValidationError` として再バリデーション関数を公開している
- [ ] コールバック関数内で値セット後に `window._resetValidationError()` を呼び出している

### HTML 構造

- [ ] バリデーション対象の `imds-field` タグに `for=":fieldName:"` 属性が付与されている
- [ ] バリデーション対象の `imds-field` 配下に `<span class="imds-error-text" for=":fieldName:" style="display:none;"></span>` が配置されている
- [ ] `maxlength` 属性を使用していない（文字数制限はバリデーションエラーメッセージで通知する）
- [ ] **常に必須**のラベルには `imds-required-label-required` クラス + `data-required-label="必須"` が静的に付与されている
  - accessibility 用途（`aria-labelledby` の参照対象）で `id` を付ける場合は **`:fieldName:-label`** 形式（コロン区切り）にすること。`toggleRequiredMark()` の呼び出しは **不要**
- [ ] **条件付き必須**（特定の入力値によって必須/任意が切り替わる）フィールドのラベルには `imds-required-label-required` を静的に付与せず、以下のパターンで動的制御している
  - ラベルスパンに `id="fieldName-label"` を付与（**コロンなし**。クラスは付けない）
  - `toggleRequiredMark(id, condition)` 関数を定義し、表示制御と同じタイミングで呼び出す
  - 例: `toggleRequiredMark('period-end-label', periodType === 'temporary')`
  - id 命名規約の詳細は `{{AGENT_RULES}}/jssp-presentation-page{{AGENT_RULE_FILE}}.md`「id 属性の命名規約」を参照

### 入力フィールドの幅制御

- [ ] imuiCalendar のテキストボックスに `style="max-width: 10em;"` を指定している
- [ ] セレクトボックスに `max-width` を指定し、選択肢の文字数に応じた適切な幅にしている
- [ ] 寸法指定（`max-width` / `min-width` / `width` / `height` 等）は **インライン `style="...: ...em;"`** で書いている（カスタム `.max-width-NNem` / `.min-width-NNem` 等のクラスを `<style>` ブロックに定義していない。詳細度が imds 既定と同じため上書きできず `!important` 多用につながる）

### name 属性の重複防止

- [ ] `workflowOpenPage` フォーム内の入力フィールド（`select`, `input[type=text]`, `textarea` 等）に `name` 属性を付けていない（hidden フィールドと `name` が重複すると `userParam` が配列になりアクション処理でエラーになる）
- [ ] ラジオボタンのグループ `name` が hidden フィールドの `name` と異なる名前になっている（例: 入力用 `name="urgencyTypeInput"` / hidden `name="urgencyType"`）
- [ ] 値の受け渡しは申請ボタン押下時に JS で hidden フィールドにコピーする方式になっている

### 案件名・再申請・ボタン

- [ ] `workflowOpenPage` フォーム内に `<input type="hidden" id="imwMatterName" name="imwMatterName" value="" />` が配置されている
- [ ] 申請ボタン押下時に `imwMatterName` にフロー定義の案件名ルールに従った値をセットしている
- [ ] `imwSystemMatterId` の有無で pageType を切り替えている（空=`'0'` 新規申請、あり=`'3'` 再申請）
- [ ] 再申請モード時に申請ボタンのラベルを「再申請」に変更している
- [ ] 申請ボタンで `validateCurrentStep()` を呼び出し、`false` なら `return` している

### 一時保存（temporary save）

- [ ] **workflowOpenPage 方式**で一時保存（`workflowOpenPage('1')`）を使う場合、`init` で `$imwUserDataId = request['imwUserDataId'] || Identifier.get();` のように **userDataId をアプリ側で採番**している（ユーザデータID は一時保存情報のキーのため、ユーザコンテンツ側での採番が必須。採番が無いと新規一時保存時にキーが空になり、再表示で入力内容が復元されない）
- [ ] 処理モーダル方式（`showTemporarySave`）の場合は内部で自動採番されるため、上記の明示採番は不要（request の userDataId をそのまま渡す）

## アクション処理（.js）

- [ ] 全関数のシグネチャが `(parameter, userParam)` の **2引数** になっているか（`parameter.userParameter` は存在しない。フォームの値は第2引数 `userParam` で渡される）
- [ ] `executeByTemplate` のパラメータオブジェクトのキー名が、SQL テンプレートのバインド変数名（`/*xxx*/`）と **完全一致** しているか（SQL がスネークケース `user_data_id` なら JS 側も `user_data_id`。キャメルケース `userDataId` にしてはならない）
- [ ] `apply` 関数内で `WorkflowNumberingManager.getNumber()` により案件番号を採番し、`result.data` にセットしているか（仕様書にフォーマット指定がない場合もデフォルト採番を行う）
- [ ] `reapply` 関数では案件番号を採番していないか（再申請時は既に案件番号が存在する）
- [ ] 案件プロパティの操作に `UserActvMatterPropertyValue` の正しいメソッドを使用しているか（`createMatterProperty(Array)` / `updateMatterProperty(Array)` / `getMatterProperty(String, String)`。`setMatterProperty` は存在しない）
- [ ] 案件プロパティの引数がオブジェクトの**配列**になっているか（`[{ userDataId, key, value }]`）
- [ ] d.ts でメソッド名・引数の型を確認したか
- [ ] `apply` 関数でデータを INSERT する場合、既存データの有無を判定しているか（引き戻し後の `applyFromUnapply` では既にデータが存在する）

## 承認画面（読み取り専用）

- [ ] 全フィールドが `<span>` 要素で表示されている（入力フィールドなし）
- [ ] セレクトボックスの値はラベルに変換して表示している
- [ ] 処理ボタンが **1つだけ** あり、`workflowOpenPage('4')` を呼び出している（承認/差戻し/否認/保留を個別のボタンにしない。処理種別は IM-Workflow 標準ダイアログで選択する）
- [ ] コメント入力欄を画面上に配置していない（コメントは IM-Workflow 標準ダイアログで入力する）

## 詳細画面（読み取り専用）

- [ ] 全フィールドが `<span>` 要素で表示されている
- [ ] **「戻る」ボタンが存在しない**（`imw-back-button` / `imw-back-form` / `workflowOpenPage` タグをすべて省略）
- [ ] 処理ボタンが存在しない
- [ ] 案件プロパティの取得が未完了・完了・過去案件の3パターンに対応している
  - `imwArchiveMonth` が存在する → `UserArcMatterPropertyValue(archiveMonth)` を使用
  - `imwArchiveMonth` が空 かつ 未完了 API にデータあり → `UserActvMatterPropertyValue` を使用
  - `imwArchiveMonth` が空 かつ 未完了 API のデータが空 → `UserCplMatterPropertyValue` にフォールバック
  - `UserActvMatterPropertyValue` のみで実装すると、完了・過去案件を開いたとき詳細が表示されない
