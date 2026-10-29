---
name: smartlime-testing
description: smartlime / smartlime-ui を使うコードのテストを Jest（jest-expo）と React Native Testing Library で書く。Jest の導入と設定（transformIgnorePatterns・AsyncStorage のモック・TypeScript の types）、smartlime のフック（useIMFetch・useStartAuth・useIMModules など）のモックの仕方、API を呼ぶフックと画面のテストの書き方を扱う。「テストを書く」「Jest」「useIMFetch をモック」「smartlime のテスト」と言及されたとき、または smartlime を使うコードを書いた後にテストを追加するときに使用。
---

# smartlime を使うコードのテスト

## 目的

smartlime のフックをモックに置き換え、iAP に接続せずにアプリのロジックと画面をテストする。

## 導入

```bash
npx expo install --dev jest-expo jest @types/jest @testing-library/react-native @react-native/jest-preset@~0.85.0 test-renderer@^1.0.0
```

- `--dev` は `expo install` 自身のオプションなので、パッケージ名の前に書く。`-- --dev` と書くとパッケージマネージャーにそのまま渡され、npm では dependencies に入り、pnpm 11 ではエラーになる
- `@react-native/jest-preset`（jest-expo が使う）と `test-renderer`（React Native Testing Library が使う）は peer 依存である。yarn 1 は peer 依存を自動では入れないため、明示して加える。`@react-native/jest-preset` は react-native と同じ 0.85 系にすること（`expo install` はこのパッケージの版を選ばずに最新を入れ、テストが起動しなくなる）

`package.json` に次を加える。

```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFiles": ["./jest.setup.ts"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@intra-mart/.*)"
    ]
  }
}
```

- `@intra-mart/.*` を必ず含める。smartlime は TypeScript のソースのまま配布されているため、変換の対象から外すと構文エラーになる

`jest.setup.ts`:

```ts
// smartlime が使う AsyncStorage はネイティブモジュールのため、Jest では公式のモックに置き換える
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
```

`tsconfig.json` の `compilerOptions` に `"types": ["jest"]` を加える（TypeScript 6 では `@types/jest` が自動では読み込まれず、テストファイルの `jest` が型エラーになる）。

## モックの方針

- **テストファイルごとに、`@intra-mart/smartlime` と `@intra-mart/smartlime-ui` をファクトリ付きの `jest.mock` で置き換える**。テストで使うフック・部品だけを定義する
- smartlime を実体のまま読み込むと、AsyncStorage・WebView・SecureStore などのネイティブモジュールのモックが多数必要になる。実体を読み込まないこと
- smartlime-ui の部品（`DefaultSearchUI`・`IMCalendar` など）は `() => null` や簡単な部品に置き換える
- 型の付いたモックは `jest.mocked(useIMFetch).mockReturnValue(...)` のように書く

## API を呼ぶフックのテスト

`useIMFetch` が返す関数をモックし、`ok` / `status` / `json()` を持つオブジェクトを返す。

```ts
import { useIMFetch } from '@intra-mart/smartlime';
import { act, renderHook } from '@testing-library/react-native';

import { useActiveMatterTasks } from '../use-active-matter-tasks';

jest.mock('@intra-mart/smartlime', () => ({ useIMFetch: jest.fn() }));

const mockImFetch = (body: unknown, status = 200) => {
  const imFetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  jest.mocked(useIMFetch).mockReturnValue(imFetch);
  return imFetch;
};

it('案件の一覧を取得する', async () => {
  const imFetch = mockImFetch({ error: false, data: { records: [{ systemMatterId: 'm1', matterName: '申請' }] } });
  const { result } = await renderHook(() => useActiveMatterTasks());

  await act(async () => {
    await result.current.load({});
  });

  expect(imFetch).toHaveBeenCalledWith(
    '/api/workflow/active-matter-tasks',
    expect.objectContaining({ method: 'POST' }),
  );
  expect(result.current.result).toEqual({
    state: 'success',
    data: { records: [{ systemMatterId: 'm1', matterName: '申請' }] },
  });
});
```

- **React Native Testing Library 14 では `render` と `renderHook` が Promise を返す**。`await` を付けること（付けないと `result` が `undefined` になり、「overlapping act() calls」の警告が出る）。`fireEvent` も `await` する
- iAP の応答の形（`{ error, data }`）に合わせたテストを用意する: 成功 / HTTP 200 で `error: true` / 403 / 通信の中断
- トークンの失効は、`imFetch` が `name` が `IMFecthError`、`message` が `token has been destroyed.` のエラーで reject する形で再現する

```ts
const error = Object.assign(new Error('token has been destroyed.'), { name: 'IMFecthError' });
const imFetch = jest.fn().mockRejectedValue(error);
```

## 画面のテスト

```tsx
import { useStartAuth } from '@intra-mart/smartlime';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import SignInScreen from '../sign-in';

jest.mock('@intra-mart/smartlime', () => ({ useStartAuth: jest.fn() }));

it('認可が失敗したら案内を出す', async () => {
  const startAuth = jest.fn().mockResolvedValue({ type: 'exception', exceptionDetail: new Error('x') });
  jest.mocked(useStartAuth).mockReturnValue(startAuth);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  await render(<SignInScreen />);
  await fireEvent.press(screen.getByText('iAP にログイン'));

  expect(startAuth).toHaveBeenCalled();
  expect(alert).toHaveBeenCalledWith('ログインできませんでした', expect.any(String));
});
```

導入済みモジュールで表示を切り替える画面の例（`smartlime-assistant` の画面）:

```tsx
import { useIMModules, useIMModulesState } from '@intra-mart/smartlime';
import { render, screen } from '@testing-library/react-native';

import AssistantScreen from '../(app)/assistant';

jest.mock('@intra-mart/smartlime', () => ({
  useIMModules: jest.fn(),
  useIMModulesState: jest.fn(),
  useAssistant: jest.fn(),
}));

it('IM-Copilot が無ければ利用できない旨を表示する', async () => {
  jest.mocked(useIMModules).mockReturnValue({ request: jest.fn().mockResolvedValue(undefined) } as never);
  jest.mocked(useIMModulesState).mockReturnValue({} as never);

  await render(<AssistantScreen />);

  expect(screen.getByText('この iAP ではアシスタントを利用できません。')).toBeTruthy();
});
```

よく使うモックの戻り値:

| フック | 戻り値の例 |
|------|------|
| `useAuthState` | `'authorized'` / `'unauthorized'` / `'initializing'` |
| `useStartAuth` | `jest.fn().mockResolvedValue({ type: 'success' })` |
| `useIMOAuth` | `{ destroy: jest.fn(), getToken: jest.fn(), getTokenAsync: jest.fn(), refresh: jest.fn() }` |
| `useMe` | `{ request: jest.fn().mockResolvedValue({ status: 'success' }), getMe: jest.fn(), update: jest.fn() }` |
| `useMeState` | テストに必要な項目だけを持つユーザー情報（`as never` で型を合わせる） |
| `useIMModulesState` | `{ 'jp.co.intra_mart.im_copilot': { moduleId: 'jp.co.intra_mart.im_copilot', version: '', enabled: true, others: {} } }` |
| `useIMBaseUrl` | `'https://iap.example.com/imart'` |
| `useIMSearch` | `{ startSearch: jest.fn().mockResolvedValue({ type: 'cancel' }) }` |
| `useAssistant` | `{ run: jest.fn(async (_request, callback) => { callback({ contents: '応答', ... }, true); return { type: 'success' }; }), getThreadHistory: jest.fn().mockResolvedValue({ type: 'success', history: [] }) }`（詳細は `smartlime-assistant`） |

## 実行

```bash
npx jest
npx tsc --noEmit
```

テストを追加・変更した作業では、完了を報告する前に両方を実行すること。
