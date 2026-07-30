---
paths:
  - "src/test/jssp/**/*.test.js"
  - "src/test/e2e/**/*.spec.ts"
  - "playwright.config.ts"
  - "jest.config.js"
---

# テスト規約

> **適用範囲**: 🟡 **文脈依存** — 単体テスト実装時のみ適用。

## ファンクションコンテナの単体テスト

### 概要

- Jest on Rhino を使用し、スクリプト開発モデルで作成したファンクションコンテナ（js）の単体テストを実施する
- Jest 互換の API（`describe`, `it`, `expect`, `jest.fn()`, `jest.mock()` 等）で記述する
- Rhino 1.7R4（ES5 相当）で動作するため、arrow function, let/const, テンプレートリテラル等は使用不可
- 詳細は `.claude/skills/jssp-jest-test/SKILL.md` を参照すること

### テストファイルの配置

```
src/
├── jest.config.js                      # Jest 設定
├── main/jssp/
│   └── {category}/
│       ├── view/{view}.js              # ソースコード
│       ├── api/{api}.js
│       └── common/{function}.js
└── test/jssp/
    └── {category}/
        ├── view/{view}.test.js         # Jest テスト
        ├── api/{api}.test.js
        └── common/{function}.test.js
```

- テストファイルは `src/test/jssp/src/` 配下に、ソースと同一のディレクトリ構造で配置する
- ファイル名は `{ソース名}.test.js` とする
- `sourcePathMapping` により、対応するソースファイルが自動的にスコープに読み込まれる

### jest.config.js

プロジェクトルートに `jest.config.js` を配置する。
`sourcePathMapping` でテストファイルとソースファイルのパス対応を定義する。

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

| 設定項目 | 説明 |
|---------|------|
| `testMatch` | テストファイルの検索パターン |
| `sourcePathMapping` | テストパス → ソースパスの対応。テストファイルと同一相対パスのソースが自動的にスコープに読み込まれる |
| `collectCoverage` | カバレッジ収集の有効化 |
| `coverageDirectory` | カバレッジレポートの出力先 |

### テスト観点

| 観点 | 内容 |
|------|------|
| 正常系 | 期待する入力で正しい結果が返ること |
| 異常系 | null/undefined、不正な型など境界値での動作 |
| 戻り値の構造 | 必須プロパティの存在、型、値の検証 |
| API 呼び出し | プラットフォーム API が正しい引数で呼ばれること（mock で検証） |
| エラーハンドリング | 例外発生時のレスポンス構造（画面: `error.code` / `error.message`、API: `error` / `errorMessage` と HTTP ステータス） |

## プレゼンテーションページの単体テスト

### 概要

- プレゼンテーションページの単体テストは playwright を使用する

### テストファイルの配置

```
project-root/
├── playwright.config.ts                # Playwright 設定
├── src/
│   └── test/
│       └── e2e/
│           └── <module-name>.spec.ts   # E2E テスト
```

### 設定規約

**ブラウザ**:
- Playwright 既定の Chromium を使用する（`channel` 指定なし）
- 事前に `npx playwright install chromium` を実行してブラウザバイナリを取得しておくこと
- ただし、ブラウザが指定されている場合はそれに従う

**baseURL**:
- 末尾にスラッシュを付けること（例: `http://127.0.0.1/imart/`）

**テスト内のURL**:
- `baseURL` からの相対パスで指定する（例: `"product_stock"`）
- 絶対パスや先頭スラッシュ付きのパスは使用しないこと（正しくページ遷移できなくなるため）

### テスト観点

#### 画面表示

| 観点 | 内容 |
|------|------|
| 初期表示 | ページ読み込み後にテーブル・フォーム等が正しく描画されること |
| 一覧表示 | データ件数分の行が表示されること、各列の値が正しいこと |
| ページネーション | ページ切り替え、ページ情報表示、先頭/末尾ページでのボタン無効化 |
| ソート | ヘッダークリックで昇順/降順が切り替わること、ソートアイコンの表示 |
| 空データ | データが0件の場合に「データがありません」等のメッセージが表示されること |

#### CRUD 操作

| 観点 | 内容 |
|------|------|
| 新規作成 | ダイアログ表示、必須項目入力、確認ダイアログ、登録後のデータ反映 |
| 編集 | 既存データの読み込み、変更、確認ダイアログ、更新後のデータ反映 |
| 削除 | 確認ダイアログ表示、削除後のデータ反映、キャンセル時にデータが変わらないこと |

#### バリデーション

| 観点 | 確認内容 |
|------|----------|
| 必須チェック | 空のまま送信するとエラーメッセージが表示されること |
| 文字種チェック | 半角英数字のみのフィールドに日本語等を入力した場合のエラー |
| 文字数チェック | 最大文字数を超えた場合のエラー |
| 範囲チェック | 数値フィールドの最小値・最大値の範囲外の場合のエラー |
| 重複チェック | 一意制約のあるフィールドに既存値を入力した場合のエラー |
| エラー表示 | 対象フィールドの `.imds-field` に `imds-validation-error` クラスが付与されること |
| エラーメッセージ | `.imds-error-text` 要素が表示され、適切なメッセージが含まれること |
| リアルタイム解消 | エラー表示後に入力を修正するとエラーが消えること |

#### ボタン・操作のスタイル

| 観点 | 確認内容 |
|------|----------|
| 主要操作 | 登録・更新ボタンに `is-primary` クラスが指定されていること |
| 危険操作 | 削除など不可逆な操作のボタンに `is-danger` クラスが指定されていること |
| 確認ダイアログ | 削除の確認ダイアログが `mode: "danger"` で表示されること（OKボタンが `is-danger`） |
| 無効状態 | 操作不可の場合にボタンが `disabled` であること |

#### ダイアログ

| 観点 | 内容 |
|------|------|
| 開閉 | ボタンクリックで開く、閉じるボタン・オーバーレイクリックで閉じる |
| モード切替 | 新規作成と編集でタイトル・フィールドの状態（readOnly等）が正しく切り替わること |
| 確認ダイアログ | 実行前に確認ダイアログが表示され、キャンセルで操作が中止されること |

#### 画面遷移（404 見逃し防止）

ボタン・リンク・フォーム送信で別画面に遷移するテストでは、**URL の部分一致だけで検証してはならない**。
遷移先 URL が誤ってコンテキストパス（例: `/imart/`）から外れている場合（典型例：`location.href = '/equip/...'` のような先頭スラッシュ付き絶対パスの記述ミス）、HTTP 404 ページが表示されたまま URL に文字列が一致するため、テストは緑のまま 404 を素通りしてしまう。

遷移を伴うテストには以下を **必ず併せて検証** すること：

| 観点 | 確認内容 |
|------|----------|
| URL（コンテキストパス込み） | `toHaveURL(/imart\/foo\/bar/)` のように baseURL の末尾要素（`imart` 等）を含めた正規表現で検証する。コンテキストパス外の 404 を弾く |
| ページタイトル | `toHaveTitle(/期待タイトル/)` で別ページが返ってきていないかを確認する |
| ページ識別要素 | `h1#page-title` 等、その画面固有の要素が DOM 上に表示されることを確認する |

```typescript
// NG: 部分一致だけ — http://127.0.0.1/equip/... (404) でもマッチしてしまう
await expect(page).toHaveURL(/equip\/equipment\/search/);

// OK: コンテキストパス込み + タイトル + ページ見出し
await expect(page).toHaveURL(/imart\/equip\/equipment\/search/);
await expect(page).toHaveTitle(/備品検索/);
await expect(page.locator('h1#page-title')).toBeVisible();
```

Playwright テストでは `.claude/skills/jssp-playwright-test/assets/test-helpers.md` の `expectNavigated()` ヘルパー使用を推奨する。

### トラブルシューティング

intra-mart サーバへの E2E テストが疎通レベルで失敗する場合、原因がアプリケーションではなく実行環境にあることが多い。次の順で切り分ける。

#### 切り分け手順

1. **TCP 到達性**：`bash -c 'cat </dev/tcp/<host>/<port>'` で生 TCP が通るか確認する
2. **curl 経由**：`curl -v http://<host>/imart/login` でリクエストヘッダを確認する。`Proxy-Connection` や `> GET http://...` のフルパス GET が見えるならプロキシ経由、そうでなければ直接接続
3. **Node の http モジュール**：`node -e "http.get('http://...', r => ...)"` でブラウザを介さない HTTP が成立するか
4. **Playwright API リクエスト**：`request.newContext().fetch(...)` で Node 側の Playwright が通るか
5. **Chromium ナビゲーション**：`page.on('requestfailed', ...)` でブラウザ層の失敗だけ拾えるか

各層で挙動が異なれば、その境界に原因がある。

#### よくある原因と対処

| 症状 | 原因 | 対処 |
|------|------|------|
| `page.goto: net::ERR_ABORTED` でメインページ自体が中断 | intra-mart が `<base href='http://127.0.0.1/imart/'>` を埋め込み、サブリソースの URL が `127.0.0.1` 固定になる。Chromium は **localhost/127.0.0.1 を暗黙でプロキシバイパスする**ため、コンテナの 127.0.0.1 に届かず連鎖失敗 | Playwright の `use.proxy.bypass` に `127.0.0.1,<-loopback>` を指定して暗黙バイパスを解除し、`use.proxy.server` をコーポレートプロキシに向ける |
| ホストの 80 番に直接 TCP が届かない（`Connection refused` / timeout） | コンテナの Docker サブネットからホストの listen ポートへの直接アクセスが Firewall でブロックされている | コーポレートプロキシ経由で到達できる経路があるか curl で確認する。ある場合は `proxy.server` を `HTTP_PROXY` から自動取得する設定にする |
| `Executable doesn't exist at .../chrome-headless-shell` | コンテナ初回起動や rebuild 後でブラウザバイナリ未取得 | `npx playwright install chromium` を実行。永続化するなら Dockerfile に組み込む（`COPY package*.json` 後 `RUN npx playwright install --with-deps chromium`） |
| `error while loading shared libraries: libglib-2.0.so.0` | Chromium 実行時の native deps 不足 | Dockerfile に `libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libxkbcommon0 libpango-1.0-0 libcairo2 libasound2 libglib2.0-0` を apt-get install する。`no-new-privileges` でコンテナを動かしている場合 `sudo apt` は使えないので Dockerfile で対応 |
| Squid から `503 Service Unavailable` / `ブロックされました` が返る | プロキシが上流の Squid 経由でホスト名を解決できず、外部ブロックリストに引っかかっている | 直接 IP（例: `172.27.208.1`）か、プロキシが local 扱いするホスト名を使う |

#### playwright.config.ts のプロキシ設定パターン

corporate proxy 配下の devcontainer から intra-mart サーバへアクセスする場合の設定例：

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

ポイント：
- プロキシ無し環境（Windows ネイティブ等）では `proxy` セクション自体が生成されず、既存の挙動を壊さない
- コンテナ側は `docker-compose.yml` の `environment` で `PW_PROXY_BYPASS=127.0.0.1,<-loopback>` を渡し、Chromium の暗黙バイパスを解除する
