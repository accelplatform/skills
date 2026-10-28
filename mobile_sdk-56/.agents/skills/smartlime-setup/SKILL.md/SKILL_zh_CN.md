---
name: smartlime-setup
description: 在 Expo 应用中引入 @intra-mart/smartlime 和 @intra-mart/smartlime-ui，并完成通过 OAuth 连接 intra-mart Accel Platform（iAP）的初始设置。涵盖包的添加、app.json 的 scheme、重定向 URI、连接信息（基础 URL・客户端 ID・客户端密钥・范围）的处理、在根布局中放置 Smartlime，以及 iAP 端 OAuth 客户端的注册内容。当提及「引入 smartlime」「连接 iAP 的设置」「注册 OAuth 客户端」「重定向 URI」「放置 Smartlime」时，或在项目中首次编写使用 smartlime 的代码时使用。登录画面的制作请使用 smartlime-auth，API 调用请使用 smartlime-api。
---

# smartlime 的引入与 iAP 连接设置

## 目的

在 Expo 项目中引入 smartlime，使应用能够通过 OAuth（授权码 + PKCE）登录 iAP。
完成本技能后，登录画面使用 `smartlime-auth` 实现，iAP API 的调用使用 `smartlime-api` 实现。

## 前提条件

| 项目 | 内容 |
|------|------|
| Expo SDK | **56**。smartlime 3.0.0 专用于 SDK 56（peerDependencies：`expo ^56.0.17`、`react 19.2.3`） |
| Node.js | 22 及以上 |
| iAP | 已安装 `jp.co.intra_mart.im_smacolow` 模块，并可用作 OAuth 授权服务器 |

> **不要升级 SDK**：`npx expo-doctor` 可能会以 SDK 56 的已知问题（Hermes V1 的内存）为由建议升级到 SDK 57。在 smartlime 支持 SDK 57 之前请继续使用 SDK 56，是否升级交由用户判断。

## 步骤

### 1. 添加包

```bash
npx expo install @intra-mart/smartlime@3.0.0 @intra-mart/smartlime-ui@3.0.0 expo-auth-session
```

- smartlime 与 smartlime-ui 必须**固定为相同版本**（不使用范围指定）
- smartlime 使用的原生模块（`expo-secure-store`、`react-native-webview`、`expo-camera` 等）会作为 smartlime 的依赖自动安装，无需单独添加
- `expo-auth-session` 需要在应用代码中直接 import 以生成重定向 URI，因此应加入应用的依赖
- 添加后运行 `npx expo-doctor`，确认除上述 SDK 57 的建议外没有其他问题

**使用 pnpm 时**，请在添加包之前，在 `pnpm-workspace.yaml` 中写入以下设置（如果文件不存在则新建），然后运行 `pnpm install` 重新布置 `node_modules`。

```yaml
nodeLinker: hoisted
allowBuilds:
  react-native-elements: false
```

- `nodeLinker: hoisted`：在 pnpm 的默认布局（按包隔离依赖）下，会使用 smartlime-ui 的依赖带入的旧版 `@types/react-native`，导致 smartlime 的源码出现类型错误。Jest 的 `transformIgnorePatterns`（`smartlime-testing`）也无法匹配 `node_modules/.pnpm/` 下的路径，测试无法运行
- `allowBuilds`：pnpm 11 在存在未批准的 postinstall 时，会以退出码 1 结束包的添加。smartlime-ui 的依赖 `react-native-elements` 的 postinstall 只是显示捐赠提示，因此设为 `false`（不执行）

### 2. 在 app.json 中设置 scheme

使用应用专属的 URL scheme 作为 OAuth 的重定向目标。将 create-expo 设置的 `expo.scheme` 改为不与其他应用重复的名称（小写英文字母・数字・`-`・`.`・`+`）。

```json
{
  "expo": {
    "scheme": "com.example.myapp"
  }
}
```

更改 scheme 后，iAP 端注册的重定向 URI 也需要相应更改。

### 3. 将连接信息和重定向 URI 集中到一处

创建 `src/config/iap.ts`（路径任意，但必须放在 `src/app/` 之外）。

```ts
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';

const getScheme = () => {
  const scheme = Constants.expoConfig?.scheme;
  const value = Array.isArray(scheme) ? scheme[0] : scheme;
  if (!value) throw new Error('app.json 中未设置 expo.scheme');
  return value;
};

const scheme = getScheme();

// 在开发构建和发布构建中为 `<scheme>://redirect`。
// 如果不指定 native，URI 有可能包含开发服务器的地址。
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

连接信息的处理：

- **不得直接写在源代码中**。在本地写入 `.env.local`（已由 create-expo 的 `.gitignore` 排除）

  ```
  EXPO_PUBLIC_IAP_BASE_URL=https://iap.example.com/imart
  EXPO_PUBLIC_IAP_CLIENT_ID=...
  EXPO_PUBLIC_IAP_CLIENT_SECRET=...
  ```

- 使用 EAS 构建时，将同名变量注册到 EAS 的环境变量中
- `EXPO_PUBLIC_` 的值会被嵌入应用的 bundle 中。应假定客户端密钥可以从已分发的应用中提取，并将 OAuth 客户端允许的范围限制在必要的最小限度
- `baseUrl` 写到 iAP 的上下文路径为止（例：`https://iap.example.com/imart`），末尾不加 `/`
- 范围可以缩减为应用所调用的 API 必需的范围。上面的 6 个是 smartlime 示例应用所使用的组合
- 对于由用户在画面上输入连接地址（每个租户的 iAP 不同）的应用，将 `baseUrl` 保存到 AsyncStorage 等处后传给 `Smartlime`。已保存的令牌与 `baseUrl` 成对保存，因此 `baseUrl` 变更后会回到未登录状态

### 4. 在根布局中放置 Smartlime

在 `src/app/_layout.tsx` 中用 `Smartlime` 包裹整个画面。`Smartlime` 是内部按顺序嵌套 `IMTenant` → `IMOAuth` → `IMSession` → `IMMe` → `IMSearch` 的提供器，smartlime 的所有钩子都只能在其内部使用。

嵌入 create-expo 模板（SDK 56）布局的示例：

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

// 为避免每次渲染时重新创建，在组件外部定义
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
  // smartlime-ui 所依赖的 @react-navigation/native 和 expo-router
  // 各自扩展了 ReactNavigation.Theme，因此需要统一类型
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

`Smartlime` 的 props：

| prop | 必需 | 内容 |
|------|:----:|------|
| `baseUrl` | ○ | iAP 的基础 URL |
| `imoauth` | ○ | `requestConfig`（`clientId` / `clientSecret` / `scopes` / `redirectUri` / `prompt`）、`secureStore`（`storeKey` / `keychainAccessible`）、`remainingTimeToRunRefresh`（毫秒。默认 360000） |
| `imseach` | △ | `{ SearchComponent: DefaultSearchUI }`。**正确拼写是 `imseach`**（不是 `imsearch`）。省略时，使用检索功能会报错。即使不使用检索也应传入 |
| `imtenant` / `imme` / `imsession` | × | 各个提供器的设置（通常不需要） |
| `tenantId` | × | **目前不起作用**。不要传入 |

- `children` 只能是 1 个元素（`JSX.Element`）。需要并列多个元素时，用 1 个元素包裹
- `DefaultAuthScreen` 是最简单的认证画面：未登录时显示“認証”按钮（固定的日文文字），已登录时先获取登录用户的信息再显示 `children`。实际应用的登录画面请使用 `smartlime-auth` 技能制作
- `prompt` 默认为 `login`（每次都显示 iAP 的登录画面）。这是为了避免 iAP 会话控制导致的授权错误，请勿更改
- 令牌保存在 `expo-secure-store` 中。如需在后台刷新，请指定 `secureStore: { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }`（`import * as SecureStore from 'expo-secure-store'`）

### 5. 在 iAP 端注册 OAuth 客户端

在 iAP 的 OAuth 客户端设置（`oauth-client-details-config`）中注册本应用。这是 iAP 项目端的工作，不在本仓库中进行。请将以下值告知用户。

| 项目 | 值 |
|------|------|
| `client-id` / `client-secret` | 与应用的 `EXPO_PUBLIC_IAP_CLIENT_ID` / `EXPO_PUBLIC_IAP_CLIENT_SECRET` 相同的值 |
| `authorized-grant-type` | `authorization_code` |
| `redirect-uri` | `<scheme>://redirect`（步骤 2 的 scheme） |
| `code-challenge` | `S256`（smartlime 使用 PKCE 的 S256 请求授权） |
| `scopes` | 与应用的 `scopes` 相同的范围 |

- 如果 iAP 项目是用 accel 创建的，iAP 端的 OAuth 设置可以使用 iAP 用的技能（`jssp-im-oauth-generator` 等）
- 访问令牌由 smartlime 使用刷新令牌更新。应用启动时如果距离过期不足 6 分钟（`remainingTimeToRunRefresh`）则进行更新；API 返回 401（`invalid_token`）时也会更新并仅重发 1 次。如果刷新令牌也已失效，则回到未登录状态

### 6. 确认运行情况

```bash
npx expo-doctor
npx tsc --noEmit
```

- 刚执行 create-expo 后如果从未运行过 `npx expo start`，由于没有 `expo-env.d.ts`，`*.css` 的 import 会出现 2 个类型错误。运行一次 `npx expo start` 即可生成该文件
- 认证必须在**开发构建**中确认（`npx expo run:android` / `npx expo run:ios`，或 EAS 的 development 配置文件）。在 Expo Go 中重定向 URI 会变为 `exp://<开发机的地址>/--/redirect`，与 iAP 中注册的 URI 不一致

## 常见问题

| 症状 | 原因与对策 |
|------|------|
| 授权后未返回应用、`redirect_uri` 不一致错误 | iAP 的 `redirect-uri` 与应用的 `redirectUri` 不一致。将 `redirectUri` 输出到日志进行确认。确认是否在 Expo Go 中进行了测试 |
| `SearchComponent is not passed to Smartlime prop.` | 未传入 `imseach`（或拼写成了 `imsearch`） |
| `... requires either a Context provide or an ancestor element with a ...` | 在 `Smartlime` 之外使用了 smartlime 的钩子 |
| `ThemeProvider` 的 `value` 出现 `ColorValue` 与 `string` 的类型错误 | 加上步骤 4 中的 `as ReactNavigation.Theme` |
| 授权画面可以打开，但登录后出错 | 确认 iAP 端的范围・`code-challenge`・`client-secret` 的设置 |
