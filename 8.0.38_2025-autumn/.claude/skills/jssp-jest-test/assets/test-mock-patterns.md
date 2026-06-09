# プラットフォーム API モックパターン実例集

## 概要

intra-mart のプラットフォーム API はテストスコープに存在しないため、`jest.mock()` でグローバルに注入する必要がある。
本ファイルは API ごとのモック例を示す。

## 基本ルール

1. `jest.mock('API名', { ... })` でスコープにグローバル変数として注入される
2. `afterEach` で `jest.unmock('API名')` して必ず復元する
3. `jest.clearAllMocks()` は `beforeEach` で呼び出す

## DatabaseManager のモック

```javascript
describe('データ取得処理', function() {
    beforeEach(function() {
        jest.clearAllMocks();
    });

    afterEach(function() {
        jest.unmock('DatabaseManager');
    });

    it('SELECT結果をリストとして返却すること', function() {
        jest.mock('DatabaseManager', {
            select: jest.fn().mockReturnValue([
                { id: '001', name: 'テスト1' },
                { id: '002', name: 'テスト2' }
            ]),
            insert: jest.fn().mockReturnValue(1),
            update: jest.fn().mockReturnValue(1),
            remove: jest.fn().mockReturnValue(1)
        });

        let result = fetchData();

        expect(DatabaseManager.select).toHaveBeenCalledTimes(1);
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ id: '001', name: 'テスト1' });
    });

    it('SELECT結果が0件の場合は空配列を返すこと', function() {
        jest.mock('DatabaseManager', {
            select: jest.fn().mockReturnValue([])
        });

        let result = fetchData();

        expect(result).toEqual([]);
    });

    it('DBエラー時に例外がスローされること', function() {
        jest.mock('DatabaseManager', {
            select: jest.fn(function() {
                throw new Error('DB接続エラー');
            })
        });

        expect(function() {
            fetchData();
        }).toThrow('DB接続エラー');
    });
});
```

## TenantDatabase のモック

```javascript
describe('テナントDB操作', function() {
    afterEach(function() {
        jest.unmock('TenantDatabase');
    });

    it('トランザクション内でINSERTが実行されること', function() {
        let mockConnection = {
            query: jest.fn().mockReturnValue({ hitCount: 1, data: [] }),
            update: jest.fn().mockReturnValue(1)
        };

        jest.mock('TenantDatabase', {
            getConnection: jest.fn().mockReturnValue(mockConnection)
        });

        registerData({ code: '001', name: 'テスト' });

        expect(TenantDatabase.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConnection.update).toHaveBeenCalledTimes(1);
    });
});
```

## PublicStorage のモック

```javascript
describe('ファイル操作', function() {
    afterEach(function() {
        jest.unmock('PublicStorage');
    });

    it('ファイルが正常に読み込まれること', function() {
        jest.mock('PublicStorage', {
            read: jest.fn().mockReturnValue('ファイル内容'),
            exists: jest.fn().mockReturnValue(true),
            write: jest.fn(),
            remove: jest.fn()
        });

        let content = readFile('test.txt');

        expect(PublicStorage.exists).toHaveBeenCalledWith('test.txt');
        expect(PublicStorage.read).toHaveBeenCalledWith('test.txt');
        expect(content).toBe('ファイル内容');
    });

    it('ファイルが存在しない場合はnullを返すこと', function() {
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

## Logger のモック

```javascript
describe('ログ出力', function() {
    afterEach(function() {
        jest.unmock('Logger');
    });

    it('エラー発生時にLogger.errorが呼ばれること', function() {
        jest.mock('Logger', {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        });

        // エラーを発生させる処理を実行
        processWithError();

        expect(Logger.error).toHaveBeenCalledTimes(1);
        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('エラーが発生しました')
        );
    });
});
```

## Transfer のモック

```javascript
describe('画面遷移', function() {
    afterEach(function() {
        jest.unmock('Transfer');
    });

    it('エラーページに遷移すること', function() {
        jest.mock('Transfer', {
            toErrorPage: jest.fn()
        });

        transferErrorPage('E001', 'システムエラー');

        expect(Transfer.toErrorPage).toHaveBeenCalledWith({
            title: 'システムエラーが発生しました',
            message: 'E001\nシステムエラー'
        });
    });
});
```

## HTTPClient のモック

```javascript
describe('外部API呼び出し', function() {
    afterEach(function() {
        jest.unmock('HTTPClient');
    });

    it('GETリクエストの結果を返却すること', function() {
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

    it('HTTPエラー時にnullを返すこと', function() {
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

## 複数 API を同時にモックする場合

```javascript
describe('複合処理', function() {
    beforeEach(function() {
        jest.clearAllMocks();
    });

    afterEach(function() {
        jest.unmock('DatabaseManager');
        jest.unmock('Logger');
        jest.unmock('Transfer');
    });

    it('DB登録後にログ出力されること', function() {
        jest.mock('DatabaseManager', {
            insert: jest.fn().mockReturnValue(1)
        });
        jest.mock('Logger', {
            info: jest.fn(),
            error: jest.fn()
        });

        registerItem({ code: '001', name: 'テスト' });

        expect(DatabaseManager.insert).toHaveBeenCalledTimes(1);
        expect(Logger.info).toHaveBeenCalledWith(
            expect.stringContaining('登録完了')
        );
    });

    it('DB登録失敗時にエラーログとエラーページ遷移が行われること', function() {
        jest.mock('DatabaseManager', {
            insert: jest.fn(function() {
                throw new Error('一意制約違反');
            })
        });
        jest.mock('Logger', {
            info: jest.fn(),
            error: jest.fn()
        });
        jest.mock('Transfer', {
            toErrorPage: jest.fn()
        });

        registerItem({ code: '001', name: 'テスト' });

        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('一意制約違反')
        );
        expect(Transfer.toErrorPage).toHaveBeenCalledTimes(1);
    });
});
```
