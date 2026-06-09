# Common Test Helper Functions

## Overview

A collection of common helper function patterns to place at the top of test files.
Select and customize the ones needed based on the structure of the target screen.

## Page Navigation

```typescript
import { test, expect, type Page } from '@playwright/test';

const URL = './module_name';

// Open page and wait until the table is rendered
async function openPage(page: Page) {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');
}
```

## Verifying Navigation (404 Detection)

For tests that navigate to another screen via buttons, links, or form submissions, **always** verify with this helper.
Using `toHaveURL` with a partial-match regex alone causes 404 pages (when the navigation falls outside the context path `/imart/`) to pass silently, because the URL string still matches.

```typescript
/**
 * Verifies that the navigation succeeded with three checks.
 *
 * @param page         - Playwright Page
 * @param urlRegex     - Regex for the expected URL (must include the context path. Example: /imart\/equip\/equipment\/search/)
 * @param titleRegex   - Optional. Regex for the expected page title
 * @param headingId    - Id of the expected heading element (default: 'page-title')
 */
async function expectNavigated(
  page: Page,
  urlRegex: RegExp,
  titleRegex?: RegExp,
  headingId: string = 'page-title'
) {
  // (1) URL including context path — rejects 404s outside the context path
  await expect(page).toHaveURL(urlRegex);
  // (2) Title — confirms that the expected page (not another page) was returned
  if (titleRegex) {
    await expect(page).toHaveTitle(titleRegex);
  }
  // (3) Page heading — confirms the DOM was rendered correctly
  await expect(page.locator(`h1#${headingId}`)).toBeVisible();
}
```

Usage example:

```typescript
test('Clicking the equipment search button navigates to the equipment search screen', async ({ page }) => {
  await page.locator('#goto-search').click();
  await expectNavigated(page, /imart\/equip\/equipment\/search/, /Equipment Search/);
});
```

**Principles for writing urlRegex**:
- Include the last segment of baseURL (`imart` for intra-mart)
- Example: For baseURL `http://127.0.0.1/imart/`, use `/imart\/equip\/.../`
- This prevents matches when the page accidentally navigates to `http://127.0.0.1/equip/...` (outside the context path)

## Dialog Operations

```typescript
// Open dialog (create new)
async function openCreateDialog(page: Page) {
  await page.click('#create-button');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
}

// Open dialog (edit — edit button in first row)
async function openEditDialog(page: Page) {
  await page.click('#table-body tr:first-child [data-edit-code]');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
}
```

## Confirmation Dialog Operations

```typescript
// Press the "Execute" button in the confirmation dialog
async function confirmOk(page: Page) {
  await page.click('.imds-confirm-ok-button');
}

// Press the "Cancel" button in the confirmation dialog
async function confirmCancel(page: Page) {
  await page.click('.imds-confirm-cancel-button');
}
```

## Data Operations

```typescript
// Delete all data to make it empty (for screens using sessionStorage)
async function deleteAllData(page: Page) {
  await page.evaluate(() => {
    sessionStorage.setItem('storage_key', JSON.stringify([]));
  });
  await page.reload();
}
```

## Locator Escaping

imds component IDs are in the format `:fieldName:`, so escaping is required in CSS selectors.

```typescript
// Input into a field
await page.fill('#\\:productCode\\:', 'ABC123');

// Get error message
const error = page.locator('.imds-error-text[for="\\:productCode\\:"]');

// Validation error class on a field
const field = page.locator('#dialog .imds-field[for="\\:productCode\\:"]');
await expect(field).toHaveClass(/imds-validation-error/);
```

## Identifying Table Rows

Table cells have a `<td><span>text</span></td>` structure, so care is needed.

```typescript
// Identify row (text= also matches text inside nested elements)
const row = page.locator('#table-body tr', {
  has: page.locator(`text=${productCode}`)
});

// Verify cell text (toContainText matches text including child elements)
await expect(row.locator('td:nth-child(3)')).toContainText('Product Name');

// NG: toHaveText may not match text inside <span>
// await expect(row.locator('td:nth-child(3)')).toHaveText('Product Name');
```
