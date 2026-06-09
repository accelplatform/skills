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
