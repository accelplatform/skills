# 工作流 案件结束处理模板（Java / JavaEE 开发模型）

## 概述

用 Java 实现 IM-Workflow 案件结束处理（案件结束扩展处理）的模板。在案件完成时执行，主要用于控制是否发送标准邮件通知。

继承抽象类 `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessEventListener`，并覆盖 `execute` 方法。

**虽然存在有事务/无事务两个扩展点，但实现的类相同**（继承 `MatterEndProcessEventListener`）。注册到哪个扩展点由导入用 XML 一侧（`base-im-workflow-generator`）切换。

## 父类

| 项目 | 值 |
|------|-----|
| FQCN | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessEventListener` |
| 类型 | 抽象类 |
| 参数类 | `jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessParameter` |
| 方法 | `execute(MatterEndProcessParameter parameter)` |
| 返回值 | `boolean`（`true`：可发送标准邮件 / `false`：不可发送。默认实现为 `true`） |

`MatterEndProcessParameter` 的字段一览（包含最终处理者信息、邮件/IMBox 替换信息）请参见 [reference/parameter-reference.md](../reference/parameter-reference.md)。

## 文件结构

```
src/main/java/{basePackage 路径}/{功能名}/workflow/
  └── {Feature}MatterEndProcess.java
```

---

## 案件结束处理类（{Feature}MatterEndProcess.java）

```java
package {basePackage}.{功能名}.workflow;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessEventListener;
import jp.co.intra_mart.foundation.workflow.plugin.process.matter_end.MatterEndProcessParameter;

/**
 * {功能名} 工作流 案件结束处理类。<br>
 * 在案件完成时执行。控制是否发送标准邮件。<br>
 * 请勿在本类的处理中开启 DB 事务。
 *
 * @author {author}
 * @version {version}
 * @since {initial_version}
 */
public class {Feature}MatterEndProcess extends MatterEndProcessEventListener {

    private static final Logger LOGGER = Logger.getLogger({Feature}MatterEndProcess.class);

    /**
     * 作为案件结束处理执行。
     *
     * @param parameter 工作流参数
     * @return boolean 是否可发送标准邮件（true：可发送 / false：不可发送）
     * @throws Exception 发生异常时
     */
    @Override
    public boolean execute(final MatterEndProcessParameter parameter) throws Exception {
        LOGGER.info("Started matter end process. lastProcessNodeId=" + parameter.getLastProcessNodeId());

        // TODO：请在此处实现案件结束时的业务逻辑。
        //
        // 可用的主要参数：
        //   parameter.getLastAuthUserCd()  - 最终处理权限者代码
        //   parameter.getLastExecUserCd()  - 最终处理执行者代码
        //   parameter.getLastResultStatus() - 最终处理结果状态

        return true;
    }
}
```

## 生成时的注意事项

- 实现类不区分注册到有事务/无事务哪个扩展点。注册目标的选择是导入用 XML 一侧的职责
- 请勿在本类的处理中开启 DB 事务（即使是有事务的扩展点，也由引擎侧控制事务，不要自行 `begin/commit`）
