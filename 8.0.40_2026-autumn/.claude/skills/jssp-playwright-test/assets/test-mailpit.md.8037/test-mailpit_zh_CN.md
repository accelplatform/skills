# 使用 mailpit 对邮件发送功能的 E2E 测试

## 概述

在 mailpit 中接收从 intra-mart 发出的邮件，并通过 Playwright 测试调用 mailpit 的 HTTP API 进行验证的模式集合。
用于对涉及邮件发送的功能进行自动化验证，例如作业通知、工作流退回通知、IM-LogicDesigner 的 `im_sendTextMail` / `im_sendHtmlMail` 任务等。

## 适用时机

当用户提出以下需求时：

- "想通过 E2E 测试验证邮件发送"
- "想用 Playwright 验证 mailpit 中收到的邮件"
- "想测试 IM-LogicDesigner 的邮件发送流程"

## mailpit HTTP API（本技能使用的最小集合）

mailpit 默认在 `8025` 端口提供 HTTP UI / API。E2E 测试中只使用以下端点。

| 方法 / 路径 | 用途 | 响应 |
|---|---|---|
| `DELETE /api/v1/messages` | 全部删除收件箱（测试前的清理） | 200 |
| `GET /api/v1/messages?limit=N` | 按最新顺序获取已接收邮件列表 | `{ total, messages: [{ ID, Subject, From, To, ... }] }` |
| `GET /api/v1/message/{ID}` | 获取个别邮件的详细信息（Text/HTML 正文、附件等） | 上述加上包含 `Text` / `HTML` / `Attachments` 的完整结构 |
| `GET /api/v1/search?query=...` | 按主题、正文、收件人搜索 | 与列表相同的结构 |

## 从位于代理之下的 devcontainer 访问 mailpit

在公司代理之下的 devcontainer 环境中，往往无法直接到达 mailpit（主机的 `127.0.0.1:8025`）。具有以下特征：

- 如果为 intra-mart 设置了 `PW_PROXY_BYPASS=127.0.0.1,<-loopback>`，则从 Playwright `request` 夹具发出的 mailpit 请求也成为绕过对象，尝试直接连接而失败
- 另一方面，通过公司代理（例如监听在 docker bridge 主机侧 IP 上的代理）通常可以到达 `127.0.0.1:8025`
- 因此 **为 mailpit 创建独立的 APIRequestContext 并明确指定代理** 是可靠的做法

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

要点：
- 使 mailpit 的主机/端口通过 `MAILPIT_BASE_URL` 环境变量可覆盖（吸收环境差异）
- 自动从 `HTTP_PROXY` / `http_proxy` 获取代理；在无代理环境（Windows 原生等）下不指定
- 使用 `request.newContext({ proxy: ... })`，避免受 `playwright.config.ts` 的 `use.proxy.bypass` 影响

## 调用 intra-mart API 的常规做法（CSRF 安全令牌）

当 `IM-LogicDesigner` 的路由或 JSSP REST-API 为 `secured: true` 时，`X-Intramart-Secure-Token` 头是必需的。
在已登录浏览器的状态下打开一次能发行安全令牌的画面，从 `<meta name="im_secure_token">` 中取出值使用。

```typescript
// 1. 登录后打开嵌入了 imSecureToken 的画面
await page.goto('sample/csrf_check');  // 其他路径也可以，只要是嵌入 imSecureToken 的画面即可
const secureToken = await page.locator('meta[name=im_secure_token]').getAttribute('content');
expect(secureToken).toBeTruthy();

// 2. 在浏览器上下文中发出 fetch
//    （session cookie 与通过 Chromium 的代理路径都可以原样使用）
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

为什么在 `page.evaluate` 中调用 `fetch` 而不是 `page.request`：
- 从 Node 侧发出的 `page.request` 会受 `use.proxy.bypass` 的影响，发往 `localhost/127.0.0.1` 的流量变为直接连接而可能失败
- 经过 Chromium 时，包含 `<-loopback>` 在内的代理设置会被正确应用
- 浏览器的 session cookie 可以原样使用，无需额外的认证代码

## 等待接收（轮询）

邮件服务器 → mailpit 的传播有数百毫秒到数秒的延迟。使用轮询而不是固定 sleep。

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
  throw new Error('mailpit 中未到达匹配的邮件');
}
```

在 `predicate` 中传入每个测试中唯一的条件，如主题、收件人、发件人等。
将主题做成混入 `Date.now()` 等的唯一字符串，可避免受测试间干扰或残留邮件的影响。

## 验证正文、发件人、附件

`GET /api/v1/messages` 的每个元素只包含摘要。要取得正文（`Text` / `HTML`）和附件，须调用 **详细 API**。

```typescript
const detailResp = await mailpit.get(`/api/v1/message/${message.ID}`);
const detail = await detailResp.json();

// 主题
expect(detail.Subject).toBe(expectedSubject);

// 发件人
expect(detail.From.Address).toBe('accel@example.org');
// expect(detail.From.Name).toBe('intra-mart');  // 若要验证显示名

// 收件人（数组）
expect(detail.To.map((t: { Address: string }) => t.Address))
  .toEqual(['user@example.org']);

// 文本正文：务必包含并验证 FreeMarker 等替换进去的动态部分
expect(detail.Text).toContain(`您好，${userName}。`);
expect(detail.Text).toContain('IM-LogicDesigner');

// HTML 正文（im_sendHtmlMail 时）
expect(detail.HTML).toContain('<h1>订单确认</h1>');

// 附件
expect(detail.Attachments).toHaveLength(1);
expect(detail.Attachments[0].FileName).toBe('invoice.pdf');
```

**正文验证的诀窍：**
- 不仅验证固定字符串，还要包含测试输入决定的动态部分（用户名、金额、时间等）进行 assert。这样可以证明模板引擎（FreeMarker、Mustache、MessageManager 的消息展开等）实际运行了
- 换行符经过 mailpit 时可能变为 `\r\n`。用 `toContain` 进行部分匹配更安全

## 测试整体骨架

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

test.describe('邮件发送流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('login');
    await page.locator('#im_user').fill('aoyagi');
    await page.locator('#im_password').fill('aoyagi');
    await Promise.all([
      page.waitForURL((url) => !url.pathname.endsWith('/login')),
      page.locator('input[type="submit"]').click()
    ]);
  });

  test('收到与输入匹配的邮件', async ({ page }) => {
    const testSubject = `E2E 邮件发送 ${Date.now()}`;

    // 获取安全令牌
    await page.goto(TOKEN_PAGE_PATH);
    const secureToken = await page.locator('meta[name=im_secure_token]').getAttribute('content');

    const mailpit = await newMailpitContext();
    try {
      // 清理
      const del = await mailpit.delete('/api/v1/messages');
      expect(del.ok()).toBe(true);

      // 发送触发（通过浏览器上下文进行 fetch）
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

      // 等待接收
      const message = await waitForMessage(mailpit, (m) => m.Subject === testSubject);

      // 取得详细信息并 assert
      const detail = await (await mailpit.get(`/api/v1/message/${message.ID}`)).json();
      expect(detail.From.Address).toBe('accel@example.org');
      expect(detail.To[0].Address).toBe('user@example.org');
      expect(detail.Text).toContain('您好，test user');
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
  throw new Error('mailpit 中未到达匹配的邮件');
}
```

## 验证要点总结

| 观点 | 验证内容 |
|---|---|
| 发送触发 | 流程 / API / 画面操作以 HTTP 200 完成 |
| 主题 | 每个测试唯一的字符串完全一致（混入 `Date.now()` 等） |
| 发件人 | 流程侧固定的发件人（例如 `accel@example.org`）已设置到 `From.Address` |
| 收件人 | 输入的 `To` / `Cc` / `Bcc` 已被反映（确认数组大小和顺序） |
| 正文 | 替换到模板中的动态值（用户名、主题、URL 等）包含在正文中 |
| 附件 | 有附件时，验证 `Attachments[].FileName` 和数量 |
| 编码 | 中文在 mailpit UI 中正常显示（测试中用 `toContain` 进行中文匹配即可） |

## 故障排查

| 症状 | 原因 | 对策 |
|---|---|---|
| mailpit 请求以 `connect ECONNREFUSED` 失败 | 处于公司代理之下却尝试直接连接 | 使用 `playwright.request.newContext({ proxy: { server: process.env.HTTP_PROXY } })` 明确指定代理 |
| mailpit 请求返回 503 | 代理无法解析 mailpit 的主机名 | 将 `MAILPIT_BASE_URL` 切换为代理可达的主机（如 docker bridge 主机侧 IP 的 `:8025` 等） |
| API 是 200 但 mailpit 中什么都没到 | intra-mart 的 SMTP 设置未指向 mailpit | 在租户环境的邮件配置（`http://〜/imart/system/system_admin/mail_config/`）中确认 SMTP 主机 |
| API 返回 403 | IM-LogicDesigner 路由的认可（authzUri）未设置 | 在认可管理画面中，向相应角色/用户授予对 `im-logic-rest://<flowId>` 的认可 |
| API 返回 400 / 安全令牌错误 | 从其他页面取出的令牌已过期，或 `X-Intramart-Secure-Token` 头未发送 | 在 API 调用前获取安全令牌。按顺序调用多个 API 时按需重新获取 |
| 接收很快但正文比较失败 | 换行符差异（`\r\n` 对 `\n`） | 用 `toContain` 进行部分匹配。避免用 `toBe` 进行完全比较 |

## 相关

- 生成 IM-LogicDesigner 邮件发送流程时，请参考 `jssp-im-logic-generator` 技能的 `im_sendTextMail` / `im_sendHtmlMail` 任务模板
- 从作业发送邮件参考 `jssp-im-job-generator` 技能；从工作流发送通知邮件参考 `jssp-im-workflow-usage` 技能
- 安全令牌相关的规约参考 `.claude/rules/jssp-security.md`
