---
name: jssp-jest-test
description: jest-on-rhino を使ったファンクションコンテナ（.js）の単体テスト作成を支援する。テストコード作成、モック、Rhino 制約（ES5）への対応方法を提供する。テストを書く、テストを作成する、mock、jest、spyOn、ユニットテスト、単体テスト、テストケースを追加、カバレッジを上げる、と言及されたときに使用。ファンクションコンテナに対するテストは Playwright ではなくこのスキルを使うこと。
---

■■ 参照ルール チェックリスト（必須） ■■

実装着手前に、以下を確認すること。未チェック項目がある場合は着手不可。

- [ ] [jssp-file-structure](../../../requirements/jssp-file-structure/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-testing](../../../requirements/jssp-testing/AGENTS.md) を参照し、内容を理解した


# jest-on-rhino テスト開発ガイド

## 概要

intra-mart Accel Platform のファンクションコンテナ（js）に対する単体テストを、Jest on Rhino を使用して作成するためのスキルセット。
Jest 互換の API で記述し、Rhino 1.7R4（ES5 相当）上で実行する。

## 使用タイミング

ユーザが以下のような依頼をした場合：
- 「○○のテストを作成して」
- 「ファンクションコンテナのテストを書いて」
- 「単体テストを追加して」
- 「Jest でテストを書いて」
- 「mock を使ったテストを書いて」

## テスト生成手順

1. 対象のファンクションコンテナ（js）を読み込む
2. テスト対象の関数・ロジックを特定する
3. `{{AGENT_RULES}}/jssp-testing{{AGENT_RULE_FILE}}.md` のテスト観点に基づいてテストケースを設計する
4. 本スキルのテンプレート・モックパターンに従ってテストコードを生成する
5. 「テストの実行」の手順でテストを実行し、全件パスするまで修正する

## テストの実行

テストは **js-jest（Maven プラグイン）** で実行する。`npm test` ではないので注意すること。

```bash
mvn jp.co.intra_mart:js-jest:test
```

- プロジェクトルート（`pom.xml` のある階層）で実行する
- ゴールは `test`（`jp.co.intra_mart:js-jest:test`）
- 対象・設定は `jest.config.js` の `testMatch` / `sourcePathMapping` に従う
- 実行結果にテスト件数・カバレッジ（`target/coverage/` に出力）が表示される
- **テストコードを生成・修正したら必ず実行し、全件パスすることを確認する**

## テスト実行時のスコープ解決の仕組み

### テストファイルごとのスコープ分離

各テストファイルは独立した Rhino スコープ（JavaScript 実行コンテキスト）で実行される。
テストファイル間でグローバル変数は共有されない。

### 実行ライフサイクル（テストファイル1つあたり）

```
1. 新しいスコープ作成（JS 標準オブジェクト: Object, Array, String, Math, JSON 等を初期化）
2. setupFiles の読み込み（設定されている場合）
3. Jest グローバル関数の注入（describe, it, expect, jest, console 等）
4. setupFilesAfterEnv の読み込み（設定されている場合）
5. sourcePathMapping によるソースファイルの読み込み（同じスコープに評価）
6. テストファイルの読み込み・評価（describe/it が登録される）
7. 登録されたテストの実行（beforeAll → beforeEach → test → afterEach → afterAll）
8. スコープ破棄
```

### sourcePathMapping のスコープ解決ルール

テストファイルのパスから対応するソースファイルを特定し、同一スコープに読み込む:

```
テスト: src/test/jssp/src/{category}/view/index.test.js
  → プレフィックス除去: {category}/view/index.test.js
  → 拡張子置換: {category}/view/index.js
  → ソースパス: src/main/jssp/src/{category}/view/index.js
```

ソースファイルはテストファイルと**同一のスコープ**に評価される。
ソース内で定義された関数・変数はテストコードから直接アクセス可能。

### スコープ内で利用可能なもの

| カテゴリ | 利用可能なもの |
|---------|---------------|
| JS標準オブジェクト | Object, Array, String, Number, Math, JSON, RegExp, Date, Error 等 |
| Jest API | `describe`, `it`, `test`, `expect`, `jest`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll` |
| エイリアス | `xdescribe`(skip), `fdescribe`(only), `xit`(skip), `fit`(only), `xtest`(skip) |
| console | `console.log`, `console.error`, `console.warn`, `console.info` |
| ソースコード | sourcePathMapping 経由で読み込まれた関数・変数 |
| 追加読み込み | `load()` で明示的に読み込んだファイルの関数・変数 |

### テストコードへの影響

- ソースの関数は `load()` なしで直接呼び出せる
- ソースで定義したグローバル変数もそのまま参照可能
- 別テストファイルで定義した変数は見えない（スコープ分離）
- **プラットフォーム API はスコープに存在しないため、mock で注入する必要がある**

## Rhino 制約（重要: 必ず守ること）

このプロジェクトは Rhino 1.7R4（ES5 相当）で動作する。以下の制約を必ず守ること:

| 禁止事項 | 代替手段 |
|---------|---------|
| `() => {}` (arrow function) | `function() {}` を使う |
| `async` / `await` | 同期テストまたは `done` コールバック |
| `Promise` / `.resolves` / `.rejects` | `done` コールバックを使用 |
| `require()` | `load()` を使用 |
| `Function.prototype.bind` | クロージャで代替 |
| テンプレートリテラル `` `${}` `` | `"str" + 変数名` で連結 |
| `class` 構文 | `function` + `prototype` |
| 分割代入 `{a, b} = obj` | `let a = obj.a;` |
| スプレッド `...args` | 明示的に引数を列挙 |
| `for...of` | `for (let i = 0; ...)` |
| `Object.assign` | 手動コピー |

※ 変数宣言は本体コーディング規約に従い `let` を使用すること（`var` は非推奨）。

### ソースロード失敗時のフォールバック関数における var の使用

ソースファイルが Rhino でロードできない場合（例: `/** @type {T} */ (expr)` 形式の JSDoc 型キャストを含む場合）、テストファイル内にフォールバック関数をベアグローバル代入で定義することがある:

```javascript
// ソースがロードできないためテストファイル内でフォールバック定義
processBusinessLogic = function(request) {
  var db = new TenantDatabase();  // ← let ではなく var を使うこと
  // ...
};
```

この形式の関数本体内で `let` を使うと Rhino が `"missing ) after condition"` のパースエラーを起こすため、**この関数本体内に限り `var` を使用する**。
`describe/it` コールバック内や通常のスコープでは `let` を使うこと。

根本対処はソース側の Rhino 非互換な構文を修正すること（上記の例では JSDoc 型キャストを除去する）。フォールバックへの依存はあくまで暫定対応として扱うこと。

## テストコードの基本テンプレート

```javascript
describe('モジュール名', function() {
  // テストごとに初期化
  beforeEach(function() {
    jest.clearAllMocks();
  });

  describe('関数名', function() {
    it('正常系の動作', function() {
      let result = targetFunction('input');
      expect(result).toBe('expected');
    });

    it('異常系の動作', function() {
      expect(function() {
        targetFunction(null);
      }).toThrow('error message');
    });
  });
});
```

## モックパターン

jest.fn() / jest.spyOn() の基本的な使い方は標準 Jest API と同じ。
ここでは jest-on-rhino **固有**のプラットフォーム API モックパターンのみ記載する。

### jest.mock() / jest.unmock() - プラットフォーム API のモック

intra-mart のグローバル API は以下のパターンでモックする:

```javascript
describe('グローバル API を使う関数のテスト', function() {
  afterEach(function() {
    jest.unmock('DatabaseManager');
  });

  it('データ取得の結果を処理する', function() {
    jest.mock('DatabaseManager', {
      select: jest.fn().mockReturnValue([
        { id: 1, name: 'テスト' }
      ]),
      insert: jest.fn().mockReturnValue(1)
    });

    let result = targetFunction();
    expect(DatabaseManager.select).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, name: 'テスト' }]);
  });
});
```

## 注意事項

jest.fn() / jest.spyOn() のモック管理、マッチャー、パラメータ化テスト（it.each / describe.each）、タイマーモック等の標準 Jest API はそのまま使用可能。
ただし **コード例は必ず ES5 構文（Rhino 制約）で記述すること**。

- Rhino 制約を必ず守ること（ES5 相当: arrow function, let/const, テンプレートリテラル等は使用不可）
- プラットフォーム API（DatabaseManager, PublicStorage 等）はスコープに存在しないため、`jest.mock()` で注入する
- `jest.mock()` で注入したモックは `afterEach` で `jest.unmock()` して必ず復元する
- テストファイル名は `.test.js` で終わること
