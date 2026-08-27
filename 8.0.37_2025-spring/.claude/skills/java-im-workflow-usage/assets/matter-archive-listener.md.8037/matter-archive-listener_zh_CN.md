# 工作流 案件归档处理监听器模板（Java / JavaEE 开发模型）

## 概述

用 Java 实现在已完成案件归档（移动）到历史案件表时执行的监听器的模板。与案件删除监听器相同，参数不是以 `Parameter` 对象传递，而是以各个字符串值传递。

**注意**：请勿在本类的处理中开启 DB 事务。

## 需实现的接口

| 项目 | 值 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowMatterArchiveListener` |
| 方法 | `void execute(String loginGroupId, String localeId, String systemMatterId, String userDataId)` |
| 异常 | `throws WorkflowException` |

## 文件结构

```
src/main/java/{basePackage 路径}/{功能名}/workflow/
  └── {Feature}MatterArchiveListener.java
```

---

## 案件归档处理监听器（{Feature}MatterArchiveListener.java）

```java
package {basePackage}.{功能名}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowMatterArchiveListener;

/**
 * {功能名} 工作流 案件归档处理监听器类。<br>
 * 在已完成案件归档（移动）到历史案件表时执行。<br>
 * 请勿在本类的处理中开启 DB 事务。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}MatterArchiveListener implements IWorkflowMatterArchiveListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}MatterArchiveListener.class);

    /**
     * 执行案件归档处理。
     *
     * @param loginGroupId 登录组ID
     * @param localeId 区域设置ID
     * @param systemMatterId 系统案件ID
     * @param userDataId 用户数据ID
     * @throws WorkflowException 工作流异常
     */
    @Override
    public void execute(final String loginGroupId, final String localeId, final String systemMatterId,
            final String userDataId) throws WorkflowException {
        LOGGER.info("Started matter archive process. systemMatterId=" + systemMatterId);

        // TODO：请在此处实现案件归档时的业务逻辑。
        //
        // 主要用途：
        //   - 将自定义表中的数据迁移到历史案件用表
        //   - 向外部系统发送归档通知
        //   - 归档附件等相关资源
    }
}
```

## 生成时的注意事项

- 请勿在本类的处理中开启 DB 事务
- 与案件删除监听器（`matter-delete-listener.md`）目的不同。删除监听器是「删除数据」的处理，归档监听器是「迁移数据」的处理
