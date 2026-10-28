---
name: smartlime-setup
description: Expo アプリに @intra-mart/smartlime と @intra-mart/smartlime-ui を導入し、intra-mart Accel Platform（iAP）と OAuth で接続する初期設定を行う。パッケージの追加、app.json の scheme、リダイレクト URI、接続情報（ベース URL・クライアント ID・クライアントシークレット・スコープ）の扱い、ルートレイアウトへの Smartlime の配置、iAP 側の OAuth クライアントの登録内容を扱う。「smartlime を導入」「iAP と接続する設定」「OAuth クライアントを登録」「リダイレクト URI」「Smartlime を配置」と言及されたとき、または smartlime を使うコードをプロジェクトで初めて書くときに使用。ログイン画面の作り方は smartlime-auth、API の呼び出しは smartlime-api を使うこと。
---

# smartlime の導入と iAP への接続設定

## 目的

Expo のプロジェクトに smartlime を導入し、アプリから iAP へ OAuth（認可コード + PKCE）でログインできる状態にする。
このスキルの完了後、ログイン画面は `smartlime-auth`、iAP の API の呼び出しは `smartlime-api` で実装する。

## 前提

| 項目 | 内容 |
|------|------|
| Expo SDK | **56**。smartlime 3.0.0 は SDK 56 専用（peerDependencies: `expo ^56.0.17`、`react 19.2.3`） |
| Node.js | 22 以上 |
| iAP | `jp.co.intra_mart.im_smacolow` モジュールが導入されていること。OAuth の認可サーバとして使えること |

> **SDK を上げないこと**: `npx expo-doctor` が SDK 56 の既知の不具合（Hermes V1 のメモリ）を理由に SDK 57 への更新を勧めることがある。smartlime が SDK 57 に対応するまでは SDK 56 のまま使い、更新はユーザーの判断に任せること。

## 手順

### 1. パッケージを追加する

```bash
npx expo install @intra-mart/smartlime@3.0.0 @intra-mart/smartlime-ui@3.0.0 expo-auth-session
```

- smartlime と smartlime-ui は**同じバージョンに固定**する（範囲指定にしない）
- smartlime が使うネイティブモジュール（`expo-secure-store`、`react-native-webview`、`expo-camera` など）は、smartlime の依存として自動で入る。個別に追加する必要はない
- `expo-auth-session` はリダイレクト URI を作るためにアプリのコードから直接 import するので、アプリの依存に加える
- 追加後に `npx expo-doctor` を実行し、上記の SDK 57 の助言以外に問題が出ないことを確認する

**pnpm を使う場合**は、パッケージを追加する前に `pnpm-workspace.yaml` に次の設定を書き（ファイルが無ければ作る）、`pnpm install` を実行して配置し直す。

```yaml
nodeLinker: hoisted
allowBuilds:
  react-native-elements: false
```

- `nodeLinker: hoisted`: pnpm の既定の配置（パッケージごとに依存を分ける）では、smartlime-ui の依存が持ち込む古い `@types/react-native` が使われ、smartlime のソースで型エラーになる。Jest の `transformIgnorePatterns`（`smartlime-testing`）も `node_modules/.pnpm/` 配下のパスに合わず、テストが動かない
- `allowBuilds`: pnpm 11 は、承認していない postinstall があるとパッケージの追加を終了コード 1 で終える。smartlime-ui の依存の `react-native-elements` の postinstall は寄付の案内を表示するだけなので、`false`（実行しない）にする

### 2. app.json に scheme を設定する

OAuth のリダイレクト先として、アプリ固有の URL scheme を使う。create-expo が設定した `expo.scheme` を、他のアプリと重ならない名前（英小文字・数字・`-`・`.`・`+`）にしておく。

```json
{
  "expo": {
    "scheme": "com.example.myapp"
  }
}
```

scheme を変えると、iAP 側に登録したリダイレクト URI も変える必要がある。

### 3. 接続情報とリダイレクト URI を 1 か所にまとめる

`src/config/iap.ts` を作る（パスは任意。`src/app/` の外に置くこと）。

```ts
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';

const getScheme = () => {
  const scheme = Constants.expoConfig?.scheme;
  const value = Array.isArray(scheme) ? scheme[0] : scheme;
  if (!value) throw new Error('app.json の expo.scheme が設定されていません');
  return value;
};

const scheme = getScheme();

// 開発ビルドとリリースビルドでは `<scheme>://redirect` になる。
// native を指定しないと、開発サーバのアドレスを含む URI になることがある。
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

接続情報の扱い:

- **ソースコードに直接書かないこと**。ローカルでは `.env.local`（create-expo の `.gitignore` で除外済み）に書く

  ```
  EXPO_PUBLIC_IAP_BASE_URL=https://iap.example.com/imart
  EXPO_PUBLIC_IAP_CLIENT_ID=...
  EXPO_PUBLIC_IAP_CLIENT_SECRET=...
  ```

- EAS でビルドする場合は、同じ名前の変数を EAS の環境変数に登録する
- `EXPO_PUBLIC_` の値はアプリのバンドルに埋め込まれる。クライアントシークレットは配布したアプリから取り出せる前提で扱い、OAuth クライアントに許可するスコープを必要最小限にすること
- `baseUrl` は iAP のコンテキストパスまで（例: `https://iap.example.com/imart`）。末尾の `/` は付けない
- スコープは、アプリが呼ぶ API に必要なものに絞ってよい。上の 6 つは smartlime のサンプルアプリが使っている組み合わせである
- 接続先をユーザーが画面で入力する（テナントごとに iAP が異なる）アプリでは、`baseUrl` を AsyncStorage 等に保存して `Smartlime` に渡す。保存済みのトークンは `baseUrl` と組で保存されるため、`baseUrl` が変わると未ログインの状態に戻る

### 4. ルートレイアウトに Smartlime を置く

`src/app/_layout.tsx` で、画面全体を `Smartlime` で囲む。`Smartlime` は内部で `IMTenant` → `IMOAuth` → `IMSession` → `IMMe` → `IMSearch` を順に入れ子にするプロバイダで、smartlime のフックはすべてこの内側でしか使えない。

create-expo のテンプレート（SDK 56）のレイアウトに組み込む例:

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

// レンダリングのたびに作り直さないよう、コンポーネントの外で定義する
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
  // smartlime-ui が依存する @react-navigation/native と expo-router が
  // ReactNavigation.Theme をそれぞれ拡張しているため、型を合わせる
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

`Smartlime` の props:

| prop | 必須 | 内容 |
|------|:----:|------|
| `baseUrl` | ○ | iAP のベース URL |
| `imoauth` | ○ | `requestConfig`（`clientId` / `clientSecret` / `scopes` / `redirectUri` / `prompt`）、`secureStore`（`storeKey` / `keychainAccessible`）、`remainingTimeToRunRefresh`（ミリ秒。既定 360000） |
| `imseach` | △ | `{ SearchComponent: DefaultSearchUI }`。**綴りは `imseach` が正しい**（`imsearch` ではない）。省略すると、検索を使ったときにエラーになる。検索を使わなくても渡しておくこと |
| `imtenant` / `imme` / `imsession` | × | 個別のプロバイダの設定（通常は不要） |
| `tenantId` | × | **現在は機能しない**。渡さないこと |

- `children` は要素 1 つ（`JSX.Element`）。複数並べる場合は 1 つの要素で囲む
- `DefaultAuthScreen` は、未ログインなら「認証」ボタン、ログイン済みならログインユーザーの情報を取得してから `children` を表示する最小の認証画面である。実際のアプリのログイン画面は `smartlime-auth` スキルで作る
- `prompt` は既定で `login`（毎回 iAP のログイン画面を出す）。iAP のセッション制御による認可エラーを避けるためで、変えないこと
- トークンは `expo-secure-store` に保存される。バックグラウンドでの更新が必要なら `secureStore: { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }` を指定する（`import * as SecureStore from 'expo-secure-store'`）

### 5. iAP 側に OAuth クライアントを登録する

iAP の OAuth クライアントの設定（`oauth-client-details-config`）に、このアプリを登録する。iAP のプロジェクト側の作業であり、このリポジトリでは行わない。ユーザーに次の値を伝えること。

| 項目 | 値 |
|------|------|
| `client-id` / `client-secret` | アプリの `EXPO_PUBLIC_IAP_CLIENT_ID` / `EXPO_PUBLIC_IAP_CLIENT_SECRET` と同じ値 |
| `authorized-grant-type` | `authorization_code` |
| `redirect-uri` | `<scheme>://redirect`（手順 2 の scheme） |
| `code-challenge` | `S256`（smartlime は PKCE の S256 で認可を要求する） |
| `scopes` | アプリの `scopes` と同じスコープ |

- iAP のプロジェクトが accel で作られている場合、iAP 側の OAuth の設定には iAP 用のスキル（`jssp-im-oauth-generator` など）が使える
- アクセストークンは smartlime がリフレッシュトークンで更新する。アプリの起動時に有効期限まで 6 分（`remainingTimeToRunRefresh`）を切っていれば更新し、API が 401（`invalid_token`）を返したときも更新して 1 回だけ再送する。リフレッシュトークンも失効していると未ログインの状態に戻る

### 6. 動作を確認する

```bash
npx expo-doctor
npx tsc --noEmit
```

- create-expo 直後で一度も `npx expo start` を実行していないと、`expo-env.d.ts` が無いため `*.css` の import で型エラーが 2 件出る。`npx expo start` を一度実行すると生成される
- 認証は**開発ビルド**で確認すること（`npx expo run:android` / `npx expo run:ios`、または EAS の development プロファイル）。Expo Go ではリダイレクト URI が `exp://<開発機のアドレス>/--/redirect` になり、iAP に登録した URI と一致しない

## よくある問題

| 症状 | 原因と対処 |
|------|------|
| 認可後にアプリに戻らない、`redirect_uri` の不一致エラー | iAP の `redirect-uri` とアプリの `redirectUri` が一致していない。`redirectUri` をログに出して確認する。Expo Go で試していないか確認する |
| `SearchComponent is not passed to Smartlime prop.` | `imseach` を渡していない（または `imsearch` と綴っている） |
| `... requires either a Context provide or an ancestor element with a ...` | `Smartlime` の外で smartlime のフックを使っている |
| `ThemeProvider` の `value` で `ColorValue` と `string` の型エラー | 手順 4 の `as ReactNavigation.Theme` を付ける |
| 認可画面は開くがログイン後にエラーになる | iAP 側のスコープ・`code-challenge`・`client-secret` の設定を確認する |
