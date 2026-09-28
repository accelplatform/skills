# Workflow Action Process Template (Java / JavaEE Development Model)

## Overview

Template for implementing an IM-Workflow action process in Java.
It has no UI and is executed at each workflow processing timing (application, approval, denial, send-back, etc.).

Extend the abstract class `jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessEventListener` and `@Override` only the methods for the processing timings you want to implement. **Since the parent class provides an empty implementation (`return null;`, etc.) for every method, you do not need to override methods you don't use.**

**Note**: Do not start a DB transaction within this class.

## Parent Class

| Item | Value |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessEventListener` |
| Type | Abstract class (`public abstract class`) |
| Parameter class | `jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessParameter` |
| User parameter | `java.util.Map<String, Object>` (name/value of the screen's hidden fields. **All values are `String`**) |

## File Structure

```
src/main/java/{basePackage path}/{feature-name}/workflow/action/
  └── {Feature}ActionProcess.java
```

---

## List of Overridable Methods

| Method Name | Processing Timing | Return Value | Returns data (matter number) |
|-----------|--------------|--------|----------------------|
| `apply` | Application | `String` | Yes (returning non-`null` overwrites the matter number) |
| `reapply` | Re-application | `String` | Yes |
| `applyFromTempSave` | Application (temporarily-saved matter) | `String` | Yes |
| `applyFromUnapply` | Application (un-applied matter) | `String` | Yes |
| `discontinue` | Discontinue | `void` | No |
| `pullBack` | Pull back | `void` | No |
| `sendBackToPullBack` | Pull back after send-back | `void` | No |
| `approve` | Approve | `void` | No |
| `approveEnd` | Approval end | `void` | No |
| `deny` | Deny | `void` | No |
| `sendBack` | Send back | `void` | No |
| `reserve` | Hold | `void` | No |
| `reserveCancel` | Release hold | `void` | No |
| `matterHandle` | Matter operation | `void` | No |
| `tempSaveCreate` | Temporary save (new registration) | `void` | No |
| `tempSaveUpdate` | Temporary save (update) | `void` | No |
| `tempSaveDelete` | Temporary save (delete) | `void` | No |

Common signature for all methods:

```java
public {return type} {method name}(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception
```

See [reference/parameter-reference.md](../reference/parameter-reference.md) for the full list of `ActionProcessParameter` fields.

---

## Action Process Class ({Feature}ActionProcess.java)

```java
package {basePackage}.{feature-name}.workflow.action;

import java.util.Map;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.action.ActionProcessParameter;

/**
 * {feature-name} Workflow action process class.<br>
 * Executed at each workflow processing timing (application, approval, denial, send-back, etc.).<br>
 * Do not start a DB transaction within this class.
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ActionProcess extends ActionProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ActionProcess.class);

    /**
     * Executed when the application process is performed.
     *
     * @param parameter workflow parameter
     * @param userParameter user parameter
     * @return String matter number (size: 20 bytes)
     * @throws Exception if an exception occurs
     */
    @Override
    public String apply(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        LOGGER.info("Started apply process. systemMatterId=" + parameter.getSystemMatterId());
        final String matterNumber = createMatterNumber();
        processBusinessLogic("apply", parameter, userParameter);
        LOGGER.info("Completed apply process. systemMatterId=" + parameter.getSystemMatterId());
        return matterNumber;
    }

    /**
     * Executed when the approval process is performed.
     *
     * @param parameter workflow parameter
     * @param userParameter user parameter
     * @throws Exception if an exception occurs
     */
    @Override
    public void approve(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        processBusinessLogic("approve", parameter, userParameter);
    }

    /**
     * Executed when the denial process is performed.
     *
     * @param parameter workflow parameter
     * @param userParameter user parameter
     * @throws Exception if an exception occurs
     */
    @Override
    public void deny(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        processBusinessLogic("deny", parameter, userParameter);
    }

    /**
     * Executed when the send-back process is performed.
     *
     * @param parameter workflow parameter
     * @param userParameter user parameter
     * @throws Exception if an exception occurs
     */
    @Override
    public void sendBack(final ActionProcessParameter parameter, final Map<String, Object> userParameter) throws Exception {
        processBusinessLogic("sendBack", parameter, userParameter);
    }

    /**
     * Issues a matter number.
     *
     * @return String the issued matter number
     * @throws Exception if the numbering fails
     */
    private String createMatterNumber() throws Exception {
        // TODO: Implement the numbering method according to the project's policy.
        // Check, according to the platform version, whether a standard API equivalent
        // to the JSSP version's WorkflowNumberingManager exists in the JavaEE development model.
        throw new UnsupportedOperationException("Matter number numbering logic is not implemented.");
    }

    /**
     * Executes the main business logic.
     * Called from each action method.
     *
     * @param actionType action type
     * @param parameter workflow parameter
     * @param userParameter user parameter
     * @throws Exception if an exception occurs
     */
    private void processBusinessLogic(final String actionType, final ActionProcessParameter parameter,
            final Map<String, Object> userParameter) throws Exception {
        // TODO: Implement the business logic according to actionType here.
        //
        // Main available parameters:
        //   parameter.getSystemMatterId()  - system matter ID
        //   parameter.getUserDataId()      - user data ID
        //   parameter.getAuthUserCd()      - processing authority user code
        //   parameter.getExecUserCd()      - processing executor user code
        //   parameter.getProcessComment()  - processing comment
        //
        // All values in userParameter are of type String. Convert them if you need to treat them as numbers.
    }
}
```

---

## About Saving to Matter Properties / Custom Tables

As with the JSSP version, application data is persisted by saving to matter properties (equivalent to `UserActvMatterPropertyValue`) or a project-specific custom table. Since there is no Java API reference (equivalent to the `d.ts` used for JSSP) for the matter property manipulation API in the JavaEE development model that corresponds to every platform version, **verify that the relevant API class exists using dev-knowledge (source code search) before implementing.** Do not call an API that may not exist from memory or guesswork.

If you choose to save to a custom table, use `parameter.getSystemMatterId()` or `parameter.getUserDataId()` as the foreign key.

## Notes for Generation

### Always add `@Override`

A mistaken signature (wrong argument type, count, or return type) does not cause a compile error — it merely adds an overloaded method — and results in a bug where the workflow engine never calls it. Adding `@Override` lets the compiler verify that the signature matches the parent class.

### All userParameter values are of type String

The values of `userParameter` (user data passed from the screen form) are **all of type `String`** (declared as `Map<String, Object>`, but the actual values are `String`). Convert them using `Integer.parseInt(...)`, `new BigDecimal(...)`, etc. before treating them as numbers.

### Matter number numbering is required (apply-family methods)

For `apply` / `applyFromTempSave` / `applyFromUnapply`, returning a non-`null` `String` updates the matter number. If the specification does not specify a numbering method, check the project's numbering scheme (a platform API or a custom sequence) before implementing. **Verify with dev-knowledge whether the Java API equivalent to the JSSP version's `WorkflowNumberingManager.getNumber()` is the same.**

### Data persistence in apply / applyFromUnapply

When inserting user data (a business table) within `apply`, note that data may already exist in the case of re-application after pull-back (`applyFromUnapply`). If you implement this by delegating to `apply`, use an UPSERT (an existence check followed by INSERT/UPDATE). Same idea as the "Data Persistence in apply / applyFromUnapply" section of the JSSP version's `simple-action-process.md`.

### Throw exceptions with a specific message

```java
// NG: no message
throw new Exception();

// OK: include the information needed for troubleshooting (in Japanese, per .claude/rules/java-javadoc.md)
throw new IllegalStateException(
    "Failed to issue the matter number. systemMatterId=" + parameter.getSystemMatterId());
```
