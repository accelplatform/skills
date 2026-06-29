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
- Example: For baseURL `http://localhost/imart/`, use `/imart\/equip\/.../`
- This prevents matches when the page accidentally navigates to `http://localhost/equip/...` (outside the context path)

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

## Screenshots

Screenshots are saved to the `test-results/` directory (Playwright's default `outputDir`).

### Layout Inspection (for coding agent visual verification)

Call this after page load and after key UI interactions. The agent opens the PNG files with the `Read` tool after running tests to visually check for layout issues.

```typescript
async function takeScreenshot(page: Page, name: string) {
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  await page.screenshot({ path: `test-results/screenshots/${safeName}.png` });
}
```

Usage example:

```typescript
test('Initial display of list screen', async ({ page }) => {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');
  await takeScreenshot(page, 'list-page-initial');         // After page load
  await page.click('#create-button');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
  await takeScreenshot(page, 'create-dialog-open');        // After dialog opens
});
```

**When to call**:
- After page load completes (immediately after `waitForSelector`)
- After opening/closing a dialog
- After CRUD operations (after registration, update, or deletion result is reflected)
- After validation errors are displayed

### Evidence Recording (only when explicitly instructed)

Use only when the instruction includes keywords such as "leave evidence", "save screenshots", or "evidence".
Wrap each significant test step with `screenshotStep()` to save full-page screenshots in sequence.

```typescript
async function screenshotStep(page: Page, testName: string, label: string) {
  const safeName = `${testName}_${label}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  await page.screenshot({ path: `test-results/evidence/${safeName}.png`, fullPage: true });
}
```

Usage example:

```typescript
test('New registration flow', async ({ page }) => {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');
  await screenshotStep(page, 'create-product', '01_list-initial');

  await page.click('#create-button');
  await expect(page.locator('#dialog-overlay')).toHaveClass(/is-active/);
  await screenshotStep(page, 'create-product', '02_dialog-open');

  await page.fill('#\\:productCode\\:', 'ABC123');
  await page.fill('#\\:productName\\:', 'Test Product');
  await screenshotStep(page, 'create-product', '03_form-filled');

  await page.click('#save-button');
  await page.click('.imds-confirm-ok-button');
  await page.waitForSelector('#table-body tr');
  await screenshotStep(page, 'create-product', '04_after-save');
});

## Visual Regression (Regression Detection)

Using `toHaveScreenshot()`, you can automatically compare later test runs against a baseline screenshot taken on the first run, detecting visual changes as test failures.

### How It Works

| Timing | Behavior |
|--------|----------|
| First run (no baseline) | Generates and saves a snapshot. Test always passes |
| Subsequent runs | Compares against baseline; fails with diff image if difference exceeds threshold |

### Basic Pattern

```typescript
test('Visual regression for list screen', async ({ page }) => {
  await page.goto(URL);
  await page.waitForSelector('#table-body tr');

  // Compare against baseline (keep the filename fixed)
  await expect(page).toHaveScreenshot('product-list.png');
});
```

### Specifying Tolerance

When minor differences are acceptable (animations, timestamps, etc.), use `maxDiffPixelRatio`.

```typescript
await expect(page).toHaveScreenshot('product-list.png', {
  maxDiffPixelRatio: 0.01,  // Allow up to 1% pixel difference
});
```

### Managing Baseline Images

- Baseline images **must be included in version control (Git)**
- Playwright saves baselines in `<spec-name>-snapshots/` next to the test file
  - Example: `src/test/e2e/sample_product.spec.ts` → `src/test/e2e/sample_product.spec.ts-snapshots/`
- Unlike `test-results/`, do **not** add this directory to `.gitignore`
- To intentionally update the baseline, run:

```bash
npx playwright test --update-snapshots
```

### Notes

- For areas with dynamic content (current datetime, random IDs, etc.), mask them with `page.evaluate()` before comparing
- Pixel differences can appear when the OS or browser version changes — either unify the baseline between CI and local environments, or adjust `maxDiffPixelRatio`
```
