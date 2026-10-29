---
name: smartlime-testing
description: Writes tests for code that uses smartlime / smartlime-ui with Jest (jest-expo) and React Native Testing Library. Covers installing and configuring Jest (transformIgnorePatterns, the AsyncStorage mock, TypeScript types), how to mock smartlime hooks (useIMFetch, useStartAuth, useIMModules, etc.), and how to write tests for API-calling hooks and screens. Use when the user mentions "write tests", "Jest", "mock useIMFetch", or "smartlime tests", or when adding tests after writing code that uses smartlime.
---

# Testing code that uses smartlime

## Purpose

Replace smartlime hooks with mocks and test the app's logic and screens without connecting to iAP.

## Installation

```bash
npx expo install --dev jest-expo jest @types/jest @testing-library/react-native @react-native/jest-preset@~0.85.0 test-renderer@^1.0.0
```

- `--dev` is an option of `expo install` itself, so write it before the package names. If you write `-- --dev`, it is passed to the package manager as is: npm adds the packages to dependencies, and pnpm 11 fails with an error
- `@react-native/jest-preset` (used by jest-expo) and `test-renderer` (used by React Native Testing Library) are peer dependencies. yarn 1 does not install peer dependencies automatically, so add them explicitly. Keep `@react-native/jest-preset` on the same 0.85 line as react-native (`expo install` does not pick a version for this package and installs the latest, which prevents the tests from starting)

Add the following to `package.json`.

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

- Always include `@intra-mart/.*`. smartlime is distributed as TypeScript source, so excluding it from transformation causes syntax errors

`jest.setup.ts`:

```ts
// AsyncStorage, used by smartlime, is a native module, so replace it with the official mock in Jest
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
```

Add `"types": ["jest"]` to `compilerOptions` in `tsconfig.json` (TypeScript 6 does not load `@types/jest` automatically, so `jest` in test files becomes a type error).

## Mocking policy

- **In each test file, replace `@intra-mart/smartlime` and `@intra-mart/smartlime-ui` with `jest.mock` with a factory**. Define only the hooks and components used in the test
- Loading the real smartlime requires many mocks for native modules such as AsyncStorage, WebView, and SecureStore. Do not load the real modules
- Replace smartlime-ui components (`DefaultSearchUI`, `IMCalendar`, etc.) with `() => null` or simple components
- Write typed mocks like `jest.mocked(useIMFetch).mockReturnValue(...)`

## Testing API-calling hooks

Mock the function returned by `useIMFetch` so that it returns an object with `ok` / `status` / `json()`.

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

it('fetches the list of matters', async () => {
  const imFetch = mockImFetch({ error: false, data: { records: [{ systemMatterId: 'm1', matterName: 'Request' }] } });
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
    data: { records: [{ systemMatterId: 'm1', matterName: 'Request' }] },
  });
});
```

- **In React Native Testing Library 14, `render` and `renderHook` return Promises**. Add `await` (without it, `result` is `undefined` and an "overlapping act() calls" warning appears). Also `await` `fireEvent`
- Prepare tests that match the iAP response shape (`{ error, data }`): success / `error: true` with HTTP 200 / 403 / aborted request
- Reproduce token expiry by having `imFetch` reject with an error whose `name` is `IMFecthError` and `message` is `token has been destroyed.`

```ts
const error = Object.assign(new Error('token has been destroyed.'), { name: 'IMFecthError' });
const imFetch = jest.fn().mockRejectedValue(error);
```

## Testing screens

```tsx
import { useStartAuth } from '@intra-mart/smartlime';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import SignInScreen from '../sign-in';

jest.mock('@intra-mart/smartlime', () => ({ useStartAuth: jest.fn() }));

it('shows guidance when authorization fails', async () => {
  const startAuth = jest.fn().mockResolvedValue({ type: 'exception', exceptionDetail: new Error('x') });
  jest.mocked(useStartAuth).mockReturnValue(startAuth);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  await render(<SignInScreen />);
  await fireEvent.press(screen.getByText('Sign in to iAP'));

  expect(startAuth).toHaveBeenCalled();
  expect(alert).toHaveBeenCalledWith('Could not sign in', expect.any(String));
});
```

Example of a screen that switches display by installed modules (the `smartlime-assistant` screen):

```tsx
import { useIMModules, useIMModulesState } from '@intra-mart/smartlime';
import { render, screen } from '@testing-library/react-native';

import AssistantScreen from '../(app)/assistant';

jest.mock('@intra-mart/smartlime', () => ({
  useIMModules: jest.fn(),
  useIMModulesState: jest.fn(),
  useAssistant: jest.fn(),
}));

it('shows that the assistant is not available when IM-Copilot is missing', async () => {
  jest.mocked(useIMModules).mockReturnValue({ request: jest.fn().mockResolvedValue(undefined) } as never);
  jest.mocked(useIMModulesState).mockReturnValue({} as never);

  await render(<AssistantScreen />);

  expect(screen.getByText('The assistant is not available on this iAP.')).toBeTruthy();
});
```

Commonly used mock return values:

| Hook | Example return value |
|------|------|
| `useAuthState` | `'authorized'` / `'unauthorized'` / `'initializing'` |
| `useStartAuth` | `jest.fn().mockResolvedValue({ type: 'success' })` |
| `useIMOAuth` | `{ destroy: jest.fn(), getToken: jest.fn(), getTokenAsync: jest.fn(), refresh: jest.fn() }` |
| `useMe` | `{ request: jest.fn().mockResolvedValue({ status: 'success' }), getMe: jest.fn(), update: jest.fn() }` |
| `useMeState` | User information with only the fields the test needs (align the type with `as never`) |
| `useIMModulesState` | `{ 'jp.co.intra_mart.im_copilot': { moduleId: 'jp.co.intra_mart.im_copilot', version: '', enabled: true, others: {} } }` |
| `useIMBaseUrl` | `'https://iap.example.com/imart'` |
| `useIMSearch` | `{ startSearch: jest.fn().mockResolvedValue({ type: 'cancel' }) }` |
| `useAssistant` | `{ run: jest.fn(async (_request, callback) => { callback({ contents: 'Response', ... }, true); return { type: 'success' }; }), getThreadHistory: jest.fn().mockResolvedValue({ type: 'success', history: [] }) }` (see `smartlime-assistant` for details) |

## Running

```bash
npx jest
npx tsc --noEmit
```

When adding or changing tests, run both before reporting completion.
