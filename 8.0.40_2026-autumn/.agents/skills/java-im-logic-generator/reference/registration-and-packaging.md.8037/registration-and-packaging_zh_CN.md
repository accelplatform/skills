# 扩展包注册・配置相关注意事项

## 指定扩展包

IM-LogicDesigner 的所有扩展功能（流程要素、映射函数、EL函数、流程触发器）都由平台在启动时扫描类路径自动加载。需要通过实现指定类来明确指定扫描目标包。

指定的包会连同其子包一起被搜索。**扫描范围过大会导致启动时的解析耗时增加**，因此指定的包应尽量控制在最小范围内。

指定包的类需要实现 `jp.co.intra_mart.system.logic.factory.ElementScanPackageFactory` 接口。

```java
package org.example.logicdesigner;

import java.util.Arrays;
import java.util.Collection;

import jp.co.intra_mart.system.logic.factory.ElementScanPackageFactory;

public class MyPackageFactory implements ElementScanPackageFactory {

    @Override
    public Collection<String> getTargetPackages() {
        return Arrays.asList("org.example.logicdesigner");
    }
}
```

- 在 `getTargetPackages()` 的返回值中以字符串形式列出希望扫描的包名
- 之后创建的分类、流程要素、元数据类都应放置在此处指定的包下（含子包）

## 配置 ServiceLoader 服务提供者配置文件

创建的包工厂类会作为通过 `java.util.ServiceLoader` 加载的服务提供者处理。因此需要在类路径上放置以下服务提供者配置文件。

```
src/main/resources/META-INF/services/jp.co.intra_mart.system.logic.factory.ElementScanPackageFactory
```

文件内容为一行，写入所创建的包工厂类的完全限定名（FQCN）。

```
org.example.logicdesigner.MyPackageFactory
```

**该文件每个项目一个即可。** 在同一包下继续添加多个流程要素、任务时，不需要再次创建 `ElementScanPackageFactory` 实现类及该服务提供者配置文件——若项目已有该文件，只需在其扫描包下追加类即可。

## 部署到运行时类路径

所创建的 Java 类（分类、流程要素、元数据、包工厂类）编译后的 `.class`（或包含它们的 JAR）**必须存在于应用服务器的运行时类路径上**。仅放置源文件不会生效。

具体的部署方式（将 JAR 放入 WEB-INF/lib，或作为 OSGi 捆绑模块部署等）取决于项目的构建配置，不在本技能范围内。请遵循项目已有 Java 模块的构建・部署流程。若不存在已有的 Java 模块，需向用户确认以下事项。

1. 将 Java 源代码添加到哪个 Maven 模块（或新建模块）
2. 如何将构建产物（JAR）反映到部署环境

## 与 IM-Workflow 的 Java 集成的区别

`java-im-workflow-usage` 生成的 Java 类，只有在工作流定义（导入用 XML）的 `plugins[].parameter` 中以字符串形式登记实现类的 FQCN 后才会被调用。

而本技能所涉及的流程要素，是通过 **`@LogicFlowElement` 注解与 `ElementScanPackageFactory` 的自动扫描**加载的。不存在向 XML 等单独登记 FQCN 的步骤。只需将附加了 `@LogicFlowElement` 的类放置在扫描目标包下，启动时即会自动反映到调色板中。

## 类的实例化条件

流程要素类在每次执行逻辑流程时都会生成实例（但在循环等场景中重复调用同一流程要素时，实例会被复用）。由于 `Task` 的构造函数以 `ElementContext` 为参数，与 IM-Workflow 的 Java 集成（必须提供无参构造函数）不同，**无需提供无参构造函数**。
