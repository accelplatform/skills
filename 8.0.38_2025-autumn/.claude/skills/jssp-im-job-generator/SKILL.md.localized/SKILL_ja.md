---
name: jssp-im-job-generator
description: intra-mart ジョブスケジューラで実行されるジョブプログラム（バッチ処理）を新規生成する。execute() エントリーポイント、パラメータ取得、トランザクション管理、JobResult 返却の実装パターンを提供する。バッチ処理を作成、ジョブを作って、定期実行、夜間バッチ、スケジュール実行、と言及されたときに使用。画面を持たないサーバサイドの定期処理・一括処理にはこのスキルを使うこと。ワークフローのアクション処理・案件処理はジョブではないので jssp-im-workflow-usage を使うこと。画面付きのサーバサイド処理（init関数）は jssp-page-generator を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# ジョブスケジューラ ジョブプログラム生成支援スキル

## 目的

intra-mart Accel Platform のジョブスケジューラで実行されるジョブプログラムを新規に生成するためのスキルセット。
テンプレートや規約に従って、バッチ処理プログラムを作成・構成するための手順を説明する。

## 参照すべき規約

本スキルはバッチ処理（`.js` のみ、画面なし）を生成する。全体像は `{{AGENT_RULES}}/README.md` 参照。

| 規約 | 取り扱い |
|------|---------|
| `jssp-function-container.md` | 🟢 **必読** — `execute()` エントリーポイントの構造 |
| `jssp-error-handling.md` / `jssp-logging.md` | 🟢 **必読** — バッチは多くの場合詳細ログとエラー処理が必須 |
| `jssp-naming.md` / `jssp-code-style.md` / `jssp-file-structure.md` | 🟢 必読 |
| `jssp-2way-sql.md` | 🟡 **DB 操作を含むバッチの場合のみ参照**（多くのバッチは DB を扱うので頻出） |
| `jssp-security.md` | 🟡 外部入力（ジョブパラメータ等）を扱う場合のみ |
| `jssp-presentation-page.md` / `jssp-accessibility.md` | 🔴 **画面なしのため不要** |

## 生成対象

- **ジョブプログラム** (.js) - スケジュールまたは手動により実行されるバッチ処理。画面を持たない

## テンプレート参照先

- `assets/simple-job.md` - ジョブプログラムの実装例（トランザクション管理・パラメータ取得パターン）
- `reference/how-to-job-scheduler.md` - ジョブスケジューラの規約・パラメータ設計・登録手順・プログラムからの実行方法

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「バッチ処理を作成して」
- 「ジョブプログラムを実装して」
- 「定期実行処理を追加して」
- 「ジョブスケジューラのジョブを作って」
- 「夜間バッチを作成して」

## 実装手順

1. ユーザの要件をヒアリング（処理内容、パラメータ、実行タイミング）
2. `assets/simple-job.md` を参照してジョブプログラムを生成
3. ファイル配置場所を確認（`src/main/jssp/src/{機能名}/job/` 配下）
4. 必要に応じて `reference/how-to-job-scheduler.md` のジョブ登録手順を案内

## ジョブプログラムの基本ルール

### エントリーポイント

- ジョブのエントリーポイントは **`execute()`** 関数（画面処理の `init()` ではない）
- プレゼンテーションページ（.html）は **不要**

### パラメータ取得

2通りの方法がある:

1. **`Contexts.getJobSchedulerContext()`** を使用（テンプレートで採用）
   ```javascript
   let context = Contexts.getJobSchedulerContext();
   let value = context.getParameter('param-name');
   ```

2. **`execute(params)` の引数**で文字列として受け取り、JSON パースする
   ```javascript
   function execute(params) {
     let config = JSON.parse(params);
   }
   ```

### 返却値

`execute()` は以下の形式のオブジェクト（`JobResult` 型）を返却する:

| プロパティ | 型 | 説明 |
|-----------|------|------|
| status | String | `'success'` / `'error'` / `'warning'` のいずれか |
| message | String | 実行結果メッセージ（ジョブ監視画面に表示される） |

- `status` が `'error'` の場合、ジョブネットは異常終了として扱われる
- `message` には **機密情報を含めない**（監視テーブルに記録されるため）

### トランザクション管理

- ジョブプログラムでは **`Transaction.begin()` によるトランザクション管理を行う**
- エラー発生時は `Transaction.rollback()` でロールバック
- ワークフローのアクション処理とは異なり、DB トランザクションの使用が可能

## 注意事項

- コーディング規約の詳細は jssp-page-generator の reference 配下を参照
- テンプレートは必要に応じてカスタマイズ
- 参照先で `TODO` が書かれている場合は、その指示どおりに実装する
- ジョブネットは標準機能では **直列実行のみ**（分岐・並列処理は不可）
- ジョブは HTTP 経由では実行されないため、Web.getRequest や HTTPResponse は使用できない

## 生成後の必須検証（自動実行）

**コード生成完了後、ユーザに報告する前に** 以下の検証を順に実行すること。
この検証はユーザに確認を求めず自動で行い、問題があれば報告前に修正する。

### ステップ 1: 自動検証スクリプト

生成したファイルに対して `validate-jssp-code.js` を実行する。**エラーが 0 件になるまで修正を繰り返す。**

```bash
node {{AGENT_ROOT}}/skills/jssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{機能名}/
```

### ステップ 2: 手動チェック

`jssp-page-generator/reference/post-generation-verification.md` のステップ 1〜3 を実行する（ステップ 4 の画面検証はジョブには不要）。

### ステップ 3: コードレビュー・セキュリティチェック（自動実行）

ステップ 1〜2 が完了したら、以下の 2 スキルを **利用可能な場合のみ** 順に実行する。
スキルが存在しない場合はスキップしてよい。ユーザへの報告前に完了させること。

1. `jssp-code-review` スキルが利用可能であれば実行する
2. `jssp-security-check` スキルが利用可能であれば実行する

#### JSSP-JS-022 警告の扱い

自動検証スクリプト（ステップ 1）で以下のような警告が出た場合：

```
WARN [JSSP-JS-022] xxx.js:NN  null を渡す可能性
```

**必ず対応する SQL ファイルを開き、該当パラメータが `/*IF param != null*/.../*END*/` で囲まれているかを確認する。**

- 囲まれている → 問題なし（誤検知）。レビュー報告に「SQL 側の /*IF*/ ガード確認済み」と明記する
- 囲まれていない → `DbParameter.string(x || '')` 等の空文字フォールバックに修正する
