{{PROJECT_HEADER}}

## 概述

本项目是使用 `@intra-mart/smartlime` 与 intra-mart Accel Platform（以下简称 iAP）对接的 Expo（React Native）移动应用。请优先考虑面向移动端的设计、性能以及对 iOS 和 Android 的双平台兼容。

### smartlime

| 包 | 内容 |
|------|------|
| `@intra-mart/smartlime` | 与 iAP 对接的 SDK。OAuth 认证（`Smartlime` / `useIMOAuth`）、iAP API 调用（`useIMFetch`）、登录用户（`useMe`）、已安装的模块（`useIMModules`）、iAP 页面的显示（`IMWebView`）、检索（`useIMSearch`）、IM-Copilot 助手（`useAssistant`） |
| `@intra-mart/smartlime-ui` | 使用 smartlime 的 UI 组件。认证画面（`DefaultAuthScreen`）、检索画面（`DefaultSearchUI`）、日历（`IMCalendar`） |

- smartlime 3.0.0 专用于 Expo SDK 56。smartlime 与 smartlime-ui 必须使用相同的版本
- 公开文档（smartlime-doc）的内容针对 2.x，其 API 与 3.0.0 不同。不得凭记忆或文档推测 API，必须通过 smartlime 相关技能以及 `node_modules/@intra-mart/smartlime/src`（以 TypeScript 源代码形式分发）进行确认

### iAP 端的前提条件

- 已安装 `jp.co.intra_mart.im_smacolow` 模块（smartlime 的大多数 API 会调用 `/api/bearer/smacolow/*`）
- 已在 iAP 的 OAuth 授权服务器中注册本应用的 OAuth 客户端。需注册应用的重定向 URI，并允许应用所请求的范围（设置步骤参见 `smartlime-setup` 技能）
- 使用 IM-Copilot 助手时，需已安装 IM-Copilot（`jp.co.intra_mart.im_copilot`）并完成助手的设置

## 技能的选用

进行使用 smartlime 的工作时，请使用以下技能。

| 工作 | 技能 |
|------|------|
| 引入 smartlime、放置 `Smartlime`、重定向 URI、iAP 端 OAuth 客户端的设置 | `smartlime-setup` |
| 登录画面・退出登录・根据登录状态切换画面・登录用户的信息 | `smartlime-auth` |
| 调用 iAP 的 API（IM-Workflow 的 REST API 等） | `smartlime-api` |
| 在应用内显示 iAP 的页面（WebView） | `smartlime-webview` |
| 检索和选择用户・组织・职务・公共组・角色 | `smartlime-search` |
| 显示 iAP 的日历（工作日・假日）并选择日期 | `smartlime-calendar` |
| 与 IM-Copilot 助手聊天 | `smartlime-assistant` |
| 使用 smartlime 的代码的测试（Jest） | `smartlime-testing` |

Expo 本身的工作（画面跳转、UI、原生功能、SDK 升级、构建与分发）请使用 Expo 官方技能。首先阅读 `expo-overview`，再从中选择目标技能。在 Claude Code 中这些技能以 Expo 插件的形式提供，在 Codex 中则安装在 `.agents/skills/` 下。

使用 Expo 账户登录后即可使用 Expo MCP 服务器（`https://mcp.expo.dev/mcp`）。Claude Code 通过 `/mcp` 登录，Codex 通过 `codex mcp login expo` 登录。

## 通用规则

- 必须通过 `useIMFetch` 调用 iAP 的 API。不得自行取出访问令牌并附加到 `fetch` 上
- 不得在源代码中直接写入 OAuth 的客户端 ID、客户端密钥等连接信息（处理方式参见 `smartlime-setup` 技能）
- 如果存在测试，必须在结束工作前同时运行测试

## Expo 基础

> 本节翻译自 create-expo 的 AGENTS.md（参见下文“许可证声明”）。

### Expo 一直在变化 — 不要相信你的训练数据

Expo 在每次 SDK 发布时都会引入破坏性变更。你记得的 API 很可能已被重命名、移动或删除。在编写任何涉及 Expo、EAS 或 React Native API 的代码之前，请按以下步骤确认：

1. 读取 `package.json` 中 `expo` 包的主版本号
2. 获取对应版本的文档：`https://docs.expo.dev/versions/v<主版本号>.0.0/`
3. 其他内容请获取 https://docs.expo.dev/llms.txt。它是所有 Expo 文档的索引，并包含对 LLM 常见误解的更正。请沿着其中的链接找到所需的具体页面，切勿凭记忆回答

### 命令

如果项目使用 bun（存在 `bun.lock`），请使用 `bunx` 代替 `npx`。

```bash
npx expo install <package>  # 添加包时务必使用此命令（不要使用 npm/yarn/pnpm/bun add）。会解析与 SDK 兼容的版本
npx expo start              # 启动开发服务器
npx expo lint               # lint
npx tsc --noEmit            # 类型检查
npx expo-doctor             # 诊断依赖和配置问题
npx expo install --fix      # 修复与 SDK 不兼容的包版本
```

在宣告任何任务完成之前，请运行 lint 和类型检查。

### 导航与路由

- 所有导航均使用 **Expo Router**。路由位于 `src/app/` 中，该目录下的每个文件都是一个画面，`_layout.tsx` 文件定义导航器。非路由代码（组件、钩子、工具函数）请放在 `src/app/` 之外
- 从 `expo-router` 导入 `Link`、`router` 和 `useLocalSearchParams`
- 文档：https://docs.expo.dev/router/introduction.md

### 使用 EAS 构建

使用 EAS 在云端构建、签名并向应用商店提交应用（`eas build`、`eas submit`），以及发布 OTA 更新（`eas update`）。无需在本地安装 Xcode 或 Android Studio。在 bun 项目中以 `bunx eas-cli <command>`、其他项目中以 `npx eas-cli@latest <command>` 的形式运行 EAS CLI，并以此替换文档示例中单独出现的 `eas`。
文档：https://docs.expo.dev/eas/index.md

### 规则

- 如果 `ios/` 和 `android/` 目录不存在，它们会被自动生成（Continuous Native Generation）。切勿手动创建或编辑这些目录。原生行为请通过 `app.json` 和 config plugin 进行配置
- Expo Go 仅包含其内置的原生模块。添加含有原生代码的库之后，应用需要开发构建（development build）：本地使用 `npx expo run:ios|android`，或使用 `eas build --profile development`
- 优先使用 Expo 推荐的模块，而非第三方库。添加依赖之前，请先检查可用的技能。文档：https://docs.expo.dev/versions/latest/index.md

## 许可证声明

“概述”开头的第一句话以及“Expo 基础”一节翻译自 create-expo 4.0.4 的 AGENTS.md（npm 包 `create-expo` 中的 `template/agent-files/AGENTS.md`），并依据以下条款使用。

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
