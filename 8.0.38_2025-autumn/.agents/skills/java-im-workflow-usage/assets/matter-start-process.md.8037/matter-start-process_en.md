# Workflow Matter Start Process Template (Java / JavaEE Development Model)

## Overview

Template for implementing an IM-Workflow matter start process (matter start extension process) in Java. It is executed when a matter is newly started.

Extend the abstract class `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessEventListener` and override the `execute` method.

## Parent Class

| Item | Value |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessEventListener` |
| Type | Abstract class |
| Parameter class | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessParameter` |
| Method | `execute(MatterStartProcessParameter parameter)` |
| Return value | `void` |

See [reference/parameter-reference.md](../reference/parameter-reference.md) for the full list of `MatterStartProcessParameter` fields.

## File Structure

```
src/main/java/{basePackage path}/{feature-name}/workflow/
  └── {Feature}MatterStartProcess.java
```

---

## Matter Start Process Class ({Feature}MatterStartProcess.java)

```java
package {basePackage}.{feature-name}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_start.MatterStartProcessParameter;

/**
 * {feature-name} Workflow matter start process class.<br>
 * Executed when a matter is newly started.<br>
 * Do not start a DB transaction within this class.
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}MatterStartProcess extends MatterStartProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}MatterStartProcess.class);

    /**
     * Executed as the matter start extension process.
     *
     * @param parameter matter start process parameter
     * @throws Exception if an exception occurs
     */
    @Override
    public void execute(final MatterStartProcessParameter parameter) throws Exception {
        LOGGER.info("Started matter start process. flowId=" + parameter.getFlowId());

        // TODO: Implement the matter-start-time business logic here.
        //
        // Main available parameters:
        //   parameter.getRouteId()  - route ID
        //   parameter.getFlowId()   - flow ID
        //   parameter.getUserDataId() - user data ID
    }
}
```

## Notes for Generation

- Do not start a DB transaction within this class
- The matter start process is triggered by "the matter having started." Note that this is a different timing from the application process (the `apply` action process)
