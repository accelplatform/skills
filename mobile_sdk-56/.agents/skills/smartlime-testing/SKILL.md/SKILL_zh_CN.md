---
name: smartlime-testing
description: 使用 Jest（jest-expo）和 React Native Testing Library 为使用 smartlime / smartlime-ui 的代码编写测试。涵盖 Jest 的引入与设置（transformIgnorePatterns・AsyncStorage 的 mock・TypeScript 的 types）、smartlime 钩子（useIMFetch・useStartAuth・useIMModules 等）的 mock 方法，以及调用 API 的钩子和画面的测试写法。当提及「编写测试」「Jest」「mock useIMFetch」「smartlime 的测试」时，或在编写使用 smartlime 的代码后添加测试时使用。
---

# 使用 smartlime 的代码的测试

## 目的

将 smartlime 的钩子替换为 mock，在不连接 iAP 的情况下测试应用的逻辑和画面。

## 引入

```bash
npx expo install --dev jest-expo jest @types/jest @testing-library/react-native @react-native/jest-preset@~0.85.0 test-renderer@^1.0.0
```

- `--dev` 是 `expo install` 自身的选项，应写在包名之前。如果写成 `-- --dev`，会原样传给包管理器：npm 会把包加入 dependencies，pnpm 11 则会报错
- `@react-native/jest-preset`（jest-expo 使用）和 `test-renderer`（React Native Testing Library 使用）是 peer 依赖。yarn 1 不会自动安装 peer 依赖，因此需要显式添加。`@react-native/jest-preset` 必须与 react-native 同为 0.85 系列（`expo install` 不会为此包选择版本而是安装最新版，导致测试无法启动）

在 `package.json` 中添加以下内容。

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

- 必须包含 `@intra-mart/.*`。smartlime 以 TypeScript 源代码形式分发，如果将其排除在转换对象之外，会出现语法错误

`jest.setup.ts`：

```ts
// smartlime 使用的 AsyncStorage 是原生模块，因此在 Jest 中替换为官方的 mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
```

在 `tsconfig.json` 的 `compilerOptions` 中添加 `"types": ["jest"]`（在 TypeScript 6 中 `@types/jest` 不会被自动加载，测试文件中的 `jest` 会出现类型错误）。

## mock 的方针

- **在每个测试文件中，使用带工厂函数的 `jest.mock` 替换 `@intra-mart/smartlime` 和 `@intra-mart/smartlime-ui`**。只定义测试中使用的钩子和组件
- 如果直接加载 smartlime 的实体，就需要大量 AsyncStorage・WebView・SecureStore 等原生模块的 mock。不得加载实体
- smartlime-ui 的组件（`DefaultSearchUI`・`IMCalendar` 等）替换为 `() => null` 或简单的组件
- 带类型的 mock 按 `jest.mocked(useIMFetch).mockReturnValue(...)` 的方式编写

## 调用 API 的钩子的测试

mock `useIMFetch` 返回的函数，使其返回带有 `ok` / `status` / `json()` 的对象。

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

it('获取案件一览', async () => {
  const imFetch = mockImFetch({ error: false, data: { records: [{ systemMatterId: 'm1', matterName: '申请' }] } });
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
    data: { records: [{ systemMatterId: 'm1', matterName: '申请' }] },
  });
});
```

- **在 React Native Testing Library 14 中，`render` 和 `renderHook` 返回 Promise**。必须加上 `await`（不加的话 `result` 会变成 `undefined`，并出现“overlapping act() calls”警告）。`fireEvent` 也要 `await`
- 准备与 iAP 响应格式（`{ error, data }`）相对应的测试：成功 / HTTP 200 且 `error: true` / 403 / 通信中断
- 令牌失效的情况，通过让 `imFetch` 以 `name` 为 `IMFecthError`、`message` 为 `token has been destroyed.` 的错误 reject 来模拟

```ts
const error = Object.assign(new Error('token has been destroyed.'), { name: 'IMFecthError' });
const imFetch = jest.fn().mockRejectedValue(error);
```

## 画面的测试

```tsx
import { useStartAuth } from '@intra-mart/smartlime';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import SignInScreen from '../sign-in';

jest.mock('@intra-mart/smartlime', () => ({ useStartAuth: jest.fn() }));

it('授权失败时显示提示', async () => {
  const startAuth = jest.fn().mockResolvedValue({ type: 'exception', exceptionDetail: new Error('x') });
  jest.mocked(useStartAuth).mockReturnValue(startAuth);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  await render(<SignInScreen />);
  await fireEvent.press(screen.getByText('登录 iAP'));

  expect(startAuth).toHaveBeenCalled();
  expect(alert).toHaveBeenCalledWith('无法登录', expect.any(String));
});
```

根据已安装的模块切换显示的画面示例（`smartlime-assistant` 的画面）：

```tsx
import { useIMModules, useIMModulesState } from '@intra-mart/smartlime';
import { render, screen } from '@testing-library/react-native';

import AssistantScreen from '../(app)/assistant';

jest.mock('@intra-mart/smartlime', () => ({
  useIMModules: jest.fn(),
  useIMModulesState: jest.fn(),
  useAssistant: jest.fn(),
}));

it('没有 IM-Copilot 时显示无法使用的提示', async () => {
  jest.mocked(useIMModules).mockReturnValue({ request: jest.fn().mockResolvedValue(undefined) } as never);
  jest.mocked(useIMModulesState).mockReturnValue({} as never);

  await render(<AssistantScreen />);

  expect(screen.getByText('此 iAP 无法使用助手。')).toBeTruthy();
});
```

常用的 mock 返回值：

| 钩子 | 返回值示例 |
|------|------|
| `useAuthState` | `'authorized'` / `'unauthorized'` / `'initializing'` |
| `useStartAuth` | `jest.fn().mockResolvedValue({ type: 'success' })` |
| `useIMOAuth` | `{ destroy: jest.fn(), getToken: jest.fn(), getTokenAsync: jest.fn(), refresh: jest.fn() }` |
| `useMe` | `{ request: jest.fn().mockResolvedValue({ status: 'success' }), getMe: jest.fn(), update: jest.fn() }` |
| `useMeState` | 只包含测试所需项目的用户信息（通过 `as never` 统一类型） |
| `useIMModulesState` | `{ 'jp.co.intra_mart.im_copilot': { moduleId: 'jp.co.intra_mart.im_copilot', version: '', enabled: true, others: {} } }` |
| `useIMBaseUrl` | `'https://iap.example.com/imart'` |
| `useIMSearch` | `{ startSearch: jest.fn().mockResolvedValue({ type: 'cancel' }) }` |
| `useAssistant` | `{ run: jest.fn(async (_request, callback) => { callback({ contents: '回复', ... }, true); return { type: 'success' }; }), getThreadHistory: jest.fn().mockResolvedValue({ type: 'success', history: [] }) }`（详情参见 `smartlime-assistant`） |

## 运行

```bash
npx jest
npx tsc --noEmit
```

在添加或修改了测试的工作中，必须在报告完成之前运行这两条命令。
