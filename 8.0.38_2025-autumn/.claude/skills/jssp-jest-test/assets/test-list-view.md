# 一覧画面ファンクションコンテナのテスト実例

## 概要

一覧画面の FC（init / main / processBusinessLogic / transferErrorPage）の単体テストパターン。
product_stock2 画面をベースにした実例。

## processBusinessLogic のテスト

ビジネスロジックの戻り値を直接検証する。プラットフォーム API に依存しない場合はモック不要。

```javascript
describe('processBusinessLogic', function() {
    it('リストが返却されること', function() {
        let result = processBusinessLogic({});
        expect(result).toHaveProperty('list');
        expect(Array.isArray(result.list)).toBe(true);
        expect(result.list.length).toBeGreaterThan(0);
    });

    it('リストの件数が25件であること', function() {
        let result = processBusinessLogic({});
        expect(result.list).toHaveLength(25);
    });

    it('各レコードに必須プロパティが含まれること', function() {
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

    it('先頭レコードの値が正しいこと', function() {
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

    it('商品コードが全レコードでユニークであること', function() {
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
    ])('requestが%sでも動作すること', function(label, value) {
        let result = processBusinessLogic(value);
        expect(result).toHaveProperty('list');
        expect(result.list.length).toBeGreaterThan(0);
    });
});
```

## main のテスト

プラットフォーム API（Logger, Transfer）をモックして正常系・異常系を検証する。

```javascript
describe('main', function() {
    beforeEach(function() {
        jest.clearAllMocks();
    });

    afterEach(function() {
        jest.unmock('Logger');
        jest.unmock('Transfer');
    });

    it('正常系: レスポンス構造が正しいこと', function() {
        let response = main({});

        expect(response).toMatchObject({
            result: expect.objectContaining({ list: expect.any(Array) }),
            error: { code: '', message: '' }
        });
    });

    it('正常系: result.list が25件返却されること', function() {
        let response = main({});
        expect(response.result.list).toHaveLength(25);
    });

    it('正常系: requestがnullでも動作すること', function() {
        let response = main(null);
        expect(response).toHaveProperty('result');
        expect(response.result).not.toBeNull();
    });

    it('異常系: processBusinessLogic が例外を投げた場合、Logger.error と transferErrorPage が呼ばれること', function() {
        jest.mock('Logger', {
            error: jest.fn()
        });
        jest.mock('Transfer', {
            toErrorPage: jest.fn()
        });

        // ソース関数を一時的に差し替え
        let original = processBusinessLogic;
        processBusinessLogic = function() {
            throw new Error('DB接続エラー');
        };

        let response = main({});

        expect(Logger.error).toHaveBeenCalledTimes(1);
        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('DB接続エラー')
        );

        expect(Transfer.toErrorPage).toHaveBeenCalledTimes(1);
        expect(Transfer.toErrorPage).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'システムエラーが発生しました'
            })
        );

        expect(response.result).toBeNull();
        expect(response.error).toEqual({ code: '', message: '' });

        // 関数を復元
        processBusinessLogic = original;
    });
});
```

## init のテスト

バインド変数 `$data` への JSON セットを検証する。

```javascript
describe('init', function() {
    it('$data にJSON文字列がセットされること', function() {
        init({});

        expect(typeof $data).toBe('string');
        let parsed = JSON.parse($data);
        expect(parsed).toMatchObject({
            result: expect.objectContaining({ list: expect.any(Array) }),
            error: expect.any(Object)
        });
        expect(parsed.result.list).toHaveLength(25);
    });

    it('$data 内のスラッシュがエスケープされていること', function() {
        init({});

        // JSON.stringify 後に / が \/ にエスケープされている
        // エスケープ後も正常にパースできること
        let parsed = JSON.parse($data);
        expect(parsed).toHaveProperty('result');
    });
});
```

## transferErrorPage のテスト

Transfer API のモックで引数を検証する。

```javascript
describe('transferErrorPage', function() {
    afterEach(function() {
        jest.unmock('Transfer');
    });

    it('Transfer.toErrorPage が正しい引数で呼ばれること', function() {
        jest.mock('Transfer', {
            toErrorPage: jest.fn()
        });

        transferErrorPage('E001', '予期しないエラーが発生しました。');

        expect(Transfer.toErrorPage).toHaveBeenCalledTimes(1);
        expect(Transfer.toErrorPage).toHaveBeenCalledWith({
            title: 'システムエラーが発生しました',
            message: 'E001\n予期しないエラーが発生しました。'
        });
    });
});
```
