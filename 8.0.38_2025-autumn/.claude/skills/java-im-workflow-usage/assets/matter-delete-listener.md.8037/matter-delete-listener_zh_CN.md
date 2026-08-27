# 案件删除监听器模板（Java / JavaEE 开发模型）

## 概述

用 Java 实现在未完成案件・已完成案件・历史案件删除时执行的监听器的模板。三者实现的接口各不相同，**且仅历史案件删除的方法签名不同**（末尾追加了 `archiveMonth` 参数）。

与其他工作流处理不同，参数不是通过 `Parameter` 对象传递，而是作为**各个独立的字符串值**传递（与 JSSP 版设计相同）。

**注意**：此类的处理过程中不要开启 DB 事务。

## 实现接口一览

| 删除对象 | FQCN | 方法签名 |
|---------|------|------|
| 未完成案件删除 | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowActvMatterDeleteListener` | `execute(String, String, String, String)`（4个参数） |
| 已完成案件删除 | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowCplMatterDeleteListener` | `execute(String, String, String, String)`（4个参数） |
| **历史案件删除** | `jp.co.intra_mart.foundation.workflow.listener.IWorkflowArcMatterDeleteListener` | **`execute(String, String, String, String, String)`（5个参数。末尾追加了 `archiveMonth`）** |

**未完成案件删除・已完成案件删除的共通方法：**

```java
void execute(String loginGroupId, String localeId, String systemMatterId, String userDataId) throws WorkflowException;
```

| 参数名 | 类型 | 说明 |
|--------|------|------|
| loginGroupId | String | 登录组ID（与租户ID相同） |
| localeId | String | 区域设置ID |
| systemMatterId | String | 系统案件ID |
| userDataId | String | 用户数据ID |

**历史案件删除的方法（多一个参数）：**

```java
void execute(String loginGroupId, String localeId, String systemMatterId, String userDataId, String archiveMonth) throws WorkflowException;
```

| 参数名 | 类型 | 说明 |
|--------|------|------|
| loginGroupId | String | 登录组ID（与租户ID相同） |
| localeId | String | 区域设置ID |
| systemMatterId | String | 系统案件ID |
| userDataId | String | 用户数据ID |
| **archiveMonth** | **String** | **归档年月（`yyyyMM` 格式）。由于历史案件按年月分表保存，需要此参数来确定删除对象** |

**关于签名不一致的重要提示：** 若将历史案件删除监听器实现为与未完成/已完成案件删除监听器相同的4参数签名，即使加了 `@Override`，编译器也会将其视为添加了一个无关的重载方法，而不是覆盖，导致接口的 `execute` 未被实现，从而产生编译错误（抽象方法未实现）。不要假设三者的方法签名完全相同。

## 文件构成

```
src/main/java/{基础包路径}/{功能名}/workflow/
  └── {Feature}ActiveMatterDeleteListener.java     # 未完成案件删除（4个参数）
  └── {Feature}CompletedMatterDeleteListener.java  # 已完成案件删除（4个参数）
  └── {Feature}ArchivedMatterDeleteListener.java   # 历史案件删除（5个参数）
```

---

## 未完成案件删除监听器（{Feature}ActiveMatterDeleteListener.java）

```java
package {basePackage}.{功能名}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowActvMatterDeleteListener;

/**
 * {功能名} 工作流 未完成案件删除监听器类。<br>
 * 在未完成案件被删除时执行。<br>
 * 此类的处理过程中不要开启 DB 事务。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ActiveMatterDeleteListener implements IWorkflowActvMatterDeleteListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ActiveMatterDeleteListener.class);

    /**
     * 执行未完成案件删除处理。
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
        LOGGER.info("Started active matter delete process. systemMatterId=" + systemMatterId);

        // TODO: 在此实现未完成案件删除时的业务逻辑
        //
        // 主要用途：
        //   - 删除保存在自定义表中的申请数据
        //   - 删除附件等关联资源
    }
}
```

已完成案件删除也是相同的4参数结构，仅需替换实现接口（`IWorkflowCplMatterDeleteListener`）和类名。

## 历史案件删除监听器（{Feature}ArchivedMatterDeleteListener.java）— 5参数版

```java
package {basePackage}.{功能名}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.exception.WorkflowException;
import jp.co.intra_mart.foundation.workflow.listener.IWorkflowArcMatterDeleteListener;

/**
 * {功能名} 工作流 历史案件删除监听器类。<br>
 * 在历史案件被删除时执行。<br>
 * 此类的处理过程中不要开启 DB 事务。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ArchivedMatterDeleteListener implements IWorkflowArcMatterDeleteListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ArchivedMatterDeleteListener.class);

    /**
     * 执行历史案件删除处理。
     *
     * <p>与其他案件删除监听器（未完成/已完成）不同，历史案件按年月分为不同的归档表，
     * 因此会额外传入 {@code archiveMonth}（归档年月）参数。</p>
     *
     * @param loginGroupId 登录组ID
     * @param localeId 区域设置ID
     * @param systemMatterId 系统案件ID
     * @param userDataId 用户数据ID
     * @param archiveMonth 归档年月（yyyyMM格式）
     * @throws WorkflowException 工作流异常
     */
    @Override
    public void execute(final String loginGroupId, final String localeId, final String systemMatterId,
            final String userDataId, final String archiveMonth) throws WorkflowException {
        LOGGER.info("Started archived matter delete process. systemMatterId=" + systemMatterId
            + ", archiveMonth=" + archiveMonth);

        // TODO: 在此实现历史案件删除时的业务逻辑
        //
        // 主要用途：
        //   - 删除保存在自定义表中的申请数据（若使用按 archiveMonth 分表的表，则尤为必要）
        //   - 删除附件等关联资源
    }
}
```

## 生成时的注意事项

- 三种监听器性质相同，都是「如何清理被删除案件的数据」。若除案件属性外还有保存到自定义表的数据，也需要在删除监听器中一并删除，否则数据会一直残留
- **仅历史案件删除（`IWorkflowArcMatterDeleteListener`）有5个参数（追加了 `archiveMonth`）。** 若按与其余两种相同的4个参数实现，即使加了 `@Override`，也会因被视为重载、接口的 `execute` 未被实现而产生编译错误（抽象方法未实现）
- 注意仅声明了 `throws WorkflowException`，这与 `ActionProcessEventListener` 系列（`throws Exception`）不同
- 此类的处理过程中不要开启 DB 事务
