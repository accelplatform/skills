# ワークフロー 到達処理テンプレート

## 概要

IM-Workflow の到達処理プログラムのテンプレート。
画面を持たず、ワークフローの各ノードに案件が到達したタイミングで自動実行されるバッチ的な処理である。
関数 `execute(parameter)` がワークフローエンジンから呼び出される。

**注意**: このプログラム中でデータベースの登録／更新／削除処理を行う場合は、独自に DB トランザクション制御を行うこと。

## ファイル構成

```
src/main/jssp/src/{機能名}/workflow/
  └── arrive/
      └── arrive_process.js     # 到達処理
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
| matterName | String | 案件名 |
| matterNumber | String | 案件番号 |
| priorityLevel | String | 優先度 |
| parameter | String | パラメータ |
| nodeId | String | ノードID |
| actFlag | String | 代理フラグ |
| preNodeId | String | 前ノードID |
| preNodeAuthUserCd | String | 前ノード処理権限者コード |
| preNodeExecUserCd | String | 前ノード処理実行者コード |
| preNodeResultStatus | String | 前ノード処理結果ステータス |
| preNodeAuthCompanyCode | String | 前ノード権限会社コード |
| preNodeAuthOrgzSetCode | String | 前ノード権限組織セットコード |
| preNodeAuthOrgzCode | String | 前ノード権限組織コード |
| preNodeProcessComment | String | 前ノード処理コメント |
| mailIds | String | メールテンプレートID |
| replaceMap | Object | メール置換文字列情報 |

## 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| resultFlag | Boolean | 結果フラグ（`true`: 成功 / `false`: 失敗） |
| message | String | 結果メッセージ（失敗の場合のみ） |
| data | Boolean | メール送信可否（`true`: 送信可能 / `false`: 送信不可） |

---

## 到達処理（arrive_process.js）

```javascript
/**
 * ワークフロー 到達処理
 *
 * @file arrive_process.js
 * @description ワークフローの各ノードに案件が到達したタイミングで実行される処理プログラムです。
 *              このプログラム中でデータベースの登録／更新／削除処理を行う場合は、
 *              独自に DB トランザクション制御を行ってください。
 */

/**
 * 到達処理を実行します。
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

    logger.info('[arrive] 到達処理開始 systemMatterId={}, nodeId={}', parameter.systemMatterId, parameter.nodeId);
    try {
        processBusinessLogic(parameter);
        logger.info('[arrive] 到達処理完了 systemMatterId={}, nodeId={}', parameter.systemMatterId, parameter.nodeId);
    } catch (e) {
        logger.error('[arrive] エラーが発生しました。systemMatterId={}, nodeId={}, error={}', parameter.systemMatterId, parameter.nodeId, e.message);
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
    // TODO: ここで到達時のビジネスロジックを実装してください
    //
    // 利用可能な主要パラメータ:
    //   parameter.systemMatterId       - システム案件ID
    //   parameter.userDataId           - ユーザデータID
    //   parameter.nodeId               - 到達ノードID
    //   parameter.preNodeId            - 前ノードID
    //   parameter.preNodeExecUserCd    - 前ノード処理実行者コード
    //   parameter.preNodeResultStatus  - 前ノード処理結果ステータス
    //   parameter.preNodeProcessComment- 前ノード処理コメント
    //   parameter.mailIds              - メールテンプレートID
    //   parameter.replaceMap           - メール置換文字列情報
}
```

---

## メール送信制御

### 概要

到達処理の返却値 `data` でメール送信の可否を制御できる。
ルート定義でノードにメールテンプレートが設定されている場合、到達処理の `data` が `true` のときにメールが送信される。

### メール置換文字列

`parameter.replaceMap` を使用して、メールテンプレート内の置換文字列を動的に設定できる。

```javascript
function execute(parameter) {
  let result = {
    resultFlag: true,
    message: '',
    data: true
  };

  // メール置換文字列を設定
  parameter.replaceMap.put('applicantName', getApplicantName(parameter));
  parameter.replaceMap.put('matterTitle', parameter.matterName);

  return result;
}
```

---

## 使用可能なテンプレート

- **到達処理**: [assets/simple-arrive.md](assets/simple-arrive.md)
  - ワークフローの各ノードに案件が到達した際に実行される処理
  - `execute(parameter)` 関数を実装
  - DB トランザクション制御は独自に行うこと
  - 返却値の `data` でメール送信可否を制御

### 生成時の指示例

ユーザが「ワークフローの到達処理を作成して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。
