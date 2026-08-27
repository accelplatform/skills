# Workflow Processing Target User Plugin Template (Java / JavaEE Development Model)

## Overview

Template for implementing an IM-Workflow processing target user plugin in Java. It dynamically determines the processing target users of a node when a matter is processed.

Implement the interface `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener`. Unlike the JSSP version's three-function structure (`execute` / `getDisplayName` / `getTargetUserList`), **the Java interface only defines the retrieval of processing target users (equivalent to `execute`).**

## Interface to Implement

| Item | Value |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener` |
| Parent | `IWorkflowAuthorityEventListener` (marker interface) |
| Method | `List<UserDataModel> execute(WorkflowAuthorityParameter workflowParam, WorkflowMatterParameter matterParam)` |
| Exception | `throws WorkflowException` |

See [reference/parameter-reference.md](../reference/parameter-reference.md) for the field lists of `WorkflowAuthorityParameter` / `WorkflowMatterParameter` / `UserDataModel`.

## File Structure

```
src/main/java/{basePackage path}/{feature-name}/workflow/plugin/
  └── {Feature}AuthorityExecListener.java
```

---

## Processing Target User Plugin Class ({Feature}AuthorityExecListener.java)

```java
package {basePackage}.{feature-name}.workflow.plugin;

import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowAuthorityParameter;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowMatterParameter;
import jp.co.intra_mart.foundation.workflow.plugin.authority.im_master.model.UserDataModel;

/**
 * {feature-name} Workflow processing target user plugin class.<br>
 * Dynamically determines the processing target users of a node when a matter is processed.
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}AuthorityExecListener implements IWorkflowAuthorityExecEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}AuthorityExecListener.class);

    /**
     * Resolves the processing target users.
     *
     * @param workflowParam workflow parameter
     * @param matterParam matter information parameter
     * @return List user expansion information for the processing target users
     * @throws WorkflowException workflow exception
     */
    @Override
    public List<UserDataModel> execute(final WorkflowAuthorityParameter workflowParam,
            final WorkflowMatterParameter matterParam) throws WorkflowException {
        LOGGER.info("Resolving authority target users. nodeId=" + matterParam.getNodeId());

        final List<UserDataModel> targetUsers = new ArrayList<>();

        // TODO: Implement the business logic to determine the processing target users here.
        //
        // If workflowParam.getTargetCodes() is not null:
        //   The node was reached via a pull-back, send-back, or matter operation that moved the node.
        //   The previous processor's code(s) are passed, so adopting them as the processing target users
        //   achieves a "waiting for reprocessing" state.
        //
        // final UserDataModel user = new UserDataModel();
        // user.setUserCode("aoyagi");
        // user.setUserName("Tatsumi Aoyagi");
        // user.setLocaleId("en");
        // targetUsers.add(user);

        return targetUsers;
    }
}
```

## Notes for Generation

- `workflowParam.getTargetCodes()` receives an array of the user code(s) that last processed the node when the node was reached via a pull-back, send-back, or matter operation that moved the node. To achieve a "waiting for reprocessing by the previous processor" state, adopt these as the processing target users (same idea as the JSSP version)
- `UserDataModel`'s affiliated organization information (`OrgzDataModel[]`) becomes the candidate choices for the responsible organization. It can be omitted for business processes that do not need to be organization-aware
- Whether a display name for the plugin (equivalent to the JSSP version's `getDisplayName`) and a target user status confirmation list (equivalent to the JSSP version's `getTargetUserList`) also exist on the Java interface may differ depending on the platform version. **Verify the inheritance hierarchy of `IWorkflowAuthorityEventListener` using dev-knowledge before implementing** (do not assert from memory that "the method doesn't exist")
