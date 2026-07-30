# playwright.config.ts 配置示例

## 基本配置

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    channel: 'msedge',
    baseURL: 'http://127.0.0.1/imart/',
    locale: 'ja-JP',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
});
```

## 配置注意事项

### 浏览器

- 指定 `channel: 'msedge'`，使用系统的 Edge 浏览器
- 这样可以省去 `playwright install` 的步骤
- 在 Linux 环境下，删除 `channel` 并执行 `playwright install`

### baseURL

- **末尾必须加斜杠**（例: `http://127.0.0.1/imart/`）
- 没有末尾斜杠时，测试中的相对路径无法正确解析
- 只需修改 baseURL 即可适应各个环境

### 测试中的 URL 指定

在测试中使用从 `baseURL` 开始的相对路径。

```typescript
// OK: 相对路径（与 baseURL 合并）
const URL = './module_name';

// NG: 绝对路径（baseURL 被忽略）
const URL = '/module_name';

// NG: 完整 URL（依赖于具体环境）
const URL = 'http://127.0.0.1/imart/product_stock';
```

### 截图输出目录

未指定 `outputDir` 时，Playwright 使用项目根目录下的 `test-results/`。
本项目的 `playwright.config.ts` 未指定 `outputDir`，因此截图辅助函数的输出目录也为 `test-results/`。

| 用途 | 路径 |
|------|------|
| 布局视认用（`takeScreenshot`） | `test-results/screenshots/<name>.png` |
| 证跡用（`screenshotStep`） | `test-results/evidence/<testName>_<label>.png` |

建议将 `test-results/` 从版本控制中排除（添加到 `.gitignore`）。

### 日文字体支持（Linux 环境）

在 Linux 环境中，Playwright Chromium 的截图中日文可能显示为方块（□）。
原因是未安装日文字体。

#### devcontainer 的情况

在 `.devcontainer/Dockerfile` 的 `apt-get install` 中添加 `fonts-ipafont`。

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-ipafont \
    && rm -rf /var/lib/apt/lists/*
```

修改 Dockerfile 后需要 **Rebuild Container**。

#### 宿主机 Linux（不使用 devcontainer 的情况）

直接在终端中安装。

```bash
sudo apt-get install -y fonts-ipafont
```
