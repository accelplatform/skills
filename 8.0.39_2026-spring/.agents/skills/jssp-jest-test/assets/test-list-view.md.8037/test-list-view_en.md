# Unit Test Examples for List View Function Container

## Overview

Unit test patterns for a list view FC (init / main / processBusinessLogic / transferErrorPage).
Practical examples based on the product_stock2 screen.

## Testing processBusinessLogic

Directly verify the return value of business logic. No mocks are needed when there is no dependency on platform APIs.

```javascript
describe('processBusinessLogic', function() {
  it('should return a list', function() {
    let result = processBusinessLogic({});
    expect(result).toHaveProperty('list');
    expect(Array.isArray(result.list)).toBe(true);
    expect(result.list.length).toBeGreaterThan(0);
  });

  it('list should contain 25 records', function() {
    let result = processBusinessLogic({});
    expect(result.list).toHaveLength(25);
  });

  it('each record should contain required properties', function() {
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

  it('first record should have correct values', function() {
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

  it('productCode should be unique across all records', function() {
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
  ])('should work even when request is %s', function(label, value) {
    let result = processBusinessLogic(value);
    expect(result).toHaveProperty('list');
    expect(result.list.length).toBeGreaterThan(0);
  });
});
```

## Testing main

Mock platform APIs (Logger, Transfer) and verify both the success and error scenarios.

```javascript
describe('main', function() {
  beforeEach(function() {
    jest.clearAllMocks();
  });

  afterEach(function() {
    jest.unmock('Logger');
    jest.unmock('Transfer');
  });

  it('success: response structure should be correct', function() {
    let response = main({});

    expect(response).toMatchObject({
      result: expect.objectContaining({ list: expect.any(Array) }),
      error: { code: '', message: '' }
    });
  });

  it('success: result.list should contain 25 records', function() {
    let response = main({});
    expect(response.result.list).toHaveLength(25);
  });

  it('success: should work even when request is null', function() {
    let response = main(null);
    expect(response).toHaveProperty('result');
    expect(response.result).not.toBeNull();
  });

  it('error: when processBusinessLogic throws, Logger.error and transferErrorPage should be called', function() {
    jest.mock('Logger', {
      error: jest.fn()
    });
    jest.mock('Transfer', {
      toErrorPage: jest.fn()
    });

    // Temporarily replace the source function
    let original = processBusinessLogic;
    processBusinessLogic = function() {
      throw new Error('DB connection error');
    };

    let response = main({});

    expect(Logger.error).toHaveBeenCalledTimes(1);
    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining('DB connection error')
    );

    expect(Transfer.toErrorPage).toHaveBeenCalledTimes(1);
    expect(Transfer.toErrorPage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'システムエラーが発生しました'
      })
    );

    expect(response.result).toBeNull();
    expect(response.error).toEqual({ code: '', message: '' });

    // Restore the original function
    processBusinessLogic = original;
  });
});
```

## Testing init

Verify that a JSON string is set on the bound variable `$data`.

```javascript
describe('init', function() {
  it('should set a JSON string to $data', function() {
    init({});

    expect(typeof $data).toBe('string');
    let parsed = JSON.parse($data);
    expect(parsed).toMatchObject({
      result: expect.objectContaining({ list: expect.any(Array) }),
      error: expect.any(Object)
    });
    expect(parsed.result.list).toHaveLength(25);
  });

  it('slashes in $data should be escaped', function() {
    init({});

    // After JSON.stringify, / is escaped as \/
    // Verify that it can still be parsed correctly after escaping
    let parsed = JSON.parse($data);
    expect(parsed).toHaveProperty('result');
  });
});
```

## Testing transferErrorPage

Verify arguments using a mock of the Transfer API.

```javascript
describe('transferErrorPage', function() {
  afterEach(function() {
    jest.unmock('Transfer');
  });

  it('Transfer.toErrorPage should be called with the correct arguments', function() {
    jest.mock('Transfer', {
      toErrorPage: jest.fn()
    });

    transferErrorPage('E001', 'An unexpected error has occurred.');

    expect(Transfer.toErrorPage).toHaveBeenCalledTimes(1);
    expect(Transfer.toErrorPage).toHaveBeenCalledWith({
      title: 'システムエラーが発生しました',
      message: 'E001\nAn unexpected error has occurred.'
    });
  });
});
```
