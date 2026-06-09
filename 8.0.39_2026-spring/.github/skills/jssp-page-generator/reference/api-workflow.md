---
paths:
  - "src/main/jssp/**/*.js"
---

# ワークフロー連携規約

## ApplyManager API の使用

### 申請処理の実装

```javascript
/**
 * ワークフロー申請処理
 */
function applyWorkflow(applyData) {
  let logger = Logger.getLogger();

  try {
    // ApplyManager のインスタンスを生成
    let manager = new ApplyManager();

    // 申請パラメータの設定（ApplyParamInfo）
    let applyParam = {
      flowId: applyData.flowId,                              // フローID（必須）
      applyBaseDate: applyData.applyBaseDate,                // 申請基準日 "yyyy/MM/dd"（必須）
      applyAuthUserCode: applyData.applyAuthUserCode,        // 申請権限者コード（必須）
      applyExecuteUserCode: applyData.applyExecuteUserCode,  // 申請実行者コード（必須）
      matterName: applyData.matterName,                      // 案件名（必須）
      userDataId: applyData.userDataId,                      // ユーザデータID（任意）
      processComment: applyData.processComment               // 処理コメント（任意）
    };

    // ユーザデータ保存用情報オブジェクト
    let userParam = applyData.userParam || {};

    // 申請実行（戻り値: WorkflowResultInfo<ApplyResultInfo>）
    let result = manager.apply(applyParam, userParam);

    if (!result.resultFlag) {
      // 失敗時: resultStatus からエラー情報を取得
      logger.error('ワークフロー申請エラー: messageId={}', result.resultStatus.messageId);
      return {
        success: false,
        messageId: result.resultStatus.messageId
      };
    }

    // 成功時: data に ApplyResultInfo が格納される
    logger.info('ワークフロー申請完了: systemMatterId={}', result.data.systemMatterId);

    return {
      success: true,
      systemMatterId: result.data.systemMatterId,
      matterNumber: result.data.matterNumber,
      userDataId: result.data.userDataId
    };

  } catch (e) {
    logger.error('ワークフロー申請例外: {}', e.message);
    throw e;
  }
}
```

## 承認・否認処理

```javascript
/**
 * 承認処理
 */
function approveWorkflow(approveData) {
  let logger = Logger.getLogger();

  try {
    // ProcessManager のインスタンスを生成（システム案件ID, ノードID）
    let manager = new ProcessManager(approveData.systemMatterId, approveData.nodeId);

    // 承認パラメータの設定（ApproveParamInfo）
    let approveParam = {
      executeUserCode: approveData.executeUserCode,    // 実行者コード（必須）
      authUserCode: approveData.authUserCode,          // 権限者コード（必須）
      processComment: approveData.processComment       // 処理コメント（任意）
    };

    // ユーザデータ保存用情報オブジェクト
    let userParam = approveData.userParam || {};

    // 承認実行（戻り値: WorkflowResultInfo<null>）
    let result = manager.approve(approveParam, userParam);

    if (!result.resultFlag) {
      logger.error('承認処理エラー: messageId={}', result.resultStatus.messageId);
      return {
        success: false,
        messageId: result.resultStatus.messageId
      };
    }

    logger.info('承認処理完了: systemMatterId={}', approveData.systemMatterId);
    return { success: true };

  } catch (e) {
    logger.error('承認処理例外: {}', e.message);
    throw e;
  }
}

/**
 * 否認処理
 */
function denyWorkflow(denyData) {
  let logger = Logger.getLogger();

  try {
    // ProcessManager のインスタンスを生成（システム案件ID, ノードID）
    let manager = new ProcessManager(denyData.systemMatterId, denyData.nodeId);

    // 否認パラメータの設定（DenyParamInfo）
    let denyParam = {
      executeUserCode: denyData.executeUserCode,    // 実行者コード（必須）
      authUserCode: denyData.authUserCode,          // 権限者コード（必須）
      processComment: denyData.processComment       // 処理コメント（任意）
    };

    // ユーザデータ保存用情報オブジェクト
    let userParam = denyData.userParam || {};

    // 否認実行（戻り値: WorkflowResultInfo<null>）
    let result = manager.deny(denyParam, userParam);

    if (!result.resultFlag) {
      logger.error('否認処理エラー: messageId={}', result.resultStatus.messageId);
      return {
        success: false,
        messageId: result.resultStatus.messageId
      };
    }

    logger.info('否認処理完了: systemMatterId={}', denyData.systemMatterId);
    return { success: true };

  } catch (e) {
    logger.error('否認処理例外: {}', e.message);
    throw e;
  }
}
```

## 注意事項

### ユーザ切替（UserSwitcher）

- 代理処理とは異なり、**本人として処理を実行**
- 履歴には切替後のユーザが記録される

### 代理処理の制限

- 「確認」処理は代理先ユーザでは処理不可
- **代理の代理は許可されていない**
