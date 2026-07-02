# ワークフロー 案件退避処理リスナーテンプレート

## 概要

IM-Workflow の案件退避処理リスナープログラムのテンプレート。
画面を持たず、完了案件を過去案件テーブルへ退避（アーカイブ）する際に自動実行されるバッチ的な処理である。
関数 `execute(loginGroupId, localeId, systemMatterId, userDataId)` がワークフローエンジンから呼び出される。

他のワークフロー処理プログラムとは異なり、引数が `parameter` オブジェクトではなく個別の値として渡される。

**注意**: このプログラム中では DB トランザクションを張らないこと。

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  └── matter_archive_listener.js       # 案件退避処理リスナー
```

---

## 引数

| 引数名 | 型 | 説明 |
|--------|------|------|
| loginGroupId | String | ログイングループID（非推奨。テナントID と同値） |
| localeId | String | ロケールID |
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |

## 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |

---

## 案件退避処理リスナー（matter_archive_listener.js）

```javascript
/**
 * ワークフロー 案件退避処理リスナー
 *
 * @file matter_archive_listener.js
 * @description 完了案件を過去案件テーブルへ退避（アーカイブ）する際に実行されるリスナープログラムです。
 *              このプログラム中では DB トランザクションを張らないでください。
 */

/**
 * 案件退避処理を実行します。
 *
 * @param {String} loginGroupId - ログイングループID
 * @param {String} localeId - ロケールID
 * @param {String} systemMatterId - システム案件ID
 * @param {String} userDataId - ユーザデータID
 * @return {Object} 処理結果
 */
function execute(loginGroupId, localeId, systemMatterId, userDataId) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic(systemMatterId, userDataId);
    } catch (e) {
        logger.error('[matterArchive] エラーが発生しました。systemMatterId={}, error={}', systemMatterId, e.message);
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
 * @param {String} systemMatterId - システム案件ID
 * @param {String} userDataId - ユーザデータID
 */
function processBusinessLogic(systemMatterId, userDataId) {
    // TODO: ここで案件退避時のビジネスロジックを実装してください
    //
    // 主な用途:
    //   - 独自テーブルのデータを過去案件用テーブルへ移行
    //   - 外部システムへのアーカイブ通知
    //   - 添付ファイル等の関連リソースの退避
}
```

---

## 使用可能なテンプレート

- **案件退避処理リスナー**: [assets/simple-matter-archive-listener.md](assets/simple-matter-archive-listener.md)
  - 完了案件の過去案件テーブルへの退避時に実行されるリスナー処理
  - 引数は `parameter` オブジェクトではなく個別の値で渡される
  - DB トランザクションは張らないこと

### 生成時の指示例

ユーザが「ワークフローの案件退避処理リスナーを作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。
