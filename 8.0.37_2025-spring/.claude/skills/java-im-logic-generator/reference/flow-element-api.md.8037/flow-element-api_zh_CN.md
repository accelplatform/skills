# 流程要素 API 参考

## 参数、结果可用的类型

- 基本类型
- `java.lang.String`
- `java.lang.Boolean` / `java.lang.Byte` / `java.lang.Character` / `java.lang.Short` / `java.lang.Integer` / `java.lang.Long` / `java.lang.Float` / `java.lang.Double`
- `java.math.BigDecimal` / `java.math.BigInteger`
- `java.util.Calendar` / `java.util.Date` / `java.util.Locale` / `java.util.TimeZone`
- `jp.co.intra_mart.foundation.i18n.datetime.DateTime` / `jp.co.intra_mart.foundation.i18n.datetime.Duration`
- `java.sql.Date` / `java.sql.Timestamp`
- `jp.co.intra_mart.foundation.logic.data.basic.Binary`
- `jp.co.intra_mart.foundation.service.client.file.Storage`
- `java.util.Map`
- `java.lang.Object`

也可以使用内含上述类型的 `java.util.Collection` 或 `java.util.List`。此时需在读取方法（getter）上附加 `jp.co.intra_mart.foundation.logic.annotation.TypeHint` 注解，指定其内含的类型。

```java
@TypeHint(Integer.class)
public Collection<Integer> getIntegerListParameter() {
    return integerListParameter;
}
```

参数类、结果类应实现为带有符合 JavaBeans 规范的 getter/setter 的 POJO。

## 属性可用的类型

属性（后述）可用的类型少于参数、结果。

- 基本类型
- `java.lang.String`
- `java.lang.Boolean` / `java.lang.Character` / `java.lang.Short` / `java.lang.Integer` / `java.lang.Long` / `java.lang.Float` / `java.lang.Double`
- `java.math.BigDecimal` / `java.math.BigInteger`
- `java.util.Date`
- `java.sql.Date` / `java.sql.Timestamp`
- `java.lang.Enum`

## 类・接口・注解一览（FQCN）

| 名称 | FQCN | 种类 |
|------|------|------|
| `ElementCategory` | `jp.co.intra_mart.foundation.logic.element.category.ElementCategory` | 接口 |
| `Task` | `jp.co.intra_mart.foundation.logic.element.Task` | 抽象类 |
| `FlowElement` | `jp.co.intra_mart.foundation.logic.element.FlowElement` | 抽象类（`Task` 的父类） |
| `Executable` | `jp.co.intra_mart.foundation.logic.element.Executable` | 接口（由 `Task` 实现） |
| `ElementContext` | `jp.co.intra_mart.foundation.logic.element.ElementContext` | 接口 |
| `FlowElementCloser` | `jp.co.intra_mart.foundation.logic.element.FlowElementCloser` | 接口 |
| `FlowElementMetadata` | `jp.co.intra_mart.foundation.logic.element.metadata.FlowElementMetadata` | 抽象类 |
| `ElementProperty` | `jp.co.intra_mart.foundation.logic.element.metadata.ElementProperty` | 类 |
| `LogicFlowElement` | `jp.co.intra_mart.foundation.logic.annotation.LogicFlowElement` | 注解 |
| `TypeHint` | `jp.co.intra_mart.foundation.logic.annotation.TypeHint` | 注解 |
| `FlowExecutionException` | `jp.co.intra_mart.foundation.logic.exception.FlowExecutionException` | 异常类 |
| `ElementScanPackageFactory` | `jp.co.intra_mart.system.logic.factory.ElementScanPackageFactory` | 接口（参见 `reference/registration-and-packaging.md`） |

## ElementCategory 接口

```java
public interface ElementCategory {
    String getCategoryId();
    String getDisplayName();
    int getSortNumber();
}
```

- `getCategoryId()`：分类 ID。**不能以 `im_` 开头**
- `getDisplayName()`：调色板上显示的分类名称。需要多语言化时，应通过 MessageManager API 等返回符合调用者区域设置的值
- `getSortNumber()`：调色板显示顺序。数值越小越靠前。标准功能使用从 1 开始的连续编号

## LogicFlowElement 注解

```java
public @interface LogicFlowElement {
    String id();
    Class<? extends ElementCategory> category();
    int index();
    String pairId();
}
```

- `id`：流程要素 ID。**不能以 `im_` 开头**
- `category`：所属分类类
- `index`：调色板显示顺序（分类内的排序号）
- `pairId`：指定成对流程要素 ID 的属性（用于循环开始/结束任务这类具有成对结构的要素）

附加了 `@LogicFlowElement` 的类会在启动时自动被加载。

## Task 类

```java
public abstract class Task<T extends Metadata, D, R>
        extends FlowElement<T> implements Executable<D, R> {

    protected Task(ElementContext context);

    // Executable<D, R> 的实现（Task 提供空实现，可按需重写）
    public void preprocessing() throws FlowExecutionException;
    public R execute(D parameter) throws FlowExecutionException;  // 抽象方法，必须实现
    public void postprocessing() throws FlowExecutionException;

    public void setContinueOnError(boolean continueOnError);
    public boolean isContinueOnError();
}
```

类型参数依次为"元数据类""参数类型""结果类型"。

- 构造函数接收 `ElementContext`。需调用 `super(context)`
- `execute` 是流程要素执行时被调用的主体处理。**必须重写**
- `preprocessing` / `postprocessing` 由 `Task` 提供空实现，若不需要前后处理则无需重写
- 从 `FlowElement` 继承的 `getAlias()` / `setAlias(String)` 用于处理设计器上流程要素的别名

## ElementContext 接口

```java
public interface ElementContext {
    LogicFlowElementDefinition getElementDefinition();
    LogicSession getLogicSession();
    void addFlowElementCloser(FlowElementCloser closer);
}
```

通过 `addFlowElementCloser` 注册实例（自身或其他实例）后，流程执行结束后会调用 `FlowElementCloser#close()`（详见后文）。

## FlowElementMetadata 类

```java
public abstract class FlowElementMetadata implements Metadata {

    protected FlowElementMetadata(Class<? extends FlowElement<? extends Metadata>> elementClass);

    public abstract String getElementName();  // 需要重写

    protected ElementProperty decorateElementProperty(ElementProperty elementProperty);

    public ElementKey getKey();
    public int index();
    public ElementKey getPairElementKey();
    public String getIconId();
    public Collection<ElementProperty> getElementProperties();
    public DataDefinition getInputDataDefinition();
    public DataDefinition getOutputDataDefinition();
    public Class<? extends FlowElement<? extends Metadata>> getElementClass();
}
```

- 将流程要素类（继承 `Task` 的类）传入构造函数后，会自动解析该流程要素的参数、结果数据类型并纳入元信息
- `getElementName()`：调色板上显示的要素名称。**必须重写**。需要多语言化时使用 MessageManager API 等
- `decorateElementProperty(ElementProperty)`：需要自定义属性项时重写此方法（详见后文）
- `getIconId()`：需要指定调色板上的图标时重写此方法

## 添加属性

流程要素的参数、结果用于逻辑流程的映射，除此之外还存在一种"属性"机制，用于在设计器的设置画面预先设置值。

要添加属性，需在流程要素类本身添加用作属性的字段及 getter/setter。

```java
@LogicFlowElement(id = "my_task", category = MyCategory.class, index = 100)
public class MyTask extends Task<MyTaskMetadata, MyParameter, MyResult> {

    private String customProperty;

    public MyTask(ElementContext context) {
        super(context);
    }

    public String getCustomProperty() {
        return customProperty;
    }

    public void setCustomProperty(String customProperty) {
        this.customProperty = customProperty;
    }

    @Override
    public MyResult execute(MyParameter parameter) throws FlowExecutionException {
        MyResult result = new MyResult();
        result.setMessage("hello world.");
        return result;
    }
}
```

仅添加属性后，即可直接从设计器的设置画面设置其值（项目名称直接显示为属性名）。若要更改显示名称或默认值，需在元数据类中重写 `decorateElementProperty`。

```java
public class MyTaskMetadata extends FlowElementMetadata {

    public MyTaskMetadata() {
        super(MyTask.class);
    }

    @Override
    public String getElementName() {
        return "サンプルタスク";
    }

    @Override
    protected ElementProperty decorateElementProperty(ElementProperty elementProperty) {
        if ("customProperty".equals(elementProperty.getPropertyName())) {
            elementProperty.setDefaultValue("hello world.");
            elementProperty.setLabelKey("MYTASK.CUSTOMPROPERTY.LABEL.KEY");
        }
        return elementProperty;
    }
}
```

- `setDefaultValue(Object)`：指定属性的默认值
- `setLabelKey(String)`：指定属性显示名称所对应的多语言资源 key
- `setType(String)`：更改属性的显示类型。例如为 `boolean` 类型属性指定 `"flag"`，会使其在设计器上显示为复选框

### ElementProperty 类的方法一览

传入 `decorateElementProperty` 的 `ElementProperty` 实例拥有以下方法（该类完整的公开 API）。`getPropertyName()` / `isEnable()` / `isRequired()` / `isArray()` / `getDefaultValue()` / `getType()` / `getTextKey()` / `getLabelKey()` / `getOptions()` 分别有对应的 setter。除上文说明的 `setDefaultValue` / `setLabelKey` / `setType` 以外的 setter（`setEnable` / `setRequired` / `setArray` / `setOptions` 等），官方指南未作说明，因此本技能不对其用途做断定描述。

```java
public class ElementProperty {
    public String getPropertyName();
    public boolean isEnable();
    public void setEnable(boolean enable);
    public boolean isRequired();
    public void setRequired(boolean required);
    public boolean isArray();
    public void setArray(boolean array);
    public Object getDefaultValue();
    public void setDefaultValue(Object defaultValue);
    public String getType();
    public void setType(String type);
    public String getTextKey();
    public void setTextKey(String textKey);
    public String getLabelKey();
    public void setLabelKey(String labelKey);
    public ElementProperty.Option[] getOptions();
    public void setOptions(ElementProperty.Option[] options);
}
```

`ElementProperty.Option` 是包含 `name` / `labelKey` / `value` 三个字段及对应 getter/setter 的内部类。

## 添加后处理（FlowElementCloser）

若需要在逻辑流程执行结束后调用任意处理（如释放流程要素内使用的资源），需实现 `jp.co.intra_mart.foundation.logic.element.FlowElementCloser` 接口，并在构造函数中通过 `ElementContext#addFlowElementCloser` 注册。

```java
public class MyTask extends Task<MyTaskMetadata, MyParameter, MyResult>
        implements FlowElementCloser {

    private String customProperty;

    public MyTask(ElementContext context) {
        super(context);
        context.addFlowElementCloser(this);
    }

    @Override
    public MyResult execute(MyParameter parameter) throws FlowExecutionException {
        MyResult result = new MyResult();
        result.setMessage("hello world.");
        return result;
    }

    @Override
    public void close() {
        // 释放资源等后处理
    }

    public String getCustomProperty() {
        return customProperty;
    }

    public void setCustomProperty(String customProperty) {
        this.customProperty = customProperty;
    }
}
```

`FlowElementCloser` 不需要由流程要素类自身实现，也可以注册在其他类中实现的实例（`addFlowElementCloser` 的参数类型为 `FlowElementCloser` 接口）。

## 完整实现示例（参数、结果类）

```java
package org.example.logicdesigner.element;

import java.util.Collection;

import jp.co.intra_mart.foundation.logic.annotation.TypeHint;

public class MyParameter {

    private String stringParameter;
    private boolean booleanParameter;
    private String[] stringArrayParameter;
    private Collection<Integer> integerListParameter;

    public String getStringParameter() {
        return stringParameter;
    }

    public void setStringParameter(String stringParameter) {
        this.stringParameter = stringParameter;
    }

    public boolean isBooleanParameter() {
        return booleanParameter;
    }

    public void setBooleanParameter(boolean booleanParameter) {
        this.booleanParameter = booleanParameter;
    }

    public String[] getStringArrayParameter() {
        return stringArrayParameter;
    }

    public void setStringArrayParameter(String[] stringArrayParameter) {
        this.stringArrayParameter = stringArrayParameter;
    }

    @TypeHint(Integer.class)
    public Collection<Integer> getIntegerListParameter() {
        return integerListParameter;
    }

    public void setIntegerListParameter(Collection<Integer> integerListParameter) {
        this.integerListParameter = integerListParameter;
    }
}
```

```java
package org.example.logicdesigner.element;

public class MyResult {

    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
```

## 错误处理

`execute` / `preprocessing` / `postprocessing` 均已通过 `throws` 声明 `FlowExecutionException`（`jp.co.intra_mart.foundation.logic.exception.LogicServiceException` 的子类），流程要素内的错误用该异常表达。

```java
public FlowExecutionException();
public FlowExecutionException(Throwable cause);
public FlowExecutionException(MessageCode messageCode);
public FlowExecutionException(MessageCode messageCode, Throwable cause);
public FlowExecutionException(MessageCode messageCode, String[] args);
// 此外还存在多个组合 MessageCode 的构造函数
```

仅需处理简单的消息、原因异常时，`new FlowExecutionException(cause)` 即可满足需求。若要接入基于 `MessageCode` 的消息代码体系，请遵循平台标准的日志・消息管理机制（`jp.co.intra_mart.foundation.log.MessageCode`）。
