# playwright.config.ts 設定例

## 基本設定

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

## 設定の注意事項

### ブラウザ

- `channel: 'msedge'` を指定し、システムの Edge を使用する
- これにより `playwright install` が不要になる
- Linux 環境では `channel` を削除し、`playwright install` を実行する

### baseURL

- **末尾にスラッシュを付けること**（例: `http://127.0.0.1/imart/`）
- 末尾スラッシュがないと、テスト内の相対パスが正しく解決されない
- 環境ごとに baseURL を変更するだけで対応可能

### テスト内の URL 指定

テスト内では `baseURL` からの相対パスを使用する。

```typescript
// OK: 相対パス（baseURL と結合される）
const URL = './module_name';

// NG: 絶対パス（baseURL が無視される）
const URL = '/module_name';

// NG: フル URL（環境依存になる）
const URL = 'http://127.0.0.1/imart/product_stock';
```
