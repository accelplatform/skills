---
name: java-im-logic-generator
description: 使用 Java（JavaEE 开发模型）新建 intra-mart IM-LogicDesigner 的流程要素（任务）。提供分类类（ElementCategory）、流程要素类（继承 Task + @LogicFlowElement）、元数据类（FlowElementMetadata）、扩展包注册（ElementScanPackageFactory + META-INF/services）的实现模式。当提及"用 Java 创建 IM-LogicDesigner 的任务"、"实现自定义逻辑流程要素"、"添加自定义任务"、"用 JavaEE 开发模型扩展 IM-LogicDesigner"时使用。生成逻辑流程定义（flow_definition.json）本身请使用 jssp-im-logic-generator，从 JSSP 画面调用已有流程请使用 jssp-im-logic-usage。映射函数、EL函数、流程触发器不在本技能范围内。
allowed-tools: Bash, Read, Write, Glob
---

# IM-LogicDesigner Java 流程要素实现支持技能

## 目的

使用 intra-mart Accel Platform 的 IM-LogicDesigner 提供的扩展点（`jp.co.intra_mart.foundation.logic.element.*` 下的抽象类・接口），以 Java 新建显示在逻辑流程调色板中的**自定义任务（流程要素）**的技能集。

## 不在范围内

IM-LogicDesigner 有多个扩展点，但本技能**仅覆盖流程要素（任务）的实现**。以下内容不在范围内。

| 不在范围内的功能 | 应使用的技能/方式 |
|------|----------------|
| 创建逻辑流程定义（`flow_definition.json`）本身 | `jssp-im-logic-generator` |
| 从 JSSP 画面调用已有的逻辑流程 API | `jssp-im-logic-usage` |
| 映射函数（`@MappingFunction`） | 不在本技能范围内 |
| EL函数（`@ELFunction` / `@ProvideELFunction`） | 不在本技能范围内 |
| 流程触发器（`@TriggerEvent`） | 不在本技能范围内 |

## 需要实现的类一览

新增一个流程要素需要按以下顺序创建类。分类可在多个任务间共用，若已有合适的分类则无需新建。

| 类 | 作用 | 继承/实现对象 |
|-------|------|------------|
| 分类类 | 定义调色板上的分类（分组）。可复用 | 实现 `ElementCategory` 接口 |
| 参数类 | 流程要素的输入值（映射来源） | 无约束（符合 JavaBeans 规范的 POJO） |
| 结果类 | 流程要素的输出值（映射目标） | 无约束（符合 JavaBeans 规范的 POJO） |
| 流程要素类 | 任务的实际处理主体。附加 `@LogicFlowElement` | 继承 `Task<元数据, 参数, 结果>` |
| 元数据类 | 调色板显示名称、图标、属性元信息 | 继承 `FlowElementMetadata` |
| 包工厂类 | 向平台注册扩展包（每个项目一个即可） | 实现 `ElementScanPackageFactory` 接口 |

详细 API（完整方法签名）请参见 `reference/flow-element-api.md`。**不要凭记忆或推测实现。**

## 实现步骤

1. 向用户确认需求（任务名称、所属分类、输入输出参数、属性、基础包名）
2. 若项目尚未注册扩展包，按照 `reference/registration-and-packaging.md` 创建 `ElementScanPackageFactory` 实现类和 `META-INF/services` 服务提供者配置文件（若项目已有则复用，不要新建）
3. 创建分类类，或复用已有分类
4. 创建参数类、结果类（可用类型参见 `reference/flow-element-api.md`）
5. 创建流程要素类（继承 `Task`），并附加 `@LogicFlowElement`
6. 创建元数据类（继承 `FlowElementMetadata`），将流程要素类传给其构造函数
7. 如需属性（在设计器画面预先设置的值），按照 `reference/flow-element-api.md` 的"添加属性"实现
8. 如需后处理（释放资源等），实现 `FlowElementCloser`
9. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `.github/instructions/java-code-style.instructions.md` / `.github/instructions/java-javadoc.instructions.md`

## 最小实现示例

以下为最小构成（不含属性、后处理）的示例。包含属性与后处理的完整示例请参见 `reference/flow-element-api.md`。

```java
// 分类
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
// 流程要素
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
// 元数据
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

- `@LogicFlowElement` 的 `id` **不能以 `im_` 开头**（为避免与平台标准任务冲突而保留）。分类的 `getCategoryId()` 同样受此限制。
- 参数类、结果类应实现为带有 getter/setter、符合 JavaBeans 规范的 POJO（参见 `reference/flow-element-api.md`）。

## 配置规约

若项目已有 Java 包命名规约，遵循该规约。若没有，参照 `.github/instructions/java-naming.instructions.md` 中的示例，采用以下作为默认值。**该默认值仅为兜底，用户明确指定时以用户指定为准。**

```
{basePackage}.logicdesigner.element
```

```
src/main/java/{basePackage 的路径分隔形式}/logicdesigner/element/{ClassName}.java
```

`ElementScanPackageFactory` 实现类每个项目一个即可，放置在 `{basePackage}.logicdesigner` 直接下方。

## 注意事项

- 流程要素每次执行逻辑流程时都会生成新实例。但在循环等场景中重复调用同一流程要素时，实例会被复用，因此不要在字段中保留上次执行时的状态
- 分类类可在多个流程要素之间共用。不要每添加一个任务就新建一个分类
- 流程要素、元数据类由平台在启动时以 `@LogicFlowElement` 注解为起点自动加载。与 IM-Workflow 的 Java 集成（`java-im-workflow-usage`）不同，不需要在 XML 中登记 FQCN
- `execute` 方法内的失败用 `FlowExecutionException`（已声明 `throws`）表达
- 需要部署到运行时类路径这一点与其他 Java 扩展相同。详见 `reference/registration-and-packaging.md`

## 参考资料

- `reference/flow-element-api.md` — 参数/结果/属性可用类型一览、`Task` / `FlowElementMetadata` / `ElementProperty` 等完整 API 签名、添加属性与后处理的完整实现示例
- `reference/registration-and-packaging.md` — 扩展包注册（`ElementScanPackageFactory` + `META-INF/services`）及部署到运行时类路径的注意事项

## 生成后确认

并非通过自动验证脚本，而是手动确认以下内容。

1. `@LogicFlowElement` 的 `id` 及分类的 `getCategoryId()` 是否以 `im_` 开头
2. `Task<元数据, 参数, 结果>` 的三个类型参数与元数据类构造函数中传入的流程要素类是否一致
3. 参数、结果、属性所用类型是否包含在 `reference/flow-element-api.md` 的可用类型一览中（使用 `Collection`/`List` 时是否附加了 `@TypeHint`）
4. 是否符合 `.github/instructions/java-naming.instructions.md` / `.github/instructions/java-code-style.instructions.md` / `.github/instructions/java-javadoc.instructions.md`
5. `jssp-code-review` / `jssp-security-check` 是 JSSP 专用技能，不适用于本技能的产出物

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| 生成逻辑流程定义（`flow_definition.json`）、路由定义 | `jssp-im-logic-generator` |
| 从 JSSP 画面调用已有逻辑流程 API | `jssp-im-logic-usage` |
| **自定义任务（流程要素）的 Java 实现** | **本技能** |
