# 工作流 到达处理模板（Java / JavaEE 开发模型）

## 概述

用 Java 实现 IM-Workflow 到达处理的模板。在到达节点时（交接给下一处理者时）执行，主要用于控制是否发送标准邮件通知。

继承抽象类 `jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessEventListener`，并覆盖 `execute` 方法。

## 父类

| 项目 | 值 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessEventListener` |
| 类型 | 抽象类 |
| 参数类 | `jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessParameter` |
| 方法 | `execute(ArriveProcessParameter parameter)` |
| 返回值 | `boolean`（`true`：可发送标准邮件 / `false`：不可发送。默认实现为 `true`） |

`ArriveProcessParameter` 的字段一览（包含前一节点处理者信息等）请参见 [reference/parameter-reference.md](../reference/parameter-reference.md)。

## 文件结构

```
src/main/java/{basePackage 路径}/{功能名}/workflow/arrive/
  └── {Feature}ArriveProcess.java
```

---

## 到达处理类（{Feature}ArriveProcess.java）

```java
package {basePackage}.{功能名}.workflow.arrive;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.arrive.ArriveProcessParameter;

/**
 * {功能名} 工作流 到达处理类。<br>
 * 在到达节点时执行。控制是否发送标准邮件。<br>
 * 请勿在本类的处理中开启 DB 事务。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}ArriveProcess extends ArriveProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}ArriveProcess.class);

    /**
     * 到达节点时调用。
     *
     * @param parameter 工作流参数
     * @return boolean 是否可发送标准邮件（true：可发送 / false：不可发送）
     * @throws Exception 发生异常时
     */
    @Override
    public boolean execute(final ArriveProcessParameter parameter) throws Exception {
        LOGGER.info("Started arrive process. matterNumber=" + parameter.getMatterNumber()
            + ", nodeId=" + parameter.getNodeId());

        // TODO：请在此处实现到达时的业务逻辑。
        //
        // 可用的主要参数：
        //   parameter.getNodeId()             - 到达节点ID
        //   parameter.getPreNodeId()          - 前一节点ID
        //   parameter.getPreNodeExecUserCd()  - 前一节点处理执行者代码
        //   parameter.getPreNodeProcessComment() - 前一节点处理注释

        // 发送标准邮件时返回 true；替换为自定义通知等需要抑制发送时返回 false
        return true;
    }
}
```

## 生成时的注意事项

- 返回值 `false` 会抑制标准邮件通知。典型用例是在实现自定义通知处理（邮件以外的通知等）后返回 `false`
- 若在 `execute` 内抛出异常，到达处理本身会被视为失败。若不希望通知的附带处理发生异常而导致案件处理停止，应设计判断是否在内部进行 `try-catch` 并吞掉异常，仅记录日志（不建议无条件吞掉异常，务必记录到日志中）
- 请勿在本类的处理中开启 DB 事务
