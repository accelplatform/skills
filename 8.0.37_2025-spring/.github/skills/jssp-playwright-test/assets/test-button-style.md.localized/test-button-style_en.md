# Button Style Test Examples

## Overview

Test patterns for verifying button CSS classes (`is-primary` / `is-danger`) and confirmation dialog display modes.
Confirms that the appropriate style is applied based on the importance of the operation.

## Button Style Verification

```typescript
test.describe('Button and Operation Styles', () => {
  test('Create button has is-primary class', async ({ page }) => {
    await openPage(page);

    await expect(page.locator('#create-button')).toHaveClass(/is-primary/);
  });

  test('Update button has is-primary class', async ({ page }) => {
    await openPage(page);
    await openCreateDialog(page);

    await expect(page.locator('#update-button')).toHaveClass(/is-primary/);
  });

  test('Delete button has is-danger class', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await expect(page.locator('#delete-button')).toHaveClass(/is-danger/);
  });

  test('OK button in delete confirmation dialog has is-danger class', async ({ page }) => {
    await openPage(page);
    await openEditDialog(page);

    await page.click('#delete-button');

    const okButton = page.locator('.imds-confirm-ok-button');
    await expect(okButton).toHaveClass(/is-danger/);
  });
});
```

## Style Verification Criteria

The style of the OK button in the confirmation dialog changes according to the 5th argument `options.mode` of imdsConfirm.

| Operation Type | Button Class | imdsConfirm mode | Examples |
|----------------|-------------|------------------|---------|
| Primary operations (create, update, search) | `is-primary` | `info` (default) | Create new, Update |
| Warning operations (non-undoable updates) | `is-primary` | `warning` | Bulk update |
| Dangerous operations (delete) | `is-danger` | `danger` | Data deletion |
