---
name: jssp-playwright-test
description: intra-mart JSSP プレゼンテーションページ（HTML）の Playwright E2E テストを生成する。画面の HTML 構造を解析し、テーブル・ダイアログ・フォーム・バリデーション・ボタンスタイル等のテスト観点に基づいたテストコードを生成する。E2E テスト、UI テスト、画面テスト、Playwright、ブラウザテスト、結合テスト、画面の動作確認、テストを作成する、と言及されたときに使用。画面系のテストにはこのスキルを使うこと。
---

# Playwright E2E テスト生成スキル

## 概要

intra-mart Accel Platform のプレゼンテーションページ（HTML）に対する Playwright E2E テストを生成するためのスキルセット。
対象ページの HTML 構造（テーブル、ダイアログ、フォーム、ボタン等）を解析し、テスト観点に基づいたテストコードを生成する。

## 使用タイミング

ユーザが以下のような依頼をした場合：
- 「○○画面のテストを作成して」
- 「Playwright でテストを書いて」
- 「E2E テストを追加して」
- 「UIテストを作って」

## テスト生成手順

1. 対象のプレゼンテーションページ（HTML）を読み込む
2. HTML 構造からテスト可能な要素を特定する（テーブル、フォーム、ダイアログ、ボタン等）
3. `.github/instructions/jssp-testing.instructions.md` のテスト観点に基づいてテストケースを設計する
4. **テストコードを生成する前に**、以下の 2 点をユーザに確認する（コード生成を先行させてはならない）

   **確認 ①: スクリーンショット（レイアウト視認用）**
   > 「`takeScreenshot()` によるスクリーンショットを含めますか？
   > コーディングエージェントがテスト実行後に画像を読み込んでレイアウト崩れを確認する用途です。」

   **確認 ②: ビジュアルリグレッションテスト（デグレード検知用）**
   > 「`toHaveScreenshot()` によるビジュアルリグレッションテストを追加しますか？
   > 初回実行でベースライン画像を生成し、再テスト時に外見上の変化を自動検出します。」

5. ユーザの回答を受けてからテストコードを生成する（`assets/` 配下の実例コードを参照）

## 参照先

| ファイル | 内容 |
|---------|------|
| `assets/playwright-config.md` | playwright.config.ts の設定例と注意事項 |
| `assets/test-helpers.md` | テスト共通ヘルパー関数のパターン集 |
| `assets/test-list-page.md` | 一覧画面（テーブル・ページネーション・ソート）のテスト実例 |
| `assets/test-crud-dialog.md` | CRUD ダイアログ（新規作成・編集・削除）のテスト実例 |
| `assets/test-validation.md` | バリデーション（必須・文字種・文字数・範囲・重複・リアルタイム解消）のテスト実例 |
| `assets/test-button-style.md` | ボタンスタイル（is-primary / is-danger）と確認ダイアログのテスト実例 |
| `.github/instructions/jssp-testing.instructions.md` | テスト観点・設定規約 |

## テスト設計の原則

### ログイン処理

E2E テストでは画面遷移前にログインが必要な場合がある。
テストの指示に「ログインする」が含まれている場合は、`test.describe` の `beforeEach` に以下のログイン処理を含めること。

- ユーザコードが指定されている場合は、そのユーザコードとパスワードを使用する
- 「テナント管理者でログインする」と指示があり、ユーザコードが未指定の場合は `tenant`（パスワードなし）をデフォルトとする

```typescript
// ログイン（ユーザコード指定ありの場合）
await page.goto('login');
await page.locator('#im_user').fill('aoyagi');        // ユーザコード: aoyagi
await page.locator('#im_password').fill('aoyagi');    // パスワード: aoyagi
await page.locator('input[type="submit"]').click();
```

```typescript
// ログイン（テナント管理者の場合）
await page.goto('login');
await page.locator('#im_user').fill('tenant');        // ユーザコード: tenant
await page.locator('input[type="submit"]').click();   // パスワードなし
```

### ファイル構成

- テストファイルは `src/test/e2e/<module-name>.spec.ts` に配置する
- 1 モジュール（画面）につき 1 テストファイル
- テストは `test.describe` でカテゴリごとにグループ化する

### URL 指定

- `baseURL` からの相対パスで指定する（例: `'./product_stock'`）
- 絶対パスや先頭スラッシュ付きのパスは使用しない

### 画面遷移後の検証（404 見逃し防止 — 必須）

ボタン・リンク・フォーム送信などで別画面に遷移するテストでは、**遷移後の URL 部分一致だけで判定してはならない**。
遷移先 URL が誤っていてコンテキストパスから外れた場合（例: コンテキスト `/imart/` を含むべきところを `location.href = '/equip/...'` で記述）、HTTP 404 ページが表示されたまま URL に文字列が一致するため、テストは緑のまま 404 を素通りしてしまう。

遷移を伴うテストには **必ず以下 3 点セットを検証** すること：

```typescript
// NG: URL 部分一致だけ — 404 でも通る
await expect(page).toHaveURL(/equip\/equipment\/search/);

// OK: 3 点セット
await expect(page).toHaveURL(/imart\/equip\/equipment\/search/);  // ① コンテキストパス込み URL
await expect(page).toHaveTitle(/備品検索/);                       // ② 遷移先ページのタイトル
await expect(page.locator('h1#page-title')).toBeVisible();        // ③ ページ本体の見出し
```

| 検証項目 | 役割 |
|---------|------|
| ① URL（コンテキストパス込み） | コンテキストパス外（404）を弾く |
| ② `toHaveTitle` | 別のページが返ってきていないかを確認 |
| ③ `h1#page-title` 等のページ識別要素 | DOM が正しくレンダリングされているかを確認 |

共通ヘルパー `expectNavigated()` を `assets/test-helpers.md` に定義済み。テストではこれを呼ぶことを推奨する。

### ロケータの指定方針

- id セレクタを優先する（例: `#create-button`, `#stock-table-body`）
- imds コンポーネントの id は `:fieldName:` 形式のため、エスケープが必要（例: `#\\:productCode\\:`）
- テーブルのセルは `<td><span>テキスト</span></td>` 構造のため、テキストマッチには `toContainText` を使用する
- 行の特定には `page.locator('tr', { has: page.locator('text=...') })` パターンを使用する

### imds コンポーネントの検証ポイント

- バリデーションエラー: `.imds-field` に `imds-validation-error` クラスが付与されること
- エラーメッセージ: `.imds-error-text[for=":fieldName:"]` が表示され適切なメッセージが含まれること
- ダイアログオーバーレイ: `is-active` クラスの付与/除去で開閉を判定する
- 確認ダイアログ: `.imds-confirm-ok-button` / `.imds-confirm-cancel-button` で操作する
- ボタンスタイル: 主要操作は `is-primary`、危険操作は `is-danger` クラスを検証する

## スクリーンショット

ヘルパー関数の実装は `assets/test-helpers.md` の「スクリーンショット」セクションを参照すること。

### レイアウト視認用（`takeScreenshot`）

コーディングエージェントがテスト実行後にスクショを読み込んでレイアウト崩れを目視確認する用途。
**テスト生成手順の確認 ① でユーザが「含める」と回答した場合のみ**、以下のタイミングで挿入する。

| タイミング | 例 |
|-----------|-----|
| ページロード完了後 | `waitForSelector` の直後 |
| ダイアログの開閉後 | `is-active` クラス確認の直後 |
| CRUD 操作後 | 登録・更新・削除の結果が反映された後 |
| バリデーションエラー表示後 | エラークラス付与確認の直後 |

出力先: `test-results/screenshots/<name>.png`

### 証跡用（`screenshotStep`）

「証跡を残す」「スクショを保存する」「evidence」等のキーワードが指示に含まれる場合のみ使用する。
通常の `takeScreenshot()` の代わりに `screenshotStep()` を使い、各テストステップを `fullPage: true` で記録する。

出力先: `test-results/evidence/<testName>_<label>.png`

### ビジュアルリグレッション（`toHaveScreenshot`）

**テスト生成手順の確認 ② でユーザが「追加する」と回答した場合のみ**、ビジュアルリグレッション用の `test.describe` ブロックを追加する。
実装パターンは `assets/test-helpers.md` の「ビジュアルリグレッション」セクションを参照すること。

ユーザが回答しなかった場合は、確認 ② のみ再度尋ねてよい。追加するかどうかを勝手に判断してはならない。

## 注意事項

- テスト観点の詳細は `.github/instructions/jssp-testing.instructions.md` を参照すること
- HTML の `maxlength` 属性は使用しない方針のため、文字数超過は必ずバリデーションテストで検証する
- `toHaveText` はセル内の `<span>` 構造でマッチしない場合があるため `toContainText` を推奨する
- **リアルタイムバリデーション（即時エラー解消）のテストは必ず全パターンを1回で生成すること。** `assets/test-validation.md` の「リアルタイムバリデーション」セクションに定義された以下6つの観点を漏れなく含めること。
  - 必須フィールドごとの即時解消
  - 任意フィールドの即時解消
  - エラー種別の切り替わり解消
  - バリデーション発動前の無反応
  - 複数フィールドの個別解消
  - `imds-validation-error` クラスの除去
