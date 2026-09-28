---
name: java-im-logic-generator
description: Newly implements IM-LogicDesigner flow elements (tasks) for intra-mart in Java (JavaEE development model). Provides implementation patterns for the category class (ElementCategory), the flow element class (Task subclass + @LogicFlowElement), the metadata class (FlowElementMetadata), and extension package registration (ElementScanPackageFactory + META-INF/services). Use when the user mentions wanting to create an IM-LogicDesigner task in Java, implement a custom logic flow element, add a custom task, or extend IM-LogicDesigner in the JavaEE development model. Use jssp-im-logic-generator to generate the logic flow definition (flow_definition.json) itself, and jssp-im-logic-usage to call an existing flow from a JSSP screen. Mapping functions, EL functions, and flow triggers are out of scope.
allowed-tools: Bash, Read, Write, Glob
---

# IM-LogicDesigner Java Flow Element Implementation Support Skill

## Purpose

A skill set for implementing a custom **task (flow element)** shown in the IM-LogicDesigner palette in Java, using the extension points intra-mart Accel Platform's IM-LogicDesigner provides (the abstract classes and interfaces under `jp.co.intra_mart.foundation.logic.element.*`).

## Out of scope

IM-LogicDesigner has several extension points, but this skill covers **flow element (task) implementation only**. The following are out of scope.

| Out-of-scope feature | Skill / action to use instead |
|------|----------------|
| Creating the logic flow definition (`flow_definition.json`) itself | `jssp-im-logic-generator` |
| Calling an existing logic flow API from a JSSP screen | `jssp-im-logic-usage` |
| Mapping functions (`@MappingFunction`) | Not covered by this skill |
| EL functions (`@ELFunction` / `@ProvideELFunction`) | Not covered by this skill |
| Flow triggers (`@TriggerEvent`) | Not covered by this skill |

## Classes to implement

Adding one flow element requires creating the following classes in this order. A category can be shared across tasks, so skip creating a new one if a suitable category already exists.

| Class | Role | Base class / interface |
|-------|------|------------|
| Category class | Defines a category (group) on the palette. Reusable | Implements `ElementCategory` |
| Parameter class | The flow element's input value (mapping source) | No constraint (JavaBeans-compliant POJO) |
| Result class | The flow element's output value (mapping target) | No constraint (JavaBeans-compliant POJO) |
| Flow element class | The task's actual processing body. Annotated with `@LogicFlowElement` | Extends `Task<metadata, parameter, result>` |
| Metadata class | Palette display name, icon, and property metadata | Extends `FlowElementMetadata` |
| Package factory class | Registers the extension package with the platform (one per project is enough) | Implements `ElementScanPackageFactory` |

See `reference/flow-element-api.md` for the full API (complete method signatures). **Do not implement from memory or guesswork.**

## Implementation steps

1. Gather requirements from the user (task name, category, input/output parameters, properties, base package)
2. If the extension package is not yet registered in the project, create the `ElementScanPackageFactory` implementation class and the `META-INF/services` provider configuration file per `reference/registration-and-packaging.md` (reuse the existing one if the project already has one; do not create a new one)
3. Create the category class, or reuse an existing category
4. Create the parameter and result classes (see `reference/flow-element-api.md` for usable types)
5. Create the flow element class (extends `Task`) and annotate it with `@LogicFlowElement`
6. Create the metadata class (extends `FlowElementMetadata`), passing the flow element class to its constructor
7. If properties (values preset via the designer screen) are needed, implement them per "Adding a property" in `reference/flow-element-api.md`
8. If post-processing (resource cleanup, etc.) is needed, implement `FlowElementCloser`
9. Confirm compliance with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## Minimal implementation example

Below is a minimal example (no property, no post-processing). See `reference/flow-element-api.md` for a complete example including a property and post-processing.

```java
// Category
package org.example.logicdesigner.element;

import jp.co.intra_mart.foundation.logic.element.category.ElementCategory;

public class MyCategory implements ElementCategory {

    @Override
    public String getCategoryId() {
        return "my_category";
    }

    @Override
    public String getDisplayName() {
        return "サンプルカテゴリ";
    }

    @Override
    public int getSortNumber() {
        return 100;
    }
}
```

```java
// Flow element
package org.example.logicdesigner.element;

import jp.co.intra_mart.foundation.logic.annotation.LogicFlowElement;
import jp.co.intra_mart.foundation.logic.element.ElementContext;
import jp.co.intra_mart.foundation.logic.element.Task;
import jp.co.intra_mart.foundation.logic.exception.FlowExecutionException;

@LogicFlowElement(id = "my_task", category = MyCategory.class, index = 100)
public class MyTask extends Task<MyTaskMetadata, MyParameter, MyResult> {

    public MyTask(ElementContext context) {
        super(context);
    }

    @Override
    public MyResult execute(MyParameter parameter) throws FlowExecutionException {
        MyResult result = new MyResult();
        result.setMessage("hello world.");
        return result;
    }
}
```

```java
// Metadata
package org.example.logicdesigner.element;

import jp.co.intra_mart.foundation.logic.element.metadata.FlowElementMetadata;

public class MyTaskMetadata extends FlowElementMetadata {

    public MyTaskMetadata() {
        super(MyTask.class);
    }

    @Override
    public String getElementName() {
        return "サンプルタスク";
    }
}
```

- The `id` on `@LogicFlowElement` **cannot start with `im_`** (reserved to avoid clashing with the platform's standard tasks). The same restriction applies to `getCategoryId()` on the category.
- The parameter and result classes are JavaBeans-compliant POJOs with getters/setters (see `reference/flow-element-api.md`).

## Placement conventions

Follow the project's existing Java package conventions if any exist. Otherwise, following the examples in `.github/instructions/java-naming.instructions.md`, use the following as the default. **This default is only a fallback; an explicit instruction from the user always takes priority.**

```
{basePackage}.logicdesigner.element
```

```
src/main/java/{basePackage path segments}/logicdesigner/element/{ClassName}.java
```

One `ElementScanPackageFactory` implementation is enough per project, so place it directly under `{basePackage}.logicdesigner`.

## Notes

- A flow element instance is created for every logic flow execution. However, when the same flow element is invoked repeatedly (e.g. inside a loop), its instance is reused, so do not carry state from a previous execution over in a field
- A category class can be shared across multiple flow elements. Do not create a new category every time you add a task
- Flow element and metadata classes are automatically loaded by the platform at startup, driven by the `@LogicFlowElement` annotation. Unlike IM-Workflow's Java integration (`java-im-workflow-usage`), there is no step to register an FQCN in an XML file
- Failures inside `execute` are expressed with `FlowExecutionException` (already declared via `throws`)
- Deployment onto the runtime classpath is required, just like other Java extensions. See `reference/registration-and-packaging.md` for details

## References

- `reference/flow-element-api.md` — the list of types usable for parameters/results/properties, the full API signatures for `Task` / `FlowElementMetadata` / `ElementProperty` etc., and complete implementation examples for adding a property and post-processing
- `reference/registration-and-packaging.md` — extension package registration (`ElementScanPackageFactory` + `META-INF/services`) and notes on deploying to the runtime classpath

## Post-generation checks

Rather than an automated validation script, confirm the following manually.

1. That the `id` on `@LogicFlowElement` and the category's `getCategoryId()` do not start with `im_`
2. That the three type parameters of `Task<metadata, parameter, result>` match the flow element class passed to the metadata class's constructor
3. That the types used for parameters, results, and properties are included in the list of usable types in `reference/flow-element-api.md` (and that `@TypeHint` is added when using `Collection`/`List`)
4. Compliance with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
5. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output

## Boundaries with other skills

| Responsibility | Skill in charge |
|------|-----------|
| Generating the logic flow definition (`flow_definition.json`) and routing definition | `jssp-im-logic-generator` |
| Calling an existing logic flow API from a JSSP screen | `jssp-im-logic-usage` |
| **Java implementation of a custom task (flow element)** | **This skill** |
