# List Screen Test Examples

## Overview

Test patterns for table display, pagination, and sorting.
Examples based on the product_stock screen (25 records, PAGE_SIZE=10).

## List Display

```typescript
test.describe('List Display', () => {
  test('Opening page displays data in table', async ({ page }) => {
    await openPage(page);

    const rows = page.locator('#stock-table-body tr');
    // PAGE_SIZE = 10, so maximum 10 rows
    await expect(rows).toHaveCount(10);
  });

  test('Table headers are displayed correctly', async ({ page }) => {
    await openPage(page);

    const headers = page.locator('#stock-table thead th');
    // Edit, Product Code, Product Name, Unit Price, Stock Quantity, Warehouse Number, Remarks = 7 columns
    await expect(headers).toHaveCount(7);
    await expect(headers.nth(1)).toContainText('Product Code');
    await expect(headers.nth(2)).toContainText('Product Name');
    await expect(headers.nth(3)).toContainText('Unit Price');
    await expect(headers.nth(4)).toContainText('Stock Quantity');
    await expect(headers.nth(5)).toContainText('Warehouse Number');
    await expect(headers.nth(6)).toContainText('Remarks');
  });

  test('Each row has an edit button', async ({ page }) => {
    await openPage(page);

    const editButtons = page.locator('#stock-table-body [data-edit-code]');
    await expect(editButtons).toHaveCount(10);
  });

  test('Empty message is displayed when there are 0 records', async ({ page }) => {
    await openPage(page);
    await deleteAllData(page);

    const tbody = page.locator('#stock-table-body');
    await expect(tbody).toContainText('No data available');
    // tbody has only 1 row with the empty message
    await expect(tbody.locator('tr')).toHaveCount(1);
  });
});
```

## Pagination

```typescript
test.describe('Pagination', () => {
  test('Page information is displayed', async ({ page }) => {
    await openPage(page);

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    // 25 records → '1 - 10 / 25'
    await expect(paginationInfo).toContainText('1 - 10 / 25');
  });

  test('Can navigate to next page', async ({ page }) => {
    await openPage(page);

    await page.click('#pagination button[title="Next"]');

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    await expect(paginationInfo).toContainText('11 - 20 / 25');
  });

  test('Can go back to previous page', async ({ page }) => {
    await openPage(page);

    await page.click('#pagination button[title="Next"]');
    await page.click('#pagination button[title="Previous"]');

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    await expect(paginationInfo).toContainText('1 - 10 / 25');
  });

  test('Next button is disabled on last page', async ({ page }) => {
    await openPage(page);

    await page.click('#pagination button[title="Next"]');
    await page.click('#pagination button[title="Next"]');

    const nextButton = page.locator('#pagination button[title="Next"]');
    await expect(nextButton).toBeDisabled();

    const paginationInfo = page.locator('#pagination .imds-pagination-options');
    await expect(paginationInfo).toContainText('21 - 25 / 25');
  });

  test('Previous button is disabled on first page', async ({ page }) => {
    await openPage(page);

    const prevButton = page.locator('#pagination button[title="Previous"]');
    await expect(prevButton).toBeDisabled();
  });
});
```

## Sorting

```typescript
test.describe('Sorting', () => {
  test('Can sort by product code', async ({ page }) => {
    await openPage(page);

    // Click product code header (ascending)
    await page.click('th[data-sort-key="productCode"]');

    const firstRow = page.locator('#stock-table-body tr:first-child td:nth-child(2)');
    const firstValue = await firstRow.textContent();

    // Click again (descending)
    await page.click('th[data-sort-key="productCode"]');

    const firstRowDesc = page.locator('#stock-table-body tr:first-child td:nth-child(2)');
    const firstValueDesc = await firstRowDesc.textContent();

    // First row should differ between ascending and descending
    expect(firstValue).not.toBe(firstValueDesc);
  });

  test('Sort icon switches', async ({ page }) => {
    await openPage(page);

    const th = page.locator('th[data-sort-key="productCode"]');

    // Before clicking: no sort
    await expect(th).not.toHaveClass(/sort-asc|sort-desc/);

    // 1 click → ascending
    await th.click();
    await expect(th).toHaveClass(/sort-asc/);

    // 2 clicks → descending
    await th.click();
    await expect(th).toHaveClass(/sort-desc/);
  });
});
```
