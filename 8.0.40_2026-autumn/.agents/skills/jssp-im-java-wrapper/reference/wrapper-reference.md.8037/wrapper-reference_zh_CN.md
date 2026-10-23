# Java API 包装类参考

## 注册文件

包装类通过放置在模块 `conf/products/initializer/` 中的注册文件注册到 JSSP。
平台在服务器启动时，为每个有效模块读取以下文件名的注册文件，并将 `<api-class>` 中写入的类注册为 JSSP 的 API。

### 存放位置与文件名

| 项目 | 内容 |
|------|------|
| 存放位置（项目） | `src/main/conf/products/initializer/` |
| 文件名 | `initializer-{模块 ID 中最后一个 . 之后的部分}.xml` |
| 示例 | 模块 ID `com.example.test-imds` → `initializer-test-imds.xml` |

- 模块 ID 请在 `module.xml` 的 `<id>` 中确认
- 文件名使用完整模块 ID（`initializer-com.example.test-imds.xml`）时不会被读取

### 格式

```xml
<?xml version="1.0" encoding="UTF-8"?>
<initializer-config
    xmlns="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://intra-mart.co.jp/system/secure/product/initializer/config/initializer-config initializer-config.xsd">

  <java-script-api>
    <api-class>{包装类的完全限定名}</api-class>
    <!-- 有多个包装类时，并列多个 api-class -->
  </java-script-api>

</initializer-config>
```

| 元素 | 内容 |
|------|------|
| `initializer-config` | 根元素。命名空间如上所示 |
| `java-script-api` | JSSP API 的注册。在 `initializer-config` 正下方 0〜1 个 |
| `api-class` | 要注册的包装类的完全限定名。0 个以上 |

- 元素的顺序・个数由模式（`initializer-config.xsd`）决定，构建时会进行验证
- 本技能仅使用 `java-script-api` / `api-class`

### 不会被注册的示例

| 错误 | 结果 |
|------|------|
| 在 jar 中放置 `system-install_*.xml` | 不会被注册（从 JSSP 调用时出现 `ReferenceError: "{名称}" is not defined.`） |
| 文件名与模块 ID 的末尾不一致 | 注册文件不会被读取 |
| 添加・修改注册文件后未重启服务器 | 修改不会生效 |

## 包装类

### 基本构成

| 项目 | 内容 |
|------|------|
| 继承的类 | `jp.co.intra_mart.system.javascript.ScriptableObject` |
| JSSP 端的名称 | `getClassName()` 的返回值 |
| 注解的包 | `jp.co.intra_mart.system.javascript.annotations` |

### 注解

| 注解 | 添加对象 | 从 JSSP 的调用方式 |
|--------------|-------|---------------------|
| `@JSStaticFunction` | `public static` 方法 | `{名称}.{方法名}(...)` |
| `@JSConstructor` | `public static Object constructor(Context, Object[], Function, boolean)` | `new {名称}(...)` |
| `@JSFunction` | 实例方法 | 通过 `new {名称}(...)` 生成的实例的 `{方法名}(...)` |

`@JSConstructor` 方法的参数：

| 参数 | 类型 | 内容 |
|------|----|------|
| 第 1 个参数 | `jp.co.intra_mart.system.javascript.Context` | 执行上下文 |
| 第 2 个参数 | `Object[]` | 从 JSSP 传入的参数 |
| 第 3 个参数 | `jp.co.intra_mart.system.javascript.Function` | 构造函数 |
| 第 4 个参数 | `boolean` | 通过 `new` 运算符调用时为 `true` |

实例型的包装类还需定义无参数的 `public` 构造函数。

## 参数的类型转换

### 以 Object 类型接收时 Java 端的类型

以 `Object` 类型的参数接收从 JSSP 传入的值时，在 Java 端为以下类型。

| 从 JSSP 传入的值 | 示例 | Java 端的类型 |
|----------------|----|------------|
| 字符串 | `'text'` | `java.lang.String` |
| 数值 | `123` | `java.lang.Double` |
| 布尔值 | `true` | `java.lang.Boolean` |
| 数组 | `[1, 2]` | `jp.co.intra_mart.system.javascript.NativeArray` |
| 对象 | `{ key: 'value' }` | `jp.co.intra_mart.system.javascript.NativeObject` |
| null | `null` | `null` |

即使传入整数也会成为 `java.lang.Double`，因此作为整数处理时请在 Java 端转换。

### 用于转换的方法

| 用途 | 方法 |
|------|---------|
| 转换为字符串 | `ScriptRuntime.toString(Object)` |
| 转换为数值（`double`） | `ScriptRuntime.toNumber(Object)` |
| 数组的元素个数 | `NativeArray.getLength()` |
| 数组的元素 | `NativeArray.get(int, Scriptable)`（第 2 个参数传入数组自身） |

`ScriptRuntime` / `NativeArray` / `Scriptable` 均为 `jp.co.intra_mart.system.javascript` 包中的类。

### String 类型・double 类型的参数与返回值

- 参数声明为 `String` 类型的方法，可以直接接收从 JSSP 传入的字符串
- 返回值声明为 `String` 类型・`double` 类型的方法，其返回值在 JSSP 端可作为字符串・数值处理

## 异常

包装类（或从包装类调用的 Java 处理）抛出异常时，JSSP 端可以用 `try-catch` 捕获。

| 属性 | 值 | 示例 |
|-----------|----|----|
| `e.name` | `JavaException` | `JavaException` |
| `e.message` | `{异常类的完全限定名}: {异常消息}` | `java.lang.IllegalStateException: expected error` |

```javascript
try {
  SampleDummy.fail('expected error');
} catch (e) {
  // e.name    => 'JavaException'
  // e.message => 'java.lang.IllegalStateException: expected error'
}
```

`e.message` 中包含 Java 的异常类名，因此不要直接显示在 JSSP 画面上。

## d.ts 类型定义

- 放置在 `d.ts/` 下的 `.d.ts` 是 `check-types.sh`（`tsconfig.check.json` 的 `d.ts/**/*.d.ts`）的对象
- 为了与平台标准的类型定义（`d.ts/platform/` / `d.ts/tenant/`）区分，自制 API 的类型定义放在 `d.ts/custom/` 中
- 静态函数型声明为 `static` 方法，实例型声明为 `constructor` 和实例方法，均写在 `declare class` 中
