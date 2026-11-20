# jest.config.js 設定例

## 基本設定

```javascript
module.exports = {
  testRegex: '[/\\\\]src[/\\\\]test[/\\\\]jssp[/\\\\].+\\.test\\.js$',
  sourcePathMapping: {
    'src/test/jssp/src/': 'src/main/jssp/src/'
  },
  collectCoverage: true,
  coverageDirectory: 'target/coverage'
};
```

## 設定項目の説明

### testRegex

テストファイルを照合する正規表現。js-jest はプロジェクトルート配下の各ファイルの絶対パスにこの正規表現を部分一致で当て、一致したファイルをテストとして実行する。上記の設定では `src/test/jssp/` 配下の `.test.js` を対象とする。

- パス区切りは OS によって `/` または `\` になるため、`[/\\]`（JS の文字列リテラルでは `'[/\\\\]'`）で両方に一致させる
- 省略すると、`node_modules` を除くプロジェクト内のすべての `*.test.js` / `*.spec.js` が対象になる（`src/test/integration` 等のテストも含まれる）
- js-jest は `testMatch` / `testPathIgnorePatterns` をテストファイルの照合に使わない。対象の絞り込みには `testRegex` を使う

### sourcePathMapping

テストファイルのパスから対応するソースファイルを自動解決する。

```
テスト: src/test/jssp/src/{category}/view/index.test.js
  → プレフィックス除去: {category}/view/index.test.js
  → 拡張子置換: {category}/view/index.js
  → ソースパス: src/main/jssp/src/{category}/view/index.js
```

この仕組みにより、ソースファイルがテストと同一スコープに読み込まれるため、テストコード内で `load()` を使わずにソースの関数を直接呼び出せる。

### collectCoverage / coverageDirectory

カバレッジ計測の設定。`target/coverage` にレポートが出力される。

## ファイル配置ルール

ソースとテストのディレクトリ構造を対応させる:

```
src/
├── main/jssp/
│   └── product_stock/
│       └── view/
│           └── index.js          ← ソース
└── test/jssp/
    └── product_stock/
        └── view/
            └── index.test.js     ← テスト
```
