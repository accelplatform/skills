---
name: smartlime-auth
description: smartlime を使ったアプリのログインとログアウトを実装する。ログイン状態（useAuthState）による画面の切り替え、Expo Router の Stack.Protected を使った認証ゲート、iAP へのログイン（useStartAuth）、ログアウトの後始末、ログインユーザーの情報（useMe / useMeState）、導入済みモジュール（useIMModules）、トークンの更新と失効の扱いを扱う。「ログイン画面」「ログアウト」「未ログイン時の画面」「ログインユーザーの情報」「ロールで表示を変える」「トークンの有効期限」と言及されたときに使用。初期設定（Smartlime の配置・OAuth クライアント）は smartlime-setup を先に済ませること。
---

# smartlime のログインとログアウト

## 目的

smartlime の OAuth 認証の状態に合わせて画面を切り替え、iAP へのログイン・ログアウト・ログインユーザーの情報の取得を実装する。
`Smartlime` がルートレイアウトに配置済みであること（`smartlime-setup`）。

## ログイン状態

`useAuthState()` が現在の状態を返し、状態が変わると再レンダリングされる。

| 状態 | 意味 |
|------|------|
| `initializing` | 起動時に保存済みのトークンを確認している |
| `unauthorized` | 未ログイン（トークンが無い、接続先が変わった、更新に失敗した） |
| `authorized` | ログイン済み |

- 起動時に保存済みのトークンがあれば、ログイン画面を経ずに `authorized` になる。このときログインユーザーの情報は**まだ取得されていない**
- リフレッシュトークンが失効していると、API の呼び出し時に `unauthorized` へ戻る（`smartlime-api`）

## 認証ゲート（Expo Router）

ルートレイアウトで、ログイン状態に応じて表示するルートを `Stack.Protected` で切り替える。ログイン後に画面を手で遷移させる必要はない。

```
src/app/
├── _layout.tsx        ← Smartlime と RootNavigator
├── sign-in.tsx        ← 未ログインのときだけ表示
└── (app)/
    ├── _layout.tsx    ← ログイン後の画面（タブ等）
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

  // ログインのたび（起動時のトークン復元を含む）にログインユーザーの情報を取り直す
  useEffect(() => {
    if (authState !== 'authorized') {
      setMeReady(false);
      return;
    }
    let cancelled = false;
    request().then((result) => {
      if (cancelled) return;
      if (result.status === 'success') setMeReady(true);
      else destroy(); // 情報が取れないトークンは使えないため、未ログインに戻す
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
  // smartlime-ui の @react-navigation/native と expo-router の型の違いを合わせる（smartlime-setup 参照）
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

- ログインユーザーの情報（`useMeState()`）は、ログアウトしても前のユーザーの値が残る。上のように**ログインのたびに `request()` で取り直し、取得が終わるまでログイン後の画面を表示しない**こと
- 試作など画面を作り込まない場合は、smartlime-ui の `DefaultAuthScreen` で `children` を囲むだけでもよい（未ログインなら「認証」ボタン、ログイン後はユーザー情報を取得してから `children` を表示する）。ボタンの文言・デザインは変えられない

## ログイン画面

`useStartAuth()` が返す関数で、iAP のログイン画面をアプリ内ブラウザで開く。

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
        case 'success': // 画面はルートレイアウトの Stack.Protected が切り替える
        case 'cancel':
        case 'dismiss':
          return;
        case 'exception':
          console.error(result.exceptionDetail);
          break;
        default:
          console.warn(result.type, result.detail);
      }
      Alert.alert('ログインできませんでした', 'iAP の接続先と OAuth クライアントの設定を確認してください。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {busy ? <ActivityIndicator /> : <Button title="iAP にログイン" onPress={onPress} />}
    </View>
  );
}
```

`startAuth()` は例外を投げず、結果を `type` で返す。

| `type` | 意味 |
|------|------|
| `success` | ログインした。トークンは保存済みで、状態は `authorized` になっている |
| `cancel` / `dismiss` | ユーザーがブラウザを閉じた。エラーとして扱わない |
| `error` / `locked` / `opened` | 認可が失敗した。`detail` に expo-auth-session の結果が入る |
| `exception` | トークンの取得などで例外が起きた。`exceptionDetail` に原因が入る |

- 接続先をユーザーが入力するアプリでは、ログインの前に接続先が正しいかを確かめると親切である（例: `${baseUrl}/oauth/authorize` が 404 なら接続先の誤り）。この確認には `useIMFetch` ではなく素の `fetch` を使う（ログイン前はトークンが無い）

## ログアウト

smartlime には「ログアウト」という 1 つの API は無い。次の順で後始末する。

```ts
// src/hooks/use-logout.ts
import { useIMModules, useIMOAuth, useSession } from '@intra-mart/smartlime';
import { useCallback } from 'react';

export function useLogout() {
  const session = useSession();
  const modules = useIMModules();
  const oauth = useIMOAuth();

  return useCallback(async () => {
    // iAP の Cookie セッション（useSession を使った場合）の破棄にはアクセストークンが要るため、先に行う
    await session.destroy();
    await modules.destroy(); // 導入済みモジュールのキャッシュ（AsyncStorage）を消す
    await oauth.destroy(); // 端末のトークンを消し、状態を unauthorized にする
  }, [session, modules, oauth]);
}
```

- `oauth.destroy()` は端末に保存したトークンを消すだけで、iAP 側のトークンを無効にはしない
- アプリが独自に保存したデータ（キャッシュ、選択中の項目など）があれば、ここで一緒に消すこと
- `destroy()` で状態が `unauthorized` になると、認証ゲートがログイン画面へ切り替える

## ログインユーザーの情報

| フック | 用途 |
|------|------|
| `useMeState()` | ログインユーザーの情報（未取得なら `null`）。取得・更新されると再レンダリングされる。**画面の表示にはこちらを使う** |
| `useMe()` | `request()`（取得）・`update()`（取り直し。`request` と同じ）・`getMe()`（その時点の値。再レンダリングされない） |

- 型 `Me` は公開されていない。`lib/...` や `src/...` を深く import せず、次のように導くこと

  ```ts
  import { useMeState } from '@intra-mart/smartlime';

  export type Me = NonNullable<ReturnType<typeof useMeState>>;
  ```

- 主な項目: `userCd`、`userName`、`locale`、`timeZone`、`calendarId`、`roleIds`（ロール ID の配列）、`allDepartments`（所属組織）、`allPosts`（役職）、`publicGroupList`、`emailAddress1`、`profileImage`。項目の一覧は `node_modules/@intra-mart/smartlime/src/packages/Me/type.ts` を見ること
- ロールによる表示の切り替え: `me.roleIds.includes('<ロール ID>')`。ロール ID は iAP 側の設定による。推測で書かず、ユーザーに確認すること
- iAP 側でプロフィールが変わった場合は `update()` で取り直す

## 導入済みモジュール

`useIMModules()` で、iAP に導入されているモジュールを確認できる（IM-Copilot が使えるか、など）。

```ts
import { useIMModules, useIMModulesState } from '@intra-mart/smartlime';

const { request } = useIMModules();
await request(); // 未取得なら iAP に問い合わせ、結果を AsyncStorage に保存する

const modules = useIMModulesState(); // 取得後に再レンダリングされる
const copilotEnabled = modules?.['jp.co.intra_mart.im_copilot']?.enabled ?? false;
```

- 結果は接続先ごとに AsyncStorage に保存され、`destroy()` するまで iAP に問い合わせ直さない。モジュールの構成が変わった場合に備えて、ログアウト時に `destroy()` すること（上記）
- iAP が問い合わせ先（`/api/bearer/smacolow/modules`）を持たない場合（404）は、すべてのモジュールが無効として扱われる
- `request()` は、問い合わせが 200・404 以外で失敗すると例外を投げる

## トークンの更新と失効

- アクセストークンは smartlime が更新する（起動時に期限が近ければ更新、API が 401 `invalid_token` を返したら更新して 1 回だけ再送）。アプリでトークンを扱う必要はない
- リフレッシュトークンも失効していると、状態が `unauthorized` に戻る（認証ゲートがログイン画面へ切り替える）。ユーザーにログインし直す理由を伝えたい場合は、自分でログアウトしたかどうかを記録しておき、自分のログアウト以外で `authorized` → `unauthorized` になったときに「有効期限が切れました」と表示する
- 起動時のトークンの確認で起きた例外は、`useAuthInitError((error) => { ... })` で受け取れる
- アクセストークンそのものが必要な場合（smartlime を通さない画像の読み込みなど）は、`useIMOAuth().getTokenAsync()` を使う（期限が近ければ更新してから返す）。トークンをログや画面に出さないこと

## 確認

- 起動 → ログイン → アプリを終了して再起動（ログイン済みのまま） → ログアウト → 別のユーザーでログイン、の順に操作し、前のユーザーの情報が表示されないこと
- `npx tsc --noEmit` が通ること。テストは `smartlime-testing` を参照
