# CRUD ダイアログのテスト実例

## 概要

新規作成・編集・削除ダイアログの CRUD 操作テストパターン。
ダイアログの開閉、データ反映、確認ダイアログの操作を含む。

## 新規作成

```typescript
test.describe('新規作成', () => {
  test('新規作成ボタンでダイアログが開く', async ({ page }) => {
    await openPage(page);
    await openCreateDialog(page);

    await expect(page.locator('#dialog-title')).toHaveText('在庫登録');
    // 商品コードは編集可能
    await expect(page.locator('#\\:productCode\\:')).not.toHaveAttribute('readonly');
    // 削除ボタンは非表示
    await expect(page.locator('#delete-button')).toBeHidden();
  });

  test('正しい値を入力して登録できる', async ({ page }) => {
    await openPage(page);
    await openCreateDialog(page);

    await page.fill('#\\:productCode\\:', 'NEWTEST001');
    await page.fill('#\\:productName\\:', 'テスト新規商品');
    await page.fill('#\\:unitPrice\\:', '500');
    await page.fill('#\\:stockQuantity\\:', '50');
    await page.fill('#\\:warehouseNumber\\:', 'WH01');
    await page.fill('#\\:remarks\\:', 'テスト用データ');

    await page.click('#update-button');

    // 確認ダイアログ
    await expect(page.locator('.imds-confirm-message-content')).toContainText('登録してもよろしいですか？');
    await confirmOk(page);

    // ダイアログが閉じる
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);

    // 合計件数が増加
    await expect(page.locator('#pagination .imds-pagination-options')).toContainText('/ 26');
  });
});
```

## 編集

```typescript
test.describe('編集', () => {
  test('編集ボタンでダイアログが開く', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await expect(page.locator('#dialog-title')).toHaveText('在庫編集');
    // 商品コードは読み取り専用
    await expect(page.locator('#\\:productCode\\:')).toHaveAttribute('readonly');
    // 削除ボタンが表示される
    await expect(page.locator('#delete-button')).toBeVisible();
  });

  test('編集ダイアログにデータが反映されている', async ({ page }) => {
    await openPage(page);

    // 先頭行の商品コードを取得
    const productCode = await page.locator('#stock-table-body tr:first-child td:nth-child(2)').textContent();

    await openEditDialog(page);

    // ダイアログの商品コードが一致する
    await expect(page.locator('#\\:productCode\\:')).toHaveValue(productCode!.trim());
    // 商品名が空でないこと
    const productName = await page.locator('#\\:productName\\:').inputValue();
    expect(productName.length).toBeGreaterThan(0);
  });

  test('編集して更新できる', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    // 商品名を変更
    await page.fill('#\\:productName\\:', '更新テスト商品名');
    await page.click('#update-button');

    // 確認ダイアログ
    await expect(page.locator('.imds-confirm-message-content')).toContainText('更新してもよろしいですか？');
    await confirmOk(page);

    // ダイアログが閉じる
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);
  });

  test('編集後にテーブルへ反映される', async ({ page }) => {
    await openPage(page);

    // 先頭行の商品コードを取得
    const productCode = await page.locator('#stock-table-body tr:first-child td:nth-child(2)').textContent();

    await openEditDialog(page);
    await page.fill('#\\:productName\\:', '反映確認用商品名');
    await page.click('#update-button');
    await confirmOk(page);
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);

    // テーブル内で該当行の商品名が更新されていること
    const updatedRow = page.locator('#stock-table-body tr', {
      has: page.locator(`text=${productCode!.trim()}`)
    });
    await expect(updatedRow.locator('td:nth-child(3)')).toContainText('反映確認用商品名');
  });

  test('閉じるボタンでダイアログが閉じる', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await page.click('#dialog-close-button');
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);
  });

  test('オーバーレイクリックでダイアログが閉じる', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    // オーバーレイの端をクリック
    await page.locator('#edit-dialog-overlay').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);
  });
});
```

## 削除

```typescript
test.describe('削除', () => {
  test('削除ボタンで確認ダイアログが表示される', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await page.click('#delete-button');

    // 確認ダイアログ
    await expect(page.locator('.imds-confirm-message-content')).toContainText('削除してもよろしいですか？');
  });

  test('削除を実行するとデータが減る', async ({ page }) => {
    await openPage(page);

    // 削除前の合計件数を取得
    const infoText = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalBefore = parseInt(infoText!.split('/')[1].trim());

    await openEditDialog(page);
    await page.click('#delete-button');
    await confirmOk(page);

    // ダイアログが閉じる
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);

    // 合計件数が 1 減る
    const infoTextAfter = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalAfter = parseInt(infoTextAfter!.split('/')[1].trim());
    expect(totalAfter).toBe(totalBefore - 1);
  });

  test('削除の確認ダイアログでキャンセルすると削除されない', async ({ page }) => {
    await openPage(page);

    const infoText = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalBefore = parseInt(infoText!.split('/')[1].trim());

    await openEditDialog(page);
    await page.click('#delete-button');

    // キャンセルを押す
    await page.click('.imds-confirm-cancel-button');

    // 編集ダイアログを閉じる
    await page.click('#dialog-close-button');

    // 件数が変わらない
    const infoTextAfter = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalAfter = parseInt(infoTextAfter!.split('/')[1].trim());
    expect(totalAfter).toBe(totalBefore);
  });
});
```