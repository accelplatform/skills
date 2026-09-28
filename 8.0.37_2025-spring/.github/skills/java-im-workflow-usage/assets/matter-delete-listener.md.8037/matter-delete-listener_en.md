# Matter Delete Listener Template (Java / JavaEE Development Model)

## Overview

A template for implementing listeners in Java that run when an active, completed, or archived matter is deleted. All three implement a different interface, and **only the archived matter delete listener has a different method signature** (an extra `archiveMonth` argument is added).

Unlike other workflow processes, the arguments are passed as individual `String` values rather than a `Parameter` object (the same design as the JSSP version).

**Note**: Do not open a DB transaction while this class is processing.

## Implementation Interfaces

| Deletion Target | FQCN | Method Signature |
|---------|------|------|
| Active matter delete | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowActvMatterDeleteListener` | `execute(String, String, String, String)` (4 arguments) |
| Completed matter delete | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowCplMatterDeleteListener` | `execute(String, String, String, String)` (4 arguments) |
| **Archived matter delete** | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowArcMatterDeleteListener` | **`execute(String, String, String, String, String)` (5 arguments — `archiveMonth` is appended at the end)** |

**Common method for active and completed matter delete:**

```java
void execute(String loginGroupId, String localeId, String systemMatterId, String userDataId) throws WorkflowException;
```

| Argument | Type | Description |
|--------|------|------|
| loginGroupId | String | Login group ID (same value as the tenant ID) |
| localeId | String | Locale ID |
| systemMatterId | String | System matter ID |
| userDataId | String | User data ID |

**Method for archived matter delete (one extra argument):**

```java
void execute(String loginGroupId, String localeId, String systemMatterId, String userDataId, String archiveMonth) throws WorkflowException;
```

| Argument | Type | Description |
|--------|------|------|
| loginGroupId | String | Login group ID (same value as the tenant ID) |
| localeId | String | Locale ID |
| systemMatterId | String | System matter ID |
| userDataId | String | User data ID |
| **archiveMonth** | **String** | **Archive month (`yyyyMM` format). Passed to identify the target for deletion, since archived matters are split across tables by month (e.g. `imw_ayyyymm_matter_user_data`)** |

**Important note on signature mismatch:** If you implement the archived matter delete listener with the same 4-argument signature as the active/completed listeners, the compiler treats it as adding an unrelated overload rather than an override — even with `@Override` present — and `execute` ends up unimplemented, causing a compile error (unimplemented abstract method). Do not assume all three share an identical signature.

## File Layout

```
src/main/java/{base package path}/{feature name}/workflow/
  └── {Feature}ActiveMatterDeleteListener.java     # Active matter delete (4 arguments)
  └── {Feature}CompletedMatterDeleteListener.java  # Completed matter delete (4 arguments)
  └── {Feature}ArchivedMatterDeleteListener.java   # Archived matter delete (5 arguments)
```

---

## Active Matter Delete Listener ({Feature}ActiveMatterDeleteListener.java)

```java
package {basePackage}.{feature name}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowActvMatterDeleteListener;

/**
 * {Feature name} workflow active matter delete listener class.<br>
 * Executed when an active matter is deleted.<br>
 * Do not open a DB transaction while this class is processing.
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ActiveMatterDeleteListener implements IWorkflowActvMatterDeleteListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ActiveMatterDeleteListener.class);

    /**
     * Executes the active matter delete process.
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
        LOGGER.info("Started active matter delete process. systemMatterId=" + systemMatterId);

        // TODO: Implement your business logic for active matter deletion here
        //
        // Common use cases:
        //   - Deleting application data held in a custom table
        //   - Deleting related resources such as attached files
    }
}
```

The completed matter delete listener has the same 4-argument structure; only swap the implemented interface (`IWorkflowCplMatterDeleteListener`) and the class name.

## Archived Matter Delete Listener ({Feature}ArchivedMatterDeleteListener.java) — 5-Argument Version

```java
package {basePackage}.{feature name}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowArcMatterDeleteListener;

/**
 * {Feature name} workflow archived matter delete listener class.<br>
 * Executed when an archived matter is deleted.<br>
 * Do not open a DB transaction while this class is processing.
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ArchivedMatterDeleteListener implements IWorkflowArcMatterDeleteListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ArchivedMatterDeleteListener.class);

    /**
     * Executes the archived matter delete process.
     *
     * <p>Unlike the other matter delete listeners (active/completed), archived matters
     * are split into separate archive tables by month, so {@code archiveMonth}
     * (the archive month) is passed as an additional argument.</p>
     *
     * @param loginGroupId login group ID
     * @param localeId locale ID
     * @param systemMatterId system matter ID
     * @param userDataId user data ID
     * @param archiveMonth archive month (yyyyMM format)
     * @throws WorkflowException workflow exception
     */
    @Override
    public void execute(final String loginGroupId, final String localeId, final String systemMatterId,
            final String userDataId, final String archiveMonth) throws WorkflowException {
        LOGGER.info("Started archived matter delete process. systemMatterId=" + systemMatterId
            + ", archiveMonth=" + archiveMonth);

        // TODO: Implement your business logic for archived matter deletion here
        //
        // Common use cases:
        //   - Deleting application data held in a custom table (especially essential if you use tables split by archiveMonth)
        //   - Deleting related resources such as attached files
    }
}
```

## Notes for Generation

- All three listeners have the same nature — "how to clean up data for a matter being deleted." If you have data saved to a custom table besides matter properties, delete it in the delete listener too, or it will remain indefinitely
- **Only the archived matter delete listener (`IWorkflowArcMatterDeleteListener`) has 5 arguments (`archiveMonth` added).** Implementing it with the same 4 arguments as the other two results in an "unimplemented abstract method" compile error even with `@Override` present (it is treated as an overload, leaving the interface's `execute` unimplemented)
- Note that only `throws WorkflowException` is declared — this differs from the `ActionProcessEventListener` family (which uses `throws Exception`)
- Do not open a DB transaction while this class is processing
