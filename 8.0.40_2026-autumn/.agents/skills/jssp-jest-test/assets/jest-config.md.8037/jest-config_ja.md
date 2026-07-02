# jest.config.js 設定例

## 基本設定

```javascript
module.exports = {
  testMatch: ['src/test/jssp/**/*.test.js'],
  sourcePathMapping: {
    'src/test/jssp/src/': 'src/main/jssp/src/'
  },
  collectCoverage: true,
  coverageDirectory: 'target/coverage'
};
```

## 設定項目の説明

### testMatch

テストファイルの検索パターン。`src/test/jssp/src/` 配下の `.test.js` を対象とする。

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
