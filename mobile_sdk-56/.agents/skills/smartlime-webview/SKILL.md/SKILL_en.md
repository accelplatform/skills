---
name: smartlime-webview
description: Displays intra-mart Accel Platform (iAP) pages inside the app with smartlime's IMWebView. Covers how an iAP web session is created from the OAuth token, recreating the session right after sign-in (forceLogin), recreating it when the URL changes (key), refreshing the access token before display (getTokenAsync), useHackSearchUI to replace the search dialog of iAP pages with the app's search screen, cookies for file downloads (useSession / makeCookie), and hiding the iAP header. Use when the user mentions "display an iAP page", "WebView", "IMWebView", "open the workflow application page in the app", or "download in WebView". To get data through APIs, use smartlime-api.
---

# Displaying iAP pages with IMWebView

## Purpose

Display iAP pages (workflow application and processing pages, the portal, pages from the menu, etc.) inside the app as the signed-in user.
Build what can be made as native screens by calling APIs with `smartlime-api`, and use `IMWebView` when you want to use iAP pages as they are.

## How IMWebView works

`IMWebView` is a component that wraps the `WebView` of `react-native-webview`, and automatically does the following before displaying.

1. Fetches the installed modules (if not fetched yet)
2. Checks whether the WebView has an iAP session. If not (or when `forceLogin` is set), signs out and then creates an iAP web session with the access token
3. Navigates to the `source.uri` page. Shows an indicator while preparing

Notes:

- **Only the first value passed** to `source.uri` is used. To change the displayed URL, pass the URL to `key` to recreate it
- `source.uri` is an absolute URL. Build it with `join(useIMBaseUrl(), path)`
- `onShouldStartLoadWithRequest` cannot be used (it is used for establishing the session)
- `onLoad` / `onLoadEnd` / `onMessage` etc. are called after navigating to the target page
- For `allowsInlineMediaPlayback`, `allowsPictureInPictureMediaPlayback`, `mediaPlaybackRequiresUserAction`, and `dataDetectorTypes`, only the first value is used
- WebView cookies are not shared with the app's other requests (`sharedCookiesEnabled: false`)
- Cannot be used on the web (`expo start --web`)

## Display component

```tsx
// src/components/iap-web-view.tsx
import { IMWebView, join, useHackSearchUI, useIMBaseUrl, useIMOAuth } from '@intra-mart/smartlime';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';
import type { WebViewMessageEvent } from 'react-native-webview';

import { consumeFreshLogin } from '@/lib/web-session';

interface Props {
  /** Path relative to the iAP context path (e.g. '/home') */
  path: string;
}

export function IapWebView({ path }: Props) {
  const uri = join(useIMBaseUrl(), path);
  const [forceLogin] = useState(consumeFreshLogin);
  // Replace the search dialog of iAP pages with the app's search screen (DefaultSearchUI)
  const hackSearch = useHackSearchUI((error) => console.warn(error));
  const { getTokenAsync } = useIMOAuth();
  const [tokenReady, setTokenReady] = useState(false);

  // IMWebView uses the access token at render time without checking its expiry. Refresh it first if it is about to expire
  useEffect(() => {
    let cancelled = false;
    getTokenAsync()
      .then(() => {
        if (!cancelled) setTokenReady(true);
      })
      // If the refresh fails, smartlime returns to the signed-out state and the auth gate switches to the sign-in screen
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // Check only once each time the page is shown
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMessage = (event: WebViewMessageEvent) => {
    hackSearch.onMessage(event); // Call before your own handling
    // Write your own message handling here, if any
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
        Alert.alert('Could not open the iAP page');
      }}
      style={styles.webview}
    />
  );
}

const styles = StyleSheet.create({ webview: { flex: 1 } });
```

- **Render `IMWebView` after refreshing the access token**. `IMWebView` creates the iAP web session with the access token at render time and does not refresh it even if it has expired. If the page is opened after the token expires (1 hour by default in iAP) without any API calls, session creation fails with `onSessionCreationError` and the page cannot be shown. `useIMOAuth().getTokenAsync()` refreshes the token first if it is about to expire or has expired
- If the app code uses types or components of `react-native-webview` directly, add it to the app's dependencies with `npx expo install react-native-webview`
- Pass `hackSearch.ref` as `ref` (it is used to return search results to the WebView). If you also want to control the WebView yourself, use this `ref`
- Replacing the search dialog requires passing `imseach={{ SearchComponent: DefaultSearchUI }}` to `Smartlime` (`smartlime-setup`)
- The error callback of `useHackSearchUI` is also called when the user cancels the search. Do not show an error for a cancellation (`type: 'cancel'`)

### Recreate the session right after sign-in

WebView cookies remain on the device, so when signing in again as a different user, the previous user's iAP session may be used. Set `forceLogin` to `true` only for the first `IMWebView` right after sign-in.

```ts
// src/lib/web-session.ts
// Whether we are right after sign-in. The first IMWebView after sign-in recreates the iAP web session
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

In the auth gate (`RootNavigator` in `smartlime-auth`), call `markLoggedIn()` when the signed-in user's information has been fetched.

```ts
request().then((result) => {
  if (cancelled) return;
  if (result.status === 'success') {
    markLoggedIn();
    setMeReady(true);
  } else destroy();
});
```

## Screen (Expo Router)

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

The opening side: `router.push({ pathname: '/iap-page', params: { path: '/home', title: 'Home' } })`

- The paths of pages to display depend on the iAP configuration (workflow page paths, parameters, etc.). Do not guess them; confirm with the user
- To hide the iAP header and menu so the page blends in with the app's screens, add `imui-theme-builder-module=headonly` to the URL query

## Common additional handling

| Goal | Method |
|------|------|
| Close when the operation on the page is done | In `onNavigationStateChange`, check `event.url` and call `router.back()` when it moves to the URL of the page shown after completion. Re-fetch the list at the same time |
| Go back within the WebView with the Android back button | Record `canGoBack` from `onNavigationStateChange`, and call `ref.current?.goBack()` from `BackHandler` |
| Open links to external sites in the device browser | Notify link taps via `postMessage` from injected JavaScript, and open them on the app side with `expo-web-browser` or `Linking.openURL` |
| File downloads | Downloads inside the WebView often do not work. Receive the link URL and download it on the app side with cookies attached (below) |

### Downloading from iAP with cookies

`useSession()` creates and returns an iAP cookie session from the access token. Attach the cookies and `X-Intramart-Session: keep` to the download request.

```ts
import { makeCookie, useSession } from '@intra-mart/smartlime';
import { useCallback } from 'react';

export function useIapCookieHeaders() {
  const { getSessionAsync } = useSession();
  return useCallback(async () => {
    const { cookies } = await getSessionAsync(); // Creates one if none exists. Throws on failure
    return {
      Cookie: makeCookie(cookies ?? []),
      'X-Intramart-Session': 'keep',
    };
  }, [getSessionAsync]);
}
```

- Download, save, and share with `expo-file-system` and `expo-sharing`. Their APIs change with each SDK, so check the SDK 56 documentation (`https://docs.expo.dev/versions/v56.0.0/sdk/filesystem/`)
- On sign-out, destroy this session with `useSession().destroy()` (the sign-out steps in `smartlime-auth`)

## Verification

- Open an iAP page after the access token has expired (1 hour by default in iAP) without calling any API, and confirm that it is shown
- Open an iAP page right after sign-in, after restarting the app, and after signing in as a different user, and confirm that it is shown as the correct user
- Open a search dialog on an iAP page (user selection, etc.), and confirm that the app's search screen appears and the selection is reflected on the iAP page
