# Workflow Branch Condition / Union Condition Template (Java / JavaEE Development Model)

## Overview

Template for implementing in Java the user-program-based branch condition / union condition judgment of IM-Workflow. It judges the route selection at a branch node, or the release of the wait for synchronization at a union (merge) node.

Extend the abstract class `jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionEventListener` and override the `execute` method.

**The implementation class is the same for both branch conditions and union conditions** (extends `RuleConditionEventListener`). Which extension point it is registered to is switched on the import XML side (`base-im-workflow-generator`).

## Parent Class

| Item | Value |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionEventListener` |
| Type | Abstract class |
| Parameter class | `jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionParameter` |
| Method | `execute(RuleConditionParameter parameter)` |
| Return value | `boolean` (Branch condition: `true` = transition to the route / `false` = do not transition. Union condition: `true` = treat as synchronization complete and proceed / `false` = keep waiting. Default implementation is `true`) |

See [reference/parameter-reference.md](../reference/parameter-reference.md) for the full list of `RuleConditionParameter` fields. If you use matter properties in the condition judgment, verify with dev-knowledge that the matter property retrieval API exists before implementing (do not write it from memory).

## File Structure

```
src/main/java/{basePackage path}/{feature-name}/workflow/rule/
  └── {Feature}BranchRule.java      # For branch conditions
  └── {Feature}UnionRule.java       # For union conditions
```

---

## Branch Condition Class ({Feature}BranchRule.java)

```java
package {basePackage}.{feature-name}.workflow.rule;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.rule.condition.RuleConditionParameter;

/**
 * {feature-name} Workflow branch condition class.<br>
 * Judges whether route selection is possible at a branch node.
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}BranchRule extends RuleConditionEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}BranchRule.class);

    /**
     * Executed as the branch condition judgment.
     *
     * @param parameter workflow parameter
     * @return boolean whether the route can transition (true: transition / false: stall)
     * @throws Exception if an exception occurs
     */
    @Override
    public boolean execute(final RuleConditionParameter parameter) throws Exception {
        // TODO: Implement the branch condition judgment business logic here.
        //
        // Example: return true only if the total amount exceeds 50,000 yen, etc.
        //   parameter.getSystemMatterId() - system matter ID
        //   parameter.getNodeId()         - branch node ID

        return true;
    }
}
```

## Notes for Generation

- Branch conditions and union conditions differ only in judgment logic; the class type is common. Use the class name (`BranchRule` / `UnionRule`) and file placement appropriate to the use case
- `execute` is called individually for each of multiple candidate branch destination nodes (a single call only judges the availability of one route), so keep the judgment logic stateless
