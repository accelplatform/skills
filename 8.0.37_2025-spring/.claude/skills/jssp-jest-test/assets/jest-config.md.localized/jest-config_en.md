# jest.config.js Configuration Example

## Basic Configuration

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

## Configuration Options

### testMatch

Search pattern for test files. Targets `.test.js` files under `src/test/jssp/src/`.

### sourcePathMapping

Automatically resolves the corresponding source file from a test file's path.

```
Test: src/test/jssp/src/{category}/view/index.test.js
  → Remove prefix: {category}/view/index.test.js
  → Replace extension: {category}/view/index.js
  → Source path: src/main/jssp/src/{category}/view/index.js
```

With this mechanism, the source file is loaded into the same scope as the test, allowing you to call source functions directly from test code without using `load()`.

### collectCoverage / coverageDirectory

Coverage measurement settings. Reports are output to `target/coverage`.

## File Placement Rules

Mirror the directory structure between source and test:

```
src/
├── main/jssp/
│   └── product_stock/
│       └── view/
│           └── index.js          ← source
└── test/jssp/
    └── product_stock/
        └── view/
            └── index.test.js     ← test
```
