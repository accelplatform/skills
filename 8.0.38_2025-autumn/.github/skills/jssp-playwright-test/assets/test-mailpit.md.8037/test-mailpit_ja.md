# mailpit を用いたメール送信機能の E2E テスト

## 概要

intra-mart からの送信メールを mailpit で受信し、Playwright テストから mailpit の HTTP API を叩いて検証するパターン集。
ジョブ通知、ワークフロー差戻し通知、IM-LogicDesigner の `im_sendTextMail` / `im_sendHtmlMail` タスクなど、メール送信を伴う機能の自動検証に使用する。

## 適用タイミング

ユーザが以下を依頼した場合：

- 「メール送信を E2E テストで確認したい」
- 「mailpit に届いたメールを Playwright で検証したい」
- 「IM-LogicDesigner のメール送信フローをテストしたい」

## mailpit HTTP API（このスキルで使う最小セット）

mailpit はデフォルトで `8025` ポートで HTTP UI / API を提供する。E2E テストで使うのは以下のエンドポイントだけ。

| メソッド / パス | 用途 | レスポンス |
|---|---|---|
| `DELETE /api/v1/messages` | 受信箱を全削除（テスト前のクリーンアップ） | 200 |
| `GET /api/v1/messages?limit=N` | 受信メール一覧を新着順で取得 | `{ total, messages: [{ ID, Subject, From, To, ... }] }` |
| `GET /api/v1/message/{ID}` | 個別メールの詳細（Text/HTML 本文、添付など）を取得 | 上記に `Text` / `HTML` / `Attachments` を含む完全な構造 |
| `GET /api/v1/search?query=...` | 件名・本文・宛先を検索 | 一覧と同じ構造 |

## proxy 配下の devcontainer から mailpit へ届かせるには

corporate proxy 配下の devcontainer 環境では、mailpit (host の `localhost:8025`) に直接届かないことが多い。以下の特徴がある。

- intra-mart 用に `PW_PROXY_BYPASS=127.0.0.1,<-loopback>` を設定していると、Playwright の `request` フィクスチャからの mailpit リクエストはバイパス対象になり直接接続を試みて失敗する
- 一方、corporate proxy（例: docker bridge の host 側 IP に立つプロキシ）経由なら `localhost:8025` まで届くケースが多い
- このため **mailpit 用には独立した APIRequestContext を作り、proxy を明示する** のが確実

```typescript
import { request as playwrightRequest, type APIRequestContext } from '@playwright/test';

const MAILPIT_BASE_URL = process.env.MAILPIT_BASE_URL || 'http://localhost:8025';
const PROXY_SERVER = process.env.HTTP_PROXY || process.env.http_proxy;

async function newMailpitContext(): Promise<APIRequestContext> {
  return playwrightRequest.newContext({
    baseURL: MAILPIT_BASE_URL,
    ...(PROXY_SERVER ? { proxy: { server: PROXY_SERVER } } : {})
  });
}
```

ポイント：
- mailpit のホスト/ポートは `MAILPIT_BASE_URL` 環境変数で上書き可能にしておく（環境差を吸収）
- proxy は `HTTP_PROXY` / `http_proxy` から自動取得し、proxy 無し環境（Windows ネイティブ等）では指定しない
- `playwright.config.ts` の `use.proxy.bypass` の影響を受けないため、`request.newContext({ proxy: ... })` を使う

## intra-mart の API を叩くときの定石（CSRF セキュアトークン）

`IM-LogicDesigner` のルーティングや JSSP の REST-API で `secured: true` の場合、`X-Intramart-Secure-Token` ヘッダが必須。
ブラウザにログインした状態でセキュアトークンを発行できる画面を1度開き、`<meta name="im_secure_token">` から値を取り出して使う。

```typescript
// 1. ログイン後、imSecureToken を埋め込んだ画面を開く
await page.goto('sample/csrf_check');  // 別パスでも、imSecureToken 埋め込み画面なら何でもよい
const secureToken = await page.locator('meta[name=im_secure_token]').getAttribute('content');
expect(secureToken).toBeTruthy();

// 2. ブラウザコンテキスト内で fetch を発行する
//    （session cookie と Chromium 経由の proxy 経路の両方をそのまま使える）
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

なぜ `page.request` ではなく `page.evaluate` の中で `fetch` を呼ぶか：
- Node 側で発行する `page.request` は `use.proxy.bypass` の影響を受け、`localhost/127.0.0.1` 宛が直接接続になって失敗するケースがある
- Chromium 経由なら `<-loopback>` も含めた proxy 設定がきちんと適用される
- ブラウザの session cookie もそのまま使えるので追加の認証コードがいらない

## 受信を待つヘルパー（ポーリング）

メールサーバ → mailpit の伝搬には数百ミリ秒〜数秒のラグがある。固定 sleep ではなくポーリングする。

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
  throw new Error('mailpit に該当メールが届きませんでした');
}
```

`predicate` には件名・宛先・差出人など、テストごとにユニークになる条件を渡す。
件名はテストごとに `Date.now()` 等を混ぜたユニーク文字列にしておくと、テスト間の干渉や残存メールに影響されない。

## メール本文・差出人・添付の検証

`GET /api/v1/messages` の各要素は概要のみ。本文（`Text` / `HTML`）や添付は **詳細 API** を叩いて取得する。

```typescript
const detailResp = await mailpit.get(`/api/v1/message/${message.ID}`);
const detail = await detailResp.json();

// 件名
expect(detail.Subject).toBe(expectedSubject);

// 差出人
expect(detail.From.Address).toBe('accel@example.org');
// expect(detail.From.Name).toBe('intra-mart');  // 表示名を検証したい場合

// 宛先（配列）
expect(detail.To.map((t: { Address: string }) => t.Address))
  .toEqual(['user@example.org']);

// テキスト本文：FreeMarker 等で差し込んだ動的部分を必ず含めて検証する
expect(detail.Text).toContain(`${userName} 様`);
expect(detail.Text).toContain('IM-LogicDesigner');

// HTML 本文（im_sendHtmlMail のとき）
expect(detail.HTML).toContain('<h1>注文確認</h1>');

// 添付ファイル
expect(detail.Attachments).toHaveLength(1);
expect(detail.Attachments[0].FileName).toBe('invoice.pdf');
```

**本文検証のコツ：**
- 固定文字列だけでなく、テストの入力で動的に決まる部分（ユーザ名・金額・日時など）を必ず含めて assert する。これでテンプレートエンジン（FreeMarker・Mustache・MessageManager のメッセージ展開等）が実際に動いた証明になる
- 改行コードは mailpit 経由で `\r\n` になることがある。`toContain` での部分一致が安全

## テスト全体の骨格

```typescript
import {
  test,
  expect,
  request as playwrightRequest,
  type APIRequestContext
} from '@playwright/test';

const MAILPIT_BASE_URL = process.env.MAILPIT_BASE_URL || 'http://localhost:8025';
const PROXY_SERVER = process.env.HTTP_PROXY || process.env.http_proxy;
const TOKEN_PAGE_PATH = process.env.IMART_TOKEN_PAGE || 'sample/csrf_check';

async function newMailpitContext(): Promise<APIRequestContext> {
  return playwrightRequest.newContext({
    baseURL: MAILPIT_BASE_URL,
    ...(PROXY_SERVER ? { proxy: { server: PROXY_SERVER } } : {})
  });
}

test.describe('メール送信フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('login');
    await page.locator('#im_user').fill('aoyagi');
    await page.locator('#im_password').fill('aoyagi');
    await Promise.all([
      page.waitForURL((url) => !url.pathname.endsWith('/login')),
      page.locator('input[type="submit"]').click()
    ]);
  });

  test('入力どおりのメールが届く', async ({ page }) => {
    const testSubject = `E2E メール送信 ${Date.now()}`;

    // セキュアトークン取得
    await page.goto(TOKEN_PAGE_PATH);
    const secureToken = await page.locator('meta[name=im_secure_token]').getAttribute('content');

    const mailpit = await newMailpitContext();
    try {
      // クリーンアップ
      const del = await mailpit.delete('/api/v1/messages');
      expect(del.ok()).toBe(true);

      // 送信トリガ（ブラウザコンテキスト経由で fetch）
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

      // 受信を待つ
      const message = await waitForMessage(mailpit, (m) => m.Subject === testSubject);

      // 詳細取得 & assert
      const detail = await (await mailpit.get(`/api/v1/message/${message.ID}`)).json();
      expect(detail.From.Address).toBe('accel@example.org');
      expect(detail.To[0].Address).toBe('user@example.org');
      expect(detail.Text).toContain('test user 様');
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
  throw new Error('mailpit に該当メールが届きませんでした');
}
```

## チェックポイントまとめ

| 観点 | 検証内容 |
|---|---|
| 送信トリガ | フロー / API / 画面操作が HTTP 200 で完了すること |
| 件名 | テストごとにユニークな文字列が完全一致すること（`Date.now()` 等を混ぜる） |
| 差出人 | フロー側で固定した送信元（例: `accel@example.org`）が `From.Address` に設定されていること |
| 宛先 | 入力どおりの `To` / `Cc` / `Bcc` が反映されていること（配列のサイズと順序を確認） |
| 本文 | テンプレートに差し込んだ動的値（ユーザ名・件名・URL 等）が本文に含まれること |
| 添付 | 添付ありの場合、`Attachments[].FileName` と件数を検証 |
| 文字化け対策 | mailpit UI で日本語が正常に見えること（テストでは `toContain` の日本語マッチで十分） |

## トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| mailpit リクエストが connect ECONNREFUSED で失敗 | corporate proxy 配下なのに direct 接続を試みている | `playwright.request.newContext({ proxy: { server: process.env.HTTP_PROXY } })` で proxy を明示 |
| mailpit リクエストが 503 を返す | proxy 側で mailpit のホスト名が解決できない | `MAILPIT_BASE_URL` を proxy から到達可能なホスト（docker bridge の host 側 IP の `:8025` 等）に切り替える |
| API は 200 だが mailpit に何も届かない | intra-mart の SMTP 設定が mailpit を指していない | テナント環境のメール設定（`http://〜/imart/system/system_admin/mail_config/`）で SMTP ホストを確認 |
| API が 403 を返す | IM-LogicDesigner ルーティングの認可（authzUri）が未設定 | 認可管理画面で `im-logic-rest://<flowId>` に対する認可を該当ロール/ユーザに付与 |
| API が 400 / セキュアトークンエラー | 別ページから取り直したトークンが期限切れ、または `X-Intramart-Secure-Token` ヘッダ未送信 | セキュアトークンは API 呼び出しの直前に取得する。複数 API を順番に叩く場合は必要に応じて再取得 |
| 受信は早いが本文比較が落ちる | 改行コードの違い（`\r\n` vs `\n`） | `toContain` で部分一致を取る。`toBe` での完全比較は避ける |

## 関連

- IM-LogicDesigner のメール送信フローを生成する場合は `jssp-im-logic-generator` スキルの `im_sendTextMail` / `im_sendHtmlMail` タスクテンプレートを参照
- ジョブからのメール送信は `jssp-im-job-generator` スキル、ワークフローからの通知メールは `jssp-im-workflow-usage` スキル参照
- セキュアトークン関連の規約は `{{AGENT_RULES}}/jssp-security{{AGENT_RULE_FILE}}.md` 参照
