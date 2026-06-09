# 平台 API 模拟模式实例集

## 概述

intra-mart 的平台 API 在测试作用域中不存在，因此必须使用 `jest.mock()` 以全局变量的形式注入。
本文件展示各 API 的模拟示例。

## 基本规则

1. `jest.mock('API名', { ... })` 将 API 作为全局变量注入到作用域中
2. 在 `afterEach` 中使用 `jest.unmock('API名')` 进行恢复
3. 在 `beforeEach` 中调用 `jest.clearAllMocks()`

## DatabaseManager 的模拟

```javascript
describe('数据获取处理', function() {
    beforeEach(function() {
        jest.clearAllMocks();
    });

    afterEach(function() {
        jest.unmock('DatabaseManager');
    });

    it('应将 SELECT 结果以列表形式返回', function() {
        jest.mock('DatabaseManager', {
            select: jest.fn().mockReturnValue([
                { id: '001', name: '测试1' },
                { id: '002', name: '测试2' }
            ]),
            insert: jest.fn().mockReturnValue(1),
            update: jest.fn().mockReturnValue(1),
            remove: jest.fn().mockReturnValue(1)
        });

        let result = fetchData();

        expect(DatabaseManager.select).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ id: '001', name: '测试1' });
    });

    it('SELECT 结果为0条时应返回空数组', function() {
        jest.mock('DatabaseManager', {
            select: jest.fn().mockReturnValue([])
        });

        let result = fetchData();

        expect(result).toEqual([]);
    });

    it('DB 报错时应抛出异常', function() {
        jest.mock('DatabaseManager', {
            select: jest.fn(function() {
                throw new Error('DB连接错误');
            })
        });

        expect(function() {
            fetchData();
        }).toThrow('DB连接错误');
    });
});
```

## TenantDatabase 的模拟

```javascript
describe('租户DB操作', function() {
    afterEach(function() {
        jest.unmock('TenantDatabase');
    });

    it('应在事务内执行 INSERT', function() {
        let mockConnection = {
            query: jest.fn().mockReturnValue({ hitCount: 1, data: [] }),
            update: jest.fn().mockReturnValue(1)
        };

        jest.mock('TenantDatabase', {
            getConnection: jest.fn().mockReturnValue(mockConnection)
        });

        registerData({ code: '001', name: '测试' });

        expect(TenantDatabase.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConnection.update).toHaveBeenCalledTimes(1);
    });
});
```

## PublicStorage 的模拟

```javascript
describe('文件操作', function() {
    afterEach(function() {
        jest.unmock('PublicStorage');
    });

    it('应正常读取文件', function() {
        jest.mock('PublicStorage', {
            read: jest.fn().mockReturnValue('文件内容'),
            exists: jest.fn().mockReturnValue(true),
            write: jest.fn(),
            remove: jest.fn()
        });

        let content = readFile('test.txt');

        expect(PublicStorage.exists).toHaveBeenCalledWith('test.txt');
        expect(PublicStorage.read).toHaveBeenCalledWith('test.txt');
        expect(content).toBe('文件内容');
    });

    it('文件不存在时应返回 null', function() {
        jest.mock('PublicStorage', {
            exists: jest.fn().mockReturnValue(false),
            read: jest.fn()
        });

        let content = readFile('notfound.txt');

        expect(PublicStorage.read).not.toHaveBeenCalled();
        expect(content).toBeNull();
    });
});
```

## Logger 的模拟

```javascript
describe('日志输出', function() {
    afterEach(function() {
        jest.unmock('Logger');
    });

    it('发生错误时应调用 Logger.error', function() {
        jest.mock('Logger', {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        });

        // 执行会产生错误的处理
        processWithError();

        expect(Logger.error).toHaveBeenCalledTimes(1);
        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('发生了错误')
        );
    });
});
```

## Transfer 的模拟

```javascript
describe('画面跳转', function() {
    afterEach(function() {
        jest.unmock('Transfer');
    });

    it('应跳转至错误页面', function() {
        jest.mock('Transfer', {
            toErrorPage: jest.fn()
        });

        transferErrorPage('E001', '系统错误');

        expect(Transfer.toErrorPage).toHaveBeenCalledWith({
            title: 'システムエラーが発生しました',
            message: 'E001\n系统错误'
        });
    });
});
```

## HTTPClient 的模拟

```javascript
describe('外部API调用', function() {
    afterEach(function() {
        jest.unmock('HTTPClient');
    });

    it('应返回 GET 请求的结果', function() {
        jest.mock('HTTPClient', {
            get: jest.fn().mockReturnValue({
                status: 200,
                body: '{"data": [1, 2, 3]}'
            }),
            post: jest.fn()
        });

        let result = callExternalApi('/api/data');

        expect(HTTPClient.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ data: [1, 2, 3] });
    });

    it('HTTP 错误时应返回 null', function() {
        jest.mock('HTTPClient', {
            get: jest.fn().mockReturnValue({
                status: 500,
                body: ''
            })
        });

        let result = callExternalApi('/api/data');

        expect(result).toBeNull();
    });
});
```

## 同时模拟多个 API 的情况

```javascript
describe('复合处理', function() {
    beforeEach(function() {
        jest.clearAllMocks();
    });

    afterEach(function() {
        jest.unmock('DatabaseManager');
        jest.unmock('Logger');
        jest.unmock('Transfer');
    });

    it('DB 注册后应输出日志', function() {
        jest.mock('DatabaseManager', {
            insert: jest.fn().mockReturnValue(1)
        });
        jest.mock('Logger', {
            info: jest.fn(),
            error: jest.fn()
        });

        registerItem({ code: '001', name: '测试' });

        expect(DatabaseManager.insert).toHaveBeenCalledTimes(1);
        expect(Logger.info).toHaveBeenCalledWith(
            expect.stringContaining('注册完成')
        );
    });

    it('DB 注册失败时应记录错误日志并跳转至错误页面', function() {
        jest.mock('DatabaseManager', {
            insert: jest.fn(function() {
                throw new Error('唯一约束违反');
            })
        });
        jest.mock('Logger', {
            info: jest.fn(),
            error: jest.fn()
        });
        jest.mock('Transfer', {
            toErrorPage: jest.fn()
        });

        registerItem({ code: '001', name: '测试' });

        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('唯一约束违反')
        );
        expect(Transfer.toErrorPage).toHaveBeenCalledTimes(1);
    });
});
```
