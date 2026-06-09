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
- 例: baseURL が `http://127.0.0.1/imart/` なら `/imart\/equip\/.../`
- これにより、誤って `http://127.0.0.1/equip/...`（コンテキスト外）に遷移した場合のマッチを防げる

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
