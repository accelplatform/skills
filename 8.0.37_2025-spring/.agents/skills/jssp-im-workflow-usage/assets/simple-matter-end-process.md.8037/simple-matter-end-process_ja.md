# ワークフロー 案件終了処理テンプレート

## 概要

IM-Workflow の案件終了処理プログラムのテンプレート。
画面を持たず、案件の終了時に自動実行されるバッチ的な処理である。
関数 `execute(parameter)` がワークフローエンジンから呼び出される。

案件終了処理には **トランザクションあり** と **トランザクションなし** の2種類がある。

| 種類 | ファイル名 | DB トランザクション | メール送信制御 |
|------|-----------|-------------------|--------------|
| トランザクションあり | matter_end_process.js | IM-Workflow が制御（独自に張らないこと） | あり（`data` で制御） |
| トランザクションなし | matter_end_process_no_tran.js | 独自にトランザクション制御を行う | なし |

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  ├── matter_end_process.js           # 案件終了処理（トランザクションあり）
  └── matter_end_process_no_tran.js   # 案件終了処理（トランザクションなし）
```

---

## トランザクションあり

### 概要

IM-Workflow のトランザクション内で実行される案件終了処理。
メール送信の可否を返却値 `data` で制御できる。

**注意**: このプログラム中では DB トランザクションを張らないこと。

### parameter（ワークフローパラメータ）

| プロパティ | 型 | 説明 |
|-----------|------|------|
| loginGroupId | String | ログイングループID（非推奨。テナントID と同値） |
| localeId | String | ロケールID |
| targetLocales | String | ターゲットロケールID |
| contentsId | String | コンテンツID |
| contentsVersionId | String | コンテンツバージョンID |
| routeId | String | ルートID |
| routeVersionId | String | ルートバージョンID |
| flowId | String | フローID |
| flowVersionId | String | フローバージョンID |
| applyBaseDate | String | 申請基準日 |
| processDate | String | 処理日/到達日 |
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |
| parameter | String | パラメータ |
| actFlag | String | 代理フラグ |
| lastProcessNodeId | String | （最終）処理ノードID |
| lastAuthUserCd | String | （最終）処理権限者コード |
| lastExecUserCd | String | （最終）処理実行者コード |
| lastResultStatus | String | （最終）処理結果ステータス |
| mailIds | String | メールテンプレートID |
| replaceMap | Object | メール置換文字列情報 |

### 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |
| data | Boolean | メール送信可否（`true`: 送信可能 / `false`: 送信不可） |

### 案件終了処理（matter_end_process.js）

```javascript
/**
 * ワークフロー 案件終了処理（トランザクションあり）
 *
 * @file matter_end_process.js
 * @description ワークフローの案件終了時に実行される処理プログラムです。
 *              IM-Workflow のトランザクション内で実行されるため、
 *              このプログラム中では DB トランザクションを張らないでください。
 */

/**
 * 案件終了処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @return {Object} 処理結果
 */
function execute(parameter) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: true
    };

    logger.info('[matterEnd] 案件終了処理開始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic(parameter);
        logger.info('[matterEnd] 案件終了処理完了 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[matterEnd] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
        result.data = false;
    }

    return result;
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * ビジネスロジックのメイン処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 */
function processBusinessLogic(parameter) {
    // TODO: ここで案件終了時のビジネスロジックを実装してください
    //
    // 利用可能な主要パラメータ:
    //   parameter.systemMatterId      - システム案件ID
    //   parameter.userDataId          - ユーザデータID
    //   parameter.lastProcessNodeId   - （最終）処理ノードID
    //   parameter.lastAuthUserCd      - （最終）処理権限者コード
    //   parameter.lastExecUserCd      - （最終）処理実行者コード
    //   parameter.lastResultStatus    - （最終）処理結果ステータス
    //   parameter.mailIds             - メールテンプレートID
    //   parameter.replaceMap          - メール置換文字列情報
}
```

---

## トランザクションなし

### 概要

IM-Workflow のトランザクション外で実行される案件終了処理。
データベースの登録／更新／削除処理を行う場合は、独自に DB トランザクション制御を行うこと。
メール送信制御（`data`, `mailIds`, `replaceMap`）は使用できない。

### parameter（ワークフローパラメータ）

| プロパティ | 型 | 説明 |
|-----------|------|------|
| loginGroupId | String | ログイングループID（非推奨。テナントID と同値） |
| localeId | String | ロケールID |
| targetLocales | String | ターゲットロケールID |
| contentsId | String | コンテンツID |
| contentsVersionId | String | コンテンツバージョンID |
| routeId | String | ルートID |
| routeVersionId | String | ルートバージョンID |
| flowId | String | フローID |
| flowVersionId | String | フローバージョンID |
| applyBaseDate | String | 申請基準日 |
| processDate | String | 処理日/到達日 |
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |
| parameter | String | パラメータ |
| actFlag | String | 代理フラグ |
| lastProcessNodeId | String | （最終）処理ノードID |
| lastAuthUserCd | String | （最終）処理権限者コード |
| lastExecUserCd | String | （最終）処理実行者コード |
| lastResultStatus | String | （最終）処理結果ステータス |

### 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |

### 案件終了処理（matter_end_process_no_tran.js）

```javascript
/**
 * ワークフロー 案件終了処理（トランザクションなし）
 *
 * @file matter_end_process_no_tran.js
 * @description ワークフローの案件終了時に実行される処理プログラムです。
 *              このプログラム中でデータベースの登録／更新／削除処理を行う場合は、
 *              独自に DB トランザクション制御を行ってください。
 */

/**
 * 案件終了処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @return {Object} 処理結果
 */
function execute(parameter) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    logger.info('[matterEndNoTran] 案件終了処理開始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic(parameter);
        logger.info('[matterEndNoTran] 案件終了処理完了 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[matterEndNoTran] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * ビジネスロジックのメイン処理を実行します。
 *
 * @param {Object} parameter - ワークフローパラメータ
 */
function processBusinessLogic(parameter) {
    // TODO: ここで案件終了時のビジネスロジックを実装してください
    //
    // 利用可能な主要パラメータ:
    //   parameter.systemMatterId      - システム案件ID
    //   parameter.userDataId          - ユーザデータID
    //   parameter.lastProcessNodeId   - （最終）処理ノードID
    //   parameter.lastAuthUserCd      - （最終）処理権限者コード
    //   parameter.lastExecUserCd      - （最終）処理実行者コード
    //   parameter.lastResultStatus    - （最終）処理結果ステータス
}
```

---

## トランザクションあり / なしの使い分け

| 観点 | トランザクションあり | トランザクションなし |
|------|--------------------|--------------------|
| DB トランザクション | IM-Workflow が管理 | 独自に制御 |
| 処理失敗時 | IM-Workflow 側もロールバック | IM-Workflow 側に影響なし |
| メール送信制御 | `data` で可否を制御可能 | 不可 |
| メール置換文字列 | `replaceMap` で設定可能 | 不可 |
| 用途 | ワークフローと一体で整合性を保つ処理 | 外部連携やログ記録など、WF の成否に影響させたくない処理 |

---

## 使用可能なテンプレート

- **案件終了処理（トランザクションあり）**: [assets/simple-matter-end-process.md](assets/simple-matter-end-process.md)
  - IM-Workflow のトランザクション内で実行
  - DB トランザクションは張らないこと
  - 返却値の `data` でメール送信可否を制御
- **案件終了処理（トランザクションなし）**: [assets/simple-matter-end-process.md](assets/simple-matter-end-process.md)
  - IM-Workflow のトランザクション外で実行
  - DB 処理を行う場合は独自にトランザクション制御

### 生成時の指示例

ユーザが「ワークフローの案件終了処理を作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。
トランザクションの要否を確認し、適切な方を選択すること。
