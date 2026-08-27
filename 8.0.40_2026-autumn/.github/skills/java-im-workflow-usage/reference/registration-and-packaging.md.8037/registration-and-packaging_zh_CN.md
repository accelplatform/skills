# 关于注册方法・包配置的注意事项

## 向工作流定义注册

生成的 Java 类单独不会被执行。只有在 IM-Workflow 的路由/流程定义（节点的插件配置）中注册实现类的**完全限定名（FQCN）**后，才会被调用。

注册位置与 JSSP 版设置 `scriptPath`（不含扩展名的文件路径）的 `plugins[].parameter` 项相同，唯一区别是在此设置 **FQCN 字符串**。

```xml
<!-- JSSP 版（scriptPath） -->
<parameter type="string">sample/leave/workflow/action/action_process</parameter>

<!-- Java 版（FQCN） -->
<parameter type="string">jp.co.intra_mart.sample.leave.workflow.action.LeaveActionProcess</parameter>
```

XML 生成本身由 `base-im-workflow-generator` 负责。本技能仅生成 Java 源代码实体。与 JSSP 版 `pluginId`（`{exPointId}.pluginScriptExecutor`）对应的 Java 侧 `pluginId` 为 **`{exPointId}.pluginJavaExecutor`**（已通过实机实际注册为 Java 类执行并导出的 XML 确认；已确认的处理共 8 种：动作处理・案件开始/结束处理・分支条件・案件删除（未完成/已完成/历史）・案件归档处理）。详情及未确认的扩展点列表请参阅 `.github/skills/base-im-workflow-generator/reference/java-class-registration.md`。到达处理・合并条件・处理对象者插件推测遵循相同的命名规则，但尚未确认，使用前请在实机上确认一次。

## 运行时类路径的配置

Java 类通过 IM-Workflow 引擎的运行时类加载器（`Thread.currentThread().getContextClassLoader()`）加载。因此，编译后的 `.class`（或 JAR）**必须存在于应用服务器的运行时类路径上。** 像 JSSP 那样仅配置源文件是无法运行的。

具体的配置方法（将 JAR 配置到 WEB-INF/lib 下，或作为 OSGi 捆绑模块配置等）取决于项目的构建配置，不在本技能的范围内。请遵循项目现有 Java 模块的构建・部署流程。若不存在现有的 Java 模块，请向用户确认以下事项：

1. 将 Java 源代码添加到哪个 Maven 模块（或新建模块）
2. 如何将构建产物（JAR）反映到部署环境中

## 类实例化的条件

注册的 FQCN 会通过相当于 `Class.newInstance()`（反射）的方式被实例化。因此：

- **必须有无参构造函数**（若未显式编写构造函数，隐式的默认构造函数即可满足。请勿将构造函数设为 `private`，也不要仅提供带参数的构造函数）
- 类必须为 `public`
- 实现时应假定每次创建实例时状态都会被清空（不要在字段中保留上次调用时的状态，应以无状态方式编写）

## 包结构的思路

`.github/instructions/java-naming.instructions.md` 的「包结构」一节展示的是按层（`entity` / `service` / `repository` 等）划分，但工作流联动程序为了与 JSSP 版按功能单位（`{功能名}/workflow/...`）划分目录的惯例保持一致，本技能采用**在功能单位子包下设置处理类型目录**的结构（参见 `SKILL.md` 的「配置规约」）。若项目已有既定的包结构规约，则优先遵循该规约。
