# ジョブスケジューラ ジョブプログラムテンプレート

## 概要

ジョブスケジューラで実行されるジョブプログラムのテンプレート。
画面を持たず、スケジュールまたは手動により実行されるバッチ的な処理である。
関数 `execute()` がジョブスケジューラから呼び出される。

## ファイル構成

```
src/main/jssp/src/{機能名}/job/
  └── sample_job.js               # ジョブプログラム
```

---

## パラメータ取得

ジョブのパラメータは、関数先頭の `@parameter` アノテーションで宣言し、`Contexts.getJobSchedulerContext().getParameter()` でキーごとに取得する。`execute()` は引数を取らない。

```javascript
/**
 * @parameter param-name
 */
function execute() {
  let context = Contexts.getJobSchedulerContext();
  let paramValue = context.getParameter('param-name');
}
```

> ⚠️ `function execute(params)` のように引数で受け取って `JSON.parse()` する方式は誤り。必ず `getParameter()` で取得すること。

## 返却値

| プロパティ | 型 | 説明 |
|-----------|------|------|
| status | String | `"success"` / `"error"` / `"warning"` のいずれか |
| message | String | 実行結果メッセージ（ジョブ監視画面に表示される） |

---

## ジョブプログラム（sample_job.js）

```javascript
/**
 * ジョブスケジューラ ジョブプログラム
 *
 * @file sample_job.js
 * @description ジョブスケジューラから実行されるバッチ処理プログラムです。
 */

// ========================================
// エントリーポイント
// ========================================
/**
 * ジョブ実行のエントリーポイントです。
 * ジョブスケジューラから呼び出されます（引数は取りません）。
 *
 * @parameter target-date
 * @return {Object} 実行結果オブジェクト（JobResult オブジェクト）
 */
function execute() {
  let logger = Logger.getLogger();
  logger.info('[SampleJob] ジョブを開始します。');

  let txResult = Transaction.begin(function() {
    try {
      processBusinessLogic();
    } catch (e) {
      logger.error('[SampleJob] エラーが発生しました。error={}', e.message);
      Transaction.rollback();
      return false;
    }
  });

  if (txResult.error) {
    logger.error('[SampleJob] トランザクションエラーが発生しました。error={}', txResult.errorMessage);
    return {
      status: 'error',
      message: 'ジョブ実行中にエラーが発生しました。'
    };
  }

  logger.info('[SampleJob] ジョブが正常終了しました。');
  return {
    status: 'success',
    message: 'ジョブが正常に完了しました。'
  };
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * ビジネスロジックのメイン処理を実行します。
 */
function processBusinessLogic() {
  // パラメータの取得
  let context = Contexts.getJobSchedulerContext();
  let targetDate = context.getParameter('target-date');

  // TODO: ここでビジネスロジックを実装してください
  //
  // 利用可能な主要パラメータ:
  //   context.getParameter('param-name')   - ジョブに設定されたパラメータ
  //   context.getJobDetail()               - ジョブ詳細情報
  //   context.getJobnet()                  - ジョブネット情報
  //   context.getTrigger()                 - トリガー情報
}
```

---

## 使用可能なテンプレート

- **ジョブプログラム**: [assets/simple-job.md](assets/simple-job.md)
  - ジョブスケジューラから実行されるバッチ処理
  - `Transaction.begin` によるトランザクション管理パターン
  - `Contexts.getJobSchedulerContext()` によるパラメータ取得
  - エラー時はロールバックし `status: "error"` を返却

### 生成時の指示例

ユーザが「バッチ処理を作成して」「ジョブプログラムを実装して」と依頼した場合、この assets のコードを参考にして適切にカスタマイズして生成する。
