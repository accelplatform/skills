# ジョブスケジューラ規約

## 概要

ジョブスケジューラは、バッチ処理やスケジュール実行を行うための機能。
スクリプト開発モデルでジョブプログラムを実装する場合、画面処理とは異なるエントリポイント（`execute` 関数）を使用する。

**特徴**:
- 画面遷移を伴わないため、プレゼンテーションページ（.html）は不要
- エントリポイントは `init()` ではなく **`execute()`**（**引数は取らない**）
- パラメータは関数先頭の `@parameter` アノテーションで宣言し、`Contexts.getJobSchedulerContext().getParameter()` で取得する
- 実行結果はステータスオブジェクトで返却

## execute関数の実装

### 基本構造

`execute()` は**引数を取らない**。受け取りたいパラメータは関数先頭の `@parameter` アノテーションで宣言し、`Contexts.getJobSchedulerContext().getParameter('<パラメータ名>')` で取得する。

```javascript
/**
 * ジョブ実行のエントリポイント
 *
 * @parameter targetDate
 * @return {Object} 実行結果オブジェクト（JobResult オブジェクト）
 */
function execute() {
  let logger = Logger.getLogger();
  let result = {
    status: 'success',
    message: ''
  };

  try {
    logger.info('ジョブ開始: daily_report');

    let context = Contexts.getJobSchedulerContext();
    let targetDate = context.getParameter('targetDate') || getCurrentDate();

    let processResult = processBusinessLogic(targetDate);

    result.message = '処理件数: ' + processResult.count + '件';
    logger.info('ジョブ正常終了: {}', result.message);

  } catch (e) {
    result.status = 'error';
    result.message = 'ジョブ実行エラー: ' + e.message;
    logger.error('ジョブ異常終了: {}', e.message);
  }

  return result;
}
```

> ⚠️ `function execute(params)` のように**引数で文字列を受け取って `JSON.parse()` する実装は誤り**。ジョブスケジューラは `execute()` を引数なしで呼び出すため、パラメータは必ず `getParameter()` で取得すること。

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

### `@parameter` アノテーションによる宣言

ジョブで受け取るパラメータは、`execute()` 直前の JSDoc コメントに `@parameter` で宣言する。宣言した各パラメータは `getParameter('<パラメータ名>')` で**個別に文字列として**取得する。

```javascript
/**
 * @parameter targetDate 2026-01-15
 * @parameter mode full
 * @parameter maxRecords 1000
 */
function execute() {
  let context = Contexts.getJobSchedulerContext();
  let targetDate = context.getParameter('targetDate');
  let mode = context.getParameter('mode');
  let maxRecords = parseInt(context.getParameter('maxRecords'), 10);
}
```

- 書式は `@parameter <パラメータ名> <デフォルト値>`（デフォルト値は省略可）
- 宣言したパラメータは、ジョブ登録時に管理者がデフォルト値を上書き設定できる
- `getParameter()` の戻り値は**常に文字列**。数値・真偽値が必要なら明示的に変換する（`parseInt` 等）
- ⚠️ **説明文（地の文）の中に `@parameter` という文字列を書かないこと**。解析器は行頭以外でも `@parameter` を検出し、直後の語をパラメータ名として誤って宣言する（例: 「`@parameter` で宣言します」→「で宣言します」という名前のパラメータが生成される）。説明する場合は「アノテーション」等に言い換える

### ガイドライン

| 項目 | 推奨事項 |
|------|----------|
| 宣言 | 受け取るパラメータは `@parameter` で明示的に宣言する |
| 必須/任意 | デフォルト値を設けて、未設定（`null`）でも動作可能にする |
| 型変換 | `getParameter()` は文字列を返すため、数値等は明示変換する |
| 機密情報 | パスワード、トークン等は**含めない** |

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
| パラメータ | プログラムの `@parameter` で宣言したパラメータごとに値を設定（`@parameter` のデフォルト値が初期表示される） | `mode` = `full` |

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
