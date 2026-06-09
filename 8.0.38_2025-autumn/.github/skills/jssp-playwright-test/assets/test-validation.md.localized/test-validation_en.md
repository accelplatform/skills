# Validation Test Examples

## Overview

Validation test patterns for form input.
Includes required field checks, character type checks, character count checks, range checks, duplicate checks, error display (class assignment), and real-time error resolution.

## Required Field Check

```typescript
test('Pressing update button with required fields empty causes validation error', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  // Press update button without entering anything
  await page.click('#update-button');

  // Error messages for each required field are displayed
  const productCodeError = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(productCodeError).toBeVisible();
  await expect(productCodeError).toHaveText('Product Code is required.');

  const productNameError = page.locator('.imds-error-text[for="\\:productName\\:"]');
  await expect(productNameError).toBeVisible();
  await expect(productNameError).toHaveText('Product Name is required.');

  const unitPriceError = page.locator('.imds-error-text[for="\\:unitPrice\\:"]');
  await expect(unitPriceError).toBeVisible();
  await expect(unitPriceError).toHaveText('Unit Price is required.');

  const stockQuantityError = page.locator('.imds-error-text[for="\\:stockQuantity\\:"]');
  await expect(stockQuantityError).toBeVisible();
  await expect(stockQuantityError).toHaveText('Stock Quantity is required.');
});
```

## Error Display (imds-validation-error class assignment)

```typescript
test('imds-validation-error class is assigned when required fields are empty', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.click('#update-button');

  // imds-validation-error class is assigned to .imds-field of the target field
  const productCodeField = page.locator('#edit-dialog .imds-field[for="\\:productCode\\:"]');
  await expect(productCodeField).toHaveClass(/imds-validation-error/);

  const productNameField = page.locator('#edit-dialog .imds-field[for="\\:productName\\:"]');
  await expect(productNameField).toHaveClass(/imds-validation-error/);

  const unitPriceField = page.locator('#edit-dialog .imds-field[for="\\:unitPrice\\:"]');
  await expect(unitPriceField).toHaveClass(/imds-validation-error/);

  const stockQuantityField = page.locator('#edit-dialog .imds-field[for="\\:stockQuantity\\:"]');
  await expect(stockQuantityField).toHaveClass(/imds-validation-error/);
});
```

## Character Type Check

```typescript
test('Entering Japanese characters in product code causes validation error', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'テスト');
  await page.fill('#\\:productName\\:', 'Test Product');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('Product Code must contain only alphanumeric characters.');
});

test('Entering Japanese characters in warehouse number causes validation error', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM004');
  await page.fill('#\\:productName\\:', 'Test Product');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');
  await page.fill('#\\:warehouseNumber\\:', '倉庫A');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:warehouseNumber\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('Warehouse Number must contain only alphanumeric characters.');
});
```

## Character Count Check

The policy is to not use the maxlength attribute, so verification is done via validation messages.

```typescript
test('Validation error when product code exceeds 20 characters', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'A'.repeat(21));
  await page.fill('#\\:productName\\:', 'Test Product');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('Product Code must be 20 characters or less.');
});

test('Validation error when product name exceeds 100 characters', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM002');
  await page.fill('#\\:productName\\:', 'あ'.repeat(101));
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productName\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('Product Name must be 100 characters or less.');
});

test('Validation error when remarks exceed 1000 characters', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM005');
  await page.fill('#\\:productName\\:', 'Test Product');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');
  await page.fill('#\\:remarks\\:', 'あ'.repeat(1001));

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:remarks\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('Remarks must be 1000 characters or less.');
});
```

## Range Check

```typescript
test('Validation error when stock quantity is out of range', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM001');
  await page.fill('#\\:productName\\:', 'Test Product');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '1000');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:stockQuantity\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('Stock Quantity must be between 0 and 999.');
});

test('Validation error when negative value is entered for unit price', async ({ page }) => {
  await openPage(page);
  await openCreateDialog(page);

  await page.fill('#\\:productCode\\:', 'NEWITEM003');
  await page.fill('#\\:productName\\:', 'Test Product');
  await page.fill('#\\:unitPrice\\:', '-1');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:unitPrice\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('Unit Price must be 0 or greater.');
});
```

## Duplicate Check

```typescript
test('Validation error when registering with duplicate product code', async ({ page }) => {
  await openPage(page);

  // Get product code from first row
  const existingCode = await page.locator('#stock-table-body tr:first-child td:nth-child(2)').textContent();

  await openCreateDialog(page);
  await page.fill('#\\:productCode\\:', existingCode!.trim());
  await page.fill('#\\:productName\\:', 'Duplicate Test');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');

  await page.click('#update-button');

  const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('This product code is already in use.');
});
```

## Real-time Validation (Immediate Error Resolution)

In imds forms, after a validation error occurs (`activeValidation = true`), when the input value is corrected, re-validation runs immediately on the `input` event and the error is resolved.
When generating tests, all of the following **patterns** must be included.

### List of Perspectives

| # | Perspective | Content |
|---|-------------|---------|
| 1 | Immediate resolution per required field | Individually verify that the error disappears when entering a value (empty → value) for each required field |
| 2 | Immediate resolution for optional fields | Verify that character type/count errors for optional fields (warehouse number, etc.) disappear with correct values |
| 3 | Resolution of error type switching | Verify that character type errors, range errors, etc. disappear immediately when corrected to valid values |
| 4 | No response before validation activation | Verify that errors are not displayed when entering values before pressing the update button (activeValidation=false) |
| 5 | Individual resolution of multiple fields | Verify that when multiple errors occur, fixing them one by one causes only the corresponding error to disappear |
| 6 | Assignment and removal of imds-validation-error class | Verify assignment and removal of `imds-validation-error` class to `.imds-field` |

### 1. Immediate Resolution per Required Field

Create individual tests for each required field.

```typescript
test('Error is immediately resolved when product code input is corrected', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toContainText('Product Code is required.');

  await page.fill('#\\:productCode\\:', 'NEW001');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();
});

test('Error is immediately resolved when product name input is corrected', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:productName\\:"]')
  ).toContainText('Product Name is required.');

  await page.fill('#\\:productName\\:', 'Test Product');
  await expect(
    page.locator('.imds-error-text[for="\\:productName\\:"]')
  ).toBeHidden();
});

test('Error is immediately resolved when unit price input is corrected', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:unitPrice\\:"]')
  ).toContainText('Unit Price is required.');

  await page.fill('#\\:unitPrice\\:', '100');
  await expect(
    page.locator('.imds-error-text[for="\\:unitPrice\\:"]')
  ).toBeHidden();
});

test('Error is immediately resolved when stock quantity input is corrected', async ({ page }) => {
  await page.click('#update-button');
  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toContainText('Stock Quantity is required.');

  await page.fill('#\\:stockQuantity\\:', '10');
  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toBeHidden();
});
```

### 2. Immediate Resolution for Optional Fields

Verify that even for optional fields, errors are immediately resolved when corrected from invalid to valid values.

```typescript
test('Error is immediately resolved when warehouse number input is corrected', async ({ page }) => {
  // Enter invalid value to trigger error
  await page.fill('#\\:productCode\\:', 'NEW001');
  await page.fill('#\\:productName\\:', 'Test');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '10');
  await page.fill('#\\:warehouseNumber\\:', 'WH-01'); // Invalid value containing symbol
  await page.click('#update-button');

  await expect(
    page.locator('.imds-error-text[for="\\:warehouseNumber\\:"]')
  ).toContainText('Warehouse Number must contain only alphanumeric characters.');

  // Error disappears when corrected to valid value
  await page.fill('#\\:warehouseNumber\\:', 'WH01');
  await expect(
    page.locator('.imds-error-text[for="\\:warehouseNumber\\:"]')
  ).toBeHidden();
});
```

### 3. Resolution of Error Type Switching

Verify that character type errors, range errors, and other non-required validation rule errors are immediately resolved when corrected to valid values.

```typescript
test('Character type error in product code is immediately resolved when corrected to valid value', async ({ page }) => {
  await page.fill('#\\:productCode\\:', 'PRD-001'); // Contains symbol
  await page.click('#update-button');

  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toContainText('Product Code must contain only alphanumeric characters.');

  await page.fill('#\\:productCode\\:', 'PRD001NEW');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();
});

test('Range error in stock quantity is immediately resolved when corrected to valid value', async ({ page }) => {
  await page.fill('#\\:productCode\\:', 'NEW001');
  await page.fill('#\\:productName\\:', 'Test');
  await page.fill('#\\:unitPrice\\:', '100');
  await page.fill('#\\:stockQuantity\\:', '1000'); // Exceeds upper limit
  await page.click('#update-button');

  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toContainText('Stock Quantity must be between 0 and 999.');

  await page.fill('#\\:stockQuantity\\:', '999');
  await expect(
    page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')
  ).toBeHidden();
});
```

### 4. No Response Before Validation Activation

Verify that errors are not displayed when entering invalid values before pressing the update button (`activeValidation = false`).

```typescript
test('No error is displayed when entering values before validation activation', async ({ page }) => {
  // Enter invalid value before pressing update button
  await page.fill('#\\:productCode\\:', 'PRD-001');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();

  // No error even when cleared
  await page.fill('#\\:productCode\\:', '');
  await expect(
    page.locator('.imds-error-text[for="\\:productCode\\:"]')
  ).toBeHidden();
});
```

### 5. Individual Resolution of Multiple Fields

Verify that when multiple validation errors appear simultaneously, fixing them one by one causes only the corresponding field's error to disappear while the others remain.

```typescript
test('Errors for multiple fields are individually resolved by correcting each field', async ({ page }) => {
  // Submit with all fields empty → all required errors
  await page.click('#update-button');
  await expect(page.locator('.imds-error-text[for="\\:productCode\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:productName\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeVisible();

  // Enter only product code → only product code error disappears, others remain
  await page.fill('#\\:productCode\\:', 'NEW001');
  await expect(page.locator('.imds-error-text[for="\\:productCode\\:"]')).toBeHidden();
  await expect(page.locator('.imds-error-text[for="\\:productName\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeVisible();
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeVisible();

  // Enter product name → product name error also disappears
  await page.fill('#\\:productName\\:', 'Test Product');
  await expect(page.locator('.imds-error-text[for="\\:productName\\:"]')).toBeHidden();
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeVisible();

  // Enter unit price
  await page.fill('#\\:unitPrice\\:', '100');
  await expect(page.locator('.imds-error-text[for="\\:unitPrice\\:"]')).toBeHidden();
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeVisible();

  // Enter stock quantity → all errors resolved
  await page.fill('#\\:stockQuantity\\:', '10');
  await expect(page.locator('.imds-error-text[for="\\:stockQuantity\\:"]')).toBeHidden();
});
```

### 6. Assignment and Removal of imds-validation-error Class

```typescript
test('imds-validation-error class is removed when validation error is resolved', async ({ page }) => {
  await page.click('#update-button');

  const field = page.locator('#edit-dialog .imds-field[for="\\:productCode\\:"]');
  await expect(field).toHaveClass(/imds-validation-error/);

  await page.fill('#\\:productCode\\:', 'ABC123');
  await expect(field).not.toHaveClass(/imds-validation-error/);
});
```
