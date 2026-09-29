---
name: jssp-jest-test
description: 使用 jest-on-rhino 支持函数容器（.js）的单元测试创建。提供测试代码创建、模拟（mock）及 Rhino 约束（ES5）的处理方法。在提及编写测试、创建测试、mock、jest、spyOn、单元测试、添加测试用例、提高覆盖率时使用。对函数容器的测试请使用本技能而非 Playwright。
---

# jest-on-rhino 测试开发指南

## 概要

使用 Jest on Rhino 对 intra-mart Accel Platform 函数容器（js）创建单元测试的技能集。
使用 Jest 兼容的 API 编写，在 Rhino 1.7R4（ES5 相当）上运行。

## 使用时机

当用户提出以下类型的请求时：
- "为○○创建测试"
- "编写函数容器的测试"
- "添加单元测试"
- "用 Jest 编写测试"
- "编写使用 mock 的测试"

## 测试生成步骤

1. 加载目标函数容器（js）
2. 确定要测试的函数和逻辑
3. 根据 `.claude/rules/jssp-testing.md` 的测试观点设计测试用例
4. 按照本技能的模板和模拟模式生成测试代码
5. 按照"测试的执行"步骤运行测试，直至全部通过

## 测试的执行

测试使用 **js-jest（Maven 插件）** 运行。注意不是 `npm test`。

```bash
mvn jp.co.intra_mart:js-jest:test
```

- 在项目根目录（存在 `pom.xml` 的层级）执行
- 目标为 `test`（`jp.co.intra_mart:js-jest:test`）
- 目标文件与配置遵循 `jest.config.js` 的 `testMatch` / `sourcePathMapping`
- 执行结果会显示测试数量与覆盖率（输出至 `target/coverage/`）
- **生成或修改测试代码后必须运行，并确认全部通过**

## 测试执行时的作用域解析机制

### 每个测试文件的作用域隔离

每个测试文件在独立的 Rhino 作用域（JavaScript 执行上下文）中运行。
测试文件之间不共享全局变量。

### 执行生命周期（每个测试文件）

```
1. 创建新作用域（初始化 JS 标准对象：Object, Array, String, Math, JSON 等）
2. 加载 setupFiles（如果已配置）
3. 注入 Jest 全局函数（describe, it, expect, jest, console 等）
4. 加载 setupFilesAfterEnv（如果已配置）
5. 通过 sourcePathMapping 加载源文件（在同一作用域中求值）
6. 加载并求值测试文件（注册 describe/it）
7. 执行已注册的测试（beforeAll → beforeEach → test → afterEach → afterAll）
8. 销毁作用域
```

### sourcePathMapping 的作用域解析规则

从测试文件路径确定对应的源文件，并加载到同一作用域：

```
测试：src/test/jssp/src/{category}/view/index.test.js
  → 移除前缀：{category}/view/index.test.js
  → 替换扩展名：{category}/view/index.js
  → 源文件路径：src/main/jssp/src/{category}/view/index.js
```

源文件在与测试文件**相同的作用域**中求值。
源文件中定义的函数和变量可以从测试代码直接访问。

### 作用域内可用的内容

| 类别 | 可用内容 |
|---------|---------------|
| JS 标准对象 | Object, Array, String, Number, Math, JSON, RegExp, Date, Error 等 |
| Jest API | `describe`, `it`, `test`, `expect`, `jest`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll` |
| 别名 | `xdescribe`（跳过）、`fdescribe`（only）、`xit`（跳过）、`fit`（only）、`xtest`（跳过） |
| console | `console.log`, `console.error`, `console.warn`, `console.info` |
| 源代码 | 通过 sourcePathMapping 加载的函数和变量 |
| 额外加载 | 通过 `load()` 显式加载的文件中的函数和变量 |

### 对测试代码的影响

- 源文件的函数无需 `load()` 即可直接调用
- 源文件中定义的全局变量也可直接引用
- 其他测试文件中定义的变量不可见（作用域隔离）
- **平台 API 不存在于作用域中，必须通过 mock 注入**

## Rhino 约束（重要：必须遵守）

本项目在 Rhino 1.7R4（ES5 相当）上运行。必须遵守以下约束：

| 禁止事项 | 替代方法 |
|---------|---------|
| `() => {}`（箭头函数） | 使用 `function() {}` |
| `async` / `await` | 同步测试或 `done` 回调 |
| `Promise` / `.resolves` / `.rejects` | 使用 `done` 回调 |
| `require()` | 使用 `load()` |
| `Function.prototype.bind` | 用闭包替代 |
| 模板字面量 `` `${}` `` | 用 `"str" + 变量名` 拼接 |
| `class` 语法 | 使用 `function` + `prototype` |
| 解构赋值 `{a, b} = obj` | 使用 `let a = obj.a;` |
| 展开运算符 `...args` | 显式枚举参数 |
| `for...of` | 使用 `for (let i = 0; ...)` |
| `Object.assign` | 手动复制 |

※ 变量声明请遵循主编码规范（使用 `let`；不推荐 `var`）。

### 源文件加载失败时回退函数中的 `var` 使用

当源文件无法被 Rhino 加载时（例如包含 `/** @type {T} */ (expr)` 形式的 JSDoc 类型断言），可在测试文件中通过裸全局赋值定义回退函数：

```javascript
// 由于源文件无法加载，在测试文件中定义回退实现
processBusinessLogic = function(request) {
  var db = new TenantDatabase();  // ← 使用 var，而不是 let
  // ...
};
```

在该类函数体内使用 `let` 会导致 Rhino 抛出 `"missing ) after condition"` 解析错误，因此**仅在此类回退函数体内使用 `var`**。
`describe/it` 回调内以及普通作用域中仍使用 `let`。

根本解决方法是修正源代码中与 Rhino 不兼容的语法（上例需移除 JSDoc 类型断言）。回退仅作为临时应对手段。

## 测试代码基本模板

```javascript
describe('模块名', function() {
  // 每次测试时初始化
  beforeEach(function() {
    jest.clearAllMocks();
  });

  describe('函数名', function() {
    it('正常系行为', function() {
      let result = targetFunction('input');
      expect(result).toBe('expected');
    });

    it('异常系行为', function() {
      expect(function() {
        targetFunction(null);
      }).toThrow('error message');
    });
  });
});
```

## 模拟模式

jest.fn() / jest.spyOn() 的基本用法与标准 Jest API 相同。
这里只记录 jest-on-rhino **特有**的平台 API 模拟模式。

### jest.mock() / jest.unmock() - 平台 API 的模拟

intra-mart 的全局 API 使用以下模式进行模拟：

```javascript
describe('使用全局 API 的函数测试', function() {
  afterEach(function() {
    jest.unmock('DatabaseManager');
  });

  it('处理数据获取结果', function() {
    jest.mock('DatabaseManager', {
      select: jest.fn().mockReturnValue([
        { id: 1, name: '测试' }
      ]),
      insert: jest.fn().mockReturnValue(1)
    });

    let result = targetFunction();
    expect(DatabaseManager.select).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, name: '测试' }]);
  });
});
```

## 注意事项

jest.fn() / jest.spyOn() 的模拟管理、匹配器、参数化测试（it.each / describe.each）、定时器模拟等标准 Jest API 可以直接使用。
但**代码示例必须以 ES5 语法（Rhino 约束）编写**。

- 必须遵守 Rhino 约束（ES5 相当：箭头函数、let/const、模板字面量等不可使用）
- 平台 API（DatabaseManager, PublicStorage 等）不存在于作用域中，必须用 `jest.mock()` 注入
- 用 `jest.mock()` 注入的模拟必须在 `afterEach` 中用 `jest.unmock()` 恢复
- 测试文件名必须以 `.test.js` 结尾
