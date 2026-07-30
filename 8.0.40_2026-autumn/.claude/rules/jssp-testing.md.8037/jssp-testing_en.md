---
paths:
  - "src/test/jssp/**/*.test.js"
  - "src/test/e2e/**/*.spec.ts"
  - "playwright.config.ts"
  - "jest.config.js"
---

# Testing Standards

> **Application Scope**: 🟡 **Contextual** — Applies only when writing unit tests.

## Unit Tests for Function Containers

### Overview

- Use Jest on Rhino to perform unit tests on function containers (js) created with the script development model
- Write using Jest-compatible APIs (`describe`, `it`, `expect`, `jest.fn()`, `jest.mock()`, etc.)
- Since Rhino 1.7R4 (ES5 equivalent) is used, arrow functions, let/const, template literals, etc. cannot be used
- Refer to `.claude/skills/jssp-jest-test/SKILL.md` for details

### Test File Placement

```
src/
├── jest.config.js                      # Jest configuration
├── main/jssp/
│   └── {category}/
│       ├── view/{view}.js              # Source code
│       ├── api/{api}.js
│       └── common/{function}.js
└── test/jssp/
    └── {category}/
        ├── view/{view}.test.js         # Jest tests
        ├── api/{api}.test.js
        └── common/{function}.test.js
```

- Test files are placed under `src/test/jssp/src/` in the same directory structure as the source
- File names follow the format `{source_name}.test.js`
- The corresponding source file is automatically loaded into scope via `sourcePathMapping`

### jest.config.js

Place `jest.config.js` in the project root.
Define the path correspondence between test files and source files in `sourcePathMapping`.

```javascript
module.exports = {
    testMatch: ["src/test/jssp/**/*.test.js"],
    sourcePathMapping: {
        "src/test/jssp/src/": "src/main/jssp/src/"
    },
    collectCoverage: true,
    coverageDirectory: "target/coverage"
};
```

| Setting | Description |
|---------|-------------|
| `testMatch` | Search pattern for test files |
| `sourcePathMapping` | Test path to source path mapping. The source with the same relative path as the test file is automatically loaded into scope |
| `collectCoverage` | Enable coverage collection |
| `coverageDirectory` | Coverage report output destination |

### Test Perspectives

| Perspective | Content |
|-------------|---------|
| Normal cases | Correct results are returned for expected input |
| Abnormal cases | Behavior at boundary values such as null/undefined and invalid types |
| Return value structure | Verification of existence, type, and value of required properties |
| API calls | Platform APIs are called with the correct arguments (verified with mock) |
| Error handling | Response structure when an exception occurs (screen: `error.code` / `error.message`, API: `error` / `errorMessage` and HTTP status) |

## Unit Tests for Presentation Pages

### Overview

- Use Playwright for unit tests of presentation pages

### Test File Placement

```
project-root/
├── playwright.config.ts                # Playwright configuration
├── src/
│   └── test/
│       └── e2e/
│           └── <module-name>.spec.ts   # E2E tests
```

### Configuration Standards

**Browser**:
- Use Playwright's default Chromium (do not specify `channel`)
- Run `npx playwright install chromium` beforehand to fetch the browser binary
- However, if a browser is specified, follow that specification

**baseURL**:
- Must include a trailing slash (e.g., `http://127.0.0.1/imart/`)

**URLs in tests**:
- Specify as relative paths from `baseURL` (e.g., `"product_stock"`)
- Do not use absolute paths or paths with leading slashes (page navigation will not work correctly)

### Test Perspectives

#### Screen Display

| Perspective | Content |
|-------------|---------|
| Initial display | Tables, forms, etc. are rendered correctly after page load |
| List display | Rows are displayed matching the number of data items, and values in each column are correct |
| Pagination | Page switching, page information display, button disabled state on first/last page |
| Sorting | Ascending/descending toggles on header click, sort icon display |
| Empty data | A message such as "No data available" is displayed when there are 0 data items |

#### CRUD Operations

| Perspective | Content |
|-------------|---------|
| New creation | Dialog display, required field input, confirmation dialog, data reflected after registration |
| Edit | Loading existing data, modification, confirmation dialog, data reflected after update |
| Delete | Confirmation dialog display, data reflected after deletion, data unchanged when cancelled |

#### Validation

| Perspective | Verification Content |
|-------------|---------------------|
| Required check | Error message is displayed when submitted empty |
| Character type check | Error when Japanese characters are entered in a field that accepts only half-width alphanumerics |
| Character count check | Error when maximum character count is exceeded |
| Range check | Error when numeric field value is outside minimum/maximum range |
| Duplicate check | Error when existing value is entered in a field with a uniqueness constraint |
| Error display | The `imds-validation-error` class is added to the `.imds-field` of the target field |
| Error message | The `.imds-error-text` element is displayed and contains the appropriate message |
| Real-time resolution | Error disappears when input is corrected after error is displayed |

#### Button and Operation Styles

| Perspective | Verification Content |
|-------------|---------------------|
| Primary operations | Registration and update buttons have the `is-primary` class |
| Dangerous operations | Buttons for irreversible operations such as delete have the `is-danger` class |
| Confirmation dialog | Delete confirmation dialog is displayed with `mode: "danger"` (OK button has `is-danger`) |
| Disabled state | Button is `disabled` when the operation is unavailable |

#### Dialogs

| Perspective | Content |
|-------------|---------|
| Open/Close | Opens on button click, closes on close button or overlay click |
| Mode switching | Title and field state (readOnly, etc.) switch correctly between new creation and editing |
| Confirmation dialog | Confirmation dialog is displayed before execution, and operation is cancelled when cancelled |

#### Screen Navigation (404 Detection)

For tests that navigate to another screen via buttons, links, or form submissions, **you must not rely on a partial URL match alone**.
If the navigation target URL is incorrect and falls outside the context path (e.g., `/imart/`) — a typical mistake is writing `location.href = '/equip/...'` with a leading slash — the HTTP 404 page is displayed while the URL still contains the matching string, and the test silently passes despite the 404.

Tests that involve navigation must **also verify the following**:

| Perspective | Verification Content |
|-------------|---------------------|
| URL (including context path) | Use a regex that includes the last segment of baseURL (`imart` etc.), such as `toHaveURL(/imart\/foo\/bar/)`. This rejects 404s outside the context path |
| Page title | Use `toHaveTitle(/expected title/)` to confirm that another page is not returned |
| Page identifier element | Confirm that a screen-specific element such as `h1#page-title` is visible in the DOM |

```typescript
// NG: Partial match only — passes even on http://127.0.0.1/equip/... (404)
await expect(page).toHaveURL(/equip\/equipment\/search/);

// OK: URL with context path + title + page heading
await expect(page).toHaveURL(/imart\/equip\/equipment\/search/);
await expect(page).toHaveTitle(/Equipment Search/);
await expect(page.locator('h1#page-title')).toBeVisible();
```

For Playwright tests, prefer the `expectNavigated()` helper defined in `.claude/skills/jssp-playwright-test/assets/test-helpers.md`.

### Troubleshooting

When E2E tests against intra-mart fail at the connectivity level, the cause is often the execution environment rather than the application. Use the following layered diagnostic.

#### Diagnostic Ladder

1. **Raw TCP reachability**: `bash -c 'cat </dev/tcp/<host>/<port>'`
2. **curl with verbose**: `curl -v http://<host>/imart/login` — if request line shows full URL (`GET http://...`) and `Proxy-Connection` header, traffic is going through a proxy; otherwise it's direct
3. **Node http module**: `node -e "http.get('http://...', r => ...)"` — verifies HTTP works without the browser
4. **Playwright API request**: `request.newContext().fetch(...)` — Node-side Playwright fetch
5. **Chromium navigation**: hook `page.on('requestfailed', ...)` to isolate browser-layer failures

When the behavior differs between layers, the root cause is at that boundary.

#### Common Causes and Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `page.goto: net::ERR_ABORTED` aborting the main page itself | intra-mart embeds `<base href='http://127.0.0.1/imart/'>`, so sub-resource URLs hard-code `127.0.0.1`. Chromium **implicitly bypasses the proxy for localhost/127.0.0.1**, so the container fails to reach the resources and the page aborts | Set `use.proxy.bypass` to `127.0.0.1,<-loopback>` in Playwright to disable the implicit bypass, and point `use.proxy.server` at the corporate proxy |
| Direct TCP to host port 80 fails (`Connection refused` / timeout) | Firewall blocks direct access from the Docker subnet to the host's listening ports | Check via curl whether a path is reachable through the corporate proxy. If so, configure `proxy.server` to read from `HTTP_PROXY` |
| `Executable doesn't exist at .../chrome-headless-shell` | Browser binary missing — first container start or after rebuild | Run `npx playwright install chromium`. For persistence, bake it into the Dockerfile (after `COPY package*.json`, `RUN npx playwright install --with-deps chromium`) |
| `error while loading shared libraries: libglib-2.0.so.0` | Chromium runtime native deps not installed | Add `libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libxkbcommon0 libpango-1.0-0 libcairo2 libasound2 libglib2.0-0` to the Dockerfile. Cannot use `sudo apt` if the container runs with `no-new-privileges`, so the Dockerfile path is required |
| `503 Service Unavailable` / "Blocked" page from Squid | Upstream Squid cannot resolve the hostname and hits an external block list | Use a direct IP (e.g., `172.27.208.1`) or a hostname the proxy treats as local |

#### playwright.config.ts proxy pattern

Configuration template for accessing intra-mart from a devcontainer behind a corporate proxy:

```typescript
const proxyServer = process.env.PW_PROXY_SERVER || process.env.HTTP_PROXY;
const proxyBypass = process.env.PW_PROXY_BYPASS || "127.0.0.1";

export default defineConfig({
  use: {
    baseURL: "http://127.0.0.1/imart/",
    ...(proxyServer ? { proxy: { server: proxyServer, bypass: proxyBypass } } : {}),
  },
});
```

Notes:
- In proxy-less environments (e.g., Windows native), the `proxy` section is not generated, preserving the existing behavior
- On the container side, set `PW_PROXY_BYPASS=127.0.0.1,<-loopback>` via `docker-compose.yml` `environment` to disable Chromium's implicit bypass
