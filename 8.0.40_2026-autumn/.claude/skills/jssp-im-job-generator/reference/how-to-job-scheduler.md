---
paths:
  - "src/main/jssp/**/job/**/*.js"
---

# ジョブスケジューラ規約

## 概要

ジョブスケジューラは、バッチ処理やスケジュール実行を行うための機能。
スクリプト開発モデルでジョブプログラムを実装する場合、画面処理とは異なるエントリポイント（`execute` 関数）を使用する。

**特徴**:
- 画面遷移を伴わないため、プレゼンテーションページ（.html）は不要
- エントリポイントは `init()` ではなく **`execute()`**
- パラメータは文字列として渡される
- 実行結果はステータスオブジェクトで返却

## execute関数の実装

### 基本構造

```javascript
/**
 * ジョブ実行のエントリポイント
 *
 * @param {string} params - ジョブパラメータ（文字列形式）
 * @return {Object} 実行結果オブジェクト（JobResult オブジェクト）
 */
function execute(params) {
  let logger = Logger.getLogger();
  let result = {
    status: 'success',
    message: ''
  };

  try {
    logger.info('ジョブ開始: daily_report');

    let config = parseParams(params);
    let processResult = processBusinessLogic(config);

    result.message = '処理件数: ' + processResult.count + '件';
    logger.info('ジョブ正常終了: {}', result.message);

  } catch (e) {
    result.status = 'error';
    result.message = 'ジョブ実行エラー: ' + e.message;
    logger.error('ジョブ異常終了: {}', e.message);
  }

  return result;
}

/**
 * パラメータのパースと検証
 */
function parseParams(params) {
  let logger = Logger.getLogger();

  if (!params || params === '') {
    return { targetDate: getCurrentDate() };
  }

  try {
    return JSON.parse(params);
  } catch (e) {
    logger.warn('パラメータのパースに失敗、デフォルト値を使用');
    return { targetDate: getCurrentDate() };
  }
}
```

### 戻り値の仕様

| プロパティ | 型 | 説明 |
|-----------|------|------|
| status | string | `"success"`, `"error"`, `"warning"` のいずれか |
| message | string | 実行結果のメッセージ（ジョブ監視画面に表示） |

```javascript
// 正常終了
return { status: 'success', message: '100件処理完了' };

// 警告終了
return { status: 'warning', message: '処理完了（対象データなし）' };

// エラー終了
return { status: 'error', message: 'データベース接続エラー' };
```

**注意**:
- `status` が `"error"` の場合、ジョブネットは異常終了として扱われる
- `message` は監視テーブルに記録されるため、**機密情報を含めない**

## パラメータ設計

### JSON 形式（推奨）

```javascript
// パラメータ例: {"targetDate":"2026-01-15","mode":"full","maxRecords":1000}

function execute(params) {
  let config = JSON.parse(params);
  let targetDate = config.targetDate;
  let mode = config.mode;
  let maxRecords = config.maxRecords;
}
```

### ガイドライン

| 項目 | 推奨事項 |
|------|----------|
| 形式 | 複数パラメータの場合は JSON 形式を使用 |
| 必須/任意 | デフォルト値を設けて、パラメータなしでも動作可能にする |
| 機密情報 | パスワード、トークン等は**含めない** |
| バリデーション | パース失敗時のフォールバック処理を実装 |

## ジョブの登録

テナント管理者画面から登録:
1. **ジョブスケジューラ** → **ジョブ** を選択
2. **新規作成** をクリック
3. 以下の項目を設定

| 項目 | 説明 | 例 |
|------|------|-----|
| ジョブID | ジョブの識別子（任意） | `BATCH_DAILY_REPORT` |
| ジョブ名 | 表示名 | `日次レポート生成` |
| 実行プログラム | `src/main/jssp/src/` からの相対パス（拡張子なし） | `sample/job/daily_report` |
| パラメータ | ジョブに渡すパラメータ | `{"mode":"full"}` |

## ジョブネットの制約

- 標準機能では**直列実行のみ**（分岐・並列処理は不可）
- 各ジョブは独立したトランザクションで実行
- 前のジョブがエラーの場合、後続ジョブは実行されない

## プログラムからのジョブ実行

```javascript
function triggerJob() {
  let logger = Logger.getLogger();
  let jobId = 'BATCH_DAILY_REPORT';
  let params = JSON.stringify({
    targetDate: formatDate(new Date()),
    triggeredBy: 'manual'
  });

  try {
    let result = JobSchedulerManager.execute(jobId, params);

    if (result.error) {
      logger.error('ジョブ起動失敗: {}', result.errorMessage);
      return false;
    }

    logger.info('ジョブ起動成功: {}', jobId);
    return true;

  } catch (e) {
    logger.error('ジョブ実行でエラー発生: {}', e.message);
    return false;
  }
}
```
