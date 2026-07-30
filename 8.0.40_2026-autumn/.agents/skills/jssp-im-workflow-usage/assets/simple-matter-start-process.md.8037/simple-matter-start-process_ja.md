# ワークフロー 案件開始処理テンプレート

## 概要

IM-Workflow の案件開始処理プログラムのテンプレート。
画面を持たず、案件の開始時に自動実行されるバッチ的な処理である。
関数 `execute(parameter)` がワークフローエンジンから呼び出される。

**注意**: このプログラム中では DB トランザクションを張らないこと。

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  └── matter_start_process.js     # 案件開始処理
```

---

## parameter（ワークフローパラメータ）

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

## 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |

---

## 案件開始処理（matter_start_process.js）

```javascript
/**
 * ワークフロー 案件開始処理
 *
 * @file matter_start_process.js
 * @description ワークフローの案件開始時に実行される処理プログラムです。
 *              このプログラム中では DB トランザクションを張らないでください。
 */

/**
 * 案件開始処理を実行します。
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

    logger.info('[matterStart] 案件開始処理開始 systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic(parameter);
        logger.info('[matterStart] 案件開始処理完了 systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[matterStart] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
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
    // TODO: ここで案件開始時のビジネスロジックを実装してください
    //
    // 利用可能な主要パラメータ:
    //   parameter.systemMatterId  - システム案件ID
    //   parameter.userDataId      - ユーザデータID
    //   parameter.applyBaseDate   - 申請基準日
    //   parameter.processDate     - 処理日
}
```

---

## 使用可能なテンプレート

- **案件開始処理**: [assets/simple-matter-start-process.md](assets/simple-matter-start-process.md)
  - ワークフローの案件開始時に実行される処理
  - `execute(parameter)` 関数を実装
  - DB トランザクションは張らないこと

### 生成時の指示例

ユーザが「ワークフローの案件開始処理を作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。
