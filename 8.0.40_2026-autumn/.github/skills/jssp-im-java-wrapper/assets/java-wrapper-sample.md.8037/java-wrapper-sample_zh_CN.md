# Java API 包装类的完成品示例

用于从 JSSP 调用自定义 Java 处理的包装类一套完成品。展示静态函数型（`SampleDummy`）和实例型（`SampleGreeter`）2 种。

## 文件构成

```
src/main/java/com/example/test_imds/sample/
  ├── SampleDummyApi.java                    # 从包装类调用的 Java 端处理（虚拟）
  └── javascript/
      ├── SampleDummyObject.java             # 静态函数型包装类（JSSP 名: SampleDummy）
      └── SampleGreeterObject.java           # 实例型包装类（JSSP 名: SampleGreeter）

src/main/conf/products/initializer/
  └── initializer-test-imds.xml              # 注册文件（模块 ID: com.example.test-imds）

d.ts/custom/
  └── sample-java-wrapper.d.ts               # JSSP 端的类型定义
```

生成时请将以下部分替换为符合项目的内容。

| 替换部分 | 示例 | 替换为 |
|--------------|----|-----------|
| 包 | `com.example.test_imds.sample` | 项目的包 |
| 注册文件名 | `initializer-test-imds.xml` | `initializer-{模块 ID 的末尾}.xml` |
| JSSP 端的名称 | `SampleDummy` / `SampleGreeter` | `getClassName()` 的返回值・d.ts 的类名 |
| JavaDoc 的 `@author` / `@version` / `@since` | `test-imds` / `0.1.0` | 项目的设置（`.github/instructions/java-javadoc.instructions.md`） |

## Java 端的处理（SampleDummyApi.java）

从包装类调用的 Java 端处理示例。将被调用的情况输出到标准输出。实际开发中，请替换为现有的 Java API 或业务处理类。

```java
package com.example.test_imds.sample;

/**
 * 用于验证 JSSP 包装类的虚拟 Java API。
 * <p>
 * 各方法将被调用的情况输出到标准输出。
 * </p>
 * @author test-imds
 * @version 0.1.0
 * @since 0.1.0
 */
public final class SampleDummyApi {

  /** 添加到标准输出的前缀 */
  private static final String LOG_PREFIX = "[SampleDummyApi] ";

  /** 问候语的前缀 */
  private final String greetingPrefix;

  /**
   * 生成实例。
   *
   * @param greetingPrefix 问候语的前缀
   */
  public SampleDummyApi(final String greetingPrefix) {
    this.greetingPrefix = greetingPrefix;
    System.out.println(LOG_PREFIX + "constructor called: greetingPrefix=" + greetingPrefix);
  }

  /**
   * 返回问候语。
   *
   * @param name 名称
   * @return 问候语
   */
  public static String hello(final String name) {
    System.out.println(LOG_PREFIX + "hello called: name=" + name);
    return "Hello, " + name;
  }

  /**
   * 返回数值的合计。
   *
   * @param values 数值的数组
   * @return 合计
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
   * 必定抛出异常。
   *
   * @param message 异常消息
   */
  public static void fail(final String message) {
    System.out.println(LOG_PREFIX + "fail called: message=" + message);
    throw new IllegalStateException(message);
  }

  /**
   * 返回带前缀的问候语。
   *
   * @param name 名称
   * @return 带前缀的问候语
   */
  public String greet(final String name) {
    System.out.println(LOG_PREFIX + "greet called: name=" + name);
    return greetingPrefix + name;
  }
}
```

## 静态函数型包装类（SampleDummyObject.java）

添加了 `@JSStaticFunction` 的 `public static` 方法，作为 JSSP 的 `SampleDummy.{方法名}(...)` 公开。

```java
package com.example.test_imds.sample.javascript;

import com.example.test_imds.sample.SampleDummyApi;

import jp.co.intra_mart.system.javascript.NativeArray;
import jp.co.intra_mart.system.javascript.ScriptRuntime;
import jp.co.intra_mart.system.javascript.ScriptableObject;
import jp.co.intra_mart.system.javascript.annotations.JSStaticFunction;

/**
 * 用于从 JSSP 以静态函数方式调用 {@link SampleDummyApi} 的包装对象。
 * <p>
 * 从 JSSP 以 {@code SampleDummy.hello('name')} 的方式调用。
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
   * 返回问候语。
   *
   * @param name 名称
   * @return 问候语
   */
  @JSStaticFunction
  public static String hello(final String name) {
    return SampleDummyApi.hello(ScriptRuntime.toString(name));
  }

  /**
   * 返回以 JavaScript 数组接收的数值的合计。
   *
   * @param values 数值的数组（JavaScript 的 Array）
   * @return 合计
   */
  @JSStaticFunction
  public static double sum(final Object values) {
    if (!(values instanceof NativeArray)) {
      throw new IllegalArgumentException("参数 values 请指定数组: 接收到的类型=" + describe(values));
    }
    final NativeArray array = (NativeArray) values;
    final double[] numbers = new double[(int) array.getLength()];
    for (int i = 0; i < numbers.length; i++) {
      numbers[i] = ScriptRuntime.toNumber(array.get(i, array));
    }
    return SampleDummyApi.sum(numbers);
  }

  /**
   * 返回接收到的参数在 Java 端的类名（用于确认类型转换）。
   *
   * @param value 任意值
   * @return Java 端的类名（null 时为 "null"）
   */
  @JSStaticFunction
  public static String describe(final Object value) {
    final String className = (value == null) ? "null" : value.getClass().getName();
    System.out.println("[SampleDummyObject] describe called: " + className);
    return className;
  }

  /**
   * 在 Java 端抛出异常（用于确认异常的传递方式）。
   *
   * @param message 异常消息
   */
  @JSStaticFunction
  public static void fail(final String message) {
    SampleDummyApi.fail(ScriptRuntime.toString(message));
  }
}
```

**要点：**
- `getClassName()` 的返回值（`"SampleDummy"`）即为 JSSP 的全局对象名
- 参数声明为 `String` 的方法（`hello`），可以直接接收从 JSSP 传入的字符串
- 接收数组时以 `Object` 接收，并作为 `NativeArray` 处理（`sum`）
- `describe` 是用于确认参数以何种类型到达 Java 端的方法（结果见 `reference/wrapper-reference.md` 的「参数的类型转换」）

## 实例型包装类（SampleGreeterObject.java）

添加了 `@JSConstructor` 的 `constructor` 由 JSSP 的 `new SampleGreeter(...)` 调用，添加了 `@JSFunction` 的方法作为实例方法公开。

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
 * 用于从 JSSP 通过 {@code new} 生成 {@link SampleDummyApi} 的实例并使用的包装对象。
 * <p>
 * 从 JSSP 以 {@code new SampleGreeter('prefix: ').greet('name')} 的方式调用。
 * </p>
 * @author test-imds
 * @version 0.1.0
 * @since 0.1.0
 */
public class SampleGreeterObject extends ScriptableObject {

  /** serialVersionUID */
  private static final long serialVersionUID = 1L;

  /** 被包装的 Java API 的实例 */
  private transient SampleDummyApi api;

  /**
   * 用于生成原型的构造函数。
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
   * 由 JavaScript 的 {@code new SampleGreeter(prefix)} 调用的构造函数。
   *
   * @param context 上下文
   * @param args 参数（第 1 个参数：问候语的前缀）
   * @param constructorFunction 构造函数
   * @param inNewExpr 通过 {@code new} 运算符调用时为 true
   * @return 生成的实例
   */
  @JSConstructor
  public static Object constructor(
      final Context context, final Object[] args, final Function constructorFunction, final boolean inNewExpr
  ) {
    if (!inNewExpr) {
      throw new IllegalStateException("请通过 new 运算符调用 SampleGreeter。");
    }
    final String prefix = (args.length > 0) ? ScriptRuntime.toString(args[0]) : "";
    return new SampleGreeterObject(new SampleDummyApi(prefix));
  }

  /**
   * 返回带前缀的问候语。
   *
   * @param name 名称
   * @return 带前缀的问候语
   */
  @JSFunction
  public String greet(final String name) {
    return api.greet(ScriptRuntime.toString(name));
  }
}
```

**要点：**
- 定义无参数的 `public` 构造函数
- `constructor` 在不是通过 `new` 运算符调用时（`inNewExpr` 为 false）抛出异常
- 将生成时的参数（前缀）保存在被包装的 Java 端实例中

## 注册文件（initializer-test-imds.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<initializer-config
    xmlns="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config initializer-config.xsd">

  <!-- 注册从 JSSP 调用的 Java API 包装类 -->
  <java-script-api>
    <api-class>com.example.test_imds.sample.javascript.SampleDummyObject</api-class>
    <api-class>com.example.test_imds.sample.javascript.SampleGreeterObject</api-class>
  </java-script-api>

</initializer-config>
```

## d.ts 类型定义（sample-java-wrapper.d.ts）

```typescript
/**
 * 用于验证 Java API 包装类的自制 API（SampleDummyObject）。
 *
 * 将 Java 类 `com.example.test_imds.sample.javascript.SampleDummyObject`
 * 通过 `conf/products/initializer/initializer-test-imds.xml` 的 `<api-class>` 注册到 JSSP 而成。
 */
declare class SampleDummy {
  /**
   * 返回问候语。
   *
   * @param name 名称
   * @return 问候语
   */
  static hello(name: string): string;

  /**
   * 返回数值数组的合计。
   *
   * @param values 数值的数组
   * @return 合计
   */
  static sum(values: number[]): number;

  /**
   * 返回接收到的参数在 Java 端的类名。
   *
   * @param value 任意值
   * @return Java 端的类名
   */
  static describe(value: any): string;

  /**
   * 在 Java 端抛出异常。
   *
   * @param message 异常消息
   */
  static fail(message: string): void;
}

/**
 * 用于验证 Java API 包装类的自制 API（SampleGreeterObject）。
 *
 * 将 Java 类 `com.example.test_imds.sample.javascript.SampleGreeterObject`
 * 通过 `conf/products/initializer/initializer-test-imds.xml` 的 `<api-class>` 注册到 JSSP 而成。
 */
declare class SampleGreeter {
  /**
   * 生成实例。
   *
   * @param greetingPrefix 问候语的前缀
   */
  constructor(greetingPrefix: string);

  /**
   * 返回带前缀的问候语。
   *
   * @param name 名称
   * @return 带前缀的问候语
   */
  greet(name: string): string;
}
```

## 从 JSSP 调用的示例

从函数容器（.js）中，以与标准 JSSP API 相同的方式调用。

```javascript
// 静态函数型
let greeting = SampleDummy.hello('intra-mart');       // => 'Hello, intra-mart'
let total = SampleDummy.sum([1, 2, 3.5]);                // => 6.5

// 实例型
let greeter = new SampleGreeter('Hi, ');
let message = greeter.greet('intra-mart');            // => 'Hi, intra-mart'

// Java 端的异常可以用 try-catch 捕获
try {
  SampleDummy.fail('expected error');
} catch (e) {
  // e.name    => 'JavaException'
  // e.message => 'java.lang.IllegalStateException: expected error'
  Logger.getLogger().warn('Java 处理中发生了错误。{}', e.message);
}
```
