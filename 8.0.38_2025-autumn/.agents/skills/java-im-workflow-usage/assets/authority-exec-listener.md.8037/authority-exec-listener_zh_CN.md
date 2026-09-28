# 工作流 处理对象者插件模板（Java / JavaEE 开发模型）

## 概述

用 Java 实现 IM-Workflow 处理对象者插件的模板。在案件处理时动态决定节点的处理对象者。

实现接口 `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener`。该接口具有 `IWorkflowAuthorityEventListener`（定义 `getTargetUserList`）→ `IWorkflowEventListener`（定义 `getDisplayName`）的继承层次，**共需要实现 3 个方法**（`execute` / `getTargetUserList` / `getDisplayName`），实质上与 JSSP 版的三函数结构（`execute` / `getDisplayName` / `getTargetUserList`）对应。

## 需实现的接口

| 项目 | 值 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowAuthorityExecEventListener` |
| 继承来源 | `IWorkflowAuthorityEventListener` → `IWorkflowEventListener` |

| 方法（定义来源） | 签名 | 用途 |
|---|---|---|
| `execute`（`IWorkflowAuthorityExecEventListener`） | `List<UserDataModel> execute(WorkflowAuthorityParameter workflowParam, WorkflowMatterParameter matterParam) throws WorkflowException` | 案件处理时展开处理对象者（相当于 JSSP 版的 `execute`） |
| `getTargetUserList`（`IWorkflowAuthorityEventListener`） | `Map<String, TargetUserModel[]> getTargetUserList(WorkflowAuthorityParameter workflowParam, WorkflowMatterParameter matterParam, WorkflowSortCondition[] sort) throws WorkflowException` | 为对象者状况确认画面返回按语言区域分类的处理对象用户一览（相当于 JSSP 版的 `getTargetUserList`） |
| `getDisplayName`（`IWorkflowEventListener`） | `Map<String, String> getDisplayName(WorkflowParameter workflowParam) throws WorkflowException` | 按语言区域返回插件的显示名称（相当于 JSSP 版的 `getDisplayName`） |

`WorkflowAuthorityParameter` / `WorkflowMatterParameter` / `UserDataModel` / `TargetUserModel` 的字段一览请参见 [reference/parameter-reference.md](../reference/parameter-reference.md)。

## 注册方法（重要）

处理对象者插件与其他工作流集成程序（动作处理、到达处理等）不同，不是将 FQCN 直接写入工作流定义导入 XML 的方式。需要通过 `plugin.xml`（由 `PluginManager` 管理的插件注册文件）进行注册。放置位置、XML 结构、是否需要 `configPage`（设置画面）请参见 `.agents/skills/base-im-workflow-generator/reference/java-class-registration.md` 中的"处理对象者插件（自定义实现）的注册"。**仅实现该类本身并不会生效。**

## 文件结构

```
src/main/java/{basePackage 的路径}/{功能名}/workflow/plugin/
  └── {Feature}AuthorityExecListener.java
```

---

## 处理对象者插件类（{Feature}AuthorityExecListener.java）

```java
package {basePackage}.{功能名}.workflow.plugin;

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

        // TODO: 请在此处实现决定处理对象者的业务逻辑
        //
        // 当 workflowParam.getTargetCodes() 不为 null 时：
        //   表示通过撤回、退回、案件操作导致的节点移动到达该节点。
        //   会传入上次处理者的用户代码，若需要实现"等待上次处理者重新处理"的状态，
        //   可采用该值作为处理对象者。
        //
        // final UserDataModel user = new UserDataModel();
        // user.setUserCode("aoyagi");
        // user.setUserName("青柳 辰巳");
        // user.setLocaleId("zh_CN");
        // targetUsers.add(user);

        return targetUsers;
    }

    /**
     * 按语言区域获取处理对象用户列表（用于对象者状况确认画面）。
     *
     * @param workflowParam 工作流参数
     * @param matterParam 案件信息参数
     * @param sort 排序条件模型
     * @return Map 以语言区域ID为键的处理对象用户列表
     * @throws WorkflowException 工作流异常
     */
    @Override
    public Map<String, TargetUserModel[]> getTargetUserList(final WorkflowAuthorityParameter workflowParam,
            final WorkflowMatterParameter matterParam, final WorkflowSortCondition[] sort) throws WorkflowException {
        // TODO: 请以 TargetUserModel（按语言区域）返回与 execute 相同的处理对象者决定逻辑
        return new HashMap<>();
    }

    /**
     * 按语言区域获取插件的显示名称。
     *
     * @param workflowParam 工作流参数
     * @return Map 以语言区域ID为键的显示名称
     * @throws WorkflowException 工作流异常
     */
    @Override
    public Map<String, String> getDisplayName(final WorkflowParameter workflowParam) throws WorkflowException {
        final Map<String, String> result = new HashMap<>();
        result.put("ja", "{功能名的显示名（ja）}");
        result.put("en", "{Feature Display Name}");
        result.put("zh_CN", "{功能名的显示名}");
        return result;
    }
}
```

## 生成时的注意事项

- `workflowParam.getTargetCodes()` 在通过撤回、退回、案件操作导致的节点移动到达该节点时，会传入最后处理该节点的用户代码数组。若需要实现"等待上次处理者重新处理"的状态，可采用该值作为处理对象者（与 JSSP 版思路相同）
- `UserDataModel` 的所属组织信息（`OrgzDataModel[]`）会成为负责组织的候选项。若业务无需感知组织，可省略
- `getTargetUserList` 应与 `execute` 保持相同的处理对象者决定逻辑（避免对象者状况确认画面显示的列表与实际处理对象者不一致）
- `getDisplayName` 的返回值与在 `plugin.xml` 的 `<authority name="...">` 中指定资源 key 的多语言消息属性是两套独立机制，两者都可以返回显示名称。**无需两者都准备，通常使用 `plugin.xml` 的 `name` 属性（以 `%` 开头的资源 key）**。`getDisplayName` 会在平台需要时被调用（如对象者状况确认画面等）
