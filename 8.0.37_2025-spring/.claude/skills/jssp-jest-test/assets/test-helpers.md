# テスト共通パターン・Tips

## 概要

jest-on-rhino でテストを書く際の共通パターンと、よくある注意点をまとめたもの。

## beforeEach / afterEach の基本構成

```javascript
describe('モジュール名', function() {
    beforeEach(function() {
        jest.clearAllMocks();
    });

    afterEach(function() {
        // jest.mock() で注入した全てのモックを解除
        jest.unmock('DatabaseManager');
        jest.unmock('Logger');
        jest.unmock('Transfer');
    });

    // テストケース...
});
```

## ソース関数の一時差し替え

sourcePathMapping でソースが同一スコープに読み込まれるため、テスト内でソース関数を一時的に差し替えることができる。
**必ず復元すること。**

```javascript
describe('main', function() {
    it('processBusinessLogic が例外を投げた場合の挙動', function() {
        // 元の関数を退避
        let original = processBusinessLogic;

        // 差し替え
        processBusinessLogic = function() {
            throw new Error('テスト用エラー');
        };

        let response = main({});
        expect(response.result).toBeNull();

        // 復元
        processBusinessLogic = original;
    });
});
```

## load() による外部ファイル読み込み

sourcePathMapping で自動解決されないファイル（共通ユーティリティ等）は
`load()` で明示的に読み込む。

```javascript
// テストファイルの先頭で共通処理を読み込む
load('src/main/jssp/src/common/util/string_util.js');

describe('formatCode', function() {
    it('コードが左ゼロ埋めされること', function() {
        // string_util.js 内の関数を直接呼び出せる
        let result = formatCode('42', 5);
        expect(result).toBe('00042');
    });
});
```

## it.each / describe.each によるパラメータ化テスト

同じ構造のテストを複数パターンで実行する場合に使用する。

```javascript
describe('入力バリデーション', function() {
    it.each([
        ['null', null],
        ['undefined', undefined],
        ['空文字', ''],
        ['空白のみ', '   ']
    ])('入力が%sの場合にfalseを返すこと', function(label, value) {
        let result = validateInput(value);
        expect(result).toBe(false);
    });

    it.each([
        ['半角英字', 'ABC', true],
        ['半角数字', '123', true],
        ['半角英数字', 'ABC123', true],
        ['日本語', 'テスト', false],
        ['記号含む', 'ABC-123', false]
    ])('入力が%sの場合に%sを返すこと', function(label, value, expected) {
        let result = isAlphanumeric(value);
        expect(result).toBe(expected);
    });
});
```

## expect マッチャーの使い分け

### 値の一致

```javascript
// 厳密一致（プリミティブ値）
expect(result).toBe('expected');
expect(count).toBe(10);
expect(flag).toBe(true);

// オブジェクト・配列の一致（深い比較）
expect(obj).toEqual({ key: 'value' });
expect(arr).toEqual([1, 2, 3]);

// 部分一致（オブジェクトの一部プロパティのみ検証）
expect(obj).toMatchObject({ key: 'value' });

// 配列長
expect(list).toHaveLength(5);
```

### プロパティの存在

```javascript
// プロパティが存在すること
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('nested.key');

// プロパティの値も検証
expect(obj).toHaveProperty('key', 'value');
```

### 型チェック

```javascript
// expect.any で型を検証
expect(obj).toMatchObject({
    id: expect.any(String),
    count: expect.any(Number),
    items: expect.any(Array)
});
```

### 関数呼び出し

```javascript
// 呼び出し回数
expect(mockFn).toHaveBeenCalledTimes(1);

// 引数の検証
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

// 部分一致での引数検証
expect(mockFn).toHaveBeenCalledWith(
    expect.stringContaining('エラー')
);
expect(mockFn).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'タイトル' })
);

// 呼ばれていないこと
expect(mockFn).not.toHaveBeenCalled();
```

### 例外

```javascript
// 例外がスローされること
expect(function() {
    targetFunction(null);
}).toThrow();

// メッセージ付き
expect(function() {
    targetFunction(null);
}).toThrow('引数が不正です');
```

## jest.fn() の戻り値設定

```javascript
// 固定値を返す
let mockFn = jest.fn().mockReturnValue('固定値');

// 呼び出しごとに異なる値を返す
let mockFn = jest.fn()
    .mockReturnValueOnce('1回目')
    .mockReturnValueOnce('2回目')
    .mockReturnValue('3回目以降');

// 関数で戻り値を動的に決定
let mockFn = jest.fn(function(input) {
    return input + '_processed';
});
```

## jest.spyOn の使い方

同一スコープ内のオブジェクトのメソッドを監視する。

```javascript
describe('spyOn の例', function() {
    it('JSON.parse の呼び出しを監視できる', function() {
        let spy = jest.spyOn(JSON, 'parse');

        let result = JSON.parse('{"key": "value"}');

        expect(spy).toHaveBeenCalledWith('{"key": "value"}');
        expect(result).toEqual({ key: 'value' });

        spy.mockRestore();
    });
});
```
