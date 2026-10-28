---
name: smartlime-webview
description: 使用 smartlime 的 IMWebView 在应用内显示 intra-mart Accel Platform（iAP）的页面。涵盖从 OAuth 令牌创建 iAP Web 会话的机制、登录后立即重建会话（forceLogin）、更改 URL 时的重建（key）、显示前更新访问令牌（getTokenAsync）、将 iAP 页面的检索对话框替换为应用检索画面的 useHackSearchUI、用于文件下载的 Cookie（useSession / makeCookie），以及隐藏 iAP 页眉的显示方式。当提及「显示 iAP 的页面」「WebView」「IMWebView」「在应用中打开工作流的申请页面」「在 WebView 中下载」时使用。通过 API 获取数据时请使用 smartlime-api。
---

# 使用 IMWebView 显示 iAP 的页面

## 目的

在保持已登录用户身份的情况下，在应用内显示 iAP 的页面（工作流的申请・处理页面、门户、菜单中的各页面等）。
能用原生画面实现的内容，通过 `smartlime-api` 调用 API 来实现；希望直接使用 iAP 的页面时，使用 `IMWebView`。

## IMWebView 的行为

`IMWebView` 是封装了 `react-native-webview` 的 `WebView` 的组件，在显示之前会自动执行以下处理。

1. 获取已安装的模块（尚未获取时）
2. 确认 WebView 中是否存在 iAP 的会话。如果不存在（或指定了 `forceLogin` 时），先退出登录，再使用访问令牌创建 iAP 的 Web 会话
3. 跳转到 `source.uri` 的页面。准备期间显示指示器

注意事项：

- `source.uri` **只使用最初传入的值**。更改显示的 URL 时，必须将 URL 传给 `key` 以重建组件
- `source.uri` 是绝对 URL。通过 `join(useIMBaseUrl(), path)` 生成
- 无法使用 `onShouldStartLoadWithRequest`（已被用于建立会话）
- `onLoad` / `onLoadEnd` / `onMessage` 等会在跳转到目标页面之后才被调用
- `allowsInlineMediaPlayback`・`allowsPictureInPictureMediaPlayback`・`mediaPlaybackRequiresUserAction`・`dataDetectorTypes` 只使用最初的值
- WebView 的 Cookie 不与应用的其他通信共享（`sharedCookiesEnabled: false`）
- 无法在 Web 版（`expo start --web`）中使用

## 显示用组件

```tsx
// src/components/iap-web-view.tsx
import { IMWebView, join, useHackSearchUI, useIMBaseUrl, useIMOAuth } from '@intra-mart/smartlime';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';
import type { WebViewMessageEvent } from 'react-native-webview';

import { consumeFreshLogin } from '@/lib/web-session';

interface Props {
  /** 相对于 iAP 上下文路径的路径（例：'/home'） */
  path: string;
}

export function IapWebView({ path }: Props) {
  const uri = join(useIMBaseUrl(), path);
  const [forceLogin] = useState(consumeFreshLogin);
  // 将 iAP 页面的检索对话框替换为应用的检索画面（DefaultSearchUI）
  const hackSearch = useHackSearchUI((error) => console.warn(error));
  const { getTokenAsync } = useIMOAuth();
  const [tokenReady, setTokenReady] = useState(false);

  // IMWebView 会直接使用渲染时的访问令牌，不检查其有效期。如果即将过期，先进行更新
  useEffect(() => {
    let cancelled = false;
    getTokenAsync()
      .then(() => {
        if (!cancelled) setTokenReady(true);
      })
      // 更新失败时，smartlime 会恢复为未登录状态，认证门禁会切换到登录画面
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // 每次显示时只检查一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMessage = (event: WebViewMessageEvent) => {
    hackSearch.onMessage(event); // 在自定义处理之前调用
    // 如有自定义的消息处理，写在这里
  };

  if (!tokenReady) return <ActivityIndicator style={styles.webview} />;

  return (
    <IMWebView
      key={uri}
      ref={hackSearch.ref}
      source={{ uri }}
      forceLogin={forceLogin}
      injectedJavaScriptBeforeContentLoaded={hackSearch.injectedJavaScriptBeforeContentLoaded}
      onMessage={onMessage}
      onSessionCreationError={(error) => {
        console.error(error);
        Alert.alert('无法打开 iAP 页面');
      }}
      style={styles.webview}
    />
  );
}

const styles = StyleSheet.create({ webview: { flex: 1 } });
```

- **先更新访问令牌，再渲染 `IMWebView`**。`IMWebView` 使用渲染时的访问令牌创建 iAP 的 Web 会话，即使已过期也不会更新。如果在未调用任何 API 的情况下超过有效期（iAP 默认为 1 小时）后打开，会因无法创建会话而触发 `onSessionCreationError`，页面无法显示。`useIMOAuth().getTokenAsync()` 会在令牌即将过期或已过期时先更新再返回
- 如果在应用代码中直接使用 `react-native-webview` 的类型或组件，请通过 `npx expo install react-native-webview` 将其加入应用的依赖
- `ref` 传入 `hackSearch.ref`（用于将检索结果返回给 WebView）。如果自己也需要操作 WebView，同样使用此 `ref`
- 替换检索对话框的前提是已向 `Smartlime` 传入 `imseach={{ SearchComponent: DefaultSearchUI }}`（`smartlime-setup`）
- `useHackSearchUI` 的错误回调在用户取消检索时也会被调用。取消（`type: 'cancel'`）时不得显示错误

### 登录后立即重建会话

由于 WebView 的 Cookie 会保留在设备上，使用其他用户重新登录时，可能会使用上一个用户的 iAP 会话。仅在登录后的第一个 `IMWebView` 中将 `forceLogin` 设为 `true`。

```ts
// src/lib/web-session.ts
// 是否刚刚登录。登录后的第一个 IMWebView 会重建 iAP 的 Web 会话
let freshLogin = true;

export function markLoggedIn() {
  freshLogin = true;
}

export function consumeFreshLogin() {
  const value = freshLogin;
  freshLogin = false;
  return value;
}
```

在认证门控（`smartlime-auth` 的 `RootNavigator`）中，成功获取登录用户的信息时调用 `markLoggedIn()`。

```ts
request().then((result) => {
  if (cancelled) return;
  if (result.status === 'success') {
    markLoggedIn();
    setMeReady(true);
  } else destroy();
});
```

## 画面（Expo Router）

```tsx
// src/app/(app)/iap-page.tsx
import { Stack, useLocalSearchParams } from 'expo-router';

import { IapWebView } from '@/components/iap-web-view';

export default function IapPageScreen() {
  const { path, title } = useLocalSearchParams<{ path: string; title?: string }>();
  return (
    <>
      <Stack.Screen options={{ title: title ?? '' }} />
      <IapWebView path={path} />
    </>
  );
}
```

打开方：`router.push({ pathname: '/iap-page', params: { path: '/home', title: '首页' } })`

- 要显示的页面路径取决于 iAP 端的构成（工作流页面的路径和参数等）。不得凭推测编写，必须向用户确认
- 如果希望隐藏 iAP 的页眉和菜单，使其与应用的画面融为一体，请在 URL 的查询参数中添加 `imui-theme-builder-module=headonly`

## 常用的附加处理

| 想要实现的功能 | 方法 |
|------|------|
| 页面操作完成后关闭 | 在 `onNavigationStateChange` 中查看 `event.url`，跳转到完成后页面的 URL 时执行 `router.back()`。同时重新获取列表 |
| 使用 Android 的返回按钮在 WebView 内返回 | 记录 `onNavigationStateChange` 的 `canGoBack`，在 `BackHandler` 中调用 `ref.current?.goBack()` |
| 在设备的浏览器中打开外部网站的链接 | 通过注入的 JavaScript 用 `postMessage` 通知链接被点击，在应用端使用 `expo-web-browser` 或 `Linking.openURL` 打开 |
| 文件下载 | WebView 内的下载多数情况下无法工作。接收链接的 URL，在应用端附加 Cookie 进行下载（见下文） |

### 附加 Cookie 从 iAP 下载

`useSession()` 会使用访问令牌创建并返回 iAP 的 Cookie 会话。在下载请求中附加 Cookie 和 `X-Intramart-Session: keep`。

```ts
import { makeCookie, useSession } from '@intra-mart/smartlime';
import { useCallback } from 'react';

export function useIapCookieHeaders() {
  const { getSessionAsync } = useSession();
  return useCallback(async () => {
    const { cookies } = await getSessionAsync(); // 不存在时创建。失败时抛出异常
    return {
      Cookie: makeCookie(cookies ?? []),
      'X-Intramart-Session': 'keep',
    };
  }, [getSessionAsync]);
}
```

- 下载与保存・共享通过 `expo-file-system` 和 `expo-sharing` 进行。API 随 SDK 而变化，必须查阅 SDK 56 的文档（`https://docs.expo.dev/versions/v56.0.0/sdk/filesystem/`）确认
- 退出登录时，通过 `useSession().destroy()` 销毁此会话（`smartlime-auth` 中退出登录的步骤）

## 确认

- 在未调用任何 API 的情况下超过访问令牌的有效期（iAP 默认为 1 小时）后打开 iAP 的页面，确认能够显示
- 在刚登录后・应用重启后・使用其他用户登录后打开 iAP 的页面，确认以正确的用户身份显示
- 打开 iAP 页面的检索对话框（用户选择等），确认会显示应用的检索画面，且选择结果会反映到 iAP 的页面上
