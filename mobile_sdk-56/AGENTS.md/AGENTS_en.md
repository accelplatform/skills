{{PROJECT_HEADER}}

## Overview

This project is an Expo (React Native) mobile application that integrates with intra-mart Accel Platform (iAP) using `@intra-mart/smartlime`. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

### smartlime

| Package | Contents |
|------|------|
| `@intra-mart/smartlime` | SDK for integrating with iAP. OAuth authentication (`Smartlime` / `useIMOAuth`), iAP API calls (`useIMFetch`), the signed-in user (`useMe`), installed modules (`useIMModules`), displaying iAP pages (`IMWebView`), search (`useIMSearch`), and the IM-Copilot assistant (`useAssistant`) |
| `@intra-mart/smartlime-ui` | UI components built on smartlime. Auth screen (`DefaultAuthScreen`), search screen (`DefaultSearchUI`), and calendar (`IMCalendar`) |

- smartlime 3.0.0 is for Expo SDK 56 only. Keep smartlime and smartlime-ui at the same version
- The public documentation (smartlime-doc) covers 2.x, and its APIs differ from 3.0.0. Do not guess APIs from memory or the documentation; check them in the smartlime skills and in `node_modules/@intra-mart/smartlime/src` (distributed as TypeScript source)

### Prerequisites on the iAP side

- The `jp.co.intra_mart.im_smacolow` module must be installed (most smartlime APIs call `/api/bearer/smacolow/*`)
- An OAuth client for this app must be registered on the iAP OAuth authorization server. Register the app's redirect URI and allow the scopes the app requests (see the `smartlime-setup` skill for the setup steps)
- To use the IM-Copilot assistant, IM-Copilot (`jp.co.intra_mart.im_copilot`) must be installed and an assistant must be configured

## Choosing a skill

For work that uses smartlime, use the following skills.

| Task | Skill |
|------|------|
| Installing smartlime, placing `Smartlime`, the redirect URI, and configuring the OAuth client on the iAP side | `smartlime-setup` |
| Login screen, sign-out, switching screens by sign-in state, and the signed-in user's information | `smartlime-auth` |
| Calling iAP APIs (such as the IM-Workflow REST API) | `smartlime-api` |
| Displaying iAP pages inside the app (WebView) | `smartlime-webview` |
| Searching for and selecting users, organizations, positions, public groups, and roles | `smartlime-search` |
| Displaying the iAP calendar (business days and holidays) and selecting dates | `smartlime-calendar` |
| Chatting with the IM-Copilot assistant | `smartlime-assistant` |
| Testing code that uses smartlime (Jest) | `smartlime-testing` |

For work on Expo itself (navigation, UI, native features, SDK upgrades, building and distribution), use the official Expo skills. Read `expo-overview` first and choose the skill you need from there. In Claude Code they are installed as the Expo plugin; in Codex and GitHub Copilot they are installed in `.agents/skills/`.

The Expo MCP server (`https://mcp.expo.dev/mcp`) is available after signing in with an Expo account. Sign in with `/mcp` in Claude Code and with `codex mcp login expo` in Codex. GitHub Copilot prompts you to sign in when the server starts.

## Common rules

- Call iAP APIs with `useIMFetch`. Do not extract the access token yourself and attach it to `fetch`
- Do not hard-code connection information such as the OAuth client ID and client secret in the source code (see the `smartlime-setup` skill for how to handle it)
- If there are tests, run them before finishing the task

## Expo basics

> This section is taken from create-expo's AGENTS.md (see "License notice" below).

### Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

### Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

### Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

### Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

### Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## License notice

The first sentence of "Overview" and the "Expo basics" section are taken from the AGENTS.md of create-expo 4.0.4 (`template/agent-files/AGENTS.md` in the npm package `create-expo`), and are used under the following terms.

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
