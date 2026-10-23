---
name: smartlime-setup
description: Installs @intra-mart/smartlime and @intra-mart/smartlime-ui in an Expo app and performs the initial setup for connecting to intra-mart Accel Platform (iAP) via OAuth. Covers adding the packages, the scheme in app.json, the redirect URI, handling connection information (base URL, client ID, client secret, scopes), placing Smartlime in the root layout, and what to register for the OAuth client on the iAP side. Use when the user mentions "install smartlime", "set up the connection to iAP", "register an OAuth client", "redirect URI", or "place Smartlime", or when writing code that uses smartlime for the first time in the project. For building the login screen use smartlime-auth; for calling APIs use smartlime-api.
---

# Installing smartlime and setting up the connection to iAP

## Purpose

Install smartlime in an Expo project so that the app can sign in to iAP via OAuth (authorization code + PKCE).
After completing this skill, implement the login screen with `smartlime-auth` and iAP API calls with `smartlime-api`.

## Prerequisites

| Item | Details |
|------|------|
| Expo SDK | **56**. smartlime 3.0.0 is for SDK 56 only (peerDependencies: `expo ^56.0.17`, `react 19.2.3`) |
| Node.js | 22 or later |
| iAP | The `jp.co.intra_mart.im_smacolow` module must be installed. iAP must be usable as an OAuth authorization server |

> **Do not upgrade the SDK**: `npx expo-doctor` may recommend upgrading to SDK 57 because of a known SDK 56 issue (Hermes V1 memory). Stay on SDK 56 until smartlime supports SDK 57, and leave the upgrade decision to the user.

## Steps

### 1. Add the packages

```bash
npx expo install @intra-mart/smartlime@3.0.0 @intra-mart/smartlime-ui@3.0.0 expo-auth-session
```

- **Pin smartlime and smartlime-ui to the same version** (do not use a range)
- The native modules smartlime uses (`expo-secure-store`, `react-native-webview`, `expo-camera`, etc.) are installed automatically as smartlime dependencies. You do not need to add them individually
- `expo-auth-session` is imported directly from the app code to build the redirect URI, so add it to the app's dependencies
- After adding them, run `npx expo-doctor` and confirm that no issues appear other than the SDK 57 advice above

**If you use pnpm**, before adding the packages, write the following settings in `pnpm-workspace.yaml` (create the file if it does not exist), then run `pnpm install` to relink `node_modules`.

```yaml
nodeLinker: hoisted
allowBuilds:
  react-native-elements: false
```

- `nodeLinker: hoisted`: with pnpm's default layout (dependencies isolated per package), the old `@types/react-native` brought in by a smartlime-ui dependency is used, causing type errors in the smartlime source. Jest's `transformIgnorePatterns` (`smartlime-testing`) also does not match paths under `node_modules/.pnpm/`, so the tests do not run
- `allowBuilds`: pnpm 11 ends adding packages with exit code 1 when there is an unapproved postinstall script. The postinstall of `react-native-elements` (a smartlime-ui dependency) only displays a donation message, so set it to `false` (do not run)

### 2. Set the scheme in app.json

Use an app-specific URL scheme as the OAuth redirect target. Change the `expo.scheme` set by create-expo to a name that does not collide with other apps (lowercase letters, digits, `-`, `.`, `+`).

```json
{
  "expo": {
    "scheme": "com.example.myapp"
  }
}
```

If you change the scheme, you must also change the redirect URI registered on the iAP side.

### 3. Keep the connection information and redirect URI in one place

Create `src/config/iap.ts` (any path is fine, but place it outside `src/app/`).

```ts
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';

const getScheme = () => {
  const scheme = Constants.expoConfig?.scheme;
  const value = Array.isArray(scheme) ? scheme[0] : scheme;
  if (!value) throw new Error('expo.scheme is not set in app.json');
  return value;
};

const scheme = getScheme();

// In development builds and release builds this becomes `<scheme>://redirect`.
// Without native, the URI may include the dev server address.
export const redirectUri = makeRedirectUri({
  scheme,
  native: `${scheme}://redirect`,
  path: 'redirect',
});

export const iapConfig = {
  baseUrl: process.env.EXPO_PUBLIC_IAP_BASE_URL ?? '',
  clientId: process.env.EXPO_PUBLIC_IAP_CLIENT_ID ?? '',
  clientSecret: process.env.EXPO_PUBLIC_IAP_CLIENT_SECRET ?? '',
  scopes: ['smacolow', 'menu', 'im-workflow-rest', 'immaster', 'notice-history', 'notice-mobile-device'],
};
```

Handling the connection information:

- **Do not hard-code it in the source code**. Locally, write it in `.env.local` (already excluded by create-expo's `.gitignore`)

  ```
  EXPO_PUBLIC_IAP_BASE_URL=https://iap.example.com/imart
  EXPO_PUBLIC_IAP_CLIENT_ID=...
  EXPO_PUBLIC_IAP_CLIENT_SECRET=...
  ```

- When building with EAS, register variables with the same names as EAS environment variables
- `EXPO_PUBLIC_` values are embedded in the app bundle. Assume the client secret can be extracted from the distributed app, and keep the scopes allowed for the OAuth client to the minimum necessary
- `baseUrl` goes up to the iAP context path (e.g. `https://iap.example.com/imart`). Do not add a trailing `/`
- You may narrow the scopes to those needed by the APIs the app calls. The six above are the combination used by the smartlime sample app
- In apps where the user enters the target iAP on a screen (a different iAP per tenant), save `baseUrl` to AsyncStorage or similar and pass it to `Smartlime`. Saved tokens are stored together with `baseUrl`, so changing `baseUrl` returns the app to the signed-out state

### 4. Place Smartlime in the root layout

In `src/app/_layout.tsx`, wrap the entire screen in `Smartlime`. `Smartlime` is a provider that internally nests `IMTenant` → `IMOAuth` → `IMSession` → `IMMe` → `IMSearch` in that order, and all smartlime hooks can only be used inside it.

Example of integrating it into the create-expo template (SDK 56) layout:

```tsx
import { Smartlime } from '@intra-mart/smartlime';
import { DefaultAuthScreen, DefaultSearchUI } from '@intra-mart/smartlime-ui';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { iapConfig, redirectUri } from '@/config/iap';

SplashScreen.preventAutoHideAsync();

// Define outside the component so it is not recreated on every render
const imoauth = {
  requestConfig: {
    clientId: iapConfig.clientId,
    clientSecret: iapConfig.clientSecret,
    scopes: iapConfig.scopes,
    redirectUri,
  },
};
const imseach = { SearchComponent: DefaultSearchUI };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // @react-navigation/native (which smartlime-ui depends on) and expo-router
  // each extend ReactNavigation.Theme, so align the types
  const theme = (colorScheme === 'dark' ? DarkTheme : DefaultTheme) as ReactNavigation.Theme;

  return (
    <Smartlime baseUrl={iapConfig.baseUrl} imoauth={imoauth} imseach={imseach}>
      <ThemeProvider value={theme}>
        <AnimatedSplashOverlay />
        <DefaultAuthScreen>
          <AppTabs />
        </DefaultAuthScreen>
      </ThemeProvider>
    </Smartlime>
  );
}
```

`Smartlime` props:

| prop | Required | Details |
|------|:----:|------|
| `baseUrl` | ○ | Base URL of iAP |
| `imoauth` | ○ | `requestConfig` (`clientId` / `clientSecret` / `scopes` / `redirectUri` / `prompt`), `secureStore` (`storeKey` / `keychainAccessible`), `remainingTimeToRunRefresh` (milliseconds; default 360000) |
| `imseach` | △ | `{ SearchComponent: DefaultSearchUI }`. **The correct spelling is `imseach`** (not `imsearch`). If omitted, using search causes an error. Pass it even if you do not use search |
| `imtenant` / `imme` / `imsession` | × | Settings for individual providers (usually not needed) |
| `tenantId` | × | **Currently has no effect**. Do not pass it |

- `children` is a single element (`JSX.Element`). To place multiple elements, wrap them in one element
- `DefaultAuthScreen` is a minimal auth screen that shows a button labeled "認証" (a fixed Japanese label) when signed out, and when signed in, fetches the signed-in user's information and then shows `children`. Build the actual app's login screen with the `smartlime-auth` skill
- `prompt` defaults to `login` (always shows the iAP login screen). This avoids authorization errors caused by iAP session control; do not change it
- Tokens are stored in `expo-secure-store`. If refreshing in the background is required, specify `secureStore: { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }` (`import * as SecureStore from 'expo-secure-store'`)

### 5. Register the OAuth client on the iAP side

Register this app in the iAP OAuth client settings (`oauth-client-details-config`). This is work on the iAP project side and is not done in this repository. Give the user the following values.

| Item | Value |
|------|------|
| `client-id` / `client-secret` | Same values as the app's `EXPO_PUBLIC_IAP_CLIENT_ID` / `EXPO_PUBLIC_IAP_CLIENT_SECRET` |
| `authorized-grant-type` | `authorization_code` |
| `redirect-uri` | `<scheme>://redirect` (the scheme from step 2) |
| `code-challenge` | `S256` (smartlime requests authorization with PKCE S256) |
| `scopes` | Same scopes as the app's `scopes` |

- If the iAP project was created with accel, iAP skills (such as `jssp-im-oauth-generator`) can be used for the OAuth settings on the iAP side
- smartlime refreshes the access token with the refresh token. It refreshes at app startup if less than 6 minutes (`remainingTimeToRunRefresh`) remain until expiry, and also refreshes and retries once when an API returns 401 (`invalid_token`). If the refresh token has also expired, the app returns to the signed-out state

### 6. Verify that it works

```bash
npx expo-doctor
npx tsc --noEmit
```

- Right after create-expo, if you have never run `npx expo start`, `expo-env.d.ts` does not exist, so two type errors appear for `*.css` imports. Running `npx expo start` once generates it
- Verify authentication with a **development build** (`npx expo run:android` / `npx expo run:ios`, or the EAS development profile). In Expo Go, the redirect URI becomes `exp://<dev machine address>/--/redirect` and does not match the URI registered in iAP

## Common problems

| Symptom | Cause and fix |
|------|------|
| The app is not returned to after authorization, or a `redirect_uri` mismatch error | The iAP `redirect-uri` and the app's `redirectUri` do not match. Log `redirectUri` to check. Make sure you are not testing in Expo Go |
| `SearchComponent is not passed to Smartlime prop.` | `imseach` is not passed (or is spelled `imsearch`) |
| `... requires either a Context provide or an ancestor element with a ...` | A smartlime hook is used outside `Smartlime` |
| Type error between `ColorValue` and `string` in `ThemeProvider`'s `value` | Add `as ReactNavigation.Theme` from step 4 |
| The authorization screen opens but an error occurs after signing in | Check the scope, `code-challenge`, and `client-secret` settings on the iAP side |
