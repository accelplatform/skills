# Java API Wrapper Reference

## Registration File

A wrapper class is registered with JSSP by a registration file placed in the module's `conf/products/initializer/`.
At server startup, the platform loads, for each enabled module, the registration file with the following file name and registers the classes written in `<api-class>` as JSSP APIs.

### Location and File Name

| Item | Content |
|------|------|
| Location (project) | `src/main/conf/products/initializer/` |
| File name | `initializer-{part of the module ID after the last .}.xml` |
| Example | Module ID `com.example.test-imds` → `initializer-test-imds.xml` |

- Check the module ID in `<id>` of `module.xml`
- Using the entire module ID in the file name (`initializer-com.example.test-imds.xml`) prevents it from being loaded

### Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<initializer-config
    xmlns="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config initializer-config.xsd">

  <java-script-api>
    <api-class>{fully qualified name of the wrapper class}</api-class>
    <!-- If there are multiple wrapper classes, list multiple api-class elements -->
  </java-script-api>

</initializer-config>
```

| Element | Content |
|------|------|
| `initializer-config` | Root element. The namespace is as shown above |
| `java-script-api` | JSSP API registration. 0 to 1 directly under `initializer-config` |
| `api-class` | Fully qualified name of the wrapper class to register. 0 or more |

- The order and number of elements are defined by the schema (`initializer-config.xsd`) and validated at build time
- This skill uses only `java-script-api` / `api-class`

### Cases That Are Not Registered

| Mistake | Result |
|------|------|
| Placing `system-install_*.xml` inside the jar | Not registered (calling from JSSP results in `ReferenceError: "{name}" is not defined.`) |
| The file name does not match the last part of the module ID | The registration file is not loaded |
| The server was not restarted after adding or changing the registration file | Changes are not applied |

## Wrapper Class

### Basic Structure

| Item | Content |
|------|------|
| Class to extend | `jp.co.intra_mart.system.javascript.ScriptableObject` |
| JSSP-side name | Return value of `getClassName()` |
| Annotation package | `jp.co.intra_mart.system.javascript.annotations` |

### Annotations

| Annotation | Target | How to call from JSSP |
|--------------|-------|---------------------|
| `@JSStaticFunction` | `public static` method | `{name}.{method name}(...)` |
| `@JSConstructor` | `public static Object constructor(Context, Object[], Function, boolean)` | `new {name}(...)` |
| `@JSFunction` | Instance method | `{method name}(...)` of an instance created with `new {name}(...)` |

Arguments of the `@JSConstructor` method:

| Argument | Type | Content |
|------|----|------|
| 1st argument | `jp.co.intra_mart.system.javascript.Context` | Execution context |
| 2nd argument | `Object[]` | Arguments passed from JSSP |
| 3rd argument | `jp.co.intra_mart.system.javascript.Function` | Constructor function |
| 4th argument | `boolean` | `true` when called with the `new` operator |

An instance type wrapper also defines a `public` constructor with no arguments.

## Argument Type Conversion

### Java-Side Types When Received as Object

When a value passed from JSSP is received as an `Object` argument, it has the following type on the Java side.

| Value passed from JSSP | Example | Java-side type |
|----------------|----|------------|
| String | `'text'` | `java.lang.String` |
| Number | `123` | `java.lang.Double` |
| Boolean | `true` | `java.lang.Boolean` |
| Array | `[1, 2]` | `jp.co.intra_mart.system.javascript.NativeArray` |
| Object | `{ key: 'value' }` | `jp.co.intra_mart.system.javascript.NativeObject` |
| null | `null` | `null` |

Even an integer becomes `java.lang.Double`, so convert it on the Java side when treating it as an integer.

### Methods Used for Conversion

| Purpose | Method |
|------|---------|
| Convert to string | `ScriptRuntime.toString(Object)` |
| Convert to number (`double`) | `ScriptRuntime.toNumber(Object)` |
| Number of array elements | `NativeArray.getLength()` |
| Array element | `NativeArray.get(int, Scriptable)` (pass the array itself as the 2nd argument) |

`ScriptRuntime` / `NativeArray` / `Scriptable` are all classes in the `jp.co.intra_mart.system.javascript` package.

### String and double Arguments and Return Values

- A method whose argument is declared as `String` receives the string passed from JSSP as is
- The return value of a method whose return type is declared as `String` / `double` can be handled as a string / number on the JSSP side

## Exceptions

When the wrapper (or the Java processing called from the wrapper) throws an exception, it can be caught with `try-catch` on the JSSP side.

| Property | Value | Example |
|-----------|----|----|
| `e.name` | `JavaException` | `JavaException` |
| `e.message` | `{fully qualified exception class name}: {exception message}` | `java.lang.IllegalStateException: expected error` |

```javascript
try {
  SampleDummy.fail('expected error');
} catch (e) {
  // e.name    => 'JavaException'
  // e.message => 'java.lang.IllegalStateException: expected error'
}
```

`e.message` contains the Java exception class name, so do not display it as is on a JSSP screen.

## d.ts Type Definition

- `.d.ts` files placed under `d.ts/` are targeted by `check-types.sh` (`d.ts/**/*.d.ts` in `tsconfig.check.json`)
- To keep them separate from the platform's standard type definitions (`d.ts/platform/` / `d.ts/tenant/`), place type definitions for your own APIs in `d.ts/custom/`
- Declare the static function type as `static` methods, and the instance type as a `constructor` and instance methods, in a `declare class`
