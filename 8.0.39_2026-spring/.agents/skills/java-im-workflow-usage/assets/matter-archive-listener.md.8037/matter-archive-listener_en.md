# Workflow Matter Archive Listener Template (Java / JavaEE Development Model)

## Overview

Template for implementing in Java the listener that is executed when a completed matter is archived to the archive matter table. As with the matter delete listener, the arguments are passed as individual string values rather than as a `Parameter` object.

**Note**: Do not start a DB transaction within this class.

## Interface to Implement

| Item | Value |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowMatterArchiveListener` |
| Method | `void execute(String loginGroupId, String localeId, String systemMatterId, String userDataId)` |
| Exception | `throws WorkflowException` |

## File Structure

```
src/main/java/{basePackage path}/{feature-name}/workflow/
  └── {Feature}MatterArchiveListener.java
```

---

## Matter Archive Listener ({Feature}MatterArchiveListener.java)

```java
package {basePackage}.{feature-name}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowMatterArchiveListener;

/**
 * {feature-name} Workflow matter archive listener class.<br>
 * Executed when a completed matter is archived to the archive matter table.<br>
 * Do not start a DB transaction within this class.
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}MatterArchiveListener implements IWorkflowMatterArchiveListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}MatterArchiveListener.class);

    /**
     * Executes the matter archive process.
     *
     * @param loginGroupId login group ID
     * @param localeId locale ID
     * @param systemMatterId system matter ID
     * @param userDataId user data ID
     * @throws WorkflowException workflow exception
     */
    @Override
    public void execute(final String loginGroupId, final String localeId, final String systemMatterId,
            final String userDataId) throws WorkflowException {
        LOGGER.info("Started matter archive process. systemMatterId=" + systemMatterId);

        // TODO: Implement the business logic for matter archiving here.
        //
        // Main use cases:
        //   - Migrating data in a custom table to a table for archived matters
        //   - Notifying an external system of the archive
        //   - Archiving related resources such as attachments
    }
}
```

## Notes for Generation

- Do not start a DB transaction within this class
- This differs in purpose from the matter delete listener (`matter-delete-listener.md`). The delete listener "erases" data, while the archive listener "moves" data
