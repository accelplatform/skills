# Java API ラッパー リファレンス

## 登録ファイル

ラッパークラスは、モジュールの `conf/products/initializer/` に置いた登録ファイルで JSSP に登録する。
プラットフォームはサーバ起動時に、有効なモジュールごとに次のファイル名の登録ファイルを読み込み、`<api-class>` に書かれたクラスを JSSP の API として登録する。

### 配置先とファイル名

| 項目 | 内容 |
|------|------|
| 配置先（プロジェクト） | `src/main/conf/products/initializer/` |
| ファイル名 | `initializer-{モジュール ID の最後の . より後ろの部分}.xml` |
| 例 | モジュール ID `com.example.test-imds` → `initializer-test-imds.xml` |

- モジュール ID は `module.xml` の `<id>` で確認する
- ファイル名にモジュール ID 全体（`initializer-com.example.test-imds.xml`）を使うと読み込まれない

### 書式

```xml
<?xml version="1.0" encoding="UTF-8"?>
<initializer-config
    xmlns="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config initializer-config.xsd">

  <java-script-api>
    <api-class>{ラッパークラスの完全修飾名}</api-class>
    <!-- ラッパークラスが複数ある場合は api-class を並べる -->
  </java-script-api>

</initializer-config>
```

| 要素 | 内容 |
|------|------|
| `initializer-config` | ルート要素。名前空間は上記のとおり |
| `java-script-api` | JSSP API の登録。`initializer-config` 直下に 0〜1 個 |
| `api-class` | 登録するラッパークラスの完全修飾名。0 個以上 |

- 要素の順序・個数はスキーマ（`initializer-config.xsd`）で決まっており、ビルド時に検証される
- 本スキルでは `java-script-api` / `api-class` のみを使用する

### 登録されない例

| 誤り | 結果 |
|------|------|
| jar の中に `system-install_*.xml` を置く | 登録されない（JSSP から呼び出すと `ReferenceError: "{名前}" is not defined.`） |
| ファイル名がモジュール ID の末尾と一致しない | 登録ファイルが読み込まれない |
| 登録ファイルを追加・変更した後にサーバを再起動していない | 変更が反映されない |

## ラッパークラス

### 基本構成

| 項目 | 内容 |
|------|------|
| 継承するクラス | `jp.co.intra_mart.system.javascript.ScriptableObject` |
| JSSP 側の名前 | `getClassName()` の戻り値 |
| アノテーションのパッケージ | `jp.co.intra_mart.system.javascript.annotations` |

### アノテーション

| アノテーション | 付与先 | JSSP からの呼び出し方 |
|--------------|-------|---------------------|
| `@JSStaticFunction` | `public static` メソッド | `{名前}.{メソッド名}(...)` |
| `@JSConstructor` | `public static Object constructor(Context, Object[], Function, boolean)` | `new {名前}(...)` |
| `@JSFunction` | インスタンスメソッド | `new {名前}(...)` で生成したインスタンスの `{メソッド名}(...)` |

`@JSConstructor` のメソッドの引数:

| 引数 | 型 | 内容 |
|------|----|------|
| 第 1 引数 | `jp.co.intra_mart.system.javascript.Context` | 実行コンテキスト |
| 第 2 引数 | `Object[]` | JSSP から渡された引数 |
| 第 3 引数 | `jp.co.intra_mart.system.javascript.Function` | コンストラクタ関数 |
| 第 4 引数 | `boolean` | `new` 演算子で呼び出された場合 `true` |

インスタンス型のラッパーには、引数なしの `public` コンストラクタも定義する。

## 引数の型変換

### Object 型で受け取った場合の Java 側の型

JSSP から渡した値を `Object` 型の引数で受け取ると、Java 側では次の型になる。

| JSSP から渡す値 | 例 | Java 側の型 |
|----------------|----|------------|
| 文字列 | `'text'` | `java.lang.String` |
| 数値 | `123` | `java.lang.Double` |
| 真偽値 | `true` | `java.lang.Boolean` |
| 配列 | `[1, 2]` | `jp.co.intra_mart.system.javascript.NativeArray` |
| オブジェクト | `{ key: 'value' }` | `jp.co.intra_mart.system.javascript.NativeObject` |
| null | `null` | `null` |

整数を渡しても `java.lang.Double` になるため、整数として扱う場合は Java 側で変換する。

### 変換に使うメソッド

| 用途 | メソッド |
|------|---------|
| 文字列に変換 | `ScriptRuntime.toString(Object)` |
| 数値（`double`）に変換 | `ScriptRuntime.toNumber(Object)` |
| 配列の要素数 | `NativeArray.getLength()` |
| 配列の要素 | `NativeArray.get(int, Scriptable)`（第 2 引数には配列自身を渡す） |

`ScriptRuntime` / `NativeArray` / `Scriptable` はいずれも `jp.co.intra_mart.system.javascript` パッケージのクラス。

### String 型・double 型の引数と戻り値

- 引数を `String` 型で宣言したメソッドは、JSSP から渡した文字列をそのまま受け取れる
- 戻り値を `String` 型・`double` 型で宣言したメソッドの戻り値は、JSSP 側で文字列・数値として扱える

## 例外

ラッパー（またはラッパーから呼び出した Java 処理）が例外をスローすると、JSSP 側では `try-catch` で捕捉できる。

| プロパティ | 値 | 例 |
|-----------|----|----|
| `e.name` | `JavaException` | `JavaException` |
| `e.message` | `{例外クラスの完全修飾名}: {例外メッセージ}` | `java.lang.IllegalStateException: expected error` |

```javascript
try {
  SampleDummy.fail('expected error');
} catch (e) {
  // e.name    => 'JavaException'
  // e.message => 'java.lang.IllegalStateException: expected error'
}
```

`e.message` には Java の例外クラス名が含まれるため、JSSP の画面にそのまま表示しないこと。

## d.ts 型定義

- `d.ts/` 配下に置いた `.d.ts` は `check-types.sh`（`tsconfig.check.json` の `d.ts/**/*.d.ts`）の対象になる
- プラットフォーム標準の型定義（`d.ts/platform/` / `d.ts/tenant/`）と分けるため、自作 API の型定義は `d.ts/custom/` に置く
- 静的関数型は `static` メソッド、インスタンス型は `constructor` とインスタンスメソッドとして `declare class` に宣言する
