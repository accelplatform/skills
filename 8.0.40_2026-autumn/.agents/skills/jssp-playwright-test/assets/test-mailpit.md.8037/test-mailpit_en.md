# E2E Testing of Mail Sending Features with mailpit

## Overview

A collection of patterns for receiving mail sent from intra-mart in mailpit and verifying it from Playwright tests via the mailpit HTTP API.
Use this for automated verification of features that send mail, such as job notifications, workflow rejection notifications, and the `im_sendTextMail` / `im_sendHtmlMail` tasks of IM-LogicDesigner.

## When to Apply

When the user requests one of the following:

- "Verify mail sending via E2E tests"
- "Verify mail received in mailpit from Playwright"
- "Test the IM-LogicDesigner mail-sending flow"

## mailpit HTTP API (minimum set used by this skill)

mailpit provides a HTTP UI / API on port `8025` by default. E2E tests only use the following endpoints.

| Method / Path | Purpose | Response |
|---|---|---|
| `DELETE /api/v1/messages` | Delete all messages in the inbox (pre-test cleanup) | 200 |
| `GET /api/v1/messages?limit=N` | Get received messages in newest-first order | `{ total, messages: [{ ID, Subject, From, To, ... }] }` |
| `GET /api/v1/message/{ID}` | Get details of an individual message (Text/HTML body, attachments, etc.) | Same as above plus full structure including `Text` / `HTML` / `Attachments` |
| `GET /api/v1/search?query=...` | Search by subject, body, and recipient | Same structure as the list |

## Reaching mailpit from a devcontainer behind a proxy

In a devcontainer environment behind a corporate proxy, you often cannot reach mailpit (host's `127.0.0.1:8025`) directly. The characteristics are:

- If `PW_PROXY_BYPASS=127.0.0.1,<-loopback>` is set for intra-mart access, mailpit requests from the Playwright `request` fixture are also subject to bypass and fail trying to connect directly
- On the other hand, going through the corporate proxy (e.g., a proxy listening on the docker bridge host IP) often reaches `127.0.0.1:8025`
- For this reason, **the reliable approach is to create an independent APIRequestContext for mailpit and explicitly specify the proxy**

```typescript
import { request as playwrightRequest, type APIRequestContext } from '@playwright/test';

const MAILPIT_BASE_URL = process.env.MAILPIT_BASE_URL || 'http://127.0.0.1:8025';
const PROXY_SERVER = process.env.HTTP_PROXY || process.env.http_proxy;

async function newMailpitContext(): Promise<APIRequestContext> {
  return playwrightRequest.newContext({
    baseURL: MAILPIT_BASE_URL,
    ...(PROXY_SERVER ? { proxy: { server: PROXY_SERVER } } : {})
  });
}
```

Points:
- Make the mailpit host/port overridable via the `MAILPIT_BASE_URL` environment variable (absorbs environment differences)
- Automatically pick up the proxy from `HTTP_PROXY` / `http_proxy`; in proxy-less environments (e.g., Windows native), don't specify it
- Use `request.newContext({ proxy: ... })` to avoid being affected by `playwright.config.ts`'s `use.proxy.bypass`

## Calling intra-mart APIs (CSRF secure token)

When `IM-LogicDesigner` routing or a JSSP REST-API has `secured: true`, the `X-Intramart-Secure-Token` header is required.
Open a page (once) that can issue a secure token while logged into the browser, and extract the value from `<meta name="im_secure_token">`.

```typescript
// 1. After login, open a page with imSecureToken embedded
await page.goto('sample/csrf_check');  // Any page with imSecureToken embedded is fine
const secureToken = await page.locator('meta[name=im_secure_token]').getAttribute('content');
expect(secureToken).toBeTruthy();

// 2. Issue the fetch inside the browser context
//    (uses both the session cookie and the Chromium-routed proxy path as-is)
const apiResp = await page.evaluate(
  async ({ url, token, payload }) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Intramart-Secure-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = text; }
    return { status: r.status, body };
  },
  { url: 'logic/api/sample/send_mail/execute', token: secureToken!, payload: { /* ... */ } }
);
expect(apiResp.status).toBe(200);
```

Why call `fetch` inside `page.evaluate` rather than `page.request`:
- `page.request` issued from the Node side is affected by `use.proxy.bypass`, and traffic to `localhost/127.0.0.1` becomes a direct connection that may fail
- Going through Chromium, the proxy settings including `<-loopback>` are properly applied
- The browser session cookie can be used as-is, eliminating the need for extra authentication code

## Waiting for receipt (polling)

There is a delay of a few hundred milliseconds to several seconds for mail server → mailpit propagation. Use polling, not a fixed sleep.

```typescript
async function fetchMessages(mailpit: APIRequestContext) {
  const resp = await mailpit.get('/api/v1/messages?limit=50');
  expect(resp.ok(), `mailpit list returned ${resp.status()}`).toBe(true);
  return resp.json();
}

async function waitForMessage(
  mailpit: APIRequestContext,
  predicate: (m: any) => boolean,
  timeoutMs = 15_000
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const list = await fetchMessages(mailpit);
    const found = (list.messages || []).find(predicate);
    if (found) return found;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('No matching mail arrived in mailpit');
}
```

Pass a condition unique to each test in `predicate`, such as subject, recipient, or sender.
Make the subject a unique string by mixing in `Date.now()` etc. for each test so that it is not affected by inter-test interference or residual mail.

## Verifying body, sender, and attachments

Each element of `GET /api/v1/messages` only has a summary. Use the **detail API** to retrieve the body (`Text` / `HTML`) and attachments.

```typescript
const detailResp = await mailpit.get(`/api/v1/message/${message.ID}`);
const detail = await detailResp.json();

// Subject
expect(detail.Subject).toBe(expectedSubject);

// Sender
expect(detail.From.Address).toBe('accel@example.org');
// expect(detail.From.Name).toBe('intra-mart');  // To verify display name

// Recipients (array)
expect(detail.To.map((t: { Address: string }) => t.Address))
  .toEqual(['user@example.org']);

// Text body: always include and verify dynamic parts substituted by FreeMarker, etc.
expect(detail.Text).toContain(`Hello, ${userName}.`);
expect(detail.Text).toContain('IM-LogicDesigner');

// HTML body (for im_sendHtmlMail)
expect(detail.HTML).toContain('<h1>Order Confirmation</h1>');

// Attachments
expect(detail.Attachments).toHaveLength(1);
expect(detail.Attachments[0].FileName).toBe('invoice.pdf');
```

**Tips for body verification:**
- Don't just verify fixed strings; assert that parts dynamically determined by test input (user name, amount, timestamp, etc.) are included. This proves that the template engine (FreeMarker, Mustache, MessageManager message expansion, etc.) actually ran
- Line endings may become `\r\n` via mailpit. Partial matching with `toContain` is safer

## Test skeleton

```typescript
import {
  test,
  expect,
  request as playwrightRequest,
  type APIRequestContext
} from '@playwright/test';

const MAILPIT_BASE_URL = process.env.MAILPIT_BASE_URL || 'http://127.0.0.1:8025';
const PROXY_SERVER = process.env.HTTP_PROXY || process.env.http_proxy;
const TOKEN_PAGE_PATH = process.env.IMART_TOKEN_PAGE || 'sample/csrf_check';

async function newMailpitContext(): Promise<APIRequestContext> {
  return playwrightRequest.newContext({
    baseURL: MAILPIT_BASE_URL,
    ...(PROXY_SERVER ? { proxy: { server: PROXY_SERVER } } : {})
  });
}

test.describe('Mail-sending flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('login');
    await page.locator('#im_user').fill('aoyagi');
    await page.locator('#im_password').fill('aoyagi');
    await Promise.all([
      page.waitForURL((url) => !url.pathname.endsWith('/login')),
      page.locator('input[type="submit"]').click()
    ]);
  });

  test('mail arrives matching the input', async ({ page }) => {
    const testSubject = `E2E mail send ${Date.now()}`;

    // Get the secure token
    await page.goto(TOKEN_PAGE_PATH);
    const secureToken = await page.locator('meta[name=im_secure_token]').getAttribute('content');

    const mailpit = await newMailpitContext();
    try {
      // Cleanup
      const del = await mailpit.delete('/api/v1/messages');
      expect(del.ok()).toBe(true);

      // Send trigger (fetch via browser context)
      const apiResp = await page.evaluate(
        async ({ url, token, payload }) => {
          const r = await fetch(url, {
            method: 'POST',
            headers: {
              'X-Intramart-Secure-Token': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          return { status: r.status, body: await r.text() };
        },
        {
          url: 'logic/api/sample/send_mail/execute',
          token: secureToken!,
          payload: { to: ['user@example.org'], userName: 'test user', subject: testSubject }
        }
      );
      expect(apiResp.status).toBe(200);

      // Wait for receipt
      const message = await waitForMessage(mailpit, (m) => m.Subject === testSubject);

      // Get details & assert
      const detail = await (await mailpit.get(`/api/v1/message/${message.ID}`)).json();
      expect(detail.From.Address).toBe('accel@example.org');
      expect(detail.To[0].Address).toBe('user@example.org');
      expect(detail.Text).toContain('Hello, test user');
    } finally {
      await mailpit.dispose();
    }
  });
});

async function waitForMessage(
  mailpit: APIRequestContext,
  predicate: (m: any) => boolean,
  timeoutMs = 15_000
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const resp = await mailpit.get('/api/v1/messages?limit=50');
    const list = await resp.json();
    const found = (list.messages || []).find(predicate);
    if (found) return found;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('No matching mail arrived in mailpit');
}
```

## Checkpoint summary

| Perspective | Verification Content |
|---|---|
| Send trigger | The flow / API / screen operation completes with HTTP 200 |
| Subject | A unique string per test matches exactly (mix in `Date.now()` etc.) |
| Sender | The sender fixed on the flow side (e.g., `accel@example.org`) is set in `From.Address` |
| Recipients | The input `To` / `Cc` / `Bcc` are reflected (check array size and order) |
| Body | Dynamic values substituted into the template (user name, subject, URL, etc.) are included in the body |
| Attachments | When there are attachments, verify `Attachments[].FileName` and the count |
| Encoding | Japanese (or other non-ASCII) appears correctly in the mailpit UI (`toContain` for partial match is sufficient in tests) |

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| mailpit request fails with `connect ECONNREFUSED` | Trying direct connection while behind a corporate proxy | Use `playwright.request.newContext({ proxy: { server: process.env.HTTP_PROXY } })` to specify the proxy explicitly |
| mailpit request returns 503 | The proxy cannot resolve mailpit's hostname | Switch `MAILPIT_BASE_URL` to a host reachable from the proxy (e.g., `:8025` on the docker bridge host IP) |
| API returns 200 but nothing arrives in mailpit | intra-mart's SMTP settings do not point to mailpit | Check the SMTP host in the tenant's mail config (`http://〜/imart/system/system_admin/mail_config/`) |
| API returns 403 | IM-LogicDesigner routing authorization (authzUri) is not set up | In the authorization management screen, grant authorization for `im-logic-rest://<flowId>` to the relevant role/user |
| API returns 400 / secure token error | A token taken from another page has expired, or the `X-Intramart-Secure-Token` header is missing | Get the secure token right before the API call. When calling multiple APIs in sequence, re-fetch as needed |
| Reception is quick but body comparison fails | Difference in line endings (`\r\n` vs `\n`) | Use `toContain` for partial match. Avoid `toBe` for full comparison |

## Related

- For generating mail-sending flows in IM-LogicDesigner, see the `im_sendTextMail` / `im_sendHtmlMail` task templates in the `jssp-im-logic-generator` skill
- For mail sending from jobs, see the `jssp-im-job-generator` skill; for notification mail from workflows, see the `jssp-im-workflow-usage` skill
- For secure token-related conventions, see `.agents/requirements/jssp-security/AGENTS.md`
