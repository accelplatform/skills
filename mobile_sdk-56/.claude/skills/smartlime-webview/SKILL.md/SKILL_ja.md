---
name: smartlime-webview
description: smartlime の IMWebView で intra-mart Accel Platform（iAP）の画面をアプリ内に表示する。OAuth のトークンから iAP の Web セッションを作る仕組み、ログイン直後のセッションの作り直し（forceLogin）、URL を変えたときの作り直し（key）、表示前のアクセストークンの更新（getTokenAsync）、iAP の画面の検索ダイアログをアプリの検索画面に置き換える useHackSearchUI、ファイルのダウンロードに使う Cookie（useSession / makeCookie）、iAP のヘッダーを隠す表示を扱う。「iAP の画面を表示」「WebView」「IMWebView」「ワークフローの申請画面をアプリで開く」「WebView でダウンロード」と言及されたときに使用。API でデータを取得する場合は smartlime-api を使うこと。
---

# IMWebView で iAP の画面を表示する

## 目的

ログイン済みのユーザーのまま、iAP の画面（ワークフローの申請・処理画面、ポータル、メニューの各画面など）をアプリ内に表示する。
ネイティブの画面で作れるものは `smartlime-api` で API を呼んで作り、iAP の画面をそのまま使いたい場合に `IMWebView` を使う。

## IMWebView の動作

`IMWebView` は `react-native-webview` の `WebView` を包んだ部品で、表示の前に次の処理を自動で行う。

1. 導入済みモジュールを取得する（未取得の場合）
2. WebView に iAP のセッションがあるか確かめる。無ければ（または `forceLogin` のときは）ログアウトしてから、アクセストークンで iAP の Web セッションを作る
3. `source.uri` の画面へ移る。準備中はインジケータを表示する

注意点:

- `source.uri` は**最初に渡した値だけが使われる**。表示する URL を変えるときは `key` に URL を渡して作り直すこと
- `source.uri` は絶対 URL。`join(useIMBaseUrl(), path)` で作る
- `onShouldStartLoadWithRequest` は使えない（セッションの確立に使われている）
- `onLoad` / `onLoadEnd` / `onMessage` などは、目的の画面に移ってから呼ばれる
- `allowsInlineMediaPlayback`・`allowsPictureInPictureMediaPlayback`・`mediaPlaybackRequiresUserAction`・`dataDetectorTypes` は最初の値だけが使われる
- WebView の Cookie はアプリの他の通信と共有されない（`sharedCookiesEnabled: false`）
- Web 版（`expo start --web`）では使えない

## 表示する部品

```tsx
// src/components/iap-web-view.tsx
import { IMWebView, join, useHackSearchUI, useIMBaseUrl, useIMOAuth } from '@intra-mart/smartlime';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';
import type { WebViewMessageEvent } from 'react-native-webview';

import { consumeFreshLogin } from '@/lib/web-session';

interface Props {
  /** iAP のコンテキストパスからの相対パス（例: '/home'） */
  path: string;
}

export function IapWebView({ path }: Props) {
  const uri = join(useIMBaseUrl(), path);
  const [forceLogin] = useState(consumeFreshLogin);
  // iAP の画面の検索ダイアログを、アプリの検索画面（DefaultSearchUI）に置き換える
  const hackSearch = useHackSearchUI((error) => console.warn(error));
  const { getTokenAsync } = useIMOAuth();
  const [tokenReady, setTokenReady] = useState(false);

  // IMWebView は描画した時点のアクセストークンを、期限を確かめずに使う。期限が近ければ先に更新しておく
  useEffect(() => {
    let cancelled = false;
    getTokenAsync()
      .then(() => {
        if (!cancelled) setTokenReady(true);
      })
      // 更新に失敗すると smartlime が未ログインの状態に戻し、認証ゲートがログイン画面へ切り替える
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // 表示のたびに 1 回だけ確かめる
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMessage = (event: WebViewMessageEvent) => {
    hackSearch.onMessage(event); // 独自の処理より先に呼ぶ
    // 独自のメッセージ処理があればここに書く
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
        Alert.alert('iAP の画面を開けませんでした');
      }}
      style={styles.webview}
    />
  );
}

const styles = StyleSheet.create({ webview: { flex: 1 } });
```

- **アクセストークンを更新してから `IMWebView` を描画する**。`IMWebView` は描画した時点のアクセストークンで iAP の Web セッションを作り、期限切れでも更新しない。API を呼ばないまま期限（iAP の既定は 1 時間）が過ぎた後に開くと、セッションを作れずに `onSessionCreationError` になり、画面を表示できない。`useIMOAuth().getTokenAsync()` は、期限が近いか切れていれば更新してから返す
- `react-native-webview` の型や部品をアプリのコードから直接使う場合は、`npx expo install react-native-webview` でアプリの依存に加える
- `ref` は `hackSearch.ref` を渡す（検索の結果を WebView に返すのに使われる）。WebView を自分でも操作したい場合も、この `ref` を使う
- 検索ダイアログの置き換えには、`Smartlime` に `imseach={{ SearchComponent: DefaultSearchUI }}` を渡してあること（`smartlime-setup`）
- `useHackSearchUI` のエラーの引数は、ユーザーが検索を取り消した場合も呼ばれる。取り消し（`type: 'cancel'`）ではエラーを表示しないこと

### ログイン直後はセッションを作り直す

WebView の Cookie は端末に残るため、別のユーザーでログインし直すと、前のユーザーの iAP のセッションが使われることがある。ログイン直後の最初の `IMWebView` だけ `forceLogin` を `true` にする。

```ts
// src/lib/web-session.ts
// ログインの直後かどうか。直後の最初の IMWebView では iAP の Web セッションを作り直す
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

認証ゲート（`smartlime-auth` の `RootNavigator`）で、ログインユーザーの情報を取得できたときに `markLoggedIn()` を呼ぶ。

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

開く側: `router.push({ pathname: '/iap-page', params: { path: '/home', title: 'ホーム' } })`

- 表示する画面のパスは iAP 側の構成による（ワークフローの画面のパスやパラメータなど）。推測で書かず、ユーザーに確認すること
- iAP のヘッダーやメニューを隠してアプリの画面に馴染ませたい場合は、URL のクエリに `imui-theme-builder-module=headonly` を付ける

## よく使う追加の処理

| やりたいこと | 方法 |
|------|------|
| 画面の操作が終わったら閉じる | `onNavigationStateChange` で `event.url` を見て、完了後の画面の URL に移ったら `router.back()`。同時に一覧を取り直す |
| Android の戻るボタンで WebView 内を戻る | `onNavigationStateChange` の `canGoBack` を記録し、`BackHandler` で `ref.current?.goBack()` を呼ぶ |
| 外部サイトへのリンクを端末のブラウザで開く | 注入した JavaScript でリンクの押下を `postMessage` で知らせ、アプリ側で `expo-web-browser` や `Linking.openURL` で開く |
| ファイルのダウンロード | WebView 内のダウンロードは動かないことが多い。リンクの URL を受け取り、アプリ側で Cookie を付けてダウンロードする（下記） |

### Cookie を付けて iAP からダウンロードする

`useSession()` は、アクセストークンから iAP の Cookie セッションを作って返す。ダウンロードの要求に Cookie と `X-Intramart-Session: keep` を付ける。

```ts
import { makeCookie, useSession } from '@intra-mart/smartlime';
import { useCallback } from 'react';

export function useIapCookieHeaders() {
  const { getSessionAsync } = useSession();
  return useCallback(async () => {
    const { cookies } = await getSessionAsync(); // 無ければ作る。失敗すると例外
    return {
      Cookie: makeCookie(cookies ?? []),
      'X-Intramart-Session': 'keep',
    };
  }, [getSessionAsync]);
}
```

- ダウンロードと保存・共有は `expo-file-system` と `expo-sharing` で行う。API は SDK ごとに変わるため、SDK 56 のドキュメント（`https://docs.expo.dev/versions/v56.0.0/sdk/filesystem/`）で確認すること
- ログアウト時は `useSession().destroy()` でこのセッションを破棄する（`smartlime-auth` のログアウトの手順）

## 確認

- API を呼ばないままアクセストークンの期限（iAP の既定は 1 時間）を過ぎてから iAP の画面を開き、表示できること
- ログイン直後・アプリの再起動後・別ユーザーでのログイン後に iAP の画面を開き、正しいユーザーで表示されること
- iAP の画面の検索ダイアログ（ユーザー選択など）を開き、アプリの検索画面が出て、選択結果が iAP の画面に反映されること
