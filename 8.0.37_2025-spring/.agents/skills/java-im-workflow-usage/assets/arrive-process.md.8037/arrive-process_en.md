# Workflow Arrival Process Template (Java / JavaEE Development Model)

## Overview

Template for implementing an IM-Workflow arrival process in Java. It is executed when a node is reached (when handed off to the next processor), and is mainly used to control whether the standard mail notification is sent.

Extend the abstract class `jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessEventListener` and override the `execute` method.

## Parent Class

| Item | Value |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessEventListener` |
| Type | Abstract class |
| Parameter class | `jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessParameter` |
| Method | `execute(ArriveProcessParameter parameter)` |
| Return value | `boolean` (`true`: allow standard mail sending / `false`: disallow. Default implementation is `true`) |

See [reference/parameter-reference.md](../reference/parameter-reference.md) for the full list of `ArriveProcessParameter` fields (including the previous node's processor information).

## File Structure

```
src/main/java/{basePackage path}/{feature-name}/workflow/arrive/
  └── {Feature}ArriveProcess.java
```

---

## Arrival Process Class ({Feature}ArriveProcess.java)

```java
package {basePackage}.{feature-name}.workflow.arrive;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessParameter;

/**
 * {feature-name} Workflow arrival process class.<br>
 * Executed when a node is reached. Controls whether the standard mail is sent.<br>
 * Do not start a DB transaction within this class.
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ArriveProcess extends ArriveProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ArriveProcess.class);

    /**
     * Executed when a node is reached.
     *
     * @param parameter workflow parameter
     * @return boolean whether the standard mail can be sent (true: can be sent / false: cannot be sent)
     * @throws Exception if an exception occurs
     */
    @Override
    public boolean execute(final ArriveProcessParameter parameter) throws Exception {
        LOGGER.info("Started arrive process. matterNumber=" + parameter.getMatterNumber()
            + ", nodeId=" + parameter.getNodeId());

        // TODO: Implement the arrival-time business logic here.
        //
        // Main available parameters:
        //   parameter.getNodeId()             - arrival node ID
        //   parameter.getPreNodeId()          - previous node ID
        //   parameter.getPreNodeExecUserCd()  - previous node processing executor code
        //   parameter.getPreNodeProcessComment() - previous node processing comment

        // Return true to send the standard mail, or false to suppress it (e.g. when replacing it with a custom notification)
        return true;
    }
}
```

## Notes for Generation

- Returning `false` suppresses the standard mail notification. A typical use case is implementing a custom notification process (e.g. a notification other than mail) and then returning `false`
- If an exception is thrown within `execute`, the arrival process itself is treated as a failure. If you do not want a matter process to be stopped by an exception in a notification's ancillary processing, make a design decision on whether to `try-catch` and swallow the exception internally, only logging it (unconditionally swallowing exceptions is not recommended; always record it in the log)
- Do not start a DB transaction within this class
