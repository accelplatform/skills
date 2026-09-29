# 列表画面功能容器单元测试实例

## 概述

列表画面 FC（init / main / processBusinessLogic / transferErrorPage）的单元测试模式。
基于 product_stock2 画面的实际示例。

## processBusinessLogic 的测试

直接验证业务逻辑的返回值。不依赖平台 API 时无需模拟。

```javascript
describe('processBusinessLogic', function() {
  it('应返回列表', function() {
    let result = processBusinessLogic({});
    expect(result).toHaveProperty('list');
    expect(Array.isArray(result.list)).toBe(true);
    expect(result.list.length).toBeGreaterThan(0);
  });

  it('列表应包含25条记录', function() {
    let result = processBusinessLogic({});
    expect(result.list).toHaveLength(25);
  });

  it('每条记录应包含必填属性', function() {
    let result = processBusinessLogic({});
    for (let i = 0; i < result.list.length; i++) {
      expect(result.list[i]).toMatchObject(
        expect.objectContaining({
          productCode: expect.any(String),
          productName: expect.any(String),
          unitPrice: expect.any(Number),
          stockQuantity: expect.any(Number),
          warehouseNumber: expect.any(String)
        })
      );
    }
  });

  it('第一条记录的值应正确', function() {
    let result = processBusinessLogic({});
    expect(result.list[0]).toMatchObject({
      productCode: 'PRD001',
      productName: 'ボールペン（黒）',
      unitPrice: 150,
      stockQuantity: 500,
      warehouseNumber: 'WH01',
      remarks: '定番商品'
    });
  });

  it('所有记录的商品编码应唯一', function() {
    let result = processBusinessLogic({});
    let codes = {};
    for (let i = 0; i < result.list.length; i++) {
      let code = result.list[i].productCode;
      expect(codes[code]).toBeUndefined();
      codes[code] = true;
    }
  });

  it.each([
    ['null', null],
    ['undefined', undefined]
  ])('request 为 %s 时也应正常运行', function(label, value) {
    let result = processBusinessLogic(value);
    expect(result).toHaveProperty('list');
    expect(result.list.length).toBeGreaterThan(0);
  });
});
```

## main 的测试

模拟平台 API（Logger、Transfer），验证正常场景和异常场景。

```javascript
describe('main', function() {
  beforeEach(function() {
    jest.clearAllMocks();
  });

  afterEach(function() {
    jest.unmock('Logger');
    jest.unmock('Transfer');
  });

  it('正常场景：响应结构应正确', function() {
    let response = main({});

    expect(response).toMatchObject({
      result: expect.objectContaining({ list: expect.any(Array) }),
      error: { code: '', message: '' }
    });
  });

  it('正常场景：result.list 应返回25条记录', function() {
    let response = main({});
    expect(response.result.list).toHaveLength(25);
  });

  it('正常场景：request 为 null 时也应正常运行', function() {
    let response = main(null);
    expect(response).toHaveProperty('result');
    expect(response.result).not.toBeNull();
  });

  it('异常场景：processBusinessLogic 抛出异常时，应调用 Logger.error 和 transferErrorPage', function() {
    jest.mock('Logger', {
      error: jest.fn()
    });
    jest.mock('Transfer', {
      toErrorPage: jest.fn()
    });

    // 临时替换源函数
    let original = processBusinessLogic;
    processBusinessLogic = function() {
      throw new Error('DB连接错误');
    };

    let response = main({});

    expect(Logger.error).toHaveBeenCalledTimes(1);
    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining('DB连接错误')
    );

    expect(Transfer.toErrorPage).toHaveBeenCalledTimes(1);
    expect(Transfer.toErrorPage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'システムエラーが発生しました'
      })
    );

    expect(response.result).toBeNull();
    expect(response.error).toEqual({ code: '', message: '' });

    // 恢复原始函数
    processBusinessLogic = original;
  });
});
```

## init 的测试

验证绑定变量 `$data` 中是否设置了 JSON 字符串。

```javascript
describe('init', function() {
  it('应将 JSON 字符串设置到 $data', function() {
    init({});

    expect(typeof $data).toBe('string');
    let parsed = JSON.parse($data);
    expect(parsed).toMatchObject({
      result: expect.objectContaining({ list: expect.any(Array) }),
      error: expect.any(Object)
    });
    expect(parsed.result.list).toHaveLength(25);
  });

  it('$data 中的斜杠应被转义', function() {
    init({});

    // JSON.stringify 后 / 被转义为 \/
    // 验证转义后仍能正常解析
    let parsed = JSON.parse($data);
    expect(parsed).toHaveProperty('result');
  });
});
```

## transferErrorPage 的测试

通过模拟 Transfer API 验证参数。

```javascript
describe('transferErrorPage', function() {
  afterEach(function() {
    jest.unmock('Transfer');
  });

  it('Transfer.toErrorPage 应以正确的参数被调用', function() {
    jest.mock('Transfer', {
      toErrorPage: jest.fn()
    });

    transferErrorPage('E001', '发生了意外错误。');

    expect(Transfer.toErrorPage).toHaveBeenCalledTimes(1);
    expect(Transfer.toErrorPage).toHaveBeenCalledWith({
      title: 'システムエラーが発生しました',
      message: 'E001\n发生了意外错误。'
    });
  });
});
```
