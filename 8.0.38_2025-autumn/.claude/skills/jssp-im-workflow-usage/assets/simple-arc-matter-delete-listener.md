# ワークフロー 過去案件削除リスナーテンプレート

## 概要

IM-Workflow の過去案件削除処理リスナープログラムのテンプレート。
画面を持たず、過去案件の削除時に自動実行されるバッチ的な処理である。
関数 `execute(loginGroupId, localeId, systemMatterId, userDataId, archiveMonth)` がワークフローエンジンから呼び出される。

他のワークフロー処理プログラムとは異なり、引数が `parameter` オブジェクトではなく個別の値として渡される。
未完了案件・完了案件の削除リスナーとの違いとして、`archiveMonth`（アーカイブ年月）が追加で渡される。

**注意**: このプログラム中では DB トランザクションを張らないこと。

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  └── arc_matter_delete_listener.js    # 過去案件削除リスナー
```

---

## 引数

| 引数名 | 型 | 説明 |
|--------|------|------|
| loginGroupId | String | ログイングループID（非推奨。テナントID と同値） |
| localeId | String | ロケールID |
| systemMatterId | String | システム案件ID |
| userDataId | String | ユーザデータID |
| archiveMonth | String | アーカイブ年月（yyyyMM 形式） |

## 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |

---

## 過去案件削除リスナー（arc_matter_delete_listener.js）

```javascript
/**
 * ワークフロー 過去案件削除リスナー
 *
 * @file arc_matter_delete_listener.js
 * @description 過去案件の削除時に実行されるリスナープログラムです。
 *              このプログラム中では DB トランザクションを張らないでください。
 */

/**
 * 過去案件削除処理を実行します。
 *
 * @param {String} loginGroupId - ログイングループID
 * @param {String} localeId - ロケールID
 * @param {String} systemMatterId - システム案件ID
 * @param {String} userDataId - ユーザデータID
 * @param {String} archiveMonth - アーカイブ年月（yyyyMM 形式）
 * @return {Object} 処理結果
 */
function execute(loginGroupId, localeId, systemMatterId, userDataId, archiveMonth) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic(systemMatterId, userDataId, archiveMonth);
    } catch (e) {
        logger.error('[arcMatterDelete] エラーが発生しました。systemMatterId={}, archiveMonth={}, error={}', systemMatterId, archiveMonth, e.message);
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
 * @param {String} archiveMonth - アーカイブ年月（yyyyMM 形式）
 */
function processBusinessLogic(systemMatterId, userDataId, archiveMonth) {
    // TODO: ここで過去案件削除時のビジネスロジックを実装してください
    //
    // 主な用途:
    //   - 案件に紐づく独自テーブルのデータ削除
    //   - 外部システムへの削除通知
    //   - 添付ファイル等の関連リソースのクリーンアップ
    //
    // archiveMonth はアーカイブ年月（yyyyMM 形式）
    //   - 過去案件テーブルのパーティション特定に使用可能
}
```

---

## 使用可能なテンプレート

- **過去案件削除リスナー**: [assets/simple-arc-matter-delete-listener.md](assets/simple-arc-matter-delete-listener.md)
  - 過去案件の削除時に実行されるリスナー処理
  - 引数は `parameter` オブジェクトではなく個別の値で渡される
  - `archiveMonth`（アーカイブ年月）が追加で渡される点が他の削除リスナーとの違い
  - DB トランザクションは張らないこと

### 生成時の指示例

ユーザが「ワークフローの過去案件削除リスナーを作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。
