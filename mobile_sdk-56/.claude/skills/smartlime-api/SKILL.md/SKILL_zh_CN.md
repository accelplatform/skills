---
name: smartlime-api
description: 使用 smartlime 的 useIMFetch 调用 intra-mart Accel Platform（iAP）的 REST API。涵盖路径的自动改写（/api/workflow → /api/oauth/workflow，其他 /api → /api/bearer）、访问令牌的附加与更新、iAP 的响应格式（error / data）、结果状态的处理、中断（AbortController）、JSON 与 form-urlencoded 的发送，以及 IM-Workflow REST API 的调用方法。当提及「调用 iAP 的 API」「useIMFetch」「IM-Workflow 的案件一览」「从 REST API 获取数据」「API 的错误处理」时使用。登录处理请使用 smartlime-auth，显示 iAP 的页面请使用 smartlime-webview。
---

# 使用 useIMFetch 调用 iAP 的 API

## 目的

使用已登录用户的访问令牌调用 iAP 的 REST API，并将结果反映到画面上。
前提是已完成 `Smartlime` 的放置和登录的实现（`smartlime-setup`・`smartlime-auth`）。

## useIMFetch 的行为

```ts
import { useIMFetch } from '@intra-mart/smartlime';

const imFetch = useIMFetch();
const response = await imFetch<ResponseType>('/api/workflow/...', { method: 'POST' });
```

- 可以使用与 `expo/fetch` 的 `fetch` 相同的参数。必定附加 `Authorization: Bearer <访问令牌>`，并默认附加 `X-Intramart-Session: never` 和 `credentials: 'omit'`
- **只能传入相对路径**（传入 `https://...` 会抛出异常）。这是为了不将令牌发送到 iAP 以外的地方。开头的 `/` 可以省略
- 在未登录时调用会抛出异常。只能在登录后的画面中使用
- API 返回 401（`invalid_token`）时，会更新令牌并仅重发 1 次。如果仍然失败，则**销毁令牌并回到未登录状态**，并抛出异常（`token has been destroyed.`）。认证门控（`smartlime-auth`）会切换到登录画面
- 不得自行取出访问令牌并附加到 `fetch` 上

### 路径的自动改写

在 iAP 中，使用 OAuth 令牌调用的 API 路径因 API 种类而异。`useIMFetch` 会按如下方式改写以 `/api/` 开头的路径。**必须按改写前的路径（iAP API 规格书中的路径）编写。**

| 传入的路径 | 实际调用的路径 |
|------|------|
| `/api/workflow/...` | `/api/oauth/workflow/...` |
| `/api/immaster/...` | `/api/oauth/immaster/...` |
| 上述以外的 `/api/...` | `/api/bearer/...` |
| `/api/bearer/...`・`/api/oauth/workflow/...`・`/api/oauth/immaster/...` | 保持不变 |
| `/api/bearer/workflow/...` | **异常**（IM-Workflow 通过 `/api/oauth/` 调用） |
| workflow・immaster 以外的 `/api/oauth/...` | **异常** |
| 不以 `/api/` 开头的路径 | 保持不变 |

如果不希望改写，请使用 `useIMFetch({ noValidate: true })`（相对路径的限制仍然保留）。

## 调用的通用处理

iAP 的许多 REST API 即使返回 HTTP 200，也会在正文中返回失败（`{ "error": true, "errorMessage": "..." }`）。成功时为 `{ "error": false, "data": ... }`。必须同时确认 HTTP 状态和正文。

将以下辅助函数放在 `src/lib/iap-request.ts` 中，并在各 API 的调用中使用。

```ts
import type { useIMFetch } from '@intra-mart/smartlime';

type IMFetch = ReturnType<typeof useIMFetch>;
type RequestInit = Parameters<IMFetch>[1];

/** iAP REST API 的结果 */
export type IapResult<T> =
  | { state: 'success'; data: T }
  | { state: 'cancel' }
  | { state: 'unauthorized' } // 令牌已失效，smartlime 已回到未登录状态
  | { state: 'httpError'; status: number }
  | { state: 'serverError'; message?: string } // HTTP 200 但 error: true
  | { state: 'parseError' }
  | { state: 'unknown'; error: unknown };

// smartlime 的 IMFecthError（类未公开）中表示未登录的消息
const UNAUTHORIZED_MESSAGES = ['not yet authorized', 'token has been destroyed.'];

interface IapEnvelope<T> {
  error?: boolean;
  errorMessage?: string;
  data?: T;
}

export async function requestIap<T>(
  imFetch: IMFetch,
  path: string,
  init?: RequestInit,
): Promise<IapResult<T>> {
  try {
    const response = await imFetch<IapEnvelope<T>>(path, init);
    if (!response.ok) return { state: 'httpError', status: response.status };

    let json: IapEnvelope<T>;
    try {
      json = (await response.json()) as IapEnvelope<T>;
    } catch {
      return { state: 'parseError' };
    }
    if (json.error) return { state: 'serverError', message: json.errorMessage };
    return { state: 'success', data: json.data as T };
  } catch (e) {
    if (init?.signal?.aborted || (e instanceof Error && e.name === 'AbortError')) {
      return { state: 'cancel' };
    }
    if (e instanceof Error && e.name === 'IMFecthError') {
      // 仅在没有令牌或令牌已失效时视为 unauthorized。违反路径规则属于实现错误，因此重新抛出
      if (UNAUTHORIZED_MESSAGES.includes(e.message)) return { state: 'unauthorized' };
      throw e;
    }
    return { state: 'unknown', error: e };
  }
}

/** 生成 application/x-www-form-urlencoded 的正文 */
export function toFormBody(params: Record<string, string | number | boolean>) {
  return new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
}
```

- 错误名 `IMFecthError` 保持 smartlime 的拼写（不是 `Fetch`）
- 各状态在画面上的处理参考：`cancel` 不做任何处理 / `unauthorized` 不做任何处理（会切换到登录画面） / `httpError` 的 403 作为权限不足进行提示 / 其他情况显示可重试的错误
- 对于不是 `{ error, data }` 格式的 API（`/api/` 以外的路径等），不使用 `requestIap` 而单独处理

## 各 API 的钩子

为每个 API（或相关的几个 API）创建一个钩子，画面中只使用钩子。离开画面时中断通信。

```ts
// src/features/workflow/use-active-matter-tasks.ts
import { useIMFetch } from '@intra-mart/smartlime';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IapResult, requestIap } from '@/lib/iap-request';

interface MatterTask {
  systemMatterId: string;
  matterName: string;
  // 根据 API 规格书添加所需的项目
}

export function useActiveMatterTasks() {
  const imFetch = useIMFetch();
  const controllerRef = useRef<AbortController | null>(null);
  const [result, setResult] = useState<IapResult<{ records: MatterTask[] }> | null>(null);

  const load = useCallback(
    async (body: object) => {
      controllerRef.current?.abort(); // 如果之前的请求仍在进行则中断
      const controller = new AbortController();
      controllerRef.current = controller;
      const next = await requestIap<{ records: MatterTask[] }>(
        imFetch,
        '/api/workflow/active-matter-tasks',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );
      if (next.state !== 'cancel') setResult(next);
      return next;
    },
    [imFetch],
  );

  useEffect(() => () => controllerRef.current?.abort(), []);

  return { result, load };
}
```

- **请求和响应的项目必须通过 iAP 的 API 规格书（IM-Workflow 的 REST API 规格等）确认**。不得凭推测编写项目名。如果不清楚，请向用户索取 API 规格书的相应部分
- 以 form-urlencoded 发送的 API，使用 `headers: { 'Content-Type': 'application/x-www-form-urlencoded' }`、`body: toFormBody({ ... })`
- 如果需要列表的重新获取・缓存・无限滚动，可以在数据获取库（参见 Expo 官方技能 `expo-data-fetching`）的获取函数中使用 `requestIap`。此时也应在组件（钩子）中调用 `useIMFetch()`

## 范围

要调用 API，需要在 OAuth 客户端和应用的 `scopes` 两者中都包含该 API 所属的范围（`smartlime-setup`）。范围不足时会返回 401 或 403。

| 范围（示例） | 对象 |
|------|------|
| `im-workflow-rest` | IM-Workflow 的 REST API（`/api/workflow/...`） |
| `immaster` | IM-共通主数据的 API（`/api/immaster/...`） |
| `smacolow` | smartlime 自身使用的 API（用户信息・检索・日历等） |

使用新类型的 API 时，必须向用户确认所需的范围。

## 确认

- `npx tsc --noEmit` 必须通过
- 针对实际的 iAP，确认成功・无权限（403）・通信中断（快速离开画面）这 3 种情况
- 测试中对 `useIMFetch` 进行 mock（`smartlime-testing`）
