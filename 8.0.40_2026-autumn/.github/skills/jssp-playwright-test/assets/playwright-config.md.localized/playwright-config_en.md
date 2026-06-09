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
    baseURL: 'http://127.0.0.1/imart/',
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

- **Always include a trailing slash** (e.g., `http://127.0.0.1/imart/`)
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
const URL = 'http://127.0.0.1/imart/product_stock';
```
