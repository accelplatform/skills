# Workflow Matter End Process Template (Java / JavaEE Development Model)

## Overview

Template for implementing an IM-Workflow matter end process (matter end extension process) in Java. It is executed when a matter is completed, and is mainly used to control whether the standard mail notification is sent.

Extend the abstract class `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessEventListener` and override the `execute` method.

**There are two extension points, transactional and non-transactional, but the implementation class is the same** (extends `MatterEndProcessEventListener`). Which extension point it is registered to is switched on the import XML side (`base-im-workflow-generator`).

## Parent Class

| Item | Value |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessEventListener` |
| Type | Abstract class |
| Parameter class | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessParameter` |
| Method | `execute(MatterEndProcessParameter parameter)` |
| Return value | `boolean` (`true`: allow standard mail sending / `false`: disallow. Default implementation is `true`) |

See [reference/parameter-reference.md](../reference/parameter-reference.md) for the full list of `MatterEndProcessParameter` fields (including the final processor information and mail/IMBox substitution information).

## File Structure

```
src/main/java/{basePackage path}/{feature-name}/workflow/
  └── {Feature}MatterEndProcess.java
```

---

## Matter End Process Class ({Feature}MatterEndProcess.java)

```java
package {basePackage}.{feature-name}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessParameter;

/**
 * {feature-name} Workflow matter end process class.<br>
 * Executed when a matter is completed. Controls whether the standard mail is sent.<br>
 * Do not start a DB transaction within this class.
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}MatterEndProcess extends MatterEndProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}MatterEndProcess.class);

    /**
     * Executed as the matter end process.
     *
     * @param parameter workflow parameter
     * @return boolean whether the standard mail can be sent (true: can be sent / false: cannot be sent)
     * @throws Exception if an exception occurs
     */
    @Override
    public boolean execute(final MatterEndProcessParameter parameter) throws Exception {
        LOGGER.info("Started matter end process. lastProcessNodeId=" + parameter.getLastProcessNodeId());

        // TODO: Implement the matter-end-time business logic here.
        //
        // Main available parameters:
        //   parameter.getLastAuthUserCd()  - final processing authority user code
        //   parameter.getLastExecUserCd()  - final processing executor user code
        //   parameter.getLastResultStatus() - final processing result status

        return true;
    }
}
```

## Notes for Generation

- The implementation class does not distinguish which extension point (transactional or non-transactional) it is registered to. Choosing the registration target is the responsibility of the import XML side
- Do not start a DB transaction within this class (even for the transactional extension point, the engine controls the transaction, so do not `begin/commit` it yourself)
