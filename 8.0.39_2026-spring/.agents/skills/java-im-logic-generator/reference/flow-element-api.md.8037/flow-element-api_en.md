# Flow element API reference

## Types usable for parameters and results

- Primitive types
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

`java.util.Collection` or `java.util.List` containing the above types can also be used. In that case, annotate the getter with `jp.co.intra_mart.foundation.logic.annotation.TypeHint` to specify the contained type.

```java
@TypeHint(Integer.class)
public Collection<Integer> getIntegerListParameter() {
    return integerListParameter;
}
```

Parameter and result classes must be POJOs with getters/setters implemented following the JavaBeans convention.

## Types usable for properties

Fewer types are usable for properties (described below) than for parameters/results.

- Primitive types
- `java.lang.String`
- `java.lang.Boolean` / `java.lang.Character` / `java.lang.Short` / `java.lang.Integer` / `java.lang.Long` / `java.lang.Float` / `java.lang.Double`
- `java.math.BigDecimal` / `java.math.BigInteger`
- `java.util.Date`
- `java.sql.Date` / `java.sql.Timestamp`
- `java.lang.Enum`

## List of classes, interfaces, and annotations (FQCN)

| Name | FQCN | Kind |
|------|------|------|
| `ElementCategory` | `jp.co.intra_mart.foundation.logic.element.category.ElementCategory` | Interface |
| `Task` | `jp.co.intra_mart.foundation.logic.element.Task` | Abstract class |
| `FlowElement` | `jp.co.intra_mart.foundation.logic.element.FlowElement` | Abstract class (parent of `Task`) |
| `Executable` | `jp.co.intra_mart.foundation.logic.element.Executable` | Interface (implemented by `Task`) |
| `ElementContext` | `jp.co.intra_mart.foundation.logic.element.ElementContext` | Interface |
| `FlowElementCloser` | `jp.co.intra_mart.foundation.logic.element.FlowElementCloser` | Interface |
| `FlowElementMetadata` | `jp.co.intra_mart.foundation.logic.element.metadata.FlowElementMetadata` | Abstract class |
| `ElementProperty` | `jp.co.intra_mart.foundation.logic.element.metadata.ElementProperty` | Class |
| `LogicFlowElement` | `jp.co.intra_mart.foundation.logic.annotation.LogicFlowElement` | Annotation |
| `TypeHint` | `jp.co.intra_mart.foundation.logic.annotation.TypeHint` | Annotation |
| `FlowExecutionException` | `jp.co.intra_mart.foundation.logic.exception.FlowExecutionException` | Exception class |
| `ElementScanPackageFactory` | `jp.co.intra_mart.system.logic.factory.ElementScanPackageFactory` | Interface (see `reference/registration-and-packaging.md`) |

## ElementCategory interface

```java
public interface ElementCategory {
    String getCategoryId();
    String getDisplayName();
    int getSortNumber();
}
```

- `getCategoryId()`: the category ID. **Cannot start with `im_`**
- `getDisplayName()`: the category name shown on the palette. For localization, return a value that matches the caller's locale using the MessageManager API or similar
- `getSortNumber()`: the sort order on the palette. Smaller values are shown first. Standard features use sequential numbers starting at 1

## LogicFlowElement annotation

```java
public @interface LogicFlowElement {
    String id();
    Class<? extends ElementCategory> category();
    int index();
    String pairId();
}
```

- `id`: the flow element ID. **Cannot start with `im_`**
- `category`: the category class it belongs to
- `index`: the sort order on the palette (within the category)
- `pairId`: an attribute specifying the ID of the paired flow element (for elements with a paired structure, such as loop start/end tasks)

Classes annotated with `@LogicFlowElement` are loaded automatically at startup.

## Task class

```java
public abstract class Task<T extends Metadata, D, R>
        extends FlowElement<T> implements Executable<D, R> {

    protected Task(ElementContext context);

    // Executable<D, R> implementation (Task provides an empty implementation; overriding is optional)
    public void preprocessing() throws FlowExecutionException;
    public R execute(D parameter) throws FlowExecutionException;  // abstract; must be implemented
    public void postprocessing() throws FlowExecutionException;

    public void setContinueOnError(boolean continueOnError);
    public boolean isContinueOnError();
}
```

The type parameters, in order, are the metadata class, the parameter type, and the result type.

- The constructor takes an `ElementContext`. Call `super(context)`
- `execute` is the body invoked when the flow element runs. **You must override it**
- `preprocessing` / `postprocessing` have empty implementations provided by `Task`, so overriding them is optional when no pre/post-processing is needed
- `getAlias()` / `setAlias(String)`, inherited from `FlowElement`, handle the flow element's alias on the designer

## ElementContext interface

```java
public interface ElementContext {
    LogicFlowElementDefinition getElementDefinition();
    LogicSession getLogicSession();
    void addFlowElementCloser(FlowElementCloser closer);
}
```

Registering an instance (itself or another) via `addFlowElementCloser` causes `FlowElementCloser#close()` to be invoked after the flow finishes executing (see below).

## FlowElementMetadata class

```java
public abstract class FlowElementMetadata implements Metadata {

    protected FlowElementMetadata(Class<? extends FlowElement<? extends Metadata>> elementClass);

    public abstract String getElementName();  // must override

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

- Passing the flow element class (the class extending `Task`) to the constructor automatically analyzes the flow element's parameter/result data types and incorporates them as metadata
- `getElementName()`: the element name shown on the palette. **Must be overridden**. For localization, use the MessageManager API or similar
- `decorateElementProperty(ElementProperty)`: override this to customize property items (see below)
- `getIconId()`: override this to specify the icon shown on the palette

## Adding a property

A flow element's parameters/results are used in logic flow mapping, but there is a separate "property" mechanism for values preset on the designer's settings screen.

To add a property, add a field with a getter/setter to the flow element class itself.

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

Simply adding a property already lets you set its value from the designer's settings screen (the property name itself is shown as the item label). To change the display label or default value, override `decorateElementProperty` in the metadata class.

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

- `setDefaultValue(Object)`: specifies the property's default value
- `setLabelKey(String)`: specifies the localization resource key for the property's display label
- `setType(String)`: changes the property's display type. For example, specifying `"flag"` on a `boolean` property makes the designer show it as a checkbox

### ElementProperty class method list

The `ElementProperty` instance passed to `decorateElementProperty` has the following methods (the class's complete public API). Each of `getPropertyName()` / `isEnable()` / `isRequired()` / `isArray()` / `getDefaultValue()` / `getType()` / `getTextKey()` / `getLabelKey()` / `getOptions()` has a corresponding setter. Beyond `setDefaultValue` / `setLabelKey` / `setType` explained above, the official guide does not describe the remaining setters (`setEnable` / `setRequired` / `setArray` / `setOptions`, etc.), so this skill does not assert their specific purpose.

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

`ElementProperty.Option` is a nested class with three fields — `name` / `labelKey` / `value` — and corresponding getters/setters.

## Adding post-processing (FlowElementCloser)

To invoke arbitrary processing after logic flow execution (such as releasing resources used inside the flow element), implement the `jp.co.intra_mart.foundation.logic.element.FlowElementCloser` interface and register it with `ElementContext#addFlowElementCloser` in the constructor.

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
        // post-processing such as releasing resources
    }

    public String getCustomProperty() {
        return customProperty;
    }

    public void setCustomProperty(String customProperty) {
        this.customProperty = customProperty;
    }
}
```

`FlowElementCloser` does not need to be implemented by the flow element class itself — you can also register an instance implemented in a separate class (the `addFlowElementCloser` argument type is the `FlowElementCloser` interface).

## Complete implementation example (parameter and result classes)

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

## Error handling

`execute` / `preprocessing` / `postprocessing` all already declare `FlowExecutionException` (a subclass of `jp.co.intra_mart.foundation.logic.exception.LogicServiceException`) via `throws`, and errors inside a flow element are expressed with this exception.

```java
public FlowExecutionException();
public FlowExecutionException(Throwable cause);
public FlowExecutionException(MessageCode messageCode);
public FlowExecutionException(MessageCode messageCode, Throwable cause);
public FlowExecutionException(MessageCode messageCode, String[] args);
// Several other constructors combining MessageCode also exist
```

`new FlowExecutionException(cause)` is enough when you only need a simple message/cause exception. If you want to plug into the platform's message-code scheme, follow the platform's standard logging/message management mechanism (`jp.co.intra_mart.foundation.log.MessageCode`).
