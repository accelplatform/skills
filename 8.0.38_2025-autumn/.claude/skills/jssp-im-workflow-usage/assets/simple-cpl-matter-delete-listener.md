# ワークフロー 完了案件削除リスナーテンプレート

## 概要

IM-Workflow の完了案件削除処理リスナープログラムのテンプレート。
画面を持たず、完了案件の削除時に自動実行されるバッチ的な処理である。
関数 `execute(loginGroupId, localeId, systemMatterId, userDataId)` がワークフローエンジンから呼び出される。

他のワークフロー処理プログラムとは異なり、引数が `parameter` オブジェクトではなく個別の値として渡される。

**注意**: このプログラム中では DB トランザクションを張らないこと。

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  └── cpl_matter_delete_listener.js    # 完了案件削除リスナー
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

## 完了案件削除リスナー（cpl_matter_delete_listener.js）

```javascript
/**
 * ワークフロー 完了案件削除リスナー
 *
 * @file cpl_matter_delete_listener.js
 * @description 完了案件の削除時に実行されるリスナープログラムです。
 *              このプログラム中では DB トランザクションを張らないでください。
 */

/**
 * 完了案件削除処理を実行します。
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
        logger.error('[cplMatterDelete] エラーが発生しました。systemMatterId={}, error={}', systemMatterId, e.message);
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
    // TODO: ここで完了案件削除時のビジネスロジックを実装してください
    //
    // 主な用途:
    //   - 案件に紐づく独自テーブルのデータ削除
    //   - 外部システムへの削除通知
    //   - 添付ファイル等の関連リソースのクリーンアップ
}
```

---

## 使用可能なテンプレート

- **完了案件削除リスナー**: [assets/simple-cpl-matter-delete-listener.md](assets/simple-cpl-matter-delete-listener.md)
  - 完了案件の削除時に実行されるリスナー処理
  - 引数は `parameter` オブジェクトではなく個別の値で渡される
  - DB トランザクションは張らないこと

### 生成時の指示例

ユーザが「ワークフローの完了案件削除リスナーを作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。
