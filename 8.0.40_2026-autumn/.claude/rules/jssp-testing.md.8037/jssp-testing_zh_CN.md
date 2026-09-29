---
paths:
  - "src/test/jssp/**/*.test.js"
  - "src/test/e2e/**/*.spec.ts"
  - "playwright.config.ts"
  - "jest.config.js"
---

# 测试规约

> **适用范围**: 🟡 **上下文依赖** — 仅在编写单元测试时适用。

## 函数容器的单元测试

### 概述

- 使用 Jest on Rhino，对使用脚本开发模型创建的函数容器（js）进行单元测试
- 使用与 Jest 兼容的 API（`describe`、`it`、`expect`、`jest.fn()`、`jest.mock()` 等）编写
- 由于在 Rhino 1.7R4（相当于 ES5）上运行，不能使用箭头函数、let/const、模板字面量等
- 详细内容请参考 `.claude/skills/jssp-jest-test/SKILL.md`

### 测试文件的放置

```
src/
├── jest.config.js                      # Jest 配置
├── main/jssp/
│   └── {category}/
│       ├── view/{view}.js              # 源代码
│       ├── api/{api}.js
│       └── common/{function}.js
└── test/jssp/
    └── {category}/
        ├── view/{view}.test.js         # Jest 测试
        ├── api/{api}.test.js
        └── common/{function}.test.js
```

- 测试文件放置在 `src/test/jssp/src/` 目录下，与源代码保持相同的目录结构
- 文件名格式为 `{源代码名}.test.js`
- 通过 `sourcePathMapping`，对应的源文件会自动加载到作用域中

### jest.config.js

在项目根目录放置 `jest.config.js`。
在 `sourcePathMapping` 中定义测试文件与源文件的路径对应关系。

```javascript
module.exports = {
    testMatch: ["src/test/jssp/**/*.test.js"],
    sourcePathMapping: {
        "src/test/jssp/src/": "src/main/jssp/src/"
    },
    collectCoverage: true,
    coverageDirectory: "target/coverage"
};
```

| 配置项 | 说明 |
|--------|------|
| `testMatch` | 测试文件的搜索模式 |
| `sourcePathMapping` | 测试路径到源路径的对应关系。与测试文件相同相对路径的源文件会自动加载到作用域中 |
| `collectCoverage` | 启用覆盖率收集 |
| `coverageDirectory` | 覆盖率报告的输出目录 |

### 测试观点

| 观点 | 内容 |
|------|------|
| 正常流程 | 期望的输入能够返回正确的结果 |
| 异常流程 | null/undefined、非法类型等边界值的行为 |
| 返回值结构 | 必要属性的存在性、类型、值的验证 |
| API 调用 | 平台 API 以正确的参数被调用（通过 mock 验证） |
| 错误处理 | 发生异常时的响应结构（画面: `error.code` / `error.message`，API: `error` / `errorMessage` 与 HTTP 状态码） |

## 展示页面的单元测试

### 概述

- 展示页面的单元测试使用 Playwright

### 测试文件的放置

```
project-root/
├── playwright.config.ts                # Playwright 配置
├── src/
│   └── test/
│       └── e2e/
│           └── <module-name>.spec.ts   # E2E 测试
```

### 配置规约

**浏览器**：
- 使用 Playwright 默认的 Chromium（不指定 `channel`）
- 事先执行 `npx playwright install chromium` 以获取浏览器二进制文件
- 但若指定了浏览器，则以指定为准

**baseURL**：
- 必须在末尾加斜杠（例如：`http://127.0.0.1/imart/`）

**测试中的 URL**：
- 以 `baseURL` 的相对路径指定（例如：`"product_stock"`）
- 不使用绝对路径或以斜杠开头的路径（否则页面无法正确跳转）

### 测试观点

#### 画面显示

| 观点 | 内容 |
|------|------|
| 初始显示 | 页面加载后表格、表单等能否正确渲染 |
| 列表显示 | 是否显示与数据条数对应的行数，各列的值是否正确 |
| 分页 | 页面切换、分页信息显示、首页/末页按钮的禁用状态 |
| 排序 | 点击表头后升序/降序切换，排序图标的显示 |
| 空数据 | 数据为 0 条时是否显示"暂无数据"等消息 |

#### CRUD 操作

| 观点 | 内容 |
|------|------|
| 新建 | 对话框显示、必填项输入、确认对话框、注册后数据的反映 |
| 编辑 | 现有数据的读取、修改、确认对话框、更新后数据的反映 |
| 删除 | 确认对话框显示、删除后数据的反映、取消时数据不变 |

#### 验证

| 观点 | 确认内容 |
|------|---------|
| 必填检查 | 空白提交时是否显示错误消息 |
| 字符类型检查 | 仅限半角英数字的字段输入日语等时的错误 |
| 字符数检查 | 超过最大字符数时的错误 |
| 范围检查 | 数值字段超出最小值/最大值范围时的错误 |
| 重复检查 | 在有唯一性约束的字段中输入已存在值时的错误 |
| 错误显示 | 目标字段的 `.imds-field` 是否被添加了 `imds-validation-error` 类 |
| 错误消息 | `.imds-error-text` 元素是否显示，且包含适当的消息 |
| 实时消除 | 错误显示后修正输入，错误是否消失 |

#### 按钮与操作的样式

| 观点 | 确认内容 |
|------|---------|
| 主要操作 | 注册、更新按钮是否指定了 `is-primary` 类 |
| 危险操作 | 删除等不可逆操作的按钮是否指定了 `is-danger` 类 |
| 确认对话框 | 删除的确认对话框是否以 `mode: "danger"` 显示（OK 按钮为 `is-danger`） |
| 禁用状态 | 操作不可用时按钮是否为 `disabled` |

#### 对话框

| 观点 | 内容 |
|------|------|
| 开关 | 点击按钮打开，点击关闭按钮或遮罩层关闭 |
| 模式切换 | 新建与编辑时标题和字段状态（readOnly 等）是否正确切换 |
| 确认对话框 | 执行前是否显示确认对话框，取消时操作是否中止 |

#### 画面跳转（防止 404 漏检）

对于通过按钮、链接、表单提交跳转到其他画面的测试，**不得仅以 URL 的部分匹配进行验证**。
如果跳转目标 URL 错误并脱离了上下文路径（例如 `/imart/`）—— 典型错误是写成 `location.href = '/equip/...'` 这类带前导斜杠的绝对路径 —— HTTP 404 页面仍然显示但 URL 字符串恰好匹配，测试会在 404 状态下静默通过。

涉及跳转的测试 **必须同时验证以下项目**：

| 观点 | 确认内容 |
|------|---------|
| URL（含上下文路径） | 使用包含 baseURL 末尾段（如 `imart`）的正则验证，例如 `toHaveURL(/imart\/foo\/bar/)`，排除脱离上下文路径的 404 |
| 页面标题 | 使用 `toHaveTitle(/期望标题/)` 确认未返回其他页面 |
| 页面识别元素 | 确认该画面特有的元素（如 `h1#page-title`）在 DOM 中显示 |

```typescript
// NG：仅部分匹配 —— http://127.0.0.1/equip/... (404) 也会匹配
await expect(page).toHaveURL(/equip\/equipment\/search/);

// OK：含上下文路径的 URL + 标题 + 页面标题
await expect(page).toHaveURL(/imart\/equip\/equipment\/search/);
await expect(page).toHaveTitle(/备品检索/);
await expect(page.locator('h1#page-title')).toBeVisible();
```

在 Playwright 测试中推荐使用 `.claude/skills/jssp-playwright-test/assets/test-helpers.md` 中的 `expectNavigated()` 辅助函数。

### 故障排查

当对 intra-mart 服务器的 E2E 测试在连接层级失败时，原因往往不在应用本身，而在运行环境。按以下顺序分层排查。

#### 排查步骤

1. **原始 TCP 可达性**：`bash -c 'cat </dev/tcp/<host>/<port>'` 验证裸 TCP 是否通
2. **curl 详细模式**：`curl -v http://<host>/imart/login` 查看请求头。如果请求行是完整 URL（`GET http://...`）并带 `Proxy-Connection`，说明走了代理；否则是直连
3. **Node http 模块**：`node -e "http.get('http://...', r => ...)"` 验证不通过浏览器的 HTTP 是否能成立
4. **Playwright API 请求**：`request.newContext().fetch(...)` 验证 Node 侧的 Playwright 是否能通
5. **Chromium 导航**：通过 `page.on('requestfailed', ...)` 仅捕获浏览器层的失败

各层行为不同时，根因就在该边界上。

#### 常见原因与对策

| 症状 | 原因 | 对策 |
|------|------|------|
| `page.goto: net::ERR_ABORTED` 导致主页面本身中断 | intra-mart 嵌入 `<base href='http://127.0.0.1/imart/'>`，使子资源 URL 全部固定为 `127.0.0.1`。Chromium **隐式地为 localhost/127.0.0.1 绕过代理**，因此容器内无法到达资源并连锁失败 | 在 Playwright 的 `use.proxy.bypass` 中指定 `127.0.0.1,<-loopback>` 以解除隐式绕过，并将 `use.proxy.server` 指向企业代理 |
| 直接 TCP 无法到达主机 80 端口（`Connection refused` / timeout） | 容器所在 Docker 子网到主机监听端口的直接访问被 Firewall 阻挡 | 用 curl 确认是否存在经企业代理可达的路径。若有，将 `proxy.server` 配置为从 `HTTP_PROXY` 自动获取 |
| `Executable doesn't exist at .../chrome-headless-shell` | 容器初次启动或 rebuild 后浏览器二进制未取得 | 执行 `npx playwright install chromium`。如需持久化，写入 Dockerfile（`COPY package*.json` 后 `RUN npx playwright install --with-deps chromium`） |
| `error while loading shared libraries: libglib-2.0.so.0` | Chromium 运行时缺少 native deps | 在 Dockerfile 中 apt-get install `libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libxkbcommon0 libpango-1.0-0 libcairo2 libasound2 libglib2.0-0`。若容器使用 `no-new-privileges` 则 `sudo apt` 不可用，必须由 Dockerfile 处理 |
| Squid 返回 `503 Service Unavailable` / "已被阻止"页面 | 代理无法通过上游 Squid 解析主机名，命中外部黑名单 | 改用直接 IP（如 `172.27.208.1`），或使用代理视为本地的主机名 |

#### playwright.config.ts 代理配置模式

企业代理下的 devcontainer 访问 intra-mart 服务器时的配置示例：

```typescript
const proxyServer = process.env.PW_PROXY_SERVER || process.env.HTTP_PROXY;
const proxyBypass = process.env.PW_PROXY_BYPASS || "127.0.0.1";

export default defineConfig({
  use: {
    baseURL: "http://127.0.0.1/imart/",
    ...(proxyServer ? { proxy: { server: proxyServer, bypass: proxyBypass } } : {}),
  },
});
```

要点：
- 无代理环境（如 Windows 原生）下不会生成 `proxy` 段，原有行为不受影响
- 容器侧通过 `docker-compose.yml` 的 `environment` 设置 `PW_PROXY_BYPASS=127.0.0.1,<-loopback>`，解除 Chromium 的隐式绕过
