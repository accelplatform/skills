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

### スクリーンショットの出力先

`outputDir` を指定しない場合、Playwright はプロジェクト直下の `test-results/` を使用する。
本プロジェクトの `playwright.config.ts` は `outputDir` を指定していないため、スクリーンショットヘルパーの出力先も `test-results/` 配下とする。

| 用途 | パス |
|------|------|
| レイアウト視認用（`takeScreenshot`） | `test-results/screenshots/<name>.png` |
| 証跡用（`screenshotStep`） | `test-results/evidence/<testName>_<label>.png` |

`test-results/` はバージョン管理から除外することを推奨する（`.gitignore` に追加）。

### 日本語フォント対応（Linux 環境）

Linux 環境では、Playwright Chromium のスクリーンショットで日本語が豆腐（□）になる場合がある。
これは日本語フォントがインストールされていないことが原因である。

#### devcontainer の場合

`.devcontainer/Dockerfile` の `apt-get install` に `fonts-ipafont` を追加する。

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-ipafont \
    && rm -rf /var/lib/apt/lists/*
```

Dockerfile 変更後は **Rebuild Container** が必要。

#### ホスト Linux（devcontainer を使わない場合）

ターミナルで直接インストールする。

```bash
sudo apt-get install -y fonts-ipafont
```
