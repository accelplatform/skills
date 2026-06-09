# ワークフロー 分岐条件/分岐結合処理テンプレート

## 概要

IM-Workflow の分岐条件処理・分岐結合処理プログラムのテンプレート。
画面を持たず、ルート上の分岐・結合ノードに到達したタイミングで自動実行されるバッチ的な処理である。
関数 `execute(parameter)` がワークフローエンジンから呼び出される。

- **分岐条件**: 返却値 `data` が `true` の場合、そのルートへ遷移する
- **分岐結合**: 返却値 `data` が `true` の場合、結合する

**注意**:
- このプログラム中では DB トランザクションを張らないこと
- 分岐条件プログラムはファンクションコンテナであるため、`instructions/` 配下のコーディング規約（`let` の使用、命名規則等）に従うこと

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  └── rule/
      └── rule_condition.js     # 分岐条件/分岐結合処理
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
| nodeId | String | ノードID |

## 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |
| data | Boolean | 分岐: `true` で遷移する / 結合: `true` で結合する |

---

## 分岐条件/分岐結合処理（rule_condition.js）

```javascript
/**
 * ワークフロー 分岐条件/分岐結合処理
 *
 * @file rule_condition.js
 * @description ルート上の分岐・結合ノードに到達したタイミングで実行される処理プログラムです。
 *              このプログラム中では DB トランザクションを張らないでください。
 */

// ========================================
// エントリーポイント
// ========================================
/**
 * 分岐条件/分岐結合処理を実行します。
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

    try {
        result.data = evaluateCondition(parameter);
    } catch (e) {
        logger.error('[RuleCondition] エラーが発生しました。systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// 条件判定
// ========================================
/**
 * 分岐条件の判定を行います。
 *
 * @param {Object} parameter - ワークフローパラメータ
 * @return {Boolean} true: 遷移する（結合する） / false: 遷移しない（結合しない）
 */
function evaluateCondition(parameter) {
    // TODO: ここで分岐条件のビジネスロジックを実装してください
    //
    // 利用可能な主要パラメータ:
    //   parameter.systemMatterId  - システム案件ID
    //   parameter.userDataId      - ユーザデータID
    //   parameter.nodeId          - ノードID

    return true;
}
```

---

## 使用可能なテンプレート

- **分岐条件/分岐結合処理**: [assets/simple-rule-condition.md](assets/simple-rule-condition.md)
  - ルート上の分岐・結合ノードで自動実行されるバッチ的な処理
  - `data` の `true`/`false` でルート遷移・結合を制御
  - DB トランザクションは張らないこと

### 生成時の指示例

ユーザが「ワークフローの分岐条件処理を作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。
