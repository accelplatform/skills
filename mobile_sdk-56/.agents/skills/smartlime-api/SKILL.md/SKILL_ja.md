---
name: smartlime-api
description: smartlime の useIMFetch で intra-mart Accel Platform（iAP）の REST API を呼び出す。パスの自動書き換え（/api/workflow → /api/oauth/workflow、その他の /api → /api/bearer）、アクセストークンの付与と更新、iAP の応答形式（error / data）、結果の状態の扱い、中断（AbortController）、JSON と form-urlencoded の送信、IM-Workflow の REST API の呼び方を扱う。「iAP の API を呼ぶ」「useIMFetch」「IM-Workflow の案件一覧」「REST API からデータを取得」「API のエラー処理」と言及されたときに使用。ログイン処理は smartlime-auth、iAP の画面の表示は smartlime-webview を使うこと。
---

# useIMFetch で iAP の API を呼び出す

## 目的

ログイン済みのユーザーのアクセストークンで iAP の REST API を呼び出し、結果を画面に反映する。
`Smartlime` の配置とログインの実装が済んでいること（`smartlime-setup`・`smartlime-auth`）。

## useIMFetch の動作

```ts
import { useIMFetch } from '@intra-mart/smartlime';

const imFetch = useIMFetch();
const response = await imFetch<ResponseType>('/api/workflow/...', { method: 'POST' });
```

- `expo/fetch` の `fetch` と同じ引数で使える。`Authorization: Bearer <アクセストークン>` を必ず付け、既定で `X-Intramart-Session: never` と `credentials: 'omit'` を付ける
- **相対パスしか渡せない**（`https://...` を渡すと例外）。トークンを iAP 以外へ送らないためである。先頭の `/` は省略してもよい
- 未ログインのときに呼ぶと例外になる。ログイン後の画面でだけ使うこと
- API が 401（`invalid_token`）を返したら、トークンを更新して 1 回だけ再送する。それでも失敗した場合は**トークンを破棄して未ログインの状態に戻し**、例外（`token has been destroyed.`）を投げる。認証ゲート（`smartlime-auth`）がログイン画面へ切り替える
- アクセストークンを自分で取り出して `fetch` に付けないこと

### パスの自動書き換え

iAP は、OAuth のトークンで呼ぶ API のパスが API の種類で異なる。`useIMFetch` は `/api/` で始まるパスを次のように書き換える。**書き換え前のパス（iAP の API 仕様書のパス）で書くこと。**

| 渡したパス | 実際に呼ぶパス |
|------|------|
| `/api/workflow/...` | `/api/oauth/workflow/...` |
| `/api/immaster/...` | `/api/oauth/immaster/...` |
| 上記以外の `/api/...` | `/api/bearer/...` |
| `/api/bearer/...`・`/api/oauth/workflow/...`・`/api/oauth/immaster/...` | そのまま |
| `/api/bearer/workflow/...` | **例外**（IM-Workflow は `/api/oauth/` で呼ぶ） |
| workflow・immaster 以外の `/api/oauth/...` | **例外** |
| `/api/` で始まらないパス | そのまま |

書き換えたくない場合は `useIMFetch({ noValidate: true })` を使う（相対パスの制限は残る）。

## 呼び出しの共通処理

iAP の REST API の多くは、HTTP 200 でも本文で失敗を返す（`{ "error": true, "errorMessage": "..." }`）。成功時は `{ "error": false, "data": ... }`。HTTP の状態と本文の両方を確認すること。

次の補助関数を `src/lib/iap-request.ts` に置き、各 API の呼び出しで使う。

```ts
import type { useIMFetch } from '@intra-mart/smartlime';

type IMFetch = ReturnType<typeof useIMFetch>;
type RequestInit = Parameters<IMFetch>[1];

/** iAP の REST API の結果 */
export type IapResult<T> =
  | { state: 'success'; data: T }
  | { state: 'cancel' }
  | { state: 'unauthorized' } // トークンが失効し、smartlime が未ログインの状態に戻した
  | { state: 'httpError'; status: number }
  | { state: 'serverError'; message?: string } // HTTP 200 だが error: true
  | { state: 'parseError' }
  | { state: 'unknown'; error: unknown };

// smartlime の IMFecthError（クラスは公開されていない）のうち、未ログインを表すもの
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
      // トークンが無い・失効した場合だけ unauthorized にする。パスの規則違反は実装の誤りなので投げ直す
      if (UNAUTHORIZED_MESSAGES.includes(e.message)) return { state: 'unauthorized' };
      throw e;
    }
    return { state: 'unknown', error: e };
  }
}

/** application/x-www-form-urlencoded の本文を作る */
export function toFormBody(params: Record<string, string | number | boolean>) {
  return new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
}
```

- エラー名 `IMFecthError` は smartlime の綴りのまま（`Fetch` ではない）
- 状態ごとの画面の扱いの目安: `cancel` は何もしない / `unauthorized` は何もしない（ログイン画面へ切り替わる） / `httpError` の 403 は権限不足として案内する / それ以外は再試行できるエラー表示にする
- `{ error, data }` の形でない API（`/api/` 以外のパスなど）は、`requestIap` を使わず個別に処理する

## API ごとのフック

1 つの API（または関連する数個の API）ごとにフックを作り、画面からはフックだけを使う。画面を離れたら通信を中断する。

```ts
// src/features/workflow/use-active-matter-tasks.ts
import { useIMFetch } from '@intra-mart/smartlime';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IapResult, requestIap } from '@/lib/iap-request';

interface MatterTask {
  systemMatterId: string;
  matterName: string;
  // 必要な項目を API 仕様書から追加する
}

export function useActiveMatterTasks() {
  const imFetch = useIMFetch();
  const controllerRef = useRef<AbortController | null>(null);
  const [result, setResult] = useState<IapResult<{ records: MatterTask[] }> | null>(null);

  const load = useCallback(
    async (body: object) => {
      controllerRef.current?.abort(); // 前の要求が残っていれば中断する
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

- **リクエストとレスポンスの項目は、iAP の API 仕様書（IM-Workflow の REST API 仕様など）で確認すること**。推測で項目名を書かないこと。分からなければユーザーに API 仕様書の該当箇所を求める
- form-urlencoded で送る API は `headers: { 'Content-Type': 'application/x-www-form-urlencoded' }`、`body: toFormBody({ ... })` とする
- 一覧の再取得・キャッシュ・無限スクロールが必要なら、データ取得のライブラリ（Expo 公式スキル `expo-data-fetching` を参照）の取得関数の中で `requestIap` を使ってよい。その場合も `useIMFetch()` はコンポーネント（フック）の中で呼ぶ

## スコープ

API を呼ぶには、その API が属するスコープを OAuth クライアントとアプリの `scopes` の両方に含める必要がある（`smartlime-setup`）。スコープが足りないと 401 や 403 になる。

| スコープ（例） | 対象 |
|------|------|
| `im-workflow-rest` | IM-Workflow の REST API（`/api/workflow/...`） |
| `immaster` | IM-共通マスタの API（`/api/immaster/...`） |
| `smacolow` | smartlime 自身が使う API（ユーザー情報・検索・カレンダー等） |

新しい種類の API を使う場合、必要なスコープはユーザーに確認すること。

## 確認

- `npx tsc --noEmit` が通ること
- 実際の iAP に対して、成功・権限なし（403）・通信の中断（画面を素早く離れる）の 3 つを確認する
- テストでは `useIMFetch` をモックする（`smartlime-testing`）
