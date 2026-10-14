{{PROJECT_HEADER}}

## 概要

本プロジェクトは、`@intra-mart/smartlime` を使って intra-mart Accel Platform（以下 iAP）と連携する Expo（React Native）のモバイルアプリである。モバイル向けの設計・性能・iOS と Android の両対応を優先すること。

### smartlime

| パッケージ | 内容 |
|------|------|
| `@intra-mart/smartlime` | iAP と連携する SDK。OAuth 認証（`Smartlime` / `useIMOAuth`）、iAP の API 呼び出し（`useIMFetch`）、ログインユーザー（`useMe`）、導入済みモジュール（`useIMModules`）、iAP の画面の表示（`IMWebView`）、検索（`useIMSearch`）、IM-Copilot のアシスタント（`useAssistant`） |
| `@intra-mart/smartlime-ui` | smartlime を使う UI 部品。認証画面（`DefaultAuthScreen`）、検索画面（`DefaultSearchUI`）、カレンダー（`IMCalendar`） |

- smartlime 3.0.0 は Expo SDK 56 専用である。smartlime と smartlime-ui は同じバージョンに揃えること
- 公開ドキュメント（smartlime-doc）は 2.x の内容で、3.0.0 とは API が異なる。記憶やドキュメントで API を推測せず、smartlime 用スキルと `node_modules/@intra-mart/smartlime/src`（TypeScript のソースのまま配布されている）で確認すること

### iAP 側の前提

- `jp.co.intra_mart.im_smacolow` モジュールが導入されていること（smartlime の API の多くは `/api/bearer/smacolow/*` を呼ぶ）
- iAP の OAuth 認可サーバに、このアプリの OAuth クライアントが登録されていること。アプリのリダイレクト URI を登録し、アプリが要求するスコープを許可する（設定の手順は `smartlime-setup` スキル）
- IM-Copilot のアシスタントを使う場合は、IM-Copilot（`jp.co.intra_mart.im_copilot`）が導入され、アシスタントが設定されていること

## スキルの使い分け

smartlime を使う作業では、次のスキルを使うこと。

| 作業 | スキル |
|------|------|
| smartlime の導入、`Smartlime` の配置、リダイレクト URI、iAP 側の OAuth クライアントの設定 | `smartlime-setup` |
| ログイン画面・ログアウト・ログイン状態による画面の切り替え・ログインユーザーの情報 | `smartlime-auth` |
| iAP の API（IM-Workflow の REST API 等）の呼び出し | `smartlime-api` |
| iAP の画面をアプリ内に表示する（WebView） | `smartlime-webview` |
| ユーザー・組織・役職・パブリックグループ・ロールの検索と選択 | `smartlime-search` |
| iAP のカレンダー（稼働日・休日）の表示と日付の選択 | `smartlime-calendar` |
| IM-Copilot のアシスタントとのチャット | `smartlime-assistant` |
| smartlime を使うコードのテスト（Jest） | `smartlime-testing` |

Expo そのものの作業（画面遷移、UI、ネイティブ機能、SDK のアップグレード、ビルドと配布）は Expo 公式スキルを使うこと。まず `expo-overview` を読み、そこから目的のスキルを選ぶ。Claude Code では Expo のプラグイン、Codex と GitHub Copilot では `.agents/skills/` に導入されている。

Expo MCP サーバ（`https://mcp.expo.dev/mcp`）は、Expo アカウントでサインインすると使える。Claude Code は `/mcp`、Codex は `codex mcp login expo` でサインインする。GitHub Copilot はサーバの起動時にサインインを求められる。

## 共通のルール

- iAP の API は `useIMFetch` で呼び出すこと。アクセストークンを自分で取り出して `fetch` に付けないこと
- OAuth のクライアント ID・クライアントシークレットなどの接続情報をソースコードに直接書かないこと（扱い方は `smartlime-setup` スキル）
- テストがある場合は、作業を終える前にテストも実行すること

## Expo の基本

> この節は create-expo の AGENTS.md を翻訳したものである（下記「ライセンス表示」）。

### Expo は変わり続けている — 学習データを信用しないこと

Expo は SDK のリリースごとに互換性のない変更を加える。記憶している API は、名前が変わったか、移動したか、削除されている可能性が高い。Expo・EAS・React Native の API に関わるコードを書く前に、次の手順で確認すること。

1. `package.json` の `expo` パッケージのメジャーバージョンを読む
2. そのバージョンのドキュメントを取得する: `https://docs.expo.dev/versions/v<メジャーバージョン>.0.0/`
3. それ以外は https://docs.expo.dev/llms.txt を取得する。Expo の全ドキュメントの索引で、LLM が誤解しやすい点の訂正も載っている。そこから目的のページへのリンクをたどり、記憶で答えないこと

### コマンド

プロジェクトで bun を使っている場合（`bun.lock` がある場合）は、`npx` の代わりに `bunx` を使うこと。

```bash
npx expo install <package>  # パッケージの追加には必ずこれを使う（npm/yarn/pnpm/bun add は使わない）。SDK に合うバージョンが選ばれる
npx expo start              # 開発サーバを起動する
npx expo lint               # lint
npx tsc --noEmit            # 型チェック
npx expo-doctor             # 依存関係と設定の問題を診断する
npx expo install --fix      # SDK に合わないバージョンのパッケージを直す
```

作業の完了を報告する前に、lint と型チェックを実行すること。

### 画面遷移とルーティング

- 画面遷移にはすべて **Expo Router** を使うこと。ルートは `src/app/` に置く。このディレクトリのファイルはすべて画面になり、`_layout.tsx` がナビゲータを定義する。ルート以外のコード（コンポーネント・フック・ユーティリティ）は `src/app/` の外に置くこと
- `Link`、`router`、`useLocalSearchParams` は `expo-router` から import すること
- ドキュメント: https://docs.expo.dev/router/introduction.md

### EAS でのビルド

アプリのビルド・署名・ストアへの提出（`eas build`、`eas submit`）と、OTA アップデートの配信（`eas update`）は、EAS を使ってクラウドで行う。ローカルに Xcode や Android Studio は不要である。EAS CLI は、bun のプロジェクトでは `bunx eas-cli <command>`、それ以外では `npx eas-cli@latest <command>` で実行し、ドキュメントの例にある `eas` はこれに読み替えること。
ドキュメント: https://docs.expo.dev/eas/index.md

### 規則

- `ios/` と `android/` のディレクトリが無い場合、これらは自動で生成される（Continuous Native Generation）。手で作成・編集しないこと。ネイティブの動作は `app.json` と config plugin で設定する
- Expo Go に含まれるのは、Expo Go に同梱されたネイティブモジュールだけである。ネイティブコードを含むライブラリを追加した後は、開発ビルド（ローカルなら `npx expo run:ios|android`、EAS なら `eas build --profile development`）が必要になる
- サードパーティのライブラリより、Expo が推奨するモジュールを優先すること。依存を追加する前に、使えるスキルを確認すること。ドキュメント: https://docs.expo.dev/versions/latest/index.md

## ライセンス表示

「概要」の冒頭の一文と「Expo の基本」の節は、create-expo 4.0.4 の AGENTS.md（npm パッケージ `create-expo` の `template/agent-files/AGENTS.md`）を翻訳したものであり、次の条件で利用している。

```
The MIT License (MIT)

Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
