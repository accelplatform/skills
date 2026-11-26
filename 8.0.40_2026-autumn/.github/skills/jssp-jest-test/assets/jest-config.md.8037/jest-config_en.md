# jest.config.js Configuration Example

## Basic Configuration

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

## Configuration Options

### testRegex

Regular expression that selects test files. js-jest applies this regular expression as a partial match to the absolute path of each file under the project root and runs the matching files as tests. The setting above targets `.test.js` files under `src/test/jssp/`.

- The path separator is `/` or `\` depending on the OS, so match both with `[/\\]` (written as `'[/\\\\]'` in a JS string literal)
- If omitted, every `*.test.js` / `*.spec.js` in the project except `node_modules` is targeted (including tests such as those under `src/test/integration`)
- js-jest does not use `testMatch` / `testPathIgnorePatterns` to match test files. Use `testRegex` to narrow the targets

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
