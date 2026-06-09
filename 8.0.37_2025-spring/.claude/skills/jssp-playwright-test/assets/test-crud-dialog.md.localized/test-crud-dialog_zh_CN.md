# CRUD 对话框测试示例

## 概述

新建、编辑、删除对话框的 CRUD 操作测试模式。
包含对话框的开关、数据反映以及确认对话框的操作。

## 新建

```typescript
test.describe('新建', () => {
  test('新建按钮打开对话框', async ({ page }) => {
    await openPage(page);
    await openCreateDialog(page);

    await expect(page.locator('#dialog-title')).toHaveText('库存注册');
    // 商品编码可编辑
    await expect(page.locator('#\\:productCode\\:')).not.toHaveAttribute('readonly');
    // 删除按钮隐藏
    await expect(page.locator('#delete-button')).toBeHidden();
  });

  test('输入正确的值后可以注册', async ({ page }) => {
    await openPage(page);
    await openCreateDialog(page);

    await page.fill('#\\:productCode\\:', 'NEWTEST001');
    await page.fill('#\\:productName\\:', '测试新商品');
    await page.fill('#\\:unitPrice\\:', '500');
    await page.fill('#\\:stockQuantity\\:', '50');
    await page.fill('#\\:warehouseNumber\\:', 'WH01');
    await page.fill('#\\:remarks\\:', '测试数据');

    await page.click('#update-button');

    // 确认对话框
    await expect(page.locator('.imds-confirm-message-content')).toContainText('确定要注册吗？');
    await confirmOk(page);

    // 对话框关闭
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);

    // 总件数增加
    await expect(page.locator('#pagination .imds-pagination-options')).toContainText('/ 26');
  });
});
```

## 编辑

```typescript
test.describe('编辑', () => {
  test('编辑按钮打开对话框', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await expect(page.locator('#dialog-title')).toHaveText('库存编辑');
    // 商品编码为只读
    await expect(page.locator('#\\:productCode\\:')).toHaveAttribute('readonly');
    // 删除按钮显示
    await expect(page.locator('#delete-button')).toBeVisible();
  });

  test('编辑对话框中显示了数据', async ({ page }) => {
    await openPage(page);

    // 获取第一行的商品编码
    const productCode = await page.locator('#stock-table-body tr:first-child td:nth-child(2)').textContent();

    await openEditDialog(page);

    // 对话框中的商品编码一致
    await expect(page.locator('#\\:productCode\\:')).toHaveValue(productCode!.trim());
    // 商品名称不为空
    const productName = await page.locator('#\\:productName\\:').inputValue();
    expect(productName.length).toBeGreaterThan(0);
  });

  test('可以编辑并更新', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    // 修改商品名称
    await page.fill('#\\:productName\\:', '更新测试商品名');
    await page.click('#update-button');

    // 确认对话框
    await expect(page.locator('.imds-confirm-message-content')).toContainText('确定要更新吗？');
    await confirmOk(page);

    // 对话框关闭
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);
  });

  test('编辑后反映到表格中', async ({ page }) => {
    await openPage(page);

    // 获取第一行的商品编码
    const productCode = await page.locator('#stock-table-body tr:first-child td:nth-child(2)').textContent();

    await openEditDialog(page);
    await page.fill('#\\:productName\\:', '用于验证反映的商品名');
    await page.click('#update-button');
    await confirmOk(page);
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);

    // 表格中对应行的商品名称已更新
    const updatedRow = page.locator('#stock-table-body tr', {
      has: page.locator(`text=${productCode!.trim()}`)
    });
    await expect(updatedRow.locator('td:nth-child(3)')).toContainText('用于验证反映的商品名');
  });

  test('关闭按钮关闭对话框', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await page.click('#dialog-close-button');
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);
  });

  test('点击遮罩层关闭对话框', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    // 点击遮罩层边缘
    await page.locator('#edit-dialog-overlay').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);
  });
});
```

## 删除

```typescript
test.describe('删除', () => {
  test('删除按钮显示确认对话框', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await page.click('#delete-button');

    // 确认对话框
    await expect(page.locator('.imds-confirm-message-content')).toContainText('确定要删除吗？');
  });

  test('执行删除后数据减少', async ({ page }) => {
    await openPage(page);

    // 获取删除前的总件数
    const infoText = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalBefore = parseInt(infoText!.split('/')[1].trim());

    await openEditDialog(page);
    await page.click('#delete-button');
    await confirmOk(page);

    // 对话框关闭
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);

    // 总件数减少 1
    const infoTextAfter = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalAfter = parseInt(infoTextAfter!.split('/')[1].trim());
    expect(totalAfter).toBe(totalBefore - 1);
  });

  test('在删除确认对话框中取消则不删除', async ({ page }) => {
    await openPage(page);

    const infoText = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalBefore = parseInt(infoText!.split('/')[1].trim());

    await openEditDialog(page);
    await page.click('#delete-button');

    // 点击取消
    await page.click('.imds-confirm-cancel-button');

    // 关闭编辑对话框
    await page.click('#dialog-close-button');

    // 件数不变
    const infoTextAfter = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalAfter = parseInt(infoTextAfter!.split('/')[1].trim());
    expect(totalAfter).toBe(totalBefore);
  });
});
```
