# playwright.config.ts Configuration Examples

## Basic Configuration

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    channel: 'msedge',
    baseURL: 'http://localhost/imart/',
    locale: 'ja-JP',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
});
```

## Configuration Notes

### Browser

- Specify `channel: 'msedge'` to use the system's Edge browser
- This makes `playwright install` unnecessary
- On Linux environments, remove `channel` and run `playwright install`

### baseURL

- **Always include a trailing slash** (e.g., `http://localhost/imart/`)
- Without a trailing slash, relative paths in tests will not resolve correctly
- Can be adapted per environment by only changing the baseURL

### URL Specification in Tests

Use relative paths from `baseURL` within tests.

```typescript
// OK: Relative path (combined with baseURL)
const URL = './module_name';

// NG: Absolute path (baseURL is ignored)
const URL = '/module_name';

// NG: Full URL (becomes environment-dependent)
const URL = 'http://localhost/imart/product_stock';
```

### Screenshot Output Directory

When `outputDir` is not specified, Playwright uses `test-results/` at the project root.
Since this project's `playwright.config.ts` does not specify `outputDir`, screenshot helpers also save to `test-results/`.

| Purpose | Path |
|---------|------|
| Layout inspection (`takeScreenshot`) | `test-results/screenshots/<name>.png` |
| Evidence recording (`screenshotStep`) | `test-results/evidence/<testName>_<label>.png` |

It is recommended to exclude `test-results/` from version control (add to `.gitignore`).

### Japanese Font Support (Linux Environments)

On Linux, Japanese text may appear as tofu boxes (□) in Playwright Chromium screenshots.
This is caused by the absence of Japanese fonts.

#### devcontainer

Add `fonts-ipafont` to `apt-get install` in `.devcontainer/Dockerfile`.

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-ipafont \
    && rm -rf /var/lib/apt/lists/*
```

A **Rebuild Container** is required after changing the Dockerfile.

#### Host Linux (without devcontainer)

Install directly in the terminal.

```bash
sudo apt-get install -y fonts-ipafont
```
