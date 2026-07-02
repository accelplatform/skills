# 测试通用模式与技巧

## 概述

使用 jest-on-rhino 编写测试时的通用模式及常见注意事项汇总。

## beforeEach / afterEach 的基本结构

```javascript
describe('模块名', function() {
  beforeEach(function() {
    jest.clearAllMocks();
  });

  afterEach(function() {
    // 解除所有通过 jest.mock() 注入的模拟
    jest.unmock('DatabaseManager');
    jest.unmock('Logger');
    jest.unmock('Transfer');
  });

  // 测试用例...
});
```

## 临时替换源函数

由于 sourcePathMapping 将源文件加载到同一作用域，可以在测试中临时替换源函数。
**务必在测试结束后恢复原函数。**

```javascript
describe('main', function() {
  it('processBusinessLogic 抛出异常时的行为', function() {
    // 保存原始函数
    let original = processBusinessLogic;

    // 替换为桩函数
    processBusinessLogic = function() {
      throw new Error('测试用错误');
    };

    let response = main({});
    expect(response.result).toBeNull();

    // 恢复原始函数
    processBusinessLogic = original;
  });
});
```

## 使用 load() 加载外部文件

无法通过 sourcePathMapping 自动解析的文件（如公共工具类等），
需使用 `load()` 显式加载。

```javascript
// 在测试文件顶部加载公共处理
load('src/main/jssp/src/common/util/string_util.js');

describe('formatCode', function() {
  it('代码应左补零', function() {
    // 可直接调用 string_util.js 中的函数
    let result = formatCode('42', 5);
    expect(result).toBe('00042');
  });
});
```

## 使用 it.each / describe.each 进行参数化测试

当需要以多种模式执行相同结构的测试时使用。

```javascript
describe('输入验证', function() {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['空字符串', ''],
    ['仅空白', '   ']
  ])('输入为 %s 时应返回 false', function(label, value) {
    let result = validateInput(value);
    expect(result).toBe(false);
  });

  it.each([
    ['半角英文', 'ABC', true],
    ['半角数字', '123', true],
    ['半角英数字', 'ABC123', true],
    ['日语', 'テスト', false],
    ['含符号', 'ABC-123', false]
  ])('输入为 %s 时应返回 %s', function(label, value, expected) {
    let result = isAlphanumeric(value);
    expect(result).toBe(expected);
  });
});
```

## expect 匹配器的使用区分

### 值的匹配

```javascript
// 严格相等（原始值）
expect(result).toBe('expected');
expect(count).toBe(10);
expect(flag).toBe(true);

// 对象/数组相等（深度比较）
expect(obj).toEqual({ key: 'value' });
expect(arr).toEqual([1, 2, 3]);

// 部分匹配（仅验证对象的部分属性）
expect(obj).toMatchObject({ key: 'value' });

// 数组长度
expect(list).toHaveLength(5);
```

### 属性的存在性

```javascript
// 属性存在
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('nested.key');

// 同时验证属性值
expect(obj).toHaveProperty('key', 'value');
```

### 类型检查

```javascript
// 使用 expect.any 验证类型
expect(obj).toMatchObject({
  id: expect.any(String),
  count: expect.any(Number),
  items: expect.any(Array)
});
```

### 函数调用

```javascript
// 调用次数
expect(mockFn).toHaveBeenCalledTimes(1);

// 参数验证
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

// 部分匹配参数验证
expect(mockFn).toHaveBeenCalledWith(
  expect.stringContaining('错误')
);
expect(mockFn).toHaveBeenCalledWith(
  expect.objectContaining({ title: '标题' })
);

// 未被调用
expect(mockFn).not.toHaveBeenCalled();
```

### 异常

```javascript
// 应抛出异常
expect(function() {
  targetFunction(null);
}).toThrow();

// 带消息
expect(function() {
  targetFunction(null);
}).toThrow('参数不合法');
```

## jest.fn() 的返回值设置

```javascript
// 返回固定值
let mockFn = jest.fn().mockReturnValue('固定值');

// 每次调用返回不同值
let mockFn = jest.fn()
  .mockReturnValueOnce('第1次')
  .mockReturnValueOnce('第2次')
  .mockReturnValue('第3次及以后');

// 使用函数动态决定返回值
let mockFn = jest.fn(function(input) {
  return input + '_processed';
});
```

## jest.spyOn 的使用方法

监视同一作用域内对象的方法。

```javascript
describe('spyOn 示例', function() {
  it('可以监视 JSON.parse 的调用', function() {
    let spy = jest.spyOn(JSON, 'parse');

    let result = JSON.parse('{"key": "value"}');

    expect(spy).toHaveBeenCalledWith('{"key": "value"}');
    expect(result).toEqual({ key: 'value' });

    spy.mockRestore();
  });
});
```
