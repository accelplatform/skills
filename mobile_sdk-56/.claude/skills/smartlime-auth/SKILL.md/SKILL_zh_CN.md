---
name: smartlime-auth
description: 实现使用 smartlime 的应用的登录与退出登录。涵盖根据登录状态（useAuthState）切换画面、使用 Expo Router 的 Stack.Protected 实现的认证门控、登录 iAP（useStartAuth）、退出登录的善后处理、登录用户的信息（useMe / useMeState）、已安装的模块（useIMModules），以及令牌的更新与失效的处理。当提及「登录画面」「退出登录」「未登录时的画面」「登录用户的信息」「根据角色改变显示」「令牌的有效期」时使用。初始设置（放置 Smartlime・OAuth 客户端）必须先通过 smartlime-setup 完成。
---

# smartlime 的登录与退出登录

## 目的

根据 smartlime OAuth 认证的状态切换画面，实现登录 iAP、退出登录以及获取登录用户的信息。
前提是 `Smartlime` 已放置在根布局中（`smartlime-setup`）。

## 登录状态

`useAuthState()` 返回当前状态，状态变化时会重新渲染。

| 状态 | 含义 |
|------|------|
| `initializing` | 启动时正在确认已保存的令牌 |
| `unauthorized` | 未登录（没有令牌、连接地址已变更、更新失败） |
| `authorized` | 已登录 |

- 启动时如果存在已保存的令牌，则不经过登录画面直接变为 `authorized`。此时登录用户的信息**尚未获取**
- 如果刷新令牌已失效，则在调用 API 时回到 `unauthorized`（`smartlime-api`）

## 认证门控（Expo Router）

在根布局中，使用 `Stack.Protected` 根据登录状态切换显示的路由。登录后无需手动进行画面跳转。

```
src/app/
├── _layout.tsx        ← Smartlime 与 RootNavigator
├── sign-in.tsx        ← 仅在未登录时显示
└── (app)/
    ├── _layout.tsx    ← 登录后的画面（标签页等）
    └── index.tsx
```

```tsx
// src/app/_layout.tsx
import { Smartlime, useAuthState, useIMOAuth, useMe } from '@intra-mart/smartlime';
import { DefaultSearchUI } from '@intra-mart/smartlime-ui';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { iapConfig, redirectUri } from '@/config/iap';

SplashScreen.preventAutoHideAsync();

const imoauth = {
  requestConfig: {
    clientId: iapConfig.clientId,
    clientSecret: iapConfig.clientSecret,
    scopes: iapConfig.scopes,
    redirectUri,
  },
};
const imseach = { SearchComponent: DefaultSearchUI };

function RootNavigator() {
  const authState = useAuthState();
  const { request } = useMe();
  const { destroy } = useIMOAuth();
  const [meReady, setMeReady] = useState(false);

  // 每次登录时（包括启动时恢复令牌）重新获取登录用户的信息
  useEffect(() => {
    if (authState !== 'authorized') {
      setMeReady(false);
      return;
    }
    let cancelled = false;
    request().then((result) => {
      if (cancelled) return;
      if (result.status === 'success') setMeReady(true);
      else destroy(); // 无法获取信息的令牌不可用，因此回到未登录状态
    });
    return () => {
      cancelled = true;
    };
  }, [authState, request, destroy]);

  const loading = authState === 'initializing' || (authState === 'authorized' && !meReady);
  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);
  if (loading) return null;

  const signedIn = authState === 'authorized';
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // 统一 smartlime-ui 的 @react-navigation/native 与 expo-router 之间的类型差异（参见 smartlime-setup）
  const theme = (colorScheme === 'dark' ? DarkTheme : DefaultTheme) as ReactNavigation.Theme;

  return (
    <Smartlime baseUrl={iapConfig.baseUrl} imoauth={imoauth} imseach={imseach}>
      <ThemeProvider value={theme}>
        <RootNavigator />
      </ThemeProvider>
    </Smartlime>
  );
}
```

- 登录用户的信息（`useMeState()`）在退出登录后仍会保留上一个用户的值。必须像上面那样**每次登录时通过 `request()` 重新获取，并在获取完成之前不显示登录后的画面**
- 在制作原型等不需要精心制作画面的场景下，也可以只用 smartlime-ui 的 `DefaultAuthScreen` 包裹 `children`（未登录时显示“認証”按钮（固定的日文文字），登录后先获取用户信息再显示 `children`）。按钮的文字和设计无法更改

## 登录画面

通过 `useStartAuth()` 返回的函数，在应用内浏览器中打开 iAP 的登录画面。

```tsx
// src/app/sign-in.tsx
import { useStartAuth } from '@intra-mart/smartlime';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, View } from 'react-native';

export default function SignInScreen() {
  const startAuth = useStartAuth();
  const [busy, setBusy] = useState(false);

  const onPress = async () => {
    setBusy(true);
    try {
      const result = await startAuth();
      switch (result.type) {
        case 'success': // 画面由根布局的 Stack.Protected 切换
        case 'cancel':
        case 'dismiss':
          return;
        case 'exception':
          console.error(result.exceptionDetail);
          break;
        default:
          console.warn(result.type, result.detail);
      }
      Alert.alert('无法登录', '请检查 iAP 的连接地址和 OAuth 客户端的设置。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {busy ? <ActivityIndicator /> : <Button title="登录 iAP" onPress={onPress} />}
    </View>
  );
}
```

`startAuth()` 不会抛出异常，而是通过 `type` 返回结果。

| `type` | 含义 |
|------|------|
| `success` | 已登录。令牌已保存，状态已变为 `authorized` |
| `cancel` / `dismiss` | 用户关闭了浏览器。不作为错误处理 |
| `error` / `locked` / `opened` | 授权失败。`detail` 中包含 expo-auth-session 的结果 |
| `exception` | 获取令牌等过程中发生了异常。`exceptionDetail` 中包含原因 |

- 对于由用户输入连接地址的应用，在登录前确认连接地址是否正确会更友好（例：如果 `${baseUrl}/oauth/authorize` 返回 404，则说明连接地址有误）。此确认应使用原生的 `fetch` 而非 `useIMFetch`（登录前没有令牌）

## 退出登录

smartlime 中没有名为“退出登录”的单一 API。请按以下顺序进行善后处理。

```ts
// src/hooks/use-logout.ts
import { useIMModules, useIMOAuth, useSession } from '@intra-mart/smartlime';
import { useCallback } from 'react';

export function useLogout() {
  const session = useSession();
  const modules = useIMModules();
  const oauth = useIMOAuth();

  return useCallback(async () => {
    // 销毁 iAP 的 Cookie 会话（使用了 useSession 时）需要访问令牌，因此先执行
    await session.destroy();
    await modules.destroy(); // 清除已安装模块的缓存（AsyncStorage）
    await oauth.destroy(); // 清除设备上的令牌，并将状态设为 unauthorized
  }, [session, modules, oauth]);
}
```

- `oauth.destroy()` 只会清除设备上保存的令牌，不会使 iAP 端的令牌失效
- 如果应用自行保存了数据（缓存、当前选中的项目等），必须在此处一并清除
- `destroy()` 使状态变为 `unauthorized` 后，认证门控会切换到登录画面

## 登录用户的信息

| 钩子 | 用途 |
|------|------|
| `useMeState()` | 登录用户的信息（未获取时为 `null`）。获取或更新后会重新渲染。**画面显示请使用此钩子** |
| `useMe()` | `request()`（获取）・`update()`（重新获取。与 `request` 相同）・`getMe()`（当前时刻的值。不会重新渲染） |

- 类型 `Me` 未公开。不要深层 import `lib/...` 或 `src/...`，应按如下方式推导

  ```ts
  import { useMeState } from '@intra-mart/smartlime';

  export type Me = NonNullable<ReturnType<typeof useMeState>>;
  ```

- 主要项目：`userCd`、`userName`、`locale`、`timeZone`、`calendarId`、`roleIds`（角色 ID 数组）、`allDepartments`（所属组织）、`allPosts`（职务）、`publicGroupList`、`emailAddress1`、`profileImage`。项目一览请查看 `node_modules/@intra-mart/smartlime/src/packages/Me/type.ts`
- 根据角色切换显示：`me.roleIds.includes('<角色 ID>')`。角色 ID 取决于 iAP 端的设置。不得凭推测编写，必须向用户确认
- iAP 端的个人资料发生变化时，通过 `update()` 重新获取

## 已安装的模块

通过 `useIMModules()` 可以确认 iAP 中已安装的模块（例如 IM-Copilot 是否可用）。

```ts
import { useIMModules, useIMModulesState } from '@intra-mart/smartlime';

const { request } = useIMModules();
await request(); // 未获取时向 iAP 查询，并将结果保存到 AsyncStorage

const modules = useIMModulesState(); // 获取后会重新渲染
const copilotEnabled = modules?.['jp.co.intra_mart.im_copilot']?.enabled ?? false;
```

- 结果按连接地址保存在 AsyncStorage 中，在 `destroy()` 之前不会重新向 iAP 查询。为应对模块构成发生变化的情况，必须在退出登录时执行 `destroy()`（见上文）
- 如果 iAP 没有查询端点（`/api/bearer/smacolow/modules`）（404），则所有模块都被视为无效
- 查询以 200・404 以外的状态失败时，`request()` 会抛出异常

## 令牌的更新与失效

- 访问令牌由 smartlime 更新（启动时如果临近过期则更新；API 返回 401 `invalid_token` 时更新并仅重发 1 次）。应用无需处理令牌
- 如果刷新令牌也已失效，状态会回到 `unauthorized`（认证门控会切换到登录画面）。如果想告知用户需要重新登录的原因，可以记录是否由用户自己退出登录，在并非自己退出登录而发生 `authorized` → `unauthorized` 时显示“已过期”
- 启动时确认令牌过程中发生的异常，可以通过 `useAuthInitError((error) => { ... })` 接收
- 需要访问令牌本身时（不经过 smartlime 加载图片等），使用 `useIMOAuth().getTokenAsync()`（如果临近过期则先更新再返回）。不得将令牌输出到日志或画面上

## 确认

- 按照启动 → 登录 → 退出应用后重新启动（保持登录状态） → 退出登录 → 用其他用户登录的顺序操作，确认不会显示上一个用户的信息
- `npx tsc --noEmit` 必须通过。测试请参见 `smartlime-testing`
