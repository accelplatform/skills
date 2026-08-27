# 工作流 分支条件・合并条件模板（Java / JavaEE 开发模型）

## 概述

用 Java 实现 IM-Workflow 用户程序方式的分支条件・合并条件判定的模板。用于判定分支节点的路由选择，或解除合并节点的同步等待。

继承抽象类 `jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionEventListener`，并覆盖 `execute` 方法。

**无论是分支条件还是合并条件，实现的类都相同**（继承 `RuleConditionEventListener`）。注册到哪个扩展点由导入用 XML 一侧（`base-im-workflow-generator`）切换。

## 父类

| 项目 | 值 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionEventListener` |
| 类型 | 抽象类 |
| 参数类 | `jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionParameter` |
| 方法 | `execute(RuleConditionParameter parameter)` |
| 返回值 | `boolean`（分支条件：`true`=迁移到该路由 / `false`=不迁移。合并条件：`true`=视为同步完成并继续 / `false`=继续等待。默认实现为 `true`） |

`RuleConditionParameter` 的字段一览请参见 [reference/parameter-reference.md](../reference/parameter-reference.md)。若在条件判定中使用案件属性，请先用 dev-knowledge 确认案件属性获取 API 的存在后再实现（不要凭记忆编写）。

## 文件结构

```
src/main/java/{basePackage 路径}/{功能名}/workflow/rule/
  └── {Feature}BranchRule.java      # 分支条件的情况
  └── {Feature}UnionRule.java       # 合并条件的情况
```

---

## 分支条件类（{Feature}BranchRule.java）

```java
package {basePackage}.{功能名}.workflow.rule;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionParameter;

/**
 * {功能名} 工作流 分支条件类。<br>
 * 判定分支节点的路由选择可否。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}BranchRule extends RuleConditionEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}BranchRule.class);

    /**
     * 作为分支条件判定执行。
     *
     * @param parameter 工作流参数
     * @return boolean 路由迁移可否（true：迁移 / false：停滞）
     * @throws Exception 发生异常时
     */
    @Override
    public boolean execute(final RuleConditionParameter parameter) throws Exception {
        // TODO：请在此处实现分支条件判定的业务逻辑。
        //
        // 例：仅当合计金额超过5万日元时返回 true 等
        //   parameter.getSystemMatterId() - 系统案件ID
        //   parameter.getNodeId()         - 分支节点ID

        return true;
    }
}
```

## 生成时的注意事项

- 分支条件・合并条件仅判定逻辑不同，类的类型相同。请根据用途区分使用类名（`BranchRule` / `UnionRule`）和文件配置
- `execute` 会针对多个分支候选节点分别单独调用（一次调用仅判定一条路由的可否），因此判定逻辑应保持无状态
