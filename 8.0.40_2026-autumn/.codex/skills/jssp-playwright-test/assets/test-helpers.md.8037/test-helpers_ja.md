# テスト共通ヘルパー関数

## 概要

テストファイルの先頭に配置する共通ヘルパー関数のパターン集。
対象画面の構造に合わせて必要なものを選択・カスタマイズして使用する。

## ページ遷移

```typescript
import { test, expect, type Page } from '@playwright/test';

const URL = './module_name';

// ページを開いてテーブルが描画されるまで待つ
async function openPage(page: Page) {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');
}
```

## 画面遷移後の検証（404 見逃し防止）

ボタン・リンク・フォーム送信で別画面に遷移するテストは **必ず** このヘルパーで検証する。
`toHaveURL` を部分一致正規表現だけで使うと、コンテキストパス（`/imart/`）から外れた 404 ページでも文字列がマッチしてしまい、404 を素通りしてしまうため。

```typescript
/**
 * 画面遷移が成功したことを 3 点セットで検証する。
 *
 * @param page         - Playwright Page
 * @param urlRegex     - 期待 URL の正規表現（コンテキストパス込みにすること。例: /imart\/equip\/equipment\/search/）
 * @param titleRegex   - 期待ページタイトルの正規表現（省略可）
 * @param headingId    - 期待する見出し要素の id（デフォルト: 'page-title'）
 */
async function expectNavigated(
  page: Page,
  urlRegex: RegExp,
  titleRegex?: RegExp,
  headingId: string = 'page-title'
) {
  // ① コンテキストパス込み URL — コンテキスト外の 404 を弾く
  await expect(page).toHaveURL(urlRegex);
  // ② タイトル — 別ページが返ってきていないかを確認
  if (titleRegex) {
    await expect(page).toHaveTitle(titleRegex);
  }
  // ③ ページ本体の見出し — DOM が正しく描画されたことを確認
  await expect(page.locator(`h1#${headingId}`)).toBeVisible();
}
```

使用例：

```typescript
test('備品検索ボタンをクリックすると備品検索画面に遷移する', async ({ page }) => {
  await page.locator('#goto-search').click();
  await expectNavigated(page, /imart\/equip\/equipment\/search/, /備品検索/);
});
```

**urlRegex の書き方の原則**：
- baseURL の末尾要素（intra-mart の場合は `imart`）を含めること
- 例: baseURL が `http://localhost/imart/` なら `/imart\/equip\/.../`
- これにより、誤って `http://localhost/equip/...`（コンテキスト外）に遷移した場合のマッチを防げる

## ダイアログ操作

```typescript
// ダイアログを開く（新規作成）
async function openCreateDialog(page: Page) {
  await page.click('#create-button');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
}

// ダイアログを開く（編集 — 先頭行の編集ボタン）
async function openEditDialog(page: Page) {
  await page.click('#table-body tr:first-child [data-edit-code]');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
}
```

## 確認ダイアログ操作

```typescript
// 確認ダイアログの「実行」ボタンを押す
async function confirmOk(page: Page) {
  await page.click('.imds-confirm-ok-button');
}

// 確認ダイアログの「キャンセル」ボタンを押す
async function confirmCancel(page: Page) {
  await page.click('.imds-confirm-cancel-button');
}
```

## データ操作

```typescript
// 全データを削除して空にする（sessionStorage を使用する画面の場合）
async function deleteAllData(page: Page) {
  await page.evaluate(() => {
    sessionStorage.setItem('storage_key', JSON.stringify([]));
  });
  await page.reload();
}
```

## ロケータのエスケープ

imds コンポーネントの id は `:fieldName:` 形式のため、CSS セレクタではエスケープが必要。

```typescript
// フィールドの入力
await page.fill('#\\:productCode\\:', 'ABC123');

// エラーメッセージの取得
const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');

// フィールドのバリデーションエラークラス
const field = page.locator('#dialog .imds-field[for="\\:productCode\\:"]');
await expect(field).toHaveClass(/imds-validation-error/);
```

## テーブル行の特定

テーブルのセルは `<td><span>テキスト</span></td>` 構造のため注意が必要。

```typescript
// 行の特定（text= はネストした要素内のテキストにもマッチする）
const row = page.locator('#table-body tr', {
  has: page.locator(`text=${productCode}`)
});

// セルのテキスト検証（toContainText は子要素のテキストも含めてマッチする）
await expect(row.locator('td:nth-child(3)')).toContainText('商品名');

// NG: toHaveText は <span> 内のテキストにマッチしないことがある
// await expect(row.locator('td:nth-child(3)')).toHaveText('商品名');
```

## スクリーンショット

スクリーンショットの出力先は `test-results/` ディレクトリ（Playwright のデフォルト `outputDir`）。

### レイアウト視認用（コーディングエージェントが目視確認するとき）

ページロード後や主要な UI 操作後に呼ぶ。エージェントがテスト実行後に `Read` ツールで PNG を開いてレイアウト崩れを確認するためのもの。

```typescript
async function takeScreenshot(page: Page, name: string) {
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  await page.screenshot({ path: `test-results/screenshots/${safeName}.png` });
}
```

使用例：

```typescript
test('一覧画面の初期表示', async ({ page }) => {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');
  await takeScreenshot(page, 'list-page-initial');         // ページロード後
  await page.click('#create-button');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
  await takeScreenshot(page, 'create-dialog-open');        // ダイアログ表示後
});
```

**呼ぶタイミングの目安**：
- ページロード完了後（`waitForSelector` の直後）
- ダイアログの開閉後
- CRUD 操作後（登録・更新・削除の結果が反映された後）
- バリデーションエラー表示後

### 証跡用（明示的な指示がある場合のみ）

「証跡を残す」「スクショを保存する」「evidence」等のキーワードが指示に含まれる場合のみ使用する。
各テストステップを `screenshotStep()` で囲み、フルページのスクショを連番で保存する。

```typescript
async function screenshotStep(page: Page, testName: string, label: string) {
  const safeName = `${testName}_${label}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  await page.screenshot({ path: `test-results/evidence/${safeName}.png`, fullPage: true });
}
```

使用例：

```typescript
test('新規登録フロー', async ({ page }) => {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');
  await screenshotStep(page, 'create-product', '01_list-initial');

  await page.click('#create-button');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
  await screenshotStep(page, 'create-product', '02_dialog-open');

  await page.fill('#\\:productCode\\:', 'ABC123');
  await page.fill('#\\:productName\\:', 'テスト商品');
  await screenshotStep(page, 'create-product', '03_form-filled');

  await page.click('#save-button');
  await page.click('.imds-confirm-ok-button');
  await page.waitForSelector('#table-body tr');
  await screenshotStep(page, 'create-product', '04_after-save');
});

## ビジュアルリグレッション（デグレード検知）

`toHaveScreenshot()` を使うと、初回実行時に生成したベースライン画像と後続の実行結果を自動比較し、外見上の変化をテスト失敗として検出できる。

### 仕組み

| 実行タイミング | 動作 |
|--------------|------|
| 初回（ベースラインなし） | スナップショットを生成して保存。テストは常に成功 |
| 2回目以降 | ベースラインと比較し、差分が閾値を超えると失敗 + 差分画像を出力 |

### 基本パターン

```typescript
test('一覧画面のビジュアルリグレッション', async ({ page }) => {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');

  // ベースラインと比較（ファイル名は固定すること）
  await expect(page).toHaveScreenshot('product-list.png');
});
```

### 差異の許容範囲を指定する

アニメーションや日時表示など微小な差異が許容される場合は `maxDiffPixelRatio` を指定する。

```typescript
await expect(page).toHaveScreenshot('product-list.png', {
  maxDiffPixelRatio: 0.01,  // ピクセル全体の 1% 以内の差異は許容
});
```

### ベースライン画像の管理

- ベースライン画像は **バージョン管理（Git）に含めること**
- Playwright はベースラインをテストファイルと同階層の `<spec-name>-snapshots/` に保存する
  - 例: `src/test/e2e/sample_product.spec.ts` → `src/test/e2e/sample_product.spec.ts-snapshots/`
- `test-results/` とは異なり `.gitignore` に追加しないこと
- ベースラインを意図的に更新する場合は以下のコマンドを実行する

```bash
npx playwright test --update-snapshots
```

### 注意事項

- 動的なコンテンツ（現在日時、ランダム ID 等）が含まれる箇所は `page.evaluate()` でマスクしてから比較する
- 環境（OS・ブラウザバージョン）が変わるとピクセル差異が出るため、CI 環境とローカル環境でベースラインを統一するか `maxDiffPixelRatio` を調整する
```
