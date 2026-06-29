# 列表画面测试示例

## 概述

表格显示、分页和排序的测试模式。
基于 product_stock 画面（25 条数据，PAGE_SIZE=10）的示例。

## 列表显示

```typescript
test.describe('列表显示', () => {
  test('打开页面后表格显示数据', async ({ page }) => {
    await openPage(page);

    const rows = page.locator('#stock-table-body tr');
    // PAGE_SIZE = 10，最多 10 行
    await expect(rows).toHaveCount(10);
  });

  test('表格标题正确显示', async ({ page }) => {
    await openPage(page);

    const headers = page.locator('#stock-table thead th');
    // 编辑, 商品编码, 商品名称, 单价, 库存数量, 仓库编号, 备注 = 7列
    await expect(headers).toHaveCount(7);
    await expect(headers.nth(1)).toContainText('商品编码');
    await expect(headers.nth(2)).toContainText('商品名称');
    await expect(headers.nth(3)).toContainText('单价');
    await expect(headers.nth(4)).toContainText('库存数量');
    await expect(headers.nth(5)).toContainText('仓库编号');
    await expect(headers.nth(6)).toContainText('备注');
  });

  test('每行都有编辑按钮', async ({ page }) => {
    await openPage(page);

    const editButtons = page.locator('#stock-table-body [data-edit-code]');
    await expect(editButtons).toHaveCount(10);
  });

  test('数据为 0 条时显示空消息', async ({ page }) => {
    await openPage(page);
    await deleteAllData(page);

    const tbody = page.locator('#stock-table-body');
    await expect(tbody).toContainText('暂无数据');
    // 行只有空消息的 1 行
    await expect(tbody.locator('tr')).toHaveCount(1);
  });
});
```

## 分页

```typescript
test.describe('分页', () => {
  test('显示页面信息', async ({ page }) => {
    await openPage(page);

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    // 25 条数据 → '1 - 10 / 25'
    await expect(paginationInfo).toContainText('1 - 10 / 25');
  });

  test('可以跳转到下一页', async ({ page }) => {
    await openPage(page);

    await page.click('#pagination button[title="下一页"]');

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    await expect(paginationInfo).toContainText('11 - 20 / 25');
  });

  test('可以返回上一页', async ({ page }) => {
    await openPage(page);

    await page.click('#pagination button[title="下一页"]');
    await page.click('#pagination button[title="上一页"]');

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    await expect(paginationInfo).toContainText('1 - 10 / 25');
  });

  test('最后一页时下一页按钮禁用', async ({ page }) => {
    await openPage(page);

    await page.click('#pagination button[title="下一页"]');
    await page.click('#pagination button[title="下一页"]');

    const nextButton = page.locator('#pagination button[title="下一页"]');
    await expect(nextButton).toBeDisabled();

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    await expect(paginationInfo).toContainText('21 - 25 / 25');
  });

  test('第一页时上一页按钮禁用', async ({ page }) => {
    await openPage(page);

    const prevButton = page.locator('#pagination button[title="上一页"]');
    await expect(prevButton).toBeDisabled();
  });
});
```

## 排序

```typescript
test.describe('排序', () => {
  test('可以按商品编码排序', async ({ page }) => {
    await openPage(page);

    // 点击商品编码标题（升序）
    await page.click('th[data-sort-key="productCode"]');

    const firstRow = page.locator('#stock-table-body tr:first-child td:nth-child(2)');
    const firstValue = await firstRow.textContent();

    // 再次点击（降序）
    await page.click('th[data-sort-key="productCode"]');

    const firstRowDesc = page.locator('#stock-table-body tr:first-child td:nth-child(2)');
    const firstValueDesc = await firstRowDesc.textContent();

    // 升序和降序的第一行应该不同
    expect(firstValue).not.toBe(firstValueDesc);
  });

  test('排序图标切换', async ({ page }) => {
    await openPage(page);

    const th = page.locator('th[data-sort-key="productCode"]');

    // 点击前无排序
    await expect(th).not.toHaveClass(/sort-asc|sort-desc/);

    // 点击 1 次 → 升序
    await th.click();
    await expect(th).toHaveClass(/sort-asc/);

    // 点击 2 次 → 降序
    await th.click();
    await expect(th).toHaveClass(/sort-desc/);
  });
});
```
