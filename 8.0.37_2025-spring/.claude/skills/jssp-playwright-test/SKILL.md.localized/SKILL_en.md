---
name: jssp-playwright-test
description: Generates Playwright E2E tests for intra-mart JSSP presentation pages (HTML). Analyzes the HTML structure of screens and generates test code based on test perspectives for tables, dialogs, forms, button styles, and more. Use when mentioning E2E test, UI test, screen test, Playwright, browser test, integration test, screen behavior verification, or creating tests. Use this skill for screen-related testing.
---

# Playwright E2E Test Generation Skill

## Overview

A skill set for generating Playwright E2E tests against intra-mart Accel Platform presentation pages (HTML).
Analyzes the HTML structure of the target page (tables, dialogs, forms, buttons, etc.) and generates test code based on test perspectives.

## When to Use

When the user makes requests such as:
- "Create a test for ○○ screen"
- "Write tests with Playwright"
- "Add E2E tests"
- "Create a UI test"

## Test Generation Steps

1. Load the target presentation page (HTML)
2. Identify testable elements from the HTML structure (tables, forms, dialogs, buttons, etc.)
3. Design test cases based on the test perspectives in `{{AGENT_RULES}}/jssp-testing.md`
4. Refer to the example code under `assets/` to generate test code

## References

| File | Content |
|---------|------|
| `assets/playwright-config.md` | playwright.config.ts configuration examples and notes |
| `assets/test-helpers.md` | Collection of common test helper function patterns |
| `assets/test-list-page.md` | Test examples for list screens (table, pagination, sort) |
| `assets/test-crud-dialog.md` | Test examples for CRUD dialogs (create, edit, delete) |
| `assets/test-validation.md` | Test examples for validation (required, character type, length, range, duplicate, real-time resolution) |
| `assets/test-button-style.md` | Test examples for button styles (is-primary / is-danger) and confirmation dialogs |
| `assets/test-mailpit.md` | E2E testing of mail-sending features with mailpit (verifying mail via the HTTP API, reaching mailpit from behind a proxy, CSRF secure-token retrieval patterns) |
| `{{AGENT_RULES}}/jssp-testing.md` | Test perspectives and configuration conventions |

## Test Design Principles

### Login Processing

E2E tests may require login before navigating to a screen.
If the test instructions include "log in", include the following login processing in `beforeEach` of `test.describe`.

- If a user code is specified, use that user code and password
- If instructed to "log in as tenant administrator" with no user code specified, use `tenant` (no password) as the default

```typescript
// Login (when user code is specified)
await page.goto('login');
await page.locator('#im_user').fill('aoyagi');        // User code: aoyagi
await page.locator('#im_password').fill('aoyagi');    // Password: aoyagi
await page.locator('input[type="submit"]').click();
```

```typescript
// Login (as tenant administrator)
await page.goto('login');
await page.locator('#im_user').fill('tenant');        // User code: tenant
await page.locator('input[type="submit"]').click();   // No password
```

### File Structure

- Place test files at `src/test/e2e/<module-name>.spec.ts`
- One test file per module (screen)
- Group tests by category using `test.describe`

### URL Specification

- Specify as a relative path from `baseURL` (e.g., `'./product_stock'`)
- Do not use absolute paths or paths with a leading slash

### Verifying Navigation (404 Detection — Required)

For tests that navigate to another screen via buttons, links, or form submissions, **you must not rely on a partial URL match alone**.
If the navigation target URL is incorrect and falls outside the context path (e.g., code that writes `location.href = '/equip/...'` when the context path is `/imart/`), the HTTP 404 page is displayed while the URL still contains the matching string, and the test silently passes despite the 404.

Tests that involve navigation must **always verify the following three checks**:

```typescript
// NG: Partial URL match only — passes even on 404
await expect(page).toHaveURL(/equip\/equipment\/search/);

// OK: 3-check set
await expect(page).toHaveURL(/imart\/equip\/equipment\/search/);  // (1) URL including context path
await expect(page).toHaveTitle(/Equipment Search/);                // (2) Title of the destination page
await expect(page.locator('h1#page-title')).toBeVisible();         // (3) Page heading
```

| Check | Purpose |
|-------|---------|
| (1) URL (including context path) | Rejects URLs outside the context path (404) |
| (2) `toHaveTitle` | Confirms that the expected page (not another page) is returned |
| (3) Page identifier element such as `h1#page-title` | Confirms that the DOM is correctly rendered |

A shared helper `expectNavigated()` is defined in `assets/test-helpers.md`. Tests should call it whenever possible.

### Locator Specification Policy

- Prioritize id selectors (e.g., `#create-button`, `#stock-table-body`)
- imds component ids are in `:fieldName:` format and require escaping (e.g., `#\\:productCode\\:`)
- Table cells have a `<td><span>text</span></td>` structure, so use `toContainText` for text matching
- Use the `page.locator('tr', { has: page.locator('text=...') })` pattern to identify rows

### imds Component Validation Points

- Validation errors: Check that the `imds-validation-error` class is added to `.imds-field`
- Error messages: Check that `.imds-error-text[for=":fieldName:"]` is displayed with an appropriate message
- Dialog overlay: Determine open/close state by the addition/removal of the `is-active` class
- Confirmation dialogs: Operate with `.imds-confirm-ok-button` / `.imds-confirm-cancel-button`
- Button styles: Verify `is-primary` class for primary operations and `is-danger` class for dangerous operations

## Notes

- Refer to `{{AGENT_RULES}}/jssp-testing.md` for details on test perspectives
- Since the `maxlength` attribute is not used in HTML per policy, always verify character length limits in validation tests
- `toHaveText` may not match within `<span>` structures in cells, so `toContainText` is recommended
- **Real-time validation (immediate error resolution) tests must generate all patterns in one go.** Include all 6 of the following perspectives defined in the "Real-time Validation" section of `assets/test-validation.md` without omission:
  - Immediate resolution per required field
  - Immediate resolution for optional fields
  - Resolution on error type switching
  - No reaction before validation is triggered
  - Individual resolution for multiple fields
  - Removal of `imds-validation-error` class
