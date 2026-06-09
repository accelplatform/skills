# jest.config.js 配置示例

## 基本配置

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

## 配置项说明

### testMatch

测试文件的搜索模式。目标为 `src/test/jssp/src/` 目录下的 `.test.js` 文件。

### sourcePathMapping

根据测试文件路径自动解析对应的源文件路径。

```
测试: src/test/jssp/src/{category}/view/index.test.js
  → 去除前缀: {category}/view/index.test.js
  → 替换扩展名: {category}/view/index.js
  → 源文件路径: src/main/jssp/src/{category}/view/index.js
```

通过此机制，源文件与测试文件在同一作用域中加载，因此可以在测试代码中直接调用源文件中的函数，无需使用 `load()`。

### collectCoverage / coverageDirectory

覆盖率测量配置。报告输出至 `target/coverage`。

## 文件放置规则

保持源文件与测试文件的目录结构对应：

```
src/
├── main/jssp/
│   └── product_stock/
│       └── view/
│           └── index.js          ← 源文件
└── test/jssp/
    └── product_stock/
        └── view/
            └── index.test.js     ← 测试文件
```
