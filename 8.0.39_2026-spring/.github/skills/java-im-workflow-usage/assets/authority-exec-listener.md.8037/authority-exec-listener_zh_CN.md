# 工作流 处理对象者插件模板（Java / JavaEE 开发模型）

## 概述

用 Java 实现 IM-Workflow 处理对象者插件的模板。在案件处理时动态决定节点的处理对象者。

实现接口 `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener`。与 JSSP 版由 `execute` / `getDisplayName` / `getTargetUserList` 三个函数构成不同，**Java 版接口仅定义处理对象者的获取（相当于 `execute`）。**

## 需实现的接口

| 项目 | 值 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener` |
| 父接口 | `IWorkflowAuthorityEventListener`（标记接口） |
| 方法 | `List<UserDataModel> execute(WorkflowAuthorityParameter workflowParam, WorkflowMatterParameter matterParam)` |
| 异常 | `throws WorkflowException` |

`WorkflowAuthorityParameter` / `WorkflowMatterParameter` / `UserDataModel` 的字段一览请参见 [reference/parameter-reference.md](../reference/parameter-reference.md)。

## 文件结构

```
src/main/java/{basePackage 路径}/{功能名}/workflow/plugin/
  └── {Feature}AuthorityExecListener.java
```

---

## 处理对象者插件类（{Feature}AuthorityExecListener.java）

```java
package {basePackage}.{功能名}.workflow.plugin;

import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowAuthorityParameter;
import jp.co.intra_mart.foundation.workflow.listener.param.WorkflowMatterParameter;
import jp.co.intra_mart.foundation.workflow.plugin.authority.im_master.model.UserDataModel;

/**
 * {功能名} 工作流 处理对象者插件类。<br>
 * 在案件处理时动态决定节点的处理对象者。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}AuthorityExecListener implements IWorkflowAuthorityExecEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}AuthorityExecListener.class);

    /**
     * 展开处理对象者。
     *
     * @param workflowParam 工作流参数
     * @param matterParam 案件信息参数
     * @return List 处理对象者的用户展开信息
     * @throws WorkflowException 工作流异常
     */
    @Override
    public List<UserDataModel> execute(final WorkflowAuthorityParameter workflowParam,
            final WorkflowMatterParameter matterParam) throws WorkflowException {
        LOGGER.info("Resolving authority target users. nodeId=" + matterParam.getNodeId());

        final List<UserDataModel> targetUsers = new ArrayList<>();

        // TODO：请在此处实现决定处理对象者的业务逻辑。
        //
        // 当 workflowParam.getTargetCodes() 不为 null 时：
        //   表示通过撤回、退回、案件操作导致的节点移动到达本节点。
        //   会传递上次处理者的代码，将其采用为处理对象者即可实现
        //   「等待重新处理」的状态。
        //
        // final UserDataModel user = new UserDataModel();
        // user.setUserCode("aoyagi");
        // user.setUserName("青柳 辰巳");
        // user.setLocaleId("zh_CN");
        // targetUsers.add(user);

        return targetUsers;
    }
}
```

## 生成时的注意事项

- `workflowParam.getTargetCodes()` 在通过撤回、退回、案件操作导致的节点移动到达该节点时，会传递最后处理该节点的用户代码数组。若要实现「等待上次处理者重新处理」的状态，应将其采用为处理对象者（与 JSSP 版思路相同）
- `UserDataModel` 的所属组织信息（`OrgzDataModel[]`）会成为负责组织的选项。若业务无需感知组织，可省略
- 插件的显示名称（相当于 JSSP 版的 `getDisplayName`）、对象者状况确认一览（相当于 JSSP 版的 `getTargetUserList`）在 Java 版接口中是否也存在，可能因平台版本而异。**实现前请使用 dev-knowledge 确认 `IWorkflowAuthorityEventListener` 的继承关系**（不要凭记忆断定「没有该方法」）
