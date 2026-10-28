---
name: smartlime-api
description: Calls intra-mart Accel Platform (iAP) REST APIs with smartlime's useIMFetch. Covers automatic path rewriting (/api/workflow → /api/oauth/workflow, other /api → /api/bearer), attaching and refreshing the access token, the iAP response format (error / data), handling result states, aborting (AbortController), sending JSON and form-urlencoded bodies, and how to call the IM-Workflow REST API. Use when the user mentions "call an iAP API", "useIMFetch", "IM-Workflow matter list", "get data from the REST API", or "API error handling". For sign-in use smartlime-auth; for displaying iAP pages use smartlime-webview.
---

# Calling iAP APIs with useIMFetch

## Purpose

Call iAP REST APIs with the signed-in user's access token and reflect the results on screen.
Placing `Smartlime` and implementing sign-in must already be done (`smartlime-setup`, `smartlime-auth`).

## How useIMFetch works

```ts
import { useIMFetch } from '@intra-mart/smartlime';

const imFetch = useIMFetch();
const response = await imFetch<ResponseType>('/api/workflow/...', { method: 'POST' });
```

- It takes the same arguments as `fetch` from `expo/fetch`. It always attaches `Authorization: Bearer <access token>`, and by default attaches `X-Intramart-Session: never` and `credentials: 'omit'`
- **Only relative paths are accepted** (passing `https://...` throws). This prevents sending the token anywhere other than iAP. The leading `/` may be omitted
- Calling it while signed out throws. Use it only in screens after sign-in
- If the API returns 401 (`invalid_token`), it refreshes the token and retries once. If that still fails, it **discards the token, returns to the signed-out state**, and throws (`token has been destroyed.`). The auth gate (`smartlime-auth`) switches to the login screen
- Do not extract the access token yourself and attach it to `fetch`

### Automatic path rewriting

In iAP, the path of an API called with an OAuth token differs by API type. `useIMFetch` rewrites paths starting with `/api/` as follows. **Write the path before rewriting (the path in the iAP API specification).**

| Path passed | Path actually called |
|------|------|
| `/api/workflow/...` | `/api/oauth/workflow/...` |
| `/api/immaster/...` | `/api/oauth/immaster/...` |
| Other `/api/...` | `/api/bearer/...` |
| `/api/bearer/...`, `/api/oauth/workflow/...`, `/api/oauth/immaster/...` | Unchanged |
| `/api/bearer/workflow/...` | **Throws** (IM-Workflow is called via `/api/oauth/`) |
| `/api/oauth/...` other than workflow and immaster | **Throws** |
| Paths not starting with `/api/` | Unchanged |

If you do not want rewriting, use `useIMFetch({ noValidate: true })` (the relative path restriction still applies).

## Common call handling

Many iAP REST APIs return failure in the body even with HTTP 200 (`{ "error": true, "errorMessage": "..." }`). On success it is `{ "error": false, "data": ... }`. Check both the HTTP status and the body.

Place the following helper in `src/lib/iap-request.ts` and use it for each API call.

```ts
import type { useIMFetch } from '@intra-mart/smartlime';

type IMFetch = ReturnType<typeof useIMFetch>;
type RequestInit = Parameters<IMFetch>[1];

/** Result of an iAP REST API */
export type IapResult<T> =
  | { state: 'success'; data: T }
  | { state: 'cancel' }
  | { state: 'unauthorized' } // The token expired and smartlime returned to the signed-out state
  | { state: 'httpError'; status: number }
  | { state: 'serverError'; message?: string } // HTTP 200 but error: true
  | { state: 'parseError' }
  | { state: 'unknown'; error: unknown };

// smartlime IMFecthError messages (the class is not exported) that indicate signed out
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
      // Only a missing or expired token becomes unauthorized. Path rule violations are implementation bugs, so rethrow
      if (UNAUTHORIZED_MESSAGES.includes(e.message)) return { state: 'unauthorized' };
      throw e;
    }
    return { state: 'unknown', error: e };
  }
}

/** Builds an application/x-www-form-urlencoded body */
export function toFormBody(params: Record<string, string | number | boolean>) {
  return new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
}
```

- The error name `IMFecthError` keeps smartlime's spelling (not `Fetch`)
- Guidelines for handling each state on screen: `cancel` does nothing / `unauthorized` does nothing (switches to the login screen) / a 403 `httpError` is shown as insufficient permission / everything else is shown as an error that can be retried
- For APIs not in the `{ error, data }` form (such as paths other than `/api/`), do not use `requestIap`; handle them individually

## Per-API hooks

Create a hook per API (or per few related APIs), and use only the hooks from screens. Abort the request when leaving the screen.

```ts
// src/features/workflow/use-active-matter-tasks.ts
import { useIMFetch } from '@intra-mart/smartlime';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IapResult, requestIap } from '@/lib/iap-request';

interface MatterTask {
  systemMatterId: string;
  matterName: string;
  // Add the fields you need from the API specification
}

export function useActiveMatterTasks() {
  const imFetch = useIMFetch();
  const controllerRef = useRef<AbortController | null>(null);
  const [result, setResult] = useState<IapResult<{ records: MatterTask[] }> | null>(null);

  const load = useCallback(
    async (body: object) => {
      controllerRef.current?.abort(); // Abort the previous request if it is still pending
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

- **Check the request and response fields in the iAP API specification (such as the IM-Workflow REST API specification)**. Do not guess field names. If unknown, ask the user for the relevant part of the API specification
- For APIs that take form-urlencoded bodies, use `headers: { 'Content-Type': 'application/x-www-form-urlencoded' }` and `body: toFormBody({ ... })`
- If you need list re-fetching, caching, or infinite scrolling, you may use `requestIap` inside the fetch function of a data fetching library (see the official Expo skill `expo-data-fetching`). Even then, call `useIMFetch()` inside a component (hook)

## Scopes

To call an API, the scope the API belongs to must be included in both the OAuth client and the app's `scopes` (`smartlime-setup`). Missing scopes result in 401 or 403.

| Scope (example) | Target |
|------|------|
| `im-workflow-rest` | IM-Workflow REST API (`/api/workflow/...`) |
| `immaster` | IM-Common Master API (`/api/immaster/...`) |
| `smacolow` | APIs used by smartlime itself (user information, search, calendar, etc.) |

When using a new type of API, confirm the required scope with the user.

## Verification

- `npx tsc --noEmit` must pass
- Against a real iAP, check three cases: success, no permission (403), and aborting the request (leaving the screen quickly)
- In tests, mock `useIMFetch` (`smartlime-testing`)
