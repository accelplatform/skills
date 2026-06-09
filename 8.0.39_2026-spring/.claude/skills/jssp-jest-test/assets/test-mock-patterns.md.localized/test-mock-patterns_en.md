# Platform API Mock Pattern Examples

## Overview

Platform APIs for intra-mart do not exist in the test scope, so they must be injected globally using `jest.mock()`.
This file shows mock examples for each API.

## Basic Rules

1. `jest.mock('API name', { ... })` injects the API as a global variable into the scope
2. Always restore with `jest.unmock('API name')` in `afterEach`
3. Call `jest.clearAllMocks()` in `beforeEach`

## Mocking DatabaseManager

```javascript
describe('data retrieval processing', function() {
    beforeEach(function() {
        jest.clearAllMocks();
    });

    afterEach(function() {
        jest.unmock('DatabaseManager');
    });

    it('should return SELECT results as a list', function() {
        jest.mock('DatabaseManager', {
            select: jest.fn().mockReturnValue([
                { id: '001', name: 'Test 1' },
                { id: '002', name: 'Test 2' }
            ]),
            insert: jest.fn().mockReturnValue(1),
            update: jest.fn().mockReturnValue(1),
            remove: jest.fn().mockReturnValue(1)
        });

        let result = fetchData();

        expect(DatabaseManager.select).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ id: '001', name: 'Test 1' });
    });

    it('should return an empty array when SELECT returns 0 results', function() {
        jest.mock('DatabaseManager', {
            select: jest.fn().mockReturnValue([])
        });

        let result = fetchData();

        expect(result).toEqual([]);
    });

    it('should throw an exception on DB error', function() {
        jest.mock('DatabaseManager', {
            select: jest.fn(function() {
                throw new Error('DB connection error');
            })
        });

        expect(function() {
            fetchData();
        }).toThrow('DB connection error');
    });
});
```

## Mocking TenantDatabase

```javascript
describe('tenant DB operations', function() {
    afterEach(function() {
        jest.unmock('TenantDatabase');
    });

    it('should execute INSERT within a transaction', function() {
        let mockConnection = {
            query: jest.fn().mockReturnValue({ hitCount: 1, data: [] }),
            update: jest.fn().mockReturnValue(1)
        };

        jest.mock('TenantDatabase', {
            getConnection: jest.fn().mockReturnValue(mockConnection)
        });

        registerData({ code: '001', name: 'Test' });

        expect(TenantDatabase.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConnection.update).toHaveBeenCalledTimes(1);
    });
});
```

## Mocking PublicStorage

```javascript
describe('file operations', function() {
    afterEach(function() {
        jest.unmock('PublicStorage');
    });

    it('should read a file successfully', function() {
        jest.mock('PublicStorage', {
            read: jest.fn().mockReturnValue('file contents'),
            exists: jest.fn().mockReturnValue(true),
            write: jest.fn(),
            remove: jest.fn()
        });

        let content = readFile('test.txt');

        expect(PublicStorage.exists).toHaveBeenCalledWith('test.txt');
        expect(PublicStorage.read).toHaveBeenCalledWith('test.txt');
        expect(content).toBe('file contents');
    });

    it('should return null when file does not exist', function() {
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

## Mocking Logger

```javascript
describe('log output', function() {
    afterEach(function() {
        jest.unmock('Logger');
    });

    it('Logger.error should be called when an error occurs', function() {
        jest.mock('Logger', {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        });

        // Execute the process that causes an error
        processWithError();

        expect(Logger.error).toHaveBeenCalledTimes(1);
        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('an error has occurred')
        );
    });
});
```

## Mocking Transfer

```javascript
describe('screen navigation', function() {
    afterEach(function() {
        jest.unmock('Transfer');
    });

    it('should navigate to the error page', function() {
        jest.mock('Transfer', {
            toErrorPage: jest.fn()
        });

        transferErrorPage('E001', 'system error');

        expect(Transfer.toErrorPage).toHaveBeenCalledWith({
            title: 'システムエラーが発生しました',
            message: 'E001\nsystem error'
        });
    });
});
```

## Mocking HTTPClient

```javascript
describe('external API calls', function() {
    afterEach(function() {
        jest.unmock('HTTPClient');
    });

    it('should return the result of a GET request', function() {
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

    it('should return null on HTTP error', function() {
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

## Mocking Multiple APIs Simultaneously

```javascript
describe('composite processing', function() {
    beforeEach(function() {
        jest.clearAllMocks();
    });

    afterEach(function() {
        jest.unmock('DatabaseManager');
        jest.unmock('Logger');
        jest.unmock('Transfer');
    });

    it('should output a log after DB registration', function() {
        jest.mock('DatabaseManager', {
            insert: jest.fn().mockReturnValue(1)
        });
        jest.mock('Logger', {
            info: jest.fn(),
            error: jest.fn()
        });

        registerItem({ code: '001', name: 'Test' });

        expect(DatabaseManager.insert).toHaveBeenCalledTimes(1);
        expect(Logger.info).toHaveBeenCalledWith(
            expect.stringContaining('registration complete')
        );
    });

    it('should log an error and navigate to error page on DB registration failure', function() {
        jest.mock('DatabaseManager', {
            insert: jest.fn(function() {
                throw new Error('unique constraint violation');
            })
        });
        jest.mock('Logger', {
            info: jest.fn(),
            error: jest.fn()
        });
        jest.mock('Transfer', {
            toErrorPage: jest.fn()
        });

        registerItem({ code: '001', name: 'Test' });

        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('unique constraint violation')
        );
        expect(Transfer.toErrorPage).toHaveBeenCalledTimes(1);
    });
});
```
