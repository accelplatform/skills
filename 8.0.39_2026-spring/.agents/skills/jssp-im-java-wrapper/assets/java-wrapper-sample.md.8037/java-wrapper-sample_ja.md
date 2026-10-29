# Java API ラッパーの完成品サンプル

JSSP から自作の Java 処理を呼び出すためのラッパー一式の完成品。静的関数型（`SampleDummy`）とインスタンス型（`SampleGreeter`）の 2 種類を示す。

## ファイル構成

```
src/main/java/com/example/test_imds/sample/
  ├── SampleDummyApi.java                    # ラッパーから呼び出す Java 側の処理（ダミー）
  └── javascript/
      ├── SampleDummyObject.java             # 静的関数型のラッパー（JSSP 名: SampleDummy）
      └── SampleGreeterObject.java           # インスタンス型のラッパー（JSSP 名: SampleGreeter）

src/main/conf/products/initializer/
  └── initializer-test-imds.xml              # 登録ファイル（モジュール ID: com.example.test-imds）

d.ts/custom/
  └── sample-java-wrapper.d.ts               # JSSP 側の型定義
```

生成時は次の箇所をプロジェクトに合わせて置き換える。

| 置き換える箇所 | 例 | 置き換え先 |
|--------------|----|-----------|
| パッケージ | `com.example.test_imds.sample` | プロジェクトのパッケージ |
| 登録ファイル名 | `initializer-test-imds.xml` | `initializer-{モジュール ID の末尾}.xml` |
| JSSP 側の名前 | `SampleDummy` / `SampleGreeter` | `getClassName()` の戻り値・d.ts のクラス名 |
| JavaDoc の `@author` / `@version` / `@since` | `test-imds` / `0.1.0` | プロジェクトの設定（`.agents/requirements/java-javadoc/AGENTS.md`） |

## Java 側の処理（SampleDummyApi.java）

ラッパーから呼び出す Java 側の処理の例。呼び出されたことを標準出力に出力する。実際の開発では、既存の Java API や業務処理のクラスに置き換える。

```java
package com.example.test_imds.sample;

/**
 * JSSP ラッパー検証用のダミー Java API。
 * <p>
 * 各メソッドは呼び出されたことを標準出力に出力します。
 * </p>
 * @author test-imds
 * @version 0.1.0
 * @since 0.1.0
 */
public final class SampleDummyApi {

  /** 標準出力に付与する接頭辞 */
  private static final String LOG_PREFIX = "[SampleDummyApi] ";

  /** 挨拶文の接頭辞 */
  private final String greetingPrefix;

  /**
   * インスタンスを生成します。
   *
   * @param greetingPrefix 挨拶文の接頭辞
   */
  public SampleDummyApi(final String greetingPrefix) {
    this.greetingPrefix = greetingPrefix;
    System.out.println(LOG_PREFIX + "constructor called: greetingPrefix=" + greetingPrefix);
  }

  /**
   * 挨拶文を返します。
   *
   * @param name 名前
   * @return 挨拶文
   */
  public static String hello(final String name) {
    System.out.println(LOG_PREFIX + "hello called: name=" + name);
    return "Hello, " + name;
  }

  /**
   * 数値の合計を返します。
   *
   * @param values 数値の配列
   * @return 合計
   */
  public static double sum(final double[] values) {
    double total = 0;
    for (final double value : values) {
      total += value;
    }
    System.out.println(LOG_PREFIX + "sum called: count=" + values.length + ", total=" + total);
    return total;
  }

  /**
   * 必ず例外をスローします。
   *
   * @param message 例外メッセージ
   */
  public static void fail(final String message) {
    System.out.println(LOG_PREFIX + "fail called: message=" + message);
    throw new IllegalStateException(message);
  }

  /**
   * 接頭辞付きの挨拶文を返します。
   *
   * @param name 名前
   * @return 接頭辞付きの挨拶文
   */
  public String greet(final String name) {
    System.out.println(LOG_PREFIX + "greet called: name=" + name);
    return greetingPrefix + name;
  }
}
```

## 静的関数型のラッパー（SampleDummyObject.java）

`@JSStaticFunction` を付与した `public static` メソッドが、JSSP の `SampleDummy.{メソッド名}(...)` として公開される。

```java
package com.example.test_imds.sample.javascript;

import com.example.test_imds.sample.SampleDummyApi;

import jp.co.intra_mart.system.javascript.NativeArray;
import jp.co.intra_mart.system.javascript.ScriptRuntime;
import jp.co.intra_mart.system.javascript.ScriptableObject;
import jp.co.intra_mart.system.javascript.annotations.JSStaticFunction;

/**
 * {@link SampleDummyApi} を JSSP から静的関数として呼び出すためのラッパーオブジェクト。
 * <p>
 * JSSP からは {@code SampleDummy.hello('name')} のように呼び出します。
 * </p>
 * @author test-imds
 * @version 0.1.0
 * @since 0.1.0
 */
public class SampleDummyObject extends ScriptableObject {

  /** serialVersionUID */
  private static final long serialVersionUID = 1L;

  @Override
  public String getClassName() {
    return "SampleDummy";
  }

  /**
   * 挨拶文を返します。
   *
   * @param name 名前
   * @return 挨拶文
   */
  @JSStaticFunction
  public static String hello(final String name) {
    return SampleDummyApi.hello(ScriptRuntime.toString(name));
  }

  /**
   * JavaScript の配列で受け取った数値の合計を返します。
   *
   * @param values 数値の配列（JavaScript の Array）
   * @return 合計
   */
  @JSStaticFunction
  public static double sum(final Object values) {
    if (!(values instanceof NativeArray)) {
      throw new IllegalArgumentException("引数 values には配列を指定してください: 受け取った型=" + describe(values));
    }
    final NativeArray array = (NativeArray) values;
    final double[] numbers = new double[(int) array.getLength()];
    for (int i = 0; i < numbers.length; i++) {
      numbers[i] = ScriptRuntime.toNumber(array.get(i, array));
    }
    return SampleDummyApi.sum(numbers);
  }

  /**
   * 受け取った引数の Java 側のクラス名を返します（型変換の確認用）。
   *
   * @param value 任意の値
   * @return Java 側のクラス名（null の場合は "null"）
   */
  @JSStaticFunction
  public static String describe(final Object value) {
    final String className = (value == null) ? "null" : value.getClass().getName();
    System.out.println("[SampleDummyObject] describe called: " + className);
    return className;
  }

  /**
   * Java 側で例外をスローします（例外の伝わり方の確認用）。
   *
   * @param message 例外メッセージ
   */
  @JSStaticFunction
  public static void fail(final String message) {
    SampleDummyApi.fail(ScriptRuntime.toString(message));
  }
}
```

**ポイント:**
- `getClassName()` の戻り値（`"SampleDummy"`）が JSSP のグローバルオブジェクト名になる
- 引数を `String` で宣言したメソッド（`hello`）は、JSSP から渡した文字列をそのまま受け取れる
- 配列を受け取る場合は `Object` で受け取り、`NativeArray` として扱う（`sum`）
- `describe` は、引数が Java 側でどの型として届くかを確認するためのメソッド（結果は `reference/wrapper-reference.md` の「引数の型変換」）

## インスタンス型のラッパー（SampleGreeterObject.java）

`@JSConstructor` を付与した `constructor` が JSSP の `new SampleGreeter(...)` で呼び出され、`@JSFunction` を付与したメソッドがインスタンスメソッドとして公開される。

```java
package com.example.test_imds.sample.javascript;

import com.example.test_imds.sample.SampleDummyApi;

import jp.co.intra_mart.system.javascript.Context;
import jp.co.intra_mart.system.javascript.Function;
import jp.co.intra_mart.system.javascript.ScriptRuntime;
import jp.co.intra_mart.system.javascript.ScriptableObject;
import jp.co.intra_mart.system.javascript.annotations.JSConstructor;
import jp.co.intra_mart.system.javascript.annotations.JSFunction;

/**
 * {@link SampleDummyApi} のインスタンスを JSSP から {@code new} で生成して使うためのラッパーオブジェクト。
 * <p>
 * JSSP からは {@code new SampleGreeter('prefix: ').greet('name')} のように呼び出します。
 * </p>
 * @author test-imds
 * @version 0.1.0
 * @since 0.1.0
 */
public class SampleGreeterObject extends ScriptableObject {

  /** serialVersionUID */
  private static final long serialVersionUID = 1L;

  /** ラップする Java API のインスタンス */
  private transient SampleDummyApi api;

  /**
   * プロトタイプ生成用のコンストラクタです。
   */
  public SampleGreeterObject() {
    super();
  }

  private SampleGreeterObject(final SampleDummyApi api) {
    this();
    this.api = api;
  }

  @Override
  public String getClassName() {
    return "SampleGreeter";
  }

  /**
   * JavaScript の {@code new SampleGreeter(prefix)} で呼び出されるコンストラクタ関数です。
   *
   * @param context コンテキスト
   * @param args 引数（第 1 引数: 挨拶文の接頭辞）
   * @param constructorFunction コンストラクタ関数
   * @param inNewExpr {@code new} 演算子で呼び出された場合 true
   * @return 生成したインスタンス
   */
  @JSConstructor
  public static Object constructor(
      final Context context, final Object[] args, final Function constructorFunction, final boolean inNewExpr
  ) {
    if (!inNewExpr) {
      throw new IllegalStateException("SampleGreeter は new 演算子で呼び出してください。");
    }
    final String prefix = (args.length > 0) ? ScriptRuntime.toString(args[0]) : "";
    return new SampleGreeterObject(new SampleDummyApi(prefix));
  }

  /**
   * 接頭辞付きの挨拶文を返します。
   *
   * @param name 名前
   * @return 接頭辞付きの挨拶文
   */
  @JSFunction
  public String greet(final String name) {
    return api.greet(ScriptRuntime.toString(name));
  }
}
```

**ポイント:**
- 引数なしの `public` コンストラクタを定義する
- `constructor` は `new` 演算子以外で呼び出された場合（`inNewExpr` が false）に例外をスローする
- 生成時の引数（接頭辞）を、ラップする Java 側のインスタンスに保持する

## 登録ファイル（initializer-test-imds.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<initializer-config
    xmlns="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config initializer-config.xsd">

  <!-- JSSP から呼び出す Java API ラッパーの登録 -->
  <java-script-api>
    <api-class>com.example.test_imds.sample.javascript.SampleDummyObject</api-class>
    <api-class>com.example.test_imds.sample.javascript.SampleGreeterObject</api-class>
  </java-script-api>

</initializer-config>
```

## d.ts 型定義（sample-java-wrapper.d.ts）

```typescript
/**
 * Java API ラッパー検証用の自作 API（SampleDummyObject）。
 *
 * Java クラス `com.example.test_imds.sample.javascript.SampleDummyObject` を、
 * `conf/products/initializer/initializer-test-imds.xml` の `<api-class>` で JSSP に登録したものです。
 */
declare class SampleDummy {
  /**
   * 挨拶文を返します。
   *
   * @param name 名前
   * @return 挨拶文
   */
  static hello(name: string): string;

  /**
   * 数値の配列の合計を返します。
   *
   * @param values 数値の配列
   * @return 合計
   */
  static sum(values: number[]): number;

  /**
   * 受け取った引数の Java 側のクラス名を返します。
   *
   * @param value 任意の値
   * @return Java 側のクラス名
   */
  static describe(value: any): string;

  /**
   * Java 側で例外をスローします。
   *
   * @param message 例外メッセージ
   */
  static fail(message: string): void;
}

/**
 * Java API ラッパー検証用の自作 API（SampleGreeterObject）。
 *
 * Java クラス `com.example.test_imds.sample.javascript.SampleGreeterObject` を、
 * `conf/products/initializer/initializer-test-imds.xml` の `<api-class>` で JSSP に登録したものです。
 */
declare class SampleGreeter {
  /**
   * インスタンスを生成します。
   *
   * @param greetingPrefix 挨拶文の接頭辞
   */
  constructor(greetingPrefix: string);

  /**
   * 接頭辞付きの挨拶文を返します。
   *
   * @param name 名前
   * @return 接頭辞付きの挨拶文
   */
  greet(name: string): string;
}
```

## JSSP からの呼び出し例

ファンクションコンテナ（.js）から、標準の JSSP API と同じように呼び出す。

```javascript
// 静的関数型
let greeting = SampleDummy.hello('intra-mart');       // => 'Hello, intra-mart'
let total = SampleDummy.sum([1, 2, 3.5]);                // => 6.5

// インスタンス型
let greeter = new SampleGreeter('Hi, ');
let message = greeter.greet('intra-mart');            // => 'Hi, intra-mart'

// Java 側の例外は try-catch で捕捉できる
try {
  SampleDummy.fail('expected error');
} catch (e) {
  // e.name    => 'JavaException'
  // e.message => 'java.lang.IllegalStateException: expected error'
  Logger.getLogger().warn('Java 処理でエラーが発生しました。{}', e.message);
}
```
