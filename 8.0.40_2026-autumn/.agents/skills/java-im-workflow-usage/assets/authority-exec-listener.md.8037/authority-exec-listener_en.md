# Workflow Processing Target User Plugin Template (Java / JavaEE Development Model)

## Overview

Template for implementing an IM-Workflow processing target user plugin in Java. It dynamically determines the processing target users of a node when a matter is processed.

Implement the interface `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener`. This interface has an inheritance chain of `IWorkflowAuthorityEventListener` (defines `getTargetUserList`) → `IWorkflowEventListener` (defines `getDisplayName`), so **three methods in total must be implemented** (`execute` / `getTargetUserList` / `getDisplayName`). This effectively corresponds to the JSSP version's three-function structure (`execute` / `getDisplayName` / `getTargetUserList`).

## Interface to Implement

| Item | Value |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener` |
| Parent | `IWorkflowAuthorityEventListener` → `IWorkflowEventListener` |

| Method (declared on) | Signature | Purpose |
|---|---|---|
| `execute` (`IWorkflowAuthorityExecEventListener`) | `List<UserDataModel> execute(WorkflowAuthorityParameter workflowParam, WorkflowMatterParameter matterParam) throws WorkflowException` | Resolves the processing target users when a matter is processed (equivalent to the JSSP version's `execute`) |
| `getTargetUserList` (`IWorkflowAuthorityEventListener`) | `Map<String, TargetUserModel[]> getTargetUserList(WorkflowAuthorityParameter workflowParam, WorkflowMatterParameter matterParam, WorkflowSortCondition[] sort) throws WorkflowException` | Returns the per-locale list of processing target users for the target user status confirmation screen (equivalent to the JSSP version's `getTargetUserList`) |
| `getDisplayName` (`IWorkflowEventListener`) | `Map<String, String> getDisplayName(WorkflowParameter workflowParam) throws WorkflowException` | Returns the plugin's display name per locale (equivalent to the JSSP version's `getDisplayName`) |

See [reference/parameter-reference.md](../reference/parameter-reference.md) for the field lists of `WorkflowAuthorityParameter` / `WorkflowMatterParameter` / `UserDataModel` / `TargetUserModel`.

## Registration (Important)

Unlike other workflow integration programs (action process, arrival process, etc.), a processing target user plugin is not registered by writing the FQCN directly into the workflow definition import XML. It must be registered via `plugin.xml` (a plugin registration file managed by `PluginManager`). See "Registering a Processing Target User Plugin (Custom Implementation)" in `.agents/skills/base-im-workflow-generator/reference/java-class-registration.md` for the placement location, XML structure, and whether a `configPage` (settings screen) is required. **Implementing this class alone does not make it work.**

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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener;
import jp.co.intra_mart.foundation.workflow.listener.model.TargetUserModel;
import jp.co.intra_mart.foundation.workflow.listener.model.WorkflowSortCondition;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowAuthorityParameter;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowMatterParameter;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowParameter;
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

    /**
     * Returns the per-locale list of processing target users (for the target user status confirmation screen).
     *
     * @param workflowParam workflow parameter
     * @param matterParam matter information parameter
     * @param sort sort condition model
     * @return Map processing target user list keyed by locale ID
     * @throws WorkflowException workflow exception
     */
    @Override
    public Map<String, TargetUserModel[]> getTargetUserList(final WorkflowAuthorityParameter workflowParam,
            final WorkflowMatterParameter matterParam, final WorkflowSortCondition[] sort) throws WorkflowException {
        // TODO: Return the same target-user determination logic as execute, using TargetUserModel (per locale).
        return new HashMap<>();
    }

    /**
     * Returns the plugin's display name per locale.
     *
     * @param workflowParam workflow parameter
     * @return Map display name keyed by locale ID
     * @throws WorkflowException workflow exception
     */
    @Override
    public Map<String, String> getDisplayName(final WorkflowParameter workflowParam) throws WorkflowException {
        final Map<String, String> result = new HashMap<>();
        result.put("ja", "{Feature Display Name (ja)}");
        result.put("en", "{Feature Display Name}");
        result.put("zh_CN", "{Feature Display Name (zh_CN)}");
        return result;
    }
}
```

## Notes for Generation

- `workflowParam.getTargetCodes()` receives an array of the user code(s) that last processed the node when the node was reached via a pull-back, send-back, or matter operation that moved the node. To achieve a "waiting for reprocessing by the previous processor" state, adopt these as the processing target users (same idea as the JSSP version)
- `UserDataModel`'s affiliated organization information (`OrgzDataModel[]`) becomes the candidate choices for the responsible organization. It can be omitted for business processes that do not need to be organization-aware
- Keep `getTargetUserList`'s target-user determination logic consistent with `execute` (so the list shown on the target user status confirmation screen does not diverge from the actual processing target users)
- The `getDisplayName` return value is a separate mechanism from the localization message property referenced by a resource key on `plugin.xml`'s `<authority name="...">` — both can return a display name. **There is no need to prepare both; the `plugin.xml` `name` attribute (a resource key starting with `%`) is the common approach.** `getDisplayName` is invoked wherever the platform needs it (e.g. the target user status confirmation screen)
