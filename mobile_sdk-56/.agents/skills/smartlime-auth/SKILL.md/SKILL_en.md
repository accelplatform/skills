---
name: smartlime-auth
description: Implements sign-in and sign-out for apps that use smartlime. Covers switching screens by sign-in state (useAuthState), the auth gate with Expo Router's Stack.Protected, signing in to iAP (useStartAuth), cleanup on sign-out, the signed-in user's information (useMe / useMeState), installed modules (useIMModules), and handling token refresh and expiry. Use when the user mentions "login screen", "sign out", "screen when signed out", "signed-in user's information", "change display by role", or "token expiry". Complete the initial setup (placing Smartlime, the OAuth client) with smartlime-setup first.
---

# Sign-in and sign-out with smartlime

## Purpose

Switch screens according to the smartlime OAuth authentication state, and implement signing in to iAP, signing out, and fetching the signed-in user's information.
`Smartlime` must already be placed in the root layout (`smartlime-setup`).

## Sign-in state

`useAuthState()` returns the current state and re-renders when the state changes.

| State | Meaning |
|------|------|
| `initializing` | Checking saved tokens at startup |
| `unauthorized` | Signed out (no token, the target iAP changed, or refresh failed) |
| `authorized` | Signed in |

- If saved tokens exist at startup, the state becomes `authorized` without going through the login screen. At that point, the signed-in user's information has **not been fetched yet**
- If the refresh token has expired, the state returns to `unauthorized` when an API is called (`smartlime-api`)

## Auth gate (Expo Router)

In the root layout, switch the routes shown according to the sign-in state with `Stack.Protected`. You do not need to navigate manually after signing in.

```
src/app/
├── _layout.tsx        ← Smartlime and RootNavigator
├── sign-in.tsx        ← Shown only when signed out
└── (app)/
    ├── _layout.tsx    ← Screens after sign-in (tabs, etc.)
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

  // Re-fetch the signed-in user's information on every sign-in (including token restoration at startup)
  useEffect(() => {
    if (authState !== 'authorized') {
      setMeReady(false);
      return;
    }
    let cancelled = false;
    request().then((result) => {
      if (cancelled) return;
      if (result.status === 'success') setMeReady(true);
      else destroy(); // A token that cannot fetch the information is unusable, so return to signed out
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
  // Align the type difference between smartlime-ui's @react-navigation/native and expo-router (see smartlime-setup)
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

- The signed-in user's information (`useMeState()`) keeps the previous user's value even after signing out. As above, **re-fetch it with `request()` on every sign-in, and do not show the signed-in screens until the fetch completes**
- For prototypes or when not building out screens, simply wrapping `children` in smartlime-ui's `DefaultAuthScreen` is enough (it shows a button labeled "認証" (a fixed Japanese label) when signed out, and after sign-in fetches the user information and then shows `children`). The button text and design cannot be changed

## Login screen

The function returned by `useStartAuth()` opens the iAP login screen in an in-app browser.

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
        case 'success': // Stack.Protected in the root layout switches the screen
        case 'cancel':
        case 'dismiss':
          return;
        case 'exception':
          console.error(result.exceptionDetail);
          break;
        default:
          console.warn(result.type, result.detail);
      }
      Alert.alert('Could not sign in', 'Check the iAP URL and the OAuth client settings.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {busy ? <ActivityIndicator /> : <Button title="Sign in to iAP" onPress={onPress} />}
    </View>
  );
}
```

`startAuth()` does not throw; it returns the result in `type`.

| `type` | Meaning |
|------|------|
| `success` | Signed in. The token is saved and the state is `authorized` |
| `cancel` / `dismiss` | The user closed the browser. Do not treat it as an error |
| `error` / `locked` / `opened` | Authorization failed. `detail` contains the expo-auth-session result |
| `exception` | An exception occurred, e.g. while obtaining the token. `exceptionDetail` contains the cause |

- In apps where the user enters the target iAP, it is helpful to check that the target is correct before signing in (e.g. if `${baseUrl}/oauth/authorize` returns 404, the target is wrong). Use plain `fetch` for this check, not `useIMFetch` (there is no token before sign-in)

## Sign-out

smartlime has no single "sign out" API. Clean up in the following order.

```ts
// src/hooks/use-logout.ts
import { useIMModules, useIMOAuth, useSession } from '@intra-mart/smartlime';
import { useCallback } from 'react';

export function useLogout() {
  const session = useSession();
  const modules = useIMModules();
  const oauth = useIMOAuth();

  return useCallback(async () => {
    // Destroying the iAP cookie session (if useSession was used) needs the access token, so do it first
    await session.destroy();
    await modules.destroy(); // Clear the installed modules cache (AsyncStorage)
    await oauth.destroy(); // Delete the tokens on the device and set the state to unauthorized
  }, [session, modules, oauth]);
}
```

- `oauth.destroy()` only deletes the tokens saved on the device; it does not revoke the tokens on the iAP side
- If the app saves its own data (caches, selected items, etc.), clear it here as well
- When `destroy()` sets the state to `unauthorized`, the auth gate switches to the login screen

## Signed-in user's information

| Hook | Use |
|------|------|
| `useMeState()` | The signed-in user's information (`null` if not fetched). Re-renders when fetched or updated. **Use this for displaying on screens** |
| `useMe()` | `request()` (fetch), `update()` (re-fetch; same as `request`), `getMe()` (the current value; does not re-render) |

- The `Me` type is not exported. Do not deep-import from `lib/...` or `src/...`; derive it as follows

  ```ts
  import { useMeState } from '@intra-mart/smartlime';

  export type Me = NonNullable<ReturnType<typeof useMeState>>;
  ```

- Main fields: `userCd`, `userName`, `locale`, `timeZone`, `calendarId`, `roleIds` (array of role IDs), `allDepartments` (organizations), `allPosts` (positions), `publicGroupList`, `emailAddress1`, `profileImage`. For the full list of fields, see `node_modules/@intra-mart/smartlime/src/packages/Me/type.ts`
- Switching display by role: `me.roleIds.includes('<role ID>')`. Role IDs depend on the iAP settings. Do not guess them; confirm with the user
- If the profile changes on the iAP side, re-fetch with `update()`

## Installed modules

With `useIMModules()`, you can check which modules are installed on iAP (e.g. whether IM-Copilot is available).

```ts
import { useIMModules, useIMModulesState } from '@intra-mart/smartlime';

const { request } = useIMModules();
await request(); // If not fetched, queries iAP and saves the result to AsyncStorage

const modules = useIMModulesState(); // Re-renders after fetching
const copilotEnabled = modules?.['jp.co.intra_mart.im_copilot']?.enabled ?? false;
```

- The result is saved to AsyncStorage per target iAP, and iAP is not queried again until `destroy()` is called. In case the module configuration changes, call `destroy()` on sign-out (see above)
- If iAP does not have the endpoint (`/api/bearer/smacolow/modules`) (404), all modules are treated as disabled
- `request()` throws if the query fails with a status other than 200 or 404

## Token refresh and expiry

- smartlime refreshes the access token (refreshes at startup if expiry is near; when an API returns 401 `invalid_token`, refreshes and retries once). The app does not need to handle tokens
- If the refresh token has also expired, the state returns to `unauthorized` (the auth gate switches to the login screen). To tell the user why they need to sign in again, record whether the user signed out themselves, and show "Your session has expired" when the state goes from `authorized` → `unauthorized` other than by the user's own sign-out
- Exceptions that occur while checking tokens at startup can be received with `useAuthInitError((error) => { ... })`
- If you need the access token itself (e.g. loading images without going through smartlime), use `useIMOAuth().getTokenAsync()` (refreshes before returning if expiry is near). Do not output the token to logs or screens

## Verification

- Go through startup → sign in → quit and restart the app (still signed in) → sign out → sign in as a different user, and confirm that the previous user's information is not shown
- `npx tsc --noEmit` must pass. For tests, see `smartlime-testing`
