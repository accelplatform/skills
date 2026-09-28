# CRUD Dialog Test Examples

## Overview

CRUD operation test patterns for create, edit, and delete dialogs.
Includes opening/closing dialogs, data reflection, and confirmation dialog operations.

## Create New

```typescript
test.describe('Create New', () => {
  test('Create button opens dialog', async ({ page }) => {
    await openPage(page);
    await openCreateDialog(page);

    await expect(page.locator('#dialog-title')).toHaveText('Stock Registration');
    // Product code is editable
    await expect(page.locator('#\\:productCode\\:')).not.toHaveAttribute('readonly');
    // Delete button is hidden
    await expect(page.locator('#delete-button')).toBeHidden();
  });

  test('Can register with correct values', async ({ page }) => {
    await openPage(page);
    await openCreateDialog(page);

    await page.fill('#\\:productCode\\:', 'NEWTEST001');
    await page.fill('#\\:productName\\:', 'Test New Product');
    await page.fill('#\\:unitPrice\\:', '500');
    await page.fill('#\\:stockQuantity\\:', '50');
    await page.fill('#\\:warehouseNumber\\:', 'WH01');
    await page.fill('#\\:remarks\\:', 'Test data');

    await page.click('#update-button');

    // Confirmation dialog
    await expect(page.locator('.imds-confirm-message-content')).toContainText('Are you sure you want to register?');
    await confirmOk(page);

    // Dialog closes
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);

    // Total count increases
    await expect(page.locator('#pagination .imds-pagination-options')).toContainText('/ 26');
  });
});
```

## Edit

```typescript
test.describe('Edit', () => {
  test('Edit button opens dialog', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await expect(page.locator('#dialog-title')).toHaveText('Stock Edit');
    // Product code is read-only
    await expect(page.locator('#\\:productCode\\:')).toHaveAttribute('readonly');
    // Delete button is visible
    await expect(page.locator('#delete-button')).toBeVisible();
  });

  test('Data is reflected in edit dialog', async ({ page }) => {
    await openPage(page);

    // Get product code from first row
    const productCode = await page.locator('#stock-table-body tr:first-child td:nth-child(2)').textContent();

    await openEditDialog(page);

    // Dialog product code matches
    await expect(page.locator('#\\:productCode\\:')).toHaveValue(productCode!.trim());
    // Product name is not empty
    const productName = await page.locator('#\\:productName\\:').inputValue();
    expect(productName.length).toBeGreaterThan(0);
  });

  test('Can edit and update', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    // Change product name
    await page.fill('#\\:productName\\:', 'Updated Test Product Name');
    await page.click('#update-button');

    // Confirmation dialog
    await expect(page.locator('.imds-confirm-message-content')).toContainText('Are you sure you want to update?');
    await confirmOk(page);

    // Dialog closes
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);
  });

  test('Table is updated after editing', async ({ page }) => {
    await openPage(page);

    // Get product code from first row
    const productCode = await page.locator('#stock-table-body tr:first-child td:nth-child(2)').textContent();

    await openEditDialog(page);
    await page.fill('#\\:productName\\:', 'Product Name for Reflection Check');
    await page.click('#update-button');
    await confirmOk(page);
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);

    // Product name of the corresponding row is updated in the table
    const updatedRow = page.locator('#stock-table-body tr', {
      has: page.locator(`text=${productCode!.trim()}`)
    });
    await expect(updatedRow.locator('td:nth-child(3)')).toContainText('Product Name for Reflection Check');
  });

  test('Close button closes dialog', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await page.click('#dialog-close-button');
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);
  });

  test('Clicking overlay closes dialog', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    // Click the edge of the overlay
    await page.locator('#edit-dialog-overlay').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);
  });
});
```

## Delete

```typescript
test.describe('Delete', () => {
  test('Delete button shows confirmation dialog', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await page.click('#delete-button');

    // Confirmation dialog
    await expect(page.locator('.imds-confirm-message-content')).toContainText('Are you sure you want to delete?');
  });

  test('Executing delete decreases data count', async ({ page }) => {
    await openPage(page);

    // Get total count before deletion
    const infoText = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalBefore = parseInt(infoText!.split('/')[1].trim());

    await openEditDialog(page);
    await page.click('#delete-button');
    await confirmOk(page);

    // Dialog closes
    await expect(page.locator('#edit-dialog-overlay')).not.toHaveClass(/is-active/);

    // Total count decreases by 1
    const infoTextAfter = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalAfter = parseInt(infoTextAfter!.split('/')[1].trim());
    expect(totalAfter).toBe(totalBefore - 1);
  });

  test('Canceling in delete confirmation dialog does not delete', async ({ page }) => {
    await openPage(page);

    const infoText = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalBefore = parseInt(infoText!.split('/')[1].trim());

    await openEditDialog(page);
    await page.click('#delete-button');

    // Press cancel
    await page.click('.imds-confirm-cancel-button');

    // Close edit dialog
    await page.click('#dialog-close-button');

    // Count does not change
    const infoTextAfter = await page.locator('#pagination .imds-pagination-options').textContent();
    const totalAfter = parseInt(infoTextAfter!.split('/')[1].trim());
    expect(totalAfter).toBe(totalBefore);
  });
});
```
