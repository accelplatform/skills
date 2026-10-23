# Complete Sample of a Java API Wrapper

A complete set of wrappers for calling your own Java processing from JSSP. Shows two kinds: the static function type (`SampleDummy`) and the instance type (`SampleGreeter`).

## File Structure

```
src/main/java/com/example/test_imds/sample/
  ├── SampleDummyApi.java                    # Java-side processing called from the wrapper (dummy)
  └── javascript/
      ├── SampleDummyObject.java             # Static function type wrapper (JSSP name: SampleDummy)
      └── SampleGreeterObject.java           # Instance type wrapper (JSSP name: SampleGreeter)

src/main/conf/products/initializer/
  └── initializer-test-imds.xml              # Registration file (module ID: com.example.test-imds)

d.ts/custom/
  └── sample-java-wrapper.d.ts               # JSSP-side type definition
```

When generating, replace the following parts to match the project.

| Part to replace | Example | Replace with |
|--------------|----|-----------|
| Package | `com.example.test_imds.sample` | The project's package |
| Registration file name | `initializer-test-imds.xml` | `initializer-{last part of module ID}.xml` |
| JSSP-side name | `SampleDummy` / `SampleGreeter` | Return value of `getClassName()` and the d.ts class name |
| JavaDoc `@author` / `@version` / `@since` | `test-imds` / `0.1.0` | The project's settings (`java-javadoc.md`) |

## Java-Side Processing (SampleDummyApi.java)

An example of Java-side processing called from the wrapper. It writes to standard output that it was called. In actual development, replace it with an existing Java API or business processing class.

```java
package com.example.test_imds.sample;

/**
 * Dummy Java API for verifying the JSSP wrapper.
 * <p>
 * Each method writes to standard output that it was called.
 * </p>
 * @author test-imds
 * @version 0.1.0
 * @since 0.1.0
 */
public final class SampleDummyApi {

  /** Prefix added to standard output */
  private static final String LOG_PREFIX = "[SampleDummyApi] ";

  /** Prefix of the greeting */
  private final String greetingPrefix;

  /**
   * Creates an instance.
   *
   * @param greetingPrefix prefix of the greeting
   */
  public SampleDummyApi(final String greetingPrefix) {
    this.greetingPrefix = greetingPrefix;
    System.out.println(LOG_PREFIX + "constructor called: greetingPrefix=" + greetingPrefix);
  }

  /**
   * Returns a greeting.
   *
   * @param name name
   * @return greeting
   */
  public static String hello(final String name) {
    System.out.println(LOG_PREFIX + "hello called: name=" + name);
    return "Hello, " + name;
  }

  /**
   * Returns the sum of the numbers.
   *
   * @param values array of numbers
   * @return sum
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
   * Always throws an exception.
   *
   * @param message exception message
   */
  public static void fail(final String message) {
    System.out.println(LOG_PREFIX + "fail called: message=" + message);
    throw new IllegalStateException(message);
  }

  /**
   * Returns a greeting with the prefix.
   *
   * @param name name
   * @return greeting with the prefix
   */
  public String greet(final String name) {
    System.out.println(LOG_PREFIX + "greet called: name=" + name);
    return greetingPrefix + name;
  }
}
```

## Static Function Type Wrapper (SampleDummyObject.java)

A `public static` method annotated with `@JSStaticFunction` is exposed as JSSP's `SampleDummy.{method name}(...)`.

```java
package com.example.test_imds.sample.javascript;

import com.example.test_imds.sample.SampleDummyApi;

import jp.co.intra_mart.system.javascript.NativeArray;
import jp.co.intra_mart.system.javascript.ScriptRuntime;
import jp.co.intra_mart.system.javascript.ScriptableObject;
import jp.co.intra_mart.system.javascript.annotations.JSStaticFunction;

/**
 * Wrapper object for calling {@link SampleDummyApi} from JSSP as static functions.
 * <p>
 * Call it from JSSP like {@code SampleDummy.hello('name')}.
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
   * Returns a greeting.
   *
   * @param name name
   * @return greeting
   */
  @JSStaticFunction
  public static String hello(final String name) {
    return SampleDummyApi.hello(ScriptRuntime.toString(name));
  }

  /**
   * Returns the sum of the numbers received as a JavaScript array.
   *
   * @param values array of numbers (JavaScript Array)
   * @return sum
   */
  @JSStaticFunction
  public static double sum(final Object values) {
    if (!(values instanceof NativeArray)) {
      throw new IllegalArgumentException("Specify an array for the argument values: received type=" + describe(values));
    }
    final NativeArray array = (NativeArray) values;
    final double[] numbers = new double[(int) array.getLength()];
    for (int i = 0; i < numbers.length; i++) {
      numbers[i] = ScriptRuntime.toNumber(array.get(i, array));
    }
    return SampleDummyApi.sum(numbers);
  }

  /**
   * Returns the Java-side class name of the received argument (for checking type conversion).
   *
   * @param value any value
   * @return Java-side class name ("null" if null)
   */
  @JSStaticFunction
  public static String describe(final Object value) {
    final String className = (value == null) ? "null" : value.getClass().getName();
    System.out.println("[SampleDummyObject] describe called: " + className);
    return className;
  }

  /**
   * Throws an exception on the Java side (for checking how exceptions propagate).
   *
   * @param message exception message
   */
  @JSStaticFunction
  public static void fail(final String message) {
    SampleDummyApi.fail(ScriptRuntime.toString(message));
  }
}
```

**Key points:**
- The return value of `getClassName()` (`"SampleDummy"`) becomes the JSSP global object name
- A method whose argument is declared as `String` (`hello`) receives the string passed from JSSP as is
- To receive an array, receive it as `Object` and handle it as a `NativeArray` (`sum`)
- `describe` is a method for checking which type an argument arrives as on the Java side (results are in "Argument Type Conversion" in `reference/wrapper-reference.md`)

## Instance Type Wrapper (SampleGreeterObject.java)

The `constructor` annotated with `@JSConstructor` is called by JSSP's `new SampleGreeter(...)`, and methods annotated with `@JSFunction` are exposed as instance methods.

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
 * Wrapper object for creating an instance of {@link SampleDummyApi} with {@code new} from JSSP and using it.
 * <p>
 * Call it from JSSP like {@code new SampleGreeter('prefix: ').greet('name')}.
 * </p>
 * @author test-imds
 * @version 0.1.0
 * @since 0.1.0
 */
public class SampleGreeterObject extends ScriptableObject {

  /** serialVersionUID */
  private static final long serialVersionUID = 1L;

  /** Instance of the wrapped Java API */
  private transient SampleDummyApi api;

  /**
   * Constructor for creating the prototype.
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
   * Constructor function called by JavaScript's {@code new SampleGreeter(prefix)}.
   *
   * @param context context
   * @param args arguments (1st argument: prefix of the greeting)
   * @param constructorFunction constructor function
   * @param inNewExpr true when called with the {@code new} operator
   * @return created instance
   */
  @JSConstructor
  public static Object constructor(
      final Context context, final Object[] args, final Function constructorFunction, final boolean inNewExpr
  ) {
    if (!inNewExpr) {
      throw new IllegalStateException("Call SampleGreeter with the new operator.");
    }
    final String prefix = (args.length > 0) ? ScriptRuntime.toString(args[0]) : "";
    return new SampleGreeterObject(new SampleDummyApi(prefix));
  }

  /**
   * Returns a greeting with the prefix.
   *
   * @param name name
   * @return greeting with the prefix
   */
  @JSFunction
  public String greet(final String name) {
    return api.greet(ScriptRuntime.toString(name));
  }
}
```

**Key points:**
- Define a `public` constructor with no arguments
- `constructor` throws an exception when called other than with the `new` operator (`inNewExpr` is false)
- The creation-time argument (prefix) is held in the wrapped Java-side instance

## Registration File (initializer-test-imds.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<initializer-config
    xmlns="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config initializer-config.xsd">

  <!-- Registration of Java API wrappers called from JSSP -->
  <java-script-api>
    <api-class>com.example.test_imds.sample.javascript.SampleDummyObject</api-class>
    <api-class>com.example.test_imds.sample.javascript.SampleGreeterObject</api-class>
  </java-script-api>

</initializer-config>
```

## d.ts Type Definition (sample-java-wrapper.d.ts)

```typescript
/**
 * Custom API for verifying the Java API wrapper (SampleDummyObject).
 *
 * The Java class `com.example.test_imds.sample.javascript.SampleDummyObject`
 * registered with JSSP via `<api-class>` in `conf/products/initializer/initializer-test-imds.xml`.
 */
declare class SampleDummy {
  /**
   * Returns a greeting.
   *
   * @param name name
   * @return greeting
   */
  static hello(name: string): string;

  /**
   * Returns the sum of an array of numbers.
   *
   * @param values array of numbers
   * @return sum
   */
  static sum(values: number[]): number;

  /**
   * Returns the Java-side class name of the received argument.
   *
   * @param value any value
   * @return Java-side class name
   */
  static describe(value: any): string;

  /**
   * Throws an exception on the Java side.
   *
   * @param message exception message
   */
  static fail(message: string): void;
}

/**
 * Custom API for verifying the Java API wrapper (SampleGreeterObject).
 *
 * The Java class `com.example.test_imds.sample.javascript.SampleGreeterObject`
 * registered with JSSP via `<api-class>` in `conf/products/initializer/initializer-test-imds.xml`.
 */
declare class SampleGreeter {
  /**
   * Creates an instance.
   *
   * @param greetingPrefix prefix of the greeting
   */
  constructor(greetingPrefix: string);

  /**
   * Returns a greeting with the prefix.
   *
   * @param name name
   * @return greeting with the prefix
   */
  greet(name: string): string;
}
```

## Example of Calling from JSSP

Call it from a function container (.js) in the same way as a standard JSSP API.

```javascript
// Static function type
let greeting = SampleDummy.hello('intra-mart');       // => 'Hello, intra-mart'
let total = SampleDummy.sum([1, 2, 3.5]);                // => 6.5

// Instance type
let greeter = new SampleGreeter('Hi, ');
let message = greeter.greet('intra-mart');            // => 'Hi, intra-mart'

// Java-side exceptions can be caught with try-catch
try {
  SampleDummy.fail('expected error');
} catch (e) {
  // e.name    => 'JavaException'
  // e.message => 'java.lang.IllegalStateException: expected error'
  Logger.getLogger().warn('An error occurred in Java processing. {}', e.message);
}
```
