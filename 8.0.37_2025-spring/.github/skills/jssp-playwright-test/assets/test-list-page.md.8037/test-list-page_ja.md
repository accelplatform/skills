# 一覧画面のテスト実例

## 概要

テーブル表示・ページネーション・ソートのテストパターン。
product_stock 画面（25件のデータ、PAGE_SIZE=10）をベースにした実例。

## 一覧表示

```typescript
test.describe('一覧表示', () => {
  test('ページを開くとテーブルにデータが表示される', async ({ page }) => {
    await openPage(page);

    const rows = page.locator('#stock-table-body tr');
    // PAGE_SIZE = 10 なので最大 10 行
    await expect(rows).toHaveCount(10);
  });

  test('テーブルヘッダーが正しく表示される', async ({ page }) => {
    await openPage(page);

    const headers = page.locator('#stock-table thead th');
    // 編集, 商品コード, 商品名, 単価, 在庫数, 倉庫番号, 備考 = 7列
    await expect(headers).toHaveCount(7);
    await expect(headers.nth(1)).toContainText('商品コード');
    await expect(headers.nth(2)).toContainText('商品名');
    await expect(headers.nth(3)).toContainText('単価');
    await expect(headers.nth(4)).toContainText('在庫数');
    await expect(headers.nth(5)).toContainText('倉庫番号');
    await expect(headers.nth(6)).toContainText('備考');
  });

  test('各行に編集ボタンがある', async ({ page }) => {
    await openPage(page);

    const editButtons = page.locator('#stock-table-body [data-edit-code]');
    await expect(editButtons).toHaveCount(10);
  });

  test('データが0件の場合は空メッセージが表示される', async ({ page }) => {
    await openPage(page);
    await deleteAllData(page);

    const tbody = page.locator('#stock-table-body');
    await expect(tbody).toContainText('データがありません');
    // 行は空メッセージの1行のみ
    await expect(tbody.locator('tr')).toHaveCount(1);
  });
});
```

## ページネーション

```typescript
test.describe('ページネーション', () => {
  test('ページ情報が表示される', async ({ page }) => {
    await openPage(page);

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    // 25 件のデータ → '1 - 10 / 25'
    await expect(paginationInfo).toContainText('1 - 10 / 25');
  });

  test('次ページに遷移できる', async ({ page }) => {
    await openPage(page);

    await page.click('#pagination button[title="次へ"]');

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    await expect(paginationInfo).toContainText('11 - 20 / 25');
  });

  test('前ページに戻れる', async ({ page }) => {
    await openPage(page);

    await page.click('#pagination button[title="次へ"]');
    await page.click('#pagination button[title="前へ"]');

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    await expect(paginationInfo).toContainText('1 - 10 / 25');
  });

  test('最終ページでは次へボタンが無効', async ({ page }) => {
    await openPage(page);

    await page.click('#pagination button[title="次へ"]');
    await page.click('#pagination button[title="次へ"]');

    const nextButton = page.locator('#pagination button[title="次へ"]');
    await expect(nextButton).toBeDisabled();

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    await expect(paginationInfo).toContainText('21 - 25 / 25');
  });

  test('1ページ目では前へボタンが無効', async ({ page }) => {
    await openPage(page);

    const prevButton = page.locator('#pagination button[title="前へ"]');
    await expect(prevButton).toBeDisabled();
  });
});
```

## ソート

```typescript
test.describe('ソート', () => {
  test('商品コードでソートできる', async ({ page }) => {
    await openPage(page);

    // 商品コードヘッダーをクリック（昇順）
    await page.click('th[data-sort-key="productCode"]');

    const firstRow = page.locator('#stock-table-body tr:first-child td:nth-child(2)');
    const firstValue = await firstRow.textContent();

    // もう一度クリック（降順）
    await page.click('th[data-sort-key="productCode"]');

    const firstRowDesc = page.locator('#stock-table-body tr:first-child td:nth-child(2)');
    const firstValueDesc = await firstRowDesc.textContent();

    // 昇順と降順で先頭行が異なるはず
    expect(firstValue).not.toBe(firstValueDesc);
  });

  test('ソートアイコンが切り替わる', async ({ page }) => {
    await openPage(page);

    const th = page.locator('th[data-sort-key="productCode"]');

    // クリック前はソート無し
    await expect(th).not.toHaveClass(/sort-asc|sort-desc/);

    // 1回クリック → 昇順
    await th.click();
    await expect(th).toHaveClass(/sort-asc/);

    // 2回クリック → 降順
    await th.click();
    await expect(th).toHaveClass(/sort-desc/);
  });
});
```
